---
slug: /sdk/guides/react
title: Kit React
sidebar_label: React
sidebar_position: 7
---

# Kit React (`@qorechain/react`)

`@qorechain/react` est la couche React officielle au-dessus de `@qorechain/sdk` : un
provider, une poignée de hooks, et deux composants prêts à l'emploi — y compris un badge
**Résistant au quantique** en une ligne. Il fait de la construction d'une dApp résistante au quantique le chemin par défaut.

```bash
npm i @qorechain/react @qorechain/sdk react react-dom
```

`react` (>=18) est une dépendance pair ; `@qorechain/sdk` est une dépendance directe.

## Provider

Enveloppez votre application une fois dans `QoreChainProvider`. Il détient une seule instance
`createClient()` ainsi que l'état de connexion du wallet en direct dont chaque hook se sert.

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

Pour changer de réseau à l'exécution, remontez le provider avec une `key` React différente.
Pour les tests, passez une prop `client` pré-construite (ou simulée) au lieu de `config`.

## Hooks

| Hook | Renvoie |
| --- | --- |
| `useQoreClient()` | Le `QoreChainClient` composé pour des lectures ponctuelles. |
| `useAccount()` | `{ addresses, address, isConnected, status, wallet }` — adresses native / EVM / SVM. |
| `useBalance(address?, options?)` | `{ data, isLoading, error, refetch }` ; rafraîchissement automatique via `refreshInterval`. |
| `useConnect()` / `useWallet()` | `{ connect, disconnect, status, isConnecting, error }`. |
| `useTx()` | `{ send, sendTokens, status, data, error, isPending, reset }`. |
| `usePqcStatus(address?, options?)` | `{ data, isRegistered, isLoading, error, refetch }`. |

### Connecter des wallets

`useConnect` encapsule les adaptateurs **existants** du SDK :

```ts
const { connect } = useConnect();
await connect({ kind: "keplr" }); // or "leap" | "evm" | "svm"
```

- **keplr / leap** — wallets Cosmos via `getCosmosWallet`. Suggère et active
  la chaîne, renvoie un signataire câblé dans un `TxClient`, de sorte que `useTx`
  peut signer immédiatement. Définit `addresses.native`.
- **evm** — tout provider EIP-1193 injecté (`window.ethereum`, p. ex. MetaMask) via
  `eth_requestAccounts`. Définit `addresses.evm`.
- **svm** — tout provider Wallet-Standard injecté (`window.solana`, p. ex. Phantom)
  via `connect()`. Définit `addresses.svm`.

Les chemins EVM et SVM utilisent directement l'API de requête standard du provider injecté,
de sorte que ni viem ni un SDK Solana ne sont importés. Passez `provider` dans les options de
connexion pour injecter un wallet pour les tests. Associez à `@qorechain/evm` /
`@qorechain/svm` pour un outillage complet par VM.

### Envoyer des transactions

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

`send([{ typeUrl, value }], opts)` prend des messages bruts issus des composeurs `msg.*`
pour tout ce qui va au-delà d'un transfert bancaire.

## Composants

### `<ConnectButton/>`

Un contrôle de connexion / déconnexion minimal et quasi headless. Passez `wallets` pour proposer un
sélecteur, `className` / `style` pour le styliser, ou une render-prop `children` pour un contrôle
total :

```tsx
<ConnectButton wallets={["keplr", "leap", "evm"]} />
```

### `<QuantumSafeBadge/>`

Affiche un indicateur **Résistant au quantique** lorsque l'adresse possède une clé post-quantique
enregistrée (via `usePqcStatus`), sinon un état atténué « Non résistant au quantique ». Par défaut,
il s'applique au compte connecté.

```tsx
<QuantumSafeBadge />
<QuantumSafeBadge address="qor1…" hideWhenUnsafe />
```

## Tout assembler

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

Voir l'[exemple `react-dapp`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/react-dapp) exécutable
et le [guide résistant au quantique](/sdk/guides/quantum-safe) pour les appels SDK sous-jacents.
