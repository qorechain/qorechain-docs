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
Aşağıdaki ön ayar bazlı değerler, ağın yayımlanmış profil tablosunu yansıtan, pakette gelen **`@qorechain/rdk`** profil varsayılanlarıyla eşleşir. RDK olgunlaştıkça bu değerler yine de değişebilir — yetkili (kesin) yapılandırma için canlı modül parametrelerini `qorechaind query rdk config` komutuyla (veya SDK'dan `RdkClient.params()` ile) sorgulayın ve ana ağdan önce **`qorechain-diana`** test ağında doğrulayın.
:::

---

## Ön ayar profilleri

Her ön ayar; bir uzlaşma paradigmasını (ve bu uzlaşmanın gerektirdiği kanıt sistemini), bir sıralayıcı modunu, bir veri erişilebilirliği arka ucunu, bir gas modelini ve bir VM'i bir araya getirir:

| Profil | Uzlaşma (kanıt) | Sıralayıcı | DA | Gas modeli | VM | Hedeflenen kullanım senaryosu |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | DeFi ve AMM tarzı uygulamalar — hızlı kesinliğin ve öngörülebilir ücretlerin önemli olduğu borç verme piyasaları, DEX'ler ve türev ürünler |
| **`gaming`** | based | based | native | flat | custom | Yüksek verimli, düşük gecikmeli oyun durumu ve oyun içi ekonomiler |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA planlanıyor) | standard | QoreChain Native (`native`) | NFT basımı, pazar yerleri ve dijital koleksiyon ürünleri |
| **`enterprise`** | based | based | native | subsidized | EVM | Sponsorlu (sübvanse edilmiş) ücretlerle izinli (permissioned) ve konsorsiyum dağıtımları |
| **`custom`** | tamamen parametrelendirilebilir (varsayılanlar: optimistic / fraud) | tamamen parametrelendirilebilir | tamamen parametrelendirilebilir | tamamen parametrelendirilebilir | tamamen parametrelendirilebilir (varsayılan: EVM) | Her alan kullanıcı tanımlıdır — sıfırdan başlayın ve her seçeneği kendiniz belirleyin |

Bazı kısıtlamalar [uzlaşma → kanıt matrisinden](/rollups/overview) kaynaklanır: `optimistic` uzlaşma `fraud` kanıtları kullanır, `zk` uzlaşma `snark` (veya `stark`) kullanır; `based` ve `sovereign` ise kanıt taşımaz. `based` uzlaşma her zaman `based` sıralayıcı moduyla eşleşir. `nft` ön ayarı bugün yerel (native) olarak uzlaşır ve **Celestia DA planlanmaktadır**.

RDK v0.4.2 itibarıyla, Wasm VM seçeneğinin (CosmWasm sözleşmelerini yürüten çalışma zamanı) adı **`native`** — yani QoreChain Native — olmuştur. `cosmwasm` kabul edilen eski (legacy) bir takma ad olarak kalmaya devam eder ve her ikisi de aktarım katmanında `cosmwasm` olarak eşlenir; dolayısıyla zincir, gezgin (explorer) ve Dashboard değişmemiştir.

:::note
Ön ayar bazlı yapılandırma, `create-rollup` komutunun profilin ön ayarını otomatik olarak uyguladığı zincir sürümü **v3.1.74** üzerinde canlı olarak doğrulanmıştır: **`defi` = zk + EVM, `gaming` = based + custom VM, `nft` = optimistic + QoreChain Native (Wasm), `enterprise` = based + EVM, `custom` = optimistic + EVM (varsayılanlar)**. `custom` ön ayarı her alanı açık bırakır — gösterilen değerler onun başlangıç varsayılanlarıdır.
:::

Dört alan (domain) ön ayarını makul başlangıç noktaları, **`custom`** profilini ise tamamen açık seçenek olarak değerlendirin. Bir araya getirilen kesin parametreler sürümler arasında değişebilir — yetkili değerler için `rdk config` komutunu (aşağıda) sorgulayın, ardından size en yakın ön ayardan başlayıp ince ayar yapın.

[`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) CLI aracı, çalıştırılabilir bir başlangıç projesi oluşturur — her profil için bir şablon (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — böylece tek bir komutla bir profilden çalışan create/query koduna geçebilirsiniz.

---

## Öneri alma: `suggest-profile`

Hangi ön ayarın size uygun olduğundan emin değilseniz, `suggest-profile` sorgusu kullanım senaryonuzun sade bir dille yazılmış açıklamasını alır ve önerilen bir profil döndürür.

```bash
qorechaind query rdk suggest-profile [use-case]
```

**Örnek:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

Bu öneri yararlı bir başlangıç noktasıdır — bir yapılandırmaya karar vermeden önce öneriyi kendi özel gereksinimlerinize (uzlaşma garantileri, sıralayıcı güven modeli, veri erişilebilirliği ihtiyaçları ve VM) göre gözden geçirin.

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
