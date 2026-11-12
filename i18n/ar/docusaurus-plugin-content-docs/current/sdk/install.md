---
slug: /sdk/install
title: التثبيت
sidebar_label: التثبيت
sidebar_position: 2
---

# التثبيت

ثبّت حزمة SDK الخاصة بلغتك. إن النواة المكتوبة بلغة TypeScript‏ (`@qorechain/sdk`)،
ومحوّلا EVM وSVM‏ (`@qorechain/evm` و`@qorechain/svm`)، وعدّة React‏
(`@qorechain/react`)، وعملاء Python وGo وRust وJava جميعها
**منشورة** في سجلّاتها مع تكافؤ كامل مع السلسلة الأصلية (رسائل منمّطة الأنواع،
والاستعلامات، ودورة حياة المعاملة، ومعاملات PQC الهجينة، واشتراكات
WebSocket). الإصدار الحالي هو **0.13.0**، ونُشر في 11 نوفمبر 2026
(جرى التحقق منه مقابل السجلات في 11 نوفمبر 2026؛ وJava هي الاستثناء، انظر
الجدول):

| السجل | الحزمة | الإصدار |
| --- | --- | --- |
| npm | `@qorechain/sdk` و`@qorechain/react` و`@qorechain/evm` و`@qorechain/svm` و`create-qorechain-dapp` | 0.13.0 |
| PyPI | `qorechain-sdk` (الاستيراد `qorsdk`) | 0.13.0 |
| crates.io | `qorechain-sdk` (الاستيراد `qorechain`) | 0.13.0 |
| وكيل وحدات Go | `github.com/qorechain/qorechain-sdk/packages/go` | v0.13.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | منشورة (Maven Central، الإصدار 0.13.0؛ JDK 17 أو أحدث؛ جرى التحقق في 11 نوفمبر 2026) |

لا يوجد 0.11.0 لـ Python أو Rust أو Go أو Java: فقد كان لحزم npm إصدار 0.11.0 في
29 أكتوبر 2026 (مجموعة أدوات مطوري السلسلة، انظر أدناه) وانتقلت كل لغة
من 0.10.0 إلى 0.12.0 معًا. وتبعه 0.13.0 في 11 نوفمبر 2026 في كل لغة.

اختر لغتك أدناه.

## ملاحظات الترقية {#upgrade}

:::danger استخدم SDK 0.8.1 أو أحدث على الشبكات الحيّة
تتحقّق الشبكتان العامتان من صيغة **sign-bytes الهجينة v2** (الموسومة بالنطاق
والمرتبطة بمعرّف السلسلة) وترفضان الصيغة القديمة بالرمز `pqc` رقم 21.
كل إصدار من الـ SDK قبل **0.8.0** يوقّع الصيغة القديمة، أمّا **0.8.0** فتبحث عن
التحوّل تحت اسم واحد فقط من اسمَي الترقية اللذين استخدمتهما الشبكتان (سجّلته
الشبكة الرئيسية باسم `v3.2.0`، والشبكة التجريبية باسم `v3.1.98` ثم لاحقًا `v3.2.0`)،
ولذلك توقّع الصيغة الخاطئة على الشبكة الرئيسية. استخدم **0.13.0** (أو **0.8.1** على
الأقل) في كل لغة؛ ويلزم **0.8.2 أو أحدث** لفتح
[نافذة تفويض EVM](/sdk/guides/evm#evm-window). تقبل البُناة الهجينة خيار
`signBytesVersion` (`"auto"` | `"v1"` | `"v2"`)؛ و`"auto"` يسأل الشبكة
ولذلك يحتاج إلى نقطة نهاية REST (`rest`) على
`qorechain-vladi` / `qorechain-diana`: فهو يرمي خطأً بدلًا من التخمين. انظر
[أي صيغة لبايتات التوقيع؟](/sdk/concepts/accounts-pqc#sign-bytes-versions).
لم تتغير الصيغة في إصدار السلسلة v3.2.3 ولا v3.2.4 (يعمل v3.2.4 على الشبكة التجريبية منذ 19 أكتوبر 2026 وعلى الشبكة الرئيسية منذ 23 أكتوبر 2026؛ ولم يغيّر v3.2.5 ولا v3.2.6 شيئًا هنا؛ وتعمل الشبكة الرئيسية بالإصدار v3.2.6 منذ 4 نوفمبر 2026):
فـ `"auto"` يحلّ إلى v2 على الشبكتين، لأن كلتيهما طبّقت الترقية التي انتقلت إلى هذه الصيغة.
:::

## ما الذي يغيّره الإصدار 0.13.0 {#whats-new-0130}

الإصدار SDK 0.13.0 (11 نوفمبر 2026) إصدار واحد لكل اللغات: TypeScript وPython
وGo وRust وJava، مع `@qorechain/react` و`@qorechain/evm` و`@qorechain/svm` و
`create-qorechain-dapp`. وفيه تغيير كاسر واحد في مساعد الحساب على مسار البذرة.
الحسابات المشتقة من عبارة ذاكرية دون تغيير، وكذلك صيغة التوقيع الهجين وسلوك
السلسلة: تبقى المعاملة المبنية بـ 0.12.0 صالحة.
(Java منشورة على Maven Central بالإصدار 0.13.0؛ جرى التحقق في 11 نوفمبر 2026.)

**تغيير كاسر.** مساعدات مسار البذرة `unifiedAccountFromSeed` (TypeScript)، و
`unified_account_from_seed` (Python وRust)، و`unified.UnifiedAccountFromSeed` (Go)، و
`UnifiedAccounts.unifiedAccountFromSeed` (Java) تحتاج الآن إلى واحد بالضبط من
مدخلين: رمز استرداد `QRC1`، أو سر PQC مستقل من 32 بايتًا. ويُشتق مفتاح ML-DSA-87 من
هذا السر الثاني. وإذا استُدعي المساعد دون خيار، أو مع أكثر من واحد، أطلق خطأ.

الخيار `legacySeedDerivation` (في Python `legacy_seed_derivation=True`، وفي Go
`LegacySeedDerivation`، وفي Rust `SeedPqcOptions::legacy_seed_derivation()`، وفي Java
`SeedPqcOptions.legacy()`) اختياري صريح. استخدمه فقط لاسترداد مفتاح PQC لحساب
أُنشئ قبل 0.13.0 كي تدوّره بـ `MsgRotatePQCKey`؛ وهو ليس للحسابات الجديدة.

| المجال | في 0.13.0 |
| --- | --- |
| مساعدات مسار البذرة | تحتاج رمز استرداد `QRC1` أو سر PQC مستقلًا من 32 بايتًا (واحدًا بالضبط)؛ ودون خيار، أو مع أكثر من واحد، يُطلق خطأ. الحسابات المشتقة من عبارة ذاكرية دون تغيير |
| `legacySeedDerivation` | اختياري صريح، فقط لاسترداد مفتاح PQC لحساب أُنشئ قبل 0.13.0 كي يمكن تدويره بـ `MsgRotatePQCKey` |
| رموز الاسترداد `QRC1` | أُضيفت في كل لغة: `generatePqcRecoveryCode` و`isValidRecoveryCode` و`normalizeRecoveryCode` و`pqcKeyFromRecoveryCode` و`pqcRecoveryCodeFromSecret` (بصيغة snake_case في Python وRust؛ وفي Go `GeneratePQCRecoveryCode` و`IsValidRecoveryCode` و`PQCKeyFromRecoveryCode` و`PQCRecoveryCodeFromSecret`) |
| `migrateToHybrid` | تُبلغ عن `keyVerified` |
| القوالب | يطبع `pnpm window recovery-code` رمزًا جديدًا. ومع `PRIVATE_KEY` يقرأ `pnpm window` المتغير `QORE_PQC_RECOVERY_CODE` ويتوقف برسالة إن كان مفقودًا؛ ومع `QORE_MNEMONIC` لا يتغير شيء. تعتمد قوالب Foundry وHardhat على `^0.13.0` |
| إصدار بايتات التوقيع `"auto"` | يقرأ أولًا ميزة البروتوكول `pqc-sign-bytes-v2` من `/qorechain/pqc/v1/protocol_features`، ولا يعود إلى خطط الترقية المطبّقة إلا إذا فشلت هذه القراءة |
| `getPqcStatus` / `get_pqc_status` | تُطلق خطأ عندما تخلو إجابة العقدة من علم التسجيل، بدل الإبلاغ بـ "غير مسجّل" |
| Python | يحلّل رموز نتيجة المعاملة وحقلي `found` و`live` في نافذة EVM بصرامة؛ وتعدّ `wait_for_tx` الإجابة الخالية من `tx_response` أو `txhash` معلّقة بعد |

**خيارات مسار البذرة في كل لغة**. مرّر واحدًا بالضبط من الثلاثة:

| اللغة | الاستدعاء | رمز الاسترداد | سر مستقل من 32 بايتًا | المفتاح الأقدم، للاسترداد فقط |
| --- | --- | --- | --- | --- |
| TypeScript | `unifiedAccountFromSeed(seed32, opts)` | `{ recoveryCode }` (سلسلة `"QRC1-..."`) | `{ pqcSecret }` (مصفوفة `Uint8Array` من 32 بايتًا، مستقلة عن `seed32`) | `{ legacySeedDerivation: true }` |
| Python | `unified_account_from_seed(seed32, ...)` | `recovery_code=...` | `pqc_secret=...` | `legacy_seed_derivation=True` |
| Go | `unified.UnifiedAccountFromSeed(seed32, opts)` | `unified.SeedPQCOptions{RecoveryCode: ...}` | `unified.SeedPQCOptions{PQCSecret: ...}` | `unified.SeedPQCOptions{LegacySeedDerivation: true}` |
| Rust | `unified_account_from_seed(seed32, opts)` | `SeedPqcOptions::recovery_code(code)` | `SeedPqcOptions::pqc_secret(secret32)` | `SeedPqcOptions::legacy_seed_derivation()` |
| Java | `UnifiedAccounts.unifiedAccountFromSeed(seed32, opts)` | `SeedPqcOptions.withRecoveryCode(code)` | `SeedPqcOptions.withPqcSecret(secret32)` | `SeedPqcOptions.legacy()` |

خيارات Python تُمرَّر بالاسم فقط. يعطي `pqcSecret` المفتاح نفسه الذي يعطيه رمز الاسترداد المصنوع منه بـ `pqcRecoveryCodeFromSecret(secret32)`. ويتوفر في TypeScript أيضًا `pqcKeyFromRecoveryCode(code, qor1)`.

**الترحيل (TypeScript).** أنشئ رمز استرداد مرة واحدة واحفظه بعيدًا عن البذرة:

```ts
import { generatePqcRecoveryCode, unifiedAccountFromSeed } from "@qorechain/sdk";

const recoveryCode = generatePqcRecoveryCode(); // once; store it apart from the seed
const account = unifiedAccountFromSeed(seed32, { recoveryCode });
```

الحساب الذي سجّل مفتاح PQC الخاص به مع 0.12 أو أقدم يحمّل المفتاح القديم بـ
`{ legacySeedDerivation: true }` ويدوّره بـ `rotatePqcKeyMsg`:

```ts
const old = unifiedAccountFromSeed(seed32, { legacySeedDerivation: true });
// rotate it with rotatePqcKeyMsg, then use { recoveryCode } from then on
```

احتفظ برمز الاسترداد: رمز مختلف يعطي مفتاحًا مختلفًا.

## ما الذي يضيفه الإصدار 0.12.0 {#whats-new-0120}

الإصدار SDK 0.12.0 هو إصدار العميل للسلسلة **v3.2.5**، التي طبّقتها الشبكة الرئيسية عند
الارتفاع 3,906,833 في 29 أكتوبر 2026 (وطبّقتها الشبكة التجريبية في 26 أكتوبر). وتعمل
الشبكة الرئيسية بالإصدار v3.2.6 منذ 4 نوفمبر؛ وعملت الشبكة التجريبية بالإصدار v3.2.6 منذ 27 أكتوبر، وبالإصدار v3.2.7 من 6 إلى 12 نوفمبر، وبالإصدار v3.2.8 منذ 12 نوفمبر؛ ولم
تتغير صيغة التوقيع الهجين ولا العناوين ولا المنازل العشرية ولا الـ memo، فتبقى المعاملة
المبنية بالإصدار 0.10.0 صالحة. وتنتقل TypeScript وPython وGo وRust وJava
كلها إلى 0.12.0، مع `@qorechain/react` و`@qorechain/evm` و`@qorechain/svm`
و`create-qorechain-dapp`. جرى التحقق من الإصدار في كل لغة بإرسال bank هجين
على الشبكة التجريبية وبتسجيل مفتاح KEM وقراءته وإزالته هناك،
إضافة إلى قراءات على الشبكة الرئيسية.

| المجال | في 0.12.0 |
| --- | --- |
| نقاط النهاية العامة افتراضيًا | تشير الإعدادات المسبقة `mainnet` و`testnet` الآن إلى نقاط النهاية العامة (REST وRPC الإجماع وEVM JSON-RPC على الشبكتين، إضافة إلى EVM WebSocket على الشبكة التجريبية) بدلًا من localhost. لذا فإن `createClient()` المجرّد يتصل بالشبكة التجريبية العامة. انظر [الشبكة ونقاط النهاية](/sdk/reference/network#public-endpoints) |
| الإعداد المسبق `localnet` | منافذ localhost التي كانت كل الإعدادات المسبقة تستخدمها قبل 0.12.0، ومعرّف السلسلة `qorechain-devnet`. اختره بـ `createClient({ network: "localnet" })` للإبقاء على السلوك القديم |
| غاز دقيق للمعاملات الهجينة | على شبكة طبّقت v3.2.5 تكون الرسوم `"auto"` لمعاملة native هجينة هي `ceil(simulated x 1.02) + 2000`، لأن المحاكاة صارت تحتسب التحقق ما بعد الكمّي بنفسها. يطلب إرسال bank هجين نحو 171,600 غاز بدلًا من نحو 289,000، وتنخفض الرسوم معه. تحتفظ الشبكات الأقدم والمعاملات الكلاسيكية وحالة فشل جلب الخطة بالقاعدة السابقة؛ والمضاعف الذي تمرّره يحلّ محل أي من القاعدتين. `exactHybridGas` (ومكافئاتها في كل لغة) و`estimateGasDetails` في TypeScript (تبلّغ عن المحاكاة وحدّ الغاز والقاعدة التي حدّدته). وأضيف مسار الغاز التلقائي إلى Java |
| سجل مفاتيح ML-KEM-1024 | ينشر الحساب مفتاح تغليف ML-KEM-1024 واحدًا (الخوارزمية 2، ‏1,568 بايت) ليشفّر إليه أي شخص: `msg.pqc.registerKemKey` و`msg.pqc.removeKemKey` (يُفحص المفتاح أولًا: الحجم، وكل معامل أصغر من 3329، وألا يكون كله أصفارًا)، و`validateKemPublicKey`، والقراءة `fetchKemKey` للمسار `/qorechain/pqc/v1/kem/{address}` (بصيغة bech32 أو `0x`). تحتاج الرسالتان إلى التوقيع الهجين. يستجيب المسار على الشبكة الرئيسية وعلى الشبكة التجريبية. لا تشفّر الـ SDK: للحمولات المختومة انظر [QoreSeal](/developer-tools/qoreseal) |
| الحسابات المجرّدة | قراءات قواعد الإنفاق المخزَّنة لحساب ومفاتيحه المرتبطة (بما فيها الملغاة)، و`MsgUpdateConfig` (رسالة الحوكمة التي تبدّل الوحدة)، و`authenticators_count` في عرض الحساب |
| فحوص قواعد الإنفاق | تُفحص القواعد كما تفحصها السلسلة: يجب أن يحدد denom من النوع `erc20/` أو `erc721/` أو `erc1155/` عنوان عقد بصيغة `0x`. وتُسمّى الرموز 8 (قاعدة إنفاق غير صالحة) و9 (الوحدة معطّلة) في `abstractaccount` |
| معاملات الحوكمة | الرسالة `MsgUpdateParams` الخاصة بـ cross-VM (بما فيها عقود CosmWasm التي يجوز لـ precompile جسر EVM استدعاؤها) و`MsgUpdateParams` الخاصة بالـ rollup، وتُفحص كل منهما مقابل حدود السلسلة قبل التوقيع. وتحمل قراءة معاملات cross-VM الحقل `bridge_allowed_targets` |
| ثابت الترقية والـ protos | `CHAIN_UPGRADE_V3_2_5`؛ وتعريفات protobuf متزامنة مع السلسلة v3.2.5 |
| مجموعة أدوات مطوري السلسلة | من 0.11.0 (npm فقط) وهي مشمولة في 0.12.0: تصدّر `@qorechain/evm` سلسلتي viem ‏`qorechain` (‏9801) و`qorechainTestnet` (‏9800) ومساعدات نافذة تفويض EVM (`evmWindowStatus` و`openEvmWindowMessage`، وهي متاحة أيضًا باسم `@qorechain/evm/window` بدون viem). وفي `create-qorechain-dapp` قوالب `foundry` و`hardhat` و`viem-wagmi` و`cosmwasm`. وفي `@qorechain/react` المكوّن `PqcStatusBadge` (وتبقى أسماء `QuantumSafeBadge` القديمة أسماء بديلة مهجورة) |
| إصلاحات | كانت `@qorechain/svm` المعطاة نقاط نهاية بلا `svmRpc` تستخدم localhost؛ وهي الآن تذكر أن نقطة النهاية غير مضبوطة. ويوجّه توليد شيفرة Python الاستيرادات بين protos الخاصة بـ QoreChain إلى داخل الحزمة |

**تغيير في السلوك يجب فحصه عند الترقية.** إذا كانت شيفرتك تعتمد على القيمة
الافتراضية localhost، فاختر `localnet` أو مرّر `endpoints`. نقاط نهاية الشبكة
التجريبية العامة محدودة المعدل لكل IP، لذا ينبغي أن تشغّل حركة الإنتاج عقدتها
الخاصة أو تستخدمها. لا يضبط أي إعداد مسبق نقطة gRPC ولا نقطة SVM على الشبكات العامة
(معاملات SVM غير مفتوحة)، وليس للشبكة الرئيسية EVM WebSocket عام: والشيفرة التي تحتاج
إلى إحداها تفشل بخطأ يسمّي نقطة النهاية المطلوب تمريرها، بدلًا من الرجوع
إلى localhost. وفي Rust صارت نقاط النهاية الاختيارية `Option<String>`؛ وفي Python وGo
وJava تكون نقطة النهاية غير المضبوطة `None` وسلسلة فارغة و`null` على التوالي.

لا تُبلغ العقد عن إصدار ملفها التنفيذي. لاكتشاف ميزة، اسأل `isUpgradeApplied`
عن كل اسم ترقية يجلبها، أو اقرأ `.version` من
`https://download.qore.host/<net>/latest.json`.

## ما الذي أضافه الإصدار 0.10.0 {#whats-new-0100}

الإصدار SDK 0.10.0 هو إصدار العميل للسلسلة **v3.2.4**، التي طبّقتها الشبكة الرئيسية عند
الارتفاع 3,742,566 في 23 أكتوبر 2026 (وطبّقتها الشبكة التجريبية عند الارتفاع 8,337,253
في 19 أكتوبر). لم تتغير صيغة التوقيع ولا العناوين ولا المنازل العشرية ولا الـ memo
ولا الرسوم، وتبقى المعاملة المبنية بالإصدار 0.9.0 صالحة. جرى التحقق من الإصدار في
كل لغة بمعاملات حقيقية على الشبكة التجريبية. ولم يكن فيه بُناة لأي شيء استُحدث بعد
v3.2.4؛ وجاءت إضافات v3.2.5 مع [0.12.0](#whats-new-0120). وتعمل الشبكة الرئيسية
بالإصدار v3.2.6 منذ 4 نوفمبر 2026 (الارتفاع 4,020,000، مقترح الحوكمة 15؛ وقبله v3.2.5
منذ 29 أكتوبر عند الارتفاع 3,906,833) ويستمر 0.10.0 في العمل عليها لأن صيغة التوقيع
لم تتغير. وقد طبّقت الشبكة التجريبية v3.2.5 وv3.2.6 في 26 و27
أكتوبر 2026، وv3.2.7 في 6 نوفمبر وv3.2.8 في 12 نوفمبر (ليس في أي إصدار من SDK أدوات بناء لرسائل v3.2.7). ما جاء به 0.10.0
(وكله ما زال في 0.13.0):

| المجال | في 0.10.0 |
| --- | --- |
| طبقات الرهن (`x/stakingtier`) | الملحّنات `lockDelegation` (بفحوص السلسلة نفسها: مدة 3 أو 6 أو 12 شهرًا ومبلغ موجب صحيح) و`unlockEarly` و`claimBonus` و`updateParams`؛ وقراءات لمعاملات الوحدة وأقفال الحامل وصندوق المكافأة (`fetchStakingTierParams` و`fetchStakingLocks` و`fetchStakingTierPool`)؛ ورموز أخطاء الوحدة. وما تفعله الوحدة موصوف في [التفويض والحصص](/user-guide/staking-and-delegation) |
| nonce الموثِّق | تقرأ `fetchAuthNonce({ rest, address, pubkey })` التسلسل الذي يجب أن يوقّعه مفتاح مرتبط لاحقًا في `MsgExecuteEVM` / `MsgExecuteCosmos` من `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}`، بدلًا من تتبّعه يدويًا. تقدّم الشبكتان المسار؛ أما وحدة `abstractaccount` نفسها فمطفأة على الشبكة الرئيسية (ومفعَّلة على شبكة الاختبار)، لذا يُرفض الإنفاق على الشبكة الرئيسية قبل فحص أي nonce |
| مفاتيح تبديل ميزات البروتوكول | تقرأ `fetchProtocolFeatures` و`isProtocolFeatureEnabled` أي قواعد إجماع تفرضها الشبكة، بالاسم، من `/qorechain/pqc/v1/protocol_features` (تقدّمه الشبكتان). والشبكة الأقدم من v3.2.4 لا تقدّم المسار؛ استخدم `isUpgradeApplied` هناك |
| `possessionProven` | تبيّن حالة PQC ما إذا سُجّل مفتاح الحساب بإثبات حيازة |
| `ibcTimeoutTimestamp(seconds)` | مهلة IBC مطلقة بالوحدة التي تأخذها `MsgTransfer` (نانوثانية Unix). مهل IBC أوقات مطلقة؛ وحزم IBC v2 تأخذ ثواني Unix مطلقة، وتُرفض القيمة النسبية هناك بعد اقتطاع الرسوم. لا توجد قناة IBC مفتوحة على الشبكة الرئيسية (جرى التحقق في 27 أكتوبر 2026) |
| ثابت الترقية والـ protos | ‏`CHAIN_UPGRADE_V3_2_4`؛ وتعريفات protobuf متزامنة مع السلسلة v3.2.4 (حقول جديدة في تسجيل مُصدِّق الجسر والعقدة الخفيفة واستعلامات الـ rollup) |
| `ensurePqcRegistered` | كانت تعدّ حالةً بلا مفتاح عام مطابقةً؛ وهي الآن تقرأ المفتاح عبر `rest` وتقارنه. وإذا لم يتوفر مصدر لقراءته، تُبلغ النتيجة `keyVerified: false` بدلًا من الادعاء بأن المفتاح للمستدعي |
| الرفض أثناء محاكاة الرسوم | الرفض الذي تعيده السلسلة نصًا فقط (مثل "no bonus to claim") يُسمّى الآن من أوصاف الأخطاء المسجَّلة في السلسلة في كل لغة: `decodeTxError` (TypeScript) و`SimulationRefusedError` (Python) و`tx.DecodeRefusalText` (Go) و`tx::decode_refusal_text` (Rust) و`TxError.decode` (Java) |

انتقل `@qorechain/react` و`create-qorechain-dapp` إلى 0.10.0 معه؛ وكلاهما
على 0.13.0 الآن.

## ما الذي أضافه الإصدار 0.9.0 {#whats-new-090}

كان الإصدار SDK 0.9.0 إصدار العميل للسلسلة **v3.2.2** و**v3.2.3** (طبّقتهما الشبكة
الرئيسية عند الارتفاعين 3,556,788 و3,662,051؛ وعملت الشبكة الرئيسية بالإصدار v3.2.4 من 23 أكتوبر 2026 (الارتفاع 3,742,566) وبالإصدار v3.2.5 من 29 أكتوبر وتعمل بالإصدار v3.2.6 منذ 4 نوفمبر 2026، وتعمل الشبكة التجريبية بالإصدار v3.2.4 أو أحدث منذ 19 أكتوبر 2026).
لم تتغير صيغة التوقيع ولا العناوين ولا المنازل العشرية ولا الـ memo ولا الرسوم، لذا
فصيغة sign-bytes الهجينة v2 التي يوقّعها 0.8.1 وما بعده لا تزال الصيغة الصحيحة.
الجديد:

| المجال | في 0.9.0 (وما بعده) |
| --- | --- |
| `TxClient` الهجين (TypeScript) | مرّر زوج مفاتيح الحساب: `client.connectTx(signer, { pqcKeypair })` أو `TxClient.connect({ …, pqcKeypair, rest })`. عندئذٍ تُوقَّع كل معاملة توقيعًا هجينًا ويحاكي `fee: "auto"` المعاملة الهجينة نفسها؛ أما تسجيل المفتاح المجرّد فيبقى كلاسيكيًا (مسار التهيئة الأولية في السلسلة). تستخدمه `bankSend` وعملاء SDK الخاصون بـ rollup وmultilayer وcross-VM. وبدون زوج مفاتيح لا يتغير شيء |
| مفتاح PQC قابل للاسترداد | `derivePqcCanonical(address, mnemonic)` ومكافئاتها في كل لغة (انظر [التوقيع الهجين](/sdk/guides/quantum-safe#canonical-derivation)) |
| `ensurePqcRegistered` | تقرأ حالة المفتاح عبر REST أولًا (`rest`)، وترفض التسجيل عندما لا تستطيع التحديد، وترمي `PqcKeyMismatchError` عندما يحمل الحساب مفتاحًا مختلفًا بالفعل، وتعدّ رفض السلسلة بعبارة «مسجَّل بالفعل» نجاحًا. ابتداءً من السلسلة v3.2.3 توقّع **إثبات الحيازة** وترفقه بنفسها؛ وقبل v3.2.3 تترك الحقل فارغًا |
| نوافذ EVM المحدّدة النطاق | يقبل `openEvmWindowMsg` الوسيطين `nativeOnly` و`allowedTargets` (16 كحد أقصى، دون تكرار)؛ وتقرأ `fetchEvmWindow` كليهما (انظر [دليل EVM](/sdk/guides/evm#evm-window)) |
| موافقة EIP-7702 | `authorizeEvmDelegationMsg` و`clearEvmDelegationMsg` و`fetchEvmDelegationConsent` و`evmDelegationTupleNonce` و`classifyEvmDelegationRejection` |
| سلامة المفاتيح | ترفض بُناة التسجيل `classical_only` والمفتاح الفارغ ومفتاح ML-DSA-87 المنحلّ، وهي أمور ترفضها السلسلة ابتداءً من v3.2.3. تُصدَّر `signProofOfPossession` / `verifyProofOfPossession`؛ وترسل `migratePqcKeyHybrid` الرسالة `MsgMigratePQCKey` الموقَّعة توقيعًا هجينًا التي تحتاجها الحسابات ذات المفاتيح ابتداءً من v3.2.3 |
| ملخّص الحساب المجرَّد v2 | `evmAuthSignBytesV2` (يربط حدّ غاز الاستدعاء) و`resolveEvmAuthDigestVersion`. وحدة `abstractaccount` معطَّلة على الشبكة الرئيسية (ومفعَّلة على شبكة الاختبار)، لذا هذا للرجوع فقط على الشبكة الرئيسية |
| اكتشاف الترقية | `isUpgradeApplied` و`requireUpgradeApplied`: لا تُضبط الحقول الاختيارية الجديدة إلا بعد أن يُبلغ `applied_plan` عن الإصدار، لأن العقدة التي لم تطبّق إصدارًا ترفض المعاملة بأكملها عند ضبط أحد الحقول الجديدة لذلك الإصدار |
| فكّ ترميز الأخطاء | يحتفظ الفشل داخل كتلة بالـ codespace الخاص به (مثل `pqc` 231 لا `sdk_231`)؛ وتُفكَّك `rate_limited` ورموز التفويض؛ وتقرأ `decodeTxError` سجلَّ الخطأ المُطلَق أو رسالته |
| قواعد الإنفاق | تعمل `validateSpendingRules` داخل بُناة `MsgUpdateSpendingRules` وترفض قاعدة لا تقيّد شيئًا |
| إصلاحات | مسار حساب PQC هو المفرد `/qorechain/pqc/v1/account/{address}` في كل SDK (وفي `client.rest.getPqcAccount` و`isPqcRegistered` و`getPqcStatus` عند تمرير العميل المركَّب)؛ ويطابق `VERSION` المُصدَّر الحزمة؛ ويتوقف عميلا Go وRust اللذان ينشئهما الـ SDK عند انتهاء المهلة بدل التعليق؛ وتعتمد قوالب `create-qorechain-dapp` على الإصدار الذي تُشحن معه |

الاشتقاق القديم لـ PQC للمفاتيح الجديدة (`derivePqcLegacy`، `"bridge"`) مهجور:
فهو غير مرتبط بالحساب، لذا ستعطي عبارة استذكارية واحدة مفتاحًا واحدًا لكل
حساب. ترفضه أدوات التدوير المساعدة بوصفه المفتاح **الجديد**؛ أما الاسترداد من
مفتاح قديم قائم أو التدوير بعيدًا عنه فما زال يعمل.

## الإصدارات السابقة للإصدار 0.9.0 {#before-090}

إذا كنت على 0.8.x فهو لا يزال يوقّع الصيغة التي تتحقق منها الشبكتان ويعمل على
الشبكة الرئيسية والشبكة التجريبية. هذه هي الحدود التي أزالها 0.9.0،
وبعضها يكلّف رسومًا إن لم تعرفها:

| الإصدار السابق للإصدار 0.9.0 | الحل البديل |
| --- | --- |
| لا توجد بُناة لإثبات الحيازة ولا للنوافذ المحدّدة النطاق ولا لموافقة EIP-7702 | استخدم `qorechaind tx pqc register-key-v2 … --pqc-key <name>`، و`open-evm-window --native-only` / `--allowed-targets`، و`authorize-evm-delegation` / `clear-evm-delegation` (انظر [نافذة تفويض EVM](/getting-started/first-transaction#evm-window)، [تفويضات EIP-7702](/architecture/post-quantum-security#eip-7702)) |
| كانت `ensurePqcRegistered` دون `status` تبثّ التسجيل دون تحقق، وتُبلغ عن النجاح عندما يكون مفتاح مختلف مسجَّلًا | يُرفض التسجيل الثاني لحساب يحمل مفتاحًا بالفعل **بعد اقتطاع الرسوم**. اقرأ `GET /qorechain/pqc/v1/account/{address}` أولًا ومرّر `status: { registered: found }` |
| `client.rest.getPqcAccount` و`isPqcRegistered` و`getPqcStatus` | كانت تستدعي مسارًا بصيغة الجمع `/accounts/` أو مساحة الأسماء `qor_`، وهما لا تخدمهما نقاط النهاية العامة (HTTP 501، `-32601`). اقرأ مسار REST بصيغة المفرد أعلاه |
| كانت `TxClient` / `bankSend` وعملاء rollup وmultilayer وcross-VM توقّع توقيعًا كلاسيكيًا فقط | ترفض الشبكتان ذلك لأي حساب له مفتاح. أرسل عبر `signAndBroadcastHybrid` |
| فقدت المعاملات الفاشلة داخل الكتلة الـ codespace الخاص بها | اقرأ المعاملة من `GET /cosmos/tx/v1beta1/txs/{hash}` |
| كان الثابت المُصدَّر `VERSION` في 0.8.3 يُبلغ عن `0.8.0` | اقرأ الإصدار المثبَّت من `package.json` |
| ثبّت `create-qorechain-dapp` 0.8.0 الحزمتين `@qorechain/sdk` / `@qorechain/evm` على `^0.3.0` (علامة الإقحام caret على إصدار 0.x تبقى داخل 0.3) | شغّل `npm i @qorechain/sdk@latest` بعد التهيئة |
| كان `@qorechain/react` 0.8.x يترك حالة المفتاح المسجَّل غير قابلة للقراءة على نقاط النهاية العامة | استخدم `@qorechain/react` 0.9.0 أو أحدث |

:::caution إصلاحات أقدم
أصلح إصدار SDK **0.6.1** خللًا حرجًا على مستوى الإجماع: كان امتداد جسم المعاملة
`/qorechain.pqc.v1.PQCHybridSignature` يُسلسل بصيغة JSON
داخل `Any.value` **وترفضه السلسلة عند CheckTx**. المعاملات الهجينة (PQC +
كلاسيكية) المبنية بإصدار SDK ‏≤ 0.6.0 تُرفض على السلسلة. وقد أزال الإصدار **0.8.0**
مساعِدات الحساب القائمة على توقيعات المحافظ (انظر
[الحسابات وتوقيع PQC](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

الحزمة الأساسية:

```bash
npm i @qorechain/sdk
```

تستهدف Node.js 20 فما فوق وتأتي مزوّدة بـ ESM وCommonJS وتعريفات الأنواع.
وتستورد أمثلة المعاملات الهجينة في هذه الوثائق أيضًا `StargateClient` من
`@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### محوّل EVM

`@qorechain/evm` هو محوّل خفيف وآمن الأنواع فوق [viem](https://viem.sh).
تُعد viem **اعتمادية نظيرة (peer dependency)** — ثبّتها معه:

```bash
npm i @qorechain/evm viem
```

منشور على npm بالإصدار `0.13.0`. يصدّر سلسلتي viem ‏`qorechain` (معرّف السلسلة 9801) و`qorechainTestnet` (‏9800) ومساعدات [نافذة تفويض EVM](/sdk/guides/evm#evm-window).

### محوّل SVM

`@qorechain/svm` هو محوّل خفيف فوق
[`@solana/web3.js`](https://solana.com/docs/clients/javascript)، وهي
**اعتمادية نظيرة**:

```bash
npm i @qorechain/svm @solana/web3.js
```

منشور على npm بالإصدار `0.13.0`.

### عدّة React

`@qorechain/react` هي طبقة React الرسمية فوق `@qorechain/sdk` — مزوّد
(provider)، وخطافات (hooks)، ومكوّنا `ConnectButton` / `PqcStatusBadge`.
تُعد `react` (‏>=18) اعتمادية نظيرة:

```bash
npm i @qorechain/react
```

منشورة على npm بالإصدار `0.13.0`؛ وتعتمد على `@qorechain/sdk` ‏`^0.13.0`. انظر [دليل عدّة React](/sdk/guides/react).

### أداة التهيئة (Scaffolder)

تقوم `create-qorechain-dapp` (على npm، الإصدار `0.13.0`) بتهيئة تطبيق dApp جاهز للتشغيل:

```bash
npm create qorechain-dapp@latest my-dapp
```

تعتمد ملفات `package.json` المُولَّدة على إصدار SDK الذي تُشحن معه أداة التهيئة
(`@qorechain/sdk` ‏`^0.13.0`؛ وتستخدم قوالب EVM الحزمة `@qorechain/evm` ‏`^0.13.0`). وفيها أيضًا قوالب `foundry` و`hardhat` و`viem-wagmi` و`cosmwasm` لأعمال العقود.
كتب الإصدار 0.8.0 من أداة التهيئة نطاقات `^0.3.0`، وهي على إصدار 0.x تبقى
داخل 0.3 ولا تستطيع التوقيع للشبكات الحيّة؛ فإذا هيّأت بالإصدار 0.8.0 فشغّل
`npm i @qorechain/sdk@latest`. انظر [مرجع CLI](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

تتطلب Python 3.10 فما فوق. تأتي الحزمة مزوّدة بتلميحات الأنواع وعلامة `py.typed`.

> تُثبَّت التوزيعة باسم `qorechain-sdk` (منشورة على PyPI بالإصدار `0.13.0`)
> لكنها **تُستورد باسم `qorsdk`**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

تتطلب Go 1.23 فما فوق. استورد الحزم الفرعية التي تحتاجها، على سبيل المثال:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

منشورة كوحدة Go مستقلة بذاتها (الوسم `packages/go/v0.13.0`). ثبّت الإصدار
صراحةً: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.13.0`.

## Rust

```bash
cargo add qorechain-sdk
```

أو، لتتبّع رأس المستودع (repository head):

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

تتطلب Rust 1.74 فما فوق. عملاء القراءة غير متزامنين (Tokio). تُستورد الحزمة (crate) باسم
`qorechain`‏ (`use qorechain;`).

> منشورة على crates.io باسم `qorechain-sdk` (0.13.0)؛ يقوم الأمر `cargo add qorechain-sdk`
> بتثبيت أحدث إصدار.

## Java

Maven‏ (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.13.0</version>
</dependency>
```

أو Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.13.0'
```

> منشورة على Maven Central باسم `io.github.qorechain:qorechain-sdk`، الإصدار
> 0.13.0 (جرى التحقق في 11 نوفمبر 2026). ويحتاج JDK 17 أو أحدث. لا يحتوي Central على إصدار
> 0.8.0 أو 0.8.1، لذا استخدم على الشبكات الحيّة 0.8.2 أو أحدث. وكان 0.9.1 إصدارًا
> خاصًا بـ Java فقط نقل Bouncy Castle من 1.80 إلى 1.85 دون تغيير في واجهة API.

## الحزم ذات الصلة {#related-packages}

| الحزمة | الغرض | الإصدار |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | مساعِدات من جانب المحفظة: إنشاء المحافظ (`generateQoreWallet`)، والتوقيع الهجين بـ `eth_secp256k1` (`signHybridEth`، `QoreChainSigner`)، وتسجيل شبكة MetaMask (`addQoreEvmToWallet`)، وبُناة رسائل المصادِقين ونافذة EVM (تبني `openEvmWindowMsg` فيها الصيغة غير المحدّدة النطاق فقط)، وملخّص v2 للحساب المجرَّد. لا ترفق إثبات حيازة. الاعتماديات النظيرة: `@cosmjs/proto-signing` و`@cosmjs/stargate` ‏`^0.32` (يستخدم SDK الإصدار 0.39 من cosmjs، لذا يؤدي تثبيت الاثنين في مشروع واحد إلى أن يُبلغ npm عن تعارض في الاعتماديات النظيرة، `ERESOLVE`؛ أبقِهما في مشروعين منفصلين أو مرّر `--legacy-peer-deps`) | 0.5.0 |
| `@qorechain/chain-bridge` | عامل (worker) من جانب الخادم للأنظمة الخلفية: يشتق مفتاح PQC، ويوقّع هجينًا ويبثّ (`sendTokens` و`registerPqc` وغيرهما). مرّر `cosmosRest`: فمعه يحمل التسجيل إثبات الحيازة متى طبّقت الشبكة v3.2.3، ويُفحص أي رفض يبدو متعلقًا بـ PQC مقابل السلسلة قبل أي إعادة تسجيل (يثير مفتاح مسجَّل مختلف الخطأ `pqc_key_mismatch` بدلًا من دفع رسوم تسجيل ثانٍ) | 0.2.3 |
| `@qorechain/pqc` | بدائيات ML-DSA / ML-KEM / SHAKE-256 المطابقة للمعايير فقط و`hybridSignBytes` (انظر [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing))؛ وهي متاحة أيضًا على PyPI وcrates.io وMaven Central ووكيل Go (Go `v0.2.3`) بالإصدار نفسه | 0.2.3 |
| `@qorechain/handles` | حلّ `@handle` الموثَّق (`HandleClient`): أنت تقدّم المفتاح العام للسجل ومخزن التثبيت، وتثبّت العنوان بعد أن يراه المستخدم؛ ولا تثبّت الحزمة شيئًا من تلقاء نفسها. انظر [جسر السلسلة والـ handles](/developer-tools/chain-bridge#handles) | 0.1.0 |
| `@qorechain/connect` | **مهجورة على npm ولم تعد تُصان؛ لا تستخدمها في أي عمل جديد. استخدم [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) بدلًا منها (بدائل الاتصال بـ QoreX في [نظرة عامة على أدوات المطورين](/developer-tools/overview#group-connect)).** موصِّل واحد لمحافظ EVM وCosmos وSVM، مبني على محوّل المحفظة (نطاق اعتماديته النظيرة هو `@qorechain/wallet-adapter` ‏`^0.2.1`، الذي لا يشمل 0.5.0). وهو لا يفتح [نافذة تفويض EVM](/sdk/guides/evm#evm-window)، لذا يُرفض أي إرسال EVM عبره إلى أن يكون للحساب مفتاح مسجّل ونافذة مفتوحة | 0.2.1 |
| `@qorechain/rdk` | عميل Rollup Development Kit (انظر [Rollups](/rollups/why)). ابتداءً من 0.7.0 يعتمد على `@qorechain/sdk` ‏`^0.10.0` و`@qorechain/evm` ‏`^0.8.0` (جرى التحقق على npm في 4 نوفمبر 2026). وعلامة caret على إصدار 0.x تبقى داخل ذلك الإصدار الفرعي، لذا يحصل التطبيق الذي يستخدم SDK 0.13.0 على نسخة SDK 0.10.x ثانية متداخلة من أجل العدّة؛ أبقِ الاثنتين منفصلتين (لا تمرّر عميلًا من نسخة إلى أخرى) إلى أن ينتقل إصدار من العدّة إلى 0.13. يوقّع هجينًا فقط عندما تمرّر `pqcKeypair`؛ وتعمل القراءات بدونه. وهو منشور أيضًا باسم `qorechain-rdk` على PyPI وcrates.io وMaven Central، وكوحدة Go (ثبّت `@v0.8.0`)؛ ومنذ 0.8.0 توقّع هذه العملاء الأربعة توقيعًا هجينًا أيضًا (كانت الإصدارات السابقة توقّع توقيعًا كلاسيكيًا فقط؛ ويحتاج Java إلى Java 21). انظر [RDK 0.8.0: التغييرات والحدود](/rollups/deploying-a-rollup#rdk-050-limits) | 0.8.0 |
| `@qorechain/rdk-cli` | واجهة CLI للمشغّلين `qorollup` الخاصة بـ RDK. منذ 0.7.1 توقّع أوامر معاملاتها (`create` و`pause` و`resume` و`stop` و`withdraw`) توقيعًا هجينًا (كان 0.7.0 وما قبله يوقّع توقيعًا كلاسيكيًا فقط وترفضه الشبكتان)؛ وعند تثبيتها من npm تعمل ويطبع `--version` الإصدار المثبَّت (كان 0.6.1 وما قبله لا يطبع شيئًا) | 0.8.0 |
| `@qorechain/qoreseal` | QoreSeal: تشفير حمولة إلى مفاتيح ML-KEM-1024 التي تنشرها الحسابات في سجل KEM (يسجّل SDK 0.12.0 وما بعده المفاتيح ويقرؤها؛ ويتولى QoreSeal التشفير). متاحة أيضًا على PyPI (`qorechain-qoreseal`؛ عجلات macOS وLinux، وعجلة Windows في الإصدار التالي) وcrates.io وMaven Central (`io.github.qorechain:qoreseal` و`qoreseal-android`؛ ويحتاج مستهلكو Kotlin إلى Kotlin 2.3 أو أحدث) ووكيل وحدات Go (`github.com/qorechain/qoreseal/go`، ‏Go `v0.1.0`) وكحزمة Swift. انظر [QoreSeal](/developer-tools/qoreseal) | 0.1.0 |
| `@qorechain/asset-kit` | Asset Kit: أدوات لرموز الأصول الواقعية ذات الأذونات على محرك EVM، مع عملاء بلغات TypeScript وPython وJava وGo وعقود Solidity (`forge install qorechain/qorechain-asset-kit@v0.1.0`). ترخيص Apache-2.0، عدا سكربتات واختبارات ERC-3643 (GPL-3.0-or-later). الوحدات الأصلية التي يصفها مقترح، وليست مبنية. وهي أيضًا `qorechain-asset-kit` على PyPI و`io.github.qorechain:asset-kit` على Maven Central. انظر [Asset Kit](/developer-tools/asset-kit) | 0.1.0 |
| `@qorechain/qoresign` | QoreSign: توقيع المحافظ والواجهات الخلفية، و`inspectTransaction` لفحص طبقة ما بعد الكمّي في معاملة مثبَّتة. متاحة أيضًا على PyPI وcrates.io وMaven Central. انظر [QoreSign](/qoresign/overview) | 0.2.0 |
| `create-qorechain-rollup` | أداة تهيئة بدايات الـ rollup؛ تعتمد قوالبها على `@qorechain/rdk` ‏`^0.8.0` وتوقّع هجينًا حين تستطيع استخلاص مفتاحك ما بعد الكمّي من `QORE_MNEMONIC` أو `QORE_PQC_SEED_HEX` | 0.8.0 |

## التالي

تابع إلى [البدء السريع](/sdk/quickstart) للاتصال وقراءة الحالة على السلسلة.
