---
slug: /api-reference/rest-grpc-endpoints
title: نقاط REST / gRPC
sidebar_label: نقاط REST / gRPC
sidebar_position: 1
---

# نقاط REST / gRPC

توفّر QoreChain ثلاث واجهات أساسية للوصول البرمجي:

| الواجهة | المنفذ الافتراضي | البروتوكول | الوصف                                      |
| ------- | ---------------- | ---------- | ------------------------------------------ |
| REST    | `1317`           | HTTP/1.1   | بوابة REST (خادم API الخاص بـ Cosmos SDK)  |
| gRPC    | `9090`           | HTTP/2     | خدمة gRPC مُرمّزة بـ Protobuf              |
| RPC     | `26657`          | HTTP + WS  | واجهة RPC لمحرّك إجماع QoreChain           |

تُعيد جميع نقاط REST بيانات JSON. تستخدم نقاط gRPC صيغة Protocol Buffers ويمكن استهلاكها بأي عميل gRPC. توفّر واجهة RPC استعلامات على مستوى الإجماع وبثّ المعاملات.

:::note
هذه الواجهات متاحة على كلٍّ من الشبكة الرئيسية **`qorechain-vladi`** (تعمل منذ 29 يونيو 2026) وشبكة الاختبار **`qorechain-diana`**. تفترض عناوين URL الأساسية أدناه عقدة تعمل محليًا. نقاط النهاية العامة المستضافة هي `https://api.qore.host` / `https://api-testnet.qore.host` (REST) و`https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC)، وهي مُدرجة في [الشبكات](/appendix/networks#public-endpoints). **لا توجد نقطة gRPC عامة**: اسما المضيف `grpc.qore.host` و`grpc-testnet.qore.host` غير موجودين، لذا شغّل عقدتك الخاصة إذا كنت بحاجة إلى gRPC.
:::

## عناوين URL الأساسية

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## المسارات الموجودة {#which-routes-exist}

تُعرض الوحدات الخاصة بـ QoreChain عبر REST تحت البادئة `/qorechain/<module>/v1/...`، ولا تملك مسارات REST سوى الوحدات المذكورة أدناه. أما الوحدات الأخرى فيمكن الوصول إليها **عبر gRPC فقط** (انظر [وحدات gRPC فقط](#grpc-only-modules)). وتُدرج مسارات Cosmos SDK وEVM وCosmWasm القياسية في [المسارات القياسية](#standard-routes).

يردّ المسار غير الموجود بـ HTTP `501` مع `{"code":12,"message":"Not Implemented"}`. وهذا يعني أن المسار غير مخدَّم، لا أن الاستعلام عاد فارغًا. أما المسارات المختصرة بدون البادئة `/qorechain/` (مثل `/bridge/v1/chains` أو `/pqc/v1/params`) فهي **غير** مخدَّمة. ويُعيد سجل غير معروف على مسار موجود HTTP `404` مع `{"code":5,"message":"... not found"}`.

تستخدم الأمثلة أدناه المضيف العام للشبكة الرئيسية؛ استبدله بـ `https://api-testnet.qore.host` لشبكة الاختبار.

## وحدة PQC {#pqc-module}

| الطريقة | نقطة النهاية                             | الوصف                                                                              |
| ------- | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| GET     | `/qorechain/pqc/v1/account/{address}`    | تسجيل مفتاح ما بعد الكم لحساب (`found`، نوع المفتاح، الخوارزمية)                    |
| GET     | `/qorechain/pqc/v1/evm_window/{address}` | نافذة التفويض الخاصة بمسار EVM للحساب وما تبقّى منها                                |

لاحظ أن مقطع المسار هو المفرد `account`. لا يوجد مسار `/qorechain/pqc/v1/params` ولا `/stats`.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/account/qor1...
```

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": null,
    "key_type": "hybrid",
    "created_at_height": "209015",
    "migration_public_key": null,
    "migration_algorithm_id": 0
  }
}
```

يُعيد الحساب الذي لا يملك مفتاحًا مسجَّلًا `{"found": false, "account": null}`. استخدم `found` لتقرير ما إذا كان على الحساب تسجيل مفتاح قبل أن يتمكن من الإرسال.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_window/qor1...
```

```json
{
  "found": false,
  "live": false,
  "opened_height": "0",
  "expiry_height": "0",
  "max_txs": "0",
  "used_txs": "0",
  "max_value": "",
  "used_value": "",
  "remaining_blocks": "0",
  "remaining_txs": "0",
  "remaining_value": ""
}
```

لا يفشل هذا المسار أبدًا لعنوان بلا نافذة؛ بل يُعيد `found: false`. منذ v3.2.0 لا يقبل مسار EVM معاملةً إلا من حساب لديه مفتاح PQC مسجَّل **و**نافذة مفتوحة. تكون قيمة `live` هي `true` ما دامت النافذة تقبل معاملة واحدة إضافية على الأقل عند الارتفاع الحالي. تُظهر `remaining_blocks` و`remaining_txs` و`remaining_value` أيّ حدٍّ هو الأقرب إلى النفاد؛ والقيم أعداد صحيحة بوحدة `uqor` تُعاد على هيئة سلاسل نصية. انظر [تطوير EVM](/developer-guide/evm-development) لمعرفة كيف يعمل مسار EVM.

## وحدة الجسر (Bridge Module) {#bridge-module}

تُعرض حالة القراءة فقط لوحدة الجسر عبر REST تحت `/qorechain/bridge/v1/...` (وتخدم بيانات JSON حقيقية على السلسلة منذ إصدار السلسلة **v3.1.77**). يُظهر إعداد `config` الخاص بالجسر مثلًا `min_validators=10` و`attestation_threshold=7`.

| الطريقة | نقطة النهاية                                | الوصف                                    |
| ------- | ------------------------------------------- | ---------------------------------------- |
| GET     | `/qorechain/bridge/v1/config`               | إعدادات وحدة الجسر الحالية               |
| GET     | `/qorechain/bridge/v1/chains`               | يسرد كل السلاسل المسجَّلة في الجسر        |
| GET     | `/qorechain/bridge/v1/chains/{chain_id}`    | تفاصيل سلسلة مُجسَّرة محددة               |
| GET     | `/qorechain/bridge/v1/validators`           | يسرد مدقّقي الجسر المسجَّلين              |
| GET     | `/qorechain/bridge/v1/validators/{address}` | تفاصيل مدقّق جسر محدد                    |
| GET     | `/qorechain/bridge/v1/operations`           | يسرد عمليات الجسر                        |
| GET     | `/qorechain/bridge/v1/operations/{id}`      | تفاصيل عملية جسر محددة                   |

```bash
curl -s https://api.qore.host/qorechain/bridge/v1/config
```

```json
{
  "config": {
    "min_validators": 10,
    "attestation_threshold": 7,
    "challenge_period_secs": "86400",
    "large_transfer_threshold": "100000000000",
    "enabled": true
  }
}
```

يُعيد `chains/{chain_id}` إدخالًا واحدًا مثل `{"chain": {"chain_id": "ethereum", "name": "Ethereum", "chain_type": "evm", "bridge_contract": "0x000…0", "status": "pending", "min_confirmations": 12, ...}}`.

:::caution الجسر ليس مباشرًا بعد
تُبلغ جميع سلاسل الجسر المُهيَّأة وعددها 37 عن `"status": "pending"` على الشبكتين، وتكون `validators` و`operations` قائمتين فارغتين. تعرض هذه المسارات إعدادات الوحدة؛ ولا تعني أنه يمكن تجسير الأصول اليوم. انظر [معمارية الجسر](/architecture/bridge-architecture).
:::

## وحدة الطبقات المتعددة (Multilayer) {#multilayer-module}

تُعرض خدمة الاستعلام الكاملة لوحدة الطبقات المتعددة عبر REST تحت `/qorechain/multilayer/v1/...` (منذ إصدار السلسلة **v3.1.80**)، بما في ذلك استعلامَي قراءة **مرساة الحالة**: يُعيد `anchor/{layer_id}` أحدث مرساة تسوية لطبقة، ويُعيد `anchors/{layer_id}` سجل مراسيها التاريخي. تحمل كل مرساة توقيع **ML-DSA-87 (Dilithium-5)** فوق حقولها القانونية، بحيث يمكن للعميل جلب مرساة والتحقق منها بشكل مستقل — وهذا هو الأساس على السلسلة لـ[إيصالات التسوية](/rollups/settlement-receipts) الخاصة بحزمة تطوير التجميعات (Rollup Development Kit).

| الطريقة | نقطة النهاية                                  | الوصف                                         |
| ------- | --------------------------------------------- | --------------------------------------------- |
| GET     | `/qorechain/multilayer/v1/params`             | معاملات وحدة الطبقات المتعددة الحالية          |
| GET     | `/qorechain/multilayer/v1/layers`             | يسرد كل الطبقات المسجَّلة                      |
| GET     | `/qorechain/multilayer/v1/layers/{layer_id}`  | تفاصيل طبقة محددة                             |
| GET     | `/qorechain/multilayer/v1/anchor/{layer_id}`  | أحدث مرساة حالة لطبقة                          |
| GET     | `/qorechain/multilayer/v1/anchors/{layer_id}` | سجل مراسي الحالة لطبقة                         |
| GET     | `/qorechain/multilayer/v1/routing-stats`      | إحصاءات توجيه المعاملات عبر الطبقات            |

يحتوي `StateAnchorView` على الحقول `layer_id` و`layer_height` و`state_root` و`validator_set_hash` و`main_chain_height` و`anchored_at` و`pqc_aggregate_signature` و`transaction_count` و`compressed_state_proof`. الرسالة القانونية الموقَّعة هي `layer_id || layer_height || state_root || validator_set_hash`، ويتم التحقق منها مقابل مفتاح PQC المسجَّل لمُنشئ الطبقة. تُعيد طبقة بلا مرساة HTTP `404` (`no anchor for layer ...`) من `anchor/{layer_id}` وقائمة فارغة (`{"anchors": []}`) من `anchors/{layer_id}`.

```bash
curl -s https://api.qore.host/qorechain/multilayer/v1/params
```

```json
{
  "params": {
    "max_sidechains": "10",
    "max_paychains": "50",
    "min_anchor_interval": "100",
    "max_anchor_interval": "1000",
    "default_challenge_period": "86400",
    "min_sidechain_stake": "1000000000",
    "min_paychain_stake": "100000000",
    "routing_enabled": true,
    "routing_confidence_threshold": "0.6",
    "cross_layer_fee_bundling": true
  }
}
```

وقت كتابة هذا، تكون `layers` قائمة فارغة على الشبكتين.

## وحدة الحرق (Burn) {#burn-module}

تُعرض حالة القراءة فقط لوحدة الحرق عبر REST تحت `/qorechain/burn/v1/...`. تتضمن معاملات `params` الخاصة بالحرق مثلًا `gas_burn_rate=0.30`.

| الطريقة | نقطة النهاية                          | الوصف                                                              |
| ------- | ------------------------------------- | ------------------------------------------------------------------ |
| GET     | `/qorechain/burn/v1/params`           | معاملات وحدة الحرق الحالية                                          |
| GET     | `/qorechain/burn/v1/stats`            | إجمالي الحرق التراكمي موزَّعًا حسب المصدر                            |
| GET     | `/qorechain/burn/v1/records`          | يسرد سجلات الحرق الأخيرة                                            |
| GET     | `/qorechain/burn/v1/milestone`        | تقدم معلَم الحرق (العدد التراكمي للمعاملات)                          |
| GET     | `/qorechain/burn/v1/stranded_rewards` | حصة المُوثِّقين (stakers) التي خصّصتها ترقية v3.2.0 ولم تُفرَج بعد    |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31560093291491",
    "burns_by_source": {
      "gas_fee": "31560093291491",
      "failed_tx": "0",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3506945"
  }
}
```

تسرد الاستجابة الحقيقية كل مصدر حرق (`ai_service` و`amm` و`auto_buyback` و`bridge_fee` و`contract_create` و`failed_tx` و`gas_fee` و`milestone` و`rollup_create` و`tge` و`treasury_buyback` و`xqore_penalty`)؛ والمثال مقتطع. المبالغ بوحدة `uqor`.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "6693045921330", "released": "0", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` هو ما تبقّى للإفراج عنه، و`released` هو ما نقلته الحوكمة بالفعل، و`snapshot_height` هو ارتفاع ترقية v3.2.0 التي سجّلت الاحتياطي. انظر [الاقتصاد الرمزي (Tokenomics)](/architecture/tokenomics).

## وحدة الحساب المجرَّد (Abstract Account) {#abstract-account-module}

تُعرض خدمة استعلام الحساب المجرَّد عبر REST تحت `/qorechain/abstractaccount/v1/...` (منذ إصدار السلسلة **v3.1.85**)، بما في ذلك **مخطط الأذونات** المستخدَم للتحقق من نطاقات [موثِّق الهوية (authenticator)](/developer-guide/account-abstraction#authenticators) دون ترميزها يدويًا.

| الطريقة | نقطة النهاية                                       | الوصف                                                                     |
| ------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| GET     | `/qorechain/abstractaccount/v1/config`             | إعدادات الوحدة (مسبار الميزة: `enabled`)                                   |
| GET     | `/qorechain/abstractaccount/v1/accounts`           | يسرد الحسابات المجرَّدة                                                    |
| GET     | `/qorechain/abstractaccount/v1/accounts/{address}` | حالة الحساب المجرَّد لعنوان (`404` إن لم يوجد)                              |
| GET     | `/qorechain/abstractaccount/v1/permission_schema`  | `schema_version` و`permissions` و`msg_permissions` و`key_management_msgs`  |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note معطَّلة على الشبكتين
قيمة `enabled` هي `false` اليوم على الشبكة الرئيسية وشبكة الاختبار، لذا فإن ميزات الحساب المجرَّد مثل الإنفاق من المحافظ المرتبطة غير متاحة. استخدم `config.enabled` كمسبار للميزة قبل الاعتماد على هذه الوحدة. انظر [تجريد الحساب](/developer-guide/account-abstraction).
:::

## وحدة AMM {#amm-module}

| الطريقة | نقطة النهاية                                                        | الوصف                                                       |
| ------- | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| GET     | `/qorechain/amm/v1/params`                                          | معاملات AMM الحالية (الرسوم بالنقاط الأساسية، والحدود)        |
| GET     | `/qorechain/amm/v1/pools`                                           | يسرد المجمّعات (pools)                                       |
| GET     | `/qorechain/amm/v1/pools/{pool_id}`                                 | مجمّع واحد (`404` إن كان غير معروف)                          |
| GET     | `/qorechain/amm/v1/pools/{pool_id}/lp/{address}`                    | رصيد رمز LP لعنوان في مجمّع                                  |
| GET     | `/qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=`                | يجد المجمّع الخاص بزوج من الفئات (denoms) (`404` إن لم يوجد)  |
| GET     | `/qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=`    | عرض سعر: المخرَج مقابل مُدخَل محدد بدقة                       |
| GET     | `/qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | عرض سعر: المُدخَل اللازم لمخرَج محدد بدقة                     |

```bash
curl -s https://api.qore.host/qorechain/amm/v1/params
```

```json
{
  "params": {
    "swap_fee_bps": 30,
    "protocol_fee_bps": 10,
    "min_liquidity": "1000",
    "max_pools_per_creator": 50,
    "lp_token_decimals": 6,
    "pool_creation_fee": "100000000",
    "max_swap_impact_bps": 500,
    "enabled": true
  }
}
```

وقت كتابة هذا لا توجد مجمّعات على أيٍّ من الشبكتين (`{"pools": []}`)، ويُعيد عرض السعر لمجمّع غير معروف HTTP `400` مع `{"code":3,"message":"pool not found"}`.

## وحدة الترخيص (Licence) {#licence-module}

| الطريقة | نقطة النهاية                                         | الوصف                                                                 |
| ------- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| GET     | `/qorechain/license/v1/check/{grantee}/{feature_id}` | هل يحمل `grantee` منحة نشطة للميزة (`404` إن لم توجد)                  |
| GET     | `/qorechain/license/v1/holders/{feature_id}`         | كل المنح الخاصة بميزة                                                 |
| GET     | `/qorechain/license/v1/list/{grantee}`               | كل المنح التي يحملها عنوان                                            |

للمنحة (`LicenseView`) الحقول `grantee` و`feature_id` و`expires_at` و`granted_at` و`granted_by` و`suspended` و`metadata`. ويُعيد `check` أيضًا `active`. يُعيد استعلام القائمة أو الحاملين بلا نتائج `{"licenses": []}`؛ ويُعيد `check` لعنوان بلا منحة HTTP `404` مع `{"code":5,"message":"no license for <grantee>/<feature_id>"}`.

```bash
curl -s https://api.qore.host/qorechain/license/v1/holders/lightnode_operator
```

```json
{ "licenses": [] }
```

## وحدة العقدة الخفيفة (Light Node) {#light-node-module}

| الطريقة | نقطة النهاية                                | الوصف                                                                           |
| ------- | ------------------------------------------- | ------------------------------------------------------------------------------- |
| GET     | `/qorechain/lightnode/v1/params`            | معاملات التسجيل ونبضات الحياة (heartbeat) والمكافآت                              |
| GET     | `/qorechain/lightnode/v1/stats`             | `total_registered` و`total_active` و`total_rewards` و`last_reward_height`        |
| GET     | `/qorechain/lightnode/v1/nodes`             | يسرد العقد الخفيفة المسجَّلة                                                     |
| GET     | `/qorechain/lightnode/v1/node/{address}`    | عقدة واحدة (`{"node": null, "found": false}` إن لم تكن مسجَّلة)                   |
| GET     | `/qorechain/lightnode/v1/rewards/{address}` | المكافآت المتراكمة لعنوان مشغّل (`accumulated_rewards`)                          |
| GET     | `/qorechain/lightnode/v1/reward_pool`       | محاسبة مجمّع المكافآت (`balance` و`reserved` و`outstanding` و`payable` و`distributable` و`max_reward_per_block_per_node` و`initialized`) |

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/params
```

```json
{
  "registration_fee": "1000000",
  "heartbeat_interval": "1000",
  "min_delegated_stake": "1000000000",
  "reward_share": "0.030000000000000000",
  "min_uptime_for_rewards": "0.800000000000000000",
  "max_light_nodes": "10000",
  "heartbeat_grace_period": "100"
}
```

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/reward_pool
```

```json
{
  "balance": "<uqor>",
  "reserved": "<uqor>",
  "outstanding": "0",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "0",
  "initialized": true
}
```

`reserved` هو الجزء من المجمّع المحجوز والذي لا يمكن نقله إلا بتصويت حوكمة، و`max_reward_per_block_per_node` (بوحدة `uqor`) هو السقف لكل عقدة ولكل كتلة لما تقيّده السلسلة. السقف ليس مبلغًا موعودًا. تظهر `balance` و`reserved` هنا كعناصر نائبة.

:::note التسجيل غير مفتوح
تُبلغ `stats` عن `"total_registered": "0"` وتكون `nodes` فارغة على الشبكتين، وترفض السلسلة تسجيل عقدة خفيفة بدون منحة ترخيص `lightnode_operator`. انظر [العقد الخفيفة](/light-node/overview) لمعرفة حالة البرنامج.
:::

## وحدات gRPC فقط {#grpc-only-modules}

لهذه الوحدات خدمة gRPC من نوع `Query` لكن **بلا مسار REST**. تتبع أسماء الخدمات الصيغة `qorechain.<module>.v1.Query`.

| الوحدة        | طرق استعلام gRPC (إصدار السلسلة v3.2.0)                     |
| ------------- | ---------------------------------------------------------- |
| `ai`          | `Config`, `Stats`                                          |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                     |
| `reputation`  | `Params`                                                   |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `rdk`         | `Params`, `Rollup`, `Rollups`, `Batch`, `LatestBatch`      |
| `svm`         | `Slot`, `Account`, `Program`                               |
| `qca`         | `Config`                                                   |

استخدم `grpcurl` مقابل عقدتك الخاصة، أو [أوامر الاستعلام في CLI](/cli-reference/query-commands). واستعلامات `rdk` على وجه الخصوص **غير** متاحة عبر REST على الشبكة الرئيسية (يردّ `/qorechain/rdk/v1/...` بـ `501`)، لذا لا يمكن لقارئات التجميعات المعتمدة على REST أن تعمل مع الشبكة الرئيسية اليوم.

لا تملك وحدات xQORE والتضخم وإعادة الرهن بـ BTC (Babylon) وFairBlock وتجريد الغاز أي خدمة استعلام في إصدار الشبكة الرئيسية الحالي على الإطلاق، لا عبر REST ولا عبر gRPC.

## المسارات القياسية {#standard-routes}

تُخدَّم أيضًا مسارات REST القياسية لـ Cosmos SDK وIBC وEVM وCosmWasm. أمثلة تم التحقق منها على الشبكتين:

| نقطة النهاية                                                   | الوصف                                              |
| -------------------------------------------------------------- | -------------------------------------------------- |
| `/cosmos/bank/v1beta1/supply`                                  | الإمداد الكلي                                      |
| `/cosmos/bank/v1beta1/balances/{address}`                      | أرصدة الحساب                                       |
| `/cosmos/staking/v1beta1/validators`                           | المدقّقون                                          |
| `/cosmos/staking/v1beta1/params`                               | معاملات الرهن                                      |
| `/cosmos/distribution/v1beta1/params`                          | معاملات التوزيع                                    |
| `/cosmos/gov/v1/params/voting`                                 | معاملات الحوكمة                                    |
| `/cosmos/slashing/v1beta1/params`                              | معاملات المعاقبة (slashing)                        |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | الترقيات المعلَّقة / المطبَّقة                      |
| `/cosmos/base/node/v1beta1/config`                             | الحد الأدنى لسعر الغاز في العقدة (`0.1uqor` على الشبكتين) |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`                | أحدث كتلة                                          |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | البحث عن المعاملات / الاستعلام عنها / حسب الكتلة    |
| `/cosmos/evm/vm/v1/params`                                     | معاملات وحدة EVM                                   |
| `/cosmos/evm/feemarket/v1/params`                              | معاملات سوق رسوم EVM                               |
| `/cosmwasm/wasm/v1/codes/params`                               | أذونات رفع/إنشاء نسخ CosmWasm                      |
| `/ibc/apps/transfer/v1/params`                                 | معاملات تحويل IBC                                  |

بادئة CosmWasm هي `/cosmwasm/wasm/v1/...`؛ أما `/cosmos/wasm/v1/...` فغير مخدَّمة.

## استكشاف gRPC (Reflection)

تخدم العقدة التي تشغّلها بنفسك gRPC على المنفذ `9090`. وحيثما يكون استكشاف الخادم (server reflection) مُفعَّلًا، يمكن لأدوات مثل `grpcurl` اكتشاف الخدمات المتاحة:

```bash
grpcurl -plaintext localhost:9090 list
```

للاستعلام عن خدمة محددة:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

لدى `qorechain.pqc.v1.Query` طريقتان هما `Account` و`EVMWindow`. لا توجد طريقة `Params`.

## المصادقة

جميع نقاط REST وgRPC غير مُصادَق عليها افتراضيًا. للنشر في بيئة الإنتاج، ضع وكيلًا عكسيًا (مثل Nginx أو Caddy) أمام العقدة للتعامل مع إنهاء TLS والتحكم في الوصول.
