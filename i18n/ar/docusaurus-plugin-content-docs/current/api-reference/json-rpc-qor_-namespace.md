---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — مساحة الأسماء qor_
sidebar_label: JSON-RPC — مساحة الأسماء qor_
sidebar_position: 2
---

# JSON-RPC — مساحة الأسماء qor_

صُمّمت مساحة الأسماء `qor_` لتوفير طرق JSON-RPC خاصة بـ QoreChain للاستعلام عن حالة التشفير ما بعد الكمومي، وتحليلات الذكاء الاصطناعي، والمراسلة عبر الأجهزة الافتراضية، والحالة متعددة الطبقات، وعمليات الجسر، واقتصاديات الرمز، وبنية الـ rollup التحتية، وحالة إجماع PRISM.

:::warning الطرق المخطَّط لها غير متاحة بعد
**لا توجد أي طريقة من الطرق الواردة في الجدول أدناه متاحة على أي شبكة حتى الآن.** هي مُنفّذة في الشيفرة المصدرية للعقدة لكنها غير مسجّلة لدى خادم JSON-RPC، وتُرجع كل منها `-32601` (method not found). تسجيلها مخطَّط له في إصدار قادم للعقدة، وستذكر هذه الصفحة أي إصدار عند صدوره. لا تبنِ عليها اليوم؛ استخدم مسارات REST في الجدول حيثما وُجد مسار. وتغلّف مكتبات العملاء التي توفّر دوال `client.qor.*` هذه الطرق نفسها، لذا تفشل تلك الدوال بالطريقة نفسها.
:::

## ما هو متاح: `qor_getKEMKey` {#qor-getkemkey}

طريقة واحدة من مساحة الأسماء متاحة: تُرجع `qor_getKEMKey(address)` مفتاح ML-KEM العام الذي نشره عنوان ما (يمكن أن يكون `address` بصيغة `qor1...` أو `0x`). تردّ بالقيمة `{"address": ..., "found": false}` حين لا يوجد مفتاح منشور، وفي غير ذلك تضيف `algorithm_id` و`algorithm_name` و`public_key` (سداسي عشري بالبادئة `0x`) و`registered_height`. لا تقدّم العقدة مساحة الأسماء `qor` إلا حيث تتضمن قائمة `api` ضمن `[json-rpc]` في `app.toml` القيمة `qor`.

لوحظ في 7 نوفمبر 2026:

| الشبكة | `rpc_modules` | `qor_getKEMKey` |
| --- | --- | --- |
| الشبكة التجريبية (`https://evm-testnet.qore.host`) | `eth`، `net`، `qor`، `rpc`، `txpool`، `web3` | تردّ (`found: false` لعنوان لا يملك مفتاحًا منشورًا) |
| الشبكة الرئيسية (`https://evm.qore.host`) | `eth`، `net`، `rpc`، `txpool`، `web3` | `-32601` (نقطة النهاية العامة للشبكة الرئيسية لا تسرد `qor`) |

وعلى الشبكة التجريبية، ما زالت كل طريقة `qor_` أخرى جرى فحصها (`qor_getPQCKeyStatus` و`qor_getHybridSignatureMode` و`qor_getAIStats` و`qor_getBurnStats`) تُرجع `-32601`.

يمكنك التحقق من قائمة مساحات الأسماء بنفسك:

```bash
curl -s -X POST https://evm.qore.host \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"rpc_modules","params":[],"id":1}'
```

```json
{"jsonrpc":"2.0","id":1,"result":{"eth":"1.0","net":"1.0","rpc":"1.0","txpool":"1.0","web3":"1.0"}}
```

---

## الطرق المخطَّط لها وما يُستخدم اليوم

| الطريقة المخطَّط لها                | ما يُستخدم اليوم |
| ----------------------------- | ----------------- |
| `qor_getPQCKeyStatus`         | `GET /qorechain/pqc/v1/account/{address}` ‏(`found` و`account.key_type` و`account.created_at_height`). راجع [نقاط نهاية REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module). |
| `qor_getHybridSignatureMode`  | لا يوجد مسار REST عام؛ استخدم `qorechaind query pqc hybrid-mode` (أو `query pqc params`) على عقدة أو مع `--node https://rpc.qore.host:443`. |
| إحصاءات الذكاء الاصطناعي (مخطَّطة؛ اسم الطريقة غير نهائي) | gRPC ‏`qorechain.ai.v1.Query/Stats` على عقدة تشغّلها، أو `qorechaind query ai stats`؛ لا يوجد مسار REST. |
| `qor_getCrossVMMessage`       | gRPC ‏`qorechain.crossvm.v1.Query/Message` على عقدة تشغّلها؛ لا يوجد مسار REST. |
| `qor_getReputationScore`      | لا يوجد مسار استعلام عام (تتيح وحدة السمعة `Params` فقط عبر gRPC). |
| `qor_getLayerInfo`            | `GET /qorechain/multilayer/v1/layers/{layer_id}` و`anchor/{layer_id}`. راجع [وحدة Multilayer](/api-reference/rest-grpc-endpoints#multilayer-module). |
| `qor_getBridgeStatus`         | `GET /qorechain/bridge/v1/chains/{chain_id}`. راجع [وحدة Bridge](/api-reference/rest-grpc-endpoints#bridge-module). الجسر ليس حيًّا بعد. |
| `qor_getRLAgentStatus`، `qor_getRLObservation`، `qor_getRLReward` | ابتداءً من v3.2.6 (على الشبكتين): `GET /qorechain/rlconsensus/v1/agent` و`/observation` و`/reward` (وكذلك `/params` و`/policy` و`/applied_params` و`/last_action`)؛ راجع [وحدة RL Consensus](/api-reference/rest-grpc-endpoints#rlconsensus-module). ردّت هذه المسارات بالرمز `200` على مضيف الشبكة الرئيسية العام في 4 نوفمبر 2026؛ وعلى عقدة أقدم من v3.2.6 تردّ بالرمز `501`، وتكون خدمة gRPC ‏`qorechain.rlconsensus.v1.Query` ‏(`AgentStatus` و`Observation` و`Reward`) هي الطريقة لقراءتها. |
| `qor_getPoolClassification`   | لا يوجد مسار استعلام عام. |
| `qor_getBurnStats`            | `GET /qorechain/burn/v1/stats`. راجع [وحدة Burn](/api-reference/rest-grpc-endpoints#burn-module). |
| `qor_getXQOREPosition`        | لا شيء. xQORE غير مُفعَّل (راجع [الرهن عبر xQORE](/user-guide/xqore-staking)). |
| `qor_getInflationRate`        | `GET /qorechain/inflation/v1/params` و`/epoch_info` (نمط الإصدار، والكمية لكل حقبة، والسقف، والتقدّم؛ متاحان منذ v3.2.2). راجع [وحدة Inflation](/api-reference/rest-grpc-endpoints#inflation-module). |
| `qor_getTokenomicsOverview`   | اجمع بين `GET /qorechain/burn/v1/stats` و`GET /qorechain/inflation/v1/epoch_info` و`GET /cosmos/bank/v1beta1/supply`. |
| `qor_getRollupStatus`، `qor_listRollups`، `qor_getSettlementBatch`، `qor_getDABlobStatus` | `GET /qorechain/rdk/v1/rollup/{id}` و`/rollups` و`/batch/{id}/{index}` و`/latest_batch/{id}` و`/batches/{id}` و`/blob/{id}/{index}` (متاحة منذ v3.2.2؛ راجع [وحدة RDK](/api-reference/rest-grpc-endpoints#rdk-module))، أو `qorechaind query rdk`. |
| `qor_suggestRollupProfile`    | لا توجد خدمة عامة؛ راجع [الملفات التعريفية الجاهزة](/rollups/preset-profiles). |
| `qor_getBTCStakingPosition`   | لا شيء. وحدة إعادة الرهن بـ BTC لا تملك خدمة استعلام بعد. |
| `qor_getAbstractAccount`      | `GET /qorechain/abstractaccount/v1/accounts/{address}`. الحسابات المجرَّدة معطَّلة على الشبكة الرئيسية ومفعَّلة على شبكة الاختبار (جرى التحقق في 27 أكتوبر 2026). |
| `qor_getGasAbstractionConfig` | `GET /qorechain/gasabstraction/v1/config` (متاح منذ v3.2.2). راجع [وحدة Gas Abstraction](/api-reference/rest-grpc-endpoints#gas-abstraction-module). |
| `qor_getFairBlockStatus`، `qor_getLaneConfiguration` | لا شيء. |

لمعرفة حالة حساب على مسار EVM (مفتاح PQC المسجَّل ونافذة التفويض وموافقة EIP-7702) استخدم `GET /qorechain/pqc/v1/account/{address}` و`GET /qorechain/pqc/v1/evm_window/{address}` و`GET /qorechain/pqc/v1/evm_delegation_consent/{address}`. مسار الحالة هو `account` بصيغة **المفرد**؛ أما `/accounts/` بصيغة الجمع فغير متاح ويردّ بالرمز `501`.

---

## رموز الأخطاء

تتبع الأخطاء رموز JSON-RPC 2.0 القياسية. أما اليوم فتفشل استدعاءات أي طريقة `qor_` مخطَّط لها بالرمز `-32601`، وعلى نقطة نهاية الشبكة الرئيسية كذلك `qor_getKEMKey`.

| الرمز   | الرسالة          | الوصف                           |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | طلب JSON-RPC مشوَّه            |
| -32601 | Method not found | الطريقة غير موجودة، أو أن العقدة لا تقدّم مساحة الأسماء `qor_` (كل طريقة مخطَّطة اليوم؛ وكذلك `qor_getKEMKey` حيث لا تكون `qor` مفعَّلة) |
| -32602 | Invalid params   | معاملات مفقودة أو غير صالحة         |
| -32603 | Internal error   | خطأ في المعالجة من جانب الخادم          |
