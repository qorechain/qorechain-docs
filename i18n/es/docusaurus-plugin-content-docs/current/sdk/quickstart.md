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
Los endpoints públicos se enumeran en la
[referencia de red](/sdk/reference/network#public-endpoints).

```ts
import { createClient } from "@qorechain/sdk";

// Testnet (chain id "qorechain-diana"), default localhost endpoints.
const client = createClient();

// Point at the public testnet by overriding endpoints.
const remote = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",   // Native REST (LCD)
    rpc: "https://rpc-testnet.qore.host",    // consensus RPC (for signing)
    evmRpc: "https://evm-testnet.qore.host", // EVM JSON-RPC (eth_*)
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

// Any REST route works through the typed escape hatch, for example the burn
// statistics.
const burn = await client.rest.getBurnStats();
```

`client.qor` (las llamadas JSON-RPC `qor_` tipadas) no se puede usar en los
endpoints públicos: ninguna compilación de nodo publicada sirve ese espacio de
nombres, por lo que cada llamada devuelve `-32601` (método no encontrado). Lee a
través de REST. Consulta
[el espacio de nombres `qor_`](/api-reference/json-rpc-qor_-namespace).

## 4. Enviar una transferencia de QOR {#send-qor}

En mainnet y testnet toda transacción de la ruta Native debe llevar la firma
**híbrida** (secp256k1 clásica más ML-DSA-87), y la clave ML-DSA-87 de la cuenta
debe estar **registrada primero on-chain**. El registro es explícito: no hay
autorregistro en la primera transacción. Una transacción firmada solo de forma
clásica es rechazada por las redes en producción, así que entrega al cliente de
transacciones el keypair ML-DSA-87 de la cuenta y firmará cada transacción de forma
híbrida. Los dos pasos siguientes requieren **SDK 0.9.0 o posterior** (la 0.10.0 es la actual) y una cuenta
con fondos:

```bash
npm i @qorechain/sdk
```

### 4a. Registra tu clave poscuántica (una sola vez)

La cuenta paga la comisión: la clave de 2.592 bytes necesita un límite de gas de
unos 600.000. `ensurePqcRegistered` lee primero el estado de la clave por REST
(`rest`), así que omite la transacción cuando la clave ya está registrada, y lanza
`PqcKeyMismatchError` sin enviar nada cuando la cuenta tiene una clave *distinta*
(un segundo registro es rechazado **después de cobrar la comisión**). El registro es
la única transacción de firma clásica que la cadena acepta de una cuenta sin clave,
por lo que el cliente híbrido la envía de forma clásica por sí mismo. Una vez que la
red ha aplicado la v3.2.3 (ambas redes la han aplicado), el asistente también adjunta
la prueba de posesión opcional. La cadena rechaza las claves débiles, degeneradas o
reutilizadas; una clave de `derivePqcCanonical` es válida.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const REST = "https://api-testnet.qore.host";
const RPC = "https://rpc-testnet.qore.host";

const client = createClient({ endpoints: { rest: REST, rpc: RPC } });

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// The address-bound ML-DSA-87 key, recoverable from { address, mnemonic }.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// With the keypair, every transaction this client sends is signed hybrid.
const tx = await client.connectTx(signer, { pqcKeypair });

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  rest: client.network.endpoints.rest, // reads the status first; never registers blind
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
console.log(res.alreadyRegistered ? "already registered" : res.txHash);
```

### 4b. Envía con firma híbrida

`tx.bankSend` ahora firma de forma híbrida. La comisión es `"auto"` por defecto: el
cliente simula la propia transacción híbrida y añade el gas de la verificación
poscuántica, que la simulación no cobra. El precio mínimo de gas de la red es de
0,1 uqor por unidad de gas (el cliente fija el precio en 0,15). Usa `toBase("1.5")`
para convertir QOR a la unidad base `uqor`.

```ts
import { toBase } from "@qorechain/sdk";

const result = await tx.bankSend("qor1recipientaddress...", [
  { denom: "uqor", amount: toBase("1.5") },
]);
console.log(result.transactionHash);
```

`toBase("1.5")` devuelve `"1500000"` (QOR tiene 10^6 unidades base `uqor`). Para
enviar cualquier otro mensaje del mismo modo, pásalo a
`tx.signAndBroadcast([message], "auto")`. Para controlar explícitamente la comisión,
el número de cuenta y la secuencia, usa `signAndBroadcastHybrid` (consulta
[Cuentas y firma PQC](/sdk/concepts/accounts-pqc#hybrid-signing)).

:::info Cuentas unificadas
Para una cuenta unificada eth-native (`deriveUnifiedAccount`), usa
`EthNativeSigner` en su lugar; los ejemplos de registro y envío están en
[Cuentas y firma PQC](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

:::note Sin un keypair el cliente firma de forma clásica
`client.connectTx(signer)` sin `pqcKeypair` firma solo de forma clásica. Las redes
públicas lo aceptan únicamente para el registro de clave (una cuenta que aún no tiene
clave); frente a un nodo que no exige la extensión híbrida (un nodo de desarrollo
local) también envía transferencias ordinarias. Las versiones del SDK anteriores a la
0.9.0 no tienen un `TxClient` híbrido: envía mediante `signAndBroadcastHybrid` (consulta
[Versiones anteriores a la 0.9.0](/sdk/install#before-090)).
:::

## Otros lenguajes: conectar y leer

Estos ejemplos replican los mismos presets de red y la misma superficie de
lectura. Usan los endpoints de la testnet pública; para mainnet pasa `"mainnet"` y
las URL de mainnet.

### Python

```python
from qorsdk import create_client

client = create_client(
    network="testnet",
    endpoints={
        "rest": "https://api-testnet.qore.host",
        "rpc": "https://rpc-testnet.qore.host",
        "evm_rpc": "https://evm-testnet.qore.host",
    },
)
print(client.network.chain_id)  # "qorechain-diana"

balances = client.rest.get_all_balances("qor1...")
burn = client.rest.get_burn_stats()
client.close()
```

### Go

```go
import (
    "fmt"

    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
)

c, err := client.CreateClient(client.Options{
    Network: "testnet",
    Endpoints: client.EndpointOverrides{
        REST:   "https://api-testnet.qore.host",
        RPC:    "https://rpc-testnet.qore.host",
        EVMRPC: "https://evm-testnet.qore.host",
    },
})
if err != nil {
    panic(err)
}
fmt.Println(c.Network.ChainID) // qorechain-diana

balances, err := c.REST.GetAllBalances("qor1...")
burn, err := c.REST.GetBurnStats()
```

### Rust

```rust
use qorechain::ClientBuilder;

#[tokio::main]
async fn main() -> qorechain::Result<()> {
    let client = ClientBuilder::new()
        .network("testnet")
        .rest("https://api-testnet.qore.host")
        .rpc("https://rpc-testnet.qore.host")
        .evm_rpc("https://evm-testnet.qore.host")
        .build()?;
    let balances = client.rest.get_all_balances("qor1...").await?;
    let burn = client.rest.get_burn_stats().await?;
    let _ = (balances, burn);
    Ok(())
}
```

## Siguientes pasos

- [Guías](/sdk/guides/evm) — trabaja con cada VM (EVM, SVM, QoreChain Native, cross-VM).
- [Cuentas y firma PQC](/sdk/concepts/accounts-pqc) — derivación HD, cuentas
  unificadas eth-native y firma poscuántica.
- [Authenticators y gasto delegado](/sdk/guides/authenticators) — permite que
  una clave vinculada de Phantom/MetaMask gaste a través de un relayer.
- [Referencia de red y endpoints](/sdk/reference/network).
- [Ejemplos](/sdk/examples) — fragmentos ejecutables para cada flujo anterior.
