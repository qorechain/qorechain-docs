---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — eth_-Namespace
sidebar_label: JSON-RPC — eth_-Namespace
sidebar_position: 3
---

# JSON-RPC — eth_-Namespace

QoreChain implementiert eine EVM-kompatible JSON-RPC-Schnittstelle, sodass Standard-Ethereum-Werkzeuge (MetaMask, Hardhat, Foundry, ethers.js, web3.js) den Chain-Zustand lesen und Gas schätzen können, ohne Anpassungen. **Das Senden einer Transaktion über die EVM-Lane erfordert seit Chain-Version v3.2.0 einen zusätzlichen Schritt**: Das sendende Konto muss einen registrierten Post-Quanten-Schlüssel und ein offenes EVM-Autorisierungsfenster haben (siehe [Transaktionen senden](#sending-transactions)).

## Verbindung

| Transport | Standardadresse         |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
Die EVM-JSON-RPC-Schnittstelle wird vom **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**, hex `0x2649`, Node-Release **v3.2.3**, live seit dem 7. Juni 2026) und vom **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**, hex `0x2648`, Node-Release **v3.2.4**, nur Testnet) bereitgestellt. Die obigen lokalen Adressen gelten für einen Node, den Sie selbst betreiben. Die öffentlichen HTTP-Endpunkte sind `https://evm.qore.host` (Mainnet) und `https://evm-testnet.qore.host` (Testnet), aufgeführt unter [Netzwerke](/appendix/networks#public-endpoints). Der einzige öffentliche EVM-WebSocket gehört zum Testnet (`wss://evm-ws-testnet.qore.host`); einen öffentlichen Mainnet-EVM-WebSocket gibt es nicht.
:::

## Unterstützte Namespaces

| Namespace | Beschreibung                                                                                                   |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | Zentrale Ethereum-JSON-RPC-Methoden                                                                            |
| `web3_`   | Hilfsmethoden (Client-Version, Hashing)                                                                        |
| `net_`    | Methoden zum Netzwerkstatus                                                                                    |
| `txpool_` | Inspektion des Transaktionspools                                                                               |
| `rpc_`    | Server-Introspektion (`rpc_modules`)                                                                           |

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
| `eth_getBlockByHash`        | `blockHash`, `fullTx` (bool)                     | Gibt Blockdaten anhand des Hashes zurück                    |
| `eth_getCode`               | `address`, `blockNumber`                         | Gibt den Contract-Bytecode zurück                           |
| `eth_getStorageAt`          | `address`, `slot`, `blockNumber`                 | Gibt einen Storage-Slot zurück                              |
| `eth_getBlockReceipts`      | `blockNumber`                                    | Gibt alle Quittungen eines Blocks zurück                    |
| `eth_getProof`              | `address`, `storageKeys`, `blockNumber`          | Gibt einen Kontonachweis zurück                             |
| `eth_createAccessList`      | `callObject`, `blockNumber`                      | Erstellt eine Access-Liste für einen Aufruf                 |
| `eth_maxPriorityFeePerGas`  | keine                                            | Gibt die empfohlene Prioritätsgebühr zurück (Wei)           |
| `eth_syncing`               | keine                                            | Gibt `false` zurück, wenn der Node aufgeholt hat            |
| `eth_newFilter`, `eth_newBlockFilter`, `eth_getFilterChanges` | Filterobjekt / Filter-ID | Polling-Filter                              |

## web3_-Methoden

| Methode              | Parameter    | Beschreibung                                  |
| -------------------- | ------------ | --------------------------------------------- |
| `web3_clientVersion` | keine        | Gibt die Client-Versionszeichenkette zurück  |
| `web3_sha3`          | `data` (hex) | Gibt den Keccak-256-Hash der Eingabe zurück  |

## txpool_-Methoden

| Methode          | Parameter | Beschreibung                                                                  |
| ---------------- | --------- | ----------------------------------------------------------------------------- |
| `txpool_status`  | keine     | Gibt die Anzahl der ausstehenden und eingereihten Transaktionen zurück       |
| `txpool_content` | keine     | Gibt die ausstehenden und eingereihten Transaktionen zurück (nicht an den öffentlichen Endpunkten) |
| `txpool_inspect` | keine     | Gibt eine Zusammenfassung des Pools zurück (nicht an den öffentlichen Endpunkten)   |

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

## Limits der öffentlichen Endpunkte {#public-limits}

:::note
- `eth_getLogs` akzeptiert höchstens **10.000 Blöcke** zwischen `fromBlock` und `toBlock`. Ein größerer Bereich liefert `{"code":-32000,"message":"maximum [from, to] blocks distance: 10000"}`. Fragen Sie in Fenstern von höchstens 10.000 Blöcken ab. Die separate Einstellung `filter-cap` begrenzt die Anzahl der zurückgegebenen Logs.
- `txpool_status` funktioniert an den öffentlichen Endpunkten. `txpool_content` und `txpool_inspect` sind sowohl am öffentlichen Mainnet- als auch am öffentlichen Testnet-Endpunkt deaktiviert (sie funktionieren auf einem Node, den Sie selbst betreiben, wenn `txpool` in dessen `api`-Liste steht).
- `debug_*`-Methoden und `eth_signTransaction` sind nicht verfügbar.
- `eth_subscribe` benötigt eine WebSocket-Verbindung. Über HTTP liefert es `-32601 notifications not supported`. Siehe [WebSocket-Ereignisse](/api-reference/websocket-events).
- Der Zustand bei alten Höhen wird an den öffentlichen Endpunkten bereinigt (pruned), daher kann `eth_call` gegen einen weit zurückliegenden historischen Block mit einem State-Version-Fehler fehlschlagen.
- Wenn ein Skript `403 Forbidden` erhält, setzen Sie einen expliziten `User-Agent`-Header; der Standard-Agent von Pythons `urllib` wird blockiert, während `requests`, `curl`, Node- und Go-Clients unverändert funktionieren.
:::

## Transaktionen senden {#sending-transactions}

:::caution Die EVM-Lane braucht einen PQC-Schlüssel und ein offenes Fenster
Seit Chain-Version v3.2.0 lässt die EVM-Lane eine Transaktion (`MsgEthereumTx`, einschließlich Contract-Deployments) nur von einem Konto zu, das einen **registrierten Post-Quanten-Schlüssel** und ein **offenes EVM-Autorisierungsfenster** hat. Eine gewöhnliche EVM-Wallet, die diese Einrichtung nicht vorgenommen hat, kann keine Transaktionen einreichen: Der Node weist sie mit einem `pqc`-Modulfehler (Codes 26, 27 oder 28) ab, statt sie aufzunehmen. Kontostände lesen, `eth_call` aufrufen und Gas schätzen benötigen kein Fenster. Seit v3.2.2 wird auch eine Transaktion abgewiesen, die **ohne Chain-ID** signiert wurde (vor EIP-155), und seit v3.2.3 kann ein Fenster auf einfache QOR-Überweisungen (`native_only`) oder auf aufgelistete Empfänger (`allowed_targets`) beschränkt werden; eine Transaktion außerhalb dieses Umfangs wird mit Code 27 abgewiesen.

Prüfen Sie ein Konto vor dem Senden:

- `GET /qorechain/pqc/v1/account/{address}` (`found: true` bedeutet, dass ein Schlüssel registriert ist)
- `GET /qorechain/pqc/v1/evm_window/{address}` (`live: true` bedeutet, dass derzeit ein Fenster Transaktionen zulässt)

Beide sind unter [REST- / gRPC-Endpunkte](/api-reference/rest-grpc-endpoints#pqc-module) beschrieben (die Fensterantwort meldet außerdem `native_only` und `allowed_targets`). Ein Fenster wird mit einer QoreChain-Transaktion geöffnet (`MsgOpenEVMWindow`, begrenzt auf höchstens 17.280 Blöcke und 1.000 Transaktionen plus ein Wertlimit), nicht mit einer Ethereum-Transaktion. Siehe [EVM-Entwicklung](/developer-guide/evm-development) für die Lane-Übersicht.
:::

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
  "result": "0x37f559"
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
- Filterbeschränkungen: `eth_getLogs` ist auf `filter-cap` Ergebnisse pro Abfrage begrenzt (Standard 10.000), und die öffentlichen Endpunkte weisen Bereiche von mehr als 10.000 Blöcken ab. Verwenden Sie für große Datensätze engere Blockbereiche.

:::
