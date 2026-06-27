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
| Chain id | `qorechain-vladi` (en ligne) |
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
| Token d'affichage | `QOR` |
| Dénomination de base | `uqor` |
| Unités de base par QOR | `10^6` |
| Préfixe bech32 de compte | `qor` |
| Préfixe bech32 de validateur | `qorvaloper` |

## Ports par défaut

`createClient()` utilise ces ports localhost par défaut. Remplacez `endpoints`
pour pointer vers un vrai nœud.

| Endpoint | Port | Objectif |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | soldes bank, infos de compte, requêtes de module |
| gRPC | `9090` | requêtes gRPC |
| Consensus RPC | `26657` | signature/diffusion des tx native, lectures CosmWasm |
| EVM JSON-RPC | `8545` | `eth_*`, `qor_*`, précompilés |
| EVM JSON-RPC (WS) | `8546` | abonnements WebSocket EVM |
| SVM JSON-RPC | `8899` | RPC compatible Solana |

Exemple avec des endpoints explicites :

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",   // REST (LCD)
    rpc: "https://rpc.testnet.example",      // consensus RPC
    evmRpc: "https://evm.testnet.example",   // EVM + qor_ JSON-RPC
    evmWs: "wss://evm.testnet.example",      // EVM WebSocket
  },
});
```

Le SDK expose des préréglages réseau et des helpers de recherche (exportés
depuis le module networks) afin que vous puissiez lister et résoudre les réseaux
par programmation. En Python/Go/Rust, les équivalents sont `create_client` /
`CreateClient` / `ClientBuilder` plus le module `networks`.

## Cibler le mainnet

Les deux préréglages livrent les mêmes valeurs localhost par défaut ;
sélectionnez `mainnet` et remplacez les endpoints par les URL de votre nœud :

```ts
const main = createClient({
  network: "mainnet",       // chain id qorechain-vladi
  endpoints: {
    rest: "https://rest.mainnet.example",
    rpc: "https://rpc.mainnet.example",
    evmRpc: "https://evm.mainnet.example",
  },
});
```
