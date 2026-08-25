---
slug: /qorex/overview
title: Portofelul QoreX
sidebar_label: Prezentare generală
sidebar_position: 1
---

# Portofelul QoreX

**QoreX** este portofelul oficial **non-custodial** pentru **QoreChain**, Layer 1 rezistent cuantic (mainnet `qorechain-vladi`). Cheile tale private sunt generate și păstrate **doar pe dispozitivul tău** — QoreChain Association nu are niciodată acces la fondurile tale, iar aplicațiile nu colectează **niciun fel de date**. Fiecare transfer de QOR pe banda Native poartă o **semnătură post-cuantică hibridă** (ML-DSA-87, NIST FIPS-204, împerecheată cu secp256k1), astfel încât fondurile tale sunt protejate atât împotriva atacatorilor clasici, cât și a celor cuantici.

QoreX are două componente care funcționează împreună:

- **Extensia de browser** — portofelul pentru desktop, **disponibilă public pe Chrome, Firefox și Safari (macOS)**. Este un portofel de sine stătător (creezi/imporți, păstrezi și trimiți QOR) și totodată conectorul care permite oricărui site să descopere QoreX și transformă fiecare cerere într-o aprobare explicită. Vezi [Extensia de browser](/qorex/browser-extension).
- **Aplicația mobilă** (Android și iOS) — portofelul complet: creare/restaurare, trimitere și primire de QOR rezistent cuantic, rețele externe, staking, portofoliu, recuperare și un browser de dApp-uri integrat. **Pe Google Play** pentru Android, și **pe App Store** pentru iOS (vezi disponibilitatea mai jos).

## Disponibilitate pe platforme {#platform-availability}

| Funcționalitate | Aplicația mobilă (Android și iOS) | Extensia de browser |
|---|---|---|
| Creare / import de portofel | ✅ | ✅ (de sine stătător) |
| Mai multe conturi dintr-o singură frază de recuperare | ✅ (până la 20) | ✅ *(din 0.2.2)* |
| Trimitere și primire de QOR (post-cuantic) | ✅ | ✅ (din popup, incl. Receive QR) |
| Plată / revendicare @handle | ✅ | ✅ |
| Staking (delegare, retragere din delegare, revendicare) | ✅ | ✅ *(din 0.2.2 — propriul ecran de Stake, și poate aproba o cerere de staking trimisă de Dashboard)* |
| Rețele externe (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokenuri) | ✅ | ✅ (trimitere din popup) |
| Limba interfeței (10 limbi) | ✅ (urmează limba telefonului) | ✅ (urmează limba browserului) |
| Portofoliu, Q-Day Scanner, Recuperare socială, Legacy | ✅ | — |
| Conexiuni cu dApp-uri | ✅ (browser integrat) | ✅ (orice site) |
| Autentificare în cont și cereri de plată | ✅ | — |
| Asociere pe mai multe dispozitive | ✅ | — |
| Împerechere cu Dashboard | ✅ | ✅ (conectare + transferuri propuse, incl. staking) |

:::note Staking-ul din extensie necesită 0.2.2 sau o versiune mai nouă
Dacă extensia ta este mai veche de 0.2.2, butonul de staking din Dashboard poate raporta că extensia trebuie actualizată chiar dacă rulezi o versiune recentă — remedierea care conectează cererea de staking din Dashboard la extensie a apărut în 0.2.2. Verifică [ce versiune este disponibilă unde](/qorex/browser-extension#versions); dacă magazinul tău nu a publicat încă 0.2.2, aprobarea staking-ului va începe să funcționeze de îndată ce o face, fără nicio acțiune din partea ta.
:::

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
- **Extensia de browser** — disponibilă public: instaleaz-o din [Chrome Web Store, Firefox Add-ons sau Mac App Store (Safari)](/qorex/browser-extension#install). Vezi [ce versiune este disponibilă unde](/qorex/browser-extension#versions) — funcționalitățile mai noi pot fi încă în curs de lansare pe unele browsere.
- **Aplicația Android** — disponibilă în producție pe Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **Aplicația iOS** — disponibilă pe **App Store**: https://apps.apple.com/us/app/qorex-wallet/id6791256626.

Revizuirea din magazine se desfășoară după propriul program, astfel încât cea mai nouă versiune ajunge uneori într-un magazin înaintea altuia — vezi [ce versiune este disponibilă unde](#platform-availability) mai jos pentru imaginea exactă, curentă. Instalează întotdeauna dintr-o listare oficială de magazin.
:::

:::note Ce versiune este disponibilă unde
Aprobările din magazine ajung la momente diferite, astfel încât versiunea de mai jos poate diferi ușor de la o platformă la alta:

| Platformă | Versiune activă |
|---|---|
| Android | 1.0.4 |
| iOS | 1.0.2 (o actualizare este în evaluare) |
| Firefox | 0.2.2 |
| Chrome | 0.1.5 (0.1.9 este în evaluare; o trimitere ulterioară 0.2.2 urmează după ce acea evaluare se încheie) |
| Safari (macOS) | 1.3, cu extensia 0.2.2 |

Această pagină descrie setul curent de funcționalități al QoreX — un magazin care încă servește o versiune mai veche se va actualiza automat, fără nicio acțiune din partea ta.
:::
