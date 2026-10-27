---
slug: /developer-tools/pq-light-client
title: العميل الخفيف PQ
sidebar_label: العميل الخفيف PQ
sidebar_position: 31
---

# العميل الخفيف PQ (`qorechain-pq-light-client`)

`qorechain-pq-light-client` هي مواصفة مسودة ومُتحقِّق مرجعي لنقاط التحقق (checkpoints) الموقَّعة بـ ML-DSA-87 (FIPS 204). في التصميم المقترح يوقّع المُصادِقون نقطة تحقق قصيرة في نهاية كل حقبة (epoch) بمفتاح نقطة تحقق منفصل من نوع ML-DSA-87، ويتتبّع العميل الخفيف سلسلة نقاط التحقق بالتحقق من هذه التواقيع لا غير. وهي موجّهة لباحثي البروتوكولات، ولمطوري المُرحِّلات (relayers) والجسور، وللفرق على السلاسل الأخرى التي ترغب في مراجعة التصميم والاختبار مقابله. الإصدار **0.1.0**، ترخيص Apache-2.0، تشرف عليه جمعية QoreChain.

**السلسلة لا تدعم نقاط التحقق هذه، ولا شيء مجدول.** لا تُنتج QoreChain نقاط التحقق التي تتحقق منها هذه الحزمة، لا على الشبكة الرئيسية (`qorechain-vladi`) ولا على شبكة الاختبار (`qorechain-diana`). لا يدعمها أي إصدار من السلسلة، ولا ترقية ولا موعد مخطط لها. مفاتيح إجماع المُصادِقين اليوم هي ed25519، وليست مفاتيح ما بعد الكمّ. لا تستطيع الحزمة تتبّع شبكة حية: فهي تعمل على مجموعات مُصادِقين محاكاة وعلى متجهات الاختبار المشتركة. ولا تجعل أي مسار أو جسر أو قناة IBC في QoreChain من نوع ما بعد الكمّ.

## الابتكارات {#innovations}

- **نقاط تحقق بدل توقيع كل كتلة.** سيوقّع المُصادِقون نقطة تحقق واحدة في كل حقبة (معرّف السلسلة والحقبة والارتفاع والوقت وتجزئة الترويسة وتجزئة التطبيق وتجزئة المجموعة الموقِّعة وتجزئة المجموعة التالية). وستنتقل التواقيع في معاملات عادية، فلا ينتظرها إنتاج الكتل أبدًا، ويبقى حجم البيانات أقل بكثير من توقيع كل كتلة. وتعرض المواصفة (القسم 12) الأسباب.
- **مفتاح نقطة تحقق منفصل مع إثبات حيازة.** سيسجّل كل مُصادِق مفتاح نقطة تحقق ML-DSA-87، منفصلًا عن مفتاح إجماعه وعن أي مفتاح حساب، مع إثبات حيازة على `"qorechain-pqlc-key-pop-v1|" || chain_id || operator address || consensus address || public key`.
- **تسليم المجموعة بيد المجموعة المنتهية.** تُقبل نقطة التحقق عندما يكون المُصادِقون الذين يملكون أكثر من ثلثي قوة المجموعة المسمّاة في آخر نقطة تحقق موثوقة قد وقّعوها، وبذلك تكون تغييرات مجموعة المُصادِقين موقَّعة دائمًا من المجموعة المنتهية. ثلثان تمامًا لا يُعدّان نصابًا، وتوقيع من غير عضو يُبطل نقطة التحقق بدل أن يُتجاهل.
- **ترميز واحد لكل كائن.** لنقطة التحقق ومجموعة المُصادِقين ونقطة التحقق الموقَّعة ترميزات قانونية، وتقبل أجهزة فك الترميز ترميزًا واحدًا بالضبط لكل منها. ويمرّر المُرحِّل البايتات القانونية دون تغيير.
- **ترتيب ثابت للفحوص.** تُجري `verifyCheckpoint` الفحوص بترتيب محدد، فتعيد TypeScript وRust وGo رمز الخطأ نفسه للمُدخل نفسه.
- **أدلة السلوك الخاطئ.** نقطتا تحقق مختلفتان لحقبة واحدة، لكل منهما نصاب، تشكّلان سلوكًا خاطئًا. وتعيد `detectMisbehaviour` نقطتي التحقق بترتيب قانوني، مع الموقِّعين المزدوجين وقوتهم.
- **ثلاث لغات، ومجموعة متجهات واحدة.** تأتي المتجهات المشتركة (`vectors/pq-light-client-v1.json`) من محاكٍ حتمي، وتغطي سلاسل نقاط تحقق بـ 4 مُصادِقين و21 مُصادِقًا، وتدوير المجموعات، وكل رفض يمكن أن ينتجه المُتحقِّق، ونقاط التحقق المتعارضة، وحالات فك الترميز. تجتازها Go وRust وTypeScript جميعًا، فيستطيع تطبيق رابع أن يثبت تطابقه بايتًا ببايت.

## حالات الاستخدام {#use-cases}

1. **مطورو المُرحِّلات يبنون نموذجًا أوليًا لمسار تحديث ما بعد الكمّي.** يحتفظ مُرحِّل Rust بحالة موثوقة واحدة لكل شبكة، ويفك ترميز كل نقطة تحقق موقَّعة ويتحقق منها، ويمرّر البايتات نفسها إلى الوجهة، ويتوقف عند `CONFLICTING_CHECKPOINT`. ويعمل اليوم على المتجهات أو على سلسلة محاكاة مخصّصة؛ ويعرض دليل المُرحِّل في المستودع الحلقة.
2. **فرق IBC والجسور تقيّم التصميم.** يربط القسم 14 من المواصفة نقاط التحقق بنوع عميل خفيف في IBC (حالة العميل وحالة الإجماع والسلوك الخاطئ وإثباتات العضوية عند ارتفاعات نقاط التحقق). تستطيع الفرق مراجعة هذا الربط ومفاضلاته قبل أن يوجد أي شيء على السلسلة. وهو ملاحظة تصميم؛ ولا توجد شيفرة له.
3. **فرق سلاسل EVM أو Solana تقارن تصاميم المُتحقِّق.** يقارن القسم 15 التحقق من ML-DSA-87 على السلسلة وإثبات STARK للتحقق ومجموعة مُصدِّقين (attestors)، بما في ذلك أيّ الخيارات تُبقي خاصية ما بعد الكمّ وأيّها يتخلى عنها. وهي أيضًا ملاحظات تصميم فقط. وللمرجع: لدى EVM في QoreChain نفسها precompile للتحقق من ML-DSA (`pqcVerify`، 0x0A01) وهو مفعّل على شبكة الاختبار فقط؛ راجع [EVM precompiles](/developer-guide/evm-precompiles).
4. **المراجعون الأمنيون والباحثون يفحصون القواعد.** ترتيب الفحوص وقاعدة النصاب وتسليم المجموعة وفترة الثقة وأدلة السلوك الخاطئ محددة وقابلة للاختبار بثلاث لغات.
5. **الفرق التي تتحدث عن المسارات تصوغ ادعاءاتها بدقة.** تحدّد صفحة الموقف في المستودع متى يجوز وصف مسار بأنه ما بعد كمّي (راجع [الحدود](#limits)).
6. **المطبّقون بلغات أخرى.** تتيح المتجهات لتطبيق جديد أن يثبت تطابقه مع المرجع.

## كيف يعمل {#how-it-works}

كل ما في هذا القسم هو التصميم المقترح، وكله يتطلب دعمًا من السلسلة غير مجدول.

1. يسجّل كل مُصادِق مفتاح نقطة تحقق ML-DSA-87 مع إثبات حيازة (أعلاه).
2. في نهاية كل حقبة يوقّع المُصادِقون نقطة تحقق: معرّف السلسلة، والحقبة (تتزايد بصرامة)، والارتفاع، والوقت، وتجزئة الترويسة، وتجزئة التطبيق، وتجزئة المجموعة التي توقّع نقطة التحقق هذه، وتجزئة المجموعة التي توقّع التالية.
3. يقبل العميل الخفيف نقطة تحقق وقّعها أكثر من ثلثي قوة المجموعة التي سمّتها آخر نقطة تحقق موثوقة لديه.
4. نقطتا تحقق مختلفتان لحقبة واحدة، لكل منهما نصاب، تشكّلان سلوكًا خاطئًا؛ وتسمّي الأدلة الموقِّعين المزدوجين.

يبقى إجماع كل كتلة دون تغيير. وتبقى الارتفاعات داخل الحقبة كلاسيكية حتى نقطة التحقق التالية؛ والعميل الذي يحتاج إلى ضمان ما بعد الكمّ يستخدم ارتفاعات نقاط التحقق ويقبل زمن انتظار يصل إلى حقبة واحدة.

**الصيغ** (كل الأعداد الصحيحة big-endian، وبايت الإصدار `0x01`):

| الكائن | التخطيط | الحجم |
|---|---|---|
| نقطة التحقق | الإصدار، وطول معرّف السلسلة وبايتاته، والحقبة، والارتفاع، والوقت، وتجزئة الترويسة، وتجزئة التطبيق، وتجزئة مجموعة المُصادِقين، وتجزئة مجموعة المُصادِقين التالية | `154 + len(chain_id)` بايتًا (169 لـ `qorechain-vladi`) |
| مجموعة المُصادِقين | الإصدار، والعدد (من 1 إلى 256)، ثم لكل مُصادِق: عنوان من 20 بايتًا، وقوة من 8 بايتات، ومفتاح ML-DSA-87 من 2,592 بايتًا، مرتبة حسب العنوان | `3 + 2,620 x validators` بايتًا |
| نقطة التحقق الموقَّعة | الإصدار، ونقطة التحقق، وعدد التواقيع، ولكل موقِّع عنوان من 20 بايتًا وتوقيع من 4,627 بايتًا (مرتبة حسب العنوان)، وعلم المجموعة التالية، والمجموعة التالية عندما تتغير المجموعة | `173 + 4,647 x signers` بايتًا لـ `qorechain-vladi`، إضافة إلى المجموعة التالية عند وجودها |

**التوقيع والتجزئة.** ML-DSA-87، وضع FIPS 204 النقي، سياق فارغ، على `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)`. التوقيع الحتمي والتوقيع المحصَّن (hedged) كلاهما صالح. والتجزئة هي SHAKE-256 بخرج 32 بايتًا؛ وتستخدم تجزئة مجموعة المُصادِقين البادئة `qorechain-pqlc-valset-v1|`.

**ترتيب التحقق** (`verifyCheckpoint`): البنية، ومعرّف السلسلة، وانتهاء الثقة، وانحراف الساعة، ومعالجة الحقبة نفسها (المتطابقة تعطي `NOT_NEWER`؛ والمختلفة مع نصاب تعطي `CONFLICTING_CHECKPOINT`)، وتقدّم الحقبة والارتفاع والوقت، وتساوي المجموعة الموقِّعة مع المجموعة التالية الموثوقة، وتطابق المجموعة التالية المحمولة مع تجزئتها، والنصاب. الفشل يترك الحالة الموثوقة دون تغيير. ويمكن قبول حقبة لاحقة مباشرة ما دامت المجموعة الموقِّعة لم تتغير؛ وبعد التدوير يجب التحقق من كل نقطة تحقق ابتداءً من التدوير.

**الثقة.** يبدأ العميل من جذر ثقة يُختار خارج البروتوكول، كما في أي عميل خفيف يعتمد إثبات الحصة (proof-of-stake). ويجب أن تكون فترة الثقة أقصر من الفترة التي يمكن فيها معاقبة المُصادِق؛ وبعدها يجب إعادة تهيئة العميل.

المواصفة هي `spec/pq-light-client-v1.md` في المستودع (الحالة: مسودة، مفتوحة للمراجعة). والقسم 10 (مفاتيح نقاط التحقق والتوقيع والحقب والعقوبات على السلسلة) تصميم للمراجعة، وليس التزامًا.

## طريقة الاستخدام {#how-to-use}

### التثبيت {#install}

| اللغة | التثبيت | الحد الأدنى للمنصة |
|---|---|---|
| TypeScript | `npm install @qorechain/pq-light-client` | Node.js 20.19 أو أحدث، والمتصفحات. تعتمد على `@qorechain/pqc` 0.2.3 |
| Rust | `cargo add qorechain-pq-light-client` (المكتبة `qorechain_pq_light_client`) | Rust المستقرة؛ تعتمد على `qorechain-pqc` 0.2.3؛ دون `unsafe` ودون إدخال/إخراج |
| Go | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` (الحزمة `pqlightclient`) | Go 1.25؛ تعتمد على `github.com/qorechain/qorechain-pqc/go` v0.2.3 |

لا توجد حزمة على PyPI، ولا تُخطَّط واحدة.

### بداية سريعة (دون اتصال، TypeScript) {#quickstart}

لا يلمس شيء شبكة QoreChain. يتتبّع النص سلسلة نقاط التحقق المحاكاة بـ 21 مُصادِقًا من المتجهات المشتركة (معرّف السلسلة `qorechain-sim-21`، متضمنة تدوير مجموعة في الحقبة 2)، ثم يُظهر أن المصدر الحي غير متاح. مفاتيح المتجهات مفاتيح اختبار عامة.

```bash
mkdir pqlc && cd pqlc && npm init -y && npm pkg set type=module
npm install @qorechain/pq-light-client
curl -sLO https://raw.githubusercontent.com/qorechain/qorechain-pq-light-client/v0.1.0/vectors/pq-light-client-v1.json
```

```js
// follow.mjs: a TypeScript port of the repository's Rust relayer example.
import { readFileSync } from "node:fs";
import {
  PqLightClientError,
  decodeSignedCheckpoint,
  decodeValidatorSet,
  fetchCheckpoint,
  newTrustedState,
  verifyCheckpoint,
} from "@qorechain/pq-light-client";

const v = JSON.parse(readFileSync("pq-light-client-v1.json", "utf8"));
const hex = (s) => Uint8Array.from(Buffer.from(s, "hex"));

const root = decodeSignedCheckpoint(hex(v.signedCheckpoints["c21-e0-root"].encoded));
const set = decodeValidatorSet(hex(v.validatorSets.C21.encoded));
let state = newTrustedState({
  checkpoint: root.checkpoint,
  signatures: root.signatures,
  validatorSet: set,
  nextValidatorSet: set,
  trustingPeriod: 1_209_600n, // 14 days
  maxClockDrift: 10n,
});

for (const id of ["c21-e1", "c21-e2-rotate", "c21-e3"]) {
  const signed = decodeSignedCheckpoint(hex(v.signedCheckpoints[id].encoded));
  state = verifyCheckpoint(state, signed, signed.checkpoint.time + 5n);
  console.log(`trusted epoch ${state.checkpoint.epoch} at height ${state.checkpoint.height}`);
}

try {
  await fetchCheckpoint("https://rpc.example.invalid", state.checkpoint.chainId, 4n);
} catch (e) {
  if (e instanceof PqLightClientError) console.log("live source:", e.code);
}
```

عند التشغيل في 27 أكتوبر 2026 مقابل حزمة npm المنشورة 0.1.0 والمتجهات عند الوسم v0.1.0، طبع `node follow.mjs`:

```
trusted epoch 1 at height 11000
trusted epoch 2 at height 12000
trusted epoch 3 at height 13000
live source: REQUIRES_CHAIN_SUPPORT
```

ملف المتجهات بحجم نحو 2.4 ميغابايت. والأصل بلغة Rust هو `rust/examples/relayer.rs` في المستودع (`cargo run --example relayer`)؛ ولم يُشغَّل لأجل هذه الصفحة.

معالجة الأخطاء في TypeScript (من README الحزمة):

```ts
try {
  trusted = verifyCheckpoint(trusted, decodeSignedCheckpoint(bytes), BigInt(Math.floor(Date.now() / 1000)));
} catch (e) {
  if (e instanceof PqLightClientError && e.code === "CONFLICTING_CHECKPOINT") {
    report(e.misbehaviour);
  }
}
```

والأمر نفسه في Go:

```go
signed, err := pqlightclient.DecodeSignedCheckpoint(b)
if err != nil {
	return err
}
next, err := pqlightclient.VerifyCheckpoint(trusted, signed, uint64(time.Now().Unix()))
if errors.Is(err, pqlightclient.ErrConflictingCheckpoint) {
	// err.(*pqlightclient.Error).Misbehaviour holds the evidence
}
```

### الواجهة البرمجية الرئيسية {#api}

الواجهة البرمجية واحدة في اللغات الثلاث (camelCase في TypeScript وPascalCase في Go وsnake_case في Rust). والحقول ذات 64 بتًا هي `bigint` في TypeScript.

| الاسم | ما يفعله |
|---|---|
| `Checkpoint`، `ValidatorSet`، `SignedCheckpoint`، `TrustedState`، `Misbehaviour` | أنواع البيانات |
| `encodeCheckpoint`، `decodeCheckpoint` | الترميز القانوني لنقطة التحقق؛ وفاكّ ترميز صارم |
| `encodeValidatorSet`، `decodeValidatorSet`، `hashValidatorSet` | ترميز مجموعة المُصادِقين وتجزئتها بـ SHAKE-256 |
| `encodeSignedCheckpoint`، `decodeSignedCheckpoint` | البايتات التي يحملها المُرحِّل |
| `encodeCheckpointSignBytes` | بايتات التوقيع، `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)` |
| `newTrustedState` | من جذر الثقة إلى الحالة الموثوقة (يتحقق من أن المجموعتين تتجزآن إلى القيمتين الموجودتين في نقطة التحقق؛ ولا يتحقق من التواقيع) |
| `verifyCheckpoint(trusted, signed, now)` | تحقق كامل؛ يعيد الحالة الموثوقة الجديدة أو خطأً مُنمَّطًا |
| `detectMisbehaviour(set, a, b)` | أدلة لنقاط التحقق المتعارضة، أو لا شيء |
| `signCheckpoint` | توقيع نقطة تحقق بمفتاح سري ML-DSA-87 (للمحاكيات والاختبارات) |
| `CheckpointSource`، `fetchCheckpoint`، `chainCheckpointSource` (TypeScript) أو `ChainCheckpointSource` (Rust وGo) | واجهات لواجهة عقدة مستقبلية؛ وهي تفشل اليوم دائمًا بـ `REQUIRES_CHAIN_SUPPORT` ولا ترسل أي طلب |
| `PqLightClientError` (TypeScript)، و`*Error` مع `ErrInsufficientPower` وأمثالها (Go، استخدم `errors.Is`)، و`Error` مع `code()` (Rust) | أخطاء مُنمَّطة برموز ثابتة |

رموز الأخطاء، المشتركة بين اللغات الثلاث، وما ينبغي للمُرحِّل فعله (من دليل المُرحِّل):

| الخطأ | الإجراء |
|---|---|
| `MALFORMED` | أسقِط البايتات؛ المصدر معيب |
| `CHAIN_ID_MISMATCH` | خطأ في الإعداد |
| `TRUST_EXPIRED` | توقّف؛ وأعد التهيئة من جذر ثقة جديد |
| `FUTURE_CHECKPOINT` | افحص الساعة المحلية؛ وأعد المحاولة لاحقًا |
| `NOT_NEWER` | لا جديد؛ انتظر |
| `SET_MISMATCH` | نقطة تحقق فيها تدوير للمجموعة مفقودة؛ اجلب الحقب التي بينهما |
| `UNKNOWN_VALIDATOR`، `BAD_SIGNATURE` | أسقِط نقطة التحقق |
| `INSUFFICIENT_POWER` | انتظر مزيدًا من التواقيع |
| `CONFLICTING_CHECKPOINT` | أوقف الترحيل وأبلغ عن الأدلة |
| `REQUIRES_CHAIN_SUPPORT` | متوقع اليوم |

## طريقة الوصول {#how-to-access}

- **الشبكة الرئيسية `qorechain-vladi` وشبكة الاختبار `qorechain-diana`:** لا تُنتج أي نقاط تحقق، ولذلك لا تستطيع المُتحقِّقات تتبّع أي من الشبكتين. لا يدعمها أي إصدار من السلسلة ولا شيء مجدول.
- ما تفعله الشبكتان اليوم: مفاتيح إجماع المُصادِقين هي ed25519، وإضافات التصويت (vote extensions) معطّلة، وتستخدم IBC نوع العميل الخفيف القياسي 07.
- **لتشغيل الحزمة** لا تحتاج إلى شيء سوى بيئة تشغيل اللغة. لا حساب ولا مفاتيح ولا نقطة نهاية ولا تكلفة. وتستخدم المتجهات مفاتيح اختبار عامة ومعرّفي السلسلة `qorechain-sim` و`qorechain-sim-21`.
- للمرجع فقط (لا تستخدمها هذه الحزمة): REST على `https://api.qore.host` و`https://api-testnet.qore.host`، وRPC على `https://rpc.qore.host` و`https://rpc-testnet.qore.host`.

## أين يُنشر {#where-published}

جرى الفحص في 27 أكتوبر 2026 مقابل كل سجل.

| السجل | الحزمة | الإصدار | الرابط |
|---|---|---|---|
| npm | `@qorechain/pq-light-client` | 0.1.0 (`latest`) | [npmjs.com](https://www.npmjs.com/package/@qorechain/pq-light-client) |
| crates.io | `qorechain-pq-light-client` | 0.1.0 | [crates.io](https://crates.io/crates/qorechain-pq-light-client) |
| وكيل وحدات Go | `github.com/qorechain/qorechain-pq-light-client/go` | v0.1.0 (الوسم `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) |

المصدر: [github.com/qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client) (الإصدار v0.1.0، شيفرة مصدرية دون ملفات ثنائية). الترخيص Apache-2.0.

## الحدود والمشكلات المعروفة {#limits}

- **لا تجعل QoreChain ولا أي قناة IBC ولا جسرًا ولا مُرحِّلًا من نوع ما بعد الكمّ.** مفاتيح إجماع المُصادِقين ليست من نوع ما بعد الكمّ اليوم، ولا ترقية مجدولة لتغيير ذلك.
- **لا تستطيع تتبّع شبكة حية.** تفشل `fetchCheckpoint` دائمًا بـ `REQUIRES_CHAIN_SUPPORT`. وهي تعمل على مجموعات مُصادِقين محاكاة وعلى المتجهات المشتركة.
- **المواصفة مسودة مفتوحة للمراجعة.** لا شيء فيها يُعدّ التزامًا.
- **ملاحظات تصميم دون شيفرة:** نوع عميل IBC (القسم 14) ومُتحقِّقات EVM وSolana (القسم 15).
- **الارتفاعات داخل الحقبة تبقى كلاسيكية.** حتى مع نقاط التحقق، سينطبق التحقق ما بعد الكمّي عند ارتفاعات نقاط التحقق.
- **ما يجوز وصفه بمسار ما بعد كمّي.** يجوز وصف المسار بأنه ما بعد كمّي عندما يتحقق طرفاه من حالة موقَّعة بتواقيع ما بعد كمّية للطرف الآخر، في الاتجاهين، دون أي خطوة كلاسيكية: لا عميل خفيف كلاسيكي عند أي من الطرفين، ولا غلاف SNARK قائم على الاقترانات (pairing)، ولا لجنة مُصدِّقين كلاسيكية. وتواقيع الحسابات ما بعد الكمّية وحدها لا تجعل المسار ما بعد كمّي. وتوقّع حسابات QoreChain بـ ML-DSA-87 وsecp256k1؛ فصِف ذلك بأنه "تواقيع حسابات ما بعد كمّية"، لا بأنه مسار ما بعد كمّي.
- **جذور الثقة ذاتية.** لا يستطيع البروتوكول حماية عميل يبدأ من جذر خاطئ.
- **ما قبل 1.0.** قد تغيّر الإصدارات الثانوية الواجهة البرمجية.

الصياغة المقترحة من صفحة الموقف في المستودع:

| الحالة | الصياغة |
|---|---|
| الحسابات توقّع بـ ML-DSA-87 | "post-quantum account signatures" |
| أحد الطرفين يتحقق من نقاط تحقق ما بعد كمّية والآخر لا | "post-quantum verification of QoreChain state on chain X; the return path is classical" |
| الطرفان يتحققان من حالة موقَّعة بتواقيع ما بعد كمّية، دون أي خطوة كلاسيكية | "post-quantum route" |

إلى أن يستوفي الطرفان القاعدة، صِف المسار بما يتحقق منه فعلًا، مثل "secured by the counterparty's classical light client".

## ملاحظات أمنية {#security}

- لا تحتفظ الحزمة بأي مفاتيح ولا تجري أي إدخال/إخراج. ولا تحتوي Rust على شيفرة `unsafe`؛ وفي TypeScript وGo لا ترسل `fetchCheckpoint` أي طلب.
- أجهزة فك الترميز صارمة: ترميز واحد لكل كائن، ويُرفض أي طول آخر للتوقيع أو المفتاح. ويجب على المُرحِّلات تمرير البايتات القانونية دون تغيير، لا إعادة ترميز.
- التواقيع الصادرة عن مُصادِقين خارج المجموعة تُبطل نقطة التحقق بدل أن تُتجاهل، وهذا يُبقي جميع التطبيقات على النتيجة نفسها.
- أبقِ ساعة المُتحقِّق متزامنة: الساعة السريعة تُنهي الثقة مبكرًا، والبطيئة ترفض نقاط التحقق الجديدة بوصفها `FUTURE_CHECKPOINT`.
- يفترض التصميم أن المُصادِقين الذين يملكون أكثر من ثلثي قوة كل مجموعة نقاط تحقق لا يوقّعون شيئًا سوى نقاط التحقق التي اعتمدتها عقدتهم.
- نطاقات التوقيع المقترحة (`qorechain-pqlc-checkpoint-v1|` و`qorechain-pqlc-key-pop-v1|`) مجرد مقترحات؛ وهي غير محجوزة على السلسلة اليوم.
- مفاتيح المتجهات مفاتيح اختبار عامة؛ لا تستخدمها أبدًا في أي شيء آخر.
- أبلغ عن الثغرات بسرية على security@qore.network.

## صفحات ذات صلة {#related}

- [مكتبة PQC](/developer-tools/pqc-library): روابط ML-DSA-87 وSHAKE-256 التي تقوم عليها المُتحقِّقات.
- [QoreSign](/qoresign/overview): تواقيع ML-DSA-87 على مستوى الحساب، وهي أمر مختلف عن نقاط تحقق المُصادِقين.
- [الأمان ما بعد الكمّي](/architecture/post-quantum-security): نموذج ما بعد الكمّ للسلسلة اليوم.
- [بنية الجسر](/architecture/bridge-architecture) و[تجسير الأصول](/user-guide/bridging-assets): المسارات عبر السلاسل اليوم تستخدم العميل الخفيف الكلاسيكي القياسي.
- [QoreSeal](/developer-tools/qoreseal): الطقم الآخر من نوع ما بعد الكمّ بالإصدار 0.1.0 المنشور في 27 أكتوبر 2026.
- [نظرة عامة على حزم المطورين](/developer-tools/overview).
