---
slug: /qorel/quickstart
title: QORel クイックスタート
sidebar_label: クイックスタート
sidebar_position: 4
---

# クイックスタート

ここでは、QoreChain テストネット `qorechain-diana` と Cosmos Hub 公開テストネット（チェーン ID `provider`）の間でリレーする手順を順に説明します。インストール、設定、鍵の追加と登録、準備状況の確認、リレイヤーの起動、最初の転送までを扱います。リレイヤーを運用したことがない方向けです。ここにあるのはすべてテストネットで、トークンに価値はありません。

## 特長 {#innovations}

- **準備状況は 1 つのフィールドで分かります。** `qorel keys pqc-status` の出力は `ready_to_relay` で終わります。これが `true` なら、ポスト量子鍵がチェーンに登録されていてローカルの鍵と一致しており、その理由でリレイヤーが自分のトランザクションを拒否されることはありません。
- **問題があるときは何も送信されません。** 送信前チェックが、不正なトランザクションがチェーンに届く前に止めるため、手順の漏れで手数料がかかることはありません。
- **どのチェーンでも同じ流れです。** Cosmos Hub 側の手順は Hermes そのものです。新しいのは、QoreChain のチェーンエントリと登録の手順だけです。

## 使い方 {#how-to-use}

### 1. インストール {#step-install}

[インストール](/qorel/install)ページのいずれかの方法で `qorel` をインストールし、確認します。

```bash
qorel --version
```

### 2. 設定を用意する {#step-config}

リポジトリからサンプル設定をコピーします（`packaging/config.example.toml`。`.deb` と `.rpm` では `/etc/qorel/config.example.toml` に置かれます）。

```bash
mkdir -p ~/.hermes
curl -o ~/.hermes/config.toml https://raw.githubusercontent.com/qorechain/QORel/main/packaging/config.example.toml
```

`~/.hermes/config.toml` を開き、QoreChain ノードのプレースホルダー（`YOUR-QORECHAIN-NODE`）を、ご自身が運用するテストネットノードの RPC、gRPC、WebSocket のアドレスに置き換えます。QoreChain には公開 gRPC エンドポイントがないため、ご自身のノードが必要です。[ノードの運用](/developer-guide/running-a-node)と[テストネットへの接続](/getting-started/connecting-to-testnet)を参照してください。すべての設定は[設定](/qorel/configuration)で説明しています。

サンプル設定には 2 つのチェーンがあります。`signing = 'qorechain-hybrid'` の `qorechain-diana` と、デフォルトの標準署名を使う `provider` です。リレーは、QoreChain の `transfer/channel-0` と Hub テストネットの `transfer/channel-600` に限定されています。

### 3. リレイヤーアカウントを作成して資金を入れる {#step-accounts}

各チェーンにリレイヤー用の新しいアカウントを作成します。専用のアカウントを使い、バリデーターのオペレーター鍵は絶対に使わないでください。各アカウントのニーモニックは、自分だけが読み取れるファイルに保存します。

```bash
umask 077
nano ./diana.mnemonic       # paste the mnemonic, save
nano ./provider.mnemonic
```

同じニーモニックを両方のチェーンで使うことも、チェーンごとに別のものを使うこともできます。QORel はデフォルトでコインタイプ 118（`m/44'/118'/0'/0/0`）で導出します。アカウントが別のパスを使う場合は、`keys add` に `--hd-path` を渡してください。

鍵を追加します。

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./diana.mnemonic
qorel keys add --chain provider        --key-name relayer --mnemonic-file ./provider.mnemonic
```

`qorechain-diana` では、`keys add` は同じニーモニックから ML-DSA-87 鍵も導出し、そのシードを鍵の隣に `relayer.pqc` として保存します。終わったらニーモニックファイルを削除してください。

次に、アカウントに資金を入れます。アドレスは `qorel keys list --chain <id>` で表示できます。テストネット QOR は[ダッシュボードのファウセット](/dashboard/faucet)から、Hub テストネット用のテストトークンはそのネットワークの公開ファウセットから入手できます。手数料にはわずかなトークンで足ります。QoreChain の下限はガス 1 あたり 0.1 uqor なので、デフォルトのガスリミット 400,000 のトランザクションは、下限価格で約 40,000 uqor かかります。次のコマンドで確認します。

```bash
qorel keys balance --chain qorechain-diana
qorel keys balance --chain provider
```

### 4. ポスト量子鍵を登録する {#step-register}

QoreChain は、ML-DSA-87 公開鍵を登録したアカウントからのハイブリッド署名付きトランザクションだけを受け付けます。登録は 1 回だけ行います。

```bash
qorel keys register-pqc --chain qorechain-diana
```

トランザクションを 1 つ送信します。これは従来型の鍵だけで署名され（QoreChain がこの方法で受け付ける唯一の種類のトランザクションです）、所有証明（proof of possession）を伴います。再実行しても安全です。同じ鍵がすでに登録されている場合は、何も送信しません。アカウントにすでに別のポスト量子鍵が登録されている場合は、拒否して何も送信しません。

準備状況を確認します。

```bash
qorel keys pqc-status --chain qorechain-diana
```

結果は、`chain_id`、`account`、`local_public_key_sha256`、`registered`、`matches_local_key`、`registered_public_key_sha256`、`possession_proven`、`sign_bytes`、`ready_to_relay` のフィールドを持つ JSON オブジェクトです。`ready_to_relay` が `true` の場合にのみ先に進んでください。そうでない場合は[トラブルシューティング](/qorel/troubleshooting)を参照してください。

### 5. ヘルスチェック {#step-health}

```bash
qorel health-check
```

設定と各チェーンへの接続を確認し、QoreChain エントリでガス乗数が 1.1 未満の場合は、設定ミスの可能性として報告します（警告であり、リレー自体は動作します）。

### 6. チャネルを選ぶ {#step-channel}

テストネットにはすでに転送チャネルがあります。`qorechain-diana` の `channel-0` で、そのカウンターパーティは `provider` の `channel-600` です（[テストチャネル](/user-guide/bridging-assets#ibc-test-channel)）。これをリレーするなら、そのままステップ 7 に進んでください。

代わりに 2 つのチェーンの間に独自の新しいチャネルを作成するには:

```bash
qorel create channel \
  --a-chain qorechain-diana --b-chain provider \
  --a-port transfer --b-port transfer \
  --new-client-connection
```

`--new-client-connection` は、2 つのライトクライアントとコネクションも作成します。これは各チェーンで複数のトランザクションを送信します。コマンドは新しいチャネル識別子を出力するので、両方のチェーンエントリの `packet_filter` に入れてください。

### 7. リレイヤーを起動する {#step-start}

```bash
qorel start
```

起動したままにしておきます（長時間動かすリレイヤーには、systemd サービスかコンテナを使用してください。[バリデーターと並べて運用する](/qorel/running-next-to-a-validator)を参照）。QORel はパケットをリレーし、ライトクライアントを更新し、不正行為を監視します。

### 8. 最初の転送を送る {#step-transfer}

2 つ目のターミナルで、QoreChain から Hub テストネットへ 1000 uqor を送信します。QORel は、このトランザクションにも同じハイブリッド署名を付けて、自身で署名・送信します。

```bash
qorel tx ft-transfer \
  --src-chain qorechain-diana --dst-chain provider \
  --src-port transfer --src-channel channel-0 \
  --amount 1000 --denom uqor \
  --timeout-seconds 600 \
  --receiver <a cosmos address on the Hub testnet>
```

`--receiver` を指定しない場合、トークンは宛先チェーン上のリレイヤー自身のアドレスに送られます。その後、パケットを追跡します。

```bash
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

パケットは、稼働中のリレイヤーがそれを届け、acknowledgement が戻るまで一覧に表示されます。QoreChain では、REST でチャネルとトークントレースを読み取ることもできます。

```bash
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
curl -s https://api-testnet.qore.host/ibc/apps/transfer/v1/denoms
```

タイムアウトまでに配信されなかった転送は、リレイヤーによって、送信元チェーンの送信者に返金されます。上記の `--timeout-seconds` の値は 10 分です。

## アクセス方法 {#how-to-access}

- **ネットワーク。** テストネット `qorechain-diana` と Cosmos Hub 公開テストネットのみ。
- **必要なもの。** QORel、ご自身が運用する QoreChain テストネットノード（RPC、gRPC、WebSocket）、Hub テストネットに到達できるエンドポイント、各チェーンの資金のあるリレイヤーアカウント 1 つ、およびそれぞれのニーモニックを入れたファイル。
- **費用。** 手数料はテストトークンのみです。QoreChain では、ガス × 価格で、下限はガス 1 あたり 0.1 uqor、未使用のガスの返金はありません。
- **コンテナを使う方。** 上記の各コマンドを `docker run --rm -v $HOME/.qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 <command>` として実行し、ニーモニックファイルはマウントしたディレクトリの中に置きます。`start` は常時稼働のコンテナとして実行します（[インストール](/qorel/install#container)）。

## 公開場所 {#where-published}

バイナリとサンプル設定は [QORel リポジトリ](https://github.com/qorechain/QORel)（`packaging/config.example.toml`）から入手できます。すべてのチャネルについては[インストール](/qorel/install)、バージョンについては [QORel の概要](/qorel/overview#where-published)を参照してください。

## 制限と既知の問題 {#limits}

- **テストネットのみ。** メインネットの IBC は開かれていません。この手順をメインネットに向けないでください。
- **ご自身の QoreChain ノードが必要です。** 公開 gRPC エンドポイントはありません。
- **新しいチャネルは両方のチェーンで手数料がかかり**、クライアントとコネクションが増えます。独自のものが必要でない限り、`channel-0` のリレーを優先してください。
- **Hub 側の公開エンドポイントはレート制限をかける場合があります。** QORel は再試行を続けますが、継続的なリレーにはご自身のノードを使用してください。
- **リレーされるまで保留されます。** チャネルにリレイヤーが動いていない場合、転送は、リレイヤーが起動するかパケットがタイムアウトするまで保留されたままです。

次へ: [設定](/qorel/configuration)、[モニタリング](/qorel/monitoring)、[トラブルシューティング](/qorel/troubleshooting)。
