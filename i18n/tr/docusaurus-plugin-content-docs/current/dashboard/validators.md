---
slug: /dashboard/validators
title: Doğrulayıcılar
sidebar_label: Doğrulayıcılar
sidebar_position: 12
---

# Doğrulayıcılar

**Doğrulayıcılar** sayfası, seçtiğiniz ağın doğrulayıcılarını özet kartları, bir arama kutusu ve her doğrulayıcı için sırası, oy gücü, komisyonu, durumu ve zincirden okunan değişken bir getiri rakamıyla listeler. Nereye delege edeceğine karar veren kişiler için salt okunur bir karşılaştırma aracıdır. Delege düğmesi yoktur: stake işlemi Wallet sayfasında yapılır, bkz. [Stake ve Doğrulayıcılar](/dashboard/staking-and-validators).

## Yenilikler {#innovations}

- **Liste seçili ağı izler.** Sayfa, üst bilgide seçilen ağın kümesini ister; böylece mainnet görüntüleyenler mainnet doğrulayıcılarını, testnet görüntüleyenler testnet doğrulayıcılarını görür.
- **Zincirden okunan getiri, sınırlarıyla birlikte.** APY sütunu, zincirin staking katmanı (staking-tier) temel oranının (1 eksi doğrulayıcının komisyonu) ile çarpımıdır. Yıldız işaretiyle ve "variable, not guaranteed, lock bonuses not included" notuyla gösterilir. Rakam, değişken bir protokol oranının canlı okumasıdır; bir vaat ya da öngörü değildir.
- **Emisyon tavanını aşınca "From fees".** Emisyon tavanını aşmış bir ağ yüzde yerine **From fees** gösterir, çünkü yeni QOR basılmaz ve staking o zaman yalnızca işlem ücretlerinden kazanır. Testnet'te sütun şu anda **From fees** yazar. Bilinmeyen bir değer tire gösterir, asla %0,00 göstermez.
- **Oy gücüne göre sıralama.** Sıra oy gücünden hesaplanır; yani 1. sıradaki doğrulayıcı en fazla stake'e sahip olandır.
- **Gerçek rakamlar, dürüst boşluklar.** Komisyon, doğrulayıcının gerçek komisyonudur ve hapse atılmış (jailed) bir doğrulayıcı **Jailed** olarak gösterilir. Bölge, önerilen blok sayısı, yazılım sürümü ve son görülme yalnızca ağ bunları bildirdiğinde gösterilir, ki bugün bildirmemektedir; bilinmeyen çalışma süresi (uptime) %0 yerine **N/A** yazar.

## Nasıl kullanılır {#how-to-use}

1. Oturum açın ve sayfayı adresiyle açın: `dashboard.qorechain.io/validators`. Kenar çubuğunda bağlantı yoktur.
2. Üst bilgide ağı seçin (**Mainnet** veya **Testnet**); sayfa o ağın doğrulayıcılarıyla yeniden yüklenir.
3. Özet kartlarını okuyun: **Active Validators**, **Total Bonded**, **Avg Commission** ve **Avg Uptime**.
4. "Search by moniker or address" kutusuyla arayın.
5. Her satırı okuyun: sıra ve moniker ile adres (ve bir kopyala düğmesi), **Voting power** (stake ve toplamdaki pay), **Commission**, **APY** ve **Status** (active, jailed veya inactive), ardından çalışma süresi ve varsa isteğe bağlı ayrıntılar.
6. Delege etmek için Wallet sayfasındaki **Stake / Delegate** sekmesine gidin ([Delege et](/dashboard/staking-and-validators#delegate)). Bir doğrulayıcıya daha ayrıntılı bakmak için adres sayfasını [Gezgin](/dashboard/explorer#validators)'de açın.

:::caution APY notunu okuyun
Yüzde, değişebilen bir protokol oranına ve doğrulayıcının komisyonuna bağlıdır. İsteğe bağlı zaman kilitli staking modülünden gelen kilit bonusları dahil değildir. Bunu garantili gelir olarak değerlendirmeyin.
:::

## Nasıl erişilir {#how-to-access}

- **URL:** [dashboard.qorechain.io/validators](https://dashboard.qorechain.io/validators). Yalnızca adresle ulaşılır; kenar çubuğu onu listelemez.
- **Oturum açma:** gereklidir. Oturum kapalıyken sayfa "Authentication Required" gösterir.
- **Ağ:** üst bilgideki anahtarı izler.
- **Cüzdan:** sayfayı okumak için gerekmez.
- **Maliyet:** ücretsiz.

## Nerede yayımlanır {#where-published}

| Yüzey | Adres | Ağlar | Oturum açma |
| --- | --- | --- | --- |
| Doğrulayıcılar sayfası | `dashboard.qorechain.io/validators` | Mainnet ve testnet, üst bilgi anahtarı | Gerekli |
| Gezgin doğrulayıcı tablosu | `dashboard.qorechain.io/explorer/validators` | Mainnet ve testnet | Gerekli değil |
| Zincir verisi | `GET /cosmos/staking/v1beta1/validators` üzerinde `api.qore.host` ve `api-testnet.qore.host` | Mainnet ve testnet | Yok |

## Sınırlar ve bilinen sorunlar {#limits}

- **Sayfa salt okunurdur** ve kenar çubuğundan bağlantılı değildir.
- **APY değişkendir ve garantili değildir.** Kilit bonuslarını hariç tutar ve emisyon tavanına ulaşılan yerlerde **From fees** gösterir.
- **Bir node panosundan daha az veri alanı:** bölge, önerilen blok sayısı, yazılım sürümü ve son görülme yalnızca mevcut olduğunda gösterilir ve çalışma süresi N/A yazabilir.
- **Jailed doğrulayıcılar** jailed olarak gösterilir ve Delegate panelinde sunulmaz.
- **Veri kısa bir süre önbelleğe alınır** (yaklaşık 30 saniye), bu yüzden zincirdeki bir değişikliğin görünmesi biraz zaman alabilir.
