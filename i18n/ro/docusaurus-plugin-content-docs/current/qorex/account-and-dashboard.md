---
slug: /qorex/account-and-dashboard
title: Cont și Dashboard
sidebar_label: Cont și Dashboard
sidebar_position: 6
---

# Cont și Dashboard

Această pagină acoperă contul opțional QoreX: autentificarea, mai multe conturi dintr-o singură frază de recuperare, @handle-urile, asocierea cu Dashboard și ștergerea contului. Este destinată utilizatorilor de mobil care doresc aceste facilități; niciuna nu este necesară pentru a deține sau a trimite QOR.

QoreX funcționează **complet fără cont** - cheile tale nu depind niciodată de unul. Autentificarea adaugă facilități precum cererile de plată și asocierea cu Dashboard și este **necesară pentru a revendica un @handle**. Autentificarea se face prin e-mail sau prin Apple ori Google - vezi mai jos.

## Autentificare {#sign-in}

Te poți autentifica din **Sign in** aflat în fila Home sau în timpul configurării inițiale. Metode:

- **Cod pe e-mail** - introdu adresa de e-mail și primești un cod de unică folosință. După această autentificare, QoreX îți propune să adaugi o **passkey** pentru autentificări instantanee ulterioare (Face ID / Touch ID / PIN). Este o passkey de *cont* - nu atinge niciodată cheile portofelului tău.
- **Passkey** - dacă ai înregistrat una anterior.
- **Sign in with Apple** *(doar iOS)* - Apple partajează doar numele și adresa ta de e-mail și îți permite să îți ascunzi adresa reală în spatele uneia de tip private-relay.
- **Continue with Google** - un singur pas nativ prin fereastra de autentificare a sistemului (aplicația nu iese niciodată către un browser).
- **Continue with QORECHAIN Dashboard** - autentifică-te cu un cont Dashboard existent (inclusiv login-ul său Google) și importă-ți profilul.

:::note
Oferta de passkey apare doar după autentificarea cu **cod pe e-mail**. Când te autentifici cu un furnizor de identitate (Apple, Google sau Dashboard), acel furnizor își gestionează propria autentificare, așa că o passkey nu poate fi atașată acelor conturi.
:::

## Mai multe conturi dintr-o singură frază {#accounts}

Settings → **Your accounts** îți permite să creezi și să comuți între până la **20 de conturi** per portofel, toate derivate din aceeași frază de recuperare de 24 de cuvinte (nu mai există nimic suplimentar de salvat). Fiecare cont este propria sa adresă `qor1…`, cu propriul sold, propriul @handle opțional (un handle se leagă de o **adresă**, nu de portofel) și, după prima sa trimitere, propria cheie ML-DSA-87. Atinge un cont pentru a-l face pe cel în uz. Contul activ la un moment dat este cel folosit de Send, Receive, Staking și de browserul de dApp-uri - comutarea mută totul odată cu el, iar aplicația arată pe ce cont te afli ori de câte ori există mai mult de unul. Conturile sunt numerotate *Account 1, 2, …*; nu pot fi redenumite. Extensia de browser are același ecran - vezi [Mai multe conturi dintr-o singură frază](/qorex/browser-extension#wallet).

- **Add an account** adaugă următorul cont pe aceeași frază. Un cont nou își înregistrează propria cheie ML-DSA-87 la prima trimitere, ceea ce costă o mică taxă de rețea unică.
- **Add an Ethereum account (coin 60)** este pentru o frază de recuperare folosită prima dată în MetaMask sau în Dashboard-ul QoreChain - acolo se află fondurile ei. Folosește calea Ethereum `m/44'/60'` și este etichetat *Ethereum · coin 60*; adresa sa `0x…` este aceeași pe orice rețea EVM și este aceeași cheie ca acel cont QoreChain. Vezi [Restaurarea unei fraze din MetaMask sau din Dashboard](/qorex/getting-started#restore-dashboard).
- **Restaurarea** unei fraze pe un dispozitiv nou readuce doar **Account 1**; folosește **Add an account** (și **Add an Ethereum account (coin 60)**) pentru a le readuce pe celelalte. Ecranul Addresses (**Settings → Your addresses**) este separat: listează fiecare cont din acest portofel, plus adresele read-only legate din alte portofele.

## @handle {#handle}

Revendică un nume unic (de exemplu `@liviu`) legat de adresa ta `qor1…` prin **două semnături**: o atestare ed25519 de registru și propria ta semnătură secp256k1. Oricine poate apoi trimite către @handle-ul tău. Rezolvarea este **verify-then-pin** (trust-on-first-use): QoreX reține adresa pe care a rezolvat-o prima dată, astfel încât, dacă cheia unui handle este schimbată vreodată pe tăcute, QoreX semnalează acest lucru.

Pentru că un handle se leagă de o adresă, nu de portofelul tău, revendicarea unuia este **per adresă** - dacă ai [mai multe conturi](#accounts), fiecare poate avea propriul @handle, iar revendicarea unuia pentru un cont nu dă automat un nume și celorlalte. Revendicarea necesită un cont autentificat și se face **în aplicația mobilă**. În extensia de browser poți plăti către un handle (căutările funcționează în extensia 0.3.7 și în versiunile ulterioare), dar nu poți revendica unul - extensia te trimite la aplicație. Conturile de tip Ethereum (coin 60) nu au handle. Numele QoreChain care imită proiectul sunt rezervate: un handle nou care imită proiectul (numele sale de brand sau cuvinte de încredere precum *official*, *support*, *airdrop* sau *treasury*, inclusiv scrieri asemănătoare) este refuzat. Proprietarii existenți își pot șterge în continuare handle-ul.

Dacă registrul de handle-uri este temporar inaccesibil, ecranul se reduce la **„Handles coming soon”** și restul continuă să funcționeze; handle-urile se reactivează automat când registrul revine.

:::note Revendicarea unui handle vs. asocierea cu Dashboard
Acestea sunt două acțiuni separate, fără legătură între ele. Revendicarea unui @handle le permite **altor persoane să îți trimită după nume** - nu face nimic altceva în plus. Asocierea cu Dashboard (mai jos) conectează portofelul tău la un cont Dashboard, astfel încât cele două să poată afișa aceleași date. Poți face oricare dintre ele fără cealaltă.
:::

## Cont asociat {#linked-account}

**Settings → Linked account** conectează portofelul tău QoreX și contul tău Dashboard în ambele sensuri:

1. Introdu codul de 8 caractere afișat de Dashboard, **sau** generează unul în QoreX (valabil 10 minute) și tastează-l în Dashboard.
2. Dacă ai [mai multe conturi](#accounts), fereastra proprie de aprobare a QoreX îți permite să alegi **care anume** se asociază - nu presupune că e vorba de contul activ în prezent.
3. Odată asociat, @handle-ul tău și adresele conectate apar pe amândouă.
4. Poți dezasocia oricând.

Autentificarea *prin* **Continue with Dashboard** le leagă implicit - nu mai ai nimic suplimentar de făcut.

## Integrarea cu Dashboard {#dashboard}

Cu Dashboard conectat:

- **Connect with QoreX** din Dashboard îl asociază cu portofelul tău printr-un deep link `qorex://connect` plus o dovadă de proprietate semnată.
- **Transferurile inițiate în Dashboard** ajung în QoreX ca cereri `qorex://tx`. Sunt decodate, afișate integral și semnate **doar în aplicație** după aprobarea biometrică - și numai de la adresa derivată proprie a aplicației. Pentru că o adresă `qor1…` este la fel de validă atât pe mainnet, cât și pe testnet, fiecare cerere inițiată din Dashboard specifică rețeaua vizată, iar QoreX refuză să acționeze asupra ei dacă aceasta nu corespunde rețelei la care ești conectat în prezent - nu comută niciodată rețeaua în numele unei cereri.
- Dacă o cerere de Connect sau de transfer sosește în timp ce **nu ești autentificat**, QoreX îți oferă un pas integrat **„Sign in to Dashboard”** ca să poți continua fără să te blochezi.
- **Your addresses (Settings)** - listează fiecare cont derivat din acest portofel, plus adresele **read-only** pe care le-ai legat din alte portofele (Keplr / MetaMask / Phantom). Intrările read-only sunt etichetate cu portofelul care le-a creat; dacă încerci să trimiți de la una, ți se explică faptul că trebuie să trimiți din portofelul care a creat-o.

## Ștergerea contului {#delete-account}

Settings → **Delete account** (intrarea roșie din partea de jos). După o confirmare și o deblocare biometrică, QoreX șterge definitiv: portofelul și cheile private de pe acest dispozitiv; @handle-ul tău din registrul QoreX (dacă există); contul tău QoreChain Dashboard (dacă te-ai autentificat); și configurarea de recuperare socială (dacă a fost configurată). Nu poate fi anulată. Deoarece QoreX este non-custodial, **dacă nu ți-ai salvat fraza de recuperare, vei pierde accesul la orice fonduri** - salvează-o mai întâi. Ștergerile de pe server se fac în regim best-effort; ștergerea de pe dispozitiv se finalizează întotdeauna și readuce aplicația la ecranul de la prima pornire.

## Pași următori

- [Securitate și recuperare](/qorex/security-and-recovery) - salvare, recuperare și fereastra de acces EVM.
- [dApp Browser](/qorex/dapp-browser) - conectează-te la aplicații din interiorul QoreX.
