---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

L'**Explorer** è la finestra della Dashboard sulla chain. Usalo per cercare blocchi, transazioni, indirizzi e validatori, e per osservare l'attività della rete in tempo reale. L'Explorer è in sola lettura — non è necessaria alcuna connessione del wallet per navigarlo.

## La pagina di panoramica

Apri **Explorer** dalla Dashboard per vedere un'istantanea in tempo reale della rete:

- **Stato della rete** — chain ID, stato corrente e un indicatore quantum-safe.
- **Attività dei blocchi** — l'altezza dell'ultimo blocco, il tempo medio di blocco e i blocchi prodotti oggi.
- **Offerta** — QOR totali in bonding, il rapporto di bonding e l'offerta circolante.
- **Statistiche principali** — transazioni totali, validatori attivi e totali, e indirizzi totali.
- **Ultimi blocchi** — un elenco in tempo reale con altezza, orario, numero di transazioni e proposer di ciascun blocco.
- **Ultime transazioni** — un elenco in tempo reale con hash, tipo, blocco, importo e mittente di ciascuna transazione.

Fai clic su una riga di blocco o di transazione per aprirne la pagina di dettaglio. Un controllo di aggiornamento su ciascun elenco recupera le voci più recenti.

## Ricerca

La casella di ricerca in cima all'Explorer accetta uno qualsiasi dei seguenti elementi e ti indirizza automaticamente alla pagina giusta:

- Un **indirizzo** (`qor1...`)
- Un **hash di transazione**
- Un'**altezza di blocco** (un numero)

## Dettagli della transazione

La pagina di una transazione mostra hash, stato, importo, mittente e destinatario (entrambi cliccabili), commissione, altezza del blocco, tipo di transazione e memo se presente. Puoi copiare l'hash e attivare una vista raw della transazione completa per un'ispezione più approfondita.

## Dettagli del blocco

La pagina di un blocco mostra altezza, timestamp, proposer, hash, numero di transazioni, gas utilizzato e l'elenco delle transazioni che contiene, insieme alle informazioni sul consenso e sulle firme post-quantum. I controlli precedente e successivo ti permettono di scorrere la chain blocco per blocco.

## Dettagli dell'indirizzo

Un indirizzo QoreChain è un unico account con tre codifiche — Native (`qor1...`), EVM (`0x...`) e SVM (base58) — e la pagina dell'indirizzo unisce l'attività di tutti e tre i rail in un'unica vista di quella singola identità.

La pagina mostra l'indirizzo con un codice QR scansionabile, il suo saldo QOR, il numero di transazioni e i totali dei trasferimenti in entrata e in uscita. Più in basso si trova la cronologia combinata delle transazioni dell'indirizzo sui rail Native, EVM e SVM — trasferimenti, deployment di contratti, registrazioni di chiavi PQC, swap, richieste al faucet e altro — ciascuna con importo, orario e stato. Puoi copiare l'indirizzo, scaricare il suo codice QR e aprire qualsiasi transazione per i dettagli.

## Validatori {#validators}

La vista dei validatori elenca i validatori della rete con schede riepilogative per il numero di validatori attivi, i QOR totali in bonding e la salute del consenso. La tabella mostra per ciascun validatore rango, moniker, potere di voto, commissione e stato (ad esempio attivo o jailed), oltre a un indicatore post-quantum. Una casella di ricerca filtra per nome o indirizzo del validatore. Per delegare a un validatore, consulta [Staking e Validatori](/dashboard/staking-and-validators).
