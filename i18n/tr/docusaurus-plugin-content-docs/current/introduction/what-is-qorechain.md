---
slug: /introduction/what-is-qorechain
title: QoreChain Nedir?
sidebar_label: QoreChain Nedir?
sidebar_position: 1
---

# QoreChain Nedir?

QoreChain; genesis'te kuantum sonrası kriptografi, AI-yerel işlem işleme ve tek bir zincir üzerinde EVM, QoreChain Native (CosmWasm çalışma zamanı) ile SVM programlarını yürüten üçlü VM çalışma zamanıyla inşa edilmiş ilk Katman 1 (Layer 1) blok zinciridir. QoreChain, mevcut bir protokole kuantum direncini sonradan eklemek yerine, modern genel amaçlı bir blok zincirinden beklenen geliştirici deneyimi ve birlikte çalışabilirliği sunarken hem klasik hem de kuantum saldırganlarına karşı güvenli olacak şekilde sıfırdan tasarlanmıştır.

Ana ağ (`qorechain-vladi`, EVM chain ID **9801**) 7 Haziran 2026'dan beri yayında ve zincir sürümü **v3.2.3**'ü (20 Ekim 2026'da yönetişim tarafından uygulandı) 3.742.566 yüksekliğine kadar, **v3.2.4**'ü ise o bloktan itibaren çalıştırıyor (yönetişim önerisi 13). Hazırlama (staging) ve entegrasyon testi için paralel olarak bir genel test ağı (`qorechain-diana`, EVM chain ID **9800**, 19 Ekim 2026'dan beri v3.2.4 çalıştırıyor) çalışmaktadır. Yerel token, hesaplar için `qor` ve doğrulayıcılar için `qorvaloper` Bech32 önekleriyle **QOR** (görüntüleme) / **uqor** (taban, 10^6)'dur. Zincir, Cosmos SDK v0.53 üzerine kuruludur.

## Çekirdek Yenilikler

### 1. Kuantum Sonrası Kriptografi

QoreChain; dijital imzalar için NIST tarafından standartlaştırılmış ML-DSA-87 (Dilithium-5), anahtar kapsülleme için ML-KEM-1024 ve varsayılan uygulama karması olarak SHAKE-256 kullanır; bu da hem klasik hem de kuantum bilgisayarların saldırılarına karşı güvenlik sağlar. Hibrit imzalar artık cosmos işlem yolunda **varsayılan olarak zorunludur**: her cosmos yolu işlemi, klasik secp256k1 (ECDSA) imzasının *yanında* bir işlem uzantısı olarak bir Dilithium-5 (ML-DSA-87) imzası taşımalıdır. Yalnızca klasik cosmos işlemleri reddedilir — düşürme (downgrade) yolu kapalıdır (yalnızca genesis gentx'leri, PQC anahtar kaydı/geçişi işlemleri ve kayıtlı anahtarı olmayan bir operatör hesabından yapılan unjail muaftır). EVM şeridi standart `eth_secp256k1` imzasını korur; böylece Ethereum araçları değişmeden imzalar, ancak v3.2.0'dan itibaren bir EVM işlemi yalnızca kayıtlı bir ML-DSA-87 anahtarı ve açık bir **EVM yetkilendirme penceresi** olan bir hesaptan kabul edilir — kuantum sonrası imzalı bir Cosmos şeridi mesajıyla açılan, sınırları belirli bir izin (bkz. [EVM yetkilendirme penceresi](/getting-started/first-transaction#evm-window)). Yalnızca klasik bir anahtar artık EVM şeridinde fon hareket ettiremez. Üç yönetişim kontrollü uygulama modu (disabled, optional, required) mevcut kalır, ancak mevcut ağ varsayılanı **required**'dur. Bir algoritma çevikliği çerçevesi, kriptografik standartlar evrildikçe imza şemalarının yönetişim önerileri aracılığıyla yükseltilebilmesini sağlar.

### 2. AI-Yerel İşleme

**PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines), blok yaşam döngüsüne yerleştirilmiş zincir üzeri bir pekiştirmeli öğrenme katmanıdır — devre kesici güvenlik sınırlarına sahip, 73,733 parametreli sabit noktalı bir PPO politika ağı. Şu anda gözlem modunda çalışır: canlı ağlar her 10 blokta bir gözlem ve ödül kaydeder, eğitilmiş hiçbir politika yüklü değildir; dolayısıyla bugün onun tarafından ayarlanan hiçbir uzlaşı parametresi yoktur. İstatistiksel izolasyon ormanı anomali tespiti ve çok boyutlu risk puanlaması, ante işleyici zincirinde her işlemi değerlendirerek dolandırıcı örüntüleri yürütmeden önce işaretler. Dinamik ücret optimizasyonu, taban ücretleri gerçek zamanlı ağ koşullarına göre ayarlar. Tüm zincir üzeri AI çıkarımı, doğrulayıcılar genelinde tamamen deterministik olacak şekilde tasarlanmıştır — aynı girdiler, harici oracle bağımlılığı olmadan aynı çıktıları üretir.

### 3. Üçlü VM Çalışma Zamanı

QoreChain, tek bir uzlaşı içinde üç sanal makineyi yerel olarak çalıştıran tek Katman 1'dir:

* **EVM** — EIP-1559 gaz fiyatlandırması ve 8545 portunda JSON-RPC ile tam Ethereum uyumluluğu. Standart araçları (Hardhat, Foundry, Remix) kullanarak Solidity sözleşmeleri dağıtın.
* **QoreChain Native** — Tam yaşam döngüsü desteğiyle (örnekleme, yürütme, sorgulama, geçiş) Rust ile yazılmış WebAssembly akıllı sözleşmeleri.
* **SVM** — 8899 portunda Solana uyumlu bir JSON-RPC sunucusuyla BPF programı dağıtımı ve yürütmesi. Mevcut Solana istemcileri ve araçları kutudan çıktığı gibi çalışır.

VM'ler arası mesajlaşma, üç çalışma zamanının tamamının iletişim kurmasını sağlar: EVM sözleşmeleri precompile aracılığıyla QoreChain Native'ı çağırır (bu precompile etkinleştirildiğinde), QoreChain Native sözleşmeleri özel mesajlar aracılığıyla EVM'i çağırır ve SVM programları asenkron olay tabanlı köprüleme yoluyla katılır. Bugün canlı ağlarda yalnızca EVM çalışma zamanı işlem kabul eder: QoreChain Native kodu yükleme ve örnekleme devre dışıdır, SVM işlem şeridi devre dışıdır, hiçbir EVM precompile'ı etkin değildir ve VM'ler arası çağrı mesajı ana ağda kapalıdır.

### 4. Sabit Üst Sınırlı Emisyonlu Tokenomik

Yakım motoru, merkezi bir yakım muhasebe modülünü besleyen **on iki yakım kaynağı** tanımlar (gaz ücretleri, sözleşme oluşturma, AI hizmet ücretleri, köprü ücretleri, hazine geri alımı, başarısız işlemler, xQORE cezaları, otomatik geri alım, TGE yakımı, rollup oluşturma, işlem sayısı kilometre taşları ve AMM); ana ağda şimdiye kadar yalnızca gaz ücreti ve başarısız işlem kanallarında yakım kaydedilmiştir. Ücret toplayıcıya giren her şey **%37 doğrulayıcılara, %30 kalıcı yakım, %20 hazineye, %10 stake edenlere ve %3 hafif düğümlere** bölünür. Bu bölüşüm hem işlem ücretlerine hem de dönem emisyonuna uygulanır. xQORE yönetişim stake tasarımı, kullanıcıların iki katı yönetişim ağırlığı için QOR kilitlemesine olanak tanır; erken çıkış cezaları kalan sahiplere yeniden dağıtılır. Kilitleme ve kilit açma işlemleri henüz canlı ağlara bağlanmamıştır.

QOR'un **sonlu bir arz yolu** vardır: genesis'te **4,420,000,000 QOR** (4,500,000,000 QOR planlanmıştı; bunun 80,000,000 QOR'u genesis öncesi token üretim etkinliğinde yakıldı), **590,000,000 QOR'luk sert kümülatif üst sınır** altında basılan stake emisyonu ve token'ları kalıcı olarak ortadan kaldıran yakım motoru. `x/inflation` modülü, üst sınıra ulaşılana kadar her 43,200 bloklu dönemde sabit bir miktar basar (Ekim 2026'daki 10 numaralı yönetişim önerisinden beri 86,000 QOR); ardından ödüller yalnızca işlem ücretlerinden gelir. Güncel rakamlar ve takvim için [Tokenomik](/architecture/tokenomics#supply-and-emission) bölümüne bakın.

### 5. Zincirler Arası Bağlantı

QoreChain, iki tamamlayıcı protokol aracılığıyla geniş bir blok zinciri ekosistemi grubuna bağlanacak şekilde tasarlanmıştır: yerel IBC ve QoreChain Bridge (QCB). Köprü katmanı **37 zincir yapılandırması (36 harici zincir artı IBC üzerinden ulaşılan Injective)** ve en fazla **8 IBC karşı tarafı** tanımlar. Zincirler arası katman **hiçbir ağda canlı değildir**: 37 zincir yapılandırmasının tamamı `pending` durumundadır ve hiçbir IBC kanalı açık değildir. Aşağıdaki rakamlar hedeflenen kapsamı açıklar.

* **En fazla 8 IBC karşı tarafı** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon ve Injective. İstemci güncellemeleri, hatalı davranış (misbehaviour) tespiti ve otomatik paket temizleme ile önceden yapılandırılmış aktarıcı (relayer) şablonları.
* **37 QCB zincir yapılandırması (36 harici zincir artı IBC üzerinden Injective)** — her uç nokta, tür başına adres doğrulaması, yapılandırılabilir onay derinliği, devre kesici hacim sınırları ve PQC imzalı doğrulayıcı doğrulamaları (attestations) içerecek şekilde tasarlanmıştır. Hedeflenen harici zincirler şunlardır:
  * **Temel (10):** Ethereum, Solana, TON, BSC, Avalanche, Polygon, Arbitrum, Optimism, Base, Sui
  * **EVM ailesi (14):** zkSync Era, Linea, Scroll, Blast, Mantle, Hyperliquid, Berachain, Sonic, Sei, Monad, Plasma, Filecoin FVM, Cronos, Kaia
  * **EVM olmayan (5):** Starknet, XRP Ledger, Stellar, Hedera, Algorand
  * **Beklemede (7):** NEAR, Bitcoin, Cardano, Polkadot, Tezos, Tron, Aptos

Mimari, ekosistem genelinde geniş birlikte çalışabilirlik sağlamak için her büyük zincir türünü — EVM, Solana (SVM), Move tabanlı (Sui, Aptos), Cosmos/IBC, UTXO ve diğer EVM olmayan aileler — kapsar.

### 6. Rollup Development Kit

`x/rdk` modülü, doğrudan QoreChain ana zinciri üzerinde uygulamaya özgü rollup'lar dağıtmak için protokol-yerel bir çerçevedir. Rollup desteği bir ana zincir çerçevesi olarak sunulur; belirli dağıtım iddiaları hedeflenen yetenekler olarak değerlendirilmelidir. Dört uzlaşı paradigması desteklenir:

* **Optimistic** — 7 günlük itiraz penceresi olan dolandırıcılık kanıtları (fraud proofs), EndBlocker tarafından otomatik nihai uzlaşıya bağlanır.
* **ZK (Sıfır Bilgi)** — Doğrulamada anlık kesinlik ile SNARK veya STARK kanıtları.
* **Based** — Yaklaşık 2 ana blokta kesinlikle L1 sıralı işlemler.
* **Sovereign** — Veri erişilebilirliği için yalnızca QoreChain'i kullanan bağımsız zincirler.

Beş hazır profil (**defi, gaming, nft, enterprise, custom**), önceden yapılandırılmış uzlaşı modları, blok süreleri, VM seçimleri, DA arka uçları ve gaz modelleriyle tek tıkla dağıtım sağlar. Yerel bir DA yönlendirici, yapılandırılabilir saklama ve otomatik budamayla SHAKE-256 ile işlenmiş blob depolaması sunar. PRISM uzlaşı modülü, AI destekli rollup yapılandırması için danışmanlık yöntemleri sağlar. Canlı ağlarda henüz hiçbir rollup oluşturulmamıştır.

### 7. Hesap ve Gaz Soyutlama

Üç programlanabilir türe (çoklu imza, sosyal kurtarma, oturum tabanlı) sahip akıllı hesaplar; granüler izinler ve sona erme ile oturum anahtarlarını, hesap başına harcama kurallarını ve denom izin listelerini destekler. Bu, standart hesaplarla imkânsız olan cüzdan UX örüntülerini mümkün kılar: mobil için dApp oturum anahtarları, birinci sınıf bir hesap türü olarak sosyal kurtarma ve programlanabilir harcama limitleri. Akıllı hesap ve bağlı cüzdan özellikleri uygulanmıştır, ancak şu anda her iki ağda da **kapalıdır** (`abstractaccount.enabled = false`; `GET /qorechain/abstractaccount/v1/config` adresini kontrol edin). Gaz soyutlama, kullanıcıların ücretleri kabul edilen yerel olmayan bir tokenla ödemesine olanak tanımak üzere tasarlanmıştır (yapılandırma `ibc/USDC` ve `ibc/ATOM` değerlerini listeler); henüz hiçbir IBC kanalı açık değildir, bu nedenle ücretler şu anda QOR ile ödenir.

## Ekosistem

QoreChain; güvenlik (pqc), AI (ai, reputation, rlconsensus), uzlaşı (qca), sanal makineler (vm, svm, crossvm), tokenomik (burn, xqore, inflation), likidite (amm), lisanslama (license), köprüler (bridge, babylon, multilayer), yönetişim uzantıları (abstractaccount, fairblock, gasabstraction) ve rollup'ları (rdk) kapsayan, **20'si QoreChain'e özgü olmak üzere 48 genesis modülü** ile birlikte gelir. Son eklemeler arasında AMM / zincir üzeri likidite için `x/amm` ve zincir lisanslama için `x/license` yer alır. Zincir, açık çekirdek (open-core) mimarisini takip eder — protokol katmanı tamamen açık kaynaktır ve kurumsal dağıtımlar için isteğe bağlı tescilli uzantılara sahiptir.

## İlgili

* [Mimari Genel Bakış](/introduction/architecture-overview) — katmanların uçtan uca nasıl bir araya geldiği.
* [Temel Özellikler](/introduction/key-features) — yetenek öne çıkanlarına bir bakış.
* [PRISM Uzlaşı Motoru](/architecture/prism-consensus-engine) — çekirdekte yer alan AI destekli uzlaşı.
* [Tokenomik](/architecture/tokenomics) — QOR arzı, yakımlar, yeniden tabanlamalar ve emisyonlar.
* [Hızlı Başlangıç](/getting-started/quickstart) — yerel bir düğüm başlatın ve geliştirmeye başlayın.
