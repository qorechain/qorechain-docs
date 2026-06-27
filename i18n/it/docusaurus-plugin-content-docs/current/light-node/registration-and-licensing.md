---
slug: /light-node/registration-and-licensing
title: Registrazione e licenze
sidebar_label: Registrazione e licenze
sidebar_position: 4
---

# Registrazione e licenze

Per guadagnare la [quota di ricompensa del 3% riservata ai light node](/light-node/rewards-and-monitoring), un light node deve essere **registrato on-chain** e deve continuare a dimostrare di essere attivo. Questa pagina spiega come funziona la registrazione, come il nodo dimostra la propria liveness e come registrare e ottenere la licenza per un nodo tramite la Dashboard.

## Registrazione on-chain

La registrazione iscrive il tuo light node sulla chain, così che il protocollo sappia che esiste, di che tipo è (`sx` o `ux`) e quale chiave operatore lo controlla. Una volta registrato e attivo, il nodo diventa idoneo alla quota di ricompensa riservata ai light node.

### Generazione del comando di registrazione

L'edizione SX può stampare il comando esatto della chain per registrare questo nodo. Esegui:

```bash
lightnode-sx register
```

Questo legge la tua chiave operatore dal keyring e stampa una transazione `qorechaind` pronta all'uso, insieme all'indirizzo del tuo operatore, al tipo di nodo e alla versione. Il comando accetta due flag opzionali:

- `--type` — il tipo di nodo, `sx` o `ux` (il valore predefinito è `sx`).
- `--version` — la versione del nodo da registrare (il valore predefinito è la versione del binario stesso).

Il comando stampato registra il nodo nel modulo `x/lightnode` on-chain. Inviarlo con un account operatore finanziato sulla rete a cui ti stai unendo (testnet `qorechain-diana` o mainnet `qorechain-vladi`).

:::note
`lightnode-sx register` **stampa** la transazione di registrazione affinché tu possa esaminarla e inviarla — non la trasmette autonomamente. In questo modo mantieni il controllo su quando e come il nodo viene registrato.
:::

## Prove di liveness tramite heartbeat

La sola registrazione non basta per restare idonei. Un light node registrato deve dimostrare di essere costantemente online inviando **prove di liveness tramite heartbeat**. Questi heartbeat sono il modo in cui la chain distingue i nodi attivi — idonei alla quota di ricompensa — dai nodi registrati ma offline.

In pratica, questo significa che un nodo registrato e mantenuto in esecuzione (e sincronizzato) conserva la propria idoneità, mentre un nodo che va offline smette di dimostrare la liveness e perde l'idoneità finché non torna online. Mantenere il daemon in esecuzione e in salute è quindi parte del guadagnare ricompense — consulta [Ricompense e monitoraggio](/light-node/rewards-and-monitoring) per sapere come monitorare lo stato di salute dell'heartbeat e della sincronizzazione.

### Pipeline di heartbeat co-firmati PQC {#pqc-cosigned-heartbeat-pipeline}

QoreChain è **PQC-required per impostazione predefinita**, perciò la transazione di liveness tramite heartbeat è prodotta attraverso una pipeline post-quantistica con co-firma anziché con una firma solo classica. Il daemon costruisce l'heartbeat non firmato, poi lo co-firma con una firma **ibrida Dilithium-5 (ML-DSA-87)** prima della trasmissione — la stessa postura post-quantistica che la chain impone a ogni transazione. Il nodo invia un heartbeat per ciascuna finestra `interval_blocks` (corrispondente al parametro `heartbeat_interval` della chain), regolando il proprio ritmo in base all'altezza di blocco per evitare rifiuti dovuti a invii anticipati.

Gli heartbeat on-chain sono opt-in nel daemon: abilita la sezione `[heartbeat]` nella configurazione del nodo (`enabled = true`) e fai puntare `qorechaind_path` a un binario `qorechaind`, che esegue il flusso generate-then-co-sign. Quando ciò non è configurato, il nodo funziona senza inviare heartbeat on-chain e l'operatore può inviare manualmente la liveness con i comandi della chain stampati.

## Registrazione e licenze tramite la Dashboard

Puoi anche registrare un nodo e ottenere una licenza tramite la QoreChain Dashboard, che offre un flusso guidato invece di costruire i comandi della chain a mano.

- Registra il tuo nodo da **Tools → Node Registration**.
- Ottieni o rinnova una licenza da **Tools → Buy License**.

Il flusso della Dashboard ti guida nell'associazione della tua chiave operatore, nella scelta del tipo di nodo e della rete, e nel completamento della registrazione on-chain. Usalo se preferisci un'interfaccia grafica alla CLI, oppure per gestire le licenze insieme alla registrazione in un unico posto.

## Dove andare ora

- [Ricompense e monitoraggio](/light-node/rewards-and-monitoring) — come si guadagna, si capitalizza e si monitora la quota del 3%.
- [Edizione SX](/light-node/sx-edition) — il comando `register` e il riferimento completo della CLI.
