---
slug: /qorex/getting-started
title: Primii pași cu QoreX
sidebar_label: Primii pași
sidebar_position: 2
---

# Primii pași cu QoreX

Această pagină parcurge instalarea **aplicației mobile** și crearea, restaurarea sau conectarea portofelului tău. Pentru portofelul desktop, vezi [Extensia de browser](/qorex/browser-extension), disponibilă live pe Chrome, Firefox și Safari.

:::note Disponibilitate mobilă
- **Android** — live în producție pe Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — live pe App Store: https://apps.apple.com/us/app/qorex-wallet/id6791256626
:::

## Înainte de a începe: securizează-ți dispozitivul

Un portofel QoreX poate fi creat sau importat doar atunci când dispozitivul tău are configurat un **factor puternic de deblocare**. Acesta este cel care îți protejează cheile în vaultul hardware. Oricare dintre următoarele se califică:

- **iOS** — Face ID sau Touch ID.
- **Android** — un biometric de Clasă 3 (amprentă, iris sau deblocare facială 3D) **sau** un blocaj de ecran al dispozitivului (PIN, model sau parolă).

:::note Deblocare facială 2D pe Android
Deblocarea facială 2D bazată pe cameră (prezentă pe unele dispozitive, de exemplu anumite modele Samsung) se consideră un biometric *slab*. Dacă este tot ce ai, QoreX se bazează pe **PIN-ul / modelul** din spatele acesteia — iar fișa de sistem îl oferă automat, așa că rămâi acoperit.
:::

Dacă nu este înrolat niciun factor puternic, butoanele de creare/import rămân dezactivate, iar ecranul explică ce trebuie activat. Configurează Face ID, o amprentă sau un blocaj de ecran în setările sistemului, apoi revino în QoreX.

## Prima lansare

Aplicația se deschide pe ecranul de onboarding **doar când nu există niciun portofel pe dispozitiv**. Odată ce ai un portofel, fiecare lansare ulterioară te duce direct la tab-ul Acasă (Portofel). Vizualizarea soldurilor nu necesită biometric; **semnarea unei tranzacții necesită întotdeauna**.

Ai trei moduri de configurare:

### 1. Creează un portofel nou

1. Atinge **Creează un portofel nou**.
2. QoreX generează o **frază de recuperare din 24 de cuvinte** pe dispozitivul tău (entropie de 256 de biți) și derivă identitatea ta QoreChain — coin type 118, o adresă `qor1…` (conturile tale ETH și SOL provin din aceeași sămânță).
3. **Notează cele 24 de cuvinte** și păstrează-le offline. Această frază este **singura** modalitate de a-ți recupera portofelul dacă pierzi dispozitivul.
4. Confirmă fraza; QoreX o sigilează în vaultul hardware, protejat biometric.

:::caution Fraza ta de recuperare este totul
Oricine deține cele 24 de cuvinte controlează fondurile tale, iar nimeni — inclusiv QoreChain Association — nu ți le poate recupera. Nu introduce niciodată fraza pe un site web, nu o distribui și nu o stoca într-o captură de ecran sau într-o notă din cloud. **Dezinstalarea QoreX șterge cheile stocate pe acel dispozitiv** — fără fraza scrisă (sau fără [recuperarea socială](/qorex/security-and-recovery#social-recovery) configurată în prealabil), o dezinstalare înseamnă pierderea permanentă a accesului. Fă backup înainte de a alimenta portofelul, nu după.
:::

### 2. Restaurează un portofel existent

1. Atinge **Restaurează un portofel existent**.
2. Introdu cele 24 de cuvinte în ordine.
3. QoreX rederivă aceleași adrese — portofelul tău arată identic pe orice dispozitiv.

### 3. Conectează-te de pe alt dispozitiv

Dacă ai deja QoreX pe alt telefon sau tabletă, poți muta portofelul între dispozitive **fără server și fără a scrie nimic** — vezi [Conectează un dispozitiv nou](/qorex/security-and-recovery#link-device). Alege **Conectează-te de pe alt dispozitiv** pe noul dispozitiv pentru a începe.

## Opțional: revendică un @handle

După ce portofelul tău este creat, poți revendica un **@handle** unic (de exemplu `@liviu`) astfel încât oamenii să îți poată trimite fonduri folosind un nume, nu o adresă `qor1…`. Acest lucru este opțional și poate fi omis — portofelul tău nu depinde niciodată de el. Un handle se leagă de o adresă anume, nu de portofel în ansamblu, ceea ce contează odată ce ai mai mult de un cont — vezi [Mai multe conturi dintr-o singură frază](/qorex/account-and-dashboard#accounts) și [@handle](/qorex/account-and-dashboard#handle).

## Limbă

QoreX este disponibil în zece limbi — engleză, română, germană, spaniolă, franceză, italiană, turcă, arabă, japoneză și coreeană — și urmează automat limba telefonului tău, revenind la engleză pentru orice altceva. Poți suprascrie oricând limba detectată din **Setări → Limbă**; alegerea limbii arabe comută interfața și la scriere de la dreapta la stânga.

## Pașii următori

- [Trimite și Primește](/qorex/send-and-receive) — realizează primul tău transfer sigur cuantic.
- [Securitate și Recuperare](/qorex/security-and-recovery) — configurează recuperarea socială pentru a nu rămâne blocat niciodată.
- [Portofoliu și Staking](/qorex/portfolio-and-staking) — urmărește activele și câștigă recompense de staking.
