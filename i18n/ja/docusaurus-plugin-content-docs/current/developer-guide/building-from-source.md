---
slug: /developer-guide/building-from-source
title: ソースからのビルド
sidebar_label: ソースからのビルド
sidebar_position: 1
---

# ソースからのビルド

このガイドでは、公開ソースからコミュニティ版の `qorechaind` バイナリをビルドする手順を説明し、そのバイナリが何のためのもので、何のためのものではないかを解説します。

:::caution ソースからのビルドではメインネットにもテストネットにも参加できません
公開リポジトリには、**スタブ Keeper** を備えたモジュールインターフェースが含まれています。コンセンサスに不可欠な Keeper 実装と耐量子署名器は公開ソースツリーには含まれていません。そこからビルドしたバイナリは、ネットワークのコンセンサス状態を再現できず、Cosmos レーンのすべてのトランザクションが必要とするハイブリッド耐量子署名も作成できません。v3.2.3 以降、このバイナリは `qorechain-vladi` または `qorechain-diana` 上では**起動を拒否**します（チェーン ID とジェネシス時刻で両ネットワークを識別します。公開チェーン ID を独自のジェネシスで再利用するローカル devnet は影響を受けません）。`qorechaind start --community-unenforced-pqc` を使うと、実験用にこの拒否を上書きできます。ただしその場合、ノードは耐量子署名を一切検証せず、警告なしにネットワークから乖離する可能性があるため、信頼して使うノードには決して使用しないでください。メインネットまたはテストネットでノードやバリデーターを運用するには、稼働中のマニフェスト（`https://download.qore.host/mainnet/latest.json` または `.../testnet/latest.json`）に記載された**リリースバイナリ**をインストールしてください。[ノードの運用](/developer-guide/running-a-node)および[バリデーターの運用](/developer-guide/running-a-validator)を参照してください。
:::

## 前提条件

| 依存関係         | 最小バージョン           | 備考                                             |
| ------------------ | ------------------------- | ------------------------------------------------- |
| **Go**             | 1.26+                     | すべてのビルドに必須                           |
| **CGO**            | 有効化（`CGO_ENABLED=1`） | PQC および SVM FFI ブリッジに必須              |
| **Make**           | 3.81+                     | ビルド自動化                                  |
| **Git**            | 2.x                       | ソースのチェックアウト                                   |

環境を検証します。

```bash
go version        # go1.26.x or later
echo $CGO_ENABLED # must be 1
```

:::danger
すべての `go build`、`go test`、`go run` の呼び出しでは、`CGO_ENABLED=1` を設定する**必要があります**。ノードは cgo を通じてネイティブライブラリ（QoreChain Native ランタイム、およびリリースビルドでは PQC と SVM のライブラリ）をリンクします。
:::

## ネイティブライブラリ

### libqorepqc と libqoresvm

耐量子（`libqorepqc`）と SVM（`libqoresvm`）のライブラリは、**公開リポジトリには含まれていない** Rust ソースからビルドされます（`qorechain-core` に `rust/` ディレクトリはありません）。コミュニティ版ビルドにはこれらは不要です。各ネットワーク向けのリリースアーカイブには、コンパイル済みライブラリ（`libqorepqc.so`、`libqoresvm.so`、`libwasmvm.x86_64.so`）が `qorechaind` の隣の `lib/` ディレクトリに同梱されています。これらを `lib/{os}_{arch}/` に配置するか、以下のようにローダーにパスを指定してください。

### ライブラリパスの設定

リリースバイナリを使用する場合、その共有ライブラリは実行時に検出可能である必要があります。お使いのプラットフォームに応じた環境変数を設定してください。

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
* **完全版ビルド** — 完全な Keeper 実装（コンセンサスに不可欠な実際のモジュールロジックと耐量子署名器）を含みます。[download.qore.host](https://download.qore.host) で公開されるリリースバイナリとして配布されており、公開ソースツリーからビルドするものではありません。

どちらのビルドも同じ `qorechaind` バイナリ名を生成し、同一の CLI コマンドを公開します。違いは、それらのインターフェースの背後にある Keeper ロジックの実行時の動作にあります。

## コミュニティ版ビルド

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

これは、プロプライエタリ機能向けのスタブ Keeper を用いて、すべての公開モジュールインターフェースをコンパイルします。得られるバイナリは、以下の用途を想定しています。

* ローカルでの開発とテスト（たとえば単一ノードの devnet）
* ネットワークの照会（`query ...` コマンドは任意のノードに対して動作します）
* モジュールインターフェースに対するサードパーティ統合とツールの構築

これは、バリデーターとしてメインネットやテストネットに参加したり、そこでトランザクションを実行したりする手段ではありません。耐量子署名器を持たず（`tx pqc gen-key` と `tx pqc cosign` はエラーを返します）、そのスタブ Keeper はネットワークのコンセンサスルールを再現しません。

## 完全版ビルド（リリースバイナリ）

完全な Keeper 実装、および `tx pqc gen-key` と `tx pqc cosign` の背後にある署名器は、公開ソースツリーには含まれていないため、そこからビルドすることはできません。[download.qore.host](https://download.qore.host) で公開されているバイナリが完全版ビルドです。メインネットとテストネットにはそれらを使用してください。

## テストの実行

```bash
CGO_ENABLED=1 go test ./... -count=1
```

`-count=1` フラグはテストのキャッシュを無効化し、毎回クリーンな実行を保証します。個別のパッケージテストは次のように実行できます。

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

ネイティブライブラリやプロプライエタリ Keeper を実行するテストは、完全版ビルドにのみコンパイルされ、公開テストスイートには含まれません。

## ビルドの検証

ビルドが成功したら、バイナリを検証します。

```bash
./qorechaind version   # may print nothing: release binaries do not report a version string
./qorechaind init test-node --chain-id qorechain-diana
```

`init` コマンドは、エラーなく `~/.qorechaind/` に genesis ファイルとノード設定を作成するはずです。上記の例は **`qorechain-diana`** テストネットに対して初期化しています。メインネットの場合は、稼働中のネットワークである `--chain-id qorechain-vladi`（ノードリリース **v3.2.4**）に置き換えてください。

## Docker ビルド

リポジトリのルートに Dockerfile が用意されています。

```bash
docker build -t qorechaind:community .
```

これは**コミュニティ版**バイナリをビルドします（Dockerfile 自身のコメントには "Public build — no PQC library" とあります）。したがってこのイメージはローカル開発とツール向けであり、メインネットやテストネットに追従するためのものではありません。Docker でネットワークノードを運用するには、代わりにリリースバイナリをラップしてください。[ノードの運用](/developer-guide/running-a-node#docker-compose)を参照してください。

## トラブルシューティング

<details>

<summary>cgo: C compiler not found</summary>

Xcode CLI ツール（macOS）または `build-essential`（Linux）をインストールしてください

</details>

<details>

<summary>cannot find -lqorepqc</summary>

ネイティブライブラリを必要とするビルドをリンクしています。コミュニティ版ビルド（これらは不要です）か、ライブラリを同梱したリリースアーカイブを使用し、`LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH` をその `lib/` ディレクトリに設定してください

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

ML-DSA-87 のサイズは、公開鍵 2,592 バイト、秘密鍵 4,896 バイト、署名 4,627 バイトです。これ以外のサイズは、別のアルゴリズムか、切り詰められた値であることを意味します。

</details>
