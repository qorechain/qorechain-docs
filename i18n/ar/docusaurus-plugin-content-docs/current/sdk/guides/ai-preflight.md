---
slug: /sdk/guides/ai-preflight
title: دليل الفحص المُسبق بالذكاء الاصطناعي
sidebar_label: الفحص المُسبق بالذكاء الاصطناعي
sidebar_position: 5
---

# دليل الفحص المُسبق بالذكاء الاصطناعي

QoreChain هي أول شبكة تكشف **نموذج مخاطر/شذوذ بالذكاء الاصطناعي على السلسلة**
لأي dApp. تتيح لك precompiletان للقراءة فقط في EVM تقييم معاملة *قبل*
توقيعها أو بثها، باستخدام `eth_call` فقط لا غير:

| القدرة | precompile | العنوان |
|---|---|---|
| درجة مخاطر لـ calldata | `aiRiskScore(bytes)` | `0x0000000000000000000000000000000000000B01` |
| فحص شذوذ لـ `(sender, amount)` | `aiAnomalyCheck(address,uint256)` | `0x0000000000000000000000000000000000000B02` |

يوجد التنفيذ في `@qorechain/evm` (محوّل EVM فوق
[viem](https://viem.sh)) ويُعاد تصديره من `@qorechain/sdk` لتسهيل الاكتشاف.

> تكون قيمة `level` للمخاطر أعلى للمعاملات الأكثر خطورة. سياسة المثال في السلسلة
> تستخدم `require(level < 3)`.

## فحص مُسبق باستدعاء واحد

تجمع `simulateWithRiskScore` تقدير الـ gas ودرجة المخاطر وفحص الشذوذ
في حُكم استشاري واحد:

```ts
import { createEvmClient, simulateWithRiskScore } from "@qorechain/evm";

const { publicClient } = await createEvmClient({
  endpoints: { evmRpc: "https://evm.testnet.example" },
});

const preflight = await simulateWithRiskScore(publicClient, {
  from: "0xYourAddress",
  to: "0xToken",
  data: "0xa9059cbb...", // ERC-20 transfer calldata
  value: 0n,
});

console.log(preflight.gas);     // bigint — eth_estimateGas
console.log(preflight.risk);    // { score: bigint, level: number }
console.log(preflight.anomaly); // { anomalyScore: bigint, flagged: boolean }
console.log(preflight.safe);    // boolean — advisory verdict
```

تُحسب `safe` بصيغة `risk.level < RISK_LEVEL_UNSAFE_THRESHOLD && !anomaly.flagged`،
حيث تكون العتبة الافتراضية `3`. عندما لا يُمرَّر أي `data`، تُحسب درجة المخاطر
على البايت كود المنشور عند `to`، بحيث يُقيَّم حتى تحويل قيمة بسيط
إلى عقد.

> **علم `safe` استشاري.** لا تحجب precompiles أي شيء من تلقاء نفسها.
> اضبط سياستك الخاصة وافرضها خارج السلسلة (ويمكن لعقد أن يستخدم `require`
> على المستوى داخل السلسلة). تُصدَّر `RISK_LEVEL_UNSAFE_THRESHOLD` كي يمكنك
> الإشارة إلى القيمة الافتراضية نفسها التي يوثّقها الـ SDK.

## اللبنات الأساسية

```ts
import { aiRiskScore, aiAnomalyCheck } from "@qorechain/evm";

// Risk score for raw calldata (accepts a 0x-hex string or a Uint8Array).
const { score, level } = await aiRiskScore(publicClient, "0xa9059cbb...");

// Anomaly check for a (sender, amount) pair.
const { anomalyScore, flagged } = await aiAnomalyCheck(
  publicClient,
  "0xYourAddress",
  1_000_000_000_000_000_000n, // 1 QOR in wei
);
```

يرمّز كلاهما الاستدعاء باستخدام `encodeFunctionData` من viem ويفكّ
الصف (tuple) المُرجَع باستخدام `decodeFunctionResult`.

## ثوابت العناوين

```ts
import { AI_RISK_SCORE_ADDRESS, AI_ANOMALY_CHECK_ADDRESS } from "@qorechain/evm";
```

## التوفّر

توجد precompiles الذكاء الاصطناعي على عقد شبكة QoreChain. على عقدة EVM عادية تُطلق
الاستدعاءات خطأ "not available" — عامل أي خطأ مُطلَق من أي من هذه
المساعِدات على أنه "الميزة غير موجودة على هذه العقدة".

راجع [دليل EVM](/sdk/guides/evm) للحصول على قائمة precompiles الكاملة، والمثال
القابل للتشغيل [`ai-preflight`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/ai-preflight).
