---
slug: /rollups/qcai-copilot
title: QCAI Rollup Yardımcı Pilotu
sidebar_label: QCAI Yardımcı Pilotu
sidebar_position: 7
---

# QCAI Rollup Yardımcı Pilotu

RDK'daki QCAI Rollup Yardımcı Pilotu, tek bir rollup için ağın tavsiye verilerini — bir ücret tahmini, ağ önerileri, rollup'a referans veren dolandırıcılık soruşturmaları, pekiştirmeli öğrenme ajanının durumu — toplamaya **çalışan** ve bunu kısa bir öneri listesiyle birlikte tek, sade dilde bir okumaya dönüştüren salt okunur bir yardımcıdır.

:::caution Genel uç noktalarda kullanılamaz
Okuduğu tavsiye hizmetleri (`/qorechain/ai/v1/…` REST rotaları ve `qor_*` JSON-RPC ad alanı) şu anda mainnet veya testnet üzerindeki genel `qore.host` uç noktaları tarafından **sunulmamaktadır**; bu yüzden her bölüm bir uyarı olarak döner. Yardımcı Pilot tasarım gereği en iyi çaba ilkesiyle çalışır: asla başarısız olmaz, ancak boş bir sonuç rollup'ın kontrol edildiği ve sağlıklı bulunduğu anlamına **gelmez**. Bu hizmetler kullanıma açılana kadar bunu bir güvenlik sinyali olarak kullanmayın. Bkz. [`qor_` ad alanı](/api-reference/json-rpc-qor_-namespace).
:::

## Tek çağrı: `getRollupAdvice` {#one-call-getrollupadvice}

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");

console.log(advice.warnings);    // services that could not be reached (all of them today)
console.log(advice.suggestions); // plain-language suggestions, when data is available
```

Sonuç, ilgili hizmet yanıt verdiğinde ayrıca `feeEstimate`, `networkRecommendations`, `fraudInvestigations` ve `rlAgentStatus` değerlerini de taşır.

## CLI {#cli}

```bash
qorollup advise my-rollup
qorollup advise my-rollup --json
```

Erişilemeyen hizmetler hata yerine uyarı olarak listelenir ve hiçbirine erişilemediğinde bile insan tarafından okunabilir çıktı yine de bir "no issues flagged" satırı yazdırabilir — uyarıları okuyun. `qorollup` operatör CLI'sı için [Bir Rollup Dağıtma](/rollups/deploying-a-rollup) sayfasına bakın.
