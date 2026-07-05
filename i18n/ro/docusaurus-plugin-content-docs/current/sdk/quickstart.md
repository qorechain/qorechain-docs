---
slug: /sdk/quickstart
title: Pornire rapidă
sidebar_label: Pornire rapidă
sidebar_position: 3
---

# Pornire rapidă

De la zero până la o tranzacție trimisă. Această pagină folosește SDK-ul
TypeScript (`@qorechain/sdk`); scurte fragmente de conectare și citire pentru
Python, Go și Rust urmează la final.

## 1. Conectare

`createClient()` rezolvă o rețea și compune clienții de citire, un helper
pentru taxe și un punct de intrare pentru semnare inițializat leneș (lazy).
Vizează implicit testnetul public (`qorechain-diana`). Endpoint-urile implicite
indică spre **localhost**, așa că transmiteți `endpoints` pentru a comunica cu
un nod real.

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

Mainnetul (chain id `qorechain-vladi`) este live. Selectați-l și suprascrieți
valorile implicite localhost cu endpoint-urile publice (sau cu propriul
dumneavoastră nod):

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

## 2. Derivarea unui cont

Un singur mnemonic derivă conturi native (`qor1…`), EVM (`0x…`) și SVM
(base58) prin căi de derivare independente.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Native secp256k1, coin type 118)
```

Începând cu 0.6.0 puteți deriva în schimb un **cont unificat eth-native** — o
singură cheie `eth_secp256k1` redată ca toate cele trei adrese (`qor1…`,
`0x…`, SVM base58), cu un singur sold partajat:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const unified = await deriveUnifiedAccount(mnemonic);
console.log(unified.cosmos); // "qor1..."
console.log(unified.evm);    // "0x..."
console.log(unified.svm);    // base58 (same 20 bytes + 12 zero bytes)
```

Consultați [Conturi & semnare PQC](/sdk/concepts/accounts-pqc) pentru
derivarea EVM/SVM, conturile unificate și tabelul complet de derivare.

## 3. Citirea unui sold

```ts
// Native bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. Trimiterea unui transfer QOR

Derivați un cont nativ, adaptați cheia sa privată într-un semnatar, conectați
un `TxClient` și trimiteți tokeni. Folosiți `toBase("1.5")` pentru a converti
QOR în unități de bază `uqor`.

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

`toBase("1.5")` returnează `"1500000"` (QOR are 10^6 unități de bază `uqor`).

:::info Semnare hibridă pe rețelele live
Pe mainnet și testnet calea Native necesită extensia de semnătură **hibridă**
(clasică + ML-DSA-87) — folosiți `buildHybridTx` /
`signAndBroadcastHybrid`, sau `signHybridEth` pentru conturile unificate
eth-native. Consultați
[Semnare hibridă](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

## Alte limbaje: conectare & citire

Acestea reflectă aceleași preseturi de rețea și aceeași suprafață de citire.

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

## Pașii următori

- [Ghiduri](/sdk/guides/evm) — lucrați cu fiecare VM (EVM, SVM, CosmWasm,
  cross-VM).
- [Conturi & semnare PQC](/sdk/concepts/accounts-pqc) — derivare HD, conturi
  unificate eth-native și semnare post-cuantică.
- [Authenticators & cheltuieli delegate](/sdk/guides/authenticators) —
  permiteți unei chei Phantom/MetaMask conectate să cheltuiască printr-un
  relayer.
- [Referință rețea & endpoint-uri](/sdk/reference/network).
- [Exemple](/sdk/examples) — fragmente executabile pentru fiecare flux de mai
  sus.
