---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — متوافق مع Solana
sidebar_label: JSON-RPC — متوافق مع Solana
sidebar_position: 4
---

# JSON-RPC — متوافق مع Solana

توفّر QoreChain واجهة JSON-RPC متوافقة مع Solana من خلال بيئة تشغيل SVM (الجهاز الافتراضي لـ Solana)، مما يتيح لأدوات وحِزم تطوير برمجيات Solana الحالية التفاعل مع QoreChain بشكل أصلي.

## الاتصال

| النقل     | العنوان الافتراضي         |
| --------- | ------------------------- |
| HTTP      | `http://127.0.0.1:8899`   |

يُشغَّل خادم JSON-RPC بواسطة **`qorechaind start`** وهو **مُفعَّل افتراضيًا**، ويستمع على `127.0.0.1:8899`. تتم تهيئته عبر قسم `[svm-rpc]` في `app.toml` (`enable` + `address`). تقدّم العقدة المُشغَّلة حديثًا هذه الواجهة بالفعل — لا حاجة إلى أي عملية إضافية.

:::note
تُقدَّم واجهة JSON-RPC المتوافقة مع Solana على المنفذ **8899** من كلٍّ من شبكة **`qorechain-vladi`** الرئيسية (تعمل على إصدار السلسلة **v3.1.80**) وشبكة **`qorechain-diana`** الاختبارية. ينطبق العنوان المحلي أعلاه على عقدة تشغّلها بنفسك؛ استبدله بنقطة نهاية الشبكة الرئيسية أو الاختبارية الخاصة بمزوّدك للوصول عن بُعد.
:::

---

## الطرق

| الطريقة                              | المعاملات               | الوصف                                                    |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (base58 string) | تُرجِع بيانات الحساب والمالك والـ lamports وعلم القابلية للتنفيذ     |
| `getBalance`                        | `pubkey` (base58 string) | تُرجِع الرصيد بوحدة lamports للمفتاح العام المعطى       |
| `getSlot`                           | لا شيء                    | تُرجِع رقم الفتحة (slot) الحالي                                |
| `getMinimumBalanceForRentExemption` | `dataLength` (integer)   | تُرجِع الحدّ الأدنى للرصيد للإعفاء من الإيجار بناءً على حجم البيانات |
| `getVersion`                        | لا شيء                    | تُرجِع إصدار برنامج العقدة                              |
| `getHealth`                         | لا شيء                    | تُرجِع حالة سلامة العقدة (`"ok"` إذا كانت سليمة)                 |

---

## تنسيق الاستجابة

تتبع جميع الاستجابات مواصفة JSON-RPC 2.0. تتضمّن الاستجابات التي تشير إلى حالة على السلسلة كائن `context` مع الـ `slot` الحالي:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": { ... }
  }
}
```

---

## أمثلة

### getAccountInfo

**الطلب:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getAccountInfo",
    "params": [
      "4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T",
      { "encoding": "base64" }
    ],
    "id": 1
  }'
```

**الاستجابة:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": {
      "data": ["AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", "base64"],
      "executable": false,
      "lamports": 1000000000,
      "owner": "11111111111111111111111111111111",
      "rentEpoch": 0
    }
  }
}
```

### getBalance

**الطلب:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T"],
    "id": 2
  }'
```

**الاستجابة:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "context": {
      "slot": 123456
    },
    "value": 1000000000
  }
}
```

### getVersion

**الطلب:**

```bash
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getVersion",
    "params": [],
    "id": 3
  }'
```

**الاستجابة:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "solana-core": "1.18.0-qorechain",
    "feature-set": 1
  }
}
```

تشير سلسلة الإصدار `1.18.0-qorechain` إلى التوافق مع واجهة Solana 1.18.0 RPC العاملة على بيئة تشغيل QoreChain SVM.

---

## التكامل مع @solana/web3.js

يمكن لتطبيقات Solana الحالية الاتصال بـ QoreChain من خلال توجيه كائن `Connection` إلى نقطة نهاية SVM المحلية:

```javascript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");

// Check version
const version = await connection.getVersion();
console.log("Node version:", version["solana-core"]);

// Get balance
const pubkey = new PublicKey("4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T");
const balance = await connection.getBalance(pubkey);
console.log("Balance:", balance / LAMPORTS_PER_SOL);

// Get slot
const slot = await connection.getSlot();
console.log("Current slot:", slot);

// Get account info
const accountInfo = await connection.getAccountInfo(pubkey);
if (accountInfo) {
  console.log("Owner:", accountInfo.owner.toBase58());
  console.log("Executable:", accountInfo.executable);
  console.log("Data length:", accountInfo.data.length);
}
```

---

## ملاحظات

- **تنسيق العنوان**: تستخدم حسابات SVM مفاتيح عامة مُرمَّزة بـ base58 (تنسيق Solana القياسي)، وليس بادئة `qor1` بترميز Bech32 المستخدمة في وحدات Cosmos SDK الأصلية.
- **الجسر عبر الأجهزة الافتراضية**: لنقل الأصول بين بيئتي تشغيل EVM وSVM، استخدم وحدة Cross-VM (`x/crossvm`). انظر [أوامر المعاملات](/cli-reference/transaction-commands) لمعرفة بنية `crossvm call`.
- **نشر البرامج**: انشر برامج BPF عبر واجهة سطر الأوامر (`qorechaind tx svm deploy-program`) أو برمجيًا من خلال بيئة تشغيل SVM.
- **ميزانية الحوسبة**: تفرض بيئة تشغيل SVM ميزانية حوسبة قدرها 1,400,000 وحدة حوسبة لكل معاملة افتراضيًا. وهذا قابل للتهيئة عبر معاملات الوحدة.
