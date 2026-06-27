---
slug: /sdk/overview
title: QoreChain SDK Genel Bakış
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QoreChain SDK

QoreChain SDK, **QoreChain** üzerinde merkeziyetsiz uygulamalar geliştirmek için
kullanılan resmi, çok dilli geliştirici kitidir — kuantum güvenli, üçlü VM'li bir
Katman 1 ağıdır.

Bu dokümantasyon, SDK'nın nasıl kurulacağını, ağa nasıl bağlanılacağını, zincir
üstü durumun nasıl okunacağını, hesapların nasıl türetileceğini, işlemlerin nasıl
imzalanıp gönderileceğini ve QoreChain'in sanal makinelerinin her biriyle nasıl
çalışılacağını kapsar.

## QoreChain nedir?

QoreChain, tek bir zincir üzerinde üç birinci sınıf akıllı sözleşme çalışma
zamanına sahip bir Katman 1 blok zinciridir:

- **CosmWasm** — Cosmos SDK aracılığıyla Wasm akıllı sözleşmeleri.
- **QoreChain EVM Engine** — Ethereum uyumlu yürütme (Solidity, viem,
  standart JSON-RPC).
- **SVM** — Solana tarzı bir JSON-RPC içeren, Solana uyumlu bir çalışma zamanı.

Hesaplar, bakiyeler ve token'lar çalışma zamanları arasında paylaşılır ve zincir,
zincirler arası birlikte çalışabilirlik için IBC'yi destekler.

### Tasarım gereği kuantum güvenli

QoreChain, **ML-DSA-87** (Dilithium-5, FIPS 204) tabanlı kuantum sonrası
kriptografi (PQC) ilkellerini sağlar. Klasik secp256k1 imzalamanın yanı sıra,
zincir bir **hibrit** imzalama duruşunu destekler; bu duruşta bir işlem *hem* bir
klasik imza *hem de* bir kuantum sonrası imza taşır, böylece bugün klasik
doğrulama altında geçerli kalırken kuantum sonrası koruma da kazanır.

SDK, bugün ML-DSA-87 anahtar üretimini, imzalamayı ve doğrulamayı, ayrıca hibrit
işlemler için yapı taşlarını sunar. Ayrıntılar için
[Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc) bölümüne bakın. Burada
pazarlama iddiaları yok — SDK, zincirin uyguladığı ilkelleri tam olarak sunar.

## Bu SDK'yı farklı kılan nedir

Tam çoklu zincir paritesinin ötesinde, üç yetenek **yalnızca QoreChain'de
mümkündür**, çünkü bunlar başka hiçbir Katman 1 ağının sahip olmadığı protokol
özellikleri üzerine inşa edilmiştir:

- **Yapay zekâ ön uçuş risk puanlaması** — bir işlemi yayınlamadan önce zincir
  üstü yapay zekâ ile tarayın. `simulateWithRiskScore`, deterministik EVM
  precompile'larından gaz değeriyle birlikte bir risk/anomali kararı döndürür,
  böylece bir cüzdan veya dApp imzalamadan *önce* uyarabilir (ya da engelleyebilir).
  [Yapay zekâ ön uçuş](/sdk/guides/ai-preflight) bölümüne bakın.
- **Birleşik VM'ler arası çağrılar** — tek hesap, üç VM, tek işlem.
  `createCrossVMClient` herhangi bir VM üzerindeki bir sözleşmeyi çağırır ve
  `callAtomic`, birden çok VM'ler arası çağrıyı bir kez imzalanan tek bir atomik
  işlemde paketler. [VM'ler arası çağrılar](/sdk/guides/cross-vm) bölümüne bakın.
- **Kuantum güvenli DX** — bir imzalayıcıyı tek bir idempotent çağrıyla kuantum
  sonrası korumalı hale getirin (`ensurePqcRegistered` / `migrateToHybrid`),
  hazır bir React rozetiyle birlikte. [Kuantum güvenli](/sdk/guides/quantum-safe)
  bölümüne bakın.

Yeni bir **`@qorechain/react`** kiti (provider, hook'lar, `ConnectButton`,
`QuantumSafeBadge`), kuantum güvenli bir dApp geliştirmeyi varsayılan yol haline
getirir — bkz. [React kit kılavuzu](/sdk/guides/react). Tüm gerekçe için
[Neden QoreChain SDK](/sdk/why) bölümünü okuyun.

## SDK ailesi

SDK, kendi tercih ettiğiniz dilde geliştirme yapabilmeniz için bir paket ailesi
olarak sunulur. Aynı ağ ön ayarlarını, türetme şemalarını, denominasyon
matematiğini ve okuma yüzeylerini paylaşırlar.

| Paket | Dil | Kurulum | Durum |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Yayınlandı (npm, v0.5.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (`qorsdk` olarak import edilir) | Yayınlandı (PyPI, v0.5.0) |
| `qorechain-sdk` (Go modülü) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Yayınlandı (Go proxy, v0.5.0) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` | Yayınlandı (crates.io, v0.5.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.5.0` | Yayınlandı (Maven Central, v0.5.0) |
| `@qorechain/evm` | TypeScript (EVM adaptörü) | `npm i @qorechain/evm viem` | Yayınlandı (npm, v0.5.0) |
| `@qorechain/svm` | TypeScript (SVM adaptörü) | `npm i @qorechain/svm @solana/web3.js` | Yayınlandı (npm, v0.5.0) |
| `@qorechain/react` | TypeScript (React kiti) | `npm i @qorechain/react` | Yayınlandı (npm, v0.5.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Yayınlandı (npm, v0.5.0) |

> Python dağıtımı `qorechain-sdk` olarak kurulur ancak **`qorsdk` olarak import
> edilir**. Tüm istemciler ilgili kayıt defterlerine yayınlanmıştır — dile özgü
> komutlar için [Kurulum](/sdk/install) bölümüne bakın.

TypeScript çekirdeği (`@qorechain/sdk`), bu dokümantasyondaki örneklerin
temelidir. Python, Go, Rust ve Java istemcileri, TypeScript ile **tam yerel
zincir paritesine** ulaşır: ağ ön ayarları, denom/adres yardımcıları, HD hesap
türetme (yerel/EVM/SVM), PQC (ML-DSA-87) imzalama, her özel modül ile standart
Cosmos modülleri için tipli mesaj oluşturucular, tipli sorgu istemcileri, eksiksiz
işlem yaşam döngüsü (otomatik gaz, hata çözümleme, tx izleme, blok/tx arama),
hibrit kuantum sonrası işlemler ve WebSocket abonelikleri. Tüm bu istemciler
**yayınlanmıştır**: TypeScript npm'e (`@qorechain/sdk` 0.5.0), Python PyPI'ya
(`qorechain-sdk` 0.5.0, `qorsdk` olarak import edilir), Go modül proxy'sine
(`.../packages/go` 0.5.0), Rust crates.io'ya (`qorechain-sdk` 0.5.0) ve Java
Maven Central'a (`io.github.qorechain:qorechain-sdk` 0.5.0). EVM/SVM yürütme
adaptörleri (`@qorechain/evm`, `@qorechain/svm`, her ikisi de 0.5.0),
`@qorechain/react` kiti (0.5.0) ve `create-qorechain-dapp` iskele CLI'si yalnızca
TypeScript içindir ve aynı şekilde npm'e yayınlanmıştır.

v0.4 sürümü, rollup para çekme işlemlerini (`MsgExecuteWithdrawal`, L2→L1 çıkış
yolu), `multilayer`, `rdk` ve `bridge` modülleri için tipli sorgu istemcilerini,
köprü yönetici mesajlarını ve beş dilin tamamında üst düzey
yan zincir/ödeme zinciri ve rollup yardımcılarını ekledi.

## Sırada ne var

- [Neden QoreChain SDK](/sdk/why) — QoreChain'e özgü üç yetenek.
- [Kurulum](/sdk/install) — dile özgü kurulum talimatları.
- [Hızlı başlangıç](/sdk/quickstart) — bağlanın, bir bakiye okuyun, bir transfer gönderin.
- [Kavramlar: Mimari](/sdk/concepts/architecture) — üçlü VM modeli.
- [Kavramlar: Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc) — anahtarlar ve
  kuantum sonrası imzalama.
- [Kılavuzlar](/sdk/guides/evm) — VM'ye özgü nasıl yapılır rehberleri.
- [Ağ ve uç nokta referansı](/sdk/reference/network) — zincir kimliği, portlar, token.
- [Örnekler](/sdk/examples) — çalıştırılabilir, kopyalanıp yapıştırılabilir kod parçaları.
- [Ağ ve uç nokta referansı](/sdk/reference/network) ayrıca [Ağlar](/appendix/networks) bölümünde de yer alır.
