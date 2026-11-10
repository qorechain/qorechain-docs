---
slug: /getting-started/deploy-in-5-minutes
title: النشر على QoreChain في 5 دقائق
sidebar_label: النشر في 5 دقائق
sidebar_position: 6
---

# النشر على QoreChain في 5 دقائق

هذه الصفحة موجّهة لمطوّر Solidity لم يستخدم QoreChain من قبل. تحتفظ بـ Foundry أو Hardhat وعبارة الاسترداد نفسها التي تستخدمها مع MetaMask. الشيء الجديد الوحيد هو **نافذة تفويض** قصيرة: تحمي QoreChain كل حساب بمفتاح ما بعد كمومي، ولا تستطيع معاملة إيثريوم أن تحمل مفتاحًا كهذا، لذلك تفتح أولًا نافذة محدودة وتُقبل معاملات EVM العادية الخاصة بك ما دامت النافذة مفتوحة. تستخدم الخطوات أدناه **شبكة الاختبار** (`qorechain-diana`، معرّف سلسلة EVM 9800) حيث لا يكلّف شيء مالًا حقيقيًا.

:::note
جُرّب هذا المسار على شبكة الاختبار: فُتحت نافذة في QoreX، ثم أُنشئ عقد واستُدعي باستخدام `cast` من Foundry انطلاقًا من عبارة الاسترداد نفسها. يرسل `forge create` و Hardhat نوع المعاملة نفسه من معاملات EVM، لكنهما لم يكونا جزءًا من تلك التجربة. كما أن فتح نافذة من سطر أوامر `qorechaind` مؤكَّد أيضًا؛ راجع [بديل: سطر الأوامر](#cli).
:::

## ما الذي تحتاج إليه {#what-you-need}

- عبارة الاسترداد للحساب الذي تريد النشر منه. لا يستطيع QoreX استيراد مفتاح خاص خام. إذا كان لديك مفتاح خاص فقط، فاستخدم [سطر الأوامر](#cli) بدلًا من ذلك.
- [QoreX](/qorex/overview)، محفظة QoreChain (التطبيق أو إضافة المتصفح).
- تثبيت Foundry أو Hardhat مسبقًا.

## 1. أضف حساب coin-60 إلى QoreX {#step-import}

لا يعمل مسار EVM إلا بمفتاح `eth_secp256k1` (نوع العملة 60). أما مفتاح Cosmos القياسي من نوع secp256k1 (نوع العملة 118، وهو الافتراضي في QoreX) فلا يستطيع التوقيع لعنوان EVM الخاص به، ولذلك تكون أي نافذة تُفتح على حساب coin-118 عديمة الفائدة مع أدوات EVM. تحتاج إلى **حساب إيثريوم (العملة 60)**. في QoreX افتح **حساباتك** واضغط على **إضافة حساب إيثريوم (العملة 60)**. يشتقه QoreX من **عبارة الاسترداد الخاصة بالمحفظة نفسها** بمسار إيثريوم `m/44'/60'`. عنوانه `0x…` هو نفسه في MetaMask أو Foundry فقط عندما تستخدمان العبارة نفسها (في Foundry، مسار الاشتقاق `m/44'/60'/0'/0/0`، الفهرس 0). إذا كان حساب MetaMask الخاص بك مشتقًا من عبارة مختلفة، يعرض QoreX عنوانًا مختلفًا، ولا تغطي النافذة المفتوحة هناك المفتاح الذي تنشر به. عنوان `0x…` هو المفتاح نفسه لعنوان `qor1…` على QoreChain.

للحساب عنوانه الخاص، لذا موّله وحدّده في QoreX قبل الخطوات التالية. راجع [استعادة عبارة من MetaMask أو لوحة التحكم](/qorex/getting-started#restore-dashboard).

:::caution لا تلصق عبارة حساب فعلي في أدوات التطوير
استخدم عبارة استرداد أُنشئت للاختبار، مع QOR للاختبار فقط. لا تكتب عبارة حساب يحتوي على أموال حقيقية في Foundry أو Hardhat أو أي سكربت.
:::

## 2. حوّل QoreX إلى شبكة الاختبار {#step-testnet}

- **التطبيق:** الإعدادات ← **استخدام شبكة الاختبار (للمطورين)**.
- **إضافة المتصفح:** افتح قفلها، واضغط على رقم الإصدار في الأسفل سبع مرات، ثم اختر **التحويل إلى شبكة الاختبار (diana)**.

تتغير شارة الشبكة في الرئيسية إلى TESTNET.

## 3. احصل على QOR لشبكة الاختبار {#step-faucet}

اطلب QOR لشبكة الاختبار لعنوانك `0x…` أو `qor1…` من [صنبور لوحة التحكم](/dashboard/faucet). الرصيد نفسه في الصيغتين لعنوان واحد.

## 4. افتح نافذة EVM في QoreX {#step-window}

- **الإضافة والتطبيق:** البطاقة المعنونة **MetaMask على QoreChain** (وعليها علامة **0x**) في النافذة المنبثقة الرئيسية أو في الرئيسية. تفتح شاشة **نافذة وصول EVM**.
- **التطبيق:** وأيضًا الإعدادات ← الأمان ← **نافذة وصول EVM**.

إذا لم يكن لهذا الحساب مفتاح ما بعد كمومي بعد، يسجّله QoreX لك في هذه الخطوة. يكلّف التسجيل 0.09 QOR، مرة واحدة لكل حساب، وتدفع معاملة النافذة رسوم الشبكة الخاصة بها فوق ذلك. ثم تختار ثلاثة حدود:

| الحقل | النطاق | الافتراضي في QoreX |
|---|---|---|
| الكتل (المدة التي تبقى فيها النافذة مفتوحة) | 1 إلى 17,280 | 300 |
| الحد الأقصى للمعاملات | 1 إلى 1,000 | 5 |
| سقف الإنفاق، بوحدة QOR | أكبر من 0 | 1 |

يحتسب سقف الإنفاق قيمة كل معاملة **زائد حدها الأقصى للرسوم** (حد الغاز مضروبًا في سقف الرسوم)، وليس فقط ما تحوّله. نشر العقد لا ينقل أي QOR لكنه يُحتسب بحدّه الأقصى للرسوم: فنشر بحد غاز 3,000,000 يرسله Hardhat يُحتسب بنحو 0.64 QOR.

القيم الافتراضية صغيرة جدًا لجلسة نشر. اختيار معقول هو 3,000 كتلة (نحو ساعة على شبكة الاختبار) و20 معاملة وسقف قدره 10 QOR. أبقِها بأصغر قدر تسمح به جلستك، وأغلق النافذة عند الانتهاء.

:::caution افتح النافذة أولًا
يزيد فتح النافذة قيمة nonce للحساب. افتحها **قبل** أن تنشر: فالمعاملة الموقَّعة قبل ذلك تُرفض بالرسالة "nonce too low".
:::

## 5. انشر باستخدام Foundry أو Hardhat {#step-deploy}

استخدم مفتاح **حساب coin-60 الممول نفسه**. لا يستطيع QoreX العمل كموقِّع لـ Foundry، لذا زوّد Foundry أو Hardhat بالمفتاح المشتق من عبارة الاسترداد نفسها، مثلًا `--mnemonic` مع الفهرس 0 في Foundry. إعدادات الشبكة:

| الإعداد | القيمة |
|---|---|
| عنوان RPC | `https://evm-testnet.qore.host` |
| معرّف السلسلة | `9800` |
| العملة | QOR، 18 خانة عشرية |

**Foundry**

```bash
export ETH_RPC_URL=https://evm-testnet.qore.host

forge create src/Counter.sol:Counter --private-key $DEPLOYER_KEY --broadcast
cast send <contract> "increment()" --private-key $DEPLOYER_KEY
cast call <contract> "number()(uint256)"
```

**Hardhat**

```js
// hardhat.config.js
module.exports = {
  solidity: "0.8.24",
  networks: {
    diana: {
      url: "https://evm-testnet.qore.host",
      chainId: 9800,
      accounts: [process.env.DEPLOYER_KEY],
    },
  },
};
```

```bash
DEPLOYER_KEY=0x... npx hardhat run scripts/deploy.js --network diana
```

كل معاملة ترسلها (نشرًا كانت أو استدعاءً) تستهلك واحدة من معاملات النافذة. أما القراءات (`cast call` ودوال العرض وتقدير الغاز) فلا تحتاج إلى نافذة ولا تستهلك منها شيئًا.

## تحقق من النافذة وتعامل مع انتهائها {#check-and-expiry}

**تنتهي** النافذة: عندما تنفد كتلها أو معاملاتها أو سقف إنفاقها، يرفض مسار EVM معاملتك التالية بالرسالة `no open EVM authorisation window` أو `EVM authorisation window exhausted`. افتح نافذة جديدة في QoreX؛ فالنافذة الجديدة تحلّ محل القديمة.

لمعرفة حالتها، استخدم تبويب **حالة مفتاح PQ** في [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) (راجع [المطورون](/dashboard/developers))، أو مسار REST:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

القيمة `live: true` مع `remaining_blocks` و`remaining_txs` و`remaining_value` (بوحدة `uqor`) تعني أنها مفتوحة.

## بديل: سطر الأوامر {#cli}

باستخدام الملف الثنائي الرسمي `qorechaind` يمكنك استيراد مفتاح خاص خام وتسجيل مفتاحه ما بعد الكمومي وفتح النافذة دون QoreX. هذا هو المسار للمطوّر الذي لديه مفتاح خاص فقط. الأمران `gen-key` و`cosign` غير موجودين في بناء المجتمع، لذا يتطلب هذا الملف الثنائي الرسمي. قواعد النافذة موجودة في قسم [نافذة تفويض EVM](/developer-guide/evm-development#evm-window) من [تطوير EVM](/developer-guide/evm-development). فتح نافذة بهذه الطريقة، ثم إرسال معاملة بواسطة `cast`، مؤكَّد على شبكة الاختبار.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# import the private key as an eth_secp256k1 key: the qor1... and 0x... addresses are one account
qorechaind keys import-hex deployer <private-key-hex-without-0x> --key-type eth_secp256k1

# register a post-quantum key once per account (back up the .dilithium file)
qorechaind tx pqc gen-key deployer-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --pqc-key deployer-mldsa \
  --from deployer --chain-id $QCHAIN --node $QNODE --gas auto --gas-adjustment 1.3 --gas-prices 0.2uqor

# open the window


qorechaind tx pqc open-evm-window 3000 20 10qor --from deployer \
  --chain-id $QCHAIN --node $QNODE --gas 400000 --fees 80000uqor --generate-only > window.json
qorechaind tx pqc cosign window.json --from deployer --pqc-key deployer-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

لا تضيّق نافذة النشر بـ `--native-only` أو `--allowed-targets`: كلاهما يرفض إنشاء العقود. هما مخصصان لجلسات لاحقة، بعد أن يكون العقد موجودًا.

## ما الذي يختلف على شبكة الاختبار {#diana-notes}

- تقبل **CosmWasm** على شبكة الاختبار الأكواد المعتمدة بالحوكمة فقط، لذا لا يمكنك رفع عقدك الخاص هناك. Solidity هو المسار المفتوح.
- **SVM** غير متاحة.
- تعمل الشبكة الرئيسية بالطريقة نفسها بمعرّف السلسلة 9801 والعنوان `https://evm.qore.host`، لكن ابدأ على شبكة الاختبار.

## الأخطاء الشائعة {#errors}

| الرسالة | السبب | الحل |
|---|---|---|
| `account ... has no registered post-quantum key` | ليس للحساب مفتاح ML-DSA-87 | افتح نافذة في QoreX فيسجّله، أو سجّله من سطر الأوامر |
| `no open EVM authorisation window` | لا توجد نافذة، أو انتهت | افتح نافذة |
| `EVM authorisation window exhausted` | استُنفدت المعاملات أو سقف الإنفاق | افتح نافذة جديدة بحدود أكبر |
| `nonce too low` | فُتحت النافذة بعد أن وقّعت | افتح النافذة أولًا، ثم أرسل |
| `only replay-protected (EIP-155) Ethereum transactions are accepted` | معاملة موقَّعة دون معرّف سلسلة | اضبط `chainId` في إعدادات شبكتك |

التالي: [تطوير EVM](/developer-guide/evm-development)، [الأمان والاسترداد في QoreX](/qorex/security-and-recovery#evm-window)، [المطورون](/dashboard/developers).
