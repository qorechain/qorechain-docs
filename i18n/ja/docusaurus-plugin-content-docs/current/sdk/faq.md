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
読み取りもこれを使用します。REST の読み取りは `rest` を、EVM の呼び出しは
`evmRpc` を使用します（`qor_` 系の呼び出しも、その名前空間を提供するノードでは同様です）。
メインネットの URL は
[ネットワークリファレンス](/sdk/reference/network#public-endpoints) にあります。

## "Cannot find module 'viem'" / "'@solana/web3.js'"

これらはそれぞれ `@qorechain/evm` と `@qorechain/svm` の**ピア依存関係（peer dependencies）**です。
プロジェクトにインストールしてください。

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## プリコンパイル呼び出しが "returned no data" / "feature not present" を投げる

QoreChain の EVM プリコンパイルはノードにコンパイルされていますが、メインネットでもテストネットでも
**まだ有効化されていません**。EVM モジュールの `active_static_precompiles` パラメータに
アドレスが列挙されている場合にのみ応答しますが、そのリストは両ネットワークで空です。現状では
呼び出しは空のデータを返すため、viem は `returned no data ("0x")` を報告し、ヘルパーは
公開ネットワークでも例外を投げます（
[EVM プリコンパイル: ネットワークの状況](/developer-guide/evm-precompiles#network-status)
を参照）。素の EVM ノードでも、呼び出しは同じように失敗します。
`GET /cosmos/evm/vm/v1/params` を確認し、各プリコンパイル呼び出しをラップして、
呼び出しごとにエラーを処理してください。

## `client.qor` の呼び出しが -32601 で失敗します

`client.qor` は `qor_` JSON-RPC 名前空間を呼び出しますが、リリース済みのどのノードビルドも
これを提供していません。公開 EVM エンドポイントの `rpc_modules` には `eth`、`net`、`rpc`、
`txpool`、`web3` のみが列挙されます。代わりに REST ルートを使用してください。例えば
`GET /qorechain/pqc/v1/account/{address}`（PQC 鍵のステータス）や
`GET /qorechain/burn/v1/stats` を、`client.rest.get(...)` 経由で呼び出します。詳細は
[`qor_` 名前空間](/api-reference/json-rpc-qor_-namespace) を参照してください。

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

すべて公開されています。TypeScript コア（`@qorechain/sdk`、0.8.3）、EVM/SVM アダプタ
（`@qorechain/evm`、`@qorechain/svm`、0.8.0）、React キット（`@qorechain/react`、
0.8.3）、および `create-qorechain-dapp` スキャフォルダ（0.8.0）は npm で公開されています。Python
クライアントは PyPI にあります（`pip install qorechain-sdk`、バージョン 0.8.3、インポート名は
`qorsdk`）。Go クライアントはモジュールプロキシにあります
（`go get github.com/qorechain/qorechain-sdk/packages/go/...`、タグ
`packages/go/v0.8.4`）。Rust クライアントは crates.io にあります
（`cargo add qorechain-sdk`、0.8.3）。Java クライアントは Maven Central にあります
（`io.github.qorechain:qorechain-sdk:0.8.3`）。
言語ごとの完全なコマンドは [インストール](/sdk/install) を参照してください。

## ニーモニックが拒否されます

SDK は鍵を導出する前に BIP-39 のワードリスト**と**チェックサムの両方を検証するため、
タイプミスのあるフレーズは、誤ったアカウントを黙って生成する代わりに例外を送出します。
単語を再確認してください。フレーズのテストには `validateMnemonic` を使用できます。

## ハイブリッド（PQC）トランザクション

ハイブリッド（古典暗号 + ML-DSA-87）での送信は、Native 経路では**稼働中かつ必須**です —
古典暗号のみの Native トランザクションはオンチェーンで拒否されます（チェーン
v3.2.0）。
ハイブリッド tx が PQC 検証を通過するには、署名者の PQC 公開鍵が事前に
`MsgRegisterPQCKeyV2`（古典署名で行う、ハイブリッド署名が免除されたトランザクション）で
**明示的に登録**されている必要があります。公開鍵を拡張に埋め込んでも
（`includePqcPublicKey: true`）登録**されません**。チェーンは初回利用時に鍵を登録することはありません。
チェーンは hedged か決定的かにかかわらず、有効な FIPS-204 ML-DSA-87 署名をすべて受け入れます。
SDK は（0.5.1 以降）既定で決定的に署名するため、トランザクションの署名と tx ハッシュは常に同じになります。
ハイブリッド tx が `pqc` コード 21（`hybrid_verify_failed`）で失敗する原因は、sign-bytes のバージョン、
チェーン ID、古い PQC ライブラリ、または未登録の鍵であり、hedged 署名が原因になることはありません。
両ネットワークとも v2 形式の sign-bytes を検証するため、SDK **0.8.1 以降**を使用し、
`rest`（または `signBytesVersion`）を渡してください。どちらも指定しない場合、ビルダーは
`qorechain-vladi` / `qorechain-diana` で例外を送出します。詳細は
[コード 21 のトラブルシューティング](/developer-guide/post-quantum-signing#code-21) と
[アカウントと PQC 署名](/sdk/concepts/accounts-pqc) を参照してください。

## EVM トランザクションが "no open EVM authorisation window" で拒否されます

チェーン v3.2.0 以降、EVM レーンは、登録済みの PQC 鍵と開いている認可ウィンドウを持つ
アカウントからのトランザクションのみを受け付けます。鍵を登録し、ウィンドウを開いてから
送信してください。詳細は [EVM 認可ウィンドウ](/sdk/guides/evm#evm-window) を参照してください。
SDK では、`classifyEvmWindowRejection(err)` が `"no-pqc-key"`、`"no-window"`、
`"exhausted"`、`"invalid"` のいずれかを返します。

## ハイブリッドトランザクションが CheckTx で tx parse エラーになります

SDK をアップグレードしてください。**0.6.0 以前**のバージョンは
`/qorechain.pqc.v1.PQCHybridSignature` tx-body 拡張を JSON でシリアライズしており、
チェーンの tx デコーダは CheckTx でこれを拒否します。**0.6.1** 以降は、5 言語すべてで
この拡張が protobuf エンコードされます（値は `0x08` で始まります）— 古いバージョンで
構築されたハイブリッドトランザクションは、すべてのレーン（eth-native を含む）で
オンチェーンで拒否されます。

## authenticator による支出が `authenticator_replay` で拒否されます

（`abstractaccount` モジュールは現在、両ネットワークで無効化されています。支出は、
nonce が確認される前に `abstract account module is disabled` で拒否されます。
[Authenticator と委任支出](/sdk/guides/authenticators) を参照してください。
以下の説明は、モジュールが有効化された後に適用されます。）

nonce が誤っています。`MsgExecuteEVM.nonce` はアカウントの**現在の** EVM nonce で
なければなりません（リレイヤーは別のアカウントなので、1 を**加算しない**でください）。
`MsgExecuteCosmos.nonce` は `(account, pubkey)` ごとの **per-authenticator シーケンス**で、
独立したストアカウンターです。値を再取得して署名し直してください。
その他の authenticator 失敗は `decodeTxError` でデコードできます: `abstractaccount`
コード 5（`spending_limit_exceeded`）、6（`session_key_expired`）、
10（`permission_denied`）。詳細は
[Authenticator と委任支出](/sdk/guides/authenticators) を参照してください。
