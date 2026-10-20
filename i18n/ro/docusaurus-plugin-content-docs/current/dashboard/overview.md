---
slug: /dashboard/overview
title: Prezentare generală a Dashboard-ului și primii pași
sidebar_label: Prezentare generală și primii pași
sidebar_position: 1
---

# Prezentare generală a Dashboard-ului și primii pași

QoreChain Dashboard, disponibil la **[dashboard.qorechain.io](https://dashboard.qorechain.io)**, este aplicația web oficială pentru a folosi QoreChain direct din browser. Dintr-un singur loc poți explora chain-ul, gestiona un portofel, schimba tokenuri, genera și audita smart contracte, delega la validatori, revendica tokenuri de testnet, finaliza quest-uri și ajunge la uneltele rețelei.

Tot ce se află în această secțiune este un ghid pentru utilizator: ce face fiecare pagină și cum se folosește. Nu este necesară nicio instalare — Dashboard-ul rulează integral în browser.

## Ce poți face

| Zonă | Pentru ce este |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | Răsfoiește blocuri, tranzacții, adrese și validatori. |
| **[Wallet](/dashboard/wallet)** | Vezi-ți soldul și istoricul și primește QOR — cu propriul portofel (non-custodial) pe mainnet, sau cu un portofel de test gestionat de dashboard pe testnet. |
| **[Trade](/dashboard/trade)** | Schimbă tokenuri și oferă lichiditate pe AMM-ul on-chain. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Generează smart contracte cu **QCAI** pe 17 blockchain-uri suportate. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Rulează o analiză de securitate **QCAI** asupra unui smart contract. |
| **[Staking & Validators](/dashboard/staking-and-validators)** | Trece în revistă validatorii și delegă-ți QOR. |
| **[Faucet](/dashboard/faucet)** | Solicită tokenuri de test pe testnet. |
| **[Quests](/dashboard/quests)** | Finalizează sarcini ghidate pentru a învăța cum funcționează rețeaua. |
| **[Tools Hub](/dashboard/tools-hub)** | Unelte pentru operatori și dezvoltatori în șase file: Validator Program, Validator Application, Light Node, Node Registration, Rollups și SDK. |

## Autentificare {#sign-in}

Dashboard-ul are două straturi: un **cont de Dashboard** cu care te autentifici și **portofelul** pe care îl conectezi la el. Majoritatea paginilor necesită mai întâi contul:

- **Pagini care necesită să fii autentificat:** [Wallet](/dashboard/wallet), [Trade](/dashboard/trade), [Faucet](/dashboard/faucet), [Quests](/dashboard/quests), contractele tale salvate în [Smart Contract Creator](/dashboard/smart-contract-creator) și profilul tău. Dacă deschizi una dintre ele fără să fii autentificat, ești trimis la pagina de autentificare.
- **Vizualizarea mainnet-ului fără autentificare:** pe paginile care afișează date de mainnet, inclusiv Explorer-ul din Dashboard, un vizitator neautentificat vede „Sign in to view mainnet” și un buton **Sign in**. Același Explorer este disponibil și fără niciun cont la [explore.qore.network](https://explore.qore.network).
- **Deschise fără cont:** pagina de întâmpinare [Smart Contract Creator](/dashboard/smart-contract-creator) (oferă o generare gratuită) și [Tools Hub](/dashboard/tools-hub). Rularea unui audit de contract necesită un cont.

Navigarea prin Dashboard nu necesită niciodată un portofel; conectarea unuia este un pas separat, descris în continuare.

## Conectează-ți portofelul {#connect-your-wallet}

Majoritatea acțiunilor care schimbă starea on-chain — trimiterea de tokenuri, swap-uri, staking — necesită un portofel conectat. Modul în care Dashboard-ul gestionează cheile depinde de rețea:

- **Mainnet-ul este non-custodial.** Dashboard-ul nu deține niciodată cheile tale de mainnet. Îți conectezi propriul portofel — **QoreX** (portofelul oficial QoreChain, extensie sau aplicație), **Keplr** sau **MetaMask** — iar Dashboard-ul îți citește soldul și istoricul reale direct din chain. Fiecare tranzacție de mainnet este semnată în propriul tău portofel, niciodată de Dashboard. Trimiterea și staking-ul pe **rail-ul Native necesită QoreX**, deoarece conturile QoreChain semnează cu o semnătură hibridă post-cuantică pe care doar QoreX o produce în prezent; Keplr se poate conecta totuși pentru a vizualiza soldul tău pe rail-ul Native. **MetaMask** se conectează pe **rail-ul EVM**; trimiterea de acolo necesită și cheia post-cuantică a contului și o fereastră de autorizare EVM deschisă, care se deschide din QoreX, pe contul în stil Ethereum (coin 60) care împarte cheia cu MetaMask (vezi [Trimiterea cu MetaMask](/dashboard/wallet#send-metamask)).
- **Testnet-ul este custodial.** Dashboard-ul îți gestionează un portofel de test, astfel încât poți experimenta fără nicio configurare și fără nicio valoare reală în joc.

### Conectează-te cu QoreX (recomandat) {#connect-qorex}

QoreX este portofelul oficial QoreChain. Cardul **Connect with QoreX** din Dashboard suportă atât extensia de browser, cât și aplicația mobilă, din același punct de intrare.

1. Deschide [dashboard.qorechain.io](https://dashboard.qorechain.io) și asigură-te că antetul afișează **Mainnet**.
2. Dacă este prima ta vizită pe o pagină de mainnet, citește și acceptă [confirmarea de risc unică](#risk-acknowledgement).
3. Deschide **Wallet** din bara laterală (trebuie să fii autentificat) și selectează **Connect with QoreX** pe cardul **QoreX wallet**.
4. Dacă extensia de browser QoreX este instalată și detectată în acest browser, Dashboard-ul întreabă **„Cum vrei să te conectezi?”** cu două opțiuni, **Browser extension** și **QoreX app**. Alege una — opțiunea este salvată, astfel încât la vizitele următoare acest prompt este omis (un link **Use a different method** este mereu disponibil dacă vrei să schimbi ulterior metoda). Dacă nu este detectată nicio extensie, Dashboard-ul trece direct la fluxul aplicației.
   - **Browser extension**: se deschide propriul pop-up al extensiei, afișând `dashboard.qorechain.io` ca site care solicită conexiunea. Verifică-l și aprobă — asta semnează o dovadă unică că deții adresa ta `qor1...` (nu se mută fonduri). Asocierea se finalizează imediat, în aceeași sesiune de browser.
   - **QoreX app**: Dashboard-ul afișează un cod QR (cu un link **Open QoreX** care deschide aplicația direct dacă navighezi de pe același telefon). Deschide aplicația QoreX, scanează codul QR (sau atinge linkul), verifică cererea de asociere care afișează originea Dashboard-ului și aprob-o cu confirmarea ta biometrică. Dashboard-ul verifică periodic în fundal și finalizează asocierea automat de îndată ce aprobi.
5. Odată aprobat, Dashboard-ul îți afișează adresa `qor1...` și deblochează acțiunile care necesită o semnătură.

Vezi [Wallet](/dashboard/wallet#mainnet) pentru ghidul complet de conectare și trimitere pentru fiecare tip de portofel, și pagina [Account & Dashboard](/qorex/account-and-dashboard#dashboard) din documentația QoreX pentru perspectiva din partea portofelului asupra aceleiași asocieri.

### Conectează-te cu Keplr sau MetaMask

1. Deschide [dashboard.qorechain.io](https://dashboard.qorechain.io) și asigură-te că antetul afișează **Mainnet**.
2. Dacă este prima ta vizită pe o pagină de mainnet, citește și acceptă confirmarea de risc unică (vezi mai jos).
3. Deschide **Wallet** din bara laterală și, sub **or connect another wallet**, selectează **Connect Keplr** sau **Connect MetaMask**.
4. Aprobă conexiunea în portofelul tău.

Odată conectat, pagina Wallet îți afișează adresa (în formă scurtată) împreună cu soldul și istoricul. MetaMask îți permite să primești pe rail-ul EVM și să trimiți de acolo odată ce o fereastră EVM este deschisă (vezi [Trimiterea cu MetaMask](/dashboard/wallet#send-metamask)). Keplr deblochează vizualizarea soldului și istoricului tău pe rail-ul Native — trimiterea și staking-ul pe acesta se fac prin QoreX (vezi mai sus), deoarece conturile QoreChain semnează cu o semnătură hibridă post-cuantică. Paginile doar-citire, precum Explorer, funcționează fără nicio conectare.

Conturile QoreChain folosesc prefixul bech32 `qor`, așa că o adresă conectată arată ca `qor1...` — același cont are și o codificare EVM (`0x...`) și una SVM (base58). Conturile sunt protejate cu criptografie sigură cuantic. Vezi [Wallet Setup](/getting-started/wallet-setup) pentru îndrumări de configurare inițială, și [Add QoreChain to your wallet](/dashboard/wallet#add-network) dacă portofelul tău nu cunoaște încă rețeaua.

### Confirmarea de risc unică {#risk-acknowledgement}

Înainte de a putea folosi orice pagină de mainnet, Dashboard-ul îți cere să accepți o declinare de responsabilitate unică. Aceasta confirmă că înțelegi că tranzacțiile de mainnet mută **fonduri reale**, că Dashboard-ul este **non-custodial** (doar tu îți controlezi cheile) și că tranzacțiile on-chain sunt **ireversibile**. O accepți o singură dată; după aceea, paginile de mainnet se deschid direct.

## Alege-ți rețeaua

Dashboard-ul funcționează pe două rețele. Antetul afișează rețeaua la care ești conectat în prezent și îți permite să comuți; se deschide implicit pe **Mainnet**, iar alegerea ta este reținută în browser.

| Rețea | Chain ID | Când se folosește |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Rețeaua live (live din 7 iunie 2026, rulează chain v3.2.3) pentru valoare reală și utilizare în producție. Non-custodial: îți conectezi propriul portofel. |
| **Testnet** | `qorechain-diana` | Mediu gratuit pentru testare (rulează chain v3.2.4, o versiune doar pentru testnet), cu un portofel de test gestionat de dashboard și [Faucet](/dashboard/faucet) pentru tokenuri de test. |

Tokenul nativ este **QOR** (denominarea de bază `uqor`, unde 1 QOR = 10^6 uqor). Dacă ești nou, începe pe testnet, revendică tokenuri de la Faucet și încearcă un prim transfer înainte de a trece pe mainnet.

:::tip Ești nou la QoreChain?
Urmează [Connecting to Testnet](/getting-started/connecting-to-testnet) și [Your First Transaction](/getting-started/first-transaction) pentru a te familiariza rapid, apoi revino pentru a explora restul Dashboard-ului.
:::

## Legături conexe

* [Explorer](/dashboard/explorer) — răsfoiește blocuri, tranzacții și conturi.
* [Wallet](/dashboard/wallet) — gestionează conturi și trimite tranzacții.
* [Trade / DEX](/dashboard/trade) — schimbă tokenuri prin pool-urile AMM on-chain.
* [Tools Hub](/dashboard/tools-hub) — Validator Program, Validator Application, Light Node, Node Registration, Rollups și SDK.
* [Faucet](/dashboard/faucet) — tokenuri de test pe testnet.
