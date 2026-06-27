---
slug: /getting-started/first-transaction
title: المعاملة الأولى
sidebar_label: المعاملة الأولى
sidebar_position: 5
---

# المعاملة الأولى

يرشدك هذا الدليل خلال إرسال رموز QOR، والاستعلام عن المعاملات، والتفاعل مع QoreChain عبر واجهاتها الأصلية و EVM و SVM.

:::note
تستخدم الأوامر أدناه شبكة **`qorechain-diana`** للاختبار (معرّف سلسلة EVM **9800**). الشبكة الرئيسية (**`qorechain-vladi`**، معرّف سلسلة EVM **9801**) نشطة منذ 7 يونيو 2026 — استبدل معرّف سلسلة الشبكة الرئيسية ونقاط النهاية من صفحة **الاتصال بالشبكة الرئيسية** عند إجراء المعاملات على الشبكة الرئيسية.
:::

## التحقق من رصيدك

قبل إرسال الرموز، تحقّق من رصيد حسابك:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

تتضمّن الاستجابة جميع فئات الرموز التي يحتفظ بها الحساب. تُعرض أرصدة QOR بوحدة `uqor` (ميكرو-QOR)، حيث **1 QOR = 1,000,000 uqor**.

## إرسال QOR

حوّل الرموز من مفتاحك إلى عنوان آخر:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

يرسل هذا **1 QOR** (1,000,000 uqor) إلى عنوان المستلم، مع دفع رسوم قدرها 500 uqor.

:::caution تتطلّب تحويلات Cosmos توقيعًا هجينًا مقاومًا للحوسبة الكمومية
في مسار cosmos، الإعداد الافتراضي للشبكة هو `hybrid_signature_mode = required` (إصدار السلسلة الحالي **v3.1.77**). يتم **رفض** أمر `tx bank send` الكلاسيكي البسيط — يجب أن تحمل كل معاملة في مسار cosmos توقيع ML-DSA-87 (Dilithium-5) إلى جانب توقيع secp256k1. أنشئ مفتاح Dilithium-5 باستخدام `qorechaind tx pqc gen-key`، ثم أرفق التوقيع الهجين المشترك باستخدام `qorechaind tx pqc cosign` (أو ابنِ المعاملة باستخدام `buildHybridTx` من QoreChain SDK، مع استخدام `includePqcPublicKey` لتسجيل المفتاح تلقائيًا عند أول استخدام). لإنتاج التوقيع الهجين خارج واجهة سطر الأوامر، تقوم مكتبة [**qorechain-pqc**](/developer-guide/post-quantum-signing) مفتوحة المصدر (`hybridSignBytes`) و QoreChain SDK بالمكافئ في الشيفرة. راجع [إعداد المحفظة](/getting-started/wallet-setup) للاطّلاع على التدفق الهجين الكامل.
:::

سيُطلب منك تأكيد المعاملة قبل بثّها. بمجرد التأكيد، تُعيد واجهة سطر الأوامر تجزئة المعاملة.

## الاستعلام عن المعاملة

ابحث عن معاملة مكتملة عبر تجزئتها:

```bash
qorechaind query tx <txhash>
```

يتضمّن الإخراج حالة المعاملة، والغاز المستخدم، وارتفاع الكتلة، وجميع الأحداث المنبعثة أثناء التنفيذ.

لإخراج JSON:

```bash
qorechaind query tx <txhash> --output json
```

## استخدام JSON-RPC (EVM)

تعرض بيئة تنفيذ EVM في QoreChain واجهة JSON-RPC قياسية لإيثريوم على المنفذ `8545`.

:::note
معاملات EVM **غير متأثرة** بمتطلب التوقيع الهجين المقاوم للحوسبة الكمومية في مسار cosmos. فهي تستخدم مسار ante منفصلًا `eth_secp256k1`، لذا فإن التوقيع القياسي لإيثريوم (MetaMask، ethers.js، إلخ.) يعمل دون امتداد PQC.
:::

### الحصول على رقم أحدث كتلة

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }' | jq '.result'
```

### الحصول على رصيد حساب

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0xYourEVMAddress", "latest"],
    "id": 1
  }' | jq '.result'
```

يُعاد الرصيد كقيمة مُرمّزة بالنظام الست عشري بأصغر فئة.

## استخدام SVM RPC

تعرض بيئة تنفيذ SVM في QoreChain واجهة RPC متوافقة مع سولانا على المنفذ `8899`.

### الحصول على الفتحة الحالية

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getSlot",
    "id": 1
  }' | jq '.result'
```

### الحصول على رصيد حساب

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["YourSVMPublicKey"],
    "id": 1
  }' | jq '.result'
```

## أنماط واجهة سطر الأوامر الشائعة

عند العمل مع واجهة سطر أوامر `qorechaind`، تُستخدم هذه الرايات بشكل متكرر:

| الراية               | الوصف                   | مثال                        |
| ------------------ | ----------------------------- | ------------------------------ |
| `--chain-id`       | يحدّد السلسلة المستهدفة    | `--chain-id qorechain-diana`   |
| `--fees`           | رسوم المعاملة بوحدة uqor       | `--fees 500uqor`               |
| `--from`           | اسم مفتاح التوقيع أو العنوان   | `--from mykey`                 |
| `--output`         | تنسيق الاستجابة               | `--output json`                |
| `--node`           | نقطة نهاية RPC للاتصال بها    | `--node tcp://localhost:26657` |
| `--gas`            | حدّ الغاز للمعاملة | `--gas auto`                   |
| `--gas-adjustment` | مضاعف للغاز المُقدّر  | `--gas-adjustment 1.3`         |
| `-y`               | تخطّي مطالبة التأكيد      | `-y`                           |

### مثال: أمر كامل مع جميع الرايات الشائعة

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor \
  --node tcp://localhost:26657 \
  --output json \
  -y
```

## الخطوات التالية

الآن وقد أرسلت معاملتك الأولى، استكشف المزيد ممّا تقدّمه QoreChain:

* **التخزين والتفويض** — قم بتخزين QOR واكسب المكافآت
* **جسر الأصول** — انقل الأصول عبر السلاسل
* **تطوير EVM** — انشر عقود Solidity الذكية على QoreChain
