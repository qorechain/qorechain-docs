---
slug: /dashboard/explorer
title: Gezgin
sidebar_label: Gezgin
sidebar_position: 2
---

# Gezgin

**Gezgin**, zincire salt okunur penceredir: blokları, işlemleri, adresleri ve doğrulayıcıları arayın ve ağ etkinliğini izleyin. Bir transferi kontrol etmek, bir hesabı incelemek, bir işlemi hangi imzanın koruduğunu görmek veya doğrulayıcı kümesine bakmak isteyen herkes içindir. İki gezgin vardır: Dashboard'un içindeki `dashboard.qorechain.io/explorer` adresindeki gezgin ve hesap gerektirmeyen, [explore.qore.network](https://explore.qore.network) adresindeki ayrı bir herkese açık uygulama. Bunlar farklı uygulamalardır ve aynı etiketleme kurallarını uygulamazlar; bu nedenle bu sayfa ikisini de kapsar.

## Yenilikler {#innovations}

- **Yalnızca zincir doğruladığında bir imza etiketi.** Dashboard Gezgini'nde bir native işlem, **PQC Verified** kartını yalnızca başarılı olduysa (kod 0) **ve** zincir doğrulanmış durumuyla bir `pqc_hybrid_verify` olayı yaydıysa gösterir. Başarısız bir işlem hiçbir kuantum sonrası iddia almaz.
- **EVM işlemleri, onları yetkilendiren pencereyi gösterir.** Etkinleşme yüksekliğinden itibaren (testnet 5,920,000; mainnet 2,981,742) bir EVM işlemi "Authorised by a PQC window" gösterir ve onu açan, native, ML-DSA-87 imzalı işleme giden bir "Window opened by" bağlantısı sunar. Gösterilen pencere, göndericinin işlem yüksekliğinde veya altındaki, süresi dolmamış ve o zamandan beri kapatılmamış en son pencere açma işlemidir. Bir EVM işlemi asla "PQC Verified" olarak etiketlenmez: sıradan bir secp256k1 imzası taşır. Bkz. [EVM yetkilendirme penceresi](/developer-guide/evm-development#evm-window).
- **Blok başına kuantum sonrası etiket yok.** Bloklar mutabakat anahtarlarıyla imzalanır; bu yüzden koruma işlem başına gösterilir, asla blok başına değil.
- **Zincirden doğrulayıcı kuantum sonrası durumu.** Bir doğrulayıcının adres sayfasında bir "Post-Quantum Crypto" alanı vardır (Enabled, Disabled veya N/A). Enabled, operatörün kayıtlı bir ML-DSA-87 anahtarı olduğu anlamına gelir. Sahiplik kanıtı zincirde isteğe bağlıdır.
- **Tek hesap, üç ray.** Bir `qor1...` geçmişi native, EVM ve SVM etkinliğini birleştirir ve adres sayfası hâlâ vesting aşamasındaki miktarı ve bir sonraki kilit açma tarihini gösterir.
- **Ağ bilgileri ve endpoint'ler tek panelde.** Chain ID, EVM chain ID, token, ondalık basamaklar, adres öneki, coin type, minimum gas fiyatı ve kopyalanabilir herkese açık endpoint'ler, bir "Add QoreChain to your wallet" paneliyle birlikte.
- **Bağımsız gezgin yalnızca herkese açık endpoint'ler üzerine kuruludur.** [explore.qore.network](https://explore.qore.network) zincirin herkese açık endpoint'lerini okur ve hesap gerektirmez. Adres sayfası, bir hesabın `qor1`, `0x` ve SVM biçimlerini canlı bir eşitlik kontrolüyle gösterir (wei = uqor x 10^12; lamport = uqor x 1000) ve rotaları cüzdan derin bağlantıları olarak çalışır.

## Nasıl kullanılır {#how-to-use}

### Genel bakış

Kenar çubuğunda **Explorer**'ı açın. Genel bakış şunları gösterir:

- bir "Post-Quantum Secured" çipiyle ağ durumu (ağ düzeyinde bir etiket; işlem başına iddia işlem sayfasındadır);
- **Latest Block**, **Block Time** ve **Blocks Today**;
- **Total Bonded**, **Bonded Ratio** ve **Circulating**;
- **Transactions**, **Real Txs**, **Active Set** ve **Total Addresses**;
- yenileme düğmeleri ve otomatik yenilemeyle **Latest Blocks** ve **Latest Transactions**.

Sayfasını açmak için bir blok veya işlem satırına tıklayın.

### Arama

Arama kutusu (yer tutucu "Search QoreChain (Address, Tx, Block)...") yazdığınıza göre yönlendirir:

- `qor...` adres sayfasını açar.
- `0x...` veya 64 karakterlik bir dize işlem sayfasını açar.
- Rakamlar blok sayfasını açar.

:::note Bir 0x adresi "Transaction Not Found" sayfasına düşer
Dashboard araması `0x...` girdisini bir işlem hash'i olarak ele alır. Bir EVM adresini aramak için bunun yerine `qor1...` biçimini arayın (bir `0x` adresi, `qor1` biçimiyle aynı 20 bayttır) veya adres sayfası ikisini de kabul eden [explore.qore.network](https://explore.qore.network) adresini kullanın.
:::

### İşlem sayfası

İşlem sayfası hash'i (kopyalama ile), durumu ve türü, Block Height, Interactions (From ve To), Value & Fees, Memo, Gas Consumed, varsa bir zincirler arası satırı ve **Raw Data**'yı gösterir. Ayrıca işlemi neyin koruduğunu da gösterir ve yalnızca zincirin desteklediği bir iddiada bulunur:

- **PQC Verified.** Başarılı olmuş ve hibrit imzası (ML-DSA-87 kısmı dahil) zincirin kendisi tarafından doğrulanmış bir native lane işlemi. Başarısız bir işlem veya doğrulanmış hibrit imzası olmayan bir işlem bunun yerine standart güvenlik gösterir.
- **Authorised by a PQC window.** Göndericinin açık bir [EVM yetkilendirme penceresi](/developer-guide/evm-development#evm-window) varken gönderilmiş bir EVM işlemi, **Window opened by** bağlantısıyla.

### Blok sayfası

Önceki ve sonraki okları zincirde ilerletir. **Core Information** yüksekliği, hash'i, önericiyi, imza sayısını ve Gas Used'ı içerir; ardından **Technical Hashes** ve **Block Transactions** gelir. Bloklar kuantum sonrası etiket taşımaz.

### Adres sayfası

Bir QoreChain adresi, üç kodlamaya sahip tek bir hesaptır: Native (`qor1...`), EVM (`0x...`) ve SVM (base58) ve adres sayfası üçünün de etkinliğini birleştirir.

- **Copy address** ve **Show QR Code** (bir açılır kutu; indirme yoktur).
- **Total Balance** ve **Available**, ve hâlâ vesting aşamasındaki miktar için bir sonraki kilit açma tarihiyle bir satır.
- **Total Activity** ve birleşik geçmiş (Transfer, Faucet Claim ve Cross-Chain Swap gibi yöntemler).
- Bir doğrulayıcının adres sayfasında (`/explorer/address/qorvaloper1...`), **Post-Quantum Crypto** alanı.

### Doğrulayıcılar {#validators}

`/explorer/validators` ağın doğrulayıcılarını listeler. Özet kartları **Active Validators**, **Bonded Tokens** ve **Consensus Health** (ölçülmüş bir değer değil, bir durum etiketi) gösterir. Tabloda Rank, Validator, Voting Power, Commission, Status ve PQC vardır (tablodaki PQC sütunu her satır için soluktur; gerçek durumu için doğrulayıcının adres sayfasını kullanın). Arama kutusunda "Search validator..." yazar. Liste başlıkta seçilen ağı izler. Delege etmek için bkz. [Staking & Validators](/dashboard/staking-and-validators); getiri ve oturum açma ile daha geniş bir karşılaştırma için bkz. [Validators](/dashboard/validators).

### Ağ bilgileri ve cüzdana ekleme

Genel bakış, zincir bilgilerini ve her biri kopyalanabilir herkese açık endpoint'leri, ayrıca Wallet sayfasındakiyle aynı **Add QoreChain to your wallet** panelini taşır (bkz. [Add QoreChain to your wallet](/dashboard/wallet#add-network)).

### Bağımsız gezgin {#standalone-explorer}

[explore.qore.network](https://explore.qore.network) ayrı, yalnızca gezgin olan bir web uygulamasıdır. **mainnet** üzerinde açılır ve başlığında bir **Testnet / Mainnet** anahtarı vardır. Rotalar:

| Rota | Ne gösterir |
| --- | --- |
| `/` | Canlı yükseklik, durum, arz, bağlı stake, en son bloklar ve işlemler, zincir bilgileri, herkese açık endpoint'ler ve kılavuz bağlantıları. |
| `/blocks`, `/block/{height}` | Blok listesi ve işlemleriyle bir blok. |
| `/txs`, `/tx/{hash}` | İşlem listesi ve durum, ücret, gas, mesajlar ve ham yanıtla bir işlem. |
| `/address/{qor1... or 0x...}` | Üç kodlamayı ve eşitlik kontrolünü içeren birleşik kimlik sayfası. `/account/*`, `/address/*` adresine yönlendirir. |
| `/validators`, `/validator/{address}` | Oy gücü ve komisyonla doğrulayıcı kümesi ve tek bir doğrulayıcı. |
| `/tokens`, `/token/{denom}`, `/assets` | Token ve varlık listeleri. |
| `/contracts`, `/nfts`, `/collections` | Sözleşmeler, NFT'ler ve koleksiyonlar. |

Arama bir blok yüksekliğini, 64 onaltılık basamaklı bir hash'i (`0x` ile veya onsuz), bir `qor1...` veya `0x...` adresini ya da bir `qorvaloper1...` adresini kabul eder. Bir `qorvaloper1...` araması o doğrulayıcının sayfasını değil, doğrulayıcılar listesini açar. Bir **Add to wallet** bölümü suggestChain (Keplr, Leap, Cosmostation), EIP-3085 (MetaMask ve diğer EVM cüzdanları), SVM özel RPC yönergeleri ve WalletConnect v2 eşleştirmesi sunar.

`/tx/`, `/block/` ve `/address/` rotaları EIP-3085 blok gezgini bağlantılarıyla çalışır; böylece bir gezgin URL'si açan cüzdanlar doğru sayfaya düşer.

:::caution Gezginin /api/lcd adresini koddan kullanmayın
Bağımsız gezginin kendi sayfalarına hizmet veren `/api/lcd/...` adresinde salt okunur bir proxy'si vardır ve tarayıcının ağ çerezine göre yanıt verir. Herkese açık bir API değildir: değişebilir, programatik kullanım için oran planlaması yapılmamıştır ve çerezin adlandırdığı ağı döndürür. Betikler, hizmetler ve cüzdanlar için bunun yerine herkese açık REST endpoint'lerini kullanın: `https://api.qore.host` (mainnet) ve `https://api-testnet.qore.host` (testnet). Bkz. [REST & gRPC endpoints](/api-reference/rest-grpc-endpoints).
:::

:::note Bağımsız gezgin henüz Dashboard'un PQC etiketleme kurallarını uygulamaz
[Yenilikler](#innovations) bölümündeki kurallar (yalnızca zincir doğrulamasından sonra bir kuantum sonrası etiketi ve EVM işlemleri için "Authorised by a PQC window" kartı) Dashboard Gezgini'nde canlıdır. explore.qore.network adresindeki bağımsız gezgin bunlar için güncellenmemiştir: işlem sayfası, başarısız bir işlemi henüz ayırt etmeyen bir hibrit imza işareti gösterir ve EVM işlemlerini eski ifadesiyle etiketler. Dashboard Gezgini'nin etiketlerini başvuru olarak kabul edin.
:::

## Nasıl erişilir {#how-to-access}

- **Dashboard Gezgini:** [dashboard.qorechain.io/explorer](https://dashboard.qorechain.io/explorer). Ağı başlıktan seçin. Mainnet'teki **genel bakış** oturum açmayı ve [tek seferlik onayı](/dashboard/overview#risk-acknowledgement) gerektirir; testnet'teki genel bakış ve her iki ağdaki **tüm ayrıntı sayfaları** (işlem, blok, adres, doğrulayıcılar) hesap olmadan açılır.
- **Bağımsız gezgin:** [explore.qore.network](https://explore.qore.network). Hesap yok, cüzdan yok. Testnet için başlığındaki anahtarı kullanın.
- **Maliyet:** ücretsiz. Herhangi bir şeyi okumak için cüzdan bağlantısı gerekmez.

## Nerede yayımlandı {#where-published}

| Yüzey | Adres | Ağlar | Hesap |
| --- | --- | --- | --- |
| Dashboard Gezgini | `dashboard.qorechain.io/explorer` (`/explorer/tx/<hash>`, `/explorer/block/<height>`, `/explorer/address/<address>`, `/explorer/validators`) | Mainnet ve testnet, başlıktaki anahtar | Yalnızca mainnet'teki genel bakış |
| Bağımsız gezgin | `explore.qore.network` | Mainnet (varsayılan) ve testnet anahtarı | Yok |
| Zincir verisi | `api.qore.host`, `api-testnet.qore.host` (REST), `rpc.qore.host`, `rpc-testnet.qore.host` (RPC) | Mainnet ve testnet | Yok |

## Sınırlar ve bilinen sorunlar {#limits}

- **Dashboard aramasına yazılan bir `0x` adresi** "Transaction Not Found" sayfasına düşer. `qor1...` biçimini kullanın.
- Dashboard doğrulayıcı tablosundaki **PQC sütunu** her zaman soluktur. Bir doğrulayıcının gerçek durumu adres sayfasındadır.
- **Gösterilmeyenler:** işlem başına pencere kullanım sayacı, bloklar için kuantum sonrası kanıtlar ve doğrulayıcılar tablosunda doğrulayıcı başına kuantum sonrası bayrağı.
- **Bağımsız gezgin** Dashboard'un etiketleme kurallarını henüz benimsemedi (yukarıya bakın) ve bir `qorvaloper1...` araması doğrulayıcılar listesini açar.
- **Bağımsız gezginin /api/lcd adresi** sitenin kendisi içindir, programlar için değil.
- **Ağ, Dashboard Gezgini'nde başlığı izler:** diğer ağdan bir hash "not found" gösterir.
