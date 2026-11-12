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

> Publié sur npm sous le nom `create-qorechain-dapp` (`0.14.0`, qui reprend aussi les correctifs de modèles de la 0.13.1). Les fichiers
> `package.json` générés dépendent de `@qorechain/sdk` `^0.14.0` (les templates EVM de
> `@qorechain/evm` `^0.14.0`). La version 0.8.0 du générateur écrivait des plages
> `^0.3.0`, que npm résout vers une version 0.3 incapable de signer pour les réseaux
> en service ; si vous avez échafaudé avec la 0.8.0, exécutez
> `npm i @qorechain/sdk@latest`.

## Templates

| Template | Description |
| --- | --- |
| `evm-solidity` | Un contrat Solidity `Counter` + un script de déploiement/interaction viem (`@qorechain/evm`). Lancez le script avec `pnpm run deploy` (et non `pnpm deploy`, qui est une autre commande pnpm) ; il lit `.env`, et son README explique comment ouvrir la fenêtre EVM avant le déploiement. |
| `fullstack-web` | Une dApp Vite + React + TypeScript lisant les soldes et la tokenomique (`@qorechain/sdk`). REST passe par un proxy Vite `/lcd` car le REST public n'envoie aucun en-tête CORS, si bien que le code du navigateur appelle `/lcd/...` en développement. |
| `rollup-app` | Une application rollup + sidechain/paychain utilisant le `RollupClient` et l'assistant multilayer (`@qorechain/sdk`). |
| `foundry` | Un projet Foundry pour l'EVM Engine de QoreChain. `pnpm window` enregistre la clé ML-DSA-87 du compte et ouvre la [fenêtre d'autorisation EVM](/sdk/guides/evm#evm-window) avant un déploiement (ajouté dans la 0.11.0, npm uniquement). |
| `hardhat` | La même chose pour Hardhat 3, avec `pnpm window status`, `register` et `open`. |
| `viem-wagmi` | Une dApp web sur viem et wagmi utilisant les chaînes `qorechain` et `qorechainTestnet` de `@qorechain/evm`. Épingle viem `~2.53.1` et utilise le même proxy `/lcd` pour REST. |
| `cosmwasm` | Un projet de contrat QoreChain Native (Wasm). Sur les réseaux en service, le téléversement de code est réservé à la gouvernance ; voir le [guide QoreChain Native](/sdk/guides/cosmwasm). |

Le template `rollup-app` (depuis le générateur 0.10.0) exécute un essai à blanc par défaut. Avec
`QORE_BROADCAST=1`, il dérive la clé ML-DSA-87 du compte à partir du mnémonique,
l'enregistre une fois et signe en hybride, ce que l'ancien template ne pouvait pas
faire. Ses valeurs de rollup d'exemple (`profile: "default"`, le stake) sont
illustratives : prenez les vrais noms de profils et le stake dans les
[Profils prédéfinis](/rollups/preset-profiles) et dans les paramètres du module en
direct avant de diffuser.

Le template `fullstack-web` lit la vue d'ensemble de la tokenomique via `client.qor`,
un appel JSON-RPC `qor_` que les points de terminaison publics ne servent pas ; sur le
mainnet et le testnet, ce panneau affiche donc une erreur, tandis que la lecture du
solde fonctionne. Remplacez-le par une lecture REST telle que
`client.rest.getBurnStats()` pour les réseaux publics.

## Options

| Flag | Description |
| --- | --- |
| `-t, --template <name>` | Template à utiliser (`evm-solidity` \| `fullstack-web` \| `rollup-app` \| `foundry` \| `hardhat` \| `viem-wagmi` \| `cosmwasm`). |
| `--network <name>` | Préréglage réseau (`testnet` \| `mainnet`). Écrit les points de terminaison publics du réseau choisi dans le `.env` généré (depuis la 0.13.1). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | Ignorer les invites et utiliser les valeurs par défaut. |
| `--no-install` | Ne pas installer les dépendances après l'échafaudage. |
| `--local` | Réécrire les dépendances `@qorechain/*` en liens locaux `file:` vers le monorepo du SDK. |
| `-h, --help` | Afficher l'aide. |
| `-v, --version` | Afficher la version. |

## Développement local sur le workspace

Les packages `@qorechain/*` sont publiés sur npm, donc un simple `npm install`
fonctionne. Utilisez `--local` pour pointer plutôt le projet échafaudé vers les
packages du monorepo (compilez-les d'abord avec `pnpm -r build`) :

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
