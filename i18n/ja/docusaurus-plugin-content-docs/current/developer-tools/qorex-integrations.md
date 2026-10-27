---
slug: /developer-tools/qorex-integrations
title: QoreX インテグレーション
sidebar_label: QoreX インテグレーション
sidebar_position: 22
---

# QoreX インテグレーション (`@qorechain/qorex-*`)

QoreX インテグレーションは、[QoreX ウォレット](/qorex/overview)を EVM、Cosmos、Solana のフロントエンドで動作させたい dApp 開発者と、それらのフロントエンドをテストするチーム向けの、6 つの小さな npm パッケージです。3 つは人気のあるライブラリ向けのウォレットコネクタ（RainbowKit、Interchain Kit、cosmos-kit）、1 つは共有の型と検出ヘルパーを含み、2 つはテスト用ツール（モックウォレットと Playwright フィクスチャ）です。6 つともバージョンは **0.1.0** で、2026年10月27日に公開され、ライセンスは Apache-2.0 です。

これらにできないこと: 鍵を保持することはなく、QoreX を現在の姿以上のものにすることもありません。これらの上に構築する前に[制限と既知の問題](#limits)を読んでください。現在公開されている QoreX のストア版ビルドがサポートしているのは、これらのパッケージが接続できる機能の一部であり、その制限はそこに記載されています。

## 革新点 {#innovations}

* **誤ったウォレットを選ぶことのない検出。** QoreX は EIP-6963 を通じて逆引きドメイン名 `network.qore.qorex` で自身を通知し、`window.ethereum` には決して書き込みません。`@qorechain/qorex-types` はその名前のみでプロバイダーを選択し、RainbowKit ウォレットはコネクタを通知されたプロバイダーに固定して、`window.ethereum` にフォールバックすることはありません。
* **ハイブリッド署名はウォレットが構築し、ページがポスト量子鍵を保持することはありません。** QoreChain のネイティブレーンには、secp256k1 署名と ML-DSA-87 署名（FIPS 204）が必要です。ネイティブプロバイダー（`window.qorex.native`）では、`signAndBroadcast` の呼び出しがメッセージを QoreX に渡し、QoreX がトランザクションを構築し、両方の鍵で署名してブロードキャストします。結果は `txHash`、`code`、`height`、`shield` で、`shield` はコミットされたトランザクションがハイブリッドレイヤーを持つと `shielded` になります。
* **バージョンチェックではなくケイパビリティチェック。** パッケージはウォレットの `capabilities` リスト（`hasCapability`）を読み取るため、`signAndBroadcast` のような機能はバージョン番号から推測されるのではなく、検出されます。
* **拒否は明示的で、安定したコードを持ちます。** Amino JSON ではハイブリッド署名を運べないため、Amino 署名は設計上拒否されます。コネクタは `QOREX_AMINO_REFUSED`、`QOREX_USE_SIGN_AND_BROADCAST`、`QOREX_NOT_SUPPORTED_YET` といったコードで `QorexIntegrationError` をスローし、`isQorexIntegrationError(err, code)` でそれらを判定できます。
* **本当に署名するテストダブル。** `@qorechain/qorex-wallet-mock` は QoreX が注入するのと同じオブジェクト（`window.qorex = { evm, native, svm }`）を注入し、Solana ウォレットを登録し、デフォルトではテストネットの公開テスト用ニーモニックから、実際のアルゴリズム（ネイティブレーンでは QoreSign によるハイブリッド ML-DSA-87、EVM では secp256k1、Solana では ed25519）で署名します。`network.qore.qorex.mock` として自身を通知するため、QoreX を厳密に選択するコードがこれを本物のウォレットと取り違えることはありません。
* **2 つの動作プロファイル。** モックの `current` プロファイルは現在公開されている QoreX と同様に動作します。`planned` は QoreX チームが発表した内容を追加するため、ウォレットがまだ行わないことをモックが主張することなく、先行して構築できます。
* **Synpress v4 スタイルの Playwright フィクスチャ**（`qorexMockFixtures`）は、ナビゲーションの前にモックを注入するため、エンドツーエンドのテストにブラウザ拡張機能は不要です。
* **イベントなしのウォレット主導アカウント。** QoreX はまだ `accountsChanged` や `chainChanged` を発行しないため、RainbowKit ウォレットにはオプトインの `pollAccountsOnFocus` があり、ページがフォーカスを取り戻したときに `eth_accounts` と `eth_chainId` を再読み取りします。

## 用途 {#use-cases}

1. **wagmi と RainbowKit の dApp に QoreX を追加する。** RainbowKit のウォレットリストに `qorexWallet` を、wagmi の設定に `QOREX_CHAINS` を追加します。QoreX を持つユーザーは接続でき、dApp はその `0x` アドレスとチェーン ID（9801 または 9800）を読み取ります。QoreX を持たないユーザーにはストアへのリンクが表示されます。
2. **Interchain Kit または cosmos-kit 上の Cosmos dApp に QoreX を追加する。** `ChainProvider` に QoreX ウォレットを追加し、`qorexSignAndBroadcast` で QoreChain のトランザクションを送信します。ページは ML-DSA-87 鍵を保持できないため、QoreX がトランザクションを構築し、ハイブリッド署名を付加してブロードキャストします。
3. **すでに Keplr をサポートしている dApp。** `window.qorex.native` は Keplr のパターン（`enable`、`getKey`、`signDirect`）に従うため、統合は数行で済みます。リポジトリのガイドに、すべての違いが記載されています。
4. **拡張機能なしでのウォレットフローの CI テスト。** QA チームが `qorexMockFixtures({ profile: "current" })` を使って Playwright を実行し、Connect をクリックして、ページが `qorex.addresses.evm` を表示することをアサートします。`qorex.rejectNext()` で拒否パスをテストします。
5. **新しい QoreX 機能に先行して構築する。** 同じスイートを `profile: "planned"` で実行すると、発表済みの機能（EVM 署名、アカウント変更イベント、ハイブリッドレイヤーを追加する `signDirect`）を、QoreX が提供する前に試せます。
6. **テストネットでの実際のブロードキャストのテスト。** チームは、資金のある自前のテストネット用ニーモニックを使い、モックにハイブリッド署名付きトランザクションを `qorechain-diana` へ `signAndBroadcast` させ、ページで結果を確認します。
7. **バージョンチェックの代わりの機能検出。** `hasCapability(native, "signAndBroadcast")` が true のとき、dApp は QoreChain 上で Send ボタンを表示します。そのため、新しい QoreX ビルドは dApp を変更することなく機能を有効にします。

## 仕組み {#how-it-works}

* **EVM レーン。** QoreX は `window.ethereum` には決して書き込みません。EIP-6963 を通じて、逆引きドメイン名 `network.qore.qorex` で EIP-1193 プロバイダーを通知します。`qorexWallet()` と `discoverQorexEip1193()` は、まさにそのプロバイダーを選択します。同じオブジェクトは `window.qorex.evm` にもあります。
* **ネイティブレーン。** `window.qorex.native` は Keplr パターンのプロバイダーです（`window.keplr` のエイリアスではありません）。QoreChain はネイティブレーンのトランザクションにハイブリッドの secp256k1 と ML-DSA-87 の署名を必要とし、ML-DSA-87 鍵を保持するのはウォレットだけなので、dApp はメッセージを `signAndBroadcast` に送ります。QoreX はそれらを表示し、手数料を設定し、両方の鍵で署名し、ブロードキャストして `shield` を報告します。
* **Solana。** QoreX は `solana:mainnet`（Solana 本体）に Solana Wallet Standard ウォレットを登録します。QoreChain 独自の SVM レーンはトランザクションをまだ受け付けておらず、Wallet Standard のチェーン ID もありません。
* **バージョンではなくケイパビリティ。** キットは `hasCapability` を通じて `window.qorex.native.capabilities` を読み取ります。QoreX ビルドは `listAccounts`、`connectProofPicksAccount`、`executeRequest`、`signAndBroadcast` を宣言することがあります。
* **Amino は設計上拒否されます。** Amino JSON はハイブリッドの ML-DSA-87 署名を運べないためです。キットはすべての署名者リクエストを direct signer で処理します。
* **`signDirect` とポスト量子レイヤー、正確に。** 現在、QoreX の `signDirect` は SignDoc をそのまま secp256k1 鍵で署名します。QoreChain では、本文に署名者の登録済み鍵に対する有効なハイブリッド ML-DSA-87 レイヤーがすでに含まれている必要がありますが、ページはこれを生成できません。そのため `qorechain-vladi` と `qorechain-diana` では、キットのオフライン署名者の `signDirect` は QoreX に到達する前に `QOREX_USE_SIGN_AND_BROADCAST` をスローします。`getAccounts` はすべてのチェーンで動作します。他のチェーン ID では、キットは `signDirect` を QoreX に転送しますが、QoreX が現在提供するのは 2 つの QoreChain チェーン ID のみです。将来の QoreX リリースで、`signDirect` 内でレイヤー自体を追加し、ケイパビリティ `signDirectAddsPqcLayer` を宣言することが予定されていますが、現在のビルドでこれを宣言しているものはありません。キットはすでにこれを確認しており、宣言されている場合、オフライン署名者は QoreChain の SignDoc を QoreX に転送します。その際 QoreX がガスを再見積もりしてガスリミットと手数料を引き上げることがあるため、返された `signed` ドキュメントを必ずブロードキャストしてください。
* **`shield` の状態**は `signAndBroadcast` が返します: `shielded`（コミットされたトランザクションがハイブリッドレイヤーを持つ）、`pending`（ブロードキャスト済み、確認は未完了）、`downgraded`（レイヤーなしでコミットされた。警告として扱ってください）、`classical`（レイヤーが適用されないレーン）。
* **モック**は、QoreX と同じ方法で BIP-39 ニーモニック（デフォルトは公開テスト用フレーズ）からアカウントを構築します: `m/44'/118'/0'/0/i` とその `qor1` アドレスの正規の ML-DSA-87 鍵、EVM には `m/44'/60'/0'/0/i`、Solana には `m/44'/501'/i'/0'`。その `signAndBroadcast` は REST からアカウントの ML-DSA-87 鍵を読み取り、未登録であれば `MsgRegisterPQCKeyV2` で一度だけ登録し、[QoreSign](/qoresign/overview) でハイブリッド署名し、ブロードキャストし（ネットワークが求めた場合は、もう一方の sign-bytes バージョンで一度だけ再試行します）、取り込みを待って `{ txHash, code, height, shield }` を返します。

### 現在 QoreX がサポートする内容 {#qorex-today}

| 対象 | 現在 | QoreX チームの予定 |
|---|---|---|
| EVM（EIP-6963 を通じた EIP-1193、`network.qore.qorex`） | 接続（`eth_requestAccounts`）、`eth_accounts`、`eth_chainId`、QoreX ですでに選択されているネットワークへの `wallet_switchEthereumChain` | `accountsChanged` と `chainChanged` イベント、すべての拒否に対する EIP-1193 エラーコード 4200 と 4902、`personal_sign`、`eth_signTypedData_v4`、`eth_sendTransaction`、`wallet_addEthereumChain` |
| QoreChain ネイティブレーン（`window.qorex.native`） | `enable`、`getKey`、`signAndBroadcast`、`listAccounts`、`experimentalSuggestChain`（QoreChain の ID）、`signDirect`（SignDoc がすでにハイブリッドレイヤーを持っている必要があります） | ML-DSA-87 レイヤー自体を追加する `signDirect`、メッセージ署名（ADR-36 と ML-DSA-87） |
| Solana（Wallet Standard、`solana:mainnet`） | 接続、`signMessage`、`signTransaction` | `solana:signIn` |

EVM 側では、署名と送信は現在 "QoreX: EVM method ... not yet supported" で失敗します。QoreChain 上のトランザクションにはネイティブレーンを使用してください。QoreChain の EVM レーンでは、送信者が登録済みの ML-DSA-87 鍵と、ネイティブレーンから開いた EVM 認可ウィンドウを持っている場合にトランザクションが受け付けられます。ネットワークの切り替えはユーザーが QoreX 内で行います。dApp から切り替えることはできません。

## 使い方 {#how-to-use}

以下のコードブロックは、開発者ハブのクイックスタートです。それぞれ、公開 npm レジストリからインストールした後（Node 26。ブラウザコードには jsdom 30 と `react-dom/client`。フィクスチャには Playwright 1.64 と Chromium）、2026年10月27日に `tsc` で型チェックして実行し、成功しました。トランザクションを送信するものも、資金のある鍵を必要とするものもありません。観測された結果をそれぞれに記載しています。ウォレット側の動作（実際のブラウザでの本物の QoreX）は、このページのためにはテストしていません。

### `@qorechain/qorex-types`: QoreX を検出する {#types}

```bash
npm install @qorechain/qorex-types
```

```ts
import { discoverQorexEip1193, getQorexNative, hasCapability } from "@qorechain/qorex-types";

// EVM: EIP-6963 discovery by rdns "network.qore.qorex" (QoreX never writes window.ethereum).
const evm = await discoverQorexEip1193({ timeoutMs: 500 });
console.log(evm ? "QoreX EVM provider found" : "QoreX EVM provider not announced");

// QoreChain native lane: window.qorex.native.
const native = getQorexNative();
if (native && hasCapability(native, "signAndBroadcast")) {
  const key = await native.getKey("qorechain-diana");
  console.log("native account:", key.bech32Address);
}
```

モックの下での観測結果: `QoreX EVM provider not announced`、続いて `native account: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`。1 行目はモックの下では想定どおりです（[EIP-6963 に関する注意](#limits)を参照）。このパッケージには実行時の依存関係がなく、`@qorechain/qorex-types/icon` から QoreX アイコンをデータ URI としてもエクスポートします。その他のエクスポート: プロバイダーの型、`isQorexInstalled`、`qorexSignAndBroadcast`、QoreX の EVM 拒否を分類するヘルパー。

### `@qorechain/qorex-rainbowkit`: RainbowKit と wagmi での QoreX {#rainbowkit}

```bash
npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

```ts
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { QOREX_CHAINS, qorechain, qorechainTestnet, qorexWallet } from "@qorechain/qorex-rainbowkit";

const connectors = connectorsForWallets(
  [{ groupName: "Recommended", wallets: [qorexWallet, metaMaskWallet] }],
  { appName: "My dApp", projectId: "<walletconnect project id>" },
);

export const config = createConfig({
  chains: QOREX_CHAINS, // QoreChain mainnet (9801) and testnet (9800)
  connectors,
  transports: { [qorechain.id]: http(), [qorechainTestnet.id]: http() },
});
console.log(config.chains.map((c) => `${c.id} ${c.name}`), connectors.length, "connectors");
```

観測結果: `[ '9801 QoreChain', '9800 QoreChain Testnet' ] 2 connectors`。`QOREX_CHAINS` には EVM レーン向けの viem チェーン定義が含まれます（RPC は `https://evm.qore.host` と `https://evm-testnet.qore.host`、ネイティブ通貨は 18 桁の QOR、エクスプローラーは `https://explore.qore.network`）。`projectId` は WalletConnect のプロジェクト ID で、ご自身で WalletConnect に作成します。ピア依存関係: `viem` ^2、`wagmi` ^2.9、`@rainbow-me/rainbowkit` ^2.2.11。ウォレット内で行われたアカウントやネットワークの変更を反映するには、`wallets: [() => qorexWallet({ pollAccountsOnFocus: true })]` を使用します。

### `@qorechain/qorex-interchain-kit`: Cosmos dApp（新規開発に推奨） {#interchain-kit}

```bash
npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@interchain-kit/react";
import { qorexWallet } from "@qorechain/qorex-interchain-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[qorexWallet]}>
      {children}
    </ChainProvider>
  );
}
```

観測結果: コンポーネントは、QoreChain テストネットの chain-registry エントリとともに jsdom でマウントされました（`@interchain-kit/react` 0.11.1）。ピア依存関係: `@interchain-kit/core` ^0.11。QoreChain のトランザクションは `qorexSignAndBroadcast` で送信します。

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],
  memo: "",
});
```

この呼び出しは 1 から 32 件のメッセージと最大 256 バイトのメモを受け付け、QoreX はユーザーに承認を求めます。このスニペットはパッケージの README からのもので、このページのためには実行していません。

### `@qorechain/qorex-cosmos-kit`: cosmos-kit 上の Cosmos dApp {#cosmos-kit}

```bash
npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as qorexWallets } from "@qorechain/qorex-cosmos-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[...qorexWallets]} throwErrors={false}>
      {children}
    </ChainProvider>
  );
}
```

観測結果: QoreChain テストネットのエントリとともに jsdom でマウントされました（`@cosmos-kit/react` 2.24.1）。**コードが型チェックを通るには `throwErrors={false}` が必須です。** `@cosmos-kit/react` 2.24 は `throwErrors` を必須プロパティとして型付けしていますが、パッケージの README の例には含まれていません。ピア依存関係: `@cosmos-kit/core` ^2.18.1。パッケージの README は、新規の dApp には Interchain Kit を推奨しています。こちらも `qorexSignAndBroadcast` をエクスポートします。

### `@qorechain/qorex-wallet-mock`: QoreX のテストダブル {#wallet-mock}

```bash
npm install -D @qorechain/qorex-wallet-mock
```

```ts
import { createQorexMock } from "@qorechain/qorex-wallet-mock";

// jsdom / Vitest: install a QoreX test double into window (public test phrase, testnet only).
const mock = createQorexMock({ profile: "current" });
mock.install(window);

const [account] = (await window.qorex!.evm.request({ method: "eth_requestAccounts" })) as string[];
const chainId = await window.qorex!.evm.request({ method: "eth_chainId" });
console.log(account, chainId, mock.addresses());
```

観測結果: `0x9858EfFD232B4033E47d90003D41EC34EcaEda94 0x2648 { native: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h, evm: 0x9858..., svm: HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk }`。アカウントは QoreX が導出するのと同じ方法で導出されます（その `qor1` アドレスの正規の ML-DSA-87 鍵を伴う `m/44'/118'/0'/0/i`、EVM には `m/44'/60'/0'/0/i`、Solana には `m/44'/501'/i'/0'`）。オプションには `profile`、`mnemonic`、`accountIndex`、`chainId`（デフォルトは `qorechain-diana`）、`autoApprove`、`allowMainnet` があります。ページには `approveNext()`、`rejectNext()`、`requests`、`switchAccount(i)` を持つ `window.__qorexMock` も追加されます。Playwright では、`page.addInitScript` で `mock.initScript()` を注入します（Node 20.16 以降）。

### `@qorechain/qorex-synpress`: Playwright フィクスチャ {#synpress}

```bash
npm install -D @qorechain/qorex-synpress @playwright/test
```

```ts
import { qorexMockFixtures } from "@qorechain/qorex-synpress";

// A Playwright test with the QoreX mock injected before navigation (no Synpress needed).
const test = qorexMockFixtures({ profile: "current" });
const { expect } = test;

test("connects", async ({ page, qorex }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(page.getByTestId("account")).toHaveText(qorex.addresses.evm);
});
```

観測結果: `1 passed`。Connect ボタンが `eth_requestAccounts` を呼び出すローカルページに対して実行しました（Playwright 1.64、Chromium）。フィクスチャを Synpress と組み合わせるには、`@synthetixio/synpress@4.1.2` をインストールして `testWithSynpress` でラップします。`qorex` フィクスチャは `addresses`、`approveNext()`、`rejectNext()`、`requests()`、`switchAccount(i)`、`disconnect()` を公開します。ピア依存関係: `@playwright/test` 1.48 以降。状態はページ内に存在するため、ナビゲーションのたびに新しいモックが開始されます。

### QoreChain でトランザクションを送信する {#send-transaction}

同じ呼び出しは `@qorechain/qorex-interchain-kit`、`@qorechain/qorex-cosmos-kit`、`@qorechain/qorex-types` にもあります:

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: MsgSend.encode(msg).finish() }],
  memo: "",
  gasLimit: 200000,
});
```

* `value` は protobuf エンコードされたメッセージです: `Uint8Array`、`number[]`、または base64。
* メッセージは 1 から 32 件、メモは最大 256 バイト。`gasLimit` は 100,000 から 5,000,000 の範囲に丸められます（省略時は 400,000）。手数料は QoreX が設定し、署名の前に表示します。
* `chainId` は QoreX で選択されているネットワークと一致している必要があります。
* アカウントの ML-DSA-87 鍵を管理するメッセージはウォレット側のものであり、`MsgExec` の内側であっても拒否されます。QoreX が表示できないメッセージタイプは拒否されます。
* キットを使わない場合は、`hasCapability(native, "signAndBroadcast")` を確認した後に `window.qorex.native.signAndBroadcast(request)` を呼び出します。`getKey` は `pubKey` と `address` を `number[]` として返します。`Uint8Array.from(key.pubKey)` で変換してください（キットがこれを代行します）。

### フィクスチャを使わない Playwright でのモック {#mock-playwright}

```ts
import { createQorexMock } from "@qorechain/qorex-wallet-mock";

const mock = createQorexMock({ profile: "current" });
await page.addInitScript({ content: mock.initScript() });
await page.goto("http://localhost:5173");
await page.evaluate(() => window.__qorexMock!.rejectNext());
```

## 主な API {#main-api}

| パッケージ | 名前 | 内容 |
|---|---|---|
| types | `discoverQorexEip1193({ timeoutMs })`、`findQorexEip1193()` | QoreX EVM プロバイダーの非同期 EIP-6963 検出と、その同期プローブ |
| types | `getQorexNative()`、`isQorexInstalled()`、`hasCapability(native, capability)` | `window.qorex.native` の読み取り、QoreX の存在確認、ケイパビリティのテスト |
| types | `qorexSignAndBroadcast(request, { native? })` | メッセージを QoreX に渡します。QoreX がない場合は `QOREX_NOT_INSTALLED` を、これに対応していない旧バージョンの QoreX では `QOREX_NOT_SUPPORTED_YET` をスローします |
| types | `QorexIntegrationError`、`isQorexIntegrationError(err, code)` | これらのパッケージからのエラー（安定したコード付き） |
| types | `isQorexUnsupportedMethodError`、`isQorexUnrecognizedChainError`、`QOREX_EVM_ERROR_CODES` | QoreX の EVM 拒否を分類します: `code`（4200、4902）を確認し、現在のメッセージ文にフォールバックします |
| types | `QorexEip1193Provider`、`QorexNativeProvider`、`QorexSolanaStandardWallet`、`QorexSvmProvider`、`@qorechain/qorex-types/icon` | QoreX が注入するものの型、データ URI としての QoreX アイコン |
| rainbowkit | `qorexWallet(options?)`、`createQorexConnector`、`getQorexEip1193Provider` | RainbowKit ウォレット（オプション `pollAccountsOnFocus`）、wagmi コネクタ、およびそれが使うプロバイダー |
| rainbowkit | `qorechain`、`qorechainTestnet`、`QOREX_CHAINS` | viem チェーン 9801 と 9800 |
| interchain-kit | `qorexWallet`、`createQorexWallet()`、`QorexCosmosWallet` | Interchain Kit ウォレット |
| cosmos-kit | `wallets`、`qorexExtension`、`QorexExtensionWallet`、`QorexClient` | cosmos-kit ウォレット |
| 両方のキット | `qorexSignAndBroadcast`、`QOREX_CAPABILITY_SIGN_DIRECT_ADDS_PQC_LAYER`、チェーン ID の定数、エラーヘルパー | `qorex-types` から再エクスポート |
| wallet-mock | `createQorexMock(options)` | `{ install(window), initScript(), addresses(), ... }` を返します |
| wallet-mock | `window.__qorexMock` | `approveNext()`、`rejectNext()`、`pendingApprovals`、`requests`、`clearRequests()`、`switchAccount(i)`、`switchNetwork(chainId)`、`disconnect()`、`addresses()` |
| wallet-mock | `PUBLIC_TEST_MNEMONIC` | 公開の BIP-39 テスト用フレーズ（決して入金しないでください） |
| synpress | `qorexMockFixtures(options)` | 自動の `qorex` フィクスチャを持つ Playwright の `test` |
| synpress | `qorex.addresses`、`approveNext()`、`rejectNext()`、`waitForApproval()`、`pendingApprovals()`、`requests()`、`clearRequests()`、`switchAccount(i)`、`switchNetwork(chainId)`、`disconnect()`、`mock` | フィクスチャのコントロール |
| synpress | `qorexExtensionFixtures({ extensionPath })` | 実際の拡張機能向けに予定されているインターフェース。現在は `QorexExtensionModeUnavailableError` をスローします |

Synpress v4 では、フィクスチャを `testWithSynpress(qorexMockFixtures({ profile: "planned" }))` としてマージします。`autoApprove: false` の場合は、`await qorex.waitForApproval()` を呼び出して保留中の状態を確認し、その後 `qorex.approveNext()` を呼び出します。現在の QoreX と次のリリースの両方をカバーするため、スイートを両方のプロファイルで実行してください。

### キットの署名者の動作 {#kit-signer}

| 呼び出し | Interchain Kit | cosmos-kit |
|---|---|---|
| `connect` または `enable`、`getAccount`、`getKey` | QoreX の `enable` と `getKey`、バイト列は `Uint8Array` に変換 | 同じ |
| `getOfflineSigner(chainId)` | すべての設定に対して direct signer | cosmos-kit のデフォルト `"amino"` を含め、すべての設定に対して direct signer |
| QoreChain 上の署名者 `signDirect` | `QOREX_USE_SIGN_AND_BROADCAST` をスロー（QoreX が `signDirectAddsPqcLayer` を宣言するまで） | 同じ |
| 他のチェーン ID 上の署名者 `signDirect` | QoreX の `signDirect` に転送 | 同じ |
| `signAmino`、`getOfflineSignerAmino` | `QOREX_AMINO_REFUSED` をスロー | 同じ |
| `signArbitrary`（ADR-36） | `QOREX_NOT_SUPPORTED_YET` をスロー（`verifyArbitrary` も同様） | `QOREX_NOT_SUPPORTED_YET` をスロー |
| `sendTx` | `QOREX_NOT_SUPPORTED_YET` をスロー。ご自身の RPC エンドポイント経由でブロードキャストしてください | 提供されません |

### モックのオプション {#mock-options}

| オプション | デフォルト | 意味 |
|---|---|---|
| `profile` | `"current"` | `"current"` は現在の QoreX、`"planned"` は発表済みの機能を追加します |
| `mnemonic` | 公開の BIP-39 テスト用フレーズ | 入金するものにはご自身のものを使用してください |
| `accountIndex` | `0` | すべてのレーンで同じインデックス |
| `chainId` | `"qorechain-diana"` | モックで選択されているネットワーク |
| `rest` | `https://api-testnet.qore.host` | `signAndBroadcast` と鍵の参照に使う REST エンドポイント |
| `evmRpc` | `https://evm-testnet.qore.host` | `eth_sendTransaction` で使用（planned プロファイル） |
| `allowMainnet` | `false` | これがない場合、`qorechain-vladi` への署名は拒否されます |
| `autoApprove` | `true` | `false` の場合、承認は `approveNext()` または `rejectNext()` を待ちます |
| `inclusionTimeoutMs`、`pollIntervalMs` | `30000`、`1500` | `signAndBroadcast` が取り込みを待つ方法 |

### エラーコード {#error-codes}

これらのパッケージから（`QorexIntegrationError.code`）: `QOREX_NOT_INSTALLED`、`QOREX_USE_SIGN_AND_BROADCAST`、`QOREX_AMINO_REFUSED`、`QOREX_NOT_SUPPORTED_YET`。`qorex-synpress` から: `QOREX_EXTENSION_MODE_UNAVAILABLE`。QoreX 自身のエラーは、メッセージが `QoreX` で始まる通常の `Error` オブジェクトです。たとえば `QoreX: connection rejected`、`QoreX: signature rejected`、`QoreX: wallet is locked`、`QoreX: unsupported chain <id>` です。現在、数値コードを持つのは未知のチェーン（4902）のみで、ユーザーによる拒否には EIP-1193 の 4001 コードがないため、メッセージで照合してください。`QoreX (mock):` で始まるメッセージはモックによるもので、QoreX からのものではありません。

## アクセス方法 {#how-to-access}

* **実際に使用する QoreX ウォレット。** コネクタは、ユーザーがインストールした QoreX のブラウザ拡張機能またはアプリと通信します。インストールとストアのバージョンについては [QoreX ブラウザ拡張機能](/qorex/browser-extension)ページを参照してください。テスト用パッケージにウォレットは不要です。
* **ネットワーク。** メインネット `qorechain-vladi`（EVM チェーン ID 9801）とテストネット `qorechain-diana`（EVM チェーン ID 9800）。QoreX はこの 2 つの QoreChain チェーン ID のみを提供し、他は "QoreX: unsupported chain" で拒否します。モックはデフォルトでテストネットを使用し、`allowMainnet: true` を渡さない限りメインネットへの署名を拒否します。
* **鍵と資金。** パッケージは鍵を保持しません。モックは公開の BIP-39 テスト用フレーズ（`abandon` を 11 回繰り返し、最後に `about`）を使用し、これは `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h` を導出します。決して入金しないでください。ブロードキャストを行うテストでは、モックにご自身のテストネット用ニーモニックを渡してください。
* **その他のアカウント。** WalletConnect を使う RainbowKit には、WalletConnect の project id が必要です。
* **前提条件。** Node.js（モックの 1 ファイルスクリプトには 20.16 以降が必要）、3 つのコネクタ用の React アプリ、各クイックスタートに記載のピアパッケージ。TypeScript ユーザーは `@qorechain/qorex-types` から型を取得できます。
* **費用。** パッケージは無料です。QoreX を通じて送信されるトランザクションには、通常の手数料（下限はガス 1 あたり 0.1 uqor。QoreX は自身のトランザクションをガス 1 あたり 0.15 uqor で価格設定します）がかかります。

### ネットワーク {#networks}

| | メインネット | テストネット |
|---|---|---|
| ネイティブチェーン ID | `qorechain-vladi` | `qorechain-diana` |
| EVM チェーン ID | 9801（`0x2649`） | 9800（`0x2648`） |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| エクスプローラー | `https://explore.qore.network` | 同じ（テストネットを選択） |

Bech32 プレフィックスは `qor`（バリデーターは `qorvaloper`）、コインタイプは 118、デノミネーションは `uqor` でネイティブレーンでは 6 桁、EVM では QOR で 18 桁です。実際に使用するにはユーザーに QoreX 拡張機能（0.3.x）が必要です。テストに必要なのはモックだけです。モックから実際にブロードキャストするには、アカウントに[フォーセット](/dashboard/faucet)のテストネット QOR が必要です（サインインが必要）。ご自身のニーモニックを使用し、公開テスト用フレーズは決して使わないでください。

## セキュリティに関する注意 {#security}

* dApp が ML-DSA-87 鍵を保持することは決してありません: QoreX は `signAndBroadcast` を通じて、ウォレット内で QoreChain のトランザクションに署名します。
* QoreX は、アカウントの ML-DSA-87 鍵を管理するメッセージに対するページからのリクエストを拒否します。
* `qorexWallet()` は `window.ethereum` にフォールバックしないため、他の注入されたウォレットが QoreX と取り違えられることはありません。モックは別の逆引きドメイン名を使用するため、テストダブルがウォレットと取り違えられることはありません。
* メソッド `connectProof`、`executeTransfer`、`executeRequest` は QoreChain ダッシュボード用に存在し、他のすべてのオリジンでは拒否されます。
* `shield` の結果に注意してください。`downgraded` は、トランザクションがハイブリッドレイヤーなしでコミットされたことを意味します。警告として扱ってください。
* モックのデフォルトのニーモニックは公開されており、モックは `allowMainnet: true` でない限りメインネットへの署名を拒否します。公開テスト用フレーズには決して入金せず、ライブテストには別のテストネット用ニーモニックを使用してください。
* 脆弱性は security@qore.network まで非公開で報告してください。

## 公開場所 {#where-published}

| レジストリ | パッケージ | バージョン | リンク |
| --- | --- | --- | --- |
| npm | `@qorechain/qorex-types` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-types |
| npm | `@qorechain/qorex-rainbowkit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| npm | `@qorechain/qorex-interchain-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-interchain-kit |
| npm | `@qorechain/qorex-cosmos-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit |
| npm | `@qorechain/qorex-wallet-mock` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-wallet-mock |
| npm | `@qorechain/qorex-synpress` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-synpress |

ソース: https://github.com/qorechain/qorex-integrations（公開、リリース `v0.1.0` を2026年10月27日に公開、`packages/` 配下のフォルダー）。ガイド（MetaMask、Keplr、Phantom と並べて QoreX を追加する方法、エンドツーエンドテスト、エラーとチェーン ID）、テストネット上で QoreX のすべての機能を試すデモ dApp、サンプル（`examples/wagmi-rainbowkit`、`examples/playwright-e2e`）、chain-registry エントリファイルも含まれます。ライセンスは Apache-2.0、メンテナーは QoreChain Association です。バージョンは 2026年10月27日に npm レジストリから読み取りました。これらは npm で非推奨となっている `@qorechain/connect` に代わるものです。QoreX の検出には `qorex-types`、EVM dApp には `qorex-rainbowkit`、Cosmos dApp には `qorex-interchain-kit`（または `qorex-cosmos-kit`）、独自のウォレットやバックエンドでのハイブリッド署名には [QoreSign](/qoresign/overview) を使用してください。

## 制限と既知の問題 {#limits}

**現在の QoreX ビルドがサポートする内容。** 公開されているストア版ビルド（QoreX モバイルアプリ 1.1.8、ブラウザ拡張機能 0.3.8、Firefox では 0.3.9）は、ウォレットが追加する ML-DSA レイヤーを伴う `getOfflineSigner` をまだサポートしておらず、`signArbitrary` もサポートしていません。cosmos-kit と Interchain Kit を通じた `getOfflineSigner` による署名は、ページ自身がポスト量子レイヤーを付加する場合にのみ機能しますが、ページは鍵を保持しないため、通常これはできません。現時点でネイティブレーンのトランザクションを送信するサポートされた方法は `window.qorex.native.signAndBroadcast` であり、`qorexSignAndBroadcast` がこれをラップしています。現在のストア版ビルドでは、各パッケージの README に記載されている範囲を超えて、コネクタを完全な cosmos-kit や Interchain Kit のウォレットとして解釈しないでください。コネクタは、将来の QoreX リリースが `signDirect` にレイヤーを追加できる（`signDirectAddsPqcLayer` ケイパビリティで宣言）ように書かれており、お客様のコードを変更する必要はありません。

**現在 QoreX が応答するもの**（パッケージの README より）:

* **EVM:** QoreX で選択されているネットワークに対する `eth_chainId`、`eth_accounts`、`eth_requestAccounts`、`wallet_switchEthereumChain`（未知のチェーンはコード 4902 で拒否されます）。署名メソッド（`personal_sign`、`eth_signTypedData_v4`、`eth_sendTransaction`）と `wallet_addEthereumChain` はまだサポートされておらず、"QoreX: EVM method ... not yet supported" で拒否されます。`accountsChanged` や `chainChanged` イベントはまだありません。QoreX チームが予定としているもの（公開済みではありません）: イベント、すべての拒否に対するエラーコード、その後に署名メソッドとトランザクションメソッド。
* **EVM トランザクション全般。** QoreChain では、EVM トランザクションは、登録済みの ML-DSA-87 鍵と開いている EVM 認可ウィンドウの両方を持つアカウントからのみ受け付けられます。どちらもネイティブレーンからセットアップします（[EVM 開発](/developer-guide/evm-development#evm-window)を参照）。モックの予定されている `eth_sendTransaction` は、そのウィンドウを開きません。
* **ネイティブ:** `enable`、`getKey`、`signDirect`、`signAndBroadcast`、`listAccounts`、`experimentalSuggestChain`。`qorechain-vladi` と `qorechain-diana` のみが対象です。QoreChain では、`signDirect` にはハイブリッドレイヤーがすでに存在している必要がありますが、ページはそれを構築できないため、`signAndBroadcast` を使用してください。`signArbitrary`、Amino 署名、`sendTx` は利用できません。コネクタでは、`signArbitrary` は `QOREX_NOT_SUPPORTED_YET` をスローし、Amino は `QOREX_AMINO_REFUSED` をスローします。
* **Solana:** `solana:mainnet` 上の Wallet Standard。connect、disconnect、イベント、`signAndSendTransaction`、`signTransaction`、`signMessage` に対応。`solana:signIn` は非対応です。チェーンの SVM レーンはまだトランザクションを受け付けないため、ここでの Solana サポートはウォレット側のみです。

**クイックスタートのテスト中に見つかった注意点:**

* **cosmos-kit には `throwErrors` が必要です。** README の例には `throwErrors` がありませんが、`@cosmos-kit/react` 2.24 は型でこれを必須としているため、記載どおりでは型チェックを通りません。`throwErrors={false}`（またはご自身の値）を渡してください。
* **厳格な TypeScript とモック。** `window.qorex.evm.request(...)` は `unknown` を返すため、その結果を分割代入する README の行は、厳格な TypeScript では失敗します。結果をキャストしてください。たとえば `eth_requestAccounts` では `as string[]` とします。
* **モックには独自の EIP-6963 ID があります。** これは `network.qore.qorex` ではなく `network.qore.qorex.mock` を通知します。したがって、`network.qore.qorex` のみで厳密に QoreX を選択する検出コード（`qorex-types` の `discoverQorexEip1193` を含む）は、`window.qorex.evm` とネイティブプロバイダーが存在していても、モックの下では設計上 EVM プロバイダーを見つけません。コードが検出を通じてプロバイダーを選択する場合は、テストでモックの rdns（`QOREX_MOCK_RDNS` としてエクスポートされています）を受け入れるようにしてください。
* **RainbowKit は Node を終了させません。** Node で RainbowKit の設定を構築すると WalletConnect のタイマーが開始され、その後プロセスは自力では終了しません。ページ内では想定どおりの動作です。スクリプトやテストでは、必要なものを読み取った後、明示的に終了してください（たとえば `process.exit(0)`）。
* **Synpress の拡張機能モードはまだ動作しません。** `qorexExtensionFixtures` は実際の拡張機能を操作するために予定されている方法ですが、QoreX の承認ウィンドウに、まだ提供されていない安定したテスト用セレクターが必要なため、現在は `QorexExtensionModeUnavailableError` をスローします。モックモードを使用してください。

**モックとウォレットの違い:** ロック画面や承認ウィンドウがない（承認は `approveNext`、`rejectNext`、`autoApprove` で行います）。`signDirect` は単純な secp256k1 の鍵タイプを報告する。Solana の `signAndSendTransaction` は拒否される。"QoreX (mock):" で始まるメッセージはモック自身のものです。モックによるテスト結果は、記述されたインターフェースに対してページがどう動作するかを示すものであり、実際の QoreX ビルドが同じように動作することを示すものではありません。

**その他:** 6 つのパッケージはすべて初期リリース（0.1.0）のため、QoreX の成長に合わせてインターフェースが拡張されることを想定してください。テスト済みのクイックスタートで、ライブネットワークや実際のウォレットに対する `qorexSignAndBroadcast` を扱うものはありません。

## 関連ページ {#related}

* [QoreX ウォレット](/qorex/overview)と [QoreX ブラウザ拡張機能](/qorex/browser-extension): これらのパッケージが通信するウォレット。
* [QoreSign](/qoresign/overview): モックが使用するハイブリッド署名機能。
* [QoreChain SDK](/sdk/overview): `signAndBroadcast` 用に `MsgSend` などのメッセージをエンコードする。
* [EVM 開発](/developer-guide/evm-development#evm-window): ML-DSA-87 鍵の登録と EVM 認可ウィンドウ。
* [フォーセット](/dashboard/faucet): テストネット QOR。
* [QoreChain MCP サーバー](/developer-tools/mcp): ブロードキャストの結果を `get_pq_status` で読み取る。
* [開発者パッケージ概要](/developer-tools/overview)。
