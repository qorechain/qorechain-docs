---
slug: /qorex/dapp-browser
title: Browser dApp
sidebar_label: Browser dApp
sidebar_position: 7
---

# Browser dApp (mobil)

QoreX include un **browser dApp** integrat în aplicație, astfel încât să poți folosi aplicațiile QoreChain fără să părăsești portofelul, fiecare semnătură fiind aprobată explicit. Este pentru utilizatorii de mobil care vor să folosească o aplicație web fără să instaleze altceva și pentru dezvoltatorii care își testează aplicația în portofelul mobil.

## Inovații {#innovations}

- **O aprobare per site, mereu revocabilă.** Fiecare origine este aprobată separat; site-urile conectate sunt salvate pe acest dispozitiv, per portofel, și poți revoca oricare dintre ele în [Protecția banilor tăi](/qorex/security-and-recovery#protection).
- **Semnături decodate, protejate biometric.** Fiecare semnătură este propria sa aprobare, cu payload-ul decodat; ce nu poate decoda QoreX, refuză.
- **`signAndBroadcast`.** O pagină trimite mesajele; QoreX le afișează, adaugă stratul ML-DSA-87 pe care îl poate crea doar portofelul și transmite tranzacția.
- **Semnare EVM și de mesaje în browser.** dApp-urile EVM pot semna mesaje, date tipizate și tranzacții pe QoreChain, cu efectul fiecăreia decodificat și simulat în prealabil, iar orice pagină poate cere o semnătură de mesaj care poartă și o jumătate ML-DSA-87.
- **Deschide o pagină dintr-un link.** Un link `browse` deschide pagina ta direct în browserul dApp, iar pagina de start păstrează pe dispozitiv site-urile tale favorite și recente.
- **Descoperire fără preluare.** QoreX se anunță prin EIP-6963 și nu suprascrie niciodată `window.ethereum` sau `window.keplr` ale altui portofel.

## Cum accesezi {#how-to-access}

Browserul dApp face parte din aplicația mobilă: instaleaz-o din App Store (iOS 15.1 sau mai nou) sau din Google Play (Android 7.0 sau mai nou); linkurile sunt în [prezentarea generală](/qorex/overview#how-to-access). Nu are nevoie de cont. Pentru aplicații dApp pe desktop, folosește [Extensia de browser](/qorex/browser-extension).

## Conectarea la o aplicație dApp {#how-to-use}

Deschide **browserul dApp** din tabul Home și navighează către o aplicație. Scrie sau lipește adresa dApp-ului în caseta **Enter a dApp URL** (doar adresele `https://` se conectează). QoreX injectează furnizorii săi în pagină ca `window.qorex` - un furnizor QoreChain Native (inclusiv `signAndBroadcast`, `signDirect` și semnarea de mesaje), un furnizor EVM și un obiect furnizor Solana - și se anunță, de asemenea, prin EIP-6963. Setează `window.ethereum` doar atunci când niciun alt portofel nu a făcut-o și nu suprascrie niciodată alt portofel. Nu există alias `window.keplr`. Dezvoltatori: vezi [Integrează un dApp cu QoreX](/qorex/dapp-integration).

### Site-uri favorite și recente {#favourites}

Pagina de start a browserului listează site-urile tale **Favourites** și pe cele **Recent** (ultimele 8). Atinge steaua din bara de adrese pentru a păstra pagina deschisă ca favorită (atinge din nou pentru a o elimina) și folosește butonul home pentru a reveni la listă. **Clear** golește lista celor recente. O pagină deschisă dintr-un [link browse](#browse-links) contează ca vizită. Ambele liste rămân pe acest telefon, salvate fără query-ul sau fragmentul paginii.

### Deschide o pagină dintr-un link {#browse-links}

Un link de pe web poate deschide o pagină în browserul dApp: `https://link.qore.network/browse?url=<encoded https address>` sau `qorex://browse?url=<encoded https address>`. QoreX cere mai întâi solicitarea biometrică ce deschide browserul dApp. Refuză o adresă care nu este `https://` pe un nume de domeniu sau care are un port, un nume de utilizator, o adresă IP ori `localhost`. Linkul nu oferă paginii nimic: ea trebuie în continuare să ceară conectarea, iar fiecare semnătură trece în continuare prin foaia de aprobare. Fără portofel pe telefon, aplicația rămâne la onboarding. Vezi [Linkuri pe care le poate genera un serviciu](/qorex/dapp-integration#links).

- **Conectarea** necesită **o singură aprobare per origine**. Aprobarea dezvăluie site-ului respectiv doar adresa ta publică.
- **Fiecare semnătură** este propria sa aprobare protejată biometric, cu payload-ul **decodat**, astfel încât poți vedea exact ce semnezi - **nu există semnare oarbă**.
- **Conexiunile durează până când le revoci.** Începând cu 1.2.5, adresa site-ului este salvată pe acest dispozitiv, per portofel. Vezi și revocă site-urile conectate în [Protecția banilor tăi](/qorex/security-and-recovery#protection). O conexiune nu semnează niciodată nimic de la sine: fiecare semnătură are în continuare nevoie de propria aprobare.
- **Tranzacțiile native trec prin `signAndBroadcast`:** QoreX afișează fiecare mesaj, comisionul și contul de semnare, adaugă stratul ML-DSA-87 și transmite tranzacția. Vezi [Ce afișează fereastra de aprobare](/qorex/security-and-recovery#approvals).
- **dApp-urile EVM** pot cere `personal_sign`, date tipizate și tranzacții pe QoreChain. Aprobarea le decodifică și arată ce face tranzacția cu soldul tău, acolo unde rețeaua permite. Pe lane-ul EVM al QoreChain, aprobarea deschide și fereastra scurtă de autorizare de care are nevoie tranzacția și numește fiecare contract pe care îl admite; vezi [Fereastra de acces EVM](/qorex/security-and-recovery#evm-window). Doar conturile importate din MetaMask pot trimite pe acel lane.
- **Semnarea de mesaje:** o pagină îți poate cere să semnezi un mesaj; îl vezi mai întâi în întregime.
- **Rețea:** o pagină nu poate schimba rețeaua. Schimb-o chiar în QoreX (vezi setările de mai jos), iar pagina trebuie să fie pe aceeași rețea ca portofelul.

## Q-Day Scanner

Din butoanele rapide ale tabului Home poți deschide și **Q-Day Scanner**: introdu orice adresă de Bitcoin sau Ethereum pentru a obține un raport de expunere. Vezi [Securitate și recuperare](/qorex/security-and-recovery#q-day-scanner).

## Referință rapidă pentru setări

Alte intrări utile din **Settings**:

- **Security** → [Securitate și recuperare](/qorex/security-and-recovery)
- **Language** - urmează implicit telefonul; 10 limbi
- **Take the tour again** - cinci carduri scurte despre ce face QoreX și unde se află lucrurile
- **Coins and networks** - tot ce poate deține și trimite portofelul astăzi
- **Wallets** - mai multe fraze de recuperare pe acest telefon - vezi [Mai multe portofele](/qorex/getting-started#several-wallets)
- **Your accounts** și **Your addresses** → [Cont și Dashboard](/qorex/account-and-dashboard)
- **Claim your @handle** și **Linked account** → [Cont și Dashboard](/qorex/account-and-dashboard)
- **Use testnet (developers)** - comută la testnet-ul `qorechain-diana` (EVM chain ID 9800); aplicația se re-leagă în timp real, fără repornire. Valoarea implicită este întotdeauna mainnet. Soldurile de pe testnet nu afișează valoare în USD.
- **Developer mode** - dezactivat implicit; adaugă un tab Developer cu unelte pentru cei care construiesc pe QoreChain. Vezi [Modul dezvoltator](/qorex/developer-mode).
- **Portfolio animation** - comută fundalul Aurora.
- **Delete account** → [Șterge-ți contul](/qorex/account-and-dashboard#delete-account)
- **Connected to** - afișează rețeaua activă și chain ID-ul acesteia.

## Note despre platforme

- **iOS** (iOS 15.1 sau mai nou) - Face ID (un mesaj de utilizare apare la prima folosire), un seif Secure Enclave, autentificare prin fereastra de autentificare a sistemului și o permisiune de cameră pentru asocierea dispozitivelor și scanarea codurilor QR.
- **Android** (Android 7.0 sau mai nou) - BiometricPrompt cu un Keystore StrongBox, deep link-uri înregistrate pentru fluxurile `qorex://` (callback de autentificare, connect, tx, link) și o permisiune de cameră pentru asocierea dispozitivelor.

Pentru aplicații dApp pe desktop, folosește în schimb [Extensia de browser](/qorex/browser-extension).

## Unde este publicat {#where-published}

Browserul dApp vine în interiorul aplicației mobile QoreX (App Store și Google Play); vezi [Unde este publicată](/qorex/overview#where-published) pentru listări și versiunile curente. Nu este o descărcare separată.

## Limite și probleme cunoscute {#limits}

- Se conectează doar adresele `https://`.
- Browserul din aplicație semnează doar pe rețeaua activă a QoreChain și emite doar evenimentul EVM `connect`: este închis pentru a comuta contul sau rețeaua. Nu semnează tranzacții Solana și nu are o rețea Ethereum.
- `window.qorex.native` este în stil Keplr, nu un înlocuitor direct al Keplr, și nu există alias `window.keplr`. Semnarea Amino este refuzată.
- Q-Day Scanner, recuperarea socială și Legacy sunt în aplicație, nu în extensie.
