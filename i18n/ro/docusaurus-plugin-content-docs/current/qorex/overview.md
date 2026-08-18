---
slug: /qorex/overview
title: Portofelul QoreX
sidebar_label: Prezentare generală
sidebar_position: 1
---

# Portofelul QoreX

**QoreX** este portofelul **non-custodial** oficial pentru **QoreChain**, Layer 1-ul rezistent la calcul cuantic (mainnet `qorechain-vladi`). Cheile tale private sunt generate și stocate **doar pe dispozitivul tău** — QoreChain Association nu are niciodată acces la fondurile tale, iar aplicațiile nu colectează **niciun fel de date**. Fiecare transfer de QOR pe canalul Native poartă o **semnătură hibridă post-cuantică** (ML-DSA-87, NIST FIPS-204, împerecheată cu secp256k1), astfel încât fondurile tale sunt protejate atât împotriva atacatorilor clasici, cât și a celor cuantici.

QoreX este alcătuit din două componente care lucrează împreună:

- **Extensia de browser** — portofelul pentru desktop, **live și public pe Chrome, Firefox și Safari (macOS)**. Este un portofel de sine stătător (creare/import, păstrare și trimitere de QOR) și conectorul care permite oricărui site web să descopere QoreX și să transforme fiecare cerere într-o aprobare explicită. Vezi [Extensia de browser](/qorex/browser-extension).
- **Aplicația mobilă** (Android și iOS) — portofelul complet: creare/restaurare, trimitere și primire de QOR rezistent la calcul cuantic, rețele externe, staking, portofoliu, recuperare și un browser de dApp-uri integrat. În prezent în testare publică (vezi disponibilitatea mai jos).

## Disponibilitate pe platforme

| Capabilitate | Aplicația mobilă (Android și iOS) | Extensia de browser |
|---|---|---|
| Creare / import portofel | ✅ | ✅ (de sine stătător) |
| Trimitere și primire QOR (post-cuantic) | ✅ | ✅ (din popup) |
| Rețele externe (ETH / BNB / POL / ARB / SOL + tokenuri) | ✅ | prin semnare dApp |
| Staking, Portofoliu, Q-Day Scanner, Recuperare, Legacy | ✅ | — |
| Conexiuni dApp | ✅ (browser integrat) | ✅ (orice site web) |
| Cont (@handle, cereri de plată) | ✅ | — |
| Asociere între mai multe dispozitive | ✅ | — |
| Împerechere cu dashboard-ul | ✅ | ✅ (conectare + transferuri propuse, v0.1.5) |

## De ce este QoreX diferit

- **Rezistent la calcul cuantic în mod implicit** — transferurile de QOR pe canalul Native poartă întotdeauna o semnătură hibridă ML-DSA-87 + secp256k1. Orice element clasic (lanțuri externe) este etichetat clar, niciodată în mod tăcut.
- **Cu adevărat non-custodial** — cheile sunt generate pe dispozitiv și trăiesc într-un seif securizat hardware (Secure Enclave pe iOS, StrongBox pe Android) sau într-un seif criptat (extensia). Ele nu părăsesc niciodată dispozitivul tău.
- **Fără colectare de date** — nicio analiză, urmărire sau reclamă în vreo aplicație QoreX. O autentificare opțională într-un cont adaugă facilități (vezi [Cont și Dashboard](/qorex/account-and-dashboard)), dar portofelul nu depinde niciodată de aceasta.
- **Un singur sold unificat** — QOR-ul tău este un singur sold peste canalele Native, EVM și SVM; QoreX îl afișează ca o singură valoare.
- **Multiple căi de recuperare** — o frază de recuperare de 24 de cuvinte (întotdeauna), recuperare socială opțională cu gardieni și un timelock de 48 de ore, moștenire Legacy opțională și asociere convenabilă între mai multe dispozitive.

## Începe

- Ești nou în QoreX? Începe cu [Primii pași](/qorex/getting-started) pentru a-ți crea sau restaura portofelul.
- Apoi învață să [Trimiți și să primești](/qorex/send-and-receive) QOR rezistent la calcul cuantic.
- Configurează-ți plasa de siguranță în [Securitate și Recuperare](/qorex/security-and-recovery).
- Pe desktop, instalează [Extensia de browser](/qorex/browser-extension).

:::note Descărcare și disponibilitate
- **Extensia de browser** — live și publică: instaleaz-o din [Chrome Web Store, Firefox Add-ons sau Mac App Store (Safari)](/qorex/browser-extension#install).
- **Aplicația Android** — disponibilă pentru **testare publică** pe Google Play.
- **Aplicația iOS** — disponibilă pentru testare prin **TestFlight** dacă vrei să o încerci.

Găsește linkurile curente și oficiale pe [qorechain.io](https://qorechain.io) și instalează QoreX doar dintr-o listare oficială.
:::
