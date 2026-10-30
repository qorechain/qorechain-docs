---
slug: /architecture/ai-engine
title: Yapay Zeka Motoru
sidebar_label: Yapay Zeka Motoru
sidebar_position: 4
---

# Yapay Zeka Motoru

QoreChain, `x/ai` modülü aracılığıyla protokol yığınının birden çok seviyesinde yapay zeka yeteneklerini entegre eder. Zincir üstü katman, konsensüs açısından kritik işlemler için uygun olan deterministik sezgisel tabanlı analiz sağlarken, zincir dışı bir yan bileşen (sidecar) yetenekleri danışmanlık ve geliştirici araçları için derin öğrenme modelleriyle genişletir.

## Üç Katmanlı Mimari

QCAI (QoreChain AI) motoru üç katmanda çalışır:

| Katman                | Kapsam                                                  | Yürütme                  | Deterministik |
| --------------------- | ------------------------------------------------------ | ------------------------ | ------------- |
| **Konsensüs Seviyesi**   | Blok üretimi, parametre ayarı                     | Zincir üstü (x/rlconsensus) — bugün yalnızca gözlem | Evet           |
| **Ağ Seviyesi**     | İşlem yönlendirme, dolandırıcılık tespiti, ücret optimizasyonu | Zincir üstü (x/ai)          | Evet           |
| **Uygulama Seviyesi** | Sözleşme üretimi, denetim, derin analiz            | Zincir dışı (sidecar)      | Hayır            |

Konsensüs seviyesi ayrı olarak [PRISM Konsensüs Motoru](/architecture/prism-consensus-engine) sayfasında belgelenmiştir. Bu sayfa ağ ve uygulama seviyelerini kapsar.

:::note Canlı ağlarda neler uygulanıyor (23 Ekim 2026'da kontrol edildi, ana ağ ve test ağı o zaman ikisi de v3.2.4'teydi; test ağı o tarihten sonra v3.2.6'ya, ana ağ ise v3.2.5'e geçti)
`x/ai` modülünün iki parçası bugün işlemler üzerinde etkilidir; hem Cosmos hattında hem de EVM hattında:

* **Gönderen başına hız sınırı**. Canlı sınır **gönderen başına dakikada 600 işlemdir** (`max_tx_per_minute`; EVM hattının kendi isteğe bağlı sınırı vardır, ancak ayarlanmamıştır, bu yüzden aynı değer geçerlidir). "Dakika", duvar saati süresiyle değil, sabit bir blok penceresi üzerinden sayılır, çünkü blok yüksekliği her doğrulayıcının paylaştığı tek saattir. Sınıra ulaşan bir gönderenin daha eski işlemleri pencereden çıkana kadar sonraki işlemleri reddedilir. Sınır, Cosmos hattında v3.2.0'dan beri, her iki hatta ise v3.2.2'den beri uygulanmaktadır.
* Her işlem için bir **anomali skoru**. Canlı `anomaly_action` değeri `flag`'tir: yüksek bir skor bir `ai_anomaly_check` olayı yayar ve işlemi işaretlenmiş olarak sayar, ancak reddetmez. Skora göre reddetme, etkinleştirilmemiş bir yönetişim ayarıdır.

Bu sayfadaki diğer her şey (yönlendirici, altı katmanlı dolandırıcılık hattı, ücret optimize edici, ağ optimize edici, sidecar) analiz ve tavsiyeyi tanımlar: hiçbiri zincirin hangi işlemleri kabul ettiğini değiştirmez ve altı katmanlı hat işlem yolundan çağrılmaz. Canlı ayarları `qorechaind query ai config` ile, sayaçları ise `qorechaind query ai stats` ile okuyun.
:::

## İşlem Yönlendiricisi

Yapay zeka destekli yönlendirici, ağırlıklı çok faktörlü puanlama kullanarak her işlem için en uygun doğrulayıcıları ve yolları seçer.

### Optimizasyon Formülü

```
OptimalRoute = argmin_r( alpha * Latency(r) + beta * Cost(r) + gamma * Security(r)^-1 )
```

| Ağırlık   | Sembol | Varsayılan | Açıklama                                                                      |
| -------- | ------ | ------- | -------------------------------------------------------------------------------- |
| Gecikme  | alpha  | 0.4     | Normalleştirilmiş yanıt süresi (0=en iyi, 1=en kötü). 0ms 0.0'a, 1000ms 1.0'a eşlenir. |
| Maliyet     | beta   | 0.3     | Maliyet vekili olarak mevcut yük yüzdesi.                                     |
| Güvenlik | gamma  | 0.3     | İtibar puanının tersi. Daha yüksek itibar daha düşük (daha iyi) bir puan verir.    |

Yönlendirici, ortalama gecikme, çalışma süresi yüzdesi, yük yüzdesi ve itibar puanı dahil olmak üzere doğrulayıcı başına performans verileriyle bir **metrik önbelleği** (varsayılan TTL: 30 saniye) tutar. Önbelleğe alınmış metrikler kullanılamadığında, sistem sezgisel yönlendiriciye geri döner.

### Yönlendirme Güveni

Güven, kullanılabilir metriklere sahip doğrulayıcı sayısıyla ölçeklenir:

| Metrikli Doğrulayıcılar | Güven |
| ----------------------- | ---------- |
| >= 10                   | 0.95       |
| >= 5                    | 0.85       |
| >= 2                    | 0.75       |
| 1                       | 0.60       |

## Dolandırıcılık Tespiti

Dolandırıcılık tespit edici, istatistiksel yöntemler kullanarak her işlemi yakın geçmişe karşı analiz eden **altı katmanlı bir tespit hattı** uygular.

### Tespit Katmanları

| Katman | Tespit Edici                | Yöntem                                                                | Tetikleme Eşiği                                          |
| ----- | ----------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1     | **Isolation Forest**    | Tutar, gas ve gönderen sıklığı özellikleri genelinde istatistiksel Z-skoru | Anomali skoru > 0.7                                        |
| 2     | **Sıra Çözümleyici**   | Dönüşümlü gönder/al desenlerini tespit eder (wash trading)              | Aynı çift arasında > 3 dönüşümlü transfer                |
| 3     | **Sybil Tespit Edici**      | Yeni benzersiz adresleri izler; yeni gönderenlerdeki ani artışları işaretler              | Son işlemlerin > %30'u yeni adreslerden            |
| 4     | **DDoS Tespit Edici**       | Gönderen başına işlem sıklığını izler                             | Tek bir göndericiden dakikada > 100 işlem         |
| 5     | **Flash Loan Tespit Edici** | Tek bir blok içinde borç al-manipüle et-geri öde desenlerini belirler     | Aynı blokta > 10x tutar varyansıyla >= 3 işlem |
| 6     | **Exploit Tespit Edici**    | Sözleşme çağrılarında anormal gas tüketimini işaretler                             | Aynı işlem türü için ortalama gas'ın > 5 katı         |

### Tehdit Sınıflandırması

| Güven Aralığı | Tehdit Seviyesi |
| ---------------- | ------------ |
| >= 0.9           | Kritik     |
| >= 0.7           | Yüksek         |
| >= 0.5           | Orta       |
| >= 0.3           | Düşük          |
| &lt; 0.3         | Yok         |

### Yanıt Eylemleri

| Tehdit Seviyesi | Güven | Eylem                                                       |
| ------------ | ---------- | ------------------------------------------------------------ |
| Kritik     | > 0.8      | `circuit_break` — Belirli sözleşme yürütmelerini duraklatır         |
| Kritik     | &lt;= 0.8  | `rate_limit` — Kaynaktan TX kabulünü geçici olarak azaltır  |
| Yüksek         | > 0.7      | `rate_limit`                                                 |
| Yüksek         | &lt;= 0.7  | `alert` — Doğrulayıcılar ve operatörler için olay yayar            |
| Orta       | Herhangi        | `alert`                                                      |
| Düşük / Yok   | Herhangi        | `allow`                                                      |

`allow` dışında bir eylem tetiklendiğinde, hat benzersiz bir kimliğe sahip bir dolandırıcılık soruşturma kaydı oluşturur (biçim: `INV-{block_height}-{txhash}`, 48 karaktere kısaltılır). Canlı ağlarda hat işlem yolundan çağrılmaz (bu sayfanın başındaki nota bakın), bu nedenle bugün hiçbir soruşturma kaydı üretilmez ve hat tarafından hiçbir sözleşme devre kesicisi ayarlanmaz.

## Ücret Optimize Edici

Ücret optimize edici, üstel hareketli ortalama (EMA) tıkanıklık takibi kullanarak ağ tıkanıklığını tahmin eder ve istenen onay süreleri için en uygun ücretleri önerir.

### Tıkanıklık Tahmini

* **EMA yumuşatma faktörü (alpha)**: 0.2
* **Geçmiş penceresi**: 100 blok
* **Trend analizi**: Tıkanıklık trendlerini tespit etmek için en son 5 bloğu önceki 5 blokla karşılaştırır, ardından %50 sönümlemeyle ileriye projeksiyon yapar.

### Aciliyet Kademeleri

| Aciliyet  | Temel Çarpan | Tahmini Onay |
| -------- | --------------- | ---------------------- |
| `fast`   | 2.0x            | 1-2 blok             |
| `normal` | 1.0x            | 3-5 blok             |
| `slow`   | 0.5x            | 6-10 blok             |

Nihai ücret, bir **tıkanıklık çarpanı** (%0 tıkanıklıkta 1.0x, %100 tıkanıklıkta 5.0x'e kadar) ve tahmin edilen tıkanıklık mevcut tıkanıklığı aştığında bir **trend primi** içerir. Tahmin edicinin kendi minimum ücreti 500 uqor'luk eski bir sabittir; canlı ağlarda sunulmaz ve bir işlemin gerçekte ödemesi gereken ücret, gaz birimi başına 0.1 uqor olan ağ tabanıyla belirlenir (bkz. [İlk İşlem](/getting-started/first-transaction#send-qor)).

## Ağ Optimize Edici

Ağ optimize edici, performans metriklerini sürekli olarak izler ve çok amaçlı bir ödül fonksiyonu kullanarak yönetişim parametre önerileri üretir.

### Ödül Fonksiyonu

```
R(s, a, s') = alpha * DeltaPerformance + beta * DeltaLatency + gamma * DeltaEnergy - delta * StabilityPenalty
```

| Ağırlık | Değer | Hedef               |
| ------ | ----- | ----------------------- |
| alpha  | 0.35  | Performans iyileştirmesi |
| beta   | 0.30  | Gecikme azaltma       |
| gamma  | 0.15  | Enerji/kaynak tasarrufu |
| delta  | 0.20  | Kararlılık koruması  |

### Öneri Türleri

Optimize edici şunlar için öneriler üretir:

* **Blok gas limiti**: Kullanım > %80 olduğunda artırır, &lt; %20 olduğunda azaltır
* **Minimum komisyon oranı**: Doğrulayıcı sayısı 5'in altında olduğunda düşürür
* **Maksimum doğrulayıcılar**: Blok süreleri sağlıklı ve >= 10 doğrulayıcı aktif olduğunda artırır
* **Blok süresi hedefi**: Ortalama blok süresi 8 saniyeyi aştığında uyarı verir

Her öneri mevcut değeri, önerilen değeri, beklenen etkiyi, güven puanını ve gerekçeyi içerir.

## Yapay Zeka Yan Bileşeni (Sidecar)

QCAI Sidecar, zincir üstü yapay zekayı QCAI Backend tarafından desteklenen zincir dışı derin öğrenme modelleriyle genişletir. Yan bileşen isteğe bağlıdır ve konsensüs açısından kritik değildir, dahili bir gRPC arayüzü üzerinden erişilir.

### Yetenekler

| Yetenek              | Açıklama                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Sözleşme Üretimi** | 17 platform genelinde doğal dil belirtimlerinden akıllı sözleşmeler üretir  |
| **Sözleşme Denetimi**   | Akıllı sözleşme kodunun derin güvenlik analizi                                       |
| **Derin Dolandırıcılık Analizi** | Eğitilmiş modeller kullanarak genişletilmiş dolandırıcılık soruşturması (zincir üstü sezgileri tamamlar) |
| **Ağ Tavsiyesi**      | Gelişmiş parametre optimizasyon önerileri                                     |

### Modeller

| Model Adı    | Kullanım Durumu                                             |
| ------------- | ---------------------------------------------------- |
| QCAI Fast     | Ücret tahmini ve yönlendirme için düşük gecikmeli yanıtlar |
| QCAI Balanced | Denetim ve dolandırıcılık soruşturması için daha derin analiz |

Yan bileşen, derin öğrenme iş yüklerinin konsensüs açısından kritik yürütmeyi asla engellememesi veya etkilememesi için bağımsız bir zincir dışı hizmet olarak çalışır.

## EVM Önderlemeli Sözleşmeler (Precompiles)

İki önderlemeli sözleşme, zincir üstü yapay zeka yeteneklerini EVM akıllı sözleşmelerine sunar:

| Önderlemeli (Precompile)       | Adres  | Açıklama                                                           |
| ---------------- | -------- | --------------------------------------------------------------------- |
| `aiRiskScore`    | `0x0B01` | Belirli bir adres veya işlem hash'i için bir risk skoru (0-100) döndürür  |
| `aiAnomalyCheck` | `0x0B02` | Bir işlem için boolean bir anomali bayrağı ve güven skoru döndürür |

:::warning Henüz etkin değil
Bu iki önderlemeli sözleşme ana ağda (`qorechain-vladi`) veya test ağında (`qorechain-diana`) **etkin değildir** (27 Ekim 2026'da kontrol edildi); bir çağrı boş veri döndürür. (Diğer üç QoreChain önderlemeli sözleşmesi, yani kuantum-sonrası çift ve PRISM parametreleri, yalnızca test ağında etkindir.) Yalnızca salt okunur, sabit noktalı bir puanlama yoluna kavuştuktan sonra etkinleştirilecekler. Bkz. [EVM Önderlemeli Sözleşmeleri: Ağ durumu](/developer-guide/evm-precompiles#network-status).
:::

**Önemli**: EVM önderlemeli sözleşmeler **yalnızca deterministik sezgisel motoru** kullanır. Asla yan bileşeni çağırmazlar, böylece tüm EVM yürütmesinin tamamen deterministik ve yeniden üretilebilir kalmasını sağlarlar. v3.2.3'ten itibaren anomali kontrolü önderlemeli sözleşmesi bir işlemi durum yazmadan analiz eder; o sürümdeki diğer önderlemeli sözleşme sağlamlaştırmaları (CrossVM köprüsünün `STATICCALL` çağrısını reddetmesi, iç içe çağrısını çağıran çerçevenin gas'ından ölçmesi ve yalnızca izin listesindeki QoreChain Native hedeflerine ulaşması) CrossVM önderlemeli sözleşmesi etkinleştirildiğinde geçerli olur. 27 Ekim 2026 itibarıyla `active_static_precompiles` listesi ana ağda boştur; test ağında üç girdi içerir (PQC Verify `0x…0A01`, PQC Key Status `0x…0A02` ve PRISM Consensus Params `0x…0C01`), hiçbiri bir yapay zeka önderlemeli sözleşmesi değildir.

## TEE Onaylaması (Attestation)

Yapay zeka modülü, güvenli donanım enklavları içinde gelecekteki doğrulanabilir yapay zeka modeli yürütmesini mümkün kılan **Güvenilir Yürütme Ortamı** onaylaması için arayüzler tanımlar.

### Desteklenen Platformlar

| Platform    | Tanımlayıcı | Açıklama                                            |
| ----------- | ---------- | ------------------------------------------------------ |
| Intel SGX   | `sgx`      | Software Guard Extensions                              |
| Intel TDX   | `tdx`      | Trust Domain Extensions                                |
| AMD SEV-SNP | `sev-snp`  | Secure Encrypted Virtualization - Secure Nested Paging |
| ARM CCA     | `arm-cca`  | Confidential Compute Architecture                      |

### Onaylama Akışı

1. **Model ağırlıklarını yükle** — Yan bileşen, yapay zeka modeli ağırlıklarını bir TEE enklavına yükler.
2. **Enklav içinde çıkarım çalıştır** — Çıkarım, enklavın korumalı belleği içinde çalışır.
3. **Onaylama raporu üret** — Enklav, model hash'ini, girdi hash'ini ve çıktı hash'ini bağlayan bir onaylama raporu üretir.
4. **Onaylamayı zincir üstünde doğrula** — Doğrulayıcılar, çıkarım sonuçlarını kabul etmeden önce onaylamayı zincir üstünde doğrular.

TEE onaylaması şu anda arayüz belirtimi aşamasındadır. Uygulama gelecekteki bir sürümde planlanmaktadır.

## Federe Öğrenme

Yapay zeka modülü, doğrulayıcı düğümlerin yerel modeller eğittiği ve ham eğitim verilerini paylaşmadan global bir modelde toplanan gradyan güncellemeleri gönderdiği **zincir üstü federe öğrenme** koordinasyonu için arayüzler tanımlar.

### Toplama Yöntemleri

| Yöntem     | Açıklama                                                             |
| ---------- | ----------------------------------------------------------------------- |
| `fedavg`   | Federated Averaging — örnek sayısına göre gradyanların ağırlıklı ortalaması     |
| `fedprox`  | Federated Proximal — heterojen verileri işlemek için bir yakınsal terim ekler  |
| `scaffold` | SCAFFOLD — istemci kaymasını düzeltmek için kontrol değişkenleri kullanır            |

### Tur Yaşam Döngüsü

```
Pending --> Training --> Aggregating --> Complete
                                    \-> Failed (timeout or insufficient participants)
```

Her tur, minimum/maksimum katılımcı sayısı, zaman aşımı, öğrenme oranı, gradyan kırpma normu ve isteğe bağlı bir diferansiyel gizlilik gürültü çarpanı ile yapılandırılır. Tüm gradyan gönderimleri PQC (Dilithium-5) imzalarıyla imzalanır.

Federe öğrenme şu anda arayüz belirtimi aşamasındadır. Uygulama gelecekteki bir sürümde planlanmaktadır.

## Sorgular

`qorechaind query ai config` ve `qorechaind query ai stats` (gRPC), modülün sorgularıdır. Modülün bugün hiçbir REST rotası yoktur: `/ai/v1/...` ücret tahmini, dolandırıcılık soruşturması, ağ önerisi ve devre kesici rotaları ana ağda veya test ağında sunulmaz.

## İlgili

* [PRISM Konsensüs Motoru](/architecture/prism-consensus-engine) — konsensüs optimizasyonu için tasarlanmış yapay zeka katmanı (bugün yalnızca gözlem).
* [Akıllı Sözleşme Oluşturucu](/dashboard/smart-contract-creator) — Kontrol Panelinde yapay zeka destekli sözleşme üretimi.
* [Sözleşme Denetleyici](/dashboard/contract-auditor) — yapay zeka destekli sözleşme güvenlik incelemesi.
