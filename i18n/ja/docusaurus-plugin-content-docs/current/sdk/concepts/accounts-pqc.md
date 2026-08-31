---
slug: /sdk/concepts/accounts-pqc
title: アカウントとPQC署名
sidebar_label: アカウントとPQC
sidebar_position: 2
---

# アカウントとPQC署名

QoreChainのアカウントは、単一のBIP-39ニーモニックから導出されます。アカウントモデルには2種類あり、どちらも完全にサポートされています。

- **レーンごとのHD導出(レガシー/デフォルト)** — 同じニーモニックから、ネイティブ(コインタイプ118)、EVM(コインタイプ60)、SVM(コインタイプ501)の各アカウントが、それぞれ独立した導出パスを介して生成されます。3つの鍵、3つのアドレスです。
- **統一eth-nativeアカウント**(SDK 0.6.0、チェーンv3.1.83) — 1つの`eth_secp256k1`鍵が、1つの20バイトのアイデンティティとして3種類すべてのアドレスエンコーディングで表現され、残高も1つに共有されます。[統一アカウント](#unified-accounts)を参照してください。

## HD導出(レガシー/デフォルト、コインタイプ118)

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

ニーモニックは、鍵が導出される前に(単語とチェックサムの両方が)検証されるため、タイプミスがあった場合は誤ったアカウントを黙って生成するのではなくエラーになります。`validateMnemonic(mnemonic)`で明示的に検証することもできます。

### 導出方式

| タイプ | 曲線 | パス | アドレス |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | `ripemd160(sha256(pubkey))`のbech32(`qor`) |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`、EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | 32バイト公開鍵のbase58 |

アカウントインデックスを渡すことで、追加のアカウントを導出できます。TypeScriptの場合。

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

Python/Go/Rustでは、インデックスは位置引数です
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`)。

### 既知回答テストに関する注記

これらの導出方式は決定論的であり、4つすべてのSDKにわたる既知回答テスト(known-answer tests)でカバーされているため、同じニーモニックはTypeScript、Python、Go、Rustのいずれでも同一のアドレスを生成します。これにより、ある言語で導出し、別の言語で検証することができます。

> このレーンごとの導出(コインタイプ118での`deriveNativeAccount`、および
> `deriveEvmAccount` / `deriveSvmAccount`)は**レガシー/デフォルト**モデルであり、
> 引き続きサポートされ、変更はありません。以下の統一アカウントは追加の、
> オプトインのアイデンティティモデルです。

## 統一アカウント(eth-native) {#unified-accounts}

SDK **0.6.0**(チェーンv3.1.83)以降、`deriveUnifiedAccount(mnemonic, index = 0)`は、
EthereumのHDパス`m/44'/60'/0'/0/{index}`上に1つの`eth_secp256k1`鍵を導出し、
その20バイトのアドレス(`keccak256(pubkey)[12:]`)は同一のアイデンティティを
3通りの方法で表現します。

| レーン | エンコーディング |
| --- | --- |
| Native | `qor`プレフィックスのbech32(`qor1…`) |
| EVM | `0x` + EIP-55混在ケースチェックサム16進 |
| SVM | 20バイトを12個のゼロバイトで右パディングした(32バイト)base58 |

3つのレーンの**いずれか**への入金は**1つの**残高に反映され、その鍵はすべてのレーンで
使用できます。

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

`unifiedAccountFromSeed(seed32)`は、生の32バイトsecp256k1秘密鍵から同じ処理を行います。

### PQCシード導出

アカウントのML-DSA-87鍵ペアは決定論的に導出され、**アドレスに紐付けられます**。

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

これにより`{ address, mnemonic }`から復元可能であり、QoreChainの全言語SDKで同一です。
(`unifiedAccountFromSeed`の場合、ニーモニックの位置には`"seed:" + hex(seed32)`が入ります。)

### eth鍵によるNativeレーンでの送金

統一アカウントは、`eth_secp256k1`方式でNativeパスのトランザクションに署名します。
古典的な署名は、SignDocバイト列の(sha256ではなく)**keccak256**に対するsecp256k1署名であり、
`SignerInfo`の公開鍵は型URL`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`を使用します。
ハイブリッドパス(`signHybridEth`)はさらに、ML-DSA-87の`PQCHybridSignature`拡張を
付加します — これは稼働中のネットワークでは必須です。

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

より低レベルの制御が必要な場合、`signHybridEth(params)` / `signClassicalEth(params)`は
組み立て済みの`TxRaw`バイト列と署名アーティファクトを返し、`accountAuthInfo(baseAccount)`は
オンチェーンの公開鍵が`eth_secp256k1`型URLを使用しているアカウントから`account_number` /
`sequence`を読み取ります。古典署名のみのパスは、1回限りでブートストラップ免除対象の
`MsgRegisterPQCKeyV2`用です。それ以外のすべての用途にはハイブリッドを使用してください。

:::caution ハイブリッドトランザクションにはSDK 0.6.1以降が必要です
SDK **0.6.1**は、コンセンサスに関わる重大なエンコーディングのバグを修正しました。
`/qorechain.pqc.v1.PQCHybridSignature`のtx-body拡張がJSONとして`Any.value`に
シリアライズされており、チェーンは**CheckTxの段階でそれらのトランザクションを
拒否していました**(txパースエラー)。現在は5つすべての言語でprotobufエンコーディング
(拡張値は`0x08`で始まる)になっています。SDK 0.6.0以前でビルドされたハイブリッド
トランザクション(eth-nativeレーンを含む)はすべてオンチェーンで拒否されます。
0.6.1以降にアップグレードしてください。
:::

### Phantom(P1a):鍵をエクスポートせずに統一アカウントを使う

`connectPhantomUnified()`(TypeScript)は、決定論的なPhantom署名から正規の
**ノンカストディアル**な統一アカウントを導出します。ユーザーはPhantomのed25519鍵で
固定のドメイン分離済みメッセージに署名し、`shake256(signature, 32)`がアカウントの
シードになります。

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

導出されたアカウントは、Phantomのed25519鍵とは別個の正規鍵です — Phantomは導出された
secp256k1/PQCの秘密情報を一切見ることがありません。Phantomの鍵自体に、制限付きで
このアカウントから支払わせたい場合は、[オーセンティケーターと委任支払い](/sdk/guides/authenticators)を参照してください。

## ポスト量子暗号(PQC)

QoreChainは**ML-DSA-87**(Dilithium-5、FIPS 204)署名をサポートしています。SDKは
このプリミティブを直接公開しています。

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

エクスポートされている長さ定数(`ML_DSA_87_PUBLIC_KEY_LENGTH`、
`ML_DSA_87_SECRET_KEY_LENGTH`、`ML_DSA_87_SIGNATURE_LENGTH`、
`ML_DSA_87_SEED_LENGTH`)を使うと、バッファサイズを検証できます。

> 内部的には、PQCプリミティブは[**qorechain-pqc**](/developer-guide/post-quantum-signing) — 監査済みのFIPS-204/203/202実装を6言語(JavaScript/TypeScript、Rust、Go、C、Python、Java)にわたり一貫したAPIでラップした、オープンソースかつ標準準拠のライブラリ — に由来します。SDKの外でプリミティブそのものや`hybridSignBytes`のフレーミングが必要な場合は、これを直接利用してください。

### プラガブルな署名者(Signer)

構成のために、SDKは`Signer`抽象化と、それを実装した`PqcSigner`および
`HybridSigner`、そして`SignatureMode`列挙型を提供します。プリミティブを直接
呼び出すのではなく、PQC署名を独自のフローに組み込みたい場合はこれらを使用してください。

## ハイブリッド署名 {#hybrid-signing}

**ハイブリッド**トランザクションは、古典的なsecp256k1署名とML-DSA-87署名の
両方を持つため、古典的な検証の下でも有効なまま、ポスト量子保護を得られます。
ポスト量子部分は、トランザクションの`PQCHybridSignature`拡張として運ばれます。

:::caution Nativeパスではハイブリッド署名が必須です
現在のチェーンバージョン(**v3.1.95**)の時点で、ネットワークのデフォルトは
`hybrid_signature_mode = required`、`allow_classical_fallback = false`です。
`buildHybridTx`(`includePqcPublicKey`を伴う)によるハイブリッド署名 — または
統一eth-nativeアカウント向けの`signHybridEth` — は、Nativeパスのトランザクションで
**必須**です。古典署名のみのNativeトランザクションはオンチェーンで拒否されます。
EVMトランザクションは別系統の`eth_secp256k1`パスを使用しており、影響を受けません。
:::

:::caution SDK 0.6.0以下のハイブリッドトランザクションは拒否されます
0.6.1リリースは、`PQCHybridSignature`拡張のエンコーディング(JSON→protobuf、
コンセンサスに関わる重大な変更)を修正しました。SDK 0.6.0以前でビルドされた
ハイブリッドトランザクションは、CheckTxの段階でtxパースエラーとして失敗します —
0.6.1以降にアップグレードしてください。
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

ハイブリッドトランザクションがオンチェーンでPQC検証されるためには、あらかじめ
署名者のPQC公開鍵がチェーンの`MsgRegisterPQCKey`を介して**登録済み**である必要が
あります — *ただし*、`includePqcPublicKey: true`を設定した場合は例外で、鍵が拡張に
埋め込まれるため、チェーンは初回使用時に自動登録できます。

### ハイブリッドtxの契約(概要)

トランザクションは、標準の(PQC拡張を**含まない**)署名対象バイト列に対して古典的に
署名され、ML-DSA-87署名が計算されて`PQCHybridSignature`拡張として付加されます。
古典署名対象バイト列が拡張を含まないため、検証者がPQC部分を理解するかどうかに
かかわらず、古典署名は有効なままです。低レベルのヘルパー(`encodeHybridExtension`、
`attachHybridExtension`、`buildHybridSignatureExtension`、`HYBRID_SIG_TYPE_URL`)と、
エンドツーエンドのビルダー(`buildHybridTx`、`signAndBroadcastHybrid`)がエクスポート
されており、高度な用途に利用できます。

> ハイブリッドトランザクションの送信は、cosmosトランザクションについて稼働中のネットワークで
> 必須のパスです。ローカルでの署名/検証プリミティブとtx構築ヘルパーは、現時点で
> 利用可能です。

## PQC鍵ローテーション

SDK 0.7.0以降、アカウントはML-DSA-87鍵を**同一アルゴリズム**の新しい鍵に
ローテーションできます — レガシーな`shake256(mnemonic)`鍵から、アドレスに
紐付いた`shake256("qorechain:pqc:v1|addr|mnemonic")`鍵へと正規に移行するもので、
`rotatePqcKeyMsgFromMnemonic`を介して行います(両方の鍵がローテーションバイト列に
二重署名します)。完全な例については、Authenticatorsガイドの
[鍵ローテーション](/sdk/guides/authenticators#key-rotation)を参照してください。

## アルゴリズム識別子

SDKは、プロトコルレベルの作業向けにアルゴリズムIDとヘルパーをエクスポートしています。
`AlgorithmUnspecified`、`AlgorithmDilithium5`、`AlgorithmMLKEM1024`、
`algorithmName(id)`、`isSignatureAlgorithm(id)`です。
