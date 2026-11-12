---
slug: /build-before-qday/workshop-1/apps/rust-qday-pay
title: تطبيق Rust، qday-pay
sidebar_label: Rust، qday-pay
sidebar_position: 4
---

# تطبيق Rust: qday-pay

**qday-pay** أداة سطر أوامر صغيرة بلغة Rust تدفع بعملة QOR على شبكة QoreChain الاختبارية (`qorechain-diana`، معرّف سلسلة EVM هو 9800) بـ **توقيع هجين**: توقيع كلاسيكي secp256k1 وتوقيع ما بعد كمومي ML-DSA-87 (FIPS 204) على المعاملة نفسها. بعد الإرسال تقرأ المعاملة من السلسلة وتعرض هل تحققت السلسلة من النصفين.

## ما الذي يُظهره {#what-it-shows}

- **توقيع هجين ML-DSA-87 + secp256k1** من Rust، بالحزمة المنشورة ودون أدوات إضافية.
- **معاملة هجينة واحدة متحقَّق منها على السلسلة**: تُصدر السلسلة الحدث `pqc_hybrid_verify` بالحالة `status=verified`، ويحمل جسم المعاملة توقيع ML-DSA-87 بحجم 4627 بايت إلى جانب توقيع secp256k1 البالغ 64 بايت.
- **عبارة استرداد واحدة، مفتاحان**: يُشتق مفتاح ML-DSA-87 من العبارة نفسها التي يُشتق منها المفتاح الكلاسيكي ويُربط بعنوانك.

لماذا يهم ذلك: يُتوقع أن يكسر حاسوب كمومي في المستقبل تواقيع secp256k1. أما المعاملة التي تحمل أيضًا توقيع ML-DSA-87 فتبقى محمية. راجع [المعاملات الآمنة كموميًا](/sdk/guides/quantum-safe).

## خطوة بخطوة {#run}

### 1. ثبّت الأدوات

تحتاج إلى Git وسلسلة أدوات Rust مستقرة حديثة مع `cargo`.

- Git: https://git-scm.com/downloads
- Rust: ثبّته بـ rustup من https://rustup.rs

افحص الإصدارات:

```bash
git --version
rustc --version
cargo --version
```

### 2. احصل على الشيفرة

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/04-rust-qday-pay
```

### 3. ابنِ

```bash
cargo build --release
```

ينزّل البناء الأول الاعتماديات ويترجمها ويستغرق بضع دقائق. وينتهي بـ `Finished` مع ملف التعريف `release`. تشغيل الأداة دون وسائط يطبع قائمة الأوامر:

```bash
cargo run --release
```

### 4. أنشئ حسابًا اختباريًا مؤقتًا

```bash
cargo run --release -- new
```

ينشئ `new` عبارة استرداد ويحفظها في ملف مفاتيح بصلاحيات 0600. لا تُطبع العبارة أبدًا. الموضع الافتراضي لملف المفاتيح هو `~/.config/qday/rust.env`؛ اضبط `QDAY_KEY_FILE` لاستخدام مسار آخر. ويرفض الأمر الكتابة فوق ملف موجود. هذا حساب لشبكة الاختبار فقط: لا تستخدم هنا محفظة حقيقية أبدًا، ولا تشارك ملف المفاتيح ولا تُودِعه، ولا تعِد استخدامه على الشبكة الرئيسية. يطبع الأمر عنوانك `qor1...`.

### 5. احصل على QOR اختبارية من الصنبور

1. افتح https://dashboard.qorechain.io/faucet وسجّل الدخول.
2. الصق عنوانك `qor1...` واطلب. تدفع المطالبة 100 QOR، مرة كل 24 ساعة لكل حساب ولكل عنوان.

يجب أن يكون الحساب موجودًا على السلسلة قبل الخطوة التالية، لأن التسجيل يدفع رسمًا.

### 6. افحص الحساب

```bash
cargo run --release -- status                  # address, balance, PQC key, latest block
```

### 7. سجّل مفتاح ML-DSA-87

```bash
cargo run --release -- register                # register the ML-DSA-87 key (once, idempotent)
```

تُوقَّع معاملة التسجيل كلاسيكيًا، لأن المفتاح لا يستطيع أن يشارك في توقيع تسجيله بنفسه. وتشغيله مرة أخرى لا يفعل شيئًا.

### 8. أرسل دفعة موقّعة هجينًا

```bash
cargo run --release -- send qor1... 1 --memo "Build Before Q-Day Workshop 1 (Rust)"
```

استبدل `qor1...` بأي عنوان على شبكة الاختبار (مثلًا حساب مؤقت ثانٍ). المبلغ بعملة QOR. يدفع `send` المبلغ ثم يجري التحقق.

### 9. تحقق من أي معاملة

```bash
cargo run --release -- verify <TX_HASH>        # the verification report for any transaction
```

الأداة لشبكة الاختبار فقط: تستخدم الإعداد المسبق `testnet` من SDK وترفض العمل على أي معرّف سلسلة آخر.

## الحساب {#account}

الحساب هو حساب QoreChain Native من نوع secp256k1، بنوع العملة 118 (`m/44'/118'/0'/0/0`)، وعنوانه `qor1...`. يُشتق مفتاح ML-DSA-87 من عبارة الاسترداد نفسها بالقاعدة القانونية المرتبطة بالعنوان في SDK. عبارة واحدة تستعيد المفتاحين.

```rust
let classical = derive_native_account(mnemonic, 0)?;
let pqc = try_derive_pqc_canonical(&classical.address, mnemonic)?;
```

## شيفرة SDK المهمة {#code}

هذا هو لبّ الأمر `send`، بعد الاختصار:

```rust
// The payment: a plain bank MsgSend.
let send = bank_send_any(w.address(), to, vec![coin(&uqor)]);
// Which hybrid sign-bytes form this network verifies (asked once, cached).
let version = SignBytesResolver::new()
    .resolve(SignBytesMode::Auto, &net.chain_id, Some(&net.rest_url)).await?;

let mut params = BuildHybridTxParams {
    private_key: w.classical.private_key.clone(), // secp256k1 half
    public_key: w.classical.public_key.clone(),
    pqc_secret_key: w.pqc.secret_key.clone(),     // ML-DSA-87 half
    pqc_public_key: w.pqc.public_key.clone(),
    messages: vec![Message { type_url: send.type_url, value: send.value }],
    chain_id: net.chain_id.clone(),
    include_pqc_public_key: false, // key registered with `register`
    sign_bytes_version: Some(version),
    /* fee, account_number, sequence, memo, timeout_height */
};

let draft = build_hybrid_tx(params.clone())?;                    // sign a draft
params.fee = estimate_fee(&net.rest_url, &draft.tx_raw_bytes, 1.3, "0.15uqor").await?; // simulate, gas x 1.3
let tx = build_hybrid_tx(params.clone())?;                       // sign for real
let res = broadcast_and_wait(&net.rest_url, &tx.tx_raw_bytes, WaitOptions::default()).await?;
```

التسجيل نداء واحد idempotent هو `ensure_pqc_registered()` على `PqcDx`: يرسل `MsgRegisterPQCKeyV2` مع إثبات الحيازة فقط عندما لا يكون هناك مفتاح مسجَّل بعد، ويفشل إن كان الحساب يحمل مفتاحًا مختلفًا.

الغاز لا يكون ثابتًا أبدًا: تُحاكى المسودة ويكون الحد هو الغاز المحاكى مضروبًا في 1.3، بسعر 0.15 uqor للغاز الواحد (الحد الأدنى في السلسلة 0.1 uqor).

## كيف يُحدَّد "verified" {#verified}

يقرأ `verify` النقطة `GET /cosmos/tx/v1beta1/txs/{hash}` من نقطة REST العامة لشبكة الاختبار ويفحص ثلاثة أمور:

- نجاح المعاملة (`code 0`)؛
- إصدار السلسلة الحدث `pqc_hybrid_verify` بالحالة `status=verified` للموقّع؛
- حمل الجسم للامتداد `/qorechain.pqc.v1.PQCHybridSignature` مع توقيع ML-DSA-87 بحجم 4627 بايت.

## ما الذي يجب أن تراه {#output}

يطبع `send` الناجح المبلغ والرسم والكتلة التي أُدرجت فيها المعاملة، ثم تقريرًا يبيّن أن المعاملة نجحت، وأن `pqc_hybrid_verify` هو `verified`، وأن توقيع ML-DSA-87 بحجم 4627 بايت. وإن فشل أي فحص، تنتهي الأداة بالحالة 2. للبحث عن المعاملة افتح https://explore.qore.network وبدّله إلى **Testnet** وابحث عن التجزئة، أو افتح `https://explore.qore.network/tx/<HASH>`.

## نقاط نهاية الشبكة {#access}

| ماذا | أين |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| المستكشف | `https://explore.qore.network` (بدّل إلى Testnet) |
| الصنبور | https://dashboard.qorechain.io/faucet |

## الحزم المستخدمة {#packages}

| البند | الإصدار |
| --- | --- |
| `qorechain-sdk` (يُستورد باسم `qorechain`) | 0.13 (يُحَلّ إلى 0.13.0) |
| `tokio` | 1 |
| `serde_json` | 1 |
| `base64` | 0.22 |
| `cosmrs` | 0.22 |
| `qday-pay` (هذا التطبيق، غير منشور) | 0.1.0 |

راجع [تثبيت SDK](/sdk/install) لجدول إصدارات SDK بكل اللغات.

## الشيفرة المصدرية {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/04-rust-qday-pay
