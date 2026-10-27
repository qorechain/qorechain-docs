---
slug: /getting-started/quickstart
title: クイックスタート
sidebar_label: クイックスタート
sidebar_position: 1
---

# クイックスタート

QoreChain ノードを数分で起動しましょう。最速のセットアップには Docker Compose を、完全な制御にはソースからのビルドを選択してください。

---

## Docker Compose（推奨）

すべてのサービスがあらかじめ構成された完全な QoreChain 環境を実行する最もシンプルな方法です。

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
cp .env.example .env
cp .env.sidecar.example .env.sidecar
# edit .env and set GRAFANA_PASSWORD (Compose refuses to start without it)
docker compose up -d
```

初回起動の前に、（上記のとおり）`.env.example` を `.env` に、`.env.sidecar.example` を `.env.sidecar` にコピーし、`GRAFANA_PASSWORD` を設定してください。

これにより、以下のサービスが起動します。

| サービス            | ポート                                                                   | 説明                                          |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------- |
| **qorechain-node** | `26657`（RPC）、`1317`（REST）、`9090`（gRPC）、`8545` / `8546`（EVM） | マルチ VM サポートを備えたフルブロックチェーンノード  |
| **ai-sidecar**     | `50051`                                                                 | QCAI 異常検知およびリスクスコアリングエンジン     |
| **indexer**        | --                                                                      | 履歴照会用のブロックインデクサー                  |
| **postgres**       | `5432`                                                                  | インデクサーのデータベースバックエンド            |
| **prometheus**     | `9091`                                                                  | メトリクス収集                                  |
| **grafana**        | `3001`                                                                  | モニタリングダッシュボード                       |

すべてのコンテナが正常になると、**ローカルのシングルノード開発用チェーン**が手に入ります（独自の genesis を初期化し、メインネットにもテストネットにも参加しません）。稼働中のネットワークに参加するには、[メインネットへの接続](/getting-started/connecting-to-mainnet)または[テストネットへの接続](/getting-started/connecting-to-testnet)のページに従ってください。

---

## ソースからのビルド

### 前提条件

* CGO が有効な **Go 1.26+**
* **Rust ツールチェーン**（PQC 暗号と SVM ランタイムライブラリのコンパイル用）
* **Git**

### バイナリのビルド

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

:::caution ソースからのビルドはローカル開発用です
公開ソースツリーからはコミュニティ版バイナリがビルドされます。コマンドセットは完全ですが、ポスト量子署名機能はありません。`tx pqc gen-key` と `tx pqc cosign` はエラー（"requires the full build"）を返すため、ハイブリッド署名を必須とするネットワーク向けのトランザクションは作成できず、スタブの keeper はネットワークのコンセンサス状態を再現しません。メインネットまたはテストネットに参加したりトランザクションを送信したりするには、[download.qore.host](https://download.qore.host) の `latest.json` に記載されているリリースバイナリをインストールしてください。
:::

### ノードの初期化

```bash
./qorechaind init my-node --chain-id qorechain-diana
```

これにより、`~/.qorechaind/` 配下にデフォルトの設定およびデータディレクトリが作成されます。単独で起動したノードはローカルのシングルノードチェーンを形成します。稼働中のネットワークに参加するには、接続に関するページに従ってください。

### ノードの起動

```bash
./qorechaind start
```

ノードはデフォルト設定で起動します。適切な genesis とピア構成で稼働中のネットワークに参加する方法については、[テストネットへの接続](/getting-started/connecting-to-testnet) を参照してください。

:::note
このページの例は **`qorechain-diana`** テストネット（EVM チェーン ID **9800**）を対象としています。メインネット（**`qorechain-vladi`**、EVM チェーン ID **9801**）は 2026 年 6 月 7 日から稼働しており（リリース：2026 年 10 月 23 日から v3.2.4。テストネットは 2026 年 10 月 27 日から v3.2.6 を実行しています）、専用の **メインネットへの接続** ページがあります。
:::

---

## インストールの検証

ノードが正しく実行されていることを確認します。

```bash
# Check that the binary runs
./qorechaind --help
```

```bash
# Query the node status via RPC
curl localhost:26657/status
```

成功したレスポンスには、ノードの `moniker`、`network`（上記で作成したローカル開発用チェーンの場合は `qorechain-diana`、参加したチェーンの場合はそのチェーン）、および現在のブロック高さが含まれます。

---

## 次のステップ

* [テストネットへの接続](/getting-started/connecting-to-testnet) — 稼働中の Diana テストネットに参加する
* [ウォレットのセットアップ](/getting-started/wallet-setup) — チェーンと対話するためのウォレットを構成する
* [最初のトランザクション](/getting-started/first-transaction) — 最初の QOR 送金を行う
* [メインネットへの接続](/getting-started/connecting-to-mainnet) — 稼働中の Vladi メインネットに参加する
* [SDK 概要](/sdk/overview) — コードから QoreChain に対してアプリケーションを構築する
