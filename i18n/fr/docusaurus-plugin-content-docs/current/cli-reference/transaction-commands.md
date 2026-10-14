---
slug: /cli-reference/transaction-commands
title: Commandes de transaction
sidebar_label: Commandes de transaction
sidebar_position: 2
---

# Commandes de transaction

Toutes les commandes de transaction suivent le modèle :

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Définissez `--chain-id qorechain-vladi` pour diffuser vers le mainnet en production, ou `--chain-id qorechain-diana` pour le testnet. Les deux réseaux exécutent la lignée v3.2 (version de nœud du mainnet **v3.2.1**, testnet **v3.2.2** ; consultez `latest.json` sous [download.qore.host](https://download.qore.host) pour la version actuelle). Si `--chain-id` est omis, le client utilise le `chain-id` de votre configuration cliente locale.
:::

Les drapeaux communs s'appliquent à chaque sous-commande `tx` :

| Drapeau             | Type   | Description                                                    |
| ------------------- | ------ | -------------------------------------------------------------- |
| `--from`            | string | Nom ou adresse de la clé de signature                          |
| `--chain-id`        | string | Identifiant de chaîne (par défaut : depuis la config cliente)  |
| `--fees`            | string | Frais de transaction, p. ex. `40000uqor`                       |
| `--gas-prices`      | string | Prix du gas à la place de `--fees`, p. ex. `0.1uqor`           |
| `--gas`             | string | Limite de gas, ou `auto` pour l'estimer (par défaut `200000`)  |
| `--gas-adjustment`  | float  | Multiplicateur appliqué à l'estimation `auto` (par défaut `1`) |
| `--keyring-backend` | string | `os`, `file`, `kwallet`, `pass`, `test` ou `memory`            |
| `--node`            | string | Point de terminaison RPC (par défaut `tcp://localhost:26657`)  |
| `--broadcast-mode`  | string | `sync` ou `async`                                              |
| `--generate-only`   | bool   | Afficher la transaction non signée au lieu de la signer        |
| `-y`                | bool   | Ignorer l'invite de confirmation                               |

---

## Frais et gas {#fees-and-gas}

Le plancher de frais du réseau est de **0,1 uqor par unité de gas** (`query feemarket params` affiche `min_gas_price` ; les frais de base en vigueur peuvent dépasser ce plancher en cas de charge, voir `query feemarket base-fee`). Une transaction est rejetée sauf si `fee >= gas limit x gas price`, de sorte que `--fees 500uqor` ne fonctionne que pour une limite de gas de 5 000 ou moins et échoue pour toute transaction réelle.

| Transaction                                          | `--gas` suggéré | `--fees` correspondant |
| ---------------------------------------------------- | --------------- | ---------------------- |
| Transfert, délégation, vote, réclamation signés en mode hybride | `400000`        | `40000uqor`            |
| Enregistrement de clé PQC                            | `600000`        | `60000uqor`            |
| `lightnode register`                                 | `300000`        | `30000uqor`            |

Une signature hybride ajoute environ 4,7 Ko à une transaction, facturés à 10 gas par octet ; le `--gas 200000` par défaut n'est donc pas toujours suffisant : les transferts signés en mode hybride sur le mainnet ont consommé entre environ 160 000 et 240 000 gas. Définissez toujours `--gas` explicitement avec `--fees` (ou `--gas-prices`).

---

## La signature hybride est obligatoire sur le lane Cosmos {#hybrid-signing}

`hybrid_signature_mode` vaut `required` sur les deux réseaux (`qorechaind query pqc hybrid-mode`). Chaque transaction du lane Cosmos doit porter une signature ML-DSA-87 (Dilithium-5) en plus de la signature secp256k1 ; un simple `tx bank send ... -y` est rejeté. Les seules exemptions sont l'enregistrement et la migration de clé PQC (afin qu'un nouveau compte puisse enregistrer sa première clé) et `tx slashing unjail` pour un compte qui n'a aucune clé PQC enregistrée.

Chaque commande de cette page, à l'exception de `pqc register-key`, `pqc register-key-v2` et `pqc migrate-key`, s'exécute donc en deux étapes : construire la transaction avec `--generate-only`, puis la signer et la diffuser avec `tx pqc cosign` :

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

Le nom de clé `mypqc` désigne une clé créée avec `tx pqc gen-key` et enregistrée sur le compte (voir [pqc](#pqc)). Utilisez pour cela le binaire de version officiel depuis [download.qore.host](https://download.qore.host) : un binaire compilé depuis l'arborescence source publique ne peut ni créer ni appliquer une signature Dilithium (`gen-key` et `cosign` indiquent qu'ils nécessitent la compilation complète). [QoreX](/qorex/overview) et les SDK effectuent cette même signature à votre place.

---

## bank

### send

Transférer des jetons d'un compte à un autre.

```bash
qorechaind tx bank send <from_key_or_address> <to_address> <amount> [flags]
```

Exemple : `qorechaind tx bank send mykey qor1recipient... 1000000uqor --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > tx.json`, puis `tx pqc cosign` comme indiqué ci-dessus. 1 QOR = 1 000 000 uqor.

---

## staking

### create-validator

Créer un validateur à partir d'un fichier JSON (la forme à base de drapeaux a été supprimée). Le mainnet exige en outre une licence `validator_operator` active et une clé PQC enregistrée ; voir [Exploiter un validateur](/developer-guide/running-a-validator).

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json
```

`validator.json` :

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

### edit-validator

Modifier la description ou la commission d'un validateur existant.

```bash
qorechaind tx staking edit-validator --new-moniker "new-name" --website "https://example.org" --from mykey [flags]
```

Drapeaux : `--new-moniker`, `--website`, `--identity`, `--security-contact`, `--details`, `--commission-rate`, `--min-self-delegation`. Les champs omis restent inchangés.

### delegate

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

### cancel-unbond

Annuler une entrée de unbonding en cours.

```bash
qorechaind tx staking cancel-unbond <validator_address> <amount> <creation_height> [flags]
```

---

## slashing

### unjail

Remettre un validateur emprisonné (jailed) dans l'ensemble actif une fois la période de jail écoulée.

```bash
qorechaind tx slashing unjail --from mykey [flags]
```

---

## distribution

### withdraw-all-rewards

Retirer toutes les récompenses de staking en attente.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Retirer les récompenses d'un validateur.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Drapeau        | Type | Description                                                         |
| -------------- | ---- | ------------------------------------------------------------------- |
| `--commission` | bool | Retirer également la commission (adresses d'opérateur de validateur) |

---

## gov

### submit-proposal

Soumettre une proposition de gouvernance à partir d'un fichier JSON contenant `messages`, `metadata`, `deposit`, `title`, `summary` et, en option, `expedited`. Générez un squelette avec `qorechaind tx gov draft-proposal`.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

### vote

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Options de vote : `yes`, `no`, `abstain`, `no_with_veto`. Utilisez `tx gov weighted-vote <proposal_id> yes=0.6,no=0.4` pour répartir un vote.

### deposit

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc {#pqc}

### gen-key

Générer une clé Dilithium-5 (ML-DSA-87) et la stocker sous `<home>/pqc/<name>.dilithium` (mode `0600`, **non chiffrée**). Affiche la clé publique en hexadécimal.

```bash
qorechaind tx pqc gen-key <name>
```

### register-key

Enregistrer une clé publique PQC pour votre compte (commande héritée : l'algorithme est Dilithium-5). Signée avec la seule clé classique ; c'est l'exemption de bootstrap.

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` vaut `hybrid` (recommandé), `pqc_only` ou `classical_only`. La clé publique de 2 592 octets rend l'enregistrement plus coûteux qu'un transfert, ce qui explique la limite de gas plus élevée.

### register-key-v2

Enregistrer une clé avec sélection explicite de l'algorithme.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` vaut `dilithium5` (ou `1`) ou `mlkem1024` (ou `2`).

### cosign

Signer une transaction non signée avec la clé PQC et la clé classique du compte, puis la diffuser.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> --from <key> --pqc-key <name> --chain-id <id>
```

| Drapeau        | Description                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `--pqc-key`    | Nom de la clé créée avec `gen-key` ou `recover-key`                                               |
| `--sign-bytes` | `auto` (par défaut : demande à la chaîne quelle forme de sign-bytes s'applique), `v1` ou `v2`    |
| `--generate-only` / `--offline` | Afficher la transaction signée en JSON au lieu de la diffuser ; la soumettre plus tard avec `tx broadcast` ; `--offline` exige aussi `--account-number`, `--sequence` et `--sign-bytes v1\|v2` |
| `--dry-run`    | Simuler et afficher l'estimation de gas                                                           |

Les deux réseaux ont appliqué la mise à niveau qui a fait passer la vérification hybride aux sign-bytes v2 ; la forme v1 est refusée.

### migrate-key

Migrer la clé PQC de votre compte d'un algorithme vers un autre. Une migration doit être active pour votre algorithme actuel (lancée par la gouvernance) ; les deux clés signent les octets de migration.

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> [flags]
```

### recover-key

Reconstruire la clé ML-DSA-87 du compte à partir de son mnémonique BIP-39 (lu depuis stdin) et la stocker localement. Utilise `SHAKE-256("qorechain:pqc:v1|address|mnemonic")`.

```bash
echo "<mnemonic>" | qorechaind tx pqc recover-key <name> <address> [flags]
```

| Drapeau        | Type   | Description                                                                |
| -------------- | ------ | -------------------------------------------------------------------------- |
| `--derivation` | string | `adapter` (canonique, par défaut) ou `bridge` (héritée `SHAKE-256(mnemonic)`)  |

### rotate-key

Faire pivoter la clé ML-DSA-87 du compte au sein du même algorithme. Lit le mnémonique depuis stdin, signe deux fois avec l'ancienne et la nouvelle clé, cosigne avec l'ancienne clé et diffuse.

```bash
echo "<mnemonic>" | qorechaind tx pqc rotate-key --from mykey --old-derivation bridge --new-derivation adapter \
  --gas 600000 --fees 60000uqor --chain-id qorechain-vladi
```

| Drapeau            | Type   | Description                                                                          |
| ------------------ | ------ | ------------------------------------------------------------------------------------ |
| `--old-derivation` | string | Dérivation de la clé actuellement enregistrée : `bridge` (par défaut) ou `adapter`   |
| `--new-derivation` | string | Dérivation de la nouvelle clé : `adapter` (par défaut) ou `bridge`                   |
| `--new-random`     | bool   | Pivoter vers une nouvelle clé aléatoire ; exige `--new-key-out`                      |
| `--new-key-out`    | string | Enregistrer la nouvelle clé privée sous `<home>/pqc/<name>.dilithium` avant tout envoi |
| `--sign-bytes`     | string | `auto` (par défaut), `v1` ou `v2`                                                    |

### open-evm-window

Le lane EVM n'admet une transaction que d'un compte qui détient une clé PQC enregistrée **et** dispose d'une fenêtre d'autorisation ouverte. Une fenêtre est ouverte par un message du lane Cosmos, qui porte donc la signature PQC qu'un portefeuille Ethereum ne peut pas fournir. À l'intérieur de la fenêtre, les transactions MetaMask ordinaires fonctionnent sans changement.

```bash
qorechaind tx pqc open-evm-window <blocks> <max-txs> <max-value> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

| Argument    | Limite               | Signification                                                                                 |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `blocks`    | 1 à 17 280           | Durée pendant laquelle la fenêtre reste ouverte, comptée à partir du bloc qui l'ouvre         |
| `max-txs`   | 1 à 1 000            | Nombre de transactions EVM qu'elle admet                                                      |
| `max-value` | positif              | Total admis, comprenant la valeur transférée **et** les frais maximaux que chaque transaction pourrait payer ; `uqor` ou `qor`, p. ex. `1000qor` |

Ouvrir une fenêtre remplace toute fenêtre existante. Vérifiez-la avec `qorechaind query pqc evm-window <address>`.

### close-evm-window

Fermer votre fenêtre immédiatement, par exemple si vous soupçonnez que la clé classique est compromise.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` vaut `sx` ou `ux`. L'enregistrement exige une licence `lightnode_operator` active, et l'enregistrement pour le programme de récompenses des light nodes **n'est pas encore ouvert**. Autres commandes : `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`. Voir [Light Node](/light-node/overview).

---

## bridge

Le bridge n'est pas en production : sur les deux réseaux, chaque chaîne configurée est au statut `pending` et aucun validateur de bridge n'est enregistré (`query bridge chains`, `query bridge validators`).

### withdraw

```bash
qorechaind tx bridge withdraw <destination_chain> <destination_address> <asset> <amount> [flags]
```

### deposit

Créditer des actifs transférés depuis une chaîne source. Porte des signatures de validateurs (`--validator-sigs`, `--pqc-commitment`) ; c'est un message d'opérateur de bridge, et non la manière dont un utilisateur final initie un dépôt.

```bash
qorechaind tx bridge deposit <source_chain> <source_tx_hash> <asset> <amount> [flags]
```

### update-chain-config / set-verifier-bootstrap

Administratif (licence `bridge_admin` ou `qcb_bridge`).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
```

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

Le premier `transfer` est la sous-commande et le second est le port source. Aucun canal IBC n'est ouvert sur l'un ou l'autre réseau au moment de la rédaction (`query ibc channel channels`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` vaut `defi`, `gaming`, `nft`, `enterprise` ou `custom` ; `stake_amount` est exprimé en uqor (le minimum actuel figure dans `query rdk config`). Le préréglage du profil fournit le règlement, le séquenceur, la DA et le modèle de gas ; seule la VM peut être remplacée en ligne de commande. Il n'existe aucune commande `finalize-batch`.

---

## multilayer

```bash
qorechaind tx multilayer register-sidechain <layer_id> <description> [--block-time-ms 2000] [--domains defi] [--max-tx 1000] [--min-validators 1] [--settlement-interval 100] [--vm-types evm] [flags]
qorechaind tx multilayer register-paychain <layer_id> <description> [--max-tx 5000] [--settlement-interval 50] [--base-fee-multiplier 0.01] [flags]
qorechaind tx multilayer anchor-state <layer_id> <layer_height> <state_root_hex> <pqc_agg_sig_hex> [flags]
qorechaind tx multilayer route-transaction <payload_hex> [--preferred-layer <id>] [--max-latency-ms 10000] [--max-fee 1000000] [flags]
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_height> <fraud_proof_hex> <reason> [flags]
qorechaind tx multilayer update-layer-status <layer_id> <new_status> <reason> [flags]
```

`new_status` vaut `proposed`, `active`, `suspended` ou `decommissioned`. `update-layer-status` est désactivée sur le mainnet par le disjoncteur (voir ci-dessous).

---

## Messages désactivés ou indisponibles aujourd'hui {#disabled-messages}

Certaines commandes existent dans le binaire mais ne peuvent pas aboutir sur les réseaux en production :

| Commande                                                  | Raison                                                                                         |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tx wasm store`, `tx wasm instantiate`, `instantiate2`    | L'autorisation de téléversement et d'instanciation est `Nobody` sur les deux réseaux, et les types de message figurent aussi sur la liste du disjoncteur |
| `tx crossvm call`                                         | Désactivée sur le mainnet par le disjoncteur                                                   |
| `tx svm deploy-program`, `execute`, `create-account`      | Le lane de transactions SVM est désactivé sur l'ensemble du réseau                             |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | Le module abstract-account est désactivé (`query abstractaccount config` affiche `enabled: false`) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | Messages réservés à l'autorité de gouvernance ; figurent aussi sur la liste du disjoncteur du mainnet |
| `tx license *`                                            | Réservé à l'autorité (les licences sont accordées par l'autorité de licences du réseau)        |

La liste en vigueur s'obtient avec `qorechaind query circuit disabled-list`.
