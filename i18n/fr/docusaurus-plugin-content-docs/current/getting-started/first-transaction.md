---
slug: /getting-started/first-transaction
title: Première transaction
sidebar_label: Première transaction
sidebar_position: 5
---

# Première transaction

Ce guide explique comment envoyer des jetons QOR, interroger des transactions et interagir avec QoreChain via ses interfaces natives, EVM et SVM.

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (EVM chain ID **9800**). Le mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) est en service depuis le 7 juin 2026 — remplacez par le chain ID et les points de terminaison du mainnet figurant sur la page **Connexion au mainnet** pour effectuer des transactions sur le mainnet.
:::

## Vérifier votre solde

Avant d'envoyer des jetons, vérifiez le solde de votre compte :

```bash
qorechaind query bank balances qor1youraddress... --output json
```

La réponse inclut toutes les dénominations de jetons détenues par le compte. Les soldes QOR sont affichés en `uqor` (micro-QOR), où **1 QOR = 1 000 000 uqor**.

## Envoyer des QOR

Transférez des jetons depuis votre clé vers une autre adresse :

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Cela envoie **1 QOR** (1 000 000 uqor) à l'adresse du destinataire, en payant des frais de 500 uqor.

:::caution Les transferts Cosmos nécessitent une signature hybride PQC
Sur le chemin cosmos, la valeur par défaut du réseau est `hybrid_signature_mode = required` (version de chaîne actuelle **v3.1.80**). Un simple `tx bank send` classique est **rejeté** — chaque transaction du chemin cosmos doit porter une signature ML-DSA-87 (Dilithium-5) aux côtés de la signature secp256k1. Générez une clé Dilithium-5 avec `qorechaind tx pqc gen-key`, puis attachez la cosignature hybride avec `qorechaind tx pqc cosign` (ou construisez la transaction avec la fonction `buildHybridTx` du SDK QoreChain, en utilisant `includePqcPublicKey` pour que la clé s'enregistre automatiquement à la première utilisation). Pour produire la signature hybride en dehors de la CLI, la bibliothèque open-source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`) et le SDK QoreChain font l'équivalent par le code. Voir [Configuration du portefeuille](/getting-started/wallet-setup) pour le flux hybride complet.
:::

Il vous sera demandé de confirmer la transaction avant sa diffusion. Une fois confirmée, la CLI retourne un hash de transaction.

## Interroger une transaction

Recherchez une transaction terminée par son hash :

```bash
qorechaind query tx <txhash>
```

La sortie inclut le statut de la transaction, le gas utilisé, la hauteur du bloc et tous les événements émis durant l'exécution.

Pour une sortie au format JSON :

```bash
qorechaind query tx <txhash> --output json
```

## Utiliser JSON-RPC (EVM)

L'environnement d'exécution EVM de QoreChain expose une interface JSON-RPC Ethereum standard sur le port `8545`.

:::note
Les transactions EVM **ne sont pas affectées** par l'exigence de PQC hybride du chemin cosmos. Elles utilisent un chemin ante `eth_secp256k1` distinct, de sorte que la signature Ethereum standard (MetaMask, ethers.js, etc.) fonctionne sans extension PQC.
:::

### Obtenir le dernier numéro de bloc

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }' | jq '.result'
```

### Obtenir le solde d'un compte

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0xYourEVMAddress", "latest"],
    "id": 1
  }' | jq '.result'
```

Le solde est retourné sous forme de valeur encodée en hexadécimal dans la plus petite dénomination.

## Utiliser le RPC SVM

L'environnement d'exécution SVM de QoreChain expose une interface RPC compatible Solana sur le port `8899`.

### Obtenir le slot courant

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getSlot",
    "id": 1
  }' | jq '.result'
```

### Obtenir le solde d'un compte

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["YourSVMPublicKey"],
    "id": 1
  }' | jq '.result'
```

## Schémas courants de la CLI

Lorsque vous travaillez avec la CLI `qorechaind`, ces options sont fréquemment utilisées :

| Option             | Description                   | Exemple                        |
| ------------------ | ----------------------------- | ------------------------------ |
| `--chain-id`       | Spécifie la chaîne cible       | `--chain-id qorechain-diana`   |
| `--fees`           | Frais de transaction en uqor   | `--fees 500uqor`               |
| `--from`           | Nom ou adresse de la clé de signature | `--from mykey`          |
| `--output`         | Format de la réponse           | `--output json`                |
| `--node`           | Point de terminaison RPC à utiliser | `--node tcp://localhost:26657` |
| `--gas`            | Limite de gas pour la transaction | `--gas auto`                |
| `--gas-adjustment` | Multiplicateur du gas estimé   | `--gas-adjustment 1.3`         |
| `-y`               | Ignorer l'invite de confirmation | `-y`                        |

### Exemple : commande complète avec toutes les options courantes

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor \
  --node tcp://localhost:26657 \
  --output json \
  -y
```

## Étapes suivantes

Maintenant que vous avez envoyé votre première transaction, explorez davantage ce que QoreChain offre :

* **Staking et délégation** — Stakez des QOR et gagnez des récompenses
* **Pontage d'actifs** — Déplacez des actifs entre chaînes
* **Développement EVM** — Déployez des contrats intelligents Solidity sur QoreChain
