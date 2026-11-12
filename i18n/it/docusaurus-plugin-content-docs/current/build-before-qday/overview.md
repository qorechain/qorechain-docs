---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: Panoramica
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day** è il developer fest di QoreChain, svolto online su [build.qorechain.io](https://build.qorechain.io) con l'hashtag #BuildBeforeQDay. I builder scelgono un livello, costruiscono sulla testnet di QoreChain con i kit open source, pubblicano il lavoro in pubblico e presentano il loro progetto a una giuria e alla community. Accanto al fest c'è un workshop tecnico a settimana. Ogni workshop ha in questa sezione una guida completa passo per passo, dal primo all'ultimo comando, così puoi fare tutto con i tuoi tempi sul tuo computer, anche se sei alle prime armi con lo sviluppo. Le app di esempio sono raccolte nel repository pubblico [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Innovazioni {#innovations}

Ogni workshop di questa sezione ruota attorno alle caratteristiche che rendono QoreChain diversa:

- **Firma ibrida.** Una transazione viene firmata due volte: una con una chiave classica secp256k1 e una con una chiave post-quantistica ML-DSA-87. Chi ruba solo la chiave classica non può produrre la seconda firma.
- **Verificata on chain.** I validatori controllano entrambe le firme. La transazione porta un'estensione `PQCHybridSignature` e la catena emette un evento `pqc_hybrid_verify` con lo stato `verified`. Puoi leggere entrambi dall'endpoint REST pubblico e vedere il risultato nell'explorer.
- **Una chiave, legata una sola volta.** La tua chiave post-quantistica viene derivata, non generata, e registrata una sola volta con una prova. Vedi [Come la tua chiave post-quantistica viene legata al tuo account](/build-before-qday/key-binding).
- **Strumenti ordinari.** Continui a usare Hardhat, Foundry o il linguaggio che preferisci. I kit gestiscono per te la chiave post-quantistica e la finestra di autorizzazione.

## Come funziona {#how-it-works}

1. **Registrati** su [build.qorechain.io](https://build.qorechain.io): accedi con GitHub, scegli il livello, collega X e QoreX.
2. **Costruisci** sulla testnet con i kit, i workshop settimanali e le sfide di metà hackathon. Commit e aggiornamenti compaiono nel feed pubblico.
3. **Consegna** entro la scadenza con un repository pubblico, un video di massimo 3 minuti e l'indirizzo testnet usato dal tuo progetto.

Partecipare è gratuito: costruisci sulla testnet, dove i QOR di prova arrivano dal [faucet](/dashboard/faucet). Le regole complete di ammissibilità, consegna e giudizio sono nella pagina Rules del sito del fest. Il montepremi è di 20.000 $ in totale, con grant successivi in QOR da gennaio 2027; la ripartizione è sul sito del fest.

## Livelli {#levels}

Scegli un livello quando ti registri e puoi cambiarlo in seguito.

| Livello | A chi è rivolto |
| --- | --- |
| Quantum Pass | Per chi è nuovo a QoreChain o al web3. Costruisci una piccola app che invia una transazione ibrida post-quantistica e la rilegge dalla catena. |
| Intermediate | Hai già pubblicato una dApp. Costruisci un'applicazione completa con l'SDK di QoreChain e QoreX. |
| Advanced | Tre percorsi: A, agenti; B, applicazioni cifrate con QoreSeal; C, app cross-VM che coprono le lane EVM e Native. |
| Expert | Infrastruttura di protocollo: rollup con l'RDK, IBC con QORel, custodia e strumenti per sviluppatori. |

Il Workshop 1 copre esattamente ciò che chiede il livello Quantum Pass: una transazione firmata in modo ibrido e verificata on chain.

## Calendario {#timeline}

Tutti gli orari sono UTC.

| Quando | Cosa |
| --- | --- |
| 4 novembre 2026 | Aprono registrazioni e sviluppo |
| Ogni settimana | Un workshop (4 in totale) con la sua guida passo per passo qui |
| 18 novembre 2026 | Iniziano le sfide di metà hackathon |
| 2 dicembre 2026, 23:59 | Scadenza per la consegna |
| Dal 3 al 5 dicembre | Controlli sulle consegne |
| Dal 6 al 15 dicembre | Giudizio e voto People's Choice |
| 16 dicembre | Vincitori e show dal vivo con le demo |
| Dal 17 al 22 dicembre | Pagamento dei premi |
| Gennaio 2027 | Grant successivi |

Il calendario è sul sito del fest.

## A chi è rivolto {#who}

Non serve conoscere la blockchain né la crittografia post-quantistica. Se sai aprire un terminale e incollare un comando, puoi seguire ogni guida di questa sezione. Ogni guida spiega in parole semplici che cosa fa ogni comando e che cosa significa ciascuna sua parte, poi mostra che cosa dovresti vedere sullo schermo. Quando una guida dice che un comando può richiedere un momento, aspetta che finisca prima di eseguire il successivo.

## Scegli un tutorial {#choose}

Fai prima la **guida del Workshop 1**. È il percorso completo, da un computer vuoto a una transazione firmata con due chiavi e verificata on chain. Poi scegli una qualsiasi delle app qui sotto. Mostrano la stessa idea in linguaggi e strumenti diversi.

I tempi si riferiscono ai passaggi successivi all'installazione degli strumenti. Installare gli strumenti la prima volta aggiunge circa 20-40 minuti: vedi [Prima di iniziare](/build-before-qday/prerequisites).

| Tutorial | Livello | Linguaggio | Tempo | Cosa avrai alla fine |
| --- | --- | --- | --- | --- |
| [Guida del Workshop 1](/build-before-qday/workshop-1) | Principiante | TypeScript, Solidity | 30 minuti | Un progetto creato, testato e distribuito sulla testnet, e una transazione firmata in modo ibrido e verificata on chain. |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | Principiante | TypeScript, Solidity | 25 minuti | Un contratto contatore sulla testnet che incrementi con un flusso firmato in modo ibrido. |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | Intermedio | TypeScript, Solidity, React | 45 minuti | Il tuo libro degli ospiti on chain, con una pagina web in cui firmi dal wallet QoreX. |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | Principiante | TypeScript, React | 25 minuti | Una pagina web che invia QOR da QoreX e mostra entrambe le firme e il verdetto della catena. |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Intermedio | Rust | 25 minuti | Un'app a riga di comando che paga con una firma ibrida e la verifica on chain. |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Intermedio | Java 21 | 25 minuti | Un backend che invia mance e accetta solo pagamenti firmati in modo post-quantistico. |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Principiante | Python | 20 minuti | Una transazione che paga molti indirizzi, firmata con entrambe le chiavi e verificata on chain. |

Che cosa significano qui i livelli:

- **Principiante:** pochi comandi da incollare in ordine. Nessun codice da scrivere.
- **Intermedio:** lo stesso, con un secondo strumento come una pagina web, un'estensione del wallet o una toolchain di un linguaggio che magari non hai mai usato.

Ogni tutorial segue la stessa struttura: **Prima di iniziare**, passaggi numerati (ogni comando con che cosa fa e che cosa significa ciascuna parte), **Cosa dovresti vedere**, come **verificare** la transazione on chain e una tabella di **Risoluzione dei problemi**.

## Prima di iniziare {#before-you-start}

Leggi una volta [Prima di iniziare: strumenti e wallet testnet](/build-before-qday/prerequisites). Copre:

- L'installazione di Node.js, pnpm, Git, Rust, Java, Maven, Python e jq su macOS, Windows e Linux, con un comando di verifica per ciascuno.
- La configurazione del wallet QoreX sulla testnet.
- Come ottenere QOR di prova dal faucet (100 QOR ogni 24 ore per account).
- QOR e uqor: 1 QOR sono 1.000.000 uqor.
- Come custodire al sicuro una chiave testnet usa e getta. Usa solo account di prova, mai un wallet con fondi reali.

## Da dove iniziare {#where-to-start}

1. Leggi [Prima di iniziare](/build-before-qday/prerequisites) e installa gli strumenti per il tuo primo tutorial.
2. Segui la [guida del Workshop 1](/build-before-qday/workshop-1) sulla testnet.
3. Prova una delle app di esempio della tabella qui sopra.
4. Se non hai mai distribuito su QoreChain, [Deploy in 5 minuti](/getting-started/deploy-in-5-minutes) spiega l'idea in modo approfondito. I kit dietro le app sono nella pagina [Kit](/build-before-qday/workshop-1/kits).

## Il codice {#code}

Tutte le app di esempio sono in un unico repository pubblico, cartella `workshop-1`: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday). Ogni tutorial ti dice quale cartella aprire. Scarica il codice una sola volta con:

```bash
git clone https://github.com/qorechain/build-before-qday
```

| Parte | Cosa fa |
| --- | --- |
| `git clone` | Scarica sul tuo computer una copia completa di un repository di codice. |
| `https://github.com/qorechain/build-before-qday` | L'indirizzo del repository da copiare. |

**Cosa dovresti vedere:** una nuova cartella chiamata `build-before-qday` nella cartella in cui hai eseguito il comando.
