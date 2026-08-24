---
slug: /dashboard/overview
title: Dashboard'a Genel Bakış ve Başlangıç
sidebar_label: Genel Bakış ve Başlangıç
sidebar_position: 1
---

# Dashboard'a Genel Bakış ve Başlangıç

**[dashboard.qorechain.io](https://dashboard.qorechain.io)** adresindeki QoreChain Dashboard, QoreChain'i tarayıcınızdan kullanmak için resmi web uygulamasıdır. Tek bir yerden zinciri keşfedebilir, bir cüzdanı yönetebilir, token takas edebilir, varlıkları zincirler arasında taşıyabilir, akıllı sözleşmeler üretip denetleyebilir, doğrulayıcılara stake edebilir, testnet tokenleri talep edebilir, görevleri tamamlayabilir ve ağın araçlarına ulaşabilirsiniz.

Bu bölümdeki her şey bir kullanıcı kılavuzudur: her sayfanın ne işe yaradığı ve nasıl kullanılacağı. Kurulum gerekmez — Dashboard tamamen tarayıcınızda çalışır.

## Neler yapabilirsiniz

| Alan | Ne işe yarar |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | Blokları, işlemleri, adresleri ve doğrulayıcıları inceleyin. |
| **[Wallet](/dashboard/wallet)** | Bakiyenizi ve geçmişinizi görüntüleyin ve QOR alın — mainnet'te kendi cüzdanınızla (non-custodial) ya da testnet'te dashboard tarafından yönetilen bir test cüzdanıyla. |
| **[Trade](/dashboard/trade)** | Zincir üzerindeki AMM'de token takas edin ve likidite sağlayın. |
| **[Bridge](/dashboard/bridge)** | Varlıkları QoreChain ile diğer zincirler arasında taşıyın. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | 17 desteklenen blok zinciri üzerinde **QCAI** ile akıllı sözleşmeler üretin. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Bir akıllı sözleşme üzerinde **QCAI** güvenlik analizi çalıştırın. |
| **[Staking & Validators](/dashboard/staking-and-validators)** | Doğrulayıcıları inceleyin ve QOR'unuzu delege edin. |
| **[Faucet](/dashboard/faucet)** | Testnet üzerinde test tokenleri talep edin. |
| **[Quests](/dashboard/quests)** | Ağı öğrenmek için rehberli görevleri tamamlayın. |
| **[Tools Hub](/dashboard/tools-hub)** | Node, rollup, SDK ve lisanslama araçlarına ulaşın. |

## Cüzdanınızı bağlayın {#connect-your-wallet}

Zincir üzerindeki durumu değiştiren çoğu işlem — token gönderme, takas, stake etme, bridge — bağlı bir cüzdan gerektirir. Dashboard'ın anahtarları nasıl ele aldığı ağa göre değişir:

- **Mainnet non-custodial'dır.** Dashboard hiçbir zaman mainnet anahtarlarınızı tutmaz. Kendi cüzdanınızı bağlarsınız — **QoreX** (resmi QoreChain cüzdanı, uzantı veya uygulama olarak), **Keplr** veya **MetaMask** — ve Dashboard gerçek bakiyenizi ve geçmişinizi zincirden okur. Her mainnet işlemi kendi cüzdanınızda imzalanır, asla Dashboard tarafından değil. **Native rayda** gönderme ve stake etme işlemleri **QoreX gerektirir**, çünkü QoreChain hesapları yalnızca bugün QoreX'in üretebildiği kuantum-sonrası hibrit bir imza ile imzalanır; Keplr yine de Native raydaki bakiyenizi görüntülemek için bağlanabilir. **MetaMask**, **EVM rayında** bağımsız olarak imzalar ve gönderir.
- **Testnet custodial'dır.** Dashboard sizin için bir test cüzdanı yönetir, böylece sıfır kurulumla ve gerçek değer riske atmadan deneyebilirsiniz.

### QoreX ile bağlanın (önerilen) {#connect-qorex}

QoreX, resmi QoreChain cüzdanıdır. Dashboard'ın **Connect with QoreX** kartı, tarayıcı uzantısını ve mobil uygulamayı aynı giriş noktasından destekler.

1. [dashboard.qorechain.io](https://dashboard.qorechain.io) adresini açın ve başlığın **Mainnet** gösterdiğinden emin olun.
2. Bu bir mainnet sayfasına ilk ziyaretinizse, [tek seferlik risk onayını](#risk-acknowledgement) okuyup kabul edin.
3. **Connect Wallet**'ı (veya cüzdan kartında **Connect with QoreX**'i) seçin.
4. QoreX tarayıcı uzantısı bu tarayıcıda kurulu ve tespit edilmişse, Dashboard **"Nasıl bağlanmak istersiniz?"** sorusunu **Browser extension** ve **QoreX app** olmak üzere iki seçenekle sorar. Birini seçin — seçim kaydedilir, böylece sonraki ziyaretlerde bu istem atlanır (dilerseniz daha sonra değiştirmek için her zaman bir **Use a different method** bağlantısı bulunur). Uzantı tespit edilmezse, Dashboard doğrudan uygulama akışına geçer.
   - **Browser extension**: uzantının kendi popup'ı açılır ve bağlantıyı talep eden site olarak `dashboard.qorechain.io`'yu gösterir. Gözden geçirip onaylayın — bu, `qor1...` adresinizin sahibi olduğunuza dair tek seferlik bir kanıtı imzalar (hiçbir fon hareket etmez). Eşleştirme aynı tarayıcı oturumunda anında tamamlanır.
   - **QoreX app**: Dashboard bir QR kodu gösterir (aynı telefondan geziniyorsanız uygulamayı doğrudan açan bir **Open QoreX** bağlantısıyla birlikte). QoreX uygulamasını açın, QR kodunu tarayın (veya bağlantıya dokunun), Dashboard'ın kaynağını gösteren eşleştirme talebini gözden geçirin ve biyometrik onayınızla onaylayın. Dashboard arka planda yoklama yapar ve siz onayladığınızda eşleştirmeyi otomatik olarak tamamlar.
5. Onaylandıktan sonra, Dashboard `qor1...` adresinizi gösterir ve imza gerektiren işlemlerin kilidini açar.

Cüzdan türüne göre tam bağlanma ve gönderme adımları için [Wallet](/dashboard/wallet#mainnet) sayfasına, aynı eşleştirmenin cüzdan tarafındaki görünümü için QoreX dokümanlarının [Account & Dashboard](/qorex/account-and-dashboard#dashboard) sayfasına bakın.

### Keplr veya MetaMask ile bağlanın

1. [dashboard.qorechain.io](https://dashboard.qorechain.io) adresini açın ve başlığın **Mainnet** gösterdiğinden emin olun.
2. Bu bir mainnet sayfasına ilk ziyaretinizse, tek seferlik risk onayını okuyup kabul edin (aşağıya bakın).
3. **Connect Wallet**'ı seçin ve **Keplr** veya **MetaMask**'ı seçin.
4. Bağlantıyı cüzdanınızda onaylayın.

Bağlandıktan sonra, Dashboard adresinizi (kısaltılmış biçimde) başlıkta gösterir. MetaMask, EVM rayında gönderme ve diğer imzalı işlemlerin kilidini doğrudan açar. Keplr, Native raydaki bakiyenizi ve geçmişinizi görüntülemenin kilidini açar — oradaki gönderme ve stake etme işlemleri QoreX üzerinden yapılır (yukarıya bakın), çünkü QoreChain hesapları kuantum-sonrası hibrit bir imza ile imzalanır. Explorer gibi salt okunur sayfalar bağlantı kurmadan da çalışır.

QoreChain hesapları `qor` bech32 önekini kullanır, dolayısıyla bağlı bir adres `qor1...` şeklinde görünür — aynı hesabın bir de EVM (`0x...`) ve bir SVM (base58) kodlaması vardır. Hesaplar kuantuma dayanıklı kriptografi ile korunur. İlk kurulum rehberliği için [Wallet Setup](/getting-started/wallet-setup) sayfasına, cüzdanınız ağı henüz tanımıyorsa [Add QoreChain to your wallet](/dashboard/wallet#add-network) sayfasına bakın.

### Tek seferlik risk onayı {#risk-acknowledgement}

Herhangi bir mainnet sayfasını kullanabilmeden önce, Dashboard tek seferlik bir feragatnameyi kabul etmenizi ister. Bu, mainnet işlemlerinin **gerçek fonları** hareket ettirdiğini, Dashboard'ın **non-custodial** olduğunu (yalnızca siz anahtarlarınızı kontrol edersiniz) ve zincir üzerindeki işlemlerin **geri alınamaz** olduğunu anladığınızı teyit eder. Bunu bir kez kabul edersiniz; sonrasında mainnet sayfaları doğrudan açılır.

## Ağınızı seçin

Dashboard iki ağa karşı çalışır. Başlık, o anda bağlı olduğunuz ağı gösterir.

| Ağ | Chain ID | Ne zaman kullanılır |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Gerçek değer ve üretim kullanımı için canlı ağ. Non-custodial: kendi cüzdanınızı bağlarsınız. |
| **Testnet** | `qorechain-diana` | Dashboard tarafından yönetilen bir test cüzdanı ve test tokenleri için [Faucet](/dashboard/faucet) ile birlikte test için ücretsiz ortam. |

Yerel token **QOR**'dur (temel birim `uqor`, burada 1 QOR = 10^6 uqor). Yeniyseniz, testnet ile başlayın, Faucet'ten token talep edin ve mainnet'e geçmeden önce ilk bir transfer deneyin.

:::tip QoreChain'de yeni misiniz?
Hızlıca uygulamalı deneyim kazanmak için [Connecting to Testnet](/getting-started/connecting-to-testnet) ve [Your First Transaction](/getting-started/first-transaction) adımlarını izleyin, ardından Dashboard'ın geri kalanını keşfetmek için buraya dönün.
:::

## İlgili

* [Explorer](/dashboard/explorer) — blokları, işlemleri ve hesapları inceleyin.
* [Wallet](/dashboard/wallet) — hesapları yönetin ve işlem gönderin.
* [Trade / DEX](/dashboard/trade) — zincir üzerindeki AMM havuzlarına karşı token takas edin.
* [Bridge](/dashboard/bridge) — varlıkları zincirler arasında taşıyın.
* [Tools Hub](/dashboard/tools-hub) — lisanslar, faucet ve geliştirici araçları.
