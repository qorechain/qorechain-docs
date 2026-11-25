---
slug: /qorex/getting-started
title: Primii pași cu QoreX
sidebar_label: Primii pași
sidebar_position: 2
---

# Primii pași cu QoreX

**Aplicația mobilă QoreX** (iOS și Android) este portofelul QoreChain complet, în buzunarul tău. Este pentru oricine vrea să dețină și să trimită QOR, să facă staking, să plătească oameni prin @handle, să dețină active pe alte rețele și să aibă un plan de recuperare care nu depinde de o companie. Această pagină parcurge instalarea aplicației și crearea, restaurarea sau conectarea portofelului tău. Pentru portofelul desktop, vezi [Extensia de browser](/qorex/browser-extension); pentru întreaga familie, vezi [prezentarea generală](/qorex/overview).

## Inovații {#innovations}

- **Chei care nu părăsesc niciodată dispozitivul.** Cele 24 de cuvinte sunt generate pe telefon și sigilate într-un vault protejat hardware și blocat biometric (Secure Enclave pe iOS, StrongBox pe Android). Semnarea necesită întotdeauna biometricul sau PIN-ul tău.
- **Lane nativ semnat hibrid.** Fiecare transfer QOR nativ este semnat de două ori: cu o cheie clasică și cu ML-DSA-87 (FIPS 204).
- **Cheie ML-DSA-87 din aceleași 24 de cuvinte.** `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)` o derivă determinist, deci nu există un al doilea backup. Derivarea este publicată în [QoreSign](/qoresign/overview). Cheia este înregistrată automat pe chain odată cu prima ta tranzacție.
- **O verificare după fiecare transmitere.** Portofelul citește tranzacția confirmată și te avertizează dacă lipsește stratul ML-DSA-87.
- **Fereastra de acces EVM.** QoreX deschide, arată și închide fereastra care permite unui cont de tip Ethereum să trimită pe lane-ul EVM. Vezi [Securitate și Recuperare](/qorex/security-and-recovery#evm-window).
- **@handle-uri cu fixare.** Două semnături leagă un nume de o adresă; prima adresă rezolvată este fixată, iar o schimbare silențioasă este semnalată.
- **Recuperare fără o companie.** Recuperare socială (fragmente criptate, 2 din 3, timelock de 48 de ore), Legacy (un dead-man's switch peste garanții tăi) și conectarea dispozitivelor. Vezi [Securitate și Recuperare](/qorex/security-and-recovery).
- **Prima rulare cu un scop.** După scurtul tur, QoreX întreabă **Ce vrei să faci mai întâi?** și te ghidează până acolo, inclusiv cu o scurtă verificare că fraza ta de recuperare este notată corect. Vezi [Prima rulare](#first-run).
- **Protecția banilor mei.** Un singur ecran care verifică backupul, testul de recuperare, gardienii, site-urile conectate și permisiunile permanente. Vezi [Securitate și recuperare](/qorex/security-and-recovery).
- **Scaner Q-Day.** Un raport de expunere pentru orice adresă Bitcoin sau Ethereum. Pentru o adresă Bitcoin, QoreX întreabă un serviciu operat de altcineva, care vede adresa și adresa ta IP, și doar după ce accepți.
- **Push și widget cu amprentă redusă.** Push-ul comunică serverului doar adresele tale publice, iar notificarea spune doar „QOR received". Widgetul arată soldul QOR al contului folosit.

## Cum accesezi {#how-to-access}

:::note Disponibilitate mobilă
- **Android**: Google Play (Android 7.0 sau ulterior): https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS**: App Store (iOS 15.1 sau ulterior): https://apps.apple.com/us/app/qorex-wallet/id6791256626
:::

Versiunile curente sunt listate la [Ce versiune este live unde](/qorex/overview#versions): aplicația iOS și Android este 1.2.5. Aplicația este gratuită și nu necesită cont. Mainnet `qorechain-vladi` este implicit; **Setări → Folosește testnet (dezvoltatori)** comută la `qorechain-diana`. Trimiterea și staking-ul plătesc taxa normală de rețea (prag de 0,1 uqor per gas). Aplicația are 10 limbi, inclusiv araba cu aranjare de la dreapta la stânga, și urmează limba telefonului.

## Cum folosești {#how-to-use}

Pașii de mai jos acoperă configurarea unui portofel. Pentru utilizarea de zi cu zi, vezi [Trimite și Primește](/qorex/send-and-receive), [Portofoliu și Staking](/qorex/portfolio-and-staking), [Securitate și Recuperare](/qorex/security-and-recovery) și [Browserul dApp](/qorex/dapp-browser).

## Înainte de a începe: securizează-ți dispozitivul

Un portofel QoreX poate fi creat sau importat doar atunci când dispozitivul tău are configurat un **factor puternic de deblocare**. Acesta este cel care îți protejează cheile în vaultul hardware. Oricare dintre următoarele se califică:

- **iOS** - Face ID sau Touch ID.
- **Android** - un biometric de Clasă 3 (amprentă, iris sau deblocare facială 3D) **sau** un blocaj de ecran al dispozitivului (PIN, model sau parolă).

:::note Deblocare facială 2D pe Android
Deblocarea facială 2D bazată pe cameră (prezentă pe unele dispozitive, de exemplu anumite modele Samsung) se consideră un biometric *slab*. Dacă este tot ce ai, QoreX se bazează pe **PIN-ul / modelul** din spatele acesteia - iar fișa de sistem îl oferă automat, așa că rămâi acoperit.
:::

Dacă nu este înrolat niciun factor puternic, butoanele de creare/import rămân dezactivate, iar ecranul explică ce trebuie activat. Configurează Face ID, o amprentă sau un blocaj de ecran în setările sistemului, apoi revino în QoreX.

## Prima lansare

Aplicația se deschide pe ecranul de onboarding **doar când nu există niciun portofel pe dispozitiv**. Odată ce ai un portofel, fiecare lansare ulterioară te duce direct la tab-ul Acasă (Portofel). Vizualizarea soldurilor nu necesită biometric; **semnarea unei tranzacții necesită întotdeauna**.

Ai trei moduri de configurare:

### 1. Creează un portofel nou

1. Atinge **Creează un portofel nou**.
2. QoreX generează o **frază de recuperare din 24 de cuvinte** pe dispozitivul tău (entropie de 256 de biți), o sigilează direct în vaultul protejat hardware și blocat biometric și derivă identitatea ta QoreChain - coin type 118, o adresă `qor1…` (conturile tale ETH și SOL provin din aceeași sămânță). **Aplicația nu îți arată fraza cât timp creează portofelul.**
3. **Dezvăluie fraza și notează-o imediat:** deschide **Setări → Securitate → Dezvăluie fraza de recuperare**, confirmă cu biometric sau cu PIN-ul dispozitivului și copiază cele 24 de cuvinte pe hârtie, în ordine. Păstrează-le offline. Această frază este **singura** modalitate de a-ți recupera portofelul dacă pierzi dispozitivul.
4. Verifică ce ai notat: pe ecranul care îți arată fraza, atinge **Verifică-mi backupul** și scrie cele trei cuvinte cerute (vezi [Verificarea backupului](#backup-check)).
5. Opțional, configurează [recuperarea socială](/qorex/security-and-recovery#social-recovery). Reține că cardul **Starea copiei de siguranță** din Acasă urmărește doar recuperarea socială. Dacă fraza ta scrisă a fost verificată se vede pe **Protecția banilor mei**.

:::danger Fă pasul 3 acum - nu te baza pe un memento
Deoarece aplicația nu arată fraza cât timp creează portofelul, este ușor să continui fără să o fi notat vreodată. **Fă-o înainte de a primi sau de a trimite orice.** Dacă pierzi sau dezinstalezi aplicația, ori pierzi telefonul, fără fraza scrisă sau fără o [recuperare socială](/qorex/security-and-recovery#social-recovery) configurată, nimeni - inclusiv QoreChain Association - nu îți poate recupera fondurile.
:::

:::caution Fraza ta de recuperare este totul
Oricine deține cele 24 de cuvinte controlează fondurile tale, iar nimeni - inclusiv QoreChain Association - nu ți le poate recupera. Nu introduce niciodată fraza pe un site web, nu o distribui și nu o stoca într-o captură de ecran sau într-o notă din cloud. **Dezinstalarea QoreX șterge cheile stocate pe acel dispozitiv** - fără fraza scrisă (sau fără [recuperarea socială](/qorex/security-and-recovery#social-recovery) configurată în prealabil), o dezinstalare înseamnă pierderea permanentă a accesului. Fă backup înainte de a alimenta portofelul, nu după.
:::

### 2. Restaurează un portofel existent {#2-restore-an-existing-wallet}

1. Atinge **Restaurează un portofel existent**.
2. Alege **Frază de recuperare** (dacă ai notat cele 24 de cuvinte) sau **Recuperare socială** (dacă ai configurat garanți și nu mai deții fraza - vezi [Recuperare socială](/qorex/security-and-recovery#social-recovery)).
3. Pentru calea cu frază de recuperare: introdu cele 24 de cuvinte în ordine. QoreX normalizează scrierea cu majuscule/minuscule și spațierea, verifică fraza și te anunță clar dacă un cuvânt nu corespunde, în loc de o eroare generică.
4. QoreX rederivă aceleași adrese - portofelul tău arată identic pe orice dispozitiv.

:::note Conturile suplimentare revin pe rând
Restaurarea din frază readuce **Contul 1**. Dacă ai folosit mai multe conturi în vechiul portofel, atinge **Adaugă un cont** (Setări → Conturile tale) pentru a le readuce pe următoarele - sunt derivate din aceeași frază, deci reapar la aceleași adrese. Conturile de tip Ethereum se adaugă cu **Adaugă un cont Ethereum (coin 60)**; vezi [Restaurează o frază din MetaMask sau din Dashboard](#restore-dashboard). Adaugă-le în aceeași ordine în care le-ai creat în vechiul portofel: conturile sunt numerotate pe sloturi, iar o ordine diferită pe un dispozitiv nou poate da un alt cont într-un slot.
:::

### 3. Conectează-te de pe alt dispozitiv

Dacă ai deja QoreX pe alt telefon sau tabletă, poți muta portofelul între dispozitive **fără server și fără a scrie nimic** - vezi [Conectează un dispozitiv nou](/qorex/security-and-recovery#link-device). Alege **Conectează-te de pe alt dispozitiv** pe noul dispozitiv pentru a începe.

## Prima rulare: Ce vrei să faci mai întâi? {#first-run}

O singură dată per portofel, după scurtul tur, QoreX întreabă **Ce vrei să faci mai întâi?** Alege unul dintre trei obiective sau atinge **Sari peste deocamdată**. Îl poți redeschide mai târziu din **Setări → Ce vrei să faci?** Funcționează la fel pe mainnet și pe testnet (pe testnet, QOR nu are nicio valoare).

| Obiectiv | Prin ce te ghidează QoreX |
|---|---|
| **Vreau să primesc bani** | Alegi moneda pe care vrei să o primești, vezi adresa corectă ca și cod QR, cu avertismentul de a trimite doar acea monedă pe acea rețea, apoi **Creează un link de plată** (linkurile de plată cer QOR pe QoreChain). Vezi [Cereri de plată](/qorex/send-and-receive). |
| **Vreau să trimit bani** | **Adaugă fonduri**: adresa ta QoreChain și codul QR. **Ia-ți un @handle** (sau vezi-l pe cel pe care îl ai). **Prima ta plată**: comisionul, cam cât este (și comisionul unic de înregistrare a cheii post-cuantice, dacă contul tău nu a înregistrat încă una), apoi **Fă prima mea plată**. Vezi suma exactă înainte de a semna. |
| **Vreau să-mi păstrez criptomonedele în siguranță** | **Adresa ta de depunere**; **Configurează recuperarea** cu [gardieni](/qorex/security-and-recovery#social-recovery), care nu îți văd niciodată fraza; apoi **Verifică-mi backupul**, care arată dacă backupul tău a fost verificat și te duce la frază ca să o verifici. |

În extensia de browser, aceeași întrebare apare după ce creezi sau imporți un portofel; acolo obiectivul de siguranță este adresa de depunere și verificarea backupului, iar @handle-urile se revendică în aplicație. Vezi [Creează sau restaurează un portofel](/qorex/browser-extension#wallet).

### Verificarea backupului {#backup-check}

Verificarea backupului este un scurt test: QoreX cere **trei cuvinte din fraza ta de recuperare**, de pe poziții aleatorii, iar tu le scrii așa cum le-ai notat.

- În **aplicație**: deschide **Setări → Securitate → Reveal recovery phrase**, confirmă cu biometria sau cu PIN-ul dispozitivului, notează cuvintele, apoi atinge **Verifică-mi backupul**. Dacă un cuvânt nu se potrivește, compară cu foaia ta și încearcă din nou; **Arată din nou fraza** te duce înapoi la cuvinte, iar **Verific mai târziu** părăsește ecranul. Când treci verificarea, QoreX înregistrează doar că a fost verificată și când.
- În **extensie**: verificarea urmează ecranului care arată fraza nouă. Mai târziu, **Verifică-mi backupul** îți cere parola și nu arată fraza.
- **Protecția banilor mei** are **Testează fraza de recuperare**, care cere trei cuvinte în același mod. Cuvintele sunt comparate pe dispozitivul tău; nimic din ce scrii nu este păstrat sau trimis.

## Mai multe portofele pe un singur dispozitiv {#several-wallets}

Fiecare portofel are **propria frază de recuperare**. Poți păstra mai multe pe un singur telefon - de exemplu portofelul principal și unul restaurat de la alt serviciu - și poți comuta între ele cu o singură atingere.

- **Mobil:** Setări → **Portofele** listează portofelele de pe acest telefon. Atinge unul pentru a-l face portofelul activ - întreaga aplicație trece la el (nimic nu se mută pe chain). **Adaugă un portofel** îți permite să creezi unul nou, să restaurezi unul din fraza de recuperare sau să conectezi unul de pe alt dispozitiv; cele pe care le ai deja rămân. Restaurarea unei fraze care există deja pe telefon doar comută la ea.
- **Extensie:** ecranul **Portofele** din popup face același lucru, cu **o singură parolă** pentru toate. Adăugarea sau eliminarea unui portofel îți cere parola o dată, pentru a re-sigila vaultul, și dezactivează deblocarea cu passkey (reactivează-o din ecranul principal).
- **Eliminarea unui portofel** (*Elimină de pe acest telefon* / *Elimină din acest browser*) șterge cheia acelui portofel de pe dispozitiv. Fondurile rămân pe chain, dar doar fraza lui de recuperare îl poate readuce - notează-o mai întâi.

## Restaurează o frază din MetaMask sau din Dashboard {#restore-dashboard}

Implicit, QoreX derivă adresa ta `qor1…` dintr-o frază de recuperare pe coin type **118**. O frază folosită prima dată în MetaMask - sau într-un portofel creat pe Dashboard-ul QoreChain - își ține QOR la o adresă de tip **Ethereum** (coin type **60**), așa că restaurarea ei arată un **Cont 1** gol. Nu s-a pierdut nimic; adaugă contul de tip Ethereum:

1. Actualizează QoreX la versiunea curentă din magazinul tău de aplicații.
2. **Adaugă un portofel** (Setări → Portofele → *Adaugă un portofel* → *Restaurează un portofel existent*) și introdu fraza. Portofelul tău existent rămâne unde este. În extensie: **Portofele** → restaurează.
3. Deschide Setări → **Conturile tale** și atinge **Adaugă un cont Ethereum (coin 60)**. Prima atingere adaugă contul la indexul 0 - aceeași adresă `0x…` pe care o arată MetaMask pentru acele cuvinte și aceeași cheie ca adresa ta QoreChain `qor1…` pentru acel cont. QOR-ul tău se află acolo.
4. Comută la acel cont (este etichetat *Ethereum · coin 60*). Poți trimite, face staking și revendica din el. Prima trimitere înregistrează și cheia ML-DSA-87 a contului respectiv, ceea ce costă o mică taxă unică.

Un cont de tip Ethereum nu are @handle (handle-urile se revendică pe un cont QoreChain `qor1…` la coin type 118), iar site-urile web semnează prin `signAndBroadcast`, nu prin `signDirect`, cu el. Este, de asemenea, tipul de cont pentru care contează [fereastra de acces EVM](/qorex/security-and-recovery#evm-window): MetaMask semnează cu aceeași cheie, deci tranzacțiile MetaMask pot muta QOR-ul său odată ce o fereastră este deschisă. Fiecare atingere pe **Adaugă un cont Ethereum (coin 60)** adaugă următorul index.

## Orientează-te în aplicație {#find-your-way}

- **Căutare** - lupa din partea de sus a ecranului Acasă caută ecrane („stake"), monede („USDC"), persoane (un @handle sau o adresă), memo-uri și începutul unui hash de tranzacție; dacă tastezi un @handle sau o adresă `qor1…`, îți oferă direct **Trimite QOR către …**.
- **Tur** - prima dată când un portofel se deschide pe Acasă, cinci carduri scurte explică ce face QoreX și unde sunt lucrurile. Rulează o singură dată; reia-l din Setări → **Revezi turul aplicației**. După el urmează [Ce vrei să faci mai întâi?](#first-run).
- **Setări** are și **Cereri de plată**, **Plătește o cerere**, **Contacte**, **Protecția banilor mei**, **Asistență** și **Ce vrei să faci?** (și, doar pe testnet, trimiterea pe alt lanț și ecranul QoreChain Bridge - vezi [Funcții de testnet](/qorex/testnet-features)).
- **Mod dezvoltator** - un comutator din Setări, dezactivat implicit. Când este activ, în bara de jos apare un tab **Dezvoltator** cu o pictogramă `</>`. Vezi [Modul dezvoltator](/qorex/developer-mode).
- **Blocare automată** - QoreX cere din nou biometria sau PIN-ul după un timp fără utilizare; setează intervalul (1, 5, 15, 30, 60 sau 240 de minute, implicit 15) cu **Blochează automat după** în Setări → Securitate.
- **Starea rețelei** - dacă ultimul bloc al lanțului este mai vechi de un minut sau rețeaua nu poate fi accesată, un banner anunță acest lucru.

## Opțional: revendică un @handle

După ce portofelul tău este creat, poți revendica un **@handle** unic (de exemplu `@liviu`) astfel încât oamenii să îți poată trimite fonduri folosind un nume, nu o adresă `qor1…`. Revendicarea necesită un [cont autentificat](/qorex/account-and-dashboard#sign-in) și se face **în aplicația mobilă** (extensia de browser te trimite acolo). Este opțională și poate fi omisă - portofelul tău nu depinde niciodată de ea. Un handle se leagă de o adresă anume, nu de portofel în ansamblu, ceea ce contează odată ce ai mai mult de un cont - vezi [Mai multe conturi dintr-o singură frază](/qorex/account-and-dashboard#accounts) și [@handle](/qorex/account-and-dashboard#handle).

## Limbă

QoreX este disponibil în zece limbi - engleză, română, germană, spaniolă, franceză, italiană, turcă, arabă, japoneză și coreeană - și urmează automat limba telefonului tău, revenind la engleză pentru orice altceva. Poți suprascrie oricând limba detectată din **Setări → Limbă**; alegerea limbii arabe comută interfața și la scriere de la dreapta la stânga.

## Pașii următori

- [Trimite și Primește](/qorex/send-and-receive) - realizează primul tău transfer semnat hibrid.
- [Securitate și Recuperare](/qorex/security-and-recovery) - configurează recuperarea socială pentru a nu rămâne blocat niciodată.
- [Portofoliu și Staking](/qorex/portfolio-and-staking) - urmărește activele și câștigă recompense de staking.

## Unde este publicată {#where-published}

| Magazin | Listare | Link |
|---|---|---|
| App Store (iOS) | **QoreX** | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Google Play (Android) | `network.qore.qorex` | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |

Codul sursă al aplicației mobile nu este public. Instalează întotdeauna din listarea oficială.

## Limite și probleme cunoscute {#limits}

- **Swap-ul nu este disponibil**: este dezactivat până când există lichiditate în pool-uri și nu apare pe iOS.
- **Semnatarii conectați** (Phantom sau MetaMask ca cheie conectată cu limite de cheltuieli) nu sunt încă disponibili în QoreX.
- **Doar testnet:** trimiterea pe alt lanț prin IBC, ecranul QoreChain Bridge și Solana pe QoreChain. Vezi [Funcții de testnet](/qorex/testnet-features).
- **Aplicația nu arată fraza cât timp creează portofelul.** Dezvăluie-o imediat din Setări → Securitate. Cardul Starea copiei de siguranță urmărește doar recuperarea socială; **Protecția banilor mei** arată dacă backupul tău a fost verificat.
- **Transferurile EVM și SVM nu sunt acoperite de semnătura hibridă.** O tranzacție EVM poartă doar o semnătură secp256k1 și necesită o fereastră de acces deschisă; transferurile pe rețele externe sunt doar clasice.
- **Push-ul** este doar pe mainnet; pe iPhone consideră-l „best effort".
- Un portofel pierdut, fără frază notată și fără recuperare socială, nu poate fi recuperat de nimeni.
