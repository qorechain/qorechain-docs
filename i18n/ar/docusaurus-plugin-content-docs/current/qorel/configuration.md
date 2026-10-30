---
slug: /qorel/configuration
title: إعدادات QORel
sidebar_label: الإعدادات
sidebar_position: 5
---

# الإعدادات

يقرأ QORel ملف TOML واحدًا (`~/.hermes/config.toml` افتراضيًا، أو المسار المحدد بالخيار `--config`). وبالنسبة إلى أي سلسلة توقّع بالطريقة القياسية يكون الملف هو إعدادات Hermes نفسها؛ ويصف [دليل Hermes](https://hermes.informal.systems) كل إعداد فيها. تغطي هذه الصفحة ما يضيفه QORel: مدخل سلسلة QoreChain، والمفاتيح ما بعد الكمومية، وإعدادات الغاز، والفحوص التي تجري قبل إرسال أي معاملة. وهي موجّهة إلى المشغّلين الذين يكتبون ملف إعدادات QORel أو يراجعونه.

## الابتكارات {#innovations}

- **`signing` لكل سلسلة.** القيمة `'qorechain-hybrid'` تضيف توقيع ML-DSA-87 إلى كل معاملة يرسلها QORel إلى تلك السلسلة؛ أما `'standard'` (الافتراضية) فهي مطابقة لـ Hermes بايتًا ببايت. تعمل الإعدادات المختلطة: عملية واحدة وسلسلة من كل نوع.
- **إصدار sign-bytes يُقرأ من السلسلة.** مع `pqc.sign_bytes = 'auto'` يقرأ QORel سجلات الترقيات المطبّقة في السلسلة، ويوقّع بالصيغة المطابقة، ويعيد قراءتها كل دقيقة وبعد أي رفض، ولا يخترع إصدارًا أبدًا.
- **سعر الغاز من سوق الرسوم.** يتبع `dynamic_gas_price` مع `backend = 'cosmos-evm-feemarket'` الرسم الأساسي في QoreChain (الحد الأدنى 0.1 uqor لكل وحدة غاز).
- **إعدادات ترفض التوليفات غير الآمنة.** يُرفض عند التحميل الجمع بين `extension_options` الثابتة والتوقيع الهجين، لأن التوقيع ما بعد الكمومي يجب أن يكون خيار الامتداد الحرج الوحيد.

## كيفية الاستخدام {#how-to-use}

### مدخل سلسلة QoreChain {#chain-entry}

هذا هو مدخل شبكة الاختبار من ملف الإعدادات النموذجي. استبدل عناوين العقد بعقدة شبكة الاختبار الخاصة بك:

```toml
[[chains]]
id = 'qorechain-diana'
type = 'CosmosSdk'
rpc_addr = 'http://YOUR-QORECHAIN-NODE:26657'
grpc_addr = 'http://YOUR-QORECHAIN-NODE:9090'
event_source = { mode = 'push', url = 'ws://YOUR-QORECHAIN-NODE:26657/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'qor'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000

# The QoreChain-specific part:
signing = 'qorechain-hybrid'
gas_price = { price = 0.1, denom = 'uqor' }
gas_multiplier = 1.1
dynamic_gas_price = { enabled = true, multiplier = 1.0, max = 10.0, backend = 'cosmos-evm-feemarket' }
# optional, defaults shown:
# pqc = { sign_bytes = 'auto', sign_mode = 'hedged', include_public_key = false }

clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
# Relay only the channels you operate.
packet_filter = { policy = 'allow', list = [['transfer', 'channel-0']] }
```

الإعدادات الخاصة بـ QoreChain:

| الإعداد | القيمة | ما الذي يفعله |
|---|---|---|
| `signing` | `'qorechain-hybrid'` | يضيف توقيع ML-DSA-87 (FIPS 204) إلى كل معاملة تُرسل إلى هذه السلسلة. احذفه، أو استخدم `'standard'`، لكل سلسلة أخرى. |
| `account_prefix` | `'qor'` | بادئة عناوين حسابات QoreChain. |
| `gas_price` | `{ price = 0.1, denom = 'uqor' }` | الحد الأدنى للرسوم هو 0.1 uqor لكل وحدة غاز. |
| `gas_multiplier` | `1.1` | يضاعف الغاز المحاكى للحصول على حد الغاز. راجع [الغاز](#gas). |
| `dynamic_gas_price.backend` | `'cosmos-evm-feemarket'` | يقرأ الرسم الأساسي لسوق الرسوم في السلسلة بدلًا من الاكتفاء بـ `gas_price`. |
| `pqc.sign_bytes` | `'auto'` (افتراضي) أو `'v1'` أو `'v2'` | القيمة `auto` تقرأ إصدار sign-bytes من السلسلة؛ و`v1` و`v2` تفرضان صيغة واحدة. أبقِه على `auto`. |
| `pqc.sign_mode` | `'hedged'` (افتراضي) أو `'deterministic'` | توقيع ML-DSA عشوائي أو حتمي. تقبل السلسلة الاثنين. |
| `pqc.include_public_key` | `false` (افتراضي) | هل يُضمَّن المفتاح العام في امتداد كل توقيع. هذا لا يسجّل المفتاح؛ وحده `keys register-pqc` يفعل ذلك. |

نقاط نهاية شبكة اختبار QoreChain العامة الخاصة بالقراءة مدرجة في [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet). ويحتاج المُرحِّل أيضًا إلى gRPC وهو غير عام، لذا شغّل عقدتك الخاصة لجانب QoreChain.

### أي سلسلة أخرى مبنية على Cosmos SDK {#other-chains}

اكتب المدخل كما تكتبه لـ Hermes واترك `signing` خارجه. هذا هو مدخل شبكة اختبار Cosmos Hub العامة من ملف الإعدادات النموذجي:

```toml
[[chains]]
id = 'provider'
type = 'CosmosSdk'
rpc_addr = 'https://rpc.provider-sentry-01.hub-testnet.polypore.xyz'
grpc_addr = 'https://grpc.provider-sentry-01.hub-testnet.polypore.xyz:443'
event_source = { mode = 'push', url = 'wss://rpc.provider-sentry-01.hub-testnet.polypore.xyz/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'cosmos'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000
gas_price = { price = 0.005, denom = 'uatom' }
gas_multiplier = 1.3
dynamic_gas_price = { enabled = true, multiplier = 1.1, max = 0.1, backend = 'skip-feemarket' }
clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
packet_filter = { policy = 'allow', list = [['transfer', 'channel-600']] }
```

هذه النقاط تعود إلى طرف ثالث، وهي عامة، وقد تحدّ من معدل الطلبات. استخدم عقدك الخاصة للترحيل المستمر.

### الإعدادات العامة {#global}

يستخدم ملف الإعدادات النموذجي ما يلي، وهي إعدادات Hermes:

```toml
[global]
log_level = 'info'

[mode.clients]
enabled = true
refresh = true
misbehaviour = true

[mode.connections]
enabled = false

[mode.channels]
enabled = false

[mode.packets]
enabled = true
clear_interval = 50
clear_on_start = true
tx_confirmation = true

[rest]
enabled = false
host = '127.0.0.1'
port = 3000

[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

يُبقي `mode.clients` العملاء الخفيفين محدّثين ويراقب سوء السلوك؛ ويرحّل `mode.packets` الحزم ويمسح المعلّقة منها كل `clear_interval` كتلة وعند البدء. أما مصافحات الاتصالات والقنوات فتُترك لأوامر `create`. ويُشرح منفذ القياس عن بُعد في صفحة [المراقبة](/qorel/monitoring).

### المفاتيح {#keys}

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana
```

- يخزّن `keys add` (أو `--key-file` مع ملف مفتاح يحوي العبارة السرية) مفتاح secp256k1 كما يفعل Hermes، وعلى سلسلة هجينة يشتق مفتاح ML-DSA-87 من العبارة السرية والحساب نفسيهما باشتقاق محفظة QoreChain. ولا يُخزَّن منه سوى البذرة ذات 32 بايت، بجانب المفتاح، باسم `<key name>.pqc`. ولا يُطبع أي سر. راجع [اشتقاق المفاتيح](/qoresign/guides/key-derivation) لمعرفة الاشتقاق.
- يرسل `keys register-pqc` الرسالة `MsgRegisterPQCKeyV2` مرة واحدة. وهي المعاملة الوحيدة التي تقبلها QoreChain بالتوقيع الكلاسيكي وحده، وتحمل إثبات حيازة على الشبكات من الإصدار v3.2.3 فما فوق. وهي متكررة الأثر بلا ضرر (idempotent) وترفض الإرسال إذا كان للحساب مفتاح مختلف مسجّل. راجع [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing#pqc-key-registration) لمعرفة ما تتحقق منه السلسلة.
- يعرض `keys pqc-status` هل المفتاح مسجّل، وهل يطابق المفتاح المحلي، وهل ثبتت حيازته بإثبات حيازة، وأي sign bytes تتحقق منها السلسلة. ويجب أن تكون قيمة `ready_to_relay` هي `true`.
- استخدم حساب مُرحِّل مخصصًا برصيد صغير، ولا تستخدم أبدًا مفتاح مشغّل مدقّق.
- تُكتب ملفات المفاتيح (`<key name>.json` و`<key name>.pqc`) بحيث يقرؤها المالك وحده (0600). كان Hermes الأصلي يستخدم umask الافتراضي؛ والمفاتيح المضافة بإصدار أقدم من Hermes تحتفظ بصلاحياتها القديمة، فتحقق منها بالأمر `ls -l`.

### الغاز {#gas}

تحتسب QoreChain الرسم كاملًا (حد الغاز مضروبًا في السعر) دون أي استرداد، فأبقِ المضاعِف ضيقًا.

- على السلسلة v3.2.5 وما بعدها (أُخذ القياس أدناه على شبكة الاختبار بالإصدار v3.2.6؛ وطبّقت الشبكة الرئيسية v3.2.5 في 29 أكتوبر 2026 لكن QORel لم يرحّل عليها) تطابق المحاكاة التسليم بفارق بضع مئات من وحدات الغاز. ويمر الاختبار المحلي الشامل على إصدار من هذا الخط بالقيمة `1.05` (استخدمت كل معاملة ترحيل 95% من حدها).
- الإصدارات الأقدم تُقدّر أقل بنحو 8 إلى 10% (قيس ذلك على شبكة تطوير تجريبية سابقة للإصدار، حيث ترك `1.15` هامشًا بين 4 و7%). استخدم `1.15` إلى أن تقيس عقدك الخاصة.
- يبلّغ `health-check` عن أي مضاعِف أقل من `1.1` على مدخل QoreChain بوصفه خطأ محتملًا في الإعداد. وهذا تحذير والترحيل يظل يعمل. أما `1.1`، وهي القيمة في ملف الإعدادات النموذجي، فتُبقيه نظيفًا مقابل رسم أكبر بنحو 5% عن `1.05`.
- تستخدم معاملة `keys register-pqc` لمرة واحدة القيمة `1.1` على الأقل مهما كان ما في الإعدادات.
- يضيف كل توقيع هجين نحو 4.7 كيلوبايت إلى المعاملة و2,000 وحدة غاز للتحقق؛ وتشمل المحاكاة الاثنين.

### فحوص الأمان قبل كل إرسال {#safety-checks}

قبل كل معاملة إلى سلسلة هجينة، يتحقق QORel من أن المفتاح ما بعد الكمومي محمّل ومسجّل في السلسلة ومطابق للمفتاح المحلي، وأن إصدار sign-bytes معروف. وإذا فشل أي فحص فلا يرسل شيئًا (ولا يُنفق أي رسم) ويبلّغ `health-check` بالسبب. ويؤدي رفض من السلسلة بالرمز codespace `pqc` والرمز 21 إلى أن يعيد QORel قراءة الإصدار والتسجيل قبل المعاملة التالية.

### ملاحظات لسلاسل ibc-go v10 {#ibc-go-v10}

- لم تعد البرمجية الوسيطة لرسوم ICS-29 موجودة في ibc-go v10؛ والرسوم هي سعر الغاز، وجهة منح الرسوم (fee granter)، والرسم الأساسي الديناميكي.
- لم يعد ibc-go v10 يضع الترويسة في أحداث `update_client`. ويقرؤها QORel بدلًا من ذلك من معاملة `MsgUpdateClient`، فيستمر اكتشاف سوء السلوك في العمل (أما Hermes 1.13 الأصلي فيعطّله على هذه السلاسل).

### نقاط النهاية المحدودة المعدل {#rate-limits}

كثيرًا ما تردّ نقاط النهاية العامة على دفعات الطلبات بـ `429 Too Many Requests`، مثلًا فور بدء المُرحِّل. يعدّ Hermes ذلك قابلًا لإعادة المحاولة، لكن عمّال الحزم فيه يتوقفون أيضًا بعد `clear_interval x 5` كتل دون أحداث IBC جديدة، حتى لو فشلت آخر جولة مسح؛ فالحزمة التي كانت معلّقة في تلك اللحظة تنتظر حتى الحزمة التالية على القناة أو حتى إعادة التشغيل. أما QORel فيُبقي عمّال الحزم لقناة ما قيد التشغيل بينما فشلت محاولة ترحيل أو مسح، ويعيد المحاولة عند كل فترة مسح. ولا يتوقفون بسبب الخمول إلا بعد نجاح جولة مسح. فضّل عقدك الخاصة أو نقطة نهاية مدفوعة للترحيل في بيئة الإنتاج، ونبّه عند وجود حزم معلّقة ([المراقبة](/qorel/monitoring)).

## كيفية الوصول {#how-to-access}

- **مكان الملف.** `~/.hermes/config.toml` لتثبيت الأرشيف أو Homebrew، و`/etc/qorel/config.toml` لحزمتي `.deb` و`.rpm`، والمجلد المركَّب للحاوية. يمكن تجاوزه بالخيار `--config <path>`.
- **مخزن المفاتيح.** يحدد `key_store_folder` مكان حفظ المفاتيح؛ والافتراضي `~/.hermes/keys`، وتستخدم الحزم `/var/lib/qorel/keys`.
- **المتطلبات المسبقة.** نقاط نهاية RPC وgRPC وWebSocket لكل سلسلة، وحساب مُرحِّل ممول على كل منها.
- **فحص ملف الإعدادات.** يحمّل `qorel health-check` الملف ويختبر كل سلسلة.

## أين يُنشر {#where-published}

| ماذا | أين |
|---|---|
| ملف الإعدادات النموذجي (شبكة الاختبار، وQoreChain وشبكة اختبار Cosmos Hub العامة) | `packaging/config.example.toml` في [qorechain/QORel](https://github.com/qorechain/QORel)؛ وتثبّته الحزم في `/etc/qorel/config.example.toml` |
| مرجع إعدادات Hermes | [hermes.informal.systems](https://hermes.informal.systems) |

## الحدود والمشكلات المعروفة {#limits}

- **تُرفض `extension_options` الثابتة** على سلسلة فيها `signing = 'qorechain-hybrid'`.
- **أبقِ `pqc.sign_bytes` على `auto`.** قيمة ثابتة `v1` أو `v2` لا تطابق ما تتحقق منه السلسلة تجعل السلسلة ترفض كل معاملة.
- **صلاحيات الملفات للمفاتيح الأقدم.** الملفات التي كتبها Hermes أقدم تحتفظ بصلاحياتها القديمة.
- **نقاط نهاية الأطراف الثالثة.** نقاط النهاية من جهة Hub في ملف الإعدادات النموذجي لا تديرها QoreChain وقد تتغير أو تحدّ من المعدل.
- **مدخل شبكة الاختبار فقط.** مدخل QoreChain هنا مخصص لـ `qorechain-diana`. الشبكة الرئيسية غير مفتوحة لـ IBC.
