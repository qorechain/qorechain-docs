---
slug: /qorex/overview
title: Portofelul QoreX
sidebar_label: Prezentare generală
sidebar_position: 1
---

# Portofelul QoreX

**QoreX** este portofelul oficial **non-custodial** pentru **QoreChain**, blockchain-ul Layer 1 rezistent cuantic (mainnet `qorechain-vladi`). Cheile tale private sunt generate și stocate **doar pe dispozitivul tău** — QoreChain Association nu are niciodată acces la fondurile tale, iar aplicațiile colectează **zero date**. Fiecare transfer de QOR pe banda Native poartă o **semnătură hibridă post-cuantică** (ML-DSA-87, NIST FIPS-204, împreună cu secp256k1), astfel încât fondurile tale sunt protejate atât împotriva atacatorilor clasici, cât și a celor cuantici.

QoreX vine în două părți care lucrează împreună:

- **Aplicație mobilă** (iOS și Android) — portofelul complet: creare/restaurare, trimitere și primire de QOR rezistent cuantic, rețele externe, staking, portofoliu, recuperare și un browser de dApp-uri integrat în aplicație.
- **Extensie de browser** (Chrome și Firefox; Safari în curând) — conectorul de dApp-uri pentru desktop: permite site-urilor web să îți descopere portofelul și transformă fiecare cerere într-o aprobare explicită.

## Disponibilitate pe platforme

| Capabilitate | Aplicație iOS/Android | Extensie Chrome/Firefox |
|---|---|---|
| Creare / restaurare / conectare portofel | ✅ | — (se împerechează cu aplicația) |
| Trimitere și primire QOR (post-cuantic) | ✅ | prin semnare dApp |
| Rețele externe (ETH / BNB / POL / ARB / SOL + tokenuri) | ✅ | ✅ (trimitere din popup) |
| Staking, Portofoliu, Q-Day Scanner, Recuperare, Legacy | ✅ | — |
| Conexiuni dApp | ✅ (browser integrat) | ✅ (orice site web) |
| Cont (@handle, cereri de plată, legătură cu Dashboard) | ✅ | — |

## De ce QoreX este diferit

- **Rezistent cuantic în mod implicit** — transferurile de QOR pe banda Native poartă întotdeauna o semnătură hibridă ML-DSA-87 + secp256k1. Orice element clasic (blockchain-uri externe) este clar etichetat, niciodată tăcut.
- **Cu adevărat non-custodial** — cheile sunt generate pe dispozitiv și stau într-un seif susținut hardware (Secure Enclave pe iOS, StrongBox pe Android) sau într-un seif criptat (extensia). Ele nu îți părăsesc niciodată dispozitivul.
- **Fără colectare de date** — nicio analiză, urmărire sau reclamă în vreo aplicație QoreX. O autentificare opțională în cont adaugă facilități (vezi [Cont și Dashboard](/qorex/account-and-dashboard)), dar portofelul nu depinde niciodată de ea.
- **Un singur sold unificat** — QOR-ul tău este un singur sold pe benzile Native, EVM și SVM; QoreX îl afișează ca o singură cifră.
- **Multiple căi de recuperare** — o frază de recuperare din 24 de cuvinte (întotdeauna), recuperare socială opțională cu garanți și un timelock de 48 de ore, moștenire Legacy opțională și conectarea comodă a mai multor dispozitive.

## Cum începi

- Ești nou pe QoreX? Începe cu [Primii pași](/qorex/getting-started) pentru a-ți crea sau restaura portofelul.
- Apoi învață să [Trimiți și să primești](/qorex/send-and-receive) QOR rezistent cuantic.
- Configurează-ți plasa de siguranță în [Securitate și recuperare](/qorex/security-and-recovery).
- Pe desktop, instalează [Extensia de browser](/qorex/browser-extension).

:::note Descărcare
QoreX pentru iOS și Android este publicat pe App Store și Google Play, iar extensia de browser pe Chrome Web Store și Firefox Add-ons. Găsești linkurile de descărcare actuale pe [qorechain.io](https://qorechain.io). Instalează QoreX doar dintr-o listare oficială de magazin.
:::
