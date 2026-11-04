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
| チェーンバージョン（2026年11月4日） | v3.2.6（2026年11月4日の高さ 4,020,000 以降、ガバナンス提案 15。v3.2.5 は10月29日に高さ 3,906,833 で、v3.2.4 は10月23日に高さ 3,742,566 で適用）。SDK 0.12.0 は v3.2.5 向けのクライアントで v3.2.6 でも動作します（署名形式は変わっていません）。0.10.0 は v3.2.4 向けのクライアントでした。動作しますが、v3.2.5 と v3.2.6 での追加分のビルダーはありません |
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
| チェーンバージョン（2026年10月27日） | v3.2.6（2026年10月27日の高さ 8,970,638 以降。v3.2.5 は10月26日の高さ 8,890,800 で、v3.2.4 は10月19日の高さ 8,337,253 で適用） |
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

SDK 0.12.0 以降、`mainnet` と `testnet` のプリセットは、これらの REST、コンセンサス RPC、
EVM JSON-RPC の URL（およびテストネットの EVM WebSocket）を既定で使用します。プリセットは、上記の読み取り専用 SVM の URL が
存在していても、gRPC エンドポイントも SVM エンドポイントも**設定しません**
（SVM トランザクションは開放されていません）。これらのいずれかを必要とするコードは、渡すべきエンドポイントの名前を示す
エラーで失敗します。テストネットのエンドポイントは IP ごとにレート制限されています。本番のトラフィックには
自前のノードを運用または利用してください。0.12.0 より前は、すべてのプリセットが localhost を既定としていました。

### クライアントにとって重要なテストネット専用の違い {#testnet-only}

テストネットはステージングネットワークでメインネットより先行して動作するため、そこで読み取れるいくつかの内容はメインネットにはありません（2026年10月27日に確認。完全な一覧は[テストネットとメインネットの差異](/appendix/chain-parameters#testnet-differences)にあります）。

* **REST ルート。** `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}`、`GET /qorechain/pqc/v1/params`、`GET /qorechain/crossvm/v1/params` はテストネットで応答します。メインネットは チェーン v3.2.6 までこれらに HTTP 501 を返していました。v3.2.6 の適用（2026年11月4日）以降、これらのルートはすべて、当日の確認でメインネットでも HTTP 200 を返しました。`/qorechain/amm/v1/` 配下の AMM ルート（`pools`、`params`）は両方のネットワークで応答します。
* **テストトークン。** 価値のない 3 つのトークンがテストネットにのみ存在し、`erc20:<EIP-55 contract address>`（大文字と小文字を区別）という名前のバンクデノミネーションとして登録されています。fUSD（小数桁 6）、fETH（18）、fBTC（8）です。`GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` でそれらを一覧できます。メインネットのバンクデノミネーションは `uqor` のみです。[テストネットのテストトークン（Fest）](/api-reference/rest-grpc-endpoints#fest-tokens)を参照してください。
* **有効化されているモジュール。** `abstractaccount` モジュールはテストネットでは有効、メインネットでは無効です。EVM プリコンパイルはテストネットで有効（10月27日には 3 つ、11月4日には 4 つ）、メインネットでは 1 つも有効ではありません。また、QoreChain Native のインスタンス化はテストネットで開放されています。

## デフォルトのポート（`localnet` プリセット） {#default-ports}

`localnet` プリセット（チェーン ID `qorechain-devnet`、EVM チェーン ID は未設定）は、お使いのマシン上のノード向けに、
これらの localhost ポートを使用します。SDK 0.12.0 より前は、すべてのプリセットがこれらを既定で
使っていましたが、0.12.0 以降は `localnet` だけです。別のノードを指すには `endpoints` を上書きしてください。

| エンドポイント | ポート | 用途 |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | bank 残高、アカウント情報、モジュールクエリ |
| gRPC | `9090` | gRPC クエリ |
| Consensus RPC | `26657` | ネイティブトランザクションの署名/ブロードキャスト、QoreChain Native の読み取り |
| EVM JSON-RPC | `8545` | `eth_*`（および、有効化しているノードでは `qor_*` / プリコンパイル） |
| EVM JSON-RPC (WS) | `8546` | EVM の WebSocket サブスクリプション |
| SVM JSON-RPC | `8899` | Solana 互換 RPC |

```ts
const local = createClient({ network: "localnet" }); // a node on this machine
```

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

`mainnet` を選択して対象にします。SDK 0.12.0 以降、プリセットにはすでに公開 URL が含まれているため、
以下のエンドポイントがデフォルトです。自前のノードを使う場合にのみ `endpoints` を渡してください
（0.12.0 より前の SDK は localhost がデフォルトで、これらが必要です）:

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
