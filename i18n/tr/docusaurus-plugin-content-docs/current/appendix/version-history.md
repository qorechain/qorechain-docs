---
slug: /appendix/version-history
title: Sürüm Geçmişi
sidebar_label: Sürüm Geçmişi
sidebar_position: 3
---

# Sürüm Geçmişi

QoreChain için genel sürüm geçmişi. En son sürüm, ana ağ **`qorechain-vladi`** (EVM zincir kimliği **9801**, 7 Haziran 2026'dan beri canlı) üzerinde çalışan **v3.1.77**'dir. Test ağı **`qorechain-diana`** (EVM zincir kimliği **9800**) ön sürüm yapılarını takip eder.

:::note
Aşağıdaki girişler üst düzey yetenek özetleridir. Daha eski `v1.x` girişleri, ana ağdan önce gelen test ağı sürüm hattının tarihsel kaydı olarak korunmaktadır.
:::

---

## v3.1.77 — Mevcut Ana Ağ Sürümü

**Sürüm odağı:** Çapraz zincir ve arz modülleri için salt okunur REST erişimi.

* **Köprü REST uç noktaları** — Köprü modülü için salt okunur HTTP sorgu uç noktaları; gRPC'ye ek olarak köprü durumunu standart REST üzerinden açığa çıkarır.
* **Yakma REST uç noktaları** — Yakma modülü için salt okunur HTTP sorgu uç noktaları; ücret dağıtımı ve arz verilerini standart REST üzerinden sorgulanabilir hale getirir.

## v3.1.76 — SVM Araç Zinciri Modernizasyonu

**Sürüm odağı:** Solana Sanal Makinesi uyumluluk yenilemesi.

* **Güncel araç zinciri program desteği** — SVM yürütmesi, güncel Solana araç zinciri ile oluşturulan programların QoreChain SVM çalışma zamanında çalışacak şekilde modernleştirildi.

## v3.1.75 — Varsayılan Olarak SVM JSON-RPC

**Sürüm odağı:** Kutudan çıktığı gibi Solana uyumlu RPC.

* **Solana uyumlu JSON-RPC** — SVM JSON-RPC sunucusu artık varsayılan olarak etkindir (port **8899**) ve düğümle birlikte otomatik olarak başlatılır; SVM araçları için Solana uyumlu bir RPC arabirimi sağlar.

## v3.1.74 — Rollup Profil Ön Ayarları

**Sürüm odağı:** Rollup Development Kit kullanılabilirliği ve mutabakatı.

* **Profil ön ayarı uygulaması** — Rollup oluşturma artık seçilen profilin ön ayarını (DeFi, oyun, NFT, kurumsal veya tamamen özel) uygular; böylece yeni rollup'lar kullanım senaryolarına uygun makul varsayılanları devralır.
* **Optimistic mutabakat** — Optimistic mutabakat yolu (parti gönderme ve itiraz) baştan sona çalışır durumdadır.

## v3.1.73 — Kuantum Sonrası Özet Temeli

**Sürüm odağı:** Varsayılan kuantum sonrası kriptografik temelin tamamlanması.

* **SHAKE-256 varsayılan özet** — SHAKE-256 (SHA-3 ailesi) varsayılan uygulama özeti olarak benimsendi; böylece **ML-DSA-87 (Dilithium-5)** imzaları, **ML-KEM-1024** anahtar kapsülleme ve **SHAKE-256** özetlemeden oluşan varsayılan kuantum sonrası temel tamamlandı.

## v3.1.72 — Kararlılık ve Bakım

**Sürüm odağı:** Rutin kararlılık ve derleme hattı bakımı.

* **Kararlılık iyileştirmeleri** — Dışarıdan görünür davranış değişikliği olmadan iç kararlılık, bağımlılık ve derleme hattı bakımı.

## v3.1.71 — Varsayılan Olarak Zorunlu PQC Hibrit İmzaları

**Sürüm odağı:** Cosmos işlem yolunda varsayılan olarak açık kuantum sonrası güvenlik.

* **Varsayılan olarak gerekli hibrit imzalar** — Kuantum sonrası hibrit imzalar artık Cosmos işlem yolunda varsayılan olarak zorunludur: her işlem, klasik **secp256k1** imzasının yanında bir kuantum sonrası **ML-DSA-87 (Dilithium-5)** imzası taşır.
* **Yönetişim kontrollü uygulama** — Uygulama modu, varsayılanı **gerekli** olarak ayarlanmış şekilde yönetişim tarafından kontrol edilmeye devam eder.

## v3.1.70 — Üretim Sertleştirme

**Sürüm odağı:** Canlı ana ağ için üretim sertleştirme ve konsensüs optimizasyonu.

* **PRISM konsensüs optimizasyonu** — Canlı ağ koşulları altında uyarlanabilir parametre ayarlaması için PRISM pekiştirmeli öğrenme optimizasyon katmanında, devre kesici güvenlik kontrolleriyle birlikte sürdürülen iyileştirmeler.
* **Performans ve kararlılık** — Doğrulayıcılar ve tam düğümler genelinde iş hacmi, gecikme ve kaynak kullanımı iyileştirmeleri.
* **Operasyonel araçlar** — Ana ağ operatörleri için iyileştirilmiş izleme, sorgulama ve düğüm işletme ergonomisi.
* **Tokenomics v2.1 uyumu** — Ücret dağıtımı ve emisyon mekaniği, sabit arzlı, sonlu emisyonlu ekonomik modelle uyumlu hale getirildi.

## v3.0.0 — Ana Ağ Genesis

**Sürüm odağı:** Ana ağ lansmanı ve token üretim etkinliği.

* **Ana ağ genesis** — QoreChain ana ağı (`qorechain-vladi`, EVM zincir kimliği 9801) **7 Haziran 2026**'da, token üretim etkinliği (TGE) genesis'te olacak şekilde başlatıldı.
* **Beş yönlü ücret bölüşümü** — Doğrulayıcılar, yakma, hazine, stake edenler ve hafif düğümler genelinde protokol ücret dağıtımı (**37 / 30 / 20 / 10 / 3**), ayrılmış bir hafif düğüm payı ekledi.
* **Zincir üstü AMM** — Zincir üstü likidite havuzları ve takaslar için yerel otomatik piyasa yapıcı modülü (`x/amm`).
* **Zincir lisanslama** — Protokol haklarını kaydetmek ve yönetmek için zincir üstü lisans modülü (`x/license`).
* **Sertleştirilmiş mutabakat paradigmaları** — RDK mutabakat modları optimistic, zk, based ve sovereign olarak sonlandırıldı.

## v1.4.0 — Ana Ağ Öncesi Genişleme

**Sürüm odağı:** Ana ağdan önce çapraz zincir kapsamı ve sürüm adayı kararlılığı.

* **Genişletilmiş çapraz zincir kapsamı** — Daha geniş bir harici ağ kümesine ek IBC ve köprü bağlantısı.
* **Hafif düğüm katılımı** — Hafif düğümler ve bunların ücret payı ödüllerinin temeli tanıtıldı.
* **Sürüm adayı sertleştirme** — Ana ağ genesis'ine hazırlık olarak tüm çekirdek modüllerde kapsamlı test, denetim ve kararlılık çalışması.

## v1.3.0 — Rollup Development Kit

**Sürüm odağı:** Sovereign ve paylaşımlı güvenlik rollup dağıtımları için yerel rollup altyapısı.

* **x/rdk modülü** — Dört mutabakat paradigmasına sahip tam Rollup Development Kit: optimistic, zk, based ve sovereign
* **5 ön ayar profili** — DeFi, oyun, NFT, kurumsal ve tamamen özel kullanım senaryoları için önceden yapılandırılmış rollup şablonları
* **Yerel veri erişilebilirliği** — Blob depolama, saklama yönetimi ve budama yaşam döngüsü ile zincir üstü DA katmanı
* **EndBlocker otomatik sonlandırma** — İtiraz penceresi sona erdiğinde operatör müdahalesi gerektirmeden otomatik parti sonlandırma
* **YZ destekli profil seçimi** — Amaçlanan kullanım senaryosuna göre optimal bir rollup yapılandırması öneren `suggest-profile` sorgusu
* **Çok katmanlı entegrasyon** — Rollup'lar, çok katmanlı mimaride katman olarak kaydolur ve yönlendirme, çapalama ve itiraz mekaniğini devralır
* **Banka emanet yaşam döngüsü** — Operatör stake'i rollup işletimi sırasında emanette tutulur ve temiz kapanışta serbest bırakılır veya slashing durumunda kaybedilir

## v1.2.0 — IBC ve Köprüler

**Sürüm odağı:** Çapraz zincir bağlantısı ve gelişmiş hesap soyutlamaları.

* **25 çapraz zincir bağlantısı** — Harici ağlara 8 IBC kanalı ve 17 QoreChain Bridge (QCB) bağlantısı
* **x/babylon modülü** — Bitcoin sahiplerinin QoreChain stake güvenliğine katılmasını sağlayan BTC yeniden stake entegrasyonu
* **x/abstractaccount modülü** — Programlanabilir harcama kuralları, oturum anahtarları ve özel kimlik doğrulama mantığı ile akıllı hesap çerçevesi
* **x/fairblock modülü** — MEV'e dirençli işlem şifrelemesi için Eşik Kimlik Tabanlı Şifreleme (tIBE)
* **x/gasabstraction modülü** — Yerel QOR, IBC ile köprülenen USDC ve IBC ile köprülenen ATOM'u destekleyen çok tokenlı gaz ödemesi
* **5 şeritli TX önceliklendirmesi** — Önceliğe göre sıralanan işlem şeritleri: sistem, yönetişim, stake, köprü ve genel
* **IBC aktarıcı yapılandırmaları** — Desteklenen tüm IBC kanalları için önceden yapılandırılmış aktarıcı kurulumları
* **Köprüden yakmaya entegrasyon** — Köprü ücretleri, yakma modülünün ücret dağıtımı üzerinden yönlendirilir

## v1.1.0 — PQC Hibrit İmzaları

**Sürüm odağı:** Kuantum sonrası kriptografik güvenlik ve algoritma çevikliği.

* **İkili secp256k1 (ECDSA) + ML-DSA-87 imzaları** — Her işlem hem klasik hem de kuantum sonrası bir imza taşır ve AnteHandler zincirinde doğrulanır
* **3 uygulama modu** — Yapılandırılabilir hibrit imza uygulaması: kapalı (mod 0), izin verici (mod 1, PQC isteğe bağlı), zorunlu (mod 2, PQC gerekli)
* **Otomatik kayıt** — PQC genel anahtarları ilk hibrit işlemde otomatik olarak kaydedilir ve ayrı bir kayıt adımını ortadan kaldırır
* **SHAKE-256 özet temeli** — Tüm PQC ile ilgili özetleme işlemleri, kuantuma dayanıklı adres türetme için SHAKE-256 (SHA-3 ailesi) kullanır
* **TEE tasdik arabirimleri** — PQC anahtar üretimi bütünlüğünü kanıtlamak için Güvenilir Yürütme Ortamı tasdik desteği
* **Algoritma çevikliği çerçevesi** — Gelecekteki PQC algoritmalarının zincir yükseltmesi olmadan yönetişim aracılığıyla eklenmesine olanak tanıyan takılabilir algoritma kayıt defteri

## v1.0.0 — Genesis (Tokenomics Motoru)

**Sürüm odağı:** Tam tokenomics, çoklu VM yürütmesi ve YZ destekli operasyonlarla ilk protokol lansmanı.

* **x/burn modülü** — Doğrulayıcılar, yakma, hazine ve stake edenler genelinde dört yönlü dağıtıma sahip çok kanallı ücret yakma mekanizması
* **x/xqore modülü** — Kademeli erken açma cezaları ve PvP yeniden dengeleme yeniden dağıtımına sahip yönetişim stake türevi
* **x/inflation modülü** — Sonlu emisyon ekonomik modeliyle yönetilen, yıllık azalmaya sahip dönem temelli emisyon
* **PRISM konsensüs katmanı** — Devre kesici güvenlik kontrolleriyle dinamik zincir parametresi ayarlaması için pekiştirmeli öğrenme optimizasyonu (PPO)
* **Üçlü havuz CPoS** — İtibar puanlarına göre ağırlıklandırılmış Emerald, Sapphire ve Ruby doğrulayıcı havuzlarıyla Sınıflandırılmış Hisse İspatı
* **QDRW yönetişimi** — Havuzlar genelinde ödül dağıtımında yönetişim onaylı ayarlamalara olanak tanıyan Dinamik Ödül Ağırlıklandırma sistemi
* **EVM + CosmWasm + SVM çalışma zamanları** — Üç eşzamanlı yürütme ortamı: QoreChain EVM Motoru, CosmWasm akıllı sözleşmeleri ve Solana Sanal Makinesi
* **Çapraz-VM köprüsü** — Tek bir blok içinde EVM, CosmWasm ve SVM çalışma zamanları arasında mesaj iletimi ve varlık transferleri
* **Kuantum sonrası kriptografi** — Yüksek performanslı bir PQC kitaplığıyla desteklenen kuantuma dayanıklı imzalama
* **QCAI** — Dolandırıcılık tespiti, ücret tahmini ve ağ optimizasyonu için isteğe bağlı zincir dışı yardımcı bileşenle zincir üstü sezgisel analiz
* **Konteynerleştirilmiş dağıtım** — Yardımcı bileşen hizmeti ve blok indeksleyicisi ile tam çoklu doğrulayıcı test ağı dağıtımı
* **Blok indeksleyicisi** — Geçmiş sorgu ve analiz için kalıcı depolamaya sahip blok dinleyicisi
