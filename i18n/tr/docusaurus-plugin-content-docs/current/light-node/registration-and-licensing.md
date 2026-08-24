---
slug: /light-node/registration-and-licensing
title: Kayıt ve Lisanslama
sidebar_label: Kayıt ve Lisanslama
sidebar_position: 4
---

# Kayıt ve Lisanslama

[%3 hafif düğüm ödül payını](/light-node/rewards-and-monitoring) kazanmak için bir hafif düğümün **zincir üzerinde kayıtlı** olması ve canlı olduğunu kanıtlamaya devam etmesi gerekir. Bu sayfa kaydın nasıl işlediğini, düğümün canlılığını nasıl kanıtladığını ve Dashboard üzerinden bir düğümü nasıl kaydedip lisanslayacağınızı ele alır.

## Zincir üzerinde kayıt

Kayıt işlemi, hafif düğümünüzü zincire yazarak protokolün onun varlığından, türünden (`sx` veya `ux`) ve hangi operatör anahtarı tarafından kontrol edildiğinden haberdar olmasını sağlar. Kaydedildikten ve canlı hale geldikten sonra düğüm, hafif düğüm ödül payı için uygun hale gelir.

### Kayıt komutunu oluşturma

SX sürümü, bu düğümü kaydetmek için tam zincir komutunu yazdırabilir. Şunu çalıştırın:

```bash
lightnode-sx register
```

Bu komut operatör anahtarınızı keyring'den okur ve operatör adresiniz, düğüm türünüz ve sürümünüzle birlikte çalıştırmaya hazır bir `qorechaind` işlemi yazdırır. Komut iki isteğe bağlı bayrak alır:

- `--type` — düğüm türü, `sx` veya `ux` (varsayılan `sx`).
- `--version` — kaydedilecek düğüm sürümü (varsayılan olarak ikili dosyanın kendi sürümü).

Yazdırılan komut, düğümü zincir üzerinde `x/lightnode` modülü altında kaydeder. Bunu, katıldığınız ağda (testnet `qorechain-diana` veya mainnet `qorechain-vladi`) fonlanmış bir operatör hesabıyla gönderin.

:::note
`lightnode-sx register`, kayıt işlemini incelemeniz ve göndermeniz için **yazdırır** — kendiliğinden yayınlamaz. Bu, düğümün ne zaman ve nasıl kaydedileceği konusunda kontrolü sizde tutar.
:::

## Kalp atışı canlılık kanıtları

Kayıt tek başına uygunluğu sürdürmek için yeterli değildir. Kayıtlı bir hafif düğüm, **kalp atışı canlılık kanıtları** göndererek çevrimiçi olduğunu sürekli kanıtlamalıdır. Bu kalp atışları, zincirin aktif düğümleri — ödül payı için uygun olanları — kayıtlı ama çevrimdışı düğümlerden ayırt etmesinin yoludur.

Pratikte bu, kayıtlı ve çalışır (ve senkronize) durumda tutulan bir düğümün uygunluğunu koruduğu, çevrimdışı kalan bir düğümün ise canlılık kanıtlamayı durdurup geri dönene kadar uygunluğunu kaybettiği anlamına gelir. Bu yüzden daemon'u çalışır ve sağlıklı tutmak, ödül kazanmanın bir parçasıdır — kalp atışı ve senkron sağlığını nasıl izleyeceğiniz için [Ödüller ve İzleme](/light-node/rewards-and-monitoring) sayfasına bakın.

### PQC ortak imzalı kalp atışı hattı {#pqc-cosigned-heartbeat-pipeline}

QoreChain **varsayılan olarak PQC gerektirir**, bu yüzden kalp atışı canlılık işlemi klasik-yalnız bir imza yerine kuantum-sonrası ortak imzalı bir hat üzerinden üretilir. Daemon, imzasız kalp atışını oluşturur, ardından yayından önce onu **hibrit Dilithium-5 (ML-DSA-87)** imzasıyla ortak imzalar — bu, zincirin her işlem için uyguladığı aynı kuantum-sonrası duruştur. Düğüm, her `interval_blocks` penceresi başına bir kalp atışı gönderir (zincirin `heartbeat_interval` parametresiyle eşleşir) ve erken gönderim reddedilmelerinden kaçınmak için kendini blok yüksekliğine göre hızlandırır.

Zincir üzerinde kalp atışları daemon'da isteğe bağlıdır (opt-in): düğüm yapılandırmasında `[heartbeat]` bölümünü etkinleştirin (`enabled = true`) ve `qorechaind_path`'i, oluştur-sonra-ortak-imzala akışını gerçekleştiren bir `qorechaind` ikili dosyasına yönlendirin. Bu yapılandırılmadığında düğüm, zincir üzerinde kalp atışı göndermeden çalışır ve operatör canlılığı yazdırılan zincir komutlarıyla elle gönderebilir.

## Dashboard üzerinden kayıt ve lisanslama

Bir düğümü ayağa kaldırmayı ve lisans durumunu kontrol etmeyi QoreChain Dashboard'un **Araçlar** sayfası üzerinden de yapabilirsiniz. Düğümü çalıştırmak ile ödül programına katılmak iki farklı şeydir ve Dashboard, tek bir rehberli kayıt akışı sunmak yerine bu ikisini ayrı tutar:

1. **Düğümünüzü ayağa kaldırın (Araçlar → Hafif Düğüm, adım 1).** Bu, herhangi bir lisans veya herhangi bir zincir üzeri kontrol gerektirmez ve her ziyaretçiye her şeyden önce gösterilir. Güncel ağ manifestosunu canlı okur ve ikili dosyayı indirip doğrulama, düğümü genesis ile başlatma, `config.toml`'u ağın eşlerine yönlendirme ve genesis'ten senkronize olmak yerine durum senkronizasyonu (state-sync) yapma adımlarında size rehberlik eder.
2. **Ödül programı durumunuzu kontrol edin (Araçlar → Hafif Düğüm).** Hafif düğüm ödül payına katılmak, ayrı ve zincir üzeri koşula bağlı bir adımdır: zincir üzerinde verilmiş aktif bir `lightnode_operator` lisansı, delege edilmiş minimum bir QOR miktarı — bu, delege ettiğiniz tüm doğrulayıcılar genelindeki toplamınız olarak sayılır, doğrulayıcı başına değil, ve kendinizin beyan ettiği değil staking'den canlı okunan bir değerdir — ve küçük bir zincir üzeri kayıt ücreti gerektirir. **Kayıt henüz açık değildir** ve **Lisans Satın Al** üzerinden lisans almak bunu erken açmaz — bugün kaydolunacak bir şey yoktur. Bu sekme, açılana kadar bu gereksinimi doldurulacak bir form olarak değil, kontrol edilecek bir durum olarak gösterir. Bu süre zarfında düğümünüzü çalıştırıp senkronize tutun; kayıt açılmadan önceki çalışma süresinin, açıldığında sayılması beklenmektedir.
3. **Lisansınız zincir üzerinde verildiğinde kaydolun (Araçlar → Hafif Düğüm).** **Lisans Satın Al** üzerinden alınan bir lisans önce bizim tarafımızda kaydedilir; onu zincir üzerinde tanınır kılan verme (grant) işlemi ayrı bir adımdır ve bu verme gerçekleşene kadar kayıt reddedilir. Gerçekleştiğinde bu sekme, durum panelinin yerine bir kayıt formu koyar: operatör adresiniz (`qor1…`), bir moniker ve genel bir uç nokta URL'si, artı stake taahhüdünün bir onayı.
4. **Onaylayın ve stake bağlayın.** Gönderdikten sonra Dashboard, kaydın bir onay özetini gösterir (moniker, operatör adresi, uç nokta, stake niyeti, durum). Uygunluk açıldığında onaylanan stake'i operatör adresinizden bağlayın (bond).

CLI yerine bir arayüz tercih ediyorsanız veya lisanslama ile kaydı tek bir yerde birlikte yönetmek istiyorsanız Dashboard akışını kullanın. Yukarıdaki `lightnode-sx register` komutu, işlemi kendisi oluşturup incelemeyi tercih edenler için kullanılabilir olmaya devam eder — zincir üzeri kayıt ve ödül programı uygunluğu, hangi yolu kullanırsanız kullanın zincir tarafından aynı şekilde yönetilir.

## Sırada ne var

- [Ödüller ve İzleme](/light-node/rewards-and-monitoring) — %3 payın nasıl kazanıldığı, bileşik hale getirildiği ve izlendiği.
- [SX Sürümü](/light-node/sx-edition) — `register` komutu ve tam CLI referansı.
