---
slug: /developer-guide/running-a-node
title: ノードの運用
sidebar_label: ノードの運用
sidebar_position: 10
---

# ノードの運用

このガイドでは、**ノード専用（node-only）**の QoreChain デプロイメント — バリデーター業務を**行わず**に、チェーンを同期して統合向けのエンドポイントを公開するフルノードまたは RPC ノード — の運用について説明します。対象は、ブロックに署名することなくネットワークへの信頼性の高い読み書きアクセスを必要とする取引所（CEX）、ウォレットバックエンド、インデクサー、およびインテグレーターです。

:::note
ブロック生成、ステーキング、スラッシング、プール分類については、代わりに[バリデーターの運用](/developer-guide/running-a-validator)を参照してください。ノード専用デプロイメントは、バリデーターのコンセンサスキーを保持することはなく、アクティブセットに登場することもありません。
:::

:::warning
バイナリ、ジェネシス、スナップショットは SHA-256 チェックサムとともに [download.qore.host](https://download.qore.host) で公開されています。**インストールや展開の前に必ずチェックサムを検証し**、入金の確認は必ず自身で同期したノードに対してのみ行ってください。
:::

---

## ノードとバリデーターの違い

| 項目                | ノード専用（本ガイド）                          | バリデーター                               |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| コンセンサスキー    | なし                                            | ed25519 コンセンサスキー（要厳重管理）     |
| ブロック生成        | なし                                            | あり — ブロックの提案と署名を行う          |
| ステーキング / スラッシング | 対象外                                   | セルフデリゲーション、スラッシングリスク   |
| 主な用途            | 統合向けに RPC/REST/gRPC/EVM/SVM を提供         | ネットワークの保護、報酬の獲得             |
| 公開露出            | RPC/EVM エンドポイントを公開するのが一般的      | バリデーターはセントリーノードの背後に隠す |

---

## 対象ネットワーク

| ネットワーク | チェーン ID         | EVM チェーン ID       | 備考                           |
| -------- | ------------------- | -------------------- | ------------------------------ |
| メインネット | `qorechain-vladi`   | `9801`（16進 `0x2649`） | プライマリ — 2026年6月7日より稼働中 |
| テストネット | `qorechain-diana`   | `9800`               | まずここで統合のリハーサルを行ってください |

このガイド全体を通して、対象ネットワークに応じた `--chain-id` に置き換えてください。例はメインネットをデフォルトとしています。

---

## 推奨ハードウェア

| プロファイル             | CPU      | RAM   | ディスク（NVMe SSD）    | ネットワーク |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| プルーニング済み RPC ノード | 4 コア | 16 GB | 500 GB 以上             | 100 Mbps 以上 |
| フル / アーカイブノード  | 8 コア   | 32 GB | 2 TB 以上（経時的に増加） | 1 Gbps    |
| 取引所統合               | 8 コア   | 32 GB | 2 TB 以上（余裕を確保）  | 1 Gbps    |

NVMe SSD を強く推奨します — チェーン状態および EVM/SVM ストアは I/O 集約的です。アーカイブノード（プルーニングなし、フル tx インデックス）は継続的に増大するため、余裕を持ったディスク容量と監視を用意してください。

---

## デプロイメント

### Docker Compose

Docker Compose によるノード専用デプロイメントです。イメージタグは稼働中のチェーンバージョン（メインネットでは **v3.1.82**）に固定し、チェーンデータ用に永続ボリュームをマウントしてください。

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.82
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

データディレクトリを一度初期化し（ジェネシスとピアの設定は後述）、その後起動します：

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

ベアメタルインストールの場合は、systemd 配下で `qorechaind` を実行します：

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

`~/.qorechaind/config/config.toml` を開き、公開メインネットのセントリーピアを設定します：

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

次に、`~/.qorechaind/config/app.toml` で最小ガス価格を設定します（ネットワーク手数料フロア：**0.1uqor**）：

```toml
minimum-gas-prices = "0.1uqor"
```

### 4. 同期の開始

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## 高速ブートストラップ

ジェネシスからの同期には長い時間がかかることがあります。統合用途では、**ステートシンク**または**スナップショット**を使用して高速なコールドスタートを行ってください。

### ステートシンク

ステートシンクは、すべてのブロックを再生する代わりに、信頼できる RPC サーバーから最近のアプリケーション状態スナップショットを取得します。`config.toml` の `[statesync]` セクションを設定します：

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

公開 RPC から最近の信頼できる高さとハッシュを取得します：

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### スナップショットからのリストア

あるいは、公開されているチェーンデータのスナップショットをダウンロードし、チェックサムを検証したうえで、データディレクトリに展開します：

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

プルーニングとトランザクションインデックスは統合内容に合わせて調整してください。トランザクションの全履歴を必要とする取引所は、最小限のプルーニングとトランザクションインデクサーを有効にして運用する必要があります。

### プルーニング（`app.toml`）

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | 動作                                     | ユースケース                       |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | 最近の状態のみ保持し、残りをプルーニング | RPC ノード、残高/状態の照会       |
| `nothing`   | すべての履歴状態を保持                   | アーカイブノード、全履歴          |
| `custom`    | オペレーター定義の keep/interval 値      | 保持期間のチューニング            |

### トランザクションインデックス（`config.toml`）

```toml
[tx_index]
indexer = "kv"
```

`indexer = "kv"`(またはより高機能なインデクサー)を設定すると、トランザクションをハッシュやイベントで照会できるようになります — 入出金を照合する取引所には不可欠です。過去の tx クエリが不要な場合にのみ `indexer = "null"` を設定してください。

---

## 統合向けエンドポイントの公開

インテグレーターが必要とする API サーバーを `app.toml` で有効化してバインドします：

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

また、RPC リスナーは `config.toml` で設定します：

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
リバースプロキシ、レート制限、認証、ファイアウォールなしで、RPC、EVM JSON-RPC、gRPC を公開インターネットに直接晒すことは絶対に避けてください。`0.0.0.0` へのバインドは、制御されたイングレス層の背後でのみ行ってください。
:::

---

## ヘルスチェックと同期監視

### 同期ステータス

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — まだ同期中です。
* `false` — 完全に同期済みで、最新の状態を提供しています。

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

`network` フィールドには `qorechain-vladi`（メインネット）または `qorechain-diana`（テストネット）と表示されるはずです。

### Prometheus と Grafana

QoreChain はポート **26660** で Prometheus メトリクスを公開しています：

```
http://localhost:26660/metrics
```

これらは Prometheus 互換の任意のコレクターでスクレイプできます。Docker Compose の監視スタックを実行している場合、Grafana は `http://localhost:3001` で利用できます — 初回ログイン時に独自の認証情報を設定してください。ブロック高の遅延、ピア数、リソース使用量を追跡し、`catching_up` が `true` のまま続く場合やピア数がゼロになった場合にアラートを発報してください。

### EVM エンドポイントの確認

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## 運用のベストプラクティス

1. **チェーンバージョンを固定する。** 稼働中のタグ（メインネットでは **v3.1.82**）を実行し、協調アップグレードに備えて公式リリースを追跡してください。

2. **冗長なノードを運用する。** 単一ノードの再起動や再同期が統合トラフィックを中断させないよう、ロードバランサーの背後で少なくとも 2 台のノードを運用してください。

3. **ジェネシスとスナップショットを検証する。** 起動前に、ジェネシスの SHA-256 とすべてのスナップショットのチェックサムを、必ず公式リリースと照合して検証してください。

4. **公開エンドポイントを保護する。** RPC/EVM/gRPC の前段にリバースプロキシ、レート制限、ファイアウォールを配置してください。認証なしの書き込み RPC をインターネットに公開することは絶対に避けてください。

5. **プルーニングをニーズに合わせる。** 入出金の全履歴を照合する取引所には `pruning = "nothing"` と `tx_index = "kv"` の組み合わせを、軽量な照会には `default` を使用してください。

6. **同期を継続的に監視する。** ブロック高の遅延、ピア数ゼロ、`catching_up` のまま停滞しているノードに対してアラートを設定してください。

フルノードを運用せずに超軽量の読み取りアクセスを行う場合は、**ライトノード**のドキュメントを参照してください。

---

## 次のステップ

* [メインネットへの接続](/getting-started/connecting-to-mainnet) — メインネットのジェネシス、ピア、接続の詳細
* [バリデーターの運用](/developer-guide/running-a-validator) — ブロック生成の役割を追加する
* [ソースからのビルド](/developer-guide/building-from-source) — `qorechaind` バイナリをビルドする
* **ライトノード** — 超軽量の読み取り専用アクセス（ドキュメントは近日公開予定）
