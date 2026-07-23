---
slug: /qorex/getting-started
title: Primii pași cu QoreX
sidebar_label: Primii pași
sidebar_position: 2
---

# Primii pași cu QoreX

Această pagină te ghidează prin instalarea aplicației mobile și crearea, restaurarea sau conectarea portofelului tău.

## Înainte de a începe: securizează-ți dispozitivul

Un portofel QoreX poate fi creat sau importat doar când dispozitivul tău are configurat un **factor puternic de deblocare**. Acesta este cel care îți protejează cheile în seiful hardware. Oricare dintre următoarele este valabil:

- **iOS** — Face ID sau Touch ID.
- **Android** — un biometric Class-3 (amprentă, iris sau deblocare facială 3D) **sau** un blocaj de ecran al dispozitivului (PIN, pattern sau password).

:::note Deblocare facială 2D pe Android
Deblocarea facială 2D bazată pe cameră (prezentă pe unele dispozitive, de ex. anumite modele Samsung) se consideră un biometric *slab*. Dacă este tot ce ai, QoreX se bazează pe **PIN-ul / pattern-ul** din spatele ei — iar fereastra de sistem îl oferă automat, așa că ești în continuare protejat.
:::

Dacă niciun factor puternic nu este înrolat, butoanele de creare/import rămân dezactivate, iar ecranul îți explică ce trebuie să activezi. Configurează Face ID, o amprentă sau un blocaj de ecran în setările sistemului, apoi revino în QoreX.

## Prima lansare

Aplicația se deschide pe ecranul de onboarding **doar când nu există niciun portofel pe dispozitiv**. După ce ai un portofel, fiecare lansare ulterioară duce direct la tab-ul Home (Wallet). Vizualizarea soldurilor nu necesită biometric; **semnarea unei tranzacții necesită întotdeauna**.

Ai trei moduri de configurare:

### 1. Creează un portofel nou

1. Apasă **Create a new wallet**.
2. QoreX generează o **frază de recuperare de 24 de cuvinte** pe dispozitivul tău (entropie de 256 de biți) și derivă identitatea ta QoreChain — coin type 118, o adresă `qor1…` (conturile tale ETH și SOL provin din aceeași sămânță).
3. **Scrie cele 24 de cuvinte** și păstrează-le offline. Această frază este **singura** modalitate de a-ți recupera portofelul dacă pierzi dispozitivul.
4. Confirmă fraza; QoreX o sigilează în seiful protejat hardware și securizat biometric.

:::caution Fraza ta de recuperare înseamnă totul
Oricine îți deține cele 24 de cuvinte îți controlează fondurile, iar nimeni — inclusiv QoreChain Association — nu ți le poate recupera. Nu introduce niciodată fraza pe un site web, nu o partaja și nu o stoca într-o captură de ecran sau într-o notă în cloud.
:::

### 2. Restaurează un portofel existent

1. Apasă **Restore existing wallet**.
2. Tastează cele 24 de cuvinte în ordine.
3. QoreX re-derivă aceleași adrese — portofelul tău arată identic pe orice dispozitiv.

### 3. Conectează de pe alt dispozitiv

Dacă ai deja QoreX pe alt telefon sau tabletă, poți muta portofelul **fără server și fără tastare** — vezi [Conectarea unui dispozitiv nou](/qorex/security-and-recovery#link-device). Alege **Link from another device** pe dispozitivul nou pentru a începe.

## Opțional: revendică un @handle

După ce portofelul tău este creat, poți revendica un **@handle** unic (de exemplu `@liviu`) astfel încât oamenii să îți poată trimite după nume în loc de o adresă `qor1…`. Acest lucru este opțional și poate fi omis — portofelul tău nu depinde niciodată de el. Vezi [Cont & Dashboard](/qorex/account-and-dashboard#handle).

## Pașii următori

- [Trimite & Primește](/qorex/send-and-receive) — realizează primul tău transfer rezistent cuantic.
- [Securitate & Recuperare](/qorex/security-and-recovery) — configurează recuperarea socială ca să nu rămâi niciodată blocat în afara contului.
- [Portofoliu & Staking](/qorex/portfolio-and-staking) — urmărește-ți activele și câștigă recompense din staking.
