---
slug: /appendix/version-history
title: Sürüm Geçmişi
sidebar_label: Sürüm Geçmişi
sidebar_position: 3
---

# Sürüm Geçmişi

QoreChain için herkese açık sürüm geçmişi. En son sürüm **v3.1.85** olup, ana ağ **`qorechain-vladi`** üzerinde çalışmaktadır (EVM zincir kimliği **9801**, 7 Haziran 2026'dan beri canlı). Test ağı **`qorechain-diana`** (EVM zincir kimliği **9800**) ön sürüm derlemelerini takip eder.

:::note
Aşağıdaki kayıtlar üst düzey yetenek özetleridir. Daha eski `v1.x` kayıtları, ana ağdan önce gelen test ağı sürüm serisinin tarihsel kaydı olarak korunmaktadır.
:::

---

## v3.1.85 — Bağlı Cüzdanlar Üzerinden Yetkilendirilmiş Harcama (Güncel Sürüm)

**Sürüm odağı:** Bağlı bir harici cüzdan anahtarı (Phantom, MetaMask) artık tek kanonik post-kuantum hesaptan — en az ayrıcalık ilkesine dayalı izinler, harcama limitleri ve anında iptal koruması altında — **harcama** yapabilir.

* **Authenticator yürütme şeritleri** — İki yeni mesaj, kayıtlı bir authenticator'ın hesap sahibi mevcut olmadan kanonik hesaptan transferleri yetkilendirmesine olanak tanır: **`MsgExecuteEVM`** (hesabın `0x…` adresinden bir EVM çağrısı/transferi) ve **`MsgExecuteCosmos`** (Native şeridinde bir bank gönderimi). Zarfı bir **relayer** gönderir ve ücretini öder — kendi hibrit PQC imzası işlem gereksinimlerini karşılar — authenticator'ın alan-ayrımlı, tekrar-korumalı imza baytları üzerindeki imzası ise yetkilendirmenin kendisidir. Harici anahtarın hiçbir zaman bir ML-DSA eş imzasına ihtiyacı yoktur.
* **Authenticator olarak MetaMask** — secp256k1 authenticator'lar artık (33 baytlık sıkıştırılmış anahtar biçimine ek olarak) **20 baytlık Ethereum adresleri** ile kaydedilebilir ve **EIP-191 `personal_sign`** aracılığıyla doğrulanabilir; böylece standart bir MetaMask hesabı bağlanabilir ve limitler dahilinde harcama yapabilir.
* **Üç şeridin tamamında uygulama** — İzin kapsamları ve **SpendingRule** değer limitleri (işlem başına + günlük tavanlar) Native, EVM ve SVM şeritlerinde uygulanır; anahtar yönetimi mesajları hiçbir zaman devredilemez. Ayrı hata kodları, cüzdanların doğru mesajı göstermesini sağlar: `5` harcama limiti aşıldı, `6` authenticator süresi doldu, `10` izin reddedildi, `11` tekrar (replay) reddedildi.
* **İzin şeması sorgusu** — `GET /qorechain/abstractaccount/v1/permission_schema` (ayrıca gRPC/CLI) kanonik izin taksonomisini (11 izin), mesaj→izin eşlemesini ve devredilemez mesaj listesini döndürür; böylece cüzdanlar kapsamları sabit kodlamadan doğrulayabilir.
* **Aynı algoritma ile PQC anahtar rotasyonu** — Yeni **`MsgRotatePQCKey`**, bir hesabın ML-DSA-87 anahtarını aynı algoritma içinde döndürür (eski ve yeni anahtarlarla çift imzalı); bu, eski türetimle oluşturulmuş anahtarların kanonik adrese bağlı türetime taşınmasını ve ele geçirilmiş bir anahtarın emekliye ayrılmasını mümkün kılar. Yeni CLI komutları: `tx pqc rotate-key` ve `tx pqc recover-key` (bir anımsatıcı ifadeden deterministik anahtar kurtarma).
* **Kök anahtar işlemleri etkilenmez** — Değişiklikler ekleyicidir; normal cüzdan, borsa ve Keplr akışları değişmemiştir. Düğüm operatörlerinin ağ yükseltme yüksekliğine kadar **v3.1.85** sürümüne geçmesi gerekir.

## v3.1.84 — Authenticator İzinleri ve Harcama Limitleri

**Sürüm odağı:** Yetkilendirilmiş harcamanın arkasındaki izin modeli.

* **Kanonik izin taksonomisi** — On bir izin (`all`, `send`, `delegate`, `withdraw`, `vote`, `evm`, `wasm`, `svm`, `amm`, `ibc`, `deploy`) ve varsayılan-kapalı (fail-closed) bir mesaj→izin eşlemesi: eşlenmemiş bir mesaj türü reddedilir ve anahtar yönetimi mesajları hiçbir zaman devredilemez.
* **SpendingRule uygulaması** — İşlem başına ve gün başına (UTC) harcama tavanları, izin verilen denom listeleriyle birlikte uygulanır ve her (hesap, authenticator) çifti için kaydedilir.
* **SVM şeridi yetkilendirmesi** — SVM şeridinde yabancı şemalı bir anahtar (ör. Phantom ed25519) tarafından yetkilendirilen eylemler, aynı merkezi yetkilendirme kapısından geçer.

## v3.1.83 — Üç Arayüzün Tamamında Birleşik Hesap İmzalama

**Sürüm odağı:** Tek anahtar, tek hesap — artık Cosmos, EVM ve SVM arayüzlerinde yalnızca bakiye tutmakla kalmayıp **imzalayabilen** tek bir birleşik kimlik.

* **Tek anahtar her şeritte imzalar** — eth-native olarak oluşturulmuş bir hesap (adres = secp256k1 açık anahtarının keccak değeri) artık EVM işlemlerine ek olarak Cosmos şeridi işlemlerini de `eth_secp256k1` şemasıyla imzalar. `qor1…` (Cosmos), `0x…` (EVM) ve Solana-VM (base58) biçimleri, hem **tek bir bakiye tutan** hem de — post-kuantum hibrit (ML-DSA-87) Cosmos işlemleri dahil — **üç şeridin tamamında harcama yapan** tek bir 20 baytlık kimliktir.
* **Post-kuantum imzalama değişmedi** — Birleşik hesap yine ML-DSA-87 anahtarını kaydeder ve zincirin gerektirdiği FIPS-204 hibrit imzasını taşır; klasik kısım, coinType-118 şeması yerine `eth_secp256k1` (keccak) şemasıdır. Mevcut coinType-118 hesapları etkilenmez.
* **Konsensüs açısından tarafsız kademeli yükseltme** — Her iki ağda da **yeniden genesis ve zincir durması olmadan** kademeli bir ikili (binary) yükseltmesi olarak teslim edilmiştir. Hesap bakiyeleri, geçmiş ve genesis değişmemiştir.
* **İstemci araçları** — `@qorechain/wallet-adapter` 0.1.5, eth-native Cosmos imzalama (`signClassicalEth` / `signHybridEth`), birleşik 3 adres üretimi ve `walletFromSeed` (herhangi bir 32 baytlık tohumdan — ör. bir Phantom imzasından — kanonik hesabı türetme) özelliklerini ekler; `@qorechain/chain-bridge` bir `eth_secp256k1` imzalama yolu kazanır.

:::caution Düğüm operatörleri — yükseltme zorunlu
Tam düğümler **v3.1.83+** çalıştırmalıdır. 3.1.83 öncesi bir düğüm, eth-native (`eth_secp256k1`) bir işlemin kodunu çözemez ve bir blokta böyle bir işlem göründüğü anda senkronizasyonu durur. Güncel paketi [download.qore.host](https://download.qore.host) adresinden indirin.
:::

## v3.1.82 — SVM Üzerinde Yerel QOR Canlı + Entegratör Etkinleştirme

**Sürüm odağı:** Her iki ağda da çalışan SVM yerel-QOR birleştirmesi ve bir borsanın ya da entegratörün bağlanmak için ihtiyaç duyduğu her şey.

* **Üç arayüzün tamamında birleşik yerel QOR bakiyesi canlı** — SVM birleştirmesinin (v3.1.81) ana ağ ve test ağında canlı olduğu doğrulanmıştır: aynı hesap, Cosmos'ta `uqor` (6 ondalık), EVM'de wei tarzı 18 ondalık ve Solana uyumlu arayüzde lamports (9 ondalık; 1 uqor = 1.000 lamports) olarak görünen tek bir bakiye tutar.
* **Doğrulanmış herkese açık uç noktalar** — Her iki ağda konsensüs RPC, REST, EVM JSON-RPC ve SVM JSON-RPC için herkese açık HTTPS uç noktaları ve ayrıca herkese açık [blok gezgini](https://explore.qore.network). Bkz. [Ağlar](/appendix/networks).
* **İndirmeler** — Sürümlü düğüm ikili paketleri, ana ağ genesis dosyası ve güncel zincir verisi anlık görüntüleri (SHA-256 sağlama toplamlarıyla) [download.qore.host](https://download.qore.host) adresinde yayımlanmaktadır.
* **İstemci yığını genelinde deterministik post-kuantum imzalama** — `@qorechain/pqc` 0.1.1, altı dil bağlamasının tamamında ML-DSA-87 imzalarını deterministik olarak (FIPS-204 §3.4) üretir ve zincirin kabul ettiğiyle eşleşir; `@qorechain/wallet-adapter` 0.1.2 hibrit işlem imzalama için bunun üzerine inşa edilmiştir.
* **Entegratör kılavuzu** — Üç arayüz genelinde yatırma, çekme ve düğüm operasyonlarını kapsayan yeni [Borsa ve Entegratör Kılavuzu](/developer-guide/exchange-integration).

## v3.1.81 — SVM Yerel-QOR Birleştirmesi

**Sürüm odağı:** Solana uyumlu arayüzde birinci sınıf bir varlık olarak yerel QOR.

* **SVM üzerinde yerel QOR** — SVM çalışma zamanı artık ayrı bir SVM'ye özgü bakiye izlemek yerine hesabın yerel QOR bakiyesini doğrudan (lamports cinsinden) gösterir. `getBalance` ve `getSignaturesForAddress` yerel fonlara karşı çalışır ve System Program transferleri yerel QOR taşır.
* **SVM adres eşlemesi** — Bir hesabın SVM adresi, 20 hesap baytından türetilir (sağdan 32 bayta doldurulur, base58 ile kodlanır); böylece tek bir anahtarın Cosmos, EVM ve SVM adresleri aynı fonlara işaret eder.

## v3.1.80 — Multilayer Durum Çapası Sorguları

**Sürüm odağı:** Rollup'lar için okunabilir, çevrimdışı doğrulanabilir uzlaşma (settlement) çapaları.

* **Çapa okuma sorguları** — `x/multilayer` sorgu servisi artık `Anchor` (bir katmanın en son durum çapası) ve `Anchors` (bir katmanın çapa geçmişi) sorgularını sunar; böylece istemciler bir katmanın uzlaşma çapasını çekip bağımsız olarak doğrulayabilir.
* **Multilayer için REST ağ geçidi** — Her multilayer sorgusu (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) artık gRPC'ye ek olarak REST üzerinden de kullanılabilir.
* **Kuantum güvenli uzlaşma makbuzlarının önü açıldı** — Her çapa, kanonik alanları üzerinde bir **ML-DSA-87 (Dilithium-5)** imzası taşır; bu, Rollup Development Kit'in çevrimdışı uzlaşma makbuzu doğrulaması için zincir üstü temeli sağlar.

## v3.1.79 — Köprü Ağları için Validator Otomatik Tedariki

**Sürüm odağı:** Lisanslı validator'lar için bağlı ağlarda anahtar teslim katılım.

* **Ağ sürücüsü çerçevesi** — Bildirimsel bir sürücü çerçevesi, ilgili `validator_<chain>` (veya `qcb_bridge`) lisansına sahip bir QoreChain validator'ının, eşleşen harici ağ istemcisinin aynı düğümde QoreChain orkestrasyonu altında tedarik edilmesini, yapılandırılmasını ve çalıştırılmasını sağlar — yalnızca lisans etkinleştirildikten sonra.
* **37 köprü ağının tamamı için sürücüler** — Kapsam, katılım modeline göre sınıflandırılmış (izinsiz validator, kapasiteli/seçilmiş/kabullü, L2 tam düğüm ve stake gerektirmeyen/güven listesi rolleri) bağlı tüm ağları içerir. Harici ağ stake'i ve imzalama anahtarları ağ başına operatör tarafından sağlanmaya devam eder; QoreChain, çerçeveyi ve uygulanan lisans kapısını sunar.

## v3.1.78 — Dağıtım Öncesi Hazırlık

**Sürüm odağı:** Cüzdanlar, köprüler, IBC ve lisanslama lansmanda çalışır — dağıtım sonrası yönetişim gerektirmeden.

* **Güven gerektirmeyen dağıtım sonrası köprü etkinleştirme** — Bir `bridge_admin` anahtarı (veya `qcb_bridge` lisans sahibi), tek bir imzalı işlemle (`tx bridge update-chain-config` / `set-verifier-bootstrap`) bağlı herhangi bir zincirin köprüsünü etkinleştirebilir — kontrat adresini, onay sayısını, mimariyi, durumu, aktif doğrulayıcıyı ve doğrulayıcı güven kökünü ayarlayarak — yönetişim önerisi veya zincir yükseltmesi olmadan.
* **Validator ağı lisans kapısı** — Orkestratör artık herhangi bir harici ağ istemcisini başlatmadan önce `validator_<chain>` / `qcb_bridge` lisansını (varsayılan-kapalı olarak) zorunlu kılar.
* **Cüzdan entegrasyon paketleri** — `@qorechain/wallet-adapter` ve `@qorechain/connect` npm'de yayımlandı (v0.1.0); tek çağrıyla MetaMask ağ kaydı (EIP-3085, EVM rayında **18 ondalıklı** yerel QOR) ve Keplr gaz fiyatı yapılandırması ekler.
* **IBC anahtar teslim relayer** — Sekiz IBC karşı tarafı için çalışmaya hazır relayer yapılandırması ve kanal önyükleme araçları; böylece kanallar dağıtım sonrasında özel kurulum gerektirmeden devreye girer.

## v3.1.77 — Köprü ve Yakma REST Uç Noktaları

**Sürüm odağı:** Zincirler arası ve arz modülleri için salt okunur REST erişimi.

* **Köprü REST uç noktaları** — Köprü modülü için salt okunur HTTP sorgu uç noktaları; köprü durumunu gRPC'ye ek olarak standart REST üzerinden sunar.
* **Yakma REST uç noktaları** — Yakma modülü için salt okunur HTTP sorgu uç noktaları; ücret dağıtımı ve arz verilerini standart REST üzerinden sorgulanabilir hale getirir.

## v3.1.76 — SVM Araç Zinciri Modernizasyonu

**Sürüm odağı:** Solana Virtual Machine uyumluluk yenilemesi.

* **Güncel araç zinciriyle program desteği** — SVM yürütmesi, güncel Solana araç zinciriyle derlenmiş programların QoreChain SVM çalışma zamanında çalışması için modernize edildi.

## v3.1.75 — Varsayılan Olarak SVM JSON-RPC

**Sürüm odağı:** Kutudan çıktığı gibi Solana uyumlu RPC.

* **Solana uyumlu JSON-RPC** — SVM JSON-RPC sunucusu artık varsayılan olarak etkindir (port **8899**) ve düğümle birlikte otomatik olarak başlatılır; SVM araçları için Solana uyumlu bir RPC arayüzü sağlar.

## v3.1.74 — Rollup Profil Ön Ayarları

**Sürüm odağı:** Rollup Development Kit kullanılabilirliği ve uzlaşma.

* **Profil ön ayarı uygulaması** — Rollup oluşturma artık seçilen profilin ön ayarını (DeFi, oyun, NFT, kurumsal veya tamamen özel) uygular; böylece yeni rollup'lar kullanım senaryolarına uygun makul varsayılanları devralır.
* **İyimser (optimistic) uzlaşma** — İyimser uzlaşma yolu (toplu gönderim ve itiraz) uçtan uca çalışır durumdadır.

## v3.1.73 — Post-Kuantum Hash Taban Çizgisi

**Sürüm odağı:** Varsayılan post-kuantum kriptografik taban çizgisinin tamamlanması.

* **Varsayılan hash olarak SHAKE-256** — SHAKE-256 (SHA-3 ailesi) varsayılan uygulama hash'i olarak benimsenmiştir; böylece **ML-DSA-87 (Dilithium-5)** imzaları, **ML-KEM-1024** anahtar kapsülleme ve **SHAKE-256** hash'lemeden oluşan varsayılan post-kuantum taban çizgisi tamamlanmıştır.

## v3.1.72 — Kararlılık ve Bakım

**Sürüm odağı:** Rutin kararlılık ve derleme hattı bakımı.

* **Kararlılık iyileştirmeleri** — Dışarıdan görünür davranış değişikliği olmadan iç kararlılık, bağımlılık ve derleme hattı bakımı.

## v3.1.71 — PQC Hibrit İmzalar Varsayılan Olarak Zorunlu

**Sürüm odağı:** Cosmos işlem yolunda varsayılan olarak açık post-kuantum güvenliği.

* **Hibrit imzalar varsayılan olarak zorunlu** — Post-kuantum hibrit imzalar artık Cosmos işlem yolunda varsayılan olarak zorunludur: her işlem, klasik **secp256k1** imzasının yanında bir post-kuantum **ML-DSA-87 (Dilithium-5)** imzası taşır.
* **Yönetişim kontrollü zorunluluk** — Zorunluluk modu yönetişim kontrolünde kalmaya devam eder; varsayılan değer **zorunlu (required)** olarak ayarlanmıştır.

## v3.1.70 — Üretim Sertleştirmesi

**Sürüm odağı:** Canlı ana ağ için üretim sertleştirmesi ve konsensüs optimizasyonu.

* **PRISM konsensüs optimizasyonu** — Canlı ağ koşullarında uyarlanabilir parametre ayarı için PRISM pekiştirmeli öğrenme optimizasyon katmanında devrilme önleyici (circuit-breaker) güvenlik kontrolleriyle sürekli iyileştirmeler.
* **Performans ve kararlılık** — Validator'lar ve tam düğümler genelinde iş hacmi, gecikme ve kaynak kullanımı iyileştirmeleri.
* **Operasyonel araçlar** — Ana ağ operatörleri için geliştirilmiş izleme, sorgu ve düğüm işletim ergonomisi.
* **Tokenomics v2.1 uyumu** — Ücret dağıtımı ve emisyon mekanikleri, sabit arzlı, sonlu emisyonlu ekonomik modelle hizalandı.

## v3.0.0 — Ana Ağ Genesis'i

**Sürüm odağı:** Ana ağ lansmanı ve token üretim etkinliği.

* **Ana ağ genesis'i** — QoreChain ana ağı (`qorechain-vladi`, EVM zincir kimliği 9801) **7 Haziran 2026** tarihinde, token üretim etkinliği (TGE) genesis'te olacak şekilde başlatıldı.
* **Beşli ücret paylaşımı** — Protokol ücret dağıtımı validator'lar, yakma, hazine, staker'lar ve hafif düğümler arasında (**37 / 30 / 20 / 10 / 3**) yapılır; özel bir hafif düğüm payı eklenmiştir.
* **Zincir üstü AMM** — Zincir üstü likidite havuzları ve takaslar için yerel otomatik piyasa yapıcı modülü (`x/amm`).
* **Zincir lisanslama** — Protokol yetkilendirmelerini kaydetmek ve yönetmek için zincir üstü lisans modülü (`x/license`).
* **Sertleştirilmiş uzlaşma paradigmaları** — RDK uzlaşma modları iyimser (optimistic), zk, based ve egemen (sovereign) olarak sonuçlandırıldı.

## v1.4.0 — Ana Ağ Öncesi Genişleme

**Sürüm odağı:** Ana ağ öncesinde zincirler arası kapsam ve sürüm adayı stabilizasyonu.

* **Genişletilmiş zincirler arası kapsam** — Daha geniş bir harici ağ kümesine ek IBC ve köprü bağlantısı.
* **Hafif düğüm katılımı** — Hafif düğümler ve ücret payı ödüllerinin altyapısı tanıtıldı.
* **Sürüm adayı sertleştirmesi** — Ana ağ genesis'ine hazırlık olarak tüm çekirdek modüllerde kapsamlı testler, denetimler ve stabilizasyon.

## v1.3.0 — Rollup Development Kit

**Sürüm odağı:** Egemen ve paylaşımlı güvenlikli rollup dağıtımları için yerel rollup altyapısı.

* **x/rdk modülü** — Dört uzlaşma paradigmasıyla tam Rollup Development Kit: iyimser (optimistic), zk, based ve egemen (sovereign)
* **5 ön ayarlı profil** — DeFi, oyun, NFT, kurumsal ve tamamen özel kullanım senaryoları için önceden yapılandırılmış rollup şablonları
* **Yerel veri erişilebilirliği** — Blob depolama, saklama yönetimi ve budama yaşam döngüsüne sahip zincir üstü DA katmanı
* **EndBlocker otomatik sonuçlandırması** — İtiraz penceresi sona erdiğinde operatör müdahalesi gerektirmeyen otomatik toplu sonuçlandırma
* **Yapay zeka destekli profil seçimi** — Hedeflenen kullanım senaryosuna göre en uygun rollup yapılandırmasını öneren `suggest-profile` sorgusu
* **Multilayer entegrasyonu** — Rollup'lar, multilayer mimarisinde katman olarak kaydolur; yönlendirme, çapalama ve itiraz mekaniklerini devralır
* **Bank emanet yaşam döngüsü** — Operatör stake'i rollup çalışırken emanette tutulur ve temiz kapanışta serbest bırakılır ya da slashing durumunda el konulur

## v1.2.0 — IBC ve Köprüler

**Sürüm odağı:** Zincirler arası bağlantı ve gelişmiş hesap soyutlamaları.

* **25 zincirler arası bağlantı** — Harici ağlara 8 IBC kanalı ve 17 QoreChain Bridge (QCB) bağlantısı
* **x/babylon modülü** — Bitcoin sahiplerinin QoreChain staking güvenliğine katılmasını sağlayan BTC yeniden stake etme entegrasyonu
* **x/abstractaccount modülü** — Programlanabilir harcama kuralları, oturum anahtarları ve özel kimlik doğrulama mantığına sahip akıllı hesap çerçevesi
* **x/fairblock modülü** — MEV'e dayanıklı işlem şifrelemesi için Eşik Kimlik Tabanlı Şifreleme (tIBE)
* **x/gasabstraction modülü** — Yerel QOR, IBC ile köprülenmiş USDC ve IBC ile köprülenmiş ATOM'u destekleyen çok tokenli gaz ödemesi
* **5 şeritli işlem önceliklendirmesi** — Önceliğe göre sıralanmış işlem şeritleri: sistem, yönetişim, staking, köprü ve genel
* **IBC relayer yapılandırmaları** — Desteklenen tüm IBC kanalları için önceden yapılandırılmış relayer kurulumları
* **Köprüden yakmaya entegrasyon** — Köprü ücretleri, yakma modülünün ücret dağıtımı üzerinden yönlendirilir

## v1.1.0 — PQC Hibrit İmzalar

**Sürüm odağı:** Post-kuantum kriptografik güvenlik ve algoritma esnekliği.

* **Çift secp256k1 (ECDSA) + ML-DSA-87 imzaları** — Her işlem, AnteHandler zincirinde doğrulanan hem klasik hem de post-kuantum bir imza taşır
* **3 zorunluluk modu** — Yapılandırılabilir hibrit imza zorunluluğu: kapalı (mod 0), esnek (mod 1, PQC isteğe bağlı), zorunlu (mod 2, PQC gerekli)
* **Otomatik kayıt** — PQC açık anahtarları ilk hibrit işlemde otomatik olarak kaydedilir; ayrı bir kayıt adımına gerek kalmaz
* **SHAKE-256 hash temeli** — Kuantuma dayanıklı adres türetimi için PQC ile ilgili tüm hash işlemleri SHAKE-256 (SHA-3 ailesi) kullanır
* **TEE doğrulama arayüzleri** — PQC anahtar üretim bütünlüğünü kanıtlamak için Güvenilir Yürütme Ortamı (TEE) doğrulama desteği
* **Algoritma esnekliği çerçevesi** — Gelecekteki PQC algoritmalarının zincir yükseltmesi olmadan yönetişim yoluyla eklenmesine olanak tanıyan takılabilir algoritma kayıt defteri

## v1.0.0 — Genesis (Tokenomics Motoru)

**Sürüm odağı:** Tam tokenomics, çoklu VM yürütmesi ve yapay zeka destekli operasyonlarla ilk protokol lansmanı.

* **x/burn modülü** — Validator'lar, yakma, hazine ve staker'lar arasında dörtlü dağıtıma sahip çok kanallı ücret yakma mekanizması
* **x/xqore modülü** — Kademeli erken çıkış cezaları ve PvP rebase yeniden dağıtımına sahip yönetişim staking türevi
* **x/inflation modülü** — Sonlu emisyonlu ekonomik modelle yönetilen, yıllık azalmalı epoch tabanlı emisyon
* **PRISM konsensüs katmanı** — Devrilme önleyici (circuit-breaker) güvenlik kontrolleriyle dinamik zincir parametresi ayarı için pekiştirmeli öğrenme optimizasyonu (PPO)
* **Üç havuzlu CPoS** — İtibar puanlarıyla ağırlıklandırılmış Emerald, Sapphire ve Ruby validator havuzlarına sahip Sınıflandırılmış Hisse Kanıtı (Classified Proof-of-Stake)
* **QDRW yönetişimi** — Havuzlar arasında ödül dağıtımında yönetişim onaylı ayarlamalara olanak tanıyan Dinamik Ödül Ağırlıklandırma sistemi
* **EVM + CosmWasm + SVM çalışma zamanları** — Eş zamanlı üç yürütme ortamı: QoreChain EVM Engine, CosmWasm akıllı kontratları ve Solana Virtual Machine
* **Çapraz VM köprüsü** — Tek bir blok içinde EVM, CosmWasm ve SVM çalışma zamanları arasında mesaj iletimi ve varlık transferleri
* **Post-kuantum kriptografi** — Yüksek performanslı bir PQC kütüphanesiyle desteklenen kuantuma dayanıklı imzalama
* **QCAI** — Dolandırıcılık tespiti, ücret tahmini ve ağ optimizasyonu için isteğe bağlı zincir dışı sidecar ile zincir üstü sezgisel analiz
* **Konteynerize dağıtım** — Sidecar servisi ve blok dizinleyici ile tam çok validatorlu test ağı dağıtımı
* **Blok dizinleyici** — Geçmiş sorgular ve analitik için kalıcı depolamaya sahip blok dinleyicisi
