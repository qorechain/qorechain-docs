---
slug: /dashboard/developers
title: Sviluppatori
sidebar_label: Sviluppatori
sidebar_position: 13
---

# Sviluppatori

La pagina **Developers** (`/developers`, barra laterale gruppo **Build**, voce **Developers**) è una pagina pubblica di strumenti per sviluppare su QoreChain. Non richiede un account. Ha sei schede: **SDKs**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet** e **AI agents (MCP)**. Insieme ti permettono di trovare e installare il pacchetto giusto, verificare quale chiave post-quantistica ha registrato un account e se la sua finestra di autorizzazione EVM è aperta, simulare a vuoto una transazione firmata, fare pratica con la firma ibrida usando una chiave usa e getta e mettere alla prova una dApp con un wallet QoreX fittizio, il tutto nel browser. È pensata per sviluppatori di dApp, wallet e backend. Un **Transaction inspector** è pianificato e non ancora attivo (vedi [Limiti](#limits)). Per le librerie stesse vedi [Pacchetti per sviluppatori](/developer-tools/overview), la [Panoramica SDK](/sdk/overview) e [Installazione](/sdk/install).

## Innovazioni {#innovations}

- **Un gateway di sola lettura verso la chain.** Gli strumenti leggono dati pubblici della chain e simulano una transazione tramite un gateway di sola lettura sotto i percorsi di query `cosmos/`, `cosmwasm/` e `qorechain/` più la chiamata di simulazione. Nulla nella pagina può trasmettere una transazione. Il gateway esiste perché gli endpoint REST della chain non inviano intestazioni CORS per il browser.
- **Chiavi che non lasciano mai il browser.** Le chiavi del signing playground e del test wallet sono generate nel tuo browser e conservate solo in memoria. Non vengono mai salvate né inviate, e scompaiono al ricaricamento. Queste due schede sono solo testnet e rifiutano la mainnet.
- **La libreria di firma di produzione, non una demo.** Il playground usa [QoreSign](/qoresign/overview), la stessa libreria open source delle integrazioni in produzione. Produce e verifica firme ibride: una firma secp256k1 più una firma ML-DSA-87 sullo stesso messaggio.
- **Un hub di pacchetti generato da dati testati.** La scheda **SDKs** elenca circa 40 pacchetti da un unico manifest. Le versioni vengono lette live da ciascun registry (aggiornate ogni 10 minuti, con l'ultima versione verificata e la sua data se un registry non è raggiungibile), e ogni quickstart è stato eseguito dal team SDK sui registry pubblici, con l'output osservato mostrato accanto.
- **Risposte della chain, non supposizioni.** **PQ key status** legge la chiave ML-DSA-87 registrata e lo stato della finestra EVM dalle rotte di query del nodo stesso, così puoi vedere perché una transazione EVM verrebbe rifiutata prima di inviarla.

## Come si usa {#how-to-use}

Apri [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). La pagina si apre su **SDKs**. Le schede **PQ key status** e **Simulator** mostrano un selettore **Network** (Testnet o Mainnet) locale alla pagina che **per impostazione predefinita è su Testnet**, qualunque cosa dica l'intestazione. È locale alla pagina di proposito: l'interruttore dell'intestazione ricarica la pagina, cosa che cancellerebbe le chiavi in memoria e il test wallet.

### SDKs {#sdks}

**Cosa fa.** Elenca ogni libreria QoreChain, raggruppata per prodotto. Il manifest contiene circa 40 pacchetti tra TypeScript, Python, Go, Rust, Java, Kotlin e Swift. La maggior parte è stabile; uno è deprecato e un pacchetto non ancora presente nel suo registry è contrassegnato come tale. I prodotti, nell'ordine mostrato, sono: QoreChain SDK (core, hook React, EVM, SVM, lo starter dApp e i port Python, Rust, Go e Java), QoreSign, RDK (il kit di sviluppo dei rollup, il suo strumento a riga di comando, lo starter per rollup e i port Python, Rust, Go e Java), la libreria PQC, il wallet adapter, il chain bridge, Handles, le integrazioni QoreX e MCP e la CLI `qore`.

**Come funziona.** Ogni prodotto è una scheda. Se il prodotto è distribuito in più linguaggi, un selettore di linguaggio (pillole) cambia il pacchetto mostrato. Ogni pacchetto mostra:

- una pillola di stato (**Stable**, **Not published yet** o **Deprecated**);
- l'**ultima versione**, letta live dal suo registry (npm, PyPI, crates.io, il proxy Go, Maven Central o le release di GitHub) e aggiornata ogni 10 minuti. Se un registry non è raggiungibile, viene mostrata l'ultima versione verificata con la sua data e una nota che indica che non è stato possibile leggere le versioni live;
- **Registry**, **Source** (repository) e **License** (Apache-2.0), e i requisiti di runtime;
- il comando **Install** e la riga **Import**, ciascuno con un pulsante di copia, più dipendenze peer, subpath export, transport e un endpoint ospitato dove il pacchetto li prevede (per Maven viene mostrato un blocco `pom.xml`);
- il **Quickstart**: una pillola che riporta **Tested** con la data, **Failed in testing** o **Not tested**, il nome del file, il codice con un pulsante di copia, l'**Observed output** e **How it was tested**. Un quickstart fallito è nascosto dietro **Show the quickstart** con un avviso di leggere prima i problemi noti;
- **Known issues** e note, parola per parola dal team SDK.

Un pacchetto non pubblicato mostra "This package is not on its registry yet, so there is no install command." e nessuna riga di installazione. Il pacchetto deprecato (`@qorechain/connect`) è raccolto in fondo sotto **Deprecated packages**, con i suoi sostituti (i pacchetti `@qorechain/qorex-*`).

**Passaggi.**

1. Digita nel campo filtro ("Filter by name or language") per restringere l'elenco; **Clear filter** lo azzera. Quando più prodotti corrispondono, una riga **Jump to** collega a ciascuno.
2. Scegli il prodotto, poi la pillola del linguaggio.
3. Controlla la riga della versione ("latest on npm", oppure "checked" con una data), poi copia il comando **Install**.
4. Copia la riga **Import**, poi il quickstart nel file indicato sotto **File name**, ed eseguilo.
5. Apri **Network endpoints** per copiare gli id di chain e gli endpoint pubblici di testnet e mainnet. La nota sotto spiega le convenzioni dei quickstart: gli esempi si limitano a leggere e firmano con la frase di test pubblica, quindi non finanziare mai un account derivato da essa.

**Esempio minimo.** Digita `python` nel filtro, apri **QoreChain SDK**, scegli la pillola **Python**, copia il comando di installazione da **Install**, poi copia il quickstart ed eseguilo.

**Rete.** Elenco statico più letture live dei registry; non si applica alcuna scelta di rete.

### PQ key status {#pq-status}

**Cosa fa.** Mostra la chiave ML-DSA-87 che un account ha registrato on-chain e lo stato della sua finestra di autorizzazione EVM, su mainnet o testnet.

**Come funziona.** La pagina analizza il tuo input, lo converte in un account `qor1...` e pone al nodo due query: la chiave PQC registrata (tramite [QoreSign](/qoresign/overview)) e la finestra EVM dell'account (`GET /qorechain/pqc/v1/evm_window/{address}`). Un indirizzo `0x...` corrisponde agli stessi 20 byte della sua forma `qor1...`, e un indirizzo `qorvaloper1...` viene cercato come account proprio dell'operatore. I risultati appartengono a una rete: cambiare il selettore li cancella.

**Passaggi.**

1. Apri la scheda **PQ key status** e scegli la rete.
2. Inserisci un **Account address** (`qor1...`, `0x...` o `qorvaloper1...`). La pagina controlla il formato e il checksum e segnala un errore di battitura.
3. Seleziona **Check**.
4. Leggi **Registered PQC key**: se è registrata una chiave, l'**Algorithm** (ML-DSA-87), il **Key type** (hybrid), la **Proof of possession** (con la nota che la chain la considera facoltativa) e la **Public key** (2592 byte, troncata, con un pulsante di copia). Un account senza chiave riporta "This account has no PQC key registered on this network."
5. Leggi **EVM authorisation window**: **State** (**Open** o **Closed**), **Blocks left**, **Transactions used** (nello stile "3 of 20"), **Value used**, **Opened / expiry height**, e se la finestra consente **Native QOR transfers only**, con eventuali destinazioni consentite. Un account che non ne ha mai aperta una riporta "No EVM authorisation window has been opened for this account."

La finestra viene aperta dalla lane nativa con la chiave ML-DSA-87 dell'account e si chiude quando raggiunge il limite di blocchi o di transazioni; vedi [Finestra di autorizzazione EVM](/developer-guide/evm-development#evm-window).

**Esempio minimo.** Scegli Testnet, incolla la forma `0x...` di un indirizzo che usi con MetaMask, seleziona **Check**: se la finestra è **Closed** o assente, una transazione EVM da quell'account verrebbe rifiutata.

### Simulator {#simulator}

**Cosa fa.** Simula a vuoto una transazione firmata sulla chain e riporta quanto costerebbe e cosa cambierebbe. Non viene trasmesso nulla.

**Come funziona.** La pagina decodifica il tuo input (base64 o esadecimale, fino a circa 180 KB), conta le firme e lo invia alla rotta di simulazione del nodo. La chiamata di simulazione è l'unica rotta di scrittura che il gateway consente.

**Passaggi.**

1. Apri **Simulator** e scegli la rete.
2. Incolla la transazione firmata (un `TxRaw`, base64 o esadecimale) in **Signed TxRaw**. La pagina mostra la dimensione decodificata e il numero di firme, e avvisa se non ce ne sono (la chain molto probabilmente rifiuterà di simulare una transazione non firmata).
3. Seleziona **Simulate**.
4. Leggi **Gas used**, il **Suggested gas limit**, i **Balance changes** (indirizzo, denominazione, variazione) e gli **Events** nell'elenco comprimibile.
5. Se la chain rifiuta, la pagina mostra il suo **Code**, **Codespace** e **Log** sotto "The chain refused the simulation".

Servono prima i byte firmati: costruisci e firma con un SDK o con `qorechaind` (vedi [Firma post-quantistica](/developer-guide/post-quantum-signing)). **Esempio minimo:** firma un piccolo trasferimento con l'SDK su testnet, incolla il `TxRaw` in base64, seleziona **Simulate** e controlla il limite di gas suggerito prima di trasmettere.

### Signing playground (solo testnet) {#signing-playground}

**Cosa fa.** Ti permette di generare una chiave ibrida usa e getta e di firmare e verificare messaggi e richieste Sign In With QoreChain nel browser.

**Come funziona.** Una frase di 24 parole viene generata nella pagina e conservata solo in memoria. [QoreSign](/qoresign/overview) ne deriva una chiave secp256k1 e una chiave ML-DSA-87. Le firme coprono lo stesso messaggio con entrambe le chiavi, per la chain `qorechain-diana`. Poiché una chiave usa e getta non è registrata on-chain, la verifica usa la chiave pubblica ML-DSA-87 di questa sessione.

**Passaggi.**

1. Apri **Signing playground**. Avvisa "Throwaway testnet key: never use it for real funds."
2. Seleziona **Generate throwaway key**. La pagina mostra l'indirizzo `qor1...`, la chiave pubblica secp256k1 (33 byte) e la chiave ML-DSA-87 (chiave pubblica 2592 byte, chiave segreta 4896 byte). **New key** la sostituisce.
3. **Message:** digita del testo, seleziona **Sign**; il risultato è una firma ibrida come JSON. Seleziona **Verify**: la pagina mostra "Valid signature", oppure "Invalid signature" con il codice di errore.
4. **Sign In With QoreChain:** seleziona **Build message** (un messaggio di accesso per questo sito con dominio, indirizzo, id di chain, un nonce casuale e orari di emissione e scadenza), poi **Sign**, poi **Verify**. Verify lo controlla come farebbe un server ed elenca i campi analizzati. Vedi la [specifica SIWQ](/qoresign/spec/siwq-v1) e la [guida all'accesso](/qoresign/guides/sign-in).

**Esempio minimo.** **Generate throwaway key**, digita `hello`, **Sign**, **Verify**: la pagina mostra "Valid signature".

**Rete.** Solo testnet; la chiave non può essere usata per la mainnet e si perde al ricaricamento.

### QoreX test wallet (solo testnet) {#test-wallet}

**Cosa fa.** Installa un mock del wallet QoreX nella scheda corrente così puoi provare i flussi di connessione e firma di una dApp senza un wallet reale.

**Come funziona.** **Start test wallet** crea un test wallet con una chiave usa e getta (il pacchetto pubblicato `@qorechain/qorex-wallet-mock`) e lo annuncia alle dApp nella pagina come "QoreX (mock)", tramite la scoperta standard dei wallet per browser (EIP-6963); espone anche `window.qorex`. Nulla viene approvato automaticamente. Non trasmette transazioni. Se nella scheda è presente un'estensione QoreX reale, il mock la sostituisce fino al ricaricamento.

**Passaggi.**

1. Apri **QoreX test wallet** e leggi l'avviso: a ogni avvio viene generata in memoria una chiave testnet usa e getta; non inviarle mai fondi reali.
2. Seleziona **Start test wallet**. La scheda **Addresses** elenca gli indirizzi QoreChain Native, EVM e SVM.
3. Connettiti da una dApp in esecuzione in questa scheda, oppure chiama `window.qorex` dalla console del browser.
4. Ogni richiesta appare sotto **Waiting for approval**; seleziona **Approve** o **Reject**. L'elenco **Requests** registra ogni richiesta con il suo stato di approvazione e il suo esito.
5. Seleziona **Stop (reloads the page)** per rimuovere il mock.

**Esempio minimo.** Avvia il test wallet, apri una dApp nella stessa scheda, scegli "QoreX (mock)" nella sua finestra di connessione e **Approve** la connessione.

**Rete.** Solo testnet.

### AI agents (MCP) {#mcp}

**Cosa fa.** Mostra lo stato del server MCP di QoreChain (un server Model Context Protocol che permette a un client MCP di leggere i dati della chain QoreChain e di usare gli strumenti per sviluppatori) e come configurarlo in un client MCP.

**Come funziona.** Quando apri la scheda, la pagina interroga il registry dei pacchetti in tempo reale e mostra lo stato (**Published**) con la versione attuale (`@qorechain/mcp`, 0.1.0 al momento della stesura, disponibile anche su PyPI come `qorechain-mcp`). Poi mostra la configurazione per un client MCP, come blocchi copiabili:

- **Locale (stdio), l'opzione principale.** Aggiungi `{ "mcpServers": { "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] } } }` alla configurazione dei server del tuo client MCP. Non richiede alcuna chiave.
- **Self-hosted (Streamable HTTP).** Esegui `qorechain-mcp serve --port 8787` e punta il client a `http://localhost:8787/mcp`.
- **Endpoint ospitato.** `https://mcp.qorechain.io/mcp` serve la testnet per impostazione predefinita. Ogni richiesta richiede una chiave API, inviata come header `Authorization: Bearer`; le chiavi vengono rilasciate su richiesta. Per la maggior parte degli usi la configurazione locale non richiede alcuna chiave.

**Passaggi.** Apri la scheda, copia la configurazione locale nel tuo client MCP, riavvialo e chiedigli di leggere un blocco o un account. Per i dettagli sugli strumenti e le opzioni vedi [Server MCP di QoreChain](/developer-tools/mcp). **Esempio minimo:** incolla il blocco stdio nel tuo client, riavvialo e chiedigli l'ultimo blocco.

## Come accedere {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), oppure **Developers** nel gruppo **Build** della barra laterale (e nel menu mobile).
- **Accesso:** nessuno. La pagina è aperta a tutti.
- **Rete:** **PQ key status** e **Simulator** funzionano su mainnet o testnet tramite il selettore nella scheda (predefinito testnet). **Signing playground** e **QoreX test wallet** sono solo testnet. **SDKs** e **AI agents (MCP)** non dipendono da una rete.
- **Wallet:** nessuno. Gli strumenti generano le proprie chiavi usa e getta.
- **Costo:** gratuito. Alla chain non viene inviato nulla se non query di lettura e chiamate di simulazione.
- **Privacy:** le chiavi usa e getta esistono solo nella memoria della pagina. Non incollare una frase di recupero reale in nessuno strumento.

## Dove è pubblicato {#where-published}

| Superficie | Indirizzo | Reti |
| --- | --- | --- |
| Pagina Developers | `dashboard.qorechain.io/developers` | Strumenti di lettura su mainnet e testnet; strumenti di firma solo testnet |
| Libreria di firma | npm `@qorechain/qoresign`, sorgente `github.com/qorechain/qoresign`, vedi [QoreSign](/qoresign/overview) | n/d |
| Pacchetto del test wallet | npm `@qorechain/qorex-wallet-mock`, sorgente `github.com/qorechain/qorex-integrations` | Testnet |
| Indice dei pacchetti | [Pacchetti per sviluppatori](/developer-tools/overview) | n/d |
| Server MCP | npm `@qorechain/mcp` 0.1.0 e `@qorechain/qore-cli` 0.1.0, PyPI `qorechain-mcp` 0.1.0; guida: [Server MCP di QoreChain](/developer-tools/mcp) | Testnet per impostazione predefinita |

Le versioni dei pacchetti cambiano; leggi quelle attuali nella scheda **SDKs** o sui registry.

## Limiti e problemi noti {#limits}

- **Transaction inspector: in arrivo, non ancora attivo.** Previsto: incolla un hash e vedi ogni messaggio, il firmatario, la commissione, se la firma post-quantistica si verifica rispetto alla chiave registrata del firmatario e il livello di sicurezza. Arriva con la prossima release di QoreSign.
- **L'endpoint MCP ospitato richiede una chiave API,** rilasciata su richiesta; la configurazione locale non ne richiede alcuna. Per la maggior parte del lavoro usa la configurazione locale.
- **Due quickstart sono contrassegnati "Not tested":** QoreSign per Android (lo stesso codice è stato eseguito solo sull'artefatto JVM, non su un dispositivo) e QoreSign per Python. Le altre 32 voci di quickstart sono state eseguite e hanno superato la prova.
- **Il simulatore richiede byte firmati.** Non può firmare per te e non trasmette mai.
- **Il playground e il test wallet sono solo testnet,** usano chiavi usa e getta che scompaiono al ricaricamento e non possono detenere né spostare fondi reali.
- **Un'estensione QoreX reale nella stessa scheda viene sostituita** dal test wallet fino al ricaricamento.
- **Le letture passano dal gateway della Dashboard.** Dal tuo codice chiama direttamente gli endpoint pubblici: `api.qore.host` e `api-testnet.qore.host`.
