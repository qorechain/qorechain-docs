---
slug: /user-guide/deploying-rollups
title: Rollup'ları Dağıtma
sidebar_label: Rollup'ları Dağıtma
sidebar_position: 6
---

# Rollup'ları Dağıtma

Bu kılavuz, Rollup Development Kit (RDK) ile QoreChain üzerinde uzlaşan (settle olan) uygulamaya özel bir rollup'ı başlatmaya yönelik kısa bir yönlendirmedir. Adım adım komutlar **[Bir Rollup Dağıtma](/rollups/deploying-a-rollup)** sayfasında yer alır; bu sayfa ise başlamadan önce neye ihtiyacınız olduğunu kapsar.

:::caution Erken aşama yeteneği
Henüz hiçbir ağda rollup oluşturulmamıştır (23 Ekim 2026'da kontrol edildi). Mainnet (**`qorechain-vladi`**, EVM zincir kimliği **9801**) 23 Ekim 2026'dan beri **v3.2.4** zincir sürümünü çalıştırır; test ağı (**`qorechain-diana`**, EVM zincir kimliği **9800**) 19 Ekim 2026'dan beri v3.2.4 çalıştırır. Önce test ağında doğrulayın; itiraz penceresi davranışı [Rollup Development Kit](/architecture/rollup-development-kit#optimistic-settlement) sayfasında açıklanmıştır.
:::

---

## Burada rollup nedir {#what-a-rollup-is-here}

Bir QoreChain rollup'ı, **zincir dışında yürütülen** ve **uzlaşma** için QoreChain'i kullanan, uygulamaya özel bir zincirdir: rollup'ı zincir üzerinde kaydedersiniz, durum kökü (state-root) toplu işlemlerini gönderirsiniz ve (isteğe bağlı olarak) veri blob'ları ile çekim taahhütlerini gönderirsiniz. Zincir üzerindeki kayıt; bir profil, bir uzlaşma modu, bir sıralayıcı modu, bir veri kullanılabilirliği arka ucu, bir gaz modeli ve bir VM etiketi taşır; ana zincir, rollup'ınızın işlemlerini yürütmez.

---

## Hazır Profiller {#preset-profiles}

RDK, her biri yaygın bir uygulama kategorisi için ayarlanmış beş hazır profille birlikte gelir:

| Profil         | Uzlaşma (kanıt)      | Sıralayıcı (Sequencer) | Veri Kullanılabilirliği | Gaz modeli   | VM       | Hedef kullanım senaryosu |
| -------------- | --------------------- | ---------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)            | dedicated  | native          | EIP-1559     | EVM      | DeFi/AMM uygulamaları (borç verme, DEX'ler, türev ürünler) |
| **gaming**     | based                 | based      | native          | flat         | custom   | Yüksek işlem hacimli oyun durumu ve gerçek zamanlı deneyimler |
| **nft**        | optimistic (fraud)    | dedicated  | native (Celestia DA planlanıyor) | standard | QoreChain Native | NFT basımı ve pazar yeri iş yükleri |
| **enterprise** | based                 | based      | native          | subsidized   | EVM      | Sponsorlu ücretlerle izinli ve konsorsiyum dağıtımları |
| **custom**     | varsayılanlar: optimistic (fraud) | dedicated | native | standard | EVM | Başlangıç varsayılanları; mesajın izin verdiklerini ayarlayın |

Ayrıntılar ve olgunluk notları için [Hazır Profiller](/rollups/preset-profiles) sayfasına bakın (örneğin CLI ile oluşturulan bir `defi` rollup'ı henüz ZK toplu işlemlerini kesinleştiremez ve `based` sıralama şu anda göndermeyi oluşturucunun yaptığı anlamına gelir).

---

## Gereksinimler {#requirements}

| Gereksinim | Detaylar |
| ----------- | ------- |
| **Rollup stake'i** | En az 10.000 QOR (`min_stake_for_rollup`, 10.000.000.000 uqor). Güncel değeri okuyun: `qorechaind query rdk config` |
| **Oluşturma yakımı** | Sağladığınız stake'in %1'i oluşturma sırasında yakılır; geri kalanı rollup başına bir defterde emanete alınır. Rollup'ı durdurduğunuzda içinde kalanı geri alırsınız (ondan ödenen çekimler ve sahtecilik kanıtı ödülleri iadeyi azaltır) |
| **Rollup kimliği** | 3 ila 64 karakter: küçük harfler, rakamlar, `.`, `_` ve `-`; bir harf veya rakamla başlamalıdır. Bunu bozan bir kimlik, ücreti ödedikten sonra reddedilir; bu yüzden önce kontrol edin (TypeScript RDK 0.6.0 bunu yayınlamadan önce kontrol eder) |
| **Katman kayıt stake'i** | Bir rollup oluşturmak, çok katmanlı (multilayer) modülde bir katman da kaydeder; bu da oluşturucudan 1.000 QOR daha kilitler (rollup durdurulduğunda iade edilir). Bu bakiye olmadan katman oluşturulmaz ve rollup çapalanamaz |
| **Hesap** | Kayıtlı bir kuantum sonrası anahtara sahip, fonlanmış bir hesap (her yerel şerit işlemi hibrit imzalanır) |

---

## İpuçları {#tips}

* Hazır bir profille başlayın. Hazır profiller uzlaşma modunu, sıralayıcıyı, veri kullanılabilirliği arka ucunu ve VM'i belirler; `create-rollup` yalnızca kimliği, profili, stake'i ve isteğe bağlı bir `--vm` değerini alır.
* %1'lik oluşturma yakımı, sağladığınız stake'e uygulanır.
* Toplu işlemler, oluşturucunun kuantum sonrası imzasını yanlarında göndermediğiniz sürece çapa olmadan uzlaşır (`tx rdk submit-batch` üzerinde `--anchor-signature`, v3.2.2'den beri mevcut). Bkz. [Durum Çapalama](/architecture/rollup-development-kit#state-anchoring).
* L1'e çekimler (`tx rdk execute-withdrawal`) rollup'ınızın emanet defterinden ödenir ve v3.2.3'ten beri mainnet'te çalışır; çekim kökü olan kesinleşmiş bir toplu işlem gerektirir ve yalnızca `uqor` kullanır.
* Rollup oluşturucusu bugün toplu işlem göndericisidir (hiçbir hazır profil bir sıralayıcı adresi belirlemez); bu yüzden oluşturucu anahtarını güvende tutun: rollup'ı yalnızca oluşturucu duraklatabilir, sürdürebilir veya durdurabilir.
* RDK beş dilde yayımlanmıştır (her kayıt defterinde sürüm 0.6.0, 23 Ekim 2026'da kontrol edildi), ancak hibrit işlemleri yalnızca TypeScript istemcisi imzalar ve bunu da yalnızca ona kuantum sonrası anahtar çiftinizi verdiğinizde yapar; `qorollup` CLI'ı ile Python, Go, Rust ve Java istemcileri yalnızca klasik imzalar, ki her iki ağ da bunu reddeder. Bkz. [RDK 0.6.0: değişiklikler ve sınırlar](/rollups/deploying-a-rollup#rdk-050-limits).
* `suggest-profile` yardımcısı şu anda genel uç noktalarda sabit bir `defi` yedeği döndürür; bu yüzden profil tablosundan seçim yapın.

---

## Sonraki adımlar {#next-steps}

* [Bir Rollup Dağıtma](/rollups/deploying-a-rollup) — CLI veya TypeScript ile bir rollup oluşturun, işletin ve durdurun.
* [Rollup'lara Genel Bakış](/rollups/overview) — uzlaşma modları, sıralayıcılar, kanıt sistemleri.
* [Veri Kullanılabilirliği](/rollups/data-availability) ve [ZK / STARK ve Çekimler](/rollups/zk-stark-withdrawals).
