---
slug: /build-before-qday/workshop-1
title: "Workshop 1: Prima ta tranzacție semnată hibrid"
sidebar_label: "Workshop 1"
sidebar_position: 2
date: 2026-11-12
---

# Workshop 1: Prima ta tranzacție semnată hibrid

Acest ghid te duce de la un calculator fără nimic instalat până la o tranzacție semnată simultan cu două chei și verificată de testnetul QoreChain. Totul rulează în propriul tău mediu, cu un cont de testnet de unică folosință.

## Ce construim {#what-we-built}

Un proiect Solidity complet, generat cu o singură comandă, testat, implementat pe testnetul QoreChain, apoi o tranzacție semnată **simultan cu două chei** și verificată de lanț.

Ce demonstrează:

- **Semnare hibridă.** Tranzacția poartă o semnătură clasică secp256k1 și o semnătură post-cuantică ML-DSA-87 (NIST FIPS 204).
- **O tranzacție semnată hibrid, verificată pe lanț.** Validatorii verifică ambele semnături. Dovada o citești de la punctul final REST public (extensia `PQCHybridSignature` și evenimentul `pqc_hybrid_verify`) și în explorer.
- **Fereastra de autorizare EVM.** O tranzacție Ethereum nu poate purta o semnătură post-cuantică, așa că pe QoreChain îți înregistrezi o singură dată cheia ML-DSA-87 și deschizi o fereastră scurtă, cu un mesaj semnat hibrid, în care tranzacțiile tale EVM obișnuite sunt admise. Ideea în detaliu este în [Deploy în 5 minute](/getting-started/deploy-in-5-minutes).

Exact asta cere nivelul Quantum Pass.

## Cerințe preliminare {#prerequisites}

Ai nevoie de un calculator cu macOS, Linux sau Windows (cu WSL), un terminal și un browser web. Instalează mai întâi următoarele și verifică fiecare versiune:

| Instrument | Versiune | Verificare | Instalare |
| --- | --- | --- | --- |
| Node.js | 22 sau mai nouă (Hardhat 3 o cere) | `node -v` | [nodejs.org](https://nodejs.org) |
| pnpm | 9 sau mai nouă | `pnpm -v` | `npm install -g pnpm` (sau `corepack enable`) |
| curl | oricare | `curl --version` | inclus pe macOS și Linux |
| jq (opțional) | oricare | `jq --version` | [jqlang.org](https://jqlang.org), folosit doar pentru a filtra ieșirea la pasul 6 |

Ai nevoie și de un cont pe dashboardul QoreChain ca să folosești faucetul (pasul 4).

Rețeaua și punctele finale publice folosite în acest ghid:

| Serviciu | URL |
| --- | --- |
| Testnet | `qorechain-diana`, EVM chain ID 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (comută pe Testnet) |
| Faucet | `https://dashboard.qorechain.io/faucet` (necesită autentificare) |

:::caution Doar chei de testnet de unică folosință
Folosește chei create pentru acest exercițiu, care conțin doar QOR de test. Nu pune niciodată în `.env` o cheie sau un cod de recuperare ale unui cont cu fonduri reale și nu comite niciodată `.env` în git.
:::

## Pași {#steps}

### Pasul 1: Verifică-ți instrumentele {#step-1}

1. Deschide un terminal.
2. Rulează verificările din tabelul de mai sus:

```bash
node -v
pnpm -v
```

`node -v` trebuie să afișeze `v22` sau mai mare. Dacă nu, instalează un Node.js mai nou înainte de a continua.

### Pasul 2: Generează proiectul și rulează testele {#step-2}

1. Creează proiectul într-un folder nou. Comanda `npx` descarcă generatorul, deci are nevoie de acces la internet:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

2. Intră în folder și rulează testele. Ele rulează pe un lanț simulat local și nu trimit nimic:

```bash
cd qday-demo
pnpm test
```

Ar trebui să vezi `Done! Created qday-demo`, apoi `2 passing` de la teste.

3. Privește ce ai obținut: `contracts/Counter.sol`, `ignition/modules/Counter.ts`, `scripts/window.ts` (ajutorul pentru fereastra de autorizare) și `hardhat.config.ts` cu rețeaua `qorechainTestnet` (chain ID 9800). Mai multe despre șabloane: [Generatoare și CLI](/developer-tools/scaffolders-and-cli) și [Kitul pentru dezvoltatori de lanț](/developer-tools/chain-dev-sdk).

### Pasul 3: Creează un cont de testnet de unică folosință {#step-3}

Contul are nevoie de două secrete: o cheie privată în stil Ethereum și un **cod de recuperare** (începe cu `QRC1`) din care se derivă cheia post-cuantică ML-DSA-87. Comanda de mai jos generează ambele cu biblioteci pe care proiectul le-a instalat deja și le scrie direct într-un fișier `.env` nou, așa că nimic nu este afișat pe ecran și nimic nu este lipit nicăieri. Rulează-o din interiorul folderului `qday-demo`:

```bash
node --input-type=module -e '
import { generatePrivateKey } from "viem/accounts";
import { generatePqcRecoveryCode } from "@qorechain/sdk";
import { writeFileSync } from "node:fs";
writeFileSync(".env", `PRIVATE_KEY=${generatePrivateKey()}\nQORE_PQC_RECOVERY_CODE=${generatePqcRecoveryCode()}\nQORE_NETWORK=testnet\n`);
console.log(".env written");
'
```

Afișează `.env written`. Note:

- Comanda înlocuiește fișierul `.env` provizoriu creat de generator. Rulează-o o singură dată. O nouă rulare creează alt cont și altă cheie post-cuantică.
- Păstrează `.env` așa cum este: aceeași cheie privată și același cod de recuperare îți dau de fiecare dată același cont. Dacă pierzi fișierul, o iei de la capăt cu un cont nou.
- Preferi o frază mnemonică? Pune `QORE_MNEMONIC="your twelve words"` în `.env`, în locul celor două linii de mai sus. Cu o frază mnemonică, ambele chei provin din aceeași frază și nu mai e nevoie de cod de recuperare. Folosește o frază creată doar pentru acest exercițiu.

Acum cere proiectului adresa noului tău cont:

```bash
pnpm window status
```

Ar trebui să vezi trei linii:

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

Copiază adresa `qor1...`. Aceea o dai faucetului.

### Pasul 4: Primește QOR de testnet de la faucet {#step-4}

1. Deschide [faucetul](https://dashboard.qorechain.io/faucet) în browser și autentifică-te.
2. Lipește adresa ta `qor1...` (sau alege **Use my address**, dacă dashboardul o cunoaște).
3. Alege **Request Tokens**. Cardul afișează **Tokens Sent!** cu 100 QOR, plus tokenurile de test ale festivalului, și un link **View on Explorer**.

Faucetul plătește o dată la 24 de ore pentru fiecare cont și pentru fiecare adresă. Sumele exacte sunt pe pagina [Faucet](/dashboard/faucet). Înapoi în terminal, verifică dacă contul există acum pe lanț:

```bash
pnpm window status
```

Ieșirea acum răspunde, în loc să eșueze cu "does not exist on chain yet".

### Pasul 5: Înregistrează cheia, deschide fereastra, implementează {#step-5}

1. Înregistrează-ți cheia ML-DSA-87. Este un pas unic pentru fiecare cont, semnat cu cheia clasică, după cum cere lanțul pentru înregistrare:

```bash
pnpm window register
```

Afișează `registered: <HASH>`.

2. Deschide fereastra de autorizare. Aceasta este ea însăși o tranzacție **semnată hibrid**:

```bash
pnpm window open
```

Afișează `opened: <HASH>`, apoi o linie de forma `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)`. Notează hashul de la `opened:`: îl verifici la pasul 6.

3. Așteaptă aproximativ 10 secunde. Fereastra a avansat nonce-ul contului, iar Hardhat așteaptă confirmările.
4. Compilează și implementează contractul:

```bash
pnpm build
pnpm deploy:testnet
```

Răspunde `y` la "Confirm deploy to network qorechainTestnet (9800)?". Ar trebui să vezi `CounterModule#Counter - 0x...`.

### Pasul 6: Verifică semnătura hibridă pe lanț {#step-6}

Tranzacția `opened:` de la pasul 5 a fost semnată cu ambele chei. Înlocuiește `<HASH>` cu acel hash și citește tranzacția de la punctul final REST public:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Caută:

1. `tx_response.code` egal cu `0`.
2. În corpul tranzacției, extensia `PQCHybridSignature` care conține semnătura ML-DSA-87: **4.627 de octeți**, alături de semnătura secp256k1 de 64 de octeți.
3. În `tx_response.events`, evenimentul `pqc_hybrid_verify` cu atributul `status` setat la `verified`. Ca să afișezi doar acest eveniment (necesită `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> \
  | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Apoi privește-o în explorer:

1. Deschide [explore.qore.network](https://explore.qore.network).
2. Comută selectorul de rețea pe **Testnet**.
3. Caută hashul. Pagina tranzacției arată securitatea semnăturii ca rezistentă cuantic, verificată pe lanț, cu algoritmul ML-DSA-87 (FIPS 204).

Aceasta este dovada: validatorii au verificat ambele semnături.

## Ce ar trebui să vezi {#what-you-should-see}

| Unde | Ce |
| --- | --- |
| După pasul 2 | `Done! Created qday-demo` și `2 passing` |
| După pasul 3 | `.env written`, apoi o linie `account:` cu adresele tale `0x...` și `qor1...` |
| După pasul 4 | **Tokens Sent!** pe faucet și un cont existent în `pnpm window status` |
| După pasul 5 | `registered: <HASH>`, `opened: <HASH>`, apoi `CounterModule#Counter - 0x...` |
| După pasul 6 | `code` 0, o semnătură ML-DSA-87 de 4.627 de octeți și `pqc_hybrid_verify` cu `status` `verified`, în ieșirea REST și în explorer, pe Testnet |

## Pachete folosite {#published}

Declarate în `package.json`-ul generat:

| Pachet | Registru | Versiune |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

Generatorul instalează și pluginurile Hardhat toolbox, Ignition și keystore enumerate în `package.json`-ul generat.

## Depanare {#troubleshooting}

| Ce vezi | De ce | Ce faci |
| --- | --- | --- |
| `HHE10402` sau "wait for confirmations" imediat după deschiderea ferestrei | Deschiderea ferestrei a avansat nonce-ul contului | Rulează din nou `pnpm deploy:testnet` |
| "EVM authorisation window exhausted" sau "no window" | Fereastra a rămas fără tranzacții sau blocuri, sau este limitată la alt contract (o fereastră limitată la alt contract blochează un deploy) | Rulează `pnpm window open` ca să deschizi o fereastră nouă, așteaptă aproximativ 10 secunde, apoi implementează din nou |
| "account has no PQC key and classical fallback is disabled" | Contul nu a înregistrat o cheie ML-DSA-87 | Rulează mai întâi `pnpm window register`, apoi deschide fereastra |
| "does not exist on chain yet" | Contul nu are încă QOR | Primește QOR de la faucet (pasul 4) |
| "Rate Limit Reached" pe faucet sau niciun token după 30 de secunde | O singură cerere la 24 de ore pentru fiecare cont și adresă, iar cererile sunt servite pe rând | Așteaptă câteva secunde și încearcă din nou, sau așteaptă sfârșitul perioadei de așteptare |
| `pnpm window` se oprește cu un mesaj despre un cod de recuperare lipsă | `.env` are `PRIVATE_KEY` fără `QORE_PQC_RECOVERY_CODE` | Repetă pasul 3 sau folosește `QORE_MNEMONIC` |
| Hardhat refuză să pornească | Node.js este mai vechi de 22 | Instalează Node.js 22 sau mai nou și rulează din nou `pnpm install` |

## Aplicațiile exemplu {#example-apps}

Același flux, din mai multe limbaje și front-enduri. Fiecare semnează hibrid. Toate se află în repository-ul public [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), în folderul `workshop-1`. Le obții cu:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

Pagina fiecărei aplicații este un ghid complet, de la început până la sfârșit.

| Aplicație | Limbaj | Pagină |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

Kiturile din spatele acestor aplicații sunt enumerate pe pagina [Kituri](/build-before-qday/workshop-1/kits). Ca să folosești portofelul QoreX cu un dApp din browser, vezi [QoreX](/qorex/overview).
