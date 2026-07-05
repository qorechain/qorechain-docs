---
slug: /sdk/quickstart
title: Guida rapida
sidebar_label: Guida rapida
sidebar_position: 3
---

# Guida rapida

Da zero a una transazione inviata. Questa pagina utilizza l'SDK TypeScript
(`@qorechain/sdk`); brevi snippet di connessione e lettura per Python, Go e Rust
si trovano alla fine.

## 1. Connessione

`createClient()` risolve una rete e compone i client di lettura, un helper per
le commissioni e un punto di ingresso pigro per la firma. Per impostazione
predefinita punta alla testnet pubblica (`qorechain-diana`). Gli endpoint
predefiniti puntano a **localhost**, quindi passa `endpoints` per comunicare con
un nodo reale.

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

La mainnet (chain id `qorechain-vladi`) è attiva. Selezionala e sostituisci i
valori predefiniti localhost con gli endpoint pubblici (o con il tuo nodo):

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

## 2. Derivare un account

Una singola mnemonica deriva account native (`qor1…`), EVM (`0x…`) e SVM
(base58) tramite percorsi di derivazione indipendenti.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Native secp256k1, coin type 118)
```

A partire dalla 0.6.0 puoi invece derivare un **account unificato eth-native** —
una sola chiave `eth_secp256k1` rappresentata come tutti e tre gli indirizzi
(`qor1…`, `0x…`, base58 SVM) con un unico saldo condiviso:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const unified = await deriveUnifiedAccount(mnemonic);
console.log(unified.cosmos); // "qor1..."
console.log(unified.evm);    // "0x..."
console.log(unified.svm);    // base58 (same 20 bytes + 12 zero bytes)
```

Vedi [Account e firma PQC](/sdk/concepts/accounts-pqc) per la derivazione
EVM/SVM, gli account unificati e la tabella di derivazione completa.

## 3. Leggere un saldo

```ts
// Native bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. Inviare un trasferimento QOR

Deriva un account native, adatta la sua chiave privata in un firmatario,
connetti un `TxClient` e invia i token. Usa `toBase("1.5")` per convertire QOR
nell'unità base `uqor`.

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

`toBase("1.5")` restituisce `"1500000"` (QOR ha 10^6 unità base `uqor`).

:::info Firma ibrida sulle reti live
Su mainnet e testnet il percorso Native richiede l'estensione di firma
**ibrida** (classica + ML-DSA-87) — usa `buildHybridTx` /
`signAndBroadcastHybrid`, oppure `signHybridEth` per gli account unificati
eth-native. Vedi [Firma ibrida](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

## Altri linguaggi: connessione e lettura

Questi rispecchiano gli stessi preset di rete e la stessa superficie di lettura.

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

## Prossimi passi

- [Guide](/sdk/guides/evm) — lavora con ciascuna VM (EVM, SVM, CosmWasm,
  cross-VM).
- [Account e firma PQC](/sdk/concepts/accounts-pqc) — derivazione HD, account
  unificati eth-native e firma post-quantistica.
- [Authenticator e spesa delegata](/sdk/guides/authenticators) — consenti a una
  chiave Phantom/MetaMask collegata di spendere tramite un relayer.
- [Riferimento rete ed endpoint](/sdk/reference/network).
- [Esempi](/sdk/examples) — snippet eseguibili per ciascun flusso qui sopra.
