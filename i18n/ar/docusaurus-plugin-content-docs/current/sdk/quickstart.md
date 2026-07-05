---
slug: /sdk/quickstart
title: البدء السريع
sidebar_label: البدء السريع
sidebar_position: 3
---

# البدء السريع

من الصفر إلى معاملة مُرسَلة. تستخدم هذه الصفحة حزمة تطوير TypeScript
(`@qorechain/sdk`)؛ وتجد في النهاية مقتطفات قصيرة للاتصال والقراءة بلغات Python وGo وRust.

## 1. الاتصال

تقوم الدالة `createClient()` بتحديد الشبكة وتجميع عملاء القراءة، وأداة مساعدة للرسوم،
ونقطة دخول كسولة للتوقيع. وهي تستهدف شبكة الاختبار العامة
(`qorechain-diana`) افتراضيًا. تشير نقاط النهاية الافتراضية إلى **localhost**، لذا
مرِّر `endpoints` للتواصل مع عقدة حقيقية.

```ts
import { createClient } from "@qorechain/sdk";

// Testnet (chain id "qorechain-diana"), default localhost endpoints.
const client = createClient();

// Point at a real node by overriding endpoints.
const remote = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",   // Native REST (LCD)
    rpc: "https://rpc-testnet.qore.host",    // consensus RPC (for signing)
    evmRpc: "https://evm-testnet.qore.host", // EVM + qor_ JSON-RPC
  },
});
```

الشبكة الرئيسية (معرّف السلسلة `qorechain-vladi`) تعمل الآن. اخترها وتجاوز
إعدادات localhost الافتراضية باستخدام نقاط النهاية العامة (أو عقدتك الخاصة):

```ts
const main = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});
```

## 2. اشتقاق حساب

عبارة استرجاع (mnemonic) واحدة تشتق حسابات أصلية (`qor1…`) وEVM (`0x…`) وSVM (بترميز base58)
عبر مسارات اشتقاق مستقلة.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Native secp256k1, coin type 118)
```

منذ الإصدار 0.6.0 يمكنك بدلاً من ذلك اشتقاق **حساب موحّد eth-native** — مفتاح
`eth_secp256k1` واحد يُعرَض كالعناوين الثلاثة جميعها (`qor1…` و`0x…` وSVM
بترميز base58) برصيد واحد مشترك:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const unified = await deriveUnifiedAccount(mnemonic);
console.log(unified.cosmos); // "qor1..."
console.log(unified.evm);    // "0x..."
console.log(unified.svm);    // base58 (same 20 bytes + 12 zero bytes)
```

راجع [الحسابات والتوقيع PQC](/sdk/concepts/accounts-pqc) للاطلاع على اشتقاق EVM/SVM،
والحسابات الموحّدة، وجدول الاشتقاق الكامل.

## 3. قراءة رصيد

```ts
// Native bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. إرسال تحويل QOR

اشتق حسابًا أصليًا، وحوِّل مفتاحه الخاص إلى مُوقِّع، واتصل بعميل
`TxClient`، ثم أرسل الرموز. استخدم `toBase("1.5")` لتحويل QOR إلى وحدة الأساس `uqor`.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rpc: "https://rpc-testnet.qore.host",
    rest: "https://api-testnet.qore.host",
  },
});

const account = await deriveNativeAccount(mnemonic);

// Adapt the raw secp256k1 key into an offline signer bound to the "qor" prefix.
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// Connect a tx client at the consensus RPC endpoint.
const tx = await client.connectTx(signer);

// Estimate a fee, then send 1.5 QOR.
const fee = await client.fees.estimate(); // or "fast" | "normal" | "slow"
const result = await tx.bankSend(
  "qor1recipientaddress...",
  [{ denom: "uqor", amount: toBase("1.5") }],
  { fee },
);

console.log(result.transactionHash);
```

تُرجع `toBase("1.5")` القيمة `"1500000"` (تحتوي QOR على 10^6 من وحدات الأساس `uqor`).

:::info التوقيع الهجين على الشبكات الحية
على الشبكة الرئيسية وشبكة الاختبار، يتطلب المسار الأصلي (Native) امتداد التوقيع
**الهجين** (كلاسيكي + ML-DSA-87) — استخدم `buildHybridTx` /
`signAndBroadcastHybrid`، أو `signHybridEth` للحسابات الموحّدة eth-native.
راجع [التوقيع الهجين](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

## لغات أخرى: الاتصال والقراءة

تعكس هذه المقتطفات نفس الإعدادات المسبقة للشبكة ونفس واجهة القراءة.

### Python

```python
from qorechain import create_client

client = create_client()  # testnet preset (localhost endpoints)
print(client.network.chain_id)  # "qorechain-diana"

balances = client.rest.get_all_balances("qor1...")
stats = client.qor.get_ai_stats()
client.close()
```

### Go

```go
import "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"

c, err := client.CreateClient(client.Options{}) // defaults to "testnet"
if err != nil {
    panic(err)
}
fmt.Println(c.Network.ChainID) // qorechain-diana

balances, err := c.REST.GetAllBalances("qor1...")
stats, err := c.Qor.GetAIStats()
```

### Rust

```rust
use qorechain::ClientBuilder;

#[tokio::main]
async fn main() -> qorechain::Result<()> {
    let client = ClientBuilder::new().build()?; // defaults to "testnet"
    let balances = client.rest.get_all_balances("qor1...").await?;
    let stats = client.qor.get_ai_stats().await?;
    let _ = (balances, stats);
    Ok(())
}
```

## الخطوات التالية

- [الأدلة](/sdk/guides/evm) — العمل مع كل آلة افتراضية (EVM وSVM وCosmWasm والعمليات عبر الآلات الافتراضية).
- [الحسابات والتوقيع PQC](/sdk/concepts/accounts-pqc) — الاشتقاق الهرمي (HD)، والحسابات
  الموحّدة eth-native، والتوقيع ما بعد الكمّي.
- [المصادِقات والإنفاق المفوَّض](/sdk/guides/authenticators) — السماح لمفتاح
  Phantom/MetaMask مرتبط بالإنفاق عبر مُرحِّل.
- [مرجع الشبكة ونقاط النهاية](/sdk/reference/network).
- [أمثلة](/sdk/examples) — مقتطفات قابلة للتشغيل لكل تدفق ورد أعلاه.
