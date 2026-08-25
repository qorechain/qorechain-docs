---
slug: /getting-started/connecting-to-mainnet
title: メインネットへの接続
sidebar_label: メインネットへの接続
sidebar_position: 3
---

# メインネットへの接続

公式のジェネシスファイル、ピア、ネットワーク設定でノードを構成し、稼働中のQoreChain Vladiメインネットに参加します。

:::note
このページは、Cosmos SDK v0.53上でチェーンバージョン**v3.1.92**を稼働し、**2026年6月7日 23:59 UTC**から稼働している**`qorechain-vladi`**メインネット(EVMチェーンID **9801**、16進数`0x2649`)を対象としています。**`qorechain-diana`**テストネット(EVMチェーンID **9800**)については、[テストネットへの接続](/getting-started/connecting-to-testnet)を参照し、本番稼働前にそちらでセットアップをリハーサルしてください。
:::

## パブリックエンドポイント

**チェーンへの照会またはトランザクションのブロードキャスト**のみが必要な場合、自分のノードを用意する必要はありません。パブリックエンドポイントは以下の通りです。

| サービス | URL |
|---|---|
| コンセンサスRPC | `https://rpc.qore.host` (WebSocket: `wss://rpc.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` (チェーンID `9801`) |
| SVM JSON-RPC (読み取り専用) | `https://svm.qore.host` |
| ブロックエクスプローラー | [explore.qore.network](https://explore.qore.network) |

高負荷または本番用途のワークロード(取引所、インデクサーなど)には、以下の手順に従って自分のノードを運用してください。

---

## インストール

`qorechaind`バイナリは、公式のビルド済みバンドルから、またはソースからビルドしてインストールします。

### ビルド済みバイナリバンドル (linux/amd64)

現在のバイナリに関する正式な情報源は**メインネットマニフェスト**であり、これは`https://download.qore.host/mainnet/latest.json`でリアルタイムに更新されるJSONファイルです。このファイルには、現在のバイナリのURLとSHA-256、現在のジェネシスのURL/SHA-256/サイズ、現在のピアとシード、P2Pポート、ステートシンクのトラストポイント、そして最小互換チェーンバージョンが含まれています。インストールスクリプトにバイナリのバージョンやチェックサムをハードコードするのではなく、このファイルを取得してその値を使用してください。ハードコードした値は新しいリリースが出るとすぐに古くなってしまいます。

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

このバンドルには`qorechaind`と、必要な共有ライブラリ(`libqorepqc.so`、`libqoresvm.so`、`libwasmvm.x86_64.so`)が含まれています。

:::caution ノードを最新に保つ — 新規同期にはv3.1.92以降が必須
フルノードはネットワークの現行チェーンバージョンに追随する必要があります。マニフェストが指すバイナリを常にインストールし、古いバージョンに固定しないでください。マニフェストの`minCompatible`フィールドとは別に、**ジェネシスから新規参加する、または停止から復旧するノードにはv3.1.92以降が必須です**。それより古いバージョンでは、トランザクションを含む最初のブロックでリプレイが停止してしまう、現在は修正済みのガス計測バグにより、完全な同期を完了できません。すでに同期済みで古いバージョンを稼働しているノードも、次の機会にアップグレードすべきです。古いノードは新しいトランザクションタイプをデコードできず、ブロックにそれが現れた時点で同期が止まってしまうためです。

**マニフェストが実際に何を配信しているか、信用する前に確認してください。** マニフェストは意図的に段階的に展開されます。まずテストネット、そして一定のソーク期間を経てメインネットという順序のため、上記のバージョン下限より遅れることがあります。本稿執筆時点では、メインネットマニフェスト自体がまだv3.1.92より前のバイナリを指しており、これはまさにこの注意書きが新規同期に使わないよう述べているビルドです。`binary.url`を信頼する前に、マニフェストの`"version"`フィールドをv3.1.92と比較してください。もしまだそれより古い場合は、代わりに[qorechain-core GitHubリリース](https://github.com/qorechain/qorechain-core/releases)からv3.1.92(またはそれ以降)を入手するか(同じ方法でタグのチェックサムを検証してください)、[ソースからビルド](/developer-guide/building-from-source)してください。
:::

### ソースからビルド

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

完全な前提条件(Go 1.26+、CGO、Rustツールチェーン、ネイティブライブラリ)については、[ソースからのビルド](/developer-guide/building-from-source)を参照してください。

### ノードの初期化

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

これにより、`~/.qorechaind/`配下にデフォルトの設定ディレクトリとデータディレクトリが作成されます。

---

## ジェネシスのダウンロード

上記で取得したマニフェストのURLとSHA-256を使用して、ローカルのジェネシスファイルを公式のメインネットジェネシスに置き換えます。

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

同じファイルはチェーン自体からもリアルタイムで配信されているため、ダウンロードした内容をそれと突き合わせて検証できます。

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

このファイルは、ジェネシスバリデータセット、トークン配分(ジェネシス時のTGE)、モジュールパラメータを含む、Vladiメインネットの初期状態を定義します。

---

## ピアの設定

パブリックなメインネットのセントリーノードに接続するよう、ノードの設定を編集します。ノードIDやホストをハードコードするのではなく、現在のピアリストとシードリストはマニフェストから読み取ってください。これらは随時ローテーションされます。

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

`~/.qorechaind/config/config.toml`を開き、`persistent_peers`(および`seeds`)フィールドをこれらの値に設定します。

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

また、`~/.qorechaind/config/app.toml`で最小ガス価格を設定します(ネットワークの手数料下限は**0.1uqor**です)。

```toml
minimum-gas-prices = "0.1uqor"
```

### 推奨設定

`config.toml`で以下も調整するとよいでしょう。

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

これらの値は、Vladiメインネットのブロック生成時間とスループットに合わせて調整されています。

---

## 高速ブートストラップ(スナップショットまたはステートシンク)

ジェネシスからの同期には長い時間がかかることがあります。マニフェストの`stateSync`フィールドには、1時間ごとに更新されるトラストの高さ/ハッシュのペアが含まれています。高さを手動で調べるのではなく、これを使ってステートシンクを設定してください。

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

次に、これらの値を使って`config.toml`の`[statesync]`セクションを設定します。トラストポイントを自分で導出する必要がある場合の手動RPCベースのフォールバックを含む完全な手順については、[ノードの運用](/developer-guide/running-a-node)を参照してください。

チェーンデータのスナップショットは[download.qore.host](https://download.qore.host)でも公開されています。ファイル名や高さをハードコードせず、最新のスナップショットファイル名とそこに公開されているチェックサムを、そのページの現在の一覧で確認してください。新しいスナップショットが定期的に古いものに取って代わるためです。

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

---

## ノードの起動

ノードを起動してネットワークとの同期を開始します。

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

ノードはピアに接続し、ブロックのダウンロードを開始します(ジェネシスから、またはスナップショットを復元した場合はそのスナップショットの高さから)。

---

## 同期ステータスの確認

ノードが最新ブロックに追いついているかを確認します。

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — ノードはまだ同期中です。追いつくまで待ちます。
* `false` — ノードは完全に同期しており、新しいブロックを処理しています。

最新のブロック高を確認することもできます。

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

正しいネットワークに接続していることを確認してください。`network`フィールドは`qorechain-vladi`を返すはずです。

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## モニタリング

QoreChainは、ノードの状態とパフォーマンスをモニタリングするための複数のエンドポイントを公開しています。

### Prometheusメトリクス

生のメトリクスは以下で取得できます。

```
http://localhost:26660/metrics
```

これらのメトリクスは、Prometheus互換の任意のコレクターでスクレイピングできます。

### Grafanaダッシュボード

Docker Compose経由で実行している場合、Grafanaは以下で利用できます。

```
http://localhost:3001
```

初回ログイン時には、プロンプトが表示されたら必ず独自の認証情報を設定してください。デフォルトのままにしないでください。事前設定済みのダッシュボードには、ブロック生成状況、トランザクションスループット、ピア接続数、リソース使用状況が表示されます。

### RESTヘルスチェック

REST APIは、簡易ステータス確認用のエンドポイントを提供します。

```
http://localhost:1317
```

---

## ポート一覧

| ポート  | プロトコル | 説明                                                      |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — チェーンへの照会とトランザクションのブロードキャスト |
| `26656` | TCP       | P2P — ピアツーピアのネットワーク通信                       |
| `1317`  | HTTP      | REST API — HTTP経由でのチェーン状態の照会                  |
| `9090`  | gRPC      | gRPC API — プログラムによるチェーンアクセス                 |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum互換RPC(チェーンID `9801`)         |
| `8546`  | WebSocket | EVM WebSocket — リアルタイムのEVMイベント購読               |
| `8899`  | HTTP      | SVM RPC — Solana互換RPC                                   |
| `26660` | HTTP      | Prometheusメトリクスエンドポイント                          |

---

## ネットワーク情報

| 項目               | 値                                      |
| ----------------- | -------------------------------------- |
| チェーンID          | `qorechain-vladi`                      |
| EVMチェーンID       | `9801` (hex `0x2649`)                  |
| チェーンバージョン   | v3.1.92                                |
| 稼働開始           | 2026年6月7日 23:59 UTC                  |
| トークン           | QOR (`uqor`、10^6マイクロ単位 = 1 QOR) |
| 最小ガス価格        | `0.1uqor`                              |
| アカウントプレフィックス | `qor`                                  |
| バリデータプレフィックス | `qorvaloper`                           |
| SDK               | Cosmos SDK v0.53                       |

---

## 次のステップ

* [ノードの運用](/developer-guide/running-a-node) — 取引所やインテグレーター向けにフル/RPCノードを運用する
* [取引所・インテグレーターガイド](/developer-guide/exchange-integration) — 入金、出金、モニタリング
* [バリデータの運用](/developer-guide/running-a-validator) — バリデータの作成と運用
* [ウォレットのセットアップ](/getting-started/wallet-setup) — メインネット用にウォレットを設定する
* [はじめてのトランザクション](/getting-started/first-transaction) — 最初のQOR送金を行う
* [テストネットへの接続](/getting-started/connecting-to-testnet) — 無料でテストできるDianaテストネットに参加する
* [ネットワーク](/appendix/networks) — チェーンID、ポート、ネットワークの完全なリファレンス
