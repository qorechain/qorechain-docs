---
slug: /dashboard/overview
title: Prezentare generală a Dashboard-ului și primii pași
sidebar_label: Prezentare generală și primii pași
sidebar_position: 1
---

# Prezentare generală a Dashboard-ului și primii pași

QoreChain Dashboard, disponibil la **[dashboard.qorechain.io](https://dashboard.qorechain.io)**, este aplicația web oficială pentru a folosi QoreChain dintr-un browser. Un singur cont și un singur comutator de rețea îți oferă explorer-ul, o vizualizare a portofelului, un faucet de testnet, un ecran de swap cu tokenuri de test, quest-uri, unelte AI pentru contracte, unelte pentru noduri și validatori și o pagină pentru dezvoltatori. Este pentru oricine vrea să încerce rețeaua fără să instaleze nimic și pentru constructorii care vor verificări rapide în timp ce dezvoltă. Nu se instalează nimic: rulează în browser.

Această secțiune este un ghid pentru utilizator: ce face fiecare pagină, cum se deschide și care sunt limitele ei.

## Inovații {#innovations}

- **Un singur comutator stabilește rețeaua pentru fiecare pagină.** Controlul **Testnet / Mainnet** din antet îți salvează alegerea în browser și reîncarcă pagina, astfel încât serverul și browserul citesc aceeași rețea. Mainnet este implicit.
- **Mainnet-ul este non-custodial.** Dashboard-ul nu deține niciodată chei de mainnet și nu semnează niciodată o tranzacție de mainnet. Trimite către QoreX doar parametrii unui transfer sau ai unei acțiuni de staking, iar QoreX reconstruiește, afișează, semnează (semnătură hibridă ML-DSA-87) și transmite tranzacția. Dashboard-ul află doar hash-ul tranzacției.
- **Vizualizările de mainnet cer un cont; testnet-ul este deschis.** Pe mainnet, statisticile din pagina principală, Wallet, Trade și prezentarea generală din Explorer verifică accesul pe server. Un vizitator neautentificat vede „Sign in to view mainnet".
- **O confirmare privind fondurile reale, o dată per browser.** Înainte de prima vizualizare de mainnet în Wallet, Trade, prezentarea generală din Explorer sau statisticile din pagina principală, un card intitulat „You're entering QoreChain Mainnet" listează patru puncte: Dashboard-ul este non-custodial, tranzacțiile sunt finale și ireversibile, există riscul pierderii totale și nimic de aici nu este sfat financiar, iar QOR de testnet nu este niciodată schimbabil. Acceptarea este stocată în browserul tău, nu în contul tău.
- **Un cont, trei codificări.** Același cont este afișat ca adresă `qor1...`, ca adresă `0x...` și ca adresă SVM base58, iar Dashboard-ul citește soldul și istoricul o singură dată, prin `qor1...`.

## Cum folosești {#how-to-use}

### Structura

**Antet.** Comutatorul de rețea, apoi **Sign In** sau un meniu de profil (Profile, Edit Profile, Theme, Language, Rewards, Referral, Docs, Log out).

**Bara laterală pe desktop, în ordine:**

| Intrare | Pagină | Ce este |
| --- | --- | --- |
| **Discover** | `/` | Acasă: butoanele din hero **Create Smart Contract** și **Explore Network**, contoarele „Dashboard Overview", liste cu contractele create, ultimele audituri publice și cei mai activi contribuitori, plus un „Developer Toolkit" cu **Start Generating**, **New Audit** și **Claim Tokens**. |
| **Public Sale** | `/public-sale` | Participanții existenți își văd alocarea, calendarul de vesting și revendicarea. |
| **Wallet** | [Wallet](/dashboard/wallet) | Sold, istoric, primire și (pe mainnet) trimitere și staking prin QoreX. |
| **Faucet** | [Faucet](/dashboard/faucet) | Tokenuri de testnet gratuite. |
| **Explorer** | [Explorer](/dashboard/explorer) | Blocuri, tranzacții, adrese și validatori. |
| **Trade** | [Trade](/dashboard/trade) | Ecran de swap cu tokenuri de test. |
| Grupul **Earn** | [Quests](/dashboard/quests) | Quests, Leaderboard, Badges. |
| **Games** | [Quests](/dashboard/quests#games) | QoreChain Arcade. |
| Grupul **Build** | [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Nodes & Validators](/dashboard/tools-hub) (`/tools`), [Developers](/dashboard/developers) | Unelte pentru contracte, pagina operatorului (cinci file: Validator Program, Validator Application, Light Node, Node Registration, Rollups) și pagina publică pentru dezvoltatori (șapte file: SDKs, Transaction inspector, PQ key status, Simulator, Signing playground, QoreX test wallet, AI agents (MCP)). Intrarea Nodes & Validators se numea înainte „Tools"; fila sa SDK s-a mutat la Developers. |
| **FAQ** | `/faq` | Ajutor în aplicație. Părți din el sunt depășite; acest manual este referința. |

Pagina [Validators](/dashboard/validators) (`/validators`) nu are link în bara laterală; deschide-o după adresă.

**Mobil.** O bară de jos (Discover, Wallet, Faucet, apoi Explorer, Trade, Quests) plus un meniu central în evantai cu restul.

### Autentificare {#sign-in}

Dashboard-ul are două straturi: un **cont de Dashboard** cu care te autentifici și **portofelul** pe care îl conectezi la el. Navigarea nu necesită niciodată un portofel.

- **Redirecționat la autentificare înainte de încărcarea paginii:** Profile, [Wallet](/dashboard/wallet), Rewards, Referral, [Quests](/dashboard/quests), [Trade](/dashboard/trade), [Faucet](/dashboard/faucet), Connection, Contracts, Public Sale și fiecare pagină de contract salvat `/smart-contract-creator/<id>`.
- **Afișează un ecran „Authentication Required" când nu ești autentificat:** [Nodes & Validators](/dashboard/tools-hub), [Validators](/dashboard/validators), FAQ, [AI Audit](/dashboard/contract-auditor), Badges, Leaderboard și Games.
- **Deschise fără cont:** pagina principală Discover, paginile de detaliu din [Explorer](/dashboard/explorer) (tranzacție, bloc, adresă, validatori) pe ambele rețele, prezentarea generală din Explorer pe testnet, pagina de întâmpinare [Smart Contract Creator](/dashboard/smart-contract-creator) (o generare gratuită), lista de audituri de la `/audits` și rapoartele publice de audit, precum și pagina [Developers](/dashboard/developers).
- **Mainnet fără autentificare:** paginile care afișează date de mainnet (contoarele din pagina principală, Wallet, Trade, prezentarea generală din Explorer) arată „Sign in to view mainnet" și un buton **Sign In**.

### Alege-ți rețeaua {#select-network}

Antetul afișează rețeaua pe care te afli și îți permite să comuți. Alegerea este reținută în browser.

| Rețea | Chain ID | Când se folosește |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Rețeaua live (live din 7 iunie 2026, rulează chain v3.2.5 din 29 octombrie 2026) pentru valoare reală. Non-custodial: îți conectezi propriul portofel. |
| **Testnet** | `qorechain-diana` | Mediu gratuit (rulează chain v3.2.6 din 27 octombrie 2026), cu un portofel de test gestionat de Dashboard și [Faucet](/dashboard/faucet). |

Tokenul nativ este **QOR** (denominarea de bază `uqor`, 1 QOR = 10^6 uqor). Dacă ești nou, începe pe testnet, revendică tokenuri de la Faucet și încearcă un prim transfer înainte de a trece pe mainnet.

Câteva pagini ignoră comutatorul: Faucet plătește mereu pe testnet, [Trade](/dashboard/trade) arată mereu conținut de testnet, iar Quests, Badges, Leaderboard, Games, Public Sale și FAQ nu depind de rețea.

### Conectează-ți portofelul {#connect-your-wallet}

- **Mainnet-ul este non-custodial.** Conectează **QoreX** (portofelul oficial QoreChain, extensie sau aplicație), **Keplr** sau **MetaMask**. Trimiterea și staking-ul pe rail-ul Native necesită QoreX, deoarece conturile QoreChain semnează cu o semnătură hibridă post-cuantică pe care doar QoreX o produce în prezent. Keplr se conectează pentru a vedea și a primi pe rail-ul Native. MetaMask se conectează pe rail-ul EVM; trimiterea de acolo necesită și cheia post-cuantică a contului și o fereastră EVM deschisă, din QoreX (vezi [Trimiterea cu MetaMask](/dashboard/wallet#send-metamask)).
- **Testnet-ul este custodial.** Dashboard-ul îți gestionează un portofel de test, așa că nu ai nimic de instalat și nicio valoare reală în joc.

#### Conectează-te cu QoreX (recomandat) {#connect-qorex}

1. Deschide [dashboard.qorechain.io](https://dashboard.qorechain.io) și asigură-te că antetul afișează **Mainnet**.
2. Dacă este prima ta vizită pe o pagină de mainnet în acest browser, acceptă [confirmarea de risc unică](#risk-acknowledgement).
3. Deschide **Wallet** (trebuie să fii autentificat) și selectează **Connect with QoreX** pe cardul **QoreX wallet**.
4. Dacă extensia de browser QoreX este detectată și nu este salvată nicio metodă, Dashboard-ul întreabă „How do you want to connect?" cu **Browser extension** și **QoreX app**. Alegerea este salvată. Dacă nu este detectată nicio extensie, trece direct la fluxul aplicației.
   - **Browser extension:** pop-up-ul extensiei afișează `dashboard.qorechain.io` ca site care solicită conexiunea. Aprobă; asta semnează o dovadă unică că deții adresa ta `qor1...`. Nu se mută fonduri.
   - **QoreX app:** Dashboard-ul afișează un cod QR și **Open QoreX**. Scanează-l sau atinge-l, verifică în QoreX cererea de asociere și aprob-o cu biometricul tău. Dashboard-ul verifică periodic („Waiting for approval in QoreX...") și se finalizează singur.
   - Un link **Use a different method** apare doar cât timp o asociere este în așteptare.
5. Odată aprobat, Dashboard-ul îți afișează adresa `qor1...` și deblochează acțiunile care necesită o semnătură.

Vezi [Wallet](/dashboard/wallet#mainnet) pentru ghidul complet de conectare și trimitere, și pagina [Account & Dashboard](/qorex/account-and-dashboard#dashboard) din documentația QoreX pentru perspectiva din partea portofelului asupra aceleiași asocieri.

#### Conectează-te cu Keplr sau MetaMask

1. Cu antetul pe **Mainnet** și confirmarea acceptată, deschide **Wallet**.
2. Sub **or connect another wallet**, selectează **Connect Keplr** sau **Connect MetaMask**.
3. Aprobă conexiunea în portofelul tău. Dacă portofelul tău nu cunoaște încă QoreChain, vezi [Adaugă QoreChain în portofelul tău](/dashboard/wallet#add-network).

Odată conectat, pagina Wallet îți afișează adresa cu soldul și istoricul. Vezi [Wallet Setup](/getting-started/wallet-setup) pentru îndrumări de configurare inițială.

### Confirmarea de risc unică {#risk-acknowledgement}

Cardul de confirmare apare înaintea primei vizualizări de mainnet în **Wallet**, **Trade**, **prezentarea generală din Explorer** sau **statisticile din pagina principală** într-un browser. Nu este cerut pentru fiecare pagină de mainnet: paginile de detaliu din Explorer, Creator și celelalte pagini se deschid fără el. Acceptă-l o dată per browser; ștergerea datelor browserului îl afișează din nou.

## Cum accesezi {#how-to-access}

- **URL:** [dashboard.qorechain.io](https://dashboard.qorechain.io), în orice browser actual. Fără instalare.
- **Cont:** autentificare prin e-mail sau un furnizor de identitate suportat, pe pagina de autentificare. Ce pagini îl cer este listat la [Autentificare](#sign-in).
- **Rețele:** mainnet `qorechain-vladi` și testnet `qorechain-diana`, cu comutatorul din antet. Mainnet este implicit.
- **Portofel:** niciunul pentru navigare. QoreX pentru trimiteri și staking pe mainnet, Keplr sau MetaMask pentru a vedea și a primi. Pe testnet, Dashboard-ul îți creează un portofel de test.
- **Cost:** Dashboard-ul este gratuit. Acțiunile on-chain plătesc taxa de rețea (prag de 0,1 uqor per gas). Unele elemente plătite sunt descrise pe paginile lor (licența de light node și taxa programului de validatori, pe [Nodes & Validators](/dashboard/tools-hub)).
- **Poartă de acces timpuriu:** niciuna în prezent. Paginile de mainnet cer doar autentificare (unde este listat mai sus) și confirmarea unică.

## Unde este publicat {#where-published}

| Suprafață | Adresă | Rețele | Autentificare |
| --- | --- | --- | --- |
| Dashboard | [dashboard.qorechain.io](https://dashboard.qorechain.io) | Mainnet și testnet | Per pagină, vezi [Autentificare](#sign-in) |
| Explorer independent | [explore.qore.network](https://explore.qore.network) (o aplicație separată, vezi [Explorer](/dashboard/explorer#standalone-explorer)) | Mainnet și testnet | Niciuna |
| Endpoint-uri publice | `rpc.qore.host`, `api.qore.host`, `evm.qore.host`, `svm.qore.host`, cu variantele `*-testnet` | Mainnet și testnet | Niciuna |

Paginile acestei secțiuni: [Explorer](/dashboard/explorer), [Wallet](/dashboard/wallet), [Trade](/dashboard/trade), [Bridge](/dashboard/bridge), [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Staking & Validators](/dashboard/staking-and-validators), [Validators](/dashboard/validators), [Faucet](/dashboard/faucet), [Quests, Badges, Leaderboard și Games](/dashboard/quests), [Nodes & Validators](/dashboard/tools-hub) și [Developers](/dashboard/developers).

## Limite și probleme cunoscute {#limits}

- **Nu există un ecran Bridge.** Vezi [Bridge](/dashboard/bridge).
- **Trade nu urmează comutatorul de rețea.** Arată conținut de testnet chiar și cu antetul pe Mainnet. Vezi [Trade](/dashboard/trade).
- **FAQ-ul din aplicație este o scurtă pagină de ajutor.** Unde el și acest manual diferă, urmează acest manual.
- **Restricții pe mainnet.** Staking-ul, trimiterea și deploy-urile de contracte pe mainnet sunt descrise pe fiecare pagină; mai multe fluxuri (deploy-uri Native sau SVM, redelegarea, staking-ul cu blocare în timp) nu sunt oferite în Dashboard.
- **Testnet-ul nu are valoare reală.** Nu trimite niciodată QOR real la o adresă de testnet: formatele sunt identice. Vezi [Wallet](/dashboard/wallet#testnet).

:::tip Ești nou la QoreChain?
Urmează [Connecting to Testnet](/getting-started/connecting-to-testnet) și [Your First Transaction](/getting-started/first-transaction) pentru a te familiariza rapid, apoi revino pentru a explora restul Dashboard-ului.
:::
