---
slug: /qorel/quickstart
title: البدء السريع مع QORel
sidebar_label: البدء السريع
sidebar_position: 4
---

# البدء السريع

يشرح هذا الدليل الترحيل بين شبكة اختبار QoreChain `qorechain-diana` وشبكة اختبار Cosmos Hub العامة (معرّف السلسلة `provider`): التثبيت، والإعداد، وإضافة المفاتيح وتسجيلها، والتحقق من الجاهزية، وتشغيل المُرحِّل، وإرسال أول تحويل. وهو موجّه لمن لم يشغّل مُرحِّلًا من قبل. كل ما هنا على شبكة الاختبار؛ والرموز بلا قيمة.

## الابتكارات {#innovations}

- **الجاهزية حقل واحد.** ينتهي `qorel keys pqc-status` بالحقل `ready_to_relay`. فإذا كان `true` فالمفتاح ما بعد الكمومي مسجّل في السلسلة ويطابق المفتاح المحلي، ولن يرفض المُرحِّل معاملاته بهذا السبب.
- **لا يُرسل شيء عند وجود خلل.** يوقف فحص ما قبل الإرسال المعاملة السيئة قبل وصولها إلى السلسلة، فخطوة فائتة لا تكلّف أي رسم.
- **التدفق نفسه لكل سلسلة.** خطوات جانب Cosmos Hub هي خطوات Hermes نفسها؛ والجديد فقط هو مدخل سلسلة QoreChain وخطوة التسجيل.

## كيفية الاستخدام {#how-to-use}

### 1. التثبيت {#step-install}

ثبّت `qorel` بأي طريقة في صفحة [التثبيت](/qorel/install) وتحقق منه:

```bash
qorel --version
```

### 2. احصل على ملف الإعدادات {#step-config}

انسخ ملف الإعدادات النموذجي من المستودع (`packaging/config.example.toml`؛ وتضعه حزمتا `.deb` و`.rpm` في `/etc/qorel/config.example.toml`):

```bash
mkdir -p ~/.hermes
curl -o ~/.hermes/config.toml https://raw.githubusercontent.com/qorechain/QORel/main/packaging/config.example.toml
```

افتح `~/.hermes/config.toml` واستبدل العناصر النائبة لعقدة QoreChain (`YOUR-QORECHAIN-NODE`) بعناوين RPC وgRPC وWebSocket لعقدة شبكة اختبار تشغّلها. ليس لدى QoreChain نقطة gRPC عامة، فتحتاج إلى عقدتك الخاصة؛ راجع [تشغيل عقدة](/developer-guide/running-a-node) و[الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet). كل إعداد مشروح في [الإعدادات](/qorel/configuration).

يحتوي ملف الإعدادات النموذجي على سلسلتين: `qorechain-diana` مع `signing = 'qorechain-hybrid'`، و`provider` مع التوقيع القياسي الافتراضي. ويقصر الترحيل على `transfer/channel-0` في QoreChain و`transfer/channel-600` في شبكة اختبار Hub.

### 3. أنشئ حسابات المُرحِّل ومَوِّلها {#step-accounts}

أنشئ حسابًا جديدًا للمُرحِّل على كل سلسلة. استخدم حسابًا مخصصًا، ولا تستخدم أبدًا مفتاح مشغّل مدقّق. احفظ العبارة السرية لكل حساب في ملف لا يقرؤه غيرك:

```bash
umask 077
nano ./diana.mnemonic       # paste the mnemonic, save
nano ./provider.mnemonic
```

يمكن للعبارة السرية نفسها أن تخدم السلسلتين، أو يمكنك استخدام عبارة مستقلة لكل منهما. يشتق QORel بنوع العملة 118 (`m/44'/118'/0'/0/0`) افتراضيًا؛ مرّر `--hd-path` إلى `keys add` إذا كان حسابك يستخدم مسارًا آخر.

أضف المفاتيح:

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./diana.mnemonic
qorel keys add --chain provider        --key-name relayer --mnemonic-file ./provider.mnemonic
```

على `qorechain-diana`، يشتق `keys add` أيضًا مفتاح ML-DSA-87 من العبارة السرية نفسها ويخزّن بذرته بجانب المفتاح باسم `relayer.pqc`. احذف ملفات العبارات السرية عند الانتهاء.

ثم موّل الحسابات. اعرض العناوين بالأمر `qorel keys list --chain <id>`. يأتي QOR الخاص بشبكة الاختبار من [صنبور لوحة التحكم](/dashboard/faucet)؛ وتأتي رموز الاختبار لشبكة اختبار Hub من الصنبور العام لتلك الشبكة. تكفي رموز قليلة للرسوم: الحد الأدنى في QoreChain هو 0.1 uqor لكل وحدة غاز، فتكلّف معاملة بحد الغاز الافتراضي 400,000 نحو 40,000 uqor بالسعر الأدنى. تحقق بالأمرين:

```bash
qorel keys balance --chain qorechain-diana
qorel keys balance --chain provider
```

### 4. سجّل المفتاح ما بعد الكمومي {#step-register}

لا تقبل QoreChain معاملة موقّعة هجينًا إلا من حساب سجّل مفتاحه العام ML-DSA-87. ويتم التسجيل مرة واحدة:

```bash
qorel keys register-pqc --chain qorechain-diana
```

يرسل معاملة واحدة، موقّعة بالمفتاح الكلاسيكي وحده (وهو النوع الوحيد من المعاملات الذي تقبله QoreChain هكذا)، مع إثبات حيازة. ومن الآمن تشغيله مرة أخرى: فإذا كان المفتاح نفسه مسجّلًا فلا يرسل شيئًا. وإذا كان للحساب مفتاح ما بعد كمومي مختلف مسجّلًا، فإنه يرفض ولا يرسل شيئًا.

تحقق من الجاهزية:

```bash
qorel keys pqc-status --chain qorechain-diana
```

النتيجة كائن JSON بالحقول `chain_id` و`account` و`local_public_key_sha256` و`registered` و`matches_local_key` و`registered_public_key_sha256` و`possession_proven` و`sign_bytes` و`ready_to_relay`. تابع فقط عندما تكون `ready_to_relay` هي `true`. راجع [استكشاف الأخطاء وإصلاحها](/qorel/troubleshooting) إن لم تكن كذلك.

### 5. فحص السلامة {#step-health}

```bash
qorel health-check
```

يفحص الإعدادات والاتصال بكل سلسلة، ويبلّغ عن مضاعِف غاز أقل من 1.1 على مدخل QoreChain بوصفه خطأ محتملًا في الإعداد (تحذير؛ والترحيل يظل يعمل).

### 6. اختر القناة {#step-channel}

لدى شبكة الاختبار قناة تحويل قائمة بالفعل: `channel-0` على `qorechain-diana`، وطرفها المقابل `channel-600` على `provider` ([قناة الاختبار](/user-guide/bridging-assets#ibc-test-channel)). لترحيلها، انتقل مباشرة إلى الخطوة 7.

لإنشاء قناة جديدة خاصة بك بين السلسلتين بدلًا من ذلك:

```bash
qorel create channel \
  --a-chain qorechain-diana --b-chain provider \
  --a-port transfer --b-port transfer \
  --new-client-connection
```

يُنشئ `--new-client-connection` أيضًا العميلين الخفيفين والاتصال. وهذا يرسل عدة معاملات على كل سلسلة. ويطبع الأمر معرّفات القناة الجديدة؛ ضعها في `packet_filter` في مدخلي السلسلتين.

### 7. شغّل المُرحِّل {#step-start}

```bash
qorel start
```

اتركه يعمل (استخدم خدمة systemd أو حاوية لمُرحِّل طويل الأمد؛ راجع [التشغيل بجانب مدقّق](/qorel/running-next-to-a-validator)). يرحّل QORel الحزم، ويحدّث العملاء الخفيفين، ويراقب سوء السلوك.

### 8. أرسل أول تحويل {#step-transfer}

في طرفية ثانية، أرسل 1000 uqor من QoreChain إلى شبكة اختبار Hub. يوقّع QORel هذه المعاملة ويرسلها بنفسه، بالتوقيع الهجين نفسه:

```bash
qorel tx ft-transfer \
  --src-chain qorechain-diana --dst-chain provider \
  --src-port transfer --src-channel channel-0 \
  --amount 1000 --denom uqor \
  --timeout-seconds 600 \
  --receiver <a cosmos address on the Hub testnet>
```

بدون `--receiver` تذهب الرموز إلى عنوان المُرحِّل نفسه على سلسلة الوجهة. ثم تابع الحزمة:

```bash
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

تبقى الحزمة مدرجة إلى أن يسلّمها المُرحِّل العامل ويعود الإقرار. وعلى QoreChain يمكنك أيضًا قراءة القناة وتتبّع الرموز عبر REST:

```bash
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
curl -s https://api-testnet.qore.host/ibc/apps/transfer/v1/denoms
```

التحويل الذي لا يُسلَّم قبل انتهاء مهلته يُسترد إلى المُرسِل على سلسلة المصدر بواسطة المُرحِّل. وتمنحه قيمة `--timeout-seconds` أعلاه عشر دقائق.

## كيفية الوصول {#how-to-access}

- **الشبكة.** شبكة الاختبار `qorechain-diana` وشبكة اختبار Cosmos Hub العامة فقط.
- **ما تحتاج إليه.** QORel، وعقدة شبكة اختبار QoreChain تشغّلها (RPC وgRPC وWebSocket)، ونقاط نهاية يمكن الوصول إليها لشبكة اختبار Hub، وحساب مُرحِّل ممول واحد على كل سلسلة، والعبارة السرية لكل منهما في ملف.
- **التكاليف.** رسوم برموز الاختبار فقط: على QoreChain، الغاز مضروبًا في سعر بحد أدنى 0.1 uqor لكل وحدة غاز، دون استرداد للغاز غير المستخدم.
- **مستخدمو الحاويات.** شغّل كل أمر أعلاه بالصيغة `docker run --rm -v $HOME/.qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 <command>`، مع ملفات العبارات السرية داخل المجلد المركَّب، وشغّل `start` بوصفه الحاوية طويلة الأمد ([التثبيت](/qorel/install#container)).

## أين يُنشر {#where-published}

يأتي الملف التنفيذي وملف الإعدادات النموذجي من [مستودع QORel](https://github.com/qorechain/QORel) (`packaging/config.example.toml`)؛ راجع [التثبيت](/qorel/install) لكل القنوات و[نظرة عامة على QORel](/qorel/overview#where-published) للإصدارات.

## الحدود والمشكلات المعروفة {#limits}

- **شبكة الاختبار فقط.** IBC على الشبكة الرئيسية غير مفتوح؛ لا توجّه هذا التدفق إلى الشبكة الرئيسية.
- **تحتاج إلى عقدة QoreChain خاصة بك.** لا توجد نقطة gRPC عامة.
- **القناة الجديدة تكلّف رسومًا على السلسلتين** وتضيف عميلًا واتصالًا. فضّل ترحيل `channel-0` ما لم تحتج إلى قناتك الخاصة.
- **قد تحدّ نقاط النهاية العامة في جانب Hub من المعدل.** يواصل QORel إعادة المحاولة، لكن للترحيل المستمر استخدم عقدك الخاصة.
- **معلّق إلى أن يُرحَّل.** إن لم يكن هناك مُرحِّل قيد التشغيل للقناة، يبقى التحويل معلّقًا إلى أن يُشغَّل مُرحِّل أو تنتهي مهلة الحزمة.

التالي: [الإعدادات](/qorel/configuration)، [المراقبة](/qorel/monitoring)، [استكشاف الأخطاء وإصلاحها](/qorel/troubleshooting).
