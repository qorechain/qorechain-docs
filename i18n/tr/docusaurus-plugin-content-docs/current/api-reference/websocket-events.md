---
slug: /api-reference/websocket-events
title: WebSocket Olayları
sidebar_label: WebSocket Olayları
sidebar_position: 5
---

# WebSocket Olayları

QoreChain, iki WebSocket arayüzü aracılığıyla gerçek zamanlı olay akışı sağlar: EVM uyumlu WebSocket ve QoreChain Uzlaşı Motoru RPC WebSocket.

:::note
Her iki WebSocket arayüzü de **`qorechain-vladi`** ana ağında (**v3.1.77** zincir sürümünde canlı) ve **`qorechain-diana`** test ağında kullanılabilir. Aşağıdaki yerel uç noktalar kendi çalıştırdığınız bir düğümü varsayar; uzaktan erişim için sağlayıcınızın ana ağ veya test ağı ana makinesini kullanın.
:::

---

## EVM WebSocket

**Uç Nokta:** `ws://localhost:8546`

EVM WebSocket, Ethereum araçlarıyla uyumlu gerçek zamanlı olay akışı için standart `eth_subscribe` yöntemini destekler.

### Abonelik Türleri

| Abonelik                 | Açıklama                                          |
| ------------------------ | ------------------------------------------------ |
| `newHeads`               | Her yeni blok eklendiğinde bir başlık yayar      |
| `logs`                   | İsteğe bağlı bir filtreyle eşleşen günlükleri yayar |
| `newPendingTransactions` | Mempool'a giren işlem karmalarını yayar          |
| `syncing`                | Senkronizasyon durumu güncellemelerini yayar     |

### Yeni Bloklara Abone Olma

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### Filtreyle Günlüklere Abone Olma

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

**Uç Nokta:** `ws://localhost:26657/websocket`

RPC WebSocket, QoreChain Uzlaşı Motoru olay abonelik sistemini kullanır. İstemciler, olayları türe ve özniteliklere göre filtreleyen bir sorgu dizesiyle abone olur.

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

Yalnızca belirli bir modülden olayları almak için olay türüne göre filtreleyin:

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

| Olay Türü                  | Anahtar Öznitelikler                                 | Açıklama                                       |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `pqc_hybrid_verify`        | `address`, `algorithm`, `result` (pass/fail), `mode` | Her hibrit imza doğrulamasında yayılır        |
| `pqc_hybrid_auto_register` | `address`, `algorithm`, `pubkey_hash`                | Bir PQC anahtarı otomatik kaydedildiğinde yayılır |

### AI Modülü

| Olay Türü         | Anahtar Öznitelikler                                                | Açıklama                                          |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| `fraud_alert`     | `severity` (low/medium/high/critical), `address`, `reason`, `score` | Bir işlemde dolandırıcılık tespit edildiğinde yayılır |
| `circuit_breaker` | `module`, `action` (tripped/reset), `threshold`, `value`            | Bir AI devre kesicisi durum değiştirdiğinde yayılır |

### Köprü Modülü

| Olay Türü              | Anahtar Öznitelikler                                           | Açıklama                                                |
| ---------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| `deposit_completed`    | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | Gelen bir köprü yatırımı onaylandığında yayılır         |
| `withdrawal_completed` | `chain_id`, `sender`, `recipient`, `amount`, `asset`, `tx_hash` | Giden bir köprü çekimi onaylandığında yayılır           |

### Cross-VM Modülü

| Olay Türü          | Anahtar Öznitelikler                                            | Açıklama                                               |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `sender`, `payload_hash` | Bir VM'ler arası çağrı başlatıldığında yayılır        |
| `crossvm_response` | `message_id`, `source_vm`, `target_vm`, `success`, `gas_used`    | Bir VM'ler arası çağrı tamamlandığında yayılır        |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`, `queued_at_height`       | Bir VM'ler arası mesaj kuyruk zaman aşımını aştığında yayılır |

### Multilayer Modülü

| Olay Türü              | Anahtar Öznitelikler                                          | Açıklama                                         |
| ---------------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| `anchor_submitted`     | `layer_id`, `layer_type`, `anchor_hash`, `height`, `submitter` | Bir katman durum bağlaması gönderildiğinde yayılır |
| `layer_status_changed` | `layer_id`, `previous_status`, `new_status`, `reason`          | Bir katman işletim durumunu değiştirdiğinde yayılır |

### RDK Modülü

| Olay Türü         | Anahtar Öznitelikler                                  | Açıklama                                          |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `operator`, `settlement_type`, `profile` | Yeni bir rollup kaydedildiğinde yayılır          |
| `batch_submitted` | `rollup_id`, `batch_index`, `state_root`, `tx_count`  | Bir uzlaşma toplu işlemi gönderildiğinde yayılır |
| `batch_finalized` | `rollup_id`, `batch_index`, `finalized_at_height`     | Bir toplu işlem itiraz penceresini geçtiğinde yayılır |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `size_bytes`, `commitment` | Bir DA blob'u depolandığında yayılır             |
| `da_blob_pruned`  | `rollup_id`, `blob_index`, `pruned_at_height`         | Bir DA blob'u saklama süresinden sonra budandığında yayılır |

### Burn Modülü

| Olay Türü         | Anahtar Öznitelikler                                                                | Açıklama                                    |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| `fee_distributed` | `total_fees`, `validator_amount`, `burn_amount`, `treasury_amount`, `staker_amount` | Toplanan ücretler dağıtıldığında yayılır    |
| `tokens_burned`   | `amount`, `channel`, `block_height`                                                 | Tokenlar kalıcı olarak yakıldığında yayılır |

### xQORE Modülü

| Olay Türü        | Anahtar Öznitelikler                                          | Açıklama                                    |
| ---------------- | ------------------------------------------------------------- | ------------------------------------------- |
| `xqore_locked`   | `address`, `amount`, `lock_duration`, `tier`                  | QOR, xQORE'a kilitlendiğinde yayılır        |
| `xqore_unlocked` | `address`, `amount`, `penalty_applied`, `penalty_amount`      | xQORE, QOR'a geri kilidi açıldığında yayılır |
| `pvp_rebase`     | `epoch`, `total_penalty`, `rebase_amount`, `beneficiary_count` | PvP yeniden tabanlama dağıtımı sırasında yayılır |

### Inflation Modülü

| Olay Türü      | Anahtar Öznitelikler                                       | Açıklama                                    |
| -------------- | ---------------------------------------------------------- | ------------------------------------------- |
| `epoch_minted` | `epoch`, `minted_amount`, `inflation_rate`, `block_height` | Her enflasyon epoch'unun sonunda yayılır    |

### RL Uzlaşı Modülü

PRISM parametre ayarlamaları ve devre kesici etkinliği bu modül aracılığıyla yayılır.

| Olay Türü                   | Anahtar Öznitelikler                                          | Açıklama                                                   |
| --------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| `rl_action_applied`         | `action_type`, `param_key`, `old_value`, `new_value`, `reward` | PRISM ajanı bir parametre ayarlaması uyguladığında yayılır |
| `circuit_breaker_triggered` | `reason`, `param_key`, `attempted_value`, `limit`              | PRISM devre kesicisi bir eylemi engellediğinde yayılır     |

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

### QoreChain RPC WebSocket (Yerel)

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

- **Bağlantı sınırları**: Varsayılan maksimum WebSocket bağlantısı sayısı sınırsızdır (`max-open-connections = 0`). Üretim dağıtımları için `app.toml` dosyasında bir sınır belirleyin.
- **Olay tamponu**: RPC WebSocket, abonelik başına en fazla 200 olayı tamponlar. İstemci geride kalırsa, eski olaylar atılır.
- **Yeniden bağlanma**: İstemciler, WebSocket bağlantıları düğüm yeniden başlatmaları veya yükseltmeleri sırasında kesilebileceğinden, üstel geri çekilmeli otomatik yeniden bağlanma uygulamalıdır.
