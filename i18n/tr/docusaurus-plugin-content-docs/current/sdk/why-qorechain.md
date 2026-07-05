---
slug: /sdk/why
title: Neden QoreChain SDK
sidebar_label: Neden QoreChain SDK
sidebar_position: 2
---

# Neden QoreChain SDK

QoreChain SDK, modern bir çoklu zincir SDK'sının sunduğu her şeyi sunar — her
modül için tipli mesajlar, tipli sorgular, tek bir mnemonic'ten üç VM için
hesaplar, otomatik gas, hata çözümleme, abonelikler, cüzdanlar ve bir React
kiti.

Ancak beş yetenek **yalnızca QoreChain üzerinde mümkündür**, çünkü bunlar başka
hiçbir Layer 1'de bulunmayan protokol özellikleri üzerine inşa edilmiştir:
zincir üstü yapay zeka, yerleşik bir köprüye sahip üç eş-yerleşik VM, zorunlu
post-kuantum kriptografi, üç VM şeridinin tamamında tek bir 20 baytlık kimlik
ve harici cüzdan anahtarları için PQC-güvenli yetkilendirilmiş harcama. Burada
geliştirme yapmanın nedenleri bunlardır.

---

## 1. Yapay zeka ile ön kontrol risk puanlaması

**Bir işlemi yayınlamadan önce zincir üstü yapay zeka ile tarayın.**

QoreChain, yapay zeka risk analizini EVM precompile'ları olarak sunar. SDK
bunları sizin için çağırır ve tek bir çağrıda gas ile birlikte bir
risk/anomali kararı döndürür — böylece bir cüzdan veya dApp, imzalamadan
*önce* uyarabilir (veya engelleyebilir).

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
içinde* çalışır (`aiRiskScore` `0x…0B01` adresinde, `aiAnomalyCheck` `0x…0B02`
adresinde). Diğer ağlar yalnızca zincir dışı, deterministik olmayan yapay zeka
servislerini sonradan ekleyebilir. Bu, bir işlemi imzalanmadan önce yapay zeka
ile tarayan ve zincir üstü bir sonuç veren ilk SDK'dır. Bkz.
[AI pre-flight](/sdk/guides/ai-preflight).

---

## 2. Birleşik VM'ler arası çağrılar — tek hesap, üç VM, tek işlem

**Herhangi bir VM üzerindeki bir sözleşmeyi çağırın ve üç VM'e yayılan
çağrıları atomik olarak paketleyin.**

QoreChain; CosmWasm, EVM ve SVM sözleşmelerini yerleşik bir VM'ler arası
köprüyle aynı zincir üzerinde çalıştırır. SDK, bunlardan herhangi birini
çağırmak — ve birden fazla VM'ler arası çağrıyı tek seferde imzalanan tek bir
atomik işleme paketlemek — için tek bir arayüz sunar.

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

**Neden benzersiz:** QoreChain, üç eş-yerleşik VM'e ve yerleşik bir köprü
modülüne (`crossvm` + `CrossVMBridge` precompile'ı) sahip tek L1'dir. Tek
VM'li zincirler "tek hesap, üç VM, tek atomik işlem" ifadesini
karşılayamaz — SDK'larının saracağı bir şey yoktur. Bir kez yazın, herhangi
bir VM'i çağırın. Bkz. [Cross-VM calls](/sdk/guides/cross-vm).

---

## 3. Varsayılan olarak kuantum güvenli

**Bir imzalayıcıyı tek bir çağrıyla post-kuantum korumalı hale getirin.**

QoreChain, hibrit post-kuantum imzaları (ML-DSA-87 + klasik) protokol
seviyesinde zorunlu kılar. SDK bunları benimsemeyi tek satırlık bir işleme
dönüştürür: kontrol edin, kaydedin ve hibrit imzalamaya geçin — üstelik
kullanıcılara korunduklarını gösteren bir React rozetiyle birlikte.

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

**Neden benzersiz:** post-kuantum kriptografi QoreChain'de yerleşik ve
zorunludur, bir deney değildir. Bu, "varsayılan olarak kuantum güvenli"
özelliğinin tek bir çağrı artı hazır bir rozetten ibaret olduğu ilk SDK'dır.
Bkz. [Quantum-safe](/sdk/guides/quantum-safe).

---

## 4. Birleşik eth-yerel hesaplar — tek anahtar, üç adres, tek bakiye

**Tek bir `eth_secp256k1` anahtarı, üç şeridin tamamında tek bir 20 baytlık
kimliktir.** (SDK 0.6.0, zincir v3.1.83.)

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key spends on every lane (signHybridEth on the Native path).
```

**Neden benzersiz:** başka yerlerdeki çoklu VM kurulumlarında her çalışma
ortamının kendi hesap alanı vardır ve fonlar şerit bazında sıkışıp kalır.
QoreChain, tek bir 20 baytlık kimliği tek bir ortak bakiyeyle üç farklı
biçimde sunar — bir cüzdan asla "bir şeritte fonu olup diğerinde olmayan"
duruma düşmez. `connectPhantomUnified`, bu kimliği bir Phantom imzasından
saklama gerektirmeyen (non-custodial) biçimde bile başlatabilir. Bkz.
[Unified accounts](/sdk/concepts/accounts-pqc#unified-accounts).

---

## 5. Authenticator şeritleri — PQC'den vazgeçmeden yetkilendirilmiş harcama

**Bağlı bir Phantom veya MetaMask anahtarı, PQC zorunlu kanonik hesaptan,
limitler dahilinde ve bir relayer aracılığıyla harcama yapar.** (SDK 0.7.0,
zincir v3.1.85.)

```ts
import { buildPhantomExecuteCosmos } from "@qorechain/sdk";

// The Phantom key signs a domain-separated digest; a relayer pays fees and
// broadcasts. The external key NEVER produces an ML-DSA co-signature.
const msg = await buildPhantomExecuteCosmos({
  wallet: window.solana,
  relayer: relayerAddress,
  chainId: "qorechain-vladi",
  account: canonicalAccount, // the PQC-required owner
  to: recipient,
  amount: "100uqor",
  nonce, // per-authenticator sequence
});
```

**Neden benzersiz:** her harcama, zincir üstü bir izin taksonomisi,
`SpendingRule` limitleri ve bir son kullanma süresiyle sınırlandırılır — en
az ayrıcalık ilkesine uygun ve iptal edilebilir — bu sırada hesabın kendisi
post-kuantum korumalı kalır. Bkz.
[Authenticators & delegated spending](/sdk/guides/authenticators).

---

## Ve dahası da var

Beş ayırt edici özelliğin ötesinde SDK, **TypeScript, Python, Go, Rust ve
Java** genelinde zincirin tüm yüzeyini kapsar: her modül için tipli
composer'lar (`multilayer` aracılığıyla yan zincirler/paychain'ler ve `rdk`
aracılığıyla rollup'lar dahil), tipli sorgular, işlem yaşam döngüsü,
abonelikler, tarayıcı cüzdanları ve
[`@qorechain/react`](/sdk/guides/react) hooks kiti.

Geliştirmeye hazır mısınız? [Quickstart](/sdk/quickstart) ile başlayın.
