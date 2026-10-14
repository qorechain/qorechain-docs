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
Sie daher `endpoints`, um mit einem echten Node zu kommunizieren. Die öffentlichen
Endpunkte sind in der [Netzwerk-Referenz](/sdk/reference/network#public-endpoints)
aufgeführt.

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

// Any REST route works through the typed escape hatch, for example the burn
// statistics.
const burn = await client.rest.getBurnStats();
```

`client.qor` (die typisierten `qor_`-JSON-RPC-Aufrufe) ist auf den öffentlichen
Endpunkten nicht nutzbar: Kein veröffentlichter Node-Build stellt diesen Namespace
bereit, daher liefert jeder Aufruf `-32601` (Methode nicht gefunden). Lesen Sie
stattdessen über REST. Siehe
[den `qor_`-Namespace](/api-reference/json-rpc-qor_-namespace).

## 4. Eine QOR-Überweisung senden {#send-qor}

Auf Mainnet und Testnet muss jede Transaktion auf dem Native-Pfad die **hybride**
Signatur (klassisches secp256k1 plus ML-DSA-87) tragen, und der ML-DSA-87-Schlüssel
des Kontos muss **zuerst on-chain registriert** sein. Die Registrierung erfolgt
explizit: Es gibt keine automatische Registrierung bei der ersten Transaktion. Ein
einfaches `tx.bankSend` (nur klassische Signatur) wird von den Live-Netzwerken
abgelehnt. Die beiden folgenden Schritte erfordern **SDK 0.8.3 oder neuer**
(`derivePqcCanonical`; 0.8.1 oder neuer für hybride Sendungen allgemein) und ein
finanziertes Konto:

```bash
npm i @qorechain/sdk @cosmjs/stargate
```

### 4a. Ihren Post-Quanten-Schlüssel registrieren (einmalig)

Die Registrierung wird klassisch signiert und ist von der Hybrid-Anforderung
ausgenommen, sodass ein neues Konto seinen ersten Schlüssel bootstrappen kann. Das
Konto zahlt die Gebühr: Der 2.592 Byte große Schlüssel benötigt ein Gas-Limit von
etwa 600.000.

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
const tx = await client.connectTx(signer);

// The address-bound ML-DSA-87 key, recoverable from { address, mnemonic }.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// Read the status over REST (the default status source needs `qor_`).
const { found } = await client.rest.get<{ found: boolean }>(
  `/qorechain/pqc/v1/account/${account.address}`,
);

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },          // skips the transaction when already registered
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
console.log(res.alreadyRegistered ? "already registered" : res.txHash);
```

### 4b. Mit hybrider Signatur senden

`signAndBroadcastHybrid` baut, signiert und sendet. Übergeben Sie `rest`, damit das
SDK das Netzwerk fragen kann, welche Sign-Bytes-Form es verifiziert (siehe
[Welche Sign-Bytes-Form?](/sdk/concepts/accounts-pqc#sign-bytes-versions)).
Verwenden Sie `toBase("1.5")`, um QOR in die Basiseinheit `uqor` umzurechnen. Der
minimale Gaspreis des Netzwerks beträgt 0,1 uqor pro Gas-Einheit, sodass ein
Gas-Limit von 400.000 eine Gebühr von mindestens 40.000 uqor erfordert.

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  signAndBroadcastHybrid,
  qorechainRegistry,
  MSG_SEND_TYPE_URL,
  toBase,
} from "@qorechain/sdk";

const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(account.address); // { accountNumber, sequence }

const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [
    {
      typeUrl: MSG_SEND_TYPE_URL,
      value: {
        fromAddress: account.address,
        toAddress: "qor1recipientaddress...",
        amount: [{ denom: "uqor", amount: toBase("1.5") }],
      },
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: client.network.chainId,
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,
  transport,
});

console.log(result.transactionHash);
```

`toBase("1.5")` liefert `"1500000"` (QOR hat 10^6 Basiseinheiten in `uqor`).

:::info Unified Accounts
Verwenden Sie für ein unified eth-native Konto (`deriveUnifiedAccount`)
stattdessen `EthNativeSigner`; die Beispiele für Registrierung und Senden finden
Sie unter [Konten & PQC-Signierung](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

:::note Klassische Sendungen funktionieren nur auf lokalen und Dev-Nodes
Der klassische Pfad `client.connectTx(signer)` plus `tx.bankSend(...)` existiert
weiterhin, und `ensurePqcRegistered` nutzt ihn für die eine Registrierungstransaktion.
Gegenüber einem Node, der die Hybrid-Erweiterung nicht verlangt (ein lokaler
Dev-Node), sendet er auch gewöhnliche Überweisungen. Die öffentlichen Netzwerke
lehnen ihn ab.
:::

## Weitere Sprachen: Verbinden & Lesen

Diese spiegeln dieselben Netzwerk-Presets und dieselbe Lese-Oberfläche wider. Sie
verwenden die öffentlichen Testnet-Endpunkte; übergeben Sie für das Mainnet
`"mainnet"` und die Mainnet-URLs.

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

## Nächste Schritte

- [Guides](/sdk/guides/evm) — arbeiten Sie mit jeder VM (EVM, SVM, CosmWasm, Cross-VM).
- [Konten & PQC-Signierung](/sdk/concepts/accounts-pqc) — HD-Ableitung, unified
  eth-native Konten und Post-Quanten-Signierung.
- [Authenticators & delegiertes Ausgeben](/sdk/guides/authenticators) — lassen
  Sie einen verknüpften Phantom-/MetaMask-Schlüssel über einen Relayer ausgeben.
- [Netzwerk- & Endpunkt-Referenz](/sdk/reference/network).
- [Beispiele](/sdk/examples) — ausführbare Snippets für jeden der obigen Abläufe.
