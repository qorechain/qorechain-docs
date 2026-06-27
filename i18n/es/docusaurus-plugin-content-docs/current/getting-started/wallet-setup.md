---
slug: /getting-started/wallet-setup
title: Configuración de la billetera
sidebar_label: Configuración de la billetera
sidebar_position: 2
---

# Configuración de la billetera

QoreChain admite múltiples tipos de billetera en sus entornos de ejecución nativo, EVM y SVM. Elige la billetera que se ajuste a tu caso de uso.

:::note
Los chain IDs y endpoints RPC que aparecen a continuación apuntan a la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) está activa desde el 7 de junio de 2026; sus valores de conexión de billetera están documentados en la página independiente **Conexión a la mainnet**.
:::

## Billetera Keplr

Keplr es la billetera recomendada para transacciones nativas de QoreChain, staking y gobernanza.

### Añadir QoreChain como cadena personalizada

Abre Keplr y ve a **Settings > Add Custom Chain**, luego introduce:

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

Tras añadir la cadena, Keplr genera una dirección `qor1...` para tu cuenta. Usa esta dirección para recibir tokens QOR de testnet.

## MetaMask (EVM)

MetaMask permite interactuar con el entorno de ejecución EVM de QoreChain: desplegar contratos Solidity, gestionar tokens ERC-20 y usar las herramientas habituales de Ethereum.

### Añadir QoreChain como red personalizada

Abre MetaMask y ve a **Settings > Networks > Add Network**, luego introduce:

| Campo           | Valor                   |
| --------------- | ----------------------- |
| Network Name    | `QoreChain EVM`         |
| RPC URL         | `http://localhost:8545` |
| Chain ID        | `9800`                  |
| Currency Symbol | `QOR`                   |

Una vez conectado, puedes usar MetaMask para firmar transacciones EVM, interactuar con contratos inteligentes desplegados y gestionar tokens ERC-20 en QoreChain.

## Billeteras Solana (SVM)

El entorno de ejecución SVM de QoreChain es compatible con las herramientas estándar de Solana. Conecta cualquier billetera o biblioteca compatible con Solana para interactuar con programas SVM.

### Uso de @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Esto permite desplegar e interactuar con programas SVM que se ejecutan en QoreChain.

## Billeteras habilitadas para PQC (obligatorias en la ruta Cosmos)

QoreChain requiere criptografía poscuántica (PQC) híbrida en la ruta de transacciones cosmos. A partir de la versión actual de la cadena (**v3.1.77**), el valor predeterminado de la red es `hybrid_signature_mode = required` con `allow_classical_fallback = false`, de modo que **toda transacción de la ruta cosmos debe llevar una firma ML-DSA-87 (Dilithium-5) junto con la firma estándar secp256k1 (ECDSA)**. Las transacciones cosmos solo clásicas desde una cuenta PQC se rechazan.

:::caution Las txs de cosmos requieren la extensión híbrida PQC
Enviar una transacción clásica simple en la ruta cosmos será rechazado. Debes adjuntar la firma Dilithium-5 como una extensión de transacción `PQCHybridSignature`. Las herramientas estándar de CosmJS / Keplr no producen esta extensión por sí solas: usa el comando CLI `qorechaind tx pqc cosign`, la firma híbrida del SDK de QoreChain (ver más abajo) o, para construirla tú mismo en código, la biblioteca de código abierto [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Las únicas excepciones son las gentxs de génesis y las transacciones de registro/migración de claves PQC.
:::

### Cómo funciona

Las billeteras adjuntan una firma PQC ML-DSA-87 como extensión de transacción junto con la firma estándar secp256k1 (ECDSA). La firma clásica se calcula sobre bytes de firma que excluyen la extensión, por lo que sigue siendo válida para la verificación clásica mientras que la firma PQC proporciona resistencia cuántica.

### Generar una clave Dilithium-5

Genera una clave poscuántica para la firma híbrida:

```bash
qorechaind tx pqc gen-key
```

### Registro automático

Cuando incluyes una clave pública PQC en tu primera transacción, QoreChain la registra automáticamente on-chain. No se necesita un paso de registro independiente. (Las transacciones de registro/migración de claves PQC están a su vez exentas del requisito híbrido, de modo que una cuenta puede inicializar su primera clave.)

### Firma híbrida con el SDK

El SDK de QoreChain produce transacciones cosmos conformes mediante `buildHybridTx` con `includePqcPublicKey: true`, que adjunta la extensión Dilithium-5 e incorpora la clave pública para el registro automático. Consulta [Cuentas y firma PQC del SDK](/sdk/concepts/accounts-pqc).

### Modos PQC

Los tres modos de aplicación siguen siendo controlados por gobernanza; el **valor predeterminado actual de la red es Required**:

| Modo                   | Descripción                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | La verificación PQC está desactivada. Solo firmas estándar.             |
| **Optional**           | Las transacciones pueden incluir firmas PQC. Si están presentes, se verifican. |
| **Required** (predeterminado) | Todas las transacciones de la ruta cosmos deben incluir una firma PQC válida. |

El modo activo se configura a nivel de cadena y puede actualizarse mediante gobernanza.

:::note EVM / MetaMask no se ve afectado
El flujo de MetaMask (EVM) anterior **no** se ve afectado por el requisito híbrido. Las transacciones EVM usan una ruta ante `eth_secp256k1` independiente y nunca necesitan la extensión PQC.
:::

## Billetera CLI

El binario `qorechaind` incluye un sistema integrado de gestión de claves para uso en línea de comandos.

### Crear una nueva clave

```bash
qorechaind keys add mykey
```

Esto genera un nuevo par de claves y muestra la frase mnemónica. **Guarda la mnemónica de forma segura**: es la única manera de recuperar esta clave.

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
