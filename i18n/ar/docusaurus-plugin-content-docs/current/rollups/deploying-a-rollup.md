---
slug: /rollups/deploying-a-rollup
title: نشر Rollup
sidebar_label: نشر Rollup
sidebar_position: 3
---

# نشر Rollup

يمكنك إعداد rollup مخصص للتطبيقات بثلاث طرق: عبر **لوحة التحكم (Dashboard)** (نموذج طلب، وليس معاملة على السلسلة)، أو عبر **واجهة سطر الأوامر (CLI)** الخاصة بالسلسلة (`qorechaind`، مع تحكم كامل في المعاملة على السلسلة)، أو باستخدام **TypeScript RDK** (‏`@qorechain/rdk` بالإضافة إلى أداة التهيئة `create-qorechain-rollup`)، التي تغطي التكوين وعمليات القراءة، وعند منحها مفتاحًا ما بعد كمّي، المعاملات الموقَّعة توقيعًا هجينًا (راجع [RDK 0.6.1: التغييرات والحدود](#rdk-050-limits)). تغطي هذه الصفحة الطرق الثلاث، بالإضافة إلى دورة حياة المشغّل وأوامر الدفعات.

:::caution قدرة في مرحلة مبكرة
لم يتم إنشاء أي rollup على أي من الشبكتين حتى الآن (تم التحقق في 27 أكتوبر 2026). تستخدم الأوامر أدناه شبكة الاختبار **`qorechain-diana`** (معرّف سلسلة EVM **9800**، إصدار السلسلة **v3.2.6**: طُبّق v3.2.4 عليها في 19 أكتوبر 2026، وv3.2.5 في 26 أكتوبر عند الارتفاع 8,890,800، وv3.2.6 في 27 أكتوبر عند الارتفاع 8,970,638). تعمل الشبكة الرئيسية (**`qorechain-vladi`**، معرّف سلسلة EVM **9801**، حية منذ 7 يونيو 2026) على إصدار السلسلة **v3.2.4** منذ 23 أكتوبر 2026 (طُبّق عند الارتفاع 3,742,566 بمقترح الحوكمة 13)؛ وسيطبّق مقترح الحوكمة 14 الإصدار v3.2.5 عند الارتفاع 3,906,833 وكان في فترة التصويت وقت كتابة هذا النص، وسيُوثَّق ما يغيّره v3.2.5 في حق الـ rollups في اليوم الذي تطبّقه فيه الشبكة الرئيسية. وتختلف الإصدارات السابقة في بعض التفاصيل، وتصفها هذه الصفحة بعبارة "اعتبارًا من v3.2.4". وشبكة الاختبار شبكة تجريبية لها معاملات وحداتها الخاصة (مثلًا نافذة اعتراض افتراضية مدتها 3,600 ثانية مقابل 604,800 على الشبكة الرئيسية، وحد أقصى 200 rollup مقابل 100)؛ اقرأ `GET /qorechain/rdk/v1/params` على الشبكة التي تستهدفها. تحقق من كل عملية نشر على شبكة الاختبار أولاً.
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
| **معرّف الـ rollup** | استخدم من 3 إلى 64 حرفًا: أحرف إنجليزية صغيرة وأرقام و`.` و`_` و`-`، على أن يبدأ بحرف أو رقم. تفرض السلسلة هذه القاعدة على الشبكتين منذ v3.2.2 (تتحقق منها واجهة CLI قبل بناء المعاملة)، لذا يُرفض أي معرّف غير مطابق |
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
3. **اختر آلة افتراضية.** يخزّن السجل على السلسلة تسمية للآلة الافتراضية. يُنفَّذ الـ rollup الخاص بك خارج السلسلة في بيئة تشغيل خاصة به؛ ولا يعمل الاختيار على مسارات EVM أو QoreChain Native أو SVM الخاصة بـ QoreChain نفسها:
   * **EVM** — عقود Solidity / Vyper مع كامل أدوات Ethereum ‏(Hardhat، Foundry، MetaMask)
   * **QoreChain Native** — عقود ذكية بلغة Rust على بيئة تشغيل Cosmos SDK، مع دعم IBC أصلي
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
يسجّل `--vm` بيئة التشغيل التي يستخدمها الـ rollup الخاص بك. تقوم السلسلة المضيفة بتسوية الـ rollup فقط؛ ولا تنفّذ عقوده. رفع QoreChain Native على السلسلة المضيفة نفسها مغلق حاليًا، ومسار معاملات SVM فيها معطّل على مستوى الشبكة، وهذا لا يؤثر في تسوية rollup خارج السلسلة، لكنه يعني أنه لا يمكنك نشر عقود لـ rollup على مساري السلسلة المضيفة هذين.
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

تُشحن حزمة تطوير الـ Rollup على شكل حزمتي npm عامتين لوحدة `x/rdk` نفسها على السلسلة التي تتعامل معها واجهة سطر الأوامر. لم يُنشأ أي rollup على أي من الشبكتين بعد، لذا لم يُجرَّب أي مسار معاملات في الحزمة على rollup حي؛ اقرأ [RDK 0.6.1: التغييرات والحدود](#rdk-050-limits) قبل الاعتماد عليها لإرسال المعاملات:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** ‏(`v0.6.1`) — حزمة TypeScript SDK: منشئ تكوين مع ملفات تعريف مسبقة، ومساعدات معاملات لدورتي حياة الـ rollup ودفعات التسوية، وDA أصلي، وعملاء قراءة منمّطون، وإيصالات تسوية آمنة كموميًا، ومساعد QCAI Rollup Copilot، ومساعدات calldata عبر الآلات الافتراضية، وبرج المراقبة (watchtower). وتعتمد على `@qorechain/sdk` ‏`^0.9.0` و`@qorechain/evm` ‏`^0.8.0`.
* **`create-qorechain-rollup`** ‏(`v0.6.1`) — أداة تهيئة تستنسخ قالب بداية قابلاً للتشغيل لكل ملف تعريف (بما في ذلك قالب `multivm-rollup`).

هذه الحزم منشورة على npm. يشحن المستودع أيضًا واجهة سطر أوامر منشورة للمشغّلين، **`@qorechain/rdk-cli`** ‏(`qorollup`، ‏`v0.6.1`)، مع أوامر `doctor` و`create` و`status` و`watch` و`params` و`suggest` وأوامر دورة الحياة (`pause`/`resume`/`stop`) و`keygen` و`manifest` و`withdraw` و`faucet`، بالإضافة إلى أوامر `receipt` و`advise` و`watchtower`. وتوقّع أوامر المعاملات فيها توقيعًا كلاسيكيًا فقط (راجع الحدود أدناه).

أبرز المستجدات حسب الإصدار:

* **v0.4.2 — يعمل مع الشبكة الحية مباشرة دون إعداد.** أصبحت الإعدادات المسبقة `mainnet` و`testnet` تتضمن نقاط الوصول العامة `qore.host` ‏(REST على `api.qore.host` / `api-testnet.qore.host`)، لذا يصل `createRdkClient({ network })` إلى السلسلة دون تحديد `endpoints` يدويًا — تجاوزها فقط لاستهداف عقدتك الخاصة. أعاد الإصدار نفسه تسمية معرّف الآلة الافتراضية لـ rollup من نوع Wasm إلى **`native`** ‏(QoreChain Native)؛ ويبقى `cosmwasm` اسمًا بديلًا قديمًا مقبولًا، وكلاهما يُترجم إلى `cosmwasm` على الشبكة — دون أي تغيير في السلسلة أو المستكشف أو لوحة التحكم.
* **v0.4.3 — تحديث للاعتماديات لإصلاح ترميز التوقيع الهجين في SDK.** وكان عميل المعاملات في RDK نفسه ما زال يوقّع توقيعًا كلاسيكيًا فقط.
* **v0.4.4 — يتتبع `@qorechain/sdk` ‏`^0.7.0`**، وهو إصدار SDK الخاص بمسارات المصادِقات (authenticator lanes) في إصدار السلسلة **v3.1.85**. لا يوجد تغيير في واجهة برمجة RDK.
* **v0.5.0 (18 أكتوبر 2026)** — يتحقق التحقق من إيصالات التسوية مقابل حالة السلسلة ولا يعلن أبدًا صحة إيصال من حقوله هو؛ ويوقّع عميل المعاملات في TypeScript توقيعًا هجينًا عند تزويده بـ `pqcKeypair`. وهو يعتمد على `@qorechain/sdk` ‏`^0.8.0`.
* **v0.6.0 (إصدار GitHub بتاريخ 20 أكتوبر 2026)** — إصدار التوافق مع السلسلة من v3.2.2 إلى v3.2.4: دفعات مثبَّتة (anchored)، وإيصالات تسوية يمكنها التحقق، ونوافذ اعتراض تُقاس كما تقيسها السلسلة، ومرمِّز يطابق تخطيط الاستدعاء عبر الآلات الافتراضية في السلسلة، وقوالب توقّع توقيعًا هجينًا، و`@qorechain/sdk` ‏`^0.9.0`. التفاصيل أدناه.
* **v0.6.1 (إصدار GitHub بتاريخ 25 أكتوبر 2026؛ الحالي)** — إصدار إصلاح أمني وإصلاح للقوالب للسلسلة v3.2.3 وما بعدها، في اللغات الخمس كلها: يقارن التحقق من إيصال التسوية كل حقل يذكره الإيصال مع تثبيت السلسلة، ولم تعد القوالب الستة للبداية ترسل دفعات ترفضها السلسلة (فهي تترك `dataHash` فارغًا)، وتنشر القوالب المتفائلة (optimistic) جذر الحالة المعتمد للسلسلة بدلًا من قيمة نائبة. ويبقي نطاقَي `@qorechain/sdk` ‏`^0.9.0` و`@qorechain/evm` ‏`^0.8.0`. التفاصيل أدناه.

**الإصدارات المنشورة (جرى التحقق على كل سجل في 27 أكتوبر 2026).** على npm: ‏`@qorechain/rdk` و`@qorechain/rdk-cli` و`create-qorechain-rollup`: ‏**0.6.1** (`latest`)؛ على PyPI: ‏`qorechain-rdk`: ‏0.6.1؛ على crates.io: ‏`qorechain-rdk`: ‏0.6.1؛ على Maven Central: ‏`io.github.qorechain:qorechain-rdk`: ‏0.6.1 (latest وrelease)؛ وحدة Go ‏`github.com/qorechain/qorechain-rdk/packages/go`: يقدّم وكيل الوحدات (module proxy) الإصدار `v0.6.1` وهو ما يحلّ إليه `@latest` اليوم (وقد يتأخر `@latest` في الوكيل عن وسم جديد، لذا يبقى تثبيت `@v0.6.1` صراحةً هو الأوضح). إصدار GitHub هو [v0.6.1](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.6.1).

#### RDK 0.6.1: التغييرات والحدود {#rdk-050-limits}

يبيّن هذا القسم ما تفعله حزم 0.6.1 المنشورة (وما غيّره 0.6.0 قبلها)، مُتحقَّقًا منه مقابل محتويات الحزم وملاحظات إصدار GitHub، وما لا تزال عاجزة عن فعله. ولا يمثل أي من هذه البنود سلوكًا للسلسلة. وحيثما يقول بيان "غير مختبَر حيًا"، فلا يوجد rollup على أي من الشبكتين، لذا لم يُفحص المسار إلا مقابل الشيفرة ودون اتصال.

**ما الذي تغيّر في 0.6.1** (اللغات الخمس كلها، ما لم يذكر سطر غير ذلك؛ وتتضمن [ملاحظات الإصدار](https://github.com/qorechain/qorechain-rdk/releases/tag/v0.6.1) القائمة الكاملة):

* **التحقق من الإيصال يقارن كل حقل.** تشترط `verifySettlementReceipt` الآن أن يساوي كل حقل تثبيت يذكره الإيصال تثبيتَ السلسلة (ويسمّي أي عدم تطابق الحقل)، وأن يساوي `batchStateRoot` جذر دفعة السلسلة، وترفض إيصالًا بـ `version` غير معروف أو بـ `algorithm` غير `ML-DSA-87` قبل قراءة أي شيء من السلسلة. وتحمل النتيجة `anchor` المطابق من السلسلة، وعند الصحة `verifiedReceipt` معاد بناؤه من حالة السلسلة؛ ويعيد `qorollup receipt verify --json` ذلك الإيصال المقروء من السلسلة باسم `receipt`. راجع [إيصالات التسوية](/rollups/settlement-receipts#what-060-verifies).
* **توفر البيانات الأصلي: اترك `dataHash` فارغًا.** تستخدم كل ملفات تعريف الـ rollup توفر البيانات `native`، حيث لا تقبل السلسلة `data_hash` غير فارغ إلا عندما يكون blob مطابق مخزَّنًا على السلسلة، ولا تستطيع أي معاملة تخزين واحد (راجع [توفر البيانات](/rollups/data-availability)). وكانت القوالب الستة للبداية تضع تجزئة بيانات على دفعاتها في 0.6.0 وما قبله، فكانت السلسلة ترفض كل دفعة من القوالب بعد دفع الرسوم. وهي الآن تتركها فارغة؛ و`SubmitBatchInput.dataHash` اختياري في TypeScript (وإغفاله يعني فارغًا)، وتكشف `dataHashError` ‏(`data_hash_error` و`DataHashError` و`Rules.dataHashError`) القاعدة، وترفض `RdkTxClient.submitBatch` مثل هذه الدفعة قبل البث عندما تستطيع قراءة الـ rollup (عميل هجين مع نقطة REST).
* **القوالب المتفائلة تنشر جذر الحالة المعتمد.** تحكم السلسلة على الدفعة المتفائلة بجذر الانتقال المعتمد لها، وهو التزام SHAKE-256 بجذر الحالة السابق للدفعة وتجزئة بياناتها وعدد معاملاتها (‏`batchTransitionRoot` في RDK، مع اختيار `transitionRootVersionFor` للربط الذي تطبّقه الشبكة المتصل بها). كانت قوالب `custom` و`multivm` و`nft` ترسل جذرًا نائبًا ثابتًا لا يطابق الجذر المعتمد الذي تفحصه السلسلة؛ وهي الآن تنشر الجذر المعتمد ولم تعد ترسل برهانًا نائبًا. ويقرأ `challenge.ts` في قالب `nft` الدفعة من السلسلة ولا يعترض إلا على دفعة جذرها خاطئ بشكل مثبت. لا تكتب الصيغة يدويًا: استخدم `batchTransitionRoot` ليطابق الربط الشبكة التي ترسل إليها. وفحص السلسلة نفسه واحد لكل العملاء، فيمكن الاعتراض بنجاح على دفعة متفائلة جذر حالتها ليس الجذر المعتمد، أيًّا كان العميل الذي أرسلها.
* **مساعدات جديدة.** ‏`fraudProof` و`transitionRootVersionForBatch` و`receiptSchemaError` مع `SUPPORTED_RECEIPT_VERSIONS` و`RestClient.getProtocolFeatures` / `isProtocolFeatureEnabled` (وتُقرأ سلسلة بلا هذا المسار على أنها "غير مفعّلة") و`getAppliedPlanHeight`. وتعتمد `@qorechain/rdk` الآن على `@noble/hashes` مباشرةً (SHAKE-256 لجذر الانتقال؛ وكانت مثبَّتة أصلًا عبر `@qorechain/sdk`). وتثبّت القوالب `@qorechain/rdk` ‏`^0.6.1`.

**ما الذي تغيّر في 0.6.0** (TypeScript، ما لم يذكر سطر غير ذلك):

* **التوقيع.** يوقّع `RdkClient.connectTx(signer, { pqcKeypair, rest })` توقيعًا هجينًا (secp256k1 + ML-DSA-87) عندما تمرّر زوج مفاتيح؛ وبدونه يوقّع توقيعًا كلاسيكيًا فقط وترفض الشبكتان المعاملة. يجب أن يكون `signer` من النوع `OfflineDirectSigner`، ويجب أن تكون الرسوم صريحة (`fee`، أو `gasPrice` عند الاتصال). تشتق المساعدتان الجديدتان `resolvePqcKeypair` و`pqcKeypairFromEnv` مفتاح ML-DSA-87 القياسي والقديم معًا انطلاقًا من عبارة استرداد (mnemonic) وتستخدمان أيّهما سجّله الحساب على السلسلة؛ وتمتنعان عن الاختيار بدل التخمين عندما يحمل الحساب مفتاحًا مختلفًا. ويوفّر `QORE_PQC_SEED_HEX` بذرة لمشغّل يوقّع بمفتاح خاص خام. تعتمد الحزمة الآن على `@qorechain/sdk` ‏`^0.9.0`، لذا يحمل التثبيت الجديد نسخة SDK واحدة (0.9.0)؛ أما مع 0.5.0 فقد ثبّت npm الإصدار 0.8.3 من SDK متداخلًا تحت الحزمة.
* **الدفعات المثبَّتة.** تحمل `MsgSubmitBatch` الحقلين `anchor_signature` و`validator_set_hash`. لا يوقّع `RdkTxClient.submitBatch` التثبيت بنفسه إلا عندما يوقّع العميل توقيعًا هجينًا ويملك نقطة وصول REST و**يكون منشئ الـ rollup** (إذ تتحقق السلسلة من التثبيت مقابل المفتاح المسجَّل للمنشئ)؛ وفي كل حالة أخرى يرسل الدفعة غير مثبَّتة كما كان من قبل. مرّر `anchor: "require"` ليمتنع عن الإرسال بدل إرسالها غير مثبَّتة، أو `anchor: "off"` لعدم التوقيع أبدًا، أو `anchorSignature` لإرسال توقيع حصلت عليه بنفسك. تبني `anchorSignBytesForBatch` بايتات v2 لمنشئ يوقّع خارج القناة، وهو ما يحتاجه rollup له مرتِّب منفصل. غير مختبَر حيًا.
* **إيصالات التسوية.** يستخدم البحث عن حساب PQC المسار المفرد `/qorechain/pqc/v1/account/{address}` (استخدم 0.5.0 مسارًا بصيغة الجمع لا تقدّمه الشبكتان). ويدعم التحقق صيغتي بايتات توقيع التثبيت كلتيهما ويختار إحداهما بحسب ارتفاع التثبيت، ولا يجرّب الاثنتين أبدًا: ‏v1 دون نقطة التحوّل في v3.2.2، وv2 منها فصاعدًا. يسجّل مخطط الإيصال v2 الحقل `chainId`؛ ويرفض التحقق إيصالًا يُفحص مقابل عقدة من سلسلة أخرى، ويُبلغ عن `signBytesVersion` وعن فحص `chainBinding`. وما زالت إيصالات الإصدار 1 تجتاز التحقق. راجع [إيصالات التسوية](/rollups/settlement-receipts).
* **القراءات.** تستدعي `getLatestBatch` المسار `/qorechain/rdk/v1/latest_batch/{rollup_id}` (كان 0.5.0 يستدعي صيغة لا تقدّمها السلسلة)، وتتبع `listBatches` كل الصفحات (وتقرأ `listBatchesPage` صفحة واحدة). ويحمل `RollupView` الحقل `escrowBalance` و، حيثما تُبلغ عنها العقدة، `challengeWindowSec` و`challengeBond` و`proofSystem`؛ ويحمل `BatchView` الحقل `submittedTime`.
* **نوافذ الاعتراض.** تحسب `batchChallengeWindow` نافذة الدفعة كما تحسبها السلسلة وتحكم عليها بالنسبة إلى رأس السلسلة (`getChainTip`)، لا بالساعة المحلية: ثوانٍ من زمن الكتلة للدفعة التي لها وقت إرسال مسجَّل (قاعدة v3.2.4: على شبكة الاختبار منذ الارتفاع 8,337,253، وعلى الشبكة الرئيسية منذ الارتفاع 3,742,566)، و`window / 6` كتل تُحسب من ارتفاع الإرسال في غير ذلك (قاعدة الدفعات المرسلة قبل ارتفاع الترقية). ويستخدمها الفحص الصحي الذي يقوم عليه `qorollup status` وبرج المراقبة (راجع [برج المراقبة](/rollups/watchtower)).
* **عبر الآلات الافتراضية (Cross-VM).** تُرمِّز `encodeCrossVmCalldata` الآن `executeCrossVMCall(uint8,string,bytes)`، وهو التخطيط الذي تفكّ العقدة ترميزه، وتأخذ `targetVm`. وتقرأ `isCrossVmPrecompileActive` القائمة الحية للـ precompiles المفعّلة (راجع [Multi-VM](/rollups/multi-vm)).
* **قواعد تُفحص قبل دفع الرسوم.** تفحص `rollupIdError` قواعد صياغة المعرّف عند التحقق من تكوين وقبل أن تبثّ `createRollup`؛ وتفحص `withdrawalErrors` السحب قبل أن تبثّ `executeWithdrawal`.
* **القوالب.** تتصل القوالب المهيَّأة عبر `pqcKeypairFromEnv`، لذا توقّع نصوصها `create` و`submit-batch` توقيعًا هجينًا، وكانت تعتمد على `@qorechain/rdk` ‏`^0.6.0` (و`^0.6.1` منذ أداة التهيئة 0.6.1). ويفحص قالب `multivm-rollup` أن الـ precompile حيّ ويشترط ردًا غير فارغ من الهدف.
* **Python وGo وRust وJava.** إصلاحات جانب القراءة أعلاه (مسار PQC المفرد، و`latest_batch`، وبايتات توقيع التثبيت v2، وقواعد نافذة الاعتراض، وفحوصات المعرّف والسحب) موجودة في الحزم المنشورة للغات الأربع الأخرى أيضًا.
* **تغييرات كاسرة.** تأخذ `encodeCrossVmCalldata` الوسيط `targetVm`، وتغيّرت `CROSS_VM_DEFAULT_SIGNATURE`. ويحمل `RollupHealth` و`BatchDeadline` الحقل `challengeWindow` بدل الموعد النهائي القديم المبني على الثواني.

**الحدود التي تبقى في 0.6.1:**

* **عميل TypeScript وحده يوقّع توقيعًا هجينًا.** تتصل واجهة **`qorollup` CLI** (أوامرها `create` و`pause` و`resume` و`stop` و`withdraw`) دون مفتاح ما بعد كمّي، وعملاء **Python وGo وRust وJava** يوقّعون توقيعًا كلاسيكيًا فقط، وترفضه الشبكتان على المسار الأصلي؛ وما زالت ملفات README الخاصة بها تقول ذلك. وليس في بُناة الرسائل لديها حقل `anchor_signature` ولا `validator_set_hash`. وللمعاملات من هذه الأدوات، ابنِ ووقّع باستخدام CLI الخاص بالسلسلة (‏`--generate-only`، ثم `qorechaind tx pqc cosign`) أو استخدم عميل TypeScript مع `pqcKeypair`.
* **لم يُجرَّب إنشاء rollup بتوقيع هجين على شبكة حية،** لأنه لا يوجد rollup على أي من الشبكتين. والأمر نفسه ينطبق على الدفعات المثبَّتة والسحوبات ومسار الإيصالات كله.
* **التثبيت يحتاج إلى المنشئ.** لا تُثبَّت الدفعة في المعاملة نفسها إلا إذا كان توقيع المنشئ فيها. وإذا كان المرتِّب عنوانًا آخر، فعلى المنشئ أن يوقّع بايتات v2 خارج القناة وأن يرسل المرتِّب الناتج.
* **الـ precompile عبر الآلات الافتراضية على العنوان `0x…0901` لا شيفرة له** وليس في قائمة الـ precompiles المفعّلة على أي من الشبكتين، لذا فإن الاستدعاء من عقد ما زال لا يفعل شيئًا (راجع [Multi-VM](/rollups/multi-vm)).
* **طول نافذة الاعتراض.** تقرأ الحزمة نافذة الـ rollup الخاصة به فقط عندما تُبلغ عنها العقدة (وتوثّق الحزمة ذلك على أنه v3.2.4 وما بعده، وهو ما تشغّله الشبكتان). وإلا فإنها تستخدم نافذة الوحدة الافتراضية؛ مرّر `challengeWindowSecs` لـ rollup هيّأ نافذته الخاصة. وما زالت الدالتان القديمتان `challengeWindowDeadline` و`isChallengeWindowClosed` مصدَّرتين وما زالتا تأخذان ثواني، فلا تمرّر لهما ارتفاع كتلة.
* **توفر البيانات.** يستخدم `buildDaBlob` التجزئة SHA-256، بينما التزام الـ blob في السلسلة هو SHAKE-256، ولا تنشر أي معاملة blob، لذا يجب أن تترك الدفعة على rollup من نوع `native` أو `both` الحقل `dataHash` فارغًا (راجع [توفر البيانات](/rollups/data-availability)).

**الإصدارات السابقة لـ 0.6.1.** يقارن 0.6.0 حقولًا أقل في التحقق من الإيصالات من 0.6.1، ويشحن قوالب ترسل دفعات ترفضها السلسلة (تجزئة بيانات على rollup بتوفر بيانات أصلي، وجذر حالة نائب في القوالب المتفائلة)؛ فاستخدم 0.6.1. ولا ينبغي استخدام 0.5.0 وما قبله لإيصالات التسوية أو برج المراقبة أو calldata عبر الآلات الافتراضية: فقد بحث 0.5.0 عن مفتاح المنشئ في مسار لا تقدّمه الشبكتان (فكان التحقق من الإيصالات يفشل مغلقًا مع كل إيصال حقيقي)، وأعاد بناء رسالة التثبيت v1 فقط، وقرأ ارتفاع الكتلة على أنه طابع زمني (فكان عمر كل دفعة وكل موعد نهائي للاعتراض خاطئًا، وكان برج المراقبة يُطلق تنبيه الموعد النهائي فورًا لكل دفعة)، واستدعى مسار آخر دفعة لا تقدّمه السلسلة، وقرأ أول 50 دفعة فقط، وشفّر دالة لا يفكّها الـ precompile، وشحن قوالب توقّع توقيعًا كلاسيكيًا فقط. ولم يكن في 0.4.x توقيع هجين في عميل المعاملات.

#### عملاء Python وGo وRust وJava

إلى جانب حزمة TypeScript، توفر RDK عملاء كاملين بلغات **Python** و**Go** و**Rust** و**Java** يعكسون واجهة TypeScript: منشئ التكوين مع التحقق، وملفات التعريف المسبقة الخمسة، وأدوات denom/الاقتصاديات/bech32، ومساعدات Merkle الثنائية وبراهين السحب، وبيانات manifest للـ rollup، وعملاء قراءة عبر REST وواجهة `qor_` JSON-RPC، وفحوصات الجاهزية والصحة، والحسابات (عبارة استرداد → عنوان `qor`)، وتوقيع المعاملات الكلاسيكي + البث (‏`SIGN_MODE_DIRECT`، وهو غير مقبول على الشبكات ذات التوقيع الهجين — راجع [RDK 0.6.1: التغييرات والحدود](#rdk-050-limits)). جميعها متحقق منها مقابل متجهات ذهبية مشتركة عبر اللغات وجميعها **منشورة** في سجلاتها:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go (pin the version: the proxy's @latest still answered v0.5.0 when checked)
go get github.com/qorechain/qorechain-rdk/packages/go@v0.6.1

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.6.1
```

```python
import qorrdk
```

الإصدارات المنشورة حاليًا، وكلها **0.6.1** (جرى التحقق في 27 أكتوبر 2026): Python ‏`qorechain-rdk` ‏(PyPI، الاستيراد باسم `qorrdk`)، ووحدة Go ‏`github.com/qorechain/qorechain-rdk/packages/go` ‏(`v0.6.1`)، وRust ‏`qorechain-rdk` ‏(crates.io)، وJava ‏`io.github.qorechain:qorechain-rdk` ‏(Maven Central). تقرأ هذه العملاء حالة السلسلة؛ وما زالت لا تُنتج التوقيع الهجين الذي تتطلبه الشبكتان، وليس في بُناة الرسائل لديها حقول التثبيت (راجع [RDK 0.6.1: التغييرات والحدود](#rdk-050-limits)).

:::note
تستهدف TypeScript RDK وقوالبها افتراضيًا شبكة الاختبار **`qorechain-diana`**، وتصل الإعدادات المسبقة إلى نقاط الوصول العامة الحية مباشرة دون إعداد. ثبّت الإصدارات وتحقق على شبكة الاختبار قبل الشبكة الرئيسية.
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

:::caution ما الذي تستطيع النصوص المهيَّأة فعله
تعتمد قوالب `create-qorechain-rollup` 0.6.1 على `@qorechain/rdk` ‏`^0.6.1`. تتصل نصوصها `create` و`submit-batch` عبر `connectOperator()` في `src/signer.ts`، التي تحلّ مفتاحك ما بعد الكمّي من `QORE_MNEMONIC` (أو من `QORE_PQC_SEED_HEX` عندما توقّع بـ `QORE_OPERATOR_PRIVATE_KEY_HEX`)، وتفحصه مقابل السلسلة، وتوقّع توقيعًا هجينًا؛ وإذا لم يُضبط أي منهما يحذّر النص ويوقّع توقيعًا كلاسيكيًا فقط، وترفضه الشبكتان. لم يُنشأ أي rollup عبر قالب على شبكة حية، لذا فهذا المسار غير مختبَر حيًا. نص `submit-batch` في قالب البداية هو تدفق مرجعي فقط: فهو يترك منذ 0.6.1 الحقل `dataHash` فارغًا (إذ ترفض السلسلة تجزئة بيانات على rollup بتوفر بيانات أصلي)، وتنشر القوالب المتفائلة جذر الحالة المعتمد بدلًا من قيمة نائبة؛ وما زال يستخدم قيمًا توضيحية لبقية الحقول (وبرهانًا نموذجيًا لملف ZK)، ولا يُتوقع أن ينهي دفعة على شبكة حية.
:::

### بناء تكوين rollup من الكود

ابنِ تكوينًا من إعداد مسبق، واقرأ الحصة ومعدل الحرق الحيين من السلسلة، ثم أنتج رسالة الإنشاء. يفرض منشئ التكوين مصفوفة التوافق بين التسوية والبرهان عند استدعاء `validate()` / `build()`. أرسل القيم الناتجة عبر CLI أعلاه، أو عبر عميل TypeScript مزوَّد بـ `pqcKeypair` — راجع [RDK 0.6.1: التغييرات والحدود](#rdk-050-limits).

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read of /qorechain/rdk/v1/params, served on both networks.
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

لا يحتاج عميل REST المنمّط إلى موقّع، ويقرأ من الشبكتين:

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

بالنسبة إلى الدفعات، استخدم `rdk.rest.getBatch(rollupId, index)` أو `qorechaind query rdk batch [rollup-id]` (أدناه)؛ وتقرأ الدالتان `getLatestBatch` و`listBatches` منذ 0.6.0 مسار `latest_batch` في السلسلة وكل صفحات قائمة الدفعات (راجع [RDK 0.6.1: التغييرات والحدود](#rdk-050-limits)).

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

أوقف الـ rollup نهائيًا وحرر حصته. تُعاد عملات QOR المحجوزة — مطروحًا منها حرق الإنشاء لمرة واحدة، ومطروحًا منها أي مبلغ سبق دفعه من ضمان الـ rollup عبر السحوبات أو مكافآت إثباتات الاحتيال — إلى المنشئ: فمنذ v3.2.3 يسجّل سجل ضمان لكل rollup ما لا يزال كل rollup يحتفظ به، ويعيد `stop-rollup` هذا الرصيد بالضبط، ولا يدفع الـ rollup المتوقف أي سحوبات أخرى. وتُعاد حصة تسجيل الطبقة البالغة 1,000 QOR بشكل منفصل عند إخراج طبقة الـ rollup من الخدمة.

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

### إرسال دفعة {#submit-a-batch}

أرسل دفعة تسوية لـ rollup. يأخذ الأمر معرّف الـ rollup، ورقم فهرس الدفعة، وجذر حالة مرمّزًا بالنظام الست عشري. وبالنسبة إلى كل دفعة بعد الأولى، مرّر جذر حالة الدفعة السابقة بوصفه `--prev-state-root`.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --prev-state-root <previous-state-root-hex> --tx-count 120 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| العلم | الوصف |
| ---- | ----------- |
| `--prev-state-root` | جذر الحالة بالنظام الست عشري الذي تبدأ منه الدفعة (مطلوب لكل دفعة بعد الفهرس `0`) |
| `--tx-count` | عدد معاملات الـ rollup في الدفعة |
| `--data-hash` | تجزئة بالنظام الست عشري لبيانات الدفعة المنشورة كـ blob في DA (اتركه فارغًا اليوم: لا توجد طريقة لنشر blob، راجع [توفر البيانات](/rollups/data-availability)) |
| `--withdrawals-root` | جذر Merkle بالنظام الست عشري لسحوبات الدفعة من L2 إلى L1 (راجع [ZK / STARK والسحوبات](/rollups/zk-stark-withdrawals)) |
| `--anchor-signature` | توقيع ML-DSA-87 بالنظام الست عشري من **منشئ** الـ rollup على بايتات توقيع التثبيت v2 (منذ v3.2.2)؛ وتُثبَّت الدفعة عندئذٍ في `x/multilayer` في المعاملة نفسها، ويؤدي رفض التثبيت إلى رفض الدفعة |
| `--validator-set-hash` | التزام مجموعة المدقّقين بالنظام الست عشري الذي يحمله التثبيت ويغطيه التوقيع |

بدون `--anchor-signature` تُسوّى الدفعة **غير مثبَّتة**. ولتثبيت دفعة، اطبع البايتات المراد توقيعها، ووقّعها بمفتاح المنشئ المسجَّل ما بعد الكمّي، ومرّر التوقيع (يجب أن تطابق القيمتان `--tx-count` و`--validator-set-hash` ما ترسله):

```bash
qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex] \
  --chain-id qorechain-diana --tx-count 120
```

`layer-id` هو معرّف طبقة الـ rollup (وهو معرّف الـ rollup نفسه بالنسبة إلى الـ rollups المنشأة بواسطة RDK). ومن TypeScript، توقّع `RdkTxClient.submitBatch` في `@qorechain/rdk` بالإصدار 0.6.0 وما بعده التثبيت نيابةً عنك عندما يوقّع العميل توقيعًا هجينًا ويكون منشئ الـ rollup، وتعطي `anchorSignBytesForBatch` المنشئَ البايتات ليوقّعها خارج القناة (راجع [RDK 0.6.1: التغييرات والحدود](#rdk-050-limits)). ليس للعلم `--proof` الخاص بـ ZK في rollup من نوع `zk` علم في CLI اليوم، ورسالة حسم الاعتراض ليست أمرًا في CLI: استخدم عميلًا. راجع [إيصالات التسوية](/rollups/settlement-receipts) لمعرفة ما يثبته التثبيت وما لا يثبته. لا يوجد rollup ولا طبقة ولا تثبيت على أي من الشبكتين حتى الآن.

### الاعتراض على دفعة (الـ rollups التفاؤلية) {#challenge-a-batch-optimistic-rollups}

يمكن لأي حساب الاعتراض على دفعة بحالة `submitted` ضمن نافذة الاعتراض (100,800 كتلة افتراضيًا لدفعة أُرسلت على الشبكة الرئيسية قبل الارتفاع 3,742,566؛ ومنذ v3.2.4، نافذة بالثواني من زمن الكتلة للدفعات الجديدة: على شبكة الاختبار منذ الارتفاع 8,337,253، وعلى الشبكة الرئيسية منذ الارتفاع 3,742,566) عبر إيداع ضمان (‏`challenge_bond` الخاص بالـ rollup؛ ‏1,000 QOR للإعدادين المسبقين `nft` و`custom`) وبرهان احتيال. يُحكم على الدفعة المتفائلة بما إذا كان جذر حالتها هو جذر الانتقال المعتمد، لذا ينبغي لمن يرسلها أن ينشر ذلك الجذر بالضبط (وهذا ما تفعله قوالب RDK 0.6.1؛ راجع [RDK 0.6.1: التغييرات والحدود](#rdk-050-limits)). يأخذ الأمر معرّف الـ rollup وفهرس الدفعة؛ مرّر برهان الاحتيال عبر `--proof`:

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

# A page of batches in index order (--limit up to 100, default 50)
qorechaind query rdk batches [rollup-id] --start 0 --limit 50
```

---

## الاستعلام

| الأمر | الغرض |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | تفاصيل rollup محدد |
| `qorechaind query rdk list-rollups` | جميع الـ rollups المسجلة |
| `qorechaind query rdk batch [rollup-id]` | أحدث دفعة تسوية (أو `--index`) |
| `qorechaind query rdk batches [rollup-id]` | صفحة من الدفعات بترتيب الفهرس (`--start`، `--limit`) |
| `qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex]` | بايتات توقيع التثبيت v2 لدفعة (دون اتصال) |
| `qorechaind query rdk config` | معاملات وحدة RDK |
| `qorechaind query rdk suggest-profile [use-case]` | يطبع مؤشرًا إلى استدعاء RPC ‏`qor_suggestRollupProfile`؛ ولا تقدّمه نقاط الوصول العامة، لذا اختر ملف تعريف من جدول [ملفات التعريف المسبقة](/rollups/preset-profiles) |

---

## الخطوات التالية

* **[توفر البيانات](/rollups/data-availability)** — خلفيات DA الأصلية وCelestia والمكررة.
* **[ZK / STARK والسحوبات](/rollups/zk-stark-withdrawals)** — التحقق من البراهين وتدفق السحب من L2 إلى L1 عبر `execute-withdrawal`.
