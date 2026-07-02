---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — مساحة الأسماء qor_
sidebar_label: JSON-RPC — مساحة الأسماء qor_
sidebar_position: 2
---

# JSON-RPC — مساحة الأسماء qor_

توفّر مساحة الأسماء `qor_` طرق JSON-RPC الخاصة بـ QoreChain للاستعلام عن حالة التشفير ما بعد الكمومي، وتحليلات الذكاء الاصطناعي، والمراسلة عبر الأجهزة الافتراضية، والحالة متعددة الطبقات، وعمليات الجسر، واقتصاديات الرمز، وبنية الـ rollup التحتية، وحالة إجماع PRISM.

## الاتصال

| النقل     | العنوان الافتراضي       |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

تُقدَّم مساحة الأسماء `qor_` إلى جانب `eth_` و`web3_` و`net_` و`txpool_` على المنافذ نفسها. فعّلها في `app.toml`:

```toml
[json-rpc]
api = "eth,web3,net,txpool,qor"
```

:::note
تتوفّر مساحة الأسماء `qor_` على شبكة **`qorechain-vladi`** الرئيسية (معرّف سلسلة EVM **9801**، تعمل على إصدار السلسلة **v3.1.82**) وشبكة **`qorechain-diana`** الاختبارية (معرّف سلسلة EVM **9800**). تفترض الأمثلة أدناه عقدة محلية؛ استبدلها بنقطة نهاية الشبكة الرئيسية أو الاختبارية الخاصة بمزوّدك للوصول عن بُعد.
:::

---

## الطرق

| الطريقة                        | المعاملات                              | الوصف                                                  |
| ----------------------------- | --------------------------------------- | -------------------------------------------------------- |
| `qor_getPQCKeyStatus`         | `address` (string)                      | تُرجِع حالة تسجيل مفتاح PQC لحساب       |
| `qor_getHybridSignatureMode`  | لا شيء                                   | تُرجِع وضع فرض التوقيع الهجين الحالي        |
| `qor_getAIStats`              | لا شيء                                   | تُرجِع إحصاءات معالجة وحدة الذكاء الاصطناعي المجمّعة       |
| `qor_getCrossVMMessage`       | `messageId` (string)                    | تسترجع رسالة عبر الأجهزة الافتراضية حسب معرّفها                   |
| `qor_getReputationScore`      | `validator` (string)                    | تُرجِع درجة السمعة لعنوان مُدقِّق         |
| `qor_getLayerInfo`            | `layerId` (string)                      | تُرجِع البيانات الوصفية والحالة لطبقة مسجَّلة       |
| `qor_getBridgeStatus`         | `chainId` (string)                      | تُرجِع حالة الجسر والإجماليات المقفلة لسلسلة      |
| `qor_getRLAgentStatus`        | لا شيء                                   | تُرجِع الوضع الحالي لوكيل PRISM وحالة التشغيل  |
| `qor_getRLObservation`        | لا شيء                                   | تُرجِع أحدث متّجه مراقبة لـ PRISM             |
| `qor_getRLReward`             | لا شيء                                   | تُرجِع مقاييس مكافأة PRISM التراكمية                  |
| `qor_getPoolClassification`   | `validator` (string)                    | تُرجِع تصنيف مجمّع CPoS لمُدقِّق         |
| `qor_getBurnStats`            | لا شيء                                   | تُرجِع إحصاءات الحرق عبر جميع القنوات        |
| `qor_getXQOREPosition`        | `address` (string)                      | تُرجِع وضعية رهان xQORE لعنوان            |
| `qor_getInflationRate`        | لا شيء                                   | تُرجِع معدّل التضخم السنوي الحالي                |
| `qor_getTokenomicsOverview`   | لا شيء                                   | تُرجِع نظرة عامة مجمّعة على الحرق والتضخم والمعروض    |
| `qor_getRollupStatus`         | `rollupId` (string)                     | تُرجِع الحالة والتهيئة لـ rollup محدّد   |
| `qor_listRollups`             | لا شيء                                   | تُرجِع قائمة بجميع الـ rollups المسجَّلة                 |
| `qor_getSettlementBatch`      | `rollupId` (string)، `batchIndex` (int) | تُرجِع دفعة تسوية محدّدة لـ rollup         |
| `qor_suggestRollupProfile`    | `useCase` (string)                      | توصية بملف تعريف rollup بمساعدة الذكاء الاصطناعي لحالة استخدام |
| `qor_getDABlobStatus`         | `rollupId` (string)، `blobIndex` (int)  | تُرجِع حالة كتلة DA محدّدة         |
| `qor_getBTCStakingPosition`   | `address` (string)                      | تُرجِع وضعية رهان BTC عبر وحدة Babylon         |
| `qor_getAbstractAccount`      | `address` (string)                      | تُرجِع تفاصيل الحساب المجرَّد وقواعد الإنفاق     |
| `qor_getFairBlockStatus`      | لا شيء                                   | تُرجِع حالة تشفير FairBlock وتهيئته    |
| `qor_getGasAbstractionConfig` | لا شيء                                   | تُرجِع الرموز المقبولة ومعاملات تجريد الغاز   |
| `qor_getLaneConfiguration`    | لا شيء                                   | تُرجِع تهيئة ترتيب أولوية المعاملات على 5 مسارات   |

---

## أمثلة

### qor_getBurnStats

**الطلب:**

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

**الاستجابة:**

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

**الطلب:**

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

**الاستجابة:**

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

**الطلب:**

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

**الاستجابة:**

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

## رموز الأخطاء

| الرمز   | الرسالة          | الوصف                           |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | طلب JSON-RPC مشوَّه            |
| -32601 | Method not found | الطريقة غير موجودة             |
| -32602 | Invalid params   | معاملات مفقودة أو غير صالحة         |
| -32603 | Internal error   | خطأ في المعالجة من جانب الخادم          |
| -32000 | Module disabled  | الوحدة المستعلَم عنها غير مُفعَّلة     |
| -32001 | Entity not found | المورد المطلوب غير موجود |
