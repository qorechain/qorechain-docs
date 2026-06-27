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
| Chain id | `qorechain-vladi` (yayında) |
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
| Görünen token | `QOR` |
| Temel denominasyon | `uqor` |
| QOR başına temel birim | `10^6` |
| Hesap bech32 öneki | `qor` |
| Doğrulayıcı bech32 öneki | `qorvaloper` |

## Varsayılan portlar

`createClient()` varsayılan olarak bu localhost portlarını kullanır. Gerçek bir
düğüme işaret etmek için `endpoints` parametresini geçersiz kılın.

| Uç nokta | Port | Amaç |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | bank bakiyeleri, hesap bilgisi, modül sorguları |
| gRPC | `9090` | gRPC sorguları |
| Consensus RPC | `26657` | yerel tx'leri imzalama/yayınlama, CosmWasm okumaları |
| EVM JSON-RPC | `8545` | `eth_*`, `qor_*`, precompile'lar |
| EVM JSON-RPC (WS) | `8546` | EVM WebSocket abonelikleri |
| SVM JSON-RPC | `8899` | Solana uyumlu RPC |

Açık uç noktalarla örnek:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",   // REST (LCD)
    rpc: "https://rpc.testnet.example",      // consensus RPC
    evmRpc: "https://evm.testnet.example",   // EVM + qor_ JSON-RPC
    evmWs: "wss://evm.testnet.example",      // EVM WebSocket
  },
});
```

SDK, ağ ön ayarlarını ve arama yardımcılarını (networks modülünden dışa
aktarılır) sunar, böylece ağları programatik olarak listeleyebilir ve
çözümleyebilirsiniz. Python/Go/Rust'ta eşdeğerleri `create_client` /
`CreateClient` / `ClientBuilder` ile birlikte `networks` modülüdür.

## Mainnet'i hedefleme

Her iki ön ayar da aynı localhost varsayılanlarıyla gelir; `mainnet`'i seçin ve
uç noktaları kendi düğüm URL'lerinizle geçersiz kılın:

```ts
const main = createClient({
  network: "mainnet",       // chain id qorechain-vladi
  endpoints: {
    rest: "https://rest.mainnet.example",
    rpc: "https://rpc.mainnet.example",
    evmRpc: "https://evm.mainnet.example",
  },
});
```
