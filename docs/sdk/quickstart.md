---
slug: /sdk/quickstart
title: Quickstart
sidebar_label: Quickstart
sidebar_position: 3
---

# Quickstart

From zero to a sent transaction. This page uses the TypeScript SDK
(`@qorechain/sdk`); short connect-and-read snippets for Python, Go, and Rust
follow at the end.

## 1. Connect

`createClient()` resolves a network and composes the read clients, a fee helper,
and a lazy signing entrypoint. It targets the public testnet
(`qorechain-diana`) by default. The default endpoints point at **localhost**, so
pass `endpoints` to talk to a real node. The public endpoints are listed in the
[network reference](/sdk/reference/network#public-endpoints).

```ts
import { createClient } from "@qorechain/sdk";

// Testnet (chain id "qorechain-diana"), default localhost endpoints.
const client = createClient();

// Point at the public testnet by overriding endpoints.
const remote = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",   // Native REST (LCD)
    rpc: "https://rpc-testnet.qore.host",    // consensus RPC (for signing)
    evmRpc: "https://evm-testnet.qore.host", // EVM JSON-RPC (eth_*)
  },
});
```

Mainnet (chain id `qorechain-vladi`) is live. Select it and override the
localhost defaults with the public endpoints (or your own node):

```ts
const main = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});
```

## 2. Derive an account

A single mnemonic derives native (`qor1…`), EVM (`0x…`), and SVM (base58)
accounts via independent derivation paths.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Native secp256k1, coin type 118)
```

Since 0.6.0 you can instead derive a **unified eth-native account** — one
`eth_secp256k1` key rendered as all three addresses (`qor1…`, `0x…`, SVM
base58) with one shared balance:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const unified = await deriveUnifiedAccount(mnemonic);
console.log(unified.cosmos); // "qor1..."
console.log(unified.evm);    // "0x..."
console.log(unified.svm);    // base58 (same 20 bytes + 12 zero bytes)
```

See [Accounts & PQC signing](/sdk/concepts/accounts-pqc) for EVM/SVM derivation,
unified accounts, and the full derivation table.

## 3. Read a balance

```ts
// Native bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// Any REST route works through the typed escape hatch, for example the burn
// statistics.
const burn = await client.rest.getBurnStats();
```

`client.qor` (the typed `qor_` JSON-RPC calls) is not usable on the public
endpoints: no released node build serves that namespace, so every call returns
`-32601` (method not found). Read through REST instead. See
[the `qor_` namespace](/api-reference/json-rpc-qor_-namespace).

## 4. Send a QOR transfer {#send-qor}

On mainnet and testnet every Native-path transaction must carry the **hybrid**
(classical secp256k1 plus ML-DSA-87) signature, and the account's ML-DSA-87 key
must be **registered on-chain first**. Registration is explicit: there is no
auto-registration on the first transaction. A plain `tx.bankSend` (classical
signature only) is refused by the live networks. The two steps below need
**SDK 0.8.3 or later** (`derivePqcCanonical`; 0.8.1 or later for hybrid sends in
general) and a funded account:

```bash
npm i @qorechain/sdk @cosmjs/stargate
```

### 4a. Register your post-quantum key (once)

Registration is classical-signed and exempt from the hybrid requirement, so a
new account can bootstrap its first key. The account pays the fee: the 2,592-byte
key needs a gas limit of about 600,000.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const REST = "https://api-testnet.qore.host";
const RPC = "https://rpc-testnet.qore.host";

const client = createClient({ endpoints: { rest: REST, rpc: RPC } });

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const tx = await client.connectTx(signer);

// The address-bound ML-DSA-87 key, recoverable from { address, mnemonic }.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// Read the status over REST (the default status source needs `qor_`).
const { found } = await client.rest.get<{ found: boolean }>(
  `/qorechain/pqc/v1/account/${account.address}`,
);

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },          // skips the transaction when already registered
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
console.log(res.alreadyRegistered ? "already registered" : res.txHash);
```

### 4b. Send with a hybrid signature

`signAndBroadcastHybrid` builds, signs and broadcasts. Pass `rest` so the SDK can
ask the network which sign-bytes form it verifies (see
[Which sign-bytes form?](/sdk/concepts/accounts-pqc#sign-bytes-versions)). Use
`toBase("1.5")` to convert QOR to base `uqor`. The network's minimum gas price is
0.1 uqor per unit of gas, so a 400,000 gas limit needs a fee of at least 40,000
uqor.

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  signAndBroadcastHybrid,
  qorechainRegistry,
  MSG_SEND_TYPE_URL,
  toBase,
} from "@qorechain/sdk";

const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(account.address); // { accountNumber, sequence }

const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [
    {
      typeUrl: MSG_SEND_TYPE_URL,
      value: {
        fromAddress: account.address,
        toAddress: "qor1recipientaddress...",
        amount: [{ denom: "uqor", amount: toBase("1.5") }],
      },
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: client.network.chainId,
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,
  transport,
});

console.log(result.transactionHash);
```

`toBase("1.5")` returns `"1500000"` (QOR has 10^6 base `uqor` units).

:::info Unified accounts
For a unified eth-native account (`deriveUnifiedAccount`), use
`EthNativeSigner` instead; the registration and send samples are in
[Accounts & PQC signing](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

:::note Classical sends work only on local and dev nodes
The classical `client.connectTx(signer)` plus `tx.bankSend(...)` path still
exists, and it is what `ensurePqcRegistered` uses for the one registration
transaction. Against a node that does not require the hybrid extension (a local
dev node) it also sends ordinary transfers. The public networks refuse it.
:::

## Other languages: connect & read

These mirror the same network presets and read surface. They use the public
testnet endpoints; for mainnet pass `"mainnet"` and the mainnet URLs.

### Python

```python
from qorsdk import create_client

client = create_client(
    network="testnet",
    endpoints={
        "rest": "https://api-testnet.qore.host",
        "rpc": "https://rpc-testnet.qore.host",
        "evm_rpc": "https://evm-testnet.qore.host",
    },
)
print(client.network.chain_id)  # "qorechain-diana"

balances = client.rest.get_all_balances("qor1...")
burn = client.rest.get_burn_stats()
client.close()
```

### Go

```go
import (
    "fmt"

    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
)

c, err := client.CreateClient(client.Options{
    Network: "testnet",
    Endpoints: client.EndpointOverrides{
        REST:   "https://api-testnet.qore.host",
        RPC:    "https://rpc-testnet.qore.host",
        EVMRPC: "https://evm-testnet.qore.host",
    },
})
if err != nil {
    panic(err)
}
fmt.Println(c.Network.ChainID) // qorechain-diana

balances, err := c.REST.GetAllBalances("qor1...")
burn, err := c.REST.GetBurnStats()
```

### Rust

```rust
use qorechain::ClientBuilder;

#[tokio::main]
async fn main() -> qorechain::Result<()> {
    let client = ClientBuilder::new()
        .network("testnet")
        .rest("https://api-testnet.qore.host")
        .rpc("https://rpc-testnet.qore.host")
        .evm_rpc("https://evm-testnet.qore.host")
        .build()?;
    let balances = client.rest.get_all_balances("qor1...").await?;
    let burn = client.rest.get_burn_stats().await?;
    let _ = (balances, burn);
    Ok(())
}
```

## Next

- [Guides](/sdk/guides/evm) — work with each VM (EVM, SVM, CosmWasm, cross-VM).
- [Accounts & PQC signing](/sdk/concepts/accounts-pqc) — HD derivation, unified
  eth-native accounts, and post-quantum signing.
- [Authenticators & delegated spending](/sdk/guides/authenticators) — let a
  linked Phantom/MetaMask key spend via a relayer.
- [Network & endpoints reference](/sdk/reference/network).
- [Examples](/sdk/examples) — runnable snippets for each flow above.
