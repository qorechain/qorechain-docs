---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Compatibil cu Solana
sidebar_label: JSON-RPC — Compatibil cu Solana
sidebar_position: 4
---

# JSON-RPC — Compatibil cu Solana

QoreChain oferă o interfață JSON-RPC compatibilă cu Solana prin runtime-ul său SVM (Solana Virtual Machine), permițând instrumentelor și SDK-urilor Solana existente să interacționeze nativ cu QoreChain.

:::caution Trimiterea tranzacțiilor SVM este momentan dezactivată
Începând cu versiunea de lanț v3.1.89 (22 august), în urma unui incident, lane-ul de execuție SVM este **dezactivat la nivel de rețea pentru trimiterea tranzacțiilor** — orice tranzacție returnează `code 11, "SVM module is disabled"`. Acest lucru se aplică la nivel de rețea, nu doar la endpoint-urile publice doar-pentru-citire. Metodele de tip citire din tabelul de mai jos (de exemplu `getBalance`, `getAccountInfo`) răspund normal pe endpoint-urile publice, dar nu încerca o integrare live care trimite tranzacții SVM până când lane-ul nu se redeschide — aceasta este o dezactivare la momentul compilării, nu un parametru de runtime, deci nu poate fi reactivată printr-un vot de guvernanță; se așteaptă să rămână dezactivată până când un audit extern o eliberează.
:::

## Conexiune

| Transport | Adresă |
| --------- | ------------------------- |
| HTTP (nod propriu) | `http://127.0.0.1:8899`   |
| HTTPS (public, mainnet, doar citire) | `https://svm.qore.host` |
| HTTPS (public, testnet, doar citire) | `https://svm-testnet.qore.host` |

Serverul JSON-RPC este **pornit de `qorechaind start`** și este **activat implicit**, ascultând pe `127.0.0.1:8899`. Este configurat printr-o secțiune `[svm-rpc]` în `app.toml` (`enable` + `address`). Un nod proaspăt pornit servește deja această interfață — nu este necesar niciun proces suplimentar. Endpoint-urile publice sunt **doar pentru citire** (trimiterea tranzacțiilor este dezactivată la nivel de edge).

:::note
Începând cu versiunea de lanț **v3.1.82**, interfața SVM servește **soldul nativ QOR** al contului — aceleași fonduri unificate vizibile pe interfețele Cosmos și EVM — denominat în **lamports** (9 zecimale; **1 uqor = 1.000 lamports**). Vezi [QOR nativ pe interfața SVM](/developer-guide/svm-development#native-qor).
:::

---

## Metode

| Metodă                              | Parametri               | Descriere                                                    |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (șir base58) | Returnează datele contului, proprietarul, lamports și indicatorul executable     |
| `getBalance`                        | `pubkey` (șir base58) | Returnează soldul nativ QOR în lamports pentru cheia publică dată |
| `getSignaturesForAddress`           | `address` (șir base58) | Returnează semnăturile tranzacțiilor care implică adresa (detectarea depunerilor) |
| `getSlot`                           | niciunul                     | Returnează numărul slotului curent                                |
| `getMinimumBalanceForRentExemption` | `dataLength` (număr întreg)   | Returnează soldul minim pentru scutirea de chirie pentru dimensiunea de date dată |
| `getVersion`                        | niciunul                     | Returnează versiunea software-ului nodului                              |
| `getHealth`                         | niciunul                     | Returnează starea de sănătate a nodului (`"ok"` dacă este sănătos)                 |
| `getBlockHeight`                    | niciunul                     | Returnează înălțimea curentă a blocului                                |
| `getLatestBlockhash`                | niciunul                     | Returnează un blockhash recent și `lastValidBlockHeight`          |
| `getRecentBlockhash`                | niciunul                     | Forma veche a `getLatestBlockhash`                            |
| `getFeeForMessage`                  | `message` (base64)       | Returnează taxa pentru un mesaj (lamports)                       |
| `getMultipleAccounts`               | `pubkeys` (listă)        | Returnează mai multe conturi într-un singur apel                           |
| `getProgramAccounts`                | `programId` (base58)     | Returnează conturile deținute de un program                        |
| `getTokenAccountsByOwner`           | `owner`, filtru          | Returnează conturile de token ale unui proprietar                           |
| `getTokenAccountsByDelegate`        | `delegate`, filtru       | Returnează conturile de token ale unui delegat                          |

Metodele din afara acestei liste, precum `getGenesisHash` și `getEpochInfo`, returnează `-32601 method not found` (verificat pe `https://svm.qore.host` și `https://svm-testnet.qore.host`, 23 octombrie 2026). Începând cu v3.2.2, adresele base58 din interogările RPC și gRPC trebuie să fie canonice și cu lungime limitată; o adresă malformată este refuzată. `getTransaction` este acceptată, dar în prezent răspunde cu un înveliș fără câmpul `result`, așa că nu te baza pe ea. Slotul raportat de `getSlot` urmărește înălțimea blocului lanțului.

---

## Formatul răspunsurilor

Toate răspunsurile respectă specificația JSON-RPC 2.0. Răspunsurile care fac referire la starea on-chain includ un obiect `context` cu `slot`-ul curent:

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

## Exemple

### getAccountInfo

**Cerere:**

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

**Răspuns:**

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

**Cerere:**

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

**Răspuns:**

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

**Cerere:**

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

**Răspuns:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "solana-core": "1.18.0-qorechain",
    "feature-set": 0
  }
}
```

Șirul de versiune `1.18.0-qorechain` indică compatibilitatea cu interfața RPC Solana 1.18.0 care rulează pe runtime-ul SVM QoreChain.

---

## Integrare cu @solana/web3.js

Aplicațiile Solana existente se pot conecta la QoreChain direcționând obiectul `Connection` către endpoint-ul SVM local:

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

- **Formatul adreselor**: Conturile SVM folosesc chei publice codificate base58 (formatul standard Solana), nu prefixul Bech32 `qor1` folosit de modulele native Cosmos SDK.
- **Punte cross-VM**: Pentru a muta active între runtime-urile EVM și SVM, folosește modulul Cross-VM (`x/crossvm`). Vezi [Comenzile de tranzacție](/cli-reference/transaction-commands#crossvm) pentru sintaxa `crossvm call`. Lane-ul SVM este dezactivat, iar `MsgCrossVMCall` este oprit pe mainnet, deci aceasta este astăzi doar referință.
- **Implementarea programelor**: Implementează programe BPF prin CLI (`qorechaind tx svm deploy-program`) sau programatic prin runtime-ul SVM.
- **Buget de calcul**: Runtime-ul SVM impune implicit un buget de calcul de 1.400.000 de unități de calcul per tranzacție. Acesta este configurabil prin parametrii modulului.
