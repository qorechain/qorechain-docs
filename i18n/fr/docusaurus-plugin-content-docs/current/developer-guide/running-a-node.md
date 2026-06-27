---
slug: /developer-guide/running-a-node
title: Exécuter un nœud
sidebar_label: Exécuter un nœud
sidebar_position: 10
---

# Exécuter un nœud

Ce guide couvre l'exécution d'un déploiement QoreChain **en mode nœud uniquement** — un nœud complet ou RPC qui synchronise la chaîne et expose des points de terminaison pour l'intégration, **sans** tâches de validateur. Il s'adresse aux plateformes d'échange (CEX), aux backends de portefeuilles, aux indexeurs et aux intégrateurs qui ont besoin d'un accès fiable en lecture/écriture au réseau mais ne signent pas de blocs.

:::note
Pour la production de blocs, le staking, le slashing et la classification des pools, consultez plutôt [Exécuter un validateur](/developer-guide/running-a-validator). Un déploiement en mode nœud uniquement ne détient jamais de clé de consensus de validateur et n'apparaît jamais dans l'ensemble actif.
:::

:::warning
Les nœuds seed du mainnet, les pairs persistants, l'URL/somme de contrôle du genesis et les points de terminaison RPC de snapshot/state-sync sont publiés à chaque version officielle du mainnet. **Obtenez ces valeurs actuelles depuis le dépôt/la version officielle du mainnet** et vérifiez la somme de contrôle du genesis avant de démarrer. Les espaces réservés ci-dessous (`<MAINNET_SEED_NODE_ID>@<host>:26656`, `<MAINNET_GENESIS_URL>`, URL de snapshot/state-sync) doivent être remplacés par les vraies valeurs publiées.
:::

---

## Nœud ou validateur

| Aspect              | Nœud uniquement (ce guide)                      | Validateur                                 |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Clé de consensus    | Aucune                                          | Clé de consensus ed25519 (à sécuriser)     |
| Production de blocs | Non                                             | Oui — propose et signe des blocs           |
| Staking / slashing  | Sans objet                                      | Auto-délégation, risque de slashing        |
| Objectif principal  | Servir RPC/REST/gRPC/EVM/SVM aux intégrations   | Sécuriser le réseau, gagner des récompenses |
| Exposition publique | Points de terminaison RPC/EVM généralement exposés | Validateur masqué derrière des nœuds sentinelles |

---

## Réseaux cibles

| Réseau   | Chain ID            | EVM chain ID         | Notes                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Principal — en service depuis le 7 juin 2026 |
| Testnet  | `qorechain-diana`   | `9800`               | Répétez d'abord vos intégrations ici |

Substituez le `--chain-id` approprié pour votre réseau cible tout au long de ce guide. Les exemples utilisent le mainnet par défaut.

---

## Matériel recommandé

| Profil                   | CPU      | RAM   | Disque (SSD NVMe)       | Réseau    |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| Nœud RPC élagué          | 4 cœurs  | 16 Go | 500 Go+                 | 100 Mbps+ |
| Nœud complet/archive     | 8 cœurs  | 32 Go | 2 To+ (croît avec le temps) | 1 Gbps |
| Intégration d'échange    | 8 cœurs  | 32 Go | 2 To+ avec marge        | 1 Gbps    |

Un SSD NVMe est fortement recommandé — l'état de la chaîne et les stores EVM/SVM sont gourmands en E/S. Les nœuds d'archive (sans élagage, indexation complète des tx) croissent en continu ; provisionnez le disque avec de la marge et de la surveillance.

---

## Déploiement

### Docker Compose

Un déploiement en mode nœud uniquement avec Docker Compose. Épinglez le tag de l'image à la version de chaîne en service (**v3.1.77** sur le mainnet) et montez un volume persistant pour les données de la chaîne.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.77
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

Initialisez le répertoire de données une seule fois (le genesis et la configuration des pairs sont traités ci-dessous), puis démarrez :

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

### 2. Télécharger et vérifier le genesis

```bash
curl -o ~/.qorechaind/config/genesis.json <MAINNET_GENESIS_URL>
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

:::note
`<MAINNET_GENESIS_URL>` et `<MAINNET_GENESIS_SHA256>` sont des espaces réservés — obtenez l'URL et la somme de contrôle du genesis actuels depuis la version/le dépôt officiel du mainnet et vérifiez la somme de contrôle avant de démarrer.
:::

### 3. Configurer les seeds et les pairs

Ouvrez `~/.qorechaind/config/config.toml` :

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
Les valeurs de seed et de pairs sont des espaces réservés. Obtenez les seeds et pairs persistants actuels du mainnet depuis le dépôt/la version officielle du mainnet.
:::

### 4. Démarrer la synchronisation

```bash
qorechaind start
```

---

## Démarrage rapide

La synchronisation depuis le genesis peut prendre beaucoup de temps. Pour les intégrations, utilisez le **state sync** ou un **snapshot** pour un démarrage à froid rapide.

### State sync

Le state sync récupère un instantané récent de l'état de l'application depuis des serveurs RPC de confiance au lieu de rejouer chaque bloc. Configurez la section `[statesync]` dans `config.toml` :

```toml
[statesync]
enable = true
rpc_servers = "<STATESYNC_RPC_1>,<STATESYNC_RPC_2>"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Déterminez une hauteur et un hash de confiance récents depuis un point de terminaison RPC sain :

```bash
curl -s <STATESYNC_RPC_1>/block | jq '.result.block.header.height, .result.block_id.hash'
```

:::note
`<STATESYNC_RPC_1>`, `<STATESYNC_RPC_2>`, `<TRUSTED_BLOCK_HEIGHT>` et `<TRUSTED_BLOCK_HASH>` sont des espaces réservés. Utilisez les serveurs RPC de state-sync publiés dans la version officielle du mainnet, et dérivez la hauteur/le hash de confiance d'un bloc récent.
:::

### Restauration de snapshot

Vous pouvez aussi télécharger un snapshot récent des données de la chaîne et l'extraire sur votre répertoire de données :

```bash
curl -o snapshot.tar.lz4 <MAINNET_SNAPSHOT_URL>
lz4 -dc snapshot.tar.lz4 | tar -xf - -C ~/.qorechaind/
qorechaind start
```

:::note
`<MAINNET_SNAPSHOT_URL>` est un espace réservé. Obtenez les URL de snapshot (et toute somme de contrôle associée) depuis la version/le dépôt officiel du mainnet, et vérifiez la somme de contrôle avant l'extraction.
:::

---

## Élagage et indexation

Ajustez l'élagage et l'indexation des transactions selon votre intégration. Les plateformes d'échange qui ont besoin de l'historique complet des transactions devraient fonctionner avec un élagage minimal et un indexeur de transactions activé.

### Élagage (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Comportement                             | Cas d'usage                       |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | Conserve l'état récent, élague le reste  | Nœud RPC, consultations de solde/état |
| `nothing`   | Conserve tout l'état historique          | Nœud d'archive, historique complet |
| `custom`    | Valeurs de conservation/intervalle définies par l'opérateur | Rétention ajustée  |

### Indexation des transactions (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Définissez `indexer = "kv"` (ou un indexeur plus riche) pour que les transactions soient interrogeables par hash et par événement — essentiel pour les plateformes d'échange qui rapprochent dépôts et retraits. Ne définissez `indexer = "null"` que si vous n'avez pas besoin de requêtes historiques sur les tx.

---

## Exposer des points de terminaison pour l'intégration

Activez et liez les serveurs d'API dont les intégrateurs ont besoin dans `app.toml` :

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

| Point de terminaison | Port   | À utiliser pour                                        |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | Diffuser des transactions, interroger les blocs/le statut |
| REST         | `1317`  | Requêtes HTTP sur l'état de la chaîne                  |
| gRPC         | `9090`  | Accès programmatique à haut débit                      |
| EVM JSON-RPC | `8545`  | Intégrations compatibles Ethereum (chain ID `9801`)    |
| EVM WS       | `8546`  | Abonnements aux événements EVM                         |
| SVM RPC      | `8899`  | Intégrations compatibles Solana                        |

:::warning
N'exposez jamais le RPC, l'EVM JSON-RPC ou le gRPC directement à l'Internet public sans un reverse proxy, une limitation de débit, une authentification et un pare-feu. Ne vous liez à `0.0.0.0` que derrière une couche d'entrée contrôlée.
:::

---

## Surveillance de l'état et de la synchronisation

### Statut de synchronisation

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — synchronisation en cours.
* `false` — entièrement synchronisé et servant l'état actuel.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

Le champ `network` devrait indiquer `qorechain-vladi` (mainnet) ou `qorechain-diana` (testnet).

### Prometheus et Grafana

QoreChain expose des métriques Prometheus sur le port **26660** :

```
http://localhost:26660/metrics
```

Récupérez-les avec n'importe quel collecteur compatible Prometheus. Si vous exécutez la pile de surveillance Docker Compose, Grafana est disponible à l'adresse `http://localhost:3001` — définissez vos propres identifiants à la première connexion. Suivez le retard de hauteur de bloc, le nombre de pairs et l'utilisation des ressources ; alertez lorsque `catching_up` reste à `true` ou que le nombre de pairs tombe à zéro.

### Vérification du point de terminaison EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Bonnes pratiques opérationnelles

1. **Épinglez la version de la chaîne.** Exécutez le tag en service (**v3.1.77** sur le mainnet) et suivez les versions officielles pour les mises à niveau coordonnées.

2. **Exécutez des nœuds redondants.** Faites fonctionner au moins deux nœuds derrière un répartiteur de charge afin qu'un redémarrage ou une resynchronisation unique n'interrompe pas le trafic d'intégration.

3. **Vérifiez le genesis et les snapshots.** Validez toujours le SHA-256 du genesis et toute somme de contrôle de snapshot par rapport à la version officielle avant de démarrer.

4. **Protégez les points de terminaison publics.** Placez le RPC/EVM/gRPC derrière un reverse proxy, une limitation de débit et un pare-feu. N'exposez jamais un RPC d'écriture non authentifié à Internet.

5. **Adaptez l'élagage au besoin.** Utilisez `pruning = "nothing"` plus `tx_index = "kv"` pour les plateformes d'échange qui rapprochent l'historique complet des dépôts/retraits ; utilisez `default` pour des consultations légères.

6. **Surveillez la synchronisation en continu.** Alertez sur le retard de hauteur de bloc, l'absence de pairs et un nœud bloqué en `catching_up`.

Pour un accès en lecture ultra-léger sans exécuter de nœud complet, consultez la documentation du **nœud léger**.

---

## Étapes suivantes

* [Se connecter au mainnet](/getting-started/connecting-to-mainnet) — Genesis, pairs et détails de connexion du mainnet
* [Exécuter un validateur](/developer-guide/running-a-validator) — Ajoutez des tâches de production de blocs
* [Compiler depuis les sources](/developer-guide/building-from-source) — Compilez le binaire `qorechaind`
* **Nœud léger** — Accès en lecture seule ultra-léger (documentation à venir)
