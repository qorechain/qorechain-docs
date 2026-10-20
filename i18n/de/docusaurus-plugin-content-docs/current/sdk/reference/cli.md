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

> Veröffentlicht auf npm als `create-qorechain-dapp` (`0.9.0`). Die erzeugten
> `package.json`-Dateien hängen von `@qorechain/sdk` `^0.9.0` ab (die EVM-Vorlage von
> `@qorechain/evm` `^0.8.0`). Version 0.8.0 des Scaffolders schrieb `^0.3.0`-Bereiche,
> die npm zu einem 0.3-Release auflöst, das für die Live-Netzwerke nicht signieren kann; wenn Sie
> mit 0.8.0 ein Gerüst erstellt haben, führen Sie `npm i @qorechain/sdk@latest` aus.

## Vorlagen

| Vorlage | Beschreibung |
| --- | --- |
| `evm-solidity` | Ein Solidity-`Counter`-Contract + ein viem-Deploy-/Interaktions-Skript (`@qorechain/evm`). |
| `fullstack-web` | Eine Vite + React + TypeScript-dApp, die Guthaben und Tokenomics liest (`@qorechain/sdk`). |
| `rollup-app` | Eine Rollup- + Sidechain-/Paychain-App mit dem `RollupClient` und dem Multilayer-Helfer (`@qorechain/sdk`). |

Die Vorlage `rollup-app` (0.9.0) führt standardmäßig einen Probelauf aus. Mit `QORE_BROADCAST=1`
leitet sie den ML-DSA-87-Schlüssel des Kontos aus der Mnemonic ab, registriert ihn einmalig und signiert
hybrid, was die frühere Vorlage nicht konnte. Ihre Beispielwerte für den Rollup
(`profile: "default"`, der Stake) sind illustrativ: Entnehmen Sie die echten Profilnamen und den
Stake aus den [Preset-Profilen](/rollups/preset-profiles) und den aktuellen Modulparametern, bevor Sie senden.

Die Vorlage `fullstack-web` liest die Tokenomics-Übersicht über `client.qor`, einen
JSON-RPC-Aufruf `qor_`, den die öffentlichen Endpunkte nicht bereitstellen; daher zeigt dieses Panel im Mainnet und
Testnet einen Fehler an, während das Lesen des Guthabens funktioniert. Stellen Sie es für die öffentlichen Netzwerke auf einen REST-Lesezugriff
wie `client.rest.getBurnStats()` um.

## Optionen

| Flag | Beschreibung |
| --- | --- |
| `-t, --template <name>` | Zu verwendende Vorlage (`evm-solidity` \| `fullstack-web` \| `rollup-app`). |
| `--network <name>` | Netzwerk-Voreinstellung (`testnet` \| `mainnet`). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | Abfragen überspringen und Standardwerte verwenden. |
| `--no-install` | Nach dem Scaffolding keine Abhängigkeiten installieren. |
| `--local` | `@qorechain/*`-Abhängigkeiten auf lokale `file:`-Links in das SDK-Monorepo umschreiben. |
| `-h, --help` | Hilfe anzeigen. |
| `-v, --version` | Die Version ausgeben. |

## Lokale Entwicklung gegen den Workspace

`@qorechain/*`-Pakete sind auf npm veröffentlicht, daher funktioniert ein einfaches `npm install`. Verwenden Sie
`--local`, um das erstellte Projekt stattdessen auf die Monorepo-Pakete zeigen zu lassen (bauen Sie
diese zuerst mit `pnpm -r build`):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
