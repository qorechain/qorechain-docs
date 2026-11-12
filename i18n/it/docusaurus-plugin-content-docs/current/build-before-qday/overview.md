---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: Panoramica
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day** è il fest per sviluppatori di QoreChain, che si svolge online su [build.qorechain.io](https://build.qorechain.io) con l'hashtag #BuildBeforeQDay. I builder scelgono un livello, costruiscono sulla testnet di QoreChain con i kit open source, pubblicano il proprio lavoro in pubblico e presentano il progetto a una giuria e alla community. Accanto al fest c'è un workshop tecnico a settimana. Ogni workshop ha in questa sezione una guida completa passo dopo passo, dal primo comando all'ultimo, così puoi fare tutto con i tuoi tempi sul tuo computer. Le app di esempio di ogni workshop sono raccolte nel repository pubblico [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Innovazioni {#innovations}

Ogni workshop di questa sezione ruota attorno alle funzionalità che rendono diversa QoreChain:

- **Firma ibrida.** Una transazione viene firmata due volte: una con una chiave classica secp256k1 e una con una chiave post-quantistica ML-DSA-87. Chi ruba solo la chiave classica non può produrre la seconda firma.
- **Verificata on chain.** I validatori controllano entrambe le firme. La transazione porta un'estensione `PQCHybridSignature` e la catena emette un evento `pqc_hybrid_verify` con lo stato `verified`. Puoi leggere entrambi dall'endpoint REST pubblico e vedere il risultato nell'explorer.
- **Strumenti ordinari.** Continui a usare Hardhat, Foundry o il linguaggio che preferisci. I kit gestiscono per te la chiave post-quantistica e la finestra di autorizzazione.

## Come funziona {#how-it-works}

1. **Registrati** su [build.qorechain.io](https://build.qorechain.io): accedi con GitHub, scegli il livello, collega X e QoreX.
2. **Costruisci** sulla testnet con i kit, i workshop settimanali e le sfide di metà hackathon. I commit e gli aggiornamenti compaiono nel feed pubblico.
3. **Invia** il progetto entro la scadenza con un repository pubblico, un video di massimo 3 minuti e l'indirizzo testnet usato dal tuo progetto.

Partecipare è gratuito: costruisci sulla testnet, dove i QOR di test arrivano dal [faucet](/dashboard/faucet). Le regole complete su idoneità, invio e valutazione sono nella pagina Regole del sito del fest. Il montepremi è di 20.000 $ in totale, con grant successivi in QOR da gennaio 2027; la suddivisione è sul sito del fest.

## Livelli {#levels}

Scegli un livello quando ti registri e puoi cambiarlo in seguito.

| Livello | Per chi è |
| --- | --- |
| Quantum Pass | Sei nuovo di QoreChain o del web3. Costruisci una piccola app che invia una transazione ibrida post-quantistica e la rilegge dalla catena. |
| Intermediate | Hai già pubblicato una dApp. Costruisci un'applicazione completa con l'SDK di QoreChain e QoreX. |
| Advanced | Tre percorsi: A, agenti; B, applicazioni cifrate con QoreSeal; C, app cross-VM che coprono le lane EVM e Native. |
| Expert | Infrastruttura di protocollo: rollup con l'RDK, IBC con QORel, custodia e strumenti per sviluppatori. |

Il Workshop 1 copre esattamente ciò che chiede il livello Quantum Pass: una transazione firmata in modo ibrido, verificata on chain.

## Calendario {#timeline}

Tutti gli orari sono in UTC.

| Quando | Cosa |
| --- | --- |
| 4 novembre 2026 | Aprono le registrazioni e lo sviluppo |
| Ogni settimana | Un workshop (4 in totale) con la sua guida passo dopo passo qui |
| 18 novembre 2026 | Iniziano le sfide di metà hackathon |
| 2 dicembre 2026, 23:59 | Scadenza per l'invio |
| Dal 3 al 5 dicembre | Controlli sui progetti inviati |
| Dal 6 al 15 dicembre | Valutazione e voto People's Choice |
| 16 dicembre | Vincitori e demo show dal vivo |
| Dal 17 al 22 dicembre | Pagamento dei premi |
| Gennaio 2027 | Grant successivi |

Il calendario è sul sito del fest.

## Workshop {#workshops}

| Workshop | Argomento | Guida |
| --- | --- | --- |
| Workshop 1 | La tua prima transazione firmata in modo ibrido | [Workshop 1](/build-before-qday/workshop-1) |

Ogni guida parte da un computer senza nulla di installato. Elenca cosa installare, poi percorre i comandi uno per uno: ottenere il codice, installare, creare una chiave solo per la testnet, ricevere QOR di test dal faucet, eseguire e controllare il risultato sull'explorer. Si chiude con i pacchetti usati e le app di esempio. Tutte le app di esempio sono nel repository pubblico [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Da dove iniziare {#where-to-start}

- Segui il [Workshop 1](/build-before-qday/workshop-1) sulla testnet.
- Sfoglia le [app di esempio](/build-before-qday/workshop-1/kits) e i kit che ci stanno dietro.
- Se non hai mai fatto un deploy su QoreChain, leggi prima [Deploy in 5 minuti](/getting-started/deploy-in-5-minutes).
