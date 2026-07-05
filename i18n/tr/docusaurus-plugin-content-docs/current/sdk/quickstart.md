---
slug: /sdk/quickstart
title: Hızlı Başlangıç
sidebar_label: Hızlı Başlangıç
sidebar_position: 3
---

# Hızlı Başlangıç

Sıfırdan gönderilmiş bir işleme. Bu sayfa TypeScript SDK'sını
(`@qorechain/sdk`) kullanır; Python, Go ve Rust için kısa bağlan-ve-oku kod
parçaları sonda yer alır.

## 1. Bağlanın

`createClient()`, bir ağı çözümler ve okuma istemcilerini, bir ücret
yardımcısını ve tembel (lazy) bir imzalama giriş noktasını bir araya getirir.
Varsayılan olarak genel testnet'i (`qorechain-diana`) hedefler. Varsayılan uç
noktalar **localhost**'a işaret eder; bu nedenle gerçek bir düğümle konuşmak
için `endpoints` parametresini geçirin.

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

Mainnet (chain id `qorechain-vladi`) canlıdır. Onu seçin ve localhost
varsayılanlarını genel uç noktalarla (veya kendi düğümünüzle) geçersiz kılın:

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

## 2. Bir hesap türetin

Tek bir anımsatıcı sözcük dizisi (mnemonic), bağımsız türetme yolları
aracılığıyla native (`qor1…`), EVM (`0x…`) ve SVM (base58) hesaplarını türetir.

```ts
import {
  generateMnemonic,
  deriveNativeAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words (pass 256 for 24 words)

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (Native secp256k1, coin type 118)
```

0.6.0 sürümünden itibaren bunun yerine **birleşik eth-native hesap**
türetebilirsiniz — üç adres olarak da (`qor1…`, `0x…`, SVM base58) sunulan ve
tek bir ortak bakiyeye sahip tek bir `eth_secp256k1` anahtarı:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const unified = await deriveUnifiedAccount(mnemonic);
console.log(unified.cosmos); // "qor1..."
console.log(unified.evm);    // "0x..."
console.log(unified.svm);    // base58 (same 20 bytes + 12 zero bytes)
```

EVM/SVM türetmesi, birleşik hesaplar ve tam türetme tablosu için
[Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc) sayfasına bakın.

## 3. Bir bakiye okuyun

```ts
// Native bank balances over REST.
const balances = await client.rest.getAllBalances(native.address);

// A typed qor_ JSON-RPC call.
const tokenomics = await client.qor.getTokenomicsOverview();
```

## 4. Bir QOR transferi gönderin

Bir native hesap türetin, özel anahtarını bir imzalayıcıya uyarlayın, bir
`TxClient` bağlayın ve token gönderin. QOR'u taban `uqor` birimine çevirmek
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

`toBase("1.5")`, `"1500000"` döndürür (QOR'un taban birimi `uqor`, 10^6
hassasiyetindedir).

:::info Canlı ağlarda hibrit imzalama
Mainnet ve testnet üzerinde Native yol, **hibrit** (klasik + ML-DSA-87) imza
uzantısını gerektirir — `buildHybridTx` / `signAndBroadcastHybrid`
fonksiyonlarını, birleşik eth-native hesaplar içinse `signHybridEth`
fonksiyonunu kullanın.
Bkz. [Hibrit imzalama](/sdk/concepts/accounts-pqc#hybrid-signing).
:::

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

## Sıradaki adımlar

- [Kılavuzlar](/sdk/guides/evm) — her bir VM ile çalışın (EVM, SVM, CosmWasm,
  VM'ler arası).
- [Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc) — HD türetme, birleşik
  eth-native hesaplar ve kuantum sonrası imzalama.
- [Authenticator'lar ve yetkilendirilmiş harcama](/sdk/guides/authenticators) —
  bağlı bir Phantom/MetaMask anahtarının bir relayer üzerinden harcama
  yapmasına izin verin.
- [Ağ ve uç nokta referansı](/sdk/reference/network).
- [Örnekler](/sdk/examples) — yukarıdaki her akış için çalıştırılabilir kod
  parçaları.
