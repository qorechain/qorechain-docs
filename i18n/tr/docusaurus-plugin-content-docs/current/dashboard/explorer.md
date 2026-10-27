---
slug: /dashboard/explorer
title: Gezgin
sidebar_label: Gezgin
sidebar_position: 2
---

# Gezgin

**Gezgin**, Panel'in zincire açılan penceresidir. Blokları, işlemleri, adresleri ve doğrulayıcıları aramak ve ağ etkinliğini gerçek zamanlı izlemek için kullanın. Gezgin salt okunurdur — göz atmak için cüzdan bağlantısı gerekmez. Panel içinde mainnet'i görüntülemek için oturum açmış olmak gerekir; hesap gerektirmeyen ayrı bir herkese açık gezgin [explore.qore.network](https://explore.qore.network) adresinde bulunur (bu farklı bir uygulamadır ve kendi Mainnet/Testnet geçişi vardır).

## Genel bakış sayfası

Ağın canlı bir anlık görüntüsünü görmek için Panel'den **Gezgin**'i açın:

- **Ağ durumu** — zincir kimliği, mevcut durum ve bir güvenlik durumu etiketi.
- **Blok etkinliği** — en son blok yüksekliği, ortalama blok süresi ve bugün üretilen bloklar.
- **Arz** — toplam bağlı QOR, bağlı oran ve dolaşımdaki arz.
- **Öne çıkan istatistikler** — toplam işlemler, aktif ve toplam doğrulayıcılar ve toplam adresler.
- **En son bloklar** — her bloğun yüksekliği, zamanı, işlem sayısı ve önericisini içeren canlı bir liste.
- **En son işlemler** — her işlemin karması, türü, bloğu, tutarı ve göndericisini içeren canlı bir liste.

Detay sayfasını açmak için herhangi bir blok veya işlem satırına tıklayın. Her listedeki bir yenileme kontrolü, en yeni girişleri getirir.

## Arama

Gezgin'in üst kısmındaki arama kutusu aşağıdakilerden herhangi birini kabul eder ve sizi otomatik olarak doğru sayfaya yönlendirir:

- Bir **adres** (`qor1...`)
- Bir **işlem karması**
- Bir **blok yüksekliği** (bir sayı)

## İşlem detayları

Bir işlem sayfası; karmasını, durumunu, tutarını, göndericisini ve alıcısını (ikisi de tıklanabilir), ücretini, blok yüksekliğini, işlem türünü ve varsa notu gösterir. Karmayı kopyalayabilir ve daha derin inceleme için tüm işlemin ham görünümünü açıp kapatabilirsiniz.

Sayfa ayrıca işlemi neyin koruduğunu da gösterir ve yalnızca zincirin doğruladığı bir iddiada bulunur:

* **PQC Verified.** Bir native şerit işlemi bu kartı yalnızca başarılı olduğunda **ve** zincirin kendisi hibrit imzasını, ML-DSA-87 kısmı dahil, doğruladığında gösterir (zincir bunun için bir doğrulama olayı kaydeder). Başarısız bir işlem veya doğrulanmış hibrit imzası olmayan bir işlem bunun yerine standart güvenlik gösterir; Gezgin bir imzanın kuantum sonrası olduğunu varsaymaz.
* **Authorised by a PQC window.** Bir EVM cüzdanından gönderilen işlem sıradan bir secp256k1 imzası taşır, bu yüzden asla "PQC Verified" olarak etiketlenmez. Gönderen, işlem gönderildiğinde açık bir [EVM yetkilendirme penceresine](/developer-guide/evm-development#evm-window) sahipse, sayfa işlemin **bir PQC penceresiyle yetkilendirildiğini** söyler ve pencereyi açan, kuantum sonrası imzalı işleme giden bir **Window opened by** bağlantısı gösterir. Bu, pencere özelliğinin etkinleşme yüksekliklerinden itibaren geçerlidir (testnet 5,920,000; mainnet 2,981,742).

Bu etiketler dashboard.qorechain.io/explorer adresindeki Panel Gezgini'ne özgüdür. explore.qore.network adresindeki ayrı gezgin farklı bir uygulamadır ve bu kuralları uygulamaz.

## Blok detayları

Bir blok sayfası; yüksekliğini, zaman damgasını, önericisini, karmasını, işlem sayısını, kullanılan gas'ı ve içerdiği işlemler listesini, imza sayısıyla birlikte gösterir. Bloklar kuantum sonrası etiket taşımaz: doğrulayıcıların mutabakat anahtarlarıyla imzalanırlar ve kuantum sonrası koruma blok başına değil, işlem başına gösterilir. Önceki ve sonraki kontrolleri, zinciri blok blok ilerlemenizi sağlar.

## Adres detayları

Bir QoreChain adresi, üç kodlamaya sahip tek bir hesaptır — Native (`qor1...`), EVM (`0x...`) ve SVM (base58) — ve adres sayfası, bu üç raydaki etkinliği tek bir kimliğin tek bir görünümünde birleştirir.

Sayfa; adresi taranabilir bir QR koduyla, QOR bakiyesini, işlem sayısını ve gelen ile giden transferlerin toplamlarını gösterir. Bunun altında, adresin Native, EVM ve SVM rayları genelindeki birleşik işlem geçmişi yer alır — transferler, sözleşme dağıtımları, PQC anahtar kayıtları, takaslar, musluk talepleri ve daha fazlası — her biri tutarı, zamanı ve durumuyla birlikte. Adresi kopyalayabilir, QR kodunu indirebilir ve detaylar için herhangi bir işlemi açabilirsiniz.

## Doğrulayıcılar {#validators}

Doğrulayıcılar görünümü, ağın doğrulayıcılarını; aktif doğrulayıcı sayısı, toplam bağlı QOR ve mutabakat sağlığı için özet kartlarıyla listeler. Tablo, her doğrulayıcının sırasını, takma adını, oy gücünü, komisyonunu ve durumunu (örneğin aktif veya hapsedilmiş) ve ayrıca bir kuantum sonrası göstergeyi gösterir. Bir arama kutusu, doğrulayıcı adına veya adresine göre filtreler. Bir doğrulayıcıya yetki vermek için bkz. [Stake Etme ve Doğrulayıcılar](/dashboard/staking-and-validators).

:::note Panel'in kendi doğrulayıcı listesi diğer ağın kümesini gösterebilir
Ağ başına yetkili doğrulayıcı listesi için [explore.qore.network](https://explore.qore.network) adresini kullanın.
:::

## Bağımsız gezgin {#standalone-explorer}

Aynı Gezgin, Panel olmadan [explore.qore.network](https://explore.qore.network) adresinde sunulur: anonim, yalnızca gezgin, `/tx/…`, `/block/…`, `/address/…` ve `/validators` gibi kısa bağlantılarla. Varsayılan olarak mainnet üzerinde açılır.
