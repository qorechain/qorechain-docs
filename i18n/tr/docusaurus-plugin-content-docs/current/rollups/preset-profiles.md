---
slug: /rollups/preset-profiles
title: Ön Ayar Profilleri
sidebar_label: Ön Ayar Profilleri
sidebar_position: 2
---

# Ön Ayar Profilleri

RDK, yaygın uygulama kategorileri için ayarlanmış kullanıma hazır rollup yapılandırmaları sağlayan **ön ayar profilleri** içerir. Bir ön ayar; bir uzlaşma modunu, sıralayıcı modunu, veri erişilebilirliği arka ucunu ve yürütme parametrelerini bir araya getirir; böylece her seçeneği elle seçmeden bir rollup başlatabilirsiniz.

Bir profil, `create-rollup`'a konumsal olarak iletilir:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
Aşağıdaki ön ayar başına değerler, ağın yayınlanan profil tablosunu yansıtan gönderilen **`@qorechain/rdk`** profil varsayılanlarıyla eşleşir. RDK olgunlaştıkça bunlar yine de değişebilir — yetkili yapılandırma için canlı modül parametrelerini `qorechaind query rdk config` ile (veya SDK'dan `RdkClient.params()` ile) sorgulayın ve ana ağdan önce **`qorechain-diana`** test ağında doğrulayın.
:::

---

## Ön ayar profilleri

Her ön ayar; bir uzlaşma paradigmasını (ve uzlaşmasının gerektirdiği kanıt sistemini), bir sıralayıcı modunu, bir veri erişilebilirliği arka ucunu, bir gas modelini ve bir VM'i bir araya getirir:

| Profil | Uzlaşma (kanıt) | Sıralayıcı | DA | Gas modeli | VM | Amaçlanan kullanım senaryosu |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | DeFi ve AMM tarzı uygulamalar — hızlı kesinliğin ve öngörülebilir ücretlerin önemli olduğu borç verme piyasaları, DEX'ler ve türevler |
| **`gaming`** | based | based | native | flat | custom | Yüksek verimli, düşük gecikmeli oyun durumu ve oyun içi ekonomiler |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA planlanıyor) | standard | CosmWasm | NFT basımı, pazar yerleri ve dijital koleksiyon ürünleri |
| **`enterprise`** | based | based | native | subsidized | EVM | Sponsorlu (sübvanse edilmiş) ücretlerle izinli ve konsorsiyum dağıtımları |
| **`custom`** | tamamen parametrelendirilebilir (varsayılanlar: optimistic / fraud) | tamamen parametrelendirilebilir | tamamen parametrelendirilebilir | tamamen parametrelendirilebilir | tamamen parametrelendirilebilir (varsayılan: EVM) | Her alan kullanıcı tanımlıdır — sıfırdan başlayın ve her seçeneği kendiniz ayarlayın |

[Uzlaşma → kanıt matrisinden](/rollups/overview) birkaç kısıtlama doğar: `optimistic` uzlaşması `fraud` kanıtlarını kullanır, `zk` `snark` (veya `stark`) kullanır ve `based` ile `sovereign` herhangi bir kanıt taşımaz. `based` uzlaşması her zaman `based` sıralayıcı moduyla eşleşir. `nft` ön ayarı bugün yerel olarak uzlaşır ve **Celestia DA planlanmaktadır**.

:::note
Ön ayar başına yapılandırma, `create-rollup`'ın profilin ön ayarını otomatik olarak uyguladığı **v3.1.74** zincir sürümünde canlı olarak doğrulanmıştır: **`defi` = zk + EVM, `gaming` = based + custom VM, `nft` = optimistic + CosmWasm, `enterprise` = based + EVM, `custom` = optimistic + EVM (varsayılanlar)**. `custom` ön ayarı her alanı açık bırakır — gösterilen değerler onun başlangıç varsayılanlarıdır.
:::

Dört alan ön ayarını mantıklı başlangıç noktaları olarak ve **`custom`** profilini tamamen açık seçenek olarak değerlendirin. Tam olarak paketlenmiş parametreler sürümler arasında değişebilir — yetkili değerler için `rdk config` (aşağıda) sorgulayın, ardından en yakın ön ayardan başlayıp ince ayar yapın.

[`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) CLI'sı, çalıştırılabilir bir başlangıç projesinin iskeletini oluşturur — her profil için bir şablon (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — böylece bir profilden çalışan oluşturma/sorgulama koduna tek bir komutla geçebilirsiniz.

---

## Bir öneri alma: `suggest-profile`

Hangi ön ayarın uygun olduğundan emin değilseniz, `suggest-profile` sorgusu kullanım senaryonuzun sade dilde bir açıklamasını alır ve önerilen bir profil döndürür.

```bash
qorechaind query rdk suggest-profile [use-case]
```

**Örnek:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

Öneri yararlı bir başlangıç noktasıdır — bir yapılandırmaya karar vermeden önce öneriyi kendi özel gereksinimlerinize (uzlaşma garantileri, sıralayıcı güven modeli, veri erişilebilirliği ihtiyaçları ve VM) göre gözden geçirin.

---

## Ön ayar yapılandırmasını zincir üzerinde inceleme

Ön ayar ayrıntıları zincir üzerinde çözümlendiğinden, bir profilin neye çözümlendiğini görmenin yetkili yolu modülü ve oluşturulan rollup'ı sorgulamaktır:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

Bu kalıp — dağıtmadan önce `config` sorgulayın, sonra `rollup` sorgulayın — değişebilecek belgelenmiş değerlere güvenmek yerine seçtiğiniz ön ayarın tam olarak neyi ürettiğini doğrulamanızı sağlar.

---

## Sonraki adımlar

* **[Bir Rollup Dağıtma](/rollups/deploying-a-rollup)** — Dashboard veya CLI aracılığıyla bir ön ayardan bir rollup oluşturun, ardından yaşam döngüsünü yönetin.
* **[Rollup'lara Genel Bakış](/rollups/overview)** — bir ön ayarın bir araya getirdiği uzlaşma paradigmaları ve sıralayıcı modları.
* **[Rollup Geliştirme Kiti](/architecture/rollup-development-kit)** — daha düşük seviyeli modül referansı.
