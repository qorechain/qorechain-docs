---
slug: /sdk/guides/authenticators
title: Authenticators & Delegated Spending
sidebar_label: Authenticators
sidebar_position: 8
---

# Authenticators & delegated spending

**Authenticator lanes** (SDK 0.7.0, chain **v3.1.85**) let a linked external
key — a Phantom **ed25519** key, or a MetaMask / EVM **secp256k1** key — spend
from the ONE canonical **PQC-required** account under least-privilege,
spend-limited, revocable terms, **without the external key ever producing an
ML-DSA co-signature**.

This is the SDK counterpart of the chain's
[account abstraction](/developer-guide/account-abstraction) module.

## The relayer model

A **relayer** submits the transaction and pays the fees. The relayer's own
hybrid (classical + ML-DSA-87) signature satisfies the ante handler on the
envelope, so the canonical account's PQC signature is **not** needed on-chain.
The authorization is instead the linked key's signature over a
domain-separated, replay-bound **sign-bytes** digest.

```text
 Phantom / MetaMask key            Relayer (pays fees)             Chain
 ─────────────────────            ───────────────────            ─────
 sign(authSignBytes)  ──────────▶ wrap in Msg, sign envelope ──▶ verify authenticator sig
                                                                  check permission + rule
                                                                  spend FROM canonical account
```

The relayer is a **different** account than the owner, so it does not bump the
account's EVM nonce.

## The three lanes

| Lane | Message | Sign-bytes | Spends |
| --- | --- | --- | --- |
| EVM | `MsgExecuteEVM` | `evmAuthSignBytes` | native QOR / EVM call from the account's `0x` address |
| Native | `MsgExecuteCosmos` | `cosmosAuthSignBytes` | native QOR via `x/bank` from the account |
| Key rotation | `MsgRotatePQCKey` | `rotationSignBytes` | (rotates the account's PQC key) |

The message type URLs are `/qorechain.abstractaccount.v1.MsgExecuteEVM`,
`/qorechain.abstractaccount.v1.MsgExecuteCosmos`, and
`/qorechain.pqc.v1.MsgRotatePQCKey`.

## Register a Phantom authenticator

Linking a key is **owner-signed** (a normal hybrid transaction by the canonical
account): `MsgRegisterAuthenticator` names the key (scheme + raw pubkey bytes),
the granted `permissions`, and an `expiryUnix` session deadline. Spending
limits are attached with a `SpendingRule` via `MsgUpdateSpendingRules`:

```ts
import { msg } from "@qorechain/sdk";

// The Phantom wallet in the browser:
const phantomPubkey = window.solana.publicKey.toBytes(); // 32-byte ed25519

// 1) Link the key: least privilege ("send" only) + a session expiry.
const register = msg.abstractaccount.registerAuthenticator({
  owner: canonicalAccount,          // the PQC-required account ("qor1…")
  accountAddress: canonicalAccount, // the account the key may act for
  scheme: "ed25519",                // Phantom keys are ed25519
  pubkey: phantomPubkey,
  permissions: ["send"],            // e.g. "send", "evm", "svm" — never "all" for a hot key
  expiryUnix: String(Math.floor(Date.now() / 1000) + 7 * 24 * 3600), // 7 days
  label: "phantom",
});

// 2) Bound what it can move: per-tx and daily limits, uqor only.
const limits = msg.abstractaccount.updateSpendingRules({
  owner: canonicalAccount,
  accountAddress: canonicalAccount,
  rules: [
    {
      id: "phantom-hot",
      perTxLimit: "1000000",    // ≤ 1 QOR per spend
      dailyLimit: "10000000",   // ≤ 10 QOR per day
      allowedDenoms: ["uqor"],
      enabled: true,
    },
  ],
});

// Broadcast BOTH owner-signed (hybrid) — e.g. via the hybrid tx path:
// await signAndBroadcastHybrid({ ..., messages: [register, limits] });
```

To disable a key instantly, the owner broadcasts
`msg.abstractaccount.revokeAuthenticator({ owner, accountAddress, scheme,
pubkey })`.

## Spend from Phantom (Native lane, via a relayer)

Once the key is linked, the browser builds a relayer-ready `MsgExecuteCosmos`:
`buildPhantomExecuteCosmos` rebuilds the domain-separated digest, has Phantom
sign it (`signMessage`), and returns the `{ typeUrl, value }` message.

**Browser (the Phantom user):**

```ts
import { buildPhantomExecuteCosmos } from "@qorechain/sdk";

// window.solana is a Phantom-style wallet: { publicKey, signMessage }.
const msgExecute = await buildPhantomExecuteCosmos({
  wallet: window.solana,
  relayer: relayerAddress,       // who will submit + pay fees
  chainId: "qorechain-vladi",
  account: canonicalAccount,     // the PQC-required owner
  to: recipient,                 // "qor1…"
  amount: "100uqor",             // single-coin amount string
  nonce,                         // the per-authenticator sequence for (account, pubkey)
});

// Ship `msgExecute` to your relayer service (it is already signed by Phantom):
await fetch("/api/relay", {
  method: "POST",
  body: JSON.stringify({
    typeUrl: msgExecute.typeUrl,
    value: {
      ...msgExecute.value,
      pubkey: Buffer.from(msgExecute.value.pubkey).toString("base64"),
      signature: Buffer.from(msgExecute.value.signature).toString("base64"),
      nonce: msgExecute.value.nonce.toString(),
    },
  }),
});
```

**Server (the relayer):** signs the envelope with its **own** account (hybrid,
as usual on the Native path) and pays the fees. The authenticator's signature
inside the message is the authorization to spend from the owner's account.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rpc: "https://rpc.qore.host",
    rest: "https://api.qore.host",
  },
});

// The relayer's OWN account — a different account than the owner.
const relayer = await deriveNativeAccount(process.env.RELAYER_MNEMONIC!);
const signer = await directSignerFromPrivateKey(relayer.privateKey, "qor");
const tx = await client.connectTx(signer);

// Decode the message from the request, then broadcast it (relayer pays fees).
const result = await tx.signAndBroadcast([msgExecute], { fee });
console.log(result.transactionHash);
```

A runnable end-to-end version (with a local ed25519 key standing in for
Phantom) is the
[`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend)
example.

## Spend from MetaMask (EVM lane)

A MetaMask key is linked by its **20-byte ETH address** (scheme `secp256k1`)
with `registerEthAuthenticatorMsg`, and authorizes spends with a 65-byte
EIP-191 `personal_sign` signature over the same kind of digest.

**1) Owner links the MetaMask address** (owner-signed, hybrid):

```ts
import { registerEthAuthenticatorMsg } from "@qorechain/sdk";

const [ethAddress] = await window.ethereum.request({
  method: "eth_requestAccounts",
  params: [],
});

const register = registerEthAuthenticatorMsg({
  owner: canonicalAccount,
  ethAddress,                 // 0x-hex 20-byte address = the authenticator pubkey
  permissions: ["evm"],       // EVM lane only
  expiryUnix: Math.floor(Date.now() / 1000) + 24 * 3600, // 24 h session
  label: "metamask",
});
// broadcast owner-signed (hybrid), like any other message
```

**2) MetaMask authorizes an EVM transfer** — `buildMetaMaskExecuteEvm` builds
the digest, requests `personal_sign` (EIP-191) from the provider, and returns
a relayer-ready `MsgExecuteEVM`:

```ts
import { buildMetaMaskExecuteEvm } from "@qorechain/sdk";

const msgExecute = await buildMetaMaskExecuteEvm({
  provider: window.ethereum,   // any EIP-1193 provider
  address: ethAddress,         // the linked 20-byte address (0x-hex)
  relayer: relayerAddress,
  chainId: "qorechain-vladi",
  account: canonicalAccount,   // the PQC-required owner
  to: "0xRecipient…",          // 0x-hex recipient
  value: "1000000000000000000",// decimal wei string (EVM lane: 18 decimals)
  gasLimit: 100000,
  nonce: evmNonce,             // the account's CURRENT EVM nonce — do NOT +1
});
// hand `msgExecute` to the relayer, exactly as in the Phantom flow
```

`buildMetaMaskExecuteCosmos` works the same way for the Native lane
(`to: "qor1…"`, `amount: "100uqor"`, `nonce` = the per-authenticator
sequence). There are matching low-level composers — `executeEvmMsg`,
`executeCosmosMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
`rotatePqcKeyMsg` — if you manage keys and signatures yourself.

## Sign-bytes (byte-exact)

Two byte helpers: `BE64(n)` is an 8-byte big-endian integer; `LP(bytes)` is
`BE64(len) ‖ bytes` (length-prefixed).

**EVM lane** — `evmAuthSignBytes({ chainId, account, pubkey, to, value, data, nonce })`
returns a 32-byte digest:

```text
sha256( "qorechain-evm-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(value) ‖ LP(data) ‖ BE64(nonce) )
```

`to` is the `0x`-hex recipient, `value` the decimal wei string, `data` the raw
calldata.

**Native lane** — `cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce })`
returns a 32-byte digest:

```text
sha256( "qorechain-cosmos-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(amount) ‖ BE64(nonce) )
```

`amount` is the canonical single-coin string (e.g. `100uqor`).

**Rotation** — `rotationSignBytes(chainId, algorithmId, account, oldPub, newPub)`
returns the string both keys sign (UTF-8 of it):

```text
qorechain-pqc-rotate-v1|<chainId>|<algorithmId>|<account>|<oldHex>|<newHex>
```

## Nonces

- `MsgExecuteEVM.nonce` = the account's **current EVM nonce** (the relayer is a
  different account and does not bump the owner's nonce, so do **not** add 1).
- `MsgExecuteCosmos.nonce` = the **per-authenticator sequence** for
  `(account, pubkey)` — a store counter distinct from the account's own
  sequence, incremented on each successful Native-lane spend.

Getting the nonce wrong is a replay rejection
(`abstractaccount` code 11, see below).

```ts
// EVM lane: the account's current nonce, straight from the EVM JSON-RPC.
const evmNonce = await client.evm.call<string>("eth_getTransactionCount", [
  account0x,
  "latest",
]);
```

## The permission schema

The chain publishes the canonical authenticator permission taxonomy so clients
validate scopes without hardcoding strings, and detect drift via
`schema_version`:

```ts
// REST (LCD):
const schema = await client.rest.getPermissionSchema();

schema.schema_version;      // bumps on any taxonomy/mapping change
schema.permissions;         // ["send", "evm", "svm", "all", ...]
schema.msg_permissions;     // { "/qorechain.abstractaccount.v1.MsgExecuteEVM": "evm", ... }
schema.key_management_msgs; // typeURLs NEVER delegable to a linked key
```

The REST route is `GET /qorechain/abstractaccount/v1/permission_schema`; the
typed gRPC query client exposes the same data as
`clients.abstractaccount.permissionSchema()`. The module also serves
`/config`, `/accounts`, and `/accounts/{address}`.

## Error codes

Failures decode through `decodeTxError` with a friendly `kind`:

| Codespace | Code | Kind |
| --- | --- | --- |
| `abstractaccount` | 5 | `spending_limit_exceeded` |
| `abstractaccount` | 6 | `session_key_expired` |
| `abstractaccount` | 10 | `permission_denied` |
| `abstractaccount` | 11 | `authenticator_replay` |
| `pqc` | 21 | `hybrid_verify_failed` |

```ts
import { decodeTxError } from "@qorechain/sdk";

const decoded = decodeTxError({
  code: result.code,
  codespace: result.codespace,
  rawLog: result.rawLog,
});

switch (decoded.kind) {
  case "spending_limit_exceeded": // over the per-tx or daily SpendingRule
    break;
  case "session_key_expired":     // expiryUnix passed — re-register the key
    break;
  case "permission_denied":       // scope missing — check the permission_schema
    break;
  case "authenticator_replay":    // wrong nonce — refetch and re-sign
    break;
  case "hybrid_verify_failed":    // ML-DSA sig did not verify (see note below)
    break;
}
```

`hybrid_verify_failed` most commonly means a **hedged** (non-deterministic)
ML-DSA-87 signature — the chain accepts only deterministic signatures. It is
also what you see if a pre-0.6.1 SDK JSON-encoded the hybrid extension
(upgrade — see
[Accounts & PQC signing](/sdk/concepts/accounts-pqc#hybrid-signing)).

## Key rotation {#key-rotation}

Rotate an account's ML-DSA-87 key to a new key of the **same** algorithm — for
example migrating a legacy chain-bridge-derived key (`shake256(mnemonic)`) to
the canonical address-bound key
(`shake256("qorechain:pqc:v1|addr|mnemonic")`):

```ts
import { rotatePqcKeyMsgFromMnemonic, derivePqcLegacy } from "@qorechain/sdk";

const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account,
  mnemonic,
  chainId: "qorechain-vladi",
  // oldDerivation: "bridge" (legacy), newDerivation: "adapter" (canonical) by default
});
// broadcast `msg` BY the account, cosigned (hybrid) with the OLD key —
// both keys dual-sign the rotation bytes (old proves ownership, new proves control).
```

`derivePqcLegacy(mnemonic)` reproduces the legacy keypair on its own when you
need it (e.g. to keep signing until the rotation lands).

## Next

- [Accounts & PQC signing](/sdk/concepts/accounts-pqc) — unified accounts and
  hybrid signing.
- [Account abstraction](/developer-guide/account-abstraction) — the chain-side
  module.
- Runnable example:
  [`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).
