---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — Namespace eth_
sidebar_label: JSON-RPC — Namespace eth_
sidebar_position: 3
---

# JSON-RPC — Namespace eth_

QoreChain implementa un'interfaccia JSON-RPC pienamente compatibile con l'EVM, consentendo agli strumenti standard di Ethereum (MetaMask, Hardhat, Foundry, ethers.js, web3.js) di interagire con la chain senza modifiche.

## Connessione

| Trasporto | Indirizzo predefinito   |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
L'interfaccia JSON-RPC dell'EVM è servita dalla mainnet **`qorechain-vladi`** (EVM chain ID **9801**, esadecimale `0x2649`, attiva sulla versione di chain **v3.1.82**) e dalla testnet **`qorechain-diana`** (EVM chain ID **9800**, esadecimale `0x2648`). Gli indirizzi locali sopra indicati si riferiscono a un nodo che gestisci tu stesso; per l'accesso remoto sostituisci l'endpoint mainnet o testnet del tuo provider.
:::

## Namespace supportati

| Namespace | Descrizione                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | Metodi JSON-RPC fondamentali di Ethereum                                                                       |
| `web3_`   | Metodi di utilità (versione del client, hashing)                                                               |
| `net_`    | Metodi di stato della rete                                                                                     |
| `txpool_` | Ispezione del pool delle transazioni                                                                           |
| `qor_`    | Estensioni specifiche di QoreChain (vedi [Namespace qor_](/api-reference/json-rpc-qor_-namespace))             |

## Metodi eth_

| Metodo                      | Parametri                                        | Descrizione                                          |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `eth_blockNumber`           | nessuno                                           | Restituisce il numero dell'ultimo blocco            |
| `eth_getBalance`            | `address`, `blockNumber`                         | Restituisce il saldo di un indirizzo in wei         |
| `eth_getTransactionCount`   | `address`, `blockNumber`                         | Restituisce il nonce (conteggio transazioni) per un indirizzo |
| `eth_sendRawTransaction`    | `signedTxData`                                   | Invia una transazione firmata per la diffusione     |
| `eth_call`                  | `callObject`, `blockNumber`                      | Esegue una chiamata in sola lettura sull'EVM        |
| `eth_estimateGas`           | `callObject`                                     | Stima il gas richiesto per una transazione          |
| `eth_getBlockByNumber`      | `blockNumber`, `fullTx` (bool)                   | Restituisce i dati di un blocco per numero          |
| `eth_getTransactionByHash`  | `txHash`                                         | Restituisce i dati di una transazione per hash      |
| `eth_getTransactionReceipt` | `txHash`                                         | Restituisce la ricevuta di una transazione minata   |
| `eth_getLogs`               | `filterObject`                                   | Restituisce i log corrispondenti a un filtro        |
| `eth_chainId`               | nessuno                                           | Restituisce il chain ID (codificato in esadecimale) |
| `eth_gasPrice`              | nessuno                                           | Restituisce il prezzo corrente del gas in wei       |
| `eth_feeHistory`            | `blockCount`, `newestBlock`, `rewardPercentiles` | Restituisce i dati storici delle commissioni (EIP-1559) |

## Metodi web3_

| Metodo               | Parametri    | Descrizione                              |
| -------------------- | ------------ | ---------------------------------------- |
| `web3_clientVersion` | nessuno      | Restituisce la stringa di versione del client |
| `web3_sha3`          | `data` (hex) | Restituisce l'hash Keccak-256 dell'input |

## Metodi net_

| Metodo          | Parametri | Descrizione                                 |
| --------------- | --------- | ------------------------------------------- |
| `net_version`   | nessuno   | Restituisce l'ID della rete                 |
| `net_listening` | nessuno   | Restituisce `true` se il nodo è in ascolto  |
| `net_peerCount` | nessuno   | Restituisce il numero di peer connessi (hex) |

## Configurazione

Abilita e configura il server JSON-RPC in `app.toml`:

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

## Esempi

### eth_blockNumber

Richiesta:

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

Risposta:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x53b35"
}
```

### eth_chainId

Richiesta:

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

Risposta (mainnet `qorechain-vladi`, chain ID 9801):

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": "0x2649"
}
```

Sulla testnet `qorechain-diana` (chain ID 9800) questo metodo restituisce `"0x2648"`.

### eth_getBalance

Richiesta:

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

Risposta:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": "0x56bc75e2d63100000"
}
```

## Connessione con ethers.js

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

- Il chain ID viene restituito come stringa esadecimale. Convertilo in decimale per la configurazione del wallet — `0x2649` è **9801** (mainnet), `0x2648` è **9800** (testnet).
- La determinazione del prezzo del gas segue il modello EIP-1559. Usa `eth_feeHistory` per la stima della base fee e della priority fee.
- Tag di blocco accettati: `"latest"`, `"earliest"`, `"pending"`, oppure un numero di blocco in esadecimale.
- Limitazioni dei filtri: `eth_getLogs` è limitato a `filter-cap` risultati per query (predefinito 10.000). Usa intervalli di blocchi più ristretti per dataset di grandi dimensioni.

:::
