---
slug: /qorex/browser-extension
title: Extensia de browser QoreX
sidebar_label: Extensie de browser
sidebar_position: 2
---

# Extensia de browser QoreX

**Extensia de browser** QoreX este portofelul QoreChain pentru desktop. Este un **portofel de sine stătător** — creezi sau imporți un portofel, deții și trimiți QOR și te conectezi la dApp-uri — și este componenta care permite oricărui site să descopere QoreX și să transforme fiecare cerere într-o aprobare explicită și decodată.

Este **activă și publică** în trei magazine.

## Instalare {#install}

| Browser | Instalare |
|---|---|
| **Chrome și browsere Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 or later)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

Build-ul public curent este **0.1.3**. Versiunea **0.1.5** se lansează chiar acum; aceasta adaugă [puntea de conectare cu Dashboard-ul](#dashboard-bridge). Suprafața de permisiuni rămâne neschimbată între aceste versiuni.

:::note
Pe Safari, aprobările se deschid într-o filă de browser în loc de o fereastră popup — extensia este împachetată cu învelișul Apple pentru extensii web Safari, din același cod-sursă.
:::

## Creează sau restaurează un portofel {#wallet}

Deschide popup-ul și alege:

- **Creează portofel** — generează o frază de recuperare nouă de 24 de cuvinte pe dispozitivul tău (entropie de 256 de biți), derivă identitatea ta QoreChain și o sigilează în seif sub o parolă (și, opțional, o passkey — vezi [Securitate](#security)).
- **Importă portofel** — restaurează dintr-o frază existentă de 24 de cuvinte.

Extensia își deține propriile chei; nu necesită aplicația mobilă. Poți de asemenea exporta fraza mnemonică din popup. Cheile nu părăsesc niciodată dispozitivul.

## Standarde de portofel acceptate {#standards}

QoreX expune trei interfețe, toate injectate în pagină ca `window.qorex` (`{ evm, native, svm }`) și descoperite prin contractele de detecție [`@qorechain/connect`](/sdk/overview).

| Standard | Ce este | Ce înseamnă pentru tine ca dezvoltator |
|---|---|---|
| **EIP-1193** | API-ul JavaScript pentru provider-ul Ethereum (`request(...)`, evenimente). | Codul tău existent ethers.js / viem / web3.js comunică nemodificat cu lane-ul EVM al QoreX; codurile de eroare numerice (de ex. `4902`) sunt transmise mai departe verbatim. |
| **EIP-6963** | Descoperirea provider-ilor multi-portofel (evenimente announce / request). | QoreX se anunță alături de orice alt portofel — **nu suprascrie niciodată `window.ethereum`** — astfel încât utilizatorul alege QoreX per site fără conflicte. |
| **`signDirect` în stil Keplr** | Un provider în forma unui `OfflineDirectSigner` Cosmos pe `window.qorex.native`. | dApp-urile în stil Cosmos semnează tranzacțiile QoreChain pe **lane-ul Native** la fel cum ar face cu Keplr; stratul post-cuantic este pre-aplicat (vezi [Semnare post-cuantică](#pqc)). |

:::note SVM (compatibil Solana)
Un provider SVM este expus pe `window.qorex.svm` cu `connect` / `signAndSendTransaction` / `signMessage`. QoreX **nu** se înregistrează încă prin protocolul de descoperire **Wallet Standard** al Solana, deci dApp-urile Solana care se bazează pe auto-descoperirea Wallet-Standard nu vor detecta automat QoreX — accesează-l deocamdată direct prin `window.qorex.svm`.
:::

## Securitate și permisiuni {#security}

QoreX este construit pentru a fi verificabil, nu doar pentru a inspira încredere:

- **Seif** — cheile tale sunt sigilate cu **AES-256-GCM**. Calea prin parolă își derivă cheia cu **Argon2id** (RFC 9106, memory-hard: 64 MiB, t=3, p=1), astfel încât un blob de seif exfiltrat rezistă la spargere pe GPU/ASIC. (Blob-urile PBKDF2 vechi rămân deschidabile și se re-sigilează la Argon2id la următoarea deblocare.)
- **Deblocare cu passkey (opțional)** — acolo unde autentificatorul tău acceptă extensia **WebAuthn PRF**, QoreX poate debloca seiful din output-ul PRF de 32 de octeți al passkey-ului în loc de o parolă tastată.
- **Manifest V3 + CSP strict** — `script-src 'self'; object-src 'self'; base-uri 'self'`. **Nu există încărcare de cod la distanță** după instalare și niciun `wasm-unsafe-eval`.
- **Fără cont, fără telemetrie** — fără analytics, fără urmărire, fără logare la distanță, fără înregistrare și fără email. Listarea din Firefox declară colectarea de date ca `none`.

### Ce permisiuni cere QoreX și de ce {#permissions}

Această secțiune există pentru că listarea din Firefox afișează permisiunea **„Access your data for all websites”**, care poate părea în contradicție cu un portofel ce declară zero permisiuni de gazdă. Iată adevărul exact, needitat, din manifest.

Fișierul `manifest.json` al extensiei declară:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — singura permisiune de API. Stochează seiful criptat și aprobările tale de conexiune per-origine **local**, în stocarea extensiei.
- **`host_permissions: []`** — QoreX declară **zero** permisiuni de gazdă. Nu cere capacitatea de a face cereri de rețea cross-origin către site-uri arbitrare în numele tău.
- **`content_scripts` se potrivește cu `<all_urls>`** — acesta este motivul onest pentru care Firefox spune *„Access your data for all websites.”* QoreX injectează un mic script de provider (`content.js` → `inpage.js`) în **fiecare pagină**. Un content script care rulează pe toate site-urile *poate* tehnic să citească pagina, iar browserele descriu acea capacitate exact cu acele cuvinte — fie că provine din `host_permissions`, fie dintr-o potrivire de content-script.

**De ce rulează content script-ul peste tot.** Pentru ca **orice** dApp să poată descoperi portofelul prin EIP-6963 fără să acorzi mai întâi acces per-site. Așa funcționează MetaMask, Keplr, Phantom și orice alt portofel injectat: provider-ul injectat trebuie să fie prezent înainte ca scripturile paginii să ruleze (`document_start`), pe orice site vizitezi.

**Ce face acel script — și ce nu face.** Doar face punte pentru mesajele portofelului (anunță provider-ul, transmite cererile de conectare/semnare către service worker, returnează rezultatul). **Nu** citește conținutul paginii dincolo de acele cereri de portofel, nu trimite nimic către un server și nu încarcă cod la distanță — și nu poate prelua date cross-origin arbitrare pentru că nu există permisiuni de gazdă. Toate acestea sunt verificabile: extensia este blocată prin CSP, nu conține analytics, iar pachetul Firefox include un zip de cod-sursă reproductibil.

## Conectează un dApp la QoreX {#connect}

Un dApp descoperă lane-ul EVM al QoreX prin **EIP-6963**. Announce-and-request, apoi folosește provider-ul EIP-1193 returnat:

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

Pentru lane-ul **Native** QoreChain, folosește provider-ul în stil Keplr de la `window.qorex.native` (`enable`, `getKey`, `signDirect`). Pachetul de nivel superior [`@qorechain/connect`](/sdk/overview) împachetează această detecție pentru tine.

Aprobările sunt **per-origine**: prima conexiune la un site deschide un popup de aprobare care afișează originea, aprobarea dezvăluie doar adresa ta publică, iar aprobarea unui site nu acordă nimic altui site.

### Puntea către Dashboard (v0.1.5) {#dashboard-bridge}

Versiunea 0.1.5 adaugă o punte limitată exclusiv la **`dashboard.qorechain.io`**: `window.qorex.native.connectProof(sessionId)` semnează dovada de asociere *Connect with QoreX* (backend-ul re-verifică semnătura), iar `executeTransfer({ to, amountUqor, memo })` aprobă și difuzează un transfer QOR propus de Dashboard, returnând `txHash`. Aceste metode sunt refuzate pe orice altă origine.

## Semnare post-cuantică {#pqc}

Fiecare transfer QOR pe care QoreX îl inițiază el însuși este semnat cu o **semnătură hibridă post-cuantică** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) alături de semnătura clasică secp256k1 — folosind pipeline-ul hibrid complet din `@qorechain/sdk`. **Nu există niciun comutator**: QoreChain o cere, iar QoreX nu trimite niciodată un transfer QOR pe lane-ul Native fără ea.

- **Semnare Native inițiată de dApp** — dApp-urile construite pe fluxul qorechain-connect pre-suprapun extensia PQC (`/qorechain.pqc.v1.PQCHybridSignature`) în corpul tranzacției înainte de a apela `signDirect`; QoreX contribuie cu jumătatea clasică și **refuză să semneze orbește**, decodând payload-ul și marcând dacă stratul PQC este prezent.
- **Cererile clasice sunt întotdeauna etichetate** — dacă o cerere nu poartă niciun strat PQC sau vizează un lanț extern (ETH/BNB/etc., care nu pot purta PQC), QoreX afișează un avertisment explicit în loc să retrogradeze în tăcere.

**Ce înseamnă asta pentru dimensiunea tranzacției.** ML-DSA-87 este o semnătură mare: semnătura are **4,627 bytes**, iar cheia publică **2,592 bytes** (fixate de FIPS-204). O tranzacție hibridă QoreChain este prin urmare cu câțiva kiloocteți mai mare decât una pur clasică. Dacă îți construiești și difuzezi singur tranzacțiile, dimensionează-ți buffer-ele și estimările de comision pentru octeții suplimentari; contabilitatea de gas a QoreChain îi așteaptă deja. Vezi [Semnare post-cuantică](/developer-guide/post-quantum-signing) pentru primitivele și cerința de semnare deterministă.
