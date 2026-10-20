---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — Spațiul de nume qor_
sidebar_label: JSON-RPC — Spațiul de nume qor_
sidebar_position: 2
---

# JSON-RPC — Spațiul de nume qor_

Spațiul de nume `qor_` a fost conceput pentru a oferi metode JSON-RPC specifice QoreChain pentru interogarea stării criptografiei post-cuantice, a analizelor AI, a mesageriei cross-VM, a stării multi-layer, a operațiunilor de bridge, a tokenomics, a infrastructurii de rollup și a stării consensului PRISM.

:::warning Încă indisponibil
**Niciun build publicat al nodului nu servește încă spațiul de nume `qor_`**, nici pe mainnet (`qorechain-vladi`), nici pe testnet (`qorechain-diana`), nici pe un nod propriu. Pe punctele de acces EVM publice, `rpc_modules` listează doar `eth`, `net`, `rpc`, `txpool` și `web3`, iar **orice metodă `qor_` întoarce `-32601` (method not found)** în ambele rețele. Metodele sunt implementate în codul sursă al nodului, dar nu sunt înregistrate în serverul JSON-RPC, așa că adăugarea lui `qor` în lista `api` din `app.toml` nu are niciun efect. Înregistrarea spațiului de nume este planificată pentru o versiune a nodului, iar această pagină va indica versiunea respectivă când va fi livrată.

Nu construiți astăzi pe metode `qor_`. Folosiți rutele REST din tabelul de mai jos acolo unde există una. Bibliotecile client care expun helperi `client.qor.*` încapsulează aceleași metode, deci acei helperi eșuează la fel.
:::

Puteți confirma acest lucru singuri:

```bash
curl -s -X POST https://evm.qore.host \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"rpc_modules","params":[],"id":1}'
```

```json
{"jsonrpc":"2.0","id":1,"result":{"eth":"1.0","net":"1.0","rpc":"1.0","txpool":"1.0","web3":"1.0"}}
```

---

## Metode planificate și ce se folosește astăzi

| Metodă planificată            | Ce se folosește astăzi |
| ----------------------------- | ----------------- |
| `qor_getPQCKeyStatus`         | `GET /qorechain/pqc/v1/account/{address}` (`found`, `account.key_type`, `account.created_at_height`). Vezi [Endpoint-uri REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module). |
| `qor_getHybridSignatureMode`  | Nicio rută REST publică; `qorechaind query pqc hybrid-mode` (sau `query pqc params`) pe un nod sau cu `--node https://rpc.qore.host:443`. |
| `qor_getAIStats`              | gRPC `qorechain.ai.v1.Query/Stats` pe un nod propriu, sau `qorechaind query ai stats`; fără rută REST. |
| `qor_getCrossVMMessage`       | gRPC `qorechain.crossvm.v1.Query/Message` pe un nod propriu; fără rută REST. |
| `qor_getReputationScore`      | Nicio rută de interogare publică (modulul reputation expune doar gRPC `Params`). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` și `anchor/{layer_id}`. Vezi [Modulul Multilayer](/api-reference/rest-grpc-endpoints#multilayer-module). |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. Vezi [Modulul Bridge](/api-reference/rest-grpc-endpoints#bridge-module). Bridge-ul nu este încă activ. |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | gRPC `qorechain.rlconsensus.v1.Query` (`AgentStatus`, `Observation`, `Reward`) pe un nod propriu; fără rută REST. |
| `qor_getPoolClassification`   | Nicio rută de interogare publică. |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`. Vezi [Modulul Burn](/api-reference/rest-grpc-endpoints#burn-module). |
| `qor_getXQOREPosition`        | Niciuna. xQORE nu este activ (vezi [Staking xQORE](/user-guide/xqore-staking)). |
| `qor_getInflationRate`        | `GET /qorechain/inflation/v1/params` și `/epoch_info` (modul de emisie, suma per epocă, plafon, progres; servite începând cu v3.2.2). Vezi [Modulul Inflation](/api-reference/rest-grpc-endpoints#inflation-module). |
| `qor_getTokenomicsOverview`   | Combinați `GET /qorechain/burn/v1/stats`, `GET /qorechain/inflation/v1/epoch_info` și `GET /cosmos/bank/v1beta1/supply`. |
| `qor_getRollupStatus`, `qor_listRollups`, `qor_getSettlementBatch`, `qor_getDABlobStatus` | `GET /qorechain/rdk/v1/rollup/{id}`, `/rollups`, `/batch/{id}/{index}`, `/latest_batch/{id}`, `/batches/{id}`, `/blob/{id}/{index}` (servite începând cu v3.2.2; vezi [Modulul RDK](/api-reference/rest-grpc-endpoints#rdk-module)), sau `qorechaind query rdk`. |
| `qor_suggestRollupProfile`    | Niciun serviciu public; vezi [Profiluri presetate](/rollups/preset-profiles). |
| `qor_getBTCStakingPosition`   | Niciuna. Modulul de BTC restaking nu are încă un serviciu de interogare. |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`. Conturile abstracte sunt dezactivate astăzi în ambele rețele. |
| `qor_getGasAbstractionConfig` | `GET /qorechain/gasabstraction/v1/config` (servită începând cu v3.2.2). Vezi [Modulul Gas Abstraction](/api-reference/rest-grpc-endpoints#gas-abstraction-module). |
| `qor_getFairBlockStatus`, `qor_getLaneConfiguration` | Niciuna. |

Pentru starea unui cont pe banda EVM (cheia PQC înregistrată, fereastra de autorizare și consimțământul EIP-7702) folosiți `GET /qorechain/pqc/v1/account/{address}`, `GET /qorechain/pqc/v1/evm_window/{address}` și `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`. Ruta de stare este `account` la **singular**; pluralul `/accounts/` nu este servit și răspunde cu `501`.

---

## Coduri de eroare

Pe un nod care servește spațiul de nume, erorile urmează codurile standard JSON-RPC 2.0. Astăzi, apelurile către o metodă `qor_` eșuează cu `-32601`.

| Cod    | Mesaj             | Descriere                                  |
| ------ | ------------------ | ------------------------------------------- |
| -32600 | Invalid Request     | Cerere JSON-RPC malformată                  |
| -32601 | Method not found    | Metoda nu există sau nodul nu servește spațiul de nume `qor_` (orice build publicat astăzi) |
| -32602 | Invalid params      | Parametri lipsă sau invalizi                |
| -32603 | Internal error      | Eroare de procesare pe partea de server     |
