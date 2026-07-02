---
slug: /getting-started/connecting-to-testnet
title: الاتصال بشبكة الاختبار
sidebar_label: الاتصال بشبكة الاختبار
sidebar_position: 4
---

# الاتصال بشبكة الاختبار

انضم إلى شبكة اختبار QoreChain Diana الحيّة عبر إعداد عقدتك بملف التكوين الأولي (genesis) الصحيح والنظراء (peers) وإعدادات الشبكة المناسبة.

:::note
تغطي هذه الصفحة شبكة الاختبار **`qorechain-diana`** (معرّف سلسلة EVM هو **9800**). أما الشبكة الرئيسية (**`qorechain-vladi`**، بمعرّف سلسلة EVM **9801**) فهي تعمل منذ 7 يونيو 2026 ولديها صفحة مخصصة بعنوان **الاتصال بالشبكة الرئيسية** تتضمن ملف genesis ونظراء وتفاصيل اتصال منفصلة.
:::

## نقاط النهاية العامة

إذا كنت تحتاج فقط إلى **الاستعلام من شبكة الاختبار أو بث المعاملات**، فاستخدم نقاط النهاية العامة:

| الخدمة | الرابط |
|---|---|
| RPC الإجماع | `https://rpc-testnet.qore.host` (WebSocket: `wss://rpc-testnet.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` (معرّف السلسلة `9800`) |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (للقراءة فقط) | `https://svm-testnet.qore.host` |
| مستكشف الكتل | [explore.qore.network](https://explore.qore.network) (بدّل إلى شبكة الاختبار) |

يمكن الحصول على QOR الخاص بشبكة الاختبار من [صنبور لوحة التحكم](/dashboard/faucet).

---

## تنزيل ملف Genesis

استبدل ملف genesis المحلي لديك بملف genesis الرسمي لشبكة الاختبار، والذي تقدّمه السلسلة نفسها مباشرةً:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' \
  > ~/.qorechaind/config/genesis.json
```

يحدد هذا الملف الحالة الأولية لشبكة اختبار Diana، بما في ذلك مجموعة المدقّقين وتوزيعات الرموز ومعاملات الوحدات (modules).

:::caution
تخضع شبكة اختبار Diana دوريًا لإعادة **إنشاء genesis** (إعادة التعيين إلى الارتفاع 0) مع طرح الإصدارات التجريبية. إذا توقفت عقدتك عن المزامنة بعد إعادة تعيين، فأعد تنزيل ملف genesis وابدأ من دليل بيانات جديد.
:::

---

## إعداد النظراء

عدّل إعدادات عقدتك للاتصال بنظراء شبكة الاختبار الحاليين.

استعلم عن نظير حالي مباشرةً من الشبكة، ثم عيّن الحقل `persistent_peers` في `~/.qorechaind/config/config.toml`:

```bash
# node id + listen address of the public testnet node
curl -s https://rpc-testnet.qore.host/status | jq -r '.result.node_info.id'
```

عيّن أيضًا الحد الأدنى للرسوم في `~/.qorechaind/config/app.toml` (تستخدم شبكة الاختبار نفس الحد الأدنى لسعر الغاز **0.1uqor** المعتمد في الشبكة الرئيسية):

```toml
minimum-gas-prices = "0.1uqor"
```

### الإعدادات الموصى بها

قد ترغب أيضًا في تعديل ما يلي في `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

هذه القيم مضبوطة بما يتناسب مع أزمنة الكتل ومعدل المعالجة في شبكة اختبار Diana.

---

## تشغيل العقدة

شغّل عقدتك لبدء المزامنة مع الشبكة:

```bash
./qorechaind start
```

تتصل العقدة بالنظراء وتبدأ في تنزيل الكتل من genesis. يعتمد زمن المزامنة الأولية على ارتفاع السلسلة الحالي وسرعة شبكتك.

---

## التحقق من حالة المزامنة

تحقق من أن عقدتك تلحق بأحدث كتلة:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — لا تزال العقدة قيد المزامنة. انتظر حتى تلحق بالشبكة.
* `false` — العقدة متزامنة بالكامل وتعالج كتلًا جديدة.

يمكنك أيضًا التحقق من أحدث ارتفاع للكتل:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

---

## المراقبة

توفر QoreChain عدة نقاط نهاية لمراقبة صحة العقدة وأدائها.

### مقاييس Prometheus

المقاييس الخام متاحة على:

```
http://localhost:26660/metrics
```

يمكن جمع هذه المقاييس بواسطة أي مجمّع متوافق مع Prometheus.

### لوحات Grafana

عند التشغيل عبر Docker Compose، تكون Grafana متاحة على:

```
http://localhost:3001
```

عند أول تسجيل دخول، عيّن بيانات اعتماد خاصة بك عندما يُطلب منك ذلك — ولا تُبقِ على القيم الافتراضية. تعرض اللوحات المُعدّة مسبقًا إنتاج الكتل ومعدل معالجة المعاملات واتصالات النظراء واستهلاك الموارد.

### فحص الحالة عبر REST

توفر واجهة REST API نقطة نهاية سريعة للحالة:

```
http://localhost:1317
```

---

## مرجع المنافذ

| المنفذ  | البروتوكول | الوصف                                              |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — الاستعلام وبث المعاملات                      |
| `26656` | TCP       | P2P — التواصل الشبكي بين النظراء                   |
| `1317`  | HTTP      | REST API — الاستعلام عن حالة السلسلة عبر HTTP      |
| `9090`  | gRPC      | gRPC API — الوصول البرمجي إلى السلسلة              |
| `8545`  | HTTP      | EVM JSON-RPC — واجهة RPC متوافقة مع Ethereum (معرّف السلسلة `9800`) |
| `8546`  | WebSocket | EVM WebSocket — اشتراكات أحداث EVM في الوقت الفعلي |
| `8899`  | HTTP      | SVM RPC — واجهة RPC متوافقة مع Solana              |
| `26660` | HTTP      | نقطة نهاية مقاييس Prometheus                       |

---

## الخطوات التالية

* [إعداد المحفظة](/getting-started/wallet-setup) — إعداد محفظة لشبكة الاختبار
* [معاملتك الأولى](/getting-started/first-transaction) — أرسل أول تحويل QOR لك
