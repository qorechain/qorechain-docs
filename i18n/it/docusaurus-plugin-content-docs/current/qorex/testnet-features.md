---
slug: /qorex/testnet-features
title: Funzionalità della testnet
sidebar_label: Funzionalità della testnet
sidebar_position: 10
---

# Funzionalità della testnet

:::caution SOLO TESTNET
Tutto ciò che si trova in questa pagina funziona **solo sulla testnet di QoreChain** (`qorechain-diana`). **Nulla di tutto questo è sulla mainnet.** I token di testnet non hanno valore. Le schermate descritte qui sotto non compaiono in QoreX mentre sei sulla mainnet.
:::

QoreX ha alcune funzionalità che vengono messe alla prova prima sulla testnet. Sono visibili solo mentre la testnet è attiva, e ogni schermata lo dice con il banner **TESTNET: solo token di prova, non QOR reali**.

## Innovazioni {#innovations}

- **La rete conferma prima che tu firmi (solo testnet).** Per un trasferimento verso un'altra chain, QoreX chiede prima alla rete di confermare il canale e la sua controparte. Se non ci riesce, non viene inviato nulla.
- **Stato reale delle rotte (solo testnet).** La schermata del bridge mostra ciò che la rete stessa dice di ogni rotta e non offre nulla che la rete non offra.
- **Transazioni in formato Solana su QoreChain (solo testnet).** Una finestra SVM che apri con la tua firma ML-DSA-87 consente alla tua chiave Solana di agire entro limiti rigorosi.

## Come raggiungere la testnet in QoreX {#reach-testnet}

- **App mobile:** apri **Impostazioni** e attiva **Usa la testnet (sviluppatori)**. L'app passa subito a `qorechain-diana`, senza riavvio. L'impostazione predefinita è sempre la mainnet. Disattivala per tornare indietro.
- **Estensione per browser:** tocca sette volte il numero di versione in fondo al popup per far apparire la sezione **Modalità sviluppatore**, poi tocca **Passa alla testnet (diana)**. Nella stessa sezione, **Torna alla mainnet** ti riporta indietro.

Mentre la testnet è attiva, le schermate disponibili solo su testnet qui sotto compaiono nelle **Impostazioni** dell'app e nel popup dell'estensione (**Invia a un'altra chain** e **Bridge**), e lo strumento **Solana su QoreChain** compare nella scheda Sviluppo o nella pagina Strumenti per sviluppatori. I saldi di testnet non mostrano alcun valore in dollari. Le dApp non possono cambiare rete; solo tu puoi farlo.

## Ottenere QOR di testnet {#get-test-qor}

I QOR di testnet sono gratuiti e non hanno valore. Si ottengono dal [Faucet della Dashboard](/dashboard/faucet): accedi lì, copia il tuo indirizzo di testnet da QoreX (lo strumento per sviluppatori **Area di lavoro testnet** ha un pulsante **Copia indirizzo** e un pulsante **Apri il faucet della testnet**) e richiedi i token. Vedi anche [Connettersi alla testnet](/getting-started/connecting-to-testnet) per gli endpoint pubblici della testnet.

## Inviare a un'altra chain (IBC) {#ibc}

**SOLO TESTNET.** Invia QOR dalla testnet di QoreChain alle testnet di **Cosmos Hub**, **Osmosis**, **Injective**, **Akash** e **Celestia**, e riportali indietro.

Cosa fa QoreX per te:

- **Controlla prima la rotta.** Prima che tu possa firmare, QoreX chiede alla rete di confermare che il canale è aperto e che porta ancora alla chain che hai scelto. Se il canale è chiuso, modificato o non può essere confermato, QoreX lo dice e non invia nulla.
- **Mostra la revisione completa.** Prima di firmare vedi il mittente, il destinatario sull'altra chain, la commissione di rete e i tempi.
- **Tempi.** Un trasferimento di prova verso la testnet del Cosmos Hub è arrivato in circa 20 secondi. QoreX ti dice di aspettarti circa un minuto. Se non viene consegnato entro 10 minuti, ti ritorna.
- **Quale firma.** Un trasferimento da QoreChain è firmato con la tua chiave ibrida (ML-DSA-87 e secp256k1). Il ritorno è firmato sull'altra chain con una chiave classica, come quella chain richiede, e la revisione lo dice: su quella chain queste coin sono protette solo da una chiave classica.

### Inviare da QoreChain {#ibc-send}

1. Attiva la testnet (vedi [sopra](#reach-testnet)), apri **Impostazioni** (estensione: il popup) e tocca **Invia a un'altra chain**.
2. Scegli la **Chain di destinazione** e l'**Asset** (QOR, oppure coin arrivate via IBC).
3. Inserisci l'**Importo**. Il campo del **Destinatario** è precompilato con il tuo indirizzo su quella chain; puoi cambiarlo. QoreX controlla che sia un indirizzo valido per quella chain.
4. Tocca **Rivedi**, controlla i dettagli sotto **Controlla prima di firmare**, poi **Firma e invia**.

### Riportare indietro le coin {#ibc-back}

1. In **Invia a un'altra chain**, apri **Riporta su QoreChain** e tocca **Mostra i miei saldi** sulla chain che hai usato.
2. Scegli **Cosa riportare**. L'account su quella chain ha bisogno di un po' della coin propria di quella chain per pagare la commissione; QoreX ti avvisa se manca.
3. Controlla, poi **Firma e riporta**. Viene consegnato al tuo indirizzo QoreChain.

### Seguire un trasferimento {#ibc-track}

**I tuoi trasferimenti** elenca ogni trasferimento e lo segue: in attesa della rete, in transito, consegnato oppure tornato a te (con il motivo, o perché è scaduto il tempo). Tocca **Aggiorna** per rileggere. Se lo stato non è ancora noto, QoreX dice che la consegna non è confermata invece di tirare a indovinare.

## Schermata del bridge {#bridge}

**SOLO TESTNET.** La schermata **Bridge** legge dalla rete le rotte del QoreChain Bridge e mostra lo stato reale di ciascuna: non ancora aperta, in pausa, chiusa per ora, aperta, aperta ai prelievi o aperta ai depositi. Una rotta viene offerta solo quando la rete stessa dice che è aperta.

**Oggi sulla testnet tutte le rotte sono chiuse, quindi non viene offerto nulla.** La schermata è pronta per quando le rotte apriranno. Nulla di ciò che vedi qui è una rotta, un asset o un importo che puoi usare ora, e nulla è sulla mainnet.

## Solana su QoreChain {#solana-on-qorechain}

**SOLO TESTNET.** La lane SVM esegue transazioni in formato Solana su QoreChain. È uno strumento della Modalità sviluppatore, visibile solo mentre la testnet è attiva. Sulla mainnet la lane SVM non è aperta e nulla di quanto descritto qui può essere usato.

Cosa fa lo strumento:

- **Mostra la lane.** Se la lane SVM è in funzione sulla rete, e il suo cluster.
- **Mostra la tua finestra SVM.** Una finestra consente alle transazioni firmate dalla tua chiave Solana di spendere dal tuo account senza una firma ML-DSA-87, entro dei limiti. QoreX mostra se ce n'è una aperta, quanti blocchi, transazioni e QOR restano, quale chiave Solana è vincolata e quali programmi ammette.
- **Apre e chiude una finestra.** Apri una finestra scegliendo quali programmi ammette (è consigliato elencarli; **Qualsiasi programma** comporta un avviso), per quanti blocchi resta aperta (al massimo 17,280), quante transazioni (al massimo 1,000) e il massimo di QOR che può spendere. La chiave Solana con indice 0 della tua frase di recupero è quella vincolata. Aprire una finestra sostituisce quella che hai. Vale l'avviso sullo schermo: tienila piccola e breve, e chiudila quando hai finito con **Chiudi la finestra**.
- **Inoltra una transazione Solana firmata.** Incolla i byte in formato wire (base64 o base58) provenienti da uno strumento per sviluppatori e tocca **Leggila**. QoreX mostra i programmi e quali firmatari hanno firmato, e inoltra solo transazioni completamente firmate. Il tuo account QoreChain firma la busta con ML-DSA-87 e ne paga la commissione; non acquisisce alcuna autorità sulla transazione Solana.

Come usarlo: attiva la testnet e la Modalità sviluppatore, apri **Solana su QoreChain** dalla scheda Sviluppo (o dalla pagina Strumenti per sviluppatori dell'estensione), poi usa le sezioni qui sopra. Anche le chiamate a programmi SVM da [Modalità sviluppatore](/qorex/developer-mode#contracts) funzionano solo sulla testnet.

Per il lato chain della lane SVM, vedi [SVM sulla testnet](/developer-guide/svm-testnet-v329) e [la lane SVM](/developer-guide/svm-lane-v328).

## Cosa non è sulla mainnet {#not-on-mainnet}

- L'invio ad altre chain via IBC da QoreX.
- La schermata del QoreChain Bridge e le sue rotte.
- Solana su QoreChain, incluse le finestre SVM e l'inoltro.

QoreX mostra queste schermate solo sulla testnet e lo dichiara su ciascuna.
