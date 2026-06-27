---
slug: /sdk/guides/react
title: React キット
sidebar_label: React
sidebar_position: 7
---

# React キット（`@qorechain/react`）

`@qorechain/react` は `@qorechain/sdk` 上に構築された公式の React レイヤーです。1 つの
プロバイダー、いくつかのフック、そして 2 つのすぐに使えるコンポーネント（1 行で使える
**量子耐性**バッジを含む）を提供します。これにより、量子耐性 dApp の構築がデフォルトの道筋になります。

```bash
npm i @qorechain/react @qorechain/sdk react react-dom
```

`react`（>=18）はピア依存です。`@qorechain/sdk` は直接の依存です。

## プロバイダー

アプリを `QoreChainProvider` で一度ラップします。これは単一の `createClient()`
インスタンスと、すべてのフックが参照するライブのウォレット接続状態を保持します。

```tsx
import { QoreChainProvider } from "@qorechain/react";

function Root() {
  return (
    <QoreChainProvider
      config={{
        network: "testnet",
        endpoints: {
          rpc: "https://rpc.testnet.example",
          rest: "https://rest.testnet.example",
          evmRpc: "https://evm.testnet.example",
        },
      }}
    >
      <App />
    </QoreChainProvider>
  );
}
```

実行時にネットワークを切り替えるには、異なる React の `key` でプロバイダーを再マウントします。
テストでは、`config` の代わりに事前構築（またはモック）した `client` プロパティを渡します。

## フック

| フック | 戻り値 |
| --- | --- |
| `useQoreClient()` | アドホックな読み取り用の合成済み `QoreChainClient`。 |
| `useAccount()` | `{ addresses, address, isConnected, status, wallet }` — ネイティブ / EVM / SVM アドレス。 |
| `useBalance(address?, options?)` | `{ data, isLoading, error, refetch }`。`refreshInterval` で自動更新。 |
| `useConnect()` / `useWallet()` | `{ connect, disconnect, status, isConnecting, error }`。 |
| `useTx()` | `{ send, sendTokens, status, data, error, isPending, reset }`。 |
| `usePqcStatus(address?, options?)` | `{ data, isRegistered, isLoading, error, refetch }`。 |

### ウォレットの接続

`useConnect` は**既存**の SDK アダプターをラップします:

```ts
const { connect } = useConnect();
await connect({ kind: "keplr" }); // or "leap" | "evm" | "svm"
```

- **keplr / leap** — `getCosmosWallet` を介した Cosmos ウォレット。チェーンを提案して
  有効化し、`TxClient` に組み込まれた署名者を返すため、`useTx`
  はすぐに署名できます。`addresses.native` を設定します。
- **evm** — `eth_requestAccounts` を介した任意のインジェクト型 EIP-1193 プロバイダー
  （`window.ethereum`、例: MetaMask）。`addresses.evm` を設定します。
- **svm** — `connect()` を介した任意のインジェクト型 Wallet-Standard プロバイダー
  （`window.solana`、例: Phantom）。`addresses.svm` を設定します。

EVM と SVM のパスはインジェクトされたプロバイダーの標準リクエスト API を直接使用するため、
viem も Solana SDK も取り込まれません。テスト用にウォレットをインジェクトするには、connect
オプションで `provider` を渡します。VM ごとの完全なツールを利用するには `@qorechain/evm` /
`@qorechain/svm` と組み合わせてください。

### トランザクションの送信

```tsx
import { msg } from "@qorechain/sdk";
import { useTx } from "@qorechain/react";

function Send() {
  const { sendTokens, isPending } = useTx();
  return (
    <button
      disabled={isPending}
      onClick={() =>
        sendTokens("qor1recipient…", [{ denom: "uqor", amount: "1000000" }])
      }
    >
      Send 1 QOR
    </button>
  );
}
```

`send([{ typeUrl, value }], opts)` は、bank 送金以外のために `msg.*` コンポーザーから
生のメッセージを受け取ります。

## コンポーネント

### `<ConnectButton/>`

最小限でヘッドレス寄りの接続 / 切断コントロールです。ピッカーを表示するには `wallets` を、
テーマを設定するには `className` / `style` を、完全な制御には `children` の
レンダープロップを渡します:

```tsx
<ConnectButton wallets={["keplr", "leap", "evm"]} />
```

### `<QuantumSafeBadge/>`

アドレスに登録済みのポスト量子鍵がある場合（`usePqcStatus` を介して）に**量子耐性**
インジケーターを表示し、そうでない場合は控えめな「Not quantum-safe」状態を表示します。
デフォルトでは接続中のアカウントを対象とします。

```tsx
<QuantumSafeBadge />
<QuantumSafeBadge address="qor1…" hideWhenUnsafe />
```

## まとめて使う

```tsx
import {
  ConnectButton,
  QuantumSafeBadge,
  useAccount,
  useBalance,
} from "@qorechain/react";

function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance(undefined, { refreshInterval: 10_000 });
  return (
    <>
      <ConnectButton wallets={["keplr", "leap", "evm"]} />
      {isConnected && (
        <p>
          {balance?.amount ?? "…"} {balance?.denom} <QuantumSafeBadge />
        </p>
      )}
    </>
  );
}
```

実行可能な [`react-dapp` サンプル](https://github.com/qorechain/qorechain-sdk/tree/main/examples/react-dapp)
と、基盤となる SDK 呼び出しについては[量子耐性ガイド](/sdk/guides/quantum-safe)を参照してください。
