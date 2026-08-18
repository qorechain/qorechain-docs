---
slug: /qorex/overview
title: Portofelul QoreX
sidebar_label: Prezentare generală
sidebar_position: 1
---

# Portofelul QoreX

**QoreX** este portofelul oficial **non-custodial** pentru **QoreChain**, Layer 1 rezistent cuantic (mainnet `qorechain-vladi`). Cheile tale private sunt generate și păstrate **doar pe dispozitivul tău** — QoreChain Association nu are niciodată acces la fondurile tale, iar aplicațiile nu colectează **niciun fel de date**. Fiecare transfer de QOR pe banda Native poartă o **semnătură post-cuantică hibridă** (ML-DSA-87, NIST FIPS-204, împerecheată cu secp256k1), astfel încât fondurile tale sunt protejate atât împotriva atacatorilor clasici, cât și a celor cuantici.

QoreX are două componente care funcționează împreună:

- **Extensia de browser** — portofelul pentru desktop, **disponibil public pe Chrome, Firefox și Safari (macOS)**. Este un portofel de sine stătător (creezi/imporți, păstrezi și trimiți QOR) și totodată conectorul care permite oricărui site să descopere QoreX și transformă fiecare cerere într-o aprobare explicită. Vezi [Extensia de browser](/qorex/browser-extension).
- **Aplicația mobilă** (Android și iOS) — portofelul complet: creare/restaurare, trimitere și primire de QOR rezistent cuantic, rețele externe, staking, portofoliu, recuperare și un browser de dApp-uri integrat. **Pe Google Play** pentru Android; pe TestFlight pentru iOS (vezi disponibilitatea mai jos).

## Disponibilitate pe platforme

| Funcționalitate | Aplicația mobilă (Android și iOS) | Extensia de browser |
|---|---|---|
| Creare / import de portofel | ✅ | ✅ (de sine stătător) |
| Trimitere și primire de QOR (post-cuantic) | ✅ | ✅ (din popup) |
| Rețele externe (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + tokenuri) | ✅ | ✅ (trimitere din popup) |
| Staking, Portofoliu, Q-Day Scanner, Recuperare, Legacy | ✅ | — |
| Conexiuni cu dApp-uri | ✅ (browser integrat) | ✅ (orice site) |
| Cont (@handle, cereri de plată) | ✅ | — |
| Asociere pe mai multe dispozitive | ✅ | — |
| Împerechere cu Dashboard | ✅ | ✅ (conectare + transferuri propuse, v0.1.5) |

## De ce este QoreX diferit

- **Rezistent cuantic implicit** — transferurile de QOR pe banda Native poartă întotdeauna o semnătură hibridă ML-DSA-87 + secp256k1. Orice element clasic (lanțuri externe) este marcat clar, niciodată în tăcere.
- **Cu adevărat non-custodial** — cheile sunt generate pe dispozitiv și stau într-un seif susținut hardware (Secure Enclave pe iOS, StrongBox pe Android) sau într-un seif criptat (extensia). Ele nu părăsesc niciodată dispozitivul tău.
- **Fără colectare de date** — nicio analiză, urmărire sau reclamă în vreo aplicație QoreX. Autentificarea opțională într-un cont aduce facilități suplimentare (vezi [Cont și Dashboard](/qorex/account-and-dashboard)), dar portofelul nu depinde niciodată de ea.
- **Un singur sold unificat** — QOR-ul tău este un singur sold pe benzile Native, EVM și SVM; QoreX îl afișează ca o cifră unică.
- **Mai multe căi de recuperare** — o frază de recuperare de 24 de cuvinte (întotdeauna), recuperare socială opțională cu garanți și un blocaj temporal de 48 de ore, moștenire Legacy opțională și asocierea comodă a mai multor dispozitive.

## Primii pași

- Ești nou pe QoreX? Începe cu [Primii pași](/qorex/getting-started) pentru a-ți crea sau restaura portofelul.
- Apoi învață să [trimiți și să primești](/qorex/send-and-receive) QOR rezistent cuantic.
- Configurează-ți plasa de siguranță în [Securitate și recuperare](/qorex/security-and-recovery).
- Pe desktop, instalează [Extensia de browser](/qorex/browser-extension).

:::note Descărcare și disponibilitate
- **Extensia de browser** — disponibilă public: instaleaz-o din [Chrome Web Store, Firefox Add-ons sau Mac App Store (Safari)](/qorex/browser-extension#install).
- **Aplicația Android** — disponibilă pe Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **Aplicația iOS** — disponibilă pentru testare prin **TestFlight**: https://testflight.apple.com/join/Xa9D7vgR — lansarea în App Store este încă în curs de evaluare.

Instalează QoreX doar dintr-un magazin oficial.
:::
