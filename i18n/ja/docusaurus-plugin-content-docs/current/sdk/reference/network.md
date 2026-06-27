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
| チェーン ID | `qorechain-vladi`（稼働中） |
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
| 表示トークン | `QOR` |
| 基本額面 | `uqor` |
| QOR あたりの基本単位数 | `10^6` |
| アカウント bech32 プレフィックス | `qor` |
| バリデーター bech32 プレフィックス | `qorvaloper` |

## デフォルトのポート

`createClient()` はデフォルトでこれらの localhost ポートを使用します。実際の
ノードを指すには `endpoints` を上書きしてください。

| エンドポイント | ポート | 用途 |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | bank 残高、アカウント情報、モジュールクエリ |
| gRPC | `9090` | gRPC クエリ |
| Consensus RPC | `26657` | ネイティブトランザクションの署名/ブロードキャスト、CosmWasm の読み取り |
| EVM JSON-RPC | `8545` | `eth_*`、`qor_*`、プリコンパイル |
| EVM JSON-RPC (WS) | `8546` | EVM の WebSocket サブスクリプション |
| SVM JSON-RPC | `8899` | Solana 互換 RPC |

明示的なエンドポイントの例:

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

SDK はネットワークプリセットとルックアップヘルパー（networks モジュールから
エクスポート）を公開しているため、プログラムからネットワークを一覧表示し解決
できます。Python/Go/Rust では、それに相当するものは `create_client` /
`CreateClient` / `ClientBuilder` に加えて `networks` モジュールです。

## メインネットを対象にする

両方のプリセットは同じ localhost のデフォルトを備えています。`mainnet` を選択し、
エンドポイントをご自身のノード URL で上書きしてください:

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
