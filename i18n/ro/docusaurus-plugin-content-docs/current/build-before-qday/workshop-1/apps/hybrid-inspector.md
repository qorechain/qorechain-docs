---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

Hybrid Inspector este o mică pagină web (construită cu React) care arată cum arată o semnătură hibridă QoreChain pe testnet-ul `qorechain-diana`. Conectezi portofelul QoreX, trimiți o tranzacție pe care QoreX o semnează atât cu secp256k1, cât și cu ML-DSA-87, iar pagina deschide tranzacția și îți arată: semnătura clasică, semnătura post-cuantică și verdictul lanțului însuși. Poți lipi și orice hash de tranzacție de pe testnet.

**Cât durează:** aproximativ 20 de minute, cu tot cu instalări. După aceea, pagina rulează în câteva secunde.

## Ce demonstrează {#what-it-shows}

- **Semnare hibridă ML-DSA-87 + secp256k1 dintr-o pagină web.** Pagina trimite un mesaj codificat către QoreX cu `qorexSignAndBroadcast`. QoreX semnează cu ambele chei și transmite tranzacția.
- **O tranzacție semnată hibrid, verificată pe lanț.** Pagina citește evenimentul `pqc_hybrid_verify` al tranzacției. Acel eveniment este lanțul care spune că a verificat semnătura post-cuantică.
- **Dimensiunile se văd.** Semnătura clasică are 64 de octeți. Semnătura ML-DSA-87 (FIPS 204) are 4.627 de octeți și circulă în extensia `PQCHybridSignature` a tranzacției.

## Pas cu pas {#steps}

Lucrezi în propriul terminal și în browser. Folosești doar un cont de testnet de unică folosință. QOR de testnet nu are valoare. Nu folosi niciodată aici un portofel real sau fonduri reale.

### 1. Înainte să începi: instalează uneltele {#install}

Ai nevoie de patru lucruri: un browser bazat pe Chromium (Chrome, Edge sau Brave), **Git** (descarcă codul), **Node.js** (rulează uneltele paginii) și **pnpm** (instalează bibliotecile paginii). Folosește Node.js 22 sau mai nou. Pagina funcționează și cu Node.js 20, dar 22 este alegerea sigură pentru toate aplicațiile atelierului.

**macOS**

| Unealtă | Cum se instalează | Verifică |
| --- | --- | --- |
| Git | `xcode-select --install` (sau `brew install git`) | `git --version` |
| Node.js 22+ | Descarcă instalatorul LTS de la https://nodejs.org sau rulează `brew install node` | `node --version` (trebuie să afișeze v22 sau mai mare) |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Windows** (folosește PowerShell)

| Unealtă | Cum se instalează | Verifică |
| --- | --- | --- |
| Git | Descarcă de la https://git-scm.com/download/win | `git --version` |
| Node.js 22+ | Descarcă instalatorul LTS de la https://nodejs.org (sau `winget install OpenJS.NodeJS.LTS`) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Linux (Debian sau Ubuntu)**

| Unealtă | Cum se instalează | Verifică |
| --- | --- | --- |
| Git | `sudo apt update && sudo apt install -y git curl` | `git --version` |
| Node.js 22+ | Urmează https://nodejs.org/en/download (alege Linux, apoi versiunea LTS) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Capcană:** Node.js instalat cu Homebrew nu include pnpm. Dacă vezi `pnpm: command not found`, rulează `npm install -g pnpm`, apoi deschide un terminal nou.

**Ce ar trebui să vezi:** fiecare comandă de verificare afișează un număr de versiune. `node --version` începe cu `v22` sau mai mare.

### 2. Înainte să începi: QoreX pe testnet {#qorex}

QoreX este portofelul oficial QoreChain. Această pagină are nevoie de **extensia de browser QoreX** în browserul în care deschizi pagina. Instaleaz-o din magazinul browserului tău. Vezi [Integrări QoreX](/developer-tools/qorex-integrations) și [browserul de dApp-uri](/qorex/dapp-browser).

Folosește un **cont nou, de unică folosință**, creat doar pentru acest exercițiu. QoreX afișează o frază de recuperare când creează contul. Scrie-o pe hârtie, ține-o privată și nu o reutiliza niciodată pe mainnet.

Comută QoreX pe testnet:

- **Extensia de browser:** deblocheaz-o, atinge de 7 ori numărul versiunii din partea de jos, apoi alege **Switch to testnet (diana)**.
- **Aplicația QoreX:** deschide Setări și activează **Use testnet (developers)**. (Pagina rulează într-un browser de desktop, așa că în acest tutorial folosești extensia.)

Vezi [Deploy în 5 minute](/getting-started/deploy-in-5-minutes#step-testnet) pentru mai multe detalii despre comutarea pe testnet. Copiază adresa contului tău (începe cu `qor1...`).

Nu ai nevoie de un cont Ethereum (coin 60) pentru această pagină, deoarece ea trimite o plată QoreChain Native.

### 3. Ia QOR de testnet de la faucet {#faucet}

Faucet-ul este un site care trimite QOR de testnet gratuit către o adresă.

1. Deschide https://dashboard.qorechain.io/faucet și autentifică-te.
2. Lipește adresa ta `qor1...` și cere fonduri. Faucet-ul oferă **100 QOR la fiecare 24 de ore pentru fiecare cont**.

**Sume:** unitatea pe care o citești este **QOR**. Lanțul numără în **uqor**, cea mai mică unitate. 1 QOR = 1.000.000 uqor. Pagina cere QOR și face conversia pentru tine.

**Bine de știut:** prima tranzacție a unui cont nou înregistrează pe lanț cheia sa post-cuantică ML-DSA-87. Este o taxă unică de aproximativ 0,09 QOR. QoreX o face pentru tine la prima trimitere.

### 4. Ia codul {#get-code}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

| Parte | Ce înseamnă |
| --- | --- |
| `git clone <adresă>` | Descarcă de pe GitHub o copie completă a aplicațiilor-exemplu într-un folder nou numit `build-before-qday`. |
| `cd <folder>` | Mută terminalul în folderul Hybrid Inspector. Toate comenzile următoare se rulează de aici. |

**Ce ar trebui să vezi:** `Cloning into 'build-before-qday'...`. Rulează `ls` ca să verifici: vezi `package.json`, `src`, `index.html` și `vite.config.ts`.

### 5. Instalează bibliotecile {#install-libs}

```sh
pnpm install
```

**Ce face:** `pnpm` descarcă bibliotecile de care are nevoie pagina (listate în `package.json`) într-un folder numit `node_modules`. Îl rulezi o singură dată pentru fiecare proiect.

| Parte | Ce înseamnă |
| --- | --- |
| `pnpm` | Unealta care instalează bibliotecile. |
| `install` | Citește `package.json` și instalează tot ce este listat acolo, la versiunile din `pnpm-lock.yaml`. |

**Cât durează:** sub un minut.

**Ce ar trebui să vezi:** o bară de progres, apoi `Done in` și un timp.

### 6. Verifică dacă se construiește {#build}

```sh
pnpm build
```

**Ce face:** rulează scriptul numit `build` din `package.json`. Acel script este `tsc --noEmit && vite build`.

| Parte | Ce înseamnă |
| --- | --- |
| `pnpm build` | Rulează scriptul `build` al proiectului. |
| `tsc --noEmit` | Verificatorul TypeScript. Caută greșeli în cod și nu scrie niciun fișier. |
| `vite build` | Vite împachetează pagina într-un mic site web, în folderul `dist`. |

**Ce ar trebui să vezi:** `transforming...`, apoi linii precum `dist/index.html` și, în final, `built in` cu un timp (sub o secundă).

### 7. Rulează pagina {#run}

```sh
pnpm dev
```

**Ce face:** rulează scriptul `dev`, care pornește un mic server web pe propriul tău calculator, ca să poți folosi pagina în browser. Lasă acest terminal deschis cât lucrezi. Apasă Ctrl+C ca să-l oprești.

**Ce ar trebui să vezi:**

```text
  VITE v5.4.21  ready in 111 ms

  ➜  Local:   http://localhost:5173/
```

Deschide http://localhost:5173 în browserul în care este instalat QoreX. Dacă portul 5173 este ocupat, Vite afișează alt port. Folosește adresa afișată.

Ca să inspectezi direct o tranzacție, adaugă `?tx=<HASH>` la adresă: `http://localhost:5173?tx=<HASH>`.

**De ce apelează pagina `/lcd`:** serviciul REST public de testnet nu trimite antete CORS, deci o pagină din browser nu îl poate apela direct. Serverul de dezvoltare redirecționează fiecare apel de la `/lcd` către `https://api-testnet.qore.host`. Pagina funcționează doar pe testnet și nu ai nevoie de niciun fișier `.env`.

### 8. Conectează, trimite și verifică {#connect-send}

1. **Conectează.** Apasă **Connect QoreX**. QoreX îți cere să permiți pagina. Aprobă. Pagina arată adresa ta (`qor1...`), soldul tău de testnet și dacă o cheie ML-DSA-87 este înregistrată. Până la prima trimitere scrie "not registered yet".
2. **Completează formularul de trimitere.**

| Câmp | Ce înseamnă |
| --- | --- |
| To | Adresa destinatarului (`qor1...`). Implicit este completată cu propria ta adresă, ceea ce e în regulă. |
| Amount (QOR) | Cât trimiți, în QOR. `1` înseamnă 1 QOR = 1.000.000 uqor. |
| Memo | Un text scurt atașat tranzacției și stocat pe lanț. Oricine îl poate citi, așa că nu scrie nimic privat. |

3. **Trimite.** Apasă **Sign with QoreX and send**. QoreX arată ce semnezi și cere aprobarea. Aprobă. Așteaptă blocul (câteva secunde).
4. **Inspectează.** Pagina inspectează tranzacția automat. Poți lipi și orice hash de tranzacție de testnet de 64 de caractere la pasul 3 al paginii și apăsa **Inspect**.

**Ce ar trebui să vezi:** o linie `QoreX: code 0, shield ..., tx <hash>`, apoi cardul de inspecție descris în "Ce ar trebui să vezi" mai jos. Copiază hash-ul tranzacției.

### 9. Verific-o și într-un al doilea mod, fără pagină {#verify-curl}

Poți întreba direct lanțul. Ai nevoie doar de `curl`, inclus în macOS și în majoritatea sistemelor Linux. În Windows PowerShell folosește `curl.exe`. Unealta `jq` este opțională și face răspunsul mai ușor de citit (`brew install jq` pe macOS, `sudo apt install -y jq` pe Linux, `winget install jqlang.jq` pe Windows).

```sh
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| Parte | Ce înseamnă |
| --- | --- |
| `curl -s <adresă>` | Descarcă răspunsul de la serviciul REST de testnet. `-s` ascunde bara de progres. |
| `<HASH>` | Hash-ul tranzacției tale, de la pasul 8. |
| `\| jq '...'` | Extrage trei valori. Fără `jq`, renunță la această parte și citește textul complet. |

**Ce ar trebui să vezi:**

- `code` este `0`: tranzacția a reușit.
- O extensie `PQCHybridSignature` (tip `/qorechain.pqc.v1.PQCHybridSignature`) cu un `pqc_signature`. Textul său base64 are 6.172 de caractere, adică 4.627 de octeți de semnătură ML-DSA-87.
- În `tx_response.events`, un eveniment de tip `pqc_hybrid_verify` cu atributul `status` setat la `verified`.

**În explorer:** deschide https://explore.qore.network, comută-l pe **Testnet** și caută hash-ul tranzacției tale.

## Depanare {#troubleshooting}

| Ce vezi | De ce | Ce faci |
| --- | --- | --- |
| `pnpm: command not found` | pnpm nu este instalat. Node.js de la Homebrew nu îl include. | Rulează `npm install -g pnpm`, apoi deschide un terminal nou. |
| `node --version` arată v18 sau mai mic | Node.js este prea vechi. | Instalează Node.js 22 sau mai nou (pasul 1). |
| Pagina spune `QoreX was not found in this page. Install the QoreX extension, switch it to testnet, and reload.` | Extensia lipsește, este blocată sau browserul nu este bazat pe Chromium. | Instalează și deblochează QoreX în Chrome, Edge sau Brave. Comută pe testnet, apoi reîncarcă pagina. |
| Faucet-ul spune că ai atins o limită de cereri | O cerere la 24 de ore pentru fiecare cont. | Așteaptă 24 de ore sau folosește un al doilea cont de unică folosință. |
| `account has no PQC key and classical fallback is disabled` | Cheia post-cuantică nu este încă înregistrată. | Trimite o dată din QoreX (înregistrează cheia la prima trimitere, aproximativ 0,09 QOR). Asigură-te că ai mai întâi QOR de la faucet. |
| `EVM authorisation window exhausted` | Aparține aplicației Hardhat, nu acestei pagini. | În acea aplicație, deschide o fereastră nouă cu `pnpm window open`. |
| `HHE10402` după deschiderea ferestrei | Aparține aplicației Hardhat. Fereastra are nevoie de câteva secunde. | Rulează din nou deploy-ul. |
| Eroare CORS în consola browserului | Pagina a apelat direct serviciul REST. | Folosește proxy-ul `/lcd` al serverului de dezvoltare (`pnpm dev`) și deschide pagina la `http://localhost:5173`. Nu deschide `dist/index.html` ca fișier. |
| `Enter an amount in QOR, for example 1.` | Suma este goală, zero sau nu este un număr. | Scrie un număr, de exemplu `1`. |
| `A transaction hash is 64 hex characters.` | Hash-ul lipit este greșit sau tăiat. | Lipește toate cele 64 de caractere. |
| `Transaction not found on qorechain-diana` | Hash-ul este din altă rețea sau blocul nu este încă final. | Așteaptă 10 secunde și încearcă din nou. Verifică dacă QoreX este pe testnet. |
| Portul 5173 este deja folosit | Alt program îl folosește. | Vite alege următorul port și îl afișează. Deschide acea adresă. |

## Codul {#code}

Conectarea și trimiterea:

```ts
import { getQorexNative, qorexSignAndBroadcast } from "@qorechain/qorex-types";

const native = getQorexNative();
await native.enable("qorechain-diana");
const key = await native.getKey("qorechain-diana");      // key.bech32Address

const r = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes(from, to, uqor) }],
  memo,
});                                                       // r.txHash, r.code, r.shield
```

Citirea dovezii de pe lanț:

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

`msgSendBytes` este un mic codificator protobuf din `src/App.tsx` pentru mesajul bancar `MsgSend`, deoarece QoreX primește mesajul codificat. Pagina marchează o tranzacție ca verificată hibrid când codul ei este 0, un eveniment `pqc_hybrid_verify` are statusul `verified`, iar semnătura post-cuantică are 4.627 de octeți.

## Ce ar trebui să vezi {#result}

- Antetul arată `qorechain-diana (testnet)` și o înălțime de bloc care tot crește.
- După conectare: adresa ta, soldul și starea cheii.
- După trimitere: hash-ul tranzacției și codul rezultatului, apoi cardul de inspecție cu memo-ul, tipul mesajului, semnătura clasică de 64 de octeți, semnătura ML-DSA-87 de 4.627 de octeți cu primii ei octeți în hex, numele algoritmului `ML-DSA-87 (FIPS 204)` și verdictul `pqc_hybrid_verify`.
- În explorer: deschide https://explore.qore.network, comută-l pe **Testnet** și caută hash-ul tranzacției tale.

## Pachete folosite {#packages}

| Pachet | Versiune | Folosit pentru |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (fixată) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | Listat ca dependență; pagina în sine folosește apeluri REST simple |
| `react`, `react-dom` | ^18.3.1 | Interfață |
| `@vitejs/plugin-react` | ^4.3.0 | Plugin Vite pentru React |
| `vite` | ^5.4.0 | Server de dezvoltare și build |
| `typescript` | ^5.6.3 | Verificarea tipurilor |

## Cod sursă {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
