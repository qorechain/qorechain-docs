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
**公開**されています。現在のリリースラインは **0.9** で、2026年10月21日に公開されました
（同日に各レジストリで確認済み）。

| レジストリ | パッケージ | バージョン |
| --- | --- | --- |
| npm | `@qorechain/sdk`、`@qorechain/react`、`create-qorechain-dapp` | 0.9.0 |
| PyPI | `qorechain-sdk`（インポートは `qorsdk`） | 0.9.0 |
| crates.io | `qorechain-sdk`（インポートは `qorechain`） | 0.9.0 |
| Go モジュールプロキシ | `github.com/qorechain/qorechain-sdk/packages/go` | v0.9.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.9.1（Bouncy Castle 依存関係を更新した Java 専用のアップデートで、API の変更はありません。他の言語は 0.9.0 のままです） |

以下からお使いの言語を選んでください。

## アップグレードノート {#upgrade}

:::danger 稼働中のネットワークでは SDK 0.8.1 以降を使用してください
両方の公開ネットワークは **v2 ハイブリッド sign-bytes** 形式（ドメインタグ付きで
chain id にバインド）を検証し、古い形式は `pqc` コード 21 で拒否します。
**0.8.0** より前のすべての SDK リリースは古い形式で署名します。また **0.8.0** は、ネットワークが使用した
2 つのアップグレード名のうち一方だけでこの切り替えを探します（メインネットでは
`v3.2.0`、テストネットでは `v3.1.98`、その後 `v3.2.0` として記録されています）。そのため
メインネットでは誤った形式で署名します。すべての言語で **0.9.0**（少なくとも **0.8.1**）を使用してください。
[EVM 認可ウィンドウ](/sdk/guides/evm#evm-window)を開くには **0.8.2 以降**が必要です。
ハイブリッドビルダーは `signBytesVersion` オプション（`"auto"` | `"v1"` | `"v2"`）を受け取ります。`"auto"` は
ネットワークに問い合わせるため、`qorechain-vladi` / `qorechain-diana` では
REST エンドポイント（`rest`）が必要です。推測せずに例外を投げます。
[どの sign-bytes 形式か?](/sdk/concepts/accounts-pqc#sign-bytes-versions)を参照してください。
チェーン v3.2.3 でも v3.2.4（v3.2.4 はテストネットでは 2026年10月19日から、メインネットでは 2026年10月23日から稼働）でも形式は変わっていません。`"auto"` は
どちらのネットワークでも v2 に解決されます。
:::

## 0.9.0 の新機能 {#whats-new-090}

SDK 0.9.0 は、チェーン **v3.2.2** および **v3.2.3** に対応するクライアントリリースです（メインネットは
それぞれ高さ 3,556,788 と 3,662,051 で適用済み。現在は両ネットワークとも v3.2.4 を実行しており、テストネットは 2026年10月19日から、メインネットは 2026年10月23日に高さ 3,742,566 で適用）。
署名形式、アドレス、小数桁数、メモ、手数料は変わっていないため、
0.8.1 以降が署名する v2 ハイブリッド sign-bytes 形式が引き続き正しいものです。
新しい点は次のとおりです。

| 領域 | 0.9.0 での内容 |
| --- | --- |
| ハイブリッド `TxClient`（TypeScript） | アカウントの鍵ペアを渡します: `client.connectTx(signer, { pqcKeypair })` または `TxClient.connect({ …, pqcKeypair, rest })`。すると、すべてのトランザクションがハイブリッドで署名され、`fee: "auto"` はハイブリッドトランザクションそのものをシミュレートします。単独の鍵登録は古典署名のままです（チェーンのブートストラップ経路）。`bankSend` と、SDK のロールアップ、マルチレイヤー、クロス VM の各クライアントがこれを使用します。鍵ペアを渡さない場合は何も変わりません |
| 復元可能な PQC 鍵 | `derivePqcCanonical(address, mnemonic)` と、各言語でのその相当機能（[量子安全](/sdk/guides/quantum-safe#canonical-derivation)を参照） |
| `ensurePqcRegistered` | まず REST（`rest`）で鍵の状態を読み取り、判断できない場合は登録を拒否し、アカウントがすでに別の鍵を保持している場合は `PqcKeyMismatchError` を投げ、チェーンの「すでに登録済み」という拒否を成功として扱います。チェーン v3.2.3 以降は、**所有証明**に自分で署名して添付します。v3.2.3 より前はフィールドを付けません |
| スコープ付き EVM ウィンドウ | `openEvmWindowMsg` は `nativeOnly` と `allowedTargets`（最大 16 件、重複不可）を受け取り、`fetchEvmWindow` は両方を読み戻します（[EVM ガイド](/sdk/guides/evm#evm-window)を参照） |
| EIP-7702 の同意 | `authorizeEvmDelegationMsg`、`clearEvmDelegationMsg`、`fetchEvmDelegationConsent`、`evmDelegationTupleNonce`、`classifyEvmDelegationRejection` |
| 鍵の完全性 | 登録ビルダーは、`classical_only`、空の鍵、縮退した ML-DSA-87 鍵を拒否します。これらは v3.2.3 以降チェーンも拒否します。`signProofOfPossession` / `verifyProofOfPossession` がエクスポートされ、`migratePqcKeyHybrid` は、v3.2.3 以降に鍵を持つアカウントが必要とするハイブリッド署名付きの `MsgMigratePQCKey` を送信します |
| アブストラクトアカウントのダイジェスト v2 | `evmAuthSignBytesV2`（呼び出しのガスリミットを束縛）と `resolveEvmAuthDigestVersion`。`abstractaccount` モジュールは両ネットワークで無効化されているため、これは参照用です |
| アップグレードの検出 | `isUpgradeApplied`、`requireUpgradeApplied`: 新しい任意フィールドは、`applied_plan` がそのリリースを報告した後にのみ設定されます。リリースを適用していないノードは、そのリリースの新しいフィールドが設定されたトランザクション全体を拒否するためです |
| エラーのデコード | ブロック内での失敗はそのコードスペースを保持します（たとえば `sdk_231` ではなく `pqc` 231）。`rate_limited` と委任コードがデコードされ、`decodeTxError` は投げられたエラーのログまたはメッセージを読み取ります |
| 支出ルール | `validateSpendingRules` が `MsgUpdateSpendingRules` ビルダー内で実行され、何も制限しないルールを拒否します |
| 修正 | PQC アカウントのルートは、すべての SDK で単数形の `/qorechain/pqc/v1/account/{address}` です（合成クライアントを渡した場合の `client.rest.getPqcAccount`、`isPqcRegistered`、`getPqcStatus` も同様）。エクスポートされる `VERSION` がパッケージと一致します。SDK が作成する Go と Rust のクライアントは、ハングせずにタイムアウトします。`create-qorechain-dapp` のテンプレートは、同梱されているリリースに依存します |

新しい鍵に対するレガシーな PQC 導出（`derivePqcLegacy`、`"bridge"`）は
非推奨です。アカウントに束縛されていないため、1 つのニーモニックがすべての
アカウントに同じ 1 つの鍵を与えてしまいます。ローテーションヘルパーは、これを**新しい**鍵として使うことを拒否します。既存のレガシー鍵の復元や、
そこからのローテーションは引き続き可能です。

## 0.9.0 より前のバージョン {#before-090}

0.8.x を使用している場合でも、両ネットワークが検証する形式で署名し、
メインネットとテストネット（どちらも v3.2.4）で動作します。以下は 0.9.0 で解消される制限で、
知らないと手数料がかかるものもあります。

| 0.9.0 より前のリリース | 回避策 |
| --- | --- |
| 所有証明、スコープ付きウィンドウ、EIP-7702 同意のビルダーがない | `qorechaind tx pqc register-key-v2 … --pqc-key <name>`、`open-evm-window --native-only` / `--allowed-targets`、`authorize-evm-delegation` / `clear-evm-delegation` を使用します（[EVM 認可ウィンドウ](/getting-started/first-transaction#evm-window)、[EIP-7702 委任](/architecture/post-quantum-security#eip-7702)を参照） |
| `status` なしの `ensurePqcRegistered` は、確認せずに登録をブロードキャストし、別の鍵が登録されていても成功と報告していた | すでに鍵を持つアカウントへの 2 回目の登録は、**手数料が徴収された後に**拒否されます。まず `GET /qorechain/pqc/v1/account/{address}` を読み取り、`status: { registered: found }` を渡してください |
| `client.rest.getPqcAccount`、`isPqcRegistered`、`getPqcStatus` | 複数形の `/accounts/` パスまたは `qor_` 名前空間を呼び出していましたが、公開エンドポイントはこれらを提供していません（HTTP 501、`-32601`）。上記の単数形の REST ルートを読み取ってください |
| `TxClient` / `bankSend` と、ロールアップ、マルチレイヤー、クロス VM の各クライアントは、古典署名のみで署名していた | ネットワークは、鍵を持つアカウントに対してこれを拒否します。`signAndBroadcastHybrid` を通じて送信してください |
| ブロック内で失敗したトランザクションがコードスペースを失っていた | `GET /cosmos/tx/v1beta1/txs/{hash}` からトランザクションを読み取ってください |
| 0.8.3 のエクスポートされた `VERSION` 定数が `0.8.0` を報告していた | インストール済みのバージョンは `package.json` から読み取ってください |
| `create-qorechain-dapp` 0.8.0 は `@qorechain/sdk` / `@qorechain/evm` を `^0.3.0` に固定していた（0.x バージョンに対するキャレットは 0.3 の範囲内にとどまります） | スキャフォールド後に `npm i @qorechain/sdk@latest` を実行してください |
| `@qorechain/react` 0.8.x は、公開エンドポイントで登録済み鍵の状態を読み取れないままだった | `@qorechain/react` 0.9.0 を使用してください |

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

npm には `0.9.0` で公開されており、`@qorechain/sdk` `^0.9.0` に依存します。[React キットガイド](/sdk/guides/react)を参照してください。

### スキャフォルダー

`create-qorechain-dapp`（npm、`0.9.0`）はすぐに実行できる dApp を生成します:

```bash
npm create qorechain-dapp@latest my-dapp
```

生成される `package.json` ファイルは、スキャフォルダーが同梱している SDK リリースに依存します
（`@qorechain/sdk` `^0.9.0`。EVM テンプレートは `@qorechain/evm` `^0.8.0` を使用します）。
スキャフォルダーのバージョン 0.8.0 は `^0.3.0` の範囲を書き込んでいましたが、0.x バージョンではこれは
0.3 の範囲内にとどまり、稼働中のネットワーク向けに署名できません。0.8.0 でスキャフォールドした場合は、
`npm i @qorechain/sdk@latest` を実行してください。[CLI リファレンス](/sdk/reference/cli)を参照してください。

## Python

```bash
pip install qorechain-sdk
```

Python 3.10+ が必要です。パッケージには型ヒントと `py.typed` マーカーが含まれています。

> ディストリビューションは `qorechain-sdk` としてインストールされます（PyPI に `0.9.0` で公開）
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

自己完結型の Go モジュールとして公開されています（タグ `packages/go/v0.9.0`）。バージョンを
明示的に固定してください: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.9.0`。

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

> crates.io には `qorechain-sdk`（0.9.0）として公開されています。`cargo add qorechain-sdk` は
> 最新リリースをインストールします。

## Java

Maven（`pom.xml`）:

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.9.1</version>
</dependency>
```

または Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.9.1'
```

> Maven Central に `io.github.qorechain:qorechain-sdk` として公開されています
> （0.9.0 と 0.9.1 の両方が提供されており、0.9.1 が最新かつリリースバージョンです。2026年10月21日に確認）。
> 0.9.1 は Java 専用のリリースで、リリースノートによれば Bouncy Castle を 1.80 から 1.85 に更新したものです。
> API の変更はありません。Central には 0.8.0 および 0.8.1 のビルドがないため、
> 稼働中のネットワークでは 0.9.x（または 0.8.2 以降）を使用してください。

## 関連パッケージ {#related-packages}

| パッケージ | 用途 | バージョン |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | ウォレット側のヘルパー: ウォレット生成（`generateQoreWallet`）、`eth_secp256k1` ハイブリッド署名（`signHybridEth`、`QoreChainSigner`）、MetaMask へのネットワーク登録（`addQoreEvmToWallet`）、authenticator および EVM ウィンドウのメッセージビルダー（その `openEvmWindowMsg` が構築するのはスコープなしの形式のみ）、v2 のアブストラクトアカウントダイジェスト。所有証明は添付しません。ピア依存: `@cosmjs/proto-signing` と `@cosmjs/stargate` `^0.32`（SDK は cosmjs 0.39 を使用するため、同じプロジェクトに両方をインストールすると npm がピアの競合 `ERESOLVE` を報告します。別々のプロジェクトに分けるか、`--legacy-peer-deps` を渡してください） | 0.4.0 |
| `@qorechain/chain-bridge` | バックエンド向けのサーバー側ワーカー: PQC 鍵を導出し、ハイブリッド署名してブロードキャストします（`sendTokens`、`registerPqc` など）。`cosmosRest` を渡してください。渡すと、ネットワークが v3.2.3 を適用した後は登録に所有証明が付き、PQC に見える拒否は再登録の前にチェーンと照合されます（異なる鍵が登録済みの場合は、2 回目の登録に手数料を払う代わりに `pqc_key_mismatch` が発生します） | 0.2.3 |
| `@qorechain/pqc` | 標準のみに準拠した ML-DSA / ML-KEM / SHAKE-256 プリミティブと `hybridSignBytes`（[ポスト量子署名](/developer-guide/post-quantum-signing)を参照）。PyPI、crates.io、Maven Central、Go プロキシ（Go は `v0.2.3`）にも同じバージョンで公開されています | 0.2.3 |
| `@qorechain/handles` | 初回使用時ピンニング付きの検証済み `@handle` 解決（`HandleClient`） | 0.1.0 |
| `@qorechain/connect` | EVM、Cosmos、SVM のウォレットに対応する単一のコネクター。ウォレットアダプター上に構築されています（そのピア範囲は `@qorechain/wallet-adapter` `^0.2.1` で、0.4.0 は含まれません）。[EVM 認可ウィンドウ](/sdk/guides/evm#evm-window)は開かないため、アカウントが登録済みの鍵と開いているウィンドウを持つまで、これを通じた EVM 送信は拒否されます | 0.2.1 |
| `@qorechain/rdk` | Rollup Development Kit クライアント（[ロールアップ](/rollups/why)を参照）。`@qorechain/sdk` `^0.9.0` と `@qorechain/evm` `^0.8.0` に依存するため、SDK 0.9.0 を使うアプリは SDK のコピーをこれと 1 つ共有します（0.5.0 は SDK 0.8.3 をネストしたコピーとして取り込んでいました）。`pqcKeypair` を渡した場合にのみハイブリッド署名を行い、読み取りはそれなしでも動作します。PyPI、crates.io、Maven Central では `qorechain-rdk` として、また Go モジュールとしても公開されています（`@v0.6.0` を固定してください）。それら 4 つのクライアントは古典署名のみで署名します。[RDK 0.6.0：変更点と制限](/rollups/deploying-a-rollup#rdk-050-limits)を参照 | 0.6.0 |
| `@qorechain/rdk-cli` | RDK 用の `qorollup` オペレーター CLI。そのトランザクションコマンド（`create`、`pause`、`resume`、`stop`、`withdraw`）は古典署名のみで署名するため、ネットワークに拒否されます | 0.6.0 |
| `create-qorechain-rollup` | ロールアップのスターター・スキャフォルダー。そのテンプレートは `@qorechain/rdk` `^0.6.0` に依存し、`QORE_MNEMONIC` または `QORE_PQC_SEED_HEX` からポスト量子鍵を解決できる場合はハイブリッド署名を行います | 0.6.0 |

## 次のステップ

[クイックスタート](/sdk/quickstart)に進んで、接続とオンチェーン状態の読み取りを行いましょう。
