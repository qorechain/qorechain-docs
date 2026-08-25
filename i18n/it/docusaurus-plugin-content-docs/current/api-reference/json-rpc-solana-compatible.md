---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Compatibile con Solana
sidebar_label: JSON-RPC — Compatibile con Solana
sidebar_position: 4
---

# JSON-RPC — Compatibile con Solana

QoreChain fornisce un'interfaccia JSON-RPC compatibile con Solana tramite il proprio runtime SVM (Solana Virtual Machine), consentendo agli strumenti e agli SDK Solana esistenti di interagire con QoreChain in modo nativo.

:::caution L'invio di transazioni SVM è attualmente disabilitato
A partire dalla versione della chain v3.1.89 (22 agosto), a seguito di un incidente, la lane di esecuzione SVM è **disabilitata a livello di rete per l'invio di transazioni** — qualsiasi transazione restituisce `code 11, "SVM module is disabled"`. Questo vale a livello di rete, non solo sugli endpoint pubblici di sola lettura. I metodi in stile lettura elencati nella tabella sottostante (ad es. `getBalance`, `getAccountInfo`) potrebbero comunque rispondere, ma non tentare un'integrazione live che invii transazioni SVM finché la lane non viene riaperta — si tratta di una disabilitazione a livello di compilazione, non di un parametro a runtime, quindi non può essere riattivata con un voto di governance; si prevede che resterà disattivata finché un audit esterno non la sblocchi.
:::

## Connessione

| Trasporto | Indirizzo |
| --------- | ------------------------- |
| HTTP (nodo proprio) | `http://127.0.0.1:8899`   |
| HTTPS (pubblico, mainnet, sola lettura) | `https://svm.qore.host` |
| HTTPS (pubblico, testnet, sola lettura) | `https://svm-testnet.qore.host` |

Il server JSON-RPC viene **avviato da `qorechaind start`** ed è **abilitato di default**, in ascolto su `127.0.0.1:8899`. Viene configurato tramite una sezione `[svm-rpc]` in `app.toml` (`enable` + `address`). Un nodo appena avviato serve già questa interfaccia — non è richiesto alcun processo aggiuntivo. Gli endpoint pubblici sono **di sola lettura** (l'invio di transazioni è disabilitato al margine).

:::note
A partire dalla versione della chain **v3.1.82**, l'interfaccia SVM espone il **saldo QOR nativo** dell'account — gli stessi fondi unificati visibili sulle interfacce Cosmos ed EVM — denominato in **lamport** (9 decimali; **1 uqor = 1.000 lamport**). Vedi [QOR nativo sull'interfaccia SVM](/developer-guide/svm-development#native-qor).
:::

---

## Metodi

| Metodo                              | Parametri               | Descrizione                                                    |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (stringa base58) | Restituisce i dati dell'account, il proprietario, i lamport e il flag eseguibile |
| `getBalance`                        | `pubkey` (stringa base58) | Restituisce il saldo QOR nativo in lamport per la chiave pubblica indicata |
| `getSignaturesForAddress`           | `address` (stringa base58) | Restituisce le firme delle transazioni che coinvolgono l'indirizzo (rilevamento depositi) |
| `getSlot`                           | nessuno                     | Restituisce il numero dello slot corrente                                |
| `getMinimumBalanceForRentExemption` | `dataLength` (intero)   | Restituisce il saldo minimo per l'esenzione dal rent in base alla dimensione dei dati |
| `getVersion`                        | nessuno                     | Restituisce la versione del software del nodo                              |
| `getHealth`                         | nessuno                     | Restituisce lo stato di salute del nodo (`"ok"` se in salute)                 |

---

## Formato della risposta

Tutte le risposte seguono la specifica JSON-RPC 2.0. Le risposte che fanno riferimento allo stato on-chain includono un oggetto `context` con lo `slot` corrente:

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

## Esempi

### getAccountInfo

**Richiesta:**

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

**Risposta:**

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

**Richiesta:**

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

**Risposta:**

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

**Richiesta:**

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

**Risposta:**

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

La stringa di versione `1.18.0-qorechain` indica la compatibilità con l'interfaccia RPC di Solana 1.18.0 in esecuzione sul runtime SVM di QoreChain.

---

## Integrazione con @solana/web3.js

Le applicazioni Solana esistenti possono connettersi a QoreChain puntando l'oggetto `Connection` all'endpoint SVM locale:

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

## Note

- **Formato degli indirizzi**: gli account SVM utilizzano chiavi pubbliche codificate in base58 (formato Solana standard), non il prefisso Bech32 `qor1` usato dai moduli nativi del Cosmos SDK.
- **Bridging cross-VM**: per spostare asset tra i runtime EVM e SVM, usa il modulo Cross-VM (`x/crossvm`). Vedi i [Comandi di transazione](/cli-reference/transaction-commands) per la sintassi di `crossvm call`.
- **Deploy dei programmi**: esegui il deploy dei programmi BPF tramite la CLI (`qorechaind tx svm deploy-program`) oppure programmaticamente tramite il runtime SVM.
- **Compute budget**: il runtime SVM applica per default un compute budget di 1.400.000 compute unit per transazione. È configurabile tramite i parametri del modulo.
