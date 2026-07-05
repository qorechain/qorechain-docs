---
slug: /dashboard/wallet
title: Cüzdan
sidebar_label: Cüzdan
sidebar_position: 3
---

# Cüzdan

**Cüzdan** sayfası, bakiyenizi ve işlem geçmişinizi görüntülediğiniz, QOR aldığınız ve gönderdiğiniz yerdir. Sayfanın nasıl çalıştığı ağa bağlıdır:

- **Mainnet — gözetimsiz (non-custodial).** Dashboard, mainnet anahtarlarını tutmaz. Kendi cüzdanınızı bağlarsınız (Native rayı için **Keplr**, EVM rayı için **MetaMask**), gerçek bakiyeniz ve geçmişiniz doğrudan zincirden okunur ve herhangi bir ray üzerinden fon alabilirsiniz. Gönderimler, bağlı olan kendi cüzdanınızdan yapılır.
- **Testnet — gözetimli (custodial).** Dashboard sizin için bir test cüzdanı yönetir; böylece transferleri, takasları ve stake işlemlerini hiçbir kurulum yapmadan deneyebilirsiniz. Cüzdanı [Faucet](/dashboard/faucet) üzerinden fonlayın.

Hesaplar kuantum güvenli kriptografi ile korunur ve her adresin Native kodlaması `qor` bech32 önekini kullanır (`qor1...`).

## Tek hesap, üç kodlama {#one-account-three-encodings}

Bir QoreChain hesabı, üç şekilde yazılabilen tek bir kimliktir — her yürütme rayı için bir tane:

| Ray | Kodlama | Görünümü |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | örn. `5Gv7...` |

Üç kodlamanın tümü **aynı hesaba ve aynı bakiyeye** işaret eder. Herhangi bir ray üzerinden alınan fonlar tek bakiyenize düşer ve Dashboard, bakiye ile geçmişi `qor1` (Native) kodlaması üzerinden dizinler; bu sayede her raydaki etkinlik bir arada görünür.

## Cüzdanı mainnet üzerinde kullanma {#mainnet}

1. Dashboard üst bilgisini **Mainnet**'e geçirin.
2. İstenirse [tek seferlik risk onayını](/dashboard/overview#risk-acknowledgement) kabul edin — mainnet gerçek fonları taşır, Dashboard gözetimsizdir ve işlemler geri alınamaz.
3. **Connect Wallet** seçeneğini seçin ve **Keplr** (Native rayı) veya **MetaMask** (EVM rayı) arasından birini seçin, ardından bağlantıyı cüzdanınızda onaylayın.
4. Sayfa, gerçek bakiyenizi ve işlem geçmişinizi zincirden yükler.

Cüzdanınızda QoreChain henüz yapılandırılmamışsa önce ekleyin — bkz. [QoreChain'i cüzdanınıza ekleyin](#add-network).

### Mainnet üzerinde gönderme {#send-mainnet}

Dashboard mainnet anahtarlarınızı hiçbir zaman tutmadığı için gönderimler bağlı olan kendi cüzdanınızdan yapılır: transferi, herhangi bir ağda yapacağınız gibi Keplr (Native rayı) veya MetaMask (EVM rayı) içinde oluşturun ve orada imzalayın. İşlem zincire yazıldığında Dashboard onu geçmişinizde gösterir.

:::caution Gerçek fonlar, geri alınamaz transferler
Mainnet işlemleri geri alınamaz. İmzalamadan önce alıcı adresini cüzdanınızda her zaman iki kez kontrol edin.
:::

### Belirli bir ray üzerinden alma {#receive-mainnet}

1. **Receive** seçeneğini seçin.
2. Alma penceresinde seçiciyle bir ray belirleyin: **Native QOR**, **EVM** veya **SVM**.
3. Pencere, adresinizi o rayın kodlamasıyla (`qor1...`, `0x...` veya base58) bir QR kodu ve kopyalama düğmesiyle birlikte gösterir.
4. Adresi kopyalayın veya göndericinin QR kodunu taramasına izin verin.

Gönderici hangi rayı kullanırsa kullansın, fonlar aynı hesaba ulaşır — tek hesap, üç kodlama, tek bakiye.

### İşlem geçmişinizi okuma {#history}

Mainnet üzerinde, geçmişinizdeki her satır şunları gösterir:

- İşlemin hangi rayı kullandığını belirten bir **ray rozeti** — Native, EVM veya SVM.
- Genel bir etiket yerine *Send*, *PQC key registration* veya *contract deploy* gibi **gerçek bir işlem türü etiketi**.
- Tutar, zaman ve durum ile birlikte [Explorer](/dashboard/explorer) içinde açabileceğiniz işlem hash'i.

## Cüzdanı testnet üzerinde kullanma {#testnet}

Testnet üzerinde (`qorechain-diana`) Dashboard sizin için bir test cüzdanı yönetir; böylece hiçbir şey bağlamadan akışları uçtan uca test edebilirsiniz.

### Sayfa neler gösterir

- Cüzdan etiketiniz ve etkin adresiniz, kısaltılmış biçimde, tek tıkla kopyalama düğmesiyle birlikte.
- QOR cinsinden **toplam bakiyeniz**.
- Kuantum güvenli şifrelemeyi ve bağlı ağı belirten bir güvenlik paneli.
- Yenileme kontrolüne sahip bir son güncelleme göstergesi.
- Varlıklarınızı ve işlem geçmişinizi gösteren **Assets** ve **Activity** sekmeleri.

Güncel bakiyenizi ve en son etkinliğinizi zincirden çekmek için yenileme kontrolünü istediğiniz zaman kullanabilirsiniz.

### QOR gönderme (testnet)

1. **Send** seçeneğini seçin.
2. Alıcı adresini girin (`qor1...`).
3. Tutarı ve isteğe bağlı bir notu (memo) girin.
4. Ayrıntıları ve tahmini ücreti gözden geçirin, ardından onaylayın.

Alıcı adresini yazarken, hata yapmanızı önlemeye yardımcı olmak için kayıtlı kişiler ve son kullanılan adresler önerilir. Transfer gönderildikten sonra, [Explorer](/dashboard/explorer) içinde açabileceğiniz işlem hash'iyle birlikte bir onay alırsınız.

### QOR alma (testnet)

1. **Receive** seçeneğini seçin.
2. Adresinizi veya QR kodunu gönderici ile paylaşın ya da adresi tek tıkla kopyalayın.
3. İsteğe bağlı olarak, bir ödeme bağlantısı ve indirilebilir bir QR kodu oluşturmak için istenen tutarı ve notu girin.

### Test cüzdanlarınızı yönetme

Adres listenizi açmak için **My Wallets** seçeneğini seçin. Buradan cüzdanlar arasında geçiş yapabilir, yeni bir cüzdan oluşturabilir, mevcut bir cüzdanı içe aktarabilir veya artık ihtiyaç duymadığınız bir cüzdanı kaldırabilirsiniz. Etkin cüzdan, testnet üzerinde Dashboard genelinde gönderme, takas, stake ve diğer imzalı işlemler için kullanılan cüzdandır.

## QoreChain'i cüzdanınıza ekleyin {#add-network}

**Add Network** sayfası, yan yana dört kart gösterir — her bağlantı yöntemi için bir tane — böylece QoreChain'i kendi cüzdanınıza tek tıkla ekleyebilirsiniz:

| Kart | Size ne sağlar |
| --- | --- |
| **Native** | Her biri kopyalama düğmesine sahip RPC ve REST uç noktaları ile zincir kimliği — Keplr ve diğer Native rayı cüzdanları için. |
| **EVM** | Kullanıma hazır EIP-3085 ağ parametreleri — tek tıkla QoreChain, MetaMask'e ve diğer EVM cüzdanlarına eklenir. |
| **SVM** | SVM uyumlu cüzdanlar ve araçlar için SVM RPC URL'si. |
| **WalletConnect** | WalletConnect uyumlu herhangi bir cüzdanı bağlamak için bir WalletConnect eşleştirmesi. |

QoreChain'i eklemek için:

1. Dashboard üzerinden **Add Network** sayfasını açın.
2. Cüzdanınızın rayına uyan kartı seçin.
3. Ekleme düğmesini seçin (EVM, WalletConnect) veya uç noktaları ve zincir kimliğini cüzdanınızın ağ ekleme formuna kopyalayın (Native, SVM).
4. Yeni ağı cüzdanınızda onaylayın.

Genel uç noktalar `rpc.qore.host` (Native RPC), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC) ve `svm.qore.host` (SVM RPC) olup, testnet için `*-testnet` varyantları (örneğin `rpc-testnet.qore.host`) mevcuttur. Zincir kimlikleri: mainnet `qorechain-vladi` (EVM zincir kimliği `9801`), testnet `qorechain-diana` (EVM zincir kimliği `9800`).

## İlgili

- [Token Operations](/user-guide/token-operations) — QOR transferlerinin ve birimlerinin arkasındaki kavramlar.
- [Trade](/dashboard/trade) — tokenlerinizi zincir üstü AMM'de takas edin.
- [Bridge](/dashboard/bridge) — varlıkları diğer zincirlere taşıyın ve onlardan getirin.
