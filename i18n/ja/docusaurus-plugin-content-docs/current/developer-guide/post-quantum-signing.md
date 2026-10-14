---
slug: /developer-guide/post-quantum-signing
title: ポスト量子署名
sidebar_label: ポスト量子署名
sidebar_position: 8
---

# ポスト量子署名

`qorechain-pqc` は、QoreChain を支えるオープンソースかつ**標準規格のみ**に準拠したポスト量子暗号ライブラリです。ウォレット、インテグレーター、ツール開発者に対して、チェーンが使用しているものと全く同じプリミティブを 6 つの言語で、一貫した単一の API として提供し、共通のクロス言語テストベクタスイートによって**バイト互換性が証明**されています。

このライブラリは、**最終確定した NIST 標準**の監査済み実装をラップしています。独自方式を発明することは**ありません**。非標準の変種こそが相互運用性を壊す原因です（ある場所で生成された署名が別の場所で検証できなくなります）。すべてのバインディングは同一のテストベクタで検証されているため、ある言語で生成された ML-DSA 署名は他のすべての言語で検証でき、ML-KEM の共有秘密は 6 言語すべてで一致し、SHAKE-256 のダイジェストも同一になります。

* **リポジトリ:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **ライセンス:** Apache-2.0

## プリミティブ

| プリミティブ | 標準規格 | 役割 | レベル（デフォルトは**太字**） |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | デジタル署名 | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | 鍵カプセル化 | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | 拡張可能出力ハッシュ | — |

これらは QoreChain がプロトコルレベルで実行しているものと同じプリミティブです。すなわち **ML-DSA-87 (Dilithium-5)** 署名、**ML-KEM-1024** 鍵カプセル化、そしてデフォルトのアプリケーションハッシュとしての **SHAKE-256** です。チェーンがこれらをどのように使用しているかは[ポスト量子セキュリティ](/architecture/post-quantum-security)を参照してください。

### サイズ（バイト）

サイズとセキュリティの予算に応じてセキュリティレベルを選択してください。

| 方式 | セキュリティ | 公開鍵 | 署名 / 暗号文 |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> NIST 標準を小さくして、なお標準のままでいることはできません。ML-DSA-87 の鍵・署名サイズおよびバイト列は固定されており、これを「最適化」すると他のどの実装でも検証できない非標準の変種が生まれます。オンチェーンのフットプリントを縮小するには、方式そのものを改変するのではなく、後述のレバーを使用してください。

## 対応言語とパッケージ

すべての言語が同じ API を公開しており、それぞれ異なる監査済み実装に支えられています。これこそがバイト互換性を保証する仕組みです — 独立したバックエンド同士が標準規格の上で一致するのです。

| 言語 | パッケージ | インストール | バックエンド |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc`（インポートは `qorpqc`） | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/`（静的ライブラリ + ヘッダー） | [リポジトリ](https://github.com/qorechain/qorechain-pqc)からビルド | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.2.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info 提供状況
JavaScript、Rust、Python、Go、Java の各バインディングはすべてバージョン **0.2.1** として**公開済み**です — 上記のコマンドで npm、crates.io、PyPI、Go モジュールプロキシ、Maven Central から直接インストールできます。Python ディストリビューションは `qorechain-pqc` としてインストールされますが、**インポート名は `qorpqc`** です。**Java** パッケージは Maven Central に `io.github.qorechain:qorechain-pqc:0.2.1`（Bouncy Castle バックエンド）として公開されています。バージョン **0.2.0** でバージョン対応の `hybridSignBytes`（後述）が追加され、**0.2.1** でメインネットの v2 への切り替えを示すアップグレード名が修正されました。0.2.1 以降を使用してください。**C** バインディングは静的ライブラリ + ヘッダーであり、[`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) からご自身でビルドします。
:::

## 決定論的署名（デフォルト） {#deterministic-signing}

バージョン **0.1.1** 以降（およびそれ以降のすべてのリリース）、`sign()` は **6 つのバインディングすべて**で**決定論的** ML-DSA 変種（FIPS-204 §3.4、署名乱数が 32 バイトのゼロであるもの）を生成します。チェーンは、hedged か決定論的かにかかわらず、有効な FIPS-204 ML-DSA-87 署名をすべて受け入れます。検証手順は両者で同一であり、秘密鍵なしに検証者が両者を区別することはできません。バインディングがデフォルトで決定論的に署名するのは、同じトランザクションが常に同じ署名と同じ tx ハッシュになり、すべてのバインディングが共有テストベクタと一致するようにするためです。

重要な事実:

* 決定論的な出力は、同じ鍵とメッセージに対して **6 つのバインディングすべてでバイト単位で同一**です。共有のクロス言語テストベクタによって固定されています。
* hedged 署名は、各バインディングで**明示的なオプトイン**として引き続き利用できます（例: JavaScript では `{hedged: true}`、Rust では `sign_hedged`、Java では `mldsaSignHedged`、Python では `sign(..., hedged=True)`）。hedged 署名も有効な FIPS-204 署名として**チェーンに受け入れられます**。違いは、署名のたびに署名、したがって tx ハッシュが変わることだけです。
* JavaScript バインディングのバージョン 0.1.0 はデフォルトで hedged 署名を行っていました。それらの署名もオンチェーンで有効です。共有ベクタと一致する再現可能な署名が必要な場合は 0.1.1 にアップグレードしてください。

## 鍵の登録 {#pqc-key-registration}

すべてのアカウントは、ML-DSA-87 公開鍵を**一度だけ、明示的に**登録します。自動登録はありません。後続のハイブリッドトランザクションに埋め込まれた公開鍵（たとえば SDK の `includePqcPublicKey` オプション）は拡張に含まれて運ばれますが、鍵を登録**しません**。登録は、従来型の署名で署名できる唯一の Cosmos レーンのトランザクションであり、新規アカウントが最初の鍵をブートストラップできるようになっています。リリース版の `qorechaind`（公開ソースからビルドしたバイナリは署名できません。[ソースからのビルド](/developer-guide/building-from-source)を参照）、QoreX、または SDK の `ensurePqcRegistered` で実行してください:

```bash
# 1. Create a key. It is stored unencrypted under ~/.qorechaind/pqc/mypqc.dilithium (mode 0600) and the public key hex is printed.
qorechaind tx pqc gen-key mypqc

# 2. Register the public key on your account (classical-signed).
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -y

# 3. Verify.
qorechaind query pqc account <address>
```

`--gas` は明示的に設定してください。2,592 バイトの公開鍵はデフォルトの 200,000 ガスを超えることがあり（メインネットでの登録はおよそ 220,000〜350,000 を消費しています）、手数料は少なくとも gas × 0.1 uqor 必要です。そのため `--gas 600000` には `--fees 60000uqor` 以上が必要です。従来の形式 `qorechaind tx pqc register-key <pubkey-hex> hybrid` は Dilithium-5 では同等です。それ以降は、各 Cosmos レーンのトランザクションを `--generate-only` で構築し、`qorechaind tx pqc cosign` で署名します。鍵ファイルはアカウントのポスト量子署名鍵です。読み取れる人は誰でも従来型の鍵と合わせてアカウントの副署名ができてしまうため、ニーモニックと同様にバックアップしてください（ニーモニックから再導出できます。後述）。

登録済みの鍵は、EVM トランザクションを送信するための 2 つの要件のうちの 1 つ目でもあります。2 つ目は開いている [EVM 認可ウィンドウ](/developer-guide/evm-development#evm-window)です。

## `pqc` コード 21（`hybrid_verify_failed`）のトラブルシューティング {#code-21}

コード 21 は、ハイブリッド署名の ML-DSA-87 部分が、アカウントに登録された鍵に対して検証されなかったことを意味します。hedged と決定論的のどちらで署名したかが原因になることは**決してありません**。次の順に確認してください:

1. **sign-bytes のバージョン。** PQC 署名は v1 または v2 の sign-bytes を対象とし、ネットワークは各高さで正確に 1 つの形式だけを検証します。`qorechain-diana` は `v3.1.98` アップグレードで v2 に切り替わり、`qorechain-vladi` は `v3.2.0` アップグレードで切り替わります。それ以降に生まれたチェーンはジェネシスから v2 です。現在の SDK はネットワークごとに形式を選択します。独自に構築した署名器は、どのアップグレードが適用済みかをノードに問い合わせる必要があります（[アカウントと PQC 署名](/sdk/concepts/accounts-pqc) を参照）。
2. **v2 sign-bytes 内のチェーン ID。** v2 はチェーン ID を束縛するため、`qorechain-diana` 用に作成した署名は `qorechain-vladi` では検証されず、その逆も同様です。
3. **古い PQC ライブラリ。** 標準化前（FIPS-204 以前）のビルドは、標準準拠の検証器が拒否する署名を生成します。`qorechain-pqc` 0.1.1 以降を使用してください。
4. **誤った鍵。** 公開鍵はアカウントに登録されたものでなければなりません（`GET /qorechain/pqc/v1/account/{address}`）。別の導出方法で作った鍵（例えばアドレスに束縛された導出ではなく、旧来のブリッジ導出 `shake256(mnemonic)`）は有効に署名しますが一致しません。正規の鍵へ移行するには [鍵のローテーション](#key-rotation) を参照してください。

## 決定論的な鍵導出と復元 {#key-derivation}

エコシステム標準の導出方式は、ML-DSA-87 鍵をアカウントに結び付けるため、**アカウントのニーモニックのみから復元可能**です:

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

公開済みのすべてのツール（`@qorechain/wallet-adapter`、`@qorechain/sdk`、`@qorechain/chain-bridge` ≥0.1.1）がこの同じ鍵を導出するため、どのツールを使っても 1 つのニーモニックからは 1 つの鍵が生成されます。CLI で鍵を復元するには（ニーモニックは stdin から入力）:

```bash
# the mnemonic is read from stdin; keep it out of shell history by redirecting from a file you delete afterwards
qorechaind tx pqc recover-key mykey qor1youraddress... < mnemonic.txt
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge < mnemonic.txt
```

復元された秘密鍵は、`tx pqc cosign` で使用するために、暗号化されていない 16 進数（モード 0600）として `<home>/pqc/mykey.dilithium` に書き込まれます。

## 鍵ローテーション（同一アルゴリズム内） {#key-rotation}

チェーンバージョン **v3.1.85** 以降、**`MsgRotatePQCKey`** によってアカウントの ML-DSA-87 鍵を**同一アルゴリズム内で**ローテーションできます — 以前は登録は一度きりであり、`MigratePQCKey` はアルゴリズム間の移行のみを扱っていました。レガシー導出の鍵を正規のアドレス結合導出方式に移行する場合や、危殆化した鍵を廃止する場合に使用してください。

ローテーションは**二重署名**されます。すなわち、旧鍵と新鍵の両方が、ドメイン分離されたメッセージ `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"` に署名します。リプレイは構造的に不可能です — ローテーション完了後は旧鍵が登録済みの鍵と一致しなくなるため、同じメッセージを再適用することはできません。ローテーションは**ルート鍵のみ**の操作であり（[オーセンティケーター](/developer-guide/account-abstraction#authenticators)に委任することは決してできません）、トランザクション自体は依然として*旧*鍵によるハイブリッド署名が行われ、現在の所有権を証明します。

ワンショット CLI（ニーモニックは stdin から入力。旧鍵を復元し、新鍵を導出または生成し、二重署名してブロードキャストします）:

```bash
# migrate a legacy-derived key to the canonical derivation (mnemonic on stdin):
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt

# rotate to a brand-new random key (compromise recovery); --new-key-out is required and is written before anything is sent:
qorechaind tx pqc rotate-key --old-derivation adapter --new-random --new-key-out mykey-new \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt
```

ローテーションは 2,592 バイトの鍵 2 つと署名 3 つを運ぶため、送金よりもはるかに多くのガスが必要です。明示的な `--gas 600000` と、少なくとも 60,000 uqor の手数料を維持してください。`--new-key-out` なしの `--new-random` は拒否されます（ノードリリース v3.2.1 以降）。これにより、ローテーションによって新しい鍵を失った状態になることはありません。

コード上では、`@qorechain/wallet-adapter`（≥0.1.7）および `@qorechain/sdk`（≥0.7.0）が同じフローを公開しています（同期処理で、メッセージと両方の鍵ペアを返します）:

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account: "qor1youraddress...", mnemonic, chainId: "qorechain-vladi",
});
// Sign & broadcast `msg` with the account's normal hybrid signer, using `oldKeypair` for the envelope's PQC signature.
```

ローテーションが成功すると、新しい鍵での署名は成功し（code 0）、古い鍵は拒否されます（`pqc` code 21）。

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

### クイックスタート (JavaScript / TypeScript)

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

デフォルトが要件に合わない場合は、レベル別のエクスポートが利用できます: `mldsa44/65/87` および `mlkem512/768/1024`（`mldsa` / `mlkem` は L5 のデフォルトです）。

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

**pay-to-pubkey-hash** 登録用ヘルパーです。公開鍵の短い（20〜32 バイトの）SHAKE-256 ハッシュを生成します。パターンは次のとおりです: アカウント状態には `pubkeyHash` のみを保存し、完全な公開鍵はトランザクション内で要求します。これにより、1〜2.5 KB の鍵サイズに関係なく、アカウント状態は小さいまま保たれます。

### `hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfo)`

QoreChain のウォレット互換な**ハイブリッド拡張 sign-bytes フレーミング**です。ハイブリッドトランザクションの PQC 側を構成するために ML-DSA-87 (Dilithium-5) で署名すべきバイト列を、正確に生成します。形式は 2 つあり、ネットワークは各高さでそのうち正確に 1 つを検証します。**v1** = `BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A`、**v2** = `"qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` です（`B0` は PQC 拡張を除いたトランザクションボディ、`A` は auth info）。2 つの公開ネットワークはどちらも **v2** です。このライブラリは純粋関数なので、形式は呼び出し側が選択します。ノードに `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` で `v3.2.0`（メインネットのアップグレード名）と `v3.1.98`（テストネットの以前の名前）の**両方**を問い合わせ、どちらかの高さが 0 より大きければ v2 を使用します。`signBytesVersionForApplied` と `signBytesVersionFor(chainId, height)` がこのルールを実装しています（`@qorechain/pqc` 0.2.1 以降を使用してください。0.1.x の 2 引数形式は例外を投げます）。

これは、ウォレットとインテグレーターが cosmos トランザクションパス上で**必須のハイブリッド署名**を生成するために使用する部品です。現行のチェーンバージョンでは、ハイブリッド署名は**デフォルトで必須**です（`hybrid_signature_mode = required`、`allow_classical_fallback = false`）。cosmos パスのすべてのトランザクションは、従来型の secp256k1 署名に加えて Dilithium-5 署名を伴わなければなりません。強制モデルについては[ポスト量子セキュリティ](/architecture/post-quantum-security)を参照してください。

従来型の secp256k1 署名は標準の sign bytes（PQC 拡張を**含まない**）に対して計算され、ML-DSA-87 署名は計算されたのち `PQCHybridSignature` 拡張として添付されます。従来型の sign bytes が拡張を含まないため、検証者が PQC 部分を理解するかどうかに関係なく、従来型署名は有効なままです。

このハイブリッド署名を生成する方法は 3 つあります:

* **CLI** — `qorechaind tx pqc cosign` がトランザクションに Dilithium-5 の副署名を添付してブロードキャストします（事前に `qorechaind tx pqc gen-key` を実行し、鍵を登録しておきます）。リリース版バイナリにのみ含まれています。[トランザクションコマンド](/cli-reference/transaction-commands)を参照してください。
* **QoreChain SDK** — `buildHybridTx` / `signAndBroadcastHybrid`（sign-bytes の形式が解決されるよう `rest` を渡します）が TypeScript、Python、Go、Rust、Java で同等の処理を行います。先に鍵を登録してください（上記参照）。[SDK アカウントと PQC 署名](/sdk/concepts/accounts-pqc)を参照してください。
* **`qorechain-pqc` を直接使用** — サポートされている 6 言語のいずれかで SDK 外のツールを構築する場合は、`hybridSignBytes` で sign bytes をフレーミングし、`mldsa.sign` で Dilithium-5 署名を生成してください。

## オンチェーンフットプリントの最適化

ML-DSA の鍵と署名は、従来型の基準からすると大きなサイズです。標準規格のバイト列は固定されているため、オンチェーンのフットプリントを小さく保つ方法は、以下の 3 つのレバーを使うことです — いずれも標準規格そのものを改変しません:

1. **セキュリティレベルを意図的に選択する。** ML-DSA-65 (L3) の署名は ML-DSA-87 (L5) より約 28% 小さく、それでも非常に強力です。ML-KEM-768 の暗号文は 1024 よりも小さくなります。ユースケースごとに選択してください。
2. **Pay-to-pubkey-hash。** アカウント状態には `pubkeyHash(pk)`（SHAKE-256 の 20〜32 バイト）のみを保存し、完全な公開鍵はトランザクション内で要求します。鍵サイズに関係なく、アカウント状態は小さいまま保たれます。
3. **署名の検証後破棄。** 署名はトランザクション（ブロックデータ）内に存在しなければなりませんが、永続的な状態ツリーに書き込んではなりません。

> **なぜ Falcon がないのか？** FN-DSA (Falcon) を使えばより小さい署名が得られますが、意図的に**除外**されています。FN-DSA は FIPS-206 の*ドラフト*（未確定）であり、標準規格のみを扱うライブラリは最終確定した標準だけを出荷するためです。FIPS-206 が最終確定した時点で再検討される可能性があります。

## 関連ページ

* [ポスト量子セキュリティ](/architecture/post-quantum-security) — チェーンがこれらのプリミティブをどう使用し、ハイブリッド署名をどう強制しているか。
* [トランザクションコマンド](/cli-reference/transaction-commands) — `tx pqc gen-key` / `tx pqc cosign` の CLI フロー。
* [SDK アカウントと PQC 署名](/sdk/concepts/accounts-pqc) — QoreChain SDK からの鍵管理とハイブリッド署名。
* [ウォレットセットアップ](/getting-started/wallet-setup) — PQC 対応アカウントの作成と管理。
