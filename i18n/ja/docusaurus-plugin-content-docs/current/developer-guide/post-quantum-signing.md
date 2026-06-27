---
slug: /developer-guide/post-quantum-signing
title: ポスト量子署名
sidebar_label: ポスト量子署名
sidebar_position: 8
---

# ポスト量子署名

`qorechain-pqc` は、QoreChainの基盤となるオープンソースの **標準のみ** のポスト量子暗号ライブラリです。ウォレット、インテグレーター、ツールに対して、チェーンが使用するのとまったく同じプリミティブを、6言語で、1つの一貫したAPIで提供し、共有のクロス言語テストベクタースイートに対して **バイト互換が証明されています**。

このライブラリは、**最終版のNIST標準** の監査済み実装をラップしています。カスタムスキームを発明することは **しません**。非標準のバリアントこそが相互運用性を破壊するものです（ある場所で生成された署名が別の場所で検証できなくなります）。すべてのバインディングは同じベクターに対して検証されているため、ある言語で生成されたML-DSA署名は他のすべての言語で検証され、ML-KEM共有秘密は6言語すべてで一致し、SHAKE-256ダイジェストは同一になります。

* **リポジトリ:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **ライセンス:** Apache-2.0

## プリミティブ

| プリミティブ | 標準 | 役割 | レベル（デフォルトは**太字**） |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | デジタル署名 | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | 鍵カプセル化 | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | 拡張可能出力ハッシュ | — |

これらは、QoreChainがプロトコルレベルで稼働させているのと同じプリミティブです。**ML-DSA-87（Dilithium-5）** 署名、**ML-KEM-1024** 鍵カプセル化、そしてデフォルトのアプリケーションハッシュとしての **SHAKE-256** です。チェーンがこれらをどのように使用するかについては、[ポスト量子セキュリティ](/architecture/post-quantum-security)を参照してください。

### サイズ（バイト）

サイズ／セキュリティの予算に応じてセキュリティレベルを選択してください。

| スキーム | セキュリティ | 公開鍵 | 署名／暗号文 |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> NIST標準を小さくしつつ標準であり続けることはできません。ML-DSA-87は鍵／署名サイズが固定されており、バイト数も固定です。これを「最適化」すると、他のどの実装でも検証できない非標準のバリアントが生成されます。オンチェーンのフットプリントを縮小するには、スキームを変更するのではなく、以下のレバーを使用してください。

## 言語とパッケージ

すべての言語が同じAPIを公開しており、それぞれが異なる監査済み実装に裏打ちされています。これがバイト互換性を保証するものです。独立したバックエンドが標準について合意しています。

| 言語 | パッケージ | インストール | バックエンド |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc`（`qorpqc` としてインポート） | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/`（静的ライブラリ + ヘッダー） | [リポジトリ](https://github.com/qorechain/qorechain-pqc)からビルド | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.0` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info 提供状況
JavaScript、Rust、Python、Go、Javaのバインディングは、いずれもバージョン **0.1.0** で **公開済み** です。上記のコマンドで、npm、crates.io、PyPI、Goモジュールプロキシ、Maven Centralから直接インストールできます。Pythonのディストリビューションは `qorechain-pqc` としてインストールされますが、**インポートは `qorpqc`** です。**Java** パッケージはMaven Centralに `io.github.qorechain:qorechain-pqc:0.1.0` として公開されています（Bouncy Castleバックエンド）。**C** バインディングは、[`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)からビルドする静的ライブラリ + ヘッダーです。
:::

## 一貫したAPI

すべての言語が同じサーフェスを提供します。

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

デフォルトが望ましくない場合に備えて、レベル固有のエクスポートも利用できます。`mldsa44/65/87` と `mlkem512/768/1024` です（`mldsa` / `mlkem` がL5のデフォルトです）。

**Rust、Go、C、Python、Java** のバインディングは、これをそのまま反映しています。例えば:

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

生のプリミティブに加えて、ライブラリはインテグレーターがQoreChainのアカウントやトランザクションと対話するために必要な2つのヘルパーを公開しています。

### `pubkeyHash(pk, len=20)`

**pay-to-pubkey-hash** 登録ヘルパーです。公開鍵の短い（20〜32バイト）SHAKE-256ハッシュを生成します。パターンは、アカウント状態には `pubkeyHash` のみを保存し、トランザクションには完全な公開鍵を要求するというものです。1〜2.5 KBの鍵に関わらず、アカウント状態は極小のまま保たれます。

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

QoreChainのウォレット互換 **ハイブリッド拡張サインバイトフレーミング** です。これは、ハイブリッドトランザクションのPQC部分を形成するためにML-DSA-87（Dilithium-5）で署名されなければならないバイトを正確に生成します。

これは、cosmosトランザクションパス上で **必須のハイブリッド署名** を生成するためにウォレットやインテグレーターが使用する部分です。現在のチェーンバージョンの時点で、ハイブリッド署名は **デフォルトで必須** です（`hybrid_signature_mode = required`、`allow_classical_fallback = false`）。すべてのcosmosパストランザクションは、古典的なsecp256k1署名と並んでDilithium-5署名を携帯しなければなりません。強制モデルについては[ポスト量子セキュリティ](/architecture/post-quantum-security)を参照してください。

古典的なsecp256k1署名は標準のサインバイト（PQC拡張を **除外** したもの）に対して計算され、ML-DSA-87署名は計算されて `PQCHybridSignature` 拡張として添付されます。古典的なサインバイトは拡張を除外しているため、検証者がPQC部分を理解しているかどうかに関わらず、古典的な署名は有効なまま保たれます。

このハイブリッド署名を生成する方法は3つあります。

* **CLI** — `qorechaind tx pqc cosign` がトランザクションにDilithium-5コ署名を添付します（`qorechaind tx pqc gen-key` の後）。[トランザクションコマンド](/cli-reference/transaction-commands)を参照してください。
* **QoreChain SDK** — `buildHybridTx`（`includePqcPublicKey` 付き）がTypeScript/Python/Go/Rustで同等の処理を行います。[SDKのアカウントとPQC署名](/sdk/concepts/accounts-pqc)を参照してください。
* **`qorechain-pqc` を直接** — SDKの外部で、サポートされている6言語のいずれかでツールを構築している場合、`hybridSignBytes` を使ってサインバイトをフレーミングし、`mldsa.sign` を使ってDilithium-5署名を生成します。

## オンチェーンフットプリントの最適化

ML-DSAの鍵と署名は、古典的な基準では大きいです。標準のバイト数は固定されているため、オンチェーンのフットプリントを小さく保つ方法は、これら3つのレバーを使うことです。いずれも標準を変更するものではありません。

1. **セキュリティレベルを意図的に選ぶ。** ML-DSA-65（L3）署名はML-DSA-87（L5）より約28%小さく、それでも非常に強力です。ML-KEM-768暗号文は1024より小さいです。ユースケースごとに選択してください。
2. **pay-to-pubkey-hash。** アカウント状態には `pubkeyHash(pk)`（20〜32バイトのSHAKE-256）のみを保存し、トランザクションには完全な公開鍵を要求します。鍵サイズに関わらず、アカウント状態は極小のまま保たれます。
3. **署名の検証と破棄。** 署名はトランザクション（ブロックデータ）内に存在しなければなりませんが、永続的な状態ツリーには決して書き込まれるべきではありません。

> **なぜFalconがないのか?** FN-DSA（Falcon）はより小さい署名を提供しますが、意図的に **除外** されています。FN-DSAはFIPS-206の *ドラフト*（最終版ではない）であり、標準のみのライブラリは最終化された標準のみを提供します。FIPS-206が最終化された時点で再検討できます。

## 関連

* [ポスト量子セキュリティ](/architecture/post-quantum-security) — チェーンがこれらのプリミティブをどのように使用し、ハイブリッド署名をどのように強制するか。
* [トランザクションコマンド](/cli-reference/transaction-commands) — `tx pqc gen-key` / `tx pqc cosign` のCLIフロー。
* [SDKのアカウントとPQC署名](/sdk/concepts/accounts-pqc) — QoreChain SDKからの鍵とハイブリッド署名。
* [ウォレットのセットアップ](/getting-started/wallet-setup) — PQC対応アカウントの作成と管理。
