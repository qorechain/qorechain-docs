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

## What it is used for {#use-cases}

1. **A wagmi and RainbowKit dApp adds QoreX.** Add `qorexWallet` to the RainbowKit wallet list and `QOREX_CHAINS` to the wagmi config. Users with QoreX connect and the dApp reads their `0x` address and the chain id (9801 or 9800). Users without QoreX see the store links.
2. **A Cosmos dApp on Interchain Kit or cosmos-kit adds QoreX.** Add the QoreX wallet to `ChainProvider` and send QoreChain transactions with `qorexSignAndBroadcast`: QoreX builds the transaction, adds the hybrid signature and broadcasts it, because a page cannot hold the ML-DSA-87 key.
3. **A dApp that already supports Keplr.** `window.qorex.native` follows the Keplr pattern (`enable`, `getKey`, `signDirect`), so the integration is a few lines. The repository guide lists every difference.
4. **CI tests of wallet flows without an extension.** A QA team runs Playwright with `qorexMockFixtures({ profile: "current" })`, clicks Connect and asserts that the page shows `qorex.addresses.evm`. `qorex.rejectNext()` tests the rejection path.
5. **Building ahead of new QoreX features.** Run the same suite with `profile: "planned"` to exercise announced features (EVM signing, account change events, `signDirect` adding the hybrid layer) before QoreX ships them.
6. **Testing real broadcasts on the testnet.** With a funded testnet mnemonic of their own, a team lets the mock `signAndBroadcast` a hybrid-signed transaction to `qorechain-diana` and checks the result in the page.
7. **Feature detection instead of version checks.** A dApp shows a Send button on QoreChain when `hasCapability(native, "signAndBroadcast")` is true, so new QoreX builds switch features on without a dApp change.

## How it works {#how-it-works}

* **EVM lane.** QoreX never writes `window.ethereum`. It announces an EIP-1193 provider through EIP-6963 with the reverse-DNS name `network.qore.qorex`; `qorexWallet()` and `discoverQorexEip1193()` select exactly that provider. The same object is also at `window.qorex.evm`.
* **Native lane.** `window.qorex.native` is a Keplr-pattern provider (it is not aliased to `window.keplr`). QoreChain requires a hybrid secp256k1 plus ML-DSA-87 signature on native-lane transactions and only the wallet holds the ML-DSA-87 key, so the dApp sends messages to `signAndBroadcast`. QoreX shows them, sets the fee, signs with both keys, broadcasts and reports `shield`.
* **Solana.** QoreX registers a Solana Wallet Standard wallet on `solana:mainnet` (Solana itself). QoreChain's own SVM lane is not open for transactions and has no Wallet Standard chain id.
* **Capabilities, not versions.** The kits read `window.qorex.native.capabilities` through `hasCapability`. A QoreX build may declare `listAccounts`, `connectProofPicksAccount`, `executeRequest` and `signAndBroadcast`.
* **Amino is refused by design**, because Amino JSON cannot carry the hybrid ML-DSA-87 signature. The kits serve every signer request with a direct signer.
* **`signDirect` and the post-quantum layer, precisely.** Today QoreX `signDirect` signs the SignDoc as it is with the secp256k1 key. On QoreChain the body must already contain a valid hybrid ML-DSA-87 layer for the signer's registered key, which a page cannot produce. So on `qorechain-vladi` and `qorechain-diana` the kits' offline signer `signDirect` throws `QOREX_USE_SIGN_AND_BROADCAST` before it reaches QoreX; `getAccounts` works on every chain. On other chain ids the kits forward `signDirect` to QoreX, which today serves only the two QoreChain chain ids. A future QoreX release is planned to add the layer itself in `signDirect` and to declare the capability `signDirectAddsPqcLayer`; no current build declares it. The kits already check for it, and when it is declared the offline signer forwards QoreChain SignDocs to QoreX. QoreX may then re-estimate gas and raise the gas limit and fee, so always broadcast the `signed` document that comes back.
* **`shield` states** returned by `signAndBroadcast`: `shielded` (the committed transaction carries the hybrid layer), `pending` (broadcast done, check not complete), `downgraded` (committed without the layer; treat it as an alert) and `classical` (a lane where the layer does not apply).
* **The mock** builds its accounts from a BIP-39 mnemonic (default: the public test phrase) the way QoreX does: `m/44'/118'/0'/0/i` with the canonical ML-DSA-87 key of that `qor1` address, `m/44'/60'/0'/0/i` for EVM and `m/44'/501'/i'/0'` for Solana. Its `signAndBroadcast` reads the account's ML-DSA-87 key from REST, registers it once with `MsgRegisterPQCKeyV2` if it is missing, signs hybrid with [QoreSign](/qoresign/overview), broadcasts (retrying once with the other sign-bytes version if the network asks), waits for inclusion and returns `{ txHash, code, height, shield }`.

### What QoreX supports today {#qorex-today}

| Surface | Today | Planned by the QoreX team |
|---|---|---|
| EVM (EIP-1193 through EIP-6963, `network.qore.qorex`) | connect (`eth_requestAccounts`), `eth_accounts`, `eth_chainId`, `wallet_switchEthereumChain` to the network already selected in QoreX | `accountsChanged` and `chainChanged` events, EIP-1193 error codes 4200 and 4902 on every refusal, `personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`, `wallet_addEthereumChain` |
| QoreChain native lane (`window.qorex.native`) | `enable`, `getKey`, `signAndBroadcast`, `listAccounts`, `experimentalSuggestChain` (QoreChain ids), `signDirect` (the SignDoc must already carry the hybrid layer) | `signDirect` adding the ML-DSA-87 layer itself, message signing (ADR-36 plus ML-DSA-87) |
| Solana (Wallet Standard, `solana:mainnet`) | connect, `signMessage`, `signTransaction` | `solana:signIn` |

On the EVM side, signing and sending currently fail with "QoreX: EVM method ... not yet supported". For transactions on QoreChain use the native lane. On QoreChain's EVM lane a transaction is accepted when the sender has a registered ML-DSA-87 key and an EVM authorization window opened from the native lane. The user changes the network inside QoreX; the dApp cannot switch it.

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

### Sending a transaction on QoreChain {#send-transaction}

The same call exists in `@qorechain/qorex-interchain-kit`, `@qorechain/qorex-cosmos-kit` and `@qorechain/qorex-types`:

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: MsgSend.encode(msg).finish() }],
  memo: "",
  gasLimit: 200000,
});
```

* `value` is the protobuf-encoded message: a `Uint8Array`, a `number[]` or base64.
* 1 to 32 messages; a memo of up to 256 bytes; `gasLimit` is clamped to 100,000 to 5,000,000 (400,000 when omitted). QoreX sets the fee and shows it before signing.
* `chainId` must match the network selected in QoreX.
* Messages that manage the account's ML-DSA-87 key are wallet-side and refused, also inside `MsgExec`. Message types that QoreX cannot display are refused.
* Without a kit, call `window.qorex.native.signAndBroadcast(request)` after checking `hasCapability(native, "signAndBroadcast")`. `getKey` returns `pubKey` and `address` as `number[]`; convert with `Uint8Array.from(key.pubKey)` (the kits do this for you).

### The mock in Playwright without the fixtures {#mock-playwright}

```ts
import { createQorexMock } from "@qorechain/qorex-wallet-mock";

const mock = createQorexMock({ profile: "current" });
await page.addInitScript({ content: mock.initScript() });
await page.goto("http://localhost:5173");
await page.evaluate(() => window.__qorexMock!.rejectNext());
```

## Main API {#main-api}

| Package | Name | What it does |
|---|---|---|
| types | `discoverQorexEip1193({ timeoutMs })`, `findQorexEip1193()` | async EIP-6963 discovery of the QoreX EVM provider, and a synchronous probe for it |
| types | `getQorexNative()`, `isQorexInstalled()`, `hasCapability(native, capability)` | read `window.qorex.native`, check that QoreX is present, test a capability |
| types | `qorexSignAndBroadcast(request, { native? })` | hands messages to QoreX; throws `QOREX_NOT_INSTALLED` without QoreX and `QOREX_NOT_SUPPORTED_YET` on a QoreX that predates it |
| types | `QorexIntegrationError`, `isQorexIntegrationError(err, code)` | errors from these packages, with stable codes |
| types | `isQorexUnsupportedMethodError`, `isQorexUnrecognizedChainError`, `QOREX_EVM_ERROR_CODES` | classify QoreX EVM refusals: checks `code` (4200, 4902), then falls back to today's message text |
| types | `QorexEip1193Provider`, `QorexNativeProvider`, `QorexSolanaStandardWallet`, `QorexSvmProvider`; `@qorechain/qorex-types/icon` | types of what QoreX injects; the QoreX icon as a data URI |
| rainbowkit | `qorexWallet(options?)`, `createQorexConnector`, `getQorexEip1193Provider` | the RainbowKit wallet (option `pollAccountsOnFocus`), the wagmi connector and the provider it uses |
| rainbowkit | `qorechain`, `qorechainTestnet`, `QOREX_CHAINS` | viem chains 9801 and 9800 |
| interchain-kit | `qorexWallet`, `createQorexWallet()`, `QorexCosmosWallet` | Interchain Kit wallet |
| cosmos-kit | `wallets`, `qorexExtension`, `QorexExtensionWallet`, `QorexClient` | cosmos-kit wallet |
| both kits | `qorexSignAndBroadcast`, `QOREX_CAPABILITY_SIGN_DIRECT_ADDS_PQC_LAYER`, chain id constants, error helpers | re-exported from `qorex-types` |
| wallet-mock | `createQorexMock(options)` | returns `{ install(window), initScript(), addresses(), ... }` |
| wallet-mock | `window.__qorexMock` | `approveNext()`, `rejectNext()`, `pendingApprovals`, `requests`, `clearRequests()`, `switchAccount(i)`, `switchNetwork(chainId)`, `disconnect()`, `addresses()` |
| wallet-mock | `PUBLIC_TEST_MNEMONIC` | the public BIP-39 test phrase (never fund it) |
| synpress | `qorexMockFixtures(options)` | a Playwright `test` with an automatic `qorex` fixture |
| synpress | `qorex.addresses`, `approveNext()`, `rejectNext()`, `waitForApproval()`, `pendingApprovals()`, `requests()`, `clearRequests()`, `switchAccount(i)`, `switchNetwork(chainId)`, `disconnect()`, `mock` | the fixture controls |
| synpress | `qorexExtensionFixtures({ extensionPath })` | planned interface for the real extension; throws `QorexExtensionModeUnavailableError` today |

With Synpress v4 merge the fixtures as `testWithSynpress(qorexMockFixtures({ profile: "planned" }))`. With `autoApprove: false`, call `await qorex.waitForApproval()` to inspect the pending state, then `qorex.approveNext()`. Run the suite in both profiles to cover today's QoreX and the next release.

### Kit signer behaviour {#kit-signer}

| Call | Interchain Kit | cosmos-kit |
|---|---|---|
| `connect` or `enable`, `getAccount`, `getKey` | QoreX `enable` and `getKey`, bytes converted to `Uint8Array` | same |
| `getOfflineSigner(chainId)` | direct signer for every preference | direct signer for every preference, including cosmos-kit's default `"amino"` |
| signer `signDirect` on QoreChain | throws `QOREX_USE_SIGN_AND_BROADCAST` (until QoreX declares `signDirectAddsPqcLayer`) | same |
| signer `signDirect` on another chain id | forwarded to QoreX `signDirect` | same |
| `signAmino`, `getOfflineSignerAmino` | throws `QOREX_AMINO_REFUSED` | same |
| `signArbitrary` (ADR-36) | throws `QOREX_NOT_SUPPORTED_YET` (also `verifyArbitrary`) | throws `QOREX_NOT_SUPPORTED_YET` |
| `sendTx` | throws `QOREX_NOT_SUPPORTED_YET`; broadcast through your RPC endpoint | not provided |

### Wallet mock options {#mock-options}

| Option | Default | Meaning |
|---|---|---|
| `profile` | `"current"` | `"current"` is QoreX today; `"planned"` adds announced features |
| `mnemonic` | the public BIP-39 test phrase | use your own for anything you fund |
| `accountIndex` | `0` | the same index on every lane |
| `chainId` | `"qorechain-diana"` | the network selected in the mock |
| `rest` | `https://api-testnet.qore.host` | REST endpoint for `signAndBroadcast` and key lookups |
| `evmRpc` | `https://evm-testnet.qore.host` | used by `eth_sendTransaction` (planned profile) |
| `allowMainnet` | `false` | without it, signing for `qorechain-vladi` is refused |
| `autoApprove` | `true` | when `false`, approvals wait for `approveNext()` or `rejectNext()` |
| `inclusionTimeoutMs`, `pollIntervalMs` | `30000`, `1500` | how `signAndBroadcast` waits for inclusion |

### Error codes {#error-codes}

From these packages (`QorexIntegrationError.code`): `QOREX_NOT_INSTALLED`, `QOREX_USE_SIGN_AND_BROADCAST`, `QOREX_AMINO_REFUSED` and `QOREX_NOT_SUPPORTED_YET`; from `qorex-synpress`: `QOREX_EXTENSION_MODE_UNAVAILABLE`. QoreX's own errors are plain `Error` objects whose message starts with `QoreX`, for example `QoreX: connection rejected`, `QoreX: signature rejected`, `QoreX: wallet is locked` and `QoreX: unsupported chain <id>`. Today an unknown chain (4902) is the only case that carries a numeric code, and a user rejection has no EIP-1193 4001 code, so match the message. Messages that start with `QoreX (mock):` come from the mock, never from QoreX.

## How to access {#how-to-access}

* **A QoreX wallet for real use.** The connectors talk to the QoreX browser extension or app a user has installed; see the [QoreX Browser Extension](/qorex/browser-extension) page for installs and store versions. The test packages need no wallet.
* **Networks.** Mainnet `qorechain-vladi` (EVM chain id 9801) and testnet `qorechain-diana` (EVM chain id 9800). QoreX serves only these two QoreChain chain ids and rejects others with "QoreX: unsupported chain". The mock defaults to the testnet and refuses to sign for mainnet unless you pass `allowMainnet: true`.
* **Keys and funds.** The packages hold no key. The mock uses the public BIP-39 test phrase (`abandon` repeated 11 times, then `about`) which derives `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`; never fund it. For a test that broadcasts, give the mock your own testnet mnemonic.
* **Other accounts.** RainbowKit with WalletConnect needs a WalletConnect project id from WalletConnect.
* **Prerequisites.** Node.js (the mock's one-file script needs 20.16 or later), a React app for the three connectors, and the peer packages listed under each quickstart. TypeScript users get the types from `@qorechain/qorex-types`.
* **Costs.** The packages are free. A transaction sent through QoreX pays the usual fee (floor 0.1 uqor per gas; QoreX prices its own transactions at 0.15 uqor per gas).

### Networks {#networks}

| | Mainnet | Testnet |
|---|---|---|
| Native chain id | `qorechain-vladi` | `qorechain-diana` |
| EVM chain id | 9801 (`0x2649`) | 9800 (`0x2648`) |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` | same, with testnet selected |

Bech32 prefix `qor` (validators `qorvaloper`), coin type 118, denom `uqor` with 6 decimals on the native lane and QOR with 18 decimals on EVM. Users need the QoreX extension (0.3.x) for real use; tests need only the mock. For real broadcasts from the mock, the account needs testnet QOR from the [Faucet](/dashboard/faucet) (sign-in required); use your own mnemonic, never the public test phrase.

## Security notes {#security}

* The dApp never holds the ML-DSA-87 key: QoreX signs QoreChain transactions inside the wallet through `signAndBroadcast`.
* QoreX refuses page requests for messages that manage the account's ML-DSA-87 key.
* `qorexWallet()` never falls back to `window.ethereum`, so another injected wallet is not taken for QoreX. The mock uses a distinct reverse-DNS name so a test double is never taken for the wallet.
* The methods `connectProof`, `executeTransfer` and `executeRequest` exist for the QoreChain dashboard and are refused on every other origin.
* Watch the `shield` result. `downgraded` means the transaction was committed without the hybrid layer; treat it as an alert.
* The mock's default mnemonic is public and the mock refuses mainnet signing unless `allowMainnet: true`. Never fund the public test phrase; use a separate testnet mnemonic for live tests.
* Report vulnerabilities privately to security@qore.network.

## Where it is published {#where-published}

| Registry | Package | Version | Link |
| --- | --- | --- | --- |
| npm | `@qorechain/qorex-types` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-types |
| npm | `@qorechain/qorex-rainbowkit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| npm | `@qorechain/qorex-interchain-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-interchain-kit |
| npm | `@qorechain/qorex-cosmos-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit |
| npm | `@qorechain/qorex-wallet-mock` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-wallet-mock |
| npm | `@qorechain/qorex-synpress` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-synpress |

Source: https://github.com/qorechain/qorex-integrations (public, release `v0.1.0` published 27 October 2026, folders under `packages/`). It also holds guides (add QoreX next to MetaMask, Keplr or Phantom; end-to-end testing; errors and chain ids), a demo dApp that exercises every QoreX surface on the testnet, examples (`examples/wagmi-rainbowkit`, `examples/playwright-e2e`) and chain-registry entry files. Licence Apache-2.0; maintainer QoreChain Association. Versions read from the npm registry on 27 October 2026. They replace `@qorechain/connect`, which is deprecated on npm: use `qorex-types` to detect QoreX, `qorex-rainbowkit` for EVM dApps, `qorex-interchain-kit` (or `qorex-cosmos-kit`) for Cosmos dApps, and [QoreSign](/qoresign/overview) for hybrid signing in your own wallet or backend.

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

## Related pages {#related}

* [QoreX wallet](/qorex/overview) and the [QoreX Browser Extension](/qorex/browser-extension): the wallet these packages talk to.
* [QoreSign](/qoresign/overview): the hybrid signer the mock uses.
* [QoreChain SDK](/sdk/overview): encoding messages such as `MsgSend` for `signAndBroadcast`.
* [EVM Development](/developer-guide/evm-development#evm-window): ML-DSA-87 key registration and EVM authorization windows.
* [Faucet](/dashboard/faucet): testnet QOR.
* [QoreChain MCP server](/developer-tools/mcp): read the result of a broadcast with `get_pq_status`.
* [Developer packages overview](/developer-tools/overview).
