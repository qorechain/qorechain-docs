---
slug: /developer-guide/exchange-integration
title: Guida per exchange e integratori
sidebar_label: Integrazione exchange
sidebar_position: 11
---

# Guida per exchange e integratori

Tutto ciò di cui un exchange, un custode o un integratore di pagamenti ha bisogno per quotare QOR ed elaborare depositi e prelievi: scegliere un'interfaccia, rilevare i depositi in modo sicuro e firmare i prelievi.

:::note
Questa guida si riferisce alla mainnet **`qorechain-vladi`** (versione della chain **v3.1.85**). Prova prima l'intero flusso sulla testnet **`qorechain-diana`** — gli endpoint di entrambe le reti sono in [Reti](/appendix/networks#public-endpoints). Se gestisci un tuo full node, mantienilo sulla versione corrente della chain — un nodo non aggiornato non può decodificare i tipi di transazione più recenti e smette di sincronizzarsi.
:::

## Scegliere un percorso di integrazione {#choosing-a-path}

QoreChain è un'unica chain con **un solo saldo nativo QOR unificato** esposto attraverso tre interfacce. La **stessa chiave privata controlla gli stessi fondi** sotto un indirizzo Cosmos (`qor1...`), uno EVM (`0x...`) e uno SVM (base58) — scegli l'interfaccia più adatta al tuo stack.

| | **A) Cosmos (nativo)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Indirizzo | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (stessa chiave) |
| Decimali (QOR nativo) | **6** (`uqor`) | **18** (stile wei) | **9** (lamports; 1 uqor = 1.000 lamports) |
| Strumenti | Cosmos SDK / CosmJS | **Ethereum standard** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Firma dei prelievi | **PQC ibrida richiesta** (ML-DSA-87 + secp256k1) | **secp256k1 standard / EIP-155 — nessuna PQC** | tramite tx Cosmos o invio dal nodo |
| Supporto memo / tag | **Sì** (indirizzo condiviso + memo) | No (un indirizzo per utente) | No (un indirizzo per utente) |
| Rilevamento depositi | scansione degli eventi `MsgSend` | scansione dei blocchi via `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| Ideale per | Piattaforme native Cosmos | **Piattaforme con integrazione EVM esistente** | Piattaforme con strumenti Solana |

**Raccomandazione:** se supporti già chain EVM, il **Percorso B (EVM)** è l'integrazione con il minor sforzo — strumenti Ethereum standard, e **i prelievi non richiedono firme post-quantum** (il percorso ante EVM è esente). Il Percorso A (Cosmos) è la via nativa con indirizzi di deposito condivisi basati su memo. Anche il Percorso C (SVM) è un'interfaccia nativa QOR completa — sceglilo se preferisci specificamente gli strumenti Solana.

Le tre interfacce **non si escludono a vicenda** — i fondi inviati alla forma `0x`, `qor1` o SVM della stessa chiave sono lo stesso saldo.

## Eseguire il tuo nodo {#node}

Le integrazioni in produzione dovrebbero verificare i depositi sul **proprio nodo sincronizzato**, non su un endpoint di terze parti. Segui [Connessione alla Mainnet](/getting-started/connecting-to-mainnet) — copre il pacchetto di binari precompilati (con checksum SHA-256), il genesis, i peer pubblici, la soglia minima di commissione (`0.1uqor`) e un bootstrap rapido tramite lo snapshot pubblicato dei dati della chain. Non è richiesta alcuna licenza per eseguire un full node non validatore.

Poiché QoreChain ha **finalità istantanea** (nessun reorg), **1 conferma è definitiva**; attendere 1–2 blocchi offre un comodo margine operativo.

## Percorso A — Cosmos (nativo) {#path-a-cosmos}

URL REST di base: `https://api.qore.host` (oppure `http://localhost:1317` sul tuo nodo).

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

### Checklist anti-depositi falsi {#anti-fake-deposit}

Accredita un deposito **solo** quando valgono **tutte** le condizioni seguenti:

1. **`tx_response.code == 0`** — la transazione è riuscita; non accreditare mai una tx fallita.
2. Il messaggio è **`/cosmos.bank.v1beta1.MsgSend`** (oppure un output di `MsgMultiSend`) — non una chiamata a contratto o un altro modulo.
3. Il **`to_address`** corrisponde al tuo indirizzo di deposito e (con il modello a indirizzo condiviso) il **`memo`** corrisponde all'utente.
4. Il **`denom == "uqor"`** e l'`amount` è il valore da accreditare (uqor → ÷ 10⁶ per QOR). Rifiuta qualsiasi altro denom.
5. La tx è in un **blocco committato** (`height` presente e ≤ dell'ultima height committata). La finalità è istantanea — 1 conferma è definitiva; attendi 1–2 blocchi per margine.
6. Ricalcola l'importo dagli **eventi di trasferimento** (`coin_received` / `coin_spent`) e confrontalo con l'importo nel messaggio — non fidarti mai di un singolo campo o del solo memo.
7. Verifica che l'hash della tx esista via `GET /cosmos/tx/v1beta1/txs/{hash}` sul **tuo** nodo sincronizzato.

### Prelievi — firma PQC ibrida {#cosmos-withdrawals}

La mainnet impone **firme post-quantum** sulle transazioni cosmos (`allow_classical_fallback = false`): ogni prelievo richiede una **firma ibrida** — ML-DSA-87 (Dilithium-5, FIPS-204) **più** secp256k1. I depositi **non** ne hanno bisogno (ti limiti a osservare la chain).

La libreria di firma è [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm), che include `@qorechain/pqc` per le primitive FIPS-204:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

La firma è un flusso in **due passaggi** (che rispecchia `qorechaind tx pqc cosign`):

**Passo 1 — una tantum per ogni hot wallet: registra la sua chiave ML-DSA-87.** Questa singola transazione di registrazione è **firmata in modo classico** (esenzione di bootstrap): messaggio `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` con `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Deriva la chiave ML-DSA in modo deterministico affinché sia recuperabile dal tuo segreto esistente — ad es. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, poi `mldsa.keygen(seed)` — e conserva il seed insieme alla chiave del tuo hot wallet.

**Passo 2 — per ogni prelievo successivo: firma ibrida del `MsgSend`.** L'adapter incorpora la firma ML-DSA-87 in un'estensione del corpo della tx *prima* del normale `signDirect` secp256k1, quindi il tuo firmatario esistente resta invariato:

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

Trasmetti i byte firmati:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

Poi interroga `GET /cosmos/tx/v1beta1/txs/{hash}` finché la tx non compare in un blocco con `code == 0`.

Per un HSM o un firmatario personalizzato in un altro linguaggio, usa le librerie FIPS-204 standalone [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) (npm, PyPI, crates.io, Maven Central, Go) e assembla la stessa estensione. La firma ML-DSA **deve essere deterministica** (FIPS-204 §3.4) — vedi [Firma deterministica](/developer-guide/post-quantum-signing#deterministic-signing); la chain rifiuta le firme hedged.

### Alternativa lato server: `@qorechain/chain-bridge` {#chain-bridge}

Per un worker hot-wallet interamente lato server (senza wallet browser), **`@qorechain/chain-bridge`** (npm) racchiude l'intero flusso — derivazione delle chiavi, auto-registrazione PQC al primo utilizzo, firma ibrida e broadcast — in una sola chiamata. È JavaScript puro (nessun addon nativo), adatto a worker serverless:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, auto-registers it if missing,
// hybrid-signs the MsgSend, and broadcasts. Amounts are in uqor (6 decimals).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

`chain-bridge` (≥0.1.1) usa la stessa derivazione PQC canonica vincolata all'indirizzo del resto dello stack — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — quindi la chiave è recuperabile dalla mnemonic con `qorechaind tx pqc recover-key`. Gli account registrati con strumenti più vecchi vengono gestiti automaticamente (fallback alla chiave legacy) e possono essere migrati una sola volta alla chiave canonica con [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation).

## Percorso B — EVM {#path-b-evm}

Integrazione Ethereum standard verso `https://evm.qore.host` (chain ID **9801**) oppure la porta 8545 del tuo nodo.

* **Decimali:** il QOR nativo ha **18 decimali** sul binario EVM (1 uqor = 10¹² wei). Sbagliare questo dato porta ad accreditare i depositi con un errore di un fattore 10¹².
* **Depositi:** scansiona i blocchi con `eth_getBlockByNumber` cercando trasferimenti nativi verso i tuoi indirizzi; conferma con `eth_getTransactionReceipt` (`status == 0x1`).
* **Prelievi:** firma standard secp256k1 / EIP-155 — **nessuna PQC richiesta** sul percorso ante EVM. Qualsiasi stack di firma Ethereum funziona senza modifiche.
* **Anti-depositi falsi:** verifica lo status della receipt, che il valore trasferito sia un trasferimento **nativo** (non un evento ERC-20 che non indicizzi) e conferma sul tuo nodo.
* **Mappatura degli indirizzi:** l'indirizzo `0x` e l'indirizzo `qor1` sono due codifiche dello stesso account — i fondi sono condivisi. Vedi [Sviluppo EVM](/developer-guide/evm-development).

## Percorso C — SVM (compatibile Solana) {#path-c-svm}

A partire dalla v3.1.82 l'interfaccia SVM serve **QOR nativo** (vedi [QOR nativo sull'interfaccia SVM](/developer-guide/svm-development#native-qor)):

* **Saldi:** `getBalance` restituisce lamports (÷ 10⁹ per QOR; 1 uqor = 1.000 lamports).
* **Depositi:** `getSignaturesForAddress` fornisce la cronologia delle transazioni di un indirizzo; i trasferimenti del System Program muovono QOR nativo.
* Gli endpoint pubblici (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sono di **sola lettura**; invia le transazioni tramite il tuo nodo.

## Riepilogo del flusso {#flow-summary}

| Operazione | Percorso | Firma necessaria? |
|---|---|---|
| **Deposito** (utente → piattaforma) | Osserva il tuo nodo sincronizzato per trasferimenti verso il tuo indirizzo (+ memo su Cosmos) | No — solo monitoraggio |
| **Prelievo** (piattaforma → utente) | Costruisci il trasferimento, firma offline, trasmetti | Cosmos: PQC ibrida · EVM: secp256k1 standard |
| **Saldo / sweep** | Query di saldo REST / EVM / SVM + trasferimento | Firma solo per lo sweep |

## Correlati

* [Connessione alla Mainnet](/getting-started/connecting-to-mainnet) — configurazione del nodo, download, snapshot
* [Eseguire un nodo](/developer-guide/running-a-node) — deployment, pruning, indicizzazione
* [Firma post-quantum](/developer-guide/post-quantum-signing) — le librerie FIPS-204 dietro i prelievi ibridi
* [Reti](/appendix/networks) — chain ID, endpoint, decimali per interfaccia
