---
slug: /getting-started/wallet-setup
title: Cüzdan Kurulumu
sidebar_label: Cüzdan Kurulumu
sidebar_position: 2
---

# Cüzdan Kurulumu

QoreChain; yerel (native), EVM ve SVM yürütme ortamları genelinde birden fazla cüzdan türünü destekler. Kullanım senaryonuza uygun cüzdanı seçin.

:::note
Aşağıdaki zincir kimlikleri (chain ID) ve RPC uç noktaları **`qorechain-diana`** test ağını (EVM chain ID **9800**) hedefler. Ana ağ (**`qorechain-vladi`**, EVM chain ID **9801**) 7 Haziran 2026'dan beri yayında; cüzdan bağlantı değerleri ayrı bir **Ana Ağa Bağlanma** sayfasında belgelenmiştir.
:::

## Keplr Cüzdanı

Keplr, yerel QoreChain işlemleri, stake etme ve yönetişim için önerilen cüzdandır.

### QoreChain'i Özel Zincir Olarak Ekleme

Keplr'ı açın ve **Settings > Add Custom Chain** yolunu izleyin, ardından şunları girin:

| Alan               | Değer                     |
| ------------------ | ------------------------- |
| Chain Name         | `QoreChain Diana Testnet` |
| Chain ID           | `qorechain-diana`         |
| RPC URL            | `http://localhost:26657`  |
| REST URL           | `http://localhost:1317`   |
| Bech32 Prefix      | `qor`                     |
| Coin Denom         | `QOR`                     |
| Coin Minimal Denom | `uqor`                    |
| Decimals           | `6`                       |

Zinciri ekledikten sonra Keplr, hesabınız için bir `qor1...` adresi oluşturur. Test ağı QOR tokenları almak için bu adresi kullanın.

## MetaMask (EVM)

MetaMask, QoreChain'in EVM yürütme ortamıyla etkileşim kurmanızı sağlar — Solidity sözleşmeleri dağıtın, ERC-20 tokenları yönetin ve tanıdık Ethereum araçlarını kullanın.

### QoreChain'i Özel Ağ Olarak Ekleme

MetaMask'ı açın ve **Settings > Networks > Add Network** yolunu izleyin, ardından şunları girin:

| Alan            | Değer                   |
| --------------- | ----------------------- |
| Network Name    | `QoreChain EVM`         |
| RPC URL         | `http://localhost:8545` |
| Chain ID        | `9800`                  |
| Currency Symbol | `QOR`                   |

Bağlandıktan sonra MetaMask'ı EVM işlemlerini imzalamak, dağıtılan akıllı sözleşmelerle etkileşim kurmak ve QoreChain üzerindeki ERC-20 tokenları yönetmek için kullanabilirsiniz.

## Solana Cüzdanları (SVM)

QoreChain'in SVM yürütme ortamı, standart Solana araçlarıyla uyumludur. SVM programlarıyla etkileşim kurmak için Solana ile uyumlu herhangi bir cüzdanı veya kütüphaneyi bağlayın.

### @solana/web3.js Kullanımı

```javascript
import { Connection } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Bu, QoreChain üzerinde çalışan SVM programlarının dağıtımını ve bunlarla etkileşimi mümkün kılar.

## PQC Destekli Cüzdanlar (Cosmos Yolunda Zorunlu)

QoreChain, cosmos işlem yolunda hibrit kuantum sonrası kriptografi (PQC) gerektirir. Mevcut zincir sürümü itibarıyla (**v3.1.77**), ağ varsayılanı `hybrid_signature_mode = required` ve `allow_classical_fallback = false`'tur — yani **her cosmos yolu işlemi, standart secp256k1 (ECDSA) imzasının yanında bir ML-DSA-87 (Dilithium-5) imzası taşımalıdır**. Bir PQC hesabından gelen yalnızca klasik cosmos işlemleri reddedilir.

:::caution Cosmos işlemleri hibrit PQC uzantısını gerektirir
Cosmos yolunda düz bir klasik işlem göndermek reddedilir. Dilithium-5 imzasını bir `PQCHybridSignature` işlem uzantısı olarak eklemeniz gerekir. Standart CosmJS / Keplr araçları bu uzantıyı kendi başına üretmez — `qorechaind tx pqc cosign` CLI komutunu, QoreChain SDK'sının hibrit imzalama özelliğini (aşağıya bakın) ya da kodda kendiniz oluşturmak için açık kaynaklı [**qorechain-pqc**](/developer-guide/post-quantum-signing) kütüphanesini (`hybridSignBytes`) kullanın. Tek istisnalar genesis gentx'leri ve PQC anahtar kaydı/geçişi işlemleridir.
:::

### Nasıl Çalışır

Cüzdanlar, standart secp256k1 (ECDSA) imzasının yanında bir işlem uzantısı olarak bir ML-DSA-87 PQC imzası ekler. Klasik imza, uzantıyı hariç tutan imza baytları üzerinden hesaplanır; böylece klasik doğrulama için geçerli kalırken PQC imzası kuantum direnci sağlar.

### Dilithium-5 Anahtarı Oluşturma

Hibrit imzalama için kuantum sonrası bir anahtar oluşturun:

```bash
qorechaind tx pqc gen-key
```

### Otomatik Kayıt

İlk işleminize bir PQC genel anahtarı eklediğinizde, QoreChain bunu otomatik olarak zincir üzerinde kaydeder. Ayrı bir kayıt adımına gerek yoktur. (PQC anahtar kaydı/geçişi işlemleri hibrit gereksinimden muaftır; böylece bir hesap ilk anahtarını başlatabilir.)

### SDK ile Hibrit İmzalama

QoreChain SDK, `includePqcPublicKey: true` ile `buildHybridTx` aracılığıyla uyumlu cosmos işlemleri üretir; bu, Dilithium-5 uzantısını ekler ve otomatik kayıt için genel anahtarı gömer. Bkz. [SDK Hesapları ve PQC imzalama](/sdk/concepts/accounts-pqc).

### PQC Modları

Üç uygulama modu yönetişim tarafından kontrol edilmeye devam eder; **mevcut ağ varsayılanı Zorunlu (Required)'dur**:

| Mod                       | Açıklama                                                                       |
| ------------------------- | ----------------------------------------------------------------------------- |
| **Disabled**              | PQC doğrulaması kapalıdır. Yalnızca standart imzalar.                          |
| **Optional**              | İşlemler PQC imzaları içerebilir. Mevcutsa, doğrulanırlar.                     |
| **Required** (varsayılan) | Tüm cosmos yolu işlemleri geçerli bir PQC imzası içermelidir.                  |

Etkin mod zincir düzeyinde yapılandırılır ve yönetişim aracılığıyla güncellenebilir.

:::note EVM / MetaMask etkilenmez
Yukarıdaki MetaMask (EVM) akışı hibrit gereksinimden **etkilenmez**. EVM işlemleri ayrı bir `eth_secp256k1` ante yolu kullanır ve hiçbir zaman PQC uzantısına ihtiyaç duymaz.
:::

## CLI Cüzdanı

`qorechaind` ikili dosyası, komut satırı kullanımı için yerleşik bir anahtar yönetim sistemi içerir.

### Yeni Anahtar Oluşturma

```bash
qorechaind keys add mykey
```

Bu, yeni bir anahtar çifti oluşturur ve anımsatıcı (mnemonic) ifadeyi görüntüler. **Anımsatıcıyı güvenli bir şekilde saklayın** — bu anahtarı kurtarmanın tek yolu odur.

### Adresinizi Görüntüleme

```bash
qorechaind keys show mykey -a
```

Bu, `qor1...` bech32 adresinizi çıktı olarak verir.

### Tüm Anahtarları Listeleme

```bash
qorechaind keys list
```

### Mevcut Bir Anahtarı İçe Aktarma

```bash
qorechaind keys add mykey --recover
```

Anımsatıcı ifadenizi girmeniz istenecektir.

## Sonraki Adımlar

* [İlk İşleminiz](/getting-started/first-transaction) — Yeni cüzdanınızı kullanarak QOR tokenları gönderin
* [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) — Canlı Diana test ağına katılın
