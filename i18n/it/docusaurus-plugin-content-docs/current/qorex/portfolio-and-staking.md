---
slug: /qorex/portfolio-and-staking
title: Portafoglio e Staking
sidebar_label: Portafoglio e Staking
sidebar_position: 4
---

# Portafoglio e Staking

## Portafoglio

La vista **Portfolio** (protetta da autenticazione biometrica la prima volta che la apri in ogni sessione) mostra un **grafico a ciambella delle allocazioni** — il tuo QOR unificato tra le sue tre corsie (Native, EVM, SVM) — con una didascalia sotto l'anello, oltre a una riga per ogni asset. Le percentuali compaiono una volta che il feed dei prezzi è attivo.

Tocca un asset qualsiasi per aprire il **dettaglio dell'asset**, che mostra:

- **Cronologia del saldo** — un andamento reale costruito a partire dai tuoi trasferimenti on-chain.
- **Attività recente** — righe delle transazioni con ricerca inversa dello **@handle**, così le controparti vengono mostrate per nome ove possibile.

## Staking ed Earn

Fare staking di QOR contribuisce a mettere in sicurezza QoreChain e ti fa guadagnare ricompense. Tutte le operazioni di staking sono transazioni on-chain reali che recano la tua firma post-quantistica.

### Fai staking con un validatore

1. Apri **Stake**.
2. Scegli un validatore dall'elenco (caricato in tempo reale dalla chain).
3. Inserisci un importo ed effettua la **delega** con conferma biometrica.
4. Riscuoti le ricompense dalla stessa schermata ogni volta che maturano.

:::note Nessun periodo di vincolo oggi — l'attesa è solo in uscita
Non c'è un termine fisso da scegliere, perché al momento non ne esiste uno: la delega resta attiva con le ricompense che affluiscono a partire dal blocco successivo finché non chiedi di revocarla — non c'è una scadenza da rinnovare né una durata minima dello staking. L'unico periodo di attesa riguarda l'uscita: una volta revocata la delega, quel QOR resta per 21 giorni in un periodo di unbonding, senza generare ricompense e non movimentabile, prima di tornare nel tuo saldo spendibile. Spostare invece una delega verso un altro validatore (redelegate) evita del tutto questa attesa. Questo descrive il comportamento attuale della chain, non una garanzia permanente — vedi [Esiste un periodo di vincolo?](/user-guide/staking-and-delegation#lock-in-period) per maggiori dettagli.
:::

:::note Questa schermata non ha ancora un proprio pulsante Undelegate
Questa schermata Stake copre solo la delega e la riscossione. Per revocare la delega direttamente da una schermata di QoreX, usa invece la [schermata Stake dell'estensione browser](/qorex/browser-extension#stake) — oppure revoca la delega tramite la [Dashboard](/dashboard/staking-and-validators#delegate), che invia la richiesta al QoreX che hai collegato, app inclusa, perché tu la approvi.
:::

### Earn

La vista **Earn** riepiloga in un unico posto le tue posizioni attive e il rendimento.

## Prossimi passi

- [Invio e Ricezione](/qorex/send-and-receive) — sposta QOR e asset esterni.
- [Sicurezza e Recupero](/qorex/security-and-recovery) — guardiani, eredità con Legacy e collegamento dei dispositivi.
