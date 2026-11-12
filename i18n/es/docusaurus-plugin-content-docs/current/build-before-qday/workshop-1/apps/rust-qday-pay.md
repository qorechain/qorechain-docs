---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: Aplicación en Rust, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# Aplicación en Rust: qday-pay

**qday-pay** es una pequeña herramienta de línea de comandos en Rust que paga en QOR en la testnet de QoreChain (`qorechain-diana`, ID de cadena EVM 9800) con una **firma híbrida**: una firma clásica secp256k1 y una firma poscuántica ML-DSA-87 (FIPS 204) en la misma transacción. Tras enviar, vuelve a leer la transacción desde la cadena y muestra si la cadena verificó ambas mitades.

## Qué demuestra {#what-it-shows}

- **Firma híbrida ML-DSA-87 + secp256k1** desde Rust, con el crate publicado y sin herramientas adicionales.
- **Una transacción con firma híbrida verificada en la cadena**: la cadena emite un evento `pqc_hybrid_verify` con `status=verified`, y el cuerpo de la transacción lleva una firma ML-DSA-87 de 4627 bytes junto a la firma secp256k1 de 64 bytes.
- **Una frase de recuperación, dos claves**: la clave ML-DSA-87 se deriva de la misma frase mnemotécnica que la clave clásica y queda vinculada a tu dirección.

Por qué importa: se espera que un futuro ordenador cuántico rompa las firmas secp256k1. Una transacción que además lleva una firma ML-DSA-87 sigue protegida. Consulta [Transacciones resistentes a la computación cuántica](/sdk/guides/quantum-safe).

## Paso a paso {#run}

### 1. Instala las herramientas

Necesitas Git y una cadena de herramientas estable reciente de Rust con `cargo`.

- Git: https://git-scm.com/downloads
- Rust: instálalo con rustup desde https://rustup.rs

Comprueba las versiones:

```bash
git --version
rustc --version
cargo --version
```

### 2. Obtén el código

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

### 3. Compila

```bash
cargo build --release
```

La primera compilación descarga y compila las dependencias y tarda unos minutos. Termina con `Finished` del perfil `release`. Si ejecutas la herramienta sin argumentos, imprime la lista de comandos:

```bash
cargo run --release
```

### 4. Crea una cuenta de testnet desechable

```bash
cargo run --release -- new
```

`new` crea una frase de recuperación y la guarda en un archivo de claves con modo 0600. La frase nunca se imprime. El archivo de claves es por defecto `~/.config/qday/rust.env`; define `QDAY_KEY_FILE` para usar otra ruta. Se niega a sobrescribir un archivo existente. Es una cuenta solo para la testnet: nunca uses aquí una wallet real, nunca compartas ni subas el archivo de claves y nunca lo reutilices en la mainnet. El comando imprime tu dirección `qor1...`.

### 5. Consigue QOR de testnet en el faucet

1. Abre https://dashboard.qorechain.io/faucet e inicia sesión.
2. Pega tu dirección `qor1...` y reclama. Cada reclamo paga 100 QOR, una vez cada 24 horas por cuenta y por dirección.

La cuenta debe existir en la cadena antes del siguiente paso, porque el registro cuesta una comisión.

### 6. Comprueba la cuenta

```bash
cargo run --release -- status                  # address, balance, PQC key, latest block
```

### 7. Registra la clave ML-DSA-87

```bash
cargo run --release -- register                # register the ML-DSA-87 key (once, idempotent)
```

La transacción de registro se firma de forma clásica, porque una clave no puede cofirmar su propio registro. Si lo ejecutas de nuevo, no hace nada.

### 8. Envía un pago con firma híbrida

```bash
cargo run --release -- send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

Sustituye `qor1...` por cualquier dirección de la testnet (por ejemplo, una segunda cuenta desechable). La cantidad está en QOR. `send` paga la cantidad y después ejecuta la verificación.

### 9. Verifica cualquier transacción

```bash
cargo run --release -- verify <TX_HASH>        # the verification report for any transaction
```

La herramienta es solo para la testnet: usa el preajuste `testnet` del SDK y se niega a ejecutarse contra cualquier otro ID de cadena.

## La cuenta {#account}

La cuenta es una cuenta secp256k1 de QoreChain Native, con coin type 118 (`m/44'/118'/0'/0/0`) y una dirección `qor1...`. La clave ML-DSA-87 sale de la misma frase mnemotécnica con la regla canónica del SDK vinculada a la dirección. Una sola frase mnemotécnica restaura ambas claves.

```rust
let classical = derive_native_account(mnemonic, 0)?;
let pqc = try_derive_pqc_canonical(&classical.address, mnemonic)?;
```

## El código del SDK que importa {#code}

Este es el núcleo del comando `send`, abreviado:

```rust
// The payment: a plain bank MsgSend.
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);
// Which hybrid sign-bytes form this network verifies (asked once, cached).
let version = SignBytesResolver::new()
    .resolve(SignBytesMode::Auto, &net.chain_id, Some(&net.rest_url)).await?;

let mut params = BuildHybridTxParams {
    private_key: w.classical.private_key.clone(), // secp256k1 half
    public_key: w.classical.public_key.clone(),
    pqc_secret_key: w.pqc.secret_key.clone(),     // ML-DSA-87 half
    pqc_public_key: w.pqc.public_key.clone(),
    messages: vec![Message { type_url: send.type_url, value: send.value }],
    chain_id: net.chain_id.clone(),
    include_pqc_public_key: false, // key registered with `register`
    sign_bytes_version: Some(version),
    /* fee, account_number, sequence, memo, timeout_height */
};

let draft = build_hybrid_tx(params.clone())?;                    // sign a draft
params.fee = estimate_fee(&net.rest_url, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params.clone())?;                       // sign for real
let res = broadcast_and_wait(&net.rest_url, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

El registro es una única llamada idempotente, `ensure_pqc_registered()` en `PqcDx`: envía `MsgRegisterPQCKeyV2` con una prueba de posesión solo cuando todavía no hay ninguna clave registrada, y falla si la cuenta tiene una clave distinta.

El gas nunca es fijo: se simula el borrador y el límite es el gas simulado multiplicado por 1,3, con un precio de 0,15 uqor por unidad de gas (el mínimo de la cadena es 0,1 uqor).

## Cómo se decide que está "verificada" {#verified}

`verify` lee `GET /cosmos/tx/v1beta1/txs/{hash}` del endpoint REST público de la testnet y comprueba tres cosas:

- que la transacción tuvo éxito (`code 0`);
- que la cadena emitió `pqc_hybrid_verify` con `status=verified` para el firmante;
- que el cuerpo lleva una extensión `/qorechain.pqc.v1.PQCHybridSignature` con una firma ML-DSA-87 de 4627 bytes.

## Qué deberías ver {#output}

Un `send` correcto imprime la cantidad y la comisión, el bloque en el que se incluyó y, después, un informe que muestra que la transacción tuvo éxito, que `pqc_hybrid_verify` es `verified` y que la firma ML-DSA-87 ocupa 4627 bytes. Si alguna comprobación falla, la herramienta termina con el estado 2. Para buscar la transacción, abre https://explore.qore.network, cámbialo a **Testnet** y busca el hash, o abre `https://explore.qore.network/tx/<HASH>`.

## Endpoints de la red {#access}

| Qué | Dónde |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorador | `https://explore.qore.network` (cambia a Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |

## Paquetes usados {#packages}

| Elemento | Versión |
| --- | --- |
| `qorechain-sdk` (importado como `qorechain`) | 0.13 (resuelto a 0.13.0) |
| `tokio` | 1 |
| `serde_json` | 1 |
| `base64` | 0.22 |
| `cosmrs` | 0.22 |
| `qday-pay` (esta aplicación, no publicada) | 0.1.0 |

Consulta [Instalar el SDK](/sdk/install) para ver la tabla de versiones del SDK en todos los lenguajes.

## Código fuente {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
