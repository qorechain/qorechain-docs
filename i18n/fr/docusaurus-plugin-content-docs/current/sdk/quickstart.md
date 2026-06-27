---
slug: /sdk/quickstart
title: Quickstart
sidebar_label: Quickstart
sidebar_position: 3
---

# Quickstart

De zéro à une transaction envoyée. Cette page utilise le SDK TypeScript
(`@qorechain/sdk`) ; de courts extraits de connexion et de lecture pour Python,
Go et Rust suivent à la fin.

## 1. Se connecter

`createClient()` résout un réseau et compose les clients de lecture, un helper de
frais, et un point d'entrée de signature paresseux. Il cible le testnet public
(`qorechain-diana`) par défaut. Les endpoints par défaut pointent vers
**localhost**, alors passez `endpoints` pour communiquer avec un vrai nœud.

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

Le mainnet (chain id `qorechain-vladi`) est en ligne. Sélectionnez-le et
remplacez les valeurs localhost par défaut par les URL de votre nœud :

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

## 2. Dériver un compte

Une seule phrase mnémonique dérive des comptes native (`qor1…`), EVM (`0x…`), et
SVM (base58) via des chemins de dérivation indépendants.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Cosmos-style secp256k1)
```

Voir [Comptes et signature PQC](/sdk/concepts/accounts-pqc) pour la dérivation
EVM/SVM et le tableau complet de dérivation.

## 3. Lire un solde

```ts
// Cosmos bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. Envoyer un transfert de QOR

Dérivez un compte native, adaptez sa clé privée en un signataire, connectez un
`TxClient`, et envoyez des tokens. Utilisez `toBase("1.5")` pour convertir des
QOR en `uqor` de base.

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

`toBase("1.5")` renvoie `"1500000"` (QOR comporte 10^6 unités de base `uqor`).

## Autres langages : connexion et lecture

Ceux-ci reflètent les mêmes préréglages réseau et la même surface de lecture.

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

## Suite

- [Guides](/sdk/guides/evm) — travailler avec chaque VM (EVM, SVM, CosmWasm, cross-VM).
- [Comptes et signature PQC](/sdk/concepts/accounts-pqc) — dérivation HD et
  signature post-quantique.
- [Référence réseau et endpoints](/sdk/reference/network).
- [Exemples](/sdk/examples) — extraits exécutables pour chaque flux ci-dessus.
