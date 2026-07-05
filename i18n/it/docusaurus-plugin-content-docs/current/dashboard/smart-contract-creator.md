---
slug: /dashboard/smart-contract-creator
title: Smart Contract Creator
sidebar_label: Smart Contract Creator
sidebar_position: 6
---

# Smart Contract Creator

Lo **Smart Contract Creator** genera smart contract a partire da una descrizione in linguaggio naturale, basato su **QCAI**. Descrivi ciò che desideri, scegli la tua blockchain di destinazione e QCAI scrive il contratto per te. Supporta **17 blockchain** per gli strumenti AI, così puoi puntare all'ecosistema per cui stai sviluppando.

Collegare il tuo wallet ti consente di salvare e gestire i contratti che generi — vedi [Panoramica e primi passi](/dashboard/overview#connect-your-wallet).

## Genera un contratto

1. **Descrivi il tuo contratto.** Nel campo del prompt, scrivi cosa dovrebbe fare il contratto — ad esempio, un token con offerta fissa, una collezione NFT o un piano di vesting. Più sei specifico, migliore sarà il risultato.
2. **Scegli la blockchain.** Seleziona la tua destinazione tra le blockchain supportate. Il linguaggio del contratto e la categoria per la tua scelta sono mostrati accanto al selettore.
3. **Scegli un tipo di contratto** (facoltativo). Scegli un modello di partenza come un token, un NFT o un contratto di governance per guidare la generazione.
4. **Genera.** Seleziona **Generate**. Un indicatore di avanzamento mostra lo stato mentre QCAI produce il contratto.

## Esamina il risultato

Al termine della generazione, la Dashboard mostra il contratto in una vista con evidenziazione della sintassi, insieme a dettagli come il nome del contratto, la blockchain, il linguaggio, la dimensione del file e l'ora di generazione. Il prompt che hai utilizzato viene mostrato con il risultato come riferimento.

Da qui puoi:

- **Copiare** il codice del contratto negli appunti.
- **Scaricare** il contratto come file nel formato corretto per la blockchain che hai scelto.
- **Modificare** il contratto per perfezionarlo ulteriormente.

## Distribuisci il tuo contratto {#deploy}

### Su mainnet (EVM) — deploy non-custodial {#deploy-mainnet}

Il deploy su mainnet è non-custodial: la Dashboard compila il tuo contratto e restituisce i dati di deploy **non firmati** — non detiene mai le tue chiavi e non firma mai per tuo conto. Firmi e trasmetti tu stesso il deploy nel tuo wallet, e la Dashboard registra poi il contratto risultante.

1. Apri il contratto che vuoi distribuire (un contratto con destinazione EVM) e seleziona **Deploy** su **Mainnet**. Se questa è la tua prima azione su mainnet, accetta il [riconoscimento del rischio una tantum](/dashboard/overview#risk-acknowledgement).
2. Collega **MetaMask** se non è già collegato — vedi [Panoramica e primi passi](/dashboard/overview#connect-your-wallet).
3. La Dashboard compila il contratto e consegna al tuo wallet la transazione di deploy non firmata.
4. Esamina la transazione in MetaMask — rete, gas e dati — quindi conferma per firmarla e trasmetterla tu stesso.
5. Una volta che il deploy è confermato on-chain, la Dashboard registra l'indirizzo del contratto risultante insieme ai tuoi contratti salvati.

Su mainnet, per ora sono disponibili in questo modo solo i deploy **EVM**; i deploy **Wasm** e **SVM** sono disponibili solo su testnet.

### Su testnet — un solo clic {#deploy-testnet}

Il flusso su testnet è invariato: il wallet di test gestito dalla dashboard firma e invia il deploy per te con un solo clic, così puoi iterare rapidamente con i token del [Faucet](/dashboard/faucet) prima di passare alla mainnet. La testnet supporta i deploy EVM, Wasm e SVM.

## Condividi e riutilizza

Ogni contratto generato ha una propria pagina che puoi aprire o condividere. Se apri un contratto che non possiedi, puoi effettuarne il **fork** per avviare una tua copia e proseguire da lì.

:::tip Esamina e testa sempre
Il codice generato da QCAI è un ottimo punto di partenza, non un sostituto della revisione. Leggi il contratto, testalo sulla [testnet](/getting-started/connecting-to-testnet) ed eseguilo tramite il [Contract Auditor](/dashboard/contract-auditor) prima di distribuire qualsiasi cosa di valore.
:::

## Correlati

- [Contract Auditor](/dashboard/contract-auditor) — esegui un'analisi di sicurezza QCAI su un contratto.
- [Guida per sviluppatori](/developer-guide/evm-development) — distribuzione di contratti sui runtime di QoreChain.
