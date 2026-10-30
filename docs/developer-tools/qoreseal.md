---
slug: /developer-tools/qoreseal
title: QoreSeal
sidebar_label: QoreSeal
sidebar_position: 30
---

# QoreSeal (`qoreseal`)

QoreSeal is an open-source library that encrypts data to QoreChain accounts with ML-KEM-1024 (FIPS 203). An account publishes its ML-KEM-1024 public key on chain; anyone can then encrypt a payload that this account, and any other recipient the sender adds, can read. It is for dApp developers who need confidential payloads (memos, invoices, documents, bids), for auditors who need view access, and for operators of private groups and sidechains. It composes standard primitives and implements none of its own. Version **0.1.0**, Apache-2.0, maintained by the QoreChain Association.

Where it stands on 30 October 2026: the encryption itself works offline anywhere, with no network and no account. Encrypting to an address read from the chain needs the KEM key registry, which is **live on testnet** (`qorechain-diana`) and, since mainnet (`qorechain-vladi`) applied v3.2.5 on 29 October 2026, **its read route answers on mainnet too** (no account has published a key there yet that this page could find). The package is published for Rust, Go, Python, Swift, Kotlin/JVM and Android. The TypeScript package `@qorechain/qoreseal` is **coming** and is not on npm yet. The construction is a draft pending an external review before 1.0.

QoreSeal protects the content of a payload, nothing else. Addresses, transaction timing, transfer amounts, envelope sizes and the number of recipients stay public on chain. It is not a way to make transactions private.

## Innovations {#innovations}

- **One envelope, 1 to 1,024 recipients.** The payload is encrypted once with a random AES-256-GCM data key; the data key is wrapped separately for each recipient, so adding a reader costs about 1.6 KB, not another copy of the payload.
- **Hybrid by default, never downgraded silently.** In `hybrid` mode each recipient entry combines an ML-KEM-1024 encapsulation with an X25519 agreement through a SHA3-256 combiner, so the data stays protected as long as either holds. `mlkem` mode (ML-KEM-1024 alone) must be chosen explicitly; the library never falls back to it on its own.
- **Context binding.** Every envelope is bound to a chain id and a purpose through the key derivation (HKDF-SHA-256 with info `"qorechain-kem-v1|" + chainId + "|" + purpose`) and to optional associated data. An envelope sealed for one purpose does not open under another.
- **Keys published on chain, checked by the chain.** An account registers its ML-KEM-1024 key with `MsgRegisterKEMKey`, authenticated by the transaction's hybrid signature. `validateMlkemPublicKey` applies the same checks the chain applies at registration.
- **Recipient cards.** The registry holds the ML-KEM key and nothing else. The X25519 key for hybrid mode travels in a card that the account signs with [QoreSign](/qoresign/overview) message signing and binds to its on-chain ML-KEM key. Senders verify the card against both keys on chain, so it can come from any channel. A forged or stale card can at most reduce an envelope to ML-KEM-1024 strength, because the ML-KEM part always uses the key on chain.
- **Epoch keys for private groups.** `EpochKeyManager` creates a new epoch key on every membership change and seals it to the current members. A removed member keeps the keys of the epochs they belonged to and cannot read later ones.
- **Encrypted batches with commitments.** The batch codec produces an encrypted blob with a ciphertext commitment and a salted plaintext commitment, ready to anchor on QoreChain with the [RDK](/rollups/overview).
- **Same bytes in every language.** TypeScript and Go are native implementations; Rust is the core under Swift, Kotlin and Python. Shared test vectors are checked byte for byte in every language, and errors carry stable codes (for example `NOT_A_RECIPIENT`, `DECRYPTION_FAILED`, `CARD_INVALID`, `RECIPIENT_NEEDS_X25519`, `UNKNOWN_EPOCH`, `MALFORMED_ENVELOPE`).

## Use cases {#use-cases}

1. **A dApp encrypts memos or messages between users.** A chat or payments dApp seals each note to the recipient's address with `sealToAddresses` and stores the `qoreseal:` text in a memo, a contract or its own database. Only the recipient's key opens it.
2. **Invoices and documents with an auditor (view) key.** A business seals an invoice to the buyer, the seller and an auditor key in one envelope, with the invoice number as associated data. The auditor key is an ordinary QoreSeal key pair kept in configuration; one key per quarter (`deriveSealKeys` with a new index) lets the business hand the auditor just the periods under review.
3. **Sealed bids and commit-reveal.** An auction seals bids to the auction key with `purpose: "bid:<auction id>"` and the bidder address as associated data, stores the envelopes, and opens them after the deadline.
4. **Consortium or private sidechains.** The operator of a private rollup uses `EpochKeyManager` to share an epoch key with the members, encrypts every batch with `PrivateBatchCodec`, and anchors the encrypted blob and its commitments on QoreChain with the RDK.
5. **Wallets offering "receive encrypted data".** A wallet derives the QoreSeal keys from the account mnemonic (index 0), publishes the ML-KEM key with a hybrid-signed `MsgRegisterKEMKey`, and shows the recipient card for signing as plain text.
6. **Recovery or escrow recipients.** A custody or compliance team adds an offline recovery key to every envelope, so data survives the loss of a user's key.
7. **Backends in Python or Go.** A service seals reports or exports to a list of accounts, byte-compatible with every other language.

## How it works {#how-it-works}

Primitives (QoreSeal implements none of them): ML-KEM-1024 (FIPS 203; encapsulation key 1,568 bytes, decapsulation key 3,168 bytes, ciphertext 1,568 bytes), X25519 (RFC 7748), a SHA3-256 combiner, HKDF-SHA-256 and AES-256-GCM (96-bit nonce, 128-bit tag).

**Sealing**, in short:

1. A random 16-byte salt and a random 32-byte data key are drawn.
2. For each recipient, an ML-KEM-1024 encapsulation to the recipient's key; in hybrid mode also an ephemeral X25519 agreement with the recipient's X25519 key, and the two secrets are combined with SHA3-256. A key-encryption key is derived with HKDF-SHA-256 (salt, info `"qorechain-kem-v1|" + chainId + "|" + purpose`) and wraps the data key with AES-256-GCM.
3. The payload is encrypted once with the data key, authenticating the whole header and the optional associated data.

**Envelope layout:** magic `QSEL`, version 1, mode, algorithm bytes, flags, salt, recipient count, one entry per recipient (hint, ML-KEM ciphertext, X25519 ephemeral key in hybrid mode, wrapped data key), nonce, ciphertext. Size: `56 + 1,664 x recipients + plaintext` bytes in hybrid mode and `56 + 1,632 x recipients + plaintext` in `mlkem` mode. From the specification: 1 recipient and 1 KB of plaintext is 2,744 bytes (hybrid); 10 recipients and 1 KB is 17,720 bytes.

Chain id and purpose are not written into the envelope: the recipient must pass the same values. A wrong chain id, purpose or associated data, or any change to the bytes, gives `DECRYPTION_FAILED`.

**Hints.** Salted hints let a recipient find its own entry quickly. With `anonymous: true` the hints are zeroed and recipients try every entry.

**Text form.** `envelopeToText` and `envelopeFromText` convert to and from `"qoreseal:" + base64url`.

**What is on chain**

- The KEM key registry in module `qorechain.pqc.v1`: `MsgRegisterKEMKey` with `sender`, `algorithm_id = 2` (ML-KEM-1024) and `public_key`, and `MsgRemoveKEMKey` with `sender`. Type URLs: `/qorechain.pqc.v1.MsgRegisterKEMKey` and `/qorechain.pqc.v1.MsgRemoveKEMKey`.
- Query: `GET /qorechain/pqc/v1/kem/{address}` (accepts `qor1` or `0x` form), returning `found` and, when found, `key` with `address`, `algorithm_id`, `algorithm_name`, `public_key` and `registered_height`.
- Registration is authenticated by the transaction's hybrid signature. The sender must already have a registered ML-DSA-87 key, and the transaction is signed with QoreSign `signHybrid`. One key per account; registering again replaces it.
- Refusals (codespace `pqc`): 250 registry not enabled on this chain yet, 251 invalid KEM public key, 252 no KEM key published for this account, 253 this key is already published for this account, 254 publishing a KEM key needs a registered post-quantum signature key. `describeKemRegistryError` explains them.
- Envelopes themselves go wherever the application puts them (memos, contracts, files, APIs). The chain never sees a secret key.

**Recipient card.** About 6.7 KB of JSON, mostly the ML-DSA-87 signature. The account signs a fixed text (`QoreSeal recipient card v1`, chain id, address, SHA3-256 of the ML-KEM key, X25519 key, issue time) with QoreSign message signing. Registering a new ML-KEM key retires every card made for the old one.

**Private groups.** An epoch key payload (`QSEK`, epoch number, 32-byte key) is sealed in an ordinary envelope to the current members. A batch blob (`QSBT`, epoch, batch index, context such as the rollup id, nonce, AES-256-GCM ciphertext) is `83 + context length + data length` bytes. Commitments: `ciphertextCommitment = SHA3-256(blob)` and `plaintextCommitment = SHA3-256("qorechain-qoreseal-batch-v1" || commitSalt || data)`, salted so outsiders cannot guess low-entropy contents.

The specification is `spec/qoreseal-v1.md` in the repository (status: draft, review in progress); the shared vectors are `vectors/qoreseal-v1.json`.

## How to use {#how-to-use}

### Install {#install}

| Language | Install | Minimum platform |
|---|---|---|
| Rust | `cargo add qorechain-qoreseal` (library name `qoreseal`) | stable Rust |
| Go | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Go 1.25 |
| Python | `pip install qorechain-qoreseal` (import `qoreseal`) | Python 3.9 or later; wheels for macOS 11+ (arm64, x86_64) and Linux manylinux2014 (x86_64, aarch64); no Windows wheel yet |
| Swift | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, product `QoreSeal` | iOS 16, macOS 13 |
| Kotlin / JVM | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Java 17; Kotlin 2.3 or later compiler (compilation fails with Kotlin 2.1) |
| Android | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | API 24; R8 keep rules included; Kotlin 2.3 or later compiler |
| TypeScript | **coming**: `@qorechain/qoreseal` is not on npm yet, so there is no install command | |

The TypeScript source, its examples and the network helpers are in the repository and run from there after `pnpm install && pnpm build`. Until the npm package is published, treat the repository as the way to use TypeScript, and expect the package name above.

### Quickstart 1: seal and open offline (Python) {#quickstart-python}

Run on 27 October 2026 against the published 0.1.0 wheel. No network, no account. Two recipients, associated data, and a check that another purpose does not open the envelope.

```python
import qoreseal as qs

alice = qs.generate_seal_keys()
bob = qs.generate_seal_keys()

envelope = qs.seal_envelope(
    "qorechain-diana", "invoice",
    [qs.recipient_of(alice), qs.recipient_of(bob)],
    b"amount due: 120 QOR",
    aad=b"invoice-42",
)
text = qs.envelope_to_text(envelope)  # "qoreseal:..."

plaintext = qs.open_envelope("qorechain-diana", "invoice", envelope, bob, aad=b"invoice-42")
assert plaintext == b"amount due: 120 QOR"
print(len(envelope), text[:20], plaintext)

# A different purpose never opens the envelope.
try:
    qs.open_envelope("qorechain-diana", "chat", envelope, bob, aad=b"invoice-42")
except qs.QoreSealError.Failure as e:
    print("other purpose:", e.code)
```

It printed `3403 qoreseal:UVNFTAEBAgE b'amount due: 120 QOR'` and then `other purpose: DECRYPTION_FAILED`. The length is 56 + 2 x 1,664 + 19 = 3,403 bytes.

### Quickstart 2: seal and open offline (Go) {#quickstart-go}

Run against v0.1.0 from the Go module proxy.

```go
package main

import (
	"fmt"

	qoreseal "github.com/qorechain/qoreseal/go"
)

func main() {
	alice, _ := qoreseal.GenerateSealKeys()
	auditor, _ := qoreseal.GenerateSealKeys()

	envelope, err := qoreseal.Seal(qoreseal.SealArgs{
		ChainID:    "qorechain-diana",
		Purpose:    "invoice",
		Recipients: []qoreseal.SealRecipient{qoreseal.RecipientOf(alice), qoreseal.RecipientOf(auditor)},
		Plaintext:  []byte("120 QOR due on 2026-11-30"),
		AAD:        []byte("invoice-42"),
	})
	if err != nil {
		panic(err)
	}
	plaintext, err := qoreseal.Open(qoreseal.OpenArgs{
		ChainID: "qorechain-diana", Purpose: "invoice", Envelope: envelope, Keys: auditor, AAD: []byte("invoice-42"),
	})
	fmt.Println(len(envelope), string(plaintext), err)
}
```

It printed `3409 120 QOR due on 2026-11-30 <nil>`.

Rust, Swift and Kotlin use the same calls (`seal`, `open`, `generate_seal_keys` and so on, with the casing of the language). Their examples were not run for this page.

### Quickstart 3: a private group with epochs (Python, offline) {#quickstart-group}

Follows the repository example `examples/private-rollup`. Alice and bob start at epoch 1, carol joins (epoch 2), bob is removed (epoch 3). Bob can read epoch 1 but not epoch 3.

```python
import qoreseal as qs

chain_id, rollup_id = "qorechain-diana", "demo-private-rollup"
purpose = f"epoch-key:{rollup_id}"
alice, bob, carol = qs.generate_seal_keys(), qs.generate_seal_keys(), qs.generate_seal_keys()

mgr = qs.EpochKeyManager(chain_id, purpose, [
    qs.GroupMember(id="alice", recipient=qs.recipient_of(alice)),
    qs.GroupMember(id="bob", recipient=qs.recipient_of(bob)),
])
bob_keys = [qs.open_epoch_key(chain_id, purpose, mgr.distribution(), bob)]  # epoch 1

b1 = mgr.seal_batch(rollup_id, 1, b'{"txs":["alice pays bob 5"]}')
mgr.add_member("carol", qs.recipient_of(carol))   # epoch 2
mgr.remove_member("bob")                          # epoch 3
b3 = mgr.seal_batch(rollup_id, 3, b'{"txs":["alice pays carol 1"]}')

print(qs.open_batch(b1.blob, bob_keys).data)      # bob read epoch 1
try:
    qs.open_batch(b3.blob, bob_keys)              # bob was removed before epoch 3
except qs.QoreSealError.Failure as e:
    print("bob, epoch 3:", e.code)
print(b3.ciphertext_commitment.hex(), b3.plaintext_commitment.hex())
```

It printed bob's epoch 1 batch, then `bob, epoch 3: UNKNOWN_EPOCH`, then the two commitments (random on every run).

To anchor a sealed batch with the [RDK](/rollups/overview), the encrypted blob is the native data-availability blob and its SHA-256 is the batch `data_hash` (TypeScript, from the repository guide; not run for this page):

```ts
import { buildDaBlob, submitBatchMsg } from "@qorechain/rdk";

const codec = new PrivateBatchCodec("my-rollup", mgr);
const sealed = codec.seal(batchIndex, batchBytes);
const blob = buildDaBlob({ data: sealed.blob, maxBlobSize: params.maxDaBlobSize });
const msg = submitBatchMsg({ sequencer, rollupId: "my-rollup", batchIndex, stateRoot, txCount, dataHash: blob.dataHash });
```

See [Data availability](/rollups/data-availability) for how rollup batches are posted.

### Encrypt to an address on testnet {#encrypt-to-address}

You need a `qorechain-diana` account you control with a little testnet QOR and a registered ML-DSA-87 key (the QoreSign example `register-and-send` registers one). Use a testnet mnemonic, never a mainnet one, and never the public test phrase with funds. This flow is described from the repository guide and was not run for this page.

1. Derive the keys from the account mnemonic: `deriveSealKeys({ mnemonic })` (index 0). The mnemonic is also their backup.
2. Publish the ML-KEM-1024 key: `buildRegisterKemKeyMessage({ sender: address, mlkemPublicKey: sealKeys.mlkemPublicKey })`, put it in a transaction body, sign it with QoreSign `signHybrid`, simulate with `simulateTx` and send with `submitWithSignBytesFallback`. On a refusal, `describeKemRegistryError(res.codespace, res.code)` explains it.
3. Check it: `GET https://api-testnet.qore.host/qorechain/pqc/v1/kem/<address>`. It answers `{"found":false,"key":null}` for an account that has not published a key.
4. Sign a recipient card: `signRecipientCard({ chainId: "qorechain-diana", address, keys: sealKeys, classicalKey, pqKey })`, and publish it where senders can fetch it.
5. Sender side: `sealToAddresses({ rest: "https://api-testnet.qore.host", chainId: "qorechain-diana", purpose: "note", recipients: [{ address, card }], plaintext })`. Without a card, pass `mode: "mlkem"`.
6. Recipient side: `open({ chainId: "qorechain-diana", purpose: "note", envelope, keys: sealKeys })`.

The complete runnable flow is the repository example `examples/register-and-encrypt`. Mainnet applied v3.2.5 on 29 October 2026; check the example's own README for the release that lifts its mainnet guard. Go offers the same sender side with `network.NewClient(rest).SealToAddresses(ctx, network.SealToArgs{...})`. Rust, Swift, Kotlin and Python are offline: read `/qorechain/pqc/v1/kem/{address}` and `/qorechain/pqc/v1/account/{address}` yourself, verify the card (`verify_recipient_card`), then seal.

### Main API {#api}

Names are in TypeScript form. Go uses Go casing (`Seal`, `Open`, `NewEpochKeyManager`), Rust and Python use snake_case. In Python, Swift and Kotlin, `seal` and `open` are `seal_envelope` / `sealEnvelope` and `open_envelope` / `openEnvelope`.

| Name | What it does | Where |
|---|---|---|
| `generateSealKeys` | random key pair (ML-KEM-1024 + X25519) | all |
| `deriveSealKeys` | key pair from a BIP-39 mnemonic, optional passphrase and index | all |
| `sealKeysFromSeed`, `sealSeedFromMnemonic` | restore from the 32-byte seed; seed from a mnemonic | all |
| `recipientOf` | public recipient from a key pair | all |
| `validateMlkemPublicKey`, `validateX25519PublicKey` | input checks (the chain applies the same ML-KEM check) | all |
| `seal` | encrypt to 1 to 1,024 recipients (`mode`, `aad`, `anonymous`) | all |
| `open` | decrypt with a key pair | all |
| `parseEnvelope`, `envelopeSize` | inspect an envelope; compute its size | all |
| `envelopeToText`, `envelopeFromText` | `qoreseal:` text form | all |
| `signRecipientCard`, `verifyRecipientCard` | create and check the recipient card | all |
| `recipientCardText`, `recipientCardFields`, `assembleRecipientCard` | build a card when signing elsewhere, for example in a wallet UI | all |
| `buildRegisterKemKeyMessage`, `buildRemoveKemKeyMessage` | registry messages, to be signed hybrid with QoreSign | all |
| `describeKemRegistryError` | explains codespace `pqc` codes 250 to 254 | all |
| `EpochKeyManager` | epoch keys for a group: `addMember`, `removeMember`, `rotate`, `distribution`, `exportKeys`, `keyFor`, `members`, `epoch` | all |
| `sealEpochKey`, `openEpochKey` | send or receive an epoch key (for example history for a newcomer) | all |
| `PrivateBatchCodec`, `sealBatch`, `openBatch`, `parseBatchHeader`, `batchSize` | encrypted batches with commitments | all |
| `fetchKemKey`, `fetchMlkemPublicKey` | read an account's ML-KEM key from REST | TypeScript, Go network package |
| `resolveRecipient` | keys on chain plus card, verified, as a recipient | TypeScript, Go network package |
| `sealToAddresses` | seal to accounts by address | TypeScript, Go network package |

The network helpers are `@qorechain/qoreseal/network` in TypeScript and `github.com/qorechain/qoreseal/go/network` in Go. Lower-level building blocks are exported as well (`mlkemEncapsulate`, `mlkemDecapsulate`, `x25519Agree`, `hybridSharedSecret`, `deriveKey`, `kdfInfo`, `recipientHint`). Functions named for testing (`sealWithEntropy`, `testing_*`) exist to reproduce the test vectors and must never be used with real data.

Python errors raise `QoreSealError.Failure` with a stable `code`; Go errors compare with `qoreseal.IsCode`.

## How to access {#how-to-access}

| | Mainnet `qorechain-vladi` | Testnet `qorechain-diana` |
|---|---|---|
| KEM key registry | live since v3.2.5 (applied 29 October 2026, height 3,906,833); read route verified, see below | live |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` (chain ID 9801) | `https://evm-testnet.qore.host` (chain ID 9800) |

On 30 October 2026 the registry query answered `{"found":false,"key":null}` for an account with no key on both networks (on 27 October mainnet still answered "Not Implemented"). A search of mainnet transactions on 30 October found no `MsgRegisterKEMKey` yet, so publishing a key on mainnet has not been exercised end to end by this page.

- Offline sealing and opening, including auditor keys passed directly, private groups and batches, need no network and no account.
- Encrypting to an address needs the recipient to have published an ML-KEM-1024 key to the registry and, for hybrid mode, a recipient card.
- Publishing a key needs an account with testnet QOR (on mainnet, QOR), a registered ML-DSA-87 key, and QoreSign to sign the transaction hybrid. The fee floor is 0.1 uqor per gas. Get testnet QOR from the [Faucet](/dashboard/faucet).
- Mainnet registration is accepted only by a chain that has the registry; if a refusal with code 250 appears, the registry is not enabled on that chain.

## Where it is published {#where-published}

Checked on 27 October 2026 against each registry.

| Registry | Package | Version | Link |
|---|---|---|---|
| crates.io | `qorechain-qoreseal` | 0.1.0 | [crates.io/crates/qorechain-qoreseal](https://crates.io/crates/qorechain-qoreseal) |
| Go module proxy | `github.com/qorechain/qoreseal/go` | v0.1.0 (tag `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoreseal/go) |
| PyPI | `qorechain-qoreseal` | 0.1.0 (wheels for macOS arm64 and x86_64, Linux x86_64 and aarch64, plus source) | [pypi.org/project/qorechain-qoreseal](https://pypi.org/project/qorechain-qoreseal/) |
| Swift Package Manager | `QoreSeal` from `github.com/qorechain/qoreseal` | 0.1.0 (binary `QoreSealFFI.xcframework.zip` on the GitHub release) | [release v0.1.0](https://github.com/qorechain/qoreseal/releases/tag/v0.1.0) |
| Maven Central | `io.github.qorechain:qoreseal` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) |
| Maven Central | `io.github.qorechain:qoreseal-android` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) |
| npm | `@qorechain/qoreseal` | not published yet (coming) | |

Projects that use either Maven artifact need the Kotlin 2.3 or later compiler. The Kotlin/JVM artifact bundles native libraries for macOS (arm64, x86_64), Linux (x86_64, arm64) and Windows (x86_64); the Android artifact covers arm64-v8a, armeabi-v7a and x86_64.

Source: [github.com/qorechain/qoreseal](https://github.com/qorechain/qoreseal) (release v0.1.0). Licence Apache-2.0.

## Limits and known issues {#limits}

- **The payload content is what is protected.** Sender and recipient addresses, bank transfer amounts, transaction timing, envelope sizes and the number of recipients stay public on chain.
- **Not private transactions.** QoreSeal does not hide who transacts with whom, or how much.
- **No zero-knowledge proofs.** Nothing proves anything about the encrypted data; in a private sidechain, verifiers outside the group cannot check what happens inside a batch.
- **Envelopes are not signed.** Anyone can encrypt to an address, and any recipient of a multi-recipient envelope could build a different envelope for the others. Sign the content or the envelope (QoreSign `signMessage`) when the sender must be authenticated.
- **Every recipient reads the whole payload.** There is no per-recipient redaction; seal separate envelopes for different readers.
- **Hints are not anonymity.** Anyone who knows a candidate's public key (it is on chain) can test whether that key is a recipient. `anonymous: true` zeroes the hints; recipients then try every entry.
- **Key loss means data loss.** There is no recovery on chain. Losing the seed or mnemonic loses everything sealed to that key.
- **Removing or rotating a key does not erase or re-encrypt anything.** Data sealed to an old key stays readable by whoever holds it; keep old seeds or indexes.
- **Removed group members** keep the keys of the epochs they belonged to. New members read from their joining epoch on unless older keys are sealed to them.
- **Chain id and purpose are not in the envelope;** the recipient must know them.
- **Mainnet registry:** the read route is live since v3.2.5; no key had been published on mainnet when this was checked, and the EVM JSON-RPC `qor_` namespace is not exposed on `evm.qore.host` (use the REST route).
- **Pre-1.0, construction pending external review.** Minor versions may change the API. Read the specification before relying on it.
- **No npm package yet** and no Python wheel for Windows yet.

## Security notes {#security}

- Secret keys never leave the device or server running QoreSeal. The chain stores the ML-KEM-1024 public key alone, and the card carries the X25519 public key.
- Back up the account mnemonic, a dedicated mnemonic, or the 32-byte seed (`keys.seed`), encrypted at rest. Never export the ML-KEM secret key on its own; export the seed or mnemonic.
- Rotation: move to the next index, register the new ML-KEM key, sign a new card. Old cards stop verifying automatically.
- Add a recovery recipient (an offline key) to data that must survive the loss of a user's key. Treat it like an auditor key, since it reads everything it is added to.
- For groups, `exportKeys()` holds every epoch key. Seal that export to the operator's own key and an offline recovery key, and keep it off the sequencer machine. Rotate epoch keys on a schedule.
- `mlkem` mode must be chosen explicitly; hybrid never degrades silently.
- Primitives come from the [`qorechain-pqc`](/developer-tools/pqc-library) bindings and from established libraries (noble for TypeScript, RustCrypto crates, the Go standard library); account signatures come from [QoreSign](/qoresign/overview).
- Report vulnerabilities privately to security@qore.network. On-chain metadata being public is by design and is a documentation topic, not a vulnerability.

## Related pages {#related}

- [QoreSign](/qoresign/overview): hybrid signing for the registration transaction, and message signing behind recipient cards and signed envelopes.
- [RDK overview](/rollups/overview) and [Data availability](/rollups/data-availability): anchoring encrypted batches of a private sidechain.
- [PQC library](/developer-tools/pqc-library): the ML-KEM-1024 bindings under QoreSeal.
- [Post-quantum security](/architecture/post-quantum-security) and [Post-quantum signing](/developer-guide/post-quantum-signing): how accounts and keys work on chain.
- [Developer packages overview](/developer-tools/overview).
