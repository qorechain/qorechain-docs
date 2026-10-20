---
slug: /getting-started/quickstart
title: البدء السريع
sidebar_label: البدء السريع
sidebar_position: 1
---

# البدء السريع

شغّل عقدة QoreChain في دقائق. اختر Docker Compose للإعداد الأسرع، أو ابنِ من المصدر للتحكم الكامل.

---

## Docker Compose (موصى به)

أبسط طريقة لتشغيل بيئة QoreChain كاملة مع جميع الخدمات المُهيّأة مسبقًا.

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
cp .env.example .env
cp .env.sidecar.example .env.sidecar
# edit .env and set GRAFANA_PASSWORD (Compose refuses to start without it)
docker compose up -d
```

قبل أول تشغيل، انسخ `.env.example` إلى `.env` و`.env.sidecar.example` إلى `.env.sidecar` (كما هو موضّح أعلاه) واضبط `GRAFANA_PASSWORD`.

يُشغّل هذا الخدمات التالية:

| الخدمة            | المنافذ                                                                   | الوصف                                  |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------- |
| **qorechain-node** | `26657` (RPC)، `1317` (REST)، `9090` (gRPC)، `8545` / `8546` (EVM) | عقدة بلوكتشين كاملة مع دعم متعدد الأجهزة الافتراضية   |
| **ai-sidecar**     | `50051`                                                                 | محرّك QCAI لاكتشاف الشذوذ وتقييم المخاطر |
| **indexer**        | --                                                                      | مُفهرس الكتل للاستعلامات التاريخية         |
| **postgres**       | `5432`                                                                  | قاعدة بيانات خلفية للمُفهرس             |
| **prometheus**     | `9091`                                                                  | جمع المقاييس                           |
| **grafana**        | `3001`                                                                  | لوحات معلومات المراقبة                        |

بمجرد أن تصبح جميع الحاويات سليمة، يكون لديك **سلسلة تطوير محلية بعقدة واحدة** (تُهيّئ جينيسيس خاصًا بها؛ ولا تنضم إلى الشبكة الرئيسية ولا إلى شبكة الاختبار). للانضمام إلى شبكة نشطة، اتبع صفحتَي [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) أو [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet).

---

## البناء من المصدر

### المتطلبات المسبقة

* **Go 1.26+** مع تفعيل CGO
* **سلسلة أدوات Rust** (لتجميع تشفير PQC ومكتبات وقت تشغيل SVM)
* **Git**

### بناء الملف التنفيذي

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

:::caution البناء من المصدر مخصص للتطوير المحلي
تبني الشجرة المصدرية العامة الملف التنفيذي المجتمعي. فهو يضم مجموعة الأوامر الكاملة لكنه لا يتضمن موقِّع ما بعد الكم: إذ يُرجع `tx pqc gen-key` و`tx pqc cosign` خطأً ("requires the full build")، ولذلك لا يستطيع إنشاء معاملات لشبكة تشترط التواقيع الهجينة، كما أن حرّاسه الهيكلية (stub keepers) لا تعيد إنتاج حالة الإجماع للشبكتين. وللانضمام إلى الشبكة الرئيسية أو شبكة الاختبار أو إجراء معاملات عليهما، ثبّت الملف التنفيذي الرسمي المذكور في `latest.json` ضمن [download.qore.host](https://download.qore.host).
:::

### تهيئة العقدة

```bash
./qorechaind init my-node --chain-id qorechain-diana
```

ينشئ هذا التكوين الافتراضي وأدلة البيانات ضمن `~/.qorechaind/`. وعند تشغيلها بمفردها تُشكّل العقدة سلسلة محلية بعقدة واحدة؛ وللانضمام إلى شبكة نشطة اتبع صفحات الاتصال.

### تشغيل العقدة

```bash
./qorechaind start
```

تبدأ العقدة بالإعدادات الافتراضية. راجع [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) للانضمام إلى الشبكة النشطة بتكوين جيني وتهيئة أقران مناسبين.

:::note
تستهدف الأمثلة في هذه الصفحة شبكة **`qorechain-diana`** للاختبار (معرّف سلسلة EVM **9800**). الشبكة الرئيسية (**`qorechain-vladi`**، معرّف سلسلة EVM **9801**) نشطة منذ 7 يونيو 2026 (الإصدار v3.2.3؛ وتعمل شبكة الاختبار بالإصدار v3.2.4) ولها صفحة **الاتصال بالشبكة الرئيسية** المخصصة الخاصة بها.
:::

---

## التحقق من التثبيت

تأكّد من أن عقدتك تعمل بشكل صحيح:

```bash
# Check that the binary runs
./qorechaind --help
```

```bash
# Query the node status via RPC
curl localhost:26657/status
```

تتضمّن الاستجابة الناجحة `moniker` للعقدة، و `network` (وهو `qorechain-diana` للسلسلة المحلية للتطوير المُنشأة أعلاه، أو السلسلة التي انضممت إليها)، وارتفاع الكتلة الحالي.

---

## الخطوات التالية

* [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) — انضم إلى شبكة Diana النشطة للاختبار
* [إعداد المحفظة](/getting-started/wallet-setup) — تهيئة محفظة للتفاعل مع السلسلة
* [معاملتك الأولى](/getting-started/first-transaction) — أرسل أول تحويل QOR لك
* [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) — انضم إلى شبكة Vladi الرئيسية النشطة
* [نظرة عامة على SDK](/sdk/overview) — ابنِ تطبيقات على QoreChain من الشيفرة
