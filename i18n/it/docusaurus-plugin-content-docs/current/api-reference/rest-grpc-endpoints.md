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
Queste interfacce sono disponibili sia sulla mainnet **`qorechain-vladi`** (attiva dal 7 giugno 2026; release del nodo **v3.2.3**) sia sulla testnet **`qorechain-diana`** (release del nodo **v3.2.4**). Gli URL di base riportati di seguito presuppongono un nodo in esecuzione locale. Gli endpoint pubblici ospitati sono `https://api.qore.host` / `https://api-testnet.qore.host` (REST) e `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC), elencati in [Reti](/appendix/networks#public-endpoints). **Non esiste alcun endpoint gRPC pubblico**: gli hostname `grpc.qore.host` e `grpc-testnet.qore.host` non esistono, quindi esegui un tuo nodo se ti serve gRPC.
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

Gli esempi seguenti usano l'host pubblico della mainnet; sostituiscilo con `https://api-testnet.qore.host` per la testnet. I valori negli esempi sono stati letti dalle reti live intorno al 20 ottobre 2026 (mainnet v3.2.3, testnet v3.2.4) e cambiano nel tempo; usali per la forma di una risposta. La testnet esegue la release più recente v3.2.4, quindi serve alcune route e campi che la mainnet non ha; sono contrassegnati qui sotto come **solo testnet** e sulla mainnet rispondono `501`.

## Modulo PQC {#pqc-module}

| Metodo | Endpoint                                 | Descrizione                                                                 |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | Registrazione della chiave post-quantistica di un account (`found`, tipo di chiave, algoritmo) |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | La finestra di autorizzazione dell'account sulla corsia EVM e ciò che ne resta |
| GET    | `/qorechain/pqc/v1/evm_delegation_consent/{address}` | Il consenso dell'account alla delega EIP-7702, la delega corrente e il nonce EVM (dalla v3.2.2) |
| GET    | `/qorechain/pqc/v1/protocol_features`    | **Solo testnet (v3.2.4).** Ogni funzionalità di protocollo che il binario conosce, con i flag `enabled`, `known` e `staged` |

Nota che il segmento del percorso è il singolare `account`. Non esiste alcuna route `/qorechain/pqc/v1/params` né `/stats` (usa `qorechaind query pqc params` e `stats` per questi).

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

`classical_key_source` indica da dove proviene `ecdsa_pubkey`: `stored` (la chiave fornita alla registrazione), `auth_account` (non è stato memorizzato nulla, quindi è la chiave pubblica on-chain dell'account stesso) oppure `none`. Sulla testnet (v3.2.4, **solo testnet**) il record contiene anche `"possession_proven": false`, che diventa `true` quando una chiave è stata registrata con una [prova di possesso](/developer-guide/post-quantum-signing#proof-of-possession) verificata; la mainnet non riporta ancora il campo.

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
  "remaining_value": "",
  "native_only": false,
  "allowed_targets": []
}
```

Questa route non fallisce mai per un indirizzo senza finestra; restituisce `found: false`. Dalla v3.2.0 la corsia EVM ammette una transazione solo da un account che abbia una chiave PQC registrata **e** una finestra aperta. `live` è `true` finché la finestra ammette almeno un'altra transazione all'altezza corrente. `remaining_blocks`, `remaining_txs` e `remaining_value` mostrano quale limite è più vicino all'esaurimento; i valori sono interi in `uqor` restituiti come stringhe. Dalla v3.2.3 una finestra può avere un ambito: `native_only` (solo trasferimenti semplici di QOR) e `allowed_targets` (solo i destinatari elencati). Vedi [Sviluppo EVM](/developer-guide/evm-development#evm-window) per come funziona la corsia EVM.

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

La delega EIP-7702 di un account ha effetto solo con il consenso post-quantistico dell'account stesso (`MsgAuthorizeEVMDelegation`). `found` e `live` indicano un consenso registrato e ancora utilizzabile per `delegate`; `current_delegate` è la delega che l'account ha impostato ora e `nonce` è il suo nonce EVM.

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

Una `StateAnchorView` contiene `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` e `compressed_state_proof`. Dalla v3.2.2 il messaggio firmato è il **messaggio di anchor v2**: il tag di dominio `qorechain-multilayer-anchor-v2`, poi chain id, layer id, altezza del layer, state root, hash del set di validatori, numero di transazioni e prova di stato compressa, ciascun campo a lunghezza variabile preceduto dalla propria lunghezza su 8 byte big-endian (il precedente messaggio v1 non aveva il chain id né i prefissi di lunghezza, quindi una firma era valida su ogni chain). Viene verificato rispetto alla chiave PQC registrata del creatore del layer. `qorechaind query rdk anchor-sign-bytes` stampa i byte per un batch di rollup. Un layer senza anchor restituisce HTTP `404` (`no anchor for layer ...`) da `anchor/{layer_id}` e un elenco vuoto (`{"anchors": []}`) da `anchors/{layer_id}`.

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
| GET    | `/qorechain/burn/v1/stranded_rewards` | Quota degli staker accantonata e non ancora rilasciata dalla governance |

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

La risposta reale elenca ogni fonte di burn (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`); l'esempio è ridotto. Gli importi sono in `uqor`. `failed_tx` è diverso da zero dall'upgrade v3.2.2, quando il burn delle transazioni fallite ha iniziato ad applicarsi alla commissione effettivamente addebitata. Dalla v3.2.3 i vecchi `records` per singolo burn vengono potati, quindi `records` è una finestra recente, non la cronologia completa; i totali in `stats` sono cumulativi.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "3807496785528", "released": "6693045921330", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` è ciò che resta da rilasciare, `released` è quanto la governance ha già spostato, e `snapshot_height` è l'altezza dell'upgrade v3.2.0 che ha registrato la riserva. I valori qui sopra sono quelli al momento della stesura: la governance ha rilasciato il primo importo (6.693.045,921330 QOR) il 19 ottobre 2026, e l'upgrade v3.2.3 ha ricalcolato la riserva rimanente alla propria altezza (3.807.496,785528 QOR). Un'ulteriore proposta di governance per rilasciare l'importo ricalcolato era ancora nel periodo di voto al momento della stesura, quindi leggi i valori live. Vedi [Tokenomics](/architecture/tokenomics).

## Modulo Abstract Account {#abstract-account-module}

Il servizio di query abstract-account è esposto via REST sotto `/qorechain/abstractaccount/v1/...` (a partire dalla versione di chain **v3.1.85**), incluso lo **schema dei permessi** usato per validare gli scope degli [authenticator](/developer-guide/account-abstraction#authenticators) senza hardcoding.

| Metodo | Endpoint                                              | Descrizione                                                         |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`                | Configurazione del modulo (feature-probe: `enabled`)                |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | Elenca gli abstract account                                         |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | Stato dell'abstract account per un indirizzo (`404` se assente)     |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs`, `lane_rules` |
| GET    | `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` | **Solo testnet (v3.2.4).** La sequenza che una chiave authenticator collegata deve firmare per prossima (`nonce`, `linked`) |

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

`expires_at: "0"` significa che la concessione non scade. Dalla v3.2.3 la governance può sostituire l'autorità di licenza che rilascia queste licenze (`MsgUpdateAuthority`); le concessioni già rilasciate restano in vigore.

## Modulo Light Node {#light-node-module}

| Metodo | Endpoint                                      | Descrizione                                                        |
| ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/lightnode/v1/params`              | Parametri di registrazione, heartbeat e ricompensa                 |
| GET    | `/qorechain/lightnode/v1/stats`               | `total_registered`, `total_active`, `total_rewards`, `last_reward_height` |
| GET    | `/qorechain/lightnode/v1/nodes`               | Elenca i light node registrati                                     |
| GET    | `/qorechain/lightnode/v1/node/{address}`      | Un nodo (`{"node": null, "found": false}` se non registrato)       |
| GET    | `/qorechain/lightnode/v1/rewards/{address}`   | Ricompense accumulate per un indirizzo operatore (`accumulated_rewards`) |
| GET    | `/qorechain/lightnode/v1/reward_pool`         | Contabilità del pool di ricompense (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `max_reward_per_month_per_node`, `initialized`) |

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

`reserved` è la parte del pool che viene trattenuta e può essere spostata solo da un voto di governance. I limiti per nodo sono in `uqor`: `max_reward_per_block_per_node` è il tetto per blocco e, dalla v3.2.3, `max_reward_per_month_per_node` (`2000000000` uqor = 2.000 QOR per 30 giorni) è il tetto mensile, proporzionato al tempo di blocco e all'uptime, così non dipende più da quanto velocemente arrivano i blocchi. Un tetto non è un importo promesso. L'esempio è la risposta live della mainnet al momento della stesura, dopo che la governance ha rilasciato la riserva precedente (proposta 8, 19 ottobre 2026). Sulla testnet (v3.2.4, **solo testnet**) la risposta contiene anche `monthly_cap_active`, `last_distribution_time` e `last_distribution_height`, e il limite di un nodo parte dalla sua stessa registrazione.

:::note La registrazione richiede una licenza
La chain rifiuta la registrazione di un light node senza una concessione di licenza `lightnode_operator` attiva (`holders/lightnode_operator` elenca le concessioni). Al momento della stesura `stats` riporta `"total_registered": "0"` sulla mainnet e un nodo registrato sulla testnet. Vedi [Light Node](/light-node/overview) per lo stato del programma.
:::

## Modulo RDK {#rdk-module}

Il servizio di query del Rollup Development Kit è esposto via REST sotto `/qorechain/rdk/v1/...` (a partire dalla versione di chain **v3.2.2**; nelle versioni v3.2.0 e v3.2.1 era solo gRPC).

| Metodo | Endpoint                                              | Descrizione                                          |
| ------ | ----------------------------------------------------- | ---------------------------------------------------- |
| GET    | `/qorechain/rdk/v1/params`                            | Parametri del modulo                                 |
| GET    | `/qorechain/rdk/v1/rollups`                           | Elenca i rollup                                      |
| GET    | `/qorechain/rdk/v1/rollup/{rollup_id}`                | Un rollup (`404` se sconosciuto)                     |
| GET    | `/qorechain/rdk/v1/latest_batch/{rollup_id}`          | L'ultimo batch di settlement del rollup              |
| GET    | `/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`   | Un batch di settlement                               |
| GET    | `/qorechain/rdk/v1/batches/{rollup_id}`               | I batch del rollup in ordine di indice (paginati)    |
| GET    | `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`     | Un record di blob di data availability               |

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

Al momento della stesura `rollups` è un elenco vuoto su entrambe le reti, quindi le route per singolo rollup rispondono `404` (ad esempio `{"code":5,"message":"rollup foo not found"}`). `default_challenge_window` è espresso in secondi (`604800`). Sulla testnet (v3.2.4, **solo testnet**) la finestra di contestazione ottimistica è misurata in tempo di blocco.

## Modulo Inflation {#inflation-module}

Le impostazioni di emissione e il loro avanzamento sono esposti via REST sotto `/qorechain/inflation/v1/...` (a partire dalla versione di chain **v3.2.2**). Non sono disponibili tramite un comando CLI.

| Metodo | Endpoint                              | Descrizione                                                                 |
| ------ | ------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/inflation/v1/params`      | Parametri di emissione: `emission_mode`, `fixed_epoch_emission`, `max_total_emission`, `epoch_length`, `enabled` |
| GET    | `/qorechain/inflation/v1/epoch_info`  | Avanzamento: `current_epoch`, `block_start`, `next_epoch_height`, `total_minted`, `max_total_emission`, `remaining_emission` |

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info
```

Sulla mainnet, `emission_mode` è `"fixed"`, `fixed_epoch_emission` è `"86000000000"` (86.000 QOR per epoca), `epoch_length` è `"43200"` blocchi e `max_total_emission` è `"590000000000000"` (590.000.000 QOR, il tetto cumulativo). Sono stati impostati dalla proposta di governance 10 (approvata il 19 ottobre 2026); la prima epoca che usa il nuovo importo fisso inizia al blocco 3.672.000, e `epoch_info` mostra l'epoca in corso e l'importo coniato finora. L'elenco `schedule` nella risposta appartiene alla modalità `schedule` originale; non descrive ciò che conia un'epoca in modalità fixed. Tutti gli importi sono in `uqor`. La testnet riporta valori propri, diversi. Solo sulla testnet (v3.2.4, **solo testnet**) esiste una terza modalità, `target_apy`, con un campo `target_apy_bps`, usata dal bonus del modulo staking-tiers; la mainnet non ha una tale modalità.

## Modulo Gas Abstraction {#gas-abstraction-module}

| Metodo | Endpoint                                              | Descrizione                                                                 |
| ------ | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/gasabstraction/v1/config`                 | Token di commissione accettati, premio, limite di conversione per blocco    |
| GET    | `/qorechain/gasabstraction/v1/conversion_rate?denom=` | Quanto vale in `uqor` un'unità di un token di commissione, e se è `usable`  |
| GET    | `/qorechain/gasabstraction/v1/float`                  | L'indirizzo, i saldi e l'utilizzo in questo blocco del float di conversione |

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

L'elenco dei token accettati contiene solo `uqor` nativo su entrambe le reti, quindi le commissioni si pagano in `uqor` e non avviene alcuna conversione. La governance aggiunge un token (con un pool, una liquidità minima e una deviazione massima tra il prezzo medio ponderato nel tempo e il prezzo spot); una commissione pagata in un tale token viene convertita tramite un float di QOR e rifornita tramite un pool AMM. `conversion_rate` senza `?denom=` risponde `500` (`denom is required`).

## Modulo Staking Tiers (solo testnet) {#stakingtier-module}

:::note Solo testnet
Il modulo staking-tiers fa parte della **v3.2.4**, che gira solo sulla testnet. Sulla mainnet queste route rispondono `501`, e un upgrade della mainnet alla v3.2.4 è finora solo proposto (proposta di governance 13, all'altezza 3.742.566).
:::

| Metodo | Endpoint                                  | Descrizione                                                        |
| ------ | ----------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/stakingtier/v1/params`        | Livelli di lock, importo minimo del lock, penale per lo sblocco anticipato |
| GET    | `/qorechain/stakingtier/v1/locks/{holder}` | I lock di un detentore, quanto matura ciascuno al momento e quanto si può riscuotere |
| GET    | `/qorechain/stakingtier/v1/pool`          | Il pool dei bonus: saldo, importo in sospeso, eccedenza e l'ultimo settlement |

`params` elenca le tre durate di lock (3, 6 e 12 mesi) con i loro parametri e `min_lock_amount` (`"10000000"` uqor, 10 QOR). I lock si creano con `tx stakingtier lock` (vedi [Comandi di transazione](/cli-reference/transaction-commands#stakingtier)).

## Moduli solo gRPC {#grpc-only-modules}

Questi moduli hanno un servizio `Query` gRPC ma **nessuna route REST**. I nomi dei servizi seguono il formato `qorechain.<module>.v1.Query`.

| Modulo        | Metodi di query gRPC (versione di chain v3.2.3)        |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

Usa `grpcurl` sul tuo nodo, oppure i [comandi di query della CLI](/cli-reference/query-commands). Le query `rdk` sono disponibili anche via REST (vedi [Modulo RDK](#rdk-module)); prima della v3.2.2 erano solo gRPC.

I moduli xQORE, BTC-restaking (Babylon) e FairBlock non hanno alcun servizio di query nella release corrente, né via REST né via gRPC. I moduli inflation e gas-abstraction, che prima della v3.2.2 non ne avevano, sono serviti via REST (vedi [Modulo Inflation](#inflation-module) e [Modulo Gas Abstraction](#gas-abstraction-module)).

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
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Upgrade in sospeso / applicati (`applied_plan/v3.2.3` restituisce `{"height":"3662051"}` sulla mainnet) |
| `/cosmos/circuit/v1/disable_list`                     | Tipi di messaggio disattivati a livello di rete |
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

`qorechain.pqc.v1.Query` ha tre metodi sulla mainnet, `Account`, `EVMWindow` e `EVMDelegationConsent`, e un quarto solo sulla testnet (v3.2.4), `ProtocolFeatures`. Non esiste alcun metodo `Params`.

## Autenticazione

Tutti gli endpoint REST e gRPC non richiedono autenticazione per impostazione predefinita. Per i deployment in produzione, posiziona un reverse proxy (ad es. Nginx o Caddy) davanti al nodo per gestire la terminazione TLS e il controllo degli accessi.
