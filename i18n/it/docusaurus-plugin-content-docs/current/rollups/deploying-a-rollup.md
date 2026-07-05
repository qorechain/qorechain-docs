---
slug: /rollups/deploying-a-rollup
title: Distribuire un Rollup
sidebar_label: Distribuire un Rollup
sidebar_position: 3
---

# Distribuire un Rollup

Puoi distribuire un rollup specifico per applicazione in tre modi: tramite la **Dashboard** (una procedura guidata no-code), tramite la **CLI** della chain (`qorechaind`, controllo completo sulla transazione on-chain) oppure in modo programmatico con il **TypeScript RDK** (`@qorechain/rdk` più lo scaffolder `create-qorechain-rollup`). Questa pagina copre tutti e tre gli approcci, oltre al ciclo di vita dell'operatore e ai comandi per i batch.

:::note
I comandi qui sotto sono rivolti alla testnet **`qorechain-diana`**. La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) è attiva dal 7 giugno 2026 ed esegue la versione della chain **v3.1.85** — sostituisci il chain ID e gli endpoint della mainnet quando effettui il deploy su mainnet. Convalida sempre ogni deployment prima su testnet.
:::

---

## Requisiti

| Requisito | Dettagli |
| ----------- | ------- |
| **Stake minimo** | Un vincolo di stake in QOR viene depositato in escrow alla creazione del rollup |
| **Burn di creazione** | Una frazione dell'importo in stake viene bruciata in modo permanente alla creazione; il resto viene tenuto in escrow e restituito quando il rollup viene arrestato |
| **Account** | Un account QoreChain con fondi sufficienti a coprire lo stake più le commissioni di transazione |

Interroga i parametri live del modulo per conoscere lo stake minimo e il tasso di burn correnti prima del deploy:

```bash
qorechaind query rdk config
```

---

## Deploy tramite la Dashboard (Tools → Rollups)

La Dashboard offre una procedura guidata **Deploy a Rollup** sotto **Tools → Rollups**. È il percorso più rapido per lanciare un rollup specifico per applicazione senza assemblare a mano una transazione.

### Passaggi

1. **Accedi.** La procedura guidata richiede una sessione autenticata per effettuare il deploy e per elencare i deployment esistenti.
2. **Assegna un nome al rollup.** Inserisci un nome per il rollup (2–41 caratteri: lettere, numeri, spazi, trattini o underscore).
3. **Scegli una macchina virtuale.** QoreChain è una chain a tripla VM, quindi il tuo rollup può eseguire una qualsiasi tra:
   * **EVM** — contratti Solidity / Vyper con tutto il tooling Ethereum (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — smart contract in Rust sul runtime Cosmos SDK, con IBC nativo
   * **SVM** — la Solana Virtual Machine, per app ad alto throughput con esecuzione parallela
4. **Scegli un layer di data availability.** Il luogo in cui il tuo rollup pubblica i dati delle transazioni affinché chiunque possa ricostruire lo stato: **QoreChain DA**, **Celestia** o **EigenDA**. Nota che EigenDA è un'opzione a livello di Dashboard, mentre i backend DA on-chain di `x/rdk` sono native, Celestia o entrambi — vedi [Data Availability](/rollups/data-availability).
5. **Imposta un token per il gas.** Il token usato per pagare l'esecuzione sul tuo rollup. Il valore predefinito è **QOR**; inserisci un simbolo personalizzato per usare un tuo token nativo.
6. **Scegli un sequencer.** Chi ordina le transazioni prima del settlement: **Shared sequencer** (il set condiviso di QoreChain), **Dedicated (single)** (esegui il tuo singolo sequencer) oppure **Decentralized** (un set di sequencer permissionless).
7. **Scegli una destinazione di settlement.** Dove il rollup ancora le proprie state root e le prove di validità: **QoreChain mainnet** oppure **Ethereum**.
8. **Effettua il deploy.** Invia la procedura guidata. Il provisioning viene esaminato da **The Qore Trust** prima che il rollup entri in funzione, quindi un rollup appena inviato compare con lo stato **provisioning** finché la revisione non si conclude.

I rollup che hai inviato compaiono nell'elenco **Your rollups** con VM, layer DA, token per il gas, sequencer, destinazione di settlement e stato corrente.

:::note
La procedura guidata della Dashboard presenta scelte semplici, a livello di prodotto, e instrada il provisioning attraverso una pipeline sottoposta a revisione. La CLI qui sotto opera direttamente sulla superficie dei messaggi on-chain del modulo `x/rdk`. Le due condividono gli stessi concetti di fondo (VM, DA, sequencer, settlement), ma li espongono a livelli di astrazione diversi.
:::

---

## Deploy tramite la CLI

La CLI crea il rollup direttamente on-chain. `create-rollup` accetta tre argomenti posizionali — l'ID del rollup, un profilo e l'importo dello stake (in `uqor`) — più un flag opzionale `--vm`.

:::tip
A partire dalla versione della chain **v3.1.74**, `create-rollup` **applica automaticamente il preset del profilo scelto** — modalità di settlement, sequencer, DA, modello di gas e VM sono tutti presi dal preset. Non serve più impostarli a mano (in precedenza il messaggio codificava una configurazione sovereign fissa). Il flag `--vm` ora **è vuoto per impostazione predefinita**, quindi si applica la VM del profilo a meno che tu non la sovrascriva esplicitamente.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Esempio** — crea un rollup dal preset `defi` (settlement, sequencer, DA e VM provengono tutti dal preset; `defi` si risolve in settlement zk sull'EVM):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Flag:**

| Flag | Predefinito | Descrizione |
| ---- | ------- | ----------- |
| `--vm` | *(vuoto — usa la VM del profilo)* | Sovrascrive il tipo di VM del rollup: `evm`, `cosmwasm`, `svm` o `custom`. Lascialo non impostato per applicare la VM del preset. (Nei client RDK il runtime Wasm è il tipo di VM **`native`** — QoreChain Native — con `cosmwasm` mantenuto come alias legacy; `cosmwasm` è il valore on-wire, che è ciò che questo flag a livello di chain accetta.) |

L'argomento `[profile]` seleziona una configurazione preset che viene applicata automaticamente — vedi **[Profili Preset](/rollups/preset-profiles)**. L'argomento `[stake-amount]` è il vincolo in `uqor`.

### Ispeziona ciò che hai distribuito

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Deploy con il TypeScript RDK (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Il Rollup Development Kit è distribuito come due pacchetti npm pubblici che pilotano lo stesso modulo on-chain `x/rdk` della CLI, tramite RPC/REST/gRPC/JSON-RPC pubblici e qualsiasi `OfflineSigner` di cosmjs:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — l'SDK TypeScript: un config builder con profili preset, helper di transazione per i cicli di vita del rollup e dei batch di settlement, DA nativa, client di lettura tipizzati e le novità della v0.4 — ricevute di settlement quantum-safe, il QCAI Rollup Copilot, helper per calldata cross-VM e la watchtower.
* **`create-qorechain-rollup`** (`v0.4.4`) — uno scaffolder che clona un template starter eseguibile per ciascun profilo (incluso il template `multivm-rollup`).

Questi pacchetti sono pubblicati su npm. Il repo include anche una CLI operatore pubblicata, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.4`), con i comandi `doctor`, `create`, `status`, `watch`, `params`, `suggest`, ciclo di vita (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` e `faucet`, oltre ai comandi `receipt`, `advise` e `watchtower` della v0.4.

Punti salienti dalla release iniziale v0.4.0:

* **v0.4.2 — funziona con la rete live senza configurazione.** I preset `mainnet` e `testnet` ora includono gli endpoint pubblici `qore.host` (REST su `api.qore.host` / `api-testnet.qore.host`), quindi `createRdkClient({ network })` raggiunge la chain senza `endpoints` manuali — sovrascrivi solo per puntare a un tuo nodo. La stessa release ha rinominato l'identificatore della VM Wasm dei rollup in **`native`** (QoreChain Native); `cosmwasm` resta un alias legacy accettato ed entrambi vengono mappati a `cosmwasm` on-wire — chain, explorer e Dashboard restano invariati.
* **v0.4.3 — fix della codifica delle firme ibride** per il percorso di firma TypeScript (vedi l'avviso qui sotto).
* **v0.4.4 — segue `@qorechain/sdk` `^0.7.0`**, la release dell'SDK per le authenticator lane della chain **v3.1.85**, così quelle capacità raggiungono direttamente gli utenti TypeScript dell'RDK tramite l'SDK. Nessuna modifica all'API dell'RDK.

:::caution
**Gli utenti TypeScript devono usare RDK ≥ 0.4.3.** Le release precedenti codificavano in modo errato l'estensione di transazione PQC ibrida, quindi la chain rifiutava ogni transazione firmata in modalità ibrida. La v0.4.3 (tramite `@qorechain/sdk` ≥ 0.6.1) corregge la codifica. Solo il percorso di firma ibrida in TypeScript era interessato — i client Python, Go, Rust e Java firmano solo in modo classico e non sono mai stati coinvolti.
:::

#### Client Python, Go, Rust e Java

Accanto al pacchetto TypeScript, l'RDK fornisce client completi in **Python**, **Go**, **Rust** e **Java** che rispecchiano la superficie TypeScript: il config builder con validazione, i cinque profili preset, utility per denom/economics/bech32, helper per Merkle binario e prove di prelievo, manifest dei rollup, client di lettura REST e JSON-RPC `qor_`, controlli di preflight/health, account (mnemonica → indirizzo `qor`) e **firma + broadcast delle transazioni** (`SIGN_MODE_DIRECT`). Sono tutti verificati con golden vector condivisi tra i linguaggi e sono **pubblicati** nei rispettivi registri:

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

Versioni pubblicate attuali: Python `qorechain-rdk` **0.4.4** (PyPI, import `qorrdk`), Rust `qorechain-rdk` (crates.io — installa l'ultima release pubblicata, oppure compila dal repo), modulo Go `github.com/qorechain/qorechain-rdk/packages/go` (**v0.4.4**) e Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). Il broadcast live richiede l'endpoint di un nodo.

:::note
Il TypeScript RDK e i suoi template puntano per impostazione predefinita alla testnet **`qorechain-diana`** e, dalla v0.4.2, i preset raggiungono subito gli endpoint pubblici live. Fissa le versioni (pin) e convalida su testnet prima della mainnet.
:::

### Crea lo scheletro di un progetto con `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Ogni profilo ha un template starter corrispondente (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Generane uno con una delle due forme:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Per l'uso non interattivo / in CI, passa esplicitamente template e rete:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Lo scaffolder stampa il costo documentato di stake e burn di creazione, oltre ai passi successivi per creare il rollup e leggerne lo stato.

### Crea un rollup da codice

Costruisci una config a partire da un preset, leggi dalla chain lo stake e il tasso di burn live, poi crea il rollup con un client di firma. Il config builder applica la matrice di compatibilità settlement → proof su `validate()` / `build()`.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2) —
// no manual `endpoints` config needed; override to target your own node.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.15uqor" }); // the chain enforces a 0.1uqor/gas fee floor
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

Non sai quale profilo fa al caso tuo? `rdk.suggestProfile("a lending protocol with predictable fees")` restituisce una raccomandazione assistita da QCAI (con un fallback documentato).

### Gestisci il ciclo di vita e leggi lo stato da codice

Il client di firma espone l'intero ciclo di vita — `pauseRollup`, `resumeRollup`, `stopRollup`, più `submitBatch`, `challengeBatch`, `resolveChallenge` ed `executeWithdrawal`. Le transizioni del ciclo di vita possono essere protette passando `currentStatus`.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

Leggi lo stato con il client REST tipizzato (nessun signer richiesto):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## Gestione del ciclo di vita

Un rollup attraversa gli stati `pending`, `active`, `paused` e `stopped`. Il creatore gestisce le transizioni con i comandi seguenti.

### Pausa

Sospende temporaneamente il rollup. Lo stato viene preservato e il rollup può essere ripreso. È obbligatoria una stringa con la motivazione.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Ripresa

Riprende un rollup precedentemente messo in pausa.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Arresto

Dismette in modo permanente il rollup e ne rilascia lo stake. Il QOR in stake — al netto del burn di creazione una tantum — viene restituito al creatore.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
L'arresto di un rollup è permanente. Il rollup non può essere riavviato dopo essere stato arrestato.
:::

---

## Comandi per operatori: batch e challenge

Gli operatori dei rollup inviano i batch di settlement e i challenger possono contestare i batch ottimistici. Questi comandi sono alla base del layer di settlement descritto in **[Panoramica dei Rollup](/rollups/overview)** e **[ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)**.

### Invia un batch

Invia un batch di settlement per un rollup. Accetta l'ID del rollup, un indice di batch e una state root codificata in esadecimale.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Contesta un batch

Contesta un batch inviato (per i rollup ottimistici). Accetta l'ID del rollup e l'indice del batch; passa la fraud proof con `--proof`. A partire dalla versione della chain **v3.1.74**, il percorso ottimistico **submit-batch → challenge-batch** è attivo e funzionante end-to-end.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| Flag | Descrizione |
| ---- | ----------- |
| `--proof` | Fraud proof codificata in esadecimale |

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
| `qorechaind query rdk batch [rollup-id]` | Ultimo batch di settlement (oppure `--index`) |
| `qorechaind query rdk config` | Parametri del modulo RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Raccomanda un preset per un caso d'uso |

---

## Prossimi passi

* **[Data Availability](/rollups/data-availability)** — backend DA nativi, Celestia e ridondanti.
* **[ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)** — verifica delle prove e flusso di prelievo L2 → L1 tramite `execute-withdrawal`.
