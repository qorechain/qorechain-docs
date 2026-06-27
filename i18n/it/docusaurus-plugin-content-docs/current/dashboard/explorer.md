---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

L'**Explorer** è la finestra della Dashboard sulla chain. Usalo per cercare blocchi, transazioni, indirizzi e validatori, e per osservare l'attività della rete in tempo reale. L'Explorer è in sola lettura — non è necessaria alcuna connessione del wallet per esplorarlo.

## La pagina di panoramica

Apri l'**Explorer** dalla Dashboard per vedere un'istantanea in tempo reale della rete:

- **Stato della rete** — chain ID, stato corrente e un indicatore quantum-safe.
- **Attività dei blocchi** — l'altezza dell'ultimo blocco, il tempo medio di blocco e i blocchi prodotti oggi.
- **Supply** — totale di QOR vincolati (bonded), il rapporto di bonding e la supply circolante.
- **Statistiche principali** — totale transazioni, validatori attivi e totali, e totale indirizzi.
- **Ultimi blocchi** — un elenco in tempo reale con l'altezza, l'orario, il numero di transazioni e il proposer di ogni blocco.
- **Ultime transazioni** — un elenco in tempo reale con hash, tipo, blocco, importo e mittente di ogni transazione.

Clicca su una qualsiasi riga di blocco o transazione per aprirne la pagina di dettaglio. Un controllo di aggiornamento su ciascun elenco recupera le voci più recenti.

## Ricerca

La casella di ricerca in cima all'Explorer accetta uno qualsiasi dei seguenti elementi e ti indirizza automaticamente alla pagina corretta:

- Un **indirizzo** (`qor1...`)
- Un **hash di transazione**
- Un'**altezza di blocco** (un numero)

## Dettagli della transazione

Una pagina di transazione mostra il suo hash, lo stato, l'importo, il mittente e il destinatario (entrambi cliccabili), la fee, l'altezza del blocco, il tipo di transazione e il memo, se presente. Puoi copiare l'hash e attivare una vista raw della transazione completa per un'ispezione più approfondita.

## Dettagli del blocco

Una pagina di blocco mostra la sua altezza, il timestamp, il proposer, l'hash, il numero di transazioni, il gas utilizzato e l'elenco delle transazioni che contiene, insieme alle informazioni sul consenso e sulla firma post-quantistica. I controlli precedente e successivo ti permettono di scorrere la chain blocco per blocco.

## Dettagli dell'indirizzo

Una pagina di indirizzo mostra l'indirizzo con un codice QR scansionabile, il suo saldo in QOR, il numero di transazioni e i totali dei trasferimenti in entrata e in uscita. Sotto è riportata la cronologia completa delle transazioni dell'indirizzo — trasferimenti, swap, richieste al faucet e altro — ciascuna con il proprio importo, orario e stato. Puoi copiare l'indirizzo, scaricarne il codice QR e aprire qualsiasi transazione per i dettagli.

## Validatori {#validators}

La vista dei validatori elenca i validatori della rete con schede riassuntive per il conteggio dei validatori attivi, il totale di QOR vincolati e lo stato di salute del consenso. La tabella mostra il rango, il moniker, il potere di voto, la commissione e lo stato di ogni validatore (ad esempio attivo o jailed), oltre a un indicatore post-quantistico. Una casella di ricerca filtra per nome o indirizzo del validatore. Per delegare a un validatore, consulta [Staking & Validators](/dashboard/staking-and-validators).
