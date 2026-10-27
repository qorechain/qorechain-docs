---
slug: /api-reference/websocket-events
title: WebSocket Olayları
sidebar_label: WebSocket Olayları
sidebar_position: 5
---

# WebSocket Olayları

QoreChain, iki WebSocket arayüzü üzerinden gerçek zamanlı olay akışı sağlar: EVM uyumlu WebSocket ve QoreChain Consensus Engine RPC WebSocket'i.

:::note
Consensus Engine RPC WebSocket'i hem **`qorechain-vladi`** mainnet'inde hem de **`qorechain-diana`** testnet'inde herkese açık olarak kullanılabilir. EVM WebSocket'i yalnızca **testnet'te** herkese açık olarak kullanılabilir: herkese açık bir mainnet EVM WebSocket'i yoktur (`wss://evm.qore.host` ve `wss://evm-ws.qore.host` WebSocket bağlantılarını kabul etmez), bu nedenle mainnet'te `eth_subscribe` için kendi düğümünüzü çalıştırın. Aşağıdaki yerel uç noktalar, kendi işlettiğiniz bir düğümü varsayar.

| Arayüz | Mainnet | Testnet |
| --------- | ------- | ------- |
| RPC WebSocket | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| EVM WebSocket | yok (yalnızca kendi düğümünüz) | `wss://evm-ws-testnet.qore.host` |
:::

---

## EVM WebSocket

**Uç nokta:** kendi düğümünüzde `ws://localhost:8546`; herkese açık testnet: `wss://evm-ws-testnet.qore.host`. Herkese açık bir mainnet EVM WebSocket'i yoktur.

EVM WebSocket'i, Ethereum araçlarıyla uyumlu gerçek zamanlı olay akışı için standart `eth_subscribe` metodunu destekler.

### Abonelik Türleri

| Abonelik                 | Açıklama                                              |
| ------------------------ | ------------------------------------------------------ |
| `newHeads`               | Her yeni blok eklendiğinde bir başlık yayınlar        |
| `logs`                   | İsteğe bağlı bir filtreyle eşleşen logları yayınlar    |
| `newPendingTransactions` | Mempool'a giren işlem hash'lerini yayınlar             |

`syncing` aboneliği uygulanmamıştır: `"syncing"` ile yapılan `eth_subscribe`, `-32600 syncing subscription is not implemented` döndürür. Bunun yerine HTTP üzerinden `eth_syncing` çağrısını yoklayın (poll).

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

**Uç nokta:** kendi düğümünüzde `ws://localhost:26657/websocket`; herkese açık: `wss://rpc.qore.host/websocket` (mainnet) ve `wss://rpc-testnet.qore.host/websocket` (testnet).

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
    "query": "tm.event='Tx' AND bridge_deposit.chain EXISTS"
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

Olaylar standart consensus-engine olayları olarak yayınlanır. Olay türü ve niteliğine göre filtrelenmiş bir `tm.event='Tx'` sorgusuyla abone olun (örneğin `tm.event='Tx' AND bridge_deposit.chain EXISTS`). Blok düzeyindeki olaylar (aşağıdaki PRISM olayları gibi, blok sonu mantığı tarafından yayınlananlar) `Tx` ile değil, `tm.event='NewBlock'` ile iletilir. Aşağıdaki adlar ve nitelikler zincir sürümü v3.2.4'e aittir (mainnet 23 Ekim 2026'dan, testnet 19 Ekim 2026'dan beri); v3.2.4'te eklenen olaylar işaretlenmiştir. Testnet (v3.2.6) bir olay daha yayınlar, `rl_action_proposed`; bu olay PRISM olaylarıyla birlikte listelenmiştir.

:::note Gerçekte hangi olayları göreceksiniz
Bu modüllerin çoğu herkese açık ağlarda boştadır: köprü canlı değildir, henüz kayıtlı bir multilayer katmanı veya rollup yoktur ve xQORE kullanılamaz. Bu modüllerin olayları tanımlıdır ancak etkinlik olana kadar tetiklenmez. PRISM gözlem ve ödül olayları (`rl_observation_collected`, `rl_reward_computed`) her iki ağda da yaklaşık her 10 blokta bir yayınlanır; testnet'te (v3.2.6) ajan ayrıca her adımda `rl_action_proposed` yayınlar.
:::

### PQC Modülü

| Olay Türü                  | Anahtar Nitelikler                                        | Açıklama                                          |
| --------------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| `pqc_verify`                | `address`, `key_type`, `algorithm_id`, `hybrid_mode`, `status` | Her PQC imza kontrolünde yayınlanır         |
| `pqc_hybrid_verify`         | `address`, `algorithm_id`, `status`                       | Her hibrit imza doğrulamasında yayınlanır          |
| `pqc_hybrid_classical_only` | `address`, `hybrid_mode`                                  | Yalnızca klasik bir imza geçerli moda göre kabul edildiğinde yayınlanır |
| `pqc_key_registered`        | `address`, `key_type`, `algorithm_id`                     | Bir PQC anahtarı kaydedildiğinde yayınlanır        |
| `pqc_key_rotated`           | `address`, `algorithm_id`                                 | Bir PQC anahtarı döndürüldüğünde (rotate) yayınlanır |
| `pqc_key_migrated`          | `address`, `from_algorithm`, `to_algorithm`               | Bir anahtar yeni bir algoritmaya taşındığında yayınlanır |
| `pqc_evm_window_opened`     | `address`, `expiry_height`, `max_txs`, `max_value`; pencere kapsamlıysa `native_only` ve `allowed_targets` (v3.2.3) | Bir EVM lane yetkilendirme penceresi açıldığında yayınlanır |
| `pqc_evm_window_closed`     | `address`                                                 | Bir EVM lane yetkilendirme penceresi kapandığında yayınlanır |
| `pqc_evm_delegation_consent` | `address`, `delegate`, `expiry_height`                   | Bir hesap, bir EIP-7702 delegasyonuna onayını kaydettiğinde yayınlanır (v3.2.2) |
| `pqc_evm_delegation_cleared` | `address`, `delegate`                                    | Bir hesabın EIP-7702 delegasyonu temizlendiğinde yayınlanır (v3.2.2) |
| `pqc_algorithm_registered`, `pqc_algorithm_status_updated`, `pqc_algorithm_disabled` | `algorithm_id` ve `name`/`category`, `old_status`/`new_status` veya `reason` | Yönetişim tarafından yapılan algoritma kayıt defteri değişiklikleri |

PQC anahtarları bir kayıt işlemiyle açıkça kaydedilir; otomatik bir kayıt olayı yoktur.

### Bridge Modülü

| Olay Türü                     | Anahtar Nitelikler                                       | Açıklama                                     |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `bridge_deposit`              | `operation_id`, `chain`, `asset`, `amount`, `sender`     | Gelen bir yatırma kaydedildiğinde yayınlanır |
| `bridge_withdraw`             | `operation_id`, `chain`, `asset`, `amount`, `sender`, `receiver` | Bir çekim kaydedildiğinde yayınlanır |
| `bridge_attestation`          | `operation_id`, `validator`, `chain`, `pqc_verified`, `attestations` | Her doğrulayıcı onayı (attestation) için yayınlanır |
| `bridge_operation_executed`   | `operation_id`, `status`                                 | Bir işlem tamamlandığında yayınlanır         |
| `bridge_circuit_breaker_trip` | `chain`, `status`, `reason`                              | Bir zincirin köprü devre kesicisi devreye girdiğinde yayınlanır |

### Cross-VM Modülü

| Olay Türü          | Anahtar Nitelikler                                                          | Açıklama                                              |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender`         | Bir cross-VM çağrısı başlatıldığında yayınlanır       |
| `crossvm_response` | `message_id`, `status`                                                      | Bir cross-VM çağrısı tamamlandığında yayınlanır       |
| `crossvm_timeout`  | `message_id`                                                                | Bir cross-VM mesajı sıra zaman aşımını aştığında yayınlanır |

### Multilayer Modülü

| Olay Türü               | Anahtar Nitelikler                                                                           | Açıklama                                     |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `state_anchored`        | `layer_id`, `layer_height`, `state_root`, `main_chain_height`, `pqc_verified`, `transaction_count` | Bir katman durum çapası kabul edildiğinde yayınlanır |
| `anchor_challenged`     | `layer_id`, `layer_height`, `challenger`, `challenge_reason`, `resolution`                   | Bir çapaya itiraz edildiğinde yayınlanır     |
| `layer_status_updated`  | `layer_id`, `status`, `reason`                                                               | Bir katmanın durumu değiştiğinde yayınlanır  |
| `sidechain_registered`, `paychain_registered` | `layer_id`, `layer_type`, `creator`, `status`                          | Bir katman kaydedildiğinde yayınlanır        |
| `transaction_routed`    | `selected_layer`, `routing_reason`, `gas_savings`, `latency_ms`, `sender`                    | Bir işlem bir katmana yönlendirildiğinde yayınlanır |

### RDK Modülü

| Olay Türü         | Anahtar Nitelikler                                          | Açıklama                                         |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`, `creator`, `profile`, `settlement_mode`        | Yeni bir rollup kaydedildiğinde yayınlanır       |
| `rollup_paused`, `rollup_resumed`, `rollup_stopped` | `rollup_id` ve verilmişse bir neden | Bir rollup duraklatıldığında, devam ettirildiğinde veya durdurulduğunda yayınlanır |
| `batch_challenged`, `challenge_resolved`, `batch_rejected` | `rollup_id`, `batch_index` (ve bir çözümde `fraud_upheld`) | Bir toplu işe itiraz edildiğinde, itiraz çözüldüğünde veya bir toplu iş reddedildiğinde yayınlanır |
| `batch_submitted` | `rollup_id`, `batch_index`, `tx_count`                      | Bir mutabakat toplu işi gönderildiğinde yayınlanır |
| `batch_finalized` | `rollup_id`, `batch_index`                                  | Bir toplu iş itiraz penceresini geçtiğinde yayınlanır |
| `da_blob_stored`  | `rollup_id`, `blob_index`, `backend`, `size`                | Bir DA blob'u depolandığında yayınlanır          |
| `da_blob_pruned`  | `rollup_id`, `blob_index`                                   | Bir DA blob'u saklama süresinin ardından budandığında yayınlanır |

### Burn Modülü

| Olay Türü                | Anahtar Nitelikler                                        | Açıklama                                            |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------- |
| `burn`                   | `source`, `amount`                                        | Token'lar kalıcı olarak yakıldığında yayınlanır     |
| `milestone_burn`         | `tx_threshold`, `burn_amount`, `cumulative_tx_count`      | İşlem sayısı eşiğine bağlı bir yakım çalıştığında yayınlanır |
| `burn_stranded_released` | `amount`, `destination`, `remaining`                      | Yönetişim, takılı kalan staker payının bir kısmını serbest bıraktığında yayınlanır |

### Inflation, Gas Abstraction, Lisans, Light Node ve AI Modülleri

| Olay Türü | Anahtar Nitelikler | Açıklama |
| ---------- | -------------- | ----------- |
| `inflation_params_updated` | `mode`, `fixed_epoch_emission`, `max_total_emission` | Yönetişim emisyon parametrelerini değiştirdiğinde yayınlanır |
| `gas_abstraction_conversion`, `gas_abstraction_refill` | `paid`, `native_equivalent`, `rate`, `price_source`, `result` | Kabul edilen başka bir token ile ödenen ücret dönüştürüldüğünde ve float yeniden doldurulduğunda yayınlanır (yalnızca `uqor` kabul edildiği sürece hiçbiri tetiklenmez) |
| `gas_abstraction_float_funded`, `gas_abstraction_config_updated` | `sender`, `amount`; `accepted_tokens`, `block_conversion_cap` | Float fonlandığında ve yönetişim yapılandırmayı güncellediğinde yayınlanır |
| `license_granted`, `license_revoked`, `license_suspended`, `license_resumed`, `license_expired` | izin alan ve özellik | Lisans yaşam döngüsü |
| `license_authority_updated` | `new_authority` | Yönetişim lisans otoritesini değiştirdiğinde yayınlanır (v3.2.3) |
| `lightnode_register`, `lightnode_heartbeat`, `lightnode_claim_rewards`, `lightnode_deregister`, `lightnode_status_change`, `lightnode_reward_distribution`, `lightnode_reserve_release` | `address`, `node_type`, `status`, `reward_amount`, `destination` | Hafif düğüm yaşam döngüsü ve ödül olayları |
| `ai_config_updated` | `max_tx_per_minute`, `max_evm_tx_per_minute`, `anomaly_action`, `anomaly_threshold` | Yönetişim AI tarama yapılandırmasını güncellediğinde yayınlanır |

### Staking Tiers Modülü (v3.2.4)

Bu olaylar v3.2.4 sürümüyle gelir: `qorechain-diana` testnet'i bunları 19 Ekim 2026'dan beri yayar, mainnet ise 23 Ekim 2026'dan beri yayar (yönetişim önerisi 13, 3,742,566 yüksekliği). Daha eski bir sürümdeki bir düğümde staking-tiers modülü yoktur ve bunların hiçbirini yaymaz.

| Olay Türü | Anahtar Nitelikler | Açıklama |
| ---------- | -------------- | ----------- |
| `staking_tier_lock_created` | `lock_id`, `delegator`, `validator`, `amount`, `months`, `end_time` | Bir delegasyon kilidi oluşturuldu |
| `staking_tier_lock_unlocked_early`, `staking_tier_lock_released` | `lock_id`, `delegator`, `penalty_burned`, `bonus_forfeited` | Bir kilit erken sonlandırıldı (ceza `staking_tier_penalty` yakma kaynağı altında yakılır) veya sonuna ulaştı |
| `staking_tier_bonus_claimed`, `staking_tier_bonus_settled` | `delegator`, `amount`; uzlaşı toplamları | Bir bonus talep edildi; havuz uzlaştırıldı |
| `staking_tier_params_updated` | parametreler | Yönetişim modül parametrelerini değiştirdi |

### xQORE Modülü

Bu olaylar henüz yayınlanmaz: xQORE, yayımlanmış hiçbir düğüm sürümünde canlı değildir (bkz. [xQORE Staking](/user-guide/xqore-staking)).

| Olay Türü      | Anahtar Nitelikler                                                    | Açıklama                                 |
| -------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| `xqore_lock`   | `owner`, `amount`                                                     | QOR, xQORE'a kilitlendiğinde yayınlanır  |
| `xqore_unlock` | `owner`, `amount`, `penalty`, `burned`, `redistributed`, `returned`   | xQORE, QOR'a geri kilidi açıldığında yayınlanır |

### PRISM Consensus (RL Consensus) Modülü

Bunlar blok sonu olaylarıdır ve `NewBlock` akışında iletilir.

| Olay Türü                      | Anahtar Nitelikler      | Açıklama                                                      |
| ------------------------------ | ----------------------- | ------------------------------------------------------------- |
| `rl_observation_collected`     | `height`                | Bir PRISM gözlemi alındığında yayınlanır (yaklaşık her 10 blokta bir) |
| `rl_reward_computed`           | `height`, `reward`      | PRISM ödülü hesaplandığında yayınlanır                        |
| `rl_action_applied`            | `height`, `agent_mode`  | PRISM ajanı bir parametre ayarlaması uyguladığında yayınlanır |
| `rl_agent_mode_changed`        | `height`, `agent_mode`  | Ajan modu değiştiğinde yayınlanır                             |
| `rl_circuit_breaker_triggered` | `height`                | PRISM devre kesicisi bir eylemi engellediğinde yayınlanır     |
| `rl_circuit_breaker_recovered` | `height`                | Devre kesici toparlandığında yayınlanır                       |
| `rl_action_proposed`           | `height`, `agent_mode`, `applied`, `block_time_delta`, `gas_price_delta`, `validator_set_size_delta`, `pool_weight_rpos_delta`, `pool_weight_dpos_delta` | **v3.2.6 (yalnızca testnet).** Her modda her ajan adımında, önerilen eylemle birlikte yayınlanır; gölge modda `applied` değeri `false` olur. Mainnet bu sürümü uygulayana kadar yayınlamaz |

### AI Modülü

| Olay Türü          | Anahtar Nitelikler                               | Açıklama                                            |
| ------------------ | ------------------------------------------------ | --------------------------------------------------- |
| `ai_anomaly_check` | `score_millionths`, `action`, `is_anomalous`     | Anomali puanı verilen her işlem için yayınlanır     |

---

## JavaScript İstemci Örneği

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

## Notlar

- **Bağlantı limitleri**: Kendi işlettiğiniz bir düğümde, varsayılan maksimum WebSocket bağlantı sayısı sınırsızdır (`max-open-connections = 0`). Üretim dağıtımları için `app.toml` içinde bir limit belirleyin. Herkese açık uç noktalar kendi limitlerini uygular.
- **Olay arabelleği**: RPC WebSocket'i, abonelik başına sınırlı sayıda olayı arabelleğe alır (kendi barındırdığınız bir düğümde varsayılan 200). İstemci geride kalırsa, eski olaylar düşürülür.
- **Yeniden bağlanma**: İstemciler, düğüm yeniden başlatmaları veya yükseltmeleri sırasında WebSocket bağlantılarının kesintiye uğrayabileceğini göz önünde bulundurarak üstel geri çekilmeli otomatik yeniden bağlanma uygulamalıdır.
