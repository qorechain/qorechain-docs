---
slug: /qorex/dapp-browser
title: Browser dApp
sidebar_label: Browser dApp
sidebar_position: 7
---

# Browser dApp (mobile)

QoreX include un **browser dApp** integrato nell'app, così puoi usare le applicazioni QoreChain senza uscire dal wallet, con ogni firma approvata in modo esplicito.

## Connettersi a una dApp

Apri il **browser dApp** dalla scheda Home e naviga verso un'app. Digita o incolla l'indirizzo della dApp nella casella **Enter a dApp URL** (si connettono solo indirizzi `https://`). QoreX inietta i propri provider nella pagina come `window.qorex` — un provider QoreChain Native (incluso `signAndBroadcast`), un provider EVM in sola lettura (solo query su account e chain) e un provider Solana — e si annuncia anche tramite EIP-6963. Imposta `window.ethereum` solo quando nessun altro wallet lo ha fatto, e non sovrascrive mai un altro wallet. Non esiste alcun alias `window.keplr`.

- **La connessione** richiede **un'approvazione per origine**. L'approvazione rivela al sito solo il tuo indirizzo pubblico.
- **Ogni firma** è una propria approvazione protetta da biometria, con il payload **decodificato** così puoi vedere esattamente cosa stai firmando — **non esiste firma alla cieca**.
- **Tutti i permessi decadono alla chiusura del browser** — le connessioni hanno ambito di sessione.
- **Le transazioni native passano da `signAndBroadcast`:** QoreX mostra ogni messaggio, la commissione e l'account firmatario, aggiunge il livello quantum-safe e trasmette. Il provider EVM qui risponde solo alle query su account e chain; non firma né invia transazioni EVM. Vedi [Cosa mostra la finestra di approvazione](/qorex/security-and-recovery#approvals).

## Q-Day Scanner

Dai pulsanti rapidi della scheda Home puoi anche aprire il **Q-Day Scanner**: inserisci un indirizzo qualsiasi per ottenere il suo report di esposizione quantistica — quali fondi risiedono su chiavi solo classiche e quali sono già protetti in modo post-quantistico. Vedi [Sicurezza e recupero](/qorex/security-and-recovery#q-day-scanner).

## Riferimento rapido alle impostazioni

Altre voci utili in **Impostazioni**:

- **Sicurezza** → [Sicurezza e recupero](/qorex/security-and-recovery)
- **Lingua** — segue il telefono per impostazione predefinita; 10 lingue
- **Rifai il tour** — cinque brevi card su cosa fa QoreX e dove si trovano le cose
- **Coin e reti** — tutto ciò che il wallet può detenere e inviare oggi
- **Wallet** — più frasi di recupero su questo telefono — vedi [Più wallet](/qorex/getting-started#several-wallets)
- **I tuoi account** e **I tuoi indirizzi** → [Account e Dashboard](/qorex/account-and-dashboard)
- **Rivendica il tuo @handle** e **Account collegato** → [Account e Dashboard](/qorex/account-and-dashboard)
- **Usa la testnet (sviluppatori)** — passa alla testnet `qorechain-diana` (EVM chain ID 9800); l'app si ricollega dal vivo, senza riavvio. L'impostazione predefinita è sempre la mainnet. I saldi della testnet non mostrano alcun valore in USD.
- **Animazione del portafoglio** — attiva/disattiva lo sfondo Aurora.
- **Elimina account** → [Elimina il tuo account](/qorex/account-and-dashboard#delete-account)
- **Connesso a** — mostra la rete attiva e il suo chain ID.

## Note sulle piattaforme

- **iOS** (iOS 15.1 o successivo) — Face ID (al primo utilizzo compare un messaggio di richiesta d'uso), un vault Secure Enclave, l'accesso tramite il pannello di autenticazione di sistema e un permesso della fotocamera per il collegamento dei dispositivi e la scansione dei QR.
- **Android** (Android 7.0 o successivo) — BiometricPrompt con un Keystore StrongBox, deep link registrati per i flussi `qorex://` (callback di autenticazione, connect, tx, link) e un permesso della fotocamera per il collegamento dei dispositivi.

Per le dApp desktop, usa invece l'[Estensione per browser](/qorex/browser-extension).
