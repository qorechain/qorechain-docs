---
slug: /dashboard/smart-contract-creator
title: Smart Contract Creator
sidebar_label: Smart Contract Creator
sidebar_position: 6
---

# Smart Contract Creator

Lo **Smart Contract Creator** genera smart contract a partire da una descrizione in linguaggio naturale, basato su **QCAI**. Descrivi ciò che desideri, scegli la tua blockchain di destinazione e QCAI scrive il contratto per te. Supporta **17 blockchain** per gli strumenti AI, così puoi puntare all'ecosistema per cui stai sviluppando.

Puoi provarlo **senza un account**: un visitatore alla prima visita ottiene una generazione gratuita e vede l'intero contratto. Per la successiva serve un account gratuito, così come per salvare, sottoporre ad audit e distribuire; la pagina propone **Create a free account** una volta usata la prova gratuita.

Accedi per salvare e gestire i contratti che generi — vedi [Accedi](/dashboard/overview#sign-in).

## Genera un contratto

1. **Parti da un esempio, oppure descrivi il tuo.** La pagina si apre con "What would you like to build?". Sotto **Or start from an example:** scegli **Token**, **NFT collection**, **Locked vault** o **2-of-3 multisig** — ognuno compila una descrizione completa e seleziona una blockchain e un template corrispondenti — oppure scrivi la tua in **Contract Description**. Più sei specifico, migliore sarà il risultato.
2. **Scegli la blockchain.** Usa **Target Blockchain**. Il linguaggio del contratto e la categoria per la tua scelta sono mostrati accanto al selettore.
3. **Scegli un tipo di contratto** (facoltativo). **Contract Type** offre un modello di partenza come un contratto token, NFT o di governance; lascialo su **Custom (describe in prompt)** per affidarti solo alla tua descrizione.
4. **Genera.** Seleziona **Generate Smart Contract**. Un indicatore di avanzamento mostra lo stato mentre QCAI produce il contratto.

## Esamina il risultato

Al termine della generazione, la Dashboard mostra il contratto in una vista con evidenziazione della sintassi, insieme a dettagli come il nome del contratto, la blockchain, il linguaggio, la dimensione del file e l'ora di generazione. Il prompt che hai utilizzato viene mostrato con il risultato come riferimento.

Da qui puoi:

- **Copiare** il codice del contratto negli appunti (**Copy Code**).
- **Export PDF** del contratto.
- **Scaricare** il contratto come file (**Download File**) nel formato corretto per la blockchain che hai scelto.
- **Modificare** il contratto (**Edit Contract**) per perfezionarlo ulteriormente.

## Distribuisci il tuo contratto {#deploy}

### Su mainnet (EVM) — deploy non-custodial {#deploy-mainnet}

Il deploy su mainnet è non-custodial: la Dashboard compila il tuo contratto e restituisce i dati di deploy **non firmati** — non detiene mai le tue chiavi e non firma mai per tuo conto. Firmi e trasmetti tu stesso il deploy nel tuo wallet, e la Dashboard registra poi il contratto risultante.

1. Apri il contratto che vuoi distribuire (un contratto con destinazione EVM) e seleziona **Deploy** su **Mainnet**. Se questa è la tua prima azione su mainnet, accetta il [riconoscimento del rischio una tantum](/dashboard/overview#risk-acknowledgement).
2. Collega **MetaMask** se non è già collegato — vedi [Panoramica e primi passi](/dashboard/overview#connect-your-wallet). Dalla versione della chain v3.2.0 la lane EVM richiede inoltre che l'account abbia una chiave post-quantum registrata e una **finestra di autorizzazione EVM aperta**, che si apre da QoreX (vedi [Invio con MetaMask](/dashboard/wallet#send-metamask)); senza di essa la chain rifiuta il deploy.
3. La Dashboard compila il contratto e consegna al tuo wallet la transazione di deploy non firmata.
4. Esamina la transazione in MetaMask — rete, gas e dati — quindi conferma per firmarla e trasmetterla tu stesso.
5. Una volta che il deploy è confermato on-chain, la Dashboard registra l'indirizzo del contratto risultante insieme ai tuoi contratti salvati.

Dalla Dashboard possono essere distribuiti solo contratti **EVM** (Solidity). I deploy di CosmWasm e di programmi Solana al momento non sono disponibili su nessuna delle due reti.

### Su testnet — un solo clic {#deploy-testnet}

Su testnet il wallet di test gestito dalla dashboard firma e invia per te un deploy EVM con un solo clic, così puoi iterare rapidamente con i token del [Faucet](/dashboard/faucet) prima di passare alla mainnet. La testnet applica la stessa regola della lane EVM della mainnet, quindi un deploy può comunque essere rifiutato se l'account non ha una chiave post-quantum o una finestra EVM aperta.

## Condividi e riutilizza

Ogni contratto generato ha una propria pagina. I contratti sono **privati per impostazione predefinita**: solo tu puoi aprire i tuoi. Come proprietario vedrai un pulsante **Public** / **Private** nella pagina del contratto; impostalo su **Public** per consentire a chiunque abbia il link di aprire (e fare il fork del) contratto, e di nuovo su **Private** per ritirarlo. Se apri un contratto pubblico che non possiedi, puoi effettuarne il **fork** per avviare una tua copia e proseguire da lì.

:::tip Esamina e testa sempre
Il codice generato da QCAI è un ottimo punto di partenza, non un sostituto della revisione. Leggi il contratto, testalo sulla [testnet](/getting-started/connecting-to-testnet) ed eseguilo tramite il [Contract Auditor](/dashboard/contract-auditor) prima di distribuire qualsiasi cosa di valore.
:::

## Correlati

- [Contract Auditor](/dashboard/contract-auditor) — esegui un'analisi di sicurezza QCAI su un contratto.
- [Guida per sviluppatori](/developer-guide/evm-development) — distribuzione di contratti sui runtime di QoreChain.
