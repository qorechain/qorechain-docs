---
slug: /sdk/quickstart
title: Quickstart
sidebar_label: Quickstart
sidebar_position: 3
---

# Quickstart

Von null bis zur gesendeten Transaktion. Diese Seite verwendet das TypeScript-SDK
(`@qorechain/sdk`); kurze Verbindungs- und Lese-Snippets für Python, Go und Rust
folgen am Ende.

## 1. Verbinden

`createClient()` löst ein Netzwerk auf und stellt die Read-Clients, einen Gebühren-Helfer
und einen verzögerten Signier-Einstiegspunkt zusammen. Standardmäßig zielt es auf das
öffentliche Testnet (`qorechain-diana`). Die Standard-Endpunkte zeigen auf **localhost**,
übergeben Sie also `endpoints`, um mit einem echten Node zu kommunizieren.

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

Das Mainnet (chain id `qorechain-vladi`) ist live. Wählen Sie es aus und überschreiben
Sie die localhost-Standardwerte mit Ihren Node-URLs:

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

## 2. Ein Konto ableiten

Eine einzige Mnemonic leitet über unabhängige Ableitungspfade native (`qor1…`)-,
EVM (`0x…`)- und SVM (base58)-Konten ab.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Cosmos-style secp256k1)
```

Siehe [Konten & PQC-Signierung](/sdk/concepts/accounts-pqc) für die EVM-/SVM-Ableitung
und die vollständige Ableitungstabelle.

## 3. Ein Guthaben lesen

```ts
// Cosmos bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. Einen QOR-Transfer senden

Leiten Sie ein natives Konto ab, wandeln Sie dessen privaten Schlüssel in einen
Signierer um, verbinden Sie einen `TxClient` und senden Sie Token. Verwenden Sie
`toBase("1.5")`, um QOR in die Basiseinheit `uqor` umzurechnen.

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

`toBase("1.5")` gibt `"1500000"` zurück (QOR hat 10^6 Basiseinheiten `uqor`).

## Andere Sprachen: verbinden & lesen

Diese spiegeln dieselben Netzwerk-Voreinstellungen und dieselbe Lesefläche wider.

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

## Weiter

- [Handbücher](/sdk/guides/evm) – Arbeiten mit jeder VM (EVM, SVM, CosmWasm, VM-übergreifend).
- [Konten & PQC-Signierung](/sdk/concepts/accounts-pqc) – HD-Ableitung und
  Post-Quanten-Signierung.
- [Netzwerk- & Endpunkt-Referenz](/sdk/reference/network).
- [Beispiele](/sdk/examples) – ausführbare Snippets für jeden der obigen Abläufe.
