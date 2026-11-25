---
slug: /qorex/dapp-browser
title: Browser dApp
sidebar_label: Browser dApp
sidebar_position: 7
---

# Browser dApp (mobile)

QoreX include un **browser dApp** integrato nell'app, così puoi usare le applicazioni QoreChain senza uscire dal wallet, con ogni firma approvata in modo esplicito. È pensato per gli utenti mobile che vogliono usare un'app web senza installare altro, e per gli sviluppatori che testano la propria app dentro il wallet mobile.

## Innovazioni {#innovations}

- **Un'approvazione per sito, sempre revocabile.** Ogni origine viene approvata separatamente; i siti collegati sono salvati su questo dispositivo, per wallet, e puoi revocarne uno qualsiasi in [La protezione del mio denaro](/qorex/security-and-recovery#protection).
- **Firme decodificate e protette da biometria.** Ogni firma è una propria approvazione, con il payload decodificato; ciò che QoreX non sa decodificare, lo rifiuta.
- **`signAndBroadcast`.** Una pagina invia i messaggi; QoreX li mostra, aggiunge il livello ML-DSA-87 che solo il wallet può produrre, e trasmette.
- **Firma EVM e di messaggi nel browser.** Le dApp EVM possono far firmare messaggi, typed data e transazioni su QoreChain, con ciò che ciascuno fa decodificato e prima simulato, e qualsiasi pagina può chiedere la firma di un messaggio che porta anche una metà ML-DSA-87.
- **Aprire una pagina da un link.** Un link `browse` apre la tua pagina direttamente nel browser dApp, e la pagina iniziale conserva sul dispositivo i tuoi siti preferiti e recenti.
- **Rilevamento senza prevaricare.** QoreX si annuncia con EIP-6963 e non sovrascrive mai `window.ethereum` o `window.keplr` di un altro wallet.

## Come accedere {#how-to-access}

Il browser dApp fa parte dell'app mobile: installala dall'App Store (iOS 15.1 o successivo) o da Google Play (Android 7.0 o successivo); i link sono nella [panoramica](/qorex/overview#how-to-access). Non richiede alcun account. Per le dApp desktop, usa l'[Estensione per browser](/qorex/browser-extension).

## Connettersi a una dApp {#how-to-use}

Apri il **Browser dApp** dalla scheda Home e naviga verso un'app. Digita o incolla l'indirizzo della dApp nella casella **Inserisci l'URL di una dApp** (si connettono solo indirizzi `https://`). QoreX inietta i propri provider nella pagina come `window.qorex` - un provider QoreChain Native (incluso `signAndBroadcast`, `signDirect` e la firma di messaggi), un provider EVM e un oggetto provider Solana - e si annuncia anche tramite EIP-6963. Imposta `window.ethereum` solo quando nessun altro wallet lo ha fatto, e non sovrascrive mai un altro wallet. Non esiste alcun alias `window.keplr`. Sviluppatori: vedi [Integrare una dApp con QoreX](/qorex/dapp-integration).

### Siti preferiti e recenti {#favourites}

La pagina iniziale del browser elenca i tuoi **Preferiti** e i siti **Recenti** (gli ultimi 8). Tocca la stella nella barra degli indirizzi per conservare la pagina aperta tra i preferiti (toccala di nuovo per rimuoverla), e usa il pulsante home per tornare all'elenco. **Cancella** svuota l'elenco dei recenti. Una pagina aperta da un [link browse](#browse-links) conta come una visita. Entrambi gli elenchi restano su questo telefono, salvati senza la query o il fragment della pagina.

### Aprire una pagina da un link {#browse-links}

Un link sul web può aprire una pagina nel browser dApp: `https://link.qore.network/browse?url=<encoded https address>` oppure `qorex://browse?url=<encoded https address>`. QoreX chiede la richiesta biometrica che apre prima il browser dApp. Rifiuta un indirizzo che non sia `https://` su un nome di dominio, o che abbia una porta, un nome utente, un indirizzo IP o `localhost`. Il link non dà nulla alla pagina: deve comunque chiedere di connettersi, e ogni firma passa comunque dalla schermata di approvazione. Se sul telefono non c'è un wallet, l'app resta sull'onboarding. Vedi [Link che un servizio può generare](/qorex/dapp-integration#links).

- **La connessione** richiede **un'approvazione per origine**. L'approvazione rivela al sito solo il tuo indirizzo pubblico.
- **Ogni firma** è una propria approvazione protetta da biometria, con il payload **decodificato** così puoi vedere esattamente cosa stai firmando - **non esiste firma alla cieca**.
- **Le connessioni durano finché non le revochi.** Dalla 1.2.5 l'indirizzo del sito è salvato su questo dispositivo, per wallet. Vedi e revoca i siti collegati in [La protezione del mio denaro](/qorex/security-and-recovery#protection). Una connessione non firma mai nulla da sola: ogni firma richiede comunque la propria approvazione.
- **Le transazioni native passano da `signAndBroadcast`:** QoreX mostra ogni messaggio, la commissione e l'account firmatario, aggiunge il livello ML-DSA-87 e trasmette. Vedi [Cosa mostra la finestra di approvazione](/qorex/security-and-recovery#approvals).
- **Le dApp EVM** possono chiedere `personal_sign`, typed data e transazioni su QoreChain. L'approvazione li decodifica e mostra cosa fa la transazione al tuo saldo, dove la rete lo consente. Sulla lane EVM di QoreChain l'approvazione apre anche la breve finestra di autorizzazione richiesta dalla transazione e nomina ogni contratto che ammette; vedi [Finestra di accesso EVM](/qorex/security-and-recovery#evm-window). Solo gli account importati da MetaMask possono inviare su quella lane.
- **Firma di messaggi:** una pagina può chiederti di firmare un messaggio; prima lo vedi per intero.
- **Rete:** una pagina non può cambiare rete. Cambiala in QoreX stesso (vedi le impostazioni qui sotto), e la pagina deve essere sulla stessa rete del wallet.

## Q-Day Scanner

Dai pulsanti rapidi della scheda Home puoi anche aprire il **Q-Day Scanner**: inserisci un qualsiasi indirizzo Bitcoin o Ethereum per ottenere un report di esposizione. Vedi [Sicurezza e recupero](/qorex/security-and-recovery#q-day-scanner).

## Riferimento rapido alle impostazioni

Altre voci utili in **Impostazioni**:

- **Sicurezza** → [Sicurezza e recupero](/qorex/security-and-recovery)
- **Lingua** - segue il telefono per impostazione predefinita; 10 lingue
- **Rivedi il tour** - cinque brevi card su cosa fa QoreX e dove si trovano le cose
- **Monete e reti** - tutto ciò che il wallet può detenere e inviare oggi
- **Wallet** - più frasi di recupero su questo telefono - vedi [Più wallet](/qorex/getting-started#several-wallets)
- **I tuoi account** e **I tuoi indirizzi** → [Account e Dashboard](/qorex/account-and-dashboard)
- **Richiedi il tuo @handle** e **Account collegato** → [Account e Dashboard](/qorex/account-and-dashboard)
- **Usa la testnet (sviluppatori)** - passa alla testnet `qorechain-diana` (EVM chain ID 9800); l'app si ricollega dal vivo, senza riavvio. L'impostazione predefinita è sempre la mainnet. I saldi della testnet non mostrano alcun valore in USD.
- **Modalità sviluppatore** - disattivata per impostazione predefinita; aggiunge una scheda Sviluppo con strumenti per chi sviluppa su QoreChain. Vedi [Modalità sviluppatore](/qorex/developer-mode).
- **Animazione del portafoglio** - attiva/disattiva lo sfondo Aurora.
- **Elimina account** → [Elimina il tuo account](/qorex/account-and-dashboard#delete-account)
- **Connesso a** - mostra la rete attiva e il suo chain ID.

## Note sulle piattaforme

- **iOS** (iOS 15.1 o successivo) - Face ID (al primo utilizzo compare un messaggio di richiesta d'uso), un vault Secure Enclave, l'accesso tramite il pannello di autenticazione di sistema e un permesso della fotocamera per il collegamento dei dispositivi e la scansione dei QR.
- **Android** (Android 7.0 o successivo) - BiometricPrompt con un Keystore StrongBox, deep link registrati per i flussi `qorex://` (callback di autenticazione, connect, tx, link) e un permesso della fotocamera per il collegamento dei dispositivi.

Per le dApp desktop, usa invece l'[Estensione per browser](/qorex/browser-extension).

## Dove è pubblicato {#where-published}

Il browser dApp è incluso nell'app mobile QoreX (App Store e Google Play); vedi [Dove è pubblicato](/qorex/overview#where-published) per le schede dello store e le versioni attuali. Non è un download separato.

## Limiti e problemi noti {#limits}

- Si connettono solo indirizzi `https://`.
- Il browser integrato firma solo sulla rete attiva di QoreChain ed emette solo l'evento EVM `connect`: viene chiuso per cambiare account o rete. Non firma transazioni Solana e non ha alcuna rete Ethereum.
- `window.qorex.native` è in stile Keplr, non un sostituto diretto di Keplr, e non esiste alcun alias `window.keplr`. La firma Amino viene rifiutata.
- Il Q-Day Scanner, il recupero sociale e Legacy sono nell'app, non nell'estensione.
