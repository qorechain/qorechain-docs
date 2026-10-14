---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — Espace de noms qor_
sidebar_label: JSON-RPC — Espace de noms qor_
sidebar_position: 2
---

# JSON-RPC — Espace de noms qor_

L'espace de noms `qor_` a été conçu pour fournir des méthodes JSON-RPC spécifiques à QoreChain afin d'interroger le statut de la cryptographie post-quantique, les analyses IA, la messagerie inter-VM, l'état multi-couche, les opérations de pont, la tokenomics, l'infrastructure de rollup et l'état du consensus PRISM.

:::warning Pas encore servi
**Aucune version publiée du nœud ne sert encore l'espace de noms `qor_`**, ni sur le mainnet (`qorechain-vladi`), ni sur le testnet (`qorechain-diana`), ni sur un nœud que vous exploitez vous-même. Sur les points de terminaison EVM publics, `rpc_modules` ne liste que `eth`, `net`, `rpc`, `txpool` et `web3`, et **chaque méthode `qor_` renvoie `-32601` (method not found)** sur les deux réseaux. Les méthodes sont implémentées dans le code source du nœud mais ne sont pas enregistrées auprès du serveur JSON-RPC ; ajouter `qor` à la liste `api` dans `app.toml` n'a donc aucun effet. L'enregistrement de l'espace de noms est prévu pour une version du nœud, et cette page indiquera laquelle lorsqu'elle sera livrée.

Ne développez pas dès aujourd'hui sur les méthodes `qor_`. Utilisez les routes REST du tableau ci-dessous lorsqu'il en existe une. Les bibliothèques clientes qui exposent des helpers `client.qor.*` encapsulent ces mêmes méthodes, de sorte que ces helpers échouent de la même façon.
:::

Vous pouvez le confirmer vous-même :

```bash
curl -s -X POST https://evm.qore.host \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"rpc_modules","params":[],"id":1}'
```

```json
{"jsonrpc":"2.0","id":1,"result":{"eth":"1.0","net":"1.0","rpc":"1.0","txpool":"1.0","web3":"1.0"}}
```

---

## Méthodes prévues et ce qu'il faut utiliser aujourd'hui

| Méthode prévue                | Ce qu'il faut utiliser aujourd'hui |
| ----------------------------- | ----------------- |
| `qor_getPQCKeyStatus`         | `GET /qorechain/pqc/v1/account/{address}` (`found`, `account.key_type`, `account.created_at_height`). Voir [Points de terminaison REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module). |
| `qor_getHybridSignatureMode`  | Aucune route de requête publique. |
| `qor_getAIStats`              | gRPC `qorechain.ai.v1.Query/Stats` sur un nœud que vous exploitez ; pas de route REST. |
| `qor_getCrossVMMessage`       | gRPC `qorechain.crossvm.v1.Query/Message` sur un nœud que vous exploitez ; pas de route REST. |
| `qor_getReputationScore`      | Aucune route de requête publique (le module de réputation n'expose que `Params` en gRPC). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` et `anchor/{layer_id}`. Voir [Module Multilayer](/api-reference/rest-grpc-endpoints#multilayer-module). |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. Voir [Module Bridge](/api-reference/rest-grpc-endpoints#bridge-module). Le pont n'est pas encore en service. |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | gRPC `qorechain.rlconsensus.v1.Query` (`AgentStatus`, `Observation`, `Reward`) sur un nœud que vous exploitez ; pas de route REST. |
| `qor_getPoolClassification`   | Aucune route de requête publique. |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`. Voir [Module Burn](/api-reference/rest-grpc-endpoints#burn-module). |
| `qor_getXQOREPosition`        | Aucune. xQORE n'est pas en service (voir [Staking xQORE](/user-guide/xqore-staking)). |
| `qor_getInflationRate`        | Aucune route de requête publique sur le mainnet. |
| `qor_getTokenomicsOverview`   | Combinez `GET /qorechain/burn/v1/stats` avec `GET /cosmos/bank/v1beta1/supply`. |
| `qor_getRollupStatus`, `qor_listRollups`, `qor_getSettlementBatch`, `qor_getDABlobStatus` | gRPC `qorechain.rdk.v1.Query` (`Rollup`, `Rollups`, `Batch`, `LatestBatch`) ou le CLI sur un nœud que vous exploitez ; les routes REST `/qorechain/rdk/v1/...` ne sont pas servies sur le mainnet. |
| `qor_suggestRollupProfile`    | Aucun service public ; voir [Profils prédéfinis](/rollups/preset-profiles). |
| `qor_getBTCStakingPosition`   | Aucune. Le module de restaking BTC n'a pas encore de service de requête. |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`. Les comptes abstraits sont désactivés sur les deux réseaux aujourd'hui. |
| `qor_getFairBlockStatus`, `qor_getGasAbstractionConfig`, `qor_getLaneConfiguration` | Aucune. |

Pour l'état d'un compte sur la voie EVM (clé PQC enregistrée et fenêtre d'autorisation), utilisez `GET /qorechain/pqc/v1/account/{address}` et `GET /qorechain/pqc/v1/evm_window/{address}`.

---

## Codes d'erreur

Sur un nœud qui sert bien l'espace de noms, les erreurs suivent les codes standard de JSON-RPC 2.0. Aujourd'hui, les appels à une méthode `qor_` échouent avec `-32601`.

| Code   | Message          | Description                           |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | Requête JSON-RPC mal formée           |
| -32601 | Method not found | La méthode n'existe pas, ou le nœud ne sert pas l'espace de noms `qor_` (toutes les versions publiées aujourd'hui) |
| -32602 | Invalid params   | Paramètres manquants ou invalides     |
| -32603 | Internal error   | Erreur de traitement côté serveur     |
