---
slug: /light-node/overview
title: Hafif Düğüme Genel Bakış
sidebar_label: Genel Bakış
sidebar_position: 1
---

# Hafif Düğüme Genel Bakış

**QoreChain Hafif Düğümü (Light Node)**, tam bir doğrulayıcı veya arşiv düğümü çalıştırmadan QoreChain ağını takip eden hafif bir istemcidir. Her işlemi yeniden oynatmak yerine, blok başlıklarını kriptografik olarak doğrular, delegasyonları ve ödülleri izler ve canlı ağ telemetrisini akıtır — hepsi küçük, kendi kendine yeten bir ikili dosyadan.

Bir hafif düğüm çalıştırmak, tam bir düğümün depolama, bant genişliği ve operasyonel maliyeti olmadan ağın ekonomisine katılmanızı ve durumunu gözlemlemenizi sağlar.

## Kendine ait sürüm hattı

Hafif düğüm, **zincir sürüm sürümünden ayrı** olan **kendi sürüm hattıyla — şu anda v3.1.1** — gönderilir (zincir ayrı bir `v3.x` hattındadır). Hafif düğümün v3.1.1 hattı, `qorechain-core` ile hizalanmıştır: çekirdeğin imza doğrulama davranışını koruyan ve bunu sürekli entegrasyonda çalıştıran bir kuantum sonrası kriptografi (PQC) regresyon paketi (anahtar oluşturma, imzalama, doğrulama ve kurcalama tespiti) ekler.

Belgeleri veya sürüm notlarını okurken, hafif düğümün sürümünü (v3.1.1) ve zincirin sürümünü, aynı ana seriyi paylaşan iki ayrı sayı olarak değerlendirin.

## Neden bir hafif düğüm çalıştırmalı

- **Blok ödüllerinden pay kazanın.** Aktif, kayıtlı hafif düğümler, aşağıda açıklanan **%3 hafif düğüm ödül payına** hak kazanır.
- **Zinciri kendiniz doğrulayın.** Düğüm, atlamalı (skipping) hafif istemci ile başlık doğrulaması yapar; böylece uzak bir API'ye güvenmeden zincir durumunun kriptografik güvencesini elde edersiniz.
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

- **Atlamalı (skipping) hafif istemci** — tam blokları indirmeden başlıkları doğrular, soğuk bir başlangıçtan bile hızlıca senkronize olur.
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
