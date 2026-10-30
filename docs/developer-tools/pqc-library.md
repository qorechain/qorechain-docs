---
slug: /developer-tools/pqc-library
title: Post-Quantum Library (qorechain-pqc)
sidebar_label: PQC Library
sidebar_position: 20
---

# Post-Quantum Library (`qorechain-pqc`)

`qorechain-pqc` is the standards-only post-quantum cryptography library that QoreChain tooling is built on. It is for developers of wallets, backends, exchanges and tools who need to create or check the exact keys and signatures the chain uses, without depending on the full [QoreChain SDK](/sdk/overview). It wraps independent implementations of three NIST standards (ML-DSA, FIPS 204, for signatures; ML-KEM, FIPS 203, for key encapsulation; SHAKE-256, FIPS 202, as the hash) behind one API in TypeScript/JavaScript, Python, Rust, Go, Java and C, and adds the helpers that build the bytes a hybrid QoreChain transaction signs. Version **0.2.3**, Apache-2.0, checked against the registries on 27 October 2026.

It is a primitives library. It does not talk to the network, hold keys, register keys on chain or send transactions. For the chain rules around hybrid signatures and key registration read [Post-Quantum Signing](/developer-guide/post-quantum-signing) and [Post-Quantum Security](/architecture/post-quantum-security); for a ready-made signing client use the [SDK](/sdk/overview) or [QoreSign](/qoresign/overview), which both build on these primitives.

## Innovations {#innovations}

* **One set of test vectors, six independent backends.** The JavaScript binding uses `@noble/post-quantum`, Rust uses the `fips204`, `fips203` and `sha3` crates, Go uses Cloudflare CIRCL, Java uses Bouncy Castle, and Python and C use liboqs. Each binding's test suite must reproduce the same files in the repository's `vectors/` folder (ML-DSA at three levels, ML-KEM at three levels, SHAKE-256) byte for byte, so a signature made in one language verifies in the others.
* **Deterministic signing by default.** `sign` uses the deterministic variant of FIPS 204 (signing randomness of 32 zero bytes), so the same key and message give a byte-identical signature in every binding. That makes signatures, and the transaction hashes that contain them, reproducible and checkable against the vectors.
* **Hedged signing as an explicit opt-in that interoperates.** Randomized (hedged) signing is available as `{hedged: true}` in JavaScript, `hedged=True` in Python, `sign_hedged` in Rust, `SignHedged` in Go (added in 0.2.3), `mldsaSignHedged` in Java and `qpqc_mldsa_sign_hedged` in C. A hedged signature made in any of the six languages verifies in all six (36 of 36 combinations checked for 0.2.3). The chain verifies any valid FIPS 204 ML-DSA-87 signature, so it accepts both kinds; the two cannot be told apart without the secret key.
* **The chain's hybrid sign-bytes, built the way the chain builds them.** Every binding has `hybridSignBytesV1`, `hybridSignBytesV2` and a dispatcher `hybridSignBytes(version, chainId, body, authInfo)` that requires the version. The v2 form is `"qorechain-pqc-hybrid-v2"`, then the chain id with a 64-bit big-endian length, then the transaction body (without the PQC extension) and the auth info, each with a 32-bit big-endian length. All bindings are tested against the chain's known-answer file (`vectors/signbytes-kat-v3.1.98.json`). An empty chain id is refused on the checked entry points, because bytes bound to no chain verify on no network.
* **The network's sign-bytes version decided by a pure function.** A network verifies exactly one form at a time, and the switch to v2 was applied under two plan names (`v3.2.0` on mainnet at height 2,981,742, `v3.1.98` on the testnet). `SIGN_BYTES_V2_UPGRADES` lists both names and `signBytesVersionForApplied(chainId, appliedHeights)` returns `v1` or `v2` from the applied heights you read from the node. Asking about one name only would misread a network that switched under the other.
* **Strict input checking.** `verify` never throws: a wrong-length key or signature, or any other malformed input, returns `false`. `keygen(seed)`, `sign`, `encapsulate` and `decapsulate` throw an error that names the bad argument and its expected length.
* **Pure JavaScript, no native code.** The npm package runs in Node and in browsers without WebAssembly or add-ons. On an Apple-silicon laptop in the repository's own measurement (0.2.3, 1.5 KB message, one core) ML-DSA-87 signs in about 8 ms in JavaScript and about 0.3 to 0.45 ms in the other five bindings.

## How to use {#how-to-use}

All five registry packages expose the same operations: `keygen`, `keygenFromSeed` (32-byte seed), `sign`, `verify`; ML-KEM `keygen`, `encapsulate`, `decapsulate`; `shake256`; `pubkeyHash`; and the sign-bytes helpers. ML-DSA-87 and ML-KEM-1024 are the defaults, and the level-specific variants (44, 65, 87 and 512, 768, 1024) are exported next to them. ML-DSA-87 has a 2,592-byte public key and a 4,627-byte signature, which the examples below print.

### Install and import {#install}

| Language | Install | Import |
| --- | --- | --- |
| TypeScript / JavaScript | `npm install @qorechain/pqc` | `import { mldsa } from "@qorechain/pqc"` |
| Python (3.9 or later) | `pip install qorechain-pqc` | `from qorpqc import mldsa` |
| Rust | `cargo add qorechain-pqc` | `use qorechain_pqc::mldsa;` |
| Go | `go get github.com/qorechain/qorechain-pqc/go` | `import pqc "github.com/qorechain/qorechain-pqc/go"` |
| Java | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | `import network.qorechain.pqc.Pqc;` |
| C | build `c/` from the repository (static library and header) | `qorechain_pqc.h` |

### Sign and verify, in each language {#examples}

These are the quickstarts from the developer hub. Each was run unchanged on 27 October 2026 after installing from the public registry (Node 26, Python 3.12 with liboqs present, Rust 1.95, Go 1.26, JDK 21 with Gradle 9.6) and printed the public key size, the signature size and the verification result: `2592 4627 true` (Python prints `True`). None of them uses the network or a funded key, and the C binding has no quickstart.

TypeScript:

```ts
import { mldsa } from "@qorechain/pqc";

// ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
const seed = new Uint8Array(32).fill(7);
const { publicKey, secretKey } = mldsa.keygen(seed);

const message = new TextEncoder().encode("hello QoreChain");
const signature = mldsa.sign(secretKey, message); // deterministic by default
const ok = mldsa.verify(publicKey, message, signature);
console.log(publicKey.length, signature.length, ok);
```

Python:

```python
from qorpqc import mldsa

# ML-DSA-87 key pair. The Python binding generates keys from the system RNG
# (it does not take a seed); signing is deterministic by default.
public_key, secret_key = mldsa.keygen()

message = b"hello QoreChain"
signature = mldsa.sign(secret_key, message)
ok = mldsa.verify(public_key, message, signature)
print(len(public_key), len(signature), ok)
```

Rust:

```rust
use qorechain_pqc::mldsa;

fn main() {
    // ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
    let seed = [7u8; 32];
    let (pk, sk) = mldsa::default::keygen_from_seed(&seed);

    let message = b"hello QoreChain";
    let sig = mldsa::default::sign(&sk, message).expect("sign"); // deterministic
    let ok = mldsa::default::verify(&pk, message, &sig);
    println!("{} {} {}", pk.len(), sig.len(), ok);
}
```

Go:

```go
package main

import (
	"bytes"
	"fmt"

	pqc "github.com/qorechain/qorechain-pqc/go"
)

func main() {
	// ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
	pk, sk, _ := pqc.MLDSA.KeygenFromSeed(bytes.Repeat([]byte{7}, 32))

	message := []byte("hello QoreChain")
	sig, _ := pqc.MLDSA.Sign(sk, message) // deterministic
	fmt.Println(len(pk), len(sig), pqc.MLDSA.Verify(pk, message, sig))
}
```

Java (save as `PqcQuickstart.java`):

```java
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import network.qorechain.pqc.Pqc;

public class PqcQuickstart {
    public static void main(String[] args) {
        // ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
        // In the Java binding the secret key IS the 32-byte seed.
        byte[] seed = new byte[32];
        Arrays.fill(seed, (byte) 7);
        byte[][] kp = Pqc.mldsaKeygenFromSeed("ml-dsa-87", seed); // {publicKey, secretKey}

        byte[] message = "hello QoreChain".getBytes(StandardCharsets.UTF_8);
        byte[] sig = Pqc.mldsaSign("ml-dsa-87", kp[1], message); // deterministic
        boolean ok = Pqc.mldsaVerify("ml-dsa-87", kp[0], message, sig);
        System.out.println(kp[0].length + " " + sig.length + " " + ok);
    }
}
```

The fixed seed (32 bytes, each of value 7) is an example only. Use a random seed or the key derivation described in [Post-Quantum Signing](/developer-guide/post-quantum-signing#key-derivation) for a real key.

### Hedged signing {#hedged}

Deterministic signing is what `sign` does. To opt in to randomized signing, call the explicit variant, for example `mldsa.sign(secretKey, message, { hedged: true })` in JavaScript or `mldsa.sign(secret_key, message, hedged=True)` in Python. Use it only if you want a different signature each time; the chain accepts both, and `pqc` code 21 (`hybrid_verify_failed`) is never caused by choosing one over the other (see the [troubleshooting list](/developer-guide/post-quantum-signing#code-21)).

### Choosing the sign-bytes form {#sign-bytes}

Ask the node which upgrade names are applied, then let the library decide. This is the JavaScript form from the package README; the other bindings export the same names in their own style.

```ts
import { SIGN_BYTES_V2_UPGRADES, signBytesVersionForApplied, hybridSignBytes } from "@qorechain/pqc";

const applied: Record<string, string> = {};
for (const name of SIGN_BYTES_V2_UPGRADES) {
  const r = await fetch(`${rest}/cosmos/upgrade/v1beta1/applied_plan/${name}`).then((x) => x.json());
  applied[name] = r.height; // "0" means not applied
}
const version = signBytesVersionForApplied(chainId, applied); // "v1" or "v2"
const signBytes = hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfoBytes);
```

`rest` is `https://api.qore.host` for mainnet (`qorechain-vladi`) or `https://api-testnet.qore.host` for the testnet (`qorechain-diana`). Both networks verify v2 today. Most applications do not need to do this by hand: the SDK and QoreSign resolve the form per network.

## How to access {#how-to-access}

* **No network, account or key is needed to use the library.** It runs offline. A key pair it creates is only a key; to use it on QoreChain the account must register the public key once (see [Post-Quantum Signing](/developer-guide/post-quantum-signing#pqc-key-registration)), and a Cosmos-lane transaction then needs the secp256k1 signature plus the ML-DSA-87 signature (hybrid).
* **Networks.** The sign-bytes helpers and the vectors match mainnet `qorechain-vladi` (v3.2.5) and the testnet `qorechain-diana` (v3.2.6). See [Networks](/appendix/networks) for endpoints.
* **Python needs the liboqs shared library.** `pip install qorechain-pqc` depends on `liboqs-python`, which builds liboqs on first import when it is missing; that needs `git`, CMake and a C compiler on the machine. Install liboqs from your system package manager, or build it ahead of time, in locked-down environments. The Python binding reads keys from the system random number generator and has no seeded key generation in 0.2.3.
* **Go needs Go 1.25 or later** (a requirement since 0.2.1, together with CIRCL 1.6.5 or later).
* **Java** has been run with JDK 21. The ML-DSA secret key in the Java binding is the 32-byte FIPS 204 seed, not the 4,896-byte expanded key the other bindings use; any other input is refused.
* **Bouncy Castle pin in Java.** The Java binding is built on Bouncy Castle 1.85 since 0.2.3 (earlier releases used older versions with published advisories, none in the ML-DSA or ML-KEM code the binding calls). Per the project changelog, 1.85 is the latest Bouncy Castle release that still ships the `org.bouncycastle.pqc.crypto` classes, so keep your build on 1.85, and test before letting another dependency pull in a newer release, because later releases no longer ship those classes.
* **Cost.** Free and open source under Apache-2.0. Signing and verification cost nothing; on-chain use of the resulting signatures pays the usual fee (floor 0.1 uqor per gas).

## Where it is published {#where-published}

| Registry | Package | Version | Link |
| --- | --- | --- | --- |
| npm | `@qorechain/pqc` | 0.2.3 | https://www.npmjs.com/package/@qorechain/pqc |
| PyPI | `qorechain-pqc` (import `qorpqc`) | 0.2.3 | https://pypi.org/project/qorechain-pqc/ |
| crates.io | `qorechain-pqc` | 0.2.3 | https://crates.io/crates/qorechain-pqc |
| Go module proxy | `github.com/qorechain/qorechain-pqc/go` | v0.2.3 (tag `go/v0.2.3`) | https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go |
| Maven Central | `io.github.qorechain:qorechain-pqc` | 0.2.3 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc |
| C | source only, no package registry | tag `v0.2.3` | https://github.com/qorechain/qorechain-pqc |

Source: https://github.com/qorechain/qorechain-pqc (folders `js`, `python`, `rust`, `go`, `java`, `c`, `vectors`). All packages are Apache-2.0. Versions were read from each registry on 27 October 2026. The conceptual guide to the same library, including key derivation and rotation, is [Post-Quantum Signing](/developer-guide/post-quantum-signing); the SDK that uses it is described in [SDK Overview](/sdk/overview).

## Limits and known issues {#limits}

* **It is a primitives library, not a wallet or a client.** It does not register keys, build transactions, broadcast or read the chain. Use the [SDK](/sdk/overview) or [QoreSign](/qoresign/overview) for that.
* **Python and C cannot generate a key from a seed.** Both are backed by liboqs, which draws keys from the system random number generator. Their vector tests use the expanded secret key instead.
* **The Java secret key is a seed.** Code that moves ML-DSA secret keys between Java and the other bindings must convert: the Java value is the 32-byte seed, the others are the 4,896-byte expanded key for ML-DSA-87.
* **The Python binding needs a C toolchain the first time** if liboqs is not already installed. The Python quickstart was run with liboqs already present.
* **The C binding has no registry package and no tested quickstart.** Build it from the repository; it needs liboqs and OpenSSL.
* **Key sizes are fixed by the standard.** An ML-DSA-87 signature is 4,627 bytes and a public key 2,592 bytes; there is no smaller standard-compatible form.
* **Older releases.** Use 0.2.1 or later: 0.2.0 introduced the version-aware `hybridSignBytes` (the old two-argument form is now `hybridSignBytesV1`), and 0.2.1 added both upgrade plan names. 0.2.2 and 0.2.3 changed documentation and dependency versions, with identical output.
* **Hybrid use still needs the other half.** A hybrid signature carries a secp256k1 signature as well; this library produces only the ML-DSA half. Accounts, registration and the EVM authorization window are chain rules documented in [Post-Quantum Signing](/developer-guide/post-quantum-signing) and the [EVM guide](/developer-guide/evm-development#evm-window).
