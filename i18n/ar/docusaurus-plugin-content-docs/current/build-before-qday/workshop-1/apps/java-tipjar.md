---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: تطبيق Java، Q-Day Tip Jar
sidebar_label: Java، Tip Jar
sidebar_position: 5
---

# تطبيق Java: Q-Day Tip Jar

**Q-Day Tip Jar** خلفية Java صغيرة لشبكة QoreChain الاختبارية (`qorechain-diana`، معرّف سلسلة EVM هو 9800). ترسل الإكراميات بـ **توقيع هجين** (secp256k1 الكلاسيكي مع ML-DSA-87 ما بعد الكمومي، FIPS 204). وكمثال على خلفية متجر، يمكنها أيضًا مراقبة عنوان الحصّالة وقبول الإكراميات التي تحققت السلسلة من توقيع مرسلها على أنه هجين فقط.

## ما الذي يُظهره {#what-it-shows}

- **توقيع هجين ML-DSA-87 + secp256k1** من Java عبر مسار نداء واحد في SDK.
- **معاملة موقّعة هجينًا ومتحقَّق منها على السلسلة**: تُصدر السلسلة الحدث `pqc_hybrid_verify` بالحالة `status=verified` للموقّع، وتحمل المعاملة توقيع ML-DSA-87 بحجم 4627 بايت.
- **خلفية تميّز الإكراميات الآمنة كموميًا من الكلاسيكية**: يضع `watch` على كل تحويل وارد الوسم `QUANTUM-SAFE` أو `classical only`.

لماذا يهم ذلك: يُتوقع أن يكسر حاسوب كمومي في المستقبل التوقيع الكلاسيكي وحده. أما الخدمة التي تفحص سجل التحقق الصادر عن السلسلة نفسها فتستطيع أن تقرر مقدار الثقة بكل دفعة. راجع [المعاملات الآمنة كموميًا](/sdk/guides/quantum-safe).

## خطوة بخطوة {#run}

كل ما يلي يعمل في طرفيتك الخاصة (macOS أو Linux أو Windows مع WSL). تستخدم حسابًا اختباريًا مؤقتًا فقط. QOR الاختبارية بلا قيمة، ولا تستخدم هنا محفظة حقيقية أبدًا.

### 1. ثبّت الأدوات {#install}

تحتاج إلى Git وJDK 21 أو أحدث وMaven. افحص ما لديك:

```bash
git --version
java -version      # must report 21 or later
mvn -version       # any recent Maven 3.x
```

إن كان `java` أو `mvn` غير موجود أو قديمًا، فثبّته أولًا، مثلًا بـ [Temurin JDK 21](https://adoptium.net) و[Apache Maven](https://maven.apache.org/install.html)، أو بمدير الحزم لديك (`brew install openjdk@21 maven` على macOS، و`sudo apt install openjdk-21-jdk maven` على Debian أو Ubuntu). افتح طرفية جديدة وأعد الفحوص الثلاثة.

### 2. احصل على الشيفرة {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

### 3. ابنِ التطبيق {#build}

```bash
mvn -q package
```

ينزّل Maven الـ SDK من Maven Central ويبني ملفًا واحدًا قابلًا للتشغيل هو `target/tipjar.jar`. يستغرق البناء الأول أقل من دقيقة. ثم اجعل المشغّل قابلًا للتنفيذ وتأكد أنه يعمل:

```bash
chmod +x tipjar
./tipjar
```

يجب أن ترى قائمة الأوامر (`new` و`status` و`register` و`tip` و`watch`).

### 4. أنشئ حسابك الاختباري المؤقت {#key}

```bash
./tipjar new
```

يولّد هذا عبارة استرداد جديدة ويكتبها في ملف المفاتيح `~/.config/qday/java.env` (مقروء لك وحدك، صلاحيات 0600)، ويطبع عنوان الحساب فقط، وهو يبدأ بـ `qor1...`. لا تُطبع العبارة أبدًا. لا تشارك هذا الملف ولا تُودِعه ولا تعِد استخدامه على الشبكة الرئيسية. لإبقاء المفتاح في مكان آخر، اضبط `TIPJAR_KEY=/path/to/file` قبل كل أمر.

انسخ العنوان `qor1...` من الناتج. إن ضاع منك فإن `./tipjar status` يطبعه مرة أخرى.

### 5. احصل على QOR اختبارية من الصنبور {#faucet}

1. افتح https://dashboard.qorechain.io/faucet وسجّل الدخول.
2. الصق عنوانك `qor1...` واطلب الرموز. يعطي الصنبور 100 QOR كل 24 ساعة.
3. تأكد من وصولها:

```bash
./tipjar status
```

يجب أن يعرض الرصيد QOR الاختبارية الخاصة بك، وأن يظهر المفتاح ما بعد الكمومي على أنه غير مسجَّل بعد.

### 6. سجّل مفتاحك ما بعد الكمومي {#register}

```bash
./tipjar register
```

يسجّل هذا مفتاح ML-DSA-87 على السلسلة مرة واحدة. وتشغيله مرة أخرى آمن. تُوقَّع رسالة التسجيل نفسها كلاسيكيًا عن قصد، لأنه لا يوجد بعد مفتاح ما بعد كمومي للتوقيع به؛ وهي تحمل إثباتًا بأنك تملك المفتاح الجديد. كل معاملة بعدها تُوقَّع هجينًا.

### 7. أنشئ عنوانًا ثانيًا لاستقبال الإكراميات {#jar}

تحتاج الإكرامية إلى مستلم. أنشئ حسابًا مؤقتًا ثانيًا للحصّالة، بملف مفاتيح خاص به:

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

انسخ عنوانه `qor1...`. هذا هو عنوان حصّالتك.

### 8. أرسل إكرامية موقّعة هجينًا {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

استبدل `qor1...JAR_ADDRESS` بعنوان الحصّالة من الخطوة 7. القيمة `1` هي المبلغ بعملة QOR. المذكرة اختيارية. يحاكي التطبيق المعاملة ليضبط الغاز، ويوقّعها بالمفتاحين، ويبثها، وينتظر الكتلة، ثم يفحص سجل التحقق الصادر عن السلسلة.

### 9. راقب الحصّالة كما تفعل خلفية متجر {#watch}

افتح طرفية ثانية في المجلد نفسه. شغّل المراقب على عنوان الحصّالة، ثم أرسل إكرامية أخرى من الطرفية الأولى:

```bash
./tipjar watch qor1...JAR_ADDRESS
```

يفحص المراقب كل 3 ثوانٍ ويضع وسمًا على كل إكرامية واردة. أوقفه بـ Ctrl+C. اضبط `NO_COLOR=1` لإيقاف الألوان. لنقاط نهاية شبكة الاختبار العامة حد معدّل لكل IP، فإن فشل نداء فانتظر دقيقة وأعد المحاولة.

## ما الذي يجب أن تراه {#output}

- بعد `tip`، تطبع الطرفية تجزئة المعاملة وارتفاع الكتلة، ثم نتيجة التحقق: `QUANTUM-SAFE` عندما تحققت السلسلة من التوقيع الهجين، و`CHECK FAILED` خلاف ذلك.
- في `watch`، تُسرد كل إكرامية مع وسم `QUANTUM-SAFE` عندما تحققت السلسلة من توقيع هجين، أو `classical only` عندما لم تفعل.
- في المستكشف: افتح `https://explore.qore.network/tx/<HASH>` (بالتجزئة من الطرفية) وبدّل المستكشف إلى **Testnet**. تظهر المعاملة ناجحة.

## كيف يعمل الإثبات {#proof}

يقرأ التطبيق المعاملة من نقطة REST لشبكة الاختبار (`GET /cosmos/tx/v1beta1/txs/{hash}`) ويبحث عن:

- حدث `pqc_hybrid_verify` مع `address=<signer>` و`status=verified`؛
- الامتداد `/qorechain.pqc.v1.PQCHybridSignature` مع `pqc_signature` بحجم 4627 بايت.

ويقرأ المراقب هذا بالضبط لكل تحويل وارد.

## شيفرة SDK المهمة {#code}

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

الغاز لا يكون ثابتًا أبدًا: تُحاكى كل معاملة أولًا ثم تحصل على الغاز المحاكى مضروبًا في 1.3، بسعر 0.15 uqor للغاز الواحد.

الحساب هو حساب QoreChain كلاسيكي بنوع العملة 118 (`m/44'/118'/0'/0/0`). يُشتق مفتاح ML-DSA-87 من عبارة الاسترداد نفسها ويُربط بالعنوان عبر `Authenticator.derivePqcCanonical`. إن بنيت تطبيقك الخاص على المساعدات المعتمدة على البذرة بدلًا من ذلك، فإن SDK 0.13.0 يحتاج إلى رمز استرداد أو سرّ PQC مستقل من 32 بايت؛ راجع [تثبيت SDK](/sdk/install#whats-new-0130). لا تطبع رمز استرداد أبدًا.

## الحزم المستخدمة {#packages}

| البند | الإصدار |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| التطبيق `demo:tipjar` | 1.0.0 |

راجع [تثبيت SDK](/sdk/install) لجدول الإصدارات بكل اللغات.

## أين تبحث عن كل شيء {#access}

| ماذا | أين |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| المستكشف | `https://explore.qore.network` (بدّل إلى Testnet) |
| الصنبور | https://dashboard.qorechain.io/faucet |
| الشيفرة | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
