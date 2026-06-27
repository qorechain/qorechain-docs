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

**BPF** — Berkeley Packet Filter. SVM çalışma zamanının zincir üstü programları yürütmek için kullandığı bayt kodu formatı. Programlar dağıtımdan önce BPF'ye derlenir.

**Chain License** — `x/license` modülü tarafından yönetilen bir zincir üstü lisans kaydı. Zincir lisansları, belirli protokol yeteneklerine erişimi kapılar ve operatörlerin lisanslama haklarını zincir üzerinde kaydetmesine, doğrulamasına ve yönetmesine olanak tanır. Bkz. [Zincir Lisanslama](/architecture/chain-licensing).

**CLFB** — Cross-Layer Fee Balancing (Katmanlar Arası Ücret Dengeleme). Çok katmanlı mimari içinde, dengeyi korumak ve herhangi bir tek katmanda tıkanıklığı önlemek için yan zincirler ve ödeme zincirleri genelinde ücretleri dinamik olarak ayarlayan bir mekanizma.

**CPI** — Cross-Program Invocation (Programlar Arası Çağrı). SVM çalışma zamanında, dağıtılmış bir programın aynı işlem bağlamı içinde başka bir programı çağırmasına izin veren bir mekanizma.

**CPoS** — Classified Proof-of-Stake (Sınıflandırılmış Hisse İspatı). Doğrulayıcıları itibar puanlarına göre üç havuza (Emerald, Sapphire, Ruby) gruplandıran QoreChain konsensüs sınıflandırma sistemi. Her havuzun öneren seçim algoritmasında farklı ağırlıkları vardır.

**DA** — Data Availability (Veri Erişilebilirliği). Zincire yayınlanan işlem verilerinin herhangi bir düğüm tarafından alınabileceği garantisi. RDK modülü, blobları yapılandırılabilir saklama süreleriyle zincir üzerinde depolayarak rollup'lar için yerel DA sağlar.

**DPoS** — Delegated Proof-of-Stake (Devredilmiş Hisse İspatı). Token sahiplerinin hisselerini, kendi adlarına blok üreten doğrulayıcılara devrettiği bir konsensüs mekanizması. QoreChain, DPoS'u itibar ağırlıklı sınıflandırma (CPoS) ile genişletir.

**EIP-1559** — Ethereum Improvement Proposal 1559. Bir temel ücret (yakılan) artı bir öncelik ücreti (doğrulayıcılara ödenen) kullanan bir işlem ücreti modeli. QoreChain, QoreChain EVM Motorunda EIP-1559 tarzı ücret mekaniğini uygular.

**HCS** — Hybrid Cryptographic Signatures (Hibrit Kriptografik İmzalar). İşlemlerin hem klasik bir imza (secp256k1/ECDSA) hem de kuantum sonrası bir imza (ML-DSA-87) taşıdığı QoreChain'in çift imza sistemi; hem klasik hem de kuantum saldırganlarına karşı kriptografik güvenlik sağlar.

**IBC** — Inter-Blockchain Communication (Zincirler Arası İletişim). Bağımsız blok zincirleri arasında kimliği doğrulanmış mesaj iletimi için bir protokol. QoreChain, çapraz zincir token transferleri ve veri aktarımı için IBC kanallarını destekler.

**Light Node** — Tam durumu tutmadan zinciri takip eden ve hafif sorguları yanıtlayan kaynak açısından hafif bir düğüm. Hafif düğümler, protokol ücret bölüşümünden ayrılmış bir **%3** pay alır ve ağ erişilebilirliğini genişleten katılımcıları ödüllendirir. Bkz. [Hafif Düğüm](/light-node/overview).

**MEV** — Maximal Extractable Value (Maksimum Çıkarılabilir Değer). Bir blok içindeki işlemleri yeniden sıralayarak, ekleyerek veya sansürleyerek elde edilebilecek kâr. QoreChain'in FairBlock modülü (tIBE şifrelemesi) ve 5 şeritli TX önceliklendirmesi MEV çıkarımını azaltır.

**ML-DSA-87** — Module-Lattice Digital Signature Algorithm (güvenlik düzeyi 5). QoreChain'in kuantuma dayanıklı işlem imzalama için kullandığı NIST tarafından standartlaştırılmış kuantum sonrası dijital imza şeması. 2.592 baytlık genel anahtarlarla 4.627 baytlık imzalar üretir.

**ML-KEM-1024** — Module-Lattice Key Encapsulation Mechanism (güvenlik düzeyi 5). QoreChain'in PQC algoritma kayıt defterinde gelecekteki şifreli iletişim kanalları için mevcut olan, NIST tarafından standartlaştırılmış kuantum sonrası bir anahtar kapsülleme şeması.

**MLP** — Multi-Layer Perceptron (Çok Katmanlı Algılayıcı). Dolandırıcılık tespiti ve anomali puanlamasında desen tanıma için QCAI tarafından kullanılan bir tür sinir ağı.

**PPO** — Proximal Policy Optimization. PRISM tarafından, gözlenen ağ koşullarına dayanarak zincir parametrelerini (blok boyutu, gaz limitleri, doğrulayıcı kümesi boyutu) optimize etmek için kullanılan bir pekiştirmeli öğrenme algoritması.

**PQC** — Post-Quantum Cryptography (Kuantum Sonrası Kriptografi). Hem klasik hem de kuantum bilgisayarlardan gelen saldırılara karşı güvenli olacak şekilde tasarlanmış kriptografik algoritmalar. QoreChain, birincil imza şeması olarak ML-DSA-87 ile `x/pqc` modülü aracılığıyla PQC uygular.

**PRISM** — Policy-driven Reinforcement-learning for Intelligent State Machines. QoreChain Konsensüs Motoruna (`x/rlconsensus` modülü aracılığıyla) gömülü pekiştirmeli öğrenme optimizasyon katmanı. PRISM, ağ metriklerini gözlemler ve devre kesici güvenlik kontrolleri altında deterministik konsensüs parametresi ayarlamaları önerir. Bkz. [PRISM Konsensüs Motoru](/architecture/prism-consensus-engine).

**PvP Rebase** — Player versus Player Rebase. xQORE modülünde, erken açmadan kaynaklanan cezaların kalan kilitli stake edenlere orantılı olarak yeniden dağıtıldığı ve uzun vadeli bağlılığı ödüllendiren bir mekanizma.

**QCAI** — QoreChain Artificial Intelligence (QoreChain Yapay Zekası). QoreChain'in zincir üstü sezgisel motoru (`x/ai` modülü) ve gelişmiş çıkarım yetenekleri sağlayan zincir dışı QCAI yardımcı bileşeni dahil olmak üzere YZ alt sistemini kapsayan terim.

**QCB** — QoreChain Bridge (QoreChain Köprüsü). QoreChain'in IBC olmayan zincirlere (örneğin Ethereum, Bitcoin, Solana, Avalanche) bağlanmaya yönelik yerel köprü protokolü. QCB, çapraz zincir tasdiki için federe bir doğrulayıcı kümesi kullanır. Bkz. [Köprü Mimarisi](/architecture/bridge-architecture).

**QDRW** — QoreChain Dynamic Reward Weighting (QoreChain Dinamik Ödül Ağırlıklandırma). PRISM'in (yönetişim onayı altında) doğrulayıcı havuzları genelinde ödül dağıtım ağırlıklarını dinamik olarak ayarlamasına olanak tanıyan, ağ sağlığı metrikleri için optimizasyon yapan bir yönetişim mekanizması.

**RDK** — Rollup Development Kit (Rollup Geliştirme Kiti). QoreChain'in dört mutabakat paradigması (optimistic, zk, based, sovereign), beş ön ayar profili ve entegre veri erişilebilirliği ile rollup'ları dağıtmaya ve yönetmeye yönelik yerel çerçevesi. Bkz. [Rollups Genel Bakış](/rollups/overview).

**RL** — Reinforcement Learning (Pekiştirmeli Öğrenme). Bir aracının deneme ve ödül yoluyla optimal eylemleri öğrendiği bir makine öğrenmesi yaklaşımı. PRISM, QoreChain Konsensüs Motoru içinde zincir parametrelerini dinamik olarak ayarlamak için RL kullanır.

**RPoS** — Reputation-based Proof-of-Stake (İtibar Temelli Hisse İspatı). DPoS devretmeyi itibar puanlamasıyla birleştiren kapsayıcı konsensüs modeli. Doğrulayıcılar, çalışma süresi, katılım ve topluluk katkıları yoluyla itibar kazanır ve bu da blok önerme sıklıklarını etkiler.

**SHAKE-256** — SHA-3 ailesinden değişken çıktı uzunluğuna sahip bir özet (hash) fonksiyonu. QoreChain, anahtar türetme ve adres hesaplama dahil olmak üzere PQC ile ilgili işlemler için temel özet fonksiyonu olarak SHAKE-256'yı kullanır.

**SNARK** — Succinct Non-interactive Argument of Knowledge. Küçük bir kanıt boyutuyla hızlıca doğrulanabilen bir tür sıfır bilgi kanıtı. RDK modülünde zk-rollup'lar için bir mutabakat paradigması olarak desteklenir.

**STARK** — Scalable Transparent Argument of Knowledge. Güvenilir kurulum gerektirmeyen ve kuantuma dayanıklı bir sıfır bilgi kanıt sistemi. RDK'da zk-rollup mutabakatı için alternatif bir kanıt sistemi olarak mevcuttur.

**SVM** — Solana Virtual Machine (Solana Sanal Makinesi). BPF programları için yüksek performanslı bir yürütme ortamı. QoreChain, SVM'yi QoreChain EVM Motoru ve CosmWasm ile birlikte desteklenen üç çalışma zamanından biri olarak entegre eder.

**TEE** — Trusted Execution Environment (Güvenilir Yürütme Ortamı). Kod ve verilerin harici erişimden korunmasını sağlayan, bir işlemcinin güvenli alanı. QoreChain'in PQC modülü, anahtar üretimi kanıtları için TEE tasdikini destekler.

**tIBE** — Threshold Identity-Based Encryption (Eşik Kimlik Tabanlı Şifreleme). Bir mesajın yalnızca bir eşik sayıda tarafın işbirliği yapması durumunda çözülebildiği bir kriptografik şema. FairBlock modülü tarafından, MEV çıkarımını önlemek için işlem içeriklerini blok sonlandırmaya kadar şifrelemek üzere kullanılır.

**uqor** — QOR tokeninin temel denomu. 1 QOR = 1.000.000 uqor (10^6). Tüm zincir üstü miktarlar, ücretler ve stake değerleri uqor cinsindendir.

**xQORE** — QOR'un yönetişim stake türevi. Kullanıcılar, gelişmiş yönetişim oy gücü veren ve erken açma cezalarından PvP yeniden dengeleme ödülleri kazanan xQORE almak için QOR kilitler. Bkz. [Tokenomics](/architecture/tokenomics).
