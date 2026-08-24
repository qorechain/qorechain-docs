---
slug: /sdk/faq
title: FAQ とトラブルシューティング
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ とトラブルシューティング

## メインネットは稼働していますか？

はい。メインネットは**稼働中**です（チェーン ID `qorechain-vladi`）。テストネットのプリセット
（`qorechain-diana`）も引き続き利用できます。どちらのプリセットも既定では localhost の
エンドポイントが設定されています。`createClient({ network: "mainnet" })` でネットワークを
選択し、`endpoints` を自分のノードの URL で上書きしてください。詳細は
[ネットワークとエンドポイント](/sdk/reference/network) を参照してください。

## 呼び出しが localhost に向かってしまうのはなぜですか？

`createClient()` の既定エンドポイントは **localhost** です。実際のノードと通信するには、
`endpoints` オブジェクトを渡してください。

```ts
const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",
    rpc: "https://rpc-testnet.qore.host",
    evmRpc: "https://evm-testnet.qore.host",
  },
});
```

署名経路（`connectTx`）にはコンセンサスの **`rpc`** エンドポイントが必要で、CosmWasm の
読み取りもこれを使用します。REST の読み取りは `rest` を、EVM および `qor_` 系の呼び出しは
`evmRpc` を使用します。

## "Cannot find module 'viem'" / "'@solana/web3.js'"

これらはそれぞれ `@qorechain/evm` と `@qorechain/svm` の**ピア依存関係（peer dependencies）**です。
プロジェクトにインストールしてください。

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## プリコンパイル呼び出しが "feature not present" を投げる

EVM プリコンパイルは、QoreChain EVM Engine を実行しているノード上にのみ存在します。
素の EVM ノードではこれらの呼び出しは失敗します。異種混在のノードを対象にする場合は、
各プリコンパイル呼び出しをラップし、呼び出しごとにエラーを処理してください。

## 金額が 100 万倍ずれています

QOR の基本単位 `uqor` は **10^6** です。`toBase` / `fromBase` を使い、計算はすべて
基本単位で行ってください。

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

なお、EVM ランタイムは QOR を **18** 桁の小数（EVM の慣例）で表現します。これは Native の
`uqor` 基本単位 10^6 とは別物です。

## どのパッケージがどこで公開されていますか？

すべて公開されています。TypeScript コア（`@qorechain/sdk`）、EVM/SVM アダプタ
（`@qorechain/evm`、`@qorechain/svm`）、React キット（`@qorechain/react`）、および
`create-qorechain-dapp` スキャフォルダは npm で `0.7.0` として公開されています。Python
クライアントは PyPI にあります（`pip install qorechain-sdk`、バージョン `0.7.0`、インポート名は
`qorsdk`）。Go クライアントはモジュールプロキシにあります
（`go get github.com/qorechain/qorechain-sdk/packages/go/...`、タグ
`packages/go/v0.7.0`）。Java クライアントは Maven Central にあります
（`io.github.qorechain:qorechain-sdk:0.7.0`）。Rust クライアントは crates.io にあり
（`cargo add qorechain-sdk`）、**最新の公開クレートバージョン**が利用できますが、現時点では
0.7.0 より遅れています — crates.io からインストールするか、リポジトリからインストールしてください。
言語ごとの完全なコマンドは [インストール](/sdk/install) を参照してください。

## ニーモニックが拒否されます

SDK は鍵を導出する前に BIP-39 のワードリスト**と**チェックサムの両方を検証するため、
タイプミスのあるフレーズは、誤ったアカウントを黙って生成する代わりに例外を送出します。
単語を再確認してください。フレーズのテストには `validateMnemonic` を使用できます。

## ハイブリッド（PQC）トランザクション

ハイブリッド（古典暗号 + ML-DSA-87）での送信は、Native 経路では**稼働中かつ必須**です —
古典暗号のみの Native トランザクションはオンチェーンで拒否されます（チェーン
v3.1.92）。ハイブリッド tx が PQC 検証を通過するには、署名者の PQC 公開鍵が事前に
登録されている必要があります（`MsgRegisterPQCKeyV2`）。あるいは
`includePqcPublicKey: true` を設定すると、初回利用時の自動登録のために公開鍵が埋め込まれます。
チェーンが受け入れるのは**決定的（deterministic）** ML-DSA-87 署名のみです（SDK は 0.5.1 以降、
既定で決定的に署名します）。hedged 署名は `pqc` コード 21（`hybrid_verify_failed`）で
失敗します。詳細は
[アカウントと PQC 署名](/sdk/concepts/accounts-pqc) を参照してください。

## ハイブリッドトランザクションが CheckTx で tx parse エラーになります

SDK をアップグレードしてください。**0.6.0 以前**のバージョンは
`/qorechain.pqc.v1.PQCHybridSignature` tx-body 拡張を JSON でシリアライズしており、
チェーンの tx デコーダは CheckTx でこれを拒否します。**0.6.1** 以降は、5 言語すべてで
この拡張が protobuf エンコードされます（値は `0x08` で始まります）— 古いバージョンで
構築されたハイブリッドトランザクションは、すべてのレーン（eth-native を含む）で
オンチェーンで拒否されます。

## authenticator による支出が `authenticator_replay` で拒否されます

nonce が誤っています。`MsgExecuteEVM.nonce` はアカウントの**現在の** EVM nonce で
なければなりません（リレイヤーは別のアカウントなので、1 を**加算しない**でください）。
`MsgExecuteCosmos.nonce` は `(account, pubkey)` ごとの **per-authenticator シーケンス**で、
独立したストアカウンターです。値を再取得して署名し直してください。
その他の authenticator 失敗は `decodeTxError` でデコードできます: `abstractaccount`
コード 5（`spending_limit_exceeded`）、6（`session_key_expired`）、
10（`permission_denied`）。詳細は
[Authenticator と委任支出](/sdk/guides/authenticators) を参照してください。
