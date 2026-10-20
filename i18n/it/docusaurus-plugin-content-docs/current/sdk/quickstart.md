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
un nodo reale. Gli endpoint pubblici sono elencati nel
[riferimento di rete](/sdk/reference/network#public-endpoints).

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

// Any REST route works through the typed escape hatch, for example the burn
// statistics.
const burn = await client.rest.getBurnStats();
```

`client.qor` (le chiamate JSON-RPC `qor_` tipizzate) non è utilizzabile sugli
endpoint pubblici: nessuna build del nodo rilasciata serve quel namespace,
quindi ogni chiamata restituisce `-32601` (metodo non trovato). Leggi invece
tramite REST. Vedi [il namespace `qor_`](/api-reference/json-rpc-qor_-namespace).

## 4. Inviare un trasferimento QOR {#send-qor}

Su mainnet e testnet ogni transazione del percorso Native deve portare la firma
**ibrida** (secp256k1 classica più ML-DSA-87), e la chiave ML-DSA-87
dell'account deve essere **registrata prima on-chain**. La registrazione è
esplicita: non esiste alcuna registrazione automatica alla prima transazione. Una
transazione firmata solo in modo classico viene rifiutata dalle reti live, quindi
dai al client delle transazioni la coppia di chiavi ML-DSA-87 dell'account e
firmerà ogni transazione in modo ibrido. I due passaggi seguenti richiedono
**SDK 0.9.0 o successivo** e un account con fondi:

```bash
npm i @qorechain/sdk
```

### 4a. Registrare la tua chiave post-quantistica (una sola volta)

L'account paga la commissione: la chiave da 2.592 byte richiede un gas limit di
circa 600.000. `ensurePqcRegistered` legge prima lo stato della chiave via REST
(`rest`), quindi salta la transazione quando la chiave è già registrata, e lancia
`PqcKeyMismatchError` senza inviare nulla quando l'account detiene una chiave
*diversa* (una seconda registrazione viene rifiutata **dopo che la commissione è
stata prelevata**). La registrazione è l'unica transazione firmata in modo classico
che la chain accetta da un account senza chiave, quindi il client ibrido la invia
da sé in modo classico. Una volta che la rete ha applicato la v3.2.3 (lo hanno
fatto entrambe le reti), l'helper allega anche la prova di possesso opzionale. La
chain rifiuta chiavi deboli, degeneri o riutilizzate; una chiave ottenuta da
`derivePqcCanonical` va bene.

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

### 4b. Inviare con una firma ibrida

`tx.bankSend` ora firma in modo ibrido. La commissione è `"auto"` per impostazione
predefinita: il client simula da sé la transazione ibrida e aggiunge il gas della
verifica post-quantistica, che la simulazione non addebita. Il prezzo minimo del
gas della rete è 0,1 uqor per unità di gas (il client applica 0,15). Usa
`toBase("1.5")` per convertire QOR in `uqor` base.

```ts
import { toBase } from "@qorechain/sdk";

const result = await tx.bankSend("qor1recipientaddress...", [
  { denom: "uqor", amount: toBase("1.5") },
]);
console.log(result.transactionHash);
```

`toBase("1.5")` restituisce `"1500000"` (QOR ha 10^6 unità base `uqor`). Per
inviare allo stesso modo qualsiasi altro messaggio, passalo a
`tx.signAndBroadcast([message], "auto")`. Per un controllo esplicito di
commissione, numero di account e sequence, usa `signAndBroadcastHybrid` (vedi
[Account e firma PQC](/sdk/concepts/accounts-pqc#hybrid-signing)).

:::info Account unificati
Per un account unificato eth-native (`deriveUnifiedAccount`), usa invece
`EthNativeSigner`; gli esempi di registrazione e invio si trovano in
[Account e firma PQC](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

:::note Senza una coppia di chiavi il client firma in modo classico
`client.connectTx(signer)` senza `pqcKeypair` firma solo in modo classico. Le reti
pubbliche lo accettano soltanto per la registrazione della chiave (un account
senza ancora una chiave); contro un nodo che non richiede l'estensione ibrida (un
nodo di sviluppo locale) invia anche i trasferimenti ordinari. Le versioni
dell'SDK precedenti alla 0.9.0 non hanno un `TxClient` ibrido: invia tramite
`signAndBroadcastHybrid` (vedi
[Versioni precedenti alla 0.9.0](/sdk/install#before-090)).
:::

## Altri linguaggi: connessione e lettura

Questi rispecchiano gli stessi preset di rete e la stessa superficie di lettura.
Usano gli endpoint della testnet pubblica; per la mainnet passa `"mainnet"` e gli
URL della mainnet.

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

## Prossimi passi

- [Guide](/sdk/guides/evm) — lavora con ciascuna VM (EVM, SVM, CosmWasm,
  cross-VM).
- [Account e firma PQC](/sdk/concepts/accounts-pqc) — derivazione HD, account
  unificati eth-native e firma post-quantistica.
- [Authenticator e spesa delegata](/sdk/guides/authenticators) — consenti a una
  chiave Phantom/MetaMask collegata di spendere tramite un relayer.
- [Riferimento rete ed endpoint](/sdk/reference/network).
- [Esempi](/sdk/examples) — snippet eseguibili per ciascun flusso qui sopra.
