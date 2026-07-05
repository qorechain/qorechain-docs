---
slug: /sdk/quickstart
title: Schnellstart
sidebar_label: Schnellstart
sidebar_position: 3
---

# Schnellstart

Von null bis zur gesendeten Transaktion. Diese Seite verwendet das TypeScript-SDK
(`@qorechain/sdk`); kurze Verbinden-und-Lesen-Snippets für Python, Go und Rust
folgen am Ende.

## 1. Verbinden

`createClient()` löst ein Netzwerk auf und stellt die Lese-Clients, einen
Gebühren-Helfer und einen verzögert initialisierten Signier-Einstiegspunkt
zusammen. Standardmäßig richtet es sich an das öffentliche Testnet
(`qorechain-diana`). Die Standard-Endpunkte zeigen auf **localhost** — übergeben
Sie daher `endpoints`, um mit einem echten Node zu kommunizieren.

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

Das Mainnet (Chain-ID `qorechain-vladi`) ist live. Wählen Sie es aus und
überschreiben Sie die localhost-Standardwerte mit den öffentlichen Endpunkten
(oder Ihrem eigenen Node):

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

## 2. Ein Konto ableiten

Eine einzige Mnemonic leitet über unabhängige Ableitungspfade native
(`qor1…`)-, EVM- (`0x…`) und SVM- (base58) Konten ab.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Native secp256k1, coin type 118)
```

Seit 0.6.0 können Sie stattdessen ein **unified eth-native Konto** ableiten —
ein einziger `eth_secp256k1`-Schlüssel, der als alle drei Adressen (`qor1…`,
`0x…`, SVM base58) mit einem gemeinsamen Guthaben dargestellt wird:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const unified = await deriveUnifiedAccount(mnemonic);
console.log(unified.cosmos); // "qor1..."
console.log(unified.evm);    // "0x..."
console.log(unified.svm);    // base58 (same 20 bytes + 12 zero bytes)
```

Siehe [Konten & PQC-Signierung](/sdk/concepts/accounts-pqc) für die
EVM/SVM-Ableitung, Unified Accounts und die vollständige Ableitungstabelle.

## 3. Ein Guthaben lesen

```ts
// Native bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. Eine QOR-Überweisung senden

Leiten Sie ein natives Konto ab, wandeln Sie dessen privaten Schlüssel in einen
Signer um, verbinden Sie einen `TxClient` und senden Sie Token. Verwenden Sie
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

`toBase("1.5")` liefert `"1500000"` (QOR hat 10^6 Basiseinheiten in `uqor`).

:::info Hybrides Signieren auf den Live-Netzwerken
Auf Mainnet und Testnet erfordert der native Pfad die **hybride** (klassisch +
ML-DSA-87) Signatur-Erweiterung — verwenden Sie `buildHybridTx` /
`signAndBroadcastHybrid` oder `signHybridEth` für unified eth-native Konten.
Siehe [Hybrides Signieren](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

## Weitere Sprachen: Verbinden & Lesen

Diese spiegeln dieselben Netzwerk-Presets und dieselbe Lese-Oberfläche wider.

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

## Nächste Schritte

- [Guides](/sdk/guides/evm) — arbeiten Sie mit jeder VM (EVM, SVM, CosmWasm, Cross-VM).
- [Konten & PQC-Signierung](/sdk/concepts/accounts-pqc) — HD-Ableitung, unified
  eth-native Konten und Post-Quanten-Signierung.
- [Authenticators & delegiertes Ausgeben](/sdk/guides/authenticators) — lassen
  Sie einen verknüpften Phantom-/MetaMask-Schlüssel über einen Relayer ausgeben.
- [Netzwerk- & Endpunkt-Referenz](/sdk/reference/network).
- [Beispiele](/sdk/examples) — ausführbare Snippets für jeden der obigen Abläufe.
