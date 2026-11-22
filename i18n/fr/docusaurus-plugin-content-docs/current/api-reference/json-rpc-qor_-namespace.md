---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — Espace de noms qor_
sidebar_label: JSON-RPC — Espace de noms qor_
sidebar_position: 2
---

# JSON-RPC — Espace de noms qor_

L'espace de noms `qor_` a été conçu pour fournir des méthodes JSON-RPC spécifiques à QoreChain afin d'interroger le statut de la cryptographie post-quantique, les analyses IA, la messagerie inter-VM, l'état multi-couche, les opérations de pont, la tokenomics, l'infrastructure de rollup et l'état du consensus PRISM.

:::warning Servies sur le testnet à partir de la v3.2.9, pas sur le mainnet
À partir de la v3.2.9, le point de terminaison EVM du testnet (`https://evm-testnet.qore.host`) sert toutes les méthodes listées sur cette page. Le mainnet exécute la v3.2.8, et son point de terminaison EVM public ne liste pas l'espace de noms `qor` : toute méthode `qor_` y renvoie `-32601` (method not found), y compris celles du tableau ci-dessous. Vérifié le 22 novembre 2026 : chacun des 26 noms de méthodes de cette page, appelé sur le testnet sans arguments, a répondu soit par un résultat, soit par une erreur de paramètres invalides nommant un argument manquant, et aucun n'a renvoyé `-32601` ; sur le mainnet, `qor_getBurnStats` a renvoyé `-32601`. Appuyez-vous sur les routes REST du tableau ci-dessous pour tout ce qui doit fonctionner sur les deux réseaux. Les bibliothèques clientes qui exposent des helpers `client.qor.*` encapsulent ces mêmes méthodes, de sorte que ces helpers fonctionnent sur le testnet et échouent sur le mainnet.
:::

## Ce qui est servi : `qor_getKEMKey` {#qor-getkemkey}

`qor_getKEMKey(address)` était la seule méthode servie avant la v3.2.9, et c'est celle à utiliser sur tout point de terminaison qui liste l'espace de noms `qor`. Elle renvoie la clé publique ML-KEM qu'une adresse a publiée (`address` peut être `qor1...` ou `0x`). Elle répond `{"address": ..., "found": false}` lorsqu'aucune clé n'est publiée et ajoute sinon `algorithm_id`, `algorithm_name`, `public_key` (hex `0x`) et `registered_height`. Le nœud ne sert l'espace de noms `qor` que là où la liste `api` de sa section `[json-rpc]` dans `app.toml` inclut `qor`.

Observé le 7 novembre 2026 (avant la v3.2.9) :

| Réseau | `rpc_modules` | `qor_getKEMKey` |
| --- | --- | --- |
| Testnet (`https://evm-testnet.qore.host`) | `eth`, `net`, `qor`, `rpc`, `txpool`, `web3` | répond (`found: false` pour une adresse sans clé publiée) |
| Mainnet (`https://evm.qore.host`) | `eth`, `net`, `rpc`, `txpool`, `web3` | `-32601` (le point de terminaison mainnet public ne liste pas `qor`) |

À cette date, le testnet renvoyait `-32601` pour chaque autre méthode `qor_` vérifiée (`qor_getPQCKeyStatus`, `qor_getHybridSignatureMode`, `qor_getAIStats`, `qor_getBurnStats`) ; à partir de la v3.2.9, elles répondent sur le testnet, comme l'indique la note en haut de cette page.

Vous pouvez vérifier vous-même la liste des espaces de noms :

```bash
curl -s -X POST https://evm.qore.host \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"rpc_modules","params":[],"id":1}'
```

```json
{"jsonrpc":"2.0","id":1,"result":{"eth":"1.0","net":"1.0","rpc":"1.0","txpool":"1.0","web3":"1.0"}}
```

---

## Les autres méthodes et ce qu'il faut utiliser sur le mainnet

| Méthode prévue                | Ce qu'il faut utiliser aujourd'hui |
| ----------------------------- | ----------------- |
| `qor_getPQCKeyStatus`         | `GET /qorechain/pqc/v1/account/{address}` (`found`, `account.key_type`, `account.created_at_height`). Voir [Points de terminaison REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module). |
| `qor_getHybridSignatureMode`  | Aucune route REST publique ; `qorechaind query pqc hybrid-mode` (ou `query pqc params`) sur un nœud ou avec `--node https://rpc.qore.host:443`. |
| Statistiques IA (prévu ; nom de méthode non définitif) | gRPC `qorechain.ai.v1.Query/Stats` sur un nœud que vous exploitez, ou `qorechaind query ai stats` ; pas de route REST. |
| `qor_getCrossVMMessage`       | gRPC `qorechain.crossvm.v1.Query/Message` sur un nœud que vous exploitez ; pas de route REST. |
| `qor_getReputationScore`      | Aucune route de requête publique (le module de réputation n'expose que `Params` en gRPC). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` et `anchor/{layer_id}`. Voir [Module Multilayer](/api-reference/rest-grpc-endpoints#multilayer-module). |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. Voir [Module Bridge](/api-reference/rest-grpc-endpoints#bridge-module). Le pont n'est pas encore en service. |
| `qor_getRLAgentStatus`, `qor_getRLObservation`, `qor_getRLReward` | À partir de la v3.2.6 (les deux réseaux) : `GET /qorechain/rlconsensus/v1/agent`, `/observation` et `/reward` (aussi `/params`, `/policy`, `/applied_params`, `/last_action`) ; voir [Module RL Consensus](/api-reference/rest-grpc-endpoints#rlconsensus-module). Les routes ont répondu `200` sur l'hôte mainnet public le 4 novembre 2026 ; sur un nœud antérieur à la v3.2.6, elles répondent `501` et le service gRPC `qorechain.rlconsensus.v1.Query` (`AgentStatus`, `Observation`, `Reward`) est le moyen de les lire. |
| `qor_getPoolClassification`   | Aucune route de requête publique. |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`. Voir [Module Burn](/api-reference/rest-grpc-endpoints#burn-module). |
| `qor_getXQOREPosition`        | Aucune. xQORE n'est pas en service (voir [Staking xQORE](/user-guide/xqore-staking)). |
| `qor_getInflationRate`        | `GET /qorechain/inflation/v1/params` et `/epoch_info` (mode d'émission, montant par époque, plafond, progression ; servi depuis la v3.2.2). Voir [Module Inflation](/api-reference/rest-grpc-endpoints#inflation-module). |
| `qor_getTokenomicsOverview`   | Combinez `GET /qorechain/burn/v1/stats`, `GET /qorechain/inflation/v1/epoch_info` et `GET /cosmos/bank/v1beta1/supply`. |
| `qor_getRollupStatus`, `qor_listRollups`, `qor_getSettlementBatch`, `qor_getDABlobStatus` | `GET /qorechain/rdk/v1/rollup/{id}`, `/rollups`, `/batch/{id}/{index}`, `/latest_batch/{id}`, `/batches/{id}`, `/blob/{id}/{index}` (servi depuis la v3.2.2 ; voir [Module RDK](/api-reference/rest-grpc-endpoints#rdk-module)), ou `qorechaind query rdk`. |
| `qor_suggestRollupProfile`    | Aucun service public ; voir [Profils prédéfinis](/rollups/preset-profiles). |
| `qor_getBTCStakingPosition`   | Aucune. Le module de restaking BTC n'a pas encore de service de requête. |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`. Les comptes abstraits sont désactivés sur le mainnet et activés sur le testnet (vérifié le 27 octobre 2026). |
| `qor_getGasAbstractionConfig` | `GET /qorechain/gasabstraction/v1/config` (servi depuis la v3.2.2). Voir [Module Gas Abstraction](/api-reference/rest-grpc-endpoints#gas-abstraction-module). |
| `qor_getFairBlockStatus`, `qor_getLaneConfiguration` | Aucune. |

Pour l'état d'un compte sur la voie EVM (clé PQC enregistrée, fenêtre d'autorisation et consentement EIP-7702), utilisez `GET /qorechain/pqc/v1/account/{address}`, `GET /qorechain/pqc/v1/evm_window/{address}` et `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`. La route de statut est `account` au **singulier** ; le pluriel `/accounts/` n'est pas servi et répond `501`.

---

## Codes d'erreur

Les erreurs suivent les codes standard de JSON-RPC 2.0. Aujourd'hui, les appels à une méthode `qor_` prévue échouent avec `-32601`, et sur le point de terminaison mainnet `qor_getKEMKey` aussi.

| Code   | Message          | Description                           |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | Requête JSON-RPC mal formée           |
| -32601 | Method not found | La méthode n'existe pas, ou le nœud ne sert pas l'espace de noms `qor_` (toutes les méthodes prévues aujourd'hui ; `qor_getKEMKey` aussi là où `qor` n'est pas activé) |
| -32602 | Invalid params   | Paramètres manquants ou invalides     |
| -32603 | Internal error   | Erreur de traitement côté serveur     |
