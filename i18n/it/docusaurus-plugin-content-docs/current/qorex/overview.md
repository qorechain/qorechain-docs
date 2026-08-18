---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Panoramica
sidebar_position: 1
---

# QoreX Wallet

**QoreX** è il wallet ufficiale **non custodial** di **QoreChain**, la Layer 1 a prova di quantum (mainnet `qorechain-vladi`). Le tue chiavi private vengono generate e conservate **solo sul tuo dispositivo**: QoreChain Association non ha mai accesso ai tuoi fondi e le app non raccolgono **alcun dato**. Ogni trasferimento di QOR sulla corsia Native porta con sé una **firma ibrida post-quantum** (ML-DSA-87, NIST FIPS-204, abbinata a secp256k1), così i tuoi fondi sono protetti sia dagli attaccanti classici sia da quelli quantistici.

QoreX è composto da due parti che lavorano insieme:

- **Estensione browser** — il wallet per desktop, **disponibile e pubblico su Chrome, Firefox e Safari (macOS)**. È un wallet autonomo (creazione/importazione, custodia e invio di QOR) e allo stesso tempo il connettore che permette a qualsiasi sito web di individuare QoreX e trasformare ogni richiesta in un'approvazione esplicita. Vedi [Estensione browser](/qorex/browser-extension).
- **App mobile** (Android e iOS) — il wallet completo: creazione/ripristino, invio e ricezione di QOR a prova di quantum, reti esterne, staking, portafoglio, recupero e un browser dApp integrato nell'app. **Su Google Play** per Android; su TestFlight per iOS (vedi la disponibilità qui sotto).

## Disponibilità sulle piattaforme

| Funzionalità | App mobile (Android e iOS) | Estensione browser |
|---|---|---|
| Creare / importare un wallet | ✅ | ✅ (in autonomia) |
| Inviare e ricevere QOR (post-quantum) | ✅ | ✅ (dal popup) |
| Reti esterne (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + token) | ✅ | ✅ (invio dal popup) |
| Staking, Portfolio, Q-Day Scanner, Recovery, Legacy | ✅ | — |
| Connessioni dApp | ✅ (browser integrato) | ✅ (qualsiasi sito web) |
| Account (@handle, richieste di pagamento) | ✅ | — |
| Collegamento di più dispositivi | ✅ | — |
| Abbinamento con la Dashboard | ✅ | ✅ (connessione + trasferimenti proposti, v0.1.5) |

## Perché QoreX è diverso

- **A prova di quantum per impostazione predefinita** — i trasferimenti di QOR sulla corsia Native portano sempre una firma ibrida ML-DSA-87 + secp256k1. Tutto ciò che è classico (catene esterne) è indicato chiaramente, mai in modo silenzioso.
- **Davvero non custodial** — le chiavi vengono generate sul dispositivo e risiedono in un vault protetto dall'hardware (Secure Enclave su iOS, StrongBox su Android) o in un vault cifrato (estensione). Non lasciano mai il tuo dispositivo.
- **Nessuna raccolta di dati** — nessuna analitica, nessun tracciamento e nessuna pubblicità in alcuna app QoreX. L'accesso facoltativo a un account aggiunge alcune comodità (vedi [Account e Dashboard](/qorex/account-and-dashboard)), ma il wallet non ne dipende mai.
- **Un unico saldo unificato** — i tuoi QOR sono un solo saldo tra le corsie Native, EVM e SVM; QoreX lo mostra come una cifra unica.
- **Più percorsi di recupero** — una frase di recupero di 24 parole (sempre), il recupero sociale facoltativo con guardiani e un timelock di 48 ore, l'eredità Legacy facoltativa e il comodo collegamento di più dispositivi.

## Per iniziare

- Sei nuovo su QoreX? Parti da [Per iniziare](/qorex/getting-started) per creare o ripristinare il tuo wallet.
- Poi impara a [Inviare e ricevere](/qorex/send-and-receive) QOR a prova di quantum.
- Prepara la tua rete di sicurezza in [Sicurezza e recupero](/qorex/security-and-recovery).
- Su desktop, installa l'[Estensione browser](/qorex/browser-extension).

:::note Download e disponibilità
- **Estensione browser** — disponibile e pubblica: installala dal [Chrome Web Store, da Firefox Add-ons o dal Mac App Store (Safari)](/qorex/browser-extension#install).
- **App Android** — disponibile su Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **App iOS** — disponibile per il test tramite **TestFlight** se vuoi provarla; la pubblicazione su App Store è ancora in revisione. Trovi il link di invito aggiornato su [qorechain.io](https://qorechain.io).

Installa QoreX solo da una scheda ufficiale degli store.
:::
