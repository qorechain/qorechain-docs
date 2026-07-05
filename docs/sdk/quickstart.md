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
pass `endpoints` to talk to a real node.

```ts
import { createClient } from "@qorechain/sdk";

// Testnet (chain id "qorechain-diana"), default localhost endpoints.
const client = createClient();

// Point at a real node by overriding endpoints.
const remote = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",   // Native REST (LCD)
    rpc: "https://rpc-testnet.qore.host",    // consensus RPC (for signing)
    evmRpc: "https://evm-testnet.qore.host", // EVM + qor_ JSON-RPC
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

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. Send a QOR transfer

Derive a native account, adapt its private key into a signer, connect a
`TxClient`, and send tokens. Use `toBase("1.5")` to convert QOR to base `uqor`.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rpc: "https://rpc-testnet.qore.host",
    rest: "https://api-testnet.qore.host",
  },
});

const account = await deriveNativeAccount(mnemonic);

// Adapt the raw secp256k1 key into an offline signer bound to the "qor" prefix.
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// Connect a tx client at the consensus RPC endpoint.
const tx = await client.connectTx(signer);

// Estimate a fee, then send 1.5 QOR.
const fee = await client.fees.estimate(); // or "fast" | "normal" | "slow"
const result = await tx.bankSend(
  "qor1recipientaddress...",
  [{ denom: "uqor", amount: toBase("1.5") }],
  { fee },
);

console.log(result.transactionHash);
```

`toBase("1.5")` returns `"1500000"` (QOR has 10^6 base `uqor` units).

:::info Hybrid signing on the live networks
On mainnet and testnet the Native path requires the **hybrid** (classical +
ML-DSA-87) signature extension — use `buildHybridTx` /
`signAndBroadcastHybrid`, or `signHybridEth` for unified eth-native accounts.
See [Hybrid signing](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

## Other languages: connect & read

These mirror the same network presets and read surface.

### Python

```python
from qorechain import create_client

client = create_client()  # testnet preset (localhost endpoints)
print(client.network.chain_id)  # "qorechain-diana"

balances = client.rest.get_all_balances("qor1...")
stats = client.qor.get_ai_stats()
client.close()
```

### Go

```go
import "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"

c, err := client.CreateClient(client.Options{}) // defaults to "testnet"
if err != nil {
    panic(err)
}
fmt.Println(c.Network.ChainID) // qorechain-diana

balances, err := c.REST.GetAllBalances("qor1...")
stats, err := c.Qor.GetAIStats()
```

### Rust

```rust
use qorechain::ClientBuilder;

#[tokio::main]
async fn main() -> qorechain::Result<()> {
    let client = ClientBuilder::new().build()?; // defaults to "testnet"
    let balances = client.rest.get_all_balances("qor1...").await?;
    let stats = client.qor.get_ai_stats().await?;
    let _ = (balances, stats);
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
