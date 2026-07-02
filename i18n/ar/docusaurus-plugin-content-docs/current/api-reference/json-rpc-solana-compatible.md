---
slug: /api-reference/json-rpc-solana-compatible
title: JSON-RPC — متوافق مع Solana
sidebar_label: JSON-RPC — متوافق مع Solana
sidebar_position: 4
---

# JSON-RPC — متوافق مع Solana

توفّر QoreChain واجهة JSON-RPC متوافقة مع Solana من خلال بيئة تشغيل SVM (آلة Solana الافتراضية) الخاصة بها، ممّا يتيح لأدوات Solana وحِزم SDK الحالية التفاعل مع QoreChain بشكل أصيل.

## الاتصال

| وسيلة النقل | العنوان |
| --------- | ------------------------- |
| HTTP (عقدة خاصة بك) | `http://127.0.0.1:8899`   |
| HTTPS (عام، الشبكة الرئيسية، للقراءة فقط) | `https://svm.qore.host` |
| HTTPS (عام، شبكة الاختبار، للقراءة فقط) | `https://svm-testnet.qore.host` |

يتم **تشغيل خادم JSON-RPC بواسطة `qorechaind start`** وهو **مفعّل افتراضيًا**، ويستمع على `127.0.0.1:8899`. تتم تهيئته عبر قسم `[svm-rpc]` في ملف `app.toml` (`enable` + `address`). العقدة المشغَّلة حديثًا تخدم هذه الواجهة بالفعل — لا حاجة إلى أي عملية إضافية. نقاط النهاية العامة **للقراءة فقط** (إرسال المعاملات معطَّل عند الحافة).

:::note
اعتبارًا من إصدار السلسلة **v3.1.82**، تخدم واجهة SVM **رصيد QOR الأصلي** للحساب — وهو نفس الأموال الموحّدة الظاهرة على واجهتَي Cosmos وEVM — مقوَّمًا بوحدة **lamports** (9 منازل عشرية؛ **1 uqor = 1,000 lamports**). راجع [QOR الأصلي على واجهة SVM](/developer-guide/svm-development#native-qor).
:::

---

## الطرق (Methods)

| الطريقة                              | المعاملات               | الوصف                                                    |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `getAccountInfo`                    | `pubkey` (سلسلة base58) | تُعيد بيانات الحساب والمالك وقيمة lamports وعلامة القابلية للتنفيذ     |
| `getBalance`                        | `pubkey` (سلسلة base58) | تُعيد رصيد QOR الأصلي بوحدة lamports للمفتاح العام المحدد |
| `getSignaturesForAddress`           | `address` (سلسلة base58) | تُعيد توقيعات المعاملات المتعلقة بالعنوان (كشف الإيداعات) |
| `getSlot`                           | لا شيء                     | تُعيد رقم الفتحة (slot) الحالية                                |
| `getMinimumBalanceForRentExemption` | `dataLength` (عدد صحيح)   | تُعيد الحد الأدنى للرصيد اللازم للإعفاء من الإيجار وفقًا لحجم البيانات |
| `getVersion`                        | لا شيء                     | تُعيد إصدار برنامج العقدة                              |
| `getHealth`                         | لا شيء                     | تُعيد حالة صحة العقدة (`"ok"` إذا كانت سليمة)                 |

---

## تنسيق الاستجابة

تتبع جميع الاستجابات مواصفة JSON-RPC 2.0. الاستجابات التي تشير إلى حالة على السلسلة تتضمن كائن `context` يحتوي على قيمة `slot` الحالية:

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

تشير سلسلة الإصدار `1.18.0-qorechain` إلى التوافق مع واجهة RPC الخاصة بـ Solana 1.18.0 العاملة على بيئة تشغيل SVM في QoreChain.

---

## تكامل @solana/web3.js

يمكن لتطبيقات Solana الحالية الاتصال بـ QoreChain عبر توجيه كائن `Connection` إلى نقطة نهاية SVM المحلية:

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

- **تنسيق العناوين**: تستخدم حسابات SVM مفاتيح عامة مرمّزة بترميز base58 (تنسيق Solana القياسي)، وليس بادئة Bech32 ‏`qor1` المستخدمة في وحدات Cosmos SDK الأصلية.
- **الجسور بين الآلات الافتراضية (Cross-VM)**: لنقل الأصول بين بيئتَي تشغيل EVM وSVM، استخدم وحدة Cross-VM (‏`x/crossvm`). راجع [أوامر المعاملات](/cli-reference/transaction-commands) لصيغة الأمر `crossvm call`.
- **نشر البرامج**: انشر برامج BPF عبر سطر الأوامر (`qorechaind tx svm deploy-program`) أو برمجيًا من خلال بيئة تشغيل SVM.
- **ميزانية الحوسبة**: تفرض بيئة تشغيل SVM افتراضيًا ميزانية حوسبة قدرها 1,400,000 وحدة حوسبة لكل معاملة. وهذا قابل للتهيئة عبر معاملات الوحدة (module parameters).
