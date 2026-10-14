---
slug: /sdk/concepts/architecture
title: Mimari ve Kavramlar
sidebar_label: Mimari
sidebar_position: 1
---

# Mimari ve kavramlar

QoreChain, paylaşılan hesaplar ve paylaşılan bir token ile üç akıllı sözleşme
sanal makinesini (virtual machine) yan yana çalıştıran tek bir Katman 1 (Layer 1)
zinciridir.

## Üçlü-VM modeli

| VM | Sözleşmeler | SDK'daki istemci yüzeyi |
| --- | --- | --- |
| **CosmWasm** | Rust/Wasm sözleşmeleri | `client.cosmwasm()` ve `@qorechain/sdk`'daki `queryContractSmart` / `execute` yardımcıları |
| **QoreChain EVM Engine** | Solidity / Vyper | `@qorechain/evm` (bir viem adaptörü) |
| **SVM** | Solana programları | `@qorechain/svm` (bir `@solana/web3.js` adaptörü) |

Yerel (Cosmos) katman, banka transferlerini, staking'i, yönetişimi (governance) ve
çalışma zamanları arasında mesajları yönlendiren `x/crossvm` modülünü yönetir.

## Okuma yüzeyleri

SDK, bir node ile birkaç uç nokta aracılığıyla iletişim kurar:

- **Cosmos REST (LCD)** — banka bakiyeleri, hesap bilgileri, modül sorguları.
- **Konsensüs RPC (Consensus RPC)** — yerel işlemleri imzalamak/yayınlamak ve
  CosmWasm okuma istemcisi için kullanılır.
- **EVM JSON-RPC** — herkese açık uç noktalarda standart `eth_*`, `net_*`, `web3_*`
  ve `txpool_*` çağrıları. QoreChain `qor_*` ad alanı (namespace) ve EVM
  precompile'ları orada henüz kullanılamıyor (aşağıya bakın).
- **SVM JSON-RPC** — SVM çalışma zamanı için Solana uyumlu RPC (herkese açık
  uç noktalarda salt okunur; SVM işlem gönderimi ağ genelinde devre dışıdır).

Etkinleştiren node'larda `qor_*` JSON-RPC ad alanı, tokenomik, PQC anahtar durumu,
hibrit-imza modu, VM'ler arası mesajlar ve ağ istatistikleri gibi QoreChain'e özgü
okumaları açığa çıkarır. TypeScript'te bunlar `client.qor` (`QorClient`) üzerinde
tiplenmiş metotlardır; aynı yüzey Python, Go ve Rust SDK'larında da bulunur.
Herkese açık uç noktalarda bunun yerine REST rotalarını kullanın (örneğin PQC anahtar
durumu için `GET /qorechain/pqc/v1/account/{address}` ve yakım istatistikleri için
`GET /qorechain/burn/v1/stats`).

> **Henüz sunulmuyor:** yayımlanmış hiçbir node sürümü `qor_` JSON-RPC ad alanını sunmaz; bu nedenle bugün her herkese açık uç noktada her `qor_*` çağrısı `-32601` (metot bulunamadı) döndürür. Bkz. [`qor_` ad alanı](/api-reference/json-rpc-qor_-namespace).

## Token'lar ve birimler

- Görüntüleme token'ı: **QOR**.
- Temel birim: **uqor**, QOR başına **10^6** temel birim ile.

Para hesaplarını her zaman temel birimlerde yapın. SDK, hassasiyeti kayan nokta
(floating point) nedeniyle asla kaybetmemeniz için tam dönüşümler sağlar:

```ts
import { toBase, fromBase } from "@qorechain/sdk";

toBase("1.5");        // "1500000"  (QOR -> uqor)
fromBase("1500000");  // "1.5"      (uqor -> QOR)
```

> Not: EVM çalışma zamanı QOR'u 18 ondalık basamakla (EVM kuralı) temsil eder; bu,
> 10^6 olan Cosmos `uqor` tabanından farklıdır. `@qorechain/evm` istemcisi
> görüntüleme için varsayılan olarak 18 ondalık basamak kullanır. Hedef ağınız için
> değeri teyit edin.

## Adresler

Aynı anahtar materyali üç adres formatında ifade edilebilir:

- **native** — `qor` önekiyle bech32 (`qor1…`), doğrulayıcılar (validators)
  `qorvaloper` kullanır.
- **EVM** — `0x…`, EIP-55 sağlama toplamlı (checksummed).
- **SVM** — ed25519 açık anahtarının base58'i.

Türetme yolları için bkz. [Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc).

## VM'ler arası (Cross-VM)

QoreChain'in `x/crossvm` modülü, bir VM'deki sözleşmelerin başka bir VM'de
eylemleri tetiklemesine olanak tanır. EVM→native yolu, **VM'ler arası köprü
precompile'ı** (`@qorechain/evm`; herkese açık ağlarda henüz etkin değil)
aracılığıyla zincir üstünde çalışır ve SDK, tiplenmiş REST okuma yardımcılarının
(`getCrossVmMessage`, `getPendingCrossVmMessages`, `getCrossVmParams`) yanı sıra
mesaj durumunu izlemek için `client.qor.getCrossVmMessage(...)`'i sağlar. Herkese
açık uç noktalarda REST yardımcıları ve `client.qor` sunulmaz; mesajları
`connectQueryClients(rpc).crossvm` ile okuyun. Bkz.
[VM'ler arası kılavuz](/sdk/guides/cross-vm).
