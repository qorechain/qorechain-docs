---
slug: /api-reference/rest-grpc-endpoints
title: Puncte finale REST / gRPC
sidebar_label: Puncte finale REST / gRPC
sidebar_position: 1
---

# Puncte finale REST / gRPC

QoreChain expune trei interfețe principale pentru acces programatic:

| Interfață | Port implicit | Protocol  | Descriere                          |
| --------- | ------------- | --------- | ---------------------------------- |
| REST      | `1317`        | HTTP/1.1  | Gateway REST (server API Cosmos SDK) |
| gRPC      | `9090`        | HTTP/2    | Serviciu gRPC codificat Protobuf   |
| RPC       | `26657`       | HTTP + WS | RPC al QoreChain Consensus Engine  |

Toate punctele finale REST returnează JSON. Punctele finale gRPC folosesc Protocol Buffers și pot fi consumate cu orice client gRPC. Interfața RPC oferă interogări la nivel de consens și difuzarea tranzacțiilor.

:::note
Aceste interfețe sunt disponibile atât pe mainnet-ul **`qorechain-vladi`** (live din 29 iunie 2026), cât și pe testnet-ul **`qorechain-diana`**. URL-urile de bază de mai jos presupun un nod care rulează local. Punctele finale publice găzduite sunt `https://api.qore.host` / `https://api-testnet.qore.host` (REST) și `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC), listate în [Rețele](/appendix/networks#public-endpoints). **Nu există un punct final gRPC public**: numele de gazdă `grpc.qore.host` și `grpc-testnet.qore.host` nu există, așa că rulați propriul nod dacă aveți nevoie de gRPC.
:::

## URL-uri de bază

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Ce rute există {#which-routes-exist}

Modulele specifice QoreChain sunt expuse prin REST sub prefixul `/qorechain/<module>/v1/...`, iar rute REST au doar modulele enumerate mai jos. Celelalte module sunt accesibile **doar prin gRPC** (vezi [Module doar gRPC](#grpc-only-modules)). Rutele standard Cosmos SDK, EVM și CosmWasm sunt enumerate în [Rute standard](#standard-routes).

O rută care nu există răspunde cu HTTP `501` și `{"code":12,"message":"Not Implemented"}`. Asta înseamnă că ruta nu este servită, nu că interogarea a returnat un rezultat gol. Căile scurte fără prefixul `/qorechain/` (de exemplu `/bridge/v1/chains` sau `/pqc/v1/params`) **nu** sunt servite. O înregistrare necunoscută pe o rută care există returnează HTTP `404` cu `{"code":5,"message":"... not found"}`.

Exemplele de mai jos folosesc gazda publică de mainnet; înlocuiți-o cu `https://api-testnet.qore.host` pentru testnet.

## Modulul PQC {#pqc-module}

| Metodă | Punct final                              | Descriere                                                                   |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | Înregistrarea cheii post-cuantice pentru un cont (`found`, tip de cheie, algoritm) |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | Fereastra de autorizare a lanului EVM al contului și ce a rămas din ea      |

Rețineți că segmentul de cale este `account`, la singular. Nu există ruta `/qorechain/pqc/v1/params` sau `/stats`.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/account/qor1...
```

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": null,
    "key_type": "hybrid",
    "created_at_height": "209015",
    "migration_public_key": null,
    "migration_algorithm_id": 0
  }
}
```

Un cont fără cheie înregistrată returnează `{"found": false, "account": null}`. Folosiți `found` pentru a decide dacă un cont trebuie să înregistreze o cheie înainte de a putea trimite.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_window/qor1...
```

```json
{
  "found": false,
  "live": false,
  "opened_height": "0",
  "expiry_height": "0",
  "max_txs": "0",
  "used_txs": "0",
  "max_value": "",
  "used_value": "",
  "remaining_blocks": "0",
  "remaining_txs": "0",
  "remaining_value": ""
}
```

Această rută nu eșuează niciodată pentru o adresă fără fereastră; returnează `found: false`. Începând cu v3.2.0, lanul EVM admite o tranzacție doar de la un cont care are o cheie PQC înregistrată **și** o fereastră deschisă. `live` este `true` cât timp fereastra admite cel puțin încă o tranzacție la înălțimea curentă. `remaining_blocks`, `remaining_txs` și `remaining_value` arată care limită este cea mai aproape de epuizare; valorile sunt numere întregi `uqor` returnate ca șiruri de caractere. Vezi [Dezvoltare EVM](/developer-guide/evm-development) pentru modul în care funcționează lanul EVM.

## Modulul Bridge {#bridge-module}

Starea read-only a modulului bridge este expusă prin REST sub `/qorechain/bridge/v1/...` (servește JSON on-chain real începând cu versiunea de chain **v3.1.77**). `config`-ul bridge raportează de ex. `min_validators=10` și `attestation_threshold=7`.

| Metodă | Punct final                                 | Descriere                                             |
| ------ | ------------------------------------------- | ------------------------------------------------------ |
| GET    | `/qorechain/bridge/v1/config`               | Configurația curentă a modulului bridge                |
| GET    | `/qorechain/bridge/v1/chains`               | Listează toate chain-urile bridge înregistrate         |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`    | Detalii pentru un anumit chain conectat prin bridge    |
| GET    | `/qorechain/bridge/v1/validators`           | Listează validatorii bridge înregistrați               |
| GET    | `/qorechain/bridge/v1/validators/{address}` | Detalii pentru un anumit validator bridge              |
| GET    | `/qorechain/bridge/v1/operations`           | Listează operațiunile bridge                           |
| GET    | `/qorechain/bridge/v1/operations/{id}`      | Detalii pentru o anumită operațiune bridge             |

```bash
curl -s https://api.qore.host/qorechain/bridge/v1/config
```

```json
{
  "config": {
    "min_validators": 10,
    "attestation_threshold": 7,
    "challenge_period_secs": "86400",
    "large_transfer_threshold": "100000000000",
    "enabled": true
  }
}
```

`chains/{chain_id}` returnează o singură intrare, cum ar fi `{"chain": {"chain_id": "ethereum", "name": "Ethereum", "chain_type": "evm", "bridge_contract": "0x000…0", "status": "pending", "min_confirmations": 12, ...}}`.

:::caution Bridge-ul nu este încă live
Toate cele 37 de chain-uri bridge configurate raportează `"status": "pending"` pe ambele rețele, iar `validators` și `operations` sunt liste goale. Aceste rute arată configurația modulului; nu înseamnă că activele pot fi transferate prin bridge astăzi. Vezi [Arhitectura Bridge](/architecture/bridge-architecture).
:::

## Modulul Multilayer {#multilayer-module}

Serviciul complet de interogare al modulului multilayer este expus prin REST sub `/qorechain/multilayer/v1/...` (începând cu versiunea de chain **v3.1.80**), incluzând două **interogări de citire a ancorelor de stare**: `anchor/{layer_id}` returnează cea mai recentă ancoră de decontare pentru un layer, iar `anchors/{layer_id}` returnează istoricul ancorelor acestuia. Fiecare ancoră poartă o semnătură **ML-DSA-87 (Dilithium-5)** peste câmpurile sale canonice, astfel încât un client poate prelua o ancoră și o poate verifica independent — baza on-chain pentru [chitanțele de decontare](/rollups/settlement-receipts) ale Rollup Development Kit-ului.

| Metodă | Punct final                                     | Descriere                                          |
| ------ | ----------------------------------------------- | --------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`               | Parametrii curenți ai modulului Multilayer          |
| GET    | `/qorechain/multilayer/v1/layers`               | Listează toate layer-ele înregistrate               |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | Detalii pentru un anumit layer                      |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | Cea mai recentă ancoră de stare pentru un layer     |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | Istoricul ancorelor de stare pentru un layer        |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | Statistici de rutare a tranzacțiilor între layere   |

Un `StateAnchorView` conține `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` și `compressed_state_proof`. Mesajul canonic semnat este `layer_id || layer_height || state_root || validator_set_hash`, verificat față de cheia PQC înregistrată a creatorului layer-ului. Un layer fără ancoră returnează HTTP `404` (`no anchor for layer ...`) de la `anchor/{layer_id}` și o listă goală (`{"anchors": []}`) de la `anchors/{layer_id}`.

```bash
curl -s https://api.qore.host/qorechain/multilayer/v1/params
```

```json
{
  "params": {
    "max_sidechains": "10",
    "max_paychains": "50",
    "min_anchor_interval": "100",
    "max_anchor_interval": "1000",
    "default_challenge_period": "86400",
    "min_sidechain_stake": "1000000000",
    "min_paychain_stake": "100000000",
    "routing_enabled": true,
    "routing_confidence_threshold": "0.6",
    "cross_layer_fee_bundling": true
  }
}
```

La momentul scrierii, `layers` este o listă goală pe ambele rețele.

## Modulul Burn {#burn-module}

Starea read-only a modulului burn este expusă prin REST sub `/qorechain/burn/v1/...`. `params`-urile de burn includ de ex. `gas_burn_rate=0.30`.

| Metodă | Punct final                           | Descriere                                                      |
| ------ | ------------------------------------- | -------------------------------------------------------------- |
| GET    | `/qorechain/burn/v1/params`           | Parametrii curenți ai modulului Burn                           |
| GET    | `/qorechain/burn/v1/stats`            | Totalul cumulat ars, defalcat pe sursă                         |
| GET    | `/qorechain/burn/v1/records`          | Listează înregistrările recente de burn                        |
| GET    | `/qorechain/burn/v1/milestone`        | Progresul milestone-ului de burn (numărul cumulat de tranzacții) |
| GET    | `/qorechain/burn/v1/stranded_rewards` | Partea stakerilor pusă deoparte de upgrade-ul v3.2.0 și încă neeliberată |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31560093291491",
    "burns_by_source": {
      "gas_fee": "31560093291491",
      "failed_tx": "0",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3506945"
  }
}
```

Răspunsul real listează fiecare sursă de burn (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`); exemplul este redus. Sumele sunt în `uqor`.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "6693045921330", "released": "0", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` este ce a mai rămas de eliberat, `released` este cât a mutat deja guvernanța, iar `snapshot_height` este înălțimea upgrade-ului v3.2.0 care a înregistrat rezerva. Vezi [Tokenomics](/architecture/tokenomics).

## Modulul Abstract Account {#abstract-account-module}

Serviciul de interogare abstract-account este expus prin REST sub `/qorechain/abstractaccount/v1/...` (începând cu versiunea de chain **v3.1.85**), incluzând **schema de permisiuni** folosită pentru a valida scopurile [autentificatorilor](/developer-guide/account-abstraction#authenticators) fără hardcodare.

| Metodă | Punct final                                           | Descriere                                                             |
| ------ | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`                | Configurația modulului (feature-probe: `enabled`)                       |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | Listează conturile abstracte                                            |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | Starea contului abstract pentru o adresă (`404` dacă nu există)         |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs` |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note Dezactivat pe ambele rețele
`enabled` este `false` astăzi pe mainnet și pe testnet, deci funcții abstract-account precum cheltuirea din portofele conectate nu sunt disponibile. Folosiți `config.enabled` ca feature-probe înainte de a vă baza pe acest modul. Vezi [Abstractizarea contului](/developer-guide/account-abstraction).
:::

## Modulul AMM {#amm-module}

| Metodă | Punct final                                        | Descriere                                                |
| ------ | -------------------------------------------------- | -------------------------------------------------------- |
| GET    | `/qorechain/amm/v1/params`                         | Parametrii curenți AMM (taxe în puncte de bază, limite)  |
| GET    | `/qorechain/amm/v1/pools`                          | Listează pool-urile                                      |
| GET    | `/qorechain/amm/v1/pools/{pool_id}`                | Un pool (`404` dacă este necunoscut)                     |
| GET    | `/qorechain/amm/v1/pools/{pool_id}/lp/{address}`   | Soldul de tokeni LP al unei adrese într-un pool          |
| GET    | `/qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=` | Găsește pool-ul pentru o pereche de denominații (`404` dacă nu există) |
| GET    | `/qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=`   | Cotație: ieșirea pentru o intrare exactă       |
| GET    | `/qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | Cotație: intrarea necesară pentru o ieșire exactă |

```bash
curl -s https://api.qore.host/qorechain/amm/v1/params
```

```json
{
  "params": {
    "swap_fee_bps": 30,
    "protocol_fee_bps": 10,
    "min_liquidity": "1000",
    "max_pools_per_creator": 50,
    "lp_token_decimals": 6,
    "pool_creation_fee": "100000000",
    "max_swap_impact_bps": 500,
    "enabled": true
  }
}
```

La momentul scrierii nu există pool-uri pe nicio rețea (`{"pools": []}`), iar o cotație pentru un pool necunoscut returnează HTTP `400` cu `{"code":3,"message":"pool not found"}`.

## Modulul Licence {#licence-module}

| Metodă | Punct final                                           | Descriere                                                        |
| ------ | ----------------------------------------------------- | ---------------------------------------------------------------- |
| GET    | `/qorechain/license/v1/check/{grantee}/{feature_id}`  | Dacă `grantee` deține o acordare activă pentru funcționalitate (`404` dacă nu) |
| GET    | `/qorechain/license/v1/holders/{feature_id}`          | Toate acordările pentru o funcționalitate                        |
| GET    | `/qorechain/license/v1/list/{grantee}`                | Toate acordările deținute de o adresă                            |

O acordare (`LicenseView`) are `grantee`, `feature_id`, `expires_at`, `granted_at`, `granted_by`, `suspended` și `metadata`. `check` returnează și `active`. O interogare list sau holders fără rezultate returnează `{"licenses": []}`; `check` pentru o adresă fără acordare returnează HTTP `404` cu `{"code":5,"message":"no license for <grantee>/<feature_id>"}`.

```bash
curl -s https://api.qore.host/qorechain/license/v1/holders/lightnode_operator
```

```json
{ "licenses": [] }
```

## Modulul Light Node {#light-node-module}

| Metodă | Punct final                                   | Descriere                                                          |
| ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/lightnode/v1/params`              | Parametrii de înregistrare, heartbeat și recompense                |
| GET    | `/qorechain/lightnode/v1/stats`               | `total_registered`, `total_active`, `total_rewards`, `last_reward_height` |
| GET    | `/qorechain/lightnode/v1/nodes`               | Listează nodurile light înregistrate                               |
| GET    | `/qorechain/lightnode/v1/node/{address}`      | Un nod (`{"node": null, "found": false}` dacă nu este înregistrat) |
| GET    | `/qorechain/lightnode/v1/rewards/{address}`   | Recompensele acumulate pentru o adresă de operator (`accumulated_rewards`) |
| GET    | `/qorechain/lightnode/v1/reward_pool`         | Contabilitatea pool-ului de recompense (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `initialized`) |

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/params
```

```json
{
  "registration_fee": "1000000",
  "heartbeat_interval": "1000",
  "min_delegated_stake": "1000000000",
  "reward_share": "0.030000000000000000",
  "min_uptime_for_rewards": "0.800000000000000000",
  "max_light_nodes": "10000",
  "heartbeat_grace_period": "100"
}
```

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/reward_pool
```

```json
{
  "balance": "<uqor>",
  "reserved": "<uqor>",
  "outstanding": "0",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "0",
  "initialized": true
}
```

`reserved` este partea din pool care este ținută deoparte și poate fi mutată doar printr-un vot de guvernanță, iar `max_reward_per_block_per_node` (în `uqor`) este plafonul per nod și per bloc al sumei pe care o creditează chain-ul. Un plafon nu este o sumă promisă. `balance` și `reserved` sunt afișate aici ca substituenți.

:::note Înregistrarea nu este deschisă
`stats` raportează `"total_registered": "0"` iar `nodes` este gol pe ambele rețele, iar chain-ul refuză o înregistrare de nod light fără o acordare de licență `lightnode_operator`. Vezi [Noduri Light](/light-node/overview) pentru starea programului.
:::

## Module doar gRPC {#grpc-only-modules}

Aceste module au un serviciu gRPC `Query`, dar **nicio rută REST**. Numele serviciilor urmează forma `qorechain.<module>.v1.Query`.

| Modul         | Metode de interogare gRPC (versiunea de chain v3.2.0)  |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `rdk`         | `Params`, `Rollup`, `Rollups`, `Batch`, `LatestBatch`  |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

Folosiți `grpcurl` împotriva propriului nod sau [comenzile CLI de interogare](/cli-reference/query-commands). În special interogările `rdk` **nu** sunt disponibile prin REST pe mainnet (`/qorechain/rdk/v1/...` răspunde cu `501`), deci cititoarele de rollup bazate pe REST nu pot funcționa astăzi împotriva mainnet-ului.

Modulele xQORE, inflation, BTC-restaking (Babylon), FairBlock și gas-abstraction nu au deloc serviciu de interogare în versiunea mainnet curentă, nici prin REST, nici prin gRPC.

## Rute standard {#standard-routes}

Sunt servite și rutele REST standard Cosmos SDK, IBC, EVM și CosmWasm. Exemple verificate pe ambele rețele:

| Punct final                                           | Descriere                                     |
| ----------------------------------------------------- | --------------------------------------------- |
| `/cosmos/bank/v1beta1/supply`                         | Aprovizionarea totală                         |
| `/cosmos/bank/v1beta1/balances/{address}`             | Soldurile unui cont                           |
| `/cosmos/staking/v1beta1/validators`                  | Validatori                                    |
| `/cosmos/staking/v1beta1/params`                      | Parametrii de staking                         |
| `/cosmos/distribution/v1beta1/params`                 | Parametrii de distribuție                     |
| `/cosmos/gov/v1/params/voting`                        | Parametrii de guvernanță                      |
| `/cosmos/slashing/v1beta1/params`                     | Parametrii de slashing                        |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Upgrade-uri în așteptare / aplicate  |
| `/cosmos/base/node/v1beta1/config`                    | Prețul minim de gas al nodului (`0.1uqor` pe ambele rețele) |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`       | Ultimul bloc                                  |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | Căutare / consultare tranzacții / după bloc |
| `/cosmos/evm/vm/v1/params`                            | Parametrii modulului EVM                      |
| `/cosmos/evm/feemarket/v1/params`                     | Parametrii pieței de taxe EVM                 |
| `/cosmwasm/wasm/v1/codes/params`                      | Permisiunile de încărcare/instanțiere CosmWasm |
| `/ibc/apps/transfer/v1/params`                        | Parametrii transferului IBC                   |

Prefixul CosmWasm este `/cosmwasm/wasm/v1/...`; `/cosmos/wasm/v1/...` nu este servit.

## Reflecție gRPC

Un nod pe care îl rulați singur servește gRPC pe portul `9090`. Acolo unde reflecția serverului este activată, unelte precum `grpcurl` pot descoperi serviciile disponibile:

```bash
grpcurl -plaintext localhost:9090 list
```

Pentru a interoga un anumit serviciu:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` are două metode, `Account` și `EVMWindow`. Nu există metoda `Params`.

## Autentificare

Toate punctele finale REST și gRPC sunt neautentificate implicit. Pentru implementările de producție, plasați un reverse proxy (de ex. Nginx sau Caddy) în fața nodului pentru a gestiona terminarea TLS și controlul accesului.
