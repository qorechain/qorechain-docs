---
slug: /qorel/troubleshooting
title: QORel のトラブルシューティングと FAQ
sidebar_label: トラブルシューティング
sidebar_position: 9
---

# トラブルシューティングと FAQ

QORel を運用する際の質問と対処法を、よく遭遇する順にまとめています。リレイヤーが起動しない、送信を拒否する、パケットが保留されたままになる、といった状況のオペレーター向けです。QORel は現時点ではテストネット専用なので、すべての回答は `qorechain-diana` を前提としています。

## 特長 {#innovations}

ハイブリッドチェーンでの問題の多くは、手数料が消費される前に検出されます。

- **送信前チェックが問題を特定します。** ポスト量子鍵が読み込まれていない、登録されていない、ローカルの鍵と一致しない、または sign-bytes バージョンが不明な場合、QORel は何も送信せず、そのどれなのかを伝えます。
- **最初に実行するコマンドは `keys pqc-status` です。** 登録状況、鍵の一致、所有証明、チェーンが検証する sign-bytes バージョン、`ready_to_relay` を表示します。
- **`health-check` は設定ミスを説明します。** QoreChain エントリでガス乗数が 1.1 未満の場合も含まれます。

## 使い方 {#how-to-use}

まず次を実行して、結果を比較してください。

```bash
qorel --version
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

### 鍵と登録 {#keys}

**`ready_to_relay` が `false` です。どうすればよいですか。**
`keys pqc-status` の他のフィールドを確認してください。
- `registered: false`: アカウントにポスト量子鍵が登録されていません。アカウントに資金を入れてから、`qorel keys register-pqc --chain qorechain-diana` を実行してください。
- `registered: true` かつ `matches_local_key: false`: アカウントに登録されている鍵が、QORel が保持している鍵と異なります。アカウント自身のニーモニックと正しい `--key-name` を使ったか確認してください。鍵を再追加した場合は、`keys add --overwrite` が、ニーモニックからローカルの鍵とその `<key name>.pqc` シードを再構築します。
- コマンドが鍵の読み込みに失敗する: 鍵の隣にある `<key name>.pqc` ファイルが存在しないか、読み取れません。そのチェーンに対して `keys add` を再度実行してください。

**`keys register-pqc` が、アカウントにはすでに別の鍵があると言っています。**
意図どおり、何も送信されていません。チェーン上の鍵は、別のニーモニックまたは別のツールで登録されたものです。元のニーモニックを使うか、古い鍵からチェーン上の鍵をローテーションしてください（[ポスト量子署名](/developer-guide/post-quantum-signing#key-rotation)）。アカウントが以前に使った鍵を再び登録することはできません。

**`keys register-pqc` が手数料または残高のエラーで失敗します。**
テストネットでは、最初のトランザクションを送信する前に、アカウントに QOR が必要です。[ダッシュボードのファウセット](/dashboard/faucet)を使用してください。登録には数十万ガスが必要で、下限の 0.1 uqor では数万 uqor になります。

**`--no-proof` は必要ですか。**
v3.2.3 より古いネットワークの場合だけです。QoreChain の両方のネットワークは所有証明（proof of possession）を受け付け、QORel はデフォルトでそれを付加します。

**ポスト量子鍵はどこに保存されますか。**
secp256k1 鍵の隣に、`<key name>.pqc`（32 バイトのシード）として保存され、所有者のみが読み取れます。ニーモニックから再導出できます。バックアップするのはファイルではなく、ニーモニックです。

**鍵ファイルが他のユーザーから読み取れます。**
QORel は新しい鍵ファイルを 0600 で書き込みます。古い Hermes で追加した鍵は以前のモードのままなので、それらに `chmod 600` を実行してください。

### 設定 {#config}

**`extension_options` に関するメッセージで、設定が拒否されます。**
静的な `extension_options` は `signing = 'qorechain-hybrid'` と併用できません。ポスト量子署名が唯一のクリティカルな拡張オプションでなければならないためです。そのチェーンのエントリから削除してください。

**チェーンが `signing = "qorechain-hybrid"` を使っていないと表示されます。**
ポスト量子鍵のコマンドは、その設定のあるチェーンでのみ動作します。QoreChain エントリに追加してください。

**sign-bytes バージョンを設定する必要がありますか。**
いいえ。`pqc.sign_bytes = 'auto'` がチェーンから読み取り、1 分ごと、および拒否されるたびに再読み込みします。チェーンと一致しない `v1` や `v2` を固定すると、すべてのトランザクションが拒否されます。

**`pqc-status` の `sign_bytes` が unknown になっています。**
QORel がチェーンのアップグレード記録を読み取れませんでした。QoreChain エントリの `rpc_addr` が応答し、正しいネットワーク（テストネットでは `qorechain-diana`）を指していることを確認してください。QORel は、バージョンが分からない状態では署名しません。

**どのガス乗数を使えばよいですか。**
`1.1` はサンプルのデフォルトで、`health-check` に警告を出させません。チェーン v3.2.5 以降（現在は両ネットワーク。測定はテストネットの v3.2.6 で実施）では、`1.05` のような低い値でも動作します。それ以前のビルドはシミュレートされたガスを過少に報告するため、そのようなノードでは `1.15` を使用してください。[ガス](/qorel/configuration#gas)を参照してください。

**`health-check` がガス乗数について警告します。**
QoreChain エントリで 1.1 未満になっています。警告のみで、リレーは動作します。ガス不足による失敗が出る場合は、引き上げてください。

### 送信とリレー {#relaying}

**チェーンが codespace `pqc`、コード 21 でトランザクションを拒否します。**
ハイブリッド署名の検証に失敗しました。QORel は次のトランザクションの前に sign-bytes バージョンと登録状況を再読み込みして再試行します。繰り返す場合は、チェーンエントリの `id` がチェーン ID（`qorechain-diana`）と完全に一致していること、鍵が登録されたものであること（`keys pqc-status`）、使用しているノードが想定するバージョンで動いていることを確認してください。[ポスト量子署名](/developer-guide/post-quantum-signing#code-21)に原因の一覧があります。

**何も送信されず手数料も消費されていませんが、リレイヤーがエラーをログに出力します。**
これは送信前チェックが役目を果たしているものです。ログ行は、欠けているもの（鍵が未読み込み、鍵が未登録、鍵の不一致、sign-bytes バージョン不明）を示します。上記のとおり修正してください。

**`account sequence mismatch` エラーが出ます。**
2 つのプロセスが同じリレイヤー鍵で署名しています。鍵ごとにリレイヤーを 1 つ実行してください。systemd サービスとコンテナの併用や、2 つ目の Kubernetes Pod もこれに含まれます。

**ログに `429 Too Many Requests` が表示されます。**
エンドポイントがレート制限をかけています。多くは、再起動後の公開エンドポイントです。QORel はこれを再試行可能として扱い、パケットワーカーを動かし続け、クリアインターバルごとに再試行します。継続的なリレーには、ご自身のノードか有料エンドポイントを使用してください。QoreChain には公開 gRPC エンドポイントがないため、QoreChain 側はいずれにせよご自身のノードが必要です。

**QoreChain での手数料またはガス不足のエラー。**
手数料はガスリミット × 価格で、返金はなく、下限はガス 1 あたり 0.1 uqor です。`gas_price`、`dynamic_gas_price.backend = 'cosmos-evm-feemarket'` が設定されていること、そしてアカウント残高（`qorel keys balance --chain qorechain-diana`）を確認してください。

### パケットとチャネル {#packets}

**転送が保留されたままで、何も届きません。**
順に確認してください。チャネルにリレイヤーが動いていること（プロセスが稼働中で、テレメトリが応答する）。そのチャネルが両方のチェーンの `packet_filter` に含まれていること。リレイヤーが宛先チェーンに残高を持っていること。ポスト量子鍵の準備ができていること。エンドポイントに到達できること。その上で、そのチャネルに対して `qorel query packet pending` を実行してください。リレイヤーが動いていない場合、パケットは、リレイヤーが起動するか転送がタイムアウトするまで待機します。

**転送が期限切れになるとどうなりますか。**
リレイヤーが動いていれば、タイムアウトをリレーし、トークンは送信元チェーンの送信者に返金されます。これはテストネットのチャネルでテストされました。

**既存のテストチャネルを使えますか、それとも独自のものが必要ですか。**
テストネットの `channel-0` から Hub テストネットの `channel-600` が開かれています（[テストチャネル](/user-guide/bridging-assets#ibc-test-channel)）。その `packet_filter` で QORel を実行すれば、リレーできます。必要な場合にのみ、`qorel create channel ... --new-client-connection` で独自のものを作成してください。

**`create channel` が途中で失敗します。**
ハンドシェイクは、両方のチェーンでの複数のトランザクションです。`qorel health-check` を実行して原因を修正し、すでに作成されたコネクションを `--a-connection` に指定してコマンドを再実行するか、`--new-client-connection` で最初からやり直してください。

**標準の Hermes は QoreChain で動作しますか。**
いいえ。QoreChain は ML-DSA-87 署名のないトランザクションを拒否し、標準の Hermes はそれを追加しません。QORel は、Hermes にその署名を加えたものです。

### 全般 {#general}

**QORel は QoreChain 以外のチェーンをリレーできますか。**
はい。`signing` のないチェーンは、標準の Hermes のトランザクション形式をバイト単位でそのまま使用します。

**メインネットに対応していますか。**
まだです。メインネットの IBC チャネルは開かれていません。メインネットの IBC が開かれた時点で、このマニュアルでお知らせします。

**IBC v2 に対応していますか。**
まだです。IBC v2 のリレーは QORel にはまだ実装されておらず、次のフェーズです。Ethereum（Eureka）のリレーは着手していません。

**Windows は使えますか。**
いいえ。WSL2 でコンテナを使用してください。

**問題はどこに報告すればよいですか。**
[github.com/qorechain/QORel](https://github.com/qorechain/QORel/issues) でイシューを作成してください。QORel のバージョン、機密情報を伏せたチェーンエントリ、`qorel keys pqc-status` の出力を含めてください。ニーモニック、鍵ファイル、`.pqc` シードは絶対に投稿しないでください。

## アクセス方法 {#how-to-access}

- 上記のコマンドはすべて、リレイヤーと同じ設定で、リレイヤーのホスト上で実行します。
- 比較用の公開状態: QoreChain テストネットの REST（`https://api-testnet.qore.host`、[テストネットへの接続](/getting-started/connecting-to-testnet)）と[ブロックエクスプローラー](https://explore.qore.network)（Testnet に切り替え）。

## 公開場所 {#where-published}

QORel はリポジトリ [qorechain/QORel](https://github.com/qorechain/QORel) にあり、イシューもそこに送ります。アップストリームの Hermes ガイド [hermes.informal.systems](https://hermes.informal.systems) は、QORel が共有する設定とコマンドを扱っています。

## 制限と既知の問題 {#limits}

- **テストネットのみ**であり、0.x リリースです。
- **IBC v2 のリレーはまだありません**（次のフェーズ）。Ethereum（Eureka）のリレーもありません。
- **サードパーティのエンドポイントはレート制限をかけます。** サンプル設定の Hub 側エンドポイントは公開されたもので、QoreChain が運用しているものではありません。
- **このページは Hermes のすべてのエラーをカバーできません。** ポスト量子鍵、sign bytes、QoreChain に言及しないエラーについては、Hermes のガイドとイシュートラッカーが該当します。

関連項目: [設定](/qorel/configuration)、[モニタリング](/qorel/monitoring)、[どの言語からでも署名する](/qorel/signing-from-any-language)。
