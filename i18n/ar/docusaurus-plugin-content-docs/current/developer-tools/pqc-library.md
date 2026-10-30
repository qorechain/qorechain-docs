---
slug: /developer-tools/pqc-library
title: مكتبة ما بعد الكمّ (qorechain-pqc)
sidebar_label: مكتبة PQC
sidebar_position: 20
---

# مكتبة ما بعد الكمّ (`qorechain-pqc`)

`qorechain-pqc` هي مكتبة التشفير ما بعد الكمّي المعتمدة على المعايير فقط، والتي تُبنى عليها أدوات QoreChain. وهي موجّهة لمطوري المحافظ والخوادم الخلفية والبورصات والأدوات الذين يحتاجون إلى إنشاء المفاتيح والتواقيع التي تستخدمها السلسلة بدقة أو فحصها، دون الاعتماد على [QoreChain SDK](/sdk/overview) الكامل. تغلّف تطبيقات مستقلة لثلاثة معايير من NIST (ML-DSA، FIPS 204، للتواقيع؛ وML-KEM، FIPS 203، لتغليف المفاتيح؛ وSHAKE-256، FIPS 202، بوصفها دالة التجزئة) خلف واجهة برمجية واحدة في TypeScript/JavaScript وPython وRust وGo وJava وC، وتضيف المساعدات التي تبني البايتات التي توقّعها معاملة QoreChain الهجينة. الإصدار **0.2.3**، ترخيص Apache-2.0، جرى فحصه مقابل السجلات في 27 أكتوبر 2026.

هي مكتبة أساسيات (primitives). لا تتصل بالشبكة ولا تحتفظ بالمفاتيح ولا تسجّل المفاتيح على السلسلة ولا ترسل المعاملات. لقواعد السلسلة المتعلقة بالتواقيع الهجينة وتسجيل المفاتيح اقرأ [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing) و[الأمان ما بعد الكمّي](/architecture/post-quantum-security)؛ وللحصول على عميل توقيع جاهز استخدم [SDK](/sdk/overview) أو [QoreSign](/qoresign/overview)، وكلاهما مبني على هذه الأساسيات.

## الابتكارات {#innovations}

* **مجموعة واحدة من متجهات الاختبار، وست خلفيات مستقلة.** تستخدم رابطة JavaScript الحزمة `@noble/post-quantum`، وتستخدم Rust الحزم `fips204` و`fips203` و`sha3`، وتستخدم Go مكتبة Cloudflare CIRCL، وتستخدم Java مكتبة Bouncy Castle، وتستخدم Python وC مكتبة liboqs. يجب أن تُعيد مجموعة اختبارات كل رابطة إنتاج الملفات نفسها في مجلد `vectors/` بالمستودع (ML-DSA بثلاثة مستويات، وML-KEM بثلاثة مستويات، وSHAKE-256) بايتاً ببايت، لذا فإن توقيعاً أُنتج بلغة ما يُتحقَّق منه في اللغات الأخرى.
* **التوقيع الحتمي افتراضياً.** تستخدم `sign` النسخة الحتمية من FIPS 204 (عشوائية توقيع من 32 بايتاً صفرياً)، فيعطي المفتاح والرسالة نفسهما توقيعاً متطابقاً بايتاً ببايت في كل رابطة. وهذا يجعل التواقيع، وتجزئات المعاملات التي تحتويها، قابلة لإعادة الإنتاج والفحص مقابل المتجهات.
* **التوقيع المحصَّن (hedged) خيار صريح يعمل بتوافق.** التوقيع العشوائي (المحصَّن) متاح بالصيغة `{hedged: true}` في JavaScript و`hedged=True` في Python و`sign_hedged` في Rust و`SignHedged` في Go (أُضيفت في 0.2.3) و`mldsaSignHedged` في Java و`qpqc_mldsa_sign_hedged` في C. التوقيع المحصَّن المُنتَج بأي من اللغات الست يُتحقَّق منه في الست جميعاً (فُحصت 36 من 36 تركيبة للإصدار 0.2.3). تتحقق السلسلة من أي توقيع ML-DSA-87 صالح وفق FIPS 204، فتقبل النوعين؛ ولا يمكن التمييز بينهما دون المفتاح السري.
* **sign-bytes الهجينة للسلسلة، مبنية بالطريقة التي تبنيها بها السلسلة.** في كل رابطة `hybridSignBytesV1` و`hybridSignBytesV2` ودالة موزِّعة `hybridSignBytes(version, chainId, body, authInfo)` تشترط الإصدار. صيغة v2 هي `"qorechain-pqc-hybrid-v2"`، ثم معرّف السلسلة مع طول بـ 64 بتاً بترتيب big-endian، ثم جسم المعاملة (دون امتداد PQC) ومعلومات المصادقة، لكل منهما طول بـ 32 بتاً بترتيب big-endian. تُختبر كل الروابط مقابل ملف الإجابات المعروفة للسلسلة (`vectors/signbytes-kat-v3.1.98.json`). ويُرفض معرّف السلسلة الفارغ في نقاط الدخول المفحوصة، لأن البايتات غير المرتبطة بأي سلسلة لا يُتحقَّق منها على أي شبكة.
* **إصدار sign-bytes للشبكة تحدده دالة نقية.** تتحقق الشبكة من صيغة واحدة فقط في كل مرة، وطُبّق التحول إلى v2 تحت اسمَي خطة (`v3.2.0` على الشبكة الرئيسية عند الارتفاع 2,981,742 و`v3.1.98` على شبكة الاختبار). تسرد `SIGN_BYTES_V2_UPGRADES` الاسمين، وتعيد `signBytesVersionForApplied(chainId, appliedHeights)` القيمة `v1` أو `v2` من الارتفاعات المطبَّقة التي تقرؤها من العقدة. والسؤال عن اسم واحد فقط قد يسيء قراءة شبكة تحولت تحت الاسم الآخر.
* **فحص صارم للمدخلات.** لا تُطلق `verify` أي خطأ: المفتاح أو التوقيع بطول خاطئ، أو أي مدخل مشوَّه آخر، يعيد `false`. أما `keygen(seed)` و`sign` و`encapsulate` و`decapsulate` فتُطلق خطأً يسمّي المعامل الخاطئ وطوله المتوقع.
* **JavaScript خالصة، دون شيفرة أصلية.** تعمل حزمة npm في Node وفي المتصفحات دون WebAssembly أو إضافات. في قياس المستودع نفسه على حاسوب محمول بمعالج Apple silicon (الإصدار 0.2.3، رسالة 1.5 كيلوبايت، نواة واحدة) يوقّع ML-DSA-87 في نحو 8 مللي ثانية في JavaScript ونحو 0.3 إلى 0.45 مللي ثانية في الروابط الخمس الأخرى.

## طريقة الاستخدام {#how-to-use}

تتيح حزم السجل الخمس العمليات نفسها: `keygen` و`keygenFromSeed` (بذرة من 32 بايتاً) و`sign` و`verify`؛ وML-KEM بعمليات `keygen` و`encapsulate` و`decapsulate`؛ و`shake256`؛ و`pubkeyHash`؛ ومساعدات sign-bytes. الافتراضيان هما ML-DSA-87 وML-KEM-1024، وتُصدَّر بجانبهما النسخ الخاصة بكل مستوى (44 و65 و87 و512 و768 و1024). لـ ML-DSA-87 مفتاح عام بحجم 2,592 بايتاً وتوقيع بحجم 4,627 بايتاً، وهما ما تطبعه الأمثلة أدناه.

### التثبيت والاستيراد {#install}

| اللغة | التثبيت | الاستيراد |
| --- | --- | --- |
| TypeScript / JavaScript | `npm install @qorechain/pqc` | `import { mldsa } from "@qorechain/pqc"` |
| Python (3.9 أو أحدث) | `pip install qorechain-pqc` | `from qorpqc import mldsa` |
| Rust | `cargo add qorechain-pqc` | `use qorechain_pqc::mldsa;` |
| Go | `go get github.com/qorechain/qorechain-pqc/go` | `import pqc "github.com/qorechain/qorechain-pqc/go"` |
| Java | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | `import network.qorechain.pqc.Pqc;` |
| C | ابنِ `c/` من المستودع (مكتبة ساكنة وترويسة) | `qorechain_pqc.h` |

### التوقيع والتحقق في كل لغة {#examples}

هذه هي البدايات السريعة من مركز المطورين. شُغّل كل منها دون تعديل في 27 أكتوبر 2026 بعد التثبيت من السجل العام (Node 26 وPython 3.12 مع وجود liboqs وRust 1.95 وGo 1.26 وJDK 21 مع Gradle 9.6)، وطبع حجم المفتاح العام وحجم التوقيع ونتيجة التحقق: `2592 4627 true` (تطبع Python القيمة `True`). لا يستخدم أي منها الشبكة ولا مفتاحاً ممولاً، ولا بدء سريع لرابطة C.

TypeScript:

```ts
import { mldsa } from "@qorechain/pqc";

// ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
const seed = new Uint8Array(32).fill(7);
const { publicKey, secretKey } = mldsa.keygen(seed);

const message = new TextEncoder().encode("hello QoreChain");
const signature = mldsa.sign(secretKey, message); // deterministic by default
const ok = mldsa.verify(publicKey, message, signature);
console.log(publicKey.length, signature.length, ok);
```

Python:

```python
from qorpqc import mldsa

# ML-DSA-87 key pair. The Python binding generates keys from the system RNG
# (it does not take a seed); signing is deterministic by default.
public_key, secret_key = mldsa.keygen()

message = b"hello QoreChain"
signature = mldsa.sign(secret_key, message)
ok = mldsa.verify(public_key, message, signature)
print(len(public_key), len(signature), ok)
```

Rust:

```rust
use qorechain_pqc::mldsa;

fn main() {
    // ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
    let seed = [7u8; 32];
    let (pk, sk) = mldsa::default::keygen_from_seed(&seed);

    let message = b"hello QoreChain";
    let sig = mldsa::default::sign(&sk, message).expect("sign"); // deterministic
    let ok = mldsa::default::verify(&pk, message, &sig);
    println!("{} {} {}", pk.len(), sig.len(), ok);
}
```

Go:

```go
package main

import (
	"bytes"
	"fmt"

	pqc "github.com/qorechain/qorechain-pqc/go"
)

func main() {
	// ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
	pk, sk, _ := pqc.MLDSA.KeygenFromSeed(bytes.Repeat([]byte{7}, 32))

	message := []byte("hello QoreChain")
	sig, _ := pqc.MLDSA.Sign(sk, message) // deterministic
	fmt.Println(len(pk), len(sig), pqc.MLDSA.Verify(pk, message, sig))
}
```

Java (احفظه باسم `PqcQuickstart.java`):

```java
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import network.qorechain.pqc.Pqc;

public class PqcQuickstart {
    public static void main(String[] args) {
        // ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
        // In the Java binding the secret key IS the 32-byte seed.
        byte[] seed = new byte[32];
        Arrays.fill(seed, (byte) 7);
        byte[][] kp = Pqc.mldsaKeygenFromSeed("ml-dsa-87", seed); // {publicKey, secretKey}

        byte[] message = "hello QoreChain".getBytes(StandardCharsets.UTF_8);
        byte[] sig = Pqc.mldsaSign("ml-dsa-87", kp[1], message); // deterministic
        boolean ok = Pqc.mldsaVerify("ml-dsa-87", kp[0], message, sig);
        System.out.println(kp[0].length + " " + sig.length + " " + ok);
    }
}
```

البذرة الثابتة (32 بايتاً قيمة كل منها 7) مثال فقط. استخدم بذرة عشوائية أو اشتقاق المفاتيح الموصوف في [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing#key-derivation) لمفتاح حقيقي.

### التوقيع المحصَّن {#hedged}

التوقيع الحتمي هو ما تفعله `sign`. للاشتراك في التوقيع العشوائي استدعِ النسخة الصريحة، مثلاً `mldsa.sign(secretKey, message, { hedged: true })` في JavaScript أو `mldsa.sign(secret_key, message, hedged=True)` في Python. استخدمه فقط إذا أردت توقيعاً مختلفاً في كل مرة؛ فالسلسلة تقبل النوعين، ولا يحدث الرمز 21 من `pqc` (`hybrid_verify_failed`) أبداً بسبب اختيار أحدهما دون الآخر (راجع [قائمة استكشاف الأخطاء](/developer-guide/post-quantum-signing#code-21)).

### اختيار صيغة sign-bytes {#sign-bytes}

اسأل العقدة عن أسماء الترقيات المطبَّقة، ثم دع المكتبة تقرر. هذه صيغة JavaScript من README الحزمة؛ وتصدّر الروابط الأخرى الأسماء نفسها بأسلوبها الخاص.

```ts
import { SIGN_BYTES_V2_UPGRADES, signBytesVersionForApplied, hybridSignBytes } from "@qorechain/pqc";

const applied: Record<string, string> = {};
for (const name of SIGN_BYTES_V2_UPGRADES) {
  const r = await fetch(`${rest}/cosmos/upgrade/v1beta1/applied_plan/${name}`).then((x) => x.json());
  applied[name] = r.height; // "0" means not applied
}
const version = signBytesVersionForApplied(chainId, applied); // "v1" or "v2"
const signBytes = hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfoBytes);
```

`rest` هو `https://api.qore.host` للشبكة الرئيسية (`qorechain-vladi`) أو `https://api-testnet.qore.host` لشبكة الاختبار (`qorechain-diana`). تتحقق الشبكتان من v2 اليوم. لا تحتاج معظم التطبيقات إلى فعل ذلك يدوياً: يحلّ SDK وQoreSign الصيغة لكل شبكة.

## طريقة الوصول {#how-to-access}

* **لا حاجة إلى شبكة ولا حساب ولا مفتاح لاستخدام المكتبة.** تعمل دون اتصال. زوج المفاتيح الذي تنشئه ليس إلا مفتاحاً؛ ولاستخدامه على QoreChain يجب أن يسجّل الحساب المفتاح العام مرة واحدة (راجع [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing#pqc-key-registration))، وبعدها تحتاج معاملة مسار Cosmos إلى توقيع secp256k1 مع توقيع ML-DSA-87 (هجين).
* **الشبكات.** تطابق مساعدات sign-bytes والمتجهات الشبكة الرئيسية `qorechain-vladi` (v3.2.5) وشبكة الاختبار `qorechain-diana` (v3.2.6). راجع [الشبكات](/appendix/networks) لنقاط النهاية.
* **تحتاج Python إلى المكتبة المشتركة liboqs.** تعتمد `pip install qorechain-pqc` على `liboqs-python`، التي تبني liboqs عند أول استيراد إذا كانت غير موجودة؛ وهذا يحتاج إلى `git` وCMake ومترجم C على الجهاز. ثبّت liboqs من مدير الحزم في نظامك، أو ابنِها مسبقاً، في البيئات المقيَّدة. تقرأ رابطة Python المفاتيح من مولّد الأرقام العشوائية للنظام وليس فيها توليد مفاتيح من بذرة في 0.2.3.
* **تحتاج Go إلى Go 1.25 أو أحدث** (متطلب منذ 0.2.1، مع CIRCL 1.6.5 أو أحدث).
* **Java** جرى تشغيلها مع JDK 21. المفتاح السري لـ ML-DSA في رابطة Java هو بذرة FIPS 204 ذات 32 بايتاً، لا المفتاح الموسَّع ذو 4,896 بايتاً الذي تستخدمه الروابط الأخرى؛ ويُرفض أي مدخل آخر.
* **تثبيت Bouncy Castle في Java.** مبنية رابطة Java على Bouncy Castle 1.85 منذ 0.2.3 (استخدمت الإصدارات الأقدم نسخاً أقدم لها تنبيهات منشورة، ولا يقع أي منها في شيفرة ML-DSA أو ML-KEM التي تستدعيها الرابطة). وبحسب سجل التغييرات في المشروع، فإن 1.85 هو آخر إصدار من Bouncy Castle ما زال يتضمن فئات `org.bouncycastle.pqc.crypto`، فأبقِ مشروعك على 1.85، واختبر قبل أن تدع اعتمادية أخرى تجلب إصداراً أحدث، لأن الإصدارات اللاحقة لم تعد تتضمن تلك الفئات.
* **التكلفة.** مجانية ومفتوحة المصدر بترخيص Apache-2.0. التوقيع والتحقق لا يكلّفان شيئاً؛ والاستخدام على السلسلة للتواقيع الناتجة يدفع الرسوم المعتادة (الحد الأدنى 0.1 uqor لكل وحدة غاز).

## أين تُنشر {#where-published}

| السجل | الحزمة | الإصدار | الرابط |
| --- | --- | --- | --- |
| npm | `@qorechain/pqc` | 0.2.3 | https://www.npmjs.com/package/@qorechain/pqc |
| PyPI | `qorechain-pqc` (الاستيراد `qorpqc`) | 0.2.3 | https://pypi.org/project/qorechain-pqc/ |
| crates.io | `qorechain-pqc` | 0.2.3 | https://crates.io/crates/qorechain-pqc |
| وكيل وحدات Go | `github.com/qorechain/qorechain-pqc/go` | v0.2.3 (الوسم `go/v0.2.3`) | https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go |
| Maven Central | `io.github.qorechain:qorechain-pqc` | 0.2.3 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc |
| C | مصدر فقط، دون سجل حزم | الوسم `v0.2.3` | https://github.com/qorechain/qorechain-pqc |

المصدر: https://github.com/qorechain/qorechain-pqc (المجلدات `js` و`python` و`rust` و`go` و`java` و`c` و`vectors`). كل الحزم بترخيص Apache-2.0. قُرئت الإصدارات من كل سجل في 27 أكتوبر 2026. الدليل المفاهيمي للمكتبة نفسها، بما فيه اشتقاق المفاتيح وتدويرها، هو [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing)؛ أما SDK الذي يستخدمها فموصوف في [نظرة عامة على SDK](/sdk/overview).

## الحدود والمشكلات المعروفة {#limits}

* **هي مكتبة أساسيات، لا محفظة ولا عميل.** لا تسجّل المفاتيح ولا تبني المعاملات ولا تبثها ولا تقرأ السلسلة. استخدم [SDK](/sdk/overview) أو [QoreSign](/qoresign/overview) لذلك.
* **لا تستطيع Python وC توليد مفتاح من بذرة.** كلتاهما مدعومة بـ liboqs، التي تستمد المفاتيح من مولّد الأرقام العشوائية للنظام. وتستخدم اختبارات المتجهات لديهما المفتاح السري الموسَّع بدلاً من ذلك.
* **المفتاح السري في Java هو بذرة.** على الشيفرة التي تنقل مفاتيح ML-DSA السرية بين Java والروابط الأخرى أن تحوّل: القيمة في Java هي البذرة ذات 32 بايتاً، وفي الأخرى المفتاح الموسَّع ذو 4,896 بايتاً لـ ML-DSA-87.
* **تحتاج رابطة Python إلى سلسلة أدوات C في المرة الأولى** إذا لم تكن liboqs مثبّتة. شُغّل البدء السريع لـ Python مع وجود liboqs مسبقاً.
* **لا حزمة سجل لرابطة C ولا بدء سريع مُختبَر.** ابنِها من المستودع؛ وهي تحتاج إلى liboqs وOpenSSL.
* **أحجام المفاتيح يحددها المعيار.** توقيع ML-DSA-87 حجمه 4,627 بايتاً ومفتاحه العام 2,592 بايتاً؛ ولا توجد صيغة أصغر متوافقة مع المعيار.
* **الإصدارات الأقدم.** استخدم 0.2.1 أو أحدث: أدخل 0.2.0 دالة `hybridSignBytes` المدركة للإصدار (والصيغة القديمة بمعاملين هي الآن `hybridSignBytesV1`)، وأضاف 0.2.1 اسمَي خطة الترقية كليهما. غيّر 0.2.2 و0.2.3 التوثيق وإصدارات الاعتماديات، بمخرجات مطابقة.
* **الاستخدام الهجين ما زال يحتاج إلى النصف الآخر.** يحمل التوقيع الهجين توقيع secp256k1 أيضاً؛ وهذه المكتبة تُنتج نصف ML-DSA فقط. الحسابات والتسجيل ونافذة تفويض EVM قواعد في السلسلة موثقة في [التوقيع ما بعد الكمّي](/developer-guide/post-quantum-signing) و[دليل EVM](/developer-guide/evm-development#evm-window).
