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
| Version de la chaîne (4 novembre 2026) | v3.2.6 (depuis la hauteur 4,020,000, 4 novembre 2026, proposition de gouvernance 15 ; la v3.2.5 a été appliquée à la hauteur 3,906,833 le 29 octobre et la v3.2.4 à la hauteur 3,742,566 le 23 octobre). Le SDK 0.12.0 est le client de la v3.2.5 et fonctionne sur la v3.2.6 (le format de signature n'a pas changé) ; la 0.10.0 était le client de la v3.2.4 |
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
| Version de la chaîne (27 octobre 2026) | v3.2.6 (depuis la hauteur 8,970,638, 27 octobre 2026 ; la v3.2.5 a été appliquée à la hauteur 8,890,800 le 26 octobre et la v3.2.4 à la hauteur 8,337,253 le 19 octobre) |
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

Depuis le SDK 0.12.0, les préréglages `mainnet` et `testnet` utilisent par défaut ces URL REST, RPC de consensus et
JSON-RPC EVM (ainsi que le WebSocket EVM du testnet). Les préréglages ne définissent **aucun** point de terminaison
gRPC et **aucun** point de terminaison SVM, même si les URL SVM en lecture seule ci-dessus existent
(les transactions SVM ne sont pas ouvertes) : le code qui en a besoin échoue avec une erreur qui
nomme le point de terminaison à passer. Les points de terminaison du testnet sont limités en débit par IP ; exécutez ou
utilisez votre propre nœud pour le trafic de production. Avant la 0.12.0, chaque préréglage utilisait localhost par défaut.

### Différences propres au testnet qui comptent pour un client {#testnet-only}

Le testnet est un réseau de préproduction et tourne en avance sur le mainnet ; quelques
éléments que vous pouvez y lire ne se trouvent donc pas sur le mainnet (vérifié le 27 octobre 2026 ; la liste complète figure dans
[Différences entre testnet et mainnet](/appendix/chain-parameters#testnet-differences)) :

* **Routes REST.** `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}`, `GET /qorechain/pqc/v1/params` et `GET /qorechain/crossvm/v1/params` répondent sur le testnet. Le mainnet y répondait par HTTP 501 jusqu'à la chaîne v3.2.6 ; depuis qu'il a appliqué la v3.2.6 (4 novembre 2026), toutes ces routes ont répondu HTTP 200 sur le mainnet lors de la vérification de ce jour-là. Les routes AMM sous `/qorechain/amm/v1/` (`pools`, `params`) répondent sur les deux réseaux.
* **Jetons de test.** Trois jetons sans valeur n'existent que sur le testnet, comme dénominations bank nommées `erc20:<adresse du contrat EIP-55>` (sensibles à la casse) : fUSD (6 décimales), fETH (18) et fBTC (8). `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` les liste. La seule dénomination bank du mainnet est `uqor`. Voir [Jetons de test du testnet (Fest)](/api-reference/rest-grpc-endpoints#fest-tokens).
* **Modules activés.** Le module `abstractaccount` est activé sur le testnet et désactivé sur le mainnet, des précompilés EVM sont actifs sur le testnet (trois le 27 octobre, quatre le 4 novembre) et aucun sur le mainnet, et l'instanciation QoreChain Native est ouverte sur le testnet.

## Ports par défaut (le préréglage `localnet`) {#default-ports}

Le préréglage `localnet` (chain id `qorechain-devnet`, sans EVM chain id défini) utilise ces
ports localhost, pour un nœud sur votre propre machine. Avant le SDK 0.12.0, chaque préréglage les
utilisait par défaut ; depuis la 0.12.0, seul `localnet` le fait. Remplacez `endpoints` pour pointer vers
un autre nœud.

| Endpoint | Port | Objectif |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | soldes bank, infos de compte, requêtes de module |
| gRPC | `9090` | requêtes gRPC |
| Consensus RPC | `26657` | signature/diffusion des tx native, lectures QoreChain Native |
| EVM JSON-RPC | `8545` | `eth_*` (et `qor_*` / précompilés sur les nœuds qui les activent) |
| EVM JSON-RPC (WS) | `8546` | abonnements WebSocket EVM |
| SVM JSON-RPC | `8899` | RPC compatible Solana |

```ts
const local = createClient({ network: "localnet" }); // a node on this machine
```

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

Sélectionnez `mainnet` pour le cibler. Depuis le SDK 0.12.0, le préréglage porte déjà les URL
publiques ; les endpoints ci-dessous sont donc les valeurs par défaut ; passez `endpoints` uniquement pour votre propre nœud
(un SDK antérieur à la 0.12.0 utilise localhost par défaut et en a besoin) :

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
