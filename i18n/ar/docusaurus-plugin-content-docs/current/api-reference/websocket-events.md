---
slug: /api-reference/websocket-events
title: أحداث WebSocket
sidebar_label: أحداث WebSocket
sidebar_position: 5
---

# أحداث WebSocket

توفّر QoreChain بثّ الأحداث في الوقت الفعلي عبر واجهتي WebSocket: واجهة WebSocket المتوافقة مع EVM وواجهة RPC WebSocket لمحرّك إجماع QoreChain.

:::note
تتوفّر واجهة RPC WebSocket لمحرّك الإجماع للعموم على كلٍّ من الشبكة الرئيسية **`qorechain-vladi`** والشبكة الاختبارية **`qorechain-diana`**. أما واجهة EVM WebSocket فهي متاحة للعموم على **الشبكة الاختبارية فقط**: لا توجد واجهة EVM WebSocket عامة للشبكة الرئيسية (`wss://evm.qore.host` و`wss://evm-ws.qore.host` لا تقبلان اتصالات WebSocket)، لذا شغّل عقدتك الخاصة على الشبكة الرئيسية لاستخدام `eth_subscribe`. تفترض نقاط النهاية المحلية أدناه عقدة تشغّلها بنفسك.

| الواجهة | الشبكة الرئيسية | الشبكة الاختبارية |
| --------- | ------- | ------- |
| RPC WebSocket | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| EVM WebSocket | لا يوجد (عقدتك الخاصة فقط) | `wss://evm-ws-testnet.qore.host` |
:::

---

## EVM WebSocket

**نقطة النهاية:** `ws://localhost:8546` على عقدتك الخاصة؛ الشبكة الاختبارية العامة: `wss://evm-ws-testnet.qore.host`. لا توجد واجهة EVM WebSocket عامة للشبكة الرئيسية.

تدعم واجهة EVM WebSocket طريقة `eth_subscribe` القياسية لبثّ الأحداث في الوقت الفعلي بشكل متوافق مع أدوات Ethereum.

### أنواع الاشتراك

| الاشتراك                 | الوصف                                      |
| ------------------------ | ------------------------------------------------ |
| `newHeads`               | يُصدِر ترويسة في كل مرة تُضاف فيها كتلة جديدة |
| `logs`                   | يُصدِر السجلّات المطابقة لمرشِّح اختياري           |
| `newPendingTransactions` | يُصدِر تجزئات المعاملات الداخلة إلى الـ mempool    |

اشتراك `syncing` غير مُنفَّذ: يُرجع `eth_subscribe` مع `"syncing"` الخطأ `-32600 syncing subscription is not implemented`. استعلم عن `eth_syncing` عبر HTTP بدلًا من ذلك.

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

**نقطة النهاية:** `ws://localhost:26657/websocket` على عقدتك الخاصة؛ العامة: `wss://rpc.qore.host/websocket` (الشبكة الرئيسية) و`wss://rpc-testnet.qore.host/websocket` (الشبكة الاختبارية).

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
    "query": "tm.event='Tx' AND bridge_deposit.chain EXISTS"
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

تُصدَر الأحداث بوصفها أحداثًا قياسية لمحرّك الإجماع. اشترك باستعلام `tm.event='Tx'` مُرشَّح حسب نوع الحدث والسمة (على سبيل المثال `tm.event='Tx' AND bridge_deposit.chain EXISTS`). أما الأحداث على مستوى الكتلة (تلك التي تُصدرها منطق نهاية الكتلة، مثل أحداث PRISM أدناه) فتُسلَّم عبر `tm.event='NewBlock'` وليس `Tx`. الأسماء والسمات الواردة أدناه هي لإصدار السلسلة v3.2.0.

:::note الأحداث التي ستراها فعليًا
كثير من هذه الوحدات خاملة على الشبكات العامة: الجسر غير مُفعَّل، ولم تُسجَّل بعد أي طبقات multilayer أو rollups، وxQORE غير قابل للاستخدام. أحداثها معرَّفة لكنها لا تُطلَق حتى يوجد نشاط. أما حدثا المراقبة والمكافأة في PRISM (`rl_observation_collected` و`rl_reward_computed`) فيُصدَران نحو كل 10 كتل على كلتا الشبكتين.
:::

### وحدة PQC

| نوع الحدث                  | السمات الرئيسية                                            | الوصف                                          |
| --------------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| `pqc_verify`                | `address`، `key_type`، `algorithm_id`، `hybrid_mode`، `status` | يُصدَر عند كل فحص لتوقيع PQC             |
| `pqc_hybrid_verify`         | `address`، `algorithm_id`، `status`                       | يُصدَر عند كل تحقّق من توقيع هجين        |
| `pqc_hybrid_classical_only` | `address`، `hybrid_mode`                                  | يُصدَر عندما يقبل الوضع الحالي توقيعًا كلاسيكيًا فقط |
| `pqc_key_registered`        | `address`، `key_type`، `algorithm_id`                     | يُصدَر عند تسجيل مفتاح PQC                 |
| `pqc_key_rotated`           | `address`، `algorithm_id`                                 | يُصدَر عند تدوير مفتاح PQC                    |
| `pqc_key_migrated`          | `address`، `from_algorithm`، `to_algorithm`               | يُصدَر عند ترحيل مفتاح إلى خوارزمية جديدة    |
| `pqc_evm_window_opened`     | `address`، `expiry_height`، `max_txs`، `max_value`        | يُصدَر عند فتح نافذة تفويض لمسار EVM  |
| `pqc_evm_window_closed`     | `address`                                                 | يُصدَر عند إغلاق نافذة تفويض لمسار EVM |

تُسجَّل مفاتيح PQC صراحةً بمعاملة تسجيل؛ ولا يوجد حدث تسجيل تلقائي.

### وحدة الجسر

| نوع الحدث                    | السمات الرئيسية                                           | الوصف                                  |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `bridge_deposit`              | `operation_id`، `chain`، `asset`، `amount`، `sender`     | يُصدَر عند تسجيل إيداع وارد  |
| `bridge_withdraw`             | `operation_id`، `chain`، `asset`، `amount`، `sender`، `receiver` | يُصدَر عند تسجيل عملية سحب |
| `bridge_attestation`          | `operation_id`، `validator`، `chain`، `pqc_verified`، `attestations` | يُصدَر عند كل إقرار من مدقّق |
| `bridge_operation_executed`   | `operation_id`، `status`                                 | يُصدَر عند اكتمال عملية          |
| `bridge_circuit_breaker_trip` | `chain`، `status`، `reason`                              | يُصدَر عند تفعيل قاطع دائرة الجسر لسلسلة ما |

### وحدة Cross-VM

| نوع الحدث         | السمات الرئيسية                                                              | الوصف                                           |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| `crossvm_request`  | `message_id`، `source_vm`، `target_vm`، `target_contract`، `sender`         | يُصدَر عند بدء استدعاء عبر الأجهزة الافتراضية             |
| `crossvm_response` | `message_id`، `status`                                                      | يُصدَر عند اكتمال استدعاء عبر الأجهزة الافتراضية                |
| `crossvm_timeout`  | `message_id`                                                                | يُصدَر عند تجاوز رسالة عبر الأجهزة الافتراضية لمهلة قائمة الانتظار |

### وحدة Multilayer

| نوع الحدث              | السمات الرئيسية                                                                               | الوصف                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `state_anchored`        | `layer_id`، `layer_height`، `state_root`، `main_chain_height`، `pqc_verified`، `transaction_count` | يُصدَر عند قبول تثبيت حالة طبقة |
| `anchor_challenged`     | `layer_id`، `layer_height`، `challenger`، `challenge_reason`، `resolution`                   | يُصدَر عند الطعن في تثبيت         |
| `layer_status_updated`  | `layer_id`، `status`، `reason`                                                               | يُصدَر عند تغيّر حالة طبقة          |
| `sidechain_registered`، `paychain_registered` | `layer_id`، `layer_type`، `creator`، `status`                          | يُصدَر عند تسجيل طبقة           |
| `transaction_routed`    | `selected_layer`، `routing_reason`، `gas_savings`، `latency_ms`، `sender`                    | يُصدَر عند توجيه معاملة إلى طبقة |

### وحدة RDK

| نوع الحدث        | السمات الرئيسية                                              | الوصف                                      |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| `rollup_created`  | `rollup_id`، `creator`، `profile`، `settlement_mode`        | يُصدَر عند تسجيل rollup جديد          |
| `batch_submitted` | `rollup_id`، `batch_index`، `tx_count`                      | يُصدَر عند تقديم دفعة تسوية     |
| `batch_finalized` | `rollup_id`، `batch_index`                                  | يُصدَر عند اجتياز دفعة لنافذة التحدّي الخاصة بها |
| `da_blob_stored`  | `rollup_id`، `blob_index`، `backend`، `size`                | يُصدَر عند تخزين كتلة DA                |
| `da_blob_pruned`  | `rollup_id`، `blob_index`                                   | يُصدَر عند تقليم كتلة DA بعد فترة الاحتفاظ |

### وحدة الحرق

| نوع الحدث               | السمات الرئيسية                                            | الوصف                                         |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------- |
| `burn`                   | `source`، `amount`                                        | يُصدَر عند حرق الرموز بشكل دائم          |
| `milestone_burn`         | `tx_threshold`، `burn_amount`، `cumulative_tx_count`      | يُصدَر عند تنفيذ حرق مرتبط بمَعلَم عدد المعاملات |
| `burn_stranded_released` | `amount`، `destination`، `remaining`                      | يُصدَر عندما تُفرِج الحوكمة عن جزء من حصة المُراهِنين (stakers) العالقة |

### وحدة xQORE

هذه الأحداث لا تُصدَر بعد: xQORE غير مُفعَّل في أي إصدار منشور من العقدة (راجع [تخزين xQORE (Staking)](/user-guide/xqore-staking)).

| نوع الحدث    | السمات الرئيسية                                                        | الوصف                              |
| -------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| `xqore_lock`   | `owner`، `amount`                                                     | يُصدَر عند قفل QOR في xQORE    |
| `xqore_unlock` | `owner`، `amount`، `penalty`، `burned`، `redistributed`، `returned`   | يُصدَر عند فتح قفل xQORE وإعادته إلى QOR |

### وحدة إجماع PRISM (إجماع RL)

هذه أحداث نهاية الكتلة، تُسلَّم عبر تدفّق `NewBlock`.

| نوع الحدث                     | السمات الرئيسية          | الوصف                                                   |
| ------------------------------ | ----------------------- | ------------------------------------------------------------- |
| `rl_observation_collected`     | `height`                | يُصدَر عند أخذ مشاهدة PRISM (نحو كل 10 كتل) |
| `rl_reward_computed`           | `height`، `reward`      | يُصدَر عند حساب مكافأة PRISM                     |
| `rl_action_applied`            | `height`، `agent_mode`  | يُصدَر عندما يطبّق وكيل PRISM تعديل معامل   |
| `rl_agent_mode_changed`        | `height`، `agent_mode`  | يُصدَر عند تغيّر وضع الوكيل                   |
| `rl_circuit_breaker_triggered` | `height`                | يُصدَر عندما يحظر قاطع دائرة PRISM إجراءً       |
| `rl_circuit_breaker_recovered` | `height`                | يُصدَر عند تعافي قاطع الدائرة                     |

### وحدة الذكاء الاصطناعي

| نوع الحدث         | السمات الرئيسية                                   | الوصف                                         |
| ------------------ | ------------------------------------------------ | --------------------------------------------------- |
| `ai_anomaly_check` | `score_millionths`، `action`، `is_anomalous`     | يُصدَر لكل معاملة يُحتسَب لها تقييم شذوذ         |

---

## مثال على عميل JavaScript

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

### QoreChain RPC WebSocket (أصلي)

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

## ملاحظات

- **حدود الاتصال**: على عقدة تشغّلها بنفسك، العدد الأقصى الافتراضي لاتصالات WebSocket غير محدود (`max-open-connections = 0`). عيّن حدًّا في `app.toml` لعمليات النشر الإنتاجية. وتطبّق نقاط النهاية العامة حدودها الخاصة.
- **مخزن الأحداث المؤقت**: تخزّن واجهة RPC WebSocket مؤقتًا عددًا محدودًا من الأحداث لكل اشتراك (القيمة الافتراضية 200 على عقدة مستضافة ذاتيًا). إذا تأخّر العميل، تُسقَط الأحداث الأقدم.
- **إعادة الاتصال**: ينبغي للعملاء تطبيق إعادة الاتصال التلقائي مع تراجع أُسّي، إذ قد تُقطَع اتصالات WebSocket أثناء إعادة تشغيل العقد أو ترقياتها.
