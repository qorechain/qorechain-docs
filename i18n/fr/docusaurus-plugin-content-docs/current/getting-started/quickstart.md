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
cp .env.example .env
cp .env.sidecar.example .env.sidecar
# edit .env and set GRAFANA_PASSWORD (Compose refuses to start without it)
docker compose up -d
```

Avant le premier démarrage, copiez `.env.example` vers `.env` et `.env.sidecar.example` vers `.env.sidecar` (comme ci-dessus) et définissez `GRAFANA_PASSWORD`.

Cela démarre les services suivants :

| Service            | Ports                                                                   | Description                                  |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------- |
| **qorechain-node** | `26657` (RPC), `1317` (REST), `9090` (gRPC), `8545` / `8546` (EVM) | Nœud blockchain complet avec support multi-VM |
| **ai-sidecar**     | `50051`                                                                 | Moteur de détection d'anomalies et de scoring de risque QCAI |
| **indexer**        | --                                                                      | Indexeur de blocs pour les requêtes historiques |
| **postgres**       | `5432`                                                                  | Backend de base de données pour l'indexeur   |
| **prometheus**     | `9091`                                                                  | Collecte de métriques                        |
| **grafana**        | `3001`                                                                  | Tableaux de bord de surveillance             |

Une fois tous les conteneurs sains, vous disposez d'une **chaîne de développement locale à nœud unique** (elle initialise son propre genesis ; elle ne rejoint ni le mainnet ni le testnet). Pour rejoindre un réseau en service, suivez les pages [Connexion au mainnet](/getting-started/connecting-to-mainnet) ou [Connexion au testnet](/getting-started/connecting-to-testnet).

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

:::caution Une compilation depuis les sources est destinée au développement local
L'arborescence source publique compile le binaire communautaire. Il dispose de l'ensemble des commandes mais pas du signataire post-quantique : `tx pqc gen-key` et `tx pqc cosign` renvoient une erreur (« requires the full build »), il ne peut donc pas créer de transactions pour un réseau qui exige des signatures hybrides, et ses keepers factices (stubs) ne reproduisent pas l'état de consensus des réseaux. Pour rejoindre le mainnet ou le testnet, ou y effectuer des transactions, installez le binaire de release indiqué dans `latest.json` sous [download.qore.host](https://download.qore.host).
:::

### Initialiser le nœud

```bash
./qorechaind init my-node --chain-id qorechain-diana
```

Cela crée les répertoires de configuration et de données par défaut sous `~/.qorechaind/`. Démarré seul, le nœud forme une chaîne locale à nœud unique ; pour rejoindre un réseau en service, suivez les pages de connexion.

### Démarrer le nœud

```bash
./qorechaind start
```

Le nœud démarre avec les paramètres par défaut. Voir [Connexion au testnet](/getting-started/connecting-to-testnet) pour rejoindre le réseau en service avec une configuration genesis et de pairs appropriée.

:::note
Les exemples de cette page ciblent le testnet **`qorechain-diana`** (EVM chain ID **9800**). Le mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) est en service depuis le 7 juin 2026 (version v3.2.4 depuis le 23 octobre 2026 ; le testnet exécute la v3.2.6 depuis le 27 octobre 2026) et dispose de sa propre page dédiée **Connexion au mainnet**.
:::

---

## Vérifier l'installation

Confirmez que votre nœud fonctionne correctement :

```bash
# Check that the binary runs
./qorechaind --help
```

```bash
# Query the node status via RPC
curl localhost:26657/status
```

Une réponse réussie inclut le `moniker` du nœud, le `network` (`qorechain-diana` pour la chaîne de développement locale créée ci-dessus, ou la chaîne que vous avez rejointe) et la hauteur de bloc courante.

---

## Étapes suivantes

* [Connexion au testnet](/getting-started/connecting-to-testnet) — Rejoindre le testnet Diana en service
* [Configuration du portefeuille](/getting-started/wallet-setup) — Configurer un portefeuille pour interagir avec la chaîne
* [Votre première transaction](/getting-started/first-transaction) — Envoyer votre premier transfert de QOR
* [Connexion au mainnet](/getting-started/connecting-to-mainnet) — Rejoindre le mainnet Vladi en service
* [Vue d'ensemble du SDK](/sdk/overview) — Développer des applications avec QoreChain par le code
