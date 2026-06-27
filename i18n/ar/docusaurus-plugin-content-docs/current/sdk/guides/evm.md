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
  endpoints: { evmRpc: "https://evm.testnet.example" },
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

يمكنك أيضًا تمرير `rpcUrl` مباشرةً (متعارض تبادليًا مع `endpoints`)، و
`wsUrl` / `endpoints.evmWs` لـ WebSocket، و`chainId` صريح، و`decimals`
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

## ما قبل التجميع (Precompiles)

تكشف QoreChain عن مكوّنات ما قبل التجميع القابلة للاستدعاء كعقود على عناوين
ثابتة. يوفّر فضاء الأسماء `precompiles` ارتباطات مُصنّفة، وتُصدَّر العناوين
وملفّات ABI.

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

// Read live consensus parameters.
const params = await precompiles.rlConsensusParams(client.publicClient);

// Check whether an address has a registered PQC key.
const status = await precompiles.pqcKeyStatus(client.publicClient, account);

// QCAI helpers.
const score = await precompiles.aiRiskScore(client.publicClient, /* args */);
const anomaly = await precompiles.aiAnomalyCheck(client.publicClient, /* args */);

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
```

تُصدَّر ملفّات ABI لما قبل التجميع باسم `IQORE_PQC_ABI` و`IQORE_AI_ABI` و
`IQORE_CONSENSUS_ABI`.

> على عقدة لا تتوفّر فيها مكوّنات ما قبل التجميع الخاصة بـ QoreChain، تُطلِق هذه
> الاستدعاءات خطأ "feature not present". عالج ذلك لكلّ استدعاء على حدة إن كنت
> تستهدف عُقدًا غير متجانسة.

انظر [مثال](/sdk/examples) `evm-precompile` للحصول على نسخة قابلة للتشغيل.
