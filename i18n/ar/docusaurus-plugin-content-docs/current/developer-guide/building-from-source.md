---
slug: /developer-guide/building-from-source
title: البناء من المصدر
sidebar_label: البناء من المصدر
sidebar_position: 1
---

# البناء من المصدر

يرشدك هذا الدليل عبر خطوات بناء ملف `qorechaind` الثنائي من المصدر، ويغطي كلاً من بناء المجتمع (النواة المفتوحة) والبناء الملكي الكامل.

## المتطلبات الأساسية

| التبعية            | الحد الأدنى للإصدار        | ملاحظات                                           |
| ------------------ | ------------------------- | -------------------------------------------------- |
| **Go**             | 1.26+                     | مطلوب لجميع عمليات البناء                          |
| **CGO**            | مُفعّل (`CGO_ENABLED=1`)   | مطلوب لجسور FFI الخاصة بـ PQC وSVM                  |
| **سلسلة أدوات Rust** | أحدث إصدار مستقر          | مطلوب لتصريف `libqorepqc` و`libqoresvm`             |
| **Make**           | 3.81+                     | أتمتة البناء                                       |
| **Git**            | 2.x                       | سحب الشيفرة المصدرية                               |

تحقق من بيئتك:

```bash
go version        # go1.26.x or later
rustc --version   # stable toolchain
cargo --version
echo $CGO_ENABLED # must be 1
```

:::danger
يجب أن يحتوي كل استدعاء لـ `go build` و`go test` و`go run` على `CGO_ENABLED=1` مُفعّلاً. تستخدم وحدتا PQC وSVM جسور FFI التي تتطلب cgo.
:::

## المكتبات الأصلية (Native)

تعتمد QoreChain على مكتبتين أصليتين مبنيتين بلغة Rust يتم تحميلهما وقت التشغيل.

### libqorepqc (التشفير ما بعد الكمي)

توفّر مكتبة PQC توليد المفاتيح والتوقيع والتحقق بخوارزمية ML-DSA-87 (Dilithium-5) من خلال واجهة FFI متوافقة مع C.

```bash
cd rust/qorepqc
cargo build --release
```

توضع المكتبة المُصرَّفة في `lib/{os}_{arch}/`:

| المنصة       | ملف المكتبة        | الدليل               |
| ------------ | ------------------- | -------------------- |
| macOS arm64  | `libqorepqc.dylib`  | `lib/darwin_arm64/`  |
| Linux amd64  | `libqorepqc.so`     | `lib/linux_amd64/`   |
| Linux arm64  | `libqorepqc.so`     | `lib/linux_arm64/`   |

### libqoresvm (بيئة تشغيل SVM)

توفّر مكتبة SVM بيئة تنفيذ برامج BPF الخاصة بوحدة x/svm.

```bash
cd rust/qoresvm
cargo build --release
```

يتبع الناتج نفس اصطلاح `lib/{os}_{arch}/` أعلاه (`libqoresvm.dylib` على macOS، و`libqoresvm.so` على Linux).

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
نصيحة: أضف هذا التصدير إلى ملف تعريف الصدفة الخاص بك (`~/.bashrc`، `~/.zshrc`) ليبقى ساريًا عبر الجلسات.
:::

## بنية النواة المفتوحة (Open-Core)

تتّبع QoreChain نموذج **النواة المفتوحة**:

* **بناء المجتمع** — يحتوي على واجهات الوحدات الكاملة، وأوامر CLI، وتعريفات protobuf، وأنواع الرسائل لكل وحدة من وحدات QoreChain (x/pqc، x/ai، x/reputation، x/qca، x/svm، x/crossvm، وغيرها). تستخدم الحاويات (keepers) الخاصة بالوحدات الملكية **تطبيقات وهمية (stub)** تُعيد قيمًا افتراضية آمنة أو استجابات بلا تأثير. هذا يتيح للأدوات ومحافظ الطرف الثالث وأدوات الفهرسة التكامل مع جميع واجهات برمجة تطبيقات QoreChain دون الحاجة إلى الشيفرة الملكية.
* **البناء الكامل (الملكي)** — يفعّل تطبيقات الحاويات (keepers) الكاملة خلف وسم البناء `proprietary`. يشمل ذلك منطق الكشف الحقيقي عن الشذوذ بالذكاء الاصطناعي، وضبط معاملات إجماع PRISM، وتسجيل السمعة المتقدم، وجميع الميزات الجاهزة للإنتاج.

ينتج كلا البناءين نفس اسم الملف الثنائي `qorechaind` ويعرضان نفس أوامر CLI ونقاط نهاية gRPC/REST. الفرق يكمن في السلوك وقت التشغيل لمنطق الحاويات (keepers) خلف تلك الواجهات.

## بناء المجتمع

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

يقوم هذا بتصريف جميع واجهات الوحدات العامة مع حاويات (keepers) وهمية للميزات الملكية. الملف الثنائي الناتج وظيفي بالكامل من أجل:

* تشغيل عقدة موثّق (validator)
* إرسال المعاملات والاستعلام عنها
* التفاعل مع آلات EVM وCosmWasm وSVM الافتراضية
* بناء تكاملات وأدوات الطرف الثالث
* التطوير والاختبار المحليان

## البناء الكامل (الملكي)

```bash
CGO_ENABLED=1 go build -tags proprietary -o qorechaind ./cmd/qorechaind/
```

يُفعّل الوسم `-tags proprietary` تطبيقات الحاويات (keepers) الكاملة، وهي ليست جزءًا من شجرة المصدر العامة.

## تشغيل الاختبارات

```bash
CGO_ENABLED=1 go test ./... -count=1
```

يعطّل الوسم `-count=1` تخزين الاختبارات المؤقت، مما يضمن تشغيلاً نظيفًا في كل مرة. يمكن تشغيل اختبارات الحزم الفردية باستخدام:

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

بعد نجاح البناء، تحقق من الملف الثنائي:

```bash
./qorechaind version
./qorechaind init test-node --chain-id qorechain-diana
```

يجب أن ينشئ أمر `init` ملف تكوين البداية (genesis) وتهيئة العقدة في `~/.qorechaind/` دون أخطاء. يُهيّئ المثال أعلاه الشبكة مقابل شبكة الاختبار **`qorechain-diana`** — أما للشبكة الرئيسية، فاستبدل ذلك بـ `--chain-id qorechain-vladi`، الشبكة الحية التي تعمل بإصدار السلسلة **v3.1.95**.

## بناء Docker

للبناءات المُحوسَبة (containerized)، يتوفّر ملف Dockerfile في جذر المستودع:

```bash
docker build -t qorechaind:latest .
```

تتعامل صورة Docker مع تصريف جميع المكتبات الأصلية وتهيئة المسارات تلقائيًا. راجع دليل [البدء السريع](/getting-started/quickstart) لتشغيل عقدة باستخدام Docker Compose.

## استكشاف الأخطاء وإصلاحها

<details>

<summary>cgo: C compiler not found</summary>

ثبّت أدوات سطر أوامر Xcode (على macOS) أو `build-essential` (على Linux)

</details>

<details>

<summary>cannot find -lqorepqc</summary>

ابنِ مكتبات Rust أولاً وعيّن `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH`

</details>

<details>

<summary>undefined: sonic.*</summary>

تأكد من أن `go.sum` محدَّث: `go mod tidy`

</details>

<details>

<summary>signal: killed during build</summary>

زِد الذاكرة المتاحة (شائع في Docker عند وجود حدود منخفضة)

</details>

<details>

<summary>PQC tests fail with size mismatch</summary>

تأكد من أنك تستخدم `pqcrypto v0.5.0+` (ML-DSA-87: pubkey=2592, privkey=4896, sig=4627 bytes)

</details>
