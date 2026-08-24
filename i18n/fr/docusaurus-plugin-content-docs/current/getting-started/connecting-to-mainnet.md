---
slug: /getting-started/connecting-to-mainnet
title: Se connecter au mainnet
sidebar_label: Se connecter au mainnet
sidebar_position: 3
---

# Se connecter au mainnet

Rejoignez le mainnet QoreChain Vladi en production en configurant votre nœud avec le fichier genesis officiel, les pairs et les paramètres réseau.

:::note
Cette page couvre le mainnet **`qorechain-vladi`** (ID de chaîne EVM **9801**, hex `0x2649`), en production depuis le **7 juin 2026 à 23:59 UTC** et exécutant la version de chaîne **v3.1.92** sur Cosmos SDK v0.53. Pour le testnet **`qorechain-diana`** (ID de chaîne EVM **9800**), consultez [Se connecter au testnet](/getting-started/connecting-to-testnet) et répétez-y votre installation avant de passer en production.
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

Pour des charges de travail intensives ou de production (plateformes d'échange, indexeurs), exécutez votre propre nœud comme décrit ci-dessous.

---

## Installation

Installez le binaire `qorechaind` soit à partir du bundle officiel précompilé, soit en le compilant depuis les sources.

### Bundle binaire précompilé (linux/amd64)

La source de vérité canonique pour le binaire actuel est le **manifeste mainnet**, un fichier JSON actualisé en direct à l'adresse `https://download.qore.host/mainnet/latest.json`. Il contient l'URL et le SHA-256 du binaire actuel, l'URL/le SHA-256/la taille du genesis actuel, les pairs et seeds actuels, le port P2P, un point de confiance pour le state sync, ainsi que la version de chaîne minimale compatible. Récupérez-le et utilisez ses valeurs plutôt que de coder en dur une version de binaire ou une somme de contrôle dans vos scripts d'installation — celles-ci deviennent obsolètes dès qu'une nouvelle release est publiée :

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

Le bundle contient `qorechaind` ainsi que ses bibliothèques partagées requises (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`).

:::caution Gardez votre nœud à jour — v3.1.92 ou supérieure requise pour une synchronisation depuis zéro
Les nœuds complets doivent suivre la version de chaîne en production du réseau — installez toujours le binaire vers lequel pointe le manifeste, ne figez pas une ancienne version. Indépendamment du champ `minCompatible` du manifeste, **la version v3.1.92 ou supérieure est requise pour un nœud qui rejoint le réseau depuis zéro (depuis le genesis) ou qui se rétablit après un arrêt** — les versions antérieures ne peuvent pas achever une synchronisation complète en raison d'un bug de mesure du gas désormais corrigé, qui bloque le replay dès le premier bloc contenant une transaction. Un nœud déjà à jour et exécutant une version antérieure devrait tout de même être mis à niveau à la prochaine occasion, car un nœud obsolète ne peut pas décoder les types de transactions plus récents et cessera de se synchroniser dès qu'une telle transaction apparaîtra dans un bloc.
:::

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

Remplacez votre fichier genesis local par le genesis officiel du mainnet, en utilisant l'URL et le SHA-256 issus du manifeste récupéré ci-dessus :

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

Le même fichier est également servi en direct par la chaîne elle-même — vous pouvez recouper le téléchargement avec celui-ci :

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Ce fichier définit l'état initial du mainnet Vladi, y compris l'ensemble des validateurs genesis, les allocations de jetons (TGE au genesis) et les paramètres des modules.

---

## Configurer les pairs

Modifiez la configuration de votre nœud pour vous connecter aux nœuds sentinelles publics du mainnet. Lisez les listes actuelles de pairs et de seeds depuis le manifeste plutôt que de coder en dur des IDs de nœuds et des hôtes — ceux-ci changent régulièrement :

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Ouvrez `~/.qorechaind/config/config.toml` et définissez les champs `persistent_peers` (et `seeds`) avec ces valeurs :

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Définissez également le prix minimum du gas dans `~/.qorechaind/config/app.toml` (le plancher de frais du réseau est de **0.1uqor**) :

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

Ces valeurs sont optimisées pour les temps de bloc et le débit du mainnet Vladi.

---

## Amorçage rapide (snapshot ou state sync)

La synchronisation depuis le genesis peut prendre beaucoup de temps. Le champ `stateSync` du manifeste contient une paire hauteur/hash de confiance actualisée toutes les heures — utilisez-la pour configurer le state sync plutôt que de chercher une hauteur manuellement :

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Définissez ensuite la section `[statesync]` de `config.toml` avec ces valeurs — consultez [Exécuter un nœud](/developer-guide/running-a-node) pour la procédure complète, y compris un repli manuel basé sur le RPC si vous devez dériver un point de confiance vous-même.

Un snapshot des données de la chaîne est également publié sur [download.qore.host](https://download.qore.host). Consultez le listing actuel à cet endroit pour connaître le nom de fichier du dernier snapshot et sa somme de contrôle publiée — ne codez pas en dur un nom de fichier ou une hauteur, puisqu'un nouveau snapshot remplace régulièrement l'ancien :

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

---

## Démarrer le nœud

Lancez votre nœud pour commencer la synchronisation avec le réseau :

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

Le nœud se connecte aux pairs et commence à télécharger les blocs (depuis le genesis, ou depuis la hauteur du snapshot si vous en avez restauré un).

---

## Vérifier l'état de synchronisation

Vérifiez que votre nœud est en train de rattraper le dernier bloc :

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

### Vérification de santé REST

L'API REST fournit un point de terminaison de statut rapide :

```
http://localhost:1317
```

---

## Référence des ports

| Port    | Protocole | Description                                              |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — interroger et diffuser des transactions                  |
| `26656` | TCP       | P2P — communication réseau pair-à-pair                  |
| `1317`  | HTTP      | API REST — interroger l'état de la chaîne via HTTP                   |
| `9090`  | gRPC      | API gRPC — accès programmatique à la chaîne                    |
| `8545`  | HTTP      | JSON-RPC EVM — RPC compatible Ethereum (ID de chaîne `9801`) |
| `8546`  | WebSocket | WebSocket EVM — abonnements aux événements EVM en temps réel       |
| `8899`  | HTTP      | RPC SVM — RPC compatible Solana                          |
| `26660` | HTTP      | Point de terminaison des métriques Prometheus                    |

---

## Caractéristiques du réseau

| Champ             | Valeur                                  |
| ----------------- | -------------------------------------- |
| ID de chaîne          | `qorechain-vladi`                      |
| ID de chaîne EVM      | `9801` (hex `0x2649`)                  |
| Version de chaîne     | v3.1.92                                |
| En production depuis        | 7 juin 2026 23:59 UTC                  |
| Jeton             | QOR (`uqor`, 10^6 micro-unités = 1 QOR) |
| Prix minimum du gas | `0.1uqor`                              |
| Préfixe des comptes    | `qor`                                  |
| Préfixe des validateurs  | `qorvaloper`                           |
| SDK               | Cosmos SDK v0.53                       |

---

## Étapes suivantes

* [Exécuter un nœud](/developer-guide/running-a-node) — Opérer un nœud complet/RPC pour les plateformes d'échange et les intégrateurs
* [Guide Exchange & Intégrateurs](/developer-guide/exchange-integration) — Dépôts, retraits et surveillance
* [Exécuter un validateur](/developer-guide/running-a-validator) — Créer et opérer un validateur
* [Configuration du portefeuille](/getting-started/wallet-setup) — Configurer un portefeuille pour le mainnet
* [Votre première transaction](/getting-started/first-transaction) — Envoyer votre premier transfert de QOR
* [Se connecter au testnet](/getting-started/connecting-to-testnet) — Rejoindre le testnet Diana pour des tests gratuits
* [Réseaux](/appendix/networks) — IDs de chaîne, ports et référence complète des réseaux
