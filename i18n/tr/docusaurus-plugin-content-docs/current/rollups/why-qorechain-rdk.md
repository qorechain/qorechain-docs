---
slug: /rollups/why
title: Neden QoreChain RDK
sidebar_label: Neden QoreChain RDK
sidebar_position: 2
---

# Neden QoreChain RDK

Çoğu rollup geliştirme kiti aynı temanın varyasyonlarıdır: bir temel katmana
yerleşen (settle eden) bir uygulama zinciri başlatmanıza yardımcı olurlar.
QoreChain RDK bunu da yapar — ama ayrıca **başka hiçbir rollup kitinin
sunamayacağı** üç şeyi de sunar, çünkü bunlar araç setinde değil, QoreChain'in
1. Katmanında (Layer 1) yaşayan yeteneklere dayanır:

- **kuantum sonrası (post-quantum)** bir yerleşim katmanı,
- **zincir üstü AI/RL** danışma temel bileşenleri (QCAI) ve
- zincirler arası VM çağrılarına sahip **üçlü-VM** çalışma zamanı.

Yalnızca genel bir optimistic/zk rollup'a ihtiyacınız varsa, herhangi bir kit
işinizi görür. Rollup'ınızın yerleşiminin **doğrulanabilir, kuantum güvenli ve
AI farkındalıklı** olmasını istiyorsanız, bunu ifade edebilen tek kit budur —
TypeScript, Python, Go, Rust ve Java dillerinde.

| Farklılaştırıcı | Durum | Neden yalnızca burada mümkün |
| --- | --- | --- |
| **Kuantum güvenli yerleşim makbuzları** | 🟢 Benzersiz (ilk hamle avantajı) | Kuantum sonrası bir L1 gerektirir — PQC olmayan bir temel katmanda imkânsız |
| **QCAI Rollup Copilot** | 🟢 Zincir sayesinde benzersiz | Yalnızca QoreChain'de bulunan zincir üstü AI/RL uç noktalarını sarmalar |
| **Çoklu-VM zincirler arası VM çağrıları** | 🟡 Ayırt edici | QoreChain, EVM + CosmWasm + SVM'yi tek bir zincir altında çalıştırır |

---

## 1. Kuantum güvenli yerleşim makbuzları

> 🟢 **Benzersiz.** Kuantum sonrası olmayan bir L1 üzerine kurulu hiçbir rollup
> kiti bunu sunamaz.

Rollup'ınız bir yerleşim yığınını (settlement batch) sabitlediğinde, QoreChain
onun durum kökünü (state root) Ana Zincire **kuantum sonrası (ML-DSA-87 /
Dilithium-5, FIPS-204)** bir imza altında işler. RDK, bu sabitlemeyi herkesin
**tamamen çevrimdışı** doğrulayabileceği **taşınabilir bir makbuza** dönüştürür
— düğüm yok, kite güven yok, sadece matematik.

Makbuz iki şeyi kanıtlar: yığının durum kökünün sabitlenen kökle aynı olduğunu
(bağlayıcılık) ve sabitlemenin katman oluşturucusunun kayıtlı kuantum sonrası
anahtarıyla imzalandığını (özgünlük). İmza, kanonik mesaj
`layer_id || layer_height(8-byte big-endian) || state_root || validator_set_hash`
üzerini kapsar.

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2);
// pass `endpoints` only to target your own node.
const rdk = createRdkClient({ network: "mainnet" });

// Build a portable receipt for batch #42 of "my-rollup".
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
// → { algorithm: "ML-DSA-87", stateRoot, layerHeight, pqcSignature, creator, ... }

// Verify it — fetches the creator's PQC key from the chain.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);                 // true
console.log(result.checks.pqcSignature);   // Dilithium-5 signature verified
console.log(result.checks.stateRootBinding); // batch root == anchored root
```

**Tamamen çevrimdışı** — makbuzu ve oluşturucunun genel anahtarını herhangi
birine, hava boşluklu (air-gapped) bir makinede bile verin; ağa hiç dokunmadan
doğrulayabilirler:

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

Aynı makbuz **beş dilin tümünde bayt bayt aynı şekilde** doğrulanır
(TypeScript dışındaki istemciler zincirin kendi `qorechain-pqc` kütüphanesini
kullanır); yani bir TypeScript servisinin ürettiği makbuz, bir Go denetleyicisi
veya bir Java arka ucunda birebir aynı şekilde doğrulanır. Bkz.
[Kuantum güvenli yerleşim makbuzları](/rollups/settlement-receipts).

---

## 2. QCAI Rollup Copilot

> 🟢 **Zincir sayesinde benzersiz.** Diğer ağlarda basitçe var olmayan zincir
> üstü AI/RL uç noktaları üzerine inşa edilmiştir.

QoreChain, ağ düzeyinde AI/RL servislerini zincir üstünde çalıştırır — bir
ücret politikası ajanı, ağ önerileri, dolandırıcılık soruşturmaları, devre
kesiciler. Copilot bunları tek bir rollup için tek, incelenebilir, sade dilde
bir görünümde toplar. Salt okunurdur ve elden geldiğince çalışır (best-effort):
bir danışma servisine erişilemezse, hata vermek yerine bir uyarıya düşer.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "mainnet" }); // REST + qor_ JSON-RPC endpoints baked in (RDK ≥ 0.4.2)

const advice = await getRollupAdvice(rdk, "my-rollup");

for (const s of advice.suggestions) {
  console.log(`[${s.level}] ${s.message}`);
  // [action] 2 open fraud investigation(s) reference this rollup …
  // [warn]   QCAI reports network congestion — consider raising the fee …
  // [info]   A live QCAI fee estimate is available …
}

console.log(advice.feeEstimate);          // live QCAI fee estimate
console.log(advice.fraudInvestigations);  // investigations touching this rollup
console.log(advice.rlAgentStatus);        // the RL fee/routing agent's state
```

CLI üzerinden:

```bash
qorollup advise my-rollup
```

Diğer kitlerin sarmalayacak hiçbir şeyi yoktur — danışma verisi bir QoreChain
temel bileşenidir. Bkz. [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Çoklu-VM zincirler arası VM çağrıları

> 🟡 **Ayırt edici.** QoreChain, EVM'yi, CosmWasm'ı ve SVM'yi tek bir zincir
> altında, EVM → CosmWasm arasında köprü kuran bir ön derlenmiş sözleşme
> (precompile) ile çalıştırır.

EVM (Solidity) rollup sözleşmeniz, `0x…0901` adresindeki sabit bir precompile
aracılığıyla mevcut bir **CosmWasm** sözleşmesini çağırabilir. RDK, calldata'yı
sizin için oluşturur; böylece bir CosmWasm oracle'ını, token'ını veya kaydını
yeniden yazmadan Solidity'den yeniden kullanabilirsiniz.

```ts
import { encodeCrossVmCalldata, CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1examplecontract…",       // target CosmWasm contract
  msg: JSON.stringify({ increment: {} }),  // its execute message
});

// Send an EVM transaction:  to = CROSS_VM_PRECOMPILE,  data = calldata
console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

Veya doğrudan rollup'ınızdaki Solidity kodundan:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(string,bytes)", contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

`npm create qorechain-rollup my-app -- --template multivm-rollup` komutuyla bir
başlangıç projesi iskeleti oluşturun. (Yalnızca EVM↔CosmWasm; SVM zincirler
arası çağrıları ayrıdır.) Bkz. [Çoklu-VM](/rollups/multi-vm).

---

## Beklediğiniz diğer her şey

Farklılaştırıcıların ötesinde, RDK standart özellikleri de içerir: paylaşılan
altın vektörlere (golden vectors) karşı doğrulanmış beş yayımlanmış dil
istemcisi, beş hazır profil ve tam uyumluluk matrisi, yerleşim yığını ve yaşam
döngüsü yönetimi, yerel veri erişilebilirliği (data availability), optimistic
rollup'lar için otomatik itiraz eden bir **watchtower** ve `qorollup` operatör
CLI'si.

## Sıradaki

- [Bir Rollup Dağıtmak](/rollups/deploying-a-rollup) — dile göre kurulum ve
  sıfırdan canlı bir testnet rollup'ına.
- [Kuantum güvenli yerleşim makbuzları](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Çoklu-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — derinlemesine incelemeler.
