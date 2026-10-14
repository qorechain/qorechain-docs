---
slug: /sdk/reference/cli
title: CLI — create-qorechain-dapp
sidebar_label: CLI
sidebar_position: 2
---

# CLI: `create-qorechain-dapp`

Genera una nuova dApp QoreChain a partire da un template starter ufficiale.

```bash
# interactive
npm create qorechain-dapp my-dapp
# or
npx create-qorechain-dapp my-dapp

# non-interactive (CI)
npx create-qorechain-dapp my-dapp --template evm-solidity --yes --no-install
```

> Pubblicato su npm come `create-qorechain-dapp` (`0.8.0`). I file
> `package.json` generati fissano `@qorechain/sdk` / `@qorechain/evm` a `^0.3.0`,
> che npm risolve in una release 0.3 incapace di firmare per le reti attive. Dopo
> lo scaffolding, esegui `npm i @qorechain/sdk@latest` (e `npm i @qorechain/evm@latest`
> per il template EVM).

## Template

| Template | Descrizione |
| --- | --- |
| `evm-solidity` | Un contratto Solidity `Counter` + uno script viem di deploy/interazione (`@qorechain/evm`). |
| `fullstack-web` | Una dApp Vite + React + TypeScript che legge saldi e tokenomics (`@qorechain/sdk`). |
| `rollup-app` | Un'app rollup + sidechain/paychain che usa il `RollupClient` e l'helper multilayer (`@qorechain/sdk`). |

Il template `fullstack-web` legge la panoramica della tokenomics tramite `client.qor`,
una chiamata JSON-RPC `qor_` che gli endpoint pubblici non servono, quindi su mainnet e
testnet quel pannello mostra un errore; la lettura del saldo funziona. Sostituiscila con
una lettura REST come `client.rest.getBurnStats()` per le reti pubbliche.

## Opzioni

| Flag | Descrizione |
| --- | --- |
| `-t, --template <name>` | Template da usare (`evm-solidity` \| `fullstack-web` \| `rollup-app`). |
| `--network <name>` | Preset di rete (`testnet` \| `mainnet`). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | Salta i prompt e usa i valori predefiniti. |
| `--no-install` | Non installa le dipendenze dopo lo scaffolding. |
| `--local` | Riscrive le dipendenze `@qorechain/*` come link `file:` locali nel monorepo dell'SDK. |
| `-h, --help` | Mostra l'aiuto. |
| `-v, --version` | Stampa la versione. |

## Sviluppo locale contro il workspace

I pacchetti `@qorechain/*` sono pubblicati su npm, quindi un semplice `npm install`
funziona. Usa `--local` per puntare invece il progetto generato ai pacchetti del
monorepo (compilali prima con `pnpm -r build`):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
