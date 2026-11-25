---
slug: /qorex/portfolio-and-staking
title: Portafoglio e Staking
sidebar_label: Portafoglio e Staking
sidebar_position: 4
---

# Portafoglio e Staking

Questa pagina descrive la vista Portfolio e lo staking in QoreX: delegare QOR ai validatori, riscuotere le ricompense, spostare lo stake, fare unstake e lo staking con blocco temporale. È pensata per chiunque detenga QOR nell'app mobile, nell'estensione del browser o nell'estensione Safari.

## Innovazioni {#innovations}

- **Cifre dalla chain.** Il periodo di unbonding e il rendimento di base vengono letti dalla rete, non sono fissati nel wallet.
- **Gli spostamenti che la rete rifiuterebbe vengono intercettati prima.** Sposta lo stake mette in grigio ciò che non può essere spostato e dice perché, prima che venga spesa una commissione.
- **Le ricompense possono andare a un altro account dello stesso wallet,** e solo lì.
- **Nessuno zero inventato.** Quando la rete non risponde, QoreX mostra gli ultimi valori ricevuti, con il loro orario, oppure un trattino.

## Portafoglio

La vista **Portfolio** (protetta da autenticazione biometrica la prima volta che la apri in ogni sessione) mostra un **grafico a ciambella delle allocazioni** - il tuo QOR unificato tra le sue tre corsie (Native, EVM, SVM) - con una didascalia sotto l'anello, oltre a una riga per ogni asset. Le percentuali compaiono una volta che il feed dei prezzi è attivo, e ogni saldo mostra il suo valore stimato in USD accanto all'importo in QOR. Sulla **testnet**, il QOR viene mostrato **senza valore in USD** - i token di test non ne hanno.

Usa **+ Moneta o token** per aggiungere coin e token prima di possederne, e **Ricevi** per ottenere i loro indirizzi - vedi [Coin e token](/qorex/send-and-receive#coins-and-tokens).

**Da dove arriva il prezzo.** QoreX lo legge da `GET https://api.qore.network/v1/price/{symbol}` - un endpoint pubblico nostro, non una chiamata diretta a un exchange qualsiasi. Nulla sul tuo dispositivo comunica con una fonte di prezzo esterna all'infrastruttura di QoreChain, quindi il tuo indirizzo IP non viene mai esposto a una di esse. Se un prezzo affidabile non è davvero disponibile, l'endpoint risponde con un errore invece di indovinare - QoreX mostra il prezzo come non disponibile invece di visualizzare mai uno zero fittizio o una cifra non aggiornata come se fosse attuale.

Tocca un asset qualsiasi per aprire il **dettaglio dell'asset**, che mostra:

- **Cronologia del saldo** - un andamento reale costruito a partire dai tuoi trasferimenti on-chain.
- **Attività recente** - righe delle transazioni con ricerca inversa dello **@handle**, così le controparti vengono mostrate per nome ove possibile. Tocca una riga qualsiasi per aprirne il dettaglio completo: importo, controparte, blocco, hash della transazione e firma.

La pagina **QOR** elenca ogni transazione dell'account, in entrata e in uscita, con **Mostra altri** in basso. Per tutti i tipi di transazione, gli stati in attesa e fallita e l'esportazione CSV, vedi [Cronologia](/qorex/send-and-receive#history). Sulla testnet, i QOR non hanno alcun valore in dollari né nella Home né nel Portfolio.

## Quando la rete è lenta o non risponde {#network-status}

- **Banner sullo stato della rete.** QoreX controlla l'orario dell'ultimo blocco della chain. Se ha più di un minuto, un banner dice *«La rete è lenta: l'ultimo blocco risale a \{seconds\} secondi fa. Le transazioni potrebbero richiedere più tempo.»* Se nessun nodo risponde, dice *«Impossibile raggiungere la rete in questo momento. I saldi potrebbero non essere aggiornati.»* È l'orario dei blocchi della chain stessa, non una pagina di stato.
- **Ultimi valori noti.** Quando la rete non risponde (ad esempio mentre un nodo sta reindicizzando o dopo un aggiornamento), la scheda account dell'estensione e le schermate Home e Staking dell'app continuano a mostrare l'ultimo saldo e le ultime deleghe che la rete ha dato per quell'account, e lo dicono: *«La rete non risponde. Questi sono gli ultimi valori noti, del \{time\}.»* Su un saldo vecchio non viene indicato alcun valore in dollari.
- **Le ricompense che non è stato possibile leggere** mostrano un trattino, non 0 QOR, e per esse **Riscuoti** non viene offerto.

## Staking ed Earn {#staking}

Fare staking di QOR contribuisce a mettere in sicurezza QoreChain e ti fa guadagnare ricompense, che non sono garantite. Tutte le operazioni di staking sono transazioni on-chain reali sulla corsia nativa con firma ibrida: ciascuna è firmata due volte, con una chiave classica e con ML-DSA-87 (FIPS 204). Lo staking non passa mai da un precompile EVM.

### Dove si trova lo staking {#staking-screens}

- **App:** la schermata **Stake** mostra il tuo totale, le tue ricompense con **Riscuoti** e, sotto, i validatori. I controlli aggiuntivi come riscuoti e ridelega, indirizzo delle ricompense e blocchi scorrono insieme all'elenco. La tabella dei livelli di staking è ripiegata in una sola riga: tocca per aprirla.
- **Estensione e Safari:** **Staking** è un menu, e ogni azione apre la propria schermata con una riga di spiegazione, i propri messaggi di errore e **Torna allo stake**: **Metti in staking QOR**, **Ritira dallo staking**, **Sposta lo stake**, **Riscuoti**, **Riscuoti e ridelega**, **Blocca per un bonus** e **Le ricompense vanno a**. **Riscuoti** è sempre elencato. Quando hai più account compare un selettore di account.

### Fai staking con un validatore

1. Apri **Stake**.
2. Scegli un validatore dall'elenco (caricato in tempo reale dalla chain, con lo stake più piccolo mostrato per primo, ed esclude qualsiasi validatore attualmente in jail - delegare a uno di essi non è mai ciò che vuoi). I validatori presso cui hai già del QOR riportano un badge *staked*.
3. Inserisci un importo. Mentre digiti, QoreX ti avvisa se ciò che resterebbe non coprirebbe la prossima commissione di rete: *«Rimarrebbero \{remaining\} QOR - meno dei \{fee\} QOR che costa una transazione. Non potresti fare unstake né riscuotere le ricompense finché questo account non detiene di nuovo QOR per la commissione.»* È un avviso, non un blocco - sono i tuoi soldi - ma sia l'unstake sia la riscossione costano una commissione prelevata dal tuo saldo **liquido**, quindi fare staking fino a rimanere quasi senza nulla blocca lo stake finché qualcuno non invia QOR.
4. **Conferma** (biometria su mobile). Puoi fare staking di QOR in vesting, fino al tuo totale, ma la commissione di rete deve provenire dal tuo QOR **sbloccato** - il QOR in vesting non può pagare le commissioni.
5. Riscuoti le ricompense ogni volta che maturano - vedi sotto.

Nella prima transazione di un account, le schermate di staking dicono che registra anche la chiave ML-DSA-87 dell'account (una commissione di rete una tantum).

:::note Una delega ordinaria non ha periodo di vincolo; l'attesa è solo in uscita
Una delega ordinaria non ha un termine fisso: resta attiva, con le ricompense che affluiscono a partire dal blocco successivo, finché non chiedi di revocarla. Non c'è una scadenza da rinnovare né una durata minima dello staking. L'unico periodo di attesa riguarda l'uscita: una volta revocata la delega, quel QOR resta in un **periodo di unbonding**, senza generare ricompense e non movimentabile, prima di tornare nel tuo saldo spendibile. QoreX legge dalla rete la durata di quel periodo e la mostra prima che tu confermi (21 giorni su QoreChain al momento della stesura; se non è possibile leggerla, QoreX dice *il periodo stabilito dalla rete*). Spostare invece una delega verso un altro validatore (redelegate) evita del tutto questa attesa. Lo staking con blocco temporale è facoltativo, vedi [Blocchi di staking](#staking-locks) più sotto. Vedi anche [Esiste un periodo di vincolo?](/user-guide/staking-and-delegation#lock-in-period).
:::


### Blocchi di staking {#staking-locks}

I blocchi di staking sono presenti nell'app e nelle estensioni, Safari incluso. Un blocco è opzionale. Vincola una parte del tuo stake per 3, 6 o 12 mesi in cambio di un bonus.

- **Il bonus mostrato è quello che il blocco guadagna oggi**, entro il tetto fissato dalla rete. Può cambiare al variare delle condizioni di rete e non è garantito.
- **La tabella dei livelli è indicata con "fino a"**, con la cifra di oggi mostrata accanto.
- **Lo sblocco anticipato** è dietro una seconda conferma che indica il costo prima che tu firmi.
- **Ritira dallo staking e Sposta lo stake sono limitati alla parte sbloccata** del tuo stake.

Per come funziona il modulo on-chain, vedi [Staking con blocco temporale](/user-guide/staking-and-delegation#time-locked-staking).

### Sposta lo stake tra validatori (redelegate) {#move-stake}

Sposta il QOR che hai già in staking verso un altro validatore - o suddividilo tra più validatori - senza passare dalla coda di unbonding. Lo stake continua a generare ricompense per tutto il tragitto.

**Estensione e Safari** (Stake → **Sposta lo stake**) ti guidano in tre passaggi:

1. **Sposta da.** Scegli il validatore che il tuo stake lascia. Ognuno mostra *In stake \{held\} QOR · spostabili \{free\} QOR* (e l'eventuale importo bloccato). Un validatore da cui non puoi ancora uscire è in grigio con la data: *«Di nuovo spostabile da qui dopo il \{date\}: lo stake spostato qui deve prima arrivare.»*
2. **Sposta a.** Scegli una o più destinazioni. Una coppia che ha già il numero massimo di spostamenti in corso è disattivata (*«\{n\} spostamenti in corso, la chain ne consente \{max\}»*).
3. **Quanto.** Inserisci l'importo, oppure tocca **Max** (l'importo libero, non bloccato, presso l'origine). Il percorso (*Da ... a ...*) e, per più destinazioni, la ripartizione (*\{amount\} QOR a ciascuno dei \{n\} validatori*) sono mostrati prima del pulsante. Eventuali errori e la risposta della rete compaiono accanto al pulsante.

**App:** apri **Stake**, tocca il validatore presso cui si trova il tuo QOR e scegli **Sposta lo stake**. Gli stessi controlli vengono eseguiti sul validatore che apri. Scegli una o più destinazioni, inserisci l'importo (ha un proprio campo e **Max**), controlla la ripartizione e conferma con la biometria.

Suddividendolo tra più validatori l'importo viene diviso in parti uguali, e ogni destinazione si sposta in un'**unica transazione** - una sola commissione, e o l'intero spostamento va a buon fine oppure nessuna parte di esso lo fa.

Questa è la mossa da fare quando un validatore a cui hai delegato finisce in jail o alza la sua commissione: spostare non costa alcuna attesa né ricompense perse.

:::caution Regole della chain che possono far rifiutare uno spostamento
- **7 spostamenti in corso per coppia.** La chain consente al massimo 7 redelegazioni in corso contemporaneamente per la stessa coppia (origine, destinazione) di validatori.
- **Lo stake spostato non può proseguire subito.** Lo stake che hai appena spostato **verso** un validatore non può essere spostato **oltre** da quel validatore finché non si è concluso lo spostamento che lo ha portato lì (il periodo di unbonding della rete). Puoi comunque fare unstake, oppure spostare lo stake che si trovava già presso quel validatore.

QoreX controlla entrambe prima che tu firmi. Se la rete rifiuta comunque uno spostamento, QoreX spiega il motivo a parole anziché con un codice; uno spostamento rifiutato on-chain ha comunque pagato la commissione di rete, quindi non ritentare senza attendere.
:::

### Claim e Claim & restake {#claim}

- **Riscuoti** raccoglie le tue ricompense nel tuo saldo. QoreX riscuote solo dai validatori che hanno effettivamente ricompense in attesa.
- **Riscuotere costa più di quanto rende.** Se la commissione di riscossione è maggiore delle tue ricompense, il primo tocco ti avvisa e il pulsante diventa **Riscuoti comunque**. Se aspetti, le ricompense continuano a crescere.
- **Riscuoti e ridelega** (pulsante *Riscuoti e ridelega*: «Reinvesti \{amount\} QOR sugli stessi validatori, in un'unica transazione.») riscuote e delega le ricompense direttamente ai validatori che le hanno generate - una transazione, una commissione. Viene offerto solo quando QoreX riesce a leggere il dettaglio per validatore. Una transazione può coprire **al massimo 127 validatori**; se sono di più, QoreX lo dice e non firma nulla.
- **Controllo della commissione.** La commissione viene pagata *prima* che arrivino le ricompense. Se il tuo QOR sbloccato non riesce a coprirla, QoreX si ferma prima che tu firmi e indica quanto serve («Riscuotere richiede circa \{fee\} QOR sbloccati per la commissione di rete - viene pagata prima che arrivino le ricompense.»); invia un po' di QOR a quell'indirizzo e riprova. Il QOR in vesting non può pagare le commissioni.

### Scegliere dove vanno le ricompense {#rewards-address}

Per impostazione predefinita le ricompense vanno all'account che le ha guadagnate. Puoi inviare le ricompense **future** a **un altro account dello stesso wallet**, e solo lì.

1. App: in **Stake**, apri **Le ricompense vanno a**. Estensione e Safari: **Staking → Le ricompense vanno a**. Vedi dove vanno ora le ricompense.
2. Scegli **Cambia dove vanno le ricompense** e seleziona uno dei tuoi account.
3. Il primo tocco nomina l'account per intero (*«Le prossime ricompense andranno a \{name\}. Tocca di nuovo per firmare.»*); il secondo lo firma (firma ibrida, normale commissione di rete; biometria nell'app).

Il tuo stake non si sposta. QoreX ricava i tuoi indirizzi dalla tua frase di recupero, quindi non può essere puntato verso un indirizzo fuori dal wallet, e i siti web non possono richiedere questa modifica. Se le ricompense vanno già a un indirizzo fuori dal tuo wallet, QoreX lo segnala e propone di inviarle invece a uno dei tuoi account.

### Prezzo del gas e dimensione della transazione {#gas}

QoreX legge il prezzo minimo del gas corrente della rete. Se la rete lo aumenta, QoreX paga più del nuovo minimo; i prezzi incorporati nel wallet restano la soglia minima. La commissione mostrata in una revisione è quella che viene firmata. QoreChain accetta al massimo **50,000,000 gas** in una transazione: una più grande viene rifiutata prima che venga firmato qualcosa e non viene prelevata alcuna commissione, quindi dividila in parti più piccole (ad esempio, riscuoti da meno validatori alla volta).

### Revoca la delega (Undelegate)

1. Apri **Stake** e tocca il validatore. Se hai del QOR presso di esso, il pannello offre **Ritira dallo staking** (e **Sposta lo stake**).
2. Inserisci l'importo. Il pannello mostra quanto hai presso quel validatore e, sopra il pulsante **Ritira dallo staking**, quanto dura l'unstaking (*«Il ritiro dallo staking richiede \{days\} prima che tu possa spostare i QOR.»*, con il periodo letto dalla rete) - vedi l'attesa prima di confermare.
3. Conferma con approvazione biometrica. Il QOR smette immediatamente di generare ricompense e torna spendibile una volta completato il periodo di unbonding.

### Unstaking in corso (Unstaking in progress) {#unbonding}

Il QOR di cui è stato fatto unstake lascia sia la tua delega sia il tuo saldo spendibile per il periodo di unbonding della rete. QoreX lo elenca sotto **Uscite dallo staking in corso** - *«\{amount\} QOR in uscita»*, ogni voce con il tempo rimasto (*Mancano \{days\}g \{hours\}h \{minutes\}m*, oppure *Meno di un minuto*, oppure *L'attesa è finita. Questo dovrebbe essere tornato nel saldo.*). Se QoreX non riesce a leggere quando si completa una voce, lo indica e mantiene l'importo nel totale. Se il tuo nodo non è raggiungibile, l'elenco resta com'era - non viene mai mostrato come «nessun unstaking in corso».

:::note Unstaking quando gestisci un validatore
Se il tuo wallet è quello di un operatore di validatore, l'unstaking viene rifiutato quando porterebbe il tuo self-bond sotto i 100.000 QOR richiesti: *«Fare unstake di questo importo porterebbe il self-bond del tuo validatore sotto i 100.000 QOR richiesti. Questa soglia si applica finché il validatore è in attività.»*
:::

### Earn

La vista **Earn** riepiloga il tuo staking in un unico posto: il tuo QOR in staking, le tue ricompense riscuotibili, con quanti validatori sei e la quota di tutto il QOR che è in staking a livello di rete.

**Rendimento.** Il tasso annuo di base proviene dal **dato della chain stessa**. È mostrato *al lordo della commissione del validatore*, ed è **variabile e non garantito**. Se la chain segnala che ora le ricompense provengono solo dalle commissioni, QoreX dice *ricompense dalle commissioni* invece di una percentuale. Se il dato non può essere letto, QoreX mostra *Non disponibile* invece di un numero che non può sostenere. Il bonus di un blocco temporale è un dato separato, vedi [Blocchi di staking](#staking-locks).

L'estensione e Safari hanno le funzioni di staking su schermate separate, vedi [Dove si trova lo staking](#staking-screens).

## Prossimi passi

- [Invio e Ricezione](/qorex/send-and-receive) - sposta QOR e asset esterni.
- [Sicurezza e Recupero](/qorex/security-and-recovery) - guardiani, eredità con Legacy e collegamento dei dispositivi.

## Limiti e problemi noti {#limits}

- Le ricompense non sono garantite, e il rendimento mostrato è variabile e al lordo della commissione.
- Il QOR di cui si fa unstake torna solo dopo il periodo di unbonding della rete (21 giorni al momento della stesura); spostare lo stake tra validatori non ha attesa ma è limitato a 7 spostamenti in corso per la stessa coppia di validatori, e lo stake spostato non può proseguire finché il suo spostamento non si conclude.
- Le ricompense possono essere reindirizzate solo a un altro account dello stesso wallet.
- Riscuoti e ridelega copre al massimo 127 validatori in una transazione, e nessuna transazione può superare 50,000,000 gas.
- Il QOR in vesting può essere messo in staking ma non può pagare le commissioni; la commissione deve provenire da QOR sbloccato.
- Il Portfolio è disponibile solo su mobile. Sulla testnet, il QOR non mostra alcun valore in USD.
