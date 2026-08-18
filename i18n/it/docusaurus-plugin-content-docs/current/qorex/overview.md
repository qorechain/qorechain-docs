---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Panoramica
sidebar_position: 1
---

# QoreX Wallet

**QoreX** è il wallet **non custodiale** ufficiale di **QoreChain**, il Layer 1 a prova di quantum (mainnet `qorechain-vladi`). Le tue chiavi private vengono generate e conservate **solo sul tuo dispositivo**: QoreChain Association non ha mai accesso ai tuoi fondi e le app non raccolgono **alcun dato**. Ogni trasferimento di QOR sulla corsia Native porta con sé una **firma post-quantistica ibrida** (ML-DSA-87, NIST FIPS-204, abbinata a secp256k1), così i tuoi fondi sono protetti sia dagli attaccanti classici sia da quelli quantistici.

QoreX si compone di due parti che lavorano insieme:

- **Estensione per browser** — il wallet desktop, **attivo e pubblico su Chrome, Firefox e Safari (macOS)**. È un wallet autonomo (crea/importa, custodisci e invia QOR) ed è il connettore che permette a qualsiasi sito web di rilevare QoreX e di trasformare ogni richiesta in un'approvazione esplicita. Vedi [Estensione per browser](/qorex/browser-extension).
- **App mobile** (Android e iOS) — il wallet completo: creazione/ripristino, invio e ricezione di QOR a prova di quantum, reti esterne, staking, portafoglio, recupero e un browser dApp integrato. Attualmente in test pubblico (vedi la disponibilità qui sotto).

## Disponibilità per piattaforma

| Funzionalità | App mobile (Android e iOS) | Estensione per browser |
|---|---|---|
| Creazione / importazione di un wallet | ✅ | ✅ (autonoma) |
| Invio e ricezione di QOR (post-quantistico) | ✅ | ✅ (dal popup) |
| Reti esterne (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + token) | ✅ | ✅ (invio dal popup) |
| Staking, Portafoglio, Q-Day Scanner, Recupero, Legacy | ✅ | — |
| Connessioni alle dApp | ✅ (browser integrato) | ✅ (qualsiasi sito web) |
| Account (@handle, richieste di pagamento) | ✅ | — |
| Collegamento multi-dispositivo | ✅ | — |
| Abbinamento con la dashboard | ✅ | ✅ (connessione + trasferimenti proposti, v0.1.5) |

## Perché QoreX è diverso

- **A prova di quantum per impostazione predefinita** — i trasferimenti di QOR sulla corsia Native portano sempre una firma ibrida ML-DSA-87 + secp256k1. Tutto ciò che è classico (catene esterne) è chiaramente indicato, mai in modo silenzioso.
- **Davvero non custodiale** — le chiavi vengono generate sul dispositivo e risiedono in un vault protetto dall'hardware (Secure Enclave su iOS, StrongBox su Android) o in un vault cifrato (estensione). Non lasciano mai il tuo dispositivo.
- **Nessuna raccolta di dati** — nessuna analisi, nessun tracciamento e nessuna pubblicità in alcuna app QoreX. L'accesso facoltativo a un account aggiunge alcune comodità (vedi [Account e dashboard](/qorex/account-and-dashboard)), ma il wallet non ne dipende mai.
- **Un unico saldo unificato** — i tuoi QOR sono un solo saldo sulle corsie Native, EVM e SVM; QoreX lo mostra come una cifra unica.
- **Più percorsi di recupero** — una frase di recupero di 24 parole (sempre), il recupero sociale facoltativo con guardiani e un timelock di 48 ore, l'eredità Legacy facoltativa e il comodo collegamento multi-dispositivo.

## Per iniziare

- Sei nuovo su QoreX? Comincia da [Primi passi](/qorex/getting-started) per creare o ripristinare il tuo wallet.
- Poi impara a [inviare e ricevere](/qorex/send-and-receive) QOR a prova di quantum.
- Prepara la tua rete di sicurezza in [Sicurezza e recupero](/qorex/security-and-recovery).
- Su desktop, installa l'[estensione per browser](/qorex/browser-extension).

:::note Download e disponibilità
- **Estensione per browser** — attiva e pubblica: installala da [Chrome Web Store, Firefox Add-ons o dal Mac App Store (Safari)](/qorex/browser-extension#install).
- **App Android** — disponibile per il **test pubblico** su Google Play.
- **App iOS** — disponibile per i test tramite **TestFlight**, se desideri provarla.

Trovi i link ufficiali e aggiornati su [qorechain.io](https://qorechain.io); installa QoreX solo da un listing ufficiale.
:::
