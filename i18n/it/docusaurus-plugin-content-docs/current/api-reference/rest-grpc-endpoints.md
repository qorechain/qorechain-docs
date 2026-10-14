---
slug: /api-reference/rest-grpc-endpoints
title: Endpoint REST / gRPC
sidebar_label: Endpoint REST / gRPC
sidebar_position: 1
---

# Endpoint REST / gRPC

QoreChain espone tre interfacce principali per l'accesso programmatico:

| Interfaccia | Porta predefinita | Protocollo | Descrizione                            |
| ----------- | ----------------- | ---------- | -------------------------------------- |
| REST        | `1317`            | HTTP/1.1   | Gateway REST (server API del Cosmos SDK) |
| gRPC        | `9090`            | HTTP/2     | Servizio gRPC codificato in Protobuf   |
| RPC         | `26657`           | HTTP + WS  | RPC del QoreChain Consensus Engine     |

Tutti gli endpoint REST restituiscono JSON. Gli endpoint gRPC utilizzano Protocol Buffers e possono essere consumati con qualsiasi client gRPC. L'interfaccia RPC fornisce query a livello di consenso e la trasmissione delle transazioni.

:::note
Queste interfacce sono disponibili sia sulla mainnet **`qorechain-vladi`** (attiva dal 29 giugno 2026) sia sulla testnet **`qorechain-diana`**. Gli URL di base riportati di seguito presuppongono un nodo in esecuzione locale. Gli endpoint pubblici ospitati sono `https://api.qore.host` / `https://api-testnet.qore.host` (REST) e `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC), elencati in [Reti](/appendix/networks#public-endpoints). **Non esiste alcun endpoint gRPC pubblico**: gli hostname `grpc.qore.host` e `grpc-testnet.qore.host` non esistono, quindi esegui un tuo nodo se ti serve gRPC.
:::

## URL di base

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Quali route esistono {#which-routes-exist}

I moduli specifici di QoreChain sono esposti via REST sotto il prefisso `/qorechain/<module>/v1/...`, e solo i moduli elencati di seguito hanno route REST. Gli altri moduli sono raggiungibili **solo via gRPC** (vedi [Moduli solo gRPC](#grpc-only-modules)). Le route standard di Cosmos SDK, EVM e CosmWasm sono elencate in [Route standard](#standard-routes).

Una route che non esiste risponde con HTTP `501` e `{"code":12,"message":"Not Implemented"}`. Significa che la route non è servita, non che la query abbia restituito un risultato vuoto. I percorsi abbreviati senza il prefisso `/qorechain/` (ad esempio `/bridge/v1/chains` o `/pqc/v1/params`) **non** sono serviti. Un record sconosciuto su una route che esiste restituisce HTTP `404` con `{"code":5,"message":"... not found"}`.

Gli esempi seguenti usano l'host pubblico della mainnet; sostituiscilo con `https://api-testnet.qore.host` per la testnet.

## Modulo PQC {#pqc-module}

| Metodo | Endpoint                                 | Descrizione                                                                 |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | Registrazione della chiave post-quantistica di un account (`found`, tipo di chiave, algoritmo) |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | La finestra di autorizzazione dell'account sulla corsia EVM e ciò che ne resta |

Nota che il segmento del percorso è il singolare `account`. Non esiste alcuna route `/qorechain/pqc/v1/params` né `/stats`.

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

Un account senza chiave registrata restituisce `{"found": false, "account": null}`. Usa `found` per decidere se un account debba registrare una chiave prima di poter inviare.

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

Questa route non fallisce mai per un indirizzo senza finestra; restituisce `found: false`. Dalla v3.2.0 la corsia EVM ammette una transazione solo da un account che abbia una chiave PQC registrata **e** una finestra aperta. `live` è `true` finché la finestra ammette almeno un'altra transazione all'altezza corrente. `remaining_blocks`, `remaining_txs` e `remaining_value` mostrano quale limite è più vicino all'esaurimento; i valori sono interi in `uqor` restituiti come stringhe. Vedi [Sviluppo EVM](/developer-guide/evm-development) per come funziona la corsia EVM.

## Modulo Bridge {#bridge-module}

Lo stato in sola lettura del modulo bridge è esposto via REST sotto `/qorechain/bridge/v1/...` (serve JSON on-chain reale a partire dalla versione di chain **v3.1.77**). La `config` del bridge riporta ad es. `min_validators=10` e `attestation_threshold=7`.

| Metodo | Endpoint                                    | Descrizione                              |
| ------ | ------------------------------------------- | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`               | Configurazione corrente del modulo bridge |
| GET    | `/qorechain/bridge/v1/chains`               | Elenca tutte le chain bridge registrate  |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`    | Dettagli di una specifica chain collegata |
| GET    | `/qorechain/bridge/v1/validators`           | Elenca i validatori bridge registrati    |
| GET    | `/qorechain/bridge/v1/validators/{address}` | Dettagli di uno specifico validatore bridge |
| GET    | `/qorechain/bridge/v1/operations`           | Elenca le operazioni bridge              |
| GET    | `/qorechain/bridge/v1/operations/{id}`      | Dettagli di una specifica operazione bridge |

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

`chains/{chain_id}` restituisce una voce come `{"chain": {"chain_id": "ethereum", "name": "Ethereum", "chain_type": "evm", "bridge_contract": "0x000…0", "status": "pending", "min_confirmations": 12, ...}}`.

:::caution Il bridge non è ancora attivo
Tutte le 37 chain bridge configurate riportano `"status": "pending"` su entrambe le reti, e `validators` e `operations` sono elenchi vuoti. Queste route mostrano la configurazione del modulo; non significano che oggi sia possibile fare il bridge di asset. Vedi [Architettura del bridge](/architecture/bridge-architecture).
:::

## Modulo Multilayer {#multilayer-module}

Il servizio di query completo del modulo multilayer è esposto via REST sotto `/qorechain/multilayer/v1/...` (a partire dalla versione di chain **v3.1.80**), incluse due **query di lettura degli state anchor**: `anchor/{layer_id}` restituisce l'anchor di settlement più recente per un layer, e `anchors/{layer_id}` restituisce la cronologia dei suoi anchor. Ogni anchor porta una firma **ML-DSA-87 (Dilithium-5)** sui suoi campi canonici, quindi un client può recuperare un anchor e verificarlo in modo indipendente — la base on-chain per le [ricevute di settlement](/rollups/settlement-receipts) del Rollup Development Kit.

| Metodo | Endpoint                                        | Descrizione                                                 |
| ------ | ----------------------------------------------- | ----------------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`               | Parametri correnti del modulo Multilayer                    |
| GET    | `/qorechain/multilayer/v1/layers`               | Elenca tutti i layer registrati                             |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | Dettagli di un layer specifico                              |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | State anchor più recente per un layer                       |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | Cronologia degli state anchor per un layer                  |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | Statistiche di instradamento delle transazioni tra i layer  |

Una `StateAnchorView` contiene `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` e `compressed_state_proof`. Il messaggio canonico firmato è `layer_id || layer_height || state_root || validator_set_hash`, verificato rispetto alla chiave PQC registrata del creatore del layer. Un layer senza anchor restituisce HTTP `404` (`no anchor for layer ...`) da `anchor/{layer_id}` e un elenco vuoto (`{"anchors": []}`) da `anchors/{layer_id}`.

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

Al momento della stesura, `layers` è un elenco vuoto su entrambe le reti.

## Modulo Burn {#burn-module}

Lo stato in sola lettura del modulo burn è esposto via REST sotto `/qorechain/burn/v1/...`. I `params` di burn includono ad es. `gas_burn_rate=0.30`.

| Metodo | Endpoint                              | Descrizione                                                    |
| ------ | ------------------------------------- | -------------------------------------------------------------- |
| GET    | `/qorechain/burn/v1/params`           | Parametri correnti del modulo Burn                             |
| GET    | `/qorechain/burn/v1/stats`            | Totale cumulativo bruciato, suddiviso per fonte                |
| GET    | `/qorechain/burn/v1/records`          | Elenca i record di burn recenti                                |
| GET    | `/qorechain/burn/v1/milestone`        | Avanzamento della milestone di burn (numero cumulativo di transazioni) |
| GET    | `/qorechain/burn/v1/stranded_rewards` | Quota degli staker accantonata dall'upgrade v3.2.0 e non ancora rilasciata |

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

La risposta reale elenca ogni fonte di burn (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`); l'esempio è ridotto. Gli importi sono in `uqor`.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "6693045921330", "released": "0", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` è ciò che resta da rilasciare, `released` è quanto la governance ha già spostato, e `snapshot_height` è l'altezza dell'upgrade v3.2.0 che ha registrato la riserva. Vedi [Tokenomics](/architecture/tokenomics).

## Modulo Abstract Account {#abstract-account-module}

Il servizio di query abstract-account è esposto via REST sotto `/qorechain/abstractaccount/v1/...` (a partire dalla versione di chain **v3.1.85**), incluso lo **schema dei permessi** usato per validare gli scope degli [authenticator](/developer-guide/account-abstraction#authenticators) senza hardcoding.

| Metodo | Endpoint                                              | Descrizione                                                         |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`                | Configurazione del modulo (feature-probe: `enabled`)                |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | Elenca gli abstract account                                         |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | Stato dell'abstract account per un indirizzo (`404` se assente)     |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs` |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note Disabilitato su entrambe le reti
`enabled` è oggi `false` sia su mainnet sia su testnet, quindi le funzionalità di abstract account, come la spesa da wallet collegati, non sono disponibili. Usa `config.enabled` come feature-probe prima di fare affidamento su questo modulo. Vedi [Account Abstraction](/developer-guide/account-abstraction).
:::

## Modulo AMM {#amm-module}

| Metodo | Endpoint                                           | Descrizione                                              |
| ------ | -------------------------------------------------- | -------------------------------------------------------- |
| GET    | `/qorechain/amm/v1/params`                         | Parametri correnti dell'AMM (commissioni in punti base, limiti) |
| GET    | `/qorechain/amm/v1/pools`                          | Elenca i pool                                            |
| GET    | `/qorechain/amm/v1/pools/{pool_id}`                | Un pool (`404` se sconosciuto)                           |
| GET    | `/qorechain/amm/v1/pools/{pool_id}/lp/{address}`   | Saldo di token LP di un indirizzo in un pool             |
| GET    | `/qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=` | Trova il pool per una coppia di denom (`404` se assente) |
| GET    | `/qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=`   | Quotazione: output per un input esatto |
| GET    | `/qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | Quotazione: input necessario per un output esatto |

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

Al momento della stesura non esistono pool su nessuna delle due reti (`{"pools": []}`), e una quotazione per un pool sconosciuto restituisce HTTP `400` con `{"code":3,"message":"pool not found"}`.

## Modulo Licence {#licence-module}

| Metodo | Endpoint                                              | Descrizione                                                      |
| ------ | ----------------------------------------------------- | ---------------------------------------------------------------- |
| GET    | `/qorechain/license/v1/check/{grantee}/{feature_id}`  | Indica se `grantee` detiene una concessione attiva per la funzionalità (`404` se assente) |
| GET    | `/qorechain/license/v1/holders/{feature_id}`          | Tutte le concessioni per una funzionalità                        |
| GET    | `/qorechain/license/v1/list/{grantee}`                | Tutte le concessioni detenute da un indirizzo                    |

Una concessione (`LicenseView`) ha `grantee`, `feature_id`, `expires_at`, `granted_at`, `granted_by`, `suspended` e `metadata`. `check` restituisce anche `active`. Una query list o holders senza corrispondenze restituisce `{"licenses": []}`; `check` per un indirizzo senza concessione restituisce HTTP `404` con `{"code":5,"message":"no license for <grantee>/<feature_id>"}`.

```bash
curl -s https://api.qore.host/qorechain/license/v1/holders/lightnode_operator
```

```json
{ "licenses": [] }
```

## Modulo Light Node {#light-node-module}

| Metodo | Endpoint                                      | Descrizione                                                        |
| ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/lightnode/v1/params`              | Parametri di registrazione, heartbeat e ricompensa                 |
| GET    | `/qorechain/lightnode/v1/stats`               | `total_registered`, `total_active`, `total_rewards`, `last_reward_height` |
| GET    | `/qorechain/lightnode/v1/nodes`               | Elenca i light node registrati                                     |
| GET    | `/qorechain/lightnode/v1/node/{address}`      | Un nodo (`{"node": null, "found": false}` se non registrato)       |
| GET    | `/qorechain/lightnode/v1/rewards/{address}`   | Ricompense accumulate per un indirizzo operatore (`accumulated_rewards`) |
| GET    | `/qorechain/lightnode/v1/reward_pool`         | Contabilità del pool di ricompense (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `initialized`) |

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

`reserved` è la parte del pool che viene trattenuta e può essere spostata solo da un voto di governance, e `max_reward_per_block_per_node` (in `uqor`) è il tetto per nodo e per blocco di ciò che la chain accredita. Un tetto non è un importo promesso. `balance` e `reserved` sono mostrati qui come segnaposto.

:::note La registrazione non è aperta
`stats` riporta `"total_registered": "0"` e `nodes` è vuoto su entrambe le reti, e la chain rifiuta la registrazione di un light node senza una concessione di licenza `lightnode_operator`. Vedi [Light Node](/light-node/overview) per lo stato del programma.
:::

## Moduli solo gRPC {#grpc-only-modules}

Questi moduli hanno un servizio `Query` gRPC ma **nessuna route REST**. I nomi dei servizi seguono il formato `qorechain.<module>.v1.Query`.

| Modulo        | Metodi di query gRPC (versione di chain v3.2.0)        |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `rdk`         | `Params`, `Rollup`, `Rollups`, `Batch`, `LatestBatch`  |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

Usa `grpcurl` sul tuo nodo, oppure i [comandi di query della CLI](/cli-reference/query-commands). In particolare, le query `rdk` **non** sono disponibili via REST sulla mainnet (`/qorechain/rdk/v1/...` risponde `501`), quindi i lettori di rollup basati su REST oggi non possono funzionare con la mainnet.

I moduli xQORE, inflation, BTC-restaking (Babylon), FairBlock e gas-abstraction non hanno alcun servizio di query nella release mainnet corrente, né via REST né via gRPC.

## Route standard {#standard-routes}

Sono servite anche le route REST standard di Cosmos SDK, IBC, EVM e CosmWasm. Esempi verificati su entrambe le reti:

| Endpoint                                              | Descrizione                                   |
| ----------------------------------------------------- | --------------------------------------------- |
| `/cosmos/bank/v1beta1/supply`                         | Offerta totale                                |
| `/cosmos/bank/v1beta1/balances/{address}`             | Saldi di un account                           |
| `/cosmos/staking/v1beta1/validators`                  | Validatori                                    |
| `/cosmos/staking/v1beta1/params`                      | Parametri di staking                          |
| `/cosmos/distribution/v1beta1/params`                 | Parametri di distribuzione                    |
| `/cosmos/gov/v1/params/voting`                        | Parametri di governance                       |
| `/cosmos/slashing/v1beta1/params`                     | Parametri di slashing                         |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Upgrade in sospeso / applicati       |
| `/cosmos/base/node/v1beta1/config`                    | Prezzo minimo del gas del nodo (`0.1uqor` su entrambe le reti) |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`       | Ultimo blocco                                 |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | Ricerca / consultazione delle transazioni / per blocco |
| `/cosmos/evm/vm/v1/params`                            | Parametri del modulo EVM                      |
| `/cosmos/evm/feemarket/v1/params`                     | Parametri del fee market EVM                  |
| `/cosmwasm/wasm/v1/codes/params`                      | Permessi di upload/istanziazione CosmWasm     |
| `/ibc/apps/transfer/v1/params`                        | Parametri di trasferimento IBC                |

Il prefisso CosmWasm è `/cosmwasm/wasm/v1/...`; `/cosmos/wasm/v1/...` non è servito.

## Riflessione gRPC

Un nodo che esegui tu stesso serve gRPC sulla porta `9090`. Dove la riflessione del server è abilitata, strumenti come `grpcurl` possono scoprire i servizi disponibili:

```bash
grpcurl -plaintext localhost:9090 list
```

Per interrogare un servizio specifico:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` ha due metodi, `Account` e `EVMWindow`. Non esiste alcun metodo `Params`.

## Autenticazione

Tutti gli endpoint REST e gRPC non richiedono autenticazione per impostazione predefinita. Per i deployment in produzione, posiziona un reverse proxy (ad es. Nginx o Caddy) davanti al nodo per gestire la terminazione TLS e il controllo degli accessi.
