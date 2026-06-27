---
slug: /sdk/guides/cosmwasm
title: دليل CosmWasm
sidebar_label: CosmWasm
sidebar_position: 3
---

# دليل CosmWasm

تتضمن النواة TypeScript (`@qorechain/sdk`) أغلفة رقيقة ومُنمَّطة فوق
`@cosmjs/cosmwasm-stargate` للاستعلام عن عقود CosmWasm وتنفيذها. تستخدم القراءات
عميلًا للقراءة فقط؛ بينما تستخدم تغييرات الحالة عميل توقيع.

## استعلامات للقراءة فقط

افتح عميل CosmWasm للقراءة فقط من نسخة `createClient()` الخاصة بك — فهو
يتصل عبر نقطة نهاية الإجماع RPC ويُخزَّن مؤقتًا (memoized) على العميل.

```ts
import {
  createClient,
  queryContractSmart,
  getContractInfo,
} from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: { rpc: "https://rpc.testnet.example" },
});

const cw = await client.cosmwasm(); // read-only CosmWasmReadClient

// Contract metadata.
const info = await getContractInfo(cw, contractAddress);

// A smart query (the message shape is contract-specific).
const result = await queryContractSmart(cw, contractAddress, { token_info: {} });
```

يمكنك أيضًا إنشاء عميل قراءة مباشرةً باستخدام `createCosmWasmClient`.

## التوقيع: instantiate وexecute وupload

لتغييرات الحالة، اربط عميل توقيع باستخدام `connectCosmWasmSigner` (يأخذ
موقّعًا دون اتصال، من النوع نفسه الذي تنتجه
`directSignerFromPrivateKey`)، ثم استخدم الأغلفة المُنمَّطة:

```ts
import {
  connectCosmWasmSigner,
  uploadCode,
  instantiate,
  execute,
} from "@qorechain/sdk";

const signingCw = await connectCosmWasmSigner(rpcUrl, signer);

// Upload Wasm bytecode -> a code id.
const { codeId } = await uploadCode(signingCw, sender, wasmBytes, fee);

// Instantiate a contract from a code id.
const { contractAddress } = await instantiate(
  signingCw,
  sender,
  codeId,
  { /* init msg */ },
  "label",
  fee,
);

// Execute a message against a deployed contract.
const res = await execute(
  signingCw,
  sender,
  contractAddress,
  { /* execute msg */ },
  fee,
);
```

تتبع أشكال الوسائط الدقيقة `@cosmjs/cosmwasm-stargate`؛ ويضيف الـ SDK أنواعًا مُنمَّطة هي
`ContractMsg` و`FeeInput` و`InstantiateOpts` و`CosmWasmReadClient` و
`CosmWasmSigningClient`.

راجع [مثال](/sdk/examples) `cosmwasm-query` للحصول على مثال قراءة قابل للتشغيل.
