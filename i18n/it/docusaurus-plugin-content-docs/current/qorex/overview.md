---
slug: /qorex/overview
title: Wallet QoreX
sidebar_label: Panoramica
sidebar_position: 1
---

# Wallet QoreX

**QoreX** è il wallet **non-custodial** ufficiale di **QoreChain**, la Layer 1 quantum-safe (mainnet `qorechain-vladi`). Le tue chiavi private vengono generate e conservate **solo sul tuo dispositivo** — QoreChain Association non ha mai accesso ai tuoi fondi e le app non raccolgono **alcun dato**. Ogni trasferimento di QOR sulla lane Native trasporta una **firma post-quantum ibrida** (ML-DSA-87, NIST FIPS-204, abbinata a secp256k1), così i tuoi fondi sono protetti contro gli attaccanti sia classici sia quantistici.

QoreX è composto da due parti che lavorano insieme:

- **App mobile** (iOS e Android) — il wallet completo: crea/ripristina, invia e ricevi QOR quantum-safe, reti esterne, staking, portfolio, recupero e un browser dApp integrato nell'app.
- **Estensione per browser** (Chrome e Firefox, con Safari dalla stessa codebase) — il connettore dApp per desktop: consente ai siti web di rilevare il tuo wallet e trasforma ogni richiesta in un'approvazione esplicita.

## Disponibilità sulle piattaforme

| Funzionalità | App iOS/Android | Estensione Chrome/Firefox |
|---|---|---|
| Crea / ripristina / collega un wallet | ✅ | — (si abbina all'app) |
| Invia e ricevi QOR (post-quantum) | ✅ | tramite firma dApp |
| Reti esterne (ETH / BNB / POL / ARB / SOL + token) | ✅ | ✅ (invio dal popup) |
| Staking, Portfolio, Q-Day Scanner, Recupero, Legacy | ✅ | — |
| Connessioni dApp | ✅ (browser integrato) | ✅ (qualsiasi sito web) |
| Account (@handle, richieste di pagamento, collegamento Dashboard) | ✅ | — |

## Perché QoreX è diverso

- **Quantum-safe per impostazione predefinita** — i trasferimenti di QOR sulla lane Native trasportano sempre una firma ibrida ML-DSA-87 + secp256k1. Tutto ciò che è classico (catene esterne) è chiaramente etichettato, mai in modo silenzioso.
- **Realmente non-custodial** — le chiavi vengono generate sul dispositivo e risiedono in un vault protetto da hardware (Secure Enclave su iOS, StrongBox su Android) o in un vault cifrato (estensione). Non lasciano mai il tuo dispositivo.
- **Nessuna raccolta di dati** — nessuna analitica, tracciamento o pubblicità in alcuna app QoreX. Un accesso opzionale all'account aggiunge comodità (vedi [Account e Dashboard](/qorex/account-and-dashboard)) ma il wallet non ne dipende mai.
- **Un unico saldo unificato** — i tuoi QOR sono un unico saldo tra le lane Native, EVM e SVM; QoreX lo mostra come una singola cifra.
- **Molteplici percorsi di recupero** — una frase di recupero di 24 parole (sempre), recupero sociale opzionale con guardiani e un timelock di 48 ore, eredità Legacy opzionale e comodo collegamento multi-dispositivo.

## Inizia subito

- Sei nuovo su QoreX? Parti da [Guida introduttiva](/qorex/getting-started) per creare o ripristinare il tuo wallet.
- Poi impara a [Inviare e ricevere](/qorex/send-and-receive) QOR quantum-safe.
- Configura la tua rete di sicurezza in [Sicurezza e recupero](/qorex/security-and-recovery).
- Su desktop, installa l'[Estensione per browser](/qorex/browser-extension).

:::note Download e disponibilità
QoreX **1.0** è in fase di distribuzione sugli app store — le app iOS e Android (App Store e Google Play) e l'estensione per browser (Chrome Web Store, Firefox Add-ons e una build per Safari). Alcuni target potrebbero essere ancora nella coda di revisione di uno store in un dato momento. Trova sempre i link di download ufficiali e aggiornati su [qorechain.io](https://qorechain.io) e installa QoreX solo da una scheda ufficiale di uno store.
:::
