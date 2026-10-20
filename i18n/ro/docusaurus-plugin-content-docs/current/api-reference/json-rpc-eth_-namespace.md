---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — Spațiul de nume eth_
sidebar_label: JSON-RPC — Spațiul de nume eth_
sidebar_position: 3
---

# JSON-RPC — Spațiul de nume eth_

QoreChain implementează o interfață JSON-RPC compatibilă cu EVM, astfel încât instrumentele standard Ethereum (MetaMask, Hardhat, Foundry, ethers.js, web3.js) pot citi starea lanțului și estima gas-ul fără modificări. **Trimiterea unei tranzacții de pe lane-ul EVM necesită un pas suplimentar** începând cu versiunea de lanț v3.2.0: contul expeditor trebuie să aibă o cheie post-cuantică înregistrată și o fereastră de autorizare EVM deschisă (vezi [Trimiterea tranzacțiilor](#sending-transactions)).

## Conexiune

| Transport | Adresă implicită        |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
Interfața JSON-RPC EVM este servită de mainnet-ul **`qorechain-vladi`** (EVM chain ID **9801**, hex `0x2649`, versiunea de nod **v3.2.3**, activ din 7 iunie 2026) și de testnet-ul **`qorechain-diana`** (EVM chain ID **9800**, hex `0x2648`, versiunea de nod **v3.2.4**, doar testnet). Adresele locale de mai sus se aplică unui nod pe care îl rulezi tu însuți. Endpoint-urile HTTP publice sunt `https://evm.qore.host` (mainnet) și `https://evm-testnet.qore.host` (testnet), listate în [Rețele](/appendix/networks#public-endpoints). Singurul WebSocket EVM public este cel al testnet-ului (`wss://evm-ws-testnet.qore.host`); nu există un WebSocket EVM public pentru mainnet.
:::

## Spații de nume acceptate

| Spațiu de nume | Descriere                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | Metode JSON-RPC Ethereum de bază                                                                               |
| `web3_`   | Metode utilitare (versiunea clientului, hashing)                                                               |
| `net_`    | Metode de stare a rețelei                                                                                      |
| `txpool_` | Inspecția pool-ului de tranzacții                                                                              |
| `rpc_`    | Introspecția serverului (`rpc_modules`)                                                                        |

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
| `eth_getBlockByHash`        | `blockHash`, `fullTx` (bool)                     | Returnează datele unui bloc după hash                |
| `eth_getCode`               | `address`, `blockNumber`                         | Returnează bytecode-ul unui contract                 |
| `eth_getStorageAt`          | `address`, `slot`, `blockNumber`                 | Returnează un slot de stocare                        |
| `eth_getBlockReceipts`      | `blockNumber`                                    | Returnează toate chitanțele unui bloc                |
| `eth_getProof`              | `address`, `storageKeys`, `blockNumber`          | Returnează o dovadă de cont                          |
| `eth_createAccessList`      | `callObject`, `blockNumber`                      | Construiește o listă de acces pentru un apel         |
| `eth_maxPriorityFeePerGas`  | niciunul                                         | Returnează taxa de prioritate sugerată (wei)         |
| `eth_syncing`               | niciunul                                         | Returnează `false` când nodul este sincronizat       |
| `eth_newFilter`, `eth_newBlockFilter`, `eth_getFilterChanges` | obiect filtru / id filtru | Filtre cu polling                              |

## Metode web3_

| Metodă               | Parametri    | Descriere                                |
| -------------------- | ------------ | ----------------------------------------- |
| `web3_clientVersion` | niciunul     | Returnează șirul cu versiunea clientului |
| `web3_sha3`          | `data` (hex) | Returnează hash-ul Keccak-256 al intrării |

## Metode txpool_

| Metodă           | Parametri  | Descriere                                                           |
| ---------------- | ---------- | ------------------------------------------------------------------- |
| `txpool_status`  | niciunul   | Returnează numărul de tranzacții în așteptare și în coadă           |
| `txpool_content` | niciunul   | Returnează tranzacțiile în așteptare și în coadă (indisponibilă pe endpoint-urile publice) |
| `txpool_inspect` | niciunul   | Returnează un rezumat al pool-ului (indisponibilă pe endpoint-urile publice) |

## Metode net_

| Metodă          | Parametri  | Descriere                                   |
| --------------- | ---------- | -------------------------------------------- |
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

## Limite pe endpoint-urile publice {#public-limits}

:::note
- `eth_getLogs` acceptă cel mult **10.000 de blocuri** între `fromBlock` și `toBlock`. Un interval mai larg returnează `{"code":-32000,"message":"maximum [from, to] blocks distance: 10000"}`. Interoghează în ferestre de cel mult 10.000 de blocuri. Setarea separată `filter-cap` limitează numărul de jurnale returnate.
- `txpool_status` funcționează pe endpoint-urile publice. `txpool_content` și `txpool_inspect` sunt dezactivate atât pe endpoint-ul public de mainnet, cât și pe cel de testnet (funcționează pe un nod pe care îl rulezi tu însuți, cu `txpool` în lista sa `api`).
- Metodele `debug_*` și `eth_signTransaction` nu sunt disponibile.
- `eth_subscribe` necesită o conexiune WebSocket. Prin HTTP returnează `-32601 notifications not supported`. Vezi [Evenimente WebSocket](/api-reference/websocket-events).
- Starea de la înălțimi vechi este eliminată (pruned) pe endpoint-urile publice, astfel că `eth_call` pe un bloc istoric îndepărtat poate eșua cu o eroare de versiune de stare.
- Dacă un script primește `403 Forbidden`, setează un header `User-Agent` explicit; agentul implicit `urllib` din Python este blocat, în timp ce clienții `requests`, `curl`, Node și Go funcționează ca atare.
:::

## Trimiterea tranzacțiilor {#sending-transactions}

:::caution Lane-ul EVM necesită o cheie PQC și o fereastră deschisă
Începând cu versiunea de lanț v3.2.0, lane-ul EVM admite o tranzacție (`MsgEthereumTx`, inclusiv desfășurările de contracte) doar de la un cont care are o **cheie post-cuantică înregistrată** și o **fereastră de autorizare EVM deschisă**. Un portofel EVM obișnuit care nu a făcut această configurare nu poate trimite tranzacții: nodul le refuză cu o eroare a modulului `pqc` (codurile 26, 27 sau 28) în loc să le includă. Citirea soldurilor, apelarea `eth_call` și estimarea gas-ului nu necesită o fereastră. Începând cu v3.2.2, este refuzată și o tranzacție semnată **fără chain id** (pre-EIP-155), iar începând cu v3.2.3 o fereastră poate fi limitată la simple transferuri de QOR (`native_only`) sau la destinatari listați (`allowed_targets`); o tranzacție din afara acestei limitări este refuzată cu codul 27.

Verifică un cont înainte de a trimite:

- `GET /qorechain/pqc/v1/account/{address}` (`found: true` înseamnă că o cheie este înregistrată)
- `GET /qorechain/pqc/v1/evm_window/{address}` (`live: true` înseamnă că o fereastră admite în prezent tranzacții)

Ambele sunt descrise în [Endpoint-uri REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module) (răspunsul ferestrei raportează și `native_only` și `allowed_targets`). O fereastră se deschide cu o tranzacție QoreChain (`MsgOpenEVMWindow`, limitată la cel mult 17.280 de blocuri și 1.000 de tranzacții plus un plafon de valoare), nu cu o tranzacție Ethereum. Vezi [Dezvoltare EVM](/developer-guide/evm-development) pentru prezentarea generală a lane-ului.
:::

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
  "result": "0x37f559"
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
- Limitări ale filtrului: `eth_getLogs` este plafonat la `filter-cap` rezultate per interogare (implicit 10.000), iar endpoint-urile publice resping intervalele mai late de 10.000 de blocuri. Folosește intervale de blocuri mai înguste pentru seturi mari de date.

:::
