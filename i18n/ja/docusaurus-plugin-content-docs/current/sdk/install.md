---
slug: /sdk/install
title: インストール
sidebar_label: インストール
sidebar_position: 2
---

# インストール

お使いの言語向けの SDK をインストールします。TypeScript コア（`@qorechain/sdk`）、
EVM および SVM アダプター（`@qorechain/evm`、`@qorechain/svm`）、React キット
（`@qorechain/react`）、そして Python、Go、Rust、Java クライアントはすべて、
ネイティブチェーンとの完全な互換性（型付きメッセージ、クエリ、tx ライフサイクル、
ハイブリッド PQC トランザクション、WebSocket サブスクリプション）を備えて各レジストリに
**公開**されています。現在のリリースラインは **0.8** です。TypeScript、Python、Rust、
Java は **0.8.3**、Go モジュールは **v0.8.4** です。以下からお使いの言語を
選んでください。

## アップグレードノート {#upgrade}

:::danger 稼働中のネットワークでは SDK 0.8.1 以降を使用してください
両方の公開ネットワークは **v2 ハイブリッド sign-bytes** 形式（ドメインタグ付きで
chain id にバインド）を検証し、古い形式は `pqc` コード 21 で拒否します。
**0.8.0** より前のすべての SDK リリースは古い形式で署名します。また **0.8.0** は、ネットワークが使用した
2 つのアップグレード名のうち一方だけでこの切り替えを探します（メインネットでは
`v3.2.0`、テストネットでは `v3.1.98`、その後 `v3.2.0` として記録されています）。そのため
メインネットでは誤った形式で署名します。すべての言語で **0.8.1 以降**を使用してください。
[EVM 認可ウィンドウ](/sdk/guides/evm#evm-window)を開くには **0.8.2 以降**が必要です。
ハイブリッドビルダーは `signBytesVersion` オプション（`"auto"` | `"v1"` | `"v2"`）を受け取ります。`"auto"` は
ネットワークに問い合わせるため、`qorechain-vladi` / `qorechain-diana` では
REST エンドポイント（`rest`）が必要です。推測せずに例外を投げます。
[どの sign-bytes 形式か?](/sdk/concepts/accounts-pqc#sign-bytes-versions)を参照してください。
:::

:::caution 過去の修正
SDK **0.6.1** はコンセンサスに致命的なバグを修正しました。
`/qorechain.pqc.v1.PQCHybridSignature` tx-body 拡張が `Any.value` に
JSON シリアライズされており、**チェーンが CheckTx で拒否**していました。SDK ≤ 0.6.0 で構築した
ハイブリッド（PQC + 古典）トランザクションはオンチェーンで拒否されます。**0.8.0** では
ウォレット署名によるアカウントヘルパーが削除されました（
[アカウントと PQC 署名](/sdk/concepts/accounts-pqc#phantom)を参照）。
:::

## TypeScript

コアパッケージ:

```bash
npm i @qorechain/sdk
```

Node.js 20+ を対象とし、ESM、CommonJS、型定義を同梱しています。このドキュメントの
ハイブリッドトランザクションのサンプルは、`@cosmjs/stargate` から
`StargateClient` もインポートします（`npm i @cosmjs/stargate`）。

### EVM アダプター

`@qorechain/evm` は [viem](https://viem.sh) の上に構築された、薄くて型安全なアダプターです。
viem は**ピア依存**です。一緒にインストールしてください:

```bash
npm i @qorechain/evm viem
```

npm には `0.8.0` で公開されています。

### SVM アダプター

`@qorechain/svm` は
[`@solana/web3.js`](https://solana.com/docs/clients/javascript)（これは
**ピア依存**です）の上に構築された薄いアダプターです:

```bash
npm i @qorechain/svm @solana/web3.js
```

npm には `0.8.0` で公開されています。

### React キット

`@qorechain/react` は `@qorechain/sdk` の上に構築された公式の React レイヤーで、
プロバイダー、フック、`ConnectButton` / `QuantumSafeBadge` コンポーネントを提供します。
`react`（>=18）はピア依存です:

```bash
npm i @qorechain/react
```

npm には `0.8.3` で公開されています。[React キットガイド](/sdk/guides/react)を参照してください。

### スキャフォルダー

`create-qorechain-dapp`（npm、`0.8.0`）はすぐに実行できる dApp を生成します:

```bash
npm create qorechain-dapp@latest my-dapp
```

生成される `package.json` ファイルは `@qorechain/sdk` / `@qorechain/evm` を
`^0.3.0` に固定しており、npm はこれを、稼働中のネットワーク向けに署名できない 0.3 リリースに解決します。
生成後に `npm i @qorechain/sdk@latest`（EVM テンプレートの場合は
`npm i @qorechain/evm@latest` も）を実行してください。
[CLI リファレンス](/sdk/reference/cli)を参照してください。

## Python

```bash
pip install qorechain-sdk
```

Python 3.10+ が必要です。パッケージには型ヒントと `py.typed` マーカーが含まれています。

> ディストリビューションは `qorechain-sdk` としてインストールされます（PyPI に `0.8.3` で公開）
> が、**インポートは `qorsdk`** で行います:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Go 1.23+ が必要です。必要なサブパッケージをインポートします。例:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

自己完結型の Go モジュールとして公開されています（タグ `packages/go/v0.8.4`）。

## Rust

```bash
cargo add qorechain-sdk
```

または、リポジトリの先頭を追跡するには:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Rust 1.74+ が必要です。読み取りクライアントは非同期（Tokio）です。クレートは
`qorechain` としてインポートされます（`use qorechain;`）。

> crates.io には `qorechain-sdk`（0.8.3）として公開されています。`cargo add qorechain-sdk` は
> 最新リリースをインストールします。

## Java

Maven（`pom.xml`）:

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.8.3</version>
</dependency>
```

または Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.8.3'
```

> Maven Central に `io.github.qorechain:qorechain-sdk:0.8.3` として公開されています。Central
> には 0.8.0 および 0.8.1 のビルドがないため、稼働中のネットワークでは 0.8.2 以降を使用してください。

## 関連パッケージ {#related-packages}

| パッケージ | 用途 | バージョン |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | ウォレット側のヘルパー: ウォレット生成（`generateQoreWallet`）、`eth_secp256k1` ハイブリッド署名（`signHybridEth`、`QoreChainSigner`）、MetaMask へのネットワーク登録（`addQoreEvmToWallet`）、authenticator および EVM ウィンドウのメッセージビルダー。ピア依存: `@cosmjs/proto-signing` と `@cosmjs/stargate` `^0.32` | 0.3.0 |
| `@qorechain/chain-bridge` | バックエンド向けのサーバー側ワーカー: PQC 鍵を導出し、ハイブリッド署名してブロードキャストします（`sendTokens`、`registerPqc` など）。`cosmosRest` を渡してください | 0.2.2 |
| `@qorechain/pqc` | 標準のみに準拠した ML-DSA / ML-KEM / SHAKE-256 プリミティブと `hybridSignBytes`（[ポスト量子署名](/developer-guide/post-quantum-signing)を参照） | 0.2.1 |
| `@qorechain/handles` | 初回使用時ピンニング付きの検証済み `@handle` 解決（`HandleClient`） | 0.1.0 |
| `@qorechain/rdk` | Rollup Development Kit クライアント（[ロールアップ](/rollups/why)を参照）。npm リリース（0.4.4）は古典署名のみでトランザクションに署名しますが、ネットワークはこれを拒否するため、読み取りはできても送信はできません。ハイブリッド署名は 0.5.0 にあり、現在は PyPI と Go モジュールのみです | 0.4.4（npm） |

## 次のステップ

[クイックスタート](/sdk/quickstart)に進んで、接続とオンチェーン状態の読み取りを行いましょう。
