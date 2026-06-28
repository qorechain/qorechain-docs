---
slug: /api-reference/websocket-events
title: Événements WebSocket
sidebar_label: Événements WebSocket
sidebar_position: 5
---

# Événements WebSocket

QoreChain fournit un streaming d'événements en temps réel via deux interfaces WebSocket : le WebSocket compatible EVM et le WebSocket RPC du moteur de consensus QoreChain.

:::note
Les deux interfaces WebSocket sont disponibles sur le mainnet **`qorechain-vladi`** (actif sur la version de chaîne **v3.1.80**) et le testnet **`qorechain-diana`**. Les points de terminaison locaux ci-dessous supposent un nœud que vous exécutez vous-même ; remplacez par l'hôte mainnet ou testnet de votre fournisseur pour un accès distant.
:::

---

## WebSocket EVM

**Point de terminaison :** `ws://localhost:8546`

Le WebSocket EVM prend en charge la méthode standard `eth_subscribe` pour le streaming d'événements en temps réel compatible avec les outils Ethereum.

### Types d'abonnement

| Abonnement               | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `newHeads`               | Émet un en-tête à chaque ajout d'un nouveau bloc |
| `logs`                   | Émet les logs correspondant à un filtre optionnel |
| `newPendingTransactions` | Émet les hashs des transactions entrant dans le mempool |
| `syncing`                | Émet les mises à jour du statut de synchronisation |

### S'abonner aux nouveaux blocs

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### S'abonner aux logs avec un filtre

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

**Point de terminaison :** `ws://localhost:26657/websocket`

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

### S'abonner aux événements spécifiques à un module

Filtrez par type d'événement pour ne recevoir que les événements d'un module spécifique :

```json
{
  "jsonrpc": "2.0",
  "method": "subscribe",
  "params": {
    "query": "tm.event='Tx' AND fraud_alert.severity EXISTS"
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

### Module PQC

| Type d'événement           | Attributs clés                                       | Description                                   |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `pqc_hybrid_verify`        | `address`, `algorithm`, `result` (pass/fail), `mode` | Émis à chaque vérification de signature hybride |
| `pqc_hybrid_auto_register` | `address`, `algorithm`, `pubkey_hash`                | Émis lorsqu'une clé PQC est auto-enregistrée  |

### Module IA

| Type d'événement  | Attributs clés                                                      | Description                                      |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| `fraud_alert`     | `severity` (low/medium/high/critical), `address`, `reason`, `score` | Émis lorsqu'une fraude est détectée dans une transaction |
| `circuit_breaker` | `module`, `action` (tripped/reset), `threshold`, `value`            | Émis lorsqu'un disjoncteur IA change d'état      |

### Module Bridge

| Type d'événement       | Attributs clés                                                  | Description                                             |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| `deposit_completed`    | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | Émis lorsqu'un dépôt entrant de pont est confirmé       |
| `withdrawal_completed` | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | Émis lorsqu'un retrait sortant de pont est confirmé     |

### Module Cross-VM

| Type d'événement   | Attributs clés                                                  | Description                                           |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `sender`, `payload_hash` | Émis lorsqu'un appel inter-VM est initié              |
| `crossvm_response` | `message_id`, `source_vm`, `target_vm`, `success`, `gas_used`    | Émis lorsqu'un appel inter-VM se termine              |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`, `queued_at_height`       | Émis lorsqu'un message inter-VM dépasse le délai de file d'attente |

### Module Multilayer

| Type d'événement       | Attributs clés                                                | Description                                     |
| ---------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| `anchor_submitted`     | `layer_id`, `layer_type`, `anchor_hash`, `height`, `submitter` | Émis lorsqu'un ancrage d'état de couche est soumis |
| `layer_status_changed` | `layer_id`, `previous_status`, `new_status`, `reason`          | Émis lorsqu'une couche change de statut opérationnel |

### Module RDK

| Type d'événement  | Attributs clés                                        | Description                                      |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `operator`, `settlement_type`, `profile` | Émis lorsqu'un nouveau rollup est enregistré     |
| `batch_submitted` | `rollup_id`, `batch_index`, `state_root`, `tx_count`  | Émis lorsqu'un lot de règlement est soumis       |
| `batch_finalized` | `rollup_id`, `batch_index`, `finalized_at_height`     | Émis lorsqu'un lot passe sa fenêtre de contestation |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `size_bytes`, `commitment` | Émis lorsqu'un blob DA est stocké                |
| `da_blob_pruned`  | `rollup_id`, `blob_index`, `pruned_at_height`         | Émis lorsqu'un blob DA est élagué après rétention |

### Module Burn

| Type d'événement  | Attributs clés                                                                      | Description                                 |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| `fee_distributed` | `total_fees`, `validator_amount`, `burn_amount`, `treasury_amount`, `staker_amount` | Émis lorsque les frais collectés sont distribués |
| `tokens_burned`   | `amount`, `channel`, `block_height`                                                 | Émis lorsque des tokens sont brûlés de manière permanente |

### Module xQORE

| Type d'événement | Attributs clés                                                | Description                                |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------ |
| `xqore_locked`   | `address`, `amount`, `lock_duration`, `tier`                   | Émis lorsque du QOR est verrouillé dans xQORE |
| `xqore_unlocked` | `address`, `amount`, `penalty_applied`, `penalty_amount`       | Émis lorsque xQORE est déverrouillé en QOR |
| `pvp_rebase`     | `epoch`, `total_penalty`, `rebase_amount`, `beneficiary_count` | Émis lors de la distribution du rebase PvP |

### Module Inflation

| Type d'événement | Attributs clés                                             | Description                                |
| -------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `epoch_minted` | `epoch`, `minted_amount`, `inflation_rate`, `block_height` | Émis à la fin de chaque époque d'inflation |

### Module RL Consensus

Les ajustements de paramètres PRISM et l'activité des disjoncteurs sont émis via ce module.

| Type d'événement            | Attributs clés                                                 | Description                                                |
| --------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| `rl_action_applied`         | `action_type`, `param_key`, `old_value`, `new_value`, `reward` | Émis lorsque l'agent PRISM applique un ajustement de paramètre |
| `circuit_breaker_triggered` | `reason`, `param_key`, `attempted_value`, `limit`              | Émis lorsque le disjoncteur PRISM bloque une action       |

---

## Exemple de client JavaScript

### WebSocket EVM (ethers.js)

```javascript
import { ethers } from "ethers";

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
const ws = new WebSocket("ws://localhost:26657/websocket");

ws.onopen = () => {
  // Subscribe to fraud alerts
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "subscribe",
    params: { query: "tm.event='Tx' AND fraud_alert.severity EXISTS" },
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

## Notes

- **Limites de connexion** : le nombre maximum de connexions WebSocket par défaut est illimité (`max-open-connections = 0`). Définissez une limite dans `app.toml` pour les déploiements en production.
- **Tampon d'événements** : le WebSocket RPC met en tampon jusqu'à 200 événements par abonnement. Si le client prend du retard, les événements les plus anciens sont supprimés.
- **Reconnexion** : les clients doivent implémenter une reconnexion automatique avec un backoff exponentiel, car les connexions WebSocket peuvent être interrompues lors des redémarrages ou des mises à niveau des nœuds.
