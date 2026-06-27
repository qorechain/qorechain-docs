---
slug: /architecture/rollup-development-kit
title: Rollup Geliştirme Kiti
sidebar_label: Rollup Geliştirme Kiti
sidebar_position: 12
---

# Rollup Geliştirme Kiti

`x/rdk` modülü, geliştiricilerin QoreChain üzerinde uygulamaya özel rollup'lar dağıtmasına olanak tanıyan kapsamlı bir Rollup Geliştirme Kiti (RDK) sağlar. Dört uzlaşma (settlement) paradigmasını, birden fazla sıralayıcı (sequencer) modunu, takılabilir veri erişilebilirliği (data availability) arka uçlarını ve yapay zeka destekli yapılandırma optimizasyonunu destekler.

---

## Uzlaşma Paradigmaları

QoreChain RDK, her biri farklı güven varsayımlarına, kesinlik (finality) özelliklerine ve kanıt gereksinimlerine sahip dört farklı uzlaşma modunu destekler: **optimistic**, **zk**, **based** ve **sovereign**.

### Optimistic Uzlaşma

Optimistic rollup'lar işlemlerin varsayılan olarak geçerli olduğunu kabul eder ve anlaşmazlık çözümü için dolandırıcılık kanıtlarına (fraud proofs) dayanır.

* **Kanıt sistemi**: Etkileşimli dolandırıcılık kanıtları
* **İtiraz penceresi**: 7 gün (604.800 saniye), rollup başına yapılandırılabilir
* **İtiraz teminatı**: 1.000 QOR (1.000.000.000 uqor) — bir dolandırıcılık kanıtı itirazı göndermek için gereklidir
* **Kesinlik**: Geçerli bir itiraz olmadan itiraz penceresi sona erene kadar ertelenir
* **Otomatik kesinleştirme**: `EndBlocker`, itiraz penceresi anlaşmazlık olmadan geçtiğinde partileri (batch) otomatik olarak kesinleştirir

**Parti yaşam döngüsü**:

```
Submitted → [challenge window expires] → Finalized
Submitted → [fraud proof submitted] → Challenged → Rejected
```

### ZK (Sıfır Bilgi) Uzlaşma {#zk-zero-knowledge-settlement}

ZK rollup'lar, durum geçişinin doğruluğunu garanti eden kriptografik geçerlilik kanıtları sağlar.

* **Kanıt sistemi**: SNARK (Groth16, PLONK) veya STARK (şeffaf, güvenilir kurulum gerektirmez)
* **Kesinlik**: Kanıt doğrulamasında anında — itiraz penceresi gerekmez
* **Maksimum kanıt boyutu**: 1 MB (1.048.576 bayt)
* **Özyineleme derinliği**: Yapılandırılabilir kanıt toplama derinliği (varsayılan: 1)
* **Olgunluk**: Mevcut sürümde ZK uzlaşma, boş olmayan herhangi bir kanıtı kabul eden taslak (stub) doğrulama kullanır. Tam SNARK/STARK kanıt doğrulaması planlanmış bir yükseltmedir ve henüz üretim için sağlamlaştırılmamış olarak değerlendirilmelidir.

**Parti yaşam döngüsü**:

```
Submitted + valid proof → Finalized (instant)
```

### Based Uzlaşma

Based rollup'lar, işlem sıralamasını L1'e (QoreChain) ait önericilere (proposer) devreder ve ana zincirin canlılık ile sansüre direnç garantilerini devralır.

* **Kanıt sistemi**: Gerekmez — L1 önericileri doğruluğun kaynağıdır
* **Sıralayıcı**: `based` sıralayıcı modunu kullanmalıdır (doğrulama ile zorunlu kılınır)
* **Kesinlik**: QoreChain üzerinde 2 bloklu onay
* **Dahil etme gecikmesi**: Rollup işlemlerinin zorunlu dahil edilmesinden önceki yapılandırılabilir blok sayısı
* **Öncelik ücreti paylaşımı**: L1 önericilerine ödenen öncelik ücretlerinin yapılandırılabilir yüzdesi

**Parti yaşam döngüsü**:

```
Submitted → [2 L1 blocks] → Finalized (auto)
```

### Sovereign Uzlaşma

Sovereign rollup'lar bağımsız bir uzlaşma (consensus) ile çalışır ve işlemlerini kendileri sıralar. Doğrulanabilirlik için durumu QoreChain'e demirler (anchor), ancak kesinlik için ana zincire bağlı değildir.

* **Kanıt sistemi**: Yok
* **Kesinlik**: Bağımsız — rollup'ın kendi uzlaşması tarafından belirlenir
* **Durum demirleme**: Durum kökleri (state root) şeffaflık ve doğrulanabilirlik için QoreChain'e gönderilir, ancak zorunlu tutulmaz
* **Otomatik kesinleştirme**: Yok — sovereign rollup'lar kendi kesinliklerini yönetir

---

## Kanıt Sistemi Uyumluluğu

| Uzlaşma Modu    | Dolandırıcılık Kanıtları |     SNARK |     STARK |     Yok |
| --------------- | -----------------------: | --------: | --------: | ------: |
| **Optimistic**  |                 Gerekli |        -- |        -- |      -- |
| **ZK**          |                       -- | Desteklenir | Desteklenir |    -- |
| **Based**       |                       -- |        -- |        -- | Gerekli |
| **Sovereign**   |                       -- |        -- |        -- | Gerekli |

STARK ve tam ZK kanıt doğrulaması hâlâ olgunlaşmaktadır; yukarıdaki [ZK Uzlaşma](#zk-zero-knowledge-settlement) olgunluk notuna bakın.

---

## Hazır Profiller

RDK, yaygın kullanım durumları için optimize edilmiş, anahtar teslim rollup yapılandırmaları sağlayan **beş hazır profil** ile gelir. Her hazır profil; bir uzlaşma paradigmasını, sıralayıcı modunu, veri erişilebilirliği arka ucunu, gaz modelini ve hedef alanına göre ayarlanmış bir VM'i bir araya getirir:

| Profil           | Uzlaşma (kanıt)          | Sıralayıcı | DA              | Gaz modeli   | VM      | Hedef kullanım durumu |
| ---------------- | ------------------------ | --------- | --------------- | ------------ | ------- | --------------- |
| **`defi`**       | zk (SNARK)               | dedicated | native          | EIP-1559     | EVM     | Alım satım, borç verme ve AMM tarzı uygulamalar |
| **`gaming`**     | based                    | based     | native          | flat         | custom  | Yüksek verimli, düşük gecikmeli oyun durumu ve oyun içi ekonomiler |
| **`nft`**        | optimistic (fraud)       | dedicated | native (Celestia DA planlandı) | standard | CosmWasm | NFT basımı, pazar yerleri ve dijital koleksiyon ürünleri |
| **`enterprise`** | based                    | based     | native          | subsidized   | EVM     | Sponsorlu ücretlerle izinli ve konsorsiyum dağıtımları |
| **`custom`**     | tamamen parametreli      | tamamen parametreli | tamamen parametreli | tamamen parametreli | tamamen parametreli | Her alan kullanıcı tarafından tanımlanır |

`custom` profili her alanı sizin ayarlamanız için bırakır. Her hazır profile dahil edilen tam değerler, RDK olgunlaştıkça değişebilir; yetkili profil başına parametreler için canlı yapılandırmayı `qorechaind query rdk config` ile (veya `@qorechain/rdk` paketinden `RdkClient.params()` ile) sorgulayın ve `based` uzlaşmanın daima `based` sıralayıcı moduyla eşleştiğini unutmayın.

---

## Sıralayıcı Modları

Sıralayıcı, bir rollup bloğu içindeki işlemleri kimin sıralayacağını belirler.

### Dedicated Sıralayıcı

Tek bir operatör tüm rollup işlemlerini sıralar.

* **Operatör**: Tek belirlenmiş adres
* **Gecikme**: Mümkün olan en düşük — tek taraflı sıralama
* **Güven**: Canlılık ve adil sıralama için sıralayıcı operatörüne güven gerektirir

### Shared Sıralayıcı

Bir sıralayıcı kümesi işlemleri toplu olarak sıralar.

* **Minimum küme boyutu**: Yapılandırılabilir (varsayılan: 1)
* **Gecikme**: Çok taraflı koordinasyon nedeniyle biraz daha yüksek
* **Güven**: Sıralayıcı kümesine dağıtılmış

### Based Sıralayıcı

QoreChain L1 önericileri rollup işlemlerini sıralar.

* **Dahil etme gecikmesi**: Zorunlu dahil etmeden önceki yapılandırılabilir blok sayısı (varsayılan: 10)
* **Öncelik ücreti payı**: L1 önericilerine ödenen öncelik ücretlerinin yapılandırılabilir yüzdesi
* **Güven**: QoreChain'in doğrulayıcı kümesi güvenliğini ve sansüre direncini devralır
* **Gereksinim**: Based uzlaşma modu, based sıralayıcısını gerektirir (doğrulama sırasında zorunlu kılınır)

---

## Veri Erişilebilirliği Arka Uçları

### Native DA

QoreChain'in kendi içinde zincir üstü KV-deposu blob depolaması.

| Parametre            | Değer                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Maksimum blob boyutu** | 2 MB (2.097.152 bayt)                                                                            |
| **Saklama süresi**   | 432.000 blok (6 saniyelik bloklarda \~30 gün)                                                       |
| **Otomatik budama**  | Süresi dolan blob'lar `EndBlocker` içinde budanır — veriler kaldırılır ancak taahhüt meta verileri korunur |
| **Taahhüt**          | Blob verisinin SHA-256 karması                                                                       |

### Celestia DA

Celestia'nın özel DA katmanını kullanan IBC tabanlı veri erişilebilirliği.

* **Durum**: Mevcut sürümde taslak (stub) halinde — tek arka uç olarak seçilirse hata döndürür
* **Ad alanı (namespace) desteği**: Rollup'a özel ad alanları blob şemasında desteklenir
* **Planlanan**: Celestia'nın blob gönderimi ve doğrulamasıyla tam IBC entegrasyonu

### Both (Yedekli)

Blob'ları aynı anda hem Native hem de Celestia arka uçlarında depolar.

* Mevcut sürümde yalnızca native blob gerçekten depolanır; Celestia bileşeni için bir uyarı kaydedilir.

---

## Rollup Yaşam Döngüsü

```
Pending → Active → Paused → Active → Stopped
                      ↑                  |
                      └──────────────────┘
                      (can resume from paused,
                       stopped is permanent)
```

| Durum       | Açıklama                                                     |
| ----------- | ------------------------------------------------------------ |
| **Pending** | Rollup kaydedildi ancak henüz etkinleştirilmedi             |
| **Active**  | Rollup canlı ve partileri işliyor                            |
| **Paused**  | Oluşturucu tarafından geçici olarak durduruldu (devam edebilir) |
| **Stopped** | Kalıcı olarak hizmet dışı bırakıldı — teminat (stake) oluşturucuya iade edildi |

Oluşturma sırasında, teminat emanetinin (escrow) ve katman kaydının başarılı olmasının hemen ardından rollup durumu `Active` olarak ayarlanır.

---

## Parti Yaşam Döngüsü

Uzlaşma partileri, rollup durum köklerinin durum ilerlemesini takip eder:

```
Submitted → Finalized                              (happy path)
Submitted → Challenged → Rejected                  (fraud detected)
```

| Durum          | Açıklama                                           |
| -------------- | ------------------------------------------------- |
| **Submitted**  | Parti QoreChain'e gönderildi, kesinleştirme bekliyor |
| **Challenged** | Dolandırıcılık kanıtı itirazı gönderildi (yalnızca optimistic) |
| **Finalized**  | Parti kanonik olarak kabul edildi                 |
| **Rejected**   | Parti, başarılı bir itiraz ile geçersiz kılındı   |

### Otomatik Kesinleştirme Kuralları

| Uzlaşma Modu    | Kesinleştirme Tetikleyicisi                                  |
| --------------- | ----------------------------------------------------------- |
| **Optimistic**  | İtiraz penceresi geçerli bir itiraz olmadan sona erer (\~7 gün) |
| **ZK**          | Geçerli kanıt gönderiminde anında                           |
| **Based**       | Gönderimden 2 L1 bloğu sonra                                 |
| **Sovereign**   | Yok — rollup'ın kendi uzlaşması tarafından yönetilir        |

Otomatik kesinleştirme, optimistic ve based rollup'lar için `EndBlocker` içinde yürütülür. ZK partileri, parti gönderimi sırasında satır içi olarak kesinleştirilir.

---

## Modül Parametreleri

| Parametre                   |                        Varsayılan | Açıklama                                      |
| --------------------------- | -------------------------------: | ------------------------------------------------ |
| `max_rollups`               |                              100 | Kaydedilebilecek maksimum rollup sayısı          |
| `min_stake_for_rollup`      | 10.000.000.000 uqor (10.000 QOR) | Bir rollup oluşturmak için gereken minimum teminat |
| `rollup_creation_burn_rate` |                        0.01 (%1) | `x/burn` aracılığıyla yakılan oluşturma teminatının oranı |
| `default_challenge_window`  |          604.800 saniye (7 gün)  | Varsayılan optimistic itiraz penceresi           |
| `max_da_blob_size`          |          2.097.152 bayt (2 MB)   | Maksimum veri erişilebilirliği blob boyutu       |
| `blob_retention_blocks`     |              432.000 (\~30 gün)  | DA blob'larının budanmasından önceki blok sayısı |
| `max_batches_per_block`     |                               10 | Blok başına işlenen maksimum uzlaşma partisi     |

---

## Çok Katmanlı Entegrasyon

RDK modülü, katmanlar arası durum yönetimi için `x/multilayer` ile entegre olur:

### Katman Kaydı

Bir rollup oluşturulduğunda, `RegisterSidechain` aracılığıyla otomatik olarak bir yan zincir (sidechain) katmanı olarak kaydedilir. Kayıt şunları içerir:

* Katman kimliği (rollup kimliğiyle eşleşir)
* Hedef blok süresi ve blok başına maksimum işlem sayısı
* Desteklenen VM türleri ve alanlar (domain)
* Uzlaşma aralığı

Kayıt **ölümcül değildir**: `x/multilayer` kaydı başarısız olursa, rollup yine de oluşturulur ve bir uyarı kaydedilir.

### Durum Demirleme

RDK'ye gönderilen her uzlaşma partisi, `AnchorState` aracılığıyla `x/multilayer`'a demirlenir. Bu şunları kaydeder:

* Katman kimliği ve katman yüksekliği (parti indeksi)
* Durum kökü
* İşlem sayısı

Demirleme **ölümcül değildir**: başarısızlıklar kaydedilir ancak parti işlemeyi engellemez.

---

## Yakma Entegrasyonu

Rollup oluşturma sırasında, **teminat tutarının %1'i** `rollup_create` yakma kanalı aracılığıyla `x/burn` modülü ile yakılır. Örneğin, minimum 10.000 QOR teminat ile bir rollup oluşturmak 100 QOR'u kalıcı olarak yakar. Kalan 9.900 QOR emanette tutulur ve rollup durdurulduğunda iade edilir.
