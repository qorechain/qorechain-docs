---
slug: /appendix/faq
title: SSS
sidebar_label: SSS
sidebar_position: 5
---

# Sıkça Sorulan Sorular

QoreChain hakkında dokümantasyondan yanıtlanan genel sorular. Her yanıt, ayrıntı için yetkili sayfaya bağlantı verir. SDK'ya özgü sorular için bkz. [SDK SSS](/sdk/faq).

### Ana ağ canlı mı?

Evet. QoreChain ana ağı (zincir `qorechain-vladi`, EVM zincir kimliği 9801) 7 Haziran 2026'dan beri canlıdır. Bkz. [Ağlar](/appendix/networks) ve [Ana Ağa Bağlanma](/getting-started/connecting-to-mainnet).

### Zincir kimlikleri ve EVM zincir kimlikleri nelerdir?

Ana ağ, EVM zincir kimliği **9801** (hex `0x2649`) olan Cosmos zinciri `qorechain-vladi`'dir; test ağı ise EVM zincir kimliği **9800** (hex `0x2648`) olan `qorechain-diana`'dır. Tam tablo için bkz. [Ağlar](/appendix/networks).

### İşlem ücretleri nasıl dağıtılır?

Toplanan ücretler **%37 doğrulayıcılara, %30 yakmaya, %20 topluluk hazinesine, %10 stake edenlere ve %3 hafif düğümlere** bölünür. Bkz. [Tokenomics](/architecture/tokenomics).

### PRISM nedir?

PRISM, QoreChain Konsensüs Motoruna gömülü pekiştirmeli öğrenme optimizasyon katmanıdır. Ağ metriklerini gözlemler ve devre kesici güvenlik kontrolleri altında deterministik konsensüs parametresi ayarlamaları önerir. Bkz. [PRISM Konsensüs Motoru](/architecture/prism-consensus-engine).

### Çapraz zincir köprüsü canlı mı?

Çapraz zincir köprüsü şu anda test ağındadır ve beklemededir — henüz bir üretim sistemi değildir. 37 QCB zincir yapılandırması ve 8 IBC kanalı etrafında tasarlanmıştır; hedefleri canlı ana ağ garantileri olarak değil tasarım niyeti olarak ele alın. Bkz. [Köprü Mimarisi](/architecture/bridge-architecture).

### Bir cüzdanı nasıl bağlarım?

Bir cüzdan kurun ve EVM zincir kimliklerini (9801 ana ağ, 9800 test ağı) kullanarak bir QoreChain ağı ekleyin. Bkz. [Cüzdan Kurulumu](/getting-started/wallet-setup).

### Test ağı tokenlarını nasıl alırım?

Dashboard'daki test ağı musluğunu kullanın. Bkz. [Dashboard Musluğu](/dashboard/faucet) ve [Test Ağına Bağlanma](/getting-started/connecting-to-testnet).

### Bir düğümü, doğrulayıcıyı veya hafif düğümü nasıl çalıştırırım?

Tam düğüm için bkz. [Bir Düğüm Çalıştırma](/developer-guide/running-a-node). Doğrulayıcı için bkz. [Bir Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator). Hafif düğüm için bkz. [Hafif Düğüm](/light-node/overview).

### QoreChain hangi imza şemasını kullanır?

QoreChain, klasik **secp256k1 (ECDSA)** ile kuantum sonrası **ML-DSA-87 (Dilithium-5)**'i birleştiren bir kuantum sonrası hibrit şema kullanır. Bu hibrit şema, Cosmos işlem yolunda varsayılan olarak zorunludur ve uygulama modu yönetişim tarafından kontrol edilir. Bkz. [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security).

### Bir rollup'ı nasıl oluştururum?

QoreChain Rollup Development Kit'i kullanın. Bkz. [Rollups](/rollups/overview) ve [Rollup Development Kit](/architecture/rollup-development-kit) mimari referansı.

### Bir dApp'i nasıl oluştururum?

QoreChain'in EVM, SVM ve CosmWasm yürütme ortamlarında uygulama oluşturmaya yönelik genel SDK olan [QoreChain SDK](/sdk/overview)'i kullanın.

### Soruları nereye sorabilirim?

QCAIA topluluk botu, Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) ve Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)) üzerinde soruları yanıtlar. Bkz. [QCAIA Topluluk Botu](/qcaia/overview).

## İlgili

* [Ağlar](/appendix/networks) — zincir kimlikleri, portlar ve uç noktalar referansı.
* [QoreChain Nedir](/introduction/what-is-qorechain) — platform genel bakışı.
* [QCAIA Topluluk Botu](/qcaia/overview) — Discord ve Telegram'da soru sorun.
