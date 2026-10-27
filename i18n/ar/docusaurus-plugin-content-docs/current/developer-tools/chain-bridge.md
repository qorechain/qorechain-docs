---
slug: /developer-tools/chain-bridge
title: Chain Bridge والـ Handles
sidebar_label: Chain bridge والـ handles
sidebar_position: 3
---

# Chain bridge والـ handles

تغطي هذه الصفحة حزمتين صغيرتين للجهة الخادمة.

**`@qorechain/chain-bridge`** (0.2.3) مكتبة Node.js للخوادم الخلفية التي تعمل على QoreChain دون شخص أمام لوحة المفاتيح: ترسل QOR، وتسجّل مفتاح ML-DSA-87 للحساب، وتسجّل العقد الخفيفة، وتنشر العقود، ولحامل مفتاح سلطة الترخيص في السلسلة تمنح التراخيص وتسحبها. وهي تتولى أمرين لا يستطيع خادم خلفي عادي فعلهما وحده: توقيع ML-DSA-87 الهجين الذي تحتاجه معاملات مسار Native، والترميز الدقيق بـ protobuf لرسائل QoreChain المخصصة. وهي موجّهة لعمال المحافظ الساخنة وخوادم الدفع ولوحات التحكم الخلفية والخدمات المشابهة.

**`@qorechain/handles`** (0.1.0) تحلّ `@handle` الخاص بـ QoreX إلى عنوان وتتحقق من الجواب تشفيرياً قبل إعادته. وهي موجّهة للمحافظ والخدمات التي تتيح للشخص كتابة `@alice` بدلاً من عنوان `qor1...`.

لا تذكر أي من الحزمتين مستودع مصدر في بيانات السجل الوصفية. يمكنك قراءة الشيفرة المنشورة على npm.

## الابتكارات {#innovations}

### Chain bridge {#innovations-chain-bridge}

- **عبارة استرجاع واحدة، مفتاح ML-DSA-87 قانوني واحد.** يُشتق المفتاح بوصفه `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` ثم توليد مفاتيح ML-DSA-87، وهو الاشتقاق نفسه في [محوّل المحفظة](/developer-tools/wallet-adapter) وSDK وQoreX، فيمكن استرداد المفتاح بالأمر `qorechaind tx pqc recover-key`. الحسابات التي سجّلتها أدوات أقدم بالاشتقاق `SHAKE-256(mnemonic)` تحتفظ بمفتاحها القديم: عندما يُرفض توقيع قانوني بفشل تحقق، تعيد الجسر المحاولة مرة واحدة بالمفتاح القديم.
- **صيغة sign-bytes تُقرأ من السلسلة.** عند ضبط `cosmosRest` تسأل الجسر العقدةَ عن خطط الترقية المطبَّقة (`v3.2.0` و`v3.1.98`) وتوقّع بالصيغة v2 عندما يكون أحدهما مطبَّقاً، كما هو موصوف في [صفحة محوّل المحفظة](/developer-tools/wallet-adapter#innovations). وإذا رفضت السلسلة بالرمز 21 من `pqc` فإنها تعيد الحل مرة واحدة وتوقّع من جديد. على الشبكات الحية يكون `cosmosRest` مطلوباً؛ وبدونه يُطلق الاستدعاء الهجين خطأً بدلاً من التخمين.
- **تسجّل المفتاح عند أول استخدام، لكنها تفحص السلسلة أولاً.** عندما تُرفض معاملة هجينة بسبب غياب مفتاح PQC، ترسل الجسر `MsgRegisterPQCKeyV2` (معاملة كلاسيكية، تسمح بها السلسلة للتسجيل الأول) وتعيد المحاولة. ولأن هذه الرسالة تُحتسب رسومها حتى لو رُفضت، فإنها تقرأ أولاً `GET /qorechain/pqc/v1/account/{address}`: إذا كان الحساب يحمل مفتاحاً ليس هو المفتاح القانوني ولا القديم لعبارة الاسترجاع لديك، فإنها تُطلق `pqc_key_mismatch` ولا ترسل شيئاً. ومع `cosmosRest` يحمل التسجيل أيضاً إثبات الحيازة متى طبّقت الشبكة v3.2.3 (طبّقتها الشبكتان الرئيسية وشبكة الاختبار).
- **معرّفات ميزات الترخيص من أسماء بسيطة.** تحوّل `featureIdsFor({ type, chains })` وصف المنتج إلى معرّفات ميزات السلسلة (`validator_operator` مع `validator_<chain>`، و`lightnode_operator`، و`qcb_bridge` مع `bridge_<chain>`)، وتطبّع أسماء السلاسل الحرة مثل "Solana" أو "BNB Chain"، وتُسقط السلسلة المجهولة بدلاً من بناء معرّف سترفضه السلسلة. فُحصت في 27 أكتوبر 2026: أعاد `featureIdsFor({ type: "validator", chains: ["Solana", "Ethereum", "Foo"] })` القيم `validator_operator` و`validator_solana` و`validator_ethereum` وأسقط `Foo`.
- **JavaScript خالصة، دون إضافات أصلية.** وحدة ES لـ Node.js 18 أو أحدث، لذا تعمل في عمال serverless. وإلى جانب نقطة الدخول الرئيسية تصدّر `@qorechain/chain-bridge/proto` (مرمِّزات الأسلاك) و`@qorechain/chain-bridge/features` (تحويل الميزات).

### Handles {#innovations-handles}

- **يُفحص الحل مرتين قبل إعادته.** يجب أن يحمل السجل توقيع ed25519 الخاص بالسجل المركزي (registry)، يُتحقق منه مقابل مفتاح عام للسجل تثبّته في العميل، وتوقيع secp256k1 الخاص بالمالك على الدعوى (claim)، الذي يجب أن يُجزَّأ مفتاحه العام إلى عنوان `qor1` الوارد في السجل. السجل الذي يفشل في أي من الفحصين لا يُعاد أبداً.
- **مخزن التثبيت (pin) لك.** تعيد `resolve` القيمة `pin.status` بوصفها `new` أو `match` أو `CHANGED` بمقارنة السجل بتثبيت تحتفظ به، ولا تثبّت من تلقاء نفسها أبداً. تثبّت بعد أن يرى المستخدم العنوان ويتابع. والغاية من التثبيت ملاحظة أن السجل المركزي بدأ يقول شيئاً مختلفاً، لذا يجب أن يحتفظ به طرف غير الطرف الذي يجري فحصه، مثلاً على جهاز المستخدم.
- **لا تُعاد لشبكة ما إلا العناوين الموقَّعة من المالك.** تعيد `addressForNetwork(record, caip2)` عنوان `qor1` لشبكات QoreChain، وعنوان `0x` لمعرّفي السلسلة 9800 و9801 عندما يكون السجل حساباً موحّداً. أما العناوين على سلاسل أخرى التي يكتفي السجل المركزي بالإقرار بها فلا تُعاد للإرسال.
- **بحث عكسي للعرض فقط.** تعيد `reverse(address)` معرّفاً (handle) للعرض في السجل التاريخي. ويجب ألا تصبح نتيجتها وجهة لعملية إرسال أبداً.
- **تستخدم الدعوى والحذف نطاقي توقيع منفصلين.** توقّع `signClaim` و`signDelete` رسالتين مختلفتين، فلا يمكن إعادة استخدام توقيع حذف بوصفه دعوى.

## طريقة الاستخدام {#how-to-use}

### Chain bridge {#use-chain-bridge}

```bash
npm install @qorechain/chain-bridge
```

تسحب معها `@qorechain/wallet-adapter` (^0.4.0) و`@qorechain/pqc` (^0.2.1) وcosmjs 0.32 وethers 6. ليس لها بدء سريع مُختبَر؛ والمقتطف أدناه يتبع تعريفات الحزمة و[دليل تكامل البورصات](/developer-guide/exchange-integration#chain-bridge). في 27 أكتوبر 2026 فُحصت دالة البناء و`featureIdsFor` وقائمة الدوال مقابل الحزمة المنشورة 0.2.3؛ ولم تُرسل أي معاملة.

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc-testnet.qore.host",
  cosmosRest: "https://api-testnet.qore.host", // picks the sign-bytes form; required on both live networks
  chainId: "qorechain-diana",
  signerMnemonic: process.env.WORKER_MNEMONIC, // from your secrets manager, never in source code
});

// Once per account (the bridge also does it on first use if the chain reports no key).
await bridge.registerPqc({ mnemonic: process.env.WORKER_MNEMONIC });

// Amounts are in uqor (6 decimals): 1 QOR = 1000000.
const { txHash, code } = await bridge.sendTokens({ to: "qor1...", amountUqor: "1000000" });
```

الدوال الرئيسية:

| الدالة | ماذا تفعل | المفتاح المستخدم |
|---|---|---|
| `sendTokens({ to, amountUqor })` | `MsgSend` الخاصة بـ bank، بتوقيع هجين | الموقِّع |
| `registerPqc({ mnemonic })` | `MsgRegisterPQCKeyV2`، كلاسيكية | ذلك الحساب |
| `registerLightNode({ operatorMnemonic, nodeType, version, capabilities })` | تسجيل عقدة خفيفة، بتوقيع هجين | المشغّل |
| `grantLicense` و`grantLicenseSet` و`revokeLicense` و`suspendLicense` و`resumeLicense` | رسائل وحدة التراخيص | مفتاح سلطة الترخيص في السلسلة |
| `deployEvm({ bytecode, abi, args })` | نشر بأسلوب Ethereum عبر `eth_sendRawTransaction` | مفتاح الناشر |
| `deploySvm({ bytecode })` | نشر برنامج SVM | الموقِّع |
| `createVestingAccount` و`createPeriodicVestingAccount` | إنشاء حساب استحقاق (vesting) | الموقِّع |
| `featureIdsFor` و`normalizeChain` | مساعدات محلية | لا شيء |

يعيد كل استدعاء `{ txHash, code, height, gasUsed }`، ويُبلغ الاستدعاء الهجين أيضاً بـ `signBytesVersion`. سعر الغاز الافتراضي 0.1 uqor لكل وحدة غاز، وهو الحد الأدنى للشبكة (تكلّف `sendTokens` بـ 300,000 وحدة غاز 30,000 uqor بهذا السعر، ويكلّف الافتراضي لتسجيل المفتاح، 6,000,000 وحدة غاز، 600,000 uqor تدفعها مرة واحدة لكل حساب). يستخدم مسار EVM 18 خانة عشرية: فقيمة `value` في `deployEvm` تكون بوحدة wei. اضبط `keyType: "eth_secp256k1"` في الإعدادات للتوقيع بالمفتاح الأصلي الموحّد لـ eth (هوية واحدة بصيغ `qor1` و`0x` وSVM) بدلاً من المفتاح الافتراضي ذي نوع العملة 118؛ وهذا الخيار موجود في المصدر وفي README محوّل المحفظة لكنه غير موجود في التعريفات.

### Handles {#handles}

```bash
npm install @qorechain/handles
```

اعتمادياتها الوحيدة وقت التشغيل هي `@noble/curves` و`@noble/hashes` و`bech32`. ليس لها بدء سريع مُختبَر. المقتطف يتبع README الحزمة وتعريفاتها؛ وفي 27 أكتوبر 2026 فُحصت `isHandleInput` و`normalizeHandle` وقائمة التصديرات على الحزمة المنشورة 0.1.0، ولم يُتصل بأي سجل مركزي.

```ts
import { HandleClient, type PinStore } from "@qorechain/handles";

const client = new HandleClient({ baseUrl: registryUrl, registryPubkeyHex });

// You supply the pin store, ideally on the user's device.
const pins: PinStore = { get: (handle) => load(handle), put: (pin) => save(pin) };

const { record, pin } = await client.resolve("@alice", pins);

if (pin.status === "CHANGED") {
  // Stop. Show both addresses in full and require explicit confirmation.
  // Never update the pin silently.
}

// Show record.qorAddress to the user. When they proceed (and only then):
await client.pin(record, pins, Date.now());
```

تُطلق `resolve` خطأً عندما يكون المعرّف (handle) مجهولاً أو يتعذّر الوصول إلى السجل المركزي أو يفشل الجواب في التحقق. وتميّز `isHandleInput(text)` المعرّف من العنوان (المعرّف من 3 إلى 20 حرفاً من `a-z` و`0-9` و`_`، أو يبدأ بـ `@`؛ وسلسلة `qor1...` أو `0x...` ليست معرّفاً أبداً). تصديرات أخرى: `claimSignBytes` و`signClaim` و`deleteSignBytes` و`signDelete` و`verifyResolution` و`checkPin` و`QorexError`. لمعرفة كيف يستخدم QoreX المعرّفات، راجع [الإرسال إلى @handle](/qorex/browser-extension#handle-send) و[الحساب ولوحة التحكم](/qorex/account-and-dashboard).

## طريقة الوصول {#how-to-access}

- **الشبكات:** تعمل chain bridge على الشبكة الرئيسية `qorechain-vladi` أو شبكة الاختبار `qorechain-diana` بنقاط النهاية المدرجة في صفحة [حزم المطورين](/developer-tools/overview#how-to-access) (RPC الخاص بـ EVM ومعرّف السلسلة 9800 أو 9801 لـ `deployEvm`).
- **متطلبات chain bridge المسبقة:** Node.js 18 أو أحدث؛ وحساب ممول يحتفظ عاملك بعبارة استرجاعه (احفظها في مدير أسرار)؛ وعنوان REST للشبكة. يُشتق مفتاح ML-DSA-87 من عبارة الاسترجاع ويُسجَّل عند أول استخدام، لذا يجب أن يحتوي الحساب على QOR يكفي لرسوم ذلك التسجيل.
- **استدعاءات الترخيص** تنجح فقط عند توقيعها بالمفتاح الذي ضُبطت به السلسلة سلطةً للترخيص. لا يملكه مطور خارجي، فهذه الدوال لمشغّل ذلك المفتاح. وللتراخيص وتسجيل العقدة الخفيفة بوصفك مستخدماً، راجع [التسجيل والترخيص](/light-node/registration-and-licensing).
- **متطلبات handles المسبقة:** العنوان الأساسي للسجل المركزي ومفتاحه العام ed25519 (بصيغة hex)، ومخزن تثبيت تنفّذه، و`fetch`. القراءات لا تحتاج حساباً.
- **التكلفة:** الحزمتان مجانيتان. وتدفع معاملات chain bridge رسوم الشبكة.

## أين تُنشر {#where-published}

| السجل | الحزمة | الإصدار | الرابط |
|---|---|---|---|
| npm | `@qorechain/chain-bridge` | 0.2.3 (نُشر في 20 أكتوبر 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/chain-bridge) |
| npm | `@qorechain/handles` | 0.1.0 (نُشر في أغسطس 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/handles) |

كلتاهما بترخيص Apache-2.0 وتُنشران على npm فقط (لا PyPI ولا crates.io ولا Maven Central ولا وكيل Go). لا تذكر أي منهما مستودع مصدر في بيانات السجل الوصفية، فلا توجد صفحة مصدر عامة لإيراد رابطها؛ والشيفرة موجودة في الأرشيف المنشور. لقراءة الإصدارات الحية، راجع [كيف تحصل على الإصدارات الحية](/developer-tools/overview#live-versions).

## الحدود والمشكلات المعروفة {#limits}

### Chain bridge {#limits-chain-bridge}

- **عمليات نشر EVM تحتاج إلى نافذة مفتوحة.** ترسل `deployEvm` معاملة Ethereum قياسية. منذ السلسلة v3.2.0 لا يقبل مسار EVM معاملة إلا من حساب لديه مفتاح ML-DSA-87 مسجَّل ونافذة تفويض EVM مفتوحة، وليس في الجسر دالة تفتح نافذة. افتح النافذة بأدوات أخرى ([محوّل المحفظة](/developer-tools/wallet-adapter#evm-window) أو SDK أو QoreX) قبل أن تستدعيها، وإلا تُرفض المعاملة (مساحة الأسماء `pqc`، الرمز 26 أو 27 أو 28). هذا يتبع قواعد السلسلة وشيفرة الحزمة؛ ولم يُجرَّب على شبكة حية لأجل هذه الصفحة. ما زال README الحزمة يصف مسار EVM بأنه مُعفى، وهذا قديم.
- **`deploySvm`** تستهدف مسار SVM، الذي لا يقبل معاملات بعد على أي من الشبكتين.
- **دوال رفع العقود موجودة لكنها غير موثقة.** يتضمن المصدر أيضاً `storeWasm` و`instantiateWasm` و`deployWasm` لعقود QoreChain Native، وهي ليست في التعريفات ولا في README. الرفع على الشبكات الحية خاضع للحوكمة فقط للحسابات العادية، فتوقّع رفضاً لحساب عادي.
- **يُشتق المفتاح على الخادم.** تبقى عبارة الاسترجاع في عمليتك. أبقِها بعيداً عن السجلات والتحكم في الإصدارات، ولا تعيد استخدامها محفظةً شخصية.
- **التسجيل ليس مجانياً.** تسجّل الجسر المفتاح بنفسها عند أول استخدام؛ وعلى المسار الذي ينقل الأموال أن يسجّل مسبقاً وأن يتأكد من النتيجة عبر `GET /qorechain/pqc/v1/account/{address}` قبل أول عملية سحب.
- **cosmjs 0.32.** لا تثبّتها بجانب SDK (cosmjs 0.39) في مشروع واحد؛ إذ يبلّغ npm عن `ERESOLVE`.
- **أجزاء قديمة في README.** يقول README إن الشبكة الرئيسية تبقى على صيغة sign-bytes الأولى؛ أما الشبكتان فتتحققان من v2 (راجع [الأمان ما بعد الكمّي](/architecture/post-quantum-security)).
- **لا بدء سريع مُختبَر ولا مستودع مصدر عام.**

### Handles {#limits-handles}

- **عنوان السجل المركزي ومفتاحه العام غير منشورين** في الحزمة ولا في هذا الدليل. أما QoreX ولوحة التحكم فلديهما القيمتان مضمّنتين، فلا يستطيع المُدمِج استخدام الحزمة إلا إذا أُعطي هاتين القيمتين.
- **المعرّفات ليست أسماء على السلسلة.** السجل المركزي خدمة خارج السلسلة تُدار لأجل QoreX؛ والحزمة تتحقق من أجوبتها لكنها لا تستطيع ضمان توفرها. إذا تعذّر الوصول إلى السجل المركزي، تُطلق `resolve` خطأ `NETWORK_UNAVAILABLE`، و`isReachable()` فحص سريع تستطيع الواجهة استخدامه لإخفاء ميزات المعرّفات.
- **لا تثبّت لك شيئاً.** إذا لم تستدعِ `pin` أبداً، فكل حل سيُبلغ بالحالة `new`. والمستدعي مسؤول عن تخزين التثبيتات بأمان.
- **لا تُستخدم للإرسال إلا العناوين الموقَّعة من المالك.** لا تعيد `addressForNetwork` العناوين على سلاسل أخرى التي يقرّ بها السجل المركزي.
- **استدعاءات الكتابة تحتاج إلى أكثر من الحزمة.** تتحدث `claim` و`deleteHandle` و`bySub` مع نقاط الكتابة في السجل المركزي وتحتاج إلى توقيع المالك (`signClaim` و`signDelete`) أو رمز حساب؛ وهي مخصصة لتطبيقات المحافظ.
- **لا بدء سريع مُختبَر ولا مستودع مصدر عام.**
