---
slug: /appendix/networks
title: Réseaux
sidebar_label: Réseaux
sidebar_position: 4
---

# Réseaux

Une référence consolidée pour les réseaux QoreChain — identifiants de chaîne, identifiants de chaîne EVM, dénomination du token, préfixes d'adresse, points de terminaison publics et ports de service standard.

## Aperçu des réseaux

| | Mainnet | Testnet |
|---|---|---|
| **Statut** | En production | Testnet actif |
| **ID de chaîne Cosmos** | `qorechain-vladi` | `qorechain-diana` |
| **ID de chaîne EVM (EIP-155)** | **9801** (hex `0x2649`) | **9800** (hex `0x2648`) |
| **En production depuis** | 7 juin 2026, 23:59 UTC | — |
| **Version de la chaîne** | v3.1.95 | v3.1.95 |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Prix de gaz minimum** | `0.1uqor` | `0.1uqor` |
| **Guide de connexion** | [Se connecter au Mainnet](/getting-started/connecting-to-mainnet) | [Se connecter au Testnet](/getting-started/connecting-to-testnet) |

## Points de terminaison publics {#public-endpoints}

Tous les points de terminaison publics sont servis en HTTPS.

| Service | Mainnet | Testnet |
|---|---|---|
| RPC de consensus | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| WebSocket de consensus | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| REST Cosmos (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| JSON-RPC EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| WebSocket EVM | — | `wss://evm-ws-testnet.qore.host` |
| JSON-RPC SVM (compatible Solana, lecture seule) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |
| Explorateur de blocs | [explore.qore.network](https://explore.qore.network) | [explore.qore.network](https://explore.qore.network) (basculer sur Testnet) |
| Téléchargements (binaire / genesis / snapshot) | [download.qore.host](https://download.qore.host) | — |

:::note
Les points de terminaison SVM publics sont en **lecture seule** (la soumission de transactions est désactivée en périphérie) ; exécutez votre propre nœud pour les écritures SVM. Pour les charges de travail lourdes ou en production, exécutez votre propre nœud — voir [Exécuter un nœud](/developer-guide/running-a-node).
:::

:::caution Voie de transaction SVM actuellement désactivée
Au-delà du fait que les points de terminaison publics soient en lecture seule, la voie d'exécution SVM est **actuellement désactivée sur l'ensemble du réseau pour la soumission de transactions** (depuis la version de chaîne v3.1.89, le 22 août) — cela inclut la soumission via votre propre nœud, pas seulement via les points de terminaison publics `svm.qore.host` / `svm-testnet.qore.host`. Voir [Développement SVM](/developer-guide/svm-development) pour plus de détails. Utilisez les interfaces Cosmos ou EVM jusqu'à la réouverture de cette voie.
:::

## Token et adresses

| Élément | Valeur |
|---|---|
| **Dénomination d'affichage** | QOR |
| **Dénomination de base** | uqor (1 QOR = 10⁶ uqor) |
| **Décimales par interface** | Cosmos **6** (`uqor`) · EVM **18** (style wei ; 1 uqor = 10¹² wei) · SVM **9** (lamports ; 1 uqor = 1 000 lamports) |
| **Type de pièce HD (BIP-44)** | `118` |
| **Préfixe Bech32 des comptes** | `qor` (ex. `qor1...`) |
| **Préfixe Bech32 des validateurs** | `qorvaloper` (ex. `qorvaloper1...`) |

Les trois interfaces exposent **un solde QOR natif unifié unique** : la même clé contrôle les mêmes fonds sous ses formes d'adresse `qor1...` (Cosmos), `0x...` (EVM), et base58 (SVM).

## Ports standard

Voici les ports de service standard exposés par un nœud QoreChain que vous exécutez vous-même.

| Service | Port |
|---|---|
| RPC Cosmos | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| JSON-RPC EVM | 8545 |
| JSON-RPC EVM (WebSocket) | 8546 |
| JSON-RPC SVM (compatible Solana) | 8899 |
| Métriques Prometheus | 26660 |

## Points de terminaison et accès

- Pour la connexion aux nœuds, les pairs, le genesis et les snapshots, suivez [Se connecter au Mainnet](/getting-started/connecting-to-mainnet) ou [Se connecter au Testnet](/getting-started/connecting-to-testnet).
- Pour un accès programmatique depuis une application, utilisez le [SDK QoreChain](/sdk/overview), qui résout la configuration réseau pour vous.
- L'**explorateur de blocs** public se trouve à [explore.qore.network](https://explore.qore.network) ; le Dashboard sur [dashboard.qorechain.io](https://dashboard.qorechain.io) inclut sa propre vue explorateur, et le **Faucet** de testnet y est accessible (voir [Faucet du Dashboard](/dashboard/faucet)).
- Cette documentation est publiée sur [docs.qorechain.io](https://docs.qorechain.io).

## Ajouter à MetaMask

Pour ajouter un réseau QoreChain à un portefeuille EVM tel que MetaMask, utilisez les identifiants de chaîne EVM ci-dessus — **9801** pour le mainnet avec `https://evm.qore.host`, et **9800** pour le testnet avec `https://evm-testnet.qore.host` — avec `https://explore.qore.network` comme URL de l'explorateur de blocs. Voir [Configuration du portefeuille](/getting-started/wallet-setup) pour la marche à suivre détaillée.

## Voir aussi

* [Se connecter au Mainnet](/getting-started/connecting-to-mainnet) — rejoindre le réseau `qorechain-vladi` en production.
* [Se connecter au Testnet](/getting-started/connecting-to-testnet) — rejoindre le testnet Diana.
* [Guide pour bourses et intégrateurs](/developer-guide/exchange-integration) — dépôts, retraits et opérations de nœud pour les intégrateurs.
* [Paramètres de la chaîne](/appendix/chain-parameters) — configuration canonique de la chaîne.
* [Aperçu du SDK](/sdk/overview) — résoudre la configuration réseau depuis le code.
