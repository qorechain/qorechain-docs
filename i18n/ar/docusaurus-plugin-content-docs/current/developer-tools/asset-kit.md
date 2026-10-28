---
slug: /developer-tools/asset-kit
title: مجموعة الأصول QoreChain Asset Kit
sidebar_label: Asset Kit
sidebar_position: 35
---

# مجموعة الأصول QoreChain Asset Kit

مجموعة الأصول QoreChain Asset Kit هي أدوات مفتوحة المصدر لإصدار وإدارة رموز مقيَّدة الصلاحيات (permissioned) تمثّل أصولاً من العالم الحقيقي على QoreChain. وتتألف من جزأين لكل منهما حالة مختلفة. الجزء الأول مجموعة من عقود EVM تعمل اليوم على محرك QoreChain EVM: محوّلات لمعيارين مفتوحين لرموز الأصول المنظَّمة (ERC-3643 وCMTAT)، وخزائن (vaults) بحصص مقيَّدة، وضابط واحد خاص بـ QoreChain يشترط أن يكون لكل حامل مفتاح ML-DSA-87 مسجَّل. أما الجزء الثاني فهو **مقترح** لوحدات سلسلة أصلية، منشور على شكل واجهات protobuf مع عملاء بأربع لغات ومحاكاة داخل الذاكرة، حتى يمكن تصميم التطبيقات واختبارها وفق القواعد المقترحة.

وهي موجهة للمُصدِرين ووكلاء التحويل ومديري الصناديق وفرق الامتثال والشؤون القانونية والمدمجين الذين يريدون إنشاء نموذج أولي لرمز منظَّم على شبكة اختبار QoreChain. الإصدار **0.1.0**، برخصة Apache-2.0 (مع استثناءات الرخصة المذكورة في [أين يُنشر](#where-published))، وتصونها جمعية QoreChain. وهي ما قبل 1.0 و**لم تُدقَّق**.

:::caution ما هو حي وما ليس حياً
- **يعمل اليوم، على شبكة الاختبار فقط:** عقود EVM وسكربتات النشر بـ Foundry ووحدة تحكم المُصدِر، على `qorechain-diana` (معرّف سلسلة EVM 9800). يقرأ فحص الحامل المُسبَق `pqcKeyStatus` (precompile) عند `0x0A02`، وهو فعّال على شبكة الاختبار و**غير فعّال على الشبكة الرئيسية**.
- **الشبكة الرئيسية (`qorechain-vladi`، معرّف سلسلة EVM 9801):** فحص الحامل **يفشل مغلقاً** (fails closed). كل عنوان غير مُعفى صراحةً يُعدّ غير مؤهل، فلا يمكن لرمز محمي بالضابط أن ينتقل بين الحاملين العاديين. وترفض سكربتات النشر العمل على السلسلة 9801.
- **مقترح، وليس حياً في أي مكان:** الوحدات الأصلية `x/asset` و`x/identity` و`x/compliance` و`x/settlement` و`x/attest` غير موجودة على أي شبكة QoreChain، ولا توجد ترقية مجدولة تضيفها. ولا يمكن لعملائها التحدث إلا مع محاكاة داخل الذاكرة.
- **القوالب القانونية** في المستودع مسودات لم تُراجَع، معدّة للنقاش مع محامٍ. وهي ليست استشارة قانونية.
:::

## الابتكارات {#innovations}

- **فحص حامل ما بعد كمّي فوق ضوابط المعيار نفسه.** يقرأ الضابط `pqcKeyStatus(address)` عند `0x0A02` ولا يقبل العنوان إلا إذا أعاد `registered` ومعرّف الخوارزمية 1 (ML-DSA-87) و`possessionProven`. المفتاح المسجَّل دون إثبات حيازة قد يعود لشخص آخر، لذلك لا يُحتسب. وتبقى كل ضوابط المعيار الأصلي سارية (سجل الهوية، وموضوعات المطالبات، والتجميد، والإيقاف المؤقت، والتحويل القسري)؛ ويُضاف الفحص إليها.
- **الفشل مغلقاً مع فك ترميز صارم.** يستدعي الضابط المُسبَق (precompile) بحصة غاز ثابتة ويفك ترميز الإجابة بصرامة. والإجابة بالتخطيط القديم ذي الحقول الثلاثة، أو الإجابة المشوَّهة، أو انعدام الإجابة، تُعامَل كأنه "لا يوجد مفتاح". وحيث لا يكون المُسبَق فعّالاً يكون كل عنوان غير مُعفى غير مؤهل.
- **الضابط نفسه خلف ثلاثة محوّلات.** يتصل `QoreChainHybridHolderRule` برمز CMTAT v3 بوصفه `ruleEngine` له (أو بوصفه قاعدة داخل CMTA RuleEngine) مع رموز التقييد 60 و61 و62؛ ويتصل `QoreChainHybridHolderModule` بالامتثال المعياري لـ ERC-3643 كوحدة plug-and-play؛ وتقبل الخزائن أي سياسة `IHolderEligibility`، ومنها الضابط.
- **حصص خزائن لا تتيح تبييض رمز مقيَّد.** يفحص `QoreChainRwaVault` (ERC-4626) و`QoreChainRwaAsyncVault` (ERC-7540، تُسوّى فيه الطلبات على دفعات بواسطة مشغّل يحمل `FULFILLER_ROLE`) جهة الاستلام في كل حركة حصص: فتعيد `maxDeposit` و`maxMint` صفراً للمستلم غير المؤهل. ولا تُرفض عمليات الاسترداد أبداً.
- **عقود المصدر الأصلي تُستخدم دون تعديل.** T-REX 4.1.6 وONCHAINID 2.2.1 وCMTAT 3.2.0 وOpenZeppelin هي git submodules، وليست نسخاً.
- **مقترح يمكن اختباره قبل وجوده.** يفشل كل استدعاء على `ChainClient` بالخطأ `ChainUpgradeRequired` (الرمز `CHAIN_UPGRADE_REQUIRED` مع اسم الوحدة) دون إرسال أي طلب شبكة. وينفّذ `MockChain` القواعد المقترحة داخل الذاكرة ويرفض بالخطأ `MockChainError` الذي يحمل اسم رمز الخطأ المقترح، مثل `ERROR_CODE_ADDRESS_FROZEN`. ويمكن كتابة التطبيق على المحاكاة مع إبقاء العميل الحقيقي موصولاً، فيُبلَّغ بوضوح عن ترقية غائبة بدل أن يفشل بصمت.
- **وحدة تحكم بلا خادم خلفي.** وحدة تحكم المُصدِر صفحة React لا ترسل أي طلب شبكة من تلقاء نفسها؛ وتضبط النسخة الإنتاجية Content-Security-Policy بالقيمة `connect-src 'none'`، ويمر كل شيء عبر المحفظة المتصلة.
- **اختبارات تعمل دون اتصال.** تعمل 33 اختبار Foundry بلا شبكة، باستخدام بديل اختباري للمُسبَق.

## ما الذي تفعله {#what-it-does}

**يعمل اليوم على QoreChain EVM (شبكة الاختبار):**

- **`QoreChainHybridHolderGuard`.** يبيّن ما إذا كان لعنوان مفتاح ML-DSA-87 مسجَّل مع إثبات حيازة (`isHybridHolder` و`isEligible` و`requireHybridHolder` و`keyStatus` و`precompileActive`). إعفاءات يديرها المالك للعقود مثل الخزائن وحسابات الضمان (`setExempt`، والحدث `ExemptionSet` مع سبب). وتنتقل الملكية على خطوتين (`Ownable2Step` من OpenZeppelin).
- **`QoreChainHybridHolderRule`.** قاعدة تحويل لـ CMTAT v3 مرتبطة بالضابط. رموز التقييد 60 (المرسِل) و61 (المستلِم) و62 (المنفِق) عبر `detectTransferRestriction` و`detectTransferRestrictionFrom` و`messageForTransferRestriction`.
- **`QoreChainHybridHolderModule`.** وحدة امتثال معياري لـ ERC-3643 (T-REX v4) مرتبطة بالضابط. تفحص `moduleCheck` المرسِل والمستلِم. لا إعداد لكل امتثال على حدة.
- **`QoreChainRwaVault` و`QoreChainRwaAsyncVault`.** موصوفان أعلاه.
- **`IERC7518`.** رسم أولي لواجهة أقسام ERC-7518 (partitions)، دون تنفيذ؛ ويفحص أحد الاختبارات معرّف ERC-165 الخاص بها `0x5a264a5d`.
- **سكربتات النشر (Foundry).** `script/DeployCmtat.s.sol` و`script/erc3643/DeployErc3643.s.sol` و`script/DeployVaults.s.sol`، مع فحص مسبق مشترك (`script/QoreChainTestnet.sol`) يبلّغ عمّا إذا كان المُسبَق يجيب وعن حالة مفتاح المُنشِر، ويرفض السلسلة 9801.
- **وحدة تحكم المُصدِر** (`packages/issuer-console`). تتصل بأي محفظة EIP-6963، وتضيف QoreChain Testnet أو تنتقل إليها، وتنشئ رمز CMTAT محمياً بالضابط (الضابط والقاعدة والرمز، كما في `DeployCmtat.s.sol`)، وتفتح رموز CMTAT أو ERC-3643 قائمة، وتنفّذ إجراءات الوكيل (الإصدار والحرق والتجميد وفك التجميد والتحويل القسري والإيقاف المؤقت واستئنافه)، وتعرض الحاملين وسجل تدقيق مبنياً من أحداث السلسلة.

**المقترح (غير موجود على السلسلة):**

- واجهات protobuf في `proto/` لـ `x/asset` و`x/identity` و`x/compliance` و`x/settlement` و`x/attest`، ودلالاتها في `docs/proposal.md`.
- عملاء بلغات TypeScript وPython وGo وJava: الأنواع المولَّدة، و`ChainClient`، و`MockChain`.

**مستندات مرجعية في المستودع:**

- `docs/evm-adapters.md`: العقود، ورخص المصدر الأصلي، والنشر على شبكة الاختبار.
- `docs/technology-standards.md`: مسودة تصف الشبكتين كما يحتاج المُصدِر أو المدقق أن يراهما (الموثوقية، والحوكمة، وصلاحية الترقية، وترتيب المعاملات، وقابلية المراقبة، ومعالجة الحوادث، وإدارة المفاتيح)، وكل واقعة موسومة بإحدى: Verified أو Documented أو Not measured أو Not published.
- `legal/`: ثلاثة قوالب للنقاش (راجع [الحدود](#limits)).

## حالات الاستخدام {#use-cases}

1. **مُصدِر ينشئ نموذجاً أولياً لرمز مقيَّد الصلاحيات على شبكة الاختبار.** ينشر المُصدِر رمز CMTAT بـ `DeployCmtat.s.sol` (أو من وحدة تحكم المُصدِر)، أو مجموعة ERC-3643 كاملة بـ `DeployErc3643.s.sol`، ويجرّب التجميد والإيقاف المؤقت والتحويل القسري وفحص الحامل على `qorechain-diana` قبل أي قرار بإصدار حقيقي.
2. **مدير صندوق يدير الاشتراكات والاستردادات عبر خزائن بحصص مقيَّدة.** يطلب المستثمرون الإيداع على `QoreChainRwaAsyncVault`؛ ويعالجها المدير على دفعات بـ `fulfillDeposit` و`fulfillRedeem`؛ ولا يمكن أن تستلم الحصص إلا العناوين المؤهلة، بينما يبقى الاسترداد مفتوحاً لكل من يحمل حصصاً.
3. **فريق امتثال يشترط تسجيل مفتاح ما بعد كمّي لكل حامل.** إضافة `QoreChainHybridHolderRule` (CMTAT) أو `QoreChainHybridHolderModule` (ERC-3643) تعني أن الرمز لا يمكن إصداره أو تحويله إلا إلى عناوين لها مفتاح ML-DSA-87 مسجَّل ومُثبَتة حيازته، فوق ضوابط الهوية وقائمة السماح الخاصة بالمعيار.
4. **مدمج يبني على الوحدات الأصلية المقترحة.** تكتب محفظة أو سجل أو نظام خلفي شيفرته مقابل `MockChain` بـ TypeScript أو Python أو Go أو Java، ويتحقق من أحداثه ورموز أخطائه، ويُبقي `ChainClient` موصولاً.
5. **فريق منتج يصمم تدفقات التسليم مقابل الدفع (delivery-versus-payment) والإفادات.** يمكن تجربة `x/settlement` المقترحة (تعليمات مع إقرار ثنائي الأطراف، كل الأرجل أو لا شيء) و`x/attest` (بيانات ذات فترة صلاحية وحالة قِدَم) في `MockChain` لتصميم تدفقات المستخدم، مع العلم أن أيّاً منهما غير موجود على السلسلة.
6. **فريق قانوني يبدأ الأوراق مع محامٍ.** تمنح القوالب الخاصة بورقة مالية قائمة على السجل في سويسرا، وشروط رموز TVTG في ليختنشتاين، وارتباط بنظام DLT التجريبي للاتحاد الأوروبي، هيكلاً وقسماً للربط التقني لتعبئته. ويراجع محامٍ مؤهل في الولاية القضائية كل شيء قبل أي استخدام.
7. **مراجع العناية الواجبة يقرأ وقائع الشبكة.** يسرد `docs/technology-standards.md` ما يمكن التحقق منه على الشبكتين الحيتين وما لم يُقَس أو لم يُنشر، مع المصادر.

## كيف تعمل {#how-it-works}

### فحص الحامل على EVM {#holder-check}

يجيب المُسبَق عند `0x0A02` عن `pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey, bool possessionProven)`. ويشترط الضابط `registered && algorithmId == 1 && possessionProven`. وهذا ما يجعل الضابط يفشل مغلقاً: فحيث لا يكون المُسبَق فعّالاً، يكون كل عنوان غير مُعفى صراحةً غير مؤهل. راجع [مُسبَقات EVM](/developer-guide/evm-precompiles) للمُسبَق نفسه وحالته على الشبكات.

```
                 CMTAT v3 token  -- ruleEngine -->  QoreChainHybridHolderRule --+
                                                                                +--> QoreChainHybridHolderGuard --> 0x0A02 pqcKeyStatus
ERC-3643 token -> ModularCompliance - module -->  QoreChainHybridHolderModule --+         (exemptions for contracts)
                                                                                |
       ERC-4626 / ERC-7540 vault shares ----------- IHolderEligibility ---------+
```

الفحص إضافي. تبقى كل ضوابط المعيار الأصلي سارية: سجل الهوية في ERC-3643 (ONCHAINID)، وموضوعات المطالبات، والمُصدِرون الموثوقون، والتجميد، والتجميد الجزئي، والإيقاف المؤقت، والتحويل القسري، والاسترداد (recovery)؛ وفي CMTAT التجميد والتجميد الجزئي والإيقاف المؤقت والتحويل القسري والمستندات واللقطات.

### ما الذي يغطيه الفحص {#coverage}

المهم هو الاستلام: فالإصدار أو التحويل إلى عنوان بلا مفتاح يُرفض. وتفحص قاعدة CMTAT كذلك المرسِل، وفي `transferFrom` المنفِق. أما وحدة ERC-3643 فتفحص المرسِل والمستلِم؛ ولا يمرّر ERC-3643 المنفِق إلى وحدات الامتثال، فلا يُفحص منفِق `transferFrom` هناك. ولا يُرفض الحرق أبداً (في ERC-3643 لا يستشير `burn` وحدات الامتثال إطلاقاً)، فيمكن استرداد حامل فقد أهليته.

### الخزائن {#vaults}

تفحص الخزنتان جهة الاستلام في كل حركة حصص؛ ولا يُرفض الاسترداد أبداً. في خزنة ERC-7540 تُجمَّع الطلبات لكل متحكّم (controller) (معرّف الطلب 0). يحوّل المنفِّذ (fulfiller) الإيداعات المعلّقة إلى حصص بنسبة الأصول لكل حصة في الخزنة نفسها عند التنفيذ، دون أي مدخل تقييم خارجي؛ ثم يطالب المتحكّمون بـ `deposit` أو `mint`، أو `redeem` أو `withdraw`. ويجب أن يُسمح لعقد الخزنة نفسه بحيازة الرمز الأساسي: مسجَّلاً في سجل الهوية في ERC-3643 أو في قائمة السماح في CMTAT، ومُعفى في الضابط (يضبط `DeployVaults.s.sol` إعفاءات الضابط).

### إرسال معاملة EVM على QoreChain {#native-prerequisites}

لا تُقبل أي معاملة EVM على QoreChain إلا إذا كان لدى المرسِل:

1. مفتاح ML-DSA-87 مسجَّل، سُجّل بـ `MsgRegisterPQCKeyV2` مع إثبات حيازة، و
2. نافذة تفويض EVM مفتوحة، فتحتها `/qorechain.pqc.v1.MsgOpenEVMWindow` في معاملة مسار Native موقّعة هجيناً (secp256k1 مع ML-DSA-87).

للنشر تحتاج النافذة إلى `allowed_targets` **فارغة** (النافذة المقيَّدة بأهداف ترفض إنشاء العقود)، و`max_txs` لا يقل عن عدد المعاملات، و`max_value` يغطي القيمة مع أقصى رسوم لكل معاملة، و`blocks` طويلة بما يكفي (17,280 كحد أقصى)، و`native_only` بقيمة false. وفتح النافذة يزيد تسلسل الحساب، وهو أيضاً nonce في EVM: افتح النافذة أولاً ثم شغّل السكربت. والاستدعاءات وتقدير الغاز لا تحتاج نافذة. الخلفية: [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing) و[تطوير EVM](/developer-guide/evm-development#evm-window).

### المقترح {#proposal}

ست رايات (flags) تُثبَّت أو لا تُخفَّف إلا نحو الأضيق عند الإنشاء (`require_auth` و`freezable` و`pausable` و`non_transferable` و`supply_cap` و`require_hybrid_signature`)؛ وأدوار (المُصدِر، والوكلاء، والمدققون، ووكلاء الهوية، ومصدرو المطالبات، والمُقِرّون attesters)؛ وفحوص تحويل مرتبة؛ وتجميد وتجميد جزئي واسترداد قسري (clawback) وتحويل قسري مع سبب مسجَّل؛ وهويات بمطالبات دون بيانات شخصية على السلسلة؛ وسجل لوحدات امتثال مُرقَّمة الإصدار (`identity-verified` و`country-allowlist` و`country-blocklist` و`max-holders` و`max-balance` و`attestation-fresh`)؛ وتعليمات تسوية مع إقرارات؛ وإفادات بحالة `FRESH` أو `STALE` أو `MISSING`. والمواصفة هي `docs/proposal.md` في المستودع. وحيث يختلف النص عن المحاكاة فالنص هو السلوك المقصود. كل هذا تصميم: لا شيء منه موجود على أي شبكة QoreChain.

## طريقة الاستخدام {#how-to-use}

### التثبيت {#install}

| الجزء | التثبيت | الحد الأدنى للمنصة |
|---|---|---|
| عقود Solidity (من GitHub) | `git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit` (الوسم `v0.1.0`)، أو كاعتماد في Foundry: `forge install qorechain/qorechain-asset-kit@v0.1.0` | Foundry؛ solc 0.8.28 (تستخدم ملفات T-REX وONCHAINID الإصدار 0.8.17)؛ `evm_version = "cancun"` |
| Java | `implementation("io.github.qorechain:asset-kit:0.1.0")` (Maven `io.github.qorechain:asset-kit:0.1.0`) | Java 17 |
| Go | `go get github.com/qorechain/qorechain-asset-kit/clients/go@v0.1.0` (الحزمة `assetkit`) | Go 1.23 |
| Python | **قريباً** على PyPI باسم `qorechain-asset-kit`؛ غير منشورة بعد. اليوم، من نسخة مستنسخة: `cd clients/python && python -m pip install .` (الاستيراد `qorechain_asset_kit`) | Python 3.10 |
| TypeScript | **قريباً** على npm باسم `@qorechain/asset-kit`؛ غير منشورة بعد. اليوم، من نسخة مستنسخة: `pnpm install && pnpm -r build` | Node.js 22.12 |
| وحدة تحكم المُصدِر | من نسخة مستنسخة: `pnpm install`، ثم `pnpm --filter @qorechain/issuer-console dev` (غير منشورة كحزمة) | متصفح مع محفظة EIP-6963 |

يستورد README المستودع وREADME عميل TypeScript من `@qorechain/asset-kit` كأنها مثبَّتة. وهذا يعمل من نسخة مستنسخة فقط، إلى أن يصدر إصدار npm.

مع `forge install` تقع العقود تحت `lib/qorechain-asset-kit/contracts/` واعتماداتها تحت `lib/qorechain-asset-kit/contracts/lib/`. إعادات التعيين (remappings) التي تترجم الضابط وقاعدة CMTAT والخزائن:

```
qorechain-asset-kit/=lib/qorechain-asset-kit/contracts/src/
@openzeppelin/contracts/=lib/qorechain-asset-kit/contracts/lib/openzeppelin-contracts/contracts/
CMTAT/=lib/qorechain-asset-kit/contracts/lib/CMTAT/contracts/
```

### البدء السريع 1: ترجمة العقود واختبارها (دون اتصال) {#quickstart-build}

من README المستودع. بلا شبكة وبلا حساب.

```bash
git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit
cd qorechain-asset-kit/contracts
forge build && forge test
```

ينتهي الناتج الملاحَظ بـ `33 tests passed, 0 failed, 0 skipped (33 total tests)`.

### البدء السريع 2: تشغيل تجريبي لنشر على شبكة الاختبار {#quickstart-dry-run}

بدون `--broadcast` يحاكي Foundry على حالة شبكة الاختبار ولا يرسل شيئاً. يصلح أي عنوان لـ `--sender` في التشغيل التجريبي.

```bash
forge script script/DeployCmtat.s.sol --rpc-url qorechain_testnet --sender <deployer>
```

`qorechain_testnet` معرَّف في `foundry.toml` على أنه `https://evm-testnet.qore.host`. يطبع الفحص المسبق معرّف السلسلة (9800) و`pqcKeyStatus precompile: active` وحالة مفتاح المُنشِر. وللعنوان الذي لا مفتاح له يضيف `Broadcasting would fail: register an ML-DSA-87 key and open an EVM window first.` ثم يطبع العناوين التي سيحصل عليها الضابط والقاعدة والرمز. وينتهي الأمر نفسه على الشبكة الرئيسية بالرسالة `QoreChain mainnet: the hybrid-holder guard is testnet only`. ويعمل `script/erc3643/DeployErc3643.s.sol` و`script/DeployVaults.s.sol` بالطريقة نفسها. متغيرات البيئة الاختيارية: `CMTAT_ADMIN` و`CMTAT_NAME` و`CMTAT_SYMBOL` و`CMTAT_TOKEN_ID` و`CMTAT_TERMS_URI` و`TREX_AGENT` و`TREX_SALT` و`VAULT_ASSET` و`VAULT_GUARD`.

### قبل البث على شبكة الاختبار {#before-broadcast}

1. استخدم حساباً على شبكة الاختبار تتحكم به، وفيه قليل من QOR شبكة الاختبار (راجع [الصنبور (Faucet)](/dashboard/faucet)). لا تستخدم أبداً عبارة استرجاع من الشبكة الرئيسية، ولا تموّل أبداً العبارة التجريبية العامة المستخدمة في الأمثلة.
2. سجّل مفتاح ML-DSA-87 الخاص به مع إثبات الحيازة (يسجّل المثال `examples/register-and-send` من [QoreSign](/qoresign/overview) مفتاحاً).
3. افتح نافذة تفويض EVM بالإعدادات الواردة في [إرسال معاملة EVM](#native-prerequisites)، مع `allowed_targets` فارغة. يبني [QoreChain SDK](/sdk/overview) الرسالة (`openEvmWindow` في مجموعة الرسائل `pqc` في TypeScript، و`qorsdk.msg.pqc.open_evm_window` في Python) ويقرأ النافذة (`fetchEvmWindow` و`get_evm_window`).
4. شغّل السكربت بـ `--broadcast` وإعداد محفظتك.
5. أعفِ كل عقد يجب أن يحتفظ بالرمز (الخزائن وحسابات الضمان) بـ `guard.setExempt`، وسجّل الحاملين في امتثال الرمز نفسه، وافحص كل حامل بـ `guard.isHybridHolder(address)` قبل الإصدار.

### البدء السريع 3: وحدة تحكم المُصدِر (شبكة الاختبار) {#quickstart-console}

```bash
pnpm install
pnpm --filter @qorechain/issuer-console dev
```

اتصل بمحفظة EIP-6963، وانتقل إلى QoreChain Testnet، ثم أنشئ رمز CMTAT أو افتح رمزاً قائماً بعنوانه. وعلى السلسلة 9801 تعرض وحدة التحكم تحذيراً وتعطّل إنشاء الرموز. ولا تسجّل وحدة التحكم مفاتيح ولا تفتح نوافذ؛ فنفّذ الخطوتين 2 و3 أعلاه أولاً.

### البدء السريع 4: البناء على الوحدات المقترحة بـ MockChain (Python، دون اتصال) {#quickstart-python}

من README عميل Python. وإلى أن يصدر إصدار PyPI ثبّت من نسخة مستنسخة (راجع [التثبيت](#install)).

```python
from qorechain_asset_kit import MockChain, MockChainError, asset

chain = MockChain()
chain.asset.create_asset(issuer="qor1issuer", asset_id="bond-2030", flags={"freezable": True})
chain.asset.mint(agent="qor1issuer", asset_id="bond-2030", to="qor1alice", amount="100")
chain.asset.freeze(agent="qor1issuer", asset_id="bond-2030", holder="qor1alice", frozen=True)
try:
    chain.asset.transfer(from_="qor1alice", asset_id="bond-2030", to="qor1bob", amount="1")
except MockChainError as e:
    print(e.code)  # ERROR_CODE_ADDRESS_FROZEN
```

الناتج الملاحَظ: `ERROR_CODE_ADDRESS_FROZEN`. أما الاستدعاء نفسه على `ChainClient()` فيرفع `ChainUpgradeRequired` مع `module == "x/asset"` و`code == "CHAIN_UPGRADE_REQUIRED"`.

### البدء السريع 5: الشيء نفسه بلغة Go (وكيل الوحدات v0.1.0) {#quickstart-go}

من README عميل Go، ملفوفاً في حزمة `main`.

```go
package main

import (
	"context"
	"errors"
	"fmt"

	assetkit "github.com/qorechain/qorechain-asset-kit/clients/go"
	assetv1 "github.com/qorechain/qorechain-asset-kit/clients/go/gen/qorechain/asset/v1"
)

func main() {
	ctx := context.Background()
	chain := assetkit.NewMockChain()
	_, err := chain.Asset().CreateAsset(ctx, &assetv1.MsgCreateAsset{
		Issuer: "qor1issuer", AssetId: "bond-2030", Flags: &assetv1.RwaFlagsV0{Freezable: true},
	})
	_, err = chain.Asset().Mint(ctx, &assetv1.MsgMint{Agent: "qor1issuer", AssetId: "bond-2030", To: "qor1alice", Amount: "100"})
	fmt.Println("mock mint error:", err)

	_, err = assetkit.NewChainClient().Asset().Mint(ctx, &assetv1.MsgMint{})
	var upgrade *assetkit.ChainUpgradeRequired
	fmt.Println(errors.As(err, &upgrade), upgrade.Module)
}
```

الناتج الملاحَظ: `mock mint error: <nil>` ثم `true x/asset`. ويحتوي README عميل Java على المثال المكافئ بـ `MockChain` و`MsgCreateAsset.newBuilder()` و`MockChainError.code()`.

:::note
يحتوي README عميلَي Go وTypeScript في المستودع على أخطاء صغيرة في مقاطعهما، ستُصحَّح في 0.1.1. ومثال Go أعلاه هو النسخة المصحَّحة.
:::

## واجهة البرمجة الرئيسية {#main-api}

### العقود {#api-contracts}

| الاسم | ما يفعله |
|---|---|
| `QoreChainHybridHolderGuard(initialOwner)` | ضابط فوق `0x0A02`: `isHybridHolder` و`isEligible` و`requireHybridHolder` (يتراجع بالخطأ `HybridKeyRequired`) و`keyStatus` و`decodeKeyStatus` و`precompileActive` و`setExempt` و`exempt` |
| `QoreChainHybridHolderRule(guard)` | قاعدة CMTAT: `detectTransferRestriction` و`detectTransferRestrictionFrom` و`canTransfer` و`canTransferFrom` و`messageForTransferRestriction` و`canReturnTransferRestrictionCode`؛ الرموز `CODE_FROM_NOT_HYBRID` (60) و`CODE_TO_NOT_HYBRID` (61) و`CODE_SPENDER_NOT_HYBRID` (62) |
| `QoreChainHybridHolderModule(guard)` | وحدة ERC-3643: `moduleCheck` و`bindCompliance` و`unbindCompliance` و`isComplianceBound` و`isPlugAndPlay` و`name` |
| `QoreChainRwaVault(asset, name, symbol, eligibility)` | خزنة ERC-4626 بحصص مقيَّدة |
| `QoreChainRwaAsyncVault(asset, name, symbol, eligibility, admin)` | خزنة ERC-7540: `requestDeposit` و`fulfillDeposit` و`requestRedeem` و`fulfillRedeem` و`pendingDepositRequest` و`claimableDepositRequest` و`pendingRedeemRequest` و`claimableRedeemRequest` و`setOperator`، و`deposit` و`mint` و`redeem` و`withdraw` مع متحكّم؛ `FULFILLER_ROLE`؛ وتتراجع المعاينات (previews) عمداً |
| `IHolderEligibility` | `isEligible(address)`: لتوصيل سياسة أهلية أخرى للخزائن |
| `IERC7518` | رسم أولي لواجهة الأقسام |
| `forge script script/DeployCmtat.s.sol` | الضابط والقاعدة ورمز CMTAT |
| `forge script script/erc3643/DeployErc3643.s.sol` | بنية T-REX التحتية والضابط والوحدة ومجموعة رمز واحدة |
| `forge script script/DeployVaults.s.sol` | الخزنتان فوق رمز مقيَّد، مع إعفاءات الضابط |

### العملاء (مقترح) {#api-clients}

تظهر أسماء TypeScript وJava؛ وتستخدم Python الصيغة snake_case (`create_asset`)، وتستخدم Go الحالة الخاصة بها خلف دوال الوصول (`chain.Asset().CreateAsset(ctx, msg)`).

| الاسم | ما يفعله |
|---|---|
| `ChainClient` (في Go `NewChainClient()`) | يفشل كل استدعاء بالخطأ `ChainUpgradeRequired`؛ دون طلب شبكة |
| `MockChain` (في Go `NewMockChain()`) | القواعد المقترحة داخل الذاكرة؛ وتُطلق الرفوض `MockChainError` |
| `asset` | `createAsset` و`updateFlags` و`setRole` و`proposeIssuer` و`acceptIssuer` و`authorizeHolder` و`mint` و`burn` و`transfer` و`freeze` و`freezePartial` و`pause` و`clawback` و`forceTransfer` و`setTerms` و`retire`؛ والاستعلامات `asset` و`assets` و`holder` و`holders` و`roles` و`canTransfer` و`params` |
| `identity` | `registerIdentity` و`updateCountry` و`bindAddress` و`unbindAddress` و`addClaim` و`revokeClaim` و`removeIdentity` و`setClaimIssuer`؛ والاستعلامات `identity` و`identityByAddress` و`claimIssuers` و`isVerified` |
| `compliance` | `registerModule` و`setModuleStatus` و`bindModule` و`unbindModule` و`migrateBinding`؛ والاستعلامات `modules` و`module` و`bindings` و`check` |
| `settlement` | `createVenue` و`createInstruction` و`affirm` و`withdrawAffirmation` و`executeInstruction` و`cancelInstruction`؛ والاستعلامات `instruction` و`instructionsByParty` و`venue` |
| `attest` | `setAttester` و`submit` و`revoke`؛ والاستعلامات `latest` و`history` و`attesters` |
| مساعدات المحاكاة | `setHybridKey` و`fundBank` و`bankBalance` و`advance(blocks, seconds)` و`events(type)` و`defineModuleLogic(moduleId, fn)` (وفي Python أيضاً `has_hybrid_key` و`height` و`time`) |

## طريقة الوصول {#how-to-access}

| | شبكة الاختبار `qorechain-diana` | الشبكة الرئيسية `qorechain-vladi` |
|---|---|---|
| معرّف سلسلة EVM | 9800 | 9801 |
| EVM RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| المُسبَق `pqcKeyStatus` عند `0x0A02` | فعّال | غير فعّال (تعيد `eth_call` بيانات فارغة)؛ وتفعيله يحتاج قرار حوكمة، ولم يُتخذ أي قرار |
| الضابط والقاعدة والوحدة الهجينة للحامل | تعمل | تفشل مغلقة: كل عنوان غير مُعفى غير مؤهل، فلا تنتقل الرموز بين الحاملين العاديين |
| سكربتات النشر | تشغيل تجريبي وبث | ترفض العمل |
| وحدة تحكم المُصدِر | كاملة | تحذير؛ وإنشاء الرموز معطَّل |
| الوحدات الأصلية (`x/asset` وغيرها) | غير موجودة | غير موجودة |

متطلبات أي شيء يرسل معاملة EVM: حساب له مفتاح ML-DSA-87 مسجَّل (مع إثبات حيازة) ونافذة تفويض EVM مفتوحة، وكلاهما يُعدّ على مسار Native بمعاملة موقّعة هجيناً. والقراءات (`eth_call` والسجلات وتقدير الغاز والتشغيلات التجريبية) لا تحتاج أياً منهما. و`MockChain` واختبارات Foundry لا تحتاج شبكة إطلاقاً. نقاط النهاية الأخرى والصنبور: [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) و[الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet).

سلوك الشبكة الذي يجب وضعه في الحسبان: `PREVRANDAO` ثابت (ولا يستخدمه أي عقد في المجموعة)؛ ومعاملات blob (النوع 3) مرفوضة، والأنواع 0 و1 و2 و4 مقبولة؛ وتفويضات EIP-7702 تحتاج إلى موافقة صاحب التفويض نفسه ما بعد الكمّية (`MsgAuthorizeEVMDelegation`).

## أين يُنشر {#where-published}

جرى التحقق الحي في 28 أكتوبر 2026 (إصدار GitHub وMaven Central ووكيل Go تقدّم 0.1.0؛ وتعيد PyPI وnpm الخطأ 404).

| السجل | الحزمة | الإصدار | الرابط |
|---|---|---|---|
| Maven Central | `io.github.qorechain:asset-kit` | 0.1.0 | https://central.sonatype.com/artifact/io.github.qorechain/asset-kit |
| وكيل وحدات Go | `github.com/qorechain/qorechain-asset-kit/clients/go` | v0.1.0 (الوسم `clients/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-asset-kit/clients/go |
| PyPI | `qorechain-asset-kit` | **قريباً** (ليست على PyPI بعد) | |
| npm | `@qorechain/asset-kit` | **قريباً** (غير منشورة) | |
| GitHub (عقود Solidity ووحدة تحكم المُصدِر وملفات proto والمستندات والقوالب القانونية) | `qorechain/qorechain-asset-kit` | الإصدار v0.1.0 | https://github.com/qorechain/qorechain-asset-kit/releases/tag/v0.1.0 |

المستودع: https://github.com/qorechain/qorechain-asset-kit. الجهة الصائنة: جمعية QoreChain.

**الرخص.** الشيفرة بموجب Apache-2.0، باستثناء `contracts/script/erc3643/` و`contracts/test/erc3643/` اللذين يُترجمان مع التنفيذ المرجعي لـ ERC-3643 وهما بموجب GPL-3.0-or-later. والتوثيق في `docs/` و`legal/` بموجب Apache-2.0. وتحتفظ الاعتمادات برخصها وتُستخدم دون تعديل بوصفها git submodules: T-REX وONCHAINID (GPL-3.0) وCMTAT (MPL-2.0) وOpenZeppelin (MIT). ورمز ERC-3643 المنشور هو شيفرة T-REX بموجب رخصتها؛ ورمز CMTAT المنشور بموجب MPL-2.0. ويسرد الملف `NOTICE` كل اعتماد.

## الحدود والمشكلات المعروفة {#limits}

- **الوحدات الأصلية غير موجودة.** `x/asset` و`x/identity` و`x/compliance` و`x/settlement` و`x/attest` مقترح. ولا توجد ترقية مجدولة تضيفها. ولا يمكن لـ `ChainClient` أن ينجح في 0.1.0؛ و`MockChain` أداة تطوير، وليست سلسلة.
- **فحص الحامل لشبكة الاختبار فقط.** على الشبكة الرئيسية يفشل الضابط مغلقاً؛ ولا يمكن لنشر على الشبكة الرئيسية الاعتماد عليه.
- **صلاحيات الوكيل تتجاوز فحص الحامل.** في المعيارين كليهما، لا يستشير التحويل القسري واسترداد المحفظة بواسطة وكيل القاعدة أو الوحدة: فـ `forcedTransfer` في CMTAT و`forcedTransfer` و`recoveryAddress` في ERC-3643 يمكنها وضع رموز على عنوان لا مفتاح له. قيّد من يحمل أدوار الوكيل.
- **منفِقو `transferFrom` في ERC-3643 لا تفحصهم** الوحدة، لأن ERC-3643 لا يمرّر المنفِق إلى الامتثال. أما قاعدة CMTAT فتفحص المنفِق.
- **الحرق والاسترداد يبقيان مفتوحين** للحاملين الذين فقدوا أهليتهم، عن قصد، في معياري الرموز وفي الخزنتين.
- **لا يمكن إلغاء طلبات ERC-7540 المعلّقة** في 0.1.0. وإذا نقل وكيل أصولاً خارج الخزنة غير المتزامنة، تقرأ `totalAssets` صفراً وتفشل المطالبات التي تحتاج إلى الأصول الناقصة إلى أن يعيد المُصدِر الرصيد.
- **لا مدخل تقييم خارجي** في خزنة ERC-7540؛ ويستخدم التحويل رصيد الخزنة نفسها لكل حصة.
- **لا تسليم مقابل دفع ولا إفادات على EVM.** وهي موجودة فقط في `x/settlement` و`x/attest` المقترحتين.
- **ERC-7518 رسم أولي لواجهة**، وليس تنفيذاً. ويمكن اليوم نمذجة الأقسام برمز واحد لكل فئة أو شريحة يتشاركان سجل هوية أو قاعدة واحدة.
- **CMTA RuleEngine v3** لا يزال منشوراً كمرشحات إصدار (release candidates)؛ وتعمل القاعدة بوصفها `ruleEngine` للرمز مباشرة وتعلن عن معرّفَي واجهة القاعدة كليهما (`0x2497d6cb` و`0xb1a69752`).
- **وحدة تحكم المُصدِر** لا تسجّل مفاتيح، ولا تفتح نوافذ، ولا تنشر مجموعات ERC-3643 أو خزائن، ولا تدير أدوار CMTAT أو التجميد الجزئي أو المستندات أو اللقطات.
- **Python وTypeScript ليستا على سجلّيهما.** استخدم نسخة مستنسخة إلى أن يصدر إصدارا PyPI وnpm؛ ولا تقدّم هذه الصفحة أمر تثبيت من سجل لهما.
- **أخطاء في README.** لمقاطع Go وTypeScript في ملفات README بالمستودع أخطاء صغيرة، ستُصحَّح في 0.1.1. استخدم البدايات السريعة في هذه الصفحة.
- **القوالب القانونية.** يضم `legal/` ثلاث مسودات للنقاش: ورقة مالية قائمة على السجل في سويسرا (المواد 973d إلى 973i من قانون الالتزامات)، وشروط رموز في ليختنشتاين بموجب TVTG (نهج "token container")، ومخطط ارتباط لمشغّل بموجب نظام DLT التجريبي للاتحاد الأوروبي (اللائحة (EU) 2022/858). لم يراجعها محامٍ، وهي ليست استشارة قانونية، ويجب أن يراجعها محامٍ مؤهل في الولاية القضائية المعنية قبل أي استخدام. واستخدامها، أو استخدام المجموعة، لا يدل على شيء بشأن ما إذا كان إصدار معيّن يستوفي أي متطلب قانوني. ولا تعمل جمعية QoreChain مُصدِراً ولا أمين سجل ولا جهة حفظ ولا منصة ولا مستشاراً قانونياً لأي أصل.
- **ما قبل 1.0.** قد تتغير ملفات proto المقترحة في أي إصدار فرعي.

## ملاحظات الأمان {#security}

- **لم تُدقَّق.** لم تخضع العقود لأي مراجعة مستقلة. لا تستخدمها لحيازة قيمة حقيقية دون مراجعة.
- تبقى المفاتيح عند أصحابها: يقرأ الضابط حالة المفتاح العام من السلسلة ولا يتعامل مع مفتاح خاص أبداً. مفاتيح المُنشِر والمالك والوكيل حسابات EVM عادية لها مفاتيح ML-DSA-87 مسجَّلة؛ فأبقِ أدوار المُصدِر ومالك الضابط والوكيل على حسابات منفصلة ومحمية جيداً.
- يتحكم مالك الضابط بالإعفاءات. والإعفاء يجعل العنوان مؤهلاً دون مفتاح؛ فامنحه للعقود التي تحتفظ بالأصل بحكم تصميمها، وراقب أحداث `ExemptionSet`.
- يمكن لأدوار الوكيل أن تتجاوز فحص الحامل (التحويل القسري، والاسترداد). عاملها بوصفها أكثر أدوار الرمز حساسية.
- يفشل الضابط مغلقاً ويفك ترميز إجابة المُسبَق بصرامة؛ ولا يعدّ أبداً مفتاحاً بلا إثبات حيازة صالحاً.
- تضبط النسخة الإنتاجية من وحدة تحكم المُصدِر Content-Security-Policy بالقيمة `connect-src 'none'`: فالصفحة لا ترسل أي طلب شبكة من تلقاء نفسها، ويمر كل شيء عبر المحفظة.
- يثق `MockChain` بحقول الموقّع في الرسائل (لا توجد توقيعات)؛ وهو ليس حداً أمنياً.
- ينبغي أيضاً إرسال المشكلات في CMTAT أو التنفيذ المرجعي لـ ERC-3643 أو ONCHAINID أو OpenZeppelin إلى القائمين عليها.
- أبلغ عن الثغرات في المجموعة سراً إلى security@qore.network.

## صفحات ذات صلة {#related}

- [QoreChain SDK](/sdk/overview): تسجيل مفتاح ML-DSA-87 وفتح نافذة تفويض EVM (`openEvmWindow` و`fetchEvmWindow` و`get_evm_window`).
- [QoreSign](/qoresign/overview): التوقيع الهجين لمعاملات مسار Native التي تسجّل المفاتيح وتفتح النوافذ.
- [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing) و[الحسابات والتوقيع PQC](/sdk/concepts/accounts-pqc): تسجيل المفاتيح والتوقيع الهجين.
- [تطوير EVM](/developer-guide/evm-development#evm-window): نافذة تفويض EVM.
- [مُسبَقات EVM](/developer-guide/evm-precompiles): `0x0A01` و`0x0A02`، فعّالان على شبكة الاختبار فقط.
- [Chain developer kit](/developer-tools/chain-dev-sdk): قوالب Foundry وHardhat وviem ومساعدات النوافذ (SDK 0.11.0، قريباً).
- [Custody kit](/developer-tools/custody-kit) و[QoreScan](/developer-tools/qorescan): مجموعتان مجاورتان لجهات الحفظ ولجرد التشفير.
- [حزم المطورين](/developer-tools/overview): كل حزمة وحالتها في السجل.
- المعايير الأصلية: ERC-3643 وCMTAT وERC-4626 وERC-7540 وERC-7518.
