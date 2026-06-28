---
slug: /appendix/version-history
title: Sürüm Geçmişi
sidebar_label: Sürüm Geçmişi
sidebar_position: 3
---

# Sürüm Geçmişi

QoreChain için herkese açık sürüm geçmişi. En son sürüm **v3.1.80** olup ana ağ **`qorechain-vladi`** üzerinde çalışmaktadır (EVM zincir kimliği **9801**, 7 Haziran 2026'dan beri canlı). Test ağı **`qorechain-diana`** (EVM zincir kimliği **9800**) yayın öncesi derlemeleri takip eder.

:::note
Aşağıdaki kayıtlar üst düzey yetenek özetleridir. Daha eski `v1.x` kayıtları, ana ağdan önce gelen test ağı yayın serisinin tarihsel kaydı olarak korunmuştur.
:::

---

## v3.1.80 — Çok Katmanlı Durum Çapası Sorguları (Mevcut Ana Ağ Sürümü)

**Sürüm odağı:** Rollup'lar için okunabilir, çevrimdışı doğrulanabilir uzlaşma çapaları.

* **Çapa okuma sorguları** — `x/multilayer` sorgu hizmeti artık `Anchor` (bir katmanın en son durum çapası) ve `Anchors` (bir katmanın çapa geçmişi) sorgularını sunar; böylece istemciler bir katmanın uzlaşma çapasını alıp bağımsız olarak doğrulayabilir.
* **Çok katmanlı için REST ağ geçidi** — Her çok katmanlı sorgu (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) artık gRPC'ye ek olarak REST üzerinden de kullanılabilir.
* **Kuantum güvenli uzlaşma makbuzları artık mümkün** — Her çapa, kanonik alanları üzerinde bir **ML-DSA-87 (Dilithium-5)** imzası taşır ve Rollup Development Kit'in çevrimdışı uzlaşma makbuzu doğrulaması için zincir üzerindeki temeli sağlar.

## v3.1.79 — Köprü Ağları için Doğrulayıcı Otomatik Sağlama

**Sürüm odağı:** Lisanslı doğrulayıcılar için bağlı ağlarda anahtar teslim katılım.

* **Ağ sürücüsü çerçevesi** — Bildirimsel bir sürücü çerçevesi, ilgili `validator_<chain>` (veya `qcb_bridge`) lisansını elinde bulunduran bir QoreChain doğrulayıcısının, eşleşen harici ağ istemcisini aynı düğümde QoreChain orkestrasyonu altında sağlamasına, yapılandırmasına ve çalıştırmasına olanak tanır — yalnızca lisans etkinleştirildikten sonra.
* **37 köprü ağının tümü için sürücüler** — Kapsam, katılım modeline göre sınıflandırılmış her bağlı ağı içerir (izin gerektirmeyen doğrulayıcı, sınırlı/seçilmiş/kabul, L2 tam düğüm ve payını koyma yapmayan/güven listesi rolleri). Harici ağ payı ve imzalama anahtarları her ağ için operatör tarafından sağlanmaya devam eder; QoreChain çerçeveyi ve zorunlu kılınan lisans kapısını sunar.

## v3.1.78 — Dağıtım Öncesi Hazırlık

**Sürüm odağı:** Cüzdanlar, köprüler, IBC ve lisanslama lansmanda eksiksiz çalışır — dağıtım sonrası yönetişim olmadan.

* **Güvensiz dağıtım sonrası köprü etkinleştirme** — Bir `bridge_admin` anahtarı (veya `qcb_bridge` lisans sahibi), bağlı herhangi bir zincirin köprüsünü tek bir imzalı işlemle (`tx bridge update-chain-config` / `set-verifier-bootstrap`) etkinleştirebilir — sözleşme adresini, onayları, mimariyi, durumu, etkin doğrulayıcıyı ve doğrulayıcı güven kökünü ayarlayarak — herhangi bir yönetişim önerisi veya zincir yükseltmesi olmadan.
* **Doğrulayıcı-ağ lisans kapısı** — Orkestratör artık herhangi bir harici ağ istemcisini başlatmadan önce `validator_<chain>` / `qcb_bridge` lisansını (başarısızlıkta kapalı) zorunlu kılar.
* **Cüzdan entegrasyon paketleri** — `@qorechain/wallet-adapter` ve `@qorechain/connect` npm'e yayınlandı (v0.1.0); EVM rayında tek çağrıyla MetaMask ağ kaydı (EIP-3085, **18 ondalıklı** yerel QOR) ve Keplr gaz fiyatı yapılandırması eklendi.
* **IBC anahtar teslim aktarıcı** — Sekiz IBC karşı tarafı için çalışmaya hazır aktarıcı yapılandırması ve kanal başlatma araçları; böylece kanallar özel kurulum olmadan dağıtım sonrası devreye girer.

## v3.1.77 — Köprü ve Yakım REST Uç Noktaları

**Sürüm odağı:** Zincirler arası ve arz modülleri için salt okunur REST erişimi.

* **Köprü REST uç noktaları** — Köprü modülü için salt okunur HTTP sorgu uç noktaları; köprü durumunu gRPC'ye ek olarak standart REST üzerinden sunar.
* **Yakım REST uç noktaları** — Yakım modülü için salt okunur HTTP sorgu uç noktaları; ücret dağıtımı ve arz verilerini standart REST üzerinden sorgulanabilir hale getirir.

## v3.1.76 — SVM Araç Zinciri Modernizasyonu

**Sürüm odağı:** Solana Virtual Machine uyumluluğu yenileme.

* **Güncel araç zinciri program desteği** — SVM yürütmesi modernize edildi; böylece güncel Solana araç zinciri ile derlenen programlar QoreChain SVM çalışma zamanında çalışır.

## v3.1.75 — Varsayılan Olarak SVM JSON-RPC

**Sürüm odağı:** Kutudan çıkar çıkmaz Solana uyumlu RPC.

* **Solana uyumlu JSON-RPC** — SVM JSON-RPC sunucusu artık varsayılan olarak etkindir (port **8899**) ve düğümle birlikte otomatik olarak başlatılır; SVM araçları için Solana uyumlu bir RPC arayüzü sağlar.

## v3.1.74 — Rollup Profil Ön Ayarları

**Sürüm odağı:** Rollup Development Kit kullanılabilirliği ve uzlaşma.

* **Profil ön ayarı uygulaması** — Rollup oluşturma artık seçilen profilin ön ayarını (DeFi, oyun, NFT, kurumsal veya tamamen özel) uygular; böylece yeni rollup'lar kullanım durumlarına uygun makul varsayılanları devralır.
* **İyimser uzlaşma** — İyimser uzlaşma yolu (toplu gönderim ve itiraz) uçtan uca çalışır durumdadır.

## v3.1.73 — Kuantum Sonrası Hash Temeli

**Sürüm odağı:** Varsayılan kuantum sonrası kriptografik temelin tamamlanması.

* **SHAKE-256 varsayılan hash** — SHAKE-256 (SHA-3 ailesi) varsayılan uygulama hash'i olarak benimsendi; bu, **ML-DSA-87 (Dilithium-5)** imzaları, **ML-KEM-1024** anahtar kapsülleme ve **SHAKE-256** hash'lemeden oluşan varsayılan kuantum sonrası temeli tamamlar.

## v3.1.72 — Kararlılık ve Bakım

**Sürüm odağı:** Rutin kararlılık ve derleme hattı bakımı.

* **Kararlılık iyileştirmeleri** — Dışarıdan görünür davranış değişikliği olmadan dahili kararlılık, bağımlılık ve derleme hattı bakımı.

## v3.1.71 — Varsayılan Olarak Zorunlu PQC Hibrit İmzalar

**Sürüm odağı:** Cosmos işlem yolunda varsayılan olarak açık kuantum sonrası güvenlik.

* **Varsayılan olarak gerekli hibrit imzalar** — Kuantum sonrası hibrit imzalar artık Cosmos işlem yolunda varsayılan olarak zorunlu kılınmıştır: her işlem, klasik **secp256k1** imzasının yanında kuantum sonrası bir **ML-DSA-87 (Dilithium-5)** imzası taşır.
* **Yönetişim kontrollü zorunluluk** — Zorunluluk modu yönetişim kontrolünde kalır ve varsayılan olarak **gerekli** olarak ayarlanmıştır.

## v3.1.70 — Üretim Sağlamlaştırması

**Sürüm odağı:** Canlı ana ağ için üretim sağlamlaştırması ve konsensüs optimizasyonu.

* **PRISM konsensüs optimizasyonu** — Canlı ağ koşulları altında uyarlanabilir parametre ayarı için PRISM pekiştirmeli öğrenme optimizasyon katmanında, devre kesici güvenlik kontrolleriyle birlikte süregelen iyileştirmeler.
* **Performans ve kararlılık** — Doğrulayıcılar ve tam düğümler genelinde verim, gecikme ve kaynak kullanımı iyileştirmeleri.
* **Operasyonel araçlar** — Ana ağ operatörleri için geliştirilmiş izleme, sorgulama ve düğüm işletim ergonomisi.
* **Tokenomi v2.1 uyumu** — Ücret dağıtımı ve emisyon mekaniği, sabit arzlı, sınırlı emisyonlu ekonomik modelle uyumlu hale getirildi.

## v3.0.0 — Ana Ağ Genesis

**Sürüm odağı:** Ana ağ lansmanı ve token üretim etkinliği.

* **Ana ağ genesis** — QoreChain ana ağı (`qorechain-vladi`, EVM zincir kimliği 9801) **7 Haziran 2026** tarihinde, token üretim etkinliği (TGE) genesis'te olacak şekilde başlatıldı.
* **Beş yönlü ücret paylaşımı** — Doğrulayıcılar, yakım, hazine, payını koyanlar ve hafif düğümler arasında protokol ücreti dağıtımı (**37 / 30 / 20 / 10 / 3**); özel bir hafif düğüm payı ekleniyor.
* **Zincir üzeri AMM** — Zincir üzeri likidite havuzları ve takaslar için yerel otomatik piyasa yapıcı modülü (`x/amm`).
* **Zincir lisanslama** — Protokol yetkilerini kaydetmek ve yönetmek için zincir üzeri lisans modülü (`x/license`).
* **Sağlamlaştırılmış uzlaşma paradigmaları** — RDK uzlaşma modları iyimser, zk, tabanlı ve egemen olarak nihai hale getirildi.

## v1.4.0 — Ana Ağ Öncesi Genişleme

**Sürüm odağı:** Ana ağdan önce zincirler arası kapsam ve yayın adayı kararlılığı.

* **Genişletilmiş zincirler arası kapsam** — Daha geniş bir harici ağ kümesine ek IBC ve köprü bağlantısı.
* **Hafif düğüm katılımı** — Hafif düğümler ve bunların ücret payı ödülleri için temel çalışma tanıtıldı.
* **Yayın adayı sağlamlaştırması** — Ana ağ genesis'ine hazırlık olarak tüm çekirdek modüllerde kapsamlı test, denetim ve kararlılık.

## v1.3.0 — Rollup Development Kit

**Sürüm odağı:** Egemen ve paylaşımlı güvenlikli rollup dağıtımları için yerel rollup altyapısı.

* **x/rdk modülü** — Dört uzlaşma paradigmasına sahip eksiksiz Rollup Development Kit: iyimser, zk, tabanlı ve egemen
* **5 ön ayar profili** — DeFi, oyun, NFT, kurumsal ve tamamen özel kullanım durumları için önceden yapılandırılmış rollup şablonları
* **Yerel veri kullanılabilirliği** — Blob depolama, saklama yönetimi ve budama yaşam döngüsüne sahip zincir üzeri DA katmanı
* **EndBlocker otomatik kesinleştirme** — İtiraz penceresi sona erdiğinde, operatör müdahalesine gerek kalmadan otomatik toplu kesinleştirme
* **AI destekli profil seçimi** — Amaçlanan kullanım durumuna göre en uygun rollup yapılandırmasını öneren `suggest-profile` sorgusu
* **Çok katmanlı entegrasyon** — Rollup'lar, çok katmanlı mimaride katman olarak kaydolur ve yönlendirme, çapalama ve itiraz mekaniğini devralır
* **Banka emanet yaşam döngüsü** — Operatör payı, rollup işletimi sırasında emanette tutulur ve temiz kapatmada serbest bırakılır ya da kesintide kaybedilir

## v1.2.0 — IBC ve Köprüler

**Sürüm odağı:** Zincirler arası bağlanabilirlik ve gelişmiş hesap soyutlamaları.

* **25 zincirler arası bağlantı** — Harici ağlara 8 IBC kanalı ve 17 QoreChain Bridge (QCB) bağlantısı
* **x/babylon modülü** — Bitcoin sahiplerinin QoreChain payını koyma güvenliğine katılmasını sağlayan BTC yeniden payını koyma entegrasyonu
* **x/abstractaccount modülü** — Programlanabilir harcama kuralları, oturum anahtarları ve özel kimlik doğrulama mantığı içeren akıllı hesap çerçevesi
* **x/fairblock modülü** — MEV'e dirençli işlem şifrelemesi için Eşik Kimlik Tabanlı Şifreleme (tIBE)
* **x/gasabstraction modülü** — Yerel QOR, IBC ile köprülenmiş USDC ve IBC ile köprülenmiş ATOM'u destekleyen çok tokenli gaz ödemesi
* **5 şeritli TX önceliklendirme** — Önceliğe göre sıralanmış işlem şeritleri: sistem, yönetişim, payını koyma, köprü ve genel
* **IBC aktarıcı yapılandırmaları** — Desteklenen tüm IBC kanalları için önceden yapılandırılmış aktarıcı kurulumları
* **Köprüden yakıma entegrasyon** — Köprü ücretleri, yakım modülünün ücret dağıtımı üzerinden yönlendirilir

## v1.1.0 — PQC Hibrit İmzalar

**Sürüm odağı:** Kuantum sonrası kriptografik güvenlik ve algoritma çevikliği.

* **İkili secp256k1 (ECDSA) + ML-DSA-87 imzalar** — Her işlem hem klasik hem de kuantum sonrası bir imza taşır; AnteHandler zincirinde doğrulanır
* **3 zorunluluk modu** — Yapılandırılabilir hibrit imza zorunluluğu: kapalı (mod 0), izin verici (mod 1, PQC isteğe bağlı), zorunlu (mod 2, PQC gerekli)
* **Otomatik kayıt** — PQC açık anahtarları ilk hibrit işlemde otomatik olarak kaydedilir; ayrı bir kayıt adımını ortadan kaldırır
* **SHAKE-256 hash temeli** — PQC ile ilgili tüm hash'leme işlemleri, kuantuma dirençli adres türetmesi için SHAKE-256 (SHA-3 ailesi) kullanır
* **TEE doğrulama arayüzleri** — PQC anahtar üretimi bütünlüğünü kanıtlamak için Güvenilir Yürütme Ortamı (TEE) doğrulama desteği
* **Algoritma çevikliği çerçevesi** — Gelecekteki PQC algoritmalarının zincir yükseltmesi olmadan yönetişim yoluyla eklenmesine olanak tanıyan takılabilir algoritma kayıt defteri

## v1.0.0 — Genesis (Tokenomi Motoru)

**Sürüm odağı:** Eksiksiz tokenomi, çoklu VM yürütmesi ve AI destekli operasyonlarla başlangıç protokolü lansmanı.

* **x/burn modülü** — Doğrulayıcılar, yakım, hazine ve payını koyanlar arasında dört yönlü dağıtıma sahip çok kanallı ücret yakım mekanizması
* **x/xqore modülü** — Kademeli erken kilit açma cezaları ve PvP yeniden tabanlandırma yeniden dağıtımına sahip yönetişim payını koyma türevi
* **x/inflation modülü** — Sınırlı emisyon ekonomik modeliyle yönetilen, yıllık azalmaya sahip epok tabanlı emisyon
* **PRISM konsensüs katmanı** — Devre kesici güvenlik kontrolleriyle dinamik zincir parametre ayarı için pekiştirmeli öğrenme optimizasyonu (PPO)
* **Üçlü havuzlu CPoS** — İtibar puanlarına göre ağırlıklandırılmış Emerald, Sapphire ve Ruby doğrulayıcı havuzlarına sahip Sınıflandırılmış Hisse İspatı
* **QDRW yönetişim** — Havuzlar arasında ödül dağıtımına yönetişim onaylı ayarlamalar yapılmasına olanak tanıyan Dinamik Ödül Ağırlıklandırma sistemi
* **EVM + CosmWasm + SVM çalışma zamanları** — Üç eşzamanlı yürütme ortamı: QoreChain EVM Engine, CosmWasm akıllı sözleşmeleri ve Solana Virtual Machine
* **VM'ler arası köprü** — Tek bir blok içinde EVM, CosmWasm ve SVM çalışma zamanları arasında mesaj geçişi ve varlık transferleri
* **Kuantum sonrası kriptografi** — Yüksek performanslı bir PQC kütüphanesi tarafından desteklenen kuantuma dirençli imzalama
* **QCAI** — Sahtekarlık tespiti, ücret tahmini ve ağ optimizasyonu için isteğe bağlı zincir dışı yardımcı bileşenle zincir üzeri sezgisel analiz
* **Konteynerleştirilmiş dağıtım** — Yardımcı hizmet ve blok dizinleyiciyle eksiksiz çok doğrulayıcılı test ağı dağıtımı
* **Blok dizinleyici** — Tarihsel sorgu ve analitik için kalıcı depolamaya sahip blok dinleyici
