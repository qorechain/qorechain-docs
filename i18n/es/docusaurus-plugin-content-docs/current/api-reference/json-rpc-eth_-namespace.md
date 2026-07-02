---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — Espacio de nombres eth_
sidebar_label: JSON-RPC — Espacio de nombres eth_
sidebar_position: 3
---

# JSON-RPC — Espacio de nombres eth_

QoreChain implementa una interfaz JSON-RPC totalmente compatible con la EVM, lo que permite que las herramientas estándar de Ethereum (MetaMask, Hardhat, Foundry, ethers.js, web3.js) interactúen con la cadena sin modificaciones.

## Conexión

| Transporte | Dirección predeterminada |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
La interfaz JSON-RPC de la EVM la sirve la red principal **`qorechain-vladi`** (EVM chain ID **9801**, hex `0x2649`, activa en la versión de cadena **v3.1.82**) y la red de pruebas **`qorechain-diana`** (EVM chain ID **9800**, hex `0x2648`). Las direcciones locales anteriores se aplican a un nodo que ejecutes tú mismo; sustituye el endpoint de red principal o de pruebas de tu proveedor para el acceso remoto.
:::

## Espacios de nombres compatibles

| Espacio de nombres | Descripción                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | Métodos principales de JSON-RPC de Ethereum                                                                    |
| `web3_`   | Métodos de utilidad (versión del cliente, hashing)                                                             |
| `net_`    | Métodos de estado de la red                                                                                    |
| `txpool_` | Inspección del pool de transacciones                                                                           |
| `qor_`    | Extensiones específicas de QoreChain (consulta [Espacio de nombres qor_](/api-reference/json-rpc-qor_-namespace)) |

## Métodos eth_

| Método                      | Parámetros                                       | Descripción                                          |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `eth_blockNumber`           | ninguno                                          | Devuelve el número del bloque más reciente            |
| `eth_getBalance`            | `address`, `blockNumber`                         | Devuelve el saldo de una dirección en wei            |
| `eth_getTransactionCount`   | `address`, `blockNumber`                         | Devuelve el nonce (recuento de transacciones) de una dirección |
| `eth_sendRawTransaction`    | `signedTxData`                                   | Envía una transacción firmada para su difusión        |
| `eth_call`                  | `callObject`, `blockNumber`                      | Ejecuta una llamada de solo lectura contra la EVM     |
| `eth_estimateGas`           | `callObject`                                     | Estima el gas necesario para una transacción          |
| `eth_getBlockByNumber`      | `blockNumber`, `fullTx` (bool)                   | Devuelve los datos de un bloque por número            |
| `eth_getTransactionByHash`  | `txHash`                                         | Devuelve los datos de una transacción por hash        |
| `eth_getTransactionReceipt` | `txHash`                                         | Devuelve el recibo de una transacción minada          |
| `eth_getLogs`               | `filterObject`                                   | Devuelve los logs que coinciden con un filtro         |
| `eth_chainId`               | ninguno                                          | Devuelve el chain ID (codificado en hex)              |
| `eth_gasPrice`              | ninguno                                          | Devuelve el precio actual del gas en wei              |
| `eth_feeHistory`            | `blockCount`, `newestBlock`, `rewardPercentiles` | Devuelve datos históricos de comisiones (EIP-1559)    |

## Métodos web3_

| Método               | Parámetros   | Descripción                              |
| -------------------- | ------------ | ---------------------------------------- |
| `web3_clientVersion` | ninguno      | Devuelve la cadena de versión del cliente |
| `web3_sha3`          | `data` (hex) | Devuelve el hash Keccak-256 de la entrada |

## Métodos net_

| Método          | Parámetros | Descripción                                 |
| --------------- | ---------- | ------------------------------------------- |
| `net_version`   | ninguno    | Devuelve el ID de red                       |
| `net_listening` | ninguno    | Devuelve `true` si el nodo está escuchando  |
| `net_peerCount` | ninguno    | Devuelve el número de pares conectados (hex) |

## Configuración

Habilita y configura el servidor JSON-RPC en `app.toml`:

```toml
[json-rpc]
# Enable the JSON-RPC server
enable = true

# HTTP server address
address = "0.0.0.0:8545"

# WebSocket server address
ws-address = "0.0.0.0:8546"

# Enabled API namespaces
api = "eth,web3,net,txpool,qor"

# Maximum number of logs returned by eth_getLogs
filter-cap = 10000

# Maximum gas for eth_call and eth_estimateGas
gas-cap = 25000000

# EVM execution timeout
evm-timeout = "5s"

# Transaction fee cap (in QOR)
txfee-cap = 1

# Maximum open WebSocket connections
max-open-connections = 0
```

## Ejemplos

### eth_blockNumber

Solicitud:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }'
```

Respuesta:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x53b35"
}
```

### eth_chainId

Solicitud:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_chainId",
    "params": [],
    "id": 2
  }'
```

Respuesta (red principal `qorechain-vladi`, chain ID 9801):

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": "0x2649"
}
```

En la red de pruebas `qorechain-diana` (chain ID 9800) este método devuelve `"0x2648"`.

### eth_getBalance

Solicitud:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28", "latest"],
    "id": 3
  }'
```

Respuesta:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": "0x56bc75e2d63100000"
}
```

## Conexión con ethers.js

```javascript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get latest block
const block = await provider.getBlockNumber();
console.log("Latest block:", block);

// Get balance
const balance = await provider.getBalance("0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28");
console.log("Balance:", ethers.formatEther(balance), "QOR");
```

:::info

- El chain ID se devuelve como una cadena hex. Conviértelo a decimal para configurar la billetera — `0x2649` es **9801** (red principal), `0x2648` es **9800** (red de pruebas).
- La fijación de precios del gas sigue el modelo EIP-1559. Usa `eth_feeHistory` para estimar la comisión base y la comisión de prioridad.
- Etiquetas de bloque aceptadas: `"latest"`, `"earliest"`, `"pending"`, o un número de bloque en hex.
- Limitaciones de filtro: `eth_getLogs` está limitado a `filter-cap` resultados por consulta (predeterminado 10.000). Usa rangos de bloques más reducidos para conjuntos de datos grandes.

:::
