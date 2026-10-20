---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — eth_ Namespace
sidebar_label: JSON-RPC — eth_ Namespace
sidebar_position: 3
---

# JSON-RPC — eth_ Namespace

QoreChain implements an EVM-compatible JSON-RPC interface, so standard Ethereum tooling (MetaMask, Hardhat, Foundry, ethers.js, web3.js) can read chain state and estimate gas without modification. **Sending a transaction from the EVM lane needs one extra step** since chain version v3.2.0: the sending account must have a registered post-quantum key and an open EVM authorisation window (see [Sending transactions](#sending-transactions)).

## Connection

| Transport | Default Address         |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
The EVM JSON-RPC interface is served by the **`qorechain-vladi`** mainnet (EVM chain ID **9801**, hex `0x2649`, node release **v3.2.3**, live since 7 June 2026; v3.2.4 from height 3,742,566) and the **`qorechain-diana`** testnet (EVM chain ID **9800**, hex `0x2648`, node release **v3.2.4** since 19 October 2026). The local addresses above apply to a node you run yourself. The public HTTP endpoints are `https://evm.qore.host` (mainnet) and `https://evm-testnet.qore.host` (testnet), listed in [Networks](/appendix/networks#public-endpoints). The only public EVM WebSocket is the testnet's (`wss://evm-ws-testnet.qore.host`); there is no public mainnet EVM WebSocket.
:::

## Supported Namespaces

| Namespace | Description                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | Core Ethereum JSON-RPC methods                                                                                 |
| `web3_`   | Utility methods (client version, hashing)                                                                      |
| `net_`    | Network status methods                                                                                         |
| `txpool_` | Transaction pool inspection                                                                                    |
| `rpc_`    | Server introspection (`rpc_modules`)                                                                           |

## eth_ Methods

| Method                      | Parameters                                       | Description                                          |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `eth_blockNumber`           | none                                             | Returns the latest block number                      |
| `eth_getBalance`            | `address`, `blockNumber`                         | Returns the balance of an address in wei             |
| `eth_getTransactionCount`   | `address`, `blockNumber`                         | Returns the nonce (transaction count) for an address |
| `eth_sendRawTransaction`    | `signedTxData`                                   | Submits a signed transaction for broadcast           |
| `eth_call`                  | `callObject`, `blockNumber`                      | Executes a read-only call against the EVM            |
| `eth_estimateGas`           | `callObject`                                     | Estimates the gas required for a transaction         |
| `eth_getBlockByNumber`      | `blockNumber`, `fullTx` (bool)                   | Returns block data by number                         |
| `eth_getTransactionByHash`  | `txHash`                                         | Returns transaction data by hash                     |
| `eth_getTransactionReceipt` | `txHash`                                         | Returns the receipt for a mined transaction          |
| `eth_getLogs`               | `filterObject`                                   | Returns logs matching a filter                       |
| `eth_chainId`               | none                                             | Returns the chain ID (hex-encoded)                   |
| `eth_gasPrice`              | none                                             | Returns the current gas price in wei                 |
| `eth_feeHistory`            | `blockCount`, `newestBlock`, `rewardPercentiles` | Returns historical fee data (EIP-1559)               |
| `eth_getBlockByHash`        | `blockHash`, `fullTx` (bool)                     | Returns block data by hash                           |
| `eth_getCode`               | `address`, `blockNumber`                         | Returns contract bytecode                            |
| `eth_getStorageAt`          | `address`, `slot`, `blockNumber`                 | Returns a storage slot                               |
| `eth_getBlockReceipts`      | `blockNumber`                                    | Returns all receipts of a block                      |
| `eth_getProof`              | `address`, `storageKeys`, `blockNumber`          | Returns an account proof                             |
| `eth_createAccessList`      | `callObject`, `blockNumber`                      | Builds an access list for a call                     |
| `eth_maxPriorityFeePerGas`  | none                                             | Returns the suggested priority fee (wei)             |
| `eth_syncing`               | none                                             | Returns `false` when the node is caught up           |
| `eth_newFilter`, `eth_newBlockFilter`, `eth_getFilterChanges` | filter object / filter id | Polling filters                              |

## web3_ Methods

| Method               | Parameters   | Description                              |
| -------------------- | ------------ | ---------------------------------------- |
| `web3_clientVersion` | none         | Returns the client version string        |
| `web3_sha3`          | `data` (hex) | Returns the Keccak-256 hash of the input |

## txpool_ Methods

| Method           | Parameters | Description                                                         |
| ---------------- | ---------- | ------------------------------------------------------------------- |
| `txpool_status`  | none       | Returns the number of pending and queued transactions               |
| `txpool_content` | none       | Returns the pending and queued transactions (not on the public endpoints) |
| `txpool_inspect` | none       | Returns a summary of the pool (not on the public endpoints)         |

## net_ Methods

| Method          | Parameters | Description                                 |
| --------------- | ---------- | ------------------------------------------- |
| `net_version`   | none       | Returns the network ID                      |
| `net_listening` | none       | Returns `true` if the node is listening     |
| `net_peerCount` | none       | Returns the number of connected peers (hex) |

## Configuration

Enable and configure the JSON-RPC server in `app.toml`:

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

## Limits on the public endpoints {#public-limits}

:::note
- `eth_getLogs` accepts at most **10,000 blocks** between `fromBlock` and `toBlock`. A wider range returns `{"code":-32000,"message":"maximum [from, to] blocks distance: 10000"}`. Query in windows of 10,000 blocks or fewer. The separate `filter-cap` setting limits the number of logs returned.
- `txpool_status` works on the public endpoints. `txpool_content` and `txpool_inspect` are disabled on both the public mainnet and the public testnet endpoint (they work on a node you run yourself, with `txpool` in its `api` list).
- `debug_*` methods and `eth_signTransaction` are not available.
- `eth_subscribe` needs a WebSocket connection. Over HTTP it returns `-32601 notifications not supported`. See [WebSocket Events](/api-reference/websocket-events).
- State at old heights is pruned on the public endpoints, so `eth_call` against a distant historical block can fail with a state-version error.
- If a script gets `403 Forbidden`, set an explicit `User-Agent` header; Python's default `urllib` agent is blocked, while `requests`, `curl`, Node and Go clients work as-is.
:::

## Sending transactions {#sending-transactions}

:::caution The EVM lane needs a PQC key and an open window
Since chain version v3.2.0 the EVM lane admits a transaction (`MsgEthereumTx`, including contract deployments) only from an account that has a **registered post-quantum key** and an **open EVM authorisation window**. A plain EVM wallet that has not done this setup cannot submit transactions: the node refuses them with a `pqc` module error (codes 26, 27 or 28) instead of including them. Reading balances, calling `eth_call` and estimating gas need no window. Since v3.2.2 a transaction signed **without a chain id** (pre-EIP-155) is refused as well, and since v3.2.3 a window can be scoped to plain QOR transfers (`native_only`) or to listed recipients (`allowed_targets`); a transaction outside the scope is refused with code 27.

Check an account before sending:

- `GET /qorechain/pqc/v1/account/{address}` (`found: true` means a key is registered)
- `GET /qorechain/pqc/v1/evm_window/{address}` (`live: true` means a window currently admits transactions)

Both are described in [REST / gRPC Endpoints](/api-reference/rest-grpc-endpoints#pqc-module) (the window response also reports `native_only` and `allowed_targets`). A window is opened with a QoreChain transaction (`MsgOpenEVMWindow`, bounded to at most 17,280 blocks and 1,000 transactions plus a value cap), not with an Ethereum transaction. See [EVM Development](/developer-guide/evm-development) for the lane overview.
:::

## Examples

### eth_blockNumber

Request:

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

Response:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x37f559"
}
```

### eth_chainId

Request:

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

Response (mainnet `qorechain-vladi`, chain ID 9801):

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": "0x2649"
}
```

On the `qorechain-diana` testnet (chain ID 9800) this method returns `"0x2648"`.

### eth_getBalance

Request:

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

Response:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": "0x56bc75e2d63100000"
}
```

## Connecting with ethers.js

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

- Chain ID is returned as a hex string. Convert to decimal for wallet configuration — `0x2649` is **9801** (mainnet), `0x2648` is **9800** (testnet).
- Gas pricing follows the EIP-1559 model. Use `eth_feeHistory` for base fee and priority fee estimation.
- Block tags accepted: `"latest"`, `"earliest"`, `"pending"`, or a hex block number.
- Filter limitations: `eth_getLogs` is capped at `filter-cap` results per query (default 10,000), and the public endpoints reject ranges wider than 10,000 blocks. Use narrower block ranges for large datasets.

:::
