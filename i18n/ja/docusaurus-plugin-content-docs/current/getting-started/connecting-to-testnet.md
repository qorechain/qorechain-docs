---
slug: /getting-started/connecting-to-testnet
title: テストネットへの接続
sidebar_label: テストネットへの接続
sidebar_position: 4
---

# テストネットへの接続

正しいジェネシスファイル、ピア、ネットワーク設定でノードを構成し、稼働中の QoreChain Diana テストネットに参加しましょう。

:::note
このページでは **`qorechain-diana`** テストネット(EVM チェーン ID **9800**)を扱います。メインネット(**`qorechain-vladi`**、EVM チェーン ID **9801**)は 2026 年 6 月 7 日から稼働しており、専用の **メインネットへの接続** ページに独自のジェネシス、ピア、接続情報が記載されています。
:::

## パブリックエンドポイント

**テストネットへのクエリやトランザクションのブロードキャスト**のみが必要な場合は、パブリックエンドポイントをご利用ください:

| サービス | URL |
|---|---|
| コンセンサス RPC | `https://rpc-testnet.qore.host`(WebSocket: `wss://rpc-testnet.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host`(チェーン ID `9800`) |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC(読み取り専用) | `https://svm-testnet.qore.host` |
| ブロックエクスプローラー | [explore.qore.network](https://explore.qore.network)(Testnet に切り替え) |

テストネット用の QOR は [ダッシュボードのフォーセット](/dashboard/faucet) から入手できます。

---

## ジェネシスのダウンロード

ローカルのジェネシスファイルを、チェーン自体からライブで配信される公式のテストネットジェネシスに置き換えます:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' \
  > ~/.qorechaind/config/genesis.json
```

このファイルは、バリデータセット、トークン割り当て、モジュールパラメータなど、Diana テストネットの初期状態を定義します。

:::caution
Diana テストネットは、プレリリースビルドの展開に伴い、定期的に**再ジェネシス**(高さ 0 へのリセット)が行われます。リセット後にノードの同期が止まった場合は、ジェネシスを再ダウンロードし、新しいデータディレクトリから起動してください。
:::

---

## ピアの設定

ノードの設定を編集して、既存のテストネットピアに接続します。

ネットワークから現在のピアを直接取得し、`~/.qorechaind/config/config.toml` の `persistent_peers` フィールドに設定します:

```bash
# node id + listen address of the public testnet node
curl -s https://rpc-testnet.qore.host/status | jq -r '.result.node_info.id'
```

また、`~/.qorechaind/config/app.toml` で手数料の下限も設定してください(テストネットはメインネットと同じ **0.1uqor** の最低ガス価格を使用します):

```toml
minimum-gas-prices = "0.1uqor"
```

### 推奨設定

`config.toml` では以下の値の調整も推奨します:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

これらの値は、Diana テストネットのブロック生成時間とスループットに合わせて調整されています。

---

## ノードの起動

ノードを起動して、ネットワークとの同期を開始します:

```bash
./qorechaind start
```

ノードはピアに接続し、ジェネシスからブロックのダウンロードを開始します。初回同期にかかる時間は、現在のチェーンの高さとネットワーク速度に依存します。

---

## 同期状態の確認

ノードが最新ブロックに追いついているかを確認します:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — ノードはまだ同期中です。追いつくまでお待ちください。
* `false` — ノードは完全に同期しており、新しいブロックを処理しています。

最新のブロック高も確認できます:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

---

## モニタリング

QoreChain は、ノードの健全性とパフォーマンスを監視するための複数のエンドポイントを公開しています。

### Prometheus メトリクス

生のメトリクスは以下で取得できます:

```
http://localhost:26660/metrics
```

これらのメトリクスは、Prometheus 互換の任意のコレクターでスクレイピングできます。

### Grafana ダッシュボード

Docker Compose で実行している場合、Grafana は以下で利用できます:

```
http://localhost:3001
```

初回ログイン時には、プロンプトに従って独自の認証情報を設定してください — デフォルトのまま放置しないでください。事前構成されたダッシュボードには、ブロック生成、トランザクションスループット、ピア接続、リソース使用状況が表示されます。

### REST ヘルスチェック

REST API は簡易的なステータスエンドポイントを提供します:

```
http://localhost:1317
```

---

## ポート一覧

| ポート    | プロトコル  | 説明                                        |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — トランザクションのクエリとブロードキャスト             |
| `26656` | TCP       | P2P — ピアツーピアのネットワーク通信           |
| `1317`  | HTTP      | REST API — HTTP 経由でチェーン状態をクエリ              |
| `9090`  | gRPC      | gRPC API — プログラムによるチェーンアクセス               |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum 互換 RPC(チェーン ID `9800`) |
| `8546`  | WebSocket | EVM WebSocket — リアルタイムの EVM イベント購読  |
| `8899`  | HTTP      | SVM RPC — Solana 互換 RPC                    |
| `26660` | HTTP      | Prometheus メトリクスエンドポイント                        |

---

## 次のステップ

* [ウォレットのセットアップ](/getting-started/wallet-setup) — テストネット用のウォレットを設定する
* [初めてのトランザクション](/getting-started/first-transaction) — 初めての QOR 送金を行う
