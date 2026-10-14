---
slug: /qorex/overview
title: Wallet QoreX
sidebar_label: Panoramica
sidebar_position: 1
---

# Wallet QoreX

**QoreX** è il wallet ufficiale **non-custodial** per **QoreChain**, la Layer 1 quantum-safe (mainnet `qorechain-vladi`). Le tue chiavi private vengono generate e conservate **solo sul tuo dispositivo** — QoreChain Association non ha mai accesso ai tuoi fondi e le app non contengono **alcun analytics, tracking o pubblicità**. Ogni trasferimento di QOR sul lane Native porta una **firma post-quantum ibrida** (ML-DSA-87, NIST FIPS-204, abbinata a secp256k1), così i tuoi fondi sono protetti sia da attaccanti classici sia quantistici.

QoreX è composto da due parti che lavorano insieme:

- **Estensione browser** — il wallet desktop, **live e pubblica su Chrome, Firefox e Safari (macOS)**. È un wallet a sé stante (crea/importa, detieni e invia QOR) e il connettore che permette a qualsiasi sito web di rilevare QoreX e trasformare ogni richiesta in un'approvazione esplicita. Vedi [Estensione browser](/qorex/browser-extension).
- **App mobile** (Android e iOS) — il wallet completo: crea/ripristina, invia e ricevi QOR quantum-safe, reti esterne, staking, portafoglio, recupero e un browser dApp integrato. **Su Google Play** per Android, e **sull'App Store** per iOS (vedi disponibilità qui sotto).

:::caution Esegui il backup della tua passphrase di recupero non appena crei un wallet
QoreX è non-custodial: QoreChain Association non può recuperare un wallet perso, reimpostarlo o ripristinarlo per te. **Disinstallare l'app, reimpostare il telefono o rimuovere l'estensione elimina le tue chiavi da quel dispositivo.** Annota la tua passphrase di recupero di 24 parole (l'app mobile non la mostra mentre crea il wallet — rivelala da **Impostazioni → Sicurezza → Rivela la passphrase di recupero**; l'estensione la mostra una sola volta alla creazione) e, se puoi, configura il [recupero sociale](/qorex/security-and-recovery#social-recovery). Vedi [Esegui il backup ora](/qorex/security-and-recovery#back-up-now).
:::

## Disponibilità per piattaforma {#platform-availability}

| Capacità | App mobile (Android e iOS) | Estensione browser |
|---|---|---|
| Creazione / importazione di un wallet | ✅ (l'app non mostra la passphrase quando crea il wallet — rivelala da Impostazioni → Sicurezza) | ✅ (a sé stante; la passphrase viene mostrata una sola volta alla creazione) |
| Più wallet, ciascuno con la propria passphrase di recupero | ✅ (Impostazioni → Wallet) | ✅ (**Wallet**, un'unica password per tutti) |
| Più account da un'unica passphrase di recupero | ✅ (fino a 20 per wallet) | ✅ |
| Account in stile Ethereum (coin 60), aggiunto a mano | ✅ | ✅ |
| Invio e ricezione di QOR (post-quantum) | ✅ | ✅ (Invia; Ricevi con QR) |
| Ricezione su qualsiasi rete supportata | ✅ | ✅ |
| Pagamento / rivendicazione di un @handle | ✅ | ✅ per il pagamento; la rivendicazione è offerta sui normali account QoreChain in alcune versioni dell'estensione — altrimenti rivendica nell'app |
| Staking: delega, rimozione delega, spostamento dello stake, riscatto, riscatto e restake | ✅ | ✅ |
| Reti esterne (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + token) | ✅ | ✅ (invio dal popup) |
| Aggiunta di un token tramite contratto (reti EVM) | ✅ | ✅ |
| Finestra di accesso EVM | ✅ | ✅ |
| Lingua dell'interfaccia (10 lingue) | ✅ (segue il telefono) | ✅ (segue il browser) |
| Portfolio, Q-Day Scanner, Recupero sociale, Legacy | ✅ | — |
| Ricerca, tour al primo avvio, widget della schermata Home, notifiche push | ✅ | — |
| Connessioni dApp | ✅ (browser in-app, limitato alla sessione) | ✅ (qualsiasi sito web; **Siti connessi** con Revoca) |
| Swap | Solo Android, disattivato finché non c'è liquidità nei pool (non mostrato su iOS) | — |
| Accesso account e richieste di pagamento | ✅ | — |
| Collegamento multi-dispositivo | ✅ | — |
| Abbinamento dashboard | ✅ | ✅ (connessione + trasferimenti proposti, incl. staking) |

## Perché QoreX è diverso

- **Quantum-safe per impostazione predefinita** — i trasferimenti di QOR sul lane Native portano sempre una firma ibrida ML-DSA-87 + secp256k1. Tutto ciò che è classico (chain esterne) è chiaramente etichettato, mai in modo silenzioso.
- **Veramente non-custodial** — le chiavi sono generate on-device e risiedono in un vault hardware (Secure Enclave su iOS, StrongBox su Android) o in un vault cifrato (estensione). Non lasciano mai il tuo dispositivo.
- **Nessun analytics, nessun tracking, nessuna pubblicità** in nessuna app QoreX. Gli extra opzionali usano un server solo quando li attivi: l'accesso account (vedi [Account e Dashboard](/qorex/account-and-dashboard)) e le notifiche push, che registrano il tuo dispositivo e i tuoi indirizzi *pubblici* in modo che QoreX possa avvisarti quando arrivano QOR. Il wallet non dipende mai da nessuno dei due.
- **Un saldo unificato** — il tuo QOR è un unico saldo su tutti i lane Native, EVM e SVM; QoreX lo mostra come una cifra unica.
- **Più percorsi di recupero** — una passphrase di recupero di 24 parole (sempre; su mobile, rivelala da Impostazioni → Sicurezza), recupero sociale opzionale con guardian e un timelock di 48 ore, eredità Legacy opzionale, e un comodo collegamento multi-dispositivo.

## Per iniziare

- Nuovo su QoreX? Inizia con [Per iniziare](/qorex/getting-started) per creare o ripristinare il tuo wallet.
- Poi impara a [Inviare e ricevere](/qorex/send-and-receive) QOR quantum-safe.
- Configura la tua rete di sicurezza in [Sicurezza e recupero](/qorex/security-and-recovery).
- Su desktop, installa l'[Estensione browser](/qorex/browser-extension).

## Download e disponibilità {#availability}

- **Estensione browser** — live e pubblica: installala da [Chrome Web Store, Firefox Add-ons, o Mac App Store (Safari)](/qorex/browser-extension#install). Installa sempre da una scheda ufficiale dello store.
- **App Android** — live in produzione su Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex (Android 7.0 o successivo).
- **App iOS** — live sull'**App Store**: https://apps.apple.com/us/app/qorex-wallet/id6791256626 (iOS 15.1 o successivo).

## Quale versione è live dove {#versions}

La revisione degli store segue una propria tempistica, quindi uno store può servire per breve tempo una build più vecchia o più recente di un altro. Al **15 ottobre 2026**:

| Piattaforma | Versione live |
|---|---|
| Android | 1.1.6 |
| iOS | 1.1.6 |
| Chrome | 0.3.6 |
| Firefox | 0.3.7 (una point release dopo la 0.3.6) |
| Safari (macOS) | 1.7.6, con l'estensione 0.3.6 |

Questa documentazione descrive l'insieme di funzionalità della 1.1.6 / 0.3.6. Uno store che serve ancora una build più vecchia si aggiornerà automaticamente; gli store mostrano sempre la loro versione corrente. Novità principali dalla 1.0.9 / 0.2.6:

- **Più wallet** sullo stesso telefono o browser, ciascuno con la propria passphrase di recupero, con cambio in un tocco — vedi [Più wallet](/qorex/getting-started#several-wallets).
- **Account in stile Ethereum (coin 60)**, aggiunto a mano, per le passphrase usate per la prima volta in MetaMask o sulla Dashboard — vedi [Ripristinare una passphrase da MetaMask o dalla Dashboard](/qorex/getting-started#restore-dashboard).
- **Aggiunta di un token tramite contratto**, **Ricezione su qualsiasi rete**, **ricerca** globale, un **tour** al primo avvio, un **widget della schermata Home** e **notifiche push** all'arrivo di QOR (mobile) — vedi [Inviare e ricevere](/qorex/send-and-receive).
- **Riscatto e restake**, un controllo delle commissioni prima del riscatto, un elenco **Unstaking in corso** e avvisi prima di fare staking al punto da non poter più fare unstaking — vedi [Portfolio e staking](/qorex/portfolio-and-staking).
- Schermate di approvazione che mostrano ogni messaggio, la commissione, i limiti di spesa e la scadenza, e rifiutano ciò che QoreX non può visualizzare; **`signAndBroadcast`** per le dApp; **Siti connessi** con Revoca (estensione); la **finestra di accesso EVM** — vedi [Sicurezza e recupero](/qorex/security-and-recovery) e l'[Estensione browser](/qorex/browser-extension).
- Correzioni: un account con fondi poteva scomparire per un momento da «I tuoi account» (1.0.9); il tasto Indietro hardware di Android ora torna indietro di una schermata (1.1.1); la passphrase di recupero viene nascosta ai servizi non di accessibilità su Android 14 e successivi (1.1.6).
