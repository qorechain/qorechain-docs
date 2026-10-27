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
première transaction. Une transaction signée uniquement de façon classique
est refusée par les réseaux en production ; donnez donc au client de transaction la
paire de clés ML-DSA-87 du compte et il signera chaque transaction en mode hybride. Les deux étapes ci-dessous nécessitent
le **SDK 0.9.0 ou ultérieur** (la 0.10.0 est la version actuelle) et un compte approvisionné :

```bash
npm i @qorechain/sdk
```

### 4a. Enregistrer votre clé post-quantique (une seule fois)

Le compte paie les frais : la clé de 2 592 octets nécessite une limite de gas
d'environ 600 000. `ensurePqcRegistered` lit d'abord l'état de la clé via REST
(`rest`), si bien qu'il saute la transaction lorsque la clé est déjà enregistrée, et il lève
`PqcKeyMismatchError` sans rien envoyer lorsque le compte détient une *autre*
clé (un second enregistrement est refusé **après le prélèvement des frais**). L'enregistrement est
l'unique transaction à signature classique que la chaîne accepte d'un compte sans
clé ; le client hybride l'envoie donc de lui-même de façon classique. Une fois que le réseau a
appliqué la v3.2.3 (c'est le cas des deux réseaux), l'assistant joint aussi la preuve de
possession facultative. La chaîne refuse les clés faibles, dégénérées ou réutilisées ; une clé issue de
`derivePqcCanonical` convient.

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

### 4b. Envoyer avec une signature hybride

`tx.bankSend` signe désormais en mode hybride. Les frais valent par défaut `"auto"` : le client simule
lui-même la transaction hybride et ajoute le gas de la vérification post-quantique,
que la simulation ne facture pas. Le prix minimal du gas du réseau est de 0,1 uqor par
unité de gas (le client applique 0,15). Utilisez `toBase("1.5")` pour convertir des QOR en `uqor`
de base.

```ts
import { toBase } from "@qorechain/sdk";

const result = await tx.bankSend("qor1recipientaddress...", [
  { denom: "uqor", amount: toBase("1.5") },
]);
console.log(result.transactionHash);
```

`toBase("1.5")` renvoie `"1500000"` (le QOR compte 10^6 unités de base `uqor`). Pour envoyer tout
autre message de la même manière, passez-le à `tx.signAndBroadcast([message], "auto")`.
Pour contrôler explicitement les frais, le numéro de compte et la séquence, utilisez
`signAndBroadcastHybrid` (voir
[Comptes et signature PQC](/sdk/concepts/accounts-pqc#hybrid-signing)).

:::info Comptes unifiés
Pour un compte unifié eth-native (`deriveUnifiedAccount`), utilisez plutôt
`EthNativeSigner` ; les exemples d'enregistrement et d'envoi se trouvent dans
[Comptes et signature PQC](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

:::note Sans paire de clés, le client signe de façon classique
`client.connectTx(signer)` sans `pqcKeypair` signe uniquement de façon classique. Les réseaux
publics l'acceptent pour le seul enregistrement de clé (un compte sans clé pour l'instant) ;
face à un nœud qui n'exige pas l'extension hybride (un nœud de développement local), il
envoie aussi les transferts ordinaires. Les versions du SDK antérieures à la 0.9.0 n'ont pas de
`TxClient` hybride : envoyez via `signAndBroadcastHybrid` (voir
[Versions antérieures à la 0.9.0](/sdk/install#before-090)).
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

- [Guides](/sdk/guides/evm) — travaillez avec chaque VM (EVM, SVM, QoreChain Native,
  cross-VM).
- [Comptes et signature PQC](/sdk/concepts/accounts-pqc) — dérivation HD,
  comptes unifiés eth-native et signature post-quantique.
- [Authentificateurs et dépenses déléguées](/sdk/guides/authenticators) —
  autorisez une clé Phantom/MetaMask liée à dépenser via un relayeur.
- [Référence réseau et endpoints](/sdk/reference/network).
- [Exemples](/sdk/examples) — extraits exécutables pour chacun des flux
  ci-dessus.
