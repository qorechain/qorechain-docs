---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: App en Rust, qday-pay
sidebar_label: Rust, qday-pay
sidebar_position: 4
---

# App en Rust: qday-pay

**qday-pay** es un pequeño programa en Rust que ejecutas en una terminal. Paga QOR de testnet en la testnet de QoreChain `qorechain-diana` con una **firma híbrida**: una firma clásica secp256k1 más una firma poscuántica ML-DSA-87 (NIST FIPS 204). Tras el pago, lee la transacción de vuelta desde la cadena y te muestra la prueba de la propia cadena de que se comprobaron las dos firmas.

**Cuánto tarda:** unos 15 minutos en total. La primera compilación descarga y compila las librerías y tarda de 2 a 5 minutos. Después, cada comando se ejecuta en segundos.

## Qué demuestra {#what-it-shows}

- **Firma híbrida desde Rust** con el crate publicado `qorechain-sdk` (versión 0.13, usado en el código como `qorechain`).
- **Registro único** de tu clave poscuántica en la cadena.
- **Un informe de verificación** de cualquier transacción: la firma clásica de 64 bytes, la firma ML-DSA-87 de 4.627 bytes y el veredicto `pqc_hybrid_verify` de la cadena.

Por qué importa: se espera que un ordenador cuántico futuro pueda romper una firma solo clásica. Una firma híbrida sigue siendo segura mientras resista una de sus dos mitades. Consulta [Transacciones resistentes a la computación cuántica](/sdk/guides/quantum-safe).

## Paso a paso {#run}

Trabajas en tu propia terminal. Usa solo una cuenta de testnet desechable. Los QOR de la testnet no tienen valor. No uses aquí una wallet real ni fondos reales.

:::note Windows
qday-pay usa permisos de archivos de Linux y macOS para su archivo de clave, así que en Windows lo ejecutas dentro de **WSL** (Windows Subsystem for Linux). WSL te da una terminal de Linux dentro de Windows. Todo lo que sigue usa entonces las instrucciones de Linux.
:::

### 1. Antes de empezar: instala las herramientas {#install}

Necesitas tres herramientas: **Git** (descarga el código), **Rust** (compila el programa) y un **compilador de C** (Rust lo necesita para enlazar el programa). Java, Node.js y Python no hacen falta para esta app.

**macOS**

| Herramienta | Cómo instalarla | Cómo comprobarla |
| --- | --- | --- |
| Compilador de C y Git | `xcode-select --install` (se abre una ventana, haz clic en Install) | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (pulsa Enter para aceptar el valor predeterminado), luego cierra y vuelve a abrir la terminal | `rustc --version` y `cargo --version` |

**Linux (Debian o Ubuntu; otras distribuciones usan su propio gestor de paquetes)**

| Herramienta | Cómo instalarla | Cómo comprobarla |
| --- | --- | --- |
| Git y compilador de C | `sudo apt update && sudo apt install -y git build-essential curl` | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (pulsa Enter para aceptar el valor predeterminado), luego cierra y vuelve a abrir la terminal | `rustc --version` y `cargo --version` |

**Windows (mediante WSL)**

1. Abre PowerShell como administrador y ejecuta `wsl --install`. Reinicia el ordenador cuando lo pida. Windows instala Ubuntu. Abre la app **Ubuntu** desde el menú Inicio.
2. En la terminal de Ubuntu, sigue la tabla de **Linux** de arriba.
3. Git para Windows (https://git-scm.com/download/win) no hace falta, porque Git viene con el comando de Linux anterior.

Se requiere Rust 1.74 o superior. El comando `rustup` instala la última versión, y eso está bien. La comprobación de versión debería imprimir algo como `rustc 1.80.0`, o un número mayor.

**Qué deberías ver:** `git --version`, `rustc --version` y `cargo --version` imprimen cada uno un número de versión. Si un comando dice `command not found`, cierra la terminal, abre una nueva e inténtalo de nuevo.

### 2. Antes de empezar: consigue una wallet de testnet y el faucet {#wallet}

Esta app crea su propia cuenta de testnet (paso 5), así que no necesitas instalar una wallet para ejecutarla. Solo necesitas una forma de recibir QOR de testnet gratis. El faucet es un sitio web que envía QOR de testnet gratis a una dirección.

Si además quieres ver tu cuenta en la wallet QoreX, usa **QoreX en testnet** con una cuenta desechable:

- **App QoreX:** abre Ajustes y activa **Use testnet (developers)**.
- **Extensión de navegador de QoreX:** desbloquéala, toca 7 veces el número de versión de la parte inferior y elige **Switch to testnet (diana)**.

No necesitas ninguna cuenta de Ethereum para esta app. Usa el tipo de cuenta nativo de QoreChain (una dirección `qor1...`).

**Faucet:** https://dashboard.qorechain.io/faucet. Inicia sesión, pega tu dirección y haz la solicitud. El faucet paga **100 QOR cada 24 horas por cuenta**.

**Conviene saber:** la primera transacción de una cuenta nueva registra en la cadena su clave poscuántica ML-DSA-87. Es una tarifa única de unos 0,09 QOR. qday-pay lo hace en el paso 7.

**Cantidades:** la unidad que lees es el **QOR**. La cadena cuenta en **uqor**, la unidad más pequeña. 1 QOR = 1.000.000 uqor. Tú escribes las cantidades en QOR (por ejemplo `1`) y el programa las convierte por ti.

### 3. Descarga el código {#get-the-code-step}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

**Qué hace**

| Parte | Significado |
| --- | --- |
| `git clone <address>` | Descarga desde GitHub una copia completa de las apps de ejemplo en una carpeta nueva llamada `build-before-qday`. |
| `cd <folder>` | Mueve tu terminal a la carpeta de la app en Rust. Todos los comandos siguientes se ejecutan desde aquí. |

**Qué deberías ver:** `Cloning into 'build-before-qday'...` y después tu prompt en la carpeta `04-rust-qday-pay`. Ejecuta `ls` para comprobarlo: verás `Cargo.toml`, `Cargo.lock`, `README.md` y `src`.

### 4. Compila el programa {#build}

```bash
cargo build --release
```

**Qué hace:** `cargo` es la herramienta de compilación de Rust. Este comando descarga las librerías que figuran en `Cargo.toml` y compila el programa en un solo archivo.

| Parte | Significado |
| --- | --- |
| `build` | Compila el programa (todavía no lo ejecuta). |
| `--release` | Compila la versión rápida y optimizada. Sin esto obtienes una versión de depuración más lenta, en otra carpeta. |

**Cuánto tarda:** de 2 a 5 minutos la primera vez, unos segundos después.

**Qué deberías ver:** muchas líneas `Compiling ...` y luego `Finished release profile [optimized] target(s)`. El programa es ahora el archivo `./target/release/qday-pay`.

Comprueba que se ejecuta:

```bash
./target/release/qday-pay
```

**Qué hace:** ejecuta el programa sin ningún comando. Imprime su ayuda y no cambia nada.

**Qué deberías ver:**

```text
qday-pay: hybrid post-quantum payments on QoreChain testnet

  qday-pay new
  qday-pay status
  qday-pay register
  qday-pay send <qor1to> <amount_qor> [--memo text]
  qday-pay verify <tx_hash>
```

Las cinco líneas son los cinco comandos que usas a continuación. En el resto de esta página, `<command>` significa `./target/release/qday-pay <command>`.

### 5. Crea una cuenta de testnet desechable {#new-account}

```bash
./target/release/qday-pay new
```

**Qué hace:** crea una cuenta de testnet completamente nueva. Genera una frase de recuperación secreta (el mnemónico) y la guarda en un **archivo de clave**. De esa única frase deriva tus dos claves, la clave clásica secp256k1 y la clave poscuántica ML-DSA-87. La frase nunca se imprime en pantalla.

| Parte | Significado |
| --- | --- |
| `new` | El comando: crea una cuenta y un archivo de clave. Se niega a sobrescribir un archivo de clave que ya exista, así que no puede destruir por error una cuenta con fondos. |

**Dónde está el archivo de clave:** `~/.config/qday/rust.env`. El `~` es tu carpeta personal. El archivo solo puede leerlo tu usuario (modo 0600). Puedes usar otro lugar definiendo `QDAY_KEY_FILE`, por ejemplo `QDAY_KEY_FILE=$HOME/my-test-key.env ./target/release/qday-pay new`. Si lo haces, define la misma variable delante de cada comando posterior.

:::warning Mantén el archivo de clave en privado
El archivo de clave es la llave de la cuenta. No lo compartas nunca, no lo pegues en un chat ni en una captura de pantalla y no lo subas nunca a Git. Usa esta cuenta solo para el taller y nunca en la mainnet. Cuando termines, borra el archivo.
:::

**Qué deberías ver:**

```text
  New testnet account (mnemonic saved, not shown)

  address      qor1...
  key file     /home/you/.config/qday/rust.env (0600)

  Next: fund it with testnet QOR, then `qday-pay status`.
```

Copia la dirección `qor1...`.

### 6. Fondea la cuenta desde el faucet {#faucet}

1. Abre https://dashboard.qorechain.io/faucet e inicia sesión.
2. Pega tu dirección `qor1...` y haz la solicitud. Recibes 100 QOR.
3. Espera unos 10 segundos al bloque que contiene el pago.

La cuenta debe existir en la cadena antes de poder registrar una clave, y el pago del faucet es lo que la crea.

### 7. Comprueba la cuenta {#status}

```bash
./target/release/qday-pay status
```

**Qué hace:** lee tu cuenta desde la testnet e imprime un resumen. No envía nada.

**Qué deberías ver:**

```text
  network      qorechain-diana (testnet)
  address      qor1...
  balance      100 QOR
  ML-DSA-87    NOT registered (run `qday-pay register`)
  block        123456
```

| Línea | Significado |
| --- | --- |
| `network` | La cadena con la que habla el programa. Funciona solo en la testnet `qorechain-diana` y rechaza cualquier otra red. |
| `balance` | Tus QOR disponibles para gastar. |
| `ML-DSA-87` | Si tu clave poscuántica está registrada en la cadena. |
| `block` | La altura del último bloque. No deja de subir. |

### 8. Registra la clave poscuántica {#register}

```bash
./target/release/qday-pay register
```

**Qué hace:** envía una transacción que le comunica a la cadena tu clave pública ML-DSA-87, junto con una **prueba de posesión** (una prueba de que de verdad tienes la clave secreta correspondiente). La cadena guarda la clave y, desde entonces, puede comprobar tus firmas poscuánticas. Cuesta una tarifa única de unos 0,09 QOR. Puedes ejecutarlo de nuevo sin riesgo: si la clave ya está registrada, no hace nada.

| Parte | Significado |
| --- | --- |
| `register` | El comando: registra tu clave ML-DSA-87 una sola vez. |

**Qué deberías ver:**

```text
  ML-DSA-87    registered (MsgRegisterPQCKeyV2 + proof of possession)
  tx           <64-character transaction hash>
  block        123460
  gas          ... used / ... wanted
  address      qor1...
```

### 9. Envía un pago con firma híbrida {#send}

Sustituye `qor1...` por una dirección de testnet. Puedes pagar a tu propia dirección o a la dirección de testnet de un amigo.

```bash
./target/release/qday-pay send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

**Qué hace:** construye un pago, lo firma dos veces (secp256k1 y ML-DSA-87), comprueba el coste de gas, lo envía, espera a que entre en un bloque y después ejecuta por ti la verificación del paso 10.

| Parte | Significado |
| --- | --- |
| `send` | El comando: paga QOR a otra dirección. |
| `qor1...` (primer valor) | El destinatario. Debe ser una dirección `qor1`, o el programa se detiene con `not a qor1 address`. |
| `1` (segundo valor) | La cantidad en QOR. `1` significa 1 QOR, es decir, 1.000.000 uqor. Puedes usar decimales como `0.5`. |
| `--memo "text"` | Opcional. Un memo es un texto corto adjunto a la transacción y guardado en la cadena. Ponlo entre comillas cuando tenga espacios. Cualquiera puede leerlo, así que no escribas nada privado. |

La opción `--memo` va después del destinatario y la cantidad, como en el ejemplo.

**Qué deberías ver:**

```text
  sending      1 QOR -> qor1...
  fee          ... uqor (gas ...)
  included     block 123465

  tx           <64-character transaction hash>
  block        123465
  memo         Build Before Q-Day Workshop 1 (Rust)
  classical    secp256k1   64 bytes
  quantum      ML-DSA-87   4627 bytes

  VERIFIED: secp256k1 + ML-DSA-87
```

El `fee` se muestra en uqor y está muy por debajo de 1 QOR. El programa también imprime un enlace `explorer` y una línea `chain says` (paso 10). Copia el hash de la transacción.

### 10. Verifica cualquier transacción {#verify}

```bash
./target/release/qday-pay verify <TX_HASH>
```

**Qué hace:** lee la transacción desde la cadena y comprueba tres cosas, sin enviar nada.

| Parte | Significado |
| --- | --- |
| `verify` | El comando: imprime el informe de verificación. |
| `<TX_HASH>` | El hash de 64 caracteres de la transacción. Pega el hash del paso 9. Funciona con cualquier transacción de la testnet. |

Las comprobaciones:

1. La transacción tuvo éxito (código de resultado 0).
2. La cadena emitió el evento `pqc_hybrid_verify` con `status=verified`. Es la cadena diciendo que comprobó la firma poscuántica.
3. La transacción lleva una extensión `PQCHybridSignature` con una firma ML-DSA-87 de 4.627 bytes, junto a la firma secp256k1 de 64 bytes.

**Qué deberías ver:** el mismo informe que en el paso 9, que termina con `VERIFIED: secp256k1 + ML-DSA-87`. Si una comprobación falla, el informe dice `NOT VERIFIED as hybrid` y el programa termina con el código 2.

### 11. Verifícalo de una segunda forma, sin nuestro programa {#verify-curl}

Puedes preguntarle directamente a la cadena. Solo necesitas `curl`, que incluyen macOS y la mayoría de los sistemas Linux. La herramienta `jq` (opcional) hace la respuesta más fácil de leer. Instálala con `brew install jq` en macOS o `sudo apt install -y jq` en Linux.

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| Parte | Significado |
| --- | --- |
| `curl -s <address>` | Descarga la respuesta del servicio REST de la testnet. `-s` oculta la barra de progreso. |
| `<HASH>` | El hash de tu transacción. |
| `\| jq '...'` | Extrae tres valores. Sin `jq`, quita esta parte y lee el texto completo. |

**Qué deberías ver:**

- `"code": 0` en la respuesta (la transacción tuvo éxito). En la salida de `jq`, la primera línea es `0`.
- Una extensión `PQCHybridSignature` (tipo `/qorechain.pqc.v1.PQCHybridSignature`) que contiene la firma ML-DSA-87. La longitud del texto en base64 es de 6.172 caracteres, es decir, 4.627 bytes.
- En `tx_response.events`, un evento de tipo `pqc_hybrid_verify` con el atributo `status` igual a `verified`.

**En el explorador:** abre https://explore.qore.network, cámbialo a **Testnet** y busca el hash de tu transacción. El programa también imprime un enlace directo.

### 12. Limpia {#cleanup}

Cuando termines, borra el archivo de clave desechable:

```bash
rm ~/.config/qday/rust.env
```

`rm` borra un archivo. Ejecútalo solo para una clave de testnet que ya no necesites.

## Solución de problemas {#troubleshooting}

| Qué ves | Por qué | Qué hacer |
| --- | --- | --- |
| `command not found: cargo` o `rustc` | Rust no está instalado, o la terminal se abrió antes de la instalación. | Instala Rust (paso 1) y cierra y vuelve a abrir la terminal. |
| `linker 'cc' not found` o `linking with cc failed` | No hay compilador de C. | macOS: `xcode-select --install`. Ubuntu: `sudo apt install -y build-essential`. |
| `cannot read ... run qday-pay new first` | No hay archivo de clave en ese lugar. | Ejecuta `./target/release/qday-pay new`, o define el mismo `QDAY_KEY_FILE` que antes. |
| `cannot create ... it may already exist` | Ya existe un archivo de clave. El programa nunca sobrescribe uno. | Sigue usándolo, o bórralo con `rm` si no contiene nada que necesites, y vuelve a ejecutar `new`. |
| `account qor1... not found on chain yet; fund it first` | La cuenta aún no tiene QOR, así que no existe en la cadena. | Pide QOR al faucet (paso 6), espera unos 10 segundos e inténtalo de nuevo. |
| El faucet dice que alcanzaste un límite de solicitudes | El faucet da una solicitud cada 24 horas por cuenta. | Espera 24 horas, o usa una segunda cuenta desechable. |
| `account has no PQC key and classical fallback is disabled` | Enviaste un pago antes de registrar la clave poscuántica. | Ejecuta `./target/release/qday-pay register` y vuelve a enviar. |
| `not a qor1 address` | El destinatario es incorrecto, por ejemplo una dirección `0x...`. | Usa una dirección `qor1...`. |
| `transport error` o `error sending request` | No hay internet, o la testnet no responde por un momento. | Revisa tu conexión e inténtalo de nuevo en un minuto. |
| `NOT VERIFIED as hybrid` | La transacción falló o no estaba firmada de forma híbrida. | Lee el `code` del informe. Envía un pago nuevo con este programa. |
| `pnpm: command not found` | Intentaste una app de JavaScript. Esta app en Rust no necesita pnpm. | Ignóralo aquí. Para las apps de JavaScript, ejecuta `npm install -g pnpm`. |
| `EVM authorisation window exhausted` | Pertenece a la app de Hardhat, no a esta. | En esa app, abre una ventana nueva con `pnpm window open`. |
| Errores de CORS | Pertenecen a las apps de navegador. Esta app de línea de comandos no los tiene. | En una app de navegador, usa el proxy `/lcd` de la plantilla. |

## La cuenta {#account}

La cuenta es una cuenta secp256k1 nativa de QoreChain (coin type 118, ruta `m/44'/118'/0'/0/0`, una dirección `qor1...`). La clave ML-DSA-87 sale de la misma frase de recuperación mediante la regla canónica del SDK ligada a la dirección (`authenticator::try_derive_pqc_canonical`). Una sola frase de recuperación restaura las dos claves.

## El código del SDK que importa {#code}

Este es el núcleo del comando `send` en `src/main.rs`:

```rust
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);           // MsgSend
let draft = build_hybrid_tx(params.clone())?;                           // secp256k1 + ML-DSA-87
params.fee = estimate_fee(rest, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params)?;                                      // sign for real
let res = broadcast_and_wait(rest, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

El registro es una sola llamada: `PqcDx::ensure_pqc_registered()`. Envía `MsgRegisterPQCKeyV2` con una prueba de posesión solo cuando todavía no hay ninguna clave registrada.

## Cómo se decide que algo está "verificado" {#verified}

`verify` lee `GET /cosmos/tx/v1beta1/txs/\{hash\}` y comprueba:

- que la transacción tuvo éxito (`code 0`);
- que la cadena emitió `pqc_hybrid_verify` con `status=verified` para el firmante;
- que el cuerpo lleva una extensión `/qorechain.pqc.v1.PQCHybridSignature` con una firma ML-DSA-87 de 4.627 bytes (junto a la firma secp256k1 de 64 bytes).

## Qué deberías ver {#output}

- `new` imprime una dirección `qor1...` y el lugar del archivo de clave, nunca la frase de recuperación.
- `status` muestra el saldo y si la clave ML-DSA-87 está registrada.
- `send` termina con `VERIFIED: secp256k1 + ML-DSA-87` y un enlace al explorador.
- En https://explore.qore.network (cambiado a Testnet) la transacción aparece con su hash.

## Endpoints de la red {#access}

| | |
| --- | --- |
| Chain id de Cosmos | `qorechain-diana` (solo testnet) |
| REST | `https://api-testnet.qore.host` |
| Faucet | https://dashboard.qorechain.io/faucet |
| Explorador | https://explore.qore.network (cambia a Testnet) |

## Paquetes usados {#packages}

| Crate | Versión | Para qué se usa |
| --- | --- | --- |
| `qorechain-sdk` | 0.13 | Cuentas, firma híbrida, cliente REST, ayudas de verificación |
| `tokio` | 1 | Runtime asíncrono |
| `serde_json` | 1 | Lectura de las respuestas JSON de la cadena |
| `base64` | 0.22 | Medir el tamaño de las firmas |
| `cosmrs` | 0.22 | El tipo de mensaje `Coin` |

## Código fuente {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
