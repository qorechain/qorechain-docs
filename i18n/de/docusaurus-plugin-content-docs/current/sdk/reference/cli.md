---
slug: /sdk/reference/cli
title: CLI — create-qorechain-dapp
sidebar_label: CLI
sidebar_position: 2
---

# CLI: `create-qorechain-dapp`

Erstellen Sie eine neue QoreChain-dApp aus einer offiziellen Starter-Vorlage.

```bash
# interactive
npm create qorechain-dapp my-dapp
# or
npx create-qorechain-dapp my-dapp

# non-interactive (CI)
npx create-qorechain-dapp my-dapp --template evm-solidity --yes --no-install
```

> Veröffentlicht auf npm als `create-qorechain-dapp` (`0.3.0`).

## Vorlagen

| Vorlage | Beschreibung |
| --- | --- |
| `evm-solidity` | Ein Solidity-`Counter`-Contract + ein viem-Deploy-/Interaktions-Skript (`@qorechain/evm`). |
| `fullstack-web` | Eine Vite + React + TypeScript-dApp, die Guthaben und Tokenomics liest (`@qorechain/sdk`). |

## Optionen

| Flag | Beschreibung |
| --- | --- |
| `-t, --template <name>` | Zu verwendende Vorlage (`evm-solidity` \| `fullstack-web`). |
| `--network <name>` | Netzwerk-Voreinstellung (`testnet` \| `mainnet`). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | Abfragen überspringen und Standardwerte verwenden. |
| `--no-install` | Nach dem Scaffolding keine Abhängigkeiten installieren. |
| `--local` | `@qorechain/*`-Abhängigkeiten auf lokale `file:`-Links in das SDK-Monorepo umschreiben. |
| `-h, --help` | Hilfe anzeigen. |
| `-v, --version` | Die Version ausgeben. |

## Lokale Entwicklung gegen den Workspace

`@qorechain/*`-Pakete sind auf npm veröffentlicht; nach der Veröffentlichung
funktioniert ein einfaches `npm install`. Verwenden Sie davor `--local`, um das
erstellte Projekt auf die Monorepo-Pakete zeigen zu lassen (bauen Sie diese zuerst mit
`pnpm -r build`):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
