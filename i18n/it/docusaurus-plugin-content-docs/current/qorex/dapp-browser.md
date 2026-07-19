---
slug: /qorex/dapp-browser
title: Browser dApp
sidebar_label: Browser dApp
sidebar_position: 7
---

# Browser dApp (mobile)

QoreX include un **browser dApp** integrato nell'app, così puoi usare le applicazioni QoreChain senza uscire dal wallet, con ogni firma approvata in modo esplicito.

## Connettersi a una dApp

Apri il **browser dApp** dalla scheda Home e naviga verso un'app. QoreX inietta i propri provider nella pagina — un provider di connessione QoreChain, un provider EVM in sola lettura e cortesi alias `keplr` / `ethereum` che **non dirottano mai** altri wallet reali.

- **La connessione** richiede **un'approvazione per origine**. L'approvazione rivela al sito solo il tuo indirizzo pubblico.
- **Ogni firma** è una propria approvazione protetta da biometria, con il payload **decodificato** così puoi vedere esattamente cosa stai firmando — **non esiste firma alla cieca**.
- **Tutti i permessi decadono alla chiusura del browser** — le connessioni hanno ambito di sessione.

## Q-Day Scanner

Dai pulsanti rapidi della scheda Home puoi anche aprire il **Q-Day Scanner**: inserisci un indirizzo qualsiasi per ottenere il suo report di esposizione quantistica — quali fondi risiedono su chiavi solo classiche e quali sono già protetti in modo post-quantistico. Vedi [Sicurezza e recupero](/qorex/security-and-recovery#q-day-scanner).

## Riferimento rapido alle impostazioni

Altri controlli utili in **Impostazioni**:

- **Dashboard di sicurezza** → [Sicurezza e recupero](/qorex/security-and-recovery)
- **I tuoi indirizzi** e **Account collegato** → [Account e Dashboard](/qorex/account-and-dashboard)
- **Usa la testnet (sviluppatori)** — passa alla testnet `qorechain-diana` (EVM chain ID 9800); l'app si ricollega dal vivo, senza riavvio. L'impostazione predefinita è sempre la mainnet.
- **Animazione del portafoglio** — attiva/disattiva lo sfondo Aurora.
- **Stato della rete** — mostra "Connected to …" con gli endpoint attivi.

## Note sulle piattaforme

- **iOS** — Face ID (al primo utilizzo compare un messaggio di richiesta d'uso), un vault Secure Enclave, l'accesso tramite il pannello di autenticazione di sistema e un permesso della fotocamera per il collegamento dei dispositivi e la scansione dei QR.
- **Android** — BiometricPrompt con un Keystore StrongBox, deep link registrati per i flussi `qorex://` (callback di autenticazione, connect, tx, link) e un permesso della fotocamera per il collegamento dei dispositivi.

Per le dApp desktop, usa invece l'[Estensione per browser](/qorex/browser-extension).
