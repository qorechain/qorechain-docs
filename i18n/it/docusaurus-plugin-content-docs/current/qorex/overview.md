---
slug: /qorex/overview
title: Wallet QoreX
sidebar_label: Panoramica
sidebar_position: 1
---

# Wallet QoreX

**QoreX** è il wallet ufficiale **non-custodial** per **QoreChain**, la Layer 1 quantum-safe (mainnet `qorechain-vladi`). Le tue chiavi private vengono generate e conservate **solo sul tuo dispositivo** — QoreChain Association non ha mai accesso ai tuoi fondi e le app non raccolgono **alcun dato**. Ogni trasferimento di QOR sul lane Native porta una **firma post-quantum ibrida** (ML-DSA-87, NIST FIPS-204, abbinata a secp256k1), così i tuoi fondi sono protetti sia da attaccanti classici sia quantistici.

QoreX è composto da due parti che lavorano insieme:

- **Estensione browser** — il wallet desktop, **live e pubblica su Chrome, Firefox e Safari (macOS)**. È un wallet a sé stante (crea/importa, detieni e invia QOR) e il connettore che permette a qualsiasi sito web di rilevare QoreX e trasformare ogni richiesta in un'approvazione esplicita. Vedi [Estensione browser](/qorex/browser-extension).
- **App mobile** (Android e iOS) — il wallet completo: crea/ripristina, invia e ricevi QOR quantum-safe, reti esterne, staking, portafoglio, recupero e un browser dApp integrato. **Su Google Play** per Android, e **sull'App Store** per iOS (vedi disponibilità qui sotto).

## Disponibilità per piattaforma {#platform-availability}

| Capacità | App mobile (Android e iOS) | Estensione browser |
|---|---|---|
| Creazione / importazione di un wallet | ✅ | ✅ (a sé stante) |
| Più account da un'unica passphrase di recupero | ✅ (fino a 20) | ✅ *(da 0.2.2)* |
| Invio e ricezione di QOR (post-quantum) | ✅ | ✅ (dal popup, incl. QR di ricezione) |
| Pagamento / rivendicazione di un @handle | ✅ | ✅ |
| Staking (delega, rimozione delega, riscatto) | ✅ | ✅ *(da 0.2.2 — una propria schermata Stake, e può approvare una richiesta di staking inviata dalla Dashboard)* |
| Reti esterne (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + token) | ✅ | ✅ (invio dal popup) |
| Lingua dell'interfaccia (10 lingue) | ✅ (segue il telefono) | ✅ (segue il browser) |
| Portfolio, Q-Day Scanner, Recupero sociale, Legacy | ✅ | — |
| Connessioni dApp | ✅ (browser in-app) | ✅ (qualsiasi sito web) |
| Accesso account e richieste di pagamento | ✅ | — |
| Collegamento multi-dispositivo | ✅ | — |
| Abbinamento dashboard | ✅ | ✅ (connessione + trasferimenti proposti, incl. staking) |

:::note Lo staking sull'estensione richiede la versione 0.2.2 o successiva
Se la tua estensione è precedente alla 0.2.2, il pulsante di staking della Dashboard potrebbe segnalare che l'estensione va aggiornata anche se stai usando una build recente — la correzione che collega la richiesta di staking della Dashboard all'estensione è arrivata nella 0.2.2. Controlla [quale versione è live dove](/qorex/browser-extension#versions); se il tuo store non ha ancora pubblicato la 0.2.2, l'approvazione dello staking inizierà a funzionare non appena lo farà, senza alcuna azione da parte tua.
:::

## Perché QoreX è diverso

- **Quantum-safe per impostazione predefinita** — i trasferimenti di QOR sul lane Native portano sempre una firma ibrida ML-DSA-87 + secp256k1. Tutto ciò che è classico (chain esterne) è chiaramente etichettato, mai in modo silenzioso.
- **Veramente non-custodial** — le chiavi sono generate on-device e risiedono in un vault hardware (Secure Enclave su iOS, StrongBox su Android) o in un vault cifrato (estensione). Non lasciano mai il tuo dispositivo.
- **Nessuna raccolta dati** — nessun analytics, tracking o pubblicità in nessuna app QoreX. Un accesso account opzionale aggiunge comodità (vedi [Account e Dashboard](/qorex/account-and-dashboard)), ma il wallet non ne dipende mai.
- **Un saldo unificato** — il tuo QOR è un unico saldo su tutti i lane Native, EVM e SVM; QoreX lo mostra come una cifra unica.
- **Più percorsi di recupero** — una passphrase di recupero di 24 parole (sempre), recupero sociale opzionale con guardian e un timelock di 48 ore, eredità Legacy opzionale, e un comodo collegamento multi-dispositivo.

## Per iniziare

- Nuovo su QoreX? Inizia con [Per iniziare](/qorex/getting-started) per creare o ripristinare il tuo wallet.
- Poi impara a [Inviare e ricevere](/qorex/send-and-receive) QOR quantum-safe.
- Configura la tua rete di sicurezza in [Sicurezza e recupero](/qorex/security-and-recovery).
- Su desktop, installa l'[Estensione browser](/qorex/browser-extension).

:::note Download e disponibilità
- **Estensione browser** — live e pubblica: installala da [Chrome Web Store, Firefox Add-ons, o Mac App Store (Safari)](/qorex/browser-extension#install). Vedi [quale versione è live dove](/qorex/browser-extension#versions) — le funzionalità più recenti potrebbero essere ancora in fase di rilascio su alcuni browser.
- **App Android** — live in produzione su Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **App iOS** — live sull'**App Store**: https://apps.apple.com/us/app/qorex-wallet/id6791256626.

La revisione degli store segue una propria tempistica, quindi la release più recente a volte raggiunge uno store prima di un altro — vedi [quale versione è live dove](#platform-availability) qui sotto per il quadro esatto attuale. Installa sempre da una scheda ufficiale dello store.
:::

:::note Quale versione è live dove
Le approvazioni degli store arrivano in momenti diversi, quindi la versione qui sotto può differire brevemente per piattaforma:

| Piattaforma | Versione live |
|---|---|
| Android | 1.0.4 |
| iOS | 1.0.2 (un aggiornamento è in revisione) |
| Firefox | 0.2.2 |
| Chrome | 0.1.5 (0.1.9 è in revisione; una successiva submission 0.2.2 seguirà una volta superata quella revisione) |
| Safari (macOS) | 1.3, con estensione 0.2.2 |

Questa pagina descrive l'attuale set di funzionalità di QoreX — uno store che serve ancora una build più vecchia si aggiornerà automaticamente senza alcuna azione da parte tua.
:::
