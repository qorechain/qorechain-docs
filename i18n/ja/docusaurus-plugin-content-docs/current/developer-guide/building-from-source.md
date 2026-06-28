---
slug: /developer-guide/building-from-source
title: ソースからのビルド
sidebar_label: ソースからのビルド
sidebar_position: 1
---

# ソースからのビルド

このガイドでは、コミュニティ版（オープンコア）ビルドと完全版（プロプライエタリ）ビルドの両方を取り上げながら、`qorechaind` バイナリをソースからビルドする手順を説明します。

## 前提条件

| 依存関係         | 最小バージョン           | 備考                                             |
| ------------------ | ------------------------- | ------------------------------------------------- |
| **Go**             | 1.26+                     | すべてのビルドに必須                           |
| **CGO**            | 有効化（`CGO_ENABLED=1`） | PQC および SVM FFI ブリッジに必須              |
| **Rust ツールチェーン** | 最新の安定版             | `libqorepqc` および `libqoresvm` のコンパイルに必須 |
| **Make**           | 3.81+                     | ビルド自動化                                  |
| **Git**            | 2.x                       | ソースのチェックアウト                                   |

環境を検証します。

```bash
go version        # go1.26.x or later
rustc --version   # stable toolchain
cargo --version
echo $CGO_ENABLED # must be 1
```

:::danger
すべての `go build`、`go test`、`go run` の呼び出しでは、`CGO_ENABLED=1` を設定する**必要があります**。PQC および SVM モジュールは cgo を必要とする FFI ブリッジを使用します。
:::

## ネイティブライブラリ

QoreChain は、実行時にロードされる Rust 製のネイティブライブラリ 2 つに依存します。

### libqorepqc（耐量子暗号）

PQC ライブラリは、C 互換の FFI インターフェースを通じて ML-DSA-87（Dilithium-5）の鍵生成、署名、検証を提供します。

```bash
cd rust/qorepqc
cargo build --release
```

コンパイルされたライブラリは `lib/{os}_{arch}/` に配置されます。

| プラットフォーム    | ライブラリファイル       | ディレクトリ           |
| ----------- | ------------------ | ------------------- |
| macOS arm64 | `libqorepqc.dylib` | `lib/darwin_arm64/` |
| Linux amd64 | `libqorepqc.so`    | `lib/linux_amd64/`  |
| Linux arm64 | `libqorepqc.so`    | `lib/linux_arm64/`  |

### libqoresvm（SVM ランタイム）

SVM ライブラリは、x/svm モジュール向けの BPF プログラム実行環境を提供します。

```bash
cd rust/qoresvm
cargo build --release
```

出力は上記と同じ `lib/{os}_{arch}/` の規則に従います（macOS では `libqoresvm.dylib`、Linux では `libqoresvm.so`）。

### ライブラリパスの設定

ネイティブライブラリは実行時に検出可能である必要があります。お使いのプラットフォームに応じた環境変数を設定してください。

**macOS:**

```bash
export DYLD_LIBRARY_PATH=$(pwd)/lib/darwin_arm64:$DYLD_LIBRARY_PATH
```

**Linux:**

```bash
export LD_LIBRARY_PATH=$(pwd)/lib/linux_amd64:$LD_LIBRARY_PATH
```

:::info
ヒント: この export をシェルプロファイル（`~/.bashrc`、`~/.zshrc`）に追加すると、セッション間で永続化されます。
:::

## オープンコアアーキテクチャ

QoreChain は**オープンコア**モデルに従っています。

* **コミュニティ版ビルド** — すべての QoreChain モジュール（x/pqc、x/ai、x/reputation、x/qca、x/svm、x/crossvm など）の完全なモジュールインターフェース、CLI コマンド、protobuf 定義、メッセージタイプを含みます。プロプライエタリモジュールの Keeper は、安全なデフォルト値や no-op レスポンスを返す**スタブ実装**を使用します。これにより、サードパーティのツール、ウォレット、インデクサーは、プロプライエタリなコードを必要とせずにすべての QoreChain API と統合できます。
* **完全版（プロプライエタリ）ビルド** — `proprietary` ビルドタグの背後にある完全な Keeper 実装を有効化します。これには、実際の AI 異常検知ロジック、PRISM コンセンサスパラメータのチューニング、高度なレピュテーションスコアリング、およびすべての本番グレードの機能が含まれます。

どちらのビルドも同じ `qorechaind` バイナリ名を生成し、同一の CLI コマンドと gRPC/REST エンドポイントを公開します。違いは、それらのインターフェースの背後にある Keeper ロジックの実行時の動作にあります。

## コミュニティ版ビルド

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

これは、プロプライエタリ機能向けのスタブ Keeper を用いて、すべての公開モジュールインターフェースをコンパイルします。得られるバイナリは、以下の用途で完全に機能します。

* バリデーターノードの運用
* トランザクションの送信と照会
* EVM、CosmWasm、SVM の各 VM とのやり取り
* サードパーティ統合とツールの構築
* ローカルでの開発とテスト

## 完全版ビルド（プロプライエタリ）

```bash
CGO_ENABLED=1 go build -tags proprietary -o qorechaind ./cmd/qorechaind/
```

`-tags proprietary` フラグは、完全な Keeper 実装を有効化します。これらは公開ソースツリーには含まれていません。

## テストの実行

```bash
CGO_ENABLED=1 go test ./... -count=1
```

`-count=1` フラグはテストのキャッシュを無効化し、毎回クリーンな実行を保証します。個別のパッケージテストは次のように実行できます。

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/ai/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Rust ライブラリのテストは別途実行します。

```bash
cd rust/qorepqc && cargo test
cd rust/qoresvm && cargo test
```

## ビルドの検証

ビルドが成功したら、バイナリを検証します。

```bash
./qorechaind version
./qorechaind init test-node --chain-id qorechain-diana
```

`init` コマンドは、エラーなく `~/.qorechaind/` に genesis ファイルとノード設定を作成するはずです。上記の例は **`qorechain-diana`** テストネットに対して初期化しています。メインネットの場合は、チェーンバージョン **v3.1.80** を実行する稼働中ネットワークである `--chain-id qorechain-vladi` に置き換えてください。

## Docker ビルド

コンテナ化されたビルド向けに、リポジトリのルートに Dockerfile が用意されています。

```bash
docker build -t qorechaind:latest .
```

Docker イメージは、すべてのネイティブライブラリのコンパイルとパス設定を自動的に処理します。Docker Compose を使ったノードの実行については、[クイックスタート](/getting-started/quickstart)ガイドを参照してください。

## トラブルシューティング

<details>

<summary>cgo: C compiler not found</summary>

Xcode CLI ツール（macOS）または `build-essential`（Linux）をインストールしてください

</details>

<details>

<summary>cannot find -lqorepqc</summary>

先に Rust ライブラリをビルドし、`LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH` を設定してください

</details>

<details>

<summary>undefined: sonic.*</summary>

`go.sum` が最新であることを確認してください: `go mod tidy`

</details>

<details>

<summary>signal: killed during build</summary>

利用可能なメモリを増やしてください（メモリ上限が低い Docker でよく発生します）

</details>

<details>

<summary>PQC tests fail with size mismatch</summary>

`pqcrypto v0.5.0+` を使用していることを確認してください（ML-DSA-87: pubkey=2592、privkey=4896、sig=4627 バイト）

</details>
