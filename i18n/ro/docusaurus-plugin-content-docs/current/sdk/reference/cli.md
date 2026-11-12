---
slug: /sdk/reference/cli
title: CLI — create-qorechain-dapp
sidebar_label: CLI
sidebar_position: 2
---

# CLI: `create-qorechain-dapp`

Schelărie pentru un nou dApp QoreChain pornind de la un șablon oficial de start.

```bash
# interactive
npm create qorechain-dapp my-dapp
# or
npx create-qorechain-dapp my-dapp

# non-interactive (CI)
npx create-qorechain-dapp my-dapp --template evm-solidity --yes --no-install
```

> Publicat pe npm ca `create-qorechain-dapp` (`0.14.0`, care poartă și corecțiile de șabloane din 0.13.1). Fișierele `package.json`
> generate depind de `@qorechain/sdk` `^0.14.0` (șabloanele EVM de `@qorechain/evm`
> `^0.14.0`). Versiunea 0.8.0 a schelei scria intervale `^0.3.0`, pe care npm le
> rezolvă la o versiune 0.3 care nu poate semna pentru rețelele live; dacă ai generat
> proiectul cu 0.8.0, rulează `npm i @qorechain/sdk@latest`.

## Șabloane

| Șablon | Descriere |
| --- | --- |
| `evm-solidity` | Un contract Solidity `Counter` + un script viem de deploy/interacțiune (`@qorechain/evm`). Rulează scriptul cu `pnpm run deploy` (nu `pnpm deploy`, care este o altă comandă pnpm); citește `.env`, iar README-ul său explică deschiderea ferestrei EVM înainte de deploy. |
| `fullstack-web` | Un dApp Vite + React + TypeScript care citește solduri și tokenomics (`@qorechain/sdk`). REST trece printr-un proxy Vite `/lcd`, pentru că REST-ul public nu trimite antete CORS, deci codul din browser apelează `/lcd/...` în dev. |
| `rollup-app` | O aplicație rollup + sidechain/paychain care folosește `RollupClient` și ajutorul multilayer (`@qorechain/sdk`). |
| `foundry` | Un proiect Foundry pentru EVM Engine al QoreChain. `pnpm window` înregistrează cheia ML-DSA-87 a contului și deschide [fereastra de autorizare EVM](/sdk/guides/evm#evm-window) înainte de un deploy (adăugat în 0.11.0, doar pe npm). |
| `hardhat` | La fel pentru Hardhat 3, cu `pnpm window status`, `register` și `open`. |
| `viem-wagmi` | Un dApp web pe viem și wagmi care folosește lanțurile `qorechain` și `qorechainTestnet` din `@qorechain/evm`. Fixează viem la `~2.53.1` și folosește același proxy `/lcd` pentru REST. |
| `cosmwasm` | Un proiect de contract QoreChain Native (Wasm). Pe rețelele live încărcarea codului este doar prin guvernanță; vezi [ghidul QoreChain Native](/sdk/guides/cosmwasm). |

Șablonul `rollup-app` (începând cu scaffolder 0.10.0) rulează implicit o simulare (dry run). Cu `QORE_BROADCAST=1`
derivă cheia ML-DSA-87 a contului din mnemonic, o înregistrează o singură dată și
semnează hibrid, ceea ce șablonul anterior nu putea face. Valorile sale de rollup de
exemplu (`profile: "default"`, stake-ul) sunt ilustrative: ia numele reale de profil și
stake-ul din [Profiluri presetate](/rollups/preset-profiles) și din parametrii live ai
modulului înainte de a difuza.

Șablonul `fullstack-web` citește prezentarea generală a tokenomics prin `client.qor`,
un apel JSON-RPC `qor_` pe care endpoint-urile publice nu îl servesc, așa că pe mainnet
și testnet acel panou afișează o eroare; citirea soldului funcționează. Treci-l la o
citire REST, precum `client.rest.getBurnStats()`, pentru rețelele publice.

## Opțiuni

| Flag | Descriere |
| --- | --- |
| `-t, --template <name>` | Șablonul de utilizat (`evm-solidity` \| `fullstack-web` \| `rollup-app` \| `foundry` \| `hardhat` \| `viem-wagmi` \| `cosmwasm`). |
| `--network <name>` | Presetare de rețea (`testnet` \| `mainnet`). Scrie punctele finale publice ale rețelei alese în `.env` generat (începând cu 0.13.1). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | Sari peste prompturi și folosește valorile implicite. |
| `--no-install` | Nu instala dependențele după schelărie. |
| `--local` | Rescrie dependențele `@qorechain/*` în linkuri locale `file:` către monorepo-ul SDK. |
| `-h, --help` | Afișează ajutorul. |
| `-v, --version` | Afișează versiunea. |

## Dezvoltare locală față de workspace

Pachetele `@qorechain/*` sunt publicate pe npm, așadar un simplu `npm install`
funcționează. Folosește `--local` pentru a indica în schimb proiectul schelărit spre
pachetele din monorepo (compilează-le mai întâi cu `pnpm -r build`):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
