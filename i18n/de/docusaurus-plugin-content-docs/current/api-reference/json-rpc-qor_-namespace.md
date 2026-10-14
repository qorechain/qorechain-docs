---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — qor_-Namespace
sidebar_label: JSON-RPC — qor_-Namespace
sidebar_position: 2
---

# JSON-RPC — qor_-Namespace

Der `qor_`-Namespace wurde entworfen, um QoreChain-spezifische JSON-RPC-Methoden bereitzustellen, mit denen sich der Status der Post-Quanten-Kryptografie, KI-Analysen, VM-übergreifendes Messaging, mehrschichtiger State, Bridge-Operationen, Tokenomics, Rollup-Infrastruktur und PRISM-Konsensstatus abfragen lassen.

:::warning Noch nicht bereitgestellt
**Kein veröffentlichter Node-Build stellt den `qor_`-Namespace bisher bereit**, weder im Mainnet (`qorechain-vladi`) noch im Testnet (`qorechain-diana`) noch auf einem selbst betriebenen Node. Auf den öffentlichen EVM-Endpunkten listet `rpc_modules` nur `eth`, `net`, `rpc`, `txpool` und `web3`, und **jede `qor_`-Methode liefert `-32601` (method not found)** auf beiden Netzwerken. Die Methoden sind im Node-Quellcode implementiert, aber nicht beim JSON-RPC-Server registriert, sodass das Hinzufügen von `qor` zur `api`-Liste in `app.toml` keine Wirkung hat. Die Registrierung des Namespace ist für ein Node-Release geplant, und diese Seite nennt das Release, sobald es erscheint.

Entwickeln Sie heute nicht gegen `qor_`-Methoden. Nutzen Sie die REST-Routen in der folgenden Tabelle, wo eine existiert. Client-Bibliotheken, die `client.qor.*`-Helfer anbieten, kapseln dieselben Methoden, sodass diese Helfer auf dieselbe Weise fehlschlagen.
:::

Sie können das selbst bestätigen:

```bash
curl -s -X POST https://evm.qore.host \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"rpc_modules","params":[],"id":1}'
```

```json
{"jsonrpc":"2.0","id":1,"result":{"eth":"1.0","net":"1.0","rpc":"1.0","txpool":"1.0","web3":"1.0"}}
```

---

## Geplante Methoden und was Sie heute nutzen

| Geplante Methode                | Was Sie heute nutzen |
| ----------------------------- | ----------------- |
| `qor_getPQCKeyStatus`         | `GET /qorechain/pqc/v1/account/{address}` (`found`, `account.key_type`, `account.created_at_height`). Siehe [REST- / gRPC-Endpunkte](/api-reference/rest-grpc-endpoints#pqc-module). |
| `qor_getHybridSignatureMode`  | Keine öffentliche Abfrage-Route. |
| `qor_getAIStats`              | gRPC `qorechain.ai.v1.Query/Stats` auf einem selbst betriebenen Node; keine REST-Route. |
| `qor_getCrossVMMessage`       | gRPC `qorechain.crossvm.v1.Query/Message` auf einem selbst betriebenen Node; keine REST-Route. |
| `qor_getReputationScore`      | Keine öffentliche Abfrage-Route (das Reputationsmodul stellt nur gRPC `Params` bereit). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` und `anchor/{layer_id}`. Siehe [Multilayer-Modul](/api-reference/rest-grpc-endpoints#multilayer-module). |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. Siehe [Bridge-Modul](/api-reference/rest-grpc-endpoints#bridge-module). Die Bridge ist noch nicht live. |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | gRPC `qorechain.rlconsensus.v1.Query` (`AgentStatus`, `Observation`, `Reward`) auf einem selbst betriebenen Node; keine REST-Route. |
| `qor_getPoolClassification`   | Keine öffentliche Abfrage-Route. |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`. Siehe [Burn-Modul](/api-reference/rest-grpc-endpoints#burn-module). |
| `qor_getXQOREPosition`        | Keine. xQORE ist nicht live (siehe [xQORE-Staking](/user-guide/xqore-staking)). |
| `qor_getInflationRate`        | Keine öffentliche Abfrage-Route im Mainnet. |
| `qor_getTokenomicsOverview`   | Kombinieren Sie `GET /qorechain/burn/v1/stats` mit `GET /cosmos/bank/v1beta1/supply`. |
| `qor_getRollupStatus`, `qor_listRollups`, `qor_getSettlementBatch`, `qor_getDABlobStatus` | gRPC `qorechain.rdk.v1.Query` (`Rollup`, `Rollups`, `Batch`, `LatestBatch`) oder die CLI auf einem selbst betriebenen Node; die REST-Routen `/qorechain/rdk/v1/...` werden im Mainnet nicht bereitgestellt. |
| `qor_suggestRollupProfile`    | Kein öffentlicher Dienst; siehe [Vorkonfigurierte Profile](/rollups/preset-profiles). |
| `qor_getBTCStakingPosition`   | Keine. Das BTC-Restaking-Modul hat noch keinen Abfragedienst. |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`. Abstract Accounts sind heute auf beiden Netzwerken deaktiviert. |
| `qor_getFairBlockStatus`, `qor_getGasAbstractionConfig`, `qor_getLaneConfiguration` | Keine. |

Für den EVM-Lane-Zustand eines Kontos (registrierter PQC-Schlüssel und Autorisierungsfenster) nutzen Sie `GET /qorechain/pqc/v1/account/{address}` und `GET /qorechain/pqc/v1/evm_window/{address}`.

---

## Fehlercodes

Auf einem Node, der den Namespace bereitstellt, folgen Fehler den Standard-Codes von JSON-RPC 2.0. Heute schlagen Aufrufe einer `qor_`-Methode mit `-32601` fehl.

| Code   | Meldung          | Beschreibung                              |
| ------ | ---------------- | ----------------------------------------- |
| -32600 | Invalid Request  | Fehlerhaft formatierte JSON-RPC-Anfrage   |
| -32601 | Method not found | Die Methode existiert nicht, oder der Node stellt den `qor_`-Namespace nicht bereit (jedes veröffentlichte Build heute) |
| -32602 | Invalid params   | Fehlende oder ungültige Parameter         |
| -32603 | Internal error   | Serverseitiger Verarbeitungsfehler        |
