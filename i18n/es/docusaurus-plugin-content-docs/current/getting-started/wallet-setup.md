---
slug: /getting-started/wallet-setup
title: Configuración de la Billetera
sidebar_label: Configuración de la Billetera
sidebar_position: 2
---

# Configuración de la Billetera

QoreChain admite múltiples tipos de billeteras a través de sus entornos de ejecución nativo, EVM y SVM. Elige la billetera que se ajuste a tu caso de uso.

:::note
Los chain IDs y los endpoints RPC que se indican a continuación apuntan a la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) está activa desde el 7 de junio de 2026; sus valores de conexión de billetera están documentados en la página separada **Conexión a la Mainnet**.
:::

## Billetera Keplr

Keplr es la billetera recomendada para las transacciones nativas, el staking y la gobernanza de QoreChain.

### Añadir QoreChain como Cadena Personalizada

Abre Keplr y navega a **Settings > Add Custom Chain**, luego introduce:

| Campo              | Valor                     |
| ------------------ | ------------------------- |
| Chain Name         | `QoreChain Diana Testnet` |
| Chain ID           | `qorechain-diana`         |
| RPC URL            | `http://localhost:26657`  |
| REST URL           | `http://localhost:1317`   |
| Bech32 Prefix      | `qor`                     |
| Coin Denom         | `QOR`                     |
| Coin Minimal Denom | `uqor`                    |
| Decimals           | `6`                       |

Después de añadir la cadena, Keplr genera una dirección `qor1...` para tu cuenta. Usa esta dirección para recibir tokens QOR de testnet.

## MetaMask (EVM)

MetaMask permite interactuar con el entorno de ejecución EVM de QoreChain: desplegar contratos en Solidity, gestionar tokens ERC-20 y utilizar herramientas conocidas de Ethereum.

### Añadir QoreChain como Red Personalizada

Abre MetaMask y navega a **Settings > Networks > Add Network**, luego introduce:

| Campo           | Valor                   |
| --------------- | ----------------------- |
| Network Name    | `QoreChain EVM`         |
| RPC URL         | `http://localhost:8545` |
| Chain ID        | `9800`                  |
| Currency Symbol | `QOR`                   |

Una vez conectado, puedes usar MetaMask para firmar transacciones EVM, interactuar con contratos inteligentes desplegados y gestionar tokens ERC-20 en QoreChain.

### Registro de red en una sola llamada

Para las dApps, los paquetes **`@qorechain/wallet-adapter`** y **`@qorechain/connect`** (publicados en npm, v0.1.0) registran QoreChain en la billetera del usuario con una sola llamada, solicitando a MetaMask que añada la red mediante EIP-3085 (con el QOR nativo correcto de **18 decimales** en el rail EVM) y configurando el paso de precio de gas de Keplr:

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## Billeteras de Solana (SVM)

El entorno de ejecución SVM de QoreChain es compatible con las herramientas estándar de Solana. Conecta cualquier billetera o biblioteca compatible con Solana para interactuar con los programas SVM.

### Uso de @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Esto permite el despliegue y la interacción con programas SVM que se ejecutan en QoreChain.

## Billeteras Habilitadas con PQC (Obligatorio en la Ruta Cosmos)

QoreChain requiere criptografía poscuántica (PQC) híbrida en la ruta de transacciones de cosmos. A partir de la versión actual de la cadena (**v3.1.80**), el valor predeterminado de la red es `hybrid_signature_mode = required` con `allow_classical_fallback = false`, por lo que **cada transacción de la ruta cosmos debe llevar una firma ML-DSA-87 (Dilithium-5) junto con la firma estándar secp256k1 (ECDSA)**. Las transacciones de cosmos solo clásicas provenientes de una cuenta PQC son rechazadas.

:::caution Las txs de cosmos requieren la extensión híbrida PQC
El envío de una transacción clásica simple en la ruta cosmos será rechazado. Debes adjuntar la firma Dilithium-5 como una extensión de transacción `PQCHybridSignature`. Las herramientas estándar de CosmJS / Keplr no producen esta extensión por sí solas: usa el comando CLI `qorechaind tx pqc cosign`, la firma híbrida del SDK de QoreChain (ver más abajo) o, para construirla tú mismo en código, la biblioteca de código abierto [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Las únicas exenciones son los gentxs de génesis y las transacciones de registro/migración de claves PQC.
:::

### Cómo Funciona

Las billeteras adjuntan una firma PQC ML-DSA-87 como una extensión de transacción junto con la firma estándar secp256k1 (ECDSA). La firma clásica se calcula sobre los bytes de firma que excluyen la extensión, por lo que sigue siendo válida para la verificación clásica mientras que la firma PQC proporciona resistencia cuántica.

### Generar una Clave Dilithium-5

Genera una clave poscuántica para la firma híbrida:

```bash
qorechaind tx pqc gen-key
```

### Auto-Registro

Cuando incluyes una clave pública PQC en tu primera transacción, QoreChain la registra automáticamente en la cadena. No se necesita ningún paso de registro por separado. (Las transacciones de registro/migración de claves PQC están exentas del requisito híbrido, por lo que una cuenta puede arrancar con su primera clave.)

### Firma Híbrida con el SDK

El SDK de QoreChain produce transacciones de cosmos conformes mediante `buildHybridTx` con `includePqcPublicKey: true`, lo que adjunta la extensión Dilithium-5 e incrusta la clave pública para el auto-registro. Consulta [Cuentas y firma PQC del SDK](/sdk/concepts/accounts-pqc).

### Modos PQC

Los tres modos de aplicación siguen estando controlados por la gobernanza; el **valor predeterminado actual de la red es Required**:

| Modo                          | Descripción                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------ |
| **Disabled**                  | La verificación PQC está desactivada. Solo firmas estándar.                    |
| **Optional**                  | Las transacciones pueden incluir firmas PQC. Si están presentes, se verifican. |
| **Required** (predeterminado) | Todas las transacciones de la ruta cosmos deben incluir una firma PQC válida.  |

El modo activo se configura a nivel de cadena y puede actualizarse a través de la gobernanza.

:::note EVM / MetaMask no se ven afectados
El flujo de MetaMask (EVM) anterior **no** se ve afectado por el requisito híbrido. Las transacciones EVM utilizan una ruta ante `eth_secp256k1` separada y nunca necesitan la extensión PQC.
:::

## Billetera CLI

El binario `qorechaind` incluye un sistema de gestión de claves integrado para su uso desde la línea de comandos.

### Crear una Nueva Clave

```bash
qorechaind keys add mykey
```

Esto genera un nuevo par de claves y muestra la frase mnemónica. **Guarda la frase mnemónica de forma segura**: es la única forma de recuperar esta clave.

### Ver Tu Dirección

```bash
qorechaind keys show mykey -a
```

Esto muestra tu dirección bech32 `qor1...`.

### Listar Todas las Claves

```bash
qorechaind keys list
```

### Importar una Clave Existente

```bash
qorechaind keys add mykey --recover
```

Se te pedirá que introduzcas tu frase mnemónica.

## Próximos Pasos

* [Tu Primera Transacción](/getting-started/first-transaction) — Envía tokens QOR usando tu nueva billetera
* [Conexión a la Testnet](/getting-started/connecting-to-testnet) — Únete a la testnet Diana en vivo
