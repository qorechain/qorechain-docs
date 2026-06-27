---
slug: /getting-started/connecting-to-testnet
title: Connexion au testnet
sidebar_label: Connexion au testnet
sidebar_position: 4
---

# Connexion au testnet

Rejoignez le testnet QoreChain Diana en service en configurant votre nœud avec le bon fichier genesis, les bons pairs et les bons paramètres réseau.

:::note
Cette page concerne le testnet **`qorechain-diana`** (EVM chain ID **9800**). Le mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) est en service depuis le 7 juin 2026 et dispose de sa propre page dédiée **Connexion au mainnet** avec un genesis, des pairs et des détails de connexion distincts.
:::

---

## Télécharger le genesis

Remplacez votre fichier genesis local par le genesis officiel du testnet :

```bash
curl -o ~/.qorechaind/config/genesis.json \
  https://raw.githubusercontent.com/qorechain/qorechain-core/main/config/genesis.json
```

Ce fichier définit l'état initial du testnet Diana, y compris l'ensemble de validateurs, les allocations de jetons et les paramètres des modules.

---

## Configurer les pairs

Modifiez la configuration de votre nœud pour vous connecter aux pairs existants du testnet.

Ouvrez `~/.qorechaind/config/config.toml` et définissez le champ `persistent_peers` :

```toml
persistent_peers = "node-id@seed1.qorechain.io:26656,node-id@seed2.qorechain.io:26656"
```

Consultez le [dépôt QoreChain](https://github.com/qorechain/qorechain-core) pour la liste des pairs la plus récente.

### Paramètres recommandés

Vous pouvez également ajuster les éléments suivants dans `config.toml` :

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Ces valeurs sont réglées pour les temps de bloc et le débit du testnet Diana.

---

## Démarrer le nœud

Lancez votre nœud pour commencer la synchronisation avec le réseau :

```bash
./qorechaind start
```

Le nœud se connecte aux pairs et commence à télécharger les blocs depuis le genesis. Le temps de synchronisation initial dépend de la hauteur actuelle de la chaîne et de votre vitesse réseau.

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

| Port    | Protocole | Description                                        |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — interrogation et diffusion des transactions  |
| `26656` | TCP       | P2P — communication réseau pair-à-pair             |
| `1317`  | HTTP      | API REST — interrogation de l'état de la chaîne via HTTP |
| `9090`  | gRPC      | API gRPC — accès programmatique à la chaîne        |
| `8545`  | HTTP      | EVM JSON-RPC — RPC compatible Ethereum (chain ID `9800`) |
| `8546`  | WebSocket | EVM WebSocket — abonnements aux événements EVM en temps réel |
| `8899`  | HTTP      | SVM RPC — RPC compatible Solana                    |
| `26660` | HTTP      | Point de terminaison des métriques Prometheus      |

---

## Étapes suivantes

* [Configuration du portefeuille](/getting-started/wallet-setup) — Configurer un portefeuille pour le testnet
* [Votre première transaction](/getting-started/first-transaction) — Envoyer votre premier transfert de QOR
