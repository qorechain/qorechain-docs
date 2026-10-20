---
slug: /getting-started/first-transaction
title: Première transaction
sidebar_label: Première transaction
sidebar_position: 5
---

# Première transaction

Ce guide explique comment envoyer des tokens QOR, interroger des transactions et interagir avec QoreChain via ses interfaces native, EVM et SVM.

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (chain ID EVM **9800**). Le mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) est en production depuis le 7 juin 2026 et exécute la version v3.2.3 (le testnet exécute la v3.2.4) — remplacez le chain ID et les endpoints par ceux du mainnet indiqués sur la page **Connecting to Mainnet** lorsque vous transactez sur le mainnet.
:::

## Vérifier votre solde

Avant d'envoyer des tokens, vérifiez le solde de votre compte :

```bash
qorechaind query bank balances qor1youraddress... --output json
```

La réponse inclut toutes les dénominations de tokens détenues par le compte. Les soldes QOR sont affichés en `uqor` (micro-QOR), où **1 QOR = 1 000 000 uqor**.

## Envoyer des QOR {#send-qor}

Un compte QoreChain envoie sur la voie Cosmos avec une **signature hybride** : la signature classique secp256k1 plus une signature ML-DSA-87 (Dilithium-5). Un simple `qorechaind tx bank send ... -y` est rejeté ; le transfert est donc construit sans signature, puis cosigné. Vous devez avoir enregistré une fois une clé post-quantique sur votre compte (voir [Enregistrer votre clé post-quantique](#register-pqc-key) ci-dessous), et utiliser le binaire de version officiel `qorechaind` depuis [download.qore.host](https://download.qore.host) (un binaire compilé à partir de l'arborescence de sources publique ne peut ni créer ni appliquer de signature Dilithium).

```bash
# 1. Build the unsigned transaction (the fee is fixed here, because cosign signs the fee in this file)
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > tx.json

# 2. Add the ML-DSA-87 signature and broadcast
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Cela envoie **1 QOR** (1 000 000 uqor) à l'adresse destinataire et paie des frais de 40 000 uqor (0,04 QOR). Le plancher du réseau est de **0,1 uqor par unité de gas** : les frais doivent donc être au moins égaux à la limite de gas multipliée par 0,1 — `--gas 400000` nécessite `--fees 40000uqor` ou plus. Un transfert signé en hybride consomme généralement entre 160 000 et 240 000 de gas, car la signature ajoute environ 4,7 Ko à la transaction. `cosign` demande au nœud quelle forme d'octets signés le réseau vérifie, de sorte que la même commande fonctionne sur les deux réseaux.

### Enregistrer votre clé post-quantique {#register-pqc-key}

Une clé post-quantique est **enregistrée explicitement**, une fois par compte. La chaîne ne l'enregistre pas pour vous lors de votre première transaction. La transaction d'enregistrement elle-même (ainsi que la migration de clé) peut être signée avec la seule clé classique, afin qu'un compte tout neuf puisse s'initialiser :

```bash
# generate the ML-DSA-87 key (stored under ~/.qorechaind/pqc/mypqc.dilithium, mode 0600, not encrypted)
qorechaind tx pqc gen-key mypqc

# register the printed public key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

Depuis la v3.2.3, la chaîne accepte aussi une **preuve de possession** facultative avec l'enregistrement, et refuse les clés faibles, dégénérées ou déjà utilisées. Pour en joindre une, enregistrez avec `register-key-v2` et nommez votre clé locale :

```bash
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

Sauvegardez le fichier de clé PQC aussi soigneusement que votre phrase de récupération ; il peut être re-dérivé à partir de la phrase avec `qorechaind tx pqc recover-key`. [QoreX](/qorex/overview) et le SDK QoreChain effectuent l'enregistrement de la clé pour vous. Consultez [Wallet Setup](/getting-started/wallet-setup) pour le flux hybride complet.

:::caution Les transferts Cosmos exigent une signature PQC hybride
Sur la voie Cosmos, le paramètre du réseau est `hybrid_signature_mode = required` (les réseaux en production exécutent la ligne v3.2). Une transaction purement classique est **rejetée**. Pour produire la signature hybride en dehors du CLI, la bibliothèque open source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`) et le SDK QoreChain font l'équivalent en code.
:::

Une fois la transaction cosignée acceptée, le CLI renvoie un hash de transaction.

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

:::caution Les transactions EVM nécessitent une fenêtre d'autorisation
La signature Ethereum standard (MetaMask, ethers.js, ...) fonctionne toujours sans modification, mais depuis la v3.2.0 la voie EVM n'admet une transaction que d'un compte disposant d'une **clé post-quantique enregistrée** et d'une **fenêtre d'autorisation EVM ouverte**. Ouvrez-en une d'abord (c'est une transaction de la voie Cosmos, signée avec votre clé ML-DSA) — voir [Fenêtre d'autorisation EVM](#evm-window) ci-dessous. Sans elle, le nœud répond `no open EVM authorisation window`. La lecture de l'état (`eth_blockNumber`, `eth_getBalance`, `eth_call`, `eth_estimateGas`) ne nécessite aucune fenêtre.
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

### Fenêtre d'autorisation EVM {#evm-window}

Depuis la version de chaîne **v3.2.0** (hauteur mainnet 2,981,742, 25 septembre 2026 ; hauteur testnet 5,920,000), la voie EVM n'admet une transaction que d'un compte qui

1. dispose d'une **clé post-quantique enregistrée** (ML-DSA-87), et
2. dispose d'une **fenêtre d'autorisation EVM ouverte** qui a encore de la place pour la transaction.

Tout le reste de la voie EVM est inchangé : vous continuez à signer avec MetaMask, ethers.js, Hardhat ou Foundry, et `eth_estimateGas` ainsi que les autres simulations fonctionnent sans fenêtre. Les déploiements de contrats comptent comme n'importe quelle autre transaction EVM : une fenêtre est donc nécessaire avant de déployer.

**Pourquoi une fenêtre ?** Un wallet standard produit une seule signature secp256k1 sur une transaction Ethereum et ne laisse aux applications aucun moyen d'y joindre une seconde signature post-quantique. L'autorisation post-quantique voyage donc *avant* la transaction : vous ouvrez une fenêtre bornée avec une transaction normale de la voie Cosmos, qui, elle, porte votre signature ML-DSA, et la voie EVM admet ensuite les transactions couvertes par cette fenêtre. Une clé classique seule ne peut jamais ouvrir de fenêtre : une clé classique volée ne peut donc dépenser que ce qu'une fenêtre déjà ouverte autorise. Cela fonctionne comme une approbation ERC-20 : on autorise un montant borné pour une durée bornée, puis on transige normalement.

**Ce que borne une fenêtre.** Trois bornes s'appliquent en même temps ; la première atteinte ferme la fenêtre.

| Borne | Signification | Plage autorisée |
| --- | --- | --- |
| `blocks` | Durée pendant laquelle la fenêtre reste ouverte, comptée à partir du bloc qui l'ouvre | 1 – 17,280 |
| `max-txs` | Nombre de transactions EVM qu'elle admet | 1 – 1,000 |
| `max-value` | Sortie totale qu'elle admet, en uqor : valeur transférée **plus** les frais maximaux que chaque transaction pourrait payer (limite de gas × plafond de frais), arrondi à l'unité supérieure | supérieur à 0 |

* 17,280 blocs représentent environ 15 heures sur le mainnet (environ 3,2 s par bloc) et environ 5 heures sur le testnet (environ 1,0 s par bloc).
* Une transaction admise qui échoue consomme tout de même son emplacement et son budget de valeur.
* L'ouverture d'une nouvelle fenêtre **remplace** la précédente ; la consommation repart de zéro.
* Le CLI accepte `max-value` en `uqor` ou en `qor` (`1000qor` = 1,000,000,000 uqor).
* La borne de valeur ne compte que le QOR natif : un transfert de token, une approbation ou tout autre appel de contrat porte une valeur nulle. Pour borner aussi ceux-ci, restreignez la portée de la fenêtre (ci-dessous).

**Étape 1 — enregistrez votre clé post-quantique** (une seule fois) : voir [Enregistrer votre clé post-quantique](#register-pqc-key) ci-dessus.

**Étape 2 — ouvrez une fenêtre.** L'ouverture d'une fenêtre est une transaction de la voie Cosmos : elle est donc produite sans signature, puis cosignée :

```bash
# at most 1000 QOR in total, at most 20 transactions, for 7,200 blocks (about 6.4 hours on mainnet)
qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Restreindre la portée (v3.2.3 et ultérieures).** Deux options facultatives restreignent ce qu'une fenêtre ouverte admet : `--native-only` n'admet que des transferts de QOR natif simples (pas de calldata, pas de création de contrat, pas de destinataire qui porte du code), et `--allowed-targets 0xAAA...,0xBBB...` n'admet que les transactions vers ces destinataires (16 au plus ; la création de contrat est alors refusée). Par exemple :

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json
```

Sur le mainnet, l'ouverture d'une fenêtre a consommé environ 180 000 de gas. Dans [QoreX](/qorex/security-and-recovery#evm-window), la même étape correspond à **Réglages → Sécurité → Fenêtre d'accès EVM** (application) ou au bouton **Fenêtre d'accès EVM** (extension). L'ouverture de la fenêtre fait avancer le nonce de votre compte : ouvrez-la donc **avant** de préparer la transaction EVM dans votre wallet.

**Étape 3 — vérifiez ce qu'il reste :**

```bash
qorechaind query pqc evm-window qor1youraddress...
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/qor1youraddress...
```

La réponse REST n'échoue jamais pour une adresse sans fenêtre ; elle renvoie `found: false`. Les champs sont `found`, `live`, `opened_height`, `expiry_height`, `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs` et `remaining_value` (entiers en uqor, renvoyés sous forme de chaînes). Sur le mainnet, utilisez `https://api.qore.host`.

**Étape 4 — utilisez normalement la voie EVM.** Envoyez depuis MetaMask ou vos outils comme d'habitude. Chaque transaction consomme un emplacement de transaction et (valeur + frais maximaux) de la fenêtre.

**Fermer une fenêtre plus tôt.** Si vous soupçonnez que votre clé classique est compromise, fermez la fenêtre ; tout ce qu'elle admettait encore est refusé à partir du bloc suivant. La fermeture révoque aussi tout consentement de délégation EIP-7702 en attente (depuis la v3.2.2 ; une transaction de type 4 qui modifie le code d'un compte n'est admise qu'après un consentement post-quantique `authorize-evm-delegation`) :

```bash
qorechaind tx pqc close-evm-window --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > close.json
qorechaind tx pqc cosign close.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Erreurs**

| Ce que vous voyez | Signification | Que faire |
| --- | --- | --- |
| `no open EVM authorisation window; open one with MsgOpenEVMWindow ...` (module `pqc`, code 26) | Aucune fenêtre pour ce compte | Étape 2 |
| `... has no registered post-quantum key; the EVM lane requires one` (code 26 sur la voie EVM ; code 28 si vous essayez d'ouvrir une fenêtre) | Aucune clé ML-DSA enregistrée | Étape 1 |
| `the EVM authorisation window for ... does not admit this transaction (remaining: ...)` (code 27) | Expirée ou épuisée ; le message indique quelle borne | Ouvrez une nouvelle fenêtre |
| `invalid EVM authorisation window` (code 28) | Bornes hors plage (`blocks` 1–17,280, `max-txs` 1–1,000, `max-value` > 0) | Corrigez les arguments |

Depuis le code, le SDK QoreChain et `@qorechain/wallet-adapter` peuvent composer les messages d'ouverture et de fermeture et lire l'état de la fenêtre ; voir la [documentation du SDK](/sdk/overview).

La fenêtre ne s'applique qu'à la voie EVM. Les transactions de la voie Cosmos portent déjà la signature hybride à chaque transaction, et si vous n'ouvrez jamais de fenêtre, vos transactions EVM sont refusées sans que rien d'autre ne change.

## Utiliser SVM RPC

L'environnement d'exécution SVM de QoreChain expose une interface RPC compatible Solana sur le port `8899`. La voie de transactions SVM est actuellement désactivée sur l'ensemble du réseau : ces méthodes de lecture sont donc la partie que vous pouvez utiliser aujourd'hui.

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
| `--fees`            | Frais de transaction en uqor (limite de gas × au moins 0,1) | `--fees 40000uqor`  |
| `--from`            | Nom de clé ou adresse de signature    | `--from mykey`                 |
| `--output`          | Format de la réponse                  | `--output json`                |
| `--node`            | Endpoint RPC auquel se connecter      | `--node tcp://localhost:26657` |
| `--gas`             | Limite de gas pour la transaction     | `--gas 400000` (ou `--gas auto`) |
| `--gas-adjustment`  | Multiplicateur pour le gas estimé     | `--gas-adjustment 1.5`         |
| `--gas-prices`      | Prix du gas au lieu de `--fees`       | `--gas-prices 0.1uqor`         |
| `--generate-only`   | Affiche la transaction sans signature (requis avant `tx pqc cosign`) | `--generate-only` |
| `-y`                | Ignore la demande de confirmation     | `-y`                           |

### Exemple : commande complète avec toutes les options courantes

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --node tcp://localhost:26657 \
  --output json \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

## Prochaines étapes

Maintenant que vous avez envoyé votre première transaction, découvrez le reste de ce que QoreChain propose :

* **Staking et délégation** — Stakez vos QOR pour contribuer à la sécurité du réseau et recevoir des récompenses de staking
* **Bridging des actifs** — Déplacez des actifs entre chaînes
* **Développement EVM** — Déployez des smart contracts Solidity sur QoreChain
