---
slug: /developer-guide/evm-window-reference
title: مرجع نافذة تفويض EVM (v3.2.8)
sidebar_label: مرجع نافذة EVM
sidebar_position: 7
---

# مرجع نافذة تفويض EVM (v3.2.8)

تحمل معاملة Ethereum توقيع secp256k1 واحدًا ولا شيء غيره، فلا تستطيع حمل التوقيع ما بعد الكمومي (ML-DSA-87) الذي تطلبه QoreChain من كل معاملة أخرى. وتسدّ **نافذة تفويض EVM** هذه الفجوة. يفتح الحساب أولًا نافذة محدودة برسالة QoreChain Native **موقَّعة** بمفتاحه ما بعد الكمومي، ثم يقبل مسار EVM معاملات الحساب العادية من MetaMask أو ethers.js أو Hardhat أو Foundry طالما كانت النافذة تغطيها فقط. هذه الصفحة هي المرجع الكامل لسلوك النافذة في الإصدار **v3.2.8**.

:::note أين يعمل v3.2.8
تعمل شبكة الاختبار **`qorechain-diana`** بالإصدار **v3.2.8** منذ 12 نوفمبر 2026. أما الشبكة الرئيسية **`qorechain-vladi`** فلم تطبّقه بعد؛ وعليها تعمل النافذة كما هو موصوف في [تطوير EVM](/developer-guide/evm-development#evm-window)، من دون الخيارات والقواعد الموسومة "v3.2.8" أدناه. العقدة التي تعمل بإصدار أقدم من v3.2.8 ترفض رسالة نافذة تضبط القوائم الجديدة.
:::

## لماذا يهم هذا {#why}

- **المفتاح الكلاسيكي المسروق لا تتجاوز قيمته ما تسمح به نافذة مفتوحة.** تحدّ النافذة الزمن (بالكتل)، وعدد المعاملات، وكمية QOR التي يمكن أن تخرج، واختياريًا العقود التي يجوز للحساب لمسها.
- **يبقى المفتاح ما بعد الكمومي هو المتحكم.** فتح النافذة وتضييقها وإغلاقها كلها رسائل Native بتوقيع هجين. لا يستطيع المفتاح الكلاسيكي وحده فتح نافذة أبدًا.
- **يجعل v3.2.8 الإعدادات الافتراضية أشد صرامة.** طرق precompile القياسية ممنوعة افتراضيًا، والتوقيعات التي تتحقق منها عقود أخرى تحتاج إلى موافقة النافذة، وتغيير المفتاح ما بعد الكمومي يغلق النافذة.

الخلاصة المختصرة لإضافات v3.2.8 موجودة في [خيارات النافذة المضافة في v3.2.8](/developer-guide/evm-development#evm-window-v328)؛ ولا تكررها هذه الصفحة كاملة، بل تضيف الأمثلة ومرجع الحقول وجدول الأخطاء. وللخطوات التفصيلية لأول نافذة راجع [معاملتك الأولى](/getting-started/first-transaction#evm-window).

## الفتح والإغلاق والقراءة {#lifecycle}

| الإجراء | الرسالة | واجهة سطر الأوامر | REST |
| ------ | ------- | --- | ---- |
| فتح (يحلّ محل أي نافذة مفتوحة) | `/qorechain.pqc.v1.MsgOpenEVMWindow` | `qorechaind tx pqc open-evm-window [blocks] [max-txs] [max-value]` | لا يوجد (معاملة) |
| إغلاق فوري | `/qorechain.pqc.v1.MsgCloseEVMWindow` | `qorechaind tx pqc close-evm-window` | لا يوجد (معاملة) |
| قراءة | لا يوجد | `qorechaind q pqc evm-window <address>` | `GET /qorechain/pqc/v1/evm_window/{address}` |

الفتح والإغلاق معاملتان في مسار Native وتحتاجان إلى توقيع الحساب الهجين (الكلاسيكي مع ML-DSA-87)، ويجب أن يملك الحساب أصلًا مفتاحًا ما بعد كمومي مسجَّلًا ليفتح نافذة. كما أن إغلاق النافذة يسحب أي موافقة EIP-7702 معلّقة. والفتح **يقدّم nonce الحساب** (تسلسل Native هو nonce في EVM)، لذا افتح النافذة أولًا ثم اقرأ nonce في EVM بعدها.

### واجهة سطر الأوامر {#cli}

ابنِ المعاملة بـ `--generate-only`، ثم أضف التوقيع ما بعد الكمومي بـ `tx pqc cosign`. الملف التنفيذي الرسمي `qorechaind` فيه `gen-key` و`cosign`؛ أما بناء المجتمع فلا.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# Open: 7,200 blocks, 20 transactions, 100 QOR cap (value plus maximum fees)
qorechaind tx pqc open-evm-window 7200 20 100qor \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

من دون وسائط تستخدم الواجهة قيمًا افتراضية مناسبة لجلسة نشر: 3,600 كتلة و10 معاملات و25 QOR. وفيما يلي نافذة محصورة في عقد رمز واحد (استبدل العنوان بعنوانك):

```bash
qorechaind tx pqc open-evm-window 600 5 100qor \
  --allowed-targets 0x1111111111111111111111111111111111111111 \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

أغلق نافذة مبكرًا، مثلًا إذا ظننت أن المفتاح الكلاسيكي انكشف. كل ما كانت النافذة ما زالت تقبله يُرفض من الكتلة التالية:

```bash
qorechaind tx pqc close-evm-window \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 40000uqor --generate-only > close.json

qorechaind tx pqc cosign close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

اقرأ النافذة:

```bash
qorechaind q pqc evm-window <qor1-address> --node $QNODE
```

المطلوب أن ترى `live: true` مع `remaining_blocks` و`remaining_txs` و`remaining_value` (بوحدة uqor). مرجع الأوامر في [أوامر المعاملات](/cli-reference/transaction-commands#open-evm-window).

### REST {#rest}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

الحساب الذي لا نافذة له يجيب بـ HTTP 200 مع `found: false`، فالمسار آمن للاستطلاع الدوري. كل رقم سلسلة JSON نصية. قد تكون النافذة المخزَّنة منتهية أو مستنفدة: يخبرك `live` ما إذا كانت ما زالت تقبل معاملة أخرى بقيمة صفر على الأقل عند الارتفاع الحالي.

### TypeScript {#typescript}

مساعدات النافذة في `@qorechain/sdk` (راجع [دليل EVM في SDK](/sdk/guides/evm#evm-window-scope) لإعداد التوقيع). تقبل `openEvmWindowMsg` كل الحقول أدناه، وتبني `closeEvmWindowMsg` رسالة الإغلاق، وتقرأ `fetchEvmWindow` النافذة، وتشرح `classifyEvmWindowRejection` سبب الرفض.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
  closeEvmWindowMsg,
  fetchEvmWindow,
} from "@qorechain/sdk";

const REST = "https://api-testnet.qore.host";
const client = createClient({
  network: "testnet",
  endpoints: { rest: REST, rpc: "https://rpc-testnet.qore.host", evmRpc: "https://evm-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

// Open a window that may call one token contract (replace the address with your own).
await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "100000000",                 // uqor: value PLUS the maximum fee of each transaction
      allowedTargets: ["0x1111111111111111111111111111111111111111"], // your token contract
    }),
  ],
  "auto",
);

// Read it back (opens first, then read the nonce).
const w = await fetchEvmWindow({ rest: REST, address: account.address });
console.log(w.live, w.remainingBlocks, w.remainingTxs, w.remainingValue);

// Close it early.
await tx.signAndBroadcast([closeEvmWindowMsg(account.address)], "auto");
```

تفحص `openEvmWindowMsg` الحدود وصيغ القوائم قبل التوقيع بأي شيء، فيفشل الخطأ محليًا بدل أن يكلّف معاملة مرفوضة. وتصدّر `MAX_EVM_WINDOW_BLOCKS` و`MAX_EVM_WINDOW_TXS` الحدود. تعيد القراءة (`fetchEvmWindow`) الحدود والعدّادات ونطاق v3.2.3 (`nativeOnly` و`allowedTargets`)؛ أما `validators` (عناوين العقود) و`stakingValidators` (`qorvaloper1...`) و`ibcReceivers` (`"<channel>/<receiver>"`) فيقبلها الباني منذ SDK 0.14.0 الذي يحمل قوائم v3.2.8؛ ولا تعيدها القراءة، ولا يعيدها كذلك مسار REST للنافذة في v3.2.8، فاحتفظ بالقيم التي فتحت بها النافذة. اضبط القوائم الثلاث فقط لشبكة تشغّل v3.2.8: فالعقدة الأقدم ترفض رسالة نافذة تضبطها. ومع `connectTx` الموقِّع هجينًا يجب أن يكون المفتاح ما بعد الكمومي مسجَّلًا أصلًا.

### جُرِّب على شبكة الاختبار {#tested}

أُجري على `qorechain-diana` في 12 نوفمبر 2026 (الإصدار v3.2.8) بحساب eth-native كان قد سجّل مفتاحه ما بعد الكمومي، باستخدام SDK 0.13.0 (`openEvmWindowMsg` و`closeEvmWindowMsg` و`fetchEvmWindow`) وتوقيع هجين. حقول النافذة `validators` و`staking_validators` و`ibc_receivers` لم تكن في بُناة SDK 0.13.0؛ ويضيفها SDK 0.14.0 إلى `openEvmWindowMsg`، ولم يستخدمها هذا التشغيل (استخدم سطر الأوامر لها مع SDK 0.13.0).

| الخطوة | النتيجة |
| ---- | ------ |
| `GET /qorechain/pqc/v1/evm_window/{address}` قبل الفتح | `found: false`، `live: false` |
| فتح: 300 كتلة، 5 معاملات، 1,000,000 uqor | الرمز 0، الغاز المستخدم 187,282. القراءة بعدها: `found: true`، `live: true`، `opened_height` 9942089، `expiry_height` 9942389، `max_txs` 5، `max_value` 1000000، `remaining_blocks` 297، `native_only: false`، `allowed_targets: []` |
| فتح مجددًا مع `nativeOnly: true` | الرمز 0، الغاز المستخدم 187,803. حلّت النافذة الجديدة محل القديمة: `native_only: true` و`opened_height` جديد |
| إغلاق | الرمز 0، الغاز المستخدم 170,468. القراءة بعدها: `found: false` |

مع SDK 0.14.0 في اليوم نفسه، نجح فتح نافذة بالحقول `allowedTargets` (عنوان هدف مسموح واحد) و`stakingValidators` (عنوان مشغّل مدقّق واحد) و`ibcReceivers` (زوج `channel-0/...` واحد) بالرمز 0 والغاز المستخدم 195,233. وسردت قراءة REST الحقل `allowed_targets` وأعادت `found: true` و`live: true`؛ ولا تعيد قوائم `validators` و`staking_validators` و`ibc_receivers`، فاحتفظ بالقيم التي فتحت بها النافذة.

أعادت `fetchEvmWindow` الحقول نفسها بصيغة camel case (`openedHeight` و`remainingBlocks` و`nativeOnly` و`allowedTargets`). الفتح والإغلاق معاملتا Cosmos بتوقيع هجين، فأول معاملة يرسلها الحساب تحتاج إلى تسجيل مفتاحه أولًا.

### Python وGo وRust وJava {#other-languages}

لكل SDK باني للرسالة وقراءة عبر REST. وكلها تفحص حدود السلسلة محليًا. وباني اللغة الذي يضبط قوائم v3.2.8 يحتاج SDK 0.14.0 أو أحدث (Java: الإصدار 0.14.0 على Maven Central)؛ أما الإصدارات الأقدم فتبني الحقول الأقدم فقط.

| اللغة | الفتح (مع كل القوائم) | الإغلاق | القراءة | حدود EVM |
| -------- | ---------------------- | ----- | ---- | ---------- |
| Python | `msg.pqc.open_evm_window(sender=, blocks=, max_txs=, max_value=, native_only=, allowed_targets=, validators=, staking_validators=, ibc_receivers=)` | `msg.pqc.close_evm_window(sender=)` | `get_evm_window(rest, address)` | `fetch_evm_limits(rest)` |
| Go | `messages.NewOpenEVMWindowWithScope(sender, blocks, maxTxs, maxValue, scope)` مع `messages.EVMWindowScope` | `messages.NewCloseEVMWindow(sender)` | `rest.GetEVMWindowStatus(address)` | `rest.GetEVMLimits()` |
| Rust | `msg::pqc::open_evm_window_with_scope_any(sender, blocks, max_txs, max_value, &scope)` مع `EvmWindowScope` | `msg::pqc::close_evm_window_any(sender)` | `get_evm_window(&rest, address)` | لا مساعد بعد؛ اقرأ مسار REST |
| Java | `EvmWindow.openWithPolicy(sender, blocks, maxTxs, maxValue, nativeOnly, allowedTargets, validators, stakingValidators, ibcReceivers)` | `EvmWindow.close(sender)` | `rest.evmWindow(address)` | `rest.evmLimits()` |

Python:

```python
from qorsdk import RestClient, get_network, get_evm_window, msg

sender = "qor1..."
open_msg = msg.pqc.open_evm_window(
    sender=sender,
    blocks=7200,
    max_txs=20,
    max_value="100000000",  # uqor, integer string
    allowed_targets=["0x1111111111111111111111111111111111111111"],  # your token contract
)
# broadcast it through the usual hybrid path, then:
rest = RestClient(get_network("testnet").endpoints.rest)
status = get_evm_window(rest, sender)
print(status.live, status.remaining_blocks, status.remaining_txs, status.remaining_value)
close_msg = msg.pqc.close_evm_window(sender=sender)
```

Go:

```go
open, err := messages.NewOpenEVMWindowWithScope(sender, 7200, 20, "100000000",
    messages.EVMWindowScope{
        AllowedTargets: []string{"0x1111111111111111111111111111111111111111"}, // your token contract
    })
status, err := rest.GetEVMWindowStatus(sender)
closeMsg, err := messages.NewCloseEVMWindow(sender)
```

Rust:

```rust
use qorechain::evm_window::{get_evm_window, EvmWindowScope};
use qorechain::msg;

let scope = EvmWindowScope {
    allowed_targets: vec!["0x1111111111111111111111111111111111111111".into()], // your token contract
    ..Default::default()
};
let open = msg::pqc::open_evm_window_with_scope_any("qor1...", 7200, 20, "100000000", &scope)?;
let status = get_evm_window(&rest, "qor1...").await?;
let close = msg::pqc::close_evm_window_any("qor1...");
```

Java:

```java
TypedMessage open = EvmWindow.openWithPolicy(sender, 7200, 20, "100000000",
    false,
    List.of("0x1111111111111111111111111111111111111111"), // allowedTargets: your token contract
    null,                                                   // validators
    null,                                                   // stakingValidators
    null);                                                  // ibcReceivers
EvmWindowStatus status = rest.evmWindow(sender);
TypedMessage close = EvmWindow.close(sender);
```

لا تفتح أي SDK نافذة نيابةً عنك. فالنافذة تفوّض الإنفاق، لذا تبقى الخطوة صريحة ومرئية للمستخدم.

## الحقول {#fields}

| الحقل (راية CLI) | الحد | المعنى |
| ---------------- | ----- | ------- |
| `blocks` (الوسيط الأول) | من 1 إلى 17,280 | لا تقبل النافذة شيئًا بعد ارتفاع الفتح مضافًا إليه `blocks`. هذا عدد كتل لا مدة زمنية: نحو 5 ساعات على شبكة الاختبار ونحو 15 ساعة على الشبكة الرئيسية بأزمنة الكتل الحالية |
| `max_txs` (الوسيط الثاني) | من 1 إلى 1,000 | عدد معاملات EVM التي تقبلها |
| `max_value` (الوسيط الثالث) | موجب | إجمالي uqor الذي تسمح النافذة بخروجه من الحساب: القيمة المحوَّلة **مضافًا إليها** أقصى رسم (حد الغاز × سقف الرسم) لكل معاملة مقبولة |
| `native_only` (`--native-only`) | true أو false | تقبل تحويلات QOR العادية فقط: بلا calldata، وبلا إنشاء عقد، وبلا مستلم يحمل شيفرة، وبلا تفويض EIP-7702 |
| `allowed_targets` (`--allowed-targets`) | 16 عنوان `0x` كحد أقصى، بلا تكرار | لا تقبل إلا المعاملات الموجّهة إلى هذه العناوين؛ ويُرفض إنشاء العقود |
| `validators` (`--validators`) | 16 عنوان `0x` كحد أقصى، بلا تكرار | عقود يُعتدّ بتحقّقها من توقيع الحساب لإجراءات الحساب نفسه: وحدة تحقق (validator module) تستدعيها محفظة عقد، أو نقطة دخول ERC-4337. v3.2.8 |
| `staking_validators` (`--staking-validators`) | 16 عنوان `qorvaloper...` كحد أقصى، بلا تكرار | المدققون الذين يجوز للحساب التفويض أو إعادة التفويض إليهم عبر النافذة. v3.2.8 |
| `ibc_receivers` (`--ibc-receivers`) | 16 مدخلًا كحد أقصى بصيغة `<channel>/<receiver>`، وبحد أقصى 256 حرفًا لكل مدخل، بلا مسافات أو فواصل | الوجهات الدقيقة التي يجوز لتحويل IBC بـ QOR الأصلي أن يذهب إليها. تُقارن بايتًا ببايت، فاكتب `channel-0` والمستلم بصيغة bech32 بحروف صغيرة تمامًا كما يحملهما التحويل. v3.2.8 |

يجب إعطاء كل حد: فالسلسلة ترفض الحد المفقود ولا تفترض له قيمة (وتملأ الواجهة قيم جلسة النشر الافتراضية بنفسها). وانتهاء أي حد ينهي النافذة عمليًا. تعمل النافذة فقط طالما كان المفتاح ما بعد الكمومي للحساب صالحًا للاستخدام، أي ليس فارغًا ولا كلاسيكيًا فقط ولا معطّلًا بقرار الحوكمة.

### ما الذي تحتسبه النافذة {#counting}

عند القبول، وقبل تنفيذ المعاملة، تستهلك كل معاملة EVM واحدة من `max_txs` وتضيف إلى القيمة المستخدمة قيمتها المحوَّلة مضافًا إليها أقصى رسم لها، محوَّلةً من وحدة EVM ذات 18 خانة عشرية إلى uqor ومقرَّبة إلى الأعلى. والمعاملة التي قُبلت ثم أُعيدت (revert) استهلكت نصيبها مع ذلك. وبعد التنفيذ، يُحتسب على النافذة أيضًا QOR الأصلي الذي حرّكه precompile نيابةً عن الحساب (تفويض، أو إيداع، أو تحويل IBC)، فيُحسب من `max_value` رغم أن قيمة المعاملة كانت صفرًا.

لا يُحتسب: `eth_call` و`eth_estimateGas` والمحاكاة. ولا تُسعَّر الرموز المميزة (tokens) إطلاقًا: فتحويل ERC-20 أو الموافقة عليه قيمته صفر، فقيّده بنطاق (`allowed_targets`). يُصدر كل احتساب حدث `pqc_evm_window_used` بالسمات `address` و`evm_address` و`window_open_height` و`used_txs` و`used_value` و`tx_value` و`source` (القيمة `ante` للقبول و`settlement` للاحتساب بعد التنفيذ)، فتستطيع المحفظة أن تُظهر ما استهلكته المعاملة. ويُصدر الفتح والإغلاق الحدثين `pqc_evm_window_opened` و`pqc_evm_window_closed`.

## Precompile القياسية عبر النافذة {#precompile-allowlist}

بالنسبة إلى حساب تفوّضه نافذة، تُرفض أي طريقة في precompile قياسي (التخزين/staking، والتوزيع/distribution، وICS-20، والحوكمة/gov، والمعاقبة/slashing، وprecompile رموز ERC-20) ما لم تكن في الجدول وتُدرج النافذة ذلك الـ precompile في `allowed_targets`. عناوين precompile في [EVM Precompiles](/developer-guide/evm-precompiles)؛ وعناوين staking وdistribution وICS-20 وgov هي `0x...0800` و`0x...0801` و`0x...0802` و`0x...0805`.

| Precompile | الطريقة | تُقبل حين |
| ---------- | ------ | ------------- |
| distribution | `claimRewards`، `withdrawDelegatorRewards` | تُدفع المكافآت إلى الحساب نفسه (عنوان السحب الخاص به هو عنوانه) |
| distribution | `withdrawValidatorCommission` | المدقّق هو مدقّق الحساب نفسه ويدفع إلى الحساب نفسه |
| distribution | `depositValidatorRewardsPool` | المدقّق في `staking_validators` وكل العملات هي QOR الأصلي |
| staking | `delegate`، `redelegate` | المدقّق الوجهة في `staking_validators` |
| ICS-20 | `transfer` | QOR الأصلي، عبر المنفذ `transfer`، بلا مذكرة (memo)، إلى زوج في `ibc_receivers` |
| precompile رموز ERC-20 | `transfer`، `transferFrom`، `approve` | QOR الأصلي؛ ولا يُقبل رمز آخر إلا إذا أدرجت النافذة عنوانه |

إن precompile التخزين (`0x…0800`) وprecompile التوزيع (`0x…0801`)، شأنهما شأن بقية الـ precompiles القياسية في هذا الجدول، **غير مفعّلة حاليًا على شبكة الاختبار ولا على الشبكة الرئيسية**؛ ويمكن للحوكمة تفعيلها. والاستدعاء الموجَّه إلى عنوان precompile غير مفعّل يصل إلى عنوان لا يحوي شيفرة: ينجح ولا يفعل شيئًا ويستهلك الغاز مع ذلك. وتنطبق حقول النافذة `staking_validators` و`validators` و`ibc_receivers` متى فُعّل precompile. وللتخزين (staking) والمطالبة بالمكافآت، استخدم رسائل Cosmos الأصلية (QoreX، أو أوامر qorechaind الخاصة بالتخزين والتوزيع). وحين يكون precompile مفعّلًا تكون مقاديره بوحدة `uqor` (6 منازل عشرية) لا بوحدات EVM ذات 18 منزلة عشرية.

كل ما عدا ذلك يُرفض عبر النافذة مهما أدرجت: إلغاء التفويض، وإلغاء فك الارتباط (unbonding)، والتصويت وسائر إجراءات الحوكمة، وتغيير عنوان السحب، وإنشاء مدقّق أو تعديله، وإلغاء السجن (unjail)، وتمويل مجمع المجتمع. أرسلها كمعاملات Native موقَّعة توقيعًا ما بعد كمومي. إدراج ICS-20 من دون `ibc_receivers` لا يقبل أي تحويل، وإدراج precompile التخزين من دون `staking_validators` لا يقبل أي تفويض.

أمثلة على ما تُدرجه:

| الهدف | النافذة |
| ---- | ------ |
| التخزين والمطالبة بالمكافآت وإلغاء التفويض والتصويت | استخدم رسائل Cosmos الأصلية (QoreX Stake وClaim، أو أوامر qorechaind tx staking / distribution)؛ ولا تستخدم نافذة EVM لهذه الإجراءات |
| تحويل QOR إلى الخارج عبر الجسر | `allowed_targets` مع precompile ICS-20، إضافةً إلى `ibc_receivers` مثل `channel-0/<receiver>` |
| نقل رمز IBC محتفَظ به كـ precompile ERC-20 | `allowed_targets` مع عنوان ذلك الرمز |

إدراج عقد هو موافقة الحساب على ما يستطيع ذلك العقد فعله بأصوله: ففي خزنة (vault) أو موجِّه (router) أو رمز يحتفظ برموز الحساب، لا تحدّ النافذة أي الرموز تتحرك ولا إلى أين.

## إنشاء العقود {#contract-creation}

نشر عقد يحتاج إلى نافذة **غير محصورة**. النافذة التي فيها `native_only` أو `allowed_targets` ترفض إنشاء العقود. لجلسة نشر افتح نافذة عادية (القيم الافتراضية في الواجهة مناسبة لها)، وانشر، ثم أغلقها. وللجلسات اللاحقة افتح نافذة بـ `--allowed-targets <contract-address>` لحصرها في الاستدعاءات إلى العقد الذي نشرته. شرح النشر خطوة بخطوة مع Hardhat وFoundry في [تطوير EVM](/developer-guide/evm-development).

## Permits وأوامر EIP-712 وPermit2 {#permits}

يُتحقق من permit بصيغة EIP-2612 أو تحويل Permit2 أو أمر موقَّع أو معاملة وصفية (meta-transaction) بواسطة عقد يستخدم precompile باسم `ecrecover`. ابتداءً من v3.2.8 (على الشبكتين، متى طبّقته الشبكة)، وبالنسبة إلى حساب يملك مفتاحًا ما بعد كمومي صالحًا للاستخدام، ينجح هذا التحقق فقط طالما كانت نافذة الحساب **الحية** تقبل **العقد المتحقِّق**، وهو الرمز نفسه أو Permit2 نفسه لا الموجِّه الذي يمرّر الاستدعاء.

1. إذا كانت النافذة محصورة، فأدرج العقد المتحقِّق في `allowed_targets` (`native_only` لا يقبل أي توقيع كهذا).
2. افتح النافذة **قبل** أن يوقّع المستخدم. من دون نافذة حية يُعامَل التوقيع كأنه غير صالح ويرفضه العقد.
3. لا يُحتسب التوقيع نفسه على النافذة أبدًا، لأن التوقيع يصبح علنيًا متى استُخدم.
4. يبقى الـ permit أو الموافقة الممنوحة داخل نافذة بعد إغلاقها. راجع الموافقات وألغِها عند انتهاء الجلسة.

الحسابات التي لا سجل لها ما بعد كمومي، والمحفظة المفوَّضة التي تتحقق من توقيعها الخاص، وتوقيع المرسِل نفسه في نافذة غير محصورة، تُستعاد كما كانت. أما الاستعلامات وتقديرات الغاز فلا تتأثر.

## تغييرات المفتاح وموافقة EIP-7702 {#key-changes}

- **تدوير المفتاح ما بعد الكمومي أو ترحيله أو إعادة تسجيله يغلق النافذة** ويحذف أي موافقة EIP-7702. افتح النافذة من جديد بعد ذلك. خطّط لهذا في المحافظ الساخنة (hot wallets) وتكاملات البورصات.
- يجب أن تكون النافذة وموافقة EIP-7702 (`MsgAuthorizeEVMDelegation` و`MsgClearEVMDelegation`) ورسائل إدارة الحساب المجرَّد (abstract account) **رسالة الحساب الخاصة على المستوى الأعلى وبتوقيع هجين**. لا يمكن إرسالها عبر authz (`MsgExec`) ولا منحها لحساب آخر، ويُرفض منح أنواع الرسائل هذه. وقد أُزيلت منح الموافقة الموجودة من هذا النوع عند الترقية.
- حساب مفوَّض بـ EIP-7702 يتصرف داخل معاملة شخص آخر يحتاج إلى نافذة حية خاصة به لحظة تصرّف شيفرته. وبدونها يفشل ذلك الاستدعاء وحده ويرى العقد المستدعي الفشل، فلا يعود الدفع إلى حساب مفوَّض يجعل معاملة الدافع كلها تتراجع (revert).

تُسجَّل موافقة التفويض بـ `qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>` وتُقرأ بـ `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`؛ راجع [تفويضات EIP-7702](/developer-guide/evm-development#eip-7702).

## الحدود المعمول بها {#limits}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_limits
```

أجابت شبكة الاختبار في 12 نوفمبر 2026 بـ `tx_max_gas` تساوي **30000000** و`precompile_input_max_bytes` تساوي **16384**:

| الحد | القيمة | المعنى |
| ----- | ----- | ------- |
| `tx_max_gas` | 30,000,000 | أكبر قدر من الغاز يجوز لمعاملة EVM واحدة طلبه؛ وفوقه تُرفض المعاملة قبل تنفيذها. وتتشارك تشغيلات EVM التي تبدأها رسالة Native واحدة الميزانية نفسها |
| `precompile_input_max_bytes` | 16,384 | أكبر مدخل يقبله precompile ذو حالة (stateful) محروس |
| `blocks` في النافذة | 17,280 | أطول نافذة |
| `max_txs` في النافذة | 1,000 | أكثر عدد معاملات في نافذة واحدة |
| مدخلات القوائم | 16 لكل قائمة | `allowed_targets` و`validators` و`staking_validators` و`ibc_receivers` |

تحمل الاستجابة أيضًا كائن `limits` فيه القيم التي تضبطها الحوكمة؛ اقرأ `tx_max_gas` و`precompile_input_max_bytes` في المستوى الأعلى، فهما القيمتان المعمول بهما. يُخدَّم المسار ابتداءً من v3.2.8، فتجيب الشبكة الرئيسية العامة بـ `501 Not Implemented` إلى أن تطبّق v3.2.8 (فُحص في 12 نوفمبر 2026، بعد انتقال الشبكة الرئيسية إلى v3.2.7).

النافذة المفتوحة بسعر غاز عادي ما زالت تحتسب أقصى رسم: فحد غاز قدره 30,000,000 بسقف رسم 100 gwei يحتسب 3 QOR من `max_value` لمعاملة واحدة.

## الأخطاء {#errors}

تعود الرفوض بمساحة الرمز (codespace) `pqc`. وعبر JSON-RPC الخاص بـ EVM يصل الرفض كخطأ بث يحمل الرسالة ولا يحمل codespace، فطابِق على النص أيضًا (وهذا ما تفعله مصنِّفات SDK).

| الرمز | الرسالة | السبب | ما تفعله |
| ---- | ------- | ----- | ---------- |
| 26 | `no open EVM authorisation window` | لا نافذة، أو لا مفتاح ما بعد كمومي مسجَّل، أو انتهت النافذة | سجّل مفتاحًا أولًا إن لم يوجد، ثم افتح نافذة |
| 27 | `EVM authorisation window exhausted` | استُنفد حد، أو المعاملة خارج نطاق النافذة (بما في ذلك precompile قياسي لا تدرجه النافذة، أو إنشاء عقد تحت نافذة محصورة) | افتح نافذة جديدة بحدود أكبر أو بالنطاق الذي تحتاجه |
| 28 | `invalid EVM authorisation window` | طلب فتح خارج الحدود، أو لا مفتاح صالحًا عند تلك النقطة | افحص `blocks` و`max_txs` و`max_value` والقوائم؛ وسجّل المفتاح أو أصلحه |
| 62 | `delegated account has no window covering this action` | تصرّف حساب مفوَّض، أو حرّك المرسِل أكثر مما تغطيه نافذته، من دون نافذة تغطي ذلك. وابتداءً من v3.2.8 تُفشل القاعدة نفسها الاستدعاء المخالف وحده | افتح للحساب نافذة تقبل الإجراء |
| revert | `<method> is disabled: the circuit breaker has tripped ...` | طريقة في precompile قياسي أُوقفت رسالة Native الموافقة لها | انتظر؛ لا شيء تغيّره في النافذة |
| revert | `<method>: account ... has no open EVM authorisation window that lists 0x...` | بلغ precompile ينقل قيمة عبر شيفرة، لحساب لا تدرجه نافذته | أضف الـ precompile إلى `allowed_targets` |
| nonce | `nonce too low` | وُقّعت معاملة EVM قبل فتح النافذة (الفتح يقدّم nonce) | أعد قراءة nonce ووقّع من جديد |
| معرّف السلسلة | `only replay-protected (EIP-155) Ethereum transactions are accepted` | معاملة وُقّعت بلا معرّف سلسلة | اضبط معرّف السلسلة في إعداد الشبكة بالأداة |

تعيد `classifyEvmWindowRejection(err)` في TypeScript SDK إحدى القيم `"no-pqc-key"` أو `"no-window"` أو `"exhausted"` أو `"invalid"`؛ ولدى الـ SDK الأخرى مصنِّف مكافئ (`describe_evm_window_error` في Python، و`tx.ClassifyEVMWindowError` في Go، و`classify_evm_window_error` في Rust، و`EvmWindowIssue.classify` في Java).

## ما لا تحكمه النافذة {#outside}

تحكم النافذة مسار EVM، أي المعاملات الموقَّعة بالمفتاح الكلاسيكي وحده. ولا يُحتسب عليها ما يلي، لأن كلًا منه يحمل توقيعه ما بعد الكمومي أو تبدؤه وحدة نيابةً عن حساب وقّع فعلًا:

- رسائل مسار Native التي يوقّعها الحساب بنفسه: تحويلات bank، والتخزين، والحوكمة، و`MsgCrossVMCall` إلى EVM الذي يعمل بعنوان `0x` الخاص بالموقِّع نفسه.
- تنفيذات الحساب المجرَّد المفوَّضة بمصادِقات (authenticators) الحساب.
- تحويلات ERC-20 واستدعاءات IBC المرتدة (callbacks) التي تشغّلها وحدات.

استدعاء cross-VM إلى EVM لم يرسله المرسِل بنفسه (مثلًا بمنحة authz) يعمل تحت نافذة المرسِل ويحتاج أن تقبل الوجهة. وجسر cross-VM عند `0x0901` يحتاج إلى نافذة تدرجه. راجع [التشغيل البيني عبر الأجهزة الافتراضية (Cross-VM)](/developer-guide/cross-vm-interoperability).

## مسار MetaMask وQoreX {#qorex-flow}

يوقّع MetaMask بمفتاح Ethereum، وهو مفتاح **حساب بنمط Ethereum (coin 60)**، ولا يستطيع MetaMask إنتاج رسالة Native. وQoreX هو المكان الذي يفتح فيه حساب كهذا نافذته؛ أما تحويلات QoreX نفسها فتستخدم مسار Native ولا تحتاج نافذة أبدًا.

1. في QoreX أضف حساب coin-60 لعبارة MetaMask الخاصة بك أو استعده (راجع [استعادة عبارة من MetaMask أو لوحة التحكم](/qorex/getting-started#restore-dashboard)). يحتاج الحساب إلى مفتاح ML-DSA-87 مسجَّل؛ وأول تحويل لك في QoreX يسجّله.
2. افتح بطاقة **نافذة وصول EVM** (في التطبيق: الإعدادات، الأمان، نافذة وصول EVM؛ وفي الإضافة: زر **نافذة وصول EVM** في النافذة المنبثقة) واختر عدد الكتل (حتى 17,280) وعدد المعاملات (حتى 1,000) وسقف الإنفاق بـ QOR. يغطي السقف كل مبلغ مضافًا إليه أقصى رسم له. القيم الافتراضية 300 كتلة و5 معاملات و1 QOR.
3. وافق على الرسالة ذات التوقيع الهجين. النافذة الجديدة تحلّ محل أي نافذة مفتوحة، والفتح يقدّم nonce الخاص بك، فلا ترسل من MetaMask إلا بعد ذلك؛ والمعاملة التي أُعدّت قبلها تُرفض برسالة "nonce too low".
4. أرسل من MetaMask على معرّف السلسلة 9800 (شبكة الاختبار) أو 9801 (الشبكة الرئيسية). وحين تنتهي استخدم **إغلاق النافذة**، وهو متاح فقط حين تكون نافذة حية.

تضبط بطاقة QoreX الحدود الثلاثة. ولا تقدّم شاشة لقوائم النطاق (`allowed_targets` و`validators` و`staking_validators` و`ibc_receivers` و`native_only`)، فالنافذة المحصورة تأتي من `qorechaind` أو من SDK. راجع [نافذة وصول EVM](/qorex/security-and-recovery#evm-window) للبطاقة وحالاتها الأربع.

## الصفحات ذات الصلة {#related}

- [تطوير EVM](/developer-guide/evm-development): بيئة التشغيل وحدود الغاز و[خيارات نافذة v3.2.8](/developer-guide/evm-development#evm-window-v328)
- [EVM Precompiles](/developer-guide/evm-precompiles)
- [التشغيل البيني عبر الأجهزة الافتراضية (Cross-VM)](/developer-guide/cross-vm-interoperability)
- [التوقيع ما بعد الكمومي](/developer-guide/post-quantum-signing)
- [دليل EVM في SDK](/sdk/guides/evm#evm-window-scope)
- [أوامر المعاملات](/cli-reference/transaction-commands#open-evm-window) و[أوامر الاستعلام](/cli-reference/query-commands)
- [نقاط نهاية REST وgRPC](/api-reference/rest-grpc-endpoints)
- [معاملتك الأولى](/getting-started/first-transaction#evm-window)
- [QoreX: نافذة وصول EVM](/qorex/security-and-recovery#evm-window)
