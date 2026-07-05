---
slug: /sdk/quickstart
title: Démarrage rapide
sidebar_label: Démarrage rapide
sidebar_position: 3
---

# Démarrage rapide

De zéro à une transaction envoyée. Cette page utilise le SDK TypeScript
(`@qorechain/sdk`) ; de courts extraits de connexion et de lecture pour Python,
Go et Rust se trouvent à la fin.

## 1. Se connecter

`createClient()` résout un réseau et compose les clients de lecture, un
assistant de frais et un point d'entrée de signature paresseux (lazy). Il cible
par défaut le testnet public (`qorechain-diana`). Les endpoints par défaut
pointent vers **localhost** ; passez donc `endpoints` pour dialoguer avec un
vrai nœud.

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

Le mainnet (chain id `qorechain-vladi`) est en production. Sélectionnez-le et
remplacez les valeurs par défaut localhost par les endpoints publics (ou votre
propre nœud) :

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

## 2. Dériver un compte

Un seul mnémonique dérive des comptes natifs (`qor1…`), EVM (`0x…`) et SVM
(base58) via des chemins de dérivation indépendants.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Native secp256k1, coin type 118)
```

Depuis la version 0.6.0, vous pouvez à la place dériver un **compte unifié
eth-native** — une seule clé `eth_secp256k1` rendue sous les trois adresses
(`qor1…`, `0x…`, SVM base58) avec un solde unique partagé :

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const unified = await deriveUnifiedAccount(mnemonic);
console.log(unified.cosmos); // "qor1..."
console.log(unified.evm);    // "0x..."
console.log(unified.svm);    // base58 (same 20 bytes + 12 zero bytes)
```

Consultez [Comptes et signature PQC](/sdk/concepts/accounts-pqc) pour la
dérivation EVM/SVM, les comptes unifiés et le tableau de dérivation complet.

## 3. Lire un solde

```ts
// Native bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. Envoyer un transfert de QOR

Dérivez un compte natif, adaptez sa clé privée en un signataire, connectez un
`TxClient` et envoyez des jetons. Utilisez `toBase("1.5")` pour convertir des
QOR en unités de base `uqor`.

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

`toBase("1.5")` renvoie `"1500000"` (le QOR compte 10^6 unités de base `uqor`).

:::info Signature hybride sur les réseaux en production
Sur le mainnet et le testnet, la voie Native exige l'extension de signature
**hybride** (classique + ML-DSA-87) — utilisez `buildHybridTx` /
`signAndBroadcastHybrid`, ou `signHybridEth` pour les comptes unifiés
eth-native. Consultez
[Signature hybride](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

## Autres langages : connexion et lecture

Ces extraits reprennent les mêmes préréglages réseau et la même surface de
lecture.

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

## Et ensuite

- [Guides](/sdk/guides/evm) — travaillez avec chaque VM (EVM, SVM, CosmWasm,
  cross-VM).
- [Comptes et signature PQC](/sdk/concepts/accounts-pqc) — dérivation HD,
  comptes unifiés eth-native et signature post-quantique.
- [Authentificateurs et dépenses déléguées](/sdk/guides/authenticators) —
  autorisez une clé Phantom/MetaMask liée à dépenser via un relayeur.
- [Référence réseau et endpoints](/sdk/reference/network).
- [Exemples](/sdk/examples) — extraits exécutables pour chacun des flux
  ci-dessus.
