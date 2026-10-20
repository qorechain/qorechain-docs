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
  `unifiedAccountFromSeed`، `addressesFrom20`، `qoreAddresses`. (أُزيلت `unifiedAccountFromPhantomSignature` و`connectPhantomUnified` في الإصدار 0.8.0 وأصبحتا ترميان خطأ.)
- **PQC:** ‏`generatePqcKeypair`، `pqcSign`، `pqcVerify`، وثوابت الأطوال،
  ومعرّفات الخوارزميات ودوالها المساعدة، `PqcSigner`، `HybridSigner`،
  `buildHybridSignatureExtension`، `HYBRID_SIG_TYPE_URL`.
- **دورة حياة مفتاح PQC (0.9.0):** ‏`ensurePqcRegistered` (تقرأ الحالة عبر REST،
  `PqcKeyMismatchError`)، `fetchPqcStatus`، `isRegisteredPqcKey`،
  `buildRegisterPqcKeyMsg`، `signProofOfPossession` / `verifyProofOfPossession`
  (‏`PROOF_OF_POSSESSION_DOMAIN`)، `validateRegisteredPqcKey`،
  `isDegeneratePqcPublicKey`، `migrateToHybrid`، `migratePqcKeyHybrid`،
  `isUpgradeApplied` / `requireUpgradeApplied` (‏`CHAIN_UPGRADE_V3_2_2`،
  `CHAIN_UPGRADE_V3_2_3`).
- **عملاء القراءة (Read clients):** ‏`RestClient` (بما في ذلك `getPermissionSchema`)،
  `JsonRpcClient`، `QorClient`، ودوال HTTP المساعدة (`getJson`، `postJsonRpc`،
  `buildUrl`، `joinUrl`، `QoreHttpError`)؛ وعملاء استعلام منمّطون لكل
  وحدة، بما فيها `amm` و`license` و`abstractaccount`
  (‏`permissionSchema`)، واستعلامات مرساة الحالة `Anchor`/`Anchors` الخاصة بوحدة
  `multilayer`. على نقاط النهاية العامة تستدعي بعض دوال REST المنمّطة مسارات
  لا تقدّمها البوابة: `getAiStats`، `getFeeEstimate`، `getXqorePosition`،
  `getInflationRate` و`getReputation`.
  أما `getBurnStats` و`getAllBalances` و`getBridgeChains` و`getPermissionSchema` و(منذ
  0.9.0، الذي أصلح مسارها بصيغة الجمع `accounts` إلى المسار المُقدَّم بصيغة المفرد
  `/qorechain/pqc/v1/account/{address}`) `getPqcAccount` فتعمل.
- **عبر الأجهزة الافتراضية (Cross-VM):** ‏`getCrossVmMessage`، `getPendingCrossVmMessages`،
  `getCrossVmParams`.
- **QoreChain Native:** ‏`createCosmWasmClient`، `connectCosmWasmSigner`،
  `queryContractSmart`، `getContractInfo`، `instantiate`، `execute`،
  `uploadCode`.
- **المعاملات (Transactions):** ‏`estimateFee`، `directSignerFromPrivateKey`، `TxClient` (هجين
  عند الاتصال بـ `pqcKeypair`، 0.9.0؛ `HYBRID_VERIFY_GAS`)،
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
  [دليل المصادِقات](/sdk/guides/authenticators) (الوحدة الكامنة وراء هذه
  المسارات متوقفة اليوم على كلتا الشبكتين).
- **بايتات التوقيع الهجينة (Hybrid sign-bytes) ‏(0.8.0+):** الخيار `signBytesVersion`
  (‏`"auto" | "v1" | "v2"`) في `buildHybridTx` و`signAndBroadcastHybrid` و
  `signHybridEth` و`EthNativeSigner`؛ و`resolveSignBytesVersion`،
  `SIGN_BYTES_V2_UPGRADES`، `isHybridSignBytesRejection`، `hybridSignBytesV1` /
  `hybridSignBytesV2`، `migrationSignBytes`، `bridgeAttestationSignBytes`.
- **نافذة تفويض EVM ‏(0.8.2+):** ‏`openEvmWindowMsg` (مع `nativeOnly` و
  `allowedTargets` منذ 0.9.0)، `closeEvmWindowMsg`، `fetchEvmWindow`،
  `classifyEvmWindowRejection`، `isEvmWindowRejection`، `MAX_EVM_WINDOW_BLOCKS`،
  `MAX_EVM_WINDOW_TXS`، `MAX_EVM_WINDOW_TARGETS`. راجع
  [نافذة تفويض EVM](/sdk/guides/evm#evm-window).
- **موافقة EIP-7702 ‏(0.9.0):** ‏`authorizeEvmDelegationMsg`، `clearEvmDelegationMsg`،
  `fetchEvmDelegationConsent`، `evmDelegationTupleNonce`،
  `classifyEvmDelegationRejection`، `EVM_DELEGATION_CLEAR`،
  `MAX_EVM_DELEGATION_CONSENT_BLOCKS`.
- **ملخّص الحساب المجرَّد v2 ‏(0.9.0):** ‏`evmAuthSignBytesV2`،
  `resolveEvmAuthDigestVersion`؛ `validateSpendingRules`.
- **الاشتقاق القياسي لـ PQC ‏(0.8.3+):** ‏`derivePqcCanonical(account, mnemonic)`،
  `canonicalAccount(account)`؛ ورسالة تسجيل PQC هي
  `buildRegisterPqcKeyMsg` (تستخدمها `ensurePqcRegistered`). `derivePqcLegacy`
  مهجورة للمفاتيح الجديدة.

### `@qorechain/evm`

‏`createEvmClient`، `evmAccountFromPrivateKey`، ودوال `erc20` المساعدة، وأغلفة
العقود (`deployContract`، `readContract`، `writeContract`)، وارتباطات `precompiles`،
والدوال المساعدة المعتمدة على precompile ‏`simulateWithRiskScore` و`aiRiskScore` و
`aiAnomalyCheck`، و`PRECOMPILE_ADDRESSES`، وواجهات ABI ‏(`ERC20_ABI`،
`IQORE_PQC_ABI`، `IQORE_AI_ABI`، `IQORE_CONSENSUS_ABI`). الارتباطات والدوال
المساعدة المعتمدة على precompile غير مفعّلة على الشبكات العامة (راجع
[عقود EVM المسبقة التجميع](/developer-guide/evm-precompiles#network-status)).

### `@qorechain/svm`

‏`createSvmClient`، `DEFAULT_SVM_RPC_URL`، `svmKeypairFromSecretKey`،
`svmAddress`، وبُناة البرامج (`createMemoInstruction`،
`createTransferTokenInstruction`، `createAssociatedTokenAccountInstruction`،
`getAssociatedTokenAddress`، `createInvokeInstruction`)، وثوابت معرّفات
البرامج.

## اللغات الأخرى

| اللغة | التوثيق المولَّد | التثبيت |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — توثيق docstrings على واجهة الـ API العامة | `pip install qorechain-sdk` بالإصدار `0.9.0` (الاستيراد `qorsdk`) |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) (‏godoc) | `go get github.com/qorechain/qorechain-sdk/packages/go/...@v0.9.0` (الوسم `packages/go/v0.9.0`) |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk) (‏rustdoc) | `cargo add qorechain-sdk` (0.9.0؛ الاستيراد `qorechain`) |
| Java | توثيق javadoc على Maven Central | `io.github.qorechain:qorechain-sdk:0.9.1` (أما اللغات الأخرى فـ 0.9.0) |

كل حزمة تعكس الواجهة نفسها (الإعدادات المسبقة للشبكات، وأدوات الفئات
النقدية/العناوين، والاشتقاق الهرمي الحتمي HD — بما في ذلك الحسابات الموحّدة الأصيلة بنمط eth — وأساسيات
PQC والتوقيع الهجين، والرسائل والاستعلامات المنمّطة، ومسارات
المصادِقات، وعملاء القراءة عبر REST و‏JSON-RPC ذات البادئة `qor_`)، موثَّقةً داخل
الشيفرة المصدرية بحيث تعرضها أدوات التوثيق الأصيلة لكل لغة. أما بُناة المحافظ في
TypeScript ‏(`buildPhantom*` / `buildMetaMask*`) ومحوّلات محافظ المتصفح
فهي متاحة في TypeScript فقط.
