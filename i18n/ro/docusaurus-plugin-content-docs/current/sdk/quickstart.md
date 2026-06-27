---
slug: /sdk/quickstart
title: Quickstart
sidebar_label: Quickstart
sidebar_position: 3
---

# Quickstart

De la zero la o tranzacție trimisă. Această pagină folosește SDK-ul TypeScript
(`@qorechain/sdk`); fragmente scurte de conectare-și-citire pentru Python, Go și
Rust urmează la final.

## 1. Conectare

`createClient()` rezolvă o rețea și compune clienții de citire, un helper de
taxe și un punct de intrare lazy pentru semnare. Vizează implicit testnet-ul
public (`qorechain-diana`). Endpoint-urile implicite indică spre **localhost**,
așa că transmite `endpoints` pentru a comunica cu un nod real.

```ts
import { createClient } from "@qorechain/sdk";

// Testnet (chain id "qorechain-diana"), default localhost endpoints.
const client = createClient();

// Point at a real node by overriding endpoints.
const remote = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",   // Cosmos REST (LCD)
    rpc: "https://rpc.testnet.example",      // consensus RPC (for signing)
    evmRpc: "https://evm.testnet.example",   // EVM + qor_ JSON-RPC
  },
});
```

Mainnet-ul (chain id `qorechain-vladi`) este live. Selectează-l și suprascrie
valorile implicite localhost cu URL-urile nodului tău:

```ts
const main = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://rest.mainnet.example",
    rpc: "https://rpc.mainnet.example",
    evmRpc: "https://evm.mainnet.example",
  },
});
```

## 2. Derivarea unui cont

Un singur mnemonic derivă conturi native (`qor1…`), EVM (`0x…`) și SVM (base58)
prin căi de derivare independente.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Cosmos-style secp256k1)
```

Vezi [Conturi și semnare PQC](/sdk/concepts/accounts-pqc) pentru derivarea
EVM/SVM și tabelul complet de derivare.

## 3. Citirea unui sold

```ts
// Cosmos bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. Trimiterea unui transfer QOR

Derivă un cont nativ, adaptează cheia sa privată într-un semnatar, conectează un
`TxClient` și trimite tokeni. Folosește `toBase("1.5")` pentru a converti QOR în
baza `uqor`.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rpc: "https://rpc.testnet.example",
    rest: "https://rest.testnet.example",
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

`toBase("1.5")` returnează `"1500000"` (QOR are 10^6 unități de bază `uqor`).

## Alte limbaje: conectare și citire

Acestea reflectă aceleași presetări de rețea și aceeași suprafață de citire.

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

## Următorul pas

- [Ghiduri](/sdk/guides/evm) — lucrul cu fiecare VM (EVM, SVM, CosmWasm, cross-VM).
- [Conturi și semnare PQC](/sdk/concepts/accounts-pqc) — derivare HD și
  semnare post-cuantică.
- [Referință rețea și endpoint-uri](/sdk/reference/network).
- [Exemple](/sdk/examples) — fragmente rulabile pentru fiecare flux de mai sus.
