---
slug: /cli-reference/query-commands
title: Comenzi de interogare
sidebar_label: Comenzi de interogare
sidebar_position: 3
---

# Comenzi de interogare

Toate comenzile de interogare urmează tiparul:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
Interogările rulează pe nodul indicat de `--node`. Folosește un endpoint RPC mainnet **`qorechain-vladi`** pentru date live (de exemplu `--node https://rpc.qore.host:443`) sau un endpoint testnet **`qorechain-diana`** (`--node https://rpc-testnet.qore.host:443`) pentru testare. Valoarea implicită `tcp://localhost:26657` țintește un nod pe care îl rulezi tu însuți. Mainnet-ul rulează versiunea de nod v3.2.1, iar testnet-ul v3.2.2; testnet-ul poate servi câteva rute suplimentare pe care mainnet-ul încă nu le are, așa că o interogare care funcționează acolo poate returna `Not Implemented` pe mainnet.
:::

Flag-urile comune se aplică fiecărei subcomenzi `query`:

| Flag       | Tip    | Descriere                                        |
| ---------- | ------ | ------------------------------------------------- |
| `--node`   | string | Endpoint RPC (implicit: `tcp://localhost:26657`) |
| `--output` | string | Format de ieșire: `json` sau `text`               |
| `--height` | int    | Interoghează starea la o anumită înălțime de bloc |

Nu orice modul are o interogare CLI. Acolo unde lipsește o comandă, folosește endpoint-ul REST (`https://api.qore.host/...`); consultă [REST API](/api-reference/rest-grpc-endpoints).

---

## bank

```bash
qorechaind query bank balances <address>
qorechaind query bank total-supply
qorechaind query bank total-supply-of uqor
qorechaind query bank spendable-balances <address>
```

(Nu există `query bank total`.)

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

`--status` primește numele complet al enum-ului: `BOND_STATUS_BONDED`, `BOND_STATUS_UNBONDING` sau `BOND_STATUS_UNBONDED` (`--status bonded` este respins).

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

`--proposal-status` acceptă `deposit-period`, `voting-period`, `passed`, `rejected` sau `failed`. Alte filtre: `--voter`, `--depositor`.

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

- `algorithm` primește un nume de algoritm (`dilithium5`, `mlkem1024`) sau un ID numeric.
- `migration` primește un **ID de algoritm** (de exemplu `1`), nu o adresă, și raportează `No active migration` când nu rulează nicio migrare.
- `evm-window` arată dacă adresa are o fereastră de autorizare deschisă pe lane-ul EVM și câte blocuri, tranzacții și câtă valoare au rămas (`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`). REST: `GET /qorechain/pqc/v1/evm_window/{address}`.

---

## burn

Modulul burn nu are interogare CLI. Folosește REST:

```bash
curl -s https://api.qore.host/qorechain/burn/v1/params
curl -s https://api.qore.host/qorechain/burn/v1/stats
curl -s https://api.qore.host/qorechain/burn/v1/records
curl -s https://api.qore.host/qorechain/burn/v1/milestone
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

`stranded_rewards` raportează partea stakerilor care a fost depusă în modulul distribution fără să acopere vreo cerere, așa cum a fost înregistrată la upgrade-ul v3.2.0 (`reserved`, `released`, `snapshot_height`). Poate fi eliberată numai printr-un vot de guvernanță.

---

## mint și inflation

`qorechaind query mint params|inflation|annual-provisions` citește modulul mint standard, a cărui rată este `0` pe ambele rețele; **nu** raportează programul de emisie al protocolului. Nu există comanda `query inflation`.

---

## ai

```bash
qorechaind query ai config
qorechaind query ai stats
```

---

## reputation și qca

```bash
qorechaind query reputation params
qorechaind query qca config
```

Nu există interogări de reputație per validator sau de clasificare a pool-urilor.

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

`reward-pool` arată cum se împarte soldul de recompense al modulului în `reserved`, `outstanding`, `payable` și `distributable`.

---

## license

```bash
qorechaind query license check <grantee_address> <feature_id>
qorechaind query license holders <feature_id>
qorechaind query license list <grantee_address>
```

`check` returnează o eroare `NotFound` când beneficiarul nu deține nicio licență pentru funcționalitate.

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

`config` arată parametrii modulului (stake minim, rata de ardere la creare, fereastra de contestare, limitele DA). `suggest-profile <use_case>` nu interoghează chain-ul; doar afișează o trimitere către o metodă JSON-RPC pe care endpoint-urile publice nu o servesc, așa că alege un profil din [Profiluri presetate](/rollups/preset-profiles).

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

Modulul de conturi abstracte este în prezent oprit pe ambele rețele (`config.enabled` este `false`), deci aceste interogări nu returnează conturi.

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

`auth-keygen`, `auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>` și `auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>` construiesc offline semnături de autentificator. Seed-ul autentificatorului nu este niciodată un argument: este citit din `--seed-file <file>` (sau `-` pentru stdin), din variabila de mediu `QORE_AUTH_SEED` sau dintr-un prompt fără ecou, iar `auth-keygen` îl scrie într-un fișier nou `0600` (`--out`) în loc să îl afișeze.

---

## gasabstraction

Mainnet-ul nu servește încă interogări de abstractizare a gazului (`qorechaind query gasabstraction ...` afișează textul de ajutor, iar ruta REST returnează `Not Implemented`). Taxele se plătesc doar în `uqor`; consultă [Abstractizarea Gazului](/user-guide/gas-abstraction).

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

## Module fără CLI

`xqore`, `babylon` și `fairblock` nu au comenzi de tranzacție sau de interogare. Nu pot fi folosite în prezent din CLI sau printr-un API public.
