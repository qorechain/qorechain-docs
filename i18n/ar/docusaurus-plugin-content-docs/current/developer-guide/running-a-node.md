---
slug: /developer-guide/running-a-node
title: تشغيل عقدة
sidebar_label: تشغيل عقدة
sidebar_position: 10
---

# تشغيل عقدة

يغطّي هذا الدليل تشغيل نشر QoreChain **بصفة عقدة فقط** — عقدة كاملة أو عقدة RPC تزامن السلسلة وتكشف نقاط نهاية للتكامل، **دون** واجبات المدقق. وهو يستهدف منصات التداول (CEX)، وخلفيات المحافظ، والمفهرسات، والمكاملين الذين يحتاجون وصول قراءة/كتابة موثوقًا إلى الشبكة دون توقيع الكتل.

:::note
لإنتاج الكتل والرهان والتخفيض وتصنيف المجمّعات، راجع [تشغيل مدقق](/developer-guide/running-a-validator) بدلًا من ذلك. لا يحمل نشر العقدة-فقط أبدًا مفتاح إجماع مدقق ولا يظهر في المجموعة النشطة.
:::

:::warning
تُنشر عقد البذور للشبكة الرئيسية والأقران الدائمون وعنوان URL/المجموع الاختباري للنشأة ونقاط نهاية RPC للقطة/مزامنة الحالة مع كل إصدار رسمي للشبكة الرئيسية. **احصل على هذه القيم الحالية من مستودع/إصدار الشبكة الرئيسية الرسمي** وتحقق من المجموع الاختباري للنشأة قبل البدء. يجب استبدال العناصر النائبة أدناه (`<MAINNET_SEED_NODE_ID>@<host>:26656` و `<MAINNET_GENESIS_URL>` وعناوين URL للقطة/مزامنة الحالة) بالقيم الحقيقية المنشورة.
:::

---

## العقدة مقابل المدقق

| الجانب              | العقدة-فقط (هذا الدليل)                          | المدقق                                     |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| مفتاح الإجماع       | لا يوجد                                          | مفتاح إجماع ed25519 (يجب تأمينه)            |
| إنتاج الكتل         | لا                                              | نعم — يقترح ويوقّع الكتل                    |
| الرهان / التخفيض    | غير منطبق                                        | التفويض الذاتي، مخاطر التخفيض               |
| الغرض الأساسي       | تقديم RPC/REST/gRPC/EVM/SVM للتكاملات            | تأمين الشبكة، كسب المكافآت                  |
| التعرّض العام       | تُكشف نقاط نهاية RPC/EVM عادةً                   | المدقق مخفي خلف عقد الحراسة                 |

---

## الشبكات المستهدفة

| الشبكة   | معرّف السلسلة        | معرّف سلسلة EVM       | ملاحظات                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| الشبكة الرئيسية | `qorechain-vladi`   | `9801` (سداسي `0x2649`) | أساسية — قيد التشغيل منذ 7 يونيو 2026 |
| شبكة الاختبار | `qorechain-diana`   | `9800`               | تدرّب على التكاملات هنا أولًا   |

استبدل `--chain-id` المناسب لشبكتك المستهدفة في كامل هذا الدليل. تفترض الأمثلة الشبكة الرئيسية افتراضيًا.

---

## العتاد الموصى به

| الملف الشخصي              | المعالج  | الذاكرة | القرص (NVMe SSD)         | الشبكة    |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| عقدة RPC مُقلّمة          | 4 أنوية  | 16 GB | 500 GB+                 | 100 Mbps+ |
| عقدة كاملة/أرشيفية        | 8 أنوية  | 32 GB | 2 TB+ (تنمو مع الوقت)    | 1 Gbps    |
| تكامل منصة التداول        | 8 أنوية  | 32 GB | 2 TB+ مع هامش            | 1 Gbps    |

يُوصى بشدة باستخدام NVMe SSD — حالة السلسلة ومخازن EVM/SVM كثيفة الإدخال/الإخراج. تنمو العقد الأرشيفية (دون تقليم، مع فهرسة كاملة للمعاملات) باستمرار؛ خصّص قرصًا بهامش ومراقبة.

---

## النشر

### Docker Compose

نشر عقدة-فقط باستخدام Docker Compose. ثبّت وسم الصورة على إصدار السلسلة الحي (**v3.1.77** على الشبكة الرئيسية) وركّب وحدة تخزين دائمة لبيانات السلسلة.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.77
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

هيّئ دليل البيانات مرة واحدة (تُغطّى النشأة وإعداد الأقران أدناه)، ثم ابدأ:

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

لتثبيت على عتاد مباشر، شغّل `qorechaind` تحت systemd:

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

### 2. تنزيل النشأة والتحقق منها

```bash
curl -o ~/.qorechaind/config/genesis.json <MAINNET_GENESIS_URL>
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

:::note
`<MAINNET_GENESIS_URL>` و `<MAINNET_GENESIS_SHA256>` عناصر نائبة — احصل على عنوان URL والمجموع الاختباري الحاليين للنشأة من إصدار/مستودع الشبكة الرئيسية الرسمي وتحقق من المجموع الاختباري قبل البدء.
:::

### 3. إعداد البذور والأقران

افتح `~/.qorechaind/config/config.toml`:

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
قيم البذور والأقران عناصر نائبة. احصل على بذور الشبكة الرئيسية الحالية والأقران الدائمين من مستودع/إصدار الشبكة الرئيسية الرسمي.
:::

### 4. بدء المزامنة

```bash
qorechaind start
```

---

## التمهيد السريع

قد تستغرق المزامنة من النشأة وقتًا طويلًا. للتكاملات، استخدم **مزامنة الحالة** أو **لقطة** لبداية باردة سريعة.

### مزامنة الحالة

تجلب مزامنة الحالة لقطة حديثة لحالة التطبيق من خوادم RPC موثوقة بدلًا من إعادة تشغيل كل كتلة. كوّن قسم `[statesync]` في `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "<STATESYNC_RPC_1>,<STATESYNC_RPC_2>"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

حدّد ارتفاعًا وتجزئة موثوقين حديثين من نقطة نهاية RPC سليمة:

```bash
curl -s <STATESYNC_RPC_1>/block | jq '.result.block.header.height, .result.block_id.hash'
```

:::note
`<STATESYNC_RPC_1>` و `<STATESYNC_RPC_2>` و `<TRUSTED_BLOCK_HEIGHT>` و `<TRUSTED_BLOCK_HASH>` عناصر نائبة. استخدم خوادم RPC لمزامنة الحالة المنشورة في إصدار الشبكة الرئيسية الرسمي، واستنتج ارتفاع/تجزئة الثقة من كتلة حديثة.
:::

### استعادة لقطة

بدلًا من ذلك، نزّل لقطة حديثة لبيانات السلسلة واستخرجها فوق دليل بياناتك:

```bash
curl -o snapshot.tar.lz4 <MAINNET_SNAPSHOT_URL>
lz4 -dc snapshot.tar.lz4 | tar -xf - -C ~/.qorechaind/
qorechaind start
```

:::note
`<MAINNET_SNAPSHOT_URL>` عنصر نائب. احصل على عناوين URL للقطة (وأي مجموع اختباري مرافق) من إصدار/مستودع الشبكة الرئيسية الرسمي، وتحقق من المجموع الاختباري قبل الاستخراج.
:::

---

## التقليم والفهرسة

اضبط التقليم وفهرسة المعاملات لتلائم تكاملك. ينبغي لمنصات التداول التي تحتاج سجل معاملات كامل أن تعمل بأدنى قدر من التقليم ومع تمكين مفهرس المعاملات.

### التقليم (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | السلوك                                   | حالة الاستخدام                    |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | يحتفظ بالحالة الحديثة، ويقلّم الباقي       | عقدة RPC، استعلامات الرصيد/الحالة   |
| `nothing`   | يحتفظ بكل الحالة التاريخية                 | عقدة أرشيفية، سجل كامل             |
| `custom`    | قيم احتفاظ/فترات يحددها المشغّل            | احتفاظ مضبوط                       |

### فهرسة المعاملات (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

عيّن `indexer = "kv"` (أو مفهرسًا أغنى) لتكون المعاملات قابلة للاستعلام بالتجزئة والحدث — أساسي للمنصات التي تطابق الإيداعات والسحوبات. عيّن `indexer = "null"` فقط إذا لم تكن تحتاج استعلامات معاملات تاريخية.

---

## كشف نقاط النهاية للتكامل

فعّل واربط خوادم API التي يحتاجها المكاملون في `app.toml`:

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

| نقطة النهاية | المنفذ | تُستخدم لـ                                              |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | بثّ المعاملات، الاستعلام عن الكتل/الحالة                |
| REST         | `1317`  | استعلامات HTTP لحالة السلسلة                            |
| gRPC         | `9090`  | وصول برمجي عالي الإنتاجية                                |
| EVM JSON-RPC | `8545`  | تكاملات متوافقة مع Ethereum (معرّف السلسلة `9801`)       |
| EVM WS       | `8546`  | اشتراكات أحداث EVM                                      |
| SVM RPC      | `8899`  | تكاملات متوافقة مع Solana                               |

:::warning
لا تكشف أبدًا RPC أو EVM JSON-RPC أو gRPC مباشرةً للإنترنت العام دون وكيل عكسي وتحديد معدل ومصادقة وجدار حماية. اربط بـ `0.0.0.0` فقط خلف طبقة دخول مُتحكَّم بها.
:::

---

## مراقبة الصحة والمزامنة

### حالة المزامنة

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — لا يزال يزامن.
* `false` — متزامن بالكامل ويقدّم الحالة الحالية.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

ينبغي أن يبلّغ حقل `network` عن `qorechain-vladi` (الشبكة الرئيسية) أو `qorechain-diana` (شبكة الاختبار).

### Prometheus و Grafana

تكشف QoreChain مقاييس Prometheus على المنفذ **26660**:

```
http://localhost:26660/metrics
```

اجمع هذه بأي مُجمّع متوافق مع Prometheus. إذا شغّلت حزمة المراقبة Docker Compose، يتوفّر Grafana على `http://localhost:3001` — عيّن بيانات اعتمادك الخاصة عند أول تسجيل دخول. تتبّع تأخّر ارتفاع الكتلة، وعدد الأقران، واستخدام الموارد؛ نبّه عندما يبقى `catching_up` على `true` أو ينخفض عدد الأقران إلى صفر.

### فحص نقطة نهاية EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## أفضل الممارسات التشغيلية

1. **ثبّت إصدار السلسلة.** شغّل الوسم الحي (**v3.1.77** على الشبكة الرئيسية) وتتبّع الإصدارات الرسمية للترقيات المنسّقة.

2. **شغّل عقدًا فائضة.** شغّل عقدتين على الأقل خلف موازِن تحميل بحيث لا يقطع إعادة تشغيل أو إعادة مزامنة واحدة حركة مرور التكامل.

3. **تحقق من النشأة واللقطات.** تحقق دائمًا من SHA-256 للنشأة وأي مجموع اختباري للقطة مقابل الإصدار الرسمي قبل البدء.

4. **احمِ نقاط النهاية العامة.** ضع وكيلًا عكسيًا وتحديد معدل وجدار حماية أمام RPC/EVM/gRPC. لا تكشف أبدًا كتابة RPC غير مصادَق عليها للإنترنت.

5. **طابق التقليم مع الحاجة.** استخدم `pruning = "nothing"` مع `tx_index = "kv"` للمنصات التي تطابق سجل إيداع/سحب كامل؛ واستخدم `default` للاستعلامات الخفيفة.

6. **راقب المزامنة باستمرار.** نبّه على تأخّر ارتفاع الكتلة، وانعدام الأقران، وعقدة عالقة في `catching_up`.

للوصول للقراءة فائق الخفّة دون تشغيل عقدة كاملة، راجع توثيق **العقدة الخفيفة**.

---

## الخطوات التالية

* [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) — نشأة الشبكة الرئيسية والأقران وتفاصيل الاتصال
* [تشغيل مدقق](/developer-guide/running-a-validator) — أضِف واجبات إنتاج الكتل
* [البناء من المصدر](/developer-guide/building-from-source) — ابنِ ثنائي `qorechaind`
* **العقدة الخفيفة** — وصول قراءة-فقط فائق الخفّة (التوثيق قريبًا)
