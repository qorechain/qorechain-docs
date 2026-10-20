---
slug: /getting-started/first-transaction
title: İlk İşlem
sidebar_label: İlk İşlem
sidebar_position: 5
---

# İlk İşlem

Bu kılavuz, QOR token gönderme, işlemleri sorgulama ve QoreChain ile yerel, EVM ve SVM arayüzleri üzerinden etkileşim kurma adımlarını anlatır.

:::note
Aşağıdaki komutlar **`qorechain-diana`** test ağını (EVM zincir kimliği **9800**) kullanır. Ana ağ (**`qorechain-vladi`**, EVM zincir kimliği **9801**) 7 Haziran 2026'dan beri canlıdır ve v3.2.3 sürümünü çalıştırır (test ağı v3.2.4 çalıştırır) — ana ağda işlem yaparken **Ana Ağa Bağlanma** sayfasındaki ana ağ zincir kimliğini ve uç noktalarını kullanın.
:::

## Bakiyenizi Kontrol Etme

Token göndermeden önce hesap bakiyenizi doğrulayın:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

Yanıt, hesabın elinde tuttuğu tüm token cinslerini içerir. QOR bakiyeleri `uqor` (mikro-QOR) cinsinden görüntülenir; burada **1 QOR = 1,000,000 uqor**'dur.

## QOR Gönderme {#send-qor}

Bir QoreChain hesabı, Cosmos hattında **hibrit bir imzayla** gönderim yapar: klasik secp256k1 imzası artı bir ML-DSA-87 (Dilithium-5) imzası. Düz bir `qorechaind tx bank send ... -y` reddedilir; bu nedenle transfer önce imzasız olarak oluşturulur, ardından eş imzalanır. Hesabınıza bir kez kaydedilmiş bir kuantum sonrası anahtara ihtiyacınız vardır (aşağıdaki [Kuantum sonrası anahtarınızı kaydedin](#register-pqc-key) bölümüne bakın) ve [download.qore.host](https://download.qore.host) adresindeki resmi `qorechaind` sürüm ikili dosyasına (genel kaynak ağacından derlenen bir ikili dosya Dilithium imzası oluşturamaz ve uygulayamaz).

```bash
# 1. Build the unsigned transaction (the fee is fixed here, because cosign signs the fee in this file)
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > tx.json

# 2. Add the ML-DSA-87 signature and broadcast
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Bu, alıcı adrese **1 QOR** (1,000,000 uqor) gönderir ve 40,000 uqor (0.04 QOR) ücret öder. Ağ tabanı **gaz birimi başına 0.1 uqor**'dur; dolayısıyla ücret en az gaz limitinin 0.1 ile çarpımı kadar olmalıdır: `--gas 400000` için `--fees 40000uqor` veya daha fazlası gerekir. Hibrit imzalı bir transfer, imza işleme yaklaşık 4.7 KB eklediği için genellikle 160,000 ile 240,000 arasında gaz kullanır. `cosign`, ağın hangi imzalanan bayt biçimini doğruladığını düğüme sorar; böylece aynı komut her iki ağda da çalışır.

### Kuantum sonrası anahtarınızı kaydedin {#register-pqc-key}

Kuantum sonrası bir anahtar, hesap başına bir kez **açıkça kaydedilir**. Zincir, ilk işleminizde bunu sizin yerinize kaydetmez. Yepyeni bir hesabın başlayabilmesi için kayıt işleminin kendisi (ve anahtar geçişi) yalnızca klasik anahtarla imzalanabilir:

```bash
# generate the ML-DSA-87 key (stored under ~/.qorechaind/pqc/mypqc.dilithium, mode 0600, not encrypted)
qorechaind tx pqc gen-key mypqc

# register the printed public key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

v3.2.3'ten beri zincir, kayıtla birlikte isteğe bağlı bir **sahiplik kanıtını** da kabul eder ve zayıf, dejenere veya daha önce kullanılmış anahtarları reddeder. Bir tane eklemek için `register-key-v2` ile kayıt yapın ve yerel anahtarınızı adlandırın:

```bash
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

PQC anahtar dosyasını kurtarma ifadeniz kadar dikkatle yedekleyin; `qorechaind tx pqc recover-key` ile ifadeden yeniden türetilebilir. [QoreX](/qorex/overview) ve QoreChain SDK'sı anahtar kaydını sizin yerinize yapar. Tam hibrit akış için [Cüzdan Kurulumu](/getting-started/wallet-setup) bölümüne bakın.

:::caution Cosmos transferleri hibrit bir PQC imzası gerektirir
Cosmos hattında ağ ayarı `hybrid_signature_mode = required`'dır (canlı ağlar v3.2 hattını çalıştırır). Yalnızca klasik imzalı bir işlem **reddedilir**. Hibrit imzayı CLI dışında üretmek için, açık kaynaklı [**qorechain-pqc**](/developer-guide/post-quantum-signing) kütüphanesi (`hybridSignBytes`) ve QoreChain SDK'sı bunun eşdeğerini kodda yapar.
:::

Eş imzalı işlem kabul edildikten sonra CLI bir işlem karması (hash) döndürür.

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

:::caution EVM işlemleri bir yetkilendirme penceresi gerektirir
Standart Ethereum imzalama (MetaMask, ethers.js, ...) hâlâ değişmeden çalışır, ancak v3.2.0'dan itibaren EVM hattı yalnızca **kayıtlı bir kuantum sonrası anahtarı** ve **açık bir EVM yetkilendirme penceresi** olan bir hesaptan gelen işlemi kabul eder. Önce bir tane açın (ML-DSA anahtarınızla imzalanan bir Cosmos hattı işlemidir) — aşağıdaki [EVM yetkilendirme penceresi](#evm-window) bölümüne bakın. Bu olmadan düğüm `no open EVM authorisation window` yanıtını verir. Durumu okumak (`eth_blockNumber`, `eth_getBalance`, `eth_call`, `eth_estimateGas`) pencere gerektirmez.
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

### EVM yetkilendirme penceresi {#evm-window}

Zincir sürümü **v3.2.0**'dan itibaren (ana ağ yüksekliği 2,981,742, 25 Eylül 2026; test ağı yüksekliği 5,920,000) EVM hattı bir işlemi yalnızca şu koşulları sağlayan bir hesaptan kabul eder:

1. **kayıtlı bir kuantum sonrası anahtarı** (ML-DSA-87) vardır ve
2. işlem için hâlâ yeri olan **açık bir EVM yetkilendirme penceresi** vardır.

EVM hattıyla ilgili geri kalan her şey aynıdır: MetaMask, ethers.js, Hardhat veya Foundry ile imzalamaya devam edersiniz; `eth_estimateGas` ve diğer simülasyonlar pencere olmadan çalışır. Sözleşme dağıtımları diğer EVM işlemleri gibi sayılır; bu nedenle dağıtım yapmadan önce bir pencere gerekir.

**Neden bir pencere?** Standart bir cüzdan bir Ethereum işlemi üzerinde tek bir secp256k1 imzası atar ve uygulamalara ikinci bir kuantum sonrası imza ekleme yolu vermez. Bu yüzden kuantum sonrası yetkilendirme işlemden *önce* yola çıkar: ML-DSA imzanızı taşıyan normal bir Cosmos hattı işlemiyle sınırlı bir pencere açarsınız ve EVM hattı da bunun kapsadığı işlemleri kabul eder. Tek başına klasik bir anahtar asla pencere açamaz; dolayısıyla çalınmış bir klasik anahtar yalnızca önceden açılmış bir pencerenin izin verdiği kadarını harcayabilir. Bir ERC-20 onayı (approval) gibi çalışır: sınırlı bir süre için sınırlı bir miktarı yetkilendirin, sonra normal şekilde işlem yapın.

**Bir pencerenin sınırladığı şeyler.** Üç sınır aynı anda geçerlidir; hangisi önce tükenirse pencereyi kapatır.

| Sınır | Anlamı | İzin verilen aralık |
| --- | --- | --- |
| `blocks` | Pencerenin, onu açan bloktan itibaren sayılan açık kalma süresi | 1 – 17,280 |
| `max-txs` | Kabul ettiği EVM işlemi sayısı | 1 – 1,000 |
| `max-value` | Kabul ettiği toplam çıkış, uqor cinsinden: transfer edilen değer **artı** her işlemin ödeyebileceği azami ücret (gaz limiti × ücret üst sınırı), yukarı yuvarlanır | 0'dan büyük |

* 17,280 blok, ana ağda yaklaşık 15 saat (blok başına yaklaşık 3.2 sn), test ağında ise yaklaşık 5 saattir (blok başına yaklaşık 1.0 sn).
* Kabul edilip sonra başarısız olan bir işlem de yuvasını ve değer bütçesini tüketir.
* Yeni bir pencere açmak öncekinin **yerini alır**; tüketim sıfırdan yeniden başlar.
* CLI, `max-value` değerini `uqor` veya `qor` cinsinden kabul eder (`1000qor` = 1,000,000,000 uqor).
* Değer sınırı yalnızca yerel QOR'u sayar: bir token transferi, bir onay veya başka herhangi bir sözleşme çağrısı sıfır değer taşır. Bunları da sınırlamak için pencerenin kapsamını daraltın (aşağıda).

**Adım 1 — kuantum sonrası anahtarınızı kaydedin** (bir kez): yukarıdaki [Kuantum sonrası anahtarınızı kaydedin](#register-pqc-key) bölümüne bakın.

**Adım 2 — bir pencere açın.** Pencere açmak bir Cosmos hattı işlemidir; bu nedenle imzasız oluşturulur ve ardından eş imzalanır:

```bash
# at most 1000 QOR in total, at most 20 transactions, for 7,200 blocks (about 6.4 hours on mainnet)
qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Kapsamı daraltma (v3.2.3 ve sonrası).** İsteğe bağlı iki bayrak, açık bir pencerenin kabul ettiği şeyi kısıtlar: `--native-only` yalnızca düz yerel QOR transferlerini kabul eder (calldata yok, sözleşme oluşturma yok, kod taşıyan alıcı yok) ve `--allowed-targets 0xAAA...,0xBBB...` yalnızca bu alıcılara yönelik işlemleri kabul eder (en fazla 16; bu durumda sözleşme oluşturma reddedilir). Örneğin:

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json
```

Ana ağda bir pencere açmak yaklaşık 180,000 gaz kullanmıştır. [QoreX](/qorex/security-and-recovery#evm-window) içinde aynı adım **Settings → Security → EVM access window** (uygulama) veya **EVM access window** düğmesidir (uzantı). Pencereyi açmak hesap nonce'unuzu ilerletir; bu yüzden cüzdanınızda EVM işlemini hazırlamadan **önce** açın.

**Adım 3 — geriye ne kaldığını kontrol edin:**

```bash
qorechaind query pqc evm-window qor1youraddress...
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/qor1youraddress...
```

REST yanıtı, penceresi olmayan bir adres için asla hata vermez; `found: false` döndürür. Alanlar `found`, `live`, `opened_height`, `expiry_height`, `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs` ve `remaining_value`'dur (uqor tam sayıları, dize olarak döndürülür). Ana ağda `https://api.qore.host` kullanın.

**Adım 4 — EVM hattını normal şekilde kullanın.** MetaMask'tan veya araçlarınızdan her zamanki gibi gönderin. Her işlem pencereden bir işlem yuvası ve (değer + azami ücret) tüketir.

**Bir pencereyi erken kapatın.** Klasik anahtarınızın ele geçirildiğinden şüpheleniyorsanız pencereyi kapatın; kabul etmeye devam edeceği her şey bir sonraki bloktan itibaren reddedilir. Kapatmak ayrıca bekleyen her EIP-7702 delegasyon onayını da iptal eder (v3.2.2'den beri; bir hesabın kodunu değiştiren type-4 işlemi yalnızca kuantum sonrası bir `authorize-evm-delegation` onayından sonra kabul edilir):

```bash
qorechaind tx pqc close-evm-window --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > close.json
qorechaind tx pqc cosign close.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Hatalar**

| Gördüğünüz | Anlamı | Ne yapmalı |
| --- | --- | --- |
| `no open EVM authorisation window; open one with MsgOpenEVMWindow ...` (`pqc` modülü, code 26) | Bu hesap için pencere yok | Adım 2 |
| `... has no registered post-quantum key; the EVM lane requires one` (EVM hattında code 26; pencere açmaya çalışırsanız code 28) | Kayıtlı ML-DSA anahtarı yok | Adım 1 |
| `the EVM authorisation window for ... does not admit this transaction (remaining: ...)` (code 27) | Süresi dolmuş veya tükenmiş; mesaj hangi sınır olduğunu gösterir | Yeni bir pencere açın |
| `invalid EVM authorisation window` (code 28) | Sınırlar aralık dışında (`blocks` 1–17,280, `max-txs` 1–1,000, `max-value` > 0) | Argümanları düzeltin |

Koddan, QoreChain SDK'sı ve `@qorechain/wallet-adapter` açma ve kapama mesajlarını oluşturabilir ve pencere durumunu okuyabilir; [SDK belgelerine](/sdk/overview) bakın.

Pencere yalnızca EVM hattı için geçerlidir. Cosmos hattı işlemleri her işlemde zaten hibrit imzayı taşır; hiç pencere açmazsanız EVM işlemleriniz reddedilir, başka hiçbir şey değişmez.

## SVM RPC Kullanımı

QoreChain'in SVM yürütme ortamı, `8899` portunda Solana uyumlu bir RPC arayüzü sunar. SVM işlem hattı şu anda ağ genelinde devre dışıdır; bu nedenle bugün kullanabileceğiniz kısım bu okuma metodlarıdır.

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
| `--fees`           | uqor cinsinden işlem ücreti (gaz limiti × en az 0.1) | `--fees 40000uqor` |
| `--from`           | İmzalama anahtarı adı veya adresi | `--from mykey`             |
| `--output`         | Yanıt biçimi                  | `--output json`                |
| `--node`           | Bağlanılacak RPC uç noktası   | `--node tcp://localhost:26657` |
| `--gas`            | İşlem için gaz limiti         | `--gas 400000` (veya `--gas auto`) |
| `--gas-adjustment` | Tahmini gaz için çarpan       | `--gas-adjustment 1.5`         |
| `--gas-prices`     | `--fees` yerine gaz fiyatı    | `--gas-prices 0.1uqor`         |
| `--generate-only`  | İmzasız işlemi yazdırır (`tx pqc cosign` öncesinde gereklidir) | `--generate-only` |
| `-y`               | Onay istemini atla            | `-y`                           |

### Örnek: Tüm Yaygın Bayraklarla Tam Komut

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --node tcp://localhost:26657 \
  --output json \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

## Sonraki Adımlar

İlk işleminizi gönderdiğinize göre, QoreChain'in sunduğu daha fazlasını keşfedin:

* **Stake Etme ve Delegasyon** — QOR stake edin ve ödüller kazanın
* **Varlık Köprüleme** — Varlıkları zincirler arasında taşıyın
* **EVM Geliştirme** — QoreChain üzerinde Solidity akıllı sözleşmeleri dağıtın
