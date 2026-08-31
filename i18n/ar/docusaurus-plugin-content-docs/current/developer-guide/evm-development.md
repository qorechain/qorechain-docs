---
slug: /developer-guide/evm-development
title: تطوير EVM
sidebar_label: تطوير EVM
sidebar_position: 2
---

# تطوير EVM

تُشغّل QoreChain بيئة تنفيذ متوافقة بالكامل مع EVM على محرك QoreChain EVM Engine، مما يتيح لك نشر عقود Solidity الذكية والتفاعل معها باستخدام الأدوات المألوفة. تعرض وحدة EVM واجهة JSON-RPC على **المنفذ 8545** (وWebSocket على **8546**) تدعم سير عمل تطوير Ethereum القياسي.

:::note
تستهدف الأمثلة أدناه شبكة **`qorechain-vladi`** الرئيسية (معرّف سلسلة EVM **9801**)، العاملة منذ 7 يونيو 2026 وتشغّل إصدار السلسلة **v3.1.95**. لشبكة الاختبار **`qorechain-diana`**، استخدم معرّف سلسلة EVM **9800**.
:::

---

## نقطة نهاية JSON-RPC

| الخاصية               | القيمة                                      |
| --------------------- | ------------------------------------------ |
| عنوان URL الافتراضي   | `http://localhost:8545`                    |
| عنوان URL لـ WebSocket | `ws://localhost:8546`                      |
| المساحات المدعومة     | `eth_`, `web3_`, `net_`, `txpool_`, `qor_` |
| معرّف السلسلة (الشبكة الرئيسية) | `9801` (`qorechain-vladi`)       |
| معرّف السلسلة (شبكة الاختبار)   | `9800` (`qorechain-diana`)       |
| رمز العملة            | `QOR`                                      |

توفّر مساحة `qor_` طرقًا خاصة بـ QoreChain. راجع [المساحة المخصّصة](#custom-qor_-namespace) أدناه.

---

## إعداد المحفظة (MetaMask)

أضف QoreChain كشبكة مخصّصة في MetaMask:

| الحقل                  | قيمة الشبكة الرئيسية        | قيمة شبكة الاختبار      |
| ----------------------- | ---------------------------- | ------------------------ |
| اسم الشبكة              | QoreChain (qorechain-vladi)  | QoreChain Diana          |
| عنوان RPC               | `http://localhost:8545`      | `http://localhost:8545`  |
| معرّف السلسلة           | `9801`                       | `9800`                   |
| رمز العملة              | `QOR`                        | `QOR`                    |
| عنوان مستكشف الكتل      | *(استخدم مستكشف الشبكة الرئيسية الرسمي)* | *(اتركه فارغًا لشبكة الاختبار المحلية)* |

---

## Hardhat

ثبّت Hardhat وقم بإعداد ملف `hardhat.config.js` الخاص بك:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    qorechain: {
      url: "http://localhost:8545",
      accounts: ["0xYOUR_PRIVATE_KEY_HEX"],
      chainId: 9801, // mainnet qorechain-vladi (use 9800 for qorechain-diana testnet)
    },
  },
};
```

نشر عقد:

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

تشغيل الاختبارات على EVM الخاص بـ QoreChain:

```bash
npx hardhat test --network qorechain
```

---

## Foundry

إنشاء عقد ونشره باستخدام Foundry:

```bash
# Create a new project
forge init my-project && cd my-project

# Build
forge build

# Deploy
forge create --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX \
  src/MyContract.sol:MyContract

# Interact
cast call <contract-address> "myFunction()" --rpc-url http://localhost:8545
cast send <contract-address> "setValue(uint256)" 42 \
  --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX
```

---

## Ethers.js

```javascript
import { ethers } from "ethers";

// Connect to QoreChain EVM
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get chain info
const network = await provider.getNetwork();
console.log("Chain ID:", network.chainId); // 9801n on mainnet (9800n on testnet)

// Read balance
const balance = await provider.getBalance("0xYourAddress");
console.log("Balance:", ethers.formatEther(balance), "QOR");

// Send transaction
const wallet = new ethers.Wallet("0xYOUR_PRIVATE_KEY_HEX", provider);
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("1.0"),
});
await tx.wait();
```

---

## نموذج الغاز

تستخدم QoreChain نموذج **رسوم أساسية ديناميكية وفق EIP-1559** لمعاملات EVM:

* تُضبط الرسوم الأساسية لكل كتلة بناءً على مستوى الاستخدام
* يمكن للمستخدمين ضبط `maxFeePerGas` و`maxPriorityFeePerGas`
* تذهب رسوم الأولوية إلى مقترح الكتلة

### جسر الفئات العددية

يمتلك رمز QOR الأصلي **6 خانات عشرية** (`uqor`)، بينما يتوقّع EVM **18 خانة عشرية**. تتولّى وحدة `x/precisebank` عملية التحويل السلسة:

| السياق          | الفئة العددية | الخانات العشرية | مثال                    |
| ---------------- | -------------- | ---------------- | ------------------------ |
| السلسلة الأصلية  | `uqor`         | 6                | `1000000 uqor = 1 QOR`  |
| EVM              | wei            | 18               | `1e18 wei = 1 QOR`      |

هذا التحويل شفاف — فعندما تتحقّق من رصيد عبر `eth_getBalance`، تكون الاستجابة مقوّمة بوحدة wei ذات 18 خانة عشرية. وعندما يُستعلم عن الحساب نفسه عبر وحدة البنك الأصلية، يظهر الرصيد بوحدة `uqor` ذات 6 خانات عشرية.

---

## أزواج رموز ERC-20

توفّر وحدة `x/erc20` تسجيلًا تلقائيًا لـ **أزواج الرموز** بين الفئات العددية الأصلية في Cosmos SDK وعقود ERC-20:

* يمكن استخدام الرموز الأصلية داخل عقود EVM كرموز ERC-20
* يمكن تحويل رموز ERC-20 المنشورة على EVM إلى فئات عددية أصلية
* التحويل ثنائي الاتجاه ويُدار على مستوى البروتوكول

```bash
# Register a new token pair (governance proposal)
qorechaind tx erc20 register-coin <denom> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey
```

---

## توافق PQC وEVM

تستخدم معاملات EVM توقيعات **ECDSA الكلاسيكية (secp256k1)** لضمان التوافق الكامل مع أدوات ومحافظ ومكتبات Ethereum الحالية. وهذا يضمن عمل MetaMask وHardhat وFoundry وethers.js وجميع أدوات EVM القياسية دون أي تعديل.

للأمان ما بعد الكمومي داخل EVM:

* استخدم **العقد المُجمَّع المسبقًا PQC Verify** (`0x0000...0A01`) للتحقق من توقيعات ML-DSA-87 على السلسلة من Solidity. راجع [عقود EVM المُجمَّعة مسبقًا](/developer-guide/evm-precompiles).
* يمكن توقيع **رسائل عبر الآلات الافتراضية (Cross-VM)** من EVM إلى CosmWasm أو SVM باستخدام PQC على مستوى معاملة Cosmos SDK.
* يمكن للحسابات تسجيل مفاتيح PQC العامة اختياريًا عبر `x/pqc` لتحقيق أمان هجين.

---

## مساحة `qor_` المخصّصة {#custom-qor_-namespace}

توسّع QoreChain واجهة JSON-RPC بمساحة `qor_` للاستعلامات الخاصة بالسلسلة:

| الطريقة                      | الوصف                                                              |
| ----------------------------- | ------------------------------------------------------------------- |
| `qor_getPQCKeyStatus`         | التحقق مما إذا كان الحساب يمتلك مفتاح PQC عامًا مسجّلًا             |
| `qor_getAIStats`              | استرجاع إحصاءات محرك الذكاء الاصطناعي (عدد الحالات الشاذة، توزيع المخاطر) |
| `qor_getCrossVMMessage`       | الاستعلام عن حالة رسالة عبر الآلات الافتراضية (Cross-VM) عبر المعرّف |
| `qor_getPoolClassification`   | الحصول على تصنيف تجمّع المدقّقين (RPoS/DPoS/PoS)                     |
| `qor_getReputationScore`      | الاستعلام عن درجة سمعة أحد المدقّقين                                 |
| `qor_getAbstractAccount`      | استرجاع إعدادات الحساب المجرّد                                       |

مثال باستخدام `curl`:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPQCKeyStatus",
    "params": ["0xYourAddress"],
    "id": 1
  }'
```

---

## الخطوات التالية

* [عقود EVM المُجمَّعة مسبقًا](/developer-guide/evm-precompiles) — الوصول إلى ميزات PQC والذكاء الاصطناعي وCross-VM من Solidity
* [التشغيل البيني عبر الآلات الافتراضية](/developer-guide/cross-vm-interoperability) — استدعاء عقود CosmWasm وSVM من EVM
* [تجريد الحسابات](/developer-guide/account-abstraction) — حسابات قابلة للبرمجة بمفاتيح جلسة
