---
slug: /getting-started/wallet-setup
title: Cüzdan Kurulumu
sidebar_label: Cüzdan Kurulumu
sidebar_position: 2
---

# Cüzdan Kurulumu

QoreChain; native, EVM ve SVM yürütme ortamlarında birden fazla cüzdan türünü destekler. Kullanım senaryonuza uygun cüzdanı seçin.

:::note
Aşağıdaki değerler hem **`qorechain-vladi`** ana ağını (EVM zincir kimliği **9801**, 7 Haziran 2026'dan beri yayında, 23 Ekim 2026'dan beri v3.2.4 sürümü) hem de **`qorechain-diana`** test ağını (EVM zincir kimliği **9800**, 19 Ekim 2026'dan beri v3.2.4 sürümü) kapsar. Her iki ağın herkese açık uç noktaları [Ağlar](/appendix/networks#public-endpoints) sayfasında listelenmiştir.
:::

## QoreX (önerilir) {#qorex}

**QoreX**, QoreChain'in resmi, saklamasız (non-custodial) cüzdanıdır — bir mobil uygulama (Android, iOS) ve bir tarayıcı uzantısı (Chrome, Firefox, macOS'ta Safari). Her Native hat transferini zorunlu hibrit kuantum sonrası imzayla imzalar, kuantum sonrası anahtarınızı sizin yerinize kaydeder, staking'i, @handle'ları ve harici ağları destekler ve Dashboard ile eşleşir. Ayrıca MetaMask işlemlerinin ihtiyaç duyduğu [EVM yetkilendirme penceresini](/getting-started/first-transaction#evm-window) açar. [QoreX kılavuzu](/qorex/overview) ve [Başlarken](/qorex/getting-started) ile başlayın.

## Keplr Cüzdanı

Keplr, bakiyeleri görüntülemek ve Native hatta almak için QoreChain'i özel zincir olarak ekleyebilir (aşağıda). QoreChain, Native hatta kuantum sonrası bir ortak imza gerektirdiğinden; göndermek, stake etmek ve oy vermek için yalnızca Keplr yerine [QoreX](/qorex/overview) gibi PQC destekli bir cüzdan kullanın.

### QoreChain'i Özel Zincir Olarak Ekleyin

Keplr'ı açın ve **Settings > Add Custom Chain** bölümüne gidin, ardından şunları girin:

| Alan               | Ana Ağ (Mainnet)           | Test Ağı (Testnet)               |
| ------------------ | -------------------------- | -------------------------------- |
| Zincir Adı         | `QoreChain`                | `QoreChain Diana Testnet`        |
| Zincir Kimliği     | `qorechain-vladi`          | `qorechain-diana`                |
| RPC URL            | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| REST URL           | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Bech32 Öneki       | `qor`                      | `qor`                            |
| Coin Birimi        | `QOR`                      | `QOR`                            |
| En Küçük Coin Birimi | `uqor`                   | `uqor`                           |
| Ondalık Basamak    | `6`                        | `6`                              |
| Coin Türü (BIP-44) | `118`                      | `118`                            |

Zinciri ekledikten sonra Keplr, hesabınız için bir `qor1...` adresi oluşturur.

:::caution Gaz fiyatı alt sınırı
Ağın asgari gaz fiyatı **0.1uqor**'dur. Keplr'ın gaz fiyatı kademelerini yapılandırıyorsanız (örn. `suggestChain` üzerinden), **0.1 veya üzeri** değerler kullanın (önerilen düşük/ortalama/yüksek: `0.1 / 0.15 / 0.25`) — alt sınırın altında imzalanan işlemler reddedilir.
:::

## MetaMask (EVM)

MetaMask, QoreChain'in EVM yürütme ortamıyla etkileşim kurmanızı sağlar — Solidity sözleşmeleri dağıtın, ERC-20 token'ları yönetin ve alışık olduğunuz Ethereum araçlarını kullanın.

### QoreChain'i Özel Ağ Olarak Ekleyin

MetaMask'ı açın ve **Settings > Networks > Add Network** bölümüne gidin, ardından şunları girin:

| Alan               | Ana Ağ (Mainnet)          | Test Ağı (Testnet)               |
| ------------------ | ------------------------- | -------------------------------- |
| Ağ Adı             | `QoreChain`               | `QoreChain Diana Testnet`        |
| RPC URL            | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| Zincir Kimliği     | `9801`                    | `9800`                           |
| Para Birimi Sembolü | `QOR`                    | `QOR`                            |
| Blok Gezgini URL'si | `https://explore.qore.network` | `https://explore.qore.network` |

Native QOR, EVM arayüzünde **18 ondalık basamağa** sahiptir (wei tarzı). Bağlantı kurulduktan sonra MetaMask ile EVM işlemlerini imzalayabilir, dağıtılmış akıllı sözleşmelerle etkileşim kurabilir ve QoreChain üzerindeki ERC-20 token'ları yönetebilirsiniz.

:::caution EVM / MetaMask için bir PQC anahtarı ve açık bir pencere gerekir
MetaMask yine normal şekilde imzalar, ancak EVM hattı yalnızca kayıtlı bir kuantum sonrası anahtarı ve açık bir **EVM yetkilendirme penceresi** olan bir hesaptan gelen işlemleri kabul eder (v3.2.0 ve sonrası). Anahtarınızı bir kez kaydedin, ardından bir EVM etkinliği oturumundan önce bir pencere açın — bkz. [EVM yetkilendirme penceresi](/getting-started/first-transaction#evm-window). MetaMask pencereyi kendisi açamaz; [QoreX](/qorex/security-and-recovery#evm-window) içinde veya CLI ile açın. Ağı MetaMask'a eklemek (yukarıda) değişmeden kalır.
:::

### Tek çağrıyla ağ kaydı

dApp'ler için, npm'de yayımlanan **`@qorechain/wallet-adapter`** paketi QoreChain'i kullanıcının cüzdanına tek bir çağrıyla kaydeder — MetaMask'tan ağı EIP-3085 üzerinden eklemesini ister (EVM hattında doğru **18 ondalıklı** native QOR ile) — ve Keplr zincir önerisi için (gaz fiyatı kademesi dahil) `qoreChainInfo` sağlar:

```bash
npm install @qorechain/wallet-adapter
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// pass the EIP-1193 provider and the network parameters (rpcUrl is required)
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801,                       // 9800 for the testnet
  rpcUrl: "https://evm.qore.host",        // https://evm-testnet.qore.host for the testnet
  explorerUrl: "https://explore.qore.network",
  testnet: false,                         // true for the testnet
});
```

## Tek Hesap, Üç Adres (Birleşik Hesaplar) {#unified-accounts}

Zincir sürümü **v3.1.83** itibarıyla bir QoreChain hesabı, **üç farklı kodlamaya sahip tek bir 20 baytlık kimliktir**: `qor1…` (Native), `0x…` (EVM) ve bir base58 biçimi (SVM). Hesap **tek bir bakiye** tutar ve — eth-native hesaplar için — Native yoldaki zorunlu kuantum sonrası hibrit imza dahil olmak üzere **üç hattın tamamında tek bir anahtarla imzalar**.

`@qorechain/wallet-adapter` ile kod içinde birleşik bir cüzdan oluşturun:

```js
import { generateQoreWallet } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();          // or walletFromMnemonic(mnemonic)
console.log(w.cosmos);                         // qor1...
console.log(w.evm);                            // 0x... (same identity)
console.log(w.svm);                            // base58 (same identity)
// Native-lane sends use signHybridEth (classical eth_secp256k1 + ML-DSA-87 hybrid); pass `rest` so the sign-bytes form is resolved.
```

Üç biçimden herhangi birine gönderilen fonlar aynı bakiyeye ulaşır.

## Bağlı Cüzdanlar: Harcama Anahtarı Olarak Phantom ve MetaMask {#linked-wallets}

:::caution Şu anda her iki ağda da kapalı
Akıllı hesap ve bağlı cüzdan özellikleri uygulanmıştır ancak her iki ağda da **kapalıdır** (`abstractaccount.enabled = false`): bayrak kapalıyken bir kimlik doğrulayıcı (authenticator) kaydetmek ve onun üzerinden işlem yürütmek reddedilir. Bir bağlama akışı sunmadan önce `GET /qorechain/abstractaccount/v1/config` adresini kontrol edin. Aşağıdaki bölüm tasarlanan davranışı açıklar.
:::

Bir dApp içinde QoreChain hesabınızdan harcama yapmak için kök anahtarınızı açığa çıkarmanız gerekmeyecek şekilde tasarlanmıştır (zincir sürümü **v3.1.85** ile tanıtıldı): bir **Phantom** (ed25519) veya **MetaMask** (Ethereum adresiyle, `personal_sign` üzerinden) anahtarı hesabınıza **kimlik doğrulayıcı (authenticator) olarak kaydedilebilir** — kapsamlandırılmış izinler, harcama limitleri, geçerlilik süresi ve anında iptal ile — ve ardından dApp'in arka ucu tarafından iletilen transferleri yetkilendirebilir. Modelin tamamı ve kod için [Bağlı Cüzdan Kimlik Doğrulayıcıları](/developer-guide/account-abstraction#authenticators) sayfasına, uçtan uca örnekler için [SDK Authenticators kılavuzuna](/sdk/guides/authenticators) bakın.

## Solana Cüzdanları (SVM)

:::caution SVM işlem gönderimi şu anda devre dışı
SVM yürütme hattı, **işlem gönderimi için ağ genelinde şu anda devre dışıdır** — QoreChain'e karşı bir Solana uyumlu cüzdan üzerinden şu anda işlem göndermeyin. Bakiye/slot okuma yine de çalışıyor olabilir; güncel durum için [SVM Geliştirme](/developer-guide/svm-development) sayfasına bakın.
:::

QoreChain'in SVM yürütme ortamı standart Solana araçlarıyla uyumludur ve hesabın **native QOR bakiyesi doğrudan SVM arayüzünde görünür** (lamports cinsinden, 9 ondalık; 1 uqor = 1.000 lamports). Solana uyumlu herhangi bir cüzdanı veya kütüphaneyi bağlayabilirsiniz.

### @solana/web3.js Kullanımı

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Herkese açık SVM uç noktaları **salt okunurdur**; işlem göndermek için kendi düğümünüz gerekir. Ayrıntılar için [SVM Geliştirme](/developer-guide/svm-development) sayfasına bakın.

## PQC Destekli Cüzdanlar (Cosmos Yolunda Zorunlu)

QoreChain, cosmos işlem yolunda hibrit kuantum sonrası kriptografi (PQC) gerektirir. Canlı ağlarda (v3.2.x) ağ varsayılanı, `allow_classical_fallback = false` ile birlikte `hybrid_signature_mode = required` olarak ayarlıdır — yani **cosmos yolundaki her işlem, standart secp256k1 (ECDSA) imzasının yanı sıra bir ML-DSA-87 (Dilithium-5) imzası taşımak zorundadır**. Bir PQC hesabından gönderilen yalnızca klasik imzalı cosmos işlemleri reddedilir.

:::caution Cosmos işlemleri hibrit PQC uzantısını gerektirir
Cosmos yolunda düz bir klasik işlem göndermek reddedilecektir. Dilithium-5 imzasını bir `PQCHybridSignature` işlem uzantısı olarak eklemeniz gerekir. Standart CosmJS / Keplr araçları bu uzantıyı kendi başına üretmez — `qorechaind tx pqc cosign` CLI komutunu, QoreChain SDK'nın hibrit imzalamasını (aşağıya bakın) veya kendi kodunuzda oluşturmak için açık kaynaklı [**qorechain-pqc**](/developer-guide/post-quantum-signing) kütüphanesini (`hybridSignBytes`) kullanın. Tek istisnalar genesis gentx'leri, PQC anahtar kaydı/taşıma işlemleri ve kayıtlı anahtarı olmayan bir operatör hesabından yapılan unjail işlemidir.
:::

### Nasıl Çalışır

Cüzdanlar, standart secp256k1 (ECDSA) imzasının yanında bir ML-DSA-87 PQC imzasını işlem uzantısı olarak ekler. Klasik imza, uzantıyı hariç tutan imza baytları üzerinden hesaplanır; böylece klasik doğrulama için geçerli kalırken PQC imzası kuantum direnci sağlar.

### Dilithium-5 Anahtarı Oluşturun

Hibrit imzalama için kuantum sonrası bir anahtar oluşturun:

```bash
qorechaind tx pqc gen-key mypqc
```

Komut bir anahtar adı alır ve anahtarı `~/.qorechaind/pqc/<name>.dilithium` altında saklar (kip `0600`, şifrelenmemiş). Resmi `qorechaind` sürüm ikili dosyasını gerektirir.

### Anahtarınızı kaydedin (bir kez) {#register-your-key}

Kuantum sonrası bir anahtar, hesap başına bir kez, bir anahtar kayıt işlemiyle **açıkça kaydedilir**. Bu işlem (ve anahtar taşıma) klasik olarak imzalanabilir; böylece yepyeni bir hesap kendini başlatabilir; bundan sonra her Cosmos hattı işlemi hibrit imzayı taşımak zorundadır.

```bash
# register the public key printed by gen-key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-vladi --gas 600000 --fees 60000uqor
```

v3.2.3'ten beri `qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --pqc-key mypqc --from mykey ...` ile kayıt yaparak isteğe bağlı bir sahiplik kanıtı ekleyebilirsiniz; zincir ayrıca zayıf, dejenere veya daha önce kullanılmış anahtarları reddeder. PQC anahtar dosyasını anımsatıcı ifadeniz kadar dikkatle yedekleyin. (Bir anahtar, anımsatıcı ifadeden `qorechaind tx pqc recover-key` ile yeniden türetilebilir ve `tx pqc rotate-key` ile değiştirilebilir.) QoreX ve QoreChain SDK anahtarı sizin yerinize kaydeder. İmzalanmış eksiksiz bir gönderim için [İlk İşlem](/getting-started/first-transaction#register-pqc-key) sayfasına bakın.

### SDK ile Hibrit İmzalama

QoreChain SDK, Dilithium-5 uzantısını ekleyen `buildHybridTx` ile uyumlu Cosmos hattı işlemleri üretir. Hesabın anahtarı önceden kayıtlı olmalıdır (yukarıya bakın). Bkz. [SDK Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc).

### PQC Modları

Üç zorlama modu yönetişim kontrolünde kalmaya devam ediyor; **güncel ağ varsayılanı Required'dır**:

| Mod                    | Açıklama                                                                 |
| ---------------------- | ------------------------------------------------------------------------ |
| **Disabled**           | PQC doğrulaması kapalıdır. Yalnızca standart imzalar kullanılır.          |
| **Optional**           | İşlemler PQC imzası içerebilir. Varsa doğrulanır.                         |
| **Required** (varsayılan) | Cosmos yolundaki tüm işlemler geçerli bir PQC imzası içermelidir.      |

Etkin mod zincir düzeyinde yapılandırılır ve yönetişim yoluyla güncellenebilir.

:::caution EVM / MetaMask için bir PQC anahtarı ve açık bir pencere gerekir
Yukarıdaki MetaMask (EVM) akışı hibrit uzantıyı taşımaz, ancak v3.2.0'dan beri EVM hattı yalnızca kayıtlı bir kuantum sonrası anahtarı ve açık bir **EVM yetkilendirme penceresi** olan bir hesaptan gelen işlemleri kabul eder. Bkz. [EVM yetkilendirme penceresi](/getting-started/first-transaction#evm-window).
:::

## CLI Cüzdanı

`qorechaind` ikili dosyası, komut satırı kullanımı için yerleşik bir anahtar yönetim sistemi içerir.

### Yeni Bir Anahtar Oluşturun

```bash
qorechaind keys add mykey
```

Bu komut yeni bir anahtar çifti oluşturur ve anımsatıcı (mnemonic) ifadeyi görüntüler. **Anımsatıcı ifadeyi güvenli bir şekilde saklayın** — bu anahtarı kurtarmanın tek yolu budur.

### Adresinizi Görüntüleyin

```bash
qorechaind keys show mykey -a
```

Bu komut `qor1...` bech32 adresinizi çıktı olarak verir.

### Tüm Anahtarları Listeleyin

```bash
qorechaind keys list
```

### Mevcut Bir Anahtarı İçe Aktarın

```bash
qorechaind keys add mykey --recover
```

Anımsatıcı ifadenizi girmeniz istenecektir.

## Sonraki Adımlar

* [İlk İşleminiz](/getting-started/first-transaction) — Yeni cüzdanınızla QOR token gönderin
* [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) — Yayındaki Diana test ağına katılın
