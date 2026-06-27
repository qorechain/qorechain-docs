---
slug: /developer-guide/running-a-node
title: ノードの運用
sidebar_label: ノードの運用
sidebar_position: 10
---

# ノードの運用

このガイドは、**ノードのみ** のQoreChainデプロイメント、つまりチェーンを同期し、統合用のエンドポイントを公開する、ただし **バリデータの責務を持たない** フルノードまたはRPCノードの運用を扱います。これは、取引所（CEX）、ウォレットバックエンド、インデクサー、そしてネットワークへの信頼性の高い読み書きアクセスを必要とするものの、ブロックに署名しないインテグレーターを対象としています。

:::note
ブロック生成、ステーキング、スラッシング、プール分類については、代わりに[バリデータの運用](/developer-guide/running-a-validator)を参照してください。ノードのみのデプロイメントは、バリデータのコンセンサスキーを決して保持せず、アクティブセットに決して現れません。
:::

:::warning
メインネットのシードノード、永続ピア、ジェネシスURL／チェックサム、そしてスナップショット／ステートシンクのRPCエンドポイントは、各公式メインネットリリースとともに公開されます。**これらの現在の値は公式メインネットリポジトリ／リリースから入手し**、起動前にジェネシスチェックサムを検証してください。以下のプレースホルダー（`<MAINNET_SEED_NODE_ID>@<host>:26656`、`<MAINNET_GENESIS_URL>`、スナップショット／ステートシンクのURL）は、実際に公開された値に置き換える必要があります。
:::

---

## ノード対バリデータ

| 観点                | ノードのみ（このガイド）                          | バリデータ                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| コンセンサスキー      | なし                                            | ed25519コンセンサスキー（保護が必須）        |
| ブロック生成         | なし                                            | あり — ブロックを提案し署名する              |
| ステーキング／スラッシング | 該当なし                                      | 自己委任、スラッシングリスク                 |
| 主な目的            | 統合先にRPC/REST/gRPC/EVM/SVMを提供             | ネットワークを保護し、報酬を獲得する          |
| 公開状況            | RPC/EVMエンドポイントは通常公開される             | バリデータはセントリーノードの背後に隠される   |

---

## 対象ネットワーク

| ネットワーク  | チェーンID           | EVMチェーンID         | 備考                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| メインネット  | `qorechain-vladi`   | `9801`（hex `0x2649`） | プライマリ — 2026年6月7日より稼働中 |
| テストネット  | `qorechain-diana`   | `9800`               | まずここで統合のリハーサルを行う |

このガイド全体を通して、対象ネットワークに応じた適切な `--chain-id` に置き換えてください。例ではデフォルトでメインネットを使用します。

---

## 推奨ハードウェア

| プロファイル              | CPU      | RAM   | ディスク（NVMe SSD）       | ネットワーク   |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| プルーニングRPCノード     | 4コア    | 16 GB | 500 GB以上              | 100 Mbps以上 |
| フル／アーカイブノード    | 8コア    | 32 GB | 2 TB以上（時間とともに増加） | 1 Gbps    |
| 取引所統合               | 8コア    | 32 GB | 2 TB以上（余裕を持たせる） | 1 Gbps    |

NVMe SSDを強く推奨します。チェーン状態とEVM/SVMストアはI/O負荷が高いです。アーカイブノード（プルーニングなし、完全なトランザクションインデックス）は継続的に増大します。余裕とモニタリングを備えてディスクをプロビジョニングしてください。

---

## デプロイメント

### Docker Compose

Docker Composeによるノードのみのデプロイメント。イメージタグを稼働中のチェーンバージョン（メインネットでは **v3.1.77**）に固定し、チェーンデータ用の永続ボリュームをマウントします。

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.77
    container_name: qorechain-node
    restart: unless-stopped
    command: ["start", "--home", "/root/.qorechaind"]
    volumes:
      - qorechain-data:/root/.qorechaind
    ports:
      - "26657:26657"   # RPC
      - "26656:26656"   # P2P
      - "1317:1317"     # REST
      - "9090:9090"     # gRPC
      - "8545:8545"     # EVM JSON-RPC
      - "8546:8546"     # EVM WebSocket
      - "8899:8899"     # SVM RPC
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

データディレクトリを一度初期化し（ジェネシスとピア設定については後述）、起動します。

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

ベアメタルインストールの場合は、`qorechaind` をsystemdの下で実行します。

```ini
# /etc/systemd/system/qorechaind.service
[Unit]
Description=QoreChain node
After=network-online.target
Wants=network-online.target

[Service]
User=qorechain
ExecStart=/usr/local/bin/qorechaind start --home /var/lib/qorechaind
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now qorechaind
sudo journalctl -u qorechaind -f
```

---

## ネットワークへの参加

### 1. 初期化

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

### 2. ジェネシスのダウンロードと検証

```bash
curl -o ~/.qorechaind/config/genesis.json <MAINNET_GENESIS_URL>
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

:::note
`<MAINNET_GENESIS_URL>` と `<MAINNET_GENESIS_SHA256>` はプレースホルダーです。現在のジェネシスURLとチェックサムを公式メインネットリリース／リポジトリから入手し、起動前にチェックサムを検証してください。
:::

### 3. シードとピアの設定

`~/.qorechaind/config/config.toml` を開きます。

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
シードとピアの値はプレースホルダーです。現在のメインネットのシードと永続ピアを公式メインネットリポジトリ／リリースから入手してください。
:::

### 4. 同期の開始

```bash
qorechaind start
```

---

## 高速ブートストラップ

ジェネシスからの同期には長い時間がかかることがあります。統合の場合は、高速なコールドスタートのために **ステートシンク** または **スナップショット** を使用してください。

### ステートシンク

ステートシンクは、すべてのブロックを再生する代わりに、信頼できるRPCサーバーから最近のアプリケーション状態スナップショットを取得します。`config.toml` の `[statesync]` セクションを設定します。

```toml
[statesync]
enable = true
rpc_servers = "<STATESYNC_RPC_1>,<STATESYNC_RPC_2>"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

正常なRPCエンドポイントから、最近の信頼できる高さとハッシュを決定します。

```bash
curl -s <STATESYNC_RPC_1>/block | jq '.result.block.header.height, .result.block_id.hash'
```

:::note
`<STATESYNC_RPC_1>`、`<STATESYNC_RPC_2>`、`<TRUSTED_BLOCK_HEIGHT>`、`<TRUSTED_BLOCK_HASH>` はプレースホルダーです。公式メインネットリリースで公開されているステートシンクRPCサーバーを使用し、信頼する高さ／ハッシュを最近のブロックから導出してください。
:::

### スナップショットのリストア

あるいは、最近のチェーンデータスナップショットをダウンロードし、データディレクトリ上に展開します。

```bash
curl -o snapshot.tar.lz4 <MAINNET_SNAPSHOT_URL>
lz4 -dc snapshot.tar.lz4 | tar -xf - -C ~/.qorechaind/
qorechaind start
```

:::note
`<MAINNET_SNAPSHOT_URL>` はプレースホルダーです。スナップショットURL（および付随するチェックサム）を公式メインネットリリース／リポジトリから入手し、展開前にチェックサムを検証してください。
:::

---

## プルーニングとインデックス

統合に合わせてプルーニングとトランザクションインデックスを調整します。完全なトランザクション履歴を必要とする取引所は、最小限のプルーニングとトランザクションインデクサーを有効にして運用すべきです。

### プルーニング（`app.toml`）

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | 動作                                      | ユースケース                       |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | 最近の状態を保持し、残りをプルーニング      | RPCノード、残高／状態の参照         |
| `nothing`   | すべての履歴状態を保持                     | アーカイブノード、完全な履歴         |
| `custom`    | オペレータ定義の保持／間隔の値             | 調整された保持                      |

### トランザクションインデックス（`config.toml`）

```toml
[tx_index]
indexer = "kv"
```

`indexer = "kv"`（またはより高機能なインデクサー）を設定して、トランザクションがハッシュとイベントでクエリ可能になるようにします。これは入金と出金を照合する取引所に不可欠です。履歴トランザクションクエリが不要な場合にのみ `indexer = "null"` を設定してください。

---

## 統合用エンドポイントの公開

インテグレーターが必要とするAPIサーバーを `app.toml` で有効化してバインドします。

```toml
[api]
enable = true
address = "tcp://0.0.0.0:1317"

[grpc]
enable = true
address = "0.0.0.0:9090"

[json-rpc]
enable = true
address = "0.0.0.0:8545"
ws-address = "0.0.0.0:8546"
api = "eth,net,web3,qor"
```

そして `config.toml` のRPCリスナーを設定します。

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| エンドポイント | ポート  | 用途                                                   |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | トランザクションのブロードキャスト、ブロック／ステータスのクエリ |
| REST         | `1317`  | チェーン状態のHTTPクエリ                                 |
| gRPC         | `9090`  | 高スループットなプログラマティックアクセス                |
| EVM JSON-RPC | `8545`  | Ethereum互換の統合（チェーンID `9801`）                  |
| EVM WS       | `8546`  | EVMイベントのサブスクリプション                          |
| SVM RPC      | `8899`  | Solana互換の統合                                       |

:::warning
リバースプロキシ、レート制限、認証、ファイアウォールなしで、RPC、EVM JSON-RPC、gRPCを公開インターネットに直接公開しないでください。制御されたイングレス層の背後でのみ `0.0.0.0` にバインドしてください。
:::

---

## ヘルスと同期のモニタリング

### 同期ステータス

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — まだ同期中。
* `false` — 完全に同期され、現在の状態を提供中。

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

`network` フィールドは `qorechain-vladi`（メインネット）または `qorechain-diana`（テストネット）を報告するはずです。

### PrometheusとGrafana

QoreChainはポート **26660** でPrometheusメトリクスを公開しています。

```
http://localhost:26660/metrics
```

これらを任意のPrometheus互換コレクターでスクレイプします。Docker Composeのモニタリングスタックを実行する場合、Grafanaは `http://localhost:3001` で利用できます。初回ログイン時に独自の認証情報を設定してください。ブロック高さのラグ、ピア数、リソース使用量を追跡し、`catching_up` が `true` のまま留まったり、ピア数がゼロに落ちたりした場合にアラートを出してください。

### EVMエンドポイントのチェック

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## 運用のベストプラクティス

1. **チェーンバージョンを固定する。** 稼働中のタグ（メインネットでは **v3.1.77**）を実行し、協調的なアップグレードのために公式リリースを追跡します。

2. **冗長なノードを運用する。** ロードバランサーの背後で少なくとも2つのノードを運用し、単一の再起動や再同期が統合トラフィックを中断させないようにします。

3. **ジェネシスとスナップショットを検証する。** 起動前に、常にジェネシスのSHA-256とスナップショットチェックサムを公式リリースに対して検証します。

4. **公開エンドポイントを保護する。** RPC/EVM/gRPCの前にリバースプロキシ、レート制限、ファイアウォールを配置します。認証されていない書き込みRPCをインターネットに決して公開しないでください。

5. **必要に応じてプルーニングを合わせる。** 完全な入金／出金履歴を照合する取引所には `pruning = "nothing"` と `tx_index = "kv"` を使用し、軽量な参照には `default` を使用します。

6. **同期を継続的にモニタリングする。** ブロック高さのラグ、ピアゼロ、`catching_up` で立ち往生したノードにアラートを出します。

フルノードを実行せずに超軽量な読み取りアクセスを行うには、**ライトノード** のドキュメントを参照してください。

---

## 次のステップ

* [メインネットへの接続](/getting-started/connecting-to-mainnet) — メインネットのジェネシス、ピア、接続の詳細
* [バリデータの運用](/developer-guide/running-a-validator) — ブロック生成の責務を追加する
* [ソースからのビルド](/developer-guide/building-from-source) — `qorechaind` バイナリをビルドする
* **ライトノード** — 超軽量な読み取り専用アクセス（ドキュメントは近日公開）
