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
| **En production depuis** | 7 juin 2026 | 1er juillet 2026 (en continu depuis ; sans réinitialisation) |
| **Version de la chaîne** | v3.2.5 (appliquée à la hauteur 3 906 833, le 29 octobre 2026, proposition de gouvernance 14). La v3.2.4 a été appliquée à la hauteur 3 742 566 le 23 octobre 2026 et la v3.2.3 à la hauteur 3 662 051 le 20 octobre 2026 | v3.2.6 (appliquée à la hauteur 8 970 638, le 27 octobre 2026 ; la v3.2.5 a été appliquée à la hauteur 8 890 800 le 26 octobre et la v3.2.4 à 8 337 253 le 19 octobre) |
| **Temps de bloc (moyenne mesurée)** | environ 3,1 s | environ 1,3 s |
| **Manifeste de version** | [download.qore.host/mainnet/latest.json](https://download.qore.host/mainnet/latest.json) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Prix de gaz minimum** | `0.1uqor` | `0.1uqor` |
| **Jetons de test** | Aucun | Jetons Fest fUSD, fETH et fBTC (sans valeur ; voir [Faucet](/dashboard/faucet#fest-tokens)) |
| **Guide de connexion** | [Se connecter au Mainnet](/getting-started/connecting-to-mainnet) | [Se connecter au Testnet](/getting-started/connecting-to-testnet) |

Les deux manifestes font foi pour la version qu'un nouveau nœud doit exécuter. Les deux réseaux reçoivent des mises à niveau coordonnées via la gouvernance ; chaque manifeste comporte donc le `upgradeHeight` de sa version actuelle et un `minCompatible` égal à cette version (3.2.5 sur le mainnet, vérifié le 30 octobre 2026, et 3.2.6 sur le testnet, vérifié le 27 octobre 2026). Le testnet reçoit chaque version en premier : le mainnet exécute la v3.2.5 depuis le 29 octobre 2026 (hauteur 3 906 833, proposition de gouvernance 14), un nœud qui rejoint le mainnet doit donc continuer à suivre son propre manifeste. Ne copiez jamais un binaire d'un réseau à l'autre.

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
| Téléchargements (binaire / genesis / snapshot) | [download.qore.host](https://download.qore.host) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |

:::note
Les points de terminaison SVM publics sont en **lecture seule** (la soumission de transactions est désactivée en périphérie) ; exécutez votre propre nœud pour les écritures SVM. Pour les charges de travail lourdes ou en production, exécutez votre propre nœud — voir [Exécuter un nœud](/developer-guide/running-a-node). Il n'existe ni point de terminaison gRPC public ni WebSocket EVM public sur le mainnet. Sur les points de terminaison EVM publics, `eth_getLogs` accepte au plus 10 000 blocs par requête et `txpool_content` est désactivé (un nœud auto-hébergé sert l'espace de noms complet) ; voir [Espace de noms eth_](/api-reference/json-rpc-eth_-namespace).
:::

:::tip
Si un script reçoit `403 Forbidden` d'un point de terminaison public, définissez un en-tête `User-Agent` explicite (l'agent `urllib` par défaut de Python est bloqué ; les clients `requests`, `curl`, Node et Go fonctionnent tels quels).
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
