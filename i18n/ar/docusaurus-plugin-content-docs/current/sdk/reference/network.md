---
slug: /sdk/reference/network
title: الشبكة ونقاط الوصول
sidebar_label: الشبكة ونقاط الوصول
sidebar_position: 1
---

# مرجع الشبكة ونقاط الوصول

## الشبكة الرئيسية

| الحقل | القيمة |
| --- | --- |
| إعداد الشبكة المسبق | `mainnet` |
| معرّف السلسلة | `qorechain-vladi` (قيد التشغيل منذ 7 يونيو 2026) |
| إصدار السلسلة (12 نوفمبر 2026) | v3.2.7 (منذ الارتفاع 4,164,600، في 12 نوفمبر 2026، مقترح الحوكمة 16؛ وطُبّق v3.2.6 عند الارتفاع 4,020,000 في 4 نوفمبر، وv3.2.5 عند الارتفاع 3,906,833 في 29 أكتوبر وv3.2.4 عند الارتفاع 3,742,566 في 23 أكتوبر). الإصدار 0.12.0 من SDK هو العميل الخاص بـ v3.2.5 ويعمل على v3.2.6 وv3.2.7 (لم تتغير صيغة التوقيع)؛ وكان 0.10.0 العميل الخاص بـ v3.2.4 |
| معرّف سلسلة EVM | `9801` |
| رمز العرض | `QOR` |
| الفئة النقدية الأساسية | `uqor` |
| الوحدات الأساسية لكل QOR | `10^6` |
| بادئة bech32 للحساب | `qor` |
| بادئة bech32 للمدقّق | `qorvaloper` |

## الشبكة التجريبية

| الحقل | القيمة |
| --- | --- |
| إعداد الشبكة المسبق | `testnet` |
| معرّف السلسلة | `qorechain-diana` (قيد التشغيل) |
| إصدار السلسلة | v3.2.8 (منذ الارتفاع 9,929,500، في 12 نوفمبر 2026، طُبّق بالحوكمة؛ والشبكة الرئيسية لم تطبّقه. وطُبّق v3.2.7 عند الارتفاع 9,594,600 في 6 نوفمبر؛ وطُبّق v3.2.6 عند الارتفاع 8,970,638 في 27 أكتوبر؛ وطُبّق v3.2.5 عند الارتفاع 8,890,800 في 26 أكتوبر وv3.2.4 عند الارتفاع 8,337,253 في 19 أكتوبر) |
| معرّف سلسلة EVM | `9800` |
| رمز العرض | `QOR` |
| الفئة النقدية الأساسية | `uqor` |
| الوحدات الأساسية لكل QOR | `10^6` |
| بادئة bech32 للحساب | `qor` |
| بادئة bech32 للمدقّق | `qorvaloper` |

## نقاط النهاية العامة {#public-endpoints}

| نقطة الوصول | الشبكة الرئيسية (`qorechain-vladi`) | الشبكة التجريبية (`qorechain-diana`) |
| --- | --- | --- |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Consensus RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC (`eth_*`) | `https://evm.qore.host` (معرّف السلسلة 9801) | `https://evm-testnet.qore.host` (معرّف السلسلة 9800) |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (للقراءة فقط) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |

تخدم نقاط نهاية EVM فضاءات الأسماء `eth_` و`net_` و`web3_` و`txpool_`؛ أما فضاء الأسماء `qor_`
فغير مفعّل. راجع أيضًا [الشبكات](/appendix/networks#public-endpoints).

ابتداءً من SDK 0.12.0 تستخدم الإعدادات المسبقة `mainnet` و`testnet` عناوين URL هذه لـ REST
وRPC الإجماع وEVM JSON-RPC (وEVM WebSocket لشبكة الاختبار) افتراضيًا. ولا تضبط الإعدادات
المسبقة **أي** نقطة gRPC و**لا** نقطة SVM، مع أن عناوين SVM للقراءة فقط أعلاه موجودة
(معاملات SVM غير مفتوحة): والشيفرة التي تحتاج إلى إحداها تفشل بخطأ يسمّي
نقطة النهاية المطلوب تمريرها. نقاط نهاية شبكة الاختبار محدودة المعدل لكل IP؛ شغّل عقدتك
الخاصة أو استخدمها لحركة الإنتاج. وقبل 0.12.0 كان كل إعداد مسبق يستخدم
localhost افتراضيًا.

### فروق خاصة بشبكة الاختبار تهم العميل {#testnet-only}

شبكة الاختبار شبكة تجريبية (staging) تسبق الشبكة الرئيسية، لذا فإن بعض ما يمكنك قراءته
هناك غير موجود على الشبكة الرئيسية (فُحص في 27 أكتوبر 2026؛ والقائمة الكاملة في
[الفروق بين شبكة الاختبار والشبكة الرئيسية](/appendix/chain-parameters#testnet-differences)):

* **مسارات REST.** تستجيب `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}` و`GET /qorechain/pqc/v1/params` و`GET /qorechain/crossvm/v1/params` على شبكة الاختبار. وكانت الشبكة الرئيسية تردّ عليها بـ HTTP 501 حتى السلسلة v3.2.6؛ ومنذ أن طبّقتها (4 نوفمبر 2026) ردّت كل تلك المسارات بـ HTTP 200 على الشبكة الرئيسية عند الفحص في ذلك اليوم. ومسارات AMM ضمن `/qorechain/amm/v1/` (`pools` و`params`) تستجيب على الشبكتين.
* **مسارات السلسلة v3.2.7.** في 7 نوفمبر 2026 ردّت شبكة الاختبار بـ HTTP 200 على `GET /qorechain/pqc/v1/multisig/{address}` (`{"found":false,"multisig":null}` لعنوان لا يملك واحدًا) و`GET /qorechain/stakingtier/v1/apr` و`GET /qorechain/stakingtier/v1/apr/{delegator}` و`GET /qorechain/stakingtier/v1/pool` و`GET /qorechain/svm/v1/cluster_info`؛ وردّت الشبكة الرئيسية بـ HTTP 501 على كلها عدا `/qorechain/stakingtier/v1/pool` (200) في ذلك اليوم، قبل أن تطبّق v3.2.7. ومنذ أن طبّقت الشبكة الرئيسية v3.2.7 (12 نوفمبر 2026) صارت هذه المسارات تردّ هناك: ففي 12 نوفمبر 2026 ردّت `GET /qorechain/pqc/v1/multisig/{address}` و`GET /qorechain/stakingtier/v1/apr` و`GET /qorechain/stakingtier/v1/apr/{delegator}` و`GET /qorechain/stakingtier/v1/pool` و`GET /qorechain/svm/v1/cluster_info` بـ HTTP 200 على الشبكة الرئيسية (وأعاد مسار multisig القيمة `{"found":false,"multisig":null}` لعنوان لا يملك واحدًا؛ ويبلّغ `cluster_info` أن `execution_enabled` هي false لأن مسار SVM ما زال متوقفًا). أما استعلام مستند التوقيع النصي فهو مسار POST: يردّ `GET /qorechain/pqc/v1/textual_sign_doc` بـ 501، وردّ طلب POST بجسم فارغ بـ 400 ("tx_bytes or tx_json is required") على الشبكة الرئيسية، فالمسار موجَّه. وردّ المساران `GET /qorechain/pqc/v1/evm_limits` و`GET /qorechain/svm/v1/params` (v3.2.8) بـ 501 على الشبكة الرئيسية. وليست لدى SDK 0.12.0 أداة بناء أو عميل مُنمَّط لأي من مسارات v3.2.7.
* **رموز الاختبار.** توجد ثلاثة رموز بلا قيمة على شبكة الاختبار فقط، بوصفها فئات bank بأسماء `erc20:<EIP-55 contract address>` (حساسة لحالة الأحرف): fUSD (6 منازل عشرية) وfETH (18) وfBTC (8). يسردها `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata`. والفئة الوحيدة في bank على الشبكة الرئيسية هي `uqor`. راجع [رموز الاختبار على شبكة الاختبار (Fest)](/api-reference/rest-grpc-endpoints#fest-tokens).
* **وحدات مفعَّلة.** وحدة `abstractaccount` مفعَّلة على شبكة الاختبار ومتوقفة على الشبكة الرئيسية، ومكوّنات EVM ما قبل التجميع مفعَّلة على شبكة الاختبار (ثلاثة في 27 أكتوبر وأربعة في 4 نوفمبر) ولا شيء منها على الشبكة الرئيسية، وإنشاء النسخ (instantiate) في QoreChain Native مفتوح على شبكة الاختبار.

## المنافذ الافتراضية (الإعداد المسبق `localnet`) {#default-ports}

يستخدم الإعداد المسبق `localnet` (معرّف السلسلة `qorechain-devnet`، ودون معرّف سلسلة EVM) منافذ localhost
هذه، لعقدة على جهازك. قبل SDK 0.12.0 كانت كل الإعدادات المسبقة تستخدمها
افتراضيًا؛ ومنذ 0.12.0 يستخدمها `localnet` وحده. تجاوز `endpoints` للإشارة إلى
عقدة أخرى.

| نقطة الوصول | المنفذ | الغرض |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | أرصدة البنك، ومعلومات الحساب، واستعلامات الوحدات |
| gRPC | `9090` | استعلامات gRPC |
| Consensus RPC | `26657` | توقيع/بث معاملات native، وقراءات QoreChain Native |
| EVM JSON-RPC | `8545` | `eth_*` (و`qor_*` والعقود المسبقة (precompiles) على العقد التي تفعّلها) |
| EVM JSON-RPC (WS) | `8546` | اشتراكات EVM عبر WebSocket |
| SVM JSON-RPC | `8899` | RPC متوافق مع Solana |

```ts
const local = createClient({ network: "localnet" }); // a node on this machine
```

مثال مع نقاط وصول صريحة:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",        // REST (LCD)
    rpc: "https://rpc-testnet.qore.host",         // consensus RPC
    evmRpc: "https://evm-testnet.qore.host",      // EVM JSON-RPC (eth_*)
    evmWs: "wss://evm-ws-testnet.qore.host",      // EVM WebSocket
  },
});
```

تكشف SDK عن إعدادات الشبكة المسبقة ومساعدات البحث (مُصدَّرة من وحدة
الشبكات) بحيث يمكنك سرد الشبكات وحلّها برمجياً. وفي Python/Go/Rust
تكون المكافئات `create_client` / `CreateClient` / `ClientBuilder` بالإضافة إلى
وحدة `networks`.

## استهداف الشبكة الرئيسية

حدّد `mainnet` لاستهدافها. ابتداءً من SDK 0.12.0 يحمل الإعداد المسبق أصلًا عناوين URL
العامة، فنقاط النهاية أدناه هي القيم الافتراضية؛ مرّر `endpoints` لعقدتك الخاصة فقط
(أما SDK قبل 0.12.0 فيستخدم localhost افتراضيًا ويحتاجها):

```ts
const main = createClient({
  network: "mainnet",       // chain id qorechain-vladi
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});
```
