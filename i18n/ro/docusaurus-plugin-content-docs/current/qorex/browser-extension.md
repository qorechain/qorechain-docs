---
slug: /qorex/browser-extension
title: Extensia de browser QoreX
sidebar_label: Extensie de browser
sidebar_position: 2
---

# Extensia de browser QoreX

**Extensia de browser** QoreX este portofelul QoreChain pentru desktop. Este un **portofel de sine stătător** — creezi sau imporți un portofel, deții și trimiți QOR și te conectezi la dApp-uri — și este componenta care permite oricărui site web să descopere QoreX și să transforme fiecare cerere într-o aprobare explicită și decodificată.

Este **disponibilă public** în trei magazine.

## Instalare {#install}

| Browser | Instalare |
|---|---|
| **Chrome și browsere Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 sau mai nou)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Ce versiune este disponibilă și unde {#versions}

Verificările din magazine se finalizează la momente diferite, așa că versiunea publicată diferă în prezent de la un browser la altul:

| Browser | Versiune publicată |
|---|---|
| **Firefox** | **0.1.5** |
| **Chrome / Chromium** | **0.1.3** (0.1.5 trimisă, în verificare) |
| **Safari (macOS)** | se livrează în interiorul aplicației macOS **QoreX Wallet**, care folosește propria numerotare de versiuni `1.x` |

**0.1.5** adaugă [descoperirea prin Solana Wallet Standard](#standards), [deblocarea cu passkey](#security), o [bandă dApp SVM](#standards) complet implementată și [puntea de conectare cu Dashboard-ul](#dashboard-bridge). (Versiunea 0.1.4 nu a fost publicată niciodată — modificările ei ajung la utilizatori odată cu 0.1.5.)

**Setul de permisiuni este identic în 0.1.3 și 0.1.5** — vezi [Ce permisiuni cere QoreX](#permissions).

:::note
Pe Safari, aprobările se deschid într-o filă de browser, nu într-o fereastră popup — extensia este împachetată cu wrapper-ul Apple pentru extensii web Safari, pornind de la aceeași bază de cod.
:::

## Creează sau restaurează un portofel {#wallet}

Deschide popup-ul și alege:

- **Creează portofel** — generează pe dispozitivul tău o frază de recuperare nouă, de 24 de cuvinte (entropie de 256 de biți), derivă identitatea ta QoreChain și o sigilează în seif sub o parolă (și, opțional, un passkey — vezi [Securitate](#security)).
- **Importă portofel** — restaurează dintr-o frază existentă de 24 de cuvinte.

Extensia își păstrează propriile chei; nu necesită aplicația mobilă. Poți, de asemenea, exporta fraza mnemonică din popup. Cheile nu părăsesc niciodată dispozitivul.

### Trimiteri pe rețele externe {#send-external}

Pe lângă QOR pe banda Native, popup-ul poate trimite active pe rețele externe, toate derivate din aceeași frază de recuperare:

| Tip | Rețele | Tokenuri incluse |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum | intrări ERC-20 (USDT, USDC, DAI acolo unde este cazul) |
| SVM | Solana | intrări SPL (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | intrare IBC (USDC pe Osmosis); câmp memo opțional |

Înainte ca un transfer extern să plece, trebuie să bifezi o confirmare explicită: **„Rețelele externe acceptă doar semnături clasice — spre deosebire de QOR-ul tău, acest transfer NU este rezistent cuantic.”** Lanțurile externe nu pot transporta o semnătură post-cuantică, iar QoreX nu ascunde niciodată acest lucru.

## Standarde de portofel acceptate {#standards}

QoreX expune trei interfețe, toate injectate în pagină ca `window.qorex` (`{ evm, native, svm }`) și descoperite prin contractele de detecție [`@qorechain/connect`](/sdk/overview).

| Standard | Ce este | Ce înseamnă pentru tine, ca dezvoltator |
|---|---|---|
| **EIP-1193** | API-ul JavaScript de provider Ethereum (`request(...)`, evenimente). | Codul tău existent ethers.js / viem / web3.js comunică nemodificat cu banda EVM a QoreX; codurile numerice de eroare (de ex. `4902`) sunt transmise mai departe identic. |
| **EIP-6963** | Descoperirea providerilor pentru mai multe portofele (evenimente de anunțare / cerere). | QoreX se anunță alături de orice alt portofel — **nu suprascrie niciodată `window.ethereum`** — astfel încât utilizatorul alege QoreX pentru fiecare site, fără conflicte. |
| **`signDirect` în stil Keplr** | Un provider în formă de `OfflineDirectSigner` pentru Cosmos, pe `window.qorex.native`. | dApp-urile în stil Cosmos semnează tranzacții QoreChain pe **banda Native** exact cum ar face-o cu Keplr; stratul post-cuantic este pre-aplicat (vezi [Semnare post-cuantică](#pqc)). |
| **Solana Wallet Standard** *(de la 0.1.5)* | Descoperire nativă a portofelului pentru dApp-uri Solana (`wallet-standard:register-wallet` / `app-ready`). | dApp-urile Solana **detectează automat QoreX** — fără integrare personalizată. Funcționalități: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; lanțul `solana:mainnet`; tranzacții atât `legacy`, cât și `v0`. |

:::note Accesul direct la banda SVM
Aceeași interfață este disponibilă și pe `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). Descoperirea automată prin Wallet-Standard și banda SVM complet implementată sosesc odată cu **0.1.5** — deci astăzi sunt disponibile pe **Firefox** și pe Chrome imediat ce 0.1.5 trece de verificare (vezi [ce versiune este disponibilă și unde](#versions)).

Aprobările Solana afișează payload-ul decodificat (destinatarul și lamports pentru transferurile System, precum și lista de programe), resping tranzacțiile care nu îți listează portofelul ca semnatar și marchează semnătura drept **clasică** — vezi [Semnare post-cuantică](#pqc).
:::

## Securitate și permisiuni {#security}

QoreX este construit ca să poată fi verificat, nu doar creditat pe cuvânt:

- **Seif** — cheile tale sunt sigilate cu **AES-256-GCM**. Calea cu parolă își derivă cheia cu **Argon2id** (RFC 9106, intensiv în memorie: 64 MiB, t=3, p=1), astfel încât un bloc de seif exfiltrat rezistă la spargere cu GPU/ASIC. (Blocurile mai vechi, cu PBKDF2, rămân deschizabile și se re-sigilează cu Argon2id la următoarea deblocare.)
- **Deblocare cu passkey (opțional, de la 0.1.5)** — acolo unde autentificatorul tău acceptă extensia **WebAuthn PRF**, QoreX poate debloca seiful pornind de la ieșirea PRF de 32 de octeți a passkey-ului, în locul unei parole tastate. Parola rămâne întotdeauna o variantă de rezervă.

  :::note Unde apare deblocarea cu passkey
  QoreX detectează prezența WebAuthn și afișează opțiunea **Activează deblocarea cu passkey** doar acolo unde browserul o expune paginilor de extensie — adică pe **Chrome și Edge**. Pe **Firefox** opțiunea este ascunsă, pentru că Firefox nu expune WebAuthn paginilor de extensie. Combinat cu [decalajul de versiuni](#versions), asta înseamnă că astăzi un utilizator de Firefox are Wallet Standard, dar nu și deblocare cu passkey, iar un utilizator de Chrome nu are niciuna dintre ele până când 0.1.5 trece de verificare. Este un comportament așteptat, nu o eroare.
  :::
- **Manifest V3 + CSP strict** — `script-src 'self'; object-src 'self'; base-uri 'self'`. **Nu există încărcare de cod la distanță** după instalare și nici `wasm-unsafe-eval`.
- **Fără cont, fără telemetrie** — fără analytics, fără urmărire, fără jurnalizare la distanță, fără înregistrare și fără e-mail. Listarea din Firefox declară colectarea de date ca `none`.

### Ce permisiuni cere QoreX și de ce {#permissions}

Această secțiune există pentru că listarea din Firefox afișează permisiunea **„Acces la datele tale pentru toate site-urile web”**, ceea ce poate părea în contradicție cu un portofel care nu declară nicio permisiune de gazdă. Iată adevărul exact, needitat, direct din manifest.

Fișierul `manifest.json` al extensiei declară:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — singura permisiune de API. Stochează seiful criptat și aprobările tale de conectare per origine **local**, în spațiul de stocare al extensiei.
- **`host_permissions: []`** — QoreX **nu** declară nicio permisiune de gazdă. Nu solicită capacitatea de a face cereri de rețea cross-origin către site-uri arbitrare în numele tău.
- **`content_scripts` are potrivirea `<all_urls>`** — acesta este motivul real pentru care Firefox spune *„Acces la datele tale pentru toate site-urile web.”* QoreX injectează un mic script de provider (`content.js` → `inpage.js`) în **fiecare pagină**. Un content script care rulează pe toate site-urile *poate*, tehnic, să citească pagina, iar browserele descriu această capacitate exact cu acea formulare — indiferent dacă provine din `host_permissions` sau dintr-o potrivire de content script.

**De ce rulează content script-ul peste tot.** Pentru ca **orice** dApp să poată descoperi portofelul prin EIP-6963 fără ca tu să acorzi mai întâi acces pentru fiecare site. Așa funcționează MetaMask, Keplr, Phantom și orice alt portofel injectat: providerul injectat trebuie să fie prezent înainte să ruleze scripturile paginii (`document_start`), pe orice site ai vizita.

**Ce face acel script — și ce nu face.** El doar face puntea pentru mesajele portofelului (anunță providerul, transmite cererile de conectare/semnare către service worker, returnează rezultatul). **Nu** citește conținutul paginii dincolo de acele cereri de portofel, nu trimite nimic către un server și nu încarcă cod la distanță — și nici nu poate prelua date cross-origin arbitrare, pentru că nu există permisiuni de gazdă. Toate acestea pot fi verificate: extensia este blocată prin CSP, nu livrează analytics, iar pachetul pentru Firefox include o arhivă zip de cod sursă reproductibilă.

## Conectează un dApp la QoreX {#connect}

Un dApp descoperă banda EVM a QoreX prin **EIP-6963**. Anunțare și cerere, apoi folosești providerul EIP-1193 returnat:

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

Pentru banda **Native** a QoreChain, folosește providerul în stil Keplr de la `window.qorex.native` (`enable`, `getKey`, `signDirect`). Pachetul de nivel mai înalt [`@qorechain/connect`](/sdk/overview) încapsulează această detecție pentru tine.

Aprobările sunt **per origine**: prima conectare la un site deschide un popup de aprobare care afișează originea, aprobarea dezvăluie doar adresa ta publică, iar aprobarea unui site nu acordă nimic altuia.

### Puntea către Dashboard (v0.1.5) {#dashboard-bridge}

Versiunea 0.1.5 adaugă o punte limitată **exclusiv la `dashboard.qorechain.io`**: `window.qorex.native.connectProof(sessionId)` semnează dovada de asociere *Connect with QoreX* (backend-ul re-verifică semnătura), iar `executeTransfer({ to, amountUqor, memo })` aprobă și difuzează un transfer QOR propus de Dashboard, returnând `txHash`. Aceste metode sunt refuzate pe orice altă origine.

## Semnare post-cuantică {#pqc}

Fiecare transfer QOR inițiat de QoreX însuși este semnat cu o **semnătură hibridă post-cuantică** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) alături de semnătura clasică secp256k1 — folosind întregul flux hibrid din `@qorechain/sdk`. **Nu există un comutator**: QoreChain o cere, iar QoreX nu trimite niciodată un transfer QOR pe banda Native fără ea.

- **Semnare Native inițiată de dApp** — dApp-urile construite pe fluxul qorechain-connect pre-aplică extensia PQC (`/qorechain.pqc.v1.PQCHybridSignature`) în corpul tranzacției înainte de a apela `signDirect`; QoreX contribuie cu jumătatea clasică și **refuză să semneze orbește**, decodificând payload-ul și marcând dacă stratul PQC este prezent.
- **Cererile clasice sunt întotdeauna etichetate** — dacă o cerere nu are strat PQC sau vizează un lanț extern (ETH/BNB/etc., care nu pot transporta PQC), QoreX afișează un avertisment explicit în loc să reducă nivelul de protecție în tăcere.

**Ce înseamnă asta pentru dimensiunea tranzacției.** ML-DSA-87 produce o semnătură mare: semnătura are **4,627 bytes**, iar cheia publică **2,592 bytes** (valori fixate de FIPS-204). Prin urmare, o tranzacție QoreChain hibridă este cu câțiva kiloocteți mai mare decât una pur clasică. Dacă îți construiești și difuzezi singur tranzacțiile, dimensionează-ți buffer-ele și estimările de comision pentru octeții suplimentari; contabilizarea de gas din QoreChain îi ia deja în calcul. Vezi [Semnare post-cuantică](/developer-guide/post-quantum-signing) pentru primitive și pentru cerința de semnare deterministă.
