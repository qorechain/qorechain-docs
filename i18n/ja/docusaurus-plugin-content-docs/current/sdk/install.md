---
slug: /sdk/install
title: インストール
sidebar_label: インストール
sidebar_position: 2
---

# インストール

お使いの言語向けの SDK をインストールしてください。TypeScript コア（`@qorechain/sdk`）、
EVM および SVM アダプター（`@qorechain/evm`、`@qorechain/svm`）、React キット
（`@qorechain/react`）、そして Python、Go、Rust、Java の各クライアントは、いずれも
ネイティブチェーンと完全に同等の機能（型付きメッセージ、クエリ、トランザクション
ライフサイクル、ハイブリッド PQC トランザクション、WebSocket サブスクリプション）を
備えて各レジストリに**公開済み**です。現行リリースは **0.7.0** で、統合 eth ネイティブ
アカウント、コンセンサスに関わる重大なハイブリッド拡張エンコーディングの修正、
そして Authenticator レーンが追加されています（[Authenticators ガイド](/sdk/guides/authenticators)を参照）。
以下からお使いの言語を選んでください。

:::caution 0.6.0 以前からのアップグレード
SDK **0.6.1** では、コンセンサスに関わる重大なバグが修正されました。
`/qorechain.pqc.v1.PQCHybridSignature` の tx-body 拡張が `Any.value` に
JSON シリアライズされており、**チェーンの CheckTx で拒否されていました**。
SDK ≤ 0.6.0 で構築されたハイブリッド（PQC + クラシカル）トランザクションは
オンチェーンで拒否されます。使用しているすべての言語で 0.6.1 以降に
アップグレードしてください。
:::

## TypeScript

コアパッケージ:

```bash
npm i @qorechain/sdk
```

Node.js 20+ を対象とし、ESM、CommonJS、型定義を同梱しています。

### EVM アダプター

`@qorechain/evm` は [viem](https://viem.sh) 上の薄く型安全なアダプターです。
viem は **peer dependency** なので、一緒にインストールしてください:

```bash
npm i @qorechain/evm viem
```

npm に `0.7.0` で公開されています。

### SVM アダプター

`@qorechain/svm` は
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) 上の薄いアダプターで、
これは **peer dependency** です:

```bash
npm i @qorechain/svm @solana/web3.js
```

npm に `0.7.0` で公開されています。

### React キット

`@qorechain/react` は `@qorechain/sdk` 上に構築された公式の React レイヤーで、
プロバイダー、フック、`ConnectButton` / `QuantumSafeBadge` コンポーネントを提供します。
`react`（>=18）は peer dependency です:

```bash
npm i @qorechain/react
```

npm に `0.7.0` で公開されています。[React キットガイド](/sdk/guides/react)を参照してください。

### スキャフォルダー

`create-qorechain-dapp`（npm、`0.7.0`）は、すぐに実行できる dApp を生成します:

```bash
npm create qorechain-dapp@latest my-dapp
```

## Python

```bash
pip install qorechain-sdk
```

Python 3.10+ が必要です。パッケージには型ヒントと `py.typed` マーカーが同梱されています。

> ディストリビューションは `qorechain-sdk` としてインストールされます（PyPI に `0.7.0` で公開）
> が、**インポートは `qorsdk`** で行います:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Go 1.23+ が必要です。必要なサブパッケージをインポートしてください。例:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

自己完結型の Go モジュールとして公開されています（タグ `packages/go/v0.7.0`）。

## Rust

```bash
cargo add qorechain-sdk
```

または、リポジトリから直接 `0.7.0` のソースを追跡する場合:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Rust 1.74+ が必要です。読み取りクライアントは非同期（Tokio）です。クレートの
インポート名は `qorechain` です（`use qorechain;`）。

> crates.io には `qorechain-sdk` として公開されています。`cargo add qorechain-sdk` は
> **公開済みの最新クレート**をインストールしますが、これは現時点で `0.7.0` リリースより
> 遅れています。crates.io（公開済みの最新版）からインストールするか、最新の API を
> 利用する場合はリポジトリからインストールしてください。

## Java

Maven（`pom.xml`）:

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.7.0</version>
</dependency>
```

または Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.7.0'
```

> Maven Central に `io.github.qorechain:qorechain-sdk:0.7.0` として公開されています。

## 次のステップ

[クイックスタート](/sdk/quickstart)に進み、接続してオンチェーンの状態を読み取りましょう。
