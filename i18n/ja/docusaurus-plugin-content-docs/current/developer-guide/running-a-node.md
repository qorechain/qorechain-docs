---
slug: /developer-guide/running-a-node
title: ノードの運用
sidebar_label: ノードの運用
sidebar_position: 10
---

# ノードの運用

このガイドでは、**ノード専用（node-only）**の QoreChain デプロイメント — バリデーター業務を**行わず**に、チェーンを同期して統合向けのエンドポイントを公開するフルノードまたは RPC ノード — の運用について説明します。対象は、ブロックに署名することなくネットワークへの信頼性の高い読み書きアクセスを必要とする取引所（CEX）、ウォレットバックエンド、インデクサー、およびインテグレーターです。

:::note
ブロック生成、ステーキング、スラッシング、プール分類については、代わりに[バリデーターの運用](/developer-guide/running-a-validator)を参照してください。ノード専用のデプロイメントは、バリデーターのコンセンサスキーを保持することはなく、アクティブセットに現れることもありません。
:::

:::warning
バイナリ、ジェネシス、スナップショットは [download.qore.host](https://download.qore.host) で SHA-256 チェックサムとともに公開されています。**インストールや展開の前に必ずチェックサムを検証**し、入金の確認は必ず自身の同期済みノードに対してのみ行ってください。
:::

---

## ノードとバリデーターの違い

| 項目                | ノード専用（本ガイド）                          | バリデーター                               |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| コンセンサスキー    | なし                                            | ed25519 コンセンサスキー（保護が必須）     |
| ブロック生成        | なし                                            | あり — ブロックの提案と署名を行う          |
| ステーキング / スラッシング | 該当なし                                | セルフデリゲーション、スラッシングのリスク |
| 主な目的            | 統合向けに RPC/REST/gRPC/EVM/SVM を提供         | ネットワークの保護と報酬の獲得             |
| 公開範囲            | RPC/EVM エンドポイントは通常公開される          | バリデーターはセントリーノードの背後に隠す |

---

## 対象ネットワーク

| ネットワーク | チェーン ID          | EVM チェーン ID       | 備考                           |
| -------- | ------------------- | -------------------- | ------------------------------ |
| メインネット | `qorechain-vladi`   | `9801`（16進 `0x2649`） | プライマリ — 2026年6月7日から稼働中 |
| テストネット | `qorechain-diana`   | `9800`               | 統合はまずここでリハーサルしてください |

このガイド全体を通して、対象ネットワークに応じた `--chain-id` に置き換えてください。例はメインネットをデフォルトとしています。

---

## 推奨ハードウェア

| プロファイル             | CPU      | RAM   | ディスク（NVMe SSD）     | ネットワーク |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| プルーニング済み RPC ノード | 4 コア  | 16 GB | 500 GB 以上              | 100 Mbps 以上 |
| フル/アーカイブノード     | 8 コア  | 32 GB | 2 TB 以上（時間とともに増加） | 1 Gbps    |
| 取引所統合               | 8 コア  | 32 GB | 2 TB 以上＋余裕を確保     | 1 Gbps    |

NVMe SSD を強く推奨します — チェーン状態と EVM/SVM のストアは I/O 負荷が高いためです。アーカイブノード（プルーニングなし、フルトランザクションインデックス）は継続的に増加します。ディスクは余裕を持って確保し、監視を行ってください。

---

## デプロイメント

### Docker Compose

Docker Compose によるノード専用のデプロイメントです。イメージタグを稼働中のチェーンバージョン（メインネットは **v3.1.85**）に固定し、チェーンデータ用の永続ボリュームをマウントしてください。

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.85
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

データディレクトリを一度初期化し（ジェネシスとピアの設定は後述）、その後起動します。

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

ベアメタルへのインストールでは、`qorechaind` を systemd で実行します。

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
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 3. ピアと手数料フロアの設定

`~/.qorechaind/config/config.toml` を開き、メインネットの公開セントリーピアを設定します。

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

次に `~/.qorechaind/config/app.toml` で最低ガス価格を設定します（ネットワーク手数料フロア: **0.1uqor**）。

```toml
minimum-gas-prices = "0.1uqor"
```

### 4. 同期の開始

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## 高速ブートストラップ

ジェネシスからの同期には長い時間がかかることがあります。統合用途では、**ステートシンク**または**スナップショット**を使って高速なコールドスタートを行ってください。

### ステートシンク

ステートシンクは、すべてのブロックを再生する代わりに、信頼できる RPC サーバーから最新のアプリケーション状態スナップショットを取得します。`config.toml` の `[statesync]` セクションを設定します。

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

公開 RPC から最新の信頼できるブロック高とハッシュを取得します。

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### スナップショットからのリストア

もう一つの方法として、公開されているチェーンデータのスナップショットをダウンロードし、チェックサムを検証した上で、データディレクトリに展開します。

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
スナップショットは**ブロック高付きのファイル名**で公開されています — 最新のスナップショットとその SHA-256 チェックサムは [download.qore.host](https://download.qore.host) で確認し、展開前に必ず検証してください。
:::

---

## プルーニングとインデックス

統合の要件に合わせてプルーニングとトランザクションインデックスを調整してください。完全なトランザクション履歴を必要とする取引所は、最小限のプルーニングとトランザクションインデクサーを有効にして運用すべきです。

### プルーニング（`app.toml`）

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | 動作                                     | ユースケース                       |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | 最近の状態のみを保持し、残りをプルーニング | RPC ノード、残高/状態の照会        |
| `nothing`   | すべての履歴状態を保持                    | アーカイブノード、完全な履歴        |
| `custom`    | オペレーター定義の保持/間隔の値           | チューニングした保持ポリシー        |

### トランザクションインデックス（`config.toml`）

```toml
[tx_index]
indexer = "kv"
```

`indexer = "kv"`（またはより高機能なインデクサー）を設定すると、トランザクションをハッシュやイベントで検索できるようになります — 入出金を照合する取引所には必須です。過去のトランザクション照会が不要な場合にのみ `indexer = "null"` を設定してください。

---

## 統合向けエンドポイントの公開

インテグレーターに必要な API サーバーを `app.toml` で有効化してバインドします。

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

RPC リスナーは `config.toml` で設定します。

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| エンドポイント | ポート | 用途                                                   |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | トランザクションのブロードキャスト、ブロック/ステータスの照会 |
| REST         | `1317`  | チェーン状態の HTTP クエリ                             |
| gRPC         | `9090`  | 高スループットのプログラマティックアクセス             |
| EVM JSON-RPC | `8545`  | Ethereum 互換の統合（チェーン ID `9801`）              |
| EVM WS       | `8546`  | EVM イベントのサブスクリプション                       |
| SVM RPC      | `8899`  | Solana 互換の統合                                      |

:::warning
RPC、EVM JSON-RPC、gRPC を、リバースプロキシ、レート制限、認証、ファイアウォールなしで公開インターネットに直接さらさないでください。`0.0.0.0` へのバインドは、必ず管理されたイングレス層の背後でのみ行ってください。
:::

---

## ヘルスチェックと同期の監視

### 同期ステータス

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — まだ同期中。
* `false` — 完全に同期済みで、最新の状態を提供中。

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

`network` フィールドには `qorechain-vladi`（メインネット）または `qorechain-diana`（テストネット）が表示されるはずです。

### Prometheus と Grafana

QoreChain はポート **26660** で Prometheus メトリクスを公開しています。

```
http://localhost:26660/metrics
```

これらは任意の Prometheus 互換コレクターでスクレイプできます。Docker Compose の監視スタックを実行している場合、Grafana は `http://localhost:3001` で利用できます — 初回ログイン時に必ず独自の認証情報を設定してください。ブロック高の遅延、ピア数、リソース使用状況を追跡し、`catching_up` が `true` のまま続く場合やピア数がゼロになった場合にアラートを発生させてください。

### EVM エンドポイントの確認

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## 運用のベストプラクティス

1. **チェーンバージョンを固定する。** 稼働中のタグ（メインネットは **v3.1.85**）を実行し、協調アップグレードに備えて公式リリースを追跡してください。

2. **冗長なノードを運用する。** ロードバランサーの背後で少なくとも 2 台のノードを運用し、単一の再起動や再同期が統合トラフィックを中断しないようにしてください。

3. **ジェネシスとスナップショットを検証する。** 起動前に、ジェネシスの SHA-256 とすべてのスナップショットのチェックサムを必ず公式リリースと照合してください。

4. **公開エンドポイントを保護する。** RPC/EVM/gRPC の前段にリバースプロキシ、レート制限、ファイアウォールを配置してください。認証なしの書き込み RPC をインターネットに公開しないでください。

5. **プルーニングを用途に合わせる。** 完全な入出金履歴を照合する取引所には `pruning = "nothing"` と `tx_index = "kv"` を組み合わせて使用し、軽量な照会には `default` を使用してください。

6. **同期を継続的に監視する。** ブロック高の遅延、ピア数ゼロ、`catching_up` のまま停止しているノードに対してアラートを設定してください。

フルノードを実行せずに超軽量な読み取りアクセスを行いたい場合は、**Light Node** のドキュメントを参照してください。

---

## 次のステップ

* [メインネットへの接続](/getting-started/connecting-to-mainnet) — メインネットのジェネシス、ピア、接続の詳細
* [バリデーターの運用](/developer-guide/running-a-validator) — ブロック生成の役割を追加する
* [ソースからのビルド](/developer-guide/building-from-source) — `qorechaind` バイナリをビルドする
* **Light Node** — 超軽量の読み取り専用アクセス（ドキュメントは近日公開）
