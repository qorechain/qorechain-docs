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
اضبط `--chain-id qorechain-vladi` للبث على الشبكة الرئيسية الحية، أو `--chain-id qorechain-diana` لشبكة الاختبار. تعمل الشبكتان على خط الإصدارات v3.2: إصدار عقدة الشبكة الرئيسية **v3.2.4** (طُبّق عند الارتفاع 3,742,566 في 23 أكتوبر 2026 بمقترح الحوكمة 13؛ وطُبّق v3.2.3 عند الارتفاع 3,662,051 في 20 أكتوبر 2026؛ وسيطبّق مقترح الحوكمة 14 الإصدار v3.2.5 عند الارتفاع 3,906,833 وهو في فترة التصويت وقت كتابة هذا)، وشبكة الاختبار **v3.2.6** (طُبّق عند الارتفاع 8,970,638 في 27 أكتوبر 2026، بعد v3.2.5 عند الارتفاع 8,890,800 في 26 أكتوبر وv3.2.4 عند الارتفاع 8,337,253 في 19 أكتوبر). راجع `latest.json` ضمن [download.qore.host](https://download.qore.host) لمعرفة الإصدار الحالي. إذا تم حذف `--chain-id`، يستخدم العميل `chain-id` من إعدادات العميل المحلية لديك.

جرى التحقق من الأوامر والأعلام في هذه الصفحة مقابل الملف الثنائي للإصدار v3.2.3، إضافة إلى ما استُحدث في v3.2.4. وكل ما هو موجود فقط منذ v3.2.4 (الشبكة الرئيسية منذ 23 أكتوبر 2026، وشبكة الاختبار منذ 19 أكتوبر 2026) موسوم بذلك. ولا يضيف مصدر v3.2.6 أي أمر `tx` جديد؛ لكنه يغيّر حالة شبكة الاختبار (رموز اختبار، ووحدة حساب مجرّد مفعّلة، وإنشاء نسخ QoreChain Native مفتوح)، وتشير الأقسام أدناه إلى ذلك حيث يهمّ.
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

قيمة `hybrid_signature_mode` هي `required` على الشبكتين (`qorechaind query pqc hybrid-mode`). يجب أن تحمل كل معاملة على مسار Cosmos توقيع ML-DSA-87 (Dilithium-5) إلى جانب توقيع secp256k1؛ ويُرفض الأمر العادي `tx bank send ... -y` (فضاء الأكواد `pqc`، الرمز 20). الاستثناءات الوحيدة، منذ v3.2.3 على الشبكة الرئيسية، هي:

- **أول** تسجيل لمفتاح PQC لحساب لا يملك مفتاحاً بعد (`register-key` أو `register-key-v2`)، حتى يتمكن الحساب الجديد من التمهيد (bootstrap)؛
- إصلاح سجل حساب لا يحتوي على مفتاح صالح للاستخدام، باستخدام `register-key-v2`؛
- `tx slashing unjail` لحساب ليس لديه مفتاح PQC مسجّل.

يجب على الحساب الذي يملك مفتاح PQC بالفعل أن يوقّع هجيناً كل شيء، **بما في ذلك** `register-key-v2` و`migrate-key` (تُرفض المحاولة الكلاسيكية فقط بالرمز 234). ولا يستطيع الحساب الذي بلا مفتاح إرفاق توقيع هجين أيضاً: فليس لديه ما يُتحقَّق منه، لذا يسجّل أولاً.

لذلك يُنفَّذ كل أمر في هذه الصفحة، باستثناء التسجيل الأول (`pqc register-key` / `pqc register-key-v2` على حساب بلا مفتاح)، على خطوتين: ابنِ المعاملة باستخدام `--generate-only`، ثم وقّعها وابثّها باستخدام `tx pqc cosign`. أما `pqc rotate-key` فيتولى التوقيع المشترك والبث بنفسه؛ ولا يقوم `pqc gen-key` و`pqc recover-key` إلا بإنشاء ملف مفتاح محلياً:

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

يرفض `gen-key` و`recover-key` الكتابة فوق ملف مفتاح موجود بهذا الاسم؛ ويستبدله `--force` ويحتفظ بالملف القديم باسم `<name>.dilithium.bak-<unix-time>`.

### register-key

تسجيل مفتاح عام PQC لحسابك (أمر قديم: الخوارزمية هي Dilithium-5). يُوقَّع التسجيل الأول بالمفتاح الكلاسيكي وحده؛ وهذا هو استثناء التمهيد (bootstrap). أما الحساب الذي يملك مفتاحاً بالفعل فعليه أن يوقّعه هجيناً (`--generate-only`، ثم `tx pqc cosign`).

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

قيمة `key_type` هي `hybrid` (الموصى بها) أو `pqc_only`. وتُرفض `classical_only` (الرمز 230): فهي لا تسجّل أي مفتاح ما بعد كمومي، فلن يتمكن الحساب من التوقيع مجدداً أبداً. يجعل المفتاح العام البالغ 2,592 بايت التسجيل أكثر كلفة من التحويل، ولهذا يحتاج إلى حد غاز أكبر.

ترفض السلسلة أيضاً مفتاحاً لا يوفّر أي حماية ما بعد كمومية (الرمز 230) ومفتاحاً سبق لهذا الحساب أن استخدمه (الرمز 232). وترفض تسجيلاً لا يكون مفتاحه الكلاسيكي هو مفتاح الموقّع نفسه (الرمز 45).

### register-key-v2

تسجيل مفتاح مع اختيار صريح للخوارزمية، واختيارياً إثبات أنك تملك سرّ المفتاح.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> [--pqc-key <name>] \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

قيمة `algorithm` هي `dilithium5` (أو `1`) أو `mlkem1024` (أو `2`)؛ وقيمة `key_type` هي `hybrid` أو `pqc_only`.

**إثبات الحيازة (اختياري).** مع `--pqc-key <name>` (مفتاح أنشأه `gen-key` أو `recover-key`) يُرفق الأمر إثبات حيازة: توقيع المفتاح الجديد نفسه على `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>`. تتحقق منه السلسلة عند وجوده وترفض التسجيل إن لم يتحقق (الرمز 231)؛ ويظل التسجيل دونه مقبولاً. يسمّي الإثبات السلسلة والخوارزمية والحساب والمفتاح، لذا لا يثبت شيئاً لحساب أو شبكة أخرى. ويضيف توقيعاً واحداً بحجم 4,627 بايت إلى المعاملة، فأبقِ حد الغاز عند `600000`. يسافر الإثبات في الحقل `proof_of_possession` من الرسالة. تُرفقه حزمة TypeScript SDK 0.9.0 تلقائياً عبر `ensurePqcRegistered` متى طبّقت الشبكة v3.2.3؛ أما إصدارات SDK السابقة و`@qorechain/wallet-adapter` فلا تُرفقه، لذا فالتسجيل المُجرى عبرها لا يحمل إثباتاً (ويظل مقبولاً).

```bash
qorechaind tx pqc gen-key mypqc                      # prints the public key hex
qorechaind tx pqc register-key-v2 dilithium5 <pubkey_hex> hybrid --pqc-key mypqc \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

ومن v3.2.4 (الشبكة الرئيسية منذ 23 أكتوبر 2026، وشبكة الاختبار منذ 19 أكتوبر 2026) يُبلغ سجل الحساب أيضاً عمّا إذا جرى التحقق من إثبات، في الحقل `possession_proven` (راجع [نقاط نهاية REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module)).

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

طبّقت الشبكتان الترقية التي نقلت التحقق الهجين إلى sign-bytes الإصدار v2؛ وتُرفض صيغة v1. يجوز أن تحمل المعاملة امتداد توقيع هجين واحداً فقط (يُرفض أكثر من واحد منذ v3.2.3).

### migrate-key

ترحيل مفتاح PQC الخاص بحسابك من خوارزمية إلى أخرى. يجب أن يكون هناك ترحيل نشط لخوارزميتك الحالية (يبدأه نظام الحوكمة)؛ ويوقّع المفتاحان كلاهما بايتات الترحيل، وتحتاج المعاملة نفسها إلى توقيعك الهجين (`--generate-only`، ثم `tx pqc cosign`). يُرفض مفتاح سبق للحساب أن استخدمه (الرمز 232).

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> --generate-only [flags] > m.json
qorechaind tx pqc cosign m.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
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

منذ v3.2.3 يرفض التدوير مفتاحاً جديداً لا يوفّر أي حماية ما بعد كمومية (الرمز 230) ومفتاحاً سبق للحساب أن استخدمه (الرمز 232)؛ ويتذكّر الحساب المفاتيح التي دوّرها بعيداً عنها، لذا لا يمكن إعادة تشغيل تدوير للعودة إلى مفتاح قديم.

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

**النوافذ المحدّدة النطاق (الشبكة الرئيسية v3.2.3 وما بعده).** يحتسب حد القيمة QOR الأصلي فقط: فتحويل رمز أو موافقة (approval) أو أي استدعاء عقد آخر يحمل قيمة صفراً ولا يُحتسب ضمنه. يضيّق علمان اختياريان ما تقبله النافذة:

| العلم               | الأثر                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--native-only`     | قبول تحويلات QOR العادية فقط: بلا calldata، ولا إنشاء عقود، ولا مستلم يحمل شيفرة، ولا تفويض EIP-7702 |
| `--allowed-targets` | قبول هؤلاء المستلمين فقط (عناوين `0x` مفصولة بفواصل)؛ ويُرفض إنشاء العقود                                  |

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
```

تقبل النافذة المفتوحة دون أيٍّ من العلمين ما كانت تقبله دائماً. ويُبلغ استعلام النافذة عن النطاق بالحقلين `native_only` و`allowed_targets`.

### close-evm-window

إغلاق نافذتك فوراً، مثلاً عند الاشتباه في اختراق المفتاح الكلاسيكي. ويُلغي أيضاً موافقة تفويض EIP-7702 المعلّقة.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

### authorize-evm-delegation وclear-evm-delegation

لا يسري تفويض EIP-7702 لحسابك إلا بموافقتك الخاصة ما بعد الكمومية (على الشبكة الرئيسية منذ v3.2.2). يسجّل `authorize-evm-delegation` هذه الموافقة لعنوان مفوَّض واحد؛ وهي للاستخدام مرة واحدة، وتنتهي بعد العدد المحدد من الكتل، ويُلغيها `close-evm-window`. ويزيل `clear-evm-delegation` تفويضاً مضبوطاً بالفعل. كلاهما رسالتان موقّعتان هجيناً على مسار Cosmos (`--generate-only`، ثم `tx pqc cosign`).

```bash
qorechaind tx pqc authorize-evm-delegation <delegate_0x_address> <blocks> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
qorechaind tx pqc clear-evm-delegation --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
```

يعني العنوان الصفري كقيمة `delegate` الموافقة على مسح التفويض. تحقق من الحالة باستخدام `qorechaind query pqc evm-delegation-consent <address>`.

لا يمكن إرسال أي من رسائل مفاتيح PQC (`register-key` و`register-key-v2` و`rotate-key` و`migrate-key`) نيابةً عن حساب عبر `authz` (على الشبكة الرئيسية v3.2.3 وما بعده).

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

قيمة `node_type` هي `sx` أو `ux`. يتطلب التسجيل ترخيص `lightnode_operator` نشطاً تمنحه سلطة التراخيص في الشبكة؛ راجع [Light Node](/light-node/overview) لمعرفة الحالة الراهنة للبرنامج. أوامر أخرى: `tx lightnode heartbeat` و`tx lightnode claim-rewards` و`tx lightnode deregister`.

منذ v3.2.3 تكون المكافأة التي يمكن أن تتراكم لعقدة محدودة **شهرياً** (`max_reward_per_month_per_node` في `GET /qorechain/lightnode/v1/reward_pool`، أي 2,000 QOR لكل 30 يوماً)، وتُوزَّع بالتناسب بحسب زمن الكتلة ووقت التشغيل، فلم يعد الحد يعتمد على سرعة إنتاج الكتل. والحد سقف وليس مبلغاً موعوداً. ومن v3.2.4 (الشبكة الرئيسية منذ 23 أكتوبر 2026، وشبكة الاختبار منذ 19 أكتوبر 2026) يبدأ حد العقدة من تسجيلها هي لا من التسوية السابقة.

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

### register-validator / attest

رسائل مدقّقي الجسر. يسجّل `register-validator <pqc_pubkey_hex> <supported_chains_csv>` مدقّقاً لمهمة الإشهاد، ويرسل `attest <chain> <event_type> <operation_id> <tx_hash> <amount> <asset> [--pqc-signature <hex>] [--proof <hex>]` إشهاداً. لا يوجد مدقّق جسر مسجّل على أي من الشبكتين. ومن v3.2.4 (الشبكة الرئيسية منذ 23 أكتوبر 2026، وشبكة الاختبار منذ 19 أكتوبر 2026) يحتاج تسجيل مدقّق الجسر أيضاً إلى إثبات حيازة ومفتاح لا يستخدمه أي مدقّق جسر آخر.

### update-chain-config / set-verifier-bootstrap / update-circuit-breaker-limits

إدارية (ترخيص `bridge_admin` أو `qcb_bridge`؛ ويمكن للحوكمة أيضاً ضبط حدود قاطع الدائرة).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
qorechaind tx bridge update-circuit-breaker-limits <chain_id> <max_single_transfer> <daily_limit> [flags]
```

الحدود بالوحدات الأساسية والقيمة `0` تعني بلا حد. ولا ينقل القيمة إلا مسار تكون حالته `active` تماماً.

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

الأمر `transfer` الأول هو الأمر الفرعي والثاني هو المنفذ المصدر. لا توجد قناة IBC مفتوحة على الشبكة الرئيسية وقت كتابة هذا المستند؛ ولدى شبكة الاختبار قناة تحويل واحدة مفتوحة (`channel-0`)، جرى التحقق في 27 أكتوبر 2026 عبر `query ibc channel channels`.

---

## amm

رسائل AMM الأصلية. لا يوجد أي مجمّع (pool) على أي من الشبكتين وقت كتابة هذا المستند، لذا ليس لدى هذه الأوامر ما تعمل عليه بعد.

```bash
qorechaind tx amm create-pool <pool_type> <deposit_a> <deposit_b> [flags]     # pool_type: constant_product | stable_swap; deposits as coins, e.g. 1000000uqor
qorechaind tx amm add-liquidity <pool_id> <amount_a> <amount_b> <min_lp_out> [flags]
qorechaind tx amm remove-liquidity <pool_id> <lp_amount> <min_a> <min_b> [flags]
qorechaind tx amm swap-exact-in <pool_id> <token_in> <denom_out> <min_out> [flags]
qorechaind tx amm swap-exact-out <pool_id> <denom_in> <token_out> <max_in> [flags]
```

منذ v3.2.2 يجب أن تسمّي المبادلة (swap) فئتَي المجمّع كلتيهما، ويُفرض `max_swap_impact_bps`، وتُوجَّه رسوم البروتوكول عبر وحدة الحرق.

على شبكة الاختبار يمكن لمجمّع أن يقرن `uqor` بأحد رموز اختبار Fest الثلاثة (بلا قيمة؛ شبكة الاختبار فقط). يستخدم الإيداع ومبالغ المبادلة فئة bank بالصيغة `erc20:<EIP-55 0x address>`، وهي حساسة لحالة الأحرف، مثال ذلك `qorechaind tx amm create-pool constant_product 1000000000uqor 2000000000erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA --from mykey --generate-only > tx.json` (ثم `tx pqc cosign`). ويجب أولًا تحويل الرمز المحتفَظ به في جانب EVM إلى عملة bank باستخدام `MsgConvertERC20` التي يكون مرسلها عنوان `qor1`؛ أما أمر سطر الأوامر `qorechaind tx erc20 convert-erc20` في إصدار العقدة v3.2.6 فيكتب المرسل بصيغة عنوان `0x` وترفضه السلسلة (`decoding bech32 failed`)، لذا ابنِ تلك الرسالة بمرسل `qor1` بدلًا من ذلك. التفاصيل: [رموز اختبار Fest على شبكة الاختبار](/developer-guide/evm-development#fest-tokens). ويكلّف إنشاء المجمّع رسم إنشاء المجمّع إضافة إلى الإيداعات (`pool_creation_fee` في `query amm params`).

---

## gasabstraction

```bash
qorechaind tx gasabstraction fund-float <amount> [flags]
```

ينقل رموزاً أصلية (مثل `1000000uqor`) إلى عائمة تحويل الرسوم (fee-conversion float)، وهي احتياطي QOR الذي تستخدمه الوحدة لدفع المدقّقين عندما تُدفع الرسوم برمز آخر مقبول. وتقرّر الحوكمة أي الرموز تُقبل. وعلى الشبكتين لا تقبل التهيئة سوى `uqor` الأصلي، لذا لا يجري أي تحويل؛ تحقق منها باستخدام `qorechaind query gasabstraction accepted-tokens`.

---

## crossvm

```bash
qorechaind tx crossvm call <evm|cosmwasm|svm> <target_contract> --payload <hex> [--funds <coins>] [--async] [flags]
```

الأمر `call` مُوقَف على الشبكة الرئيسية بواسطة قاطع الدائرة (انظر [أدناه](#disabled-messages)) ويعمل على شبكة الاختبار فقط حيثما يتوفر مسار الهدف. والاستدعاء المصطفّ (`--async`) الذي يفشل لا يترك أي آثار جانبية، بل سجلّه `Failed` فقط (منذ v3.2.3)، ويُرفض الاستدعاء الذي يساوي مسار مصدره المشتق مسار هدفه. راجع [التشغيل البيني عبر الآلات الافتراضية](/developer-guide/cross-vm-interoperability).

---

## stakingtier (v3.2.4) {#stakingtier}

:::note متاحة من v3.2.4
وصلت وحدة طبقات التخزين (staking tiers) مع إصدار **v3.2.4**: وهي تعمل على شبكة الاختبار `qorechain-diana` منذ 19 أكتوبر 2026 وعلى الشبكة الرئيسية منذ 23 أكتوبر 2026 (الارتفاع 3,742,566، مقترح الحوكمة 13). والعقدة التي ما زالت على إصدار أقدم لا تملك الوحدة وتُرفض هذه الأوامر؛ تحقّق أولاً من `GET /qorechain/stakingtier/v1/params` على العقدة التي تستهدفها.
:::

تفويضات اختيارية مقفلة بمدة زمنية: يمكن للمفوِّض أن يقفل جزءاً من تفويض قائم لمدة 3 أو 6 أو 12 شهراً (الحد الأدنى للقفل 10 QOR)، ثم يطالب لاحقاً بالمكافأة الإضافية التي تقيّدها الوحدة له. القفل سجل فوق التفويض: تبقى الأموال المفوَّضة لدى المدقّق.

```bash
qorechaind tx stakingtier lock <validator_address> <amount_uqor> <months> [flags]    # months: 3, 6 or 12
qorechaind tx stakingtier unlock-early <lock_id> [flags]
qorechaind tx stakingtier claim [flags]
```

يُفرض القفل في خادم رسائل التخزين (staking message server)، فيشمل أيضاً إلغاء التفويض عبر `authz` أو مجموعة (group) أو عقد. وإنهاء القفل مبكراً يُسقط مكافأته الإضافية غير المدفوعة ويحرق غرامة؛ أما الحد الأدنى لمبلغ القفل وسائر المعاملات فموجودة في `GET /qorechain/stakingtier/v1/params`. وكأي معاملة على مسار Cosmos، تحتاج هذه الأوامر إلى التوقيع المشترك الهجين (`--generate-only`، ثم `tx pqc cosign`) وحد غاز سخي (مثلاً `--gas 900000 --fees 90000uqor`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [--prev-state-root <hex>] [--tx-count <n>] [--data-hash <hex>] [--withdrawals-root <hex>] [--validator-set-hash <hex>] [--anchor-signature <hex>] [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

قيمة `profile` هي `defi` أو `gaming` أو `nft` أو `enterprise` أو `custom`؛ و`stake_amount` بوحدة uqor (الحد الأدنى الحالي في `query rdk config`). يوفّر الإعداد المسبق للملف التسوية والمُرتِّب (sequencer) وتوفّر البيانات (DA) ونموذج الغاز؛ ولا يمكن تجاوز سوى الجهاز الافتراضي (VM) من سطر الأوامر. لا يوجد أمر `finalize-batch`.

على رول-أب يكون توفّر البيانات فيه `native` (أو `both`)، اترك `--data-hash` فارغًا: لا توجد معاملة تنشر كتلة بيانات توفّر البيانات (DA)، وترفض السلسلة دفعة تدّعي وجود تجزئة بيانات لرول-أب كهذا (هكذا يتصرف إصدار العقدة v3.2.4، وهو إصدار الشبكة الرئيسية وقت كتابة هذا). وبالنسبة إلى رول-أب متفائل (optimistic)، يضبط عميل `@qorechain/rdk` (0.6.1) جذر حالة الدفعة على جذر الانتقال المعتمد في السلسلة (`batchTransitionRoot` في RDK)؛ راجع [Rollups](/rollups/overview).

`--anchor-signature` هو توقيع ML-DSA لمنشئ الرول-أب على **بايتات توقيع الإرساء (anchor) بالإصدار v2**؛ وبه تُرسَّخ الدفعة أيضاً في وحدة multilayer. اطبع البايتات الدقيقة المراد توقيعها باستخدام `qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>`؛ ويجب أن تطابق القيم أعلام `submit-batch`. منذ v3.2.3 تحتفظ الوحدة بـ**دفتر ضمان (escrow) لكل رول-أب**: لا يُدفع السحب إلا مما يحتويه دفتر ذلك الرول-أب، ويُفحص فيه الفئة (denomination) وكون المبلغ موجباً وعمق الإثبات وحجم العقد الشقيقة؛ ويردّ إيقاف الرول-أب ما تبقّى في دفتره فقط، ولا يدفع الرول-أب الموقَف أي سحوبات أخرى. وقت كتابة هذا المستند لا يوجد أي رول-أب على أي من الشبكتين.

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
| `tx wasm store` و`tx wasm instantiate` و`instantiate2`    | الشبكة الرئيسية: صلاحية الرفع والإنشاء هي `Nobody` وأنواع الرسائل الثلاثة في قائمة قاطع الدائرة. شبكة الاختبار: الرفع `Nobody` و`MsgStoreCode` في القائمة (تخزّن الحوكمة الشيفرة)، بينما الإنشاء مفتوح (`Everybody`) وخارج القائمة |
| `tx crossvm call`                                         | معطّل على الشبكة الرئيسية بواسطة قاطع الدائرة؛ ومفعّل على شبكة الاختبار                        |
| `tx vesting create-vesting-account` و`create-periodic-vesting-account` و`create-permanent-locked-account` | ضمن قائمة قاطع الدائرة على الشبكة الرئيسية؛ ومنذ v3.2.3 لا يمكن في أي حال إنشاء حساب استحقاق تدريجي (vesting) إلا للموقّع نفسه |
| PQC `MsgDeprecateAlgorithm` / `MsgDisableAlgorithm`        | رسائل مقترحات الحوكمة (بلا أمر في سطر الأوامر)، وضمن قائمة قاطع الدائرة على الشبكة الرئيسية؛ ومنذ v3.2.3 لا تستطيع الحوكمة أيضاً إزالة آخر خوارزمية توقيع نشطة |
| `tx svm deploy-program` و`execute` و`create-account`      | مسار معاملات SVM معطّل على مستوى الشبكة كلها                                                   |
| `tx abstractaccount create` و`register-authenticator` و`execute-cosmos` و`execute-evm` | الشبكة الرئيسية: وحدة الحساب المجرّد متوقفة (يعرض `query abstractaccount config` القيمة `enabled: false`). شبكة الاختبار: فعّلتها الحوكمة (`enabled: true`، جرى التحقق في 27 أكتوبر 2026) |
| `tx rlconsensus *` و`tx amm pause-pool`/`resume-pool`      | رسائل سلطة الحوكمة؛ وهي أيضاً ضمن قائمة قاطع الدائرة على الشبكة الرئيسية                       |
| `tx license *`                                            | للسلطة فقط (تمنح سلطة التراخيص في الشبكة التراخيص؛ ومنذ v3.2.3 تستطيع الحوكمة استبدال تلك السلطة عبر `MsgUpdateAuthority`) |

القائمة الحية هي `qorechaind query circuit disabled-list`.
