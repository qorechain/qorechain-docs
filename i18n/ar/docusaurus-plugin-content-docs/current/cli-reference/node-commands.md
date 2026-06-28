---
slug: /cli-reference/node-commands
title: أوامر العُقدة
sidebar_label: أوامر العُقدة
sidebar_position: 1
---

# أوامر العُقدة

مرجع لأوامر `qorechaind` المستخدمة لتهيئة عُقدة QoreChain وإعدادها وتشغيلها.

:::note
تشغّل QoreChain شبكتين: الشبكة الرئيسية **`qorechain-vladi`** (الحيّة منذ 7 يونيو 2026 على إصدار السلسلة **v3.1.80**) وشبكة الاختبار **`qorechain-diana`**. مرّر الـ `--chain-id` المناسب للشبكة التي تنوي الانضمام إليها — تستهدف الأمثلة أدناه شبكة الاختبار؛ استخدم `--chain-id qorechain-vladi` للشبكة الرئيسية.
:::

---

## init

تهيئة عُقدة جديدة بالاسم المستعار المُعطى.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| العَلَم          | النوع   | الوصف                                    |
| ------------- | ------ | ---------------------------------------------- |
| `--chain-id`  | string | معرّف السلسلة (مطلوب)                    |
| `--home`      | string | دليل المنزل للعُقدة (الافتراضي: `~/.qorechaind`) |
| `--overwrite` | bool   | استبدال ملفات التكوين والتكوين الأولي (genesis) الموجودة    |

ينشئ بنية الأدلة ضمن `--home` مع `config/` و`data/` وملف `genesis.json` أولي.

---

## start

تشغيل العُقدة وبدء المزامنة أو إنتاج الكتل.

```bash
qorechaind start [flags]
```

| العَلَم                   | النوع   | الوصف                                          |
| ---------------------- | ------ | ---------------------------------------------------- |
| `--home`               | string | دليل المنزل للعُقدة                                  |
| `--minimum-gas-prices` | string | الحد الأدنى لأسعار الغاز المقبولة (مثل `0.001uqor`)     |
| `--pruning`            | string | استراتيجية التقليم: `default` و`nothing` و`everything` |
| `--halt-height`        | uint   | إيقاف العُقدة عند ارتفاع الكتلة هذا                   |
| `--halt-time`          | uint   | إيقاف العُقدة عند طابع Unix الزمني هذا                 |
| `--log_level`          | string | مستوى تفصيل السجل: `info` و`debug` و`warn` و`error`      |
| `--trace`              | bool   | تفعيل تتبّع المكدّس الكامل عند الأخطاء                    |

---

## version

طباعة إصدار البرنامج الثنائي `qorechaind` ومعلومات البناء.

```bash
qorechaind version
```

استخدم `--long` للحصول على تفاصيل بناء موسّعة تشمل إصدار Go وتجزئة الـ commit وعلامات البناء:

```bash
qorechaind version --long
```

---

## status

استعلام عن العُقدة قيد التشغيل لمعرفة حالتها الحالية، بما في ذلك حالة المزامنة وأحدث ارتفاع للكتلة ومعلومات الإجماع.

```bash
qorechaind status
```

| العَلَم     | النوع   | الوصف                                     |
| -------- | ------ | ----------------------------------------------- |
| `--node` | string | نقطة نهاية RPC (الافتراضي: `tcp://localhost:26657`) |

يُرجع JSON يحتوي على أقسام `node_info` و`sync_info` و`validator_info`.

---

## config

قراءة أو كتابة القيم في تكوين العُقدة.

### تعيين قيمة تكوين

```bash
qorechaind config set <key> <value>
```

### الحصول على قيمة تكوين

```bash
qorechaind config get <key>
```

تشمل مفاتيح التكوين الشائعة `chain-id` و`keyring-backend` و`output` و`node`.

---

## keys

إدارة سلسلة المفاتيح المحلية لتوقيع المعاملات.

### إضافة مفتاح جديد

```bash
qorechaind keys add <name> [flags]
```

| العَلَم                   | النوع   | الوصف                                     |
| ---------------------- | ------ | ----------------------------------------------- |
| `--keyring-backend`    | string | الخلفية: `os` و`file` و`test`                   |
| `--algo`               | string | خوارزمية المفتاح: `secp256k1` (الافتراضية)، `ed25519` |
| `--recover`            | bool   | استعادة المفتاح من العبارة التذكيرية (mnemonic)                       |
| `--multisig`           | string | قائمة مفاتيح مفصولة بفواصل للتوقيع المتعدد       |
| `--multisig-threshold` | uint   | الحد الأدنى للتواقيع المطلوبة                     |

### عرض جميع المفاتيح

```bash
qorechaind keys list --keyring-backend <backend>
```

### عرض تفاصيل المفتاح

```bash
qorechaind keys show <name> [flags]
```

| العَلَم        | النوع   | الوصف                         |
| ----------- | ------ | ----------------------------------- |
| `--bech`    | string | تنسيق الإخراج: `acc` و`val` و`cons` |
| `--address` | bool   | عرض العنوان فقط                   |
| `--pubkey`  | bool   | عرض المفتاح العام فقط                |

### حذف مفتاح

```bash
qorechaind keys delete <name> --keyring-backend <backend>
```

### تصدير مفتاح (مشفّر بالدرع Armor)

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

### إضافة حساب تكوين أولي

```bash
qorechaind genesis add-genesis-account <address> <coins> [flags]
```

| العَلَم                 | النوع   | الوصف                       |
| -------------------- | ------ | --------------------------------- |
| `--vesting-amount`   | string | مبلغ الاستحقاق التدريجي (vesting)                    |
| `--vesting-end-time` | int    | وقت انتهاء الاستحقاق التدريجي (طابع Unix الزمني) |

### إنشاء معاملة تكوين أولي

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| العَلَم                    | النوع   | الوصف             |
| ----------------------- | ------ | ----------------------- |
| `--chain-id`            | string | معرّف السلسلة        |
| `--moniker`             | string | الاسم المستعار للمدقق       |
| `--commission-rate`     | string | معدل العمولة الأولي |
| `--commission-max-rate` | string | الحد الأقصى لمعدل العمولة |

### تجميع معاملات التكوين الأولي

```bash
qorechaind genesis collect-gentxs
```

### التحقق من ملف التكوين الأولي

```bash
qorechaind genesis validate-genesis
```

---

## محرك الإجماع

تتفاعل هذه الأوامر الفرعية مع طبقة محرك الإجماع في QoreChain.

### عرض مفتاح المدقق

```bash
qorechaind comet show-validator
```

يُخرج المفتاح العام للإجماع بتنسيق JSON. يُستخدم للتحقق من هوية المدقق.

### عرض معرّف العُقدة

```bash
qorechaind comet show-node-id
```

يُخرج معرّف عُقدة الـ P2P (مُرمَّزًا بنظام السداسي عشري). يُستخدم لإعداد النظراء الدائمين.

---

## export

تصدير حالة السلسلة الحالية كملف تكوين أولي بصيغة JSON. مفيد لترقيات السلسلة أو اللقطات (snapshots).

```bash
qorechaind export [flags]
```

| العَلَم                | النوع   | الوصف                               |
| ------------------- | ------ | ----------------------------------------- |
| `--for-zero-height` | bool   | تجهيز التصدير لإعادة التشغيل عند الارتفاع 0 |
| `--height`          | int    | تصدير الحالة عند ارتفاع كتلة محدد   |
| `--home`            | string | دليل المنزل للعُقدة                       |

---

## rollback

التراجع بحالة السلسلة كتلة واحدة. مفيد للتعافي من فشل في الإجماع.

```bash
qorechaind rollback [flags]
```

| العَلَم     | النوع   | الوصف                                        |
| -------- | ------ | -------------------------------------------------- |
| `--hard` | bool   | إزالة الكتلة الأخيرة من متجر الكتل أيضًا |
| `--home` | string | دليل المنزل للعُقدة                                |

يتراجع هذا الأمر عن كل من حالة التطبيق وحالة الإجماع. استخدمه بحذر، فلا يمكن التراجع عنه.
