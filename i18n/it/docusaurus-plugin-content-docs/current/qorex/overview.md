---
slug: /qorex/overview
title: Wallet QoreX
sidebar_label: Panoramica
sidebar_position: 1
---

# Wallet QoreX

**QoreX** è il wallet ufficiale **non-custodial** per **QoreChain**, la Layer 1 a sicurezza quantistica (mainnet `qorechain-vladi`). Le tue chiavi private vengono generate e conservate **solo sul tuo dispositivo** — QoreChain Association non ha mai accesso ai tuoi fondi e le app non raccolgono **alcun dato**. Ogni trasferimento di QOR sulla lane Native porta con sé una **firma post-quantistica ibrida** (ML-DSA-87, NIST FIPS-204, abbinata a secp256k1), così i tuoi fondi sono protetti sia dagli attaccanti classici sia da quelli quantistici.

QoreX è composto da due parti che lavorano insieme:

- **Estensione per browser** — il wallet desktop, **attivo e pubblico su Chrome, Firefox e Safari (macOS)**. È un wallet a sé stante (crea/importa, conserva e invia QOR) ed è il connettore che consente a qualsiasi sito web di rilevare QoreX e trasformare ogni richiesta in un'approvazione esplicita. Vedi [Estensione per browser](/qorex/browser-extension).
- **App mobile** (Android e iOS) — il wallet completo: crea/ripristina, invia e ricevi QOR a sicurezza quantistica, reti esterne, staking, portfolio, recupero e un browser dApp integrato nell'app. Attualmente in test pubblico (vedi la disponibilità qui sotto).

## Disponibilità sulle piattaforme

| Funzionalità | App mobile (Android e iOS) | Estensione per browser |
|---|---|---|
| Creare / importare un wallet | ✅ | ✅ (a sé stante) |
| Inviare e ricevere QOR (post-quantistico) | ✅ | ✅ (dal popup) |
| Reti esterne (ETH / BNB / POL / ARB / SOL + token) | ✅ | tramite firma dApp |
| Staking, Portfolio, Q-Day Scanner, Recupero, Legacy | ✅ | — |
| Connessioni dApp | ✅ (browser integrato) | ✅ (qualsiasi sito web) |
| Account (@handle, richieste di pagamento) | ✅ | — |
| Collegamento multi-dispositivo | ✅ | — |
| Abbinamento con la dashboard | ✅ | ✅ (connessione + trasferimenti proposti, v0.1.5) |

## Perché QoreX è diverso

- **Sicurezza quantistica per impostazione predefinita** — i trasferimenti di QOR sulla lane Native portano sempre una firma ibrida ML-DSA-87 + secp256k1. Tutto ciò che è classico (catene esterne) è chiaramente etichettato, mai silenzioso.
- **Davvero non-custodial** — le chiavi vengono generate sul dispositivo e risiedono in un vault protetto da hardware (Secure Enclave su iOS, StrongBox su Android) oppure in un vault cifrato (estensione). Non lasciano mai il tuo dispositivo.
- **Nessuna raccolta di dati** — nessun analytics, tracciamento o pubblicità in alcuna app QoreX. Un accesso opzionale all'account aggiunge alcune comodità (vedi [Account e Dashboard](/qorex/account-and-dashboard)), ma il wallet non ne dipende mai.
- **Un unico saldo unificato** — i tuoi QOR sono un unico saldo tra le lane Native, EVM e SVM; QoreX lo mostra come una cifra singola.
- **Molteplici percorsi di recupero** — una frase di recupero di 24 parole (sempre), recupero social opzionale con guardiani e un timelock di 48 ore, eredità Legacy opzionale e un comodo collegamento multi-dispositivo.

## Per iniziare

- Nuovo su QoreX? Inizia da [Per iniziare](/qorex/getting-started) per creare o ripristinare il tuo wallet.
- Poi impara a [Inviare e ricevere](/qorex/send-and-receive) QOR a sicurezza quantistica.
- Configura la tua rete di sicurezza in [Sicurezza e recupero](/qorex/security-and-recovery).
- Su desktop, installa l'[Estensione per browser](/qorex/browser-extension).

:::note Download e disponibilità
- **Estensione per browser** — attiva e pubblica: installala da [Chrome Web Store, Firefox Add-ons o Mac App Store (Safari)](/qorex/browser-extension#install).
- **App Android** — disponibile per il **test pubblico** su Google Play.
- **App iOS** — disponibile per il test tramite **TestFlight** se desideri provarla.

Trova i link ufficiali e aggiornati su [qorechain.io](https://qorechain.io) e installa QoreX solo da un elenco ufficiale.
:::
