---
slug: /sdk/quickstart
title: البدء السريع
sidebar_label: البدء السريع
sidebar_position: 3
---

# البدء السريع

من الصفر إلى معاملة مُرسَلة. تستخدم هذه الصفحة TypeScript SDK
(`@qorechain/sdk`)؛ وتتبعها في النهاية مقتطفات قصيرة للاتصال والقراءة لـ Python وGo وRust.

## 1. الاتصال

تحلّ `createClient()` الشبكة وتؤلِّف عملاء القراءة، ومساعد الرسوم،
ونقطة دخول توقيع كسولة. وهي تستهدف الشبكة التجريبية العامة
(`qorechain-diana`) افتراضياً. تشير نقاط الوصول الافتراضية إلى **localhost**، لذا
مرّر `endpoints` للتحدث إلى عقدة حقيقية.

```ts
import { createClient } from "@qorechain/sdk";

// Testnet (chain id "qorechain-diana"), default localhost endpoints.
const client = createClient();

// Point at a real node by overriding endpoints.
const remote = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",   // Cosmos REST (LCD)
    rpc: "https://rpc.testnet.example",      // consensus RPC (for signing)
    evmRpc: "https://evm.testnet.example",   // EVM + qor_ JSON-RPC
  },
});
```

الشبكة الرئيسية (chain id `qorechain-vladi`) قيد التشغيل. حدّدها وتجاوز
الإعدادات الافتراضية لـ localhost بعناوين URL الخاصة بعقدتك:

```ts
const main = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://rest.mainnet.example",
    rpc: "https://rpc.mainnet.example",
    evmRpc: "https://evm.mainnet.example",
  },
});
```

## 2. اشتقاق حساب

تشتق عبارة استرجاع (mnemonic) واحدة حسابات native (`qor1…`) وEVM (`0x…`) وSVM (base58)
عبر مسارات اشتقاق مستقلة.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Cosmos-style secp256k1)
```

راجع [الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc) لاشتقاق EVM/SVM
وجدول الاشتقاق الكامل.

## 3. قراءة رصيد

```ts
// Cosmos bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. إرسال تحويل QOR

اشتق حساباً native، وكيّف مفتاحه الخاص في أداة توقيع، وصِل
`TxClient`، وأرسل الرموز. استخدم `toBase("1.5")` لتحويل QOR إلى الوحدة الأساسية `uqor`.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rpc: "https://rpc.testnet.example",
    rest: "https://rest.testnet.example",
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

تُرجع `toBase("1.5")` القيمة `"1500000"` (لـ QOR وحدة أساسية `uqor` بمقدار 10^6).

## لغات أخرى: الاتصال والقراءة

تعكس هذه نفس إعدادات الشبكة المسبقة وسطح القراءة.

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

## التالي

- [الأدلة](/sdk/guides/evm) — العمل مع كل جهاز افتراضي (EVM وSVM وCosmWasm وعبر الأجهزة الافتراضية).
- [الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc) — الاشتقاق الهرمي الحتمي
  والتوقيع ما بعد الكمومي.
- [مرجع الشبكة ونقاط الوصول](/sdk/reference/network).
- [الأمثلة](/sdk/examples) — مقتطفات قابلة للتشغيل لكل تدفق أعلاه.
