---
slug: /qorel/whats-new
title: QORel の新機能
sidebar_label: 新機能
sidebar_position: 2
---

# QORel の新機能

このページでは、QORel の各リリースが追加するものを一覧にします。Hermes から、または以前の QORel から移行するかどうかを判断するオペレーター向けで、確認可能な動作として、リリースが行うことだけを記載します。QORel は Hermes 1.13.3（Informal Systems、Apache-2.0）をベースにしており、以下の変更はすべてそのベースの上に加えられたものです。記載されていないものは、Hermes と同じように動作します。

## 0.1.0 {#v0-1-0}

最初のリリースです。テストネット専用です。ファイルは[リリースページ](https://github.com/qorechain/QORel/releases)にあります。

### 特長 {#innovations}

- **QoreChain 向けのハイブリッドのポスト量子署名。** チェーンに `signing = 'qorechain-hybrid'` を設定すると、QORel は各トランザクションの唯一のクリティカルな拡張オプションとして ML-DSA-87 署名（`/qorechain.pqc.v1.PQCHybridSignature`）を追加し、その後、最終的なボディに secp256k1 で署名します。ポスト量子鍵が署名するメッセージは、バージョン 2 の sign bytes で、QoreChain の両方のネットワークがこれを検証します。静的な `extension_options` はこのモードと併用できず、併用すると設定は拒否されます。
- **標準の署名は変更されません。** `signing = 'standard'`（デフォルト）では、Cosmos Hub、Osmosis、その他すべての Cosmos SDK チェーンに対して、トランザクション形式は Hermes とバイト単位で同一です。
- **`qorel-signer` クレート。** ポスト量子プリミティブ（`MlDsa87Signer` を含む `PqSigner`）、チェーンのルール（`SignBytesFramer`）、リレイヤーが呼び出す拡張シグナー（`TxExtensionSigner`）は、別々のインターフェースです。ガスのシミュレーションとバッチサイズの決定は同じ経路を通るため、追加の約 4.7 KB と検証のガスは常に計上されます。
- **`qorel keys add` がポスト量子鍵を導出します。** ハイブリッドチェーンでは、同じニーモニックとアカウントから QoreChain ウォレットの導出方式で ML-DSA-87 鍵を導出し、その 32 バイトのシードだけを、鍵の隣に `<key name>.pqc` として保存します。秘密情報は一切出力されません。
- **`qorel keys register-pqc`。** `MsgRegisterPQCKeyV2` を 1 回送信します。v3.2.3 以降のネットワークでは所有証明（proof of possession）を伴います。冪等であり（同じ鍵がすでに登録されている場合は何も送信しません）、アカウントにすでに別の鍵がある場合は送信を拒否します。`--no-proof` は v3.2.3 より古いネットワーク専用です。
- **`qorel keys pqc-status`。** 鍵が登録されているか、ローカルの鍵と一致するか、所有が証明されたか、チェーンがどの sign bytes を検証するか、そして `ready_to_relay` を表示します。
- **送信前の安全チェック。** ハイブリッドチェーンへのトランザクションごとに、QORel は、鍵が読み込まれていて、登録され、ローカルの鍵と同一であること、そして sign-bytes バージョンが判明していることを確認します。`pqc.sign_bytes = 'auto'` では、チェーンの適用済みアップグレード記録からバージョンを読み取り、1 分ごとに再読み込みし、codespace `pqc` コード 21 での拒否の後にも再読み込みします。いずれかが失敗した場合は何も送信されず、手数料も消費されません。`health-check` がその理由を報告します。
- **フィーマーケットのガス価格。** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` は、QoreChain のベースフィーを読み取ります。その下限はガス 1 あたり 0.1 uqor です。
- **ibc-go v10 チェーンでの不正行為の検出。** ibc-go v10 は `update_client` イベントにヘッダーを含めなくなったため、QORel は `MsgUpdateClient` トランザクションからヘッダーを読み取ります。標準の Hermes 1.13 は、これらのチェーンで検出を無効にします。
- **パケットワーカーはレート制限を乗り越えます。** ワーカーは、リレーまたはクリアリングの試行が失敗している間も動き続け、クリアインターバルごとに再試行します。Hermes では、直近のクリアリングが失敗していても、新しい IBC イベントなしで `clear_interval x 5` ブロックが経過するとワーカーが停止するため、その時点で保留中だったパケットは、チャネル上の次のパケットか再起動まで待たされました。
- **所有者のみの鍵ファイル。** Hermes は鍵ファイルをデフォルトの umask で書き込んでいました。QORel は `<key name>.json` と `<key name>.pqc` をモード 0600 で書き込みます。古い Hermes で追加された鍵は以前のモードのままなので、`ls -l` で確認してください。
- **`qorel` バイナリ。** Hermes のコマンドセットにポスト量子鍵コマンドを加えた、`qorel` という 1 つのバイナリ。同じ CLI を持つ `hermes` バイナリも、ソースツリーからビルドされます。
- **来歴付きのリリース。** Linux と macOS 向けの tarball、堅牢化された systemd ユニットを含む `.deb` と `.rpm` パッケージ、Homebrew フォーミュラ、cosign で署名されたマルチアーキテクチャのコンテナイメージ。リリースファイルには `SHA256SUMS` とビルド attestation が付属します。[インストール](/qorel/install)を参照してください。
- **ローカルのデブネットテスト。** リポジトリには `scripts/qorel-devnet/` が含まれており、QoreChain ノードと ibc-go v10 のテストチェーンをローカルにビルドして、両方向の ICS-20 エンドツーエンドテストを実行します。内容は、鍵の登録、クライアント・コネクション・チャネルの作成、両方向の転送、転送されたトークンの巻き戻し、タイムアウトしたパケットのクリアと返金、QORel 自身が送信した転送です。

### テストネットでの実証 {#proven-on-the-testnet}

- QoreChain テストネット最初の IBC チャネル、`qorechain-diana` の `transfer/channel-0` から Cosmos Hub 公開テストネット（チェーン ID `provider`）の `channel-600` は、QORel がリレーしています。クライアントは `07-tendermint-0` と `07-tendermint-466`、コネクションは `connection-0` と `connection-315` です。
- 両方向の転送（1 QOR の送出、0.1 ATOM の受け取り、0.4 QOR の返却）と、タイムアウト 1 秒の転送のタイムアウトメッセージによる自動返金がテストされました。`qorechain-diana` 上のリレイヤーのトランザクション 13 件はすべて成功しました。
- チャネルの読み取り側の表示は[アセットのブリッジ](/user-guide/bridging-assets#ibc-test-channel)にあります。

### このリリースに含まれないもの {#not-in-this-release}

- IBC v2 のリレー。QORel にはまだ実装されておらず、次のフェーズです。
- Ethereum（Eureka）のリレー。未着手です。
- メインネットでのリレー。メインネットの IBC チャネルはまだ開かれていません。
- Windows 向けビルド。
- crates.io 上の `qorel-signer` クレート。公開は保留中です。クレートはリポジトリの `crates/qorel-signer` にあるため、git 依存として利用してください。

## アップグレード {#upgrading}

以前の QORel リリースはありません。Hermes 1.13 から QORel 0.1.0 への移行:

1. `hermes` の隣に、または置き換えて `qorel` をインストールします（[インストール](/qorel/install)）。
2. `config.toml` はそのまま使います。`signing` のないチェーンは標準署名のままで、以前と同じように動作します。
3. サービスファイルのコマンドを `hermes` から `qorel` に変更します。鍵ストアフォルダ（デフォルトは `~/.hermes/keys`）は変わりません。コンテナイメージがデータを `/home/nonroot/.hermes` にマウントするのはそのためです。
4. `ls -l` で鍵ファイルのモードを確認します。新しい鍵は 0600 で、古いものは以前のモードのままです。

リポジトリの `UPGRADING.md` にあるアップストリーム Hermes のアップグレードノートは、1.6 より古い Hermes のバージョンから移行する方に当てはまります。
