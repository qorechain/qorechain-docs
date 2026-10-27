---
slug: /developer-tools/qoreseal
title: QoreSeal
sidebar_label: QoreSeal
sidebar_position: 30
---

# QoreSeal (`qoreseal`)

QoreSeal مكتبة مفتوحة المصدر تشفّر البيانات إلى حسابات QoreChain باستخدام ML-KEM-1024 (FIPS 203). ينشر الحساب مفتاحه العام ML-KEM-1024 على السلسلة؛ وعندها يستطيع أي شخص تشفير حمولة يمكن لهذا الحساب، ولأي مستلم آخر يضيفه المرسل، قراءتها. وهي موجّهة لمطوري dApp الذين يحتاجون إلى حمولات سرّية (مذكرات وفواتير ومستندات ومزايدات)، وللمدقّقين الذين يحتاجون إلى صلاحية اطّلاع، ولمشغّلي المجموعات الخاصة والسلاسل الجانبية. تركّب هذه المكتبة بدائيات قياسية ولا تنفّذ أي بدائية بنفسها. الإصدار **0.1.0**، بترخيص Apache-2.0، وتصونها جمعية QoreChain.

وضعها في 27 أكتوبر 2026: التشفير نفسه يعمل دون اتصال في أي مكان، بلا شبكة ولا حساب. أما التشفير إلى عنوان مقروء من السلسلة فيحتاج إلى سجل مفاتيح KEM، وهو **حيّ على الشبكة التجريبية** (`qorechain-diana`) و**يصل إلى الشبكة الرئيسية (`qorechain-vladi`) بعد ترقية v3.2.5**، دون موعد محدد. الحزمة منشورة لـ Rust وGo وPython وSwift وKotlin/JVM وAndroid. أما حزمة TypeScript ‏`@qorechain/qoreseal` فهي **قادمة** وليست على npm بعد. البنية مسودة بانتظار مراجعة خارجية قبل 1.0.

تحمي QoreSeal محتوى الحمولة فقط، لا شيء غيره. تبقى العناوين وتوقيت المعاملات ومبالغ التحويلات وأحجام المغلفات وعدد المستلمين علنية على السلسلة. وهي ليست وسيلة لجعل المعاملات خاصة.

## الابتكارات {#innovations}

- **مغلف واحد، من 1 إلى 1,024 مستلمًا.** تُشفَّر الحمولة مرة واحدة بمفتاح بيانات عشوائي AES-256-GCM؛ ويُغلَّف مفتاح البيانات على حدة لكل مستلم، فتكلّف إضافة قارئ نحو 1.6 كيلوبايت، لا نسخة أخرى من الحمولة.
- **هجين افتراضيًا، دون تخفيض صامت أبدًا.** في وضع `hybrid` يجمع إدخال كل مستلم بين تغليف ML-KEM-1024 واتفاق X25519 عبر دامج SHA3-256، فتبقى البيانات محمية ما دام أحدهما صامدًا. أما وضع `mlkem` (ML-KEM-1024 وحده) فيجب اختياره صراحةً؛ ولا تعود المكتبة إليه من تلقاء نفسها.
- **ربط السياق.** يرتبط كل مغلف بمعرّف سلسلة وغرض عبر اشتقاق المفتاح (HKDF-SHA-256 بمعلومة `"qorechain-kem-v1|" + chainId + "|" + purpose`) وببيانات مرتبطة اختيارية. المغلف المختوم لغرض ما لا يُفتح تحت غرض آخر.
- **مفاتيح منشورة على السلسلة، وتفحصها السلسلة.** يسجّل الحساب مفتاحه ML-KEM-1024 بـ `MsgRegisterKEMKey`، موثَّقًا بالتوقيع الهجين للمعاملة. وتطبّق `validateMlkemPublicKey` الفحوصات نفسها التي تطبّقها السلسلة عند التسجيل.
- **بطاقات المستلمين.** يحتوي السجل مفتاح ML-KEM وحده ولا شيء غيره. أما مفتاح X25519 للوضع الهجين فيسافر في بطاقة يوقّعها الحساب بتوقيع الرسائل في [QoreSign](/qoresign/overview) ويربطها بمفتاح ML-KEM المسجّل على السلسلة. يتحقق المرسلون من البطاقة مقابل المفتاحين على السلسلة، فيمكن أن تأتي من أي قناة. وأقصى ما تفعله بطاقة مزوّرة أو قديمة هو خفض المغلف إلى قوة ML-KEM-1024، لأن جزء ML-KEM يستخدم دائمًا المفتاح الموجود على السلسلة.
- **مفاتيح العصور للمجموعات الخاصة.** ينشئ `EpochKeyManager` مفتاح عصر جديدًا عند كل تغيير في العضوية ويختمه للأعضاء الحاليين. يحتفظ العضو المُزال بمفاتيح العصور التي انتمى إليها ولا يستطيع قراءة ما بعدها.
- **دفعات مشفّرة مع التزامات.** ينتج ترميز الدفعات كتلة مشفّرة مع التزام بالنص المشفّر والتزام بالنص الصريح مملّح، جاهزة للتثبيت على QoreChain باستخدام [RDK](/rollups/overview).
- **البايتات نفسها في كل لغة.** TypeScript وGo تنفيذان أصليان؛ وRust هي النواة تحت Swift وKotlin وPython. تُفحص متجهات الاختبار المشتركة بايتًا ببايت في كل لغة، وتحمل الأخطاء رموزًا ثابتة (مثل `NOT_A_RECIPIENT` و`DECRYPTION_FAILED` و`CARD_INVALID` و`RECIPIENT_NEEDS_X25519` و`UNKNOWN_EPOCH` و`MALFORMED_ENVELOPE`).

## حالات الاستخدام {#use-cases}

1. **dApp يشفّر المذكرات أو الرسائل بين المستخدمين.** يختم تطبيق دردشة أو مدفوعات كل ملاحظة إلى عنوان المستلم بالدالة `sealToAddresses` ويخزّن نص `qoreseal:` في مذكرة (memo) أو عقد أو قاعدة بياناته الخاصة. لا يفتحه إلا مفتاح المستلم.
2. **فواتير ومستندات مع مفتاح مدقّق (اطّلاع).** تختم شركة فاتورة إلى المشتري والبائع ومفتاح مدقّق في مغلف واحد، مع رقم الفاتورة كبيانات مرتبطة. مفتاح المدقّق زوج مفاتيح QoreSeal عادي محفوظ في الإعدادات؛ ومفتاح واحد لكل ربع سنة (`deriveSealKeys` بفهرس جديد) يتيح للشركة أن تسلّم المدقّق الفترات قيد المراجعة فقط.
3. **مزايدات مختومة والالتزام ثم الكشف.** يختم مزاد المزايدات إلى مفتاح المزاد بـ `purpose: "bid:<auction id>"` وعنوان المزايد كبيانات مرتبطة، ويخزّن المغلفات، ويفتحها بعد الموعد النهائي.
4. **اتحادات أو سلاسل جانبية خاصة.** يستخدم مشغّل رول-أب خاص `EpochKeyManager` لمشاركة مفتاح العصر مع الأعضاء، ويشفّر كل دفعة بـ `PrivateBatchCodec`، ويثبّت الكتلة المشفّرة والتزاماتها على QoreChain باستخدام RDK.
5. **محافظ تقدّم "استلام بيانات مشفّرة".** تشتق المحفظة مفاتيح QoreSeal من عبارة حساب الاستعادة (الفهرس 0)، وتنشر مفتاح ML-KEM بـ `MsgRegisterKEMKey` موقّعة هجينًا، وتعرض بطاقة المستلم للتوقيع كنص عادي.
6. **مستلمو الاسترداد أو الضمان.** يضيف فريق الحفظ أو الامتثال مفتاح استرداد غير متصل إلى كل مغلف، فتبقى البيانات متاحة عند فقدان مفتاح المستخدم.
7. **خلفيات بـ Python أو Go.** تختم خدمة تقارير أو صادرات إلى قائمة من الحسابات، بتوافق بايتي مع كل اللغات الأخرى.

## كيف تعمل {#how-it-works}

البدائيات (لا تنفّذ QoreSeal أيًّا منها): ‏ML-KEM-1024 (FIPS 203؛ مفتاح التغليف 1,568 بايت، ومفتاح فك التغليف 3,168 بايت، والنص المشفّر 1,568 بايت)، وX25519 (RFC 7748)، ودامج SHA3-256، وHKDF-SHA-256، وAES-256-GCM (nonce من 96 بت ووسم من 128 بت).

**الختم**، باختصار:

1. يُسحب ملح عشوائي من 16 بايت ومفتاح بيانات عشوائي من 32 بايت.
2. لكل مستلم، تغليف ML-KEM-1024 إلى مفتاح المستلم؛ وفي الوضع الهجين أيضًا اتفاق X25519 مؤقت مع مفتاح X25519 للمستلم، ويُدمج السران بـ SHA3-256. يُشتق مفتاح تشفير المفاتيح بـ HKDF-SHA-256 (الملح، والمعلومة `"qorechain-kem-v1|" + chainId + "|" + purpose`) ويغلّف مفتاح البيانات بـ AES-256-GCM.
3. تُشفَّر الحمولة مرة واحدة بمفتاح البيانات، مع توثيق الترويسة كاملة والبيانات المرتبطة الاختيارية.

**بنية المغلف:** السحر `QSEL`، الإصدار 1، الوضع، بايتات الخوارزمية، الأعلام، الملح، عدد المستلمين، إدخال واحد لكل مستلم (التلميح، والنص المشفّر لـ ML-KEM، ومفتاح X25519 المؤقت في الوضع الهجين، ومفتاح البيانات المغلَّف)، ثم nonce، ثم النص المشفّر. الحجم: `56 + 1,664 x recipients + plaintext` بايت في الوضع الهجين و`56 + 1,632 x recipients + plaintext` في وضع `mlkem`. وفق المواصفة: مستلم واحد و1 كيلوبايت من النص الصريح تعطي 2,744 بايت (هجين)؛ و10 مستلمين و1 كيلوبايت تعطي 17,720 بايت.

لا يُكتب معرّف السلسلة والغرض داخل المغلف: يجب أن يمرّر المستلم القيم نفسها. معرّف سلسلة أو غرض أو بيانات مرتبطة خاطئة، أو أي تغيير في البايتات، يعطي `DECRYPTION_FAILED`.

**التلميحات.** تتيح التلميحات المملّحة للمستلم أن يجد إدخاله بسرعة. ومع `anonymous: true` تُصفَّر التلميحات ويجرّب المستلمون كل إدخال.

**الصيغة النصية.** تحوّل `envelopeToText` و`envelopeFromText` من وإلى `"qoreseal:" + base64url`.

**ما هو على السلسلة**

- سجل مفاتيح KEM في الوحدة `qorechain.pqc.v1`: ‏`MsgRegisterKEMKey` بالحقول `sender` و`algorithm_id = 2` (ML-KEM-1024) و`public_key`، و`MsgRemoveKEMKey` بالحقل `sender`. عناوين الأنواع: `/qorechain.pqc.v1.MsgRegisterKEMKey` و`/qorechain.pqc.v1.MsgRemoveKEMKey`.
- الاستعلام: `GET /qorechain/pqc/v1/kem/{address}` (يقبل الصيغة `qor1` أو `0x`)، ويُرجع `found` وعند العثور `key` مع `address` و`algorithm_id` و`algorithm_name` و`public_key` و`registered_height`.
- يُوثَّق التسجيل بالتوقيع الهجين للمعاملة. يجب أن يكون لدى المرسل مفتاح ML-DSA-87 مسجّل مسبقًا، وتُوقَّع المعاملة بـ `signHybrid` من QoreSign. مفتاح واحد لكل حساب؛ والتسجيل مجددًا يستبدله.
- حالات الرفض (codespace ‏`pqc`): ‏250 السجل غير مفعّل على هذه السلسلة بعد، 251 مفتاح KEM عام غير صالح، 252 لا مفتاح KEM منشور لهذا الحساب، 253 هذا المفتاح منشور فعلًا لهذا الحساب، 254 نشر مفتاح KEM يحتاج إلى مفتاح توقيع ما بعد كمّي مسجّل. تشرحها `describeKemRegistryError`.
- تذهب المغلفات نفسها إلى حيث يضعها التطبيق (المذكرات والعقود والملفات وواجهات API). ولا ترى السلسلة أي مفتاح سري أبدًا.

**بطاقة المستلم.** نحو 6.7 كيلوبايت من JSON، معظمها توقيع ML-DSA-87. يوقّع الحساب نصًا ثابتًا (`QoreSeal recipient card v1` ومعرّف السلسلة والعنوان وSHA3-256 لمفتاح ML-KEM ومفتاح X25519 ووقت الإصدار) بتوقيع الرسائل في QoreSign. تسجيل مفتاح ML-KEM جديد يُبطل كل بطاقة صُنعت للمفتاح القديم.

**المجموعات الخاصة.** تُختم حمولة مفتاح العصر (`QSEK` ورقم العصر ومفتاح من 32 بايت) في مغلف عادي إلى الأعضاء الحاليين. وكتلة الدفعة (`QSBT` والعصر وفهرس الدفعة والسياق مثل معرّف الرول-أب وnonce والنص المشفّر AES-256-GCM) حجمها `83 + context length + data length` بايت. الالتزامات: `ciphertextCommitment = SHA3-256(blob)` و`plaintextCommitment = SHA3-256("qorechain-qoreseal-batch-v1" || commitSalt || data)`، مملّحة كي لا يستطيع الغرباء تخمين المحتويات منخفضة الإنتروبيا.

المواصفة هي `spec/qoreseal-v1.md` في المستودع (الحالة: مسودة، والمراجعة جارية)؛ والمتجهات المشتركة هي `vectors/qoreseal-v1.json`.

## كيفية الاستخدام {#how-to-use}

### التثبيت {#install}

| اللغة | التثبيت | الحد الأدنى للمنصة |
|---|---|---|
| Rust | `cargo add qorechain-qoreseal` (اسم المكتبة `qoreseal`) | Rust المستقر |
| Go | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Go 1.25 |
| Python | `pip install qorechain-qoreseal` (الاستيراد `qoreseal`) | Python 3.9 أو أحدث؛ عجلات لـ macOS 11+ ‏(arm64 وx86_64) وLinux manylinux2014 ‏(x86_64 وaarch64)؛ لا عجلة لـ Windows بعد |
| Swift | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`، المنتج `QoreSeal` | iOS 16 وmacOS 13 |
| Kotlin / JVM | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Java 17؛ مترجم Kotlin 2.3 أو أحدث (يفشل البناء مع Kotlin 2.1) |
| Android | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | API 24؛ قواعد R8 keep مضمَّنة؛ مترجم Kotlin 2.3 أو أحدث |
| TypeScript | **قادمة**: ‏`@qorechain/qoreseal` ليست على npm بعد، ولذلك لا يوجد أمر تثبيت | |

مصدر TypeScript وأمثلته ومساعدات الشبكة موجودة في المستودع وتعمل منه بعد `pnpm install && pnpm build`. إلى أن تُنشر حزمة npm، اعتبر المستودع هو طريقة استخدام TypeScript، وتوقّع اسم الحزمة المذكور أعلاه.

### البداية السريعة 1: الختم والفتح دون اتصال (Python) {#quickstart-python}

شُغّلت في 27 أكتوبر 2026 على عجلة 0.1.0 المنشورة. بلا شبكة وبلا حساب. مستلمان، وبيانات مرتبطة، وفحص أن غرضًا آخر لا يفتح المغلف.

```python
import qoreseal as qs

alice = qs.generate_seal_keys()
bob = qs.generate_seal_keys()

envelope = qs.seal_envelope(
    "qorechain-diana", "invoice",
    [qs.recipient_of(alice), qs.recipient_of(bob)],
    b"amount due: 120 QOR",
    aad=b"invoice-42",
)
text = qs.envelope_to_text(envelope)  # "qoreseal:..."

plaintext = qs.open_envelope("qorechain-diana", "invoice", envelope, bob, aad=b"invoice-42")
assert plaintext == b"amount due: 120 QOR"
print(len(envelope), text[:20], plaintext)

# A different purpose never opens the envelope.
try:
    qs.open_envelope("qorechain-diana", "chat", envelope, bob, aad=b"invoice-42")
except qs.QoreSealError.Failure as e:
    print("other purpose:", e.code)
```

طبعت `3403 qoreseal:UVNFTAEBAgE b'amount due: 120 QOR'` ثم `other purpose: DECRYPTION_FAILED`. الطول هو 56 + 2 x 1,664 + 19 = 3,403 بايت.

### البداية السريعة 2: الختم والفتح دون اتصال (Go) {#quickstart-go}

شُغّلت على v0.1.0 من وكيل وحدات Go.

```go
package main

import (
	"fmt"

	qoreseal "github.com/qorechain/qoreseal/go"
)

func main() {
	alice, _ := qoreseal.GenerateSealKeys()
	auditor, _ := qoreseal.GenerateSealKeys()

	envelope, err := qoreseal.Seal(qoreseal.SealArgs{
		ChainID:    "qorechain-diana",
		Purpose:    "invoice",
		Recipients: []qoreseal.SealRecipient{qoreseal.RecipientOf(alice), qoreseal.RecipientOf(auditor)},
		Plaintext:  []byte("120 QOR due on 2026-11-30"),
		AAD:        []byte("invoice-42"),
	})
	if err != nil {
		panic(err)
	}
	plaintext, err := qoreseal.Open(qoreseal.OpenArgs{
		ChainID: "qorechain-diana", Purpose: "invoice", Envelope: envelope, Keys: auditor, AAD: []byte("invoice-42"),
	})
	fmt.Println(len(envelope), string(plaintext), err)
}
```

طبعت `3409 120 QOR due on 2026-11-30 <nil>`.

تستخدم Rust وSwift وKotlin الدوال نفسها (`seal` و`open` و`generate_seal_keys` وهكذا، بحالة الأحرف الخاصة بكل لغة). لم تُشغَّل أمثلتها لهذه الصفحة.

### البداية السريعة 3: مجموعة خاصة بالعصور (Python، دون اتصال) {#quickstart-group}

تتبع مثال المستودع `examples/private-rollup`. تبدأ alice وbob من العصر 1، وتنضم carol (العصر 2)، ويُزال bob (العصر 3). يستطيع bob قراءة العصر 1 ولا يستطيع قراءة العصر 3.

```python
import qoreseal as qs

chain_id, rollup_id = "qorechain-diana", "demo-private-rollup"
purpose = f"epoch-key:{rollup_id}"
alice, bob, carol = qs.generate_seal_keys(), qs.generate_seal_keys(), qs.generate_seal_keys()

mgr = qs.EpochKeyManager(chain_id, purpose, [
    qs.GroupMember(id="alice", recipient=qs.recipient_of(alice)),
    qs.GroupMember(id="bob", recipient=qs.recipient_of(bob)),
])
bob_keys = [qs.open_epoch_key(chain_id, purpose, mgr.distribution(), bob)]  # epoch 1

b1 = mgr.seal_batch(rollup_id, 1, b'{"txs":["alice pays bob 5"]}')
mgr.add_member("carol", qs.recipient_of(carol))   # epoch 2
mgr.remove_member("bob")                          # epoch 3
b3 = mgr.seal_batch(rollup_id, 3, b'{"txs":["alice pays carol 1"]}')

print(qs.open_batch(b1.blob, bob_keys).data)      # bob read epoch 1
try:
    qs.open_batch(b3.blob, bob_keys)              # bob was removed before epoch 3
except qs.QoreSealError.Failure as e:
    print("bob, epoch 3:", e.code)
print(b3.ciphertext_commitment.hex(), b3.plaintext_commitment.hex())
```

طبعت دفعة العصر 1 الخاصة بـ bob، ثم `bob, epoch 3: UNKNOWN_EPOCH`، ثم الالتزامين (عشوائيان في كل تشغيل).

لتثبيت دفعة مختومة باستخدام [RDK](/rollups/overview)، تكون الكتلة المشفّرة هي كتلة توافر البيانات الأصلية وSHA-256 الخاص بها هو `data_hash` للدفعة (TypeScript، من دليل المستودع؛ لم تُشغَّل لهذه الصفحة):

```ts
import { buildDaBlob, submitBatchMsg } from "@qorechain/rdk";

const codec = new PrivateBatchCodec("my-rollup", mgr);
const sealed = codec.seal(batchIndex, batchBytes);
const blob = buildDaBlob({ data: sealed.blob, maxBlobSize: params.maxDaBlobSize });
const msg = submitBatchMsg({ sequencer, rollupId: "my-rollup", batchIndex, stateRoot, txCount, dataHash: blob.dataHash });
```

راجع [توافر البيانات](/rollups/data-availability) لمعرفة كيف تُنشر دفعات الرول-أب.

### التشفير إلى عنوان على الشبكة التجريبية {#encrypt-to-address}

تحتاج إلى حساب على `qorechain-diana` تتحكم به وفيه قدر قليل من QOR التجريبي ومفتاح ML-DSA-87 مسجّل (مثال QoreSign ‏`register-and-send` يسجّل واحدًا). استخدم عبارة استعادة للشبكة التجريبية، وليس للشبكة الرئيسية أبدًا، ولا تستخدم عبارة الاختبار العامة مع أموال أبدًا. هذا التدفق موصوف من دليل المستودع ولم يُشغَّل لهذه الصفحة.

1. اشتق المفاتيح من عبارة الحساب: `deriveSealKeys({ mnemonic })` (الفهرس 0). والعبارة هي أيضًا نسختها الاحتياطية.
2. انشر مفتاح ML-KEM-1024: `buildRegisterKemKeyMessage({ sender: address, mlkemPublicKey: sealKeys.mlkemPublicKey })`، وضعها في جسم معاملة، ووقّعها بـ `signHybrid` من QoreSign، ثم حاكِها بـ `simulateTx` وأرسلها بـ `submitWithSignBytesFallback`. عند الرفض، تشرحه `describeKemRegistryError(res.codespace, res.code)`.
3. تحقق منه: `GET https://api-testnet.qore.host/qorechain/pqc/v1/kem/<address>`. يُجيب `{"found":false,"key":null}` لحساب لم ينشر مفتاحًا.
4. وقّع بطاقة مستلم: `signRecipientCard({ chainId: "qorechain-diana", address, keys: sealKeys, classicalKey, pqKey })`، وانشرها حيث يستطيع المرسلون جلبها.
5. من جهة المرسل: `sealToAddresses({ rest: "https://api-testnet.qore.host", chainId: "qorechain-diana", purpose: "note", recipients: [{ address, card }], plaintext })`. دون بطاقة، مرّر `mode: "mlkem"`.
6. من جهة المستلم: `open({ chainId: "qorechain-diana", purpose: "note", envelope, keys: sealKeys })`.

التدفق الكامل القابل للتشغيل هو مثال المستودع `examples/register-and-encrypt`. وهو يرفض الشبكة الرئيسية إلى أن تطبّق ترقية v3.2.5. تقدّم Go جهة المرسل نفسها بـ `network.NewClient(rest).SealToAddresses(ctx, network.SealToArgs{...})`. أما Rust وSwift وKotlin وPython فتعمل دون اتصال: اقرأ `/qorechain/pqc/v1/kem/{address}` و`/qorechain/pqc/v1/account/{address}` بنفسك، وتحقق من البطاقة (`verify_recipient_card`)، ثم اختم.

### واجهة API الرئيسية {#api}

الأسماء بصيغة TypeScript. تستخدم Go حالة أحرف Go ‏(`Seal` و`Open` و`NewEpochKeyManager`)، وتستخدم Rust وPython صيغة snake_case. وفي Python وSwift وKotlin تكون `seal` و`open` هما `seal_envelope` / `sealEnvelope` و`open_envelope` / `openEnvelope`.

| الاسم | ما يفعله | أين |
|---|---|---|
| `generateSealKeys` | زوج مفاتيح عشوائي (ML-KEM-1024 + X25519) | الكل |
| `deriveSealKeys` | زوج مفاتيح من عبارة BIP-39 مع عبارة مرور وفهرس اختياريين | الكل |
| `sealKeysFromSeed`, `sealSeedFromMnemonic` | الاستعادة من البذرة ذات 32 بايت؛ بذرة من عبارة | الكل |
| `recipientOf` | مستلم عام من زوج مفاتيح | الكل |
| `validateMlkemPublicKey`, `validateX25519PublicKey` | فحوصات المدخلات (تطبّق السلسلة فحص ML-KEM نفسه) | الكل |
| `seal` | تشفير إلى 1 إلى 1,024 مستلمًا (`mode` و`aad` و`anonymous`) | الكل |
| `open` | فك التشفير بزوج مفاتيح | الكل |
| `parseEnvelope`, `envelopeSize` | فحص مغلف؛ حساب حجمه | الكل |
| `envelopeToText`, `envelopeFromText` | الصيغة النصية `qoreseal:` | الكل |
| `signRecipientCard`, `verifyRecipientCard` | إنشاء بطاقة المستلم وفحصها | الكل |
| `recipientCardText`, `recipientCardFields`, `assembleRecipientCard` | بناء بطاقة عند التوقيع في مكان آخر، مثل واجهة محفظة | الكل |
| `buildRegisterKemKeyMessage`, `buildRemoveKemKeyMessage` | رسائل السجل، لتُوقَّع هجينًا بـ QoreSign | الكل |
| `describeKemRegistryError` | تشرح رموز codespace ‏`pqc` من 250 إلى 254 | الكل |
| `EpochKeyManager` | مفاتيح العصور لمجموعة: `addMember` و`removeMember` و`rotate` و`distribution` و`exportKeys` و`keyFor` و`members` و`epoch` | الكل |
| `sealEpochKey`, `openEpochKey` | إرسال مفتاح عصر أو استلامه (مثلًا التاريخ لعضو جديد) | الكل |
| `PrivateBatchCodec`, `sealBatch`, `openBatch`, `parseBatchHeader`, `batchSize` | دفعات مشفّرة مع التزامات | الكل |
| `fetchKemKey`, `fetchMlkemPublicKey` | قراءة مفتاح ML-KEM لحساب من REST | TypeScript، وحزمة الشبكة في Go |
| `resolveRecipient` | المفاتيح على السلسلة مع البطاقة، متحقَّق منها، كمستلم | TypeScript، وحزمة الشبكة في Go |
| `sealToAddresses` | الختم إلى حسابات بالعنوان | TypeScript، وحزمة الشبكة في Go |

مساعدات الشبكة هي `@qorechain/qoreseal/network` في TypeScript و`github.com/qorechain/qoreseal/go/network` في Go. كما تُصدَّر لبنات أدنى مستوى (`mlkemEncapsulate` و`mlkemDecapsulate` و`x25519Agree` و`hybridSharedSecret` و`deriveKey` و`kdfInfo` و`recipientHint`). أما الدوال المسمّاة للاختبار (`sealWithEntropy` و`testing_*`) فهي موجودة لإعادة إنتاج متجهات الاختبار ويجب ألا تُستخدم أبدًا مع بيانات حقيقية.

تُثير أخطاء Python الاستثناء `QoreSealError.Failure` برمز `code` ثابت؛ وتُقارَن أخطاء Go بـ `qoreseal.IsCode`.

## كيفية الوصول {#how-to-access}

| | الشبكة الرئيسية `qorechain-vladi` | الشبكة التجريبية `qorechain-diana` |
|---|---|---|
| سجل مفاتيح KEM | بعد ترقية v3.2.5 (لم تُطبَّق بعد، دون موعد) | حيّ |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` (معرّف السلسلة 9801) | `https://evm-testnet.qore.host` (معرّف السلسلة 9800) |

في 27 أكتوبر 2026 أجاب استعلام السجل على الشبكة التجريبية بـ `{"found":false,"key":null}` لحساب بلا مفتاح، وأجاب الاستعلام نفسه على الشبكة الرئيسية بـ "Not Implemented".

- الختم والفتح دون اتصال، بما فيه مفاتيح المدقّق الممرَّرة مباشرة والمجموعات الخاصة والدفعات، لا يحتاج إلى شبكة ولا إلى حساب.
- التشفير إلى عنوان يتطلب أن يكون المستلم قد نشر مفتاح ML-KEM-1024 في السجل، وفي الوضع الهجين بطاقة مستلم.
- نشر مفتاح يحتاج إلى حساب فيه QOR تجريبي (وعلى الشبكة الرئيسية QOR بعد الترقية)، ومفتاح ML-DSA-87 مسجّل، وQoreSign لتوقيع المعاملة هجينًا. الحد الأدنى للرسوم 0.1 uqor لكل وحدة غاز. احصل على QOR التجريبي من [الصنبور](/dashboard/faucet).
- إلى أن تطبّق الشبكة الرئيسية v3.2.5، لا يتوفر استعلام السجل على الشبكة الرئيسية ويُرفض التسجيل (الرمز 250).

## أين تُنشر {#where-published}

فُحصت في 27 أكتوبر 2026 مقابل كل سجل.

| السجل | الحزمة | الإصدار | الرابط |
|---|---|---|---|
| crates.io | `qorechain-qoreseal` | 0.1.0 | [crates.io/crates/qorechain-qoreseal](https://crates.io/crates/qorechain-qoreseal) |
| وكيل وحدات Go | `github.com/qorechain/qoreseal/go` | v0.1.0 (الوسم `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoreseal/go) |
| PyPI | `qorechain-qoreseal` | 0.1.0 (عجلات لـ macOS arm64 وx86_64 وLinux x86_64 وaarch64، إضافة إلى المصدر) | [pypi.org/project/qorechain-qoreseal](https://pypi.org/project/qorechain-qoreseal/) |
| Swift Package Manager | `QoreSeal` من `github.com/qorechain/qoreseal` | 0.1.0 (الملف الثنائي `QoreSealFFI.xcframework.zip` في إصدار GitHub) | [release v0.1.0](https://github.com/qorechain/qoreseal/releases/tag/v0.1.0) |
| Maven Central | `io.github.qorechain:qoreseal` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) |
| Maven Central | `io.github.qorechain:qoreseal-android` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) |
| npm | `@qorechain/qoreseal` | لم تُنشر بعد (قادمة) | |

تحتاج المشاريع التي تستخدم أيًّا من قطعتَي Maven إلى مترجم Kotlin 2.3 أو أحدث. تضمّ قطعة Kotlin/JVM مكتبات أصلية لـ macOS ‏(arm64 وx86_64) وLinux ‏(x86_64 وarm64) وWindows ‏(x86_64)؛ وتغطي قطعة Android المعماريات arm64-v8a وarmeabi-v7a وx86_64.

المصدر: [github.com/qorechain/qoreseal](https://github.com/qorechain/qoreseal) (الإصدار v0.1.0). الترخيص Apache-2.0.

## الحدود والمشكلات المعروفة {#limits}

- **المحمي هو محتوى الحمولة.** تبقى عناوين المرسل والمستلم ومبالغ التحويلات المصرفية وتوقيت المعاملات وأحجام المغلفات وعدد المستلمين علنية على السلسلة.
- **ليست معاملات خاصة.** لا تخفي QoreSeal من يتعامل مع من، ولا بكم.
- **لا براهين المعرفة الصفرية.** لا شيء يثبت أي شيء عن البيانات المشفّرة؛ وفي سلسلة جانبية خاصة لا يستطيع المدقّقون خارج المجموعة فحص ما يجري داخل الدفعة.
- **المغلفات غير موقّعة.** يستطيع أي شخص التشفير إلى عنوان، وبإمكان أي مستلم لمغلف متعدد المستلمين أن يبني مغلفًا مختلفًا للآخرين. وقّع المحتوى أو المغلف (`signMessage` في QoreSign) عندما يجب توثيق هوية المرسل.
- **يقرأ كل مستلم الحمولة كاملة.** لا حجب لأجزاء لكل مستلم؛ اختم مغلفات منفصلة لقرّاء مختلفين.
- **التلميحات ليست إخفاءً للهوية.** يستطيع من يعرف المفتاح العام لمرشّح (وهو على السلسلة) أن يختبر هل ذلك المفتاح مستلم. تُصفّر `anonymous: true` التلميحات؛ وعندها يجرّب المستلمون كل إدخال.
- **فقدان المفتاح يعني فقدان البيانات.** لا استرداد على السلسلة. فقدان البذرة أو العبارة يفقد كل ما خُتم إلى ذلك المفتاح.
- **إزالة مفتاح أو تدويره لا يمحو شيئًا ولا يعيد تشفيره.** تبقى البيانات المختومة إلى مفتاح قديم مقروءة لمن يحمله؛ احتفظ بالبذور أو الفهارس القديمة.
- **الأعضاء المُزالون من المجموعات** يحتفظون بمفاتيح العصور التي انتموا إليها. ويقرأ الأعضاء الجدد من عصر انضمامهم فصاعدًا ما لم تُختم لهم المفاتيح الأقدم.
- **معرّف السلسلة والغرض ليسا في المغلف؛** يجب أن يعرفهما المستلم.
- **سجل الشبكة الرئيسية:** غير متاح إلى أن تطبّق الشبكة الرئيسية v3.2.5.
- **قبل 1.0، والبنية بانتظار مراجعة خارجية.** قد تغيّر الإصدارات الفرعية الواجهة. اقرأ المواصفة قبل الاعتماد عليها.
- **لا حزمة npm بعد** ولا عجلة Python لـ Windows بعد.

## ملاحظات أمنية {#security}

- لا تغادر المفاتيح السرية الجهاز أو الخادم الذي يشغّل QoreSeal. تخزّن السلسلة المفتاح العام ML-KEM-1024 وحده، وتحمل البطاقة المفتاح العام X25519.
- احتفظ بنسخة احتياطية من عبارة الحساب، أو عبارة مخصصة، أو البذرة ذات 32 بايت (`keys.seed`)، مشفّرة أثناء التخزين. لا تصدّر المفتاح السري لـ ML-KEM وحده أبدًا؛ صدّر البذرة أو العبارة.
- التدوير: انتقل إلى الفهرس التالي، وسجّل مفتاح ML-KEM الجديد، ووقّع بطاقة جديدة. تتوقف البطاقات القديمة عن النجاح في التحقق تلقائيًا.
- أضف مستلم استرداد (مفتاحًا غير متصل) إلى البيانات التي يجب أن تبقى متاحة عند فقدان مفتاح المستخدم. تعامل معه كمفتاح مدقّق، لأنه يقرأ كل ما أُضيف إليه.
- للمجموعات، يحتوي `exportKeys()` كل مفاتيح العصور. اختم ذلك التصدير إلى مفتاح المشغّل نفسه ومفتاح استرداد غير متصل، وأبقِه بعيدًا عن جهاز المسلسِل (sequencer). دوّر مفاتيح العصور وفق جدول.
- يجب اختيار وضع `mlkem` صراحةً؛ والوضع الهجين لا يتراجع صامتًا أبدًا.
- تأتي البدائيات من روابط [`qorechain-pqc`](/developer-tools/pqc-library) ومن مكتبات راسخة (noble لـ TypeScript، وحزم RustCrypto، والمكتبة القياسية في Go)؛ وتأتي توقيعات الحسابات من [QoreSign](/qoresign/overview).
- أبلغ عن الثغرات سرًّا إلى security@qore.network. كون البيانات الوصفية على السلسلة علنية هو بالتصميم وموضوع توثيق، وليس ثغرة.

## صفحات ذات صلة {#related}

- [QoreSign](/qoresign/overview): التوقيع الهجين لمعاملة التسجيل، وتوقيع الرسائل خلف بطاقات المستلمين والمغلفات الموقّعة.
- [نظرة عامة على RDK](/rollups/overview) و[توافر البيانات](/rollups/data-availability): تثبيت الدفعات المشفّرة لسلسلة جانبية خاصة.
- [مكتبة PQC](/developer-tools/pqc-library): روابط ML-KEM-1024 تحت QoreSeal.
- [الأمان ما بعد الكمّي](/architecture/post-quantum-security) و[التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing): كيف تعمل الحسابات والمفاتيح على السلسلة.
- [نظرة عامة على حزم المطورين](/developer-tools/overview).
