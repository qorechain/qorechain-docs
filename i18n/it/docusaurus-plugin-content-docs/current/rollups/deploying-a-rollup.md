---
slug: /rollups/deploying-a-rollup
title: Distribuire un Rollup
sidebar_label: Distribuire un Rollup
sidebar_position: 3
---

# Distribuire un Rollup

Puoi configurare un rollup specifico per applicazione in tre modi: tramite la **Dashboard** (un modulo di richiesta, non una transazione on-chain), tramite la **CLI** della chain (`qorechaind`, con pieno controllo sulla transazione on-chain), oppure con l'**RDK TypeScript** (`@qorechain/rdk` più lo scaffolder `create-qorechain-rollup`), che oggi copre la configurazione e le letture. Questa pagina copre tutti e tre i metodi, oltre al ciclo di vita dell'operatore e ai comandi per i batch.

:::caution Funzionalità in fase iniziale
Nessun rollup è ancora stato creato su nessuna delle due reti. I comandi seguenti usano la testnet **`qorechain-diana`** (EVM chain ID **9800**, versione della chain **v3.2.2**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) esegue la versione della chain **v3.2.1**; questa pagina descrive il comportamento della mainnet, e la versione più recente della testnet può differire nei dettagli. Valida sempre ogni distribuzione prima su testnet.
:::

:::note Fee e firma
La rete impone un prezzo minimo del gas di `0.1uqor`, quindi un semplice `--fees 500uqor` viene rifiutato, e ogni transazione sulla lane nativa richiede la co-firma post-quantistica ibrida. Gli esempi di CLI in questa pagina costruiscono quindi la transazione con `--generate-only` e la co-firmano con `qorechaind tx pqc cosign`, che la firma e la trasmette (crea la chiave una volta con `qorechaind tx pqc gen-key` e registrala on-chain una volta con `qorechaind tx pqc register-key`, oppure tramite QoreX o l'SDK, che lo fanno per te). La fee viene fissata quando viene generato il file non firmato, quindi imposta insieme il limite di gas e la fee: la fee deve essere almeno pari al limite di gas × 0,1 uqor. I limiti di gas qui sotto sono indicativi — simula prima di farci affidamento. Vedi [Prima Transazione](/getting-started/first-transaction) e [Firma Post-Quantistica](/developer-guide/post-quantum-signing).
:::

---

## Requisiti

| Requisito | Dettagli |
| ----------- | ------- |
| **Stake minimo** | Almeno 10.000 QOR (`min_stake_for_rollup`); lo stake viene messo in escrow alla creazione del rollup |
| **Burn di creazione** | L'1 % dello stake che fornisci viene bruciato permanentemente alla creazione (una creazione che non può applicare il burn viene rifiutata); il resto resta in escrow e viene restituito quando il rollup viene fermato |
| **Stake di registrazione del layer** | La creazione registra anche il layer del rollup nel modulo multilayer, il che blocca ulteriori **1.000 QOR** (`min_sidechain_stake`) del creatore, restituiti quando il layer viene dismesso allo stop. Se il layer non può essere registrato (saldo troppo basso, oppure è stato raggiunto il limite di 10 sidechain del multilayer) il rollup viene comunque creato ma non ha un layer, quindi i suoi batch non possono essere ancorati |
| **ID del rollup** | Usa da 3 a 64 caratteri: lettere minuscole, cifre, `.`, `_` e `-`, iniziando con una lettera o una cifra. Le versioni più recenti della chain applicano questa regola, quindi usala fin dall'inizio |
| **Account** | Un account QoreChain finanziato con una chiave post-quantistica registrata, con saldo sufficiente per lo stake, lo stake del layer e le fee di transazione |

Interroga i parametri live del modulo per conoscere lo stake minimo e il tasso di burn correnti prima di distribuire:

```bash
qorechaind query rdk config
```

---

## Distribuire tramite la Dashboard (Tools → Rollups)

La Dashboard offre un modulo **Deploy a Rollup** sotto **Tools → Rollups**. È un **modulo di richiesta**: inviarlo registra una richiesta di provisioning per il tuo account, revisionata da **The Qore Trust**, e una nuova richiesta mostra lo stato **provisioning**. **Non** trasmette una transazione `create-rollup` on-chain — per registrare un rollup on-chain, usa la CLI qui sotto.

### Passaggi

1. **Accedi.** Il modulo richiede una sessione autenticata sia per inviare una richiesta sia per elencare le tue richieste esistenti.
2. **Assegna un nome al rollup.** Inserisci un nome per il rollup (2–41 caratteri: lettere, numeri, spazi, trattini o underscore).
3. **Scegli una macchina virtuale.** Il record on-chain memorizza un'etichetta di VM. Il tuo rollup viene eseguito off-chain nel proprio runtime; la scelta non viene eseguita sulle lane EVM, CosmWasm o SVM di QoreChain:
   * **EVM** — contratti Solidity / Vyper con toolchain Ethereum completa (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — smart contract in Rust sul runtime del Cosmos SDK, con IBC nativo
   * **SVM** — la Solana Virtual Machine, per applicazioni ad esecuzione parallela e alto throughput
4. **Scegli un layer di disponibilità dei dati.** Dove il tuo rollup pubblica i dati delle transazioni affinché chiunque possa ricostruire lo stato: **QoreChain DA**, **Celestia**, oppure **EigenDA**. Nota che EigenDA è un'opzione a livello di Dashboard, mentre i backend DA on-chain di `x/rdk` sono native, Celestia, o entrambi — vedi [Disponibilità dei Dati](/rollups/data-availability).
5. **Imposta un gas token.** Il token usato per pagare l'esecuzione sul tuo rollup. Il default è **QOR**; inserisci un simbolo personalizzato per usare un tuo token nativo.
6. **Scegli un sequencer.** Chi ordina le transazioni prima del settlement: **Sequencer condiviso** (il set condiviso di QoreChain), **Dedicato (singolo)** (esegui il tuo sequencer singolo) oppure **Decentralizzato** (un set di sequencer permissionless).
7. **Scegli un target di settlement.** Dove il rollup ancora le sue radici di stato e le prove di validità: **mainnet QoreChain** oppure **Ethereum**.
8. **Invia la richiesta.** Il provisioning viene revisionato da **The Qore Trust**, quindi una richiesta appena inviata appare con stato **provisioning** finché la revisione non è completata.

Le richieste che hai inviato compaiono nell'elenco **I tuoi rollup** con la loro VM, layer DA, gas token, sequencer, target di settlement e stato corrente.

:::note
Le opzioni del modulo (macchina virtuale, layer di disponibilità dei dati, gas token, sequencer, target di settlement) descrivono ciò che stai richiedendo; sono più ampie di ciò che il modulo `x/rdk` on-chain supporta attualmente. On-chain, la disponibilità dei dati è `native` (Celestia non è attivo), e il sequencing è eseguito dal creatore del rollup o da un indirizzo di sequencer configurato. Vedi [Disponibilità dei Dati](/rollups/data-availability).
:::

---

## Distribuire tramite la CLI

La CLI crea il rollup direttamente on-chain. `create-rollup` accetta tre argomenti posizionali — l'ID del rollup, un profilo e l'importo dello stake (in `uqor`) — più un flag opzionale `--vm`.

:::tip
A partire dalla versione della chain **v3.1.74**, `create-rollup` **applica automaticamente il preset del profilo scelto** — modalità di settlement, sequencer, DA, modello di gas e VM provengono tutti dal preset. Non è più necessario impostarli a mano (in precedenza il messaggio codificava rigidamente una configurazione sovereign). Il flag `--vm` ora è **vuoto per default**, quindi si applica la VM del profilo a meno che tu non la sovrascriva esplicitamente.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json
```

**Esempio** — crea un rollup dal preset `defi` (settlement, sequencer, DA e VM provengono tutti dal preset; `defi` si risolve in settlement zk su EVM). Costruisci la transazione non firmata, poi allega la co-firma post-quantistica e trasmetti:

```bash
# 1. Build the unsigned transaction (10,000 QOR stake)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json

# 2. Cosign with your post-quantum key and broadcast
qorechaind tx pqc cosign create-rollup.json \
  --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Un profilo ZK come `defi` viene accettato alla creazione, ma un rollup creato in questo modo non porta con sé una verifying key, quindi i suoi batch ZK non possono ancora essere finalizzati (vedi [ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)).

**Flag:**

| Flag | Default | Descrizione |
| ---- | ------- | ----------- |
| `--vm` | *(vuoto — usa la VM del profilo)* | Sovrascrive il tipo di VM del rollup: `evm`, `cosmwasm`, `svm` oppure `custom`. Lascialo non impostato per applicare la VM del preset. (Nei client RDK il runtime Wasm è il tipo di VM **`native`** — QoreChain Native — con `cosmwasm` mantenuto come alias legacy; `cosmwasm` è il valore on-the-wire, che è quello accettato da questo flag a livello di chain.) |

:::note L'etichetta della VM è un metadato
`--vm` registra quale runtime usa il tuo rollup. La chain host si limita a eseguire il settlement del rollup; non ne esegue i contratti. L'upload CosmWasm della chain host è attualmente chiuso e la sua lane di transazioni SVM è disabilitata su tutta la rete, il che non influisce sul settlement di un rollup off-chain ma significa che non puoi distribuire contratti per un rollup su quelle lane della chain host.
:::

L'argomento `[profile]` seleziona una configurazione preimpostata che viene applicata automaticamente — vedi **[Profili Preset](/rollups/preset-profiles)**. `[stake-amount]` è il bond in `uqor`; il burn di creazione ne è l'1 %.

### Ispeziona ciò che hai distribuito

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Distribuire con l'RDK TypeScript (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Il Rollup Development Kit è distribuito come due pacchetti npm pubblici per lo stesso modulo on-chain `x/rdk` della CLI. Oggi sono più utili per costruire e validare configurazioni e per leggere lo stato; vedi l'avvertenza sulla firma qui sotto prima di affidarti a loro per inviare transazioni:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — l'SDK TypeScript: un config builder con profili preimpostati, helper di transazione per i cicli di vita del rollup e dei batch di settlement, DA nativa, client di lettura tipizzati, e le aggiunte della v0.4 — ricevute di settlement quantum-safe, il QCAI Rollup Copilot, helper di calldata cross-VM e il watchtower.
* **`create-qorechain-rollup`** (`v0.4.4`) — uno scaffolder che clona un template di partenza eseguibile per ogni profilo (incluso il template `multivm-rollup`).

Questi sono pubblicati su npm. Il repository distribuisce inoltre una CLI per operatori pubblicata, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.4`), con i comandi `doctor`, `create`, `status`, `watch`, `params`, `suggest`, ciclo di vita (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` e `faucet`, più i comandi v0.4 `receipt`, `advise` e `watchtower`.

Novità principali dalla release iniziale v0.4.0:

* **v0.4.2 — funziona con la rete live fin da subito.** I preset `mainnet` e `testnet` ora includono gli endpoint pubblici `qore.host` (REST su `api.qore.host` / `api-testnet.qore.host`), quindi `createRdkClient({ network })` raggiunge la chain senza `endpoints` manuali — sovrascrivili solo per puntare al tuo nodo. La stessa release ha rinominato l'identificatore della VM Wasm del rollup in **`native`** (QoreChain Native); `cosmwasm` resta un alias legacy accettato, ed entrambi corrispondono a `cosmwasm` on-the-wire — la chain, l'explorer e la Dashboard restano invariati.
* **v0.4.3 — aggiornamento di dipendenza per la correzione della codifica della firma ibrida dell'SDK.** Il client di transazione dell'RDK in sé firma ancora solo in modalità classica (vedi l'avvertenza qui sotto).
* **v0.4.4 — segue `@qorechain/sdk` `^0.7.0`**, la release dell'SDK per le lane di autenticatore della chain **v3.1.85**, così queste funzionalità raggiungono direttamente gli utenti TypeScript dell'RDK tramite l'SDK. Nessuna modifica all'API dell'RDK.

:::caution Firmare con i client pubblicati
Entrambe le reti richiedono una firma ibrida (secp256k1 + ML-DSA-87) su ogni transazione della lane nativa. L'attuale pacchetto npm pubblicato (`@qorechain/rdk` 0.4.4) firma tramite un client solo classico, quindi può **leggere** lo stato della chain ma non può far accettare una transazione. Per le transazioni oggi, costruisci e firma con la CLI (`--generate-only`, poi `qorechaind tx pqc cosign`) oppure con la firma ibrida di [`@qorechain/sdk`](/sdk/overview). Anche i client RDK Python, Go, Rust e Java firmano solo in modalità classica e **non sono adatti alle transazioni** su queste reti. Controlla la versione che installi; le release che aggiungeranno la firma ibrida ai client RDK saranno annotate qui.
:::

:::note Le letture richiedono le route REST dell'RDK
Gli helper di lettura TypeScript (`rdk.params()`, `rdk.rest.getRollup()`) chiamano route REST `/qorechain/rdk/v1/…`, che gli endpoint pubblici della mainnet oggi non servono. Su mainnet usa `qorechaind query rdk …` (gRPC).
:::

#### Client Python, Go, Rust e Java

Accanto al pacchetto TypeScript, l'RDK fornisce client completi **Python**, **Go**, **Rust** e **Java** che rispecchiano la superficie TypeScript: il config builder con validazione, i cinque profili preimpostati, utility per denom/economics/bech32, helper per Merkle binari e prove di prelievo, manifest dei rollup, client di lettura REST e JSON-RPC `qor_`, controlli preflight/health, account (mnemonic → indirizzo `qor`) e firma + trasmissione di transazioni classiche (`SIGN_MODE_DIRECT`, non accettata sulle reti a firma ibrida — vedi l'avvertenza sopra). Tutti sono verificati rispetto a golden vector condivisi tra linguaggi e sono **pubblicati** sui rispettivi registri:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.4
```

```python
import qorrdk
```

Versioni attualmente pubblicate: Python `qorechain-rdk` **0.5.0** (PyPI, import `qorrdk`), modulo Go `github.com/qorechain/qorechain-rdk/packages/go` (**v0.5.0**), Rust `qorechain-rdk` **0.4.4** (crates.io) e Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). Questi client leggono lo stato della chain; non producono la firma ibrida richiesta dalle reti (vedi l'avvertenza sopra).

:::note
L'RDK TypeScript e i suoi template usano per default la testnet **`qorechain-diana`**, e dalla v0.4.2 i preset raggiungono fin da subito gli endpoint pubblici live. Fissa le versioni e valida su testnet prima della mainnet.
:::

### Scaffolda un progetto con `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Ogni profilo ha un template di partenza corrispondente (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Scaffoldane uno con una delle due forme:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Per l'uso non interattivo / CI, passa esplicitamente il template e la rete:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Lo scaffolder stampa il costo documentato di stake e burn di creazione e i prossimi passi per creare il tuo rollup e leggerne lo stato.

:::caution Controlla la versione dell'RDK che il template installa
I template attualmente fissano `@qorechain/rdk` alla serie 0.2. Dopo lo scaffolding, esegui `npm install @qorechain/rdk@latest` per ottenere i preset degli endpoint pubblici `qore.host` e gli attuali client di lettura. Lo script `submit-batch` dello starter è solo un flusso di riferimento: invia radici illustrative e una prova di esempio e non è previsto che finalizzi un batch su una rete live.
:::

### Costruisci una configurazione di rollup da codice

Costruisci una configurazione da un preset, leggi dalla chain lo stake e il tasso di burn live e produci il messaggio di creazione. Il config builder applica la matrice di compatibilità settlement → prova in `validate()` / `build()`. Invia i valori risultanti con la CLI qui sopra (o con un client che firma in modalità ibrida) — vedi l'avvertenza sulla firma.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read: it works where the RDK REST routes are served and
// is refused (HTTP 501) on mainnet today — use `qorechaind query rdk config` there.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// The values to pass to `qorechaind tx rdk create-rollup`.
const msg = config.toCreateMsg("<your qor address>", { stakeAmount: params.minStakeForRollup });
console.log(msg.rollupId, msg.profile, msg.vmType, msg.stakeAmount);
```

Non sai quale profilo sia adatto? `rdk.suggestProfile(...)` dovrebbe restituire una raccomandazione assistita dal QCAI; sugli attuali endpoint pubblici restituisce sempre il fallback `defi` (`source: "fallback"`), quindi scegli dalla [tabella dei profili](/rollups/preset-profiles).

### Leggi lo stato da codice

Il client REST tipizzato non richiede alcun firmatario e funziona dove le route REST dell'RDK sono servite (non su mainnet oggi):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

Per i batch, usa `qorechaind query rdk batch [rollup-id]` (qui sotto).

---

## Gestione del ciclo di vita

Un rollup attraversa gli stati `pending`, `active`, `paused` e `stopped`; un nuovo rollup parte subito `active`. Solo il creatore può metterlo in pausa, riprenderlo o fermarlo (applicato dalla versione della chain v3.2.0). Ogni comando qui sotto segue lo stesso schema in due passaggi della creazione: genera la transazione non firmata, poi co-firmala.

### Pausa

Sospende temporaneamente il rollup. Lo stato viene preservato e il rollup può essere ripreso. È richiesta una stringa con il motivo.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > pause.json
qorechaind tx pqc cosign pause.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Ripresa

Riprende un rollup precedentemente messo in pausa.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > resume.json
qorechaind tx pqc cosign resume.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### Arresto

Dismette permanentemente il rollup e rilascia il suo stake. I QOR messi in stake — meno il burn di creazione una tantum — vengono restituiti al creatore. Lo stake di registrazione del layer di 1.000 QOR viene restituito separatamente quando il layer del rollup viene dismesso.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > stop.json
qorechaind tx pqc cosign stop.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

:::danger
L'arresto di un rollup è permanente. Il rollup non può essere riavviato dopo essere stato fermato.
:::

---

## Comandi operatore: batch e contestazioni

Gli operatori dei rollup inviano batch di settlement, e i challenger possono contestare i batch ottimistici. Questi comandi sono alla base del layer di settlement descritto in **[Panoramica dei Rollup](/rollups/overview)** e **[ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)**.

### Chi può inviare, e in quale ordine

* **Solo l'indirizzo di sequencer configurato del rollup — oppure, quando non ne è configurato nessuno (ogni preset), il suo creatore — può inviare batch.** Il sequencing based e condiviso non ammette ancora set di proposer né roster: oggi sono etichette, e invia il creatore.
* I batch formano una catena: il primo batch ha indice `0`; ogni batch successivo deve usare l'indice seguente e portare la radice di stato del batch precedente come `prev_state_root`.
* Un batch che porta un data hash su un rollup `native` o `both` viene rifiutato a meno che non sia già memorizzato un blob corrispondente (vedi [Disponibilità dei Dati](/rollups/data-availability)). Un batch senza data hash non viene controllato.
* Un rollup `zk` deve allegare una prova, e la prova deve essere verificata (vedi [ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)).

### Invia un batch

Invia un batch di settlement per un rollup. Accetta l'ID del rollup, un indice di batch e una radice di stato codificata in esadecimale.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Il comando CLI accetta solo questi tre argomenti posizionali, quindi può inviare solo il **batch 0**; i batch successivi richiedono un client in grado di impostare `prev_state_root` (e, dove usati, `data_hash`, `withdrawals_root` e `tx_count`). I batch di un rollup vengono regolati ma **non sono ancorati** a `x/multilayer` su mainnet oggi (vedi [Rollup Development Kit](/architecture/rollup-development-kit#state-anchoring)).

### Contesta un batch (rollup ottimistici) {#challenge-a-batch-optimistic-rollups}

Qualsiasi account può contestare un batch `submitted` entro la finestra di contestazione depositando un bond (il `challenge_bond` del rollup; 1.000 QOR per i preset `nft` e `custom`) e una prova di frode. Accetta l'ID del rollup e l'indice del batch; passa la prova di frode con `--proof`:

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > challenge.json
qorechaind tx pqc cosign challenge.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| Flag | Descrizione |
| ---- | ----------- |
| `--proof` | Prova di frode codificata in esadecimale |

Una contestazione **congela** il batch (`challenged`): non può essere finalizzato. Il **creatore** del rollup lo risolve poi con un messaggio resolve-challenge (non esposto come comando CLI; usa un client). La chain decide da sé l'esito verificando la prova memorizzata. Se la frode viene accertata, il batch è `rejected`, il bond viene restituito e al challenger viene pagato un importo aggiuntivo pari al bond prelevato dallo stake del rollup; se la contestazione viene respinta, il bond va al creatore e il batch torna a `submitted`.

### Ispeziona i batch

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42
```

---

## Interrogazioni

| Comando | Scopo |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Dettagli di un rollup specifico |
| `qorechaind query rdk list-rollups` | Tutti i rollup registrati |
| `qorechaind query rdk batch [rollup-id]` | Ultimo batch di settlement (o `--index`) |
| `qorechaind query rdk config` | Parametri del modulo RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Stampa un rimando all'RPC `qor_suggestRollupProfile`; gli endpoint pubblici non lo servono, quindi scegli un profilo dalla tabella dei [Profili Preset](/rollups/preset-profiles) |

---

## Prossimi passi

* **[Disponibilità dei Dati](/rollups/data-availability)** — backend DA native, Celestia e ridondante.
* **[ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)** — verifica delle prove e flusso di prelievo L2 → L1 tramite `execute-withdrawal`.
