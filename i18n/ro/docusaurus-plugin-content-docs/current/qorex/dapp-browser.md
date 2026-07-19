---
slug: /qorex/dapp-browser
title: Browser dApp
sidebar_label: Browser dApp
sidebar_position: 7
---

# Browser dApp (mobil)

QoreX include un **browser dApp** integrat în aplicație, astfel încât să poți folosi aplicațiile QoreChain fără să părăsești portofelul, fiecare semnătură fiind aprobată explicit.

## Conectarea la o aplicație dApp

Deschide **browserul dApp** din tabul Home și navighează către o aplicație. QoreX injectează furnizorii săi în pagină — un furnizor de conectare QoreChain, un furnizor EVM doar pentru citire și aliasuri politicoase `keplr` / `ethereum` care **nu deturnează niciodată** alte portofele reale.

- **Conectarea** necesită **o singură aprobare per origine**. Aprobarea dezvăluie site-ului respectiv doar adresa ta publică.
- **Fiecare semnătură** este propria sa aprobare protejată biometric, cu payload-ul **decodat**, astfel încât poți vedea exact ce semnezi — **nu există semnare oarbă**.
- **Toate permisiunile expiră la închiderea browserului** — conexiunile au domeniu de sesiune.

## Q-Day Scanner

Din butoanele rapide ale tabului Home poți deschide și **Q-Day Scanner**: introdu orice adresă pentru a obține raportul său de expunere cuantică — care fonduri se află pe chei exclusiv clasice și care sunt deja protejate post-cuantic. Vezi [Securitate și recuperare](/qorex/security-and-recovery#q-day-scanner).

## Referință rapidă pentru setări

Alte controale utile din **Settings**:

- **Security dashboard** → [Securitate și recuperare](/qorex/security-and-recovery)
- **Your addresses** și **Linked account** → [Cont și Dashboard](/qorex/account-and-dashboard)
- **Use testnet (developers)** — comută la testnet-ul `qorechain-diana` (EVM chain ID 9800); aplicația se re-leagă în timp real, fără repornire. Valoarea implicită este întotdeauna mainnet.
- **Portfolio animation** — comută fundalul Aurora.
- **Network status** — afișează „Connected to …” cu endpoint-urile active.

## Note despre platforme

- **iOS** — Face ID (un mesaj de utilizare apare la prima folosire), un seif Secure Enclave, autentificare prin fereastra de autentificare a sistemului și o permisiune de cameră pentru asocierea dispozitivelor și scanarea codurilor QR.
- **Android** — BiometricPrompt cu un Keystore StrongBox, deep link-uri înregistrate pentru fluxurile `qorex://` (callback de autentificare, connect, tx, link) și o permisiune de cameră pentru asocierea dispozitivelor.

Pentru aplicații dApp pe desktop, folosește în schimb [Extensia de browser](/qorex/browser-extension).
