---
slug: /developer-guide/running-a-node
title: ノードの運用
sidebar_label: ノードの運用
sidebar_position: 10
---

# ノードの運用

本ガイドでは、**ノードのみ**のQoreChainデプロイ——チェーンを同期し、統合用のエンドポイントを公開するフル/RPCノード——について説明します。バリデーターの役割は**含みません**。対象は、ブロックの署名は行わないもののネットワークへの信頼できる読み書きアクセスを必要とする取引所(CEX)、ウォレットのバックエンド、インデクサー、インテグレーターです。

:::note
ブロック生成、ステーキング、スラッシング、プール分類については、[バリデーターの運用](/developer-guide/running-a-validator)を参照してください。ノードのみのデプロイは、バリデーターのコンセンサス鍵を一切保持せず、アクティブセットに現れることもありません。
:::

:::warning
バイナリ、ジェネシス、スナップショットはSHA-256チェックサム付きで[download.qore.host](https://download.qore.host)で公開されています。**インストールや展開の前に必ずチェックサムを検証**し、デポジットの検証は自分自身が同期したノードに対してのみ行ってください。
:::

:::note 信頼できる情報源: ライブマニフェスト
現在のバイナリ、ジェネシス、ピア、シード、およびステートシンクの信頼点はライブで更新されるJSONマニフェストとして公開されています——インストールスクリプトにバイナリのバージョン、チェックサム、スナップショットのファイル名をハードコードしないでください。新しいリリースが出た瞬間に古くなってしまうためです。

- メインネット: `https://download.qore.host/mainnet/latest.json`
- テストネット: `https://download.qore.host/testnet/latest.json`

マニフェストのフィールドには、`binary`(URLとsha256)、`genesis`(URL、sha256、sizeBytes)、`peers`、`seeds`、`p2pPort`、`stateSync`(1時間ごとに更新される信頼点)、`minCompatible`が含まれます。以下のインストールおよび参加手順では、このマニフェストを取得し、その時点の値を使用します。
:::

:::caution 新規参加ノードにはv3.1.92以降が必須
ジェネシスから同期する、またはアーカイブ/スナップショットからリプレイするノードは**v3.1.92以降**である必要があります——それより古いバージョンでは(マニフェストの`minCompatible`フィールドがまだこの点を反映するように更新されていない場合でも)、修正済みとなったガス計測のバグにより、リプレイ中にトランザクションを含む最初のブロックで停止します。

**マニフェスト自体がこの下限より遅れている場合があります**——マニフェストはまずテストネットで、猶予期間を置いてからメインネットで昇格されるため、本稿執筆時点でメインネットマニフェストの`binary.url`はまだv3.1.92より前のビルドを指しています。`binary.url`を信頼する前にマニフェストの`"version"`フィールドを確認してください。それがv3.1.92より古い場合は、マニフェストではなく[qorechain-core GitHub リリース](https://github.com/qorechain/qorechain-core/releases)からバイナリを取得する(そこで公開されているチェックサムを同様に確認する)か、ソースからビルドしてください。
:::

---

## ノード対バリデーター

| 項目                  | ノードのみ(本ガイド)                          | バリデーター                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| コンセンサス鍵       | なし                                              | ed25519コンセンサス鍵(要保護)    |
| ブロック生成    | なし                                              | あり——ブロックを提案・署名する           |
| ステーキング/スラッシング  | 該当なし                                                | セルフデリゲーション、スラッシングリスク             |
| 主な目的     | インテグレーション向けにRPC/REST/gRPC/EVM/SVMを提供する     | ネットワークを保護し、報酬を得る           |
| 公開範囲     | 通常はRPC/EVMエンドポイントを公開             | サントリーノードの背後に隠されたバリデーター       |

---

## 対象ネットワーク

| ネットワーク  | チェーンID            | EVMチェーンID         | 備考                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| メインネット  | `qorechain-vladi`   | `9801`(16進数 `0x2649`) | 主要——2026年6月7日より稼働中 |
| テストネット  | `qorechain-diana`   | `9800`               | まずここで統合をリハーサルすること |

本ガイド全体を通して、対象ネットワークに合わせて適切な`--chain-id`に置き換えてください。例ではデフォルトでメインネットを使用しています。

---

## 推奨ハードウェア

| プロファイル                  | CPU      | RAM   | ディスク(NVMe SSD)         | ネットワーク   |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| プルーニング済みRPCノード          | 4コア  | 16 GB | 500 GB以上                 | 100 Mbps以上 |
| フル/アーカイブノード        | 8コア  | 32 GB | 2 TB以上(時間とともに増加) | 1 Gbps    |
| 取引所統合     | 8コア  | 32 GB | 余裕を持たせた2 TB以上     | 1 Gbps    |

NVMe SSDを強く推奨します——チェーンの状態およびEVM/SVMストアはI/O負荷が高いためです。アーカイブノード(プルーニングなし、全トランザクションインデックス)は継続的に増大するため、余裕を持ったディスク容量を用意し、監視を行ってください。

---

## デプロイ

### Docker Compose

Docker Composeによるノードのみのデプロイです。まだ公開されている`qorechaind`イメージは存在しないため、リポジトリの`Dockerfile`から自分でビルドし、稼働中のチェーンバージョン(メインネットでは**v3.1.92**)にタグを合わせ、チェーンデータ用に永続ボリュームをマウントしてください。

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
docker build -t qorechain-node:v3.1.92 .
```

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain-node:v3.1.92
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

データディレクトリを一度初期化してから(ジェネシスとピア設定は以下で説明します)、起動します。

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

ベアメタルにインストールする場合は、`qorechaind`をsystemd配下で実行します。

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

### 2. マニフェストの取得

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

以下の手順では、このファイルをバイナリ、ジェネシス、ピアの値の情報源として使用してください——`jq -r .minCompatible latest.json`を確認しますが、そのフィールドが遅れていても上記の**v3.1.92の下限**が適用されることに変わりはない点に注意してください。

### 3. ジェネシスのダウンロードと検証

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -

# チェーンがライブで配信しているジェネシスと突き合わせて検証する:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 4. ピアと手数料フロアの設定

ノードIDやホストをハードコードするのではなく、マニフェストから現在のピアとシードを読み取ってください——これらは頻繁に入れ替わります。

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

`~/.qorechaind/config/config.toml`を開き、`persistent_peers`(および`seeds`)をこれらの値に設定します。

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

続いて、`~/.qorechaind/config/app.toml`で最小ガス価格を設定します(ネットワークの手数料フロア: **0.1uqor**)。

```toml
minimum-gas-prices = "0.1uqor"
```

### 5. 同期の開始

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## 高速ブートストラップ

ジェネシスからの同期には長い時間がかかることがあります。統合作業では、コールドスタートを高速化するために**ステートシンク**または**スナップショット**を使用してください。

### ステートシンク

ステートシンクは、すべてのブロックをリプレイする代わりに、信頼できるRPCサーバーから最近のアプリケーション状態のスナップショットを取得します。`config.toml`の`[statesync]`セクションを設定します。

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

`trust_height`/`trust_hash`はマニフェストの`stateSync`フィールドから取得してください——1時間ごとに更新されるため、こちらを優先的な情報源としてください。

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

フォールバック/代替手段として、公開RPCから信頼するブロック高とハッシュを自分で導出することもできます。

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### スナップショットからの復元

代わりに、公開されているチェーンデータのスナップショットをダウンロードし、チェックサムを検証してから、データディレクトリに展開する方法もあります。マニフェストには現時点でスナップショットへのポインタが含まれていないため、ファイル名をハードコードするのではなく、現在のファイル名とチェックサムについて[download.qore.host](https://download.qore.host)のライブ一覧を確認してください。

```bash
# download.qore.host の一覧にある現在のファイル名とチェックサムに置き換えること
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # 併せて公開されているチェックサムと比較する

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
スナップショットは頻繁に変化する**ブロック高が刻まれたファイル名**で公開されます——最新のスナップショットとそのSHA-256チェックサムについては[download.qore.host](https://download.qore.host)を確認し、展開前に必ず検証してください。上記の**v3.1.92という最低要件**は、スナップショットからのリプレイにも適用される点に注意してください。
:::

---

## プルーニングとインデックス

統合の用途に合わせて、プルーニングとトランザクションインデックスを調整してください。完全なトランザクション履歴を必要とする取引所は、最小限のプルーニングとトランザクションインデクサーを有効にした状態で運用する必要があります。

### プルーニング(`app.toml`)

```toml
# 最近の状態のみ保持——ディスク使用量が最小
pruning = "default"

# すべて保持——アーカイブ/完全な履歴クエリに必要
# pruning = "nothing"
```

| `pruning`   | 挙動                                | 用途                          |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | 最近の状態を保持し、それ以外はプルーニングする      | RPCノード、残高/状態の照会   |
| `nothing`   | すべての履歴状態を保持する               | アーカイブノード、完全な履歴                    |
| `custom`    | オペレーターが定義する保持/間隔の値    | 保持期間のチューニング                    |

### トランザクションインデックス(`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

`indexer = "kv"`(またはより高機能なインデクサー)を設定し、トランザクションをハッシュやイベントで照会できるようにしてください——これはデポジットと出金を照合する取引所にとって不可欠です。過去のトランザクション照会が不要な場合のみ`indexer = "null"`を設定してください。

---

## 統合向けエンドポイントの公開

`app.toml`で、インテグレーターに必要なAPIサーバーを有効化・バインドします。

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

そして`config.toml`でRPCリスナーを設定します。

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| エンドポイント     | ポート   | 用途                                                |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | トランザクションのブロードキャスト、ブロック/ステータスの照会      |
| REST         | `1317`  | チェーン状態のHTTP照会                            |
| gRPC         | `9090`  | 高スループットなプログラムからのアクセス                    |
| EVM JSON-RPC | `8545`  | Ethereum互換の統合(チェーンID `9801`)     |
| EVM WS       | `8546`  | EVMイベントの購読                            |
| SVM RPC      | `8899`  | Solana互換の統合                         |

:::warning
リバースプロキシ、レート制限、認証、ファイアウォールなしに、RPC、EVM JSON-RPC、gRPCを直接インターネットに公開しないでください。`0.0.0.0`へのバインドは、制御された入口層の背後でのみ行ってください。
:::

---

## ヘルスと同期の監視

### 同期ステータス

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — 同期中。
* `false` — 完全に同期済みで、現在の状態を提供中。

```bash
# 最新のブロック高とネットワーク
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

`network`フィールドには、`qorechain-vladi`(メインネット)または`qorechain-diana`(テストネット)が表示されるはずです。

### PrometheusとGrafana

QoreChainはポート**26660**でPrometheusメトリクスを公開します。

```
http://localhost:26660/metrics
```

Prometheus互換の任意のコレクターでこれをスクレイプしてください。Docker Composeの監視スタックを実行している場合、Grafanaは`http://localhost:3001`で利用でき——初回ログイン時に自分の認証情報を設定してください。ブロック高の遅延、ピア数、リソース使用状況を追跡し、`catching_up`が`true`のままになった場合やピア数がゼロになった場合はアラートを出してください。

### EVMエンドポイントの確認

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# メインネットでは "0x2649"(9801)が返るはず
```

---

## 運用上のベストプラクティス

1. **チェーンバージョンを固定する。** 稼働中のタグ(メインネットでは**v3.1.92**)を実行し、協調アップグレードのため公式リリースを追跡してください。

2. **冗長なノードを運用する。** 単一ノードの再起動や再同期が統合トラフィックを中断させないよう、ロードバランサーの背後に少なくとも2台のノードを配置してください。

3. **ジェネシスとスナップショットを検証する。** 起動前に、必ずジェネシスのSHA-256と、あらゆるスナップショットのチェックサムを公式リリースと照合してください。

4. **公開エンドポイントを保護する。** RPC/EVM/gRPCの前段にリバースプロキシ、レート制限、ファイアウォールを設置してください。認証のない書き込み用RPCを絶対にインターネットへ公開しないでください。

5. **プルーニングを用途に合わせる。** 完全な入出金履歴を照合する取引所には`pruning = "nothing"`と`tx_index = "kv"`を、軽量な照会には`default`を使用してください。

6. **同期を継続的に監視する。** ブロック高の遅延、ピア数ゼロ、`catching_up`で行き詰まったノードについてアラートを設定してください。

フルノードを実行しない超軽量な読み取りアクセスについては、**ライトノード**のドキュメントを参照してください。

---

## トラブルシューティング

### アップグレード前に停止していたノードがバイナリ差し替え後も再開しない

ノードがバイナリをアップグレードする**前に**既に停止またはスタックしていた場合、単に新しいバイナリを配置して再起動するだけでは不十分です——ノードは古い実行時のABCI結果をキャッシュしたままであり、停止の原因となったブロックを再実行しません。再起動の前に明示的にロールバックしてください。

```bash
qorechaind rollback --home <HOME>
systemctl restart <unit>
```

コマンドは`qorechaind rollback`(トップレベルのサブコマンド)です——`comet rollback`というサブコマンドは存在せず、これに`--hard`フラグもありません。

### `priv_validator_state.json`が欠落してスナップショット復元がクラッシュループする

公開されているアーカイブ/スナップショットには`data/priv_validator_state.json`が**含まれておらず**、ノードはこのファイルがないと起動を拒否します。スナップショット復元後にこのファイルが欠落している場合は作成してください——ただし**存在しない場合に限ります**。実在するファイルを絶対に上書きしないでください。バリデーターにおいて、このファイルは二重署名防止のガードであり、これを上書きすると二重署名のリスクが生じます。

```bash
echo '{"height":"0","round":0,"step":0}' > <HOME>/data/priv_validator_state.json
```

---

## 次のステップ

* [メインネットへの接続](/getting-started/connecting-to-mainnet) — メインネットのジェネシス、ピア、接続の詳細
* [バリデーターの運用](/developer-guide/running-a-validator) — ブロック生成の役割を追加する
* [ソースからのビルド](/developer-guide/building-from-source) — `qorechaind`バイナリをビルドする
* **ライトノード** — 超軽量な読み取り専用アクセス(ドキュメントは近日公開予定)
