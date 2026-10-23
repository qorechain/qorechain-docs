---
slug: /appendix/glossary
title: Sözlük
sidebar_label: Sözlük
sidebar_position: 1
---

# Sözlük

QoreChain dokümantasyonu boyunca kullanılan terimlerin, kısaltmaların ve akronimlerin alfabetik referansı.

---

**AMM** — Automated Market Maker (Otomatik Piyasa Yapıcı). QoreChain'in yerel zincir üstü likidite modülü (`x/amm`); harici bir akıllı sözleşme dağıtımı olmadan doğrudan protokol düzeyinde sabit-çarpım havuzları, takaslar ve likidite sağlama sunar. Bkz. [AMM](/architecture/amm).

**Authorisation window (EVM) (EVM yetkilendirme penceresi)** — Kuantum sonrası imzalı bir Cosmos hattı mesajıyla açılan, sınırlı bir izin (blok, işlem sayısı, toplam değer); v3.2.0'dan itibaren bir EVM hattı işleminin bu sınırın içinde kalması gerekir. v3.2.3'ten itibaren bir pencere yalnızca yerel transferlerle veya bir alıcı listesiyle daraltılabilir. Bkz. [EVM yetkilendirme penceresi](/getting-started/first-transaction#evm-window).

**BPF** — Berkeley Packet Filter. SVM çalışma zamanının zincir üstü programları yürütmek için kullandığı bayt kodu formatı. Programlar dağıtımdan önce BPF'ye derlenir.

**Chain License** — `x/license` modülü tarafından yönetilen bir zincir üstü lisans kaydı. Zincir lisansları, belirli protokol yeteneklerine erişimi kapılar ve operatörlerin lisanslama haklarını zincir üzerinde kaydetmesine, doğrulamasına ve yönetmesine olanak tanır. Bkz. [Zincir Lisanslama](/architecture/chain-licensing).

**Circuit breaker (devre kesici)** — Tek tek mesaj türlerini ağ genelinde kapatan Cosmos SDK mekanizması; güncel liste `/cosmos/circuit/v1/disable_list` adresinden sorgulanabilir. Bkz. [Zincir Parametreleri](/appendix/chain-parameters#circuit-breaker).

**CLFB** — Cross-Layer Fee Bundling (Katmanlar Arası Ücret Paketleme). Kaynak katmanda yapılan ve katmanlar arası bir yoldaki katmanlar genelindeki yürütmeyi kapsayan tek bir ücret ödemesi (`x/multilayer` modülünün `cross_layer_fee_bundling` parametresi). Bkz. [Çok Katmanlı Mimari](/architecture/multilayer-architecture).

**CPI** — Cross-Program Invocation (Programlar Arası Çağrı). SVM çalışma zamanında, dağıtılmış bir programın aynı işlem bağlamı içinde başka bir programı çağırmasına izin veren bir mekanizma.

**CPoS** — Composite Proof-of-Stake (Bileşik Hisse İspatı). Doğrulayıcıları itibar ve delegasyona göre üç havuza (RPoS, DPoS, PoS) gruplandıran QoreChain konsensüs sınıflandırma tasarımı. Her havuzun öneren seçim algoritmasında farklı ağırlıkları vardır. `x/qca` içinde uygulanmıştır ancak blok üretiminde henüz etkin değildir.

**DA** — Data Availability (Veri Erişilebilirliği). Zincire yayınlanan işlem verilerinin herhangi bir düğüm tarafından alınabileceği garantisi. RDK modülü, blobları yapılandırılabilir saklama süreleriyle zincir üzerinde depolayarak rollup'lar için yerel DA sağlar.

**DPoS** — Delegated Proof-of-Stake (Devredilmiş Hisse İspatı). Token sahiplerinin hisselerini, kendi adlarına blok üreten doğrulayıcılara devrettiği bir konsensüs mekanizması.

**EIP-1559** — Ethereum Improvement Proposal 1559. Bir temel ücret (yakılan) artı bir öncelik ücreti (doğrulayıcılara ödenen) kullanan bir işlem ücreti modeli. QoreChain, QoreChain EVM Motorunda EIP-1559 tarzı ücret mekaniğini uygular.

**HCS** — Hierarchical Commitment Schemes (Hiyerarşik Taahhüt Şemaları). Yan zincirlerin, ödeme zincirlerinin ve rollup'ların durum köklerini düzenli aralıklarla ana zincire sabitlediği mekanizma (bkz. Çok Katmanlı Mimari). Bu dokümantasyonun *hibrit imza* olarak adlandırdığı hibrit secp256k1 + ML-DSA-87 imza şemasıyla karıştırılmamalıdır.

**Hybrid sign-bytes v2 (hibrit imza baytları v2)** — v3.2.0'dan itibaren ML-DSA anahtarının imzaladığı, alan etiketli ve zincire bağlı baytlar. Bkz. [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security#sign-bytes-v2).

**IBC** — Inter-Blockchain Communication (Zincirler Arası İletişim). Bağımsız blok zincirleri arasında kimliği doğrulanmış mesaj iletimi için bir protokol. QoreChain, çapraz zincir token transferleri ve veri aktarımı için IBC kanallarını destekler.

**Light Node** — Tam durumu tutmadan, blok başlıklarını bir veya daha fazla RPC uç noktasıyla çapraz kontrol ederek zinciri takip eden, kaynak açısından hafif bir istemci. Başkalarına sorgu hizmeti vermez. Protokol ücret bölüşümü, hafif düğüm ödül programı için **%3** pay ayırır. Programa kayıt açıktır ve bir `lightnode_operator` lisansına (50 $, Dashboard'dan satın alınır) bağlıdır; 20 Ekim 2026 itibarıyla ana ağda altı lisans verilmişti ve henüz hiçbir hafif düğüm kaydolmamıştı. Bir düğüm çalıştırmak lisans gerektirmez. Bkz. [Hafif Düğüm](/light-node/overview) ve [ödül programı durumu](/light-node/overview#reward-program-status).

**MEV** — Maximal Extractable Value (Maksimum Çıkarılabilir Değer). Bir blok içindeki işlemleri yeniden sıralayarak, ekleyerek veya sansürleyerek elde edilebilecek kâr. QoreChain'in FairBlock modülü (tIBE şifrelemesi) MEV çıkarımını azaltmak üzere tasarlanmıştır; henüz etkin değildir.

**ML-DSA-87** — Module-Lattice Digital Signature Algorithm (güvenlik düzeyi 5). QoreChain'in kuantuma dayanıklı işlem imzalama için kullandığı NIST tarafından standartlaştırılmış kuantum sonrası dijital imza şeması. 2.592 baytlık genel anahtarlarla 4.627 baytlık imzalar üretir.

**ML-KEM-1024** — Module-Lattice Key Encapsulation Mechanism (güvenlik düzeyi 5). QoreChain'in PQC algoritma kayıt defterinde gelecekteki şifreli iletişim kanalları için mevcut olan, NIST tarafından standartlaştırılmış kuantum sonrası bir anahtar kapsülleme şeması.

**MLP** — Multi-Layer Perceptron (Çok Katmanlı Algılayıcı). Dolandırıcılık tespiti ve anomali puanlamasında desen tanıma için QCAI tarafından kullanılan bir tür sinir ağı.

**PPO** — Proximal Policy Optimization. PRISM tarafından, gözlenen ağ koşullarına dayanarak zincir parametrelerini (blok süresi, gaz fiyatı, havuz ağırlıkları; doğrulayıcı kümesi boyutu yalnızca günlüğe yazılır) optimize etmek için kullanılan bir pekiştirmeli öğrenme algoritması. Canlı ağlarda eğitilmiş bir politika yüklü değildir.

**PQC** — Post-Quantum Cryptography (Kuantum Sonrası Kriptografi). Hem klasik hem de kuantum bilgisayarlardan gelen saldırılara karşı güvenli olacak şekilde tasarlanmış kriptografik algoritmalar. QoreChain, birincil imza şeması olarak ML-DSA-87 ile `x/pqc` modülü aracılığıyla PQC uygular.

**PRISM** — Policy-driven Reinforcement-learning for Intelligent State Machines. QoreChain Konsensüs Motoruna (`x/rlconsensus` modülü aracılığıyla) gömülü pekiştirmeli öğrenme optimizasyon katmanı. PRISM, ağ metriklerini gözlemler ve devre kesici güvenlik kontrolleri altında deterministik konsensüs parametresi ayarlamaları önermek üzere tasarlanmıştır; bugün gözlem modunda çalışır. Bkz. [PRISM Konsensüs Motoru](/architecture/prism-consensus-engine).

**Proof of possession (PoP) (sahiplik kanıtı)** — Bir kuantum sonrası anahtarın kendi kayıt ayrıntıları üzerinde attığı ve kaydeden tarafın özel anahtarı elinde tuttuğunu kanıtlayan imza. v3.2.3'ten beri hesap anahtarı kaydında isteğe bağlıdır (`tx pqc register-key-v2 ... --pqc-key <name>`); v3.2.4'ten itibaren köprü doğrulayıcı anahtarları için zorunludur (test ağında 19 Ekim 2026'dan beri ve ana ağda 23 Ekim 2026'dan beri).

**Protocol feature (protokol özelliği)** — Bir sürümün yükseltme işleyicisinin her düğümde tek bir blok yüksekliğinde açtığı davranış anahtarı (örneğin `pqc-sign-bytes-v2`, `evm-pqc-authorisation-window`); böylece bu yüksekliğin altındaki geçmiş değişmeden yeniden oynatılır.

**PvP Rebase** — Player versus Player Rebase. xQORE modülünde, erken açmadan kaynaklanan cezaların kalan kilitli stake edenlere orantılı olarak yeniden dağıtıldığı ve uzun vadeli bağlılığı ödüllendiren bir mekanizma (henüz zincir üzerinde bağlanmamıştır).

**QCAI** — QoreChain Artificial Intelligence (QoreChain Yapay Zekası). QoreChain'in zincir üstü sezgisel motoru (`x/ai` modülü) ve gelişmiş çıkarım yetenekleri sağlayan zincir dışı QCAI yardımcı bileşeni dahil olmak üzere YZ alt sistemini kapsayan terim.

**QoreChain Native** — QoreChain'in CosmWasm akıllı sözleşme çalışma zamanına verdiği ad: sözleşmeler standart CosmWasm kütüphanelerine karşı Rust ile yazılır ve WebAssembly'ye derlenir. Üç çalışma zamanından biridir (EVM, QoreChain Native, SVM). Sıradan sözleşme yükleme ve örnekleme şu anda her iki ağda da kapalıdır (bkz. [QoreChain Native Geliştirme](/developer-guide/cosmwasm-development)).

**QCB** — QoreChain Bridge (QoreChain Köprüsü). QoreChain'in IBC olmayan zincirlere (örneğin Ethereum, Bitcoin, Solana, Avalanche) bağlanmaya yönelik yerel köprü protokolü. QCB, çapraz zincir tasdiki için bir doğrulayıcı tasdik eşiği (10 ML-DSA-87 imzasından 7'si) kullanır. Bkz. [Köprü Mimarisi](/architecture/bridge-architecture).

**QDRW** — Quadratic Delegation with Reputation Weighting (İtibar Ağırlıklı Karesel Delegasyon). Bir yönetişim oy gücü formülü (hissenin karekökü artı ağırlıklı xQORE, bir itibar çarpanıyla ölçeklenir). `x/qca` içinde uygulanmıştır ancak canlı ağlarda devre dışıdır (`qdrw_enabled = false`).

**RDK** — Rollup Development Kit (Rollup Geliştirme Kiti). QoreChain'in dört mutabakat paradigması (optimistic, zk, based, sovereign), beş ön ayar profili ve entegre veri erişilebilirliği ile rollup'ları dağıtmaya ve yönetmeye yönelik yerel çerçevesi. Bkz. [Rollups Genel Bakış](/rollups/overview).

**RL** — Reinforcement Learning (Pekiştirmeli Öğrenme). Bir aracının deneme ve ödül yoluyla optimal eylemleri öğrendiği bir makine öğrenmesi yaklaşımı. PRISM, QoreChain Konsensüs Motoru içinde zincir parametrelerini ayarlamak için RL kullanmak üzere tasarlanmıştır (bugün yalnızca gözlem).

**RPoS** — Reputation Proof-of-Stake (İtibar Hisse İspatı). İtibarda 70. yüzdelik dilimde veya üzerinde olan ve en az medyan öz-bağlı hisseye sahip doğrulayıcılar için havuz. Doğrulayıcılar, çalışma süresi, katılım ve topluluk katkıları yoluyla itibar kazanır.

**SHAKE-256** — SHA-3 ailesinden değişken çıktı uzunluğuna sahip bir özet (hash) fonksiyonu. SHAKE-256, QoreChain'in varsayılan uygulama özetidir (`qorehash` paketi) ve anahtar türetme gibi PQC ile ilgili işlemlerde kullanılır.

**SNARK** — Succinct Non-interactive Argument of Knowledge. Küçük bir kanıt boyutuyla hızlıca doğrulanabilen bir tür sıfır bilgi kanıtı. RDK modülünde zk-rollup'lar için bir mutabakat paradigması olarak desteklenir.

**STARK** — Scalable Transparent Argument of Knowledge. Güvenilir kurulum gerektirmeyen ve kuantuma dayanıklı bir sıfır bilgi kanıt sistemi. RDK'da zk-rollup mutabakatı için alternatif bir kanıt sistemi olarak mevcuttur.

**Stranded staker share / reward-pool reserve (sıkışmış staker payı / ödül havuzu rezervi)** — v3.2.0 yükseltmesinde kaydedilen ve yalnızca bir yönetişim oyuyla hareket eden tutarlar; yönetişim bunları Ekim 2026'da serbest bıraktı (sıkışmış payın v3.2.3'te yeniden hesaplanan düzeltilmiş kalanı, öneri 12 ile serbest bırakıldı). Bkz. [Tokenomics](/architecture/tokenomics#stranded-and-reserve).

**SVM** — Solana Virtual Machine (Solana Sanal Makinesi). BPF programları için yüksek performanslı bir yürütme ortamı. QoreChain, SVM'yi QoreChain EVM Motoru ve QoreChain Native ile birlikte desteklenen üç çalışma zamanından biri olarak entegre eder.

**TEE** — Trusted Execution Environment (Güvenilir Yürütme Ortamı). Kod ve verilerin harici erişimden korunmasını sağlayan, bir işlemcinin güvenli alanı. QoreChain, TEE tasdiki için arayüz spesifikasyonları tanımlar; henüz bir uygulama yoktur.

**tIBE** — Threshold Identity-Based Encryption (Eşik Kimlik Tabanlı Şifreleme). Bir mesajın yalnızca bir eşik sayıda tarafın işbirliği yapması durumunda çözülebildiği bir kriptografik şema. FairBlock modülü tarafından, MEV çıkarımını önlemek için işlem içeriklerini blok sonlandırmaya kadar şifrelemek üzere kullanılır.

**Time-locked staking (zaman kilitli stake)** — Bir delegasyonun bir kısmının sabit bir süreyle taahhüt edilmesi; `x/stakingtier` modülü tarafından sağlanan isteğe bağlı bir özelliktir. v3.2.4'ün parçasıdır: test ağında 19 Ekim 2026'dan beri ve ana ağda 23 Ekim 2026'dan beri. Bkz. [Stake ve Delegasyon](/user-guide/staking-and-delegation#time-locked-staking).

**uqor** — QOR tokeninin temel denomu. 1 QOR = 1.000.000 uqor (10^6). Tüm zincir üstü miktarlar, ücretler ve stake değerleri uqor cinsindendir.

**xQORE** — QOR'un yönetişim stake türevi. Kullanıcılar, gelişmiş yönetişim oy gücü veren ve erken açma cezalarından PvP yeniden dengeleme ödülleri kazanan xQORE almak için QOR kilitler (tasarlanan davranış; kilitleme ve açma işlemleri henüz zincir üzerinde bağlanmamıştır). Bkz. [Tokenomics](/architecture/tokenomics#x-xqore).
