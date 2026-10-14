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
اضبط `--chain-id qorechain-vladi` للبث على الشبكة الرئيسية الحية، أو `--chain-id qorechain-diana` لشبكة الاختبار. تعمل الشبكتان على خط الإصدارات v3.2 (إصدار عقدة الشبكة الرئيسية **v3.2.1**، وشبكة الاختبار **v3.2.2**؛ راجع `latest.json` ضمن [download.qore.host](https://download.qore.host) لمعرفة الإصدار الحالي). إذا تم حذف `--chain-id`، يستخدم العميل `chain-id` من إعدادات العميل المحلية لديك.
:::

تنطبق الأعلام الشائعة على كل أمر فرعي من أوامر `tx`:

| العلم               | النوع  | الوصف                                                          |
| ------------------- | ------ | -------------------------------------------------------------- |
| `--from`            | string | اسم أو عنوان مفتاح التوقيع                                      |
| `--chain-id`        | string | معرّف السلسلة (الافتراضي: من إعدادات العميل)                    |
| `--fees`            | string | رسوم المعاملة، مثلاً `40000uqor`                                |
| `--gas-prices`      | string | سعر الغاز بدلاً من `--fees`، مثلاً `0.1uqor`                    |
| `--gas`             | string | حد الغاز، أو `auto` للتقدير (الافتراضي `200000`)                |
| `--gas-adjustment`  | float  | مضاعف يُطبَّق على تقدير `auto` (الافتراضي `1`)                  |
| `--keyring-backend` | string | `os` أو `file` أو `kwallet` أو `pass` أو `test` أو `memory`     |
| `--node`            | string | نقطة نهاية RPC (الافتراضي `tcp://localhost:26657`)              |
| `--broadcast-mode`  | string | `sync` أو `async`                                               |
| `--generate-only`   | bool   | طباعة المعاملة غير الموقّعة بدلاً من توقيعها                    |
| `-y`                | bool   | تخطي مطالبة التأكيد                                             |

---

## الرسوم والغاز {#fees-and-gas}

الحد الأدنى لرسوم الشبكة هو **0.1 uqor لكل وحدة غاز** (يعرض `query feemarket params` القيمة `min_gas_price`؛ وقد ترتفع الرسوم الأساسية الحية فوق هذا الحد تحت الحمل، راجع `query feemarket base-fee`). تُرفض المعاملة ما لم يتحقق الشرط `fee >= gas limit x gas price`، لذا لا يعمل `--fees 500uqor` إلا مع حد غاز يبلغ 5,000 أو أقل، ويفشل مع أي معاملة حقيقية.

| المعاملة                                      | قيمة `--gas` المقترحة | قيمة `--fees` المطابقة |
| --------------------------------------------- | --------------------- | ---------------------- |
| تحويل أو تفويض أو تصويت أو مطالبة بتوقيع هجين | `400000`              | `40000uqor`            |
| تسجيل مفتاح PQC                               | `600000`              | `60000uqor`            |
| `lightnode register`                          | `300000`              | `30000uqor`            |

يضيف التوقيع الهجين نحو 4.7 KB إلى المعاملة، وتُحتسب بمعدل 10 غاز لكل بايت، لذا فإن القيمة الافتراضية `--gas 200000` ليست كافية دائماً: فقد استهلكت التحويلات الموقّعة هجيناً على الشبكة الرئيسية ما بين نحو 160,000 و240,000 غاز. اضبط `--gas` دائماً بشكل صريح مع `--fees` (أو `--gas-prices`).

---

## التوقيع الهجين مطلوب على مسار Cosmos {#hybrid-signing}

قيمة `hybrid_signature_mode` هي `required` على الشبكتين (`qorechaind query pqc hybrid-mode`). يجب أن تحمل كل معاملة على مسار Cosmos توقيع ML-DSA-87 (Dilithium-5) إلى جانب توقيع secp256k1؛ ويُرفض الأمر العادي `tx bank send ... -y`. الاستثناءات الوحيدة هي تسجيل مفاتيح PQC وترحيلها (حتى يتمكن الحساب الجديد من تسجيل مفتاحه الأول) والأمر `tx slashing unjail` لحساب ليس لديه مفتاح PQC مسجّل.

لذلك يُنفَّذ كل أمر في هذه الصفحة، باستثناء `pqc register-key` و`pqc register-key-v2` و`pqc migrate-key`، على خطوتين: ابنِ المعاملة باستخدام `--generate-only`، ثم وقّعها وابثّها باستخدام `tx pqc cosign`:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

اسم المفتاح `mypqc` هو مفتاح أُنشئ باستخدام `tx pqc gen-key` وسُجّل على الحساب (راجع [pqc](#pqc)). استخدم لذلك الملف التنفيذي الرسمي للإصدار من [download.qore.host](https://download.qore.host): فالملف التنفيذي المبني من شجرة المصدر العامة لا يستطيع إنشاء توقيع Dilithium أو تطبيقه (يُبلغ `gen-key` و`cosign` بأنهما يحتاجان إلى البناء الكامل). يتولى [QoreX](/qorex/overview) وحزم SDK هذا التوقيع نفسه نيابةً عنك.

---

## bank

### send

تحويل الرموز المميزة من حساب إلى آخر.

```bash
qorechaind tx bank send <from_key_or_address> <to_address> <amount> [flags]
```

مثال: `qorechaind tx bank send mykey qor1recipient... 1000000uqor --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > tx.json`، ثم `tx pqc cosign` كما هو موضح أعلاه. 1 QOR = 1,000,000 uqor.

---

## staking

### create-validator

إنشاء مدقّق من ملف JSON (أُزيل النمط المعتمد على الأعلام). تتطلب الشبكة الرئيسية أيضاً ترخيص `validator_operator` نشطاً ومفتاح PQC مسجّلاً؛ راجع [Running a Validator](/developer-guide/running-a-validator).

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json
```

`validator.json`:

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

### edit-validator

تعديل وصف مدقّق موجود أو عمولته.

```bash
qorechaind tx staking edit-validator --new-moniker "new-name" --website "https://example.org" --from mykey [flags]
```

الأعلام: `--new-moniker` و`--website` و`--identity` و`--security-contact` و`--details` و`--commission-rate` و`--min-self-delegation`. تُترك الحقول المحذوفة دون تغيير.

### delegate

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

### cancel-unbond

إلغاء إدخال فك ربط جارٍ.

```bash
qorechaind tx staking cancel-unbond <validator_address> <amount> <creation_height> [flags]
```

---

## slashing

### unjail

إعادة مدقّق مسجون (jailed) إلى المجموعة النشطة بعد انتهاء فترة السجن.

```bash
qorechaind tx slashing unjail --from mykey [flags]
```

---

## distribution

### withdraw-all-rewards

سحب جميع مكافآت التحصيص المعلّقة.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

سحب المكافآت من مدقّق واحد.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| العلم          | النوع | الوصف                                                    |
| -------------- | ----- | -------------------------------------------------------- |
| `--commission` | bool  | سحب العمولة أيضاً (عناوين مشغّلي المدقّقين)               |

---

## gov

### submit-proposal

تقديم مقترح حوكمة من ملف JSON يحتوي على `messages` و`metadata` و`deposit` و`title` و`summary` واختيارياً `expedited`. أنشئ هيكلاً أولياً باستخدام `qorechaind tx gov draft-proposal`.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

### vote

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

خيارات التصويت: `yes` و`no` و`abstain` و`no_with_veto`. استخدم `tx gov weighted-vote <proposal_id> yes=0.6,no=0.4` لتقسيم الصوت.

### deposit

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc {#pqc}

### gen-key

توليد مفتاح Dilithium-5 (ML-DSA-87) وتخزينه في `<home>/pqc/<name>.dilithium` (الصلاحية `0600`، **غير مشفّر**). يطبع المفتاح العام بصيغة hex.

```bash
qorechaind tx pqc gen-key <name>
```

### register-key

تسجيل مفتاح عام PQC لحسابك (أمر قديم: الخوارزمية هي Dilithium-5). يُوقَّع بالمفتاح الكلاسيكي وحده؛ وهذا هو استثناء التمهيد (bootstrap).

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

قيمة `key_type` هي `hybrid` (الموصى بها) أو `pqc_only` أو `classical_only`. يجعل المفتاح العام البالغ 2,592 بايت التسجيل أكثر كلفة من التحويل، ولهذا يحتاج إلى حد غاز أكبر.

### register-key-v2

تسجيل مفتاح مع اختيار صريح للخوارزمية.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

قيمة `algorithm` هي `dilithium5` (أو `1`) أو `mlkem1024` (أو `2`).

### cosign

توقيع معاملة غير موقّعة بمفتاح PQC والمفتاح الكلاسيكي للحساب، ثم بثّها.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> --from <key> --pqc-key <name> --chain-id <id>
```

| العلم          | الوصف                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `--pqc-key`    | اسم المفتاح المنشأ باستخدام `gen-key` أو `recover-key`                                            |
| `--sign-bytes` | `auto` (الافتراضي: يسأل السلسلة عن صيغة sign-bytes المنطبقة)، أو `v1` أو `v2`                     |
| `--generate-only` / `--offline` | طباعة المعاملة الموقّعة بصيغة JSON بدلاً من بثّها؛ ثم إرسالها لاحقاً باستخدام `tx broadcast`؛ ويحتاج `--offline` أيضاً إلى `--account-number` و`--sequence` و`--sign-bytes v1\|v2` |
| `--dry-run`    | المحاكاة وطباعة تقدير الغاز                                                                       |

طبّقت الشبكتان الترقية التي نقلت التحقق الهجين إلى sign-bytes الإصدار v2؛ وتُرفض صيغة v1.

### migrate-key

ترحيل مفتاح PQC الخاص بحسابك من خوارزمية إلى أخرى. يجب أن يكون هناك ترحيل نشط لخوارزميتك الحالية (يبدأه نظام الحوكمة)؛ ويوقّع المفتاحان كلاهما بايتات الترحيل.

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> [flags]
```

### recover-key

إعادة بناء مفتاح ML-DSA-87 الخاص بالحساب من عبارته التذكيرية BIP-39 (تُقرأ من stdin) وتخزينه محلياً. يستخدم `SHAKE-256("qorechain:pqc:v1|address|mnemonic")`.

```bash
echo "<mnemonic>" | qorechaind tx pqc recover-key <name> <address> [flags]
```

| العلم          | النوع  | الوصف                                                                      |
| -------------- | ------ | -------------------------------------------------------------------------- |
| `--derivation` | string | `adapter` (القياسي، الافتراضي) أو `bridge` (القديم `SHAKE-256(mnemonic)`)  |

### rotate-key

تدوير مفتاح ML-DSA-87 الخاص بالحساب ضمن نفس الخوارزمية. يقرأ العبارة التذكيرية من stdin، ويوقّع توقيعاً مزدوجاً بالمفتاحين القديم والجديد، ويوقّع توقيعاً مشتركاً بالمفتاح القديم ثم يبث المعاملة.

```bash
echo "<mnemonic>" | qorechaind tx pqc rotate-key --from mykey --old-derivation bridge --new-derivation adapter \
  --gas 600000 --fees 60000uqor --chain-id qorechain-vladi
```

| العلم              | النوع  | الوصف                                                                                |
| ------------------ | ------ | ------------------------------------------------------------------------------------ |
| `--old-derivation` | string | اشتقاق المفتاح المسجّل حالياً: `bridge` (الافتراضي) أو `adapter`                     |
| `--new-derivation` | string | اشتقاق المفتاح الجديد: `adapter` (الافتراضي) أو `bridge`                             |
| `--new-random`     | bool   | التدوير إلى مفتاح عشوائي جديد؛ يتطلب `--new-key-out`                                 |
| `--new-key-out`    | string | حفظ المفتاح الخاص الجديد باسم `<home>/pqc/<name>.dilithium` قبل إرسال أي شيء         |
| `--sign-bytes`     | string | `auto` (الافتراضي) أو `v1` أو `v2`                                                   |

### open-evm-window

يقبل مسار EVM معاملة فقط من حساب يملك مفتاح PQC مسجّلاً **وله** نافذة تفويض مفتوحة. تُفتح النافذة برسالة على مسار Cosmos، ولذلك تحمل توقيع PQC الذي لا تستطيع محفظة Ethereum توفيره. وداخل النافذة تعمل معاملات MetaMask العادية دون أي تغيير.

```bash
qorechaind tx pqc open-evm-window <blocks> <max-txs> <max-value> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

| الوسيط      | الحد                 | المعنى                                                                                        |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `blocks`    | من 1 إلى 17,280      | المدة التي تبقى فيها النافذة مفتوحة، محسوبة من الكتلة التي تفتحها                              |
| `max-txs`   | من 1 إلى 1,000       | عدد معاملات EVM التي تقبلها                                                                   |
| `max-value` | موجب                 | الإجمالي المقبول، ويشمل القيمة المحوّلة **و**الحد الأقصى للرسوم التي قد تدفعها كل معاملة؛ `uqor` أو `qor`، مثلاً `1000qor` |

يؤدي فتح نافذة إلى استبدال أي نافذة موجودة. تحقق منها باستخدام `qorechaind query pqc evm-window <address>`.

### close-evm-window

إغلاق نافذتك فوراً، مثلاً عند الاشتباه في اختراق المفتاح الكلاسيكي.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

قيمة `node_type` هي `sx` أو `ux`. يتطلب التسجيل ترخيص `lightnode_operator` نشطاً، كما أن التسجيل في برنامج مكافآت العقد الخفيفة **غير مفتوح بعد**. أوامر أخرى: `tx lightnode heartbeat` و`tx lightnode claim-rewards` و`tx lightnode deregister`. راجع [Light Node](/light-node/overview).

---

## bridge

الجسر ليس في مرحلة الإنتاج: على الشبكتين تكون كل سلسلة مضبوطة في حالة `pending` ولا يوجد مدقّقو جسر مسجّلون (`query bridge chains` و`query bridge validators`).

### withdraw

```bash
qorechaind tx bridge withdraw <destination_chain> <destination_address> <asset> <amount> [flags]
```

### deposit

قيد الأصول المنقولة عبر الجسر من سلسلة مصدر. يحمل توقيعات المدقّقين (`--validator-sigs` و`--pqc-commitment`)؛ وهو رسالة خاصة بمشغّل الجسر، وليس الطريقة التي يبدأ بها المستخدم النهائي إيداعاً.

```bash
qorechaind tx bridge deposit <source_chain> <source_tx_hash> <asset> <amount> [flags]
```

### update-chain-config / set-verifier-bootstrap

إداريان (ترخيص `bridge_admin` أو `qcb_bridge`).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
```

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

الأمر `transfer` الأول هو الأمر الفرعي والثاني هو المنفذ المصدر. لا توجد قنوات IBC مفتوحة على أي من الشبكتين وقت كتابة هذا المستند (`query ibc channel channels`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

قيمة `profile` هي `defi` أو `gaming` أو `nft` أو `enterprise` أو `custom`؛ و`stake_amount` بوحدة uqor (الحد الأدنى الحالي في `query rdk config`). يوفّر الإعداد المسبق للملف التسوية والمُرتِّب (sequencer) وتوفّر البيانات (DA) ونموذج الغاز؛ ولا يمكن تجاوز سوى الجهاز الافتراضي (VM) من سطر الأوامر. لا يوجد أمر `finalize-batch`.

---

## multilayer

```bash
qorechaind tx multilayer register-sidechain <layer_id> <description> [--block-time-ms 2000] [--domains defi] [--max-tx 1000] [--min-validators 1] [--settlement-interval 100] [--vm-types evm] [flags]
qorechaind tx multilayer register-paychain <layer_id> <description> [--max-tx 5000] [--settlement-interval 50] [--base-fee-multiplier 0.01] [flags]
qorechaind tx multilayer anchor-state <layer_id> <layer_height> <state_root_hex> <pqc_agg_sig_hex> [flags]
qorechaind tx multilayer route-transaction <payload_hex> [--preferred-layer <id>] [--max-latency-ms 10000] [--max-fee 1000000] [flags]
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_height> <fraud_proof_hex> <reason> [flags]
qorechaind tx multilayer update-layer-status <layer_id> <new_status> <reason> [flags]
```

قيمة `new_status` هي `proposed` أو `active` أو `suspended` أو `decommissioned`. الأمر `update-layer-status` معطّل على الشبكة الرئيسية بواسطة قاطع الدائرة (انظر أدناه).

---

## الرسائل المعطّلة أو غير المتاحة حالياً {#disabled-messages}

توجد بعض الأوامر في الملف التنفيذي لكنها لا تستطيع النجاح على الشبكات الحية:

| الأمر                                                     | السبب                                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tx wasm store` و`tx wasm instantiate` و`instantiate2`    | صلاحية الرفع والإنشاء هي `Nobody` على الشبكتين، كما أن أنواع الرسائل موجودة أيضاً في قائمة قاطع الدائرة |
| `tx crossvm call`                                         | معطّل على الشبكة الرئيسية بواسطة قاطع الدائرة                                                  |
| `tx svm deploy-program` و`execute` و`create-account`      | مسار معاملات SVM معطّل على مستوى الشبكة كلها                                                   |
| `tx abstractaccount create` و`register-authenticator` و`execute-cosmos` و`execute-evm` | وحدة الحساب المجرّد متوقفة (يعرض `query abstractaccount config` القيمة `enabled: false`) |
| `tx rlconsensus *` و`tx amm pause-pool`/`resume-pool`      | رسائل سلطة الحوكمة؛ وهي أيضاً ضمن قائمة قاطع الدائرة على الشبكة الرئيسية                       |
| `tx license *`                                            | للسلطة فقط (تمنح سلطة التراخيص في الشبكة التراخيص)                                             |

القائمة الحية هي `qorechaind query circuit disabled-list`.
