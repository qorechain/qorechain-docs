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

:::caution v3.1.92 ou ultérieure requise pour un nœud rejoignant le réseau à neuf
Un nœud qui se synchronise depuis le genesis ou qui rejoue depuis une archive/un snapshot doit être en **v3.1.92 ou ultérieure** — les versions antérieures (même si le champ `minCompatible` du manifeste n'a pas encore été mis à jour pour refléter cela) s'arrêteront au premier bloc contenant une transaction pendant le rejeu, en raison d'un bug de mesure du gaz désormais corrigé. Exécutez toujours le binaire actuel indiqué dans le manifeste ci-dessus.
:::

---

## Nœud vs Validateur

| Aspect                | Nœud uniquement (ce guide)                       | Validateur                                  |
| ---------------------- | ------------------------------------------------- | ------------------------------------------- |
| Clé de consensus        | Aucune                                            | Clé de consensus ed25519 (doit être sécurisée) |
| Production de blocs     | Non                                                | Oui — propose et signe les blocs            |
| Staking / slashing      | Non applicable                                    | Auto-délégation, risque de slashing         |
| Objectif principal      | Servir RPC/REST/gRPC/EVM/SVM aux intégrations     | Sécuriser le réseau, gagner des récompenses |
| Exposition publique     | Points de terminaison RPC/EVM généralement exposés | Validateur caché derrière des nœuds sentinelles |

---

## Réseaux cibles

| Réseau   | Chain ID            | EVM chain ID         | Notes                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Principal — en direct depuis le 7 juin 2026 |
| Testnet  | `qorechain-diana`   | `9800`               | Répétez d'abord vos intégrations ici |

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

Un déploiement nœud uniquement avec Docker Compose. Épinglez le tag d'image à la version de chaîne en direct (**v3.1.92** sur mainnet) et montez un volume persistant pour les données de la chaîne.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.92
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
      - "8899:8899"     # SVM RPC
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

Initialisez le répertoire de données une fois (le genesis et la configuration des pairs sont couverts ci-dessous), puis démarrez :

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

### 2. Récupérer le manifeste

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

Utilisez ce fichier comme source pour les valeurs du binaire, du genesis et des pairs dans les étapes ci-dessous — vérifiez `jq -r .minCompatible latest.json`, mais rappelez-vous que le **plancher v3.1.92** ci-dessus s'applique même si ce champ est en retard.

### 3. Télécharger et vérifier le genesis

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -

# Vérification croisée avec le genesis servi en direct par la chaîne :
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

Alternativement, téléchargez le snapshot de données de chaîne publié, vérifiez sa somme de contrôle, puis extrayez-le par-dessus votre répertoire de données. Le manifeste ne porte pas actuellement de pointeur de snapshot, donc consultez le listing en direct sur [download.qore.host](https://download.qore.host) pour le nom de fichier et la somme de contrôle actuels plutôt que d'en coder un en dur :

```bash
# Remplacez par le nom de fichier et la somme de contrôle actuels du listing download.qore.host
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # comparez à la somme de contrôle publiée avec le fichier

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Les snapshots sont publiés sous des **noms de fichiers horodatés par hauteur** qui changent régulièrement — consultez [download.qore.host](https://download.qore.host) pour le snapshot le plus récent et sa somme de contrôle SHA-256, et vérifiez toujours avant d'extraire. N'oubliez pas que le **minimum v3.1.92** ci-dessus s'applique aussi au rejeu depuis un snapshot.
:::

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

### Indexation des transactions (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Réglez `indexer = "kv"` (ou un indexeur plus riche) afin que les transactions soient interrogeables par hash et par événement — essentiel pour les exchanges qui réconcilient dépôts et retraits. Réglez `indexer = "null"` uniquement si vous n'avez pas besoin de requêtes historiques sur les transactions.

---

## Exposition des points de terminaison pour l'intégration

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
api = "eth,net,web3,qor"
```

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
| SVM RPC               | `8899`  | Intégrations compatibles Solana                              |

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
# Hauteur la plus récente et réseau
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

Le champ `network` doit indiquer `qorechain-vladi` (mainnet) ou `qorechain-diana` (testnet).

### Prometheus et Grafana

QoreChain expose des métriques Prometheus sur le port **26660** :

```
http://localhost:26660/metrics
```

Récupérez-les avec n'importe quel collecteur compatible Prometheus. Si vous exécutez la stack de surveillance Docker Compose, Grafana est disponible sur `http://localhost:3001` — définissez vos propres identifiants à la première connexion. Suivez le retard de hauteur de bloc, le nombre de pairs et l'utilisation des ressources ; alertez lorsque `catching_up` reste à `true` ou que le nombre de pairs tombe à zéro.

### Vérification du point de terminaison EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Attendu : "0x2649" (9801) sur mainnet
```

---

## Bonnes pratiques opérationnelles

1. **Épinglez la version de la chaîne.** Exécutez le tag en direct (**v3.1.92** sur mainnet) et suivez les versions officielles pour les mises à niveau coordonnées.

2. **Faites tourner des nœuds redondants.** Faites fonctionner au moins deux nœuds derrière un répartiteur de charge afin qu'un simple redémarrage ou une resynchronisation n'interrompe pas le trafic d'intégration.

3. **Vérifiez le genesis et les snapshots.** Validez toujours le SHA-256 du genesis et toute somme de contrôle de snapshot par rapport à la version officielle avant de démarrer.

4. **Protégez les points de terminaison publics.** Placez RPC/EVM/gRPC derrière un reverse proxy, une limitation de débit et un pare-feu. N'exposez jamais un RPC en écriture non authentifié sur l'internet.

5. **Adaptez l'élagage au besoin.** Utilisez `pruning = "nothing"` avec `tx_index = "kv"` pour les exchanges qui réconcilient l'historique complet des dépôts/retraits ; utilisez `default` pour des consultations légères.

6. **Surveillez la synchronisation en continu.** Alertez sur le retard de hauteur de bloc, l'absence de pairs et un nœud bloqué en `catching_up`.

Pour un accès en lecture ultra-léger sans exécuter un nœud complet, voir la documentation **Light Node**.

---

## Dépannage

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
* [Construire depuis les sources](/developer-guide/building-from-source) — Construire le binaire `qorechaind`
* **Light Node** — Accès en lecture ultra-léger (documentation à venir)
