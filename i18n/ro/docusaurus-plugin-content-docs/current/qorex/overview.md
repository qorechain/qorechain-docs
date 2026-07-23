---
slug: /qorex/overview
title: Portofelul QoreX
sidebar_label: Prezentare generală
sidebar_position: 1
---

# Portofelul QoreX

**QoreX** este portofelul oficial **non-custodial** pentru **QoreChain**, Layer 1 rezistent cuantic (mainnet `qorechain-vladi`). Cheile tale private sunt generate și stocate **doar pe dispozitivul tău** — QoreChain Association nu are niciodată acces la fondurile tale, iar aplicațiile colectează **zero date**. Fiecare transfer de QOR pe banda Native poartă o **semnătură hibridă post-cuantică** (ML-DSA-87, NIST FIPS-204, împerecheată cu secp256k1), astfel încât fondurile tale sunt protejate atât împotriva atacatorilor clasici, cât și a celor cuantici.

QoreX vine în două componente care lucrează împreună:

- **Aplicația mobilă** (iOS și Android) — portofelul complet: creare/restaurare, trimitere și primire de QOR rezistent cuantic, rețele externe, staking, portofoliu, recuperare și un browser dApp integrat în aplicație.
- **Extensia de browser** (Chrome și Firefox, cu Safari din același cod sursă) — conectorul dApp pentru desktop: permite site-urilor web să îți descopere portofelul și transformă fiecare cerere într-o aprobare explicită.

## Disponibilitate pe platforme

| Capabilitate | Aplicația iOS/Android | Extensia Chrome/Firefox |
|---|---|---|
| Creare / restaurare / conectare portofel | ✅ | — (se împerechează cu aplicația) |
| Trimitere și primire de QOR (post-cuantic) | ✅ | prin semnare dApp |
| Rețele externe (ETH / BNB / POL / ARB / SOL + tokenuri) | ✅ | ✅ (trimitere din popup) |
| Staking, Portofoliu, Q-Day Scanner, Recuperare, Legacy | ✅ | — |
| Conexiuni dApp | ✅ (browser în aplicație) | ✅ (orice site web) |
| Cont (@handle, cereri de plată, legătură cu Dashboard) | ✅ | — |

## De ce este QoreX diferit

- **Rezistent cuantic în mod implicit** — transferurile de QOR pe banda Native poartă întotdeauna o semnătură hibridă ML-DSA-87 + secp256k1. Orice element clasic (lanțuri externe) este etichetat clar, niciodată în tăcere.
- **Cu adevărat non-custodial** — cheile sunt generate pe dispozitiv și stau într-un seif susținut hardware (Secure Enclave pe iOS, StrongBox pe Android) sau într-un seif criptat (extensia). Nu îți părăsesc niciodată dispozitivul.
- **Fără colectare de date** — nicio analiză, urmărire sau reclame în vreo aplicație QoreX. O autentificare opțională în cont adaugă facilități (vezi [Cont și Dashboard](/qorex/account-and-dashboard)), dar portofelul nu depinde niciodată de ea.
- **Un singur sold unificat** — QOR-ul tău este un singur sold pe benzile Native, EVM și SVM; QoreX îl afișează ca o singură cifră.
- **Mai multe căi de recuperare** — o frază de recuperare de 24 de cuvinte (întotdeauna), recuperare socială opțională cu tutori și un timelock de 48 de ore, moștenire Legacy opțională și conectarea comodă a mai multor dispozitive.

## Începe

- Ești nou în QoreX? Începe cu [Primii pași](/qorex/getting-started) pentru a-ți crea sau restaura portofelul.
- Apoi învață să [Trimiți și primești](/qorex/send-and-receive) QOR rezistent cuantic.
- Configurează-ți plasa de siguranță în [Securitate și recuperare](/qorex/security-and-recovery).
- Pe desktop, instalează [Extensia de browser](/qorex/browser-extension).

:::note Descărcare și disponibilitate
QoreX **1.0** este în curs de lansare pe magazinele de aplicații — aplicațiile iOS și Android (App Store și Google Play) și extensia de browser (Chrome Web Store, Firefox Add-ons și o versiune Safari). Unele ținte pot fi încă în coada de verificare a unui magazin la un moment dat. Găsește întotdeauna linkurile oficiale, actuale de descărcare pe [qorechain.io](https://qorechain.io) și instalează QoreX doar dintr-un listing oficial de magazin.
:::
