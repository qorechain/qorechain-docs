---
slug: /rollups/preset-profiles
title: Profili Preset
sidebar_label: Profili Preset
sidebar_position: 2
---

# Profili Preset

L'RDK include **profili preset** che forniscono configurazioni di rollup chiavi in mano, ottimizzate per le categorie applicative più comuni. Un preset raggruppa una modalità di settlement, una modalità di sequencer, un backend di data availability e i parametri di esecuzione, così puoi lanciare un rollup senza dover scegliere manualmente ogni opzione.

Il profilo viene passato come argomento posizionale a `create-rollup`:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
I valori per preset riportati di seguito corrispondono ai default dei profili distribuiti con **`@qorechain/rdk`**, che rispecchiano la tabella dei profili pubblicata dalla rete. Possono comunque evolvere man mano che l'RDK matura — interroga i parametri live del modulo con `qorechaind query rdk config` (oppure `RdkClient.params()` dall'SDK) per ottenere la configurazione autoritativa, e verifica sul testnet **`qorechain-diana`** prima del mainnet.
:::

---

## I profili preset

Ogni preset raggruppa un paradigma di settlement (e il sistema di proof richiesto da quel settlement), una modalità di sequencer, un backend di data availability, un modello di gas e una VM:

| Profilo | Settlement (proof) | Sequencer | DA | Modello di gas | VM | Caso d'uso previsto |
| ------- | ------------------ | --------- | -- | -------------- | -- | ------------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | Applicazioni DeFi e di tipo AMM — mercati di lending, DEX e derivati, dove contano finalità rapida e commissioni prevedibili |
| **`gaming`** | based | based | native | flat | custom | Stato di gioco ad alto throughput e a bassa latenza ed economie in-game |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA in programma) | standard | QoreChain Native (`native`) | Minting di NFT, marketplace e collezionabili digitali |
| **`enterprise`** | based | based | native | subsidized | EVM | Deployment permissioned e in consorzio con commissioni sponsorizzate (subsidized) |
| **`custom`** | completamente parametrizzabile (default: optimistic / fraud) | completamente parametrizzabile | completamente parametrizzabile | completamente parametrizzabile | completamente parametrizzabile (default: EVM) | Ogni campo è definito dall'utente — parti da zero e imposta tu stesso ciascuna opzione |

Alcuni vincoli derivano dalla [matrice settlement → proof](/rollups/overview): il settlement `optimistic` usa proof `fraud`, `zk` usa `snark` (o `stark`), mentre `based` e `sovereign` non prevedono alcuna proof. Il settlement `based` si abbina sempre alla modalità di sequencer `based`. Il preset `nft` oggi effettua il settlement in modo nativo, con **Celestia DA in programma**.

A partire da RDK v0.4.2, l'opzione della VM Wasm (il runtime che esegue i contratti CosmWasm) si chiama **`native`** — QoreChain Native. `cosmwasm` resta un alias legacy accettato, ed entrambi vengono mappati su `cosmwasm` a livello di protocollo, quindi la chain, l'explorer e la Dashboard restano invariati.

:::note
La configurazione per preset è stata verificata live sulla versione di chain **v3.1.74**, dove `create-rollup` applica automaticamente il preset del profilo: **`defi` = zk + EVM, `gaming` = based + VM custom, `nft` = optimistic + QoreChain Native (Wasm), `enterprise` = based + EVM, `custom` = optimistic + EVM (default)**. Il preset `custom` lascia aperto ogni campo — i valori mostrati sono i suoi default di partenza.
:::

Considera i quattro preset di dominio come punti di partenza sensati e il profilo **`custom`** come l'opzione completamente aperta. I parametri esatti raggruppati possono cambiare da una release all'altra — interroga `rdk config` (sotto) per i valori autoritativi, poi parti dal preset più vicino e affina.

La CLI [`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) genera lo scaffolding di un progetto starter eseguibile — un template per profilo (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — così puoi passare da un profilo a codice di creazione/query funzionante con un solo comando.

---

## Ottenere una raccomandazione: `suggest-profile`

Se non sei sicuro di quale preset faccia al caso tuo, la query `suggest-profile` accetta una descrizione in linguaggio naturale del tuo caso d'uso e restituisce un profilo consigliato.

```bash
qorechaind query rdk suggest-profile [use-case]
```

**Esempio:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

Il suggerimento è un utile punto di partenza — confronta la raccomandazione con i tuoi requisiti specifici (garanzie di settlement, modello di fiducia del sequencer, esigenze di data availability e VM) prima di impegnarti su una configurazione.

---

## Ispezionare la configurazione dei preset on-chain

Poiché i dettagli dei preset vengono risolti on-chain, il modo autoritativo per vedere a cosa corrisponde un profilo è interrogare il modulo e il rollup creato:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

Questo schema — interrogare `config` prima del deploy e poi `rollup` dopo — ti permette di confermare esattamente cosa ha prodotto il preset scelto, invece di affidarti a valori documentati che potrebbero evolvere.

---

## Prossimi passi

* **[Deployment di un rollup](/rollups/deploying-a-rollup)** — crea un rollup da un preset tramite la Dashboard o la CLI, poi gestiscine il ciclo di vita.
* **[Panoramica dei rollup](/rollups/overview)** — i paradigmi di settlement e le modalità di sequencer che un preset raggruppa.
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — il riferimento del modulo a più basso livello.
