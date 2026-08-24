---
slug: /rollups/deploying-a-rollup
title: Distribuire un Rollup
sidebar_label: Distribuire un Rollup
sidebar_position: 3
---

# Distribuire un Rollup

Puoi distribuire un rollup specifico per applicazione in tre modi: tramite la **Dashboard** (una procedura guidata senza codice), tramite la **CLI** della chain (`qorechaind`, con pieno controllo sulla transazione on-chain), oppure programmaticamente con l'**RDK TypeScript** (`@qorechain/rdk` più lo scaffolder `create-qorechain-rollup`). Questa pagina copre tutti e tre i metodi, oltre al ciclo di vita dell'operatore e ai comandi per i batch.

:::note
I comandi seguenti fanno riferimento alla testnet **`qorechain-diana`**. La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) è live dal 7 giugno 2026 ed esegue la versione della chain **v3.1.92** — sostituisci il chain ID e gli endpoint della mainnet quando distribuisci su mainnet. Valida sempre ogni distribuzione prima su testnet.
:::

---

## Requisiti

| Requisito | Dettagli |
| ----------- | ------- |
| **Stake minimo** | Al momento della creazione del rollup viene messo in escrow un bond in QOR |
| **Burn di creazione** | Una frazione dell'importo messo in stake viene bruciata permanentemente alla creazione; il resto resta in escrow e viene restituito quando il rollup viene fermato |
| **Account** | Un account QoreChain finanziato con saldo sufficiente per lo stake più le fee di transazione |

Interroga i parametri live del modulo per conoscere lo stake minimo e il tasso di burn correnti prima di distribuire:

```bash
qorechaind query rdk config
```

---

## Distribuire tramite la Dashboard (Tools → Rollups)

La Dashboard offre una procedura guidata **Deploy a Rollup** sotto **Tools → Rollups**. È il percorso più rapido per lanciare un rollup specifico per applicazione senza assemblare una transazione a mano.

### Passaggi

1. **Accedi.** La procedura guidata richiede una sessione autenticata sia per distribuire sia per elencare le tue distribuzioni esistenti.
2. **Assegna un nome al rollup.** Inserisci un nome per il rollup (2–41 caratteri: lettere, numeri, spazi, trattini o underscore).
3. **Scegli una macchina virtuale.** QoreChain è una chain a tripla VM, quindi il tuo rollup può eseguire una tra:
   * **EVM** — contratti Solidity / Vyper con toolchain Ethereum completa (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — smart contract in Rust sul runtime del Cosmos SDK, con IBC nativo
   * **SVM** — la Solana Virtual Machine, per applicazioni ad esecuzione parallela e alto throughput
4. **Scegli un layer di disponibilità dei dati.** Dove il tuo rollup pubblica i dati delle transazioni affinché chiunque possa ricostruire lo stato: **QoreChain DA**, **Celestia**, oppure **EigenDA**. Nota che EigenDA è un'opzione a livello di Dashboard, mentre i backend DA on-chain di `x/rdk` sono native, Celestia, o entrambi — vedi [Disponibilità dei Dati](/rollups/data-availability).
5. **Imposta un gas token.** Il token usato per pagare l'esecuzione sul tuo rollup. Il default è **QOR**; inserisci un simbolo personalizzato per usare un tuo token nativo.
6. **Scegli un sequencer.** Chi ordina le transazioni prima del settlement: **Sequencer condiviso** (il set condiviso di QoreChain), **Dedicato (singolo)** (esegui il tuo sequencer singolo) oppure **Decentralizzato** (un set di sequencer permissionless).
7. **Scegli un target di settlement.** Dove il rollup ancora le sue radici di stato e le prove di validità: **mainnet QoreChain** oppure **Ethereum**.
8. **Distribuisci.** Invia la procedura guidata. Il provisioning viene revisionato da **The Qore Trust** prima che il rollup vada live, quindi un rollup appena inviato appare con stato **provisioning** finché la revisione non è completata.

I rollup che hai inviato compaiono nell'elenco **I tuoi rollup** con la loro VM, layer DA, gas token, sequencer, target di settlement e stato corrente.

:::note
La procedura guidata della Dashboard presenta scelte semplici a livello di prodotto e instrada il provisioning attraverso una pipeline revisionata. La CLI qui sotto lavora direttamente sulla superficie di messaggi on-chain del modulo `x/rdk`. Le due condividono gli stessi concetti sottostanti (VM, DA, sequencer, settlement) ma li espongono a livelli diversi.
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
  --fees 500uqor
```

**Esempio** — crea un rollup dal preset `defi` (settlement, sequencer, DA e VM provengono tutti dal preset; `defi` si risolve in settlement zk su EVM):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Flag:**

| Flag | Default | Descrizione |
| ---- | ------- | ----------- |
| `--vm` | *(vuoto — usa la VM del profilo)* | Sovrascrive il tipo di VM del rollup: `evm`, `cosmwasm`, `svm`, o `custom`. Lascialo non impostato per applicare la VM del preset. (Nei client dell'RDK il runtime Wasm è il tipo di VM **`native`** — QoreChain Native — con `cosmwasm` mantenuto come alias legacy; `cosmwasm` è il valore on-wire, che è ciò che questo flag a livello di chain accetta.) |

L'argomento `[profile]` seleziona una configurazione preimpostata che viene applicata automaticamente — vedi **[Profili Preimpostati](/rollups/preset-profiles)**. Lo `[stake-amount]` è il bond in `uqor`.

### Ispeziona ciò che hai distribuito

```bash
# Interroga un rollup specifico per ID
qorechaind query rdk rollup my-defi-rollup

# Elenca tutti i rollup registrati
qorechaind query rdk list-rollups
```

---

## Distribuire con l'RDK TypeScript (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Il Rollup Development Kit viene distribuito come due pacchetti npm pubblici che pilotano lo stesso modulo on-chain `x/rdk` della CLI, tramite RPC/REST/gRPC/JSON-RPC pubblici e qualsiasi `OfflineSigner` di cosmjs:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — l'SDK TypeScript: un config builder con profili preimpostati, helper di transazione per i cicli di vita di rollup e settlement-batch, DA nativo, client di lettura tipizzati, e le aggiunte della v0.4 — ricevute di settlement quantum-safe, il QCAI Rollup Copilot, helper calldata cross-VM e il watchtower.
* **`create-qorechain-rollup`** (`v0.4.4`) — uno scaffolder che clona un template di partenza eseguibile per profilo (incluso il template `multivm-rollup`).

Questi sono pubblicati su npm. Il repo distribuisce anche una CLI operatore pubblicata, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.4`), con i comandi `doctor`, `create`, `status`, `watch`, `params`, `suggest`, il ciclo di vita (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` e `faucet`, oltre ai comandi v0.4 `receipt`, `advise` e `watchtower`.

Punti salienti dalla release iniziale v0.4.0:

* **v0.4.2 — funziona sulla rete live pronto all'uso.** I preset `mainnet` e `testnet` ora includono gli endpoint pubblici `qore.host` (REST su `api.qore.host` / `api-testnet.qore.host`), quindi `createRdkClient({ network })` raggiunge la chain senza `endpoints` manuali — da sovrascrivere solo per puntare a un tuo nodo. La stessa release ha rinominato l'identificatore della VM rollup Wasm in **`native`** (QoreChain Native); `cosmwasm` resta un alias legacy accettato, ed entrambi mappano a `cosmwasm` sul wire — la chain, l'explorer e la Dashboard restano invariati.
* **v0.4.3 — correzione della codifica della firma ibrida** per il percorso di firma TypeScript (vedi l'avviso qui sotto).
* **v0.4.4 — segue `@qorechain/sdk` `^0.7.0`**, la release dell'SDK per le lane di autenticatore della chain **v3.1.85**, così queste capacità raggiungono direttamente gli utenti TypeScript dell'RDK tramite l'SDK. Nessuna modifica all'API dell'RDK.

:::caution
**Gli utenti TypeScript devono usare RDK ≥ 0.4.3.** Le release precedenti codificavano erroneamente l'estensione di transazione PQC ibrida, per cui la chain rifiutava ogni transazione firmata in modalità ibrida. La v0.4.3 (tramite `@qorechain/sdk` ≥ 0.6.1) corregge la codifica. È stato interessato solo il percorso di firma ibrida TypeScript — i client Python, Go, Rust e Java firmano solo in modalità classica e non sono mai stati impattati.
:::

#### Client Python, Go, Rust e Java

Accanto al pacchetto TypeScript, l'RDK fornisce client completi per **Python**, **Go**, **Rust** e **Java** che rispecchiano la superficie TypeScript: il config builder con validazione, i cinque profili preimpostati, utility per denom/economia/bech32, helper per Merkle binario e proof di prelievo, manifest dei rollup, client di lettura REST e JSON-RPC `qor_`, controlli preflight/health, account (mnemonic → indirizzo `qor`) e **firma + broadcast delle transazioni** (`SIGN_MODE_DIRECT`). Tutti sono verificati rispetto a vettori golden condivisi cross-language e sono **pubblicati** nei rispettivi registri:

```bash
# Python — si installa come qorechain-rdk, si importa come qorrdk
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

Versioni attualmente pubblicate: Python `qorechain-rdk` **0.4.4** (PyPI, import `qorrdk`), Rust `qorechain-rdk` (crates.io — installa l'ultima release pubblicata, oppure compila dal repo), modulo Go `github.com/qorechain/qorechain-rdk/packages/go` (**v0.4.4**), e Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). Il broadcast live richiede un endpoint nodo.

:::note
L'RDK TypeScript e i suoi template puntano per default alla testnet **`qorechain-diana`**, e dalla v0.4.2 i preset raggiungono gli endpoint pubblici live pronti all'uso. Fissa le versioni e valida su testnet prima della mainnet.
:::

### Scaffolda un progetto con `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Ogni profilo ha un template di partenza corrispondente (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Scaffolane uno con una delle due forme:

```bash
npm create qorechain-rollup my-rollup
# oppure
npx create-qorechain-rollup my-rollup
```

Per uso non interattivo / CI, passa esplicitamente template e network:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Lo scaffolder stampa il costo documentato di stake e burn di creazione, insieme ai prossimi passi per creare il tuo rollup e leggerne lo stato.

### Crea un rollup da codice

Costruisci una config a partire da un preset, leggi dalla chain lo stake live e il tasso di burn, poi crea il rollup con un client di firma. Il config builder applica la matrice di compatibilità settlement → proof su `validate()` / `build()`.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// Un config builder precompilato con i default del preset defi; sovrascrivi con .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// Gli endpoint pubblici qore.host sono integrati nei preset (RDK ≥ 0.4.2) —
// nessuna config `endpoints` manuale necessaria; sovrascrivi per puntare a un tuo nodo.
const rdk = createRdkClient({ network: "testnet" });

// Leggi i parametri live del modulo — non codificare mai a mano lo stake o il tasso di burn.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connetti un client di firma con qualsiasi OfflineSigner di cosmjs.
const tx = await rdk.connectTx(signer, { gasPrice: "0.15uqor" }); // la chain impone un floor di fee di 0.1uqor/gas
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

Non sei sicuro di quale profilo faccia al caso tuo? `rdk.suggestProfile("a lending protocol with predictable fees")` restituisce una raccomandazione assistita da QCAI (con un fallback documentato).

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

Sospendi temporaneamente il rollup. Lo stato viene preservato e il rollup può essere ripreso. È richiesta una stringa di motivazione.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Ripresa

Riprendi un rollup precedentemente messo in pausa.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Arresto

Decommissiona permanentemente il rollup e rilascia il suo stake. Il QOR messo in stake — al netto del burn di creazione una tantum — viene restituito al creatore.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
Fermare un rollup è permanente. Il rollup non può essere riavviato dopo essere stato fermato.
:::

---

## Comandi operatore: batch e contestazioni

Gli operatori di rollup inviano batch di settlement, e i contestatori possono disputare batch ottimistici. Questi comandi sono alla base del layer di settlement descritto in **[Panoramica dei Rollup](/rollups/overview)** e **[ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)**.

### Invia un batch

Invia un batch di settlement per un rollup. Richiede l'ID del rollup, un indice di batch e una radice di stato codificata in hex.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Contesta un batch

Contesta un batch inviato (per rollup ottimistici). Richiede l'ID del rollup e l'indice del batch; passa la prova di frode con `--proof`. A partire dalla versione della chain **v3.1.74**, il percorso ottimistico **submit-batch → challenge-batch** è live e funzionante end-to-end.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| Flag | Descrizione |
| ---- | ----------- |
| `--proof` | Prova di frode codificata in hex |

### Ispeziona i batch

```bash
# Ultimo batch per un rollup
qorechaind query rdk batch [rollup-id]

# Un batch specifico per indice
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
| `qorechaind query rdk suggest-profile [use-case]` | Consiglia un preset per un caso d'uso |

---

## Prossimi passi

* **[Disponibilità dei Dati](/rollups/data-availability)** — backend DA native, Celestia e ridondanti.
* **[ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)** — verifica delle prove e flusso di prelievo L2 → L1 tramite `execute-withdrawal`.
