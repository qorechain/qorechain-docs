---
slug: /qorex/portfolio-and-staking
title: Portafoglio e Staking
sidebar_label: Portafoglio e Staking
sidebar_position: 4
---

# Portafoglio e Staking

## Portafoglio

La vista **Portfolio** (protetta da autenticazione biometrica la prima volta che la apri in ogni sessione) mostra un **grafico a ciambella delle allocazioni** — il tuo QOR unificato tra le sue tre corsie (Native, EVM, SVM) — con una didascalia sotto l'anello, oltre a una riga per ogni asset. Le percentuali compaiono una volta che il feed dei prezzi è attivo, e ogni saldo mostra il suo valore stimato in USD accanto all'importo in QOR. Sulla **testnet**, il QOR viene mostrato **senza valore in USD** — i token di test non ne hanno.

Usa **+ Coin or token** per aggiungere coin e token prima di possederne, e **Receive** per ottenere i loro indirizzi — vedi [Coin e token](/qorex/send-and-receive#coins-and-tokens).

**Da dove arriva il prezzo.** QoreX lo legge da `GET https://api.qore.network/v1/price/{symbol}` — un endpoint pubblico nostro, non una chiamata diretta a un exchange qualsiasi. Nulla sul tuo dispositivo comunica con una fonte di prezzo esterna all'infrastruttura di QoreChain, quindi il tuo indirizzo IP non viene mai esposto a una di esse. Se un prezzo affidabile non è davvero disponibile, l'endpoint risponde con un errore invece di indovinare — QoreX mostra il prezzo come non disponibile invece di visualizzare mai uno zero fittizio o una cifra non aggiornata come se fosse attuale.

Tocca un asset qualsiasi per aprire il **dettaglio dell'asset**, che mostra:

- **Cronologia del saldo** — un andamento reale costruito a partire dai tuoi trasferimenti on-chain.
- **Attività recente** — righe delle transazioni con ricerca inversa dello **@handle**, così le controparti vengono mostrate per nome ove possibile. Tocca una riga qualsiasi per aprirne il dettaglio completo: importo, controparte, blocco, hash della transazione e firma.

## Staking ed Earn

Fare staking di QOR contribuisce a mettere in sicurezza QoreChain e ti fa guadagnare ricompense, che non sono garantite. Tutte le operazioni di staking sono transazioni on-chain reali che recano la tua firma post-quantistica.

### Fai staking con un validatore

1. Apri **Stake**.
2. Scegli un validatore dall'elenco (caricato in tempo reale dalla chain, con lo stake più piccolo mostrato per primo, ed esclude qualsiasi validatore attualmente in jail — delegare a uno di essi non è mai ciò che vuoi). I validatori presso cui hai già del QOR riportano un badge *staked*.
3. Inserisci un importo. Mentre digiti, QoreX ti avvisa se ciò che resterebbe non coprirebbe la prossima commissione di rete: *«Rimarrebbero \{remaining\} QOR — meno dei \{fee\} QOR che costa una transazione. Non potresti fare unstake né riscuotere le ricompense finché questo account non detiene di nuovo QOR per la commissione.»* È un avviso, non un blocco — sono i tuoi soldi — ma sia l'unstake sia la riscossione costano una commissione prelevata dal tuo saldo **liquido**, quindi fare staking fino a rimanere quasi senza nulla blocca lo stake finché qualcuno non invia QOR.
4. **Conferma** (biometria su mobile). Puoi fare staking di QOR in vesting, fino al tuo totale, ma la commissione di rete deve provenire dal tuo QOR **sbloccato** — il QOR in vesting non può pagare le commissioni.
5. Riscuoti le ricompense dalla stessa schermata ogni volta che maturano — vedi sotto.

:::note Nessun periodo di vincolo oggi — l'attesa è solo in uscita
Non c'è un termine fisso da scegliere, perché al momento non ne esiste uno: la delega resta attiva con le ricompense che affluiscono a partire dal blocco successivo finché non chiedi di revocarla — non c'è una scadenza da rinnovare né una durata minima dello staking. L'unico periodo di attesa riguarda l'uscita: una volta revocata la delega, quel QOR resta per 21 giorni in un periodo di unbonding, senza generare ricompense e non movimentabile, prima di tornare nel tuo saldo spendibile. Spostare invece una delega verso un altro validatore (redelegate) evita del tutto questa attesa. Un modulo opzionale di staking con blocco temporale è in fase di test solo sulla testnet (v3.2.4; vedi [Staking con blocco temporale](/user-guide/staking-and-delegation#time-locked-staking)); non è sulla mainnet e QoreX non ha una schermata per esso. Questo descrive il comportamento attuale della mainnet, non una garanzia permanente — vedi [Esiste un periodo di vincolo?](/user-guide/staking-and-delegation#lock-in-period) per maggiori dettagli.
:::

### Sposta lo stake tra validatori (redelegate) {#move-stake}

Sposta il QOR che hai già in staking verso un altro validatore — o suddividilo tra più validatori — senza toccare in alcun modo la coda di unbonding di 21 giorni. Lo stake continua a generare ricompense per tutto il tragitto.

1. Apri **Stake** e tocca il validatore presso cui il tuo QOR si trova attualmente; il pannello offre **Move stake**.
2. Scegli dove deve andare — seleziona una singola destinazione, oppure diverse contemporaneamente. Suddividendolo tra più validatori l'importo viene diviso in parti uguali, e la cifra esatta destinata a ciascun validatore viene mostrata prima di confermare.
3. Conferma con approvazione biometrica. Ogni destinazione si sposta in un'**unica transazione** — una sola commissione, e o l'intero spostamento va a buon fine oppure nessuna parte di esso lo fa.

Questa è la mossa da fare quando un validatore a cui hai delegato finisce in jail o alza la sua commissione — prima che questa funzione esistesse, l'unico modo per uscire era revocare la delega e aspettare 21 giorni senza guadagnare nulla; spostare invece non costa alcuna attesa né ricompense perse.

:::caution Esiste un limite per coppia, e la commissione viene spesa anche se lo raggiungi
La chain consente al massimo **7 redelegazioni in corso contemporaneamente per la stessa coppia (origine, destinazione) di validatori** — un uso normale non si avvicinerà mai a questo limite, ma QoreX lo verifica prima che tu firmi e ti avvisa se lo hai raggiunto. Superato questo limite, la transazione fallisce on-chain e la commissione di rete viene comunque spesa, quindi non ritentare uno spostamento già stato respinto per questo motivo senza prima attendere che una delle redelegazioni esistenti si concluda.

Un'altra regola della chain: lo stake che hai appena spostato **verso** un validatore non può essere spostato **oltre** da quel validatore finché non si è concluso lo spostamento che lo ha portato lì (21 giorni) — QoreX ti avvisa quando uno spostamento viene rifiutato per questo motivo. Puoi comunque fare unstake, oppure spostare lo stake che si trovava già presso quel validatore.
:::

### Claim e Claim & restake {#claim}

- **Claim** raccoglie le tue ricompense nel tuo saldo. QoreX riscuote solo dai validatori che hanno effettivamente ricompense in attesa.
- **Claim & restake** (pulsante *Claim & restake*: «Reinvesti \{amount\} QOR negli stessi validatori, in un'unica transazione.») riscuote e delega le ricompense direttamente ai validatori che le hanno generate — una transazione, una commissione. Viene offerto solo quando QoreX riesce a leggere il dettaglio per validatore.
- **Controllo della commissione.** La commissione viene pagata *prima* che arrivino le ricompense. Se il tuo QOR sbloccato non riesce a coprirla, QoreX si ferma prima che tu firmi e indica quanto serve («Riscuotere richiede circa \{fee\} QOR sbloccati per la commissione di rete — viene pagata prima che arrivino le ricompense.»); invia un po' di QOR a quell'indirizzo e riprova. Il QOR in vesting non può pagare le commissioni.

### Revoca la delega (Undelegate)

1. Apri **Stake** e tocca il validatore. Se hai del QOR presso di esso, il pannello offre **Unstake** (e **Move stake**).
2. Inserisci l'importo. Il pannello mostra quanto hai presso quel validatore e, sopra il pulsante **Unstake**, «L'unstaking richiede 21 giorni prima che il QOR sia di nuovo tuo e spostabile» — vedi l'attesa di 21 giorni prima di confermare.
3. Conferma con approvazione biometrica. Il QOR smette immediatamente di generare ricompense e torna spendibile una volta completato il periodo di unbonding.

### Unstaking in corso (Unstaking in progress) {#unbonding}

Il QOR di cui è stato fatto unstake lascia sia la tua delega sia il tuo saldo spendibile per 21 giorni. QoreX lo elenca sotto **Unstaking in progress** — *«\{amount\} QOR in unstaking»*, ogni voce con il tempo rimasto (*\{days\}g \{hours\}h \{minutes\}m rimasti*, oppure *Meno di un minuto rimasto*, oppure *L'attesa è finita — dovrebbe essere tornato nel tuo saldo.*). Se QoreX non riesce a leggere quando si completa una voce, lo indica e mantiene l'importo nel totale. Se il tuo nodo non è raggiungibile, l'elenco resta com'era — non viene mai mostrato come «nessun unstaking in corso».

:::note Unstaking quando gestisci un validatore
Se il tuo wallet è quello di un operatore di validatore, l'unstaking viene rifiutato quando porterebbe il tuo self-bond sotto i 100.000 QOR richiesti: *«Fare unstake di questo importo porterebbe il self-bond del tuo validatore sotto i 100.000 QOR richiesti. Questa soglia si applica finché il validatore è in attività.»*
:::

### Earn

La vista **Earn** riepiloga il tuo staking in un unico posto: il tuo QOR in staking, le tue ricompense riscuotibili, con quanti validatori sei e la quota di tutto il QOR che è in staking a livello di rete. Non mostra alcun tasso di staking — la chain non pubblica una cifra di emissione da cui ricavare un tasso, quindi QoreX mostra *Not available* invece di un numero che non può sostenere.

Nell'estensione la schermata Stake ha gli stessi elementi (totale in staking, ricompense, **Claim**, **Claim & restake**, **Unstake**, **Move stake**, un selettore di account quando hai più account e l'avviso di unstake).

## Prossimi passi

- [Invio e Ricezione](/qorex/send-and-receive) — sposta QOR e asset esterni.
- [Sicurezza e Recupero](/qorex/security-and-recovery) — guardiani, eredità con Legacy e collegamento dei dispositivi.
