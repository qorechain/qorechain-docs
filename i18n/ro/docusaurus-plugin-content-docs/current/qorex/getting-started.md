---
slug: /qorex/getting-started
title: Primii pași cu QoreX
sidebar_label: Primii pași
sidebar_position: 2
---

# Primii pași cu QoreX

Această pagină prezintă pas cu pas instalarea aplicației mobile și crearea, restaurarea sau conectarea portofelului tău.

## Înainte de a începe: securizează-ți dispozitivul

Un portofel QoreX poate fi creat sau importat doar când dispozitivul tău are activată **protecția biometrică** — Face ID / Touch ID pe iOS, sau o amprentă / un factor puternic echivalent pe Android. Aceasta este cea care îți protejează cheile în seiful hardware.

Dacă nu este activată nicio metodă biometrică, butoanele de creare/import rămân dezactivate, iar ecranul explică ce trebuie să activezi. Activează Face ID sau o amprentă în setările sistemului, apoi revino în QoreX.

## Prima lansare

Aplicația se deschide pe ecranul de configurare inițială **doar când nu există niciun portofel pe dispozitiv**. Odată ce ai un portofel, fiecare lansare ulterioară te duce direct în fila Home (Portofel). Vizualizarea soldurilor nu necesită biometrie; **semnarea unei tranzacții necesită întotdeauna**.

Ai trei moduri de configurare:

### 1. Creează un portofel nou

1. Apasă **Create a new wallet**.
2. QoreX generează o **frază de recuperare de 24 de cuvinte** pe dispozitivul tău (entropie de 256 de biți) și derivă identitatea ta QoreChain — coin type 118, o adresă `qor1…` (conturile tale ETH și SOL provin din aceeași sămânță).
3. **Notează-ți cele 24 de cuvinte** și păstrează-le offline. Această frază este **singura** modalitate de a-ți recupera portofelul dacă pierzi dispozitivul.
4. Confirmă fraza; QoreX o sigilează în seiful protejat hardware și securizat biometric.

:::caution Fraza ta de recuperare înseamnă totul
Oricine îți deține cele 24 de cuvinte îți controlează fondurile, iar nimeni — inclusiv QoreChain Association — nu le poate recupera în locul tău. Nu-ți tasta niciodată fraza pe un site web, nu o partaja și nu o stoca într-o captură de ecran sau într-o notă în cloud.
:::

### 2. Restaurează un portofel existent

1. Apasă **Restore existing wallet**.
2. Tastează cele 24 de cuvinte în ordine.
3. QoreX re-derivă aceleași adrese — portofelul tău arată identic pe orice dispozitiv.

### 3. Conectează de pe alt dispozitiv

Dacă ai deja QoreX pe alt telefon sau pe o tabletă, poți muta portofelul **fără server și fără să tastezi** — vezi [Conectează un dispozitiv nou](/qorex/security-and-recovery#link-device). Alege **Link from another device** pe dispozitivul nou pentru a începe.

## Opțional: revendică un @handle

După ce portofelul tău este creat, poți revendica un **@handle** unic (de exemplu `@liviu`) astfel încât oamenii să-ți poată trimite după nume în loc de o adresă `qor1…`. Acesta este opțional și poate fi omis — portofelul tău nu depinde niciodată de el. Vezi [Cont și Dashboard](/qorex/account-and-dashboard#handle).

## Pașii următori

- [Trimite și Primește](/qorex/send-and-receive) — efectuează primul tău transfer sigur cuantic.
- [Securitate și Recuperare](/qorex/security-and-recovery) — configurează recuperarea socială ca să nu rămâi niciodată blocat în afara contului.
- [Portofoliu și Staking](/qorex/portfolio-and-staking) — urmărește activele și câștigă recompense din staking.
