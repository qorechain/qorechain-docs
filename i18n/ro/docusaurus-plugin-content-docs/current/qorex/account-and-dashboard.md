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

## @handle {#handle}

Revendică un nume unic (de exemplu `@liviu`) legat de adresa ta prin **semnături duble** (o semnătură ed25519 de registru + propria ta semnătură secp256k1). Oricine poate apoi trimite către @handle-ul tău. Rezolvarea este **verify-then-pin** (trust-on-first-use), astfel încât, dacă cheia unui handle este schimbată vreodată pe tăcute, QoreX semnalează acest lucru.

Dacă registrul de handle-uri este temporar inaccesibil, ecranul se reduce la **„Handles coming soon”** și restul continuă să funcționeze; handle-urile se reactivează automat când registrul revine.

## Cont asociat {#linked-account}

**Settings → Linked account** conectează portofelul tău QoreX și contul tău Dashboard în ambele sensuri:

1. Introdu codul de 8 caractere afișat de Dashboard **sau** generează unul în QoreX (valabil 10 minute) și tastează-l în Dashboard.
2. După asociere, @handle-ul tău și adresele conectate apar pe amândouă.
3. Poți dezasocia oricând.

Autentificarea *prin* **Continue with Dashboard** le leagă implicit — nu mai ai nimic suplimentar de făcut.

## Integrarea cu Dashboard {#dashboard}

Cu Dashboard conectat:

- **Connect with QoreX** din Dashboard îl asociază cu portofelul tău printr-un deep link `qorex://connect` plus o dovadă de proprietate semnată.
- **Transferurile inițiate în Dashboard** ajung în QoreX ca cereri `qorex://tx`. Sunt decodate, afișate integral și semnate **doar în aplicație** după aprobarea biometrică — și numai de la adresa derivată proprie a aplicației.
- Dacă o cerere de Connect sau de transfer sosește în timp ce **nu ești autentificat**, QoreX îți oferă un pas integrat **„Sign in to Dashboard”** ca să poți continua fără să te blochezi.
- **Your addresses (Settings)** — listează fiecare cont derivat din acest portofel, plus adresele **read-only** pe care le-ai legat din alte portofele (Keplr / MetaMask / Phantom). Intrările read-only sunt etichetate cu portofelul care le-a creat; dacă încerci să trimiți de la una, ți se explică faptul că trebuie să trimiți din portofelul care a creat-o.

## Pași următori

- [Securitate și recuperare](/qorex/security-and-recovery) — semnatarii asociați și limitele de cheltuire se bazează pe această asociere.
- [dApp Browser](/qorex/dapp-browser) — conectează-te la aplicații din interiorul QoreX.
