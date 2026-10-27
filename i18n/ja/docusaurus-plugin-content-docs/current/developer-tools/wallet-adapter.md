---
slug: /developer-tools/wallet-adapter
title: ウォレットアダプター
sidebar_label: ウォレットアダプター
sidebar_position: 2
---

# ウォレットアダプター (`@qorechain/wallet-adapter`)

`@qorechain/wallet-adapter` は、`signDirect` を公開している Cosmos ウォレット（Keplr、Leap、Cosmostation）に QoreChain を追加し、チェーンが要求するトランザクションを構築します。ネイティブレーンのトランザクションには、アカウントの従来型 secp256k1 署名に加えて ML-DSA-87（FIPS 204）署名が必要ですが、標準のウォレットは ML-DSA-87 署名を作成できません。アダプターがそれを作成してトランザクションボディに配置し、その後、変更されていないウォレットに通常の署名を依頼します。dApp 開発者とウォレット開発者に加え、JavaScript で統合 QoreChain ウォレット、EVM 認可ウィンドウのメッセージ、またはリンクキー（オーセンティケーター）のメッセージを扱う必要があるツール開発者向けです。現在のバージョンは 0.4.0 です。

dApp からユーザーの QoreX ウォレットでトランザクションを送信するだけであれば、最短の方法はこのパッケージの [`qorexSignAndBroadcast`](#qorex)、または[開発者パッケージ](/developer-tools/overview#group-qorex)のインデックスに掲載されている QoreX パッケージです。ウォレットを開発していて、5 つの言語に対応した完全な署名ライブラリが必要な場合は、まず [QoreSign](/qoresign/overview) を読んでください。

## 革新点 {#innovations}

- **ウォレットは通常のボディに署名します。** アダプターは拡張機能なしでボディを構築し、署名対象バイト列に対して ML-DSA-87 レイヤーに署名し、それを `/qorechain.pqc.v1.PQCHybridSignature` 拡張オプション（アルゴリズム ID 1）としてボディに入れ、その後で完成した `SignDoc` に対して `wallet.signDirect` を呼び出します。ウォレットは標準の `SIGN_MODE_DIRECT` 署名を生成するため、QoreChain 固有のコードは不要です。結果は通常の `TxRaw` バイト列です。
- **ネットワークごとの署名対象バイト列セレクター。** ML-DSA-87 鍵は 2 つのバイト形式のいずれかに署名し、ネットワークはどの高さでもちょうど 1 つだけを検証します。`signBytesVersion: "auto"`（デフォルト）の場合、署名者はノードに `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` で `v3.2.0`、続いて `v3.1.98` を問い合わせ、どちらかの高さが 0 より大きければ v2 形式（ドメインタグ `qorechain-pqc-hybrid-v2` とチェーン ID）に署名し、結果を REST URL とチェーン ID ごとに 60 秒間キャッシュし、問い合わせができない場合は推測せずに例外をスローします。2026年10月27日に稼働中のノードで確認した結果: メインネットとテストネットはどちらも `v2` に解決され、`rest` なしで `qorechain-vladi` を呼び出すと例外がスローされます。`refreshSignBytesVersion()` はキャッシュを迂回し、`isHybridSignBytesRejection()` は `pqc` コード 21 の拒否を認識するため、ウォレットを開いている間にネットワークがアップグレードされた場合、呼び出し側は再解決して 1 回だけ再試行できます。
- **ニーモニック 1 つにつき ML-DSA-87 鍵 1 つ、ツール間で共有。** `walletFromMnemonic` は、`SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` を ML-DSA-87 の鍵生成に入力して鍵を導出します。この鍵はアカウントアドレスに紐づいており、SDK、`@qorechain/chain-bridge`、QoreX、`qorechaind tx pqc recover-key` コマンドと同じ導出方法のため、どのツールで署名しても 1 つのニーモニックから得られる鍵は 1 つです。[決定論的な鍵導出と復元](/developer-guide/post-quantum-signing#key-derivation)を参照してください。
- **1 つのアカウント、3 つのアドレス形式、1 つの署名鍵。** `generateQoreWallet` と `walletFromMnemonic` は、同じ 20 バイトの ID を表す `qor1`、`0x`（EIP-55）、SVM の base58 の各形式を、ML-DSA-87 キーペアとともに返します。`signClassicalEth` と `signHybridEth` は、このイーサリアムネイティブ鍵（`eth_secp256k1`）で Cosmos レーンのトランザクションに署名するため、同じ鍵が他の場所で EVM トランザクションにも署名します。
- **PQC リカバリーコード。** `generatePqcRecoveryCode` は、`QRC1-` に Crockford base32 と 24 ビットのチェックサムを続けた形式のランダムな 256 ビットのシークレットを返します。`pqcKeyFromRecoveryCode(code, address)` は、そこからアドレスに紐づけて ML-DSA-87 鍵を導出します。誤入力された文字は、何にも一致しない鍵を黙って導出するのではなく、メッセージ付きで拒否されます。このコードは意図的にシードフレーズではありません。
- **署名者としての QoreX。** `qorexSignAndBroadcast` は、プロトコルバッファでエンコードされたメッセージ（1 回の呼び出しにつき 1 から 32 個、メモは最大 256 バイト、ガスリミットは 100,000 から 5,000,000）をユーザーの QoreX ウォレットに送ります。ウォレットはそれらをデコードして表示し、ウォレットだけが作成できる ML-DSA-87 レイヤーを追加し、署名してブロードキャストします。アダプターは上限をローカルで確認し、PQC 鍵管理メッセージ（`MsgRegisterPQCKey`、`MsgRegisterPQCKeyV2`、`MsgMigratePQCKey`、`MsgRotatePQCKey`）を、authz の `MsgExec` の内側であればどの深さでも拒否します。デコードできない `MsgExec` は拒否されます。
- **EVM 認可ウィンドウのためのビルディングブロック。自動では決して開きません。** `openEvmWindowMsg`、`closeEvmWindowMsg`、`fetchEvmWindow`、`parseEvmWindow`、`isEvmWindowRejection` は、EVM の送信前に開いておく必要があるウィンドウを扱います。すべての上限（`blocks` は 1 から 17,280、`maxTxs` は 1 から 1,000、`maxValue` は 0 より大きい値）は必須で、デフォルトなしにクライアント側で確認され、ウィンドウの状態フィールドは BigInt です。このパッケージが自らウィンドウを開くことはなく、ユーザーが明示的な認可ステップを目にすることを前提としています。
- **チェーンと完全に一致するダイジェストを持つリンクキー（オーセンティケーター）のメッセージ。** `registerAuthenticatorMsg`、`registerEthAuthenticatorMsg`、`buildPhantomExecuteEvm`、`buildPhantomExecuteCosmos`、`buildMetaMaskExecuteEvm`、`buildMetaMaskExecuteCosmos` は、Phantom または MetaMask の鍵が、権限セットと支出ルールの下で QoreChain アカウントから支出できるようにするメッセージを構築します。`evmAuthSignBytesV2` はチェーン v3.2.3 のダイジェストで、呼び出しのガスリミット（0 以外である必要があります）も紐づけます。ノンスはアカウントの EVM ノンスではなく、リンクキーのオーセンティケーターシーケンスです。[オーセンティケーターと委任支出](/sdk/guides/authenticators)を参照してください。
- **安全な鍵ローテーション。** `rotateFromLegacyWalletKey` は、廃止されたウォレット署名導出で作られた鍵から離れる `MsgRotatePQCKey` を構築し、再導出した鍵が登録済みの鍵と等しくない限り拒否します。`rotatePqcKeyMsgFromMnemonic` は、レガシーな `SHAKE-256(mnemonic)` 鍵を正規のアドレス紐づけ鍵に移行し、レガシー導出を新しい鍵として使うことを拒否します。

## 使い方 {#how-to-use}

2 つの cosmjs ピア依存（バージョン 0.32）とともにアダプターをインストールします。

```bash
npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing
```

このパッケージは、TypeScript の型定義を備えたプレーンな JavaScript の ES モジュールです。マニフェストには、このパッケージのテスト済みクイックスタートはありません。以下のスニペットはパッケージの型定義とソースに基づいています。2026年10月27日に、ウォレット生成、署名対象バイト列リゾルバー、EVM ウィンドウの状態読み取り、`openEvmWindowMsg`、廃止された関数のエラーを、公開済みの 0.4.0 パッケージと稼働中のテストネットおよびメインネットの REST エンドポイントに対して実行し、パッケージ自身の 102 件のテストが成功しています。署名と QoreX のスニペットは、エンドツーエンドでは実行していません。

### 統合ウォレットを生成する {#unified-wallet}

```js
import { generateQoreWallet, walletFromMnemonic } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();           // random 24-word mnemonic
// const w = await walletFromMnemonic(mnemonic); // or recover one
console.log(w.cosmos); // qor1...   (bech32)
console.log(w.evm);    // 0x...     (EIP-55)
console.log(w.svm);    // base58 form of the same 20 bytes
// w.privateKey, w.pubkey, w.pqc = { publicKey (2592 bytes), secretKey }
```

`walletFromSeed(seed32)` は、32 バイトのシークレットから同じウォレットを構築します。シードが secp256k1 の秘密鍵になるため、安全な乱数源、またはユーザーだけが持つ素材に対する鍵導出関数から得る必要があります。ウェブサイトがウォレットに生成を要求できる署名から導出してはいけません。

### ユーザーのウォレットにチェーンを登録する {#register-chain}

```js
import { qoreChainInfo, addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// Keplr and other Cosmos wallets. chainId defaults to the testnet, so pass it for mainnet.
await window.keplr.experimentalSuggestChain(
  qoreChainInfo({ chainId: "qorechain-vladi", rpc: "https://rpc.qore.host", rest: "https://api.qore.host" }),
);
await window.keplr.enable("qorechain-vladi");

// MetaMask and other EIP-1193 wallets (18-decimal native currency on the EVM lane).
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801, testnet: false, rpcUrl: "https://evm.qore.host",
});
```

`qoreChainInfo` は、コインタイプ 118、bech32 プレフィックス `qor`、小数 6 桁のデノミネーション `uqor`、ガス価格ステップとしてガス 1 単位あたり 0.1、0.15、0.25 uqor を使用します。これはガス 1 単位あたり 0.1 uqor という手数料の下限を満たしています。`addQoreEvmToWallet` には `rpcUrl` が必要です。

### Cosmos ウォレットでハイブリッドトランザクションに署名する {#sign-hybrid}

```js
import { QoreChainSigner, pqcKeyFromRecoveryCode } from "@qorechain/wallet-adapter";

const signer = window.keplr.getOfflineSigner("qorechain-vladi");
const [account] = await signer.getAccounts();

// The account's ML-DSA-87 keypair, from a recovery code. Use this in a wallet or tool that
// legitimately owns the key; a web page should send its messages to QoreX instead (see below).
const pqc = await pqcKeyFromRecoveryCode(userRecoveryCode, account.address);

const adapter = new QoreChainSigner({
  wallet: window.keplr,
  chainId: "qorechain-vladi",
  address: account.address,
  pubkeySecp256k1: account.pubkey,
  accountNumber,                 // from GET /cosmos/auth/v1beta1/accounts/{address}
  pqc,
  rest: "https://api.qore.host", // lets the signer pick the sign-bytes form this network verifies
});

const txRaw = await adapter.signHybrid({ messages, fee, sequence }); // TxRaw bytes, with .signBytesVersion
// broadcast txRaw yourself (RPC broadcast_tx_sync or REST /cosmos/tx/v1beta1/txs)
```

知っておくべきこと:

- アダプターは署名し、ブロードキャストはあなたが行います。鍵登録メッセージは構築しません。アカウントの ML-DSA-87 鍵は、[QoreSign](/qoresign/quickstart)（`buildRegisterPqKeyMessage`）、SDK、または CLI で一度だけ登録してください（[鍵の登録](/developer-guide/post-quantum-signing#pqc-key-registration)を参照）。この最初のトランザクションは、従来型の署名でもかまいません。
- アカウントの ML-DSA-87 鍵をウェブページが保持する設計は避けるべきです。以前はウォレット署名から鍵を導出していた `derivePqcKeyFromWallet` は 0.3.0 で廃止され、常に例外をスローします。dApp はメッセージを QoreX（下記）に送り、ウォレットに署名させてください。
- `pqc` コード 21 でブロードキャストが拒否され、`"auto"` を使っていた場合は、`adapter.refreshSignBytesVersion()` を呼び出してもう一度署名してください。明示的な `"v1"` または `"v2"` を渡していた場合は再試行しないでください。[コード 21 のトラブルシューティング](/developer-guide/post-quantum-signing#code-21)を参照してください。

### QoreX 経由で送信する {#qorex}

```js
import {
  hasQorexSignAndBroadcast, qorexSignAndBroadcast, isQorexRejection,
} from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

if (!hasQorexSignAndBroadcast()) throw new Error("Install or update QoreX");

try {
  const { txHash, code } = await qorexSignAndBroadcast({
    chainId: "qorechain-vladi",   // must equal the wallet's active network
    messages: [{
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress, amount })).finish(),
    }],
    gasLimit: 300_000,            // optional, 100,000 to 5,000,000
  });
  if (code !== 0) throw new Error(`rejected by the chain with code ${code}`);
} catch (err) {
  if (isQorexRejection(err)) return; // the user declined; not a failure
  throw err;
}
```

`value` はプロトコルバッファのバイト列（`Uint8Array`、数値配列、または base64）で、与えられたとおりに署名されます。dApp からウォレットのネットワークを切り替えることはできません。QoreX 拡張機能 0.3.5 またはアプリ 1.1.5 以降が必要です。バージョンチェックではなく `hasQorexSignAndBroadcast()` でテストしてください。ワイヤレベルのコントラクトは [QoreX ブラウザ拡張機能](/qorex/browser-extension#sign-and-broadcast)にあります。

### EVM ウィンドウのメッセージを構築する {#evm-window}

```js
import { openEvmWindowMsg, fetchEvmWindow } from "@qorechain/wallet-adapter";

const status = await fetchEvmWindow({ rest: "https://api.qore.host", address: qor1 });
if (!status.live) {
  const msg = openEvmWindowMsg({
    sender: qor1,
    blocks: 300,        // 1 to 17280
    maxTxs: 3,          // 1 to 1000
    maxValue: "250000", // uqor: value plus the maximum fee of each admitted transaction
  });
  // sign it with signHybrid (or signHybridEth) and broadcast: it is an ordinary Cosmos-lane message
}
```

順序が重要です。ウィンドウを開き、次に EVM ノンスを読み取り、その後で EVM トランザクションに署名してください。ウィンドウを開くとアカウントのシーケンスが進み、それが EVM ノンスでもあるためです。`openEvmWindowMsg` が構築するのはスコープなしの形式のウィンドウのみで、スコープ付きウィンドウ（`native_only`、`allowed_targets`）には SDK が必要です。背景: [EVM 認可ウィンドウ](/sdk/guides/evm#evm-window)と[初めてのトランザクション](/getting-started/first-transaction#evm-window)。

### その他のエントリーポイント

| タスク | 関数 |
|---|---|
| PQC 鍵の復元またはローテーション | `generatePqcRecoveryCode`, `pqcKeyFromRecoveryCode`, `isValidRecoveryCode`, `rotatePqcKeyMsgFromMnemonic`, `rotateFromLegacyWalletKey`, `rotatePqcKeyMsg` |
| イーサリアムネイティブ鍵で署名 | `signClassicalEth`（従来型の鍵登録）, `signHybridEth` |
| 署名対象バイト列のヘルパー | `hybridSignBytes(version, chainId, body, authInfo)`, `resolveSignBytesVersion`, `signBytesVersionFor`, `SIGN_BYTES_V2_UPGRADES` |
| 外部鍵のリンクと支出 | `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`, `buildPhantom*` および `buildMetaMask*` 関数 |

## アクセス方法 {#how-to-access}

- **ネットワーク:** メインネット `qorechain-vladi` とテストネット `qorechain-diana`。`chainId` と、対応する `rest` URL を渡してください（[エンドポイント](/developer-tools/overview#how-to-access)）。
- **ウォレット:** QoreSign ガイドと例では Keplr を使用しています（[Keplr 互換ウォレット](/qoresign/guides/keplr-compatible-wallets)）。Leap と Cosmostation は同じ `signDirect` インターフェースを公開しており、このパッケージはそのようなウォレットすべてを想定して書かれていますが、このページのためにそれらに対しては確認していません。MetaMask はアダプターの署名者ではなく EVM レーンを使用し、送信のたびに開いた EVM ウィンドウが必要です（[開発者パッケージ](/developer-tools/overview#how-to-access)）。Phantom はオーセンティケーターとしてリンクされます。
- **アカウントと鍵:** 手数料用に QOR が入金されたアカウントと、最初のハイブリッドトランザクションの前にオンチェーンで登録されたアカウントの ML-DSA-87 鍵。
- **前提条件:** ES モジュールに対応した Node.js、またはブラウザ向けのバンドラー。ピア依存関係は `@cosmjs/stargate` と `@cosmjs/proto-signing` の `^0.32`。ランタイム依存関係: `@qorechain/pqc` `^0.2.1`、`cosmjs-types` `^0.9.0`、`@cosmjs/crypto` と `@cosmjs/encoding` の `^0.32`。
- **コスト:** パッケージは無料です。トランザクションはガス 1 単位あたり 0.1 uqor 以上のネットワーク手数料を支払います。ML-DSA-87 公開鍵は 2,592 バイトのため、鍵の登録には大きなガスリミットが使われます。

## 公開場所 {#where-published}

| レジストリ | パッケージ | バージョン | リンク |
|---|---|---|---|
| npm | `@qorechain/wallet-adapter` | 0.4.0（2026年10月20日公開） | [npmjs.com](https://www.npmjs.com/package/@qorechain/wallet-adapter) |

ソース: [github.com/qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter)（公開、タグ `v0.4.0`、Apache-2.0）。PyPI、crates.io、Maven Central、Go プロキシでは公開されていません。関連: [開発者パッケージ](/developer-tools/overview)、[QoreSign](/qoresign/overview)、[ポスト量子署名](/developer-guide/post-quantum-signing)、[取引所統合](/developer-guide/exchange-integration)。

## 制限と既知の問題 {#limits}

- **署名のみを行い、ブロードキャスト、鍵の登録、ウィンドウを開くことはしません。** ML-DSA-87 鍵を登録する関数はなく、EVM ウィンドウを代わりに開くものもありません。
- **所有証明はありません。** このパッケージだけを使うツールで行った鍵登録には、所有証明が付きません。チェーンはそれでも受け付け、証明がある場合はそれを検証します（[所有証明](/developer-guide/post-quantum-signing#proof-of-possession)）。
- **`derivePqcKeyFromWallet` は廃止されており**（0.3.0）、常に例外をスローします。それで鍵を登録したアカウントは、`rotateFromLegacyWalletKey` でローテーションしてください。
- **スコープなしのウィンドウのみ。** `openEvmWindowMsg` にはスコープのフィールドがありません。
- **`qoreChainInfo` のデフォルトはテストネットです。** メインネットでは必ず `chainId` を渡してください。
- **オーセンティケーターのノンス。** リンクキーのオーセンティケーターシーケンスを公開するクエリはまだないため、自分で追跡する必要があります。値が誤っている場合、チェーンは `abstractaccount` コード 11 を返します。オーセンティケーターモジュールはテストネットでは有効で、メインネットではオフになっています（[SDK の概要](/sdk/overview)を参照）。
- **cosmjs 0.32 のピア依存。** SDK は cosmjs 0.39 を使用します。1 つのプロジェクトに両方をインストールすると `ERESOLVE` エラーになるため、分けておくか `--legacy-peer-deps` を渡してください。
- **パッケージの README からコピーしないでください。** README には、メインネットが最初の署名対象バイト列形式を検証すること、MetaMask の送信に追加の手順が不要であることが、まだ書かれています。どちらも古い内容です。両方のネットワークが v2 を検証し、EVM の送信には登録済みの鍵と開いたウィンドウが必要です。
- **テスト済みのクイックスタートは記録されていません。** このパッケージには記録がなく、QoreX の経路はウォレットのインストールが必要なため、スクリプトでは実行できません。
