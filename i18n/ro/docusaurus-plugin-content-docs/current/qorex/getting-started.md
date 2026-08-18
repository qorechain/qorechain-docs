---
slug: /qorex/getting-started
title: Primii pași cu QoreX
sidebar_label: Primii pași
sidebar_position: 2
---

# Primii pași cu QoreX

Această pagină te ghidează prin instalarea **aplicației mobile** și prin crearea, restaurarea sau conectarea portofelului tău. Pentru portofelul de desktop, vezi [Extensia de browser](/qorex/browser-extension), care este disponibilă pe Chrome, Firefox și Safari.

:::note Disponibilitate pe mobil
Aplicația mobilă QoreX se află în prezent în testare publică:

- **Android** — disponibilă pentru **testare publică** pe Google Play.
- **iOS** — disponibilă pentru testare prin **TestFlight** dacă vrei să o încerci.

Găsești linkurile actuale pe [qorechain.io](https://qorechain.io).
:::

## Înainte de a începe: securizează-ți dispozitivul

Un portofel QoreX poate fi creat sau importat doar atunci când dispozitivul tău are configurat un **factor de deblocare puternic**. Acesta este cel care îți protejează cheile în seiful hardware. Oricare dintre următoarele este suficient:

- **iOS** — Face ID sau Touch ID.
- **Android** — un biometric de Clasa 3 (amprentă, iris sau deblocare facială 3D) **sau** o blocare de ecran a dispozitivului (PIN, model sau parolă).

:::note Deblocare facială 2D pe Android
Deblocarea facială 2D bazată pe cameră (întâlnită pe unele dispozitive, de exemplu anumite modele Samsung) este considerată un biometric *slab*. Dacă este tot ce ai, QoreX se bazează pe **PIN-ul / modelul** din spatele ei — iar fișa sistemului îl oferă automat, așa că ești tot protejat.
:::

Dacă niciun factor puternic nu este înrolat, butoanele de creare/import rămân dezactivate, iar ecranul explică ce trebuie să activezi. Configurează Face ID, o amprentă sau o blocare de ecran în setările sistemului, apoi revino în QoreX.

## Prima lansare

Aplicația se deschide pe ecranul de configurare inițială **doar când nu există niciun portofel pe dispozitiv**. Odată ce ai un portofel, fiecare lansare ulterioară merge direct la fila Home (Portofel). Vizualizarea soldurilor nu necesită biometric; **semnarea unei tranzacții necesită întotdeauna**.

Ai trei moduri de a configura:

### 1. Creează un portofel nou

1. Apasă **Creează un portofel nou**.
2. QoreX generează o **frază de recuperare de 24 de cuvinte** pe dispozitivul tău (entropie de 256 de biți) și derivă identitatea ta QoreChain — coin type 118, o adresă `qor1…` (conturile tale ETH și SOL provin din același seed).
3. **Notează cele 24 de cuvinte** și păstrează-le offline. Această frază este **singurul** mod de a-ți recupera portofelul dacă pierzi dispozitivul.
4. Confirmă fraza; QoreX o sigilează în seiful protejat hardware și securizat biometric.

:::caution Fraza ta de recuperare este totul
Oricine îți are cele 24 de cuvinte îți controlează fondurile, iar nimeni — inclusiv QoreChain Association — nu le poate recupera în locul tău. Nu tasta niciodată fraza pe un site web, nu o partaja și nu o stoca într-o captură de ecran sau într-o notă din cloud.
:::

### 2. Restaurează un portofel existent

1. Apasă **Restaurează portofel existent**.
2. Tastează cele 24 de cuvinte în ordine.
3. QoreX re-derivă aceleași adrese — portofelul tău arată identic pe orice dispozitiv.

### 3. Conectează de pe alt dispozitiv

Dacă ai deja QoreX pe alt telefon sau tabletă, poți muta portofelul dintr-o parte în alta cu **niciun server și fără tastare** — vezi [Conectează un dispozitiv nou](/qorex/security-and-recovery#link-device). Alege **Conectează de pe alt dispozitiv** pe dispozitivul nou pentru a începe.

## Opțional: revendică un @handle

După ce portofelul tău este creat, poți revendica un **@handle** unic (de exemplu `@liviu`), astfel încât oamenii să-ți poată trimite după nume în loc de o adresă `qor1…`. Acest lucru este opțional și poate fi omis — portofelul tău nu depinde niciodată de el. Vezi [Cont și Dashboard](/qorex/account-and-dashboard#handle).

## Pașii următori

- [Trimite și primește](/qorex/send-and-receive) — fă primul tău transfer sigur cuantic.
- [Securitate și recuperare](/qorex/security-and-recovery) — configurează recuperarea socială ca să nu rămâi niciodată blocat pe dinafară.
- [Portofoliu și staking](/qorex/portfolio-and-staking) — urmărește-ți activele și obține recompense din staking.
