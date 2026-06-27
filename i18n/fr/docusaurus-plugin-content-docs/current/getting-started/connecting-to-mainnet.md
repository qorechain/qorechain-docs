---
slug: /getting-started/connecting-to-mainnet
title: Connexion au mainnet
sidebar_label: Connexion au mainnet
sidebar_position: 3
---

# Connexion au mainnet

Rejoignez le mainnet QoreChain Vladi en service en configurant votre nœud avec le bon fichier genesis, les bons pairs et les bons paramètres réseau.

:::note
Cette page concerne le mainnet **`qorechain-vladi`** (EVM chain ID **9801**, hex `0x2649`), en service depuis le **7 juin 2026 23:59 UTC** et exécutant la version de chaîne **v3.1.77** sur Cosmos SDK v0.53. Pour le testnet **`qorechain-diana`** (EVM chain ID **9800**), voir [Connexion au testnet](/getting-started/connecting-to-testnet) et répétez-y votre configuration avant de passer en production.
:::

:::warning
Les nœuds de seed du mainnet, les pairs persistants, l'URL du genesis et sa somme de contrôle SHA-256 sont publiés avec chaque version officielle du mainnet. **Obtenez toujours ces valeurs actuelles depuis le dépôt/la release officiel(le) du mainnet** et vérifiez la somme de contrôle du genesis avant de démarrer. Les valeurs de substitution ci-dessous (`<MAINNET_SEED_NODE_ID>@<host>:26656`, URL du genesis, URLs de snapshot) doivent être remplacées par les vraies valeurs publiées — ne démarrez pas un nœud mainnet contre des pairs ou un genesis non vérifiés.
:::

---

## Installation

Installez le binaire `qorechaind` soit en le compilant depuis les sources, soit en récupérant l'image Docker officielle.

### Compiler depuis les sources

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Voir [Compilation depuis les sources](/developer-guide/building-from-source) pour la liste complète des prérequis (Go 1.26+, CGO, chaîne d'outils Rust, bibliothèques natives).

### Initialiser le nœud

```bash
./qorechaind init my-node --chain-id qorechain-vladi
```

Cela crée les répertoires de configuration et de données par défaut sous `~/.qorechaind/`.

---

## Télécharger le genesis

Remplacez votre fichier genesis local par le genesis officiel du mainnet :

```bash
curl -o ~/.qorechaind/config/genesis.json \
  <MAINNET_GENESIS_URL>
```

Vérifiez la somme de contrôle du genesis par rapport à la valeur publiée dans la release officielle du mainnet avant de continuer :

```bash
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

Ce fichier définit l'état initial du mainnet Vladi, y compris l'ensemble de validateurs genesis, les allocations de jetons (TGE au genesis) et les paramètres des modules.

:::note
`<MAINNET_GENESIS_URL>` et `<MAINNET_GENESIS_SHA256>` sont des valeurs de substitution. Obtenez l'URL actuelle du genesis et sa somme de contrôle SHA-256 depuis la release/le dépôt officiel(le) du mainnet et vérifiez que la somme de contrôle correspond avant de démarrer votre nœud.
:::

---

## Configurer les pairs

Modifiez la configuration de votre nœud pour vous connecter aux pairs existants du mainnet.

Ouvrez `~/.qorechaind/config/config.toml` et définissez les champs `seeds` et `persistent_peers` :

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
Les valeurs de seed et de pairs persistants ci-dessus sont des valeurs de substitution. Obtenez l'identifiant, l'hôte et le port actuels du nœud de seed du mainnet depuis le dépôt/la release officiel(le) du mainnet. Ne vous connectez pas à des pairs non vérifiés.
:::

### Paramètres recommandés

Vous pouvez également ajuster les éléments suivants dans `config.toml` :

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Ces valeurs sont réglées pour les temps de bloc et le débit du mainnet Vladi.

---

## Démarrer le nœud

Lancez votre nœud pour commencer la synchronisation avec le réseau :

```bash
./qorechaind start
```

Le nœud se connecte aux pairs et commence à télécharger les blocs depuis le genesis. Le temps de synchronisation initial dépend de la hauteur actuelle de la chaîne et de votre vitesse réseau. Pour un démarrage plus rapide, les opérateurs utilisent généralement le state sync ou un snapshot récent — voir [Exploiter un nœud](/developer-guide/running-a-node) pour le flux complet de state-sync et de snapshot.

---

## Vérifier l'état de synchronisation

Vérifiez que votre nœud rattrape bien le dernier bloc :

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — Le nœud est encore en cours de synchronisation. Attendez qu'il rattrape son retard.
* `false` — Le nœud est entièrement synchronisé et traite les nouveaux blocs.

Vous pouvez aussi vérifier la dernière hauteur de bloc :

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

Confirmez que vous êtes sur le bon réseau — le champ `network` devrait retourner `qorechain-vladi` :

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## Surveillance

QoreChain expose plusieurs points de terminaison pour surveiller la santé et les performances du nœud.

### Métriques Prometheus

Les métriques brutes sont disponibles à :

```
http://localhost:26660/metrics
```

Ces métriques peuvent être récupérées par n'importe quel collecteur compatible Prometheus.

### Tableaux de bord Grafana

En cas d'exécution via Docker Compose, Grafana est disponible à :

```
http://localhost:3001
```

Lors de la première connexion, définissez vos propres identifiants lorsque cela vous est demandé — ne laissez pas les valeurs par défaut en place. Des tableaux de bord préconfigurés affichent la production de blocs, le débit de transactions, les connexions entre pairs et l'utilisation des ressources.

### Contrôle de santé REST

L'API REST fournit un point de terminaison de statut rapide :

```
http://localhost:1317
```

---

## Référence des ports

| Port    | Protocole | Description                                              |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — interrogation et diffusion des transactions       |
| `26656` | TCP       | P2P — communication réseau pair-à-pair                  |
| `1317`  | HTTP      | API REST — interrogation de l'état de la chaîne via HTTP |
| `9090`  | gRPC      | API gRPC — accès programmatique à la chaîne             |
| `8545`  | HTTP      | EVM JSON-RPC — RPC compatible Ethereum (chain ID `9801`) |
| `8546`  | WebSocket | EVM WebSocket — abonnements aux événements EVM en temps réel |
| `8899`  | HTTP      | SVM RPC — RPC compatible Solana                         |
| `26660` | HTTP      | Point de terminaison des métriques Prometheus          |

---

## Données du réseau

| Champ             | Valeur                                 |
| ----------------- | -------------------------------------- |
| Chain ID          | `qorechain-vladi`                      |
| EVM chain ID      | `9801` (hex `0x2649`)                  |
| Version de chaîne | v3.1.77                                |
| En service depuis | 7 juin 2026 23:59 UTC                  |
| Jeton             | QOR (`uqor`, 10^6 micro-unités = 1 QOR) |
| Préfixe de compte | `qor`                                  |
| Préfixe de validateur | `qorvaloper`                       |
| SDK               | Cosmos SDK v0.53                       |

---

## Étapes suivantes

* [Exploiter un nœud](/developer-guide/running-a-node) — Exploiter un nœud full/RPC pour les exchanges et intégrateurs
* [Exploiter un validateur](/developer-guide/running-a-validator) — Créer et exploiter un validateur
* [Configuration du portefeuille](/getting-started/wallet-setup) — Configurer un portefeuille pour le mainnet
* [Votre première transaction](/getting-started/first-transaction) — Envoyer votre premier transfert de QOR
* [Connexion au testnet](/getting-started/connecting-to-testnet) — Rejoindre le testnet Diana pour des tests gratuits
* [Réseaux](/appendix/networks) — Chain IDs, ports et la référence complète des réseaux
