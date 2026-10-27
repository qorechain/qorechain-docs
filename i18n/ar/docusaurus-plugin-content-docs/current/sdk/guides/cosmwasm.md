---
slug: /sdk/guides/cosmwasm
title: دليل QoreChain Native
sidebar_label: QoreChain Native
sidebar_position: 3
---

# دليل QoreChain Native

QoreChain Native هو اسم QoreChain لوقت تشغيل العقود الذكية CosmWasm الخاص بها، ولذلك فإن مكتبات CosmWasm وحزم العميل المذكورة في هذه الصفحة هي التي تستخدمها معه.

تتضمن النواة TypeScript (`@qorechain/sdk`) أغلفة رقيقة ومُنمَّطة فوق
`@cosmjs/cosmwasm-stargate` للاستعلام عن عقود QoreChain Native وتنفيذها. تستخدم القراءات
عميلًا للقراءة فقط؛ بينما تستخدم تغييرات الحالة عميل توقيع.

## استعلامات للقراءة فقط

افتح عميل QoreChain Native للقراءة فقط من نسخة `createClient()` الخاصة بك — فهو
يتصل عبر نقطة نهاية الإجماع RPC ويُخزَّن مؤقتًا (memoized) على العميل.

```ts
import {
  createClient,
  queryContractSmart,
  getContractInfo,
} from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: { rpc: "https://rpc-testnet.qore.host" }, // mainnet: https://rpc.qore.host
});

const cw = await client.cosmwasm(); // read-only CosmWasmReadClient

// Contract metadata.
const info = await getContractInfo(cw, contractAddress);

// A smart query (the message shape is contract-specific).
const result = await queryContractSmart(cw, contractAddress, { token_info: {} });
```

يمكنك أيضًا إنشاء عميل قراءة مباشرةً باستخدام `createCosmWasmClient`.

## التوقيع: instantiate وexecute وupload

:::caution الرفع والإنشاء الأولي (instantiate) يتطلبان إذنًا
على `qorechain-vladi` (الشبكة الرئيسية) تكون القيمتان `code_upload_access` و
`instantiate_default_permission` هما `Nobody`، كما أن `MsgStoreCode` /
`MsgInstantiateContract` / `MsgInstantiateContract2` معطّلة أيضًا بواسطة قاطع
الدائرة (circuit breaker) في السلسلة، ولذلك يتم رفض `uploadCode` و`instantiate`
للحسابات العادية. وعلى `qorechain-diana` (شبكة الاختبار، فُحصت في 27 أكتوبر 2026)
تكون قيمة `code_upload_access` هي `Nobody` والمعطَّلة هي `MsgStoreCode` وحدها، بينما
قيمة `instantiate_default_permission` هي `Everybody`، ولذلك يكون `instantiate` مفتوحًا هناك
للشيفرة الموجودة بالفعل. أما العقود الموجودة بالفعل فيمكن الاستعلام عنها (أعلاه)
وتنفيذها. تحقّق من `GET /cosmwasm/wasm/v1/codes/params` لمعرفة الأذونات الحالية.
راجع [تطوير QoreChain Native](/developer-guide/cosmwasm-development).
:::

:::caution عميل التوقيع في QoreChain Native يوقّع توقيعًا تقليديًا
تغلّف `connectCosmWasmSigner` عميل التوقيع في CosmJS، وهو يرفق فقط التوقيع
التقليدي secp256k1. تشترط الشبكات الحية التوقيع الهجين
(secp256k1 + ML-DSA-87) على كل معاملة عبر المسار الأصلي (Native)، ولذلك تُرفض
أي معاملة تُرسل عبرها هناك؛ بينما تعمل مع عقدة لا تشترط الامتداد الهجين (عقدة
تطوير محلية). لتنفيذ `execute` على شبكة حية، ابنِ الرسالة وأرسلها باستخدام
`signAndBroadcastHybrid` (النموذج أدناه).
:::

لتغييرات الحالة على عقدة تقبل التوقيعات التقليدية، اربط عميل توقيع باستخدام
`connectCosmWasmSigner` (يأخذ موقّعًا دون اتصال، من النوع نفسه الذي تنتجه
`directSignerFromPrivateKey`)، ثم استخدم الأغلفة المُنمَّطة. تُرجع الدوال المساعدة
`Promise<unknown>` ما لم تحدد نوع النتيجة:

```ts
import {
  connectCosmWasmSigner,
  uploadCode,
  instantiate,
  execute,
} from "@qorechain/sdk";

const signingCw = await connectCosmWasmSigner(rpcUrl, signer);

// Upload Wasm bytecode -> a code id.
const { codeId } = await uploadCode<{ codeId: number }>(
  signingCw, sender, wasmBytes, "auto",
);

// Instantiate a contract from a code id (the last argument is InstantiateOpts).
const { contractAddress } = await instantiate<{ contractAddress: string }>(
  signingCw,
  sender,
  codeId,
  { /* init msg */ },
  "label",
  { fee: "auto" },
);

// Execute a message against a deployed contract.
const res = await execute(
  signingCw,
  sender,
  contractAddress,
  { /* execute msg */ },
  "auto",
);
```

تتبع أشكال الوسائط الدقيقة `@cosmjs/cosmwasm-stargate`؛ ويضيف الـ SDK أنواعًا مُنمَّطة هي
`ContractMsg` و`FeeInput` و`InstantiateOpts` و`CosmWasmReadClient` و
`CosmWasmSigningClient`.

### التنفيذ على شبكة حية (هجين)

أضف أنواع رسائل QoreChain Native إلى سجل (registry) وأرسل `MsgExecuteContract`
عبر المُنشئ الهجين. يجب تسجيل مفتاح ML-DSA-87 للحساب أولًا
(راجع [التوقيع الهجين](/sdk/guides/quantum-safe)). يتطلب
`npm i @cosmjs/cosmwasm-stargate @cosmjs/proto-signing cosmjs-types @cosmjs/stargate`:

```ts
import { Registry } from "@cosmjs/proto-signing";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import {
  qorechainRegistryTypes,
  signAndBroadcastHybrid,
  derivePqcCanonical,
} from "@qorechain/sdk";

const registry = new Registry([...qorechainRegistryTypes, ...wasmTypes]);
const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(sender);

const result = await signAndBroadcastHybrid({
  registry,
  signer,                                            // from directSignerFromPrivateKey
  pqcKeypair: derivePqcCanonical(sender, mnemonic),  // the key registered on-chain
  messages: [
    {
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: MsgExecuteContract.fromPartial({
        sender,
        contract: contractAddress,
        msg: new TextEncoder().encode(JSON.stringify({ /* execute msg */ })),
        funds: [],
      }),
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

راجع [مثال](/sdk/examples) `cosmwasm-query` للحصول على مثال قراءة قابل للتشغيل.
