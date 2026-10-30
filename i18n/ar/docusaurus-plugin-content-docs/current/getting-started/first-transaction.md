---
slug: /getting-started/first-transaction
title: المعاملة الأولى
sidebar_label: المعاملة الأولى
sidebar_position: 5
---

# المعاملة الأولى

يرشدك هذا الدليل خلال إرسال رموز QOR، والاستعلام عن المعاملات، والتفاعل مع QoreChain عبر واجهاتها الأصلية و EVM و SVM.

:::note
تستخدم الأوامر أدناه شبكة **`qorechain-diana`** للاختبار (معرّف سلسلة EVM **9800**). الشبكة الرئيسية (**`qorechain-vladi`**، معرّف سلسلة EVM **9801**) نشطة منذ 7 يونيو 2026 وتعمل بالإصدار v3.2.5 منذ 29 أكتوبر 2026 (وتعمل شبكة الاختبار بالإصدار v3.2.6 منذ 27 أكتوبر 2026) — استبدل معرّف سلسلة الشبكة الرئيسية ونقاط النهاية من صفحة **الاتصال بالشبكة الرئيسية** عند إجراء المعاملات على الشبكة الرئيسية.
:::

## التحقق من رصيدك

قبل إرسال الرموز، تحقّق من رصيد حسابك:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

تتضمّن الاستجابة جميع فئات الرموز التي يحتفظ بها الحساب. تُعرض أرصدة QOR بوحدة `uqor` (ميكرو-QOR)، حيث **1 QOR = 1,000,000 uqor**.

## إرسال QOR {#send-qor}

يُرسل حساب QoreChain على مسار Cosmos بـ **توقيع هجين**: توقيع secp256k1 الكلاسيكي بالإضافة إلى توقيع ML-DSA-87 (Dilithium-5). يتم رفض أمر `qorechaind tx bank send ... -y` العادي، لذا تُبنى الحوالة غير موقَّعة ثم تُوقَّع توقيعًا مشتركًا. تحتاج إلى مفتاح ما بعد كمومي مسجَّل على حسابك مرة واحدة (انظر [سجّل مفتاحك ما بعد الكمومي](#register-pqc-key) أدناه)، وإلى ملف `qorechaind` الثنائي الرسمي للإصدار من [download.qore.host](https://download.qore.host) (فالملف الثنائي المبني من الشجرة المصدرية العامة لا يستطيع إنشاء توقيع Dilithium أو تطبيقه).

```bash
# 1. Build the unsigned transaction (the fee is fixed here, because cosign signs the fee in this file)
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > tx.json

# 2. Add the ML-DSA-87 signature and broadcast
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

يرسل هذا **1 QOR** (1,000,000 uqor) إلى عنوان المستلم، مع دفع رسوم قدرها 40,000 uqor (0.04 QOR). الحد الأدنى للشبكة هو **0.1 uqor لكل وحدة غاز**، لذا يجب ألا تقل الرسوم عن حد الغاز مضروبًا في 0.1: فـ `--gas 400000` يتطلب `--fees 40000uqor` أو أكثر. تستهلك الحوالة الموقَّعة هجينيًا عادةً ما بين 160,000 و240,000 وحدة غاز لأن التوقيع يضيف نحو 4.7 كيلوبايت إلى المعاملة. يسأل `cosign` العقدة عن صيغة البايتات الموقَّعة التي تتحقق منها الشبكة، لذا يعمل الأمر نفسه على الشبكتين.

### سجّل مفتاحك ما بعد الكمومي {#register-pqc-key}

يُسجَّل المفتاح ما بعد الكمومي **صراحةً**، مرة واحدة لكل حساب. لا تسجّله السلسلة نيابةً عنك عند أول معاملة. ويجوز توقيع معاملة التسجيل نفسها (وكذلك ترحيل المفتاح) بالمفتاح الكلاسيكي وحده كي يتمكن الحساب الجديد كليًا من البدء:

```bash
# generate the ML-DSA-87 key (stored under ~/.qorechaind/pqc/mypqc.dilithium, mode 0600, not encrypted)
qorechaind tx pqc gen-key mypqc

# register the printed public key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

منذ v3.2.3 تقبل السلسلة أيضًا **إثبات حيازة** اختياريًا مع التسجيل، وترفض المفاتيح الضعيفة والمنحلّة والمستخدمة سابقًا. لإرفاق إثبات، سجّل باستخدام `register-key-v2` وسمِّ مفتاحك المحلي:

```bash
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

احتفظ بنسخة احتياطية من ملف مفتاح PQC بعناية مماثلة لعبارة الاسترداد؛ إذ يمكن إعادة اشتقاقه من العبارة باستخدام `qorechaind tx pqc recover-key`. يتولى [QoreX](/qorex/overview) و QoreChain SDK تسجيل المفتاح نيابةً عنك. راجع [إعداد المحفظة](/getting-started/wallet-setup) للاطّلاع على التدفق الهجين الكامل.

:::caution تتطلّب تحويلات Cosmos توقيع PQC هجينًا
في مسار Cosmos، إعداد الشبكة هو `hybrid_signature_mode = required` (تعمل الشبكات الحية على خط الإصدارات v3.2). يتم **رفض** المعاملة الكلاسيكية فقط. لإنتاج التوقيع الهجين خارج واجهة سطر الأوامر، تقوم مكتبة [**qorechain-pqc**](/developer-guide/post-quantum-signing) مفتوحة المصدر (`hybridSignBytes`) و QoreChain SDK بالمكافئ في الشيفرة.
:::

بعد قبول المعاملة الموقَّعة توقيعًا مشتركًا، تُعيد واجهة سطر الأوامر تجزئة المعاملة.

## الاستعلام عن المعاملة

ابحث عن معاملة مكتملة عبر تجزئتها:

```bash
qorechaind query tx <txhash>
```

يتضمّن الإخراج حالة المعاملة، والغاز المستخدم، وارتفاع الكتلة، وجميع الأحداث المنبعثة أثناء التنفيذ.

لإخراج JSON:

```bash
qorechaind query tx <txhash> --output json
```

## استخدام JSON-RPC (EVM)

تعرض بيئة تنفيذ EVM في QoreChain واجهة JSON-RPC قياسية لإيثريوم على المنفذ `8545`.

:::caution تحتاج معاملات EVM إلى نافذة تفويض
لا يزال التوقيع القياسي لإيثريوم (MetaMask، ethers.js، ...) يعمل دون تعديل، لكن منذ v3.2.0 لا يقبل مسار EVM معاملة إلا من حساب لديه **مفتاح ما بعد كمومي مسجَّل** و**نافذة تفويض EVM مفتوحة**. افتح واحدة أولًا (وهي معاملة على مسار Cosmos، موقَّعة بمفتاح ML-DSA الخاص بك) — انظر [نافذة تفويض EVM](#evm-window) أدناه. بدونها تردّ العقدة بـ `no open EVM authorisation window`. قراءة الحالة (`eth_blockNumber` و`eth_getBalance` و`eth_call` و`eth_estimateGas`) لا تحتاج إلى نافذة.
:::

### الحصول على رقم أحدث كتلة

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }' | jq '.result'
```

### الحصول على رصيد حساب

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0xYourEVMAddress", "latest"],
    "id": 1
  }' | jq '.result'
```

يُعاد الرصيد كقيمة مُرمّزة بالنظام الست عشري بأصغر فئة.

### نافذة تفويض EVM {#evm-window}

منذ إصدار السلسلة **v3.2.0** (الشبكة الرئيسية عند الارتفاع 2,981,742، 25 سبتمبر 2026؛ الشبكة التجريبية عند الارتفاع 5,920,000) لا يقبل مسار EVM معاملة إلا من حساب

1. لديه **مفتاح ما بعد كمومي مسجَّل** (ML-DSA-87)، و
2. لديه **نافذة تفويض EVM مفتوحة** ما زال فيها متّسع للمعاملة.

كل ما عدا ذلك في مسار EVM لم يتغيّر: تواصل التوقيع باستخدام MetaMask أو ethers.js أو Hardhat أو Foundry، وتعمل `eth_estimateGas` وسائر عمليات المحاكاة دون نافذة. ويُحتسب نشر العقود كأي معاملة EVM أخرى، لذا تلزم نافذة قبل النشر.

**لماذا نافذة؟** تُنتج المحفظة القياسية توقيع secp256k1 واحدًا على معاملة إيثريوم ولا تمنح التطبيقات أي وسيلة لإرفاق توقيع ثانٍ ما بعد كمومي. لذلك يسبق التفويض ما بعد الكمومي المعاملةَ: تفتح نافذة محدودة بمعاملة عادية على مسار Cosmos، وهي تحمل توقيع ML-DSA الخاص بك، ثم يقبل مسار EVM المعاملات التي تغطيها هذه النافذة. لا يمكن للمفتاح الكلاسيكي وحده أن يفتح نافذة أبدًا، لذا فإن المفتاح الكلاسيكي المسروق لا يستطيع إنفاق سوى ما تسمح به نافذة مفتوحة بالفعل. يعمل ذلك مثل موافقة ERC-20: فوِّض مبلغًا محدودًا لمدة محدودة، ثم تعامل كالمعتاد.

**ما الذي تحدّه النافذة.** تُطبَّق ثلاثة حدود في آنٍ واحد؛ وأيها نفد أولًا أغلق النافذة.

| الحد | المعنى | النطاق المسموح |
| --- | --- | --- |
| `blocks` | المدة التي تبقى فيها النافذة مفتوحة، محسوبة من الكتلة التي تفتحها | 1 – 17,280 |
| `max-txs` | عدد معاملات EVM التي تقبلها | 1 – 1,000 |
| `max-value` | إجمالي التدفق الخارج الذي تقبله، بوحدة uqor: القيمة المحوَّلة **زائد** الحد الأقصى للرسوم التي يمكن أن تدفعها كل معاملة (حد الغاز × سقف الرسوم)، مقرَّبًا إلى الأعلى | أكبر من 0 |

* 17,280 كتلة تعادل نحو 15 ساعة على الشبكة الرئيسية (نحو 3.1 ثانية لكل كتلة) ونحو 6 ساعات على الشبكة التجريبية (نحو 1.3 ثانية لكل كتلة).
* المعاملة التي تُقبل ثم تفشل تستهلك مع ذلك حصتها من الخانات والقيمة.
* فتح نافذة جديدة **يستبدل** السابقة؛ ويبدأ الاستهلاك من الصفر مجددًا.
* تقبل واجهة سطر الأوامر `max-value` بوحدة `uqor` أو `qor` (`1000qor` = 1,000,000,000 uqor).
* يحتسب حد القيمة QOR الأصلي فقط: فتحويل الرموز أو الموافقة أو أي استدعاء عقد آخر يحمل قيمة صفرًا. ولتقييد هذه أيضًا، ضيّق نطاق النافذة (أدناه).

**الخطوة 1 — سجّل مفتاحك ما بعد الكمومي** (مرة واحدة): انظر [سجّل مفتاحك ما بعد الكمومي](#register-pqc-key) أعلاه.

**الخطوة 2 — افتح نافذة.** فتح النافذة معاملة على مسار Cosmos، لذا تُنتَج غير موقَّعة ثم تُوقَّع توقيعًا مشتركًا:

```bash
# at most 1000 QOR in total, at most 20 transactions, for 7,200 blocks (about 6.4 hours on mainnet)
qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**تضييق النطاق (v3.2.3 وما بعده).** تقيّد راياتان اختياريتان ما تقبله النافذة المفتوحة: تقبل `--native-only` تحويلات QOR الأصلية البسيطة فقط (دون بيانات استدعاء، ودون إنشاء عقد، ودون مستلم يحمل شيفرة)، وتقبل `--allowed-targets 0xAAA...,0xBBB...` المعاملات الموجَّهة إلى أولئك المستلمين فقط (16 مستلمًا كحد أقصى؛ ويُرفض حينئذ إنشاء العقود). على سبيل المثال:

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json
```

على الشبكة الرئيسية، استهلك فتح النافذة نحو 180,000 وحدة غاز. وفي [QoreX](/qorex/security-and-recovery#evm-window) تكون هذه الخطوة هي **الإعدادات ← الأمان ← نافذة وصول EVM** (التطبيق) أو زر **نافذة وصول EVM** (الإضافة). يزيد فتح النافذة قيمة nonce لحسابك، لذا افتحها **قبل** أن تجهّز معاملة EVM في محفظتك.

**الخطوة 3 — تحقق مما تبقى:**

```bash
qorechaind query pqc evm-window qor1youraddress...
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/qor1youraddress...
```

لا تفشل استجابة REST أبدًا لعنوان ليس لديه نافذة؛ بل تُعيد `found: false`. الحقول هي `found` و`live` و`opened_height` و`expiry_height` و`max_txs` و`used_txs` و`max_value` و`used_value` و`remaining_blocks` و`remaining_txs` و`remaining_value` (أعداد صحيحة بوحدة uqor، تُعاد كسلاسل نصية). على الشبكة الرئيسية استخدم `https://api.qore.host`.

**الخطوة 4 — استخدم مسار EVM كالمعتاد.** أرسل من MetaMask أو أدواتك كالمعتاد. تستهلك كل معاملة خانة معاملة واحدة و(القيمة + الحد الأقصى للرسوم) من النافذة.

**أغلق النافذة مبكرًا.** إذا اشتبهت في اختراق مفتاحك الكلاسيكي، فأغلق النافذة؛ وما ظلّت تقبله يُرفض ابتداءً من الكتلة التالية. ويُلغي الإغلاق أيضًا أي موافقة معلّقة على تفويض EIP-7702 (منذ v3.2.2؛ فالمعاملة من النوع 4 التي تغيّر شيفرة حساب لا تُقبل إلا بعد موافقة `authorize-evm-delegation` ما بعد كمومية):

```bash
qorechaind tx pqc close-evm-window --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > close.json
qorechaind tx pqc cosign close.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**الأخطاء**

| ما تراه | المعنى | ما يجب فعله |
| --- | --- | --- |
| `no open EVM authorisation window; open one with MsgOpenEVMWindow ...` (الوحدة `pqc`، الرمز 26) | لا توجد نافذة لهذا الحساب | الخطوة 2 |
| `... has no registered post-quantum key; the EVM lane requires one` (الرمز 26 على مسار EVM؛ والرمز 28 إذا حاولت فتح نافذة) | لم يُسجَّل مفتاح ML-DSA | الخطوة 1 |
| `the EVM authorisation window for ... does not admit this transaction (remaining: ...)` (الرمز 27) | منتهية أو مستنفدة؛ وتُظهر الرسالة أي حد تحديدًا | افتح نافذة جديدة |
| `invalid EVM authorisation window` (الرمز 28) | حدود خارج النطاق (`blocks` 1–17,280، و`max-txs` 1–1,000، و`max-value` > 0) | صحّح المعاملات |

من الشيفرة، يمكن لـ QoreChain SDK و`@qorechain/wallet-adapter` تركيب رسائل الفتح والإغلاق وقراءة حالة النافذة؛ انظر [توثيق SDK](/sdk/overview).

تنطبق النافذة على مسار EVM فقط. معاملات مسار Cosmos تحمل التوقيع الهجين في كل معاملة أصلًا، وإذا لم تفتح نافذة قط فإن معاملات EVM الخاصة بك تُرفض بينما لا يتغيّر أي شيء آخر.

## استخدام SVM RPC

تعرض بيئة تنفيذ SVM في QoreChain واجهة RPC متوافقة مع سولانا على المنفذ `8899`. مسار معاملات SVM معطّل حاليًا على مستوى الشبكة بأكملها، لذا فإن طرق القراءة هذه هي الجزء الذي يمكنك استخدامه اليوم.

### الحصول على الفتحة الحالية

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getSlot",
    "id": 1
  }' | jq '.result'
```

### الحصول على رصيد حساب

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["YourSVMPublicKey"],
    "id": 1
  }' | jq '.result'
```

## أنماط واجهة سطر الأوامر الشائعة

عند العمل مع واجهة سطر أوامر `qorechaind`، تُستخدم هذه الرايات بشكل متكرر:

| الراية               | الوصف                   | مثال                        |
| ------------------ | ----------------------------- | ------------------------------ |
| `--chain-id`       | يحدّد السلسلة المستهدفة    | `--chain-id qorechain-diana`   |
| `--fees`           | رسوم المعاملة بوحدة uqor (حد الغاز × 0.1 على الأقل) | `--fees 40000uqor`  |
| `--from`           | اسم مفتاح التوقيع أو العنوان   | `--from mykey`                 |
| `--output`         | تنسيق الاستجابة               | `--output json`                |
| `--node`           | نقطة نهاية RPC للاتصال بها    | `--node tcp://localhost:26657` |
| `--gas`            | حدّ الغاز للمعاملة | `--gas 400000` (أو `--gas auto`) |
| `--gas-adjustment` | مضاعف للغاز المُقدّر  | `--gas-adjustment 1.5`         |
| `--gas-prices`     | سعر الغاز بدلًا من `--fees` | `--gas-prices 0.1uqor`         |
| `--generate-only`  | يطبع المعاملة غير الموقَّعة (مطلوب قبل `tx pqc cosign`) | `--generate-only` |
| `-y`               | تخطّي مطالبة التأكيد      | `-y`                           |

### مثال: أمر كامل مع جميع الرايات الشائعة

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --node tcp://localhost:26657 \
  --output json \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

## الخطوات التالية

الآن وقد أرسلت معاملتك الأولى، استكشف المزيد ممّا تقدّمه QoreChain:

* **التخزين والتفويض** — قم بتخزين QOR للمساعدة في تأمين الشبكة واحصل على مكافآت التخزين
* **جسر الأصول** — انقل الأصول عبر السلاسل
* **تطوير EVM** — انشر عقود Solidity الذكية على QoreChain
