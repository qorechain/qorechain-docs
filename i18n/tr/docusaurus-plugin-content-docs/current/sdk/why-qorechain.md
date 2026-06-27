---
slug: /sdk/why
title: QoreChain SDK Neden
sidebar_label: QoreChain SDK Neden
sidebar_position: 2
---

# QoreChain SDK Neden

QoreChain SDK, modern bir çok zincirli (multi-chain) SDK'nin sunduğu her şeyi
size verir — her modül için tipli mesajlar, tipli sorgular, tek bir mnemonic'ten
üç VM için hesaplar, otomatik gas, hata çözümleme, abonelikler, cüzdanlar ve bir
React kiti.

Ancak üç yetenek **yalnızca QoreChain üzerinde mümkündür**, çünkü bunlar başka
hiçbir Layer 1'in sahip olmadığı protokol özellikleri üzerine inşa edilmiştir:
zincir üstü yapay zeka, yerel bir köprüye sahip üç birlikte yerleşik VM ve
zorunlu kuantum sonrası kriptografi. Burada geliştirme yapmanın nedenleri
bunlardır.

---

## 1. Yapay zeka destekli ön kontrol risk puanlaması

**Bir işlemi yayınlamadan önce zincir üstü yapay zeka ile tarayın.**

QoreChain, yapay zeka risk analizini EVM precompile'ları olarak sunar. SDK
bunları sizin için çağırır ve tek bir çağrıda gas ile birlikte bir risk/anomali
kararı döndürür — böylece bir cüzdan veya dApp, imzalama *öncesinde* uyarabilir
(ya da engelleyebilir).

```ts
import { createClient } from "@qorechain/sdk";
import { simulateWithRiskScore } from "@qorechain/evm";

const client = createClient({ network: "mainnet", endpoints: { evmRpc } });

const preflight = await simulateWithRiskScore(client.evm, {
  from: account.address,
  to: contractAddress,
  data: calldata,
  value: 0n,
});

console.log(preflight.gas);            // estimated gas
console.log(preflight.risk.level);     // on-chain risk level
console.log(preflight.anomaly.flagged);// anomalous pattern?
if (!preflight.safe) {
  // advisory verdict — set your own policy
  console.warn("Transaction flagged by on-chain AI risk scoring");
}
```

**Neden benzersiz:** puanlama, deterministik bir precompile olarak *zincirin
içinde* çalışır (`0x…0B01` adresindeki `aiRiskScore`, `0x…0B02` adresindeki
`aiAnomalyCheck`). Diğer ağlar yalnızca zincir dışı, deterministik olmayan yapay
zeka hizmetlerini sonradan ekleyebilir. Bu, bir işlemi imzalanmadan önce zincir
üstü bir sonuçla yapay zeka ile tarayan ilk SDK'dir. Bkz.
[Yapay zeka ön kontrolü](/sdk/guides/ai-preflight).

---

## 2. Birleşik VM'ler arası çağrılar — tek hesap, üç VM, tek işlem

**Herhangi bir VM üzerindeki bir sözleşmeyi çağırın ve üçü arasında atomik olarak
çağrıları toplu işleyin.**

QoreChain, aynı zincir üzerinde CosmWasm, EVM ve SVM sözleşmelerini yerel bir
VM'ler arası köprüyle çalıştırır. SDK, bunlardan herhangi birini çağırmak — ve
birden fazla VM'ler arası çağrıyı bir kez imzalanan tek bir atomik işlemde
paketlemek — için tek bir arabirim sunar.

```ts
import { createCrossVMClient } from "@qorechain/sdk";

const crossVM = createCrossVMClient(tx, { query: client.query });

// Call an EVM contract from a native account (payload ABI-encoded for you).
await crossVM.call({
  targetVm: "evm",
  targetContract: "0xToken…",
  evm: { abi, functionName: "transfer", args: [recipient, amount] },
});

// One signature, three VMs, atomic: EVM → SVM → CosmWasm.
await crossVM.callAtomic([
  { targetVm: "evm", targetContract: "0x…", evm: { abi, functionName: "approve", args } },
  { targetVm: "svm", targetContract: "Prog…", svm: { data } },
  { targetVm: "cosmwasm", targetContract: "qor1…", cosmwasm: { swap: {} } },
]);
```

**Neden benzersiz:** QoreChain, üç birlikte yerleşik VM'ye ve yerel bir köprü
modülüne (`crossvm` + `CrossVMBridge` precompile'ı) sahip tek L1'dir. Tek VM'li
zincirler "tek hesap, üç VM, tek atomik işlem" ifadesini kuramaz — SDK'lerinin
sarmalayacağı bir şey yoktur. Bir kez yazın, herhangi bir VM'yi çağırın. Bkz.
[VM'ler arası çağrılar](/sdk/guides/cross-vm).

---

## 3. Varsayılan olarak kuantum güvenli

**Bir imzalayıcıyı tek bir çağrıyla kuantum sonrası korumalı hale getirin.**

QoreChain, hibrit kuantum sonrası imzaları (ML-DSA-87 + klasik) protokol
düzeyinde zorunlu kılar. SDK, bunları benimsemeyi tek satıra indirger: hibrit
imzalamayı kontrol edin, kaydedin ve buna geçin — kullanıcılara korunduklarını
göstermek için bir React rozetiyle.

```ts
import { ensurePqcRegistered, migrateToHybrid } from "@qorechain/sdk";

// Idempotent: registers the signer's ML-DSA-87 key on-chain if not already.
const { alreadyRegistered, txHash } = await ensurePqcRegistered(tx, { pqcKeypair });

// Switch the signing path to hybrid (classical + post-quantum).
const hybrid = await migrateToHybrid(tx, { pqcKeypair });
await hybrid.send(messages);
```

```tsx
import { QuantumSafeBadge } from "@qorechain/react";

// Shows a "Quantum-safe" indicator when the address has a registered PQC key.
<QuantumSafeBadge address={account.address} />
```

**Neden benzersiz:** kuantum sonrası kriptografi QoreChain üzerinde yereldir ve
zorunludur, bir deney değildir. Bu, "varsayılan olarak kuantum güvenli" ifadesinin
tek bir çağrı ile birlikte hazır bir rozetten ibaret olduğu ilk SDK'dir. Bkz.
[Kuantum güvenli](/sdk/guides/quantum-safe).

---

## Diğer her şey de

Üç ayırt edici özelliğin ötesinde SDK, tüm zincir yüzeyini
**TypeScript, Python, Go, Rust ve Java** genelinde kapsar: her modül için tipli
composer'lar (`multilayer` aracılığıyla sidechain'ler/paychain'ler ve `rdk`
aracılığıyla rollup'lar dahil), tipli sorgular, işlem yaşam döngüsü, abonelikler,
tarayıcı cüzdanları ve [`@qorechain/react`](/sdk/guides/react) hook kiti.

Geliştirmeye hazır mısınız? [Hızlı başlangıç](/sdk/quickstart) ile başlayın.
