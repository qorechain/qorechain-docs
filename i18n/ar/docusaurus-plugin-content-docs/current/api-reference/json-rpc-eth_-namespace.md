---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — مساحة الأسماء eth_
sidebar_label: JSON-RPC — مساحة الأسماء eth_
sidebar_position: 3
---

# JSON-RPC — مساحة الأسماء eth_

تطبّق QoreChain واجهة JSON-RPC متوافقة مع EVM، مما يتيح لأدوات Ethereum القياسية (MetaMask وHardhat وFoundry وethers.js وweb3.js) قراءة حالة السلسلة وتقدير الغاز دون أي تعديل. **يتطلب إرسال معاملة من مسار EVM خطوة إضافية واحدة** منذ إصدار السلسلة v3.2.0: يجب أن يملك الحساب المُرسِل مفتاحًا مسجَّلًا ما بعد كمومي ونافذة تفويض EVM مفتوحة (انظر [إرسال المعاملات](#sending-transactions)).

## الاتصال

| النقل     | العنوان الافتراضي       |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
تُقدَّم واجهة EVM JSON-RPC من شبكة **`qorechain-vladi`** الرئيسية (معرّف سلسلة EVM **9801**، بالنظام السداسي عشري `0x2649`، إصدار العقدة **v3.2.3**، تعمل منذ 7 يونيو 2026) وشبكة **`qorechain-diana`** الاختبارية (معرّف سلسلة EVM **9800**، بالنظام السداسي عشري `0x2648`، إصدار العقدة **v3.2.4**، للشبكة الاختبارية فقط). تنطبق العناوين المحلية أعلاه على عقدة تشغّلها بنفسك. نقاط HTTP العامة هي `https://evm.qore.host` (الشبكة الرئيسية) و`https://evm-testnet.qore.host` (الشبكة الاختبارية)، وهي مدرجة في [الشبكات](/appendix/networks#public-endpoints). الـ WebSocket العام الوحيد لـ EVM هو الخاص بالشبكة الاختبارية (`wss://evm-ws-testnet.qore.host`)؛ ولا يوجد WebSocket عام لـ EVM على الشبكة الرئيسية.
:::

## مساحات الأسماء المدعومة

| مساحة الاسم | الوصف                                                                                                          |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | طرق Ethereum JSON-RPC الأساسية                                                                                 |
| `web3_`   | طرق مساعدة (إصدار العميل، التجزئة)                                                                            |
| `net_`    | طرق حالة الشبكة                                                                                                |
| `txpool_` | فحص مجمّع المعاملات                                                                                            |
| `rpc_`    | استكشاف الخادم الذاتي (`rpc_modules`)                                                                          |

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
| `eth_getBlockByHash`        | `blockHash`، `fullTx` (bool)                     | تُرجِع بيانات الكتلة حسب الـ hash                      |
| `eth_getCode`               | `address`، `blockNumber`                         | تُرجِع الشيفرة البايتية للعقد                    |
| `eth_getStorageAt`          | `address`، `slot`، `blockNumber`                 | تُرجِع خانة تخزين                               |
| `eth_getBlockReceipts`      | `blockNumber`                                    | تُرجِع جميع إيصالات كتلة                      |
| `eth_getProof`              | `address`، `storageKeys`، `blockNumber`          | تُرجِع إثبات حساب                                |
| `eth_createAccessList`      | `callObject`، `blockNumber`                      | تبني قائمة وصول لاستدعاء                       |
| `eth_maxPriorityFeePerGas`  | لا شيء                                            | تُرجِع رسوم الأولوية المقترحة (wei)             |
| `eth_syncing`               | لا شيء                                            | تُرجِع `false` عندما تكون العقدة قد لحقت بالسلسلة |
| `eth_newFilter`, `eth_newBlockFilter`, `eth_getFilterChanges` | filter object / filter id | مرشِّحات الاستطلاع (polling)                              |

## طرق web3_

| الطريقة               | المعاملات   | الوصف                              |
| -------------------- | ------------ | ---------------------------------------- |
| `web3_clientVersion` | لا شيء        | تُرجِع سلسلة نصّية لإصدار العميل        |
| `web3_sha3`          | `data` (hex) | تُرجِع تجزئة Keccak-256 للمُدخَل |

## طرق txpool_

| الطريقة           | المعاملات | الوصف                                                         |
| ---------------- | ---------- | ------------------------------------------------------------------- |
| `txpool_status`  | لا شيء       | تُرجِع عدد المعاملات المعلّقة والمصطفّة                    |
| `txpool_content` | لا شيء       | تُرجِع المعاملات المعلّقة والمصطفّة (غير متاحة على نقاط النهاية العامة) |
| `txpool_inspect` | لا شيء       | تُرجِع ملخصًا للمجمّع (غير متاحة على نقاط النهاية العامة)               |

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

# Enabled API namespaces (a node initialised by v3.2.3 or later defaults to "eth,net,web3";
# txpool is opt-in because it publishes the node's pending transactions)
api = "eth,web3,net,txpool"

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

## حدود نقاط النهاية العامة {#public-limits}

:::note
- تقبل `eth_getLogs` حدًا أقصى قدره **10,000 كتلة** بين `fromBlock` و`toBlock`. أي نطاق أوسع يُرجع `{"code":-32000,"message":"maximum [from, to] blocks distance: 10000"}`. استعلم بنوافذ من 10,000 كتلة أو أقل. أما إعداد `filter-cap` المنفصل فيحدّ من عدد السجلات المُرجَعة.
- تعمل `txpool_status` على نقاط النهاية العامة. أما `txpool_content` و`txpool_inspect` فهما معطّلتان على نقطة نهاية الشبكة الرئيسية العامة ونقطة نهاية الشبكة الاختبارية العامة معًا (وتعملان على عقدة تشغّلها بنفسك، مع إدراج `txpool` في قائمة `api` الخاصة بها).
- طرق `debug_*` و`eth_signTransaction` غير متاحة.
- يحتاج `eth_subscribe` إلى اتصال WebSocket. عبر HTTP يُرجع `-32601 notifications not supported`. انظر [أحداث WebSocket](/api-reference/websocket-events).
- تُقلَّم الحالة عند الارتفاعات القديمة على نقاط النهاية العامة، لذا قد يفشل `eth_call` على كتلة تاريخية بعيدة بخطأ إصدار الحالة.
- إذا حصل نص برمجي على `403 Forbidden`، فعيّن ترويسة `User-Agent` صريحة؛ فوكيل `urllib` الافتراضي في Python محظور، بينما تعمل عملاء `requests` و`curl` وNode وGo كما هي.
:::

## إرسال المعاملات {#sending-transactions}

:::caution مسار EVM يحتاج إلى مفتاح PQC ونافذة مفتوحة
منذ إصدار السلسلة v3.2.0، يقبل مسار EVM معاملة (`MsgEthereumTx`، بما في ذلك نشر العقود) فقط من حساب لديه **مفتاح مسجَّل ما بعد كمومي** و**نافذة تفويض EVM مفتوحة**. لا تستطيع محفظة EVM عادية لم تُجرِ هذا الإعداد إرسال المعاملات: ترفضها العقدة بخطأ من وحدة `pqc` (الرموز 26 أو 27 أو 28) بدلًا من تضمينها. أما قراءة الأرصدة واستدعاء `eth_call` وتقدير الغاز فلا تحتاج إلى نافذة. ومنذ v3.2.2 تُرفض أيضًا المعاملة الموقَّعة **دون معرّف سلسلة** (قبل EIP-155)، ومنذ v3.2.3 يمكن تحديد نطاق النافذة بحيث تقتصر على تحويلات QOR العادية (`native_only`) أو على مستلمين مدرجين (`allowed_targets`)؛ وتُرفض المعاملة الخارجة عن النطاق بالرمز 27.

تحقق من الحساب قبل الإرسال:

- `GET /qorechain/pqc/v1/account/{address}` (القيمة `found: true` تعني أن مفتاحًا مسجَّل)
- `GET /qorechain/pqc/v1/evm_window/{address}` (القيمة `live: true` تعني أن نافذة تقبل المعاملات حاليًا)

كلاهما موصوف في [نقاط نهاية REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module) (وتُبلغ استجابة النافذة أيضًا عن `native_only` و`allowed_targets`). تُفتح النافذة بمعاملة QoreChain (`MsgOpenEVMWindow`، محدودة بحد أقصى 17,280 كتلة و1,000 معاملة إضافةً إلى سقف للقيمة)، وليس بمعاملة Ethereum. انظر [تطوير EVM](/developer-guide/evm-development) للاطلاع على نظرة عامة على المسار.
:::

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
  "result": "0x37f559"
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
- قيود المرشِّح: `eth_getLogs` محدودة بـ `filter-cap` نتيجة لكل استعلام (الافتراضي 10,000)، وترفض نقاط النهاية العامة النطاقات الأوسع من 10,000 كتلة. استخدم نطاقات كتل أضيق لمجموعات البيانات الكبيرة.

:::
