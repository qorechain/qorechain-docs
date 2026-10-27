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
Interogările rulează pe nodul indicat de `--node`. Folosește un endpoint RPC mainnet **`qorechain-vladi`** pentru date live (de exemplu `--node https://rpc.qore.host:443`) sau un endpoint testnet **`qorechain-diana`** (`--node https://rpc-testnet.qore.host:443`) pentru testare. Valoarea implicită `tcp://localhost:26657` țintește un nod pe care îl rulezi tu însuți. Mainnet-ul rulează versiunea de nod v3.2.4 din 23 octombrie 2026 (aplicată la înălțimea 3.742.566 prin propunerea de guvernanță 13); propunerea 14 de guvernanță a mainnet-ului ar aplica v3.2.5 la înălțimea 3.906.833; testnet-ul rulează v3.2.6 (v3.2.4 din 19 octombrie 2026, v3.2.5 din 26 octombrie, v3.2.6 din 27 octombrie). Versiunea v3.2.4 adaugă câteva rute și comenzi (marcate **v3.2.4** mai jos): ele funcționează pe ambele rețele, iar un nod aflat încă pe o versiune mai veche le răspunde cu `Not Implemented`. Versiunea v3.2.6 adaugă două comenzi (marcate **v3.2.6**, doar pe testnet până când mainnet-ul o aplică). Comenzile de pe această pagină au fost verificate pe binarul de release v3.2.3, rulat pe `https://rpc.qore.host:443`; rutele v3.2.4 au fost verificate prin REST pe 23 octombrie 2026, iar comenzile v3.2.6 pe sursa v3.2.6.
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
qorechaind query pqc evm-delegation-consent <address>
```

- `algorithm` primește un nume de algoritm (`dilithium5`, `mlkem1024`) sau un ID numeric.
- `migration` primește un **ID de algoritm** (de exemplu `1`), nu o adresă, și raportează `No active migration` când nu rulează nicio migrare.
- `account` raportează cheia înregistrată. Pe lângă cheie, `key_type` și `algorithm_name`, înregistrarea conține `classical_key_source` (`stored`, `auth_account` sau `none`: de unde provine cheia publică clasică). Începând cu v3.2.4 (mainnet din 23 octombrie 2026, testnet din 19 octombrie 2026) conține și `possession_proven`, care este `true` când cheia a fost înregistrată cu o dovadă de posesie verificată.
- `evm-window` arată dacă adresa are o fereastră de autorizare deschisă pe lane-ul EVM și câte blocuri, tranzacții și câtă valoare au rămas (`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`), plus domeniul ferestrei (`native_only`, `allowed_targets`; începând cu mainnet v3.2.3). REST: `GET /qorechain/pqc/v1/evm_window/{address}`.
- `evm-delegation-consent` arată consimțământul de delegare EIP-7702 al adresei (`found`, `live`, `delegate`, `granted_height`, `expiry_height`), delegarea sa curentă și nonce-ul EVM. REST: `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.
- `params` și `hybrid-mode` raportează `hybrid_signature_mode` (`2` = obligatoriu pe ambele rețele) și `allow_classical_fallback` (`false`).

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

`stranded_rewards` raportează partea stakerilor care a fost depusă în modulul distribution fără să acopere vreo cerere (`reserved`, `released`, `snapshot_height`). Poate fi eliberată numai printr-un vot de guvernanță. Rezerva a fost înregistrată prima dată la upgrade-ul v3.2.0 și recalculată la înălțimea upgrade-ului v3.2.3, așa că citește valorile live, nu o cifră citată în altă parte.

`stats` împarte arderea cumulată după sursă, inclusiv `failed_tx`, care este nenulă de la upgrade-ul v3.2.2.

---

## mint și inflation

`qorechaind query mint params|inflation|annual-provisions` citește modulul mint standard, a cărui rată este `0` pe ambele rețele; **nu** raportează programul de emisie al protocolului. Nu există comanda CLI `query inflation`. Setările de emisie proprii ale protocolului și progresul acesteia sunt servite prin REST începând cu v3.2.2:

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params       # emission_mode, fixed_epoch_emission, max_total_emission, epoch_length
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info   # current_epoch, next_epoch_height, total_minted, remaining_emission
```

Pe mainnet acestea raportează `emission_mode: "fixed"`, o emisie fixă de 86.000 QOR per epocă de 43.200 de blocuri și un plafon cumulat de 590.000.000 QOR (propunerea de guvernanță 10, adoptată pe 19 octombrie 2026; prima epocă cu noua sumă începe la blocul 3.672.000). Sumele sunt în `uqor`. Testnet-ul raportează propriile valori, diferite: a trecut la celălalt mod de emisie adăugat de v3.2.4 (`target_apy`) prin propria guvernanță (propunerea 14, adoptată pe 20 octombrie 2026). O rețea schimbă modul doar printr-un vot propriu de guvernanță, așa că mainnet-ul păstrează `fixed` până când un astfel de vot este adoptat (verificat pe 27 octombrie 2026).

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

`reward-pool` arată cum se împarte soldul de recompense al modulului în `reserved`, `outstanding`, `payable` și `distributable`, precum și limitele per nod: `max_reward_per_block_per_node` și, începând cu v3.2.3, `max_reward_per_month_per_node` (2.000 QOR, proporțional cu timpul de bloc și uptime-ul). Începând cu v3.2.4 (mainnet din 23 octombrie 2026, testnet din 19 octombrie 2026) raportează și `monthly_cap_active`, `last_distribution_time` și `last_distribution_height`.

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

```bash
qorechaind query rdk batches <rollup_id> [--start 0] [--limit 100]   # batches in index order
qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>
```

`config` arată parametrii modulului (stake minim, rata de ardere la creare, fereastra de contestare, limitele DA). `anchor-sign-bytes` afișează, în hex, octeții de semnare v2 ai ancorei pe care creatorul unui rollup îi semnează pentru `tx rdk submit-batch --anchor-signature`. Aceleași interogări sunt servite prin REST sub `/qorechain/rdk/v1/...` începând cu v3.2.2 (vezi [Endpoint-uri REST / gRPC](/api-reference/rest-grpc-endpoints#rdk-module)). `suggest-profile <use_case>` nu interoghează chain-ul; doar afișează o trimitere către o metodă JSON-RPC pe care endpoint-urile publice nu o servesc, așa că alege un profil din [Profiluri presetate](/rollups/preset-profiles).

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
qorechaind query rlconsensus applied-params   # v3.2.6 (testnet)
qorechaind query rlconsensus last-action      # v3.2.6 (testnet)
```

`agent-status` raportează modul, epoca și numărul de pași ai agentului; `policy` raportează epoca și numărul de ponderi ale politicii stocate (nu ponderile). **v3.2.6 (doar pe testnet până când mainnet-ul aplică acea versiune):** `applied-params` afișează valorile pe care agentul le consideră aplicate (timpul de bloc, pragul minim al prețului gazului, ponderile pool-urilor), iar `last-action` acțiunea propusă la ultimul său pas, care este înregistrată în orice mod, inclusiv în modul umbră, unde nu se aplică nimic. Toate acestea sunt servite și prin REST pe testnet (vezi [Modulul RL Consensus](/api-reference/rest-grpc-endpoints#rlconsensus-module)); față de un nod mainnet, cele două comenzi noi răspund `Not Implemented` până când mainnet-ul aplică acea versiune.

---

## abstractaccount

Modulul de conturi abstracte este oprit pe mainnet (`config.enabled` este `false`, deci aceste interogări nu returnează acolo conturi) și pornit pe testnet prin guvernanță (`config.enabled` este `true`; verificat pe 27 octombrie 2026).

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

`auth-keygen`, `auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>` și `auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>` construiesc offline semnături de autentificator. Seed-ul autentificatorului nu este niciodată un argument: este citit din `--seed-file <file>` (sau `-` pentru stdin), din variabila de mediu `QORE_AUTH_SEED` sau dintr-un prompt fără ecou, iar `auth-keygen` îl scrie într-un fișier nou `0600` (`--out`) în loc să îl afișeze.

---

## gasabstraction

Interogările de abstractizare a gazului sunt servite pe ambele rețele începând cu v3.2.2:

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate <denom>   # what one unit of a fee token is worth in uqor, and whether it can pay fees
qorechaind query gasabstraction float                     # the conversion float's balances and this block's usage
```

Lista tokenurilor acceptate conține doar `uqor` nativ pe ambele rețele, deci taxele se plătesc în `uqor` și nu are loc nicio conversie; guvernanța decide ce alte tokenuri sunt acceptate. REST: `/qorechain/gasabstraction/v1/config`, `/conversion_rate?denom=`, `/float`. Consultă [Abstractizarea Gazului](/user-guide/gas-abstraction).

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

La momentul redactării, nu există niciun pool pe niciuna dintre rețele. Pe testnet, cele trei tokenuri de test Fest sunt disponibile ca a doua denominație a unui pool (vezi [Tokenuri de test pe testnet](/api-reference/rest-grpc-endpoints#fest-tokens)).

---

## stakingtier (v3.2.4)

```bash
qorechaind query stakingtier params
qorechaind query stakingtier locks <holder_address>
qorechaind query stakingtier pool
```

Modulul de niveluri de staking face parte din versiunea **v3.2.4**: rulează pe testnet din 19 octombrie 2026 și pe mainnet din 23 octombrie 2026 (înălțimea 3.742.566, propunerea de guvernanță 13). Un nod aflat pe o versiune mai veche răspunde la aceste interogări cu `Not Implemented`. REST: `/qorechain/stakingtier/v1/params`, `/locks/{holder}`, `/pool`. Vezi [Comenzi de tranzacție](/cli-reference/transaction-commands#stakingtier).

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

`query upgrade applied <name>` este modul de a citi când a intrat în vigoare un upgrade: pe mainnet `v3.2.2` a fost aplicat la înălțimea 3.556.788 și `v3.2.3` la înălțimea 3.662.051 și `v3.2.4` la înălțimea 3.742.566; pe testnet `v3.2.2` la 6.905.034, `v3.2.3` la 8.003.746, `v3.2.4` la 8.337.253, `v3.2.5` la 8.890.800 și `v3.2.6` la 8.970.638 (`0` înseamnă neaplicat; pe mainnet `v3.2.5` este `0` la momentul redactării, propunerea de guvernanță 14 aflându-se în perioada de votare). Lista circuit-breaker a mainnet-ului (`disabled-list`) conține în prezent mesajele de creare a conturilor de vesting, store și instantiate QoreChain Native, pauza și reluarea pool-urilor AMM, apelul cross-VM, actualizarea stării unui strat multilayer, depreciarea și dezactivarea algoritmilor PQC și mesajele de guvernanță a consensului PRISM; cea a testnet-ului conține doar mesajul QoreChain Native `MsgStoreCode` (verificat pe 27 octombrie 2026; instanțierea a fost permisă prin guvernanța testnet-ului).

---

## evm, erc20, wasm

Comenzile `wasm` citesc QoreChain Native, numele pe care QoreChain îl dă runtime-ului său de contracte inteligente CosmWasm; numele comenzilor și ale modulului păstrează grafia `wasm`.

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

`query erc20 token-pairs` este gol pe mainnet; pe testnet listează cele trei tokenuri de test Fest (fUSD, fETH, fBTC) și un token IBC. Denominațiile lor bank sunt `erc20:` plus adresa contractului EIP-55 și sunt sensibile la majuscule; vezi [Tokenurile de test Fest de pe testnet](/developer-guide/evm-development#fest-tokens). Pe testnet, `query wasm params` arată `code_upload_access` `Nobody` și `instantiate_default_permission` `Everybody`; pe mainnet ambele sunt `Nobody` (vezi [Dezvoltare QoreChain Native](/developer-guide/cosmwasm-development)).

---

## Module fără CLI

`xqore`, `babylon` și `fairblock` nu au comenzi de tranzacție sau de interogare. Nu pot fi folosite în prezent din CLI sau printr-un API public.
