---
slug: /qorel/monitoring
title: مراقبة QORel
sidebar_label: المراقبة
sidebar_position: 7
---

# المراقبة

المُرحِّل الذي يتوقف بصمت يترك حزمًا معلّقة، لذا ينبغي مراقبته. تسرد هذه الصفحة ما يوفره QORel (قياس Prometheus عن بُعد، ونقطة REST اختيارية، والسجلات، والأوامر) وما ينبغي التنبيه عليه. وهي موجّهة إلى المشغّلين الذين يديرون مُرحِّلًا لقناة تهمّهم.

## الابتكارات {#innovations}

- **فحص لحالة مفتاح PQC يمكن برمجته.** يطبع `qorel keys pqc-status` كائن JSON يكون حقله `ready_to_relay` هو `true` فقط عندما يكون المفتاح مسجّلًا في السلسلة ومطابقًا للمفتاح المحلي. والتنبيه على هذا الحقل يكشف مفتاحًا مفقودًا أو متغيرًا قبل أن يُرفض المُرحِّل.
- **إخفاقات لا توقف الترحيل بصمت.** يواصل عمّال الحزم العمل ويعيدون المحاولة عند كل فترة مسح بعد فشل محاولة ترحيل أو مسح، فيظهر تحديد المعدل العابر في صورة تحذيرات في السجل لا في صورة قناة عالقة.
- **فحص قبل الإرسال مع ذكر السبب.** عندما يرفض فحص ما قبل الإرسال معاملة (مفتاح غير مسجّل، أو عدم تطابق المفتاح، أو إصدار sign-bytes غير معروف) لا يُرسل شيء، ويُسجَّل السبب ويعرضه `qorel health-check`.

## كيفية الاستخدام {#how-to-use}

### القياس عن بُعد {#telemetry}

فعّله في ملف الإعدادات:

```toml
[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

تُقدَّم المقاييس بصيغة Prometheus على العنوان `http://127.0.0.1:3001/metrics`. وهي مقاييس Hermes؛ ويعرض Prometheus العدّادات بلاحقة `_total`. والمقاييس التي تستحق الرسم البياني:

| المقياس | السبب |
|---|---|
| `workers` | عدد العمّال العاملين حسب النوع؛ والانخفاض يعني أن عاملًا توقف. |
| `backlog_size`, `backlog_oldest_sequence` | الحزم المنتظرة على قناة وأقدم تسلسل لا يزال ينتظر. |
| `wallet_balance` | رصيد المُرحِّل على كل سلسلة. |
| `receive_packets_confirmed`, `acknowledgment_packets_confirmed`, `timeout_packets_confirmed` | الحزم التي رُحّلت. الخط المسطّح بينما يتزايد المتأخر يعني توقفًا. |
| `client_updates_submitted`, `client_misbehaviours_submitted` | صيانة العميل الخفيف وبلاغات سوء السلوك. |
| `broadcast_errors`, `simulate_errors` | المعاملات التي رُفضت أو فشلت محاكاتها. |
| `ws_reconnect` | إعادات اتصال WebSocket؛ وكثرتها المتتالية تشير إلى نقطة نهاية غير مستقرة. |
| `tx_latency_submitted`, `tx_latency_confirmed` | المدة التي تستغرقها المعاملات. |

يوثّق Hermes المجموعة الكاملة في [دليل القياس عن بُعد](https://hermes.informal.systems/documentation/telemetry/operators.html). والمستمع على `127.0.0.1` في ملف الإعدادات النموذجي؛ فضع أداة Prometheus التي تجمع المقاييس على المضيف نفسه أو غيّر `host` عن قصد.

### ما الذي ينبغي التنبيه عليه {#alerts}

| ماذا | أين |
|---|---|
| العملية تعمل | نقطة القياس عن بُعد تردّ |
| الحزم والإقرارات المعلّقة على قنواتك | `qorel query packet pending --chain <id> --port transfer --channel <channel>` |
| رصيد المُرحِّل على كل سلسلة | `qorel keys balance --chain <id>`، أو `wallet_balance` |
| جاهزية مفتاح PQC | يبلّغ `qorel keys pqc-status` عن `ready_to_relay: true` |
| حداثة العميل | يحدّث QORel العميل عند ثلث فترة الثقة (trusting period) الخاصة به؛ نبّه إذا لم يُحدَّث عميل لمدة نصفها تقريبًا |
| الأخطاء | ارتفاع `broadcast_errors` و`simulate_errors` |

فحص صغير لحالة المفتاح، مناسب لـ cron أو لوكيل مراقبة:

```bash
qorel --json keys pqc-status --chain qorechain-diana | jq -e '.result.ready_to_relay == true'
```

يخرج برمز غير صفري عندما لا يكون المفتاح جاهزًا.

### السجلات {#logs}

القيمة `log_level = 'info'` في `[global]` هي الافتراضية. ومع حزمة systemd تذهب السجلات إلى journal:

```bash
journalctl -u qorel -f
```

يظهر سطر سجل يبدأ بـ `post-quantum sign bytes` عندما يقرأ QORel إصدار sign-bytes من السلسلة ويتغير. والتحذيرات حول ردود `429` من نقطة نهاية تعني أن النقطة تحدّ من المعدل؛ ويعيد QORel المحاولة.

### نقطة REST {#rest}

يعرض خادم REST الاختياري (`[rest]` في ملف الإعدادات، المنفذ 3000 في المثال، ومعطّل افتراضيًا) حالة المُرحِّل للاطلاع عليها. أبقِه مرتبطًا بالعنوان `127.0.0.1`.

### فحوص يدوية {#by-hand}

```bash
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
```

## كيفية الوصول {#how-to-access}

- القياس عن بُعد وREST محليان على مضيف المُرحِّل؛ وكلاهما خارج الشبكة العامة ما لم تعرضهما.
- تقرأ أوامر `qorel` ملف الإعدادات نفسه الذي يقرؤه المُرحِّل.
- نقطة REST العامة لشبكة اختبار QoreChain (`https://api-testnet.qore.host`) تعرض حالة القناة وتتبّع الرموز؛ راجع [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet).

## أين يُنشر {#where-published}

المراقبة جزء من الملف التنفيذي `qorel`؛ ولا يوجد شيء منفصل لتثبيته. المصدر ودليل القياس عن بُعد في Hermes: [qorechain/QORel](https://github.com/qorechain/QORel)، [hermes.informal.systems](https://hermes.informal.systems).

## الحدود والمشكلات المعروفة {#limits}

- **لا توجد لوحة معلومات مستضافة.** لا يوفر QORel لوحات معلومات ولا قواعد تنبيه؛ ابنِها من المقاييس أعلاه.
- **أسماء المقاييس هي أسماء Hermes.** لا يضيف QORel في الإصدار 0.1.0 أي مقاييس ما بعد كمومية؛ استخدم `keys pqc-status` لمعرفة تلك الحالة.
- **تحديد المعدل أمر طبيعي على نقاط النهاية العامة.** نبّه على تراكم مستمر لا على تحذيرات `429` المفردة.
- **شبكة الاختبار فقط.** لم يُشغَّل أي شيء هنا على قناة في الشبكة الرئيسية.
