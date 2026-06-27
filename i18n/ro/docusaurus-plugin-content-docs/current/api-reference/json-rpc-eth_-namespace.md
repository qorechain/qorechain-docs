---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — Spațiul de nume eth_
sidebar_label: JSON-RPC — Spațiul de nume eth_
sidebar_position: 3
---

# JSON-RPC — Spațiul de nume eth_

QoreChain implementează o interfață JSON-RPC complet compatibilă cu EVM, permițând instrumentelor standard Ethereum (MetaMask, Hardhat, Foundry, ethers.js, web3.js) să interacționeze cu lanțul fără modificări.

## Conexiune

| Transport | Adresă implicită        |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
Interfața JSON-RPC EVM este servită de mainnet-ul **`qorechain-vladi`** (EVM chain ID **9801**, hex `0x2649`, activ pe versiunea de lanț **v3.1.77**) și de testnet-ul **`qorechain-diana`** (EVM chain ID **9800**, hex `0x2648`). Adresele locale de mai sus se aplică unui nod pe care îl rulezi tu însuți; înlocuiește-le cu endpoint-ul de mainnet sau testnet al furnizorului tău pentru acces la distanță.
:::

## Spații de nume acceptate

| Spațiu de nume | Descriere                                                                                                      |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | Metode JSON-RPC Ethereum de bază                                                                               |
| `web3_`   | Metode utilitare (versiunea clientului, hashing)                                                               |
| `net_`    | Metode de stare a rețelei                                                                                      |
| `txpool_` | Inspecția pool-ului de tranzacții                                                                              |
| `qor_`    | Extensii specifice QoreChain (vezi [Spațiul de nume qor_](/api-reference/json-rpc-qor_-namespace))            |

## Metode eth_

| Metodă                      | Parametri                                        | Descriere                                            |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `eth_blockNumber`           | niciunul                                         | Returnează cel mai recent număr de bloc              |
| `eth_getBalance`            | `address`, `blockNumber`                         | Returnează soldul unei adrese în wei                 |
| `eth_getTransactionCount`   | `address`, `blockNumber`                         | Returnează nonce-ul (numărul de tranzacții) pentru o adresă |
| `eth_sendRawTransaction`    | `signedTxData`                                   | Trimite o tranzacție semnată pentru difuzare         |
| `eth_call`                  | `callObject`, `blockNumber`                      | Execută un apel read-only împotriva EVM              |
| `eth_estimateGas`           | `callObject`                                     | Estimează gas-ul necesar pentru o tranzacție         |
| `eth_getBlockByNumber`      | `blockNumber`, `fullTx` (bool)                   | Returnează datele unui bloc după număr               |
| `eth_getTransactionByHash`  | `txHash`                                         | Returnează datele unei tranzacții după hash          |
| `eth_getTransactionReceipt` | `txHash`                                         | Returnează chitanța pentru o tranzacție minată       |
| `eth_getLogs`               | `filterObject`                                   | Returnează jurnalele care corespund unui filtru      |
| `eth_chainId`               | niciunul                                         | Returnează ID-ul lanțului (codat în hex)             |
| `eth_gasPrice`              | niciunul                                         | Returnează prețul curent al gas-ului în wei          |
| `eth_feeHistory`            | `blockCount`, `newestBlock`, `rewardPercentiles` | Returnează date istorice despre taxe (EIP-1559)      |

## Metode web3_

| Metodă               | Parametri    | Descriere                                |
| -------------------- | ------------ | ---------------------------------------- |
| `web3_clientVersion` | niciunul     | Returnează șirul cu versiunea clientului |
| `web3_sha3`          | `data` (hex) | Returnează hash-ul Keccak-256 al intrării |

## Metode net_

| Metodă          | Parametri  | Descriere                                   |
| --------------- | ---------- | ------------------------------------------- |
| `net_version`   | niciunul   | Returnează ID-ul rețelei                    |
| `net_listening` | niciunul   | Returnează `true` dacă nodul ascultă        |
| `net_peerCount` | niciunul   | Returnează numărul de peers conectați (hex) |

## Configurare

Activează și configurează serverul JSON-RPC în `app.toml`:

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

## Exemple

### eth_blockNumber

Cerere:

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

Răspuns:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x53b35"
}
```

### eth_chainId

Cerere:

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

Răspuns (mainnet `qorechain-vladi`, chain ID 9801):

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": "0x2649"
}
```

Pe testnet-ul `qorechain-diana` (chain ID 9800) această metodă returnează `"0x2648"`.

### eth_getBalance

Cerere:

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

Răspuns:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": "0x56bc75e2d63100000"
}
```

## Conectarea cu ethers.js

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

- Chain ID-ul este returnat ca șir hex. Convertește-l în zecimal pentru configurarea portofelului — `0x2649` este **9801** (mainnet), `0x2648` este **9800** (testnet).
- Stabilirea prețului gas-ului urmează modelul EIP-1559. Folosește `eth_feeHistory` pentru estimarea taxei de bază și a taxei prioritare.
- Etichete de bloc acceptate: `"latest"`, `"earliest"`, `"pending"` sau un număr de bloc în hex.
- Limitări ale filtrului: `eth_getLogs` este plafonat la `filter-cap` rezultate per interogare (implicit 10.000). Folosește intervale de blocuri mai înguste pentru seturi mari de date.

:::
