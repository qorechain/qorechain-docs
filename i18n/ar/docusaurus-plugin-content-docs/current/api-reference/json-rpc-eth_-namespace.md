---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — مساحة الأسماء eth_
sidebar_label: JSON-RPC — مساحة الأسماء eth_
sidebar_position: 3
---

# JSON-RPC — مساحة الأسماء eth_

تطبّق QoreChain واجهة JSON-RPC متوافقة بالكامل مع EVM، مما يتيح لأدوات Ethereum القياسية (MetaMask وHardhat وFoundry وethers.js وweb3.js) التفاعل مع السلسلة دون أي تعديل.

## الاتصال

| النقل     | العنوان الافتراضي       |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
تُقدَّم واجهة EVM JSON-RPC من شبكة **`qorechain-vladi`** الرئيسية (معرّف سلسلة EVM **9801**، بالنظام السداسي عشري `0x2649`، تعمل على إصدار السلسلة **v3.1.82**) وشبكة **`qorechain-diana`** الاختبارية (معرّف سلسلة EVM **9800**، بالنظام السداسي عشري `0x2648`). تنطبق العناوين المحلية أعلاه على عقدة تشغّلها بنفسك؛ استبدلها بنقطة نهاية الشبكة الرئيسية أو الاختبارية الخاصة بمزوّدك للوصول عن بُعد.
:::

## مساحات الأسماء المدعومة

| مساحة الاسم | الوصف                                                                                                          |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | طرق Ethereum JSON-RPC الأساسية                                                                                 |
| `web3_`   | طرق مساعدة (إصدار العميل، التجزئة)                                                                            |
| `net_`    | طرق حالة الشبكة                                                                                                |
| `txpool_` | فحص مجمّع المعاملات                                                                                            |
| `qor_`    | امتدادات خاصة بـ QoreChain (انظر [مساحة الأسماء qor_](/api-reference/json-rpc-qor_-namespace))                   |

## طرق eth_

| الطريقة                      | المعاملات                                       | الوصف                                          |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `eth_blockNumber`           | لا شيء                                            | تُرجِع رقم أحدث كتلة                      |
| `eth_getBalance`            | `address`، `blockNumber`                         | تُرجِع رصيد العنوان بوحدة wei             |
| `eth_getTransactionCount`   | `address`، `blockNumber`                         | تُرجِع الـ nonce (عدد المعاملات) لعنوان |
| `eth_sendRawTransaction`    | `signedTxData`                                   | تُرسِل معاملة موقَّعة للبثّ           |
| `eth_call`                  | `callObject`، `blockNumber`                      | تنفّذ استدعاءً للقراءة فقط على EVM            |
| `eth_estimateGas`           | `callObject`                                     | تقدّر كمية الغاز اللازمة لمعاملة         |
| `eth_getBlockByNumber`      | `blockNumber`، `fullTx` (bool)                   | تُرجِع بيانات الكتلة حسب الرقم                         |
| `eth_getTransactionByHash`  | `txHash`                                         | تُرجِع بيانات المعاملة حسب الـ hash                     |
| `eth_getTransactionReceipt` | `txHash`                                         | تُرجِع إيصال معاملة مُعدَّنة          |
| `eth_getLogs`               | `filterObject`                                   | تُرجِع السجلّات المطابقة لمرشِّح                       |
| `eth_chainId`               | لا شيء                                            | تُرجِع معرّف السلسلة (مُرمَّز بالنظام السداسي عشري)                   |
| `eth_gasPrice`              | لا شيء                                            | تُرجِع سعر الغاز الحالي بوحدة wei                 |
| `eth_feeHistory`            | `blockCount`، `newestBlock`، `rewardPercentiles` | تُرجِع بيانات الرسوم التاريخية (EIP-1559)               |

## طرق web3_

| الطريقة               | المعاملات   | الوصف                              |
| -------------------- | ------------ | ---------------------------------------- |
| `web3_clientVersion` | لا شيء        | تُرجِع سلسلة نصّية لإصدار العميل        |
| `web3_sha3`          | `data` (hex) | تُرجِع تجزئة Keccak-256 للمُدخَل |

## طرق net_

| الطريقة          | المعاملات | الوصف                                 |
| --------------- | ---------- | ------------------------------------------- |
| `net_version`   | لا شيء      | تُرجِع معرّف الشبكة                      |
| `net_listening` | لا شيء      | تُرجِع `true` إذا كانت العقدة تستمع     |
| `net_peerCount` | لا شيء      | تُرجِع عدد النظراء المتصلين (hex) |

## التهيئة

فعّل خادم JSON-RPC وهيّئه في `app.toml`:

```toml
[json-rpc]
# Enable the JSON-RPC server
enable = true

# HTTP server address
address = "0.0.0.0:8545"

# WebSocket server address
ws-address = "0.0.0.0:8546"

# Enabled API namespaces
api = "eth,web3,net,txpool,qor"

# Maximum number of logs returned by eth_getLogs
filter-cap = 10000

# Maximum gas for eth_call and eth_estimateGas
gas-cap = 25000000

# EVM execution timeout
evm-timeout = "5s"

# Transaction fee cap (in QOR)
txfee-cap = 1

# Maximum open WebSocket connections
max-open-connections = 0
```

## أمثلة

### eth_blockNumber

الطلب:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }'
```

الاستجابة:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x53b35"
}
```

### eth_chainId

الطلب:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_chainId",
    "params": [],
    "id": 2
  }'
```

الاستجابة (الشبكة الرئيسية `qorechain-vladi`، معرّف السلسلة 9801):

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": "0x2649"
}
```

على شبكة `qorechain-diana` الاختبارية (معرّف السلسلة 9800) تُرجِع هذه الطريقة `"0x2648"`.

### eth_getBalance

الطلب:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28", "latest"],
    "id": 3
  }'
```

الاستجابة:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": "0x56bc75e2d63100000"
}
```

## الاتصال باستخدام ethers.js

```javascript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get latest block
const block = await provider.getBlockNumber();
console.log("Latest block:", block);

// Get balance
const balance = await provider.getBalance("0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28");
console.log("Balance:", ethers.formatEther(balance), "QOR");
```

:::info

- يُرجَع معرّف السلسلة كسلسلة نصّية بالنظام السداسي عشري. حوّله إلى النظام العشري لتهيئة المحفظة — `0x2649` هو **9801** (الشبكة الرئيسية)، و`0x2648` هو **9800** (الشبكة الاختبارية).
- يتبع تسعير الغاز نموذج EIP-1559. استخدم `eth_feeHistory` لتقدير الرسوم الأساسية ورسوم الأولوية.
- وسوم الكتل المقبولة: `"latest"`، `"earliest"`، `"pending"`، أو رقم كتلة بالنظام السداسي عشري.
- قيود المرشِّح: `eth_getLogs` محدودة بـ `filter-cap` نتيجة لكل استعلام (الافتراضي 10,000). استخدم نطاقات كتل أضيق لمجموعات البيانات الكبيرة.

:::
