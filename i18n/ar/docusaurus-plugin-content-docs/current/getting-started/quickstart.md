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
docker compose up -d
```

يُشغّل هذا الخدمات التالية:

| الخدمة            | المنافذ                                                                   | الوصف                                  |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------- |
| **qorechain-node** | `26657` (RPC)، `1317` (REST)، `9090` (gRPC)، `8545` (EVM)، `8899` (SVM) | عقدة بلوكتشين كاملة مع دعم متعدد الأجهزة الافتراضية   |
| **ai-sidecar**     | `50051`                                                                 | محرّك QCAI لاكتشاف الشذوذ وتقييم المخاطر |
| **indexer**        | --                                                                      | مُفهرس الكتل للاستعلامات التاريخية         |
| **postgres**       | `5432`                                                                  | قاعدة بيانات خلفية للمُفهرس             |
| **prometheus**     | `9091`                                                                  | جمع المقاييس                           |
| **grafana**        | `3001`                                                                  | لوحات معلومات المراقبة                        |

بمجرد أن تصبح جميع الحاويات سليمة، تبدأ عقدتك بالمزامنة مع الشبكة.

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

### تهيئة العقدة

```bash
./qorechaind init my-node --chain-id qorechain-diana
```

ينشئ هذا التكوين الافتراضي وأدلة البيانات ضمن `~/.qorechaind/`.

### تشغيل العقدة

```bash
./qorechaind start
```

تبدأ العقدة بالإعدادات الافتراضية. راجع [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) للانضمام إلى الشبكة النشطة بتكوين جيني وتهيئة أقران مناسبين.

:::note
تستهدف الأمثلة في هذه الصفحة شبكة **`qorechain-diana`** للاختبار (معرّف سلسلة EVM **9800**). الشبكة الرئيسية (**`qorechain-vladi`**، معرّف سلسلة EVM **9801**) نشطة منذ 7 يونيو 2026 ولها صفحة **الاتصال بالشبكة الرئيسية** المخصصة الخاصة بها.
:::

---

## التحقق من التثبيت

تأكّد من أن عقدتك تعمل بشكل صحيح:

```bash
# Check the binary version
./qorechaind version
```

```bash
# Query the node status via RPC
curl localhost:26657/status
```

تتضمّن الاستجابة الناجحة `moniker` للعقدة، و `network` (يجب أن يكون `qorechain-diana`)، وارتفاع الكتلة الحالي.

---

## الخطوات التالية

* [الاتصال بشبكة الاختبار](/getting-started/connecting-to-testnet) — انضم إلى شبكة Diana النشطة للاختبار
* [إعداد المحفظة](/getting-started/wallet-setup) — تهيئة محفظة للتفاعل مع السلسلة
* [معاملتك الأولى](/getting-started/first-transaction) — أرسل أول تحويل QOR لك
* [الاتصال بالشبكة الرئيسية](/getting-started/connecting-to-mainnet) — انضم إلى شبكة Vladi الرئيسية النشطة
* [نظرة عامة على SDK](/sdk/overview) — ابنِ تطبيقات على QoreChain من الشيفرة
