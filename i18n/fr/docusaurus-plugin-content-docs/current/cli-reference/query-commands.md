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
Les requêtes s'exécutent sur le nœud vers lequel pointe `--node`. Utilisez un point d'accès RPC du mainnet **`qorechain-vladi`** pour des données en direct (par exemple `--node https://rpc.qore.host:443`), ou un point d'accès du testnet **`qorechain-diana`** (`--node https://rpc-testnet.qore.host:443`) pour les tests. La valeur par défaut `tcp://localhost:26657` cible un nœud que vous exécutez vous-même. Le mainnet exécute la version de nœud v3.2.3 et le testnet la v3.2.4 ; le testnet sert quelques routes et commandes supplémentaires que le mainnet n'a pas (signalées **testnet uniquement** ci-dessous), de sorte qu'une requête qui fonctionne sur le testnet peut renvoyer `Not Implemented` sur le mainnet. Les commandes de cette page ont été vérifiées avec le binaire de la version v3.2.3, exécuté sur `https://rpc.qore.host:443`.
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
qorechaind query pqc evm-delegation-consent <address>
```

- `algorithm` prend un nom d'algorithme (`dilithium5`, `mlkem1024`) ou un ID numérique.
- `migration` prend un **ID d'algorithme** (par exemple `1`), et non une adresse, et renvoie `No active migration` lorsqu'aucune n'est en cours.
- `account` indique la clé enregistrée. Outre la clé, `key_type` et `algorithm_name`, l'enregistrement contient `classical_key_source` (`stored`, `auth_account` ou `none` : d'où provient la clé publique classique). Sur le testnet (v3.2.4, **testnet uniquement**), il contient aussi `possession_proven`, qui vaut `true` lorsque la clé a été enregistrée avec une preuve de possession vérifiée.
- `evm-window` indique si l'adresse dispose d'une fenêtre d'autorisation ouverte sur la voie EVM et combien de blocs, de transactions et de valeur il reste (`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`), ainsi que le périmètre de la fenêtre (`native_only`, `allowed_targets` ; depuis la v3.2.3 du mainnet). REST : `GET /qorechain/pqc/v1/evm_window/{address}`.
- `evm-delegation-consent` indique le consentement de délégation EIP-7702 de l'adresse (`found`, `live`, `delegate`, `granted_height`, `expiry_height`), sa délégation actuelle et son nonce EVM. REST : `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.
- `params` et `hybrid-mode` indiquent `hybrid_signature_mode` (`2` = requis sur les deux réseaux) et `allow_classical_fallback` (`false`).

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

`stranded_rewards` indique la part des stakers qui a été déposée dans le module de distribution sans adosser de réclamation (`reserved`, `released`, `snapshot_height`). Elle ne peut être libérée que par un vote de gouvernance. La réserve a été enregistrée pour la première fois lors de la mise à niveau v3.2.0 et recalculée à la hauteur de la mise à niveau v3.2.3 ; lisez donc les valeurs en direct plutôt qu'un chiffre cité ailleurs.

`stats` ventile le burn cumulé par source, y compris `failed_tx`, qui est non nul depuis la mise à niveau v3.2.2.

---

## mint et inflation

`qorechaind query mint params|inflation|annual-provisions` lit le module mint standard, dont le taux est `0` sur les deux réseaux ; il ne rapporte **pas** le calendrier d'émission du protocole. Il n'existe pas de commande CLI `query inflation`. Les paramètres d'émission propres au protocole et leur progression sont servis via REST depuis la v3.2.2 :

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params       # emission_mode, fixed_epoch_emission, max_total_emission, epoch_length
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info   # current_epoch, next_epoch_height, total_minted, remaining_emission
```

Sur le mainnet, ces routes indiquent `emission_mode: "fixed"`, une émission fixe de 86 000 QOR par époque de 43 200 blocs et un plafond cumulé de 590 000 000 QOR (proposition de gouvernance 10, adoptée le 19 octobre 2026 ; la première époque au nouveau montant commence au bloc 3 672 000). Les montants sont en `uqor`. Le testnet indique toujours ses propres valeurs, différentes ; la version v3.2.4 du testnet ajoute un autre mode d'émission que le mainnet n'a pas (**testnet uniquement**).

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

`reward-pool` indique comment le solde de récompenses du module se répartit en `reserved`, `outstanding`, `payable` et `distributable`, ainsi que les bornes par nœud : `max_reward_per_block_per_node` et, depuis la v3.2.3, `max_reward_per_month_per_node` (2 000 QOR, au prorata du temps de bloc et de la disponibilité). Sur le testnet (v3.2.4, **testnet uniquement**), il indique aussi `monthly_cap_active`, `last_distribution_time` et `last_distribution_height`.

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

```bash
qorechaind query rdk batches <rollup_id> [--start 0] [--limit 100]   # batches in index order
qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>
```

`config` affiche les paramètres du module (mise minimale, taux de burn à la création, fenêtre de contestation, limites DA). `anchor-sign-bytes` affiche, en hexadécimal, les octets de signature d'ancrage v2 que le créateur d'un rollup signe pour `tx rdk submit-batch --anchor-signature`. Les mêmes requêtes sont servies via REST sous `/qorechain/rdk/v1/...` depuis la v3.2.2 (voir [Points de terminaison REST / gRPC](/api-reference/rest-grpc-endpoints#rdk-module)). `suggest-profile <use_case>` n'interroge pas la chaîne ; il se contente d'afficher un pointeur vers une méthode JSON-RPC que les points d'accès publics ne servent pas, donc choisissez un profil dans [Profils prédéfinis](/rollups/preset-profiles).

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

Les requêtes d'abstraction de gaz sont servies sur les deux réseaux depuis la v3.2.2 :

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate <denom>   # what one unit of a fee token is worth in uqor, and whether it can pay fees
qorechaind query gasabstraction float                     # the conversion float's balances and this block's usage
```

La liste des tokens acceptés ne contient que l'`uqor` natif sur les deux réseaux : les frais se paient donc en `uqor` et aucune conversion n'a lieu ; la gouvernance décide quels autres tokens sont acceptés. REST : `/qorechain/gasabstraction/v1/config`, `/conversion_rate?denom=`, `/float`. Voir [Abstraction de gaz](/user-guide/gas-abstraction).

---

## amm

```bash
qorechaind query amm params
qorechaind query amm pools
qorechaind query amm pool <pool_id>
qorechaind query amm pool-by-denoms <denom_a> <denom_b>
qorechaind query amm lp-balance <pool_id> <address>
qorechaind query amm quote-exact-in <pool_id> <denom_in> <amount_in>
qorechaind query amm quote-exact-out <pool_id> <denom_out> <amount_out>
```

Aucun pool n'existe sur l'un ou l'autre réseau au moment de la rédaction.

---

## stakingtier (testnet uniquement)

```bash
qorechaind query stakingtier params
qorechaind query stakingtier locks <holder_address>
qorechaind query stakingtier pool
```

Le module de paliers de staking fait partie de la version **v3.2.4**, qui ne s'exécute que sur le testnet ; le mainnet n'a pas encore ce module (la proposition de gouvernance 13 appliquerait la v3.2.4 à la hauteur 3 742 566). REST : `/qorechain/stakingtier/v1/params`, `/locks/{holder}`, `/pool`. Voir [Commandes de transaction](/cli-reference/transaction-commands#stakingtier).

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

`query upgrade applied <name>` permet de lire quand une mise à niveau a pris effet : sur le mainnet, la `v3.2.2` a été appliquée à la hauteur 3 556 788 et la `v3.2.3` à la hauteur 3 662 051 ; sur le testnet, la `v3.2.2` à 6 905 034, la `v3.2.3` à 8 003 746 et la `v3.2.4` à 8 337 253 (`0` signifie non appliquée). La liste du coupe-circuit du mainnet (`disabled-list`) contient actuellement les messages de création de comptes de vesting, le stockage et l'instanciation CosmWasm, la pause et la reprise des pools AMM, l'appel cross-VM, la mise à jour du statut des couches multilayer, la dépréciation et la désactivation des algorithmes PQC, et les messages de gouvernance du consensus PRISM ; celle du testnet ne contient que les trois messages CosmWasm.

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
