---
slug: /qorex/browser-extension
title: Extensia de Browser QoreX
sidebar_label: Extensie de Browser
sidebar_position: 2
---

# Extensia de Browser QoreX

**Extensia de browser** QoreX este portofelul QoreChain pentru desktop. Este un **portofel de sine stătător** — creezi sau imporți un portofel, deții și trimiți QOR și te conectezi la dApp-uri — și este elementul care permite oricărui site web să descopere QoreX și să transforme fiecare cerere într-o aprobare explicită și decodată.

Este **live și public** pe trei magazine.

## Instalare {#install}

| Browser | Instalare |
|---|---|
| **Chrome și browsere bazate pe Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 sau mai recent) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 sau mai recent)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Ce versiune este live unde {#versions}

La data de **15 octombrie 2026**: **Chrome 0.3.6**, **Firefox 0.3.7** (o versiune punctuală după 0.3.6) și **Safari** în interiorul aplicației macOS **QoreX Wallet** (**1.7.6**, care conține extensia 0.3.6; Mac App Store folosește propria numerotare `1.x`). Recenziile magazinelor ajung în momente diferite, astfel încât un magazin poate servi pentru scurt timp un build mai vechi sau mai nou; listarea din magazin arată mereu versiunea sa curentă. Această pagină descrie setul de funcții din 0.3.6. Vezi și [Ce versiune este live unde](/qorex/overview#versions).

De la 0.2.6, extensia a primit: [mai multe portofele cu o singură parolă](#wallets), un [cont în stil Ethereum pe care îl adaugi manual](#coin60), **Claim & restake**, o listă **Unstaking in progress**, [adăugarea unui token prin contract](#custom-tokens), [Receive pe orice rețea](#receive), [Site-uri conectate cu Revoke](#connected-sites), [fereastra de acces EVM](#evm-window), [`signAndBroadcast` pentru dApp-uri](#sign-and-broadcast) și ecrane de aprobare care arată fiecare mesaj, comision și expirare.

**Suprafața de permisiuni nu s-a schimbat din versiunea 0.1.3** — vezi [Ce permisiuni cere QoreX](#permissions).

:::note
Pe Safari, aprobările se deschid într-o filă de browser, nu într-o fereastră popup — extensia este împachetată cu wrapper-ul Apple pentru extensii web Safari, folosind aceeași bază de cod.
:::

## Creează sau restaurează un portofel {#wallet}

Deschide popup-ul și alege:

- **Create a new wallet** — alege o parolă (cel puțin 8 caractere); QoreX generează pe dispozitivul tău o frază de recuperare nouă din 24 de cuvinte (entropie de 256 de biți), derivă identitatea ta QoreChain și o sigilează în seif sub acea parolă (și, opțional, un passkey — vezi [Securitate](#security)). Cele 24 de cuvinte sunt afișate **o singură dată** — notează-le, bifează *I have saved my recovery phrase somewhere safe*, apoi continuă. Le poți afișa din nou mai târziu cu **Reveal recovery phrase** în popup (necesită parola).
- **Import a recovery phrase** — restaurează dintr-o frază existentă. O frază de mai puțin de 24 de cuvinte îți restaurează fondurile normal, dar QoreX te avertizează că cheia ta post-cuantică primește atunci doar puterea frazei; pentru putere completă, creează un portofel nou cu 24 de cuvinte și mută-ți fondurile acolo.

:::danger Notează fraza înainte de a continua
Seiful extensiei există doar în acest browser. **Eliminarea extensiei, ștergerea datelor ei sau resetarea browserului îți șterge cheile**, iar nimeni — inclusiv QoreChain Association — nu le poate restaura. Fără cele 24 de cuvinte notate, fondurile tale sunt pierdute definitiv. Vezi [Fă backup acum](/qorex/security-and-recovery#back-up-now).
:::

Extensia deține propriile chei; nu necesită aplicația mobilă. Cheile nu părăsesc niciodată dispozitivul.

## Mai multe portofele și conturi {#wallets}

- **Portofele** (din 0.3.3) — ecranul **Wallets** al popup-ului ("Wallets in this browser") listează fiecare portofel din acest browser. Fiecare are propria frază de recuperare; **o singură parolă** le deblochează pe toate, iar comutarea schimbă portofelul pe care QoreX îl afișează și cu care semnează (nimic nu se mută pe lanț). **Adaugă** un portofel creând unul nou (fraza lui este afișată o singură dată) sau restaurând unul; parola ți se cere o dată pentru a re-sigila seiful. Adăugarea sau eliminarea unui portofel dezactivează **deblocarea cu passkey** — reactiveaz-o din ecranul principal. Pentru a elimina unul, atinge *Remove from this browser* și introdu parola; ultimul portofel nu poate fi eliminat din acest ecran. Eliminarea șterge acea cheie din browser — doar fraza ei de recuperare o aduce înapoi.
- **Conturi** (din 0.2.2) — **Your accounts** creează și comută între mai multe conturi din aceeași frază (până la 20 per portofel; sunt numerotate și nu pot fi redenumite). Restaurarea frazei pe care ai notat-o readuce **Account 1**; adaugă-le din nou pe celelalte cu **Add an account**. Comutarea mută totul odată cu ea: trimiterea, staking-ul, primirea și @handle-ul tău urmează contul activ.

### Cont în stil Ethereum {#coin60}

Din 0.3.2, **Add an Ethereum account (coin 60)** (pe ecranul **Your accounts**) adaugă contul pentru o frază folosită prima dată în MetaMask sau pe Dashboard; vezi [Restaurează o frază din MetaMask sau din Dashboard](/qorex/getting-started#restore-dashboard). Adresa lui 0x este cea pe care MetaMask o arată pentru aceleași cuvinte. Handle-urile nu sunt oferite pe el.

Portfolio, Q-Day Scanner, recuperarea socială, Legacy Protocol, cererile de plată și asocierea dispozitivelor rămân disponibile doar pe mobil — vezi [QoreX Wallet](/qorex/overview#platform-availability).

## Contul, soldul și @handle-ul tău {#account}

Ecranul de repaus al popup-ului afișează adresa ta `qor1…` (atinge pentru a copia) și soldul tău live de QOR, astfel încât nu trebuie să deschizi un explorator de blocuri pentru a le verifica.

### Solduri blocate (vesting) {#vesting}

Dacă contul tău deține QOR aflat în vesting (de exemplu, o alocare TGE nedeblocată încă), soldul se împarte în **disponibil acum** și **încă blocat**, iar o trimitere care depășește suma disponibilă este refuzată înainte de a ajunge la rețea, în loc să eșueze on-chain după ce a perceput deja un comision. QoreX în mod deliberat **nu** afișează aici o "dată a următoarei deblocări": un program de vesting poate fi modificat prin guvernanță, astfel încât o dată afișată pe cardul de sold ar fi citită ca o promisiune pe care QoreX nu o poate garanta. Împărțirea disponibil-vs-blocat este ceea ce rămâne mereu exact.

### Revendică un @handle

Unele versiuni ale extensiei îți permit să revendici din popup un **@handle** unic (de exemplu `@liviu`) pentru adresa acestui cont, la fel ca în aplicația mobilă; dacă popup-ul tău nu îl oferă, revendică din aplicația mobilă (revendicarea nu este oferită pe conturile în stil Ethereum). Revendicarea este semnată cu cheia proprie a contului și se leagă de acea adresă, astfel încât aplicația mobilă și Dashboard-ul o pot rezolva atunci când cineva îți trimite bani. Vezi [@handle](/qorex/account-and-dashboard#handle) pentru modul în care handle-urile sunt legate de adrese (nu de un portofel ca întreg).

## Trimite către un @handle {#handle-send}

Începând cu 0.1.9 poți plăti direct un @handle înregistrat, în loc să cauți o adresă:

1. Deschide popup-ul și atinge **Send**.
2. În câmpul destinatarului, scrie `@` urmat de handle (de exemplu `@liviu`) în loc de o adresă `qor1…`.
3. QoreX rezolvă handle-ul și îți arată **adresa rezolvată** înainte să semnezi orice — verifică mereu aceasta față de ce te aștepți.
4. Introdu suma și confirmă.

Rezolvarea este verificată în două moduri înainte ca QoreX să o folosească: o atestare de registru verificată față de o cheie de încredere integrată în extensie, și semnătura proprie a proprietarului handle-ului peste revendicare. Un răspuns care eșuează la oricare dintre verificări este respins categoric — QoreX nu recurge la afișarea unei adrese neverificate. Prima dată când plătești un anumit handle, QoreX reține (fixează) adresa la care s-a rezolvat; dacă acel handle se rezolvă ulterior la o adresă **diferită**, QoreX se oprește și îți arată integral atât adresa veche, cât și cea nouă, ca să poți decide dacă vrei să continui. Această memorare există **per browser** — plătirea aceluiași handle pentru prima dată dintr-un alt browser sau computer îl arată ca nou și acolo. Este comportamentul așteptat, nu o eroare.

## Receive {#receive}

Atinge **Receive** în popup pentru a-ți afișa adresa `qor1…` sub formă de cod QR (cu pictograma QoreChain integrată), alături de un buton de copiere — scaneaz-o de pe un telefon sau lipește adresa direct.

**Selector de rețea.** Receive poate afișa și adresa pentru Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis și Celestia, fiecare cu un avertisment "doar această rețea" (QoreChain rămâne prima).

## Fă staking din extensie {#stake}

Începând cu **0.2.2**, popup-ul are propriul ecran **Stake** — un portofel creat doar în extensie nu mai are nevoie de aplicația mobilă pentru a câștiga recompense din staking.

1. Deschide popup-ul și mergi la **Stake**.
2. Ecranul listează validatorii activi cu comisionul lor, totalul tău aflat curent în stake și orice recompense în așteptare de revendicat. Validatorii pe care rețeaua i-a **întemnițat (jailed)** sunt excluși din listă — delegarea către unul dintre ei nu este niciodată ceea ce vrei.
3. Pentru a delega, alege un validator și o sumă, apoi confirmă. QoreX semnează cu semnătura hibridă post-cuantică obligatorie, la fel ca la un Send. În timp ce scrii, te avertizează dacă suma ar lăsa mai puțin decât comisionul unei tranzacții (nu ai mai putea face unstake sau claim până când contul nu deține din nou QOR). Cu mai multe conturi, alege contul care face staking din selectorul de conturi de pe ecranul Stake.
4. **Claim** colectează recompensele; **Claim & restake** le compune înapoi către validatorii care le-au câștigat, într-o singură tranzacție. QoreX verifică mai întâi că QOR-ul tău **deblocat** poate plăti comisionul (acesta se plătește înainte ca recompensele să ajungă) și te anunță dacă nu.
5. **Unstake** pornește perioada de unbonding de 21 de zile, iar suma apare sub **Unstaking in progress** cu timpul rămas — vezi [Staking & Delegation](/user-guide/staking-and-delegation).
6. **Move stake** mută stake-ul către unul sau mai mulți alți validatori (redelegare) — fără așteptare de unbonding, fără penalizare, iar recompensele continuă să curgă. Vezi [Mută stake-ul între validatori](/qorex/portfolio-and-staking#move-stake).

Staking-ul, delegarea și recompensele au loc exclusiv pe lane-ul **Native**, niciodată printr-un precompile EVM.

### Aprobarea unei cereri de staking din Dashboard {#stake-dashboard}

[Dashboard-ul](/dashboard/staking-and-validators) QoreChain compune cererile de staking, dar nu le poate semna — cheia ta nu părăsește niciodată seiful extensiei. Când apeși **Continue in QoreX** pe Dashboard, cererea se deschide în extensie pentru ca tu să o verifici (validator și sumă) și să o aprobi, exact ca la un Send.

:::note Dacă o tranzacție apare ca „retrogradată" (downgraded) în loc de reușită
Dashboard-ul afișează ocazional o tranzacție ca **downgraded**, în loc de un succes curat. Asta înseamnă că fondurile tale s-au mutat, dar stratul de semnătură post-cuantică nu a fost găsit on-chain pentru acea tranzacție — nu este ceva ce ai făcut greșit și nu este ceva ce poți repara din partea ta. Este o eroare de partea noastră; te rugăm să o raportezi echipei de suport ca să putem investiga. Mesajul rămâne deliberat pe ecran, în loc să dispară, ca să ai timp să-l citești și să-l raportezi.
:::

### Trimiterea pe rețele externe {#send-external}

Pe lângă QOR pe lane-ul Native, popup-ul poate trimite active pe rețele externe, toate derivate din aceeași frază de recuperare (pentru rețelele EVM afișează **comisionul maxim de rețea** — "Network fee: at most …" — înainte să confirmi):

| Tip | Rețele | Token-uri incluse |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | Intrări ERC-20 (USDC și USDT pe toate lanțurile EVM, DAI pe Ethereum) |
| SVM | Solana | Intrări SPL (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | Noble USDC prin IBC; câmp opțional de memo |

Înainte ca un transfer extern să fie trimis, trebuie să bifezi o confirmare explicită: **"Rețelele externe acceptă doar semnături clasice — spre deosebire de QOR-ul tău, acest transfer NU este sigur din punct de vedere cuantic."** Lanțurile externe nu pot purta o semnătură post-cuantică, iar QoreX nu ascunde niciodată acest lucru.

## Standarde de portofel acceptate {#standards}

QoreX expune trei interfețe, toate injectate în pagină ca `window.qorex` (`{ evm, native, svm }`) și descoperite prin contractele de detecție [`@qorechain/connect`](/sdk/overview).

| Standard | Ce este | Ce înseamnă pentru tine ca dezvoltator |
|---|---|---|
| **EIP-1193** | API-ul JavaScript al furnizorului Ethereum (`request(...)`, evenimente). | Furnizorul EVM al QoreX răspunde la interogări despre cont și rețea — `eth_requestAccounts`, `eth_accounts`, `eth_chainId` și `wallet_switchEthereumChain` (orice alt lanț returnează standardul `4902`). **Nu** semnează și nu trimite încă tranzacții sau mesaje EVM: celelalte metode returnează "EVM method … not yet supported". Folosește MetaMask sau alt portofel EVM pentru tranzacțiile pe lane-ul EVM (care acum necesită și o [fereastră de acces EVM](#evm-window) deschisă). |
| **EIP-6963** | Descoperirea furnizorilor de portofele multiple (evenimente announce / request). | QoreX se anunță alături de fiecare alt portofel — **nu suprascrie niciodată `window.ethereum`** — astfel încât utilizatorul alege QoreX per site, fără conflicte. |
| **Furnizor Native (în stil Keplr)** | `window.qorex.native`: `enable`, `getKey`, `signDirect` și `signAndBroadcast`, plus o listă `capabilities`. **Nu** este un înlocuitor complet pentru Keplr — QoreX nu creează alias pentru `window.keplr` și nu are `getOfflineSigner`, `signAmino` sau `sendTx`. | Pentru a trimite o tranzacție QoreChain apelează **`signAndBroadcast`** (vezi [Trimiterea unei tranzacții QoreChain](#sign-and-broadcast)): QoreX arată mesajele decodate și comisionul, adaugă semnătura hibridă post-cuantică pe care doar portofelul o poate face și transmite tranzacția. `signDirect` pe QoreChain este refuzat dacă tranzacția nu poartă deja un strat valid rezistent cuantic. |
| **Solana Wallet Standard** *(de la 0.1.5)* | Descoperire nativă de portofel pentru dApp-urile Solana (`wallet-standard:register-wallet` / `app-ready`). | dApp-urile Solana **detectează automat QoreX** — fără integrare personalizată. Funcții: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; lanțul `solana:mainnet`; tranzacții atât `legacy`, cât și `v0`. |

:::note Accesarea directă a lane-ului SVM
Aceeași interfață este disponibilă și pe `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). Descoperirea automată Wallet-Standard și lane-ul SVM complet implementat au fost livrate în **0.1.5** și sunt live atât pe Chrome, cât și pe Firefox (vezi [ce versiune este live unde](#versions)).

Aprobările Solana afișează **o linie pe instrucțiune**, decodată acolo unde QoreX poate: transferuri de SOL (destinatar și lamport), transferuri de token-uri SPL, **"ALLOW SPENDING of your tokens"** (approve), **"HAND OVER control of the account"** (set authority) și închiderea unui cont de token — și spun "instruction QoreX cannot read" pentru orice altceva, împreună cu programul. O cerere care include o instrucțiune approve sau set-authority are titlul "wants authority over your Solana tokens — read every line below". Tranzacțiile care nu listează portofelul tău ca semnatar sunt respinse, `signMessage` nu va semna octeți care sunt de fapt o tranzacție, iar semnătura este marcată drept **clasică** — vezi [Semnarea post-cuantică](#pqc).
:::

## Monede și token-uri {#custom-tokens}

Ecranul **Coins and tokens** al popup-ului îți permite să adaugi un **token ERC-20 prin contractul său**: alege rețeaua, lipește adresa contractului, **Check contract**. QoreX citește numele și zecimalele token-ului din contractul însuși — și le citește din nou în fundal când îl adaugi, în loc să aibă încredere în popup — apoi le afișează cu un memento că oricine poate crea un token cu orice nume. Token-ul apare apoi în **Send on external networks**. Refuză token-urile incluse, duplicatele, rețelele non-EVM, adresele greșite, contractele ilizibile și contractele care împrumută numele unui token inclus.

## Site-uri conectate {#connected-sites}

**Connected sites** în popup listează fiecare site pe care acest portofel l-a aprobat — un site poate vedea adresa acestui portofel și îți poate cere să semnezi. Atinge **Revoke** pentru a elimina unul. Aprobările sunt păstrate **per portofel**: un site aprobat pentru un portofel nu poate citi adresa altui portofel după ce comuți.

## Fereastra de acces EVM {#evm-window}

Ecranul **EVM access window** al popup-ului deschide și închide fereastra care permite unui cont să trimită pe lane-ul EVM al QoreChain (v3.2.0 și ulterior) — același ecran ca în aplicație. Vezi [Fereastra de acces EVM](/qorex/security-and-recovery#evm-window).

## Limbă {#language}

Extensia vorbește aceleași zece limbi ca aplicația mobilă, dashboard-ul și site-ul: engleză, română, germană, spaniolă, franceză, italiană, turcă, arabă, japoneză și coreeană. Aceasta urmează implicit limba **browserului** tău (revenind la engleză pentru orice altceva) — reține că aceasta este o sursă diferită față de aplicația mobilă, care urmează limba **telefonului**, astfel încât cele două pot afișa limbi diferite dacă telefonul și browserul tău sunt setate diferit. Un selector pe ecranul de repaus al popup-ului îți permite să suprascrii oricând limba detectată; comutarea la arabă întoarce imediat popup-ul de la dreapta la stânga, nu doar textul.

## Securitate și permisiuni {#security}

QoreX este construit pentru a fi verificabil, nu doar de încredere:

- **Seif (Vault)** — cheile tale sunt sigilate cu **AES-256-GCM**. Calea prin parolă își derivă cheia cu **Argon2id** (RFC 9106, memory-hard: 64 MiB, t=3, p=1), astfel încât un bloc de seif exfiltrat rezistă la spargere prin GPU/ASIC. (Blocurile legacy PBKDF2 rămân deschidibile și se re-sigilează în Argon2id la următoarea deblocare.)
- **Deblocare cu passkey (opțională, din 0.1.5)** — acolo unde autentificatorul tău acceptă extensia **WebAuthn PRF**, QoreX poate debloca seiful din ieșirea PRF de 32 de octeți a passkey-ului, în loc de o parolă tastată. Parola ta rămâne întotdeauna o soluție de rezervă.

  :::note Unde apare deblocarea cu passkey
  QoreX detectează automat WebAuthn și afișează **Enable passkey unlock** doar acolo unde browserul îl expune paginilor de extensie — adică **Chrome și Edge**. Pe **Firefox** opțiunea este ascunsă, pentru că Firefox nu expune WebAuthn paginilor de extensie. Acest lucru este așteptat, nu un bug.
  :::
- **Manifest V3 + CSP strict** — `script-src 'self'; object-src 'self'; base-uri 'self'`. Nu există **nicio încărcare de cod la distanță** după instalare și niciun `wasm-unsafe-eval`.
- **Fără cont, fără telemetrie** — fără analiză, fără urmărire, fără jurnalizare la distanță, fără înregistrare și fără e-mail. Listarea de pe Firefox declară colectarea de date ca `none`.

### Ce permisiuni cere QoreX și de ce {#permissions}

Această secțiune există pentru că listarea de pe Firefox afișează permisiunea **"Access your data for all websites"**, care poate părea în contradicție cu un portofel care declară că nu are permisiuni de gazdă. Iată adevărul exact, neschimbat, din manifest.

`manifest.json` al extensiei declară:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`permissions: ["storage"]`** — singura permisiune de API. Stochează seiful criptat și aprobările tale de conexiune per origine **local**, în stocarea extensiei.
- **`host_permissions: []`** — QoreX nu declară **nicio** permisiune de gazdă. Nu cere capacitatea de a face cereri de rețea cross-origin către site-uri arbitrare în numele tău.
- **`web_accessible_resources`** — permite paginilor să încarce propriul `inpage.js` al QoreX, micul script care expune furnizorul. `use_dynamic_url` îi dă o adresă per sesiune, astfel încât site-urile nu pot identifica extensia prin amprentare, sondând-o.
- **`content_scripts` cu potriviri `<all_urls>`** — acesta este motivul onest pentru care Firefox afișează *"Access your data for all websites."* QoreX injectează un mic script furnizor (`content.js` → `inpage.js`) în **fiecare pagină**. Un content script care rulează pe toate site-urile *poate* tehnic citi pagina, iar browserele descriu această capacitate cu exact această formulare — indiferent dacă provine din `host_permissions` sau dintr-o potrivire de content script.

**De ce content script-ul rulează peste tot.** Pentru ca **orice** dApp să poată descoperi portofelul prin EIP-6963 fără să trebuiască să acorzi mai întâi acces per site. Așa funcționează MetaMask, Keplr, Phantom și orice alt portofel injectat: furnizorul injectat trebuie să fie prezent înainte ca scripturile paginii să ruleze (`document_start`), pe orice site vizitezi.

**Ce face — și ce nu face — acest script.** El doar face legătura mesajelor de portofel (anunță furnizorul, transmite cererile de conectare/semnare către service worker, returnează rezultatul). Nu citește conținutul paginii dincolo de acele cereri de portofel, nu trimite nimic către un server și nu încarcă cod la distanță — și nu poate prelua date cross-origin arbitrare pentru că nu există permisiuni de gazdă. Toate acestea sunt verificabile: extensia este blocată prin CSP, nu include analiză și pachetul pentru Firefox include o arhivă sursă reproductibilă.

## Conectează un dApp la QoreX {#connect}

Un dApp descoperă QoreX prin **EIP-6963**. Announce-and-request, apoi folosește furnizorul EIP-1193 returnat (care răspunde doar la interogări despre cont și rețea — vezi tabelul de mai sus):

```ts
import type { EIP6963ProviderDetail } from "./types";

const wallets = new Map<string, EIP6963ProviderDetail>();

// 1. Collect every wallet that announces itself.
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});

// 2. Ask installed wallets to announce.
window.dispatchEvent(new Event("eip6963:requestProvider"));

// 3. Pick QoreX by its rdns and use the standard EIP-1193 provider.
const qorex = wallets.get("network.qore.qorex");
if (qorex) {
  const accounts = await qorex.provider.request({ method: "eth_requestAccounts" });
  console.log("QoreX EVM account:", accounts[0]);
}
```

Pentru lane-ul **Native** al QoreChain, folosește furnizorul de la `window.qorex.native` (`enable`, `getKey`, `signAndBroadcast`, `signDirect`; citește `capabilities` pentru a vedea ce acceptă acest build). Pachetul de nivel superior [`@qorechain/connect`](/sdk/overview) învelește această detecție pentru tine.

Aprobările sunt **per origine**: prima conexiune la un site deschide un popup de aprobare care arată originea, aprobarea dezvăluie doar adresa ta publică, iar aprobarea unui site nu acordă nimic altui site. Aprobările sunt păstrate per portofel, persistă până când le revoci la **Connected sites**, iar un site poate avea o cerere în așteptare (trei în total); comutarea portofelului sau blocarea răspunde cererilor în așteptare cu „nu". Vezi [Ce arată fereastra de aprobare](/qorex/security-and-recovery#approvals).

### Puntea către Dashboard (v0.1.5, extinsă în v0.2.2) {#dashboard-bridge}

Versiunea 0.1.5 adaugă o punte limitată strict la **`dashboard.qorechain.io`**: `window.qorex.native.connectProof(sessionId)` semnează dovada de asociere *Connect with QoreX* (back-end-ul re-verifică semnătura), iar `executeTransfer({ to, amountUqor, memo })` aprobă și transmite un transfer de QOR propus de Dashboard, returnând `txHash`. Aceste metode sunt refuzate pe orice altă origine.

**0.2.2** adaugă `native:executeRequest`, care acceptă o cerere întreagă propusă de Dashboard — inclusiv [staking](#stake-dashboard) — validată față de același parser comun pe care QoreX îl folosește peste tot: refuzată la o nepotrivire de rețea, o origine străină, o adresă care nu este a ta, un tip de cerere necunoscut sau o cerere de staking care conține un `toAddress` (cererile de staking nu au unul). Tipurile de cerere sunt send, delegate, undelegate, redelegate și claim; o cerere Connect îți permite să alegi care dintre conturile tale să fie asociat, iar `listAccounts()` returnează conturile tale (doar citire).

Deoarece o adresă `qor1…` este la fel de validă atât pe mainnet, cât și pe testnet, o cerere propusă de Dashboard specifică rețeaua vizată, iar QoreX refuză să acționeze asupra ei dacă aceasta nu se potrivește cu rețeaua la care extensia este conectată în prezent — nu va comuta niciodată rețele în numele unei cereri.

## Trimiterea unei tranzacții QoreChain dintr-un dApp: `signAndBroadcast` {#sign-and-broadcast}

Fiecare tranzacție QoreChain dintr-un cont cu o cheie post-cuantică înregistrată are nevoie de o semnătură hibridă — secp256k1 **și** ML-DSA-87 — iar doar portofelul deține cheia ML-DSA, deci o pagină nu o poate construi. Trimite mesajele; QoreX face restul: arată mesajele decodate și comisionul, construiește tranzacția pentru contul selectat de utilizator, adaugă semnătura hibridă (înregistrând mai întâi cheia post-cuantică a contului dacă este prima lui tranzacție), o transmite și se rezolvă cu rezultatul. Disponibil din extensia **0.3.5** și aplicația **1.1.5** (fiecare build din magazine de azi).

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");            // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                        // must be the wallet's active network
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],  // protobuf bytes: Uint8Array, number[] or base64
  memo: "",                                          // optional, up to 256 bytes
  gasLimit: 300000,                                  // optional
});
// → { txHash, code, height?, shield }
```

- `chainId` trebuie să fie egal cu rețeaua activă a portofelului (`qorechain-vladi` pe mainnet). Un dApp nu poate comuta rețeaua; doar utilizatorul o poate face.
- 1–32 de mesaje per apel; octeții mesajelor sunt semnați exact așa cum au fost trimiși.
- Comisionul (`gasLimit` × prețul de gaz al rețelei) este afișat înainte de aprobare. O respingere aruncă `QoreX: signature rejected`.
- Gestionarea cheii post-cuantice (înregistrare, migrare, rotație — inclusiv în interiorul authz `MsgExec`) este refuzată: portofelul gestionează singur cheia contului.

## Semnarea post-cuantică {#pqc}

Fiecare transfer de QOR pe care QoreX îl inițiază este semnat cu o **semnătură hibridă post-cuantică** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) alături de semnătura clasică secp256k1 — folosind pipeline-ul hibrid complet din `@qorechain/sdk`. **Nu există comutator**: QoreChain o impune, iar QoreX nu trimite niciodată un transfer de QOR pe lane-ul Native fără ea.

- **Semnarea Native inițiată de dApp** — folosește [`signAndBroadcast`](#sign-and-broadcast): QoreX decodează fiecare mesaj, arată comisionul și adaugă singur stratul rezistent cuantic. `signDirect` semnează o tranzacție construită de pagină și, pe QoreChain, este **refuzat** dacă acea tranzacție nu poartă deja un strat valid rezistent cuantic (și refuzat pentru conturile în stil Ethereum, care folosesc `signAndBroadcast`). QoreX nu semnează niciodată orb: o cerere pe care nu o poate decoda este refuzată și nu semnează niciodată o tranzacție QoreChain exclusiv clasică.
- **Semnăturile clasice sunt mereu etichetate** — transferurile pe rețele externe (ETH, BNB, Solana, …) nu pot purta o semnătură post-cuantică; QoreX te pune să bifezi o confirmare explicită și le marchează drept clasice, în loc să retrogradeze silențios.

**Ce înseamnă asta pentru dimensiunea tranzacției.** ML-DSA-87 este o semnătură mare: semnătura are **4,627 de octeți**, iar cheia publică **2,592 de octeți** (fixate de FIPS-204). O tranzacție hibridă QoreChain este, prin urmare, cu câțiva kiloocteți mai mare decât una pur clasică. Dacă îți construiești și transmiți singur tranzacțiile, dimensionează-ți buffer-ele și estimările de comision pentru octeții suplimentari; contabilizarea gazului din QoreChain îi așteaptă deja. Vezi [Semnarea post-cuantică](/developer-guide/post-quantum-signing) pentru primitive și cerința de semnare deterministă.
