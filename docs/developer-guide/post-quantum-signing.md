---
slug: /developer-guide/post-quantum-signing
title: Post-Quantum Signing
sidebar_label: Post-Quantum Signing
sidebar_position: 8
---

# Post-Quantum Signing

`qorechain-pqc` is the open-source, **standards-only** post-quantum cryptography library behind QoreChain. It gives wallets, integrators, and tooling the exact primitives the chain uses — in six languages, with one consistent API, **proven byte-compatible** against a shared cross-language test-vector suite.

The library wraps audited implementations of the **final NIST standards**. It does **not** invent a custom scheme: a non-standard variant is exactly what breaks interoperability (a signature produced in one place would not verify in another). Every binding is validated against the same vectors, so an ML-DSA signature produced in one language verifies in every other, ML-KEM shared secrets match across all six, and SHAKE-256 digests are identical.

* **Repository:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **License:** Apache-2.0

## Primitives

| Primitive | Standard | Role | Levels (default in **bold**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | digital signatures | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | key encapsulation | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | extendable-output hash | — |

These are the same primitives QoreChain runs at the protocol level: **ML-DSA-87 (Dilithium-5)** signatures, **ML-KEM-1024** key encapsulation, and **SHAKE-256** as the default application hash. See [Post-Quantum Security](/architecture/post-quantum-security) for how the chain uses them.

### Sizes (bytes)

Pick the security level by your size/security budget.

| Scheme | Security | Public key | Signature / Ciphertext |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> You cannot make a NIST standard smaller and still be standard. ML-DSA-87 has fixed key/signature sizes and fixed bytes — "optimizing" it produces a non-standard variant no other implementation can verify. To shrink the on-chain footprint, use the levers below rather than altering the scheme.

## Languages and packages

Every language exposes the same API, each backed by a different audited implementation. This is what guarantees byte-compatibility — independent backends agree on the standard.

| Language | Package | Install | Backed by |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (static lib + header) | build from the [repo](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.0` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Availability
The JavaScript, Rust, Python, Go, and Java bindings are all **published** at version **0.1.0** — install them straight from npm, crates.io, PyPI, the Go module proxy, and Maven Central with the commands above. The Python distribution installs as `qorechain-pqc` but **imports as `qorpqc`**. The **Java** package is on Maven Central as `io.github.qorechain:qorechain-pqc:0.1.0` (Bouncy Castle backend). The **C** binding is a static library + header you build from [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## Consistent API

Every language provides the same surface:

```text
keygen()                              -> (publicKey, secretKey)
sign(secretKey, message)              -> signature
verify(publicKey, message, signature) -> bool

kem.keygen()                          -> (publicKey, secretKey)
kem.encapsulate(publicKey)            -> (cipherText, sharedSecret)
kem.decapsulate(secretKey, cipherText)-> sharedSecret

shake256(data, outLen=32)             -> digest
```

### Quick start (JavaScript / TypeScript)

```js
import { mldsa, mlkem, shake256, pubkeyHash } from '@qorechain/pqc';

// ML-DSA-87 signatures
const { publicKey, secretKey } = mldsa.keygen();
const sig = mldsa.sign(secretKey, message);
mldsa.verify(publicKey, message, sig); // true

// ML-KEM-1024 key encapsulation
const { publicKey: ek, secretKey: dk } = mlkem.keygen();
const { cipherText, sharedSecret } = mlkem.encapsulate(ek);
mlkem.decapsulate(dk, cipherText); // === sharedSecret

// SHAKE-256 + blockchain helpers
shake256(data, 32);        // 32-byte digest
pubkeyHash(publicKey, 20); // pay-to-pubkey-hash
```

Level-specific exports are available where the default isn't what you want: `mldsa44/65/87` and `mlkem512/768/1024` (`mldsa` / `mlkem` are the L5 defaults).

The **Rust, Go, C, Python, and Java** bindings mirror this exactly. For example:

```rust
// Rust
use qorechain_pqc::mldsa::default as mldsa;
let (pk, sk) = mldsa::keygen()?;
let sig = mldsa::sign(&sk, msg)?;
assert!(mldsa::verify(&pk, msg, &sig));
```

```go
// Go
pk, sk, _ := pqc.MLDSA.Keygen()
sig, _ := pqc.MLDSA.Sign(sk, msg)
pqc.MLDSA.Verify(pk, msg, sig) // true
```

## Blockchain helpers

Beyond the raw primitives, the library exposes two helpers that integrators need to interact with QoreChain accounts and transactions.

### `pubkeyHash(pk, len=20)`

A **pay-to-pubkey-hash** registration helper. It produces a short (20–32 byte) SHAKE-256 hash of a public key. The pattern: store only the `pubkeyHash` in account state and require the full public key in the transaction. Account state stays tiny regardless of the 1–2.5 KB key.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

QoreChain's wallet-compatible **hybrid-extension sign-bytes framing**. This produces exactly the bytes that must be signed with ML-DSA-87 (Dilithium-5) to form the PQC half of a hybrid transaction.

This is the piece wallets and integrators use to produce the **required hybrid signature** on the cosmos transaction path. As of the current chain version, hybrid signatures are **required by default** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): every cosmos-path transaction must carry a Dilithium-5 signature alongside its classical secp256k1 signature. See [Post-Quantum Security](/architecture/post-quantum-security) for the enforcement model.

The classical secp256k1 signature is computed over the standard sign bytes (which **exclude** the PQC extension), and the ML-DSA-87 signature is computed and attached as the `PQCHybridSignature` extension. Because the classical sign bytes exclude the extension, the classical signature stays valid whether or not a verifier understands the PQC part.

There are three ways to produce this hybrid signature:

* **The CLI** — `qorechaind tx pqc cosign` attaches the Dilithium-5 cosignature to a transaction (after `qorechaind tx pqc gen-key`). See [Transaction Commands](/cli-reference/transaction-commands).
* **The QoreChain SDK** — `buildHybridTx` (with `includePqcPublicKey`) does the equivalent in TypeScript/Python/Go/Rust. See [SDK Accounts & PQC signing](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` directly** — use `hybridSignBytes` to frame the sign bytes and `mldsa.sign` to produce the Dilithium-5 signature, when you are building tooling outside the SDK in one of the six supported languages.

## Optimizing on-chain footprint

ML-DSA keys and signatures are large by classical standards. Because the bytes of a standard are fixed, the way to keep the on-chain footprint small is to use these three levers — none of which alters the standard:

1. **Pick the security level deliberately.** ML-DSA-65 (L3) signatures are ~28% smaller than ML-DSA-87 (L5) and remain very strong; ML-KEM-768 ciphertexts are smaller than 1024. Choose per use-case.
2. **Pay-to-pubkey-hash.** Store only `pubkeyHash(pk)` (20–32 bytes of SHAKE-256) in account state and require the full public key in the transaction. Account state stays tiny regardless of key size.
3. **Verify-and-discard signatures.** A signature must live in the transaction (block data) but should never be written into the persistent state tree.

> **Why no Falcon?** FN-DSA (Falcon) would give smaller signatures, but it is intentionally **excluded**: FN-DSA is FIPS-206 *draft* (not final), and a standards-only library only ships finalized standards. It can be revisited once FIPS-206 is finalized.

## Related

* [Post-Quantum Security](/architecture/post-quantum-security) — how the chain uses these primitives and enforces hybrid signatures.
* [Transaction Commands](/cli-reference/transaction-commands) — the `tx pqc gen-key` / `tx pqc cosign` CLI flow.
* [SDK Accounts & PQC signing](/sdk/concepts/accounts-pqc) — keys and hybrid signing from the QoreChain SDK.
* [Wallet Setup](/getting-started/wallet-setup) — create and manage PQC-backed accounts.
