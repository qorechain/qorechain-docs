---
slug: /sdk/install
title: インストール
sidebar_label: インストール
sidebar_position: 2
---

# インストール

使用する言語に合わせて SDK をインストールします。TypeScript コア（`@qorechain/sdk`）、
EVM および SVM アダプター（`@qorechain/evm`、`@qorechain/svm`）、React キット
（`@qorechain/react`）、そして Python、Go、Rust、Java の各クライアントは、すべて
ネイティブチェーンと完全に同等の機能（型付きメッセージ、
クエリ、トランザクションライフサイクル、ハイブリッド PQC トランザクション、WebSocket
サブスクリプション）を備えて各レジストリに**公開済み**です。以下から言語を選択してください。

## TypeScript

コアパッケージ:

```bash
npm i @qorechain/sdk
```

Node.js 20 以上を対象とし、ESM、CommonJS、型定義を同梱しています。

### EVM アダプター

`@qorechain/evm` は [viem](https://viem.sh) 上の薄く型安全なアダプターです。
viem は**ピア依存**なので、一緒にインストールしてください:

```bash
npm i @qorechain/evm viem
```

npm に `0.5.0` で公開されています。

### SVM アダプター

`@qorechain/svm` は
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) 上の薄いアダプターで、
これは**ピア依存**です:

```bash
npm i @qorechain/svm @solana/web3.js
```

npm に `0.5.0` で公開されています。

### React キット

`@qorechain/react` は `@qorechain/sdk` 上に構築された公式の React レイヤーで、
プロバイダー、フック、`ConnectButton` / `QuantumSafeBadge` コンポーネントを提供します。
`react`（>=18）はピア依存です:

```bash
npm i @qorechain/react
```

npm に `0.5.0` で公開されています。[React キットガイド](/sdk/guides/react)を参照してください。

## Python

```bash
pip install qorechain-sdk
```

Python 3.10 以上が必要です。パッケージには型ヒントと `py.typed` マーカーが同梱されています。

> ディストリビューションは `qorechain-sdk` としてインストールされます（PyPI に `0.5.0` で公開）
> が、**インポートは `qorsdk`** で行います:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Go 1.23 以上が必要です。必要なサブパッケージをインポートしてください。例:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

自己完結型の Go モジュールとして `packages/go/v0.5.0` で公開されています。

## Rust

```bash
cargo add qorechain-sdk
```

または `Cargo.toml` に:

```toml
[dependencies]
qorechain-sdk = "0.5"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Rust 1.74 以上が必要です。読み取りクライアントは非同期（Tokio）です。

> crates.io に `qorechain-sdk` として `0.5.0` で公開されています。

## Java

Maven（`pom.xml`）:

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.5.0</version>
</dependency>
```

または Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.5.0'
```

> Maven Central に `io.github.qorechain:qorechain-sdk:0.5.0` として公開されています。

## 次のステップ

[クイックスタート](/sdk/quickstart)に進み、接続してオンチェーンの状態を読み取りましょう。
