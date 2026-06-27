---
slug: /rollups/qcai-copilot
title: QCAI Rollup Yardımcı Pilotu
sidebar_label: QCAI Yardımcı Pilotu
sidebar_position: 7
---

# QCAI Rollup Yardımcı Pilotu

QCAI Rollup Yardımcı Pilotu, ağın tavsiye hizmetlerinin tek bir rollup hakkında
bildiği her şeyi toplar ve bunu tek, sade dilde bir okumaya katlar: canlı bir ücret
tahmini, ağ önerileri, rollup'a referans veren herhangi bir dolandırıcılık
soruşturması, pekiştirmeli öğrenme ajanının durumu ve harekete geçebileceğiniz
kısa bir öneri listesi.

Bu, **en iyi çaba** ilkesiyle çalışır. Tavsiye hizmetleri isteğe bağlı altyapıdır — biri
erişilemezse, Yardımcı Pilot zarif bir şekilde bozulur, tüm çağrıyı başarısız kılmak
yerine o bölümü atlar ve bir uyarı kaydeder. Her zaman bir sonuç alırsınız.

## Tek çağrı: `getRollupAdvice`

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

## Temel okumalar

`getRollupAdvice`, doğrudan da çağırabileceğiniz bir dizi salt okunur yöntemi bir araya
getirir. Tavsiye REST yöntemleri `/qorechain/ai/v1/...` altında bulunur:

- `getFeeEstimate(...)` — geçerli ücret tahmini.
- `getNetworkRecommendations(...)` — ağ düzeyinde ayar önerileri.
- `getFraudInvestigations(...)` / `getFraudInvestigation(id)` — açık
  soruşturmalar ve kimliğe göre tek bir soruşturma.
- `getCircuitBreakers(...)` — tavsiye niteliğinde devre kesici durumu.

Pekiştirmeli öğrenme okumaları `qor_*` JSON-RPC ad alanını kullanır:

- `getRLAgentStatus()` — ajanın geçerli durumu.
- `getRLObservation()` — en son gözlem.
- `getRLReward()` — en son ödül sinyali.

Bunların tümü okuma olduğundan, Yardımcı Pilot yalnızca bir REST uç noktasına (ve RL
okumaları için bir EVM / `qor_` JSON-RPC uç noktasına) ihtiyaç duyar — imzalayıcı gerekmez.

## CLI

```bash
qorollup advise my-roll
qorollup advise my-roll --json
```

`advise`, erişilemeyen hizmetler hata yerine uyarı olarak gösterilerek, bir araya
getirilen tavsiyeyi yazdırır. Tam `qorollup` operatör CLI'sı için
[Bir Rollup Dağıtma](/rollups/deploying-a-rollup) sayfasına bakın.
