---
slug: /build-before-qday/workshop-3
title: "الورشة 3: تطبيقات مشفّرة وعبر الآلات الافتراضية"
sidebar_label: "الورشة 3"
sidebar_position: 4
date: 2026-11-20
---

# الورشة 3: تطبيقات مشفّرة وعبر الآلات الافتراضية

حمَت الورشة 2 الأموال بمفتاح ما بعد كمومي. أما الورشة 3 فتفعل شيئين جديدين على السلسلة نفسها. الأول: **تشفّر رسالة إلى عنوان في QoreChain** بحيث لا يقرأها إلا مالك ذلك العنوان، بتشفير ما بعد كمومي. والثاني: معاملة واحدة على **EVM** تكتب في عقد على **QoreChain Native**، فيتغيّر الطرفان معًا أو لا يتغيّر أي منهما.

لا يلزم أن تكون خبيرًا في التشفير. كل أمر أدناه يشرح ماذا يفعل وماذا ينبغي أن تراه. التطبيقان النموذجيان عامان: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)، المجلد `workshop-3`. كلاهما يعمل على الشبكة التجريبية `qorechain-diana` فقط. QOR الاختباري بلا قيمة.

**كم يستغرق ذلك:** نحو 30 دقيقة لـ QoreSeal، و40 للدفع عبر الآلات الافتراضية. الجزآن مستقلان، ويحتاج كل منهما إلى حسابات اختبارية خاصة به.

## ما الذي نبنيه {#what-we-built}

| الجزء | التطبيق | ما يوضّحه |
| --- | --- | --- |
| 1 | **QoreSeal** (Node.js) | تشفير رسالة إلى عنوان `qor1...` بـ ML-KEM-1024، وفتحها، ورؤية أن الغريب لا يستطيع فتحها، ورؤية أن العبث بها يُكشف، وتدوير مفتاح دون فقدان الرسائل القديمة. |
| 2 | **CrossVmCheckout** (Solidity وRust) | استدعاء واحد من عقد EVM يكتب إيصالًا في عقد Native ضمن المعاملة نفسها. وإذا فشل أحد الطرفين يُلغى الطرفان معًا. |

الابتكارات التي تقف خلفها:

- **التشفير إلى عنوان.** يستطيع كل حساب أن ينشر مفتاح تشفير ما بعد كمومي على السلسلة، كدليل هاتف عام. وللكتابة إلى شخص يكفيك عنوانه.
- **بطاقة تربط المفتاح بالحساب.** يوقّع الحساب بطاقة مستلِم صغيرة بمفتاحي التوقيع كليهما، فلا يستطيع أحد دسّ مفتاح تشفير مزيّف بينهما.
- **تشفير هجين.** يُدمج ML-KEM-1024 (NIST FIPS 203) مع مفتاح X25519 الكلاسيكي. وتبقى الرسالة سرية ما دام أحدهما صامدًا.
- **ذرّية عبر الآلات الافتراضية.** يتشارك EVM وQoreChain Native حالة واحدة وكتلة واحدة. والاستدعاء بينهما جزء من المعاملة نفسها، فلا توجد حالة نصف منتهية تحتاج إلى تنظيف.
- **مدى تقرّه الحوكمة.** لا يستدعي الجسر إلا عقود Native التي أقرّتها الحوكمة، وكل إقرار مثبّت على شيفرة العقد.

## كلمات تُستخدم في هذا الدليل {#words}

| الكلمة | معناها ببساطة |
| --- | --- |
| ML-KEM-1024 | تبادل مفاتيح ما بعد كمومي (NIST FIPS 203). يُستخدم هنا للاتفاق على مفتاح سري لكل رسالة |
| X25519 | تبادل مفاتيح كلاسيكي، يُدمج مع ML-KEM فيبقى الظرف آمنًا إذا كُسر أحدهما |
| ML-DSA-87 | التوقيع ما بعد الكمومي (NIST FIPS 204). تُوقَّع به كل معاملة Native، ومعه مفتاح secp256k1 الكلاسيكي |
| بطاقة المستلِم (Recipient card) | ملاحظة صغيرة موقّعة تربط مفاتيح تشفير الحساب بالحساب |
| الظرف (Envelope) | الرسالة المختومة، تُحفظ في ملف نصي يمكنك إرساله بأي طريقة تشاء |
| Native | QoreChain Native، مسار CosmWasm حيث تُكتب العقود بلغة Rust |
| Bridge precompile | عقد مدمج على العنوان `0x0000000000000000000000000000000000000901` يتيح لعقد EVM أن يستدعي عقد Native |
| قائمة السماح (Allowlist) | عقود Native التي أقرّتها الحوكمة ليصل إليها الجسر |
| نافذة EVM (EVM window) | تفويض قصير ومحدود لإرسال معاملات من نمط إيثريوم من حساب ما. فتحها يحتاج إلى معاملة موقّعة بالمفتاحين معًا |

:::caution حسابات اختبارية مؤقتة فقط
استخدم مفاتيح أُنشئت لهذه الورشة وتحمل QOR اختبارية بلا قيمة. لا تضع أبدًا الكلمات السرية أو مفتاح حساب يحمل أموالًا حقيقية في ملف أو في أي أمر.
:::

## قبل أن تبدأ {#prerequisites}

تحتاج إلى الأدوات المذكورة في [قبل أن تبدأ](/build-before-qday/prerequisites) (طرفية وNode.js وGit)، ومتصفح ويب للحنفية. يحتاج الجزء 1 إلى Node.js الإصدار 20 أو أحدث. ويحتاج الجزء 2 أيضًا إلى **pnpm** و**Foundry**، واختياريًا Rust. تحقق من Node.js:

```bash
node -v
```

يجب أن يطبع `v20` أو رقمًا أعلى. للجزء 2 ثبّت الباقي:

```bash
npm install -g pnpm
```

يثبّت pnpm، أداة الحزم التي يستخدمها الجزء 2. تحقق منه بـ `pnpm -v`. يقوم Foundry بتجميع عقود Solidity واختبارها ونشرها: ثبّته من [getfoundry.sh](https://getfoundry.sh)، ثم شغّل `foundryup`. وتحقق بـ `forge --version` و`cast --version`.

احصل على شيفرة الأمثلة:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-3
```

ينزّل السطر الأول الأمثلة إلى مجلد باسم `build-before-qday`. وينتقل الثاني إلى المجلد `workshop-3` الذي يضم التطبيقين.

QOR الاختباري يأتي من [الحنفية](/dashboard/faucet) على لوحة التحكم.

## الجزء 1: QoreSeal، التشفير إلى عنوان {#part-1}

الشيفرة: [workshop-3/01-qoreseal](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/01-qoreseal). الحزم: `@qorechain/qoreseal` و`@qorechain/qoresign`.

تريد إرسال رسالة خاصة إلى شخص، وكل ما تعرفه هو عنوانه. يوضّح هذا التطبيق الطريقة:

1. تسجّل Alice مفاتيحها على السلسلة.
2. يبحث أي شخص عن مفتاح تشفير Alice بعنوانها.
3. تُختم رسالة إلى Alice. تفتحها Alice. **أما Eve فلا تستطيع.**
4. غيّر بتًا واحدًا في الظرف فـ**لا يُفتح بعد ذلك**.
5. رسالة واحدة مختومة إلى Alice **وإلى** Bob: يفتحها كل منهما بمفتاحه.
6. **تدوّر** Alice مفتاحها: تُرفض البطاقة القديمة، وتستخدم الرسائل الجديدة المفتاح الجديد، وتبقى الرسائل القديمة تُفتح.

يتم التشفير على حاسوبك. السلسلة لا ترى الرسالة أبدًا، بل المفتاح العام فقط.

```bash
cd 01-qoreseal
```

ينتقل إلى مجلد QoreSeal.

### الخطوة 1: التثبيت {#seal-install}

```bash
npm install
```

ينزّل إصدارات الحزم الدقيقة الموجودة في `package-lock.json`: QoreSeal وQoreSign (الموقّع الهجين) وبعض مساعدات cosmjs التي تبني المعاملة.

```bash
node seal.mjs help
```

يعرض كل الأوامر.

### الخطوة 2: أنشئ ثلاثة حسابات على الشبكة التجريبية {#seal-accounts}

```bash
node seal.mjs init alice
node seal.mjs init bob
node seal.mjs init eve
```

يُنشئ كل أمر حسابًا جديدًا ويحفظ كلماته السرية في `~/.config/qday-w3/<name>.json`، ولا يقرأه غيرك. لا يُطبع أي سر. اضبط `QDAY_DIR` لحفظ الملفات في مكان آخر. يطبع كل أمر عنوان `qor1...` للحساب.

### الخطوة 3: موّل Alice {#seal-fund-alice}

الصق عنوان `qor1...` الخاص بـ Alice في [الحنفية](/dashboard/faucet)، ثم تحقق:

```bash
node seal.mjs whoami
```

يعرض كل حساب: العنوان والرصيد وهل مفاتيحه على السلسلة بعد. الجواب الآن `no`.

### الخطوة 4: تسجّل Alice مفاتيحها {#seal-register}

```bash
node seal.mjs register alice
```

معاملتان:

1. **مفتاح التوقيع ML-DSA-87**، مع إثبات أن Alice تملكه. هذه هي المعاملة الوحيدة التي تقبلها السلسلة موقّعة بالمفتاح الكلاسيكي وحده، لأنها لا تعرف مفتاحها ما بعد الكمومي بعد.
2. **مفتاح التشفير ML-KEM-1024** (1,568 بايت)، موقّع بالمفتاحين. ومن الآن يستطيع أي شخص قراءته من السلسلة.

ثم يوقّع **بطاقة المستلِم** الخاصة بـ Alice ويحفظها في `cards/alice.json`. في تطبيق حقيقي تنشر البطاقة بجانب العنوان، مثلًا في صفحة ملف شخصي أو في عقد أو خلف واجهة API.

### الخطوة 5: شارك QOR مع Bob وEve، وسجّل Bob {#seal-bob}

```bash
node seal.mjs fund alice bob 3
node seal.mjs fund alice eve 3
```

يرسل 3 QOR اختبارية من Alice إلى Bob وإلى Eve. وكأي معاملة بعد التسجيل، تُوقَّع بـ**المفتاحين**، وتفحصهما السلسلة. ولهذا تسجّل Alice أولًا: الحساب الذي لا مفتاح ML-DSA-87 له على السلسلة لا يستطيع إلا تسجيل مفتاح، وأي معاملة أخرى منه تُرفض.

```bash
node seal.mjs register bob
```

نحتاج إلى Bob في الخطوة 9، حيث تذهب رسالة واحدة إلى شخصين. تبقى Eve غير مسجّلة: هي الغريبة التي ستحاول قراءة رسائل Alice.

### الخطوة 6: ابحث عن Alice كما يفعل المرسِل {#seal-lookup}

```bash
node seal.mjs lookup alice
```

يقرأ `GET /qorechain/pqc/v1/kem/<address>` من واجهة REST العامة: الخوارزمية (`ML-KEM-1024`) والمفتاح العام بحجم 1,568 بايت والكتلة التي سُجّل فيها. ثم يفحص البطاقة مقابل ذلك المفتاح ومقابل مفتاح ML-DSA-87 الخاص بـ Alice على السلسلة. يجب أن ترى `card valid`. يمكنك فعل ذلك لأي عنوان: `node seal.mjs lookup qor1...`.

### الخطوة 7: اختم رسالة إلى Alice وافتحها {#seal-send}

```bash
node seal.mjs send alice "Payroll for March: 12,400 QOR to the team"
```

يقرأ مفتاح Alice من السلسلة، ويفحص بطاقتها، ويختم الرسالة. رسالة من 41 حرفًا تصبح نحو 1,760 بايت، معظمها مادة مفاتيح ما بعد كمومية. يُحفظ الظرف في `inbox/`.

```bash
node seal.mjs open alice
```

يعرض `OPENED by alice with encryption key #0` والرسالة.

```bash
node seal.mjs open eve
```

يعرض `CANNOT OPEN: eve holds none of the keys this envelope was sealed to`. لدى Eve الملف، لكن ليس لديها مفتاح Alice.

### الخطوة 8: اعبث بالظرف {#seal-tamper}

```bash
node seal.mjs tamper alice
```

يقلب بتًا واحدًا من الظرف ويحاول فتحه. يجب أن ترى `REFUSED` مع `DECRYPTION_FAILED`. الظرف موثّق، فأي تغيير يُكشف ولا يستطيع أحد تعديل رسالة مختومة.

### الخطوة 9: رسالة واحدة، مستلِمان {#seal-multi}

```bash
node seal.mjs send alice,bob "Board memo: Q4 budget"
node seal.mjs open bob
node seal.mjs open alice
```

ظرف واحد مختوم إلى العنوانين. يفتحه كل منهما بمفتاحه. وEve ما زالت لا تستطيع.

### الخطوة 10: دوّر مفتاح Alice {#seal-rotate}

```bash
node seal.mjs rotate alice
```

يشتق مفتاح التشفير **التالي** لـ Alice (الرقم 1) من الكلمات السرية نفسها ويسجّله على السلسلة، حيث **يحل محل** القديم. ثم يفحص البطاقة **القديمة** مقابل السلسلة، ويجب أن ترى `refused: the card names a different ML-KEM-1024 key than the registered one`. المرسِلون الذين يفحصون البطاقة لم يعد بإمكانهم الختم إلى المفتاح القديم. وتُوقَّع بطاقة جديدة.

```bash
node seal.mjs open alice inbox/$(ls inbox | head -1)
```

يفتح **أول** ظرف، المختوم قبل التدوير: `OPENED by alice with encryption key #0 (an older key)`. لم يُخزَّن المفتاح القديم قط. يُشتق من جديد من الكلمات السرية، فلا يحبسك التدوير خارج رسائلك القديمة.

```bash
node seal.mjs inspect
```

يعرض ما بداخل الظرف دون السر: الإصدار والغرض والمستلِمين والأحجام.

### كيف تعمل الشيفرة {#seal-code}

كل شيء في `seal.mjs`. استدعاءات QoreSeal المهمة:

| الاستدعاء | ماذا يفعل |
| --- | --- |
| `deriveSealKeys({ mnemonic, index })` | مفاتيح التشفير للمفتاح رقم `index`، مشتقة من الكلمات السرية |
| `buildRegisterKemKeyMessage({ sender, mlkemPublicKey })` | الرسالة `MsgRegisterKEMKey` التي تضع المفتاح على السلسلة |
| `signRecipientCard({ chainId, address, keys, classicalKey, pqKey })` | البطاقة، موقّعة بمفتاحي توقيع الحساب كليهما |
| `verifyRecipientCard({ card, chainId, address, mlkemPublicKey, pqPublicKey })` | يرمي خطأ ما لم تطابق البطاقة المفاتيح على السلسلة |
| `sealToAddresses({ rest, chainId, purpose, recipients, plaintext })` | يقرأ كل مفتاح من السلسلة، ويفحص كل بطاقة، ويختم |
| `open({ chainId, purpose, envelope, keys })` | يفتح الظرف، أو يرمي خطأ |
| `envelopeToText` و`envelopeFromText` | الظرف كملف نصي والعكس |

`purpose` (هنا `qday-note`) جزء مما يُختم: الظرف المصنوع لتطبيق لا يمكن فتحه كأنه جاء من تطبيق آخر.

### إذا حدث خطأ (QoreSeal) {#seal-trouble}

| ما ترى | ما العمل |
| --- | --- |
| `does not exist on chain yet: fund ... first` | الحساب بلا QOR: استخدم الحنفية أو `fund` |
| `no ML-KEM key registered for this address` | شغّل `register` لذلك الحساب أولًا |
| `hybrid mode needs the recipient card` | الملف `cards/<name>.json` مفقود: شغّل `register <name>`، فهو يكتب البطاقة من جديد |
| `no envelope yet` | شغّل `send` أولًا |
| `account has no PQC key and classical fallback is disabled` | لم يسجّل ذلك الحساب بعد: شغّل `register <name>` قبل `fund` منه |
| `refused: ...` في معاملة | اقرأ الرسالة: غالبًا QOR غير كافٍ، أو أن واجهة API العامة للشبكة التجريبية تحدّ من طلباتك. انتظر بضع ثوانٍ |

الملفات في `~/.config/qday-w3/` تحمل كلمات سرية. لا تودعها في مستودع ولا تشاركها، ولا تعد استخدامها على الشبكة الرئيسية. المجلدان `cards/` و`inbox/` محليان ومدرجان في `.gitignore`.

## الجزء 2: CrossVmCheckout، معاملة واحدة عبر آلتين افتراضيتين {#part-2}

الشيفرة: [workshop-3/02-cross-vm](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/02-cross-vm). اللغات: Solidity وTypeScript لجانب EVM، وRust لجانب Native.

تشغّل QoreChain أكثر من آلة افتراضية على السلسلة نفسها: **EVM** (Solidity، على نمط MetaMask) و**QoreChain Native** (عقود CosmWasm بلغة Rust). تتشارك حالة واحدة وكتلة واحدة. هذا التطبيق متجر صغير:

- **`CrossVmCheckout`** (Solidity، EVM) يعدّ الطلبات.
- **`qday-receipts`** (Rust، Native) يحتفظ بدفتر إيصالات.
- استدعاء واحد لـ `checkout("coffee for the team")` يفعل الأمرين **في المعاملة نفسها**: يزيد عدد الطلبات على جانب EVM ويُكتب إيصال على جانب Native.

والمقصود هو **الذرّية**: يتغيّر الطرفان معًا أو لا يتغيّر أي منهما.

| الأمر | ماذا يحدث | النتيجة |
| --- | --- | --- |
| `checkout` | الطلبات +1 على EVM، الإيصالات +1 على Native | يتغيّر الطرفان |
| `undo` | يُكتب إيصال Native، **ثم** يتراجع جانب EVM | لا يتغيّر أي منهما: يُلغى الإيصال أيضًا |
| `native-fails` | يُعدّ الطلب، **ثم** يرفض عقد Native | لا يتغيّر أي منهما: يُلغى الطلب أيضًا |
| `outside` | اطلب من الجسر استدعاء عقد Native لم تقرّه الحوكمة | تردّه السلسلة |

على الشبكة الرئيسية، استدعاءات الآلات الافتراضية المتعددة متوقفة حاليًا، لذا يعمل هذا الجزء على الشبكة التجريبية فقط.

### الجسر وقائمة السماح {#bridge}

يصل EVM إلى Native عبر الجسر المدمج (bridge precompile) على العنوان `0x0000000000000000000000000000000000000901`. تستدعي:

```solidity
executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)
```

| المعامل | المعنى |
| --- | --- |
| `targetVM` | `1` لـ Native |
| `targetContract` | عنوان `qor1...` لعقد Native |
| `payload` | رسالة JSON الخاصة بعقد Native |

لا يصل الجسر إلا إلى عقود Native التي أقرّتها **الحوكمة**. القائمة عامة، في معاملات crossvm (`GET https://api-testnet.qore.host/qorechain/crossvm/v1/params`)، وكل إدخال مثبّت على شيفرة العقد، فلا يمكن استبدال عقد مُقَرّ بشيفرة مختلفة لاحقًا.

عقد Native الذي ستستدعيه، `qday-receipts`، موجود في قائمة السماح على الشبكة التجريبية (مقترح الحوكمة 40، معرّف الشيفرة 865):

```text
qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8
```

لا مشرف له، فلا يستطيع أحد تغييره. **يستطيع أي مطوّر استدعاءه من عقوده لمسار Cross-VM.** وعلى جانب Native، مُرسِل الاستدعاء هو حساب `qor1...` الخاص بعقد EVM لديك، لا محفظتك، فيُظهر كل إيصال أي عقد كتبه.

### كيف يعمل عقد EVM {#xvm-how}

افتح `evm/src/CrossVmCheckout.sol`:

```solidity
function checkout(string calldata note, bool failAfter) external returns (bytes memory reply) {
    _checkNote(bytes(note));
    orders += 1;
    reply = _callNative(bytes(string.concat('{"record":{"note":"', note, '"}}')));
    if (failAfter) revert EvmSideFailed();
    emit Ordered(orders, msg.sender, note, reply);
}

function _callNative(bytes memory payload) private returns (bytes memory) {
    (bool ok, bytes memory ret) =
        BRIDGE.call(abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", NATIVE, receipts, payload));
    if (!ok) revert BridgeCallFailed(ret);
    if (ret.length == 0) revert BridgeNotActive();
    if (ret.length >= 64 && uint256(bytes32(ret)) == 32) return abi.decode(ret, (bytes));
    return ret;
}
```

1. **افحص الملاحظة.** تدخل داخل نص JSON، فيجب أن تكون من 1 إلى 140 حرفًا قابلًا للطباعة دون `"` ودون `\`. وإلا فقد تغيّر ملاحظة مصطنعة الرسالة التي يستقبلها عقد Native.
2. **عُدّ الطلب.** تغيير عادي في حالة EVM.
3. **استدعِ الجسر.** يعمل عقد Native هناك، داخل هذه المعاملة.
4. **إذا فشل استدعاء الجسر، تراجع.** يصبح فشل Native تراجعًا في EVM، وتُلغى المعاملة كلها.
5. **غياب الرد يعني غياب الجسر.** في سلسلة لا يكون فيها الـ precompile مفعّلًا، "ينجح" الاستدعاء إلى ذلك العنوان ببيانات فارغة. اعتبر ذلك خطأ، وليس نجاحًا أبدًا.
6. **فك ترميز الرد.** يعيد الجسر رد Native على هيئة `bytes` بترميز ABI. وتقبل الشيفرة أيضًا البايتات الخام.
7. **`failAfter`** يتراجع بعد نجاح استدعاء Native. ويبيّن أن الإيصال المكتوب على جانب Native يُلغى أيضًا.

استخدم `call` عاديًا، وليس `staticcall` ولا دالة view: الجسر يرفض الاستدعاءات الثابتة، لأن جانب Native قد يكتب في الحالة.

كل الأوامر أدناه تعمل في المجلد `evm` ما لم يُذكر غير ذلك:

```bash
cd ../02-cross-vm/evm
```

إذا كنت ما زلت في `01-qoreseal`، فهذا ينتقل إلى مجلد EVM الخاص بتطبيق الآلات الافتراضية المتعددة.

### الخطوة 1: شغّل الاختبارات (دون حساب) {#xvm-tests}

```bash
pnpm install
pnpm forge-std
forge test
```

ينزّل `pnpm install` حزم JavaScript. وينزّل `pnpm forge-std` المكتبة القياسية لـ Foundry إلى `lib/`، مرة واحدة. ويشغّل `forge test` الاختبارات الخمسة في `test/CrossVmCheckout.t.sol`. يجب أن ترى `5 passed; 0 failed`.

لا يملك EVM المحلي في Foundry جسر QoreChain، فتضع الاختبارات جسرًا مزيفًا صغيرًا على `0x...0901` بـ `vm.etch`. وتفحص رسالة JSON المرسَلة بالضبط، وأن `failAfter` يلغي كل شيء، وأن فشل Native يلغي جانب EVM، وأن الملاحظة لا تستطيع حقن JSON، وأن الجسر غير المفعّل خطأ. أما الجسر الحقيقي فيعمل في الخطوات التالية.

### الخطوة 2: حساب بمفتاح ما بعد كمومي {#xvm-account}

إذا أنجزت الورشة 2، فانسخ ملف `.env` منها (الحساب نفسه، والمفتاح مسجّل) وأضف السطر `RECEIPTS_CONTRACT` من `.env.example`. وإلا:

```bash
cast wallet new
cp .env.example .env
```

ينشئ `cast wallet new` حسابًا مؤقتًا. ضع مفتاحه الخاص في `.env` باسم `PRIVATE_KEY`. **للشبكة التجريبية فقط.**

```bash
pnpm window recovery-code
```

يطبع رمزًا بصيغة `QRC1-...`. ضعه في `.env` باسم `QORE_PQC_RECOVERY_CODE` واحتفظ بنسخة منه بعيدًا عن المفتاح الخاص. منه يُشتق مفتاح ML-DSA-87 الخاص بك.

```bash
pnpm window status
```

يعرض عنوان `qor1...` الخاص بك. الصقه في [الحنفية](/dashboard/faucet)، ثم:

```bash
pnpm window register
```

يضع مفتاح ML-DSA-87 على السلسلة، مرة واحدة لكل حساب. صار `pnpm window status` يعرض `PQC key: registered`.

### الخطوة 3: افتح نافذة EVM محدودة {#xvm-window}

```bash
pnpm window:scoped
```

يفتح نافذة من **1,200 كتلة (نحو 28 دقيقة) و6 معاملات و3 QOR** من القيمة زائد الرسوم. وهذا يكفي للنشر وللمعاملات التوضيحية الثلاث، لا أكثر. تستدعي محفظتك **عقدك أنت**، ثم يستدعي العقد الجسر بهويته الخاصة، فلا تحتاج النافذة إلا إلى السماح بالاستدعاء إلى عقدك.

**انتظر نحو 10 ثوانٍ** قبل الخطوة التالية، حتى تصير معاملة النافذة في كتلة.

### الخطوة 4: انشر المتجر {#xvm-deploy}

```bash
pnpm deploy:testnet
```

ينشر `CrossVmCheckout` موجّهًا إلى `RECEIPTS_CONTRACT`. ابحث عن `CrossVmCheckout 0x...`. في مخرجات Foundry، "ETH" تعني QOR.

```bash
pnpm xvm status
```

يعرض الطرفين: `orders` على عقد EVM الخاص بك وعدد الإيصالات في `qday-receipts`، مع آخر ثلاثة إيصالات. يكتب مطورون آخرون في دفتر الإيصالات نفسه، فعدده على الأرجح ليس صفرًا. المهم هو كيف **يتغيّر**.

### الخطوة 5: عقد لم تقرّه السلسلة {#xvm-outside}

```bash
pnpm xvm outside
```

يحاكي استدعاءً مباشرًا للجسر إلى عقد Native حقيقي **ليس** في قائمة السماح. يجب أن ترى `REFUSED by the bridge: ... is not allowlisted`. هذا مجاني ولا يستخدم معاملة نافذة.

### الخطوة 6: معاملة واحدة، آلتان افتراضيتان {#xvm-checkout}

```bash
pnpm xvm checkout "coffee for the team"
```

ترى `before`، ثم المعاملة (`SUCCESS`)، ثم `after`: الطلبات +1 **و**الإيصالات +1، مع الإيصال الجديد وملاحظتك، مرسَلًا `from` عنوان `qor1...` الخاص بعقدك. ثم `both sides changed, in the same transaction`.

### الخطوة 7: يفشل جانب EVM بعد استدعاء Native {#xvm-undo}

```bash
pnpm xvm undo "this receipt must disappear"
```

يُكتب إيصال Native، ثم يتراجع جانب EVM. تُسجَّل المعاملة بالحالة `REVERTED`، ويتطابق `before` و`after`: `nothing changed on either side`. والإيصال الذي كُتب على جانب Native اختفى أيضًا.

### الخطوة 8: يرفض جانب Native {#xvm-native-fails}

```bash
pnpm xvm native-fails
```

يُعدّ الطلب على جانب EVM، ثم يرفض `qday-receipts` بـ `{"fail":{}}`. تكون المعاملة `REVERTED` وتتطابق الأرقام: فيُلغى طلب EVM أيضًا.

لكل معاملة رابط في المستكشف. افتحه في [مستكشف لوحة التحكم](/dashboard/explorer) مع ضبط محدّد الشبكة على **Testnet**.

### إذا حدث خطأ (عبر الآلات الافتراضية) {#xvm-trouble}

| ما ترى | ماذا يعني | ما العمل |
| --- | --- | --- |
| `Missing or invalid parameters` عند النشر أو في معاملة | لا توجد نافذة EVM نشطة | `pnpm window status`، ثم `pnpm window:scoped`، وانتظر 10 ثوانٍ، وحاول مجددًا |
| `No shop yet` | لم يُنشر شيء من هذا المجلد | الخطوة 4، أو اضبط `SHOP_ADDRESS` في `.env` |
| `BridgeCallFailed` مع `not allowlisted` | الهدف غير مُقَرّ من الحوكمة | استخدم `qday-receipts`، العنوان أعلاه |
| `BridgeNotActive` | الجسر المدمج غير مفعّل على تلك الشبكة | استخدم الشبكة التجريبية |
| `BadNote` | الملاحظة فارغة أو طويلة جدًا أو فيها `"` أو `\` | استخدم نصًا عاديًا حتى 140 حرفًا |

### جانب Native {#native-side}

يضم المجلد `native/` المصدر الكامل لـ `qday-receipts` (CosmWasm 2، Rust):

| الرسالة | ماذا تفعل |
| --- | --- |
| `{"record":{"note":"..."}}` | تضيف إيصالًا: المعرّف والمرسِل والملاحظة وارتفاع الكتلة |
| `{"fail":{}}` | ترفض دائمًا، لإظهار الذرّية |
| `{"count":{}}` (استعلام) | كم عدد الإيصالات |
| `{"receipt":{"id":1}}` (استعلام) | إيصال واحد |
| `{"latest":{"limit":3}}` (استعلام) | أحدث الإيصالات، الأحدث أولًا، بحد أقصى 20 |

شغّل اختباراته (يلزم Rust):

```bash
cd ../native
cargo test
```

يجب أن ترى نجاح 3 اختبارات. رفع عقود Native على الشبكة التجريبية يمر عبر الحوكمة، فلا تحتاج إلى نشر هذا العقد: هو يعمل بالفعل.

للتحقق من أن الشيفرة على السلسلة هي هذا المصدر، ابنه بمحسّن CosmWasm وقارن المجاميع الاختبارية. بُنيت الشيفرة على السلسلة على جهاز Mac بمعالج Apple Silicon بصورة arm64، فاستخدم الصورة نفسها: صورة x86 تنتج مجموعًا اختباريًا مختلفًا.

```bash
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

يجب أن يكون المجموع الاختباري `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c`، وهو نفسه `data_hash` الذي تعرضه السلسلة للشيفرة 865:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/865" | head -c 400
```

اقرأ دفتر الإيصالات من أي مكان، دون حساب:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8/smart/$(printf '{"latest":{"limit":3}}' | base64)"
```

### الملفات {#files}

```text
evm/src/CrossVmCheckout.sol         the shop: counts orders, writes receipts through the bridge
evm/test/CrossVmCheckout.t.sol      Foundry tests, with a fake bridge
evm/script/CrossVmCheckout.s.sol    deploy script (reads RECEIPTS_CONTRACT and PRIVATE_KEY)
evm/scripts/window.ts               pnpm window: status, register, open, recovery-code
evm/scripts/xvm.ts                  pnpm xvm: status, checkout, undo, native-fails, outside
evm/.env.example                    the settings to copy into .env
native/src/lib.rs                   qday-receipts, the Native contract
```

## اعرف المزيد {#learn-more}

- المهرجان ومساري التطبيقات المشفّرة وCross-VM والمكافآت: [build.qorechain.io](https://build.qorechain.io).
- QoreSeal على npm: [@qorechain/qoreseal](https://www.npmjs.com/package/@qorechain/qoreseal).
- [EVM precompiles](/developer-guide/evm-precompiles) و[المرجع عبر الآلات الافتراضية](/developer-guide/cross-vm-reference).
- [الورشة 2](/build-before-qday/workshop-2) لنافذة EVM والخزنة.
