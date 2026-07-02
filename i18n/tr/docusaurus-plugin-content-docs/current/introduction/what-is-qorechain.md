---
slug: /introduction/what-is-qorechain
title: QoreChain Nedir?
sidebar_label: QoreChain Nedir?
sidebar_position: 1
---

# QoreChain Nedir?

QoreChain; genesis'te kuantum sonrası kriptografi, AI-yerel işlem işleme ve tek bir zincir üzerinde EVM, CosmWasm ile SVM programlarını yürüten üçlü VM çalışma zamanıyla inşa edilmiş ilk Katman 1 (Layer 1) blok zinciridir. QoreChain, mevcut bir protokole kuantum direncini sonradan eklemek yerine, modern genel amaçlı bir blok zincirinden beklenen geliştirici deneyimi ve birlikte çalışabilirliği sunarken hem klasik hem de kuantum saldırganlarına karşı güvenli olacak şekilde sıfırdan tasarlanmıştır.

Ana ağ (`qorechain-vladi`, EVM chain ID **9801**) 7 Haziran 2026'dan beri yayında ve zincir sürümü **v3.1.82**'yi çalıştırıyor. Hazırlama (staging) ve entegrasyon testi için paralel olarak bir genel test ağı (`qorechain-diana`, EVM chain ID **9800**) çalışmaktadır. Yerel token, hesaplar için `qor` ve doğrulayıcılar için `qorvaloper` Bech32 önekleriyle **QOR** (görüntüleme) / **uqor** (taban, 10^6)'dur. Zincir, Cosmos SDK v0.53 üzerine kuruludur.

## Çekirdek Yenilikler

### 1. Kuantum Sonrası Kriptografi

QoreChain; dijital imzalar için NIST tarafından standartlaştırılmış ML-DSA-87 (Dilithium-5), anahtar kapsülleme için ML-KEM-1024 ve varsayılan uygulama karması olarak SHAKE-256 kullanır; bu da hem klasik hem de kuantum bilgisayarların saldırılarına karşı güvenlik sağlar. Hibrit imzalar artık cosmos işlem yolunda **varsayılan olarak zorunludur**: her cosmos yolu işlemi, klasik secp256k1 (ECDSA) imzasının *yanında* bir işlem uzantısı olarak bir Dilithium-5 (ML-DSA-87) imzası taşımalıdır. Yalnızca klasik cosmos işlemleri reddedilir — düşürme (downgrade) yolu kapalıdır (yalnızca genesis gentx'leri ve PQC anahtar kaydı/geçişi işlemleri muaftır). EVM işlemleri etkilenmez: ayrı bir `eth_secp256k1` ante yolu (QoreChain EVM Engine yolu) kullanırlar ve hibrit imzaya ihtiyaç duymazlar. Üç yönetişim kontrollü uygulama modu (disabled, optional, required) mevcut kalır, ancak mevcut ağ varsayılanı **required**'dur. Bir algoritma çevikliği çerçevesi, kriptografik standartlar evrildikçe imza şemalarının yönetişim önerileri aracılığıyla yükseltilebilmesini sağlar.

### 2. AI-Yerel İşleme

Zincir üzeri bir pekiştirmeli öğrenme aracısı (73.733 parametreli PPO MLP), deterministik sabit noktalı çıkarımı doğrudan blok yaşam döngüsünde çalıştırarak blok süresi, gaz limitleri ve doğrulayıcı havuz ağırlıkları gibi uzlaşı parametrelerini dinamik olarak ayarlar. Bu optimizasyon katmanı **PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines) olarak adlandırılır. İstatistiksel izolasyon ormanı anomali tespiti ve çok boyutlu risk puanlaması, ante işleyici zincirinde her işlemi değerlendirerek dolandırıcı örüntüleri yürütmeden önce işaretler. Dinamik ücret optimizasyonu, taban ücretleri gerçek zamanlı ağ koşullarına göre ayarlar. Tüm AI çıkarımı, doğrulayıcılar genelinde tamamen deterministiktir — aynı girdiler, harici oracle bağımlılığı olmadan aynı çıktıları üretir.

### 3. Üçlü VM Çalışma Zamanı

QoreChain, tek bir uzlaşı içinde üç sanal makineyi yerel olarak çalıştıran tek Katman 1'dir:

* **EVM** — EIP-1559 gaz fiyatlandırması ve 8545 portunda JSON-RPC ile tam Ethereum uyumluluğu. Standart araçları (Hardhat, Foundry, Remix) kullanarak Solidity sözleşmeleri dağıtın.
* **CosmWasm** — Tam yaşam döngüsü desteğiyle (örnekleme, yürütme, sorgulama, geçiş) Rust ile yazılmış WebAssembly akıllı sözleşmeleri.
* **SVM** — 8899 portunda Solana uyumlu bir JSON-RPC sunucusuyla BPF programı dağıtımı ve yürütmesi. Mevcut Solana istemcileri ve araçları kutudan çıktığı gibi çalışır.

VM'ler arası mesajlaşma, üç çalışma zamanının tamamının iletişim kurmasını sağlar: EVM sözleşmeleri precompile aracılığıyla CosmWasm'ı çağırır, CosmWasm sözleşmeleri özel mesajlar aracılığıyla EVM'i çağırır ve SVM programları asenkron olay tabanlı köprüleme yoluyla katılır.

### 4. Sabit Arzlı Tokenomik

On farklı yakım kanalı (işlem ücretleri, yönetişim cezaları, kesinti, köprü ücretleri, spam caydırma, dönem fazlası, manuel yakımlar, sözleşme geri çağrıları, VM'ler arası ücretler ve rollup oluşturma yakımları) merkezi bir yakım muhasebe modülünü besler. Toplanan ücretler **%37 doğrulayıcılara, %30 kalıcı yakım, %20 hazineye, %10 stake edenlere ve %3 hafif düğümlere** bölünür. xQORE yönetişim stake mekanizması, kullanıcıların PvP yeniden tabanlama (rebase) yeniden dağıtımıyla iki katı yönetişim ağırlığı için QOR kilitlemesine olanak tanır — erken çıkış cezaları kalan sahiplere yeniden dağıtılır ve kararlılık ödüllendirilir.

QoreChain, sürekli yüzdesel enflasyon yerine sonlu bir emisyon bütçesine sahip bir **sabit arz** modeli kullanır. Toplam arz **4.500.000.000 QOR** olarak sabittir ve bunun **80.000.000'i (%1,78)** TGE'de yakılmıştır. Stake ödülleri, çok yıllı bir takvimde özel bir **590.000.000 QOR** havuzundan ödenir:

| Dönem | Hedef APY | Emisyon bütçesi |
| --- | --- | --- |
| 1. Yıl | %8–12 | 127.500.000 QOR |
| 2. Yıl | %6–10 | 106.250.000 QOR |
| 3–4. Yıllar | %5–8 | yılda 85.000.000 QOR |
| 5. Yıl ve sonrası | Yönetişimle belirlenir | ~186.000.000 QOR kalan |

On yakım kanalıyla birleştiğinde, sabit arz tasarımı işlem hacmi büyüdükçe net deflasyonist davranışa yakınsar.

### 5. Zincirler Arası Bağlantı

QoreChain, iki tamamlayıcı protokol aracılığıyla geniş bir blok zinciri ekosistemi grubuna bağlanacak şekilde tasarlanmıştır: yerel IBC ve QoreChain Bridge (QCB). Köprü katmanı **37 QCB zincir yapılandırması (QoreChain'in kendisi yerel bir geri döngü olarak dahil)** artı **8 IBC kanalı** tanımlar — toplamda **36 harici zinciri** kapsar. Zincirler arası katman şu anda **test ağı / beklemede durumunda ve henüz üretimde değil**; aşağıdaki rakamlar hedeflenen kapsamı açıklar.

* **8 IBC kanalı** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon ve Injective. İstemci güncellemeleri, hatalı davranış (misbehaviour) tespiti ve otomatik paket temizleme ile önceden yapılandırılmış aktarıcı (relayer) şablonları.
* **37 QCB yapılandırması (36 harici zincir + QoreChain geri döngüsü)** — her uç nokta, tür başına adres doğrulaması, yapılandırılabilir onay derinliği, devre kesici hacim sınırları ve PQC imzalı doğrulayıcı doğrulamaları (attestations) içerecek şekilde tasarlanmıştır. Hedeflenen harici zincirler şunlardır:
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

Beş hazır profil (**defi, gaming, nft, enterprise, custom**), önceden yapılandırılmış uzlaşı modları, blok süreleri, VM seçimleri, DA arka uçları ve gaz modelleriyle tek tıkla dağıtım sağlar. Yerel bir DA yönlendirici, yapılandırılabilir saklama ve otomatik budamayla SHA-256 ile işlenmiş blob depolaması sunar. PRISM uzlaşı modülü, AI destekli rollup yapılandırması için danışmanlık yöntemleri sağlar.

### 7. Hesap ve Gaz Soyutlama

Üç programlanabilir türe (çoklu imza, sosyal kurtarma, oturum tabanlı) sahip akıllı hesaplar; granüler izinler ve sona erme ile oturum anahtarlarını, hesap başına harcama kurallarını ve denom izin listelerini destekler. Bu, standart hesaplarla imkânsız olan cüzdan UX örüntülerini mümkün kılar: mobil için dApp oturum anahtarları, birinci sınıf bir hesap türü olarak sosyal kurtarma ve uzlaşıda uygulanan programlanabilir harcama limitleri. Gaz soyutlama, ücretler için yerel QOR tutma gereksinimini ortadan kaldırır — kullanıcılar USDC veya ATOM gibi kabul edilen herhangi bir IBC ile aktarılan tokenla ödeme yapabilir.

## Ekosistem

QoreChain; güvenlik (pqc), AI (ai, reputation, rlconsensus), uzlaşı (qca), sanal makineler (vm, svm, crossvm), tokenomik (burn, xqore, inflation), likidite (amm), lisanslama (license), köprüler (bridge, babylon, multilayer), yönetişim uzantıları (abstractaccount, fairblock, gasabstraction) ve rollup'ları (rdk) kapsayan **20'den fazla özel modül dahil 45'ten fazla genesis modülü** ile birlikte gelir. Son eklemeler arasında AMM / zincir üzeri likidite için `x/amm` ve zincir lisanslama için `x/license` yer alır. Zincir, açık çekirdek (open-core) mimarisini takip eder — protokol katmanı tamamen açık kaynaktır ve kurumsal dağıtımlar için isteğe bağlı tescilli uzantılara sahiptir.

## İlgili

* [Mimari Genel Bakış](/introduction/architecture-overview) — katmanların uçtan uca nasıl bir araya geldiği.
* [Temel Özellikler](/introduction/key-features) — yetenek öne çıkanlarına bir bakış.
* [PRISM Uzlaşı Motoru](/architecture/prism-consensus-engine) — çekirdekte yer alan AI destekli uzlaşı.
* [Tokenomik](/architecture/tokenomics) — QOR arzı, yakımlar, yeniden tabanlamalar ve emisyonlar.
* [Hızlı Başlangıç](/getting-started/quickstart) — yerel bir düğüm başlatın ve geliştirmeye başlayın.
