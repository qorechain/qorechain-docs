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

3つのレーンの**いずれか**への入金は**1つの**残高に反映され、その1つの鍵がすべての
レーンでの署名者になります(EVMレーンでは[認可ウィンドウ](/sdk/guides/evm#evm-window)の
内側で。SVMのトランザクションレーンは現在ネットワーク全体で無効化されているため、
SVMは現時点では読み取り専用です)。

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
account.publicKey;    // "0x…" hex string of the 33-byte compressed secp256k1 key
account.privateKey;   // "0x…" hex string (a secret: never log or commit it)
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
SDK 0.8.3以降、`derivePqcCanonical(account, mnemonic)`は、まず`account`を小文字の
`qor1…`形式(`canonicalAccount`)に解決するため、大文字のbech32や同じアカウントの
`0x`形式でも同じ鍵が得られます。
どの言語にも同じ関数があり(Python `derive_pqc_canonical`、Go
`authenticator.DerivePQCCanonical`、Rust `try_derive_pqc_canonical`、Java
`Authenticator.derivePqcCanonical`。[量子安全ガイドの表](/sdk/guides/quantum-safe#canonical-derivation)を参照)、
同じ`{ address, mnemonic }`からは、そのすべてで同じ鍵が得られます
(2026年10月にTypeScript、Python、Go、Rustで確認済み)。

### eth鍵によるNativeレーンでの送金

統一アカウントは、`eth_secp256k1`方式でNativeパスのトランザクションに署名します。
古典的な署名は、SignDocバイト列の(sha256ではなく)**keccak256**に対するsecp256k1署名であり、
`SignerInfo`の公開鍵は型URL`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`を使用します。
ハイブリッドパス(`signHybridEth`、またはデフォルトの`signMode: "hybrid"`を持つ`EthNativeSigner`)は
さらに、ML-DSA-87の`PQCHybridSignature`拡張を付加します。これは稼働中のネットワークでは
必須です。

最初のハイブリッド送金の前に、2つのことが必要です。1つ目は、アカウントのML-DSA-87鍵を
(1回だけ)**登録**しておくことです。登録は、古典署名で行われるハイブリッド免除の唯一の
トランザクションです。`signMode: "classical"`で署名してください。アカウントの`publicKey`は
`0x`で始まる16進文字列なので、`ecdsaPubkey`用にバイト列へデコードします。2つ目は、署名者に
`rest`を渡して、ネットワークがどの[署名対象バイト列の形式](#sign-bytes-versions)を検証するかを
問い合わせられるようにすることです(`qorechain-vladi`と`qorechain-diana`では、推測せずに
例外を投げます)。SDK 0.8.1以降(所有証明ヘルパーには0.9.0)と`npm i @cosmjs/stargate`が必要です。

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  buildRegisterPqcKeyMsg,
  signProofOfPossession,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";
const CHAIN_ID = "qorechain-vladi";

const client = createClient({ network: "mainnet", endpoints: { rest: REST, rpc: RPC } });
const transport = await StargateClient.connect(RPC);
const account = await deriveUnifiedAccount(mnemonic);

// The REST account record carries the number and sequence (the account must
// exist, that is, have received funds).
async function authInfo() {
  const { account: base } = await client.rest.get<{
    account: { account_number: string; sequence: string };
  }>(`/cosmos/auth/v1beta1/accounts/${account.cosmos}`);
  return { accountNumber: BigInt(base.account_number), sequence: BigInt(base.sequence) };
}

// 1) Register the ML-DSA-87 key once (classical-signed, exempt from the hybrid rule).
const classical = new EthNativeSigner(account, { signMode: "classical" });
await classical.signAndBroadcast(transport, {
  chainId: CHAIN_ID,
  ...(await authInfo()),
  messages: [
    buildRegisterPqcKeyMsg(account.cosmos, {
      pqcKeypair: account.pqc,
      ecdsaPubkey: Uint8Array.from(Buffer.from(account.publicKey.slice(2), "hex")),
      // Optional since v3.2.3 (SDK 0.9.0+): the new key signs a proof that its owner
      // holds the secret. Leave it out on a network that has not applied v3.2.3,
      // because an older node refuses the whole transaction when the field is set.
      proofOfPossession: signProofOfPossession({
        chainId: CHAIN_ID,
        account: account.cosmos,
        keypair: account.pqc,
      }),
    }),
  ],
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" }, // the 2,592-byte key needs about 600k gas
});

// 2) Send with the hybrid signature (the default signMode).
const signer = new EthNativeSigner(account, { rest: REST });
const res = await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: toBase("1.5") }],
  {
    chainId: CHAIN_ID,
    ...(await authInfo()),
    fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  },
);
console.log(res.transactionHash);
```

より低レベルの制御が必要な場合、`signHybridEth(params)` / `signClassicalEth(params)`は
組み立て済みの`TxRaw`バイト列と署名アーティファクトを返し、`accountAuthInfo(baseAccount)`は
オンチェーンの公開鍵が`eth_secp256k1`型URLを使用しているprotobufの`BaseAccount`から
`account_number` / `sequence`を読み取ります(REST JSONのアカウントは、上の`authInfo`のように、
先にフィールドをマッピングする必要があります)。

:::caution ハイブリッドトランザクションにはSDK 0.6.1以降が必要です
SDK **0.6.1**は、コンセンサスに関わる重大なエンコーディングのバグを修正しました。
`/qorechain.pqc.v1.PQCHybridSignature`のtx-body拡張がJSONとして`Any.value`に
シリアライズされており、チェーンは**CheckTxの段階でそれらのトランザクションを
拒否していました**(txパースエラー)。現在は5つすべての言語でprotobufエンコーディング
(拡張値は`0x08`で始まる)になっています。SDK 0.6.0以前でビルドされたハイブリッド
トランザクション(eth-nativeレーンを含む)はすべてオンチェーンで拒否されます。
0.6.1以降にアップグレードしてください。
:::

### Phantom とその他の外部ウォレット {#phantom}

:::danger SDK 0.8.0 で削除
SDK 0.6.0 から 0.7.0 には `connectPhantomUnified()` と `unifiedAccountFromPhantomSignature()`（0.8.0 で削除。Python と Rust: `unified_account_from_phantom_signature`、Go: `unified.UnifiedAccountFromPhantomSignature`、Java: `UnifiedAccounts.unifiedAccountFromPhantomSignature`）が含まれていました。これらは、固定メッセージ `QoreChain unified account derivation v1` とウォレットの base58 公開鍵に対する Phantom の署名から、アカウントの支払い鍵を導出していました。
ed25519 署名は決定論的であり、どの Web サイトでもウォレットに同じメッセージへの署名を求めることができます。そのため、その署名を一度でも入手した者は、アカウントの secp256k1 鍵と ML-DSA 鍵を再構築できます。両関数は現在、例外を投げます。

この方法でアカウントを作成した場合は、ただちに侵害されたものとして扱ってください。新しいニーモニックのアカウントを作成して資金を移し、その後 Phantom を新しいアカウントにオーセンティケーターとしてリンクしてください（下記）。古いアカウントは修復できません。アドレスが漏洩した鍵に結び付いており、PQC 鍵のローテーションはポスト量子の部分しか置き換えないためです。SDK 0.8.2 以降を使用してください。
:::

Phantom（または MetaMask）の鍵にアカウントから支払わせるには、**オーセンティケーターレーン**を使います。ウォレットの鍵を `MsgRegisterAuthenticator` で登録し、権限と `SpendingRule` の範囲内で `MsgExecuteCosmos` / `MsgExecuteEVM` を通じて正規の PQC アカウントから支払います。アカウントはニーモニックから導出した自身の鍵を保持し、ウォレットの鍵はいつでも取り消せます。[オーセンティケーターと委任支払い](/sdk/guides/authenticators)を参照してください。 なお、これらのレーンを提供する `abstractaccount` モジュールは現在両ネットワークで無効になっているため（`GET /qorechain/abstractaccount/v1/config` は `enabled: false` を返します）、ウォレットの鍵はまだリンクできません。それまでは新しいニーモニックのアカウントを直接使用してください。

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
`HybridSigner`、そして`SignatureMode`型(`"classical" | "pqc" | "hybrid"`)を
提供します。プリミティブを直接呼び出すのではなく、PQC署名を独自のフローに
組み込みたい場合はこれらを使用してください。

## ハイブリッド署名 {#hybrid-signing}

**ハイブリッド**トランザクションは、古典的なsecp256k1署名とML-DSA-87署名の
両方を持つため、古典的な検証の下でも有効なまま、ポスト量子保護を得られます。
ポスト量子部分は、トランザクションの`PQCHybridSignature`拡張として運ばれます。

:::caution Nativeパスではハイブリッド署名が必須です
チェーンバージョン**v3.2.0**(メインネットとテストネットはどちらもv3.2.4で稼働)以降、
ネットワークのデフォルトは`hybrid_signature_mode = required`、
`allow_classical_fallback = false`です。`buildHybridTx` / `signAndBroadcastHybrid`
(`rest`を渡す)によるハイブリッド署名 — または統一eth-nativeアカウント向けの
`signHybridEth` / `EthNativeSigner` — は、Nativeパスのトランザクションで**必須**です。
古典署名のみのNativeトランザクションはオンチェーンで拒否されます。EVMトランザクションは
別のレーンですが、v3.2.0以降は、ML-DSA-87鍵が登録済みで、かつ
[認可ウィンドウ](/sdk/guides/evm#evm-window)が開いているアカウントからのみ受け付けられます。
:::

:::caution SDK 0.6.0以下のハイブリッドトランザクションは拒否されます
0.6.1リリースは、`PQCHybridSignature`拡張のエンコーディング(JSON→protobuf、
コンセンサスに関わる重大な変更)を修正しました。SDK 0.6.0以前でビルドされた
ハイブリッドトランザクションは、CheckTxの段階でtxパースエラーとして失敗します —
0.6.1以降にアップグレードしてください。
:::

コインタイプ118のアカウント向けのエンドツーエンドのビルダーは`signAndBroadcastHybrid`
(ブロードキャストせずに構築のみ行う場合は`buildHybridTx`)です。これには、古典署名者、
アカウントのML-DSA-87鍵ペア、アカウント番号とシーケンス、そして`rest`が必要です。
TypeScriptでのコインタイプ118のアカウントにとって最短の経路は、ハイブリッドの
`TxClient`(SDK 0.9.0)です。接続時に鍵ペアを渡すと、すべてのトランザクションが
ハイブリッドで署名され、`fee: "auto"`はハイブリッドトランザクション自体を
シミュレートします(登録だけは古典署名のままです)。

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.host", rpc: "https://rpc.qore.host", evmRpc: "https://evm.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain

const tx = await client.connectTx(signer, { pqcKeypair });            // signs every transaction hybrid
await tx.bankSend("qor1recipient…", [{ denom: "uqor", amount: toBase("1.5") }]);
```

手数料、アカウント番号、シーケンスを明示的に制御するには、
`signAndBroadcastHybrid`を使用します(SDK 0.8.1以降、`npm i @cosmjs/stargate`)。

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  signAndBroadcastHybrid,
  qorechainRegistry,
  MSG_SEND_TYPE_URL,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain
const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(account.address);            // { accountNumber, sequence }

const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [
    {
      typeUrl: MSG_SEND_TYPE_URL,
      value: {
        fromAddress: account.address,
        toAddress: "qor1recipient…",
        amount: [{ denom: "uqor", amount: toBase("1.5") }],
      },
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,        // lets the SDK pick the v1/v2 PQC sign-bytes form
  transport,
});
```

### オンチェーンの前提条件

ハイブリッドトランザクションがPQC検証されるためには、あらかじめ署名者のPQC公開鍵を
`MsgRegisterPQCKeyV2`(古典署名で行い、ハイブリッド免除)で**登録**しておく必要があります。
SDKの`ensurePqcRegistered` / `buildRegisterPqcKeyMsg`、`qorechaind tx pqc
register-key`、またはQoreChainウォレットがこれを行います。`includePqcPublicKey: true`は
鍵を拡張に埋め込むだけで、鍵を登録するものでは**ありません**。チェーンも初回使用時に
鍵を登録することはありません。v3.2.3以降、チェーンは弱い鍵、縮退した鍵、再利用された鍵を
拒否し、任意の所有証明を受け付けます([鍵の完全性ルール](/architecture/post-quantum-security#key-integrity)を参照)。
SDK 0.9.0では、ネットワークがv3.2.3を適用すると`ensurePqcRegistered`が自動的に証明を付加し、
`signProofOfPossession` / `verifyProofOfPossession`は手作業で構築する登録向けにエクスポートされています。
0.8.xのビルダーは証明なしで登録しますが、これは許可されています。

### どの署名対象バイト列形式か? {#sign-bytes-versions}

ハイブリッドトランザクションのML-DSA-87部分は、2つのバイト列形式のいずれかに対して
署名され、ネットワークはどの高さでもちょうど1つだけを検証します。

```text
v1: BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
v2: "qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
```

`B0`はPQC拡張を除いたトランザクションボディ、`A`は`AuthInfo`のバイト列です。
`qorechain-vladi`と`qorechain-diana`はどちらも**v2**を検証します。この切り替えは、
メインネットではアップグレード名`v3.2.0`で、テストネットでは`v3.1.98`(その後`v3.2.0`)で
記録されているため、クライアントは**両方の**名前について
`GET /cosmos/upgrade/v1beta1/applied_plan/{name}`を問い合わせ、どちらかの高さが0より
大きければv2を使う必要があります。SDKはこれを自動で行います。すべてのハイブリッド
ビルダーは`signBytesVersion`(デフォルトは`"auto"`、または`"v1"` / `"v2"`)を受け取り、
この2つのチェーンでは`"auto"`にネットワークのREST URL(`rest`)が必要で、推測せずに
例外を投げます。高レベルのパスは、チェーンが`pqc`コード21で署名を拒否した場合に、
再解決して1回だけ再試行します。ユニットテストでは、テストが稼働中のノードに依存しない
よう、`signBytesVersion`を明示的に渡してください。
[コード21のトラブルシューティング](/developer-guide/post-quantum-signing#code-21)も
参照してください。

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
