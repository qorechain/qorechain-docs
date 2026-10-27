---
slug: /qoresign/overview
title: QoreSign Overview
sidebar_label: Overview
sidebar_position: 1
---

# QoreSign

QoreSign is an open-source library for hybrid secp256k1 + ML-DSA-87 (FIPS 204) signing on QoreChain, for wallets, exchanges, custodians and backends.

QoreSign lets a wallet other than QoreChain's own derive an account's ML-DSA-87 key, sign native-lane transactions with both keys, verify hybrid signatures locally, sign arbitrary messages, simulate a transaction before signing, read back how a committed transaction was protected, and implement Sign In With QoreChain. It is a thin layer over the [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) bindings and adds no cryptographic primitives of its own. It is maintained by the QoreChain Association under the Apache-2.0 licence.

The current release is **0.1.1** (27 October 2026). It is published in TypeScript, Rust, Go, Kotlin (JVM and Android), Swift and, new in 0.1.1, Python. The source, examples and test vectors are in the [qorechain/qoresign](https://github.com/qorechain/qoresign) repository. It works on mainnet (`qorechain-vladi`) and on the testnet (`qorechain-diana`).

## What QoreSign does on each lane {#lanes}

| Lane | What QoreSign does today |
|---|---|
| **Native** (Cosmos SDK) | Hybrid signing and verification. The network requires the ML-DSA-87 signature by default. |
| **EVM** | Authorization window only: the account registers an ML-DSA-87 key and opens a bounded authorization window from the native lane. Ethereum transactions themselves carry no ML-DSA-87 signature. |
| **SVM** | Not open on the network yet (`LANE_NOT_AVAILABLE`). |

Hybrid EVM signing needs per-lane PQC support in the network first. See [EVM wallets: authorization window](/qoresign/guides/evm-quantum-ready).

## What it does {#what-it-does}

Offline core, the same in every language:

- Derives the classical key on `m/44'/118'/0'/0/0` (`deriveClassicalKey`) and the canonical ML-DSA-87 key that QoreChain wallets register for an account (`deriveCanonicalPqKey`, bound to the mnemonic and the address). A hardened HD derivation exists as a draft (`deriveHdPqKey`); `pqKeyFromSeed` rebuilds a key pair from its 32-byte seed.
- Builds and parses `qor1` addresses for `secp256k1` and `eth_secp256k1` accounts.
- Signs a native-lane transaction with both keys (`signHybrid`), or adds only the ML-DSA-87 layer to a body a dApp built (`signPqLayer`). ML-DSA-87 signatures are deterministic by default; hedged signing is an option, and the network accepts both. secp256k1 uses RFC 6979 with low-S.
- Computes hybrid sign-bytes v1 and v2 (`hybridSignBytes`) and verifies a full hybrid transaction (`verifyHybridTx`) or the ML-DSA-87 layer alone (`verifyPqLayer`).
- Builds `MsgRegisterPQCKeyV2` with a proof of possession (`buildRegisterPqKeyMessage`, `signProofOfPossession`) and refuses degenerate public keys.
- Signs and verifies arbitrary messages (`signMessage`, `verifyMessage`) and implements Sign In With QoreChain v1 (`createSiwqMessage`, `signSiwq`, `verifySiwq`).
- Applies the lane rules in code (`decideLane`, `assertHybridLane`, `evaluateLayerState`). Errors carry a stable code shared by all languages (`QoreSignError`, for example `INVALID_MNEMONIC`, `LANE_NOT_AVAILABLE`, `KEY_NOT_REGISTERED`).

Network helpers (TypeScript `@qorechain/qoresign/network`; Go `github.com/qorechain/qoresign/go/network` has all of them except the two new ones):

- `fetchPqKeyStatus`: is an ML-DSA-87 key registered for an address, and which one.
- `resolveSignBytesVersion`: which sign-bytes form the network verifies.
- `simulateTx` (gas used, suggested gas limit, balance changes per address), `suggestGasLimit`, `broadcastTx` and `submitWithSignBytesFallback` (one retry with the other sign-bytes form when the network refuses the first).
- `assertPqLayerMatchesRegisteredKey`: checks a layer a dApp supplied against the key on chain before the wallet adds its classical signature.
- `verifySiwqWithChain` and `verifyMessageWithChain`: verification against the key registered on chain.
- `fetchCommittedExtensionTypeUrls`: reads back which extensions a committed transaction carried.
- New in 0.1.1, TypeScript only: `inspectTransaction` and `fetchEvmWindow`, described below.

## New in 0.1.1 {#new-in-0-1-1}

- **Python.** The package `qorechain-qoresign` (import `qoresign`) is on PyPI, with wheels for macOS and Linux. It binds the Rust implementation and reproduces the same test vectors. It is offline, like the Swift and Kotlin bindings: no network helpers.
- **Transaction inspector (library).** `inspectTransaction` reads a committed transaction and reports how it was protected. See [Transaction inspector](#inspector).
- **EVM window reader.** `fetchEvmWindow` reads an account's EVM authorization window.
- **Packaging fixes.** The Swift binary framework archive no longer contains a stray resource-fork folder, and the macOS native libraries in the Kotlin and Python packages no longer record the build directory as their install name.

## Transaction inspector {#inspector}

`inspectTransaction({ rest, chainId, txhash, rpc? })` is a read-only function in `@qorechain/qoresign/network`. It fetches a committed transaction and returns:

- the messages, memo, result code, height and fee;
- the signer: address, key type, public key and sequence;
- whether the classical signature verifies;
- the state of the ML-DSA-87 layer: present or not, how many layers, whether the layer verifies against the key the signer has registered now, and which sign-bytes form it used;
- a security tier, using the same classification as the public explorer: `pqc` (carries the ML-DSA-87 layer), `enrollment` (registers or rotates an ML-DSA-87 key, which is signed with the classical key by design), `shake` (a native-lane transaction without the layer) or `classical` (an EVM-lane transaction).

It returns `undefined` for a hash the network does not know. Pass an `rpc` endpoint to read the exact committed bytes from a node; without it the function uses bytes that the REST gateway re-encodes. It sends nothing and needs no account or key.

```js
import { fetchEvmWindow, fetchPqKeyStatus, inspectTransaction } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const address = "qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08"; // public testnet faucet account

const status = await fetchPqKeyStatus({ rest, address });
console.log("ML-DSA-87 key registered:", status.registered);

const tx = await inspectTransaction({ rest, chainId: "qorechain-diana", txhash: process.argv[2] });
console.log(tx?.tier, tx?.pqLayer, tx?.messages.map((m) => m.typeUrl));

const win = await fetchEvmWindow({ rest, address });
console.log("EVM window:", win.found, win.live);
```

Save it as `inspect.mjs` and run `node inspect.mjs <txhash>` with a testnet transaction hash. Run against a recent faucet transfer on the testnet it printed `ML-DSA-87 key registered: true`, tier `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, the message `/cosmos.bank.v1beta1.MsgSend`, and `EVM window: false false`.

`fetchEvmWindow({ rest, address })` returns `found`, `live`, the opened and expiry heights, the maximum and used transactions and value, the remaining blocks, transactions and value, `nativeOnly` and `allowedTargets`.

This is the library function. The dashboard [Developers](/dashboard/developers#inspector) page has a Transaction inspector tab that uses it: paste a transaction hash and read the result without writing code.

## What it is used for {#use-cases}

1. **A Keplr-compatible wallet adds QoreChain hybrid signing.** Leap, Cosmostation or a new wallet produces the secp256k1 signature through `signDirect`. With QoreSign it derives the account's ML-DSA-87 key from the same mnemonic and adds the layer (`signPqLayer`) before signing. See [the wallet guide](/qoresign/guides/keplr-compatible-wallets).
2. **An exchange or custodian signs withdrawals on its own servers.** A hot or warm wallet service in Go or Rust signs native-lane transfers with `signHybrid`, simulates them first (`simulateTx`, Go and TypeScript) to see the balance changes and the gas, and broadcasts with `submitWithSignBytesFallback`. The [custody kit](/developer-tools/custody-kit) builds on this.
3. **A backend implements Sign In With QoreChain.** The server issues a single-use nonce, the wallet signs a sign-in message, and the server calls `verifySiwqWithChain`. See [the sign-in guide](/qoresign/guides/sign-in).
4. **A compliance or support tool checks how a transaction was protected.** `inspectTransaction` reports whether a committed transaction carried a verified ML-DSA-87 layer, which sign-bytes form it used, and its tier.
5. **A wallet shows an EVM account's authorization window.** Before a user sends from an EVM wallet, `fetchEvmWindow` shows whether a window is live and how many transactions and how much value remain.
6. **A Python team signs reports or approvals.** `qoresign.sign_message` produces a hybrid signature over arbitrary bytes that any other QoreSign language can verify.
7. **A mobile wallet on iOS or Android.** The Swift package and the Android AAR give the same derivation, signing and sign-in as the TypeScript package, byte for byte.
8. **Auditors and integrators verify signatures offline.** `verifyHybridTx`, `verifyPqLayer` and `verifyMessage` run without a network, given the public keys.

## How it works {#how-it-works}

- **A hybrid transaction** is an ordinary Cosmos SDK `TxRaw` signed twice by the same account: an ML-DSA-87 signature carried in the transaction body as the extension option `/qorechain.pqc.v1.PQCHybridSignature` (algorithm id `1`), and a secp256k1 `SIGN_MODE_DIRECT` signature over the final body.
- **Sign-bytes v2** (verified by both public networks today) are `"qorechain-pqc-hybrid-v2"`, then the chain id, the body without the PQC extension and the auth info, each with a length prefix. The ML-DSA-87 signature therefore covers the fee. The classical signature covers the final body including the extension. v1 is kept for reproducing older signatures. See [Hybrid transaction signing v1](/qoresign/spec/hybrid-signing-v1).
- **Order:** encode the body and auth info, compute the sign-bytes and the ML-DSA-87 signature, append the extension, then sign the SignDoc with secp256k1 and broadcast.
- **Registration:** `MsgRegisterPQCKeyV2` carries the ML-DSA-87 public key, the account's compressed secp256k1 key and a proof of possession. The registration transaction is signed with the classical key alone.
- **Domain separation:** every ML-DSA-87 signature starts with a reserved prefix, so a message or sign-in signature can never be replayed as a transaction signature.
- **What is on chain:** the registered ML-DSA-87 public key, the hybrid transactions and the EVM windows. Keys, signing and verification happen on the device or server that runs QoreSign.
- **Shared test vectors:** the wire formats are versioned separately from the packages and covered by [test vectors](/qoresign/vectors) that every language reproduces byte for byte.

Sizes (FIPS 204 and the [sizes guide](/qoresign/guides/sizes-and-transport)): an ML-DSA-87 public key is 2,592 bytes, the secret key 4,896 bytes, a signature 4,627 bytes and the seed 32 bytes. A hybrid transaction is about 4.7 KB larger than a classical one, so simulate before you sign. A signature or public key does not fit in one static QR code; air-gapped signers need multi-part QR. Persist the 32-byte seed, not the secret key.

## Packages {#packages}

| Language | Package | Install | Minimum platform |
|---|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` | Node.js 20 or later; browsers |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) (library name `qoresign`) | `cargo add qorechain-qoresign` | stable Rust |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go@v0.1.1` | Go 1.25 |
| Python | [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) (import `qoresign`) | `pip install qorechain-qoresign` | Python 3.9+; wheels for macOS 11+ (arm64, x86_64) and Linux (x86_64, aarch64); no Windows wheel yet, other platforms build from the source distribution (needs Rust 1.95) |
| Swift | `QoreSign` from [`github.com/qorechain/qoresign`](https://github.com/qorechain/qoresign) (binary framework on the GitHub release) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, product `QoreSign` | iOS 16, macOS 13 |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.1")` | Java 17, Kotlin 2.3 or later; native libraries for macOS (arm64, x86-64), Linux (x86-64, arm64) and Windows (x86-64) |
| Android | [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | API 24, Kotlin 2.3 or later; `arm64-v8a`, `armeabi-v7a`, `x86_64`; R8 keep rules included |

:::note Kotlin compiler version
The Kotlin and Android artifacts need the **Kotlin 2.3 or later** compiler in your project. A project on Kotlin 2.1 fails to compile against them. Raise the Kotlin version of the build before you add the dependency.
:::

All implementations check themselves against the same [test vectors](/qoresign/vectors).

## Example {#example}

```ts
import {
  addressFromPublicKey,
  deriveCanonicalPqKey,
  deriveClassicalKey,
  signHybrid,
  verifyHybridTx,
} from "@qorechain/qoresign";

const classical = deriveClassicalKey({ mnemonic });                 // m/44'/118'/0'/0/0
const address = addressFromPublicKey(classical.publicKey, "secp256k1").bech32;
const pqKey = deriveCanonicalPqKey({ mnemonic, address });         // the key QoreChain wallets register

// bodyBytes / authInfoBytes / accountNumber come from the dApp's SignDoc
const signed = signHybrid({ chainId: "qorechain-vladi", accountNumber, bodyBytes, authInfoBytes, classicalKey: classical, pqKey });

verifyHybridTx({
  txBytes: signed.txBytes,
  chainId: "qorechain-vladi",
  accountNumber,
  classicalPublicKey: classical.publicKey,
  pqPublicKey: pqKey.publicKey,
}); // { valid: true, classical: true, pq: { valid: true, signBytesVersion: "v2" } }
```

The [Quickstart](/qoresign/quickstart) runs the same flow end to end, offline, and has the message-signing quickstarts for Python and Go.

## Main API {#main-api}

Names are given in TypeScript form. Go uses the same names in Go casing (`SignHybrid`, `VerifySiwq`); Rust and Python use snake_case (`sign_hybrid`); Swift and Kotlin use camelCase over the Rust core.

| Name | What it does | Where |
|---|---|---|
| `deriveClassicalKey`, `deriveCanonicalPqKey`, `pqKeyFromSeed`, `classicalKeyFromPrivate` | keys from a mnemonic, a seed or raw bytes | all |
| `deriveHdPqKey` | hardened HD derivation of ML-DSA-87 keys (draft, may change) | all |
| `addressFromPublicKey`, `addressFromBytes`, `parseAddress` | `qor1` addresses | all |
| `signHybrid`, `signPqLayer`, `hybridSignBytes` | hybrid signing and sign-bytes v1 or v2 | all |
| `verifyHybridTx`, `verifyPqLayer` | local verification | all |
| `buildRegisterPqKeyMessage`, `signProofOfPossession`, `verifyProofOfPossession` | key registration with proof of possession | all |
| `signMessage`, `verifyMessage` | arbitrary message signing (ADR-36 plus ML-DSA-87) | all |
| `createSiwqMessage`, `parseSiwqMessage`, `signSiwq`, `verifySiwq` | Sign In With QoreChain v1 | all |
| `decideLane`, `assertHybridLane`, `evaluateLayerState` | lane rules; detection of a dropped layer | all |
| `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx`, `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback`, `assertPqLayerMatchesRegisteredKey`, `verifySiwqWithChain`, `verifyMessageWithChain`, `fetchCommittedExtensionTypeUrls` | network helpers | TypeScript, Go |
| `inspectTransaction`, `fetchEvmWindow` | read a committed transaction; read an EVM window (0.1.1) | TypeScript |

In Go the network helpers are methods on a client: `client := network.NewClient("https://api-testnet.qore.host")`, then `client.VerifySiwqWithChain(ctx, address, qoresign.VerifySiwqOptions{...})` or `client.SimulateTx(...)`. Python errors are `QoreSignError` with `code` and `detail`; byte fields are `bytes`.

API reference: in a clone of the repository, run `pnpm -C packages/ts docs` (TypeScript), `cargo doc -p qorechain-qoresign` (Rust) or `go doc github.com/qorechain/qoresign/go` (Go). The Swift, Kotlin and Python bindings mirror the Rust API; see the [Swift](https://github.com/qorechain/qoresign/tree/main/swift), [Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin) and [Python](https://github.com/qorechain/qoresign/tree/main/python) READMEs.

## Networks and requirements {#networks}

| | Mainnet | Testnet |
|---|---|---|
| Chain id | `qorechain-vladi` (EVM chain id 9801) | `qorechain-diana` (EVM chain id 9800) |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Sign-bytes verified | v2 | v2 |

- **Native lane:** the network requires the ML-DSA-87 signature by default. Exempt: the registration of an account's ML-DSA-87 key, and an unjail by an account without a key. The account must have its key registered (`MsgRegisterPQCKeyV2`) before hybrid transactions verify; QoreChain wallets register it when the account is created.
- **EVM lane:** an account with a registered ML-DSA-87 key opens a bounded authorization window (expiry height, maximum transactions, maximum value, optional allowed contracts) with a hybrid-signed native-lane transaction. Outside a live window the network refuses the account's EVM transactions. Reads and gas estimation need no window.
- **Fees:** denom `uqor` (6 decimals), minimum gas price 0.1 uqor per gas.
- **Keplr registration values:** bech32 prefix `qor`, coin type `118`.
- **Accounts:** none for the offline functions. The network helpers need only a REST endpoint; broadcasting needs a funded account with a registered ML-DSA-87 key.

## Documentation {#documentation}

- [Quickstart](/qoresign/quickstart): derive keys, sign and verify a hybrid transaction in a few minutes.
- Guides
  - [Add hybrid signing to a Keplr-compatible wallet](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: server verification](/qoresign/guides/sign-in)
  - [EVM wallets: authorization window](/qoresign/guides/evm-quantum-ready)
  - [Key derivation: canonical keys and the HD draft](/qoresign/guides/key-derivation)
  - [Sizes and transport](/qoresign/guides/sizes-and-transport)
- Specifications
  - [Hybrid transaction signing v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [Message signing v1](/qoresign/spec/message-signing-v1)
  - [ML-DSA-87 key derivation](/qoresign/spec/hd-derivation-draft)
- [Test vectors](/qoresign/vectors)
- [Examples](https://github.com/qorechain/qoresign/tree/main/examples)

## Scope and limits {#scope}

- QoreSign signs locally. It does not hold keys for you, does not do threshold or MPC signing, and does not sign on hardware wallets.
- There is no hybrid EVM signature: `assertHybridLane("evm")` throws `LANE_NOT_AVAILABLE`. EVM accounts use the authorization window instead. SVM transactions are not open.
- Rust, Swift, Kotlin and Python have no network code. Fetching account numbers, simulating and broadcasting stay in your app, or use the TypeScript or Go helpers.
- `inspectTransaction` and `fetchEvmWindow` exist in TypeScript only. `inspectTransaction` checks the layer against the key the signer has registered now, so after a key rotation an older transaction reports `verified: false`.
- The canonical derivation needs the mnemonic. Wallets without it (hardware-held keys) generate a random key (`pqKeyFromSeed`) or use the HD draft, and register that key. The mnemonic must be in canonical form (lowercase, single spaces); other spellings are refused, not normalised.
- The HD derivation (`deriveHdPqKey`) is a draft and may change.
- Python has no Windows wheel yet. Kotlin and Android need the Kotlin 2.3 or later compiler.
- The ML-DSA-87 and secp256k1 implementations come from `qorechain-pqc` (built on `@noble/post-quantum`, `fips204` and Cloudflare CIRCL) and from `@noble/curves`, `k256` and `decred/secp256k1`.

## Security notes {#security}

- Keys never leave the process that runs QoreSign. Nothing is sent anywhere unless you call a network helper, and those send public data only: addresses, signed transaction bytes and hashes.
- Show the user the messages and the fee from `bodyBytes` and `authInfoBytes` before signing; the ML-DSA-87 signature covers the fee.
- When a dApp supplies a body that already carries a PQC layer, check it with `assertPqLayerMatchesRegisteredKey` before you add the classical signature. After broadcast, `evaluateLayerState` with `fetchCommittedExtensionTypeUrls`, or `inspectTransaction`, confirms the layer reached the chain.
- Never sign raw bytes with the ML-DSA-87 key outside the reserved domains.
- Sign-in nonces are single use. `verifySiwq` refuses a sign-in without the ML-DSA-87 part unless `requirePq: false` is passed; accept classical-only sign-ins only when your service does not need the post-quantum guarantee.
- Store the 32-byte ML-DSA-87 seed, encrypted, rather than the secret key.
- Never put a mainnet mnemonic in a script or shell history. The examples use the public BIP-39 test phrase (`abandon` eleven times, then `about`); never fund it.
- Report vulnerabilities privately to security@qore.network, not in public issues. Security fixes go into the latest minor version.

## Where it is published {#where-published}

Versions checked on the registries on 27 October 2026.

| Registry | Package | Version | Link |
|---|---|---|---|
| npm | `@qorechain/qoresign` | 0.1.1 | [npmjs.com](https://www.npmjs.com/package/@qorechain/qoresign) |
| crates.io | `qorechain-qoresign` | 0.1.1 | [crates.io](https://crates.io/crates/qorechain-qoresign) |
| Go module proxy | `github.com/qorechain/qoresign/go` | v0.1.1 (tag `go/v0.1.1`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoresign/go) |
| Maven Central | `io.github.qorechain:qoresign` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) |
| Maven Central | `io.github.qorechain:qoresign-android` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) |
| PyPI | `qorechain-qoresign` | 0.1.1 (macOS arm64 and x86_64, Linux x86_64 and aarch64 wheels, source distribution) | [pypi.org](https://pypi.org/project/qorechain-qoresign/) |
| Swift Package Manager | `QoreSign` from `github.com/qorechain/qoresign` | 0.1.1 (binary `QoreSignFFI.xcframework.zip` on the release) | [GitHub release](https://github.com/qorechain/qoresign/releases/tag/v0.1.1) |

Repository: [github.com/qorechain/qoresign](https://github.com/qorechain/qoresign) (releases v0.1.0 and v0.1.1).

## Related pages {#related}

- [Post-quantum primitives (`qorechain-pqc`)](/developer-tools/pqc-library): the ML-DSA-87 primitives under QoreSign.
- [QoreChain SDK](/sdk/overview): transaction composers, EVM window messages and feature detection.
- [Wallet adapter](/developer-tools/wallet-adapter): the dApp-side alternative when a wallet cannot be changed. The dApp holds the ML-DSA-87 key and asks the unchanged wallet for `signDirect`; the bytes are the same as QoreSign's.
- [QoreSeal](/developer-tools/qoreseal): encryption to accounts; its recipient cards are QoreSign message signatures.
- [Custody kit](/developer-tools/custody-kit): deposit detection and withdrawal verification built on QoreSign.
- [QoreChain MCP server](/developer-tools/mcp): its `get_pq_status` tool uses QoreSign to verify the hybrid layer.
- [Post-Quantum Signing](/developer-guide/post-quantum-signing) and [Exchange integration](/developer-guide/exchange-integration).
- [Developer packages overview](/developer-tools/overview).

## Versioning {#versioning}

QoreSign is pre-1.0: minor versions may change the API, and every breaking change is listed in the [changelog](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md). The wire formats are versioned separately (the `v1` specifications and `vectors/qoresign-v1.json`) and do not change within a version.

## Contributing and security {#contributing}

See [CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md). Report vulnerabilities privately to security@qore.network, as described in [SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md).

## License {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Copyright 2026 QoreChain Association.
