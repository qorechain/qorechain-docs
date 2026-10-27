---
slug: /developer-tools/qorex-integrations
title: QoreX Integrations
sidebar_label: QoreX Integrations
sidebar_position: 22
---

# QoreX Integrations (`@qorechain/qorex-*`)

The QoreX integrations are six small npm packages for dApp developers who want the [QoreX wallet](/qorex/overview) to work in an EVM, Cosmos or Solana front end, and for teams who test those front ends. Three are wallet connectors for popular libraries (RainbowKit, Interchain Kit, cosmos-kit), one holds the shared types and detection helpers, and two are test tooling (a mock wallet and Playwright fixtures). All six are version **0.1.0**, published on 27 October 2026, Apache-2.0.

What they do not do: they do not hold keys, and they do not turn QoreX into more than it is today. Read [Limits and known issues](#limits) before you build on them: the live store builds of QoreX support part of what these packages can be wired to, and the limits are stated there.

## Innovations {#innovations}

* **Discovery that cannot pick the wrong wallet.** QoreX announces itself through EIP-6963 with the reverse-DNS name `network.qore.qorex` and never writes `window.ethereum`. `@qorechain/qorex-types` selects the provider by that name only, and the RainbowKit wallet pins the connector to the announced provider and never falls back to `window.ethereum`.
* **The wallet builds the hybrid signature, the page never holds the post-quantum key.** QoreChain's native lane needs a secp256k1 signature plus an ML-DSA-87 signature (FIPS 204). On the native provider (`window.qorex.native`) the call `signAndBroadcast` hands the messages to QoreX, which builds the transaction, signs it with both keys and broadcasts it. The result is `txHash`, `code`, `height` and `shield`, where `shield` is `shielded` once the committed transaction carries the hybrid layer.
* **Capability checks instead of version checks.** The packages read the wallet's `capabilities` list (`hasCapability`), so a feature such as `signAndBroadcast` is detected, not guessed from a version number.
* **Refusals are explicit, with stable codes.** Amino signing is refused by design, because Amino JSON cannot carry the hybrid signature; the connectors throw `QorexIntegrationError` with codes such as `QOREX_AMINO_REFUSED`, `QOREX_USE_SIGN_AND_BROADCAST` and `QOREX_NOT_SUPPORTED_YET`, and `isQorexIntegrationError(err, code)` tests for them.
* **A test double that signs for real.** `@qorechain/qorex-wallet-mock` injects the same objects QoreX injects (`window.qorex = { evm, native, svm }`), registers a Solana wallet, and signs with the real algorithms (hybrid ML-DSA-87 through QoreSign on the native lane, secp256k1 on EVM, ed25519 on Solana) from the public test mnemonic on the testnet by default. It announces itself as `network.qore.qorex.mock`, so code that selects QoreX strictly cannot mistake it for the wallet.
* **Two behaviour profiles.** The mock's `current` profile behaves like the QoreX that is live today; `planned` adds what the QoreX team has announced, so you can build ahead without the mock claiming something the wallet does not do yet.
* **Playwright fixtures in the Synpress v4 style** (`qorexMockFixtures`) inject the mock before navigation, so an end-to-end test needs no browser extension.
* **Wallet-driven accounts without events.** Because QoreX does not emit `accountsChanged` or `chainChanged` yet, the RainbowKit wallet has an opt-in `pollAccountsOnFocus` that re-reads `eth_accounts` and `eth_chainId` when the page regains focus.

## How to use {#how-to-use}

The code blocks below are the quickstarts from the developer hub. Each was typechecked with `tsc` and run on 27 October 2026 after installing from the public npm registry (Node 26; jsdom 30 and `react-dom/client` for browser code; Playwright 1.64 with Chromium for the fixture) and passed. None sends a transaction or needs a funded key. The observed result is given with each. Wallet-side behaviour (a real QoreX in a real browser) was not tested for this page.

### `@qorechain/qorex-types`: detect QoreX {#types}

```bash
npm install @qorechain/qorex-types
```

```ts
import { discoverQorexEip1193, getQorexNative, hasCapability } from "@qorechain/qorex-types";

// EVM: EIP-6963 discovery by rdns "network.qore.qorex" (QoreX never writes window.ethereum).
const evm = await discoverQorexEip1193({ timeoutMs: 500 });
console.log(evm ? "QoreX EVM provider found" : "QoreX EVM provider not announced");

// QoreChain native lane: window.qorex.native.
const native = getQorexNative();
if (native && hasCapability(native, "signAndBroadcast")) {
  const key = await native.getKey("qorechain-diana");
  console.log("native account:", key.bech32Address);
}
```

Observed under the mock: `QoreX EVM provider not announced`, then `native account: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`. The first line is expected under the mock, see [the EIP-6963 caveat](#limits). The package has no runtime dependencies and also exports the QoreX icon as a data URI from `@qorechain/qorex-types/icon`. Other exports: provider types, `isQorexInstalled`, `qorexSignAndBroadcast`, and helpers to classify QoreX EVM refusals.

### `@qorechain/qorex-rainbowkit`: QoreX in RainbowKit and wagmi {#rainbowkit}

```bash
npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

```ts
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { QOREX_CHAINS, qorechain, qorechainTestnet, qorexWallet } from "@qorechain/qorex-rainbowkit";

const connectors = connectorsForWallets(
  [{ groupName: "Recommended", wallets: [qorexWallet, metaMaskWallet] }],
  { appName: "My dApp", projectId: "<walletconnect project id>" },
);

export const config = createConfig({
  chains: QOREX_CHAINS, // QoreChain mainnet (9801) and testnet (9800)
  connectors,
  transports: { [qorechain.id]: http(), [qorechainTestnet.id]: http() },
});
console.log(config.chains.map((c) => `${c.id} ${c.name}`), connectors.length, "connectors");
```

Observed: `[ '9801 QoreChain', '9800 QoreChain Testnet' ] 2 connectors`. `QOREX_CHAINS` holds the viem chain definitions for the EVM lane (RPC `https://evm.qore.host` and `https://evm-testnet.qore.host`, native currency QOR with 18 decimals, explorer `https://explore.qore.network`). The `projectId` is a WalletConnect project id that you create with WalletConnect yourself. Peer dependencies: `viem` ^2, `wagmi` ^2.9, `@rainbow-me/rainbowkit` ^2.2.11. To pick up account and network changes made in the wallet, use `wallets: [() => qorexWallet({ pollAccountsOnFocus: true })]`.

### `@qorechain/qorex-interchain-kit`: Cosmos dApps (recommended for new work) {#interchain-kit}

```bash
npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@interchain-kit/react";
import { qorexWallet } from "@qorechain/qorex-interchain-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[qorexWallet]}>
      {children}
    </ChainProvider>
  );
}
```

Observed: the component mounted in jsdom with the QoreChain testnet chain-registry entry (`@interchain-kit/react` 0.11.1). Peer dependency: `@interchain-kit/core` ^0.11. Send a QoreChain transaction with `qorexSignAndBroadcast`:

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],
  memo: "",
});
```

The call accepts 1 to 32 messages and a memo of up to 256 bytes, and QoreX asks the user to approve it. The snippet is from the package README and was not run for this page.

### `@qorechain/qorex-cosmos-kit`: Cosmos dApps on cosmos-kit {#cosmos-kit}

```bash
npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as qorexWallets } from "@qorechain/qorex-cosmos-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[...qorexWallets]} throwErrors={false}>
      {children}
    </ChainProvider>
  );
}
```

Observed: mounted in jsdom with the QoreChain testnet entry (`@cosmos-kit/react` 2.24.1). **`throwErrors={false}` is required for the code to typecheck:** `@cosmos-kit/react` 2.24 types `throwErrors` as a required property, and the example in the package README omits it. Peer dependency: `@cosmos-kit/core` ^2.18.1. The package README recommends Interchain Kit for new dApps. It exports `qorexSignAndBroadcast` as well.

### `@qorechain/qorex-wallet-mock`: test double for QoreX {#wallet-mock}

```bash
npm install -D @qorechain/qorex-wallet-mock
```

```ts
import { createQorexMock } from "@qorechain/qorex-wallet-mock";

// jsdom / Vitest: install a QoreX test double into window (public test phrase, testnet only).
const mock = createQorexMock({ profile: "current" });
mock.install(window);

const [account] = (await window.qorex!.evm.request({ method: "eth_requestAccounts" })) as string[];
const chainId = await window.qorex!.evm.request({ method: "eth_chainId" });
console.log(account, chainId, mock.addresses());
```

Observed: `0x9858EfFD232B4033E47d90003D41EC34EcaEda94 0x2648 { native: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h, evm: 0x9858..., svm: HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk }`. Accounts derive the way QoreX derives them (`m/44'/118'/0'/0/i` with the canonical ML-DSA-87 key of that `qor1` address, `m/44'/60'/0'/0/i` for EVM, `m/44'/501'/i'/0'` for Solana). Options include `profile`, `mnemonic`, `accountIndex`, `chainId` (default `qorechain-diana`), `autoApprove` and `allowMainnet`; the page also gets `window.__qorexMock` with `approveNext()`, `rejectNext()`, `requests` and `switchAccount(i)`. In Playwright, inject `mock.initScript()` with `page.addInitScript` (Node 20.16 or later).

### `@qorechain/qorex-synpress`: Playwright fixtures {#synpress}

```bash
npm install -D @qorechain/qorex-synpress @playwright/test
```

```ts
import { qorexMockFixtures } from "@qorechain/qorex-synpress";

// A Playwright test with the QoreX mock injected before navigation (no Synpress needed).
const test = qorexMockFixtures({ profile: "current" });
const { expect } = test;

test("connects", async ({ page, qorex }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(page.getByTestId("account")).toHaveText(qorex.addresses.evm);
});
```

Observed: `1 passed`, against a local page whose Connect button calls `eth_requestAccounts` (Playwright 1.64, Chromium). To combine the fixtures with Synpress, install `@synthetixio/synpress@4.1.2` and wrap them in `testWithSynpress`. The `qorex` fixture exposes `addresses`, `approveNext()`, `rejectNext()`, `requests()`, `switchAccount(i)` and `disconnect()`. Peer dependency: `@playwright/test` 1.48 or later. State lives in the page, so each navigation starts a fresh mock.

## How to access {#how-to-access}

* **A QoreX wallet for real use.** The connectors talk to the QoreX browser extension or app a user has installed; see the [QoreX Browser Extension](/qorex/browser-extension) page for installs and store versions. The test packages need no wallet.
* **Networks.** Mainnet `qorechain-vladi` (EVM chain id 9801) and testnet `qorechain-diana` (EVM chain id 9800). QoreX serves only these two QoreChain chain ids and rejects others with "QoreX: unsupported chain". The mock defaults to the testnet and refuses to sign for mainnet unless you pass `allowMainnet: true`.
* **Keys and funds.** The packages hold no key. The mock uses the public BIP-39 test phrase (`abandon` repeated 11 times, then `about`) which derives `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`; never fund it. For a test that broadcasts, give the mock your own testnet mnemonic.
* **Other accounts.** RainbowKit with WalletConnect needs a WalletConnect project id from WalletConnect.
* **Prerequisites.** Node.js (the mock's one-file script needs 20.16 or later), a React app for the three connectors, and the peer packages listed under each quickstart. TypeScript users get the types from `@qorechain/qorex-types`.
* **Costs.** The packages are free. A transaction sent through QoreX pays the usual fee (floor 0.1 uqor per gas).

## Where it is published {#where-published}

| Registry | Package | Version | Link |
| --- | --- | --- | --- |
| npm | `@qorechain/qorex-types` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-types |
| npm | `@qorechain/qorex-rainbowkit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| npm | `@qorechain/qorex-interchain-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-interchain-kit |
| npm | `@qorechain/qorex-cosmos-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit |
| npm | `@qorechain/qorex-wallet-mock` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-wallet-mock |
| npm | `@qorechain/qorex-synpress` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-synpress |

Source: https://github.com/qorechain/qorex-integrations (tag `v0.1.0`, folders under `packages/`; it also holds a demo dApp, examples and chain-registry entry files). Versions read from the npm registry on 27 October 2026. They replace `@qorechain/connect`, which is deprecated on npm: use `qorex-types` to detect QoreX, `qorex-rainbowkit` for EVM dApps, `qorex-interchain-kit` (or `qorex-cosmos-kit`) for Cosmos dApps, and [QoreSign](/qoresign/overview) for hybrid signing in your own wallet or backend.

## Limits and known issues {#limits}

**What today's QoreX builds support.** The store builds that are live (the QoreX mobile app 1.1.8; browser extension 0.3.8, and 0.3.9 on Firefox) do not yet support `getOfflineSigner` with a wallet-added ML-DSA layer, and do not support `signArbitrary`. Through cosmos-kit and Interchain Kit, signing with `getOfflineSigner` works only if the page itself attaches the post-quantum layer, which a page cannot normally do because it does not hold the key. The supported way to send a native-lane transaction today is `window.qorex.native.signAndBroadcast`, which `qorexSignAndBroadcast` wraps. Do not read the connectors as a full cosmos-kit or Interchain Kit wallet with today's store builds beyond what each package README states. The connectors are written so that a later QoreX release can add the layer in `signDirect` (declared through a `signDirectAddsPqcLayer` capability) without a change in your code.

**What QoreX answers today** (from the package READMEs):

* **EVM:** `eth_chainId`, `eth_accounts`, `eth_requestAccounts` and `wallet_switchEthereumChain` for the network selected in QoreX (an unknown chain rejects with code 4902). Signing methods (`personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`) and `wallet_addEthereumChain` are not supported yet and reject with "QoreX: EVM method ... not yet supported". No `accountsChanged` or `chainChanged` events yet. Listed by the QoreX team as planned, not live: events, error codes on every refusal, then the signing and transaction methods.
* **EVM transactions in general.** On QoreChain an EVM transaction is accepted only from an account with a registered ML-DSA-87 key and an open EVM authorization window, both set up from the native lane (see [EVM Development](/developer-guide/evm-development#evm-window)). The mock's planned `eth_sendTransaction` does not open that window.
* **Native:** `enable`, `getKey`, `signDirect`, `signAndBroadcast`, `listAccounts` and `experimentalSuggestChain`, for `qorechain-vladi` and `qorechain-diana` only. On QoreChain `signDirect` needs the hybrid layer to be present already, which a page cannot build, so use `signAndBroadcast`. `signArbitrary`, Amino signing and `sendTx` are not available; in the connectors `signArbitrary` throws `QOREX_NOT_SUPPORTED_YET` and Amino throws `QOREX_AMINO_REFUSED`.
* **Solana:** Wallet Standard on `solana:mainnet` with connect, disconnect, events, `signAndSendTransaction`, `signTransaction` and `signMessage`; no `solana:signIn`. The SVM lane of the chain does not accept transactions yet, so Solana support here is the wallet side only.

**Caveats found while testing the quickstarts:**

* **cosmos-kit needs `throwErrors`.** The README example omits `throwErrors`, which `@cosmos-kit/react` 2.24 requires in its types, so it does not typecheck as written. Pass `throwErrors={false}` (or your own value).
* **Strict TypeScript and the mock.** `window.qorex.evm.request(...)` returns `unknown`, so the README line that destructures its result fails under strict TypeScript. Cast the result, for example `as string[]` for `eth_requestAccounts`.
* **The mock has its own EIP-6963 id.** It announces `network.qore.qorex.mock`, not `network.qore.qorex`. Discovery code that selects QoreX strictly by `network.qore.qorex` (including `discoverQorexEip1193` in `qorex-types`) therefore finds no EVM provider under the mock, by design, while `window.qorex.evm` and the native provider are present. If your code selects the provider through discovery, make it accept the mock rdns (exported as `QOREX_MOCK_RDNS`) in tests.
* **RainbowKit keeps Node alive.** In Node, building the RainbowKit config starts WalletConnect timers, and the process does not exit by itself afterwards. That is expected in a page. In a script or a test, exit explicitly (for example `process.exit(0)`) once you have read what you need.
* **Synpress extension mode does not work yet.** `qorexExtensionFixtures` is the planned way to drive the real extension and throws `QorexExtensionModeUnavailableError` today, because it needs stable test selectors in QoreX approval windows that have not shipped. Use the mock mode.

**Differences between the mock and the wallet:** no lock screen or approval window (approvals are `approveNext`, `rejectNext` or `autoApprove`); `signDirect` reports a plain secp256k1 key type; Solana `signAndSendTransaction` is refused; messages that begin with "QoreX (mock):" are the mock's own. Test results from the mock show how your page behaves against the described interface, not that a real QoreX build behaves the same.

**Other:** all six packages are an initial release (0.1.0), so expect their interfaces to grow as QoreX does. No tested quickstart covers `qorexSignAndBroadcast` against a live network or a real wallet.
