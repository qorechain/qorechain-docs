---
slug: /cli-reference/node-commands
title: Commandes de nœud
sidebar_label: Commandes de nœud
sidebar_position: 1
---

# Commandes de nœud

Référence des commandes `qorechaind` utilisées pour initialiser, configurer et faire fonctionner un nœud QoreChain.

:::note
QoreChain exploite deux réseaux : le mainnet **`qorechain-vladi`** (en service depuis le 7 juin 2026, en version de chaîne **v3.1.95**) et le testnet **`qorechain-diana`**. Indiquez le `--chain-id` correspondant au réseau que vous souhaitez rejoindre — les exemples ci-dessous ciblent le testnet ; utilisez `--chain-id qorechain-vladi` pour le mainnet.
:::

---

## init

Initialise un nouveau nœud avec le moniker donné.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| Flag          | Type   | Description                                    |
| ------------- | ------ | ---------------------------------------------- |
| `--chain-id`  | string | Identifiant de la chaîne (obligatoire)         |
| `--home`      | string | Répertoire home du nœud (par défaut : `~/.qorechaind`) |
| `--overwrite` | bool   | Écrase les fichiers de genesis et de configuration existants |

Crée l'arborescence de répertoires sous `--home` avec `config/`, `data/`, et un `genesis.json` initial.

---

## start

Démarre le nœud et commence la synchronisation ou la production de blocs.

```bash
qorechaind start [flags]
```

| Flag                   | Type   | Description                                          |
| ---------------------- | ------ | ----------------------------------------------------- |
| `--home`               | string | Répertoire home du nœud                               |
| `--minimum-gas-prices` | string | Prix de gas minimum à accepter (ex. : `0.001uqor`)     |
| `--pruning`            | string | Stratégie d'élagage : `default`, `nothing`, `everything` |
| `--halt-height`        | uint   | Arrête le nœud à cette hauteur de bloc                |
| `--halt-time`          | uint   | Arrête le nœud à cet horodatage Unix                  |
| `--log_level`          | string | Verbosité des journaux : `info`, `debug`, `warn`, `error` |
| `--trace`              | bool   | Active la trace de pile complète en cas d'erreur       |

---

## version

Affiche la version du binaire `qorechaind` et les informations de build.

```bash
qorechaind version
```

Utilisez `--long` pour des détails de build étendus, incluant la version de Go, le hash de commit et les tags de build :

```bash
qorechaind version --long
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

## config

Lit ou écrit des valeurs dans la configuration du nœud.

### Définir une valeur de configuration

```bash
qorechaind config set <key> <value>
```

### Obtenir une valeur de configuration

```bash
qorechaind config get <key>
```

Les clés de configuration courantes incluent `chain-id`, `keyring-backend`, `output` et `node`.

---

## keys

Gère le trousseau de clés local pour signer les transactions.

### Ajouter une nouvelle clé

```bash
qorechaind keys add <name> [flags]
```

| Flag                   | Type   | Description                                     |
| ---------------------- | ------ | ------------------------------------------------ |
| `--keyring-backend`    | string | Backend : `os`, `file`, `test`                    |
| `--algo`               | string | Algorithme de clé : `secp256k1` (par défaut), `ed25519` |
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

### Valider le fichier genesis

```bash
qorechaind genesis validate-genesis
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
