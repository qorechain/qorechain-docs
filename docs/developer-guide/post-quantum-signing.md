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
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Availability
The JavaScript, Rust, Python, Go, and Java bindings are all **published** at version **0.1.1** — install them straight from npm, crates.io, PyPI, the Go module proxy, and Maven Central with the commands above. The Python distribution installs as `qorechain-pqc` but **imports as `qorpqc`**. The **Java** package is on Maven Central as `io.github.qorechain:qorechain-pqc:0.1.1` (Bouncy Castle backend). The **C** binding is a static library + header you build from [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## Deterministic signing (consensus-critical) {#deterministic-signing}

As of version **0.1.1**, `sign()` produces the **deterministic** ML-DSA variant (FIPS-204 §3.4, where the signing randomness is 32 zero bytes) in **all six bindings** — and this is the only variant the chain accepts. QoreChain's transaction verifier **rejects hedged (randomized) ML-DSA signatures**, so a hedged signature fails on-chain even though it verifies cryptographically.

Key facts:

* **Do not change the default.** Deterministic signing is consensus-critical; every binding documents it as such.
* The deterministic output is **byte-identical across all six bindings** for the same key and message — locked in by shared cross-language test vectors.
* Hedged signing remains available as an **explicit opt-in** per binding (e.g. `{hedged: true}` in JavaScript, `sign_hedged` in Rust, `mldsaSignHedged` in Java, `sign(..., hedged=True)` in Python) for non-chain use cases — hedged signatures are **not accepted by the chain**.
* Version 0.1.0 of the JavaScript binding signed hedged by default — if you built transaction tooling against 0.1.0, **upgrade to 0.1.1**; transactions signed with the old default are rejected on-chain.

## Deterministic key derivation & recovery {#key-derivation}

The ecosystem-standard derivation binds the ML-DSA-87 key to the account, so it is **recoverable from the account's mnemonic alone**:

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

Every published tool (`@qorechain/wallet-adapter`, `@qorechain/sdk`, `@qorechain/chain-bridge` ≥0.1.1) derives this same key, so one mnemonic produces one key regardless of tooling. Recover a key on the CLI (mnemonic on stdin):

```bash
qorechaind tx pqc recover-key mykey qor1youraddress...
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge
```

## Key rotation (same algorithm) {#key-rotation}

As of chain version **v3.1.85**, **`MsgRotatePQCKey`** rotates an account's ML-DSA-87 key **within the same algorithm** — previously registration was one-shot and `MigratePQCKey` only crossed algorithms. Use it to migrate a legacy-derived key to the canonical address-bound derivation, or to retire a compromised key.

The rotation is **dual-signed**: both the old and the new key sign the domain-separated message `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"`. Replay is structurally impossible — once rotated, the old key no longer matches the registered key, so the same message cannot re-apply. Rotation is a **root-key-only** operation (never delegable to an [authenticator](/developer-guide/account-abstraction#authenticators)), and the transaction itself is still hybrid-signed with the *old* key, proving current ownership.

One-shot CLI (mnemonic on stdin; recovers the old key, derives or generates the new one, dual-signs, broadcasts):

```bash
# migrate a legacy-derived key to the canonical derivation:
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi -o json -y

# rotate to a brand-new random key (compromise recovery):
qorechaind tx pqc rotate-key --old-derivation adapter --new-random \
  --from mykey --chain-id qorechain-vladi -o json -y
```

In code, `@qorechain/wallet-adapter` (≥0.1.7) and `@qorechain/sdk` (≥0.7.0) expose the same flow:

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const msg = await rotatePqcKeyMsgFromMnemonic({
  mnemonic, address: "qor1youraddress...", chainId: "qorechain-vladi",
});
// Sign & broadcast with the account's normal hybrid signer (old key cosigns the envelope).
```

After a successful rotation the new key signs (code 0) and the old key is rejected (`pqc` code 21).

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
