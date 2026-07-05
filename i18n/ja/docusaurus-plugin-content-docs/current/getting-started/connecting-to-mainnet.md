---
slug: /getting-started/connecting-to-mainnet
title: メインネットへの接続
sidebar_label: メインネットへの接続
sidebar_position: 3
---

# メインネットへの接続

公式のジェネシスファイル、ピア、ネットワーク設定でノードを構成して、稼働中の QoreChain Vladi メインネットに参加しましょう。

:::note
このページは **`qorechain-vladi`** メインネット（EVM チェーン ID **9801**、16 進表記 `0x2649`）を対象としています。メインネットは **2026 年 6 月 7 日 23:59 UTC** から稼働しており、Cosmos SDK v0.53 上でチェーンバージョン **v3.1.85** を実行しています。**`qorechain-diana`** テストネット（EVM チェーン ID **9800**）については、[テストネットへの接続](/getting-started/connecting-to-testnet)を参照し、本番稼働の前にそちらでセットアップのリハーサルを行ってください。
:::

## パブリックエンドポイント

**チェーンへのクエリやトランザクションのブロードキャストのみ**が必要な場合は、自前のノードを用意する必要はありません。パブリックエンドポイントは次のとおりです。

| サービス | URL |
|---|---|
| コンセンサス RPC | `https://rpc.qore.host`（WebSocket: `wss://rpc.qore.host/websocket`） |
| Cosmos REST (LCD) | `https://api.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host`（チェーン ID `9801`） |
| SVM JSON-RPC（読み取り専用） | `https://svm.qore.host` |
| ブロックエクスプローラー | [explore.qore.network](https://explore.qore.network) |

負荷の高いワークロードや本番用途（取引所、インデクサー）では、以下の手順に従って自前のノードを運用してください。

---

## インストール

`qorechaind` バイナリは、公式のビルド済みバンドルからインストールするか、ソースからビルドしてインストールします。

### ビルド済みバイナリバンドル (linux/amd64)

公式リリースバンドルには、`qorechaind` と必要な共有ライブラリ（`libqorepqc.so`、`libqoresvm.so`、`libwasmvm.x86_64.so`）が含まれています。

```bash
curl -fsSL https://download.qore.host/qorechaind-v3.1.83-linux-amd64.tar.gz -o qore.tgz
# Verify the checksum before installing:
sha256sum qore.tgz
# fa035b3699e92d755f47445cbf7dde4e1f6c224343008546aa159b7eb46a805c

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

バージョン付きバンドルは [download.qore.host](https://download.qore.host) で公開されており、各リリースには SHA-256 チェックサムが付属します。必ず**最新**の公開バンドルをインストールしてください。

:::caution ノードを常に最新に保つ
フルノードはネットワークのチェーンバージョン（現在は **v3.1.85**）に追従する必要があります。古いノードは新しいトランザクションタイプ（たとえば v3.1.83 で導入された `eth_secp256k1` 署名のトランザクション）をデコードできず、それがブロックに現れた時点で同期が停止します。
:::

### ソースからビルド

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

前提条件の詳細（Go 1.26+、CGO、Rust ツールチェーン、ネイティブライブラリ）については、[ソースからのビルド](/developer-guide/building-from-source)を参照してください。

### ノードの初期化

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

これにより、`~/.qorechaind/` 以下にデフォルトの設定ディレクトリとデータディレクトリが作成されます。

---

## ジェネシスのダウンロード

ローカルのジェネシスファイルを公式のメインネットジェネシスで置き換えます。

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json
```

同じファイルはチェーン自身からもライブで配信されているため、ダウンロードしたものと相互検証できます。

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

このファイルは、ジェネシスバリデータセット、トークン配分（TGE はジェネシス時）、モジュールパラメータを含む、Vladi メインネットの初期状態を定義します。

---

## ピアの設定

パブリックなメインネットのセントリーノードに接続するよう、ノードの設定を編集します。

`~/.qorechaind/config/config.toml` を開き、`persistent_peers` フィールドを設定します。

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

また、`~/.qorechaind/config/app.toml` で最低ガス価格を設定してください（ネットワークの手数料下限は **0.1uqor** です）。

```toml
minimum-gas-prices = "0.1uqor"
```

### 推奨設定

`config.toml` では、以下の項目も調整するとよいでしょう。

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

これらの値は、Vladi メインネットのブロックタイムとスループットに合わせてチューニングされています。

---

## 高速ブートストラップ（スナップショット）

ジェネシスからの同期には長い時間がかかることがあります。最新のチェーンデータスナップショットが [download.qore.host](https://download.qore.host) で公開されています。

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
# Verify before extracting:
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

スナップショットはブロック高付きのファイル名で公開されます。最新のものは [download.qore.host](https://download.qore.host) で確認してください。代わりに**ステートシンク**を使うこともできます。完全な手順は[ノードの運用](/developer-guide/running-a-node)を参照してください。

---

## ノードの起動

ノードを起動して、ネットワークとの同期を開始します。

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

ノードはピアに接続し、ブロックのダウンロードを開始します（ジェネシスから、またはスナップショットを復元した場合はそのブロック高から）。

---

## 同期状態の確認

ノードが最新ブロックに追いついているかを確認します。

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — ノードはまだ同期中です。追いつくまで待ってください。
* `false` — ノードは完全に同期しており、新しいブロックを処理しています。

最新のブロック高も確認できます。

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

正しいネットワークに接続していることを確認してください。`network` フィールドは `qorechain-vladi` を返すはずです。

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## モニタリング

QoreChain は、ノードの健全性とパフォーマンスを監視するための複数のエンドポイントを公開しています。

### Prometheus メトリクス

生のメトリクスは次の場所で取得できます。

```
http://localhost:26660/metrics
```

これらのメトリクスは、Prometheus 互換の任意のコレクターでスクレイプできます。

### Grafana ダッシュボード

Docker Compose で実行している場合、Grafana は次の場所で利用できます。

```
http://localhost:3001
```

初回ログイン時に、プロンプトに従って独自の認証情報を設定してください。デフォルトのまま放置してはいけません。事前構成済みのダッシュボードには、ブロック生成、トランザクションスループット、ピア接続、リソース使用状況が表示されます。

### REST ヘルスチェック

REST API は簡易的なステータスエンドポイントを提供します。

```
http://localhost:1317
```

---

## ポート一覧

| ポート    | プロトコル  | 説明                                              |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — トランザクションのクエリとブロードキャスト                  |
| `26656` | TCP       | P2P — ピアツーピアのネットワーク通信                |
| `1317`  | HTTP      | REST API — HTTP 経由でチェーン状態をクエリ                   |
| `9090`  | gRPC      | gRPC API — プログラムからのチェーンアクセス                    |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum 互換 RPC（チェーン ID `9801`） |
| `8546`  | WebSocket | EVM WebSocket — リアルタイム EVM イベントサブスクリプション       |
| `8899`  | HTTP      | SVM RPC — Solana 互換 RPC                         |
| `26660` | HTTP      | Prometheus メトリクスエンドポイント                             |

---

## ネットワーク情報

| 項目             | 値                                  |
| ----------------- | -------------------------------------- |
| チェーン ID          | `qorechain-vladi`                      |
| EVM チェーン ID      | `9801`（16 進表記 `0x2649`）                  |
| チェーンバージョン     | v3.1.85                                |
| 稼働開始        | 2026 年 6 月 7 日 23:59 UTC                  |
| トークン             | QOR（`uqor`、10^6 マイクロ単位 = 1 QOR） |
| 最低ガス価格 | `0.1uqor`                              |
| アカウントプレフィックス    | `qor`                                  |
| バリデータプレフィックス  | `qorvaloper`                           |
| SDK               | Cosmos SDK v0.53                       |

---

## 次のステップ

* [ノードの運用](/developer-guide/running-a-node) — 取引所・インテグレーター向けのフル/RPC ノード運用
* [取引所・インテグレーターガイド](/developer-guide/exchange-integration) — 入金、出金、モニタリング
* [バリデータの運用](/developer-guide/running-a-validator) — バリデータの作成と運用
* [ウォレットのセットアップ](/getting-started/wallet-setup) — メインネット用ウォレットの設定
* [はじめてのトランザクション](/getting-started/first-transaction) — 最初の QOR 送金を実行
* [テストネットへの接続](/getting-started/connecting-to-testnet) — 無料でテストできる Diana テストネットに参加
* [ネットワーク](/appendix/networks) — チェーン ID、ポート、ネットワークの完全なリファレンス
