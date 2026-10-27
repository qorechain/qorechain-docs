---
slug: /qorel/install
title: QORel のインストール
sidebar_label: インストール
sidebar_position: 3
---

# QORel のインストール

QORel は `qorel` という 1 つのバイナリです。このページでは、各インストール方法と、ダウンロードしたものを確認する方法を説明します。サーバー、ノート PC、コンテナプラットフォームでリレイヤーを構築するオペレーター向けです。チャネルは 1 つ選んでください。どれも同じプログラムをインストールします。

[GitHub Releases](https://github.com/qorechain/QORel/releases) の各リリースは `qorel-v<version>` タグ（例: `qorel-v0.1.0`）で公開され、`SHA256SUMS` ファイルとビルド来歴の証明（attestation）が付属しており、`gh attestation verify <file> --repo qorechain/QORel` で確認できます。リポジトリ内の通常の `v*` タグ（例: `v0.1.0`）はアップストリーム Hermes の履歴であり、QORel のリリースではありません。必ず `qorel-v` プレフィックスを使用してください。

## 特長 {#innovations}

- **確認できるダウンロード。** tarball は `SHA256SUMS` とビルドの attestation の対象になっているため、ファイルが破損していないことと、QORel リポジトリのリリースワークフローでビルドされたことの両方を確認できます。
- **署名付きコンテナイメージ。** イメージ `ghcr.io/qorechain/qorel` は cosign のキーレス署名で署名されています。署名にはリポジトリのリリースワークフローが記録されており、イメージを実行する前に検証できます。
- **パッケージに含まれる堅牢化されたサービス。** `.deb` と `.rpm` は `qorel.service` をインストールします。このサービスは専用の `qorel` ユーザーとして、ホームを `/var/lib/qorel` に置き、umask は `0077`、新しい権限の取得なし、プライベートな `/tmp`、読み取り専用のシステム、書き込みは `/var/lib/qorel` のみ、という設定で動作します。
- **小さな distroless イメージ。** コンテナはマルチアーキテクチャ（amd64 と arm64）の distroless で、非 root です。

## 使い方 {#how-to-use}

| プラットフォーム | チャネル |
|---|---|
| Linux x86_64 または arm64（glibc 2.28 以降: Ubuntu 20.04+、Debian 11+、RHEL、Rocky または Alma 8+、Amazon Linux 2023） | tarball、`.deb`、`.rpm`、コンテナ、Homebrew |
| macOS Apple Silicon または Intel | tarball、Homebrew |
| Docker または Kubernetes | `ghcr.io/qorechain/qorel` |
| Rust ツールチェーンがある環境 | ソースから |

Windows はサポートされていません（アップストリームの Hermes も Windows 向けにはリリースしていません）。WSL2 でコンテナを実行してください。

### リリース tarball {#tarball}

```bash
V=0.1.0
T=x86_64-unknown-linux-gnu   # or aarch64-unknown-linux-gnu, aarch64-apple-darwin, x86_64-apple-darwin
curl -LO https://github.com/qorechain/QORel/releases/download/qorel-v$V/qorel-v$V-$T.tar.gz
curl -LO https://github.com/qorechain/QORel/releases/download/qorel-v$V/SHA256SUMS
sha256sum --ignore-missing -c SHA256SUMS   # macOS: shasum -a 256 --ignore-missing -c SHA256SUMS
tar -xzf qorel-v$V-$T.tar.gz
sudo install -m 0755 qorel-v$V-$T/qorel /usr/local/bin/qorel
qorel --version
```

展開する前に、チェックサムの行が tarball に対して `OK` と表示される必要があります。

### Debian、Ubuntu、RHEL 系 {#packages}

```bash
V=0.1.0
sudo apt install ./qorel_${V}_amd64.deb       # or arm64
sudo dnf install ./qorel-${V}-1.x86_64.rpm    # or aarch64
```

先にリリースページからパッケージをダウンロードし、`SHA256SUMS` と照合してください。パッケージは次をインストールします。

- `/usr/bin/qorel`
- 堅牢化された `qorel.service`。ユーザー `qorel` として、ホームを `/var/lib/qorel` に置いて動作します
- `/etc/qorel/config.example.toml`

その後、`qorel` ユーザーとして設定と鍵をセットアップします。

```bash
sudo cp /etc/qorel/config.example.toml /etc/qorel/config.toml   # edit it
sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain <chain> --key-name relayer --mnemonic-file <file>
sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana   # QoreChain only, once
sudo -u qorel qorel --config /etc/qorel/config.toml health-check
sudo systemctl enable --now qorel
```

`keys add` の後は、ニーモニックファイルを削除してください。鍵ファイルは所有者のみが読み取れる（0600）状態で書き込まれます。

### Homebrew（macOS と Linux） {#homebrew}

```bash
brew install qorechain/tap/qorel
qorel --version
```

### コンテナ {#container}

```bash
docker run --rm ghcr.io/qorechain/qorel:0.1.0 --version
docker run -d --name qorel --restart unless-stopped \
  -v $HOME/.qorel:/home/nonroot/.hermes \
  ghcr.io/qorechain/qorel:0.1.0 start
```

設定ファイル（`config.toml`）と `keys/` フォルダは、マウントしたディレクトリから読み込まれます。このディレクトリの所有者は uid 65532、モードは 0700 である必要があります。

実行する前に、イメージの署名を検証してください。

```bash
cosign verify ghcr.io/qorechain/qorel:0.1.0 \
  --certificate-identity-regexp 'https://github.com/qorechain/QORel/.github/workflows/qorel-release.yml@refs/tags/qorel-v.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

### ソースから {#from-source}

```bash
cargo install --locked --git https://github.com/qorechain/QORel --tag qorel-v0.1.0 ibc-relayer-cli --bin qorel
```

Rust 1.85、`protoc`、`clang` が必要です。Linux では OpenSSL のヘッダーも必要です。OpenSSL を組み込んでコンパイルするには `--features vendored-openssl` を追加してください。

### 動作確認 {#check}

```bash
qorel --version
qorel --help
```

`qorel keys --help` は、鍵コマンドとして `add`、`register-pqc`、`pqc-status` を一覧表示します。

## アクセス方法 {#how-to-access}

- **費用。** 無料です。Apache-2.0 です。
- **アカウント。** インストールには不要です。リレーするには、各チェーンにリレイヤーアカウントが必要です（[クイックスタート](/qorel/quickstart)を参照）。
- **ネットワークアクセス。** ホストは、設定した各チェーンの RPC、gRPC、WebSocket エンドポイントへアウトバウンドで接続できる必要があります。
- **前提条件。** パッケージと tarball では glibc 2.28 以降。ソースからのビルドでは Rust 1.85、`protoc`、`clang`。

## 公開場所 {#where-published}

| チャネル | 名前 | バージョン | リンク |
|---|---|---|---|
| GitHub Releases | `qorel-v0.1.0-<target>.tar.gz`、`.deb`、`.rpm`、`SHA256SUMS` | 0.1.0 | [qorechain/QORel releases](https://github.com/qorechain/QORel/releases) |
| ダウンロードミラー | `download.qore.host/qorel/v0.1.0/<file>`, `download.qore.host/qorel/latest/<file>`, `latest.json` | 0.1.0 | [download.qore.host/qorel/latest.json](https://download.qore.host/qorel/latest.json) |
| Homebrew | `qorechain/tap/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` |
| コンテナレジストリ | `ghcr.io/qorechain/qorel` | 0.1.0 | `docker pull ghcr.io/qorechain/qorel:0.1.0` |
| ソース | `ibc-relayer-cli`、バイナリ `qorel` | タグ `qorel-v0.1.0` | [github.com/qorechain/QORel](https://github.com/qorechain/QORel) |

## 制限と既知の問題 {#limits}

- **Windows 向けビルドはありません。** WSL2 でコンテナを使用してください。
- **プレリリース版で、ファイルが大きいです。** バージョン 0.1.0 は GitHub のプレリリースとして公開されています。バイナリがまだ strip されていないため、リリースの各ファイルは約 110 MB あります。Docker Hub のイメージはありません。上記の `ghcr.io` のイメージを使用してください。
- **バージョンを固定してください。** 上記のコマンドは `0.1.0` を使っています。`latest` ではなく、実行するつもりのバージョンを使用し、新しいバージョンについては[リリースページ](https://github.com/qorechain/QORel/releases)を確認してください。
- **鍵ごとに 1 プロセス。** パッケージのサービスと、同じリレイヤー鍵を使うコンテナを同時に実行しないでください。同じ鍵で署名する 2 つのプロセスは、アカウントシーケンスを取り合います。
- **鍵ストアの場所。** パッケージは鍵を `/var/lib/qorel` に保存します。コンテナはマウントしたディレクトリから読み込みます。tarball のインストールでは、設定で `key_store_folder` を指定しない限り `~/.hermes/keys` を使用します。

次へ: [クイックスタート](/qorel/quickstart)、[設定](/qorel/configuration)、[バリデーターと並べて運用する](/qorel/running-next-to-a-validator)。
