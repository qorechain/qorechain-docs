---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Solana-Compatible
sidebar_label: JSON-RPC — Solana-Compatible
sidebar_position: 4
---

# JSON-RPC — Solana-Compatible

QoreChain provides a Solana-compatible JSON-RPC interface through its SVM (Solana Virtual Machine) runtime, enabling existing Solana tooling and SDKs to interact with QoreChain natively.

## Connection

| Transport | Default Address           |
| --------- | ------------------------- |
| HTTP      | `http://127.0.0.1:8899`   |

The JSON-RPC server is **started by `qorechaind start`** and is **enabled by default**, listening on `127.0.0.1:8899`. It is configured via a `[svm-rpc]` section in `app.toml` (`enable` + `address`). A freshly started node already serves this interface — no extra process is required.

:::note
The Solana-compatible JSON-RPC interface is served on port **8899** by both the **`qorechain-vladi`** mainnet (live on chain version **v3.1.77**) and the **`qorechain-diana`** testnet. The local address above applies to a node you run yourself; substitute your provider's mainnet or testnet endpoint for remote access.
:::

---

## Methods

| Method                              | Parameters               | Description                                                    |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (base58 string) | Returns account data, owner, lamports, and executable flag     |
| `getBalance`                        | `pubkey` (base58 string) | Returns the balance in lamports for the given public key       |
| `getSlot`                           | none                     | Returns the current slot number                                |
| `getMinimumBalanceForRentExemption` | `dataLength` (integer)   | Returns the minimum balance for rent exemption given data size |
| `getVersion`                        | none                     | Returns the node software version                              |
| `getHealth`                         | none                     | Returns node health status (`"ok"` if healthy)                 |

---

## Response Format

All responses follow the JSON-RPC 2.0 specification. Responses that reference on-chain state include a `context` object with the current `slot`:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": { ... }
  }
}
```

---

## Examples

### getAccountInfo

**Request:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getAccountInfo",
    "params": [
      "4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T",
      { "encoding": "base64" }
    ],
    "id": 1
  }'
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": {
      "data": ["AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", "base64"],
      "executable": false,
      "lamports": 1000000000,
      "owner": "11111111111111111111111111111111",
      "rentEpoch": 0
    }
  }
}
```

### getBalance

**Request:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T"],
    "id": 2
  }'
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": 1000000000
  }
}
```

### getVersion

**Request:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getVersion",
    "params": [],
    "id": 3
  }'
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "solana-core": "1.18.0-qorechain",
    "feature-set": 1
  }
}
```

The version string `1.18.0-qorechain` indicates compatibility with the Solana 1.18.0 RPC interface running on the QoreChain SVM runtime.

---

## @solana/web3.js Integration

Existing Solana applications can connect to QoreChain by pointing the `Connection` object to the local SVM endpoint:

```javascript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");

// Check version
const version = await connection.getVersion();
console.log("Node version:", version["solana-core"]);

// Get balance
const pubkey = new PublicKey("4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T");
const balance = await connection.getBalance(pubkey);
console.log("Balance:", balance / LAMPORTS_PER_SOL);

// Get slot
const slot = await connection.getSlot();
console.log("Current slot:", slot);

// Get account info
const accountInfo = await connection.getAccountInfo(pubkey);
if (accountInfo) {
  console.log("Owner:", accountInfo.owner.toBase58());
  console.log("Executable:", accountInfo.executable);
  console.log("Data length:", accountInfo.data.length);
}
```

---

## Notes

- **Address format**: SVM accounts use base58-encoded public keys (standard Solana format), not the `qor1` Bech32 prefix used by the native Cosmos SDK modules.
- **Cross-VM bridging**: To move assets between EVM and SVM runtimes, use the Cross-VM module (`x/crossvm`). See the [Transaction Commands](/cli-reference/transaction-commands) for `crossvm call` syntax.
- **Program deployment**: Deploy BPF programs via the CLI (`qorechaind tx svm deploy-program`) or programmatically through the SVM runtime.
- **Compute budget**: The SVM runtime enforces a compute budget of 1,400,000 compute units per transaction by default. This is configurable via module parameters.
