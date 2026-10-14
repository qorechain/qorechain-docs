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
مرِّر `endpoints` للتواصل مع عقدة حقيقية. نقاط النهاية العامة مدرجة في
[مرجع الشبكة](/sdk/reference/network#public-endpoints).

```ts
import { createClient } from "@qorechain/sdk";

// Testnet (chain id "qorechain-diana"), default localhost endpoints.
const client = createClient();

// Point at the public testnet by overriding endpoints.
const remote = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",   // Native REST (LCD)
    rpc: "https://rpc-testnet.qore.host",    // consensus RPC (for signing)
    evmRpc: "https://evm-testnet.qore.host", // EVM JSON-RPC (eth_*)
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

// Any REST route works through the typed escape hatch, for example the burn
// statistics.
const burn = await client.rest.getBurnStats();
```

لا يمكن استخدام `client.qor` (استدعاءات `qor_` JSON-RPC المُنمَّطة) على نقاط النهاية
العامة: لا يوفّر أي إصدار منشور من العقدة هذا النطاق، لذا يُرجع كل استدعاء
`-32601` (الطريقة غير موجودة). اقرأ عبر REST بدلًا من ذلك. راجع
[نطاق `qor_`](/api-reference/json-rpc-qor_-namespace).

## 4. إرسال تحويل QOR {#send-qor}

على الشبكة الرئيسية وشبكة الاختبار، يجب أن تحمل كل معاملة على المسار الأصلي (Native)
التوقيع **الهجين** (secp256k1 الكلاسيكي بالإضافة إلى ML-DSA-87)، ويجب
**تسجيل مفتاح ML-DSA-87 الخاص بالحساب على السلسلة أولًا**. التسجيل صريح: لا
يوجد تسجيل تلقائي عند أول معاملة. وترفض الشبكات الحية `tx.bankSend` العادي
(توقيع كلاسيكي فقط). تتطلب الخطوتان أدناه **SDK 0.8.3 أو أحدث**
(`derivePqcCanonical`؛ و0.8.1 أو أحدث لعمليات الإرسال الهجينة عمومًا) وحسابًا ممولًا:

```bash
npm i @qorechain/sdk @cosmjs/stargate
```

### 4a. سجِّل مفتاحك ما بعد الكمّي (مرة واحدة)

يُوقَّع التسجيل توقيعًا كلاسيكيًا ويُستثنى من اشتراط التوقيع الهجين، بحيث يستطيع
الحساب الجديد تهيئة مفتاحه الأول. يدفع الحساب الرسوم: يحتاج المفتاح البالغ حجمه
2,592 بايت إلى حدّ غاز يبلغ نحو 600,000.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const REST = "https://api-testnet.qore.host";
const RPC = "https://rpc-testnet.qore.host";

const client = createClient({ endpoints: { rest: REST, rpc: RPC } });

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const tx = await client.connectTx(signer);

// The address-bound ML-DSA-87 key, recoverable from { address, mnemonic }.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// Read the status over REST (the default status source needs `qor_`).
const { found } = await client.rest.get<{ found: boolean }>(
  `/qorechain/pqc/v1/account/${account.address}`,
);

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },          // skips the transaction when already registered
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
console.log(res.alreadyRegistered ? "already registered" : res.txHash);
```

### 4b. أرسل بتوقيع هجين

تقوم `signAndBroadcastHybrid` بالبناء والتوقيع والبثّ. مرِّر `rest` ليتمكّن SDK من
سؤال الشبكة عن صيغة sign-bytes التي تتحقق منها (راجع
[أي صيغة sign-bytes؟](/sdk/concepts/accounts-pqc#sign-bytes-versions)). استخدم
`toBase("1.5")` لتحويل QOR إلى وحدة الأساس `uqor`. الحدّ الأدنى لسعر الغاز في
الشبكة هو 0.1 uqor لكل وحدة غاز، لذا فإن حدّ غاز قدره 400,000 يتطلب رسومًا لا تقل
عن 40,000 uqor.

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  signAndBroadcastHybrid,
  qorechainRegistry,
  MSG_SEND_TYPE_URL,
  toBase,
} from "@qorechain/sdk";

const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(account.address); // { accountNumber, sequence }

const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [
    {
      typeUrl: MSG_SEND_TYPE_URL,
      value: {
        fromAddress: account.address,
        toAddress: "qor1recipientaddress...",
        amount: [{ denom: "uqor", amount: toBase("1.5") }],
      },
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: client.network.chainId,
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,
  transport,
});

console.log(result.transactionHash);
```

تُرجع `toBase("1.5")` القيمة `"1500000"` (تحتوي QOR على 10^6 من وحدات الأساس `uqor`).

:::info الحسابات الموحّدة
بالنسبة إلى حساب موحّد eth-native (`deriveUnifiedAccount`)، استخدم
`EthNativeSigner` بدلًا من ذلك؛ وتجد أمثلة التسجيل والإرسال في
[الحسابات والتوقيع PQC](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

:::note عمليات الإرسال الكلاسيكية تعمل فقط على العقد المحلية وعقد التطوير
لا يزال المسار الكلاسيكي `client.connectTx(signer)` مع `tx.bankSend(...)` موجودًا،
وهو ما تستخدمه `ensurePqcRegistered` لمعاملة التسجيل الواحدة. وعلى عقدة لا
تشترط امتداد التوقيع الهجين (عقدة تطوير محلية) فإنه يرسل أيضًا التحويلات العادية.
أما الشبكات العامة فترفضه.
:::

## لغات أخرى: الاتصال والقراءة

تعكس هذه المقتطفات نفس الإعدادات المسبقة للشبكة ونفس واجهة القراءة. وهي تستخدم
نقاط نهاية شبكة الاختبار العامة؛ وللشبكة الرئيسية مرِّر `"mainnet"` وعناوين URL
الخاصة بالشبكة الرئيسية.

### Python

```python
from qorsdk import create_client

client = create_client(
    network="testnet",
    endpoints={
        "rest": "https://api-testnet.qore.host",
        "rpc": "https://rpc-testnet.qore.host",
        "evm_rpc": "https://evm-testnet.qore.host",
    },
)
print(client.network.chain_id)  # "qorechain-diana"

balances = client.rest.get_all_balances("qor1...")
burn = client.rest.get_burn_stats()
client.close()
```

### Go

```go
import (
    "fmt"

    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
)

c, err := client.CreateClient(client.Options{
    Network: "testnet",
    Endpoints: client.EndpointOverrides{
        REST:   "https://api-testnet.qore.host",
        RPC:    "https://rpc-testnet.qore.host",
        EVMRPC: "https://evm-testnet.qore.host",
    },
})
if err != nil {
    panic(err)
}
fmt.Println(c.Network.ChainID) // qorechain-diana

balances, err := c.REST.GetAllBalances("qor1...")
burn, err := c.REST.GetBurnStats()
```

### Rust

```rust
use qorechain::ClientBuilder;

#[tokio::main]
async fn main() -> qorechain::Result<()> {
    let client = ClientBuilder::new()
        .network("testnet")
        .rest("https://api-testnet.qore.host")
        .rpc("https://rpc-testnet.qore.host")
        .evm_rpc("https://evm-testnet.qore.host")
        .build()?;
    let balances = client.rest.get_all_balances("qor1...").await?;
    let burn = client.rest.get_burn_stats().await?;
    let _ = (balances, burn);
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
