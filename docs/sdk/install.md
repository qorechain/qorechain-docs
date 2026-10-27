---
slug: /sdk/install
title: Install
sidebar_label: Install
sidebar_position: 2
---

# Install

Install the SDK for your language. The TypeScript core (`@qorechain/sdk`), the
EVM and SVM adapters (`@qorechain/evm`, `@qorechain/svm`), the React kit
(`@qorechain/react`), and the Python, Go, Rust, and Java clients are all
**published** to their registries with full native-chain parity (typed messages,
queries, the tx lifecycle, hybrid PQC transactions, and WebSocket
subscriptions). The current release line is **0.10**, published on 25 and 26
October 2026 (checked against each registry on 27 October 2026):

| Registry | Package | Version |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `create-qorechain-dapp` | 0.10.0 |
| PyPI | `qorechain-sdk` (import `qorsdk`) | 0.10.0 |
| crates.io | `qorechain-sdk` (import `qorechain`) | 0.10.0 |
| Go module proxy | `github.com/qorechain/qorechain-sdk/packages/go` | v0.10.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.10.0 (the Java client is back in step with the other languages; 0.9.1 was a Java-only update) |

Pick your language below.

## Upgrade notes {#upgrade}

:::danger Use SDK 0.8.1 or later on the live networks
Both public networks verify the **v2 hybrid sign-bytes** form (domain-tagged and
bound to the chain id) and refuse the old form with `pqc` code 21. Every SDK
release before **0.8.0** signs the old form, and **0.8.0** looks for the switch
under only one of the two upgrade names the networks used (mainnet recorded it as
`v3.2.0`, the testnet as `v3.1.98` and later `v3.2.0`), so it signs the wrong form
on mainnet. Use **0.10.0** (or at least **0.8.1**) in every language; **0.8.2 or
later** is needed to open an [EVM authorization window](/sdk/guides/evm#evm-window).
Hybrid builders take a `signBytesVersion` option (`"auto"` | `"v1"` | `"v2"`); `"auto"`
asks the network and therefore needs the REST endpoint (`rest`) on
`qorechain-vladi` / `qorechain-diana`: it throws instead of guessing. See
[Which sign-bytes form?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
The form did not change in chain v3.2.3 or v3.2.4 (v3.2.4 runs on the testnet since 19 October 2026 and on mainnet since 23 October 2026): `"auto"`
resolves to v2 on both networks, because both applied the upgrade that switched to it.
:::

## What 0.10.0 adds {#whats-new-0100}

SDK 0.10.0 is the client release for chain **v3.2.4**, which mainnet applied at
height 3,742,566 on 23 October 2026 (the testnet applied it at height 8,337,253
on 19 October). The signing format, addresses, decimals, memos and fees did not
change, and a transaction built with 0.9.0 stays valid. The release was checked in
every language with real transactions on the testnet. It has no builders for
anything introduced after v3.2.4. The testnet has moved on to v3.2.6 (v3.2.5 and
v3.2.6 were applied there on 26 and 27 October 2026); mainnet governance proposal
14 would apply v3.2.5 at height 3,906,833 at the time of writing, and what that
release adds is documented when mainnet applies it. What is new in 0.10.0:

| Area | In 0.10.0 |
| --- | --- |
| Staking tiers (`x/stakingtier`) | Composers `lockDelegation` (the chain's own checks: a term of 3, 6 or 12 months and a positive whole amount), `unlockEarly`, `claimBonus` and `updateParams`; reads for the module parameters, a holder's locks and the bonus pool (`fetchStakingTierParams`, `fetchStakingLocks`, `fetchStakingTierPool`); the module's error codes. What the module does is described in [Staking and Delegation](/user-guide/staking-and-delegation) |
| Authenticator nonce | `fetchAuthNonce({ rest, address, pubkey })` reads the sequence a linked key must sign next for `MsgExecuteEVM` / `MsgExecuteCosmos` from `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}`, instead of tracking it by hand. Both networks serve the route; the `abstractaccount` module itself is switched off on mainnet (enabled on the testnet), so a mainnet spend is refused before any nonce is checked |
| Protocol feature switches | `fetchProtocolFeatures` and `isProtocolFeatureEnabled` read which consensus rules a network enforces, by name, from `/qorechain/pqc/v1/protocol_features` (both networks serve it). A network below v3.2.4 does not serve the route; use `isUpgradeApplied` there |
| `possessionProven` | The PQC status says whether the account's key was registered with a proof of possession |
| `ibcTimeoutTimestamp(seconds)` | An absolute IBC timeout in the unit `MsgTransfer` takes (Unix nanoseconds). IBC timeouts are absolute times; IBC v2 packets take absolute Unix seconds, and a relative value there is refused after the fee is charged. No IBC channel is open on mainnet (checked 27 October 2026) |
| Upgrade constant and protos | `CHAIN_UPGRADE_V3_2_4`; protobuf definitions synced with chain v3.2.4 (new fields on the bridge validator registration, light node and rollup queries) |
| `ensurePqcRegistered` | It compared a status without a public key as a match; it now reads the key over `rest` and compares it. With nothing to read it from, the result reports `keyVerified: false` instead of claiming the key is the caller's |
| Refusals during fee simulation | A chain refusal that arrives as text only (for example "no bonus to claim") is now named from the chain's registered error descriptions in every language: `decodeTxError` (TypeScript), `SimulationRefusedError` (Python), `tx.DecodeRefusalText` (Go), `tx::decode_refusal_text` (Rust), `TxError.decode` (Java) |

`@qorechain/react` and `create-qorechain-dapp` moved to 0.10.0 with it (the kit
depends on `@qorechain/sdk` `^0.10.0`, and the scaffolder's templates do too).

## What 0.9.0 added {#whats-new-090}

SDK 0.9.0 was the client release for chain **v3.2.2** and **v3.2.3** (mainnet
applied them at heights 3,556,788 and 3,662,051; mainnet has run v3.2.4 since 23 October 2026 at height 3,742,566, and the testnet has run v3.2.4 or later since 19 October 2026). The
signing format, addresses, decimals, memos and fees did not change, so the
v2 hybrid sign-bytes form that 0.8.1 and later sign is still the right one.
What is new:

| Area | In 0.9.0 (and later) |
| --- | --- |
| Hybrid `TxClient` (TypeScript) | Pass the account's keypair: `client.connectTx(signer, { pqcKeypair })` or `TxClient.connect({ …, pqcKeypair, rest })`. Every transaction is then signed hybrid and `fee: "auto"` simulates the hybrid transaction itself; a bare key registration stays classical (the chain's bootstrap path). `bankSend` and the SDK's rollup, multilayer and cross-VM clients use it. Without a keypair nothing changes |
| Recoverable PQC key | `derivePqcCanonical(address, mnemonic)` and its equivalents in every language (see [Hybrid signing](/sdk/guides/quantum-safe#canonical-derivation)) |
| `ensurePqcRegistered` | Reads the key status over REST first (`rest`), refuses to register when it cannot tell, throws `PqcKeyMismatchError` when the account already holds a different key, and treats the chain's "already registered" refusal as success. From chain v3.2.3 it signs and attaches the **proof of possession** by itself; before v3.2.3 it leaves the field off |
| Scoped EVM windows | `openEvmWindowMsg` takes `nativeOnly` and `allowedTargets` (at most 16, no duplicates); `fetchEvmWindow` reads both back (see [EVM guide](/sdk/guides/evm#evm-window)) |
| EIP-7702 consent | `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`, `classifyEvmDelegationRejection` |
| Key integrity | The registration builders refuse `classical_only`, an empty key and a degenerate ML-DSA-87 key, which the chain refuses from v3.2.3. `signProofOfPossession` / `verifyProofOfPossession` are exported; `migratePqcKeyHybrid` sends the hybrid-signed `MsgMigratePQCKey` that keyed accounts need from v3.2.3 |
| Abstract-account digest v2 | `evmAuthSignBytesV2` (binds the call's gas limit) and `resolveEvmAuthDigestVersion`. The `abstractaccount` module is switched off on mainnet (enabled on the testnet), so on mainnet this is for reference |
| Upgrade detection | `isUpgradeApplied`, `requireUpgradeApplied`: new optional fields are set only after `applied_plan` reports the release, because a node that has not applied a release refuses the whole transaction when one of that release's new fields is set |
| Error decoding | A failure inside a block keeps its codespace (for example `pqc` 231, not `sdk_231`); `rate_limited` and the delegation codes are decoded; `decodeTxError` reads a thrown error's log or message |
| Spending rules | `validateSpendingRules` runs in the `MsgUpdateSpendingRules` builders and refuses a rule that bounds nothing |
| Fixes | The PQC account route is the singular `/qorechain/pqc/v1/account/{address}` in every SDK (and in `client.rest.getPqcAccount`, `isPqcRegistered` and `getPqcStatus` when given the composed client); the exported `VERSION` matches the package; Go and Rust clients created by the SDK time out instead of hanging; `create-qorechain-dapp` templates depend on the release they ship with |

The legacy PQC derivation for new keys (`derivePqcLegacy`, `"bridge"`) is
deprecated: it is not bound to the account, so one mnemonic would give one key to
every account. The rotation helpers refuse it as the **new** key; recovering or
rotating away from an existing legacy key still works.

## Versions before 0.9.0 {#before-090}

If you are on 0.8.x, it still signs the form both networks verify and works on
mainnet and the testnet. These are the limits that 0.9.0 removed, and
some of them cost a fee if you do not know them:

| Release before 0.9.0 | Workaround |
| --- | --- |
| No proof-of-possession, scoped-window or EIP-7702 consent builders | Use `qorechaind tx pqc register-key-v2 … --pqc-key <name>`, `open-evm-window --native-only` / `--allowed-targets`, and `authorize-evm-delegation` / `clear-evm-delegation` (see [EVM authorisation window](/getting-started/first-transaction#evm-window), [EIP-7702 delegations](/architecture/post-quantum-security#eip-7702)) |
| `ensurePqcRegistered` without a `status` broadcast the registration unchecked, and reported success when a different key was registered | A second registration for an account that already holds a key is refused **after the fee is taken**. Read `GET /qorechain/pqc/v1/account/{address}` first and pass `status: { registered: found }` |
| `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus` | They called a plural `/accounts/` path or the `qor_` namespace, which the public endpoints do not serve (HTTP 501, `-32601`). Read the singular REST route above |
| `TxClient` / `bankSend` and the rollup, multilayer and cross-VM clients signed classical-only | The networks refuse that for any account that has a key. Send through `signAndBroadcastHybrid` |
| Failed in-block transactions lost their codespace | Read the transaction from `GET /cosmos/tx/v1beta1/txs/{hash}` |
| The exported `VERSION` constant of 0.8.3 reported `0.8.0` | Read the installed version from `package.json` |
| `create-qorechain-dapp` 0.8.0 pinned `@qorechain/sdk` / `@qorechain/evm` to `^0.3.0` (a caret on a 0.x version stays inside 0.3) | Run `npm i @qorechain/sdk@latest` after scaffolding |
| `@qorechain/react` 0.8.x kept the registered-key status unreadable on the public endpoints | Use `@qorechain/react` 0.9.0 or later |

:::caution Older fixes
SDK **0.6.1** fixed a consensus-critical bug: the
`/qorechain.pqc.v1.PQCHybridSignature` tx-body extension was JSON-serialized
into `Any.value` and **rejected by the chain at CheckTx**. Hybrid (PQC +
classical) transactions built with SDK ≤ 0.6.0 are rejected on-chain. **0.8.0**
removed the wallet-signature account helpers (see
[Accounts & PQC signing](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

The core package:

```bash
npm i @qorechain/sdk
```

It targets Node.js 20+ and ships ESM, CommonJS, and type definitions. The
hybrid-transaction samples in these docs also import `StargateClient` from
`@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### EVM adapter

`@qorechain/evm` is a thin, type-safe adapter over [viem](https://viem.sh).
viem is a **peer dependency** — install it alongside:

```bash
npm i @qorechain/evm viem
```

Published to npm at `0.8.0`.

### SVM adapter

`@qorechain/svm` is a thin adapter over
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), which is a
**peer dependency**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Published to npm at `0.8.0`.

### React kit

`@qorechain/react` is the official React layer over `@qorechain/sdk` — a
provider, hooks, and the `ConnectButton` / `QuantumSafeBadge` components.
`react` (>=18) is a peer dependency:

```bash
npm i @qorechain/react
```

Published to npm at `0.10.0`; it depends on `@qorechain/sdk` `^0.10.0`. See the [React kit guide](/sdk/guides/react).

### Scaffolder

`create-qorechain-dapp` (npm, `0.10.0`) scaffolds a ready-to-run dApp:

```bash
npm create qorechain-dapp@latest my-dapp
```

The generated `package.json` files depend on the SDK release the scaffolder ships
with (`@qorechain/sdk` `^0.10.0`; the EVM template uses `@qorechain/evm` `^0.8.0`).
Version 0.8.0 of the scaffolder wrote `^0.3.0` ranges, which on a 0.x version stay
inside 0.3 and cannot sign for the live networks; if you scaffolded with 0.8.0, run
`npm i @qorechain/sdk@latest`. See the [CLI reference](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Requires Python 3.10+. The package ships type hints and a `py.typed` marker.

> The distribution installs as `qorechain-sdk` (published to PyPI at `0.10.0`)
> but **imports as `qorsdk`**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Requires Go 1.23+. Import the sub-packages you need, for example:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Published as a self-contained Go module (tag `packages/go/v0.10.0`). Pin the version
explicitly: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.10.0`.

## Rust

```bash
cargo add qorechain-sdk
```

Or, to track the repository head:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Requires Rust 1.74+. The read clients are async (Tokio). The crate imports as
`qorechain` (`use qorechain;`).

> Published to crates.io as `qorechain-sdk` (0.10.0); `cargo add qorechain-sdk`
> installs the latest release.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.10.0</version>
</dependency>
```

Or Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.10.0'
```

> Published to Maven Central as `io.github.qorechain:qorechain-sdk` (0.10.0 is the
> latest and release version, checked 27 October 2026). Central has no 0.8.0 or
> 0.8.1 build, so on the live networks use 0.8.2 or later. 0.9.1 was a
> Java-only release that moved Bouncy Castle from 1.80 to 1.85 with no API change.

## Related packages {#related-packages}

| Package | Purpose | Version |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Wallet-side helpers: wallet generation (`generateQoreWallet`), `eth_secp256k1` hybrid signing (`signHybridEth`, `QoreChainSigner`), MetaMask network registration (`addQoreEvmToWallet`), authenticator and EVM-window message builders (its `openEvmWindowMsg` builds the unscoped form only), the v2 abstract-account digest. It does not attach a proof of possession. Peer dependencies: `@cosmjs/proto-signing` and `@cosmjs/stargate` `^0.32` (the SDK uses cosmjs 0.39, so installing both in one project makes npm report a peer conflict, `ERESOLVE`; keep them in separate projects or pass `--legacy-peer-deps`) | 0.4.0 |
| `@qorechain/chain-bridge` | Server-side worker for backends: derives the PQC key, hybrid-signs and broadcasts (`sendTokens`, `registerPqc`, and more). Pass `cosmosRest`: with it, a registration carries the proof of possession once the network has applied v3.2.3, and a PQC-looking refusal is checked against the chain before any re-registration (a different registered key raises `pqc_key_mismatch` instead of paying for a second registration) | 0.2.3 |
| `@qorechain/pqc` | Standards-only ML-DSA / ML-KEM / SHAKE-256 primitives and `hybridSignBytes` (see [Post-Quantum Signing](/developer-guide/post-quantum-signing)); also on PyPI, crates.io, Maven Central and the Go proxy (Go `v0.2.3`) at the same version | 0.2.3 |
| `@qorechain/handles` | Verified `@handle` resolution (`HandleClient`): you supply the registry's public key and a pin store, and you pin after the user has seen the address; the package never pins on its own. See [Chain bridge and handles](/developer-tools/chain-bridge#handles) | 0.1.0 |
| `@qorechain/connect` | **Deprecated on npm and no longer maintained; do not use it for new work. Use [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) instead (replacements for QoreX connection are in the [developer tools overview](/developer-tools/overview#group-connect)).** One connector for EVM, Cosmos and SVM wallets, built on the wallet adapter (its peer range is `@qorechain/wallet-adapter` `^0.2.1`, which does not include 0.4.0). It does not open an [EVM authorization window](/sdk/guides/evm#evm-window), so an EVM send through it is refused until the account has a registered key and an open window | 0.2.1 |
| `@qorechain/rdk` | Rollup Development Kit client (see [Rollups](/rollups/why)). From 0.7.0 it depends on `@qorechain/sdk` `^0.10.0` and `@qorechain/evm` `^0.8.0`, so an app on SDK 0.10.0 shares one SDK copy with the kit (0.6.x depended on `^0.9.0`, and a caret on a 0.x version stays inside 0.9, which gave an app on SDK 0.10.0 a second, nested SDK 0.9.x copy). Signs hybrid only when you pass a `pqcKeypair`; reads work without it. Also published as `qorechain-rdk` on PyPI, crates.io and Maven Central and as a Go module (pin `@v0.7.0`); those four clients sign classical-only. See [RDK 0.7.0: changes and limits](/rollups/deploying-a-rollup#rdk-050-limits) | 0.7.0 |
| `@qorechain/rdk-cli` | The `qorollup` operator CLI for the RDK. Its transaction commands (`create`, `pause`, `resume`, `stop`, `withdraw`) sign classical-only and are refused by the networks; installed from npm it runs and `--version` prints 0.7.0 (0.6.1 and earlier printed nothing) | 0.7.0 |
| `create-qorechain-rollup` | Rollup starter scaffolder; its templates depend on `@qorechain/rdk` `^0.7.0` and sign hybrid when they can resolve your post-quantum key from `QORE_MNEMONIC` or `QORE_PQC_SEED_HEX` | 0.7.0 |

## Next

Continue to the [Quickstart](/sdk/quickstart) to connect and read on-chain state.
