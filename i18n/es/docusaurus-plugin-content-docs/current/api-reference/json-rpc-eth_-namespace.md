---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — Espacio de nombres eth_
sidebar_label: JSON-RPC — Espacio de nombres eth_
sidebar_position: 3
---

# JSON-RPC — Espacio de nombres eth_

QoreChain implementa una interfaz JSON-RPC compatible con EVM, de modo que las herramientas estándar de Ethereum (MetaMask, Hardhat, Foundry, ethers.js, web3.js) pueden leer el estado de la cadena y estimar el gas sin modificaciones. **Enviar una transacción desde la lane EVM requiere un paso adicional** desde la versión de cadena v3.2.0: la cuenta emisora debe tener una clave poscuántica registrada y una ventana de autorización EVM abierta (consulta [Envío de transacciones](#sending-transactions)).

## Conexión

| Transporte | Dirección predeterminada |
| ---------- | ------------------------ |
| HTTP       | `http://localhost:8545`  |
| WebSocket  | `ws://localhost:8546`    |

:::note
La interfaz JSON-RPC de la EVM la sirven la mainnet **`qorechain-vladi`** (ID de cadena EVM **9801**, hex `0x2649`, versión de nodo **v3.2.5** desde el 29 de octubre de 2026 en la altura 3.906.833, en funcionamiento desde el 7 de junio de 2026) y la testnet **`qorechain-diana`** (ID de cadena EVM **9800**, hex `0x2648`, versión de nodo **v3.2.6** desde el 27 de octubre de 2026). Las direcciones locales anteriores se aplican a un nodo que ejecutes tú mismo. Los endpoints HTTP públicos son `https://evm.qore.host` (mainnet) y `https://evm-testnet.qore.host` (testnet), que figuran en [Redes](/appendix/networks#public-endpoints). El único WebSocket EVM público es el de la testnet (`wss://evm-ws-testnet.qore.host`); no hay un WebSocket EVM público en la mainnet.
:::

## Espacios de nombres compatibles

| Espacio de nombres | Descripción                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| `eth_`               | Métodos JSON-RPC principales de Ethereum                                                                 |
| `web3_`              | Métodos de utilidad (versión del cliente, hashing)                                                       |
| `net_`               | Métodos de estado de la red                                                                              |
| `txpool_`            | Inspección del pool de transacciones                                                                     |
| `rpc_`               | Introspección del servidor (`rpc_modules`)                                                               |

## Métodos eth_

| Método                       | Parámetros                                        | Descripción                                                  |
| ---------------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| `eth_blockNumber`            | ninguno                                            | Devuelve el número del último bloque                          |
| `eth_getBalance`             | `address`, `blockNumber`                           | Devuelve el saldo de una dirección en wei                     |
| `eth_getTransactionCount`    | `address`, `blockNumber`                           | Devuelve el nonce (número de transacciones) de una dirección  |
| `eth_sendRawTransaction`     | `signedTxData`                                     | Envía una transacción firmada para su difusión                |
| `eth_call`                   | `callObject`, `blockNumber`                        | Ejecuta una llamada de solo lectura contra la EVM              |
| `eth_estimateGas`            | `callObject`                                       | Estima el gas necesario para una transacción                  |
| `eth_getBlockByNumber`       | `blockNumber`, `fullTx` (bool)                     | Devuelve los datos de un bloque por número                    |
| `eth_getTransactionByHash`   | `txHash`                                           | Devuelve los datos de una transacción por hash                |
| `eth_getTransactionReceipt`  | `txHash`                                           | Devuelve el recibo de una transacción minada                  |
| `eth_getLogs`                | `filterObject`                                     | Devuelve los logs que coinciden con un filtro                 |
| `eth_chainId`                | ninguno                                            | Devuelve el ID de cadena (codificado en hex)                   |
| `eth_gasPrice`               | ninguno                                            | Devuelve el precio de gas actual en wei                       |
| `eth_feeHistory`             | `blockCount`, `newestBlock`, `rewardPercentiles`   | Devuelve el historial de tarifas (EIP-1559)                    |
| `eth_getBlockByHash`         | `blockHash`, `fullTx` (bool)                       | Devuelve los datos de un bloque por hash                      |
| `eth_getCode`                | `address`, `blockNumber`                           | Devuelve el bytecode de un contrato                           |
| `eth_getStorageAt`           | `address`, `slot`, `blockNumber`                   | Devuelve un slot de almacenamiento                            |
| `eth_getBlockReceipts`       | `blockNumber`                                      | Devuelve todos los recibos de un bloque                       |
| `eth_getProof`               | `address`, `storageKeys`, `blockNumber`            | Devuelve una prueba de cuenta                                 |
| `eth_createAccessList`       | `callObject`, `blockNumber`                        | Construye una lista de acceso para una llamada                |
| `eth_maxPriorityFeePerGas`   | ninguno                                            | Devuelve la tarifa de prioridad sugerida (wei)                |
| `eth_syncing`                | ninguno                                            | Devuelve `false` cuando el nodo está al día                   |
| `eth_newFilter`, `eth_newBlockFilter`, `eth_getFilterChanges` | filter object / filter id | Filtros por sondeo (polling)                  |

## Métodos web3_

| Método                | Parámetros    | Descripción                                     |
| ---------------------- | -------------- | ------------------------------------------------ |
| `web3_clientVersion`   | ninguno        | Devuelve la cadena de versión del cliente        |
| `web3_sha3`            | `data` (hex)   | Devuelve el hash Keccak-256 de la entrada        |

## Métodos txpool_

| Método            | Parámetros | Descripción                                                                   |
| ------------------ | ----------- | ------------------------------------------------------------------------------- |
| `txpool_status`    | ninguno     | Devuelve el número de transacciones pendientes y en cola                       |
| `txpool_content`   | ninguno     | Devuelve las transacciones pendientes y en cola (no disponible en los endpoints públicos) |
| `txpool_inspect`   | ninguno     | Devuelve un resumen del pool (no disponible en los endpoints públicos)         |

## Métodos net_

| Método            | Parámetros | Descripción                                        |
| ------------------ | ----------- | ---------------------------------------------------- |
| `net_version`       | ninguno     | Devuelve el ID de red                                |
| `net_listening`     | ninguno     | Devuelve `true` si el nodo está escuchando           |
| `net_peerCount`     | ninguno     | Devuelve el número de peers conectados (hex)         |

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

# Enabled API namespaces (a node initialised by v3.2.3 or later defaults to "eth,net,web3";
# txpool is opt-in because it publishes the node's pending transactions)
api = "eth,web3,net,txpool"

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

## Límites de los endpoints públicos {#public-limits}

:::note
- `eth_getLogs` acepta como máximo **10,000 bloques** entre `fromBlock` y `toBlock`. Un rango más amplio devuelve `{"code":-32000,"message":"maximum [from, to] blocks distance: 10000"}`. Consulta en ventanas de 10,000 bloques o menos. El ajuste independiente `filter-cap` limita el número de logs devueltos.
- `txpool_status` funciona en los endpoints públicos. `txpool_content` y `txpool_inspect` están deshabilitados tanto en el endpoint público de la mainnet como en el de la testnet (funcionan en un nodo que ejecutes tú mismo, con `txpool` en su lista `api`).
- Los métodos `debug_*` y `eth_signTransaction` no están disponibles.
- `eth_subscribe` necesita una conexión WebSocket. Por HTTP devuelve `-32601 notifications not supported`. Consulta [Eventos WebSocket](/api-reference/websocket-events).
- El estado en alturas antiguas se poda en los endpoints públicos, por lo que `eth_call` contra un bloque histórico lejano puede fallar con un error de versión de estado.
- Si un script recibe `403 Forbidden`, establece una cabecera `User-Agent` explícita; el agente predeterminado de `urllib` de Python está bloqueado, mientras que los clientes `requests`, `curl`, Node y Go funcionan tal cual.
:::

## Envío de transacciones {#sending-transactions}

:::caution La lane EVM necesita una clave PQC y una ventana abierta
Desde la versión de cadena v3.2.0, la lane EVM admite una transacción (`MsgEthereumTx`, incluidos los despliegues de contratos) solo desde una cuenta que tenga una **clave poscuántica registrada** y una **ventana de autorización EVM abierta**. Una wallet EVM común que no haya hecho esta configuración no puede enviar transacciones: el nodo las rechaza con un error del módulo `pqc` (códigos 26, 27 o 28) en lugar de incluirlas. Leer saldos, llamar a `eth_call` y estimar gas no requieren ventana. Desde v3.2.2 también se rechaza una transacción firmada **sin ID de cadena** (pre-EIP-155), y desde v3.2.3 una ventana puede limitarse a transferencias simples de QOR (`native_only`) o a destinatarios listados (`allowed_targets`); una transacción fuera de ese alcance se rechaza con el código 27.

Comprueba una cuenta antes de enviar:

- `GET /qorechain/pqc/v1/account/{address}` (`found: true` significa que hay una clave registrada)
- `GET /qorechain/pqc/v1/evm_window/{address}` (`live: true` significa que una ventana admite transacciones en este momento)

Ambos se describen en [Endpoints REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module) (la respuesta de la ventana también informa `native_only` y `allowed_targets`). Una ventana se abre con una transacción de QoreChain (`MsgOpenEVMWindow`, limitada a un máximo de 17,280 bloques y 1,000 transacciones más un tope de valor), no con una transacción de Ethereum. Consulta [Desarrollo EVM](/developer-guide/evm-development) para la visión general de la lane.
:::

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
  "result": "0x37f559"
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

Respuesta (mainnet `qorechain-vladi`, ID de cadena 9801):

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": "0x2649"
}
```

En la testnet `qorechain-diana` (ID de cadena 9800), este método devuelve `"0x2648"`.

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

- El ID de cadena se devuelve como una cadena hexadecimal. Conviértelo a decimal para la configuración de la wallet — `0x2649` es **9801** (mainnet), `0x2648` es **9800** (testnet).
- La fijación del precio del gas sigue el modelo EIP-1559. Usa `eth_feeHistory` para estimar la tarifa base y la tarifa de prioridad.
- Etiquetas de bloque aceptadas: `"latest"`, `"earliest"`, `"pending"`, o un número de bloque en hex.
- Limitaciones de filtro: `eth_getLogs` está limitado a `filter-cap` resultados por consulta (predeterminado 10,000), y los endpoints públicos rechazan rangos de más de 10,000 bloques. Usa rangos de bloques más estrechos para conjuntos de datos grandes.

:::
