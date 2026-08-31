---
slug: /qorex/portfolio-and-staking
title: Portafoglio e Staking
sidebar_label: Portafoglio e Staking
sidebar_position: 4
---

# Portafoglio e Staking

## Portafoglio

La vista **Portfolio** (protetta da autenticazione biometrica la prima volta che la apri in ogni sessione) mostra un **grafico a ciambella delle allocazioni** — il tuo QOR unificato tra le sue tre corsie (Native, EVM, SVM) — con una didascalia sotto l'anello, oltre a una riga per ogni asset. Le percentuali compaiono una volta che il feed dei prezzi è attivo, e ogni saldo mostra il suo valore stimato in USD accanto all'importo in QOR.

**Da dove arriva il prezzo.** QoreX lo legge da `GET https://api.qore.network/v1/price/{symbol}` — un endpoint pubblico nostro, non una chiamata diretta a un exchange qualsiasi. Nulla sul tuo dispositivo comunica con una fonte di prezzo esterna all'infrastruttura di QoreChain, quindi il tuo indirizzo IP non viene mai esposto a una di esse. Se un prezzo affidabile non è davvero disponibile, l'endpoint risponde con un errore invece di indovinare — QoreX mostra il prezzo come non disponibile invece di visualizzare mai uno zero fittizio o una cifra non aggiornata come se fosse attuale.

Tocca un asset qualsiasi per aprire il **dettaglio dell'asset**, che mostra:

- **Cronologia del saldo** — un andamento reale costruito a partire dai tuoi trasferimenti on-chain.
- **Attività recente** — righe delle transazioni con ricerca inversa dello **@handle**, così le controparti vengono mostrate per nome ove possibile. Tocca una riga qualsiasi per aprirne il dettaglio completo: importo, controparte, blocco, hash della transazione e firma.

## Staking ed Earn

Fare staking di QOR contribuisce a mettere in sicurezza QoreChain e ti fa guadagnare ricompense. Tutte le operazioni di staking sono transazioni on-chain reali che recano la tua firma post-quantistica.

### Fai staking con un validatore

1. Apri **Stake**.
2. Scegli un validatore dall'elenco (caricato in tempo reale dalla chain, con lo stake più piccolo mostrato per primo, ed esclude qualsiasi validatore attualmente in jail — delegare a uno di essi non è mai ciò che vuoi).
3. Inserisci un importo ed effettua la **delega** con conferma biometrica.
4. Riscuoti le ricompense dalla stessa schermata ogni volta che maturano.

:::note Nessun periodo di vincolo oggi — l'attesa è solo in uscita
Non c'è un termine fisso da scegliere, perché al momento non ne esiste uno: la delega resta attiva con le ricompense che affluiscono a partire dal blocco successivo finché non chiedi di revocarla — non c'è una scadenza da rinnovare né una durata minima dello staking. L'unico periodo di attesa riguarda l'uscita: una volta revocata la delega, quel QOR resta per 21 giorni in un periodo di unbonding, senza generare ricompense e non movimentabile, prima di tornare nel tuo saldo spendibile. Spostare invece una delega verso un altro validatore (redelegate) evita del tutto questa attesa. Questo descrive il comportamento attuale della chain, non una garanzia permanente — vedi [Esiste un periodo di vincolo?](/user-guide/staking-and-delegation#lock-in-period) per maggiori dettagli.
:::

### Sposta lo stake tra validatori (redelegate) {#move-stake}

Sposta il QOR che hai già in staking verso un altro validatore — o suddividilo tra più validatori — senza toccare in alcun modo la coda di unbonding di 21 giorni. Lo stake continua a generare ricompense per tutto il tragitto.

1. Apri **Stake** e tocca il validatore presso cui il tuo QOR si trova attualmente.
2. Scegli dove deve andare — seleziona una singola destinazione, oppure diverse contemporaneamente. Suddividendolo tra più validatori l'importo viene diviso in parti uguali, e la cifra esatta destinata a ciascun validatore viene mostrata prima di confermare.
3. Conferma con approvazione biometrica. Ogni destinazione si sposta in un'**unica transazione** — una sola commissione, e o l'intero spostamento va a buon fine oppure nessuna parte di esso lo fa.

Questa è la mossa da fare quando un validatore a cui hai delegato finisce in jail o alza la sua commissione — prima che questa funzione esistesse, l'unico modo per uscire era revocare la delega e aspettare 21 giorni senza guadagnare nulla; spostare invece non costa alcuna attesa né ricompense perse.

:::caution Esiste un limite per coppia, e la commissione viene spesa anche se lo raggiungi
La chain consente al massimo **7 redelegazioni in corso contemporaneamente per la stessa coppia (origine, destinazione) di validatori** — un uso normale non si avvicinerà mai a questo limite, ma QoreX lo verifica prima che tu firmi e ti avvisa se lo hai raggiunto. Superato questo limite, la transazione fallisce on-chain e la commissione di rete viene comunque spesa, quindi non ritentare uno spostamento già stato respinto per questo motivo senza prima attendere che una delle redelegazioni esistenti si concluda.
:::

### Revoca la delega (Undelegate)

1. Apri **Stake**, tocca il validatore e scegli di revocare la delega invece di spostare il tuo stake.
2. Inserisci l'importo — la schermata mostra il **periodo di unbonding di 21 giorni** e la **commissione esatta** che pagherai, entrambi prima che tu confermi.
3. Conferma con approvazione biometrica. Il QOR smette immediatamente di generare ricompense e torna spendibile una volta completato il periodo di unbonding.

### Earn

La vista **Earn** riepiloga in un unico posto le tue posizioni attive e il rendimento.

## Prossimi passi

- [Invio e Ricezione](/qorex/send-and-receive) — sposta QOR e asset esterni.
- [Sicurezza e Recupero](/qorex/security-and-recovery) — guardiani, eredità con Legacy e collegamento dei dispositivi.
