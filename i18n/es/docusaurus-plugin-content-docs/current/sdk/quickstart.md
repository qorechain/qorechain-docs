---
slug: /sdk/quickstart
title: Inicio rápido
sidebar_label: Inicio rápido
sidebar_position: 3
---

# Inicio rápido

De cero a una transacción enviada. Esta página usa el SDK de TypeScript
(`@qorechain/sdk`); al final encontrarás fragmentos breves de conexión y lectura
para Python, Go y Rust.

## 1. Conectar

`createClient()` resuelve una red y compone los clientes de lectura, un asistente
de comisiones y un punto de entrada de firma con carga diferida. Por defecto
apunta a la testnet pública (`qorechain-diana`). Los endpoints predeterminados
apuntan a **localhost**, así que pasa `endpoints` para hablar con un nodo real.

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

La mainnet (chain id `qorechain-vladi`) está activa. Selecciónala y sustituye los
valores predeterminados de localhost por los endpoints públicos (o tu propio
nodo):

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

## 2. Derivar una cuenta

Un único mnemónico deriva cuentas nativas (`qor1…`), EVM (`0x…`) y SVM (base58)
mediante rutas de derivación independientes.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Native secp256k1, coin type 118)
```

Desde 0.6.0 puedes derivar en su lugar una **cuenta unificada eth-native** — una
sola clave `eth_secp256k1` representada como las tres direcciones (`qor1…`,
`0x…`, base58 de SVM) con un único saldo compartido:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const unified = await deriveUnifiedAccount(mnemonic);
console.log(unified.cosmos); // "qor1..."
console.log(unified.evm);    // "0x..."
console.log(unified.svm);    // base58 (same 20 bytes + 12 zero bytes)
```

Consulta [Cuentas y firma PQC](/sdk/concepts/accounts-pqc) para la derivación
EVM/SVM, las cuentas unificadas y la tabla completa de derivación.

## 3. Leer un saldo

```ts
// Native bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. Enviar una transferencia de QOR

Deriva una cuenta nativa, adapta su clave privada a un firmante, conecta un
`TxClient` y envía tokens. Usa `toBase("1.5")` para convertir QOR a la unidad
base `uqor`.

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

`toBase("1.5")` devuelve `"1500000"` (QOR tiene 10^6 unidades base `uqor`).

:::info Firma híbrida en las redes en producción
En mainnet y testnet la ruta Native requiere la extensión de firma **híbrida**
(clásica + ML-DSA-87) — usa `buildHybridTx` / `signAndBroadcastHybrid`, o
`signHybridEth` para cuentas unificadas eth-native. Consulta
[Firma híbrida](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

## Otros lenguajes: conectar y leer

Estos ejemplos replican los mismos presets de red y la misma superficie de
lectura.

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

## Siguientes pasos

- [Guías](/sdk/guides/evm) — trabaja con cada VM (EVM, SVM, CosmWasm, cross-VM).
- [Cuentas y firma PQC](/sdk/concepts/accounts-pqc) — derivación HD, cuentas
  unificadas eth-native y firma poscuántica.
- [Authenticators y gasto delegado](/sdk/guides/authenticators) — permite que
  una clave vinculada de Phantom/MetaMask gaste a través de un relayer.
- [Referencia de red y endpoints](/sdk/reference/network).
- [Ejemplos](/sdk/examples) — fragmentos ejecutables para cada flujo anterior.
