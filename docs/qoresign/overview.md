---
slug: /qoresign/overview
title: QoreSign Overview
sidebar_label: Overview
sidebar_position: 1
---

# QoreSign

QoreSign is hybrid secp256k1 + ML-DSA-87 (FIPS 204) signing for wallets and
backends on QoreChain.

QoreSign lets a wallet other than QoreChain's own derive an account's ML-DSA-87
key, sign native-lane transactions with both keys, verify hybrid signatures
locally, simulate a transaction before signing, and implement Sign In With
QoreChain. It is a thin layer over the
[`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) bindings and adds
no cryptographic primitives of its own.

The current release is **0.1.0**. The source, examples and test vectors are in
the [qorechain/qoresign](https://github.com/qorechain/qoresign) repository.

## What QoreSign does on each lane {#lanes}

| Lane | What QoreSign does today |
|---|---|
| **Native** (Cosmos SDK) | Hybrid signing and verification. The network requires the ML-DSA-87 signature by default. |
| **EVM** | Quantum-ready mode only: the account registers an ML-DSA-87 key and opens a bounded authorization window from the native lane. Ethereum transactions themselves carry no ML-DSA-87 signature. |
| **SVM** | Not open on the network yet (`LANE_NOT_AVAILABLE`). |

Hybrid EVM signing needs per-lane PQC support in the network first. See
[EVM wallets: quantum-ready mode](/qoresign/guides/evm-quantum-ready).

## Packages {#packages}

| Language | Package | Install |
|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | `cargo add qorechain-qoresign` |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go` |
| Swift | [`QoreSign`](https://github.com/qorechain/qoresign) (Swift Package, iOS 16+, macOS 13+) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.0")` |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.0")` |

All five implementations check themselves against the same
[test vectors](/qoresign/vectors).

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

Network helpers (key status, simulation with balance changes, broadcast,
sign-in verification against the chain) are in `@qorechain/qoresign/network`.

## Documentation {#documentation}

- [Quickstart](/qoresign/quickstart): derive keys, sign and verify a hybrid
  transaction in a few minutes.
- Guides
  - [Add hybrid signing to a Keplr-compatible wallet](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: server verification](/qoresign/guides/sign-in)
  - [EVM wallets: quantum-ready mode](/qoresign/guides/evm-quantum-ready)
  - [Key derivation: canonical keys and the HD draft](/qoresign/guides/key-derivation)
  - [Sizes and transport](/qoresign/guides/sizes-and-transport)
- Specifications
  - [Hybrid transaction signing v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [Message signing v1](/qoresign/spec/message-signing-v1)
  - [ML-DSA-87 key derivation](/qoresign/spec/hd-derivation-draft)
- [Test vectors](/qoresign/vectors)
- [Examples](https://github.com/qorechain/qoresign/tree/main/examples)

API reference: in a clone of the repository, run `pnpm -C packages/ts docs`
(TypeScript), `cargo doc -p qorechain-qoresign` (Rust) or
`go doc github.com/qorechain/qoresign/go` (Go). The Swift and Kotlin bindings
mirror the Rust API; see the
[Swift](https://github.com/qorechain/qoresign/tree/main/swift) and
[Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin) READMEs.

## Scope {#scope}

QoreSign signs locally. It does not hold keys for you, does not do threshold or
MPC signing, and does not sign on hardware wallets. The ML-DSA-87 and secp256k1
implementations come from `qorechain-pqc` (built on `@noble/post-quantum`,
`fips204` and Cloudflare CIRCL) and from `@noble/curves`, `k256` and
`decred/secp256k1`.

## Versioning {#versioning}

QoreSign is pre-1.0: minor versions may change the API, and every breaking
change is listed in the
[changelog](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md). The
wire formats are versioned separately (the `v1` specifications and
`vectors/qoresign-v1.json`) and do not change within a version.

## Contributing and security {#contributing}

See
[CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md).
Report vulnerabilities privately as described in
[SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md).

## License {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Copyright
2026 QoreChain Association.
