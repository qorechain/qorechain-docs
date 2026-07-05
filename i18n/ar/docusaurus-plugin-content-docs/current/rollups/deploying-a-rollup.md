---
slug: /rollups/deploying-a-rollup
title: نشر Rollup
sidebar_label: نشر Rollup
sidebar_position: 3
---

# نشر Rollup

يمكنك نشر rollup مخصص للتطبيقات بثلاث طرق: عبر **لوحة التحكم (Dashboard)** (معالج إرشادي بدون كتابة كود)، أو عبر **واجهة سطر الأوامر (CLI)** الخاصة بالسلسلة (`qorechaind`، مع تحكم كامل في المعاملة على السلسلة)، أو برمجيًا باستخدام **TypeScript RDK** (‏`@qorechain/rdk` بالإضافة إلى أداة التهيئة `create-qorechain-rollup`). تغطي هذه الصفحة الطرق الثلاث، بالإضافة إلى دورة حياة المشغّل وأوامر الدفعات.

:::note
تستهدف الأوامر أدناه شبكة الاختبار **`qorechain-diana`**. الشبكة الرئيسية (**`qorechain-vladi`**، بمعرّف سلسلة EVM رقم **9801**) تعمل منذ 7 يونيو 2026 على إصدار السلسلة **v3.1.85** — استبدل معرّف سلسلة الشبكة الرئيسية ونقاط الوصول الخاصة بها عند النشر على الشبكة الرئيسية. تحقق من كل عملية نشر على شبكة الاختبار أولاً.
:::

---

## المتطلبات

| المتطلب | التفاصيل |
| ----------- | ------- |
| **الحد الأدنى للحصة (stake)** | يتم حجز ضمان حصة بعملة QOR عند إنشاء الـ rollup |
| **حرق الإنشاء** | يُحرق جزء من المبلغ المحجوز نهائيًا عند الإنشاء؛ ويُحتفظ بالباقي في الضمان ويُعاد عند إيقاف الـ rollup |
| **الحساب** | حساب QoreChain ممول برصيد كافٍ للحصة بالإضافة إلى رسوم المعاملات |

استعلم عن معاملات الوحدة الحية لمعرفة الحد الأدنى الحالي للحصة ومعدل الحرق قبل النشر:

```bash
qorechaind query rdk config
```

---

## النشر عبر لوحة التحكم (Tools → Rollups)

توفر لوحة التحكم معالجًا إرشاديًا باسم **Deploy a Rollup** ضمن **Tools → Rollups**. وهو المسار الأسرع لإطلاق rollup مخصص للتطبيقات دون الحاجة إلى تجميع معاملة يدويًا.

### الخطوات

1. **سجّل الدخول.** يتطلب المعالج جلسة مصادَق عليها للنشر ولعرض عمليات النشر الحالية الخاصة بك.
2. **سمِّ الـ rollup الخاص بك.** أدخل اسمًا للـ rollup (من 2 إلى 41 حرفًا: حروف، أرقام، مسافات، شرطات، أو شرطات سفلية).
3. **اختر آلة افتراضية.** QoreChain هي سلسلة ثلاثية الآلات الافتراضية، لذا يمكن للـ rollup الخاص بك تشغيل أي من:
   * **EVM** — عقود Solidity / Vyper مع كامل أدوات Ethereum ‏(Hardhat، Foundry، MetaMask)
   * **CosmWasm** — عقود ذكية بلغة Rust على بيئة تشغيل Cosmos SDK، مع دعم IBC أصلي
   * **SVM** — آلة Solana الافتراضية، للتطبيقات ذات التنفيذ المتوازي والإنتاجية العالية
4. **اختر طبقة توفر البيانات (DA).** المكان الذي ينشر فيه الـ rollup بيانات المعاملات بحيث يمكن لأي شخص إعادة بناء الحالة: **QoreChain DA** أو **Celestia** أو **EigenDA**. لاحظ أن EigenDA خيار على مستوى لوحة التحكم، بينما خلفيات DA الخاصة بوحدة `x/rdk` على السلسلة هي: الأصلية (native)، أو Celestia، أو كلاهما — راجع [توفر البيانات](/rollups/data-availability).
5. **حدد عملة الغاز.** العملة المستخدمة لدفع تكاليف التنفيذ على الـ rollup الخاص بك. القيمة الافتراضية هي **QOR**؛ أدخل رمزًا مخصصًا لاستخدام عملتك الأصلية الخاصة.
6. **اختر المُرتِّب (sequencer).** الجهة التي ترتّب المعاملات قبل التسوية: **مرتِّب مشترك** (المجموعة المشتركة لـ QoreChain)، أو **مخصص (فردي)** (تشغيل مرتِّب فردي خاص بك)، أو **لامركزي** (مجموعة مرتِّبات بلا إذن مسبق).
7. **اختر هدف التسوية.** المكان الذي يثبّت فيه الـ rollup جذور حالته وبراهين صحته: **الشبكة الرئيسية لـ QoreChain** أو **Ethereum**.
8. **انشر.** أرسل المعالج. تتم مراجعة التزويد من قِبل **The Qore Trust** قبل أن يصبح الـ rollup مباشرًا، لذا يظهر الـ rollup المرسل حديثًا بحالة **provisioning** حتى اكتمال المراجعة.

تظهر الـ rollups التي أرسلتها في قائمة **Your rollups** مع الآلة الافتراضية، وطبقة DA، وعملة الغاز، والمرتِّب، وهدف التسوية، والحالة الحالية.

:::note
يقدم معالج لوحة التحكم خيارات مبسّطة على مستوى المنتج ويمرر التزويد عبر خط مراجعة معتمد. أما واجهة سطر الأوامر أدناه فتعمل مباشرة على واجهة الرسائل على السلسلة الخاصة بوحدة `x/rdk`. تشترك الطريقتان في المفاهيم الأساسية نفسها (الآلة الافتراضية، DA، المرتِّب، التسوية) لكنهما تعرضانها على مستويين مختلفين.
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
  --fees 500uqor
```

**مثال** — إنشاء rollup من الإعداد المسبق `defi` (التسوية والمرتِّب وDA والآلة الافتراضية تأتي كلها من الإعداد المسبق؛ يُحلّ `defi` إلى تسوية zk على EVM):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**الأعلام:**

| العلم | القيمة الافتراضية | الوصف |
| ---- | ------- | ----------- |
| `--vm` | *(فارغ — استخدام الآلة الافتراضية لملف التعريف)* | تجاوز نوع الآلة الافتراضية للـ rollup: ‏`evm` أو `cosmwasm` أو `svm` أو `custom`. اتركه دون ضبط لتطبيق الآلة الافتراضية للإعداد المسبق. (في عملاء RDK، بيئة تشغيل Wasm هي نوع الآلة الافتراضية **`native`** — QoreChain Native — مع الإبقاء على `cosmwasm` كاسم بديل قديم؛ و`cosmwasm` هي القيمة المرسلة على الشبكة، وهي ما يقبله هذا العلم على مستوى السلسلة.) |

الوسيط `[profile]` يحدد تكوينًا مسبقًا يُطبَّق تلقائيًا — راجع **[ملفات التعريف المسبقة](/rollups/preset-profiles)**. والوسيط `[stake-amount]` هو الضمان بوحدة `uqor`.

### افحص ما نشرته

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## النشر باستخدام TypeScript RDK ‏(`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

تُشحن حزمة تطوير الـ Rollup على شكل حزمتي npm عامتين تتعاملان مع وحدة `x/rdk` نفسها على السلسلة التي تتعامل معها واجهة سطر الأوامر، عبر واجهات RPC/REST/gRPC/JSON-RPC العامة وأي `OfflineSigner` من cosmjs:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** ‏(`v0.4.4`) — حزمة TypeScript SDK: منشئ تكوين مع ملفات تعريف مسبقة، ومساعدات معاملات لدورتي حياة الـ rollup ودفعات التسوية، وDA أصلي، وعملاء قراءة منمّطون، وإضافات الإصدار v0.4 — إيصالات تسوية آمنة كموميًا، ومساعد QCAI Rollup Copilot، ومساعدات calldata عبر الآلات الافتراضية، وبرج المراقبة (watchtower).
* **`create-qorechain-rollup`** ‏(`v0.4.4`) — أداة تهيئة تستنسخ قالب بداية قابلاً للتشغيل لكل ملف تعريف (بما في ذلك قالب `multivm-rollup`).

هذه الحزم منشورة على npm. يشحن المستودع أيضًا واجهة سطر أوامر منشورة للمشغّلين، **`@qorechain/rdk-cli`** ‏(`qorollup`، ‏`v0.4.4`)، مع أوامر `doctor` و`create` و`status` و`watch` و`params` و`suggest` وأوامر دورة الحياة (`pause`/`resume`/`stop`) و`keygen` و`manifest` و`withdraw` و`faucet`، بالإضافة إلى أوامر الإصدار v0.4: ‏`receipt` و`advise` و`watchtower`.

أبرز المستجدات منذ الإصدار الأولي v0.4.0:

* **v0.4.2 — يعمل مع الشبكة الحية مباشرة دون إعداد.** أصبحت الإعدادات المسبقة `mainnet` و`testnet` تتضمن نقاط الوصول العامة `qore.host` ‏(REST على `api.qore.host` / `api-testnet.qore.host`)، لذا يصل `createRdkClient({ network })` إلى السلسلة دون تحديد `endpoints` يدويًا — تجاوزها فقط لاستهداف عقدتك الخاصة. أعاد الإصدار نفسه تسمية معرّف الآلة الافتراضية لـ rollup من نوع Wasm إلى **`native`** ‏(QoreChain Native)؛ ويبقى `cosmwasm` اسمًا بديلًا قديمًا مقبولًا، وكلاهما يُترجم إلى `cosmwasm` على الشبكة — دون أي تغيير في السلسلة أو المستكشف أو لوحة التحكم.
* **v0.4.3 — إصلاح ترميز التوقيع الهجين** لمسار التوقيع في TypeScript (انظر التحذير أدناه).
* **v0.4.4 — يتتبع `@qorechain/sdk` ‏`^0.7.0`**، وهو إصدار SDK الخاص بمسارات المصادِقات (authenticator lanes) في إصدار السلسلة **v3.1.85**، بحيث تصل تلك القدرات إلى مستخدمي TypeScript في RDK مباشرة عبر SDK. لا يوجد تغيير في واجهة برمجة RDK.

:::caution
**يجب على مستخدمي TypeScript استخدام RDK بإصدار ≥ 0.4.3.** الإصدارات السابقة كانت ترمّز امتداد معاملة PQC الهجينة بشكل خاطئ، فكانت السلسلة ترفض كل معاملة موقعة توقيعًا هجينًا. يعالج الإصدار v0.4.3 (عبر `@qorechain/sdk` ‏≥ 0.6.1) هذا الترميز. المسار المتأثر هو مسار التوقيع الهجين في TypeScript فقط — عملاء Python وGo وRust وJava يوقّعون توقيعًا كلاسيكيًا فقط ولم يتأثروا مطلقًا.
:::

#### عملاء Python وGo وRust وJava

إلى جانب حزمة TypeScript، توفر RDK عملاء كاملين بلغات **Python** و**Go** و**Rust** و**Java** يعكسون واجهة TypeScript: منشئ التكوين مع التحقق، وملفات التعريف المسبقة الخمسة، وأدوات denom/الاقتصاديات/bech32، ومساعدات Merkle الثنائية وبراهين السحب، وبيانات manifest للـ rollup، وعملاء قراءة عبر REST وواجهة `qor_` JSON-RPC، وفحوصات الجاهزية والصحة، والحسابات (عبارة استرداد → عنوان `qor`)، و**توقيع المعاملات + البث** ‏(`SIGN_MODE_DIRECT`). جميعها متحقق منها مقابل متجهات ذهبية مشتركة عبر اللغات وجميعها **منشورة** في سجلاتها:

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

الإصدارات المنشورة حاليًا: Python ‏`qorechain-rdk` ‏**0.4.4** ‏(PyPI، الاستيراد باسم `qorrdk`)، وRust ‏`qorechain-rdk` ‏(crates.io — ثبّت أحدث إصدار منشور، أو ابنِ من المستودع)، ووحدة Go ‏`github.com/qorechain/qorechain-rdk/packages/go` ‏(**v0.4.4**)، وJava ‏`io.github.qorechain:qorechain-rdk` ‏**0.4.4** ‏(Maven Central). يتطلب البث الحي نقطة وصول لعقدة.

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

### إنشاء rollup من الكود

ابنِ تكوينًا من إعداد مسبق، واقرأ الحصة ومعدل الحرق الحيين من السلسلة، ثم أنشئ الـ rollup باستخدام عميل توقيع. يفرض منشئ التكوين مصفوفة التوافق بين التسوية والبرهان عند استدعاء `validate()` / `build()`.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2) —
// no manual `endpoints` config needed; override to target your own node.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.15uqor" }); // the chain enforces a 0.1uqor/gas fee floor
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

لست متأكدًا من ملف التعريف المناسب؟ يعيد `rdk.suggestProfile("a lending protocol with predictable fees")` توصية بمساعدة QCAI (مع آلية احتياطية موثّقة).

### إدارة دورة الحياة وقراءة الحالة من الكود

يعرض عميل التوقيع دورة الحياة الكاملة — `pauseRollup` و`resumeRollup` و`stopRollup`، بالإضافة إلى `submitBatch` و`challengeBatch` و`resolveChallenge` و`executeWithdrawal`. يمكن حماية انتقالات دورة الحياة عبر تمرير `currentStatus`.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

اقرأ الحالة باستخدام عميل REST المنمّط (دون الحاجة إلى موقّع):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## إدارة دورة الحياة

يمر الـ rollup بالحالات `pending` و`active` و`paused` و`stopped`. يدير المنشئ الانتقالات بالأوامر التالية.

### الإيقاف المؤقت

أوقف الـ rollup مؤقتًا. تُحفظ الحالة ويمكن استئناف الـ rollup. يلزم تقديم نص يوضح السبب.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### الاستئناف

استأنف rollup سبق إيقافه مؤقتًا.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### الإيقاف النهائي

أوقف الـ rollup نهائيًا وحرر حصته. تُعاد عملات QOR المحجوزة — مطروحًا منها حرق الإنشاء لمرة واحدة — إلى المنشئ.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
إيقاف الـ rollup نهائي. لا يمكن إعادة تشغيل الـ rollup بعد إيقافه.
:::

---

## أوامر المشغّل: الدفعات والاعتراضات

يرسل مشغّلو الـ rollup دفعات التسوية، ويمكن للمعترضين الطعن في الدفعات التفاؤلية. تشكل هذه الأوامر أساس طبقة التسوية الموضحة في **[نظرة عامة على الـ Rollups](/rollups/overview)** و**[ZK / STARK والسحوبات](/rollups/zk-stark-withdrawals)**.

### إرسال دفعة

أرسل دفعة تسوية لـ rollup. يأخذ الأمر معرّف الـ rollup، ورقم فهرس الدفعة، وجذر حالة مرمّزًا بالنظام الست عشري.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### الاعتراض على دفعة

اعترض على دفعة مرسلة (للـ rollups التفاؤلية). يأخذ الأمر معرّف الـ rollup وفهرس الدفعة؛ مرّر برهان الاحتيال عبر `--proof`. اعتبارًا من إصدار السلسلة **v3.1.74**، أصبح المسار التفاؤلي **submit-batch → challenge-batch** مباشرًا ويعمل من البداية إلى النهاية.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| العلم | الوصف |
| ---- | ----------- |
| `--proof` | برهان احتيال مرمّز بالنظام الست عشري |

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
| `qorechaind query rdk suggest-profile [use-case]` | توصية بإعداد مسبق لحالة استخدام |

---

## الخطوات التالية

* **[توفر البيانات](/rollups/data-availability)** — خلفيات DA الأصلية وCelestia والمكررة.
* **[ZK / STARK والسحوبات](/rollups/zk-stark-withdrawals)** — التحقق من البراهين وتدفق السحب من L2 إلى L1 عبر `execute-withdrawal`.
