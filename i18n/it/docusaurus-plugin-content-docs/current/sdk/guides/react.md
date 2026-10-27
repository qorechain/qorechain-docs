---
slug: /sdk/guides/react
title: Kit React
sidebar_label: React
sidebar_position: 7
---

# Kit React (`@qorechain/react`)

`@qorechain/react` è il livello React ufficiale sopra `@qorechain/sdk`: un
provider, una manciata di hook e due componenti pronti all'uso — incluso un badge
di stato PQC di una sola riga. Rende lo sviluppo di una dApp con firma ibrida ML-DSA-87 il percorso predefinito.

```bash
npm i @qorechain/react @qorechain/sdk react react-dom
```

`react` (>=18) è una peer dependency; `@qorechain/sdk` è una dipendenza diretta
(`^0.10.0` dal kit 0.10.0; su una versione 0.x il caret resta dentro la 0.10, quindi una
patch dell'SDK non installa una seconda copia). Usa `@qorechain/react` **0.10.0** (la 0.9.0 funziona allo stesso modo): la 0.8.0 blocca
l'SDK 0.8.0, che firma la forma ibrida sbagliata sulla mainnet, e le
release 0.8.x precedenti possono mostrare un saldo o uno stato obsoleto dopo un cambio di indirizzo.

:::caution Limiti del kit React sulle reti live (0.9.0 e 0.10.0)
`useTx` si connette con il firmatario del wallet e senza alcuna coppia di chiavi post-quantistica, quindi invia
solo con la firma classica, che le reti live rifiutano (il percorso Native
richiede l'estensione ibrida ML-DSA-87): `send` / `sendTokens` non possono far confermare una
transazione su mainnet o testnet. Per gli invii usa il `TxClient` ibrido dell'SDK
(`client.connectTx(signer, { pqcKeypair })`, vedi
[Firma ibrida](/sdk/guides/quantum-safe#register-in-one-call)). `usePqcStatus` e `<QuantumSafeBadge/>` leggono lo stato tramite
`getPqcStatus` con il client composto del provider, che dall'SDK 0.9.0 legge tramite
REST (`/qorechain/pqc/v1/account/{address}`), quindi funzionano contro `*.qore.host`
(il kit 0.8.x leggeva `qor_getPQCKeyStatus`, che gli endpoint pubblici non servono, e
non poteva confermare una chiave lì). Le letture del saldo (`useBalance`) e la connessione
al wallet funzionano.
:::

## Provider

Avvolgi la tua app una sola volta in `QoreChainProvider`. Contiene una singola istanza
`createClient()` più lo stato live della connessione al wallet da cui legge ogni hook.

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

Per cambiare rete a runtime, rimonta il provider con una `key` React diversa.
Per i test, passa una prop `client` pre-costruita (o mockata) invece di `config`.

## Hook

| Hook | Restituisce |
| --- | --- |
| `useQoreClient()` | Il `QoreChainClient` composto per letture ad-hoc. |
| `useAccount()` | `{ addresses, address, isConnected, status, wallet }` — indirizzi nativo / EVM / SVM. |
| `useBalance(address?, options?)` | `{ data, isLoading, error, refetch }`; auto-aggiornamento tramite `refreshInterval`. |
| `useConnect()` / `useWallet()` | `{ connect, disconnect, status, isConnecting, error }`. |
| `useTx()` | `{ send, sendTokens, status, data, error, isPending, reset }`. |
| `usePqcStatus(address?, options?)` | `{ data, isRegistered, isLoading, error, refetch }`. |

### Connettere i wallet

`useConnect` incapsula gli adattatori SDK **esistenti**:

```ts
const { connect } = useConnect();
await connect({ kind: "keplr" }); // or "leap" | "evm" | "svm"
```

- **keplr / leap** — wallet Cosmos tramite `getCosmosWallet`. Suggerisce e abilita
  la catena, restituisce un signer che viene collegato a un `TxClient`, così `useTx`
  può firmare immediatamente. Imposta `addresses.native`.
- **evm** — qualsiasi provider EIP-1193 iniettato (`window.ethereum`, es. MetaMask) tramite
  `eth_requestAccounts`. Imposta `addresses.evm`.
- **svm** — qualsiasi provider Wallet-Standard iniettato (`window.solana`, es. Phantom)
  tramite `connect()`. Imposta `addresses.svm`.

I percorsi EVM e SVM usano direttamente l'API di richiesta standard del provider iniettato,
così non viene incluso né viem né un SDK Solana. Passa `provider` nelle opzioni di connect
per iniettare un wallet per i test. Abbinalo a `@qorechain/evm` /
`@qorechain/svm` per il tooling completo per ogni VM.

### Inviare transazioni

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

`send([{ typeUrl, value }], opts)` accetta messaggi grezzi dai composer `msg.*`
per qualsiasi cosa che vada oltre un trasferimento bank.

## Componenti

### `<ConnectButton/>`

Un controllo di connessione / disconnessione minimale e quasi headless. Passa `wallets` per offrire un
selettore, `className` / `style` per personalizzarne il tema, oppure una render-prop `children` per il pieno
controllo:

```tsx
<ConnectButton wallets={["keplr", "leap", "evm"]} />
```

### `<QuantumSafeBadge/>`

Mostra un indicatore di stato quando l'indirizzo ha una chiave post-quantistica
registrata (tramite `usePqcStatus`), altrimenti uno stato attenuato "non registrata". Per impostazione predefinita usa
l'account connesso.

```tsx
<QuantumSafeBadge />
<QuantumSafeBadge address="qor1…" hideWhenUnsafe />
```

## Mettere tutto insieme

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

Vedi l'[esempio `react-dapp` eseguibile](https://github.com/qorechain/qorechain-sdk/tree/main/examples/react-dapp)
e la [guida alla firma ibrida](/sdk/guides/quantum-safe) per le chiamate SDK sottostanti.
