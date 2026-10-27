---
slug: /developer-tools/chain-bridge
title: チェーンブリッジとハンドル
sidebar_label: チェーンブリッジとハンドル
sidebar_position: 3
---

# チェーンブリッジとハンドル

このページでは、2 つの小さなサーバーサイドパッケージを扱います。

**`@qorechain/chain-bridge`**（0.2.3）は、キーボードの前に人がいない状態で QoreChain 上で動作するバックエンド向けの Node.js ライブラリです。QOR の送信、アカウントの ML-DSA-87 鍵の登録、ライトノードの登録、コントラクトのデプロイを行い、チェーンのライセンス権限鍵の保持者向けには、ライセンスの付与と取り消しも行います。通常のバックエンド単体ではできない 2 つのこと、つまりネイティブレーンのトランザクションに必要な ML-DSA-87 ハイブリッド署名と、QoreChain のカスタムメッセージの正確なプロトコルバッファエンコーディングを処理します。ホットウォレットワーカー、決済やダッシュボードのバックエンド、同様のサービス向けです。

**`@qorechain/handles`**（0.1.0）は、QoreX の `@handle` をアドレスに解決し、返す前にその答えを暗号的に検証します。`qor1...` アドレスの代わりに `@alice` と入力できるようにするウォレットやサービス向けです。

どちらのパッケージも、レジストリのメタデータにソースリポジトリを記載していません。公開されたコードは npm で読むことができます。

## 革新点 {#innovations}

### チェーンブリッジ {#innovations-chain-bridge}

- **ニーモニック 1 つにつき、正規の ML-DSA-87 鍵 1 つ。** 鍵は `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` として導出され、その後 ML-DSA-87 の鍵生成に渡されます。これは[ウォレットアダプター](/developer-tools/wallet-adapter)、SDK、QoreX と同じ導出方法のため、鍵は `qorechaind tx pqc recover-key` で復元できます。古いツールで `SHAKE-256(mnemonic)` を使って登録されたアカウントは、レガシーの鍵を保持します。正規の署名が検証失敗で拒否された場合、ブリッジはレガシーの鍵で 1 回だけ再試行します。
- **チェーンから読み取る署名対象バイト列の形式。** `cosmosRest` を設定すると、ブリッジはノードに適用済みのアップグレードプラン（`v3.2.0` と `v3.1.98`）を問い合わせ、どちらかが適用されていれば v2 形式で署名します。詳細は[ウォレットアダプターのページ](/developer-tools/wallet-adapter#innovations)に記載されています。チェーンが `pqc` コード 21 で拒否した場合は、1 回だけ再解決して署名し直します。稼働中のネットワークでは `cosmosRest` が必須で、これがないとハイブリッド呼び出しは推測せずに例外をスローします。
- **初回使用時に鍵を登録しますが、まずチェーンを確認します。** PQC 鍵がないためにハイブリッドトランザクションが拒否されると、ブリッジは `MsgRegisterPQCKeyV2`（従来型のトランザクションで、最初の登録ではチェーンが許可します）を送信して再試行します。このメッセージは拒否されても手数料がかかるため、まず `GET /qorechain/pqc/v1/account/{address}` を読み取ります。アカウントがすでに、ニーモニックの正規の鍵でもレガシーの鍵でもない鍵を保持している場合は、`pqc_key_mismatch` をスローし、何も送信しません。`cosmosRest` を設定している場合、ネットワークが v3.2.3 を適用済みであれば（メインネットとテストネットの両方で適用済み）、登録には所有証明も含まれます。
- **通常の名前からライセンス機能 ID を取得。** `featureIdsFor({ type, chains })` は、製品の説明をチェーンの機能 ID（`validator_operator` と `validator_<chain>`、`lightnode_operator`、`qcb_bridge` と `bridge_<chain>`）にマッピングし、「Solana」や「BNB Chain」のような自由記述のチェーン名を正規化し、チェーンが拒否するような ID を作る代わりに未知のチェーンを除外します。2026年10月27日の確認: `featureIdsFor({ type: "validator", chains: ["Solana", "Ethereum", "Foo"] })` は `validator_operator`、`validator_solana`、`validator_ethereum` を返し、`Foo` を除外しました。
- **純粋な JavaScript で、ネイティブアドオンなし。** Node.js 18 以降向けの ES モジュールのため、サーバーレスワーカーで動作します。メインのエントリーポイントに加えて、`@qorechain/chain-bridge/proto`（ワイヤエンコーダー）と `@qorechain/chain-bridge/features`（機能マッピング）をエクスポートします。

### ハンドル {#innovations-handles}

- **解決結果は、返される前に 2 回検証されます。** レコードには、クライアントに固定したレジストリの公開鍵で検証されるレジストリの ed25519 署名と、クレームに対する所有者自身の secp256k1 署名が必要で、その公開鍵のハッシュはレコードの `qor1` アドレスと一致しなければなりません。どちらかのチェックに失敗したレコードは返されません。
- **ピンストアはあなたのものです。** `resolve` は、レコードを手元のピンと比較して `pin.status` を `new`、`match`、`CHANGED` として返し、自らピンすることはありません。ユーザーがアドレスを確認して先に進んだ後に、ピンします。ピンの目的は、レジストリが異なる内容を返し始めたことに気づくことなので、チェック対象の当事者以外、たとえばユーザーのデバイス上で保持する必要があります。
- **ネットワークに対して返されるのは、所有者が署名したアドレスのみ。** `addressForNetwork(record, caip2)` は、QoreChain ネットワークでは `qor1` アドレスを、レコードが統合アカウントの場合はチェーン ID 9800 と 9801 に対して `0x` アドレスを返します。レジストリが単に証明しているだけの他のチェーン上のアドレスは、送信用には返されません。
- **表示専用の逆引き。** `reverse(address)` は、履歴に表示するためのハンドルを返します。その結果が送信先になってはいけません。
- **クレームと削除は別々の署名ドメインを使用します。** `signClaim` と `signDelete` は異なるメッセージに署名するため、削除の署名をクレームとして再利用することはできません。

## 使い方 {#how-to-use}

### チェーンブリッジ {#use-chain-bridge}

```bash
npm install @qorechain/chain-bridge
```

これは `@qorechain/wallet-adapter`（^0.4.0）、`@qorechain/pqc`（^0.2.1）、cosmjs 0.32、ethers 6 を取り込みます。テスト済みのクイックスタートはありません。以下のスニペットは、パッケージの型定義と[取引所統合ガイド](/developer-guide/exchange-integration#chain-bridge)に従っています。2026年10月27日に、コンストラクター、`featureIdsFor`、メソッド一覧を公開済みの 0.2.3 パッケージに対して確認しました。トランザクションは送信していません。

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc-testnet.qore.host",
  cosmosRest: "https://api-testnet.qore.host", // picks the sign-bytes form; required on both live networks
  chainId: "qorechain-diana",
  signerMnemonic: process.env.WORKER_MNEMONIC, // from your secrets manager, never in source code
});

// Once per account (the bridge also does it on first use if the chain reports no key).
await bridge.registerPqc({ mnemonic: process.env.WORKER_MNEMONIC });

// Amounts are in uqor (6 decimals): 1 QOR = 1000000.
const { txHash, code } = await bridge.sendTokens({ to: "qor1...", amountUqor: "1000000" });
```

主なメソッド:

| メソッド | 動作 | 使用する鍵 |
|---|---|---|
| `sendTokens({ to, amountUqor })` | bank の `MsgSend`、ハイブリッド署名 | 署名者 |
| `registerPqc({ mnemonic })` | `MsgRegisterPQCKeyV2`、従来型 | そのアカウント |
| `registerLightNode({ operatorMnemonic, nodeType, version, capabilities })` | ライトノードの登録、ハイブリッド署名 | オペレーター |
| `grantLicense`, `grantLicenseSet`, `revokeLicense`, `suspendLicense`, `resumeLicense` | ライセンスモジュールのメッセージ | チェーンのライセンス権限鍵 |
| `deployEvm({ bytecode, abi, args })` | `eth_sendRawTransaction` を通じたイーサリアム形式のデプロイ | デプロイヤー鍵 |
| `deploySvm({ bytecode })` | SVM プログラムのデプロイ | 署名者 |
| `createVestingAccount`, `createPeriodicVestingAccount` | ベスティングアカウントの作成 | 署名者 |
| `featureIdsFor`, `normalizeChain` | ローカルのヘルパー | なし |

すべての呼び出しは `{ txHash, code, height, gasUsed }` を返し、ハイブリッド呼び出しは `signBytesVersion` も報告します。デフォルトのガス価格はガス 1 単位あたり 0.1 uqor で、これがネットワークの下限です（この価格では、ガス 300,000 の `sendTokens` のコストは 30,000 uqor、鍵登録のデフォルトであるガス 6,000,000 のコストは 600,000 uqor で、これはアカウントごとに一度だけ支払います）。EVM レーンは 18 桁の小数を使用し、`deployEvm` の `value` は wei 単位です。デフォルトのコインタイプ 118 の鍵の代わりに、統合されたイーサリアムネイティブ鍵（`qor1`、`0x`、SVM としての 1 つの ID）で署名するには、設定で `keyType: "eth_secp256k1"` を指定します。このオプションはソースとウォレットアダプターの README にありますが、型定義にはありません。

### ハンドル {#handles}

```bash
npm install @qorechain/handles
```

実行時の依存関係は `@noble/curves`、`@noble/hashes`、`bech32` のみです。テスト済みのクイックスタートはありません。スニペットはパッケージの README と型定義に従っています。2026年10月27日に、`isHandleInput`、`normalizeHandle`、エクスポート一覧を公開済みの 0.1.0 パッケージで確認しており、レジストリには接続していません。

```ts
import { HandleClient, type PinStore } from "@qorechain/handles";

const client = new HandleClient({ baseUrl: registryUrl, registryPubkeyHex });

// You supply the pin store, ideally on the user's device.
const pins: PinStore = { get: (handle) => load(handle), put: (pin) => save(pin) };

const { record, pin } = await client.resolve("@alice", pins);

if (pin.status === "CHANGED") {
  // Stop. Show both addresses in full and require explicit confirmation.
  // Never update the pin silently.
}

// Show record.qorAddress to the user. When they proceed (and only then):
await client.pin(record, pins, Date.now());
```

`resolve` は、ハンドルが不明な場合、レジストリに到達できない場合、または答えの検証に失敗した場合に例外をスローします。`isHandleInput(text)` は、ハンドルとアドレスを区別します（ハンドルは `a-z`、`0-9`、`_` の 3 から 20 文字、または `@` で始まるもの。`qor1...` や `0x...` の文字列がハンドルになることはありません）。その他のエクスポート: `claimSignBytes`、`signClaim`、`deleteSignBytes`、`signDelete`、`verifyResolution`、`checkPin`、`QorexError`。QoreX がハンドルをどのように使うかについては、[@handle に送る](/qorex/browser-extension#handle-send)と[アカウントとダッシュボード](/qorex/account-and-dashboard)を参照してください。

## アクセス方法 {#how-to-access}

- **ネットワーク:** チェーンブリッジは、[開発者パッケージ](/developer-tools/overview#how-to-access)のページに記載されたエンドポイント（`deployEvm` では EVM RPC とチェーン ID 9800 または 9801）を使って、メインネット `qorechain-vladi` またはテストネット `qorechain-diana` に対して動作します。
- **チェーンブリッジの前提条件:** Node.js 18 以降、ワーカーがニーモニックを保持する資金入りのアカウント（シークレットマネージャーに保管してください）、そしてネットワークの REST URL。ML-DSA-87 鍵はニーモニックから導出されて初回使用時に登録されるため、アカウントにはその登録手数料に足りる QOR が必要です。
- **ライセンス呼び出し**は、チェーンがライセンス権限として設定した鍵で署名された場合にのみ成功します。外部の開発者はその鍵を持っていないため、これらのメソッドはその鍵のオペレーター向けです。ユーザーとしてのライセンスとライトノード登録については、[登録とライセンス](/light-node/registration-and-licensing)を参照してください。
- **ハンドルの前提条件:** レジストリのベース URL とその ed25519 公開鍵（16 進数）、自分で実装するピンストア、そして `fetch`。読み取りにアカウントは不要です。
- **コスト:** どちらのパッケージも無料です。チェーンブリッジのトランザクションにはネットワーク手数料がかかります。

## 公開場所 {#where-published}

| レジストリ | パッケージ | バージョン | リンク |
|---|---|---|---|
| npm | `@qorechain/chain-bridge` | 0.2.3（2026年10月20日公開） | [npmjs.com](https://www.npmjs.com/package/@qorechain/chain-bridge) |
| npm | `@qorechain/handles` | 0.1.0（2026年8月公開） | [npmjs.com](https://www.npmjs.com/package/@qorechain/handles) |

どちらも Apache-2.0 で、npm のみで公開されています（PyPI、crates.io、Maven Central、Go プロキシでは公開されていません）。どちらもレジストリのメタデータにソースリポジトリを記載していないため、リンクできる公開ソースページはなく、コードは公開された tarball に含まれています。最新バージョンを確認するには、[最新バージョンの確認方法](/developer-tools/overview#live-versions)を参照してください。

## 制限と既知の問題 {#limits}

### チェーンブリッジ {#limits-chain-bridge}

- **EVM デプロイには開いたウィンドウが必要です。** `deployEvm` は標準のイーサリアムトランザクションを送信します。チェーン v3.2.0 以降、EVM レーンは、登録済みの ML-DSA-87 鍵と開いた EVM 認可ウィンドウを持つアカウントからのトランザクションのみを受け付けますが、ブリッジにはウィンドウを開くメソッドがありません。呼び出す前に、他のツール（[ウォレットアダプター](/developer-tools/wallet-adapter#evm-window)、SDK、QoreX）でウィンドウを開いてください。そうしないとトランザクションは拒否されます（codespace `pqc`、コード 26、27、または 28）。これはチェーンのルールとパッケージのソースに基づいており、このページのために稼働中のネットワークで試してはいません。パッケージの README はまだ EVM レーンを対象外としていますが、これは古い内容です。
- **`deploySvm`** は SVM レーンを対象としていますが、このレーンはどちらのネットワークでもまだトランザクションを受け付けていません。
- **コントラクトのアップロードメソッドは存在しますが、文書化されていません。** ソースには QoreChain Native コントラクト用の `storeWasm`、`instantiateWasm`、`deployWasm` もありますが、型定義にも README にもありません。稼働中のネットワークでは、通常のアカウントにとってアップロードはガバナンス限定のため、通常のアカウントでは拒否されることを想定してください。
- **鍵はサーバー上で導出されます。** ニーモニックはあなたのプロセス内にとどまります。ログやソース管理に含めないようにし、個人のウォレットとして再利用しないでください。
- **登録は無料ではありません。** ブリッジは初回使用時に自ら鍵を登録します。資金を移動するレールでは、事前に登録し、最初の出金の前に `GET /qorechain/pqc/v1/account/{address}` で結果を確認してください。
- **cosmjs 0.32。** 1 つのプロジェクトで SDK（cosmjs 0.39）と並べてインストールしないでください。npm が `ERESOLVE` を報告します。
- **古い README の部分。** README には、メインネットが最初の署名対象バイト列形式のままであると書かれていますが、両方のネットワークが v2 を検証します（[ポスト量子セキュリティ](/architecture/post-quantum-security)を参照）。
- **テスト済みのクイックスタートも、公開ソースリポジトリもありません。**

### ハンドル {#limits-handles}

- **レジストリのアドレスと公開鍵は、パッケージにもこのマニュアルにも公開されていません。** QoreX とダッシュボードにはそれらが組み込まれているため、インテグレーターがこのパッケージを使えるのは、その 2 つの値を渡された場合に限られます。
- **ハンドルはオンチェーンの名前ではありません。** レジストリは QoreX のために運用されているオフチェーンのサービスです。パッケージはその答えを検証しますが、可用性を保証することはできません。レジストリに到達できない場合、`resolve` は `NETWORK_UNAVAILABLE` エラーをスローし、`isReachable()` は UI がハンドル機能を隠すために使える簡易プローブです。
- **ピンは何も自動では行いません。** `pin` を呼び出さない場合、すべての解決結果は `new` と報告されます。ピンを安全に保管する責任は呼び出し側にあります。
- **送信に使用されるのは、所有者が署名したアドレスのみです。** レジストリが証明している他のチェーン上のアドレスは、`addressForNetwork` から返されません。
- **書き込み呼び出しには、パッケージ以外のものも必要です。** `claim`、`deleteHandle`、`bySub` はレジストリの書き込みエンドポイントと通信し、所有者の署名（`signClaim`、`signDelete`）またはアカウントトークンが必要です。ウォレットアプリ向けです。
- **テスト済みのクイックスタートも、公開ソースリポジトリもありません。**
