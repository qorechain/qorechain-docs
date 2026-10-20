---
slug: /cli-reference/node-commands
title: أوامر العقدة
sidebar_label: أوامر العقدة
sidebar_position: 1
---

# أوامر العقدة

مرجع لأوامر `qorechaind` المستخدمة لتهيئة عقدة QoreChain وضبطها وتشغيلها.

:::note
تُشغّل QoreChain شبكتين: الشبكة الرئيسية **`qorechain-vladi`** (تعمل منذ 7 يونيو 2026؛ إصدار العقدة **v3.2.3**، طُبّق عند الارتفاع 3,662,051 في 20 أكتوبر 2026) والشبكة التجريبية **`qorechain-diana`** (إصدار العقدة **v3.2.4**، طُبّق عند الارتفاع 8,337,253 في 19 أكتوبر 2026؛ الإصدار v3.2.4 لم يُطبَّق بعد على الشبكة الرئيسية؛ ومن شأن مقترح الحوكمة 13 أن يطبّقه عند الارتفاع 3,742,566). مرّر قيمة `--chain-id` المناسبة للشبكة التي تريد الانضمام إليها — الأمثلة أدناه تستهدف الشبكة التجريبية؛ استخدم `--chain-id qorechain-vladi` للشبكة الرئيسية. الإصدار الحالي لكل شبكة مدرج في `latest.json` ضمن [download.qore.host](https://download.qore.host).

جرى التحقق من الأوامر في هذه الصفحة مقابل الملف الثنائي للإصدار v3.2.3، وهو إصدار الشبكة الرئيسية. ويضيف الملف الثنائي v3.2.4 للشبكة التجريبية أوامر ليست موجودة على الشبكة الرئيسية؛ وحيثما يذكر هذا الدليل أحدها فإنه يُوسَم بعبارة **للشبكة التجريبية فقط**.
:::

---

## init

تهيئة عقدة جديدة بالاسم المستعار المحدد.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| العلم         | النوع  | الوصف                                          |
| ------------- | ------ | ----------------------------------------------- |
| `--chain-id`  | string | معرّف السلسلة (مرّره دائمًا؛ يُنشأ معرّف عشوائي إذا حُذف) |
| `--home`      | string | دليل العقدة الرئيسي (الافتراضي: `~/.qorechaind`) |
| `--overwrite` | bool   | استبدال ملف `genesis.json` الحالي |
| `--recover`   | bool   | تقديم عبارة استرداد (seed phrase) لاسترداد مفتاح موجود بدلًا من إنشاء مفتاح جديد |

ينشئ هيكل الدليل ضمن `--home` مع `config/` و`data/` وملف `genesis.json` أولي. بالنسبة إلى عقدة شبكة، استبدل ملف `genesis.json` هذا بملف التكوين الأولي (genesis) الخاص بالشبكة قبل البدء (انظر [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet)).

يكتب `init` أيضًا معرّف سلسلة EVM الخاص بالشبكة (`9801` للشبكة `qorechain-vladi`، و`9800` للشبكة `qorechain-diana`) في الإعداد `evm-chain-id` داخل `app.toml`، لذا مرّر قيمة `--chain-id` الصحيحة.

---

## start

بدء تشغيل العقدة والشروع في المزامنة أو إنتاج الكتل.

```bash
qorechaind start [flags]
```

| العلم                   | النوع  | الوصف                                                |
| ---------------------- | ------ | ------------------------------------------------------ |
| `--home`               | string | دليل العقدة الرئيسي                                    |
| `--minimum-gas-prices` | string | الحد الأدنى لسعر الغاز الذي تقبله هذه العقدة. الحد الأدنى للشبكة هو `0.1uqor`؛ اضبط هذه القيمة عند هذا الحد على الأقل |
| `--pruning`            | string | استراتيجية التقليم: `default`، `nothing`، `everything`، `custom` (مع `--pruning-keep-recent` و`--pruning-interval`) |
| `--halt-height`        | uint   | إيقاف العقدة عند هذا الارتفاع للكتلة                    |
| `--halt-time`          | uint   | إيقاف العقدة عند هذا الطابع الزمني من نوع Unix          |
| `--log_level`          | string | مستوى تفصيل السجلّ: `info`، `debug`، `warn`، `error`   |
| `--trace`              | bool   | تفعيل تتبّع المكدّس الكامل عند حدوث أخطاء               |

الملف الثنائي المبني من شجرة المصدر العامة (بناء المجتمع) يرفض البدء على `qorechain-vladi` أو `qorechain-diana`: فهو لا يستطيع التحقق من التوقيعات ما بعد الكمومية ولا يستطيع إعادة تشغيل كتل الشبكتين بأمانة (إصدار العقدة v3.2.3 وما بعده). استخدم الملف الثنائي للإصدار من [download.qore.host](https://download.qore.host)؛ انظر [البناء من المصدر](/developer-guide/building-from-source).

---

## version

لا يُبلغ `qorechaind version` عن رقم الإصدار في الملفات الثنائية للإصدارات: فهو يطبع سطرًا فارغًا، ولا يضيف `version --long` أي تفاصيل بناء. لا تعتمد عليه للتمييز بين الإصدارات. للتأكد مما تشغّله:

- قارن SHA-256 للأرشيف **الذي نزّلته** مع `binary.sha256` في [البيان (manifest)](https://download.qore.host/mainnet/latest.json) الخاص بالشبكة قبل فك ضغطه (واحتفظ بذلك الأرشيف، أو بمجموعه الاختباري، كسجل لما ثبّتّه).
- اسأل السلسلة عن الترقيات التي طبّقتها: يُرجع `GET /cosmos/upgrade/v1beta1/applied_plan/<upgrade_name>` الارتفاع الذي طُبّقت عنده الترقية، أو `0` إن لم تُطبَّق.

```bash
# archive checksum, as published
curl -s https://download.qore.host/mainnet/latest.json | jq -r '.version, .binary.sha256'
# has v3.2.3 been applied on mainnet, and at which height?
curl -s https://api.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.3   # {"height":"3662051"}
```

---

## status

استعلام العقدة قيد التشغيل عن حالتها الحالية، بما في ذلك حالة المزامنة وأحدث ارتفاع للكتلة ومعلومات الإجماع.

```bash
qorechaind status
```

| العلم    | النوع  | الوصف                                             |
| -------- | ------ | ---------------------------------------------------- |
| `--node` | string | نقطة نهاية RPC (الافتراضي: `tcp://localhost:26657`) |

تُعيد JSON يحتوي على أقسام `node_info` و`sync_info` و`validator_info`.

---

## client configuration

لا يوجد أمر فرعي `config`. تُقرأ القيم الافتراضية للعميل (`chain-id` و`keyring-backend` و`output` و`node`) من الملف `<home>/config/client.toml`؛ عدّل هذا الملف، أو مرّر العلم مع كل أمر (`--chain-id` و`--keyring-backend` و`--output` و`--node`).

---

## keys

إدارة سلسلة المفاتيح المحلية لتوقيع المعاملات.

### إضافة مفتاح جديد

```bash
qorechaind keys add <name> [flags]
```

| العلم                   | النوع  | الوصف                                             |
| ---------------------- | ------ | ------------------------------------------------- |
| `--keyring-backend`    | string | الخلفية: `os`، `file`، `kwallet`، `pass`، `test`، `memory` |
| `--key-type`           | string | خوارزمية المفتاح: `secp256k1` (الافتراضي) أو `eth_secp256k1` |
| `--coin-type`          | uint32 | نوع العملة في HD (الافتراضي `118`)                 |
| `--recover`            | bool   | استرداد المفتاح من العبارة التذكارية (mnemonic)    |
| `--multisig`           | string | قائمة مفاتيح مفصولة بفواصل للتوقيع المتعدد          |
| `--multisig-threshold` | uint   | الحد الأدنى للتوقيعات المطلوبة                     |

### سرد جميع المفاتيح

```bash
qorechaind keys list --keyring-backend <backend>
```

### عرض تفاصيل مفتاح

```bash
qorechaind keys show <name> [flags]
```

| العلم       | النوع  | الوصف                                    |
| ----------- | ------ | ------------------------------------------- |
| `--bech`    | string | صيغة الإخراج: `acc`، `val`، `cons`         |
| `--address` | bool   | عرض العنوان فقط                            |
| `--pubkey`  | bool   | عرض المفتاح العام فقط                      |

### حذف مفتاح

```bash
qorechaind keys delete <name> --keyring-backend <backend>
```

### تصدير مفتاح (مشفّر بدرع Armor)

```bash
qorechaind keys export <name>
```

### استيراد مفتاح

```bash
qorechaind keys import <name> <keyfile>
```

---

## genesis

إدارة ملف التكوين الأولي (genesis).

### إضافة حساب في ملف التكوين الأولي

```bash
qorechaind genesis add-genesis-account <address> <coins> [flags]
```

| العلم                 | النوع  | الوصف                                  |
| -------------------- | ------ | ------------------------------------------ |
| `--vesting-amount`   | string | مبلغ الاستحقاق التدريجي (vesting)        |
| `--vesting-start-time` | int  | وقت بدء الاستحقاق التدريجي (طابع زمني من نوع Unix) |
| `--vesting-end-time` | int    | وقت انتهاء الاستحقاق التدريجي (طابع زمني من نوع Unix) |

### إنشاء معاملة تكوين أولي (genesis)

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| العلم                    | النوع  | الوصف                     |
| ----------------------- | ------ | ---------------------------- |
| `--chain-id`            | string | معرّف السلسلة                |
| `--moniker`             | string | الاسم المستعار للمدقّق (validator) |
| `--commission-rate`     | string | معدّل العمولة الأولي         |
| `--commission-max-rate` | string | الحد الأقصى لمعدّل العمولة    |

### تجميع معاملات التكوين الأولي

```bash
qorechaind genesis collect-gentxs
```

الأوامر الفرعية الأخرى لـ `genesis`: `bulk-add-genesis-account` و`migrate`.

### التحقق من صحة ملف التكوين الأولي

```bash
qorechaind genesis validate
```

---

## محرّك الإجماع

تتفاعل هذه الأوامر الفرعية مع طبقة محرّك الإجماع الخاصة بـ QoreChain.

### عرض مفتاح المدقّق

```bash
qorechaind comet show-validator
```

يُخرج مفتاح الإجماع العام بصيغة JSON. يُستخدم للتحقق من هوية المدقّق (validator).

### عرض معرّف العقدة

```bash
qorechaind comet show-node-id
```

يُخرج معرّف عقدة الشبكة النظيرة (P2P) بترميز سداسي عشري. يُستخدم لتكوين النظراء الدائمين (persistent peers).

---

## export

تصدير حالة السلسلة الحالية كملف JSON للتكوين الأولي (genesis). مفيد لترقيات السلسلة أو اللقطات (snapshots).

```bash
qorechaind export [flags]
```

| العلم                | النوع  | الوصف                                     |
| ------------------- | ------ | --------------------------------------------- |
| `--for-zero-height` | bool   | تجهيز التصدير لإعادة التشغيل من الارتفاع صفر |
| `--height`          | int    | تصدير الحالة عند ارتفاع كتلة محدد            |
| `--home`            | string | دليل العقدة الرئيسي                           |
| `--output-document` | string | كتابة ناتج التصدير في هذا الملف بدلًا من STDOUT |
| `--modules-to-export` | strings | قائمة مفصولة بفواصل بالوحدات المراد تصديرها (الافتراضي: الكل) |
| `--jail-allowed-addrs` | strings | عناوين المشغّلين للمدقّقين المسجونين (jailed) المراد إلغاء سجنهم |

---

## rollback

التراجع بحالة السلسلة كتلة واحدة إلى الخلف. مفيد للتعافي من فشل في الإجماع.

```bash
qorechaind rollback [flags]
```

| العلم    | النوع  | الوصف                                              |
| -------- | ------ | ------------------------------------------------------ |
| `--hard` | bool   | إزالة آخر كتلة من مخزن الكتل أيضًا                     |
| `--home` | string | دليل العقدة الرئيسي                                    |

يُرجع هذا الأمر كلًا من حالة التطبيق وحالة الإجماع إلى الوراء معًا. استخدمه بحذر، فلا يمكن التراجع عنه.
