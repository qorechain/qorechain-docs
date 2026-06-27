---
slug: /getting-started/connecting-to-mainnet
title: メインネットへの接続
sidebar_label: メインネットへの接続
sidebar_position: 3
---

# メインネットへの接続

正しい genesis ファイル、ピア、ネットワーク設定でノードを構成して、稼働中の QoreChain Vladi メインネットに参加しましょう。

:::note
このページは、2026 年 6 月 7 日 23:59 UTC からチェーンバージョン **v3.1.77**（Cosmos SDK v0.53 上）で稼働している **`qorechain-vladi`** メインネット（EVM チェーン ID **9801**、16 進数 `0x2649`）を対象としています。**`qorechain-diana`** テストネット（EVM チェーン ID **9800**）については、[テストネットへの接続](/getting-started/connecting-to-testnet) を参照し、本番稼働前にそこでセットアップをリハーサルしてください。
:::

:::warning
メインネットのシードノード、永続ピア、genesis URL、およびその SHA-256 チェックサムは、各公式メインネットリリースとともに公開されます。**これらの最新の値は必ず公式メインネットリポジトリ／リリースから取得し**、起動前に genesis チェックサムを検証してください。以下のプレースホルダー（`<MAINNET_SEED_NODE_ID>@<host>:26656`、genesis URL、スナップショット URL）は、公開された実際の値に置き換える必要があります。検証されていないピアや genesis に対してメインネットノードを起動しないでください。
:::

---

## インストール

ソースからビルドするか、公式 Docker イメージをプルして、`qorechaind` バイナリをインストールします。

### ソースからビルドする

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

前提条件の詳細（Go 1.26+、CGO、Rust ツールチェーン、ネイティブライブラリ）については、[ソースからのビルド](/developer-guide/building-from-source) を参照してください。

### ノードの初期化

```bash
./qorechaind init my-node --chain-id qorechain-vladi
```

これにより、`~/.qorechaind/` 配下にデフォルトの設定およびデータディレクトリが作成されます。

---

## Genesis のダウンロード

ローカルの genesis ファイルを公式メインネット genesis に置き換えます。

```bash
curl -o ~/.qorechaind/config/genesis.json \
  <MAINNET_GENESIS_URL>
```

続行する前に、公式メインネットリリースで公開されている値と genesis チェックサムを検証します。

```bash
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

このファイルは、genesis バリデータセット、トークン割り当て（genesis での TGE）、モジュールパラメータを含む、Vladi メインネットの初期状態を定義します。

:::note
`<MAINNET_GENESIS_URL>` と `<MAINNET_GENESIS_SHA256>` はプレースホルダーです。最新の genesis URL とその SHA-256 チェックサムを公式メインネットリリース／リポジトリから取得し、ノードを起動する前にチェックサムが一致することを検証してください。
:::

---

## ピアの構成

既存のメインネットピアに接続するように、ノード設定を編集します。

`~/.qorechaind/config/config.toml` を開き、`seeds` と `persistent_peers` フィールドを設定します。

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
上記のシードおよび永続ピアの値はプレースホルダーです。最新のメインネットシードノード ID、ホスト、ポートを公式メインネットリポジトリ／リリースから取得してください。検証されていないピアには接続しないでください。
:::

### 推奨設定

`config.toml` で以下の項目も調整することをお勧めします。

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

これらの値は、Vladi メインネットのブロック時間とスループットに合わせて調整されています。

---

## ノードの起動

ノードを起動して、ネットワークとの同期を開始します。

```bash
./qorechaind start
```

ノードはピアに接続し、genesis からのブロックのダウンロードを開始します。初期同期時間は、現在のチェーン高さとネットワーク速度に依存します。より高速なブートストラップのために、オペレータは通常、ステート同期または最近のスナップショットを使用します。完全なステート同期とスナップショットのワークフローについては、[ノードの実行](/developer-guide/running-a-node) を参照してください。

---

## 同期ステータスの確認

ノードが最新のブロックに追いついているかどうかを確認します。

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — ノードはまだ同期中です。追いつくまで待ってください。
* `false` — ノードは完全に同期され、新しいブロックを処理しています。

最新のブロック高さを確認することもできます。

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

正しいネットワーク上にいることを確認します。`network` フィールドは `qorechain-vladi` を報告するはずです。

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## モニタリング

QoreChain は、ノードのヘルスとパフォーマンスを監視するためのいくつかのエンドポイントを公開しています。

### Prometheus メトリクス

生のメトリクスは以下で利用できます。

```
http://localhost:26660/metrics
```

これらのメトリクスは、任意の Prometheus 互換コレクターでスクレイプできます。

### Grafana ダッシュボード

Docker Compose 経由で実行している場合、Grafana は以下で利用できます。

```
http://localhost:3001
```

初回ログイン時には、プロンプトが表示されたら独自の認証情報を設定してください。デフォルトのままにしないでください。あらかじめ構成されたダッシュボードには、ブロック生成、トランザクションスループット、ピア接続、リソース使用状況が表示されます。

### REST ヘルスチェック

REST API はクイックステータスエンドポイントを提供します。

```
http://localhost:1317
```

---

## ポートリファレンス

| ポート    | プロトコル  | 説明                                                     |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — トランザクションの照会とブロードキャスト              |
| `26656` | TCP       | P2P — ピアツーピアネットワーク通信                          |
| `1317`  | HTTP      | REST API — HTTP 経由でチェーン状態を照会                   |
| `9090`  | gRPC      | gRPC API — プログラムによるチェーンアクセス                 |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum 互換 RPC（チェーン ID `9801`）    |
| `8546`  | WebSocket | EVM WebSocket — リアルタイムの EVM イベントサブスクリプション |
| `8899`  | HTTP      | SVM RPC — Solana 互換 RPC                               |
| `26660` | HTTP      | Prometheus メトリクスエンドポイント                        |

---

## ネットワーク情報

| フィールド          | 値                                      |
| ----------------- | -------------------------------------- |
| チェーン ID          | `qorechain-vladi`                      |
| EVM チェーン ID      | `9801`（16 進数 `0x2649`）              |
| チェーンバージョン     | v3.1.77                                |
| 稼働開始            | 2026 年 6 月 7 日 23:59 UTC            |
| トークン             | QOR（`uqor`、10^6 マイクロ単位 = 1 QOR） |
| アカウントプレフィックス | `qor`                                  |
| バリデータプレフィックス | `qorvaloper`                           |
| SDK               | Cosmos SDK v0.53                       |

---

## 次のステップ

* [ノードの実行](/developer-guide/running-a-node) — 取引所やインテグレータ向けにフル／RPC ノードを運用する
* [バリデータの実行](/developer-guide/running-a-validator) — バリデータを作成して運用する
* [ウォレットのセットアップ](/getting-started/wallet-setup) — メインネット用のウォレットを構成する
* [最初のトランザクション](/getting-started/first-transaction) — 最初の QOR 送金を行う
* [テストネットへの接続](/getting-started/connecting-to-testnet) — 無料テスト用に Diana テストネットに参加する
* [ネットワーク](/appendix/networks) — チェーン ID、ポート、完全なネットワークリファレンス
