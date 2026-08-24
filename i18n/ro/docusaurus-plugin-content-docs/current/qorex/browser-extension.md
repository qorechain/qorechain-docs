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
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 sau mai recent)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Ce versiune este live unde {#versions}

Recenziile magazinelor ajung în momente diferite, astfel încât versiunea publicată diferă în prezent de la un browser la altul:

| Browser | Versiune publicată |
|---|---|
| **Firefox** | **0.1.8** (0.1.9 trimisă, în curs de revizuire) |
| **Chrome / Chromium** | **0.1.5** (0.1.9 trimisă, în curs de revizuire) |
| **Safari (macOS)** | livrată în interiorul aplicației macOS **QoreX Wallet**, care folosește propria numerotare `1.x` — Mac App Store servește în prezent **1.1** (conține extensia 0.1.5); **1.2** (conținând 0.1.9) este trimisă și în curs de revizuire |

Este posibil ca funcțiile mai noi să nu fie încă live în browserul tău — verifică tabelul de mai sus înainte de a presupune că ceva descris aici este disponibil.

**0.1.5** a adăugat [descoperirea prin Solana Wallet Standard](#standards), [deblocarea cu passkey](#security), o [lane SVM pentru dApp](#standards) complet implementată și [puntea de conectare cu Dashboard-ul](#dashboard-bridge). (Versiunea 0.1.4 nu a fost niciodată publicată — modificările ei ajung la utilizatori odată cu 0.1.5.)

**0.1.6–0.1.9** au adăugat, în ordine: trimiteri care țin cont de vesting, cu mesaje sincere de refuz din partea băncii; adresa contului și soldul live afișate direct pe ecranul principal al popup-ului; și, în **0.1.9**, [plata către un @handle](#handle-send) direct din Send, un [ecran Receive cu cod QR al adresei](#receive), un [selector de limbă](#language) (zece limbi, potrivind setul aplicației mobile) și eliminarea unei confuze "date a următoarei deblocări" din [soldul de vesting](#vesting).

**Suprafața de permisiuni nu s-a schimbat din versiunea 0.1.3** — vezi [Ce permisiuni cere QoreX](#permissions).

:::note
Pe Safari, aprobările se deschid într-o filă de browser, nu într-o fereastră popup — extensia este împachetată cu wrapper-ul Apple pentru extensii web Safari, folosind aceeași bază de cod.
:::

## Creează sau restaurează un portofel {#wallet}

Deschide popup-ul și alege:

- **Create wallet** — generează pe dispozitivul tău o frază de recuperare nouă din 24 de cuvinte (entropie de 256 de biți), derivă identitatea ta QoreChain și o sigilează în seif sub o parolă (și, opțional, un passkey — vezi [Securitate](#security)).
- **Import wallet** — restaurează dintr-o frază existentă de 24 de cuvinte.

Extensia deține propriile chei; nu necesită aplicația mobilă. Poți, de asemenea, exporta mnemonica din popup. Cheile nu părăsesc niciodată dispozitivul.

:::note Un cont per profil de browser
Spre deosebire de aplicația mobilă, care poate deține mai multe conturi QoreChain dintr-o singură frază de recuperare, extensia gestionează exact **un** cont. Staking, Portfolio, Q-Day Scanner, recuperarea socială, Legacy Protocol, cererile de plată și asocierea dispozitivelor sunt disponibile doar pe mobil — vezi [QoreX Wallet](/qorex/overview#platform-availability) pentru comparația completă.
:::

## Contul, soldul și @handle-ul tău {#account}

Ecranul de repaus al popup-ului afișează adresa ta `qor1…` (atinge pentru a copia) și soldul tău live de QOR, astfel încât nu trebuie să deschizi un explorator de blocuri pentru a le verifica.

### Solduri blocate (vesting) {#vesting}

Dacă contul tău deține QOR aflat în vesting (de exemplu, o alocare TGE nedeblocată încă), soldul se împarte în **disponibil acum** și **încă blocat**, iar o trimitere care depășește suma disponibilă este refuzată înainte de a ajunge la rețea, în loc să eșueze on-chain după ce a perceput deja un comision. QoreX în mod deliberat **nu** afișează aici o "dată a următoarei deblocări": un program de vesting poate fi modificat prin guvernanță, astfel încât o dată afișată pe cardul de sold ar fi citită ca o promisiune pe care QoreX nu o poate garanta. Împărțirea disponibil-vs-blocat este ceea ce rămâne mereu exact.

### Revendică un @handle

Din popup poți revendica un **@handle** unic (de exemplu `@liviu`) pentru adresa acestui cont, la fel ca în aplicația mobilă. Revendicarea este semnată cu cheia proprie a contului și se leagă de acea adresă, astfel încât aplicația mobilă și Dashboard-ul o pot rezolva atunci când cineva îți trimite bani. Vezi [@handle](/qorex/account-and-dashboard#handle) pentru modul în care handle-urile sunt legate de adrese (nu de un portofel ca întreg).

## Trimite către un @handle {#handle-send}

Începând cu 0.1.9 poți plăti direct un @handle înregistrat, în loc să cauți o adresă:

1. Deschide popup-ul și atinge **Send**.
2. În câmpul destinatarului, scrie `@` urmat de handle (de exemplu `@liviu`) în loc de o adresă `qor1…`.
3. QoreX rezolvă handle-ul și îți arată **adresa rezolvată** înainte să semnezi orice — verifică mereu aceasta față de ce te aștepți.
4. Introdu suma și confirmă.

Rezolvarea este verificată în două moduri înainte ca QoreX să o folosească: o atestare de registru verificată față de o cheie de încredere integrată în extensie, și semnătura proprie a proprietarului handle-ului peste revendicare. Un răspuns care eșuează la oricare dintre verificări este respins categoric — QoreX nu recurge la afișarea unei adrese neverificate. Prima dată când plătești un anumit handle, QoreX reține (fixează) adresa la care s-a rezolvat; dacă acel handle se rezolvă ulterior la o adresă **diferită**, QoreX se oprește și îți arată integral atât adresa veche, cât și cea nouă, ca să poți decide dacă vrei să continui.

## Receive {#receive}

Atinge **Receive** în popup pentru a-ți afișa adresa `qor1…` sub formă de cod QR (cu pictograma QoreChain integrată), alături de un buton de copiere — scaneaz-o de pe un telefon sau lipește adresa direct.

### Trimiterea pe rețele externe {#send-external}

Pe lângă QOR pe lane-ul Native, popup-ul poate trimite active pe rețele externe, toate derivate din aceeași frază de recuperare:

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
| **EIP-1193** | API-ul JavaScript al furnizorului Ethereum (`request(...)`, evenimente). | Codul tău existent din ethers.js / viem / web3.js comunică cu lane-ul EVM al QoreX neschimbat; codurile de eroare numerice (de ex. `4902`) sunt transmise ca atare. |
| **EIP-6963** | Descoperirea furnizorilor de portofele multiple (evenimente announce / request). | QoreX se anunță alături de fiecare alt portofel — **nu suprascrie niciodată `window.ethereum`** — astfel încât utilizatorul alege QoreX per site, fără conflicte. |
| **`signDirect` în stilul Keplr** | Un furnizor de tip Cosmos `OfflineDirectSigner` pe `window.qorex.native`. | dApp-urile de tip Cosmos semnează tranzacții pe lane-ul **Native** QoreChain la fel cum ar face-o cu Keplr; stratul post-cuantic este aplicat în prealabil (vezi [Semnarea post-cuantică](#pqc)). |
| **Solana Wallet Standard** *(de la 0.1.5)* | Descoperire nativă de portofel pentru dApp-urile Solana (`wallet-standard:register-wallet` / `app-ready`). | dApp-urile Solana **detectează automat QoreX** — fără integrare personalizată. Funcții: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; lanțul `solana:mainnet`; tranzacții atât `legacy`, cât și `v0`. |

:::note Accesarea directă a lane-ului SVM
Aceeași interfață este disponibilă și pe `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). Descoperirea automată Wallet-Standard și lane-ul SVM complet implementat au fost livrate în **0.1.5** și sunt live atât pe Chrome, cât și pe Firefox (vezi [ce versiune este live unde](#versions)).

Aprobările Solana afișează payload-ul decodat (destinatar și lamport pentru transferurile System, precum și lista de programe), resping tranzacțiile care nu listează portofelul tău ca semnatar și marchează semnătura drept **clasică** — vezi [Semnarea post-cuantică](#pqc).
:::

## Limbă {#language}

Extensia vorbește aceleași zece limbi ca aplicația mobilă, dashboard-ul și site-ul: engleză, română, germană, spaniolă, franceză, italiană, turcă, arabă, japoneză și coreeană. Aceasta urmează implicit limba **browserului** tău (revenind la engleză pentru orice altceva) — reține că aceasta este o sursă diferită față de aplicația mobilă, care urmează limba **telefonului**, astfel încât cele două pot afișa limbi diferite dacă telefonul și browserul tău sunt setate diferit. Un selector pe ecranul de repaus al popup-ului îți permite să suprascrii oricând limba detectată; comutarea la arabă întoarce imediat popup-ul de la dreapta la stânga, nu doar textul.

## Securitate și permisiuni {#security}

QoreX este construit pentru a fi verificabil, nu doar de încredere:

- **Seif (Vault)** — cheile tale sunt sigilate cu **AES-256-GCM**. Calea prin parolă își derivă cheia cu **Argon2id** (RFC 9106, memory-hard: 64 MiB, t=3, p=1), astfel încât un bloc de seif exfiltrat rezistă la spargere prin GPU/ASIC. (Blocurile legacy PBKDF2 rămân deschidibile și se re-sigilează în Argon2id la următoarea deblocare.)
- **Deblocare cu passkey (opțională, din 0.1.5)** — acolo unde autentificatorul tău acceptă extensia **WebAuthn PRF**, QoreX poate debloca seiful din ieșirea PRF de 32 de octeți a passkey-ului, în loc de o parolă tastată. Parola ta rămâne întotdeauna o soluție de rezervă.

  :::note Unde apare deblocarea cu passkey
  QoreX detectează automat WebAuthn și afișează opțiunea **Enable passkey unlock** doar acolo unde browserul o expune paginilor de extensie — adică **Chrome și Edge**. Pe **Firefox** opțiunea este ascunsă, pentru că Firefox nu expune WebAuthn paginilor de extensie. Acest lucru este așteptat, nu un bug.
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
]
```

- **`permissions: ["storage"]`** — singura permisiune de API. Stochează seiful criptat și aprobările tale de conexiune per origine **local**, în stocarea extensiei.
- **`host_permissions: []`** — QoreX nu declară **nicio** permisiune de gazdă. Nu cere capacitatea de a face cereri de rețea cross-origin către site-uri arbitrare în numele tău.
- **`content_scripts` cu potriviri `<all_urls>`** — acesta este motivul onest pentru care Firefox afișează *"Access your data for all websites."* QoreX injectează un mic script furnizor (`content.js` → `inpage.js`) în **fiecare pagină**. Un content script care rulează pe toate site-urile *poate* tehnic citi pagina, iar browserele descriu această capacitate cu exact această formulare — indiferent dacă provine din `host_permissions` sau dintr-o potrivire de content script.

**De ce content script-ul rulează peste tot.** Pentru ca **orice** dApp să poată descoperi portofelul prin EIP-6963 fără să trebuiască să acorzi mai întâi acces per site. Așa funcționează MetaMask, Keplr, Phantom și orice alt portofel injectat: furnizorul injectat trebuie să fie prezent înainte ca scripturile paginii să ruleze (`document_start`), pe orice site vizitezi.

**Ce face — și ce nu face — acest script.** El doar face legătura mesajelor de portofel (anunță furnizorul, transmite cererile de conectare/semnare către service worker, returnează rezultatul). Nu citește conținutul paginii dincolo de acele cereri de portofel, nu trimite nimic către un server și nu încarcă cod la distanță — și nu poate prelua date cross-origin arbitrare pentru că nu există permisiuni de gazdă. Toate acestea sunt verificabile: extensia este blocată prin CSP, nu include analiză și pachetul pentru Firefox include o arhivă sursă reproductibilă.

## Conectează un dApp la QoreX {#connect}

Un dApp descoperă lane-ul EVM al QoreX prin **EIP-6963**. Announce-and-request, apoi folosește furnizorul EIP-1193 returnat:

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

Pentru lane-ul **Native** al QoreChain, folosește furnizorul în stil Keplr de la `window.qorex.native` (`enable`, `getKey`, `signDirect`). Pachetul de nivel superior [`@qorechain/connect`](/sdk/overview) învelește această detecție pentru tine.

Aprobările sunt **per origine**: prima conexiune la un site deschide un popup de aprobare care arată originea, aprobarea dezvăluie doar adresa ta publică, iar aprobarea unui site nu acordă nimic altui site.

### Puntea către Dashboard (v0.1.5) {#dashboard-bridge}

Versiunea 0.1.5 adaugă o punte limitată strict la **`dashboard.qorechain.io`**: `window.qorex.native.connectProof(sessionId)` semnează dovada de asociere *Connect with QoreX* (back-end-ul re-verifică semnătura), iar `executeTransfer({ to, amountUqor, memo })` aprobă și transmite un transfer de QOR propus de Dashboard, returnând `txHash`. Aceste metode sunt refuzate pe orice altă origine.

Deoarece o adresă `qor1…` este la fel de validă atât pe mainnet, cât și pe testnet, o cerere propusă de Dashboard specifică rețeaua vizată, iar QoreX refuză să acționeze asupra ei dacă aceasta nu se potrivește cu rețeaua la care extensia este conectată în prezent — nu va comuta niciodată rețele în numele unei cereri.

## Semnarea post-cuantică {#pqc}

Fiecare transfer de QOR pe care QoreX îl inițiază este semnat cu o **semnătură hibridă post-cuantică** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) alături de semnătura clasică secp256k1 — folosind pipeline-ul hibrid complet din `@qorechain/sdk`. **Nu există comutator**: QoreChain o impune, iar QoreX nu trimite niciodată un transfer de QOR pe lane-ul Native fără ea.

- **Semnarea Native inițiată de dApp** — dApp-urile construite pe fluxul qorechain-connect pre-adaugă extensia PQC (`/qorechain.pqc.v1.PQCHybridSignature`) în corpul tranzacției înainte de a apela `signDirect`; QoreX contribuie jumătatea clasică și **refuză să semneze orb**, decodând payload-ul și marcând dacă stratul PQC este prezent.
- **Cererile clasice sunt mereu etichetate** — dacă o cerere nu conține niciun strat PQC sau vizează un lanț extern (ETH/BNB/etc., care nu poate purta PQC), QoreX afișează un avertisment explicit în loc să retrogradeze silențios.

**Ce înseamnă asta pentru dimensiunea tranzacției.** ML-DSA-87 este o semnătură mare: semnătura are **4,627 de octeți**, iar cheia publică **2,592 de octeți** (fixate de FIPS-204). O tranzacție hibridă QoreChain este, prin urmare, cu câțiva kiloocteți mai mare decât una pur clasică. Dacă îți construiești și transmiți singur tranzacțiile, dimensionează-ți buffer-ele și estimările de comision pentru octeții suplimentari; contabilizarea gazului din QoreChain îi așteaptă deja. Vezi [Semnarea post-cuantică](/developer-guide/post-quantum-signing) pentru primitive și cerința de semnare deterministă.
