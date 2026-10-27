---
slug: /developer-tools/chain-bridge
title: Chain Bridge and Handles
sidebar_label: Chain bridge and handles
sidebar_position: 3
---

# Chain bridge and handles

This page covers two small server-side packages.

**`@qorechain/chain-bridge`** (0.2.3) is a Node.js library for backends that act on QoreChain without a person at a keyboard: it sends QOR, registers an account's ML-DSA-87 key, registers light nodes, deploys contracts and, for the holder of the chain's licence authority key, grants and revokes licences. It handles the two things a plain backend cannot do alone: the ML-DSA-87 hybrid signature that native-lane transactions need, and the exact protobuf encoding of QoreChain's custom messages. It is for hot-wallet workers, payment and dashboard backends and similar services.

**`@qorechain/handles`** (0.1.0) resolves a QoreX `@handle` to an address and verifies the answer cryptographically before returning it. It is for wallets and services that let a person type `@alice` instead of a `qor1...` address.

Neither package lists a source repository in its registry metadata. You can read the published code on npm.

## Innovations {#innovations}

### Chain bridge {#innovations-chain-bridge}

- **One mnemonic, one canonical ML-DSA-87 key.** The key is derived as `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` and then ML-DSA-87 key generation, the same derivation as the [wallet adapter](/developer-tools/wallet-adapter), the SDK and QoreX, so the key can be recovered with `qorechaind tx pqc recover-key`. Accounts registered by older tooling with `SHAKE-256(mnemonic)` keep their legacy key: when a canonical signature is refused with a verification failure the bridge retries once with the legacy key.
- **Sign-bytes form read from the chain.** With `cosmosRest` set the bridge asks the node for the applied upgrade plans (`v3.2.0` and `v3.1.98`) and signs the v2 form when either is applied, as described on the [wallet adapter page](/developer-tools/wallet-adapter#innovations). If the chain refuses with `pqc` code 21 it re-resolves once and signs again. On the live networks `cosmosRest` is required; without it a hybrid call throws instead of guessing.
- **Registers the key on first use, but checks the chain first.** When a hybrid transaction is refused for a missing PQC key, the bridge sends `MsgRegisterPQCKeyV2` (a classical transaction, which the chain allows for a first registration) and retries. Because that message costs its fee even when refused, it first reads `GET /qorechain/pqc/v1/account/{address}`: if the account already holds a key that is neither the canonical nor the legacy key of your mnemonic it throws `pqc_key_mismatch` and sends nothing. With `cosmosRest`, a registration also carries the proof of possession once the network has applied v3.2.3 (mainnet and testnet both have).
- **Licence feature IDs from plain names.** `featureIdsFor({ type, chains })` maps a product description to the chain's feature IDs (`validator_operator` plus `validator_<chain>`, `lightnode_operator`, `qcb_bridge` plus `bridge_<chain>`), normalizes free-text chain names such as "Solana" or "BNB Chain", and drops an unknown chain instead of building an ID the chain would reject. Checked on 27 October 2026: `featureIdsFor({ type: "validator", chains: ["Solana", "Ethereum", "Foo"] })` returned `validator_operator`, `validator_solana`, `validator_ethereum` and dropped `Foo`.
- **Pure JavaScript, no native add-ons.** It is an ES module for Node.js 18 or later, so it runs in serverless workers. Besides the main entry it exports `@qorechain/chain-bridge/proto` (the wire encoders) and `@qorechain/chain-bridge/features` (the feature mapping).

### Handles {#innovations-handles}

- **A resolution is checked twice before it is returned.** The record must carry the registry's ed25519 signature, verified against a registry public key that you pin in the client, and the owner's own secp256k1 signature over the claim, whose public key must hash to the record's `qor1` address. A record that fails either check is never returned.
- **The pin store is yours.** `resolve` returns `pin.status` as `new`, `match` or `CHANGED` by comparing the record with a pin you hold, and it never pins on its own. You pin after the user has seen the address and proceeded. The point of a pin is to notice that the registry started saying something different, so it must be held by someone other than the party being checked, for example on the user's device.
- **Only owner-signed addresses are returned for a network.** `addressForNetwork(record, caip2)` returns the `qor1` address for QoreChain networks, and the `0x` address for chain IDs 9800 and 9801 when the record is a unified account. Addresses on other chains that the registry merely attests are not returned for sending.
- **Display-only reverse lookup.** `reverse(address)` returns a handle for showing in history. Its result must never become the destination of a send.
- **Claim and delete use separate signing domains.** `signClaim` and `signDelete` sign different messages, so a delete signature cannot be replayed as a claim.

## How to use {#how-to-use}

### Chain bridge {#use-chain-bridge}

```bash
npm install @qorechain/chain-bridge
```

It pulls in `@qorechain/wallet-adapter` (^0.4.0), `@qorechain/pqc` (^0.2.1), cosmjs 0.32 and ethers 6. There is no tested quickstart for it; the snippet below follows the package typings and the [Exchange integration guide](/developer-guide/exchange-integration#chain-bridge). On 27 October 2026 the constructor, `featureIdsFor` and the list of methods were checked against the published 0.2.3 package; no transaction was sent.

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc-testnet.qore.host",
  cosmosRest: "https://api-testnet.qore.host", // picks the sign-bytes form; required on both live networks
  chainId: "qorechain-diana",
  signerMnemonic: process.env.WORKER_MNEMONIC, // from your secrets manager, never in source code
});

// Once per account (the bridge also does it on first use if the chain reports no key).
await bridge.registerPqc({ mnemonic: process.env.WORKER_MNEMONIC });

// Amounts are in uqor (6 decimals): 1 QOR = 1000000.
const { txHash, code } = await bridge.sendTokens({ to: "qor1...", amountUqor: "1000000" });
```

Main methods:

| Method | What it does | Key used |
|---|---|---|
| `sendTokens({ to, amountUqor })` | bank `MsgSend`, hybrid-signed | signer |
| `registerPqc({ mnemonic })` | `MsgRegisterPQCKeyV2`, classical | that account |
| `registerLightNode({ operatorMnemonic, nodeType, version, capabilities })` | light node registration, hybrid-signed | operator |
| `grantLicense`, `grantLicenseSet`, `revokeLicense`, `suspendLicense`, `resumeLicense` | licence module messages | the chain's licence authority key |
| `deployEvm({ bytecode, abi, args })` | an Ethereum-style deployment through `eth_sendRawTransaction` | deployer key |
| `deploySvm({ bytecode })` | SVM program deployment | signer |
| `createVestingAccount`, `createPeriodicVestingAccount` | vesting account creation | signer |
| `featureIdsFor`, `normalizeChain` | local helpers | none |

Every call returns `{ txHash, code, height, gasUsed }`, and a hybrid call also reports `signBytesVersion`. The default gas price is 0.1 uqor per gas, which is the network floor (a 300,000 gas `sendTokens` costs 30,000 uqor at that price, and the 6,000,000 gas default for a key registration 600,000 uqor, which you pay once per account). The EVM lane uses 18 decimals: the `value` of `deployEvm` is in wei. Set `keyType: "eth_secp256k1"` in the configuration to sign with the unified eth-native key (one identity as `qor1`, `0x` and SVM) instead of the default coin-type-118 key; that option is in the source and the wallet adapter README but not in the typings.

### Handles {#handles}

```bash
npm install @qorechain/handles
```

Its only runtime dependencies are `@noble/curves`, `@noble/hashes` and `bech32`. No tested quickstart exists for it. The snippet follows the package README and typings; on 27 October 2026 `isHandleInput`, `normalizeHandle` and the export list were checked on the published 0.1.0 package, and no registry was contacted.

```ts
import { HandleClient, type PinStore } from "@qorechain/handles";

const client = new HandleClient({ baseUrl: registryUrl, registryPubkeyHex });

// You supply the pin store, ideally on the user's device.
const pins: PinStore = { get: (handle) => load(handle), put: (pin) => save(pin) };

const { record, pin } = await client.resolve("@alice", pins);

if (pin.status === "CHANGED") {
  // Stop. Show both addresses in full and require explicit confirmation.
  // Never update the pin silently.
}

// Show record.qorAddress to the user. When they proceed (and only then):
await client.pin(record, pins, Date.now());
```

`resolve` throws when the handle is unknown, the registry cannot be reached, or the answer fails verification. `isHandleInput(text)` tells a handle from an address (a handle is 3 to 20 characters of `a-z`, `0-9` and `_`, or starts with `@`; a `qor1...` or `0x...` string is never a handle). Other exports: `claimSignBytes`, `signClaim`, `deleteSignBytes`, `signDelete`, `verifyResolution`, `checkPin`, `QorexError`. For how QoreX uses handles, see [Send to an @handle](/qorex/browser-extension#handle-send) and [Account and Dashboard](/qorex/account-and-dashboard).

## How to access {#how-to-access}

- **Networks:** the chain bridge runs against mainnet `qorechain-vladi` or testnet `qorechain-diana` with the endpoints listed in the [Developer packages](/developer-tools/overview#how-to-access) page (the EVM RPC and chain ID 9800 or 9801 for `deployEvm`).
- **Chain bridge prerequisites:** Node.js 18 or later; a funded account whose mnemonic your worker holds (keep it in a secrets manager); and the network's REST URL. The ML-DSA-87 key is derived from the mnemonic and registered on first use, so the account must hold enough QOR for that registration fee.
- **Licence calls** succeed only when signed by the key the chain was configured with as its licence authority. An outside developer does not hold it, so these methods are for the operator of that key. For licences and light node registration as a user, see [Registration and licensing](/light-node/registration-and-licensing).
- **Handles prerequisites:** the registry's base URL and its ed25519 public key (hex), a pin store you implement, and `fetch`. Reads need no account.
- **Cost:** both packages are free. Chain bridge transactions pay the network fee.

## Where it is published {#where-published}

| Registry | Package | Version | Link |
|---|---|---|---|
| npm | `@qorechain/chain-bridge` | 0.2.3 (published 20 October 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/chain-bridge) |
| npm | `@qorechain/handles` | 0.1.0 (published August 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/handles) |

Both are Apache-2.0 and published on npm only (not PyPI, crates.io, Maven Central or the Go proxy). Neither lists a source repository in its registry metadata, so there is no public source page to link; the code is in the published tarball. To read live versions, see [How to get live versions](/developer-tools/overview#live-versions).

## Limits and known issues {#limits}

### Chain bridge {#limits-chain-bridge}

- **EVM deployments need an open window.** `deployEvm` sends a standard Ethereum transaction. Since chain v3.2.0 the EVM lane admits a transaction only from an account with a registered ML-DSA-87 key and an open EVM authorization window, and the bridge has no method that opens one. Open the window with other tooling (the [wallet adapter](/developer-tools/wallet-adapter#evm-window), the SDK or QoreX) before you call it, or the transaction is refused (codespace `pqc`, code 26, 27 or 28). This follows the chain rules and the package source; it was not tried against a live network for this page. The package README still calls the EVM lane exempt, which is out of date.
- **`deploySvm`** targets the SVM lane, which does not accept transactions yet on either network.
- **Contract upload methods exist but are not documented.** The source also has `storeWasm`, `instantiateWasm` and `deployWasm` for QoreChain Native contracts, which are not in the typings or README. Upload is governance-only for ordinary accounts on the live networks, so expect a refusal for an ordinary account.
- **The key is derived on the server.** The mnemonic stays in your process. Keep it out of logs and source control, and do not reuse it as a personal wallet.
- **A registration is not free.** The bridge registers the key itself on first use; a rail that moves funds should register ahead of time and confirm the result with `GET /qorechain/pqc/v1/account/{address}` before the first withdrawal.
- **cosmjs 0.32.** Do not install it next to the SDK (cosmjs 0.39) in one project; npm reports `ERESOLVE`.
- **Stale README parts.** The README says mainnet stays on the first sign-bytes form; both networks verify v2 (see [Post-Quantum Security](/architecture/post-quantum-security)).
- **No tested quickstart, no public source repository.**

### Handles {#limits-handles}

- **The registry address and public key are not published** in the package or in this manual. QoreX and the dashboard have them built in, so an integrator can use the package only if given those two values.
- **Handles are not on-chain names.** The registry is an off-chain service run for QoreX; the package verifies its answers but cannot make it available. If the registry is unreachable, `resolve` throws a `NETWORK_UNAVAILABLE` error, and `isReachable()` is a quick probe a UI can use to hide handle features.
- **It pins nothing for you.** If you never call `pin`, every resolution reports `new`. The caller is responsible for storing pins safely.
- **Only owner-signed addresses are used for sending.** Addresses on other chains that the registry attests are not returned by `addressForNetwork`.
- **Write calls need more than the package.** `claim`, `deleteHandle` and `bySub` talk to the registry's write endpoints and need an owner signature (`signClaim`, `signDelete`) or an account token; they are meant for wallet apps.
- **No tested quickstart, no public source repository.**
