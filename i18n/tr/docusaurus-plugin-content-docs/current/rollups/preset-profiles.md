---
slug: /rollups/preset-profiles
title: Ön Ayar Profilleri
sidebar_label: Ön Ayar Profilleri
sidebar_position: 2
---

# Ön Ayar Profilleri

RDK, yaygın uygulama kategorileri için ayarlanmış anahtar teslim rollup yapılandırmaları sunan **ön ayar profilleri** (preset profiles) ile birlikte gelir. Bir ön ayar; bir uzlaşma (settlement) modunu, bir sıralayıcı (sequencer) modunu, bir veri erişilebilirliği (data availability) arka ucunu ve yürütme parametrelerini bir araya getirir; böylece her seçeneği tek tek elle seçmeden bir rollup başlatabilirsiniz.

Profil, `create-rollup` komutuna konumsal olarak iletilir:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
Aşağıdaki ön ayar bazlı değerler, ağın yayımlanmış profil tablosunu yansıtan, pakette gelen **`@qorechain/rdk`** profil varsayılanlarıyla eşleşir. Henüz hiçbir ağda rollup oluşturulmamıştır. Yetkili (kesin) yapılandırma için canlı modül parametrelerini `qorechaind query rdk config` komutuyla (veya `GET /qorechain/rdk/v1/params` adresini okuyan ve her iki ağda da sunulan `@qorechain/rdk` paketindeki `rdk.params()` ile) sorgulayın ve ana ağdan önce **`qorechain-diana`** test ağında doğrulayın.
:::

---

## Ön ayar profilleri

Her ön ayar; bir uzlaşma paradigmasını (ve bu uzlaşmanın gerektirdiği kanıt sistemini), bir sıralayıcı modunu, bir veri erişilebilirliği arka ucunu, bir gas modelini ve bir VM'i bir araya getirir:

| Profil | Uzlaşma (kanıt) | Sıralayıcı | DA | Gas modeli | VM | Hedeflenen kullanım senaryosu |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK); **henüz kullanılamaz, aşağıya bakın** | dedicated | native | EIP-1559 | EVM | DeFi ve AMM tarzı uygulamalar — hızlı kesinliğin ve öngörülebilir ücretlerin önemli olduğu borç verme piyasaları, DEX'ler ve türev ürünler |
| **`gaming`** | based | based | native | flat | custom | Yüksek verimli, düşük gecikmeli oyun durumu ve oyun içi ekonomiler |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA planlanıyor) | standard | QoreChain Native (`native`) | NFT basımı, pazar yerleri ve dijital koleksiyon ürünleri |
| **`enterprise`** | based | based | native | subsidized | EVM | Sponsorlu (sübvanse edilmiş) ücretlerle izinli (permissioned) ve konsorsiyum dağıtımları |
| **`custom`** | tamamen parametrelendirilebilir (varsayılanlar: optimistic / fraud) | tamamen parametrelendirilebilir | tamamen parametrelendirilebilir | tamamen parametrelendirilebilir | tamamen parametrelendirilebilir (varsayılan: EVM) | Her alan kullanıcı tanımlıdır — sıfırdan başlayın ve her seçeneği kendiniz belirleyin |

Bazı kısıtlamalar [uzlaşma → kanıt matrisinden](/rollups/overview) kaynaklanır: `optimistic` uzlaşma `fraud` kanıtları kullanır, `zk` uzlaşma `snark` (veya `stark`) kullanır; `based` ve `sovereign` ise kanıt taşımaz. `based` uzlaşma her zaman `based` sıralayıcı moduyla eşleşir. `nft` ön ayarı bugün yerel (native) olarak uzlaşır ve **Celestia DA planlanmaktadır**.

RDK v0.4.2 itibarıyla, Wasm VM seçeneğinin (QoreChain Native sözleşmelerini yürüten çalışma zamanı) adı **`native`** — yani QoreChain Native — olmuştur. `cosmwasm` kabul edilen eski (legacy) bir takma ad olarak kalmaya devam eder ve her ikisi de aktarım katmanında `cosmwasm` olarak eşlenir; dolayısıyla zincir, gezgin (explorer) ve Dashboard değişmemiştir.

:::note
Ön ayar bazlı yapılandırma, zincirin v3.2.3 kaynak kodundaki profil tablosuna karşı doğrulanmıştır; tablo, v3.2.4 kaynağında (mainnet) ve v3.2.6 kaynağında (testnet) değişmemiştir (27 Ekim 2026'da kontrol edildi). Bu tabloda `create-rollup` komutu profilin ön ayarını otomatik olarak uygular: **`defi` = zk + EVM, `gaming` = based + custom VM, `nft` = optimistic + QoreChain Native (Wasm), `enterprise` = based + EVM, `custom` = optimistic + EVM (varsayılanlar)**. `custom` ön ayarı her alanı açık bırakır — gösterilen değerler onun başlangıç varsayılanlarıdır.
:::

Dört alan (domain) ön ayarını makul başlangıç noktaları, **`custom`** profilini ise tamamen açık seçenek olarak değerlendirin. Bir araya getirilen kesin parametreler sürümler arasında değişebilir — yetkili değerler için `rdk config` komutunu (aşağıda) sorgulayın, ardından size en yakın ön ayardan başlayıp ince ayar yapın.

[`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) CLI aracı, çalıştırılabilir bir başlangıç projesi oluşturur — her profil için bir şablon (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — böylece tek bir komutla bir profilden çalışan create/query koduna geçebilirsiniz.

---

## Bir ön ayarın zincir üzerinde taşıdıkları {#what-a-preset-carries}

Bazı ayrıntıları yanlış varsaymak kolaydır ve bir profil seçmeden önce bilmeye değerdir:

* **`defi` her iki ağda da henüz kullanılamaz.** Uzlaşmasını bir ZK kanıtıyla yapar; bunun için rollup adına kayıtlı bir doğrulama anahtarı (verification key) gerekir. Zincirin bir anahtar kaydetme yolu yoktur; bu yüzden bir `defi` rollup'ından (ve `defi-rollup` şablonundan) gelen her ZK yığını, ücreti ödendikten sonra reddedilir. Anahtar kaydı zincir v3.2.7 için planlanmıştır. Şablonun demo devresi de zincirin açık girdilerine karşı doğrulanamaz ve RDK 0.7.0'dan itibaren şablon, ücret boşa gitmesin diye bir batch göndermeden önce durur. O zamana kadar `nft` veya `custom` (optimistic uzlaşma) seçin; bkz. [ZK / STARK ve Çekimler](/rollups/zk-stark-withdrawals).
* **`nft` ve `custom`**, 1.000 QOR'luk bir itiraz teminatı (challenge bond) ve ana ağda v3.2.4 öncesinde 100.800 blokluk bir itiraz penceresiyle optimistic olarak uzlaşır (varsayılan 604.800 "saniyenin" blok başına sabit 6 saniyeden dönüştürülmüş hali; ana ağın şu anki ≈3,1 sn'lik blokları ile yaklaşık 3,7 gün). v3.2.4'ten itibaren bir batch bunun yerine blok süresinin saniyesi cinsinden ölçülen bir pencere alır: test ağında 8.337.253 yüksekliğinden (19 Ekim 2026), ana ağda 3.742.566 yüksekliğinden (23 Ekim 2026) itibaren. Modülün varsayılan penceresi ana ağda 604.800 saniye, test ağında 3.600 saniyedir (27 Ekim 2026'da okundu); bu nedenle hedeflediğiniz ağda `GET /qorechain/rdk/v1/params` adresini kontrol edin.
* **`gaming` ve `enterprise`** `based` sıralama kullanır; bu, bugün yığınları rollup'ın oluşturucusunun gönderdiği anlamına gelir.
* **Blok süresi ve işlem sınırları** (örneğin `defi` 500 ms, `gaming` 200 ms, `nft` 2.000 ms, `enterprise` ve `custom` 1.000 ms) zincir üzerindeki kayıtta saklanır. Bunlar rollup'ın kendi zincirini tanımlar ve ana (host) zincir tarafından uygulanmaz.

---

## Bir profil seçme {#getting-a-recommendation}

`suggest-profile` sorgusu ve RDK'nın `suggestProfile()` yardımcısı, sade dille yazılmış bir açıklamadan bir ön ayar önermek üzere tasarlanmıştır. Bunlar, herkese açık uç noktaların sunmadığı `qor_suggestRollupProfile` JSON-RPC metoduna dayanır; bu yüzden `suggestProfile()` şu anda **yedek** olarak her zaman `defi` döndürür ve `qorechaind query rdk suggest-profile` yalnızca o RPC'ye bir işaretçi yazdırır. Bunun yerine yukarıdaki tablodan bir profil seçin ve gereksinimlerinize (uzlaşma garantileri, sıralayıcı güven modeli, veri erişilebilirliği ihtiyaçları ve VM) göre gözden geçirin.

---

## Ön ayar yapılandırmasını zincir üzerinde inceleme

Ön ayar ayrıntıları zincir üzerinde çözümlendiği için, bir profilin neye çözümlendiğini görmenin yetkili yolu modülü ve oluşturulan rollup'ı sorgulamaktır:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

Bu desen — dağıtımdan önce `config` sorgulamak, oluşturmadan sonra `rollup` sorgulamak — zamanla değişebilecek belgelenmiş değerlere güvenmek yerine, seçtiğiniz ön ayarın tam olarak ne ürettiğini doğrulamanızı sağlar.

---

## Sonraki adımlar

* **[Rollup Dağıtma](/rollups/deploying-a-rollup)** — Dashboard veya CLI üzerinden bir ön ayardan rollup oluşturun, ardından yaşam döngüsünü yönetin.
* **[Rollup'lara Genel Bakış](/rollups/overview)** — bir ön ayarın bir araya getirdiği uzlaşma paradigmaları ve sıralayıcı modları.
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — daha alt düzey modül referansı.
