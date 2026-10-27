---
slug: /qorel/signing-from-any-language
title: Signing QoreChain transactions from any language
sidebar_label: Signing from any language
sidebar_position: 8
---

# Signing QoreChain transactions from any language

QORel signs in Rust with the `qorel-signer` crate. Other relayers, bots and tools can produce the same hybrid post-quantum signature in other languages with the QoreChain SDK and the post-quantum libraries. This page states the contract they all follow and lists the library to use for Rust, TypeScript, Go, Python and Java. It is for developers who build a relayer, a bot or a backend that submits transactions to QoreChain.

## Innovations {#innovations}

- **One contract, one set of test vectors.** Every language builds the same sign bytes and the same extension. The QORel repository publishes vectors rebuilt byte for byte from transactions the chain accepted, so you can check an implementation before it touches a network.
- **The extension is the only addition.** The post-quantum signature travels in one extension option of the transaction body; messages, fees and the classical signature keep their usual form.
- **The hook point is narrow.** The signature is added after the auth info is final and before the classical sign document is built. A relayer needs one change at that point, not a rewrite.
- **Same key everywhere.** The ML-DSA-87 key is derived from the account's mnemonic with the QoreChain wallet derivation, so any wallet or relayer that imports the mnemonic gets the same post-quantum key.

## How to use {#how-to-use}

### The contract {#contract}

QoreChain accepts a native-lane transaction only if it carries both signatures:

- **The classical secp256k1 signature**, in the usual `SIGN_MODE_DIRECT` form. It covers the final body, extension included.
- **An ML-DSA-87 (FIPS 204) signature** in an extension option of the body, of type `/qorechain.pqc.v1.PQCHybridSignature`, with `algorithm_id = 1`, `pqc_signature` (4,627 bytes) and an optional `pqc_public_key` (2,592 bytes). It must be the only critical extension option (in `extension_options`) of the transaction.

The ML-DSA signature covers the sign bytes (version 2, current on both networks):

```
"qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id
                          || BE32(len(B0)) || B0
                          || BE32(len(A))  || A
```

- `B0` is the `TxBody` without the PQC extension, re-encoded canonically.
- `A` is the `AuthInfo` bytes, unchanged.

Order of operations:

1. Build the body and the auth info.
2. Sign the sign bytes with ML-DSA-87.
3. Append the extension to the body.
4. Sign the final body with secp256k1.
5. Broadcast.

Rules that are easy to get wrong:

- `B0` must be canonical, because the chain re-derives it by decoding the body, dropping the hybrid option and re-encoding. Do not send bodies with their own extension options, the `unordered` flag, unknown fields or a non-canonical encoding.
- A refusal with codespace `pqc` code 21 means the hybrid signature did not verify. Re-read the sign-bytes version and the account's registration before retrying; see [Post-Quantum Signing](/developer-guide/post-quantum-signing#code-21).
- Gas: the verification costs 2,000 gas per keyed signer, plus the size cost of about 4.7 KB of extension. Simulate through the same path so both are counted.

### Registering and deriving the key {#keys}

The account registers its ML-DSA public key once with `MsgRegisterPQCKeyV2`, including a proof of possession. This is the one transaction QoreChain accepts with the classical signature alone. See [Post-Quantum Signing](/developer-guide/post-quantum-signing#pqc-key-registration).

The ML-DSA key is derived from the same mnemonic as the account:

```
seed = SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)[:32]
```

then `ML-DSA-87.KeyGen_internal(seed)`. Secrets are zeroized and never printed. The same derivation is described on [Key Derivation](/qoresign/guides/key-derivation).

### The signer layer in QORel {#signer-layer}

The `qorel-signer` crate splits the work into three interfaces:

- `PqSigner`: a post-quantum primitive (`algorithm_id`, `public_key`, `sign`). `MlDsa87Signer` is provided, with hedged signing by default and deterministic signing for test vectors; every signature is verified before use.
- `SignBytesFramer`: a chain's rules (`check_body`, `frame`, `pack`).
- `TxExtensionSigner`: what the relayer calls. `PqExtensionSigner` combines a primitive and a framer.

The relayer builds a transaction in this order: encode the body without any co-signer extension (`B0`); encode the final auth info (`A`); ask the co-signer for the extension options to append; re-encode the body with them; make the classical signature over the sign document of the final body. To use the crate from Rust, depend on it from the repository (it is not on crates.io):

```toml
[dependencies]
qorel-signer = { git = "https://github.com/qorechain/QORel", tag = "qorel-v0.1.0" }
```

A complete call, building the hybrid signer for a chain and asking it for the extension options, is in `crates/qorel-signer/README.md` in the repository. The crate works on raw protobuf bytes, refuses bodies the chain would reject (an existing critical extension option, `unordered`, unknown fields), never falls back to v1 sign bytes on QoreChain networks before the version is known, verifies each signature it makes, and zeroizes secrets and redacts them in `Debug` output. Its tests rebuild, byte for byte, transactions the chain's ante handler accepted. See also [qorel-signer on the overview](/qorel/overview#qorel-signer).

A chain that needs a different extra signature implements a framer, and a new primitive if the algorithm differs; nothing else in the relayer changes.

### Libraries {#libraries}

| Language | Package | Hybrid signing |
|---|---|---|
| Rust | `qorechain-sdk` (crates.io), or `qorel-signer` from the [QORel repository](https://github.com/qorechain/QORel) (`crates/qorel-signer`) | `qorel_signer::qorechain::qorechain_hybrid_signer` with `PqExtensionSigner`; `qorechain::tx::build_hybrid_tx` |
| TypeScript and JavaScript | `npm install @qorechain/sdk` | `TxClient` signs hybrid with a `pqcKeypair`; `ensurePqcRegistered` |
| Go | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | `qorechain/tx` (hybrid build and sign), `qorechain/signbytes`, `qorechain/pqcdx` |
| Python | `pip install qorechain-sdk` | `build_hybrid_tx`, `build_hybrid_signature_extension` |
| Java and Kotlin | `io.github.qorechain:qorechain-sdk` (Maven Central) | `PqcDx` (registration, hybrid send path) and the hybrid transaction builder |
| C and others | [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) | ML-DSA-87 keygen, sign and verify bindings; frame the sign bytes as above |

See [Developer Packages](/developer-tools/overview) for the current version of each package and [QoreSign](/qoresign/overview) for signing in a wallet or backend. The classical-only clients in some packages cannot send native-lane transactions; check the package page before using one for writes.

### Test vectors {#test-vectors}

`crates/qorel-signer/tests/vectors/` in the QORel repository holds:

- a sign-bytes known-answer file;
- relay-transaction vectors: the body without the extension, the sign bytes, the extension bytes and the full signed transaction, rebuilt byte for byte from transactions the chain accepted;
- the cross-SDK key-derivation vector.

Run them in your language before sending anything to a live network. The QoreSign vectors are on [Test Vectors](/qoresign/vectors).

### Adding post-quantum signing to another relayer {#other-relayers}

The hook point is "after the auth info is final and before the classical sign document is built". Plug the extension in there:

- In Hermes-based relayers, that is `crates/relayer/src/chain/cosmos/encode.rs::sign_tx`. QORel's change there is generic: any `TxExtensionSigner` can add extension options.
- In Go relayers built on the Cosmos SDK `client/tx` package, wrap the `TxBuilder` before `SetSignatures`.

## How to access {#how-to-access}

- **Network.** The contract is the same on both QoreChain networks; QORel itself is tested on the testnet only.
- **Key and account.** A funded account with a registered ML-DSA-87 key; testnet QOR from the [Dashboard Faucet](/dashboard/faucet).
- **Cost.** The libraries are free (Apache-2.0). Transactions pay gas at a floor of 0.1 uqor per gas.

## Where it is published {#where-published}

| Package | Registry | Source |
|---|---|---|
| `qorel-signer` | In the repository (`crates/qorel-signer`); not on crates.io, use the git dependency above | [qorechain/QORel](https://github.com/qorechain/QORel) |
| `qorechain-sdk`, `@qorechain/sdk`, Go module, Maven artifact | crates.io, npm, Go proxy, Maven Central, PyPI | [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk) |
| `qorechain-pqc` | npm, PyPI, crates.io, Go, Maven | [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc) |

## Limits and known issues {#limits}

- **Only ML-DSA-87 (algorithm id 1).** That is the one algorithm QORel and the libraries above sign with.
- **Sign-bytes version.** This page documents version 2, which both networks verify. A tool must still read the version from the chain (the applied upgrade records) rather than assume it; QORel does.
- **Signing is local.** None of these libraries holds a key for you or signs through a hardware wallet.
- **Language examples are not repeated here.** Use each package's own quickstart; this manual does not claim that every language was run against the QORel test vectors.
