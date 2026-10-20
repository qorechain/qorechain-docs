---
slug: /sdk/faq
title: FAQ とトラブルシューティング
sidebar_label: FAQ
sidebar_position: 8
---

# FAQ とトラブルシューティング

## メインネットは稼働していますか？

はい。メインネットは**稼働中**です（チェーン ID `qorechain-vladi`、2026年6月7日から稼働）。
チェーンバージョンは、高さ 3,742,566 までは v3.2.3、そのブロックからは v3.2.4 です（ガバナンス提案 13）。テストネットは 2026 年 10 月 19 日から v3.2.4 を実行しています。テストネットのプリセット
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

署名経路（`connectTx`）にはコンセンサスの **`rpc`** エンドポイントが必要で、QoreChain Native の
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

すべて公開されています（2026年10月21日確認）。TypeScript コア（`@qorechain/sdk`、0.9.0）、
React キット（`@qorechain/react`、0.9.0）、`create-qorechain-dapp` スキャフォルダ
（0.9.0）、および EVM/SVM アダプタ（`@qorechain/evm`、`@qorechain/svm`、0.8.0）は
npm で公開されています。Python クライアントは PyPI にあります（`pip install qorechain-sdk`、
バージョン 0.9.0、インポート名は `qorsdk`）。Go クライアントはモジュールプロキシにあります
（`go get github.com/qorechain/qorechain-sdk/packages/go@v0.9.0`）。Rust クライアントは
crates.io にあります（`cargo add qorechain-sdk`、0.9.0）。Java クライアントは Maven
Central にあります（`io.github.qorechain:qorechain-sdk:0.9.1`。他の言語は 0.9.0 です）。
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
TypeScript では、クライアントに鍵ペアを渡すと
（`client.connectTx(signer, { pqcKeypair })`、SDK 0.9.0）、そのクライアントが送信する
すべてのトランザクションがハイブリッドで署名されます。
チェーンは hedged か決定的かにかかわらず、有効な FIPS-204 ML-DSA-87 署名をすべて受け入れます。
SDK は（0.5.1 以降）既定で決定的に署名するため、トランザクションの署名と tx ハッシュは常に同じになります。
ハイブリッド tx が `pqc` コード 21（`hybrid_verify_failed`）で失敗する原因は、sign-bytes のバージョン、
チェーン ID、古い PQC ライブラリ、または未登録もしくは別の鍵であり、hedged 署名が原因になることはありません。
両ネットワークとも v2 形式の sign-bytes を検証するため、SDK **0.8.1 以降**（現行は 0.9.0）を使用し、
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

## SDK はどのチェーンバージョンで動作しますか？

SDK **0.9.0** は、チェーン v3.2.2 と v3.2.3 向けのクライアントリリースです。メインネット
**v3.2.3**（および高さ 3,742,566 以降は **v3.2.4**）とテストネット **v3.2.4** でトランザクションを送信でき、登録時の任意の所有証明
（ネットワークが v3.2.3 を適用すると `ensurePqcRegistered` が自動的に付加します）、
スコープ付き EVM ウィンドウ、EIP-7702 同意メッセージ向けのビルダーを備えています。
SDK **0.8.1 以降**も両ネットワークでトランザクションを送信できます（v2 ハイブリッド sign-bytes
形式、登録、ハイブリッド送信、EVM ウィンドウは変更なしで動作します）が、それらのビルダーは
ありません。それらには CLI を使用してください（
[0.9.0 より前のバージョン](/sdk/install#before-090) を参照）。v3.2.4 はテストネットで 2026 年 10 月 19 日から
稼働しており、メインネットではブロック高 3,742,566 から稼働します（ガバナンス提案 13）。SDK は v3.2.4 のフィールドを設定しないため、その高さの前後どちらでもトランザクションは有効なままです。

## PQC 鍵の登録が拒否されたのに手数料が引かれました

すでに鍵を保持しているアカウントの登録は、手数料が差し引かれた後にチェーンによって拒否されます。
0.9.0 の `ensurePqcRegistered` は、まず
`GET /qorechain/pqc/v1/account/{address}` を読み取り（`rest` を渡してください）、この鍵ペアの鍵が
登録済みであれば登録をスキップし、別の鍵が登録されている場合は `PqcKeyMismatchError` を投げます。
以前のリリースでは、自分で `status: { registered: found }`（`found` はそのルートから得た値）を
渡さない限り、最初に確認することはありませんでした。v3.2.3 以降、チェーンは弱い鍵、縮退した鍵、
再利用された鍵も拒否します。`derivePqcCanonical` または `tx pqc gen-key` で作成した鍵は問題ありません。

## `create-qorechain-dapp` が署名できない SDK をインストールします

スキャフォルダのバージョン 0.8.0 だけがそうでした。`@qorechain/sdk` と `@qorechain/evm` に
`^0.3.0` の範囲を書き込み、0.x バージョンに対するキャレット範囲は 0.3 の内側にとどまります。
バージョン 0.9.0 は現行の SDK でスキャフォールドします。0.8.0 を使った場合は、スキャフォールド後に
`npm i @qorechain/sdk@latest`（および `@qorechain/evm@latest`）を実行してください。

## `VERSION` が 0.8.0 と表示されますが、0.8.3 をインストールしました

0.8.3 のエクスポートされた `VERSION` 定数は更新されておらず、`0.8.0` と報告します。0.9.0 以降は
パッケージと一致します。それ以前のリリースでは、インストール済みのバージョンを `package.json` から
読み取ってください。

## authenticator による支出が `authenticator_replay` で拒否されます

（`abstractaccount` モジュールは現在、両ネットワークで無効化されています。支出は、
nonce が確認される前に `abstract account module is disabled` で拒否されます。
[Authenticator と委任支出](/sdk/guides/authenticators) を参照してください。
以下の説明は、モジュールが有効化された後に適用されます。）

nonce が誤っています。`MsgExecuteEVM.nonce` と `MsgExecuteCosmos.nonce` はどちらも、
`(account, pubkey)` に対するリンク済みキーの **authenticator シーケンス**です。これはチェーンが
リンク済みキーごとに保持するカウンターで、0 から始まり、実行が成功するたびに加算されます。
これはアカウントの EVM nonce では**ありません**。また、これを取得するクエリはまだないため、
リンク済みキーごとに自分で追跡してください。v3.2.3 以降、EVM レーンは
`evmAuthSignBytesV2` にも署名します。これは呼び出しのガスリミットを束縛します
（`resolveEvmAuthDigestVersion` が形式を選びます）。そのキーについて追跡しているカウンターを使って、
署名し直してください。

その他の authenticator 失敗は `decodeTxError` でデコードできます: `abstractaccount`
コード 5（`spending_limit_exceeded`）、6（`session_key_expired`）、
10（`permission_denied`）。詳細は
[Authenticator と委任支出](/sdk/guides/authenticators) を参照してください。
