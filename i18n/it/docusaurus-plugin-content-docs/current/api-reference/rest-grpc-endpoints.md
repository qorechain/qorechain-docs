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
Queste interfacce sono disponibili sia sulla mainnet **`qorechain-vladi`** (attiva dal 7 giugno 2026) sia sulla testnet **`qorechain-diana`**. Al momento della stesura (verificato il 27 ottobre 2026) la mainnet esegue la release del nodo **v3.2.4** (applicata all'altezza 3.742.566 il 23 ottobre 2026, proposta di governance 13), e la proposta di governance 14 della mainnet è nel periodo di voto; applicherebbe la v3.2.5 all'altezza 3.906.833. La testnet esegue la **v3.2.6**: ha applicato la v3.2.5 all'altezza 8.890.800 il 26 ottobre 2026 e la v3.2.6 all'altezza 8.970.638 il 27 ottobre 2026. Le route e i campi aggiunti da una release compaiono su una rete solo dopo che quella rete ha applicato la release; questa pagina indica ciò che è solo testnet. Gli URL di base riportati di seguito presuppongono un nodo in esecuzione locale. Gli endpoint pubblici ospitati sono `https://api.qore.host` / `https://api-testnet.qore.host` (REST) e `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC), elencati in [Reti](/appendix/networks#public-endpoints). **Non esiste alcun endpoint gRPC pubblico**: gli hostname `grpc.qore.host` e `grpc-testnet.qore.host` non esistono, quindi esegui un tuo nodo se ti serve gRPC.
:::

## URL di base

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Quali route esistono {#which-routes-exist}

I moduli specifici di QoreChain sono esposti via REST sotto il prefisso `/qorechain/<module>/v1/...`, e solo i moduli elencati di seguito hanno route REST. Gli altri moduli sono raggiungibili **solo via gRPC** (vedi [Moduli solo gRPC](#grpc-only-modules)). Le route standard di Cosmos SDK, EVM e QoreChain Native sono elencate in [Route standard](#standard-routes).

Una route che non esiste risponde con HTTP `501` e `{"code":12,"message":"Not Implemented"}`. Significa che la route non è servita, non che la query abbia restituito un risultato vuoto. I percorsi abbreviati senza il prefisso `/qorechain/` (ad esempio `/bridge/v1/chains` o `/pqc/v1/params`) **non** sono serviti. Un record sconosciuto su una route che esiste restituisce HTTP `404` con `{"code":5,"message":"... not found"}`.

Gli esempi seguenti usano l'host pubblico della mainnet; sostituiscilo con `https://api-testnet.qore.host` per la testnet. I valori negli esempi sono stati letti dalle reti live tra il 20 e il 27 ottobre 2026 e cambiano nel tempo; usali per la forma di una risposta. La release v3.2.4 ha aggiunto alcune route e campi. Sono contrassegnati qui sotto come **v3.2.4**: la testnet li serve dal 19 ottobre 2026 e la mainnet dal 23 ottobre 2026. La release v3.2.6 ne ha aggiunti altri, contrassegnati come **v3.2.6 (testnet)**: rispondono solo sulla testnet, e la mainnet risponde `501` finché non applica quella release. Un nodo ancora su una release precedente risponde `501` a una nuova route.

## Modulo PQC {#pqc-module}

| Metodo | Endpoint                                 | Descrizione                                                                 |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | Registrazione della chiave post-quantistica di un account (`found`, tipo di chiave, algoritmo) |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | La finestra di autorizzazione dell'account sulla corsia EVM e ciò che ne resta |
| GET    | `/qorechain/pqc/v1/evm_delegation_consent/{address}` | Il consenso dell'account alla delega EIP-7702, la delega corrente e il nonce EVM (dalla v3.2.2) |
| GET    | `/qorechain/pqc/v1/protocol_features`    | **v3.2.4** (testnet dal 19 ottobre 2026; mainnet dal 23 ottobre 2026; `501` su un nodo con una release precedente). Ogni funzionalità di protocollo che il binario conosce, con i flag `enabled`, `known` e `staged` |
| GET    | `/qorechain/pqc/v1/params`               | **v3.2.6 (testnet)**. I parametri del modulo; `501` sulla mainnet al momento della stesura |

Nota che il segmento del percorso è il singolare `account`. Non esiste alcuna route `/qorechain/pqc/v1/stats` (usa `qorechaind query pqc stats`). `/qorechain/pqc/v1/params` è servita dalla v3.2.6, quindi per ora solo sulla testnet; sulla mainnet usa `qorechaind query pqc params` su un nodo finché non applica quella release.

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

`classical_key_source` indica da dove proviene `ecdsa_pubkey`: `stored` (la chiave fornita alla registrazione), `auth_account` (non è stato memorizzato nulla, quindi è la chiave pubblica on-chain dell'account stesso) oppure `none`. Dalla v3.2.4 (sulla testnet dal 19 ottobre 2026; sulla mainnet dal 23 ottobre 2026) il record contiene anche `"possession_proven": false`, che diventa `true` quando una chiave è stata registrata con una [prova di possesso](/developer-guide/post-quantum-signing#proof-of-possession) verificata; un nodo con una release precedente non riporta il campo.

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

Al momento della stesura, `layers` è un elenco vuoto su entrambe le reti. L'esempio è la risposta della mainnet; sulla testnet `max_sidechains` è `64` (alzato dalla proposta di governance 16, approvata il 25 ottobre 2026, per l'evento dei builder).

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

La risposta reale elenca ogni fonte di burn (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty` e, dalla v3.2.4, `staking_tier_penalty`, la penale di sblocco anticipato di un lock di staking-tier, che viene bruciata); l'esempio è ridotto. Gli importi sono in `uqor`. `failed_tx` è diverso da zero dall'upgrade v3.2.2, quando il burn delle transazioni fallite ha iniziato ad applicarsi alla commissione effettivamente addebitata. Dalla v3.2.3 i vecchi `records` per singolo burn vengono potati, quindi `records` è una finestra recente, non la cronologia completa; i totali in `stats` sono cumulativi.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "0", "released": "10500542706858", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` è ciò che resta da rilasciare, `released` è quanto la governance ha già spostato, e `snapshot_height` è l'altezza dell'upgrade v3.2.0 che ha registrato la riserva. I valori qui sopra sono quelli letti il 23 ottobre 2026: la governance ha rilasciato il primo importo (6.693.045,921330 QOR) il 19 ottobre 2026, l'upgrade v3.2.3 ha ricalcolato la riserva rimanente alla propria altezza (3.807.496,785528 QOR) e la proposta di governance 12 ha rilasciato quell'importo (approvata, voto concluso il 21 ottobre 2026), quindi la riserva ora è vuota e `released` totalizza 10.500.542,706858 QOR. Leggi i valori live. Vedi [Tokenomics](/architecture/tokenomics).

## Modulo Abstract Account {#abstract-account-module}

Il servizio di query abstract-account è esposto via REST sotto `/qorechain/abstractaccount/v1/...` (a partire dalla versione di chain **v3.1.85**), incluso lo **schema dei permessi** usato per validare gli scope degli [authenticator](/developer-guide/account-abstraction#authenticators) senza hardcoding.

| Metodo | Endpoint                                              | Descrizione                                                         |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`                | Configurazione del modulo (feature-probe: `enabled`)                |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | Elenca gli abstract account                                         |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | Stato dell'abstract account per un indirizzo (`404` se assente)     |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs`, `lane_rules` |
| GET    | `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` | **v3.2.4** (testnet dal 19 ottobre 2026; mainnet dal 23 ottobre 2026; `501` su un nodo con una release precedente). La sequenza che una chiave authenticator collegata deve firmare per prossima (`nonce`, `linked`) |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note Disabilitato sulla mainnet, abilitato sulla testnet
L'esempio qui sopra è la risposta della mainnet: lì `enabled` è `false` (e `accounts` è un elenco vuoto), quindi le funzionalità di abstract account, come la spesa da wallet collegati, non sono disponibili sulla mainnet. Sulla testnet `enabled` è `true` dalla proposta di governance 18 (approvata il 27 ottobre 2026) e `accounts` elenca gli account creati finora (verificato il 27 ottobre 2026). Usa `config.enabled` come feature-probe prima di fare affidamento su questo modulo. Vedi [Account Abstraction](/developer-guide/account-abstraction).
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

Tutte e sette le route AMM rispondono su entrambe le reti (verificato il 27 ottobre 2026). Al momento della stesura non esistono pool su nessuna delle due reti (`{"pools": []}`). Risposte per input che non corrisponde a nulla: `pools/{pool_id}` con un id sconosciuto restituisce HTTP `404` (`{"code":5,"message":"pool 1 not found"}`); `pool_by_denoms` senza alcun pool per la coppia restituisce `404` (`no pool for uqor/foo`); una quotazione per un pool sconosciuto restituisce HTTP `400` con `{"code":3,"message":"pool not found"}`; `pools/{pool_id}/lp/{address}` restituisce `{"balance":"0"}` per un indirizzo senza posizione LP (l'indirizzo deve essere un indirizzo bech32 `qor1` valido, altrimenti `400`). Le due route di quotazione e `pool_by_denoms` leggono il loro input dalla query string, quindi richiedono parametri: senza `amount_in` / `amount_out` rispondono `400` (`invalid amount_in` / `invalid amount_out`).

Sulla testnet la seconda denominazione di cui un pool ha bisogno è disponibile dalla v3.2.6: tre token di test registrati dalla governance, vedi [Token di test della testnet (Fest)](#fest-tokens). Sulla mainnet non esiste un equivalente, perché la sua unica denominazione bank è `uqor`.

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
  "balance": "5645408555",
  "reserved": "5645276228",
  "outstanding": "130077",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "2250",
  "initialized": true,
  "max_reward_per_month_per_node": "2000000000",
  "monthly_cap_active": true,
  "last_distribution_time": "1792775155",
  "last_distribution_height": "3744000"
}
```

`reserved` è la parte del pool che viene trattenuta e può essere spostata solo da un voto di governance. I limiti per nodo sono in `uqor`: `max_reward_per_block_per_node` è il tetto per blocco e, dalla v3.2.3, `max_reward_per_month_per_node` (`2000000000` uqor = 2.000 QOR per 30 giorni) è il tetto mensile, proporzionato al tempo di blocco e all'uptime, così non dipende più da quanto velocemente arrivano i blocchi. Un tetto non è un importo promesso. L'esempio è la risposta live della mainnet letta il 23 ottobre 2026, dopo che la governance ha rilasciato la riserva precedente (proposta 8, 19 ottobre 2026). Dalla v3.2.4 (sulla testnet dal 19 ottobre 2026; sulla mainnet dal 23 ottobre 2026) la risposta contiene anche `monthly_cap_active`, `last_distribution_time` e `last_distribution_height`, e il limite di un nodo parte dalla sua stessa registrazione.

:::note La registrazione richiede una licenza
La chain rifiuta la registrazione di un light node senza una concessione di licenza `lightnode_operator` attiva (`holders/lightnode_operator` elenca le concessioni). Il 27 ottobre 2026 `stats` riporta `"total_registered": "1"` sia sulla mainnet sia sulla testnet. Vedi [Light Node](/light-node/overview) per lo stato del programma.
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

Al momento della stesura `rollups` è un elenco vuoto su entrambe le reti, quindi le route per singolo rollup rispondono `404` (ad esempio `{"code":5,"message":"rollup foo not found"}`). `default_challenge_window` è espresso in secondi (`604800`). Dalla v3.2.4 la finestra di contestazione ottimistica di un batch appena inviato è misurata in tempo di blocco: sulla testnet dall'altezza 8.337.253 (19 ottobre 2026), sulla mainnet dall'altezza 3.742.566 (23 ottobre 2026). Prima dell'upgrade la chain convertiva il valore in secondi in blocchi a 6 secondi fissi per blocco. Sulla testnet la proposta di governance 17 (approvata il 27 ottobre 2026) ha impostato `default_challenge_window` a `3600` (un'ora) e `max_rollups` a `200` per l'evento dei builder, quindi l'esempio qui sopra (mainnet) lì differisce dalla testnet; `rollups` è ancora vuoto sulla testnet al momento della stesura.

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

Sulla mainnet, `emission_mode` è `"fixed"`, `fixed_epoch_emission` è `"86000000000"` (86.000 QOR per epoca), `epoch_length` è `"43200"` blocchi e `max_total_emission` è `"590000000000000"` (590.000.000 QOR, il tetto cumulativo). Sono stati impostati dalla proposta di governance 10 (approvata il 19 ottobre 2026); la prima epoca che usa il nuovo importo fisso inizia al blocco 3.672.000, e `epoch_info` mostra l'epoca in corso e l'importo coniato finora. L'elenco `schedule` nella risposta appartiene alla modalità `schedule` originale; non descrive ciò che conia un'epoca in modalità fixed. Tutti gli importi sono in `uqor`. La testnet riporta valori propri, diversi. Dalla v3.2.4 esiste una terza modalità, `target_apy`, con un campo `target_apy_bps` (sulla testnet dal 19 ottobre 2026; sulla mainnet dal 23 ottobre 2026). Una rete passa a questa modalità solo con un proprio voto di governance, quindi la mainnet resta su `fixed` finché un tale voto non passa (verificato il 27 ottobre 2026: ancora `fixed`). La testnet è passata a `target_apy` con la propria governance (proposta 14, approvata il 20 ottobre 2026) e riporta `"emission_mode": "target_apy"` al momento della stesura, con `epoch_info` che mostra il tetto cumulativo già raggiunto (`remaining_emission` `0`).

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

## Modulo RL Consensus (v3.2.6, testnet) {#rlconsensus-module}

:::note Per ora solo testnet
Il gateway REST del modulo `rlconsensus` è arrivato con la **v3.2.6**, che la testnet `qorechain-diana` ha applicato all'altezza 8.970.638 il 27 ottobre 2026. Sulla mainnet ogni route qui sotto risponde HTTP `501` (`{"code":12,"message":"Not Implemented"}`) al momento della stesura (verificato il 27 ottobre 2026); lì il modulo è raggiungibile solo via gRPC. Tutte e sette le route rispondono sulla testnet e nessuna richiede un parametro.
:::

| Metodo | Endpoint                                  | Descrizione                                                              |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------ |
| GET    | `/qorechain/rlconsensus/v1/agent`         | Stato dell'agente: `mode`, `current_epoch`, `total_steps`, `last_observation_at`, `last_action_at`, `circuit_breaker_active`, `blocks_since_revert` |
| GET    | `/qorechain/rlconsensus/v1/params`        | Parametri del modulo: intervallo di osservazione, modalità dell'agente, limiti di step, finestra e soglia del circuit breaker, pesi della ricompensa, tempo di blocco predefinito, prezzo del gas e dimensione del set di validatori |
| GET    | `/qorechain/rlconsensus/v1/observation`   | L'ultimo vettore di osservazione (`height` e 25 `values`)                 |
| GET    | `/qorechain/rlconsensus/v1/reward`        | L'ultimo segnale di ricompensa e le sue componenti                       |
| GET    | `/qorechain/rlconsensus/v1/policy`        | La rete di policy memorizzata: `epoch`, `updated_at`, `weight_count` (i pesi stessi non vengono restituiti) |
| GET    | `/qorechain/rlconsensus/v1/applied_params` | I valori che l'agente considera applicati: `block_time_ms`, `gas_limit`, `gas_price_floor`, `pool_weight_rpos`, `pool_weight_dpos` |
| GET    | `/qorechain/rlconsensus/v1/last_action`   | L'azione proposta dall'agente al suo ultimo step: `height`, `mode`, cinque `values` e `applied` |

```bash
curl -s https://api-testnet.qore.host/qorechain/rlconsensus/v1/agent
curl -s https://api-testnet.qore.host/qorechain/rlconsensus/v1/last_action
```

```json
{ "mode": "shadow", "current_epoch": "1", "total_steps": "209", "last_observation_at": "8975660",
  "last_action_at": "8975660", "circuit_breaker_active": false, "blocks_since_revert": "0" }
```

```json
{ "height": "8975660", "mode": "shadow", "values": ["-0.334711810000000000", "-0.500000000000000000",
  "0.000000000000000000", "0.000000000000000000", "0.000000000000000000"], "applied": false }
```

L'agente compie uno step ogni `observation_interval` blocchi (10). In modalità `shadow` calcola un'azione e la registra senza applicare nulla, quindi `applied` è `false` e `applied_params` resta ai valori predefiniti (`block_time_ms` `5000`, `gas_price_floor` `100`, pesi del pool `0.40` e `0.35`). Sulla testnet l'agente è stato avviato in modalità shadow con una policy memorizzata dalla proposta di governance 29 (approvata il 27 ottobre 2026); `circuit_breaker_active` è `false`. Importi e valori sono stringhe. I valori applicati sono solo informativi in questa release: l'unico lettore on-chain è la [precompile `rlConsensusParams`](/developer-guide/evm-precompiles#network-status), in sola lettura. I metodi gRPC corrispondenti sono `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy`, `AppliedParams` e `LastAction` (servizio `qorechain.rlconsensus.v1.Query`), e i comandi CLI sono in [Comandi di query](/cli-reference/query-commands#rlconsensus).

## Modulo Staking Tiers (v3.2.4) {#stakingtier-module}

:::note Disponibile dalla v3.2.4
Il modulo staking-tiers fa parte della **v3.2.4**. Queste route sono servite dalla testnet dal 19 ottobre 2026 e dalla mainnet dal 23 ottobre 2026 (proposta di governance 13, altezza 3.742.566). Un nodo con una release precedente risponde `501`.
:::

| Metodo | Endpoint                                  | Descrizione                                                        |
| ------ | ----------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/stakingtier/v1/params`        | Livelli di lock, importo minimo del lock, penale per lo sblocco anticipato |
| GET    | `/qorechain/stakingtier/v1/locks/{holder}` | I lock di un detentore, quanto matura ciascuno al momento e quanto si può riscuotere |
| GET    | `/qorechain/stakingtier/v1/pool`          | Il pool dei bonus: saldo, importo in sospeso, eccedenza e l'ultimo settlement |

`params` elenca le tre durate di lock (3, 6 e 12 mesi) con i loro parametri e `min_lock_amount` (`"10000000"` uqor, 10 QOR). I lock si creano con `tx stakingtier lock` (vedi [Comandi di transazione](/cli-reference/transaction-commands#stakingtier)).

## Moduli solo gRPC {#grpc-only-modules}

Sulla mainnet (release del nodo v3.2.4, verificato il 27 ottobre 2026) questi moduli hanno un servizio `Query` gRPC ma **nessuna route REST**. I nomi dei servizi seguono il formato `qorechain.<module>.v1.Query`.

| Modulo        | Metodi di query gRPC (mainnet, versione di chain v3.2.4) |
| ------------- | ------------------------------------------------------ |
| `ai`          | `Config`, `Stats`                                      |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                 |
| `reputation`  | `Params`                                               |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `svm`         | `Slot`, `Account`, `Program`                           |
| `qca`         | `Config`                                               |

Le query `rlconsensus` sono servite via REST sulla testnet dalla v3.2.6 (con due metodi in più, `AppliedParams` e `LastAction`); vedi [Modulo RL Consensus](#rlconsensus-module). La mainnet risponde `501` finché non applica quella release. Usa `grpcurl` sul tuo nodo, oppure i [comandi di query della CLI](/cli-reference/query-commands). Le query `rdk` sono disponibili anche via REST (vedi [Modulo RDK](#rdk-module)); prima della v3.2.2 erano solo gRPC.

I moduli xQORE, BTC-restaking (Babylon) e FairBlock non hanno alcun servizio di query nella release corrente, né via REST né via gRPC. I moduli inflation e gas-abstraction, che prima della v3.2.2 non ne avevano, sono serviti via REST (vedi [Modulo Inflation](#inflation-module) e [Modulo Gas Abstraction](#gas-abstraction-module)).

## Route standard {#standard-routes}

Sono servite anche le route REST standard di Cosmos SDK, IBC, EVM e QoreChain Native. Esempi verificati su entrambe le reti:

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
| `/cosmwasm/wasm/v1/codes/params`                      | Permessi di upload/istanziazione QoreChain Native     |
| `/ibc/apps/transfer/v1/params`                        | Parametri di trasferimento IBC                |
| `/ibc/core/client/v2/counterparty_info/{client_id}`   | **v3.2.6 (testnet)**. La controparte IBC v2 registrata per un client (`404` se assente; `501` sulla mainnet) |
| `/ibc/core/client/v2/config/{client_id}`              | **v3.2.6 (testnet)**. La configurazione del client IBC v2 (`allowed_relayers`; `501` sulla mainnet) |
| `/cosmos/evm/erc20/v1/token_pairs`, `/token_pairs/{token}` | Coppie di token ERC20 (testnet: i tre token di test Fest e un token IBC; mainnet: nessuna) |

Il prefisso QoreChain Native è `/cosmwasm/wasm/v1/...`; `/cosmos/wasm/v1/...` non è servito.

### Route client IBC v2 (v3.2.6, testnet) {#ibc-v2-routes}

Il servizio di query dei client IBC v2 era servito prima via gRPC, ma le sue route REST mancavano; la v3.2.6 le monta. Un relayer legge da qui la controparte di un client. Entrambe le route prendono l'ID del client nel percorso (ad esempio `07-<type>-0`); senza di esso rispondono `501` su entrambe le reti. Verificato il 27 ottobre 2026:

| Route | Testnet (v3.2.6) | Mainnet (v3.2.4) |
| --- | --- | --- |
| `/ibc/core/client/v2/counterparty_info/{client_id}` | `200` con la controparte, oppure `404` (`client 07-<type>-0 counterparty not found`) per un client che non ne ha una registrata; un ID vuoto risponde `400` | `501` |
| `/ibc/core/client/v2/config/{client_id}` | `200`, `{"config":{"allowed_relayers":[]}}` (un elenco vuoto significa qualsiasi relayer) | `501` |
| `/ibc/core/channel/v2/clients/{client_id}/next_sequence_send`, `/packet_commitments` e le altre route di canale IBC v2 | rispondono (`404` quando per il client non è registrato nulla, `200` con un elenco vuoto per i commitment) | rispondono, stesse forme |

Le route IBC v1 (`/ibc/core/client/v1/...`, `/ibc/core/channel/v1/...`) rispondono su entrambe le reti. Al momento della stesura la testnet ha un client IBC e un canale di trasferimento aperto (`channel-0`, con un token denominato IBC), mentre la mainnet non ha alcun client IBC, canale o token denominato IBC. Sulla testnet il modulo di rate limit risponde a `/Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` (un elenco vuoto: nessun limite impostato) e l'elenco dei checksum 08-wasm a `/ibc/lightclients/wasm/v1/checksums` (vuoto); la mainnet risponde `501` a entrambe.

### Token di test della testnet (Fest) {#fest-tokens}

:::note Solo testnet, senza valore
I tre token qui sotto esistono solo sulla testnet `qorechain-diana`. Sono token di test per i builder: non hanno valore, e la mainnet non ha alcuna coppia di token ERC20 (verificato il 27 ottobre 2026: `token_pairs` è vuoto e l'offerta bank contiene solo `uqor`). La governance li ha registrati come coppie di token ERC20 il 27 ottobre 2026 (proposta 26).
:::

Sulla testnet un token ERC20 registrato esiste anche come coin bank, quindi può essere detenuto, inviato e usato come seconda denominazione di un [pool AMM](#amm-module). La denominazione bank è `erc20:` seguito dall'indirizzo del contratto in **forma checksum EIP-55 con maiuscole e minuscole miste**, e la stringa denom è **sensibile alle maiuscole**: la grafia tutta minuscola è una stringa diversa e non viene trovata.

| Token | Indirizzo del contratto | Denom bank | Decimali |
| --- | --- | --- | --- |
| fUSD (FestUSD) | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` | 6 |
| fETH (FestETH) | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` | 18 |
| fBTC (FestBTC) | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | 8 |

```bash
# the three tokens and their display names / decimals
curl -s https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata
# one denom: the case matters (this returns the metadata, the lowercase spelling returns 404)
curl -s "https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata/erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA"
# the ERC20 token pairs, and the supply of one denom
curl -s https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs
curl -s "https://api-testnet.qore.host/cosmos/bank/v1beta1/supply/by_denom?denom=erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA"
```

`denoms_metadata` elenca ogni token con `symbol` `fUSD` / `fETH` / `fBTC`, `display` `FestUSD` / `FestETH` / `FestBTC` e i decimali come esponente dell'unità di visualizzazione. Una query sul saldo (`/cosmos/bank/v1beta1/balances/{address}`) mostra la parte convertita del saldo di un detentore sotto il denom `erc20:...`; i token ancora detenuti sul lato EVM compaiono nel `balanceOf` del contratto ERC20 stesso. La conversione tra le due forme si fa con `MsgConvertERC20` (da EVM a bank) e `MsgConvertCoin` (da bank a EVM); il mittente di `MsgConvertERC20` deve essere scritto come indirizzo bech32 `qor1`. Vedi [Sviluppo EVM](/developer-guide/evm-development#fest-tokens).

## Riflessione gRPC

Un nodo che esegui tu stesso serve gRPC sulla porta `9090`. Dove la riflessione del server è abilitata, strumenti come `grpcurl` possono scoprire i servizi disponibili:

```bash
grpcurl -plaintext localhost:9090 list
```

Per interrogare un servizio specifico:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` ha tre metodi su un nodo v3.2.3, `Account`, `EVMWindow` e `EVMDelegationConsent`, e un quarto dalla v3.2.4 (la testnet dal 19 ottobre 2026, la mainnet dal 23 ottobre 2026), `ProtocolFeatures`. Un metodo `Params` è aggiunto nella v3.2.6 (per ora solo sulla testnet); un nodo mainnet non ha alcun metodo `Params`.

## Autenticazione

Tutti gli endpoint REST e gRPC non richiedono autenticazione per impostazione predefinita. Per i deployment in produzione, posiziona un reverse proxy (ad es. Nginx o Caddy) davanti al nodo per gestire la terminazione TLS e il controllo degli accessi.
