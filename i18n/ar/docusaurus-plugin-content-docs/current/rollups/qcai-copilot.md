---
slug: /rollups/qcai-copilot
title: مساعد QCAI للـ Rollup
sidebar_label: مساعد QCAI
sidebar_position: 7
---

# مساعد QCAI للـ Rollup

مساعد QCAI للـ Rollup (QCAI Rollup Copilot) في RDK هو أداة مساعدة للقراءة فقط **تحاول** جمع البيانات الاستشارية للشبكة عن rollup واحد — تقدير للرسوم، وتوصيات الشبكة، وتحقيقات الاحتيال التي تشير إلى هذا الـ rollup، وحالة وكيل التعلّم المعزَّز — ودمجها في قراءة واحدة بلغة واضحة مع قائمة قصيرة من الاقتراحات.

:::caution غير متاح على نقاط النهاية العامة
الخدمات الاستشارية التي يقرأ منها (مسارات REST ‏`/qorechain/ai/v1/…` ونطاق أسماء JSON-RPC ‏`qor_*`) **لا تخدمها** حاليًا نقاط النهاية العامة `qore.host` على الشبكة الرئيسية أو التجريبية، لذا يعود كل قسم بتحذير. المساعد مصمَّم ليعمل على مبدأ أفضل جهد ممكن: فهو لا يفشل أبدًا، لكن النتيجة الفارغة **لا** تعني أن الـ rollup فُحص ووُجد سليمًا. لا تستخدمه كإشارة أمان إلى أن تُتاح تلك الخدمات. انظر [نطاق أسماء `qor_`](/api-reference/json-rpc-qor_-namespace).
:::

## استدعاء واحد: `getRollupAdvice` {#one-call-getrollupadvice}

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");

console.log(advice.warnings);    // services that could not be reached (all of them today)
console.log(advice.suggestions); // plain-language suggestions, when data is available
```

تتضمن النتيجة أيضًا `feeEstimate` و`networkRecommendations` و`fraudInvestigations` و`rlAgentStatus` عندما تستجيب الخدمة المقابلة.

## واجهة سطر الأوامر {#cli}

```bash
qorollup advise my-rollup
qorollup advise my-rollup --json
```

تُدرَج الخدمات المتعذَّر الوصول إليها كتحذيرات لا كأخطاء، وقد يطبع الإخراج المقروء بشريًا سطر "no issues flagged" حين لا يتم الوصول إلى أي شيء — فاقرأ التحذيرات. راجع [نشر rollup](/rollups/deploying-a-rollup) للاطلاع على واجهة سطر الأوامر للمشغّل `qorollup`.
