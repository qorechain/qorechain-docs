---
slug: /sdk/concepts/accounts-pqc
title: アカウントと PQC 署名
sidebar_label: アカウントと PQC
sidebar_position: 2
---

# アカウントと PQC 署名

QoreChain のアカウントは、1 つの BIP-39 ニーモニックから導出されます。アカウントモデルは 2 種類あり、どちらも完全にサポートされています。

- **レーン別 HD 導出（レガシー／デフォルト）** — 同一のニーモニックから、独立した導出パスを介して、ネイティブ（コインタイプ 118）、EVM（コインタイプ 60）、SVM（コインタイプ 501）の各アカウントが生成されます。3 つの鍵、3 つのアドレスです。
- **統合 eth ネイティブアカウント**（SDK 0.6.0、チェーン v3.1.83） — 1 つの
  `eth_secp256k1` 鍵が 1 つの 20 バイトのアイデンティティとなり、3 つのアドレスエンコーディングすべてとして表現され、残高は 1 つに共有されます。詳細は
  [統合アカウント](#unified-accounts)を参照してください。

## HD 導出（レガシー／デフォルト、コインタイプ 118）

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

ニーモニックは、鍵が導出される前に（単語**と**チェックサムの両方が）検証されるため、タイプミスがあっても誤ったアカウントが黙って生成されることはなく、例外が発生します。`validateMnemonic(mnemonic)` で明示的に検証することもできます。

### 導出スキーム

| 種類 | 曲線 | パス | アドレス |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | `ripemd160(sha256(pubkey))` の bech32 `qor` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`、EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | 32 バイト公開鍵の base58 |

追加のアカウントを導出するには、アカウントインデックスを渡します。TypeScript の場合:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

Python/Go/Rust では、インデックスは位置引数です
（`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`）。

### 既知応答テストに関する注記

導出スキームは決定論的であり、4 つの SDK すべてで既知応答（known-answer）テストによってカバーされています。そのため、同じニーモニックからは TypeScript、Python、Go、Rust のいずれでも同一のアドレスが生成されます。これにより、ある言語で導出し、別の言語で検証することができます。

> このレーン別導出（コインタイプ 118 の `deriveNativeAccount`、および
> `deriveEvmAccount` / `deriveSvmAccount`）は**レガシー／デフォルト**のモデルであり、
> 引き続きサポートされ、変更はありません。以下の統合アカウントは、追加の
> オプトイン型アイデンティティモデルです。

## 統合アカウント（eth ネイティブ） {#unified-accounts}

SDK **0.6.0**（チェーン v3.1.83）以降、`deriveUnifiedAccount(mnemonic, index = 0)`
は Ethereum の HD パス `m/44'/60'/0'/0/{index}` 上で 1 つの `eth_secp256k1` 鍵を導出します。その 20 バイトのアドレス（`keccak256(pubkey)[12:]`）は、同一のアイデンティティを 3 通りに表現したものです:

| レーン | エンコーディング |
| --- | --- |
| Native | `qor` プレフィックス付き bech32（`qor1…`） |
| EVM | `0x` + EIP-55 大文字小文字混在チェックサム 16 進数 |
| SVM | 20 バイトの右側を 12 個のゼロバイトでパディングしたもの（32 バイト）の base58 |

3 つのうち**どの**レーンへの入金も**1 つ**の残高に入り、その鍵はすべてのレーンで支払いに使えます:

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  addressesFrom20,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);

account.cosmos;       // "qor1…"   bech32, Native lane
account.evm;          // "0x…"     EIP-55 hex, EVM lane
account.svm;          // "<base58>" 32-byte SVM address (addr20 + 12 zero bytes)
account.addressBytes; // the raw 20 bytes shared by all three
account.publicKey;    // 33-byte compressed secp256k1 public key
account.pqc;          // { publicKey, secretKey } — ML-DSA-87, derived below

// Decode any ONE encoding into all three:
const all = qoreAddresses({ evm: account.evm });
all.cosmos; // qor1…
all.svm;    // base58

// or straight from the raw 20 bytes:
const same = addressesFrom20(account.addressBytes);
```

`unifiedAccountFromSeed(seed32)` は、生の 32 バイト secp256k1 秘密鍵から同じことを行います。

### PQC シードの導出

アカウントの ML-DSA-87 鍵ペアは、決定論的に、かつ**アドレスに紐付けて**導出されます:

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

そのため `{ address, mnemonic }` から復元可能であり、QoreChain のすべての言語 SDK で同一になります。（`unifiedAccountFromSeed` の場合、ニーモニックのスロットには
`"seed:" + hex(seed32)` が入ります。）

### eth 鍵による Native レーンでの送金

統合アカウントは、Native パスのトランザクションを `eth_secp256k1` スキームで署名します。すなわち、古典署名は SignDoc バイト列の **keccak256** に対する secp256k1 署名であり（sha256 ではありません）、`SignerInfo` の公開鍵にはタイプ URL
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey` が使われます。ハイブリッドパス
（`signHybridEth`）は、さらに ML-DSA-87 の `PQCHybridSignature`
拡張を付加します — これは稼働中のネットワークで必須です:

```ts
import { EthNativeSigner, deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
const signer = new EthNativeSigner(account); // signMode: "hybrid" by default

// `transport` is anything with broadcastTx (e.g. a connected client).
await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: "1000000" }], // 1 QOR
  { chainId: "qorechain-vladi", accountNumber, sequence, fee },
);
```

より低レベルの制御が必要な場合、`signHybridEth(params)` / `signClassicalEth(params)`
は組み立て済みの `TxRaw` バイト列と署名アーティファクトを返し、
`accountAuthInfo(baseAccount)` は、オンチェーンの公開鍵が `eth_secp256k1` タイプ URL を使用するアカウントから `account_number` / `sequence` を読み取ります。古典署名のみのパスは、1 回限りでブートストラップ免除の
`MsgRegisterPQCKeyV2` 専用です。それ以外のすべてにはハイブリッドを使用してください。

:::caution ハイブリッドトランザクションには SDK 0.6.1 以降へのアップグレードが必要です
SDK **0.6.1** は、コンセンサスクリティカルなエンコーディングのバグを修正しました:
`/qorechain.pqc.v1.PQCHybridSignature` の tx-body 拡張が JSON シリアライズされて
`Any.value` に格納されており、チェーンは**それらのトランザクションを CheckTx で拒否**していました
（tx パースエラー）。現在は 5 つの言語すべてで protobuf エンコード（拡張の値が
`0x08` で始まる形式）になっています。SDK ≤ 0.6.0 で構築されたハイブリッドトランザクションは —
eth ネイティブレーンを含め — オンチェーンで拒否されます。0.6.1 以降にアップグレードしてください。
:::

### Phantom（P1a）: 鍵をエクスポートせずに統合アカウントを作る

`connectPhantomUnified()`（TypeScript）は、決定論的な Phantom 署名から、正準的で**ノンカストディアル**な統合アカウントを導出します。ユーザーが固定のドメイン分離済みメッセージに Phantom の ed25519 鍵で署名し、
`shake256(signature, 32)` がアカウントのシードとなります。

```ts
import {
  connectPhantomUnified,
  unifiedAccountFromPhantomSignature,
} from "@qorechain/sdk";

// In the browser (uses window.solana):
const account = await connectPhantomUnified();

// Or, given a raw signature you already have:
const same = unifiedAccountFromPhantomSignature(signatureBytes);
```

導出されたアカウントは、Phantom の ed25519 鍵とは別の正準鍵です —
Phantom が、導出された secp256k1/PQC の秘密情報を目にすることはありません。Phantom の鍵自体に、制限付きでこのアカウントからの支出を許可する方法については、
[Authenticator と委任支出](/sdk/guides/authenticators)を参照してください。

## 耐量子暗号（PQC）

QoreChain は **ML-DSA-87**（Dilithium-5、FIPS 204）署名をサポートしています。SDK はそのプリミティブを直接公開しています。

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

エクスポートされている長さ定数（`ML_DSA_87_PUBLIC_KEY_LENGTH`、
`ML_DSA_87_SECRET_KEY_LENGTH`、`ML_DSA_87_SIGNATURE_LENGTH`、
`ML_DSA_87_SEED_LENGTH`）により、バッファサイズを検証できます。

> 内部的には、PQC プリミティブは [**qorechain-pqc**](/developer-guide/post-quantum-signing) に由来します。これは、監査済みの FIPS-204/203/202 実装を、6 つの言語（JavaScript/TypeScript、Rust、Go、C、Python、Java）にわたる一貫した 1 つの API の背後にラップした、オープンソースかつ標準準拠のみのライブラリです。SDK の外で生のプリミティブや `hybridSignBytes` フレーミングが必要な場合は、これを直接利用してください。

### プラガブルな Signer

コンポジションのために、SDK は `Signer` 抽象に加えて、`PqcSigner` と
`HybridSigner` の実装、そして `SignatureMode` 列挙型を提供しています。プリミティブを直接呼び出すのではなく、PQC 署名を独自のフローに組み込みたい場合に使用してください。

## ハイブリッド署名 {#hybrid-signing}

**ハイブリッド**トランザクションは、古典的な secp256k1 署名と
ML-DSA-87 署名の両方を含むため、古典的な検証のもとで有効性を保ちながら、耐量子保護も得られます。耐量子部分は、トランザクション上の
`PQCHybridSignature` 拡張として伝送されます。

:::caution Native パスではハイブリッド署名が必須です
現在のチェーンバージョン（**v3.1.85**）時点で、ネットワークのデフォルトは
`hybrid_signature_mode = required` かつ `allow_classical_fallback = false` です。
`buildHybridTx`（`includePqcPublicKey` 付き）によるハイブリッド署名 — 統合 eth ネイティブアカウントの場合は
`signHybridEth` — は、Native パスのトランザクションでは**必須**であり、古典署名のみの Native トランザクションはオンチェーンで拒否されます。EVM トランザクションは別の `eth_secp256k1` パスを使用するため、影響を受けません。
:::

:::caution SDK ≤ 0.6.0 のハイブリッドトランザクションは拒否されます
0.6.1 リリースは、`PQCHybridSignature` 拡張のエンコーディングを修正しました
（JSON → protobuf、コンセンサスクリティカル）。SDK
0.6.0 以前で構築されたハイブリッドトランザクションは、CheckTx で tx パースエラーとなり失敗します — 0.6.1 以降にアップグレードしてください。
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

### オンチェーンでの前提条件

ハイブリッドトランザクションがオンチェーンで PQC 検証されるためには、署名者の PQC 公開鍵が、チェーンの `MsgRegisterPQCKey` を通じて事前に**登録**されている必要があります — ただし
`includePqcPublicKey: true` を設定した場合は例外で、鍵が拡張に埋め込まれるため、チェーンは初回使用時に自動登録できます。

### ハイブリッド tx のコントラクト（概要）

トランザクションは、標準の署名対象バイト列（PQC 拡張を**含みません**）に対して古典的に署名され、ML-DSA-87 署名が計算されて
`PQCHybridSignature` 拡張として付加されます。古典署名の対象バイト列は拡張を含まないため、検証者が PQC 部分を理解できるかどうかにかかわらず、古典署名は有効なままです。低レベルのヘルパー
（`encodeHybridExtension`、`attachHybridExtension`、
`buildHybridSignatureExtension`、`HYBRID_SIG_TYPE_URL`）と、エンドツーエンドのビルダー
（`buildHybridTx`、`signAndBroadcastHybrid`）は、高度な用途向けにエクスポートされています。

> 稼働中のネットワークでは、cosmos トランザクションについてハイブリッドトランザクションの送信が必須のパスです。ローカルの署名／検証プリミティブと tx 構築ヘルパーは、現在利用可能です。

## PQC 鍵ローテーション

SDK 0.7.0 以降、アカウントは自身の ML-DSA-87 鍵を**同じアルゴリズム**の新しい鍵にローテーションできます — 正準的には、レガシーな `shake256(mnemonic)` 鍵をアドレスに紐付いた `shake256("qorechain:pqc:v1|addr|mnemonic")` 鍵に移行するもので、
`rotatePqcKeyMsgFromMnemonic` を介して行います（両方の鍵がローテーションバイト列にデュアル署名します）。完全な例については、Authenticator ガイドの
[鍵ローテーション](/sdk/guides/authenticators#key-rotation)を参照してください。

## アルゴリズム識別子

SDK は、プロトコルレベルの作業のためにアルゴリズム ID とヘルパーをエクスポートしています:
`AlgorithmUnspecified`、`AlgorithmDilithium5`、`AlgorithmMLKEM1024`、
`algorithmName(id)`、`isSignatureAlgorithm(id)`。
