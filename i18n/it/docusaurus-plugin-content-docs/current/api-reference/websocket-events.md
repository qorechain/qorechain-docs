---
slug: /api-reference/websocket-events
title: Eventi WebSocket
sidebar_label: Eventi WebSocket
sidebar_position: 5
---

# Eventi WebSocket

QoreChain fornisce lo streaming di eventi in tempo reale attraverso due interfacce WebSocket: il WebSocket compatibile con EVM e il WebSocket RPC del Consensus Engine di QoreChain.

:::note
Il WebSocket RPC del consensus engine è disponibile pubblicamente sia sulla mainnet **`qorechain-vladi`** sia sulla testnet **`qorechain-diana`**. Il WebSocket EVM è disponibile pubblicamente **solo sulla testnet**: non esiste un WebSocket EVM pubblico sulla mainnet (`wss://evm.qore.host` e `wss://evm-ws.qore.host` non accettano connessioni WebSocket), quindi sulla mainnet eseguite un vostro nodo per usare `eth_subscribe`. Gli endpoint locali riportati di seguito presuppongono un nodo gestito da voi stessi.

| Interfaccia | Mainnet | Testnet |
| ----------- | ------- | ------- |
| WebSocket RPC | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| WebSocket EVM | nessuno (solo nodo proprio) | `wss://evm-ws-testnet.qore.host` |
:::

---

## WebSocket EVM

**Endpoint:** `ws://localhost:8546` sul vostro nodo; testnet pubblica: `wss://evm-ws-testnet.qore.host`. Non esiste un WebSocket EVM pubblico sulla mainnet.

Il WebSocket EVM supporta il metodo standard `eth_subscribe` per lo streaming di eventi in tempo reale, compatibile con gli strumenti dell'ecosistema Ethereum.

### Tipi di sottoscrizione

| Sottoscrizione            | Descrizione                                              |
| ------------------------ | --------------------------------------------------------- |
| `newHeads`               | Emette un header ogni volta che viene aggiunto un nuovo blocco |
| `logs`                   | Emette i log corrispondenti a un filtro opzionale          |
| `newPendingTransactions` | Emette gli hash delle transazioni in ingresso nel mempool  |

La sottoscrizione `syncing` non è implementata: `eth_subscribe` con `"syncing"` restituisce `-32600 syncing subscription is not implemented`. Interrogate invece `eth_syncing` via HTTP.

### Sottoscrivere i nuovi blocchi

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### Sottoscrivere i log con filtro

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

### Annullare la sottoscrizione

```json
{
  "jsonrpc": "2.0",
  "method": "eth_unsubscribe",
  "params": ["0x1a2b3c..."],
  "id": 3
}
```

---

## WebSocket RPC di QoreChain

**Endpoint:** `ws://localhost:26657/websocket` sul vostro nodo; pubblici: `wss://rpc.qore.host/websocket` (mainnet) e `wss://rpc-testnet.qore.host/websocket` (testnet).

Il WebSocket RPC utilizza il sistema di sottoscrizione eventi del Consensus Engine di QoreChain. I client si sottoscrivono con una stringa di query che filtra gli eventi per tipo e attributi.

### Sottoscrivere tutti i nuovi blocchi

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

### Sottoscrivere tutte le transazioni

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

### Sottoscrivere eventi specifici di un modulo

Filtrate per tipo di evento per ricevere solo gli eventi provenienti da un modulo specifico:

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

### Annullare la sottoscrizione

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

## Riferimento agli eventi dei moduli

Gli eventi vengono emessi come eventi standard del consensus engine. Sottoscrivetevi con una query `tm.event='Tx'` filtrata sul tipo di evento e sull'attributo (ad esempio `tm.event='Tx' AND bridge_deposit.chain EXISTS`). Gli eventi a livello di blocco (quelli emessi dalla logica di fine blocco, come gli eventi PRISM qui sotto) vengono consegnati con `tm.event='NewBlock'`, non con `Tx`. I nomi e gli attributi riportati di seguito sono quelli della versione della chain v3.2.5 (mainnet dal 29 ottobre 2026, testnet dal 26 ottobre 2026) (l'elenco degli eventi è invariato rispetto alla v3.2.4); gli eventi aggiunti nella v3.2.4 sono contrassegnati. La testnet (v3.2.6) emette un evento in più, `rl_action_proposed`, elencato insieme agli eventi PRISM.

:::note Quali eventi vedrete davvero
Molti di questi moduli sono inattivi sulle reti pubbliche: il bridge non è attivo, non è ancora registrato alcun layer multilayer né alcun rollup, e xQORE non è utilizzabile. I loro eventi sono definiti ma non vengono emessi finché non c'è attività. Gli eventi di osservazione e di ricompensa PRISM (`rl_observation_collected`, `rl_reward_computed`) vengono emessi circa ogni 10 blocchi su entrambe le reti; sulla testnet (v3.2.6) l'agente emette anche `rl_action_proposed` a ogni passo.
:::

### Modulo PQC

| Tipo di evento              | Attributi chiave                                     | Descrizione                                          |
| --------------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `pqc_verify`                | `address`, `key_type`, `algorithm_id`, `hybrid_mode`, `status` | Emesso a ogni verifica di firma PQC |
| `pqc_hybrid_verify`         | `address`, `algorithm_id`, `status`                       | Emesso a ogni verifica di firma ibrida                |
| `pqc_hybrid_classical_only` | `address`, `hybrid_mode`                                  | Emesso quando una firma solo classica viene accettata dalla modalità corrente |
| `pqc_key_registered`        | `address`, `key_type`, `algorithm_id`                     | Emesso quando una chiave PQC viene registrata |
| `pqc_key_rotated`           | `address`, `algorithm_id`                                 | Emesso quando una chiave PQC viene ruotata |
| `pqc_key_migrated`          | `address`, `from_algorithm`, `to_algorithm`               | Emesso quando una chiave viene migrata a un nuovo algoritmo |
| `pqc_evm_window_opened`     | `address`, `expiry_height`, `max_txs`, `max_value`; `native_only` e `allowed_targets` quando la finestra ha un ambito (v3.2.3) | Emesso quando si apre una finestra di autorizzazione della corsia EVM |
| `pqc_evm_window_closed`     | `address`                                                 | Emesso quando si chiude una finestra di autorizzazione della corsia EVM |
| `pqc_evm_delegation_consent` | `address`, `delegate`, `expiry_height`                   | Emesso quando un account registra il proprio consenso a una delega EIP-7702 (v3.2.2) |
| `pqc_evm_delegation_cleared` | `address`, `delegate`                                    | Emesso quando la delega EIP-7702 di un account viene cancellata (v3.2.2) |
| `pqc_algorithm_registered`, `pqc_algorithm_status_updated`, `pqc_algorithm_disabled` | `algorithm_id`, e `name`/`category`, `old_status`/`new_status` oppure `reason` | Modifiche al registro degli algoritmi effettuate dalla governance |

Le chiavi PQC vengono registrate esplicitamente con una transazione di registrazione; non esiste alcun evento di registrazione automatica.

### Modulo Bridge

| Tipo di evento                | Attributi chiave                                         | Descrizione                                  |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `bridge_deposit`              | `operation_id`, `chain`, `asset`, `amount`, `sender`     | Emesso quando viene registrato un deposito in ingresso |
| `bridge_withdraw`             | `operation_id`, `chain`, `asset`, `amount`, `sender`, `receiver` | Emesso quando viene registrato un prelievo |
| `bridge_attestation`          | `operation_id`, `validator`, `chain`, `pqc_verified`, `attestations` | Emesso per ogni attestazione di un validatore |
| `bridge_operation_executed`   | `operation_id`, `status`                                 | Emesso quando un'operazione si completa |
| `bridge_circuit_breaker_trip` | `chain`, `status`, `reason`                              | Emesso quando scatta il circuit breaker del bridge di una chain |

### Modulo Cross-VM

| Tipo di evento     | Attributi chiave                                                            | Descrizione                                           |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender`         | Emesso quando viene avviata una chiamata cross-VM |
| `crossvm_response` | `message_id`, `status`                                                      | Emesso quando una chiamata cross-VM si completa |
| `crossvm_timeout`  | `message_id`                                                                | Emesso quando un messaggio cross-VM supera il timeout di coda |

### Modulo Multilayer

| Tipo di evento          | Attributi chiave                                                                             | Descrizione                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `state_anchored`        | `layer_id`, `layer_height`, `state_root`, `main_chain_height`, `pqc_verified`, `transaction_count` | Emesso quando un anchor di stato del layer viene accettato |
| `anchor_challenged`     | `layer_id`, `layer_height`, `challenger`, `challenge_reason`, `resolution`                   | Emesso quando un anchor viene contestato |
| `layer_status_updated`  | `layer_id`, `status`, `reason`                                                               | Emesso quando un layer cambia stato |
| `sidechain_registered`, `paychain_registered` | `layer_id`, `layer_type`, `creator`, `status`                          | Emesso quando un layer viene registrato |
| `transaction_routed`    | `selected_layer`, `routing_reason`, `gas_savings`, `latency_ms`, `sender`                    | Emesso quando una transazione viene instradata a un layer |

### Modulo RDK

| Tipo di evento    | Attributi chiave                                            | Descrizione                                      |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `creator`, `profile`, `settlement_mode`        | Emesso quando viene registrato un nuovo rollup |
| `rollup_paused`, `rollup_resumed`, `rollup_stopped` | `rollup_id` e un motivo, se indicato | Emesso quando un rollup viene messo in pausa, ripreso o fermato |
| `batch_challenged`, `challenge_resolved`, `batch_rejected` | `rollup_id`, `batch_index` (e `fraud_upheld` in una risoluzione) | Emesso quando un batch viene contestato, la contestazione viene risolta o un batch viene rifiutato |
| `batch_submitted` | `rollup_id`, `batch_index`, `tx_count`                      | Emesso quando viene inviato un batch di settlement |
| `batch_finalized` | `rollup_id`, `batch_index`                                  | Emesso quando un batch supera la finestra di contestazione |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `backend`, `size`                | Emesso quando un blob DA viene memorizzato |
| `da_blob_pruned`  | `rollup_id`, `blob_index`                                   | Emesso quando un blob DA viene eliminato dopo il periodo di conservazione |

### Modulo Burn

| Tipo di evento           | Attributi chiave                                          | Descrizione                                         |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------- |
| `burn`                   | `source`, `amount`                                        | Emesso quando i token vengono bruciati in modo permanente |
| `milestone_burn`         | `tx_threshold`, `burn_amount`, `cumulative_tx_count`      | Emesso quando viene eseguito un burn per traguardo del numero di transazioni |
| `burn_stranded_released` | `amount`, `destination`, `remaining`                      | Emesso quando la governance rilascia una parte della quota bloccata degli staker |

### Moduli Inflation, Gas Abstraction, Licence, Light Node e AI

| Tipo di evento | Attributi chiave | Descrizione |
| ---------- | -------------- | ----------- |
| `inflation_params_updated` | `mode`, `fixed_epoch_emission`, `max_total_emission` | Emesso quando la governance modifica i parametri di emissione |
| `gas_abstraction_conversion`, `gas_abstraction_refill` | `paid`, `native_equivalent`, `rate`, `price_source`, `result` | Emesso quando una commissione in un altro token accettato viene convertita, e quando il float viene rifornito (nessuno viene emesso finché è accettato solo `uqor`) |
| `gas_abstraction_float_funded`, `gas_abstraction_config_updated` | `sender`, `amount`; `accepted_tokens`, `block_conversion_cap` | Emesso quando il float viene finanziato e quando la governance aggiorna la configurazione |
| `license_granted`, `license_revoked`, `license_suspended`, `license_resumed`, `license_expired` | beneficiario e funzionalità | Ciclo di vita della licenza |
| `license_authority_updated` | `new_authority` | Emesso quando la governance sostituisce l'autorità di licenza (v3.2.3) |
| `lightnode_register`, `lightnode_heartbeat`, `lightnode_claim_rewards`, `lightnode_deregister`, `lightnode_status_change`, `lightnode_reward_distribution`, `lightnode_reserve_release` | `address`, `node_type`, `status`, `reward_amount`, `destination` | Eventi del ciclo di vita e delle ricompense dei light node |
| `ai_config_updated` | `max_tx_per_minute`, `max_evm_tx_per_minute`, `anomaly_action`, `anomaly_threshold` | Emesso quando la governance aggiorna la configurazione dello screening AI |

### Modulo Staking Tiers (v3.2.4)

Questi eventi arrivano con la release v3.2.4: la testnet `qorechain-diana` li emette dal 19 ottobre 2026 e la mainnet dal 23 ottobre 2026 (proposta di governance 13, altezza 3.742.566). Un nodo con una release precedente non ha il modulo staking-tiers e non ne emette nessuno.

| Tipo di evento | Attributi chiave | Descrizione |
| ---------- | -------------- | ----------- |
| `staking_tier_lock_created` | `lock_id`, `delegator`, `validator`, `amount`, `months`, `end_time` | È stato creato un lock di delega |
| `staking_tier_lock_unlocked_early`, `staking_tier_lock_released` | `lock_id`, `delegator`, `penalty_burned`, `bonus_forfeited` | Un lock è stato terminato in anticipo (la penale viene bruciata sotto la sorgente di burn `staking_tier_penalty`), oppure ha raggiunto la sua fine |
| `staking_tier_bonus_claimed`, `staking_tier_bonus_settled` | `delegator`, `amount`; totali del settlement | Un bonus è stato riscosso; il pool è stato regolato |
| `staking_tier_params_updated` | parametri | La governance ha modificato i parametri del modulo |

### Modulo xQORE

Questi eventi non vengono ancora emessi: xQORE non è attivo in nessuna build del nodo rilasciata (vedi [Staking xQORE](/user-guide/xqore-staking)).

| Tipo di evento | Attributi chiave                                                      | Descrizione                              |
| -------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| `xqore_lock`   | `owner`, `amount`                                                     | Emesso quando QOR viene bloccato in xQORE |
| `xqore_unlock` | `owner`, `amount`, `penalty`, `burned`, `redistributed`, `returned`   | Emesso quando xQORE viene sbloccato e riconvertito in QOR |

### Modulo PRISM Consensus (RL Consensus)

Questi sono eventi di fine blocco, consegnati sul flusso `NewBlock`.

| Tipo di evento                 | Attributi chiave        | Descrizione                                                   |
| ------------------------------ | ----------------------- | ------------------------------------------------------------- |
| `rl_observation_collected`     | `height`                | Emesso quando viene effettuata un'osservazione PRISM (circa ogni 10 blocchi) |
| `rl_reward_computed`           | `height`, `reward`      | Emesso quando viene calcolata la ricompensa PRISM |
| `rl_action_proposed`           | `height`, `agent_mode`, `applied`, `block_time_delta`, `gas_price_delta`, `validator_set_size_delta`, `pool_weight_rpos_delta`, `pool_weight_dpos_delta` | **v3.2.6 (solo testnet).** Emesso a ogni passo dell'agente in ogni modalità, con l'azione proposta; `applied` è `false` in modalità shadow. La mainnet non lo emette finché non applica quella release |
| `rl_action_applied`            | `height`, `agent_mode`  | Emesso quando l'agente PRISM applica una regolazione di parametro |
| `rl_agent_mode_changed`        | `height`, `agent_mode`  | Emesso quando cambia la modalità dell'agente |
| `rl_circuit_breaker_triggered` | `height`                | Emesso quando il circuit breaker PRISM blocca un'azione |
| `rl_circuit_breaker_recovered` | `height`                | Emesso quando il circuit breaker si ripristina |

### Modulo AI

| Tipo di evento     | Attributi chiave                                 | Descrizione                                         |
| ------------------ | ------------------------------------------------ | --------------------------------------------------- |
| `ai_anomaly_check` | `score_millionths`, `action`, `is_anomalous`     | Emesso per ogni transazione con punteggio di anomalia |

---

## Esempio di client JavaScript

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

### WebSocket RPC di QoreChain (nativo)

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

## Note

- **Limiti di connessione**: su un nodo gestito da voi stessi, il numero massimo predefinito di connessioni WebSocket è illimitato (`max-open-connections = 0`). Impostate un limite in `app.toml` per gli ambienti di produzione. Gli endpoint pubblici applicano limiti propri.
- **Buffer degli eventi**: il WebSocket RPC memorizza in buffer un numero limitato di eventi per sottoscrizione (200 per impostazione predefinita su un nodo self-hosted). Se il client rimane indietro, gli eventi più vecchi vengono scartati.
- **Riconnessione**: i client dovrebbero implementare la riconnessione automatica con backoff esponenziale, poiché le connessioni WebSocket possono essere interrotte durante i riavvii o gli aggiornamenti del nodo.
