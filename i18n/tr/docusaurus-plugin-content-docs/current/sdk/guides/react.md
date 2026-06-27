---
slug: /sdk/guides/react
title: React Kiti
sidebar_label: React
sidebar_position: 7
---

# React kiti (`@qorechain/react`)

`@qorechain/react`, `@qorechain/sdk` üzerine kurulu resmi React katmanıdır: tek bir
sağlayıcı, bir avuç kanca ve iki yerleştirilebilir bileşen — tek satırlık bir
**Kuantuma dayanıklı** rozeti dahil. Kuantuma dayanıklı bir dApp oluşturmayı varsayılan yol haline getirir.

```bash
npm i @qorechain/react @qorechain/sdk react react-dom
```

`react` (>=18) bir eş bağımlılıktır; `@qorechain/sdk` doğrudan bir bağımlılıktır.

## Sağlayıcı

Uygulamanızı bir kez `QoreChainProvider` içine sarın. Her kancanın okuduğu tek bir
`createClient()` örneği artı canlı cüzdan bağlantı durumunu tutar.

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

Çalışma zamanında ağ değiştirmek için, sağlayıcıyı farklı bir React `key` ile yeniden bağlayın.
Testler için, `config` yerine önceden oluşturulmuş (veya taklit edilmiş) bir `client` prop'u geçin.

## Kancalar

| Kanca | Döndürür |
| --- | --- |
| `useQoreClient()` | Anlık okumalar için oluşturulmuş `QoreChainClient`. |
| `useAccount()` | `{ addresses, address, isConnected, status, wallet }` — yerel / EVM / SVM adresleri. |
| `useBalance(address?, options?)` | `{ data, isLoading, error, refetch }`; `refreshInterval` aracılığıyla otomatik yenileme. |
| `useConnect()` / `useWallet()` | `{ connect, disconnect, status, isConnecting, error }`. |
| `useTx()` | `{ send, sendTokens, status, data, error, isPending, reset }`. |
| `usePqcStatus(address?, options?)` | `{ data, isRegistered, isLoading, error, refetch }`. |

### Cüzdanları bağlama

`useConnect`, **mevcut** SDK adaptörlerini sarar:

```ts
const { connect } = useConnect();
await connect({ kind: "keplr" }); // or "leap" | "evm" | "svm"
```

- **keplr / leap** — `getCosmosWallet` aracılığıyla Cosmos cüzdanları. Zinciri
  önerir ve etkinleştirir, bir `TxClient`'a bağlanan bir imzalayan döndürür; böylece `useTx`
  hemen imzalayabilir. `addresses.native`'i ayarlar.
- **evm** — `eth_requestAccounts` aracılığıyla herhangi bir enjekte edilmiş EIP-1193 sağlayıcısı
  (`window.ethereum`, örn. MetaMask). `addresses.evm`'i ayarlar.
- **svm** — `connect()` aracılığıyla herhangi bir enjekte edilmiş Wallet-Standard sağlayıcısı
  (`window.solana`, örn. Phantom). `addresses.svm`'i ayarlar.

EVM ve SVM yolları, enjekte edilen sağlayıcının standart istek API'sini doğrudan kullanır;
bu nedenle ne viem ne de bir Solana SDK'si dahil edilir. Testler için bir cüzdan enjekte etmek üzere
connect seçeneklerinde `provider`'ı geçin. VM başına tam araçlar için `@qorechain/evm` /
`@qorechain/svm` ile eşleştirin.

### İşlem gönderme

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

`send([{ typeUrl, value }], opts)`, bir banka transferinin ötesindeki her şey için `msg.*`
oluşturucularından ham mesajlar alır.

## Bileşenler

### `<ConnectButton/>`

Minimal, headless'a yakın bir bağlanma / bağlantı kesme denetimi. Bir seçici sunmak için
`wallets`, temalandırmak için `className` / `style` veya tam denetim için bir `children`
render-prop'u geçin:

```tsx
<ConnectButton wallets={["keplr", "leap", "evm"]} />
```

### `<QuantumSafeBadge/>`

Adresin kayıtlı bir post-kuantum anahtarı olduğunda (`usePqcStatus` aracılığıyla) bir
**Kuantuma dayanıklı** göstergesi gösterir; aksi takdirde sönük bir "Kuantuma dayanıklı değil"
durumu gösterir. Varsayılan olarak bağlı hesabı kullanır.

```tsx
<QuantumSafeBadge />
<QuantumSafeBadge address="qor1…" hideWhenUnsafe />
```

## Bir araya getirme

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

Altta yatan SDK çağrıları için çalıştırılabilir [`react-dapp` örneğine](https://github.com/qorechain/qorechain-sdk/tree/main/examples/react-dapp)
ve [kuantuma dayanıklı kılavuzuna](/sdk/guides/quantum-safe) bakın.
