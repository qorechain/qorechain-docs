---
slug: /appendix/faq
title: SSS
sidebar_label: SSS
sidebar_position: 5
---

# Sıkça Sorulan Sorular

QoreChain hakkında dokümantasyondan yanıtlanan genel sorular. Her yanıt, ayrıntı için yetkili sayfaya bağlantı verir. SDK'ya özgü sorular için bkz. [SDK SSS](/sdk/faq).

### Ana ağ canlı mı?

Evet. QoreChain ana ağı (zincir `qorechain-vladi`, EVM zincir kimliği 9801) 7 Haziran 2026'dan beri canlıdır ve v3.2.4 sürümünü çalıştırır (23 Ekim 2026'da 3.742.566 numaralı yükseklikte yönetişim önerisi 13 ile uygulandı); test ağı `qorechain-diana` 19 Ekim 2026'dan beri v3.2.4 çalıştırır. Bkz. [Ağlar](/appendix/networks) ve [Ana Ağa Bağlanma](/getting-started/connecting-to-mainnet).

### Zincir kimlikleri ve EVM zincir kimlikleri nelerdir?

Ana ağ, EVM zincir kimliği **9801** (hex `0x2649`) olan Cosmos zinciri `qorechain-vladi`'dir; test ağı ise EVM zincir kimliği **9800** (hex `0x2648`) olan `qorechain-diana`'dır. Tam tablo için bkz. [Ağlar](/appendix/networks).

### İşlem ücretleri nasıl dağıtılır?

Toplanan ücretler **%37 doğrulayıcılara, %30 yakmaya, %20 topluluk hazinesine, %10 stake edenlere ve %3 hafif düğümlere** bölünür. Bölüşüm, dönem (epoch) emisyonu dahil ücret toplayıcısındaki her şeye uygulanır. Bkz. [Tokenomics](/architecture/tokenomics#fee-distribution).

### PRISM nedir?

PRISM, QoreChain Konsensüs Motoruna gömülü pekiştirmeli öğrenme optimizasyon katmanıdır. Ağ metriklerini gözlemler ve devre kesici güvenlik kontrolleri altında deterministik konsensüs parametresi ayarlamaları önerir. Bugün gözlem modunda çalışır: eğitilmiş bir politika yüklenmemiştir, bu yüzden hiçbir parametreyi değiştirmez. Bkz. [PRISM Konsensüs Motoru](/architecture/prism-consensus-engine).

### Çapraz zincir köprüsü canlı mı?

Hayır. Köprü modülü dağıtılmıştır, ancak 37 zincir yapılandırmasının tümü beklemededir, hiçbir köprü doğrulayıcısı kayıtlı değildir ve her iki ağda da IBC kanalı yoktur. 37 zincir yapılandırması ve en fazla 8 IBC karşı tarafı etrafında tasarlanmıştır; hedefleri tasarım niyeti olarak ele alın. Bkz. [Köprü Mimarisi](/architecture/bridge-architecture).

### Bir cüzdanı nasıl bağlarım?

Resmi [QoreX](/qorex/overview) cüzdanını kullanın veya EVM zincir kimliklerini (9801 ana ağ, 9800 test ağı) kullanarak bir EVM cüzdanına bir QoreChain ağı ekleyin. Bkz. [Cüzdan Kurulumu](/getting-started/wallet-setup).

### Test ağı tokenlarını nasıl alırım?

Dashboard'daki test ağı musluğunu kullanın. Bkz. [Dashboard Musluğu](/dashboard/faucet) ve [Test Ağına Bağlanma](/getting-started/connecting-to-testnet).

### Bir düğümü, doğrulayıcıyı veya hafif düğümü nasıl çalıştırırım?

Tam düğüm için bkz. [Bir Düğüm Çalıştırma](/developer-guide/running-a-node). Doğrulayıcı için bkz. [Bir Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator). Hafif düğüm için bkz. [Hafif Düğüm](/light-node/overview); hafif düğüm ödül programına kayıt açıktır ve lisansa bağlıdır ([durum](/light-node/overview#reward-program-status)).

### QoreChain hangi imza şemasını kullanır?

QoreChain, klasik **secp256k1 (ECDSA)** ile kuantum sonrası **ML-DSA-87 (Dilithium-5)**'i birleştiren bir kuantum sonrası hibrit şema kullanır. Bu hibrit şema, Cosmos işlem yolunda varsayılan olarak zorunludur ve uygulama modu yönetişim tarafından kontrol edilir. EVM hattında imza secp256k1 olarak kalır ve bir hesabın ayrıca kayıtlı bir ML-DSA anahtarına ve açık bir yetkilendirme penceresine sahip olması gerekir (v3.2.0'dan beri). Bkz. [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security).

### EVM işlemim neden "no open EVM authorisation window" ile reddediliyor?

v3.2.0'dan itibaren EVM hattı, bir işlemi yalnızca kayıtlı bir kuantum sonrası anahtara ve açık bir yetkilendirme penceresine sahip bir hesaptan kabul eder. Kuantum sonrası imzalı bir Cosmos hattı işlemiyle bir pencere açın, ardından yeniden deneyin. Bkz. [EVM yetkilendirme penceresi](/getting-started/first-transaction#evm-window).

### Ana ağda kaç doğrulayıcı var?

23 Ekim 2026'da sekiz bağlı (bonded) doğrulayıcı vardı ve yaklaşık 55,6 milyon QOR bağlanmıştı (aktif küme en fazla 100 doğrulayıcı alabilir). Test ağında üç tane var. Canlı kümeyi `https://api.qore.host` üzerinde `GET /cosmos/staking/v1beta1/validators` adresinden okuyun.

### Ne kadar blok süresi beklemeliyim?

Ana ağda yaklaşık 3,2 saniye, test ağında yaklaşık 1 saniye (ölçülmüş ortalamalar, Ekim 2026). Blok süresi, doğrulayıcıların node yapılandırması tarafından belirlenir.

### xQORE kullanılabilir mi?

Henüz değil. Muhasebe modülü mevcut, ancak kilitleme ve kilit açma işlemleri canlı ağlara bağlanmış değil. Bkz. [Tokenomics](/architecture/tokenomics#x-xqore).

### QOR arzı sabit mi?

Genesis arzı 4.420.000.000 QOR idi. Staking emisyonu, 590.000.000 QOR'luk katı bir kümülatif üst sınır altında basılır (Ekim 2026'daki 10 numaralı yönetişim önerisinden beri dönem başına 86.000 QOR) ve yakımlar tokenları kalıcı olarak ortadan kaldırır. Bkz. [Tokenomics](/architecture/tokenomics#supply-and-emission).

### Bir rollup'ı nasıl oluştururum?

QoreChain Rollup Development Kit'i kullanın. Bkz. [Rollups](/rollups/overview) ve [Rollup Development Kit](/architecture/rollup-development-kit) mimari referansı.

### Bir dApp'i nasıl oluştururum?

QoreChain'in EVM, SVM ve QoreChain Native yürütme ortamlarında uygulama oluşturmaya yönelik genel SDK olan [QoreChain SDK](/sdk/overview)'i kullanın.

### Soruları nereye sorabilirim?

QCAIA topluluk botu, Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) ve Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)) üzerinde soruları yanıtlar. Bkz. [QCAIA Topluluk Botu](/qcaia/overview).

## İlgili

* [Ağlar](/appendix/networks) — zincir kimlikleri, portlar ve uç noktalar referansı.
* [QoreChain Nedir](/introduction/what-is-qorechain) — platform genel bakışı.
* [QCAIA Topluluk Botu](/qcaia/overview) — Discord ve Telegram'da soru sorun.
