---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — Namespace qor_
sidebar_label: JSON-RPC — Namespace qor_
sidebar_position: 2
---

# JSON-RPC — qor_ Namespace

Il namespace `qor_` è stato progettato per fornire metodi JSON-RPC specifici di QoreChain per interrogare lo stato della crittografia post-quantistica, le analitiche AI, la messaggistica cross-VM, lo stato multi-layer, le operazioni di bridge, la tokenomics, l'infrastruttura di rollup e lo stato del consenso PRISM.

:::warning Serviti sulla testnet dalla v3.2.9, non sulla mainnet
Dalla v3.2.9 l'endpoint EVM della testnet (`https://evm-testnet.qore.host`) serve tutti i metodi elencati in questa pagina. La mainnet esegue la v3.2.8 e il suo endpoint EVM pubblico non elenca il namespace `qor`: ogni metodo `qor_` lì, compresi quelli della tabella qui sotto, restituisce `-32601` (method not found). Verificato il 22 novembre 2026: ciascuno dei 26 nomi di metodo di questa pagina, chiamato sulla testnet senza argomenti, ha risposto con un risultato oppure con un errore di parametri non validi che indicava un argomento mancante, e nessuno ha restituito `-32601`; sulla mainnet `qor_getBurnStats` ha restituito `-32601`. Per tutto ciò che deve funzionare su entrambe le reti, sviluppa sulle route REST della tabella qui sotto. Le librerie client che espongono helper `client.qor.*` incapsulano questi stessi metodi, quindi quegli helper funzionano sulla testnet e falliscono sulla mainnet.
:::

## Cosa è servito: `qor_getKEMKey` {#qor-getkemkey}

`qor_getKEMKey(address)` era l'unico metodo servito prima della v3.2.9 ed è quello da usare su qualsiasi endpoint che elenchi il namespace `qor`. Restituisce la chiave pubblica ML-KEM che un indirizzo ha pubblicato (`address` può essere `qor1...` oppure `0x`). Risponde `{"address": ..., "found": false}` quando non è pubblicata alcuna chiave e altrimenti aggiunge `algorithm_id`, `algorithm_name`, `public_key` (hex `0x`) e `registered_height`. Il nodo serve il namespace `qor` solo dove l'elenco `api` di `[json-rpc]` in `app.toml` include `qor`.

Osservato il 7 novembre 2026 (prima della v3.2.9):

| Rete | `rpc_modules` | `qor_getKEMKey` |
| --- | --- | --- |
| Testnet (`https://evm-testnet.qore.host`) | `eth`, `net`, `qor`, `rpc`, `txpool`, `web3` | risponde (`found: false` per un indirizzo senza chiave pubblicata) |
| Mainnet (`https://evm.qore.host`) | `eth`, `net`, `rpc`, `txpool`, `web3` | `-32601` (l'endpoint mainnet pubblico non elenca `qor`) |

In quella data la testnet ha restituito `-32601` per ogni altro metodo `qor_` verificato (`qor_getPQCKeyStatus`, `qor_getHybridSignatureMode`, `qor_getAIStats`, `qor_getBurnStats`); dalla v3.2.9 rispondono sulla testnet, come indica la nota all'inizio di questa pagina.

Puoi verificare da solo l'elenco dei namespace:

```bash
curl -s -X POST https://evm.qore.host \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"rpc_modules","params":[],"id":1}'
```

```json
{"jsonrpc":"2.0","id":1,"result":{"eth":"1.0","net":"1.0","rpc":"1.0","txpool":"1.0","web3":"1.0"}}
```

---

## Gli altri metodi e cosa usare sulla mainnet

| Metodo previsto               | Cosa usare oggi |
| ----------------------------- | ----------------- |
| `qor_getPQCKeyStatus`         | `GET /qorechain/pqc/v1/account/{address}` (`found`, `account.key_type`, `account.created_at_height`). Vedi [Endpoint REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module). |
| `qor_getHybridSignatureMode`  | Nessuna route REST pubblica; `qorechaind query pqc hybrid-mode` (oppure `query pqc params`) su un nodo o con `--node https://rpc.qore.host:443`. |
| Statistiche AI (previsto; nome del metodo non definitivo) | gRPC `qorechain.ai.v1.Query/Stats` su un nodo gestito da te, oppure `qorechaind query ai stats`; nessuna route REST. |
| `qor_getCrossVMMessage`       | gRPC `qorechain.crossvm.v1.Query/Message` su un nodo gestito da te; nessuna route REST. |
| `qor_getReputationScore`      | Nessuna route di query pubblica (il modulo reputation espone solo `Params` via gRPC). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` e `anchor/{layer_id}`. Vedi [Modulo Multilayer](/api-reference/rest-grpc-endpoints#multilayer-module). |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. Vedi [Modulo Bridge](/api-reference/rest-grpc-endpoints#bridge-module). Il bridge non è ancora live. |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | Dalla v3.2.6 (su entrambe le reti): `GET /qorechain/rlconsensus/v1/agent`, `/observation` e `/reward` (anche `/params`, `/policy`, `/applied_params`, `/last_action`); vedi [Modulo RL Consensus](/api-reference/rest-grpc-endpoints#rlconsensus-module). Le route hanno risposto `200` sull'host mainnet pubblico il 4 novembre 2026; su un nodo precedente alla v3.2.6 rispondono `501` e il servizio gRPC `qorechain.rlconsensus.v1.Query` (`AgentStatus`, `Observation`, `Reward`) è il modo per leggerle. |
| `qor_getPoolClassification`   | Nessuna route di query pubblica. |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`. Vedi [Modulo Burn](/api-reference/rest-grpc-endpoints#burn-module). |
| `qor_getXQOREPosition`        | Nessuna. xQORE non è live (vedi [Staking xQORE](/user-guide/xqore-staking)). |
| `qor_getInflationRate`        | `GET /qorechain/inflation/v1/params` e `/epoch_info` (modalità di emissione, importo per epoca, tetto, avanzamento; servite dalla v3.2.2). Vedi [Modulo Inflation](/api-reference/rest-grpc-endpoints#inflation-module). |
| `qor_getTokenomicsOverview`   | Combina `GET /qorechain/burn/v1/stats`, `GET /qorechain/inflation/v1/epoch_info` e `GET /cosmos/bank/v1beta1/supply`. |
| `qor_getRollupStatus`, `qor_listRollups`, `qor_getSettlementBatch`, `qor_getDABlobStatus` | `GET /qorechain/rdk/v1/rollup/{id}`, `/rollups`, `/batch/{id}/{index}`, `/latest_batch/{id}`, `/batches/{id}`, `/blob/{id}/{index}` (servite dalla v3.2.2; vedi [Modulo RDK](/api-reference/rest-grpc-endpoints#rdk-module)), oppure `qorechaind query rdk`. |
| `qor_suggestRollupProfile`    | Nessun servizio pubblico; vedi [Profili preimpostati](/rollups/preset-profiles). |
| `qor_getBTCStakingPosition`   | Nessuna. Il modulo di BTC restaking non ha ancora un servizio di query. |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`. Gli account astratti sono disabilitati sulla mainnet e abilitati sulla testnet (verificato il 27 ottobre 2026). |
| `qor_getGasAbstractionConfig` | `GET /qorechain/gasabstraction/v1/config` (servita dalla v3.2.2). Vedi [Modulo Gas Abstraction](/api-reference/rest-grpc-endpoints#gas-abstraction-module). |
| `qor_getFairBlockStatus`, `qor_getLaneConfiguration` | Nessuna. |

Per lo stato di un account sulla corsia EVM (chiave PQC registrata, finestra di autorizzazione e consenso EIP-7702) usa `GET /qorechain/pqc/v1/account/{address}`, `GET /qorechain/pqc/v1/evm_window/{address}` e `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`. La route di stato è `account` al **singolare**; il plurale `/accounts/` non è servito e risponde `501`.

---

## Codici di errore

Gli errori seguono i codici standard di JSON-RPC 2.0. Oggi le chiamate a un metodo `qor_` previsto falliscono con `-32601`, e sull'endpoint mainnet anche `qor_getKEMKey`.

| Codice | Messaggio         | Descrizione                             |
| ------ | ----------------- | ---------------------------------------- |
| -32600 | Invalid Request    | Richiesta JSON-RPC malformata            |
| -32601 | Method not found   | Il metodo non esiste, oppure il nodo non serve il namespace `qor_` (ogni metodo previsto oggi; anche `qor_getKEMKey` dove `qor` non è abilitato) |
| -32602 | Invalid params     | Parametri mancanti o non validi          |
| -32603 | Internal error     | Errore di elaborazione lato server       |
