---
slug: /developer-guide/running-a-node
title: Exécution d'un nœud
sidebar_label: Exécution d'un nœud
sidebar_position: 10
---

# Exécution d'un nœud

Ce guide couvre l'exécution d'un déploiement QoreChain **nœud uniquement** — un nœud complet ou RPC qui synchronise la chaîne et expose des points de terminaison pour l'intégration, **sans** fonctions de validateur. Il s'adresse aux exchanges (CEX), aux backends de portefeuilles, aux indexeurs et aux intégrateurs qui ont besoin d'un accès fiable en lecture/écriture au réseau, mais qui ne signent pas de blocs.

:::note
Pour la production de blocs, le staking, le slashing et la classification des pools, voir [Exécution d'un validateur](/developer-guide/running-a-validator). Un déploiement nœud uniquement ne détient jamais de clé de consensus de validateur et n'apparaît jamais dans l'ensemble actif.
:::

:::warning
Les binaires, le genesis et les snapshots sont publiés sur [download.qore.host](https://download.qore.host) avec des sommes de contrôle SHA-256. **Vérifiez toujours les sommes de contrôle avant d'installer ou d'extraire**, et ne vérifiez les dépôts que par rapport à votre propre nœud synchronisé.
:::

:::note Source de vérité : le manifeste en direct
Le binaire actuel, le genesis, les pairs, les seeds et un point de confiance de state-sync sont publiés sous forme de manifeste JSON, actualisé en direct — ne codez pas en dur une version de binaire, une somme de contrôle ou un nom de fichier de snapshot dans vos scripts d'installation, car ils deviennent obsolètes dès qu'une nouvelle version est publiée :

- Mainnet : `https://download.qore.host/mainnet/latest.json`
- Testnet : `https://download.qore.host/testnet/latest.json`

Les champs du manifeste incluent `binary` (url + sha256), `genesis` (url + sha256 + sizeBytes), `peers`, `seeds`, `p2pPort`, `stateSync` (un point de confiance actualisé toutes les heures) et `minCompatible`. Les étapes d'installation et de connexion ci-dessous récupèrent ce manifeste et utilisent ses valeurs actuelles.
:::

:::caution Utilisez la version que nomme le manifeste : v3.2.4 sur les deux réseaux
Un nœud qui se synchronise depuis le genesis ou qui rejoue depuis un snapshot franchit plusieurs mises à niveau de gouvernance (voir [Mises à niveau](#upgrades) ci-dessous) : installez donc toujours le binaire vers lequel pointe le manifeste, car il porte tous les gestionnaires de mise à niveau. Sur le **mainnet**, `minCompatible` et `version` du manifeste valent tous deux `3.2.4` (la mise à niveau coordonnée appliquée à la hauteur 3,742,566 le 23 octobre 2026, proposition de gouvernance 13) ; un nœud qui rejoint le réseau maintenant a donc besoin de la v3.2.4 : un binaire plus ancien s'arrête à la hauteur de mise à niveau qu'il ne connaît pas. Sur le **testnet**, ils valent aussi tous deux `3.2.4` (appliquée à la hauteur 8,337,253 le 19 octobre 2026). N'exécutez pas un binaire de testnet sur le mainnet, ni l'inverse : chaque répertoire porte sa propre version (voir [Mises à niveau](#upgrades)). Le manifeste est promu de façon délibérée (d'abord sur testnet, puis sur mainnet après une période de rodage) ; vérifiez donc son champ `"version"` par rapport à `minCompatible` avant de faire confiance à `binary.url`.

Un binaire compilé à partir des sources publiques (la compilation communautaire) refuse de démarrer sur l'un ou l'autre des réseaux publics (v3.2.3 et ultérieures) : il ne peut pas vérifier les signatures post-quantiques ni rejouer fidèlement les blocs des réseaux. Utilisez uniquement l'archive de release.

Deux paramètres comptent à partir de la v3.2.1 : gardez l'horloge système synchronisée via NTP (le nœud s'arrête lorsque son horloge dérive de plus de 60 secondes) et définissez `evm-chain-id` dans `app.toml` (voir [Limites du nœud](#node-limits)).
:::

---

## Nœud vs Validateur

| Aspect                | Nœud uniquement (ce guide)                       | Validateur                                  |
| ---------------------- | ------------------------------------------------- | ------------------------------------------- |
| Clé de consensus        | Aucune                                            | Clé de consensus ed25519 (doit être sécurisée) |
| Production de blocs     | Non                                                | Oui — propose et signe les blocs            |
| Staking / slashing      | Non applicable                                    | Auto-délégation, risque de slashing         |
| Objectif principal      | Servir RPC/REST/gRPC/EVM (et SVM en lecture seule) aux intégrations | Sécuriser le réseau (les récompenses de staking s'appliquent) |
| Exposition publique     | Points de terminaison RPC/EVM généralement exposés | Validateur caché derrière des nœuds sentinelles |

---

## Réseaux cibles

| Réseau   | Chain ID            | EVM chain ID         | Notes                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Principal — en direct depuis le 7 juin 2026 ; version de nœud v3.2.4 (depuis le 23 oct. 2026) |
| Testnet  | `qorechain-diana`   | `9800`               | Répétez d'abord vos intégrations ici ; version de nœud v3.2.4 (depuis le 19 oct. 2026) |

Remplacez le `--chain-id` approprié pour votre réseau cible tout au long de ce guide. Les exemples utilisent le mainnet par défaut.

---

## Matériel recommandé

| Profil                    | CPU      | RAM   | Disque (SSD NVMe)        | Réseau    |
| -------------------------- | -------- | ----- | ------------------------- | --------- |
| Nœud RPC élagué (pruned)   | 4 cœurs  | 16 Go | 500 Go+                   | 100 Mbps+ |
| Nœud complet/archive       | 8 cœurs  | 32 Go | 2 To+ (croît avec le temps) | 1 Gbps    |
| Intégration exchange       | 8 cœurs  | 32 Go | 2 To+ avec marge           | 1 Gbps    |

Un SSD NVMe est fortement recommandé — l'état de la chaîne et les stores EVM/SVM sont intensifs en E/S. Les nœuds archive (sans élagage, indexation complète des transactions) croissent en continu ; prévoyez une marge de disque et une surveillance.

---

## Déploiement

### Docker Compose

Un déploiement nœud uniquement avec Docker Compose. Il n'existe aucune image `qorechaind` publiée publiquement à récupérer (rien n'est publié sous l'organisation Docker Hub du projet). Le `Dockerfile` du dépôt public construit le binaire **communautaire** (sans bibliothèque post-quantique, keepers factices) : il convient au développement local mais ne peut pas suivre le mainnet ni le testnet, et depuis la v3.2.3 il refuse de démarrer sur ceux-ci. Pour un nœud de réseau, construisez votre propre image à partir de l'**archive de release** indiquée dans `latest.json`, étiquetez-la avec la version de la release (**v3.2.4** sur les deux réseaux), puis montez un volume persistant pour les données de la chaîne :

```bash
# Fetch and verify the release archive (see "Joining the Network" below for the manifest steps)
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
curl -fsSL "$(jq -r .binary.url latest.json)" -o qore.tgz
echo "$(jq -r .binary.sha256 latest.json)  qore.tgz" | sha256sum -c -
mkdir release && tar xzf qore.tgz -C release

cat > release/Dockerfile <<'EOF'
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates curl jq && rm -rf /var/lib/apt/lists/*
COPY qorechaind /usr/local/bin/qorechaind
COPY lib/ /opt/qorechain/lib/
ENV LD_LIBRARY_PATH=/opt/qorechain/lib
ENTRYPOINT ["qorechaind"]
EOF
docker build -t qorechain-node:v3.2.4 release/
```

L'archive contient `qorechaind` et un répertoire `lib/` avec ses bibliothèques partagées (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`) ; l'image ci-dessus est uniquement `linux/amd64`, comme l'archive de release.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain-node:v3.2.4
    container_name: qorechain-node
    restart: unless-stopped
    command: ["start", "--home", "/root/.qorechaind"]
    volumes:
      - qorechain-data:/root/.qorechaind
    ports:
      - "26657:26657"   # RPC
      - "26656:26656"   # P2P
      - "1317:1317"     # REST
      - "9090:9090"     # gRPC
      - "8545:8545"     # EVM JSON-RPC
      - "8546:8546"     # EVM WebSocket
      - "8899:8899"     # SVM RPC (read-only: SVM transactions are disabled)
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

Initialisez le répertoire de données une fois (par exemple `docker compose run --rm qorechain-node init my-node --chain-id qorechain-vladi --home /root/.qorechaind` ; le genesis et la configuration des pairs sont couverts ci-dessous), puis démarrez :

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

Pour une installation bare-metal, exécutez `qorechaind` sous systemd :

```ini
# /etc/systemd/system/qorechaind.service
[Unit]
Description=QoreChain node
After=network-online.target
Wants=network-online.target

[Service]
User=qorechain
ExecStart=/usr/local/bin/qorechaind start --home /var/lib/qorechaind
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now qorechaind
sudo journalctl -u qorechaind -f
```

---

## Rejoindre le réseau

### 1. Initialiser

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

### 2. Récupérer le manifeste {#fetch-the-manifest}

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

Utilisez ce fichier comme source pour les valeurs du binaire, du genesis et des pairs dans les étapes ci-dessous — vérifiez `jq -r .minCompatible latest.json` et exécutez au moins cette version (la version recommandée est `jq -r .version latest.json`).

### 3. Télécharger et vérifier le genesis

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 4. Configurer les pairs et le plancher de frais

Lisez les pairs et seeds actuels depuis le manifeste plutôt que de coder en dur les identifiants de nœuds et les hôtes — ceux-ci tournent régulièrement :

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Ouvrez `~/.qorechaind/config/config.toml` et réglez `persistent_peers` (et `seeds`) sur ces valeurs :

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Puis réglez le prix minimum du gaz dans `~/.qorechaind/config/app.toml` (plancher de frais réseau : **0.1uqor**) :

```toml
minimum-gas-prices = "0.1uqor"
```

`qorechaind init <moniker> --chain-id qorechain-vladi` écrit aussi l'EVM chain id du réseau dans `app.toml` (voir [Limites du nœud](#node-limits)) ; vérifiez-le sur un répertoire home initialisé il y a longtemps.

### 5. Démarrer la synchronisation

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## Démarrage rapide (Fast Bootstrap)

La synchronisation depuis le genesis peut prendre beaucoup de temps. Pour les intégrations, utilisez le **state sync** ou un **snapshot** pour un démarrage à froid rapide.

### State sync

Le state sync récupère un snapshot récent de l'état de l'application depuis des serveurs RPC de confiance au lieu de rejouer chaque bloc. Configurez la section `[statesync]` dans `config.toml` :

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Prenez `trust_height` / `trust_hash` depuis le champ `stateSync` du manifeste — il est actualisé toutes les heures, c'est donc la source à privilégier :

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

En solution de repli/alternative, vous pouvez dériver vous-même une hauteur et un hash de confiance depuis le RPC public :

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### Restauration à partir d'un snapshot

Alternativement, téléchargez le snapshot de données de chaîne publié, vérifiez sa somme de contrôle, puis extrayez-le par-dessus votre répertoire de données. Sur mainnet, l'objet `snapshot` du manifeste fournit l'URL, la `height` du bloc, la taille et le SHA-256. **L'URL du snapshot du manifeste du testnet renvoie actuellement `404` (aucun snapshot de testnet n'est publié) ; utilisez donc le state sync sur ce réseau.** Lisez `snapshot.height` avant d'utiliser celui du mainnet : c'est une archive unique d'environ 27 Go, et un snapshot ancien implique un long rattrapage. Le snapshot mainnet actuellement publié date du 21 août 2026 (hauteur 1,966,629) : il est antérieur aux hauteurs de mise à niveau v3.1.94, v3.2.0, v3.2.2, v3.2.3 et v3.2.4, de sorte qu'un nœud restauré à partir de celui-ci rejoue environ deux mois de blocs avec le binaire de la version que nomme le manifeste. Le state sync est presque toujours le meilleur choix.

```bash
SNAP_URL=$(jq -r .snapshot.url latest.json)
SNAP_SHA256=$(jq -r .snapshot.sha256 latest.json)
curl -fsSL "$SNAP_URL" -o snapshot.tar.gz
echo "${SNAP_SHA256}  snapshot.tar.gz" | sha256sum -c -

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Les champs `snapshot.height` et `snapshot.ts` du manifeste indiquent la fraîcheur de l'archive, et le state sync (ci-dessus) est généralement plus rapide qu'un téléchargement de 27 Go. Vérifiez toujours la somme de contrôle avant d'extraire, et utilisez une version de nœud qui porte tous les gestionnaires de mise à niveau (voir l'avertissement en haut de cette page) lors d'un rejeu depuis un snapshot.
:::

---

## Mises à niveau {#upgrades}

Les changements de consensus arrivent sous forme de **mises à niveau de gouvernance coordonnées** : une proposition adoptée nomme un plan (par exemple `v3.2.3`) et une hauteur de bloc. Le binaire de release porte les gestionnaires de mise à niveau ; à la hauteur du plan, chaque nœud doit l'exécuter, et un nœud encore sur le binaire précédent **s'arrête à cette hauteur** (c'est le comportement voulu du module de mise à niveau). Le manifeste indique de quel type est une version : `upgradeType` vaut `height` pour une mise à niveau coordonnée (avec `upgradeHeight` renseigné) et `rolling` pour une version locale au nœud qui peut être remplacée nœud par nœud. Installez le nouveau binaire **avant** la hauteur ; si votre nœud s'est arrêté avant, remplacez le binaire et redémarrez (voir la note sur le rollback sous [Dépannage](#troubleshooting)).

| Version | Mainnet `qorechain-vladi` | Testnet `qorechain-diana` |
| ------- | ------------------------- | ------------------------- |
| v3.1.94 | hauteur 2,122,074 | non appliquée |
| v3.2.0 | hauteur 2,981,742 | hauteur 5,920,000 |
| v3.2.1 | locale au nœud, sans hauteur | locale au nœud |
| v3.2.2 | hauteur 3,556,788 (16 octobre 2026) | hauteur 6,905,034 (2 octobre 2026) |
| v3.2.3 | hauteur 3,662,051 (20 octobre 2026, proposition de gouvernance 11) | hauteur 8,003,746 (15 octobre 2026) |
| v3.2.4 | hauteur 3,742,566 (23 octobre 2026, proposition de gouvernance 13) | hauteur 8,337,253 (19 octobre 2026, proposition de gouvernance 13) |

**Ce qu'a fait l'opérateur d'un nœud pour la v3.2.4 (hauteur mainnet 3,742,566).** La proposition de gouvernance 13 a nommé le plan `v3.2.4` à la hauteur 3,742,566 (appliqué le 23 octobre 2026) : les nœuds sont restés en v3.2.3 jusqu'à cette hauteur, s'y sont arrêtés, puis ont redémarré en v3.2.4. Pour la prochaine mise à niveau coordonnée, les étapes sont les mêmes :

1. Surveillez le manifeste (`https://download.qore.host/mainnet/latest.json`) : tant qu'il ne nomme pas la nouvelle version, il n'y a rien à installer, et un binaire du répertoire testnet n'est pas la version du mainnet.
2. Lorsque le manifeste nomme la version, téléchargez l'archive depuis son `binary.url`, vérifiez le `sha256` (le texte de la proposition publie aussi le sha256 du binaire) et préparez-la **avant** la hauteur. Consultez `GET /cosmos/upgrade/v1beta1/current_plan` pour le plan en attente (`name` et `height`) et la hauteur actuelle avec `GET /status` sur le RPC.
3. À la hauteur du plan, un nœud encore sur l'ancien binaire **s'arrête** (c'est le comportement voulu du module de mise à niveau, pas une défaillance) ; un nœud déjà sur le nouveau binaire applique le gestionnaire de mise à niveau et continue. Si le vôtre s'est arrêté en premier, remplacez le binaire et redémarrez. Après la mise à niveau, `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.4` renvoie la hauteur au lieu de `0` (3742566 sur le mainnet, 8337253 sur le testnet).
4. Un nœud qui rejoint le mainnet maintenant installe la version que nomme le manifeste (v3.2.4 ; vérifiez `version` par rapport à `minCompatible`).

La signature des transactions, les adresses, les décimales, les memos et les frais ne changent pas avec la v3.2.4.

Lisez l'enregistrement en direct avec `GET /cosmos/upgrade/v1beta1/applied_plan/<name>` (`0` = non appliquée) et tout plan en attente avec `GET /cosmos/upgrade/v1beta1/current_plan`. La v3.2.2 a relevé les dépendances du moteur de consensus, de Cosmos SDK (v0.53.8) et d'IBC, et les contrôles de transaction plus stricts du SDK font que cette version remplace le binaire précédent à la hauteur de mise à niveau plutôt que nœud par nœud. La signature des transactions, les adresses, les décimales, les memos et les frais n'ont pas changé dans la v3.2.2 ni dans la v3.2.3.

**State sync et horloge.** Le state sync prend son point de confiance dans le bloc `stateSync` du manifeste (`trustHeight`, `trustHash`, actualisés toutes les heures) ; le serveur RPC qu'il liste est celui du projet lui-même : pour un nœud de production, ajoutez des serveurs RPC en lesquels vous avez confiance et vérifiez le hash de confiance auprès d'une autre source. Gardez l'horloge synchronisée via NTP : le nœud s'arrête lorsqu'il est désynchronisé de plus de 60 secondes par rapport au réseau.

---

## Élagage et indexation

Ajustez l'élagage (pruning) et l'indexation des transactions selon votre intégration. Les exchanges qui ont besoin d'un historique complet des transactions doivent fonctionner avec un élagage minimal et un indexeur de transactions activé.

### Élagage (`app.toml`)

```toml
# Conserve uniquement l'état récent — empreinte disque la plus faible
pruning = "default"

# Conserve tout — requis pour les requêtes archive / d'historique complet
# pruning = "nothing"
```

| `pruning`   | Comportement                                | Cas d'usage                          |
| ----------- | -------------------------------------------- | -------------------------------------- |
| `default`   | Conserve l'état récent, élague le reste      | Nœud RPC, consultations de solde/état  |
| `nothing`   | Conserve tout l'état historique              | Nœud archive, historique complet       |
| `custom`    | Valeurs de conservation/intervalle définies par l'opérateur | Rétention ajustée      |

### Limites du nœud (`app.toml`) {#node-limits}

À partir de la version de nœud v3.2.1, `init` écrit une section `[qorechain]` avec trois limites locales au nœud. Elles ne changent que ce que ce nœud garde en mémoire et ce qu'il place dans les blocs qu'il propose, jamais ce qu'un bloc doit contenir pour être valide :

```toml
[qorechain]
# Maximum number of Cosmos transactions held in the app-side mempool (default 5000).
# When full, a new transaction that pays more per gas evicts the lowest-paying one; otherwise it is refused.
cosmos-mempool-max-txs = 5000

# Time the node may spend selecting transactions for a proposal before it proposes what it has ("0s" disables the budget).
prepare-proposal-budget = "1s"

# Stop after this many candidates in a row that do not fit in the remaining block space (0 disables the cap).
prepare-proposal-max-skips = 64
```

`init` écrit aussi l'EVM chain id du réseau dans le paramètre `evm-chain-id` de la section `[evm]` de `app.toml` (`9801` pour `--chain-id qorechain-vladi`, `9800` pour `qorechain-diana`). Un nœud dont l'`app.toml` contient une autre valeur démarre quand même, mais consigne une erreur au démarrage, et son propre JSON-RPC (`eth_chainId`, signature auprès de ce nœud) répond avec un mauvais chain id tant que vous n'avez pas corrigé le fichier ; le consensus n'est pas affecté. Les anciens binaires écrivaient la valeur du testnet (`9800`) quel que soit `--chain-id`, de sorte qu'un nœud mainnet initialisé il y a longtemps doit vérifier ce paramètre. Ne définissez pas `QORE_EVM_CHAIN_ID` sur une valeur autre que celle du réseau : un tel nœud refuse de démarrer.

### Indexation des transactions (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Réglez `indexer = "kv"` (ou un indexeur plus riche) afin que les transactions soient interrogeables par hash et par événement — essentiel pour les exchanges qui réconcilient dépôts et retraits. Réglez `indexer = "null"` uniquement si vous n'avez pas besoin de requêtes historiques sur les transactions.

---

## Exposition des points de terminaison pour l'intégration {#exposing-endpoints-for-integration}

Activez et liez les serveurs API dont les intégrateurs ont besoin dans `app.toml` :

```toml
[api]
enable = true
address = "tcp://0.0.0.0:1317"

[grpc]
enable = true
address = "0.0.0.0:9090"

[json-rpc]
enable = true
address = "0.0.0.0:8545"
ws-address = "0.0.0.0:8546"
api = "eth,net,web3,txpool"
```

**Limites JSON-RPC dans la version de nœud v3.2.4.** Un nœud qui exécute le binaire v3.2.4 (testnet depuis le 19 octobre 2026 ; mainnet depuis le 23 octobre 2026) borne son propre serveur JSON-RPC. Ce sont des réglages locaux au nœud, dans la section `[json-rpc]` de `app.toml`, qui n'affectent pas le consensus : `http-body-limit` (par défaut 262144 octets, 256 Kio ; un corps de requête plus grand est refusé avec un HTTP 413 avant d'être lu), `max-concurrent-requests` (par défaut 256 ; les requêtes au-delà reçoivent aussitôt un HTTP 503) et `max-open-connections` (une valeur absente ou nulle signifie désormais 1000, et non plus illimité). En outre, l'argument de filtre de `eth_getLogs` et `eth_newFilter` est refusé lorsqu'il énumère plus de 4 positions de topics, plus de 1000 alternatives dans une même position ou plus de 1000 adresses. Un intégrateur qui envoie à son propre nœud des requêtes très volumineuses (lots ou déploiements de contrats) devrait vérifier que sa plus grande requête respecte la limite de corps et la relever si nécessaire.

Les points de terminaison publics servent les espaces de noms `eth_`, `net_`, `web3_` et `txpool_` (statut uniquement) ; un nœud initialisé par la v3.2.3 ou ultérieure utilise par défaut `eth,net,web3` et laisse `txpool` de côté (il publie les transactions en attente du nœud) : ajoutez-le donc seulement si vous en avez besoin. L'espace de noms `qor_` n'est servi par aucune version de nœud publiée, ne l'ajoutez donc pas (voir [l'espace de noms `qor_`](/api-reference/json-rpc-qor_-namespace)).

Et l'écouteur RPC dans `config.toml` :

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| Point de terminaison | Port    | Utilisation pour                                         |
| --------------------- | ------- | ---------------------------------------------------------- |
| RPC                   | `26657` | Diffusion de transactions, consultation de blocs/statut    |
| REST                  | `1317`  | Requêtes HTTP sur l'état de la chaîne                       |
| gRPC                  | `9090`  | Accès programmatique à haut débit                           |
| EVM JSON-RPC          | `8545`  | Intégrations compatibles Ethereum (chain ID `9801`)          |
| EVM WS                | `8546`  | Abonnements aux événements EVM                               |
| SVM RPC               | `8899`  | Lectures compatibles Solana (les transactions SVM sont désactivées) |

:::warning
N'exposez jamais RPC, EVM JSON-RPC ou gRPC directement sur l'internet public sans reverse proxy, limitation de débit, authentification et pare-feu. Ne liez `0.0.0.0` que derrière une couche d'entrée contrôlée.
:::

---

## Surveillance de la santé et de la synchronisation

### Statut de synchronisation

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — encore en synchronisation.
* `false` — entièrement synchronisé et servant l'état actuel.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

Le champ `network` doit indiquer `qorechain-vladi` (mainnet) ou `qorechain-diana` (testnet).

### Prometheus et Grafana

Le nœud peut exposer des métriques Prometheus sur le port **26660** (réglez `prometheus = true` dans la section `[instrumentation]` de `config.toml`) :

```
http://localhost:26660/metrics
```

Récupérez-les avec n'importe quel collecteur compatible Prometheus. Si vous exécutez la stack de surveillance Docker Compose, Grafana est disponible sur `http://localhost:3001` — définissez vos propres identifiants à la première connexion. Suivez le retard de hauteur de bloc, le nombre de pairs et l'utilisation des ressources ; alertez lorsque `catching_up` reste à `true` ou que le nombre de pairs tombe à zéro.

### Vérification du point de terminaison EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Bonnes pratiques opérationnelles

1. **Épinglez la version de la chaîne.** Exécutez la version que recommande le manifeste (**v3.2.4** sur les deux réseaux), suivez les versions officielles pour les mises à niveau coordonnées et gardez l'horloge système synchronisée via NTP.

2. **Faites tourner des nœuds redondants.** Faites fonctionner au moins deux nœuds derrière un répartiteur de charge afin qu'un simple redémarrage ou une resynchronisation n'interrompe pas le trafic d'intégration.

3. **Vérifiez le genesis et les snapshots.** Validez toujours le SHA-256 du genesis et toute somme de contrôle de snapshot par rapport à la version officielle avant de démarrer.

4. **Protégez les points de terminaison publics.** Placez RPC/EVM/gRPC derrière un reverse proxy, une limitation de débit et un pare-feu. N'exposez jamais un RPC en écriture non authentifié sur l'internet.

5. **Adaptez l'élagage au besoin.** Utilisez `pruning = "nothing"` avec `tx_index = "kv"` pour les exchanges qui réconcilient l'historique complet des dépôts/retraits ; utilisez `default` pour des consultations légères.

6. **Surveillez la synchronisation en continu.** Alertez sur le retard de hauteur de bloc, l'absence de pairs et un nœud bloqué en `catching_up`.

Un déploiement nœud uniquement ne signe jamais. Les transactions que votre intégration diffuse par son intermédiaire doivent déjà porter la signature post-quantique hybride (et, pour la voie EVM, l'expéditeur a besoin d'une clé enregistrée et d'une fenêtre d'autorisation ouverte) ; voir [Intégration exchange](/developer-guide/exchange-integration) et [Signature post-quantique](/developer-guide/post-quantum-signing).

Pour observer le réseau sans exécuter de nœud complet, voir la [documentation du Light Node](/light-node/overview).

---

## Dépannage {#troubleshooting}

### Le nœud s'arrête avec une erreur d'horloge

À partir de la version de nœud v3.2.1, le moteur de consensus s'arrête lorsque l'horloge système dérive de plus de 60 secondes par rapport au réseau. Exécutez un client NTP (`chrony` ou `systemd-timesyncd`), confirmez que l'horloge est synchronisée avec `timedatectl status`, puis redémarrez le nœud.

### Un nœud arrêté avant la mise à niveau ne reprend pas après un remplacement de binaire

Si votre nœud était déjà arrêté ou bloqué **avant** que vous ne mettiez à niveau son binaire, il ne suffit pas de déposer le nouveau binaire et de redémarrer — le nœud a des résultats ABCI obsolètes mis en cache depuis l'exécution précédente et ne réexécutera pas le bloc à l'origine de l'arrêt. Effectuez un rollback explicite avant de redémarrer :

```bash
qorechaind rollback --home <HOME>
systemctl restart <unit>
```

La commande est `qorechaind rollback` (une sous-commande de premier niveau) — il n'existe pas de sous-commande `comet rollback` ni d'option `--hard` pour celle-ci.

### La restauration d'un snapshot boucle en crash à cause d'un `priv_validator_state.json` manquant

Une archive/un snapshot publié **n'inclut pas** `data/priv_validator_state.json`, et le nœud refuse de démarrer sans lui. S'il est absent après une restauration de snapshot, créez-le — mais **uniquement s'il n'existe pas déjà**. N'écrasez jamais un fichier réel : sur un validateur, ce fichier est le garde-fou anti-double-signature, et l'écraser risque de provoquer une double signature.

```bash
echo '{"height":"0","round":0,"step":0}' > <HOME>/data/priv_validator_state.json
```

---

## Étapes suivantes

* [Connexion au Mainnet](/getting-started/connecting-to-mainnet) — Genesis, pairs et détails de connexion du mainnet
* [Exécution d'un validateur](/developer-guide/running-a-validator) — Ajouter les fonctions de production de blocs
* [Construire depuis les sources](/developer-guide/building-from-source) — Construire le binaire `qorechaind` communautaire pour le développement
* [Light Node](/light-node/overview) — Client léger qui suit le réseau sans nœud complet
