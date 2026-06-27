---
slug: /getting-started/quickstart
title: Démarrage rapide
sidebar_label: Démarrage rapide
sidebar_position: 1
---

# Démarrage rapide

Lancez un nœud QoreChain en quelques minutes. Choisissez Docker Compose pour la configuration la plus rapide, ou compilez depuis les sources pour un contrôle total.

---

## Docker Compose (recommandé)

La manière la plus simple d'exécuter un environnement QoreChain complet avec tous les services préconfigurés.

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
docker compose up -d
```

Cela démarre les services suivants :

| Service            | Ports                                                                   | Description                                  |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------- |
| **qorechain-node** | `26657` (RPC), `1317` (REST), `9090` (gRPC), `8545` (EVM), `8899` (SVM) | Nœud blockchain complet avec support multi-VM |
| **ai-sidecar**     | `50051`                                                                 | Moteur de détection d'anomalies et de scoring de risque QCAI |
| **indexer**        | --                                                                      | Indexeur de blocs pour les requêtes historiques |
| **postgres**       | `5432`                                                                  | Backend de base de données pour l'indexeur   |
| **prometheus**     | `9091`                                                                  | Collecte de métriques                        |
| **grafana**        | `3001`                                                                  | Tableaux de bord de surveillance             |

Une fois tous les conteneurs sains, votre nœud commence à se synchroniser avec le réseau.

---

## Compiler depuis les sources

### Prérequis

* **Go 1.26+** avec CGO activé
* **Chaîne d'outils Rust** (pour compiler la cryptographie PQC et les bibliothèques du runtime SVM)
* **Git**

### Compiler le binaire

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

### Initialiser le nœud

```bash
./qorechaind init my-node --chain-id qorechain-diana
```

Cela crée les répertoires de configuration et de données par défaut sous `~/.qorechaind/`.

### Démarrer le nœud

```bash
./qorechaind start
```

Le nœud démarre avec les paramètres par défaut. Voir [Connexion au testnet](/getting-started/connecting-to-testnet) pour rejoindre le réseau en service avec une configuration genesis et de pairs appropriée.

:::note
Les exemples de cette page ciblent le testnet **`qorechain-diana`** (EVM chain ID **9800**). Le mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) est en service depuis le 7 juin 2026 et dispose de sa propre page dédiée **Connexion au mainnet**.
:::

---

## Vérifier l'installation

Confirmez que votre nœud fonctionne correctement :

```bash
# Check the binary version
./qorechaind version
```

```bash
# Query the node status via RPC
curl localhost:26657/status
```

Une réponse réussie inclut le `moniker` du nœud, le `network` (devrait être `qorechain-diana`) et la hauteur de bloc courante.

---

## Étapes suivantes

* [Connexion au testnet](/getting-started/connecting-to-testnet) — Rejoindre le testnet Diana en service
* [Configuration du portefeuille](/getting-started/wallet-setup) — Configurer un portefeuille pour interagir avec la chaîne
* [Votre première transaction](/getting-started/first-transaction) — Envoyer votre premier transfert de QOR
* [Connexion au mainnet](/getting-started/connecting-to-mainnet) — Rejoindre le mainnet Vladi en service
* [Vue d'ensemble du SDK](/sdk/overview) — Développer des applications avec QoreChain par le code
