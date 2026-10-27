---
slug: /dashboard/developers
title: Sviluppatori
sidebar_label: Sviluppatori
sidebar_position: 13
---

# Sviluppatori

La pagina **Developers** (`/developers`, barra laterale **Build**, voce **Developers**) è una cassetta degli attrezzi pubblica per chi sviluppa su QoreChain. Ha sei schede: **SDKs**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet** e **AI agents (MCP)**. Puoi verificare quale chiave post-quantistica ha registrato un account e se la sua finestra di autorizzazione EVM è aperta, simulare a vuoto una transazione firmata, fare pratica con la firma ibrida usando una chiave usa e getta e mettere alla prova una dApp con un wallet QoreX fittizio, il tutto nel browser e senza un account. È pensata per sviluppatori di dApp, wallet e backend. Per gli SDK stessi vedi [Panoramica SDK](/sdk/overview) e [Installazione](/sdk/install).

## Innovazioni {#innovations}

- **Leggi una chiave PQC e la finestra EVM dalla chain, per qualsiasi indirizzo.** La scheda PQ key status cerca la chiave ML-DSA-87 registrata da un account e la sua finestra di autorizzazione EVM tramite le rotte di query della chain stessa, su mainnet o testnet. Accetta indirizzi `qor1...`, `0x...` e `qorvaloper1...`.
- **Una simulazione a vuoto che non trasmette nulla.** Il simulatore invia una transazione firmata alla rotta di simulazione della chain e riporta il gas usato, un limite di gas suggerito e le variazioni di saldo e gli eventi che la transazione produrrebbe. L'unica rotta di scrittura che la Dashboard espone a questo scopo è simulate.
- **Firma ibrida nel browser, con una chiave che non lo lascia mai.** Il signing playground genera nella pagina una frase usa e getta di 24 parole, ne deriva una chiave secp256k1 e una chiave ML-DSA-87, e firma e verifica messaggi e richieste Sign In With QoreChain con la libreria [QoreSign](/qoresign/overview). La chiave vive solo in memoria e scompare al ricaricamento.
- **Un QoreX fittizio per testare le dApp.** Il QoreX test wallet installa `window.qorex` e si annuncia tramite EIP-6963 come "QoreX (mock)" nella scheda corrente, con vera firma ibrida su testnet e approvazione o rifiuto manuale per ogni richiesta.
- **Solo testnet per costruzione.** Il signing playground e il test wallet rifiutano la mainnet: firmano solo per `qorechain-diana`. Le due schede di sola lettura possono puntare a entrambe le reti.

## Come si usa {#how-to-use}

La pagina si apre sulla scheda **SDKs**. Le schede **PQ key status** e **Simulator** mostrano un selettore **Network** locale alla pagina che **per impostazione predefinita è su Testnet**, qualunque cosa dica l'intestazione. (Si usa un selettore a livello di pagina perché il cambio di rete non ricarichi la pagina e non cancelli le tue chiavi in memoria e il test wallet.)

### PQ key status {#pq-status}

1. Apri la scheda **PQ key status** e scegli la rete.
2. Inserisci un **Account address** (`qor1...`, `0x...` o `qorvaloper1...`). Un indirizzo `0x` corrisponde agli stessi 20 byte della sua forma `qor1`; un indirizzo `qorvaloper` viene cercato come account proprio dell'operatore. La pagina controlla il formato e il checksum.
3. Seleziona **Check**.
4. **Registered PQC key** mostra se è registrata una chiave, il suo algoritmo (ML-DSA-87), il tipo di chiave, la **Proof of possession** (la chain la considera facoltativa) e la chiave pubblica. Se non ne è registrata nessuna, lo indica.
5. **EVM authorisation window** mostra lo stato (**Open** o **Closed**), **Blocks left**, **Transactions used** (per esempio "3 of 20"), **Value used**, le altezze di apertura e di scadenza, se la finestra è **Native QOR transfers only** ed eventuali destinazioni consentite. Se l'account non ne ha mai aperta una, dice "No EVM authorisation window has been opened for this account."

La finestra viene aperta dalla lane nativa con la chiave ML-DSA-87 dell'account e si chiude quando raggiunge il limite di blocchi o di transazioni; vedi [Finestra di autorizzazione EVM](/developer-guide/evm-development#evm-window). Questa scheda risponde alla domanda comune "perché la mia transazione EVM è stata rifiutata?" senza una riga di comando.

### Simulator {#simulator}

1. Apri la scheda **Simulator** e scegli la rete.
2. Incolla un **Signed TxRaw** (base64 o esadecimale) nel riquadro. La pagina indica la dimensione decodificata e il numero di firme, e avvisa se non ce ne sono (la chain molto probabilmente rifiuterà di simulare una transazione non firmata).
3. Seleziona **Simulate**. Il risultato mostra **Gas used**, il **Suggested gas limit**, i **Balance changes** (indirizzo, denominazione, variazione) e gli **Events**.
4. Se la chain rifiuta, la pagina mostra il suo codice, il codespace e il log.

Non viene trasmesso nulla. Servono i byte di una transazione firmata: costruiscila e firmala prima con un SDK o con `qorechaind` (vedi [Firma post-quantistica](/developer-guide/post-quantum-signing)). L'input è limitato a circa 180 KB.

### Signing playground (solo testnet) {#signing-playground}

1. Apri la scheda **Signing playground**. Avvisa: "Throwaway testnet key: never use it for real funds."
2. Seleziona **Generate throwaway key**. La pagina mostra l'indirizzo, la dimensione della chiave pubblica secp256k1 e le dimensioni delle chiavi ML-DSA-87. Seleziona **New key** per averne un'altra.
3. **Message:** inserisci del testo e seleziona **Sign**. Il testo viene firmato con entrambe le chiavi per la chain `qorechain-diana`; la firma appare come JSON.
4. **Verify:** incolla una firma e l'indirizzo del firmatario e seleziona **Verify**. Riporta "Valid signature" oppure "Invalid signature". Poiché una chiave usa e getta non è registrata on-chain, il controllo avviene rispetto all'indirizzo del firmatario e alla chiave pubblica ML-DSA-87 di questa sessione.
5. **Sign In With QoreChain:** seleziona **Build message** per creare un messaggio di accesso per questo sito con un nonce casuale, poi firmalo e verificalo come farebbe un server. Vengono mostrati i campi analizzati. Vedi la [specifica SIWQ](/qoresign/spec/siwq-v1) e la [guida all'accesso](/qoresign/guides/sign-in).

La chiave viene generata nel browser, mai salvata né inviata, e non può essere recuperata. Vedi [QoreSign](/qoresign/overview) e [Firma ibrida v1](/qoresign/spec/hybrid-signing-v1) per i formati.

### QoreX test wallet (solo testnet) {#test-wallet}

1. Apri la scheda **QoreX test wallet** e leggi l'avviso: a ogni avvio viene generata in memoria una chiave testnet usa e getta; non inviarle mai fondi reali.
2. Seleziona **Start test wallet**. Usa il pacchetto pubblicato `@qorechain/qorex-wallet-mock`, installa il mock in **questa scheda** (sostituendo lì un'estensione QoreX reale fino al ricaricamento) ed elenca gli **Addresses** che detiene: QoreChain Native, EVM e SVM.
3. Connettiti da una dApp in esecuzione nella stessa scheda, oppure chiama `window.qorex` dalla console del browser.
4. Ogni richiesta resta in attesa di te sotto **Waiting for approval**: seleziona **Approve** o **Reject**. L'elenco **Requests** registra ciascuna con il suo stato di approvazione e il suo esito.
5. Seleziona **Stop (reloads the page)** per rimuovere il mock.

Firma solo per la testnet e mai per la mainnet. Usalo per provare il flusso di connessione di una dApp prima di puntarla a un QoreX reale.

### SDKs e AI agents (MCP)

- **SDKs:** la scheda mostra attualmente un breve quickstart statico e una tabella dei pacchetti. **È obsoleta** (descrive ancora la versione 0.1.0 e dice che i pacchetti non sono sui registry, cosa che non è più vera). Usa [Installazione dell'SDK](/sdk/install) per i pacchetti e le versioni attuali. Una scheda SDKs ricostruita, generata dall'elenco dei pacchetti testati con comandi di installazione, quickstart e versioni live dai registry, è **in arrivo e non ancora attiva**.
- **AI agents (MCP):** la scheda controlla il registry npm per il server MCP di QoreChain e, finché il pacchetto non è pubblicato, dice **"The QoreChain MCP server is not published yet."** Non esiste ancora un comando di installazione. Quando il pacchetto sarà pubblicato, la scheda mostrerà la configurazione del client per eseguirlo in locale tramite stdio o in self-hosting tramite Streamable HTTP.
- **Transaction inspector:** uno strumento per decodificare e spiegare qualsiasi transazione è **in arrivo e non ancora attivo**.

## Come accedere {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), oppure **Developers** nel gruppo **Build** della barra laterale (e nel menu mobile).
- **Accesso:** nessuno. La pagina è aperta a tutti.
- **Rete:** PQ key status e Simulator: mainnet o testnet, tramite il selettore nella scheda (predefinito testnet). Signing playground e QoreX test wallet: solo testnet.
- **Wallet:** nessuno. Gli strumenti generano le proprie chiavi usa e getta.
- **Costo:** gratuito. Alla chain non viene inviato nulla se non query di lettura e chiamate di simulazione.
- **Privacy:** le chiavi usa e getta esistono solo nella memoria della pagina. Non incollare una frase di recupero reale in nessuno strumento.

## Dove è pubblicato {#where-published}

| Superficie | Indirizzo | Reti |
| --- | --- | --- |
| Pagina Developers | `dashboard.qorechain.io/developers` | Strumenti di lettura su mainnet e testnet; strumenti di firma solo testnet |
| Libreria di firma | npm `@qorechain/qoresign` 0.1.0, sorgente `github.com/qorechain/qoresign`, vedi [QoreSign](/qoresign/overview) | n/d |
| Pacchetto del test wallet | npm `@qorechain/qorex-wallet-mock` 0.1.0, sorgente `github.com/qorechain/qorex-integrations` | Testnet |
| Server MCP | `@qorechain/mcp`: non ancora pubblicato | n/d |

Le versioni sono state verificate sul registry npm il 27 ottobre 2026.

## Limiti e problemi noti {#limits}

- **Non ancora attivi:** la scheda SDKs ricostruita e il transaction inspector. Il server MCP non è pubblicato, quindi non c'è nulla da installare.
- **La scheda SDKs attuale è obsoleta;** usa invece le [pagine dell'SDK](/sdk/overview).
- **Il simulatore richiede una transazione firmata.** Non può firmare per te e non trasmette.
- **Il playground e il test wallet sono solo testnet** e usano chiavi usa e getta che scompaiono al ricaricamento. Non possono detenere né spostare fondi reali.
- **Un'estensione QoreX reale nella stessa scheda viene sostituita** dal test wallet fino al ricaricamento della pagina.
- **Le letture passano da un proxy di sola lettura.** Gli endpoint REST della chain non inviano intestazioni CORS per il browser, quindi la Dashboard inoltra richieste di sola lettura sotto i percorsi `cosmos/`, `cosmwasm/` e `qorechain/` e la chiamata di simulazione. Dal tuo codice, chiama direttamente gli endpoint pubblici: `api.qore.host` e `api-testnet.qore.host`.
