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
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.2.2` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Availability
The JavaScript, Rust, Python, Go and Java bindings are all **published** at version **0.2.2** (npm, crates.io, PyPI, the Go module proxy as `v0.2.2`, and Maven Central; checked 21 October 2026). Install them with the commands above. The Python distribution installs as `qorechain-pqc` but **imports as `qorpqc`**. The **Java** package is `io.github.qorechain:qorechain-pqc:0.2.2` (Bouncy Castle backend). Version **0.2.0** added the version-aware `hybridSignBytes` (below), **0.2.1** corrected which upgrade name marks the switch to v2 for mainnet, and **0.2.2** corrected documentation and comments about hedged versus deterministic signing (the chain accepts both; in the JavaScript binding nothing but the version constant changed in the code), so use 0.2.1 or later. The **C** binding is a static library + header you build from [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## Deterministic signing (default) {#deterministic-signing}

As of version **0.1.1** (and in every later release), `sign()` produces the **deterministic** ML-DSA variant (FIPS-204 §3.4, where the signing randomness is 32 zero bytes) in **all six bindings**. The chain accepts any valid FIPS-204 ML-DSA-87 signature, hedged or deterministic: verification is identical for both, and a verifier cannot tell them apart without the secret key. The bindings sign deterministically by default so the same transaction always produces the same signature and tx hash, and so every binding matches the shared vectors.

Key facts:

* The deterministic output is **byte-identical across all six bindings** for the same key and message, locked in by shared cross-language test vectors.
* Hedged signing remains available as an **explicit opt-in** per binding (e.g. `{hedged: true}` in JavaScript, `sign_hedged` in Rust, `mldsaSignHedged` in Java, `sign(..., hedged=True)` in Python). Hedged signatures are **accepted by the chain** like any valid FIPS-204 signature; the only difference is that the signature, and so the tx hash, changes every time you sign.
* Version 0.1.0 of the JavaScript binding signed hedged by default. Those signatures are valid on-chain too; upgrade to 0.1.1 if you want reproducible signatures that match the shared vectors.

## Registering your key {#pqc-key-registration}

Every account registers its ML-DSA-87 public key **once, explicitly**. There is no automatic registration: a public key embedded in a later hybrid transaction (for example the SDK's `includePqcPublicKey` option) is carried in the extension but does **not** register it. A **first** registration is the one Cosmos-lane transaction that may be signed classically, so a brand-new account can bootstrap its first key; an account that already has a key must hybrid-sign every later key message. Do it with the release `qorechaind` (a binary built from the public source cannot sign; see [Building from Source](/developer-guide/building-from-source)), with QoreX, or with the SDK's `ensurePqcRegistered`:

```bash
# 1. Create a key. It is stored unencrypted under ~/.qorechaind/pqc/mypqc.dilithium (mode 0600) and the public key hex is printed.
qorechaind tx pqc gen-key mypqc

# 2. Register the public key on your account (classical-signed, because the account has no key yet).
#    --pqc-key mypqc also attaches the optional proof of possession (see below).
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mypqc \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -y

# 3. Verify.
qorechaind query pqc account <address>
```

Set `--gas` explicitly: the 2,592-byte public key can exceed the default 200,000 gas (mainnet registrations have used roughly 220,000 to 310,000; a registration with a proof of possession carries one more 4,627-byte signature, about 46,000 gas more), and the fee must be at least gas × 0.1 uqor, so `--gas 600000` needs `--fees 60000uqor` or more. The legacy form `qorechaind tx pqc register-key <pubkey-hex> hybrid` is equivalent for Dilithium-5. From then on, build each Cosmos-lane transaction with `--generate-only` and sign it with `qorechaind tx pqc cosign`. The key file is the account's post-quantum signing key: anyone who can read it can co-sign for the account together with the classical key, so back it up like the mnemonic (it can be re-derived from the mnemonic, see below).

A registered key is also the first of two requirements for sending EVM transactions; the second is an open [EVM authorisation window](/developer-guide/evm-development#evm-window).

### What the chain checks at registration (mainnet v3.2.3 and later) {#key-integrity}

Since the v3.2.3 upgrade (applied on mainnet at height 3,662,051 on 20 October 2026) the chain checks the key itself, not only that it has the right length:

| Rule | Refusal (codespace `pqc`) |
| --- | --- |
| `key_type` must be `hybrid` or `pqc_only`; `classical_only` registers no post-quantum key and would leave the account unable to sign again | code 230 |
| A key that gives no post-quantum protection (a degenerate key that nobody needs a secret for) is refused, on registration, rotation and migration alike | code 230 |
| A key the account has used before cannot be registered again or rotated back to (the account remembers retired keys) | code 232 |
| The classical key in the registration must be the signer's own compressed secp256k1 key (since v3.2.2) | code 45 |
| An optional proof of possession, if present, must verify | code 231 |
| An account that already holds a key must hybrid-sign any further key message (register, migrate); only the repair of a record that holds no usable key may be classical | code 234 |
| Deprecating or disabling an algorithm cannot leave the chain without an active signature algorithm | code 233 |

Further, since v3.2.3, none of the key messages (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgRotatePQCKey`, `MsgMigratePQCKey`) can be sent on an account's behalf through `authz`; a transaction can carry at most **one** hybrid signature extension; and an account that has **no** registered key can no longer attach a hybrid extension that has nothing to verify against (only a registration may pass, exactly as with no extension at all).

### Proof of possession (optional) {#proof-of-possession}

A registration may also prove that the registrant holds the new key's secret. The key signs `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>` (the algorithm id is `1` for ML-DSA-87; the public key is lower-case hex) and the signature goes in the `proof_of_possession` field of `MsgRegisterPQCKeyV2`. With the CLI, `register-key-v2 ... --pqc-key <name>` builds and attaches it. With the TypeScript SDK 0.9.0, `ensurePqcRegistered` attaches the proof by itself once the network has applied v3.2.3 (and `signProofOfPossession` / `verifyProofOfPossession` build and check one by hand); `@qorechain/chain-bridge` 0.2.3 does the same when given `cosmosRest`. `@qorechain/wallet-adapter` (0.4.0) and SDK releases before 0.9.0 do not attach one, so a registration made through them carries none, which the chain still accepts. The chain verifies the proof **when it is present** and refuses the registration if it does not verify (code 231); a registration without a proof is still accepted on mainnet. Because the message names the chain, the algorithm, the account and the key, a proof made for one of them proves nothing for another.

On the testnet (v3.2.4, **testnet only**) the account record reports whether a proof was verified (`possession_proven`, in `GET /qorechain/pqc/v1/account/{address}`), and bridge-validator registration requires a proof. Neither is on mainnet yet; mainnet governance proposal 13 would apply v3.2.4 at height 3,742,566.

## Refusal codes (codespace `pqc`) {#pqc-codes}

| Code | Meaning |
| --- | --- |
| 20 | Hybrid signature required: the transaction carries no PQC extension (only a first registration, and an unjail by a key-less account, are exempt) |
| 21 | The ML-DSA-87 half did not verify, see [below](#code-21) |
| 26, 27, 28 | EVM lane: no open window or no key / window exhausted / invalid window bounds, see [EVM Development](/developer-guide/evm-development#evm-window) |
| 45 | The classical key in a registration is not the signer's own compressed secp256k1 key |
| 60, 61 | EIP-7702 delegation: no post-quantum consent for this delegation / invalid delegation request |
| 62, 63 | A delegated account has no window covering the action / an Ethereum transaction executes only on the EVM lane |
| 230 | Weak key or `classical_only` registration |
| 231 | Proof of possession does not verify |
| 232 | Key was used by this account before |
| 233 | No active signature algorithm would remain |
| 234 | Key maintenance from a keyed account needs the hybrid signature |

## Troubleshooting `pqc` code 21 (`hybrid_verify_failed`) {#code-21}

Code 21 means the ML-DSA-87 half of a hybrid signature did not verify against the account's registered key. It is **never** caused by choosing hedged over deterministic signing. Check, in this order:

1. **Sign-bytes version.** The PQC signature covers either the v1 or the v2 sign-bytes, and a network verifies exactly one form at any height: `qorechain-diana` switched to v2 at its `v3.1.98` upgrade, `qorechain-vladi` at its `v3.2.0` upgrade, and chains born later are v2 from genesis. Current SDKs pick the form per network; hand-built signers must ask the node which upgrade is applied (see [Accounts & PQC signing](/sdk/concepts/accounts-pqc)).
2. **Chain-id in v2 sign-bytes.** v2 binds the chain-id, so a signature built for `qorechain-diana` does not verify on `qorechain-vladi` and vice versa.
3. **Stale PQC library.** Pre-standards (pre-FIPS-204) builds produce signatures a standards verifier rejects. Use `qorechain-pqc` 0.1.1 or later.
4. **Wrong key.** The public key must be the one registered for the account (`GET /qorechain/pqc/v1/account/{address}`). A key derived with a different derivation (for example the legacy `shake256(mnemonic)` bridge derivation instead of the address-bound one) signs validly but does not match. See [Key rotation](#key-rotation) to move to the canonical key.

## Deterministic key derivation & recovery {#key-derivation}

The ecosystem-standard derivation binds the ML-DSA-87 key to the account, so it is **recoverable from the account's mnemonic alone**:

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

Every published tool (`@qorechain/wallet-adapter`, `@qorechain/sdk`, `@qorechain/chain-bridge` ≥0.1.1) derives this same key, so one mnemonic produces one key regardless of tooling. Recover a key on the CLI (mnemonic on stdin):

```bash
# the mnemonic is read from stdin; keep it out of shell history by redirecting from a file you delete afterwards
qorechaind tx pqc recover-key mykey qor1youraddress... < mnemonic.txt
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge < mnemonic.txt
```

The recovered private key is written as unencrypted hex (mode 0600) to `<home>/pqc/mykey.dilithium` for use with `tx pqc cosign`.

## Key rotation (same algorithm) {#key-rotation}

As of chain version **v3.1.85**, **`MsgRotatePQCKey`** rotates an account's ML-DSA-87 key **within the same algorithm** — previously registration was one-shot and `MigratePQCKey` only crossed algorithms. Use it to migrate a legacy-derived key to the canonical address-bound derivation, or to retire a compromised key.

The rotation is **dual-signed**: both the old and the new key sign the domain-separated message `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"`. Replay is structurally impossible — once rotated, the old key no longer matches the registered key, so the same message cannot re-apply. Rotation is a **root-key-only** operation (never delegable to an [authenticator](/developer-guide/account-abstraction#authenticators)), and the transaction itself is still hybrid-signed with the *old* key, proving current ownership.

One-shot CLI (mnemonic on stdin; recovers the old key, derives or generates the new one, dual-signs, broadcasts):

```bash
# migrate a legacy-derived key to the canonical derivation (mnemonic on stdin):
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt

# rotate to a brand-new random key (compromise recovery); --new-key-out is required and is written before anything is sent:
qorechaind tx pqc rotate-key --old-derivation adapter --new-random --new-key-out mykey-new \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt
```

The rotation carries two 2,592-byte keys and three signatures, so it needs far more gas than a transfer; keep the explicit `--gas 600000` and a fee of at least 60,000 uqor. `--new-random` without `--new-key-out` is refused (node release v3.2.1 and later) so that a rotation can never leave you without the new key.

In code, `@qorechain/wallet-adapter` (≥0.1.7) and `@qorechain/sdk` (≥0.7.0) expose the same flow (synchronous; it returns the message plus both keypairs):

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account: "qor1youraddress...", mnemonic, chainId: "qorechain-vladi",
});
// Sign & broadcast `msg` with the account's normal hybrid signer, using `oldKeypair` for the envelope's PQC signature.
```

The rotation helpers of SDK 0.9.0 and `@qorechain/wallet-adapter` 0.4.0 refuse the legacy derivation as the **new** key (it is not bound to the account); a legacy key can still be the old key. After a successful rotation the new key signs (code 0) and the old key is rejected (`pqc` code 21). Since v3.2.3 a rotation (like a migration) refuses a new key that gives no post-quantum protection (code 230) and a key the account has used before (code 232), and it cannot be sent through `authz`.

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

### `hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfo)`

QoreChain's wallet-compatible **hybrid-extension sign-bytes framing**. It produces exactly the bytes that must be signed with ML-DSA-87 (Dilithium-5) to form the PQC half of a hybrid transaction. Two forms exist and a network verifies exactly one at any height: **v1** = `BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` and **v2** = `"qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` (`B0` is the transaction body without the PQC extension, `A` the auth info). Both public networks are on **v2**. The library is pure, so the caller picks the form: ask the node `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` for **both** `v3.2.0` (mainnet's upgrade name) and `v3.1.98` (the testnet's earlier name) and use v2 if either height is above 0; `signBytesVersionForApplied` and `signBytesVersionFor(chainId, height)` implement the rule (use `@qorechain/pqc` 0.2.1 or later; the 2-argument form from 0.1.x throws).

This is the piece wallets and integrators use to produce the **required hybrid signature** on the cosmos transaction path. As of the current chain version, hybrid signatures are **required by default** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): every cosmos-path transaction must carry a Dilithium-5 signature alongside its classical secp256k1 signature. See [Post-Quantum Security](/architecture/post-quantum-security) for the enforcement model.

The classical secp256k1 signature is computed over the standard sign bytes (which **exclude** the PQC extension), and the ML-DSA-87 signature is computed and attached as the `PQCHybridSignature` extension. Because the classical sign bytes exclude the extension, the classical signature stays valid whether or not a verifier understands the PQC part.

There are three ways to produce this hybrid signature:

* **The CLI** — `qorechaind tx pqc cosign` attaches the Dilithium-5 cosignature to a transaction and broadcasts it (after `qorechaind tx pqc gen-key`, and registering the key). It is part of the release binary only. See [Transaction Commands](/cli-reference/transaction-commands).
* **The QoreChain SDK** — `buildHybridTx` / `signAndBroadcastHybrid` (pass `rest` so the sign-bytes form is resolved) do the equivalent in TypeScript, Python, Go, Rust and Java; in TypeScript, `client.connectTx(signer, { pqcKeypair })` (SDK 0.9.0) signs every transaction hybrid. Register your key first (see above). See [SDK Accounts & PQC signing](/sdk/concepts/accounts-pqc).
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
