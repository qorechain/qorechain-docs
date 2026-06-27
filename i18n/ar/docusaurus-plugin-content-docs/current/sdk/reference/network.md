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
| معرّف السلسلة | `qorechain-vladi` (قيد التشغيل) |
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
| رمز العرض | `QOR` |
| الفئة النقدية الأساسية | `uqor` |
| الوحدات الأساسية لكل QOR | `10^6` |
| بادئة bech32 للحساب | `qor` |
| بادئة bech32 للمدقّق | `qorvaloper` |

## المنافذ الافتراضية

تستخدم `createClient()` منافذ localhost هذه افتراضياً. تجاوز `endpoints`
للإشارة إلى عقدة حقيقية.

| نقطة الوصول | المنفذ | الغرض |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | أرصدة البنك، ومعلومات الحساب، واستعلامات الوحدات |
| gRPC | `9090` | استعلامات gRPC |
| Consensus RPC | `26657` | توقيع/بث معاملات native، وقراءات CosmWasm |
| EVM JSON-RPC | `8545` | `eth_*` و`qor_*` والعقود المسبقة (precompiles) |
| EVM JSON-RPC (WS) | `8546` | اشتراكات EVM عبر WebSocket |
| SVM JSON-RPC | `8899` | RPC متوافق مع Solana |

مثال مع نقاط وصول صريحة:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",   // REST (LCD)
    rpc: "https://rpc.testnet.example",      // consensus RPC
    evmRpc: "https://evm.testnet.example",   // EVM + qor_ JSON-RPC
    evmWs: "wss://evm.testnet.example",      // EVM WebSocket
  },
});
```

تكشف SDK عن إعدادات الشبكة المسبقة ومساعدات البحث (مُصدَّرة من وحدة
الشبكات) بحيث يمكنك سرد الشبكات وحلّها برمجياً. وفي Python/Go/Rust
تكون المكافئات `create_client` / `CreateClient` / `ClientBuilder` بالإضافة إلى
وحدة `networks`.

## استهداف الشبكة الرئيسية

يُشحن كلا الإعدادين المسبقين بنفس إعدادات localhost الافتراضية؛ حدّد `mainnet` وتجاوز
نقاط الوصول بعناوين URL الخاصة بعقدتك:

```ts
const main = createClient({
  network: "mainnet",       // chain id qorechain-vladi
  endpoints: {
    rest: "https://rest.mainnet.example",
    rpc: "https://rpc.mainnet.example",
    evmRpc: "https://evm.mainnet.example",
  },
});
```
