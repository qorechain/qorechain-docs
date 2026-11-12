---
slug: /developer-guide/cosmwasm-gas-and-limits
title: غاز CosmWasm والتسعير وحدود الرفع
sidebar_label: غاز CosmWasm والحدود
sidebar_position: 6
---

# غاز CosmWasm والتسعير وحدود الرفع

تُسعَّر عقود QoreChain Native (اسم QoreChain لبيئة تشغيل CosmWasm الخاصة بها) بحسب ما تكلفه على المدقّق (validator) لتشغيلها. ابتداءً من الإصدار **v3.2.8** يعتمد سعر استدعاء العقد على ثلاثة أمور: هل شيفرة العقد محمّلة أصلًا في الذاكرة للكتلة الحالية، ومدى انشغال الكتلة بأعمال العقود، وحجم الذاكرة التي يلمسها الاستدعاء. أما رفع الشيفرة فمحدود في الحجم والشكل.

:::note شبكة الاختبار أولًا
يعمل v3.2.8 على شبكة الاختبار **`qorechain-diana`** منذ 12 نوفمبر 2026. أما الشبكة الرئيسية (`qorechain-vladi`) فستطبّقه بترقية حوكمة لاحقة، لذا تصف الأرقام أدناه شبكة الاختبار اليوم والشبكة الرئيسية بعد تلك الترقية. تستخدم كل الأوامر `--chain-id qorechain-diana`؛ استبدلها بـ `qorechain-vladi` بعد ترقية الشبكة الرئيسية.
:::

## لماذا يهم هذا {#why}

- قد ينفد الغاز اليوم من استدعاء عقد كان يعمل أمس بحد غاز ثابت، لأن أول استدعاء لشيفرة ما في كتلة ما يكلّف أضعاف تكلفة الاستدعاء المكرَّر. الحد الثابت تخمين يفشل في أسوأ لحظة.
- تتبع الرسوم الحمل. حين تمتلئ الكتل باستدعاءات العقود يرتفع سعر تنفيذ العقود، ثم ينخفض حين لا تمتلئ.
- لكل كتلة قدر محدود من أعمال العقود. الاستدعاء الذي لا يتسع له ذلك القدر يفشل ويدفع رسمه كأي معاملة فاشلة.

القاعدة المختصرة: **قم بالمحاكاة، واضرب النتيجة في 1.3 على الأقل، ولا تثبّت قيمة الغاز يدويًا لاستدعاء عقد.**

## نموذج الغاز {#gas-model}

### تكلفة تحميل الشيفرة {#code-load}

قبل أن يعمل العقد يجب تحميل شيفرته المترجمة. أول استدعاء لشيفرة ما في كتلة ما يدفع تكلفة هذا التحميل. أما الاستدعاءات اللاحقة لنفس الشيفرة في الكتلة نفسها فرخيصة لأن الشيفرة صارت في الذاكرة.

| الاستدعاء | الغاز التقريبي |
| ---- | --------------- |
| `transfer` في cw20، أول استدعاء للشيفرة في كتلة (رسالة واحدة، الغاز المستخدم المقيس) | 585,151 |
| `transfer` في cw20، ثلاثة استدعاءات في معاملة واحدة، أي تكراران في الكتلة نفسها (الغاز المستخدم المقيس، الإجمالي) | 646,169 |
| الاستدعاء المفرد نفسه كما تُبلغ عنه المحاكاة | 591,280 |

قيست هذه الأرقام على شبكة الاختبار في 12 نوفمبر 2026 باستخدام شيفرة cw20 المراجَعة التي خزّنتها الحوكمة (عامل الازدحام 1x). وفي الواقع يضيف تكرار الشيفرة نفسها في الكتلة نفسها نحو 30,500 غاز فقط. تُبلغ المحاكاة عن أكثر مما تستخدمه المعاملة، لأنها تحتسب دائمًا التحميل البارد وتضيف هامشًا للازدحام: ثلاثة استدعاءات قدّرتها المحاكاة بـ 1,326,504 واستُخدم منها فعليًا 646,169. تعتمد الأرقام على الشيفرة والاستدعاء، فقِس عقدك أنت. وبالتفصيل: يُحتسب التحميل كاملًا عند أول استدعاء للشيفرة في الكتلة، والاستدعاءات الثمانية التالية لتلك الشيفرة في الكتلة نفسها لا تدفع تحميلًا، وكل استدعاء لاحق في الكتلة يدفع ثُمنه. تبدأ مجموعة الشيفرات المحمّلة فارغة في كل كتلة، فتحتسب كل المدققين الاستدعاءات نفسها بالطريقة نفسها. ينطبق هذا على instantiate وexecute وmigrate وعلى الاستدعاءات الصادرة من عقد آخر أو من جسر cross-VM.

**الشيفرات المثبّتة (pinned) لا تدفع تكلفة التحميل.** تستطيع الحوكمة تثبيت شيفرة شائعة ليُبقيها المدققون محمّلة، فلا تدفع الاستدعاءات إليها تكلفة التحميل أبدًا. لمعرفة الشيفرات المثبّتة:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/pinned
```

### إعداد الاستدعاء والذاكرة {#setup}

يدفع كل استدعاء أيضًا رسم إعداد صغيرًا (تكلفة أساسية، وتكلفة لكل صفحة ذاكرة أولية بحجم 64 KiB، وتكلفة لكل قطعة بيانات) ورسمًا عن كل صفحة ذاكرة ينمو إليها. العقود التي تُبقي ذاكرتها صغيرة أرخص.

### التسعير بحسب الازدحام {#congestion}

يُضرب غاز تنفيذ العقد في **عامل ازدحام**.

| الخاصية | القيمة |
| -------- | ----- |
| النطاق | من 1x إلى 20x افتراضيًا |
| السقف الذي تحدده الحوكمة | تستطيع الحوكمة رفع الحد الأقصى حتى 100x |
| متى يرتفع | فقط حين تمتلئ الكتل: بعد كتلة استخدمت أكثر من نصف ميزانية العقود فيها (الهدف الافتراضي) يرتفع العامل، ويرتفع أسرع إذا استُنفدت الميزانية |
| متى ينخفض | بعد كتلة استخدمت أقل من الهدف |

يطبَّق العامل على تنفيذ العقد فقط. التخزين وإعداد الاستدعاء ورفع الشيفرة لا تُضرب فيه. كان العامل 1x عند قياس التحويلات أعلاه.

اقرأ القيم الحية:

```bash
qorechaind query crossvm params --node https://rpc-testnet.qore.host:443
```

الحقول التي تهمك هي `wasm_congestion_factor_micro` (العامل المعمول به بالجزء من المليون، فـ `1000000` تعني 1x) و`wasm_congestion_max_factor` و`wasm_congestion_target_bps` و`max_block_wasm_gas` و`max_tx_wasm_share_bps`.

### ميزانية العقود لكل كتلة {#budget}

لكل كتلة ميزانية من أعمال العقود. القيم الافتراضية:

| المعامل | القيمة الافتراضية | المعنى |
| --------- | ------- | ------- |
| `max_block_wasm_gas` | 3,000,000 | تنفيذ العقود الذي يجوز لكل المعاملات مجتمعةً استخدامه في كتلة واحدة |
| `max_tx_wasm_share_bps` | 5,000 (النصف) | حصة معاملة واحدة من تلك الميزانية، أي 1,500,000 افتراضيًا |
| `queue_wasm_reserve_bps` | 2,500 | حصة الميزانية المحجوزة لاستدعاءات cross-VM غير المتزامنة الموضوعة في الطابور |

حين ترفض الميزانية أعمال العقد في معاملة ما تفشل المعاملة ("block wasm gas budget exhausted") وتدفع رسمها كأي معاملة فاشلة. أعد المحاولة في الكتلة التالية التي تبدأ بميزانية كاملة. ويساعدك رسم الأولوية على الدخول مبكرًا في الكتلة قبل أن تُستهلك الميزانية. أما الاستدعاء الواحد الذي يحتاج أكثر من حصة معاملة واحدة فلا يمكن تشغيله إلى أن ترفع الحوكمة الميزانية أو الحصة.

### المحاكاة وهامش الأمان {#simulation}

تحتسب المحاكاة **دائمًا التحميل البارد**، كأن استدعاءك أول استدعاء لشيفرته في الكتلة، وتسعّر التنفيذ بعامل الازدحام الذي ستستخدمه الكتلة التالية مضافًا إليه خطوتا ارتفاع (نحو 2.25x على جزء التنفيذ). لذلك يصمد التقدير أمام كتلتين من الحمل المتصاعد. ولا يكون أقل من اللازم لأول استدعاء أبدًا.

ولهذا اتبع هذه القاعدة لكل رسالة عقد:

1. حاكِ المعاملة.
2. اضرب الغاز المحاكى في **1.3 على الأقل**.
3. استخدم الناتج حدًا للغاز، ولا تتجاوز سقف المعاملة.

### سقف المعاملة {#tx-cap}

لا يجوز لمعاملة Cosmos أن تضبط حد غاز فوق **50,000,000**. تُرفض المعاملة التي تتجاوز السقف قبل خصم رسمها.

## قواعد الرفع {#upload}

يبقى رفع الشيفرة (`MsgStoreCode`) **خاضعًا للحوكمة**: قيمة `code_upload_access` هي `Nobody` على الشبكتين، فتُخزَّن الشيفرة عبر مقترح حوكمة. يمكنك التحقق في أي وقت:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/params
```

ابتداءً من v3.2.8 يُفحص الرفع بترتيب ثابت، من الفحوص الأرخص إلى الأغلى:

1. **الصلاحية.** يجب أن تسمح قاعدة الرفع بالمرسِل. لا يقبل mempool رسائل الرفع إلا من مرسلين مسموح لهم.
2. **الغاز للحجم المعلن، مقدّمًا.** يجب أن يتبقى للمعاملة غاز يكفي لحجم الوحدة التي تعلنها، وإلا فشلت بنفاد الغاز فورًا قبل فك أي شيء.
3. **الفحص في مرور واحد.** تُفك الوحدة مرة واحدة، دون تجاوز حجمها المعلن، وتُفحص مقابل الحدود أدناه. يجب أن يكون الرفع بصيغة gzip عضوًا واحدًا بالضبط يُفك إلى الحجم الذي يعلنه.
4. **التخزين والترجمة.** يُحتسب التخزين لكل بايت، ثم تُترجم الوحدة.

تكاليف الرفع النموذجية: نحو **9.9 مليون غاز لـ cw20** ونحو **22.8 مليون لـ cw721**. وأكثف رفع يبقى ضمن الحدود يكلّف نحو 32 مليونًا، وهو ما زال داخل سقف 50,000,000.

### حدود الوحدة {#module-limits}

| الحد | القيمة |
| ----- | ----- |
| الدوال | 4,096 كحد أقصى |
| أنواع الدوال | 512 كحد أقصى |
| الحجم المترجم (تقدير متحفظ) | 32 MiB كحد أقصى |
| الصادرات (Exports) | 128 كحد أقصى |
| المتغيرات العامة (Globals) | 256 كحد أقصى |
| قطع العناصر (Element segments) | 16 كحد أقصى، وبمجموع 2,500 مدخل كحد أقصى |
| قطع البيانات | 1,024 كحد أقصى |
| الذاكرة الأولية | 64 صفحة (4 MiB) كحد أقصى |
| الأقسام المخصصة (Custom sections) | 128 KiB كحد أقصى في المجموع |
| عمليات الفاصلة العائمة | غير مسموح بها إطلاقًا |

تُرفض تعليمات الفاصلة العائمة لأنها غير حتمية عبر عتاد المدققين المختلف. اكتب العقود بأنواع الأعداد الصحيحة أو العشرية من `cosmwasm-std`، وتأكد من خلو بنائك من تعليمات الفاصلة العائمة قبل تقديمه للحوكمة.

تُفحص الحدود أيضًا **عند الاستدعاء للشيفرة المخزَّنة أصلًا**، فالشيفرة المخزَّنة سابقًا التي تخالف حدًا (كالفاصلة العائمة مثلًا) تُرفض عند استدعائها. أما العقود المبنية من قوالب cw20 وcw721 القياسية وعقود الإصدار فتبقى ضمن كل الحدود بهامش واسع.

## مثال عملي: تقدير تحويل cw20 وتنفيذه {#worked-example}

الرسالة هي `transfer` القياسية في cw20: `{"transfer": {"recipient": "qor1...", "amount": "1000"}}`. تستخدم الأمثلة شبكة الاختبار.

### واجهة سطر الأوامر {#example-cli}

دع واجهة سطر الأوامر تحاكي بـ `--gas auto` واستخدم معامل ضبط 1.3 أو أكثر. ابنِ المعاملة بـ `--generate-only` ووقّعها بـ `tx pqc cosign` كما في بقية الدليل (راجع [التوقيع الهجين](/cli-reference/transaction-commands#hybrid-signing)):

```bash
qorechaind tx wasm execute <contract-addr> \
  '{"transfer":{"recipient":"qor1recipient...","amount":"1000"}}' \
  --from mykey \
  --gas auto --gas-adjustment 1.3 --gas-prices 0.15uqor \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

حد الشبكة الأدنى هو 0.1 uqor لكل وحدة غاز؛ و`0.15uqor` يترك هامشًا. وإذا كان عقدك يُستدعى كثيرًا في الكتلة نفسها مع مستخدمين آخرين للشيفرة نفسها، فالحد المحاكى يغطي أصلًا التحميل البارد.

### TypeScript {#example-ts}

حاكِ، واضرب في 1.3، وافحص السقف، ثم أرسل عبر الباني الهجين. يتبع هذا [دليل QoreChain Native في SDK](/sdk/guides/cosmwasm#gas) الذي يتضمن الاستيرادات الكاملة وتسجيل مفتاح ML-DSA-87 للحساب.

```ts
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { checkCosmosGasLimit, COSMOS_TX_MAX_GAS } from "@qorechain/sdk";

const cwClient = await SigningCosmWasmClient.connectWithSigner(
  "https://rpc-testnet.qore.host",
  signer,
);

const msgs = [
  {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender,
      contract: contractAddress,
      msg: new TextEncoder().encode(
        JSON.stringify({ transfer: { recipient, amount: "1000" } }),
      ),
      funds: [],
    }),
  },
];

const simulatedGas = await cwClient.simulate(sender, msgs, undefined);
const gas = Math.ceil(simulatedGas * 1.3);
checkCosmosGasLimit(gas); // throws above COSMOS_TX_MAX_GAS (50,000,000)

const gasPrice = 0.15; // uqor per unit of gas
const fee = {
  amount: [{ denom: "uqor", amount: String(Math.ceil(gas * gasPrice)) }],
  gas: String(gas),
};
// Pass `fee` and `msgs` to signAndBroadcastHybrid exactly as in the SDK guide.
```

يطبّق SDK 0.14.0 القواعد نفسها بنفسه: فهو يرفض حد غاز Cosmos الأعلى من 50,000,000 قبل التوقيع، ويمنح معاملات CosmWasm والمعاملات عبر الأجهزة الافتراضية ما لا يقل عن 1.3 ضعف الغاز المحاكى، ولا يستخدم لها أبدًا قيمة احتياطية ثابتة. تخبرك `carriesWasmExecution(messages)` ما إذا كانت قائمة رسائل تحتاج إلى غاز محاكى، و`WASM_GAS_MULTIPLIER_MIN` هو الحد الأدنى 1.3. وحيثما يقبل عميل CosmJS القيمة `"auto"` رسمًا فإنه يحاكي عنك.

### جُرِّب على شبكة الاختبار {#example-tested}

أُجري هذا التشغيل على `qorechain-diana` في 12 نوفمبر 2026 (الإصدار v3.2.8) بحساب eth-native وTypeScript SDK 0.13.0 وشيفرة cw20 التي خزّنتها الحوكمة (معرّف الشيفرة 859). يوقّع المعاملة، ويرسل البايتات الموقّعة إلى مسار المحاكاة في REST، ثم يرسل المعاملة الفعلية بالغاز المحاكى مضروبًا في 1.3.

```ts
import { Registry } from "@cosmjs/proto-signing";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { EthNativeSigner, qorechainRegistryTypes } from "@qorechain/sdk";

const registry = new Registry([...qorechainRegistryTypes, ...wasmTypes]);
const signer = new EthNativeSigner(account, { rest: REST, registry });
const signBytesVersion = await signer.resolveSignBytesVersion(CHAIN_ID);

// 1. Sign once with a generous limit, then ask the node what the call needs.
const base = { chainId: CHAIN_ID, accountNumber, sequence, messages: [msg] };
const { txRawBytes } = signer.sign({
  ...base,
  fee: { amount: [{ denom: "uqor", amount: "450000" }], gas: "3000000" },
  signBytesVersion,
});
const sim = await fetch(`${REST}/cosmos/tx/v1beta1/simulate`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ tx_bytes: Buffer.from(txRawBytes).toString("base64") }),
}).then((r) => r.json());

// 2. Send it for real with the simulated gas times 1.3.
const gas = Math.ceil(Number(sim.gas_info.gas_used) * 1.3);
const res = await signer.signAndBroadcast(transport, {
  ...base,
  fee: { amount: [{ denom: "uqor", amount: String(Math.ceil(gas * 0.15)) }], gas: String(gas) },
});
```

ما طبعه التشغيل:

| الخطوة | النتيجة |
| ---- | ------ |
| إنشاء cw20 (الشيفرة 859): محاكاة ثم إرسال بذلك مضروبًا في 1.3 | المحاكى 634,956؛ الحد 825,443؛ الرمز 0، الغاز المستخدم 629,267 |
| `transfer` في cw20: محاكاة | 591,280 غاز |
| التحويل نفسه بحد ثابت قدره 400,000 | مرفوض: `out of gas in location: wasm code load; gasWanted: 400000, gasUsed: 564549` (ويُخصم الرسم رغم ذلك) |
| التحويل نفسه بالمحاكى × 1.3 (768,664) | الرمز 0، الغاز المستخدم 585,151 |
| ثلاثة تحويلات في معاملة واحدة، المحاكى × 1.3 (1,724,456) | الرمز 0، الغاز المستخدم 646,169 |

الحد الثابت 400,000 يفشل عند أول استدعاء للشيفرة في كتلة، أما الحد المحاكى فلا يفشل. يُحدَّد الرسم على الحد الذي تطلبه (0.15 uqor لكل وحدة غاز في هذا التشغيل)، فالهامش الأكبر يكلّف رسمًا أكبر: استخدم 1.3 لا 5.

### Python وGo وRust وJava {#example-other}

يحاكي كل من هذه الـ SDK مقابل مسار REST ويحدد الحد من النتيجة. وهي تحتاج معاملة مجمَّعة بالكامل (موقّعة) لأن مسار المحاكاة يتطلب بنية المعاملة. وفي execute أو instantiate أو migrate لعقد (وفي استدعاء cross-VM) ترفع هذه الـ SDK الحد إلى 1.3 ضعف الغاز المحاكى على الأقل. وليس لأي منها باني رسائل جاهز لـ cw20 أو CosmWasm، فابنِ `MsgExecuteContract` بمكتبة protobuf لديك ومرّر بايتاته الموقّعة.

**Python** (`qorechain-sdk`, `qorsdk`): تأخذ `estimate_gas` و`auto_fee` المعاملة المبنية وتطبّق حدًا أدنى 1.3 لرسائل wasm.

```python
from qorsdk import auto_fee, estimate_gas

rest = "https://api-testnet.qore.host"
gas = estimate_gas(rest, built, gas_multiplier=1.3)   # raises above the 50,000,000 cap
fee = auto_fee(rest, built, gas_multiplier=1.3, gas_price="0.15uqor")
```

**Go** (`github.com/qorechain/qorechain-sdk/packages/go/qorechain/tx`): تعيد `EstimateGas` الغاز المحاكى، وتطبّق `WasmGasWanted` الحد الأدنى 1.3، وتسعّر `EstimateFee` معاملًا تمرّره (ولا تضيف الحد الأدنى بنفسها، فمرّر 1.3 أو أكثر).

```go
used, err := tx.EstimateGas("https://api-testnet.qore.host", txBytes, nil)
if err != nil { return err }
gas := tx.WasmGasWanted(used, 1.3)

fee, err := tx.EstimateFee("https://api-testnet.qore.host", txBytes, 1.3, "0.15uqor", nil)
```

**Rust** (`qorechain-sdk`): ترفع `estimate_gas_wanted` الحد إلى 1.3 ضعف الغاز المحاكى على الأقل لرسائل wasm وcross-VM، وتسعّره `estimate_fee`.

```rust
use qorechain_sdk::tx::{estimate_fee, estimate_gas_wanted};

let est = estimate_gas_wanted("https://api-testnet.qore.host", &tx_bytes, 1.3).await?;
// est.simulated, est.gas_wanted
let fee = estimate_fee("https://api-testnet.qore.host", &tx_bytes, 1.3, "0.15uqor").await?;
```

**Java** (`io.github.qorechain.tx.AutoGas`): مرّر `true` للوسيط الأخير حين تحمل المعاملة رسائل wasm أو cross-VM.

```java
AutoGas.Estimate est = AutoGas.estimate(
    "https://api-testnet.qore.host", txBytes, /* hybrid */ true, 1.3, null, /* wasmOrCrossVm */ true);
// est.simulatedGas, est.gasWanted
```

### مسار المحاكاة في REST {#example-rest}

يعيد `POST /cosmos/tx/v1beta1/simulate` مع base64 لمعاملة موقّعة الحقل `gas_info.gas_used`. اضربه في 1.3 للحصول على الحد.

```bash
curl -s -X POST https://api-testnet.qore.host/cosmos/tx/v1beta1/simulate \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64 of the signed TxRaw>"}'
```

تحمل الاستجابة `gas_info.gas_used` (سلسلة نصية). يقبل المسار POST فقط: أما `GET` عليه فيجيب بـ `501 Not Implemented`.

## الحدود والأخطاء {#limits-errors}

| الحالة | ما تراه | ما تفعله |
| --------- | ------------ | ---------- |
| حد غاز فوق 50,000,000 | يُرفض قبل خصم الرسم | اخفض الحد؛ وقسّم العمل على عدة معاملات |
| نفاد الغاز في استدعاء عقد | تفشل المعاملة بخطأ نفاد الغاز | حاكِ واستخدم 1.3 ضعف النتيجة على الأقل؛ ولا تعِد استخدام قيمة ثابتة أبدًا |
| استُنفدت ميزانية العقود في الكتلة | فشل يذكر ميزانية غاز wasm للكتلة؛ والرسم مدفوع | أعد المحاولة في الكتلة التالية، ويمكنك إضافة رسم أولوية |
| استدعاء واحد يحتاج أكثر من حصة المعاملة | يفشل في كل مرة | اطلب من الحوكمة رفع الميزانية أو الحصة، أو اجعل الاستدعاء أرخص |
| رفع من مرسِل بلا صلاحية | يُرفض عند القبول | قدّم الشيفرة عبر مقترح حوكمة |
| رفع بغاز لا يكفي لحجمه المعلن | نفاد الغاز فورًا | اضبط الغاز ليغطي الحجم المعلن (نحو 9.9 مليون لـ cw20) |
| رفع يتجاوز حدًا من حدود الوحدة | يُرفض عند الرفع | قلّل الدوال أو الصادرات أو المتغيرات العامة أو القطع أو الذاكرة (انظر الجدول أعلاه) |
| تعليمات فاصلة عائمة في وحدة | تُرفض عند الرفع، وعند الاستدعاء للشيفرة المخزَّنة | أزل عمليات الفاصلة العائمة من البناء |
| رفع gzip ليس عضوًا واحدًا، أو حجمه خاطئ | يُرفض | اضغط الوحدة في تيار gzip واحد بالحجم الصحيح |

## الصفحات ذات الصلة {#related}

- [دليل QoreChain Native (SDK): الغاز لاستدعاءات العقود](/sdk/guides/cosmwasm#gas)
- [تطوير QoreChain Native](/developer-guide/cosmwasm-development)
- [التشغيل البيني عبر الأجهزة الافتراضية (Cross-VM)](/developer-guide/cross-vm-interoperability)
- [التوقيع الهجين و`tx pqc cosign`](/cli-reference/transaction-commands#hybrid-signing)
- [الحوكمة](/user-guide/governance)
