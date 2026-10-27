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
| إصدار السلسلة (27 أكتوبر 2026) | v3.2.4 (منذ الارتفاع 3,742,566، في 23 أكتوبر 2026، مقترح الحوكمة 13). وسيطبّق مقترح الحوكمة 14 الإصدار v3.2.5 عند الارتفاع 3,906,833 وكان في فترة التصويت وقت كتابة هذا النص؛ وتُوثَّق إضافات v3.2.5 في يوم تطبيقه على الشبكة الرئيسية |
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
| إصدار السلسلة (27 أكتوبر 2026) | v3.2.6 (منذ الارتفاع 8,970,638، في 27 أكتوبر 2026؛ وطُبّق v3.2.5 عند الارتفاع 8,890,800 في 26 أكتوبر وv3.2.4 عند الارتفاع 8,337,253 في 19 أكتوبر) |
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

### فروق خاصة بشبكة الاختبار تهم العميل {#testnet-only}

شبكة الاختبار شبكة تجريبية (staging) تسبق الشبكة الرئيسية، لذا فإن بعض ما يمكنك قراءته
هناك غير موجود على الشبكة الرئيسية (فُحص في 27 أكتوبر 2026؛ والقائمة الكاملة في
[الفروق بين شبكة الاختبار والشبكة الرئيسية](/appendix/chain-parameters#testnet-differences)):

* **مسارات REST.** تستجيب `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}` و`GET /qorechain/pqc/v1/params` و`GET /qorechain/crossvm/v1/params` على شبكة الاختبار؛ أما الشبكة الرئيسية فتردّ عليها بـ HTTP 501. ومسارات AMM ضمن `/qorechain/amm/v1/` (`pools` و`params`) تستجيب على الشبكتين.
* **رموز الاختبار.** توجد ثلاثة رموز بلا قيمة على شبكة الاختبار فقط، بوصفها فئات bank بأسماء `erc20:<EIP-55 contract address>` (حساسة لحالة الأحرف): fUSD (6 منازل عشرية) وfETH (18) وfBTC (8). يسردها `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata`. والفئة الوحيدة في bank على الشبكة الرئيسية هي `uqor`. راجع [رموز الاختبار على شبكة الاختبار (Fest)](/api-reference/rest-grpc-endpoints#fest-tokens).
* **وحدات مفعَّلة.** وحدة `abstractaccount` مفعَّلة على شبكة الاختبار ومتوقفة على الشبكة الرئيسية، وثلاثة مكوّنات EVM ما قبل التجميع مفعَّلة على شبكة الاختبار ولا شيء منها على الشبكة الرئيسية، وإنشاء النسخ (instantiate) في QoreChain Native مفتوح على شبكة الاختبار.

## المنافذ الافتراضية

تستخدم `createClient()` منافذ localhost هذه افتراضياً. تجاوز `endpoints`
للإشارة إلى عقدة حقيقية.

| نقطة الوصول | المنفذ | الغرض |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | أرصدة البنك، ومعلومات الحساب، واستعلامات الوحدات |
| gRPC | `9090` | استعلامات gRPC |
| Consensus RPC | `26657` | توقيع/بث معاملات native، وقراءات QoreChain Native |
| EVM JSON-RPC | `8545` | `eth_*` (و`qor_*` والعقود المسبقة (precompiles) على العقد التي تفعّلها) |
| EVM JSON-RPC (WS) | `8546` | اشتراكات EVM عبر WebSocket |
| SVM JSON-RPC | `8899` | RPC متوافق مع Solana |

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

يُشحن كلا الإعدادين المسبقين بنفس إعدادات localhost الافتراضية؛ حدّد `mainnet` وتجاوز
نقاط الوصول بعناوين URL العامة (أو بعقدتك الخاصة):

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
