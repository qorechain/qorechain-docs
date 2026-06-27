---
slug: /cli-reference/node-commands
title: Commandes de nœud
sidebar_label: Commandes de nœud
sidebar_position: 1
---

# Commandes de nœud

Référence des commandes `qorechaind` utilisées pour initialiser, configurer et exploiter un nœud QoreChain.

:::note
QoreChain exécute deux réseaux : le mainnet **`qorechain-vladi`** (en service depuis le 7 juin 2026 sur la version de chaîne **v3.1.77**) et le testnet **`qorechain-diana`**. Passez le `--chain-id` approprié pour le réseau que vous souhaitez rejoindre — les exemples ci-dessous ciblent le testnet ; utilisez `--chain-id qorechain-vladi` pour le mainnet.
:::

---

## init

Initialise un nouveau nœud avec le moniker indiqué.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| Indicateur          | Type   | Description                                    |
| ------------- | ------ | ---------------------------------------------- |
| `--chain-id`  | string | Identifiant de la chaîne (requis)                    |
| `--home`      | string | Répertoire personnel du nœud (par défaut : `~/.qorechaind`) |
| `--overwrite` | bool   | Écrase les fichiers genesis et de configuration existants    |

Crée la structure de répertoires sous `--home` avec `config/`, `data/` et un `genesis.json` initial.

---

## start

Démarre le nœud et commence la synchronisation ou la production de blocs.

```bash
qorechaind start [flags]
```

| Indicateur                   | Type   | Description                                          |
| ---------------------- | ------ | ---------------------------------------------------- |
| `--home`               | string | Répertoire personnel du nœud                                  |
| `--minimum-gas-prices` | string | Prix de gas minimaux à accepter (par ex. `0.001uqor`)     |
| `--pruning`            | string | Stratégie d'élagage : `default`, `nothing`, `everything` |
| `--halt-height`        | uint   | Arrête le nœud à cette hauteur de bloc                   |
| `--halt-time`          | uint   | Arrête le nœud à cet horodatage Unix                 |
| `--log_level`          | string | Verbosité des journaux : `info`, `debug`, `warn`, `error`      |
| `--trace`              | bool   | Active la trace de pile complète en cas d'erreur                    |

---

## version

Affiche la version du binaire `qorechaind` et les informations de build.

```bash
qorechaind version
```

Utilisez `--long` pour des détails de build étendus, y compris la version de Go, le hachage de commit et les tags de build :

```bash
qorechaind version --long
```

---

## status

Interroge le nœud en cours d'exécution sur son statut actuel, notamment l'état de synchronisation, la dernière hauteur de bloc et les informations de consensus.

```bash
qorechaind status
```

| Indicateur     | Type   | Description                                     |
| -------- | ------ | ----------------------------------------------- |
| `--node` | string | Point d'accès RPC (par défaut : `tcp://localhost:26657`) |

Renvoie du JSON avec les sections `node_info`, `sync_info` et `validator_info`.

---

## config

Lit ou écrit des valeurs dans la configuration du nœud.

### Définir une valeur de configuration

```bash
qorechaind config set <key> <value>
```

### Lire une valeur de configuration

```bash
qorechaind config get <key>
```

Les clés de configuration courantes incluent `chain-id`, `keyring-backend`, `output` et `node`.

---

## keys

Gère le trousseau local pour signer les transactions.

### Ajouter une nouvelle clé

```bash
qorechaind keys add <name> [flags]
```

| Indicateur                   | Type   | Description                                     |
| ---------------------- | ------ | ----------------------------------------------- |
| `--keyring-backend`    | string | Backend : `os`, `file`, `test`                   |
| `--algo`               | string | Algorithme de clé : `secp256k1` (par défaut), `ed25519` |
| `--recover`            | bool   | Récupère la clé à partir d'un mnémonique                       |
| `--multisig`           | string | Liste de clés séparées par des virgules pour le multisig       |
| `--multisig-threshold` | uint   | Nombre minimal de signatures requis                     |

### Lister toutes les clés

```bash
qorechaind keys list --keyring-backend <backend>
```

### Afficher les détails d'une clé

```bash
qorechaind keys show <name> [flags]
```

| Indicateur        | Type   | Description                         |
| ----------- | ------ | ----------------------------------- |
| `--bech`    | string | Format de sortie : `acc`, `val`, `cons` |
| `--address` | bool   | Affiche uniquement l'adresse                   |
| `--pubkey`  | bool   | Affiche uniquement la clé publique                |

### Supprimer une clé

```bash
qorechaind keys delete <name> --keyring-backend <backend>
```

### Exporter une clé (chiffrée par armure)

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

| Indicateur                 | Type   | Description                       |
| -------------------- | ------ | --------------------------------- |
| `--vesting-amount`   | string | Montant du vesting                    |
| `--vesting-end-time` | int    | Heure de fin du vesting (horodatage Unix) |

### Créer une transaction genesis

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| Indicateur                    | Type   | Description             |
| ----------------------- | ------ | ----------------------- |
| `--chain-id`            | string | Identifiant de la chaîne        |
| `--moniker`             | string | Moniker du validateur       |
| `--commission-rate`     | string | Taux de commission initial |
| `--commission-max-rate` | string | Taux de commission maximal |

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

Affiche la clé publique de consensus au format JSON. Utilisée pour vérifier l'identité d'un validateur.

### Afficher l'ID du nœud

```bash
qorechaind comet show-node-id
```

Affiche l'identifiant de nœud P2P (encodé en hexadécimal). Utilisé pour la configuration des pairs persistants.

---

## export

Exporte l'état actuel de la chaîne sous forme de fichier genesis JSON. Utile pour les mises à niveau de chaîne ou les instantanés.

```bash
qorechaind export [flags]
```

| Indicateur                | Type   | Description                               |
| ------------------- | ------ | ----------------------------------------- |
| `--for-zero-height` | bool   | Prépare l'export pour un redémarrage à la hauteur 0 |
| `--height`          | int    | Exporte l'état à une hauteur de bloc spécifique   |
| `--home`            | string | Répertoire personnel du nœud                       |

---

## rollback

Annule l'état de la chaîne d'un bloc. Utile pour récupérer après une défaillance de consensus.

```bash
qorechaind rollback [flags]
```

| Indicateur     | Type   | Description                                        |
| -------- | ------ | -------------------------------------------------- |
| `--hard` | bool   | Supprime également le dernier bloc du magasin de blocs |
| `--home` | string | Répertoire personnel du nœud                                |

Cette commande annule à la fois l'état applicatif et l'état de consensus. À utiliser avec précaution, car elle est irréversible.
