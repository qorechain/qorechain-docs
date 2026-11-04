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
subscriptions). The current release is **0.12.0**, published on 30 October 2026
in all five languages (checked against each registry on 4 November 2026):

| Registry | Package | Version |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`, `create-qorechain-dapp` | 0.12.0 |
| PyPI | `qorechain-sdk` (import `qorsdk`) | 0.12.0 |
| crates.io | `qorechain-sdk` (import `qorechain`) | 0.12.0 |
| Go module proxy | `github.com/qorechain/qorechain-sdk/packages/go` | v0.12.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.12.0 (JDK 17 or later) |

There is no 0.11.0 for Python, Rust, Go or Java: the npm packages had a 0.11.0 on
29 October 2026 (the chain developer kit, see below) and every language moved
from 0.10.0 to 0.12.0 together.

Pick your language below.

## Upgrade notes {#upgrade}

:::danger Use SDK 0.8.1 or later on the live networks
Both public networks verify the **v2 hybrid sign-bytes** form (domain-tagged and
bound to the chain id) and refuse the old form with `pqc` code 21. Every SDK
release before **0.8.0** signs the old form, and **0.8.0** looks for the switch
under only one of the two upgrade names the networks used (mainnet recorded it as
`v3.2.0`, the testnet as `v3.1.98` and later `v3.2.0`), so it signs the wrong form
on mainnet. Use **0.12.0** (or at least **0.8.1**) in every language; **0.8.2 or
later** is needed to open an [EVM authorization window](/sdk/guides/evm#evm-window).
Hybrid builders take a `signBytesVersion` option (`"auto"` | `"v1"` | `"v2"`); `"auto"`
asks the network and therefore needs the REST endpoint (`rest`) on
`qorechain-vladi` / `qorechain-diana`: it throws instead of guessing. See
[Which sign-bytes form?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
The form did not change in chain v3.2.3 or v3.2.4 (v3.2.4 runs on the testnet since 19 October 2026 and on mainnet since 23 October 2026; v3.2.5 and v3.2.6 changed nothing here; mainnet runs v3.2.6 since 4 November 2026): `"auto"`
resolves to v2 on both networks, because both applied the upgrade that switched to it.
:::

## What 0.12.0 adds {#whats-new-0120}

SDK 0.12.0 is the client release for chain **v3.2.5**, which mainnet applied at
height 3,906,833 on 29 October 2026 (the testnet applied it on 26 October). Both
networks have run v3.2.6 since 4 November (mainnet) and 27 October (testnet); the
hybrid signing format, addresses, decimals and memos did not change, so a
transaction built with 0.10.0 stays valid. TypeScript, Python, Go, Rust and Java
all move to 0.12.0, with `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`
and `create-qorechain-dapp`. The release was checked in every language with a
hybrid bank send on the testnet and with a KEM key registered, read back and
removed there, plus reads on mainnet.

| Area | In 0.12.0 |
| --- | --- |
| Public endpoints by default | The `mainnet` and `testnet` presets now point at the public endpoints (REST, consensus RPC and EVM JSON-RPC on both, plus the EVM WebSocket on the testnet) instead of localhost. A bare `createClient()` therefore talks to the public testnet. See [Network & endpoints](/sdk/reference/network#public-endpoints) |
| `localnet` preset | The localhost ports every preset used before 0.12.0, chain id `qorechain-devnet`. Select it with `createClient({ network: "localnet" })` to keep the old behaviour |
| Exact gas for hybrid transactions | On a network that has applied v3.2.5 the `"auto"` fee of a hybrid native transaction is `ceil(simulated x 1.02) + 2000`, because the simulation now charges the post-quantum verification itself. A hybrid bank send asks for about 171,600 gas instead of about 289,000, and the fee falls with it. Older networks, classical transactions and a failed plan lookup keep the earlier rule; a multiplier you pass replaces either rule. `exactHybridGas` (and its equivalents in every language) and, in TypeScript, `estimateGasDetails` (reports the simulation, the gas limit and which rule set it). Java gained the auto-gas path |
| ML-KEM-1024 key registry | An account publishes one ML-KEM-1024 encapsulation key (algorithm 2, 1,568 bytes) so anyone can encrypt to it: `msg.pqc.registerKemKey` and `msg.pqc.removeKemKey` (the key is checked first: size, every coefficient below 3329, not all zero), `validateKemPublicKey`, and the read `fetchKemKey` of `/qorechain/pqc/v1/kem/{address}` (bech32 or `0x`). Both messages need the hybrid signature. The route answers on mainnet and the testnet. The SDK does not encrypt: for sealed payloads see [QoreSeal](/developer-tools/qoreseal) |
| Abstract accounts | Reads of an account's stored spending rules and of its linked keys (revoked ones included), `MsgUpdateConfig` (the governance message that switches the module), and `authenticators_count` on the account view |
| Spending-rule checks | Rules are checked as the chain checks them: an `erc20/`, `erc721/` or `erc1155/` denom must name a `0x` contract address. `abstractaccount` codes 8 (invalid spending rule) and 9 (module disabled) are named |
| Governance parameters | The cross-VM `MsgUpdateParams` (including the CosmWasm contracts the EVM bridge precompile may call) and the rollup `MsgUpdateParams`, each checked against the chain's bounds before signing. The cross-VM params read carries `bridge_allowed_targets` |
| Upgrade constant and protos | `CHAIN_UPGRADE_V3_2_5`; protobuf definitions synced with chain v3.2.5 |
| Chain developer kit | From the npm-only 0.11.0 and included in 0.12.0: `@qorechain/evm` exports the viem chains `qorechain` (9801) and `qorechainTestnet` (9800) and the EVM authorization window helpers (`evmWindowStatus`, `openEvmWindowMessage`, also as `@qorechain/evm/window` without viem). `create-qorechain-dapp` has the `foundry`, `hardhat`, `viem-wagmi` and `cosmwasm` templates. `@qorechain/react` has `PqcStatusBadge` (the old `QuantumSafeBadge` names are kept as deprecated aliases) |
| Fixes | `@qorechain/svm` given endpoints without `svmRpc` used localhost; it now says the endpoint is not configured. The Python code generation points imports between QoreChain protos into the package |

**Behaviour change to check when you upgrade.** If your code relied on the
localhost default, select `localnet` or pass `endpoints`. The public testnet
endpoints are rate limited per IP, so production traffic should run or use its own
node. No preset sets a gRPC or an SVM endpoint on the public networks (SVM
transactions are not open), and mainnet has no public EVM WebSocket: code that needs
one of them fails with an error naming the endpoint to pass, instead of falling back
to localhost. In Rust the optional endpoints are now `Option<String>`; in Python, Go
and Java an unset endpoint is `None`, an empty string and `null`.

Nodes do not report their binary version. To detect a feature, ask `isUpgradeApplied`
for every upgrade name that brings it, or read `.version` from
`https://download.qore.host/<net>/latest.json`.

## What 0.10.0 added {#whats-new-0100}

SDK 0.10.0 is the client release for chain **v3.2.4**, which mainnet applied at
height 3,742,566 on 23 October 2026 (the testnet applied it at height 8,337,253
on 19 October). The signing format, addresses, decimals, memos and fees did not
change, and a transaction built with 0.9.0 stays valid. The release was checked in
every language with real transactions on the testnet. It had no builders for
anything introduced after v3.2.4; the v3.2.5 additions came with
[0.12.0](#whats-new-0120). Mainnet has run v3.2.6 since 4 November 2026 (height
4,020,000, governance proposal 15; v3.2.5 before it, from 29 October at height
3,906,833) and 0.10.0 keeps working there because the signing format did not
change. The testnet applied v3.2.5 and v3.2.6 on 26 and 27 October 2026. What 0.10.0
brought (all of it is still in 0.12.0):

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

`@qorechain/react` and `create-qorechain-dapp` moved to 0.10.0 with it; both are
at 0.12.0 now.

## What 0.9.0 added {#whats-new-090}

SDK 0.9.0 was the client release for chain **v3.2.2** and **v3.2.3** (mainnet
applied them at heights 3,556,788 and 3,662,051; mainnet ran v3.2.4 from 23 October 2026 (height 3,742,566) and ran v3.2.5 from 29 October and has run v3.2.6 since 4 November 2026, and the testnet has run v3.2.4 or later since 19 October 2026). The
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

Published to npm at `0.12.0`. It exports the viem chains `qorechain` (chain id 9801) and `qorechainTestnet` (9800) and the [EVM authorization window](/sdk/guides/evm#evm-window) helpers.

### SVM adapter

`@qorechain/svm` is a thin adapter over
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), which is a
**peer dependency**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Published to npm at `0.12.0`.

### React kit

`@qorechain/react` is the official React layer over `@qorechain/sdk` — a
provider, hooks, and the `ConnectButton` / `PqcStatusBadge` components.
`react` (>=18) is a peer dependency:

```bash
npm i @qorechain/react
```

Published to npm at `0.12.0`; it depends on `@qorechain/sdk` `^0.12.0`. See the [React kit guide](/sdk/guides/react).

### Scaffolder

`create-qorechain-dapp` (npm, `0.12.0`) scaffolds a ready-to-run dApp:

```bash
npm create qorechain-dapp@latest my-dapp
```

The generated `package.json` files depend on the SDK release the scaffolder ships
with (`@qorechain/sdk` `^0.12.0`; the EVM templates use `@qorechain/evm` `^0.12.0`). It also has `foundry`, `hardhat`, `viem-wagmi` and `cosmwasm` templates for contract work.
Version 0.8.0 of the scaffolder wrote `^0.3.0` ranges, which on a 0.x version stay
inside 0.3 and cannot sign for the live networks; if you scaffolded with 0.8.0, run
`npm i @qorechain/sdk@latest`. See the [CLI reference](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Requires Python 3.10+. The package ships type hints and a `py.typed` marker.

> The distribution installs as `qorechain-sdk` (published to PyPI at `0.12.0`)
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

Published as a self-contained Go module (tag `packages/go/v0.12.0`). Pin the version
explicitly: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.12.0`.

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

> Published to crates.io as `qorechain-sdk` (0.12.0); `cargo add qorechain-sdk`
> installs the latest release.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.12.0</version>
</dependency>
```

Or Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.12.0'
```

> Published to Maven Central as `io.github.qorechain:qorechain-sdk` (0.12.0 is the
> latest and release version, checked 4 November 2026; it needs JDK 17 or later). Central has no 0.8.0 or
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
| `@qorechain/rdk` | Rollup Development Kit client (see [Rollups](/rollups/why)). From 0.7.0 it depends on `@qorechain/sdk` `^0.10.0` and `@qorechain/evm` `^0.8.0` (checked on npm, 4 November 2026). A caret on a 0.x version stays inside that minor, so an app on SDK 0.12.0 gets a second, nested SDK 0.10.x copy for the kit; keep the two apart (do not pass a client from one copy to the other) until a kit release moves to 0.12. Signs hybrid only when you pass a `pqcKeypair`; reads work without it. Also published as `qorechain-rdk` on PyPI, crates.io and Maven Central and as a Go module (pin `@v0.8.0`); from 0.8.0 those four clients sign hybrid too (earlier versions signed classical-only; Java needs Java 21). See [RDK 0.8.0: changes and limits](/rollups/deploying-a-rollup#rdk-050-limits) | 0.8.0 |
| `@qorechain/rdk-cli` | The `qorollup` operator CLI for the RDK. Since 0.7.1 its transaction commands (`create`, `pause`, `resume`, `stop`, `withdraw`) sign hybrid (0.7.0 and earlier signed classical-only and were refused by the networks); installed from npm it runs and `--version` prints the installed version (0.6.1 and earlier printed nothing) | 0.8.0 |
| `@qorechain/qoreseal` | QoreSeal: encrypt a payload to the ML-KEM-1024 keys that accounts publish in the KEM registry (SDK 0.12.0 registers and reads the keys; QoreSeal does the encryption). Also on PyPI (`qorechain-qoreseal`; macOS and Linux wheels, Windows wheel in the next version), crates.io, Maven Central (`io.github.qorechain:qoreseal` and `qoreseal-android`; Kotlin consumers need Kotlin 2.3 or later), the Go module proxy (`github.com/qorechain/qoreseal/go`, Go `v0.1.0`) and as a Swift package. See [QoreSeal](/developer-tools/qoreseal) | 0.1.0 |
| `@qorechain/asset-kit` | Asset Kit: tooling for permissioned real-world-asset tokens on the EVM Engine, with clients in TypeScript, Python, Java and Go and Solidity contracts (`forge install qorechain/qorechain-asset-kit@v0.1.0`). Apache-2.0, except the ERC-3643 scripts and tests (GPL-3.0-or-later). The native modules it describes are a proposal, not built. Also `qorechain-asset-kit` on PyPI and `io.github.qorechain:asset-kit` on Maven Central. See [Asset Kit](/developer-tools/asset-kit) | 0.1.0 |
| `@qorechain/qoresign` | QoreSign: wallet and backend signing, and `inspectTransaction` to check a committed transaction's post-quantum layer. Also on PyPI, crates.io and Maven Central. See [QoreSign](/qoresign/overview) | 0.1.1 |
| `create-qorechain-rollup` | Rollup starter scaffolder; its templates depend on `@qorechain/rdk` `^0.8.0` and sign hybrid when they can resolve your post-quantum key from `QORE_MNEMONIC` or `QORE_PQC_SEED_HEX` | 0.8.0 |

## Next

Continue to the [Quickstart](/sdk/quickstart) to connect and read on-chain state.
