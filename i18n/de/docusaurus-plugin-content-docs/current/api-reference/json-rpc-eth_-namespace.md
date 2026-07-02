---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — eth_-Namespace
sidebar_label: JSON-RPC — eth_-Namespace
sidebar_position: 3
---

# JSON-RPC — eth_-Namespace

QoreChain implementiert eine vollständig EVM-kompatible JSON-RPC-Schnittstelle, die es Standard-Ethereum-Werkzeugen (MetaMask, Hardhat, Foundry, ethers.js, web3.js) ermöglicht, ohne Anpassungen mit der Chain zu interagieren.

## Verbindung

| Transport | Standardadresse         |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
Die EVM-JSON-RPC-Schnittstelle wird vom **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**, hex `0x2649`, live auf Chain-Version **v3.1.82**) und vom **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**, hex `0x2648`) bereitgestellt. Die obigen lokalen Adressen gelten für einen Node, den Sie selbst betreiben; ersetzen Sie für den Fernzugriff den Mainnet- oder Testnet-Endpunkt Ihres Anbieters.
:::

## Unterstützte Namespaces

| Namespace | Beschreibung                                                                                                   |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | Zentrale Ethereum-JSON-RPC-Methoden                                                                            |
| `web3_`   | Hilfsmethoden (Client-Version, Hashing)                                                                        |
| `net_`    | Methoden zum Netzwerkstatus                                                                                    |
| `txpool_` | Inspektion des Transaktionspools                                                                               |
| `qor_`    | QoreChain-spezifische Erweiterungen (siehe [qor_-Namespace](/api-reference/json-rpc-qor_-namespace))           |

## eth_-Methoden

| Methode                     | Parameter                                        | Beschreibung                                                  |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| `eth_blockNumber`           | keine                                            | Gibt die neueste Blocknummer zurück                          |
| `eth_getBalance`            | `address`, `blockNumber`                         | Gibt den Kontostand einer Adresse in Wei zurück             |
| `eth_getTransactionCount`   | `address`, `blockNumber`                         | Gibt die Nonce (Transaktionsanzahl) einer Adresse zurück    |
| `eth_sendRawTransaction`    | `signedTxData`                                   | Übermittelt eine signierte Transaktion zur Verbreitung      |
| `eth_call`                  | `callObject`, `blockNumber`                      | Führt einen schreibgeschützten Aufruf gegen die EVM aus     |
| `eth_estimateGas`           | `callObject`                                     | Schätzt das für eine Transaktion erforderliche Gas          |
| `eth_getBlockByNumber`      | `blockNumber`, `fullTx` (bool)                   | Gibt Blockdaten anhand der Nummer zurück                    |
| `eth_getTransactionByHash`  | `txHash`                                         | Gibt Transaktionsdaten anhand des Hashes zurück             |
| `eth_getTransactionReceipt` | `txHash`                                         | Gibt die Quittung für eine geminte Transaktion zurück       |
| `eth_getLogs`               | `filterObject`                                   | Gibt Logs zurück, die einem Filter entsprechen             |
| `eth_chainId`               | keine                                            | Gibt die Chain-ID zurück (hex-kodiert)                      |
| `eth_gasPrice`              | keine                                            | Gibt den aktuellen Gaspreis in Wei zurück                  |
| `eth_feeHistory`            | `blockCount`, `newestBlock`, `rewardPercentiles` | Gibt historische Gebührendaten zurück (EIP-1559)           |

## web3_-Methoden

| Methode              | Parameter    | Beschreibung                                  |
| -------------------- | ------------ | --------------------------------------------- |
| `web3_clientVersion` | keine        | Gibt die Client-Versionszeichenkette zurück  |
| `web3_sha3`          | `data` (hex) | Gibt den Keccak-256-Hash der Eingabe zurück  |

## net_-Methoden

| Methode         | Parameter | Beschreibung                                           |
| --------------- | --------- | ------------------------------------------------------ |
| `net_version`   | keine     | Gibt die Netzwerk-ID zurück                           |
| `net_listening` | keine     | Gibt `true` zurück, wenn der Node lauscht             |
| `net_peerCount` | keine     | Gibt die Anzahl der verbundenen Peers zurück (hex)    |

## Konfiguration

Aktivieren und konfigurieren Sie den JSON-RPC-Server in `app.toml`:

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

## Beispiele

### eth_blockNumber

Anfrage:

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

Antwort:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x53b35"
}
```

### eth_chainId

Anfrage:

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

Antwort (Mainnet `qorechain-vladi`, Chain-ID 9801):

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": "0x2649"
}
```

Im `qorechain-diana`-Testnet (Chain-ID 9800) gibt diese Methode `"0x2648"` zurück.

### eth_getBalance

Anfrage:

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

Antwort:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": "0x56bc75e2d63100000"
}
```

## Verbindung mit ethers.js

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

- Die Chain-ID wird als Hex-Zeichenkette zurückgegeben. Wandeln Sie sie für die Wallet-Konfiguration in eine Dezimalzahl um — `0x2649` ist **9801** (Mainnet), `0x2648` ist **9800** (Testnet).
- Die Gaspreisbildung folgt dem EIP-1559-Modell. Verwenden Sie `eth_feeHistory` zur Schätzung von Basisgebühr und Prioritätsgebühr.
- Akzeptierte Block-Tags: `"latest"`, `"earliest"`, `"pending"` oder eine Hex-Blocknummer.
- Filterbeschränkungen: `eth_getLogs` ist auf `filter-cap` Ergebnisse pro Abfrage begrenzt (Standard 10.000). Verwenden Sie für große Datensätze engere Blockbereiche.

:::
