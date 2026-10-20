---
slug: /cli-reference/node-commands
title: Commandes de nœud
sidebar_label: Commandes de nœud
sidebar_position: 1
---

# Commandes de nœud

Référence des commandes `qorechaind` utilisées pour initialiser, configurer et faire fonctionner un nœud QoreChain.

:::note
QoreChain exploite deux réseaux : le mainnet **`qorechain-vladi`** (en service depuis le 7 juin 2026 ; version du nœud **v3.2.3**, appliquée à la hauteur 3 662 051 le 20 octobre 2026 ; le mainnet exécute la v3.2.3 jusqu'à la hauteur 3 742 566 et la **v3.2.4** à partir de ce bloc, programmée par la proposition de gouvernance 13) et le testnet **`qorechain-diana`** (version du nœud **v3.2.4**, appliquée à la hauteur 8 337 253 le 19 octobre 2026). Indiquez le `--chain-id` correspondant au réseau que vous souhaitez rejoindre — les exemples ci-dessous ciblent le testnet ; utilisez `--chain-id qorechain-vladi` pour le mainnet. La version actuelle de chaque réseau est indiquée dans `latest.json` sur [download.qore.host](https://download.qore.host).

Les commandes de cette page ont été vérifiées avec le binaire de la version v3.2.3. Le binaire v3.2.4 ajoute des commandes qu'un binaire v3.2.3 n'a pas (par exemple `stakingtier`) ; elles fonctionnent sur le testnet dès maintenant et sur le mainnet à partir de la hauteur 3 742 566, et lorsque ce manuel en mentionne une, il l'indique.
:::

---

## init

Initialise un nouveau nœud avec le moniker donné.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| Flag          | Type   | Description                                    |
| ------------- | ------ | ---------------------------------------------- |
| `--chain-id`  | string | Identifiant de la chaîne (à toujours indiquer ; un identifiant aléatoire est créé s'il est omis) |
| `--home`      | string | Répertoire home du nœud (par défaut : `~/.qorechaind`) |
| `--overwrite` | bool   | Écrase le `genesis.json` existant              |
| `--recover`   | bool   | Fournit une phrase mnémonique pour récupérer une clé existante au lieu d'en créer une |

Crée l'arborescence de répertoires sous `--home` avec `config/`, `data/`, et un `genesis.json` initial. Pour un nœud de réseau, remplacez ce `genesis.json` par le fichier genesis du réseau avant le démarrage (voir [Connexion au mainnet](/getting-started/connecting-to-mainnet)).

`init` écrit également l'identifiant de chaîne EVM du réseau (`9801` pour `qorechain-vladi`, `9800` pour `qorechain-diana`) dans le paramètre `evm-chain-id` de `app.toml` ; indiquez donc le bon `--chain-id`.

---

## start

Démarre le nœud et commence la synchronisation ou la production de blocs.

```bash
qorechaind start [flags]
```

| Flag                   | Type   | Description                                          |
| ---------------------- | ------ | ----------------------------------------------------- |
| `--home`               | string | Répertoire home du nœud                               |
| `--minimum-gas-prices` | string | Prix de gas minimum accepté par ce nœud. Le plancher du réseau est `0.1uqor` ; indiquez au moins cette valeur |
| `--pruning`            | string | Stratégie d'élagage : `default`, `nothing`, `everything`, `custom` (avec `--pruning-keep-recent` et `--pruning-interval`) |
| `--halt-height`        | uint   | Arrête le nœud à cette hauteur de bloc                |
| `--halt-time`          | uint   | Arrête le nœud à cet horodatage Unix                  |
| `--log_level`          | string | Verbosité des journaux : `info`, `debug`, `warn`, `error` |
| `--trace`              | bool   | Active la trace de pile complète en cas d'erreur       |

Un binaire compilé à partir de l'arborescence de sources publique (la version communautaire) refuse de démarrer sur `qorechain-vladi` ou `qorechain-diana` : il ne peut pas vérifier les signatures post-quantiques et ne peut pas rejouer fidèlement les blocs des réseaux (version de nœud v3.2.3 et ultérieures). Utilisez le binaire de la version publiée sur [download.qore.host](https://download.qore.host) ; voir [Compilation depuis les sources](/developer-guide/building-from-source).

---

## version

`qorechaind version` ne renvoie **pas** le numéro de version sur les binaires publiés : elle affiche une ligne vide, et `version --long` n'ajoute aucun détail de build. Ne vous y fiez pas pour distinguer les versions. Pour confirmer ce que vous exécutez :

- Comparez le SHA-256 de l'**archive téléchargée** avec `binary.sha256` dans le [manifeste](https://download.qore.host/mainnet/latest.json) du réseau avant de l'extraire (et conservez cette archive, ou son empreinte, comme trace de ce que vous avez installé).
- Demandez à la chaîne quelles mises à niveau elle a appliquées : `GET /cosmos/upgrade/v1beta1/applied_plan/<upgrade_name>` renvoie la hauteur à laquelle une mise à niveau a été appliquée, ou `0` si elle ne l'a pas été.

```bash
# archive checksum, as published
curl -s https://download.qore.host/mainnet/latest.json | jq -r '.version, .binary.sha256'
# has v3.2.3 been applied on mainnet, and at which height?
curl -s https://api.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.3   # {"height":"3662051"}
```

---

## status

Interroge le nœud en cours d'exécution sur son état actuel, incluant l'état de synchronisation, la dernière hauteur de bloc et les informations de consensus.

```bash
qorechaind status
```

| Flag     | Type   | Description                                     |
| -------- | ------ | ------------------------------------------------ |
| `--node` | string | Point de terminaison RPC (par défaut : `tcp://localhost:26657`) |

Renvoie du JSON avec les sections `node_info`, `sync_info` et `validator_info`.

---

## client configuration

Il n'existe pas de sous-commande `config`. Les valeurs par défaut du client (`chain-id`, `keyring-backend`, `output`, `node`) sont lues depuis `<home>/config/client.toml` ; modifiez ce fichier, ou passez le flag à chaque commande (`--chain-id`, `--keyring-backend`, `--output`, `--node`).

---

## keys

Gère le trousseau de clés local pour signer les transactions.

### Ajouter une nouvelle clé

```bash
qorechaind keys add <name> [flags]
```

| Flag                   | Type   | Description                                     |
| ---------------------- | ------ | ------------------------------------------------ |
| `--keyring-backend`    | string | Backend : `os`, `file`, `kwallet`, `pass`, `test`, `memory` |
| `--key-type`           | string | Algorithme de clé : `secp256k1` (par défaut) ou `eth_secp256k1` |
| `--coin-type`          | uint32 | Coin type HD (par défaut `118`)                   |
| `--recover`            | bool   | Récupère la clé à partir d'une phrase mnémonique  |
| `--multisig`           | string | Liste de clés séparées par des virgules pour le multisig |
| `--multisig-threshold` | uint   | Nombre minimum de signatures requises             |

### Lister toutes les clés

```bash
qorechaind keys list --keyring-backend <backend>
```

### Afficher les détails d'une clé

```bash
qorechaind keys show <name> [flags]
```

| Flag        | Type   | Description                              |
| ----------- | ------ | ------------------------------------------ |
| `--bech`    | string | Format de sortie : `acc`, `val`, `cons`     |
| `--address` | bool   | Affiche uniquement l'adresse               |
| `--pubkey`  | bool   | Affiche uniquement la clé publique         |

### Supprimer une clé

```bash
qorechaind keys delete <name> --keyring-backend <backend>
```

### Exporter une clé (chiffrée par armor)

```bash
qorechaind keys export <name>
```

### Importer une clé

```bash
qorechaind keys import <name> <keyfile>
```

---

## genesis

Gère le fichier genesis.

### Ajouter un compte genesis

```bash
qorechaind genesis add-genesis-account <address> <coins> [flags]
```

| Flag                 | Type   | Description                              |
| -------------------- | ------ | ------------------------------------------ |
| `--vesting-amount`   | string | Montant de vesting                         |
| `--vesting-start-time` | int  | Date de début de vesting (horodatage Unix) |
| `--vesting-end-time` | int    | Date de fin de vesting (horodatage Unix)   |

### Créer une transaction genesis

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| Flag                    | Type   | Description                  |
| ----------------------- | ------ | ------------------------------ |
| `--chain-id`            | string | Identifiant de la chaîne        |
| `--moniker`             | string | Moniker du validateur           |
| `--commission-rate`     | string | Taux de commission initial      |
| `--commission-max-rate` | string | Taux de commission maximum      |

### Collecter les transactions genesis

```bash
qorechaind genesis collect-gentxs
```

Autres sous-commandes de `genesis` : `bulk-add-genesis-account` et `migrate`.

### Valider le fichier genesis

```bash
qorechaind genesis validate
```

---

## Moteur de consensus

Ces sous-commandes interagissent avec la couche du moteur de consensus de QoreChain.

### Afficher la clé du validateur

```bash
qorechaind comet show-validator
```

Affiche la clé publique de consensus au format JSON. Utilisée pour vérifier l'identité du validateur.

### Afficher l'identifiant du nœud

```bash
qorechaind comet show-node-id
```

Affiche l'identifiant P2P du nœud (encodé en hexadécimal). Utilisé pour la configuration des pairs persistants.

---

## export

Exporte l'état actuel de la chaîne sous forme de fichier genesis JSON. Utile pour les mises à niveau de chaîne ou les instantanés.

```bash
qorechaind export [flags]
```

| Flag                | Type   | Description                                    |
| ------------------- | ------ | ------------------------------------------------ |
| `--for-zero-height` | bool   | Prépare l'export pour un redémarrage à la hauteur 0 |
| `--height`          | int    | Exporte l'état à une hauteur de bloc spécifique   |
| `--home`            | string | Répertoire home du nœud                           |
| `--output-document` | string | Écrit l'export dans ce fichier au lieu de STDOUT  |
| `--modules-to-export` | strings | Liste de modules à exporter, séparés par des virgules (par défaut : tous) |
| `--jail-allowed-addrs` | strings | Adresses opérateur des validateurs emprisonnés à libérer |

---

## rollback

Fait revenir l'état de la chaîne d'un bloc en arrière. Utile pour se remettre d'un échec de consensus.

```bash
qorechaind rollback [flags]
```

| Flag     | Type   | Description                                             |
| -------- | ------ | ---------------------------------------------------------- |
| `--hard` | bool   | Supprime également le dernier bloc du magasin de blocs      |
| `--home` | string | Répertoire home du nœud                                     |

Cette commande fait revenir en arrière à la fois l'état de l'application et l'état du consensus. À utiliser avec prudence, car elle ne peut pas être annulée.
