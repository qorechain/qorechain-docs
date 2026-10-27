---
slug: /qoresign/overview
title: QoreSign の概要
sidebar_label: 概要
sidebar_position: 1
---

# QoreSign

QoreSign は、QoreChain 上のウォレットとバックエンド向けの、secp256k1 + ML-DSA-87
（FIPS 204）ハイブリッド署名です。

QoreSign を使うと、QoreChain 独自のウォレット以外のウォレットでも、アカウントの
ML-DSA-87 鍵を導出し、両方の鍵でネイティブレーンのトランザクションに署名し、
ハイブリッド署名をローカルで検証し、署名前にトランザクションをシミュレートし、
Sign In With QoreChain を実装できます。これは
[`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) バインディングの
上に載る薄いレイヤーであり、独自の暗号プリミティブは一切追加しません。

現在のリリースは **0.1.0** です。ソース、サンプル、テストベクターは
[qorechain/qoresign](https://github.com/qorechain/qoresign) リポジトリにあります。

## 各レーンで QoreSign が行うこと {#lanes}

| レーン | 現時点で QoreSign が行うこと |
|---|---|
| **Native**（Cosmos SDK） | ハイブリッド署名と検証。ネットワークはデフォルトで ML-DSA-87 署名を必須とします。 |
| **EVM** | 認可ウィンドウのみ: アカウントは ML-DSA-87 鍵を登録し、ネイティブレーンから期限付きの認可ウィンドウを開きます。Ethereum トランザクション自体には ML-DSA-87 署名は含まれません。 |
| **SVM** | ネットワークではまだ利用できません（`LANE_NOT_AVAILABLE`）。 |

EVM でのハイブリッド署名には、まずネットワーク側でレーンごとの PQC サポートが
必要です。詳しくは
[EVM ウォレット: 認可ウィンドウ](/qoresign/guides/evm-quantum-ready)を参照してください。

## パッケージ {#packages}

| 言語 | パッケージ | インストール |
|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | `cargo add qorechain-qoresign` |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go` |
| Swift | [`QoreSign`](https://github.com/qorechain/qoresign)（Swift Package、iOS 16+、macOS 13+） | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.0")` |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.0")` |

5 つの実装はすべて、同じ[テストベクター](/qoresign/vectors)で自己検証されます。

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

ネットワークヘルパー（鍵のステータス、残高変動を伴うシミュレーション、ブロード
キャスト、チェーンに対するサインイン検証）は `@qorechain/qoresign/network` に
あります。

## ドキュメント {#documentation}

- [クイックスタート](/qoresign/quickstart): 鍵の導出、ハイブリッドトランザクション
  の署名と検証を数分で行います。
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

API リファレンス: リポジトリのクローン内で、`pnpm -C packages/ts docs`
（TypeScript）、`cargo doc -p qorechain-qoresign`（Rust）、または
`go doc github.com/qorechain/qoresign/go`（Go）を実行してください。Swift と
Kotlin のバインディングは Rust API をミラーしています。詳しくは
[Swift](https://github.com/qorechain/qoresign/tree/main/swift) と
[Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin) の README を参照してください。

## スコープ {#scope}

QoreSign はローカルで署名します。鍵を代わりに保管することはなく、しきい値署名や
MPC 署名は行わず、ハードウェアウォレットでの署名にも対応しません。ML-DSA-87 と
secp256k1 の実装は、`qorechain-pqc`（`@noble/post-quantum`、`fips204`、
Cloudflare CIRCL 上に構築）、および `@noble/curves`、`k256`、
`decred/secp256k1` に由来します。

## バージョニング {#versioning}

QoreSign は 1.0 より前の段階です。マイナーバージョンで API が変わることがあり、
破壊的変更はすべて
[変更履歴](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md)に記載
されます。ワイヤーフォーマットは別途バージョン管理されており（`v1` 仕様と
`vectors/qoresign-v1.json`）、同一バージョン内では変更されません。

## コントリビューションとセキュリティ {#contributing}

[CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md)
を参照してください。脆弱性は、
[SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md)
の記載に従って非公開で報告してください。

## ライセンス {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE)。Copyright
2026 QoreChain Association.
