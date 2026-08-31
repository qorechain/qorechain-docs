---
slug: /appendix/version-history
title: Sürüm Geçmişi
sidebar_label: Sürüm Geçmişi
sidebar_position: 3
---

# Sürüm Geçmişi

QoreChain için genel sürüm geçmişi. En son sürüm **v3.1.95**'tir ve **`qorechain-vladi`** ana ağında (EVM zincir kimliği **9801**, 7 Haziran 2026'dan beri canlı) çalışır. Test ağı **`qorechain-diana`** (EVM zincir kimliği **9800**) yayın öncesi derlemeleri takip eder.

:::note
Aşağıdaki kayıtlar üst düzey yetenek özetleridir. Daha eski `v1.x` kayıtları, ana ağdan önce gelen test ağı yayın hattının tarihsel kaydı olarak saklanmaktadır.
:::

---

## v3.1.95 — Cosmos EVM Sertleştirmesi (Mevcut Sürüm)

**Sürüm odağı:** EVM bakiye muhasebesi kütüphanesine yönelik kademeli güvenlik güncellemesi.

* **Taşma sertleştirmesi** — Bir EVM bakiye-güncelleme yolu, artık aşırı bir taşma durumunda sessizce sarmalanmak yerine güvenli bir şekilde başarısız oluyor. Konsensüsü bozmayan, kademeli bir güncelleme olarak sunuldu — hiçbir yönetişim oylaması veya koordineli durdurma yüksekliği gerekmedi.

## v3.1.94 — Emisyon Tavanı ve Yönetimsel Mesaj Sertleştirmesi

**Sürüm odağı:** Stake ödülü emisyonunu gerçek ağ koşullarıyla uyumlu hale getirmek ve yetkili yönetimsel mesajlar üzerindeki yetkilendirme denetimlerini sıkılaştırmak.

* **Emisyon tavanı** — Tam bonded-stake desteğiyle kabul edilip 2.122.074 yüksekliğinde (26 Ağustos 2026) uygulanan bir yönetişim önerisi, orijinal azalan emisyon takvimini, sert ve kümülatif bir tavan altında dönem başına sabit bir tutarla değiştirdi. Orijinal takvim, çok daha olgun, tamamen bonded bir ağ için kalibre edilmişti; gerçek bonded stake'e karşı, amaçlanandan çok daha hızlı ödeme yapıyordu. Güncel rakamlar ve kalan pist için bkz. [Tokenomics](/architecture/tokenomics#staking-reward-schedule).
* **Yönetimsel mesaj sertleştirmesi** — Bir dizi yetkili, yetki-korumalı yönetimsel mesajın imzalayanı artık mesajın kendisinde taşınan bir değere güvenmek yerine yönetişim modülünün kendi adresine karşı doğrulanıyor.
* Ayrıca, doğrudan bu sürüme güncelleme yapan herhangi bir düğüm için v3.1.92'deki düğüm devreye alma güvenilirliği düzeltmesini de taşıyor.

## v3.1.92 — Düğüm Senkronizasyon Güvenilirliği

**Sürüm odağı:** Anlık görüntülerden ve yayınlanan zincir arşivinden daha güvenilir düğüm devreye alma.

* **Anlık görüntü ve arşiv senkronizasyon düzeltmesi** — Bir durum-senkronizasyonu anlık görüntüsünden veya yayınlanan zincir arşivinden geri yükleme yapan bir düğümün, belirli geçmiş bloklardan sonra senkronizasyonu tamamlayamama sorunu giderildi. Her iki yol üzerinden devreye alma artık güvenilir şekilde tamamlanıyor.

## v3.1.90 — Işık Düğümü Çalışma Süresi Muhasebesi

**Sürüm odağı:** Işık düğümü ödül uygunluğu için ölçülen çalışma süresi artık zaman içinde tutarlı biçimde birikiyor.

* **İleriye doğru biriken çalışma süresi** — Bir ışık düğümünün ödül uygunluğu çalışma süresi, artık her kendi kaydından itibaren, o andaki geçerli kalp atışı aralığında ileriye doğru beklenen kalp atışı sayısını biriktirerek hesaplanıyor; tüm geçmişinin, o an geçerli olan aralığa göre yeniden hesaplanması yerine. Bu nedenle kalp atışı aralığındaki bir yönetişim değişikliği yalnızca bundan sonrasını etkiler ve bir düğümün geçmiş performansını asla geriye dönük olarak yeniden derecelendirmez.

## v3.1.86 — Doğrulayıcı Kurtarma Güvencesi

**Sürüm odağı:** Bir doğrulayıcı artık kesinti hapishanesinden kurtulmakta kalıcı olarak kilitli kalamaz.

* **Hapishane kilidi düzeltmesi** — Kayıtlı bir kuantum-sonrası anahtarı olmayan bir doğrulayıcı operatör hesabı, hibrit imza zorunluluğu klasik yedeği devre dışı bırakılmış şekilde zorunlu olarak ayarlansa bile, artık her zaman kesinti hapishanesinden kurtulmak için `MsgUnjail` gönderebilir. Daha önce böyle bir hesabın kurtulma yolu yoktu, çünkü hapisten çıkmak zaten gönderilmesi engellenmiş bir işlem göndermeyi gerektiriyordu.
* **Durum-senkronizasyonu anlık görüntüleri** — Anlık görüntü üretimi ağ genelinde etkinleştirildi; bu sayede yeni doğrulayıcılar ve tam düğümler, tam bir geçmiş yeniden oynatma yerine durum senkronizasyonu ile hızlıca katılabilir.

## v3.1.85 — Bağlı Cüzdanlar Üzerinden Yetkili Harcama

**Sürüm odağı:** Bağlı bir harici cüzdan anahtarı (Phantom, MetaMask) artık tek kurallı kuantum-sonrası hesaptan — en az ayrıcalık izinleri, harcama limitleri ve anında iptal altında — **harcama** yapabilir.

* **Yetkilendirici yürütme hatları** — Kayıtlı bir yetkilendiricinin, hesap sahibi mevcut olmadan kurallı hesaptan transferleri yetkilendirmesini sağlayan iki yeni mesaj: **`MsgExecuteEVM`** (hesabın `0x…` adresinden bir EVM çağrısı/transferi) ve **`MsgExecuteCosmos`** (bir Native-hattı banka gönderimi). Bir **röle (relayer)**, zarfı gönderir ve ücretini öder — kendi hibrit PQC imzası işlem gereksinimlerini karşılar — yetkilendiricinin alan-ayrımlı, tekrar-oynatmaya karşı bağlanmış imza baytları üzerindeki imzası ise yetkilendirmenin ta kendisidir. Harici anahtarın hiçbir zaman bir ML-DSA ortak imzasına ihtiyacı olmaz.
* **Yetkilendirici olarak MetaMask** — secp256k1 yetkilendiricileri artık (33 baytlık sıkıştırılmış anahtar biçimine ek olarak) **20 baytlık Ethereum adresleriyle** kaydedilebilir ve **EIP-191 `personal_sign`** ile doğrulanabilir; böylece standart bir MetaMask hesabı bağlanıp limitler dahilinde harcama yapabilir.
* **Her üç hatta da uygulama** — İzin kapsamları ve **SpendingRule** değer limitleri (işlem başına + günlük tavanlar) Native, EVM ve SVM hatlarının tümünde uygulanır; anahtar yönetimi mesajları hiçbir zaman devredilemez. Farklı hata kodları, cüzdanların doğru mesajı göstermesini sağlar: `5` harcama limiti aşıldı, `6` yetkilendirici süresi doldu, `10` izin reddedildi, `11` tekrar oynatma reddedildi.
* **İzin şeması sorgusu** — `GET /qorechain/abstractaccount/v1/permission_schema` (ayrıca gRPC/CLI üzerinden), kurallı izin taksonomisini (11 izin), mesaj→izin eşlemesini ve devredilemez mesaj listesini döndürür; böylece cüzdanlar kapsamları sabit kodlamadan doğrulayabilir.
* **Aynı algoritmalı PQC anahtar rotasyonu** — Yeni **`MsgRotatePQCKey`**, bir hesabın ML-DSA-87 anahtarını aynı algoritma içinde döndürür (eski ve yeni anahtarlarla çift imzalı); bu, eski türetilmiş anahtarların kurallı adrese bağlı türetmeye geçişini ve ele geçirilmiş bir anahtarın emekliye ayrılmasını sağlar. Yeni CLI: `tx pqc rotate-key` ve `tx pqc recover-key` (bir anımsatıcı ifadeden deterministik anahtar kurtarma).
* **Kök anahtar işlemleri etkilenmedi** — Değişiklikler eklemelidir; normal cüzdan, borsa ve Keplr akışları değişmemiştir. Düğüm operatörleri, ağ yükseltme yüksekliğine kadar **v3.1.85** sürümünde olmalıdır.

## v3.1.84 — Yetkilendirici İzinleri ve Harcama Limitleri

**Sürüm odağı:** Yetkili harcamanın arkasındaki izin modeli.

* **Kurallı izin taksonomisi** — Başarısızlıkta-kapalı bir mesaj→izin eşlemesiyle on bir izin (`all`, `send`, `delegate`, `withdraw`, `vote`, `evm`, `wasm`, `svm`, `amm`, `ibc`, `deploy`): eşlenmemiş bir mesaj türü reddedilir ve anahtar yönetimi mesajları hiçbir zaman devredilemez.
* **SpendingRule uygulaması** — İzin verilen para birimi listeleriyle birlikte işlem başına ve gün başına (UTC) harcama tavanları, her (hesap, yetkilendirici) çifti için uygulanır ve kaydedilir.
* **SVM hattı yetkilendirmesi** — Yabancı-şemalı bir anahtar (örn. Phantom ed25519) tarafından SVM hattında yetkilendirilen eylemler, aynı merkezi yetkilendirme kapısından geçer.

## v3.1.83 — Her Üç Arayüzde Birleştirilmiş Hesap İmzalama

**Sürüm odağı:** Tek anahtar, tek hesap — Cosmos, EVM ve SVM arayüzlerinde artık yalnızca bakiye tutmakla kalmayıp **imzalayabilen** tek bir birleşik kimlik.

* **Her hatta imzalayan tek anahtar** — Eth-native olarak oluşturulmuş bir hesap (adres = secp256k1 ortak anahtarının keccak'ı), artık EVM işlemlerine ek olarak Cosmos-hattı işlemlerini de `eth_secp256k1` şemasıyla imzalar. Onun `qor1…` (Cosmos), `0x…` (EVM) ve Solana-VM (base58) biçimleri, hem **tek bir bakiye tutan** hem de **her üç hatta harcama yapan** — kuantum-sonrası hibrit (ML-DSA-87) Cosmos işlemleri dahil — tek bir 20 baytlık kimliktir.
* **Kuantum-sonrası imzalama değişmedi** — Birleşik hesap, ML-DSA-87 anahtarını hâlâ kaydeder ve zincirin gerektirdiği FIPS-204 hibrit imzayı taşır; klasik kısım coinType-118 şeması yerine `eth_secp256k1` (keccak) olur. Mevcut coinType-118 hesapları bundan etkilenmez.
* **Konsensüs-tarafsız kademeli yükseltme** — Her iki ağda da **yeniden genesis yapılmadan ve zincir durmadan** kademeli bir ikili (binary) yükseltme olarak sunuldu. Hesap bakiyeleri, geçmişi ve genesis değişmedi.
* **İstemci araçları** — `@qorechain/wallet-adapter` 0.1.5, eth-native Cosmos imzalama (`signClassicalEth` / `signHybridEth`), birleşik 3-adres üretimi ve `walletFromSeed` (herhangi 32 baytlık bir tohumdan — örn. bir Phantom imzasından — kurallı hesabı türetme) ekler; `@qorechain/chain-bridge` bir `eth_secp256k1` imzalama yolu kazanır.

:::caution Düğüm operatörleri — yükseltme gerekli
Tam düğümler **v3.1.83+** çalıştırmalıdır. v3.1.83 öncesi bir düğüm, eth-native (`eth_secp256k1`) bir işlemi çözemez ve bir blokta böyle bir işlem göründüğünde senkronizasyonu durdurur. Güncel paketi [download.qore.host](https://download.qore.host) adresinden indirin.
:::

## v3.1.82 — SVM Üzerinde Yerel QOR Canlıda + Entegratör Etkinleştirmesi

**Sürüm odağı:** Her iki ağda çalışan SVM yerel-QOR birleştirmesi, artı bir borsa veya entegratörün bağlanmak için ihtiyaç duyduğu her şey.

* **Her üç arayüzde canlı birleşik yerel-QOR bakiyesi** — SVM birleştirmesinin (v3.1.81) ana ağda ve test ağında canlı olduğu doğrulandı: aynı hesap, Cosmos'ta `uqor` (6 ondalık basamak), EVM'de wei-tarzı 18 ondalık basamak ve Solana-uyumlu arayüzde lamport (9 ondalık basamak; 1 uqor = 1.000 lamport) olarak görünen tek bir bakiye tutar.
* **Doğrulanmış genel uç noktalar** — Her iki ağda da konsensüs RPC, REST, EVM JSON-RPC ve SVM JSON-RPC için genel HTTPS uç noktaları, artı genel [blok gezgini](https://explore.qore.network). Bkz. [Ağlar](/appendix/networks).
* **İndirmeler** — Sürümlü düğüm ikili paketleri, ana ağ genesis'i ve (SHA-256 sağlama toplamlarıyla) taze zincir verisi anlık görüntüleri [download.qore.host](https://download.qore.host) adresinde yayınlandı.
* **İstemci yığını genelinde deterministik kuantum-sonrası imzalama** — `@qorechain/pqc` 0.1.1, altı dil bağlamasının tümünde ML-DSA-87'yi zincirin kabul ettiğiyle eşleşecek şekilde deterministik olarak (FIPS-204 §3.4) imzalar; `@qorechain/wallet-adapter` 0.1.2, hibrit işlem imzalama için bunun üzerine inşa edilir.
* **Entegratör kılavuzu** — Üç arayüz genelinde para yatırma, para çekme ve düğüm işlemlerini kapsayan yeni [Borsa ve Entegratör Kılavuzu](/developer-guide/exchange-integration).

## v3.1.81 — SVM Yerel-QOR Birleştirmesi

**Sürüm odağı:** Solana-uyumlu arayüzde birinci sınıf bir varlık olarak yerel QOR.

* **SVM üzerinde yerel QOR** — SVM çalışma zamanı artık hesabın yerel QOR bakiyesini, ayrı bir yalnızca-SVM bakiyesi tutmak yerine doğrudan (lamport cinsinden) yüzeye çıkarıyor. `getBalance` ve `getSignaturesForAddress`, yerel fonlar üzerinde çalışır ve Sistem Programı transferleri yerel QOR'u hareket ettirir.
* **SVM adres eşlemesi** — Bir hesabın SVM adresi, 20 baytlık hesap baytlarından (32 bayta sağdan doldurularak, base58 kodlamalı) türetilir; böylece tek bir anahtarın Cosmos, EVM ve SVM adresleri aynı fonlara işaret eder.

## v3.1.80 — Çok Katmanlı Durum-Çıpası Sorguları

**Sürüm odağı:** Rollup'lar için okunabilir, çevrimdışı doğrulanabilir yerleşim çıpaları.

* **Çıpa okuma sorguları** — `x/multilayer` sorgu servisi artık `Anchor`'ı (bir katmanın en son durum çıpası) ve `Anchors`'ı (bir katmanın çıpa geçmişi) sunuyor; böylece istemciler bir katmanın yerleşim çıpasını alıp bağımsız olarak doğrulayabilir.
* **Çok katmanlı için REST ağ geçidi** — Her çok katmanlı sorgu (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) artık gRPC'ye ek olarak REST üzerinden de kullanılabilir.
* **Kuantuma dayanıklı yerleşim makbuzları açıldı** — Her çıpa, kurallı alanları üzerinde bir **ML-DSA-87 (Dilithium-5)** imzası taşır ve bu, Rollup Geliştirme Kiti'nin çevrimdışı yerleşim-makbuzu doğrulaması için zincir üzerindeki temeli sağlar.

## v3.1.79 — Köprü Ağları için Doğrulayıcı Otomatik Hazırlama

**Sürüm odağı:** Lisanslı doğrulayıcılar için bağlı ağlarda anahtar teslim katılım.

* **Ağ sürücüsü çerçevesi** — İlgili `validator_<chain>` (veya `qcb_bridge`) lisansına sahip bir QoreChain doğrulayıcısının, yalnızca lisans etkinleştirildikten sonra eşleşen harici ağ istemcisinin aynı düğümde QoreChain orkestrasyonu altında hazırlanmasını, yapılandırılmasını ve çalıştırılmasını sağlayan bildirim tabanlı bir sürücü çerçevesi.
* **37 köprü ağının tümü için sürücüler** — Kapsam, katılım modeline (izinsiz doğrulayıcı, sınırlı/seçilmiş/kabul, L2 tam düğüm ve doğrulama-yapmayan/güven-listeli roller) göre sınıflandırılmış, bağlı her ağı içerir. Harici ağ stake'i ve imzalama anahtarları, ağ başına operatör tarafından sağlanmaya devam eder; QoreChain çerçeveyi ve zorunlu lisans kapısını sunar.

## v3.1.78 — Devreye Almadan Önce Hazır Olma

**Sürüm odağı:** Cüzdanlar, köprüler, IBC ve lisanslama, devreye almadan sonra hiçbir yönetişime gerek kalmadan lansmanda çalışır.

* **Güvensiz-taraf devreye alma sonrası köprü etkinleştirmesi** — Bir `bridge_admin` anahtarı (veya `qcb_bridge` lisans sahibi), tek bir imzalı işlemle (`tx bridge update-chain-config` / `set-verifier-bootstrap`) bağlı herhangi bir zincirin köprüsünü etkinleştirebilir — sözleşme adresini, onay sayılarını, mimariyi, durumu, etkin doğrulayıcıyı ve doğrulayıcı güven kökünü ayarlayarak — hiçbir yönetişim önerisi veya zincir yükseltmesi olmadan.
* **Doğrulayıcı-ağ lisans kapısı** — Orkestratör artık herhangi bir harici ağ istemcisini başlatmadan önce `validator_<chain>` / `qcb_bridge` lisansını (başarısızlıkta-kapalı) uygular.
* **Cüzdan entegrasyon paketleri** — `@qorechain/wallet-adapter` ve `@qorechain/connect` npm'e yayınlandı (v0.1.0); tek çağrılık MetaMask ağ kaydı (EIP-3085, EVM rayında **18 ondalık basamaklı** yerel QOR) ve Keplr gaz-fiyatı yapılandırması ekler.
* **IBC anahtar teslim röle** — Sekiz IBC karşı tarafı için hazır-çalıştırılabilir röle yapılandırması ve kanal başlatma araçları; böylece kanallar devreye almadan sonra özel bir kurulum gerektirmeden ayağa kalkar.

## v3.1.77 — Köprü ve Yakma REST Uç Noktaları

**Sürüm odağı:** Çapraz zincir ve arz modülleri için yalnızca-okunur REST erişimi.

* **Köprü REST uç noktaları** — Köprü modülü için, köprü durumunu gRPC'ye ek olarak standart REST üzerinden de sunan yalnızca-okunur HTTP sorgu uç noktaları.
* **Yakma REST uç noktaları** — Yakma modülü için yalnızca-okunur HTTP sorgu uç noktaları; ücret dağıtımı ve arz verisini standart REST üzerinden sorgulanabilir kılıyor.

## v3.1.76 — SVM Araç Zinciri Modernizasyonu

**Sürüm odağı:** Solana Sanal Makinesi uyumluluk yenilemesi.

* **Güncel araç zinciri program desteği** — SVM yürütmesi, güncel Solana araç zinciriyle derlenmiş programların QoreChain SVM çalışma zamanında çalışacağı şekilde modernize edildi.

## v3.1.75 — Varsayılan Olarak SVM JSON-RPC

**Sürüm odağı:** Kutudan çıktığı gibi çalışan Solana-uyumlu RPC.

* **Solana-uyumlu JSON-RPC** — SVM JSON-RPC sunucusu artık varsayılan olarak etkin (port **8899**) ve düğümle birlikte otomatik olarak başlıyor; SVM araçları için Solana-uyumlu bir RPC arayüzü sağlıyor.

## v3.1.74 — Rollup Profil Ön Ayarları

**Sürüm odağı:** Rollup Geliştirme Kiti kullanılabilirliği ve yerleşim.

* **Profil ön ayarı uygulaması** — Rollup oluşturma artık seçilen profilin ön ayarını (DeFi, oyun, NFT, kurumsal veya tamamen özel) uyguluyor; böylece yeni rollup'lar kullanım durumlarına uygun makul varsayılanları devralıyor.
* **İyimser yerleşim** — İyimser yerleşim yolu (toplu gönderim ve itiraz) uçtan uca çalışır durumda.

## v3.1.73 — Kuantum-Sonrası Özet (Hash) Temeli

**Sürüm odağı:** Varsayılan kuantum-sonrası kriptografik temelin tamamlanması.

* **Varsayılan özet olarak SHAKE-256** — SHAKE-256 (SHA-3 ailesi), varsayılan uygulama özeti olarak benimsendi; bu, **ML-DSA-87 (Dilithium-5)** imzaları, **ML-KEM-1024** anahtar kapsülleme ve **SHAKE-256** özetlemeden oluşan varsayılan kuantum-sonrası temeli tamamlıyor.

## v3.1.72 — Kararlılık ve Bakım

**Sürüm odağı:** Rutin kararlılık ve derleme hattı bakımı.

* **Kararlılık iyileştirmeleri** — Dışarıdan görünür herhangi bir davranış değişikliği olmadan iç kararlılık, bağımlılık ve derleme hattı bakımı.

## v3.1.71 — PQC Hibrit İmzalar Varsayılan Olarak Zorunlu

**Sürüm odağı:** Cosmos işlem yolunda varsayılan olarak açık kuantum-sonrası güvenlik.

* **Varsayılan olarak gerekli imzalar** — Kuantum-sonrası hibrit imzalar artık Cosmos işlem yolunda varsayılan olarak zorunlu: her işlem, klasik **secp256k1** imzasının yanında bir kuantum-sonrası **ML-DSA-87 (Dilithium-5)** imzası taşır.
* **Yönetişim tarafından kontrol edilen zorunluluk** — Zorunluluk modu yönetişim tarafından kontrol edilmeye devam ediyor; varsayılan olarak **gerekli** ayarlandı.

## v3.1.70 — Üretim Sertleştirmesi

**Sürüm odağı:** Canlı ana ağ için üretim sertleştirmesi ve konsensüs optimizasyonu.

* **PRISM konsensüs optimizasyonu** — Canlı ağ koşulları altında uyarlanabilir parametre ayarlaması için PRISM pekiştirmeli öğrenme optimizasyon katmanında, devre kesici güvenlik kontrolleriyle birlikte devam eden iyileştirmeler.
* **Performans ve kararlılık** — Doğrulayıcılar ve tam düğümler genelinde verim, gecikme ve kaynak kullanımı iyileştirmeleri.
* **Operasyonel araçlar** — Ana ağ operatörleri için geliştirilmiş izleme, sorgu ve düğüm işletme ergonomisi.
* **Tokenomics v2.1 uyumu** — Ücret dağıtımı ve emisyon mekaniği, sabit arzlı, sonlu-emisyonlu ekonomik modelle uyumlu hale getirildi.

## v3.0.0 — Ana Ağ Genesis'i

**Sürüm odağı:** Ana ağ lansmanı ve token üretim etkinliği.

* **Ana ağ genesis'i** — QoreChain ana ağı (`qorechain-vladi`, EVM zincir kimliği 9801), genesis'te token üretim etkinliği (TGE) ile birlikte **7 Haziran 2026**'da başlatıldı.
* **Beş yönlü ücret bölünmesi** — Doğrulayıcılar, yakma, hazine, stake sahipleri ve ışık düğümleri arasında protokol ücreti dağıtımı (**37 / 30 / 20 / 10 / 3**); ışık düğümleri için özel bir pay ekliyor.
* **Zincir üzerinde AMM** — Zincir üzerinde likidite havuzları ve takaslar için yerel otomatik piyasa yapıcı (AMM) modülü (`x/amm`).
* **Zincir lisanslama** — Protokol yetkilerini kaydetmek ve yönetmek için zincir üzerinde lisans modülü (`x/license`).
* **Sertleştirilmiş yerleşim paradigmaları** — RDK yerleşim modları iyimser, zk, based ve sovereign olarak kesinleşti.

## v1.4.0 — Ana Ağ Öncesi Genişleme

**Sürüm odağı:** Ana ağ öncesinde çapraz zincir kapsamı ve yayın-adayı stabilizasyonu.

* **Genişletilmiş çapraz zincir kapsamı** — Daha geniş bir harici ağ kümesine ek IBC ve köprü bağlantısı.
* **Işık düğümü katılımı** — Işık düğümleri ve ücret-payı ödülleri için temel tanıtıldı.
* **Yayın-adayı sertleştirmesi** — Ana ağ genesis'ine hazırlıkta tüm çekirdek modüller genelinde kapsamlı test, denetim ve stabilizasyon.

## v1.3.0 — Rollup Geliştirme Kiti

**Sürüm odağı:** Egemen ve paylaşılan-güvenlik rollup dağıtımları için yerel rollup altyapısı.

* **x/rdk modülü** — Dört yerleşim paradigmasıyla tam Rollup Geliştirme Kiti: iyimser, zk, based ve sovereign
* **5 ön ayarlı profil** — DeFi, oyun, NFT, kurumsal ve tamamen özel kullanım durumları için önceden yapılandırılmış rollup şablonları
* **Yerel veri kullanılabilirliği** — Blob depolama, saklama yönetimi ve budama yaşam döngüsüne sahip zincir üzerinde DA katmanı
* **EndBlocker otomatik kesinleştirme** — İtiraz penceresi sona erdiğinde, operatör müdahalesi olmadan otomatik toplu kesinleştirme
* **AI destekli profil seçimi** — Amaçlanan kullanım durumuna göre en uygun rollup yapılandırmasını öneren `suggest-profile` sorgusu
* **Çok katmanlı entegrasyon** — Rollup'lar, çok katmanlı mimaride katman olarak kaydolur ve yönlendirme, çıpalama ve itiraz mekaniğini devralır
* **Banka teminat yaşam döngüsü** — Operatör stake'i, rollup işletimi sırasında teminatta tutulur ve temiz kapanışta serbest bırakılır veya slashing'de kaybedilir

## v1.2.0 — IBC ve Köprüler

**Sürüm odağı:** Çapraz zincir bağlantısı ve gelişmiş hesap soyutlamaları.

* **25 çapraz zincir bağlantısı** — Harici ağlara 8 IBC kanalı ve 17 QoreChain Köprüsü (QCB) bağlantısı
* **x/babylon modülü** — Bitcoin sahiplerinin QoreChain stake güvenliğine katılmasını sağlayan BTC yeniden-stake entegrasyonu
* **x/abstractaccount modülü** — Programlanabilir harcama kuralları, oturum anahtarları ve özel kimlik doğrulama mantığına sahip akıllı hesap çerçevesi
* **x/fairblock modülü** — MEV'e dayanıklı işlem şifrelemesi için Eşik Kimlik-Tabanlı Şifreleme (tIBE)
* **x/gasabstraction modülü** — Yerel QOR, IBC-köprülenmiş USDC ve IBC-köprülenmiş ATOM'u destekleyen çoklu-token gaz ödemesi
* **5 hatlı işlem önceliklendirmesi** — Sistem, yönetişim, stake, köprü ve genel şeklinde önceliğe göre sıralanmış işlem hatları
* **IBC röle yapılandırmaları** — Desteklenen tüm IBC kanalları için önceden yapılandırılmış röle kurulumları
* **Köprüden yakmaya entegrasyon** — Köprü ücretleri, yakma modülünün ücret dağıtımı üzerinden yönlendirilir

## v1.1.0 — PQC Hibrit İmzalar

**Sürüm odağı:** Kuantum-sonrası kriptografik güvenlik ve algoritma çevikliği.

* **Çift secp256k1 (ECDSA) + ML-DSA-87 imzalar** — Her işlem, AnteHandler zincirinde doğrulanan hem klasik hem de kuantum-sonrası bir imza taşır
* **3 zorunluluk modu** — Yapılandırılabilir hibrit imza zorunluluğu: kapalı (mod 0), izin verici (mod 1, PQC isteğe bağlı), zorunlu (mod 2, PQC gerekli)
* **Otomatik kayıt** — PQC ortak anahtarları, ayrı bir kayıt adımını ortadan kaldırarak ilk hibrit işlemde otomatik olarak kaydedilir
* **SHAKE-256 özet temeli** — PQC ile ilgili tüm özetleme işlemleri, kuantuma dayanıklı adres türetimi için SHAKE-256 (SHA-3 ailesi) kullanır
* **TEE tanıklama arayüzleri** — PQC anahtar üretimi bütünlüğünü kanıtlamak için Güvenilir Yürütme Ortamı tanıklama desteği
* **Algoritma çevikliği çerçevesi** — Gelecekteki PQC algoritmalarının bir zincir yükseltmesi olmadan yönetişim yoluyla eklenmesine izin veren eklenebilir algoritma kaydı

## v1.0.0 — Genesis (Tokenomics Motoru)

**Sürüm odağı:** Tam tokenomics, çoklu-VM yürütme ve AI destekli operasyonlarla başlangıç protokol lansmanı.

* **x/burn modülü** — Doğrulayıcılar, yakma, hazine ve stake sahipleri arasında dört yönlü dağıtıma sahip çok kanallı ücret yakma mekanizması
* **x/xqore modülü** — Kademeli erken-kilit açma cezaları ve PvP rebase yeniden dağıtımına sahip yönetişim stake türevi
* **x/inflation modülü** — Sonlu-emisyon ekonomik modeli tarafından yönetilen, yıllık düşüşe sahip dönem-tabanlı emisyon
* **PRISM konsensüs katmanı** — Dinamik zincir parametre ayarlaması için pekiştirmeli öğrenme optimizasyonu (PPO), devre kesici güvenlik kontrolleriyle
* **Üçlü havuzlu CPoS** — İtibar puanlarına göre ağırlıklandırılmış Emerald, Sapphire ve Ruby doğrulayıcı havuzlarına sahip Sınıflandırılmış Stake Kanıtı
* **QDRW yönetişimi** — Havuzlar genelinde ödül dağıtımına yönetişim onaylı ayarlamalara izin veren Dinamik Ödül Ağırlıklandırma sistemi
* **EVM + CosmWasm + SVM çalışma zamanları** — QoreChain EVM Motoru, CosmWasm akıllı sözleşmeleri ve Solana Sanal Makinesi olmak üzere üç eşzamanlı yürütme ortamı
* **VM'ler arası köprü** — Tek bir blok içinde EVM, CosmWasm ve SVM çalışma zamanları arasında mesaj geçişi ve varlık transferleri
* **Kuantum-sonrası kriptografi** — Yüksek performanslı bir PQC kütüphanesi tarafından desteklenen kuantuma dayanıklı imzalama
* **QCAI** — Dolandırıcılık tespiti, ücret tahmini ve ağ optimizasyonu için isteğe bağlı bir çevrimdışı yan bileşenle birlikte zincir üzerinde sezgisel analiz
* **Konteynerleştirilmiş dağıtım** — Yan bileşen servisi ve blok indeksleyicisiyle tam çoklu-doğrulayıcı test ağı dağıtımı
* **Blok indeksleyicisi** — Geçmiş sorgulama ve analiz için kalıcı depolamaya sahip blok dinleyici
