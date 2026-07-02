---
slug: /getting-started/connecting-to-testnet
title: Connexion au testnet
sidebar_label: Connexion au testnet
sidebar_position: 4
---

# Connexion au testnet

Rejoignez le testnet QoreChain Diana en service en configurant votre nœud avec le bon fichier genesis, les bons pairs et les bons paramètres réseau.

:::note
Cette page couvre le testnet **`qorechain-diana`** (chain ID EVM **9800**). Le mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) est en production depuis le 7 juin 2026 et dispose de sa propre page dédiée **Connexion au mainnet**, avec un genesis, des pairs et des détails de connexion distincts.
:::

## Points d'accès publics

Si vous avez seulement besoin d'**interroger le testnet ou de diffuser des transactions**, utilisez les points d'accès publics :

| Service | URL |
|---|---|
| RPC de consensus | `https://rpc-testnet.qore.host` (WebSocket : `wss://rpc-testnet.qore.host/websocket`) |
| REST Cosmos (LCD) | `https://api-testnet.qore.host` |
| JSON-RPC EVM | `https://evm-testnet.qore.host` (chain ID `9800`) |
| WebSocket EVM | `wss://evm-ws-testnet.qore.host` |
| JSON-RPC SVM (lecture seule) | `https://svm-testnet.qore.host` |
| Explorateur de blocs | [explore.qore.network](https://explore.qore.network) (basculer sur Testnet) |

Des QOR de testnet sont disponibles via le [Faucet du tableau de bord](/dashboard/faucet).

---

## Télécharger le genesis

Remplacez votre fichier genesis local par le genesis officiel du testnet, servi en direct par la chaîne elle-même :

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' \
  > ~/.qorechaind/config/genesis.json
```

Ce fichier définit l'état initial du testnet Diana, y compris l'ensemble des validateurs, les allocations de jetons et les paramètres des modules.

:::caution
Le testnet Diana est périodiquement **re-genesisé** (réinitialisé à la hauteur 0) au fur et à mesure du déploiement des versions préliminaires. Si votre nœud cesse de se synchroniser après une réinitialisation, retéléchargez le genesis et repartez d'un répertoire de données vierge.
:::

---

## Configurer les pairs

Modifiez la configuration de votre nœud pour vous connecter aux pairs existants du testnet.

Interrogez un pair actuel directement depuis le réseau, puis renseignez le champ `persistent_peers` dans `~/.qorechaind/config/config.toml` :

```bash
# node id + listen address of the public testnet node
curl -s https://rpc-testnet.qore.host/status | jq -r '.result.node_info.id'
```

Définissez également le prix plancher des frais dans `~/.qorechaind/config/app.toml` (le testnet utilise le même prix de gaz minimum de **0.1uqor** que le mainnet) :

```toml
minimum-gas-prices = "0.1uqor"
```

### Paramètres recommandés

Vous pouvez également ajuster les valeurs suivantes dans `config.toml` :

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Ces valeurs sont réglées pour les temps de bloc et le débit du testnet Diana.

---

## Démarrer le nœud

Lancez votre nœud pour commencer la synchronisation avec le réseau :

```bash
./qorechaind start
```

Le nœud se connecte aux pairs et commence à télécharger les blocs depuis le genesis. La durée de la synchronisation initiale dépend de la hauteur actuelle de la chaîne et de la vitesse de votre réseau.

---

## Vérifier l'état de synchronisation

Vérifiez que votre nœud rattrape le dernier bloc :

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — Le nœud est encore en cours de synchronisation. Attendez qu'il rattrape la chaîne.
* `false` — Le nœud est entièrement synchronisé et traite les nouveaux blocs.

Vous pouvez aussi consulter la dernière hauteur de bloc :

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

---

## Supervision

QoreChain expose plusieurs points d'accès pour surveiller la santé et les performances du nœud.

### Métriques Prometheus

Les métriques brutes sont disponibles à l'adresse :

```
http://localhost:26660/metrics
```

Ces métriques peuvent être collectées par n'importe quel collecteur compatible Prometheus.

### Tableaux de bord Grafana

En cas d'exécution via Docker Compose, Grafana est disponible à l'adresse :

```
http://localhost:3001
```

Lors de la première connexion, définissez vos propres identifiants lorsque vous y êtes invité — ne laissez pas les valeurs par défaut en place. Des tableaux de bord préconfigurés affichent la production de blocs, le débit de transactions, les connexions aux pairs et l'utilisation des ressources.

### Vérification de santé REST

L'API REST fournit un point d'accès de statut rapide :

```
http://localhost:1317
```

---

## Référence des ports

| Port    | Protocole | Description                                        |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — interroger et diffuser des transactions      |
| `26656` | TCP       | P2P — communication réseau pair-à-pair             |
| `1317`  | HTTP      | API REST — interroger l'état de la chaîne via HTTP |
| `9090`  | gRPC      | API gRPC — accès programmatique à la chaîne        |
| `8545`  | HTTP      | JSON-RPC EVM — RPC compatible Ethereum (chain ID `9800`) |
| `8546`  | WebSocket | WebSocket EVM — abonnements aux événements EVM en temps réel |
| `8899`  | HTTP      | RPC SVM — RPC compatible Solana                    |
| `26660` | HTTP      | Point d'accès des métriques Prometheus             |

---

## Prochaines étapes

* [Configuration du portefeuille](/getting-started/wallet-setup) — Configurer un portefeuille pour le testnet
* [Votre première transaction](/getting-started/first-transaction) — Envoyer votre premier transfert de QOR
