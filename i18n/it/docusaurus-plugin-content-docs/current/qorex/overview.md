---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Panoramica
sidebar_position: 1
---

# QoreX Wallet

**QoreX** è il wallet ufficiale **non custodial** di **QoreChain**, la Layer 1 a prova di quantum (mainnet `qorechain-vladi`). Le tue chiavi private vengono generate e conservate **solo sul tuo dispositivo**: QoreChain Association non ha mai accesso ai tuoi fondi e le app non raccolgono **alcun dato**. Ogni trasferimento di QOR sulla corsia Native porta con sé una **firma ibrida post-quantum** (ML-DSA-87, NIST FIPS-204, abbinata a secp256k1), quindi i tuoi fondi sono protetti sia dagli attacchi classici sia da quelli quantistici.

QoreX si compone di due parti che funzionano insieme:

- **Estensione per browser** — il wallet desktop, **disponibile pubblicamente su Chrome, Firefox e Safari (macOS)**. È un wallet autonomo (creazione/importazione, custodia e invio di QOR) e allo stesso tempo il connettore che consente a qualsiasi sito web di rilevare QoreX e di trasformare ogni richiesta in un'approvazione esplicita. Vedi [Estensione per browser](/qorex/browser-extension).
- **App mobile** (Android e iOS) — il wallet completo: creazione/ripristino, invio e ricezione di QOR a prova di quantum, reti esterne, staking, portafoglio, recupero e un browser dApp integrato. **Su Google Play** per Android; su TestFlight per iOS (vedi la disponibilità qui sotto).

## Disponibilità sulle piattaforme

| Funzionalità | App mobile (Android e iOS) | Estensione per browser |
|---|---|---|
| Creazione / importazione di un wallet | ✅ | ✅ (autonoma) |
| Invio e ricezione di QOR (post-quantum) | ✅ | ✅ (dal popup) |
| Reti esterne (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + token) | ✅ | ✅ (invio dal popup) |
| Staking, Portafoglio, Q-Day Scanner, Recupero, Legacy | ✅ | — |
| Connessioni dApp | ✅ (browser integrato) | ✅ (qualsiasi sito web) |
| Account (@handle, richieste di pagamento) | ✅ | — |
| Collegamento di più dispositivi | ✅ | — |
| Abbinamento con la Dashboard | ✅ | ✅ (connessione + trasferimenti proposti, v0.1.5) |

## Perché QoreX è diverso

- **A prova di quantum per impostazione predefinita** — i trasferimenti di QOR sulla corsia Native portano sempre una firma ibrida ML-DSA-87 + secp256k1. Tutto ciò che è classico (catene esterne) è indicato con chiarezza, mai in modo silenzioso.
- **Realmente non custodial** — le chiavi vengono generate sul dispositivo e risiedono in un vault protetto dall'hardware (Secure Enclave su iOS, StrongBox su Android) o in un vault cifrato (estensione). Non lasciano mai il tuo dispositivo.
- **Nessuna raccolta di dati** — nessuna analisi, nessun tracciamento e nessuna pubblicità in alcuna app QoreX. L'accesso facoltativo a un account aggiunge alcune comodità (vedi [Account e Dashboard](/qorex/account-and-dashboard)), ma il wallet non ne dipende mai.
- **Un unico saldo unificato** — i tuoi QOR costituiscono un solo saldo attraverso le corsie Native, EVM e SVM; QoreX lo mostra come una cifra unica.
- **Più percorsi di recupero** — una frase di recupero di 24 parole (sempre), il recupero sociale facoltativo con guardiani e un timelock di 48 ore, l'eredità Legacy facoltativa e il comodo collegamento di più dispositivi.

## Per iniziare

- Sei nuovo di QoreX? Parti da [Iniziare](/qorex/getting-started) per creare o ripristinare il tuo wallet.
- Poi impara a [inviare e ricevere](/qorex/send-and-receive) QOR a prova di quantum.
- Configura la tua rete di sicurezza in [Sicurezza e recupero](/qorex/security-and-recovery).
- Su desktop, installa l'[Estensione per browser](/qorex/browser-extension).

:::note Download e disponibilità
- **Estensione per browser** — disponibile pubblicamente: installala da [Chrome Web Store, Firefox Add-ons o dal Mac App Store (Safari)](/qorex/browser-extension#install).
- **App Android** — disponibile su Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **App iOS** — disponibile per i test tramite **TestFlight**: https://testflight.apple.com/join/Xa9D7vgR — la pubblicazione su App Store è ancora in revisione.

Installa QoreX solo da una scheda ufficiale dello store.
:::
