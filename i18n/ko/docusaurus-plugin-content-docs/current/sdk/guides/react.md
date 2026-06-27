---
slug: /sdk/guides/react
title: React 키트
sidebar_label: React
sidebar_position: 7
---

# React 키트 (`@qorechain/react`)

`@qorechain/react`는 `@qorechain/sdk` 위에 얹은 공식 React 레이어입니다. 하나의
프로바이더, 몇 개의 훅, 그리고 즉시 사용 가능한 두 개의 컴포넌트(한 줄짜리
**양자 안전** 배지 포함)를 제공합니다. 양자 안전 dApp을 만드는 것을 기본 경로로
만듭니다.

```bash
npm i @qorechain/react @qorechain/sdk react react-dom
```

`react`(>=18)는 피어 의존성이며, `@qorechain/sdk`는 직접 의존성입니다.

## 프로바이더

앱을 `QoreChainProvider`로 한 번 감싸세요. 이는 단일 `createClient()`
인스턴스와 모든 훅이 읽어 가는 실시간 월렛 연결 상태를 보유합니다.

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

런타임에 네트워크를 전환하려면 다른 React `key`로 프로바이더를 다시 마운트하세요.
테스트의 경우 `config` 대신 미리 빌드된(또는 모킹된) `client` prop을 전달하세요.

## 훅

| 훅 | 반환값 |
| --- | --- |
| `useQoreClient()` | 임시 읽기를 위한 구성된 `QoreChainClient`. |
| `useAccount()` | `{ addresses, address, isConnected, status, wallet }` — 네이티브 / EVM / SVM 주소. |
| `useBalance(address?, options?)` | `{ data, isLoading, error, refetch }`; `refreshInterval`을 통한 자동 새로고침. |
| `useConnect()` / `useWallet()` | `{ connect, disconnect, status, isConnecting, error }`. |
| `useTx()` | `{ send, sendTokens, status, data, error, isPending, reset }`. |
| `usePqcStatus(address?, options?)` | `{ data, isRegistered, isLoading, error, refetch }`. |

### 월렛 연결

`useConnect`는 **기존** SDK 어댑터를 래핑합니다:

```ts
const { connect } = useConnect();
await connect({ kind: "keplr" }); // or "leap" | "evm" | "svm"
```

- **keplr / leap** — `getCosmosWallet`을 통한 Cosmos 월렛. 체인을 제안하고
  활성화하며, `TxClient`에 연결된 서명자를 반환하므로 `useTx`가 즉시 서명할
  수 있습니다. `addresses.native`를 설정합니다.
- **evm** — `eth_requestAccounts`를 통한 모든 주입형 EIP-1193 프로바이더
  (`window.ethereum`, 예: MetaMask). `addresses.evm`을 설정합니다.
- **svm** — `connect()`를 통한 모든 주입형 Wallet-Standard 프로바이더
  (`window.solana`, 예: Phantom). `addresses.svm`을 설정합니다.

EVM 및 SVM 경로는 주입된 프로바이더의 표준 request API를 직접 사용하므로 viem이나
Solana SDK가 끌려 들어오지 않습니다. 테스트용 월렛을 주입하려면 connect 옵션에
`provider`를 전달하세요. 각 VM별 전체 도구가 필요하면 `@qorechain/evm` /
`@qorechain/svm`과 함께 사용하세요.

### 트랜잭션 전송

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

`send([{ typeUrl, value }], opts)`는 단순 bank 전송을 넘어서는 작업을 위해
`msg.*` 컴포저의 원시 메시지를 받습니다.

## 컴포넌트

### `<ConnectButton/>`

최소한의, 거의 헤드리스에 가까운 연결 / 연결 해제 컨트롤입니다. 선택기를
제공하려면 `wallets`를, 테마를 지정하려면 `className` / `style`을, 완전한 제어를
위해서는 `children` render-prop을 전달하세요:

```tsx
<ConnectButton wallets={["keplr", "leap", "evm"]} />
```

### `<QuantumSafeBadge/>`

주소에 등록된 포스트 양자 키가 있을 때(`usePqcStatus`를 통해) **양자 안전** 표시를
보여주고, 그렇지 않으면 흐릿한 "Not quantum-safe" 상태를 보여줍니다. 기본값은
연결된 계정입니다.

```tsx
<QuantumSafeBadge />
<QuantumSafeBadge address="qor1…" hideWhenUnsafe />
```

## 한데 엮기

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

실행 가능한 [`react-dapp` 예제](https://github.com/qorechain/qorechain-sdk/tree/main/examples/react-dapp)와
기반이 되는 SDK 호출은 [양자 안전 가이드](/sdk/guides/quantum-safe)를 참고하세요.
