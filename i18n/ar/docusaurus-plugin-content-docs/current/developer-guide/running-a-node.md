---
slug: /developer-guide/running-a-node
title: تشغيل عقدة
sidebar_label: تشغيل عقدة
sidebar_position: 10
---

# تشغيل عقدة

يغطي هذا الدليل تشغيل نشر QoreChain **بعقدة فقط** — عقدة كاملة أو عقدة RPC تُزامن السلسلة وتوفّر نقاط نهاية للتكامل، **دون** مهام المدقّق (validator). وهو موجّه إلى منصات التداول (CEX) والأنظمة الخلفية للمحافظ والمفهرِسات وجهات التكامل التي تحتاج إلى وصول موثوق للقراءة/الكتابة إلى الشبكة لكنها لا توقّع الكتل.

:::note
لإنتاج الكتل، والتحصيص (staking)، والعقوبات (slashing)، وتصنيف المجمّعات، راجع [تشغيل مدقّق](/developer-guide/running-a-validator) بدلاً من ذلك. النشر بعقدة فقط لا يحمل أبداً مفتاح إجماع للمدقّق ولا يظهر أبداً في المجموعة النشطة.
:::

:::warning
تُنشر الملفات الثنائية وملف التكوين الأولي (genesis) واللقطات على [download.qore.host](https://download.qore.host) مع مجاميع تحقق SHA-256. **تحقّق دائماً من مجاميع التحقق قبل التثبيت أو الاستخراج**، وتحقّق من الإيداعات فقط عبر عقدتك المُزامنة الخاصة.
:::

:::note مصدر الحقيقة: البيان (manifest) الحي
يُنشر الملف الثنائي الحالي وملف genesis والنظراء (peers) والبذور (seeds) ونقطة الثقة لمزامنة الحالة كبيان بصيغة JSON، يُحدَّث بشكل حي — لا تُدرِج إصدار ملف ثنائي أو مجموع تحقق أو اسم ملف لقطة بشكل ثابت في نصوص التثبيت لديك، لأنها تصبح قديمة بمجرد صدور إصدار جديد:

- الشبكة الرئيسية: `https://download.qore.host/mainnet/latest.json`
- شبكة الاختبار: `https://download.qore.host/testnet/latest.json`

تشمل حقول البيان `binary` (رابط + sha256)، و`genesis` (رابط + sha256 + sizeBytes)، و`peers`، و`seeds`، و`p2pPort`، و`stateSync` (نقطة ثقة تُحدَّث كل ساعة)، و`minCompatible`. تجلب خطوات التثبيت والانضمام أدناه هذا البيان وتستخدم قيمه الحالية.
:::

:::caution مطلوب الإصدار v3.1.94 أو أحدث لعقدة تنضم من جديد
العقدة التي تُزامن من ملف genesis أو تُعيد التشغيل من أرشيف/لقطة يجب أن تكون على **الإصدار v3.1.94 أو أحدث**، لسببين متراكبين: الإصدار v3.1.92 أصلح خللاً في قياس الغاز (gas-metering) كان يوقف إعادة التشغيل عند أول كتلة تحتوي على معاملة، وقد اجتازت الشبكة الرئيسية منذ ذلك الحين ترقية الحوكمة v3.1.94 (سقف أقصى للإصدار، مُطبَّق عند الارتفاع 2,122,074) — العقدة التي لا تحمل معالج (handler) تلك الترقية تتوقف مجدداً عند محاولة إعادة التشغيل عبر ذلك الارتفاع نفسه. الإصدار v3.1.95 هو الإصدار الموصى به حالياً (تحديث أمني متجدد لا يكسر الإجماع)؛ وحقل `minCompatible` هو `3.1.94`. يُرقّى البيان عمداً على مراحل (شبكة الاختبار أولاً، ثم الشبكة الرئيسية بعد فترة استقرار) وقد تأخر سابقاً عن هذا الحد الأدنى — تحقّق من حقل `"version"` فيه قبل الوثوق بـ `binary.url`، وارجع إلى [إصدارات qorechain-core على GitHub](https://github.com/qorechain/qorechain-core/releases) أو ابنِ من المصدر إذا كان متأخراً.
:::

---

## العقدة مقابل المدقّق

| الجانب              | عقدة فقط (هذا الدليل)                          | المدقّق                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| مفتاح الإجماع       | لا يوجد                                            | مفتاح إجماع ed25519 (يجب تأمينه)    |
| إنتاج الكتل    | لا                                              | نعم — يقترح الكتل ويوقّعها            |
| التحصيص / العقوبات  | غير قابل للتطبيق                                  | تفويض ذاتي، مخاطر العقوبات             |
| الغرض الأساسي     | تقديم RPC/REST/gRPC/EVM/SVM لعمليات التكامل     | تأمين الشبكة وكسب المكافآت           |
| التعرّض العام     | نقاط نهاية RPC/EVM مكشوفة عادةً             | المدقّق مخفي خلف عقد الحراسة (sentry)       |

---

## الشبكات المستهدفة

| الشبكة  | معرّف السلسلة            | معرّف سلسلة EVM         | ملاحظات                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| الشبكة الرئيسية  | `qorechain-vladi`   | `9801` (بالنظام الست عشري `0x2649`) | الأساسية — تعمل منذ 7 يونيو 2026 |
| شبكة الاختبار  | `qorechain-diana`   | `9800`               | جرّب عمليات التكامل هنا أولاً |

استبدل قيمة `--chain-id` المناسبة لشبكتك المستهدفة في كل أجزاء هذا الدليل. الأمثلة تستخدم الشبكة الرئيسية افتراضياً.

---

## العتاد الموصى به

| الملف التعريفي                  | المعالج      | الذاكرة   | القرص (NVMe SSD)         | الشبكة   |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| عقدة RPC مع تقليم          | 4 أنوية  | 16 GB | 500 GB+                 | 100 Mbps+ |
| عقدة كاملة/أرشيفية        | 8 أنوية  | 32 GB | 2 TB+ (تنمو مع الوقت) | 1 Gbps    |
| تكامل منصات التداول     | 8 أنوية  | 32 GB | 2 TB+ مع مساحة احتياطية     | 1 Gbps    |

يوصى بشدة باستخدام NVMe SSD — فحالة السلسلة ومخازن EVM/SVM كثيفة الاستخدام لعمليات الإدخال/الإخراج. العقد الأرشيفية (بدون تقليم، مع فهرسة كاملة للمعاملات) تنمو باستمرار؛ خصّص قرصاً بمساحة احتياطية مع مراقبة مستمرة.

---

## النشر

### Docker Compose

نشر بعقدة فقط باستخدام Docker Compose. لا توجد حالياً صورة `qorechaind` منشورة علناً للسحب — ابنِ واحدة بنفسك من `Dockerfile` الخاص بالمستودع وضع لها وسماً بإصدار السلسلة الحي (**v3.1.95** على الشبكة الرئيسية)، ثم اربط وحدة تخزين دائمة لبيانات السلسلة:

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
docker build -t qorechain-node:v3.1.95 .
```

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain-node:v3.1.95
    container_name: qorechain-node
    restart: unless-stopped
    command: ["start", "--home", "/root/.qorechaind"]
    volumes:
      - qorechain-data:/root/.qorechaind
    ports:
      - "26657:26657"   # RPC
      - "26656:26656"   # P2P
      - "1317:1317"     # REST
      - "9090:9090"     # gRPC
      - "8545:8545"     # EVM JSON-RPC
      - "8546:8546"     # EVM WebSocket
      - "8899:8899"     # SVM RPC
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

هيّئ دليل البيانات مرة واحدة (يُغطى ملف genesis وتكوين النظراء أدناه)، ثم ابدأ التشغيل:

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

للتثبيت على خادم مباشر (bare-metal)، شغّل `qorechaind` تحت systemd:

```ini
# /etc/systemd/system/qorechaind.service
[Unit]
Description=QoreChain node
After=network-online.target
Wants=network-online.target

[Service]
User=qorechain
ExecStart=/usr/local/bin/qorechaind start --home /var/lib/qorechaind
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now qorechaind
sudo journalctl -u qorechaind -f
```

---

## الانضمام إلى الشبكة

### 1. التهيئة

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

### 2. جلب البيان (manifest)

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

استخدم هذا الملف كمصدر لقيم الملف الثنائي وملف genesis والنظراء في الخطوات أدناه — تحقّق من `jq -r .minCompatible latest.json` لكن تذكّر أن **الحد الأدنى v3.1.94** أعلاه يبقى سارياً حتى لو تأخر هذا الحقل عن التحديث.

### 3. تنزيل ملف genesis والتحقق منه

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 4. تكوين النظراء والحد الأدنى للرسوم

اقرأ النظراء (peers) والبذور (seeds) الحالية من البيان بدلاً من تثبيت معرّفات العقد والمضيفين بشكل ثابت — فهذه القيم تتغيّر دورياً:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

افتح `~/.qorechaind/config/config.toml` وعيّن `persistent_peers` (و`seeds`) على تلك القيم:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

ثم عيّن الحد الأدنى لسعر الغاز في `~/.qorechaind/config/app.toml` (الحد الأدنى لرسوم الشبكة: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### 5. بدء المزامنة

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## الإقلاع السريع

قد تستغرق المزامنة من ملف genesis وقتاً طويلاً. لعمليات التكامل، استخدم **مزامنة الحالة (state sync)** أو **لقطة (snapshot)** لبدء تشغيل سريع من الصفر.

### مزامنة الحالة

تجلب مزامنة الحالة لقطة حديثة لحالة التطبيق من خوادم RPC موثوقة بدلاً من إعادة تشغيل كل كتلة. كوّن القسم `[statesync]` في `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

خذ `trust_height` / `trust_hash` من حقل `stateSync` في البيان — يُحدَّث كل ساعة، لذا فهو المصدر المفضّل:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

كبديل احتياطي، يمكنك اشتقاق ارتفاع وتجزئة (hash) موثوقين بنفسك من RPC العام:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### الاستعادة من لقطة

بدلاً من ذلك، نزّل لقطة بيانات السلسلة المنشورة، وتحقّق من مجموع التحقق الخاص بها، ثم استخرجها فوق دليل البيانات لديك. لا يحمل البيان حالياً مؤشراً للقطة، لذا تحقّق من القائمة الحية على [download.qore.host](https://download.qore.host) للحصول على اسم الملف ومجموع التحقق الحاليين بدلاً من تثبيت أحدهما بشكل ثابت:

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
تُنشر اللقطات بأسماء ملفات **موسومة بارتفاع الكتلة** تتغيّر بانتظام — راجع [download.qore.host](https://download.qore.host) للحصول على أحدث لقطة ومجموع التحقق SHA-256 الخاص بها، وتحقّق دائماً قبل الاستخراج. تذكّر أن **الحد الأدنى v3.1.94** أعلاه ينطبق أيضاً على إعادة التشغيل من لقطة.
:::

---

## التقليم والفهرسة

اضبط التقليم وفهرسة المعاملات بما يناسب تكاملك. منصات التداول التي تحتاج إلى سجل معاملات كامل ينبغي أن تعمل بأقل قدر من التقليم مع تفعيل مفهرِس المعاملات.

### التقليم (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | السلوك                                | حالة الاستخدام                          |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | يحتفظ بالحالة الحديثة ويقلّم الباقي      | عقدة RPC، استعلامات الأرصدة/الحالة   |
| `nothing`   | يحتفظ بكل الحالة التاريخية               | عقدة أرشيفية، سجل كامل        |
| `custom`    | قيم احتفاظ/فواصل يحددها المشغّل    | احتفاظ مضبوط حسب الحاجة                   |

### فهرسة المعاملات (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

عيّن `indexer = "kv"` (أو مفهرِساً أغنى) لتكون المعاملات قابلة للاستعلام حسب التجزئة والحدث — وهو أمر أساسي لمنصات التداول التي تُطابق الإيداعات والسحوبات. عيّن `indexer = "null"` فقط إذا لم تكن بحاجة إلى استعلامات المعاملات التاريخية.

---

## كشف نقاط النهاية للتكامل

فعّل خوادم الواجهات البرمجية (API) التي تحتاجها جهات التكامل واربطها في `app.toml`:

```toml
[api]
enable = true
address = "tcp://0.0.0.0:1317"

[grpc]
enable = true
address = "0.0.0.0:9090"

[json-rpc]
enable = true
address = "0.0.0.0:8545"
ws-address = "0.0.0.0:8546"
api = "eth,net,web3,qor"
```

ومستمع RPC في `config.toml`:

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| نقطة النهاية     | المنفذ   | تُستخدم من أجل                                                |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | بث المعاملات، والاستعلام عن الكتل/الحالة      |
| REST         | `1317`  | استعلامات HTTP عن حالة السلسلة                            |
| gRPC         | `9090`  | وصول برمجي عالي الإنتاجية                    |
| EVM JSON-RPC | `8545`  | عمليات التكامل المتوافقة مع Ethereum (معرّف السلسلة `9801`)     |
| EVM WS       | `8546`  | اشتراكات أحداث EVM                                |
| SVM RPC      | `8899`  | عمليات التكامل المتوافقة مع Solana                         |

:::warning
لا تكشف أبداً RPC أو EVM JSON-RPC أو gRPC مباشرةً على الإنترنت العام دون وكيل عكسي (reverse proxy) وتحديد لمعدل الطلبات ومصادقة وجدار حماية. اربط على `0.0.0.0` فقط خلف طبقة دخول (ingress) خاضعة للتحكم.
:::

---

## مراقبة الصحة والمزامنة

### حالة المزامنة

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — لا تزال المزامنة جارية.
* `false` — مزامنة كاملة وتقديم الحالة الحالية.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

يجب أن يُظهر الحقل `network` القيمة `qorechain-vladi` (الشبكة الرئيسية) أو `qorechain-diana` (شبكة الاختبار).

### Prometheus و Grafana

تكشف QoreChain مقاييس Prometheus على المنفذ **26660**:

```
http://localhost:26660/metrics
```

اجمع هذه المقاييس بأي مجمّع متوافق مع Prometheus. إذا كنت تشغّل حزمة المراقبة الخاصة بـ Docker Compose، فإن Grafana متاحة على `http://localhost:3001` — عيّن بيانات اعتمادك الخاصة عند أول تسجيل دخول. راقب تأخر ارتفاع الكتل وعدد النظراء واستخدام الموارد؛ وفعّل التنبيهات عندما يبقى `catching_up` على `true` أو ينخفض عدد النظراء إلى الصفر.

### فحص نقطة نهاية EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## أفضل الممارسات التشغيلية

1. **ثبّت إصدار السلسلة.** شغّل الوسم الحي (**v3.1.95** على الشبكة الرئيسية) وتابع الإصدارات الرسمية للترقيات المنسّقة.

2. **شغّل عقداً متكررة.** شغّل عقدتين على الأقل خلف موزّع أحمال حتى لا تؤدي إعادة تشغيل أو إعادة مزامنة واحدة إلى انقطاع حركة التكامل.

3. **تحقّق من ملف genesis واللقطات.** تحقّق دائماً من SHA-256 لملف genesis ومن مجموع تحقق أي لقطة مقابل الإصدار الرسمي قبل البدء.

4. **احمِ نقاط النهاية العامة.** ضع RPC/EVM/gRPC خلف وكيل عكسي وتحديد لمعدل الطلبات وجدار حماية. لا تكشف أبداً RPC للكتابة دون مصادقة على الإنترنت.

5. **طابق التقليم مع الحاجة.** استخدم `pruning = "nothing"` مع `tx_index = "kv"` لمنصات التداول التي تُطابق سجل الإيداعات/السحوبات الكامل؛ واستخدم `default` للاستعلامات الخفيفة.

6. **راقب المزامنة باستمرار.** فعّل التنبيهات عند تأخر ارتفاع الكتل، وانعدام النظراء، وبقاء العقدة عالقة في `catching_up`.

للوصول للقراءة فائق الخفة دون تشغيل عقدة كاملة، راجع وثائق **العقدة الخفيفة (Light Node)**.

---

## استكشاف الأخطاء وإصلاحها

### العقدة المتوقفة قبل الترقية لا تستأنف بعد تبديل الملف الثنائي

إذا كانت عقدتك متوقفة أو عالقة بالفعل **قبل** ترقية ملفها الثنائي، فإن مجرد وضع الملف الثنائي الجديد وإعادة التشغيل لا يكفي — فالعقدة تحتفظ بنتائج ABCI قديمة مخبأة (cached) من التشغيل السابق ولن تُعيد تنفيذ الكتلة التي تسببت في التوقف. تراجع (rollback) بشكل صريح قبل إعادة التشغيل:

```bash
qorechaind rollback --home <HOME>
systemctl restart <unit>
```

الأمر هو `qorechaind rollback` (أمر فرعي من المستوى الأعلى) — لا يوجد أمر فرعي `comet rollback` ولا علامة `--hard` له.

### تعطّل استعادة اللقطة في حلقة تكرار بسبب غياب `priv_validator_state.json`

لا يتضمن الأرشيف/اللقطة المنشورة `data/priv_validator_state.json`، وترفض العقدة البدء بدونه. إذا كان مفقوداً بعد استعادة لقطة، أنشئه — لكن **فقط إذا لم يكن موجوداً بالفعل**. لا تستبدل أبداً ملفاً حقيقياً: فعلى المدقّق، يُعدّ هذا الملف حارس مانع التوقيع المزدوج (anti-double-signing)، والكتابة فوقه تُخاطر بتوقيع مزدوج (double-sign).

```bash
echo '{"height":"0","round":0,"step":0}' > <HOME>/data/priv_validator_state.json
```

---

## الخطوات التالية

* [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) — ملف genesis للشبكة الرئيسية والنظراء وتفاصيل الاتصال
* [تشغيل مدقّق](/developer-guide/running-a-validator) — إضافة مهام إنتاج الكتل
* [البناء من المصدر](/developer-guide/building-from-source) — بناء الملف الثنائي `qorechaind`
* **العقدة الخفيفة (Light Node)** — وصول للقراءة فقط فائق الخفة (الوثائق قادمة قريباً)
