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

`react` (>=18) es una dependencia entre pares; `@qorechain/sdk` es una dependencia directa
(`^0.10.0` desde el kit 0.10.0; en una versión 0.x el caret se queda dentro de 0.10, así que un
parche del SDK no instala una segunda copia). Usa `@qorechain/react` **0.10.0** (la 0.9.0 funciona igual): la 0.8.0 fija
el SDK 0.8.0, que firma la forma híbrida incorrecta en la mainnet, y las versiones 0.8.x anteriores
pueden mostrar un saldo o un estado obsoletos tras un cambio de dirección.

:::caution Límites del kit de React en la red en vivo (0.9.0 y 0.10.0)
`useTx` se conecta con el firmante de la cartera y sin ningún par de claves poscuánticas, así que envía
únicamente con la firma clásica, que las redes en vivo rechazan (la ruta Native
exige la extensión híbrida ML-DSA-87): `send` / `sendTokens` no pueden incluir una
transacción en la mainnet ni en la testnet. Para los envíos usa el `TxClient` híbrido del SDK
(`client.connectTx(signer, { pqcKeypair })`, consulta
[Seguridad cuántica](/sdk/guides/quantum-safe#register-in-one-call)). `usePqcStatus` y `<QuantumSafeBadge/>` leen el estado mediante
`getPqcStatus` con el cliente compuesto del proveedor, que desde el SDK 0.9.0 lee por
REST (`/qorechain/pqc/v1/account/{address}`), así que funcionan contra `*.qore.host`
(el kit 0.8.x leía `qor_getPQCKeyStatus`, que los endpoints públicos no sirven, y
no podía confirmar una clave allí). Las lecturas de saldo (`useBalance`) y la conexión de la
cartera funcionan.
:::

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
          rpc: "https://rpc-testnet.qore.host",
          rest: "https://api-testnet.qore.host",
          evmRpc: "https://evm-testnet.qore.host",
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
