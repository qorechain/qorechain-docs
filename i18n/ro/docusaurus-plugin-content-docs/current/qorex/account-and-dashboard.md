---
slug: /qorex/account-and-dashboard
title: Cont și Dashboard
sidebar_label: Cont și Dashboard
sidebar_position: 6
---

# Cont și Dashboard

QoreX funcționează **complet fără cont** — cheile tale nu depind niciodată de unul. Autentificarea adaugă doar facilități precum @handle-uri, cereri de plată și împerecherea cu Dashboard.

## Autentificare {#sign-in}

Te poți autentifica din **Sign in** pe fila Home sau în timpul configurării inițiale. Metode:

- **Cod pe email** — introdu adresa de email și primești un cod de unică folosință. După această autentificare, QoreX îți propune să adaugi o **passkey** pentru autentificări viitoare instantanee (Face ID / Touch ID / PIN). Este o passkey de *cont* — nu atinge niciodată cheile portofelului tău.
- **Passkey** — dacă ai înrolat una anterior.
- **Continue with Google** — un singur salt nativ prin fereastra de autentificare a sistemului (aplicația nu iese niciodată către un browser).
- **Continue with QORECHAIN Dashboard** — autentifică-te cu un cont Dashboard existent (inclusiv autentificarea sa Google) și importă-ți profilul.

:::note
Oferta de passkey apare doar după autentificarea cu **cod pe email**. Când te autentifici cu un furnizor de identitate (Google sau Dashboard), acel furnizor își gestionează propria autentificare, așa că o passkey nu poate fi atașată acelor conturi.
:::

## @handle {#handle}

Revendică un nume unic (de exemplu `@liviu`) legat de adresa ta prin **semnături duble** (o semnătură ed25519 a registrului + propria ta semnătură secp256k1). Oricine îți poate apoi trimite către @handle-ul tău. Rezolvarea se face **verify-then-pin** (trust-on-first-use), astfel încât dacă cheia unui handle este vreodată schimbată în tăcere, QoreX o semnalează.

Dacă registrul de handle-uri este temporar inaccesibil, ecranul degradează la **"Handles coming soon"** și tot restul continuă să funcționeze; handle-urile revin automat atunci când registrul se întoarce.

## Cont conectat {#linked-account}

**Settings → Linked account** conectează portofelul tău QoreX și contul tău Dashboard în ambele sensuri:

1. Introdu codul de 8 caractere afișat de Dashboard, **sau** generează unul în QoreX (valabil 10 minute) și tastează-l în Dashboard.
2. Odată conectate, @handle-ul tău și adresele conectate apar pe ambele.
3. Deconectează oricând.

Autentificarea *prin* **Continue with Dashboard** le leagă implicit — nu ai nimic în plus de făcut.

## Integrare Dashboard {#dashboard}

Cu Dashboard conectat:

- **Connect with QoreX** pe Dashboard îl împerechează cu portofelul tău printr-un deep link `qorex://connect` plus o dovadă de proprietate semnată.
- **Transferurile inițiate pe Dashboard** ajung în QoreX ca cereri `qorex://tx`. Ele sunt decodate, afișate integral și semnate **doar în aplicație** după aprobarea biometrică — și numai de la adresa derivată proprie a aplicației.
- **Adresele tale (Settings)** — listează fiecare cont derivat din acest portofel, plus adrese **read-only** pe care le-ai conectat din alte portofele (Keplr / MetaMask / Phantom). Intrările read-only sunt etichetate cu portofelul care le-a creat; încercarea de a trimite dintr-una explică faptul că trebuie să trimiți din portofelul care a creat-o.

## Pași următori

- [Securitate și Recuperare](/qorex/security-and-recovery) — semnatarii conectați și limitele de cheltuire se construiesc pe această împerechere.
- [Browser dApp](/qorex/dapp-browser) — conectează-te la aplicații din interiorul QoreX.
