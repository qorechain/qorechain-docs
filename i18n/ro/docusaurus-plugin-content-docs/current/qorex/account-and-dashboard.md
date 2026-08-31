---
slug: /qorex/account-and-dashboard
title: Cont și Dashboard
sidebar_label: Cont și Dashboard
sidebar_position: 6
---

# Cont și Dashboard

QoreX funcționează **complet fără cont** — cheile tale nu depind niciodată de unul. Autentificarea adaugă doar facilități precum @handle-uri, cereri de plată și asocierea cu Dashboard.

## Autentificare {#sign-in}

Te poți autentifica din **Sign in** aflat în fila Home sau în timpul configurării inițiale. Metode:

- **Cod pe e-mail** — introdu adresa de e-mail și primești un cod de unică folosință. După această autentificare, QoreX îți propune să adaugi o **passkey** pentru autentificări instantanee ulterioare (Face ID / Touch ID / PIN). Este o passkey de *cont* — nu atinge niciodată cheile portofelului tău.
- **Passkey** — dacă ai înregistrat una anterior.
- **Continue with Google** — un singur pas nativ prin fereastra de autentificare a sistemului (aplicația nu iese niciodată către un browser).
- **Continue with QORECHAIN Dashboard** — autentifică-te cu un cont Dashboard existent (inclusiv login-ul său Google) și importă-ți profilul.

:::note
Oferta de passkey apare doar după autentificarea cu **cod pe e-mail**. Când te autentifici cu un furnizor de identitate (Google sau Dashboard), acel furnizor își gestionează propria autentificare, așa că o passkey nu poate fi atașată acelor conturi.
:::

## Mai multe conturi dintr-o singură frază {#accounts}

Settings → **Your accounts** (găsit și sub numele **Addresses**) îți permite să creezi, comuți și redenumești până la **20 de conturi**, toate derivate din aceeași frază de recuperare de 24 de cuvinte (nu mai există nimic suplimentar de salvat). Fiecare cont este propria sa adresă distinctă `qor1…`, cu propriul sold și — pentru că un handle se leagă de o **adresă**, nu de portofel în ansamblu — propriul @handle opțional. Contul activ la un moment dat este cel folosit de Send, Receive, Staking și de browserul de dApp-uri — comutarea mută totul odată cu el, iar aplicația arată pe ce cont te afli ori de câte ori există mai mult de unul. Începând cu versiunea **0.2.2**, extensia de browser are și ea această funcție — vezi [Mai multe conturi dintr-o singură frază](/qorex/browser-extension#wallet).

O singură frază de recuperare restaurează toate conturile, dar fiecare cont își înregistrează propria cheie post-cuantică ML-DSA-87 pe blockchain la prima tranzacție — la fel ca la un portofel obișnuit cu un singur cont — astfel încât deschiderea și folosirea unui cont nou presupune costul de înregistrare a cheii, specific acelui cont.

## @handle {#handle}

Revendică un nume unic (de exemplu `@liviu`) legat de adresa ta prin **semnături duble** (o semnătură ed25519 de registru + propria ta semnătură secp256k1). Oricine poate apoi trimite către @handle-ul tău. Rezolvarea este **verify-then-pin** (trust-on-first-use), astfel încât, dacă cheia unui handle este schimbată vreodată pe tăcute, QoreX semnalează acest lucru.

Pentru că un handle se leagă de o adresă, nu de portofelul tău, revendicarea unuia este **per adresă** — dacă ai [mai multe conturi](#accounts), fiecare poate avea propriul @handle, iar revendicarea unuia pentru un cont nu dă automat un nume și celorlalte. Extensia de browser poate, de asemenea, revendica un handle pentru propria sa adresă unică, direct din popup.

Dacă registrul de handle-uri este temporar inaccesibil, ecranul se reduce la **„Handles coming soon”** și restul continuă să funcționeze; handle-urile se reactivează automat când registrul revine.

:::note Revendicarea unui handle vs. asocierea cu Dashboard
Acestea sunt două acțiuni separate, fără legătură între ele. Revendicarea unui @handle le permite **altor persoane să îți trimită după nume** — nu face nimic altceva în plus. Asocierea cu Dashboard (mai jos) conectează portofelul tău la un cont Dashboard, astfel încât cele două să poată afișa aceleași date. Poți face oricare dintre ele fără cealaltă.
:::

## Cont asociat {#linked-account}

**Settings → Linked account** conectează portofelul tău QoreX și contul tău Dashboard în ambele sensuri:

1. Introdu codul de 8 caractere afișat de Dashboard, **sau** generează unul în QoreX (valabil 10 minute) și tastează-l în Dashboard.
2. Dacă ai [mai multe conturi](#accounts), fereastra proprie de aprobare a QoreX îți permite să alegi **care anume** se asociază — nu presupune că e vorba de contul activ în prezent.
3. Odată asociat, @handle-ul tău și adresele conectate apar pe amândouă.
4. Poți dezasocia oricând.

Autentificarea *prin* **Continue with Dashboard** le leagă implicit — nu mai ai nimic suplimentar de făcut.

## Integrarea cu Dashboard {#dashboard}

Cu Dashboard conectat:

- **Connect with QoreX** din Dashboard îl asociază cu portofelul tău printr-un deep link `qorex://connect` plus o dovadă de proprietate semnată.
- **Transferurile inițiate în Dashboard** ajung în QoreX ca cereri `qorex://tx`. Sunt decodate, afișate integral și semnate **doar în aplicație** după aprobarea biometrică — și numai de la adresa derivată proprie a aplicației. Pentru că o adresă `qor1…` este la fel de validă atât pe mainnet, cât și pe testnet, fiecare cerere inițiată din Dashboard specifică rețeaua vizată, iar QoreX refuză să acționeze asupra ei dacă aceasta nu corespunde rețelei la care ești conectat în prezent — nu comută niciodată rețeaua în numele unei cereri.
- Dacă o cerere de Connect sau de transfer sosește în timp ce **nu ești autentificat**, QoreX îți oferă un pas integrat **„Sign in to Dashboard”** ca să poți continua fără să te blochezi.
- **Your addresses (Settings)** — listează fiecare cont derivat din acest portofel, plus adresele **read-only** pe care le-ai legat din alte portofele (Keplr / MetaMask / Phantom). Intrările read-only sunt etichetate cu portofelul care le-a creat; dacă încerci să trimiți de la una, ți se explică faptul că trebuie să trimiți din portofelul care a creat-o.

## Pași următori

- [Securitate și recuperare](/qorex/security-and-recovery) — semnatarii asociați și limitele de cheltuire se bazează pe această asociere.
- [dApp Browser](/qorex/dapp-browser) — conectează-te la aplicații din interiorul QoreX.
