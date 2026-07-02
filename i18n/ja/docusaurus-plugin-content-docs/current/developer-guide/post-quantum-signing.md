---
slug: /developer-guide/post-quantum-signing
title: ポスト量子署名
sidebar_label: ポスト量子署名
sidebar_position: 8
---

# ポスト量子署名

`qorechain-pqc` は、QoreChain を支えるオープンソースの**標準準拠のみ（standards-only）**のポスト量子暗号ライブラリです。ウォレット、インテグレーター、ツール類に対して、チェーンが使用しているものとまったく同じプリミティブを提供します — 6 言語で、一貫した単一の API を持ち、共有のクロス言語テストベクトルスイートに対して**バイト互換性が実証**されています。

このライブラリは、**最終確定した NIST 標準**の監査済み実装をラップしています。独自スキームを発明することは**ありません**。非標準のバリアントこそが相互運用性を壊すものだからです（ある場所で生成された署名が別の場所では検証できなくなります）。すべてのバインディングは同一のベクトルに対して検証されているため、ある言語で生成された ML-DSA 署名は他のすべての言語で検証でき、ML-KEM の共有秘密は 6 言語すべてで一致し、SHAKE-256 のダイジェストも同一になります。

* **リポジトリ:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **ライセンス:** Apache-2.0

## プリミティブ

| プリミティブ | 標準 | 役割 | レベル（デフォルトは**太字**） |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | デジタル署名 | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | 鍵カプセル化 | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | 可変長出力ハッシュ | — |

これらは QoreChain がプロトコルレベルで実行しているものと同じプリミティブです: **ML-DSA-87 (Dilithium-5)** 署名、**ML-KEM-1024** 鍵カプセル化、そしてデフォルトのアプリケーションハッシュとしての **SHAKE-256** です。チェーンでの利用方法については[ポスト量子セキュリティ](/architecture/post-quantum-security)を参照してください。

### サイズ（バイト）

サイズとセキュリティの予算に応じてセキュリティレベルを選択してください。

| スキーム | セキュリティ | 公開鍵 | 署名 / 暗号文 |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> NIST 標準を小さくして、なお標準であり続けることはできません。ML-DSA-87 の鍵・署名サイズおよびバイト列は固定であり、これを「最適化」すると、他のどの実装も検証できない非標準バリアントになってしまいます。オンチェーンのフットプリントを縮小するには、スキームを改変するのではなく、後述のレバーを使用してください。

## 言語とパッケージ

各言語は同一の API を公開しており、それぞれ異なる監査済み実装に支えられています。これこそがバイト互換性を保証する仕組みです — 独立したバックエンド同士が標準について一致するのです。

| 言語 | パッケージ | インストール | バックエンド |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc`（インポートは `qorpqc`） | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/`（静的ライブラリ + ヘッダー） | [リポジトリ](https://github.com/qorechain/qorechain-pqc)からビルド | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info 提供状況
JavaScript、Rust、Python、Go、Java の各バインディングはすべてバージョン **0.1.1** で**公開済み**です — 上記のコマンドで npm、crates.io、PyPI、Go モジュールプロキシ、Maven Central から直接インストールできます。Python ディストリビューションは `qorechain-pqc` としてインストールされますが、**インポート名は `qorpqc`** です。**Java** パッケージは Maven Central に `io.github.qorechain:qorechain-pqc:0.1.1`（Bouncy Castle バックエンド）として公開されています。**C** バインディングは静的ライブラリ + ヘッダーであり、[`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) からビルドします。
:::

## 決定論的署名（コンセンサスクリティカル） {#deterministic-signing}

バージョン **0.1.1** 以降、`sign()` は **6 つのバインディングすべて**で**決定論的（deterministic）** ML-DSA バリアント（FIPS-204 §3.4、署名乱数が 32 バイトのゼロであるもの）を生成します — そしてチェーンが受け入れるのはこのバリアントのみです。QoreChain のトランザクション検証器は**ヘッジド（ランダム化）ML-DSA 署名を拒否**するため、ヘッジド署名は暗号学的には検証可能であっても、オンチェーンでは失敗します。

重要なポイント:

* **デフォルトを変更しないでください。** 決定論的署名はコンセンサスクリティカルであり、すべてのバインディングでその旨が明記されています。
* 決定論的な出力は、同じ鍵とメッセージに対して **6 つのバインディングすべてでバイト単位で同一**です — 共有のクロス言語テストベクトルによって固定されています。
* ヘッジド署名は、チェーン外のユースケース向けに、バインディングごとの**明示的なオプトイン**として引き続き利用可能です（例: JavaScript では `{hedged: true}`、Rust では `sign_hedged`、Java では `mldsaSignHedged`、Python では `sign(..., hedged=True)`）— ヘッジド署名はチェーンでは**受け入れられません**。
* JavaScript バインディングのバージョン 0.1.0 はデフォルトでヘッジド署名を行っていました — 0.1.0 に対してトランザクションツールを構築していた場合は、**0.1.1 にアップグレードしてください**。旧デフォルトで署名されたトランザクションはオンチェーンで拒否されます。

## 一貫した API

すべての言語が同じインターフェースを提供します:

```text
keygen()                              -> (publicKey, secretKey)
sign(secretKey, message)              -> signature
verify(publicKey, message, signature) -> bool

kem.keygen()                          -> (publicKey, secretKey)
kem.encapsulate(publicKey)            -> (cipherText, sharedSecret)
kem.decapsulate(secretKey, cipherText)-> sharedSecret

shake256(data, outLen=32)             -> digest
```

### クイックスタート（JavaScript / TypeScript）

```js
import { mldsa, mlkem, shake256, pubkeyHash } from '@qorechain/pqc';

// ML-DSA-87 signatures
const { publicKey, secretKey } = mldsa.keygen();
const sig = mldsa.sign(secretKey, message);
mldsa.verify(publicKey, message, sig); // true

// ML-KEM-1024 key encapsulation
const { publicKey: ek, secretKey: dk } = mlkem.keygen();
const { cipherText, sharedSecret } = mlkem.encapsulate(ek);
mlkem.decapsulate(dk, cipherText); // === sharedSecret

// SHAKE-256 + blockchain helpers
shake256(data, 32);        // 32-byte digest
pubkeyHash(publicKey, 20); // pay-to-pubkey-hash
```

デフォルトが望みのものでない場合のために、レベル別のエクスポートも用意されています: `mldsa44/65/87` および `mlkem512/768/1024`（`mldsa` / `mlkem` は L5 のデフォルトです）。

**Rust、Go、C、Python、Java** の各バインディングもこれを正確に踏襲しています。例:

```rust
// Rust
use qorechain_pqc::mldsa::default as mldsa;
let (pk, sk) = mldsa::keygen()?;
let sig = mldsa::sign(&sk, msg)?;
assert!(mldsa::verify(&pk, msg, &sig));
```

```go
// Go
pk, sk, _ := pqc.MLDSA.Keygen()
sig, _ := pqc.MLDSA.Sign(sk, msg)
pqc.MLDSA.Verify(pk, msg, sig) // true
```

## ブロックチェーンヘルパー

生のプリミティブに加えて、このライブラリはインテグレーターが QoreChain のアカウントおよびトランザクションとやり取りするために必要な 2 つのヘルパーを公開しています。

### `pubkeyHash(pk, len=20)`

**pay-to-pubkey-hash** 登録用のヘルパーです。公開鍵の短い（20–32 バイトの）SHAKE-256 ハッシュを生成します。パターンとしては、アカウント状態には `pubkeyHash` のみを保存し、トランザクション内で完全な公開鍵を要求します。これにより、1–2.5 KB の鍵サイズにかかわらず、アカウント状態は小さいまま保たれます。

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

QoreChain のウォレット互換な**ハイブリッド拡張 sign-bytes フレーミング**です。これは、ハイブリッドトランザクションの PQC 側半分を構成するために ML-DSA-87 (Dilithium-5) で署名しなければならないバイト列を正確に生成します。

これは、ウォレットやインテグレーターが cosmos トランザクションパス上で**必須のハイブリッド署名**を生成するために使用する部品です。現行のチェーンバージョンでは、ハイブリッド署名は**デフォルトで必須**です（`hybrid_signature_mode = required`、`allow_classical_fallback = false`）: cosmos パスのすべてのトランザクションは、従来型の secp256k1 署名に加えて Dilithium-5 署名を伴わなければなりません。強制モデルについては[ポスト量子セキュリティ](/architecture/post-quantum-security)を参照してください。

従来型の secp256k1 署名は標準の sign bytes（PQC 拡張を**含まない**）に対して計算され、ML-DSA-87 署名は計算されたうえで `PQCHybridSignature` 拡張として添付されます。従来型の sign bytes が拡張を含まないため、検証者が PQC 部分を理解できるかどうかにかかわらず、従来型署名は有効なままです。

このハイブリッド署名を生成する方法は 3 つあります:

* **CLI** — `qorechaind tx pqc cosign` がトランザクションに Dilithium-5 コサインを添付します（事前に `qorechaind tx pqc gen-key` を実行）。[トランザクションコマンド](/cli-reference/transaction-commands)を参照してください。
* **QoreChain SDK** — `buildHybridTx`（`includePqcPublicKey` 付き）が TypeScript/Python/Go/Rust で同等の処理を行います。[SDK アカウントと PQC 署名](/sdk/concepts/accounts-pqc)を参照してください。
* **`qorechain-pqc` を直接使用** — サポート対象の 6 言語のいずれかで SDK の外でツールを構築する場合は、`hybridSignBytes` で sign bytes をフレーミングし、`mldsa.sign` で Dilithium-5 署名を生成します。

## オンチェーンフットプリントの最適化

ML-DSA の鍵と署名は、従来型の基準からすると大きなものです。標準のバイト列は固定であるため、オンチェーンフットプリントを小さく保つ方法は、以下の 3 つのレバーを使うことです — いずれも標準を改変するものではありません:

1. **セキュリティレベルを意図的に選択する。** ML-DSA-65 (L3) の署名は ML-DSA-87 (L5) より約 28% 小さく、それでも非常に強力です。ML-KEM-768 の暗号文は 1024 のものより小さくなります。ユースケースごとに選択してください。
2. **Pay-to-pubkey-hash。** アカウント状態には `pubkeyHash(pk)`（SHAKE-256 の 20–32 バイト）のみを保存し、トランザクション内で完全な公開鍵を要求します。鍵のサイズにかかわらず、アカウント状態は小さいまま保たれます。
3. **署名の検証後破棄（verify-and-discard）。** 署名はトランザクション（ブロックデータ）内に存在しなければなりませんが、永続的な状態ツリーに書き込まれるべきではありません。

> **なぜ Falcon がないのか？** FN-DSA (Falcon) はより小さな署名を提供しますが、意図的に**除外**されています: FN-DSA は FIPS-206 の*ドラフト*（最終確定前）であり、標準準拠のみのライブラリは最終確定した標準のみを提供するためです。FIPS-206 が最終確定した後に再検討される可能性があります。

## 関連ページ

* [ポスト量子セキュリティ](/architecture/post-quantum-security) — チェーンがこれらのプリミティブをどう使用し、ハイブリッド署名をどう強制しているか。
* [トランザクションコマンド](/cli-reference/transaction-commands) — `tx pqc gen-key` / `tx pqc cosign` の CLI フロー。
* [SDK アカウントと PQC 署名](/sdk/concepts/accounts-pqc) — QoreChain SDK からの鍵管理とハイブリッド署名。
* [ウォレットのセットアップ](/getting-started/wallet-setup) — PQC 対応アカウントの作成と管理。
