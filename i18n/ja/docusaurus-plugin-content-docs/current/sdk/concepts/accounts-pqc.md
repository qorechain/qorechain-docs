---
slug: /sdk/concepts/accounts-pqc
title: アカウントと PQC 署名
sidebar_label: アカウントと PQC
sidebar_position: 2
---

# アカウントと PQC 署名

QoreChain のアカウントは、単一の BIP-39 ニーモニックから導出されます。同じニーモニックから、独立した導出パスを通じてネイティブ、EVM、SVM のアカウントが得られます。

## HD 導出

```ts
import {
  generateMnemonic,
  validateMnemonic,
  deriveNativeAccount,
  deriveEvmAccount,
  deriveSvmAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words; pass 256 for 24 words

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (secp256k1, bech32)

const evm = await deriveEvmAccount(mnemonic);
console.log(evm.address); // "0x..."   (EIP-55 checksummed)

const svm = await deriveSvmAccount(mnemonic);
console.log(svm.address); // base58 ed25519 public key
```

ニーモニックは、いずれかの鍵が導出される前に（単語 **および** チェックサムが）検証されるため、タイプミスは静かに誤ったアカウントを生成するのではなくエラーを発生させます。`validateMnemonic(mnemonic)` で明示的に検証することもできます。

### 導出スキーム

| 種類 | 曲線 | パス | アドレス |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | `ripemd160(sha256(pubkey))` の bech32 `qor` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`、EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | 32 バイト公開鍵の base58 |

追加のアカウントを導出するには、アカウントインデックスを渡します。TypeScript では:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

Python/Go/Rust では、インデックスは位置引数です
（`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`）。

### 既知解についての注記

導出スキームは決定論的であり、4 つすべての SDK にわたる既知解テスト（known-answer test）でカバーされています。そのため、同じニーモニックは TypeScript、Python、Go、Rust で同一のアドレスを生成します。これにより、ある言語で導出し、別の言語で検証できます。

## ポスト量子暗号（PQC）

QoreChain は **ML-DSA-87**（Dilithium-5、FIPS 204）署名をサポートします。SDK はそのプリミティブを直接公開します。

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  ML_DSA_87_PUBLIC_KEY_LENGTH,
  ML_DSA_87_SIGNATURE_LENGTH,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("hello");

const signature = pqcSign(keypair.secretKey, message);
const ok = pqcVerify(keypair.publicKey, message, signature);
```

エクスポートされた長さの定数（`ML_DSA_87_PUBLIC_KEY_LENGTH`、
`ML_DSA_87_SECRET_KEY_LENGTH`、`ML_DSA_87_SIGNATURE_LENGTH`、
`ML_DSA_87_SEED_LENGTH`）により、バッファサイズを検証できます。

> 内部では、PQC プリミティブは [**qorechain-pqc**](/developer-guide/post-quantum-signing) から提供されます。これは、監査済みの FIPS-204/203/202 実装を 6 言語（JavaScript/TypeScript、Rust、Go、C、Python、Java）にわたる 1 つの一貫した API の背後にラップした、オープンソースで標準のみのライブラリです。SDK の外部で生のプリミティブや `hybridSignBytes` のフレーミングが必要な場合は、これを直接利用してください。

### プラガブルなシグナー

合成のために、SDK は `Signer` 抽象化に加えて `PqcSigner` および `HybridSigner` の実装、そして `SignatureMode` 列挙型を提供します。プリミティブを直接呼び出すのではなく、PQC 署名を独自のフローに組み込みたい場合にこれらを使用してください。

## ハイブリッド署名

**ハイブリッド** トランザクションは、古典的な secp256k1 署名と ML-DSA-87 署名の両方を運びます。そのため、古典的な検証のもとで有効なまま、ポスト量子保護を獲得します。ポスト量子部分は、トランザクション上の `PQCHybridSignature` 拡張として運ばれます。

:::caution cosmos パスではハイブリッド署名が必須
現在のチェーンバージョン（**v3.1.82**）時点で、ネットワークのデフォルトは
`hybrid_signature_mode = required` かつ `allow_classical_fallback = false` です。
`buildHybridTx`（`includePqcPublicKey` を伴う）によるハイブリッド署名は、cosmos パスのトランザクションでは **必須** です — 古典的のみの cosmos トランザクションはオンチェーンで拒否されます。EVM トランザクションは別の `eth_secp256k1` パスを使用し、影響を受けません。
:::

```ts
import {
  buildHybridTx,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// buildHybridTx assembles a tx with BOTH a classical signature and an
// ML-DSA-87 signature attached as a PQCHybridSignature extension.
// (See packages/ts and the pqc-hybrid-sign example for the full call.)
```

### オンチェーンの前提条件

ハイブリッドトランザクションがオンチェーンで PQC 検証される前に、シグナーの PQC 公開鍵がチェーンの `MsgRegisterPQCKey` を通じて **登録** されている必要があります。*ただし* `includePqcPublicKey: true` を設定した場合は別です。これは鍵を拡張に埋め込み、チェーンが初回使用時に自動登録できるようにします。

### ハイブリッド tx の契約（高レベル）

トランザクションは、標準のサインバイト（PQC 拡張を **除外** する）に対して古典的に署名され、ML-DSA-87 署名が計算されて `PQCHybridSignature` 拡張として添付されます。古典的なサインバイトが拡張を除外するため、検証者が PQC 部分を理解するかどうかにかかわらず、古典的な署名は有効なままです。低レベルのヘルパー
（`encodeHybridExtension`、`attachHybridExtension`、
`buildHybridSignatureExtension`、`HYBRID_SIG_TYPE_URL`）とエンドツーエンドのビルダー
（`buildHybridTx`、`signAndBroadcastHybrid`）は、高度な用途向けにエクスポートされています。

> ハイブリッドトランザクションの提出は、ライブネットワーク上の cosmos トランザクションにおける必須のパスです。ローカルの署名/検証プリミティブと tx 構築ヘルパーは、本日より利用可能です。

## アルゴリズム識別子

SDK は、プロトコルレベルの作業向けにアルゴリズム ID とヘルパーをエクスポートします。
`AlgorithmUnspecified`、`AlgorithmDilithium5`、`AlgorithmMLKEM1024`、
`algorithmName(id)`、`isSignatureAlgorithm(id)` です。
