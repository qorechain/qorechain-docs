---
slug: /getting-started/connecting-to-testnet
title: テストネットへの接続
sidebar_label: テストネットへの接続
sidebar_position: 4
---

# テストネットへの接続

正しい genesis ファイル、ピア、ネットワーク設定でノードを構成して、稼働中の QoreChain Diana テストネットに参加しましょう。

:::note
このページは **`qorechain-diana`** テストネット（EVM チェーン ID **9800**）を対象としています。メインネット（**`qorechain-vladi`**、EVM チェーン ID **9801**）は 2026 年 6 月 7 日から稼働しており、独自の genesis、ピア、接続詳細を備えた専用の **メインネットへの接続** ページがあります。
:::

---

## Genesis のダウンロード

ローカルの genesis ファイルを公式テストネット genesis に置き換えます。

```bash
curl -o ~/.qorechaind/config/genesis.json \
  https://raw.githubusercontent.com/qorechain/qorechain-core/main/config/genesis.json
```

このファイルは、バリデータセット、トークン割り当て、モジュールパラメータを含む、Diana テストネットの初期状態を定義します。

---

## ピアの構成

既存のテストネットピアに接続するように、ノード設定を編集します。

`~/.qorechaind/config/config.toml` を開き、`persistent_peers` フィールドを設定します。

```toml
persistent_peers = "node-id@seed1.qorechain.io:26656,node-id@seed2.qorechain.io:26656"
```

最新のピアリストについては、[QoreChain リポジトリ](https://github.com/qorechain/qorechain-core) を参照してください。

### 推奨設定

`config.toml` で以下の項目も調整することをお勧めします。

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

これらの値は、Diana テストネットのブロック時間とスループットに合わせて調整されています。

---

## ノードの起動

ノードを起動して、ネットワークとの同期を開始します。

```bash
./qorechaind start
```

ノードはピアに接続し、genesis からのブロックのダウンロードを開始します。初期同期時間は、現在のチェーン高さとネットワーク速度に依存します。

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

| ポート    | プロトコル  | 説明                                                |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — トランザクションの照会とブロードキャスト         |
| `26656` | TCP       | P2P — ピアツーピアネットワーク通信                     |
| `1317`  | HTTP      | REST API — HTTP 経由でチェーン状態を照会              |
| `9090`  | gRPC      | gRPC API — プログラムによるチェーンアクセス            |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum 互換 RPC（チェーン ID `9800`） |
| `8546`  | WebSocket | EVM WebSocket — リアルタイムの EVM イベントサブスクリプション |
| `8899`  | HTTP      | SVM RPC — Solana 互換 RPC                          |
| `26660` | HTTP      | Prometheus メトリクスエンドポイント                   |

---

## 次のステップ

* [ウォレットのセットアップ](/getting-started/wallet-setup) — テストネット用のウォレットを構成する
* [最初のトランザクション](/getting-started/first-transaction) — 最初の QOR 送金を行う
