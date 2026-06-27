---
slug: /sdk/quickstart
title: Quickstart
sidebar_label: Quickstart
sidebar_position: 3
---

# Quickstart

De cero a una transacción enviada. Esta página usa el SDK de TypeScript
(`@qorechain/sdk`); al final siguen breves fragmentos de conexión y lectura para Python, Go y Rust.

## 1. Conectar

`createClient()` resuelve una red y compone los clientes de lectura, un helper de comisiones,
y un punto de entrada de firma diferida. Apunta por defecto a la testnet pública
(`qorechain-diana`). Los endpoints por defecto apuntan a **localhost**, así que
pasa `endpoints` para comunicarte con un nodo real.

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

La mainnet (chain id `qorechain-vladi`) está activa. Selecciónala y sobrescribe los
valores por defecto de localhost con las URL de tu nodo:

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

## 2. Derivar una cuenta

Un único mnemónico deriva cuentas native (`qor1…`), EVM (`0x…`) y SVM (base58)
mediante rutas de derivación independientes.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Cosmos-style secp256k1)
```

Consulta [Cuentas y firma PQC](/sdk/concepts/accounts-pqc) para la derivación EVM/SVM
y la tabla de derivación completa.

## 3. Leer un saldo

```ts
// Cosmos bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. Enviar una transferencia de QOR

Deriva una cuenta native, adapta su clave privada a un firmante, conecta un
`TxClient`, y envía tokens. Usa `toBase("1.5")` para convertir QOR a la base `uqor`.

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

`toBase("1.5")` devuelve `"1500000"` (QOR tiene 10^6 unidades base `uqor`).

## Otros lenguajes: conectar y leer

Estos reflejan los mismos preajustes de red y la misma superficie de lectura.

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

## Siguiente

- [Guías](/sdk/guides/evm) — trabaja con cada VM (EVM, SVM, CosmWasm, cross-VM).
- [Cuentas y firma PQC](/sdk/concepts/accounts-pqc) — derivación HD y
  firma post-cuántica.
- [Referencia de red y endpoints](/sdk/reference/network).
- [Ejemplos](/sdk/examples) — fragmentos ejecutables para cada flujo anterior.
