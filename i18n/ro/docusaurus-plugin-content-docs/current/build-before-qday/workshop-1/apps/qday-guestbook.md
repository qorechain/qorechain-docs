---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Q-Day Guestbook este o carte de oaspeți on-chain pe testnetul EVM QoreChain. Oricine o poate semna o singură dată pentru fiecare adresă, cu un mesaj de cel mult 140 de caractere. Are două părți: un contract Solidity cu un proiect Hardhat (`contracts-app/`) și o pagină web React (`web/`) care conectează portofelul QoreX, arată fereastra EVM a contului și listează live ultimele semnături.

## Ce demonstrează {#shows}

- **Un dApp din browser care semnează hibrid fără să știe.** Pagina este o aplicație wagmi și RainbowKit obișnuită. QoreX adaugă jumătatea ML-DSA-87 a semnăturii, astfel că aceeași tranzacție este protejată de secp256k1 și de o cheie post-cuantică.
- **Fereastra EVM este vizibilă în interfață.** Pagina citește fereastra contului de pe lanț și arată dacă este activă și câte blocuri și tranzacții au rămas.
- **Refuzuri ușor de înțeles.** Când lanțul refuză o scriere, `classifyEvmWindowRejection` asociază eroarea uneia dintre cele patru cauze (nicio cheie înregistrată, nicio fereastră, fereastră consumată, parametri invalizi), iar pagina arată remediul.
- **Semnături hibride verificate pe lanț.** Fiecare semnătură pe care o scrii este o tranzacție pe care lanțul a acceptat-o abia după ce a verificat ambele semnături (ML-DSA-87 și secp256k1).

## Înainte să începi {#prerequisites}

Ai nevoie de un terminal pe macOS, Linux sau Windows cu WSL ori Git Bash, și de aceste instrumente:

| Instrument | Versiune necesară | Verificare cu |
| --- | --- | --- |
| Git | orice versiune recentă | `git --version` |
| Node.js | 20.12 sau mai nouă (recomandat 22 LTS) | `node --version` |
| pnpm | 9 sau mai nouă | `pnpm --version` |

Instalează Node.js de la https://nodejs.org. Dacă `pnpm --version` eșuează, instalează pnpm cu `npm install -g pnpm` (sau `corepack enable`) și verifică din nou.

Ai nevoie și de un cont gratuit pe [dashboardul QoreChain](https://dashboard.qorechain.io) pentru faucet și, pentru partea din browser, de portofelul QoreX (extensia pentru un browser de desktop sau aplicația). Vezi [Integrări QoreX](/developer-tools/qorex-integrations) și [prezentarea QoreX](/qorex/overview). La pașii cu contractul nu folosești niciodată un portofel real: folosești un cont de testnet de unică folosință. QOR de testnet nu are valoare.

## Pas cu pas {#steps}

### 1. Obține codul {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

Proiectul are două foldere pe care le configurezi separat.

### 2. Contracte: instalează și testează {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

Ar trebui să vezi `3 passing` pentru testele `QDayGuestbook`. Ele rulează pe un lanț simulat local și nu au nevoie de nicio cheie.

### 3. Contracte: creează fișierul cu cheia de testnet {#step-account}

```sh
cp .env.example .env
```

Fișierul `.env` conține o cheie de unică folosință, deci nu-l comite niciodată și nu reutiliza cheia nicăieri într-un context real. Deschide `.env` în orice editor și completează două valori.

**a. O cheie privată de unică folosință.** Generează o cheie aleatoare de 32 de octeți:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

Copiază valoarea `0x...` afișată în `.env` ca `PRIVATE_KEY=0x...`, înlocuind valoarea provizorie formată din zerouri.

**b. Un cod de recuperare post-cuantic.** Cheia ML-DSA-87 a contului este derivată dintr-un cod de recuperare separat. Creează unul:

```sh
pnpm window recovery-code
```

Copiază linia `QRC1-...` afișată în `.env` ca `QORE_PQC_RECOVERY_CODE=QRC1-...`. Refolosește mereu același cod: un cod nou dă contului o altă cheie ML-DSA-87.

Lasă `QORE_MNEMONIC` gol și păstrează `QORE_NETWORK=testnet`. Acum `.env` arată așa (cu valori provizorii):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 4. Contracte: alimentează contul {#step-faucet}

```sh
pnpm window status
```

Prima linie afișează contul tău ca `0x...` și în forma `qor1...`. Copiază adresa `qor1...`, apoi:

1. Deschide https://dashboard.qorechain.io/faucet și autentifică-te.
2. Lipește adresa `qor1...` și cere QOR (100 QOR o dată la 24 de ore).
3. Așteaptă câteva secunde și rulează din nou `pnpm window status`.

### 5. Contracte: înregistrează cheia, deschide fereastra, implementează {#step-window}

```sh
pnpm window register        # once: registers your ML-DSA-87 key
pnpm window open            # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                    # opening the window advances the account's nonce
pnpm deploy:testnet         # Hardhat Ignition, answer y when asked to confirm
```

`pnpm deploy:testnet` afișează adresa `QDayGuestbook` implementată (`0x...`). Copiază-o. Înregistrarea este singurul mesaj pe care lanțul îl acceptă semnat clasic, deoarece nu există încă pe lanț o cheie față de care să verifice. Deschiderea ferestrei este semnată hibrid; păstrează hashul tranzacției pe care îl afișează.

### 6. Contracte: semnează din linia de comandă {#step-cli}

```sh
pnpm sign "Hello from my terminal"   # writes one entry
pnpm sign --read                     # lists the latest entries
```

Fiecare adresă poate semna o singură dată, deci un al doilea `pnpm sign` din același cont este refuzat de contract.

### 7. Pagina web: instalează și configurează {#step-web}

Deschide un al doilea terminal în același folder de proiect (sau întoarce-te la el cu `cd ..`), apoi:

```sh
cd web
pnpm install
cp .env.example .env
```

Deschide `web/.env` și setează adresa pe care ai copiat-o la pasul 5:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

Lasă `VITE_WALLETCONNECT_PROJECT_ID` gol: este necesar doar dacă adaugi în `src/wagmi.ts` un portofel bazat pe WalletConnect.

### 8. Pagina web: rulează-o {#step-run}

```sh
pnpm dev
```

Deschide http://localhost:5174 în browserul în care este instalat QoreX. Pagina citește lanțul prin RPC-ul EVM. Citește fereastra EVM prin REST, folosind proxy-ul Vite `/lcd`, deoarece punctul final REST public nu trimite antete CORS. Lista de semnături de la capăt arată deja intrarea pe care ai scris-o la pasul 6.

### 9. Semnează din QoreX {#step-sign}

1. Instalează QoreX și comută-l pe testnet. Pentru comutare, vezi [Deploy în 5 minute](/getting-started/deploy-in-5-minutes#step-testnet).
2. În QoreX folosește un cont coin-60 (Ethereum) cu o cheie ML-DSA-87 înregistrată și alimentează-l de la [faucet](/dashboard/faucet) (lipește adresa lui după autentificare).
3. Pe pagină, alege **Connect QoreX**, scrie un mesaj și alege **Sign**. QoreX se oferă să deschidă fereastra EVM în cadrul aprobării, dacă nu este deschisă niciuna.
4. Aprobă în QoreX.

### 10. Caută-l în explorer {#step-explorer}

Deschide https://explore.qore.network și comută selectorul de rețea pe **Testnet**. Caută hashul tranzacției de la pasul 6 sau 9, hashul de la `pnpm window open` ori adresa `QDayGuestbook`. Tranzacția ferestrei arată o semnătură post-cuantică pe care lanțul a verificat-o.

## Ce ar trebui să vezi {#result}

- `pnpm test` în `contracts-app` afișează `3 passing`.
- `pnpm window status` afișează `PQC key: registered` și `window: live`, cu blocurile și tranzacțiile rămase.
- `pnpm deploy:testnet` afișează adresa `QDayGuestbook` (`0x...`).
- `pnpm sign "..."` afișează hashul tranzacției și `status: success in block ...`.
- Pe pagină, pasul 1 arată contul tău `0x...`, lanțul `qorechain-diana EVM (9800)`, soldul și fereastra EVM ca `live`, cu blocurile și tranzacțiile rămase.
- După ce alegi **Sign** și aprobi în QoreX, apare un link de tranzacție către explorer, apoi `success in block ...`.
- Lista de la capăt arată numărul de semnături de pe lanț și ultimele intrări (cel mult 20), cele mai noi primele, reîmprospătate la câteva secunde.
- A doua încercare din aceeași adresă arată că adresa a semnat deja.

## Codul {#code}

Contractul păstrează intrările într-un array și permite o singură semnătură pe adresă:

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX este primul portofel din lista de conectori (`web/src/wagmi.ts`):

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

Pagina arată fereastra și explică refuzurile (`web/src/App.tsx`):

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## Pachete folosite {#packages}

Contracte (`contracts-app/`):

| Pachet | Versiune | Folosit pentru |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Scriptul ajutor pentru fereastră, semnare hibridă |
| `@qorechain/evm` | ^0.13.0 | Definiții de lanț, `evmWindowStatus`, `evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | Transmiterea mesajului ferestrei |
| `hardhat` | ^3.21.1 | Compilare, teste, implementare cu Ignition |
| `viem` | ^2.47.6 | Client Ethereum |
| `tsx` | ^4.19.0 | Rularea scripturilor TypeScript |
| `typescript` | ^5.6.3 | Verificarea tipurilor |

Pagina web (`web/`):

| Pachet | Versiune | Folosit pentru |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | Definiții de lanț, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX ca portofel RainbowKit |
| `@rainbow-me/rainbowkit` | ^2.2.11 | Butonul de conectare |
| `wagmi` | ^2.19.5 | Hookuri React pentru citiri și scrieri |
| `viem` | ^2.53.1 | Client Ethereum |
| `@tanstack/react-query` | ^5.59.0 | Obținerea datelor pentru fereastră și pentru citirile de lanț |
| `react`, `react-dom` | ^18.3.1 | Interfața |
| `vite` | ^5.4.0 | Server de dezvoltare |
| `@vitejs/plugin-react` | ^4.3.0 | Suport React pentru Vite |
| `typescript` | ^5.6.3 | Verificarea tipurilor |

Sursa: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
