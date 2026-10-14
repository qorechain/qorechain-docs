---
slug: /qorex/getting-started
title: Primii pași cu QoreX
sidebar_label: Primii pași
sidebar_position: 2
---

# Primii pași cu QoreX

Această pagină parcurge instalarea **aplicației mobile** și crearea, restaurarea sau conectarea portofelului tău. Pentru portofelul desktop, vezi [Extensia de browser](/qorex/browser-extension), disponibilă live pe Chrome, Firefox și Safari.

:::note Disponibilitate mobilă
- **Android** — live în producție pe Google Play (Android 7.0 sau ulterior): https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — live pe App Store (iOS 15.1 sau ulterior): https://apps.apple.com/us/app/qorex-wallet/id6791256626
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
2. QoreX generează o **frază de recuperare din 24 de cuvinte** pe dispozitivul tău (entropie de 256 de biți), o sigilează direct în vaultul hardware, protejat biometric, și derivă identitatea ta QoreChain — coin type 118, o adresă `qor1…` (conturile tale ETH și SOL provin din aceeași sămânță). **Aplicația nu îți arată fraza cât timp creează portofelul.**
3. **Dezvăluie fraza și notează-o imediat:** deschide **Setări → Securitate → Dezvăluie fraza de recuperare**, confirmă cu biometric sau cu PIN-ul dispozitivului și copiază cele 24 de cuvinte pe hârtie, în ordine. Păstrează-le offline. Această frază este **singura** modalitate de a-ți recupera portofelul dacă pierzi dispozitivul.
4. Opțional, configurează [recuperarea socială](/qorex/security-and-recovery#social-recovery). Reține că cardul **Starea backup-ului** din Acasă urmărește doar recuperarea socială — nu poate ști dacă ai notat fraza, deci nu îți va aminti.

:::danger Fă pasul 3 acum — nimic din aplicație nu ți-l va aminti
Deoarece aplicația trece direct la Acasă după crearea portofelului, este ușor să continui fără să fi notat vreodată fraza. **Fă-o înainte de a primi sau de a trimite orice.** Dacă pierzi sau dezinstalezi aplicația, ori pierzi telefonul, fără fraza scrisă sau fără [recuperare socială](/qorex/security-and-recovery#social-recovery) configurată, nimeni — inclusiv QoreChain Association — nu îți poate recupera fondurile.
:::

:::caution Fraza ta de recuperare este totul
Oricine deține cele 24 de cuvinte controlează fondurile tale, iar nimeni — inclusiv QoreChain Association — nu ți le poate recupera. Nu introduce niciodată fraza pe un site web, nu o distribui și nu o stoca într-o captură de ecran sau într-o notă din cloud. **Dezinstalarea QoreX șterge cheile stocate pe acel dispozitiv** — fără fraza scrisă (sau fără [recuperarea socială](/qorex/security-and-recovery#social-recovery) configurată în prealabil), o dezinstalare înseamnă pierderea permanentă a accesului. Fă backup înainte de a alimenta portofelul, nu după.
:::

### 2. Restaurează un portofel existent {#2-restore-an-existing-wallet}

1. Atinge **Restaurează un portofel existent**.
2. Alege **Frază de recuperare** (dacă ai notat cele 24 de cuvinte) sau **Recuperare socială** (dacă ai configurat garanți și nu mai deții fraza — vezi [Recuperare socială](/qorex/security-and-recovery#social-recovery)).
3. Pentru calea cu frază de recuperare: introdu cele 24 de cuvinte în ordine. QoreX normalizează scrierea cu majuscule/minuscule și spațierea, verifică fraza și te anunță clar dacă un cuvânt nu corespunde, în loc de o eroare generică.
4. QoreX rederivă aceleași adrese — portofelul tău arată identic pe orice dispozitiv.

:::note Conturile suplimentare revin pe rând
Restaurarea din frază readuce **Contul 1**. Dacă ai folosit mai multe conturi în vechiul portofel, atinge **Adaugă un cont** (Setări → Conturile tale) pentru a le readuce pe următoarele — sunt derivate din aceeași frază, deci reapar la aceleași adrese. Conturile de tip Ethereum se adaugă cu **Adaugă un cont Ethereum (coin 60)**; vezi [Restaurează o frază din MetaMask sau din Dashboard](#restore-dashboard). Adaugă-le în aceeași ordine în care le-ai creat în vechiul portofel: conturile sunt numerotate pe sloturi, iar o ordine diferită pe un dispozitiv nou poate da un alt cont într-un slot.
:::

### 3. Conectează-te de pe alt dispozitiv

Dacă ai deja QoreX pe alt telefon sau tabletă, poți muta portofelul între dispozitive **fără server și fără a scrie nimic** — vezi [Conectează un dispozitiv nou](/qorex/security-and-recovery#link-device). Alege **Conectează-te de pe alt dispozitiv** pe noul dispozitiv pentru a începe.

## Mai multe portofele pe un singur dispozitiv {#several-wallets}

Fiecare portofel are **propria frază de recuperare**. Poți păstra mai multe pe un singur telefon — de exemplu portofelul principal și unul restaurat de la alt serviciu — și poți comuta între ele cu o singură atingere.

- **Mobil:** Setări → **Portofele** listează portofelele de pe acest telefon. Atinge unul pentru a-l face portofelul activ — întreaga aplicație trece la el (nimic nu se mută pe chain). **Adaugă un portofel** îți permite să creezi unul nou, să restaurezi unul din fraza de recuperare sau să conectezi unul de pe alt dispozitiv; cele pe care le ai deja rămân. Restaurarea unei fraze care există deja pe telefon doar comută la ea.
- **Extensie:** ecranul **Portofele** din popup face același lucru, cu **o singură parolă** pentru toate. Adăugarea sau eliminarea unui portofel îți cere parola o dată, pentru a re-sigila vaultul, și dezactivează deblocarea cu passkey (reactivează-o din ecranul principal).
- **Eliminarea unui portofel** (*Elimină de pe acest telefon* / *Elimină din acest browser*) șterge cheia acelui portofel de pe dispozitiv. Fondurile rămân pe chain, dar doar fraza lui de recuperare îl poate readuce — notează-o mai întâi.

## Restaurează o frază din MetaMask sau din Dashboard {#restore-dashboard}

Implicit, QoreX derivă adresa ta `qor1…` dintr-o frază de recuperare pe coin type **118**. O frază folosită prima dată în MetaMask — sau într-un portofel creat pe Dashboard-ul QoreChain — își ține QOR la o adresă de tip **Ethereum** (coin type **60**), așa că restaurarea ei arată un **Cont 1** gol. Nu s-a pierdut nimic; adaugă contul de tip Ethereum:

1. Actualizează QoreX la versiunea curentă din magazinul tău de aplicații.
2. **Adaugă un portofel** (Setări → Portofele → *Adaugă un portofel* → *Restaurează un portofel existent*) și introdu fraza. Portofelul tău existent rămâne unde este. În extensie: **Portofele** → restaurează.
3. Deschide Setări → **Conturile tale** și atinge **Adaugă un cont Ethereum (coin 60)**. Prima atingere adaugă contul la indexul 0 — aceeași adresă `0x…` pe care o arată MetaMask pentru acele cuvinte și aceeași cheie ca adresa ta QoreChain `qor1…` pentru acel cont. QOR-ul tău se află acolo.
4. Comută la acel cont (este etichetat *Ethereum · coin 60*). Poți trimite, face staking și revendica din el. Prima trimitere înregistrează și cheia post-cuantică a contului respectiv, ceea ce costă o mică taxă unică.

Un cont de tip Ethereum nu are @handle (handle-urile se revendică pe un cont QoreChain `qor1…` la coin type 118), iar site-urile web semnează prin `signAndBroadcast`, nu prin `signDirect`, cu el. Fiecare atingere pe **Adaugă un cont Ethereum (coin 60)** adaugă următorul index.

## Orientează-te în aplicație {#find-your-way}

- **Căutare** — lupa din partea de sus a ecranului Acasă caută ecrane („stake"), monede („USDC"), persoane (un @handle sau o adresă), memo-uri și începutul unui hash de tranzacție; dacă tastezi un @handle sau o adresă `qor1…`, îți oferă direct **Trimite QOR către …**.
- **Tur** — prima dată când un portofel se deschide pe Acasă, cinci carduri scurte explică ce face QoreX și unde sunt lucrurile. Rulează o singură dată; reia-l din Setări → **Reia turul**.

## Opțional: revendică un @handle

După ce portofelul tău este creat, poți revendica un **@handle** unic (de exemplu `@liviu`) astfel încât oamenii să îți poată trimite fonduri folosind un nume, nu o adresă `qor1…`. Acest lucru este opțional și poate fi omis — portofelul tău nu depinde niciodată de el. (În extensia de browser, unele versiuni nu oferă revendicarea; dacă popup-ul nu o oferă, revendică din aplicația mobilă.) Un handle se leagă de o adresă anume, nu de portofel în ansamblu, ceea ce contează odată ce ai mai mult de un cont — vezi [Mai multe conturi dintr-o singură frază](/qorex/account-and-dashboard#accounts) și [@handle](/qorex/account-and-dashboard#handle).

## Limbă

QoreX este disponibil în zece limbi — engleză, română, germană, spaniolă, franceză, italiană, turcă, arabă, japoneză și coreeană — și urmează automat limba telefonului tău, revenind la engleză pentru orice altceva. Poți suprascrie oricând limba detectată din **Setări → Limbă**; alegerea limbii arabe comută interfața și la scriere de la dreapta la stânga.

## Pașii următori

- [Trimite și Primește](/qorex/send-and-receive) — realizează primul tău transfer sigur cuantic.
- [Securitate și Recuperare](/qorex/security-and-recovery) — configurează recuperarea socială pentru a nu rămâne blocat niciodată.
- [Portofoliu și Staking](/qorex/portfolio-and-staking) — urmărește activele și câștigă recompense de staking.
