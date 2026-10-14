---
slug: /cli-reference/query-commands
title: Commandes de requête
sidebar_label: Commandes de requête
sidebar_position: 3
---

# Commandes de requête

Toutes les commandes de requête suivent le modèle :

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
Les requêtes s'exécutent sur le nœud vers lequel pointe `--node`. Utilisez un point d'accès RPC du mainnet **`qorechain-vladi`** pour des données en direct (par exemple `--node https://rpc.qore.host:443`), ou un point d'accès du testnet **`qorechain-diana`** (`--node https://rpc-testnet.qore.host:443`) pour les tests. La valeur par défaut `tcp://localhost:26657` cible un nœud que vous exécutez vous-même. Le mainnet exécute la version de nœud v3.2.1 et le testnet la v3.2.2 ; le testnet peut servir quelques routes supplémentaires que le mainnet n'a pas encore, de sorte qu'une requête qui fonctionne sur le testnet peut renvoyer `Not Implemented` sur le mainnet.
:::

Des indicateurs communs s'appliquent à chaque sous-commande `query` :

| Indicateur | Type   | Description                                                  |
| ---------- | ------ | ------------------------------------------------------------ |
| `--node`   | string | Point d'accès RPC (par défaut : `tcp://localhost:26657`)     |
| `--output` | string | Format de sortie : `json` ou `text`                          |
| `--height` | int    | Interroge l'état à une hauteur de bloc spécifique            |

Tous les modules n'ont pas de requête CLI. Lorsqu'une commande manque, utilisez le point d'accès REST (`https://api.qore.host/...`) ; voir [API REST](/api-reference/rest-grpc-endpoints).

---

## bank

```bash
qorechaind query bank balances <address>
qorechaind query bank total-supply
qorechaind query bank total-supply-of uqor
qorechaind query bank spendable-balances <address>
```

(Il n'existe pas de `query bank total`.)

---

## staking

```bash
qorechaind query staking validator <validator_address>
qorechaind query staking validators
qorechaind query staking validators --status BOND_STATUS_BONDED
qorechaind query staking delegation <delegator_address> <validator_address>
qorechaind query staking delegations <delegator_address>
qorechaind query staking delegations-to <validator_address>
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
qorechaind query staking unbonding-delegations <delegator_address>
qorechaind query staking redelegation <delegator_address> <src_validator> <dst_validator>
qorechaind query staking params
qorechaind query staking pool
```

`--status` prend le nom complet de l'énumération : `BOND_STATUS_BONDED`, `BOND_STATUS_UNBONDING` ou `BOND_STATUS_UNBONDED` (`--status bonded` est rejeté).

---

## distribution

```bash
qorechaind query distribution rewards <delegator_address>
qorechaind query distribution commission <validator_address>
qorechaind query distribution validator-outstanding-rewards <validator_address>
qorechaind query distribution community-pool
qorechaind query distribution params
```

---

## gov

```bash
qorechaind query gov proposals
qorechaind query gov proposals --proposal-status voting-period
qorechaind query gov proposal <proposal_id>
qorechaind query gov votes <proposal_id>
qorechaind query gov vote <proposal_id> <voter_address>
qorechaind query gov tally <proposal_id>
qorechaind query gov params
```

`--proposal-status` accepte `deposit-period`, `voting-period`, `passed`, `rejected` ou `failed`. Autres filtres : `--voter`, `--depositor`.

---

## tx

```bash
qorechaind query tx <txhash>
qorechaind query txs --query "message.sender='<address>'"
```

---

## pqc

```bash
qorechaind query pqc account <address>
qorechaind query pqc algorithms
qorechaind query pqc algorithm dilithium5
qorechaind query pqc stats
qorechaind query pqc params
qorechaind query pqc migration <algorithm_id>
qorechaind query pqc hybrid-mode
qorechaind query pqc evm-window <address>
```

- `algorithm` prend un nom d'algorithme (`dilithium5`, `mlkem1024`) ou un ID numérique.
- `migration` prend un **ID d'algorithme** (par exemple `1`), et non une adresse, et renvoie `No active migration` lorsqu'aucune n'est en cours.
- `evm-window` indique si l'adresse dispose d'une fenêtre d'autorisation ouverte sur la voie EVM et combien de blocs, de transactions et de valeur il reste (`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`). REST : `GET /qorechain/pqc/v1/evm_window/{address}`.

---

## burn

Le module burn n'a pas de requête CLI. Utilisez REST :

```bash
curl -s https://api.qore.host/qorechain/burn/v1/params
curl -s https://api.qore.host/qorechain/burn/v1/stats
curl -s https://api.qore.host/qorechain/burn/v1/records
curl -s https://api.qore.host/qorechain/burn/v1/milestone
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

`stranded_rewards` indique la part des stakers qui a été déposée dans le module de distribution sans adosser de réclamation, telle qu'enregistrée lors de la mise à niveau v3.2.0 (`reserved`, `released`, `snapshot_height`). Elle ne peut être libérée que par un vote de gouvernance.

---

## mint et inflation

`qorechaind query mint params|inflation|annual-provisions` lit le module mint standard, dont le taux est `0` sur les deux réseaux ; il ne rapporte **pas** le calendrier d'émission du protocole. Il n'existe pas de commande `query inflation`.

---

## ai

```bash
qorechaind query ai config
qorechaind query ai stats
```

---

## reputation et qca

```bash
qorechaind query reputation params
qorechaind query qca config
```

Il n'existe pas de requêtes de réputation par validateur ni de classification de pools.

---

## lightnode

```bash
qorechaind query lightnode params
qorechaind query lightnode stats
qorechaind query lightnode light-nodes
qorechaind query lightnode light-node <operator_address>
qorechaind query lightnode rewards <operator_address>
qorechaind query lightnode reward-pool
```

`reward-pool` indique comment le solde de récompenses du module se répartit en `reserved`, `outstanding`, `payable` et `distributable`.

---

## license

```bash
qorechaind query license check <grantee_address> <feature_id>
qorechaind query license holders <feature_id>
qorechaind query license list <grantee_address>
```

`check` renvoie une erreur `NotFound` lorsque le bénéficiaire ne détient aucune licence pour la fonctionnalité.

---

## bridge

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain <chain_id>
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation <operation_id>
```

---

## crossvm

```bash
qorechaind query crossvm message <message_id>
qorechaind query crossvm pending
qorechaind query crossvm params
```

---

## svm

```bash
qorechaind query svm account <base58_address>
qorechaind query svm program <base58_address>
qorechaind query svm params
qorechaind query svm slot
```

---

## multilayer

```bash
qorechaind query multilayer layer <layer_id>
qorechaind query multilayer layers
qorechaind query multilayer routing-stats
qorechaind query multilayer params
```

---

## rdk

```bash
qorechaind query rdk config
qorechaind query rdk rollup <rollup_id>
qorechaind query rdk list-rollups
qorechaind query rdk batch <rollup_id>            # latest batch
qorechaind query rdk batch <rollup_id> --index 42 # a specific batch
```

`config` affiche les paramètres du module (mise minimale, taux de burn à la création, fenêtre de contestation, limites DA). `suggest-profile <use_case>` n'interroge pas la chaîne ; il se contente d'afficher un pointeur vers une méthode JSON-RPC que les points d'accès publics ne servent pas, donc choisissez un profil dans [Profils prédéfinis](/rollups/preset-profiles).

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
```

---

## abstractaccount

Le module d'abstraction de compte est actuellement désactivé sur les deux réseaux (`config.enabled` vaut `false`), donc ces requêtes ne renvoient aucun compte.

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

`auth-keygen`, `auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>` et `auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>` construisent des signatures d'authentificateur hors ligne. La graine de l'authentificateur n'est jamais un argument : elle est lue depuis `--seed-file <file>` (ou `-` pour l'entrée standard), depuis la variable d'environnement `QORE_AUTH_SEED`, ou depuis une invite sans écho, et `auth-keygen` l'écrit dans un nouveau fichier `0600` (`--out`) au lieu de l'afficher.

---

## gasabstraction

Le mainnet ne sert pas encore de requêtes d'abstraction de gaz (`qorechaind query gasabstraction ...` affiche son texte d'aide et la route REST renvoie `Not Implemented`). Les frais se paient uniquement en `uqor` ; voir [Abstraction de gaz](/user-guide/gas-abstraction).

---

## circuit, feemarket, upgrade

```bash
qorechaind query circuit disabled-list        # message types switched off network-wide
qorechaind query feemarket params
qorechaind query feemarket base-fee
qorechaind query upgrade plan
qorechaind query upgrade applied <upgrade_name>
qorechaind query upgrade module-versions
```

---

## evm, erc20, wasm

```bash
qorechaind query evm params
qorechaind query evm balance-bank <0x_address> uqor
qorechaind query erc20 token-pairs
qorechaind query wasm params
qorechaind query wasm list-code
qorechaind query wasm list-contract-by-code <code_id>
qorechaind query wasm contract <contract_address>
qorechaind query wasm contract-state smart <contract_address> '<json_query>'
```

---

## Modules sans CLI

`xqore`, `babylon` et `fairblock` n'ont aucune commande de transaction ni de requête. Ils ne sont utilisables ni depuis la CLI ni via une API publique pour le moment.
