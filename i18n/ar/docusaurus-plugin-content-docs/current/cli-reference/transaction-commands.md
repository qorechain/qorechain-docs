---
slug: /cli-reference/transaction-commands
title: أوامر المعاملات
sidebar_label: أوامر المعاملات
sidebar_position: 2
---

# أوامر المعاملات

تتّبع جميع أوامر المعاملات النمط:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
عيّن `--chain-id qorechain-vladi` للبثّ مقابل الشبكة الرئيسية الحيّة (إصدار السلسلة **v3.1.77**)، أو `--chain-id qorechain-diana` لشبكة الاختبار. وإذا أُغفل، يستخدم العميل قيمة `chain-id` من تكوينك المحلي.
:::

تنطبق العلامات الشائعة على كل أمر فرعي لـ `tx`:

| العَلَم                | النوع   | الوصف                                     |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | اسم أو عنوان مفتاح التوقيع              |
| `--chain-id`        | string | معرّف السلسلة (الافتراضي: من التكوين)         |
| `--fees`            | string | رسوم المعاملة (مثل `500uqor`)              |
| `--gas`             | string | حد الغاز أو `auto` للتقدير                |
| `--gas-adjustment`  | float  | مضاعِف الغاز عند استخدام `auto` (الافتراضي: 1.0) |
| `--keyring-backend` | string | خلفية سلسلة المفاتيح: `os` و`file` و`test`           |
| `--node`            | string | نقطة نهاية RPC (الافتراضي: `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync` أو `async` أو `block`                     |
| `-y`                | bool   | تخطّي مطالبة التأكيد                        |

---

## bank

### send

تحويل الرموز من حساب إلى آخر.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

إنشاء مدقق جديد على الشبكة.

```bash
qorechaind tx staking create-validator [flags]
```

| العَلَم                           | النوع   | الوصف                                  |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | مبلغ التفويض الذاتي (مثل `1000000uqor`) |
| `--pubkey`                     | string | المفتاح العام للإجماع للمدقق (JSON)        |
| `--moniker`                    | string | الاسم المعروض للمدقق                       |
| `--commission-rate`            | string | معدل العمولة الأولي (مثل `0.10`)       |
| `--commission-max-rate`        | string | الحد الأقصى لمعدل العمولة                      |
| `--commission-max-change-rate` | string | الحد الأقصى لمعدل التغيير اليومي للعمولة         |
| `--min-self-delegation`        | string | الحد الأدنى للتفويض الذاتي المطلوب             |

### edit-validator

تعديل وصف مدقق موجود أو عمولته.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

تفويض الرموز إلى مدقق.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

نقل التفويض من مدقق إلى آخر.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

فك ارتباط الرموز من مدقق.

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

سحب جميع مكافآت الـ staking المعلّقة.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

سحب المكافآت من مدقق محدد.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| العَلَم           | النوع | الوصف                        |
| -------------- | ---- | ---------------------------------- |
| `--commission` | bool | سحب عمولة المدقق أيضًا |

---

## gov

### submit-proposal

تقديم مقترح حوكمة.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

ملف المقترح هو مستند JSON يحدد نوع المقترح وعنوانه ووصفه وأي رسائل لتنفيذها.

### vote

التصويت على مقترح نشط.

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

خيارات التصويت: `yes` و`no` و`abstain` و`no_with_veto`.

### deposit

إضافة إيداع إلى مقترح.

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

يتطلب مسار معاملة cosmos توقيعًا هجينًا افتراضيًا (`hybrid_signature_mode = required`). ينتج الأمران `gen-key` و`cosign` مفتاح Dilithium-5 (ML-DSA-87) وامتداد `PQCHybridSignature` اللازمين للمعاملة على مسار cosmos إلى جانب توقيع secp256k1 الكلاسيكي.

### gen-key

توليد مفتاح Dilithium-5 (ML-DSA-87) ما بعد كمّي للتوقيع الهجين.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

إرفاق توقيع مشترك من Dilithium-5 بمعاملة كامتداد `PQCHybridSignature`، مما يُنتج معاملة هجينة (secp256k1 + ML-DSA-87). مطلوب لمعاملات مسار cosmos في ظل وضع الفرض `required` الافتراضي. يجب على أدوات CosmJS / المُرحِّل (relayer) المعيارية أن تُنتج هذا الامتداد للمعاملة؛ وتؤدي دالة `buildHybridTx` (مع `includePqcPublicKey`) في QoreChain SDK المهمة المكافئة.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

تسجيل مفتاح عام ما بعد كمّي لحساب.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

تسجيل مفتاح PQC ببيانات تعريفية موسّعة وشهادة (attestation).

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| العَلَم            | النوع   | الوصف                    |
| --------------- | ------ | ------------------------------ |
| `--attestation` | string | بيانات شهادة TEE (سداسي عشري)     |
| `--metadata`    | string | بيانات تعريفية إضافية للمفتاح (JSON) |

### migrate-key

ترحيل مفتاح كلاسيكي موجود إلى زوج مفاتيح PQC هجين.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

---

## xqore

### lock

قفل رموز QOR في مركز staking حوكمة xQORE.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| العَلَم              | النوع   | الوصف                                |
| ----------------- | ------ | ------------------------------------------ |
| `--lock-duration` | string | مدة القفل (مثل `30d` و`90d` و`180d`) |

### unlock

فك قفل xQORE وإعادته إلى QOR. قد يترتب على فك القفل المبكر غرامات حسب فئة الغرامة.

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

| العَلَم          | النوع   | الوصف                    |
| ------------- | ------ | ------------------------------ |
| `--recipient` | string | عنوان المستلِم على QoreChain |

### withdraw

بدء سحب عبر الجسر إلى سلسلة خارجية.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

---

## crossvm

### call

إرسال رسالة عبر الـ VM بين بيئات التنفيذ (EVM وCosmWasm وSVM).

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| العَلَم          | النوع   | الوصف                          |
| ------------- | ------ | ------------------------------------ |
| `--source-vm` | string | الـ VM المصدر: `evm` و`cosmwasm` و`svm`  |
| `--gas-limit` | uint   | حد الغاز لتنفيذ عبر الـ VM |

### process-queue

معالجة رسائل عبر الـ VM المعلّقة يدويًا (أمر مشغّل).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

نشر برنامج BPF إلى وقت تشغيل SVM.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| العَلَم           | النوع   | الوصف                  |
| -------------- | ------ | ---------------------------- |
| `--program-id` | string | معرّف برنامج اختياري (base58) |

### execute

تنفيذ تعليمة على برنامج SVM منشور.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| العَلَم         | النوع   | الوصف                                         |
| ------------ | ------ | --------------------------------------------------- |
| `--accounts` | string | مفاتيح عامة لحسابات مفصولة بفواصل للتعليمة |

### create-account

إنشاء حساب SVM جديد بمساحة بيانات مخصّصة.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| العَلَم      | النوع   | الوصف                                     |
| --------- | ------ | ----------------------------------------------- |
| `--owner` | string | البرنامج المالك (base58، الافتراضي: برنامج النظام) |

---

## multilayer

### register-sidechain

تسجيل طبقة سلسلة جانبية جديدة.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| العَلَم                    | النوع   | الوصف                                          |
| ----------------------- | ------ | --------------------------------------------------- |
| `--block-time-ms`       | uint   | زمن الكتلة المستهدف بالمللي ثانية (الافتراضي 2000)              |
| `--domains`             | string | مجالات مدعومة مفصولة بفواصل (الافتراضي `defi`)  |
| `--max-tx`              | uint   | الحد الأقصى للمعاملات لكل كتلة (الافتراضي 1000)           |
| `--min-validators`      | uint32 | الحد الأدنى لحجم مجموعة المدققين (الافتراضي 1)              |
| `--settlement-interval` | uint   | فترة التسوية بالكتل (الافتراضي 100)         |
| `--vm-types`            | string | أنواع VM مدعومة مفصولة بفواصل (الافتراضي `evm`)  |

### register-paychain

تسجيل طبقة paychain جديدة للمعاملات الصغيرة عالية التردد.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| العَلَم                    | النوع | الوصف                                  |
| ----------------------- | ---- | -------------------------------------------- |
| `--max-tx`              | uint | الحد الأقصى للمعاملات لكل كتلة (الافتراضي 5000)    |
| `--settlement-interval` | uint | فترة التسوية بالكتل (الافتراضي 50)   |

### anchor-state

تقديم ربط حالة (تسوية) لطبقة مُسجَّلة.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

توجيه معاملة إلى الطبقة المثلى.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| العَلَم             | النوع   | الوصف                       |
| ---------------- | ------ | --------------------------------- |
| `--target-layer` | string | فرض التوجيه إلى طبقة محددة |

### update-layer-status

تحديث الحالة التشغيلية لطبقة (للمشغّل فقط).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

قيم الحالة: `active` و`paused` و`draining`.

### challenge-anchor

تقديم طعن احتيال ضد ربط حالة.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

تسجيل rollup جديد عبر مجموعة تطوير الـ Rollup.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| العَلَم                | النوع   | الوصف                                          |
| ------------------- | ------ | ---------------------------------------------------- |
| `--settlement-type` | string | `optimistic` و`zk` و`pessimistic` و`sovereign`       |
| `--profile`         | string | الإعداد الجاهز: `defi` و`gaming` و`nft` و`enterprise` و`custom` |
| `--stake`           | string | مبلغ حصة المشغّل                                |
| `--da-enabled`      | bool   | تفعيل إتاحة البيانات الأصلية (native)                      |

### submit-batch

تقديم دفعة تسوية لـ rollup.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

تقديم طعن احتيال ضد دفعة تسوية (عمليات الـ rollup التفاؤلية).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

إنهاء دفعة يدويًا بعد اجتيازها نافذة الطعن.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

إيقاف rollup مؤقتًا (للمشغّل فقط).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

استئناف rollup متوقف مؤقتًا (للمشغّل فقط).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

إيقاف rollup نهائيًا وتحرير حصته (للمشغّل فقط).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
يُعرَض سحب الـ rollup والتسوية عبر الطبقات أيضًا ضمن مجموعة معاملات `rdk` (على سبيل المثال، أمر `execute-withdrawal` الذي يسوّي سحبًا مُثبَتًا مقابل دفعة منتهية). وتعتمد المعاملات والعلامات الدقيقة على نوع تسوية الـ rollup لديك وتكوين الـ DA؛ راجع وثائق **مجموعة تطوير الـ Rollup** للاطلاع على سطح الأوامر المعتمد قبل إنشاء هذه المعاملات.
:::

---

## babylon

### submit-btc-checkpoint

تقديم نقطة تفتيش BTC لحقبة.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

إعادة staking للـ BTC عبر تكامل Babylon.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| العَلَم            | النوع   | الوصف                       |
| --------------- | ------ | --------------------------------- |
| `--btc-tx-hash` | string | تجزئة معاملة Bitcoin كإثبات |

---

## abstractaccount

### create

إنشاء حساب مجرّد بقواعد إنفاق قابلة للبرمجة.

```bash
qorechaind tx abstractaccount create [flags]
```

| العَلَم               | النوع   | الوصف                       |
| ------------------ | ------ | --------------------------------- |
| `--spending-rules` | string | ملف JSON يحدد قواعد الإنفاق |

### update-spending-rules

تحديث قواعد الإنفاق لحساب مجرّد موجود.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

---

## rlconsensus

PRISM هي طبقة التعلّم المعزّز التي تضبط معلمات الإجماع. تتحكم هذه الأوامر بوكيل PRISM؛ اسم وحدة CLI `rlconsensus` وأوامره الفرعية محفوظة حرفيًا.

### set-agent-mode

تعيين الوضع التشغيلي لوكيل PRISM (للحوكمة فقط).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

قيم الوضع: `0` (إيقاف)، `1` (مراقبة)، `2` (اقتراح)، `3` (تلقائي).

### resume-agent

استئناف وكيل PRISM بعد تفعيل قاطع دائرة.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

تحديث تكوين سياسة وكيل PRISM (للحوكمة فقط).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

تحديث تكوين أوزان المكافأة لوكيل PRISM.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| العَلَم                  | النوع   | الوصف                  |
| --------------------- | ------ | ---------------------------- |
| `--throughput-weight` | string | وزن مكافأة الإنتاجية |
| `--latency-weight`    | string | وزن مكافأة زمن الوصول    |
| `--security-weight`   | string | وزن مكافأة الأمان   |
