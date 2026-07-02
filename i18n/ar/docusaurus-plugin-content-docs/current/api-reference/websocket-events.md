---
slug: /api-reference/websocket-events
title: أحداث WebSocket
sidebar_label: أحداث WebSocket
sidebar_position: 5
---

# أحداث WebSocket

توفّر QoreChain بثّ الأحداث في الوقت الفعلي عبر واجهتي WebSocket: واجهة WebSocket المتوافقة مع EVM وواجهة RPC WebSocket لمحرّك إجماع QoreChain.

:::note
تتوفّر كلتا واجهتي WebSocket على شبكة **`qorechain-vladi`** الرئيسية (تعمل على إصدار السلسلة **v3.1.82**) وشبكة **`qorechain-diana`** الاختبارية. تفترض نقاط النهاية المحلية أدناه عقدة تشغّلها بنفسك؛ استبدلها بمضيف الشبكة الرئيسية أو الاختبارية الخاص بمزوّدك للوصول عن بُعد.
:::

---

## EVM WebSocket

**نقطة النهاية:** `ws://localhost:8546`

تدعم واجهة EVM WebSocket طريقة `eth_subscribe` القياسية لبثّ الأحداث في الوقت الفعلي بشكل متوافق مع أدوات Ethereum.

### أنواع الاشتراك

| الاشتراك                 | الوصف                                      |
| ------------------------ | ------------------------------------------------ |
| `newHeads`               | يُصدِر ترويسة في كل مرة تُضاف فيها كتلة جديدة |
| `logs`                   | يُصدِر السجلّات المطابقة لمرشِّح اختياري           |
| `newPendingTransactions` | يُصدِر تجزئات المعاملات الداخلة إلى الـ mempool    |
| `syncing`                | يُصدِر تحديثات حالة المزامنة                        |

### الاشتراك في الكتل الجديدة

```json
{
  "jsonrpc": "2.0",
  "method": "eth_subscribe",
  "params": ["newHeads"],
  "id": 1
}
```

### الاشتراك في السجلّات مع مرشِّح

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

### إلغاء الاشتراك

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

**نقطة النهاية:** `ws://localhost:26657/websocket`

تستخدم واجهة RPC WebSocket نظام اشتراك الأحداث الخاص بمحرّك إجماع QoreChain. يشترك العملاء باستخدام سلسلة استعلام تُرشِّح الأحداث حسب النوع والسمات.

### الاشتراك في جميع الكتل الجديدة

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

### الاشتراك في جميع المعاملات

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

### الاشتراك في الأحداث الخاصة بوحدة معيّنة

رشِّح حسب نوع الحدث لتلقّي الأحداث من وحدة محدّدة فقط:

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

### إلغاء الاشتراك

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

## مرجع أحداث الوحدات

### وحدة PQC

| نوع الحدث                  | السمات الرئيسية                                      | الوصف                                   |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `pqc_hybrid_verify`        | `address`، `algorithm`، `result` (pass/fail)، `mode` | يُصدَر عند كل تحقّق من توقيع هجين |
| `pqc_hybrid_auto_register` | `address`، `algorithm`، `pubkey_hash`                | يُصدَر عند التسجيل التلقائي لمفتاح PQC     |

### وحدة الذكاء الاصطناعي

| نوع الحدث         | السمات الرئيسية                                                     | الوصف                                      |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| `fraud_alert`     | `severity` (low/medium/high/critical)، `address`، `reason`، `score` | يُصدَر عند اكتشاف احتيال في معاملة  |
| `circuit_breaker` | `module`، `action` (tripped/reset)، `threshold`، `value`            | يُصدَر عند تغيّر حالة قاطع دائرة الذكاء الاصطناعي |

### وحدة الجسر

| نوع الحدث              | السمات الرئيسية                                                 | الوصف                                             |
| ---------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| `deposit_completed`    | `chain_id`، `sender`، `recipient`، `amount`، `asset`، `tx_hash` | يُصدَر عند تأكيد إيداع جسر وارد     |
| `withdrawal_completed` | `chain_id`، `sender`، `recipient`، `amount`، `asset`، `tx_hash` | يُصدَر عند تأكيد سحب جسر صادر |

### وحدة Cross-VM

| نوع الحدث          | السمات الرئيسية                                                  | الوصف                                           |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`، `source_vm`، `target_vm`، `sender`، `payload_hash` | يُصدَر عند بدء استدعاء عبر الأجهزة الافتراضية             |
| `crossvm_response` | `message_id`، `source_vm`، `target_vm`، `success`، `gas_used`    | يُصدَر عند اكتمال استدعاء عبر الأجهزة الافتراضية                |
| `crossvm_timeout`  | `message_id`، `source_vm`، `target_vm`، `queued_at_height`       | يُصدَر عند تجاوز رسالة عبر الأجهزة الافتراضية لمهلة قائمة الانتظار |

### وحدة Multilayer

| نوع الحدث              | السمات الرئيسية                                                | الوصف                                     |
| ---------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| `anchor_submitted`     | `layer_id`، `layer_type`، `anchor_hash`، `height`، `submitter` | يُصدَر عند تقديم تثبيت حالة طبقة  |
| `layer_status_changed` | `layer_id`، `previous_status`، `new_status`، `reason`          | يُصدَر عند تغيّر الحالة التشغيلية لطبقة |

### وحدة RDK

| نوع الحدث         | السمات الرئيسية                                        | الوصف                                      |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`، `operator`، `settlement_type`، `profile` | يُصدَر عند تسجيل rollup جديد          |
| `batch_submitted` | `rollup_id`، `batch_index`، `state_root`، `tx_count`  | يُصدَر عند تقديم دفعة تسوية     |
| `batch_finalized` | `rollup_id`، `batch_index`، `finalized_at_height`     | يُصدَر عند اجتياز دفعة لنافذة التحدّي الخاصة بها |
| `da_blob_stored`  | `rollup_id`، `blob_index`، `size_bytes`، `commitment` | يُصدَر عند تخزين كتلة DA                |
| `da_blob_pruned`  | `rollup_id`، `blob_index`، `pruned_at_height`         | يُصدَر عند تقليم كتلة DA بعد فترة الاحتفاظ |

### وحدة الحرق

| نوع الحدث         | السمات الرئيسية                                                                     | الوصف                                 |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| `fee_distributed` | `total_fees`، `validator_amount`، `burn_amount`، `treasury_amount`، `staker_amount` | يُصدَر عند توزيع الرسوم المُحصَّلة |
| `tokens_burned`   | `amount`، `channel`، `block_height`                                                 | يُصدَر عند حرق الرموز بشكل دائم  |

### وحدة xQORE

| نوع الحدث        | السمات الرئيسية                                                | الوصف                                |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------ |
| `xqore_locked`   | `address`، `amount`، `lock_duration`، `tier`                   | يُصدَر عند قفل QOR في xQORE      |
| `xqore_unlocked` | `address`، `amount`، `penalty_applied`، `penalty_amount`       | يُصدَر عند فتح قفل xQORE وإعادته إلى QOR |
| `pvp_rebase`     | `epoch`، `total_penalty`، `rebase_amount`، `beneficiary_count` | يُصدَر أثناء توزيع إعادة الأساس لـ PvP     |

### وحدة التضخم

| نوع الحدث     | السمات الرئيسية                                            | الوصف                                |
| -------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `epoch_minted` | `epoch`، `minted_amount`، `inflation_rate`، `block_height` | يُصدَر في نهاية كل عصر تضخم |

### وحدة إجماع RL

تُصدَر تعديلات معاملات PRISM ونشاط قاطع الدائرة من خلال هذه الوحدة.

| نوع الحدث                   | السمات الرئيسية                                                | الوصف                                                |
| --------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| `rl_action_applied`         | `action_type`، `param_key`، `old_value`، `new_value`، `reward` | يُصدَر عندما يطبّق وكيل PRISM تعديل معامل |
| `circuit_breaker_triggered` | `reason`، `param_key`، `attempted_value`، `limit`              | يُصدَر عندما يحظر قاطع دائرة PRISM إجراءً     |

---

## مثال على عميل JavaScript

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

### QoreChain RPC WebSocket (أصلي)

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

## ملاحظات

- **حدود الاتصال**: العدد الأقصى الافتراضي لاتصالات WebSocket غير محدود (`max-open-connections = 0`). عيّن حدًّا في `app.toml` لعمليات النشر الإنتاجية.
- **مخزن الأحداث المؤقت**: تخزّن واجهة RPC WebSocket مؤقتًا ما يصل إلى 200 حدث لكل اشتراك. إذا تأخّر العميل، تُسقَط الأحداث الأقدم.
- **إعادة الاتصال**: ينبغي للعملاء تطبيق إعادة الاتصال التلقائي مع تراجع أُسّي، إذ قد تُقطَع اتصالات WebSocket أثناء إعادة تشغيل العقد أو ترقياتها.
