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
otomatik kayıt yoktur. Düz bir `tx.bankSend` (yalnızca klasik imza) canlı ağlar
tarafından reddedilir. Aşağıdaki iki adım **SDK 0.8.3 veya üstünü**
(`derivePqcCanonical`; genel olarak hibrit gönderimler için 0.8.1 veya üstü) ve
bakiyesi olan bir hesabı gerektirir:

```bash
npm i @qorechain/sdk @cosmjs/stargate
```

### 4a. Kuantum sonrası anahtarınızı kaydedin (bir kez)

Kayıt klasik imzalıdır ve hibrit gereklilikten muaftır; böylece yeni bir hesap
ilk anahtarını başlatabilir. Ücreti hesap öder: 2.592 baytlık anahtar yaklaşık
600.000 gas limiti gerektirir.

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

### 4b. Hibrit imzayla gönderin

`signAndBroadcastHybrid` işlemi oluşturur, imzalar ve yayınlar. SDK'nın ağa
hangi sign-bytes biçimini doğruladığını sorabilmesi için `rest` parametresini
geçirin (bkz. [Hangi sign-bytes biçimi?](/sdk/concepts/accounts-pqc#sign-bytes-versions)).
QOR'u taban `uqor` birimine çevirmek için `toBase("1.5")` kullanın. Ağın asgari
gas fiyatı gas birimi başına 0,1 uqor'dur; dolayısıyla 400.000'lik bir gas
limiti en az 40.000 uqor ücret gerektirir.

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

`toBase("1.5")`, `"1500000"` döndürür (QOR'un taban birimi `uqor`, 10^6
hassasiyetindedir).

:::info Birleşik hesaplar
Birleşik bir eth-native hesap (`deriveUnifiedAccount`) için bunun yerine
`EthNativeSigner` kullanın; kayıt ve gönderim örnekleri
[Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc#hybrid-signing)
sayfasındadır.
:::

:::note Klasik gönderimler yalnızca yerel ve geliştirme düğümlerinde çalışır
Klasik `client.connectTx(signer)` artı `tx.bankSend(...)` yolu hâlâ mevcuttur
ve `ensurePqcRegistered` tek seferlik kayıt işlemi için bu yolu kullanır.
Hibrit uzantıyı gerektirmeyen bir düğümde (yerel bir geliştirme düğümü) sıradan
transferleri de bu yolla gönderebilir. Genel ağlar bunu reddeder.
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
