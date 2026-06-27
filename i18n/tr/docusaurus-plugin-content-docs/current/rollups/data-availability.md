---
slug: /rollups/data-availability
title: Veri Kullanılabilirliği
sidebar_label: Veri Kullanılabilirliği
sidebar_position: 4
---

# Veri Kullanılabilirliği

Veri kullanılabilirliği (DA), bir rollup'ın durumunun arkasındaki işlem verilerinin herkesin okuyabileceği bir yerde yayınlandığının garantisidir — böylece herkes rollup'ın durumunu bağımsız olarak yeniden oluşturabilir ve doğrulayabilir. RDK üç DA arka ucunu destekler.

| Arka uç | Ne olduğu |
| ------- | ---------- |
| **`native`** | QoreChain'in kendi içinde zincir üstü blob depolaması |
| **`celestia`** | Özel modüler bir DA katmanı olan Celestia'ya IBC üzerinden veri kullanılabilirliği |
| **`both`** | Yedeklilik için native ve Celestia birlikte |

:::caution
Veri kullanılabilirliği arka uçları, aktif olarak gelişen RDK'nın bir parçasıdır. Aşağıdaki olgunluk notlarını tasarım niyeti olarak değerlendirin ve bir arka uca üretimde güvenmeden önce **`qorechain-diana`** testnet üzerinde doğrulayın.
:::

---

## Native DA (zincir üstü blob depolaması)

Native DA, rollup işlem verilerini doğrudan QoreChain üzerinde **blob** olarak depolar. Her blob, taahhüt edilir ve adreslenebilir hale getirilir, böylece bir uzlaşma toplu işleminin arkasındaki veriler zincir üstünde alınabilir ve doğrulanabilir.

Temel kavramlar:

* **Blob'lar.** Rollup işlem verileri, her biri bir rollup kimliği ve bir blob dizini ile ilişkilendirilen veri kullanılabilirliği blob'ları olarak yayınlanır.
* **Taahhütler.** Her blob bir taahhüt (blob verilerinin bir karması) taşır, böylece bir blob, depolayan tarafa güvenmeden taahhüt edilenle karşılaştırılarak doğrulanabilir.
* **Ad alanları.** Blob'lar rollup'a özgü bir ad alanı taşıyabilir, böylece her rollup'ın verileri paylaşılan depolama içinde mantıksal olarak ayrı tutulur.
* **Saklama ve budama.** Native blob'lar sınırlı bir pencere boyunca saklanır ve ardından zincir üstü depolamayı sürdürülebilir tutmak için budanır. Budamadan sonra ham blob verileri kaldırılır, ancak taahhüt meta verileri saklanır, böylece baytlar artık zincir üstünde depolanmasa bile geçmiş taahhüt doğrulanabilir kalır.

Tam maksimum blob boyutu ve saklama penceresi, canlı modül parametreleri tarafından yönetilir. Belirli bir sınır etrafında tasarım yapmadan önce bunları sorgulayın:

```bash
qorechaind query rdk config
```

Native DA en basit seçenektir — her şeyi QoreChain içinde tutar, ana zincirin güvenliğini ve post-kuantum kriptografisini devralır, karşılığında ana zincir depolamasını tüketir.

---

## Celestia DA (Celestia'ya IBC)

`celestia` arka ucu, veri kullanılabilirliğini IBC üzerinden özel modüler bir DA ağı olan **Celestia**'ya yayınlar. Bu, blob depolamasını QoreChain'den özel amaçla oluşturulmuş bir DA katmanına aktarırken uzlaşmayı yine de QoreChain'e bağlar.

:::note
Celestia DA, olgunlaşmakta olan bir entegrasyondur. Mevcut sürümde henüz üretim için sağlamlaştırılmamış olarak değerlendirilmelidir — davranışı testnet üzerinde doğrulayın ve bugün yerleşik bir garantiye ihtiyaç duyduğunuz yerlerde `native` veya `both` tercih edin.
:::

---

## Both (yedeklilik)

`both` arka ucu, **native ve Celestia'ya birlikte** yazar ve zincir üstü bir depolama ile harici modüler bir DA katmanı arasında yedeklilik sağlar. En geniş kullanılabilirlik yüzeyini istediğinizde ve verileri iki yerde depolamak için ödeme yapmaya istekli olduğunuzda `both` seçeneğini seçin.

Celestia yolu hâlâ olgunlaştığı için, `both`'u bugün iki tam bağımsız kopyanın yerleştirildiğine dair bir garanti olarak değil, yedeklilik-gelişmekte-olan native olarak değerlendirin. Mevcut davranışı testnet üzerinde doğrulayın.

---

## Bir arka uç seçme

| İstediğiniz şey... | Seçim |
| -------------- | ------ |
| QoreChain güvenliğini devralan en basit, tamamen zincir üstü seçenek | **`native`** |
| DA'yı özel modüler bir katmana aktarmak (olgunlaşmakta) | **`celestia`** |
| Yedeklilikle maksimum kullanılabilirlik yüzeyi (olgunlaşmakta) | **`both`** |

DA'nın daha geniş uzlaşma tablosuna nasıl uyduğunu öğrenmek için bkz. **[Rollup'lara Genel Bakış](/rollups/overview)**. Daha düşük seviyeli modül referansı için bkz. **[Rollup Development Kit](/architecture/rollup-development-kit)** sayfası.
