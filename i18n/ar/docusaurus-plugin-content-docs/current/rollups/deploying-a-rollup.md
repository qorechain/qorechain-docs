---
slug: /rollups/deploying-a-rollup
title: نشر Rollup
sidebar_label: نشر Rollup
sidebar_position: 3
---

# نشر Rollup

يمكنك نشر rollup خاص بتطبيق معيّن بثلاث طرق: عبر **لوحة التحكم (Dashboard)** (معالج موجّه بدون كتابة كود)، أو عبر **واجهة الأوامر (CLI)** الخاصة بالسلسلة (`qorechaind`، تحكم كامل في المعاملة على السلسلة)، أو برمجياً باستخدام **TypeScript RDK** (`@qorechain/rdk` مع أداة التهيئة `create-qorechain-rollup`). تغطي هذه الصفحة الطرق الثلاث جميعها، إضافة إلى دورة حياة المشغّل وأوامر الدفعات.

:::note
تستهدف الأوامر أدناه الشبكة التجريبية **`qorechain-diana`**. أما الشبكة الرئيسية (**`qorechain-vladi`**، معرّف سلسلة EVM رقم **9801**) فهي قيد التشغيل منذ 7 يونيو 2026 وتعمل بإصدار السلسلة **v3.1.77** — استبدل معرّف السلسلة ونقاط النهاية الخاصة بالشبكة الرئيسية عند النشر عليها. تحقق من كل عملية نشر على الشبكة التجريبية أولاً.
:::

---

## المتطلبات

| المتطلب | التفاصيل |
| ----------- | ------- |
| **الحد الأدنى للحصة (Stake)** | يُحجز سند حصة بعملة QOR في الضمان عند إنشاء الـ rollup |
| **حرق الإنشاء (Creation burn)** | يُحرَق جزء من المبلغ المرهون نهائياً عند الإنشاء؛ ويُحتفَظ بالباقي في الضمان ويُعاد عند إيقاف الـ rollup |
| **الحساب** | حساب QoreChain مموّل برصيد كافٍ للحصة إضافة إلى رسوم المعاملات |

استعلم عن معاملات الوحدة الحية لمعرفة الحد الأدنى الحالي للحصة ومعدل الحرق قبل النشر:

```bash
qorechaind query rdk config
```

---

## النشر عبر لوحة التحكم (Tools → Rollups)

توفّر لوحة التحكم معالجاً موجّهاً باسم **Deploy a Rollup** ضمن **Tools → Rollups**. وهو أسرع مسار لإطلاق rollup خاص بتطبيق دون تجميع معاملة يدوياً.

### الخطوات

1. **تسجيل الدخول.** يتطلب المعالج جلسة موثّقة للنشر ولعرض عمليات النشر الموجودة لديك.
2. **تسمية الـ rollup الخاص بك.** أدخل اسم rollup (من 2 إلى 41 حرفاً: أحرف، أو أرقام، أو مسافات، أو شرطات، أو شرطات سفلية).
3. **اختيار آلة افتراضية.** QoreChain سلسلة ثلاثية الآلات الافتراضية، لذا يمكن لـ rollup الخاص بك تشغيل أي مما يلي:
   * **EVM** — عقود Solidity / Vyper مع مجموعة أدوات Ethereum الكاملة (Hardhat، Foundry، MetaMask)
   * **CosmWasm** — عقود ذكية بلغة Rust على بيئة تشغيل Cosmos SDK، مع IBC أصلي
   * **SVM** — الآلة الافتراضية لـ Solana، للتطبيقات ذات التنفيذ المتوازي والإنتاجية العالية
4. **اختيار طبقة توافر البيانات.** المكان الذي ينشر فيه الـ rollup الخاص بك بيانات المعاملات بحيث يمكن لأي شخص إعادة بناء الحالة: **QoreChain DA**، أو **Celestia**، أو **EigenDA**. لاحظ أن EigenDA خيار على مستوى لوحة التحكم، بينما أنظمة DA الخلفية على السلسلة في `x/rdk` هي native أو Celestia أو both — راجع [توافر البيانات](/rollups/data-availability).
5. **تعيين رمز للغاز.** الرمز المستخدم لدفع تكاليف التنفيذ على الـ rollup الخاص بك. القيمة الافتراضية هي **QOR**؛ أدخل رمزاً مخصصاً لاستخدام رمزك الأصلي الخاص.
6. **اختيار مُسلسِل (sequencer).** من يرتّب المعاملات قبل التسوية: **مُسلسِل مشترك** (المجموعة المشتركة لـ QoreChain)، أو **مخصص (مفرد)** (تشغيل مُسلسِل مفرد خاص بك)، أو **لامركزي** (مجموعة مُسلسِلات بلا إذن).
7. **اختيار هدف تسوية.** المكان الذي يرسّخ فيه الـ rollup جذور حالته وبراهين الصحة: **الشبكة الرئيسية QoreChain** أو **Ethereum**.
8. **النشر.** أرسِل المعالج. تتم مراجعة عملية التزويد من قِبل **The Qore Trust** قبل أن ينطلق الـ rollup، لذا يظهر الـ rollup المُرسَل حديثاً بحالة **provisioning** حتى تكتمل المراجعة.

تظهر الـ rollups التي أرسلتها في قائمة **Your rollups** مع آلتها الافتراضية، وطبقة DA، ورمز الغاز، والمُسلسِل، وهدف التسوية، والحالة الحالية.

:::note
يقدّم معالج لوحة التحكم خيارات ودودة على مستوى المنتج ويوجّه التزويد عبر مسار تتم مراجعته. أما واجهة الأوامر أدناه فتعمل مباشرة على سطح الرسائل على السلسلة لوحدة `x/rdk`. وتتشارك الطريقتان نفس المفاهيم الأساسية (الآلة الافتراضية، DA، المُسلسِل، التسوية) لكنهما تعرضانها على مستويات مختلفة.
:::

---

## النشر عبر واجهة الأوامر (CLI)

تنشئ واجهة الأوامر الـ rollup مباشرة على السلسلة. يأخذ `create-rollup` ثلاث وسائط موضعية — معرّف الـ rollup، وملف تعريف (profile)، ومبلغ الحصة (بوحدة `uqor`) — إضافة إلى راية `--vm` اختيارية.

:::tip
اعتباراً من إصدار السلسلة **v3.1.74**، يقوم `create-rollup` **بتطبيق إعداد ملف التعريف المختار تلقائياً** — تُؤخَذ وضعية التسوية، والمُسلسِل، وDA، ونموذج الغاز، والآلة الافتراضية جميعها من الإعداد المسبق. لم تعد بحاجة إلى ضبطها يدوياً (سابقاً كانت الرسالة تثبّت تكويناً سيادياً). أما راية `--vm` فقيمتها الافتراضية الآن **فارغة**، لذا تُطبَّق الآلة الافتراضية الخاصة بملف التعريف ما لم تتجاوزها صراحة.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**مثال** — إنشاء rollup من الإعداد المسبق `defi` (التسوية، والمُسلسِل، وDA، والآلة الافتراضية كلها تأتي من الإعداد المسبق؛ يُحَلّ `defi` إلى تسوية zk على EVM):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**الرايات:**

| الراية | القيمة الافتراضية | الوصف |
| ---- | ------- | ----------- |
| `--vm` | *(فارغة — استخدم الآلة الافتراضية الخاصة بملف التعريف)* | تجاوز نوع الآلة الافتراضية للـ rollup: `evm`، أو `cosmwasm`، أو `svm`، أو `custom`. اتركها دون تعيين لتطبيق الآلة الافتراضية الخاصة بالإعداد المسبق. |

تختار الوسيطة `[profile]` تكويناً مسبقاً يُطبَّق تلقائياً — راجع **[ملفات التعريف المسبقة](/rollups/preset-profiles)**. والوسيطة `[stake-amount]` هي السند بوحدة `uqor`.

### فحص ما نشرته

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## النشر باستخدام TypeScript RDK (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

تُشحَن مجموعة تطوير الـ Rollup على شكل حزمتي npm عامتين تشغّلان نفس وحدة `x/rdk` على السلسلة التي تشغّلها واجهة الأوامر، عبر RPC/REST/gRPC/JSON-RPC العامة وأي `OfflineSigner` من cosmjs:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.0`) — حزمة TypeScript SDK: أداة بناء تكوين مع ملفات تعريف مسبقة، ومساعِدات معاملات لدورات حياة الـ rollup ودفعات التسوية، وDA الأصلي، وعملاء قراءة بأنواع محددة، إضافة إلى إضافات الإصدار v0.4 — إيصالات تسوية آمنة كمومياً، ومساعد الـ Rollup من QCAI (Rollup Copilot)، ومساعِدات بيانات الاستدعاء عبر الآلات الافتراضية (cross-VM calldata)، وبرج المراقبة (watchtower).
* **`create-qorechain-rollup`** (`v0.4.0`) — أداة تهيئة تستنسخ قالب بداية قابلاً للتشغيل لكل ملف تعريف (بما في ذلك قالب `multivm-rollup`).

هذه منشورة على npm. كما يشحن المستودع أيضاً واجهة أوامر منشورة للمشغّل، **`@qorechain/rdk-cli`** (`qorollup`، `v0.4.0`)، مع أوامر `doctor`، و`create`، و`status`، و`watch`، و`params`، و`suggest`، ودورة الحياة (`pause`/`resume`/`stop`)، و`keygen`، و`manifest`، و`withdraw`، و`faucet`، إضافة إلى أوامر الإصدار v0.4 وهي `receipt`، و`advise`، و`watchtower`.

#### عملاء Python و Go و Rust و Java

إلى جانب حزمة TypeScript، يوفّر الـ RDK عملاء كاملين بلغات **Python** و**Go** و**Rust** و**Java** يعكسون سطح TypeScript: أداة بناء التكوين مع التحقق، وملفات التعريف المسبقة الخمسة، وأدوات الـ denom/الاقتصاد/bech32، ومساعِدات Merkle الثنائية وبراهين السحب، وبيانات تعريف الـ rollup (manifests)، وعملاء قراءة REST و`qor_` JSON-RPC، وفحوص ما قبل الإقلاع/السلامة، والحسابات (mnemonic ← عنوان `qor`)، و**توقيع المعاملات + بثها** (`SIGN_MODE_DIRECT`). وقد تم التحقق منها جميعاً مقابل متجهات ذهبية مشتركة عبر اللغات وهي **منشورة** في مستودعاتها:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.0
```

```python
import qorrdk
```

الإصدارات المنشورة حالياً: Python `qorechain-rdk` **0.4.0** (PyPI، يُستورَد باسم `qorrdk`)، وRust `qorechain-rdk` **0.4.0** (crates.io)، ووحدة Go `github.com/qorechain/qorechain-rdk/packages/go`، وJava `io.github.qorechain:qorechain-rdk` **0.4.0** (Maven Central). يتطلب البث الحي نقطة نهاية لعقدة.

:::note
يستهدف TypeScript RDK وقوالبه الشبكة التجريبية **`qorechain-diana`** وهي مُعلَّمة بـ **قريباً (coming soon)** للتدفقات الكاملة من طرف إلى طرف. ثبّت الإصدارات وتحقق على الشبكة التجريبية.
:::

### تهيئة مشروع باستخدام `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

لكل ملف تعريف قالب بداية مطابق (`defi-rollup`، و`gaming-rollup`، و`nft-rollup`، و`enterprise-rollup`، و`custom-rollup`). هيّئ واحداً بأي من الصيغتين:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

للاستخدام غير التفاعلي / في CI، مرّر القالب والشبكة صراحة:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

تطبع أداة التهيئة تكلفة الحصة وحرق الإنشاء الموثّقة والخطوات التالية لإنشاء الـ rollup الخاص بك وقراءة حالته.

### إنشاء rollup من الكود

ابنِ تكويناً من إعداد مسبق، واقرأ الحصة الحية ومعدل الحرق من السلسلة، ثم أنشئ الـ rollup باستخدام عميل توقيع. تفرض أداة بناء التكوين مصفوفة توافق التسوية → البرهان عند `validate()` / `build()`.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.025uqor" });
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

لست متأكداً من ملف التعريف المناسب؟ يعيد `rdk.suggestProfile("a lending protocol with predictable fees")` توصية بمساعدة QCAI (مع احتياطي موثّق).

### إدارة دورة الحياة وقراءة الحالة من الكود

يعرض عميل التوقيع دورة الحياة الكاملة — `pauseRollup`، و`resumeRollup`، و`stopRollup`، إضافة إلى `submitBatch`، و`challengeBatch`، و`resolveChallenge`، و`executeWithdrawal`. ويمكن حماية انتقالات دورة الحياة بتمرير `currentStatus`.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

اقرأ الحالة باستخدام عميل REST بأنواع محددة (لا حاجة إلى موقّع):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## إدارة دورة الحياة

يمر الـ rollup عبر حالات `pending`، و`active`، و`paused`، و`stopped`. ويدير المنشئ الانتقالات باستخدام الأوامر التالية.

### الإيقاف المؤقت (Pause)

أوقِف الـ rollup مؤقتاً. تُحفَظ الحالة ويمكن استئناف الـ rollup. وتُطلَب سلسلة سبب نصية.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### الاستئناف (Resume)

استأنِف rollup أُوقِف مؤقتاً في السابق.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### الإيقاف (Stop)

أوقِف الـ rollup نهائياً وأطلِق حصته. يُعاد رمز QOR المرهون — ناقصاً حرق الإنشاء الذي يحدث مرة واحدة — إلى المنشئ.

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

يقدّم مشغّلو الـ rollup دفعات التسوية، ويمكن للمعترِضين الطعن في الدفعات المتفائلة. تُشكّل هذه الأوامر أساس طبقة التسوية الموصوفة في **[نظرة عامة على الـ Rollups](/rollups/overview)** و**[ZK / STARK وعمليات السحب](/rollups/zk-stark-withdrawals)**.

### تقديم دفعة

قدّم دفعة تسوية لـ rollup. تأخذ معرّف الـ rollup، وفهرس دفعة، وجذر حالة مُرمَّز بالنظام الست عشري (hex).

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### الاعتراض على دفعة

اعترِض على دفعة مقدَّمة (للـ rollups المتفائلة). تأخذ معرّف الـ rollup وفهرس الدفعة؛ مرّر برهان الاحتيال باستخدام `--proof`. اعتباراً من إصدار السلسلة **v3.1.74**، أصبح مسار **submit-batch → challenge-batch** المتفائل حياً ويعمل من طرف إلى طرف.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| الراية | الوصف |
| ---- | ----------- |
| `--proof` | برهان احتيال مُرمَّز بالنظام الست عشري (hex) |

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
| `qorechaind query rdk rollup [rollup-id]` | تفاصيل rollup معيّن |
| `qorechaind query rdk list-rollups` | جميع الـ rollups المسجّلة |
| `qorechaind query rdk batch [rollup-id]` | أحدث دفعة تسوية (أو `--index`) |
| `qorechaind query rdk config` | معاملات وحدة RDK |
| `qorechaind query rdk suggest-profile [use-case]` | التوصية بإعداد مسبق لحالة استخدام |

---

## الخطوات التالية

* **[توافر البيانات](/rollups/data-availability)** — أنظمة DA الخلفية الأصلية، وCelestia، والمتكررة.
* **[ZK / STARK وعمليات السحب](/rollups/zk-stark-withdrawals)** — التحقق من البراهين وتدفق السحب من L2 إلى L1 عبر `execute-withdrawal`.
