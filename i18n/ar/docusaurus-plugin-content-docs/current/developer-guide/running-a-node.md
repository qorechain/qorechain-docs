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

نشر بعقدة فقط باستخدام Docker Compose. ثبّت وسم الصورة على إصدار السلسلة الحي (**v3.1.85** على الشبكة الرئيسية) واربط وحدة تخزين دائمة لبيانات السلسلة.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.85
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

### 2. تنزيل ملف genesis والتحقق منه

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 3. تكوين النظراء والحد الأدنى للرسوم

افتح `~/.qorechaind/config/config.toml` وعيّن نظراء الحراسة (sentry) العامة للشبكة الرئيسية:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

ثم عيّن الحد الأدنى لسعر الغاز في `~/.qorechaind/config/app.toml` (الحد الأدنى لرسوم الشبكة: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### 4. بدء المزامنة

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

حدّد ارتفاعاً وتجزئة (hash) حديثين موثوقين من RPC العام:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### الاستعادة من لقطة

بدلاً من ذلك، نزّل لقطة بيانات السلسلة المنشورة، وتحقّق من مجموع التحقق الخاص بها، ثم استخرجها فوق دليل البيانات لديك:

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
تُنشر اللقطات بأسماء ملفات **موسومة بارتفاع الكتلة** — راجع [download.qore.host](https://download.qore.host) للحصول على أحدث لقطة ومجموع التحقق SHA-256 الخاص بها، وتحقّق دائماً قبل الاستخراج.
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

1. **ثبّت إصدار السلسلة.** شغّل الوسم الحي (**v3.1.85** على الشبكة الرئيسية) وتابع الإصدارات الرسمية للترقيات المنسّقة.

2. **شغّل عقداً متكررة.** شغّل عقدتين على الأقل خلف موزّع أحمال حتى لا تؤدي إعادة تشغيل أو إعادة مزامنة واحدة إلى انقطاع حركة التكامل.

3. **تحقّق من ملف genesis واللقطات.** تحقّق دائماً من SHA-256 لملف genesis ومن مجموع تحقق أي لقطة مقابل الإصدار الرسمي قبل البدء.

4. **احمِ نقاط النهاية العامة.** ضع RPC/EVM/gRPC خلف وكيل عكسي وتحديد لمعدل الطلبات وجدار حماية. لا تكشف أبداً RPC للكتابة دون مصادقة على الإنترنت.

5. **طابق التقليم مع الحاجة.** استخدم `pruning = "nothing"` مع `tx_index = "kv"` لمنصات التداول التي تُطابق سجل الإيداعات/السحوبات الكامل؛ واستخدم `default` للاستعلامات الخفيفة.

6. **راقب المزامنة باستمرار.** فعّل التنبيهات عند تأخر ارتفاع الكتل، وانعدام النظراء، وبقاء العقدة عالقة في `catching_up`.

للوصول للقراءة فائق الخفة دون تشغيل عقدة كاملة، راجع وثائق **العقدة الخفيفة (Light Node)**.

---

## الخطوات التالية

* [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) — ملف genesis للشبكة الرئيسية والنظراء وتفاصيل الاتصال
* [تشغيل مدقّق](/developer-guide/running-a-validator) — إضافة مهام إنتاج الكتل
* [البناء من المصدر](/developer-guide/building-from-source) — بناء الملف الثنائي `qorechaind`
* **العقدة الخفيفة (Light Node)** — وصول للقراءة فقط فائق الخفة (الوثائق قادمة قريباً)
