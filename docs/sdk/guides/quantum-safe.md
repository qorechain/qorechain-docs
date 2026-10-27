---
slug: /sdk/guides/quantum-safe
title: Hybrid Signing by Default
sidebar_label: Hybrid signing
sidebar_position: 6
---

# Hybrid signing by default

QoreChain treats post-quantum cryptography as a **first-class** signature scheme.
An account registers an **ML-DSA-87 (Dilithium-5, NIST FIPS 204)** key on-chain,
after which its transactions can carry a **hybrid** signature — the usual
classical secp256k1 signature **plus** an ML-DSA-87 signature. The chain's ante
handler verifies both, so an account with a registered key stays fully compatible with
classical verification while its transactions also carry a post-quantum signature.

The SDK packages this into a tiny, idempotent surface so a dApp signs
**hybrid by default**: one call registers the key. On the live networks
this is not optional for Native-path transactions: the key must be registered
**explicitly** (there is no auto-registration on the first transaction), and every
Native-path transaction must then carry the hybrid signature.

## Check status {#check-status}

`isPqcRegistered` / `getPqcStatus` read whether an address has a registered PQC
key. Given the composed client from `createClient` they read over REST
(`GET /qorechain/pqc/v1/account/{address}`, served by every public endpoint); given
a bare `QorClient` they use the `qor_getPQCKeyStatus` JSON-RPC method, which **the
public endpoints do not serve** (see
[the `qor_` namespace](/api-reference/json-rpc-qor_-namespace)), so against
`*.qore.host` pass the composed client. Releases before 0.9.0 always used the
`qor_` method and failed with JSON-RPC error `-32601`; read the REST route
directly there.

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

const registered = await isPqcRegistered(client, address); // boolean
const status = await getPqcStatus(client, address);
// { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

The route is `GET /qorechain/pqc/v1/account/{address}` (singular `account`). It
answers `{"found": true, "account": {…}}` for a registered address and
`{"found": false, "account": null}` otherwise; `client.rest.getPqcAccount(address)`
returns that body, and `fetchPqcStatus({ rest, address })` turns it into the status
above. An unreadable answer (an HTTP error, a transport failure) is thrown after one
retry: it is never read as "not registered". In 0.8.x `getPqcAccount` called a plural
`/accounts/` path that the chain does not serve.

The same status is also readable on the EVM side via the
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
precompile at `0x0000000000000000000000000000000000000A02` (exposed as
`pqcKeyStatus` in `@qorechain/evm`) once that precompile is active; it is not
active on mainnet, and it is listed as active on the testnet (checked 27 October 2026; see
[Network status](/developer-guide/evm-precompiles#network-status)).

## Register in one call {#register-in-one-call}

`ensurePqcRegistered` registers the account's ML-DSA-87 key. It builds and broadcasts
`MsgRegisterPQCKeyV2` with the signer's ML-DSA-87 public key. It is **idempotent**:
it reads the account's status first (over REST when you pass `rest`), skips the
registration when the account already holds this keypair's key, and is therefore
safe to call on every app start. When the account holds a *different* key it throws
`PqcKeyMismatchError` and sends nothing, because every hybrid transaction signed
with your keypair would be refused. It never registers blind: if the status cannot
be read it throws (pass `force: true` only for an account you know has no key).

Registration is classical-signed and exempt from the hybrid requirement, so a new
account can bootstrap its first key; since v3.2.3 that exemption covers only an
account with no key (an account that already holds one must hybrid-sign a register
or migrate, and the chain refuses weak, degenerate or reused keys). Once the network
has applied v3.2.3 the helper signs the optional **proof of possession** with the
new key and attaches it (it reads the chain id from `chainId` or from the node, and
leaves the field off on a network that has not applied v3.2.3, because an older node
refuses it). It signs through a CosmJS signer, that is, a coin-type-118 account
(`deriveNativeAccount`); for a unified eth-native account sign the registration with
`EthNativeSigner` and `signMode: "classical"` (see
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

// The address-bound key, recoverable from { address, mnemonic } (0.8.3+; see below).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// With the keypair the client signs every transaction hybrid; the registration
// itself stays classical (the chain's bootstrap path).
const tx = await client.connectTx(signer, { pqcKeypair });

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  rest: client.network.endpoints.rest,
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }

await tx.bankSend("qor1…", [{ denom: "uqor", amount: "1000000" }]); // hybrid-signed
```

### A key you can recover {#canonical-derivation}

`derivePqcCanonical(address, mnemonic)` derives the account's ML-DSA-87 key from its
address and mnemonic, so a lost device is recoverable and every language and wallet
derives the same key (one mnemonic, one key per account). It resolves the address to
its lower-case `qor1…` form first, so the `0x` form of a unified account gives the
same key. The equivalents:

| Language | Function | Published |
| --- | --- | --- |
| TypeScript | `derivePqcCanonical(address, mnemonic)` (`@qorechain/sdk`) | 0.9.0 |
| Python | `derive_pqc_canonical(address, mnemonic)` (`qorsdk`) | 0.9.0 |
| Go | `authenticator.DerivePQCCanonical(address, mnemonic)` | v0.9.0 |
| Rust | `authenticator::try_derive_pqc_canonical(address, mnemonic)` (returns a `Result`) | 0.9.0 |
| Java | `Authenticator.derivePqcCanonical(address, mnemonic)` | 0.9.0 |

The legacy derivation (`derivePqcLegacy`, `"bridge"`) is not bound to the account and
is deprecated for new keys; the rotation helpers refuse it as the new key (see
[Rotate a key](#rotate-a-key)).

Registration in Python (0.9.0; the status read goes over REST and the call raises
`PqcKeyMismatchError` for a different registered key instead of paying for a second
registration):

```python
import httpx
from qorsdk import derive_native_account, derive_pqc_canonical, ensure_pqc_registered, fetch_pqc_status

REST = "https://api.qore.host"
native = derive_native_account(mnemonic, 0)
pqc_keypair = derive_pqc_canonical(native.address, mnemonic)

print(fetch_pqc_status(REST, native.address))  # {'registered': False} for a new account

acct = httpx.get(f"{REST}/cosmos/auth/v1beta1/accounts/{native.address}").json()["account"]
result = ensure_pqc_registered(
    account=native,
    pqc_keypair=pqc_keypair,
    chain_id="qorechain-vladi",
    account_number=int(acct["account_number"]),
    sequence=int(acct.get("sequence", 0)),
    rest_url=REST,
    fee={"amount": [{"denom": "uqor", "amount": "60000"}], "gas": "600000"},
)
```

The Go (`pqcdx.Signer.RestURL`), Rust (`pqc_dx` `rest_url`) and Java
(`signer.restUrl`) helpers read the status from the same REST route and attach the
proof of possession the same way.

The other SDKs sign hybrid through their hybrid transaction builders
(`build_hybrid_tx` in Python and Rust, `tx.BuildHybridMessages` in Go,
`PqcDx.HybridSendPath` in Java); only the TypeScript `TxClient` signs hybrid for you.

:::warning Always let it check first
The chain refuses a second registration of the same key **after charging the
fee**. `ensurePqcRegistered` therefore reads the status first, over REST
(`/qorechain/pqc/v1/account/{address}`), and refuses to register when it cannot
tell. Pass `rest` (or `statusSource` for a node that exposes `qor_*`, or a pre-read
`status`); `force: true` skips the check. In 0.8.x the helper had no REST fallback
and broadcast the registration unchecked unless you passed `status` yourself.
:::

## Sign hybrid

With a `pqcKeypair` on the client, `tx.bankSend(...)` and
`tx.signAndBroadcast([messages], "auto")` sign hybrid (the `fee: "auto"` path
simulates the hybrid transaction and adds the gas of the post-quantum verification).
The hybrid signature is computed over the sign-bytes form the network verifies (see
[Which sign-bytes form?](/sdk/concepts/accounts-pqc#sign-bytes-versions)); the client
asks the network through its REST endpoint.

`migrateToHybrid` ensures registration and hands back a hybrid send path with the
keypair pre-bound to the lower-level `buildHybridTx` / `signAndBroadcastHybrid`
builders, for when you manage the fee, account number and sequence yourself. Pass
`rest` so the SDK can resolve the sign-bytes form:

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  rest: "https://api.qore.host",
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

## Rotate a key {#rotate-a-key}

To replace an account's ML-DSA-87 key with another key of the **same** algorithm
(for example moving a legacy `shake256(mnemonic)` key to the canonical address-bound
key, or retiring a compromised key), build a `MsgRotatePQCKey` with
`rotatePqcKeyMsgFromMnemonic`; both keys dual-sign it. See
[Key rotation](/sdk/guides/authenticators#key-rotation) for the full example.

`migratePqcKeyHybrid` broadcasts the older `MsgMigratePQCKey`, which moves an account
between **algorithms**, with the hybrid signature the chain requires from v3.2.3 of
an account that has a key. `pqcKeypair` is the key that is **currently** registered
(the one being rotated out), and the caller supplies the two ownership signatures
(`oldSignature` by the old key, `newSignature` by the new key). The classical
`migratePqcKey` is deprecated: a v3.2.3 node refuses a classical migration from a
keyed account.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migratePqcKeyHybrid, qorechainRegistry } from "@qorechain/sdk";

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await migratePqcKeyHybrid({
  sender: account.address,
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,   // the currently registered key
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

## In the UI

The [`@qorechain/react`](/sdk/guides/react) kit surfaces all of this in React: the
`usePqcStatus` hook and the `<QuantumSafeBadge/>` component show a status
indicator whenever the connected account has a registered PQC key. Both read the
status through `getPqcStatus` with the composed client, so from `@qorechain/react`
0.9.0 they read it over REST and work against the public endpoints; 0.8.x could
not confirm a key there.
