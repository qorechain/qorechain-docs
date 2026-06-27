---
slug: /sdk/guides/react
title: Kit de React
sidebar_label: React
sidebar_position: 7
---

# Kit de React (`@qorechain/react`)

`@qorechain/react` es la capa oficial de React sobre `@qorechain/sdk`: un
proveedor, un puñado de hooks y dos componentes listos para usar — incluida una
insignia de **seguridad cuántica** de una sola línea. Hace que construir una dApp con seguridad cuántica sea la ruta por defecto.

```bash
npm i @qorechain/react @qorechain/sdk react react-dom
```

`react` (>=18) es una dependencia entre pares; `@qorechain/sdk` es una dependencia directa.

## Proveedor

Envuelve tu app una vez en `QoreChainProvider`. Mantiene una única instancia de `createClient()`
más el estado en vivo de la conexión de la cartera del que lee cada hook.

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

Para cambiar de red en tiempo de ejecución, vuelve a montar el proveedor con una `key` de React distinta.
Para las pruebas, pasa una prop `client` ya construida (o simulada) en lugar de `config`.

## Hooks

| Hook | Devuelve |
| --- | --- |
| `useQoreClient()` | El `QoreChainClient` compuesto para lecturas ad-hoc. |
| `useAccount()` | `{ addresses, address, isConnected, status, wallet }` — direcciones nativa / EVM / SVM. |
| `useBalance(address?, options?)` | `{ data, isLoading, error, refetch }`; autoactualización vía `refreshInterval`. |
| `useConnect()` / `useWallet()` | `{ connect, disconnect, status, isConnecting, error }`. |
| `useTx()` | `{ send, sendTokens, status, data, error, isPending, reset }`. |
| `usePqcStatus(address?, options?)` | `{ data, isRegistered, isLoading, error, refetch }`. |

### Conectar carteras

`useConnect` envuelve los adaptadores **existentes** del SDK:

```ts
const { connect } = useConnect();
await connect({ kind: "keplr" }); // or "leap" | "evm" | "svm"
```

- **keplr / leap** — carteras de Cosmos mediante `getCosmosWallet`. Sugiere y habilita
  la cadena, devuelve un firmante que queda conectado a un `TxClient`, de modo que `useTx`
  puede firmar de inmediato. Establece `addresses.native`.
- **evm** — cualquier proveedor EIP-1193 inyectado (`window.ethereum`, p. ej. MetaMask) mediante
  `eth_requestAccounts`. Establece `addresses.evm`.
- **svm** — cualquier proveedor Wallet-Standard inyectado (`window.solana`, p. ej. Phantom)
  mediante `connect()`. Establece `addresses.svm`.

Las rutas EVM y SVM usan directamente la API de solicitud estándar del proveedor inyectado,
por lo que no se incorpora ni viem ni un SDK de Solana. Pasa `provider` en las opciones de
connect para inyectar una cartera en las pruebas. Combínalo con `@qorechain/evm` /
`@qorechain/svm` para disponer de todo el utillaje por VM.

### Enviar transacciones

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

`send([{ typeUrl, value }], opts)` recibe mensajes en bruto de los compositores `msg.*`
para cualquier cosa que vaya más allá de una transferencia bancaria.

## Componentes

### `<ConnectButton/>`

Un control de conectar / desconectar minimalista y casi sin estilo. Pasa `wallets` para ofrecer un
selector, `className` / `style` para darle tema, o una render-prop `children` para control
total:

```tsx
<ConnectButton wallets={["keplr", "leap", "evm"]} />
```

### `<QuantumSafeBadge/>`

Muestra un indicador de **seguridad cuántica** cuando la dirección tiene una clave poscuántica
registrada (mediante `usePqcStatus`); de lo contrario, un estado atenuado "Not quantum-safe". Por defecto usa
la cuenta conectada.

```tsx
<QuantumSafeBadge />
<QuantumSafeBadge address="qor1…" hideWhenUnsafe />
```

## Juntándolo todo

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

Consulta el [ejemplo ejecutable `react-dapp`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/react-dapp)
y la [guía de seguridad cuántica](/sdk/guides/quantum-safe) para conocer las llamadas subyacentes del SDK.
