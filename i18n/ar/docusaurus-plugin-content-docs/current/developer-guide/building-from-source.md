---
slug: /developer-guide/building-from-source
title: البناء من المصدر
sidebar_label: البناء من المصدر
sidebar_position: 1
---

# البناء من المصدر

يرشدك هذا الدليل خلال بناء البرنامج الثنائي `qorechaind` من المصدر، ويغطي كلاً من بناء المجتمع (open-core) والبناء الاحتكاري الكامل.

## المتطلبات المسبقة

| الاعتمادية         | الحد الأدنى للإصدار           | ملاحظات                                             |
| ------------------ | ------------------------- | ------------------------------------------------- |
| **Go**             | 1.26+                     | مطلوب لجميع عمليات البناء                           |
| **CGO**            | مُفعَّل (`CGO_ENABLED=1`) | مطلوب لجسور FFI الخاصة بـ PQC وSVM              |
| **سلسلة أدوات Rust** | أحدث إصدار مستقر             | مطلوبة لتجميع `libqorepqc` و`libqoresvm` |
| **Make**           | 3.81+                     | أتمتة البناء                                  |
| **Git**            | 2.x                       | سحب المصدر                                   |

تحقق من بيئتك:

```bash
go version        # go1.26.x or later
rustc --version   # stable toolchain
cargo --version
echo $CGO_ENABLED # must be 1
```

:::danger
يجب **أن** تكون `CGO_ENABLED=1` معيَّنة لكل استدعاء لـ `go build` و`go test` و`go run`. تستخدم وحدتا PQC وSVM جسور FFI التي تتطلب cgo.
:::

## المكتبات الأصلية

تعتمد QoreChain على مكتبتين أصليتين مبنيتين بلغة Rust ويتم تحميلهما وقت التشغيل.

### libqorepqc (التشفير ما بعد الكمومي)

توفر مكتبة PQC توليد المفاتيح والتوقيع والتحقق وفق ML-DSA-87 (Dilithium-5) عبر واجهة FFI متوافقة مع C.

```bash
cd rust/qorepqc
cargo build --release
```

تُوضع المكتبة المُجمَّعة في `lib/{os}_{arch}/`:

| المنصة    | ملف المكتبة       | الدليل           |
| ----------- | ------------------ | ------------------- |
| macOS arm64 | `libqorepqc.dylib` | `lib/darwin_arm64/` |
| Linux amd64 | `libqorepqc.so`    | `lib/linux_amd64/`  |
| Linux arm64 | `libqorepqc.so`    | `lib/linux_arm64/`  |

### libqoresvm (بيئة تشغيل SVM)

توفر مكتبة SVM بيئة تنفيذ برامج BPF لوحدة x/svm.

```bash
cd rust/qoresvm
cargo build --release
```

يتبع الإخراج اصطلاح `lib/{os}_{arch}/` نفسه المذكور أعلاه (‏`libqoresvm.dylib` على macOS، و`libqoresvm.so` على Linux).

### تعيين مسار المكتبة

يجب أن تكون المكتبات الأصلية قابلة للاكتشاف وقت التشغيل. عيّن متغير البيئة المناسب لمنصتك:

**macOS:**

```bash
export DYLD_LIBRARY_PATH=$(pwd)/lib/darwin_arm64:$DYLD_LIBRARY_PATH
```

**Linux:**

```bash
export LD_LIBRARY_PATH=$(pwd)/lib/linux_amd64:$LD_LIBRARY_PATH
```

:::info
نصيحة: أضِف أمر التصدير إلى ملف تعريف الصدفة (‏`~/.bashrc`، `~/.zshrc`) حتى يبقى مستمراً عبر الجلسات.
:::

## بنية Open-Core

تتبع QoreChain نموذج **open-core**:

* **بناء المجتمع** — يحتوي على واجهات الوحدات الكاملة، وأوامر واجهة سطر الأوامر، وتعريفات protobuf، وأنواع الرسائل لكل وحدة من وحدات QoreChain (‏x/pqc، x/ai، x/reputation، x/qca، x/svm، x/crossvm، إلخ). تستخدم الحارسات (keepers) للوحدات الاحتكارية **تطبيقات وهمية (stub)** تُرجع قيماً افتراضية آمنة أو استجابات لا تنفّذ أي عملية. يتيح ذلك للأدوات والمحافظ والمفهرسات الخارجية التكامل مع جميع واجهات برمجة تطبيقات QoreChain دون الحاجة إلى الكود الاحتكاري.
* **البناء الكامل (الاحتكاري)** — يُفعّل تطبيقات الحارسات الكاملة خلف وسم البناء `proprietary`. يشمل ذلك منطق الكشف عن الشذوذ بالذكاء الاصطناعي الفعلي، وضبط معاملات إجماع PRISM، وتقييم السمعة المتقدم، وجميع الميزات بمستوى الإنتاج.

ينتج كلا البناءين اسم البرنامج الثنائي `qorechaind` نفسه ويعرضان أوامر واجهة سطر أوامر ونقاط نهاية gRPC/REST متطابقة. الفرق يكمن في سلوك منطق الحارسات وقت التشغيل خلف تلك الواجهات.

## بناء المجتمع

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

يجمّع هذا جميع واجهات الوحدات العامة مع حارسات وهمية للميزات الاحتكارية. البرنامج الثنائي الناتج يعمل بكامل وظائفه من أجل:

* تشغيل عقدة مدقّق
* إرسال المعاملات والاستعلام عنها
* التفاعل مع الأنوية الافتراضية EVM وCosmWasm وSVM
* بناء تكاملات وأدوات خارجية
* التطوير والاختبار المحلي

## البناء الكامل (الاحتكاري)

```bash
CGO_ENABLED=1 go build -tags proprietary -o qorechaind ./cmd/qorechaind/
```

يُفعّل وسم `-tags proprietary` تطبيقات الحارسات الكاملة، وهي ليست جزءًا من شجرة المصدر العامة.

## تشغيل الاختبارات

```bash
CGO_ENABLED=1 go test ./... -count=1
```

يعطّل وسم `-count=1` التخزين المؤقت للاختبارات، ما يضمن تشغيلاً نظيفاً في كل مرة. يمكن تشغيل اختبارات الحزم الفردية بـ:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/ai/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

شغّل اختبارات مكتبة Rust بشكل منفصل:

```bash
cd rust/qorepqc && cargo test
cd rust/qoresvm && cargo test
```

## التحقق من البناء

بعد بناء ناجح، تحقق من البرنامج الثنائي:

```bash
./qorechaind version
./qorechaind init test-node --chain-id qorechain-diana
```

يُفترض أن يُنشئ أمر `init` ملف genesis وتهيئة العقدة في `~/.qorechaind/` دون أخطاء. يهيّئ المثال أعلاه مقابل شبكة الاختبار **`qorechain-diana`** — أما للشبكة الرئيسية، فاستبدل `--chain-id qorechain-vladi`، الشبكة الحية التي تعمل بإصدار السلسلة **v3.1.77**.

## بناء Docker

للبناءات الموجودة في حاويات، يتوفر ملف Dockerfile في جذر المستودع:

```bash
docker build -t qorechaind:latest .
```

تتولى صورة Docker جميع عمليات تجميع المكتبات الأصلية وتهيئة المسارات تلقائياً. راجع دليل [البدء السريع](/getting-started/quickstart) لتشغيل عقدة باستخدام Docker Compose.

## استكشاف الأخطاء وإصلاحها

<details>

<summary>cgo: C compiler not found</summary>

ثبّت أدوات Xcode CLI (على macOS) أو `build-essential` (على Linux)

</details>

<details>

<summary>cannot find -lqorepqc</summary>

ابنِ مكتبات Rust أولاً وعيّن `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH`

</details>

<details>

<summary>undefined: sonic.*</summary>

تأكد من أن `go.sum` محدّث: `go mod tidy`

</details>

<details>

<summary>signal: killed during build</summary>

زِد الذاكرة المتاحة (شائع في Docker بحدود منخفضة)

</details>

<details>

<summary>PQC tests fail with size mismatch</summary>

تأكد من أنك تستخدم `pqcrypto v0.5.0+` (‏ML-DSA-87: pubkey=2592, privkey=4896, sig=4627 bytes)

</details>
