---
slug: /getting-started/connecting-to-mainnet
title: Se connecter au mainnet
sidebar_label: Se connecter au mainnet
sidebar_position: 3
---

# Se connecter au mainnet

Rejoignez le mainnet QoreChain Vladi en production en configurant votre nœud avec le fichier genesis officiel, les pairs et les paramètres réseau.

:::note
Cette page couvre le mainnet **`qorechain-vladi`** (ID de chaîne EVM **9801**, hex `0x2649`), en production depuis le **7 juin 2026 à 23:59 UTC** et exécutant la version de chaîne **v3.1.82** sur Cosmos SDK v0.53. Pour le testnet **`qorechain-diana`** (ID de chaîne EVM **9800**), consultez [Se connecter au testnet](/getting-started/connecting-to-testnet) et répétez-y votre installation avant de passer en production.
:::

## Points de terminaison publics

Si vous avez uniquement besoin d'**interroger la chaîne ou de diffuser des transactions**, vous n'avez pas besoin de votre propre nœud — les points de terminaison publics sont :

| Service | URL |
|---|---|
| RPC de consensus | `https://rpc.qore.host` (WebSocket : `wss://rpc.qore.host/websocket`) |
| REST Cosmos (LCD) | `https://api.qore.host` |
| JSON-RPC EVM | `https://evm.qore.host` (ID de chaîne `9801`) |
| JSON-RPC SVM (lecture seule) | `https://svm.qore.host` |
| Explorateur de blocs | [explore.qore.network](https://explore.qore.network) |

Pour les charges de travail intensives ou de production (plateformes d'échange, indexeurs), exécutez votre propre nœud comme décrit ci-dessous.

---

## Installation

Installez le binaire `qorechaind` soit à partir de l'archive officielle précompilée, soit en compilant depuis les sources.

### Archive de binaires précompilés (linux/amd64)

L'archive de release officielle contient `qorechaind` ainsi que ses bibliothèques partagées requises (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`) :

```bash
curl -fsSL https://download.qore.host/qorechaind-v3.1.82-linux-amd64.tar.gz -o qore.tgz
# Verify the checksum before installing:
sha256sum qore.tgz
# 8a88936ccc6d350d8b215488a81584163b3568430064958c50e82a394077cfe9

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

Les archives versionnées sont publiées sur [download.qore.host](https://download.qore.host) ; chaque release est livrée avec sa somme de contrôle SHA-256.

### Compiler depuis les sources

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Consultez [Compiler depuis les sources](/developer-guide/building-from-source) pour la liste complète des prérequis (Go 1.26+, CGO, chaîne d'outils Rust, bibliothèques natives).

### Initialiser le nœud

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

Cette commande crée la configuration par défaut et les répertoires de données sous `~/.qorechaind/`.

---

## Télécharger le genesis

Remplacez votre fichier genesis local par le genesis officiel du mainnet :

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json
```

Le même fichier est également servi en direct par la chaîne elle-même — vous pouvez vérifier le téléchargement en le comparant à celui-ci :

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Ce fichier définit l'état initial du mainnet Vladi, y compris l'ensemble des validateurs du genesis, les allocations de jetons (TGE au genesis) et les paramètres des modules.

---

## Configurer les pairs

Modifiez la configuration de votre nœud pour vous connecter aux nœuds sentinelles publics du mainnet.

Ouvrez `~/.qorechaind/config/config.toml` et définissez le champ `persistent_peers` :

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

Définissez également le prix minimum du gas dans `~/.qorechaind/config/app.toml` (le plancher des frais du réseau est de **0.1uqor**) :

```toml
minimum-gas-prices = "0.1uqor"
```

### Paramètres recommandés

Vous pouvez également ajuster les paramètres suivants dans `config.toml` :

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Ces valeurs sont ajustées pour les temps de bloc et le débit du mainnet Vladi.

---

## Amorçage rapide (snapshot)

La synchronisation depuis le genesis peut prendre beaucoup de temps. Un snapshot récent des données de la chaîne est publié sur [download.qore.host](https://download.qore.host) :

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
# Verify before extracting:
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

Les snapshots sont publiés sous des noms de fichiers horodatés par hauteur de bloc — consultez [download.qore.host](https://download.qore.host) pour obtenir le plus récent. Vous pouvez également utiliser le **state sync** — consultez [Exécuter un nœud](/developer-guide/running-a-node) pour le processus complet.

---

## Démarrer le nœud

Lancez votre nœud pour commencer la synchronisation avec le réseau :

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

Le nœud se connecte aux pairs et commence à télécharger les blocs (depuis le genesis, ou depuis la hauteur du snapshot si vous en avez restauré un).

---

## Vérifier l'état de synchronisation

Vérifiez que votre nœud rattrape le dernier bloc :

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — Le nœud est encore en cours de synchronisation. Attendez qu'il rattrape son retard.
* `false` — Le nœud est entièrement synchronisé et traite les nouveaux blocs.

Vous pouvez également vérifier la hauteur du dernier bloc :

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

Confirmez que vous êtes sur le bon réseau — le champ `network` doit indiquer `qorechain-vladi` :

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## Surveillance

QoreChain expose plusieurs points de terminaison pour surveiller la santé et les performances du nœud.

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

### Vérification de l'état via REST

L'API REST fournit un point de terminaison de statut rapide :

```
http://localhost:1317
```

---

## Référence des ports

| Port    | Protocole | Description                                              |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — interroger et diffuser des transactions           |
| `26656` | TCP       | P2P — communication réseau pair à pair                  |
| `1317`  | HTTP      | API REST — interroger l'état de la chaîne via HTTP      |
| `9090`  | gRPC      | API gRPC — accès programmatique à la chaîne             |
| `8545`  | HTTP      | JSON-RPC EVM — RPC compatible Ethereum (ID de chaîne `9801`) |
| `8546`  | WebSocket | WebSocket EVM — abonnements aux événements EVM en temps réel |
| `8899`  | HTTP      | RPC SVM — RPC compatible Solana                         |
| `26660` | HTTP      | Point de terminaison des métriques Prometheus           |

---

## Caractéristiques du réseau

| Champ                   | Valeur                                  |
| ----------------------- | --------------------------------------- |
| ID de chaîne            | `qorechain-vladi`                       |
| ID de chaîne EVM        | `9801` (hex `0x2649`)                   |
| Version de la chaîne    | v3.1.82                                 |
| En production depuis    | 7 juin 2026 23:59 UTC                   |
| Jeton                   | QOR (`uqor`, 10^6 micro-unités = 1 QOR) |
| Prix minimum du gas     | `0.1uqor`                               |
| Préfixe des comptes     | `qor`                                   |
| Préfixe des validateurs | `qorvaloper`                            |
| SDK                     | Cosmos SDK v0.53                        |

---

## Prochaines étapes

* [Exécuter un nœud](/developer-guide/running-a-node) — Opérer un nœud complet/RPC pour les plateformes d'échange et les intégrateurs
* [Guide plateformes d'échange et intégrateurs](/developer-guide/exchange-integration) — Dépôts, retraits et surveillance
* [Exécuter un validateur](/developer-guide/running-a-validator) — Créer et opérer un validateur
* [Configuration du portefeuille](/getting-started/wallet-setup) — Configurer un portefeuille pour le mainnet
* [Votre première transaction](/getting-started/first-transaction) — Envoyer votre premier transfert de QOR
* [Se connecter au testnet](/getting-started/connecting-to-testnet) — Rejoindre le testnet Diana pour des tests gratuits
* [Réseaux](/appendix/networks) — IDs de chaîne, ports et référence complète des réseaux
