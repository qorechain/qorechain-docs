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
vrai nœud. Les endpoints publics sont listés dans la
[référence réseau](/sdk/reference/network#public-endpoints).

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

// Any REST route works through the typed escape hatch, for example the burn
// statistics.
const burn = await client.rest.getBurnStats();
```

`client.qor` (les appels JSON-RPC `qor_` typés) n'est pas utilisable sur les
endpoints publics : aucune version publiée du nœud ne sert ce namespace, et
chaque appel renvoie `-32601` (méthode introuvable). Lisez plutôt via REST.
Consultez [le namespace `qor_`](/api-reference/json-rpc-qor_-namespace).

## 4. Envoyer un transfert de QOR {#send-qor}

Sur le mainnet et le testnet, chaque transaction de la voie Native doit porter
la signature **hybride** (secp256k1 classique plus ML-DSA-87), et la clé
ML-DSA-87 du compte doit être **enregistrée au préalable on-chain**.
L'enregistrement est explicite : il n'y a pas d'enregistrement automatique à la
première transaction. Un simple `tx.bankSend` (signature classique uniquement)
est refusé par les réseaux en production. Les deux étapes ci-dessous nécessitent
le **SDK 0.8.3 ou ultérieur** (`derivePqcCanonical` ; 0.8.1 ou ultérieur pour
les envois hybrides en général) et un compte approvisionné :

```bash
npm i @qorechain/sdk @cosmjs/stargate
```

### 4a. Enregistrer votre clé post-quantique (une seule fois)

L'enregistrement est signé de façon classique et exempté de l'exigence
hybride, de sorte qu'un nouveau compte peut amorcer sa première clé. Le compte
paie les frais : la clé de 2 592 octets nécessite une limite de gas d'environ
600 000.

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

### 4b. Envoyer avec une signature hybride

`signAndBroadcastHybrid` construit, signe et diffuse. Passez `rest` pour que le
SDK puisse demander au réseau quelle forme de sign-bytes il vérifie (voir
[Quelle forme de sign-bytes ?](/sdk/concepts/accounts-pqc#sign-bytes-versions)).
Utilisez `toBase("1.5")` pour convertir des QOR en `uqor` de base. Le prix
minimal du gas du réseau est de 0,1 uqor par unité de gas ; une limite de gas
de 400 000 nécessite donc des frais d'au moins 40 000 uqor.

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

`toBase("1.5")` renvoie `"1500000"` (le QOR compte 10^6 unités de base `uqor`).

:::info Comptes unifiés
Pour un compte unifié eth-native (`deriveUnifiedAccount`), utilisez plutôt
`EthNativeSigner` ; les exemples d'enregistrement et d'envoi se trouvent dans
[Comptes et signature PQC](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

:::note Les envois classiques ne fonctionnent que sur les nœuds locaux et de développement
La voie classique `client.connectTx(signer)` plus `tx.bankSend(...)` existe
toujours, et c'est celle qu'utilise `ensurePqcRegistered` pour l'unique
transaction d'enregistrement. Face à un nœud qui n'exige pas l'extension
hybride (un nœud de développement local), elle envoie aussi des transferts
ordinaires. Les réseaux publics la refusent.
:::

## Autres langages : connexion et lecture

Ces extraits reprennent les mêmes préréglages réseau et la même surface de
lecture. Ils utilisent les endpoints du testnet public ; pour le mainnet,
passez `"mainnet"` et les URL du mainnet.

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
