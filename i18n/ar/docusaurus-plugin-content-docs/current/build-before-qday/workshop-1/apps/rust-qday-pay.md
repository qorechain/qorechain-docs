---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: تطبيق Rust، qday-pay
sidebar_label: Rust، qday-pay
sidebar_position: 4
---

# تطبيق Rust: qday-pay

**qday-pay** برنامج Rust صغير تشغّله في الطرفية (terminal). يدفع QOR تجريبية على شبكة testnet ‏`qorechain-diana` الخاصة بـ QoreChain بـ**توقيع هجين**: توقيع كلاسيكي secp256k1 مع توقيع مقاوم للحوسبة الكمومية ML-DSA-87 (معيار NIST FIPS 204). وبعد الدفع يقرأ المعاملة من السلسلة ويعرض لك دليل السلسلة نفسها على أنها تحققت من التوقيعين.

**كم يستغرق هذا:** نحو 15 دقيقة في المجموع. أول بناء ينزّل المكتبات ويترجمها ويستغرق من 2 إلى 5 دقائق. بعد ذلك يعمل كل أمر في ثوانٍ.

## ما الذي يعرضه {#what-it-shows}

- **توقيع هجين من Rust** باستخدام الحزمة المنشورة `qorechain-sdk` (الإصدار 0.13، وتُستخدم في الكود باسم `qorechain`).
- **تسجيل لمرة واحدة** لمفتاحك المقاوم للحوسبة الكمومية على السلسلة.
- **تقرير تحقق** لأي معاملة: التوقيع الكلاسيكي (64 بايت)، وتوقيع ML-DSA-87 (4,627 بايت)، وحكم `pqc_hybrid_verify` من السلسلة.

لماذا هذا مهم: يُتوقع أن يكون كسر التوقيع الكلاسيكي وحده ممكنًا بحاسوب كمومي مستقبلي. أما التوقيع الهجين فيبقى آمنًا ما دام أحد نصفيه صامدًا. راجع [المعاملات الآمنة كموميًا](/sdk/guides/quantum-safe).

## خطوة بخطوة {#run}

تعمل في الطرفية الخاصة بك. استخدم حسابًا تجريبيًا مؤقتًا على testnet فقط. عملة QOR على testnet بلا قيمة. لا تستخدم هنا محفظة حقيقية ولا أموالًا حقيقية أبدًا.

:::note Windows
يستخدم qday-pay صلاحيات ملفات Linux وmacOS لملف مفتاحه، لذلك تشغّله على Windows داخل **WSL** (نظام Windows الفرعي لـ Linux). يمنحك WSL طرفية Linux داخل Windows. بعدها تتبع كل ما يلي بتعليمات Linux.
:::

### 1. قبل أن تبدأ: ثبّت الأدوات {#install}

تحتاج إلى ثلاث أدوات: **Git** (لتنزيل الكود)، و**Rust** (لبناء البرنامج)، و**مترجم C** (يحتاجه Rust لربط البرنامج). لا تحتاج إلى Java ولا Node.js ولا Python لهذا التطبيق.

**macOS**

| الأداة | طريقة التثبيت | التحقق |
| --- | --- | --- |
| مترجم C وGit | `xcode-select --install` (تفتح نافذة، اضغط Install) | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (اضغط Enter لقبول الخيار الافتراضي)، ثم أغلق الطرفية وافتحها من جديد | `rustc --version` و`cargo --version` |

**Linux (Debian أو Ubuntu؛ والتوزيعات الأخرى تستخدم مدير الحزم الخاص بها)**

| الأداة | طريقة التثبيت | التحقق |
| --- | --- | --- |
| Git ومترجم C | `sudo apt update && sudo apt install -y git build-essential curl` | `git --version` |
| Rust | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (اضغط Enter لقبول الخيار الافتراضي)، ثم أغلق الطرفية وافتحها من جديد | `rustc --version` و`cargo --version` |

**Windows (عبر WSL)**

1. افتح PowerShell كمسؤول ونفّذ `wsl --install`. أعد تشغيل الحاسوب عندما يطلب ذلك. يثبّت Windows نظام Ubuntu. افتح تطبيق **Ubuntu** من قائمة ابدأ.
2. في طرفية Ubuntu اتبع جدول **Linux** أعلاه.
3. لا حاجة إلى Git for Windows (https://git-scm.com/download/win)، لأن Git يأتي مع أمر Linux أعلاه.

يلزم Rust 1.74 أو أحدث. الأمر `rustup` يثبّت أحدث إصدار، وهذا مناسب. يجب أن يطبع فحص الإصدار شيئًا مثل `rustc 1.80.0` أو رقمًا أعلى.

**ما الذي يجب أن تراه:** كل من `git --version` و`rustc --version` و`cargo --version` يطبع رقم إصدار. إذا قال أمر `command not found` فأغلق الطرفية وافتح واحدة جديدة وأعد المحاولة.

### 2. قبل أن تبدأ: احصل على محفظة testnet والـ faucet {#wallet}

ينشئ هذا التطبيق حساب testnet خاصًا به (الخطوة 5)، فلا تحتاج إلى تثبيت محفظة لتشغيله. تحتاج فقط إلى طريقة لاستقبال QOR تجريبية مجانية. الـ faucet موقع ويب يرسل QOR تجريبية مجانية إلى عنوان.

إذا أردت أيضًا أن ترى حسابك في محفظة QoreX، فاستخدم **QoreX على testnet** مع حساب تجريبي مؤقت:

- **تطبيق QoreX:** افتح الإعدادات وفعّل **Use testnet (developers)**.
- **امتداد QoreX للمتصفح:** افتح قفله، ثم اضغط على رقم الإصدار أسفل النافذة 7 مرات، ثم اختر **Switch to testnet (diana)**.

لا تحتاج إلى حساب Ethereum لهذا التطبيق. فهو يستخدم نوع حساب QoreChain Native (عنوان `qor1...`).

**الـ faucet:** https://dashboard.qorechain.io/faucet. سجّل الدخول، والصق عنوانك، واطلب. يمنح الـ faucet **100 QOR كل 24 ساعة لكل حساب**.

**من المفيد أن تعرف:** أول معاملة لحساب جديد تسجّل مفتاحه المقاوم للحوسبة الكمومية ML-DSA-87 على السلسلة. وهذه رسوم لمرة واحدة بنحو 0.09 QOR. يفعل qday-pay ذلك في الخطوة 7.

**المبالغ:** الوحدة التي تقرؤها هي **QOR**. أما السلسلة فتحسب بوحدة **uqor**، وهي أصغر وحدة. 1 QOR = 1,000,000 uqor. تكتب المبالغ بـ QOR (مثل `1`) ويحوّلها البرنامج لك.

### 3. احصل على الكود {#get-the-code-step}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

**ماذا يفعل**

| الجزء | المعنى |
| --- | --- |
| `git clone <address>` | ينزّل نسخة كاملة من التطبيقات النموذجية من GitHub إلى مجلد جديد اسمه `build-before-qday`. |
| `cd <folder>` | ينقل طرفيتك إلى مجلد تطبيق Rust. كل الأوامر التالية تُنفَّذ من هنا. |

**ما الذي يجب أن تراه:** `Cloning into 'build-before-qday'...` ثم مؤشر الأوامر داخل المجلد `04-rust-qday-pay`. نفّذ `ls` للتحقق: سترى `Cargo.toml` و`Cargo.lock` و`README.md` و`src`.

### 4. ابنِ البرنامج {#build}

```bash
cargo build --release
```

**ماذا يفعل:** `cargo` هي أداة البناء في Rust. ينزّل هذا الأمر المكتبات المذكورة في `Cargo.toml` ويترجم البرنامج إلى ملف واحد.

| الجزء | المعنى |
| --- | --- |
| `build` | ترجم البرنامج (دون تشغيله بعد). |
| `--release` | ابنِ النسخة السريعة المحسّنة. بدونه تحصل على نسخة تصحيح أبطأ في مجلد مختلف. |

**كم يستغرق:** من 2 إلى 5 دقائق في المرة الأولى، وبضع ثوانٍ بعد ذلك.

**ما الذي يجب أن تراه:** أسطرًا كثيرة `Compiling ...`، ثم `Finished release profile [optimized] target(s)`. أصبح البرنامج الآن هو الملف `./target/release/qday-pay`.

تحقق من أنه يعمل:

```bash
./target/release/qday-pay
```

**ماذا يفعل:** يشغّل البرنامج دون أي أمر. يطبع المساعدة ولا يغيّر شيئًا.

**ما الذي يجب أن تراه:**

```text
qday-pay: hybrid post-quantum payments on QoreChain testnet

  qday-pay new
  qday-pay status
  qday-pay register
  qday-pay send <qor1to> <amount_qor> [--memo text]
  qday-pay verify <tx_hash>
```

الأسطر الخمسة هي الأوامر الخمسة التي ستستخدمها أدناه. في بقية هذه الصفحة، `<command>` تعني `./target/release/qday-pay <command>`.

### 5. أنشئ حساب testnet مؤقتًا {#new-account}

```bash
./target/release/qday-pay new
```

**ماذا يفعل:** ينشئ حساب testnet جديدًا تمامًا. يولّد عبارة استرجاع سرية (mnemonic) ويحفظها في **ملف مفتاح**. ومن هذه العبارة الواحدة يشتق مفتاحيك معًا: المفتاح الكلاسيكي secp256k1 والمفتاح المقاوم للحوسبة الكمومية ML-DSA-87. لا تُطبع العبارة على الشاشة أبدًا.

| الجزء | المعنى |
| --- | --- |
| `new` | الأمر: أنشئ حسابًا وملف مفتاح. يرفض الكتابة فوق ملف مفتاح موجود، فلا يستطيع إتلاف حساب ممول عن طريق الخطأ. |

**مكان ملف المفتاح:** `~/.config/qday/rust.env`. الرمز `~` هو مجلد المنزل الخاص بك. الملف مقروء لك وحدك (الصلاحية 0600). يمكنك استخدام مكان آخر بضبط `QDAY_KEY_FILE`، مثلًا `QDAY_KEY_FILE=$HOME/my-test-key.env ./target/release/qday-pay new`. وإذا فعلت، فاضبط المتغير نفسه قبل كل أمر لاحق.

:::warning أبقِ ملف المفتاح سريًا
ملف المفتاح هو مفتاح الحساب. لا تشاركه أبدًا، ولا تلصقه في محادثة أو لقطة شاشة، ولا ترفعه إلى Git. استخدم هذا الحساب للورشة فقط ولا تستخدمه على الشبكة الرئيسية أبدًا. عندما تنتهي، احذف الملف.
:::

**ما الذي يجب أن تراه:**

```text
  New testnet account (mnemonic saved, not shown)

  address      qor1...
  key file     /home/you/.config/qday/rust.env (0600)

  Next: fund it with testnet QOR, then `qday-pay status`.
```

انسخ العنوان `qor1...`.

### 6. موّل الحساب من الـ faucet {#faucet}

1. افتح https://dashboard.qorechain.io/faucet وسجّل الدخول.
2. الصق عنوانك `qor1...` واطلب. ستستلم 100 QOR.
3. انتظر نحو 10 ثوانٍ حتى تدخل الدفعة في كتلة.

يجب أن يكون الحساب موجودًا على السلسلة قبل أن تتمكن من تسجيل مفتاح، ودفعة الـ faucet هي التي تنشئه.

### 7. افحص الحساب {#status}

```bash
./target/release/qday-pay status
```

**ماذا يفعل:** يقرأ حسابك من testnet ويطبع ملخصًا. لا يرسل شيئًا.

**ما الذي يجب أن تراه:**

```text
  network      qorechain-diana (testnet)
  address      qor1...
  balance      100 QOR
  ML-DSA-87    NOT registered (run `qday-pay register`)
  block        123456
```

| السطر | المعنى |
| --- | --- |
| `network` | السلسلة التي يتحدث إليها البرنامج. يعمل على testnet ‏`qorechain-diana` فقط ويرفض أي شبكة أخرى. |
| `balance` | رصيد QOR القابل للإنفاق. |
| `ML-DSA-87` | هل مفتاحك المقاوم للحوسبة الكمومية مسجّل على السلسلة. |
| `block` | ارتفاع أحدث كتلة. يواصل الزيادة. |

### 8. سجّل المفتاح المقاوم للحوسبة الكمومية {#register}

```bash
./target/release/qday-pay register
```

**ماذا يفعل:** يرسل معاملة واحدة تُعلِم السلسلة بمفتاحك العام ML-DSA-87، مع **إثبات الحيازة** (دليل على أنك تملك فعلًا المفتاح السري المقابل). تخزّن السلسلة المفتاح، ومن الآن تستطيع التحقق من توقيعاتك المقاومة للحوسبة الكمومية. تكلّف رسومًا لمرة واحدة بنحو 0.09 QOR. يمكنك تشغيله مرة أخرى بأمان: إذا كان المفتاح مسجّلًا فلا يفعل شيئًا.

| الجزء | المعنى |
| --- | --- |
| `register` | الأمر: سجّل مفتاح ML-DSA-87 مرة واحدة. |

**ما الذي يجب أن تراه:**

```text
  ML-DSA-87    registered (MsgRegisterPQCKeyV2 + proof of possession)
  tx           <64-character transaction hash>
  block        123460
  gas          ... used / ... wanted
  address      qor1...
```

### 9. أرسل دفعة موقّعة هجينيًا {#send}

استبدل `qor1...` بعنوان testnet. يمكنك الدفع إلى عنوانك أنت، أو إلى عنوان testnet لصديق.

```bash
./target/release/qday-pay send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

**ماذا يفعل:** يبني دفعة، ويوقّعها مرتين (secp256k1 وML-DSA-87)، ويتحقق من تكلفة الغاز، ويرسلها، وينتظر حتى تدخل في كتلة، ثم يشغّل لك التحقق الموصوف في الخطوة 10.

| الجزء | المعنى |
| --- | --- |
| `send` | الأمر: ادفع QOR إلى عنوان آخر. |
| `qor1...` (القيمة الأولى) | المستلم. يجب أن يكون عنوان `qor1`، وإلا يتوقف البرنامج برسالة `not a qor1 address`. |
| `1` (القيمة الثانية) | المبلغ بـ QOR. القيمة `1` تعني 1 QOR، أي 1,000,000 uqor. يمكنك استخدام كسور عشرية مثل `0.5`. |
| `--memo "text"` | اختياري. الـ memo نص قصير يُرفق بالمعاملة ويُخزَّن على السلسلة. ضعه بين علامتي اقتباس إذا كان فيه مسافات. يستطيع أي شخص قراءته، فلا تكتب فيه شيئًا خاصًا. |

الخيار `--memo` يأتي بعد المستلم والمبلغ، كما في المثال.

**ما الذي يجب أن تراه:**

```text
  sending      1 QOR -> qor1...
  fee          ... uqor (gas ...)
  included     block 123465

  tx           <64-character transaction hash>
  block        123465
  memo         Build Before Q-Day Workshop 1 (Rust)
  classical    secp256k1   64 bytes
  quantum      ML-DSA-87   4627 bytes

  VERIFIED: secp256k1 + ML-DSA-87
```

تظهر الرسوم `fee` بوحدة uqor وهي أقل بكثير من 1 QOR. ويطبع البرنامج أيضًا رابط `explorer` وسطر `chain says` (الخطوة 10). انسخ معرّف المعاملة.

### 10. تحقق من أي معاملة {#verify}

```bash
./target/release/qday-pay verify <TX_HASH>
```

**ماذا يفعل:** يقرأ المعاملة من السلسلة ويتحقق من ثلاثة أشياء، دون إرسال أي شيء.

| الجزء | المعنى |
| --- | --- |
| `verify` | الأمر: اطبع تقرير التحقق. |
| `<TX_HASH>` | معرّف المعاملة من 64 حرفًا. الصق المعرّف من الخطوة 9. ويعمل مع أي معاملة على testnet. |

الفحوص:

1. نجحت المعاملة (رمز النتيجة 0).
2. أصدرت السلسلة الحدث `pqc_hybrid_verify` مع `status=verified`. وهذا إعلان السلسلة أنها تحققت من التوقيع المقاوم للحوسبة الكمومية.
3. تحمل المعاملة امتداد `PQCHybridSignature` فيه توقيع ML-DSA-87 بحجم 4,627 بايت، بجانب توقيع secp256k1 البالغ 64 بايت.

**ما الذي يجب أن تراه:** التقرير نفسه الذي في الخطوة 9، وينتهي بـ `VERIFIED: secp256k1 + ML-DSA-87`. إذا فشل أحد الفحوص يقول التقرير `NOT VERIFIED as hybrid` ويخرج البرنامج بالرمز 2.

### 11. تحقق بطريقة ثانية، بدون برنامجنا {#verify-curl}

يمكنك أن تسأل السلسلة مباشرة. يحتاج هذا فقط إلى `curl`، وهو موجود في macOS ومعظم أنظمة Linux. الأداة `jq` (اختيارية) تجعل الجواب أسهل قراءة. ثبّتها بـ `brew install jq` على macOS أو `sudo apt install -y jq` على Linux.

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| الجزء | المعنى |
| --- | --- |
| `curl -s <address>` | ينزّل الجواب من خدمة REST الخاصة بـ testnet. الخيار `-s` يخفي شريط التقدّم. |
| `<HASH>` | معرّف معاملتك. |
| `\| jq '...'` | يستخرج ثلاث قيم. بدون `jq` احذف هذا الجزء واقرأ النص الكامل. |

**ما الذي يجب أن تراه:**

- `"code": 0` في الجواب (نجحت المعاملة). وفي ناتج `jq` يكون السطر الأول `0`.
- امتداد `PQCHybridSignature` (من النوع `/qorechain.pqc.v1.PQCHybridSignature`) يحمل توقيع ML-DSA-87. طول نص base64 هو 6,172 حرفًا، أي 4,627 بايت.
- في `tx_response.events` حدث من النوع `pqc_hybrid_verify` والسمة `status` فيه تساوي `verified`.

**في المستكشف:** افتح https://explore.qore.network، وحوّله إلى **Testnet**، وابحث عن معرّف معاملتك. ويطبع البرنامج أيضًا رابطًا مباشرًا.

### 12. نظّف {#cleanup}

عندما تنتهي، احذف ملف المفتاح المؤقت:

```bash
rm ~/.config/qday/rust.env
```

الأمر `rm` يحذف ملفًا. نفّذه فقط لمفتاح testnet لم تعد تحتاجه.

## استكشاف الأخطاء {#troubleshooting}

| ما الذي تراه | السبب | ما العمل |
| --- | --- | --- |
| `command not found: cargo` أو `rustc` | Rust غير مثبّت، أو فُتحت الطرفية قبل التثبيت. | ثبّت Rust (الخطوة 1)، ثم أغلق الطرفية وافتحها من جديد. |
| `linker 'cc' not found` أو `linking with cc failed` | لا يوجد مترجم C. | macOS: `xcode-select --install`. Ubuntu: `sudo apt install -y build-essential`. |
| `cannot read ... run qday-pay new first` | لا يوجد ملف مفتاح في ذلك المكان. | نفّذ `./target/release/qday-pay new`، أو اضبط `QDAY_KEY_FILE` نفسه الذي استخدمته سابقًا. |
| `cannot create ... it may already exist` | يوجد ملف مفتاح. لا يكتب البرنامج فوق ملف موجود أبدًا. | واصل استخدامه، أو احذفه بـ `rm` إن لم يكن فيه ما تحتاجه، ثم نفّذ `new` من جديد. |
| `account qor1... not found on chain yet; fund it first` | لا يملك الحساب أي QOR بعد، فهو غير موجود على السلسلة. | اطلب QOR من الـ faucet (الخطوة 6)، وانتظر نحو 10 ثوانٍ، وأعد المحاولة. |
| يقول الـ faucet إنك بلغت حد الطلبات | يسمح الـ faucet بطلب واحد كل 24 ساعة لكل حساب. | انتظر 24 ساعة، أو استخدم حسابًا تجريبيًا ثانيًا. |
| `account has no PQC key and classical fallback is disabled` | أرسلت دفعة قبل تسجيل المفتاح المقاوم للحوسبة الكمومية. | نفّذ `./target/release/qday-pay register`، ثم أرسل مرة أخرى. |
| `not a qor1 address` | المستلم خاطئ، مثلًا عنوان `0x...`. | استخدم عنوان `qor1...`. |
| `transport error` أو `error sending request` | لا يوجد إنترنت، أو testnet غير متاحة لوقت قصير. | تحقق من اتصالك وأعد المحاولة بعد دقيقة. |
| `NOT VERIFIED as hybrid` | فشلت المعاملة أو لم تكن موقّعة هجينيًا. | اقرأ `code` في التقرير. أرسل دفعة جديدة بهذا البرنامج. |
| `pnpm: command not found` | جرّبت تطبيق JavaScript. لا يحتاج تطبيق Rust هذا إلى pnpm. | تجاهله هنا. أما لتطبيقات JavaScript فنفّذ `npm install -g pnpm`. |
| `EVM authorisation window exhausted` | تخص تطبيق Hardhat، لا هذا التطبيق. | في ذلك التطبيق افتح نافذة جديدة بالأمر `pnpm window open`. |
| أخطاء CORS | تخص تطبيقات المتصفح. وتطبيق سطر الأوامر هذا لا يواجهها. | في تطبيق متصفح، استخدم وكيل `/lcd` الموجود في القالب. |

## الحساب {#account}

الحساب هو حساب secp256k1 من QoreChain Native (نوع العملة 118، والمسار `m/44'/118'/0'/0/0`، وعنوان `qor1...`). ويأتي مفتاح ML-DSA-87 من عبارة الاسترجاع نفسها عبر القاعدة القانونية المرتبطة بالعنوان في SDK ‏(`authenticator::try_derive_pqc_canonical`). عبارة استرجاع واحدة تستعيد المفتاحين.

## كود SDK المهم {#code}

هذا هو لبّ الأمر `send` في الملف `src/main.rs`:

```rust
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);           // MsgSend
let draft = build_hybrid_tx(params.clone())?;                           // secp256k1 + ML-DSA-87
params.fee = estimate_fee(rest, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params)?;                                      // sign for real
let res = broadcast_and_wait(rest, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

التسجيل استدعاء واحد: `PqcDx::ensure_pqc_registered()`. يرسل `MsgRegisterPQCKeyV2` مع إثبات الحيازة فقط عندما لا يكون هناك مفتاح مسجّل بعد.

## كيف يُحسم "VERIFIED" {#verified}

يقرأ `verify` الطلب `GET /cosmos/tx/v1beta1/txs/{hash}` ويتحقق من:

- نجاح المعاملة (`code 0`)؛
- إصدار السلسلة الحدث `pqc_hybrid_verify` مع `status=verified` للموقّع؛
- حمل جسم المعاملة امتداد `/qorechain.pqc.v1.PQCHybridSignature` فيه توقيع ML-DSA-87 بحجم 4,627 بايت (بجانب توقيع secp256k1 البالغ 64 بايت).

## ما الذي يجب أن تراه {#output}

- يطبع `new` عنوان `qor1...` ومكان ملف المفتاح، ولا يطبع عبارة الاسترجاع أبدًا.
- يعرض `status` الرصيد وهل مفتاح ML-DSA-87 مسجّل.
- ينتهي `send` بـ `VERIFIED: secp256k1 + ML-DSA-87` ورابط المستكشف.
- في https://explore.qore.network (محوَّلًا إلى Testnet) تظهر المعاملة تحت معرّفها.

## نقاط نهاية الشبكة {#access}

| | |
| --- | --- |
| معرّف سلسلة Cosmos | `qorechain-diana` (testnet فقط) |
| REST | `https://api-testnet.qore.host` |
| Faucet | https://dashboard.qorechain.io/faucet |
| المستكشف | https://explore.qore.network (حوّله إلى Testnet) |

## الحزم المستخدمة {#packages}

| الحزمة (crate) | الإصدار | الاستخدام |
| --- | --- | --- |
| `qorechain-sdk` | 0.13 | الحسابات والتوقيع الهجين وعميل REST ودوال التحقق |
| `tokio` | 1 | بيئة التشغيل غير المتزامنة |
| `serde_json` | 1 | قراءة إجابات JSON من السلسلة |
| `base64` | 0.22 | قياس أحجام التوقيعات |
| `cosmrs` | 0.22 | نوع الرسالة `Coin` |

## الكود المصدري {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
