---
slug: /cli-reference/transaction-commands
title: أوامر المعاملات
sidebar_label: أوامر المعاملات
sidebar_position: 2
---

# أوامر المعاملات

تتبع جميع أوامر المعاملات النمط التالي:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
اضبط `--chain-id qorechain-vladi` للبث على الشبكة الرئيسية الحية (إصدار السلسلة **v3.1.95**)، أو `--chain-id qorechain-diana` لشبكة الاختبار. إذا تم حذف هذه القيمة، يستخدم العميل `chain-id` من إعداداتك المحلية.
:::

تنطبق الأعلام الشائعة على كل أمر فرعي من أوامر `tx`:

| العلم                | النوع  | الوصف                                            |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | اسم أو عنوان مفتاح التوقيع                        |
| `--chain-id`        | string | معرّف السلسلة (الافتراضي: من الإعدادات)           |
| `--fees`            | string | رسوم المعاملة (مثلاً `500uqor`)                   |
| `--gas`             | string | حد الغاز أو `auto` للتقدير التلقائي               |
| `--gas-adjustment`  | float  | مضاعف الغاز عند استخدام `auto` (الافتراضي: 1.0)   |
| `--keyring-backend` | string | خلفية حلقة المفاتيح: `os`، `file`، `test`         |
| `--node`            | string | نقطة نهاية RPC (الافتراضي: `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync` أو `async` أو `block`                      |
| `-y`                | bool   | تخطي مطالبة التأكيد                               |

---

## bank

### send

تحويل الرموز المميزة من حساب إلى آخر.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

إنشاء مدقّق جديد على الشبكة.

```bash
qorechaind tx staking create-validator [flags]
```

| العلم                          | النوع  | الوصف                                          |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | مبلغ التفويض الذاتي (مثلاً `1000000uqor`)      |
| `--pubkey`                     | string | المفتاح العام لإجماع المدقّق (JSON)            |
| `--moniker`                    | string | الاسم المعروض للمدقّق                          |
| `--commission-rate`            | string | معدل العمولة الأولي (مثلاً `0.10`)             |
| `--commission-max-rate`        | string | الحد الأقصى لمعدل العمولة                      |
| `--commission-max-change-rate` | string | الحد الأقصى لمعدل تغيير العمولة اليومي         |
| `--min-self-delegation`        | string | الحد الأدنى المطلوب للتفويض الذاتي             |

### edit-validator

تعديل وصف مدقّق موجود أو عمولته.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

تفويض الرموز المميزة إلى مدقّق.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

نقل التفويض من مدقّق إلى آخر.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

فك ربط الرموز المميزة من مدقّق.

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

سحب جميع مكافآت التحصيص المعلّقة.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

سحب المكافآت من مدقّق محدد.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| العلم          | النوع | الوصف                              |
| -------------- | ---- | ---------------------------------- |
| `--commission` | bool | سحب عمولة المدقّق أيضاً              |

---

## gov

### submit-proposal

تقديم مقترح حوكمة.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

ملف المقترح هو مستند JSON يحدد نوع المقترح وعنوانه ووصفه وأي رسائل يجب تنفيذها.

### vote

التصويت على مقترح نشط.

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

خيارات التصويت: `yes`، `no`، `abstain`، `no_with_veto`.

### deposit

إضافة وديعة إلى مقترح.

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

يتطلب مسار معاملات cosmos توقيعاً هجيناً بشكل افتراضي (`hybrid_signature_mode = required`). ينتج الأمران `gen-key` و`cosign` مفتاح Dilithium-5 (ML-DSA-87) وامتداد `PQCHybridSignature` اللازمين لإجراء المعاملات على مسار cosmos إلى جانب التوقيع الكلاسيكي secp256k1.

### gen-key

توليد مفتاح Dilithium-5 (ML-DSA-87) ما بعد الكمومي للتوقيع الهجين.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

إرفاق توقيع مشترك Dilithium-5 بمعاملة كامتداد `PQCHybridSignature`، لإنتاج معاملة هجينة (secp256k1 + ML-DSA-87). مطلوب لمعاملات مسار cosmos في ظل وضع الإنفاذ الافتراضي `required`. يجب أن تنتج أدوات CosmJS / المرحّلات القياسية هذا الامتداد لإجراء المعاملات؛ وتقوم دالة `buildHybridTx` في QoreChain SDK (مع `includePqcPublicKey`) بما يكافئ ذلك.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

تسجيل مفتاح عام ما بعد كمومي لحساب.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

تسجيل مفتاح PQC مع بيانات وصفية موسّعة وشهادة موثّقة.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| العلم           | النوع  | الوصف                              |
| --------------- | ------ | ---------------------------------- |
| `--attestation` | string | بيانات شهادة TEE (بصيغة hex)       |
| `--metadata`    | string | بيانات وصفية إضافية للمفتاح (JSON) |

### migrate-key

ترحيل مفتاح كلاسيكي موجود إلى زوج مفاتيح PQC هجين.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

### recover-key

إعادة بناء مفتاح ML-DSA-87 الخاص بالحساب بشكل حتمي من عبارته التذكيرية BIP-39 (تُقرأ من stdin) وتخزينه محلياً (متاح اعتباراً من إصدار السلسلة **v3.1.85**). يستخدم الاشتقاق القياسي في المنظومة `SHAKE-256("qorechain:pqc:v1|address|mnemonic")`.

```bash
qorechaind tx pqc recover-key <name> <address> [flags]
```

| العلم          | النوع  | الوصف                                                                     |
| -------------- | ------ | -------------------------------------------------------------------------- |
| `--derivation` | string | `adapter` (القياسي، الافتراضي) أو `bridge` (القديم `SHAKE-256(mnemonic)`) |

### rotate-key

تدوير مفتاح ML-DSA-87 الخاص بالحساب **ضمن نفس الخوارزمية** (متاح اعتباراً من إصدار السلسلة **v3.1.85**) — على سبيل المثال ترحيل مفتاح مشتق بالطريقة القديمة إلى الاشتقاق القياسي، أو سحب مفتاح مخترق من الخدمة. يقرأ الأمر العبارة التذكيرية من stdin، ويوقّع توقيعاً مزدوجاً بالمفتاحين القديم والجديد، ويوقّع الغلاف توقيعاً مشتركاً بالمفتاح القديم، ثم يبث المعاملة. يُخرج فقط JSON المعاملة على stdout (تذهب السطور الإعلامية إلى stderr)، لذا يتكامل مع `-o json`.

```bash
qorechaind tx pqc rotate-key [flags]
```

| العلم              | النوع  | الوصف                                               |
| ------------------ | ------ | ---------------------------------------------------- |
| `--old-derivation` | string | اشتقاق المفتاح المسجّل حالياً (`adapter` \| `bridge`) |
| `--new-derivation` | string | اشتقاق المفتاح الجديد (`adapter` \| `bridge`)         |
| `--new-random`     | bool   | توليد مفتاح عشوائي جديد بدلاً من ذلك                  |

---

## xqore

### lock

قفل رموز QOR في مركز تحصيص حوكمة xQORE.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| العلم             | النوع  | الوصف                                  |
| ----------------- | ------ | -------------------------------------- |
| `--lock-duration` | string | مدة القفل (مثلاً `30d`، `90d`، `180d`)  |

### unlock

فتح xQORE وإعادته إلى QOR. قد يترتب على الفتح المبكر غرامات حسب مستوى الغرامة.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

بدء إيداع عبر الجسر من سلسلة خارجية.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| العلم         | النوع  | الوصف                       |
| ------------- | ------ | --------------------------- |
| `--recipient` | string | عنوان المستلم على QoreChain |

### withdraw

بدء سحب عبر الجسر إلى سلسلة خارجية.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

تفعيل جسر سلسلة أو إعادة تكوينه في معاملة موقّعة واحدة (متاح اعتباراً من إصدار السلسلة **v3.1.80**). يتطلب مفتاح `bridge_admin` أو ترخيص `qcb_bridge` — دون الحاجة إلى مقترح حوكمة أو ترقية للسلسلة. يضبط عنوان العقد وعدد التأكيدات والبنية والحالة.

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

اختيار المدقّق (verifier) النشط لسلسلة وتثبيت جذر الثقة الخاص به (محمي أيضاً بصلاحية `bridge_admin`).

```bash
qorechaind tx bridge set-verifier-bootstrap <chain_id> <verifier> [flags] --from bridge-admin
```

---

## crossvm

### call

إرسال رسالة عبر الأجهزة الافتراضية بين بيئات التنفيذ (EVM وCosmWasm وSVM).

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| العلم         | النوع  | الوصف                                             |
| ------------- | ------ | ------------------------------------------------- |
| `--source-vm` | string | الجهاز الافتراضي المصدر: `evm`، `cosmwasm`، `svm` |
| `--gas-limit` | uint   | حد الغاز للتنفيذ عبر الأجهزة الافتراضية           |

### process-queue

معالجة الرسائل المعلّقة عبر الأجهزة الافتراضية يدوياً (أمر خاص بالمشغّل).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

نشر برنامج BPF على بيئة تشغيل SVM.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| العلم          | النوع  | الوصف                         |
| -------------- | ------ | ----------------------------- |
| `--program-id` | string | معرّف برنامج اختياري (base58) |

### execute

تنفيذ تعليمة على برنامج SVM منشور.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| العلم        | النوع  | الوصف                                        |
| ------------ | ------ | -------------------------------------------- |
| `--accounts` | string | مفاتيح الحسابات العامة للتعليمة مفصولة بفواصل |

### create-account

إنشاء حساب SVM جديد مع مساحة بيانات مخصصة.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| العلم     | النوع  | الوصف                                              |
| --------- | ------ | -------------------------------------------------- |
| `--owner` | string | البرنامج المالك (base58، الافتراضي: برنامج النظام) |

---

## multilayer

### register-sidechain

تسجيل طبقة سلسلة جانبية جديدة.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| العلم                   | النوع  | الوصف                                                             |
| ----------------------- | ------ | ----------------------------------------------------------------- |
| `--block-time-ms`       | uint   | زمن الكتلة المستهدف بالمللي ثانية (الافتراضي 2000)                 |
| `--domains`             | string | النطاقات المدعومة مفصولة بفواصل (الافتراضي `defi`)                 |
| `--max-tx`              | uint   | الحد الأقصى للمعاملات في الكتلة (الافتراضي 1000)                   |
| `--min-validators`      | uint32 | الحد الأدنى لحجم مجموعة المدقّقين (الافتراضي 1)                     |
| `--settlement-interval` | uint   | فترة التسوية بالكتل (الافتراضي 100)                                |
| `--vm-types`            | string | أنواع الأجهزة الافتراضية المدعومة مفصولة بفواصل (الافتراضي `evm`) |

### register-paychain

تسجيل طبقة سلسلة دفع جديدة للمعاملات الصغيرة عالية التردد.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| العلم                   | النوع | الوصف                                             |
| ----------------------- | ---- | -------------------------------------------------- |
| `--max-tx`              | uint | الحد الأقصى للمعاملات في الكتلة (الافتراضي 5000)   |
| `--settlement-interval` | uint | فترة التسوية بالكتل (الافتراضي 50)                 |

### anchor-state

تقديم مرساة حالة (تسوية) لطبقة مسجّلة.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

توجيه معاملة إلى الطبقة المثلى.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| العلم            | النوع  | الوصف                      |
| ---------------- | ------ | -------------------------- |
| `--target-layer` | string | فرض التوجيه إلى طبقة محددة |

### update-layer-status

تحديث الحالة التشغيلية لطبقة (للمشغّل فقط).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

قيم الحالة: `active`، `paused`، `draining`.

### challenge-anchor

تقديم اعتراض احتيال ضد مرساة حالة.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

تسجيل rollup جديد باستخدام Rollup Development Kit.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| العلم               | النوع  | الوصف                                                           |
| ------------------- | ------ | ---------------------------------------------------------------- |
| `--settlement-type` | string | `optimistic`، `zk`، `pessimistic`، `sovereign`                   |
| `--profile`         | string | الإعداد المسبق: `defi`، `gaming`، `nft`، `enterprise`، `custom`  |
| `--stake`           | string | مبلغ حصة المشغّل                                                  |
| `--da-enabled`      | bool   | تفعيل توفّر البيانات الأصلي                                        |

### submit-batch

تقديم دفعة تسوية لـ rollup.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

تقديم اعتراض احتيال ضد دفعة تسوية (لعمليات rollup المتفائلة).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

إنهاء دفعة اجتازت نافذة الاعتراض يدوياً.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

إيقاف rollup مؤقتاً (للمشغّل فقط).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

استئناف rollup متوقف مؤقتاً (للمشغّل فقط).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

إيقاف rollup نهائياً وتحرير حصته (للمشغّل فقط).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
تُتاح أيضاً عمليات السحب من rollup والتسوية عبر الطبقات ضمن مجموعة معاملات `rdk` (على سبيل المثال، أمر `execute-withdrawal` الذي يسوّي عملية سحب مُثبتة ضد دفعة نهائية). تعتمد الوسائط والأعلام الدقيقة على نوع تسوية rollup الخاص بك وتكوين توفّر البيانات؛ راجع وثائق **Rollup Development Kit** للاطلاع على واجهة الأوامر المرجعية قبل إنشاء هذه المعاملات.
:::

---

## babylon

### submit-btc-checkpoint

تقديم نقطة تحقق BTC لحقبة معينة.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

إعادة تحصيص BTC عبر تكامل Babylon.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| العلم           | النوع  | الوصف                       |
| --------------- | ------ | --------------------------- |
| `--btc-tx-hash` | string | تجزئة معاملة Bitcoin كإثبات |

---

## abstractaccount

### create

إنشاء حساب مجرّد بقواعد إنفاق قابلة للبرمجة.

```bash
qorechaind tx abstractaccount create [flags]
```

| العلم              | النوع  | الوصف                        |
| ------------------ | ------ | ---------------------------- |
| `--spending-rules` | string | ملف JSON يعرّف قواعد الإنفاق |

### update-spending-rules

تحديث قواعد الإنفاق لحساب مجرّد موجود.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

### execute-cosmos

ترحيل عملية إرسال بنكية على مسار Native مصرّح بها عبر موثّق (authenticator) من حساب قياسي (متاح اعتباراً من إصدار السلسلة **v3.1.85**). يوقّع المرحّل (`--from`) الغلاف ويدفع رسومه؛ ويكون توقيع المفتاح المرتبط على بايتات التوقيع المقيّدة ضد إعادة التشغيل هو التصريح. راجع [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators).

```bash
qorechaind tx abstractaccount execute-cosmos <account> <to> <amount> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

### execute-evm

ترحيل استدعاء EVM أو تحويل مصرّح به عبر موثّق من عنوان EVM الخاص بالحساب القياسي (متاح اعتباراً من إصدار السلسلة **v3.1.85**). قيمة nonce هي رقم nonce **الحالي** لعنوان EVM الخاص بالحساب.

```bash
qorechaind tx abstractaccount execute-evm <account> <to> <value> <data_hex> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

---

## rlconsensus

PRISM هي طبقة التعلّم المعزّز التي تضبط معاملات الإجماع. تتحكم هذه الأوامر في وكيل PRISM؛ ويظل اسم وحدة CLI وهو `rlconsensus` وأوامره الفرعية كما هي حرفياً.

### set-agent-mode

ضبط الوضع التشغيلي لوكيل PRISM (عبر الحوكمة فقط).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

قيم الوضع: `0` (إيقاف)، `1` (مراقبة)، `2` (اقتراح)، `3` (تلقائي).

### resume-agent

استئناف وكيل PRISM بعد انطلاق قاطع الدائرة.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

تحديث تكوين سياسة وكيل PRISM (عبر الحوكمة فقط).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

تحديث تكوين أوزان المكافآت لوكيل PRISM.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| العلم                 | النوع  | الوصف                    |
| --------------------- | ------ | ------------------------ |
| `--throughput-weight` | string | وزن مكافأة الإنتاجية     |
| `--latency-weight`    | string | وزن مكافأة زمن الاستجابة |
| `--security-weight`   | string | وزن مكافأة الأمان        |
