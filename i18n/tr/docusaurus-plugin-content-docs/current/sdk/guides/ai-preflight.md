---
slug: /sdk/guides/ai-preflight
title: AI Ön Kontrol Kılavuzu
sidebar_label: AI Ön Kontrol
sidebar_position: 5
---

# AI ön kontrol kılavuzu

QoreChain, bir dApp'in EVM üzerinden okuyabileceği **zincir üzerinde bir AI
risk/anomali modeli** tanımlar. Salt okunur iki EVM precompile'ı, yalnızca
`eth_call` kullanarak, bir işlemi imzalanmadan veya yayınlanmadan *önce*
puanlamanıza olanak tanımak üzere tasarlanmıştır:

| Yetenek | Precompile | Adres |
|---|---|---|
| Calldata için risk puanı | `aiRiskScore(bytes)` | `0x0000000000000000000000000000000000000B01` |
| `(sender, amount)` için anomali kontrolü | `aiAnomalyCheck(address,uint256)` | `0x0000000000000000000000000000000000000B02` |

:::caution Bugün herkese açık ağlarda kullanılamaz
`simulateWithRiskScore`, `aiRiskScore` ve `aiAnomalyCheck`, `0x…0B01` / `0x…0B02`
adreslerindeki precompile'ları okur. Statik bir precompile yalnızca adresi EVM
modülünün `active_static_precompiles` parametresinde olduğunda yanıt verir ve bu
liste hem `qorechain-vladi` (ana ağ) hem de `qorechain-diana` (test ağı) üzerinde
boştur. Herkese açık uç noktalara yapılan bir çağrı boş veri (`0x`) döndürür ve bu
yardımcılar hata fırlatır (örneğin `returned no data ("0x")`). Yalnızca
precompile'ların etkinleştirildiği bir ağda veya düğümde çalışırlar. Önce
`GET /cosmos/evm/vm/v1/params` adresini kontrol edin ve bkz.
[EVM Precompile'ları: Ağ durumu](/developer-guide/evm-precompiles#network-status).
:::

Uygulama `@qorechain/evm` içinde ([viem](https://viem.sh) üzerindeki EVM adaptörü)
yer alır ve keşif için `@qorechain/sdk`'den yeniden dışa aktarılır.

> Risk `level` değeri, daha riskli işlemler için daha yüksektir. Zincirin örnek
> politikası `require(level < 3)` kullanır.

## Tek çağrıyla ön kontrol

`simulateWithRiskScore`, bir gaz tahmini, bir risk puanı ve bir anomali
kontrolünü tek bir tavsiye niteliğindeki sonuçta bir araya getirir:

```ts
import { createEvmClient, simulateWithRiskScore } from "@qorechain/evm";

const { publicClient } = await createEvmClient({
  endpoints: { evmRpc: "https://evm-testnet.qore.host" },
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

`safe`, eşik varsayılan olarak `3` olmak üzere,
`risk.level < RISK_LEVEL_UNSAFE_THRESHOLD && !anomaly.flagged` olarak hesaplanır.
Hiçbir `data` sağlanmadığında, risk puanı `to` adresindeki dağıtılmış bytecode
üzerinden hesaplanır, böylece bir sözleşmeye yapılan salt değer transferi de
puanlanır.

> **`safe` bayrağı tavsiye niteliğindedir.** Precompile'lar kendi başlarına hiçbir
> şeyi engellemez. Kendi politikanızı zincir dışında belirleyin ve uygulayın (ve
> bir sözleşme, zincir üzerinde `level` üzerinde `require` çağrısı yapabilir).
> `RISK_LEVEL_UNSAFE_THRESHOLD` dışa aktarılır, böylece SDK'nin belgelediği aynı
> varsayılana başvurabilirsiniz.

## Yapı taşları

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

Her ikisi de çağrıyı viem'in `encodeFunctionData`'sıyla kodlar ve döndürülen
tuple'ı `decodeFunctionResult` ile çözer.

## Adres sabitleri

```ts
import { AI_RISK_SCORE_ADDRESS, AI_ANOMALY_CHECK_ADDRESS } from "@qorechain/evm";
```

## Kullanılabilirlik

Yardımcılar, sorguladığınız düğümde precompile'lar etkin olmadığı sürece hata
fırlatır: herkese açık ağlarda bu şu anda her zaman böyledir, düz bir EVM düğümünde
de öyledir. Bu yardımcılardan herhangi birinden fırlatılan bir hatayı "bu düğümde
özellik mevcut değil" olarak değerlendirin.

Tam precompile listesi için [EVM kılavuzuna](/sdk/guides/evm) ve çalıştırılabilir
[`ai-preflight` örneğine](https://github.com/qorechain/qorechain-sdk/tree/main/examples/ai-preflight)
bakın.
