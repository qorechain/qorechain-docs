---
slug: /rollups/why
title: QoreChain RDK Neden
sidebar_label: QoreChain RDK Neden
sidebar_position: 2
---

# QoreChain RDK Neden

Çoğu rollup geliştirme kiti aynı temanın varyasyonlarıdır: bir temel katmana
(base layer) çözüm üreten (settle) bir uygulama-zinciri (app-chain) başlatmanıza
yardımcı olurlar. QoreChain RDK de bunu yapar — ancak **başka hiçbir rollup
kitinin yapamayacağı** üç şeyi de açığa çıkarır, çünkü bunlar araçlarda değil,
QoreChain'in Katman 1'inde (Layer 1) bulunan yeteneklere dayanır:

- bir **post-kuantum (post-quantum)** çözüm katmanı,
- **zincir üstü AI/RL** danışma ilkelleri (QCAI) ve
- VM'ler arası çağrılarla bir **üçlü-VM (triple-VM)** çalışma zamanı (runtime).

Yalnızca genel bir optimistic/zk rollup'a ihtiyacınız varsa, herhangi bir kit iş
görür. Rollup'ınızın çözümünün **doğrulanabilir, kuantuma dayanıklı ve AI
farkında** olmasını istiyorsanız, bunu ifade edebilen tek kit budur — TypeScript,
Python, Go, Rust ve Java dillerinde.

| Ayırt edici özellik | Durum | Neden yalnızca burada mümkün |
| --- | --- | --- |
| **Kuantuma dayanıklı çözüm makbuzları** | 🟢 Benzersiz (ilk hamleci) | Post-kuantum bir L1 gerektirir — PQC olmayan bir temel katmanda imkansız |
| **QCAI Rollup Copilot** | 🟢 Zincir aracılığıyla benzersiz | Yalnızca QoreChain'e özgü zincir üstü AI/RL uç noktalarını sarmalar |
| **Çoklu-VM, VM'ler arası çağrılar** | 🟡 Ayırt edici | QoreChain, EVM + CosmWasm + SVM'yi tek bir zincir altında çalıştırır |

---

## 1. Kuantuma dayanıklı çözüm makbuzları

> 🟢 **Benzersiz.** Post-kuantum olmayan bir L1 üzerine inşa edilmiş hiçbir
> rollup kiti bunu sunamaz.

Rollup'ınız bir çözüm yığınını (settlement batch) çapaladığında, QoreChain onun
durum kökünü (state root) Ana Zincire (Main Chain) bir **post-kuantum
(ML-DSA-87 / Dilithium-5, FIPS-204)** imzası altında işler (commit). RDK, o çapayı
herkesin **tamamen çevrimdışı** doğrulayabileceği **taşınabilir bir makbuza**
dönüştürür — node yok, kite güven yok, sadece matematik.

Makbuz iki şeyi kanıtlar: yığının durum kökünün çapalanmış olan kök olduğunu
(bağlama) ve çapanın katman oluşturucunun kayıtlı post-kuantum anahtarı tarafından
imzalandığını (özgünlük). İmza, kanonik mesajı kapsar:
`layer_id || layer_height(8-byte big-endian) || state_root || validator_set_hash`.

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.network" }, // your QoreChain node REST
});

// Build a portable receipt for batch #42 of "my-rollup".
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
// → { algorithm: "ML-DSA-87", stateRoot, layerHeight, pqcSignature, creator, ... }

// Verify it — fetches the creator's PQC key from the chain.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);                 // true
console.log(result.checks.pqcSignature);   // Dilithium-5 signature verified
console.log(result.checks.stateRootBinding); // batch root == anchored root
```

**Tamamen çevrimdışı** — makbuzu ve oluşturucunun açık anahtarını, hava boşluklu
(air-gapped) bir makinedeki herhangi birine verin; ağa hiç dokunmadan onu
doğrulayabilirler:

```ts
const result = await verifySettlementReceipt(receipt, {
  creatorPublicKey: "a1b2…", // the layer creator's ML-DSA-87 key (hex)
});
// result.valid === true, with zero network calls
```

Aynı makbuz **beş dilin tamamında bayt-bayt (byte-for-byte)** doğrulanır
(TypeScript olmayan istemciler zincirin kendi `qorechain-pqc` kütüphanesini
kullanır), böylece bir TypeScript hizmeti tarafından üretilen bir makbuz, bir Go
denetçisinde veya bir Java arka ucunda aynı şekilde doğrulanır. Bkz.
[Kuantuma dayanıklı çözüm makbuzları](/rollups/settlement-receipts).

---

## 2. QCAI Rollup Copilot

> 🟢 **Zincir aracılığıyla benzersiz.** Diğer ağların yalnızca sahip olmadığı
> zincir üstü AI/RL uç noktaları üzerine inşa edilmiştir.

QoreChain, zincir üstünde ağ düzeyinde AI/RL hizmetleri çalıştırır — bir ücret
politikası ajanı, ağ önerileri, hile soruşturmaları, devre kesiciler. Copilot
bunları tek bir rollup için tek, incelenebilir, sade dilde bir görünümde toplar.
Salt okunur ve en iyi çabaya dayalıdır (best-effort): bir danışma hizmetine
erişilemiyorsa, başarısız olmak yerine bir uyarıya geriler.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "mainnet", endpoints: { rest, evmRpc } });

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

CLI'den:

```bash
qorollup advise my-rollup
```

Diğer kitlerin sarmalayacak hiçbir şeyi yoktur — danışma verisi bir QoreChain
ilkelidir. Bkz. [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Çoklu-VM, VM'ler arası çağrılar

> 🟡 **Ayırt edici.** QoreChain, EVM, CosmWasm ve SVM'yi tek bir zincir altında
> çalıştırır ve EVM → CosmWasm köprüsü kuran bir precompile içerir.

EVM (Solidity) rollup sözleşmeniz, `0x…0901` adresindeki sabit bir precompile
aracılığıyla mevcut bir **CosmWasm** sözleşmesini çağırabilir. RDK, calldata'yı
sizin için oluşturur, böylece bir CosmWasm oracle'ını, token'ını veya kayıt
defterini (registry) yeniden uygulamadan Solidity'den yeniden kullanabilirsiniz.

```ts
import { encodeCrossVmCalldata, CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1examplecontract…",       // target CosmWasm contract
  msg: JSON.stringify({ increment: {} }),  // its execute message
});

// Send an EVM transaction:  to = CROSS_VM_PRECOMPILE,  data = calldata
console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

Veya rollup'ınızda doğrudan Solidity'den:

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

`npm create qorechain-rollup my-app -- --template multivm-rollup` ile bir başlangıç
şablonu oluşturun. (Yalnızca EVM↔CosmWasm; SVM VM'ler arası çağrıları ayrıdır.)
Bkz. [Çoklu-VM](/rollups/multi-vm).

---

## Beklediğiniz diğer her şey

Ayırt edici özelliklerin ötesinde, RDK temel gereksinimleri de sağlar: paylaşılan
altın vektörlere (golden vectors) karşı doğrulanmış beş yayınlanmış dil istemcisi,
beş hazır profil ve tam uyumluluk matrisi, çözüm-yığını ve yaşam döngüsü yönetimi,
yerel veri kullanılabilirliği (data availability), optimistic rollup'lar için bir
**watchtower** otomatik itiraz aracı ve `qorollup` operatör CLI'si.

## Sonraki

- [Bir Rollup Dağıtma](/rollups/deploying-a-rollup) — dile özel kurulum ve
  sıfırdan canlı bir testnet rollup'a.
- [Kuantuma dayanıklı çözüm makbuzları](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Çoklu-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — derinlemesine incelemeler.
