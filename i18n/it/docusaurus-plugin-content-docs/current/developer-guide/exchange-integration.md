---
slug: /developer-guide/exchange-integration
title: Guida per exchange e integratori
sidebar_label: Integrazione exchange
sidebar_position: 11
---

# Guida per exchange e integratori

Tutto ciò di cui un exchange, un custode o un integratore di pagamenti ha bisogno per quotare QOR ed elaborare depositi e prelievi: scegliere un'interfaccia, rilevare i depositi in modo sicuro e firmare i prelievi.

:::note
Questa guida si riferisce alla mainnet **`qorechain-vladi`** (versione della chain **v3.1.92**). Prova prima l'intero flusso sulla testnet **`qorechain-diana`** — gli endpoint di entrambe le reti sono in [Reti](/appendix/networks#public-endpoints). Se gestisci un tuo full node, mantienilo sulla versione corrente della chain — un nodo non aggiornato non riesce a decodificare i tipi di transazione più recenti e smette di sincronizzarsi.
:::

## Scegliere un percorso di integrazione {#choosing-a-path}

QoreChain è un'unica chain con **un solo saldo nativo QOR unificato** esposto attraverso tre interfacce. La **stessa chiave privata controlla gli stessi fondi** sotto un indirizzo Cosmos (`qor1...`), uno EVM (`0x...`) e uno SVM (base58) — scegli l'interfaccia più adatta al tuo stack.

| | **A) Cosmos (nativo)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Indirizzo | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (stessa chiave) |
| Decimali (QOR nativo) | **6** (`uqor`) | **18** (stile wei) | **9** (lamport; 1 uqor = 1.000 lamport) |
| Strumenti | Cosmos SDK / CosmJS | **Ethereum standard** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Firma dei prelievi | **PQC ibrida richiesta** (ML-DSA-87 + secp256k1) | **secp256k1 standard / EIP-155 — nessuna PQC** | tramite tx Cosmos o invio dal nodo |
| Supporto memo / tag | **Sì** (indirizzo condiviso + memo) | No (un indirizzo per utente) | No (un indirizzo per utente) |
| Rilevamento depositi | scansione degli eventi `MsgSend` | scansione dei blocchi via `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| Ideale per | Piattaforme native Cosmos | **Piattaforme con integrazione EVM esistente** | Piattaforme con strumenti Solana |

**Raccomandazione:** se supporti già chain EVM, il **Percorso B (EVM)** è l'integrazione con il minor sforzo — strumenti Ethereum standard, e **i prelievi non richiedono firme post-quantum** (il percorso ante EVM è esente). Il Percorso A (Cosmos) è la via nativa con indirizzi di deposito condivisi basati su memo. Il Percorso C (SVM) è sulla carta un'interfaccia nativa QOR completa, ma **il suo canale di transazione è attualmente disabilitato a livello dell'intera rete** (vedi [Percorso C](#path-c-svm)) — usa il Percorso A o il Percorso B finché non riapre.

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

### Lista di controllo anti-falso-deposito {#anti-fake-deposit}

Accredita un deposito **solo** quando **tutte** le condizioni seguenti sono soddisfatte:

1. **`tx_response.code == 0`** — la transazione è andata a buon fine; non accreditare mai una tx fallita.
2. Il messaggio è **`/cosmos.bank.v1beta1.MsgSend`** (o un output di `MsgMultiSend`) — non una chiamata a contratto o un altro modulo.
3. Il campo **`to_address`** corrisponde al tuo indirizzo di deposito e, con il modello ad indirizzo condiviso, il **`memo`** corrisponde all'utente.
4. Il **`denom == "uqor"`** e l'`amount` è il valore da accreditare (uqor → ÷ 10⁶ per ottenere QOR). Rifiuta qualsiasi altro denom.
5. La tx si trova in un **blocco confermato** (`height` presente e ≤ l'ultima altezza confermata). La finalità è istantanea — 1 conferma è definitiva; attendi 1–2 blocchi per margine.
6. Ricalcola l'importo dagli **eventi di trasferimento** (`coin_received` / `coin_spent`) e confrontalo con l'importo nel messaggio — non fidarti mai di un unico campo o del solo memo.
7. Verifica che l'hash della tx esista tramite `GET /cosmos/tx/v1beta1/txs/{hash}` sul tuo **proprio** nodo sincronizzato.

### Prelievi — firma PQC ibrida {#cosmos-withdrawals}

La mainnet impone **firme post-quantum** sulle transazioni cosmos (`allow_classical_fallback = false`): ogni prelievo richiede una **firma ibrida** — ML-DSA-87 (Dilithium-5, FIPS-204) **più** secp256k1. I depositi **non** ne hanno bisogno (ti limiti a osservare la chain).

La libreria di firma è [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm), che include `@qorechain/pqc` per le primitive FIPS-204:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

La firma è un flusso in **due fasi** (che rispecchia `qorechaind tx pqc cosign`):

**Fase 1 — una tantum per ogni hot wallet: registra la sua chiave ML-DSA-87.** Questa transazione di registrazione, unica, è **firmata in modo classico** (esenzione di bootstrap): messaggio `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` con `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Deriva la chiave ML-DSA in modo deterministico affinché sia recuperabile dal tuo segreto esistente — ad es. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, poi `mldsa.keygen(seed)` — e conserva il seed insieme alla chiave della hot wallet.

**Fase 2 — ogni prelievo successivo: firma in modo ibrido il `MsgSend`.** L'adapter incorpora la firma ML-DSA-87 in un'estensione del tx-body *prima* della normale `signDirect` secp256k1, così il tuo firmatario esistente rimane invariato:

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

Poi esegui polling su `GET /cosmos/tx/v1beta1/txs/{hash}` finché non compare in un blocco con `code == 0`.

Per un HSM o un firmatario personalizzato in un altro linguaggio, usa le librerie FIPS-204 standalone [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) (npm, PyPI, crates.io, Maven Central, Go) e componi la stessa estensione. La firma ML-DSA **deve essere deterministica** (FIPS-204 §3.4) — vedi [Firma deterministica](/developer-guide/post-quantum-signing#deterministic-signing); la chain rifiuta le firme hedged (non deterministiche).

### Alternativa lato server: `@qorechain/chain-bridge` {#chain-bridge}

Per un worker hot-wallet completamente lato server (senza wallet da browser coinvolto), **`@qorechain/chain-bridge`** (npm) avvolge l'intero flusso — derivazione della chiave, auto-registrazione PQC al primo utilizzo, firma ibrida e broadcast — in un'unica chiamata. È JavaScript puro (nessun componente nativo aggiuntivo), adatto a worker serverless:

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

`chain-bridge` (≥0.1.1) usa la stessa derivazione PQC canonica legata all'indirizzo del resto dello stack — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — quindi la chiave è recuperabile dalla mnemonic con `qorechaind tx pqc recover-key`. Gli account registrati con strumenti più vecchi sono gestiti automaticamente (fallback su chiave legacy) e possono essere migrati una volta alla chiave canonica con [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation).

## Percorso B — EVM {#path-b-evm}

Integrazione Ethereum standard su `https://evm.qore.host` (chain ID **9801**) oppure sulla porta 8545 del tuo nodo.

* **Decimali:** QOR nativo ha **18 decimali** sul binario EVM (1 uqor = 10¹² wei). Sbagliare questo valore mis-accredita i depositi di un fattore 10¹².
* **Depositi:** scansiona i blocchi con `eth_getBlockByNumber` per i trasferimenti nativi verso i tuoi indirizzi; conferma con `eth_getTransactionReceipt` (`status == 0x1`).
* **Prelievi:** firma standard secp256k1 / EIP-155 — **nessuna PQC richiesta** sul percorso ante EVM. Qualsiasi stack di firma Ethereum funziona senza modifiche.
* **Anti-falso-deposito:** verifica lo status della receipt, che il valore spostato sia un trasferimento **nativo** (non un evento ERC-20 che non indicizzi) e conferma sul tuo nodo.
* **Mappatura degli indirizzi:** l'indirizzo `0x` e l'indirizzo `qor1` sono due codifiche dello stesso account — i fondi sono condivisi. Vedi [Sviluppo EVM](/developer-guide/evm-development).

## Percorso C — SVM (compatibile con Solana) {#path-c-svm}

:::caution Canale SVM attualmente disabilitato
Il canale di esecuzione SVM è **attualmente disabilitato a livello dell'intera rete per l'invio di transazioni**, a partire dalla versione della chain v3.1.89 (22 agosto) — qualsiasi transazione inviata restituisce `code 11, "SVM module is disabled"`. **Non** costruire un binario di deposito/prelievo sul Percorso C finché il canale non riapre — questa è una disabilitazione decisa in fase di compilazione, non un parametro a runtime, quindi non può essere riattivata con una votazione di governance; ci si aspetta che resti disattivata finché un audit esterno non la libera. Usa invece il **Percorso A (Cosmos)** o il **Percorso B (EVM)**. Gli endpoint di lettura (ad es. `getBalance`) potrebbero comunque rispondere, ma non costruire il rilevamento dei depositi o i flussi di prelievo su SVM finché l'invio delle transazioni resta disabilitato.
:::

A partire dalla v3.1.82 l'interfaccia SVM serve **QOR nativo** (vedi [QOR nativo sull'interfaccia SVM](/developer-guide/svm-development#native-qor)):

* **Saldi:** `getBalance` restituisce lamport (÷ 10⁹ per ottenere QOR; 1 uqor = 1.000 lamport).
* **Depositi:** `getSignaturesForAddress` fornisce la cronologia delle transazioni di un indirizzo; i trasferimenti tramite System Program spostano QOR nativo.
* Gli endpoint pubblici (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sono **di sola lettura**; invia le transazioni tramite il tuo stesso nodo.

## Riepilogo del flusso {#flow-summary}

| Operazione | Percorso | Serve una firma? |
|---|---|---|
| **Deposito** (utente → piattaforma) | Osserva il tuo nodo sincronizzato per i trasferimenti verso il tuo indirizzo (+ memo su Cosmos) | No — solo monitoraggio |
| **Prelievo** (piattaforma → utente) | Costruisci il trasferimento, firma offline, trasmetti | Cosmos: PQC ibrida · EVM: secp256k1 standard |
| **Saldo / sweep** | Query del saldo REST / EVM / SVM + trasferimento | Firma solo per lo sweep |

## Correlati

* [Connessione alla Mainnet](/getting-started/connecting-to-mainnet) — configurazione del nodo, download, snapshot
* [Gestire un nodo](/developer-guide/running-a-node) — deployment, pruning, indicizzazione
* [Firma post-quantum](/developer-guide/post-quantum-signing) — le librerie FIPS-204 dietro i prelievi ibridi
* [Reti](/appendix/networks) — chain ID, endpoint, decimali per interfaccia
