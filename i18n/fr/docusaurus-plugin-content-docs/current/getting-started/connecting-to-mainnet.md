---
slug: /getting-started/connecting-to-mainnet
title: Connexion au mainnet
sidebar_label: Connexion au mainnet
sidebar_position: 3
---

# Connexion au mainnet

Rejoignez le mainnet QoreChain Vladi en service en configurant votre nœud avec le fichier genesis officiel, les pairs et les paramètres réseau.

:::note
Cette page couvre le mainnet **`qorechain-vladi`** (chain ID EVM **9801**, hex `0x2649`), en production depuis le **7 juin 2026** et exécutant la version **v3.2.4** sur Cosmos SDK v0.53 depuis le **23 octobre 2026** (appliquée à la hauteur **3 742 566** par la proposition de gouvernance 13). Pour le testnet **`qorechain-diana`** (chain ID EVM **9800**), consultez [Connexion au testnet](/getting-started/connecting-to-testnet) et répétez-y votre configuration avant de passer en production.
:::

## Points d'accès publics

Si vous avez seulement besoin d'**interroger la chaîne ou de diffuser des transactions**, vous n'avez pas besoin de votre propre nœud — les points d'accès publics sont :

| Service | URL |
|---|---|
| RPC de consensus | `https://rpc.qore.host` (WebSocket : `wss://rpc.qore.host/websocket`) |
| REST Cosmos (LCD) | `https://api.qore.host` |
| JSON-RPC EVM | `https://evm.qore.host` (chain ID `9801`) |
| JSON-RPC SVM (lecture seule) | `https://svm.qore.host` |
| Explorateur de blocs | [explore.qore.network](https://explore.qore.network) |

Pour des charges de travail lourdes ou de production (exchanges, indexeurs), exécutez votre propre nœud comme décrit ci-dessous.

---

## Installation

Installez le binaire `qorechaind` soit à partir du bundle précompilé officiel, soit en le compilant depuis les sources.

### Bundle binaire précompilé (linux/amd64)

La source de vérité canonique pour le binaire actuel est le **manifeste mainnet**, un fichier JSON actualisé en direct à l'adresse `https://download.qore.host/mainnet/latest.json`. Il contient l'URL et le SHA-256 du binaire actuel, l'URL/le SHA-256/la taille du genesis actuel, les pairs et seeds actuels, le port P2P, un point de confiance pour la synchronisation d'état, ainsi que la version de chaîne minimale compatible. Récupérez-le et utilisez ses valeurs plutôt que de coder en dur une version de binaire ou une somme de contrôle dans vos scripts d'installation — celles-ci deviennent obsolètes dès qu'une nouvelle version est publiée :

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

:::caution Maintenez votre nœud à jour — v3.2.3, puis v3.2.4
Les nœuds complets doivent suivre la version en production du réseau — installez toujours le binaire pointé par le manifeste, ne fixez pas une ancienne version. Le manifeste actuel est **v3.2.4** avec `minCompatible` **3.2.4** et `upgradeHeight` **3 742 566** : le mainnet y a appliqué la v3.2.4 le 23 octobre 2026 par la proposition de gouvernance 13, et un nœud encore sur une version antérieure ne peut pas suivre la chaîne au-delà de cette hauteur. Les mises à niveau par gouvernance précédentes sur le mainnet étaient la **v3.1.94** à la hauteur 2 122 074 (le plafond d'émission), la **v3.2.0** à la hauteur 2 981 742 (la fenêtre d'autorisation EVM et les octets de signature hybride v2), la **v3.2.2** à la hauteur 3 556 788 (16 octobre 2026, proposition 7) et la **v3.2.3** à la hauteur 3 662 051 (20 octobre 2026, proposition 11). La v3.2.1 était une version locale au nœud, sans hauteur. La signature des transactions est inchangée dans la v3.2.4. Un nœud qui rejoint le réseau a besoin du binaire v3.2.4 que nomme le manifeste ; privilégiez la synchronisation d'état (ci-dessous) plutôt que la relecture depuis le genesis. Le snapshot de données de chaîne publié est antérieur à toutes ces hauteurs de mise à niveau, de sorte qu'un nœud restauré à partir de celui-ci doit les rejouer.

Définissez `evm-chain-id = 9801` dans `app.toml` (une valeur différente est journalisée comme une erreur) et maintenez l'horloge système synchronisée par NTP : un nœud s'arrête lorsque son horloge dérive de plus de 60 secondes. Vérifiez toujours les champs `"version"` et `"minCompatible"` du manifeste avant de faire confiance à `binary.url` — le manifeste est promu délibérément (d'abord sur le testnet, puis sur le mainnet après une période de rodage). Le format de signature, les adresses, les décimales, les mémos et les frais n'ont pas changé dans la v3.2.3 ni la v3.2.4.

Le testnet (`qorechain-diana`) exécute la v3.2.6 (la v3.2.5 y a été appliquée le 26 octobre 2026 et la v3.2.6 le 27 octobre 2026). Ne copiez jamais un binaire d'un réseau à l'autre : suivez toujours le manifeste du réseau que vous exploitez.
:::

Lorsqu'une mise à niveau coordonnée est programmée, le texte de la proposition indique la hauteur et vous demande de rester sur la version précédente jusque-là : le nœud s'arrête à cette hauteur et vous le redémarrez sous le nouveau binaire. Lisez le `status` de la proposition (`curl -s https://api.qore.host/cosmos/gov/v1/proposals/<id>`) ainsi que les champs `version` et `upgradeHeight` du [manifeste mainnet](https://download.qore.host/mainnet/latest.json) avant de remplacer un binaire, et n'installez jamais un binaire de mise à niveau avant sa hauteur : un nœud qui l'embarque trop tôt s'arrête lui aussi. Au moment de la rédaction (27 octobre 2026), aucun plan de mise à niveau n'est encore défini (`curl -s https://api.qore.host/cosmos/upgrade/v1beta1/current_plan` renvoie `"plan": null`), mais la proposition de gouvernance 14 est en période de vote (le vote se termine le 28 octobre 2026 à 00:29 UTC). Elle appliquerait la **v3.2.5 (build 2)** à la hauteur **3 906 833**, soit, au rythme de blocs actuel, environ le 29 octobre 2026. Si elle est adoptée, restez sur la v3.2.4 jusqu'à cette hauteur, arrêtez-vous-y et redémarrez sous le binaire v3.2.5 que nomme le manifeste du mainnet ; ne l'installez pas plus tôt. Le contenu de la v3.2.5 sera documenté le jour où le mainnet l'appliquera.

### Compilation depuis les sources (développement uniquement)

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Cela compile le binaire communautaire avec des keepers factices (stubs) et sans signataire post-quantique, qui ne peut ni reproduire l'état de consensus des réseaux ni créer de transactions à signature hybride. Pour exécuter un nœud sur le mainnet, installez le binaire de version ci-dessus. Consultez [Compilation depuis les sources](/developer-guide/building-from-source) pour l'ensemble des prérequis (Go 1.26+, CGO, bibliothèques natives).

### Initialiser le nœud

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

Cela crée les répertoires de configuration et de données par défaut sous `~/.qorechaind/`.

---

## Télécharger le genesis

Remplacez votre fichier genesis local par le genesis officiel du mainnet, en utilisant l'URL et le SHA-256 provenant du manifeste récupéré ci-dessus :

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

Ce fichier définit l'état initial du mainnet Vladi, y compris l'ensemble des validateurs du genesis, les allocations de jetons (TGE au genesis) et les paramètres des modules.

---

## Configurer les pairs

Modifiez la configuration de votre nœud pour vous connecter aux nœuds sentinelles publics du mainnet. Lisez les listes actuelles de pairs et de seeds depuis le manifeste plutôt que de coder en dur les identifiants de nœuds et les hôtes — ceux-ci sont renouvelés périodiquement :

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Ouvrez `~/.qorechaind/config/config.toml` et définissez les champs `persistent_peers` (et `seeds`) avec ces valeurs :

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Définissez également le prix plancher des frais dans `~/.qorechaind/config/app.toml` (le prix plancher des frais du réseau est **0.1uqor**) :

```toml
minimum-gas-prices = "0.1uqor"
```

### Paramètres recommandés

Un nœud complet ne choisit pas le temps de bloc — ce sont les validateurs qui le font (le mainnet produit actuellement un bloc environ toutes les 3,2 secondes). Laissez les délais de consensus à leurs valeurs par défaut, sauf si vous exploitez un validateur et que le groupe de validateurs vous a communiqué des valeurs. Un paramètre de mempool utile pour un nœud RPC public, dans `config.toml` :

```toml
[mempool]
size = 5000
```

---

## Démarrage rapide (snapshot ou synchronisation d'état)

La synchronisation depuis le genesis peut prendre beaucoup de temps. Le champ `stateSync` du manifeste contient une paire hauteur/hash de confiance actualisée toutes les heures — utilisez-la pour configurer la synchronisation d'état plutôt que de rechercher une hauteur manuellement :

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Définissez ensuite la section `[statesync]` de `config.toml` avec ces valeurs — voir [Exécuter un nœud](/developer-guide/running-a-node) pour le workflow complet, y compris une méthode manuelle de repli basée sur le RPC si vous devez dériver vous-même un point de confiance.

Un snapshot des données de la chaîne figure également dans le manifeste (`snapshot.url`, `snapshot.sha256`, `snapshot.height`). Lisez les valeurs depuis le manifeste plutôt que de coder en dur un nom de fichier ou une hauteur, car un nouveau snapshot remplace l'ancien. Le snapshot est volumineux (des dizaines de gigaoctets) et, tel que publié en octobre 2026, a été pris à la hauteur 1 966 629 (21 août 2026) — avant chacune des hauteurs de mise à niveau indiquées ci-dessus — de sorte qu'un nœud restauré à partir de celui-ci doit rejouer ces mises à niveau ; la synchronisation d'état est généralement plus rapide et évite cela :

```bash
SNAPSHOT_URL=$(jq -r .snapshot.url latest.json)
SNAPSHOT_SHA256=$(jq -r .snapshot.sha256 latest.json)

curl -fsSL "$SNAPSHOT_URL" -o snapshot.tar.gz
echo "${SNAPSHOT_SHA256}  snapshot.tar.gz" | sha256sum -c -

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

Confirmez que vous êtes sur le bon réseau — le champ `network` doit indiquer `qorechain-vladi` :

```bash
curl localhost:26657/status | jq '.result.node_info.network'
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

| Port    | Protocole | Description                                              |
| ------- | --------- | --------------------------------------------------------- |
| `26657` | TCP       | RPC — interroger et diffuser des transactions             |
| `26656` | TCP       | P2P — communication réseau pair-à-pair                    |
| `1317`  | HTTP      | API REST — interroger l'état de la chaîne via HTTP        |
| `9090`  | gRPC      | API gRPC — accès programmatique à la chaîne                |
| `8545`  | HTTP      | JSON-RPC EVM — RPC compatible Ethereum (chain ID `9801`)  |
| `8546`  | WebSocket | WebSocket EVM — abonnements aux événements EVM en temps réel |
| `8899`  | HTTP      | RPC SVM — RPC compatible Solana (lectures uniquement ; la voie de transactions SVM est désactivée) |
| `26660` | HTTP      | Point d'accès des métriques Prometheus                    |

---

## Informations réseau

| Champ                | Valeur                                  |
| --------------------- | --------------------------------------- |
| Chain ID               | `qorechain-vladi`                      |
| Chain ID EVM           | `9801` (hex `0x2649`)                  |
| Version de chaîne      | v3.2.4 (appliquée à la hauteur 3 742 566 le 23 octobre 2026) |
| En production depuis   | 7 juin 2026                            |
| Temps de bloc          | environ 3,2 secondes (moyenne mesurée) |
| Jeton                  | QOR (`uqor`, 10^6 micro-unités = 1 QOR) |
| Prix de gaz minimum    | `0.1uqor`                              |
| Préfixe de compte      | `qor`                                  |
| Préfixe de validateur  | `qorvaloper`                           |
| SDK                    | Cosmos SDK v0.53                       |

---

## Étapes suivantes

* [Exécuter un nœud](/developer-guide/running-a-node) — Exploiter un nœud complet/RPC pour les exchanges et intégrateurs
* [Guide pour exchanges et intégrateurs](/developer-guide/exchange-integration) — Dépôts, retraits et supervision
* [Exécuter un validateur](/developer-guide/running-a-validator) — Créer et exploiter un validateur
* [Configuration du portefeuille](/getting-started/wallet-setup) — Configurer un portefeuille pour le mainnet
* [Votre première transaction](/getting-started/first-transaction) — Envoyer votre premier transfert de QOR
* [Connexion au testnet](/getting-started/connecting-to-testnet) — Rejoindre le testnet Diana pour des tests gratuits
* [Réseaux](/appendix/networks) — Chain IDs, ports et la référence complète des réseaux
