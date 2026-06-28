---
slug: /rollups/deploying-a-rollup
title: Distribuire un Rollup
sidebar_label: Distribuire un Rollup
sidebar_position: 3
---

# Distribuire un Rollup

Puoi distribuire un rollup specifico per applicazione in tre modi: tramite la **Dashboard** (una procedura guidata no-code), tramite la **CLI** della chain (`qorechaind`, controllo completo sulla transazione on-chain) o in modo programmatico con l'**RDK TypeScript** (`@qorechain/rdk` più lo scaffolder `create-qorechain-rollup`). Questa pagina copre tutti e tre, oltre al ciclo di vita dell'operatore e ai comandi dei batch.

:::note
I comandi qui sotto sono destinati alla testnet **`qorechain-diana`**. La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) è attiva dal 7 giugno 2026 ed esegue la versione della chain **v3.1.80** — sostituisci il chain ID e gli endpoint della mainnet quando distribuisci sulla mainnet. Verifica prima ogni distribuzione sulla testnet.
:::

---

## Requisiti

| Requisito | Dettagli |
| ----------- | ------- |
| **Stake minimo** | Un bond di stake in QOR viene messo in escrow quando il rollup viene creato |
| **Burn di creazione** | Una frazione dell'importo in stake viene bruciata permanentemente alla creazione; il resto è tenuto in escrow e restituito quando il rollup viene fermato |
| **Account** | Un account QoreChain finanziato con saldo sufficiente per lo stake più le commissioni di transazione |

Interroga i parametri del modulo attivi per lo stake minimo e il tasso di burn correnti prima di distribuire:

```bash
qorechaind query rdk config
```

---

## Distribuire tramite la Dashboard (Tools → Rollups)

La Dashboard fornisce una procedura guidata **Deploy a Rollup** sotto **Tools → Rollups**. È il percorso più rapido per lanciare un rollup specifico per applicazione senza assemblare una transazione a mano.

### Passaggi

1. **Accedi.** La procedura guidata richiede una sessione autenticata per distribuire e per elencare le tue distribuzioni esistenti.
2. **Dai un nome al tuo rollup.** Inserisci un nome di rollup (2–41 caratteri: lettere, numeri, spazi, trattini o trattini bassi).
3. **Scegli una macchina virtuale.** QoreChain è una chain a tripla VM, quindi il tuo rollup può eseguire una qualsiasi di:
   * **EVM** — contratti Solidity / Vyper con il pieno set di strumenti Ethereum (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — smart contract Rust sul runtime Cosmos SDK, con IBC nativo
   * **SVM** — la Solana Virtual Machine, per app a esecuzione parallela e ad alto throughput
4. **Scegli un livello di disponibilità dei dati.** Dove il tuo rollup pubblica i dati di transazione affinché chiunque possa ricostruire lo stato: **QoreChain DA**, **Celestia** o **EigenDA**. Nota che EigenDA è un'opzione a livello di Dashboard, mentre i backend DA on-chain di `x/rdk` sono native, Celestia o both — vedi [Disponibilità dei Dati](/rollups/data-availability).
5. **Imposta un token per il gas.** Il token usato per pagare l'esecuzione sul tuo rollup. Predefinito a **QOR**; inserisci un simbolo personalizzato per usare il tuo token nativo.
6. **Scegli un sequencer.** Chi ordina le transazioni prima del settlement: **Shared sequencer** (l'insieme condiviso di QoreChain), **Dedicated (single)** (esegui il tuo singolo sequencer) o **Decentralized** (un insieme di sequencer permissionless).
7. **Scegli una destinazione di settlement.** Dove il rollup ancora le sue radici di stato e le prove di validità: **mainnet QoreChain** o **Ethereum**.
8. **Distribuisci.** Invia la procedura guidata. Il provisioning è esaminato da **The Qore Trust** prima che il rollup vada online, quindi un rollup appena inviato appare con uno stato **provisioning** finché la revisione non è completata.

I rollup che hai inviato appaiono nell'elenco **Your rollups** con la loro VM, il livello DA, il token per il gas, il sequencer, la destinazione di settlement e lo stato corrente.

:::note
La procedura guidata della Dashboard presenta scelte intuitive a livello di prodotto e instrada il provisioning attraverso una pipeline esaminata. La CLI qui sotto opera direttamente sulla superficie dei messaggi on-chain del modulo `x/rdk`. Le due condividono gli stessi concetti di fondo (VM, DA, sequencer, settlement) ma li espongono a diverse altitudini.
:::

---

## Distribuire tramite la CLI

La CLI crea il rollup direttamente on-chain. `create-rollup` accetta tre argomenti posizionali — l'ID del rollup, un profilo e l'importo dello stake (in `uqor`) — più un flag opzionale `--vm`.

:::tip
A partire dalla versione della chain **v3.1.74**, `create-rollup` **applica automaticamente il preset del profilo scelto** — modalità di settlement, sequencer, DA, modello di gas e VM sono tutti presi dal preset. Non è più necessario impostarli a mano (in precedenza il messaggio codificava in modo fisso una configurazione sovrana). Il flag `--vm` ora **ha come valore predefinito vuoto**, quindi si applica la VM del profilo a meno che tu non la sovrascriva esplicitamente.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Esempio** — crea un rollup dal preset `defi` (settlement, sequencer, DA e VM provengono tutti dal preset; `defi` si risolve in settlement zk sulla EVM):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Flag:**

| Flag | Predefinito | Descrizione |
| ---- | ------- | ----------- |
| `--vm` | *(vuoto — usa la VM del profilo)* | Sovrascrivi il tipo di VM del rollup: `evm`, `cosmwasm`, `svm` o `custom`. Lascialo non impostato per applicare la VM del preset. |

L'argomento `[profile]` seleziona una configurazione preset che viene applicata automaticamente — vedi **[Profili Preset](/rollups/preset-profiles)**. L'argomento `[stake-amount]` è il bond in `uqor`.

### Ispeziona ciò che hai distribuito

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Distribuire con l'RDK TypeScript (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Il Rollup Development Kit viene distribuito come due pacchetti npm pubblici che pilotano lo stesso modulo on-chain `x/rdk` della CLI, su RPC/REST/gRPC/JSON-RPC pubblici e qualsiasi `OfflineSigner` di cosmjs:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.0`) — l'SDK TypeScript: un config builder con profili preset, helper per le transazioni dei cicli di vita del rollup e del settlement-batch, DA nativa, client di lettura tipizzati e le aggiunte della v0.4 — ricevute di settlement quantum-safe, il QCAI Rollup Copilot, helper per la calldata cross-VM e la watchtower.
* **`create-qorechain-rollup`** (`v0.4.0`) — uno scaffolder che clona un template di partenza eseguibile per profilo (incluso il template `multivm-rollup`).

Questi sono pubblicati su npm. Il repo distribuisce anche una CLI per operatori pubblicata, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.0`), con i comandi `doctor`, `create`, `status`, `watch`, `params`, `suggest`, ciclo di vita (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` e `faucet`, oltre ai comandi `receipt`, `advise` e `watchtower` della v0.4.

#### Client Python, Go, Rust e Java

Insieme al pacchetto TypeScript, l'RDK fornisce client completi per **Python**, **Go**, **Rust** e **Java** che rispecchiano la superficie TypeScript: il config builder con validazione, i cinque profili preset, utility per denom/economics/bech32, helper per binary-Merkle e withdrawal-proof, manifesti di rollup, client di lettura REST e JSON-RPC `qor_`, controlli preflight/health, account (mnemonic → indirizzo `qor`) e **firma + broadcast delle transazioni** (`SIGN_MODE_DIRECT`). Tutti sono verificati rispetto a golden vector cross-language condivisi e sono **pubblicati** nei rispettivi registri:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.0
```

```python
import qorrdk
```

Versioni attualmente pubblicate: Python `qorechain-rdk` **0.4.0** (PyPI, import `qorrdk`), Rust `qorechain-rdk` **0.4.0** (crates.io), modulo Go `github.com/qorechain/qorechain-rdk/packages/go` e Java `io.github.qorechain:qorechain-rdk` **0.4.0** (Maven Central). Il broadcast live richiede un endpoint di nodo.

:::note
L'RDK TypeScript e i suoi template sono destinati alla testnet **`qorechain-diana`** e sono contrassegnati come **coming soon** per i flussi end-to-end completi. Fissa le versioni e verifica sulla testnet.
:::

### Crea lo scaffold di un progetto con `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Ogni profilo ha un template di partenza corrispondente (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Crea lo scaffold di uno con entrambe le forme:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Per uso non interattivo / CI, passa il template e la rete esplicitamente:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Lo scaffolder stampa il costo documentato di stake e creation-burn e i passaggi successivi per creare il tuo rollup e leggerne lo stato.

### Crea un rollup da codice

Costruisci una config da un preset, leggi lo stake e il tasso di burn attivi dalla chain, poi crea il rollup con un signing client. Il config builder applica la matrice di compatibilità settlement → proof su `validate()` / `build()`.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.025uqor" });
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

Non sei sicuro di quale profilo sia adatto? `rdk.suggestProfile("a lending protocol with predictable fees")` restituisce una raccomandazione assistita da QCAI (con un fallback documentato).

### Gestisci il ciclo di vita e leggi lo stato da codice

Il signing client espone l'intero ciclo di vita — `pauseRollup`, `resumeRollup`, `stopRollup`, oltre a `submitBatch`, `challengeBatch`, `resolveChallenge` ed `executeWithdrawal`. Le transizioni del ciclo di vita possono essere protette passando `currentStatus`.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

Leggi lo stato con il client REST tipizzato (non è richiesto alcun signer):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## Gestione del ciclo di vita

Un rollup attraversa gli stati `pending`, `active`, `paused` e `stopped`. Il creatore gestisce le transizioni con i seguenti comandi.

### Pause

Ferma temporaneamente il rollup. Lo stato è preservato e il rollup può essere ripreso. È richiesta una stringa di motivazione.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Resume

Riprende un rollup precedentemente messo in pausa.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Stop

Disattiva permanentemente il rollup e rilascia il suo stake. I QOR in stake — meno il burn di creazione una tantum — vengono restituiti al creatore.

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

## Comandi per operatori: batch e challenge

Gli operatori dei rollup inviano batch di settlement e i challenger possono contestare i batch ottimistici. Questi comandi sono alla base del livello di settlement descritto in **[Panoramica dei Rollup](/rollups/overview)** e **[ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)**.

### Invia un batch

Invia un batch di settlement per un rollup. Accetta l'ID del rollup, un indice di batch e una radice di stato codificata in esadecimale.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Contesta un batch

Contesta un batch inviato (per i rollup ottimistici). Accetta l'ID del rollup e l'indice di batch; passa la fraud proof con `--proof`. A partire dalla versione della chain **v3.1.74**, il percorso ottimistico **submit-batch → challenge-batch** è attivo e funziona end-to-end.

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

## Interrogazione

| Comando | Scopo |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Dettagli di un rollup specifico |
| `qorechaind query rdk list-rollups` | Tutti i rollup registrati |
| `qorechaind query rdk batch [rollup-id]` | Ultimo batch di settlement (o `--index`) |
| `qorechaind query rdk config` | Parametri del modulo RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Raccomanda un preset per un caso d'uso |

---

## Prossimi passi

* **[Disponibilità dei Dati](/rollups/data-availability)** — backend DA native, Celestia e ridondante.
* **[ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals)** — verifica delle prove e il flusso di prelievo L2 → L1 tramite `execute-withdrawal`.
