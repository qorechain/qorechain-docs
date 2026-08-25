---
slug: /getting-started/connecting-to-mainnet
title: الاتصال بالشبكة الرئيسية
sidebar_label: الاتصال بالشبكة الرئيسية
sidebar_position: 3
---

# الاتصال بالشبكة الرئيسية

انضم إلى شبكة QoreChain Vladi الرئيسية المباشرة عبر تهيئة العقدة الخاصة بك باستخدام ملف التكوين الأصلي (genesis) الرسمي والنظراء وإعدادات الشبكة.

:::note
تغطي هذه الصفحة الشبكة الرئيسية **`qorechain-vladi`** (معرّف سلسلة EVM ‏**9801**، بالنظام السداسي عشري `0x2649`)، وهي تعمل مباشرةً منذ **7 يونيو 2026 الساعة 23:59 بالتوقيت العالمي المنسق (UTC)** وتشغّل إصدار السلسلة **v3.1.92** على Cosmos SDK v0.53. أما شبكة الاختبار **`qorechain-diana`** (معرّف سلسلة EVM ‏**9800**)، فراجع [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) وجرّب إعدادك هناك قبل الانطلاق على الشبكة المباشرة.
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

المصدر المرجعي الموثوق للملف التنفيذي الحالي هو **بيان الشبكة الرئيسية** (mainnet manifest)، وهو ملف JSON يُحدَّث مباشرةً على العنوان `https://download.qore.host/mainnet/latest.json`. يحمل هذا الملف رابط الملف التنفيذي الحالي ومجموع التحقق SHA-256 الخاص به، ورابط ملف genesis الحالي ومجموع التحقق SHA-256 الخاص به وحجمه، وقوائم النظراء (peers) والبذور (seeds) الحالية، ومنفذ P2P، ونقطة ثقة لمزامنة الحالة (state-sync)، والحد الأدنى لإصدار السلسلة المتوافق. اجلب هذا الملف واستخدم قيمه بدلاً من ترميز إصدار الملف التنفيذي أو مجموع التحقق مباشرةً في نصوص التثبيت البرمجية — فتلك القيم تصبح قديمة بمجرد صدور إصدار جديد:

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

تحتوي الحزمة على `qorechaind` بالإضافة إلى المكتبات المشتركة المطلوبة (`libqorepqc.so`، `libqoresvm.so`، `libwasmvm.x86_64.so`).

:::caution حافظ على تحديث عقدتك — يلزم الإصدار v3.1.92 أو أحدث لإجراء مزامنة جديدة
يجب على العقد الكاملة مواكبة إصدار السلسلة المباشر للشبكة — ثبّت دائماً الملف التنفيذي الذي يشير إليه البيان (manifest)، ولا تُثبّت إصداراً قديماً بشكل ثابت. وبمعزل عن حقل `minCompatible` في البيان، **يلزم الإصدار v3.1.92 أو أحدث للعقدة التي تنضم من جديد (من genesis) أو التي تتعافى من توقف** — إذ لا تستطيع الإصدارات الأقدم إتمام مزامنة كاملة بسبب خلل في قياس الغاز (gas-metering) تم إصلاحه الآن، وكان يوقف إعادة التشغيل (replay) عند أول كتلة تحتوي على معاملة. أما العقدة التي أتمت المزامنة بالفعل وتعمل بإصدار أقدم، فينبغي لها أيضاً الترقية في أقرب فرصة، إذ لا تستطيع العقدة القديمة فك ترميز أنواع المعاملات الأحدث وستتوقف عن المزامنة فور ظهور إحداها في كتلة.

**تحقق مما يقدمه البيان فعلياً قبل الوثوق به.** يُروَّج البيان بشكل مدروس — أولاً على شبكة الاختبار، ثم على الشبكة الرئيسية بعد فترة اختبار — لذا قد يتأخر عن الحد الأدنى للإصدار المذكور أعلاه؛ وفي وقت كتابة هذا النص، لا يزال بيان الشبكة الرئيسية نفسه يشير إلى ملف تنفيذي أقدم من v3.1.92، وهو بالضبط الإصدار الذي يحذّر منه هذا التنبيه للمزامنة الجديدة. قارن حقل `"version"` في البيان مقابل v3.1.92 قبل الاعتماد على `binary.url` الخاص به؛ فإذا كان لا يزال متأخراً، فاحصل على v3.1.92 (أو أحدث) من [إصدارات qorechain-core على GitHub](https://github.com/qorechain/qorechain-core/releases) بدلاً من ذلك (تحقق من مجموع التحقق للعلامة (tag) بالطريقة نفسها)، أو [ابنِ من الشيفرة المصدرية](/developer-guide/building-from-source).
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

استبدل ملف genesis المحلي لديك بملف genesis الرسمي للشبكة الرئيسية، باستخدام الرابط ومجموع التحقق SHA-256 من البيان الذي جلبته أعلاه:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

يُقدَّم الملف نفسه مباشرةً من السلسلة ذاتها أيضاً — ويمكنك التحقق المتقاطع من الملف المنزَّل مقابله:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

يحدد هذا الملف الحالة الأولية لشبكة Vladi الرئيسية، بما في ذلك مجموعة مدققي genesis، وتخصيصات الرموز (حدث إصدار الرمز TGE عند genesis)، ومعاملات الوحدات.

---

## تكوين النظراء

عدّل تكوين عقدتك للاتصال بعقد الحراسة (sentry) العامة للشبكة الرئيسية. اقرأ قوائم النظراء والبذور الحالية من البيان بدلاً من ترميز معرّفات العقد والمضيفين مباشرةً — فهذه القيم تتغيّر دورياً:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

افتح `~/.qorechaind/config/config.toml` واضبط الحقلين `persistent_peers` (و`seeds`) على هاتين القيمتين:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
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

## الإقلاع السريع (اللقطة أو مزامنة الحالة)

قد تستغرق المزامنة من genesis وقتاً طويلاً. يحمل حقل `stateSync` في البيان زوجاً من ارتفاع الثقة (trust height) وتجزئة الثقة (trust hash) يُحدَّث كل ساعة — استخدمه لتكوين مزامنة الحالة (state sync) بدلاً من البحث عن ارتفاع يدوياً:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

ثم اضبط قسم `[statesync]` في `config.toml` بهاتين القيمتين — راجع [تشغيل عقدة](/developer-guide/running-a-node) للاطلاع على سير العمل الكامل، بما في ذلك بديل احتياطي يدوي قائم على RPC إذا احتجت إلى اشتقاق نقطة ثقة بنفسك.

تُنشر أيضاً لقطة لبيانات السلسلة على [download.qore.host](https://download.qore.host). تحقق من القائمة الحالية هناك للحصول على اسم أحدث ملف لقطة ومجموع التحقق المنشور الخاص به — لا تُرمّز اسم ملف أو ارتفاعاً بشكل ثابت، إذ تحل كل لقطة جديدة محل القديمة بشكل دوري:

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

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

| الحقل             | القيمة                                  |
| ----------------- | -------------------------------------- |
| معرّف السلسلة | `qorechain-vladi`                      |
| معرّف سلسلة EVM | `9801` (بالنظام السداسي عشري `0x2649`) |
| إصدار السلسلة | v3.1.92                                |
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
