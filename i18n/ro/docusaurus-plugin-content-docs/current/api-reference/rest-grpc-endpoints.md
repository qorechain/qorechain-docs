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
Aceste interfețe sunt disponibile atât pe mainnet-ul **`qorechain-vladi`** (live din 7 iunie 2026; versiunea de nod **v3.2.3**), cât și pe testnet-ul **`qorechain-diana`** (versiunea de nod **v3.2.4**). URL-urile de bază de mai jos presupun un nod care rulează local. Punctele finale publice găzduite sunt `https://api.qore.host` / `https://api-testnet.qore.host` (REST) și `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC), listate în [Rețele](/appendix/networks#public-endpoints). **Nu există un punct final gRPC public**: numele de gazdă `grpc.qore.host` și `grpc-testnet.qore.host` nu există, așa că rulați propriul nod dacă aveți nevoie de gRPC.
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

Exemplele de mai jos folosesc gazda publică de mainnet; înlocuiți-o cu `https://api-testnet.qore.host` pentru testnet. Valorile din exemple au fost citite de pe rețelele live în jurul datei de 20 octombrie 2026 (mainnet v3.2.3, testnet v3.2.4) și se schimbă în timp; folosiți-le pentru forma unui răspuns. Testnet-ul rulează versiunea mai nouă v3.2.4, așa că servește câteva rute și câmpuri pe care mainnet-ul nu le are; ele sunt marcate mai jos **doar testnet** și răspund cu `501` pe mainnet.

## Modulul PQC {#pqc-module}

| Metodă | Punct final                              | Descriere                                                                   |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | Înregistrarea cheii post-cuantice pentru un cont (`found`, tip de cheie, algoritm) |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | Fereastra de autorizare a benzii EVM a contului și ce a rămas din ea        |
| GET    | `/qorechain/pqc/v1/evm_delegation_consent/{address}` | Consimțământul contului pentru delegarea EIP-7702, delegarea curentă și nonce-ul EVM (începând cu v3.2.2) |
| GET    | `/qorechain/pqc/v1/protocol_features`    | **Doar testnet (v3.2.4).** Fiecare funcționalitate de protocol pe care o cunoaște binarul, cu indicatorii `enabled`, `known` și `staged` |

Rețineți că segmentul de cale este `account`, la singular. Nu există ruta `/qorechain/pqc/v1/params` sau `/stats` (folosiți `qorechaind query pqc params` și `stats` pentru acestea).

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
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account"
  }
}
```

`classical_key_source` spune de unde provine `ecdsa_pubkey`: `stored` (cheia furnizată la înregistrare), `auth_account` (nu a fost stocat nimic, deci este cheia publică on-chain proprie a contului) sau `none`. Pe testnet (v3.2.4, **doar testnet**) înregistrarea poartă și `"possession_proven": false`, care devine `true` odată ce o cheie a fost înregistrată cu o [dovadă de posesie](/developer-guide/post-quantum-signing#proof-of-possession) verificată; mainnet-ul nu raportează încă acest câmp.

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
  "remaining_value": "",
  "native_only": false,
  "allowed_targets": []
}
```

Această rută nu eșuează niciodată pentru o adresă fără fereastră; returnează `found: false`. Începând cu v3.2.0, banda EVM admite o tranzacție doar de la un cont care are o cheie PQC înregistrată **și** o fereastră deschisă. `live` este `true` cât timp fereastra admite cel puțin încă o tranzacție la înălțimea curentă. `remaining_blocks`, `remaining_txs` și `remaining_value` arată care limită este cea mai aproape de epuizare; valorile sunt numere întregi `uqor` returnate ca șiruri de caractere. Începând cu v3.2.3, o fereastră poate purta un domeniu de aplicare: `native_only` (doar transferuri simple de QOR) și `allowed_targets` (doar destinatarii listați). Vezi [Dezvoltare EVM](/developer-guide/evm-development#evm-window) pentru modul în care funcționează banda EVM.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_delegation_consent/qor1...
```

```json
{
  "found": false,
  "live": false,
  "delegate": "",
  "granted_height": "0",
  "expiry_height": "0",
  "current_delegate": "",
  "nonce": "0"
}
```

O delegare EIP-7702 a unui cont intră în vigoare doar cu consimțământul post-cuantic propriu al contului (`MsgAuthorizeEVMDelegation`). `found` și `live` raportează un consimțământ înregistrat și încă utilizabil pentru `delegate`; `current_delegate` este delegarea pe care contul a setat-o acum, iar `nonce` este nonce-ul său EVM.

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

Un `StateAnchorView` conține `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` și `compressed_state_proof`. Începând cu v3.2.2, mesajul semnat este **mesajul de ancoră v2**: eticheta de domeniu `qorechain-multilayer-anchor-v2`, apoi id-ul chain-ului, id-ul layer-ului, înălțimea layer-ului, rădăcina stării, hash-ul setului de validatori, numărul de tranzacții și dovada de stare comprimată, fiecare câmp de lungime variabilă fiind prefixat cu lungimea sa pe 8 octeți big-endian (mesajul v1 anterior nu avea id de chain și nici prefixe de lungime, așa că o semnătură era validă pe orice chain). Este verificat față de cheia PQC înregistrată a creatorului layer-ului. `qorechaind query rdk anchor-sign-bytes` afișează octeții pentru un batch de rollup. Un layer fără ancoră returnează HTTP `404` (`no anchor for layer ...`) de la `anchor/{layer_id}` și o listă goală (`{"anchors": []}`) de la `anchors/{layer_id}`.

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
| GET    | `/qorechain/burn/v1/stranded_rewards` | Partea stakerilor pusă deoparte și încă neeliberată de guvernanță |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31574710367921",
    "burns_by_source": {
      "gas_fee": "31574710282421",
      "failed_tx": "85500",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3666968"
  }
}
```

Răspunsul real listează fiecare sursă de burn (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`); exemplul este redus. Sumele sunt în `uqor`. `failed_tx` este nenul de la upgrade-ul v3.2.2, când burn-ul tranzacțiilor eșuate a început să se aplice taxei efectiv percepute. Începând cu v3.2.3, vechile `records` per burn sunt șterse (pruned), așa că `records` este o fereastră recentă, nu istoricul complet; totalurile din `stats` sunt cumulate.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "3807496785528", "released": "6693045921330", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` este ce a mai rămas de eliberat, `released` este cât a mutat deja guvernanța, iar `snapshot_height` este înălțimea upgrade-ului v3.2.0 care a înregistrat rezerva. Valorile de mai sus sunt cele de la momentul scrierii: guvernanța a eliberat prima sumă (6.693.045,921330 QOR) la 19 octombrie 2026, iar upgrade-ul v3.2.3 a recalculat rezerva rămasă la înălțimea sa (3.807.496,785528 QOR). O altă propunere de guvernanță pentru eliberarea acestei sume recalculate se afla încă în perioada de vot la momentul scrierii, așa că citiți valorile live. Vezi [Tokenomics](/architecture/tokenomics).

## Modulul Abstract Account {#abstract-account-module}

Serviciul de interogare abstract-account este expus prin REST sub `/qorechain/abstractaccount/v1/...` (începând cu versiunea de chain **v3.1.85**), incluzând **schema de permisiuni** folosită pentru a valida scopurile [autentificatorilor](/developer-guide/account-abstraction#authenticators) fără hardcodare.

| Metodă | Punct final                                           | Descriere                                                             |
| ------ | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`                | Configurația modulului (feature-probe: `enabled`)                       |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | Listează conturile abstracte                                            |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | Starea contului abstract pentru o adresă (`404` dacă nu există)         |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs`, `lane_rules` |
| GET    | `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` | **Doar testnet (v3.2.4).** Secvența pe care o cheie de autentificator conectată trebuie să o semneze următoarea (`nonce`, `linked`) |

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
{
  "licenses": [
    {
      "grantee": "qor1...",
      "feature_id": "lightnode_operator",
      "expires_at": "0",
      "granted_at": "3536305",
      "granted_by": "qor1...",
      "suspended": false,
      "metadata": "",
      "active": true
    }
  ]
}
```

`expires_at: "0"` înseamnă că acordarea nu expiră. Începând cu v3.2.3, guvernanța poate înlocui autoritatea de licențiere care acordă aceste licențe (`MsgUpdateAuthority`); acordările deja făcute rămân în vigoare.

## Modulul Light Node {#light-node-module}

| Metodă | Punct final                                   | Descriere                                                          |
| ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/lightnode/v1/params`              | Parametrii de înregistrare, heartbeat și recompense                |
| GET    | `/qorechain/lightnode/v1/stats`               | `total_registered`, `total_active`, `total_rewards`, `last_reward_height` |
| GET    | `/qorechain/lightnode/v1/nodes`               | Listează nodurile light înregistrate                               |
| GET    | `/qorechain/lightnode/v1/node/{address}`      | Un nod (`{"node": null, "found": false}` dacă nu este înregistrat) |
| GET    | `/qorechain/lightnode/v1/rewards/{address}`   | Recompensele acumulate pentru o adresă de operator (`accumulated_rewards`) |
| GET    | `/qorechain/lightnode/v1/reward_pool`         | Contabilitatea pool-ului de recompense (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `max_reward_per_month_per_node`, `initialized`) |

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
  "balance": "487231800",
  "reserved": "487231800",
  "outstanding": "0",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "0",
  "initialized": true,
  "max_reward_per_month_per_node": "2000000000"
}
```

`reserved` este partea din pool care este ținută deoparte și poate fi mutată doar printr-un vot de guvernanță. Limitele per nod sunt în `uqor`: `max_reward_per_block_per_node` este plafonul per bloc și, începând cu v3.2.3, `max_reward_per_month_per_node` (`2000000000` uqor = 2.000 QOR pe 30 de zile) este plafonul lunar, calculat proporțional cu timpul de bloc și cu uptime-ul, astfel încât nu mai depinde de cât de repede vin blocurile. Un plafon nu este o sumă promisă. Exemplul este răspunsul live de pe mainnet la momentul scrierii, după ce guvernanța a eliberat rezerva anterioară (propunerea 8, 19 octombrie 2026). Pe testnet (v3.2.4, **doar testnet**) răspunsul are în plus `monthly_cap_active`, `last_distribution_time` și `last_distribution_height`, iar limita unui nod începe de la propria sa înregistrare.

:::note Înregistrarea necesită o licență
Chain-ul refuză o înregistrare de nod light fără o acordare activă a licenței `lightnode_operator` (`holders/lightnode_operator` listează acordările). La momentul scrierii, `stats` raportează `"total_registered": "0"` pe mainnet și un nod înregistrat pe testnet. Vezi [Noduri Light](/light-node/overview) pentru starea programului.
:::

## Modulul RDK {#rdk-module}

Serviciul de interogare al Rollup Development Kit este expus prin REST sub `/qorechain/rdk/v1/...` (începând cu versiunea de chain **v3.2.2**; pe v3.2.0 și v3.2.1 era doar gRPC).

| Metodă | Punct final                                           | Descriere                                            |
| ------ | ----------------------------------------------------- | ---------------------------------------------------- |
| GET    | `/qorechain/rdk/v1/params`                            | Parametrii modulului                                 |
| GET    | `/qorechain/rdk/v1/rollups`                           | Listează rollup-urile                                |
| GET    | `/qorechain/rdk/v1/rollup/{rollup_id}`                | Un rollup (`404` dacă este necunoscut)               |
| GET    | `/qorechain/rdk/v1/latest_batch/{rollup_id}`          | Ultimul batch de decontare al rollup-ului            |
| GET    | `/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`   | Un batch de decontare                                |
| GET    | `/qorechain/rdk/v1/batches/{rollup_id}`               | Batch-urile rollup-ului în ordinea indexului (paginat) |
| GET    | `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`     | O înregistrare de blob de disponibilitate a datelor  |

```bash
curl -s https://api.qore.host/qorechain/rdk/v1/params
```

```json
{
  "params": {
    "max_rollups": 100,
    "min_stake_for_rollup": "10000000000",
    "rollup_creation_burn_rate": "0.01",
    "default_challenge_window": "604800",
    "max_da_blob_size": "2097152",
    "blob_retention_blocks": "432000",
    "max_batches_per_block": 10
  }
}
```

La momentul scrierii, `rollups` este o listă goală pe ambele rețele, deci rutele per rollup răspund cu `404` (de exemplu `{"code":5,"message":"rollup foo not found"}`). `default_challenge_window` este exprimat în secunde (`604800`). Pe testnet (v3.2.4, **doar testnet**) fereastra de contestare optimistă este măsurată în timp de bloc.

## Modulul Inflation {#inflation-module}

Setările de emisie și progresul sunt expuse prin REST sub `/qorechain/inflation/v1/...` (începând cu versiunea de chain **v3.2.2**). Nu sunt disponibile printr-o comandă CLI.

| Metodă | Punct final                           | Descriere                                                                   |
| ------ | ------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/inflation/v1/params`      | Parametrii de emisie: `emission_mode`, `fixed_epoch_emission`, `max_total_emission`, `epoch_length`, `enabled` |
| GET    | `/qorechain/inflation/v1/epoch_info`  | Progres: `current_epoch`, `block_start`, `next_epoch_height`, `total_minted`, `max_total_emission`, `remaining_emission` |

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info
```

Pe mainnet, `emission_mode` este `"fixed"`, `fixed_epoch_emission` este `"86000000000"` (86.000 QOR pe epocă), `epoch_length` este `"43200"` blocuri, iar `max_total_emission` este `"590000000000000"` (590.000.000 QOR, plafonul cumulat). Acestea au fost stabilite prin propunerea de guvernanță 10 (aprobată la 19 octombrie 2026); prima epocă care folosește noua sumă fixă începe la blocul 3.672.000, iar `epoch_info` arată epoca în desfășurare și suma emisă până acum. Lista `schedule` din răspuns aparține modului inițial `schedule`; ea nu descrie ce emite o epocă în modul fixed. Toate sumele sunt în `uqor`. Testnet-ul raportează propriile valori, diferite. Doar pe testnet (v3.2.4, **doar testnet**) există un al treilea mod, `target_apy`, cu un câmp `target_apy_bps`, folosit de bonusul modulului staking-tiers; mainnet-ul nu are un astfel de mod.

## Modulul Gas Abstraction {#gas-abstraction-module}

| Metodă | Punct final                                           | Descriere                                                                   |
| ------ | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/gasabstraction/v1/config`                 | Tokenii de taxă acceptați, prima, plafonul de conversie per bloc            |
| GET    | `/qorechain/gasabstraction/v1/conversion_rate?denom=` | Cât valorează o unitate dintr-un token de taxă în `uqor` și dacă este `usable` |
| GET    | `/qorechain/gasabstraction/v1/float`                  | Adresa float-ului de conversie, soldurile sale și utilizarea din acest bloc |

```bash
curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
```

```json
{
  "config": {
    "enabled": true,
    "native_denom": "uqor",
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0", "price_source": "", "rate_expiry_height": "0",
        "pool_id": "0", "min_liquidity": "", "max_deviation_bps": 0 }
    ],
    "premium_bps": 300,
    "max_tip_multiplier": 3,
    "float_min": "0",
    "block_conversion_cap": "0"
  }
}
```

Lista acceptată conține doar `uqor` nativ pe ambele rețele, deci taxele se plătesc în `uqor` și nu are loc nicio conversie. Guvernanța adaugă un token (cu un pool, o lichiditate minimă și o deviație maximă între prețul mediat în timp și cel spot); o taxă plătită într-un astfel de token este convertită printr-un float de QOR și reumplută printr-un pool AMM. `conversion_rate` fără `?denom=` răspunde cu `500` (`denom is required`).

## Modulul Staking Tiers (doar testnet) {#stakingtier-module}

:::note Doar testnet
Modulul staking-tiers face parte din **v3.2.4**, care rulează doar pe testnet. Pe mainnet aceste rute răspund cu `501`, iar o actualizare a mainnet-ului la v3.2.4 este deocamdată doar propusă (propunerea de guvernanță 13, la înălțimea 3.742.566).
:::

| Metodă | Punct final                               | Descriere                                                          |
| ------ | ----------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/stakingtier/v1/params`        | Nivelurile de blocare, suma minimă de blocare, penalizarea pentru deblocare anticipată |
| GET    | `/qorechain/stakingtier/v1/locks/{holder}` | Blocările unui deținător, ce acumulează fiecare în prezent și ce poate fi revendicat |
| GET    | `/qorechain/stakingtier/v1/pool`          | Pool-ul de bonus: sold, sume restante, excedent și ultima decontare |

`params` listează cele trei durate de blocare (3, 6 și 12 luni) cu parametrii lor și `min_lock_amount` (`"10000000"` uqor, 10 QOR). Blocările se fac cu `tx stakingtier lock` (vezi [Comenzi de tranzacție](/cli-reference/transaction-commands#stakingtier)).

## Module doar gRPC {#grpc-only-modules}

Aceste module au un serviciu gRPC `Query`, dar **nicio rută REST**. Numele serviciilor urmează forma `qorechain.<module>.v1.Query`.

| Modul         | Metode de interogare gRPC (versiunea de chain v3.2.3)  |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

Folosiți `grpcurl` împotriva propriului nod sau [comenzile CLI de interogare](/cli-reference/query-commands). Interogările `rdk` sunt disponibile și prin REST (vezi [Modulul RDK](#rdk-module)); înainte de v3.2.2 erau doar gRPC.

Modulele xQORE, BTC-restaking (Babylon) și FairBlock nu au deloc serviciu de interogare în versiunea curentă, nici prin REST, nici prin gRPC. Modulele inflation și gas-abstraction, care nu aveau niciunul înainte de v3.2.2, sunt servite prin REST (vezi [Modulul Inflation](#inflation-module) și [Modulul Gas Abstraction](#gas-abstraction-module)).

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
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Upgrade-uri în așteptare / aplicate (`applied_plan/v3.2.3` returnează `{"height":"3662051"}` pe mainnet) |
| `/cosmos/circuit/v1/disable_list`                     | Tipurile de mesaje dezactivate la nivelul întregii rețele |
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

`qorechain.pqc.v1.Query` are trei metode pe mainnet, `Account`, `EVMWindow` și `EVMDelegationConsent`, și o a patra doar pe testnet (v3.2.4), `ProtocolFeatures`. Nu există metoda `Params`.

## Autentificare

Toate punctele finale REST și gRPC sunt neautentificate implicit. Pentru implementările de producție, plasați un reverse proxy (de ex. Nginx sau Caddy) în fața nodului pentru a gestiona terminarea TLS și controlul accesului.
