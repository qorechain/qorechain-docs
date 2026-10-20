---
slug: /developer-guide/exchange-integration
title: Guida per exchange e integratori
sidebar_label: Integrazione exchange
sidebar_position: 11
---

# Guida per exchange e integratori

Tutto ciò di cui un exchange, un custode o un integratore di pagamenti ha bisogno per quotare QOR ed elaborare depositi e prelievi: scegliere un'interfaccia, rilevare i depositi in modo sicuro e firmare i prelievi.

:::note
Questa guida si riferisce alla mainnet **`qorechain-vladi`** (attiva dal 7 giugno 2026; release del nodo **v3.2.3**, applicata all'altezza 3.662.051 il 20 ottobre 2026). Prova prima l'intero flusso sulla testnet **`qorechain-diana`** — esegue la v3.2.4 dal 19 ottobre 2026, e la mainnet passa dalla v3.2.3 alla v3.2.4 all'altezza 3.742.566 (proposta di governance 13), quindi le modifiche elencate di seguito valgono per entrambe le reti una volta raggiunto quel blocco (gli endpoint di entrambe le reti sono in [Reti](/appendix/networks#public-endpoints)). Se gestisci un tuo full node, mantienilo sulla release raccomandata dal manifest di download e mai al di sotto del suo `minCompatible` (**3.2.3** sulla mainnet fino all'upgrade) — un nodo non aggiornato non riesce a seguire gli upgrade della chain e si ferma all'altezza dell'upgrade; vedi [Gestire un nodo](/developer-guide/running-a-node#upgrades) per sapere cosa fare prima dell'altezza 3.742.566.

**Cosa è cambiato per gli integratori nella v3.2.2 e nella v3.2.3** (formato di firma, indirizzi, decimali, memo e commissioni restano invariati):

* **Le transazioni Ethereum non protette (pre-EIP-155) vengono rifiutate** nel mempool e nell'esecuzione dei blocchi (v3.2.2). Il wallet di un depositante deve firmare con un chain id; ogni wallet attuale lo fa.
* **Gli account di modulo non possono essere rivendicati tramite la EVM** (v3.2.2); non usare l'indirizzo di un account di modulo come indirizzo di deposito o di prelievo.
* **Gli account di vesting possono essere creati solo per il firmatario stesso** (v3.2.3); i tre messaggi di creazione di vesting si trovano inoltre attualmente nella lista del circuit breaker della mainnet.
* **I messaggi sulle chiavi PQC richiedono la firma ibrida una volta che un account ha una chiave** (v3.2.3): vedi [Firma post-quantum](/developer-guide/post-quantum-signing#key-integrity). Registra la chiave della hot wallet una sola volta, presto.
* **Le finestre EVM possono avere un ambito limitato** (v3.2.3): una hot wallet che invia solo QOR semplice può aprire una finestra `native_only`, vedi [Sviluppo EVM](/developer-guide/evm-development#evm-window).

**Cosa cambia per gli integratori nella v3.2.4** (sulla testnet dal 19 ottobre 2026; sulla mainnet dall'altezza 3.742.566). La firma delle transazioni, gli indirizzi, i decimali, i memo e le commissioni restano invariati, e nulla cambia nel modo in cui un deposito viene rilevato o un prelievo viene firmato e trasmesso:

* **Blocchi di staking facoltativi (nuovo modulo `x/stakingtier`).** Un delegatore può bloccare una parte di una delega per 3, 6 o 12 mesi (blocco minimo 10 QOR, al massimo 16 blocchi aperti per delegatore). Non succede nulla a un account che non crea un blocco. Finché un blocco è aperto, quell'importo **non può essere undelegato né ridelegato**, da nessuna via (una transazione semplice, `authz`, un gruppo o un contratto); terminare un blocco in anticipo brucia una penalità dallo stake bloccato. Un custode che mette in staking i fondi dei clienti non dovrebbe quindi bloccare la parte che potrebbe dover restituire. Leggi i parametri su `GET /qorechain/stakingtier/v1/params`.
* **Una nuova fonte di burn, `staking_tier_penalty`**, compare nelle statistiche di burn quando avvengono sblocchi anticipati. I job di riconciliazione dell'offerta che enumerano le fonti di burn dovrebbero accettare il nome di una fonte sconosciuta.
* **Limiti JSON-RPC locali al nodo** per i nodi che gestisci tu stesso: i corpi di richiesta superiori a 256 KiB vengono rifiutati (HTTP 413), non vengono servite più di 256 richieste contemporaneamente (HTTP 503 oltre questo limite), e un filtro `eth_getLogs` o `eth_newFilter` con più di 4 posizioni di topic, 1000 alternative in una posizione o 1000 indirizzi viene rifiutato. I limiti sono configurabili nella sezione `[json-rpc]` di `app.toml` (vedi [Gestire un nodo](/developer-guide/running-a-node#exposing-endpoints-for-integration)). Uno scanner di depositi che interroga `eth_getLogs` con una lunga lista di indirizzi dovrebbe dividere la lista.
* **Una registrazione ripetuta della chiave viene rifiutata prima di essere pagata.** Un nodo che esegue la v3.2.4 rifiuta, al momento della trasmissione, un `MsgRegisterPQCKeyV2` che reca esattamente la chiave pubblica già registrata dall'account, con l'errore che la chain avrebbe restituito (codice PQC 7, account già esistente), e senza addebitare alcuna commissione. Controlla `GET /qorechain/pqc/v1/account/{address}` prima di registrare la chiave di una hot wallet, come raccomandato di seguito.
* **Flag di possesso facoltativo.** Il record dell'account acquisisce un campo `possession_proven` che indica se una prova di possesso è stata verificata alla registrazione; non cambia chi può inviare o ricevere. Vedi [Firma post-quantum](/developer-guide/post-quantum-signing#proof-of-possession).
:::

## Scegliere un percorso di integrazione {#choosing-a-path}

QoreChain è un'unica chain con **un solo saldo nativo QOR unificato** esposto attraverso tre interfacce. La **stessa chiave privata controlla gli stessi fondi** sotto un indirizzo Cosmos (`qor1...`), uno EVM (`0x...`) e uno SVM (base58) — scegli l'interfaccia più adatta al tuo stack.

| | **A) Cosmos (nativo)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Indirizzo | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (stessa chiave) |
| Decimali (QOR nativo) | **6** (`uqor`) | **18** (stile wei) | **9** (lamport; 1 uqor = 1.000 lamport) |
| Strumenti | Cosmos SDK / CosmJS | **Ethereum standard** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Firma dei prelievi | **PQC ibrida richiesta** (ML-DSA-87 + secp256k1) | **secp256k1 standard / EIP-155, ma solo all'interno di una finestra di autorizzazione PQC aperta** (chiave ML-DSA registrata + finestra aperta da un messaggio Cosmos firmato in modo ibrido) | tramite tx Cosmos o invio dal nodo (canale attualmente disabilitato) |
| Supporto memo / tag | **Sì** (indirizzo condiviso + memo) | No (un indirizzo per utente) | No (un indirizzo per utente) |
| Rilevamento depositi | scansione degli eventi `MsgSend` | scansione dei blocchi via `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| Ideale per | Piattaforme native Cosmos | **Piattaforme con integrazione EVM esistente** | Piattaforme con strumenti Solana |

**Raccomandazione:** usa il **Percorso A (Cosmos)** per i prelievi; è la via nativa e offre indirizzi di deposito condivisi basati su memo. Dalla v3.2.0 anche il canale EVM (Percorso B) richiede una chiave ML-DSA-87 registrata e una **finestra di autorizzazione EVM** aperta e delimitata, che può essere aperta solo con un messaggio del canale Cosmos firmato in modo ibrido; un binario di prelievo EVM richiede quindi lo stesso stack di firma post-quantum del Percorso A **più** la gestione delle finestre (vedi [Percorso B](#path-b-evm) e la [finestra di autorizzazione EVM](/developer-guide/evm-development#evm-window)). Il Percorso B resta adatto al **rilevamento dei depositi** con strumenti Ethereum standard. Il Percorso C (SVM) è sulla carta un'interfaccia nativa QOR completa, ma **il suo canale di transazione è attualmente disabilitato a livello dell'intera rete** (vedi [Percorso C](#path-c-svm)) — usa il Percorso A, oppure il Percorso B per il rilevamento dei depositi, finché non riapre.

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
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&limit=50" | jq '.tx_responses[].txhash'

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
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing@0.32 @cosmjs/stargate@0.32 cosmjs-types@0.9.0
# pin the cosmjs packages to 0.32 (the adapter's peer range) and cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

La firma è un flusso in **due fasi** (che rispecchia `qorechaind tx pqc cosign`):

**Fase 1 — una tantum per ogni hot wallet: registra la sua chiave ML-DSA-87.** Questa transazione di registrazione, unica, è **firmata in modo classico** (esenzione di bootstrap, per un account che non ha ancora una chiave; una volta che esiste una chiave, qualsiasi ulteriore messaggio sulla chiave deve essere firmato in modo ibrido): messaggio `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` con `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Deriva la chiave ML-DSA in modo deterministico affinché sia recuperabile dal tuo segreto esistente — ad es. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, poi `mldsa.keygen(seed)` — e conserva il seed insieme alla chiave della hot wallet. La registrazione è esplicita: nulla registra la chiave al posto tuo quando compare per la prima volta una transazione ibrida, e una chiave incorporata in una transazione non è registrata. La chain rifiuta le chiavi `classical_only` e le chiavi che non offrono alcuna protezione post-quantum (codice 230) e verifica una prova di possesso facoltativa quando ne alleghi una (CLI: `register-key-v2 ... --pqc-key`; `@qorechain/sdk` 0.9.0 ne allega una da solo tramite `ensurePqcRegistered` una volta che la rete ha applicato la v3.2.3, mentre `@qorechain/wallet-adapter` 0.4.0 no, e ciò è accettato). Imposta il gas in modo esplicito (la chiave da 2.592 byte richiede più dei 200.000 predefiniti; usa `--gas 600000` nella CLI, un limite di gas di 600.000 nel codice e una commissione di almeno gas × 0.1 uqor, cioè 60.000 uqor).

**Fase 2 — ogni prelievo successivo: firma in modo ibrido il `MsgSend`.** L'adapter incorpora la firma ML-DSA-87 in un'estensione del tx-body *prima* della normale `signDirect` secp256k1, così il tuo firmatario esistente rimane invariato:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  rest: "https://api.qore.host",   // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
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
# code 20 "hybrid PQC signature required" => the transaction carries no PQC extension
#   (a classical-only transaction is refused; only the key registration itself is exempt)
# code 21 => the PQC half did not verify (wrong key or sign-bytes form), see the troubleshooting link below
```

Poi esegui polling su `GET /cosmos/tx/v1beta1/txs/{hash}` finché non compare in un blocco con `code == 0`.

Per un HSM o un firmatario personalizzato in un altro linguaggio, usa le librerie FIPS-204 standalone [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) (npm, PyPI, crates.io, Maven Central, Go) e componi la stessa estensione. La chain accetta qualsiasi firma ML-DSA-87 valida secondo FIPS-204, hedged o deterministica; firmare in modo deterministico (FIPS-204 §3.4, il default delle librerie) ti dà una firma e un hash di tx riproducibili. Vedi [Firma deterministica](/developer-guide/post-quantum-signing#deterministic-signing), e [Risoluzione del codice 21](/developer-guide/post-quantum-signing#code-21) se una transazione ibrida viene rifiutata.

### Alternativa lato server: `@qorechain/chain-bridge` {#chain-bridge}

Per un worker hot-wallet completamente lato server (senza wallet da browser coinvolto), **`@qorechain/chain-bridge`** (npm) avvolge l'intero flusso — derivazione della chiave, firma ibrida e broadcast — in un'unica chiamata. È JavaScript puro (nessun componente nativo aggiuntivo), adatto a worker serverless:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  cosmosRest: "https://api.qore.host",      // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, hybrid-signs the MsgSend, and broadcasts.
// Amounts are in uqor (6 decimals). Register the key beforehand with bridge.registerPqc({ mnemonic }).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

Se l'account non ha ancora una chiave registrata, è la libreria stessa a inviare l'esplicita transazione `MsgRegisterPQCKeyV2` e a riprovare una volta; è un comportamento della libreria, non della chain, quindi un binario hot-wallet dovrebbe registrare la chiave in anticipo e confermarla (`GET /qorechain/pqc/v1/account/{address}`) prima del primo prelievo. Da `chain-bridge` 0.2.3, con `cosmosRest` impostato, la registrazione include la prova di possesso una volta che la rete ha applicato la v3.2.3, e prima di ogni nuova registrazione la libreria legge la chain: se l'account possiede già una chiave che non è né quella canonica né quella legacy della tua mnemonic, lancia `pqc_key_mismatch` e non invia nulla (una registrazione ripetuta costa la sua commissione e viene rifiutata). `chain-bridge` (≥0.1.1) usa la stessa derivazione PQC canonica legata all'indirizzo del resto dello stack — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — quindi la chiave è recuperabile dalla mnemonic con `qorechaind tx pqc recover-key`. Gli account registrati con strumenti più vecchi sono gestiti automaticamente (fallback su chiave legacy) e possono essere migrati una volta alla chiave canonica con [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation).

## Percorso B — EVM {#path-b-evm}

Integrazione Ethereum standard su `https://evm.qore.host` (chain ID **9801**) oppure sulla porta 8545 del tuo nodo.

* **Decimali:** QOR nativo ha **18 decimali** sul binario EVM (1 uqor = 10¹² wei). Sbagliare questo valore mis-accredita i depositi di un fattore 10¹².
* **Depositi:** scansiona i blocchi con `eth_getBlockByNumber` per i trasferimenti nativi verso i tuoi indirizzi; conferma con `eth_getTransactionReceipt` (`status == 0x1`). Anche le transazioni EVM dei depositanti sono soggette alla regola della finestra, quindi un utente il cui account non ha una chiave registrata o una finestra aperta non può inviare un deposito dal canale EVM (può usare invece il canale Cosmos), e una transazione firmata senza chain id (pre-EIP-155) viene rifiutata senza appello. Una finestra può avere un ambito limitato (`native_only`, `allowed_targets`), quindi un deposito ammesso è sempre un trasferimento nativo o una chiamata che la finestra consente; leggi comunque la receipt anziché darlo per scontato.
* **Prelievi:** firma standard secp256k1 / EIP-155, **ma solo da un account con una chiave ML-DSA-87 registrata e una finestra di autorizzazione EVM aperta** (dalla v3.2.0; vedi la [finestra di autorizzazione EVM](/developer-guide/evm-development#evm-window) e la guida passo-passo in [La tua prima transazione](/getting-started/first-transaction#evm-window)). Una transazione al di fuori di una finestra viene rifiutata (codespace `pqc`, codici 26, 27 o 28). La finestra deve essere aperta con una transazione del canale Cosmos firmata in modo ibrido, quindi il Percorso B non elimina la necessità della firma post-quantum; dimensiona `max-value` in modo da coprire il valore più la commissione massima (limite di gas × commissione massima per gas) di ogni prelievo previsto all'interno della finestra (per una hot wallet che invia solo QOR semplice, aggiungi `--native-only` quando la apri), e monitora `GET /qorechain/pqc/v1/evm_window/{address}` affinché la hot wallet non resti mai a secco a metà batch. Aprire una finestra fa avanzare la sequence dell'account, che è anche il suo nonce EVM, quindi leggi il nonce dopo che la finestra è stata aperta.
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
| **Prelievo** (piattaforma → utente) | Costruisci il trasferimento, firma offline, trasmetti | Cosmos: PQC ibrida · EVM: secp256k1 standard all'interno di una finestra autorizzata PQC |
| **Saldo / sweep** | Query del saldo REST / EVM / SVM + trasferimento | Firma solo per lo sweep |

## Correlati

* [Connessione alla Mainnet](/getting-started/connecting-to-mainnet) — configurazione del nodo, download, snapshot
* [Gestire un nodo](/developer-guide/running-a-node) — deployment, pruning, indicizzazione
* [Firma post-quantum](/developer-guide/post-quantum-signing) — le librerie FIPS-204 dietro i prelievi ibridi
* [Reti](/appendix/networks) — chain ID, endpoint, decimali per interfaccia
