---
slug: /sdk/reference/cli
title: CLI — create-qorechain-dapp
sidebar_label: CLI
sidebar_position: 2
---

# CLI : `create-qorechain-dapp`

Échafaudez une nouvelle dApp QoreChain à partir d'un template de démarrage
officiel.

```bash
# interactive
npm create qorechain-dapp my-dapp
# or
npx create-qorechain-dapp my-dapp

# non-interactive (CI)
npx create-qorechain-dapp my-dapp --template evm-solidity --yes --no-install
```

> Publié sur npm sous le nom `create-qorechain-dapp` (`0.3.0`).

## Templates

| Template | Description |
| --- | --- |
| `evm-solidity` | Un contrat Solidity `Counter` + un script de déploiement/interaction viem (`@qorechain/evm`). |
| `fullstack-web` | Une dApp Vite + React + TypeScript lisant les soldes et la tokenomique (`@qorechain/sdk`). |

## Options

| Flag | Description |
| --- | --- |
| `-t, --template <name>` | Template à utiliser (`evm-solidity` \| `fullstack-web`). |
| `--network <name>` | Préréglage réseau (`testnet` \| `mainnet`). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | Ignorer les invites et utiliser les valeurs par défaut. |
| `--no-install` | Ne pas installer les dépendances après l'échafaudage. |
| `--local` | Réécrire les dépendances `@qorechain/*` en liens locaux `file:` vers le monorepo du SDK. |
| `-h, --help` | Afficher l'aide. |
| `-v, --version` | Afficher la version. |

## Développement local sur le workspace

Les packages `@qorechain/*` sont publiés sur npm ; une fois publiés, un simple
`npm install` fonctionne. Avant cela, utilisez `--local` pour pointer le projet
échafaudé vers les packages du monorepo (compilez-les d'abord avec
`pnpm -r build`) :

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
