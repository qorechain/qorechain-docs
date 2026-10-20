---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — Namespace eth_
sidebar_label: JSON-RPC — Namespace eth_
sidebar_position: 3
---

# JSON-RPC — Namespace eth_

QoreChain implementa un'interfaccia JSON-RPC compatibile con EVM, che consente ai tool standard dell'ecosistema Ethereum (MetaMask, Hardhat, Foundry, ethers.js, web3.js) di leggere lo stato della chain e stimare il gas senza alcuna modifica. **L'invio di una transazione dalla lane EVM richiede un passaggio in più** a partire dalla versione della chain v3.2.0: l'account mittente deve avere una chiave post-quantistica registrata e una finestra di autorizzazione EVM aperta (vedi [Invio di transazioni](#sending-transactions)).

## Connessione

| Trasporto | Indirizzo predefinito   |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
L'interfaccia JSON-RPC EVM è servita dalla mainnet **`qorechain-vladi`** (chain ID EVM **9801**, hex `0x2649`, release del nodo **v3.2.3**, attiva dal 7 giugno 2026; v3.2.4 dall'altezza 3.742.566) e dalla testnet **`qorechain-diana`** (chain ID EVM **9800**, hex `0x2648`, release del nodo **v3.2.4** dal 19 ottobre 2026). Gli indirizzi locali sopra riportati si applicano a un nodo eseguito in proprio. Gli endpoint HTTP pubblici sono `https://evm.qore.host` (mainnet) e `https://evm-testnet.qore.host` (testnet), elencati in [Reti](/appendix/networks#public-endpoints). L'unico WebSocket EVM pubblico è quello della testnet (`wss://evm-ws-testnet.qore.host`); non esiste un WebSocket EVM pubblico per la mainnet.
:::

## Namespace supportati

| Namespace | Descrizione                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | Metodi JSON-RPC Ethereum principali                                                                            |
| `web3_`   | Metodi di utilità (versione client, hashing)                                                                   |
| `net_`    | Metodi sullo stato della rete                                                                                  |
| `txpool_` | Ispezione del pool delle transazioni                                                                           |
| `rpc_`    | Introspezione del server (`rpc_modules`)                                                                       |

## Metodi eth_

| Metodo                      | Parametri                                        | Descrizione                                                  |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| `eth_blockNumber`           | nessuno                                          | Restituisce il numero dell'ultimo blocco                     |
| `eth_getBalance`            | `address`, `blockNumber`                         | Restituisce il saldo di un indirizzo in wei                  |
| `eth_getTransactionCount`   | `address`, `blockNumber`                         | Restituisce il nonce (numero di transazioni) di un indirizzo |
| `eth_sendRawTransaction`    | `signedTxData`                                   | Invia una transazione firmata per la trasmissione            |
| `eth_call`                  | `callObject`, `blockNumber`                      | Esegue una chiamata in sola lettura sull'EVM                 |
| `eth_estimateGas`           | `callObject`                                     | Stima il gas necessario per una transazione                  |
| `eth_getBlockByNumber`      | `blockNumber`, `fullTx` (bool)                   | Restituisce i dati del blocco per numero                     |
| `eth_getTransactionByHash`  | `txHash`                                         | Restituisce i dati della transazione per hash                |
| `eth_getTransactionReceipt` | `txHash`                                         | Restituisce la ricevuta di una transazione minata            |
| `eth_getLogs`               | `filterObject`                                   | Restituisce i log corrispondenti a un filtro                 |
| `eth_chainId`               | nessuno                                          | Restituisce il chain ID (codificato in hex)                  |
| `eth_gasPrice`              | nessuno                                          | Restituisce il prezzo del gas corrente in wei                |
| `eth_feeHistory`            | `blockCount`, `newestBlock`, `rewardPercentiles` | Restituisce i dati storici sulle fee (EIP-1559)              |
| `eth_getBlockByHash`        | `blockHash`, `fullTx` (bool)                     | Restituisce i dati del blocco per hash                       |
| `eth_getCode`               | `address`, `blockNumber`                         | Restituisce il bytecode di un contratto                      |
| `eth_getStorageAt`          | `address`, `slot`, `blockNumber`                 | Restituisce uno slot di storage                              |
| `eth_getBlockReceipts`      | `blockNumber`                                    | Restituisce tutte le ricevute di un blocco                   |
| `eth_getProof`              | `address`, `storageKeys`, `blockNumber`          | Restituisce una prova di account                             |
| `eth_createAccessList`      | `callObject`, `blockNumber`                      | Costruisce una access list per una chiamata                  |
| `eth_maxPriorityFeePerGas`  | nessuno                                          | Restituisce la priority fee suggerita (wei)                  |
| `eth_syncing`               | nessuno                                          | Restituisce `false` quando il nodo è allineato               |
| `eth_newFilter`, `eth_newBlockFilter`, `eth_getFilterChanges` | oggetto filtro / ID filtro | Filtri a polling                                  |

## Metodi web3_

| Metodo               | Parametri    | Descrizione                                   |
| -------------------- | ------------ | --------------------------------------------- |
| `web3_clientVersion` | nessuno      | Restituisce la stringa di versione del client |
| `web3_sha3`          | `data` (hex) | Restituisce l'hash Keccak-256 dell'input      |

## Metodi txpool_

| Metodo           | Parametri | Descrizione                                                                         |
| ---------------- | --------- | ----------------------------------------------------------------------------------- |
| `txpool_status`  | nessuno   | Restituisce il numero di transazioni in sospeso e in coda                           |
| `txpool_content` | nessuno   | Restituisce le transazioni in sospeso e in coda (non sugli endpoint pubblici)       |
| `txpool_inspect` | nessuno   | Restituisce un riepilogo del pool (non sugli endpoint pubblici)                     |

## Metodi net_

| Metodo          | Parametri | Descrizione                                  |
| --------------- | --------- | -------------------------------------------- |
| `net_version`   | nessuno   | Restituisce l'ID della rete                  |
| `net_listening` | nessuno   | Restituisce `true` se il nodo è in ascolto   |
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

## Limiti sugli endpoint pubblici {#public-limits}

:::note
- `eth_getLogs` accetta al massimo **10.000 blocchi** tra `fromBlock` e `toBlock`. Un intervallo più ampio restituisce `{"code":-32000,"message":"maximum [from, to] blocks distance: 10000"}`. Interroga con finestre di 10.000 blocchi o meno. L'impostazione separata `filter-cap` limita il numero di log restituiti.
- `txpool_status` funziona sugli endpoint pubblici. `txpool_content` e `txpool_inspect` sono disabilitati sia sull'endpoint mainnet pubblico sia su quello testnet pubblico (funzionano su un nodo eseguito in proprio, con `txpool` nel suo elenco `api`).
- I metodi `debug_*` e `eth_signTransaction` non sono disponibili.
- `eth_subscribe` richiede una connessione WebSocket. Via HTTP restituisce `-32601 notifications not supported`. Vedi [Eventi WebSocket](/api-reference/websocket-events).
- Lo stato alle altezze vecchie viene sottoposto a pruning sugli endpoint pubblici, quindi `eth_call` su un blocco storico lontano può fallire con un errore di versione dello stato.
- Se uno script riceve `403 Forbidden`, imposta un header `User-Agent` esplicito; l'agent `urllib` predefinito di Python è bloccato, mentre i client `requests`, `curl`, Node e Go funzionano così come sono.
:::

## Invio di transazioni {#sending-transactions}

:::caution La lane EVM richiede una chiave PQC e una finestra aperta
A partire dalla versione della chain v3.2.0 la lane EVM ammette una transazione (`MsgEthereumTx`, inclusi i deploy di contratti) solo da un account che abbia una **chiave post-quantistica registrata** e una **finestra di autorizzazione EVM aperta**. Un normale wallet EVM che non ha eseguito questa configurazione non può inviare transazioni: il nodo le rifiuta con un errore del modulo `pqc` (codici 26, 27 o 28) invece di includerle. La lettura dei saldi, `eth_call` e la stima del gas non richiedono alcuna finestra. Dalla v3.2.2 viene rifiutata anche una transazione firmata **senza chain id** (pre-EIP-155), e dalla v3.2.3 una finestra può essere limitata ai semplici trasferimenti di QOR (`native_only`) o a destinatari elencati (`allowed_targets`); una transazione al di fuori dell'ambito viene rifiutata con il codice 27.

Controlla un account prima di inviare:

- `GET /qorechain/pqc/v1/account/{address}` (`found: true` significa che è registrata una chiave)
- `GET /qorechain/pqc/v1/evm_window/{address}` (`live: true` significa che una finestra ammette attualmente transazioni)

Entrambi sono descritti in [Endpoint REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module) (la risposta della finestra riporta anche `native_only` e `allowed_targets`). Una finestra si apre con una transazione QoreChain (`MsgOpenEVMWindow`, limitata a un massimo di 17.280 blocchi e 1.000 transazioni più un tetto di valore), non con una transazione Ethereum. Vedi [Sviluppo EVM](/developer-guide/evm-development) per una panoramica della lane.
:::

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
  "result": "0x37f559"
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

- Il chain ID viene restituito come stringa esadecimale. Convertilo in decimale per la configurazione del wallet — `0x2649` corrisponde a **9801** (mainnet), `0x2648` a **9800** (testnet).
- Il pricing del gas segue il modello EIP-1559. Usa `eth_feeHistory` per stimare la base fee e la priority fee.
- Tag di blocco accettati: `"latest"`, `"earliest"`, `"pending"`, oppure un numero di blocco in hex.
- Limitazioni sui filtri: `eth_getLogs` è limitato a `filter-cap` risultati per query (10.000 di default), e gli endpoint pubblici rifiutano intervalli più ampi di 10.000 blocchi. Usa intervalli di blocchi più ristretti per set di dati di grandi dimensioni.

:::
