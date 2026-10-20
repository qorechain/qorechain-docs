---
slug: /sdk/guides/evm
title: دليل EVM
sidebar_label: EVM
sidebar_position: 1
---

# دليل EVM

`@qorechain/evm` هو محوّل رقيق وآمن من حيث الأنواع فوق [viem](https://viem.sh)
لمحرّك EVM في QoreChain. إنّه لا يعيد تنفيذ عميل EVM — فـ viem اعتمادية
نظيرة. إنّه يضيف مصنع عميل مدركًا للسلسلة (مع كشف تلقائي لمعرّف سلسلة EVM)،
ومساعدات ERC-20، وأغلفة نشر/استدعاء العقود، وارتباطات مُصنّفة
لما قبل التجميع (precompiles) في EVM الخاص بـ QoreChain.

```bash
npm i @qorechain/evm viem
```

## إنشاء عميل

تُرجع `createEvmClient` حزمة عميل مدعومة بـ viem. تكشف تلقائيًا
معرّف سلسلة EVM عبر `eth_chainId` ما لم تمرّر `chainId`.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm-testnet.qore.host" }, // mainnet: https://evm.qore.host
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

يمكنك أيضًا تمرير `rpcUrl` مباشرةً (متعارض تبادليًا مع `endpoints`)، و
`wsUrl` / `endpoints.evmWs` لـ WebSocket (`wss://evm-ws-testnet.qore.host` على
شبكة الاختبار)، و`chainId` صريح، و`decimals`
(القيمة الافتراضية 18، وهي اصطلاح EVM لـ QOR — متمايز عن أساس Cosmos لـ `uqor`
البالغ 10^6).

اشتقّ حساب توقيع EVM من مفتاح خاص:

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## مساعدات ERC-20

يغلّف فضاء الأسماء `erc20` (والدوال الفردية) استدعاءات ERC-20 القياسية.
تأخذ عمليات القراءة عميل viem العام؛ وتأخذ عمليات الكتابة عميل محفظة.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

يُصدَّر الـ ABI الخام باسم `ERC20_ABI` إن كنت تفضّل استدعاء viem مباشرةً.

## العقود

أغلفة نشر واستدعاء عامة:

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## نافذة تفويض EVM (السلسلة v3.2.0) {#evm-window}

منذ إصدار السلسلة **v3.2.0** (الشبكة الرئيسية من الكتلة 2,981,742، وشبكة الاختبار
من الكتلة 5,920,000) لا يقبل مسار EVM معاملةً إلا من حساب لديه **مفتاح ML-DSA-87
مسجَّل** و**نافذة تفويض مفتوحة**. تعمل القراءات
(`eth_call` والأرصدة والإيصالات) وتقدير الغاز بدونها، وتوقّع المحافظ
والمكتبات مثل MetaMask وviem وethers وHardhat وFoundry كما كانت؛
الذي يتغير هو أن التفويض ما بعد الكمّي يسبق
المعاملة، في صورة رسالة على المسار الأصلي (Native) موقَّعة توقيعًا هجينًا. القواعد على مستوى السلسلة والحدود وصيغ سطر الأوامر
ورموز الرفض موجودة في
[نافذة تفويض EVM](/getting-started/first-transaction#evm-window).

مع SDK **0.8.2 أو أحدث** يمكنك فتح نافذة من الشيفرة (و**0.9.0** تضيف خيارات
النطاق أدناه). تسجيل المفتاح
(مرة واحدة) موصوف في [الأمان الكمومي](/sdk/guides/quantum-safe)؛ ثم يفتح المثال
أدناه نافذة لحساب eth-native موحَّد (`npm i @cosmjs/stargate`):

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  openEvmWindowMsg,
  fetchEvmWindow,
  classifyEvmWindowRejection,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

const client = createClient({ network: "mainnet", endpoints: { rest: REST, rpc: RPC } });
const transport = await StargateClient.connect(RPC);
const account = await deriveUnifiedAccount(mnemonic);
const signer = new EthNativeSigner(account, { rest: REST }); // hybrid: the window needs the ML-DSA key

const { account: base } = await client.rest.get<{
  account: { account_number: string; sequence: string };
}>(`/cosmos/auth/v1beta1/accounts/${account.cosmos}`);

const open = openEvmWindowMsg({
  sender: account.cosmos,
  blocks: 7200,         // 1 … 17,280 blocks (a block count, not a duration)
  maxTxs: 20,           // 1 … 1,000 transactions
  maxValue: "1000000000", // uqor: transferred value PLUS the maximum fee of each transaction
});

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-vladi",
  accountNumber: BigInt(base.account_number),
  sequence: BigInt(base.sequence),
  messages: [open],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
});

const w = await fetchEvmWindow({ rest: REST, address: account.cosmos });
console.log(w.live); // true while the window admits at least one more transaction
```

يؤدي فتح نافذة إلى تقدّم nonce الحساب (هوية واحدة: تسلسل Cosmos
هو nonce في EVM)، لذا اقرأ nonce الخاص بـ EVM **بعد** فتح النافذة ووقّع
معاملة EVM حينها. يحدّ `maxValue` القيمة **زائد** أقصى رسم (حد الغاز
مضروبًا في سقف الرسوم) لكل معاملة: تحويل 1,000 uqor بغاز 21,000 وبسعر
112.5 gwei يستهلك 3,363 uqor من النافذة. افتح نافذة فقط عندما
يطلب المستخدم ذلك؛ ولا تفتح واحدة تلقائيًا أبدًا.

عندما يرفض مسار EVM معاملةً، تخبرك `classifyEvmWindowRejection(err)`
بالسبب:

```ts
try {
  // send the EVM transaction (viem, ethers, ...)
} catch (err) {
  const why = classifyEvmWindowRejection(err);
  // "no-pqc-key" | "no-window" | "exhausted" | "invalid" | undefined
}
```

تبني `closeEvmWindowMsg` رسالة الإغلاق المقابلة، وتُصدِّر `MAX_EVM_WINDOW_BLOCKS`
و`MAX_EVM_WINDOW_TXS` الحدود.

### تحديد نطاق نافذة (منذ السلسلة v3.2.3، SDK 0.9.0) {#evm-window-scope}

يمكن تضييق نطاق النافذة عند فتحها: يقبل `nativeOnly` التحويلات البسيطة من QOR
الأصلي فقط (بلا calldata، وبلا إنشاء عقود، وبلا مستلم يحمل شيفرة، وبلا تفويض
EIP-7702)، ويقبل `allowedTargets` المعاملات التي يكون مستلمها واحدًا من
عناوين `0x` المدرجة وعددها 16 كحد أقصى (دون تكرار؛ ويُرفض إنشاء العقود).
كلاهما حقلان جديدان في الرسالة: تُرفض المعاملة كلها في أي عقدة أقدم من v3.2.3
عند ضبط أيٍّ منهما، لذا اضبطهما فقط على شبكة طبّقت v3.2.3 (وقد طبّقتها
الشبكتان العامتان). تقرأ `fetchEvmWindow` كليهما (`nativeOnly` و
`allowedTargets`؛ وتُقرآن `false` وفارغتين قبل v3.2.3). وللنافذة التي تُفتح
لإرسال QOR فقط، فضّل `nativeOnly`.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.host", rpc: "https://rpc.qore.host", evmRpc: "https://evm.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on-chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "1000000000", // uqor: value PLUS the maximum fee of each transaction
      nativeOnly: true,
      // or: allowedTargets: ["0x…", "0x…"],
    }),
  ],
  "auto",
);
```

### موافقة EIP-7702 (منذ السلسلة v3.2.2، SDK 0.9.0) {#evm-delegation-consent}

لا تُقبل معاملة من النوع 4 (EIP-7702) إلا بعد أن يمنح كل حساب يسري تفويضه موافقة
ما بعد كمّية على ذلك المفوَّض بالتحديد، عبر `MsgAuthorizeEVMDelegation`
موقَّعة توقيعًا هجينًا. تُستهلك الموافقة بالمعاملة التي تثبّت التفويض، وتنتهي
بعد عدد الكتل `blocks` الذي تضبطه (من 1 إلى 17,280)؛ والعنوان الصفري كمفوَّض يعني
الموافقة على المسح. يبني الـ SDK الرسائل ويقرأ الموافقة، بما في ذلك الـ nonce
الذي يجب أن تحمله مجموعة التفويض (authorisation tuple):

```ts
import {
  authorizeEvmDelegationMsg,
  clearEvmDelegationMsg,
  fetchEvmDelegationConsent,
  evmDelegationTupleNonce,
} from "@qorechain/sdk";

// 1) Consent to one delegate (hybrid-signed Native-lane message, `tx` as above).
await tx.signAndBroadcast(
  [authorizeEvmDelegationMsg({ sender: account.address, delegate: "0xDelegate…", blocks: 600 })],
  "auto",
);

// 2) Read the consent: the tuple's nonce is the account's EVM nonce for a
//    sponsored transaction, and that nonce + 1 when the account sends it itself.
const consent = await fetchEvmDelegationConsent({ rest: "https://api.qore.host", address: account.address });
const tupleNonce = evmDelegationTupleNonce(consent, /* sponsored */ true);

// 3) Sign the authorisation tuple with `tupleNonce` and send the type-4
//    transaction (the sender still needs an open window; a sponsor pays from its own).

// Remove an installed delegation directly, without any EVM transaction:
// await tx.signAndBroadcast([clearEvmDelegationMsg(account.address)], "auto");
```

تُرجع `classifyEvmDelegationRejection(err)` القيمة `"no-consent"` أو `"invalid"`
عندما يرفض مسار EVM تفويضًا. يتطلب استعلام الموافقة السلسلة v3.2.2 أو أحدث.
القواعد على مستوى السلسلة موجودة في
[تفويضات EIP-7702](/architecture/post-quantum-security#eip-7702)؛ وصيغ سطر
الأوامر هي `qorechaind tx pqc authorize-evm-delegation` و`clear-evm-delegation`.

الإصدارات السابقة لـ 0.9.0 تبني النافذة غير المقيَّدة النطاق فقط (وما زالت
النافذة غير المقيَّدة تعمل على الشبكتين) وليس فيها أي مُنشئ لرسائل الموافقة؛
استخدم هناك صيغ سطر الأوامر الواردة في
[نافذة تفويض EVM](/getting-started/first-transaction#evm-window).

## ما قبل التجميع (Precompiles)

تعرّف QoreChain مكوّنات ما قبل التجميع القابلة للاستدعاء من العقود على عناوين
ثابتة. يوفّر فضاء الأسماء `precompiles` ارتباطات مُصنّفة، وتُصدَّر العناوين
وملفّات ABI.

> **غير مفعَّلة بعد.** مكوّنات ما قبل التجميع في QoreChain مُترجَمة داخل العقدة
> لكنها لم تُفعَّل بعد على الشبكة الرئيسية (`qorechain-vladi`) ولا على شبكة الاختبار
> (`qorechain-diana`): يعيد الاستدعاء بيانات فارغة، لذا تُطلق هذه المساعدات
> أخطاءً على الشبكات العامة اليوم أيضًا. راجع
> [مكوّنات EVM ما قبل التجميع: حالة الشبكة](/developer-guide/evm-precompiles#network-status).

| ما قبل التجميع | الدالة | العنوان |
| --- | --- | --- |
| جسر عبر-الأجهزة-الافتراضية (Cross-VM Bridge) | (توجيه الجسر) | `0x0000000000000000000000000000000000000901` |
| التحقق من PQC | `pqcVerify` | `0x0000000000000000000000000000000000000A01` |
| حالة مفتاح PQC | `pqcKeyStatus` | `0x0000000000000000000000000000000000000A02` |
| درجة مخاطر QCAI | `aiRiskScore` | `0x0000000000000000000000000000000000000B01` |
| فحص شذوذ QCAI | `aiAnomalyCheck` | `0x0000000000000000000000000000000000000B02` |
| معاملات الإجماع | `rlConsensusParams` | `0x0000000000000000000000000000000000000C01` |

```ts
import { precompiles, PRECOMPILE_ADDRESSES } from "@qorechain/evm";

// Read consensus parameters (once 0x…0C01 is active).
const params = await precompiles.rlConsensusParams(client.publicClient);

// Check whether an address has a registered PQC key.
const status = await precompiles.pqcKeyStatus(client.publicClient, account);

// QCAI helpers: raw calldata for the risk score, an args object for the anomaly check.
const score = await precompiles.aiRiskScore(client.publicClient, "0xa9059cbb...");
const anomaly = await precompiles.aiAnomalyCheck(client.publicClient, {
  sender: account,
  amount: 1_000_000_000_000_000_000n, // 1 QOR in wei
});

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
```

تُصدَّر ملفّات ABI لما قبل التجميع باسم `IQORE_PQC_ABI` و`IQORE_AI_ABI` و
`IQORE_CONSENSUS_ABI`.

> حيث لا يكون مكوّن ما قبل التجميع مفعَّلًا (اليوم: كل شبكة عامة)، أو على عقدة
> بلا مكوّنات ما قبل التجميع الخاصة بـ QoreChain، تُطلِق هذه الاستدعاءات خطأ
> "feature not present". عالج ذلك لكلّ استدعاء على حدة.

انظر [مثال](/sdk/examples) `evm-precompile` للحصول على نسخة قابلة للتشغيل.
