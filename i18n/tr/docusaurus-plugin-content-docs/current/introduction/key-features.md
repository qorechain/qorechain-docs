---
slug: /introduction/key-features
title: Temel Özellikler
sidebar_label: Temel Özellikler
sidebar_position: 3
---

# Temel Özellikler

Aşağıdaki tablo, QoreChain'deki tüm büyük özellikleri, tanıtıldıkları sürüm aşamasına göre düzenlenmiş şekilde listeler. 7 Haziran 2026'dan beri yayında olan mainnet (`qorechain-vladi`, EVM chain ID 9801), **v3.2.5** çalıştırır (29 Ekim 2026'da 3.906.833 yüksekliğinde uygulandı; v3.2.4, 23 Ekim'de 3.742.566 yüksekliğinde uygulanmıştı); paralel test ağı (`qorechain-diana`, EVM chain ID 9800) 27 Ekim 2026'dan beri v3.2.6 çalıştırmaktadır. Özellik listesinin sonundaki [Özellik Durumu](#feature-status) tablosu, bugün canlı ağlarda nelerin etkin olduğunu gösterir.

| Özellik                    | Tanıtıldığı sürüm   | Açıklama                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PQC Hibrit İmzaları (varsayılan olarak zorunlu) | v1.1.0 (Güvenlik)   | Her cosmos yolu işleminde ikili imzalar: ML-DSA-87 (Dilithium-5) ile eşleştirilmiş klasik bir secp256k1 (ECDSA) imzası. v3.1.71 itibarıyla ağ varsayılanı **zorunlu (required)**'dur (`hybrid_signature_mode = required`, `allow_classical_fallback = false`) — yalnızca klasik cosmos işlemleri reddedilir; yalnızca genesis gentx'leri ve PQC anahtar kaydı/geçişi işlemleri muaftır. EVM işlemleri `eth_secp256k1` imzalarını korur, ancak v3.2.0'dan itibaren yalnızca kayıtlı bir ML-DSA-87 anahtarına sahip ve açık bir [EVM yetkilendirme penceresi](/getting-started/first-transaction#evm-window) bulunan bir hesaptan kabul edilir. Üç yönetişim kontrollü uygulama modu (disabled / optional / required) mevcut kalır. |
| SHAKE-256 Varsayılan Karma (Hash)     | v1.1.0 (Güvenlik)   | SHA-3 ailesi genişletilebilir çıktı işlevi (XOF). v3.1.73 itibarıyla SHAKE-256 (`qorehash` paketi aracılığıyla) **varsayılan uygulama karmasıdır** ve PQC temel hattını (Dilithium-5 + ML-KEM-1024 + SHAKE-256) tamamlar. Değişken uzunlukta karma, sabit 32 baytlık çıktı, Merkle iç düğüm birleştirme ve etki alanı ayrımlı karma sağlar — hepsi FFI bağımlılığı olmadan saf Go ile. |
| TEE ve FL Arayüzleri      | v1.1.0 (Güvenlik)   | Güvenilir Yürütme Ortamı (TEE) doğrulaması (SGX, TDX, SEV-SNP, ARM CCA) ve Federe Öğrenme koordinasyonu (FedAvg, FedProx, SCAFFOLD toplama yöntemleri) için arayüz spesifikasyonları (henüz uygulama yok); ikisi de gelecekteki bir sürüm için planlanmıştır. |
| Zincir Üzeri RL Uzlaşısı (PRISM) | v1.0.0 (Genesis) | Go-yerel sabit noktalı bir MLP (73.733 parametre), PPO çıkarımı için blok yaşam döngüsüne yerleştirilmiştir. PRISM; blok süresini, gaz fiyatını ve havuz ağırlıklarını ayarlamak üzere tasarlanmıştır; canlı ağlarda şu anda yalnızca gözlemler (eğitilmiş bir politika yüklü değildir ve kontrol mesajları devre dışıdır). Deterministik Taylor serisi matematiği, tüm doğrulayıcılar genelinde aynı sonuçları vermek üzere tasarlanmıştır. Dört çalışma modu (shadow, conservative, autonomous, paused); mainnet conservative olarak ayarlıdır, testnet ise gölge modunda çalışır (neyi ayarlayacağını kaydeder, hiçbir şeyi değiştirmez). Güvenlik için devre kesici koruması. |
| Üçlü Havuz Bileşik PoS  | v1.0.0 (Genesis)    | Tasarım: doğrulayıcılar her 1.000 blokta bir RPoS (itibar ağırlıklı), DPoS (delegasyon ağırlıklı) ve PoS (standart) havuzlarına sınıflandırılır. Havuz ağırlıklı kura çekimi (sortition), blok üretimini saf stake hâkimiyetinin ötesinde çeşitlendirir ve özel bir bağ eğrisi öz-bağlı stake, sadakat süresi, itibar kalitesi ve protokol aşamasını hesaba katar. `x/qca` içinde uygulanmıştır ancak **blok üretiminde, ödüllerde veya slashing'de henüz etkin değildir**; blok önerisi ve slashing şu anda standart stake ağırlıklı kuralları izler. |
| QDRW Yönetişimi            | v1.0.0 (Genesis)    | İtibar Ağırlıklandırmalı Kuadratik Delegasyon. Oy gücü, bir sigmoid itibar çarpanıyla sönümlenen bir karekök işlevi kullanacak şekilde tasarlanmıştır; bu da balina ele geçirmesini önlerken uzun vadeli dürüst katılımı ödüllendirir (100x stake avantajı yaklaşık 10x oy gücü sağlar; xQORE varlıkları oy ağırlığını ikiye katlar). Uygulanmıştır ancak **canlı ağlarda devre dışıdır** (`qdrw` kapalıdır); teklifler şu anda bağlanmış (bonded) stake üzerinden sayılır. |
| Yakım Motoru                | v1.0.0 (Genesis)    | On iki yakım kaynağı (gaz ücretleri, sözleşme oluşturma, AI hizmet ücretleri, köprü ücretleri, hazine geri alımı, başarısız işlemler, xQORE cezaları, otomatik geri alım, TGE yakımı, rollup oluşturma, işlem sayısı kilometre taşları ve AMM); mainnet'te şimdiye kadar yalnızca gaz ücreti ve başarısız işlem kanallarında yakım kaydedilmiştir. Ücret toplayıcıdaki her şey, dönem (epoch) emisyonu dahil, **%37 doğrulayıcılara, %30 kalıcı yakım, %20 hazineye, %10 stake edenlere ve %3 hafif düğümlere** bölünür. |
| xQORE Stake Etme              | v1.0.0 (Genesis)    | Henüz canlı değil: modülün kilitleme ve açma işlemleri canlı ağlara bağlı değildir (bkz. [xQORE Stake Etme](/user-guide/xqore-staking)). Tasarlanan davranış: QDRW oylarında iki katı yönetişim ağırlığı için QOR'u kilitleyerek 1:1 oranında xQORE basın. Kademeli çıkış cezaları (30 günün altında %50, 30-90 günde %35, 90-180 günde %15, 180 günden sonra %0), PvP yeniden tabanlama (rebase) aracılığıyla kalan sahiplere yeniden dağıtılır — kararlılığı ödüllendirir ve kısa vadeli sermayeyi cezalandırır. |
| Üst Sınırlı Emisyon     | v1.0.0 (Genesis)    | Sonlu bir arz yolu: genesis'te 4.420.000.000 QOR (planlanan 4.500.000.000 QOR'dan 80.000.000 QOR TGE'de yakıldı) artı `x/inflation` tarafından 590.000.000 QOR'luk katı bir kümülatif üst sınır altında basılan stake emisyonu (`fixed` modunda 43.200 blokluk dönem başına 86.000 QOR; Ekim 2026'daki 10 numaralı yönetişim önerisinden beri). Yakımlar tokenları kalıcı olarak ortadan kaldırır. Bkz. [Tokenomik](/architecture/tokenomics#supply-and-emission). |
| EVM Çalışma Zamanı                | v1.0.0 (Genesis)    | EIP-1559 gaz fiyatlandırması, 8545 portunda JSON-RPC (`eth_`, `web3_`, `net_` ve `txpool_` ad alanları; `qor_` ad alanı henüz sunulmamaktadır) ve standart araç desteği (Hardhat, Foundry, Remix) ile tam Ethereum uyumluluğu. Mevcut Ethereum iş akışlarını kullanarak Solidity sözleşmeleri dağıtın ve bunlarla etkileşim kurun; v3.2.0'dan itibaren gönderenin kayıtlı bir kuantum sonrası anahtara ve açık bir [EVM yetkilendirme penceresine](/getting-started/first-transaction#evm-window) ihtiyacı vardır. |
| QoreChain Native Çalışma Zamanı           | v1.0.0 (Genesis)    | QoreChain'in CosmWasm çalışma zamanı için kullandığı ad: Rust tabanlı sözleşmeler için WebAssembly akıllı sözleşme motoru. Tam yaşam döngüsü desteği: örnekleme (instantiate), yürütme, sorgulama ve geçiş (migrate). Sözleşmeler, deterministik yürütmeyle korumalı (sandboxed) bir Wasm ortamında çalışır. Kod yükleme ve örnekleme şu anda her iki ağda da **devre dışıdır** (yönetişim ayarı artı devre kesici). |
| SVM Çalışma Zamanı                | v1.0.0 (Genesis)    | Rust destekli bir yürütücü aracılığıyla BPF programı dağıtımı ve yürütmesi. 8899 portunda Solana uyumlu JSON-RPC sunucusu `getAccountInfo`, `getBalance`, `getSlot` ve daha fazlasını destekler. Okuma yöntemleri genel uç noktalarda çalışır; SVM işlem hattı şu anda ağ genelinde **devre dışıdır**. |
| VM'ler Arası Köprü            | v1.0.0 (Genesis)    | Üç VM'nin tamamı genelinde sorunsuz birlikte çalışabilirlik. EVM sözleşmeleri precompile aracılığıyla QoreChain Native'ı çağırır (henüz etkin değil, bkz. [Ağ durumu](/developer-guide/evm-precompiles#network-status)); QoreChain Native sözleşmeleri özel mesajlar aracılığıyla EVM'i çağırır; SVM programları asenkron olay tabanlı köprüleme yoluyla katılır. Tek bir zincir içinde senkron EVM-QoreChain Native çağrıları ve asenkron SVM mesajlaşması. VM'ler arası çağrı mesajı şu anda mainnet'te kapalıdır. |
| Zincirler Arası Bağlantı   | v1.2.0 (Birlikte Çalışabilirlik)    | En fazla sekiz IBC karşı tarafı (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective) artı **37 QCB zincir yapılandırması (36 harici zincir artı IBC üzerinden Injective)** için tasarlanmıştır. PQC imzalı doğrulayıcı doğrulamaları (attestations), zincir başına onay derinlikleri ve devre kesici hacim sınırları. Ekim 2026 itibarıyla 37 zincir yapılandırmasının tamamı `pending` durumundadır ve planlanan hiçbir karşı tarafa açık bir IBC kanalı yoktur (mainnet'te hiç yoktur; testnet'te bir test kanalı vardır) — **canlı değil**. |
| BTC Yeniden Stake Etme (Restaking)              | v1.2.0 (Birlikte Çalışabilirlik)    | Tasarım aşaması — modülün işlemleri canlı ağlarda etkin değildir. Bitcoin kesinlik garantileri için Babylon Protocol entegrasyonu. Doğrulayıcılar BTC stake pozisyonları kaydeder (minimum 100.000 satoshi). QoreChain dönem (epoch) durum kökleri, IBC ile aktarılan Babylon dönemleri aracılığıyla periyodik olarak Bitcoin'e kontrol noktası olarak işlenir; bu da BTC hashrate'i ile desteklenen ikincil bir kesinlik katmanı sağlar. |
| Hesap Soyutlama        | v1.2.0 (Birlikte Çalışabilirlik)    | Protokol katmanında programlanabilir akıllı hesaplar (ERC-4337'ye benzer). Üç hesap türü: çoklu imza (multisig), sosyal kurtarma ve oturum tabanlı. Granüler izinler ve sona erme ile oturum anahtarları, hesap başına günlük ve işlem başına harcama kuralları ve kapsamlı denom izin listeleri. Uygulanmıştır ancak **mainnet'te kapalıdır** (`abstractaccount.enabled = false`) ve testnet'te etkindir (kullandığınız ağda `GET /qorechain/abstractaccount/v1/config` adresini kontrol edin). |
| MEV Koruması             | v1.2.0 (Birlikte Çalışabilirlik)    | Şifreli mempool'lar için FairBlock eşikli kimlik tabanlı şifreleme (tIBE) çerçevesi; işlemleri dahil edilene kadar blok önericileri için opak tutmak üzere tasarlanmıştır. FairBlockDecorator ante işleyicisi bağlıdır; tIBE eşik şifre çözümü anahtar töreni dağıtımından sonra etkinleşir. Şu anda her iki ağda da **devre dışıdır** (`enabled = false`). |
| Gaz Soyutlama            | v1.2.0 (Birlikte Çalışabilirlik)    | Kullanıcıların ücretleri kabul edilen yerel olmayan bir tokenla ödemesine izin vermek üzere tasarlanmıştır; canlı kabul edilen token listesi yalnızca `uqor` içerir. Her iki ağda da `ibc/USDC` veya `ibc/ATOM` kabul edilmez, bu nedenle ücretler şu anda QOR ile ödenir. |
| 5 Şeritli Önceliklendirme      | v1.2.0 (Birlikte Çalışabilirlik)    | Şerit tanımları (PQC, MEV, AI, Default, Free) yapılandırma olarak mevcuttur, ancak blok alanı şeritleri canlı mempool veya öneri işleyicisi tarafından uygulanmaz. |
| Zincir Üzeri Likidite (AMM)   | v1.2.0 (Birlikte Çalışabilirlik)    | Yerel otomatik piyasa yapıcı (`x/amm`), protokol katmanında zincir üzeri likidite havuzları ve takaslar (swaps) sağlar. Modül canlıdır; henüz hiçbir havuz oluşturulmamıştır. |
| RDK Rollup'ları                | v1.3.0 (Rollup'lar)    | Dört uzlaşı paradigması (optimistic, zk, based, sovereign), beş hazır profil (defi, gaming, nft, enterprise, custom), SHAKE-256 blob depolaması ve otomatik budamalı yerel DA yönlendirici, yapılandırılabilir oluşturma yakım oranına sahip banka emaneti (escrow) yaşam döngüsü, EndBlocker otomatik nihai uzlaşısı ve uzlaşı modülü aracılığıyla PRISM destekli yapılandırma ile Rollup Development Kit. Rollup yetenekleri bir ana zincir çerçevesi olarak sunulur; canlı ağlarda henüz hiçbir rollup oluşturulmamıştır. |
| Zincir Lisanslama            | v1.3.0 (Rollup'lar)    | `x/license` modülü, protokol-yerel zincir lisanslama sağlar. |

## Özellik Durumu (Ekim 2026) {#feature-status}

20 Ekim 2026'da canlı ağlara karşı doğrulanmıştır (mainnet v3.2.4; v3.2.5'ten etkilenen satırlar mainnet'te 30 Ekim 2026'da yeniden kontrol edilmiştir); satırlardaki testnet'e özgü notlar 27 Ekim 2026'da yeniden kontrol edilmiştir (testnet v3.2.6). "Canlı", yeteneğin mainnet üzerinde (ve bir satır aksini belirtmedikçe testnet üzerinde de) etkin olduğu anlamına gelir; yukarıdaki açıklamalar her özelliğin ne yapmak üzere tasarlandığını söyler.

| Yetenek | Canlı ağlardaki durum |
| --- | --- |
| Hibrit ML-DSA-87 + secp256k1 imzaları (Cosmos hattı) | **Canlı**, zorunlu (`hybrid_signature_mode = required`) |
| EVM yetkilendirme penceresi | v3.2.0'dan beri **canlı** (isteğe bağlı kapsam sınırlaması v3.2.3'ten beri) |
| Zaman kilitli stake (`x/stakingtier`, isteğe bağlı) | v3.2.4'ten beri **canlı** (testnet'te 19 Ekim 2026'dan beri, mainnet'te 23 Ekim 2026'dan beri) |
| v3.2.5 protokol özellikleri (yerel ML-KEM anahtar kayıt defteri, yönetişimle belirlenen cross-VM izin listesi, yönetişimle belirlenen CosmWasm dağıtımı, batch sırasıyla RDK uzlaşması ve açık itiraz çözümü, oylarını koruyan hızlandırılmış teklifler) | mainnet'te 29 Ekim 2026'dan beri (3.906.833 yüksekliği) ve testnet'te 26 Ekim 2026'dan beri **canlı**. Cross-VM çağrısı ve CosmWasm örneklemesi mainnet'te hâlâ kapalıdır ve hiçbir EVM precompile etkin değildir; bkz. [Sürüm Geçmişi](/appendix/version-history#v325) |
| EVM, QoreChain Native, SVM çalışma zamanları | EVM **canlı**; QoreChain Native kod yükleme ve örnekleme **devre dışı** (yönetişim ayarı artı devre kesici); SVM işlem hattı **devre dışı** (okumalar çalışır) |
| Yakım motoru ve ücret bölüşümü (37/30/20/10/3) | **Canlı**; mainnet'te yalnızca gaz ücreti ve başarısız işlem yakım kanallarında yakım kaydedilmiştir |
| Üst sınırlı emisyon (`x/inflation`) | **Canlı**, dönem başına sabit 86.000 QOR, 590.000.000 QOR üst sınırına kadar (mainnet) |
| Stake etme, slashing, yönetişim | **Canlı** (standart modüller; bkz. [Zincir Parametreleri](/appendix/chain-parameters)) |
| Hafif düğüm ödülleri | Ödül muhasebesi **canlı**; kayıt **açık** ve lisansa bağlı, her ağda bir hafif düğüm kayıtlı (27 Ekim 2026'da kontrol edildi; bkz. [durum](/light-node/overview#reward-program-status)) |
| AMM (`x/amm`) | Modül **canlı**, henüz havuz oluşturulmadı (27 Ekim 2026'da kontrol edildi); testnet'te ayrıca havuzlanabilen Fest test token'ları vardır |
| PRISM (`x/rlconsensus`) | Mainnet'te **yalnızca gözlem** (yüklü politika yok); testnet'te gölge modunda bir gösterim politikası çalışır ve önerilen eylemleri uygulamadan kaydeder |
| Üçlü Havuz CPoS / QDRW (`x/qca`) | Uygulanmış, blok üretimine, ödüllere veya oy sayımına **bağlı değil** |
| xQORE (`x/xqore`) | Yalnızca muhasebe — **henüz kilitleme/açma işlemi yok** |
| Akıllı hesaplar / bağlı cüzdanlar (`x/abstractaccount`) | Uygulanmış, **mainnet'te kapalı** (`enabled = false`); testnet'te etkin (27 Ekim 2026'da kontrol edildi) |
| Rollup Development Kit (`x/rdk`), çok katmanlı | Modüller **canlı**, henüz rollup veya katman oluşturulmadı |
| Zincirler arası köprü, IBC, Babylon yeniden stake etme | **Beklemede** — 37 zincir yapılandırmasının tamamı `pending`, mainnet'te açık IBC kanalı yok (testnet'te bir test kanalı var), yeniden stake etme işlemi yok |
| FairBlock MEV koruması | **Devre dışı** (`enabled = false`) |
| EVM precompile'ları, `qor_` JSON-RPC ad alanı | Mainnet: **etkin değil / sunulmuyor** (etkin precompile listesi boş). Testnet: üç precompile etkin (PQC Verify, PQC Key Status, PRISM Consensus Params), 27 Ekim 2026'da kontrol edildi |

## Sürüm Geçmişi

<details>

<summary>v1.0.0 — Genesis sürümü</summary>

Çekirdek protokolü kuantum sonrası kriptografi (Dilithium-5, ML-KEM-1024), PRISM zincir üzeri pekiştirmeli öğrenme uzlaşı katmanı, VM'ler arası mesajlaşmalı üçlü VM çalışma zamanı (EVM, QoreChain Native, SVM), tokenomik motoru (yakım, xQORE, emisyon modülü), Üçlü Havuz Bileşik PoS doğrulayıcı seçimi, QDRW kuadratik yönetişim ve AI işlem işleme hattıyla kurdu.

</details>

<details>

<summary>v1.1.0 — Güvenlik sağlamlaştırma sürümü</summary>

Klasik bir secp256k1 (ECDSA) imzasını ML-DSA-87 ile eşleştiren hibrit imza mimarisini, üç yönetişim kontrollü uygulama moduyla; gelecekte Merkle ağacı değişimi için SHAKE-256 kuantum sonrası karma temelini; ve TEE doğrulaması (SGX, TDX, SEV-SNP, ARM CCA) ile federe öğrenme koordinasyonu (FedAvg, FedProx, SCAFFOLD) için üretim sınıfı arayüz spesifikasyonlarını tanıttı.

</details>

<details>

<summary>v1.2.0 — Birlikte çalışabilirlik ve UX sürümü</summary>

Zincirler arası bağlantı (8 IBC kanalı + 36 harici zinciri kapsayan 37 QCB yapılandırması, şu anda test ağında/beklemede), Babylon Protocol aracılığıyla BTC yeniden stake etme, oturum anahtarları ve sosyal kurtarmalı akıllı hesap soyutlama, FairBlock MEV koruma çerçevesi, çoklu token gaz soyutlama, zincir üzeri likidite (`x/amm`) ve 5 şeritli blok alanı önceliklendirme eklendi.

</details>

<details>

<summary>v1.3.0 — Rollup ekosistemi sürümü</summary>

Dört uzlaşı paradigması (optimistic, zk, based, sovereign), beş hazır dağıtım profili (defi, gaming, nft, enterprise, custom), yerel bir DA yönlendirici, banka emaneti (escrow) yaşam döngüsü yönetimi, EndBlocker güdümlü otomatik nihai uzlaşı, PRISM destekli rollup yapılandırması ve zincir lisanslama (`x/license`) ile Rollup Development Kit'i gönderdi. Otomatik yan zincir kaydı ve durum sabitleme için çok katmanlı mimari modülüyle derin entegrasyon.

</details>

## İlgili

* [QoreChain Nedir](/introduction/what-is-qorechain) — bağlam içinde platforma genel bakış.
* [Tokenomik](/architecture/tokenomics) — QOR'un arkasındaki ekonomik model.
* [Köprü Mimarisi](/architecture/bridge-architecture) — zincirler arası bağlantı ve BTC yeniden stake etme.
* [Rollup'lara Genel Bakış](/rollups/overview) — Rollup Development Kit ve uzlaşı paradigmaları.
