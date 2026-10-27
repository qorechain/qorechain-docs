---
slug: /qorex/dapp-browser
title: Browser dApp
sidebar_label: Browser dApp
sidebar_position: 7
---

# Browser dApp (mobil)

QoreX include un **browser dApp** integrat în aplicație, astfel încât să poți folosi aplicațiile QoreChain fără să părăsești portofelul, fiecare semnătură fiind aprobată explicit. Este pentru utilizatorii de mobil care vor să folosească o aplicație web fără să instaleze altceva și pentru dezvoltatorii care își testează aplicația în portofelul mobil.

## Inovații {#innovations}

- **Conexiuni cu domeniu de sesiune.** O singură aprobare per origine, iar fiecare conexiune se încheie când închizi browserul.
- **Semnături decodate, protejate biometric.** Fiecare semnătură este propria sa aprobare, cu payload-ul decodat; ce nu poate decoda QoreX, refuză.
- **`signAndBroadcast`.** O pagină trimite mesajele; QoreX le afișează, adaugă stratul ML-DSA-87 pe care îl poate crea doar portofelul și transmite tranzacția.
- **Descoperire fără preluare.** QoreX se anunță prin EIP-6963 și nu suprascrie niciodată `window.ethereum` sau `window.keplr` ale altui portofel.

## Cum accesezi {#how-to-access}

Browserul dApp face parte din aplicația mobilă: instaleaz-o din App Store (iOS 15.1 sau mai nou) sau din Google Play (Android 7.0 sau mai nou); linkurile sunt în [prezentarea generală](/qorex/overview#how-to-access). Nu are nevoie de cont. Pentru aplicații dApp pe desktop, folosește [Extensia de browser](/qorex/browser-extension).

## Conectarea la o aplicație dApp {#how-to-use}

Deschide **browserul dApp** din tabul Home și navighează către o aplicație. Scrie sau lipește adresa dApp-ului în caseta **Enter a dApp URL** (doar adresele `https://` se conectează). QoreX injectează furnizorii săi în pagină ca `window.qorex` - un furnizor QoreChain Native (inclusiv `signAndBroadcast`), un furnizor EVM doar pentru citire (doar interogări de cont și de lanț) și un furnizor Solana - și se anunță, de asemenea, prin EIP-6963. Setează `window.ethereum` doar atunci când niciun alt portofel nu a făcut-o și nu suprascrie niciodată alt portofel. Nu există alias `window.keplr`.

- **Conectarea** necesită **o singură aprobare per origine**. Aprobarea dezvăluie site-ului respectiv doar adresa ta publică.
- **Fiecare semnătură** este propria sa aprobare protejată biometric, cu payload-ul **decodat**, astfel încât poți vedea exact ce semnezi - **nu există semnare oarbă**.
- **Toate permisiunile expiră la închiderea browserului** - conexiunile au domeniu de sesiune.
- **Tranzacțiile native trec prin `signAndBroadcast`:** QoreX afișează fiecare mesaj, comisionul și contul de semnare, adaugă stratul ML-DSA-87 și transmite tranzacția. Furnizorul EVM de aici răspunde doar la interogări de cont și de lanț; nu semnează și nu trimite tranzacții EVM. Vezi [Ce afișează fereastra de aprobare](/qorex/security-and-recovery#approvals).

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
- Furnizorul EVM de aici răspunde doar la interogări de cont și de lanț; nu semnează și nu trimite tranzacții sau mesaje EVM. `signArbitrary` (semnarea de mesaje) nu este acceptat.
- `window.qorex.native` este în stil Keplr, nu un înlocuitor direct al Keplr, și nu există alias `window.keplr`.
- Conexiunile nu persistă: se încheie când browserul se închide.
- Q-Day Scanner, recuperarea socială și Legacy sunt în aplicație, nu în extensie.
