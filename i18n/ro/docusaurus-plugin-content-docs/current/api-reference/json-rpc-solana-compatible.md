---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — Compatibil cu Solana
sidebar_label: JSON-RPC — Compatibil cu Solana
sidebar_position: 4
---

# JSON-RPC — Compatibil cu Solana

QoreChain oferă o interfață JSON-RPC compatibilă cu Solana prin runtime-ul său SVM (Solana Virtual Machine), permițând instrumentelor și SDK-urilor Solana existente să interacționeze nativ cu QoreChain.

## Conexiune

| Transport | Adresă implicită          |
| --------- | ------------------------- |
| HTTP      | `http://127.0.0.1:8899`   |

Serverul JSON-RPC este **pornit de `qorechaind start`** și este **activat implicit**, ascultând pe `127.0.0.1:8899`. Este configurat printr-o secțiune `[svm-rpc]` în `app.toml` (`enable` + `address`). Un nod proaspăt pornit servește deja această interfață — nu este necesar niciun proces suplimentar.

:::note
Interfața JSON-RPC compatibilă cu Solana este servită pe portul **8899** atât de mainnet-ul **`qorechain-vladi`** (activ pe versiunea de lanț **v3.1.77**), cât și de testnet-ul **`qorechain-diana`**. Adresa locală de mai sus se aplică unui nod pe care îl rulezi tu însuți; înlocuiește-o cu endpoint-ul de mainnet sau testnet al furnizorului tău pentru acces la distanță.
:::

---

## Metode

| Metodă                              | Parametri                | Descriere                                                      |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (șir base58)    | Returnează datele contului, proprietarul, lamports și flag-ul executable |
| `getBalance`                        | `pubkey` (șir base58)    | Returnează soldul în lamports pentru cheia publică dată        |
| `getSlot`                           | niciunul                 | Returnează numărul slotului curent                            |
| `getMinimumBalanceForRentExemption` | `dataLength` (întreg)    | Returnează soldul minim pentru scutirea de chirie în funcție de dimensiunea datelor |
| `getVersion`                        | niciunul                 | Returnează versiunea software a nodului                       |
| `getHealth`                         | niciunul                 | Returnează starea de sănătate a nodului (`"ok"` dacă este sănătos) |

---

## Formatul răspunsului

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
    "feature-set": 1
  }
}
```

Șirul de versiune `1.18.0-qorechain` indică compatibilitatea cu interfața RPC Solana 1.18.0 care rulează pe runtime-ul SVM al QoreChain.

---

## Integrarea @solana/web3.js

Aplicațiile Solana existente se pot conecta la QoreChain prin direcționarea obiectului `Connection` către endpoint-ul SVM local:

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

- **Format adresă**: Conturile SVM folosesc chei publice codate base58 (formatul standard Solana), nu prefixul Bech32 `qor1` folosit de modulele native Cosmos SDK.
- **Bridging cross-VM**: Pentru a muta active între runtime-urile EVM și SVM, folosește modulul Cross-VM (`x/crossvm`). Vezi [Comenzile de tranzacție](/cli-reference/transaction-commands) pentru sintaxa `crossvm call`.
- **Implementarea programelor**: Implementează programe BPF prin CLI (`qorechaind tx svm deploy-program`) sau programatic prin runtime-ul SVM.
- **Buget de calcul**: Runtime-ul SVM aplică implicit un buget de calcul de 1.400.000 de unități de calcul per tranzacție. Acesta este configurabil prin parametrii modulului.
