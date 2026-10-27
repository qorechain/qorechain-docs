---
slug: /developer-tools/pq-light-client
title: PQ Light Client
sidebar_label: PQ Light Client
sidebar_position: 31
---

# PQ light client (`qorechain-pq-light-client`)

`qorechain-pq-light-client` is a draft specification and a reference verifier for ML-DSA-87 (FIPS 204) signed checkpoints. In the proposed design, validators sign a short checkpoint at the end of each epoch with a separate ML-DSA-87 checkpoint key, and a light client follows the chain of checkpoints by verifying those signatures and nothing else. It is for protocol researchers, relayer and bridge developers, and teams on other chains who want to review the design and test against it. Version **0.1.0**, Apache-2.0, maintained by the QoreChain Association.

**The chain does not support these checkpoints, and nothing is scheduled.** QoreChain does not produce the checkpoints this package verifies, on mainnet (`qorechain-vladi`) or on testnet (`qorechain-diana`). No chain version supports them and no upgrade or date is planned. Validator consensus keys are ed25519 today, not post-quantum. The package cannot follow a live network: it runs against simulated validator sets and the shared test vectors. It does not make any QoreChain route, bridge or IBC channel post-quantum.

## Innovations {#innovations}

- **Checkpoints instead of per-block signatures.** Validators would sign one checkpoint per epoch (chain id, epoch, height, time, header hash, app hash, the hash of the signing set and the hash of the next set). Signatures would travel in ordinary transactions, so block production never waits for them, and the data volume stays far below signing every block. The specification (section 12) gives the reasoning.
- **A separate checkpoint key with a proof of possession.** Each validator would register an ML-DSA-87 checkpoint key, separate from its consensus key and from any account key, with a proof of possession over `"qorechain-pqlc-key-pop-v1|" || chain_id || operator address || consensus address || public key`.
- **Set handover by the outgoing set.** A checkpoint is accepted when validators holding strictly more than two thirds of the power of the set named by the last trusted checkpoint signed it, so validator set changes are always signed by the outgoing set. Exactly two thirds is not a quorum, and a signature from a non-member invalidates the checkpoint instead of being skipped.
- **One encoding per object.** Checkpoint, validator set and signed checkpoint have canonical encodings, and the decoders accept exactly one encoding for each. A relayer forwards the canonical bytes unchanged.
- **Fixed order of checks.** `verifyCheckpoint` runs the checks in a specified order, so TypeScript, Rust and Go return the same error code for the same input.
- **Misbehaviour evidence.** Two different checkpoints for one epoch, each with a quorum, are misbehaviour. `detectMisbehaviour` returns both checkpoints in a canonical order, the double signers and their power.
- **Three languages, one set of vectors.** The shared vectors (`vectors/pq-light-client-v1.json`) come from a deterministic simulator and cover 4-validator and 21-validator checkpoint chains, set rotations, every rejection the verifier can produce, conflicting checkpoints and decoder cases. Go, Rust and TypeScript all pass them, so a fourth implementation can prove it matches byte for byte.

## Use cases {#use-cases}

1. **Relayer developers prototype a post-quantum update path.** A Rust relayer keeps one trusted state per network, decodes and verifies each signed checkpoint, forwards the same bytes to the destination and stops on `CONFLICTING_CHECKPOINT`. Today it runs over the vectors or a custom simulated chain; the repository's relayer guide shows the loop.
2. **IBC and bridge teams evaluate the design.** Specification section 14 maps checkpoints onto an IBC light client type (client state, consensus state, misbehaviour, membership proofs at checkpoint heights). Teams can review the mapping and its trade-offs before anything exists on chain. It is a design note; no code exists for it.
3. **Teams on EVM chains or Solana compare verifier designs.** Section 15 compares on-chain ML-DSA-87 verification, a STARK proof of verification and an attestor set, including which choices keep the post-quantum property and which give it up. Also design notes only. For reference, QoreChain's own EVM has an ML-DSA verification precompile (`pqcVerify`, 0x0A01) that is active on testnet only; see [EVM precompiles](/developer-guide/evm-precompiles).
4. **Security reviewers and researchers check the rules.** The order of checks, the quorum rule, set handover, trusting period and misbehaviour evidence are specified and testable in three languages.
5. **Teams that talk about routes word their claims correctly.** The position page in the repository defines when a route may be called post-quantum (see [Limits](#limits)).
6. **Implementers in other languages.** The vectors let a new implementation prove it matches the reference.

## How it works {#how-it-works}

Everything in this section is the proposed design, and all of it requires chain support that is not scheduled.

1. Each validator registers an ML-DSA-87 checkpoint key with a proof of possession (above).
2. At the end of each epoch, validators sign a checkpoint: chain id, epoch (strictly increasing), height, time, header hash, app hash, the hash of the set that signs this checkpoint and the hash of the set that signs the next one.
3. A light client accepts a checkpoint signed by more than two thirds of the power of the set its last trusted checkpoint named.
4. Two different checkpoints for one epoch, each with a quorum, are misbehaviour; the evidence names the double signers.

Per-block consensus would be unchanged. Heights inside an epoch stay classical until the next checkpoint; a client that needs the post-quantum guarantee uses checkpoint heights and accepts up to one epoch of latency.

**Formats** (all integers big-endian, version byte `0x01`):

| Object | Layout | Size |
|---|---|---|
| Checkpoint | version, chain id length and bytes, epoch, height, time, header hash, app hash, validator set hash, next validator set hash | `154 + len(chain_id)` bytes (169 for `qorechain-vladi`) |
| Validator set | version, count (1 to 256), then per validator: 20-byte address, 8-byte power, 2,592-byte ML-DSA-87 key, sorted by address | `3 + 2,620 x validators` bytes |
| Signed checkpoint | version, checkpoint, signature count, per signer a 20-byte address and a 4,627-byte signature (sorted by address), next set flag, next set when the set changes | `173 + 4,647 x signers` bytes for `qorechain-vladi`, plus the next set when present |

**Signature and hash.** ML-DSA-87, FIPS 204 pure mode, empty context, over `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)`. Deterministic and hedged signing are both valid. The hash is SHAKE-256 with 32-byte output; the validator set hash uses the prefix `qorechain-pqlc-valset-v1|`.

**Verification order** (`verifyCheckpoint`): structure, chain id, trust expiry, clock drift, same-epoch handling (identical gives `NOT_NEWER`; different with a quorum gives `CONFLICTING_CHECKPOINT`), progress of epoch, height and time, signing set equals the trusted next set, carried next set matches its hash, quorum. A failure leaves the trusted state unchanged. A later epoch can be accepted directly while the signing set is unchanged; after a rotation, every checkpoint from the rotation on must be verified.

**Trust.** A client starts from a trust root chosen outside the protocol, as with any proof-of-stake light client. The trusting period must be shorter than the period during which a validator can still be penalised; after it, the client must be re-initialised.

The specification is `spec/pq-light-client-v1.md` in the repository (status: draft, open for review). Section 10 (checkpoint keys, signing, epochs, penalties on chain) is a design for review, not a commitment.

## How to use {#how-to-use}

### Install {#install}

| Language | Install | Minimum platform |
|---|---|---|
| TypeScript | `npm install @qorechain/pq-light-client` | Node.js 20.19 or later, and browsers. Depends on `@qorechain/pqc` 0.2.3 |
| Rust | `cargo add qorechain-pq-light-client` (library `qorechain_pq_light_client`) | stable Rust; depends on `qorechain-pqc` 0.2.3; no `unsafe`, no I/O |
| Go | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` (package `pqlightclient`) | Go 1.25; depends on `github.com/qorechain/qorechain-pqc/go` v0.2.3 |

There is no PyPI package, and none is planned.

### Quickstart (offline, TypeScript) {#quickstart}

Nothing touches a QoreChain network. The script follows the simulated 21-validator checkpoint chain from the shared vectors (chain id `qorechain-sim-21`, including a set rotation at epoch 2), then shows that the live source is not available. The vector keys are public test keys.

```bash
mkdir pqlc && cd pqlc && npm init -y && npm pkg set type=module
npm install @qorechain/pq-light-client
curl -sLO https://raw.githubusercontent.com/qorechain/qorechain-pq-light-client/v0.1.0/vectors/pq-light-client-v1.json
```

```js
// follow.mjs: a TypeScript port of the repository's Rust relayer example.
import { readFileSync } from "node:fs";
import {
  PqLightClientError,
  decodeSignedCheckpoint,
  decodeValidatorSet,
  fetchCheckpoint,
  newTrustedState,
  verifyCheckpoint,
} from "@qorechain/pq-light-client";

const v = JSON.parse(readFileSync("pq-light-client-v1.json", "utf8"));
const hex = (s) => Uint8Array.from(Buffer.from(s, "hex"));

const root = decodeSignedCheckpoint(hex(v.signedCheckpoints["c21-e0-root"].encoded));
const set = decodeValidatorSet(hex(v.validatorSets.C21.encoded));
let state = newTrustedState({
  checkpoint: root.checkpoint,
  signatures: root.signatures,
  validatorSet: set,
  nextValidatorSet: set,
  trustingPeriod: 1_209_600n, // 14 days
  maxClockDrift: 10n,
});

for (const id of ["c21-e1", "c21-e2-rotate", "c21-e3"]) {
  const signed = decodeSignedCheckpoint(hex(v.signedCheckpoints[id].encoded));
  state = verifyCheckpoint(state, signed, signed.checkpoint.time + 5n);
  console.log(`trusted epoch ${state.checkpoint.epoch} at height ${state.checkpoint.height}`);
}

try {
  await fetchCheckpoint("https://rpc.example.invalid", state.checkpoint.chainId, 4n);
} catch (e) {
  if (e instanceof PqLightClientError) console.log("live source:", e.code);
}
```

Run on 27 October 2026 against the published npm 0.1.0 package and the vectors at tag v0.1.0, `node follow.mjs` printed:

```
trusted epoch 1 at height 11000
trusted epoch 2 at height 12000
trusted epoch 3 at height 13000
live source: REQUIRES_CHAIN_SUPPORT
```

The vectors file is about 2.4 MB. The Rust original is `rust/examples/relayer.rs` in the repository (`cargo run --example relayer`); it was not run for this page.

Error handling in TypeScript (from the package README):

```ts
try {
  trusted = verifyCheckpoint(trusted, decodeSignedCheckpoint(bytes), BigInt(Math.floor(Date.now() / 1000)));
} catch (e) {
  if (e instanceof PqLightClientError && e.code === "CONFLICTING_CHECKPOINT") {
    report(e.misbehaviour);
  }
}
```

The same in Go:

```go
signed, err := pqlightclient.DecodeSignedCheckpoint(b)
if err != nil {
	return err
}
next, err := pqlightclient.VerifyCheckpoint(trusted, signed, uint64(time.Now().Unix()))
if errors.Is(err, pqlightclient.ErrConflictingCheckpoint) {
	// err.(*pqlightclient.Error).Misbehaviour holds the evidence
}
```

### Main API {#api}

The API is the same in all three languages (TypeScript camelCase, Go PascalCase, Rust snake_case). 64-bit fields are `bigint` in TypeScript.

| Name | What it does |
|---|---|
| `Checkpoint`, `ValidatorSet`, `SignedCheckpoint`, `TrustedState`, `Misbehaviour` | data types |
| `encodeCheckpoint`, `decodeCheckpoint` | canonical checkpoint encoding; strict decoder |
| `encodeValidatorSet`, `decodeValidatorSet`, `hashValidatorSet` | validator set encoding and SHAKE-256 hash |
| `encodeSignedCheckpoint`, `decodeSignedCheckpoint` | the bytes a relayer carries |
| `encodeCheckpointSignBytes` | the sign-bytes, `"qorechain-pqlc-checkpoint-v1|" || encode(checkpoint)` |
| `newTrustedState` | trust root to trusted state (checks that both sets hash to the values in the checkpoint; does not verify signatures) |
| `verifyCheckpoint(trusted, signed, now)` | full verification; returns the new trusted state or a typed error |
| `detectMisbehaviour(set, a, b)` | evidence for conflicting checkpoints, or nothing |
| `signCheckpoint` | sign a checkpoint with an ML-DSA-87 secret key (simulators and tests) |
| `CheckpointSource`, `fetchCheckpoint`, `chainCheckpointSource` (TypeScript) or `ChainCheckpointSource` (Rust, Go) | interfaces for a future node API; today they always fail with `REQUIRES_CHAIN_SUPPORT` and make no request |
| `PqLightClientError` (TypeScript), `*Error` with `ErrInsufficientPower` and the like (Go, use `errors.Is`), `Error` with `code()` (Rust) | typed errors with stable codes |

Error codes, shared by all three languages, and what a relayer should do (from the relayer guide):

| Error | Action |
|---|---|
| `MALFORMED` | drop the bytes; the source is faulty |
| `CHAIN_ID_MISMATCH` | configuration error |
| `TRUST_EXPIRED` | stop; re-initialise from a new trust root |
| `FUTURE_CHECKPOINT` | check the local clock; retry later |
| `NOT_NEWER` | nothing new; wait |
| `SET_MISMATCH` | a checkpoint with a set rotation is missing; fetch the epochs in between |
| `UNKNOWN_VALIDATOR`, `BAD_SIGNATURE` | drop the checkpoint |
| `INSUFFICIENT_POWER` | wait for more signatures |
| `CONFLICTING_CHECKPOINT` | stop relaying and report the evidence |
| `REQUIRES_CHAIN_SUPPORT` | expected today |

## How to access {#how-to-access}

- **Mainnet `qorechain-vladi` and testnet `qorechain-diana`:** no checkpoints are produced, so the verifiers cannot follow either network. No chain version supports them and none is scheduled.
- What the networks do today: validator consensus keys are ed25519, vote extensions are off, and IBC uses the standard 07 light client type.
- **To run the package** you need nothing beyond the language runtime. No account, no keys, no endpoint, no cost. The vectors use public test keys and the chain ids `qorechain-sim` and `qorechain-sim-21`.
- For reference only (this package does not use them): REST `https://api.qore.host` and `https://api-testnet.qore.host`, RPC `https://rpc.qore.host` and `https://rpc-testnet.qore.host`.

## Where it is published {#where-published}

Checked on 27 October 2026 against each registry.

| Registry | Package | Version | Link |
|---|---|---|---|
| npm | `@qorechain/pq-light-client` | 0.1.0 (`latest`) | [npmjs.com](https://www.npmjs.com/package/@qorechain/pq-light-client) |
| crates.io | `qorechain-pq-light-client` | 0.1.0 | [crates.io](https://crates.io/crates/qorechain-pq-light-client) |
| Go module proxy | `github.com/qorechain/qorechain-pq-light-client/go` | v0.1.0 (tag `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) |

Source: [github.com/qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client) (release v0.1.0, source code, no binaries). Licence Apache-2.0.

## Limits and known issues {#limits}

- **It does not make QoreChain, any IBC channel, bridge or relayer post-quantum.** Validator consensus keys are not post-quantum today, and no upgrade to change that is scheduled.
- **It cannot follow a live network.** `fetchCheckpoint` always fails with `REQUIRES_CHAIN_SUPPORT`. It works on simulated validator sets and the shared vectors.
- **The specification is a draft, open for review.** Nothing in it is a commitment.
- **Design notes without code:** the IBC client type (section 14) and the EVM and Solana verifiers (section 15).
- **Heights inside an epoch stay classical.** Even with checkpoints, post-quantum verification would apply at checkpoint heights.
- **What may be called a post-quantum route.** A route may be called post-quantum when both ends verify post-quantum-signed state of the other end, in both directions, with no classical step: no classical light client at either end, no pairing-based SNARK wrapper, no classical attestor committee. Post-quantum account signatures alone do not make a route post-quantum. QoreChain accounts sign with ML-DSA-87 and secp256k1; describe that as "post-quantum account signatures", not as a post-quantum route.
- **Trust roots are subjective.** The protocol cannot protect a client that starts from a wrong one.
- **Pre-1.0.** Minor versions may change the API.

Wording suggested by the repository's position page:

| Situation | Wording |
|---|---|
| Accounts sign with ML-DSA-87 | "post-quantum account signatures" |
| One end verifies post-quantum checkpoints, the other does not | "post-quantum verification of QoreChain state on chain X; the return path is classical" |
| Both ends verify post-quantum-signed state, with no classical step | "post-quantum route" |

Until both ends meet the rule, describe a route by what it actually verifies, for example "secured by the counterparty's classical light client".

## Security notes {#security}

- The package holds no keys and does no I/O. Rust has no `unsafe` code; in TypeScript and Go, `fetchCheckpoint` makes no request.
- Decoders are strict: one encoding per object, and any other signature or key length is rejected. Relayers must forward the canonical bytes unchanged, never a re-encoding.
- Signatures from validators outside the set invalidate a checkpoint instead of being skipped, which keeps all implementations on the same result.
- Keep the verifier's clock synchronised: a fast clock expires trust early, and a slow one rejects new checkpoints as `FUTURE_CHECKPOINT`.
- The design assumes that validators holding more than two thirds of each checkpoint set's power sign nothing but checkpoints their own node committed.
- The proposed signing domains (`qorechain-pqlc-checkpoint-v1|`, `qorechain-pqlc-key-pop-v1|`) are proposals; they are not reserved on chain today.
- The vectors' keys are public test keys; never use them for anything else.
- Report vulnerabilities privately to security@qore.network.

## Related pages {#related}

- [PQC library](/developer-tools/pqc-library): the ML-DSA-87 and SHAKE-256 bindings under the verifiers.
- [QoreSign](/qoresign/overview): account-level ML-DSA-87 signatures, which are a different thing from validator checkpoints.
- [Post-quantum security](/architecture/post-quantum-security): the post-quantum model of the chain today.
- [Bridge architecture](/architecture/bridge-architecture) and [Bridging assets](/user-guide/bridging-assets): cross-chain routes today use the standard classical light client.
- [QoreSeal](/developer-tools/qoreseal): the other 0.1.0 post-quantum kit published on 27 October 2026.
- [Developer packages overview](/developer-tools/overview).
