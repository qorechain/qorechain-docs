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

> Publicat pe npm ca `create-qorechain-dapp` (`0.8.0`). Fișierele `package.json`
> generate fixează `@qorechain/sdk` / `@qorechain/evm` la `^0.3.0`, pe care npm îl
> rezolvă la o versiune 0.3 care nu poate semna pentru rețelele live. După
> schelărie, rulează `npm i @qorechain/sdk@latest` (și `npm i @qorechain/evm@latest`
> pentru șablonul EVM).

## Șabloane

| Șablon | Descriere |
| --- | --- |
| `evm-solidity` | Un contract Solidity `Counter` + un script viem de deploy/interacțiune (`@qorechain/evm`). |
| `fullstack-web` | Un dApp Vite + React + TypeScript care citește solduri și tokenomics (`@qorechain/sdk`). |
| `rollup-app` | O aplicație rollup + sidechain/paychain care folosește `RollupClient` și ajutorul multilayer (`@qorechain/sdk`). |

Șablonul `fullstack-web` citește prezentarea generală a tokenomics prin `client.qor`,
un apel JSON-RPC `qor_` pe care endpoint-urile publice nu îl servesc, așa că pe mainnet
și testnet acel panou afișează o eroare; citirea soldului funcționează. Treci-l la o
citire REST, precum `client.rest.getBurnStats()`, pentru rețelele publice.

## Opțiuni

| Flag | Descriere |
| --- | --- |
| `-t, --template <name>` | Șablonul de utilizat (`evm-solidity` \| `fullstack-web` \| `rollup-app`). |
| `--network <name>` | Presetare de rețea (`testnet` \| `mainnet`). |
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
