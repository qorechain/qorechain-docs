---
slug: /rollups/qcai-copilot
title: مساعد QCAI للـ Rollup
sidebar_label: مساعد QCAI
sidebar_position: 7
---

# مساعد QCAI للـ Rollup

يجمع مساعد QCAI للـ Rollup ‏(QCAI Rollup Copilot) كل ما تعرفه الخدمات
الاستشارية في الشبكة عن rollup واحد ويصهره في قراءة واحدة بلغة واضحة: تقدير
مباشر للرسوم، وتوصيات الشبكة، وأي تحقيقات احتيال تشير إلى هذا الـ rollup،
وحالة وكيل التعلّم المعزَّز، وقائمة قصيرة من الاقتراحات القابلة للتنفيذ.

وهو يعمل على مبدأ **أفضل جهد ممكن**. فالخدمات الاستشارية بنية تحتية اختيارية —
وإذا تعذّر الوصول إلى إحداها، يتدهور أداء المساعد بسلاسة، فيُسقط ذلك القسم
ويسجّل تحذيرًا بدلًا من إفشال الاستدعاء بأكمله. ستحصل دائمًا على نتيجة.

## استدعاء واحد: `getRollupAdvice`

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

// The public qore.host endpoints (REST + the qor_ JSON-RPC endpoint used for
// the RL agent reads) are baked into the presets since RDK 0.4.2 — no manual
// endpoint config needed; pass `endpoints` only to target your own node.
const rdk = createRdkClient({ network: "testnet" });

const advice = await getRollupAdvice(rdk, "my-roll");

console.log(advice.feeEstimate);            // live fee estimate (if reachable)
console.log(advice.networkRecommendations); // tuning recommendations
console.log(advice.fraudInvestigations);    // investigations referencing this rollup
console.log(advice.rlAgentStatus);          // RL agent status (qor_ JSON-RPC)
console.log(advice.suggestions);            // plain-language, actionable
console.log(advice.warnings);               // services that were unreachable
```

## عمليات القراءة الأساسية

تُجمِّع الدالة `getRollupAdvice` مجموعة من دوال القراءة فقط التي يمكنك أيضًا
استدعاؤها مباشرة. تقع دوال REST الاستشارية تحت المسار `/qorechain/ai/v1/...`:

- `getFeeEstimate(...)` — تقدير الرسوم الحالي.
- `getNetworkRecommendations(...)` — توصيات الضبط على مستوى الشبكة.
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — التحقيقات
  المفتوحة، وتحقيق واحد حسب المعرِّف (id).
- `getCircuitBreakers(...)` — الحالة الاستشارية لقواطع الدارة.

أما قراءات التعلّم المعزَّز فتستخدم نطاق أسماء JSON-RPC من النوع `qor_*`:

- `getRLAgentStatus()` — الحالة الحالية للوكيل.
- `getRLObservation()` — أحدث ملاحظة.
- `getRLReward()` — أحدث إشارة مكافأة.

ولأن هذه كلها عمليات قراءة، لا يحتاج المساعد إلا إلى نقطة نهاية REST (ونقطة
نهاية EVM ‏/ JSON-RPC ‏`qor_` لقراءات التعلّم المعزَّز) — دون أي مُوقِّع.

## واجهة سطر الأوامر

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

يطبع الأمر `advise` النصيحة المجمَّعة، مع إظهار الخدمات المتعذَّر الوصول إليها
كتحذيرات لا كأخطاء. راجع [نشر rollup](/rollups/deploying-a-rollup)
للاطلاع على واجهة سطر الأوامر الكاملة للمشغّل `qorollup`.
