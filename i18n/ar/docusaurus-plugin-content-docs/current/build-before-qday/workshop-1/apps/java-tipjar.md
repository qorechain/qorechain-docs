---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: تطبيق Java، Q-Day Tip Jar
sidebar_label: Java، Tip Jar
sidebar_position: 5
---

# تطبيق Java: Q-Day Tip Jar

**Q-Day Tip Jar** برنامج Java صغير لشبكة testnet الخاصة بـ QoreChain (`qorechain-diana`، ومعرّف سلسلة EVM هو 9800). يرسل البقشيش (tips) بـ**توقيع هجين**: توقيع كلاسيكي secp256k1 مع توقيع مقاوم للحوسبة الكمومية ML-DSA-87 (معيار FIPS 204). ويستطيع أيضًا مراقبة عنوان "الحصّالة" (jar) مثل الواجهة الخلفية لمتجر، ويفرّق بين البقشيش الآمن كموميًا والبقشيش الكلاسيكي.

**كم يستغرق هذا:** نحو 20 دقيقة في المرة الأولى (10 دقائق لتثبيت الأدوات، و5 دقائق للإعداد، و5 دقائق للإرسال والتحقق).

لا تحتاج إلى معرفة Java. تكتب الأوامر أدناه واحدًا واحدًا فقط، وتقارن النتيجة بما في "ما الذي يجب أن تراه".

## ما الذي يعرضه {#what-it-shows}

- **توقيع هجين ML-DSA-87 + secp256k1** من Java باستدعاء واحد في SDK.
- **معاملة موقّعة هجينيًا ومتحقَّق منها على السلسلة**: تسجّل السلسلة حدث `pqc_hybrid_verify` مع `status=verified`، وتحمل المعاملة توقيع ML-DSA-87 بحجم 4,627 بايت.
- **واجهة خلفية تفرّق بين البقشيش الآمن كموميًا والكلاسيكي**: يضع الأمر `watch` على كل تحويل وارد الوسم `QUANTUM-SAFE` أو `classical only`.

لماذا هذا مهم: يُتوقع أن يكون كسر التوقيع الكلاسيكي وحده ممكنًا بحاسوب كمومي مستقبلي. أما الخدمة التي تفحص سجل التحقق الصادر عن السلسلة نفسها فتستطيع أن تقرر مقدار ثقتها بكل دفعة. راجع [المعاملات الآمنة كموميًا](/sdk/guides/quantum-safe).

:::warning testnet فقط
استخدم حسابًا تجريبيًا مؤقتًا على testnet فقط. عملة QOR على testnet بلا قيمة. لا تستخدم محفظتك الحقيقية ولا عبارة الاسترجاع الحقيقية ولا أموالًا حقيقية في هذا الدليل أبدًا.
:::

## كلمات ستراها {#words}

| الكلمة | المعنى |
| --- | --- |
| Testnet | نسخة تجريبية من QoreChain. العملات فيها مجانية وبلا قيمة. |
| QOR وuqor | اسمان للعملة نفسها. 1 QOR = 1,000,000 uqor. يطلب التطبيق المبلغ بـ QOR. وتُعرض الرسوم بـ uqor. |
| Memo | نص قصير يُرفق بالمعاملة، مثل ملاحظة على تحويل مصرفي. |
| العنوان (Address) | رقم حسابك العام. يبدأ في QoreChain بـ `qor1`. آمن للمشاركة. |
| ملف المفتاح (Key file) | ملف فيه عبارة الاسترجاع السرية. لا تشاركه أبدًا. |
| Faucet | موقع ويب يمنح QOR تجريبية مجانية. |
| المعرّف (Hash) | الهوية الفريدة للمعاملة. تستخدمه للبحث عن المعاملة. |

## قبل أن تبدأ {#before}

تحتاج إلى ثلاث أدوات: **Git** (لتنزيل الكود)، و**Java 21 أو أحدث** (لتشغيل التطبيق)، و**Maven** (لبناء التطبيق). بعد كل تثبيت **أغلق الطرفية وافتح واحدة جديدة**، ثم نفّذ أمر التحقق.

| الأداة | macOS | Windows | Linux (Debian أو Ubuntu) | التحقق |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (يأتي Homebrew من https://brew.sh) | https://git-scm.com/download/win (يمنحك هذا أيضًا "Git Bash") | `sudo apt install git` | `git --version` |
| Java 21+ | `brew install openjdk@21` | https://adoptium.net (اختر Temurin 21، ومثبّت .msi) | `sudo apt install openjdk-21-jdk` | يجب أن يعرض `java -version` الرقم 21 أو أعلى |
| Maven | `brew install maven` | نزّل ملف zip من https://maven.apache.org/download.cgi واتبع https://maven.apache.org/install.html | `sudo apt install maven` | `mvn -version` |

على Windows استخدم **Git Bash** (يُثبَّت مع Git) كطرفية في هذا الدليل، لأن المشغّل `tipjar` سكربت shell. على macOS استخدم Terminal. وعلى Linux استخدم أي طرفية. إذا كنت تفضّل PowerShell العادي فراجع الملاحظة في الخطوة 3.

**على macOS مع Homebrew:** قد يطلب منك `brew install openjdk@21` أن تربطه. إذا بقي `java -version` يعرض إصدارًا قديمًا، فنفّذ ما يطبعه Homebrew تحت العبارة "For the system Java wrappers to find this JDK"، ثم افتح طرفية جديدة.

## احصل على محفظة testnet وQOR مجانية {#wallet}

ينشئ التطبيق مفتاحه المؤقت بنفسه (الخطوة 4 أدناه)، فلا تحتاج بالضرورة إلى تطبيق محفظة لهذا الدليل. لكنك تحتاج إلى مكان تحصل منه على QOR تجريبية. وإذا أردت أيضًا أن ترى حسابك في QoreX:

1. **تطبيق QoreX:** افتح الإعدادات، ثم فعّل **Use testnet (developers)**.
2. **امتداد QoreX للمتصفح:** افتح قفله، ثم اضغط على رقم الإصدار أسفل النافذة 7 مرات، ثم اختر **Switch to testnet (diana)**.

تأتي الـ QOR المجانية من الـ faucet على https://dashboard.qorechain.io/faucet. تسجّل الدخول، وتلصق العنوان، وتطلب. يمنح **100 QOR كل 24 ساعة لكل حساب**.

أول معاملة لحساب جديد تسجّل مفتاحه المقاوم للحوسبة الكمومية ML-DSA-87 على السلسلة. وهذه خطوة لمرة واحدة برسوم نحو 0.09 QOR. ينفذها التطبيق عنك بالأمر `register`.

## خطوة بخطوة {#run}

### 1. نزّل الكود {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

**ماذا يفعل**

- `git clone <address>`: ينسخ المشروع من GitHub إلى مجلد جديد اسمه `build-before-qday` على حاسوبك.
- `cd <folder>`: ينقل طرفيتك إلى مجلد تطبيق Java. يجب أن يُنفَّذ كل أمر لاحق من هذا المجلد.

**ما الذي يجب أن تراه:** أسطرًا مثل `Cloning into 'build-before-qday'...` ثم مؤشر الأوامر داخل المجلد الجديد.

### 2. ابنِ التطبيق {#build}

```bash
mvn -q package
```

**ماذا يفعل:** ينزّل Maven الـ QoreChain SDK من Maven Central ويجمّع التطبيق في ملف واحد قابل للتشغيل هو `target/tipjar.jar`.

| الجزء | المعنى |
| --- | --- |
| `mvn` | أداة البناء Maven. |
| `package` | ترجم الكود وجمّعه في ملف `.jar`. |
| `-q` | الوضع الصامت: اطبع المشكلات فقط. |

**ما الذي يجب أن تراه:** لا شيء لبضع ثوانٍ (نحو 10 ثوانٍ في المرة الأولى، وأطول قليلًا مع اتصال بطيء)، ثم يعود مؤشر الأوامر. تحقق من وجود الملف:

```bash
ls target/tipjar.jar
```

**ما الذي يجب أن تراه:** `target/tipjar.jar`.

### 3. اجعل المشغّل قابلًا للتشغيل وجرّبه {#launcher}

```bash
chmod +x tipjar
./tipjar
```

**ماذا يفعل**

| الجزء | المعنى |
| --- | --- |
| `chmod +x tipjar` | يسمح بتشغيل الملف `tipjar` كبرنامج. النسخة المنزَّلة حديثًا لا تملك هذه الصلاحية. |
| `./tipjar` | يشغّل المشغّل الموجود في هذا المجلد. يبدأ `java -jar target/tipjar.jar`. وبدون أي أمر يطبع المساعدة. |

**ما الذي يجب أن تراه:** قائمة أوامر: `new` و`status` و`register` و`tip` و`watch`.

:::note PowerShell العادي على Windows
تخطَّ `chmod`. واستبدل `./tipjar` بـ `java -jar target/tipjar.jar` في كل الأوامر أدناه.
:::

### 4. أنشئ حساب testnet المؤقت {#key}

```bash
./tipjar new
```

**ماذا يفعل:** ينشئ حسابًا جديدًا. يكتب عبارة استرجاع سرية في ملف المفتاح `~/.config/qday/java.env` (في مجلد المنزل الخاص بك، ومقروء لك وحدك) ولا يطبع إلا العنوان العام.

| الجزء | المعنى |
| --- | --- |
| `new` | أنشئ ملف مفتاح جديدًا واطبع عنوانه. |
| `new --force` | استبدل ملف مفتاح موجودًا. يضيع المفتاح القديم. |

**ما الذي يجب أن تراه:** `new jar key` ومسار ملف المفتاح و`address` يبدأ بـ `qor1...`. لا تُطبع عبارة الاسترجاع أبدًا.

**انسخ العنوان `qor1...`.** إذا فقدته فإن `./tipjar status` يطبعه من جديد. لا تشارك ملف المفتاح أبدًا، ولا ترفعه إلى Git، ولا تعد استخدامه على الشبكة الرئيسية. ولإبقاء المفتاح في مكان آخر اضبط `TIPJAR_KEY` أولًا: `TIPJAR_KEY=/path/to/file ./tipjar status` (وفي PowerShell: `$env:TIPJAR_KEY="C:\path\file"`).

### 5. احصل على QOR تجريبية من الـ faucet {#faucet}

1. افتح https://dashboard.qorechain.io/faucet وسجّل الدخول.
2. الصق عنوانك `qor1...` واضغط زر الطلب.
3. انتظر بضع ثوانٍ، ثم نفّذ:

```bash
./tipjar status
```

**ماذا يفعل:** يسأل testnet عن رصيدك وهل مفتاحك المقاوم للحوسبة الكمومية مسجّل.

**ما الذي يجب أن تراه:** `balance   100 QOR` (أو مبلغ الـ faucet) وسطرًا يقول إن مفتاح ML-DSA-87 غير مسجّل بعد. إذا كان الرصيد 0 فانتظر 10 ثوانٍ ونفّذه مرة أخرى.

### 6. سجّل مفتاحك المقاوم للحوسبة الكمومية {#register}

```bash
./tipjar register
```

**ماذا يفعل:** يسجّل مفتاح ML-DSA-87 على السلسلة مرة واحدة. ولا ضرر من تشغيله مرة أخرى. توقَّع هذه المعاملة الأولى بالمفتاح الكلاسيكي فقط، لأنه لا يوجد على السلسلة بعد مفتاح مقاوم للحوسبة الكمومية يمكن التوقيع به. وتكلّف نحو 0.09 QOR. أما كل معاملة بعدها فتُوقَّع هجينيًا.

**ما الذي يجب أن تراه:** معرّف معاملة ورسالة بأن المفتاح سُجّل. نفّذ `./tipjar status` مرة أخرى ويجب أن يعرض الآن المفتاح مسجّلًا.

**كم يستغرق:** بضع ثوانٍ (كتلة واحدة).

### 7. أنشئ عنوانًا ثانيًا لاستقبال البقشيش {#jar}

يحتاج البقشيش إلى من يستقبله. أنشئ حسابًا مؤقتًا ثانيًا، هو "الحصّالة" (jar)، بملف مفتاح خاص به:

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

**ماذا يفعل:** الجزء الذي قبل `./tipjar` يحدد ملف المفتاح لهذا الأمر وحده (`TIPJAR_KEY`)، حتى لا يكتب الحساب الجديد فوق حسابك الأول. في Windows PowerShell نفّذ أولًا `$env:TIPJAR_KEY="$HOME\.config\qday\jar.env"`، ثم `java -jar target/tipjar.jar new`، ثم أعد ضبطه بعد ذلك بـ `Remove-Item Env:TIPJAR_KEY`.

**ما الذي يجب أن تراه:** عنوان `qor1...` جديدًا. انسخه. هذا هو **عنوان الحصّالة** الخاص بك. لا تحتاج الحصّالة إلى أي QOR لتستقبل البقشيش.

### 8. أرسل بقشيشًا موقّعًا هجينيًا {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

استبدل `qor1...JAR_ADDRESS` بعنوان الحصّالة من الخطوة 7.

| الجزء | المعنى |
| --- | --- |
| `tip` | أرسل بقشيشًا. |
| `qor1...JAR_ADDRESS` | من يستلم البقشيش. |
| `1` | المبلغ بـ QOR (أي 1 QOR = 1,000,000 uqor). |
| `"my first quantum-safe tip"` | الـ memo، نص قصير يُرفق بالمعاملة. اختياري. أبقِ علامتي الاقتباس إذا كان فيه مسافات. |

**ماذا يفعل:** يسأل التطبيق السلسلة كم غازًا تحتاج المعاملة (تشغيل تجريبي)، ويضيف 30 بالمئة كهامش أمان، ويوقّع بالمفتاحين، ويرسلها، وينتظر الكتلة، ثم يفحص سجل السلسلة نفسها.

**ما الذي يجب أن تراه:** معرّف المعاملة وارتفاع الكتلة والنتيجة `QUANTUM-SAFE`. وإذا رأيت `CHECK FAILED` فراجع استكشاف الأخطاء. انسخ المعرّف.

**كم يستغرق:** نحو 10 ثوانٍ.

### 9. راقب الحصّالة كما تفعل الواجهة الخلفية لمتجر {#watch}

افتح **طرفية ثانية**، وانتقل إلى المجلد نفسه، وشغّل المراقب:

```bash
cd build-before-qday/workshop-1/05-java-tipjar
./tipjar watch qor1...JAR_ADDRESS
```

ثم عد إلى الطرفية الأولى وأرسل بقشيشًا آخر (الخطوة 8، مع memo جديد).

**ماذا يفعل:** يسأل `watch` السلسلة كل 3 ثوانٍ عن تحويلات جديدة إلى الحصّالة، ويضع وسمًا على كل واحد. الأمر `NO_COLOR=1 ./tipjar watch ...` يوقف الألوان. أوقفه بـ Ctrl+C.

**ما الذي يجب أن تراه:** كل بقشيش مدرجًا مع الوسم `QUANTUM-SAFE`. أما البقشيش الذي يُرسل بدون توقيع هجين متحقَّق منه فيظهر بالوسم `classical only`.

## تحقق من المعاملة بنفسك {#verify}

لا يلزمك أن تثق بالتطبيق. اسأل السلسلة مباشرة.

**الطريقة 1، في المتصفح.** افتح `https://explore.qore.network/tx/<HASH>` (ضع معرّفك مكان `<HASH>`)، ثم حوّل المستكشف إلى **Testnet**. يجب أن ترى معاملة ناجحة.

**الطريقة 2، أمر واحد.** ضع معرّفك مكان `<HASH>`:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| الجزء | المعنى |
| --- | --- |
| `curl` | أداة تنزّل عنوان ويب. مدمجة في macOS وWindows 10+ ومعظم أنظمة Linux. |
| `-s` | صامت: أخفِ شريط التقدّم. |
| العنوان | واجهة REST العامة لـ testnet. تعيد سجل المعاملة الكامل بصيغة JSON. |

**ما الذي يجب أن تراه** في الناتج الطويل (استخدم عارض JSON أو أضف `| jq .` إذا ثبّتّ jq):

- `"code": 0` تعني أن المعاملة نجحت.
- امتداد `PQCHybridSignature` يحمل `pqc_signature` بحجم **4,627 بايت** (وهو توقيع ML-DSA-87).
- حدث `pqc_hybrid_verify` والسمة `status` فيه تساوي `verified` لعنوانك.

## كيف يعمل الإثبات {#proof}

يقرأ التطبيق السجل نفسه من `GET /cosmos/tx/v1beta1/txs/{hash}` ويبحث عن الحدث `pqc_hybrid_verify` (مع `address=<signer>` و`status=verified`) وعن الامتداد `/qorechain.pqc.v1.PQCHybridSignature` الذي فيه توقيع بحجم 4,627 بايت. ويفعل المراقب الشيء نفسه لكل تحويل وارد.

## استكشاف الأخطاء {#troubleshooting}

| ما الذي تراه | السبب | ما العمل |
| --- | --- | --- |
| `./tipjar: Permission denied` | النسخة المنزَّلة حديثًا ليست معلَّمة كقابلة للتشغيل. | نفّذ `chmod +x tipjar`. |
| `build first: (cd ... && mvn -q package)` | ملف jar مفقود. | نفّذ `mvn -q package` في هذا المجلد (الخطوة 2). |
| `mvn: command not found` أو `java: command not found` | الأداة غير مثبّتة، أو لم تُفتح الطرفية من جديد. | ثبّتها (راجع قبل أن تبدأ)، وافتح طرفية جديدة، وتحقق من الإصدار. |
| تقول Java إن الإصدار 17 أو أقل | إصدار Java أقدم يأتي أولًا في مسارك. | ثبّت Java 21، وافتح طرفية جديدة، ونفّذ `java -version` مرة أخرى. |
| `no key file at ..., run new first` | تخطيت الخطوة 4، أو `TIPJAR_KEY` يشير إلى مكان آخر. | نفّذ `./tipjar new`. |
| `key file already exists` | أنشأت مفتاحًا من قبل. | احتفظ به، أو استبدله بـ `./tipjar new --force` (يضيع المفتاح القديم). |
| `account has no PQC key and classical fallback is disabled` | المفتاح المقاوم للحوسبة الكمومية لم يُسجَّل بعد. | نفّذ `./tipjar register` أولًا. |
| `EVM authorisation window exhausted` | هذه الرسالة تخص تطبيقات EVM (counter وguestbook). ولا يستخدمها Tip Jar. | في تطبيقات EVM افتح نافذة جديدة بالأمر `pnpm window open`. |
| `HHE10402` بعد فتح النافذة | تخص تطبيقات Hardhat فقط: لم تكن النافذة نشطة بعد. | في تطبيقات Hardhat شغّل النشر مرة أخرى. |
| الرصيد 0 أو `not on chain yet` | لم تصل عملات الـ faucet. | انتظر 10 ثوانٍ ونفّذ `./tipjar status`. تأكد أنك لصقت العنوان الصحيح. |
| يقول الـ faucet إنك بلغت حد الطلبات | طلب واحد كل 24 ساعة لكل حساب. | انتظر، أو استخدم حسابًا تجريبيًا ثانيًا. |
| `chain refused the tx` أو `poll failed` | testnet مشغولة أو قيد الترقية، أو تحدّ نقطة النهاية العامة من الطلبات لكل عنوان IP. | انتظر دقيقة ونفّذ الأمر مرة أخرى. |
| `recipient must be a qor1... address` | العنوان خاطئ أو فيه مسافات. | انسخ العنوان `qor1...` كاملًا من جديد. |
| أخطاء `CORS` في المتصفح | تحدث فقط عندما تستدعي صفحة ويب السلسلة مباشرة. وهذا التطبيق لا يفعل ذلك. | في تطبيق متصفح، استخدم وكيل `/lcd` الموجود في القالب. |
| `pnpm: command not found` | pnpm غير مثبّت. ولا حاجة إليه هنا. | فقط لدليل Hardhat: نفّذ `npm install -g pnpm`. |

## كود SDK المهم {#code}

```java
PqcDx.Signer signer = new PqcDx.Signer();                  // keys, chain id, account number, sequence
signer.secp256k1PrivateKey = account.privateKey;            // classical half
signer.pqcKeypair = Authenticator.derivePqcCanonical(account.address, mnemonic); // ML-DSA-87 half
signer.chainId = "qorechain-diana";
signer.restUrl = Networks.get("testnet").endpoints.rest;    // sign-bytes version and key checks

PqcDx.HybridSendPath path = PqcDx.migrateToHybrid(signer, new Broadcaster(rpc), null, opts); // registers once
TypedMessage tip = NativeTx.bankSend(from, to, List.of(new StdFee.Coin("uqor", "500000")));
var sent = path.sendAuto(List.of(tip), "0.15uqor", 1.3);   // simulate, price, hybrid-sign, broadcast
TxTracker.waitForTx(new RestClient(rest), sent.result.transactionHash, null);
```

الغاز لا يكون ثابتًا أبدًا: تُحاكى كل معاملة أولًا وتحصل على الغاز المحاكى مضروبًا في 1.3، بسعر 0.15 uqor لكل وحدة غاز.

الحساب هو حساب QoreChain كلاسيكي من نوع coin-118 (`m/44'/118'/0'/0/0`). ويُشتق مفتاح ML-DSA-87 من عبارة الاسترجاع نفسها ويُربط بالعنوان عبر `Authenticator.derivePqcCanonical`. وإذا بنيت تطبيقك الخاص على دوال المساعدة المعتمدة على البذرة (seed) بدلًا من ذلك، فإن SDK 0.13.0 يحتاج إلى رمز استرداد أو سر PQC مستقل من 32 بايت؛ راجع [تثبيت SDK](/sdk/install#whats-new-0130). لا تطبع رمز الاسترداد أبدًا.

## الحزم المستخدمة {#packages}

| العنصر | الإصدار |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| التطبيق `demo:tipjar` | 1.0.0 |

راجع [تثبيت SDK](/sdk/install) لجدول الإصدارات لكل اللغات.

## أين تبحث عن المعلومات {#access}

| ماذا | أين |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| المستكشف | `https://explore.qore.network` (حوّله إلى Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| الكود | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
