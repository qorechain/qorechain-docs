---
slug: /getting-started/wallet-setup
title: Configuración de Billetera
sidebar_label: Configuración de Billetera
sidebar_position: 2
---

# Configuración de Billetera

QoreChain admite múltiples tipos de billeteras en sus entornos de ejecución nativo, EVM y SVM. Elige la billetera que se ajuste a tu caso de uso.

:::note
Los valores a continuación cubren tanto la mainnet **`qorechain-vladi`** (chain ID EVM **9801**, activa desde el 7 de junio de 2026) como la testnet **`qorechain-diana`** (chain ID EVM **9800**). Los endpoints públicos de ambas redes se listan en [Redes](/appendix/networks#public-endpoints).
:::

## Billetera Keplr

Keplr es la billetera recomendada para transacciones nativas de QoreChain, staking y gobernanza.

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

### Registro de la red en una sola llamada

Para dApps, los paquetes **`@qorechain/wallet-adapter`** y **`@qorechain/connect`** (publicados en npm) registran QoreChain en la billetera del usuario con una sola llamada — solicitando a MetaMask que añada la red mediante EIP-3085 (con el QOR nativo correcto de **18 decimales** en el carril EVM) y configurando el escalón de precio de gas de Keplr:

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## Una cuenta, tres direcciones (cuentas unificadas) {#unified-accounts}

A partir de la versión de cadena **v3.1.83**, una cuenta de QoreChain es **una identidad de 20 bytes con tres codificaciones**: `qor1…` (Native), `0x…` (EVM) y una forma base58 (SVM). Mantiene **un único saldo** y — en el caso de las cuentas eth-nativas — **firma en los tres carriles con una sola clave**, incluida la firma híbrida poscuántica requerida en la ruta Native.

Genera una billetera unificada en código con `@qorechain/wallet-adapter`:

```js
import { generateQoreWallet } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();          // or walletFromMnemonic(mnemonic)
console.log(w.addresses.cosmos);               // qor1...
console.log(w.addresses.evm);                  // 0x... (same identity)
console.log(w.addresses.svm);                  // base58 (same identity)
// Native-lane sends use signHybridEth (classical eth_secp256k1 + ML-DSA-87 hybrid).
```

Los fondos enviados a cualquiera de las tres formas llegan al mismo saldo.

## Billeteras vinculadas: Phantom y MetaMask como claves de gasto {#linked-wallets}

A partir de la versión de cadena **v3.1.85**, no es necesario exponer tu clave raíz para gastar desde una cuenta de QoreChain en una dApp. Una clave de **Phantom** (ed25519) o de **MetaMask** (por su dirección de Ethereum, mediante `personal_sign`) puede **registrarse como autenticador** en tu cuenta — con permisos delimitados, límites de gasto, una fecha de expiración y revocación instantánea — y luego autorizar transferencias retransmitidas por el backend de la dApp. Consulta [Autenticadores de billeteras vinculadas](/developer-guide/account-abstraction#authenticators) para el modelo completo y el código, y la [guía de Autenticadores del SDK](/sdk/guides/authenticators) para ejemplos de principio a fin.

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

QoreChain requiere criptografía híbrida poscuántica (PQC) en la ruta de transacciones cosmos. A partir de la versión actual de la cadena (**v3.1.82**), el valor predeterminado de la red es `hybrid_signature_mode = required` con `allow_classical_fallback = false` — por lo que **toda transacción de la ruta cosmos debe llevar una firma ML-DSA-87 (Dilithium-5) junto con la firma estándar secp256k1 (ECDSA)**. Las transacciones cosmos únicamente clásicas provenientes de una cuenta PQC son rechazadas.

:::caution Las transacciones Cosmos requieren la extensión híbrida PQC
Enviar una transacción clásica simple por la ruta cosmos será rechazado. Debes adjuntar la firma Dilithium-5 como una extensión de transacción `PQCHybridSignature`. Las herramientas estándar de CosmJS / Keplr no producen esta extensión por sí solas — usa el comando CLI `qorechaind tx pqc cosign`, la firma híbrida del SDK de QoreChain (ver más abajo) o, para construirla tú mismo en código, la biblioteca de código abierto [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Las únicas exenciones son los gentxs de génesis y las transacciones de registro/migración de claves PQC.
:::

### Cómo funciona

Las billeteras adjuntan una firma PQC ML-DSA-87 como extensión de transacción junto con la firma estándar secp256k1 (ECDSA). La firma clásica se calcula sobre los bytes de firma que excluyen la extensión, de modo que sigue siendo válida para la verificación clásica mientras la firma PQC aporta resistencia cuántica.

### Generar una clave Dilithium-5

Genera una clave poscuántica para la firma híbrida:

```bash
qorechaind tx pqc gen-key
```

### Registro automático

Cuando incluyes una clave pública PQC en tu primera transacción, QoreChain la registra automáticamente en la cadena. No se necesita un paso de registro separado. (Las transacciones de registro/migración de claves PQC están a su vez exentas del requisito híbrido, de modo que una cuenta puede inicializar su primera clave.)

### Firma híbrida con el SDK

El SDK de QoreChain produce transacciones cosmos conformes mediante `buildHybridTx` con `includePqcPublicKey: true`, que adjunta la extensión Dilithium-5 e incorpora la clave pública para el registro automático. Consulta [Cuentas del SDK y firma PQC](/sdk/concepts/accounts-pqc).

### Modos PQC

Los tres modos de aplicación siguen controlados por gobernanza; el **valor predeterminado actual de la red es Required**:

| Modo                   | Descripción                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | La verificación PQC está desactivada. Solo firmas estándar.             |
| **Optional**           | Las transacciones pueden incluir firmas PQC. Si están presentes, se verifican. |
| **Required** (predeterminado) | Todas las transacciones de la ruta cosmos deben incluir una firma PQC válida. |

El modo activo se configura a nivel de cadena y puede actualizarse mediante gobernanza.

:::note EVM / MetaMask no se ve afectado
El flujo de MetaMask (EVM) descrito arriba **no** se ve afectado por el requisito híbrido. Las transacciones EVM usan una ruta ante `eth_secp256k1` separada y nunca necesitan la extensión PQC.
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
