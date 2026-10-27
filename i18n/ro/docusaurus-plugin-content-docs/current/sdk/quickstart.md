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
un nod real. Endpoint-urile publice sunt listate în
[referința rețelei](/sdk/reference/network#public-endpoints).

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

// Any REST route works through the typed escape hatch, for example the burn
// statistics.
const burn = await client.rest.getBurnStats();
```

`client.qor` (apelurile JSON-RPC `qor_` tipizate) nu poate fi folosit pe
endpoint-urile publice: niciun build de nod publicat nu servește acel
namespace, așa că fiecare apel returnează `-32601` (method not found). Citiți
în schimb prin REST. Consultați
[namespace-ul `qor_`](/api-reference/json-rpc-qor_-namespace).

## 4. Trimiterea unui transfer QOR {#send-qor}

Pe mainnet și pe testnet, fiecare tranzacție pe calea Native trebuie să poarte
semnătura **hibridă** (secp256k1 clasic plus ML-DSA-87), iar cheia ML-DSA-87 a
contului trebuie să fie **înregistrată mai întâi on-chain**. Înregistrarea este
explicită: nu există înregistrare automată la prima tranzacție. O tranzacție
semnată doar clasic este refuzată de rețelele live, așa că dați clientului de
tranzacții perechea de chei ML-DSA-87 a contului și acesta semnează hibrid fiecare
tranzacție. Cei doi pași de mai jos necesită **SDK 0.9.0 sau mai nou** (0.10.0 este cea curentă) și un cont
alimentat cu fonduri:

```bash
npm i @qorechain/sdk
```

### 4a. Înregistrați cheia post-cuantică (o singură dată)

Contul plătește taxa: cheia de 2.592 de octeți necesită o limită de gas de
aproximativ 600.000. `ensurePqcRegistered` citește mai întâi starea cheii prin
REST (`rest`), deci sare peste tranzacție când cheia este deja înregistrată și
aruncă `PqcKeyMismatchError`, fără să trimită nimic, când contul deține o cheie
*diferită* (o a doua înregistrare este refuzată **după ce taxa este percepută**).
Înregistrarea este singura tranzacție semnată clasic pe care lanțul o acceptă de la
un cont fără cheie, așa că clientul hibrid o trimite singur în mod clasic. După ce
rețeaua a aplicat v3.2.3 (ambele rețele au făcut-o), helperul atașează și dovada
opțională de posesie. Lanțul refuză cheile slabe, degenerate sau refolosite; o cheie
de la `derivePqcCanonical` este în regulă.

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

### 4b. Trimiterea cu semnătură hibridă

`tx.bankSend` semnează acum hibrid. Taxa este implicit `"auto"`: clientul simulează
chiar tranzacția hibridă și adaugă gazul verificării post-cuantice, pe care
simularea nu îl taxează. Prețul minim al gazului în rețea este de 0,1 uqor per
unitate de gaz (clientul calculează la 0,15). Folosiți `toBase("1.5")` pentru a
converti QOR în `uqor` de bază.

```ts
import { toBase } from "@qorechain/sdk";

const result = await tx.bankSend("qor1recipientaddress...", [
  { denom: "uqor", amount: toBase("1.5") },
]);
console.log(result.transactionHash);
```

`toBase("1.5")` returnează `"1500000"` (QOR are 10^6 unități de bază `uqor`). Pentru
a trimite în același mod orice alt mesaj, pasați-l către
`tx.signAndBroadcast([message], "auto")`. Pentru control explicit asupra taxei,
numărului de cont și secvenței, folosiți `signAndBroadcastHybrid` (consultați
[Conturi & semnare PQC](/sdk/concepts/accounts-pqc#hybrid-signing)).

:::info Conturi unificate
Pentru un cont unificat eth-native (`deriveUnifiedAccount`), folosiți în
schimb `EthNativeSigner`; exemplele de înregistrare și trimitere se găsesc în
[Conturi & semnare PQC](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

:::note Fără o pereche de chei, clientul semnează clasic
`client.connectTx(signer)` fără `pqcKeypair` semnează doar clasic. Rețelele
publice acceptă asta doar pentru înregistrarea cheii (un cont fără cheie încă);
pe un nod care nu cere extensia hibridă (un nod local de dezvoltare), trimite și
transferuri obișnuite. Versiunile SDK anterioare lui 0.9.0 nu au un `TxClient`
hibrid: trimiteți prin `signAndBroadcastHybrid` (consultați
[Versiuni anterioare lui 0.9.0](/sdk/install#before-090)).
:::

## Alte limbaje: conectare & citire

Acestea reflectă aceleași preseturi de rețea și aceeași suprafață de citire.
Folosesc endpoint-urile publice de testnet; pentru mainnet transmiteți
`"mainnet"` și URL-urile de mainnet.

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

## Pașii următori

- [Ghiduri](/sdk/guides/evm) — lucrați cu fiecare VM (EVM, SVM, QoreChain Native,
  cross-VM).
- [Conturi & semnare PQC](/sdk/concepts/accounts-pqc) — derivare HD, conturi
  unificate eth-native și semnare post-cuantică.
- [Authenticators & cheltuieli delegate](/sdk/guides/authenticators) —
  permiteți unei chei Phantom/MetaMask conectate să cheltuiască printr-un
  relayer.
- [Referință rețea & endpoint-uri](/sdk/reference/network).
- [Exemple](/sdk/examples) — fragmente executabile pentru fiecare flux de mai
  sus.
