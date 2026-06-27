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

> Pubblicato su npm come `create-qorechain-dapp` (`0.3.0`).

## Template

| Template | Descrizione |
| --- | --- |
| `evm-solidity` | Un contratto Solidity `Counter` + uno script viem di deploy/interazione (`@qorechain/evm`). |
| `fullstack-web` | Una dApp Vite + React + TypeScript che legge saldi e tokenomics (`@qorechain/sdk`). |

## Opzioni

| Flag | Descrizione |
| --- | --- |
| `-t, --template <name>` | Template da usare (`evm-solidity` \| `fullstack-web`). |
| `--network <name>` | Preset di rete (`testnet` \| `mainnet`). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | Salta i prompt e usa i valori predefiniti. |
| `--no-install` | Non installa le dipendenze dopo lo scaffolding. |
| `--local` | Riscrive le dipendenze `@qorechain/*` come link `file:` locali nel monorepo dell'SDK. |
| `-h, --help` | Mostra l'aiuto. |
| `-v, --version` | Stampa la versione. |

## Sviluppo locale contro il workspace

I pacchetti `@qorechain/*` sono pubblicati su npm; una volta pubblicati un semplice
`npm install` funziona. Prima di allora, usa `--local` per puntare il progetto generato
ai pacchetti del monorepo (compilali prima con `pnpm -r build`):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
