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

**Bir işlemi yayınlamadan önce zincir üstü yapay zeka ile tarayın** (hedef
ağda yapay zeka precompile'larının etkin olmasını gerektirir; bunlar henüz
genel ağlarda etkin değildir).

QoreChain, yapay zeka risk analizini EVM precompile'ları olarak sunar. SDK
bunları sizin için çağırır ve tek bir çağrıda gas ile birlikte bir
risk/anomali kararı döndürür — böylece bir cüzdan veya dApp, imzalamadan
*önce* uyarabilir (veya engelleyebilir). Yapay zeka precompile'ları mainnet'te
veya testnet'te **henüz etkin değildir** (bkz.
[EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status)).

```ts
import { createEvmClient, simulateWithRiskScore } from "@qorechain/evm";

const { publicClient } = await createEvmClient({ endpoints: { evmRpc } });

const preflight = await simulateWithRiskScore(publicClient, {
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

**Neden farklı:** puanlama, zincir dışı bir servis olarak değil,
deterministik bir precompile olarak *zincirin içinde* çalışacak şekilde
tasarlanmıştır (`aiRiskScore` `0x…0B01` adresinde, `aiAnomalyCheck` `0x…0B02`
adresinde). Bu precompile'lar etkinleştirilene kadar yukarıdaki yardımcılar
genel ağlarda hata verir (`returned no data ("0x")`; testnet'in
etkin üç precompile'ı PQC ve konsensüs olanlarıdır, bunlar değil). Bkz.
[AI pre-flight](/sdk/guides/ai-preflight).

---

## 2. Birleşik VM'ler arası çağrılar — tek hesap, üç VM, tek işlem

**Herhangi bir VM üzerindeki bir sözleşmeyi çağırın ve üç VM'e yayılan
çağrıları atomik olarak paketleyin.**

QoreChain; QoreChain Native, EVM ve SVM sözleşmelerini yerleşik bir VM'ler arası
köprüyle aynı zincir üzerinde çalıştırır. SDK, bunlardan herhangi birini
çağırmak — ve birden fazla VM'ler arası çağrıyı tek seferde imzalanan tek bir
atomik işleme paketlemek — için tek bir arayüz sunar.

```ts
import { connectQueryClients, createCrossVMClient } from "@qorechain/sdk";

// rpcClient: a connected consensus-RPC client (the CosmJS RPC client type).
const crossVM = createCrossVMClient(tx, { query: connectQueryClients(rpcClient).crossvm });

// Call an EVM contract from a native account (payload ABI-encoded for you).
await crossVM.call({
  targetVm: "evm",
  targetContract: "0xToken…",
  evm: { abi, functionName: "transfer", args: [recipient, amount] },
});

// One signature, three VMs, atomic: EVM → SVM → QoreChain Native.
await crossVM.callAtomic([
  { targetVm: "evm", targetContract: "0x…", evm: { abi, functionName: "approve", args } },
  { targetVm: "svm", targetContract: "Prog…", svm: { data } },
  { targetVm: "cosmwasm", targetContract: "qor1…", cosmwasm: { swap: {} } },
]);
```

**Neden farklı:** QoreChain, üç eş-yerleşik VM'i yerleşik bir köprü modülüyle
(`crossvm`, ayrıca etkinleştirildiğinde `CrossVMBridge` precompile'ı; henüz hiçbir ağda etkin değildir)
çalıştırır; böylece tek bir SDK arayüzü üçünü de adresleyebilir. Tek VM'li
zincirlerde sarmalanacak eşdeğer bir şey yoktur. Bugün bir çağrının erişimi,
hedeflediği şerit tarafından sınırlanır: `MsgCrossVMCall` mainnet'te
kapatılmıştır, SVM işlemleri devre dışıdır ve QoreChain Native yükleme ile örnekleme
(instantiate) izne tabidir (testnet'te örnekleme açıktır). Bkz. [Cross-VM calls](/sdk/guides/cross-vm).

---

## 3. Varsayılan olarak kuantum güvenli

**Bir imzalayıcıyı tek bir çağrıyla post-kuantum korumalı hale getirin.**

QoreChain, hibrit post-kuantum imzaları (ML-DSA-87 + klasik) protokol
seviyesinde zorunlu kılar. SDK bunları benimsemeyi tek satırlık bir işleme
dönüştürür: kontrol edin, kaydedin ve hibrit imzalamaya geçin — üstelik
kullanıcılara korunduklarını gösteren bir React rozetiyle birlikte.

```ts
import { ensurePqcRegistered, migrateToHybrid } from "@qorechain/sdk";

// Registers the signer's ML-DSA-87 key on-chain unless the chain already has it:
// it reads the status over REST first and never registers blind.
const rest = "https://api.qore.host";
const { alreadyRegistered, txHash } = await ensurePqcRegistered(tx, { pqcKeypair, rest });

// Switch the signing path to hybrid (classical + post-quantum).
const hybrid = await migrateToHybrid(tx, { pqcKeypair, rest });
await hybrid.signAndBroadcastHybrid({
  registry, signer, messages, fee, chainId, accountNumber, sequence,
  rest: "https://api.qore.host", // resolves the v1/v2 PQC sign-bytes form
  transport,
});
```

```tsx
import { QuantumSafeBadge } from "@qorechain/react";

// Shows a "Quantum-safe" indicator when the address has a registered PQC key
// (read over REST, so it works on the public endpoints from `@qorechain/react` 0.9.0 and later).
<QuantumSafeBadge address={account.address} />
```

**Neden önemli:** post-kuantum kriptografi, QoreChain'in Native yolunda
yerleşik ve zorunludur, bir deney değildir; SDK bunu benimsemeyi bir kayıt
çağrısına ve bir hibrit gönderim yoluna indirger. Kayıt açıktır: ilk işlemde
otomatik kayıt yoktur. Bkz. [Quantum-safe](/sdk/guides/quantum-safe).

---

## 4. Birleşik eth-yerel hesaplar — tek anahtar, üç adres, tek bakiye

**Tek bir `eth_secp256k1` anahtarı, üç şeridin tamamında tek bir 20 baytlık
kimliktir.** (SDK 0.6.0, zincir v3.1.83.) SVM işlem şeridi bugün ağ genelinde
devre dışıdır ve EVM şeridi bir
[yetkilendirme penceresi](/sdk/guides/evm#evm-window) gerektirir; ortak bakiye
ve adres eşlemesi bundan bağımsız olarak geçerlidir.

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key signs on every enabled lane (signHybridEth on the Native path).
```

**Neden benzersiz:** başka yerlerdeki çoklu VM kurulumlarında her çalışma
ortamının kendi hesap alanı vardır ve fonlar şerit bazında sıkışıp kalır.
QoreChain, tek bir 20 baytlık kimliği tek bir ortak bakiyeyle üç farklı
biçimde sunar — bir cüzdan asla "bir şeritte fonu olup diğerinde olmayan"
duruma düşmez. Phantom gibi harici bir cüzdan, bu kimliğe sınırlı yetkili bir
authenticator olarak bağlanabilir ([Authenticator'lar](/sdk/guides/authenticators)). Bkz.
[Unified accounts](/sdk/concepts/accounts-pqc#unified-accounts).

---

## 5. Authenticator şeritleri — PQC'den vazgeçmeden yetkilendirilmiş harcama

**Bağlı bir Phantom veya MetaMask anahtarı, PQC zorunlu kanonik hesaptan,
limitler dahilinde ve bir relayer aracılığıyla harcama yapar.** (SDK 0.7.0,
zincir v3.1.85.)

:::caution Henüz ana ağda kullanılamaz
`abstractaccount` modülü `qorechain-vladi` üzerinde kapalıdır
(`GET /qorechain/abstractaccount/v1/config` `"enabled": false`
döndürür) ve zincir v3.2.0'dan itibaren bu bayrak her yolda zorunlu kılınır;
dolayısıyla ana ağda bir anahtar bağlanamaz ve aşağıdaki şeritler kullanılamaz.
Modül `qorechain-diana` test ağında etkindir (27 Ekim 2026'da kontrol edildi). Bkz.
[Authenticators kılavuzu](/sdk/guides/authenticators).
:::

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

**Neden önemli:** modül etkinleştirildiğinde her harcama, zincir üstü bir izin
taksonomisi, `SpendingRule` limitleri ve bir son kullanma süresiyle
sınırlandırılır — en az ayrıcalık ilkesine uygun ve iptal edilebilir — bu
sırada hesabın kendisi post-kuantum korumalı kalır. Bkz.
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
