---
slug: /developer-tools/pqc-library
title: ポスト量子ライブラリ (qorechain-pqc)
sidebar_label: PQC ライブラリ
sidebar_position: 20
---

# ポスト量子ライブラリ (`qorechain-pqc`)

`qorechain-pqc` は、QoreChain のツール群が土台にしている、標準規格のみに準拠したポスト量子暗号ライブラリです。完全な [QoreChain SDK](/sdk/overview) に依存せずに、チェーンが使用する鍵と署名を正確に作成または検証する必要があるウォレット、バックエンド、取引所、ツールの開発者向けです。3 つの NIST 標準（署名用の ML-DSA（FIPS 204）、鍵カプセル化用の ML-KEM（FIPS 203）、ハッシュとしての SHAKE-256（FIPS 202））の独立した実装を、TypeScript/JavaScript、Python、Rust、Go、Java、C の 1 つの API の背後にまとめ、ハイブリッド QoreChain トランザクションが署名するバイト列を構築するヘルパーを追加します。バージョン **0.2.3**、Apache-2.0、2026年10月27日にレジストリで確認済みです。

これはプリミティブのライブラリです。ネットワークとの通信、鍵の保持、鍵のオンチェーン登録、トランザクションの送信は行いません。ハイブリッド署名と鍵登録に関するチェーンのルールについては[ポスト量子署名](/developer-guide/post-quantum-signing)と[ポスト量子セキュリティ](/architecture/post-quantum-security)を、すぐに使える署名クライアントについては、どちらもこれらのプリミティブの上に構築されている [SDK](/sdk/overview) または [QoreSign](/qoresign/overview) を参照してください。

## 革新点 {#innovations}

* **1 組のテストベクターと 6 つの独立したバックエンド。** JavaScript バインディングは `@noble/post-quantum`、Rust は `fips204`、`fips203`、`sha3` クレート、Go は Cloudflare CIRCL、Java は Bouncy Castle、Python と C は liboqs を使用します。各バインディングのテストスイートは、リポジトリの `vectors/` フォルダにある同じファイル（3 つのレベルの ML-DSA、3 つのレベルの ML-KEM、SHAKE-256）をバイト単位で再現する必要があるため、ある言語で作成した署名は他の言語でも検証されます。
* **デフォルトで決定論的な署名。** `sign` は FIPS 204 の決定論的バリアント（署名の乱数として 32 バイトのゼロを使用）を使うため、同じ鍵とメッセージからは、すべてのバインディングでバイト単位で同一の署名が得られます。これにより、署名とそれを含むトランザクションハッシュは再現可能になり、ベクターと照合して確認できます。
* **相互運用できる、明示的なオプトインとしてのヘッジ署名。** ランダム化された（ヘッジ）署名は、JavaScript では `{hedged: true}`、Python では `hedged=True`、Rust では `sign_hedged`、Go では `SignHedged`（0.2.3 で追加）、Java では `mldsaSignHedged`、C では `qpqc_mldsa_sign_hedged` として利用できます。6 つの言語のいずれかで作成したヘッジ署名は、6 つすべてで検証されます（0.2.3 では 36 通りの組み合わせのうち 36 通りを確認）。チェーンは有効な FIPS 204 ML-DSA-87 署名であれば何でも検証するため、両方の種類を受け付けます。秘密鍵がなければ、この 2 つを見分けることはできません。
* **チェーンが構築するのと同じ方法で構築される、チェーンのハイブリッド署名対象バイト列。** すべてのバインディングに `hybridSignBytesV1`、`hybridSignBytesV2`、そしてバージョンを必須とするディスパッチャー `hybridSignBytes(version, chainId, body, authInfo)` があります。v2 形式は `"qorechain-pqc-hybrid-v2"`、続いて 64 ビットのビッグエンディアンの長さを持つチェーン ID、そして 32 ビットのビッグエンディアンの長さをそれぞれに持つトランザクションボディ（PQC 拡張なし）と auth info です。すべてのバインディングは、チェーンの既知解ファイル（`vectors/signbytes-kat-v3.1.98.json`）に対してテストされています。チェックされるエントリーポイントでは、空のチェーン ID は拒否されます。どのチェーンにも紐づかないバイト列は、どのネットワークでも検証されないためです。
* **ネットワークの署名対象バイト列バージョンは純粋関数で決まります。** ネットワークは一度にちょうど 1 つの形式を検証し、v2 への切り替えは 2 つのプラン名で適用されました（メインネットでは高さ 2,981,742 の `v3.2.0`、テストネットでは `v3.1.98`）。`SIGN_BYTES_V2_UPGRADES` は両方の名前を列挙し、`signBytesVersionForApplied(chainId, appliedHeights)` は、ノードから読み取った適用済みの高さから `v1` または `v2` を返します。片方の名前だけを問い合わせると、もう一方の名前で切り替わったネットワークを読み誤ることになります。
* **厳格な入力チェック。** `verify` は例外をスローしません。長さの誤った鍵や署名、その他の不正な入力に対しては `false` を返します。`keygen(seed)`、`sign`、`encapsulate`、`decapsulate` は、不正な引数とその期待される長さを示すエラーをスローします。
* **純粋な JavaScript で、ネイティブコードなし。** npm パッケージは、WebAssembly やアドオンなしで Node とブラウザの両方で動作します。リポジトリ自身の測定（0.2.3、1.5 KB のメッセージ、1 コア、Apple シリコンのノート PC）では、ML-DSA-87 の署名は JavaScript で約 8 ms、他の 5 つのバインディングで約 0.3 から 0.45 ms です。

## 使い方 {#how-to-use}

5 つのレジストリパッケージはすべて同じ操作を公開しています。`keygen`、`keygenFromSeed`（32 バイトのシード）、`sign`、`verify`、ML-KEM の `keygen`、`encapsulate`、`decapsulate`、`shake256`、`pubkeyHash`、そして署名対象バイト列のヘルパーです。ML-DSA-87 と ML-KEM-1024 がデフォルトで、レベル別のバリアント（44、65、87 および 512、768、1024）もそれらと並んでエクスポートされています。ML-DSA-87 の公開鍵は 2,592 バイト、署名は 4,627 バイトで、以下の例で出力されます。

### インストールとインポート {#install}

| 言語 | インストール | インポート |
| --- | --- | --- |
| TypeScript / JavaScript | `npm install @qorechain/pqc` | `import { mldsa } from "@qorechain/pqc"` |
| Python (3.9 以降) | `pip install qorechain-pqc` | `from qorpqc import mldsa` |
| Rust | `cargo add qorechain-pqc` | `use qorechain_pqc::mldsa;` |
| Go | `go get github.com/qorechain/qorechain-pqc/go` | `import pqc "github.com/qorechain/qorechain-pqc/go"` |
| Java | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | `import network.qorechain.pqc.Pqc;` |
| C | リポジトリから `c/` をビルド（静的ライブラリとヘッダー） | `qorechain_pqc.h` |

### 各言語での署名と検証 {#examples}

これらは開発者ハブのクイックスタートです。それぞれ、公開レジストリからインストールした後（Node 26、liboqs のある Python 3.12、Rust 1.95、Go 1.26、Gradle 9.6 の JDK 21）、2026年10月27日にそのまま実行し、公開鍵のサイズ、署名のサイズ、検証結果を出力しました: `2592 4627 true`（Python は `True` を出力）。いずれもネットワークや資金のある鍵は使用せず、C バインディングにはクイックスタートがありません。

TypeScript:

```ts
import { mldsa } from "@qorechain/pqc";

// ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
const seed = new Uint8Array(32).fill(7);
const { publicKey, secretKey } = mldsa.keygen(seed);

const message = new TextEncoder().encode("hello QoreChain");
const signature = mldsa.sign(secretKey, message); // deterministic by default
const ok = mldsa.verify(publicKey, message, signature);
console.log(publicKey.length, signature.length, ok);
```

Python:

```python
from qorpqc import mldsa

# ML-DSA-87 key pair. The Python binding generates keys from the system RNG
# (it does not take a seed); signing is deterministic by default.
public_key, secret_key = mldsa.keygen()

message = b"hello QoreChain"
signature = mldsa.sign(secret_key, message)
ok = mldsa.verify(public_key, message, signature)
print(len(public_key), len(signature), ok)
```

Rust:

```rust
use qorechain_pqc::mldsa;

fn main() {
    // ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
    let seed = [7u8; 32];
    let (pk, sk) = mldsa::default::keygen_from_seed(&seed);

    let message = b"hello QoreChain";
    let sig = mldsa::default::sign(&sk, message).expect("sign"); // deterministic
    let ok = mldsa::default::verify(&pk, message, &sig);
    println!("{} {} {}", pk.len(), sig.len(), ok);
}
```

Go:

```go
package main

import (
	"bytes"
	"fmt"

	pqc "github.com/qorechain/qorechain-pqc/go"
)

func main() {
	// ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
	pk, sk, _ := pqc.MLDSA.KeygenFromSeed(bytes.Repeat([]byte{7}, 32))

	message := []byte("hello QoreChain")
	sig, _ := pqc.MLDSA.Sign(sk, message) // deterministic
	fmt.Println(len(pk), len(sig), pqc.MLDSA.Verify(pk, message, sig))
}
```

Java（`PqcQuickstart.java` として保存）:

```java
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import network.qorechain.pqc.Pqc;

public class PqcQuickstart {
    public static void main(String[] args) {
        // ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
        // In the Java binding the secret key IS the 32-byte seed.
        byte[] seed = new byte[32];
        Arrays.fill(seed, (byte) 7);
        byte[][] kp = Pqc.mldsaKeygenFromSeed("ml-dsa-87", seed); // {publicKey, secretKey}

        byte[] message = "hello QoreChain".getBytes(StandardCharsets.UTF_8);
        byte[] sig = Pqc.mldsaSign("ml-dsa-87", kp[1], message); // deterministic
        boolean ok = Pqc.mldsaVerify("ml-dsa-87", kp[0], message, sig);
        System.out.println(kp[0].length + " " + sig.length + " " + ok);
    }
}
```

固定シード（32 バイト、各バイトの値は 7）は例にすぎません。実際の鍵には、ランダムなシード、または[ポスト量子署名](/developer-guide/post-quantum-signing#key-derivation)で説明している鍵導出を使用してください。

### ヘッジ署名 {#hedged}

`sign` が行うのは決定論的な署名です。ランダム化された署名をオプトインするには、明示的なバリアントを呼び出します。たとえば JavaScript では `mldsa.sign(secretKey, message, { hedged: true })`、Python では `mldsa.sign(secret_key, message, hedged=True)` です。毎回異なる署名が欲しい場合にのみ使用してください。チェーンは両方を受け付け、どちらを選んだかが原因で `pqc` コード 21（`hybrid_verify_failed`）が発生することはありません（[トラブルシューティング一覧](/developer-guide/post-quantum-signing#code-21)を参照）。

### 署名対象バイト列の形式を選ぶ {#sign-bytes}

ノードにどのアップグレード名が適用されているかを問い合わせ、その後でライブラリに判断させます。これはパッケージ README にある JavaScript の形式で、他のバインディングも同じ名前を各言語のスタイルでエクスポートしています。

```ts
import { SIGN_BYTES_V2_UPGRADES, signBytesVersionForApplied, hybridSignBytes } from "@qorechain/pqc";

const applied: Record<string, string> = {};
for (const name of SIGN_BYTES_V2_UPGRADES) {
  const r = await fetch(`${rest}/cosmos/upgrade/v1beta1/applied_plan/${name}`).then((x) => x.json());
  applied[name] = r.height; // "0" means not applied
}
const version = signBytesVersionForApplied(chainId, applied); // "v1" or "v2"
const signBytes = hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfoBytes);
```

`rest` は、メインネット（`qorechain-vladi`）では `https://api.qore.host`、テストネット（`qorechain-diana`）では `https://api-testnet.qore.host` です。現在、両方のネットワークが v2 を検証します。ほとんどのアプリケーションでは、これを手作業で行う必要はありません。SDK と QoreSign がネットワークごとに形式を解決します。

## アクセス方法 {#how-to-access}

* **ライブラリを使うためにネットワーク、アカウント、鍵は必要ありません。** オフラインで動作します。作成したキーペアは単なる鍵にすぎません。QoreChain で使うには、アカウントが公開鍵を一度登録する必要があり（[ポスト量子署名](/developer-guide/post-quantum-signing#pqc-key-registration)を参照）、その後の Cosmos レーンのトランザクションには、secp256k1 署名と ML-DSA-87 署名（ハイブリッド）が必要です。
* **ネットワーク。** 署名対象バイト列のヘルパーとベクターは、メインネット `qorechain-vladi`（v3.2.4）とテストネット `qorechain-diana`（v3.2.6）に一致します。エンドポイントについては[ネットワーク](/appendix/networks)を参照してください。
* **Python には liboqs 共有ライブラリが必要です。** `pip install qorechain-pqc` は `liboqs-python` に依存しており、これは liboqs がない場合に初回インポート時にビルドします。そのためマシンに `git`、CMake、C コンパイラが必要です。ロックダウンされた環境では、システムのパッケージマネージャーから liboqs をインストールするか、事前にビルドしてください。Python バインディングはシステムの乱数生成器から鍵を読み取り、0.2.3 ではシードによる鍵生成がありません。
* **Go には Go 1.25 以降が必要です**（0.2.1 以降の要件で、CIRCL 1.6.5 以降も必要です）。
* **Java** は JDK 21 で実行されています。Java バインディングの ML-DSA 秘密鍵は 32 バイトの FIPS 204 シードで、他のバインディングが使う 4,896 バイトの展開済み鍵ではありません。それ以外の入力は拒否されます。
* **Java における Bouncy Castle の固定。** Java バインディングは 0.2.3 以降、Bouncy Castle 1.85 上に構築されています（以前のリリースは、勧告が公開されている古いバージョンを使用していましたが、バインディングが呼び出す ML-DSA または ML-KEM のコードには該当しませんでした）。プロジェクトの変更履歴によれば、1.85 は `org.bouncycastle.pqc.crypto` クラスを引き続き含む最新の Bouncy Castle リリースです。そのため、ビルドは 1.85 のままにし、別の依存関係に新しいリリースを引き込ませる前にテストしてください。以降のリリースにはそれらのクラスが含まれていません。
* **コスト。** 無料で、Apache-2.0 のオープンソースです。署名と検証にコストはかかりません。得られた署名をオンチェーンで使用する際は、通常の手数料（下限はガス 1 単位あたり 0.1 uqor）がかかります。

## 公開場所 {#where-published}

| レジストリ | パッケージ | バージョン | リンク |
| --- | --- | --- | --- |
| npm | `@qorechain/pqc` | 0.2.3 | https://www.npmjs.com/package/@qorechain/pqc |
| PyPI | `qorechain-pqc`（インポート名 `qorpqc`） | 0.2.3 | https://pypi.org/project/qorechain-pqc/ |
| crates.io | `qorechain-pqc` | 0.2.3 | https://crates.io/crates/qorechain-pqc |
| Go モジュールプロキシ | `github.com/qorechain/qorechain-pqc/go` | v0.2.3（タグ `go/v0.2.3`） | https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go |
| Maven Central | `io.github.qorechain:qorechain-pqc` | 0.2.3 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc |
| C | ソースのみ、パッケージレジストリなし | タグ `v0.2.3` | https://github.com/qorechain/qorechain-pqc |

ソース: https://github.com/qorechain/qorechain-pqc（フォルダ `js`、`python`、`rust`、`go`、`java`、`c`、`vectors`）。すべてのパッケージは Apache-2.0 です。バージョンは 2026年10月27日に各レジストリから読み取りました。鍵導出とローテーションを含む、同じライブラリの概念ガイドは[ポスト量子署名](/developer-guide/post-quantum-signing)です。これを使用する SDK については [SDK の概要](/sdk/overview)で説明しています。

## 制限と既知の問題 {#limits}

* **ウォレットやクライアントではなく、プリミティブのライブラリです。** 鍵の登録、トランザクションの構築、ブロードキャスト、チェーンの読み取りは行いません。そのためには [SDK](/sdk/overview) または [QoreSign](/qoresign/overview) を使用してください。
* **Python と C はシードから鍵を生成できません。** どちらも liboqs を基盤としており、これはシステムの乱数生成器から鍵を取得します。それらのベクターテストでは、代わりに展開済みの秘密鍵を使用します。
* **Java の秘密鍵はシードです。** ML-DSA の秘密鍵を Java と他のバインディングの間で移動するコードは変換が必要です。Java の値は 32 バイトのシードで、他のバインディングは ML-DSA-87 では 4,896 バイトの展開済み鍵です。
* **Python バインディングは、liboqs がまだインストールされていない場合、初回に C ツールチェーンが必要です。** Python のクイックスタートは、liboqs が既にある状態で実行されました。
* **C バインディングにはレジストリパッケージも、テスト済みのクイックスタートもありません。** リポジトリからビルドしてください。liboqs と OpenSSL が必要です。
* **鍵サイズは標準によって固定されています。** ML-DSA-87 の署名は 4,627 バイト、公開鍵は 2,592 バイトで、標準に適合するより小さな形式はありません。
* **古いリリース。** 0.2.1 以降を使用してください。0.2.0 でバージョン対応の `hybridSignBytes` が導入され（以前の 2 引数形式は現在 `hybridSignBytesV1`）、0.2.1 で両方のアップグレードプラン名が追加されました。0.2.2 と 0.2.3 はドキュメントと依存関係のバージョンを変更しており、出力は同一です。
* **ハイブリッドでの利用には、もう半分が必要です。** ハイブリッド署名には secp256k1 署名も含まれます。このライブラリが生成するのは ML-DSA の半分だけです。アカウント、登録、EVM 認可ウィンドウは、[ポスト量子署名](/developer-guide/post-quantum-signing)と [EVM ガイド](/developer-guide/evm-development#evm-window)に記載されたチェーンのルールです。
