---
slug: /api-reference/websocket-events
title: Evenimente WebSocket
sidebar_label: Evenimente WebSocket
sidebar_position: 5
---

# Evenimente WebSocket

QoreChain oferă transmiterea evenimentelor în timp real prin două interfețe WebSocket: WebSocket-ul compatibil EVM și WebSocket-ul RPC al Motorului de Consens QoreChain.

:::note
WebSocket-ul RPC al motorului de consens este disponibil public atât pe mainnet-ul **`qorechain-vladi`**, cât și pe testnet-ul **`qorechain-diana`**. WebSocket-ul EVM este disponibil public **doar pe testnet**: nu există un WebSocket EVM public pentru mainnet (`wss://evm.qore.host` și `wss://evm-ws.qore.host` nu acceptă conexiuni WebSocket), așa că pe mainnet rulează propriul nod pentru `eth_subscribe`. Endpoint-urile locale de mai jos presupun un nod pe care îl rulezi tu însuți.

| Interfață | Mainnet | Testnet |
| --------- | ------- | ------- |
| RPC WebSocket | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| EVM WebSocket | niciunul (doar nod propriu) | `wss://evm-ws-testnet.qore.host` |
:::

---

## EVM WebSocket

**Endpoint:** `ws://localhost:8546` pe propriul nod; testnet public: `wss://evm-ws-testnet.qore.host`. Nu există un WebSocket EVM public pentru mainnet.

WebSocket-ul EVM suportă metoda standard `eth_subscribe` pentru transmiterea evenimentelor în timp real, compatibilă cu uneltele Ethereum.

### Tipuri de abonare

| Abonament                | Descriere                                          |
| ------------------------ | --------------------------------------------------- |
| `newHeads`               | Emite un antet de fiecare dată când este adăugat un bloc nou |
| `logs`                   | Emite loguri care corespund unui filtru opțional     |
| `newPendingTransactions` | Emite hash-urile tranzacțiilor care intră în mempool |

Abonamentul `syncing` nu este implementat: `eth_subscribe` cu `"syncing"` returnează `-32600 syncing subscription is not implemented`. Interoghează în schimb `eth_syncing` prin HTTP.

### Abonare la blocuri noi

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### Abonare la loguri cu filtru

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

### Dezabonare

```json
{
  "jsonrpc": "2.0",
  "method": "eth_unsubscribe",
  "params": ["0x1a2b3c..."],
  "id": 3
}
```

---

## QoreChain RPC WebSocket

**Endpoint:** `ws://localhost:26657/websocket` pe propriul nod; public: `wss://rpc.qore.host/websocket` (mainnet) și `wss://rpc-testnet.qore.host/websocket` (testnet).

WebSocket-ul RPC folosește sistemul de abonare la evenimente al Motorului de Consens QoreChain. Clienții se abonează folosind un șir de interogare (query) care filtrează evenimentele după tip și atribute.

### Abonare la toate blocurile noi

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

### Abonare la toate tranzacțiile

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

### Abonare la evenimente specifice unui modul

Filtrează după tipul evenimentului pentru a primi doar evenimente dintr-un modul specific:

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

### Dezabonare

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

## Referință evenimente pe module

Evenimentele sunt emise ca evenimente standard ale motorului de consens. Abonează-te cu o interogare `tm.event='Tx'` filtrată după tipul și atributul evenimentului (de exemplu `tm.event='Tx' AND bridge_deposit.chain EXISTS`). Evenimentele la nivel de bloc (cele emise de logica de la sfârșitul blocului, precum evenimentele PRISM de mai jos) sunt livrate cu `tm.event='NewBlock'`, nu cu `Tx`. Numele și atributele de mai jos sunt cele ale versiunii de chain v3.2.3 (mainnet); evenimentele care există doar pe testnet-ul v3.2.4 sunt marcate.

:::note Ce evenimente vei vedea efectiv
Multe dintre aceste module sunt inactive pe rețelele publice: bridge-ul nu este live, nu este încă înregistrat niciun layer multilayer sau rollup, iar xQORE nu poate fi folosit. Evenimentele lor sunt definite, dar nu se declanșează până nu există activitate. Evenimentele de observare și de recompensă PRISM (`rl_observation_collected`, `rl_reward_computed`) sunt emise aproximativ la fiecare 10 blocuri pe ambele rețele.
:::

### Modulul PQC

| Tip eveniment               | Atribute cheie                                            | Descriere                                            |
| --------------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| `pqc_verify`                | `address`, `key_type`, `algorithm_id`, `hybrid_mode`, `status` | Emis la fiecare verificare a unei semnături PQC |
| `pqc_hybrid_verify`         | `address`, `algorithm_id`, `status`                       | Emis la fiecare verificare a semnăturii hibride      |
| `pqc_hybrid_classical_only` | `address`, `hybrid_mode`                                  | Emis atunci când o semnătură doar clasică este acceptată de modul curent |
| `pqc_key_registered`        | `address`, `key_type`, `algorithm_id`                     | Emis atunci când o cheie PQC este înregistrată       |
| `pqc_key_rotated`           | `address`, `algorithm_id`                                 | Emis atunci când o cheie PQC este rotită             |
| `pqc_key_migrated`          | `address`, `from_algorithm`, `to_algorithm`               | Emis atunci când o cheie este migrată către un algoritm nou |
| `pqc_evm_window_opened`     | `address`, `expiry_height`, `max_txs`, `max_value`; `native_only` și `allowed_targets` când fereastra are un domeniu de aplicare (v3.2.3) | Emis atunci când se deschide o fereastră de autorizare pe lane-ul EVM |
| `pqc_evm_window_closed`     | `address`                                                 | Emis atunci când se închide o fereastră de autorizare pe lane-ul EVM |
| `pqc_evm_delegation_consent` | `address`, `delegate`, `expiry_height`                   | Emis atunci când un cont își înregistrează consimțământul pentru o delegare EIP-7702 (v3.2.2) |
| `pqc_evm_delegation_cleared` | `address`, `delegate`                                    | Emis atunci când delegarea EIP-7702 a unui cont este ștearsă (v3.2.2) |
| `pqc_algorithm_registered`, `pqc_algorithm_status_updated`, `pqc_algorithm_disabled` | `algorithm_id`, și `name`/`category`, `old_status`/`new_status` sau `reason` | Modificări ale registrului de algoritmi făcute prin guvernanță |

Cheile PQC se înregistrează explicit printr-o tranzacție de înregistrare; nu există un eveniment de înregistrare automată.

### Modulul Bridge

| Tip eveniment                 | Atribute cheie                                           | Descriere                                    |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `bridge_deposit`              | `operation_id`, `chain`, `asset`, `amount`, `sender`     | Emis atunci când este înregistrat un depozit de intrare |
| `bridge_withdraw`             | `operation_id`, `chain`, `asset`, `amount`, `sender`, `receiver` | Emis atunci când este înregistrată o retragere |
| `bridge_attestation`          | `operation_id`, `validator`, `chain`, `pqc_verified`, `attestations` | Emis pentru fiecare atestare a unui validator |
| `bridge_operation_executed`   | `operation_id`, `status`                                 | Emis atunci când o operațiune se finalizează |
| `bridge_circuit_breaker_trip` | `chain`, `status`, `reason`                              | Emis atunci când se declanșează disjunctorul (circuit breaker) bridge-ului unui chain |

### Modulul Cross-VM

| Tip eveniment      | Atribute cheie                                                              | Descriere                                             |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender`         | Emis atunci când este inițiat un apel cross-VM        |
| `crossvm_response` | `message_id`, `status`                                                      | Emis atunci când un apel cross-VM se finalizează      |
| `crossvm_timeout`  | `message_id`                                                                | Emis atunci când un mesaj cross-VM depășește timpul de așteptare în coadă |

### Modulul Multilayer

| Tip eveniment           | Atribute cheie                                                                               | Descriere                                    |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `state_anchored`        | `layer_id`, `layer_height`, `state_root`, `main_chain_height`, `pqc_verified`, `transaction_count` | Emis atunci când o ancoră a stării unui layer este acceptată |
| `anchor_challenged`     | `layer_id`, `layer_height`, `challenger`, `challenge_reason`, `resolution`                   | Emis atunci când o ancoră este contestată    |
| `layer_status_updated`  | `layer_id`, `status`, `reason`                                                               | Emis atunci când un layer își schimbă starea |
| `sidechain_registered`, `paychain_registered` | `layer_id`, `layer_type`, `creator`, `status`                          | Emis atunci când un layer este înregistrat   |
| `transaction_routed`    | `selected_layer`, `routing_reason`, `gas_savings`, `latency_ms`, `sender`                    | Emis atunci când o tranzacție este direcționată către un layer |

### Modulul RDK

| Tip eveniment     | Atribute cheie                                              | Descriere                                        |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `creator`, `profile`, `settlement_mode`        | Emis atunci când este înregistrat un rollup nou  |
| `rollup_paused`, `rollup_resumed`, `rollup_stopped` | `rollup_id` și un motiv, acolo unde este dat | Emis atunci când un rollup este pus în pauză, reluat sau oprit |
| `batch_challenged`, `challenge_resolved`, `batch_rejected` | `rollup_id`, `batch_index` (și `fraud_upheld` la o rezolvare) | Emis atunci când un batch este contestat, contestația este rezolvată sau un batch este respins |
| `batch_submitted` | `rollup_id`, `batch_index`, `tx_count`                      | Emis atunci când este trimis un batch de decontare |
| `batch_finalized` | `rollup_id`, `batch_index`                                  | Emis atunci când un batch trece de fereastra sa de contestare |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `backend`, `size`                | Emis atunci când este stocat un blob DA          |
| `da_blob_pruned`  | `rollup_id`, `blob_index`                                   | Emis atunci când un blob DA este eliminat după perioada de retenție |

### Modulul Burn

| Tip eveniment            | Atribute cheie                                            | Descriere                                           |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------- |
| `burn`                   | `source`, `amount`                                        | Emis atunci când tokenurile sunt arse (burn) permanent |
| `milestone_burn`         | `tx_threshold`, `burn_amount`, `cumulative_tx_count`      | Emis atunci când rulează o ardere la atingerea unui prag de tranzacții |
| `burn_stranded_released` | `amount`, `destination`, `remaining`                      | Emis atunci când guvernanța eliberează o parte din cota blocată a staker-ilor |

### Modulele Inflation, Gas Abstraction, Licence, Light Node și AI

| Tip eveniment | Atribute cheie | Descriere |
| ---------- | -------------- | ----------- |
| `inflation_params_updated` | `mode`, `fixed_epoch_emission`, `max_total_emission` | Emis atunci când guvernanța schimbă parametrii de emisie |
| `gas_abstraction_conversion`, `gas_abstraction_refill` | `paid`, `native_equivalent`, `rate`, `price_source`, `result` | Emis atunci când o taxă într-un alt token acceptat este convertită și atunci când float-ul este reumplut (niciunul nu se declanșează cât timp este acceptat doar `uqor`) |
| `gas_abstraction_float_funded`, `gas_abstraction_config_updated` | `sender`, `amount`; `accepted_tokens`, `block_conversion_cap` | Emis atunci când float-ul este alimentat și atunci când guvernanța actualizează configurația |
| `license_granted`, `license_revoked`, `license_suspended`, `license_resumed`, `license_expired` | beneficiarul și funcționalitatea | Ciclul de viață al licenței |
| `license_authority_updated` | `new_authority` | Emis atunci când guvernanța înlocuiește autoritatea de licențiere (v3.2.3) |
| `lightnode_register`, `lightnode_heartbeat`, `lightnode_claim_rewards`, `lightnode_deregister`, `lightnode_status_change`, `lightnode_reward_distribution`, `lightnode_reserve_release` | `address`, `node_type`, `status`, `reward_amount`, `destination` | Evenimente de ciclu de viață și de recompensă ale nodurilor light |
| `ai_config_updated` | `max_tx_per_minute`, `max_evm_tx_per_minute`, `anomaly_action`, `anomaly_threshold` | Emis atunci când guvernanța actualizează configurația de screening AI |

### Modulul Staking Tiers (doar testnet)

Aceste evenimente există doar pe testnet-ul `qorechain-diana` (v3.2.4); mainnet-ul nu are încă modulul (propunerea de guvernanță 13 ar aplica v3.2.4 la înălțimea 3.742.566).

| Tip eveniment | Atribute cheie | Descriere |
| ---------- | -------------- | ----------- |
| `staking_tier_lock_created` | `lock_id`, `delegator`, `validator`, `amount`, `months`, `end_time` | A fost creată o blocare a delegării |
| `staking_tier_lock_unlocked_early`, `staking_tier_lock_released` | `lock_id`, `delegator`, `penalty_burned`, `bonus_forfeited` | O blocare a fost încheiată anticipat sau și-a atins sfârșitul |
| `staking_tier_bonus_claimed`, `staking_tier_bonus_settled` | `delegator`, `amount`; totaluri de decontare | A fost revendicat un bonus; pool-ul a fost decontat |
| `staking_tier_params_updated` | parametri | Guvernanța a schimbat parametrii modulului |

### Modulul xQORE

Aceste evenimente nu sunt emise încă: xQORE nu este live în niciun build de nod publicat (vezi [Staking xQORE](/user-guide/xqore-staking)).

| Tip eveniment  | Atribute cheie                                                        | Descriere                                |
| -------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| `xqore_lock`   | `owner`, `amount`                                                     | Emis atunci când QOR este blocat în xQORE |
| `xqore_unlock` | `owner`, `amount`, `penalty`, `burned`, `redistributed`, `returned`   | Emis atunci când xQORE este deblocat înapoi în QOR |

### Modulul PRISM Consensus (RL Consensus)

Acestea sunt evenimente de la sfârșitul blocului, livrate pe fluxul `NewBlock`.

| Tip eveniment                  | Atribute cheie          | Descriere                                                     |
| ------------------------------ | ----------------------- | ------------------------------------------------------------- |
| `rl_observation_collected`     | `height`                | Emis atunci când este făcută o observație PRISM (aproximativ la fiecare 10 blocuri) |
| `rl_reward_computed`           | `height`, `reward`      | Emis atunci când este calculată recompensa PRISM              |
| `rl_action_applied`            | `height`, `agent_mode`  | Emis atunci când agentul PRISM aplică o ajustare de parametru |
| `rl_agent_mode_changed`        | `height`, `agent_mode`  | Emis atunci când se schimbă modul agentului                   |
| `rl_circuit_breaker_triggered` | `height`                | Emis atunci când disjunctorul PRISM blochează o acțiune       |
| `rl_circuit_breaker_recovered` | `height`                | Emis atunci când disjunctorul își revine                      |

### Modulul AI

| Tip eveniment      | Atribute cheie                                   | Descriere                                           |
| ------------------ | ------------------------------------------------ | --------------------------------------------------- |
| `ai_anomaly_check` | `score_millionths`, `action`, `is_anomalous`     | Emis pentru fiecare tranzacție căreia i se atribuie un scor de anomalie |

---

## Exemplu de client JavaScript

### EVM WebSocket (ethers.js)

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

### QoreChain RPC WebSocket (Native)

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

- **Limite de conexiune**: Pe un nod pe care îl rulezi tu însuți, numărul maxim implicit de conexiuni WebSocket este nelimitat (`max-open-connections = 0`). Setează o limită în `app.toml` pentru mediile de producție. Endpoint-urile publice aplică propriile limite.
- **Buffer de evenimente**: WebSocket-ul RPC stochează în buffer un număr limitat de evenimente per abonament (implicit 200 pe un nod găzduit de tine). Dacă clientul rămâne în urmă, evenimentele mai vechi sunt eliminate.
- **Reconectare**: Clienții ar trebui să implementeze reconectare automată cu backoff exponențial, deoarece conexiunile WebSocket pot fi întrerupte în timpul repornirilor sau upgrade-urilor nodului.
