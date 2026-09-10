---
slug: /developer-guide/building-from-source
title: البناء من المصدر
sidebar_label: البناء من المصدر
sidebar_position: 1
---

# البناء من المصدر

يرشدك هذا الدليل خلال بناء الملف الثنائي `qorechaind` من المصدر، ويغطي كلاً من بناء المجتمع (open-core) والبناء الكامل الخاص (proprietary).

## المتطلبات الأساسية

| الاعتمادية         | الحد الأدنى للإصدار        | ملاحظات                                             |
| ------------------ | ------------------------- | ---------------------------------------------------- |
| **Go**             | 1.26+                     | مطلوب لجميع أنواع البناء                             |
| **CGO**            | مفعّل (`CGO_ENABLED=1`)   | مطلوب لجسور FFI الخاصة بـ PQC وSVM                   |
| **مجموعة أدوات Rust** | أحدث إصدار مستقر        | مطلوبة لتصريف `libqorepqc` و`libqoresvm`             |
| **Make**           | 3.81+                     | أتمتة البناء                                         |
| **Git**            | 2.x                       | سحب المصدر                                           |

تحقّق من بيئتك:

```bash
go version        # go1.26.x أو أحدث
rustc --version   # مجموعة أدوات مستقرة
cargo --version
echo $CGO_ENABLED # يجب أن تكون القيمة 1
```

:::danger
يجب أن يحمل كل استدعاء لـ `go build` و`go test` و`go run` القيمة `CGO_ENABLED=1`. تستخدم وحدتا PQC وSVM جسور FFI التي تتطلب cgo.
:::

## المكتبات الأصلية (Native Libraries)

تعتمد QoreChain على مكتبتين أصليتين مبنيتين بلغة Rust يتم تحميلهما وقت التشغيل.

### libqorepqc (التشفير ما بعد الكمّي)

توفر مكتبة PQC توليد المفاتيح والتوقيع والتحقق بخوارزمية ML-DSA-87 (Dilithium-5) عبر واجهة FFI متوافقة مع C.

```bash
cd rust/qorepqc
cargo build --release
```

يوضع الملف المصرَّف في `lib/{os}_{arch}/`:

| المنصة       | ملف المكتبة         | المجلد                |
| ------------ | ------------------- | --------------------- |
| macOS arm64  | `libqorepqc.dylib`  | `lib/darwin_arm64/`   |
| Linux amd64  | `libqorepqc.so`     | `lib/linux_amd64/`    |
| Linux arm64  | `libqorepqc.so`     | `lib/linux_arm64/`    |

### libqoresvm (بيئة تشغيل SVM)

توفر مكتبة SVM بيئة تنفيذ برامج BPF لوحدة x/svm.

```bash
cd rust/qoresvm
cargo build --release
```

تتبع المخرجات نفس اصطلاح `lib/{os}_{arch}/` المذكور أعلاه (`libqoresvm.dylib` على macOS، و`libqoresvm.so` على Linux).

### تحديد مسار المكتبة

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
نصيحة: أضِف الأمر export إلى ملف تهيئة الصدفة الخاص بك (`~/.bashrc`، `~/.zshrc`) ليبقى نافذًا عبر الجلسات.
:::

## بنية Open-Core

تتبع QoreChain نموذج **open-core**:

* **بناء المجتمع** — يحتوي على الواجهات الكاملة للوحدات، وأوامر CLI، وتعريفات protobuf، وأنواع الرسائل لكل وحدة من وحدات QoreChain (x/pqc، x/ai، x/reputation، x/qca، x/svm، x/crossvm، إلخ). تستخدم Keepers الخاصة بالوحدات الخاصة (proprietary) **تطبيقات بديلة (stub)** تُعيد قيمًا افتراضية آمنة أو استجابات بلا تأثير (no-op). هذا يسمح لأدوات الطرف الثالث والمحافظ والفهارس (indexers) بالتكامل مع جميع واجهات QoreChain البرمجية دون الحاجة إلى الكود الخاص.
* **البناء الكامل (الخاص)** — يفعّل تطبيقات Keeper الكاملة خلف علامة البناء `proprietary`. يشمل ذلك منطق كشف الشذوذ الحقيقي بالذكاء الاصطناعي، وضبط معاملات إجماع PRISM، وتسجيل السمعة المتقدم، وجميع الميزات ذات الجاهزية الإنتاجية.

ينتج كلا البناءين نفس اسم الملف الثنائي `qorechaind` ويعرضان نفس أوامر CLI ونقاط نهاية gRPC/REST. الفرق يكمن في السلوك وقت التشغيل لمنطق Keeper خلف تلك الواجهات.

## بناء المجتمع

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

يقوم هذا بتصريف جميع واجهات الوحدات العامة مع Keepers بديلة (stub) للميزات الخاصة. الملف الثنائي الناتج يعمل بشكل كامل من أجل:

* تشغيل عقدة تحقق (validator)
* إرسال المعاملات والاستعلام عنها
* التفاعل مع الآلات الافتراضية EVM وCosmWasm وSVM
* بناء تكاملات وأدوات الطرف الثالث
* التطوير والاختبار المحليان

## البناء الكامل (الخاص)

```bash
CGO_ENABLED=1 go build -tags proprietary -o qorechaind ./cmd/qorechaind/
```

تُفعّل الراية `-tags proprietary` تطبيقات Keeper الكاملة، وهي ليست جزءًا من شجرة المصدر العامة.

## تشغيل الاختبارات

```bash
CGO_ENABLED=1 go test ./... -count=1
```

تعطّل الراية `-count=1` التخزين المؤقت للاختبارات، مما يضمن تشغيلاً نظيفًا في كل مرة. يمكن تشغيل اختبارات الحزم الفردية بواسطة:

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

بعد نجاح البناء، تحقّق من الملف الثنائي:

```bash
./qorechaind version
./qorechaind init test-node --chain-id qorechain-diana
```

يجب أن يُنشئ أمر `init` ملف تكوين أولي (genesis) وإعدادات عقدة في `~/.qorechaind/` دون أخطاء. يُهيّئ المثال أعلاه الشبكة التجريبية **`qorechain-diana`** — أما للشبكة الرئيسية، استبدل بـ `--chain-id qorechain-vladi`، الشبكة الحية التي تعمل بإصدار السلسلة **v3.1.97**.

## البناء عبر Docker

للبناءات المحتواة (containerized)، يتوفر ملف Dockerfile في جذر المستودع:

```bash
docker build -t qorechaind:latest .
```

تتولى صورة Docker تصريف جميع المكتبات الأصلية وضبط المسارات تلقائيًا. راجع دليل [البدء السريع](/getting-started/quickstart) لتشغيل عقدة باستخدام Docker Compose.

## استكشاف الأخطاء وإصلاحها

<details>

<summary>cgo: C compiler not found</summary>

ثبّت أدوات Xcode CLI (على macOS) أو `build-essential` (على Linux)

</details>

<details>

<summary>cannot find -lqorepqc</summary>

ابنِ مكتبات Rust أولاً، وعيّن `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH`

</details>

<details>

<summary>undefined: sonic.*</summary>

تأكد من تحديث `go.sum`: `go mod tidy`

</details>

<details>

<summary>signal: killed during build</summary>

زِد الذاكرة المتاحة (شائع في Docker عند وجود حدود منخفضة)

</details>

<details>

<summary>PQC tests fail with size mismatch</summary>

تحقق من أنك تستخدم `pqcrypto v0.5.0+` (ML-DSA-87: المفتاح العام=2592، المفتاح الخاص=4896، التوقيع=4627 بايت)

</details>
