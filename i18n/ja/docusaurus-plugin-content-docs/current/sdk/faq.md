---
slug: /sdk/faq
title: FAQ とトラブルシューティング
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ とトラブルシューティング

## メインネットは稼働していますか？

はい。メインネットは**稼働中**です（チェーン ID `qorechain-vladi`）。テストネットのプリセット
（`qorechain-diana`）も引き続き利用可能です。どちらのプリセットも localhost のエンドポイントの
デフォルト値を備えています。`createClient({ network: "mainnet" })` でネットワークを選択し、
`endpoints` をあなたのノード URL で上書きしてください。
[ネットワークとエンドポイント](/sdk/reference/network) を参照してください。

## なぜ呼び出しが localhost に向かうのですか？

`createClient()` はデフォルトで **localhost** エンドポイントを使用します。実際のノードと通信するには、
`endpoints` オブジェクトを渡してください。

```ts
const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",
    rpc: "https://rpc.testnet.example",
    evmRpc: "https://evm.testnet.example",
  },
});
```

署名のパス（`connectTx`）にはコンセンサスの **`rpc`** エンドポイントが必要です。CosmWasm の
読み取りもこれを使用します。REST の読み取りは `rest` を使用し、EVM と `qor_` の呼び出しは
`evmRpc` を使用します。

## "Cannot find module 'viem'" / "'@solana/web3.js'"

これらはそれぞれ `@qorechain/evm` と `@qorechain/svm` の**ピア依存関係**です。あなたの
プロジェクトにインストールしてください。

```bash
npm i @qorechain/evm viem
npm i @qorechain/svm @solana/web3.js
```

## プリコンパイル呼び出しが "feature not present" をスローします

EVM プリコンパイルは、QoreChain EVM Engine を実行しているノード上にのみ存在します。
通常の EVM ノードでは、これらの呼び出しは失敗します。異種混在のノードを対象とする場合は、
各プリコンパイル呼び出しをラップし、呼び出しごとにエラーを処理してください。

## 金額が 100 万倍ずれています

QOR は **10^6** のベース `uqor` 単位を持ちます。`toBase` / `fromBase` を使用し、すべての計算を
ベース単位で行ってください。

```ts
toBase("1.5");       // "1500000"
fromBase("1500000"); // "1.5"
```

EVM ランタイムでは QOR を **18** 桁の小数（EVM の慣例）で表現する点に注意してください。これは
Cosmos の `uqor` ベースである 10^6 とは異なります。

## どのパッケージが、どこに公開されていますか？

すべてです。TypeScript コア（`@qorechain/sdk`）と EVM/SVM アダプター
（`@qorechain/evm`、`@qorechain/svm`）は npm に `0.3.0` で公開されています。Python クライアントは
PyPI にあります（`pip install qorechain-sdk` で `0.3.1`、インポートは `qorsdk`）。Rust
クライアントは crates.io にあります（`cargo add qorechain-sdk` で `0.3.0`）。Go クライアントは
モジュールプロキシにあります（`go get github.com/qorechain/qorechain-sdk/packages/go/...`）。
言語ごとの完全なコマンドについては [インストール](/sdk/install) を参照してください。

## ニーモニックが拒否されます

SDK は鍵を導出する前に、BIP-39 のワードリスト**と**チェックサムの両方を検証します。そのため、
タイプミスのあるフレーズは、誤ったアカウントを黙って生成するのではなくエラーを発生させます。
単語を再確認してください。フレーズをテストするには `validateMnemonic` を使用してください。

## ハイブリッド（PQC）トランザクション

ローカルでの ML-DSA-87 の署名/検証、およびハイブリッド tx 構築ヘルパーは、本日より利用可能です。
ハイブリッド tx がオンチェーンで PQC 検証される前に、署名者の PQC 公開鍵が登録されている必要があります
（`MsgRegisterPQCKey`）。あるいは、自動登録のためにそれを埋め込むには `includePqcPublicKey: true` を
設定する必要があります。完全なハイブリッド送信は、稼働中のネットワーク向けに最終調整が
進められています。[アカウントと PQC 署名](/sdk/concepts/accounts-pqc) を参照してください。
