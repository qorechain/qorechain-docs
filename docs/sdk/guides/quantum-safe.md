---
slug: /sdk/guides/quantum-safe
title: Quantum-safe by Default
sidebar_label: Quantum-safe
sidebar_position: 6
---

# Quantum-safe by default

QoreChain treats post-quantum cryptography as a **first-class** signature scheme.
An account registers an **ML-DSA-87 (Dilithium-5, NIST FIPS 204)** key on-chain,
after which its transactions can carry a **hybrid** signature — the usual
classical secp256k1 signature **plus** an ML-DSA-87 signature. The chain's ante
handler verifies both, so a quantum-safe account stays fully compatible with
classical verification while gaining protection against a future quantum
adversary.

The SDK packages this into a tiny, idempotent surface so a dApp becomes
**quantum-safe by default**: one call to be PQC-protected. On the live networks
this is not optional for Native-path transactions: the key must be registered
**explicitly** (there is no auto-registration on the first transaction), and every
Native-path transaction must then carry the hybrid signature.

## Check status {#check-status}

`isPqcRegistered` / `getPqcStatus` read whether an address has a registered PQC
key via the `qor_getPQCKeyStatus` JSON-RPC method. They accept either a
`QorClient` or the composed client from `createClient`. **The public endpoints
do not serve the `qor_` namespace** (see
[the `qor_` namespace](/api-reference/json-rpc-qor_-namespace)), so against
`*.qore.host` those helpers fail with JSON-RPC error `-32601`. Read the status
over REST instead:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

async function isPqcRegistered(address: string): Promise<boolean> {
  const res = await client.rest.get<{ found: boolean }>(
    `/qorechain/pqc/v1/account/${address}`,
  );
  return res.found;
}
```

The route is `GET /qorechain/pqc/v1/account/{address}` (singular `account`). It
answers `{"found": true, "account": {…}}` for a registered address and
`{"found": false, "account": null}` otherwise. Do not use `client.rest.getPqcAccount`
for this: it calls the plural `/accounts/` path, which the chain does not serve.

`isPqcRegistered(client, address)` and `getPqcStatus(client, address)` (with the
`statusSource` option) remain the right calls against a node that serves the `qor`
namespace; their result is
`{ registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }`.

The same status is also readable on the EVM side via the
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
precompile at `0x0000000000000000000000000000000000000A02` (exposed as
`pqcKeyStatus` in `@qorechain/evm`) once that precompile is active; it is not
active yet on mainnet or testnet (see
[Network status](/developer-guide/evm-precompiles#network-status)). The next SDK
patch release falls back to the REST route above when given a client that exposes
`.rest` (such as the composed client), and throws instead of reporting "not
registered" when the status cannot be read.

## Register in one call

`ensurePqcRegistered` makes an account quantum-safe. It builds and broadcasts
`MsgRegisterPQCKeyV2` with the signer's ML-DSA-87 public key and the account's
ECDSA public key. It is **idempotent** when you give it a pre-read `status` (or a
`statusSource`): it skips the registration when the key is already registered, so
it is safe to call on every app start.

Registration is classical-signed and exempt from the hybrid requirement, so a new
account can bootstrap its first key. It signs through a CosmJS signer, that is, a
coin-type-118 account (`deriveNativeAccount`); for a unified eth-native account
sign the registration with `EthNativeSigner` and `signMode: "classical"` (see
[Accounts & PQC signing](/sdk/concepts/accounts-pqc#hybrid-signing)). The 2,592-byte
key needs a gas limit of about 600,000; the network's minimum gas price is 0.1 uqor
per unit of gas.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const tx = await client.connectTx(signer);

// The address-bound key, recoverable from { address, mnemonic } (SDK 0.8.3+).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// Read the status over REST: the default status source needs the `qor_` namespace.
const { found } = await client.rest.get<{ found: boolean }>(
  `/qorechain/pqc/v1/account/${account.address}`,
);

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

## Sign hybrid

`migrateToHybrid` ensures registration and hands back a hybrid send path with the
keypair pre-bound to the existing `buildHybridTx` / `signAndBroadcastHybrid`
builders. Pass `rest` so the SDK can resolve which hybrid sign-bytes form the
network verifies (see
[Which sign-bytes form?](/sdk/concepts/accounts-pqc#sign-bytes-versions)):

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await hybrid.signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,          // classical secp256k1 direct signer
  messages,
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

The chain accepts any valid FIPS-204 ML-DSA-87 signature, hedged or
deterministic. The SDK signs deterministically by default (since 0.5.1) so a
transaction always has the same signature and tx hash. If a hybrid tx fails with
`pqc` code 21 (`hybrid_verify_failed`), the cause is the sign-bytes version, the
chain-id, a stale PQC library or an unregistered or different key, never hedged
signing: see [Troubleshooting code 21](/developer-guide/post-quantum-signing#code-21).

## Rotate a key

To replace an account's ML-DSA-87 key with another key of the **same** algorithm
(for example moving a legacy `shake256(mnemonic)` key to the canonical address-bound
key, or retiring a compromised key), build a `MsgRotatePQCKey` with
`rotatePqcKeyMsgFromMnemonic`; both keys dual-sign it. See
[Key rotation](/sdk/guides/authenticators#key-rotation) for the full example.

`migratePqcKey` broadcasts the older `MsgMigratePQCKey`, which moves an account
between **algorithms** and needs both signatures supplied by the caller:

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## In the UI

The [`@qorechain/react`](/sdk/guides/react) kit surfaces all of this in React: the
`usePqcStatus` hook and the `<QuantumSafeBadge/>` component show a **Quantum-safe**
indicator whenever the connected account has a registered PQC key. Both read the
status through `getPqcStatus`, so against the public endpoints (no `qor_`
namespace) they cannot confirm a key today; see the live-network limits on the
React page.
