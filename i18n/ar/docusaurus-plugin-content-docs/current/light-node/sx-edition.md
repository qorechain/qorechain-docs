---
slug: /light-node/sx-edition
title: إصدار SX (عفريت الخادم)
sidebar_label: إصدار SX
sidebar_position: 2
---

# إصدار SX — عفريت الخادم

إصدار **SX (تجربة الخادم - Server eXperience)** هو العقدة الخفيفة بلا واجهة: عفريت إضافةً إلى سطر أوامر إدارة كامل، مبني للخوادم والأتمتة. الثنائي هو `lightnode-sx`. هذا هو خط **v3.1.3** للعقدة الخفيفة للثنائيات الجاهزة (وسم المصدر `v3.1.4` لبناءات Docker)، وهو إصدارها الخاص، منفصل عن إصدار السلسلة.

## التثبيت {#install}

الثنائيات الجاهزة هي الطريق الأسهل — عميل العقدة الخفيفة يعمل بشكل أصلي على **ست منصات بلا أي تبعيات أصلية**: لينكس (amd64، arm64)، ماك macOS (Intel، Apple Silicon)، وويندوز (amd64، arm64) — أي 12 ثنائيًا إجمالًا بين إصداري SX وUX. حجم كل ثنائي نحو 11–12 ميغابايت — حمِّله وشغِّله، بلا مكتبات منفصلة يجب تثبيتها.

**تحقَّق من المجموع الاختباري قبل تشغيله.** يحمل بيان الإصدار على `https://download.qore.host/<net>/lightnode/latest.json` قيمة `sha256` لكل ثنائي، وحقل `checksums.url` يشير إلى ملف `SHA256SUMS` يغطي الإصدار بأكمله، وقيمة `checksums.sha256` لذلك الملف نفسه. تحقَّق مما حمَّلته — هذه ليست ملاحظة هامشية، بل هي الفارق بين تشغيل الثنائي الذي بُني فعلًا وتشغيل أيًّا كان ما هبط على ذلك الرابط:

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

على ويندوز، قارن ناتج `certutil -hashfile lightnode-sx-<platform>.exe SHA256` بقيمة البيان. تخدم الشبكتان حاليًا بناء v3.1.3 نفسه. المصدر عام على `github.com/qorechain/qorechain-lightnode` (Apache 2.0).

يمكنك أيضًا بناء الثنائي من المصدر أو تشغيله عبر Docker.

### البناء من المصدر

تتطلب العقدة الخفيفة **Go 1.26.1**. تشفيرها ما بعد الكمّي هو تطبيق بلغة Go خالصة (بلا CGO، بلا مكتبة أصلية)، لذا فإن البناء المتقاطع لأي من المنصات الست المدعومة يعمل بنفس الطريقة التي يعمل بها أي ثنائي Go آخر:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

ينتج هذا `build/lightnode-sx`. شغِّله مباشرة، أو انسخه إلى `PATH` الخاص بك. قبل التسجيل، تحقَّق من سلامة حزمة التوقيع ما بعد الكمّي عبر [`selftest`](#verify-the-pqc-stack-selftest).

### Docker {#docker}

لا توجد صورة جاهزة في سجل الصور؛ تبنيها من وسم المصدر. استخدم الوسم **`v3.1.4` أو أحدث**: الصورة المبنية من `v3.1.3` تضم موقِّعًا `qorechaind` أقدم ترفضه السلسلة الآن، فتفشل نبضاتها (heartbeats) ومطالباتها بالمكافآت. لتحديث تثبيت قائم، أعد البناء من الوسم الجديد (`git fetch --tags && git checkout v3.1.4 && docker compose build --no-cache lightnode-sx`)؛ السحب (pull) لا يفعل شيئًا.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.4

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring
export QORE_LIGHTNODE_QORECHAIND_PASSPHRASE='...'   # qorechaind keyring (operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: write config.toml and the node key into the data volume.
docker compose run --rm lightnode-sx onboard
# Then set chain_id, key_name, operator_address and [heartbeat] key_name in
# /root/.qorechain-lightnode/config.toml inside the volume (see "First run").

docker compose up -d lightnode-sx
```

أبقِ `QORECHAIN_RPC_ADDR` مُصدَّرًا مع كل أمر `docker compose`: فهو يتجاوز `rpc_addr` من ملف الإعدادات، بينما القيمة الافتراضية في compose تشير إلى `host.docker.internal:26657`. تحفظ حاوية SX بياناتها في وحدة تخزين مسمّاة مركَّبة عند `/root/.qorechain-lightnode`.

تحمل الصورة أيضًا `qorechaind` منشورًا (v3.2.0، linux/amd64، يُنزَّل من قناة الإصدارات وقت البناء ويُفحص مقابل بصمة مثبَّتة). يشغِّله العفريت لتوقيع النبضات ومطالبات المكافآت، فتستطيع عقدة الحاوية البقاء نشطة على السلسلة دون تثبيت ثانٍ. إذا رقّت شبكة لاحقًا إلى إصدار يرفض الموقِّع المضمَّن، فوجِّه `[heartbeat] qorechaind_path` إلى `qorechaind` الأحدث المدرج في بيان تلك الشبكة (`https://download.qore.host/<net>/latest.json`). على مضيف arm64 (مثل Apple Silicon) لا يحتوي البناء على موقِّع؛ ابنِ باستخدام `DOCKER_DEFAULT_PLATFORM=linux/amd64` إن احتجت إليه. يحتاج الموقِّع إلى محفظة المشغِّل: ركِّب الدليل الرئيسي لـ `qorechaind` (حلقة المفاتيح التي تحمل مفتاح المشغِّل، إضافةً إلى مفتاح العقدة المُصدَّر تحت `pqc/<key_name>.dilithium`) عند `/root/.qorechaind`؛ يركِّب `docker-compose.yml` المجلد `~/.qorechaind` افتراضيًا، أو عيِّن `QORECHAIND_HOME`. عبارتا المرور هما عبارة حلقة مفاتيح العقدة وعبارة حلقة مفاتيح `qorechaind`؛ تُمرَّر الثانية إلى `qorechaind` عبر الدخل القياسي ولا تظهر أبدًا في سطر أوامر. راجع [محفظة المشغِّل](#operator-wallet).

## التهيئة

تقرأ العقدة الخفيفة ملف إعدادات TOML. افتراضيًا تبحث عن `config.toml` في الدليل الرئيسي (`~/.qorechain-lightnode/config.toml`). عادةً لا تكتب هذا الملف يدويًا — يُنشئه لك [معالج `onboard`](#first-run-onboard) — لكن من المفيد فهم الخيارات.

ينطبق علمان دائمان على كل أمر:

- `--config <path>` — أشِر إلى ملف إعدادات في موقع غير افتراضي.
- `--home <dir>` — تجاوز الدليل الرئيسي المستخدَم للبيانات والمفاتيح (الافتراضي `~/.qorechain-lightnode`).

أكثر خيارات التهيئة صلةً، على مستوى الاستخدام:

| الخيار | ما يتحكم به |
| --- | --- |
| `chain_id` | معرّف الشبكة (مثل `qorechain-diana` على شبكة الاختبار، `qorechain-vladi` على الشبكة الرئيسية). اضبطه بنفسك بعد `onboard` الذي يترك `qorechain-diana`؛ يستخدمه الموقِّع. |
| `rpc_addr` | نقطة نهاية RPC للسلسلة التي يتصل بها العفريت. اتركها فارغة للتشغيل في **الوضع المحلي فقط**. |
| `primary_addr` / `witness_addrs` | نقطة نهاية RPC الأساسية، ونقاط نهاية الشهود التي تُثبَت الترويسة المُبلَّغ عنها في مقابلها — راجع [لماذا تشغِّل عقدة خفيفة](/light-node/overview#why-run-a-light-node). وجود شاهد واحد مميّز وقابل للوصول على الأقل هو ما ينقل قيمة `assurance` (المسجَّلة على مستوى debug) من `trusted-single-source` إلى `corroborated-across-sources`. |
| `trust_period` / `max_clock_drift` | مقبولان للتوافق لكنهما غير مستخدمين حاليًا. تأتي ثقة الترويسة من تثبيت الأساسي/الشهود الموصوف أعلاه. |
| `data_dir` | حيث تخزِّن العقدة قاعدة بياناتها وترويساتها. |
| `keyring_backend` / `key_name` | خلفية حلقة المفاتيح (`file` أو `os`، أو `test` لشبكات التطوير المحلية فقط) واسم مفتاح العقدة ما بعد الكمّي. تتطلب خلفية `file` وجود `QORE_LIGHTNODE_KEYRING_PASSPHRASE` في البيئة. |
| `operator_address` | الحساب الذي تنتمي إليه هذه العقدة (`qor1...`)؛ يُتحقَّق منه عند التحميل. مطلوب لـ `register` و`status` والنبضات. راجع [محفظة المشغِّل](#operator-wallet). |
| `api_addr` | نقطة نهاية REST. تُشتق من `rpc_addr` عند تركها فارغة (يصبح المنفذ 26657 هو 1317؛ وتصبح مضيفات `rpc.` هي `api.`)، لذا لا حاجة إليها إلا لنقاط نهاية لا تتبع أيًّا من الاصطلاحين. |
| `[heartbeat]` | مفعَّل افتراضيًا. `qorechaind_path` (الفارغ يعني `qorechaind` على `PATH`؛ وتشحنه صورة Docker)، `qorechaind_home` (الفارغ يعني `~/.qorechaind`)، `key_name` (مفتاح حساب `qorechaind`؛ افتراضيًا `key_name` على المستوى الأعلى)، `interval_blocks` (طابِق `heartbeat_interval` للسلسلة، أي 1000)، `check_interval` (الافتراضي `60s`)، `fees` (الافتراضي `50000uqor`) و`gas` (الافتراضي `300000`). |
| `[delegation]` | `auto_claim` (متوقف افتراضيًا: يطالب بمكافآت العقدة الخفيفة المتراكمة إلى محفظة المشغِّل عبر الموقِّع؛ ولا تعيد العقدة التفويض أبدًا من الخادم)، وفترة الفحص، والحد الأدنى للمكافأة للمطالبة، و`rebalance_enabled` و`min_reputation` (تنبيهات السمعة فقط — لا تنقل العقدة الحصة أبدًا). يُقبل `validators` و`split_weights` لكن لا يُعمل بهما حاليًا. |
| `[telemetry]` | ما إذا كان القياس عن بُعد مفعَّلًا وفترات تحديث المُدققين والشبكة والجسر واقتصاد الرمز. |
| `log_level` / `log_format` | مستوى تفصيل التسجيل (`debug`, `info`, `warn`, `error`) والصيغة (`text` أو `json`). |

### متغيرات البيئة {#environment-variables}

| المتغير | الاستخدام |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | عبارة مرور حلقة مفاتيح العقدة (`keyring_backend = "file"`). مطلوبة؛ ترفض العقدة عبارة فارغة. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | عبارة مرور حلقة مفاتيح `qorechaind` التي تحمل مفتاح المشغِّل؛ تُمرَّر إلى `qorechaind` عبر الدخل القياسي، ولا تظهر أبدًا في سطر أوامر. |
| `QORECHAIN_RPC_ADDR` | يتجاوز `rpc_addr` (و`primary_addr` عندما كان مساويًا لـ `rpc_addr`). يضبطه `docker-compose.yml`. |

:::note يجري التحقق من نقاط نهاية الشهود عند بدء التشغيل
يُرفَض أي شاهد على نفس المضيف الذي عليه العنوان الأساسي — إذ إن نقطة نهاية مخترَقة ستوافق ببساطة على نفسها، فلا تُثبِت شيئًا. كما يُرفَض شاهد نصّي غير مشفَّر عبر `http://` على مضيف بعيد، لأن أي مهاجم قادر على إعادة كتابة ذلك الاتصال يمكنه الرد كأنه كل شاهد في آن واحد؛ أما `http://` على العنوان المحلي (loopback) فمقبول. وجِّه الشهود إلى نقاط نهاية RPC لديك أسباب مستقلة للثقة بها.
:::

تفعِّل إعدادات التفويض الافتراضية تنبيهات إعادة التوازن المدركة للسمعة وتترك `auto_claim` متوقفًا — راجع [المكافآت والمراقبة](/light-node/rewards-and-monitoring) لما تفعله هذه.

## التشغيل الأول: `onboard` {#first-run-onboard}

عند أول إطلاق، سيتوقف `start` ويوجِّهك إلى معالج التهيئة الأولية إن لم يوجد ملف إعدادات بعد. شغِّل المعالج:

```bash
build/lightnode-sx onboard
```

يرشدك `onboard` خلال الإعداد في أربع خطوات:

1. **الاختبار الذاتي لـ PQC** — يشغِّل دورة Dilithium-5 الكاملة (نفس فحوص [`selftest`](#verify-the-pqc-stack-selftest)). إذا فشلت حزمة PQC، يرفض المعالج المتابعة.
2. **نقطة نهاية RPC للسلسلة** — الصق رابط RPC الخاص بـ QoreChain، أو اتركه فارغًا للتشغيل في **الوضع المحلي فقط** بينما لا حاجة لاتصال بالسلسلة. إذا قدّمت رابطًا، يختبر المعالج إمكانية الوصول حيًّا.
3. **مفتاح العقدة** — يسمّيه المعالج «المفتاح الخاص للمُدقق»، لكنه مفتاح Dilithium-5 الخاص بالعقدة الخفيفة نفسها، وليس مفتاح مُدقق. الصق مفتاحًا خاصًا بصيغة Dilithium-5 مرمَّزًا بالست عشري، أو اكتب `g` (أو `generate`) لسك زوج مفاتيح جديد على هذه العقدة.
4. **الحفظ** — يكتب `config.toml` ويخزِّن المفتاح في حلقة المفاتيح تحت الاسم `validator` (أو `validator-<hex>` إن كان ذلك الاسم مأخوذًا). تحتاج حلقة مفاتيح الملف إلى ضبط `QORE_LIGHTNODE_KEYRING_PASSPHRASE` في البيئة لهذه الخطوة ولكل أمر لاحق يفتحها.

:::note الوضع المحلي فقط
إذا تركت نقطة النهاية فارغة، يبدأ العفريت في الوضع المحلي فقط: تُمارَس حزمة PQC بالكامل، لكن العقدة لا تتزامن مع أي سلسلة. أعد تشغيل `onboard` بمجرد أن تكون نقطة نهاية سلسلتك جاهزة لتوجيه العقدة إليها.
:::

يكتب `onboard` دائمًا فوق الإعدادات النشطة. استخدم `--config` للكتابة إلى مسار غير افتراضي، أو `--non-interactive` للفشل السريع بدلًا من المطالبة (مفيد في CI).

:::caution أكمل الإعدادات بعد التهيئة الأولية
لا يعرف `onboard` أي شبكة تنضم إليها ولا أي حساب هو حسابك. قبل تشغيل `register` أو الاعتماد على النبضات، عدِّل `config.toml`:

```toml
chain_id         = "qorechain-vladi"   # mainnet; testnet is "qorechain-diana". onboard leaves "qorechain-diana".
key_name         = "validator"         # the key onboard created; see `lightnode-sx keys list`
operator_address = "qor1..."           # your funded operator account

[heartbeat]
key_name = "operator"                  # the qorechaind key that holds operator_address
```

`key_name` على المستوى الأعلى هو مفتاح العقدة ما بعد الكمّي (ملفه `pqc/<key_name>.dilithium` في الدليل الرئيسي لـ `qorechaind`)؛ أما `[heartbeat] key_name` فهو مفتاح حساب `qorechaind` الذي يدفع الرسوم. إذا تركت `key_name = "operator"` بينما المفتاح اسمه `validator`، يتوقف `register` مع الرسالة `node key "operator" not found`.
:::

## التشغيل: `start`

بمجرد أن تكتب التهيئة الأولية ملف إعدادات، ابدأ العفريت:

```bash
build/lightnode-sx start
```

يزامن العفريت الترويسات، ويتعقب التفويضات، ويقدم القياس عن بُعد حتى يُقاطَع. إذا أردت عمدًا البدء دون ملف إعدادات (محلي فقط، بلا RPC للسلسلة)، مرِّر `--skip-onboarding-check`.

## التحقق من حزمة PQC: `selftest` {#verify-the-pqc-stack-selftest}

يمكنك في أي وقت التأكد من أن حزمة ما بعد الكمّي تعمل:

```bash
lightnode-sx selftest
```

يشغِّل `selftest` خمسة فحوص مقابل Dilithium-5 (ML-DSA-87) ويكتمل في أقل من ثانية:

1. **توليد المفاتيح** — توليد زوج مفاتيح جديد.
2. **التوقيع** — توقيع رسالة اختبارية.
3. **التحقق (توقيع صالح)** — تأكيد أن التوقيع يتحقق بالمفتاح العام المطابق.
4. **رفض التوقيع المعبوث به** — اقلب بايتًا من التوقيع؛ يجب أن يرفضه التحقق.
5. **رفض الرسالة المعبوث بها** — اقلب بايتًا من الرسالة؛ يجب أن يرفضها التحقق.

إذا فشل أي فحص، يخرج الثنائي بقيمة غير صفرية مع مخرجات تشخيصية. هذا هو الاختبار نفسه الذي يشغِّله معالج التهيئة الأولية كخطوته الأولى، وهو مفيد للتحقق قبل النشر ولتشخيصات الدعم.

## محفظة المشغِّل {#operator-wallet}

مفتاح Dilithium-5 الخاص بالعقدة **ليس** محفظة. على QoreChain يُرفَق مفتاح ما بعد كمّي بحساب؛ ولا ينشئ حسابًا. لهذا لا يعرض `keys list` أي عنوان له. **عنوان المشغِّل** الخاص بك هو حساب `qor1…` عادي ممول، يُنشأ باستخدام `qorechaind`، تُسجَّل العقدة منه وتستلم عليه مكافآت العقدة الخفيفة. يصبح مفتاح العقدة هو المفتاح ما بعد الكمّي لذلك الحساب.

أعدّه مرة واحدة:

```bash
# 1. Create and fund the operator account (any Cosmos wallet works; qorechaind shown)
qorechaind keys add operator
qorechaind keys show operator -a          # -> qor1..., fund it with a little QOR for fees

# 2. Tell the node which account it belongs to
#    config.toml:  operator_address = "qor1..."

# 3. Let the node print the two chain commands (attach the key, register the node)
lightnode-sx register
```

يطبع `register`، مملوءًا بقيمك: الأمر `qorechaind tx pqc register-key-v2 dilithium5 … hybrid` الذي يرفق مفتاح العقدة بالحساب (مرة واحدة)، والزوج `tx lightnode register … --generate-only` و`tx pqc cosign` اللذان يسجّلان العقدة. تشترط السلسلة التوقيع المشترك ما بعد الكمّي على كل معاملة، ولهذا يتطلب التسجيل أمرين لا أمرًا واحدًا. يتطلب التسجيل أيضًا ترخيص `lightnode_operator` نشطًا على عنوان المشغِّل؛ وبدونه ترفض السلسلة المعاملة. التسجيل غير مفتوح بعد: راجع [حالة برنامج المكافآت](/light-node/overview#reward-program-status).

## أوامر الإدارة

يتضمن سطر أوامر SX أوامر لفحص حالة العقدة وإدارة المفاتيح:

| الأمر | الغرض |
| --- | --- |
| `onboard` | معالج التشغيل الأول التفاعلي. |
| `start` | تشغيل العفريت. |
| `selftest` | تشغيل الاختبار الذاتي لـ PQC. |
| `status` | عرض حالة مزامنة العقدة والعميل الخفيف (معرّف السلسلة، أحدث ارتفاع، حالة اللحاق بالركب) إضافةً إلى الأسطر `Signer` و`Operator` و`Licence` و`Registration`. |
| `keys create <name>` | إنشاء مفتاح Dilithium-5 جديد للعقدة وطباعة مفتاحه العام. |
| `keys list` | سرد المفاتيح في حلقة المفاتيح (الاسم، النوع، العنوان إن وُجد، المفتاح العام). |
| `keys show <name>` | طباعة نوع المفتاح ومفتاحه العام الكامل. |
| `keys import <name> <hex-privkey>` | استيراد مفتاح خاص مرمَّز بالست عشري. |
| `keys export <name>` | تصدير مفتاح خاص بالست عشري (الصيغة نفسها التي يقرؤها `qorechaind` من `~/.qorechaind/pqc/`). |
| `register` | طباعة أوامر السلسلة التي ترفق مفتاح العقدة بحساب المشغِّل وتسجّل العقدة — راجع [التسجيل والترخيص](/light-node/registration-and-licensing). |
| `validators` | سرد المُدققين المربوطين. |
| `delegation` | عرض التفويضات الحالية من قاعدة البيانات المحلية (راجع القيد المعروف في [المكافآت والمراقبة](/light-node/rewards-and-monitoring#how-rewards-work)). |
| `rewards` | عرض مكافآت الستيكينغ المعلَّقة (القيد نفسه). |
| `network` | عرض القياس عن بُعد للشبكة (الترويسات المتزامنة الأخيرة) من قاعدة البيانات المحلية. |
| `version` | طباعة إصدار الثنائي. |

لتفاصيل الستيكينغ والمكافآت والمراقبة راجع [المكافآت والمراقبة](/light-node/rewards-and-monitoring). للتسجيل على السلسلة، راجع [التسجيل والترخيص](/light-node/registration-and-licensing).
