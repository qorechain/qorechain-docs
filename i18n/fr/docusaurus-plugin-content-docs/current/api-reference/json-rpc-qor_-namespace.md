---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — Espace de noms qor_
sidebar_label: JSON-RPC — Espace de noms qor_
sidebar_position: 2
---

# JSON-RPC — Espace de noms qor_

L'espace de noms `qor_` fournit des méthodes JSON-RPC spécifiques à QoreChain pour interroger le statut de la cryptographie post-quantique, les analyses IA, la messagerie inter-VM, l'état multi-couche, les opérations de pont, la tokenomique, l'infrastructure de rollup et l'état du consensus PRISM.

## Connexion

| Transport | Adresse par défaut      |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

L'espace de noms `qor_` est servi aux côtés de `eth_`, `web3_`, `net_` et `txpool_` sur les mêmes ports. Activez-le dans `app.toml` :

```toml
[json-rpc]
api = "eth,web3,net,txpool,qor"
```

:::note
L'espace de noms `qor_` est disponible sur le mainnet **`qorechain-vladi`** (ID de chaîne EVM **9801**, actif sur la version de chaîne **v3.1.82**) et le testnet **`qorechain-diana`** (ID de chaîne EVM **9800**). Les exemples ci-dessous supposent un nœud local ; remplacez par le point de terminaison mainnet ou testnet de votre fournisseur pour un accès distant.
:::

---

## Méthodes

| Méthode                       | Paramètres                              | Description                                              |
| ----------------------------- | --------------------------------------- | -------------------------------------------------------- |
| `qor_getPQCKeyStatus`         | `address` (string)                      | Renvoie le statut d'enregistrement de la clé PQC d'un compte |
| `qor_getHybridSignatureMode`  | aucun                                   | Renvoie le mode d'application actuel des signatures hybrides |
| `qor_getAIStats`              | aucun                                   | Renvoie les statistiques agrégées de traitement du module IA |
| `qor_getCrossVMMessage`       | `messageId` (string)                    | Récupère un message inter-VM par son ID                  |
| `qor_getReputationScore`      | `validator` (string)                    | Renvoie le score de réputation d'une adresse de validateur |
| `qor_getLayerInfo`            | `layerId` (string)                      | Renvoie les métadonnées et le statut d'une couche enregistrée |
| `qor_getBridgeStatus`         | `chainId` (string)                      | Renvoie le statut du pont et les totaux verrouillés pour une chaîne |
| `qor_getRLAgentStatus`        | aucun                                   | Renvoie le mode actuel de l'agent PRISM et son statut opérationnel |
| `qor_getRLObservation`        | aucun                                   | Renvoie le dernier vecteur d'observation PRISM           |
| `qor_getRLReward`             | aucun                                   | Renvoie les métriques de récompense cumulées de PRISM    |
| `qor_getPoolClassification`   | `validator` (string)                    | Renvoie la classification du pool CPoS d'un validateur   |
| `qor_getBurnStats`            | aucun                                   | Renvoie les statistiques de burn sur tous les canaux     |
| `qor_getXQOREPosition`        | `address` (string)                      | Renvoie la position de staking xQORE d'une adresse       |
| `qor_getInflationRate`        | aucun                                   | Renvoie le taux d'inflation annualisé actuel             |
| `qor_getTokenomicsOverview`   | aucun                                   | Renvoie un aperçu combiné du burn, de l'inflation et de l'offre |
| `qor_getRollupStatus`         | `rollupId` (string)                     | Renvoie le statut et la configuration d'un rollup spécifique |
| `qor_listRollups`             | aucun                                   | Renvoie la liste de tous les rollups enregistrés         |
| `qor_getSettlementBatch`      | `rollupId` (string), `batchIndex` (int) | Renvoie un lot de règlement spécifique pour un rollup    |
| `qor_suggestRollupProfile`    | `useCase` (string)                      | Recommandation de profil de rollup assistée par IA pour un cas d'usage |
| `qor_getDABlobStatus`         | `rollupId` (string), `blobIndex` (int)  | Renvoie le statut d'un blob DA spécifique                |
| `qor_getBTCStakingPosition`   | `address` (string)                      | Renvoie la position de staking BTC via le module Babylon |
| `qor_getAbstractAccount`      | `address` (string)                      | Renvoie les détails du compte abstrait et les règles de dépense |
| `qor_getFairBlockStatus`      | aucun                                   | Renvoie le statut et la configuration du chiffrement FairBlock |
| `qor_getGasAbstractionConfig` | aucun                                   | Renvoie les tokens acceptés et les paramètres d'abstraction du gas |
| `qor_getLaneConfiguration`    | aucun                                   | Renvoie la configuration de priorisation des TX à 5 voies |

---

## Exemples

### qor_getBurnStats

**Requête :**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getBurnStats",
    "params": [],
    "id": 1
  }'
```

**Réponse :**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "total_burned": "1250000000",
    "total_distributed": "4750000000",
    "channels": {
      "validator_share": "0.40",
      "burn_share": "0.30",
      "treasury_share": "0.20",
      "staker_share": "0.10"
    },
    "last_block_burned": "342891"
  }
}
```

### qor_getRLAgentStatus

**Requête :**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getRLAgentStatus",
    "params": [],
    "id": 2
  }'
```

**Réponse :**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "agent_mode": "observe",
    "observation_interval": 10,
    "circuit_breaker": {
      "active": false,
      "max_param_change": "0.10",
      "cooldown_blocks": 100
    },
    "last_observation_block": "342885",
    "cumulative_reward": "18.742"
  }
}
```

### qor_getRollupStatus

**Requête :**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getRollupStatus",
    "params": ["rollup-001"],
    "id": 3
  }'
```

**Réponse :**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "rollup_id": "rollup-001",
    "status": "active",
    "settlement_type": "optimistic",
    "operator": "qor1abc123...",
    "total_batches": 147,
    "last_finalized_batch": 145,
    "pending_batches": 2,
    "stake": "10000000000uqor",
    "created_at_height": 100230
  }
}
```

---

## Codes d'erreur

| Code   | Message          | Description                           |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | Requête JSON-RPC mal formée           |
| -32601 | Method not found | La méthode n'existe pas               |
| -32602 | Invalid params   | Paramètres manquants ou invalides     |
| -32603 | Internal error   | Erreur de traitement côté serveur     |
| -32000 | Module disabled  | Le module interrogé n'est pas activé  |
| -32001 | Entity not found | La ressource demandée n'existe pas    |
