---
slug: /sdk/reference/network
title: Ağ ve Uç Noktalar
sidebar_label: Ağ ve Uç Noktalar
sidebar_position: 1
---

# Ağ ve uç nokta referansı

## Mainnet

| Alan | Değer |
| --- | --- |
| Ağ ön ayarı | `mainnet` |
| Chain id | `qorechain-vladi` (7 Haziran 2026'dan beri yayında) |
| Zincir sürümü (23 Ekim 2026) | v3.2.4 (3.742.566 yüksekliğinden beri, 23 Ekim 2026, yönetişim önerisi 13) |
| EVM zincir kimliği | `9801` |
| Görünen token | `QOR` |
| Temel denominasyon | `uqor` |
| QOR başına temel birim | `10^6` |
| Hesap bech32 öneki | `qor` |
| Doğrulayıcı bech32 öneki | `qorvaloper` |

## Testnet

| Alan | Değer |
| --- | --- |
| Ağ ön ayarı | `testnet` |
| Chain id | `qorechain-diana` (yayında) |
| Zincir sürümü (23 Ekim 2026) | v3.2.4 (8.337.253 yüksekliğinden beri, 19 Ekim 2026) |
| EVM zincir kimliği | `9800` |
| Görünen token | `QOR` |
| Temel denominasyon | `uqor` |
| QOR başına temel birim | `10^6` |
| Hesap bech32 öneki | `qor` |
| Doğrulayıcı bech32 öneki | `qorvaloper` |

## Genel uç noktalar {#public-endpoints}

| Uç nokta | Mainnet (`qorechain-vladi`) | Testnet (`qorechain-diana`) |
| --- | --- | --- |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Consensus RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC (`eth_*`) | `https://evm.qore.host` (zincir kimliği 9801) | `https://evm-testnet.qore.host` (zincir kimliği 9800) |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (salt okunur) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |

EVM uç noktaları `eth_`, `net_`, `web3_` ve `txpool_` sunar; `qor_` ad alanı
etkin değildir. Ayrıca bkz. [Ağlar](/appendix/networks#public-endpoints).

## Varsayılan portlar

`createClient()` varsayılan olarak bu localhost portlarını kullanır. Gerçek bir
düğüme işaret etmek için `endpoints` parametresini geçersiz kılın.

| Uç nokta | Port | Amaç |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | bank bakiyeleri, hesap bilgisi, modül sorguları |
| gRPC | `9090` | gRPC sorguları |
| Consensus RPC | `26657` | yerel tx'leri imzalama/yayınlama, QoreChain Native okumaları |
| EVM JSON-RPC | `8545` | `eth_*` (ve bunları etkinleştiren düğümlerde `qor_*` / precompile'lar) |
| EVM JSON-RPC (WS) | `8546` | EVM WebSocket abonelikleri |
| SVM JSON-RPC | `8899` | Solana uyumlu RPC |

Açık uç noktalarla örnek:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",        // REST (LCD)
    rpc: "https://rpc-testnet.qore.host",         // consensus RPC
    evmRpc: "https://evm-testnet.qore.host",      // EVM JSON-RPC (eth_*)
    evmWs: "wss://evm-ws-testnet.qore.host",      // EVM WebSocket
  },
});
```

SDK, ağ ön ayarlarını ve arama yardımcılarını (networks modülünden dışa
aktarılır) sunar, böylece ağları programatik olarak listeleyebilir ve
çözümleyebilirsiniz. Python/Go/Rust'ta eşdeğerleri `create_client` /
`CreateClient` / `ClientBuilder` ile birlikte `networks` modülüdür.

## Mainnet'i hedefleme

Her iki ön ayar da aynı localhost varsayılanlarıyla gelir; `mainnet`'i seçin ve
uç noktaları genel URL'lerle (veya kendi düğümünüzle) geçersiz kılın:

```ts
const main = createClient({
  network: "mainnet",       // chain id qorechain-vladi
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});
```
