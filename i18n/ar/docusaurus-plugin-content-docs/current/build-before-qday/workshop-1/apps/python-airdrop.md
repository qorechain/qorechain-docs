---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: تطبيق Python، Q-Day Airdrop
sidebar_label: Python، Airdrop
sidebar_position: 6
---

# تطبيق Python: Q-Day Airdrop

**Q-Day Airdrop** أداة Python صغيرة ترسل QOR تجريبية إلى قائمة كاملة من العناوين في معاملة **واحدة**. تُوقَّع المعاملة بمفتاح كلاسيكي secp256k1 ومفتاح مقاوم للحوسبة الكمومية ML-DSA-87 (معيار FIPS 204). ثم تثبت الأداة، من سجل السلسلة نفسها، أن التوقيعين تم التحقق منهما. وتعمل على شبكة testnet الخاصة بـ QoreChain (`qorechain-diana`، ومعرّف سلسلة EVM هو 9800).

**كم يستغرق هذا:** نحو 20 دقيقة في المرة الأولى (10 دقائق لتثبيت الأدوات، و5 دقائق للإعداد، و5 دقائق للإرسال والتحقق).

لا تحتاج إلى معرفة Python. تكتب الأوامر أدناه واحدًا واحدًا فقط، وتقارن النتيجة بما في "ما الذي يجب أن تراه".

## ما الذي يعرضه {#what-it-shows}

- **توقيع هجين ML-DSA-87 + secp256k1** من Python.
- **معاملة واحدة موقّعة هجينيًا ومتحقَّق منها على السلسلة**، تدفع لعدة مستلمين دفعة واحدة برسالة multi-send واحدة.
- **تقرير تحقق** مبني على سجل المعاملة في السلسلة نفسها، لا على كلام الأداة.

لماذا هذا مهم: توقيع واحد يحمي إنزال عملات (airdrop) كاملًا، ويبقى محميًا ضد حاسوب كمومي مستقبلي لأن نصف ML-DSA-87 مقاوم للحوسبة الكمومية. راجع [المعاملات الآمنة كموميًا](/sdk/guides/quantum-safe).

:::warning testnet فقط
استخدم حسابًا تجريبيًا مؤقتًا على testnet فقط. عملة QOR على testnet بلا قيمة. لا تستخدم محفظتك الحقيقية ولا عبارة الاسترجاع الحقيقية ولا أموالًا حقيقية في هذا الدليل أبدًا.
:::

## كلمات ستراها {#words}

| الكلمة | المعنى |
| --- | --- |
| Testnet | نسخة تجريبية من QoreChain. العملات فيها مجانية وبلا قيمة. |
| QOR وuqor | اسمان للعملة نفسها. 1 QOR = 1,000,000 uqor. تطلب الأداة المبلغ بـ QOR. وتُعرض الرسوم بـ uqor. |
| Memo | نص قصير يُرفق بالمعاملة، مثل ملاحظة على تحويل مصرفي. |
| العنوان (Address) | رقم حسابك العام. يبدأ في QoreChain بـ `qor1`. آمن للمشاركة. |
| ملف المفتاح (Key file) | ملف فيه عبارة الاسترجاع السرية. لا تشاركه أبدًا. |
| Faucet | موقع ويب يمنح QOR تجريبية مجانية. |
| المعرّف (Hash) | الهوية الفريدة للمعاملة. تستخدمه للبحث عن المعاملة. |

## قبل أن تبدأ {#before}

تحتاج إلى **Git** (لتنزيل الكود) و**Python 3.10 أو أحدث** مع `venv` (مجلد خاص لمكتبات الأداة). بعد كل تثبيت **أغلق الطرفية وافتح واحدة جديدة**، ثم نفّذ أمر التحقق.

| الأداة | macOS | Windows | Linux (Debian أو Ubuntu) | التحقق |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (يأتي Homebrew من https://brew.sh) | https://git-scm.com/download/win | `sudo apt install git` | `git --version` |
| Python 3.10+ | `brew install python` | https://www.python.org/downloads/ (فعّل الخيار "Add python.exe to PATH" في المثبّت) | `sudo apt install python3 python3-venv python3-pip` | `python3 --version` (وعلى Windows: `python --version`) |

على Windows استخدم PowerShell أو Git Bash. حيثما تكتب هذه الصفحة `python3` يستخدم Windows عادةً `python`. وكل شيء آخر متطابق، عدا السطر الذي يشغّل البيئة الافتراضية (الخطوة 3).

## احصل على محفظة testnet وQOR مجانية {#wallet}

تنشئ الأداة مفتاحها المؤقت بنفسها (الخطوة 4 أدناه)، فلا تحتاج إلى تطبيق محفظة لهذا الدليل. وإذا أردت أيضًا أن ترى حسابك في QoreX:

1. **تطبيق QoreX:** افتح الإعدادات، ثم فعّل **Use testnet (developers)**.
2. **امتداد QoreX للمتصفح:** افتح قفله، ثم اضغط على رقم الإصدار أسفل النافذة 7 مرات، ثم اختر **Switch to testnet (diana)**.

تأتي الـ QOR المجانية من الـ faucet على https://dashboard.qorechain.io/faucet. تسجّل الدخول، وتلصق العنوان، وتطلب. يمنح **100 QOR كل 24 ساعة لكل حساب**.

أول معاملة لحساب جديد تسجّل مفتاحه المقاوم للحوسبة الكمومية ML-DSA-87 على السلسلة. وهذه خطوة لمرة واحدة برسوم نحو 0.09 QOR. تنفذها الأداة عنك بالأمر `register`.

## خطوة بخطوة {#run}

### 1. نزّل الكود {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

**ماذا يفعل**

- `git clone <address>`: ينسخ المشروع من GitHub إلى مجلد جديد اسمه `build-before-qday`.
- `cd <folder>`: ينقل طرفيتك إلى مجلد تطبيق Python. يجب أن يُنفَّذ كل أمر لاحق من هذا المجلد.

**ما الذي يجب أن تراه:** أسطرًا مثل `Cloning into 'build-before-qday'...` ثم مؤشر الأوامر داخل المجلد الجديد.

### 2. أنشئ بيئة Python خاصة {#venv}

```bash
python3 -m venv .venv
```

**ماذا يفعل:** ينشئ مجلدًا اسمه `.venv` يحتفظ بمكتبات هذه الأداة، حتى لا تختلط بأي شيء آخر على حاسوبك.

| الجزء | المعنى |
| --- | --- |
| `python3` | برنامج Python. |
| `-m venv` | شغّل أداة "البيئة الافتراضية" المدمجة في Python. |
| `.venv` | اسم المجلد المراد إنشاؤه. |

**ما الذي يجب أن تراه:** لا شيء يُطبع، ومجلدًا جديدًا اسمه `.venv`.

### 3. شغّلها وثبّت المكتبات {#deps}

```bash
source .venv/bin/activate
```

على Windows PowerShell استخدم `.venv\Scripts\activate` بدلًا منه (إذا حجبه PowerShell فنفّذ `Set-ExecutionPolicy -Scope Process RemoteSigned` وأعد المحاولة). وفي موجّه أوامر Windows (Command Prompt) استخدم `.venv\Scripts\activate.bat`.

**ماذا يفعل:** يحوّل طرفيتك لاستخدام البيئة الخاصة.

**ما الذي يجب أن تراه:** `(.venv)` في بداية مؤشر الأوامر. شغّلها من جديد بالأمر نفسه في كل طرفية جديدة.

```bash
pip install -r requirements.txt
```

| الجزء | المعنى |
| --- | --- |
| `pip` | مثبّت مكتبات Python. |
| `install` | نزّل المكتبات وثبّتها. |
| `-r requirements.txt` | اقرأ قائمة المكتبات من هذا الملف. يذكر مكتبة واحدة هي `qorechain-sdk==0.13.0` (الـ QoreChain SDK، الإصدار 0.13.0 بالضبط)، مع ما تحتاجه. |

**ما الذي يجب أن تراه:** أسطر تنزيل تنتهي بـ `Successfully installed ... qorechain-sdk-0.13.0`. وإشعار بتوفر إصدار أحدث من pip لا ضرر منه.

**كم يستغرق:** من نحو 15 ثانية إلى دقيقة.

الآن تحقق من أن الأداة تبدأ:

```bash
python airdrop.py --help
```

**ما الذي يجب أن تراه:** الأوامر `new` و`status` و`register` و`drop` و`verify`.

### 4. أنشئ حساب testnet المؤقت {#key}

```bash
python airdrop.py new
```

**ماذا يفعل:** ينشئ حسابًا جديدًا. يكتب عبارة استرجاع سرية في ملف المفتاح `~/.config/qday/python.env` (في مجلد المنزل الخاص بك، ومقروء لك وحدك) ولا يطبع إلا العنوان العام.

| الجزء | المعنى |
| --- | --- |
| `new` | أنشئ ملف مفتاح جديدًا واطبع عنوانه. |
| `new --force` | استبدل ملف مفتاح موجودًا. يضيع المفتاح القديم. |

**ما الذي يجب أن تراه:** `New testnet wallet` و`address` يبدأ بـ `qor1...` ومسار ملف المفتاح مع `(mode 600, mnemonic not shown)` وتلميحًا للخطوة التالية.

**انسخ العنوان `qor1...`.** إذا فقدته فإن `python airdrop.py status` يطبعه من جديد. لا تشارك ملف المفتاح أبدًا، ولا ترفعه إلى Git، ولا تعد استخدامه على الشبكة الرئيسية.

ولإبقاء المفتاح في مكان آخر ضع `--key-file` **قبل** اسم الأمر:

```bash
python airdrop.py --key-file ~/my.env status
```

`--key-file <path>` تعني "استخدم ملف المفتاح هذا بدلًا من الافتراضي". الترتيب مهم: `--key-file` يأتي قبل `status` و`drop` وبقية الأوامر. ويمكنك بدلًا من ذلك ضبط متغير البيئة `QORE_KEY_FILE`.

### 5. احصل على QOR تجريبية من الـ faucet {#faucet}

1. افتح https://dashboard.qorechain.io/faucet وسجّل الدخول.
2. الصق عنوانك `qor1...` واضغط زر الطلب.
3. انتظر بضع ثوانٍ، ثم نفّذ:

```bash
python airdrop.py status
```

**ماذا يفعل:** يسأل testnet عن رصيدك وهل مفتاحك المقاوم للحوسبة الكمومية مسجّل.

**ما الذي يجب أن تراه:** رصيدك (نحو 100 QOR) وتحذيرًا بأن مفتاح ML-DSA-87 غير مسجّل بعد. وإذا قالت الأداة إن العنوان "is not on chain yet" فلم تصل دفعة الـ faucet بعد: انتظر 10 ثوانٍ وأعد المحاولة.

### 6. سجّل مفتاحك المقاوم للحوسبة الكمومية {#register}

```bash
python airdrop.py register
```

**ماذا يفعل:** يسجّل مفتاح ML-DSA-87 على السلسلة مرة واحدة. ولا ضرر من تشغيله مرة أخرى. توقَّع هذه المعاملة الأولى توقيعًا كلاسيكيًا، لأن المفتاح لا يستطيع أن يشارك في توقيع تسجيل نفسه. وتكلّف نحو 0.09 QOR. أما كل معاملة بعدها فتُوقَّع هجينيًا.

**ما الذي يجب أن تراه:** معرّف معاملة وسطرًا `registered` (أو `already registered` إذا نفّذته مرتين).

**كم يستغرق:** بضع ثوانٍ (كتلة واحدة).

### 7. اكتب قائمة المستلمين {#list}

أنشئ حسابَي مستلمَين مؤقتَين. لكل واحد ملف مفتاح خاص به:

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

**ماذا يفعل:** هو الأمر `new` نفسه كما سبق، لكن `--key-file` يوجّه كل مفتاح إلى ملفه الخاص حتى لا يُكتب فوق شيء. (ويمكنك أيضًا استخدام عناوين أصدقاء يستخدمون testnet.)

**ما الذي يجب أن تراه:** عنوانين مختلفين `qor1...`. انسخهما معًا.

الآن أنشئ ملفًا نصيًا عاديًا اسمه `addresses.txt` في هذا المجلد، بعنوان واحد في كل سطر. يصلح أي محرر نصوص (Notepad على Windows، وTextEdit بوضع النص العادي على macOS، و`nano addresses.txt` على Linux):

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

استبدل السطرين النموذجيين بعناوينك الحقيقية. تُتخطّى مع تحذير الأسطر الفارغة وتعليقات `#` والتكرارات والمرسِل نفسه وأي شيء ليس عنوان `qor1...` صالحًا. الحد الأقصى 100 مستلم في المعاملة الواحدة. وفي المجلد أيضًا ملف `addresses.example.txt`، وهو نموذج بأسطر بديلة.

### 8. أرسل الـ airdrop {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

| الجزء | المعنى |
| --- | --- |
| `drop` | أرسل معاملة واحدة تدفع لكل من في القائمة. |
| `addresses.txt` | الملف الذي فيه المستلمون. |
| `0.1` | المبلغ بـ QOR **لكل مستلم** (0.1 QOR = 100,000 uqor). مستلمان يحصلان على 0.2 QOR في المجموع. |
| `--memo "..."` | نص قصير يُرفق بالمعاملة. اختياري. |
| `--yes` (أو `-y`) | اختياري: تخطَّ سؤال "هل أنت متأكد". |

ترتيب الخيارات: المبلغ والملف يأتيان أولًا، ثم `--memo` و`--yes` بعدهما. أما `--key-file` فمختلف: يأتي قبل `drop`.

**ماذا يفعل:** يعرض ملخصًا (المستلمون، والمبلغ لكل واحد، والإجمالي) ويطلب منك التأكيد. اكتب `y` واضغط Enter. ثم يسأل السلسلة كم غازًا يلزم (تشغيل تجريبي)، ويضيف 30 بالمئة كهامش أمان، ويوقّع بالمفتاحين، ويرسل معاملة واحدة، ويطبع تقرير التحقق.

**ما الذي يجب أن تراه:** معرّف المعاملة وارتفاعها، ثم تقريرًا فيه: الرمز 0، وحالة `pqc_hybrid_verify` للموقّع هي `verified`، وتوقيع ML-DSA-87 بحجم 4,627 بايت، وعدد مستلمين يطابق قائمتك. انسخ المعرّف.

**كم يستغرق:** نحو 10 ثوانٍ.

### 9. تحقق من أي معاملة {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

**ماذا يفعل:** يقرأ المعاملة من السلسلة ويطبع تقرير التحقق وحده. ويعمل مع أي معرّف معاملة، لا معاملاتك وحدها.

**ما الذي يجب أن تراه:** التقرير نفسه الذي في نهاية الخطوة 8.

## تحقق من المعاملة بنفسك {#check}

لا يلزمك أن تثق بالأداة. اسأل السلسلة مباشرة.

**الطريقة 1، في المتصفح.** افتح `https://explore.qore.network/tx/<HASH>` (ضع معرّفك مكان `<HASH>`)، ثم حوّل المستكشف إلى **Testnet**. يجب أن ترى معاملة ناجحة مع دفع لكل مستلم.

**الطريقة 2، أمر واحد:**

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| الجزء | المعنى |
| --- | --- |
| `curl` | أداة تنزّل عنوان ويب. مدمجة في macOS وWindows 10+ ومعظم أنظمة Linux. |
| `-s` | صامت: أخفِ شريط التقدّم. |
| العنوان | واجهة REST العامة لـ testnet. تعيد سجل المعاملة الكامل بصيغة JSON. |

**ما الذي يجب أن تراه** في الناتج الطويل (أضف `| jq .` إذا ثبّتّ jq، راجع https://jqlang.github.io/jq/download/):

- `"code": 0` تعني أن المعاملة نجحت.
- امتداد `PQCHybridSignature` يحمل `pqc_signature` بحجم **4,627 بايت** (توقيع ML-DSA-87)، بجانب التوقيع الكلاسيكي البالغ 64 بايت.
- حدث `pqc_hybrid_verify` والسمة `status` فيه تساوي `verified` لعنوانك.

## كيف يعمل الإثبات {#proof}

يقرأ `verify` الطلب `GET /cosmos/tx/v1beta1/txs/{hash}` من نقطة REST العامة لـ testnet ويتحقق من:

- وجود حدث من النوع `pqc_hybrid_verify` للموقّع مع `status=verified`؛
- حمل الامتداد `/qorechain.pqc.v1.PQCHybridSignature` توقيع ML-DSA-87 بحجم 4,627 بايت؛
- نجاح المعاملة (الرمز 0)، وعدد المستلمين الذين دفعت لهم.

## استكشاف الأخطاء {#troubleshooting}

| ما الذي تراه | السبب | ما العمل |
| --- | --- | --- |
| `python3: command not found` أو إصدار أقل من 3.10 | Python مفقود أو قديم. | ثبّت Python 3.10 أو أحدث، وافتح طرفية جديدة. على Windows استخدم `python`. |
| `No module named venv` أو `ensurepip is not available` | جزء venv من Python غير مثبّت (Debian وUbuntu). | `sudo apt install python3-venv`، ثم كرّر الخطوة 2. |
| `ModuleNotFoundError: No module named 'qorsdk'` | البيئة غير مفعّلة، أو تخطيت التثبيت. | نفّذ `source .venv/bin/activate`، ثم `pip install -r requirements.txt`. |
| `unrecognized arguments: --key-file` | وُضع `--key-file` بعد الأمر. | ضعه قبله: `python airdrop.py --key-file <path> status`. |
| `no key file at ... Run: python airdrop.py new` | تخطيت الخطوة 4، أو يُستخدم `--key-file` مختلف. | نفّذ `python airdrop.py new`. |
| `... already exists (use --force to replace it)` | يوجد ملف مفتاح هناك بالفعل. | احتفظ به، أو نفّذ `python airdrop.py new --force` (يضيع المفتاح القديم). |
| `... is readable by others (mode ...)` | صلاحيات ملف المفتاح مفتوحة أكثر من اللازم. | نفّذ `chmod 600 <path>`. |
| `... is not on chain yet (fund it first)` | لم تصل QOR من الـ faucet. | انتظر 10 ثوانٍ، أو اطلب من الـ faucet. |
| `account has no PQC key and classical fallback is disabled` | المفتاح المقاوم للحوسبة الكمومية لم يُسجَّل بعد. | نفّذ `python airdrop.py register` أولًا. |
| `the ML-DSA-87 key is not registered yet` | السبب نفسه، اكتشفته الأداة قبل الإرسال. | نفّذ `python airdrop.py register`. |
| `balance too low` | المبلغ الإجمالي مع الرسوم أكبر مما تملك. | أرسل مبلغًا أصغر، أو انتظر طلب الـ faucet التالي. |
| يقول الـ faucet إنك بلغت حد الطلبات | طلب واحد كل 24 ساعة لكل حساب. | انتظر، أو استخدم حسابًا تجريبيًا آخر. |
| `skip line N: not a valid qor1 address` | سطر في `addresses.txt` ليس عنوانًا صحيحًا. | أصلح ذلك السطر أو احذفه. تبقى الأسطر الأخرى صالحة. |
| `no valid recipients` | تُخطّيت كل الأسطر. | تحقق أن `addresses.txt` فيه عناوين `qor1...` حقيقية. |
| `bad amount` | المبلغ ليس رقمًا عاديًا. | استخدم QOR كرقم، مثل `0.1`. |
| `refused by the node: code ...` | رفضت السلسلة المعاملة. | اقرأ الرسالة. انتظر دقيقة وأعد المحاولة إذا كانت testnet مشغولة أو قيد الترقية. |
| `transaction not found on the testnet` | المعرّف خاطئ، أو الكتلة لم تُثبَّت بعد. | تحقق من المعرّف وأعد المحاولة بعد بضع ثوانٍ. |
| `the testnet may be pausing for an upgrade` | تحدّ النقاط العامة من الطلبات لكل عنوان IP، أو testnet قيد الترقية. | انتظر دقيقة ونفّذه مرة أخرى. |
| `EVM authorisation window exhausted` | تخص تطبيقات EVM، لا هذا التطبيق. | في تطبيق EVM افتح نافذة جديدة بالأمر `pnpm window open`. |
| `HHE10402` بعد فتح النافذة | تخص تطبيقات Hardhat فقط: لم تكن النافذة نشطة بعد. | شغّل النشر مرة أخرى. |
| أخطاء `CORS` في المتصفح | تحدث فقط عندما تستدعي صفحة ويب السلسلة مباشرة. وهذه الأداة لا تفعل ذلك. | في تطبيق متصفح، استخدم وكيل `/lcd` الموجود في القالب. |
| `pnpm: command not found` | pnpm غير مثبّت. ولا حاجة إليه هنا. | فقط لدليل Hardhat: نفّذ `npm install -g pnpm`. |

## كود SDK المهم {#code}

```python
from qorsdk import (derive_native_account, derive_pqc_canonical, msg, build_hybrid_tx,
                    auto_fee, hybrid_sign_and_broadcast, wait_for_tx,
                    resolve_sign_bytes_version)

account = derive_native_account(mnemonic)                   # classical secp256k1 key
pqc = derive_pqc_canonical(account.address, mnemonic)       # ML-DSA-87 key, same mnemonic

# ONE MsgMultiSend: one input (the sender), one output per recipient.
drop = msg.bank.multi_send(
    inputs=[Input(address=sender, coins=[Coin(denom="uqor", amount=str(each * len(to)))])],
    outputs=[Output(address=a, coins=[Coin(denom="uqor", amount=str(each))]) for a in to])

build = lambda fee, v: build_hybrid_tx(account=account, pqc_keypair=pqc, messages=[drop], fee=fee,
    memo=memo, chain_id="qorechain-diana", account_number=num, sequence=seq, sign_bytes_version=v)

v = resolve_sign_bytes_version("qorechain-diana", rest_url=REST)                 # "v2" on the testnet
fee = auto_fee(REST, build({"amount": [], "gas": "0"}, v), gas_multiplier=1.3)  # simulate
res = hybrid_sign_and_broadcast(lambda v: build(fee, v), chain_id="qorechain-diana", rest_url=REST)
included = wait_for_tx(rest, res["tx_response"]["txhash"])
```

يُسجَّل المفتاح مرة واحدة بـ `ensure_pqc_registered(...)`، التي لا تفعل شيئًا إذا كان المفتاح نفسه موجودًا على السلسلة. الغاز لا يكون ثابتًا أبدًا: تُحاكى المعاملة الحقيقية الموقّعة هجينيًا أولًا، ويكون الحد الأقصى هو الغاز المحاكى مضروبًا في 1.3، بسعر 0.15 uqor لكل وحدة غاز.

الحساب من نوع العملة 118 (`m/44'/118'/0'/0/0`). ويُشتق مفتاح ML-DSA-87 من عبارة الاسترجاع نفسها ويُربط بالعنوان عبر `derive_pqc_canonical`. وإذا بنيت تطبيقك الخاص على دوال المساعدة المعتمدة على البذرة (seed) بدلًا من ذلك، فإن SDK 0.13.0 يحتاج إلى رمز استرداد أو سر PQC مستقل من 32 بايت (في Python: `unified_account_from_seed(seed32, recovery_code=...)`)؛ راجع [تثبيت SDK](/sdk/install#whats-new-0130). لا تطبع رمز الاسترداد أبدًا.

## الحزم المستخدمة {#packages}

| العنصر | الإصدار |
| --- | --- |
| `qorechain-sdk` (على PyPI، ويُستورد باسم `qorsdk`) | 0.13.0 (مثبّت في `requirements.txt` بصيغة `qorechain-sdk==0.13.0`) |
| Python | 3.10 أو أحدث |

تستورد الأداة أيضًا أنواع protobuf ‏`Input` و`Output` (من `cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`) و`Coin` (من `cosmpy.protos.cosmos.base.v1beta1.coin_pb2`)؛ وهي تأتي مع SDK. راجع [تثبيت SDK](/sdk/install) لجدول الإصدارات لكل اللغات.

## أين تبحث عن المعلومات {#access}

| ماذا | أين |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| المستكشف | `https://explore.qore.network` (حوّله إلى Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| الكود | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
