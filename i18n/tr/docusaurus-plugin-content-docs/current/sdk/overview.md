---
slug: /sdk/overview
title: QoreChain SDK Genel Bakış
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QoreChain SDK

QoreChain SDK, kuantum güvenli, üçlü sanal makineli (triple-VM) bir Katman 1
ağı olan **QoreChain** üzerinde merkeziyetsiz uygulamalar geliştirmek için
sunulan resmi çok dilli geliştirici kitidir.

Bu dokümantasyon; SDK'nın nasıl kurulacağını, ağa nasıl bağlanılacağını,
zincir üzerindeki durumun nasıl okunacağını, hesapların nasıl türetileceğini,
işlemlerin nasıl imzalanıp gönderileceğini ve QoreChain'in her bir sanal
makinesiyle nasıl çalışılacağını kapsar.

## QoreChain nedir?

QoreChain, tek bir zincir üzerinde üç birinci sınıf akıllı sözleşme çalışma
ortamına sahip bir Katman 1 blokzinciridir:

- **CosmWasm** — Cosmos SDK aracılığıyla Wasm akıllı sözleşmeleri.
- **QoreChain EVM Engine** — Ethereum uyumlu yürütme (Solidity, viem,
  standart JSON-RPC).
- **SVM** — Solana tarzı JSON-RPC'ye sahip, Solana uyumlu bir çalışma ortamı.

Hesaplar, bakiyeler ve token'lar çalışma ortamları arasında paylaşılır ve
zincir, zincirler arası birlikte çalışabilirlik için IBC'yi destekler.

### Tasarım gereği kuantum güvenli

QoreChain, **ML-DSA-87** (Dilithium-5, FIPS 204) tabanlı post-kuantum
kriptografi (PQC) ilkelerini sunar. Klasik secp256k1 imzalamanın yanı sıra
zincir, bir işlemin *hem* klasik bir imza *hem de* post-kuantum bir imza
taşıdığı **hibrit** bir imzalama duruşunu destekler; böylece işlem bugün
klasik doğrulama altında geçerli kalırken post-kuantum koruması da kazanır.

SDK bugün ML-DSA-87 anahtar üretimini, imzalamayı ve doğrulamayı, ayrıca
hibrit işlemler için yapı taşlarını sunar. Ayrıntılar için
[Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc) sayfasına bakın.
Burada pazarlama iddiası yoktur — SDK, tam olarak zincirin uyguladığı
ilkeleri sunar.

## Bu SDK'yı farklı kılan nedir

Tam çoklu zincir eşitliğinin ötesinde, üç yetenek **yalnızca QoreChain
üzerinde mümkündür**; çünkü bunlar başka hiçbir Katman 1'de bulunmayan
protokol özellikleri üzerine inşa edilmiştir:

- **AI ile ön kontrol risk puanlaması** — bir işlemi yayınlamadan önce
  zincir üzerindeki AI ile tarayın. `simulateWithRiskScore`, deterministik
  EVM precompile'larından gelen gaz artı bir risk/anomali kararı döndürür;
  böylece bir cüzdan veya dApp, imzalamadan *önce* uyarabilir (veya
  engelleyebilir). Bkz. [AI ön kontrolü](/sdk/guides/ai-preflight).
- **Birleşik VM'ler arası çağrılar** — tek hesap, üç VM, tek işlem.
  `createCrossVMClient` herhangi bir VM üzerindeki bir sözleşmeyi çağırır ve
  `callAtomic`, birden fazla VM'ler arası çağrıyı tek seferde imzalanan tek
  bir atomik işlemde paketler. Bkz.
  [VM'ler arası çağrılar](/sdk/guides/cross-vm).
- **Kuantum güvenli geliştirici deneyimi (DX)** — bir imzalayıcıyı tek bir
  idempotent çağrıyla (`ensurePqcRegistered` / `migrateToHybrid`)
  post-kuantum korumalı hale getirin; hazır bir React rozetiyle birlikte.
  Bkz. [Kuantum güvenli](/sdk/guides/quantum-safe).

0.6.0 ve 0.7.0 ile zincir düzeyinde iki yetenek daha geldi:

- **Birleşik eth-native hesaplar** — tek bir `eth_secp256k1` anahtarı;
  `qor1…`, `0x…` ve bir SVM base58 adresi olarak gösterilen, hepsi tek bir
  bakiyeyi paylaşan 20 baytlık tek bir kimliktir. Bkz.
  [Birleşik hesaplar](/sdk/concepts/accounts-pqc#unified-accounts).
- **Authenticator şeritleri** — bir Phantom veya MetaMask anahtarını
  PQC gerektiren kanonik hesaba bağlayın ve en az yetki ilkesine dayalı,
  harcama limitli, iptal edilebilir koşullar altında bir relayer üzerinden
  harcama yapmasına izin verin. Bkz.
  [Authenticator'lar ve yetkilendirilmiş harcama](/sdk/guides/authenticators).

Yeni **`@qorechain/react`** kiti (provider, hook'lar, `ConnectButton`,
`QuantumSafeBadge`), kuantum güvenli bir dApp geliştirmeyi varsayılan yol
haline getirir — bkz. [React kiti rehberi](/sdk/guides/react). Konunun
tamamı için [Neden QoreChain SDK](/sdk/why) sayfasını okuyun.

## SDK ailesi

SDK, tercih ettiğiniz dilde geliştirme yapabilmeniz için bir paket ailesi
olarak sunulur. Bu paketler aynı ağ ön ayarlarını, türetme şemalarını,
birim (denominasyon) matematiğini ve okuma yüzeylerini paylaşır.

| Paket | Dil | Kurulum | Durum |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Yayında (npm, v0.7.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (import `qorsdk`) | Yayında (PyPI, v0.7.0) |
| `qorechain-sdk` (Go modülü) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Yayında (Go proxy, etiket `packages/go/v0.7.0`) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` (import `qorechain`) | Yayında (crates.io, yayınlanmış en son sürüm; 0.7.0 depodan) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.7.0` | Yayında (Maven Central, v0.7.0) |
| `@qorechain/evm` | TypeScript (EVM adaptörü) | `npm i @qorechain/evm viem` | Yayında (npm, v0.7.0) |
| `@qorechain/svm` | TypeScript (SVM adaptörü) | `npm i @qorechain/svm @solana/web3.js` | Yayında (npm, v0.7.0) |
| `@qorechain/react` | TypeScript (React kiti) | `npm i @qorechain/react` | Yayında (npm, v0.7.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Yayında (npm, v0.7.0) |

> Python dağıtımı `qorechain-sdk` olarak kurulur ancak **`qorsdk` olarak
> import edilir**. Tüm istemciler kendi kayıt defterlerinde yayınlanmıştır —
> dillere göre komutlar için [Kurulum](/sdk/install) sayfasına bakın.

TypeScript çekirdeği (`@qorechain/sdk`), bu dokümantasyondaki örneklerin
temelidir. Python, Go, Rust ve Java istemcileri TypeScript ile **tam yerel
zincir eşitliğine** ulaşır: ağ ön ayarları, denom/adres yardımcı araçları,
HD hesap türetme (native/EVM/SVM), PQC (ML-DSA-87) imzalama, her özel modül
ve standart Cosmos modülleri için tipli mesaj oluşturucular, tipli sorgu
istemcileri, eksiksiz işlem yaşam döngüsü (otomatik gaz, hata çözümleme,
işlem takibi, blok/işlem arama), hibrit post-kuantum işlemler ve WebSocket
abonelikleri. Bu istemcilerin tümü **yayınlanmıştır**: TypeScript npm'de
(`@qorechain/sdk` 0.7.0), Python PyPI'da (`qorechain-sdk` 0.7.0, import
`qorsdk`), Go modül proxy'sinde (etiket `packages/go/v0.7.0`), Rust
crates.io'da (`qorechain-sdk`, yayınlanmış en son sürüm — 0.7.0 crate
yayını beklemede olduğundan crates.io'dan veya depodan kurun) ve Java Maven
Central'da (`io.github.qorechain:qorechain-sdk` 0.7.0). EVM/SVM yürütme
adaptörleri (`@qorechain/evm`, `@qorechain/svm`, ikisi de 0.7.0),
`@qorechain/react` kiti (0.7.0) ve `create-qorechain-dapp` iskele oluşturma
CLI'si (0.7.0) yalnızca TypeScript içindir ve aynı şekilde npm'de
yayınlanmıştır.

## 0.6 ve 0.7'deki yenilikler

**0.6.0 — birleşik eth-native hesaplar (zincir v3.1.83).** Tek bir
`eth_secp256k1` anahtarı, üç adres kodlamasının tümü olarak gösterilen ve
her şeritte tek bir harcanabilir bakiyeyi paylaşan 20 baytlık tek bir
kimliktir:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"   (bech32, Native lane)
account.evm;    // "0x…"     (EIP-55, EVM lane)
account.svm;    // base58    (20 bytes + 12 zero bytes)
```

Aynı anahtarla yerel şerit (Native lane) imzalaması `signClassicalEth` /
`signHybridEth` ile yapılır ve `connectPhantomUnified`, deterministik bir
Phantom imzasından gözetimsiz (non-custodial) birleşik bir hesap türetir.
Eski coin-type-118 `deriveNativeAccount` değişmemiştir. Bkz.
[Birleşik hesaplar](/sdk/concepts/accounts-pqc#unified-accounts).

**0.6.1 — mutabakat açısından kritik düzeltme.** `PQCHybridSignature`
işlem gövdesi uzantısı artık protobuf ile kodlanıyor (daha önce JSON ile
kodlanıyordu ve CheckTx aşamasında reddediliyordu). SDK ≤ 0.6.0 ile
oluşturulan hibrit işlemler **zincir üzerinde reddedilir** — yükseltme
yapın.

**0.7.0 — authenticator şeritleri (zincir v3.1.85).** Bağlanmış bir Phantom
(ed25519) veya MetaMask (secp256k1, 20 baytlık adresle) anahtarı, en az
yetki ilkesine dayalı, harcama limitli, iptal edilebilir koşullar altında
bir relayer üzerinden PQC gerektiren kanonik hesaptan harcama yapabilir:
`MsgExecuteEVM` / `MsgExecuteCosmos` / `MsgRotatePQCKey` oluşturucular,
bayt düzeyinde birebir `evmAuthSignBytes` / `cosmosAuthSignBytes` /
`rotationSignBytes` yardımcıları, `permissionSchema` sorgusu, çözümlenmiş
hata kodları ve TypeScript cüzdan oluşturucuları
(`buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm`, …).
Kopyala-yapıştır örneklerle eksiksiz anlatım:
[Authenticator'lar ve yetkilendirilmiş harcama](/sdk/guides/authenticators).

## Sonraki adımlar

- [Neden QoreChain SDK](/sdk/why) — QoreChain'e özgü beş yetenek.
- [Kurulum](/sdk/install) — dillere göre kurulum talimatları.
- [Hızlı başlangıç](/sdk/quickstart) — bağlanın, bir bakiye okuyun, bir
  transfer gönderin.
- [Kavramlar: Mimari](/sdk/concepts/architecture) — üçlü VM modeli.
- [Kavramlar: Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc) —
  anahtarlar ve post-kuantum imzalama.
- [Rehberler](/sdk/guides/evm) — VM'lere göre nasıl yapılır kılavuzları.
- [Authenticator'lar ve yetkilendirilmiş harcama](/sdk/guides/authenticators) —
  bir relayer üzerinden harcama yapan bağlı Phantom/MetaMask anahtarları.
- [Ağ ve uç noktalar referansı](/sdk/reference/network) — zincir kimliği,
  portlar, token.
- [Örnekler](/sdk/examples) — çalıştırılabilir, kopyala-yapıştır kod
  parçacıkları.
- [Ağ ve uç noktalar referansı](/sdk/reference/network) ayrıca
  [Ağlar](/appendix/networks) sayfasında da yer alır.
