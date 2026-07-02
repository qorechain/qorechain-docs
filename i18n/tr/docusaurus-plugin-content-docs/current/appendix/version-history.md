---
slug: /appendix/version-history
title: Sürüm Geçmişi
sidebar_label: Sürüm Geçmişi
sidebar_position: 3
---

# Sürüm Geçmişi

QoreChain için herkese açık sürüm geçmişi. En son sürüm **v3.1.82** olup, ana ağ **`qorechain-vladi`** (EVM zincir kimliği **9801**, 7 Haziran 2026'dan beri canlı) üzerinde çalışmaktadır. Test ağı **`qorechain-diana`** (EVM zincir kimliği **9800**), ön sürüm derlemelerini takip eder.

:::note
Aşağıdaki kayıtlar üst düzey yetenek özetleridir. Önceki `v1.x` kayıtları, ana ağdan önce gelen test ağı sürüm serisinin tarihsel kaydı olarak korunmaktadır.
:::

---

## v3.1.82 — SVM Üzerinde Yerel QOR Canlı + Entegratör Etkinleştirme (Mevcut Ana Ağ Sürümü)

**Sürüm odağı:** Her iki ağda çalışan SVM yerel-QOR birleştirmesi ve bir borsa veya entegratörün bağlanmak için ihtiyaç duyduğu her şey.

* **Birleşik yerel-QOR bakiyesi üç arayüzün tümünde canlı** — SVM birleştirmesinin (v3.1.81) ana ağda ve test ağında canlı olduğu doğrulandı: aynı hesap, Cosmos üzerinde `uqor` (6 ondalık), EVM üzerinde wei tarzı 18 ondalık ve Solana uyumlu arayüzde lamports (9 ondalık; 1 uqor = 1,000 lamports) olarak görünen tek bir bakiyeye sahiptir.
* **Doğrulanmış herkese açık uç noktalar** — Her iki ağda konsensüs RPC, REST, EVM JSON-RPC ve SVM JSON-RPC için herkese açık HTTPS uç noktaları ve herkese açık [blok gezgini](https://explore.qore.network). Bkz. [Ağlar](/appendix/networks).
* **İndirmeler** — Sürümlendirilmiş düğüm ikili paketleri, ana ağ genesis dosyası ve güncel zincir verisi anlık görüntüleri (SHA-256 sağlama toplamlarıyla birlikte) [download.qore.host](https://download.qore.host) adresinde yayımlanmaktadır.
* **İstemci yığını genelinde deterministik kuantum sonrası imzalama** — `@qorechain/pqc` 0.1.1, altı dil bağlamasının tümünde ML-DSA-87 imzalarını deterministik olarak (FIPS-204 §3.4) üretir ve zincirin kabul ettiğiyle eşleşir; `@qorechain/wallet-adapter` 0.1.2, hibrit işlem imzalama için bunun üzerine inşa edilmiştir.
* **Entegratör rehberi** — Üç arayüzde para yatırma, para çekme ve düğüm operasyonlarını kapsayan yeni [Borsa ve Entegratör Rehberi](/developer-guide/exchange-integration).

## v3.1.81 — SVM Yerel-QOR Birleştirmesi

**Sürüm odağı:** Solana uyumlu arayüzde birinci sınıf bir varlık olarak yerel QOR.

* **SVM üzerinde yerel QOR** — SVM çalışma zamanı artık ayrı bir SVM'ye özgü bakiye izlemek yerine hesabın yerel QOR bakiyesini doğrudan (lamports cinsinden) sunar. `getBalance` ve `getSignaturesForAddress` yerel fonlar üzerinde çalışır ve System Program transferleri yerel QOR taşır.
* **SVM adres eşlemesi** — Bir hesabın SVM adresi, 20 hesap baytından türetilir (sağdan 32 bayta doldurulur, base58 ile kodlanır); böylece tek bir anahtarın Cosmos, EVM ve SVM adresleri aynı fonlara işaret eder.

## v3.1.80 — Çok Katmanlı Durum Çapası Sorguları

**Sürüm odağı:** Rollup'lar için okunabilir, çevrimdışı doğrulanabilir mutabakat çapaları.

* **Çapa okuma sorguları** — `x/multilayer` sorgu servisi artık `Anchor` (bir katman için en son durum çapası) ve `Anchors` (bir katmanın çapa geçmişi) sorgularını sunar; böylece istemciler bir katmanın mutabakat çapasını alıp bağımsız olarak doğrulayabilir.
* **Multilayer için REST ağ geçidi** — Her multilayer sorgusu (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) artık gRPC'ye ek olarak REST üzerinden de kullanılabilir.
* **Kuantum güvenli mutabakat makbuzlarının önü açıldı** — Her çapa, kanonik alanları üzerinde bir **ML-DSA-87 (Dilithium-5)** imzası taşır; bu, Rollup Development Kit'in çevrimdışı mutabakat makbuzu doğrulaması için zincir üstü temeli sağlar.

## v3.1.79 — Köprü Ağları için Doğrulayıcı Otomatik Sağlama

**Sürüm odağı:** Lisanslı doğrulayıcılar için bağlı ağlarda anahtar teslim katılım.

* **Ağ sürücüsü çerçevesi** — Bildirimsel bir sürücü çerçevesi, ilgili `validator_<chain>` (veya `qcb_bridge`) lisansına sahip bir QoreChain doğrulayıcısının, eşleşen harici ağ istemcisinin aynı düğüm üzerinde QoreChain orkestrasyonu altında sağlanmasını, yapılandırılmasını ve çalıştırılmasını mümkün kılar — ancak yalnızca lisans etkinleştirildikten sonra.
* **37 köprü ağının tamamı için sürücüler** — Kapsam, katılım modeline göre sınıflandırılmış (izinsiz doğrulayıcı, kotalı/seçimli/kabul esaslı, L2 tam düğüm ve stake gerektirmeyen/güven listesi rolleri) bağlı ağların tamamını içerir. Harici ağ stake'i ve imzalama anahtarları ağ başına operatör tarafından sağlanmaya devam eder; QoreChain, çerçeveyi ve zorunlu kılınan lisans kapısını sunar.

## v3.1.78 — Dağıtım Öncesi Hazırlık

**Sürüm odağı:** Cüzdanlar, köprüler, IBC ve lisanslamanın tümü lansmanda çalışır — dağıtım sonrası yönetişim gerektirmeden.

* **Güven gerektirmeyen dağıtım sonrası köprü etkinleştirme** — Bir `bridge_admin` anahtarı (veya `qcb_bridge` lisans sahibi), tek bir imzalı işlemle (`tx bridge update-chain-config` / `set-verifier-bootstrap`) herhangi bir bağlı zincirin köprüsünü etkinleştirebilir — sözleşme adresini, onay sayısını, mimariyi, durumu, etkin doğrulayıcıyı ve doğrulayıcı güven kökünü ayarlayarak — yönetişim önerisi veya zincir yükseltmesi olmadan.
* **Doğrulayıcı-ağ lisans kapısı** — Orkestratör artık herhangi bir harici ağ istemcisini başlatmadan önce `validator_<chain>` / `qcb_bridge` lisansını (kapalı-güvenli/fail-closed) zorunlu kılar.
* **Cüzdan entegrasyon paketleri** — `@qorechain/wallet-adapter` ve `@qorechain/connect` npm'de yayımlandı (v0.1.0); tek çağrıyla MetaMask ağ kaydı (EIP-3085, EVM hattında **18 ondalıklı** yerel QOR) ve Keplr gaz fiyatı yapılandırması ekler.
* **IBC anahtar teslim aktarıcı** — Sekiz IBC karşı tarafı için çalışmaya hazır aktarıcı (relayer) yapılandırması ve kanal önyükleme araçları; böylece kanallar dağıtım sonrasında özel bir kurulum gerektirmeden devreye girer.

## v3.1.77 — Köprü ve Yakım REST Uç Noktaları

**Sürüm odağı:** Zincirler arası ve arz modülleri için salt okunur REST erişimi.

* **Köprü REST uç noktaları** — Köprü modülü için salt okunur HTTP sorgu uç noktaları; köprü durumunu gRPC'ye ek olarak standart REST üzerinden sunar.
* **Yakım REST uç noktaları** — Yakım (burn) modülü için salt okunur HTTP sorgu uç noktaları; ücret dağıtımı ve arz verilerini standart REST üzerinden sorgulanabilir hale getirir.

## v3.1.76 — SVM Araç Zinciri Modernizasyonu

**Sürüm odağı:** Solana Virtual Machine uyumluluk yenilemesi.

* **Güncel araç zinciriyle program desteği** — SVM yürütmesi modernize edildi; böylece güncel Solana araç zinciriyle derlenen programlar QoreChain SVM çalışma zamanında çalışır.

## v3.1.75 — Varsayılan Olarak SVM JSON-RPC

**Sürüm odağı:** Kutudan çıktığı gibi Solana uyumlu RPC.

* **Solana uyumlu JSON-RPC** — SVM JSON-RPC sunucusu artık varsayılan olarak etkindir (port **8899**) ve düğümle birlikte otomatik olarak başlatılır; SVM araçları için Solana uyumlu bir RPC arayüzü sağlar.

## v3.1.74 — Rollup Profil Ön Ayarları

**Sürüm odağı:** Rollup Development Kit kullanılabilirliği ve mutabakat.

* **Profil ön ayarı uygulama** — Rollup oluşturma artık seçilen profilin ön ayarını (DeFi, oyun, NFT, kurumsal veya tamamen özel) uygular; böylece yeni rollup'lar kullanım senaryolarına uygun makul varsayılanları devralır.
* **İyimser (optimistic) mutabakat** — İyimser mutabakat yolu (toplu gönderim ve itiraz) uçtan uca çalışır durumdadır.

## v3.1.73 — Kuantum Sonrası Karma (Hash) Taban Çizgisi

**Sürüm odağı:** Varsayılan kuantum sonrası kriptografik taban çizgisinin tamamlanması.

* **Varsayılan karma olarak SHAKE-256** — SHAKE-256 (SHA-3 ailesi), varsayılan uygulama karma fonksiyonu olarak benimsendi; böylece **ML-DSA-87 (Dilithium-5)** imzaları, **ML-KEM-1024** anahtar kapsülleme ve **SHAKE-256** karma işleminden oluşan varsayılan kuantum sonrası taban çizgisi tamamlandı.

## v3.1.72 — Kararlılık ve Bakım

**Sürüm odağı:** Rutin kararlılık ve derleme hattı bakımı.

* **Kararlılık iyileştirmeleri** — Dışarıdan görünür davranış değişikliği olmaksızın dahili kararlılık, bağımlılık ve derleme hattı bakımı.

## v3.1.71 — PQC Hibrit İmzalar Varsayılan Olarak Zorunlu

**Sürüm odağı:** Cosmos işlem yolunda varsayılan olarak açık kuantum sonrası güvenlik.

* **Hibrit imzalar varsayılan olarak zorunlu** — Kuantum sonrası hibrit imzalar artık Cosmos işlem yolunda varsayılan olarak zorunludur: her işlem, klasik **secp256k1** imzasının yanında bir kuantum sonrası **ML-DSA-87 (Dilithium-5)** imzası taşır.
* **Yönetişim kontrollü zorunluluk** — Zorunluluk modu yönetişim kontrolünde kalır; varsayılan değer **zorunlu** (required) olarak ayarlanmıştır.

## v3.1.70 — Üretim Sağlamlaştırması

**Sürüm odağı:** Canlı ana ağ için üretim sağlamlaştırması ve konsensüs optimizasyonu.

* **PRISM konsensüs optimizasyonu** — Canlı ağ koşullarında uyarlanabilir parametre ayarı için PRISM pekiştirmeli öğrenme optimizasyon katmanında devam eden iyileştirmeler; devre kesici güvenlik kontrolleriyle birlikte.
* **Performans ve kararlılık** — Doğrulayıcılar ve tam düğümler genelinde verim, gecikme ve kaynak kullanımı iyileştirmeleri.
* **Operasyonel araçlar** — Ana ağ operatörleri için geliştirilmiş izleme, sorgulama ve düğüm işletim ergonomisi.
* **Tokenomics v2.1 uyumu** — Ücret dağıtımı ve emisyon mekanikleri, sabit arzlı, sonlu emisyonlu ekonomik modelle uyumlu hale getirildi.

## v3.0.0 — Ana Ağ Genesis'i

**Sürüm odağı:** Ana ağ lansmanı ve token üretim etkinliği.

* **Ana ağ genesis'i** — QoreChain ana ağı (`qorechain-vladi`, EVM zincir kimliği 9801), **7 Haziran 2026** tarihinde token üretim etkinliği (TGE) genesis'te olacak şekilde başlatıldı.
* **Beşli ücret bölüşümü** — Protokol ücretlerinin doğrulayıcılar, yakım, hazine, stake edenler ve hafif düğümler arasında dağıtımı (**37 / 30 / 20 / 10 / 3**); hafif düğümlere ayrılmış bir pay ekler.
* **Zincir üstü AMM** — Zincir üstü likidite havuzları ve takaslar için yerel otomatik piyasa yapıcı modülü (`x/amm`).
* **Zincir lisanslama** — Protokol yetkilendirmelerini kaydetmek ve yönetmek için zincir üstü lisans modülü (`x/license`).
* **Sağlamlaştırılmış mutabakat paradigmaları** — RDK mutabakat modları optimistic, zk, based ve sovereign olarak kesinleştirildi.

## v1.4.0 — Ana Ağ Öncesi Genişleme

**Sürüm odağı:** Ana ağ öncesinde zincirler arası kapsam ve sürüm adayı stabilizasyonu.

* **Genişletilmiş zincirler arası kapsam** — Daha geniş bir harici ağ kümesine ek IBC ve köprü bağlantısı.
* **Hafif düğüm katılımı** — Hafif düğümler ve ücret payı ödüllerinin altyapısı tanıtıldı.
* **Sürüm adayı sağlamlaştırması** — Ana ağ genesis'ine hazırlık olarak tüm çekirdek modüllerde kapsamlı test, denetim ve stabilizasyon.

## v1.3.0 — Rollup Development Kit

**Sürüm odağı:** Egemen (sovereign) ve paylaşımlı güvenlikli rollup dağıtımları için yerel rollup altyapısı.

* **x/rdk modülü** — Dört mutabakat paradigmasına sahip eksiksiz Rollup Development Kit: optimistic, zk, based ve sovereign
* **5 ön ayarlı profil** — DeFi, oyun, NFT, kurumsal ve tamamen özel kullanım senaryoları için önceden yapılandırılmış rollup şablonları
* **Yerel veri kullanılabilirliği** — Blob depolama, saklama yönetimi ve budama yaşam döngüsüne sahip zincir üstü DA katmanı
* **EndBlocker otomatik kesinleştirme** — İtiraz penceresi sona erdiğinde operatör müdahalesi gerektirmeyen otomatik toplu kesinleştirme
* **Yapay zekâ destekli profil seçimi** — Amaçlanan kullanım senaryosuna göre en uygun rollup yapılandırmasını öneren `suggest-profile` sorgusu
* **Multilayer entegrasyonu** — Rollup'lar, çok katmanlı mimaride katman olarak kaydolur; yönlendirme, çapa ve itiraz mekaniklerini devralır
* **Banka emanet yaşam döngüsü** — Operatör stake'i rollup çalışması sırasında emanette tutulur ve temiz kapatmada serbest bırakılır ya da slashing durumunda el konur

## v1.2.0 — IBC ve Köprüler

**Sürüm odağı:** Zincirler arası bağlantı ve gelişmiş hesap soyutlamaları.

* **25 zincirler arası bağlantı** — Harici ağlara 8 IBC kanalı ve 17 QoreChain Bridge (QCB) bağlantısı
* **x/babylon modülü** — Bitcoin sahiplerinin QoreChain staking güvenliğine katılmasını sağlayan BTC restaking entegrasyonu
* **x/abstractaccount modülü** — Programlanabilir harcama kuralları, oturum anahtarları ve özel kimlik doğrulama mantığına sahip akıllı hesap çerçevesi
* **x/fairblock modülü** — MEV'e dirençli işlem şifrelemesi için Eşik Kimlik Tabanlı Şifreleme (tIBE)
* **x/gasabstraction modülü** — Yerel QOR, IBC köprülü USDC ve IBC köprülü ATOM'u destekleyen çok tokenli gaz ödemesi
* **5 şeritli işlem önceliklendirme** — Önceliğe göre sıralanan işlem şeritleri: sistem, yönetişim, staking, köprü ve genel
* **IBC aktarıcı yapılandırmaları** — Desteklenen tüm IBC kanalları için önceden yapılandırılmış aktarıcı kurulumları
* **Köprüden yakıma entegrasyon** — Köprü ücretleri, yakım modülünün ücret dağıtımı üzerinden yönlendirilir

## v1.1.0 — PQC Hibrit İmzalar

**Sürüm odağı:** Kuantum sonrası kriptografik güvenlik ve algoritma çevikliği.

* **Çift secp256k1 (ECDSA) + ML-DSA-87 imzaları** — Her işlem, AnteHandler zincirinde doğrulanan hem klasik hem de kuantum sonrası bir imza taşır
* **3 zorunluluk modu** — Yapılandırılabilir hibrit imza zorunluluğu: kapalı (mod 0), esnek (mod 1, PQC isteğe bağlı), zorunlu (mod 2, PQC gerekli)
* **Otomatik kayıt** — PQC açık anahtarları, ilk hibrit işlemde otomatik olarak kaydedilir; ayrı bir kayıt adımını ortadan kaldırır
* **SHAKE-256 karma temeli** — PQC ile ilgili tüm karma işlemleri, kuantuma dirençli adres türetimi için SHAKE-256 (SHA-3 ailesi) kullanır
* **TEE tasdik arayüzleri** — PQC anahtar üretiminin bütünlüğünü kanıtlamak için Güvenilir Yürütme Ortamı (TEE) tasdik desteği
* **Algoritma çevikliği çerçevesi** — Gelecekteki PQC algoritmalarının zincir yükseltmesi olmadan yönetişim yoluyla eklenmesine olanak tanıyan takılabilir algoritma kayıt defteri

## v1.0.0 — Genesis (Tokenomics Motoru)

**Sürüm odağı:** Eksiksiz tokenomics, çoklu-VM yürütme ve yapay zekâ destekli operasyonlarla ilk protokol lansmanı.

* **x/burn modülü** — Doğrulayıcılar, yakım, hazine ve stake edenler arasında dörtlü dağıtıma sahip çok kanallı ücret yakım mekanizması
* **x/xqore modülü** — Kademeli erken kilit açma cezaları ve PvP rebase yeniden dağıtımına sahip yönetişim staking türevi
* **x/inflation modülü** — Sonlu emisyonlu ekonomik model tarafından yönetilen, yıllık azalmalı, epoch tabanlı emisyon
* **PRISM konsensüs katmanı** — Devre kesici güvenlik kontrolleriyle dinamik zincir parametresi ayarı için pekiştirmeli öğrenme optimizasyonu (PPO)
* **Üçlü havuzlu CPoS** — İtibar puanlarıyla ağırlıklandırılmış Emerald, Sapphire ve Ruby doğrulayıcı havuzlarına sahip Sınıflandırılmış Hisse Kanıtı (Classified Proof-of-Stake)
* **QDRW yönetişimi** — Havuzlar arasında ödül dağıtımında yönetişim onaylı ayarlamalara olanak tanıyan Dinamik Ödül Ağırlıklandırma sistemi
* **EVM + CosmWasm + SVM çalışma zamanları** — Üç eşzamanlı yürütme ortamı: QoreChain EVM Engine, CosmWasm akıllı sözleşmeleri ve Solana Virtual Machine
* **VM'ler arası köprü** — Tek bir blok içinde EVM, CosmWasm ve SVM çalışma zamanları arasında mesaj iletimi ve varlık transferleri
* **Kuantum sonrası kriptografi** — Yüksek performanslı bir PQC kütüphanesiyle desteklenen kuantuma dirençli imzalama
* **QCAI** — Dolandırıcılık tespiti, ücret tahmini ve ağ optimizasyonu için isteğe bağlı zincir dışı yardımcı servise (sidecar) sahip zincir üstü sezgisel analiz
* **Konteynerleştirilmiş dağıtım** — Yardımcı servis ve blok dizinleyiciyle eksiksiz çok doğrulayıcılı test ağı dağıtımı
* **Blok dizinleyici** — Tarihsel sorgu ve analitik için kalıcı depolamaya sahip blok dinleyicisi
