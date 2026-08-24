---
slug: /light-node/registration-and-licensing
title: Registrazione e licenze
sidebar_label: Registrazione e licenze
sidebar_position: 4
---

# Registrazione e licenze

Per ottenere la [quota di ricompensa del 3% per i light node](/light-node/rewards-and-monitoring), un light node deve essere **registrato on-chain** e deve continuare a dimostrare di essere attivo. Questa pagina spiega come funziona la registrazione, come il nodo dimostra la propria attività (liveness) e come registrare e licenziare un nodo tramite la Dashboard.

## Registrazione on-chain

La registrazione inserisce il tuo light node sulla chain, in modo che il protocollo sappia che esiste, quale tipo è (`sx` o `ux`) e quale chiave operatore lo controlla. Una volta registrato e attivo, il nodo diventa idoneo per la quota di ricompensa dei light node.

### Generare il comando di registrazione

L'edizione SX può stampare il comando esatto della chain per registrare questo nodo. Esegui:

```bash
lightnode-sx register
```

Questo comando legge la tua chiave operatore dal keyring e stampa una transazione `qorechaind` pronta all'uso, insieme al tuo indirizzo operatore, al tipo di nodo e alla versione. Il comando accetta due flag opzionali:

- `--type` — il tipo di nodo, `sx` o `ux` (predefinito `sx`).
- `--version` — la versione del nodo da registrare (predefinita: la versione del binario stesso).

Il comando stampato registra il nodo nel modulo `x/lightnode` on-chain. Invialo con un account operatore finanziato sulla rete a cui ti stai unendo (testnet `qorechain-diana` o mainnet `qorechain-vladi`).

:::note
`lightnode-sx register` **stampa** la transazione di registrazione perché tu la esamini e la invii — non la trasmette da solo. Questo ti lascia il pieno controllo su quando e come il nodo viene registrato.
:::

## Prove di liveness tramite heartbeat

La sola registrazione non basta per rimanere idonei. Un light node registrato deve dimostrare continuamente di essere online inviando **prove di liveness tramite heartbeat**. Questi heartbeat sono il modo in cui la chain distingue i nodi attivi — idonei per la quota di ricompensa — dai nodi registrati ma offline.

In pratica, un nodo registrato e mantenuto in funzione (e sincronizzato) conserva la propria idoneità, mentre un nodo che va offline smette di dimostrare la propria attività e perde l'idoneità finché non torna online. Mantenere il daemon in esecuzione e in buono stato fa quindi parte del guadagnare le ricompense — vedi [Ricompense e monitoraggio](/light-node/rewards-and-monitoring) per capire come controllare lo stato di heartbeat e sincronizzazione.

### Pipeline di heartbeat co-firmata PQC {#pqc-cosigned-heartbeat-pipeline}

QoreChain richiede la PQC **per impostazione predefinita**, quindi la transazione di liveness tramite heartbeat viene prodotta attraverso una pipeline co-firmata post-quantistica anziché con una firma puramente classica. Il daemon costruisce l'heartbeat non firmato, quindi lo co-firma con una firma **ibrida Dilithium-5 (ML-DSA-87)** prima della trasmissione — la stessa impostazione post-quantistica che la chain impone per ogni transazione. Il nodo invia un heartbeat per ogni finestra di `interval_blocks` (corrispondente al parametro `heartbeat_interval` della chain), regolando il proprio ritmo in base all'altezza dei blocchi per evitare rifiuti dovuti a invii anticipati.

Gli heartbeat on-chain sono opzionali nel daemon: abilita la sezione `[heartbeat]` nella configurazione del nodo (`enabled = true`) e imposta `qorechaind_path` su un binario `qorechaind`, che esegue il flusso di generazione e co-firma. Quando questa opzione non è configurata, il nodo funziona senza inviare heartbeat on-chain e l'operatore può inviare la prova di liveness manualmente con i comandi della chain stampati.

## Registrazione e licenze tramite la Dashboard

Puoi anche avviare un nodo e verificarne lo stato di licenza tramite la pagina **Tools** della Dashboard QoreChain. Avviare il nodo e aderire al programma di ricompense sono due cose diverse, e la Dashboard le tiene separate invece di presentare un unico flusso di iscrizione guidato:

1. **Avvia il tuo nodo (Tools → Light Node, passaggio 1).** Non richiede alcuna licenza né alcun controllo on-chain, ed è mostrato a ogni visitatore prima di qualsiasi altra cosa. Legge in tempo reale il manifest attuale della rete e guida attraverso il download e la verifica del binario, l'inizializzazione del nodo con il genesis, la configurazione di `config.toml` sui peer della rete e la sincronizzazione tramite state-sync invece che dal genesis.
2. **Controlla lo stato del tuo programma di ricompense (Tools → Light Node).** Aderire alla quota di ricompensa dei light node è un passaggio separato, vincolato on-chain: richiede una licenza `lightnode_operator` attiva concessa on-chain, un minimo di QOR delegati — conteggiati come totale su tutti i validatori a cui deleghi, non per singolo validatore, e letti in tempo reale dallo staking anziché autodichiarati — e una piccola commissione di registrazione on-chain. **L'iscrizione non è ancora aperta**, e acquistare una licenza tramite **Buy License** non la apre in anticipo — oggi non c'è nulla a cui iscriversi. Nel frattempo, avvia e sincronizza il tuo nodo; l'uptime accumulato prima dell'apertura dell'iscrizione dovrebbe contare una volta che questa si aprirà.
3. **Registrati una volta che la tua licenza è concessa on-chain (Tools → Light Node).** Una licenza acquistata tramite **Buy License** viene registrata prima sul nostro sistema; la concessione che la rende riconosciuta on-chain è un passaggio separato, e la registrazione viene rifiutata finché quella concessione non è avvenuta. Una volta avvenuta, questa scheda sostituisce il pannello di stato con un modulo di registrazione: il tuo indirizzo operatore (`qor1…`), un moniker e un URL di endpoint pubblico, oltre a una conferma dell'impegno di stake.
4. **Conferma e vincola lo stake.** Dopo l'invio, la Dashboard mostra un riepilogo di conferma della registrazione (moniker, indirizzo operatore, endpoint, intento di stake, stato). Vincola lo stake confermato dal tuo indirizzo operatore una volta che l'idoneità si apre.

Usa il flusso della Dashboard se preferisci un'interfaccia grafica alla CLI, oppure per gestire licenza e registrazione insieme in un unico posto. Il comando `lightnode-sx register` sopra descritto resta disponibile per chi preferisce costruire ed esaminare la transazione da sé — la registrazione on-chain e l'idoneità al programma di ricompense sono governate dalla chain allo stesso modo, indipendentemente dal percorso scelto.

## Dove andare ora

- [Ricompense e monitoraggio](/light-node/rewards-and-monitoring) — come viene guadagnata, capitalizzata e monitorata la quota del 3%.
- [Edizione SX](/light-node/sx-edition) — il comando `register` e il riferimento completo alla CLI.
