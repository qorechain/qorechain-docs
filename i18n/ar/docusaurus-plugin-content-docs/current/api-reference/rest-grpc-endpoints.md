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
هذه الواجهات متاحة على كلٍّ من الشبكة الرئيسية **`qorechain-vladi`** (تعمل منذ 7 يونيو 2026؛ إصدار العقدة **v3.2.3**) وشبكة الاختبار **`qorechain-diana`** (إصدار العقدة **v3.2.4**). تعمل الشبكة الرئيسية بالإصدار v3.2.3 حتى الارتفاع 3,742,566 وبالإصدار v3.2.4 من تلك الكتلة (مقترح الحوكمة 13). تفترض عناوين URL الأساسية أدناه عقدة تعمل محليًا. نقاط النهاية العامة المستضافة هي `https://api.qore.host` / `https://api-testnet.qore.host` (REST) و`https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC)، وهي مُدرجة في [الشبكات](/appendix/networks#public-endpoints). **لا توجد نقطة gRPC عامة**: اسما المضيف `grpc.qore.host` و`grpc-testnet.qore.host` غير موجودين، لذا شغّل عقدتك الخاصة إذا كنت بحاجة إلى gRPC.
:::

## عناوين URL الأساسية

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## المسارات الموجودة {#which-routes-exist}

تُعرض الوحدات الخاصة بـ QoreChain عبر REST تحت البادئة `/qorechain/<module>/v1/...`، ولا تملك مسارات REST سوى الوحدات المذكورة أدناه. أما الوحدات الأخرى فيمكن الوصول إليها **عبر gRPC فقط** (انظر [وحدات gRPC فقط](#grpc-only-modules)). وتُدرج مسارات Cosmos SDK وEVM وQoreChain Native القياسية في [المسارات القياسية](#standard-routes).

يردّ المسار غير الموجود بـ HTTP `501` مع `{"code":12,"message":"Not Implemented"}`. وهذا يعني أن المسار غير مخدَّم، لا أن الاستعلام عاد فارغًا. أما المسارات المختصرة بدون البادئة `/qorechain/` (مثل `/bridge/v1/chains` أو `/pqc/v1/params`) فهي **غير** مخدَّمة. ويُعيد سجل غير معروف على مسار موجود HTTP `404` مع `{"code":5,"message":"... not found"}`.

تستخدم الأمثلة أدناه المضيف العام للشبكة الرئيسية؛ استبدله بـ `https://api-testnet.qore.host` لشبكة الاختبار. قُرئت القيم في الأمثلة من الشبكتين الحيّتين نحو 20 و21 أكتوبر 2026 (الشبكة الرئيسية v3.2.3، وشبكة الاختبار v3.2.4) وتتغيّر مع الوقت؛ استخدمها لمعرفة شكل الاستجابة. يضيف إصدار v3.2.4 بعض المسارات والحقول. وهي موسومة أدناه بعبارة **v3.2.4**: تخدمها شبكة الاختبار منذ 19 أكتوبر 2026، وتخدمها الشبكة الرئيسية من الارتفاع 3,742,566، وإلى ذلك الحين تردّ عليها عقدة الشبكة الرئيسية بـ `501`.

## وحدة PQC {#pqc-module}

| الطريقة | نقطة النهاية                             | الوصف                                                                              |
| ------- | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| GET     | `/qorechain/pqc/v1/account/{address}`    | تسجيل مفتاح ما بعد الكم لحساب (`found`، نوع المفتاح، الخوارزمية)                    |
| GET     | `/qorechain/pqc/v1/evm_window/{address}` | نافذة التفويض الخاصة بمسار EVM للحساب وما تبقّى منها                                |
| GET     | `/qorechain/pqc/v1/evm_delegation_consent/{address}` | موافقة الحساب على تفويض EIP-7702، والتفويض الحالي، ورقم تسلسل EVM (nonce) (منذ v3.2.2) |
| GET     | `/qorechain/pqc/v1/protocol_features`    | **v3.2.4** (شبكة الاختبار منذ 19 أكتوبر 2026؛ الشبكة الرئيسية من الارتفاع 3,742,566؛ و`501` على الشبكة الرئيسية قبل ذلك). كل ميزة بروتوكول يعرفها الملف التنفيذي، مع العلامات `enabled` و`known` و`staged` |

لاحظ أن مقطع المسار هو المفرد `account`. لا يوجد مسار `/qorechain/pqc/v1/params` ولا `/stats` (استخدم `qorechaind query pqc params` و`stats` لهما).

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
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account"
  }
}
```

يوضّح `classical_key_source` مصدر `ecdsa_pubkey`: القيمة `stored` (المفتاح المُعطى عند التسجيل)، أو `auth_account` (لم يُخزَّن شيء، فهو المفتاح العام للحساب نفسه على السلسلة)، أو `none`. ومن v3.2.4 (على شبكة الاختبار منذ 19 أكتوبر 2026؛ وعلى الشبكة الرئيسية من الارتفاع 3,742,566) يحمل السجل أيضًا الحقل `"possession_proven": false`، وتصبح قيمته `true` متى سُجّل المفتاح مع [إثبات حيازة](/developer-guide/post-quantum-signing#proof-of-possession) جرى التحقق منه؛ أما عقدة الشبكة الرئيسية التي ما زالت على v3.2.3 فلا تُبلغ عن هذا الحقل.

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
  "remaining_value": "",
  "native_only": false,
  "allowed_targets": []
}
```

لا يفشل هذا المسار أبدًا لعنوان بلا نافذة؛ بل يُعيد `found: false`. منذ v3.2.0 لا يقبل مسار EVM معاملةً إلا من حساب لديه مفتاح PQC مسجَّل **و**نافذة مفتوحة. تكون قيمة `live` هي `true` ما دامت النافذة تقبل معاملة واحدة إضافية على الأقل عند الارتفاع الحالي. تُظهر `remaining_blocks` و`remaining_txs` و`remaining_value` أيّ حدٍّ هو الأقرب إلى النفاد؛ والقيم أعداد صحيحة بوحدة `uqor` تُعاد على هيئة سلاسل نصية. ومنذ v3.2.3 يمكن أن تحمل النافذة نطاقًا: `native_only` (تحويلات QOR العادية فقط) و`allowed_targets` (المستلمون المدرجون فقط). انظر [تطوير EVM](/developer-guide/evm-development#evm-window) لمعرفة كيف يعمل مسار EVM.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_delegation_consent/qor1...
```

```json
{
  "found": false,
  "live": false,
  "delegate": "",
  "granted_height": "0",
  "expiry_height": "0",
  "current_delegate": "",
  "nonce": "0"
}
```

لا يسري تفويض EIP-7702 لحساب ما إلا بموافقة الحساب نفسه بمفتاح ما بعد الكم (`MsgAuthorizeEVMDelegation`). تُبلغ `found` و`live` عن موافقة مسجَّلة ما زالت صالحة للاستخدام لصالح `delegate`؛ أما `current_delegate` فهو التفويض الذي ضبطه الحساب الآن، و`nonce` هو رقم تسلسل EVM الخاص به.

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

يحتوي `StateAnchorView` على الحقول `layer_id` و`layer_height` و`state_root` و`validator_set_hash` و`main_chain_height` و`anchored_at` و`pqc_aggregate_signature` و`transaction_count` و`compressed_state_proof`. ومنذ v3.2.2 تكون الرسالة الموقَّعة هي **رسالة المرساة v2**: وسم النطاق `qorechain-multilayer-anchor-v2`، ثم معرّف السلسلة ومعرّف الطبقة وارتفاع الطبقة وجذر الحالة وتجزئة مجموعة المدقّقين وعدد المعاملات وإثبات الحالة المضغوط، ويُسبق كل حقل متغيّر الطول بطوله في 8 بايتات بترتيب big-endian (لم تكن الرسالة v1 السابقة تتضمن معرّف السلسلة ولا بادئات الطول، لذا كان التوقيع صالحًا على كل سلسلة). ويتم التحقق منها مقابل مفتاح PQC المسجَّل لمُنشئ الطبقة. يطبع `qorechaind query rdk anchor-sign-bytes` البايتات الخاصة بدفعة rollup. تُعيد طبقة بلا مرساة HTTP `404` (`no anchor for layer ...`) من `anchor/{layer_id}` وقائمة فارغة (`{"anchors": []}`) من `anchors/{layer_id}`.

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
| GET     | `/qorechain/burn/v1/stranded_rewards` | حصة المُوثِّقين (stakers) التي خُصّصت جانبًا ولم تُفرِج عنها الحوكمة بعد |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31574710367921",
    "burns_by_source": {
      "gas_fee": "31574710282421",
      "failed_tx": "85500",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3666968"
  }
}
```

تسرد الاستجابة الحقيقية كل مصدر حرق (`ai_service` و`amm` و`auto_buyback` و`bridge_fee` و`contract_create` و`failed_tx` و`gas_fee` و`milestone` و`rollup_create` و`tge` و`treasury_buyback` و`xqore_penalty`، ومن v3.2.4 أيضًا `staking_tier_penalty`، وهي عقوبة الفتح المبكر لقفل مستوى الرهن، وتُحرق)؛ والمثال مقتطع. المبالغ بوحدة `uqor`. تكون قيمة `failed_tx` غير صفرية منذ ترقية v3.2.2، حين بدأ حرق المعاملات الفاشلة يُطبَّق على الرسوم المحتسبة فعليًا. ومنذ v3.2.3 تُقتطع سجلات `records` القديمة لكل عملية حرق، لذا فإن `records` نافذة حديثة لا السجل الكامل؛ أما الإجماليات في `stats` فهي تراكمية.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "3807496785528", "released": "6693045921330", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` هو ما تبقّى للإفراج عنه، و`released` هو ما نقلته الحوكمة بالفعل، و`snapshot_height` هو ارتفاع ترقية v3.2.0 التي سجّلت الاحتياطي. القيم أعلاه هي القيم وقت كتابة هذا: أفرجت الحوكمة عن المبلغ الأول (6,693,045.921330 QOR) في 19 أكتوبر 2026، وأعادت ترقية v3.2.3 حساب الاحتياطي المتبقي عند ارتفاعها (3,807,496.785528 QOR). وكان مقترح حوكمة آخر للإفراج عن هذا المبلغ المعاد حسابه ما زال في فترة التصويت وقت كتابة هذا، لذا اقرأ القيم الحيّة. انظر [الاقتصاد الرمزي (Tokenomics)](/architecture/tokenomics).

## وحدة الحساب المجرَّد (Abstract Account) {#abstract-account-module}

تُعرض خدمة استعلام الحساب المجرَّد عبر REST تحت `/qorechain/abstractaccount/v1/...` (منذ إصدار السلسلة **v3.1.85**)، بما في ذلك **مخطط الأذونات** المستخدَم للتحقق من نطاقات [موثِّق الهوية (authenticator)](/developer-guide/account-abstraction#authenticators) دون ترميزها يدويًا.

| الطريقة | نقطة النهاية                                       | الوصف                                                                     |
| ------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| GET     | `/qorechain/abstractaccount/v1/config`             | إعدادات الوحدة (مسبار الميزة: `enabled`)                                   |
| GET     | `/qorechain/abstractaccount/v1/accounts`           | يسرد الحسابات المجرَّدة                                                    |
| GET     | `/qorechain/abstractaccount/v1/accounts/{address}` | حالة الحساب المجرَّد لعنوان (`404` إن لم يوجد)                              |
| GET     | `/qorechain/abstractaccount/v1/permission_schema`  | `schema_version` و`permissions` و`msg_permissions` و`key_management_msgs` و`lane_rules` |
| GET     | `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` | **v3.2.4** (شبكة الاختبار منذ 19 أكتوبر 2026؛ الشبكة الرئيسية من الارتفاع 3,742,566؛ و`501` على الشبكة الرئيسية قبل ذلك). التسلسل الذي يجب أن يوقّعه مفتاح الموثِّق المرتبط تاليًا (`nonce` و`linked`) |

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
{
  "licenses": [
    {
      "grantee": "qor1...",
      "feature_id": "lightnode_operator",
      "expires_at": "0",
      "granted_at": "3536305",
      "granted_by": "qor1...",
      "suspended": false,
      "metadata": "",
      "active": true
    }
  ]
}
```

تعني القيمة `expires_at: "0"` أن المنحة لا تنتهي صلاحيتها. ومنذ v3.2.3 يمكن للحوكمة استبدال جهة الترخيص التي تمنح هذه التراخيص (`MsgUpdateAuthority`)؛ وتبقى المنح التي مُنحت بالفعل قائمة.

## وحدة العقدة الخفيفة (Light Node) {#light-node-module}

| الطريقة | نقطة النهاية                                | الوصف                                                                           |
| ------- | ------------------------------------------- | ------------------------------------------------------------------------------- |
| GET     | `/qorechain/lightnode/v1/params`            | معاملات التسجيل ونبضات الحياة (heartbeat) والمكافآت                              |
| GET     | `/qorechain/lightnode/v1/stats`             | `total_registered` و`total_active` و`total_rewards` و`last_reward_height`        |
| GET     | `/qorechain/lightnode/v1/nodes`             | يسرد العقد الخفيفة المسجَّلة                                                     |
| GET     | `/qorechain/lightnode/v1/node/{address}`    | عقدة واحدة (`{"node": null, "found": false}` إن لم تكن مسجَّلة)                   |
| GET     | `/qorechain/lightnode/v1/rewards/{address}` | المكافآت المتراكمة لعنوان مشغّل (`accumulated_rewards`)                          |
| GET     | `/qorechain/lightnode/v1/reward_pool`       | محاسبة مجمّع المكافآت (`balance` و`reserved` و`outstanding` و`payable` و`distributable` و`max_reward_per_block_per_node` و`max_reward_per_month_per_node` و`initialized`) |

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
  "balance": "487231800",
  "reserved": "487231800",
  "outstanding": "0",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "0",
  "initialized": true,
  "max_reward_per_month_per_node": "2000000000"
}
```

`reserved` هو الجزء من المجمّع المحجوز والذي لا يمكن نقله إلا بتصويت حوكمة. والحدود لكل عقدة بوحدة `uqor`: `max_reward_per_block_per_node` هو السقف لكل كتلة، ومنذ v3.2.3 يمثّل `max_reward_per_month_per_node` (`2000000000` uqor = 2,000 QOR لكل 30 يومًا) السقف الشهري، ويُحتسب بالتناسب مع زمن الكتلة ونسبة التشغيل (uptime) فلا يعود يعتمد على سرعة توليد الكتل. السقف ليس مبلغًا موعودًا. المثال هو الاستجابة الحيّة للشبكة الرئيسية وقت كتابة هذا، بعد أن أفرجت الحوكمة عن الاحتياطي السابق (المقترح 8، 19 أكتوبر 2026). ومن v3.2.4 (على شبكة الاختبار منذ 19 أكتوبر 2026؛ وعلى الشبكة الرئيسية من الارتفاع 3,742,566) تتضمن الاستجابة أيضًا `monthly_cap_active` و`last_distribution_time` و`last_distribution_height`، ويبدأ حدّ العقدة من تسجيلها هي.

:::note التسجيل يتطلب ترخيصًا
ترفض السلسلة تسجيل عقدة خفيفة بدون منحة ترخيص `lightnode_operator` نشطة (يسرد `holders/lightnode_operator` المنح). وقت كتابة هذا تُبلغ `stats` عن `"total_registered": "0"` على الشبكة الرئيسية وعن عقدة مسجَّلة واحدة على شبكة الاختبار. انظر [العقد الخفيفة](/light-node/overview) لمعرفة حالة البرنامج.
:::

## وحدة RDK {#rdk-module}

تُعرض خدمة استعلام حزمة تطوير التجميعات (Rollup Development Kit) عبر REST تحت `/qorechain/rdk/v1/...` (منذ إصدار السلسلة **v3.2.2**؛ وكانت في v3.2.0 وv3.2.1 عبر gRPC فقط).

| الطريقة | نقطة النهاية                                          | الوصف                                                |
| ------- | ----------------------------------------------------- | ---------------------------------------------------- |
| GET     | `/qorechain/rdk/v1/params`                            | معاملات الوحدة                                        |
| GET     | `/qorechain/rdk/v1/rollups`                           | يسرد الـ rollups                                      |
| GET     | `/qorechain/rdk/v1/rollup/{rollup_id}`                | rollup واحد (`404` إن كان غير معروف)                  |
| GET     | `/qorechain/rdk/v1/latest_batch/{rollup_id}`          | أحدث دفعة تسوية للـ rollup                            |
| GET     | `/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`   | دفعة تسوية واحدة                                      |
| GET     | `/qorechain/rdk/v1/batches/{rollup_id}`               | دفعات الـ rollup بترتيب الفهرس (مع ترقيم الصفحات)      |
| GET     | `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`     | سجل blob واحد لتوفّر البيانات                         |

```bash
curl -s https://api.qore.host/qorechain/rdk/v1/params
```

```json
{
  "params": {
    "max_rollups": 100,
    "min_stake_for_rollup": "10000000000",
    "rollup_creation_burn_rate": "0.01",
    "default_challenge_window": "604800",
    "max_da_blob_size": "2097152",
    "blob_retention_blocks": "432000",
    "max_batches_per_block": 10
  }
}
```

وقت كتابة هذا تكون `rollups` قائمة فارغة على الشبكتين، لذا تردّ المسارات الخاصة بكل rollup بـ `404` (مثلًا `{"code":5,"message":"rollup foo not found"}`). وتُعبَّر `default_challenge_window` بالثواني (`604800`). ومن v3.2.4 تُقاس نافذة التحدّي التفاؤلية لدفعة مُقدَّمة حديثًا بزمن الكتلة: على شبكة الاختبار منذ الارتفاع 8,337,253 (19 أكتوبر 2026)، وعلى الشبكة الرئيسية من الارتفاع 3,742,566. وإلى ذلك الحين تحوّل الشبكة الرئيسية قيمة الثواني إلى كتل بمعدل ثابت قدره 6 ثوانٍ لكل كتلة.

## وحدة التضخم (Inflation) {#inflation-module}

تُعرض إعدادات الإصدار وتقدّمه عبر REST تحت `/qorechain/inflation/v1/...` (منذ إصدار السلسلة **v3.2.2**). وهي غير متاحة عبر أي أمر في CLI.

| الطريقة | نقطة النهاية                          | الوصف                                                                       |
| ------- | ------------------------------------- | --------------------------------------------------------------------------- |
| GET     | `/qorechain/inflation/v1/params`      | معاملات الإصدار: `emission_mode` و`fixed_epoch_emission` و`max_total_emission` و`epoch_length` و`enabled` |
| GET     | `/qorechain/inflation/v1/epoch_info`  | التقدّم: `current_epoch` و`block_start` و`next_epoch_height` و`total_minted` و`max_total_emission` و`remaining_emission` |

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info
```

على الشبكة الرئيسية تكون `emission_mode` هي `"fixed"`، وقيمة `fixed_epoch_emission` هي `"86000000000"` (86,000 QOR لكل حقبة)، وقيمة `epoch_length` هي `"43200"` كتلة، وقيمة `max_total_emission` هي `"590000000000000"` (590,000,000 QOR، السقف التراكمي). وقد ضُبطت هذه القيم بمقترح الحوكمة 10 (الذي أُقرّ في 19 أكتوبر 2026)؛ وتبدأ أول حقبة تستخدم المبلغ الثابت الجديد عند الكتلة 3,672,000، ويُظهر `epoch_info` الحقبة الجارية والمبلغ المُصدَر حتى الآن. أما قائمة `schedule` في الاستجابة فتعود إلى نمط `schedule` الأصلي؛ ولا تصف ما تُصدره حقبة في النمط الثابت. جميع المبالغ بوحدة `uqor`. وتُبلغ شبكة الاختبار عن قيمها الخاصة المختلفة. ومن v3.2.4 يوجد نمط ثالث هو `target_apy`، مع الحقل `target_apy_bps` (على شبكة الاختبار منذ 19 أكتوبر 2026؛ وعلى الشبكة الرئيسية من الارتفاع 3,742,566). ولا تنتقل الشبكة إلى هذا النمط إلا بتصويت حوكمة خاص بها، لذا تبقى الشبكة الرئيسية على `fixed` إلى أن يُقرّ تصويت كهذا؛ وتُبلغ شبكة الاختبار وقت كتابة هذا عن `"emission_mode": "fixed"`.

## وحدة تجريد الغاز (Gas Abstraction) {#gas-abstraction-module}

| الطريقة | نقطة النهاية                                          | الوصف                                                                       |
| ------- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| GET     | `/qorechain/gasabstraction/v1/config`                 | رموز الرسوم المقبولة، والعلاوة، وسقف التحويل لكل كتلة                        |
| GET     | `/qorechain/gasabstraction/v1/conversion_rate?denom=` | كم تساوي وحدة واحدة من رمز رسوم بوحدة `uqor`، وهل هو `usable` (صالح للاستخدام) |
| GET     | `/qorechain/gasabstraction/v1/float`                  | عنوان رصيد التحويل (float) وأرصدته واستخدامه في هذه الكتلة                   |

```bash
curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
```

```json
{
  "config": {
    "enabled": true,
    "native_denom": "uqor",
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0", "price_source": "", "rate_expiry_height": "0",
        "pool_id": "0", "min_liquidity": "", "max_deviation_bps": 0 }
    ],
    "premium_bps": 300,
    "max_tip_multiplier": 3,
    "float_min": "0",
    "block_conversion_cap": "0"
  }
}
```

تحتوي قائمة الرموز المقبولة على `uqor` الأصلي فقط على الشبكتين، لذا تُدفع الرسوم بـ `uqor` ولا يجري أي تحويل. تضيف الحوكمة رمزًا (مع مجمّع، وحدٍّ أدنى للسيولة، وأقصى انحراف بين السعر المرجَّح زمنيًا والسعر الفوري)؛ وتُحوَّل الرسوم المدفوعة بمثل هذا الرمز عبر رصيد تحويل (float) من QOR ويُعاد ملؤه عبر مجمّع AMM. وتردّ `conversion_rate` بدون `?denom=` بالرمز `500` (`denom is required`).

## وحدة مستويات الرهن (v3.2.4) {#stakingtier-module}

:::note متاحة من v3.2.4
وحدة مستويات الرهن جزء من **v3.2.4**. تخدم شبكة الاختبار هذه المسارات منذ 19 أكتوبر 2026، وتخدمها الشبكة الرئيسية من الارتفاع 3,742,566 (مقترح الحوكمة 13). وإلى أن يُبلغ هذا الارتفاع تردّ عليها عقدة الشبكة الرئيسية بـ `501`.
:::

| الطريقة | نقطة النهاية                              | الوصف                                                              |
| ------- | ----------------------------------------- | ------------------------------------------------------------------ |
| GET     | `/qorechain/stakingtier/v1/params`        | مستويات القفل، والحد الأدنى لمبلغ القفل، وغرامة فك القفل المبكر     |
| GET     | `/qorechain/stakingtier/v1/locks/{holder}` | أقفال حامل، وما يستحقه كل قفل حاليًا، وما يمكن المطالبة به          |
| GET     | `/qorechain/stakingtier/v1/pool`          | مجمّع المكافآت الإضافية: الرصيد، والمستحق، والفائض، وآخر تسوية      |

تسرد `params` أطوال القفل الثلاثة (3 و6 و12 شهرًا) مع معاملاتها و`min_lock_amount` (`"10000000"` uqor، أي 10 QOR). تُجرى الأقفال بالأمر `tx stakingtier lock` (انظر [أوامر المعاملات](/cli-reference/transaction-commands#stakingtier)).

## وحدات gRPC فقط {#grpc-only-modules}

لهذه الوحدات خدمة gRPC من نوع `Query` لكن **بلا مسار REST**. تتبع أسماء الخدمات الصيغة `qorechain.<module>.v1.Query`.

| الوحدة        | طرق استعلام gRPC (إصدار السلسلة v3.2.3)                     |
| ------------- | ---------------------------------------------------------- |
| `ai`          | `Config`, `Stats`                                          |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                     |
| `reputation`  | `Params`                                                   |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `svm`         | `Slot`, `Account`, `Program`                               |
| `qca`         | `Config`                                                   |

استخدم `grpcurl` مقابل عقدتك الخاصة، أو [أوامر الاستعلام في CLI](/cli-reference/query-commands). واستعلامات `rdk` متاحة أيضًا عبر REST (انظر [وحدة RDK](#rdk-module))؛ وكانت عبر gRPC فقط قبل v3.2.2.

لا تملك وحدات xQORE وإعادة الرهن بـ BTC (Babylon) وFairBlock أي خدمة استعلام في الإصدار الحالي على الإطلاق، لا عبر REST ولا عبر gRPC. أما وحدتا التضخم وتجريد الغاز، اللتان لم تكن لهما خدمة قبل v3.2.2، فتُخدَّمان عبر REST (انظر [وحدة التضخم](#inflation-module) و[وحدة تجريد الغاز](#gas-abstraction-module)).

## المسارات القياسية {#standard-routes}

تُخدَّم أيضًا مسارات REST القياسية لـ Cosmos SDK وIBC وEVM وQoreChain Native. أمثلة تم التحقق منها على الشبكتين:

| نقطة النهاية                                                   | الوصف                                              |
| -------------------------------------------------------------- | -------------------------------------------------- |
| `/cosmos/bank/v1beta1/supply`                                  | الإمداد الكلي                                      |
| `/cosmos/bank/v1beta1/balances/{address}`                      | أرصدة الحساب                                       |
| `/cosmos/staking/v1beta1/validators`                           | المدقّقون                                          |
| `/cosmos/staking/v1beta1/params`                               | معاملات الرهن                                      |
| `/cosmos/distribution/v1beta1/params`                          | معاملات التوزيع                                    |
| `/cosmos/gov/v1/params/voting`                                 | معاملات الحوكمة                                    |
| `/cosmos/slashing/v1beta1/params`                              | معاملات المعاقبة (slashing)                        |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | الترقيات المعلَّقة / المطبَّقة (يُعيد `applied_plan/v3.2.3` القيمة `{"height":"3662051"}` على الشبكة الرئيسية) |
| `/cosmos/circuit/v1/disable_list`                              | أنواع الرسائل المعطَّلة على مستوى الشبكة            |
| `/cosmos/base/node/v1beta1/config`                             | الحد الأدنى لسعر الغاز في العقدة (`0.1uqor` على الشبكتين) |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`                | أحدث كتلة                                          |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | البحث عن المعاملات / الاستعلام عنها / حسب الكتلة    |
| `/cosmos/evm/vm/v1/params`                                     | معاملات وحدة EVM                                   |
| `/cosmos/evm/feemarket/v1/params`                              | معاملات سوق رسوم EVM                               |
| `/cosmwasm/wasm/v1/codes/params`                               | أذونات رفع/إنشاء نسخ QoreChain Native                      |
| `/ibc/apps/transfer/v1/params`                                 | معاملات تحويل IBC                                  |

بادئة QoreChain Native هي `/cosmwasm/wasm/v1/...`؛ أما `/cosmos/wasm/v1/...` فغير مخدَّمة.

## استكشاف gRPC (Reflection)

تخدم العقدة التي تشغّلها بنفسك gRPC على المنفذ `9090`. وحيثما يكون استكشاف الخادم (server reflection) مُفعَّلًا، يمكن لأدوات مثل `grpcurl` اكتشاف الخدمات المتاحة:

```bash
grpcurl -plaintext localhost:9090 list
```

للاستعلام عن خدمة محددة:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

لدى `qorechain.pqc.v1.Query` ثلاث طرق على عقدة v3.2.3 هي `Account` و`EVMWindow` و`EVMDelegationConsent`، وطريقة رابعة من v3.2.4 (شبكة الاختبار منذ 19 أكتوبر 2026، والشبكة الرئيسية من الارتفاع 3,742,566) هي `ProtocolFeatures`. لا توجد طريقة `Params`.

## المصادقة

جميع نقاط REST وgRPC غير مُصادَق عليها افتراضيًا. للنشر في بيئة الإنتاج، ضع وكيلًا عكسيًا (مثل Nginx أو Caddy) أمام العقدة للتعامل مع إنهاء TLS والتحكم في الوصول.
