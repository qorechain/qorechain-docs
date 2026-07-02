---
slug: /getting-started/first-transaction
title: İlk İşlem
sidebar_label: İlk İşlem
sidebar_position: 5
---

# İlk İşlem

Bu kılavuz, QOR token gönderme, işlemleri sorgulama ve QoreChain ile yerel, EVM ve SVM arayüzleri üzerinden etkileşim kurma adımlarını anlatır.

:::note
Aşağıdaki komutlar **`qorechain-diana`** test ağını (EVM zincir kimliği **9800**) kullanır. Ana ağ (**`qorechain-vladi`**, EVM zincir kimliği **9801**) 7 Haziran 2026'dan beri canlıdır — ana ağda işlem yaparken **Ana Ağa Bağlanma** sayfasındaki ana ağ zincir kimliğini ve uç noktalarını kullanın.
:::

## Bakiyenizi Kontrol Etme

Token göndermeden önce hesap bakiyenizi doğrulayın:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

Yanıt, hesabın elinde tuttuğu tüm token cinslerini içerir. QOR bakiyeleri `uqor` (mikro-QOR) cinsinden görüntülenir; burada **1 QOR = 1.000.000 uqor**'dur.

## QOR Gönderme

Anahtarınızdan başka bir adrese token transfer edin:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Bu, alıcı adrese **1 QOR** (1.000.000 uqor) gönderir ve 500 uqor ücret öder.

:::caution Cosmos transferleri hibrit bir PQC imzası gerektirir
Cosmos yolunda ağın varsayılanı `hybrid_signature_mode = required`'dır (geçerli zincir sürümü **v3.1.82**). Düz klasik bir `tx bank send` **reddedilir** — her cosmos yolu işlemi, secp256k1 imzasının yanında bir ML-DSA-87 (Dilithium-5) imzası taşımalıdır. `qorechaind tx pqc gen-key` ile bir Dilithium-5 anahtarı oluşturun, ardından `qorechaind tx pqc cosign` ile hibrit eş imzayı ekleyin (veya anahtarın ilk kullanımda otomatik olarak kaydedilmesi için `includePqcPublicKey` kullanarak işlemi QoreChain SDK'sının `buildHybridTx`'i ile oluşturun). Hibrit imzayı CLI dışında üretmek için, açık kaynaklı [**qorechain-pqc**](/developer-guide/post-quantum-signing) kütüphanesi (`hybridSignBytes`) ve QoreChain SDK'sı bunun eşdeğerini kodda yapar. Tam hibrit akış için [Cüzdan Kurulumu](/getting-started/wallet-setup) bölümüne bakın.
:::

İşlem yayınlanmadan önce onaylamanız istenecektir. Onaylandıktan sonra CLI bir işlem karması (hash) döndürür.

## İşlemi Sorgulama

Tamamlanmış bir işlemi karması (hash) ile arayın:

```bash
qorechaind query tx <txhash>
```

Çıktı, işlem durumunu, kullanılan gazı, blok yüksekliğini ve yürütme sırasında yayılan tüm olayları içerir.

JSON çıktısı için:

```bash
qorechaind query tx <txhash> --output json
```

## JSON-RPC Kullanımı (EVM)

QoreChain'in EVM yürütme ortamı, `8545` portunda standart bir Ethereum JSON-RPC arayüzü sunar.

:::note
EVM işlemleri, cosmos yolu hibrit PQC gereksiniminden **etkilenmez**. Ayrı bir `eth_secp256k1` ante yolu kullanırlar; bu nedenle standart Ethereum imzalama (MetaMask, ethers.js vb.) bir PQC uzantısı olmadan çalışır.
:::

### En Son Blok Numarasını Alma

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }' | jq '.result'
```

### Bir Hesap Bakiyesini Alma

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0xYourEVMAddress", "latest"],
    "id": 1
  }' | jq '.result'
```

Bakiye, en küçük cinste onaltılık kodlanmış bir değer olarak döndürülür.

## SVM RPC Kullanımı

QoreChain'in SVM yürütme ortamı, `8899` portunda Solana uyumlu bir RPC arayüzü sunar.

### Geçerli Slotu Alma

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getSlot",
    "id": 1
  }' | jq '.result'
```

### Bir Hesap Bakiyesini Alma

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["YourSVMPublicKey"],
    "id": 1
  }' | jq '.result'
```

## Yaygın CLI Kalıpları

`qorechaind` CLI ile çalışırken şu bayraklar sıkça kullanılır:

| Bayrak             | Açıklama                       | Örnek                          |
| ------------------ | ----------------------------- | ------------------------------ |
| `--chain-id`       | Hedef zinciri belirtir        | `--chain-id qorechain-diana`   |
| `--fees`           | uqor cinsinden işlem ücreti   | `--fees 500uqor`               |
| `--from`           | İmzalama anahtarı adı veya adresi | `--from mykey`             |
| `--output`         | Yanıt biçimi                  | `--output json`                |
| `--node`           | Bağlanılacak RPC uç noktası   | `--node tcp://localhost:26657` |
| `--gas`            | İşlem için gaz limiti         | `--gas auto`                   |
| `--gas-adjustment` | Tahmini gaz için çarpan       | `--gas-adjustment 1.3`         |
| `-y`               | Onay istemini atla            | `-y`                           |

### Örnek: Tüm Yaygın Bayraklarla Tam Komut

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor \
  --node tcp://localhost:26657 \
  --output json \
  -y
```

## Sonraki Adımlar

İlk işleminizi gönderdiğinize göre, QoreChain'in sunduğu daha fazlasını keşfedin:

* **Stake Etme ve Delegasyon** — QOR stake edin ve ödüller kazanın
* **Varlık Köprüleme** — Varlıkları zincirler arasında taşıyın
* **EVM Geliştirme** — QoreChain üzerinde Solidity akıllı sözleşmeleri dağıtın
