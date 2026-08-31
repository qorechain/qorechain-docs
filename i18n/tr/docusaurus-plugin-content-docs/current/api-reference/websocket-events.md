---
slug: /api-reference/websocket-events
title: WebSocket Olayları
sidebar_label: WebSocket Olayları
sidebar_position: 5
---

# WebSocket Olayları

QoreChain, iki WebSocket arayüzü üzerinden gerçek zamanlı olay akışı sağlar: EVM uyumlu WebSocket ve QoreChain Consensus Engine RPC WebSocket'i.

:::note
Her iki WebSocket arayüzü de **`qorechain-vladi`** mainnet'inde (zincir sürümü **v3.1.95** ile canlı) ve **`qorechain-diana`** testnet'inde kullanılabilir. Aşağıdaki yerel uç noktalar, kendi işlettiğiniz bir düğümü varsayar; uzaktan erişim için sağlayıcınızın mainnet veya testnet ana bilgisayarını kullanın.
:::

---

## EVM WebSocket

**Uç nokta:** `ws://localhost:8546`

EVM WebSocket'i, Ethereum araçlarıyla uyumlu gerçek zamanlı olay akışı için standart `eth_subscribe` metodunu destekler.

### Abonelik Türleri

| Abonelik                 | Açıklama                                              |
| ------------------------ | ------------------------------------------------------ |
| `newHeads`               | Her yeni blok eklendiğinde bir başlık yayınlar        |
| `logs`                   | İsteğe bağlı bir filtreyle eşleşen logları yayınlar    |
| `newPendingTransactions` | Mempool'a giren işlem hash'lerini yayınlar             |
| `syncing`                | Senkronizasyon durumu güncellemelerini yayınlar        |

### Yeni Bloklara Abone Olma

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### Filtreli Loglara Abone Olma

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

### Abonelikten Çıkma

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

**Uç nokta:** `ws://localhost:26657/websocket`

RPC WebSocket'i, QoreChain Consensus Engine olay abonelik sistemini kullanır. İstemciler, olayları türe ve niteliklere göre filtreleyen bir sorgu dizesiyle abone olur.

### Tüm Yeni Bloklara Abone Olma

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

### Tüm İşlemlere Abone Olma

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

### Modüle Özgü Olaylara Abone Olma

Yalnızca belirli bir modülden gelen olayları almak için olay türüne göre filtreleyin:

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

### Abonelikten Çıkma

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

## Modül Olayları Referansı

### PQC Modülü

| Olay Türü                  | Anahtar Nitelikler                                    | Açıklama                                          |
| --------------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| `pqc_hybrid_verify`         | `address`, `algorithm`, `result` (pass/fail), `mode`   | Her hibrit imza doğrulamasında yayınlanır          |
| `pqc_hybrid_auto_register`  | `address`, `algorithm`, `pubkey_hash`                  | Bir PQC anahtarı otomatik kaydedildiğinde yayınlanır |

### AI Modülü

| Olay Türü         | Anahtar Nitelikler                                                    | Açıklama                                              |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| `fraud_alert`      | `severity` (low/medium/high/critical), `address`, `reason`, `score`    | Bir işlemde dolandırıcılık tespit edildiğinde yayınlanır |
| `circuit_breaker`  | `module`, `action` (tripped/reset), `threshold`, `value`               | Bir AI devre kesici durum değiştirdiğinde yayınlanır      |

### Bridge Modülü

| Olay Türü               | Anahtar Nitelikler                                                | Açıklama                                                    |
| ------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| `deposit_completed`     | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash`      | Gelen bir köprü yatırması onaylandığında yayınlanır          |
| `withdrawal_completed`  | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash`      | Giden bir köprü çekimi onaylandığında yayınlanır             |

### Cross-VM Modülü

| Olay Türü           | Anahtar Nitelikler                                                 | Açıklama                                                  |
| --------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| `crossvm_request`    | `message_id`, `source_vm`, `target_vm`, `sender`, `payload_hash`      | Bir cross-VM çağrısı başlatıldığında yayınlanır              |
| `crossvm_response`   | `message_id`, `source_vm`, `target_vm`, `success`, `gas_used`         | Bir cross-VM çağrısı tamamlandığında yayınlanır              |
| `crossvm_timeout`    | `message_id`, `source_vm`, `target_vm`, `queued_at_height`            | Bir cross-VM mesajı sıra zaman aşımını aştığında yayınlanır  |

### Multilayer Modülü

| Olay Türü               | Anahtar Nitelikler                                              | Açıklama                                              |
| ------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| `anchor_submitted`      | `layer_id`, `layer_type`, `anchor_hash`, `height`, `submitter`      | Bir katman durum çapası gönderildiğinde yayınlanır      |
| `layer_status_changed`  | `layer_id`, `previous_status`, `new_status`, `reason`                | Bir katman operasyonel durumunu değiştirdiğinde yayınlanır |

### RDK Modülü

| Olay Türü          | Anahtar Nitelikler                                     | Açıklama                                                  |
| -------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| `rollup_created`    | `rollup_id`, `operator`, `settlement_type`, `profile`     | Yeni bir rollup kaydedildiğinde yayınlanır                   |
| `batch_submitted`   | `rollup_id`, `batch_index`, `state_root`, `tx_count`       | Bir mutabakat toplu işi gönderildiğinde yayınlanır            |
| `batch_finalized`   | `rollup_id`, `batch_index`, `finalized_at_height`          | Bir toplu iş itiraz penceresini geçtiğinde yayınlanır        |
| `da_blob_stored`    | `rollup_id`, `blob_index`, `size_bytes`, `commitment`      | Bir DA blob'u depolandığında yayınlanır                      |
| `da_blob_pruned`    | `rollup_id`, `blob_index`, `pruned_at_height`               | Bir DA blob'u saklama süresinin ardından budandığında yayınlanır |

### Burn Modülü

| Olay Türü          | Anahtar Nitelikler                                                                  | Açıklama                                        |
| -------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `fee_distributed`  | `total_fees`, `validator_amount`, `burn_amount`, `treasury_amount`, `staker_amount`   | Toplanan ücretler dağıtıldığında yayınlanır         |
| `tokens_burned`    | `amount`, `channel`, `block_height`                                                    | Token'lar kalıcı olarak yakıldığında yayınlanır     |

### xQORE Modülü

| Olay Türü         | Anahtar Nitelikler                                              | Açıklama                                        |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------ |
| `xqore_locked`     | `address`, `amount`, `lock_duration`, `tier`                          | QOR, xQORE'a kilitlendiğinde yayınlanır                |
| `xqore_unlocked`   | `address`, `amount`, `penalty_applied`, `penalty_amount`               | xQORE, QOR'a geri kilidi açıldığında yayınlanır        |
| `pvp_rebase`       | `epoch`, `total_penalty`, `rebase_amount`, `beneficiary_count`         | PvP rebase dağıtımı sırasında yayınlanır               |

### Inflation Modülü

| Olay Türü      | Anahtar Nitelikler                                          | Açıklama                                        |
| ---------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| `epoch_minted`  | `epoch`, `minted_amount`, `inflation_rate`, `block_height`       | Her enflasyon epoch'unun sonunda yayınlanır             |

### RL Consensus Modülü

PRISM parametre ayarlamaları ve devre kesici etkinliği bu modül üzerinden yayınlanır.

| Olay Türü                    | Anahtar Nitelikler                                                | Açıklama                                                        |
| ------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `rl_action_applied`           | `action_type`, `param_key`, `old_value`, `new_value`, `reward`        | PRISM ajanı bir parametre ayarlaması uyguladığında yayınlanır        |
| `circuit_breaker_triggered`   | `reason`, `param_key`, `attempted_value`, `limit`                      | PRISM devre kesicisi bir eylemi engellediğinde yayınlanır             |

---

## JavaScript İstemci Örneği

### EVM WebSocket (ethers.js)

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

### QoreChain RPC WebSocket (Native)

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

## Notlar

- **Bağlantı limitleri**: Varsayılan maksimum WebSocket bağlantı sayısı sınırsızdır (`max-open-connections = 0`). Üretim dağıtımları için `app.toml` içinde bir limit belirleyin.
- **Olay arabelleği**: RPC WebSocket'i, abonelik başına en fazla 200 olayı arabelleğe alır. İstemci geride kalırsa, eski olaylar düşürülür.
- **Yeniden bağlanma**: İstemciler, düğüm yeniden başlatmaları veya yükseltmeleri sırasında WebSocket bağlantılarının kesintiye uğrayabileceğini göz önünde bulundurarak üstel geri çekilmeli otomatik yeniden bağlanma uygulamalıdır.
