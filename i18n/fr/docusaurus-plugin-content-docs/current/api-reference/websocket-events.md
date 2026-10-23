---
slug: /api-reference/websocket-events
title: Événements WebSocket
sidebar_label: Événements WebSocket
sidebar_position: 5
---

# Événements WebSocket

QoreChain fournit un flux d'événements en temps réel via deux interfaces WebSocket : le WebSocket compatible EVM et le WebSocket RPC du moteur de consensus QoreChain.

:::note
Le WebSocket RPC du moteur de consensus est disponible publiquement sur le mainnet **`qorechain-vladi`** et sur le testnet **`qorechain-diana`**. Le WebSocket EVM n'est disponible publiquement que sur le **testnet** : il n'existe pas de WebSocket EVM public sur le mainnet (`wss://evm.qore.host` et `wss://evm-ws.qore.host` n'acceptent pas les connexions WebSocket) ; sur le mainnet, exécutez donc votre propre nœud pour utiliser `eth_subscribe`. Les points de terminaison locaux ci-dessous supposent un nœud que vous exécutez vous-même.

| Interface | Mainnet | Testnet |
| --------- | ------- | ------- |
| WebSocket RPC | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| WebSocket EVM | aucun (nœud personnel uniquement) | `wss://evm-ws-testnet.qore.host` |
:::

---

## WebSocket EVM

**Point de terminaison :** `ws://localhost:8546` sur votre propre nœud ; testnet public : `wss://evm-ws-testnet.qore.host`. Il n'existe pas de WebSocket EVM public sur le mainnet.

Le WebSocket EVM prend en charge la méthode standard `eth_subscribe` pour le flux d'événements en temps réel, compatible avec les outils Ethereum.

### Types d'abonnement

| Abonnement                | Description                                              |
| -------------------------- | ---------------------------------------------------------- |
| `newHeads`               | Émet un en-tête à chaque ajout d'un nouveau bloc |
| `logs`                   | Émet les logs correspondant à un filtre optionnel |
| `newPendingTransactions` | Émet les hachages de transaction entrant dans le mempool |

L'abonnement `syncing` n'est pas implémenté : `eth_subscribe` avec `"syncing"` renvoie `-32600 syncing subscription is not implemented`. Interrogez plutôt `eth_syncing` via HTTP.

### S'abonner aux nouveaux blocs

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### S'abonner aux logs avec filtre

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": [
    "logs",
    {
      "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
      "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]
    }
  ],
  "id": 2
}
```

### Se désabonner

```json
{
  "jsonrpc": "2.0",
  "method": "eth_unsubscribe",
  "params": ["0x1a2b3c..."],
  "id": 3
}
```

---

## WebSocket RPC QoreChain

**Point de terminaison :** `ws://localhost:26657/websocket` sur votre propre nœud ; public : `wss://rpc.qore.host/websocket` (mainnet) et `wss://rpc-testnet.qore.host/websocket` (testnet).

Le WebSocket RPC utilise le système d'abonnement aux événements du moteur de consensus QoreChain. Les clients s'abonnent avec une chaîne de requête qui filtre les événements par type et par attributs.

### S'abonner à tous les nouveaux blocs

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='NewBlock'"
  },
  "id": 1
}
```

### S'abonner à toutes les transactions

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='Tx'"
  },
  "id": 2
}
```

### S'abonner à des événements spécifiques à un module

Filtrez par type d'événement pour ne recevoir que les événements d'un module spécifique :

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='Tx' AND bridge_deposit.chain EXISTS"
  },
  "id": 3
}
```

### Se désabonner

```json
{
  "jsonrpc": "2.0",
  "method": "unsubscribe",
  "params": {
    "query": "tm.event='NewBlock'"
  },
  "id": 4
}
```

---

## Référence des événements de module

Les événements sont émis comme des événements standard du moteur de consensus. Abonnez-vous avec une requête `tm.event='Tx'` filtrée sur le type d'événement et l'attribut (par exemple `tm.event='Tx' AND bridge_deposit.chain EXISTS`). Les événements au niveau du bloc (ceux émis par la logique de fin de bloc, comme les événements PRISM ci-dessous) sont délivrés avec `tm.event='NewBlock'`, et non `Tx`. Les noms et attributs ci-dessous sont ceux de la version de chaîne v3.2.4 (mainnet depuis le 23 octobre 2026, testnet depuis le 19 octobre 2026) ; les événements ajoutés dans la v3.2.4 sont signalés.

:::note Quels événements verrez-vous réellement
Beaucoup de ces modules sont inactifs sur les réseaux publics : le bridge n'est pas en production, aucune couche multilayer ni aucun rollup n'est encore enregistré, et xQORE n'est pas utilisable. Leurs événements sont définis mais ne se déclenchent pas tant qu'il n'y a pas d'activité. Les événements d'observation et de récompense PRISM (`rl_observation_collected`, `rl_reward_computed`) sont émis environ tous les 10 blocs sur les deux réseaux.
:::

### Module PQC

| Type d'événement           | Attributs clés                                       | Description                                        |
| --------------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `pqc_verify`                | `address`, `key_type`, `algorithm_id`, `hybrid_mode`, `status` | Émis à chaque vérification de signature PQC |
| `pqc_hybrid_verify`         | `address`, `algorithm_id`, `status`                       | Émis à chaque vérification de signature hybride        |
| `pqc_hybrid_classical_only` | `address`, `hybrid_mode`                                  | Émis lorsqu'une signature uniquement classique est acceptée par le mode actuel |
| `pqc_key_registered`        | `address`, `key_type`, `algorithm_id`                     | Émis lorsqu'une clé PQC est enregistrée                 |
| `pqc_key_rotated`           | `address`, `algorithm_id`                                 | Émis lorsqu'une clé PQC est renouvelée                    |
| `pqc_key_migrated`          | `address`, `from_algorithm`, `to_algorithm`               | Émis lorsqu'une clé est migrée vers un nouvel algorithme    |
| `pqc_evm_window_opened`     | `address`, `expiry_height`, `max_txs`, `max_value` ; `native_only` et `allowed_targets` lorsque la fenêtre a une portée (v3.2.3) | Émis lorsqu'une fenêtre d'autorisation de la voie EVM s'ouvre  |
| `pqc_evm_window_closed`     | `address`                                                 | Émis lorsqu'une fenêtre d'autorisation de la voie EVM se ferme |
| `pqc_evm_delegation_consent` | `address`, `delegate`, `expiry_height`                   | Émis lorsqu'un compte enregistre son consentement à une délégation EIP-7702 (v3.2.2) |
| `pqc_evm_delegation_cleared` | `address`, `delegate`                                    | Émis lorsque la délégation EIP-7702 d'un compte est effacée (v3.2.2) |
| `pqc_algorithm_registered`, `pqc_algorithm_status_updated`, `pqc_algorithm_disabled` | `algorithm_id`, et `name`/`category`, `old_status`/`new_status` ou `reason` | Modifications du registre d'algorithmes effectuées par la gouvernance |

Les clés PQC sont enregistrées explicitement par une transaction d'enregistrement ; il n'existe pas d'événement d'enregistrement automatique.

### Module Bridge

| Type d'événement              | Attributs clés                                           | Description                                  |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `bridge_deposit`              | `operation_id`, `chain`, `asset`, `amount`, `sender`     | Émis lorsqu'un dépôt entrant est enregistré  |
| `bridge_withdraw`             | `operation_id`, `chain`, `asset`, `amount`, `sender`, `receiver` | Émis lorsqu'un retrait est enregistré |
| `bridge_attestation`          | `operation_id`, `validator`, `chain`, `pqc_verified`, `attestations` | Émis pour chaque attestation de validateur |
| `bridge_operation_executed`   | `operation_id`, `status`                                 | Émis lorsqu'une opération est terminée          |
| `bridge_circuit_breaker_trip` | `chain`, `status`, `reason`                              | Émis lorsque le coupe-circuit du bridge d'une chaîne se déclenche |

### Module Cross-VM

| Type d'événement   | Attributs clés                                                              | Description                                           |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender`         | Émis lorsqu'un appel cross-VM est initié             |
| `crossvm_response` | `message_id`, `status`                                                      | Émis lorsqu'un appel cross-VM est terminé                |
| `crossvm_timeout`  | `message_id`                                                                | Émis lorsqu'un message cross-VM dépasse le délai d'attente en file |

### Module Multilayer

| Type d'événement        | Attributs clés                                                                               | Description                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `state_anchored`        | `layer_id`, `layer_height`, `state_root`, `main_chain_height`, `pqc_verified`, `transaction_count` | Émis lorsqu'un ancrage d'état de couche est accepté |
| `anchor_challenged`     | `layer_id`, `layer_height`, `challenger`, `challenge_reason`, `resolution`                   | Émis lorsqu'un ancrage est contesté         |
| `layer_status_updated`  | `layer_id`, `status`, `reason`                                                               | Émis lorsqu'une couche change de statut          |
| `sidechain_registered`, `paychain_registered` | `layer_id`, `layer_type`, `creator`, `status`                          | Émis lorsqu'une couche est enregistrée           |
| `transaction_routed`    | `selected_layer`, `routing_reason`, `gas_savings`, `latency_ms`, `sender`                    | Émis lorsqu'une transaction est acheminée vers une couche |

### Module RDK

| Type d'événement  | Attributs clés                                              | Description                                      |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `creator`, `profile`, `settlement_mode`        | Émis lorsqu'un nouveau rollup est enregistré          |
| `rollup_paused`, `rollup_resumed`, `rollup_stopped` | `rollup_id` et un motif lorsqu'il est fourni | Émis lorsqu'un rollup est mis en pause, repris ou arrêté |
| `batch_challenged`, `challenge_resolved`, `batch_rejected` | `rollup_id`, `batch_index` (et `fraud_upheld` lors d'une résolution) | Émis lorsqu'un lot est contesté, que la contestation est résolue, ou qu'un lot est rejeté |
| `batch_submitted` | `rollup_id`, `batch_index`, `tx_count`                      | Émis lorsqu'un lot de règlement est soumis     |
| `batch_finalized` | `rollup_id`, `batch_index`                                  | Émis lorsqu'un lot franchit sa fenêtre de contestation |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `backend`, `size`                | Émis lorsqu'un blob DA est stocké                 |
| `da_blob_pruned`  | `rollup_id`, `blob_index`                                   | Émis lorsqu'un blob DA est purgé après rétention |

### Module Burn

| Type d'événement         | Attributs clés                                            | Description                                         |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------- |
| `burn`                   | `source`, `amount`                                        | Émis lorsque des jetons sont brûlés définitivement          |
| `milestone_burn`         | `tx_threshold`, `burn_amount`, `cumulative_tx_count`      | Émis lorsqu'un burn par palier du nombre de transactions est exécuté |
| `burn_stranded_released` | `amount`, `destination`, `remaining`                      | Émis lorsque la gouvernance libère une partie de la part bloquée des stakers |

### Modules Inflation, Gas Abstraction, Licence, Light Node et IA

| Type d'événement | Attributs clés | Description |
| ---------- | -------------- | ----------- |
| `inflation_params_updated` | `mode`, `fixed_epoch_emission`, `max_total_emission` | Émis lorsque la gouvernance modifie les paramètres d'émission |
| `gas_abstraction_conversion`, `gas_abstraction_refill` | `paid`, `native_equivalent`, `rate`, `price_source`, `result` | Émis lorsque des frais payés dans un autre token accepté sont convertis, et lorsque le float est réapprovisionné (aucun ne se déclenche tant que seul l'`uqor` est accepté) |
| `gas_abstraction_float_funded`, `gas_abstraction_config_updated` | `sender`, `amount` ; `accepted_tokens`, `block_conversion_cap` | Émis lorsque le float est alimenté et lorsque la gouvernance met à jour la configuration |
| `license_granted`, `license_revoked`, `license_suspended`, `license_resumed`, `license_expired` | bénéficiaire et fonctionnalité | Cycle de vie des licences |
| `license_authority_updated` | `new_authority` | Émis lorsque la gouvernance remplace l'autorité de licence (v3.2.3) |
| `lightnode_register`, `lightnode_heartbeat`, `lightnode_claim_rewards`, `lightnode_deregister`, `lightnode_status_change`, `lightnode_reward_distribution`, `lightnode_reserve_release` | `address`, `node_type`, `status`, `reward_amount`, `destination` | Événements du cycle de vie et des récompenses des light nodes |
| `ai_config_updated` | `max_tx_per_minute`, `max_evm_tx_per_minute`, `anomaly_action`, `anomaly_threshold` | Émis lorsque la gouvernance met à jour la configuration du filtrage IA |

### Module Staking Tiers (v3.2.4)

Ces événements viennent avec la version v3.2.4 : le testnet `qorechain-diana` les émet depuis le 19 octobre 2026 et le mainnet depuis le 23 octobre 2026 (proposition de gouvernance 13, hauteur 3 742 566). Un nœud sur une version plus ancienne n'a pas de module staking-tiers et n'en émet aucun.

| Type d'événement | Attributs clés | Description |
| ---------- | -------------- | ----------- |
| `staking_tier_lock_created` | `lock_id`, `delegator`, `validator`, `amount`, `months`, `end_time` | Un verrouillage de délégation a été créé |
| `staking_tier_lock_unlocked_early`, `staking_tier_lock_released` | `lock_id`, `delegator`, `penalty_burned`, `bonus_forfeited` | Un verrouillage a été terminé de façon anticipée (la pénalité est brûlée sous la source de burn `staking_tier_penalty`), ou a atteint son terme |
| `staking_tier_bonus_claimed`, `staking_tier_bonus_settled` | `delegator`, `amount` ; totaux de règlement | Un bonus a été réclamé ; le pool a été réglé |
| `staking_tier_params_updated` | paramètres | La gouvernance a modifié les paramètres du module |

### Module xQORE

Ces événements ne sont pas encore émis : xQORE n'est actif dans aucune version publiée du nœud (voir [Staking xQORE](/user-guide/xqore-staking)).

| Type d'événement | Attributs clés                                                        | Description                              |
| -------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| `xqore_lock`   | `owner`, `amount`                                                     | Émis lorsque du QOR est verrouillé dans xQORE    |
| `xqore_unlock` | `owner`, `amount`, `penalty`, `burned`, `redistributed`, `returned`   | Émis lorsque du xQORE est déverrouillé en QOR |

### Module PRISM Consensus (RL Consensus)

Ce sont des événements de fin de bloc, délivrés sur le flux `NewBlock`.

| Type d'événement               | Attributs clés          | Description                                                   |
| ------------------------------ | ----------------------- | ------------------------------------------------------------- |
| `rl_observation_collected`     | `height`                | Émis lorsqu'une observation PRISM est effectuée (environ tous les 10 blocs) |
| `rl_reward_computed`           | `height`, `reward`      | Émis lorsque la récompense PRISM est calculée                     |
| `rl_action_applied`            | `height`, `agent_mode`  | Émis lorsque l'agent PRISM applique un ajustement de paramètre   |
| `rl_agent_mode_changed`        | `height`, `agent_mode`  | Émis lorsque le mode de l'agent change                           |
| `rl_circuit_breaker_triggered` | `height`                | Émis lorsque le coupe-circuit PRISM bloque une action       |
| `rl_circuit_breaker_recovered` | `height`                | Émis lorsque le coupe-circuit se rétablit                     |

### Module IA

| Type d'événement   | Attributs clés                                   | Description                                         |
| ------------------ | ------------------------------------------------ | --------------------------------------------------- |
| `ai_anomaly_check` | `score_millionths`, `action`, `is_anomalous`     | Émis pour chaque transaction dotée d'un score d'anomalie         |

---

## Exemple de client JavaScript

### WebSocket EVM (ethers.js)

```javascript
import { ethers } from "ethers";

// Own node: ws://localhost:8546. Public testnet: wss://evm-ws-testnet.qore.host
const provider = new ethers.WebSocketProvider("ws://localhost:8546");

// Subscribe to new blocks
provider.on("block", (blockNumber) => {
  console.log("New block:", blockNumber);
});

// Subscribe to contract events
const filter = {
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
  topics: [ethers.id("Transfer(address,address,uint256)")],
};
provider.on(filter, (log) => {
  console.log("Transfer event:", log);
});
```

### WebSocket RPC QoreChain (natif)

```javascript
// Own node: ws://localhost:26657/websocket. Public: wss://rpc.qore.host/websocket
const ws = new WebSocket("ws://localhost:26657/websocket");

ws.onopen = () => {
  // Subscribe to bridge deposits
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "subscribe",
    params: { query: "tm.event='Tx' AND bridge_deposit.chain EXISTS" },
    id: 1,
  }));

  // Subscribe to rollup batch submissions
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "subscribe",
    params: { query: "tm.event='Tx' AND batch_submitted.rollup_id EXISTS" },
    id: 2,
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.result && data.result.events) {
    console.log("Event received:", data.result.events);
  }
};
```

---

## Remarques

- **Limites de connexion** : sur un nœud que vous exécutez vous-même, le nombre maximal de connexions WebSocket est illimité par défaut (`max-open-connections = 0`). Définissez une limite dans `app.toml` pour les déploiements en production. Les points de terminaison publics appliquent leurs propres limites.
- **Tampon d'événements** : le WebSocket RPC met en tampon un nombre borné d'événements par abonnement (200 par défaut sur un nœud auto-hébergé). Si le client prend du retard, les événements les plus anciens sont supprimés.
- **Reconnexion** : les clients doivent implémenter une reconnexion automatique avec backoff exponentiel, car les connexions WebSocket peuvent être interrompues lors des redémarrages ou des mises à niveau du nœud.
