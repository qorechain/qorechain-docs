---
slug: /sdk/reference/network
title: ネットワークとエンドポイント
sidebar_label: ネットワークとエンドポイント
sidebar_position: 1
---

# ネットワークとエンドポイントのリファレンス

## メインネット

| 項目 | 値 |
| --- | --- |
| ネットワークプリセット | `mainnet` |
| チェーン ID | `qorechain-vladi`（2026年6月7日から稼働） |
| チェーンバージョン（2026年10月23日） | v3.2.4（2026年10月23日の高さ 3,742,566 以降、ガバナンス提案 13） |
| EVM チェーン ID | `9801` |
| 表示トークン | `QOR` |
| 基本額面 | `uqor` |
| QOR あたりの基本単位数 | `10^6` |
| アカウント bech32 プレフィックス | `qor` |
| バリデーター bech32 プレフィックス | `qorvaloper` |

## テストネット

| 項目 | 値 |
| --- | --- |
| ネットワークプリセット | `testnet` |
| チェーン ID | `qorechain-diana`（稼働中） |
| チェーンバージョン（2026年10月23日） | v3.2.4（高さ 8,337,253 以降、2026年10月19日） |
| EVM チェーン ID | `9800` |
| 表示トークン | `QOR` |
| 基本額面 | `uqor` |
| QOR あたりの基本単位数 | `10^6` |
| アカウント bech32 プレフィックス | `qor` |
| バリデーター bech32 プレフィックス | `qorvaloper` |

## パブリックエンドポイント {#public-endpoints}

| エンドポイント | メインネット（`qorechain-vladi`） | テストネット（`qorechain-diana`） |
| --- | --- | --- |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Consensus RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC（`eth_*`） | `https://evm.qore.host`（チェーン ID 9801） | `https://evm-testnet.qore.host`（チェーン ID 9800） |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC（読み取り専用） | `https://svm.qore.host` | `https://svm-testnet.qore.host` |

EVM エンドポイントは `eth_`、`net_`、`web3_`、`txpool_` を提供します。`qor_`
名前空間は有効化されていません。[ネットワーク](/appendix/networks#public-endpoints)も参照してください。

## デフォルトのポート

`createClient()` はデフォルトでこれらの localhost ポートを使用します。実際の
ノードを指すには `endpoints` を上書きしてください。

| エンドポイント | ポート | 用途 |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | bank 残高、アカウント情報、モジュールクエリ |
| gRPC | `9090` | gRPC クエリ |
| Consensus RPC | `26657` | ネイティブトランザクションの署名/ブロードキャスト、QoreChain Native の読み取り |
| EVM JSON-RPC | `8545` | `eth_*`（および、有効化しているノードでは `qor_*` / プリコンパイル） |
| EVM JSON-RPC (WS) | `8546` | EVM の WebSocket サブスクリプション |
| SVM JSON-RPC | `8899` | Solana 互換 RPC |

明示的なエンドポイントの例:

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

SDK はネットワークプリセットとルックアップヘルパー（networks モジュールから
エクスポート）を公開しているため、プログラムからネットワークを一覧表示し解決
できます。Python/Go/Rust では、それに相当するものは `create_client` /
`CreateClient` / `ClientBuilder` に加えて `networks` モジュールです。

## メインネットを対象にする

両方のプリセットは同じ localhost のデフォルトを備えています。`mainnet` を選択し、
エンドポイントをパブリック URL（またはご自身のノード）で上書きしてください:

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
