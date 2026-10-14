---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — Namespace qor_
sidebar_label: JSON-RPC — Namespace qor_
sidebar_position: 2
---

# JSON-RPC — qor_ Namespace

Il namespace `qor_` è stato progettato per fornire metodi JSON-RPC specifici di QoreChain per interrogare lo stato della crittografia post-quantistica, le analitiche AI, la messaggistica cross-VM, lo stato multi-layer, le operazioni di bridge, la tokenomics, l'infrastruttura di rollup e lo stato del consenso PRISM.

:::warning Non ancora servito
**Nessuna build rilasciata del nodo serve ancora il namespace `qor_`**, né sulla mainnet (`qorechain-vladi`), né sulla testnet (`qorechain-diana`), né su un nodo gestito da te. Sugli endpoint EVM pubblici `rpc_modules` elenca solo `eth`, `net`, `rpc`, `txpool` e `web3`, e **ogni metodo `qor_` restituisce `-32601` (method not found)** su entrambe le reti. I metodi sono implementati nel codice sorgente del nodo ma non registrati nel server JSON-RPC, quindi aggiungere `qor` all'elenco `api` in `app.toml` non ha alcun effetto. La registrazione del namespace è prevista per una release del nodo, e questa pagina indicherà quale quando verrà rilasciata.

Non sviluppare oggi sui metodi `qor_`. Usa le route REST nella tabella qui sotto dove ne esiste una. Le librerie client che espongono helper `client.qor.*` incapsulano questi stessi metodi, quindi quegli helper falliscono allo stesso modo.
:::

Puoi verificarlo da solo:

```bash
curl -s -X POST https://evm.qore.host \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"rpc_modules","params":[],"id":1}'
```

```json
{"jsonrpc":"2.0","id":1,"result":{"eth":"1.0","net":"1.0","rpc":"1.0","txpool":"1.0","web3":"1.0"}}
```

---

## Metodi previsti e cosa usare oggi

| Metodo previsto               | Cosa usare oggi |
| ----------------------------- | ----------------- |
| `qor_getPQCKeyStatus`         | `GET /qorechain/pqc/v1/account/{address}` (`found`, `account.key_type`, `account.created_at_height`). Vedi [Endpoint REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module). |
| `qor_getHybridSignatureMode`  | Nessuna route di query pubblica. |
| `qor_getAIStats`              | gRPC `qorechain.ai.v1.Query/Stats` su un nodo gestito da te; nessuna route REST. |
| `qor_getCrossVMMessage`       | gRPC `qorechain.crossvm.v1.Query/Message` su un nodo gestito da te; nessuna route REST. |
| `qor_getReputationScore`      | Nessuna route di query pubblica (il modulo reputation espone solo `Params` via gRPC). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` e `anchor/{layer_id}`. Vedi [Modulo Multilayer](/api-reference/rest-grpc-endpoints#multilayer-module). |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. Vedi [Modulo Bridge](/api-reference/rest-grpc-endpoints#bridge-module). Il bridge non è ancora live. |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | gRPC `qorechain.rlconsensus.v1.Query` (`AgentStatus`, `Observation`, `Reward`) su un nodo gestito da te; nessuna route REST. |
| `qor_getPoolClassification`   | Nessuna route di query pubblica. |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`. Vedi [Modulo Burn](/api-reference/rest-grpc-endpoints#burn-module). |
| `qor_getXQOREPosition`        | Nessuna. xQORE non è live (vedi [Staking xQORE](/user-guide/xqore-staking)). |
| `qor_getInflationRate`        | Nessuna route di query pubblica sulla mainnet. |
| `qor_getTokenomicsOverview`   | Combina `GET /qorechain/burn/v1/stats` con `GET /cosmos/bank/v1beta1/supply`. |
| `qor_getRollupStatus`, `qor_listRollups`, `qor_getSettlementBatch`, `qor_getDABlobStatus` | gRPC `qorechain.rdk.v1.Query` (`Rollup`, `Rollups`, `Batch`, `LatestBatch`) o la CLI su un nodo gestito da te; le route REST `/qorechain/rdk/v1/...` non sono servite sulla mainnet. |
| `qor_suggestRollupProfile`    | Nessun servizio pubblico; vedi [Profili preimpostati](/rollups/preset-profiles). |
| `qor_getBTCStakingPosition`   | Nessuna. Il modulo di BTC restaking non ha ancora un servizio di query. |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`. Gli account astratti sono disabilitati su entrambe le reti oggi. |
| `qor_getFairBlockStatus`, `qor_getGasAbstractionConfig`, `qor_getLaneConfiguration` | Nessuna. |

Per lo stato di un account sulla corsia EVM (chiave PQC registrata e finestra di autorizzazione) usa `GET /qorechain/pqc/v1/account/{address}` e `GET /qorechain/pqc/v1/evm_window/{address}`.

---

## Codici di errore

Su un nodo che serve il namespace, gli errori seguono i codici standard di JSON-RPC 2.0. Oggi le chiamate a un metodo `qor_` falliscono con `-32601`.

| Codice | Messaggio         | Descrizione                             |
| ------ | ----------------- | ---------------------------------------- |
| -32600 | Invalid Request    | Richiesta JSON-RPC malformata            |
| -32601 | Method not found   | Il metodo non esiste, oppure il nodo non serve il namespace `qor_` (ogni build rilasciata oggi) |
| -32602 | Invalid params     | Parametri mancanti o non validi          |
| -32603 | Internal error     | Errore di elaborazione lato server       |
