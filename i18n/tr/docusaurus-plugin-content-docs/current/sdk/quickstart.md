---
slug: /sdk/quickstart
title: Hızlı Başlangıç
sidebar_label: Hızlı Başlangıç
sidebar_position: 3
---

# Hızlı başlangıç

Sıfırdan gönderilmiş bir işleme. Bu sayfa TypeScript SDK'sını
(`@qorechain/sdk`) kullanır; Python, Go ve Rust için kısa bağlan-ve-oku kod
parçaları sonda yer alır.

## 1. Bağlanın

`createClient()`, bir ağı çözümler ve okuma istemcilerini, bir ücret yardımcısını
ve tembel (lazy) bir imzalama giriş noktasını oluşturur. Varsayılan olarak genel
testnet'i (`qorechain-diana`) hedefler. Varsayılan uç noktalar **localhost**'a
işaret eder, bu nedenle gerçek bir düğümle konuşmak için `endpoints` parametresini
geçirin.

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

Mainnet (chain id `qorechain-vladi`) yayında. Onu seçin ve localhost
varsayılanlarını kendi düğüm URL'lerinizle geçersiz kılın:

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

## 2. Bir hesap türetin

Tek bir mnemonic, bağımsız türetme yolları aracılığıyla yerel (`qor1…`), EVM
(`0x…`) ve SVM (base58) hesaplarını türetir.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Cosmos-style secp256k1)
```

EVM/SVM türetme ve tam türetme tablosu için
[Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc) bölümüne bakın.

## 3. Bir bakiye okuyun

```ts
// Cosmos bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. Bir QOR transferi gönderin

Bir yerel hesap türetin, özel anahtarını bir imzalayıcıya uyarlayın, bir
`TxClient` bağlayın ve token gönderin. QOR'u temel `uqor` birimine dönüştürmek
için `toBase("1.5")` kullanın.

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

`toBase("1.5")`, `"1500000"` döndürür (QOR'un 10^6 temel `uqor` birimi vardır).

## Diğer diller: bağlan ve oku

Bunlar aynı ağ ön ayarlarını ve okuma yüzeyini yansıtır.

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

## Sırada

- [Kılavuzlar](/sdk/guides/evm) — her VM ile çalışın (EVM, SVM, CosmWasm, VM'ler arası).
- [Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc) — HD türetme ve
  kuantum sonrası imzalama.
- [Ağ ve uç nokta referansı](/sdk/reference/network).
- [Örnekler](/sdk/examples) — yukarıdaki her akış için çalıştırılabilir kod parçaları.
