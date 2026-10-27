---
slug: /qorel/overview
title: QORel の概要
sidebar_label: 概要
sidebar_position: 1
---

# QORel

QORel は QoreChain の IBC リレイヤーです。リレイヤーとは、2 つのチェーンの間で IBC パケット、証明、クライアント更新を運ぶプログラムであり、これが動いていなければ、IBC チャネル経由の転送は保留されたままになります。QORel は、QoreChain のチャネルのリレーを運用したいオペレーター、バリデーター、チーム、そして QoreChain にトランザクションを送信できるリレイヤーを必要とするすべての人のためのものです。

QoreChain は、すべてのネイティブレーンのトランザクションにハイブリッドのポスト量子署名（secp256k1 と ML-DSA-87、FIPS 204）を要求しますが、標準のリレイヤーはこれを生成しないため、QoreChain はそのトランザクションを拒否します。QORel は QoreChain 向けにこの署名を追加し、それ以外のすべての Cosmos SDK チェーンには標準の方法で署名します。`qorel` という 1 つのバイナリで、Apache-2.0 でリリースされています。これは、Informal Systems が開発した IBC リレイヤー（Apache-2.0）である [Hermes](https://github.com/informalsystems/hermes) 1.13.3 のフォークです。リレイヤーエンジンの功績は彼らのものであり、QORel は、追加の署名を必要としないチェーンについては、Hermes のコマンドと設定をそのまま維持します。

QORel 0.1.0 は**テストネット専用**です。QoreChain テストネット `qorechain-diana` と Cosmos Hub 公開テストネット（チェーン ID `provider`）の間でリレーした実績があります。メインネットの IBC はまだ開かれていません。メインネットでチャネルが開かれた時点で、メインネットへの対応を行います。

## 特長 {#innovations}

- **チェーンごとの署名モード。** 設定内の各チェーンには `signing` があります。`'qorechain-hybrid'` は、QoreChain が検証する ML-DSA-87 署名を追加します。デフォルトの `'standard'` は、Hermes とバイト単位で同一のトランザクションを生成するため、同じ QORel プロセスで QoreChain と Cosmos Hub を並行してリレーできます。
- **差し替え可能なシグナーレイヤー。** `qorel-signer` クレートは、ポスト量子プリミティブ、チェーンの sign-bytes ルール、トランザクション拡張シグナーを、別々の部品として定義します。リレイヤーは、auth info が確定した後、従来型の署名ドキュメントを構築する前にこれを呼び出し、ガスのシミュレーションも同じ経路を通ります。別の追加署名を持つチェーンには、リレイヤーの変更ではなく、このクレートに新しいフレーマーを追加するだけで対応できます。契約については[どの言語からでも署名する](/qorel/signing-from-any-language)を参照してください。
- **鍵コマンドでのポスト量子鍵の扱い。** `qorel keys add` は、アカウントと同じニーモニックから QoreChain ウォレットの導出方式で ML-DSA-87 鍵を導出するため、リレイヤーの鍵は QoreX や SDK が導出するものと一致します。`qorel keys register-pqc` は、所有証明（proof of possession）付きで公開鍵を 1 回登録します。`qorel keys pqc-status` は、鍵の準備が整っているかを報告します。
- **送信のたびに行うチェック。** ハイブリッドチェーンへのトランザクションごとに、QORel は、ポスト量子鍵がチェーンに登録されていてローカルで保持している鍵と同一であることを確認し、チェーンから sign-bytes バージョンを読み取ります。問題があれば何も送信しないため、チェーンが拒否するトランザクションに手数料を使うことはありません。
- **QoreChain のフィーマーケットからのガス価格。** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` は、固定の推測値ではなく、チェーンのベースフィー（下限はガス 1 あたり 0.1 uqor）を読み取ります。
- **ibc-go v10 チェーンでの不正行為の検出。** ibc-go v10 は `update_client` イベントにヘッダーを含めなくなり、標準の Hermes 1.13 はこれらのチェーンで不正行為の検出をオフにします。QORel は代わりに `MsgUpdateClient` トランザクションからヘッダーを読み取るため、検出は動作し続けます。
- **レート制限のあるエンドポイントへの耐性。** パケットワーカーは、たとえば公開エンドポイントが一時的に `429` を返した後など、リレーまたはクリアリングの試行が失敗している間も動き続け、クリアインターバルごとに再試行します。アイドルによる停止は、クリアリングが成功した後に限られます。
- **所有者のみの鍵ファイル。** 保存されたポスト量子シードを含む鍵ファイルは、モード 0600 で書き込まれます。
- **実ネットワークでの実証。** QoreChain テストネット最初の IBC チャネル、`qorechain-diana` の `transfer/channel-0` から Cosmos Hub 公開テストネットの `channel-600` は、QORel がリレーしています。両方向の転送のほか、転送したトークンの返却や、期限切れの転送の自動返金もテストされました。[テストチャネル](/user-guide/bridging-assets#ibc-test-channel)を参照してください。

各リリースの全一覧は[新機能](/qorel/whats-new)にあります。

## 稼働中のテストネット接続 {#testnet-connection}

| | `qorechain-diana` | Cosmos Hub 公開テストネット（`provider`） |
|---|---|---|
| ライトクライアント | `07-tendermint-0` | `07-tendermint-466` |
| コネクション | `connection-0` | `connection-315` |
| チャネル | `transfer/channel-0`（`STATE_OPEN`、unordered、バージョン `ics20-1`） | `transfer/channel-600` |

このコネクションには 2 つのトークントレースが存在します。QoreChain テストネット上の ATOM は `ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2`（トレース `transfer/channel-0/uatom`）です。Hub テストネット上の QOR は `ibc/BB4D5A9372637A885CC895F775B38B127354A31F3E20D8F6FB3997E34BF4AA4A`（トレース `transfer/channel-600/uqor`）です。このパスを追加するチェーンレジストリのプルリクエスト（[cosmos/chain-registry#8086](https://github.com/cosmos/chain-registry/pull/8086)）はオープンのままで、マージされていません。メインネットには IBC チャネルがありません。

テストした内容: 両方向の転送（1 QOR の送出、0.1 ATOM の受け取り、0.4 QOR の返却）と、タイムアウト 1 秒の転送の自動返金（タイムアウトメッセージとしてリレー）。`qorechain-diana` 上のリレイヤーのトランザクション 13 件はすべて成功しました（code 0）。

### サードパーティのリレイヤーに必要なもの {#third-party}

テストネットが受け付けるライトクライアントのタイプは `07-tendermint` のみです（`/ibc/core/client/v1/params` は `allowed_clients = ["07-tendermint"]` を返します）。現時点では `08-wasm` クライアントは作成できません。QoreChain へのチャネルを開くには、リレイヤーに次のものが必要です。

- 両側の `07-tendermint` クライアント
- QoreChain 側では、ML-DSA-87 鍵が登録されているリレイヤーアカウントによる、ハイブリッド署名のトランザクション。QORel はこれを行います。標準の Hermes、Go リレイヤー（`rly`）、ts-relayer は拒否されます。
- バージョン `ics20-1` の ICS-20 転送チャネル

IBC v2 のクライアント設定にも、リレイヤーの許可リストはありません（`/ibc/core/client/v2/config/07-tendermint-0` は `allowed_relayers: []` を返します）。IBC v2 のパケットは、絶対的な Unix 秒のタイムアウトを使用します。QORel はまだ IBC v2 をリレーしません。

## qorel-signer {#qorel-signer}

シグナーは別のクレート `qorel-signer` で、QORel リポジトリの `crates/qorel-signer` にあります。crates.io には公開されていないため、git 依存として利用してください。保証される内容は次のとおりです。

- **差し替え可能なコシグナー。** チェーンの追加署名はコシグナーが付加します。標準の署名を使うチェーンはコシグナーを使わないため、そのトランザクションは変更されません。
- **生の protobuf バイト列。** エンコード済みバイト列を扱い、IBC やリレイヤーの型には依存しません。
- **ボディのポリシー。** チェーンが拒否するボディ、つまり既存の critical な拡張オプション、`unordered` フラグ、未知のフィールドを拒否します。
- **バージョンを推測しない。** sign-bytes バージョンが判明する前に、QoreChain ネットワークで v1 の sign bytes にフォールバックすることはありません。
- **自己検証された署名。** すべての署名は、使用前に検証されます。
- **シークレットの扱い。** シークレットはゼロ化され、`Debug` 出力ではマスクされます。
- **バイト単位のテスト。** テストでは、チェーンの ante ハンドラーが受理したリレイヤーのトランザクションを、バイト単位で再構築します。

使用例はリポジトリの `crates/qorel-signer/README.md` にあります。[どの言語からでも署名する](/qorel/signing-from-any-language#signer-layer)も参照してください。同じシグナーフックは、アップストリームの Hermes にも [informalsystems/hermes#4435](https://github.com/informalsystems/hermes/pull/4435)（オープン、未マージ）として提案されています。

## 使い方 {#how-to-use}

バイナリをインストールし、チェーンごとに 1 エントリの設定を書き、各チェーンに鍵を追加し、QoreChain 上でポスト量子鍵を登録し、準備状況を確認してから、リレイヤーを起動します。

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana    # ready_to_relay must be true
qorel health-check
qorel start
```

このセクションのページ:

| ページ | 内容 |
|---|---|
| [新機能](/qorel/whats-new) | 0.1.0 が Hermes に追加するもの |
| [インストール](/qorel/install) | tarball、`.deb`、`.rpm`、Homebrew、コンテナ、ソースから、およびそれぞれの検証方法 |
| [クイックスタート](/qorel/quickstart) | インストールからテストネットでの最初の転送まで |
| [設定](/qorel/configuration) | QoreChain のチェーンエントリ、鍵、ガス、安全チェック |
| [バリデーターと並べて運用する](/qorel/running-next-to-a-validator) | systemd、Docker Compose、Kubernetes の構成 |
| [モニタリング](/qorel/monitoring) | テレメトリ、アラートを設定する項目 |
| [どの言語からでも署名する](/qorel/signing-from-any-language) | ハイブリッド署名の契約と 5 言語のライブラリ |
| [トラブルシューティング](/qorel/troubleshooting) | 質問と対処法 |

## アクセス方法 {#how-to-access}

- **ネットワーク。** テストネット `qorechain-diana` のみ（テストネットは v3.2.6 で動作しています）。メインネット `qorechain-vladi` には、開かれた IBC チャネルがありません。各ネットワークの状況は[アセットのブリッジ](/user-guide/bridging-assets#ibc-testnet-v326)を参照してください。
- **カウンターパーティ。** Cosmos Hub 公開テストネット（チェーン ID `provider`）、`channel-600` 経由。他の Cosmos SDK チェーンも、サンプル設定の `provider` エントリと同じ方法で動作します。
- **エンドポイント。** QORel には、各チェーンについて、コンセンサス RPC、WebSocket、gRPC エンドポイントが必要です。QoreChain テストネットには公開 RPC（`https://rpc-testnet.qore.host`）と REST（`https://api-testnet.qore.host`）がありますが、現時点で公開 gRPC エンドポイントはなく、提供の予定もありません。そのため、`qorechain-diana` 向けのサードパーティのリレイヤーには、ご自身のテストネットノードが必要です（[ノードの運用](/developer-guide/running-a-node)、[テストネットへの接続](/getting-started/connecting-to-testnet)）。リレイヤーにレート制限をかける公開エンドポイントは、短いテストには使えますが、継続的なリレーには使えません。
- **アカウント。** 各チェーンに、手数料用の少額の残高を持つ専用のリレイヤーアカウントを 1 つ用意します。テストネット QOR は[ダッシュボードのファウセット](/dashboard/faucet)から入手できます。価値はありません。バリデーターのオペレーター鍵は絶対に使わないでください。
- **費用。** QORel は無料です。QoreChain では、トランザクションの費用はガス × 価格で、下限はガス 1 あたり 0.1 uqor、手数料の全額が返金なしで課金されます。
- **プラットフォーム。** Linux x86_64 と arm64（glibc 2.28 以降）、macOS Apple Silicon と Intel、それ以外にはコンテナイメージ。Windows はサポートされていません。WSL2 でコンテナを使用してください。

## 公開場所 {#where-published}

| 場所 | 内容 | バージョン |
|---|---|---|
| [GitHub: qorechain/QORel](https://github.com/qorechain/QORel) | ソース、イシュー、および tarball、`.deb`、`.rpm`、`SHA256SUMS`、ビルド attestation を含むリリースページ | 0.1.0 |
| Homebrew | `brew install qorechain/tap/qorel` | 0.1.0 |
| `ghcr.io/qorechain/qorel` | コンテナイメージ（amd64 と arm64、distroless、非 root、cosign 署名付き） | 0.1.0 |
| `qorel-signer` クレート | シグナーレイヤー。リポジトリの `crates/qorel-signer` にあります。git 依存として利用してください | crates.io には未公開 |

ライセンス: Apache-2.0。QORel は Hermes（著作権: Informal Systems Inc. および Hermes の作者）から派生しており、こちらも Apache-2.0 です。帰属表示はリポジトリの `NOTICE` ファイルに記載されています。コマンドとダウンロードの検証方法は[インストール](/qorel/install)を参照してください。

その他の開発者向けパッケージについては、[開発者向けパッケージ](/developer-tools/overview)を参照してください。IBC がチェーンにどう組み込まれているかについては、[ブリッジアーキテクチャ](/architecture/bridge-architecture#ibc-relayer)を参照してください。

## 制限と既知の問題 {#limits}

- **テストネットのみ。** QORel は `qorechain-diana` と Cosmos Hub 公開テストネットに対して実行されています。メインネットでリレーしたことはなく、メインネットの IBC チャネルも開かれていません。
- **IBC v1（クラシック）のみ。** IBC v2 のリレーは QORel にはまだ実装されておらず、次のフェーズです。Ethereum（Eureka）のリレーは着手していません。
- **チェーンのバージョン。** ハイブリッドモードは、チェーンが報告する sign-bytes バージョンに従います。現在、両方の QoreChain ネットワークが現行の形式（バージョン 2）を検証します。
- **ホスト型リレイヤーはありません。** このマニュアルはリレイヤーサービスを提供しません。チャネルにリレイヤーが動いていなければ、動くまで転送は保留されたままになります。
- **公開エンドポイント。** QoreChain 側には gRPC が必要ですが、公開されていません。他のチェーンのサードパーティ公開エンドポイントは、リレイヤーにレート制限をかけることがよくあります。
- **ウォレットではありません。** QORel が署名するのは、リレイヤーとして送信するトランザクションだけです。ウォレットでの署名については [QoreSign](/qoresign/overview) を参照してください。
- **Windows 向けビルドはありません。** WSL2 でコンテナを使用してください。
- **リリースの状況。** QORel は 0.x リリースです。Hermes と同じコマンドと設定は Hermes の動作を維持します。QoreChain 固有の設定は、1.0 より前に変更される可能性があります。
