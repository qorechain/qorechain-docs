---
slug: /sdk/guides/react
title: Kit React
sidebar_label: React
sidebar_position: 7
---

# Kit React (`@qorechain/react`)

`@qorechain/react` este stratul React oficial peste `@qorechain/sdk`: un
provider, câteva hook-uri și două componente drop-in — inclusiv un badge
**Quantum-safe** de o singură linie. Face din construirea unei dApp quantum-safe calea implicită.

```bash
npm i @qorechain/react @qorechain/sdk react react-dom
```

`react` (>=18) este o dependență peer; `@qorechain/sdk` este o dependență directă.

## Provider

Învelește aplicația o singură dată în `QoreChainProvider`. Acesta deține o singură instanță
`createClient()` plus starea live a conexiunii portofelului din care citește fiecare hook.

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

Pentru a schimba rețelele în timpul rulării, remontează provider-ul cu un alt `key` React.
Pentru teste, transmite o prop `client` pre-construită (sau simulată) în loc de `config`.

## Hook-uri

| Hook | Returnează |
| --- | --- |
| `useQoreClient()` | `QoreChainClient`-ul compus pentru citiri ad-hoc. |
| `useAccount()` | `{ addresses, address, isConnected, status, wallet }` — adrese native / EVM / SVM. |
| `useBalance(address?, options?)` | `{ data, isLoading, error, refetch }`; reîmprospătare automată prin `refreshInterval`. |
| `useConnect()` / `useWallet()` | `{ connect, disconnect, status, isConnecting, error }`. |
| `useTx()` | `{ send, sendTokens, status, data, error, isPending, reset }`. |
| `usePqcStatus(address?, options?)` | `{ data, isRegistered, isLoading, error, refetch }`. |

### Conectarea portofelelor

`useConnect` împachetează adaptoarele SDK **existente**:

```ts
const { connect } = useConnect();
await connect({ kind: "keplr" }); // or "leap" | "evm" | "svm"
```

- **keplr / leap** — portofele Cosmos prin `getCosmosWallet`. Sugerează și activează
  lanțul, returnează un semnatar care este conectat într-un `TxClient`, astfel încât `useTx`
  poate semna imediat. Setează `addresses.native`.
- **evm** — orice provider EIP-1193 injectat (`window.ethereum`, de ex. MetaMask) prin
  `eth_requestAccounts`. Setează `addresses.evm`.
- **svm** — orice provider Wallet-Standard injectat (`window.solana`, de ex. Phantom)
  prin `connect()`. Setează `addresses.svm`.

Căile EVM și SVM folosesc direct API-ul standard de cerere al provider-ului injectat,
așa că nu se importă nici viem, nici un SDK Solana. Transmite `provider` în opțiunile
de conectare pentru a injecta un portofel pentru teste. Asociază cu `@qorechain/evm` /
`@qorechain/svm` pentru unelte complete per VM.

### Trimiterea tranzacțiilor

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

`send([{ typeUrl, value }], opts)` preia mesaje brute de la compozitorii `msg.*`
pentru orice depășește un transfer bancar.

## Componente

### `<ConnectButton/>`

Un control minimal, aproape headless, de conectare / deconectare. Transmite `wallets` pentru a oferi un
selector, `className` / `style` pentru a-l tematiza, sau o render-prop `children` pentru control
total:

```tsx
<ConnectButton wallets={["keplr", "leap", "evm"]} />
```

### `<QuantumSafeBadge/>`

Afișează un indicator **Quantum-safe** atunci când adresa are o cheie post-cuantică
înregistrată (prin `usePqcStatus`), altfel o stare estompată „Not quantum-safe”. Implicit la
contul conectat.

```tsx
<QuantumSafeBadge />
<QuantumSafeBadge address="qor1…" hideWhenUnsafe />
```

## Punând totul cap la cap

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

Vezi [exemplul `react-dapp`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/react-dapp) executabil
și [ghidul quantum-safe](/sdk/guides/quantum-safe) pentru apelurile SDK subiacente.
