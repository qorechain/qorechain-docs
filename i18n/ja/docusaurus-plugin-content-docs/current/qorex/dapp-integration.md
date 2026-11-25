---
slug: /qorex/dapp-integration
title: dApp を QoreX と連携する
sidebar_label: dApp 連携
sidebar_position: 8
---

# dApp を QoreX と連携する

これは、Web アプリを QoreX ウォレットに対応させたい開発者向けの完全なガイドです。検出と接続の方法、QoreChain トランザクションの送信、メッセージへの署名、EVM と Solana の利用、拒否への対処、QoreX を開くリンクの生成を説明します。QoreX ブラウザ拡張機能と、QoreX アプリのアプリ内 dApp ブラウザの両方を扱い、両者が異なる点も示します。コードサンプルはウォレット自体のコードと照合しています。

## イノベーション {#innovations}

- **ページはポスト量子鍵を一切保持しません。** `signAndBroadcast` はメッセージを受け取ります。QoreX はそれをデコードして表示し、ウォレットだけが作成できる ML-DSA-87 レイヤーを追加して、ブロードキャストします。cosmjs、cosmos-kit、Interchain Kit は `getOfflineSigner` を通じてそのまま動作し、トランザクションにレイヤーがない場合は QoreX が同じレイヤーを追加します。
- **バージョンではなくケイパビリティで検出。** `window.qorex.native.capabilities` にはビルドができることが一覧になっているため、1 つのコードパスがすべてのリリースで動作します。
- **何も乗っ取りません。** QoreX は EIP-6963 と Solana Wallet Standard で自身を通知し、`window.keplr` を設定せず、他のウォレットの `window.ethereum` を上書きすることもありません。
- **ポスト量子の署名部分を持つメッセージ署名。** `signArbitrary` は、アカウントの従来型鍵（ADR-36）と ML-DSA-87 で署名します。サーバーは `@qorechain/qoresign` を使い、チェーンに登録された鍵に対して両方を検証します。
- **ユーザーに説明する QoreChain 上の EVM。** `personal_sign`、`eth_signTypedData_v4`、`eth_sendTransaction` は端末上でデコードされ、ノードが許す範囲でシミュレーションされ、承認画面は QoreChain の EVM レーンに必要なトランザクションごとの認可ウィンドウを開きます。
- **ブラインド署名はなく、サイトが決して要求できないものの短い一覧があります。** QoreX が表示できないメッセージは拒否され、ウォレット専用のメッセージ（鍵の管理、支出ルール、ウィンドウ、grant）はどのサイトからも拒否されます。
- **サービスが生成できるリンク。** アプリでページを開く、受取人自身の鍵で署名された支払いを請求する、エージェントの提案を渡すことができます。

## QoreX が注入するもの {#injected}

すべてのページで、QoreX は 3 つのプロバイダーを持つ 1 つのオブジェクト `window.qorex` を追加します。

| プロバイダー | 内容 |
|---|---|
| `window.qorex.native` | QoreChain（Cosmos）レーン。Keplr 形式で、`enable`、`getKey`、`signAndBroadcast`、`signDirect`、`signArbitrary`、`verifyArbitrary`、`getOfflineSigner*` と `capabilities` の一覧があります。Keplr のドロップイン互換ではありません。 |
| `window.qorex.evm` | QoreChain の EVM レーン（拡張機能では Ethereum も）向けの EIP-1193 プロバイダー。EIP-6963 でも通知されます。 |
| `window.qorex.svm` | Solana プロバイダー。拡張機能では、Solana の dApp は通常、代わりに Wallet Standard を通じて QoreX を見つけます。 |

QoreX が行わないこと:

- `window.keplr` を設定することはありません。Keplr を探すコードは QoreX を見つけられないため、代わりに `window.qorex` を検出してください。
- `window.ethereum` を上書きすることはありません。拡張機能はそもそも設定しません。アプリのアプリ内ブラウザは、他のウォレットが設定していない場合にのみ `window.ethereum` を設定します。QoreX は `window.ethereum` ではなく、EIP-6963 の名前で選んでください。
- `signAmino` と `sendTx` は存在しません（[cosmjs](#cosmjs) を参照）。

## QoreX を検出する {#detection}

**EVM。** EIP-6963 のアナウンスを待ち受け、`rdns` が `network.qore.qorex` のものを選びます。

```ts
const wallets = new Map<string, EIP6963ProviderDetail>();
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});
window.dispatchEvent(new Event("eip6963:requestProvider"));

const qorex = wallets.get("network.qore.qorex"); // undefined when QoreX is not there
```

**QoreChain ネイティブレーン。** `window.qorex?.native` を確認し、そのケイパビリティを読み取ります。バージョン番号ではなく、ケイパビリティを確認してください。

```js
const native = window.qorex?.native;
const can = (name) => native?.capabilities?.includes(name) === true;
```

| ケイパビリティ | 拡張機能 | アプリ |
|---|---|---|
| `signAndBroadcast` | 0.3.5 | 1.2.1（メソッドは 1.2.0 から存在） |
| `signDirectAddsPqcLayer` | 0.4.0 | 1.2.1（動作は 1.2.0 から） |
| `signArbitrary` | 0.4.0 | 1.2.1（メソッドは 1.2.0 から存在） |
| `listAccounts`、`connectProofPicksAccount`、`executeRequest` | 0.3.x | アプリにはなし |

アプリ 1.2.0 にはメソッドがありますが、ケイパビリティは宣言しません。これに対応するには、`typeof window.qorex?.native?.signArbitrary === "function"` にフォールバックしてください。`executeRequest` は Dashboard ブリッジで、`dashboard.qorechain.io` でのみ動作します（[Dashboard ブリッジ](/qorex/browser-extension#dashboard-bridge)を参照）。他のサイトには必要ありません。ビルド 1.2.5 と 0.4.4 は、以前と同じケイパビリティを宣言します。

**拡張機能かアプリか。** ページは相手がどちらかを問い合わせることはできず、その必要もないはずです。重要な違いは次の表のとおりです。

| | 拡張機能（デスクトップ） | アプリ（アプリ内 dApp ブラウザ） |
|---|---|---|
| QoreChain ネイティブレーン | あり | あり |
| QoreChain 上の EVM 署名 | あり | あり |
| Ethereum 上の EVM（`0x1` への `wallet_switchEthereumChain`、サイトごと） | あり | なし。QoreChain のアクティブなネットワークのみ |
| EVM イベント（`connect`、`accountsChanged`、`chainChanged`） | 3 つすべて | `connect` のみ。アカウントやネットワークを切り替える際はブラウザを閉じます |
| Solana（Wallet Standard） | あり | なし。アプリ内ブラウザは Solana トランザクションに署名しません |
| Dashboard ブリッジ（`connectProof`、`executeRequest`） | あり。`dashboard.qorechain.io` のみ | なし |
| リンクからページを開く | 該当なし | `browse` リンク（[リンク](#links)を参照） |

それぞれのユーザー向けの説明は、[ブラウザ拡張機能](/qorex/browser-extension)と [dApp ブラウザ](/qorex/dapp-browser)を参照してください。

## 接続 {#connect}

接続にはサイトごとに 1 回の承認が必要で、公開されるのは公開アドレスのみです。

```js
await window.qorex.native.enable("qorechain-vladi"); // once per site; mainnet chain id
const key = await window.qorex.native.getKey("qorechain-vladi");
// key.bech32Address is the qor1... address; key.algo is "secp256k1", or "ethsecp256k1" for a coin-60 account
```

EVM:

```js
const [account] = await qorex.provider.request({ method: "eth_requestAccounts" });
```

`eth_accounts` は、ユーザーがサイトを承認するまで空のリストを返し、自分からウィンドウを開くことはありません。`enable` と `eth_requestAccounts` は、ウォレットがロックされている場合はウォレットを開きます（[ロックされたウォレット](#locked)を参照）。

拡張機能は、アカウント、ウォレット、ネットワークが変わると、ウィンドウイベント `qorex_keystorechange` を発行します。承認はウォレットごとに保持され、ユーザーはいつでも **接続済みサイト** でサイトを取り消せます。

## QoreChain トランザクションを送信する: `signAndBroadcast` {#sign-and-broadcast}

登録済みのポスト量子鍵を持つアカウントからのすべての QoreChain トランザクションには、ハイブリッド署名（secp256k1 **と** ML-DSA-87）が必要です。ML-DSA 鍵を保持するのはウォレットだけなので、ページはその署名を自分で構築できません。メッセージを送れば、残りは QoreX が行います。

1. デコードしたメッセージと手数料をユーザーに表示し、
2. ユーザーが選択しているアカウントのトランザクションを構築し、
3. ハイブリッド署名を追加し（これが最初のトランザクションの場合は、先にアカウントのポスト量子鍵を登録します）、
4. ブロードキャストして、結果とともに解決します。

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");              // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                          // must be the wallet's active network
  messages: [
    {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(msgSend).finish(),         // protobuf bytes: Uint8Array,
    },                                                 // number[] or a base64 string
  ],
  memo: "",                                            // optional, at most 256 bytes
  gasLimit: 300000,                                    // optional: 100k to 5M, default 400k
});
// res = { txHash, code, height?, shield }
```

`shield` は、コミットされたトランザクションがハイブリッドレイヤーを持つかを示します。持つ場合は `shielded`、レイヤーなしでコミットされた場合は `downgraded`（この場合は報告してください）、それ以外は `pending` または `classical` です。

**ルール**

- `chainId` はウォレットのアクティブなネットワークと一致する必要があります。`qorechain-vladi`（メインネット）、またはユーザーがテストネットに切り替えている場合は `qorechain-diana` です。不一致の場合は、両方の名前を示すメッセージとともに拒否されます。**dApp はネットワークを切り替えられません**（[テストネット](#testnet)を参照）。
- 1 回の呼び出しにつき 1 から 32 件のメッセージ。メッセージのバイト列は送信されたとおりに署名され、ウォレットが再エンコードすることはありません。
- 最大 256 バイトのメモは承認シートに表示されます。改行や制御文字はコードとして表示されます。
- ウォレット専用のメッセージは拒否されます（[サイトが決して要求できないメッセージ](#wallet-only)を参照）。
- QoreX は表示できないメッセージに署名しません。そのようなリクエストは、`MsgExec` の中も含め、`QoreX cannot show what <type> does, so it will not sign it` で拒否されます。QoreX がデコードできるメッセージタイプを使ってください。

**ガスと手数料**

- 手数料は `gasLimit` にネットワークのガス価格（QoreX はネットワークの現在の最低価格に従います）を掛けた値で、ユーザーが承認する前に表示されます。
- 指定した `gasLimit` は 100,000 から 5,000,000 の範囲に制限されます。指定がない場合は 400,000 です。
- CosmWasm やクロス VM のコードを実行するトランザクションは、承認の前に先にシミュレーションされます。QoreX はシミュレーションしたガスの少なくとも 1.3 倍を 20,000,000 まで要求し、ページがより大きい値を指定した場合はそれを維持します。コントラクトが拒否する呼び出しは、チェーンが示す理由とともに承認前に拒否されます。呼び出しに 20,000,000 を超えるガスが必要な場合、QoreX はその旨を示して拒否します。
- トランザクションはネットワーク自体の 1 トランザクションあたりのガス上限を超えられません。超えるものは、何も署名される前に QoreX が拒否します。

ユーザーが拒否すると、コード `4001` で `QoreX: signature rejected` が throw されます。

## cosmjs、cosmos-kit、Interchain Kit {#cosmjs}

`getOfflineSigner(chainId)`、`getOfflineSignerOnlyDirect(chainId)`、`getOfflineSignerAuto(chainId)` は cosmjs の `OfflineDirectSigner` を返すため、`SigningStargateClient` はそのまま動作します。

```js
const signer = window.qorex.native.getOfflineSigner("qorechain-vladi");
const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
  gasPrice: GasPrice.fromString("0.15uqor"),
});
await client.sendTokens(from, to, [{ denom: "uqor", amount: "1000" }], "auto");
```

**ウォレットが追加するポスト量子レイヤー。** トランザクションに ML-DSA レイヤーがない場合（ページは作成できません）、QoreX が追加します。レイヤーのコストをシミュレーションし、トランザクション内のガスと手数料を引き上げ、本文と引き上げ後の手数料情報に ML-DSA-87 で署名し、承認前に最終的な手数料をユーザーに表示します。そのため、`"auto"` の手数料はレイヤーのコスト分（数万ガス）高くなって返ります。送ったものではなく、返ってきた `signed` ドキュメントを必ずブロードキャストしてください。これに依存する前に `capabilities.includes("signDirectAddsPqcLayer")` を確認してください。

- アカウントのポスト量子鍵はすでに登録されている必要があります。登録は QoreX からの最初のトランザクションで行われます。それ以外の場合、呼び出しはコード `4100`、理由 `pqc-key-missing` で失敗します。先にユーザーに QoreX から 1 回トランザクションを送ってもらうか、鍵を自分で登録する `signAndBroadcast` を使ってください。
- **Amino は拒否されます。** `signAmino` と `getOfflineSignerOnlyAmino().signAmino` は、コード `4200`、理由 `amino-unsupported` で reject します。Amino JSON はハイブリッド署名を運べないためです。ライブラリは direct 署名に設定してください。
- MetaMask からインポートしたアカウント（coin 60）は `signAndBroadcast` で署名します。拡張機能は、これらのアカウントでは `signDirect`、したがって cosmjs の署名者も拒否します。
- `getKey` と `getAccounts` はアクティブなアカウントを返します。

Web アプリでは、[ウォレットアダプター](/developer-tools/wallet-adapter)と [QoreX integrations](/developer-tools/qorex-integrations) のパッケージ（RainbowKit、Interchain Kit、cosmos-kit）が、この検出と呼び出しをラップします。

## `signDirect` {#sign-direct}

`signDirect` は、ページが構築した `SignDoc` に署名します。本文にすでに ML-DSA レイヤーがある場合、QoreX はウィンドウを開く前に、チェーンと同じ方法でアカウントの登録済みの鍵に対して検証します。レイヤーがない場合は、上記のとおり QoreX が追加します。登録済みの鍵と一致しないレイヤー、ウォレット専用のメッセージ、QoreX が表示できないメッセージ、1,000 件を超えるメッセージは、承認画面が開く前に拒否されます。新しいコードでは `signAndBroadcast` のほうが簡単です。

## メッセージに署名する: `signArbitrary` と `verifyArbitrary` {#sign-arbitrary}

```js
const message = "Log in to example.com\nNonce: 1234";
const sig = await window.qorex.native.signArbitrary("qorechain-vladi", address, message);
const ok = await window.qorex.native.verifyArbitrary("qorechain-vladi", address, message, sig);
```

署名は [QoreSign message-signing-v1](/qoresign/spec/message-signing-v1) に従います。アカウントの従来型鍵（secp256k1、coin-60 アカウントでは eth_secp256k1）による ADR-36 に加え、`"qorechain-msg-v1|" + chainId + "|" + data` に対する ML-DSA-87 の署名です。Keplr の `pub_key` と `signature` フィールドも持つため、Keplr 向けに書かれたコードで読み取れます。ユーザーにはメッセージ全体が表示されます。メッセージは 1 から 4096 バイトで、他の QoreChain 署名ドメインで始まってはいけません。

**検証はページではなく、サーバーで行ってください。** ML-DSA の部分は、そのアドレスについてチェーンに登録された鍵に対して確認する必要があり、クライアントが送る鍵に対してではありません。[`@qorechain/qoresign`](/qoresign/overview) を使います。

```ts
import { verifyMessageWithChain } from "@qorechain/qoresign/network";

try {
  await verifyMessageWithChain({
    rest: "https://api.qore.host",     // the network's REST endpoint
    chainId: "qorechain-vladi",
    signer: address,                    // the qor1... address that signed
    data: message,                      // exactly the text you asked the user to sign
    signature: sig,                     // the object signArbitrary returned
  });
  // signed in
} catch (err) {
  // a QoreSignError with a stable code: the signature does not verify
}
```

`verifyMessageWithChain` は署名者の登録済み ML-DSA-87 鍵を取得し、何か検証できないものがあれば `QoreSignError` を throw します。そのネットワークでトランザクションを一度も送ったことのないアカウントには登録済みの鍵がなく、`KEY_NOT_REGISTERED` で失敗します。先にユーザーに QoreX から 1 回トランザクションを送ってもらってください。メッセージには 1 回限りの nonce とあなたのドメインを入れ、両方をサーバーで確認して、署名が別のサイトで再利用されないようにしてください。サインイン用メッセージについては QoreSign のガイドで詳しく説明しています。

## EVM の dApp {#evm}

QoreX は EIP-6963 に応答し、EIP-1193 プロバイダーを通じて、QoreChain の EVM レーン（チェーン ID **9801**、テストネット **9800**）で `personal_sign`、`eth_signTypedData_v4`、`eth_sendTransaction` に署名します。拡張機能では、サイトが `0x1` への `wallet_switchEthereumChain` を呼び出した後、Ethereum でも署名します（サイトごと）。読み取り専用のメソッド（`eth_call`、`eth_getBalance`、`eth_getLogs` などの標準的な読み取り）は、選択中のネットワークのノードに送られます。その他のメソッドは `4200` を返し、QoreX が署名するチェーン以外への `wallet_switchEthereumChain` や `wallet_addEthereumChain` は `4902` を返します。サイトはもう一方の QoreChain ネットワークに切り替えることはできず、その場合は `switch the network in QoreX itself` とともに `4100` が返ります。

```js
const [from] = await qorex.provider.request({ method: "eth_requestAccounts" });
const hash = await qorex.provider.request({
  method: "eth_sendTransaction",
  params: [{ from, to, value: "0x0", data }],
});
```

**承認画面でデコードされる内容。** すべてのウィンドウは、何を許可するのかを端末上でデコードして示します。送金、トークンの allowance（無制限の場合は UNLIMITED と表示）、`setApprovalForAll`、Permit と Permit2 の署名、Safe のトランザクション（DELEGATECALL は高リスクと表示）です。QoreX がデコードできない呼び出しは不明かつ高リスクと表示され、2 回目のタップが必要です。EIP-7702 の委任は拒否されます。

**シミュレーション。** 署名の前に、ウィンドウはトランザクションがユーザーの残高をどう変えるかを表示します。

- ノードで `eth_simulateV1`（送金トレース）が使える場合は、QOR とトークンの変化を表示します。
- `eth_simulateV1` のないノード（現在の QoreChain の EVM ノードが該当します）では `eth_call` のみが使え、呼び出しが revert するかどうかしか分かりません。その場合、データを伴う呼び出しは「what it does to your tokens was not checked」（トークンへの影響は未確認）と表示され、承認には 2 回目のタップが必要です。
- 失敗するトランザクションや、ノードがシミュレーションできないトランザクションも、2 回目のタップが必要です。
- シミュレーションは、トランザクションを受け取るのと同じノードに送られます。それ以外の場所には何も送られません。

この 2 回目のタップがユーザーの不意を突かないようにページを設計してください。呼び出しの内容はあなた自身の画面でも説明してください。

**トランザクションごとの EVM 認可ウィンドウ。** QoreChain では、EVM トランザクションは、ネイティブレーン上でアカウントのハイブリッド ML-DSA-87 署名により開かれた認可ウィンドウの中でのみ受け付けられます。トランザクションを許可するウィンドウがない場合は、同じ承認でまさにそのトランザクション用のウィンドウが開きます。

- 上限は金額に最大手数料を加えた額、
- 期間は約 10 分、
- ネットワークが対応していれば、トランザクションが呼び出すコントラクトに限定されます。

承認画面は、ウィンドウが許可するすべてのコントラクト（同じサイト向けに最近署名を検証したコントラクトを含む）を名前で示し、ユーザーが開いているウィンドウを置き換えることを表示します。ネットワークがウィンドウをコントラクトに限定できない場合、QoreX は無制限のウィンドウを開く前に、コントラクト名と、ウィンドウがどのコントラクトも許可することを示して 2 回目の確認をします。「いいえ」の場合は何も送信されません。QOR の上限は、最大手数料を含め、アカウントから出ていくすべての QOR を対象とし、ウィンドウによってユーザーが呼び出せるコントラクトは、引き続きアカウントの代わりに動くことができます（保有または承認したトークンや、他のコントラクトが保持する QOR）。[EVM アクセスウィンドウ](/qorex/security-and-recovery#evm-window)を参照してください。

**ユーザーが手動で開いたウィンドウ。** ユーザーがウィンドウ画面で開くウィンドウは、デフォルトで **QOR の送金のみ**です。任意のコントラクトの許可は、警告付きの別の選択肢です。そのため、ユーザーが以前開いたウィンドウは、トークンやコントラクトの呼び出しを対象にしません。ウィンドウがあることを前提にする dApp は、QoreX にトランザクションごとのウィンドウを開かせる（最も簡単で、最も範囲が狭い方法）か、自分で開く場合は**任意のコントラクト**を選ぶようユーザーに伝えてください。

**このレーンのその他のルール**

- QoreChain の EVM レーンで送信できるのは、MetaMask からインポートしたアカウント（coin type 60）のみです。その他のアカウントは `4100` を返し、メッセージでユーザーに次の手順を伝えます。
- staking、distribution、governance、vesting、bank、IBC のプリコンパイルは拒否されます（`4200`）。QoreChain ではこれらはネイティブレーンを通ります。
- EVM レーンの署名は従来型（secp256k1）です。QoreX はそれ以上を主張しません。
- 選択中とは別のチェーン向けの型付きデータは `-32602` で拒否されます。

## Solana の dApp（拡張機能） {#solana}

拡張機能は Solana mainnet（`solana:mainnet`）で Solana Wallet Standard に登録するため、Solana の dApp は独自のコードなしで QoreX を見つけます。機能は connect、disconnect、イベント、`solana:signMessage`、`solana:signTransaction`、`solana:signAndSendTransaction` で、legacy と v0 のトランザクションに対応します。`connect({ silent: true })` もサポートします。

承認画面は、System の送金、SPL Token と Token-2022 の送金、承認、権限の変更、アカウントのクローズをデコードし、メモの本文を表示します。QoreX がデコードできない命令はシート上で読み取り不能と表示され、承認には 2 回目のタップが必要です。ウォレットを署名者に含まないトランザクションは拒否され、`signMessage` は実際にはトランザクションであるバイト列に署名しません。署名は従来型で、そのように表示されます。

アプリのアプリ内ブラウザは Solana トランザクションに署名しません。QoreChain 自体の上の Solana は、ウォレット内の別のテストネット専用機能です。[テストネット専用の機能](/qorex/testnet-features)を参照してください。

## ウォレットがロックされている場合 {#locked}

拡張機能 0.4.4 と Safari 1.8.2 以降、QoreX がロックされている間の署名リクエスト（ネイティブ、EVM、Solana）は、サイト名を表示したパスワード画面でウォレットを開きます。ユーザーがロックを解除すると、そのウィンドウは閉じ、リクエストの承認画面が表示されます。代わりにユーザーがウィンドウを閉じると、リクエストはコード `4001` で拒否されます。以前は、このようなリクエストは「wallet is locked」ですぐに失敗していました。

- `enable`、`getKey`、`eth_requestAccounts` と署名メソッドは、このようにウォレットを起こします。
- ページが読み込み時に行う読み取り（`eth_accounts`、`eth_chainId`、チェーンの読み取り）はウィンドウを開きません。`eth_accounts` は空のリストを返すだけです。
- パスワードなしには何も署名されず、待機中のリクエストは、ユーザーがウォレットを切り替えるか再びロックすると「いいえ」と応答されます。

`4001` は障害ではなく、通常の結果として扱ってください。

## サイトが決して要求できないメッセージ {#wallet-only}

QoreX は、これらをどの経路（`signAndBroadcast`、`signDirect`、エージェントの提案）でも、どのサイトからも拒否します。アカウントに対する継続的な権限を渡すものだからです。ユーザーはこれらを QoreX 自体の画面から行います。

- ポスト量子鍵の管理: 鍵の登録、移行、ローテーション、暗号化鍵、PQC マルチシグの登録
- 認証子と支出ルール: 署名鍵の登録や取り消し、支出ルール、抽象アカウントの作成
- EVM ウィンドウの開閉とクリア（および委任の同意）
- QoreChain 上の Solana のウィンドウの開閉と、Solana のリレーメッセージ
- `MsgGrant` または `MsgExec` の authz grant（`MsgGrant`）。そのような付与があると、受け手がアカウントとして行動できるためです。

この拒否は、直接の場合、どの深さの `MsgExec` の中でも、そしてこれらのメッセージの汎用 grant としても適用されます。エラーは `QoreX: <type> is managed by the wallet itself, not by a website` です。

## エラーとイベント {#errors}

エラーには EIP-1193 の `code` が含まれます。

| コード | 意味 |
|---|---|
| `4001` | ユーザーが拒否した、またはウィンドウ（ロック解除ウィンドウを含む）を閉じた。 |
| `4100` | 未認可: 不明なアカウント、登録済みのポスト量子鍵がない（`reason: pqc-key-missing`）、coin-118 アカウントが EVM レーンを使おうとした、またはネットワークの切り替え要求。 |
| `4200` | 非対応: Amino（`reason: amino-unsupported`）、QoreX が署名しない EVM メソッド、EIP-7702 の委任、ネイティブ専用のプリコンパイル。 |
| `4901` | Solana のチェーンが違う。 |
| `4902` | 不明なチェーン。 |
| `-32602` | 不正なパラメータ（例: 別のチェーン向けの型付きデータ）。 |

イベント:

- EVM プロバイダー: 拡張機能では `connect`、`accountsChanged`、`chainChanged`。アプリでは `connect` のみ。
- ネイティブレーン（拡張機能）: アカウント、ウォレット、ネットワークが変わると、ウィンドウイベント `qorex_keystorechange`。cosmos-kit はこれを待ち受けます。
- Solana Wallet Standard: `change`。

## サービスが生成できるリンク {#links}

3 種類のリンクで、別のページやアプリから QoreX を開けます。

### アプリでページを開く: `browse` {#link-browse}

```
https://link.qore.network/browse?url=<encodeURIComponent(https URL)>
qorex://browse?url=<encodeURIComponent(https URL)>
```

スマートフォンでは、このリンクは通常の生体認証の後、QoreX の dApp ブラウザであなたのページを開きます。ページはドメイン名の `https://` である必要があります。ページに次のいずれかが含まれる場合、QoreX はリンクを拒否します。

- ポート
- ユーザー名やパスワード
- IP アドレス
- `localhost`
- バックスラッシュや空白
- 2048 文字超

このリンクはページに何の権限も与えません。ページは引き続き接続を求め、すべての署名は引き続き承認シートを通ります。スマートフォンにウォレットがない場合、アプリはオンボーディングのままです。QoreX がインストールされていない場合、https 形式は入手用リンクのあるページを表示します。拡張機能には `browse` リンクはありません。

### 支払いを請求する: `qorex://pay` {#link-pay}

```
qorex://pay?v=1&net=qorechain-vladi&to=qor1...&amt=1500000&d=uqor&id=pr_...&tag=...&pk=...&sig=...
```

支払いリクエストリンクには、受取人、基本単位の金額、デノム、リクエスト ID とそのメモタグ、任意のメモと @handle、ネットワーク、そしてそれらすべてに対する受取人自身のアカウント鍵による署名が含まれます。支払う側の QoreX は、署名、署名鍵が受取アドレスの所有者であること、正確なネットワーク、@handle を確認してから、送金前に通常の確認画面を表示します。金額や受取人の改変は検出され、リクエストはチェーンを読み取って支払い済みになります。

手作業ではなく、**QoreX 自体のリクエスト画面で生成してください**（アプリの**支払いリクエスト**、**新しいリクエスト**）。署名はアカウント鍵で行われ、ページがその鍵を保持することはありません。自分で作成または改変したリンクはサポート対象外とみなしてください。このリンクの Web 形式はまだありません。

### エージェントの提案を渡す: `qorex://propose` {#link-propose}

```
qorex://propose?d=<base64url of the proposal JSON>
```

アプリのみです。このリンクは AI エージェントが提案するトランザクションを運びます。QoreX はそれを検証し、シミュレーションして、通常の承認ウィンドウに表示します。提案がそのまま署名されることはなく、リンクで運べるのは最大 64 KB です。下記の [AI エージェントのモデル](#agents)を参照してください。

## AI エージェント {#agents}

ウォレットと連携する AI エージェントを作る場合のモデルは、エージェントはユーザーが許可した内容を読み取り、トランザクションを**提案**できますが、署名は決してしない、というものです。QoreX はすべての提案を確認してシミュレーションし、ユーザーは dApp のリクエストと同じ承認ウィンドウで承認または拒否します。ウォレット専用メッセージの提案は、ウィンドウが開く前に拒否されます。拡張機能では、エージェントはユーザーのコンピューター上の、まだ公開されていないコンパニオンプログラムを通じて QoreX に接続します。アプリでは、提案は貼り付けるか、`qorex://propose` リンクで届きます。ユーザーがこれをオンにする方法と表示内容については、[開発者モード: AI エージェント](/qorex/developer-mode#ai-agents)をご覧ください。

## テストネット {#testnet}

**dApp はネットワークを切り替えられません。** リクエストの `chainId` はウォレットが接続しているネットワークと一致する必要があり、不一致は拒否されます。これにより、資金が同じに見えても実際は違うネットワークへユーザーを移そうとするページから、ユーザーを守ります。

テストネット（`qorechain-diana`、EVM チェーン ID 9800）を使うには、ユーザーが QoreX で切り替えます。

- **アプリ:** 設定、次に**テストネットを使う（開発者向け）**。
- **拡張機能:** 開発者モードをオンにし（ポップアップ下部のバージョン番号を 7 回タップ）、**テストネット（diana）に切り替え**を選びます。**メインネットに戻る**でデフォルトに戻ります。

その後、すべての画面に TESTNET バナーが表示され、テストネットの残高にはドル建ての価値が表示されず、再起動せずにネットワークが切り替わります。テストネット版のページを開く前に切り替えるよう、ユーザーに伝えてください。テストネット専用のウォレット機能（IBC、QoreChain Bridge 画面、QoreChain 上の Solana）は[テストネット専用の機能](/qorex/testnet-features)で説明しています。

## トラブルシューティング {#troubleshooting}

| 表示される内容 | 理由と対処 |
|---|---|
| `window.keplr` が undefined | 仕様です。`window.qorex.native`、または QoreX コネクタのあるライブラリを使ってください。 |
| `window.ethereum` が QoreX ではない | 仕様です。EIP-6963（`rdns` `network.qore.qorex`）でウォレットを選んでください。 |
| `QoreX: chain X does not match the active network Y` | ユーザーはもう一方のネットワークにいます。QoreX で切り替えてもらってください。あなたは切り替えられません。 |
| `4100`、`pqc-key-missing` | アカウントにまだネットワーク上のポスト量子鍵がありません。ユーザーに QoreX から 1 回トランザクションを送ってもらうか、`signAndBroadcast` を使ってください。 |
| `4200`、`amino-unsupported` | ライブラリが Amino を要求しています。direct 署名に設定してください。 |
| `QoreX: <type> is managed by the wallet itself, not by a website` | ウォレット専用のメッセージです。削除してください。ユーザーが QoreX から行います。 |
| `QoreX cannot show what <type> does, so it will not sign it` | QoreX がデコードできないメッセージです。表示できるタイプを使ってください。 |
| `QoreX: send between 1 and 32 messages` | リクエストを分割してください。 |
| `QoreX: the memo may be at most 256 bytes` | メモを短くしてください。 |
| `QoreX: a message must be 1 to 4096 bytes` | 署名を求めるメッセージを短くしてください。 |
| `needs about N gas, more than the 20,000,000 QoreX allows` | コントラクト呼び出しが 1 トランザクションには重すぎます。分割してください。 |
| `QoreX: EVM method X not yet supported`（`4200`） | QoreX が署名するのは `personal_sign`、`eth_signTypedData_v4`、`eth_sendTransaction` のみです。 |
| `QoreX: this account uses the QoreChain (coin 118) key and cannot send on QoreChain's EVM lane` | EVM レーンで送信できるのは、MetaMask からインポートしたアカウント（coin 60）のみです。 |
| `QoreX: staking, rewards, IBC and governance on QoreChain go through the native lane` | これらはネイティブレーンを呼び出してください。EVM のプリコンパイルは拒否されます。 |
| EVM の呼び出しで毎回 2 回目のタップが必要になる | ノードが呼び出しのトークンへの影響を確認できないか、呼び出しをデコードできません。ページで説明してください。 |
| ユーザーがウィンドウを開いたのにトークンの呼び出しが失敗する | ユーザーが手動で開いたウィンドウは、デフォルトで QOR の送金のみが対象です。QoreX にトランザクションごとのウィンドウを開かせるか、任意のコントラクトを選ぶようユーザーに伝えてください。 |
| ページが署名を求めた直後の `4001` | ユーザーが拒否したか、ロックされたウォレットのロック解除ウィンドウを閉じました。再試行を提案してください。 |
| `eth_accounts` が `[]` を返す | サイトはまだ接続されていません。`eth_requestAccounts` を呼び出してください。 |
| `browse` リンクが何も起こさない | ページのアドレスがルール（ポート、IP、`localhost`、https でない、2048 文字超）に反しているか、スマートフォンにまだウォレットがありません。 |
| サーバーで `KEY_NOT_REGISTERED` | 署名者はそのネットワークでトランザクションを送ったことがありません。先に 1 回送ってもらってください。 |

問題が解決しない場合は、ユーザーが[開発者モード](/qorex/developer-mode)から機密情報を伏せたリクエストログを送ることができ、テストネットで再現を試すこともできます。

## 公開先 {#where-published}

| 内容 | 場所 |
|---|---|
| QoreX ブラウザ拡張機能 | Chrome ウェブストア、Firefox アドオン、Mac App Store（Safari）。[ブラウザ拡張機能](/qorex/browser-extension#install)を参照してください。 |
| QoreX アプリとその dApp ブラウザ | App Store と Google Play。[QoreX Wallet](/qorex/overview#how-to-access) を参照してください。 |
| メッセージとトランザクションの検証 | `@qorechain/qoresign`（TypeScript とその他の言語）。[QoreSign](/qoresign/overview) を参照してください。 |
| Web アプリ向けのウォレット検出 | [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) |
| RainbowKit、Interchain Kit、cosmos-kit のコネクタ、型、テスト用ウォレット | [`@qorechain/qorex-*`](/developer-tools/qorex-integrations) |
| トランザクションの構築と送信のためのコア SDK | [開発者ツール](/developer-tools/overview) |

QoreX のソースコードは公開されていません。各ストアの現在のバージョンは[概要](/qorex/overview#versions)ページにあります。
