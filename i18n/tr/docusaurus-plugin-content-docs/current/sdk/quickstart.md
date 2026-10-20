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
için `endpoints` parametresini geçirin. Genel uç noktalar [ağ
referansında](/sdk/reference/network#public-endpoints) listelenmiştir.

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

// Any REST route works through the typed escape hatch, for example the burn
// statistics.
const burn = await client.rest.getBurnStats();
```

`client.qor` (tipli `qor_` JSON-RPC çağrıları) genel uç noktalarda
kullanılamaz: yayımlanmış hiçbir düğüm sürümü bu ad alanını sunmaz, bu yüzden
her çağrı `-32601` (method not found) döndürür. Bunun yerine REST üzerinden
okuyun. Bkz. [`qor_` ad alanı](/api-reference/json-rpc-qor_-namespace).

## 4. Bir QOR transferi gönderin {#send-qor}

Mainnet ve testnet üzerinde her Native yol işlemi **hibrit** (klasik secp256k1
artı ML-DSA-87) imza taşımalıdır ve hesabın ML-DSA-87 anahtarı önce
**zincir üzerinde kaydedilmiş** olmalıdır. Kayıt açıkça yapılır: ilk işlemde
otomatik kayıt yoktur. Yalnızca klasik imzalanmış bir işlem canlı ağlar
tarafından reddedilir; bu nedenle işlem istemcisine hesabın ML-DSA-87 anahtar
çiftini verin, o da her işlemi hibrit imzalasın. Aşağıdaki iki adım **SDK 0.9.0
veya üstünü** ve bakiyesi olan bir hesabı gerektirir:

```bash
npm i @qorechain/sdk
```

### 4a. Kuantum sonrası anahtarınızı kaydedin (bir kez)

Ücreti hesap öder: 2.592 baytlık anahtar yaklaşık 600.000 gas limiti gerektirir.
`ensurePqcRegistered` anahtar durumunu önce REST üzerinden okur (`rest`); böylece
anahtar zaten kayıtlıysa işlemi atlar ve hesap *farklı* bir anahtar tutuyorsa hiçbir
şey göndermeden `PqcKeyMismatchError` fırlatır (ikinci bir kayıt **ücret alındıktan
sonra** reddedilir). Kayıt, zincirin anahtarı olmayan bir hesaptan kabul ettiği tek
klasik imzalı işlemdir; bu nedenle hibrit istemci onu kendiliğinden klasik olarak
gönderir. Ağ v3.2.3'ü uyguladıktan sonra (her iki ağ da uyguladı) yardımcı,
isteğe bağlı sahiplik kanıtını da ekler. Zincir zayıf, dejenere veya yeniden
kullanılmış anahtarları reddeder; `derivePqcCanonical`'dan gelen bir anahtar
sorun çıkarmaz.

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

### 4b. Hibrit imzayla gönderin

`tx.bankSend` artık hibrit imzalar. Ücret varsayılan olarak `"auto"`'dur: istemci
hibrit işlemin kendisini simüle eder ve simülasyonun ücretlendirmediği kuantum
sonrası doğrulamanın gas'ini ekler. Ağın asgari gas fiyatı gas birimi başına 0,1
uqor'dur (istemci 0,15 üzerinden fiyatlar). QOR'u taban `uqor` birimine çevirmek
için `toBase("1.5")` kullanın.

```ts
import { toBase } from "@qorechain/sdk";

const result = await tx.bankSend("qor1recipientaddress...", [
  { denom: "uqor", amount: toBase("1.5") },
]);
console.log(result.transactionHash);
```

`toBase("1.5")`, `"1500000"` döndürür (QOR'un taban birimi `uqor`, 10^6
hassasiyetindedir). Başka bir mesajı aynı şekilde göndermek için onu
`tx.signAndBroadcast([message], "auto")` çağrısına geçirin. Ücret, hesap numarası
ve sıra numarası üzerinde açık denetim için `signAndBroadcastHybrid` kullanın
(bkz. [Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc#hybrid-signing)).

:::info Birleşik hesaplar
Birleşik bir eth-native hesap (`deriveUnifiedAccount`) için bunun yerine
`EthNativeSigner` kullanın; kayıt ve gönderim örnekleri
[Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc#hybrid-signing)
sayfasındadır.
:::

:::note Anahtar çifti olmadan istemci klasik imzalar
`pqcKeypair` olmadan `client.connectTx(signer)` yalnızca klasik imzalar. Genel
ağlar bunu yalnızca anahtar kaydı için kabul eder (henüz anahtarı olmayan bir
hesap); hibrit uzantıyı gerektirmeyen bir düğümde (yerel bir geliştirme düğümü)
sıradan transferleri de gönderir. 0.9.0 öncesi SDK sürümlerinde hibrit `TxClient`
yoktur: `signAndBroadcastHybrid` üzerinden gönderin (bkz.
[0.9.0 öncesi sürümler](/sdk/install#before-090)).
:::

## Diğer diller: bağlan ve oku

Bunlar aynı ağ ön ayarlarını ve okuma yüzeyini yansıtır. Genel testnet uç
noktalarını kullanırlar; mainnet için `"mainnet"` ve mainnet URL'lerini geçirin.

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
