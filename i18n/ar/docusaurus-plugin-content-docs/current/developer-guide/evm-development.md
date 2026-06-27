---
slug: /developer-guide/evm-development
title: تطوير EVM
sidebar_label: تطوير EVM
sidebar_position: 2
---

# تطوير EVM

تُشغّل QoreChain بيئة تنفيذ متوافقة بالكامل مع EVM على محرك QoreChain EVM، ما يتيح لك نشر عقود Solidity الذكية والتفاعل معها باستخدام الأدوات المألوفة. تكشف وحدة EVM واجهة JSON-RPC على **المنفذ 8545** (WebSocket على **8546**) تدعم مسارات عمل تطوير Ethereum القياسية.

:::note
الأمثلة أدناه تستهدف الشبكة الرئيسية **`qorechain-vladi`** (معرّف سلسلة EVM **9801**)، وهي قيد التشغيل منذ 7 يونيو 2026 بإصدار السلسلة **v3.1.77**. لشبكة الاختبار **`qorechain-diana`**، استخدم معرّف سلسلة EVM **9800**.
:::

---

## نقطة نهاية JSON-RPC

| الخاصية              | القيمة                                     |
| -------------------- | ------------------------------------------ |
| عنوان URL الافتراضي  | `http://localhost:8545`                    |
| عنوان WebSocket      | `ws://localhost:8546`                      |
| مساحات الأسماء المدعومة | `eth_`, `web3_`, `net_`, `txpool_`, `qor_` |
| معرّف السلسلة (الشبكة الرئيسية) | `9801` (`qorechain-vladi`)         |
| معرّف السلسلة (شبكة الاختبار) | `9800` (`qorechain-diana`)             |
| رمز العملة           | `QOR`                                      |

توفّر مساحة الأسماء `qor_` طرقًا خاصة بـ QoreChain. راجع [مساحة الأسماء المخصصة](#custom-qor_-namespace) أدناه.

---

## إعداد المحفظة (MetaMask)

أضِف QoreChain كشبكة مخصصة في MetaMask:

| الحقل              | قيمة الشبكة الرئيسية       | قيمة شبكة الاختبار       |
| ------------------ | ------------------------- | ----------------------- |
| اسم الشبكة         | QoreChain (qorechain-vladi) | QoreChain Diana       |
| عنوان RPC          | `http://localhost:8545`   | `http://localhost:8545` |
| معرّف السلسلة      | `9801`                    | `9800`                  |
| رمز العملة         | `QOR`                     | `QOR`                   |
| عنوان مستكشف الكتل | *(استخدم مستكشف الشبكة الرئيسية الرسمي)* | *(اتركه فارغًا لشبكة الاختبار المحلية)* |

---

## Hardhat

ثبّت Hardhat وكوّن ملف `hardhat.config.js` الخاص بك:

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

انشر عقدًا:

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

شغّل الاختبارات على QoreChain EVM:

```bash
npx hardhat test --network qorechain
```

---

## Foundry

أنشئ عقدًا وانشره باستخدام Foundry:

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

تستخدم QoreChain نموذج **الرسوم الأساسية الديناميكية وفق EIP-1559** لمعاملات EVM:

* تتكيّف الرسوم الأساسية لكل كتلة بناءً على معدل الاستخدام
* يمكن للمستخدمين تعيين `maxFeePerGas` و `maxPriorityFeePerGas`
* تذهب رسوم الأولوية إلى مقترِح الكتلة

### جسر الفئات

يملك رمز QOR الأصلي **6 منازل عشرية** (`uqor`)، بينما يتوقّع EVM **18 منزلة عشرية**. تتولّى وحدة `x/precisebank` التحويل السلس:

| السياق       | الفئة         | المنازل العشرية | مثال                   |
| ------------ | ------------ | -------- | ---------------------- |
| السلسلة الأصلية | `uqor`       | 6        | `1000000 uqor = 1 QOR` |
| EVM          | wei          | 18       | `1e18 wei = 1 QOR`     |

هذا التحويل شفّاف — عندما تتحقق من رصيد عبر `eth_getBalance`، تكون الاستجابة بفئة wei ذات 18 منزلة عشرية. وعندما يُستعلم عن الحساب نفسه عبر وحدة البنك الأصلية، يظهر الرصيد بفئة `uqor` ذات 6 منازل عشرية.

---

## أزواج رموز ERC-20

توفّر وحدة `x/erc20` تسجيلًا تلقائيًا لـ **أزواج الرموز** بين الفئات الأصلية لـ Cosmos SDK وعقود ERC-20:

* يمكن استخدام الرموز الأصلية داخل عقود EVM كرموز ERC-20
* يمكن تحويل رموز ERC-20 المنشورة على EVM إلى فئات أصلية
* التحويل ثنائي الاتجاه ويُعالَج على مستوى البروتوكول

```bash
# Register a new token pair (governance proposal)
qorechaind tx erc20 register-coin <denom> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey
```

---

## توافق PQC و EVM

تستخدم معاملات EVM توقيعات **ECDSA الكلاسيكية (secp256k1)** لتوافق كامل مع أدوات Ethereum والمحافظ والمكتبات الموجودة. يضمن ذلك عمل MetaMask و Hardhat و Foundry و ethers.js وجميع أدوات EVM القياسية دون تعديل.

من أجل الأمان ما بعد الكمّي داخل EVM:

* استخدم **معالَج PQC Verify المسبق** (`0x0000...0A01`) للتحقق من توقيعات ML-DSA-87 على السلسلة من Solidity. راجع [معالِجات EVM المسبقة](/developer-guide/evm-precompiles).
* يمكن توقيع **الرسائل عبر الأجهزة الافتراضية** من EVM إلى CosmWasm أو SVM بـ PQC على طبقة معاملات Cosmos SDK.
* يمكن للحسابات اختياريًا تسجيل مفاتيح PQC العامة عبر `x/pqc` لأمان هجين.

---

## مساحة الأسماء المخصصة `qor_` {#custom-qor_-namespace}

توسّع QoreChain واجهة JSON-RPC بمساحة أسماء `qor_` للاستعلامات الخاصة بالسلسلة:

| الطريقة                      | الوصف                                                              |
| --------------------------- | ----------------------------------------------------------------- |
| `qor_getPQCKeyStatus`       | التحقق مما إذا كان للحساب مفتاح PQC عام مسجّل                       |
| `qor_getAIStats`            | استرجاع إحصائيات محرك الذكاء الاصطناعي (أعداد الشذوذ، توزيع المخاطر) |
| `qor_getCrossVMMessage`     | الاستعلام عن حالة رسالة عبر الأجهزة الافتراضية بواسطة المعرّف        |
| `qor_getPoolClassification` | الحصول على تصنيف مجمّع المدققين (RPoS/DPoS/PoS)                    |
| `qor_getReputationScore`    | الاستعلام عن درجة سمعة مدقق                                         |
| `qor_getAbstractAccount`    | استرجاع إعداد الحساب المجرّد                                        |

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

* [معالِجات EVM المسبقة](/developer-guide/evm-precompiles) — الوصول إلى ميزات PQC والذكاء الاصطناعي وما بين الأجهزة الافتراضية من Solidity
* [التشغيل البيني بين الأجهزة الافتراضية](/developer-guide/cross-vm-interoperability) — استدعاء عقود CosmWasm و SVM من EVM
* [تجريد الحساب](/developer-guide/account-abstraction) — حسابات قابلة للبرمجة بمفاتيح جلسة
