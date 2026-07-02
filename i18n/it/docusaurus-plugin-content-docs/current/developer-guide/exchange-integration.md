---
slug: /developer-guide/exchange-integration
title: Guida per exchange e integratori
sidebar_label: Integrazione exchange
sidebar_position: 11
---

# Guida per exchange e integratori

Tutto ciò di cui un exchange, un custode o un integratore di pagamenti ha bisogno per quotare QOR ed elaborare depositi e prelievi: scegliere un'interfaccia, rilevare i depositi in modo sicuro e firmare i prelievi.

:::note
Questa guida riguarda la mainnet **`qorechain-vladi`** (versione della chain **v3.1.82**). Provate prima l'intero flusso sulla testnet **`qorechain-diana`** — gli endpoint di entrambe le reti sono in [Reti](/appendix/networks#public-endpoints).
:::

## Scegliere un percorso di integrazione {#choosing-a-path}

QoreChain è un'unica chain con **un unico saldo nativo QOR unificato** esposto attraverso tre interfacce. La **stessa chiave privata controlla gli stessi fondi** sotto un indirizzo Cosmos (`qor1...`), uno EVM (`0x...`) e uno SVM (base58) — scegliete l'interfaccia più adatta al vostro stack.

| | **A) Cosmos (nativo)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Indirizzo | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (stessa chiave) |
| Decimali (QOR nativo) | **6** (`uqor`) | **18** (stile wei) | **9** (lamports; 1 uqor = 1.000 lamports) |
| Strumenti | Cosmos SDK / CosmJS | **Ethereum standard** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Firma dei prelievi | **PQC ibrida obbligatoria** (ML-DSA-87 + secp256k1) | **secp256k1 / EIP-155 standard — nessuna PQC** | tramite tx Cosmos o invio sul nodo |
| Supporto memo / tag | **Sì** (indirizzo condiviso + memo) | No (un indirizzo per utente) | No (un indirizzo per utente) |
| Rilevamento depositi | scansione degli eventi `MsgSend` | scansione dei blocchi via `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| Ideale per | Piattaforme native Cosmos | **Piattaforme con integrazione EVM esistente** | Piattaforme con strumenti Solana |

**Raccomandazione:** se supportate già chain EVM, il **Percorso B (EVM)** è l'integrazione a minor sforzo — strumenti Ethereum standard, e **i prelievi non richiedono la firma post-quantistica** (il percorso ante EVM è esente). Il Percorso A (Cosmos) è la via nativa con indirizzi di deposito condivisi basati su memo. Il Percorso C (SVM) è anch'esso un'interfaccia nativa QOR completa — sceglietelo se preferite specificamente gli strumenti Solana.

Le tre interfacce **non si escludono a vicenda** — i fondi inviati alla forma `0x`, `qor1` o SVM della stessa chiave sono lo stesso saldo.

## Eseguire il proprio nodo {#node}

Le integrazioni in produzione dovrebbero verificare i depositi sul proprio **nodo sincronizzato**, non su un endpoint di terze parti. Seguite [Connettersi alla Mainnet](/getting-started/connecting-to-mainnet) — copre il bundle di binari precompilati (con checksum SHA-256), il genesis, i peer pubblici, il fee floor (`0.1uqor`) e un bootstrap rapido tramite lo snapshot pubblicato dei dati della chain. Non è richiesta alcuna licenza per eseguire un full node non validatore.

Poiché QoreChain ha **finalità istantanea** (nessun reorg), **1 conferma è definitiva**; attendere 1–2 blocchi offre un comodo margine operativo.

## Percorso A — Cosmos (nativo) {#path-a-cosmos}

URL REST di base: `https://api.qore.host` (oppure `http://localhost:1317` sul vostro nodo).

### Monitorare i depositi

```bash
# latest height
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# all txs in a height (deposit scanning)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# incoming transfers to an address
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&pagination.limit=50" | jq '.tx_responses[].txhash'

# balance (uqor — divide by 1e6 for QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### Checklist anti-depositi-falsi {#anti-fake-deposit}

Accreditate un deposito **solo** quando **tutte** le seguenti condizioni sono soddisfatte:

1. **`tx_response.code == 0`** — la transazione è riuscita; non accreditate mai una tx fallita.
2. Il messaggio è **`/cosmos.bank.v1beta1.MsgSend`** (o un output di `MsgMultiSend`) — non una chiamata a contratto o un altro modulo.
3. Il **`to_address`** corrisponde al vostro indirizzo di deposito e (con il modello a indirizzo condiviso) il **`memo`** corrisponde all'utente.
4. Il **`denom == "uqor"`** e l'`amount` è il valore da accreditare (uqor → ÷ 10⁶ per QOR). Rifiutate qualsiasi altro denom.
5. La tx è in un **blocco confermato** (`height` presente e ≤ all'ultima altezza confermata). La finalità è istantanea — 1 conferma è definitiva; attendete 1–2 blocchi per margine.
6. Ricalcolate l'importo dagli **eventi di trasferimento** (`coin_received` / `coin_spent`) e verificatelo incrociandolo con l'importo del messaggio — non fidatevi mai di un singolo campo o del solo memo.
7. Verificate che l'hash della tx esista tramite `GET /cosmos/tx/v1beta1/txs/{hash}` sul **vostro** nodo sincronizzato.

### Prelievi — firma PQC ibrida {#cosmos-withdrawals}

La mainnet impone **firme post-quantistiche** sulle transazioni cosmos (`allow_classical_fallback = false`): ogni prelievo richiede una **firma ibrida** — ML-DSA-87 (Dilithium-5, FIPS-204) **più** secp256k1. I depositi **non** ne hanno bisogno (vi limitate a osservare la chain).

La libreria di firma è [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm), che include `@qorechain/pqc` per le primitive FIPS-204:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

La firma è un flusso in **due passaggi** (rispecchiando `qorechaind tx pqc cosign`):

**Passo 1 — una tantum per ogni hot wallet: registrare la sua chiave ML-DSA-87.** Questa singola transazione di registrazione è **firmata in modo classico** (esenzione di bootstrap): messaggio `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` con `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Derivate la chiave ML-DSA in modo deterministico affinché sia recuperabile dal vostro segreto esistente — ad es. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, poi `mldsa.keygen(seed)` — e conservate il seed insieme alla chiave del vostro hot wallet.

**Passo 2 — ogni prelievo successivo: firma ibrida del `MsgSend`.** L'adapter incorpora la firma ML-DSA-87 in un'estensione del corpo della tx *prima* del normale `signDirect` secp256k1, così il vostro signer esistente resta invariato:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  address, pubkeySecp256k1, accountNumber, pqc });
const txBytes = await signer.signHybrid({
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress,
      amount: [{ denom: "uqor", amount: "1000000" }] })).finish() }],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gasLimit: 400000n },
  sequence });
```

Trasmettete i byte firmati:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

Poi interrogate `GET /cosmos/tx/v1beta1/txs/{hash}` finché non compare in un blocco con `code == 0`.

Per un HSM o un signer personalizzato in un altro linguaggio, usate le librerie FIPS-204 autonome [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) (npm, PyPI, crates.io, Maven Central, Go) e assemblate la stessa estensione. La firma ML-DSA **deve essere deterministica** (FIPS-204 §3.4) — vedete [Firma deterministica](/developer-guide/post-quantum-signing#deterministic-signing); la chain rifiuta le firme hedged.

## Percorso B — EVM {#path-b-evm}

Integrazione Ethereum standard verso `https://evm.qore.host` (chain ID **9801**) o la porta 8545 del vostro nodo.

* **Decimali:** il QOR nativo ha **18 decimali** sul canale EVM (1 uqor = 10¹² wei). Sbagliare questo dato accredita i depositi in modo errato di un fattore 10¹².
* **Depositi:** scansionate i blocchi con `eth_getBlockByNumber` cercando trasferimenti nativi verso i vostri indirizzi; confermate con `eth_getTransactionReceipt` (`status == 0x1`).
* **Prelievi:** firma standard secp256k1 / EIP-155 — **nessuna PQC richiesta** sul percorso ante EVM. Qualsiasi stack di firma Ethereum funziona senza modifiche.
* **Anti-depositi-falsi:** verificate lo status della receipt, che il valore trasferito sia un trasferimento **nativo** (non un evento ERC-20 che non indicizzate) e confermate sul vostro nodo.
* **Mappatura degli indirizzi:** l'indirizzo `0x` e l'indirizzo `qor1` sono due codifiche dello stesso account — i fondi sono condivisi. Vedete [Sviluppo EVM](/developer-guide/evm-development).

## Percorso C — SVM (compatibile Solana) {#path-c-svm}

A partire dalla v3.1.82 l'interfaccia SVM serve **QOR nativo** (vedete [QOR nativo sull'interfaccia SVM](/developer-guide/svm-development#native-qor)):

* **Saldi:** `getBalance` restituisce lamports (÷ 10⁹ per QOR; 1 uqor = 1.000 lamports).
* **Depositi:** `getSignaturesForAddress` fornisce la cronologia delle transazioni di un indirizzo; i trasferimenti del System Program muovono QOR nativo.
* Gli endpoint pubblici (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sono **di sola lettura**; inviate le transazioni tramite il vostro nodo.

## Riepilogo del flusso {#flow-summary}

| Operazione | Percorso | Firma necessaria? |
|---|---|---|
| **Deposito** (utente → piattaforma) | Osservate il vostro nodo sincronizzato per trasferimenti verso il vostro indirizzo (+ memo su Cosmos) | No — solo monitoraggio |
| **Prelievo** (piattaforma → utente) | Costruite il trasferimento, firmate offline, trasmettete | Cosmos: PQC ibrida · EVM: secp256k1 standard |
| **Saldo / sweep** | Query di saldo REST / EVM / SVM + trasferimento | Firma solo per lo sweep |

## Correlati

* [Connettersi alla Mainnet](/getting-started/connecting-to-mainnet) — configurazione del nodo, download, snapshot
* [Eseguire un nodo](/developer-guide/running-a-node) — deployment, pruning, indicizzazione
* [Firma post-quantistica](/developer-guide/post-quantum-signing) — le librerie FIPS-204 alla base dei prelievi ibridi
* [Reti](/appendix/networks) — chain ID, endpoint, decimali per interfaccia
