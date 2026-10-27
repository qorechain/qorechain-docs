---
slug: /architecture/rollup-development-kit
title: Rollup Geliştirme Kiti
sidebar_label: Rollup Geliştirme Kiti
sidebar_position: 12
---

# Rollup Geliştirme Kiti

`x/rdk` modülü, geliştiricilerin QoreChain üzerinde uygulamaya özel rollup'lar dağıtmasına olanak tanıyan kapsamlı bir Rollup Geliştirme Kiti (RDK) sağlar. Dört uzlaşma (settlement) paradigmasını, birden fazla sıralayıcı (sequencer) modunu, takılabilir veri erişilebilirliği (data availability) arka uçlarını ve yapay zeka destekli yapılandırma optimizasyonunu destekler.

:::caution Erken aşama yetenek
Modül mainnet üzerinde (zincir sürümü 23 Ekim 2026'dan beri **v3.2.4**) ve testnet üzerinde (27 Ekim 2026'dan beri **v3.2.6**) dağıtılmıştır, ancak **her iki ağda da henüz hiçbir rollup oluşturulmamıştır** (27 Ekim 2026'da kontrol edildi: `GET /qorechain/rdk/v1/rollups` her ikisinde de boş bir liste döndürür). Aşağıda açıklanan çeşitli yetenekler bugün uçtan uca kullanılabilir değildir; durum, her biri anlatıldığı yerde belirtilmiştir. Geliştiricilere yönelik nasıl yapılır kılavuzu için [Rollup'lara Genel Bakış](/rollups/overview) bölümüne bakın.
:::

---

## Uzlaşma Paradigmaları

QoreChain RDK, her biri farklı güven varsayımlarına, kesinlik (finality) özelliklerine ve kanıt gereksinimlerine sahip dört farklı uzlaşma modunu destekler: **optimistic**, **zk**, **based** ve **sovereign**.

### Optimistic Uzlaşma {#optimistic-settlement}

Optimistic rollup'lar işlemlerin varsayılan olarak geçerli olduğunu kabul eder ve anlaşmazlık çözümü için dolandırıcılık kanıtlarına (fraud proofs) dayanır.

* **Kanıt sistemi**: Etkileşimli dolandırıcılık kanıtları
* **İtiraz penceresi**: 604,800 saniye (varsayılan, 7 gün). **v3.2.4'ten önce:** zincir bunu blok başına sabit 6 saniyeden bloklara dönüştürür, yani **100,800 blok**; gerçek geçen süre fiili blok süresine bağlıdır (mainnet'in mevcut ≈3.2 sn'lik bloklarında yaklaşık 3.7 gün), bu nedenle günlere göre değil bloklara göre planlama yapın. **v3.2.4'ten itibaren:** yükseltme yüksekliğinden itibaren gönderilen bir parti için pencere, blok süresinin saniyeleriyle ölçülür (tam 7 gün). Daha önce gönderilen bir parti blok sayısı kuralını korur. Testnet v3.2.4'ü 8,337,253 yüksekliğinde (19 Ekim 2026) uyguladı; mainnet bunu 3,742,566 yüksekliğinde (23 Ekim 2026, yönetişim önerisi 13) uyguladı. Testnet'in yapılandırılmış varsayılanı daha kısadır, 3,600 saniye (1 saat); dolayısıyla bir testnet rollup'ı burada anlatılan 7 günden daha hızlı kesinleşir.
* **İtiraz teminatı**: 1,000 QOR (1,000,000,000 uqor) — bir dolandırıcılık kanıtı itirazı göndermek için gereklidir (`nft` ve `custom` hazır profilleri; `defi`, `gaming` ve `enterprise` hazır profillerinde itiraz penceresi olmadığı için teminat belirlenmez)
* **Kesinlik**: Geçerli bir itiraz olmadan itiraz penceresi sona erene kadar ertelenir
* **Otomatik kesinleştirme**: `EndBlocker`, itiraz penceresi anlaşmazlık olmadan geçtiğinde partileri (batch) otomatik olarak kesinleştirir. İtiraz edilen bir parti asla otomatik olarak kesinleştirilmez: rollup oluşturucusu önce itirazı çözer ([Rollup Dağıtma](/rollups/deploying-a-rollup#challenge-a-batch-optimistic-rollups) bölümüne bakın).

**Parti yaşam döngüsü**:

```
Submitted → [challenge window expires] → Finalized
Submitted → [fraud proof submitted] → Challenged → Rejected
```

### ZK (Sıfır Bilgi) Uzlaşma {#zk-zero-knowledge-settlement}

ZK rollup'lar, durum geçişinin doğruluğunu garanti eden kriptografik geçerlilik kanıtları sağlar.

* **Kanıt sistemi**: SNARK (BLS12-381 üzerinde Groth16) veya STARK (şeffaf, güvenilir kurulum gerektirmez)
* **Kesinlik**: Kanıt doğrulamasında anında — itiraz penceresi gerekmez
* **Maksimum kanıt boyutu**: 1 MB (1,048,576 bayt)
* **Özyineleme derinliği**: Yapılandırılabilir kanıt toplama derinliği (varsayılan: 1)
* **Olgunluk**: SNARK partileri, rollup ile birlikte saklanan bir doğrulama anahtarına karşı zincir üstünde doğrulanır (BLS12-381 üzerinde Groth16). `create-rollup` ile oluşturulan bir rollup şu anda doğrulama anahtarı taşımaz, bu nedenle ZK partileri henüz uçtan uca kesinleştirilemez. STARK doğrulaması deneyseldir: isteğe bağlıdır (opt-in) ve rollup'ınızın kendi durum geçişini değil, bir gösterim devresini kontrol eder. ZK uzlaşmayı üretime hazır değil olarak değerlendirin.

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

STARK doğrulaması deneyseldir ve ZK uzlaşma üretime hazır değildir; yukarıdaki [ZK Uzlaşma](#zk-zero-knowledge-settlement) olgunluk notuna bakın.

---

## Hazır Profiller

RDK, yaygın kullanım durumları için optimize edilmiş, anahtar teslim rollup yapılandırmaları sağlayan **beş hazır profil** ile gelir. Her hazır profil; bir uzlaşma paradigmasını, sıralayıcı modunu, veri erişilebilirliği arka ucunu, gaz modelini ve hedef alanına göre ayarlanmış bir VM'i bir araya getirir:

| Profil           | Uzlaşma (kanıt)          | Sıralayıcı | DA              | Gaz modeli   | VM      | Hedef kullanım durumu |
| ---------------- | ------------------------ | --------- | --------------- | ------------ | ------- | --------------- |
| **`defi`**       | zk (SNARK)               | dedicated | native          | EIP-1559     | EVM     | Alım satım, borç verme ve AMM tarzı uygulamalar |
| **`gaming`**     | based                    | based     | native          | flat         | custom  | Yüksek verimli, düşük gecikmeli oyun durumu ve oyun içi ekonomiler |
| **`nft`**        | optimistic (fraud)       | dedicated | native (Celestia DA planlandı) | standard | QoreChain Native | NFT basımı, pazar yerleri ve dijital koleksiyon ürünleri |
| **`enterprise`** | based                    | based     | native          | subsidized   | EVM     | Sponsorlu ücretlerle izinli ve konsorsiyum dağıtımları |
| **`custom`**     | tamamen parametreli      | tamamen parametreli | tamamen parametreli | tamamen parametreli | tamamen parametreli | Her alan kullanıcı tarafından tanımlanır |

`custom` profili her alanı sizin ayarlamanız için bırakır. Her hazır profile dahil edilen tam değerler, RDK olgunlaştıkça değişebilir; yetkili profil başına parametreler için canlı yapılandırmayı `qorechaind query rdk config` ile (veya `@qorechain/rdk` paketinden `RdkClient.params()` ile) sorgulayın ve `based` uzlaşmanın daima `based` sıralayıcı moduyla eşleştiğini unutmayın.

---

## Sıralayıcı Modları

Sıralayıcı, bir rollup bloğu içindeki işlemleri kimin sıralayacağını belirler.

:::note Bugün neler zorunlu kılınıyor
Zincir üstünde bir parti yalnızca rollup'ın yapılandırılmış sıralayıcı adresi tarafından veya hiçbiri ayarlanmamışsa (tüm hazır profillerde durum budur) oluşturucusu tarafından gönderilebilir. `shared` ve `based` modları rollup yapılandırmasına kaydedilir, ancak QoreChain henüz paylaşımlı bir sıralayıcı listesini veya L1 önericilerini parti göndericisi olarak kabul etmez; bu modlar amaçlanan tasarımı anlatır.
:::

### Dedicated Sıralayıcı

Tek bir operatör tüm rollup işlemlerini sıralar.

* **Operatör**: Tek belirlenmiş adres
* **Gecikme**: Mümkün olan en düşük — tek taraflı sıralama
* **Güven**: Canlılık ve adil sıralama için sıralayıcı operatörüne güven gerektirir

### Shared Sıralayıcı

Bir sıralayıcı kümesi işlemleri toplu olarak sıralar.

* **Durum**: bugün yalnızca bir etiket — liste henüz zincir üstünde kabul edilmiyor (yukarıdaki nota bakın)
* **Minimum küme boyutu**: Yapılandırılabilir (varsayılan: 1)
* **Gecikme**: Çok taraflı koordinasyon nedeniyle biraz daha yüksek
* **Güven**: Sıralayıcı kümesine dağıtılmış

### Based Sıralayıcı

QoreChain L1 önericileri rollup işlemlerini sıralar.

* **Durum**: bugün yalnızca bir etiket — L1 önericileri henüz parti göndericisi olarak kabul edilmiyor (yukarıdaki nota bakın)
* **Dahil etme gecikmesi**: Zorunlu dahil etmeden önceki yapılandırılabilir blok sayısı (varsayılan: 10)
* **Öncelik ücreti payı**: L1 önericilerine ödenen öncelik ücretlerinin yapılandırılabilir yüzdesi
* **Güven**: QoreChain'in doğrulayıcı kümesi güvenliğini ve sansüre direncini devralır
* **Gereksinim**: Based uzlaşma modu, based sıralayıcısını gerektirir (doğrulama sırasında zorunlu kılınır)

---

## Veri Erişilebilirliği Arka Uçları

### Native DA

QoreChain'in kendi içinde zincir üstü KV-deposu blob depolaması.

:::caution Henüz blob göndermenin genel bir yolu yok
Modül blob depolamayı, saklamayı ve budamayı tanımlar, ancak mevcut sürümlerde bir blob göndermek için işlem mesajı yoktur. `native` veya `both` rollup üzerinde bir veri karması belirten bir parti, eşleşen hiçbir blob saklanamayacağı için reddedilir. Bkz. [Veri Erişilebilirliği](/rollups/data-availability). Bu nedenle yerel veri erişilebilirliğinde bir parti `data_hash` alanını boş bırakmalıdır; RDK istemcisi (0.6.1) bunu yapar ve zincir bir tane iddia eden partiyi reddeder.
:::

| Parametre            | Değer                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Maksimum blob boyutu** | 2 MB (2,097,152 bayt)                                                                            |
| **Saklama süresi**   | 432,000 blok (mainnet'in mevcut ≈3.2 sn'lik bloklarında yaklaşık 16 gün; rakam blok süresiyle birlikte değişir) |
| **Otomatik budama**  | Süresi dolan blob'lar `EndBlocker` içinde budanır — veriler kaldırılır ancak taahhüt meta verileri korunur |
| **Taahhüt**          | Blob verisinin SHAKE-256 (32 baytlık) karması                                                        |

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
| **Stopped** | Kalıcı olarak hizmet dışı bırakıldı — oluşturucunun emanetinde (escrow) kalan tutar iade edilir (bkz. [Emanet defteri](#escrow-ledger)) |

Oluşturma sırasında, teminat emanetinin (escrow) ve oluşturma yakımının başarılı olmasının hemen ardından rollup durumu `Active` olarak ayarlanır (katman kaydı denenir ancak ölümcül değildir). Bir rollup'ı yalnızca oluşturucu duraklatabilir, devam ettirebilir veya durdurabilir (zincir sürümü v3.2.0'dan beri zorunlu kılınır).

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

RDK 0.6.1 davranışı: optimistic bir rollup için istemci, durum kökü zincirin kanonik geçiş kökü (RDK'de `batchTransitionRoot`) olan bir parti oluşturur; kendi belirlediğiniz serbest biçimli bir değer değildir.

### Otomatik Kesinleştirme Kuralları

| Uzlaşma Modu    | Kesinleştirme Tetikleyicisi                                  |
| --------------- | ----------------------------------------------------------- |
| **Optimistic**  | Gönderimden 100,800 blok sonra (varsayılan pencere) itiraz olmadan; v3.2.4'ten beri gönderilen partiler için (testnet'te 8,337,253 yüksekliğinden, mainnet'te 3,742,566 yüksekliğinden, 23 Ekim 2026'dan itibaren) blok süresinin 604,800 saniyesi |
| **ZK**          | Geçerli kanıt gönderiminde anında                           |
| **Based**       | Gönderimden 2 L1 bloğu sonra                                 |
| **Sovereign**   | Yok — rollup'ın kendi uzlaşması tarafından yönetilir        |

Otomatik kesinleştirme, optimistic ve based rollup'lar için `EndBlocker` içinde yürütülür. ZK partileri, parti gönderimi sırasında satır içi olarak kesinleştirilir.

---

## Modül Parametreleri

| Parametre                   |                        Varsayılan | Açıklama                                      |
| --------------------------- | -------------------------------: | ------------------------------------------------ |
| `max_rollups`               |                              100 (testnet: 200) | Kaydedilebilecek maksimum rollup sayısı          |
| `min_stake_for_rollup`      | 10,000,000,000 uqor (10,000 QOR) | Bir rollup oluşturmak için gereken minimum teminat |
| `rollup_creation_burn_rate` |                        0.01 (%1) | `x/burn` aracılığıyla yakılan oluşturma teminatının oranı |
| `default_challenge_window`  | 604,800 sn (testnet: 3,600 sn) | Varsayılan optimistic itiraz penceresi; v3.2.4'ten önce zincir bunu 100,800 bloğa dönüştürüyordu |
| `max_da_blob_size`          |          2,097,152 bayt (2 MB)   | Maksimum veri erişilebilirliği blob boyutu       |
| `blob_retention_blocks`     |                   432,000 blok   | DA blob'larının budanmasından önceki blok sayısı |
| `max_batches_per_block`     |                               10 | Blok başına işlenen maksimum uzlaşma partisi     |

---

## Çok Katmanlı Entegrasyon

RDK modülü, katmanlar arası durum yönetimi için `x/multilayer` ile entegre olur:

### Katman Kaydı {#layer-registration}

Bir rollup oluşturulduğunda, modül onun için `RegisterSidechain` aracılığıyla bir katman kaydeder; dolayısıyla zincir üstünde katman türü **`sidechain`**'dir, `proposed` durumunda başlar, multilayer yan zincir sınırına (`max_sidechains`, varsayılan **10**) dahil edilir ve oluşturucunun `min_sidechain_stake` tutarını (1,000 QOR) kilitler. Kayıt şunları içerir:

* Katman kimliği (rollup kimliğiyle eşleşir)
* Hedef blok süresi ve blok başına maksimum işlem sayısı
* Desteklenen VM türleri ve alanlar (domain)
* Uzlaşma aralığı

Kayıt **ölümcül değildir**: başarısız olursa (yetersiz bakiye veya sınıra ulaşılması) rollup yine de oluşturulur, ancak katmanı olmaz ve demirlenemez. Bir uzlaşma demiri, katmanın `active` olmasını gerektirmez: bir RDK rollup'ının kaydettiği katman `proposed` durumunda kalır ve yine de oluşturucusu tarafından demirlenebilir ([Bağlantı Gönderimi](/architecture/multilayer-architecture#anchor-submission) bölümüne bakın).

### Durum Demirleme {#state-anchoring}

Bir uzlaşma partisi `x/multilayer`'a demirlenebilir; bu, rollup oluşturucusunun kuantum sonrası imzası altında katman kimliğini, katman yüksekliğini (parti indeksi), durum kökünü, doğrulayıcı kümesi karmasını ve işlem sayısını kaydeder.

* **v3.2.2'den beri (mainnet ve testnet'te canlı):** `MsgSubmitBatch` iki isteğe bağlı alana sahiptir. `anchor_signature`, oluşturucunun partinin **v2 demir imza baytları** üzerindeki ML-DSA-87 imzasıdır ([Bağlantıları Okuma](/architecture/multilayer-architecture#reading-anchors) bölümüne bakın); mevcut olduğunda parti `x/multilayer` içinde **aynı işlemde** demirlenir ve reddedilen bir demir partiyi de reddeder. `validator_set_hash`, demirde taşınan ve imzayla kapsanan rollup'ın doğrulayıcı kümesi taahhüdüdür. CLI'da: `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>` imzalanacak baytları yazdırır (`<layer-id>`, rollup'ın katman kimliğidir; RDK ile oluşturulan rollup'larda rollup kimliğine eşittir) ve `tx rdk submit-batch ... --anchor-signature <hex> --validator-set-hash <hex>` bunları gönderir.
* **İmza olmadan** parti, eskisi gibi demirlenmeden uzlaştırılır. Alanı göndermeyen bir istemci demirlenmemiş partiler üretir, bu nedenle kullandığınız araç setinin bunu desteklediğini kontrol edin: TypeScript `@qorechain/rdk` 0.6.0, istemcisi hibrit imzaladığında ve rollup'ın oluşturucusu olduğunda demiri imzalar (aksi halde demirlenmeden gönderir); Python, Go, Rust ve Java istemcileri ise alanı oluşturmaz. Her iki ağda da henüz hiçbir rollup, katman veya demir yoktur, dolayısıyla hiçbir demir yazılmamıştır ve bu yol canlıda test edilmemiştir.

Bir demirin neyi kanıtlayıp neyi kanıtlamadığı için [Uzlaşma Makbuzları](/rollups/settlement-receipts) bölümüne bakın.

---

## Emanet defteri ve çekimler {#escrow-ledger}

Tüm rollup'ların emaneti tek bir havuzlanmış modül bakiyesinde durur. **v3.2.3**'ten itibaren (mainnet yüksekliği 3,662,051, 20 Ekim 2026) rollup başına bir **emanet defteri**, her rollup'ın bu havuzda ne tuttuğunun tek kaydıdır:

* `create-rollup`, deftere rollup'ın gerçekten elinde tuttuğu emaneti yazar: teminat eksi %1 oluşturma yakımı.
* Bir çekim (`tx rdk execute-withdrawal`) ve bir dolandırıcılık kanıtı ödülü defterden ödenir ve defterden düşülür. Rollup'ın hâlâ tuttuğundan büyük bir çekim, yetersiz emanet hatasıyla reddedilir.
* `stop-rollup` yalnızca defterde kalanı iade eder ve defteri sıfırlar. Durdurulmuş bir rollup başka çekim ödemez.
* Rollup sorgularının döndürdüğü salt okunur `RollupView`, `escrow_balance` alanını taşır: o rollup için hâlâ tutulan uqor.

v3.2.3'ten önce deftere sıfır yazılıyordu, bu yüzden her çekim güvenli biçimde başarısız oluyordu (fail closed); dolayısıyla `execute-withdrawal` mainnet'te yalnızca v3.2.3'ten itibaren başarılı olabilir. Bir istemcinin ücret ödemeden önce çalıştırması gereken kontroller: denom tam olarak `uqor` olmalı, tutar pozitif olmalı, Merkle kanıtı en fazla 64 seviyeye sahip olmalı ve her kardeş düğüm tam olarak 32 bayt olmalı, ayrıca gönderen ve alıcı geçerli `qor1…` adresleri olmalıdır. Bir çekim ayrıca bir `withdrawals_root` taahhüt etmiş kesinleşmiş bir parti gerektirir ve her çekim yaprağı yalnızca bir kez ödenebilir.

## RDK durumunu okuma {#reading-state}

RDK sorguları mainnet ve testnet'te REST üzerinden `/qorechain/rdk/v1/` altında sunulur:

| Rota | Döndürür |
| --- | --- |
| `/params` | Modül parametreleri (yukarıdaki tablo) |
| `/rollups` ve `/rollup/{rollup_id}` | `escrow_balance` dahil rollup kayıtları |
| `/batches/{rollup_id}` | Sayfalanmış partiler (`start_index`, `limit` varsayılan 50, en fazla 100, `next_index`) |
| `/batch/{rollup_id}/{batch_index}` ve `/latest_batch/{rollup_id}` | Tek bir parti veya en yenisi |
| `/blob/{rollup_id}/{blob_index}` | `expires_at_height` dahil blob meta verileri (blob baytları döndürülmez) |

`qorechaind query rdk config` modül parametrelerini yazdırır (rota `/params`'tır; `/config` rotası yoktur). Rollup ve katman kimlikleri, v3.2.2'den beri zorunlu kılınan [Katman ve rollup kimlikleri](/architecture/multilayer-architecture#id-grammar) bölümündeki kimlik dilbilgisiyle eşleşmelidir.

---

## Yakma Entegrasyonu

Rollup oluşturma sırasında, **teminat tutarının %1'i** `rollup_create` yakma kanalı aracılığıyla `x/burn` modülü ile yakılır. Örneğin, minimum 10,000 QOR teminat ile bir rollup oluşturmak 100 QOR'u kalıcı olarak yakar. Kalan 9,900 QOR emanette tutulur ve rollup durdurulduğunda, geriye kalanı oluşturucuya iade edilir (emanetten ödenen çekimler ve dolandırıcılık kanıtı ödülleri iadeyi azaltır). Oluşturma yakımı zincir sürümü v3.2.0'dan beri zorunlu kılınır; önceki sürümler bunu uygulamıyordu.
