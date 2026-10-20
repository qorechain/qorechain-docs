---
slug: /getting-started/connecting-to-testnet
title: Connexion au testnet
sidebar_label: Connexion au testnet
sidebar_position: 4
---

# Connexion au testnet

Rejoignez le testnet QoreChain Diana en service en configurant votre nœud avec le bon fichier genesis, les bons pairs et les bons paramètres réseau.

:::note
Cette page couvre le testnet **`qorechain-diana`** (chain ID EVM **9800**). Le mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) est en production depuis le 7 juin 2026 (version **v3.2.3**) et dispose de sa propre page dédiée **Connexion au mainnet**, avec un genesis, des pairs et des détails de connexion distincts. Le testnet exécute actuellement la version **v3.2.4**, une version réservée au testnet qui ne fait pas partie du mainnet ; son manifeste de version se trouve à l'adresse [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json).
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

## Installation

La source de référence canonique pour le binaire actuel du testnet, le genesis, les pairs et le point de confiance du state-sync est le **manifeste du testnet**, actualisé en direct à l'adresse `https://download.qore.host/testnet/latest.json`. Il a la même structure que le manifeste du mainnet, de sorte que les étapes d'installation sont identiques — récupérez-le et utilisez ses valeurs plutôt que de coder en dur une version ou une somme de contrôle :

```bash
curl -s https://download.qore.host/testnet/latest.json -o latest.json
jq -r '.version, .minCompatible, .upgradeHeight' latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib

qorechaind init my-node --chain-id qorechain-diana
```

Le testnet applique des mises à niveau coordonnées via des propositions de gouvernance ; son manifeste porte donc un champ `upgradeHeight` (la v3.2.4 a été appliquée à la hauteur 8,337,253 le 19 octobre 2026 ; avant elle, la v3.2.3 à 8,003,746 et la v3.2.2 à 6,905,034) et `minCompatible` est égal à la version actuelle (3.2.4). Un nœud qui rejoint le réseau maintenant a besoin de la version indiquée dans le manifeste. Gardez l'horloge système synchronisée par NTP. Le manifeste du mainnet pointe vers une autre version (v3.2.3) ; ne copiez donc jamais un binaire d'un réseau à l'autre.

---

## Télécharger le genesis

Remplacez votre fichier genesis local par le genesis officiel du testnet, en utilisant l'URL et le SHA-256 du manifeste récupéré ci-dessus :

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

Le même fichier est aussi servi en direct par la chaîne elle-même :

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Ce fichier définit l'état initial du testnet Diana, y compris l'ensemble des validateurs, les allocations de jetons et les paramètres des modules.

:::note Le testnet est mis à niveau sur place
Diana fonctionne en continu depuis le 1er juillet 2026 et est mis à niveau par des propositions de gouvernance, comme le mainnet. Le testnet est un réseau de préproduction et peut être réinitialisé sans préavis : si votre nœud cesse de se synchroniser, consultez le manifeste et les annonces Discord, puis retéléchargez le genesis et repartez d'un répertoire de données vierge. Le sentry public ne conserve que les blocs récents ; un nouveau nœud doit donc utiliser le state-sync (ci-dessous) plutôt que de rejouer la chaîne depuis le genesis.
:::

---

## Configurer les pairs

Lisez les listes actuelles de pairs et de seeds dans le manifeste plutôt que de coder en dur des identifiants de nœuds et des hôtes :

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Ouvrez `~/.qorechaind/config/config.toml` et renseignez les champs `persistent_peers` (et `seeds`) avec ces valeurs :

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Définissez également le prix plancher des frais dans `~/.qorechaind/config/app.toml` (le testnet utilise le même prix de gaz minimum de **0.1uqor** que le mainnet) :

```toml
minimum-gas-prices = "0.1uqor"
```

### Paramètres recommandés

Un nœud complet ne choisit pas le temps de bloc — ce sont les validateurs qui le font (le testnet produit actuellement un bloc environ toutes les 1 seconde). Laissez les délais d'expiration du consensus à leurs valeurs par défaut, sauf si vous exploitez un validateur et que le groupe de validateurs vous a communiqué des valeurs. Un paramètre de mempool utile pour un nœud RPC public, dans `config.toml` :

```toml
[mempool]
size = 5000
```

---

## Démarrage rapide (State Sync)

Le champ `stateSync` du manifeste fournit une paire hauteur/hash de confiance actualisée régulièrement :

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Renseignez la section `[statesync]` de `config.toml` avec ces valeurs et les `rpcServers` du manifeste — consultez [Exécuter un nœud](/developer-guide/running-a-node) pour le flux de travail complet.

---

## Démarrer le nœud

Lancez votre nœud pour commencer la synchronisation avec le réseau :

```bash
./qorechaind start
```

Le nœud se connecte aux pairs et commence à télécharger les blocs (depuis le genesis, ou depuis la hauteur de confiance si vous utilisez le state-sync). La durée de la synchronisation initiale dépend de la hauteur actuelle de la chaîne et de la vitesse de votre réseau.

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
| `8899`  | HTTP      | RPC SVM — RPC compatible Solana (lecture seule ; la voie de transaction SVM est désactivée) |
| `26660` | HTTP      | Point d'accès des métriques Prometheus             |

---

## Prochaines étapes

* [Configuration du portefeuille](/getting-started/wallet-setup) — Configurer un portefeuille pour le testnet
* [Votre première transaction](/getting-started/first-transaction) — Envoyer votre premier transfert de QOR
