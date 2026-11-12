---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

Hybrid Inspector este o pagină React mică, care arată cum arată o semnătură hibridă QoreChain pe testnetul `qorechain-diana`. Conectezi portofelul QoreX, trimiți o tranzacție pe care QoreX o semnează atât cu secp256k1, cât și cu ML-DSA-87, iar pagina o desface în părți: semnătura clasică, semnătura post-cuantică și verdictul lanțului însuși. Poți lipi și hashul oricărei tranzacții de testnet.

## Ce demonstrează {#what-it-shows}

- **Semnare hibridă ML-DSA-87 + secp256k1 dintr-o pagină web.** Pagina îi dă lui QoreX un mesaj codificat prin `qorexSignAndBroadcast`. QoreX semnează cu ambele chei și transmite tranzacția.
- **O tranzacție semnată hibrid, verificată pe lanț.** Pagina citește evenimentul `pqc_hybrid_verify` al lanțului pentru tranzacție. Acel eveniment este lanțul care spune că a verificat semnătura post-cuantică.
- **Dimensiunile sunt vizibile.** Semnătura clasică are 64 de octeți. Semnătura ML-DSA-87 (FIPS 204) are 4.627 de octeți și circulă în extensia `PQCHybridSignature` a tranzacției.

## Pas cu pas {#steps}

### 1. Instalează instrumentele

Ai nevoie de un browser pe bază de Chromium (Chrome, Edge, Brave), de Git, de Node.js 20 sau mai nou și de pnpm.

- Git: https://git-scm.com/downloads
- Node.js 20+: https://nodejs.org (versiunea LTS este suficientă)
- pnpm: `npm install -g pnpm`

Verifică versiunile:

```sh
git --version
node --version     # v20.0.0 or higher
pnpm --version     # 9 or higher
```

### 2. Instalează extensia de browser QoreX

Instalează QoreX din magazinul browserului tău. Pentru detalii, vezi [Integrări QoreX](/developer-tools/qorex-integrations) și [browserul de dApp-uri](/qorex/dapp-browser).

### 3. Creează în QoreX un cont de testnet de unică folosință

Acest workshop nu are nevoie niciodată de portofelul tău real. În QoreX, creează un cont **nou** (un profil nou sau un portofel nou), folosit doar pentru acest exercițiu, și comută-l pe testnetul `qorechain-diana`. Pentru comutarea pe testnet, vezi [Deploy în 5 minute](/getting-started/deploy-in-5-minutes#step-testnet). QoreX afișează o frază de recuperare când creează contul: notează-o pe hârtie, ține-o privată și nu o reutiliza niciodată pe mainnet. Contul nu are nicio valoare în afara acestui exercițiu.

Copiază adresa contului (începe cu `qor1...`).

### 4. Primește QOR de testnet de la faucet

1. Deschide https://dashboard.qorechain.io/faucet și autentifică-te.
2. Lipește adresa ta `qor1...` și revendică. O revendicare plătește 100 QOR, o dată la 24 de ore pentru fiecare cont.

### 5. Obține codul

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

### 6. Instalează dependențele

```sh
pnpm install
```

### 7. Verifică dacă se compilează

```sh
pnpm build
```

Comanda verifică tipurile proiectului și îl compilează. Se încheie cu `built in` și un timp.

### 8. Rulează pagina

```sh
pnpm dev
```

Deschide http://localhost:5173 în browserul în care este instalat QoreX. Adaugă `?tx=<HASH>` la adresă (`http://localhost:5173?tx=<HASH>`) ca să inspectezi direct o tranzacție. Dacă portul 5173 este ocupat, Vite afișează portul pe care îl folosește în loc.

Apelurile REST trec prin proxy-ul Vite `/lcd` către `https://api-testnet.qore.host`, deoarece punctul final REST public nu trimite antete CORS. Pagina funcționează doar pe testnet, iar fișierul `.env` nu este necesar.

### 9. Conectează, trimite și verifică

1. Apasă **Connect QoreX**. Pagina îți arată adresa (`qor1...`), soldul de testnet și dacă o cheie ML-DSA-87 este înregistrată. QoreX înregistrează cheia la prima ta trimitere.
2. **Trimite** o sumă mică de QOR cu un memo. QoreX îți arată ce semnezi și cere aprobarea.
3. Pagina inspectează automat tranzacția. Poți lipi și hashul oricărei tranzacții de testnet, de 64 de caractere.

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

- Antetul arată `qorechain-diana (testnet)` și o înălțime de bloc care continuă să crească.
- După conectare: adresa, soldul și starea cheii tale.
- După trimitere: hashul tranzacției și codul rezultatului, apoi cardul de inspecție cu memoul, tipul mesajului, semnătura clasică de 64 de octeți, semnătura ML-DSA-87 de 4.627 de octeți cu primii ei octeți în hex, numele algoritmului `ML-DSA-87 (FIPS 204)` și verdictul `pqc_hybrid_verify`.
- În explorer: deschide https://explore.qore.network, comută-l pe **Testnet** și caută hashul tranzacției tale.

## Pachete folosite {#packages}

| Pachet | Versiune | Folosit pentru |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (fixat) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | Listat ca dependență; pagina în sine folosește apeluri REST simple |
| `react`, `react-dom` | ^18.3.1 | Interfața |
| `@vitejs/plugin-react` | ^4.3.0 | Pluginul Vite pentru React |
| `vite` | ^5.4.0 | Server de dezvoltare și build |
| `typescript` | ^5.6.3 | Verificarea tipurilor |

## Codul sursă {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
