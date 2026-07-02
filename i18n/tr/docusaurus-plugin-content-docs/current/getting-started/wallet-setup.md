---
slug: /getting-started/wallet-setup
title: Cüzdan Kurulumu
sidebar_label: Cüzdan Kurulumu
sidebar_position: 2
---

# Cüzdan Kurulumu

QoreChain; yerel (native), EVM ve SVM yürütme ortamlarında birden fazla cüzdan türünü destekler. Kullanım senaryonuza uygun cüzdanı seçin.

:::note
Aşağıdaki değerler hem **`qorechain-vladi`** ana ağını (EVM zincir kimliği **9801**, 7 Haziran 2026'dan beri yayında) hem de **`qorechain-diana`** test ağını (EVM zincir kimliği **9800**) kapsar. Her iki ağın genel uç noktaları [Ağlar](/appendix/networks#public-endpoints) sayfasında listelenmiştir.
:::

## Keplr Cüzdanı

Keplr; yerel QoreChain işlemleri, stake etme ve yönetişim için önerilen cüzdandır.

### QoreChain'i Özel Zincir Olarak Ekleyin

Keplr'ı açın ve **Settings > Add Custom Chain** bölümüne gidin, ardından şunları girin:

| Alan                     | Ana Ağ (Mainnet)           | Test Ağı (Testnet)               |
| ------------------------ | -------------------------- | -------------------------------- |
| Zincir Adı               | `QoreChain`                | `QoreChain Diana Testnet`        |
| Zincir Kimliği           | `qorechain-vladi`          | `qorechain-diana`                |
| RPC URL                  | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| REST URL                 | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Bech32 Öneki             | `qor`                      | `qor`                            |
| Coin Birimi              | `QOR`                      | `QOR`                            |
| Coin Minimum Birimi      | `uqor`                     | `uqor`                           |
| Ondalık Basamak          | `6`                        | `6`                              |
| Coin Türü (BIP-44)       | `118`                      | `118`                            |

Zinciri ekledikten sonra Keplr, hesabınız için bir `qor1...` adresi oluşturur.

:::caution Gas fiyatı alt sınırı
Ağın minimum gas fiyatı **0.1uqor**'dur. Keplr'ın gas fiyatı kademelerini yapılandırıyorsanız (örneğin `suggestChain` aracılığıyla), **0.1 veya üzeri** değerler kullanın (önerilen düşük/ortalama/yüksek: `0.1 / 0.15 / 0.25`) — alt sınırın altında imzalanan işlemler reddedilir.
:::

## MetaMask (EVM)

MetaMask, QoreChain'in EVM yürütme ortamıyla etkileşim kurmanızı sağlar — Solidity sözleşmeleri dağıtın, ERC-20 token'ları yönetin ve alışık olduğunuz Ethereum araçlarını kullanın.

### QoreChain'i Özel Ağ Olarak Ekleyin

MetaMask'i açın ve **Settings > Networks > Add Network** bölümüne gidin, ardından şunları girin:

| Alan                    | Ana Ağ (Mainnet)          | Test Ağı (Testnet)               |
| ----------------------- | ------------------------- | -------------------------------- |
| Ağ Adı                  | `QoreChain`               | `QoreChain Diana Testnet`        |
| RPC URL                 | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| Zincir Kimliği          | `9801`                    | `9800`                           |
| Para Birimi Sembolü     | `QOR`                     | `QOR`                            |
| Blok Gezgini URL'si     | `https://explore.qore.network` | `https://explore.qore.network` |

Yerel QOR, EVM arayüzünde **18 ondalık basamağa** sahiptir (wei tarzı). Bağlantı kurduktan sonra MetaMask'i EVM işlemlerini imzalamak, dağıtılmış akıllı sözleşmelerle etkileşim kurmak ve QoreChain üzerindeki ERC-20 token'ları yönetmek için kullanabilirsiniz.

### Tek çağrıyla ağ kaydı

dApp'ler için, npm'de yayımlanan **`@qorechain/wallet-adapter`** ve **`@qorechain/connect`** paketleri QoreChain'i kullanıcının cüzdanına tek çağrıyla kaydeder — MetaMask'ten ağı EIP-3085 aracılığıyla eklemesini ister (EVM hattında doğru **18 ondalıklı** yerel QOR ile) ve Keplr'ın gas fiyatı kademesini yapılandırır:

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## Solana Cüzdanları (SVM)

QoreChain'in SVM yürütme ortamı standart Solana araçlarıyla uyumludur ve hesabın **yerel QOR bakiyesi doğrudan SVM arayüzünde görünür** (lamports cinsinden, 9 ondalık basamak; 1 uqor = 1.000 lamports). Solana uyumlu herhangi bir cüzdanı veya kütüphaneyi bağlayabilirsiniz.

### @solana/web3.js Kullanımı

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Genel SVM uç noktaları **salt okunurdur**; işlem gönderimi kendi düğümünüzü gerektirir. Ayrıntılar için [SVM Geliştirme](/developer-guide/svm-development) sayfasına bakın.

## PQC Destekli Cüzdanlar (Cosmos Yolunda Zorunlu)

QoreChain, cosmos işlem yolunda hibrit post-kuantum kriptografi (PQC) gerektirir. Mevcut zincir sürümü (**v3.1.82**) itibarıyla ağ varsayılanı `hybrid_signature_mode = required` ve `allow_classical_fallback = false` şeklindedir — dolayısıyla **cosmos yolundaki her işlem, standart secp256k1 (ECDSA) imzasının yanında bir ML-DSA-87 (Dilithium-5) imzası taşımak zorundadır**. PQC hesabından gönderilen yalnızca klasik imzalı cosmos işlemleri reddedilir.

:::caution Cosmos işlemleri hibrit PQC uzantısını gerektirir
Cosmos yolunda düz bir klasik işlem göndermek reddedilecektir. Dilithium-5 imzasını bir `PQCHybridSignature` işlem uzantısı olarak eklemeniz gerekir. Standart CosmJS / Keplr araçları bu uzantıyı kendi başına üretmez — `qorechaind tx pqc cosign` CLI komutunu, QoreChain SDK'sının hibrit imzalamasını (aşağıya bakın) veya kodda kendiniz oluşturmak isterseniz açık kaynaklı [**qorechain-pqc**](/developer-guide/post-quantum-signing) kütüphanesini (`hybridSignBytes`) kullanın. Tek muafiyetler genesis gentx'leri ile PQC anahtar kayıt/taşıma işlemleridir.
:::

### Nasıl Çalışır

Cüzdanlar, standart secp256k1 (ECDSA) imzasının yanına bir ML-DSA-87 PQC imzasını işlem uzantısı olarak ekler. Klasik imza, uzantıyı dışarıda bırakan imza baytları üzerinden hesaplanır; böylece klasik doğrulama için geçerli kalırken PQC imzası kuantum direnci sağlar.

### Dilithium-5 Anahtarı Oluşturun

Hibrit imzalama için bir post-kuantum anahtarı oluşturun:

```bash
qorechaind tx pqc gen-key
```

### Otomatik Kayıt

İlk işleminize bir PQC genel anahtarı eklediğinizde, QoreChain bunu otomatik olarak zincir üzerinde kaydeder. Ayrı bir kayıt adımına gerek yoktur. (PQC anahtar kayıt/taşıma işlemlerinin kendileri hibrit gereksiniminden muaftır; böylece bir hesap ilk anahtarını sorunsuzca kaydedebilir.)

### SDK ile Hibrit İmzalama

QoreChain SDK'sı, `includePqcPublicKey: true` ile `buildHybridTx` aracılığıyla uyumlu cosmos işlemleri üretir; bu, Dilithium-5 uzantısını ekler ve otomatik kayıt için genel anahtarı gömer. Bkz. [SDK Hesapları ve PQC imzalama](/sdk/concepts/accounts-pqc).

### PQC Modları

Üç uygulama modu yönetişim kontrolünde kalmaya devam eder; **mevcut ağ varsayılanı Required'dır**:

| Mod                       | Açıklama                                                                    |
| ------------------------- | --------------------------------------------------------------------------- |
| **Disabled**              | PQC doğrulaması kapalıdır. Yalnızca standart imzalar kullanılır.             |
| **Optional**              | İşlemler PQC imzaları içerebilir. Mevcutsa doğrulanır.                       |
| **Required** (varsayılan) | Cosmos yolundaki tüm işlemler geçerli bir PQC imzası içermek zorundadır.     |

Etkin mod zincir düzeyinde yapılandırılır ve yönetişim yoluyla güncellenebilir.

:::note EVM / MetaMask etkilenmez
Yukarıdaki MetaMask (EVM) akışı, hibrit gereksinimden **etkilenmez**. EVM işlemleri ayrı bir `eth_secp256k1` ante yolunu kullanır ve PQC uzantısına asla ihtiyaç duymaz.
:::

## CLI Cüzdanı

`qorechaind` ikili dosyası, komut satırı kullanımı için yerleşik bir anahtar yönetim sistemi içerir.

### Yeni Anahtar Oluşturun

```bash
qorechaind keys add mykey
```

Bu komut yeni bir anahtar çifti oluşturur ve mnemonic (anımsatıcı) ifadeyi görüntüler. **Mnemonic ifadeyi güvenli bir şekilde saklayın** — bu anahtarı kurtarmanın tek yolu budur.

### Adresinizi Görüntüleyin

```bash
qorechaind keys show mykey -a
```

Bu komut, `qor1...` bech32 adresinizi çıktı olarak verir.

### Tüm Anahtarları Listeleyin

```bash
qorechaind keys list
```

### Mevcut Bir Anahtarı İçe Aktarın

```bash
qorechaind keys add mykey --recover
```

Mnemonic ifadenizi girmeniz istenecektir.

## Sonraki Adımlar

* [İlk İşleminiz](/getting-started/first-transaction) — Yeni cüzdanınızla QOR token'ları gönderin
* [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) — Yayındaki Diana test ağına katılın
