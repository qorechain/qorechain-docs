---
slug: /getting-started/connecting-to-testnet
title: テストネットへの接続
sidebar_label: テストネットへの接続
sidebar_position: 4
---

# テストネットへの接続

正しいジェネシスファイル、ピア、ネットワーク設定でノードを構成し、稼働中の QoreChain Diana テストネットに参加しましょう。

:::note
このページでは **`qorechain-diana`** テストネット(EVM チェーン ID **9800**)を扱います。メインネット(**`qorechain-vladi`**、EVM チェーン ID **9801**)は 2026 年 6 月 7 日から稼働しており(リリース **v3.2.4**、2026 年 10 月 23 日から)、専用の **メインネットへの接続** ページに独自のジェネシス、ピア、接続情報が記載されています。テストネットは **v3.2.6** を実行しており(2026 年 10 月 27 日に適用)、そのリリースマニフェストは [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) にあります。
:::

## パブリックエンドポイント

**テストネットへのクエリやトランザクションのブロードキャスト**のみが必要な場合は、パブリックエンドポイントをご利用ください:

| サービス | URL |
|---|---|
| コンセンサス RPC | `https://rpc-testnet.qore.host`(WebSocket: `wss://rpc-testnet.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host`(チェーン ID `9800`) |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC(読み取り専用) | `https://svm-testnet.qore.host` |
| ブロックエクスプローラー | [explore.qore.network](https://explore.qore.network)(Testnet に切り替え) |

テストネット用の QOR は [ダッシュボードのフォーセット](/dashboard/faucet) から入手できます。このフォーセットでは、テストネット専用の[Fest テストトークン](/dashboard/faucet#fest-tokens)(fUSD、fETH、fBTC。価値なし)も送ることができます。

---

## インストール

現在のテストネットのバイナリ、ジェネシス、ピア、ステートシンクのトラストポイントについての正式な情報源は**テストネットマニフェスト**で、`https://download.qore.host/testnet/latest.json` でライブ更新されています。メインネットのマニフェストと同じ構造のため、インストール手順も同じです — バージョンやチェックサムをハードコードするのではなく、マニフェストを取得してその値を使用してください:

```bash
curl -s https://download.qore.host/testnet/latest.json -o latest.json
jq -r '.version, .minCompatible, .upgradeHeight' latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib

qorechaind init my-node --chain-id qorechain-diana
```

テストネットはガバナンス提案を通じて調整されたアップグレードを行うため、マニフェストには `upgradeHeight` が含まれ、`minCompatible` は現在のバージョンと同じです。現在参加するノードには、マニフェストに記載のリリースが必要です。執筆時点(2026 年 10 月 27 日)のテストネットのマニフェストは、`version` が 3.2.6、`minCompatible` が 3.2.6、`upgradeHeight` が 8970638 で、その注記には「IBC v2 light client routes, AMM pools and RL consensus agent fixes, fest test tokens」と書かれています。システムクロックは NTP で同期させてください。

| リリース | テストネットの高さ | 適用日 |
| --- | --- | --- |
| v3.2.2 | 6,905,034 | 2026 年 10 月 2 日 |
| v3.2.3 | 8,003,746 | 2026 年 10 月 15 日 |
| v3.2.4 | 8,337,253 | 2026 年 10 月 19 日 |
| v3.2.5 | 8,890,800 | 2026 年 10 月 26 日 |
| v3.2.6 | 8,970,638 | 2026 年 10 月 27 日(16:58 UTC) |

テストネットは各リリースをメインネットより先に取り込みます。メインネットは 2026 年 10 月 23 日に高さ 3,742,566 で v3.2.4 を適用しました。メインネットのガバナンス提案 14 は高さ 3,906,833 で v3.2.5 を適用する予定で、執筆時点では投票期間中でした。マニフェストは別物なので、2 つのネットワーク間でバイナリをコピーしないでください。また、メインネットがテストネット専用の機能を受け入れることを期待しないでください(v3.2.6 での追加内容は[バージョン履歴](/appendix/version-history#testnet-v326)に記載しています)。

---

## ジェネシスのダウンロード

ローカルのジェネシスファイルを、上で取得したマニフェストの URL と SHA-256 を使って、公式のテストネットジェネシスに置き換えます:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

同じファイルは、チェーン自体からもライブで配信されています:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

このファイルは、バリデータセット、トークン割り当て、モジュールパラメータなど、Diana テストネットの初期状態を定義します。

:::note テストネットはその場でアップグレードされます
Diana は 2026 年 7 月 1 日から継続して稼働しており、メインネットと同様にガバナンス提案によってアップグレードされます。テストネットはステージングネットワークであり、予告なくリセットされることがあります。ノードの同期が止まった場合は、マニフェストと Discord のお知らせを確認したうえで、ジェネシスを再ダウンロードし、新しいデータディレクトリから起動してください。パブリックセントリーは直近のブロックしか保持しないため、新しいノードはジェネシスからリプレイするのではなく、ステートシンク(下記)を使用してください。
:::

---

## ピアの設定

ノード ID やホストをハードコードするのではなく、マニフェストから現在のピアとシードの一覧を読み取ります:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

`~/.qorechaind/config/config.toml` を開き、`persistent_peers`(および `seeds`)フィールドにそれらの値を設定します:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

また、`~/.qorechaind/config/app.toml` で手数料の下限も設定してください(テストネットはメインネットと同じ **0.1uqor** の最低ガス価格を使用します):

```toml
minimum-gas-prices = "0.1uqor"
```

### 推奨設定

フルノードはブロック時間を選びません — それを決めるのはバリデータです(テストネットは現在、約 1.3 秒ごとに 1 ブロックを生成しています)。バリデータを運用していて、バリデータグループから値を指定された場合を除き、コンセンサスのタイムアウトはデフォルトのままにしてください。パブリック RPC ノードに有用なメモリプールの設定は、`config.toml` の次のとおりです:

```toml
[mempool]
size = 5000
```

---

## 高速ブートストラップ(ステートシンク)

マニフェストの `stateSync` フィールドには、定期的に更新されるトラストの高さとハッシュのペアが含まれています:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

`config.toml` の `[statesync]` セクションに、これらの値とマニフェストの `rpcServers` を設定します — 完全な手順は [ノードの実行](/developer-guide/running-a-node) を参照してください。

---

## ノードの起動

ノードを起動して、ネットワークとの同期を開始します:

```bash
./qorechaind start
```

ノードはピアに接続し、(ジェネシスから、またはステートシンクを使用する場合はトラストの高さから)ブロックのダウンロードを開始します。初回同期にかかる時間は、現在のチェーンの高さとネットワーク速度に依存します。

---

## 同期状態の確認

ノードが最新ブロックに追いついているかを確認します:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — ノードはまだ同期中です。追いつくまでお待ちください。
* `false` — ノードは完全に同期しており、新しいブロックを処理しています。

最新のブロック高も確認できます:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

---

## モニタリング

QoreChain は、ノードの健全性とパフォーマンスを監視するための複数のエンドポイントを公開しています。

### Prometheus メトリクス

生のメトリクスは以下で取得できます:

```
http://localhost:26660/metrics
```

これらのメトリクスは、Prometheus 互換の任意のコレクターでスクレイピングできます。

### Grafana ダッシュボード

Docker Compose で実行している場合、Grafana は以下で利用できます:

```
http://localhost:3001
```

初回ログイン時には、プロンプトに従って独自の認証情報を設定してください — デフォルトのまま放置しないでください。事前構成されたダッシュボードには、ブロック生成、トランザクションスループット、ピア接続、リソース使用状況が表示されます。

### REST ヘルスチェック

REST API は簡易的なステータスエンドポイントを提供します:

```
http://localhost:1317
```

---

## ポート一覧

| ポート    | プロトコル  | 説明                                        |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — トランザクションのクエリとブロードキャスト             |
| `26656` | TCP       | P2P — ピアツーピアのネットワーク通信           |
| `1317`  | HTTP      | REST API — HTTP 経由でチェーン状態をクエリ              |
| `9090`  | gRPC      | gRPC API — プログラムによるチェーンアクセス               |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum 互換 RPC(チェーン ID `9800`) |
| `8546`  | WebSocket | EVM WebSocket — リアルタイムの EVM イベント購読  |
| `8899`  | HTTP      | SVM RPC — Solana 互換 RPC(読み取り専用。SVM トランザクションレーンは無効)                    |
| `26660` | HTTP      | Prometheus メトリクスエンドポイント                        |

---

## 次のステップ

* [ウォレットのセットアップ](/getting-started/wallet-setup) — テストネット用のウォレットを設定する
* [初めてのトランザクション](/getting-started/first-transaction) — 初めての QOR 送金を行う
