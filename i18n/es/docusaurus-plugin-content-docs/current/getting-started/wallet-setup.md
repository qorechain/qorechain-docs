---
slug: /getting-started/wallet-setup
title: Configuración de Billetera
sidebar_label: Configuración de Billetera
sidebar_position: 2
---

# Configuración de Billetera

QoreChain admite múltiples tipos de billeteras en sus entornos de ejecución nativo, EVM y SVM. Elige la billetera que se ajuste a tu caso de uso.

:::note
Los valores a continuación cubren tanto la mainnet **`qorechain-vladi`** (chain ID EVM **9801**, activa desde el 7 de junio de 2026, versión v3.2.3) como la testnet **`qorechain-diana`** (chain ID EVM **9800**, versión v3.2.4). Los endpoints públicos de ambas redes se listan en [Redes](/appendix/networks#public-endpoints).
:::

## QoreX (recomendada) {#qorex}

**QoreX** es la billetera oficial no custodial de QoreChain: una aplicación móvil (Android, iOS) y una extensión de navegador (Chrome, Firefox, Safari en macOS). Firma cada transferencia del carril Native con la firma híbrida poscuántica obligatoria, registra por ti tu clave poscuántica, admite staking, @handles y redes externas, y se vincula con el Dashboard. También abre la [ventana de autorización EVM](/getting-started/first-transaction#evm-window) que necesitan las transacciones de MetaMask. Empieza con la [guía de QoreX](/qorex/overview) y [Primeros pasos](/qorex/getting-started).

## Billetera Keplr

Keplr puede añadir QoreChain como cadena personalizada (más abajo) para ver saldos y recibir en el carril Native. Como QoreChain exige una cofirma poscuántica en el carril Native, envía, haz staking y vota con una billetera compatible con PQC como [QoreX](/qorex/overview) en lugar de usar solo Keplr.

### Añadir QoreChain como cadena personalizada

Abre Keplr y ve a **Settings > Add Custom Chain**, luego introduce:

| Campo              | Mainnet                    | Testnet                          |
| ------------------ | -------------------------- | -------------------------------- |
| Chain Name         | `QoreChain`                | `QoreChain Diana Testnet`        |
| Chain ID           | `qorechain-vladi`          | `qorechain-diana`                |
| RPC URL            | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| REST URL           | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Bech32 Prefix      | `qor`                      | `qor`                            |
| Coin Denom         | `QOR`                      | `QOR`                            |
| Coin Minimal Denom | `uqor`                     | `uqor`                           |
| Decimals           | `6`                        | `6`                              |
| Coin Type (BIP-44) | `118`                      | `118`                            |

Después de añadir la cadena, Keplr genera una dirección `qor1...` para tu cuenta.

:::caution Precio mínimo de gas
El precio mínimo de gas de la red es **0.1uqor**. Si configuras los escalones de precio de gas de Keplr (p. ej. mediante `suggestChain`), usa valores **iguales o superiores a 0.1** (bajo/medio/alto sugeridos: `0.1 / 0.15 / 0.25`) — las transacciones firmadas por debajo del mínimo son rechazadas.
:::

## MetaMask (EVM)

MetaMask permite interactuar con el entorno de ejecución EVM de QoreChain: despliega contratos Solidity, gestiona tokens ERC-20 y usa las herramientas habituales de Ethereum.

### Añadir QoreChain como red personalizada

Abre MetaMask y ve a **Settings > Networks > Add Network**, luego introduce:

| Campo              | Mainnet                   | Testnet                          |
| ------------------ | ------------------------- | -------------------------------- |
| Network Name       | `QoreChain`               | `QoreChain Diana Testnet`        |
| RPC URL            | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| Chain ID           | `9801`                    | `9800`                           |
| Currency Symbol    | `QOR`                     | `QOR`                            |
| Block Explorer URL | `https://explore.qore.network` | `https://explore.qore.network` |

El QOR nativo tiene **18 decimales** en la interfaz EVM (estilo wei). Una vez conectado, puedes usar MetaMask para firmar transacciones EVM, interactuar con contratos inteligentes desplegados y gestionar tokens ERC-20 en QoreChain.

:::caution EVM / MetaMask necesita una clave PQC y una ventana abierta
MetaMask sigue firmando con normalidad, pero el carril EVM solo admite transacciones de una cuenta que tenga una clave poscuántica registrada y una **ventana de autorización EVM** abierta (v3.2.0 y posteriores). Registra tu clave una vez y abre una ventana antes de una sesión de actividad EVM — consulta [Ventana de autorización EVM](/getting-started/first-transaction#evm-window). MetaMask no puede abrir la ventana por sí misma; ábrela en [QoreX](/qorex/security-and-recovery#evm-window) o con la CLI. Añadir la red a MetaMask (arriba) no cambia.
:::

### Registro de la red en una sola llamada

Para dApps, el paquete **`@qorechain/wallet-adapter`** (publicado en npm) registra QoreChain en la billetera del usuario con una sola llamada — solicitando a MetaMask que añada la red mediante EIP-3085 (con el QOR nativo correcto de **18 decimales** en el carril EVM) — y proporciona `qoreChainInfo` para la sugerencia de cadena de Keplr (incluido el escalón de precio de gas):

```bash
npm install @qorechain/wallet-adapter
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// pass the EIP-1193 provider and the network parameters (rpcUrl is required)
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801,                       // 9800 for the testnet
  rpcUrl: "https://evm.qore.host",        // https://evm-testnet.qore.host for the testnet
  explorerUrl: "https://explore.qore.network",
  testnet: false,                         // true for the testnet
});
```

## Una cuenta, tres direcciones (cuentas unificadas) {#unified-accounts}

A partir de la versión de cadena **v3.1.83**, una cuenta de QoreChain es **una identidad de 20 bytes con tres codificaciones**: `qor1…` (Native), `0x…` (EVM) y una forma base58 (SVM). Mantiene **un único saldo** y — en el caso de las cuentas eth-nativas — **firma en los tres carriles con una sola clave**, incluida la firma híbrida poscuántica requerida en la ruta Native.

Genera una billetera unificada en código con `@qorechain/wallet-adapter`:

```js
import { generateQoreWallet } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();          // or walletFromMnemonic(mnemonic)
console.log(w.cosmos);                         // qor1...
console.log(w.evm);                            // 0x... (same identity)
console.log(w.svm);                            // base58 (same identity)
// Native-lane sends use signHybridEth (classical eth_secp256k1 + ML-DSA-87 hybrid); pass `rest` so the sign-bytes form is resolved.
```

Los fondos enviados a cualquiera de las tres formas llegan al mismo saldo.

## Billeteras vinculadas: Phantom y MetaMask como claves de gasto {#linked-wallets}

:::caution Actualmente desactivado en ambas redes
Las funciones de cuenta inteligente y de billetera vinculada están implementadas, pero **desactivadas** en ambas redes (`abstractaccount.enabled = false`): mientras el indicador esté desactivado, se rechazan tanto el registro de un autenticador como la ejecución a través de uno. Consulta `GET /qorechain/abstractaccount/v1/config` antes de ofrecer un flujo de vinculación. La sección siguiente describe el comportamiento diseñado.
:::

Diseñado para que no tengas que exponer tu clave raíz al gastar desde una cuenta de QoreChain en una dApp (introducido en la versión de cadena **v3.1.85**): una clave de **Phantom** (ed25519) o de **MetaMask** (por su dirección de Ethereum, mediante `personal_sign`) puede **registrarse como autenticador** en tu cuenta — con permisos delimitados, límites de gasto, una fecha de expiración y revocación instantánea — y luego autorizar transferencias retransmitidas por el backend de la dApp. Consulta [Autenticadores de billeteras vinculadas](/developer-guide/account-abstraction#authenticators) para el modelo completo y el código, y la [guía de Autenticadores del SDK](/sdk/guides/authenticators) para ejemplos de principio a fin.

## Billeteras de Solana (SVM)

:::caution El envío de transacciones SVM está actualmente desactivado
El carril de ejecución SVM está **actualmente desactivado en toda la red para el envío de transacciones** — no envíes transacciones a través de una billetera compatible con Solana contra QoreChain en este momento. La lectura de saldos/slots puede seguir funcionando; consulta [Desarrollo SVM](/developer-guide/svm-development) para conocer el estado actual.
:::

El entorno de ejecución SVM de QoreChain es compatible con las herramientas estándar de Solana, y el **saldo nativo de QOR de la cuenta es visible directamente en la interfaz SVM** (en lamports, 9 decimales; 1 uqor = 1,000 lamports). Conecta cualquier billetera o biblioteca compatible con Solana.

### Uso de @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Los endpoints públicos de SVM son de **solo lectura**; el envío de transacciones requiere tu propio nodo. Consulta [Desarrollo SVM](/developer-guide/svm-development) para más detalles.

## Billeteras con PQC habilitado (obligatorio en la ruta Cosmos)

QoreChain requiere criptografía híbrida poscuántica (PQC) en la ruta de transacciones cosmos. En las redes activas (v3.2.x), el valor predeterminado de la red es `hybrid_signature_mode = required` con `allow_classical_fallback = false` — por lo que **toda transacción de la ruta cosmos debe llevar una firma ML-DSA-87 (Dilithium-5) junto con la firma estándar secp256k1 (ECDSA)**. Las transacciones cosmos únicamente clásicas provenientes de una cuenta PQC son rechazadas.

:::caution Las transacciones Cosmos requieren la extensión híbrida PQC
Enviar una transacción clásica simple por la ruta cosmos será rechazado. Debes adjuntar la firma Dilithium-5 como una extensión de transacción `PQCHybridSignature`. Las herramientas estándar de CosmJS / Keplr no producen esta extensión por sí solas — usa el comando CLI `qorechaind tx pqc cosign`, la firma híbrida del SDK de QoreChain (ver más abajo) o, para construirla tú mismo en código, la biblioteca de código abierto [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Las únicas exenciones son los gentxs de génesis, las transacciones de registro/migración de claves PQC y un unjail desde una cuenta de operador que no tiene ninguna clave registrada.
:::

### Cómo funciona

Las billeteras adjuntan una firma PQC ML-DSA-87 como extensión de transacción junto con la firma estándar secp256k1 (ECDSA). La firma clásica se calcula sobre los bytes de firma que excluyen la extensión, de modo que sigue siendo válida para la verificación clásica mientras la firma PQC aporta resistencia cuántica.

### Generar una clave Dilithium-5

Genera una clave poscuántica para la firma híbrida:

```bash
qorechaind tx pqc gen-key mypqc
```

El comando toma un nombre de clave y guarda la clave en `~/.qorechaind/pqc/<name>.dilithium` (modo `0600`, sin cifrar). Requiere el binario de la versión oficial de `qorechaind`.

### Registra tu clave (una sola vez) {#register-your-key}

Una clave poscuántica se **registra de forma explícita**, una vez por cuenta, con una transacción de registro de clave. Esa única transacción (y la migración de claves) puede firmarse de forma clásica para que una cuenta recién creada pueda inicializarse; después, toda transacción del carril Cosmos debe llevar la firma híbrida.

```bash
# register the public key printed by gen-key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-vladi --gas 600000 --fees 60000uqor
```

Desde v3.2.3 puedes adjuntar una prueba de posesión opcional registrando con `qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --pqc-key mypqc --from mykey ...`; la cadena también rechaza claves débiles, degeneradas o ya utilizadas. Respalda el archivo de la clave PQC con el mismo cuidado que tu mnemónica. (Una clave puede volver a derivarse de la mnemónica con `qorechaind tx pqc recover-key` y reemplazarse con `tx pqc rotate-key`.) QoreX y el SDK de QoreChain registran la clave por ti. Consulta [Primera transacción](/getting-started/first-transaction#register-pqc-key) para ver un envío firmado completo.

### Firma híbrida con el SDK

El SDK de QoreChain produce transacciones conformes del carril Cosmos mediante `buildHybridTx`, que adjunta la extensión Dilithium-5. La clave de la cuenta ya debe estar registrada (ver arriba). Consulta [Cuentas del SDK y firma PQC](/sdk/concepts/accounts-pqc).

### Modos PQC

Los tres modos de aplicación siguen controlados por gobernanza; el **valor predeterminado actual de la red es Required**:

| Modo                   | Descripción                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | La verificación PQC está desactivada. Solo firmas estándar.             |
| **Optional**           | Las transacciones pueden incluir firmas PQC. Si están presentes, se verifican. |
| **Required** (predeterminado) | Todas las transacciones de la ruta cosmos deben incluir una firma PQC válida. |

El modo activo se configura a nivel de cadena y puede actualizarse mediante gobernanza.

:::caution EVM / MetaMask necesita una clave PQC y una ventana abierta
El flujo de MetaMask (EVM) descrito arriba no lleva la extensión híbrida, pero desde v3.2.0 el carril EVM solo admite transacciones de una cuenta con una clave poscuántica registrada y una **ventana de autorización EVM** abierta. Consulta [Ventana de autorización EVM](/getting-started/first-transaction#evm-window).
:::

## Billetera CLI

El binario `qorechaind` incluye un sistema integrado de gestión de claves para su uso en la línea de comandos.

### Crear una nueva clave

```bash
qorechaind keys add mykey
```

Esto genera un nuevo par de claves y muestra la frase mnemónica. **Guarda la mnemónica de forma segura** — es la única manera de recuperar esta clave.

### Ver tu dirección

```bash
qorechaind keys show mykey -a
```

Esto muestra tu dirección bech32 `qor1...`.

### Listar todas las claves

```bash
qorechaind keys list
```

### Importar una clave existente

```bash
qorechaind keys add mykey --recover
```

Se te pedirá que introduzcas tu frase mnemónica.

## Próximos pasos

* [Tu primera transacción](/getting-started/first-transaction) — Envía tokens QOR usando tu nueva billetera
* [Conexión a la testnet](/getting-started/connecting-to-testnet) — Únete a la testnet Diana en vivo
