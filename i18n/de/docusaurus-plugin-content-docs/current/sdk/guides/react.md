---
slug: /sdk/guides/react
title: React-Kit
sidebar_label: React
sidebar_position: 7
---

# React-Kit (`@qorechain/react`)

`@qorechain/react` ist die offizielle React-Schicht über `@qorechain/sdk`: ein
Provider, eine Handvoll Hooks und zwei Drop-in-Komponenten — einschließlich eines einzeiligen
**Quantum-safe**-Badges. Es macht das Erstellen einer quantensicheren dApp zum Standardweg.

```bash
npm i @qorechain/react @qorechain/sdk react react-dom
```

`react` (>=18) ist eine Peer-Abhängigkeit; `@qorechain/sdk` ist eine direkte Abhängigkeit
(`^0.9.0` seit Kit 0.9.0; bei einer 0.x-Version bleibt das Caret innerhalb von 0.9, sodass ein SDK-
Patch keine zweite Kopie installiert). Verwenden Sie `@qorechain/react` **0.9.0**: 0.8.0 legt
SDK 0.8.0 fest, das im Mainnet die falsche Hybridform signiert, und frühere 0.8.x-Versionen
können nach einem Adresswechsel ein veraltetes Guthaben oder einen veralteten Status anzeigen.

:::caution Einschränkungen des React-Kits im Live-Netzwerk (0.9.0)
`useTx` verbindet sich mit dem Signierer der Wallet und ohne Post-Quanten-Schlüsselpaar, sodass es
nur mit der klassischen Signatur sendet, die die Live-Netzwerke ablehnen (der native Pfad
erfordert die hybride ML-DSA-87-Erweiterung): `send` / `sendTokens` können im
Mainnet oder Testnet keine Transaktion platzieren. Senden Sie mit dem hybriden `TxClient` des SDK
(`client.connectTx(signer, { pqcKeypair })`, siehe
[Quantum-safe](/sdk/guides/quantum-safe#register-in-one-call)). `usePqcStatus` und `<QuantumSafeBadge/>` lesen den Status über
`getPqcStatus` mit dem zusammengesetzten Client des Providers, der seit SDK 0.9.0 über
REST liest (`/qorechain/pqc/v1/account/{address}`), sodass sie gegen `*.qore.host` funktionieren
(Kit 0.8.x las `qor_getPQCKeyStatus`, das die öffentlichen Endpunkte nicht bereitstellen, und
konnte dort einen Schlüssel nicht bestätigen). Guthabenabfragen (`useBalance`) und die Wallet-Verbindung
funktionieren.
:::

## Provider

Umschließen Sie Ihre App einmal mit `QoreChainProvider`. Er hält eine einzelne `createClient()`-
Instanz sowie den Live-Status der Wallet-Verbindung, aus dem jeder Hook liest.

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

Um Netzwerke zur Laufzeit zu wechseln, mounten Sie den Provider mit einem anderen React-`key` neu.
Für Tests übergeben Sie statt `config` eine vorgefertigte (oder gemockte) `client`-Prop.

## Hooks

| Hook | Rückgabe |
| --- | --- |
| `useQoreClient()` | Der zusammengesetzte `QoreChainClient` für Ad-hoc-Lesezugriffe. |
| `useAccount()` | `{ addresses, address, isConnected, status, wallet }` — native / EVM / SVM Adressen. |
| `useBalance(address?, options?)` | `{ data, isLoading, error, refetch }`; automatische Aktualisierung über `refreshInterval`. |
| `useConnect()` / `useWallet()` | `{ connect, disconnect, status, isConnecting, error }`. |
| `useTx()` | `{ send, sendTokens, status, data, error, isPending, reset }`. |
| `usePqcStatus(address?, options?)` | `{ data, isRegistered, isLoading, error, refetch }`. |

### Wallets verbinden

`useConnect` kapselt die **vorhandenen** SDK-Adapter:

```ts
const { connect } = useConnect();
await connect({ kind: "keplr" }); // or "leap" | "evm" | "svm"
```

- **keplr / leap** — Cosmos-Wallets über `getCosmosWallet`. Schlägt die Chain vor und
  aktiviert sie, gibt einen Signierer zurück, der in einen `TxClient` eingebunden wird, sodass
  `useTx` sofort signieren kann. Setzt `addresses.native`.
- **evm** — jeder injizierte EIP-1193-Provider (`window.ethereum`, z. B. MetaMask) über
  `eth_requestAccounts`. Setzt `addresses.evm`.
- **svm** — jeder injizierte Wallet-Standard-Provider (`window.solana`, z. B. Phantom)
  über `connect()`. Setzt `addresses.svm`.

Die EVM- und SVM-Pfade nutzen die Standard-Request-API des injizierten Providers direkt,
sodass weder viem noch ein Solana-SDK eingebunden wird. Übergeben Sie `provider` in den Connect-
Optionen, um für Tests eine Wallet zu injizieren. Kombinieren Sie es mit `@qorechain/evm` /
`@qorechain/svm` für vollständiges Tooling pro VM.

### Transaktionen senden

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

`send([{ typeUrl, value }], opts)` nimmt rohe Nachrichten aus den `msg.*`-Composern
für alles, was über eine Bank-Überweisung hinausgeht.

## Komponenten

### `<ConnectButton/>`

Ein minimales, weitgehend headless gehaltenes Connect-/Disconnect-Steuerelement. Übergeben Sie
`wallets`, um eine Auswahl anzubieten, `className` / `style` zum Stylen oder eine `children`-
Render-Prop für volle Kontrolle:

```tsx
<ConnectButton wallets={["keplr", "leap", "evm"]} />
```

### `<QuantumSafeBadge/>`

Zeigt einen **Quantum-safe**-Indikator, wenn die Adresse einen registrierten Post-Quanten-
Schlüssel besitzt (über `usePqcStatus`), andernfalls einen gedämpften Status "Not quantum-safe".
Standardmäßig wird das verbundene Konto verwendet.

```tsx
<QuantumSafeBadge />
<QuantumSafeBadge address="qor1…" hideWhenUnsafe />
```

## Alles zusammenfügen

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

Sehen Sie sich das lauffähige [`react-dapp`-Beispiel](https://github.com/qorechain/qorechain-sdk/tree/main/examples/react-dapp)
und den [Quantensicher-Leitfaden](/sdk/guides/quantum-safe) für die zugrunde liegenden SDK-Aufrufe an.
