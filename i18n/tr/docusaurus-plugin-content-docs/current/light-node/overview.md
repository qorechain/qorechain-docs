---
slug: /light-node/overview
title: Hafif Düğüme Genel Bakış
sidebar_label: Genel Bakış
sidebar_position: 1
---

# Hafif Düğüme Genel Bakış

**QoreChain Hafif Düğümü (Light Node)**, tam bir doğrulayıcı veya arşiv düğümü çalıştırmadan QoreChain ağını takip eden hafif bir istemcidir. Her işlemi yeniden oynatmak yerine, blok başlıklarını birden fazla RPC uç noktası üzerinden doğrular, delegasyonları ve ödülleri izler ve canlı ağ telemetrisini akıtır — hepsi küçük, kendi kendine yeten bir ikili dosyadan.

Bir hafif düğüm çalıştırmak, tam bir düğümün depolama, bant genişliği ve operasyonel maliyeti olmadan ağın ekonomisine katılmanızı ve durumunu gözlemlemenizi sağlar.

## Kendine ait sürüm hattı

Hafif düğüm, **zincir sürüm numarasından ayrı** olan **kendi sürüm hattıyla — şu anda v3.1.2** — gönderilir (zincir ayrı bir `v3.x` hattındadır). İkili dosyalar bir **SHA-256 sağlama toplamı (checksum) manifestiyle** yayınlanır — indirme deseni için bkz. [Ana Ağa Bağlanma](/getting-started/connecting-to-mainnet) — ve v3.1.2, Windows ve macOS ikili dosyalarının anahtar oluşturma/imzalama/doğrulama işlemlerini gerçekten geçtiği ilk sürümdür (önceki derlemeler bir Rust kitaplığı değişiminden öncesine aitti ve bu platformlarda sessizce başarısız oluyordu). Şu anda **testnet** yayın kanalında sunuluyor; mainnet kanalı, terfi öncesinde daha uzun bir olgunlaşma süresi için bilinçli olarak geride tutuluyor — bir mainnet indirme bağlantısı 404 hatası verirse, bunun sebebi bozuk bir bağlantı değil, budur.

Belgeleri veya sürüm notlarını okurken, hafif düğümün sürümünü (v3.1.2) ve zincirin sürümünü, aynı ana seriyi paylaşan iki ayrı sayı olarak değerlendirin.

## Neden bir hafif düğüm çalıştırmalı {#why-run-a-light-node}

- **Blok ödüllerinden pay kazanın.** Aktif, kayıtlı hafif düğümler, aşağıda açıklanan **%3 hafif düğüm ödül payına** hak kazanır.
- **Size gösterilen zincir durumunu çapraz kontrol edin.** Düğüm, en son yüksekliği hem birincil RPC uç noktasından hem de yapılandırılmış her tanık (witness) uç noktasından paralel olarak alır ve bir başlığı yalnızca blok karması (hash) üzerinde hepsi anlaştığında saklar — bu, tek bir uç noktaya güvenmekten, yapılandırılmış tüm uç noktaların aynı anda ele geçirilmesini gerektirmeye kadar çıtayı yükseltir. Bu, bağımsız kaynaklar arasında bir doğrulamadır (corroboration), **tam kriptografik uzlaşı doğrulaması değildir** (doğrulayıcı kümesi veya commit-imza kontrolü yapılmaz). Kendi düğümünüz hangi modda çalıştığını **kendi panosunda** (varsayılan olarak `http://127.0.0.1:8420`) bir `Assurance` durumu olarak bildirir — bu, merkezi bir QoreChain panosunun görebileceği bir şey değildir, çünkü düğümünüzün RPC seçimleri kendi kurulumunuza özeldir. **`trusted-single-source`** (tanık yapılandırılmamış) çoğu operatörün başladığı varsayılan değerdir, bir uyarı işareti değildir — dürüstçe işletilen tek bir uç nokta, ele geçirilmiş bir uç noktayla aynı değeri bildirir. `corroborated-across-sources` durumuna geçmek için bağımsız işletilen bir tanık ekleyin.
- **Delege edin ve otomatik bileşik (auto-compound) yapın.** Birden fazla doğrulayıcı genelinde delege edilen stake'i yönetin, ağırlığa göre bölün ve ödülleri otomatik olarak bileşik haline getirin.
- **Ağı canlı izleyin.** Gerçek zamanlı telemetri; doğrulayıcıları, uzlaşıyı, köprüyü ve tokenomiği kapsar.
- **İlk günden kuantum sonrası.** Anahtarlar ve imzalar Dilithium-5 (ML-DSA-87) kullanır.

## İki sürüm: SX ve UX

Hafif düğüm, aynı kod tabanından inşa edilmiş iki sürümde gelir. Düğümü nasıl işletmek istediğinize uygun olanı seçin.

| Sürüm | İkili Dosya | Şunun için inşa edildi | Arayüz |
| --- | --- | --- | --- |
| **SX — Server eXperience** | `lightnode-sx` | Başsız (headless) sunucu dağıtımları | Tam CLI (daemon + yönetim komutları) |
| **UX — User eXperience** | `lightnode-ux` | Masaüstü ve operatör kullanımı | Gömülü web panosu |

- **SX sürümü**, eksiksiz bir yönetim CLI'sine sahip başsız bir daemon'dur. Sunucular, otomasyon ve komut satırında yaşayan operatörler için doğru seçimdir. Bkz. [SX Sürümü](/light-node/sx-edition).
- **UX sürümü** aynı daemon'u çalıştırır, ancak telemetriyi, delegasyonları ve ödülleri bir tarayıcıda izleyebilmeniz için gömülü bir web panosu ekler. Bkz. [UX Sürümü](/light-node/ux-edition).

Her iki sürüm de aynı `config.toml` dosyasını okur, verileri aynı ana dizinde (varsayılan olarak `~/.qorechain-lightnode`) saklar ve aynı Dilithium-5 anahtarlığını (keyring) kullanır.

## %3 hafif düğüm ödül payı

QoreChain'in ücret dağıtımı, ağ verisi sunmak için hafif düğümlere sabit bir **%3 pay** ayırır. Bu, protokolün ödül bölüşümünün bir parçası olarak zincir üzerinde uygulanır ve projenin ekonomisinde belgelenen kanalın aynısıdır — tam %37 / %30 / %20 / %10 / %3 dökümü (doğrulayıcılar, yakılan, hazine, stake edenler, hafif düğümler) için bkz. [Tokenomik](/architecture/tokenomics).

Bu paya hak kazanmak için bir hafif düğümün **zincir üzerinde kayıtlı olması ve kalp atışı (heartbeat) kanıtları aracılığıyla etkin biçimde canlılığını kanıtlaması** gerekir. Kayıt ve lisanslama [Kayıt ve Lisanslama](/light-node/registration-and-licensing) sayfasında ele alınmıştır; payın nasıl kazanıldığı, bileşik hale getirildiği ve izlendiği ise [Ödüller ve İzleme](/light-node/rewards-and-monitoring) sayfasında ele alınmıştır.

## Bir bakışta çekirdek özellikler

- **Çoklu kaynaktan başlık doğrulaması** — bir başlığa güvenmeden önce en son blok karmasını yapılandırılmış her tanık uç noktasına karşı çapraz kontrol eder, tam blokları indirmeden, soğuk bir başlangıçtan bile hızlıca senkronize olur.
- **Delege stake** — yapılandırılabilir bölüşüm ağırlıklarıyla birden fazla doğrulayıcı genelinde stake edin.
- **Otomatik bileşik ödüller** — ödülleri yapılandırılabilir bir aralıkta talep edin ve yeniden delege edin.
- **İtibar farkındalıklı yeniden dengeleme** — delegasyonu otomatik olarak daha yüksek itibarlı doğrulayıcılara kaydırın.
- **Gerçek zamanlı telemetri** — bağımsız aralıklarda yenilenen doğrulayıcılar, uzlaşı, köprü ve tokenomik.
- **Zincir üzeri kayıt** — düğümü ödüllere uygun tutan kalp atışı (heartbeat) canlılık kanıtlarıyla.
- **Kuantum sonrası kriptografi** — baştan sona Dilithium-5 (ML-DSA-87) anahtarları ve imzaları.
- **Yalnızca yerel mod** — düğümü canlı bir zincire yönlendirmeden önce tüm PQC yığınını çalıştırın ve düğümü bağımsız olarak çalıştırın.

Hafif düğüm, **Apache 2.0** lisansı altında yayınlanmıştır.

## Sonraki adımlar

- [SX Sürümü](/light-node/sx-edition) — sunucu daemon'unu kurun, yapılandırın ve çalıştırın.
- [UX Sürümü](/light-node/ux-edition) — web panosu sürümünü çalıştırın.
- [Kayıt ve Lisanslama](/light-node/registration-and-licensing) — zincir üzerinde kaydolun ve bir lisans edinin.
- [Ödüller ve İzleme](/light-node/rewards-and-monitoring) — %3 payı kazanın ve düğümü sağlıklı tutun.
- [SX Sürümü](/light-node/sx-edition) ve [UX Sürümü](/light-node/ux-edition), bir hafif düğümü çalıştırmanın iki yoludur.
- [Tokenomik](/architecture/tokenomics) — hafif düğüm ödül payının daha geniş ekonomiye nasıl uyduğu.
