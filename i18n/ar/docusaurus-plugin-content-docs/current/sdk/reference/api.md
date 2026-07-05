---
slug: /sdk/reference/api
title: مرجع API
sidebar_label: API
sidebar_position: 3
---

# مرجع API

## TypeScript (`@qorechain/sdk`)

تأتي حزم TypeScript مع توثيق TSDoc كامل لواجهتها العامة، كما أن إعدادات
[TypeDoc](https://typedoc.org) مهيّأة داخل الحزمة الأساسية. لتوليد مرجع API
بصيغة HTML للحزمة `@qorechain/sdk`:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

يشغّل هذا الأمر السكربت `docs:api` (المعتمد على `typedoc`) المعرَّف في `packages/ts`، منتجًا
موقع الـ API ضمن دليل المخرجات `docs/` الخاص بتلك الحزمة. المخرجات المولَّدة
لا يتم إيداعها في المستودع — شغِّل الأمر محليًا أو ادمجه في خط أنابيب
التوثيق الخاص بك.

يوجد إعداد TypeDoc الخاص بموقع التوثيق نفسه في `docs/typedoc.json`؛ وهو
يشير إلى نقطة الدخول الخاصة بالحزمة الأساسية بحيث يمكنك إعادة التوليد من مشروع
التوثيق أيضًا.

### نظرة سريعة على الواجهة العامة

الصادرات المدعومة والمقصودة من `@qorechain/sdk`:

- **العميل (Client):** ‏`createClient`، والأنواع `QoreChainClient`، `CreateClientOptions`،
  `ConnectTxOptions`، `ClientFees`.
- **الشبكات (Networks):** الإعدادات المسبقة، ودوال البحث/العرض المساعدة، وأنواع الإعدادات (وحدة
  الشبكات).
- **الأدوات المساعدة (Utilities):** ‏`toBase` / `fromBase` (الفئة النقدية denom)، وترميز العناوين والتحقق منها.
- **الحسابات (Accounts):** ‏`generateMnemonic`، `validateMnemonic`، `deriveNativeAccount`،
  `deriveEvmAccount`، `deriveSvmAccount`؛ وأنواع الحسابات.
- **الحسابات الموحّدة (0.6.0):** ‏`deriveUnifiedAccount`،
  `unifiedAccountFromSeed`، `addressesFrom20`، `qoreAddresses`،
  `unifiedAccountFromPhantomSignature`، `connectPhantomUnified`.
- **PQC:** ‏`generatePqcKeypair`، `pqcSign`، `pqcVerify`، وثوابت الأطوال،
  ومعرّفات الخوارزميات ودوالها المساعدة، `PqcSigner`، `HybridSigner`،
  `buildHybridSignatureExtension`، `HYBRID_SIG_TYPE_URL`.
- **عملاء القراءة (Read clients):** ‏`RestClient` (بما في ذلك `getPermissionSchema`)،
  `JsonRpcClient`، `QorClient`، ودوال HTTP المساعدة (`getJson`، `postJsonRpc`،
  `buildUrl`، `joinUrl`، `QoreHttpError`)؛ وعملاء استعلام منمّطون لكل
  وحدة، بما فيها `amm` و`license` و`abstractaccount`
  (‏`permissionSchema`)، واستعلامات مرساة الحالة `Anchor`/`Anchors` الخاصة بوحدة
  `multilayer`.
- **عبر الأجهزة الافتراضية (Cross-VM):** ‏`getCrossVmMessage`، `getPendingCrossVmMessages`،
  `getCrossVmParams`.
- **CosmWasm:** ‏`createCosmWasmClient`، `connectCosmWasmSigner`،
  `queryContractSmart`، `getContractInfo`، `instantiate`، `execute`،
  `uploadCode`.
- **المعاملات (Transactions):** ‏`estimateFee`، `directSignerFromPrivateKey`، `TxClient`،
  `MSG_SEND_TYPE_URL`، والدوال الهجينة المساعدة (`encodeHybridExtension`،
  `attachHybridExtension`، `buildHybridTx`، `signAndBroadcastHybrid`)؛
  وفكّ ترميز الأخطاء المهيكل عبر `decodeTxError` (بما في ذلك رموز `abstractaccount`
  ‏5/6/10/11 ورمز `pqc` ‏21).
- **التوقيع الأصيل بنمط eth ‏(0.6.0):** ‏`signClassicalEth`، `signHybridEth`
  (‏secp256k1 فوق `keccak256(SignDoc)`، ونوع المفتاح العام
  `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`، إضافةً إلى امتداد ML-DSA-87
  الهجين)، `EthNativeSigner`، `accountAuthInfo`.
- **مسارات المصادِقات (Authenticator lanes) ‏(0.7.0):** مركّبات الرسائل
  `msg.abstractaccount.registerAuthenticator` / `revokeAuthenticator` /
  `executeEvm` / `executeCosmos` وتدوير `msg.pqc` (مصدَّرة أيضًا
  بشكل مستقل باسم `executeEvmMsg`، `executeCosmosMsg`،
  `registerEthAuthenticatorMsg`، `revokeAuthenticatorMsg`،
  `rotatePqcKeyMsg`)؛ وبايتات التوقيع المطابقة بايتًا ببايت `evmAuthSignBytes`،
  `cosmosAuthSignBytes`، `rotationSignBytes`؛ وبُناة المحافظ
  `buildPhantomExecuteEvm` / `buildPhantomExecuteCosmos` (‏ed25519
  عبر `signMessage`) و`buildMetaMaskExecuteEvm` / `buildMetaMaskExecuteCosmos`
  (‏EIP-191 عبر `personal_sign`)؛ وتدوير المفاتيح `rotatePqcKeyMsgFromMnemonic`،
  `derivePqcLegacy`. راجع
  [دليل المصادِقات](/sdk/guides/authenticators).

### `@qorechain/evm`

‏`createEvmClient`، `evmAccountFromPrivateKey`، ودوال `erc20` المساعدة، وأغلفة
العقود (`deployContract`، `readContract`، `writeContract`)، وارتباطات `precompiles`،
و`PRECOMPILE_ADDRESSES`، وواجهات ABI ‏(`ERC20_ABI`، `IQORE_PQC_ABI`،
`IQORE_AI_ABI`، `IQORE_CONSENSUS_ABI`).

### `@qorechain/svm`

‏`createSvmClient`، `DEFAULT_SVM_RPC_URL`، `svmKeypairFromSecretKey`،
`svmAddress`، وبُناة البرامج (`createMemoInstruction`،
`createTransferTokenInstruction`، `createAssociatedTokenAccountInstruction`،
`getAssociatedTokenAddress`، `createInvokeInstruction`)، وثوابت معرّفات
البرامج.

## اللغات الأخرى

| اللغة | التوثيق المولَّد | التثبيت |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — توثيق docstrings على واجهة الـ API العامة | `pip install qorechain-sdk` بالإصدار `0.7.0` (الاستيراد `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (‏godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...` (الوسم `packages/go/v0.7.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (‏rustdoc) | `cargo add qorechain-sdk` — أحدث حزمة crate منشورة (0.7.0 من المستودع؛ الاستيراد `qorechain`) |
| Java | توثيق javadoc على Maven Central | `io.github.qorechain:qorechain-sdk:0.7.0` |

كل حزمة تعكس الواجهة نفسها (الإعدادات المسبقة للشبكات، وأدوات الفئات
النقدية/العناوين، والاشتقاق الهرمي الحتمي HD — بما في ذلك الحسابات الموحّدة الأصيلة بنمط eth — وأساسيات
PQC والتوقيع الهجين، والرسائل والاستعلامات المنمّطة، ومسارات
المصادِقات، وعملاء القراءة عبر REST و‏JSON-RPC ذات البادئة `qor_`)، موثَّقةً داخل
الشيفرة المصدرية بحيث تعرضها أدوات التوثيق الأصيلة لكل لغة. أما بُناة المحافظ في
TypeScript ‏(`buildPhantom*` / `buildMetaMask*`) ومحوّلات محافظ المتصفح
فهي متاحة في TypeScript فقط.
