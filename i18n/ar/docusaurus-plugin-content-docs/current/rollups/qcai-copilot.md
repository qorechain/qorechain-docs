---
slug: /rollups/qcai-copilot
title: مساعد QCAI للـ Rollup
sidebar_label: مساعد QCAI
sidebar_position: 7
---

# مساعد QCAI للـ Rollup

يجمع مساعد QCAI للـ Rollup كل ما تعرفه خدمات الاستشارة في الشبكة
عن rollup واحد ويطويه في قراءة واحدة بلغة بسيطة: تقدير حي للرسوم،
وتوصيات الشبكة، وأي تحقيقات احتيال تشير إلى
الـ rollup، وحالة عميل التعلم المعزّز، وقائمة قصيرة من
الاقتراحات التي يمكنك التصرف بناءً عليها.

وهو يعمل بأفضل جهد ممكن (**best-effort**). خدمات الاستشارة بنية تحتية اختيارية — فإذا تعذّر الوصول إلى إحداها،
يتدهور المساعد بسلاسة، فيُسقط ذلك القسم
ويسجّل تحذيرًا بدلًا من فشل الاستدعاء بأكمله. تحصل دائمًا على نتيجة.

## استدعاء واحد: `getRollupAdvice`

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    evmRpc: "https://evm.testnet.example", // qor_ JSON-RPC for RL agent reads
  },
});

const advice = await getRollupAdvice(rdk, "my-roll");

console.log(advice.feeEstimate);            // live fee estimate (if reachable)
console.log(advice.networkRecommendations); // tuning recommendations
console.log(advice.fraudInvestigations);    // investigations referencing this rollup
console.log(advice.rlAgentStatus);          // RL agent status (qor_ JSON-RPC)
console.log(advice.suggestions);            // plain-language, actionable
console.log(advice.warnings);               // services that were unreachable
```

## عمليات القراءة الأساسية

تجمّع `getRollupAdvice` مجموعة من الطرق للقراءة فقط يمكنك أيضًا استدعاؤها
مباشرة. تقع طرق REST الاستشارية تحت `/qorechain/ai/v1/...`:

- `getFeeEstimate(...)` — تقدير الرسوم الحالي.
- `getNetworkRecommendations(...)` — توصيات الضبط على مستوى الشبكة.
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — التحقيقات
  المفتوحة وتحقيق واحد حسب المعرّف.
- `getCircuitBreakers(...)` — حالة قاطع الدارة الاستشارية.

تستخدم عمليات قراءة التعلم المعزّز فضاء أسماء JSON-RPC من نوع `qor_*`:

- `getRLAgentStatus()` — الحالة الراهنة للعميل.
- `getRLObservation()` — أحدث ملاحظة.
- `getRLReward()` — أحدث إشارة مكافأة.

ولأن جميعها عمليات قراءة، يحتاج المساعد فقط إلى نقطة نهاية REST (ونقطة نهاية EVM
/ `qor_` JSON-RPC لعمليات قراءة التعلم المعزّز) — دون أي موقِّع.

## واجهة سطر الأوامر

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

تطبع `advise` الاستشارة المجمّعة، مع إظهار الخدمات التي تعذّر الوصول إليها بصفتها
تحذيرات بدلًا من أخطاء. راجع [نشر rollup](/rollups/deploying-a-rollup)
للاطلاع على واجهة سطر أوامر المشغّل `qorollup` الكاملة.
