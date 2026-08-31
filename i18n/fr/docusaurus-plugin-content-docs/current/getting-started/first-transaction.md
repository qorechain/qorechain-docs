---
slug: /getting-started/first-transaction
title: Première transaction
sidebar_label: Première transaction
sidebar_position: 5
---

# Première transaction

Ce guide explique comment envoyer des tokens QOR, interroger des transactions et interagir avec QoreChain via ses interfaces native, EVM et SVM.

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (chain ID EVM **9800**). Le mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) est en production depuis le 7 juin 2026 — remplacez le chain ID et les endpoints par ceux du mainnet indiqués sur la page **Connecting to Mainnet** lorsque vous transactez sur le mainnet.
:::

## Vérifier votre solde

Avant d'envoyer des tokens, vérifiez le solde de votre compte :

```bash
qorechaind query bank balances qor1youraddress... --output json
```

La réponse inclut toutes les dénominations de tokens détenues par le compte. Les soldes QOR sont affichés en `uqor` (micro-QOR), où **1 QOR = 1 000 000 uqor**.

## Envoyer des QOR

Transférez des tokens de votre clé vers une autre adresse :

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Cela envoie **1 QOR** (1 000 000 uqor) à l'adresse destinataire, en payant des frais de 500 uqor.

:::caution Les transferts Cosmos exigent une signature PQC hybride
Sur le chemin cosmos, le paramètre par défaut du réseau est `hybrid_signature_mode = required` (version actuelle de la chaîne : **v3.1.95**). Un `tx bank send` classique en texte clair est **rejeté** — chaque transaction sur le chemin cosmos doit porter une signature ML-DSA-87 (Dilithium-5) en plus de la signature secp256k1. Générez une clé Dilithium-5 avec `qorechaind tx pqc gen-key`, puis attachez la cosignature hybride avec `qorechaind tx pqc cosign` (ou construisez la transaction avec `buildHybridTx` du SDK QoreChain, en utilisant `includePqcPublicKey` pour que la clé s'enregistre automatiquement au premier usage). Pour produire la signature hybride en dehors du CLI, la bibliothèque open source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`) et le SDK QoreChain font l'équivalent en code. Consultez [Wallet Setup](/getting-started/wallet-setup) pour le flux hybride complet.
:::

Il vous sera demandé de confirmer la transaction avant sa diffusion. Une fois confirmée, le CLI renvoie un hash de transaction.

## Interroger une transaction

Recherchez une transaction terminée à partir de son hash :

```bash
qorechaind query tx <txhash>
```

La sortie inclut le statut de la transaction, le gas consommé, la hauteur de bloc et tous les événements émis pendant l'exécution.

Pour une sortie au format JSON :

```bash
qorechaind query tx <txhash> --output json
```

## Utiliser JSON-RPC (EVM)

L'environnement d'exécution EVM de QoreChain expose une interface JSON-RPC Ethereum standard sur le port `8545`.

:::note
Les transactions EVM ne sont **pas concernées** par l'exigence de PQC hybride du chemin cosmos. Elles utilisent un chemin ante `eth_secp256k1` distinct, ce qui permet à la signature Ethereum standard (MetaMask, ethers.js, etc.) de fonctionner sans extension PQC.
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

Le solde est renvoyé sous forme de valeur encodée en hexadécimal, dans la plus petite dénomination.

## Utiliser SVM RPC

L'environnement d'exécution SVM de QoreChain expose une interface RPC compatible Solana sur le port `8899`.

### Obtenir le slot actuel

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

## Motifs CLI courants

Lorsque vous travaillez avec le CLI `qorechaind`, ces options sont utilisées fréquemment :

| Option              | Description                          | Exemple                        |
| ------------------- | ------------------------------------- | ------------------------------ |
| `--chain-id`        | Spécifie la chaîne cible              | `--chain-id qorechain-diana`   |
| `--fees`            | Frais de transaction en uqor          | `--fees 500uqor`               |
| `--from`            | Nom de clé ou adresse de signature    | `--from mykey`                 |
| `--output`          | Format de la réponse                  | `--output json`                |
| `--node`            | Endpoint RPC auquel se connecter      | `--node tcp://localhost:26657` |
| `--gas`             | Limite de gas pour la transaction     | `--gas auto`                   |
| `--gas-adjustment`  | Multiplicateur pour le gas estimé     | `--gas-adjustment 1.3`         |
| `-y`                | Ignore la demande de confirmation     | `-y`                           |

### Exemple : commande complète avec toutes les options courantes

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor \
  --node tcp://localhost:26657 \
  --output json \
  -y
```

## Prochaines étapes

Maintenant que vous avez envoyé votre première transaction, découvrez le reste de ce que QoreChain propose :

* **Staking et délégation** — Stakez vos QOR et gagnez des récompenses
* **Bridging des actifs** — Déplacez des actifs entre chaînes
* **Développement EVM** — Déployez des smart contracts Solidity sur QoreChain
