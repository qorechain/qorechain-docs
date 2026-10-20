---
slug: /sdk/reference/network
title: Réseau et endpoints
sidebar_label: Réseau et endpoints
sidebar_position: 1
---

# Référence réseau et endpoints

## Mainnet

| Champ | Valeur |
| --- | --- |
| Préréglage réseau | `mainnet` |
| Chain id | `qorechain-vladi` (en ligne depuis le 7 juin 2026) |
| Version de la chaîne (20 octobre 2026) | v3.2.3 |
| EVM chain ID | `9801` |
| Token d'affichage | `QOR` |
| Dénomination de base | `uqor` |
| Unités de base par QOR | `10^6` |
| Préfixe bech32 de compte | `qor` |
| Préfixe bech32 de validateur | `qorvaloper` |

## Testnet

| Champ | Valeur |
| --- | --- |
| Préréglage réseau | `testnet` |
| Chain id | `qorechain-diana` (en ligne) |
| Version de la chaîne (20 octobre 2026) | v3.2.4 (testnet uniquement pour l'instant ; la proposition 13 du mainnet l'appliquerait à la hauteur 3,742,566) |
| EVM chain ID | `9800` |
| Token d'affichage | `QOR` |
| Dénomination de base | `uqor` |
| Unités de base par QOR | `10^6` |
| Préfixe bech32 de compte | `qor` |
| Préfixe bech32 de validateur | `qorvaloper` |

## Endpoints publics {#public-endpoints}

| Endpoint | Mainnet (`qorechain-vladi`) | Testnet (`qorechain-diana`) |
| --- | --- | --- |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Consensus RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC (`eth_*`) | `https://evm.qore.host` (chain ID 9801) | `https://evm-testnet.qore.host` (chain ID 9800) |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (lecture seule) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |

Les endpoints EVM servent `eth_`, `net_`, `web3_` et `txpool_` ; l'espace de noms
`qor_` n'est pas activé. Voir aussi [Réseaux](/appendix/networks#public-endpoints).

## Ports par défaut

`createClient()` utilise ces ports localhost par défaut. Remplacez `endpoints`
pour pointer vers un vrai nœud.

| Endpoint | Port | Objectif |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | soldes bank, infos de compte, requêtes de module |
| gRPC | `9090` | requêtes gRPC |
| Consensus RPC | `26657` | signature/diffusion des tx native, lectures CosmWasm |
| EVM JSON-RPC | `8545` | `eth_*` (et `qor_*` / précompilés sur les nœuds qui les activent) |
| EVM JSON-RPC (WS) | `8546` | abonnements WebSocket EVM |
| SVM JSON-RPC | `8899` | RPC compatible Solana |

Exemple avec des endpoints explicites :

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",        // REST (LCD)
    rpc: "https://rpc-testnet.qore.host",         // consensus RPC
    evmRpc: "https://evm-testnet.qore.host",      // EVM JSON-RPC (eth_*)
    evmWs: "wss://evm-ws-testnet.qore.host",      // EVM WebSocket
  },
});
```

Le SDK expose des préréglages réseau et des helpers de recherche (exportés
depuis le module networks) afin que vous puissiez lister et résoudre les réseaux
par programmation. En Python/Go/Rust, les équivalents sont `create_client` /
`CreateClient` / `ClientBuilder` plus le module `networks`.

## Cibler le mainnet

Les deux préréglages livrent les mêmes valeurs localhost par défaut ;
sélectionnez `mainnet` et remplacez les endpoints par les URL publiques (ou celles de votre propre nœud) :

```ts
const main = createClient({
  network: "mainnet",       // chain id qorechain-vladi
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});
```
