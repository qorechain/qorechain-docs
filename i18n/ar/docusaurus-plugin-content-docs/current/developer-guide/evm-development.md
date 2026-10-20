---
slug: /developer-guide/evm-development
title: تطوير EVM
sidebar_label: تطوير EVM
sidebar_position: 2
---

# تطوير EVM

تُشغّل QoreChain بيئة تنفيذ متوافقة بالكامل مع EVM على محرك QoreChain EVM Engine، مما يتيح لك نشر عقود Solidity الذكية والتفاعل معها باستخدام الأدوات المألوفة. تعرض وحدة EVM واجهة JSON-RPC على **المنفذ 8545** (وWebSocket على **8546**) تدعم سير عمل تطوير Ethereum القياسي.

:::note
تستهدف الأمثلة أدناه شبكة **`qorechain-vladi`** الرئيسية (معرّف سلسلة EVM **9801**)، العاملة منذ 7 يونيو 2026، والتي تشغّل إصدار العقدة **v3.2.3** (طُبّق عند الارتفاع 3,662,051 في 20 أكتوبر 2026). تنتقل الشبكة الرئيسية إلى إصدار العقدة **v3.2.4** عند الارتفاع 3,742,566 (مقترح الحوكمة 13). أما شبكة الاختبار **`qorechain-diana`** فتعمل بالإصدار v3.2.4 منذ الارتفاع 8,337,253 (19 أكتوبر 2026)؛ استخدم هناك معرّف سلسلة EVM **9800**. تستخدم الأمثلة البرمجية العنوان `http://localhost:8545` لعقدة تشغّلها بنفسك؛ ونقطة النهاية العامة للشبكة الرئيسية هي `https://evm.qore.host` ونقطة نهاية شبكة الاختبار هي `https://evm-testnet.qore.host`.
:::

:::caution تحتاج معاملة EVM إلى مفتاح PQC مسجَّل ونافذة تفويض مفتوحة
منذ ترقية v3.2.0 (الشبكة الرئيسية عند الارتفاع 2,981,742، وشبكة الاختبار عند الارتفاع 5,920,000) لا يقبل مسار EVM معاملة إلا من حساب لديه **(1) مفتاح ML-DSA-87 مسجَّل مقاوم للحوسبة الكمومية** و**(2) نافذة تفويض EVM مفتوحة** ما زال فيها متسع لها. أنت توقّع بالأدوات المعتادة (MetaMask وethers.js وHardhat وFoundry)، لكن من دون مفتاح مسجَّل ونافذة مفتوحة يُرفض `eth_sendRawTransaction` (النطاق `pqc`، الرموز 26 أو 27 أو 28). أما القراءات و`eth_call` وتقدير الغاز فلا تحتاج إلى أي منهما. راجع [نافذة تفويض EVM](#evm-window) أدناه والدليل التفصيلي خطوة بخطوة في [معاملتك الأولى](/getting-started/first-transaction#evm-window).

تنطبق قاعدتان أخريان على الشبكة الرئيسية منذ v3.2.2: **تُرفض المعاملات غير المحمية (ما قبل EIP-155)**، سواء في mempool العقدة أو أثناء تنفيذ الكتل، لذا وقّع مع معرّف سلسلة (وهذا ما تفعله كل محفظة ومكتبة حالية)؛ و**لا يمكن الاستيلاء على حسابات الوحدات (module accounts) عبر EVM**.
:::

---

## نقطة نهاية JSON-RPC

| الخاصية               | القيمة                                      |
| --------------------- | ------------------------------------------ |
| عنوان URL الافتراضي   | `http://localhost:8545`                    |
| عنوان URL لـ WebSocket | `ws://localhost:8546`                      |
| المساحات المدعومة     | `eth_`, `web3_`, `net_`, `txpool_`          |
| معرّف السلسلة (الشبكة الرئيسية) | `9801` (`qorechain-vladi`)       |
| معرّف السلسلة (شبكة الاختبار)   | `9800` (`qorechain-diana`)       |
| رمز العملة            | `QOR`                                      |

تُخدَّم القراءات الخاصة بـ QoreChain عبر REST (`api.qore.host`)؛ أما مساحة `qor_` في JSON-RPC الموصوفة [أدناه](#custom-qor_-namespace) فهي **غير مفعّلة** على نقاط النهاية العامة ولا في إعدادات العقدة الافتراضية. قائمة `api` الافتراضية لعقدة مُهيَّأة حديثاً (v3.2.3 وما بعده) هي `eth,net,web3`؛ أما `txpool` فاختياري التفعيل، لأنه ينشر المعاملات المعلّقة في العقدة.

ابتداءً من إصدار العقدة v3.2.4 (على شبكة الاختبار منذ 19 أكتوبر 2026؛ وعلى عقد الشبكة الرئيسية من الارتفاع 3,742,566) تضع العقدة حدودًا لخادم JSON-RPC الخاص بها: تُرفض أجسام الطلبات التي تتجاوز 256 KiB (HTTP 413)، ولا يُخدَّم أكثر من 256 طلبًا في آن واحد (HTTP 503 فيما يزيد على ذلك)، ويُرفض مرشِّح `eth_getLogs` أو `eth_newFilter` الذي يضم أكثر من 4 مواضع للمواضيع (topics)، أو 1000 بديل في موضع واحد، أو 1000 عنوان. هذه الحدود إعدادات محلية للعقدة في قسم `[json-rpc]` من `app.toml`؛ راجع [تشغيل عقدة](/developer-guide/running-a-node#exposing-endpoints-for-integration).

---

## إعداد المحفظة (MetaMask)

أضف QoreChain كشبكة مخصّصة في MetaMask:

| الحقل                  | قيمة الشبكة الرئيسية        | قيمة شبكة الاختبار      |
| ----------------------- | ---------------------------- | ------------------------ |
| اسم الشبكة              | QoreChain (qorechain-vladi)  | QoreChain Diana          |
| عنوان RPC               | `https://evm.qore.host`      | `https://evm-testnet.qore.host` |
| معرّف السلسلة           | `9801`                       | `9800`                   |
| رمز العملة              | `QOR`                        | `QOR`                    |
| عنوان مستكشف الكتل      | `https://explore.qore.network` | *(اختياري)* |

يتطلب الإرسال من MetaMask أيضاً مفتاح PQC مسجَّلاً و[نافذة تفويض EVM](#evm-window) مفتوحة على الحساب.

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

انشر عقداً (يحتاج الحساب الذي يجري النشر إلى مفتاح PQC مسجَّل و[نافذة تفويض](#evm-window) مفتوحة؛ ويُحتسب النشر معاملة EVM واحدة ضمن النافذة):

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

توفّر وحدة `x/erc20` **أزواج رموز** بين الفئات العددية الأصلية في Cosmos SDK وعقود ERC-20:

* يمكن استخدام الرموز الأصلية داخل عقود EVM كرموز ERC-20
* يمكن تحويل رموز ERC-20 المنشورة على EVM إلى فئات عددية أصلية
* التحويل ثنائي الاتجاه ويُدار على مستوى البروتوكول

```bash
# Register a native ERC-20 contract as a token pair (permissioned: `permissionless_registration` is false)
qorechaind tx erc20 register-erc20 <contract-addr> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey --gas 400000 --fees 40000uqor

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey --gas 400000 --fees 40000uqor
```

هذه معاملات في مسار Cosmos: وعلى الشبكات الفعلية تحتاج أيضاً إلى التوقيع المشترك الهجين المقاوم للحوسبة الكمومية (ابنِها باستخدام `--generate-only`، ثم `qorechaind tx pqc cosign`؛ راجع [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing)). تُسجَّل أزواج الرموز بموجب سياسة مقيَّدة بالأذونات ولا يوجد أي زوج منها على الشبكة الرئيسية حتى الآن.

---

## توافق PQC وEVM

تُوقَّع معاملات EVM باستخدام **ECDSA الكلاسيكي (secp256k1)**، ولذلك تبنيها وتوقّعها أدوات MetaMask وHardhat وFoundry وethers.js وغيرها من الأدوات القياسية دون أي تعديل. ما تغيّر في **v3.2.0** هو *القبول*: لا تُقبل المعاملة إلا إذا كان لدى مرسلها مفتاح ما بعد كمومي مسجَّل ونافذة تفويض سارية (القسم التالي). تسجيل المفتاح وفتح النافذة هما معاملتان في مسار Cosmos وتتطلبان التوقيع الهجين (ML-DSA-87 + secp256k1).

للأمان ما بعد الكمومي داخل العقود:

* ستتحقق **إضافة PQC Verify المدمجة** (`0x0000...0A01`) من توقيعات ML-DSA-87 على السلسلة من Solidity بمجرد تفعيلها؛ وهي **غير مفعّلة بعد** على الشبكة الرئيسية ولا على شبكة الاختبار. راجع [إضافات EVM المدمجة: حالة الشبكة](/developer-guide/evm-precompiles#network-status).
* **الرسائل عبر الآلات الافتراضية** من EVM إلى QoreChain Native أو SVM هي معاملات في مسار Cosmos وتحمل التوقيع الهجين كأي معاملة أخرى؛ راجع [التشغيل البيني عبر الآلات الافتراضية](/developer-guide/cross-vm-interoperability) لمعرفة توافرها الحالي.

---

## نافذة تفويض EVM {#evm-window}

لا يمكن للتوقيع ما بعد الكمومي أن يسافر *مع* معاملة Ethereum (فالمحافظ مثل MetaMask لا تستطيع إرفاق توقيع ثانٍ)، لذلك يسافر *قبلها*. يفتح الحساب نافذة محدودة بالرسالة `MsgOpenEVMWindow` في مسار Cosmos؛ ثم لا يقبل مسار EVM إلا المعاملات التي تغطيها نافذة سارية. المفتاح الكلاسيكي المسروق وحده لا يستطيع فتح نافذة، ولذلك لا يستطيع تحريك أكثر مما تسمح به نافذة مفتوحة أصلاً.

| الحد        | النطاق             | المعنى |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17,280         | المدة التي تبقى فيها النافذة مفتوحة، محسوبة بالكتل ابتداءً من الكتلة التي تفتحها |
| `max-txs`   | 1 – 1,000          | عدد معاملات EVM التي تقبلها |
| `max-value` | أكبر من 0، بوحدة `uqor` | إجمالي التدفق الخارج الذي تقبله: القيمة المحوَّلة **زائداً** أقصى رسوم قد تدفعها كل معاملة (حد الغاز × أقصى رسوم لكل وحدة غاز)، محوَّلاً إلى `uqor` ومقرَّباً إلى الأعلى |

أي حد ينفد أولاً يغلق النافذة. الحدود الثلاثة مطلوبة؛ وفتح نافذة جديدة يحل محل النافذة القائمة؛ والمعاملة التي تُقبل ثم تفشل تستهلك مع ذلك خانتها وميزانية قيمتها؛ ونشر العقود يُحتسب كأي معاملة أخرى. `blocks` عدد كتل وليس مدة زمنية: 17,280 كتلة تساوي نحو 15 ساعة على الشبكة الرئيسية (نحو 3.2 ثانية لكل كتلة) ونحو 5 ساعات على شبكة الاختبار (نحو 1.0 ثانية لكل كتلة).

**حد القيمة يحتسب QOR الأصلي فقط.** فتحويل الرموز أو الموافقة (approval) أو أي استدعاء عقد آخر قيمته صفر، لذا لا يُحتسب من `max-value` (بل أقصى رسومه فقط). ولتقييد هذه أيضاً، ضيّق **نطاق** النافذة (الشبكة الرئيسية v3.2.3 وما بعده):

| خيار النطاق (علامة CLI) | حقل الرسالة | ما تقبله النافذة |
| ----------------------- | ------------- | ---------------------- |
| `--native-only`         | `native_only` | تحويلات QOR الأصلي العادية فقط: بلا calldata، وبلا إنشاء عقود، وبلا مستلم يحمل شيفرة، وبلا تفويض EIP-7702 |
| `--allowed-targets 0xA,0xB` | `allowed_targets` | المعاملات التي يكون مستلمها أحد العناوين المدرجة (20 بايتاً) فقط؛ ويُرفض إنشاء العقود |

النافذة المفتوحة بلا نطاق تتصرف تماماً كما كانت من قبل. وتُرفض المعاملة الخارجة عن النطاق بالرمز 27 (تقول الرسالة إن النافذة "does not admit this transaction"). ويُبلغ كل من `GET /qorechain/pqc/v1/evm_window/{address}` و`qorechaind query pqc evm-window` عن `native_only` و`allowed_targets`، ويحملهما الحدث `pqc_evm_window_opened` عند ضبطهما.

**الخطوات** (الشرح الكامل في [معاملتك الأولى](/getting-started/first-transaction#evm-window)):

1. سجّل مفتاح ML-DSA-87 الخاص بك مرة واحدة (`tx pqc register-key-v2` أو `register-key`، مع `--gas 600000 --fees 60000uqor`؛ هذه المعاملة الواحدة معفاة من شرط التوقيع الهجين، ولذلك يستطيع الحساب الجديد أن يبدأ). راجع [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing#pqc-key-registration).
2. افتح نافذة. هي معاملة في مسار Cosmos، لذا أنتجها غير موقَّعة ووقّعها بالتوقيع المشترك بمفتاح ML-DSA الخاص بك (يقبل `max-value` الوحدة `uqor` أو `qor`؛ و`1000qor` تعني 1,000 QOR):

   ```bash
   qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi

   # the same window narrowed to plain QOR transfers (mainnet v3.2.3 and later):
   qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   ```

3. تحقق مما تبقّى: `qorechaind query pqc evm-window <address>` أو `GET /qorechain/pqc/v1/evm_window/{address}` (يجيب بـ `found: false` عند عدم وجود نافذة).
4. أرسل معاملات EVM كالمعتاد. فتح النافذة معاملة في مسار Cosmos وتزيد رقم تسلسل الحساب، وهو أيضاً nonce الخاص بـ EVM، ولذلك اقرأ الـ nonce **بعد** فتح النافذة ثم وقّع.

أغلق النافذة مبكراً باستخدام `qorechaind tx pqc close-evm-window` (بنمط `--generate-only` و`cosign` نفسه)، مثلاً إذا اشتبهت في انكشاف المفتاح الكلاسيكي: وكل ما كانت النافذة ما زالت تقبله يُرفض ابتداءً من الكتلة التالية.

### تفويضات EIP-7702 {#eip-7702}

لا يسري تفويض EIP-7702 لحسابك (معاملة من النوع 4) إلا بموافقة حسابك نفسه بمفتاح ما بعد الكم، منذ v3.2.2. سجّل الموافقة أولاً بالرسالة الموقَّعة هجيناً في مسار Cosmos `MsgAuthorizeEVMDelegation` (`qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>`)؛ وهي لمرة واحدة، وتنتهي بعد العدد المحدد من الكتل، ويُلغيها `close-evm-window`. والقيمة التي تغادر حساباً مفوَّضاً تُحتسب على نافذة **ذلك** الحساب نفسه، والمعاملة الفاشلة من النوع 4 تحتفظ بالتفويضات التي طبّقتها، ويزيل `qorechaind tx pqc clear-evm-delegation` أي تفويض. ويجيب التفويض المرفوض بالرموز من 60 إلى 63. اقرأ الموافقة عبر `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.

| الرفض (النطاق `pqc`) | المعنى |
| ------------------------- | ------- |
| الرمز 26 | لا توجد نافذة مفتوحة للمرسل، أو أن المرسل ليس لديه مفتاح PQC مسجَّل |
| الرمز 27 | النافذة منتهية الصلاحية أو مستنفدة (تُظهر الرسالة أي حد استُنفد)، أو أن المعاملة خارج نطاق النافذة |
| الرمز 28 | حدود نافذة غير صالحة عند فتحها، أو لا يوجد مفتاح مسجَّل عند تلك النقطة |

مع SDK لغة TypeScript (الإصدار 0.8.2 وما بعده): `openEvmWindowMsg` و`closeEvmWindowMsg` و`fetchEvmWindow({ rest, address })` و`classifyEvmWindowRejection(err)` (`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`). يضيف SDK 0.9.0 خيارات النطاق (`nativeOnly` و`allowedTargets`) إلى `openEvmWindowMsg` وبُناة موافقة EIP-7702 (`authorizeEvmDelegationMsg` و`clearEvmDelegationMsg` و`fetchEvmDelegationConsent`)؛ أما الإصدارات السابقة لـ 0.9.0 فتبني النافذة غير المقيّدة بنطاق فقط، لذا استخدم `qorechaind` لبقية ذلك (انظر [دليل EVM في SDK](/sdk/guides/evm#evm-window-scope)).

---

## مساحة `qor_` المخصّصة {#custom-qor_-namespace}

توسّع QoreChain واجهة JSON-RPC بمساحة `qor_` للاستعلامات الخاصة بالسلسلة:

:::warning غير مخدَّمة بعد
لا يوجد أي إصدار منشور من العقدة يخدّم مساحة `qor_` حتى الآن: فقائمة `rpc_modules` على نقاط النهاية العامة لا تضم إلا `eth` و`net` و`rpc` و`txpool` و`web3`، وكل طريقة أدناه تُرجع `-32601` (الطريقة غير موجودة) على الشبكة الرئيسية وشبكة الاختبار والعقد التي تشغّلها بنفسك بالإعدادات الافتراضية (`eth` و`net` و`web3`). راجع [مساحة `qor_`](/api-reference/json-rpc-qor_-namespace) لمعرفة الحالة وبدائل REST (مثلاً `GET /qorechain/pqc/v1/account/{address}` لحالة مفتاح PQC).
:::

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

* [إضافات EVM المدمجة](/developer-guide/evm-precompiles) — مرجع لواجهات الإضافات المدمجة المحجوزة (غير مفعّلة على الشبكات العامة بعد)
* [التشغيل البيني عبر الآلات الافتراضية](/developer-guide/cross-vm-interoperability) — الاستدعاءات عبر الآلات الافتراضية وتوافرها الحالي
* [تجريد الحسابات](/developer-guide/account-abstraction) — مصادقات المحافظ المرتبطة وقواعد الإنفاق (الوحدة معطّلة حالياً)
