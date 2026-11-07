---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — Spațiul de nume qor_
sidebar_label: JSON-RPC — Spațiul de nume qor_
sidebar_position: 2
---

# JSON-RPC — Spațiul de nume qor_

Spațiul de nume `qor_` a fost conceput pentru a oferi metode JSON-RPC specifice QoreChain pentru interogarea stării criptografiei post-cuantice, a analizelor AI, a mesageriei cross-VM, a stării multi-layer, a operațiunilor de bridge, a tokenomics, a infrastructurii de rollup și a stării consensului PRISM.

:::warning Metodele planificate nu sunt încă servite
**Niciuna dintre metodele din tabelul de mai jos nu este servită încă în vreo rețea.** Sunt implementate în codul sursă al nodului, dar nu sunt înregistrate în serverul JSON-RPC, iar fiecare întoarce `-32601` (method not found). Înregistrarea lor este planificată pentru o versiune a nodului, iar această pagină va indica versiunea respectivă când va fi livrată. Nu construiți astăzi pe ele; folosiți rutele REST din tabel acolo unde există una. Bibliotecile client care expun helperi `client.qor.*` încapsulează aceleași metode, deci acei helperi eșuează la fel.
:::

## Ce este servit: `qor_getKEMKey` {#qor-getkemkey}

O singură metodă a spațiului de nume este servită: `qor_getKEMKey(address)` întoarce cheia publică ML-KEM publicată de o adresă (`address` poate fi `qor1...` sau `0x`). Răspunde cu `{"address": ..., "found": false}` când nu este publicată nicio cheie și, altfel, adaugă `algorithm_id`, `algorithm_name`, `public_key` (hex `0x`) și `registered_height`. Nodul servește spațiul de nume `qor` doar acolo unde lista sa `api` din secțiunea `[json-rpc]` a lui `app.toml` include `qor`.

Observat la 7 noiembrie 2026:

| Rețea | `rpc_modules` | `qor_getKEMKey` |
| --- | --- | --- |
| Testnet (`https://evm-testnet.qore.host`) | `eth`, `net`, `qor`, `rpc`, `txpool`, `web3` | răspunde (`found: false` pentru o adresă fără cheie publicată) |
| Mainnet (`https://evm.qore.host`) | `eth`, `net`, `rpc`, `txpool`, `web3` | `-32601` (punctul de acces public de mainnet nu listează `qor`) |

Pe testnet, toate celelalte metode `qor_` verificate (`qor_getPQCKeyStatus`, `qor_getHybridSignatureMode`, `qor_getAIStats`, `qor_getBurnStats`) au întors în continuare `-32601`.

Puteți verifica singuri lista spațiilor de nume:

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
| Statistici AI (planificat; numele metodei nu este final) | gRPC `qorechain.ai.v1.Query/Stats` pe un nod propriu, sau `qorechaind query ai stats`; fără rută REST. |
| `qor_getCrossVMMessage`       | gRPC `qorechain.crossvm.v1.Query/Message` pe un nod propriu; fără rută REST. |
| `qor_getReputationScore`      | Nicio rută de interogare publică (modulul reputation expune doar gRPC `Params`). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` și `anchor/{layer_id}`. Vezi [Modulul Multilayer](/api-reference/rest-grpc-endpoints#multilayer-module). |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. Vezi [Modulul Bridge](/api-reference/rest-grpc-endpoints#bridge-module). Bridge-ul nu este încă activ. |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | Din v3.2.6 (pe ambele rețele): `GET /qorechain/rlconsensus/v1/agent`, `/observation` și `/reward` (precum și `/params`, `/policy`, `/applied_params`, `/last_action`); vezi [Modulul RL Consensus](/api-reference/rest-grpc-endpoints#rlconsensus-module). Rutele au răspuns cu `200` pe gazda publică de mainnet la 4 noiembrie 2026; pe un nod mai vechi decât v3.2.6 răspund cu `501`, iar serviciul gRPC `qorechain.rlconsensus.v1.Query` (`AgentStatus`, `Observation`, `Reward`) este calea de a le citi. |
| `qor_getPoolClassification`   | Nicio rută de interogare publică. |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`. Vezi [Modulul Burn](/api-reference/rest-grpc-endpoints#burn-module). |
| `qor_getXQOREPosition`        | Niciuna. xQORE nu este activ (vezi [Staking xQORE](/user-guide/xqore-staking)). |
| `qor_getInflationRate`        | `GET /qorechain/inflation/v1/params` și `/epoch_info` (modul de emisie, suma per epocă, plafon, progres; servite începând cu v3.2.2). Vezi [Modulul Inflation](/api-reference/rest-grpc-endpoints#inflation-module). |
| `qor_getTokenomicsOverview`   | Combinați `GET /qorechain/burn/v1/stats`, `GET /qorechain/inflation/v1/epoch_info` și `GET /cosmos/bank/v1beta1/supply`. |
| `qor_getRollupStatus`, `qor_listRollups`, `qor_getSettlementBatch`, `qor_getDABlobStatus` | `GET /qorechain/rdk/v1/rollup/{id}`, `/rollups`, `/batch/{id}/{index}`, `/latest_batch/{id}`, `/batches/{id}`, `/blob/{id}/{index}` (servite începând cu v3.2.2; vezi [Modulul RDK](/api-reference/rest-grpc-endpoints#rdk-module)), sau `qorechaind query rdk`. |
| `qor_suggestRollupProfile`    | Niciun serviciu public; vezi [Profiluri presetate](/rollups/preset-profiles). |
| `qor_getBTCStakingPosition`   | Niciuna. Modulul de BTC restaking nu are încă un serviciu de interogare. |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`. Conturile abstracte sunt dezactivate pe mainnet și activate pe testnet (verificat la 27 octombrie 2026). |
| `qor_getGasAbstractionConfig` | `GET /qorechain/gasabstraction/v1/config` (servită începând cu v3.2.2). Vezi [Modulul Gas Abstraction](/api-reference/rest-grpc-endpoints#gas-abstraction-module). |
| `qor_getFairBlockStatus`, `qor_getLaneConfiguration` | Niciuna. |

Pentru starea unui cont pe banda EVM (cheia PQC înregistrată, fereastra de autorizare și consimțământul EIP-7702) folosiți `GET /qorechain/pqc/v1/account/{address}`, `GET /qorechain/pqc/v1/evm_window/{address}` și `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`. Ruta de stare este `account` la **singular**; pluralul `/accounts/` nu este servit și răspunde cu `501`.

---

## Coduri de eroare

Erorile urmează codurile standard JSON-RPC 2.0. Astăzi, apelurile către o metodă `qor_` planificată eșuează cu `-32601`, iar pe punctul de acces de mainnet la fel și `qor_getKEMKey`.

| Cod    | Mesaj             | Descriere                                  |
| ------ | ------------------ | ------------------------------------------- |
| -32600 | Invalid Request     | Cerere JSON-RPC malformată                  |
| -32601 | Method not found    | Metoda nu există sau nodul nu servește spațiul de nume `qor_` (orice metodă planificată astăzi; și `qor_getKEMKey`, acolo unde `qor` nu este activat) |
| -32602 | Invalid params      | Parametri lipsă sau invalizi                |
| -32603 | Internal error      | Eroare de procesare pe partea de server     |
