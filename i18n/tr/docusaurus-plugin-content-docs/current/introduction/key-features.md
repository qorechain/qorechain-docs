---
slug: /introduction/key-features
title: Temel Özellikler
sidebar_label: Temel Özellikler
sidebar_position: 3
---

# Temel Özellikler

Aşağıdaki tablo, QoreChain'deki tüm büyük özellikleri, tanıtıldıkları sürüm aşamasına göre düzenlenmiş şekilde listeler. Mevcut zincir sürümü **v3.1.80**'dir; ana ağ (`qorechain-vladi`, EVM chain ID 9801) 7 Haziran 2026'dan beri yayında ve paralel bir test ağı (`qorechain-diana`, EVM chain ID 9800) çalışmaktadır.

| Özellik                    | Tanıtıldığı sürüm   | Açıklama                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PQC Hibrit İmzaları (varsayılan olarak zorunlu) | v1.1.0 (Güvenlik)   | Her cosmos yolu işleminde ikili imzalar: ML-DSA-87 (Dilithium-5) ile eşleştirilmiş klasik bir secp256k1 (ECDSA) imzası. v3.1.71 itibarıyla ağ varsayılanı **zorunlu (required)**'dur (`hybrid_signature_mode = required`, `allow_classical_fallback = false`) — yalnızca klasik cosmos işlemleri reddedilir; yalnızca genesis gentx'leri ve PQC anahtar kaydı/geçişi işlemleri muaftır. EVM işlemleri ayrı bir `eth_secp256k1` yolu kullanır ve etkilenmez. Üç yönetişim kontrollü uygulama modu (disabled / optional / required) mevcut kalır. TX uzantısı otomatik kaydı aracılığıyla sorunsuz cüzdan başlatma. |
| SHAKE-256 Varsayılan Karma (Hash)     | v1.1.0 (Güvenlik)   | SHA-3 ailesi genişletilebilir çıktı işlevi (XOF). v3.1.73 itibarıyla SHAKE-256 (`qorehash` paketi aracılığıyla) **varsayılan uygulama karmasıdır** ve PQC temel hattını (Dilithium-5 + ML-KEM-1024 + SHAKE-256) tamamlar. Değişken uzunlukta karma, sabit 32 baytlık çıktı, Merkle iç düğüm birleştirme ve etki alanı ayrımlı karma sağlar — hepsi FFI bağımlılığı olmadan saf Go ile. |
| TEE ve FL Arayüzleri      | v1.1.0 (Güvenlik)   | Güvenilir Yürütme Ortamı (TEE) doğrulaması (SGX, TDX, SEV-SNP, ARM CCA) ve Federe Öğrenme koordinasyonu (FedAvg, FedProx, SCAFFOLD toplama yöntemleri) için üretim sınıfı arayüz spesifikasyonları. Donanım-enklav AI çıkarımını ve kriptografik garantilerle gizliliği koruyan dağıtık model eğitimini mümkün kılar. |
| Zincir Üzeri RL Uzlaşısı (PRISM) | v1.0.0 (Genesis) | Go-yerel sabit noktalı bir MLP (73.733 parametre), PPO çıkarımını doğrudan blok yaşam döngüsünde çalıştırır. PRISM optimizasyon katmanı; harici oracle'lar olmadan blok süresini, gaz limitlerini ve doğrulayıcı havuz ağırlıklarını dinamik olarak ayarlar. Deterministik Taylor serisi matematiği, tüm doğrulayıcılar genelinde aynı sonuçları garanti eder. Dört çalışma modu: shadow, conservative, autonomous ve paused. Güvenlik için devre kesici koruması. |
| Üçlü Havuz Bileşik PoS  | v1.0.0 (Genesis)    | Doğrulayıcılar, QoreChain Uzlaşı Motoru üzerinde her 1.000 blokta bir RPoS (itibar ağırlıklı), DPoS (delegasyon ağırlıklı) ve PoS (standart) havuzlarına sınıflandırılır. Havuz ağırlıklı kura çekimi (sortition), blok üretimini saf stake hâkimiyetinin ötesinde çeşitlendirir. Özel bağ eğrisi; öz-bağlı stake, sadakat süresi, itibar kalitesi ve protokol aşamasını hesaba katar. |
| QDRW Yönetişimi            | v1.0.0 (Genesis)    | İtibar Ağırlıklandırmalı Kuadratik Delegasyon. Oy gücü, bir sigmoid itibar çarpanıyla sönümlenen bir karekök işlevi kullanır; bu da balina ele geçirmesini önlerken uzun vadeli dürüst katılımı ödüllendirir. 100x stake avantajı yaklaşık 10x oy gücü sağlar. xQORE varlıkları oy ağırlığını ikiye katlar. |
| Yakım Motoru                | v1.0.0 (Genesis)    | On farklı yakım kanalı: işlem ücretleri, yönetişim cezaları, kesinti (slashing), köprü ücretleri, spam caydırma, dönem fazlası, manuel yakımlar, sözleşme geri çağrıları, VM'ler arası ücretler ve rollup oluşturma yakımları. Toplanan ücretler **%37 doğrulayıcılara, %30 kalıcı yakım, %20 hazineye, %10 stake edenlere ve %3 hafif düğümlere** bölünür. |
| xQORE Stake Etme              | v1.0.0 (Genesis)    | QDRW oylarında iki katı yönetişim ağırlığı için QOR'u kilitleyerek 1:1 oranında xQORE basın. Kademeli çıkış cezaları (30 günün altında %50, 30-90 günde %35, 90-180 günde %15, 180 günden sonra %0), PvP yeniden tabanlama (rebase) aracılığıyla kalan sahiplere yeniden dağıtılır — kararlılığı ödüllendirir ve kısa vadeli sermayeyi cezalandırır. |
| Sabit Arzlı Emisyonlar     | v1.0.0 (Genesis)    | Toplam 4.500.000.000 QOR'luk sabit bir arz (TGE'de 80.000.000 yakıldı) ve 590.000.000 QOR'luk sonlu bir stake ödülü bütçesi: 1. Yıl %8–12 APY (127.500.000 QOR), 2. Yıl %6–10 APY (106.250.000 QOR), 3–4. Yıllar %5–8 APY (yılda 85.000.000 QOR) ve 5. Yıl ve sonrası yönetişimle belirlenir (~186.000.000 QOR kalan). Yakım motoruyla birleştiğinde, işlem hacmi arttıkça QOR net deflasyonist davranışa yakınsar. |
| EVM Çalışma Zamanı                | v1.0.0 (Genesis)    | EIP-1559 gaz fiyatlandırması, 8545 portunda JSON-RPC (`eth_`, `web3_`, `net_`, `txpool_`, `qor_` ad alanları) ve standart araç desteği (Hardhat, Foundry, Remix) ile tam Ethereum uyumluluğu. Mevcut Ethereum iş akışlarını kullanarak Solidity sözleşmeleri dağıtın ve bunlarla etkileşim kurun. |
| CosmWasm Çalışma Zamanı           | v1.0.0 (Genesis)    | Rust tabanlı sözleşmeler için WebAssembly akıllı sözleşme motoru. Tam yaşam döngüsü desteği: örnekleme (instantiate), yürütme, sorgulama ve geçiş (migrate). Sözleşmeler, deterministik yürütmeyle korumalı (sandboxed) bir Wasm ortamında çalışır. |
| SVM Çalışma Zamanı                | v1.0.0 (Genesis)    | Rust destekli bir yürütücü aracılığıyla BPF programı dağıtımı ve yürütmesi. 8899 portunda Solana uyumlu JSON-RPC sunucusu `getAccountInfo`, `getBalance`, `getSlot` ve daha fazlasını destekler. Mevcut Solana istemcileri ve araçları değişiklik olmadan çalışır. |
| VM'ler Arası Köprü            | v1.0.0 (Genesis)    | Üç VM'nin tamamı genelinde sorunsuz birlikte çalışabilirlik. EVM sözleşmeleri precompile aracılığıyla CosmWasm'ı çağırır; CosmWasm sözleşmeleri özel mesajlar aracılığıyla EVM'i çağırır; SVM programları asenkron olay tabanlı köprüleme yoluyla katılır. Tek bir zincir içinde senkron EVM-CosmWasm çağrıları ve asenkron SVM mesajlaşması. |
| Zincirler Arası Bağlantı   | v1.2.0 (Birlikte Çalışabilirlik)    | Sekiz IBC kanalı (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective) artı **36 harici zinciri kapsayan 37 QCB yapılandırması** (QoreChain'in kendisi yerel bir geri döngü olarak dahil). PQC imzalı doğrulayıcı doğrulamaları (attestations), zincir başına onay derinlikleri ve devre kesici hacim sınırları. Şu anda test ağı / beklemede durumunda — henüz üretimde değil. |
| BTC Yeniden Stake Etme (Restaking)              | v1.2.0 (Birlikte Çalışabilirlik)    | Bitcoin kesinlik garantileri için Babylon Protocol entegrasyonu. Doğrulayıcılar BTC stake pozisyonları kaydeder (minimum 100.000 satoshi). QoreChain dönem (epoch) durum kökleri, IBC ile aktarılan Babylon dönemleri aracılığıyla periyodik olarak Bitcoin'e kontrol noktası olarak işlenir; bu da BTC hashrate'i ile desteklenen ikincil bir kesinlik katmanı sağlar. |
| Hesap Soyutlama        | v1.2.0 (Birlikte Çalışabilirlik)    | Protokol katmanında programlanabilir akıllı hesaplar (ERC-4337'ye benzer). Üç hesap türü: çoklu imza (multisig), sosyal kurtarma ve oturum tabanlı. Granüler izinler ve sona erme ile oturum anahtarları, hesap başına günlük ve işlem başına harcama kuralları, kapsamlı denom izin listeleri ve uzlaşıda otomatik kural uygulaması. |
| MEV Koruması             | v1.2.0 (Birlikte Çalışabilirlik)    | Şifreli mempool'lar için FairBlock eşikli kimlik tabanlı şifreleme (tIBE) çerçevesi. İşlemler, dahil edilene kadar blok önericileri için kriptografik olarak opaktır; bu da öne geçme (front-running) ve sandviç saldırılarını ortadan kaldırır. FairBlockDecorator ante işleyicisi bağlı ve hazırdır; tIBE eşik şifre çözümü anahtar töreni dağıtımından sonra etkinleşir. |
| Gaz Soyutlama            | v1.2.0 (Birlikte Çalışabilirlik)    | Çoklu token gaz ödemesi, işlem ücretleri için yerel QOR tutma gereksinimini ortadan kaldırır. Kullanıcılar kabul edilen IBC ile aktarılan tokenlarla ödeme yapabilir: 1:1 oranında ibc/USDC ve 10:1 oranında ibc/ATOM. GasAbstractionDecorator, standart ücret düşümünden önce yerel olmayan ücret denomlarını doğrular ve dönüştürür. |
| 5 Şeritli Önceliklendirme      | v1.2.0 (Birlikte Çalışabilirlik)    | Blok alanı statik olarak beş öncelik şeridine bölünür: PQC (öncelik 100, %15 alan), MEV (90, %20), AI (80, %15), Default (50, %40) ve Free (10, %10). Güvenlik açısından kritik işlemler, yüksek hacimli standart trafik tarafından asla dışlanamaz. |
| Zincir Üzeri Likidite (AMM)   | v1.2.0 (Birlikte Çalışabilirlik)    | Yerel otomatik piyasa yapıcı (`x/amm`), protokol katmanında zincir üzeri likidite havuzları ve takaslar (swaps) sağlar. |
| RDK Rollup'ları                | v1.3.0 (Rollup'lar)    | Dört uzlaşı paradigması (optimistic, zk, based, sovereign), beş hazır profil (defi, gaming, nft, enterprise, custom), SHA-256 blob depolaması ve otomatik budamalı yerel DA yönlendirici, yapılandırılabilir oluşturma yakım oranına sahip banka emaneti (escrow) yaşam döngüsü, EndBlocker otomatik nihai uzlaşısı ve uzlaşı modülü aracılığıyla PRISM destekli yapılandırma ile Rollup Development Kit. Rollup yetenekleri bir ana zincir çerçevesi olarak sunulur. |
| Zincir Lisanslama            | v1.3.0 (Rollup'lar)    | `x/license` modülü, protokol-yerel zincir lisanslama sağlar. |

## Sürüm Geçmişi

<details>

<summary>v1.0.0 — Genesis sürümü</summary>

Çekirdek protokolü kuantum sonrası kriptografi (Dilithium-5, ML-KEM-1024), PRISM zincir üzeri pekiştirmeli öğrenme uzlaşı katmanı, VM'ler arası mesajlaşmalı üçlü VM çalışma zamanı (EVM, CosmWasm, SVM), sabit arzlı tokenomik motoru (yakım, xQORE, sonlu emisyon bütçesi), Üçlü Havuz Bileşik PoS doğrulayıcı seçimi, QDRW kuadratik yönetişim ve AI işlem işleme hattıyla kurdu.

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
