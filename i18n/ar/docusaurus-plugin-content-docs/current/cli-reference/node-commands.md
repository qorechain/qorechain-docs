---
slug: /cli-reference/node-commands
title: أوامر العقدة
sidebar_label: أوامر العقدة
sidebar_position: 1
---

# أوامر العقدة

مرجع لأوامر `qorechaind` المستخدمة لتهيئة عقدة QoreChain وضبطها وتشغيلها.

:::note
تُشغّل QoreChain شبكتين: الشبكة الرئيسية **`qorechain-vladi`** (تعمل منذ 7 يونيو 2026 على إصدار السلسلة **v3.1.92**) والشبكة التجريبية **`qorechain-diana`**. مرّر قيمة `--chain-id` المناسبة للشبكة التي تريد الانضمام إليها — الأمثلة أدناه تستهدف الشبكة التجريبية؛ استخدم `--chain-id qorechain-vladi` للشبكة الرئيسية.
:::

---

## init

تهيئة عقدة جديدة بالاسم المستعار المحدد.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| العلم         | النوع  | الوصف                                          |
| ------------- | ------ | ----------------------------------------------- |
| `--chain-id`  | string | معرّف السلسلة (مطلوب)                          |
| `--home`      | string | دليل العقدة الرئيسي (الافتراضي: `~/.qorechaind`) |
| `--overwrite` | bool   | استبدال ملفات التكوين وملف التكوين الأولي (genesis) الحالية |

ينشئ هيكل الدليل ضمن `--home` مع `config/` و`data/` وملف `genesis.json` أولي.

---

## start

بدء تشغيل العقدة والشروع في المزامنة أو إنتاج الكتل.

```bash
qorechaind start [flags]
```

| العلم                   | النوع  | الوصف                                                |
| ---------------------- | ------ | ------------------------------------------------------ |
| `--home`               | string | دليل العقدة الرئيسي                                    |
| `--minimum-gas-prices` | string | الحد الأدنى لأسعار الغاز المقبولة (مثال: `0.001uqor`) |
| `--pruning`            | string | استراتيجية التقليم: `default`، `nothing`، `everything` |
| `--halt-height`        | uint   | إيقاف العقدة عند هذا الارتفاع للكتلة                    |
| `--halt-time`          | uint   | إيقاف العقدة عند هذه الطابع الزمني من نوع Unix          |
| `--log_level`          | string | مستوى تفصيل السجلّ: `info`، `debug`، `warn`، `error`   |
| `--trace`              | bool   | تفعيل تتبّع المكدّس الكامل عند حدوث أخطاء               |

---

## version

طباعة إصدار الملف الثنائي `qorechaind` ومعلومات البناء.

```bash
qorechaind version
```

استخدم `--long` للحصول على تفاصيل بناء موسّعة تشمل إصدار Go وتجزئة الالتزام (commit hash) وعلامات البناء:

```bash
qorechaind version --long
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

## config

قراءة أو كتابة قيم في تكوين العقدة.

### ضبط قيمة تكوين

```bash
qorechaind config set <key> <value>
```

### الحصول على قيمة تكوين

```bash
qorechaind config get <key>
```

مفاتيح التكوين الشائعة تشمل `chain-id` و`keyring-backend` و`output` و`node`.

---

## keys

إدارة سلسلة المفاتيح المحلية لتوقيع المعاملات.

### إضافة مفتاح جديد

```bash
qorechaind keys add <name> [flags]
```

| العلم                   | النوع  | الوصف                                             |
| ---------------------- | ------ | ------------------------------------------------- |
| `--keyring-backend`    | string | الخلفية: `os`، `file`، `test`                     |
| `--algo`               | string | خوارزمية المفتاح: `secp256k1` (الافتراضي)، `ed25519` |
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

### التحقق من صحة ملف التكوين الأولي

```bash
qorechaind genesis validate-genesis
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
