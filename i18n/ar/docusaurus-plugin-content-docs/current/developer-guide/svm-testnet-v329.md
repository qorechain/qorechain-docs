---
slug: /developer-guide/svm-testnet-v329
title: "SVM على شبكة الاختبار: نشر البرامج وإرسال معاملات Solana (v3.2.9)"
sidebar_label: SVM على شبكة الاختبار (v3.2.9)
sidebar_position: 11
---

# SVM على شبكة الاختبار: نشر البرامج وإرسال معاملات Solana (v3.2.9)

يتيح الإصدار **v3.2.9** لسطر أوامر Solana القياسي أن يتخاطب مع QoreChain. تستطيع تشغيل `solana transfer` و`solana program deploy` و`anchor deploy` وسكربت web3.js على شبكة الاختبار، وتتحقق السلسلة بنفسها من كل توقيع Solana. ولا يستطيع مفتاح Solana أن يمسّ حسابك في QoreChain بمفرده: تفتح أولًا **نافذة تفويض** صغيرة ومحدودة بمعاملة موقَّعة بمفتاحك **ما بعد الكمومي**، ولا تُقبل النافذة إلا إذا أثبت مفتاح Solana بتوقيعه هو أنك تملكه. وحين تنتهي النافذة يعود المفتاح حسابًا عاديًا في Solana.

تأخذ هذه الصفحة المطوّر من جهاز فارغ إلى برنامج منشور ومُستدعى على شبكة الاختبار: ما الجديد، والأدوات، وبناء إثبات المفتاح يدويًا، وفتح النافذة وإغلاقها، وتمويل مفتاح النشر، والنشر بـ `solana` أو `anchor`، واستدعاء البرنامج، وقراءة النتيجة، وجدولًا بنصوص الأخطاء الفعلية.

:::note شبكة الاختبار فقط، تم التحقق في 22 نوفمبر 2026
كل ما هنا يعمل على شبكة الاختبار **`qorechain-diana`** التي تعمل بالإصدار v3.2.9 منذ 20 نوفمبر 2026 (مقترح الحوكمة 39، الارتفاع 10,424,000). والمسار المتوافق مع Solana (SVM) مفتوح فيها منذ مقترح الحوكمة 37. **لا شيء من هذا يعمل على الشبكة الرئيسية:** مسار SVM مطفأ على `qorechain-vladi`، وتبقى الاستدعاءات عبر الأنوية الافتراضية متوقفة، ويبقى رفع عقود CosmWasm بالحوكمة فقط. ابنِ على شبكة الاختبار وحدها. QOR الاختبار بلا قيمة. استخدم مفاتيح للتجربة فقط.

شُغّلت استدعاءات القراءة وعرض الرسوم ومسار nonce ومثال إثبات المفتاح في هذه الصفحة على شبكة الاختبار الحيّة في 22 نوفمبر 2026. أما التدفق الكامل (النافذة والتمويل والنشر والاستدعاء والترقية والإغلاق) فشُغّل قبل الإصدار على شبكة اختبار محلية بـ `solana-cli` 4.0.2 و`anchor-cli` 1.2.2 دون تعديل. انظر [ما الذي جرى التحقق منه](#tested) لمعرفة التقسيم الدقيق.
:::

:::caution البوابة العامة لا تمرّر المعاملات بعد
في 22 نوفمبر 2026 ردّت `https://svm-testnet.qore.host` على كل `sendTransaction` سليم الصياغة بالنص `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)`. القراءات تعمل وعروض الرسوم تعمل، لكن الكتابات مرفوضة إلى أن يضبط مشغّلو تلك البوابة حساب مُمرِّر (relayer). والخطوات حتى النافذة ومعها لا تحتاج بوابة. أما الخطوات التي ترسل فانظر [الإرسال دون البوابة العامة](#relay)، وأعد فحص نقطة النهاية قبل أن تبدأ: شغّل الأمر في [الخطوة 1](#step-config) ثم `solana transfer` كما في [الخطوة 6](#step-fund).
:::

## الجديد في v3.2.9 لـ SVM {#whats-new}

* **معاملات Solana الخام على السلسلة.** المعاملة التي وقّعتها محفظة Solana أو أداتها تُحمل بايتًا ببايت في الرسالة الأصلية `MsgSolanaTransaction`. تتحقق السلسلة من كل توقيع ed25519 ومن blockhash الحديث ومن دافع الرسوم، وتنفّذ التعليمات بالترتيب خطوة ذرية واحدة، وترفض توقيعًا سبق أن رأته. ولا تعمل الرسالة إلا رسالة علوية في معاملتها الحاملة هي: فهي مرفوضة تحت authz وحين يرسلها عقد.
* **بوابة تمرّر بدل أن تنفّذ.** لم تعد دالة JSON-RPC `sendTransaction` في العقدة تنفّذ شيئًا على العقدة. فهي تفكّ ترميز المعاملة، وتحاكيها على نسخة مهملة من الحالة، وتسلّمها إلى حساب مُمرِّر يوقّع المعاملة الحاملة بالمفتاحين ويرسلها إلى mempool. وحده ما يمرّ في كتلة يغيّر الحالة. ولا يكتسب المُمرِّر أي سلطة على معاملتك لأن توقيعات ed25519 الخاصة بك يُتحقَّق منها على السلسلة.
* **نافذة تفويض ما بعد كمومية لمفاتيح Solana.** تسمّي `MsgOpenSVMWindow` مفتاح ed25519 واحدًا وتقيّده بعدد الكتل وعدد المعاملات وقيمة QOR، ويمكن قصرها على برامج مذكورة. وما دامت النافذة مفتوحة تعمل المعاملات الموقَّعة بذلك المفتاح نيابةً عن حسابك. وفتحها يحتاج **توقيع ML-DSA-87 الخاص بك**، فلا يستطيع مفتاح Solana مسرَّب وحده أن يفتح واحدة.
* **إثبات المفتاح.** فتح النافذة يحتاج `svm_key_proof` (الحقل 7): توقيع Ed25519 من 64 بايتًا يصنعه مفتاح Solana نفسه على نص قصير يسمّي السلسلة وحسابك والمفتاح. والمفتاح العام علني، لذا فالإثبات هو ما يبيّن أن من يفتح النافذة يملك المفتاح.
* **إثبات واحد يفتح نافذة واحدة.** يحمل النص عدّادًا (nonce) يزيد مع كل نافذة تُفتح لذلك المفتاح، فلا يمكن إعادة استخدام إثبات قديم.
* **محمِّل برامج.** المحمِّل القابل للترقية متاح، فتعمل `solana program deploy` و`write-buffer` و`extend` و`set-upgrade-authority` و`close` و`anchor deploy`، ويمكن لسلطة البرنامج ترقيته وإغلاقه لاسترداد الإيجار.
* **رسوم تفهمها أدوات Solana.** تُبلغ `getFeeForMessage` و`simulateTransaction` عن الرسم الحقيقي، فتصحّ فحوص الرسوم الافتراضية في `solana` وweb3.js دون علامات إضافية. وحين تكون المعاملة رخيصة جدًا يحمل الخطأ السعر الدقيق الواجب ضبطه.
* **ميزانيات لمنح authz.** الرسائل `MsgExecuteProgram` و`MsgCreateAccount` و`MsgDeployProgram` التي يرسلها غيرك باسمك بموجب منحة authz لا تعمل إلا داخل نافذة وميزانيتها المنفصلة "نيابةً عنك".

### مسار المعاملة {#path}

```text
solana CLI / web3.js / anchor
        |  sendTransaction (signed wire transaction)
        v
SVM gateway on a node: decode, verify, simulate on a copy, check the price
        |  relayer signs MsgSolanaTransaction with the classical key and ML-DSA-87
        v
mempool, then a block: ante checks every Solana signature, blockhash, fee payer, window
        v
instructions run in order; they all succeed or none does
```

يذهب رسم Solana إلى المُمرِّر، فلا يتحمّل خسارة من جيبه أبدًا. وكل جواب من البوابة نهائي: تُثبَّت الكتلة مرة واحدة، فتعيد `processed` و`confirmed` و`finalized` البيانات نفسها.

### النافذة: ما الذي تقيّده {#window}

| الحد | معناه | النطاق |
| ----- | ------------- | ----- |
| الكتل | تنتهي النافذة بعد هذا العدد من الكتل. تستغرق الكتلة نحو 1.4 ثانية على شبكة الاختبار (تم التحقق في 22 نوفمبر 2026)، فـ 3,600 كتلة نحو 85 دقيقة | من 1 إلى 17,280 |
| المعاملات | كل معاملة Solana مقبولة تُحتسب واحدة، حتى لو فشلت بعد ذلك | من 1 إلى 1,000 |
| القيمة | يُحتسب كل نقص في QOR الأصلي لحسابك سببته معاملات مقبولة، ومنه الرسوم. والمعاملة التي ستتجاوز القيمة تُرفض وتُعكس. تُعطى القيمة بـ uqor أو QOR، مثل `25qor` | أكبر من 0 |
| البرامج (اختياري) | يجب أن تستدعي كل تعليمة في معاملة مقبولة أحد البرامج المذكورة | حتى 16 |

قواعد تنتج عن التصميم:

* لا تُفتح النافذة ولا تُغلق إلا **بتوقيعك أنت ما بعد الكمومي**، رسالةً علوية. وهي مرفوضة تحت authz أو المجموعة أو العقد.
* تحتاج إلى **مفتاح ما بعد كمومي مسجَّل** قبل أن تفتح نافذة.
* **مفتاح Solana واحد يفوّض حسابًا واحدًا في كل مرة.** فتح نافذة من جديد يستبدل القديمة ويحرّر مفتاحها.
* **تغيير مفتاحك ما بعد الكمومي أو ترحيله ينهي النافذة.**
* إضافة إلى الرصيد الأصلي، يحتسب حد القيمة أيضًا QOR الذي يتحكم به توقيعك في أماكن أخرى: حسابات مشتقة من حسابك بـ seed، وحسابات توكن يجوز لك إغلاقها، وجداول البحث وحسابات المحمِّل التي أنت سلطتها. وتُحتسب إن أُنفقت أو سُلّمت لغيرك. ولا يستطيع مفتاح النافذة أبدًا إخراج عنوان حسابك نفسه من حالة المحفظة.
* قراءة `getBalance` أو `getAccountInfo` لمفتاح النافذة تُظهر رصيدك الأصلي ما دامت النافذة مفتوحة.

### حدود معروفة للنافذة {#window-limits}

اقرأ هذا قبل أن تفتح نافذة لمحفظة تحوي توكنات.

* **كميات التوكن لا تُحتسب في حد القيمة.** يحتسب الحد QOR الأصلي وحده. ومع النطاق الافتراضي (دون قائمة برامج) يستطيع مفتاح Solana تحويل توكنات SPL الخاصة بالحساب وإحراقها، وسكّ توكنات بسلطة سكّ يملكها الحساب، مقابل رسم المعاملة وحده.
* **النطاق الافتراضي يرفض المنح الدائمة.** المفتاح العامل عبر نافذة بنطاق افتراضي لا يستطيع الموافقة على مفوَّض (delegate)، ولا تغيير مالك حساب توكن أو سلطة إغلاقه، ولا تغيير سلطة السكّ أو التجميد. ويشمل ذلك حساب توكن أو سكًّا أُنشئ في المعاملة نفسها. وهذه تحتاج توقيعك ما بعد الكمومي أنت، أو نافذة تسمّي قائمة برامجها برنامج التوكن.
* **دفعة الموقِّع المشارك تُحتسب على النافذة.** إذا وقّع مفتاح آخر المعاملة نفسها ودفع فيها شيئًا، فتلك الدفعة تُحتسب أيضًا على حد قيمتك. دع الراعي يدفع في معاملة منفصلة، أو افتح نافذة يغطي حد قيمتها كل ما تنقله المعاملة.
* **المنح الممنوحة تحت نطاق توكن صريح تبقى بعد النافذة.** إذا سمّت قائمة البرامج برنامج التوكن، فإن المفوَّضين وتغييرات السلطة التي تجري عبر النافذة تبقى قائمة بعد أن تُغلق النافذة أو تنتهي أو يُدوَّر مفتاحك ما بعد الكمومي. اسحبها بتوقيعك أنت.
* **لاستبعاد إجراءات التوكن كليًا** افتح النافذة بقائمة برامج لا تسمّي برنامج التوكن.

### الرسوم {#fees}

| البند | القيمة (شبكة الاختبار، 22 نوفمبر 2026) |
| ---- | --------------------------------- |
| الرسم الأساسي لكل توقيع | 0.045 QOR (45,000 uqor، 45,000,000 lamports). وهو سعر 450,000 غاز عند الحد الأدنى لسعر الغاز في السلسلة وهو 0.1 uqor للغاز، وتُبلغ عنه `getFeeForMessage` |
| الوحدات على الشاشة | تسمّي `solana` المبالغ **SOL**. وفي QoreChain يساوي 1 "SOL" واحد QOR، لأن 1 uqor يساوي 1,000 lamports وواحد QOR يساوي 1,000,000 uqor. اقرأ "0.045 SOL" على أنها 0.045 QOR |
| رسم الأولوية | فقط حين تحتاج المعاملة غازًا أكثر مما يدفعه الرسم الأساسي. وهو سعر ComputeBudget مضروبًا في حد الوحدات |
| النشر | رسم أساسي واحد لكل معاملة كتابة، إضافة إلى إيجار يعود حين تغلق البرنامج |

ما تدفعه محدود بما وقّعت عليه: تدفع كلفة المعاملة الحاملة، وهي لا تقل عن الرسم الأساسي ولا تزيد على الرسم الذي وعد به توقيعك. ولا يستطيع المُمرِّر أن يجعلك تدفع أكثر.

حين تدفع المعاملة أقل مما تكلّفه حاملتها ترفضها البوابة بالرمز `-32002` وتخبرك بالإصلاح الدقيق. والأرقام نفسها في `data` الخطأ:

```json
{
  "code": -32002,
  "message": "Transaction simulation failed: insufficient priority fee: the transaction pays 45000000 lamports, its carrier costs ... uqor ... set ComputeBudget SetComputeUnitPrice to <price> micro-lamports per compute unit, which covers it for a compute unit limit of <limit> or more ...",
  "data": {
    "computeUnitPrice": 0,
    "computeUnitLimit": 0,
    "transactionComputeUnitLimit": 0,
    "carrierFeeLamports": 0,
    "feeLamports": 0
  }
}
```

تمثّل الأصفار أرقام معاملتك. اضبط `SetComputeUnitPrice` على `data.computeUnitPrice` وحد وحدات لا يقل عن `data.computeUnitLimit`؛ وأقل منه بمايكرو-lamport واحد يُرفض من جديد. ومع `solana program deploy` استخدم `--with-compute-unit-price <data.computeUnitPrice>`. وفي التشغيلات قبل الإصدار وسعها الرسم الأساسي في كل خطوة من نشر برنامج عادي وترقيته وتوسيعه وإغلاقه وتغيير سلطته، فلا تصادف هذا الخطأ إلا مع `--max-len` كبير على غير العادة.

### ميزانيات "نيابةً عنك" {#on-behalf}

المفوَّض بمنحة authz الذي يرسل `MsgExecuteProgram` أو `MsgCreateAccount` أو `MsgDeployProgram` باسمك لا يعمل إلا داخل نافذتك و**ميزانيتها المنفصلة "نيابةً عنك"**: `on_behalf_max_txs` و`on_behalf_max_value`. ولا تستنفد حدود المفتاح نفسه وميزانية "نيابةً عنك" إحداهما الأخرى. ومع غياب هذه الميزانية (وهو الافتراضي) تُرفض هذه المنح ولا يتحرك شيء. و`MsgExecuteProgram` الملفوفة في تنفيذ authz والحساب نفسه هو المفوَّض تُحتسب كذلك مرسلةً نيابةً عنك، فأرسل رسائل SVM الخاصة بك رسائل علوية.

كل تنفيذ أو نشر متداخل يجعل حسابك يدفع أيضًا الرسم الثابت لـ SVM، وهو `max(1, compute_budget_max / 1000)` uqor، أي 1,400 uqor عند القيمة الحيّة للمعامل وهي 1,400,000. ويُحتسب هذا الرسم على حد القيمة "نيابةً عنك". اضبط `--on-behalf-max-value` على ما لا يقل عن `on_behalf_max_txs` مضروبًا في الرسم الثابت، إضافة إلى القيمة التي يُراد للمفوَّض نقلها. والقيمة 0 ترفض كل تنفيذ نيابةً عنك.

### المحمِّل {#loader}

| ما تشغّله | ما يفعله على السلسلة |
| ------- | --------------------- |
| `solana program deploy x.so` | يكتب البرنامج في مخزن مؤقت (buffer) عبر معاملات صغيرة كثيرة، ثم ينشره. معرّف البرنامج هو الوارد في `--program-id`، أو معرّف جديد |
| `solana program deploy --program-id <id> x.so` لبرنامج موجود | يرقّيه. وسلطة الترقية وحدها تستطيع ذلك |
| `solana program write-buffer` / `show --buffers` / `close <buffer>` | يكتب مخزنًا مؤقتًا ويعرضه ويغلقه دون نشر |
| `solana program extend <id> <bytes>` | يكبّر منطقة بيانات البرنامج |
| `solana program set-upgrade-authority <id> --new-upgrade-authority <key>` | يسلّم الترقيات إلى مفتاح آخر. و`--final` يجعل البرنامج دائمًا |
| `solana program close <id>` | يغلق البرنامج ويعيد الإيجار |
| `anchor deploy` | يفعل الشيء نفسه بالبرنامج الذي بناه Anchor |

يجوز أن يبلغ حجم البرنامج 10 MiB (قيمة `max_program_size` الحيّة). وتستدعي البرامج بعضها حتى 4 مستويات عمقًا (`max_cpi`). وميزانية الحوسبة الافتراضية تصل إلى 1,400,000 وحدة لكل تعليمة.

## ألفاظ هذا الدليل {#words}

| اللفظ | المعنى البسيط |
| ---- | ------------- |
| SVM | الآلة الافتراضية المتوافقة مع Solana في QoreChain. تشغّل البرامج المُصرَّفة نفسها (SBF) كما في Solana |
| Lamport | أصغر وحدة في أدوات Solana. 1 uqor يساوي 1,000 lamports، وواحد QOR يساوي 1,000,000,000 lamports |
| النافذة | إذن قصير ومحدود لمفتاح Solana واحد كي يعمل نيابةً عن حسابك. وفتحها يحتاج معاملة موقَّعة بمفتاحك ما بعد الكمومي |
| إثبات المفتاح | توقيع مفتاح Solana نفسه على نص قصير. يثبت أنك تملك المفتاح الذي سمّيته |
| Nonce | عدّاد لكل مفتاح Solana، يزيد مع كل نافذة تُفتح بإثبات. ويجب أن يوقّع الإثبات التالي القيمة الحالية |
| الحاملة (Carrier) | المعاملة الأصلية التي تحمل معاملة Solana واحدة عبر كتلة |
| المُمرِّر (Relayer) | الحساب الذي يوقّع الحاملة ويرسلها. ويعوّضه رسم Solana |
| Blockhash | تجزئة الكتلة الحديثة التي تُبنى عليها معاملة Solana. صالحة لمدة 150 slot، أي نحو 3.5 دقائق هنا |

## قبل أن تبدأ {#prerequisites}

تحتاج طرفية على macOS أو Linux، ونحو 10 QOR من QOR الاختبار، وهذه الأدوات (الإصدارات في العمود الأيمن هي المستخدمة لهذه الصفحة):

| الأداة | الغرض | الإصدار المستخدم |
| ---- | -------- | ------------ |
| سطر أوامر Solana (Agave) | `solana` و`solana-keygen` | `solana-cli` 4.0.2 |
| Rust و`cargo build-sbf` | بناء برنامج | `cargo-build-sbf` 4.0.0، platform tools v1.53، `rustc` 1.89 |
| Anchor (اختياري) | `anchor build` و`anchor deploy` | `anchor-cli` 1.2.2 |
| Node.js 18 أو أحدث | سكربت إثبات المفتاح وسكربت الاستدعاء | أي LTS حالي |
| `@solana/web3.js` 1.x | استدعاء البرنامج | 1.99 |
| `qorechaind` v3.2.9 | تسجيل مفتاحك ما بعد الكمومي وفتح النافذة وإغلاقها | الملف الثنائي للإصدار، انظر أدناه |

افحص ما لديك:

```bash
solana --version
cargo build-sbf --version
anchor --version
node -v
```

**عن `qorechaind`.** فتح النافذة رسالة أصلية تحتاج توقيع ML-DSA-87 الخاص بك، والأمر `tx pqc open-svm-window` جزء من v3.2.9. وفي 22 نوفمبر 2026 كان بيان إصدار شبكة الاختبار (`https://download.qore.host/testnet/latest.json`) لا يزال يذكر الإصدار 3.2.8، فحزمة v3.2.9 هي المسمّاة في نص مقترح الحوكمة 39 (`GET https://api-testnet.qore.host/cosmos/gov/v1/proposals/39`). والملف الثنائي للإصدار مبني لـ Linux؛ ولا يوجد ملف ثنائي مُحزَّم لـ macOS. ولم تُنشر بعد دالة مساعدة في SDK للنافذة. وكل ما عدا ذلك في هذا الدليل لا يحتاج عقدة.

وتحتاج أيضًا حسابًا في QoreChain فيه QOR اختبار (احصل عليه من [الصنبور](/dashboard/faucet)) ومفتاحًا ما بعد كمومي مسجَّلًا. وإن لم تفعل ذلك فاتبع أولًا [تسجيل مفتاحك](/developer-guide/post-quantum-signing#pqc-key-registration). تسمّي الأوامر أدناه مفتاح الحساب `mykey` ومفتاحه ما بعد الكمومي `mykey-mldsa`.

:::caution مفاتيح شبكة اختبار للتجربة فقط
زوجا مفاتيح Solana اللذان تنشئهما أدناه ملفان فيهما مفاتيح سرية. لا تستخدم أبدًا زوج مفاتيح يحوي أموالًا حقيقية على شبكة أخرى، ولا تلصق مفتاحًا سريًا في أمر أو محادثة أو مستودع.
:::

## خطوة بخطوة {#steps}

أنشئ مجلد عمل واحدًا وإعداد Solana منفصلًا كي لا تُمسّ إعدادات `solana` المعتادة لديك:

```bash
mkdir -p ~/qore-svm && cd ~/qore-svm
alias qsol='solana -C ~/qore-svm/solana-config.yml'
```

يشغّل الاسم المستعار `solana` بملف إعداده الخاص. استمر في الطرفية نفسها، أو كرّر الاسم المستعار في طرفية جديدة.

### الخطوة 1: وجّه أدوات Solana إلى شبكة الاختبار {#step-config}

```bash
qsol config set --url https://svm-testnet.qore.host
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
qsol epoch-info
```

يحفظ السطر الأول عنوان RPC في `solana-config.yml`. ويسأل الثاني العقدة عن إصدارها. يجب أن ترى `solana-core` بالقيمة `1.18.0-qorechain`، ومعرّف السلسلة `qorechain-diana`، وتجزئة genesis `6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj` (HTTP 200). ويطبع الثالث الـ slot الحالي، وهو يساوي ارتفاع الكتلة (نحو 10.57 مليونًا في 22 نوفمبر 2026).

معاملات المسار هي ما يحدد ما يتّسع. اقرأها مرة واحدة:

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

يجب أن ترى `"enabled":true` وحدود شبكة الاختبار الحيّة: `max_program_size` بقيمة 10,485,760 و`compute_budget_max` بقيمة 1,400,000 و`lamports_per_byte` بقيمة 3,480 و`max_cpi` بقيمة 4. وإن كانت `enabled` تساوي `false` فالمسار مغلق ولا شيء مما يلي يمكن أن يعمل.

لا تخدم نقطة النهاية العامة websocket (ردّ ترقية websocket بـ HTTP 405 في 22 نوفمبر 2026)، فمرّر `--use-rpc` إلى الأوامر التي تؤكد معاملة (`solana program deploy` و`write-buffer`) ودع الأداة تستطلع عبر HTTP العادي. ويقبله Anchor بعد شرطتين.

### الخطوة 2: أنشئ زوجي مفاتيح Solana {#step-keys}

```bash
solana-keygen new --no-bip39-passphrase --outfile window.json
solana-keygen new --no-bip39-passphrase --outfile deployer.json
solana-keygen pubkey window.json
solana-keygen pubkey deployer.json
```

يكتب كل من الأمرين الأولين ملف زوج مفاتيح (مصفوفة JSON من 64 رقمًا: البذرة السرية من 32 بايتًا ثم المفتاح العام). ويطبع الأخيران المفتاحين العامين نصًّا بـ base58. يجب أن ترى عنوانين مختلفين طول كل منهما بين 32 و44 حرفًا. سمّهما `WINDOW_PUBKEY` و`DEPLOYER_PUBKEY`.

لماذا مفتاحان. **مفتاح النافذة** سيعمل نيابةً عن حسابك الأصلي لوقت قصير. لا يحوي شيئًا بنفسه؛ بل ينفق QOR الخاص بك داخل النافذة. أما **مفتاح النشر** فمفتاح Solana عادي. تموّله من النافذة، ومن ثم ينشر ويرقّي ويملك البرنامج دون نافذة. لا تستخدم مفتاح النافذة سلطةَ ترقية: يسجّل البرنامج حسابك الأصلي سلطةً، وترفض `solana` ترقية موقَّعة بمفتاح ليس هو السلطة المسجَّلة.

اضبط مفتاح النشر موقِّعًا افتراضيًا في إعداد Solana لديك:

```bash
qsol config set --keypair ~/qore-svm/deployer.json
```

### الخطوة 3: سجّل مفتاحك ما بعد الكمومي {#step-pqc}

تخطَّ هذه الخطوة إن كان `qorechaind query pqc account <your qor address>` يُظهر مفتاحًا أصلًا. وإلا ففي جهاز فيه `qorechaind` الخاص بالإصدار:

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

qorechaind tx pqc gen-key mykey-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mykey-mldsa \
  --from mykey --chain-id $QCHAIN --node $QNODE --gas 600000 --fees 60000uqor -y
qorechaind query pqc account <your qor address> --node $QNODE
```

ينشئ `gen-key` مفتاح ML-DSA-87 ويطبع مفتاحه العام بالست عشري. ويضعه `register-key-v2` على حسابك مع إثبات الحيازة. ويجب أن يُظهر الاستعلام المفتاح المسجَّل. وهذه هي المعاملة الوحيدة التي يجوز لحساب جديد أن يوقّعها بالمفتاح الكلاسيكي وحده. والشرح الكامل، ومنه كيف تنسخ المفتاح احتياطيًا، في [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing#pqc-key-registration).

### الخطوة 4: ابنِ إثبات المفتاح {#step-proof}

الإثبات توقيع Ed25519 من مفتاح النافذة على هذا النص بالضبط، مرمَّزًا UTF-8 دون مسافات ودون سطر جديد في النهاية:

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>
```

وللمفتاح الذي فتح نافذة أو أكثر من قبل يأتي nonce `N` بعد `|` إضافية:

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>|<N>
```

`N` هو عدد النوافذ التي فُتحت فعلًا بإثبات لذلك المفتاح، مكتوبًا بالعشري دون إشارة ودون أصفار بادئة. وللمفتاح الجديد تكون `N` صفرًا ولا لاحقة. والتوقيع Ed25519 صرف (RFC 8032): بلا تجزئة مسبقة ولا سياق ولا ترويسة رسالة Solana خارج السلسلة، فيجب على المحفظة أن توقّع بايتات UTF-8 الخام.

لا تبنِ النص يدويًا. اطلبه من السلسلة:

```bash
curl -s "https://api-testnet.qore.host/qorechain/pqc/v1/svm_window_key_proof/<WINDOW_PUBKEY>?sender=<your qor address>"
```

يحمل الجواب nonce والنص الدقيق:

```json
{"svm_pubkey":"9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","nonce":"0","key_proof_required":true,"sign_bytes":"qorechain-svm-window-key-v1|qorechain-diana|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","chain_id":"qorechain-diana"}
```

هذا هو الجواب الحي في 22 نوفمبر 2026 لعنوان نموذجي. وقّع `sign_bytes` بمفتاح النافذة. ينجز السكربت أدناه الخطوتين معًا بـ Node.js وحده (احفظه باسم `keyproof.mjs`):

```js
// node keyproof.mjs <solana-keypair.json> <your qor address>
import { readFileSync } from "node:fs";
import { createPrivateKey, sign } from "node:crypto";

const REST = "https://api-testnet.qore.host";
const [keypairPath, sender] = process.argv.slice(2);

// A solana-cli keypair file: JSON array of 64 bytes, the 32-byte seed first, then the public key.
const bytes = Uint8Array.from(JSON.parse(readFileSync(keypairPath, "utf8")));
const seed = bytes.slice(0, 32);

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58(buf) {
  let n = 0n;
  for (const b of buf) n = n * 256n + BigInt(b);
  let out = "";
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  for (const b of buf) { if (b === 0) out = "1" + out; else break; }
  return out;
}
const pubkey = base58(bytes.slice(32));

// The chain knows its id and the key's nonce, so it gives the exact text.
const url = `${REST}/qorechain/pqc/v1/svm_window_key_proof/${pubkey}?sender=${sender}`;
const info = await (await fetch(url)).json();
console.log("nonce:", info.nonce);
console.log("text to sign:", info.sign_bytes);

// Pure Ed25519 over the UTF-8 bytes of the text.
const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(seed)]);
const key = createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
const proof = sign(null, Buffer.from(info.sign_bytes, "utf8"), key);
console.log("svm_key_proof (hex):", proof.toString("hex"));
```

```bash
node keyproof.mjs window.json <your qor address>
```

يجب أن ترى `nonce: 0` والنص وسلسلة ست عشرية من 128 حرفًا. احتفظ بالسلسلة الست عشرية. وهي صالحة لـ **نافذة واحدة** ولهذا المرسل وهذا المفتاح وهذه السلسلة فقط.

**افحص شيفرتك على مثال منشور.** معرّف السلسلة `qorechain-diana`، والمرسل `qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d` (20 بايتًا بقيمة `0x11`)، وnonce يساوي 0:

| الحقل | القيمة |
| ----- | ----- |
| المفتاح العام (base58) | `9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| المفتاح العام (hex) | `79b5562e8fe654f94078b112e8a98ba7901f853ae695bed7e0e3910bad049664` |
| الرسالة (131 بايتًا) | `qorechain-svm-window-key-v1\|qorechain-diana\|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d\|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| التوقيع (hex) | `786b449dcd4b85c2225819c9ac993fbe97a2cfdce7f9ffba07e6895fad0b9b8d3a0634aae5b21d28d366590b3858c7085c8c856a90770fd919ee1bff728b0801` |

ومع nonce يساوي 1 تكون الرسالة 133 بايتًا وتنتهي بـ `|1`. وقد أعاد السكربت أعلاه إنتاج هذا التوقيع في 22 نوفمبر 2026 من المفتاح المطابق. وإذا أنتجت شيفرتك بايتات أخرى للمدخلات نفسها فالأسباب المعتادة سطر جديد في النهاية، أو تجزئة مسبقة، أو ترويسة Solana خارج السلسلة، أو nonce بقيمة خاطئة.

لا يلزمك تشغيل السكربت: فالأمر في الخطوة التالية يستطيع أن يوقّع بملف زوج المفاتيح بنفسه (`--svm-keypair`). استخدم السكربت حين يكون المفتاح في مكان آخر، مثل محفظة تستطيع توقيع رسالة نصية عادية، ومرّر ناتجه بـ `--svm-key-proof`.

### الخطوة 5: افتح النافذة {#step-open}

ابنِ المعاملة ثم أضف التوقيع ما بعد الكمومي. يفتح هذا المثال نافذة من 3,600 كتلة (نحو 85 دقيقة)، وحتى 10 معاملات و10 QOR في المجموع (القيمة مع الرسوم)، مقصورة على برنامج System (التحويلات) والمحمِّل (عمليات النشر):

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana
SYS=11111111111111111111111111111111
LOADER=BPFLoaderUpgradeab1e11111111111111111111111

qorechaind tx pqc open-svm-window <WINDOW_PUBKEY> 3600 10 10qor \
  --allowed-programs $SYS,$LOADER \
  --svm-keypair ~/qore-svm/window.json \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-open.json

qorechaind tx pqc cosign window-open.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

يبني الأمر الأول `window-open.json`. والوسائط الموضعية هي مفتاح Solana العام، وعدد الكتل، وعدد المعاملات، والقيمة. ويقرأ nonce من السلسلة ويوقّع إثبات المفتاح بـ `window.json`. ويضيف الأمر الثاني توقيع ML-DSA-87 الخاص بك ويرسل المعاملة. يجب أن ترى تجزئة معاملة والرمز 0.

لاستخدام الإثبات من السكربت بدلًا من ذلك، استبدل `--svm-keypair ...` بـ `--svm-key-proof <hex from Step 4>`. وإن لم تعطِ أيًّا من العلامتين رفض الأمر وطبع النص الدقيق الواجب توقيعه. وإن كان المفتاح قد فتح نوافذ من قبل قرأ الأمر nonce بنفسه؛ ومع `--svm-key-proof` تستطيع تثبيته بـ `--svm-key-nonce <N>`.

اقرأ النافذة مرة أخرى:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/svm_window/<your qor address>
qorechaind query pqc svm-window <your qor address> --node $QNODE
```

يجب أن ترى `"found":true` و`"live":true`، مع `max_txs` و`used_txs` و`max_value` و`used_value` و`remaining_blocks` و`remaining_txs` و`remaining_value` و`allowed_programs`، و`key_proven` بقيمة `true`. ويمكنك قراءتها أيضًا بمفتاح Solana: `GET /qorechain/pqc/v1/svm_window_by_key/<WINDOW_PUBKEY>`. والحقول `key_proof_required` و`key_usable` و`key_proof_nonce` (القيمة التالية الواجب توقيعها) موجودة أيضًا.

تسمّي قائمة البرامج برنامج System والمحمِّل لأن هذا هو المزيج الذي اختُبر. وفي هذا الدليل لا يفعل مفتاح النافذة سوى التحويل، أما النشر فيتولاه مفتاح النشر. وإن سمحت يومًا لمفتاح النافذة بأن يدفع نشرًا مباشرة فيجب أن تسمّي القائمة البرنامجين معًا.

### الخطوة 6: موّل مفتاح النشر {#step-fund}

ما دامت النافذة مفتوحة ينفق مفتاح النافذة QOR الخاص بك. أرسل 5 QOR إلى مفتاح النشر:

```bash
qsol balance <WINDOW_PUBKEY>
qsol transfer <DEPLOYER_PUBKEY> 5 --keypair ~/qore-svm/window.json --allow-unfunded-recipient
qsol balance <DEPLOYER_PUBKEY>
```

يُظهر السطر الأول رصيدك الأصلي كما يراه مفتاح النافذة (في "SOL"، اقرأها QOR). ويرسل الثاني 5 QOR؛ وتجعل العلامة `--keypair` مفتاح النافذة هو الموقِّع لهذا الأمر وحده، والعلامة `--allow-unfunded-recipient` لازمة لأن مفتاح النشر لا يحوي شيئًا بعد. ويجب أن يُظهر الثالث `5 SOL` أي 5 QOR. وتكلّف هذه التحويلة حسابك 5.045 QOR في المجموع: الـ 5 QOR مع الرسم الأساسي 0.045 QOR، وتُظهره عدّادات النافذة (`used_txs` يساوي 1 و`used_value` يساوي 5,045,000).

إذا رُفضت بـ `this node relays no Solana transactions` فانظر [الإرسال دون البوابة العامة](#relay).

### الخطوة 7: ابنِ برنامجًا صغيرًا {#step-build}

```bash
cargo init --lib hello
cd hello
```

استبدل `Cargo.toml` بما يلي:

```toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
solana-program = "2.2"
```

واستبدل `src/lib.rs` بما يلي:

```rust
use solana_program::{account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey};

entrypoint!(process_instruction);

fn process_instruction(_program_id: &Pubkey, _accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    msg!("hello from QoreChain, {} data bytes", data.len());
    Ok(())
}
```

```bash
cargo build-sbf
ls -l target/deploy
```

يصرّف هذا البرنامج لـ SBF. يجب أن ترى `hello.so` (نحو 19 KB) و`hello-keypair.json`، وهو المفتاح الذي يصير عنوانه معرّف البرنامج. وتحذيرات المصرّف عن `unexpected cfg` غير مؤذية. ويكتب البرنامج سطر سجل واحدًا ولا يفعل شيئًا غيره.

### الخطوة 8: انشر {#step-deploy}

```bash
qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc
```

يكتب هذا البرنامج في نحو 20 معاملة صغيرة ثم ينشره. تقدّر `solana` الكلفة أولًا وتفحص رصيدك: ففي النسخة ذات 18,896 بايتًا طبعت إنفاقًا قدره 0.133 QOR (إيجار) ورسمًا قدره 1.035 QOR في 22 نوفمبر 2026، أي 23 معاملة بسعر 0.045 QOR. ويجب أن تنتهي بـ `Program Id: <address>`. تحقق منه:

```bash
qsol program show <program id>
```

يجب أن ترى معرّف البرنامج، والمحمِّل (`BPFLoaderUpgradeab1e11111111111111111111111`)، وعنوان ProgramData، و**السلطة** (مفتاح النشر)، وslot النشر، وطول البيانات. وإذا بدأت النشر وتوقف في منتصفه طبعت `solana` عبارة استرداد من 12 كلمة لمفتاح المخزن المؤقت. احتفظ بها إلى أن ينتهي النشر: بها تستأنف المخزن نفسه بتمرير زوج المفاتيح المسترد إلى `program deploy` أو `write-buffer` التالي، وتستطيع إغلاق المخزن لاسترداد إيجاره.

للبرنامج المبني بـ Anchor أضف `--skip-feature-verify` إلى `solana program deploy`، كما في التشغيلات قبل الإصدار.

#### مع Anchor {#anchor}

```bash
anchor init counter
cd counter
anchor build
anchor deploy --provider.cluster https://svm-testnet.qore.host \
  --provider.wallet ~/qore-svm/deployer.json -- --use-rpc
```

يصرّف `anchor build` برنامج القالب وينشره `anchor deploy` إلى معرّف البرنامج في `declare_id!`. وحجم برنامج القالب نحو 130 KB، أي نحو 130 معاملة كتابة بسعر 0.045 QOR، فموّل مفتاح النشر أولًا بما لا يقل عن 10 QOR. وفي التشغيل قبل الإصدار كلّف برنامج من 128 KB نحو 6.8 QOR، أغلبها رسوم الكتابة، ويعود الإيجار عند الإغلاق. و`anchor deploy` ثانية بعد تغيير الشيفرة ترقّي البرنامج. ويتخطى Anchor رفع IDL لعنوان محلي؛ أما رفع IDL إلى شبكة الاختبار فلم يُختبر.

### الخطوة 9: استدعِ البرنامج {#step-call}

لا تستطيع `solana` استدعاء برنامج اعتباطي، فاستخدم سكربت web3.js قصيرًا. في مجلد فارغ:

```bash
npm init -y
npm install @solana/web3.js@1
```

احفظه باسم `call.cjs`:

```js
// node call.cjs <payer keypair.json> <program id> [data as text]
const fs = require("fs");
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");

const RPC = "https://svm-testnet.qore.host";
const [payerPath, programId, text = "hi"] = process.argv.slice(2);
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(payerPath, "utf8"))));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const conn = new Connection(RPC, "confirmed");
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash }).add(
    new TransactionInstruction({ programId: new PublicKey(programId), keys: [], data: Buffer.from(text) }),
  );
  tx.sign(payer);

  const signature = await conn.sendRawTransaction(tx.serialize()); // preflight runs on the gateway
  console.log("signature:", signature);

  // The public endpoint serves no websocket, so poll instead of confirmTransaction.
  for (;;) {
    const { value } = await conn.getSignatureStatuses([signature]);
    if (value[0]) { console.log("status:", value[0].confirmationStatus, "err:", JSON.stringify(value[0].err)); break; }
    if ((await conn.getBlockHeight()) > lastValidBlockHeight) throw new Error("blockhash expired, build and send again");
    await sleep(1500);
  }
  const t = await conn.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  console.log("fee (lamports):", t.meta.fee);
  console.log((t.meta.logMessages || []).join("\n"));
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
```

```bash
node call.cjs ~/qore-svm/deployer.json <program id> "hello"
```

يبني السكربت تعليمة واحدة لبرنامجك، ويوقّعها بمفتاح النشر، ويرسلها، ويستطلع إلى أن تصير للتوقيع حالة، ويطبع سجل البرنامج. دافع الرسوم هو مفتاح النشر، فلا حاجة إلى نافذة. يجب أن ترى توقيعًا، و`status: finalized err: null`، و`fee (lamports): 45000000`، وسجلات كهذه (الشكل من التشغيل قبل الإصدار؛ والرسالة من برنامجك أنت):

```text
Program <program id> invoke [1]
Program log: hello from QoreChain, 5 data bytes
Program <program id> consumed ... compute units
Program <program id> success
```

### الخطوة 10: اقرأ النتيجة {#step-read}

| ما تريده | الأمر أو الاستدعاء |
| -------- | --------------- |
| حالة معاملة | `qsol confirm -v <signature>`، أو `getSignatureStatuses` |
| سجلاتها ورسمها وتغيّرات الأرصدة | `getTransaction` مع `maxSupportedTransactionVersion: 0` (السكربت أعلاه) |
| البرنامج وسلطته | `qsol program show <program id>` |
| كل برامج مفتاح النشر | `qsol program show --programs` |
| حساب بيانات | `qsol account <address>`، أو `getAccountInfo` |
| نافذتك، بالحساب أو بالمفتاح | `GET /qorechain/pqc/v1/svm_window/<address>` و`.../svm_window_by_key/<pubkey>` |

المعاملة التي تفشل داخل كتلة (مثلًا لأنك تخطيت فحص البوابة المسبق بـ `--skip-preflight`) تحتفظ بتوقيعها وتدفع رسمها وتُعكس آثارها. وفي التشغيل قبل الإصدار هبطت تحويلة فوق حد قيمة النافذة أُرسلت بـ `--skip-preflight` في كتلة وفشلت بالنص `Error processing Instruction 0: generic instruction error`، وعُكست التحويلة. ودون `--skip-preflight` تُرفض قبل ذلك، في البوابة، بـ `-32002 ... SVM authorisation window exhausted`.

### الخطوة 11: الترقية والتسليم والتوسيع والإغلاق {#step-admin}

كل هذه تستخدم مفتاح النشر موقِّعًا ولا تحتاج نافذة.

| المهمة | الأمر |
| ---- | ------- |
| الترقية بعد تغيير الشيفرة | `qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc` |
| تكبير منطقة البيانات بمقدار N بايت | `qsol program extend <program id> N` |
| تسليم الترقيات إلى مفتاح آخر | `qsol program set-upgrade-authority <program id> --new-upgrade-authority <new.json>` |
| جعل البرنامج دائمًا | `qsol program set-upgrade-authority <program id> --final` |
| كتابة مخزن مؤقت دون نشر، وعرض المخازن | `qsol program write-buffer x.so --use-rpc`، ثم `qsol program show --buffers` |
| إغلاق مخزن مؤقت، أو إغلاق البرنامج واسترداد الإيجار | `qsol program close <buffer or program id>` (والبرنامج يحتاج أيضًا `--bypass-warning`) |

الترقية بأي مفتاح ليس هو السلطة مرفوضة. وبعد `set-upgrade-authority` تُرفض السلطة القديمة وتستطيع الجديدة الترقية. وبعد `--final` تُرفض الترقية برسالة تقول إن البرنامج لم يعد قابلًا للترقية. والبرنامج المغلق لا يمكن استدعاؤه ثانية، وتقول `program show` إنه أُغلق.

### الخطوة 12: أغلق النافذة {#step-close}

تستطيع إغلاق النافذة حين تنتهي، ويجب أن تغلقها فورًا إن ظننت أن مفتاح Solana انكشف. وكل ما كانت النافذة لا تزال تقبله يُرفض من الكتلة التالية:

```bash
qorechaind tx pqc close-svm-window --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-close.json
qorechaind tx pqc cosign window-close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

اقرأ النافذة مرة أخرى: يجب ألا تكون حيّة بعد الآن، ويجب أن يُظهر `qsol balance <WINDOW_PUBKEY>` القيمة 0 من جديد. ولا يستطيع مفتاح النافذة بعد ذلك نقل QOR الخاص بك. ويبقى مفتاح النشر والبرنامج والأموال التي أنشأتها عبر النافذة ملكك.

ولفتح نافذة جديدة للمفتاح نفسه شغّل الخطوة 4 من جديد: صار nonce أعلى الآن، والإثبات المصنوع للنافذة القديمة يُرفض بـ `expected_nonce`.

## الإرسال دون البوابة العامة {#relay}

رفضت البوابة العامة في `svm-testnet.qore.host` التمرير في 22 نوفمبر 2026 (انظر الصندوق في أعلى الصفحة). وثمة طريقان للإرسال إلى أن تمرّر.

**معاملة واحدة عبر سطر الأوامر.** أي حساب أصلي يحوي QOR وله مفتاح ما بعد كمومي مسجَّل يستطيع أن يحمل معاملة Solana وقّعتها أنت. ابنِ معاملة Solana ووقّعها أولًا، مثلًا بـ web3.js، واطبعها بـ base64 (`tx.serialize().toString("base64")`). وتصلح المعاملة نحو 3.5 دقائق بعد blockhash الذي تستخدمه. ثم:

```bash
qorechaind tx svm solana-tx <base64 transaction> --from mykey \
  --chain-id $QCHAIN --node $QNODE --gas <GAS> --fees <FEES>uqor --generate-only > relay.json
qorechaind tx pqc cosign relay.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

حدّد `--gas` و`--fees` من تشغيل تجريبي: شغّل `tx pqc cosign` أولًا مع `--dry-run` (يطبع تقديرًا للغاز ولا يرسل شيئًا)، ثم استخدم التقدير زائد 30% قيمةً لـ `<GAS>`، ورسومًا لا تقل عن `<GAS>` مضروبًا في 0.1 uqor قيمةً لـ `<FEES>`. يحتاج التحويل البسيط إلى نحو 300,000 إلى 400,000 وحدة غاز، ويحتاج النشر أو المقترح الذي يحمل شيفرة إلى أكثر من ذلك بكثير.

الحساب في `--from` هو المُمرِّر. يوقّع الحاملة ويدفع غازها، ويعوّضه دافع رسوم Solana. ولا يكتسب المُمرِّر أي سلطة على معاملة Solana. ويجب أن يغطي ما تدفعه معاملة Solana رسم الحاملة: 45,000 uqor لتوقيع واحد. وهذا عملي لتحويلة أو استدعاء، لا لنشر من معاملات كتابة كثيرة. ولم يُشغَّل هذا المسار على شبكة الاختبار الحيّة لهذه الصفحة.

**بوابتك الخاصة.** العقدة التي تتبع شبكة الاختبار وتشغّل ملف v3.2.9 الثنائي تخدم Solana JSON-RPC على المنفذ 8899 وتمرّر حين يسمّي قسم `[svm-rpc]` في `app.toml` مُمرِّرًا: `relayer-key` (حساب ممول في سلسلة مفاتيح العقدة، أو عدة حسابات تفصل بينها فواصل) و`relayer-pqc-key` (مفاتيحها ML-DSA-87 تحت مجلد `pqc` في العقدة) و`relayer-keyring-backend`. ومع ترك `relayer-key` فارغًا يُرفض `sendTransaction`، كما في نقطة النهاية العامة اليوم. اترك `relayer-fee` فارغًا: فيسعّر المُمرِّر عندئذ كل حاملة مما تدفعه معاملة Solana، فلا يتحمل خسارة أبدًا. انسخ مجلد `lib/` كله من حزمة الإصدار. ولم يُشغَّل هذا الإعداد لهذه الصفحة؛ وانظر [تشغيل عقدة](/developer-guide/running-a-node) للعقدة نفسها.

## حدود يجب التخطيط لها {#limits}

* **حصة التمرير.** معاملة Solana المرسلة عبر بوابة تُحتسب على دافع رسومها: 600 لكل 30 كتلة افتراضيًا، وهذا أقل من دقيقة بكثير. ونشر كبير من مفتاح واحد قد يتجاوزها (برنامج 1 MB نحو 1,100 كتابة). والكتابات المرفوضة لا تكلّف شيئًا. اكتب المخزن المؤقت أولًا بـ `qsol program write-buffer`، وانتظر دقيقة وأعد التشغيل بالمخزن نفسه إن توقف، ثم انشر من المخزن بـ `--buffer`، أو ادفع كتابات المخزن والنشر من دافعي رسوم مختلفين.
* **الحصة العادلة للبوابة.** تحتفظ البوابة بجزء من طاقتها للعملاء الذين أرسلوا معاملات قليلة وتقسم الباقي بالتساوي بين شبكات العملاء النشطة. وإذا رُفضت برسالة الحصة العادلة (الرمز `-32005`) فانتظر دقيقة أو استخدم بوابة أخرى.
* **يجب أن تهبط المعاملة قبل انتهاء blockhash** (150 slot). وتعيد `solana` الإرسال عنك؛ وعلى السكربت أن يفعل مثلها.
* **المعاملة لا تتجاوز 1,232 بايتًا، وبحد أقصى 64 حسابًا،** كما في Solana. وتُقبل الرسائل القديمة (legacy) والإصدار 0.
* **البرامج والحسابات:** 10 MiB لكل منها؛ و32 KiB للمكدس و256 KiB للكومة لكل إطار.
* **حدود الحضانة** من [مسار SVM (v3.2.8)](/developer-guide/svm-lane-v328#custody) لا تزال سارية: قد يُرفض الإيداع بـ `svm custody cap exceeded` (الرمز 23) حين يبلغ مجمّع SVM سقفه.
* **الأسماء في قائمة النافذة.** يأخذ `--allowed-programs` معرّفات برامج بـ base58، بحد أقصى 16، كل منها مرة واحدة. ويسري النطاق على التعليمات العلوية للمعاملة: فالبرنامج المذكور الذي يستدعي برامج أخرى يحمل توقيعك معه، فاذكر فقط برامج تثق بها كلها.
* **العناوين.** الرسالة الجديدة في v3.2.9 ترفض عنوان bech32 ليس في صيغته القانونية بالأحرف الصغيرة. أرسل الصيغة التي تنتجها `toBech32`.

## استكشاف الأخطاء {#troubleshooting}

النصوص الموسومة "live" شوهدت على شبكة الاختبار الحيّة في 22 نوفمبر 2026. والباقي رسائل السلسلة والبوابة نفسها كما شوهدت في التشغيلات قبل الإصدار.

| ما تراه | معناه | ما تفعله |
| ------------ | ------------- | ---------- |
| `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)` (رمز JSON-RPC `-32603`، live) | ليس للبوابة حساب مُمرِّر | استخدم [بوابتك الخاصة أو التمرير بسطر الأوامر](#relay)، أو انتظر المشغّلين |
| `Error: Account <key> has insufficient funds for spend (X SOL) + fee (Y SOL)` (live، من `solana`) | المفتاح لا يحوي شيئًا. اقرأ SOL على أنها QOR | افتح النافذة وموّل المفتاح، أو افتح النافذة واستخدم مفتاح النافذة موقِّعًا |
| المحاكاة `InsufficientFundsForFee`، والسجل `fee payer ... has no account: insufficient fee` (live) | السبب نفسه، من محاكاة | الإصلاح نفسه |
| `invalid solana transaction: no signatures`، `truncated: need 2 bytes at 1` (الرمز `-32602`، live) | البايتات ليست معاملة Solana موقَّعة | أرسل المعاملة الخام الموقَّعة كاملة، بـ base64 أو base58 |
| HTTP 405 عند ترقية websocket (live) | نقطة النهاية العامة لا تخدم websocket | أضف `--use-rpc` إلى `solana program deploy` و`write-buffer`؛ واستطلع بـ `getSignatureStatuses` في السكربتات |
| `-32002 ... insufficient priority fee ...` | المعاملة تدفع أقل مما تكلّفه حاملتها | اضبط سعر ComputeBudget وحد الوحدات من `data` الخطأ؛ انظر [الرسوم](#fees) |
| `-32002 ... SVM authorisation window exhausted` | نفدت كتل النافذة أو معاملاتها أو قيمتها، أو ستتجاوز المعاملة القيمة | اقرأ النافذة، وافتح جديدة بقيمة أعلى أو معاملات أكثر |
| `no open SVM authorisation window` (codespace `pqc`، الرمز 341) | ليس للمفتاح نافذة حيّة | افتح واحدة (الخطوة 5) |
| رُفض الفتح بالرمز 343 و`expected_nonce=<N>` | وُقّع الإثبات على nonce آخر، مثل إثبات قديم | اقرأ مسار nonce من جديد (الخطوة 4) ووقّع من جديد |
| `the key proof does not verify for <key>, sender <qor address>, chain <id>` (CLI) | التوقيع لا يطابق النص | وقّع `sign_bytes` بالضبط من مسار nonce، بالمفتاح الصحيح والمرسل الصحيح |
| `--svm-keypair holds the key X, not Y` (CLI) | ملف زوج المفاتيح ليس المفتاح الذي سمّيته | استخدم زوج المفاتيح المطابق لمفتاح base58 |
| `the window needs the proof that you hold the Solana key` (CLI) | لم تعطِ `--svm-keypair` ولا `--svm-key-proof` | أعطِ إحداهما؛ وتطبع الرسالة النص الواجب توقيعه |
| `blocks must be between 1 and 17280`، `max_txs must be between 1 and 1000`، `max_value must be positive`، `allowed_programs lists N programs, the maximum is 16` | أحد حدود النافذة خارج النطاق | استخدم قيمًا داخل الجدول تحت [النافذة](#window) |
| `svm_pubkey ... is not a valid ed25519 public key`، أو `... is a native account address, not an ed25519 key` | المفتاح عنوان برنامج أو أحد عناوين QoreChain لديك | استخدم زوج مفاتيح صُنع بـ `solana-keygen` |
| `sender sol:<payer> has sent 600 transactions in the last 30 blocks` | حصة التمرير لدافع رسوم واحد | انتظر دقيقة، واستأنف بالمخزن المؤقت نفسه؛ انظر [الحدود](#limits) |
| `-32005` مع `fair share of the relayer quota` | البوابة تقسم طاقتها | أعد المحاولة بعد دقيقة |
| `-32020 node is starting, no committed state` | ليست للعقدة حالة بعد | أعد المحاولة بعد ثوانٍ |
| `node busy: the carrier could not be measured now, retry` | لم تستطع البوابة تسعير الحاملة في هذه اللحظة | أعد المحاولة |
| `Transaction simulation failed: Blockhash not found` | blockhash أقدم من 150 slot أو مجهول | اجلب blockhash جديدًا ووقّع وأرسل من جديد |
| `Transaction simulation failed: This transaction has already been processed` | رُئيت المعاملة الموقَّعة نفسها من قبل | افحص `getSignatureStatuses`؛ ولا ترسلها ثانية |
| رُفضت معاملة Solana بـ `cannot approve a delegate` أو `cannot hand over the ownership` أو `cannot hand over the close authority` أو `cannot change the mint or freeze authority`، مع `the grant would outlive the window` | النافذة ذات النطاق الافتراضي ترفض منح التوكن الدائمة | وقّع هذا الإجراء بمفتاحك ما بعد الكمومي على المسار الأصلي، أو افتح نافذة تسمّي قائمة برامجها برنامج التوكن (انظر [الحدود المعروفة](#window-limits)) |
| `SVM module is disabled` (الرمز 11) | المسار مغلق. وهذه حالة الشبكة الرئيسية | استخدم شبكة الاختبار |
| `svm custody cap exceeded` (الرمز 23) | مجمّع SVM بلغ سقفه | أعد المحاولة لاحقًا أو بمبلغ أصغر |
| `solana program deploy` لبرنامج مبني بـ Anchor مرفوض من جهة العميل بسبب ميزات البرنامج | تفحص الأداة ميزات ELF | أضف `--skip-feature-verify` |
| ترقية بمفتاح النافذة ترفضها `solana` | السلطة المسجَّلة هي حسابك الأصلي لا المفتاح | انشر بمفتاح نشر منفصل كما في هذا الدليل |
| رُفض فتح النافذة أو إغلاقها تحت authz أو المجموعة أو عقد | النوافذ لا تُفتح ولا تُغلق إلا بتوقيعك أنت | أرسل الرسالة رسالةً علوية من حسابك |

## ما الذي جرى التحقق منه {#tested}

| الفحص | أين ومتى | النتيجة |
| ----- | -------------- | ------ |
| `GET /qorechain/svm/v1/params` و`/cluster_info` | شبكة الاختبار الحيّة، 22 نوفمبر 2026 | `enabled` و`execution_enabled` كلتاهما `true` |
| `getHealth` و`getVersion` و`getGenesisHash` و`getLatestBlockhash` (base58) و`getMinimumBalanceForRentExemption(1024)` | شبكة الاختبار الحيّة، 22 نوفمبر 2026 | `ok`؛ `1.18.0-qorechain`؛ تجزئة genesis كما أعلاه؛ blockhash بـ base58 من 44 حرفًا؛ 8,017,920 lamports |
| `getFeeForMessage` و`simulateTransaction` لتحويلة بتوقيع واحد | شبكة الاختبار الحيّة، 22 نوفمبر 2026 | الرسم 45,000,000 lamports (0.045 QOR)؛ ودافع غير ممول يعطي `InsufficientFundsForFee` |
| مسار nonce لإثبات المفتاح ومسارات النافذة | شبكة الاختبار الحيّة، 22 نوفمبر 2026 | nonce يساوي 0، و`sign_bytes` كما في الخطوة 4؛ و`found` بقيمة `false` لعنوان بلا نافذة |
| سكربت إثبات المفتاح في الخطوة 4 مقابل المثال المنشور | مسار شبكة الاختبار الحيّة، 22 نوفمبر 2026 | توقيع مطابق للجدول |
| بناء برنامج بـ `cargo build-sbf` (4.0.0، platform tools v1.53) | جهاز محلي، 22 نوفمبر 2026 | `hello.so` بحجم 18,896 بايتًا |
| تقدير كلفة `solana program deploy` من مفتاح غير ممول | شبكة الاختبار الحيّة، 22 نوفمبر 2026 | رُفض من جهة العميل بإنفاق 0.133 QOR ورسم 1.035 QOR |
| `sendTransaction` لتحويلة سليمة الصياغة | شبكة الاختبار الحيّة، 22 نوفمبر 2026 | مرفوضة: `this node relays no Solana transactions` |
| ترقية websocket على نقطة النهاية العامة | شبكة الاختبار الحيّة، 22 نوفمبر 2026 | HTTP 405 |
| فتح النافذة، و`solana transfer` من مفتاح النافذة، والنشر، والاستدعاء، والترقية، وضبط السلطة، والتوسيع، والإغلاق، و`anchor deploy` والترقية | شبكة اختبار محلية قبل الإصدار، `solana-cli` 4.0.2، `anchor-cli` 1.2.2، `@solana/web3.js` 1.99 | نجحت |
| الخطوات نفسها على شبكة الاختبار الحيّة | لم تُشغَّل: لم تمرّر البوابة العامة شيئًا في 22 نوفمبر 2026، ولم يُنفق QOR اختبار على هذه الصفحة | لم تُشغَّل |

## الشبكة الرئيسية {#mainnet}

تعمل الشبكة الرئيسية بإصدار لا يحوي شيئًا من هذا: مسار SVM مطفأ هناك، ونقاط SVM العامة فيها للقراءة فقط، والاستدعاءات عبر الأنوية الافتراضية متوقفة، ورفع العقود بالحوكمة فقط. لا تفتح نوافذ ولا تنشر ولا ترسل معاملات Solana إلى الشبكة الرئيسية؛ وخطّط على شبكة الاختبار وحدها.

## انظر أيضًا {#see-also}

* [مسار SVM (v3.2.8)](/developer-guide/svm-lane-v328): حالة المسار والإيجار وحدود الحضانة والمفتاح ما بعد الكمومي لمحفظة SVM.
* [تطوير SVM](/developer-guide/svm-development): نظرة عامة على المسار وخادم JSON-RPC.
* [JSON-RPC المتوافق مع Solana](/api-reference/json-rpc-solana-compatible): قائمة الدوال.
* [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing): تسجيل مفتاح ML-DSA-87 واستخدامه.
* [مرجع نافذة تفويض EVM](/developer-guide/evm-window-reference): الفكرة نفسها لمفاتيح بأسلوب Ethereum.
* [التشغيل البيني عبر الأنوية الافتراضية](/developer-guide/cross-vm-interoperability): الاستدعاءات بين SVM وEVM وQoreChain Native.
* [سجل الإصدارات](/appendix/version-history#v329): ما الذي غيّره v3.2.9.
