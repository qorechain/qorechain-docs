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
| **Konsensüs Seviyesi**   | Blok üretimi, parametre ayarı                     | Zincir üstü (x/rlconsensus) | Evet           |
| **Ağ Seviyesi**     | İşlem yönlendirme, dolandırıcılık tespiti, ücret optimizasyonu | Zincir üstü (x/ai)          | Evet           |
| **Uygulama Seviyesi** | Sözleşme üretimi, denetim, derin analiz            | Zincir dışı (sidecar)      | Hayır            |

Konsensüs seviyesi ayrı olarak [PRISM Konsensüs Motoru](/architecture/prism-consensus-engine) sayfasında belgelenmiştir. Bu sayfa ağ ve uygulama seviyelerini kapsar.

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

`allow` dışında bir eylem tetiklendiğinde, benzersiz bir kimliğe sahip bir dolandırıcılık soruşturma kaydı oluşturulur (biçim: `INV-{timestamp}-{txhash_prefix}`).

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

Nihai ücret, bir **tıkanıklık çarpanı** (%0 tıkanıklıkta 1.0x, %100 tıkanıklıkta 5.0x'e kadar) ve tahmin edilen tıkanıklık mevcut tıkanıklığı aştığında bir **trend primi** içerir. Minimum ücret tabanı 500 uqor'dur (0.0005 QOR).

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

**Önemli**: EVM önderlemeli sözleşmeler **yalnızca deterministik sezgisel motoru** kullanır. Asla yan bileşeni çağırmazlar, böylece tüm EVM yürütmesinin tamamen deterministik ve yeniden üretilebilir kalmasını sağlarlar.

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

## REST Uç Noktaları

| Uç Nokta                         | Açıklama                                                    |
| -------------------------------- | -------------------------------------------------------------- |
| `/ai/v1/fee-estimate`            | Hızlı, normal ve yavaş aciliyet kademeleri için ücret tahminleri döndürür |
| `/ai/v1/fraud/investigations`    | Aktif ve çözülmüş dolandırıcılık soruşturmalarını listeler                 |
| `/ai/v1/network/recommendations` | Mevcut ağ parametresi optimizasyon önerilerini döndürür |
| `/ai/v1/circuit-breakers`        | Sözleşmeler için aktif devre kesici durumlarını listeler              |

## İlgili

* [PRISM Konsensüs Motoru](/architecture/prism-consensus-engine) — konsensüs optimizasyonunu yöneten yapay zeka katmanı.
* [Akıllı Sözleşme Oluşturucu](/dashboard/smart-contract-creator) — Kontrol Panelinde yapay zeka destekli sözleşme üretimi.
* [Sözleşme Denetleyici](/dashboard/contract-auditor) — yapay zeka destekli sözleşme güvenlik incelemesi.
