---
slug: /getting-started/connecting-to-mainnet
title: الاتصال بالشبكة الرئيسية
sidebar_label: الاتصال بالشبكة الرئيسية
sidebar_position: 3
---

# الاتصال بالشبكة الرئيسية

انضم إلى شبكة QoreChain Vladi الرئيسية المباشرة عبر تهيئة العقدة الخاصة بك باستخدام ملف التكوين الأصلي (genesis) الرسمي والنظراء وإعدادات الشبكة.

:::note
تغطي هذه الصفحة الشبكة الرئيسية **`qorechain-vladi`** (معرّف سلسلة EVM ‏**9801**، بالنظام السداسي عشري `0x2649`)، وهي تعمل مباشرةً منذ **7 يونيو 2026 الساعة 23:59 بالتوقيت العالمي المنسق (UTC)** وتشغّل إصدار السلسلة **v3.1.85** على Cosmos SDK v0.53. أما شبكة الاختبار **`qorechain-diana`** (معرّف سلسلة EVM ‏**9800**)، فراجع [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) وجرّب إعدادك هناك قبل الانطلاق على الشبكة المباشرة.
:::

## نقاط النهاية العامة

إذا كنت تحتاج فقط إلى **الاستعلام عن السلسلة أو بث المعاملات**، فلست بحاجة إلى عقدة خاصة بك — نقاط النهاية العامة هي:

| الخدمة | الرابط |
|---|---|
| RPC الإجماع | `https://rpc.qore.host` (WebSocket: ‏`wss://rpc.qore.host/websocket`) |
| Cosmos REST ‏(LCD) | `https://api.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` (معرّف السلسلة `9801`) |
| SVM JSON-RPC (للقراءة فقط) | `https://svm.qore.host` |
| مستكشف الكتل | [explore.qore.network](https://explore.qore.network) |

لأحمال العمل الكثيفة أو الإنتاجية (منصات التداول، أدوات الفهرسة)، شغّل عقدتك الخاصة كما هو موضح أدناه.

---

## التثبيت

ثبّت الملف التنفيذي `qorechaind` إما من الحزمة الرسمية المبنية مسبقاً أو عبر البناء من الشيفرة المصدرية.

### حزمة الملف التنفيذي المبنية مسبقاً (linux/amd64)

تحتوي حزمة الإصدار الرسمية على `qorechaind` بالإضافة إلى المكتبات المشتركة المطلوبة (`libqorepqc.so`، `libqoresvm.so`، `libwasmvm.x86_64.so`):

```bash
curl -fsSL https://download.qore.host/qorechaind-v3.1.83-linux-amd64.tar.gz -o qore.tgz
# Verify the checksum before installing:
sha256sum qore.tgz
# fa035b3699e92d755f47445cbf7dde4e1f6c224343008546aa159b7eb46a805c

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

تُنشر الحزم المرقّمة بالإصدارات على [download.qore.host](https://download.qore.host)؛ ويأتي كل إصدار مع مجموع التحقق SHA-256 الخاص به — احرص دائماً على تثبيت **أحدث** حزمة منشورة.

:::caution حافظ على تحديث عقدتك
يجب على العقد الكاملة مواكبة إصدار سلسلة الشبكة (حالياً **v3.1.85**). لا تستطيع العقدة القديمة فك ترميز أنواع المعاملات الأحدث (على سبيل المثال، المعاملات الموقّعة بـ `eth_secp256k1` التي أُدخلت في v3.1.83) وستتوقف عن المزامنة فور ظهور إحداها في كتلة.
:::

### البناء من الشيفرة المصدرية

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

راجع [البناء من الشيفرة المصدرية](/developer-guide/building-from-source) للاطلاع على المتطلبات الأساسية الكاملة (Go 1.26+‎، وCGO، وسلسلة أدوات Rust، والمكتبات الأصلية).

### تهيئة العقدة

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

ينشئ هذا الأمر التكوين الافتراضي ومجلدات البيانات ضمن `~/.qorechaind/`.

---

## تنزيل ملف Genesis

استبدل ملف genesis المحلي لديك بملف genesis الرسمي للشبكة الرئيسية:

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json
```

يُقدَّم الملف نفسه مباشرةً من السلسلة ذاتها أيضاً — ويمكنك التحقق المتقاطع من الملف المنزَّل مقابله:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

يحدد هذا الملف الحالة الأولية لشبكة Vladi الرئيسية، بما في ذلك مجموعة مدققي genesis، وتخصيصات الرموز (حدث إصدار الرمز TGE عند genesis)، ومعاملات الوحدات.

---

## تكوين النظراء

عدّل تكوين عقدتك للاتصال بعقد الحراسة (sentry) العامة للشبكة الرئيسية.

افتح `~/.qorechaind/config/config.toml` واضبط الحقل `persistent_peers`:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

اضبط أيضاً الحد الأدنى لسعر الغاز في `~/.qorechaind/config/app.toml` (الحد الأدنى لرسوم الشبكة هو **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### الإعدادات الموصى بها

قد ترغب أيضاً في تعديل ما يلي في `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

هذه القيم مضبوطة بما يتوافق مع أزمنة الكتل ومعدل الإنتاجية في شبكة Vladi الرئيسية.

---

## الإقلاع السريع (لقطة البيانات)

قد تستغرق المزامنة من genesis وقتاً طويلاً. تُنشر لقطة حديثة لبيانات السلسلة على [download.qore.host](https://download.qore.host):

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
# Verify before extracting:
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

تُنشر اللقطات بأسماء ملفات مختومة بارتفاع الكتلة — تحقق من [download.qore.host](https://download.qore.host) للحصول على أحدثها. بدلاً من ذلك، استخدم **state sync** — راجع [تشغيل عقدة](/developer-guide/running-a-node) للاطلاع على سير العمل الكامل.

---

## بدء تشغيل العقدة

شغّل عقدتك لبدء المزامنة مع الشبكة:

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

تتصل العقدة بالنظراء وتبدأ في تنزيل الكتل (بدءاً من genesis، أو من ارتفاع اللقطة إذا كنت قد استعدت واحدة).

---

## التحقق من حالة المزامنة

تحقق من أن عقدتك تلحق بأحدث كتلة:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — لا تزال العقدة قيد المزامنة. انتظر حتى تلحق بالشبكة.
* `false` — العقدة متزامنة بالكامل وتعالج الكتل الجديدة.

يمكنك أيضاً التحقق من أحدث ارتفاع للكتلة:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

تأكد من أنك على الشبكة الصحيحة — يجب أن يُظهر الحقل `network` القيمة `qorechain-vladi`:

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## المراقبة

توفر QoreChain عدة نقاط نهاية لمراقبة صحة العقدة وأدائها.

### مقاييس Prometheus

المقاييس الخام متاحة على:

```
http://localhost:26660/metrics
```

يمكن لأي مجمّع متوافق مع Prometheus جمع هذه المقاييس.

### لوحات Grafana

عند التشغيل عبر Docker Compose، تكون Grafana متاحة على:

```
http://localhost:3001
```

عند تسجيل الدخول لأول مرة، عيّن بيانات اعتمادك الخاصة عند مطالبتك بذلك — ولا تُبقِ على القيم الافتراضية. تعرض اللوحات المهيأة مسبقاً إنتاج الكتل، ومعدل معالجة المعاملات، واتصالات النظراء، واستخدام الموارد.

### فحص الحالة عبر REST

توفر واجهة REST API نقطة نهاية سريعة لفحص الحالة:

```
http://localhost:1317
```

---

## مرجع المنافذ

| المنفذ | البروتوكول | الوصف |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — الاستعلام عن المعاملات وبثها |
| `26656` | TCP       | P2P — اتصال الشبكة بين النظراء |
| `1317`  | HTTP      | REST API — الاستعلام عن حالة السلسلة عبر HTTP |
| `9090`  | gRPC      | gRPC API — الوصول البرمجي إلى السلسلة |
| `8545`  | HTTP      | EVM JSON-RPC — واجهة RPC متوافقة مع Ethereum (معرّف السلسلة `9801`) |
| `8546`  | WebSocket | EVM WebSocket — اشتراكات أحداث EVM في الوقت الفعلي |
| `8899`  | HTTP      | SVM RPC — واجهة RPC متوافقة مع Solana |
| `26660` | HTTP      | نقطة نهاية مقاييس Prometheus |

---

## حقائق الشبكة

| الحقل             | القيمة                                 |
| ----------------- | -------------------------------------- |
| معرّف السلسلة | `qorechain-vladi`                      |
| معرّف سلسلة EVM | `9801` (بالنظام السداسي عشري `0x2649`) |
| إصدار السلسلة | v3.1.85                                |
| مباشرة منذ | 7 يونيو 2026 الساعة 23:59 بالتوقيت العالمي المنسق (UTC) |
| الرمز | QOR (‏`uqor`، ‏10^6 وحدة دقيقة = 1 QOR) |
| الحد الأدنى لسعر الغاز | `0.1uqor`                              |
| بادئة الحسابات | `qor`                                  |
| بادئة المدققين | `qorvaloper`                           |
| SDK               | Cosmos SDK v0.53                       |

---

## الخطوات التالية

* [تشغيل عقدة](/developer-guide/running-a-node) — تشغيل عقدة كاملة/عقدة RPC لمنصات التداول والجهات المتكاملة
* [دليل منصات التداول والجهات المتكاملة](/developer-guide/exchange-integration) — الإيداعات والسحوبات والمراقبة
* [تشغيل مدقق](/developer-guide/running-a-validator) — إنشاء مدقق وتشغيله
* [إعداد المحفظة](/getting-started/wallet-setup) — تهيئة محفظة للشبكة الرئيسية
* [معاملتك الأولى](/getting-started/first-transaction) — أرسل أول تحويل QOR لك
* [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) — انضم إلى شبكة اختبار Diana للتجربة المجانية
* [الشبكات](/appendix/networks) — معرّفات السلاسل والمنافذ والمرجع الكامل للشبكات
