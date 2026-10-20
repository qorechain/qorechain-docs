---
slug: /light-node/overview
title: Hafif Düğüme Genel Bakış
sidebar_label: Genel Bakış
sidebar_position: 1
---

# Hafif Düğüme Genel Bakış

**QoreChain Hafif Düğümü (Light Node)**, tam bir doğrulayıcı veya arşiv düğümü çalıştırmadan QoreChain ağını takip eden hafif bir istemcidir. Her işlemi yeniden oynatmak yerine, blok başlıklarını birden fazla RPC uç noktası üzerinden doğrular, operatör hesabının delegasyonlarını ve ödüllerini zincirden yansıtır ve canlı ağ telemetrisini akıtır — hepsi küçük, kendi kendine yeten bir ikili dosyadan.

Bir hafif düğüm çalıştırmak, tam bir düğümün depolama, bant genişliği ve operasyonel maliyeti olmadan ağın durumunu gözlemlemenizi sağlar. Hafif düğüm ödül payına katılmak, lisansa bağlı ayrı bir adımdır; kayıt her iki ağda da açıktır — bkz. [Ödül programının durumu](#reward-program-status).

## Kendine ait sürüm hattı

Hafif düğüm **kendi sürüm hattıyla — şu anda 3.1.9** — gönderilir; bu hat **zincir sürüm numarasından ayrıdır** (ana ağ `v3.2.3` zincirini çalıştırır). Her ağ için ikili dosyalar, `https://download.qore.host/<net>/lightnode/latest.json` adresinde bir **SHA-256 sağlama toplamı (checksum) manifestiyle** yayınlanır (`<net>`, `mainnet` veya `testnet` değeridir). Her iki kanal da aynı 3.1.9 derlemesini taşır ve her iki manifest de `minCompatible` değerini `3.1.9` olarak ayarlar; bu nedenle eski hafif düğüm derlemeleri değiştirilmelidir. Sürümde 12 ikili dosya bulunur — Linux, macOS ve Windows için SX ve UX, her biri amd64 ve arm64 üzerinde — ayrıca bir `SHA256SUMS` dosyası. İndirme ve doğrulama adımları için bkz. [SX Sürümü](/light-node/sx-edition#install); `v3.1.9` kaynak etiketinden imaj oluşturmak için bkz. [Docker](/light-node/sx-edition#docker).

GitHub sürümüne bir Android derlemesi yalnızca **önizleme** olarak eklenmiştir: zinciri takip eder ve doğrular, ancak kayıt olmaz ve ödül kazanmaz.

Belgeleri veya sürüm notlarını okurken, hafif düğümün sürümünü (3.1.9) ve zincirin sürümünü (v3.2.3), aynı ana seriyi paylaşan iki ayrı sayı olarak değerlendirin.

## Neden bir hafif düğüm çalıştırmalı {#why-run-a-light-node}

- **Hafif düğüm ödül payına katılın.** Stake ve çalışma süresi kurallarını karşılayan kayıtlı, aktif hafif düğümler, aşağıda açıklanan **%3 hafif düğüm tahsisine** hak kazanır. Kayıt bir `lightnode_operator` lisansı gerektirir — bkz. [Kayıt ve Lisanslama](/light-node/registration-and-licensing). Bir düğümü çalıştırmak ve senkronize etmek lisans gerektirmez.
- **Size gösterilen zincir durumunu çapraz kontrol edin.** Düğüm, en son yüksekliği hem birincil RPC uç noktasından hem de yapılandırılmış her tanık (witness) uç noktasından paralel olarak alır ve bir başlığı yalnızca blok karması (hash) üzerinde hepsi anlaştığında saklar — bu, tek bir uç noktaya güvenmekten, yapılandırılmış tüm uç noktaların aynı anda ele geçirilmesini gerektirmeye kadar çıtayı yükseltir. Bu, bağımsız kaynaklar arasında bir doğrulamadır (corroboration), **tam kriptografik uzlaşı doğrulaması değildir** (doğrulayıcı kümesi veya commit-imza kontrolü yapılmaz). Düğümünüz hangi modda çalıştığını, hata ayıklama günlüğündeki her `synced header` satırında `assurance` değeri olarak kaydeder (`log_level = "debug"` olarak ayarlayın); bu değer düğümün panosunda veya `status` çıktısında gösterilmez ve merkezi hiçbir QoreChain hizmeti bunu göremez, çünkü düğümünüzün RPC seçimleri kendi kurulumunuza özeldir. **`trusted-single-source`**, hiç tanık yapılandırılmadığında elde ettiğiniz değerdir — düğüm başlangıçta bunu belirten bir uyarı kaydeder, çünkü dürüstçe işletilen tek bir uç nokta, ele geçirilmiş bir uç noktayla aynı değeri bildirir. `corroborated-across-sources` durumuna geçmek için bağımsız işletilen bir tanık ekleyin.
- **Stake'inizi gözden kaçırmayın.** Düğüm, operatör hesabının delegasyonlarını zincirden yansıtır ve delege ettiğiniz bir doğrulayıcı yapılandırılabilir bir itibar puanının altına düştüğünde uyarır. Stake'i kendisi asla taşımaz — delegasyon değişiklikleri kendi cüzdanınızdan yapılır.
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

## %3 hafif düğüm ödül payı {#the-3-light-node-reward-share}

QoreChain'in ücret dağıtımı, hafif düğümlere sabit bir **%3 pay** ayırır (`reward_share` parametresi, `0.03`). Tam %37 / %30 / %20 / %10 / %3 dökümü (doğrulayıcılar, yakılan, hazine, stake edenler, hafif düğümler) için bkz. [Tokenomik](/architecture/tokenomics).

Bu %3, hafif düğüm modül hesabına ödenen tutardır; düğüm başına bir hak değildir. Her 100 blokta zincir, her uygun düğüme önceki uzlaşmadan bu yana biriken tutarın stake ağırlıklı payını kaydeder; bu pay **düğüm başına sınırlandırılır**. Zincir v3.2.3'ten beri sınır **düğüm başına 30 günde 2.000 QOR**'dur (`max_reward_per_month_per_node`, `2000000000` uqor); önceki uzlaşmadan bu yana geçen blok süresine orantılanır ve düğümün çalışma süresine göre ölçeklenir; bu, `lightnode-monthly-cap` kuralıdır. v3.2.3'ten önce sınır blok başına ifade ediliyordu (`max_reward_per_block_per_node`, `1713` uqor) ve ödül havuzu sorgusu bu değeri hâlâ bildirir. Sınır bir tavandır, vaat edilen bir tutar değildir. Kazanılmayan her şey yalnızca bir yönetişim oylamasının serbest bırakabileceği bir rezerve taşınır; böylece ilk kayıt olan için biriken bir havuz oluşmaz. Canlı bölüşümü `GET /qorechain/lightnode/v1/reward_pool` ile inceleyebilirsiniz.

Ödüllere hak kazanmak için bir hafif düğümün **zincir üzerinde kayıtlı, aktif** (kalp atışlarıyla canlılığını kanıtlayan) olması, en az minimum bağlı (bonded) stake'e sahip olması ve çalışma süresini minimumun üzerinde veya eşit tutması gerekir. Kayıt ve lisanslama [Kayıt ve Lisanslama](/light-node/registration-and-licensing) sayfasında ele alınmıştır; ödüllerin nasıl kaydedildiği, talep edildiği ve izlendiği ise [Ödüller ve İzleme](/light-node/rewards-and-monitoring) sayfasında ele alınmıştır.

## Ödül programının durumu {#reward-program-status}

:::note Kayıt açık
Kayıt ana ağda (`qorechain-vladi`, zincir v3.2.3) ve test ağında (`qorechain-diana`) açıktır. Ekim 2026 itibarıyla ana ağda altı `lightnode_operator` lisansı verilmiştir ve henüz hiçbir hafif düğüm kaydolmamıştır. Ödül muhasebesi, v3.2.0 yükseltmesinden beri her iki ağda canlıdır. Bir düğümü çalıştırmak ve senkronize etmek lisans gerektirmez, ancak çalışma süresi **düğümünüzün kaydedildiği bloktan itibaren** sayılır; bu nedenle öncesinde bir düğüm çalıştırmak kredi kazandırmaz.

Sürüm manifesti (`https://download.qore.host/<net>/lightnode/latest.json`) resmi sinyali `registration.open` alanında taşır. Canlı durum için `https://api.qore.host` (ana ağ) veya `https://api-testnet.qore.host` (test ağı) üzerinde `GET /qorechain/license/v1/holders/lightnode_operator` ve `GET /qorechain/lightnode/v1/stats` adreslerini sorgulayın.
:::

## Bir bakışta çekirdek özellikler

- **Çoklu kaynaktan başlık doğrulaması** — bir başlığa güvenmeden önce en son blok karmasını yapılandırılmış her tanık uç noktasına karşı çapraz kontrol eder, tam blokları indirmeden, soğuk bir başlangıçtan bile hızlıca senkronize olur.
- **Delegasyon takibi** — operatör hesabının delegasyonlarını zincirden yansıtır (salt okunur).
- **İsteğe bağlı otomatik talep** — birikmiş hafif düğüm ödüllerini yapılandırılabilir bir aralıkta operatör hesabına talep eder. Varsayılan olarak kapalıdır; asla yeniden delege etmez.
- **İtibar uyarıları** — delege ettiğiniz bir doğrulayıcı yapılandırılabilir bir itibar puanının altına düştüğünde uyarır; stake'i taşımaz.
- **Gerçek zamanlı telemetri** — bağımsız aralıklarda yenilenen doğrulayıcılar, uzlaşı, köprü ve tokenomik.
- **Zincir üzeri kayıt** — düğümü ödüllere uygun tutan kalp atışı (heartbeat) canlılık kanıtlarıyla. Kayıt lisansa bağlıdır. Düğüm kendi işlemlerini Linux, macOS ve Windows üzerinde kendisi imzalar; başka bir yazılıma gerek yoktur.
- **Kuantum sonrası kriptografi** — baştan sona Dilithium-5 (ML-DSA-87) anahtarları ve imzaları.
- **Yalnızca yerel mod** — düğümü canlı bir zincire yönlendirmeden önce tüm PQC yığınını çalıştırın ve düğümü bağımsız olarak çalıştırın.

Hafif düğüm, **Apache 2.0** lisansı altında yayınlanmıştır.

## Sonraki adımlar

- [SX Sürümü](/light-node/sx-edition) — sunucu daemon'unu kurun, yapılandırın ve çalıştırın.
- [UX Sürümü](/light-node/ux-edition) — web panosu sürümünü çalıştırın.
- [Kayıt ve Lisanslama](/light-node/registration-and-licensing) — bir lisans edinin ve zincir üzerinde kaydolun.
- [Ödüller ve İzleme](/light-node/rewards-and-monitoring) — %3 payın nasıl kaydedildiği ve talep edildiği ve düğümü sağlıklı tutma yolları.
- [Tokenomik](/architecture/tokenomics) — hafif düğüm ödül payının daha geniş ekonomiye nasıl uyduğu.
