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

A deposit to **any** of the three lands in **one** balance, and the one key is
the signer on every lane (on the EVM lane inside an
[authorization window](/sdk/guides/evm#evm-window); the SVM transaction lane is
currently disabled network-wide, so SVM is read-only today):

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
account.publicKey;    // "0x…" hex string of the 33-byte compressed secp256k1 key
account.privateKey;   // "0x…" hex string (a secret: never log or commit it)
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
`"seed:" + hex(seed32)`.) Since SDK 0.8.3 `derivePqcCanonical(account, mnemonic)`
first resolves `account` to its lower-case `qor1…` form (`canonicalAccount`), so
an upper-case bech32 or the `0x` form of the same account yields the same key.
Every language has the same function (Python `derive_pqc_canonical`, Go
`authenticator.DerivePQCCanonical`, Rust `try_derive_pqc_canonical`, Java
`Authenticator.derivePqcCanonical`; see the
[table in the Quantum-safe guide](/sdk/guides/quantum-safe#canonical-derivation)),
and the same `{ address, mnemonic }` gives the same key in all of them (checked for
TypeScript, Python, Go and Rust in October 2026).

### Sending on the Native lane with the eth key

A unified account signs Native-path transactions with the `eth_secp256k1`
scheme: the classical signature is secp256k1 over **keccak256** of the SignDoc
bytes (not sha256), and the `SignerInfo` public key uses the type URL
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. The hybrid path
(`signHybridEth`, or `EthNativeSigner` with its default `signMode: "hybrid"`)
additionally attaches the ML-DSA-87 `PQCHybridSignature` extension, which is
required on the live networks.

Two things are needed before the first hybrid send. First, the account's ML-DSA-87
key must be **registered** (once). Registration is the one classical-signed,
hybrid-exempt transaction: sign it with `signMode: "classical"`. The account's
`publicKey` is a `0x` hex string, so decode it to bytes for `ecdsaPubkey`. Second,
pass `rest` to the signer so it can ask the network which
[sign-bytes form](#sign-bytes-versions) it verifies (on `qorechain-vladi` and
`qorechain-diana` it throws instead of guessing). Needs SDK 0.8.1 or later (0.9.0
for the proof of possession helpers) and `npm i @cosmjs/stargate`:

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  buildRegisterPqcKeyMsg,
  signProofOfPossession,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";
const CHAIN_ID = "qorechain-vladi";

const client = createClient({ network: "mainnet", endpoints: { rest: REST, rpc: RPC } });
const transport = await StargateClient.connect(RPC);
const account = await deriveUnifiedAccount(mnemonic);

// The REST account record carries the number and sequence (the account must
// exist, that is, have received funds).
async function authInfo() {
  const { account: base } = await client.rest.get<{
    account: { account_number: string; sequence: string };
  }>(`/cosmos/auth/v1beta1/accounts/${account.cosmos}`);
  return { accountNumber: BigInt(base.account_number), sequence: BigInt(base.sequence) };
}

// 1) Register the ML-DSA-87 key once (classical-signed, exempt from the hybrid rule).
const classical = new EthNativeSigner(account, { signMode: "classical" });
await classical.signAndBroadcast(transport, {
  chainId: CHAIN_ID,
  ...(await authInfo()),
  messages: [
    buildRegisterPqcKeyMsg(account.cosmos, {
      pqcKeypair: account.pqc,
      ecdsaPubkey: Uint8Array.from(Buffer.from(account.publicKey.slice(2), "hex")),
      // Optional since v3.2.3 (SDK 0.9.0+): the new key signs a proof that its owner
      // holds the secret. Leave it out on a network that has not applied v3.2.3,
      // because an older node refuses the whole transaction when the field is set.
      proofOfPossession: signProofOfPossession({
        chainId: CHAIN_ID,
        account: account.cosmos,
        keypair: account.pqc,
      }),
    }),
  ],
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" }, // the 2,592-byte key needs about 600k gas
});

// 2) Send with the hybrid signature (the default signMode).
const signer = new EthNativeSigner(account, { rest: REST });
const res = await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: toBase("1.5") }],
  {
    chainId: CHAIN_ID,
    ...(await authInfo()),
    fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  },
);
console.log(res.transactionHash);
```

For lower-level control, `signHybridEth(params)` / `signClassicalEth(params)`
return the assembled `TxRaw` bytes and the signing artifacts, and
`accountAuthInfo(baseAccount)` reads `account_number` / `sequence` from a
protobuf `BaseAccount` whose on-chain pubkey uses the `eth_secp256k1` type URL
(a REST JSON account needs its fields mapped first, as `authInfo` does above).

:::caution Upgrade to SDK 0.6.1+ for hybrid transactions
SDK **0.6.1** fixed a consensus-critical encoding bug: the
`/qorechain.pqc.v1.PQCHybridSignature` tx-body extension was JSON-serialized
into `Any.value`, and the chain **rejected those transactions at CheckTx**
(a tx parse error). It is now protobuf-encoded (the extension value begins
with `0x08`) in all five languages. Any hybrid transaction — including the
eth-native lane — built with SDK ≤ 0.6.0 is rejected on-chain: upgrade to
0.6.1 or later.
:::

### Phantom and other external wallets {#phantom}

:::danger Removed in SDK 0.8.0
SDK 0.6.0 to 0.7.0 shipped `connectPhantomUnified()` and `unifiedAccountFromPhantomSignature()` (removed in 0.8.0; Python and Rust: `unified_account_from_phantom_signature`, Go: `unified.UnifiedAccountFromPhantomSignature`, Java: `UnifiedAccounts.unifiedAccountFromPhantomSignature`), which derived an account's spend key from a Phantom signature over the fixed message `QoreChain unified account derivation v1` followed by the wallet's base58 public key.
An ed25519 signature is deterministic and any website can ask the wallet to sign that same message, so anyone who ever obtained the signature can rebuild the account's secp256k1 and ML-DSA keys. Both functions now throw.

If you created an account this way, treat it as compromised now: create a fresh mnemonic account, move the funds to it, and then link Phantom to the new account as an authenticator (below). The old account cannot be repaired, because its address is bound to the exposed key and a PQC key rotation replaces only the post-quantum half. Use SDK 0.8.2 or later.
:::

To let a Phantom (or MetaMask) key spend from an account, use the **authenticator lanes**: register the wallet key with `MsgRegisterAuthenticator`, then spend from the canonical PQC account through `MsgExecuteCosmos` / `MsgExecuteEVM` under a permission and a `SpendingRule`. The account keeps its own mnemonic-derived keys, and the wallet key can be revoked at any time. See [Authenticators & delegated spending](/sdk/guides/authenticators). Note that the `abstractaccount` module behind these lanes is switched off on mainnet (`GET /qorechain/abstractaccount/v1/config` shows `enabled: false`; it is enabled on the testnet), so a wallet key cannot be linked on mainnet yet; until it can, use the fresh mnemonic account directly.

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
`HybridSigner` implementations, and a `SignatureMode` type (`"classical" | "pqc" |
"hybrid"`). Use these when you
want to plug PQC signing into your own flow rather than calling the primitives
directly.

## Hybrid signing {#hybrid-signing}

A **hybrid** transaction carries both a classical secp256k1 signature and an
ML-DSA-87 signature, so it remains valid under classical verification while
gaining post-quantum protection. The post-quantum part travels as a
`PQCHybridSignature` extension on the transaction.

:::caution Hybrid signing is required on the Native path
Since chain version **v3.2.0** (mainnet runs v3.2.4, the testnet v3.2.6), the network
default is `hybrid_signature_mode = required` with
`allow_classical_fallback = false`. Hybrid signing via `buildHybridTx` /
`signAndBroadcastHybrid` (pass `rest`), or `signHybridEth` / `EthNativeSigner`
for unified eth-native accounts, is **mandatory** for Native-path transactions;
classical-only Native transactions are rejected on-chain. EVM transactions are a
separate lane, but since v3.2.0 they are admitted only from an account with a
registered ML-DSA-87 key and an open
[authorization window](/sdk/guides/evm#evm-window).
:::

:::caution SDK ≤ 0.6.0 hybrid transactions are rejected
The 0.6.1 release fixed the encoding of the `PQCHybridSignature` extension
(JSON → protobuf, consensus-critical). Hybrid transactions built with SDK
0.6.0 or earlier fail at CheckTx with a tx parse error — upgrade to 0.6.1+.
:::

The end-to-end builder for a coin-type-118 account is `signAndBroadcastHybrid`
(or `buildHybridTx` to build without broadcasting). It needs the classical signer,
the account's ML-DSA-87 keypair, the account number and sequence, and `rest`.
For a coin-type-118 account in TypeScript the shortest path is the hybrid
`TxClient` (SDK 0.9.0): pass the keypair when you connect and every transaction is
signed hybrid, with `fee: "auto"` simulating the hybrid transaction itself (the
registration alone stays classical):

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.host", rpc: "https://rpc.qore.host", evmRpc: "https://evm.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain

const tx = await client.connectTx(signer, { pqcKeypair });            // signs every transaction hybrid
await tx.bankSend("qor1recipient…", [{ denom: "uqor", amount: toBase("1.5") }]);
```

With explicit control over the fee, account number and sequence use
`signAndBroadcastHybrid` (SDK 0.8.1 or later, `npm i @cosmjs/stargate`):

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  signAndBroadcastHybrid,
  qorechainRegistry,
  MSG_SEND_TYPE_URL,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain
const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(account.address);            // { accountNumber, sequence }

const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [
    {
      typeUrl: MSG_SEND_TYPE_URL,
      value: {
        fromAddress: account.address,
        toAddress: "qor1recipient…",
        amount: [{ denom: "uqor", amount: toBase("1.5") }],
      },
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,        // lets the SDK pick the v1/v2 PQC sign-bytes form
  transport,
});
```

### On-chain prerequisite

Before a hybrid transaction will PQC-verify, the signer's PQC public key must be
**registered** with `MsgRegisterPQCKeyV2` (classical-signed, hybrid-exempt for an
account that has no key yet). The
SDK's `ensurePqcRegistered` / `buildRegisterPqcKeyMsg`, `qorechaind tx pqc
register-key`, or a QoreChain wallet do it. `includePqcPublicKey: true` only
embeds the key in the extension; it does **not** register it, and the chain does
not register a key on first use. Since v3.2.3 the chain refuses weak, degenerate
and reused keys and accepts an optional proof of possession (see
[Key integrity rules](/architecture/post-quantum-security#key-integrity)). In SDK
0.9.0 `ensurePqcRegistered` attaches the proof by itself once the network has
applied v3.2.3, and `signProofOfPossession` / `verifyProofOfPossession` are exported
for hand-built registrations; the 0.8.x builders register without a proof, which is
allowed.

### Which sign-bytes form? {#sign-bytes-versions}

The ML-DSA-87 half of a hybrid transaction is signed over one of two byte forms,
and a network verifies exactly one at any height:

```text
v1: BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
v2: "qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
```

`B0` is the transaction body without the PQC extension and `A` the `AuthInfo`
bytes. `qorechain-vladi` and `qorechain-diana` both verify **v2**. The switch was
recorded under the upgrade name `v3.2.0` on mainnet and under `v3.1.98` (then
`v3.2.0`) on the testnet, so a client must ask
`GET /cosmos/upgrade/v1beta1/applied_plan/{name}` for **both** names and use v2 if
either height is above zero. The SDK does this for you: every hybrid builder takes
`signBytesVersion` (`"auto"` by default, or `"v1"` / `"v2"`), and `"auto"` needs the
network's REST URL (`rest`) on these two chains: it throws rather than guess. The
high-level paths re-resolve and retry once when the chain refuses the signature
with `pqc` code 21. In unit tests pass `signBytesVersion` explicitly so the test
does not depend on a live node. See also
[Troubleshooting code 21](/developer-guide/post-quantum-signing#code-21).

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
