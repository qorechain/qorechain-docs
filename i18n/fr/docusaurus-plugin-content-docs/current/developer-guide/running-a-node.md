---
slug: /developer-guide/running-a-node
title: Exécuter un nœud
sidebar_label: Exécuter un nœud
sidebar_position: 10
---

# Exécuter un nœud

Ce guide couvre l'exploitation d'un déploiement QoreChain **nœud uniquement** — un nœud complet ou RPC qui synchronise la chaîne et expose des points de terminaison pour l'intégration, **sans** fonctions de validateur. Il s'adresse aux plateformes d'échange (CEX), aux backends de portefeuilles, aux indexeurs et aux intégrateurs qui ont besoin d'un accès fiable en lecture/écriture au réseau mais ne signent pas de blocs.

:::note
Pour la production de blocs, le staking, le slashing et la classification des pools, consultez plutôt [Exécuter un validateur](/developer-guide/running-a-validator). Un déploiement nœud uniquement ne détient jamais de clé de consensus de validateur et n'apparaît jamais dans l'ensemble actif.
:::

:::warning
Les binaires, la genèse et les snapshots sont publiés sur [download.qore.host](https://download.qore.host) avec des sommes de contrôle SHA-256. **Vérifiez toujours les sommes de contrôle avant d'installer ou d'extraire**, et vérifiez les dépôts uniquement auprès de votre propre nœud synchronisé.
:::

---

## Nœud vs Validateur

| Aspect              | Nœud uniquement (ce guide)                       | Validateur                                  |
| ------------------- | ------------------------------------------------ | ------------------------------------------- |
| Clé de consensus    | Aucune                                           | Clé de consensus ed25519 (à sécuriser)      |
| Production de blocs | Non                                              | Oui — propose et signe des blocs            |
| Staking / slashing  | Non applicable                                   | Auto-délégation, risque de slashing         |
| Objectif principal  | Servir RPC/REST/gRPC/EVM/SVM aux intégrations    | Sécuriser le réseau, gagner des récompenses |
| Exposition publique | Points de terminaison RPC/EVM généralement exposés | Validateur masqué derrière des nœuds sentinelles |

---

## Réseaux cibles

| Réseau   | Chain ID            | EVM chain ID          | Notes                          |
| -------- | ------------------- | --------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Principal — en production depuis le 7 juin 2026 |
| Testnet  | `qorechain-diana`   | `9800`                | Répétez d'abord vos intégrations ici |

Remplacez le `--chain-id` par celui de votre réseau cible tout au long de ce guide. Les exemples utilisent le mainnet par défaut.

---

## Matériel recommandé

| Profil                    | CPU      | RAM   | Disque (SSD NVMe)         | Réseau    |
| ------------------------- | -------- | ----- | ------------------------- | --------- |
| Nœud RPC élagué           | 4 cœurs  | 16 Go | 500 Go+                   | 100 Mbps+ |
| Nœud complet/archive      | 8 cœurs  | 32 Go | 2 To+ (croît avec le temps) | 1 Gbps  |
| Intégration d'échange     | 8 cœurs  | 32 Go | 2 To+ avec marge          | 1 Gbps    |

Un SSD NVMe est fortement recommandé — l'état de la chaîne et les magasins EVM/SVM sont intensifs en E/S. Les nœuds d'archive (sans élagage, indexation complète des tx) croissent en continu ; provisionnez le disque avec de la marge et de la supervision.

---

## Déploiement

### Docker Compose

Un déploiement nœud uniquement avec Docker Compose. Épinglez le tag de l'image sur la version en production de la chaîne (**v3.1.82** sur le mainnet) et montez un volume persistant pour les données de la chaîne.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.82
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

Initialisez le répertoire de données une seule fois (la genèse et la configuration des pairs sont couvertes ci-dessous), puis démarrez :

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

Pour une installation sur serveur physique, exécutez `qorechaind` sous systemd :

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

### 2. Télécharger et vérifier la genèse

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 3. Configurer les pairs et le plancher de frais

Ouvrez `~/.qorechaind/config/config.toml` et définissez les pairs sentinelles publics du mainnet :

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

Puis définissez le prix minimum du gaz dans `~/.qorechaind/config/app.toml` (plancher de frais du réseau : **0.1uqor**) :

```toml
minimum-gas-prices = "0.1uqor"
```

### 4. Démarrer la synchronisation

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## Amorçage rapide

Se synchroniser depuis la genèse peut prendre beaucoup de temps. Pour les intégrations, utilisez le **state sync** ou un **snapshot** pour un démarrage à froid rapide.

### State sync

Le state sync récupère un snapshot récent de l'état applicatif depuis des serveurs RPC de confiance au lieu de rejouer chaque bloc. Configurez la section `[statesync]` dans `config.toml` :

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Déterminez une hauteur et un hash de confiance récents à partir du RPC public :

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### Restauration depuis un snapshot

Vous pouvez aussi télécharger le snapshot publié des données de la chaîne, vérifier sa somme de contrôle, puis l'extraire dans votre répertoire de données :

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Les snapshots sont publiés sous des **noms de fichiers estampillés par hauteur de bloc** — consultez [download.qore.host](https://download.qore.host) pour le snapshot le plus récent et sa somme de contrôle SHA-256, et vérifiez toujours avant d'extraire.
:::

---

## Élagage et indexation

Ajustez l'élagage et l'indexation des transactions selon votre intégration. Les plateformes d'échange qui ont besoin de l'historique complet des transactions doivent fonctionner avec un élagage minimal et un indexeur de transactions activé.

### Élagage (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Comportement                                  | Cas d'usage                          |
| ----------- | --------------------------------------------- | ------------------------------------ |
| `default`   | Conserve l'état récent, élague le reste       | Nœud RPC, consultations de soldes/état |
| `nothing`   | Conserve tout l'état historique               | Nœud d'archive, historique complet   |
| `custom`    | Valeurs de rétention/intervalle définies par l'opérateur | Rétention ajustée         |

### Indexation des transactions (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Définissez `indexer = "kv"` (ou un indexeur plus riche) afin que les transactions soient interrogeables par hash et par événement — essentiel pour les plateformes d'échange qui réconcilient dépôts et retraits. Ne définissez `indexer = "null"` que si vous n'avez pas besoin de requêtes historiques sur les tx.

---

## Exposer les points de terminaison pour l'intégration

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

| Point de terminaison | Port    | Utilisation                                              |
| -------------------- | ------- | -------------------------------------------------------- |
| RPC                  | `26657` | Diffusion de transactions, requêtes de blocs/statut       |
| REST                 | `1317`  | Requêtes HTTP sur l'état de la chaîne                     |
| gRPC                 | `9090`  | Accès programmatique à haut débit                         |
| EVM JSON-RPC         | `8545`  | Intégrations compatibles Ethereum (chain ID `9801`)       |
| EVM WS               | `8546`  | Abonnements aux événements EVM                            |
| SVM RPC              | `8899`  | Intégrations compatibles Solana                           |

:::warning
N'exposez jamais directement le RPC, l'EVM JSON-RPC ou le gRPC sur l'internet public sans reverse proxy, limitation de débit, authentification et pare-feu. Ne liez sur `0.0.0.0` que derrière une couche d'entrée contrôlée.
:::

---

## Supervision de la santé et de la synchronisation

### Statut de synchronisation

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — synchronisation en cours.
* `false` — entièrement synchronisé et servant l'état courant.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

Le champ `network` doit indiquer `qorechain-vladi` (mainnet) ou `qorechain-diana` (testnet).

### Prometheus et Grafana

QoreChain expose des métriques Prometheus sur le port **26660** :

```
http://localhost:26660/metrics
```

Collectez-les avec n'importe quel collecteur compatible Prometheus. Si vous exécutez la pile de supervision Docker Compose, Grafana est disponible sur `http://localhost:3001` — définissez vos propres identifiants à la première connexion. Suivez le retard de hauteur de bloc, le nombre de pairs et l'utilisation des ressources ; alertez lorsque `catching_up` reste à `true` ou que le nombre de pairs tombe à zéro.

### Vérification du point de terminaison EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Bonnes pratiques opérationnelles

1. **Épinglez la version de la chaîne.** Exécutez le tag en production (**v3.1.82** sur le mainnet) et suivez les versions officielles pour les mises à niveau coordonnées.

2. **Exécutez des nœuds redondants.** Exploitez au moins deux nœuds derrière un répartiteur de charge afin qu'un seul redémarrage ou une resynchronisation n'interrompe pas le trafic d'intégration.

3. **Vérifiez la genèse et les snapshots.** Validez toujours le SHA-256 de la genèse et toute somme de contrôle de snapshot par rapport à la version officielle avant de démarrer.

4. **Protégez les points de terminaison publics.** Placez RPC/EVM/gRPC derrière un reverse proxy, une limitation de débit et un pare-feu. N'exposez jamais un RPC en écriture non authentifié sur internet.

5. **Adaptez l'élagage au besoin.** Utilisez `pruning = "nothing"` avec `tx_index = "kv"` pour les plateformes d'échange qui réconcilient l'historique complet des dépôts/retraits ; utilisez `default` pour des consultations légères.

6. **Supervisez la synchronisation en continu.** Alertez sur le retard de hauteur de bloc, l'absence de pairs et un nœud bloqué en `catching_up`.

Pour un accès en lecture ultra-léger sans exécuter de nœud complet, consultez la documentation **Light Node**.

---

## Prochaines étapes

* [Se connecter au mainnet](/getting-started/connecting-to-mainnet) — Genèse du mainnet, pairs et détails de connexion
* [Exécuter un validateur](/developer-guide/running-a-validator) — Ajouter les fonctions de production de blocs
* [Compiler depuis les sources](/developer-guide/building-from-source) — Compiler le binaire `qorechaind`
* **Light Node** — Accès en lecture seule ultra-léger (documentation à venir)
