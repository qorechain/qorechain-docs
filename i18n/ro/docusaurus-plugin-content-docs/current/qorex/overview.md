---
slug: /qorex/overview
title: Portofelul QoreX
sidebar_label: Prezentare generală
sidebar_position: 1
---

# Portofelul QoreX

**QoreX** este portofelul oficial **non-custodial** pentru **QoreChain**, Layer 1 rezistent cuantic (mainnet `qorechain-vladi`). Cheile tale private sunt generate și păstrate **doar pe dispozitivul tău** — QoreChain Association nu are niciodată acces la fondurile tale, iar aplicațiile nu conțin **nicio analiză, urmărire sau reclamă**. Fiecare transfer de QOR pe banda Native poartă o **semnătură post-cuantică hibridă** (ML-DSA-87, NIST FIPS-204, împerecheată cu secp256k1), astfel încât fondurile tale sunt protejate atât împotriva atacatorilor clasici, cât și a celor cuantici.

QoreX are două componente care funcționează împreună:

- **Extensia de browser** — portofelul pentru desktop, **disponibilă public pe Chrome, Firefox și Safari (macOS)**. Este un portofel de sine stătător (creezi/imporți, păstrezi și trimiți QOR) și totodată conectorul care permite oricărui site să descopere QoreX și transformă fiecare cerere într-o aprobare explicită. Vezi [Extensia de browser](/qorex/browser-extension).
- **Aplicația mobilă** (Android și iOS) — portofelul complet: creare/restaurare, trimitere și primire de QOR rezistent cuantic, rețele externe, staking, portofoliu, recuperare și un browser de dApp-uri integrat. **Pe Google Play** pentru Android, și **pe App Store** pentru iOS (vezi disponibilitatea mai jos).

:::caution Fă backup frazei de recuperare imediat ce creezi un portofel
QoreX este non-custodial: QoreChain Association nu poate recupera, reseta sau restaura pentru tine un portofel pierdut. **Dezinstalarea aplicației, resetarea telefonului sau eliminarea extensiei șterge cheile tale de pe acel dispozitiv.** Notează-ți fraza de recuperare de 24 de cuvinte (aplicația mobilă nu o afișează în timp ce creează portofelul — o poți dezvălui din **Setări → Securitate → Dezvăluie fraza de recuperare**; extensia o afișează o singură dată, la creare) și, dacă poți, configurează [recuperarea socială](/qorex/security-and-recovery#social-recovery). Vezi [Fă backup acum](/qorex/security-and-recovery#back-up-now).
:::

## Disponibilitate pe platforme {#platform-availability}

| Funcționalitate | Aplicația mobilă (Android și iOS) | Extensia de browser |
|---|---|---|
| Creare / import de portofel | ✅ (aplicația nu afișează fraza când creează portofelul — dezvăluie-o din Setări → Securitate) | ✅ (de sine stătător; fraza este afișată o singură dată, la creare) |
| Mai multe portofele, fiecare cu propria frază de recuperare | ✅ (Setări → Portofele) | ✅ (**Portofele**, o singură parolă pentru toate) |
| Mai multe conturi dintr-o singură frază de recuperare | ✅ (până la 20 per portofel) | ✅ |
| Cont în stil Ethereum (coin 60), adăugat manual | ✅ | ✅ |
| Trimitere și primire de QOR (post-cuantic) | ✅ | ✅ (Trimite; Primește cu QR) |
| Primire pe orice rețea suportată | ✅ | ✅ |
| Plată / revendicare @handle | ✅ | ✅ plată; revendicarea este oferită pe conturile QoreChain obișnuite în unele versiuni ale extensiei — altfel revendică în aplicație |
| Staking: delegare, retragere din delegare, mutare stake, revendicare, revendicare și re-stake | ✅ | ✅ |
| Rețele externe (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokenuri) | ✅ | ✅ (trimitere din popup) |
| Adăugare token prin contract (rețele EVM) | ✅ | ✅ |
| Fereastră de acces EVM | ✅ | ✅ |
| Limba interfeței (10 limbi) | ✅ (urmează limba telefonului) | ✅ (urmează limba browserului) |
| Portofoliu, Q-Day Scanner, Recuperare socială, Legacy | ✅ | — |
| Căutare, tur la prima rulare, widget pe ecranul principal, notificări push | ✅ | — |
| Conexiuni cu dApp-uri | ✅ (browser integrat, limitat la sesiune) | ✅ (orice site; **Site-uri conectate** cu Revocare) |
| Swap | Doar Android, dezactivat până la existența lichidității în pool (nu apare pe iOS) | — |
| Autentificare în cont și cereri de plată | ✅ | — |
| Asociere pe mai multe dispozitive | ✅ | — |
| Împerechere cu Dashboard | ✅ | ✅ (conectare + transferuri propuse, incl. staking) |

## De ce este QoreX diferit

- **Rezistent cuantic implicit** — transferurile de QOR pe banda Native poartă întotdeauna o semnătură hibridă ML-DSA-87 + secp256k1. Orice element clasic (lanțuri externe) este marcat clar, niciodată în tăcere.
- **Cu adevărat non-custodial** — cheile sunt generate pe dispozitiv și stau într-un seif susținut hardware (Secure Enclave pe iOS, StrongBox pe Android) sau într-un seif criptat (extensia). Ele nu părăsesc niciodată dispozitivul tău.
- **Fără analiză, fără urmărire, fără reclame** în nicio aplicație QoreX. Elementele opționale suplimentare folosesc un server doar atunci când le activezi: autentificarea în cont (vezi [Cont și Dashboard](/qorex/account-and-dashboard)) și notificările push, care îți înregistrează dispozitivul și adresele tale *publice*, astfel încât QoreX să te poată anunța când ajunge QOR. Portofelul nu depinde niciodată de niciuna dintre ele.
- **Un singur sold unificat** — QOR-ul tău este un singur sold pe benzile Native, EVM și SVM; QoreX îl afișează ca o cifră unică.
- **Mai multe căi de recuperare** — o frază de recuperare de 24 de cuvinte (întotdeauna; pe mobil, dezvăluie-o din Setări → Securitate), recuperare socială opțională cu garanți și un blocaj temporal de 48 de ore, moștenire Legacy opțională și asocierea comodă a mai multor dispozitive.

## Primii pași

- Ești nou pe QoreX? Începe cu [Primii pași](/qorex/getting-started) pentru a-ți crea sau restaura portofelul.
- Apoi învață să [trimiți și să primești](/qorex/send-and-receive) QOR rezistent cuantic.
- Configurează-ți plasa de siguranță în [Securitate și recuperare](/qorex/security-and-recovery).
- Pe desktop, instalează [Extensia de browser](/qorex/browser-extension).

## Descărcare și disponibilitate {#availability}

- **Extensia de browser** — disponibilă public: instaleaz-o din [Chrome Web Store, Firefox Add-ons sau Mac App Store (Safari)](/qorex/browser-extension#install). Instalează întotdeauna dintr-o listare oficială de magazin.
- **Aplicația Android** — disponibilă în producție pe Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex (Android 7.0 sau mai nou).
- **Aplicația iOS** — disponibilă pe **App Store**: https://apps.apple.com/us/app/qorex-wallet/id6791256626 (iOS 15.1 sau mai nou).

## Ce versiune este disponibilă unde {#versions}

Revizuirea din magazine se desfășoară după propriul program, astfel încât un magazin poate servi pentru scurt timp o versiune mai veche sau mai nouă decât altul. Începând cu **15 octombrie 2026**:

| Platformă | Versiune activă |
|---|---|
| Android | 1.1.6 |
| iOS | 1.1.6 |
| Chrome | 0.3.6 |
| Firefox | 0.3.7 (o versiune intermediară după 0.3.6) |
| Safari (macOS) | 1.7.6, cu extensia 0.3.6 |

Această documentație descrie setul de funcționalități 1.1.6 / 0.3.6. Un magazin care încă servește o versiune mai veche se va actualiza automat; magazinele afișează întotdeauna versiunea lor curentă. Principalele noutăți față de 1.0.9 / 0.2.6:

- **Mai multe portofele** pe același telefon sau browser, fiecare cu propria frază de recuperare, cu comutare dintr-o atingere — vezi [Mai multe portofele](/qorex/getting-started#several-wallets).
- **Cont în stil Ethereum (coin 60)**, adăugat manual, pentru fraze folosite inițial în MetaMask sau pe Dashboard — vezi [Restaurează o frază din MetaMask sau Dashboard](/qorex/getting-started#restore-dashboard).
- **Adăugare token prin contract**, **Primire pe orice rețea**, **căutare** globală, un **tur** la prima rulare, un **widget pe ecranul principal** și **notificări push** când ajunge QOR (mobil) — vezi [Trimite și primește](/qorex/send-and-receive).
- **Revendicare și re-stake**, o verificare a comisionului înainte de revendicare, o listă **Unstaking în curs** și avertismente înainte să faci stake într-o măsură care te-ar împiedica să mai poți retrage — vezi [Portofoliu și staking](/qorex/portfolio-and-staking).
- Ecrane de aprobare care arată fiecare mesaj, comisionul, limitele de cheltuire și expirarea, și refuză ceea ce QoreX nu poate afișa; **`signAndBroadcast`** pentru dApp-uri; **Site-uri conectate** cu Revocare (extensia); **fereastra de acces EVM** — vezi [Securitate și recuperare](/qorex/security-and-recovery) și [Extensia de browser](/qorex/browser-extension).
- Remedieri: un cont alimentat putea dispărea momentan din „Conturile tale" (1.0.9); butonul hardware Înapoi de pe Android revine acum cu un ecran (1.1.1); fraza de recuperare este ascunsă serviciilor care nu sunt de accesibilitate pe Android 14 și versiunile ulterioare (1.1.6).
