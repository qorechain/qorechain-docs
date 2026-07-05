---
slug: /sdk/concepts/accounts-pqc
title: Accounts & PQC Signing
sidebar_label: Accounts & PQC
sidebar_position: 2
---

# Accounts & PQC signing

QoreChain accounts are derived from a single BIP-39 mnemonic. There are two
account models, both fully supported:

- **Per-lane HD derivation (legacy/default)** — the same mnemonic yields a
  native (coin type 118), an EVM (coin type 60), and an SVM (coin type 501)
  account via independent derivation paths. Three keys, three addresses.
- **Unified eth-native accounts** (SDK 0.6.0, chain v3.1.83) — ONE
  `eth_secp256k1` key is ONE 20-byte identity rendered as all three address
  encodings, with one shared balance. See
  [Unified accounts](#unified-accounts).

## HD derivation (legacy/default, coin type 118)

```ts
import {
  generateMnemonic,
  validateMnemonic,
  deriveNativeAccount,
  deriveEvmAccount,
  deriveSvmAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words; pass 256 for 24 words

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (secp256k1, bech32)

const evm = await deriveEvmAccount(mnemonic);
console.log(evm.address); // "0x..."   (EIP-55 checksummed)

const svm = await deriveSvmAccount(mnemonic);
console.log(svm.address); // base58 ed25519 public key
```

The mnemonic is validated (words **and** checksum) before any key is derived, so
a typo raises rather than silently producing a wrong account. You can validate
explicitly with `validateMnemonic(mnemonic)`.

### Derivation schemes

| Type | Curve | Path | Address |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | bech32 `qor` of `ripemd160(sha256(pubkey))` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | base58 of the 32-byte public key |

Pass an account index to derive additional accounts. In TypeScript:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

In Python/Go/Rust the index is a positional argument
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Known-answer note

The derivation schemes are deterministic and covered by known-answer tests
across all four SDKs, so the same mnemonic produces identical addresses in
TypeScript, Python, Go, and Rust. This lets you derive in one language and verify
in another.

> This per-lane derivation (`deriveNativeAccount` at coin type 118, plus
> `deriveEvmAccount` / `deriveSvmAccount`) is the **legacy/default** model and
> remains supported and unchanged. Unified accounts below are an additional,
> opt-in identity model.

## Unified accounts (eth-native) {#unified-accounts}

Since SDK **0.6.0** (chain v3.1.83), `deriveUnifiedAccount(mnemonic, index = 0)`
derives ONE `eth_secp256k1` key on the Ethereum HD path `m/44'/60'/0'/0/{index}`
whose 20 address bytes (`keccak256(pubkey)[12:]`) are the SAME identity rendered
three ways:

| Lane | Encoding |
| --- | --- |
| Native | bech32 with the `qor` prefix (`qor1…`) |
| EVM | `0x` + EIP-55 mixed-case checksum hex |
| SVM | base58 of the 20 bytes right-padded with 12 zero bytes (32 bytes) |

A deposit to **any** of the three lands in **one** balance, and the key spends
on every lane:

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  addressesFrom20,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);

account.cosmos;       // "qor1…"   bech32, Native lane
account.evm;          // "0x…"     EIP-55 hex, EVM lane
account.svm;          // "<base58>" 32-byte SVM address (addr20 + 12 zero bytes)
account.addressBytes; // the raw 20 bytes shared by all three
account.publicKey;    // 33-byte compressed secp256k1 public key
account.pqc;          // { publicKey, secretKey } — ML-DSA-87, derived below

// Decode any ONE encoding into all three:
const all = qoreAddresses({ evm: account.evm });
all.cosmos; // qor1…
all.svm;    // base58

// or straight from the raw 20 bytes:
const same = addressesFrom20(account.addressBytes);
```

`unifiedAccountFromSeed(seed32)` does the same from a raw 32-byte secp256k1
private key.

### The PQC seed derivation

The account's ML-DSA-87 keypair is derived deterministically and
**address-bound**:

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

so it is recoverable from `{ address, mnemonic }` and identical across all of
QoreChain's language SDKs. (For `unifiedAccountFromSeed`, the mnemonic slot is
`"seed:" + hex(seed32)`.)

### Sending on the Native lane with the eth key

A unified account signs Native-path transactions with the `eth_secp256k1`
scheme: the classical signature is secp256k1 over **keccak256** of the SignDoc
bytes (not sha256), and the `SignerInfo` public key uses the type URL
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. The hybrid path
(`signHybridEth`) additionally attaches the ML-DSA-87 `PQCHybridSignature`
extension — required on the live networks:

```ts
import { EthNativeSigner, deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
const signer = new EthNativeSigner(account); // signMode: "hybrid" by default

// `transport` is anything with broadcastTx (e.g. a connected client).
await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: "1000000" }], // 1 QOR
  { chainId: "qorechain-vladi", accountNumber, sequence, fee },
);
```

For lower-level control, `signHybridEth(params)` / `signClassicalEth(params)`
return the assembled `TxRaw` bytes and the signing artifacts, and
`accountAuthInfo(baseAccount)` reads `account_number` / `sequence` from an
account whose on-chain pubkey uses the `eth_secp256k1` type URL. The
classical-only path is for the one-time, bootstrap-exempt
`MsgRegisterPQCKeyV2`; use hybrid for everything else.

:::caution Upgrade to SDK 0.6.1+ for hybrid transactions
SDK **0.6.1** fixed a consensus-critical encoding bug: the
`/qorechain.pqc.v1.PQCHybridSignature` tx-body extension was JSON-serialized
into `Any.value`, and the chain **rejected those transactions at CheckTx**
(a tx parse error). It is now protobuf-encoded (the extension value begins
with `0x08`) in all five languages. Any hybrid transaction — including the
eth-native lane — built with SDK ≤ 0.6.0 is rejected on-chain: upgrade to
0.6.1 or later.
:::

### Phantom (P1a): a unified account without exporting a key

`connectPhantomUnified()` (TypeScript) derives a canonical, **non-custodial**
unified account from a deterministic Phantom signature: the user signs a fixed,
domain-separated message with Phantom's ed25519 key, and
`shake256(signature, 32)` seeds the account.

```ts
import {
  connectPhantomUnified,
  unifiedAccountFromPhantomSignature,
} from "@qorechain/sdk";

// In the browser (uses window.solana):
const account = await connectPhantomUnified();

// Or, given a raw signature you already have:
const same = unifiedAccountFromPhantomSignature(signatureBytes);
```

The derived account is a separate canonical key from the Phantom ed25519 key —
Phantom never sees the derived secp256k1/PQC secrets. To let the Phantom key
itself spend from the account under limits, see
[Authenticators & delegated spending](/sdk/guides/authenticators).

## Post-quantum cryptography (PQC)

QoreChain supports **ML-DSA-87** (Dilithium-5, FIPS 204) signatures. The SDK
exposes the primitives directly.

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  ML_DSA_87_PUBLIC_KEY_LENGTH,
  ML_DSA_87_SIGNATURE_LENGTH,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("hello");

const signature = pqcSign(keypair.secretKey, message);
const ok = pqcVerify(keypair.publicKey, message, signature);
```

The exported length constants (`ML_DSA_87_PUBLIC_KEY_LENGTH`,
`ML_DSA_87_SECRET_KEY_LENGTH`, `ML_DSA_87_SIGNATURE_LENGTH`,
`ML_DSA_87_SEED_LENGTH`) let you validate buffer sizes.

> Underneath, the PQC primitives come from [**qorechain-pqc**](/developer-guide/post-quantum-signing) — the open-source, standards-only library that wraps audited FIPS-204/203/202 implementations behind one consistent API in six languages (JavaScript/TypeScript, Rust, Go, C, Python, Java). Reach for it directly when you need the raw primitives or `hybridSignBytes` framing outside the SDK.

### Pluggable signers

For composition, the SDK provides a `Signer` abstraction plus `PqcSigner` and
`HybridSigner` implementations, and a `SignatureMode` enum. Use these when you
want to plug PQC signing into your own flow rather than calling the primitives
directly.

## Hybrid signing {#hybrid-signing}

A **hybrid** transaction carries both a classical secp256k1 signature and an
ML-DSA-87 signature, so it remains valid under classical verification while
gaining post-quantum protection. The post-quantum part travels as a
`PQCHybridSignature` extension on the transaction.

:::caution Hybrid signing is required on the Native path
As of the current chain version (**v3.1.85**), the network default is
`hybrid_signature_mode = required` with `allow_classical_fallback = false`.
Hybrid signing via `buildHybridTx` (with `includePqcPublicKey`) — or
`signHybridEth` for unified eth-native accounts — is **mandatory** for
Native-path transactions; classical-only Native transactions are rejected
on-chain. EVM transactions use a separate `eth_secp256k1` path and are
unaffected.
:::

:::caution SDK ≤ 0.6.0 hybrid transactions are rejected
The 0.6.1 release fixed the encoding of the `PQCHybridSignature` extension
(JSON → protobuf, consensus-critical). Hybrid transactions built with SDK
0.6.0 or earlier fail at CheckTx with a tx parse error — upgrade to 0.6.1+.
:::

```ts
import {
  buildHybridTx,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// buildHybridTx assembles a tx with BOTH a classical signature and an
// ML-DSA-87 signature attached as a PQCHybridSignature extension.
// (See packages/ts and the pqc-hybrid-sign example for the full call.)
```

### On-chain prerequisite

Before a hybrid transaction will PQC-verify on-chain, the signer's PQC public
key must be **registered** via the chain's `MsgRegisterPQCKey` — *unless* you set
`includePqcPublicKey: true`, which embeds the key in the extension so the chain
can auto-register it on first use.

### Hybrid tx contract (high level)

The transaction is signed classically over the standard sign bytes (which
**exclude** the PQC extension), and the ML-DSA-87 signature is computed and
attached as the `PQCHybridSignature` extension. Because the classical sign bytes
exclude the extension, the classical signature stays valid whether or not a
verifier understands the PQC part. The lower-level helpers
(`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) and the end-to-end
builders (`buildHybridTx`, `signAndBroadcastHybrid`) are exported for advanced
use.

> Hybrid transaction submission is the required path on the live network for
> cosmos transactions. The local sign/verify primitives and tx-building helpers
> are available today.

## PQC key rotation

Since SDK 0.7.0 an account can rotate its ML-DSA-87 key to a new key of the
**same algorithm** — canonically migrating a legacy `shake256(mnemonic)` key to
the address-bound `shake256("qorechain:pqc:v1|addr|mnemonic")` key — via
`rotatePqcKeyMsgFromMnemonic` (both keys dual-sign the rotation bytes). See
[Key rotation](/sdk/guides/authenticators#key-rotation) in the Authenticators
guide for a full example.

## Algorithm identifiers

The SDK exports algorithm IDs and helpers for protocol-level work:
`AlgorithmUnspecified`, `AlgorithmDilithium5`, `AlgorithmMLKEM1024`,
`algorithmName(id)`, and `isSignatureAlgorithm(id)`.
