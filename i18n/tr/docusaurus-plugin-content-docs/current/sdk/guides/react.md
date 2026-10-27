---
slug: /sdk/guides/react
title: React Kiti
sidebar_label: React
sidebar_position: 7
---

# React kiti (`@qorechain/react`)

`@qorechain/react`, `@qorechain/sdk` üzerine kurulu resmi React katmanıdır: tek bir
sağlayıcı, bir avuç kanca ve iki yerleştirilebilir bileşen — tek satırlık bir
PQC durum rozeti dahil. Hibrit ML-DSA-87 imzalamalı bir dApp oluşturmayı varsayılan yol haline getirir.

```bash
npm i @qorechain/react @qorechain/sdk react react-dom
```

`react` (>=18) bir eş bağımlılıktır; `@qorechain/sdk` doğrudan bir bağımlılıktır
(kit 0.10.0'dan beri `^0.10.0`; 0.x bir sürümde şapka işareti 0.10 içinde kalır, dolayısıyla bir SDK
yaması ikinci bir kopya kurmaz). `@qorechain/react` **0.10.0** sürümünü kullanın (0.9.0 aynı şekilde çalışır): 0.8.0,
mainnet'te yanlış hibrit biçimiyle imzalayan SDK 0.8.0'a sabitlenir; daha eski 0.8.x
sürümleri ise adres değişikliğinden sonra eski bir bakiye veya durum gösterebilir.

:::caution React kitinin canlı ağ sınırlamaları (0.9.0 ve 0.10.0)
`useTx`, cüzdanın imzalayanıyla ve post-kuantum anahtar çifti olmadan bağlanır; bu yüzden
yalnızca klasik imzayla gönderir ve canlı ağlar bunu reddeder (Native yolu hibrit ML-DSA-87
uzantısını gerektirir): `send` / `sendTokens` mainnet veya testnet üzerinde bir işlemi
işleyemez. Gönderimler için SDK'nin hibrit `TxClient`'ını kullanın
(`client.connectTx(signer, { pqcKeypair })`, bkz.
[Hibrit imzalama](/sdk/guides/quantum-safe#register-in-one-call)). `usePqcStatus` ve `<QuantumSafeBadge/>`,
durumu sağlayıcının oluşturulmuş istemcisiyle `getPqcStatus` üzerinden okur; bu çağrı SDK 0.9.0'dan
itibaren REST üzerinden okur (`/qorechain/pqc/v1/account/{address}`), bu nedenle
`*.qore.host` karşısında çalışırlar (kit 0.8.x, genel uç noktaların sunmadığı
`qor_getPQCKeyStatus`'ı okuyordu ve orada bir anahtarı doğrulayamıyordu). Bakiye okumaları
(`useBalance`) ve cüzdan bağlantısı çalışır.
:::

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
durum göstergesi gösterir; aksi takdirde sönük bir "kayıtlı değil"
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
ve [hibrit imzalama kılavuzuna](/sdk/guides/quantum-safe) bakın.
