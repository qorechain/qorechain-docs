---
slug: /qoresign/overview
title: QoreSign の概要
sidebar_label: 概要
sidebar_position: 1
---

# QoreSign

QoreSign は、QoreChain 上のウォレット、取引所、カストディアン、バックエンド向けの、secp256k1 + ML-DSA-87（FIPS 204）ハイブリッド署名に対応したオープンソースライブラリです。

QoreSign を使うと、QoreChain 独自のウォレット以外のウォレットでも、アカウントの ML-DSA-87 鍵を導出し、両方の鍵でネイティブレーンのトランザクションに署名し、ハイブリッド署名をローカルで検証し、任意のメッセージに署名し、署名前にトランザクションをシミュレートし、コミット済みトランザクションがどのように保護されていたかを読み戻し、Sign In With QoreChain を実装できます。これは [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) バインディングの上に載る薄いレイヤーであり、独自の暗号プリミティブは一切追加しません。Apache-2.0 ライセンスのもと、QoreChain Association が保守しています。

現在のリリースは **0.1.1**（2026年10月27日）です。TypeScript、Rust、Go、Kotlin（JVM と Android）、Swift、そして 0.1.1 で新たに Python で公開されています。ソース、サンプル、テストベクターは [qorechain/qoresign](https://github.com/qorechain/qoresign) リポジトリにあります。メインネット（`qorechain-vladi`）とテストネット（`qorechain-diana`）で動作します。

## 各レーンで QoreSign が行うこと {#lanes}

| レーン | 現時点で QoreSign が行うこと |
|---|---|
| **Native**（Cosmos SDK） | ハイブリッド署名と検証。ネットワークはデフォルトで ML-DSA-87 署名を必須とします。 |
| **EVM** | 認可ウィンドウのみ: アカウントは ML-DSA-87 鍵を登録し、ネイティブレーンから期限付きの認可ウィンドウを開きます。Ethereum トランザクション自体には ML-DSA-87 署名は含まれません。 |
| **SVM** | ネットワークではまだ利用できません（`LANE_NOT_AVAILABLE`）。 |

EVM でのハイブリッド署名には、まずネットワーク側でレーンごとの PQC サポートが必要です。詳しくは [EVM ウォレット: 認可ウィンドウ](/qoresign/guides/evm-quantum-ready)を参照してください。

## できること {#what-it-does}

どの言語でも同じ、オフラインのコア機能:

- `m/44'/118'/0'/0/0` の従来型の鍵（`deriveClassicalKey`）と、QoreChain ウォレットがアカウントに登録する正規の ML-DSA-87 鍵（`deriveCanonicalPqKey`。ニーモニックとアドレスに紐づきます）を導出します。ハードンド HD 導出はドラフトとして用意されています（`deriveHdPqKey`）。`pqKeyFromSeed` は 32 バイトのシードから鍵ペアを再構築します。
- `secp256k1` および `eth_secp256k1` アカウント用の `qor1` アドレスを生成・解析します。
- ネイティブレーンのトランザクションに両方の鍵で署名します（`signHybrid`）。または、dApp が構築したボディに ML-DSA-87 レイヤーだけを追加します（`signPqLayer`）。ML-DSA-87 署名はデフォルトで決定的です。ヘッジ署名はオプションで、ネットワークはどちらも受け付けます。secp256k1 は RFC 6979 と low-S を使用します。
- ハイブリッド sign-bytes v1 と v2 を計算し（`hybridSignBytes`）、完全なハイブリッドトランザクション（`verifyHybridTx`）または ML-DSA-87 レイヤー単体（`verifyPqLayer`）を検証します。
- 所有証明付きの `MsgRegisterPQCKeyV2` を構築し（`buildRegisterPqKeyMessage`、`signProofOfPossession`）、縮退した公開鍵を拒否します。
- 任意のメッセージの署名と検証（`signMessage`、`verifyMessage`）を行い、Sign In With QoreChain v1（`createSiwqMessage`、`signSiwq`、`verifySiwq`）を実装します。
- レーンのルールをコードで適用します（`decideLane`、`assertHybridLane`、`evaluateLayerState`）。エラーはすべての言語で共通の安定したコードを持ちます（`QoreSignError`。例: `INVALID_MNEMONIC`、`LANE_NOT_AVAILABLE`、`KEY_NOT_REGISTERED`）。

ネットワークヘルパー（TypeScript は `@qorechain/qoresign/network`。Go の `github.com/qorechain/qoresign/go/network` には、新しい 2 つを除くすべてがあります）:

- `fetchPqKeyStatus`: アドレスに ML-DSA-87 鍵が登録されているか、どの鍵かを調べます。
- `resolveSignBytesVersion`: ネットワークがどの sign-bytes 形式を検証するかを調べます。
- `simulateTx`（使用ガス、推奨ガス上限、アドレスごとの残高変動）、`suggestGasLimit`、`broadcastTx`、`submitWithSignBytesFallback`（最初の形式をネットワークが拒否した場合に、もう一方の sign-bytes 形式で 1 回だけ再試行します）。
- `assertPqLayerMatchesRegisteredKey`: dApp が提供したレイヤーを、ウォレットが従来型署名を追加する前に、チェーン上の鍵と照合します。
- `verifySiwqWithChain` と `verifyMessageWithChain`: チェーンに登録された鍵に対する検証です。
- `fetchCommittedExtensionTypeUrls`: コミット済みトランザクションがどの拡張を持っていたかを読み戻します。
- 0.1.1 で新規、TypeScript のみ: `inspectTransaction` と `fetchEvmWindow`（以下で説明します）。

## 0.1.1 の新機能 {#new-in-0-1-1}

- **Python。** パッケージ `qorechain-qoresign`（import は `qoresign`）が PyPI にあり、macOS と Linux 用のホイールが提供されています。Rust 実装をバインドしており、同じテストベクターを再現します。Swift や Kotlin のバインディングと同様にオフライン専用で、ネットワークヘルパーはありません。
- **トランザクションインスペクター（ライブラリ）。** `inspectTransaction` はコミット済みトランザクションを読み取り、どのように保護されていたかを報告します。[トランザクションインスペクター](#inspector)を参照してください。
- **EVM ウィンドウリーダー。** `fetchEvmWindow` はアカウントの EVM 認可ウィンドウを読み取ります。
- **パッケージングの修正。** Swift のバイナリフレームワークアーカイブに、不要なリソースフォークのフォルダーが含まれなくなりました。また、Kotlin と Python パッケージ内の macOS ネイティブライブラリが、ビルドディレクトリをインストール名として記録しなくなりました。

## トランザクションインスペクター {#inspector}

`inspectTransaction({ rest, chainId, txhash, rpc? })` は `@qorechain/qoresign/network` にある読み取り専用の関数です。コミット済みトランザクションを取得し、次を返します:

- メッセージ、メモ、結果コード、高さ、手数料。
- 署名者: アドレス、鍵の種類、公開鍵、シーケンス。
- 従来型署名が検証できるかどうか。
- ML-DSA-87 レイヤーの状態: 存在するかどうか、レイヤーの数、署名者が現在登録している鍵に対してレイヤーが検証できるか、どの sign-bytes 形式を使ったか。
- セキュリティティア。公開エクスプローラーと同じ分類を使います: `pqc`（ML-DSA-87 レイヤーを持つ）、`enrollment`（ML-DSA-87 鍵の登録またはローテーション。設計上、従来型の鍵で署名されます）、`shake`（レイヤーのないネイティブレーンのトランザクション）、`classical`（EVM レーンのトランザクション）。

ネットワークが知らないハッシュに対しては `undefined` を返します。`rpc` エンドポイントを渡すと、ノードからコミットされた正確なバイト列を読み取ります。渡さない場合、この関数は REST ゲートウェイが再エンコードしたバイト列を使います。何も送信せず、アカウントも鍵も不要です。

```js
import { fetchEvmWindow, fetchPqKeyStatus, inspectTransaction } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const address = "qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08"; // public testnet faucet account

const status = await fetchPqKeyStatus({ rest, address });
console.log("ML-DSA-87 key registered:", status.registered);

const tx = await inspectTransaction({ rest, chainId: "qorechain-diana", txhash: process.argv[2] });
console.log(tx?.tier, tx?.pqLayer, tx?.messages.map((m) => m.typeUrl));

const win = await fetchEvmWindow({ rest, address });
console.log("EVM window:", win.found, win.live);
```

これを `inspect.mjs` として保存し、テストネットのトランザクションハッシュを指定して `node inspect.mjs <txhash>` を実行します。テストネットでの最近のフォーセット送金に対して実行したところ、`ML-DSA-87 key registered: true`、ティア `pqc`、`pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`、メッセージ `/cosmos.bank.v1beta1.MsgSend`、`EVM window: false false` が出力されました。

`fetchEvmWindow({ rest, address })` は、`found`、`live`、開始高さと有効期限の高さ、トランザクション数と金額の上限および使用済み量、残りのブロック数・トランザクション数・金額、`nativeOnly`、`allowedTargets` を返します。

これはライブラリ関数です。ダッシュボードの[開発者](/dashboard/developers#inspector)ページには、これを使うトランザクションインスペクターのタブがあります。トランザクションハッシュを貼り付けると、コードを書かずに結果を読み取れます。

## 用途 {#use-cases}

1. **Keplr 互換ウォレットが QoreChain のハイブリッド署名を追加する。** Leap、Cosmostation、または新しいウォレットが `signDirect` で secp256k1 署名を生成します。QoreSign を使うと、同じニーモニックからアカウントの ML-DSA-87 鍵を導出し、署名前にレイヤーを追加できます（`signPqLayer`）。[ウォレットガイド](/qoresign/guides/keplr-compatible-wallets)を参照してください。
2. **取引所やカストディアンが自社サーバーで出金に署名する。** Go または Rust のホットウォレット／ウォームウォレットサービスが `signHybrid` でネイティブレーンの送金に署名し、事前にシミュレート（`simulateTx`、Go と TypeScript）して残高変動とガスを確認したうえで、`submitWithSignBytesFallback` でブロードキャストします。[カストディキット](/developer-tools/custody-kit)はこれを土台にしています。
3. **バックエンドが Sign In With QoreChain を実装する。** サーバーが使い捨てのナンスを発行し、ウォレットがサインインメッセージに署名し、サーバーが `verifySiwqWithChain` を呼び出します。[サインインガイド](/qoresign/guides/sign-in)を参照してください。
4. **コンプライアンスやサポートのツールが、トランザクションの保護方法を確認する。** `inspectTransaction` は、コミット済みトランザクションが検証済みの ML-DSA-87 レイヤーを持っていたか、どの sign-bytes 形式を使ったか、そのティアは何かを報告します。
5. **ウォレットが EVM アカウントの認可ウィンドウを表示する。** ユーザーが EVM ウォレットから送信する前に、`fetchEvmWindow` でウィンドウが有効か、あと何件のトランザクションとどれだけの金額が残っているかを表示できます。
6. **Python のチームがレポートや承認に署名する。** `qoresign.sign_message` は任意のバイト列に対するハイブリッド署名を生成し、他の QoreSign 言語のどれでも検証できます。
7. **iOS または Android のモバイルウォレット。** Swift パッケージと Android AAR は、TypeScript パッケージとバイト単位で一致する導出、署名、サインインを提供します。
8. **監査人や統合担当者が署名をオフラインで検証する。** `verifyHybridTx`、`verifyPqLayer`、`verifyMessage` は、公開鍵さえあればネットワークなしで動作します。

## 仕組み {#how-it-works}

- **ハイブリッドトランザクション**は、同じアカウントが 2 回署名した通常の Cosmos SDK `TxRaw` です。1 つは、トランザクションボディに拡張オプション `/qorechain.pqc.v1.PQCHybridSignature`（アルゴリズム ID `1`）として含まれる ML-DSA-87 署名、もう 1 つは最終的なボディに対する secp256k1 `SIGN_MODE_DIRECT` 署名です。
- **Sign-bytes v2**（現在、両方の公開ネットワークが検証）は、`"qorechain-pqc-hybrid-v2"`、続いてチェーン ID、PQC 拡張を除いたボディ、auth info で構成され、それぞれに長さプレフィックスが付きます。そのため ML-DSA-87 署名は手数料を対象に含みます。従来型署名は、拡張を含む最終的なボディを対象とします。v1 は過去の署名を再現するために残されています。[ハイブリッドトランザクション署名 v1](/qoresign/spec/hybrid-signing-v1)を参照してください。
- **順序:** ボディと auth info をエンコードし、sign-bytes と ML-DSA-87 署名を計算し、拡張を追加し、その後 SignDoc に secp256k1 で署名してブロードキャストします。
- **登録:** `MsgRegisterPQCKeyV2` は、ML-DSA-87 公開鍵、アカウントの圧縮 secp256k1 鍵、所有証明を含みます。登録トランザクションは従来型の鍵のみで署名されます。
- **ドメイン分離:** すべての ML-DSA-87 署名は予約されたプレフィックスで始まるため、メッセージ署名やサインイン署名がトランザクション署名として再利用されることはありません。
- **チェーン上にあるもの:** 登録された ML-DSA-87 公開鍵、ハイブリッドトランザクション、EVM ウィンドウ。鍵の管理、署名、検証は、QoreSign を実行するデバイスまたはサーバー上で行われます。
- **共通のテストベクター:** ワイヤーフォーマットはパッケージとは別にバージョン管理され、すべての言語がバイト単位で再現する[テストベクター](/qoresign/vectors)で担保されています。

サイズ（FIPS 204 と[サイズガイド](/qoresign/guides/sizes-and-transport)）: ML-DSA-87 の公開鍵は 2,592 バイト、秘密鍵は 4,896 バイト、署名は 4,627 バイト、シードは 32 バイトです。ハイブリッドトランザクションは従来型より約 4.7 KB 大きくなるため、署名前にシミュレートしてください。署名や公開鍵は 1 つの静的 QR コードには収まらず、エアギャップ署名者にはマルチパート QR が必要です。永続化するのは秘密鍵ではなく 32 バイトのシードにしてください。

## パッケージ {#packages}

| 言語 | パッケージ | インストール | 最小プラットフォーム |
|---|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` | Node.js 20 以降、ブラウザー |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign)（ライブラリ名 `qoresign`） | `cargo add qorechain-qoresign` | stable Rust |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go@v0.1.1` | Go 1.25 |
| Python | [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/)（import は `qoresign`） | `pip install qorechain-qoresign` | Python 3.9 以降。macOS 11 以降（arm64、x86_64）と Linux（x86_64、aarch64）用のホイール。Windows 用ホイールはまだなく、その他のプラットフォームはソース配布物からビルドします（Rust 1.95 が必要） |
| Swift | [`github.com/qorechain/qoresign`](https://github.com/qorechain/qoresign) の `QoreSign`（GitHub リリースにバイナリフレームワーク） | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`、プロダクト `QoreSign` | iOS 16、macOS 13 |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.1")` | Java 17、Kotlin 2.3 以降。macOS（arm64、x86-64）、Linux（x86-64、arm64）、Windows（x86-64）用のネイティブライブラリ |
| Android | [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | API 24、Kotlin 2.3 以降。`arm64-v8a`、`armeabi-v7a`、`x86_64`。R8 の keep ルールを同梱 |

:::note Kotlin コンパイラのバージョン
Kotlin と Android のアーティファクトには、プロジェクトで **Kotlin 2.3 以降**のコンパイラが必要です。Kotlin 2.1 のプロジェクトでは、これらに対してコンパイルが失敗します。依存関係を追加する前に、ビルドの Kotlin バージョンを上げてください。
:::

すべての実装は、同じ[テストベクター](/qoresign/vectors)で自己検証されます。

## 例 {#example}

```ts
import {
  addressFromPublicKey,
  deriveCanonicalPqKey,
  deriveClassicalKey,
  signHybrid,
  verifyHybridTx,
} from "@qorechain/qoresign";

const classical = deriveClassicalKey({ mnemonic });                 // m/44'/118'/0'/0/0
const address = addressFromPublicKey(classical.publicKey, "secp256k1").bech32;
const pqKey = deriveCanonicalPqKey({ mnemonic, address });         // the key QoreChain wallets register

// bodyBytes / authInfoBytes / accountNumber come from the dApp's SignDoc
const signed = signHybrid({ chainId: "qorechain-vladi", accountNumber, bodyBytes, authInfoBytes, classicalKey: classical, pqKey });

verifyHybridTx({
  txBytes: signed.txBytes,
  chainId: "qorechain-vladi",
  accountNumber,
  classicalPublicKey: classical.publicKey,
  pqPublicKey: pqKey.publicKey,
}); // { valid: true, classical: true, pq: { valid: true, signBytesVersion: "v2" } }
```

[クイックスタート](/qoresign/quickstart)では、同じフローをオフラインで最初から最後まで実行します。Python と Go 向けのメッセージ署名クイックスタートもあります。

## 主な API {#main-api}

名前は TypeScript 形式で示しています。Go では同じ名前を Go の大文字小文字規則で使います（`SignHybrid`、`VerifySiwq`）。Rust と Python は snake_case（`sign_hybrid`）、Swift と Kotlin は Rust コアに対する camelCase を使います。

| 名前 | 内容 | 対象 |
|---|---|---|
| `deriveClassicalKey`, `deriveCanonicalPqKey`, `pqKeyFromSeed`, `classicalKeyFromPrivate` | ニーモニック、シード、または生のバイト列からの鍵 | すべて |
| `deriveHdPqKey` | ML-DSA-87 鍵のハードンド HD 導出（ドラフト、変更される可能性あり） | すべて |
| `addressFromPublicKey`, `addressFromBytes`, `parseAddress` | `qor1` アドレス | すべて |
| `signHybrid`, `signPqLayer`, `hybridSignBytes` | ハイブリッド署名と sign-bytes v1 または v2 | すべて |
| `verifyHybridTx`, `verifyPqLayer` | ローカル検証 | すべて |
| `buildRegisterPqKeyMessage`, `signProofOfPossession`, `verifyProofOfPossession` | 所有証明付きの鍵登録 | すべて |
| `signMessage`, `verifyMessage` | 任意メッセージの署名（ADR-36 + ML-DSA-87） | すべて |
| `createSiwqMessage`, `parseSiwqMessage`, `signSiwq`, `verifySiwq` | Sign In With QoreChain v1 | すべて |
| `decideLane`, `assertHybridLane`, `evaluateLayerState` | レーンのルール、欠落したレイヤーの検出 | すべて |
| `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx`, `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback`, `assertPqLayerMatchesRegisteredKey`, `verifySiwqWithChain`, `verifyMessageWithChain`, `fetchCommittedExtensionTypeUrls` | ネットワークヘルパー | TypeScript、Go |
| `inspectTransaction`, `fetchEvmWindow` | コミット済みトランザクションの読み取り、EVM ウィンドウの読み取り（0.1.1） | TypeScript |

Go では、ネットワークヘルパーはクライアントのメソッドです: `client := network.NewClient("https://api-testnet.qore.host")` を作成し、`client.VerifySiwqWithChain(ctx, address, qoresign.VerifySiwqOptions{...})` や `client.SimulateTx(...)` を呼び出します。Python のエラーは `code` と `detail` を持つ `QoreSignError` で、バイト列のフィールドは `bytes` です。

API リファレンス: リポジトリのクローン内で、`pnpm -C packages/ts docs`（TypeScript）、`cargo doc -p qorechain-qoresign`（Rust）、または `go doc github.com/qorechain/qoresign/go`（Go）を実行してください。Swift、Kotlin、Python のバインディングは Rust API をミラーしています。[Swift](https://github.com/qorechain/qoresign/tree/main/swift)、[Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin)、[Python](https://github.com/qorechain/qoresign/tree/main/python) の README を参照してください。

## ネットワークと要件 {#networks}

| | メインネット | テストネット |
|---|---|---|
| チェーン ID | `qorechain-vladi`（EVM チェーン ID 9801） | `qorechain-diana`（EVM チェーン ID 9800） |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| 検証される sign-bytes | v2 | v2 |

- **Native レーン:** ネットワークはデフォルトで ML-DSA-87 署名を必須とします。例外は、アカウントの ML-DSA-87 鍵の登録と、鍵を持たないアカウントによるアンジェイルです。ハイブリッドトランザクションが検証されるには、アカウントの鍵が事前に登録されている必要があります（`MsgRegisterPQCKeyV2`）。QoreChain ウォレットはアカウント作成時に登録します。
- **EVM レーン:** ML-DSA-87 鍵が登録されたアカウントは、ハイブリッド署名したネイティブレーンのトランザクションで、期限付きの認可ウィンドウ（有効期限の高さ、最大トランザクション数、最大金額、任意で許可するコントラクト）を開きます。有効なウィンドウの外では、ネットワークはそのアカウントの EVM トランザクションを拒否します。読み取りとガス見積もりにはウィンドウは不要です。
- **手数料:** デノム `uqor`（小数 6 桁）、最低ガス価格は 1 ガスあたり 0.1 uqor です。
- **Keplr 登録値:** bech32 プレフィックス `qor`、コインタイプ `118`。
- **アカウント:** オフライン関数には不要です。ネットワークヘルパーに必要なのは REST エンドポイントのみです。ブロードキャストには、ML-DSA-87 鍵が登録された、残高のあるアカウントが必要です。

## ドキュメント {#documentation}

- [クイックスタート](/qoresign/quickstart): 鍵の導出、ハイブリッドトランザクションの署名と検証を数分で行います。
- ガイド
  - [Keplr 互換ウォレットにハイブリッド署名を追加する](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: サーバー側の検証](/qoresign/guides/sign-in)
  - [EVM ウォレット: 認可ウィンドウ](/qoresign/guides/evm-quantum-ready)
  - [鍵導出: 正規鍵と HD ドラフト](/qoresign/guides/key-derivation)
  - [サイズとトランスポート](/qoresign/guides/sizes-and-transport)
- 仕様
  - [ハイブリッドトランザクション署名 v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [メッセージ署名 v1](/qoresign/spec/message-signing-v1)
  - [ML-DSA-87 鍵導出](/qoresign/spec/hd-derivation-draft)
- [テストベクター](/qoresign/vectors)
- [サンプル](https://github.com/qorechain/qoresign/tree/main/examples)

## スコープと制限 {#scope}

- QoreSign はローカルで署名します。鍵を代わりに保管することはなく、しきい値署名や MPC 署名は行わず、ハードウェアウォレットでの署名にも対応しません。
- ハイブリッドな EVM 署名はありません: `assertHybridLane("evm")` は `LANE_NOT_AVAILABLE` をスローします。EVM アカウントは代わりに認可ウィンドウを使います。SVM トランザクションは利用できません。
- Rust、Swift、Kotlin、Python にはネットワークコードがありません。アカウント番号の取得、シミュレーション、ブロードキャストはアプリ側で行うか、TypeScript または Go のヘルパーを使ってください。
- `inspectTransaction` と `fetchEvmWindow` は TypeScript のみにあります。`inspectTransaction` は、署名者が現在登録している鍵に対してレイヤーを検証するため、鍵のローテーション後は、それ以前のトランザクションが `verified: false` と報告されます。
- 正規の導出にはニーモニックが必要です。ニーモニックを持たないウォレット（ハードウェアが保持する鍵）は、ランダムな鍵（`pqKeyFromSeed`）を生成するか HD ドラフトを使い、その鍵を登録します。ニーモニックは正規の形式（小文字、単一スペース）である必要があり、それ以外の表記は正規化されずに拒否されます。
- HD 導出（`deriveHdPqKey`）はドラフトであり、変更される可能性があります。
- Python にはまだ Windows 用ホイールがありません。Kotlin と Android には Kotlin 2.3 以降のコンパイラが必要です。
- ML-DSA-87 と secp256k1 の実装は、`qorechain-pqc`（`@noble/post-quantum`、`fips204`、Cloudflare CIRCL 上に構築）、および `@noble/curves`、`k256`、`decred/secp256k1` に由来します。

## セキュリティに関する注意 {#security}

- 鍵が QoreSign を実行するプロセスの外に出ることはありません。ネットワークヘルパーを呼び出さない限り何も送信されず、ヘルパーが送るのも公開データ（アドレス、署名済みトランザクションのバイト列、ハッシュ）のみです。
- 署名前に、`bodyBytes` と `authInfoBytes` に含まれるメッセージと手数料をユーザーに表示してください。ML-DSA-87 署名は手数料を対象に含みます。
- dApp が PQC レイヤーを既に含むボディを渡してきた場合は、従来型署名を追加する前に `assertPqLayerMatchesRegisteredKey` で確認してください。ブロードキャスト後は、`evaluateLayerState` と `fetchCommittedExtensionTypeUrls` の組み合わせ、または `inspectTransaction` で、レイヤーがチェーンに到達したことを確認できます。
- 予約済みドメイン以外で、ML-DSA-87 鍵を使って生のバイト列に署名しないでください。
- サインインのナンスは使い捨てです。`verifySiwq` は、`requirePq: false` を渡さない限り、ML-DSA-87 部分のないサインインを拒否します。従来型のみのサインインを受け入れるのは、サービスがポスト量子の保証を必要としない場合に限ってください。
- 秘密鍵ではなく、32 バイトの ML-DSA-87 シードを暗号化して保管してください。
- メインネットのニーモニックをスクリプトやシェル履歴に残さないでください。サンプルでは公開されている BIP-39 のテストフレーズ（`abandon` を 11 回、続けて `about`）を使っています。このフレーズには決して入金しないでください。
- 脆弱性は、公開 issue ではなく security@qore.network に非公開で報告してください。セキュリティ修正は最新のマイナーバージョンに入ります。

## 公開場所 {#where-published}

2026年10月27日にレジストリで確認したバージョンです。

| レジストリ | パッケージ | バージョン | リンク |
|---|---|---|---|
| npm | `@qorechain/qoresign` | 0.1.1 | [npmjs.com](https://www.npmjs.com/package/@qorechain/qoresign) |
| crates.io | `qorechain-qoresign` | 0.1.1 | [crates.io](https://crates.io/crates/qorechain-qoresign) |
| Go module proxy | `github.com/qorechain/qoresign/go` | v0.1.1（タグ `go/v0.1.1`） | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoresign/go) |
| Maven Central | `io.github.qorechain:qoresign` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) |
| Maven Central | `io.github.qorechain:qoresign-android` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) |
| PyPI | `qorechain-qoresign` | 0.1.1（macOS arm64 と x86_64、Linux x86_64 と aarch64 のホイール、ソース配布物） | [pypi.org](https://pypi.org/project/qorechain-qoresign/) |
| Swift Package Manager | `github.com/qorechain/qoresign` の `QoreSign` | 0.1.1（リリースにバイナリ `QoreSignFFI.xcframework.zip`） | [GitHub release](https://github.com/qorechain/qoresign/releases/tag/v0.1.1) |

リポジトリ: [github.com/qorechain/qoresign](https://github.com/qorechain/qoresign)（リリース v0.1.0 と v0.1.1）。

## 関連ページ {#related}

- [ポスト量子プリミティブ（`qorechain-pqc`）](/developer-tools/pqc-library): QoreSign の基盤となる ML-DSA-87 プリミティブ。
- [QoreChain SDK](/sdk/overview): トランザクションコンポーザー、EVM ウィンドウメッセージ、機能検出。
- [ウォレットアダプター](/developer-tools/wallet-adapter): ウォレットを変更できない場合の、dApp 側の代替手段。dApp が ML-DSA-87 鍵を保持し、変更されていないウォレットに `signDirect` を依頼します。バイト列は QoreSign と同じです。
- [QoreSeal](/developer-tools/qoreseal): アカウント宛ての暗号化。受信者カードは QoreSign のメッセージ署名です。
- [カストディキット](/developer-tools/custody-kit): QoreSign を土台にした入金検出と出金検証。
- [QoreChain MCP サーバー](/developer-tools/mcp): `get_pq_status` ツールが QoreSign を使ってハイブリッドレイヤーを検証します。
- [ポスト量子署名](/developer-guide/post-quantum-signing)と[取引所統合](/developer-guide/exchange-integration)。
- [開発者パッケージの概要](/developer-tools/overview)。

## バージョニング {#versioning}

QoreSign は 1.0 より前の段階です。マイナーバージョンで API が変わることがあり、破壊的変更はすべて[変更履歴](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md)に記載されます。ワイヤーフォーマットは別途バージョン管理されており（`v1` 仕様と `vectors/qoresign-v1.json`）、同一バージョン内では変更されません。

## コントリビューションとセキュリティ {#contributing}

[CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md) を参照してください。脆弱性は、[SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md) の記載に従って security@qore.network に非公開で報告してください。

## ライセンス {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE)。Copyright 2026 QoreChain Association.
