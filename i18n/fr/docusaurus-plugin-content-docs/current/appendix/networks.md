---
slug: /appendix/networks
title: Réseaux
sidebar_label: Réseaux
sidebar_position: 4
---

# Réseaux

Une référence consolidée des réseaux QoreChain — identifiants de chaîne, EVM chain IDs, dénomination du jeton, préfixes d'adresse et ports de service standard. Pour les détails complets de connexion des nœuds (points de terminaison publics, seeds et genesis), suivez les guides de connexion liés ci-dessous ; les opérateurs obtiennent les points de terminaison publics, seeds et genesis actuels à partir de la version officielle.

## Les réseaux en un coup d'œil

| | Mainnet | Testnet |
|---|---|---|
| **Statut** | En ligne | Testnet actif |
| **Cosmos chain ID** | `qorechain-vladi` | `qorechain-diana` |
| **EVM chain ID (EIP-155)** | **9801** (hex `0x2649`) | **9800** (hex `0x2648`) |
| **En ligne depuis** | 7 juin 2026, 23:59 UTC | — |
| **Version de la chaîne** | v3.1.80 | v3.1.80 |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Guide de connexion** | [Se connecter au mainnet](/getting-started/connecting-to-mainnet) | [Se connecter au testnet](/getting-started/connecting-to-testnet) |

## Jeton et adresses

| Élément | Valeur |
|---|---|
| **Dénomination d'affichage** | QOR |
| **Dénomination de base** | uqor (1 QOR = 10⁶ uqor) |
| **Préfixe de compte Bech32** | `qor` (par ex. `qor1...`) |
| **Préfixe de validateur Bech32** | `qorvaloper` (par ex. `qorvaloper1...`) |

## Ports standard

Ce sont les ports de service standard exposés par un nœud QoreChain. Les noms d'hôte réels des points de terminaison publics sont publiés avec la version officielle — voir les guides de connexion ci-dessus.

| Service | Port |
|---|---|
| RPC Cosmos | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| EVM JSON-RPC | 8545 |
| EVM JSON-RPC (WebSocket) | 8546 |
| SVM (compatible Solana) JSON-RPC | 8899 |
| Métriques Prometheus | 26660 |

## Points de terminaison et accès

QoreChain ne publie pas de noms d'hôte RPC/REST/EVM publics fixes dans cette référence. À la place :

- Pour la connexion des nœuds, les seeds et le genesis, suivez [Se connecter au mainnet](/getting-started/connecting-to-mainnet) ou [Se connecter au testnet](/getting-started/connecting-to-testnet). Les opérateurs obtiennent les points de terminaison publics, seeds et genesis actuels à partir de la version officielle.
- Pour un accès programmatique depuis une application, utilisez le [QoreChain SDK](/sdk/overview), qui résout la configuration réseau pour vous.
- L'**Explorateur** on-chain est disponible via le tableau de bord à l'adresse [dashboard.qorechain.io](https://dashboard.qorechain.io), et le **Faucet** de testnet y est également accessible (voir [Faucet du tableau de bord](/dashboard/faucet)).
- Cette documentation est publiée à l'adresse [docs.qorechain.io](https://docs.qorechain.io).

## Ajouter à MetaMask

Pour ajouter un réseau QoreChain à un portefeuille EVM tel que MetaMask, utilisez les EVM chain IDs ci-dessus — **9801** pour le mainnet et **9800** pour le testnet — avec le point de terminaison EVM JSON-RPC du réseau auquel vous vous connectez. Voir [Configuration du portefeuille](/getting-started/wallet-setup) pour la procédure pas à pas.

## Voir aussi

* [Se connecter au mainnet](/getting-started/connecting-to-mainnet) — rejoignez le réseau `qorechain-vladi` en ligne.
* [Se connecter au testnet](/getting-started/connecting-to-testnet) — rejoignez le testnet Diana.
* [Paramètres de la chaîne](/appendix/chain-parameters) — configuration canonique de la chaîne.
* [Vue d'ensemble du SDK](/sdk/overview) — résolvez la configuration réseau depuis le code.
