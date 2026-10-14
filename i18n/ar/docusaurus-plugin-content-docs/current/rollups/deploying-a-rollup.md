---
slug: /rollups/deploying-a-rollup
title: نشر Rollup
sidebar_label: نشر Rollup
sidebar_position: 3
---

# نشر Rollup

يمكنك إعداد rollup مخصص للتطبيقات بثلاث طرق: عبر **لوحة التحكم (Dashboard)** (نموذج طلب، وليس معاملة على السلسلة)، أو عبر **واجهة سطر الأوامر (CLI)** الخاصة بالسلسلة (`qorechaind`، مع تحكم كامل في المعاملة على السلسلة)، أو باستخدام **TypeScript RDK** (‏`@qorechain/rdk` بالإضافة إلى أداة التهيئة `create-qorechain-rollup`)، التي تغطي اليوم التكوين وعمليات القراءة. تغطي هذه الصفحة الطرق الثلاث، بالإضافة إلى دورة حياة المشغّل وأوامر الدفعات.

:::caution قدرة في مرحلة مبكرة
لم يتم إنشاء أي rollup على أي من الشبكتين حتى الآن. تستخدم الأوامر أدناه شبكة الاختبار **`qorechain-diana`** (معرّف سلسلة EVM **9800**، إصدار السلسلة **v3.2.2**). تعمل الشبكة الرئيسية (**`qorechain-vladi`**، معرّف سلسلة EVM **9801**) على إصدار السلسلة **v3.2.1**؛ وتصف هذه الصفحة سلوك الشبكة الرئيسية، وقد يختلف إصدار شبكة الاختبار الأحدث في بعض التفاصيل. تحقق من كل عملية نشر على شبكة الاختبار أولاً.
:::

:::note الرسوم والتوقيع
تفرض الشبكة حدًا أدنى لسعر الغاز قدره `0.1uqor`، لذا يُرفض الأمر المجرّد `--fees 500uqor`، وتحتاج كل معاملة على المسار الأصلي إلى التوقيع المشترك الهجين ما بعد الكمّي. ولهذا تبني أمثلة CLI في هذه الصفحة المعاملة باستخدام `--generate-only` وتوقّعها توقيعًا مشتركًا عبر `qorechaind tx pqc cosign`، الذي يوقّعها ويبثّها (أنشئ المفتاح مرة واحدة عبر `qorechaind tx pqc gen-key`، وسجّله على السلسلة مرة واحدة عبر `qorechaind tx pqc register-key`، أو عبر QoreX أو SDK اللذين يتوليان ذلك عنك). تُثبَّت الرسوم عند توليد الملف غير الموقَّع، لذا اضبط حد الغاز والرسوم معًا: يجب ألا تقل الرسوم عن حد الغاز × 0.1 uqor. حدود الغاز أدناه إرشادية — قم بالمحاكاة قبل الاعتماد عليها. راجع [أول معاملة](/getting-started/first-transaction) و[التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing).
:::

---

## المتطلبات

| المتطلب | التفاصيل |
| ----------- | ------- |
| **الحد الأدنى للحصة (stake)** | ما لا يقل عن 10,000 QOR (‏`min_stake_for_rollup`)؛ تُحجز الحصة في الضمان عند إنشاء الـ rollup |
| **حرق الإنشاء** | يُحرق 1 % من الحصة التي تقدّمها نهائيًا عند الإنشاء (يُرفض أي إنشاء لا يمكن تطبيق الحرق عليه)؛ ويُحتفظ بالباقي في الضمان ويُعاد عند إيقاف الـ rollup |
| **حصة تسجيل الطبقة (layer)** | يسجّل الإنشاء أيضًا طبقة الـ rollup في وحدة multilayer، مما يحجز **1,000 QOR** إضافية (‏`min_sidechain_stake`) من المنشئ، وتُعاد عند إخراج الطبقة من الخدمة عند الإيقاف. إذا تعذّر تسجيل الطبقة (الرصيد غير كافٍ، أو بلوغ حد السلاسل الجانبية في multilayer وهو 10) يُنشأ الـ rollup مع ذلك لكن دون طبقة، فلا يمكن تثبيت دفعاته |
| **معرّف الـ rollup** | استخدم من 3 إلى 64 حرفًا: أحرف إنجليزية صغيرة وأرقام و`.` و`_` و`-`، على أن يبدأ بحرف أو رقم. تفرض إصدارات السلسلة الأحدث هذه القاعدة، لذا التزم بها من البداية |
| **الحساب** | حساب QoreChain ممول وله مفتاح مسجّل ما بعد كمّي، برصيد كافٍ للحصة وحصة الطبقة ورسوم المعاملات |

استعلم عن معاملات الوحدة الحية لمعرفة الحد الأدنى الحالي للحصة ومعدل الحرق قبل النشر:

```bash
qorechaind query rdk config
```

---

## النشر عبر لوحة التحكم (Tools → Rollups)

توفر لوحة التحكم نموذج **Deploy a Rollup** ضمن **Tools → Rollups**. وهو **نموذج طلب**: يؤدي إرساله إلى تسجيل طلب تزويد لحسابك، تراجعه **The Qore Trust**، ويعرض الطلب الجديد حالة **provisioning**. وهو **لا** يبثّ معاملة `create-rollup` على السلسلة — لتسجيل rollup على السلسلة، استخدم واجهة سطر الأوامر أدناه.

### الخطوات

1. **سجّل الدخول.** يتطلب النموذج جلسة مصادَق عليها لإرسال طلب ولعرض طلباتك الحالية.
2. **سمِّ الـ rollup الخاص بك.** أدخل اسمًا للـ rollup (من 2 إلى 41 حرفًا: حروف، أرقام، مسافات، شرطات، أو شرطات سفلية).
3. **اختر آلة افتراضية.** يخزّن السجل على السلسلة تسمية للآلة الافتراضية. يُنفَّذ الـ rollup الخاص بك خارج السلسلة في بيئة تشغيل خاصة به؛ ولا يعمل الاختيار على مسارات EVM أو CosmWasm أو SVM الخاصة بـ QoreChain نفسها:
   * **EVM** — عقود Solidity / Vyper مع كامل أدوات Ethereum ‏(Hardhat، Foundry، MetaMask)
   * **CosmWasm** — عقود ذكية بلغة Rust على بيئة تشغيل Cosmos SDK، مع دعم IBC أصلي
   * **SVM** — آلة Solana الافتراضية، للتطبيقات ذات التنفيذ المتوازي والإنتاجية العالية
4. **اختر طبقة توفر البيانات (DA).** المكان الذي ينشر فيه الـ rollup بيانات المعاملات بحيث يمكن لأي شخص إعادة بناء الحالة: **QoreChain DA** أو **Celestia** أو **EigenDA**. لاحظ أن EigenDA خيار على مستوى لوحة التحكم، بينما خلفيات DA الخاصة بوحدة `x/rdk` على السلسلة هي: الأصلية (native)، أو Celestia، أو كلاهما — راجع [توفر البيانات](/rollups/data-availability).
5. **حدد عملة الغاز.** العملة المستخدمة لدفع تكاليف التنفيذ على الـ rollup الخاص بك. القيمة الافتراضية هي **QOR**؛ أدخل رمزًا مخصصًا لاستخدام عملتك الأصلية الخاصة.
6. **اختر المُرتِّب (sequencer).** الجهة التي ترتّب المعاملات قبل التسوية: **مرتِّب مشترك** (المجموعة المشتركة لـ QoreChain)، أو **مخصص (فردي)** (تشغيل مرتِّب فردي خاص بك)، أو **لامركزي** (مجموعة مرتِّبات بلا إذن مسبق).
7. **اختر هدف التسوية.** المكان الذي يثبّت فيه الـ rollup جذور حالته وبراهين صحته: **الشبكة الرئيسية لـ QoreChain** أو **Ethereum**.
8. **أرسل الطلب.** تتم مراجعة التزويد من قِبل **The Qore Trust**، لذا يظهر الطلب المرسل حديثًا بحالة **provisioning** حتى اكتمال المراجعة.

تظهر الطلبات التي أرسلتها في قائمة **Your rollups** مع الآلة الافتراضية، وطبقة DA، وعملة الغاز، والمرتِّب، وهدف التسوية، والحالة الحالية.

:::note
تصف خيارات النموذج (الآلة الافتراضية، وطبقة توفر البيانات، وعملة الغاز، والمرتِّب، وهدف التسوية) ما تطلبه؛ وهي أوسع مما تدعمه وحدة `x/rdk` على السلسلة حاليًا. على السلسلة، يكون توفر البيانات `native` (‏Celestia غير نشط)، ويتم الترتيب بواسطة منشئ الـ rollup أو عنوان مرتِّب مهيَّأ. راجع [توفر البيانات](/rollups/data-availability).
:::

---

## النشر عبر واجهة سطر الأوامر (CLI)

تنشئ واجهة سطر الأوامر الـ rollup مباشرة على السلسلة. يأخذ الأمر `create-rollup` ثلاث وسائط موضعية — معرّف الـ rollup، وملف تعريف (profile)، ومقدار الحصة (بوحدة `uqor`) — بالإضافة إلى علم اختياري `--vm`.

:::tip
اعتبارًا من إصدار السلسلة **v3.1.74**، يقوم `create-rollup` **بتطبيق الإعداد المسبق لملف التعريف المختار تلقائيًا** — إذ تؤخذ جميع إعدادات وضع التسوية والمرتِّب وDA ونموذج الغاز والآلة الافتراضية من الإعداد المسبق. لم تعد بحاجة إلى ضبطها يدويًا (سابقًا كانت الرسالة تفرض تكوينًا سياديًا مثبتًا). العلم `--vm` أصبح الآن **فارغًا افتراضيًا**، لذا تُطبَّق الآلة الافتراضية لملف التعريف ما لم تتجاوزها صراحة.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json
```

**مثال** — إنشاء rollup من الإعداد المسبق `defi` (التسوية والمرتِّب وDA والآلة الافتراضية تأتي كلها من الإعداد المسبق؛ يُحلّ `defi` إلى تسوية zk على EVM). ابنِ المعاملة غير الموقَّعة، ثم أرفق التوقيع المشترك ما بعد الكمّي وابثّها:

```bash
# 1. Build the unsigned transaction (10,000 QOR stake)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json

# 2. Cosign with your post-quantum key and broadcast
qorechaind tx pqc cosign create-rollup.json \
  --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

يُقبل ملف تعريف ZK مثل `defi` عند الإنشاء، لكن الـ rollup المنشأ بهذه الطريقة لا يحمل مفتاح تحقق (verifying key)، لذا لا يمكن إنهاء دفعات ZK الخاصة به بعد (راجع [ZK / STARK والسحوبات](/rollups/zk-stark-withdrawals)).

**الأعلام:**

| العلم | القيمة الافتراضية | الوصف |
| ---- | ------- | ----------- |
| `--vm` | *(فارغ — استخدام الآلة الافتراضية لملف التعريف)* | تجاوز نوع الآلة الافتراضية للـ rollup: ‏`evm` أو `cosmwasm` أو `svm` أو `custom`. اتركه دون ضبط لتطبيق الآلة الافتراضية للإعداد المسبق. (في عملاء RDK، بيئة تشغيل Wasm هي نوع الآلة الافتراضية **`native`** — QoreChain Native — مع الإبقاء على `cosmwasm` كاسم بديل قديم؛ و`cosmwasm` هي القيمة المرسلة على الشبكة، وهي ما يقبله هذا العلم على مستوى السلسلة.) |

:::note تسمية الآلة الافتراضية هي بيانات وصفية
يسجّل `--vm` بيئة التشغيل التي يستخدمها الـ rollup الخاص بك. تقوم السلسلة المضيفة بتسوية الـ rollup فقط؛ ولا تنفّذ عقوده. رفع CosmWasm على السلسلة المضيفة نفسها مغلق حاليًا، ومسار معاملات SVM فيها معطّل على مستوى الشبكة، وهذا لا يؤثر في تسوية rollup خارج السلسلة، لكنه يعني أنه لا يمكنك نشر عقود لـ rollup على مساري السلسلة المضيفة هذين.
:::

الوسيط `[profile]` يحدد تكوينًا مسبقًا يُطبَّق تلقائيًا — راجع **[ملفات التعريف المسبقة](/rollups/preset-profiles)**. والوسيط `[stake-amount]` هو الضمان بوحدة `uqor`؛ وحرق الإنشاء هو 1 % منه.

### افحص ما نشرته

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## النشر باستخدام TypeScript RDK ‏(`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

تُشحن حزمة تطوير الـ Rollup على شكل حزمتي npm عامتين لوحدة `x/rdk` نفسها على السلسلة التي تتعامل معها واجهة سطر الأوامر. هما أنفع اليوم لبناء التكوينات والتحقق منها ولقراءة الحالة؛ راجع تحذير التوقيع أدناه قبل الاعتماد عليهما لإرسال المعاملات:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** ‏(`v0.4.4`) — حزمة TypeScript SDK: منشئ تكوين مع ملفات تعريف مسبقة، ومساعدات معاملات لدورتي حياة الـ rollup ودفعات التسوية، وDA أصلي، وعملاء قراءة منمّطون، وإضافات الإصدار v0.4 — إيصالات تسوية آمنة كموميًا، ومساعد QCAI Rollup Copilot، ومساعدات calldata عبر الآلات الافتراضية، وبرج المراقبة (watchtower).
* **`create-qorechain-rollup`** ‏(`v0.4.4`) — أداة تهيئة تستنسخ قالب بداية قابلاً للتشغيل لكل ملف تعريف (بما في ذلك قالب `multivm-rollup`).

هذه الحزم منشورة على npm. يشحن المستودع أيضًا واجهة سطر أوامر منشورة للمشغّلين، **`@qorechain/rdk-cli`** ‏(`qorollup`، ‏`v0.4.4`)، مع أوامر `doctor` و`create` و`status` و`watch` و`params` و`suggest` وأوامر دورة الحياة (`pause`/`resume`/`stop`) و`keygen` و`manifest` و`withdraw` و`faucet`، بالإضافة إلى أوامر الإصدار v0.4: ‏`receipt` و`advise` و`watchtower`.

أبرز المستجدات منذ الإصدار الأولي v0.4.0:

* **v0.4.2 — يعمل مع الشبكة الحية مباشرة دون إعداد.** أصبحت الإعدادات المسبقة `mainnet` و`testnet` تتضمن نقاط الوصول العامة `qore.host` ‏(REST على `api.qore.host` / `api-testnet.qore.host`)، لذا يصل `createRdkClient({ network })` إلى السلسلة دون تحديد `endpoints` يدويًا — تجاوزها فقط لاستهداف عقدتك الخاصة. أعاد الإصدار نفسه تسمية معرّف الآلة الافتراضية لـ rollup من نوع Wasm إلى **`native`** ‏(QoreChain Native)؛ ويبقى `cosmwasm` اسمًا بديلًا قديمًا مقبولًا، وكلاهما يُترجم إلى `cosmwasm` على الشبكة — دون أي تغيير في السلسلة أو المستكشف أو لوحة التحكم.
* **v0.4.3 — تحديث للاعتماديات لإصلاح ترميز التوقيع الهجين في SDK.** ما زال عميل المعاملات في RDK نفسه يوقّع توقيعًا كلاسيكيًا فقط (انظر التحذير أدناه).
* **v0.4.4 — يتتبع `@qorechain/sdk` ‏`^0.7.0`**، وهو إصدار SDK الخاص بمسارات المصادِقات (authenticator lanes) في إصدار السلسلة **v3.1.85**، بحيث تصل تلك القدرات إلى مستخدمي TypeScript في RDK مباشرة عبر SDK. لا يوجد تغيير في واجهة برمجة RDK.

:::caution التوقيع مع العملاء المنشورين
تتطلب الشبكتان توقيعًا هجينًا (secp256k1 + ML-DSA-87) على كل معاملة في المسار الأصلي. حزمة npm المنشورة حاليًا (`@qorechain/rdk` 0.4.4) توقّع عبر عميل كلاسيكي فقط، لذا يمكنها **قراءة** حالة السلسلة لكنها لا تستطيع جعل أي معاملة مقبولة. لإرسال المعاملات اليوم، ابنِ ووقّع باستخدام CLI (‏`--generate-only`، ثم `qorechaind tx pqc cosign`) أو باستخدام التوقيع الهجين في [`@qorechain/sdk`](/sdk/overview). كما أن عملاء RDK بلغات Python وGo وRust وJava يوقّعون توقيعًا كلاسيكيًا فقط و**لا يصلحون للمعاملات** على هاتين الشبكتين. تحقق من الإصدار الذي تثبّته؛ وستُذكر هنا الإصدارات التي تضيف التوقيع الهجين إلى عملاء RDK.
:::

:::note عمليات القراءة تحتاج إلى مسارات REST الخاصة بـ RDK
تستدعي مساعدات القراءة في TypeScript (`rdk.params()` و`rdk.rest.getRollup()`) مسارات REST من النوع `/qorechain/rdk/v1/…`، التي لا تقدّمها نقاط الوصول العامة للشبكة الرئيسية حاليًا. على الشبكة الرئيسية استخدم `qorechaind query rdk …` (‏gRPC).
:::

#### عملاء Python وGo وRust وJava

إلى جانب حزمة TypeScript، توفر RDK عملاء كاملين بلغات **Python** و**Go** و**Rust** و**Java** يعكسون واجهة TypeScript: منشئ التكوين مع التحقق، وملفات التعريف المسبقة الخمسة، وأدوات denom/الاقتصاديات/bech32، ومساعدات Merkle الثنائية وبراهين السحب، وبيانات manifest للـ rollup، وعملاء قراءة عبر REST وواجهة `qor_` JSON-RPC، وفحوصات الجاهزية والصحة، والحسابات (عبارة استرداد → عنوان `qor`)، وتوقيع المعاملات الكلاسيكي + البث (‏`SIGN_MODE_DIRECT`، وهو غير مقبول على الشبكات ذات التوقيع الهجين — راجع التحذير أعلاه). جميعها متحقق منها مقابل متجهات ذهبية مشتركة عبر اللغات وجميعها **منشورة** في سجلاتها:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.4
```

```python
import qorrdk
```

الإصدارات المنشورة حاليًا: Python ‏`qorechain-rdk` ‏**0.5.0** ‏(PyPI، الاستيراد باسم `qorrdk`)، ووحدة Go ‏`github.com/qorechain/qorechain-rdk/packages/go` ‏(**v0.5.0**)، وRust ‏`qorechain-rdk` ‏**0.4.4** ‏(crates.io)، وJava ‏`io.github.qorechain:qorechain-rdk` ‏**0.4.4** ‏(Maven Central). تقرأ هذه العملاء حالة السلسلة؛ ولا تُنتج التوقيع الهجين الذي تتطلبه الشبكتان (راجع التحذير أعلاه).

:::note
تستهدف TypeScript RDK وقوالبها افتراضيًا شبكة الاختبار **`qorechain-diana`**، ومنذ الإصدار v0.4.2 تصل الإعدادات المسبقة إلى نقاط الوصول العامة الحية مباشرة. ثبّت الإصدارات وتحقق على شبكة الاختبار قبل الشبكة الرئيسية.
:::

### تهيئة مشروع باستخدام `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

لكل ملف تعريف قالب بداية مطابق (`defi-rollup`، ‏`gaming-rollup`، ‏`nft-rollup`، ‏`enterprise-rollup`، ‏`custom-rollup`). هيّئ أحدها بأي من الصيغتين:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

للاستخدام غير التفاعلي / في بيئات CI، مرّر القالب والشبكة صراحة:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

تعرض أداة التهيئة تكلفة الحصة وحرق الإنشاء الموثّقة، والخطوات التالية لإنشاء الـ rollup الخاص بك وقراءة حالته.

:::caution تحقق من إصدار RDK الذي يثبّته القالب
تثبّت القوالب حاليًا `@qorechain/rdk` على سلسلة الإصدارات 0.2. بعد التهيئة، شغّل `npm install @qorechain/rdk@latest` لتحصل على الإعدادات المسبقة لنقاط الوصول العامة `qore.host` وعملاء القراءة الحاليين. نص `submit-batch` في قالب البداية هو تدفق مرجعي فقط: فهو يرسل جذورًا توضيحية وبرهانًا نموذجيًا، ولا يُتوقع أن ينهي دفعة على شبكة حية.
:::

### بناء تكوين rollup من الكود

ابنِ تكوينًا من إعداد مسبق، واقرأ الحصة ومعدل الحرق الحيين من السلسلة، ثم أنتج رسالة الإنشاء. يفرض منشئ التكوين مصفوفة التوافق بين التسوية والبرهان عند استدعاء `validate()` / `build()`. أرسل القيم الناتجة عبر CLI أعلاه (أو عبر عميل يوقّع توقيعًا هجينًا) — راجع تحذير التوقيع.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read: it works where the RDK REST routes are served and
// is refused (HTTP 501) on mainnet today — use `qorechaind query rdk config` there.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// The values to pass to `qorechaind tx rdk create-rollup`.
const msg = config.toCreateMsg("<your qor address>", { stakeAmount: params.minStakeForRollup });
console.log(msg.rollupId, msg.profile, msg.vmType, msg.stakeAmount);
```

لست متأكدًا من ملف التعريف المناسب؟ من المفترض أن يعيد `rdk.suggestProfile(...)` توصية بمساعدة QCAI؛ وعلى نقاط الوصول العامة الحالية يعيد دائمًا الخيار الاحتياطي `defi` (‏`source: "fallback"`)، لذا اختر من [جدول ملفات التعريف](/rollups/preset-profiles).

### قراءة الحالة من الكود

لا يحتاج عميل REST المنمّط إلى موقّع، ويعمل حيثما تُقدَّم مسارات REST الخاصة بـ RDK (وليس على الشبكة الرئيسية اليوم):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

بالنسبة إلى الدفعات، استخدم `qorechaind query rdk batch [rollup-id]` (أدناه).

---

## إدارة دورة الحياة

يمر الـ rollup بالحالات `pending` و`active` و`paused` و`stopped`؛ ويبدأ الـ rollup الجديد بحالة `active` فورًا. لا يستطيع إيقافه مؤقتًا أو استئنافه أو إيقافه نهائيًا سوى المنشئ (يُفرض ذلك منذ إصدار السلسلة v3.2.0). يتبع كل أمر أدناه نمط الخطوتين نفسه الخاص بالإنشاء: توليد المعاملة غير الموقَّعة، ثم توقيعها توقيعًا مشتركًا.

### الإيقاف المؤقت

أوقف الـ rollup مؤقتًا. تُحفظ الحالة ويمكن استئناف الـ rollup. يلزم تقديم نص يوضح السبب.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > pause.json
qorechaind tx pqc cosign pause.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### الاستئناف

استأنف rollup سبق إيقافه مؤقتًا.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > resume.json
qorechaind tx pqc cosign resume.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### الإيقاف النهائي

أوقف الـ rollup نهائيًا وحرر حصته. تُعاد عملات QOR المحجوزة — مطروحًا منها حرق الإنشاء لمرة واحدة — إلى المنشئ. وتُعاد حصة تسجيل الطبقة البالغة 1,000 QOR بشكل منفصل عند إخراج طبقة الـ rollup من الخدمة.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > stop.json
qorechaind tx pqc cosign stop.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

:::danger
إيقاف الـ rollup نهائي. لا يمكن إعادة تشغيل الـ rollup بعد إيقافه.
:::

---

## أوامر المشغّل: الدفعات والاعتراضات

يرسل مشغّلو الـ rollup دفعات التسوية، ويمكن للمعترضين الطعن في الدفعات التفاؤلية. تشكل هذه الأوامر أساس طبقة التسوية الموضحة في **[نظرة عامة على الـ Rollups](/rollups/overview)** و**[ZK / STARK والسحوبات](/rollups/zk-stark-withdrawals)**.

### من يمكنه الإرسال، وبأي ترتيب

* **لا يستطيع إرسال الدفعات سوى عنوان المرتِّب المهيَّأ للـ rollup — أو منشئه عندما لا يكون هناك عنوان مهيَّأ (في كل الإعدادات المسبقة).** لا يقبل الترتيب القائم (based) والمشترك (shared) حتى الآن مجموعات مقترِحين أو قوائم: فهي مجرد تسميات اليوم، والمنشئ هو من يرسل.
* تشكّل الدفعات سلسلة: للدفعة الأولى الفهرس `0`؛ ويجب أن تستخدم كل دفعة لاحقة الفهرس التالي وأن تحمل جذر حالة الدفعة السابقة بوصفه `prev_state_root`.
* تُرفض الدفعة التي تحمل تجزئة بيانات (data hash) على rollup من نوع `native` أو `both` ما لم تكن كتلة بيانات (blob) مطابقة مخزّنة بالفعل (راجع [توفر البيانات](/rollups/data-availability)). ولا تُفحص الدفعة التي لا تحمل تجزئة بيانات.
* يجب على rollup من نوع `zk` إرفاق برهان، ويجب أن يجتاز البرهان التحقق (راجع [ZK / STARK والسحوبات](/rollups/zk-stark-withdrawals)).

### إرسال دفعة

أرسل دفعة تسوية لـ rollup. يأخذ الأمر معرّف الـ rollup، ورقم فهرس الدفعة، وجذر حالة مرمّزًا بالنظام الست عشري.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

يأخذ أمر CLI هذه الوسائط الموضعية الثلاث فقط، لذا لا يستطيع إرسال سوى **الدفعة 0**؛ أما الدفعات اللاحقة فتحتاج إلى عميل قادر على ضبط `prev_state_root` (وعند الاستخدام: `data_hash` و`withdrawals_root` و`tx_count`). تُسوّى دفعات الـ rollup لكنها **لا تُثبَّت** في `x/multilayer` على الشبكة الرئيسية اليوم (راجع [Rollup Development Kit](/architecture/rollup-development-kit#state-anchoring)).

### الاعتراض على دفعة (الـ rollups التفاؤلية) {#challenge-a-batch-optimistic-rollups}

يمكن لأي حساب الاعتراض على دفعة بحالة `submitted` ضمن نافذة الاعتراض عبر إيداع ضمان (‏`challenge_bond` الخاص بالـ rollup؛ ‏1,000 QOR للإعدادين المسبقين `nft` و`custom`) وبرهان احتيال. يأخذ الأمر معرّف الـ rollup وفهرس الدفعة؛ مرّر برهان الاحتيال عبر `--proof`:

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > challenge.json
qorechaind tx pqc cosign challenge.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| العلم | الوصف |
| ---- | ----------- |
| `--proof` | برهان احتيال مرمّز بالنظام الست عشري |

يؤدي الاعتراض إلى **تجميد** الدفعة (‏`challenged`): فلا يمكن إنهاؤها. ثم يحسمه **منشئ** الـ rollup برسالة حسم الاعتراض (غير متاحة كأمر CLI؛ استخدم عميلًا). تقرر السلسلة النتيجة بنفسها عبر التحقق من البرهان المخزَّن. إذا ثبت الاحتيال تصبح الدفعة `rejected` ويُعاد الضمان ويُمنح المعترض مبلغًا إضافيًا مساويًا للضمان من حصة الـ rollup؛ وإذا رُفض الاعتراض يذهب الضمان إلى المنشئ وتعود الدفعة إلى `submitted`.

### فحص الدفعات

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42
```

---

## الاستعلام

| الأمر | الغرض |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | تفاصيل rollup محدد |
| `qorechaind query rdk list-rollups` | جميع الـ rollups المسجلة |
| `qorechaind query rdk batch [rollup-id]` | أحدث دفعة تسوية (أو `--index`) |
| `qorechaind query rdk config` | معاملات وحدة RDK |
| `qorechaind query rdk suggest-profile [use-case]` | يطبع مؤشرًا إلى استدعاء RPC ‏`qor_suggestRollupProfile`؛ ولا تقدّمه نقاط الوصول العامة، لذا اختر ملف تعريف من جدول [ملفات التعريف المسبقة](/rollups/preset-profiles) |

---

## الخطوات التالية

* **[توفر البيانات](/rollups/data-availability)** — خلفيات DA الأصلية وCelestia والمكررة.
* **[ZK / STARK والسحوبات](/rollups/zk-stark-withdrawals)** — التحقق من البراهين وتدفق السحب من L2 إلى L1 عبر `execute-withdrawal`.
