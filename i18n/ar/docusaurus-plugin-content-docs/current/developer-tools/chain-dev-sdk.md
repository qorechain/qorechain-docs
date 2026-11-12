---
slug: /developer-tools/chain-dev-sdk
title: حزمة مطوّري السلسلة
sidebar_label: حزمة مطوّري السلسلة
sidebar_position: 34
---

# حزمة مطوّري السلسلة (قوالب EVM وQoreChain Native)

حزمة مطوّري السلسلة هي الجزء من QoreChain SDK الذي يساعد فرق Solidity والعقود الذكية على البناء على QoreChain بالأدوات التي تستخدمها بالفعل. تضيف تعريفات سلاسل viem ومساعِدات نافذة تفويض EVM إلى `@qorechain/evm`، وأربعة قوالب مشاريع إلى `create-qorechain-dapp` (Foundry وHardhat 3 وviem مع wagmi، ورمز QoreChain Native بصيغة CosmWasm)، وبدايات سريعة لـ EVM بخمس لغات، ومرجعًا يوضح كيف تختلف QoreChain EVM عن Ethereum. وهي موجّهة لفرق Solidity التي تنقل عقودها من Ethereum، ولمطوري الواجهات الأمامية لتطبيقات dApp على wagmi وRainbowKit، ولمطوري CosmWasm، ولمشرفي أدوات EVM الراغبين في إضافة QoreChain.

:::note متاح: مضمَّن في SDK 0.14.0
الحزمة **متاحة وقابلة للتثبيت** في QoreChain SDK **0.14.0** (npm، 12 نوفمبر 2026): `@qorechain/evm` و`@qorechain/sdk` و`@qorechain/react` و`@qorechain/svm` و`create-qorechain-dapp` (الذي يحمل أيضًا إصلاحات القوالب في 0.13.1) كلها بالإصدار 0.14.0، مع SDK لغات Python وRust وGo بالإصدار 0.14.0 أيضًا (ما زال Maven Central يعرض Java 0.13.0 في 12 نوفمبر 2026؛ استخدم 0.14.0 متى ظهر). صدر محتواها أول مرة بالإصدار 0.11.0 على npm وحدها (29 أكتوبر 2026) وكانت ضمن 0.12.0 (30 أكتوبر 2026)؛ ولا يوجد 0.11.0 في أي سجل آخر. أُجريت التشغيلات الاختبارية في هذه الصفحة مقابل 0.12.0 في 4 نوفمبر 2026؛ وغيّر 0.13.0 مساعد الحساب على مسار البذرة ومعالجة `PRIVATE_KEY` في القوالب (راجع [ما الذي يغيّره 0.13.0](/sdk/install#whats-new-0130))، ويضيف 0.14.0 دعم العميل لسلسلة v3.2.8، بما فيه حقول نطاق النافذة الجديدة (راجع [ما الذي يغيّره 0.14.0](/sdk/install#whats-new-0140)).
:::

تستهدف الحزمة الشبكة الرئيسية (`qorechain-vladi`، معرّف سلسلة EVM هو 9801) وشبكة الاختبار (`qorechain-diana`، معرّف سلسلة EVM هو 9800).

## ما الذي في الحزمة {#status}

| البند | الحزمة والإصدار | أين |
|---|---|---|
| القراءة باستخدام ethers v6 أو web3.py أو go-ethereum أو alloy أو web3j مقابل نقاط النهاية العامة | لا حاجة إلى أي حزمة QoreChain | [البداية السريعة 1](#quickstart-ethers) |
| `createEvmClient` ومساعِدات ERC-20 وERC-721 وERC-1155 وروابط `precompiles` و`PRECOMPILE_ADDRESSES` | `@qorechain/evm` 0.14.0 | [البداية السريعة 2](#quickstart-evm-080) |
| تعريفات سلاسل viem المسمّاة `qorechain` و`qorechainTestnet`، و`QORECHAIN_CHAINS` و`QORECHAIN_REST_ENDPOINTS` | `@qorechain/evm` 0.14.0 | [البداية السريعة 3](#quickstart-viem) |
| `evmWindowStatus` و`openEvmWindowMessage` و`evmWindowCost` و`classifyEvmWindowRejection` ومحوّلات العناوين وثوابت النافذة والمسار الفرعي `@qorechain/evm/window` | `@qorechain/evm` 0.14.0 | [البداية السريعة 4](#quickstart-window-helpers) |
| فتح نافذة تفويض EVM وقراءتها مع التوقيع، باستخدام `openEvmWindowMsg` و`fetchEvmWindow` و`EthNativeSigner` و`deriveUnifiedAccount` | `@qorechain/sdk` 0.14.0 | [البداية السريعة 5](#quickstart-open-window) |
| منشئات النافذة نفسها في Python وGo وRust وJava | حِزم SDK بالإصدار 0.14.0 | [الواجهة البرمجية الرئيسية](#main-api) |
| مساعِدات موافقة EIP-7702 `authorizeEvmDelegationMsg` و`clearEvmDelegationMsg` و`classifyEvmDelegationRejection` | `@qorechain/sdk` 0.14.0 | [الواجهة البرمجية الرئيسية](#main-api) |
| سبعة قوالب لأداة التوليد: `evm-solidity` و`fullstack-web` و`rollup-app` و`foundry` و`hardhat` و`viem-wagmi` و`cosmwasm`، والمساعِد `pnpm window` | `create-qorechain-dapp` 0.14.0 | [القوالب](#templates) |
| `PqcStatusBadge` | `@qorechain/react` 0.14.0 | [الواجهة البرمجية الرئيسية](#main-api) |

## الابتكارات {#innovations}

- **الإرسال مفوَّض عن قصد، بنافذة محدودة.** لا تُقبل معاملة EVM إلا من حساب لديه مفتاح ML-DSA-87 مسجَّل ونافذة تفويض EVM مفتوحة. تُفتح النافذة برسالة على المسار الأصلي موقَّعة بالتوقيع الهجين (secp256k1 مع ML-DSA-87)، ولذلك لا يمكن لمفتاح secp256k1 الذي تحتفظ به مكتبة EVM أن يفوّض الإنفاق وحده. أما معاملة Ethereum نفسها فتبقى معاملة Ethereum عادية.
- **نافذة تُحدَّد بحدود، لا بالثقة.** تحدّ النافذة عدد الكتل (من 1 إلى 17,280) وعدد معاملات EVM (من 1 إلى 1,000) ومجموعًا بوحدة uqor يغطي القيمة زائد الحد الأقصى للرسوم لكل معاملة مقبولة. و`nativeOnly` تقصرها على تحويلات QOR العادية، و`allowedTargets` (16 عنوانًا على الأكثر) تحدّ المستلمين وترفض إنشاء العقود.
- **حساب واحد، ترميزان.** في حساب eth-native يكون العنوانان `0x` و`qor1...` هما البايتات العشرين نفسها ويُظهران الرصيد نفسه، فيعمل مفتاح واحد على EVM وعلى المسار الأصلي. لرمز QOR 18 خانة عشرية على EVM و6 على المسار الأصلي (`uqor`)؛ و1 uqor يساوي 10^12 wei.
- **مساعِدات تسمّي سبب الرفض.** تحوّل `classifyEvmWindowRejection` المعاملة المرفوضة إلى واحد من أربعة أسباب: `no-pqc-key` أو `no-window` أو `exhausted` أو `invalid`، انطلاقًا من خطأ viem أو ethers أو نتيجة تسليم على المسار الأصلي أو نص.
- **تحديد حجم النافذة بوحدة uqor.** تحدّد `evmWindowCost` و`weiToUqorCeil` حجم النافذة من القيمة والغاز وسقف الرسوم، مع تقريب wei إلى الأعلى إلى uqor، فيغطي المجموع أسوأ الحالات.
- **لا فتح تلقائي.** لا تتضمن الحزمة عمدًا أي مساعِد يفتح نافذة قبل الإرسال. فالنافذة موجودة ليكون الإنفاق مفوَّضًا عن قصد.
- **محاكاة مجانية.** يعمل `eth_call` و`eth_estimateGas` لأي حساب دون نافذة ودون مفتاح مسجَّل.
- **قوالب تربط النافذة.** يتضمن قالبا Foundry وHardhat الأمر `pnpm window status|register|open`، الذي يشتق مفتاح ML-DSA-87 (من العبارة الذاكرية مع `QORE_MNEMONIC`؛ ومع `PRIVATE_KEY`، منذ 0.13.0، من رمز استرداد في `QORE_PQC_RECOVERY_CODE`)، ويسجّله مرة واحدة ويبثّ رسالة الفتح الموقَّعة هجينًا.
- **سطح توافق موثَّق.** تسرد صفحة مرجعية (قُرئت من نقاط النهاية العامة في 27 أكتوبر 2026، وأُعيد فحص جزء منها في 4 نوفمبر) ما يختلف عن Ethereum: أنواع المعاملات والـ forks والنهائية وحقول الرسوم ومساحات أسماء JSON-RPC والـ precompiles. وهي ملخّصة [أدناه](#evm-differences).

## ما تحتويه الحزمة {#contents}

### `@qorechain/evm` {#evm-package}

جديد في الحزمة:

- `qorechain` (9801) و`qorechainTestnet` (9800): كائنا سلسلة viem مع نقاط النهاية العامة، والعملة الأصلية QOR بـ 18 خانة عشرية، والمستكشف `https://explore.qore.network`. تسرد `QORECHAIN_CHAINS` السلسلتين (الشبكة الرئيسية ثم شبكة الاختبار) لاستخدامهما مع wagmi وRainbowKit. وتربط `QORECHAIN_REST_ENDPOINTS` كل معرّف سلسلة EVM بنقطة REST الخاصة بمساره الأصلي.
- `evmWindowStatus({ rest, address })` تقرأ نافذة الحساب عبر REST (`/qorechain/pqc/v1/evm_window/{address}`)، وتقبل عنوانًا بصيغة `qor1...` أو `0x`، وتجيب بـ `{ found: false }` بدل الفشل عند عدم وجود نافذة. وتحلّل `parseEvmWindow` الإجابة الخام.
- `openEvmWindowMessage(params)` تتحقق من الحدود وتركّب الرسالة الأصلية `MsgOpenEVMWindow` ككائن `{ typeUrl, value }` بسيط، جاهز للتوقيع بواسطة `@qorechain/sdk`. وتُجري `checkOpenEvmWindowParams` الفحوص وحدها.
- `evmWindowCost` و`weiToUqorCeil` و`classifyEvmWindowRejection` و`isEvmWindowRejection` و`toQorAddress` و`toEvmAddress`، والثوابت `OPEN_EVM_WINDOW_TYPE_URL` و`CLOSE_EVM_WINDOW_TYPE_URL` و`MAX_EVM_WINDOW_BLOCKS` (17,280) و`MAX_EVM_WINDOW_TXS` (1,000) و`MAX_EVM_WINDOW_TARGETS` (16).
- تُنشر مساعِدات النافذة أيضًا دون viem في المسار الفرعي `@qorechain/evm/window`.

موجود قبل الحزمة (0.8.0 وما بعده): `createEvmClient` و`evmAccountFromPrivateKey` و`writeContract` ومساعِدات `erc20` ومساعِدات ERC-721 وERC-1155 وروابط `precompiles` و`PRECOMPILE_ADDRESSES`. راجع [دليل EVM](/sdk/guides/evm).

### القوالب {#templates}

لدى `create-qorechain-dapp` 0.14.0 سبعة قوالب: `evm-solidity` و`fullstack-web` و`rollup-app` (راجع [أدوات التوليد وCLI](/developer-tools/scaffolders-and-cli)) وأربعة تتبع الحزمة:

| القالب | ما تحصل عليه |
|---|---|
| `foundry` | مشروع Foundry: عقد `Counter` واختبارات ونص نشر ونقاط RPC مسمّاة `qorechain` و`qorechain_testnet`، والأمر `pnpm window status\|register\|open`. |
| `hardhat` | مشروع Hardhat 3 وviem: عقد `Counter` واختبارات على الشبكة المحاكاة ووحدة نشر Ignition وشبكتان `qorechain` و`qorechainTestnet`، والأمر `pnpm window status\|register\|open`. |
| `viem-wagmi` | تطبيق dApp بـ Vite وReact وwagmi وRainbowKit مع محفظة QoreX (`@qorechain/qorex-rainbowkit`) وتعريفات السلاسل من `@qorechain/evm`. يعرض آخر كتلة ورصيد QOR ونافذة EVM للحساب. يثبّت viem على `~2.53.1` ويصل إلى REST عبر وكيل Vite باسم `/lcd` (لأن REST العام لا يرسل ترويسات CORS)، فيستدعي كود المتصفح `/lcd/...` أثناء التطوير (0.13.1). |
| `cosmwasm` | رمز CW20 على QoreChain Native (CosmWasm) مبني على `cw20-base` من cw-plus، وبناء محسَّن في Docker، ونص مقترح رفع عبر الحوكمة، ونصوص إنشاء نسخة واستعلام على شبكة الاختبار. |

تثبّت القوالب `@qorechain/evm` و`@qorechain/sdk` على `^0.14.0` (كانت قوالب 0.12.0 تثبّتها على `^0.12.0`؛ قُرئ ذلك من قالب `foundry` مُولَّد في 4 نوفمبر 2026).

### الأدلة في مستودع SDK {#guides}

يحتوي المستودع (`docs/docs/guides/`، الوسم `v0.14.0`) على `evm-quickstarts.md` (عمليات قراءة بـ viem وethers v6 وweb3.py وgo-ethereum وalloy وweb3j، مع قسم "Before you send")، و`evm-differences.md` ("QoreChain EVM compared with Ethereum")، و`evm.md` و`cosmwasm.md`. والمادة نفسها على هذا الموقع: [دليل EVM](/sdk/guides/evm) و[تطوير EVM](/developer-guide/evm-development) و[تطوير QoreChain Native](/developer-guide/cosmwasm-development).

في المستودع أيضًا ملفات مساهمة لأدوات أخرى (تعريفات سلاسل viem وإدخالات سلاسل Sourcify وامتداد Scaffold-ETH 2) تحت `contrib/` و`templates/scaffold-eth-extension/`. وهي ملفات مُعدَّة في المستودع، وليست مدمجة في المشاريع الأصلية.

## حالات الاستخدام {#use-cases}

1. **فريق Solidity ينقل مشروعه من Ethereum.** ولّد القالب `foundry` وانسخ العقود إليه، ونفّذ `forge test` محليًا، ونفّذ `pnpm window register` مرة واحدة و`pnpm window open` قبل كل دفعة نشر. تسرد [الاختلافات](#evm-differences) ما يجب تغييره: لا معاملات blob، وPREVRANDAO ثابت، ولا تتبّع `debug_*` على نقاط النهاية العامة.
2. **مشروع Hardhat 3 متجه إلى شبكة الاختبار.** ولّد القالب `hardhat` وأبقِ وحدات Ignition لديك وانشر بـ `pnpm deploy:testnet` بعد فتح نافذة. انتظر نحو 10 ثوانٍ بعد فتح النافذة قبل أول معاملة (يذكر ذلك ملف README الخاص بـ Hardhat).
3. **واجهة dApp أمامية على wagmi.** استورد `QORECHAIN_CHAINS` في إعداد wagmi وRainbowKit، واعرض نافذة المستخدم بـ `evmWindowStatus`، وفسّر الإرسال المرفوض بـ `classifyEvmWindowRejection`.
4. **خدمة خلفية بلغة أخرى.** تقرأ خدمة Python أو Go أو Rust أو Java الأرصدة وتستدعي العقود باستخدام web3.py أو go-ethereum أو alloy أو web3j كما على Ethereum. وللإرسال تبني `MsgOpenEVMWindow` بـ QoreChain SDK 0.12.0 الخاص بتلك اللغة.
5. **مطوّر CosmWasm.** ولّد القالب `cosmwasm` واختبر CW20 بـ `cargo test`، وابنِ Wasm المحسَّن، وقدّم مقترح حوكمة لتخزين الشيفرة، ثم أنشئ نسخة منها على شبكة الاختبار بعد أن يمرّ المقترح.
6. **تكامل محفظة أو حفظ.** التكامل الذي يحتفظ بالمفاتيح للمستخدمين عليه أن يعلم أن مفتاح secp256k1 وحده لا يستطيع الإنفاق على مسار EVM. فهو يفتح نوافذ ضيقة (`nativeOnly` أو `allowedTargets`) موقَّعة بمفتاح ML-DSA-87 للحساب، باستخدام `openEvmWindowMsg` من `@qorechain/sdk` 0.12.0.
7. **مشرفو أدوات EVM.** يستطيع مشرفو viem وSourcify وScaffold-ETH 2 قراءة ملفات المساهمة المُعدَّة لإضافة معرّفي السلسلة 9800 و9801.

## كيف تعمل {#how-it-works}

- **قاعدة التفويض.** تقبل السلسلة معاملة EVM من حساب لديه مفتاح ML-DSA-87 مسجَّل ونافذة سارية، وترفضها خلاف ذلك. القاعدة هي ميزة البروتوكول `evm-pqc-authorisation-window`، المفعّلة على الشبكتين؛ اقرأها في `/qorechain/pqc/v1/protocol_features`. راجع [نافذة تفويض EVM](/sdk/guides/evm#evm-window) و[دليل المعاملة الأولى](/getting-started/first-transaction#evm-window).
- **الفتح والإغلاق.** تفتح `MsgOpenEVMWindow` (`/qorechain.pqc.v1.MsgOpenEVMWindow`) نافذة، وهي موقَّعة هجينًا؛ وفتح نافذة يحلّ محل أي نافذة سابقة. وتغلقها `MsgCloseEVMWindow`.
- **ما تحدّه النافذة.** الكتل (عدد كتل لا مدة زمنية)، ومعاملات EVM، ومجموع بوحدة uqor يغطي القيمة زائد الحد الأقصى للرسوم (حد الغاز مضروبًا في سقف الرسوم) لكل معاملة مقبولة. وتضيّق `nativeOnly` و`allowedTargets` المستلمين الذين تقبلهم، لا مقدار الرمز (فالرمز المدرج يقبل أي مقدار، بما في ذلك `approve`؛ راجع [تحديد نطاق النافذة](/sdk/guides/evm#evm-window-scope)).
- **الـ nonce.** التسلسل الأصلي وnonce الخاص بـ EVM هما العدّاد نفسه. وفتح النافذة يقدّمه، ولذلك افتح النافذة، ثم اقرأ الـ nonce، ثم وقّع معاملة EVM.
- **مساعِد القالب.** في `foundry` و`hardhat` يشتق `pnpm window` الحساب من `PRIVATE_KEY` (أو `QORE_MNEMONIC`)، ويشتق مفتاح ML-DSA-87 الخاص به (من `QORE_PQC_RECOVERY_CODE` مع `PRIVATE_KEY`، منذ 0.13.0؛ ومن العبارة الذاكرية مع `QORE_MNEMONIC`، دون تغيير)، ويسجّل المفتاح مرة واحدة (`register`) ويبثّ `MsgOpenEVMWindow` موقَّعة هجينًا (`open`). وهو يحدّد افتراضيًا نافذة من 600 كتلة و5 معاملات لمعاملات تصل إلى 3,000,000 غاز بسقف رسوم 250 gwei.
- **CosmWasm على QoreChain Native.** رفع الشيفرة يتم عبر الحوكمة على الشبكتين (`code_upload_access` تساوي `Nobody`): تُخزَّن الشيفرة بمقترح حوكمة يحمل `MsgStoreCode` ومرسله وحدة الحوكمة. الإنشاء (instantiation) مفتوح للجميع على شبكة الاختبار ومغلق على الشبكة الرئيسية (`instantiate_default_permission` تساوي `Everybody` على شبكة الاختبار و`Nobody` على الشبكة الرئيسية، قُرئت في 27 أكتوبر 2026). اقرأ الاثنين في `/cosmwasm/wasm/v1/codes/params`؛ واعرض الشيفرات المخزَّنة في `/cosmwasm/wasm/v1/code`. لم تكن على الشبكة الرئيسية أي شيفرة مخزَّنة في 27 أكتوبر 2026 وفي 4 نوفمبر 2026.

## QoreChain EVM مقارنةً بـ Ethereum {#evm-differences}

قُرئ من نقاط النهاية العامة في 27 أكتوبر 2026 (دليل SDK `evm-differences.md`). حالة الشبكة (الرسوم وأزمنة الكتل والـ precompiles المفعّلة) مؤرَّخة؛ اقرأها مباشرة قبل الاعتماد عليها.

- **الإرسال.** تحتاج كل معاملة EVM إلى مفتاح ML-DSA-87 مسجَّل ونافذة مفتوحة لمرسلها، دون استثناءات لأي حساب. وتشمل النشر والتحويلات واستدعاءات العقود جميعًا. والحساب الذي لديه مفتاح مسجَّل لا يملك مسار توقيع كلاسيكيًا على المسار الأصلي أيضًا: كل معاملة أصلية يوقّعها تكون هجينة.
- **المحاكاة.** لا يحتاج `eth_call` و`eth_estimateGas` إلى نافذة.
- **أنواع المعاملات.** تُقبل الأنواع 0 (legacy) و1 (قائمة الوصول) و2 (EIP-1559) و4 (EIP-7702). **معاملات EIP-4844 blob (النوع 3) مرفوضة.** تعمل شيفرات Cancun، لكن `blobGasUsed` و`excessBlobGas` تساويان 0 دائمًا، و`eth_blobBaseFee` غير موجودة، والـ precompile الخاص بتقييم النقطة (`0x0a`) يعيد خطأ.
- **الـ forks.** حتى London منذ التكوين الأول؛ وShanghai وCancun وPrague مفعّلة؛ أما Osaka فغير مفعّلة.
- **PREVRANDAO (EIP-4399) ثابت** (`0xff...ff`) و`mixHash` في الترويسة صفر. لا تستخدمه أبدًا مصدرًا للعشوائية.
- **EIP-7702** مقبول مع قاعدة خاصة بـ QoreChain: كل سلطة (authority) يكون تفويضها نافذًا تحتاج إلى مفتاح PQC مسجَّل وموافقة لمرة واحدة مسجَّلة بـ `MsgAuthorizeEVMDelegation` (8 تفويضات على الأكثر في المعاملة الواحدة، ولا سلطة مكرّرة). ولا تُحتسب نافذة الراعي موافقةً من السلطات. وتزيل `MsgClearEVMDelegation` التفويض. راجع [موافقة EIP-7702](/sdk/guides/evm#evm-delegation-consent).
- **النهائية.** تكون الكتل نهائية عند اعتمادها: تعيد `latest` و`safe` و`finalized` الكتلة نفسها، دون إعادة تنظيم ودون كتل أعمام (uncles).
- **الرسوم (الشبكتان، قُرئت في 27 أكتوبر 2026 ومرة أخرى في 4 نوفمبر 2026).** `eth_gasPrice` تساوي 112.5 gwei؛ والرسم الأساسي 100 gwei (حد السلسلة الأدنى 0.1 uqor للغاز الواحد)؛ و`eth_maxPriorityFeePerGas` تساوي 12.5 gwei؛ و`gasLimit` في الترويسة 4,294,967,295. الأدوات التي تضبط سقف الرسوم قرابة ضعف الرسم الأساسي (ومنها Foundry) تحجز من النافذة ما يصل إلى نحو 200 gwei للغاز الواحد بينما تدفع نحو 112.5 gwei.
- **مساحات أسماء JSON-RPC.** `eth` و`net` و`web3` و`txpool`. جميع طرائق `debug_*` و`personal_*` و`admin_*` و`miner_*` غير متاحة (`-32601`)، وكذلك `trace_*` و`eth_coinbase` و`eth_mining` و`eth_hashrate` و`eth_getWork` و`eth_submitWork` و`eth_blobBaseFee` و`eth_simulateV1` و`eth_callMany` و`eth_signTransaction` و`eth_pendingTransactions` و`eth_config`. الأدوات التي تحتاج إلى التتبّع لا تعمل مع نقاط النهاية العامة.
- **سلوك مختلف.** تعمل `eth_getProof` لكنها تعيد إثباتات IAVL الخاصة بالسلسلة، لا إثباتات Merkle-Patricia. وتغطي `eth_getLogs` 10,000 كتلة على الأكثر في الاستعلام الواحد. وتعمل `eth_subscribe` عبر WebSocket وحده. وتُرفض `eth_accounts` و`eth_sign` و`eth_sendTransaction` لأن العقدة لا تحتفظ بأي حسابات: وقّع محليًا واستخدم `eth_sendRawTransaction`. وتُرفض `txpool_content` على نقاط النهاية العامة؛ أما `txpool_status` فتعمل. و`web3_clientVersion` ليست وسيلة موثوقة لاكتشاف العقدة.
- **الأرصدة.** تعيد `eth_getBalance` الرصيد المصرفي بوحدة uqor مضروبًا في 10^12 زائد أي باقٍ أقل من uqor.
- **الـ precompiles.** تستجيب الـ precompiles القياسية في Ethereum كالمعتاد. أما `pqcVerify` (`0x0A01`) و`pqcKeyStatus` (`0x0A02`) فهما **مفعّلان على شبكة الاختبار فقط**؛ ولا يوجد أي منها مفعّل على الشبكة الرئيسية، وتفعيل أحدها يحتاج إلى قرار حوكمة، دون موعد. وتسرد شبكة الاختبار أيضًا `0x0C01` (`rlConsensusParams`). واستدعاء precompile غير مفعّل يعيد بيانات فارغة بدل أن يتراجع، ولذلك اقرأ `active_static_precompiles` في `/cosmos/evm/vm/v1/params` قبل الاعتماد على أي منها. راجع [EVM Precompiles](/developer-guide/evm-precompiles#network-status).
- **الأدوات.** QoreChain ليست في `viem/chains` بعد: استورد السلاسل من `@qorechain/evm`. ولا تسرد Sourcify معرّفي السلسلة 9800 و9801 بعد. ومسار SVM غير مفتوح.

## طريقة الاستخدام {#how-to-use}

كل المقاطع التي تقرأ تستخدم شبكة الاختبار العامة (`qorechain-diana`، معرّف سلسلة EVM هو 9800)، ولا تحتاج إلى مفتاح ولا ترسل شيئًا. رمز ERC-20 التجريبي على العنوان `0x9C2F20329750c16B215bDc50455d320De2a7Ba1c` هو رمز على شبكة الاختبار (الرمز `WQOR`، 18 خانة عشرية)؛ استبدله هو والعنوان بما يخصّك.

### التثبيت لكل لغة {#install}

| اللغة أو الأداة | التثبيت | الحد الأدنى للمنصة |
|---|---|---|
| TypeScript، قراءات EVM ومساعِدات ERC وتعريفات سلاسل viem ومساعِدات النافذة | `npm install @qorechain/evm viem` (0.14.0) | Node.js 20 أو أحدث؛ والاعتماد النظير `viem ^2` |
| TypeScript، توقيع رسالة النافذة | `npm install @qorechain/sdk` (يتضمن 0.14.0 الدوال `openEvmWindowMsg` و`fetchEvmWindow` و`EthNativeSigner` و`deriveUnifiedAccount`) | Node.js 20 أو أحدث |
| React، شارة حالة PQC | `npm install @qorechain/react @qorechain/sdk react react-dom` (0.14.0) | Node.js 20 أو أحدث |
| أداة التوليد، القوالب السبعة كلها | `npx create-qorechain-dapp my-app --template <name>` (0.14.0) | Node.js 20 أو أحدث؛ وFoundry لقالب `foundry`؛ وNode.js 22 لقالب `hardhat` (Hardhat 3)؛ وRust وDocker لقالب `cosmwasm` |
| Python (قراءات EVM) | `pip install "web3>=7,<8"`؛ ورسالة النافذة من `pip install qorechain-sdk` (0.14.0) | Python 3.10 أو أحدث |
| Go (قراءات EVM) | `go get github.com/ethereum/go-ethereum@latest`؛ ورسالة النافذة من `go get github.com/qorechain/qorechain-sdk/packages/go@v0.14.0` | سلسلة أدوات Go |
| Rust (قراءات EVM) | `alloy = { version = "1", features = ["provider-http", "contract", "sol-types"] }`؛ ورسالة النافذة من الحزمة `qorechain-sdk` 0.14.0 | Rust المستقر |
| Java (قراءات EVM) | `org.web3j:core:5.0.0`؛ ورسالة النافذة من `io.github.qorechain:qorechain-sdk:0.14.0` (ما زال Maven Central يعرض 0.13.0 في 12 نوفمبر 2026؛ استخدم 0.14.0 متى ظهر) | JDK 21 (يُبنى QoreChain Java SDK بسلسلة أدوات JDK 21) |

### البداية السريعة 1: القراءة بـ ethers v6 {#quickstart-ethers}

لا حاجة إلى أي حزمة QoreChain. عند تشغيله في 27 أكتوبر 2026 مقابل شبكة الاختبار طبع `chain id: 9800n` ورصيدًا و`token: WQOR 18n`.

```ts
import { Contract, JsonRpcProvider, formatEther } from "ethers";

const provider = new JsonRpcProvider("https://evm-testnet.qore.host", 9800, { staticNetwork: true });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet
const erc20 = new Contract(
  TOKEN,
  ["function symbol() view returns (string)", "function decimals() view returns (uint8)"],
  provider,
);

const { chainId } = await provider.getNetwork();
const balance = await provider.getBalance(ADDRESS);
const symbol: string = await erc20.symbol();
const decimals: bigint = await erc20.decimals();

console.log("chain id:", chainId); // 9800n
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

القراءة نفسها في web3.py وgo-ethereum وalloy وweb3j موجودة في دليل SDK `evm-quickstarts.md` (مذكور هناك أنها اختُبرت مع web3.py 7.16 وgo-ethereum 1.17.10 وalloy 1.8 وweb3j 5.0.0 على JDK 21؛ ولم تعِد هذه الصفحة تشغيلها).

### البداية السريعة 2: القراءة بـ `@qorechain/evm` {#quickstart-evm-080}

بداية سريعة مُختبَرة من مركز المطورين (تضع القائمة علامة «مختبَر» عليها في 27 أكتوبر 2026، حينها على `@qorechain/evm` 0.8.0؛ وشُغّلت مرة أخرى في 4 نوفمبر 2026 مع 0.12.0 وطبعت السطر نفسه من حيث الشكل). تتصل وتكتشف معرّف سلسلة EVM تلقائيًا وتطبع رصيد QOR لحساب صنبور شبكة الاختبار العامة.

```ts
import { createEvmClient } from "@qorechain/evm";
import { formatEther } from "viem";

// Public testnet EVM JSON-RPC (EVM chain ID 9800, auto-detected).
const client = await createEvmClient({ rpcUrl: "https://evm-testnet.qore.host" });

// A public testnet address (the testnet faucet account, EVM form).
const address = "0xf1e70c24817e00aee286f7275e14e61cabd20741";
const wei = await client.publicClient.getBalance({ address });
console.log(await client.getChainId(), address, formatEther(wei), "QOR");
```

### البداية السريعة 3: القراءة بتعريف سلسلة viem {#quickstart-viem}

عند تشغيله في 4 نوفمبر 2026 بعد `npm install @qorechain/evm@0.12.0 viem` طبع `chain id: 9800` ورصيدًا والرمز `WQOR 18`.

```ts
import { createPublicClient, erc20Abi, formatEther, http } from "viem";
import { qorechainTestnet } from "@qorechain/evm";

const client = createPublicClient({ chain: qorechainTestnet, transport: http() });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet

const chainId = await client.getChainId();
const balance = await client.getBalance({ address: ADDRESS });
const symbol = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "symbol" });
const decimals = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "decimals" });

console.log("chain id:", chainId); // 9800
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

### البداية السريعة 4: فحص نافذة وتركيب رسالة الفتح {#quickstart-window-helpers}

من ملف README الخاص بـ `@qorechain/evm`. تقرأ ثم تبني كائن رسالة؛ ولا توقّع ولا ترسل. شُغّلت في 4 نوفمبر 2026 مع 0.12.0: في حساب لا نافذة له أعادت `evmWindowStatus` القيمتين `found: false, live: false`، وعادت الرسالة بـ `typeUrl: '/qorechain.pqc.v1.MsgOpenEVMWindow'` وبـ `maxValue: '1687500'` لخمس معاملات بغاز 3,000,000 عند 112.5 gwei.

```ts
import { evmWindowStatus, openEvmWindowMessage, evmWindowCost } from "@qorechain/evm";

const w = await evmWindowStatus({ rest: "https://api-testnet.qore.host", address: "0x..." });
// w.live, w.remainingTxs, w.remainingValue (uqor), w.remainingBlocks

const msg = openEvmWindowMessage({
  sender: "qor1...", // the same account; toQorAddress("0x...") converts
  blocks: 600,
  maxTxs: 5,
  maxValue: evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 112_500_000_000n }) * 5n,
});
// Sign `msg` hybrid on the native lane, then read the nonce (opening advances it).
```

### البداية السريعة 5: فتح نافذة من TypeScript {#quickstart-open-window}

من دليل SDK `evm-quickstarts.md`، قسم "Before you send". هذا **يرسل معاملة على المسار الأصلي**: شغّله فقط بحساب الاختبار الممول الخاص بك، ولا تستخدم أبدًا عبارة مشتركة أو عامة.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { EthNativeSigner, deriveUnifiedAccount, openEvmWindowMsg } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic); // account.evm = 0x..., account.cosmos = qor1...
const signer = new EthNativeSigner(account, { rest: "https://api-testnet.qore.host" });
const transport = await StargateClient.connect("https://rpc-testnet.qore.host");

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-diana",
  accountNumber, // from /cosmos/auth/v1beta1/accounts/{qor1...}
  sequence,
  fee: { amount: [{ denom: "uqor", amount: "100000" }], gas: "800000" },
  messages: [openEvmWindowMsg({ sender: account.cosmos, blocks: 600, maxTxs: 5, maxValue: "3750000" })],
});
// Now read the nonce and send with viem, ethers, Foundry or Hardhat.
```

لم يُعَد تشغيل هذا المقطع لأجل هذه الصفحة. القيمة `maxValue: "3750000"` تساوي 5 معاملات بـ 3,000,000 غاز وسقف رسوم 250 gwei.

### البداية السريعة 6: توليد مشروع {#quickstart-scaffold-live}

اختُبرت في 27 أكتوبر 2026 داخل مجلد فارغ بـ `npx` من سجل npm العام (حينها 0.10.0، القالب `fullstack-web`): ولّدت المشروع ونجح البناء. وفي 4 نوفمبر 2026 ولّد `create-qorechain-dapp@0.12.0 --template foundry --no-install` مشروعًا يعتمد ملف `package.json` فيه على `@qorechain/evm` و`@qorechain/sdk` بالإصدار `^0.12.0`؛ ولم تُولَّد القوالب الجديدة الأخرى لهذه الصفحة.

```sh
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

### استخدام قوالب الحزمة {#new-templates-usage}

تقبل أداة التوليد أسماء قوالب الحزمة الأربعة (راجع جدول الأعلام أدناه). ويُبنى مشروع `foundry` ويُختبر محليًا بـ `forge build` و`forge test` (دون شبكة)، ويقرأ `pnpm window status` الحساب ومفتاح PQC الخاص به ونافذته. أما `pnpm window register` و`pnpm window open` فتبثّان معاملات على المسار الأصلي من حسابك الممول، ويقوم `forge script ... --broadcast` بالنشر. لا تضع أبدًا مفتاحًا حقيقيًا في `.env.example`، ولا ترفع `.env` أبدًا، ولا تموّل أبدًا عبارة BIP-39 التجريبية العامة (`abandon` مكرَّرة 11 مرة، ثم `about`).

## الواجهة البرمجية الرئيسية {#main-api}

### `@qorechain/evm` {#api-evm}

| الاسم | ما يفعله |
|---|---|
| `qorechain`، `qorechainTestnet` | كائنا سلسلة viem للمعرّفين 9801 و9800 مع نقاط النهاية العامة والمستكشف. |
| `QORECHAIN_CHAINS` | السلسلتان (الشبكة الرئيسية ثم شبكة الاختبار)، لاستخدامهما مع wagmi أو RainbowKit. |
| `QORECHAIN_REST_ENDPOINTS` | من معرّف سلسلة EVM إلى عنوان REST للمسار الأصلي. |
| `evmWindowStatus` | تقرأ نافذة عبر REST: `{ found, live, remainingBlocks, remainingTxs, remainingValue, nativeOnly, allowedTargets, ... }`. |
| `parseEvmWindow` | تحلّل إجابة REST. |
| `openEvmWindowMessage` | تتحقق من الحدود وتبني `MsgOpenEVMWindow` بصيغة `{ typeUrl, value }`. |
| `checkOpenEvmWindowParams` | فحوص الحدود وحدها. |
| `evmWindowCost`، `weiToUqorCeil` | تحديد حجم النافذة بوحدة uqor. |
| `classifyEvmWindowRejection`، `isEvmWindowRejection` | تفسّر الرفض: `no-pqc-key` أو `no-window` أو `exhausted` أو `invalid`. |
| `toQorAddress`، `toEvmAddress` | تحوّل بين `0x` و`qor1...` للحساب نفسه. |
| `OPEN_EVM_WINDOW_TYPE_URL`، `CLOSE_EVM_WINDOW_TYPE_URL`، `MAX_EVM_WINDOW_BLOCKS`، `MAX_EVM_WINDOW_TXS`، `MAX_EVM_WINDOW_TARGETS` | ثوابت. |
| `@qorechain/evm/window` | مساعِدات النافذة دون اعتماد viem. |

لا توقّع `@qorechain/evm` معاملات المسار الأصلي ولا تبثّها؛ استخدم `@qorechain/sdk` أو SDK الخاصة باللغات لذلك.

### بناء نافذة وقراءتها في كل SDK (0.14.0) {#api-window}

| اللغة | فتح نافذة | قراءة نافذة |
|---|---|---|
| TypeScript | `openEvmWindowMsg` (`@qorechain/sdk`)؛ `openEvmWindowMessage` (`@qorechain/evm`) | `fetchEvmWindow`؛ `evmWindowStatus` (`@qorechain/evm`) |
| Python | `qorsdk.msg.pqc.open_evm_window` | `qorsdk.evm_window.get_evm_window` |
| Go | `messages.NewOpenEVMWindow` (و`NewOpenEVMWindowScoped` لـ `nativeOnly` أو `allowedTargets`) | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Rust | `qorechain::msg::pqc::open_evm_window` | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Java | `io.github.qorechain.evm.EvmWindow.open` | `EvmWindow.restPath` |

موافقة EIP-7702 (TypeScript، `@qorechain/sdk` 0.14.0): `authorizeEvmDelegationMsg` و`clearEvmDelegationMsg` و`classifyEvmDelegationRejection`.

تصدّر `@qorechain/react` 0.14.0 المكوّن `PqcStatusBadge` (التسميتان الافتراضيتان "PQC key registered" و"No PQC key") إلى جانب `QuantumSafeBadge` الأقدم.

### أعلام `create-qorechain-dapp` {#api-scaffolder}

| العلم | ما يفعله |
|---|---|
| `-t, --template <name>` | `evm-solidity` و`fullstack-web` و`rollup-app` و`foundry` و`hardhat` و`viem-wagmi` و`cosmwasm`. |
| `--network <name>` | الإعداد المسبق `testnet` أو `mainnet`. |
| `--package-manager <pm>` | `pnpm` أو `npm` أو `yarn`. |
| `-y, --yes` | تخطّي الأسئلة واستخدام القيم الافتراضية. |
| `--no-install` | عدم تثبيت الاعتماديات. |
| `--local` | إعادة كتابة اعتماديات `@qorechain/*` إلى روابط محلية في المستودع الأحادي لـ SDK (لمساهمي SDK؛ ولا حاجة إليه في الاستخدام العادي). |
| `-h, --help` / `-v, --version` | المساعدة والإصدار. |

### نصوص القوالب {#api-template-scripts}

| القالب | النص | ما يفعله |
|---|---|---|
| `foundry`، `hardhat` | `pnpm window status` | يعرض الحساب، وهل مفتاح ML-DSA-87 الخاص به مسجَّل (وهل هو هذا المفتاح)، ونافذته. |
| `foundry`، `hardhat` | `pnpm window register` | يسجّل مفتاح ML-DSA-87 للحساب، مرة واحدة لكل حساب. |
| `foundry`، `hardhat` | `pnpm window open` | يفتح نافذة (افتراضيًا 600 كتلة و5 معاملات). |
| `foundry`، `hardhat` | `pnpm window recovery-code` | يطبع رمز استرداد جديدًا (0.13.0). احفظه بعيدًا عن `PRIVATE_KEY` وضعه في `QORE_PQC_RECOVERY_CODE`. |
| `foundry` | `pnpm deploy:testnet` | `forge script script/Counter.s.sol --rpc-url qorechain_testnet --broadcast`. |
| `hardhat` | `pnpm build`، `pnpm test`، `pnpm deploy:testnet` | بناء Hardhat والاختبارات ونشر Ignition إلى `qorechainTestnet`. انتظر نحو 10 ثوانٍ بعد `pnpm window open` قبل أول معاملة. |
| `viem-wagmi` | `pnpm dev`، `pnpm build` | خادم تطوير على `http://localhost:5173` (وREST عبر وكيل `/lcd`)؛ وبناء للإنتاج. |
| `cosmwasm` | `pnpm build:wasm`، `pnpm propose-store`، `pnpm instantiate`، `pnpm query` | بناء محسَّن، ومقترح رفع عبر الحوكمة، وإنشاء نسخة (شبكة الاختبار)، واستعلامات REST. |

متغيرات البيئة للقوالب (في `.env`، لا تُرفع أبدًا): `PRIVATE_KEY` و`QORE_MNEMONIC` و`QORE_PQC_RECOVERY_CODE` (مع `PRIVATE_KEY`؛ ويطبع `pnpm window recovery-code` رمزًا جديدًا، فاحفظه بعيدًا عن المفتاح) و`QORE_NETWORK` (`testnet` أو `mainnet`) و`QORE_WINDOW_BLOCKS` و`QORE_WINDOW_TXS` و`QORE_WINDOW_MAX_UQOR` و`COUNTER_INITIAL`؛ و`QORE_CODE_ID` و`QORE_I_KNOW_THIS_IS_MAINNET=yes` لنصوص CosmWasm (نص المقترح يرفض الشبكة الرئيسية بدونه)؛ و`VITE_WALLETCONNECT_PROJECT_ID` لمحفظة WalletConnect في `viem-wagmi`.

## طريقة الوصول {#how-to-access}

| | شبكة الاختبار | الشبكة الرئيسية |
|---|---|---|
| معرّف السلسلة الأصلي | `qorechain-diana` | `qorechain-vladi` |
| معرّف سلسلة EVM (`eth_chainId`) | 9800 (`0x2648`) | 9801 (`0x2649`) |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` | غير منشور |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| RPC الإجماع | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| المستكشف | `https://explore.qore.network` | `https://explore.qore.network` |

- **القراءات** لا تحتاج إلى شيء: لا حساب ولا مفتاح ولا نافذة.
- **الإرسال على مسار EVM** يحتاج إلى حساب ممول ومفتاح ML-DSA-87 الخاص به مسجَّل على السلسلة (مرة واحدة) ونافذة مفتوحة. وتسجيل المفتاح والنافذة كلاهما معاملتان على المسار الأصلي.
- **التكلفة.** الحد الأدنى للرسوم 0.1 uqor للغاز الواحد على الشبكتين. والقراءة مجانية. ويأتي QOR الخاص بشبكة الاختبار من [الصنبور](/dashboard/faucet).
- **CosmWasm.** لا رفع للشيفرة دون حوكمة على أي من الشبكتين؛ ولا إنشاء نسخ على الشبكة الرئيسية دون حوكمة. لم تكن على الشبكة الرئيسية أي شيفرة مخزَّنة في 27 أكتوبر 2026 وفي 4 نوفمبر 2026.
- **إصدارات Node والأدوات.** راجع جدول التثبيت أعلاه.

## أين يُنشر {#where-published}

الإصدارات مقروءة مباشرة من السجلات في 12 نوفمبر 2026 (باستثناء Maven Central، راجع صفّه). الوسم `v0.12.0` على GitHub موجود. وللحزم الخمس على npm إصدار 0.11.0 أيضًا (29 أكتوبر 2026) حمل محتوى الحزمة نفسه؛ أما حِزم SDK لـ Python وRust وGo وJava فانتقلت من 0.10.0 مباشرة إلى 0.12.0، وكل اللغات ما عدا Java على 0.14.0 الآن (وJava على 0.13.0 في Maven Central).

| السجل | الحزمة | الإصدار | الرابط |
|---|---|---|---|
| npm | `@qorechain/evm` | 0.14.0 | https://www.npmjs.com/package/@qorechain/evm |
| npm | `@qorechain/sdk` | 0.14.0 | https://www.npmjs.com/package/@qorechain/sdk |
| npm | `@qorechain/react` | 0.14.0 | https://www.npmjs.com/package/@qorechain/react |
| npm | `@qorechain/svm` | 0.14.0 | https://www.npmjs.com/package/@qorechain/svm |
| npm | `create-qorechain-dapp` | 0.14.0 (سبعة قوالب) | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `@qorechain/qorex-rainbowkit` (تستخدمه `viem-wagmi`) | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| PyPI | `qorechain-sdk` | 0.14.0 | https://pypi.org/project/qorechain-sdk/ |
| crates.io | `qorechain-sdk` | 0.14.0 | https://crates.io/crates/qorechain-sdk |
| Go proxy | `github.com/qorechain/qorechain-sdk/packages/go` | v0.14.0 | https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.13.0 في 12 نوفمبر 2026؛ 0.14.0 ليس هناك بعد | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk |

المصدر: [github.com/qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk)، الوسم `v0.14.0`؛ والمسارات `packages/evm` و`cli/` و`templates/` و`docs/docs/guides/` و`contrib/`. ترخيص Apache-2.0، تشرف عليه جمعية QoreChain.

## الحدود والمشكلات المعروفة {#limits}

- **0.11.0 على npm حل محله غيره.** استخدم 0.14.0؛ فإصدار 0.11.0 موجود على npm وحدها، وتعتمد القوالب في 0.14.0 على `^0.14.0`.
- **`@qorechain/evm` تقرأ النافذة وتركّب الرسالة؛ ولا توقّع ولا تبثّ** معاملات المسار الأصلي.
- **لا يوجد مساعِد يفتح نافذة تلقائيًا قبل الإرسال**، بحكم التصميم.
- **محفظة QoreX في القالب `viem-wagmi`** تجيب على `eth_chainId` و`eth_accounts` و`eth_requestAccounts` و`wallet_switchEthereumChain`؛ أما طرائق التوقيع الخاصة بـ EVM فيها فغير متاحة بعد. استخدمها للاتصال والقراءة، ووقّع بمحفظة EIP-1193 محقونة.
- **مساعِد `pnpm window` في القوالب يشتق مفتاح ML-DSA-87 من `QORE_MNEMONIC`، أو من `QORE_PQC_RECOVERY_CODE` عند استخدام `PRIVATE_KEY`** (ومع `PRIVATE_KEY` دون رمز يتوقف برسالة). إذا كان مفتاح الحساب قد سُجّل بمحفظة أخرى، فافتح النافذة من تلك المحفظة بدلًا من ذلك.
- **غير متاح على نقاط النهاية العامة:** معاملات blob والتتبّع ومساحات الأسماء `debug` و`personal` و`admin` و`miner`.
- **رفع CosmWasm يمرّ عبر الحوكمة على الشبكتين**؛ والقالب `cosmwasm` لا يستطيع تخزين الشيفرة بنفسه.
- **المساهمات في الأدوات الأخرى** (viem وSourcify وScaffold-ETH 2) هي ملفات مُعدَّة في المستودع، وليست مدمجة في المشاريع الأصلية.
- **EVM precompiles على الشبكة الرئيسية:** لا يوجد أي منها مفعّل. أما `pqcVerify` (`0x0A01`) و`pqcKeyStatus` (`0x0A02`) فمفعّلان على شبكة الاختبار فقط.
- **حالة الشبكة مؤرَّخة.** قُرئت أرقام الرسوم في 27 أكتوبر 2026 وفُحصت مرة أخرى في 4 نوفمبر 2026؛ وقُرئت أزمنة الكتل في 27 أكتوبر 2026.

## ملاحظات أمنية {#security}

- تصميم النافذة يعني أن مفتاح secp256k1 الذي تحتفظ به مكتبة EVM لا يستطيع أبدًا تفويض الإنفاق وحده: فتح النافذة يحتاج إلى توقيع هجين بمفتاح ML-DSA-87 للحساب. أبقِ النوافذ صغيرة (`blocks` و`maxTxs` و`maxValue`) واستخدم `nativeOnly` أو `allowedTargets` حيثما أمكن.
- تتضمن `maxValue` الحد الأقصى لرسوم كل معاملة؛ حدّد حجمها بـ `evmWindowCost` لا بالقيمة وحدها.
- تقرأ القوالب المفاتيح من `.env`، المستثنى من git؛ ويحتوي `.env.example` على قيم نائبة. ويستطيع مستخدمو Hardhat حفظ المفتاح مشفّرًا بـ `npx hardhat keystore set PRIVATE_KEY`.
- لا تموّل أبدًا عبارة BIP-39 التجريبية العامة (`abandon` مكرَّرة 11 مرة، ثم `about`).
- في مقترح CosmWasm على الشبكة الرئيسية، انشر الشيفرة المصدرية وبناءً قابلًا لإعادة الإنتاج (يطبع المحسِّن المجموع الاختباري) كي يتحقق المصوّتون من الملف الثنائي.
- أبلغ عن الثغرات بسرية على security@qore.network.

## صفحات ذات صلة {#related}

- [نظرة عامة على حزم المطورين](/developer-tools/overview) و[أدوات التوليد وCLI](/developer-tools/scaffolders-and-cli) (الأداة `create-qorechain-dapp` 0.14.0)
- [نظرة عامة على SDK](/sdk/overview) و[تثبيت SDK](/sdk/install) و[دليل EVM](/sdk/guides/evm) (النافذة والنوافذ المحدّدة النطاق وموافقة EIP-7702 والـ precompiles)
- [تطوير EVM](/developer-guide/evm-development) و[EVM Precompiles](/developer-guide/evm-precompiles#network-status)
- [تطوير QoreChain Native](/developer-guide/cosmwasm-development) (CosmWasm ومقترحات الحوكمة)
- [تكاملات QoreX](/developer-tools/qorex-integrations) (`@qorechain/qorex-rainbowkit`)
- [QoreSign](/qoresign/overview) (التوقيع الهجين على المسار الأصلي)
- [QoreScan](/developer-tools/qorescan) (جرد استخدام `ecrecover` وPQC precompile في مصادر Solidity)
