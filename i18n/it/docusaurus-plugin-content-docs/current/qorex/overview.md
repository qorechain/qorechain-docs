---
slug: /qorex/overview
title: Wallet QoreX
sidebar_label: Panoramica
sidebar_position: 1
---

# Wallet QoreX

**QoreX** è il wallet ufficiale **non-custodial** per **QoreChain**, la Layer 1 quantum-safe (mainnet `qorechain-vladi`). Le tue chiavi private vengono generate e conservate **solo sul tuo dispositivo** — QoreChain Association non ha mai accesso ai tuoi fondi e le app non raccolgono **alcun dato**. Ogni trasferimento di QOR sulla lane Native reca una **firma post-quantum ibrida** (ML-DSA-87, NIST FIPS-204, abbinata a secp256k1), così i tuoi fondi sono protetti sia dagli attaccanti classici sia da quelli quantistici.

QoreX si compone di due parti che lavorano insieme:

- **App mobile** (iOS e Android) — il wallet completo: crea/ripristina, invia e ricevi QOR quantum-safe, reti esterne, staking, portafoglio, recupero e un browser dApp integrato nell'app.
- **Estensione per browser** (Chrome e Firefox; Safari in arrivo) — il connettore dApp per desktop: consente ai siti web di rilevare il tuo wallet e trasforma ogni richiesta in un'approvazione esplicita.

## Disponibilità sulle piattaforme

| Funzionalità | App iOS/Android | Estensione Chrome/Firefox |
|---|---|---|
| Crea / ripristina / collega un wallet | ✅ | — (si abbina all'app) |
| Invia e ricevi QOR (post-quantum) | ✅ | tramite firma dApp |
| Reti esterne (ETH / BNB / POL / ARB / SOL + token) | ✅ | ✅ (invio dal popup) |
| Staking, Portafoglio, Q-Day Scanner, Recupero, Legacy | ✅ | — |
| Connessioni dApp | ✅ (browser integrato) | ✅ (qualsiasi sito web) |
| Account (@handle, richieste di pagamento, link Dashboard) | ✅ | — |

## Perché QoreX è diverso

- **Quantum-safe per impostazione predefinita** — i trasferimenti di QOR sulla lane Native recano sempre una firma ibrida ML-DSA-87 + secp256k1. Tutto ciò che è classico (catene esterne) è chiaramente etichettato, mai in modo silenzioso.
- **Realmente non-custodial** — le chiavi vengono generate sul dispositivo e risiedono in un vault protetto da hardware (Secure Enclave su iOS, StrongBox su Android) o in un vault cifrato (estensione). Non lasciano mai il tuo dispositivo.
- **Nessuna raccolta di dati** — nessun tracciamento analitico, tracking o pubblicità in alcuna app QoreX. Un accesso opzionale all'account aggiunge alcune comodità (vedi [Account e Dashboard](/qorex/account-and-dashboard)) ma il wallet non dipende mai da esso.
- **Un unico saldo unificato** — i tuoi QOR costituiscono un unico saldo tra le lane Native, EVM e SVM; QoreX lo mostra come una cifra singola.
- **Molteplici percorsi di recupero** — una frase di recupero di 24-word (sempre), il recupero sociale opzionale con guardiani e un timelock di 48-hour, l'eredità Legacy opzionale e un comodo collegamento multi-dispositivo.

## Come iniziare

- Sei nuovo su QoreX? Inizia con [Primi passi](/qorex/getting-started) per creare o ripristinare il tuo wallet.
- Poi impara a [Inviare e ricevere](/qorex/send-and-receive) QOR quantum-safe.
- Configura la tua rete di sicurezza in [Sicurezza e recupero](/qorex/security-and-recovery).
- Su desktop, installa l'[Estensione per browser](/qorex/browser-extension).

:::note Download
QoreX per iOS e Android è pubblicato su App Store e Google Play, e l'estensione per browser su Chrome Web Store e Firefox Add-ons. Trova i link di download attuali su [qorechain.io](https://qorechain.io). Installa QoreX solo da una scheda ufficiale dello store.
:::
