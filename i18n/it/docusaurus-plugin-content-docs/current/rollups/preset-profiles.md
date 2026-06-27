---
slug: /rollups/preset-profiles
title: Profili Preset
sidebar_label: Profili Preset
sidebar_position: 2
---

# Profili Preset

L'RDK include **profili preset** che forniscono configurazioni di rollup chiavi in mano ottimizzate per le categorie applicative più comuni. Un preset raggruppa una modalità di settlement, una modalità sequencer, un backend di disponibilità dei dati e parametri di esecuzione, così puoi lanciare un rollup senza dover scegliere manualmente ogni opzione.

Un profilo viene passato posizionalmente a `create-rollup`:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
I valori per singolo preset riportati di seguito corrispondono ai valori di default dei profili **`@qorechain/rdk`** distribuiti, che rispecchiano la tabella dei profili pubblicata dalla rete. Possono comunque evolvere man mano che l'RDK matura — interroga i parametri live del modulo con `qorechaind query rdk config` (o `RdkClient.params()` dall'SDK) per la configurazione autorevole, e valida sulla testnet **`qorechain-diana`** prima della mainnet.
:::

---

## I profili preset

Ogni preset raggruppa un paradigma di settlement (e il sistema di prova richiesto dal suo settlement), una modalità sequencer, un backend di disponibilità dei dati, un modello di gas e una VM:

| Profilo | Settlement (prova) | Sequencer | DA | Modello di gas | VM | Caso d'uso previsto |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | Applicazioni DeFi e in stile AMM — mercati di prestito, DEX e derivati in cui contano finalità rapida e commissioni prevedibili |
| **`gaming`** | based | based | native | flat | custom | Stato di gioco ed economie in-game ad alto throughput e bassa latenza |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA pianificato) | standard | CosmWasm | Minting di NFT, marketplace e collezionabili digitali |
| **`enterprise`** | based | based | native | subsidized | EVM | Deployment permissioned e consortium con commissioni sponsorizzate (subsidized) |
| **`custom`** | completamente parametrizzato (default: optimistic / fraud) | completamente parametrizzato | completamente parametrizzato | completamente parametrizzato | completamente parametrizzato (default: EVM) | Ogni campo è definito dall'utente — parti da zero e imposta tu stesso ogni opzione |

Alcuni vincoli derivano dalla [matrice settlement → prova](/rollups/overview): il settlement `optimistic` usa prove `fraud`, `zk` usa `snark` (o `stark`), e `based` e `sovereign` non prevedono alcuna prova. Il settlement `based` si abbina sempre alla modalità sequencer `based`. Il preset `nft` oggi effettua il settlement in modo nativo con **Celestia DA pianificato**.

:::note
La configurazione per singolo preset è stata verificata live sulla chain versione **v3.1.74**, dove `create-rollup` applica automaticamente il preset del profilo: **`defi` = zk + EVM, `gaming` = based + VM custom, `nft` = optimistic + CosmWasm, `enterprise` = based + EVM, `custom` = optimistic + EVM (default)**. Il preset `custom` lascia aperto ogni campo — i valori mostrati sono i suoi default di partenza.
:::

Considera i quattro preset di dominio come punti di partenza sensati e il profilo **`custom`** come l'opzione completamente aperta. I parametri precisi raggruppati possono cambiare tra le release — interroga `rdk config` (sotto) per i valori autorevoli, poi parti dal preset più vicino e affina.

La CLI [`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) genera lo scaffold di un progetto starter eseguibile — un template per ogni profilo (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — così puoi passare da un profilo a codice di creazione/query funzionante con un solo comando.

---

## Ottenere una raccomandazione: `suggest-profile`

Se non sei sicuro di quale preset sia adatto, la query `suggest-profile` accetta una descrizione in linguaggio chiaro del tuo caso d'uso e restituisce un profilo raccomandato.

```bash
qorechaind query rdk suggest-profile [use-case]
```

**Esempio:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

Il suggerimento è un utile punto di partenza — confronta la raccomandazione con i tuoi requisiti specifici (garanzie di settlement, modello di fiducia del sequencer, esigenze di disponibilità dei dati e VM) prima di scegliere definitivamente una configurazione.

---

## Ispezione della configurazione del preset on-chain

Poiché i dettagli del preset vengono risolti on-chain, il modo autorevole per vedere a cosa si risolve un profilo è interrogare il modulo e il rollup creato:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

Questo schema — interrogare `config` prima del deploy, poi interrogare `rollup` dopo — ti permette di confermare esattamente cosa ha prodotto il preset scelto, anziché affidarti a valori documentati che potrebbero evolvere.

---

## Prossimi passi

* **[Deploying a Rollup](/rollups/deploying-a-rollup)** — crea un rollup da un preset tramite la Dashboard o la CLI, poi gestisci il suo ciclo di vita.
* **[Panoramica dei Rollup](/rollups/overview)** — i paradigmi di settlement e le modalità sequencer raggruppate da un preset.
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — il riferimento al modulo di livello più basso.
