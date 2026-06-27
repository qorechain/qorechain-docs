---
slug: /sdk/reference/api
title: مرجع API
sidebar_label: API
sidebar_position: 3
---

# مرجع API

## TypeScript (`@qorechain/sdk`)

تُشحن حزم TypeScript مع توثيق TSDoc كامل على سطحها العام، كما أن
إعداد [TypeDoc](https://typedoc.org) مدمج في حزمة النواة. لتوليد
مرجع API بصيغة HTML لـ `@qorechain/sdk`:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

يشغّل هذا سكربت `docs:api` (`typedoc`) المُعرَّف في `packages/ts`، منتجاً
موقع API ضمن دليل إخراج `docs/` الخاص بتلك الحزمة. الإخراج المُولَّد
غير مُودَع في المستودع — شغّل الأمر محلياً أو ادمجه في
خط أنابيب الوثائق الخاص بك.

يقع إعداد TypeDoc الخاص بموقع الوثائق في `docs/typedoc.json`؛ وهو
يشير إلى نقطة دخول حزمة النواة بحيث يمكنك إعادة التوليد من مشروع
الوثائق أيضاً.

### السطح العام بنظرة سريعة

التصديرات المقصودة والمدعومة لـ `@qorechain/sdk`:

- **العميل:** `createClient`، والأنواع `QoreChainClient` و`CreateClientOptions`
  و`ConnectTxOptions` و`ClientFees`.
- **الشبكات:** الإعدادات المسبقة، ومساعدات البحث/السرد، وأنواع الإعداد (وحدة الشبكات).
- **الأدوات المساعدة:** `toBase` / `fromBase` (الفئة النقدية)، وترميز/التحقق من العناوين.
- **الحسابات:** `generateMnemonic` و`validateMnemonic` و`deriveNativeAccount`
  و`deriveEvmAccount` و`deriveSvmAccount`؛ وأنواع الحسابات.
- **PQC:** `generatePqcKeypair` و`pqcSign` و`pqcVerify`، وثوابت الطول،
  ومعرّفات/مساعدات الخوارزميات، و`PqcSigner` و`HybridSigner`،
  و`buildHybridSignatureExtension` و`HYBRID_SIG_TYPE_URL`.
- **عملاء القراءة:** `RestClient` و`JsonRpcClient` و`QorClient`، ومساعدات HTTP
  (`getJson` و`postJsonRpc` و`buildUrl` و`joinUrl` و`QoreHttpError`).
- **عبر الأجهزة الافتراضية:** `getCrossVmMessage` و`getPendingCrossVmMessages`
  و`getCrossVmParams`.
- **CosmWasm:** `createCosmWasmClient` و`connectCosmWasmSigner`
  و`queryContractSmart` و`getContractInfo` و`instantiate` و`execute`
  و`uploadCode`.
- **المعاملات:** `estimateFee` و`directSignerFromPrivateKey` و`TxClient`
  و`MSG_SEND_TYPE_URL`، والمساعدات الهجينة (`encodeHybridExtension`
  و`attachHybridExtension` و`buildHybridTx` و`signAndBroadcastHybrid`).

### `@qorechain/evm`

`createEvmClient` و`evmAccountFromPrivateKey`، ومساعدات `erc20`، وأغلفة
العقود (`deployContract` و`readContract` و`writeContract`)، وروابط `precompiles`،
و`PRECOMPILE_ADDRESSES`، وواجهات ABI (`ERC20_ABI` و`IQORE_PQC_ABI`
و`IQORE_AI_ABI` و`IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

`createSvmClient` و`DEFAULT_SVM_RPC_URL` و`svmKeypairFromSecretKey`
و`svmAddress`، ومُنشِئات البرامج (`createMemoInstruction`
و`createTransferTokenInstruction` و`createAssociatedTokenAccountInstruction`
و`getAssociatedTokenAddress` و`createInvokeInstruction`)، وثوابت معرّفات البرامج.

## لغات أخرى

| اللغة | الوثائق المُولَّدة | التثبيت |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — docstrings على واجهة API العامة | `pip install qorechain-sdk` (استيراد `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (rustdoc) | `cargo add qorechain-sdk` |

تعكس كل حزمة نفس السطح (إعدادات الشبكة المسبقة، وأدوات الفئة النقدية/العناوين،
والاشتقاق الهرمي الحتمي، وأساسيات PQC، وعملاء قراءة REST + `qor_` JSON-RPC)،
موثقاً ضمنياً في الكود المصدري بحيث تعرضه أدوات التوثيق الأصلية للغة.
