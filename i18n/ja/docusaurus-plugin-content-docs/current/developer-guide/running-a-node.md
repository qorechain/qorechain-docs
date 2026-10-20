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

:::caution マニフェストが指すリリースを使用してください: メインネットではv3.2.3
ジェネシスから同期する、またはスナップショットからリプレイするノードは、複数のガバナンスアップグレード(下記の[アップグレード](#upgrades)を参照)を通過します。そのため、必ずマニフェストが指すバイナリをインストールしてください。そのバイナリにはすべてのアップグレードハンドラーが含まれています。**メインネット**では、マニフェストの`minCompatible`と`version`はどちらも`3.2.3`(2026年10月20日にブロック高3,662,051で適用された協調アップグレード)であるため、今から参加するノードにはv3.2.3が必要です。古いバイナリは、知らないアップグレード高で停止します。**テストネット**では、どちらも`3.2.4`(2026年10月19日にブロック高8,337,253で適用)です。メインネットはブロック高3,742,566までv3.2.3を、そのブロックからv3.2.4を実行します(ガバナンス提案13)。そのため、メインネットに対してテストネットのバイナリを実行しないでください。また、マニフェストがv3.2.4を示すまでは、メインネットのノードにv3.2.4をインストールしないでください([アップグレード](#upgrades)を参照)。マニフェストはまずテストネットで、猶予期間を置いてからメインネットで意図的に昇格されるため、`binary.url`を信頼する前に、マニフェストの`"version"`フィールドを`minCompatible`と照らし合わせて確認してください。

公開ソースからビルドしたバイナリ(コミュニティ版ビルド)は、どちらの公開ネットワークでも起動を拒否します(v3.2.3以降)。ポスト量子署名を検証できず、ネットワークのブロックを忠実にリプレイすることもできないためです。リリースアーカイブのみを使用してください。

v3.2.1以降では2つの設定が重要です。システムクロックをNTPで同期させておくこと(ノードはクロックのずれが60秒を超えると停止します)、そして`app.toml`で`evm-chain-id`を設定することです([ノードの制限](#node-limits)を参照)。
:::

---

## ノード対バリデーター

| 項目                  | ノードのみ(本ガイド)                          | バリデーター                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| コンセンサス鍵       | なし                                              | ed25519コンセンサス鍵(要保護)    |
| ブロック生成    | なし                                              | あり——ブロックを提案・署名する           |
| ステーキング/スラッシング  | 該当なし                                                | セルフデリゲーション、スラッシングリスク             |
| 主な目的     | インテグレーション向けにRPC/REST/gRPC/EVM(および読み取り専用のSVM)を提供する     | ネットワークを保護する(ステーキング報酬が適用される)           |
| 公開範囲     | 通常はRPC/EVMエンドポイントを公開             | サントリーノードの背後に隠されたバリデーター       |

---

## 対象ネットワーク

| ネットワーク  | チェーンID            | EVMチェーンID         | 備考                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| メインネット  | `qorechain-vladi`   | `9801`(16進数 `0x2649`) | 主要——2026年6月7日より稼働中。ノードリリースv3.2.3(ブロック高3,742,566からv3.2.4) |
| テストネット  | `qorechain-diana`   | `9800`               | まずここで統合をリハーサルすること。ノードリリースv3.2.4(2026年10月19日から) |

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

Docker Composeによるノードのみのデプロイです。公開されている`qorechaind`イメージをpullすることはできません(プロジェクトのDocker Hub組織には何も公開されていません)。公開リポジトリの`Dockerfile`は**コミュニティ**バイナリ(ポスト量子ライブラリなし、スタブkeeper)をビルドします。これはローカル開発には適していますが、メインネットやテストネットには追従できず、v3.2.3以降はそれらでの起動を拒否します。ネットワークノードの場合は、`latest.json`に記載された**リリースアーカイブ**から自分でイメージをビルドし、リリースバージョン(メインネットでは**v3.2.3**、テストネットでは**v3.2.4**)でタグ付けしたうえで、チェーンデータ用に永続ボリュームをマウントしてください。

```bash
# Fetch and verify the release archive (see "Joining the Network" below for the manifest steps)
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
curl -fsSL "$(jq -r .binary.url latest.json)" -o qore.tgz
echo "$(jq -r .binary.sha256 latest.json)  qore.tgz" | sha256sum -c -
mkdir release && tar xzf qore.tgz -C release

cat > release/Dockerfile <<'EOF'
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates curl jq && rm -rf /var/lib/apt/lists/*
COPY qorechaind /usr/local/bin/qorechaind
COPY lib/ /opt/qorechain/lib/
ENV LD_LIBRARY_PATH=/opt/qorechain/lib
ENTRYPOINT ["qorechaind"]
EOF
docker build -t qorechain-node:v3.2.3 release/
```

アーカイブには`qorechaind`と、その共有ライブラリ(`libqorepqc.so`、`libqoresvm.so`、`libwasmvm.x86_64.so`)を収めた`lib/`ディレクトリが含まれます。上記のイメージはリリースアーカイブと同様に`linux/amd64`専用です。

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain-node:v3.2.3
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
      - "8899:8899"     # SVM RPC (read-only: SVM transactions are disabled)
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

データディレクトリを一度初期化してから(たとえば`docker compose run --rm qorechain-node init my-node --chain-id qorechain-vladi --home /root/.qorechaind`。ジェネシスとピア設定は以下で説明します)、起動します。

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

### 2. マニフェストの取得 {#fetch-the-manifest}

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

以下の手順では、このファイルをバイナリ、ジェネシス、ピアの値の情報源として使用してください——`jq -r .minCompatible latest.json`を確認し、少なくともそのリリースを実行してください(推奨リリースは`jq -r .version latest.json`です)。

### 3. ジェネシスのダウンロードと検証

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -

# Cross-verify against the genesis served live by the chain:
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

`qorechaind init <moniker> --chain-id qorechain-vladi`は、ネットワークのEVMチェーンIDも`app.toml`に書き込みます([ノードの制限](#node-limits)を参照)。ずっと前に初期化したhomeでは、この設定を確認してください。

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

代わりに、公開されているチェーンデータのスナップショットをダウンロードし、チェックサムを検証してから、データディレクトリに展開する方法もあります。メインネットでは、マニフェストの`snapshot`オブジェクトにURL、ブロック高(`height`)、サイズ、SHA-256が含まれます。**テストネットのマニフェストのスナップショットURLは現在`404`を返します(テストネットのスナップショットは公開されていません)。そのため、そちらではステートシンクを使用してください。** 使用する前に`snapshot.height`を確認してください。メインネットのスナップショットは約27 GBの単一アーカイブであり、古いものは追いつきに長い時間がかかります。現在公開されているメインネットのスナップショットは2026年8月21日(ブロック高1,966,629)のものです。v3.1.94、v3.2.0、v3.2.2、v3.2.3、v3.2.4のアップグレード高より前のものであるため、そこから復元したノードはマニフェストが示すリリースバイナリで約2か月分のブロックをリプレイします。ほとんどの場合、ステートシンクの方が適しています。

```bash
SNAP_URL=$(jq -r .snapshot.url latest.json)
SNAP_SHA256=$(jq -r .snapshot.sha256 latest.json)
curl -fsSL "$SNAP_URL" -o snapshot.tar.gz
echo "${SNAP_SHA256}  snapshot.tar.gz" | sha256sum -c -

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
マニフェストの`snapshot.height`と`snapshot.ts`フィールドはアーカイブの新しさを示しており、通常はステートシンク(上記)の方が27 GBのダウンロードより高速です。展開前に必ずチェックサムを検証し、スナップショットからリプレイする際は、すべてのアップグレードハンドラーを含むノードリリースを使用してください(このページ冒頭の注意を参照)。
:::

---

## アップグレード {#upgrades}

コンセンサスの変更は、**協調されたガバナンスアップグレード**として行われます。可決された提案がプラン名(たとえば`v3.2.3`)とブロック高を指定します。リリースバイナリにはアップグレードハンドラーが含まれており、プランの高さですべてのノードがそれを実行している必要があります。以前のバイナリのままのノードは**その高さで停止します**(これはアップグレードモジュールの意図された動作です)。マニフェストを見れば、リリースがどちらの種類かがわかります。`upgradeType`は、協調アップグレードの場合は`height`(`upgradeHeight`が設定されます)、ノードごとに入れ替えられるノードローカルなリリースの場合は`rolling`です。新しいバイナリは、その高さの**前に**インストールしてください。先にノードが停止した場合は、バイナリを入れ替えて再起動してください([トラブルシューティング](#troubleshooting)のロールバックに関する注記を参照)。

| リリース | メインネット `qorechain-vladi` | テストネット `qorechain-diana` |
| ------- | ------------------------- | ------------------------- |
| v3.1.94 | ブロック高 2,122,074 | 未適用 |
| v3.2.0 | ブロック高 2,981,742 | ブロック高 5,920,000 |
| v3.2.1 | ノードローカル、ブロック高なし | ノードローカル |
| v3.2.2 | ブロック高 3,556,788(2026年10月16日) | ブロック高 6,905,034(2026年10月2日) |
| v3.2.3 | ブロック高 3,662,051(2026年10月20日、ガバナンス提案11) | ブロック高 8,003,746(2026年10月15日) |
| v3.2.4 | メインネットではブロック高 3,742,566 に予定(ガバナンス提案13) | ブロック高 8,337,253(2026年10月19日、ガバナンス提案13) |

**メインネットのノード運用者がv3.2.4(ブロック高3,742,566)のために行うこと。** ガバナンス提案13は、プラン名を`v3.2.4`、ブロック高を3,742,566と定めており、ノードはそのブロック高までv3.2.3のままで、そこで停止し、v3.2.4で再起動する、としています。具体的には次のとおりです。

1. メインネットのマニフェスト(`https://download.qore.host/mainnet/latest.json`)がv3.2.4を掲載するまで、**v3.2.3**を実行し続けてください。マニフェストの`version`と`minCompatible`がまだ`3.2.3`で、v3.2.4のアップグレード高も示されていない間は、インストールするものはありません。テストネットのディレクトリにあるv3.2.4バイナリは、メインネットのリリースではありません。
2. マニフェストがv3.2.4を示したら、その`binary.url`からアーカイブをダウンロードし、`sha256`を検証し(提案の本文にもバイナリのsha256が公開されます)、ブロック高に**先立って**配置しておいてください。保留中のプラン(`name`と`height`)は`GET /cosmos/upgrade/v1beta1/current_plan`で、現在のブロック高はRPCの`GET /status`で確認できます。
3. ブロック高3,742,566で、まだv3.2.3のノードは**停止します**(これはアップグレードモジュールの意図された動作であり、障害ではありません)。すでに新しいバイナリを実行しているノードはアップグレードハンドラーを適用して継続します。先に停止してしまった場合は、バイナリを入れ替えて再起動してください。アップグレード後は、`GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.4`が`0`ではなくブロック高を返します。
4. アップグレード後にメインネットへ参加するノードは、その時点でマニフェストが示すリリースをインストールします(`version`を`minCompatible`と照らし合わせて確認してください)。

トランザクションの署名、アドレス、小数点桁数、メモ、手数料は、v3.2.4でも変更されません。

ライブの記録は`GET /cosmos/upgrade/v1beta1/applied_plan/<name>`(`0`は未適用)で、保留中のプランは`GET /cosmos/upgrade/v1beta1/current_plan`で確認できます。v3.2.2ではコンセンサスエンジン、Cosmos SDK(v0.53.8)、IBCの依存関係が引き上げられ、SDKのより厳格なトランザクションチェックにより、このリリースはノードごとの入れ替えではなく、アップグレード高で以前のバイナリを置き換える形になります。トランザクションの署名、アドレス、小数点桁数、メモ、手数料は、v3.2.2でもv3.2.3でも変更されていません。

**ステートシンクとクロック。** ステートシンクは、マニフェストの`stateSync`ブロック(`trustHeight`、`trustHash`、1時間ごとに更新)から信頼点を取得します。そこに記載されているRPCサーバーはプロジェクト自身のものであるため、本番ノードでは信頼できるRPCサーバーを追加し、信頼ハッシュを別の情報源と照合してください。クロックはNTPで同期させておいてください。ネットワークとのずれが60秒を超えると、ノードは停止します。

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

### ノードの制限(`app.toml`) {#node-limits}

ノードリリースv3.2.1以降、`init`は3つのノードローカルな制限を持つ`[qorechain]`セクションを書き込みます。これらが変更するのは、このノードがメモリに保持するものと、提案するブロックに含めるものだけであり、ブロックが有効であるために含まなければならない内容を変えることはありません。

```toml
[qorechain]
# Maximum number of Cosmos transactions held in the app-side mempool (default 5000).
# When full, a new transaction that pays more per gas evicts the lowest-paying one; otherwise it is refused.
cosmos-mempool-max-txs = 5000

# Time the node may spend selecting transactions for a proposal before it proposes what it has ("0s" disables the budget).
prepare-proposal-budget = "1s"

# Stop after this many candidates in a row that do not fit in the remaining block space (0 disables the cap).
prepare-proposal-max-skips = 64
```

`init`は、ネットワークのEVMチェーンIDも`app.toml`の`[evm]`の`evm-chain-id`設定に書き込みます(`--chain-id qorechain-vladi`では`9801`、`qorechain-diana`では`9800`)。`app.toml`に異なる値が入っているノードも起動はしますが、起動時にエラーをログに記録し、そのノード自身のJSON-RPC(`eth_chainId`、そのノードに対する署名)は、ファイルを修正するまで誤ったチェーンIDで応答します。コンセンサスには影響しません。古いバイナリは`--chain-id`に関係なくテストネットの値(`9800`)を書き込んでいたため、ずっと前に初期化されたメインネットノードはこの設定を確認してください。`QORE_EVM_CHAIN_ID`にネットワークの値以外を設定しないでください。そのようなノードは起動を拒否します。

### トランザクションインデックス(`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

`indexer = "kv"`(またはより高機能なインデクサー)を設定し、トランザクションをハッシュやイベントで照会できるようにしてください——これはデポジットと出金を照合する取引所にとって不可欠です。過去のトランザクション照会が不要な場合のみ`indexer = "null"`を設定してください。

---

## 統合向けエンドポイントの公開 {#exposing-endpoints-for-integration}

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
api = "eth,net,web3,txpool"
```

**ノードリリースv3.2.4のJSON-RPC制限。** v3.2.4バイナリを実行するノード(テストネットでは2026年10月19日から、メインネットのノードではブロック高3,742,566から)は、自身のJSON-RPCサーバーに制限を設けます。これらは`app.toml`の`[json-rpc]`セクションにあるノードローカルの設定で、コンセンサスには影響しません。`http-body-limit`(デフォルトは262144バイト、256 KiB。これより大きいリクエストボディは、読み込まれる前にHTTP 413で拒否されます)、`max-concurrent-requests`(デフォルトは256。これを超えるリクエストは直ちにHTTP 503を受け取ります)、`max-open-connections`(値が未設定または0の場合は、無制限ではなく1000を意味するようになりました)です。加えて、`eth_getLogs`と`eth_newFilter`のフィルター引数は、トピック位置が4つを超える場合、1つの位置の候補が1000を超える場合、またはアドレスが1000を超える場合に拒否されます。非常に大きなバッチリクエストやコントラクトデプロイのリクエストを自分のノードに送るインテグレーターは、最大のリクエストがボディ制限に収まるかを確認し、必要であれば引き上げてください。

公開エンドポイントは`eth_`、`net_`、`web3_`、`txpool_`(ステータスのみ)の各名前空間を提供します。v3.2.3以降で初期化されたノードは、デフォルトで`eth,net,web3`となり、`txpool`は含まれません(ノードの保留中トランザクションを公開してしまうため)。必要な場合にのみ追加してください。`qor_`名前空間はリリース済みのどのノードビルドでも提供されていないため、追加しないでください([`qor_`名前空間](/api-reference/json-rpc-qor_-namespace)を参照)。

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
| SVM RPC      | `8899`  | Solana互換の読み取り(SVMトランザクションは無効)                         |

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
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

`network`フィールドには、`qorechain-vladi`(メインネット)または`qorechain-diana`(テストネット)が表示されるはずです。

### PrometheusとGrafana

ノードはポート**26660**でPrometheusメトリクスを公開できます(`config.toml`の`[instrumentation]`セクションで`prometheus = true`を設定します)。

```
http://localhost:26660/metrics
```

Prometheus互換の任意のコレクターでこれをスクレイプしてください。Docker Composeの監視スタックを実行している場合、Grafanaは`http://localhost:3001`で利用でき——初回ログイン時に自分の認証情報を設定してください。ブロック高の遅延、ピア数、リソース使用状況を追跡し、`catching_up`が`true`のままになった場合やピア数がゼロになった場合はアラートを出してください。

### EVMエンドポイントの確認

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## 運用上のベストプラクティス

1. **チェーンバージョンを固定する。** マニフェストが推奨するリリース(メインネットではブロック高3,742,566まで**v3.2.3**、その後はv3.2.4)を実行し、協調アップグレードのため公式リリースを追跡し、システムクロックをNTPで同期させておいてください。

2. **冗長なノードを運用する。** 単一ノードの再起動や再同期が統合トラフィックを中断させないよう、ロードバランサーの背後に少なくとも2台のノードを配置してください。

3. **ジェネシスとスナップショットを検証する。** 起動前に、必ずジェネシスのSHA-256と、あらゆるスナップショットのチェックサムを公式リリースと照合してください。

4. **公開エンドポイントを保護する。** RPC/EVM/gRPCの前段にリバースプロキシ、レート制限、ファイアウォールを設置してください。認証のない書き込み用RPCを絶対にインターネットへ公開しないでください。

5. **プルーニングを用途に合わせる。** 完全な入出金履歴を照合する取引所には`pruning = "nothing"`と`tx_index = "kv"`を、軽量な照会には`default`を使用してください。

6. **同期を継続的に監視する。** ブロック高の遅延、ピア数ゼロ、`catching_up`で行き詰まったノードについてアラートを設定してください。

ノードのみのデプロイは署名を一切行いません。統合がこのノード経由でブロードキャストするトランザクションは、あらかじめハイブリッドのポスト量子署名を備えている必要があります(またEVMレーンでは、送信者に登録済みの鍵と開いている認可ウィンドウが必要です)。[取引所統合](/developer-guide/exchange-integration)および[ポスト量子署名](/developer-guide/post-quantum-signing)を参照してください。

フルノードを実行せずにネットワークを観察するには、[ライトノードのドキュメント](/light-node/overview)を参照してください。

---

## トラブルシューティング {#troubleshooting}

### ノードがクロックエラーで停止する

ノードリリースv3.2.1以降、システムクロックがネットワークと60秒を超えてずれると、コンセンサスエンジンが停止します。NTPクライアント(`chrony`または`systemd-timesyncd`)を実行し、`timedatectl status`でクロックが同期されていることを確認してから、ノードを再起動してください。

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
* [ソースからのビルド](/developer-guide/building-from-source) — 開発用にコミュニティ版`qorechaind`バイナリをビルドする
* [ライトノード](/light-node/overview) — フルノードなしでネットワークに追従する軽量クライアント
