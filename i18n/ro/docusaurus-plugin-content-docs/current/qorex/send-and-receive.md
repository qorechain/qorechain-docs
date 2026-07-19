---
slug: /qorex/send-and-receive
title: Trimite și primește
sidebar_label: Trimite și primește
sidebar_position: 3
---

# Trimite și primește

Fila Acasă (Portofel) este punctul tău de plecare. Aceasta afișează un **ecuson de rețea** (MAINNET implicit, sau TESTNET dacă ai activat comutatorul pentru dezvoltatori), **soldul tău total** (atinge pentru a-l ascunde/afișa) și acțiunile principale: **Trimite · Primește · Schimbă · Mizează**. Lista ta de active afișează **QOR** (Native + post-cuantic 🛡, un sold unificat în lanele Native/EVM/SVM) și **Toate rețelele** (o vedere unificată ETH · BNB · POL · ARB).

## Trimite QOR sigur cuantic

1. Atinge **Trimite**.
2. Introdu destinatarul ca adresă `qor1…` **sau** ca **@handle**. Un handle este rezolvat și verificat criptografic (semnătura registrului + semnătura proprietarului + fixare bazată pe încredere la prima utilizare); dacă cheia unui handle se schimbă vreodată în tăcere, QoreX afișează un avertisment explicit.
3. Introdu suma. Previzualizarea arată destinatarul, suma, comisionul și starea **Shield** — nivelul de protecție post-cuantică al semnăturii.
4. Confirmă cu aprobare **biometrică**. QoreX semnează transferul cu semnătura hibridă post-cuantică obligatorie (ML-DSA-87 + secp256k1) și îl difuzează pe lana Native.

**Primul** tău transfer îți înregistrează, de asemenea, automat cheia post-cuantică pe lanț — poți vedea acest lucru în [Securitate și recuperare](/qorex/security-and-recovery#pqc-key). Nu este nevoie de niciun pas separat.

## Primește QOR

Atinge **Primește** pentru a-ți afișa adresa `qor1…` sub formă de cod QR (cu pictograma QoreChain încorporată) și un buton de copiere. Partajează oricare dintre ele cu expeditorul.

## Solicită o plată

Atinge **Solicită** (necesită [autentificare](/qorex/account-and-dashboard#sign-in)) pentru a crea o solicitare de plată — o sumă plus un memo opțional — sub formă de cod QR sau link. Oricine îl scanează vede transferul precompletat.

## Rețele și tokenuri externe

Din **Toate rețelele** (sau Trimite-extern) poți trimite nativ **ETH, BNB, POL, ARB și SOL**, plus tokenuri **ERC-20** și **SPL** — toate derivate din aceeași frază de recuperare (ETH folosește `m/44'/60'`, SOL folosește calea sa standard, iar SPL folosește conturi de token asociate).

:::caution Lanțurile externe sunt exclusiv clasice
Alte blockchain-uri nu pot transporta semnături post-cuantice. Când trimiți pe o rețea externă, QoreX declară acest lucru explicit (transferul folosește o semnătură clasică, iar **Shield** afișează retrogradarea). **QOR** al tău rămâne întotdeauna pe lana Native protejată. Trimiterile externe bazate pe Cosmos acceptă un memo opțional.
:::

## Schimbă

Fila **Schimbă** este conectată la AMM-ul on-chain al QoreChain, dar rămâne dezactivată — butonul afișează **"Swap — coming with pool liquidity"** — până când lichiditatea și indicatorul de funcționalitate la distanță o activează. Când se întâmplă acest lucru, ea se aprinde automat; **nu este nevoie de nicio actualizare a aplicației**.

## Pași următori

- [Portofoliu și mizare](/qorex/portfolio-and-staking) — vezi alocarea ta și câștigă recompense.
- [Securitate și recuperare](/qorex/security-and-recovery) — protejează-ți și recuperează-ți portofelul.
