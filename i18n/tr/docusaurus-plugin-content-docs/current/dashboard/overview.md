---
slug: /dashboard/overview
title: Panel Genel Bakış ve Başlarken
sidebar_label: Genel Bakış ve Başlarken
sidebar_position: 1
---

# Panel Genel Bakış ve Başlarken

**[dashboard.qorechain.io](https://dashboard.qorechain.io)** adresindeki QoreChain Paneli, QoreChain'i tarayıcınızdan kullanmak için resmi web uygulamasıdır. Tek bir yerden zinciri keşfedebilir, bir cüzdanı yönetebilir, token takası yapabilir, varlıkları zincirler arasında taşıyabilir, akıllı sözleşmeler oluşturup denetleyebilir, doğrulayıcılara stake edebilir, testnet tokenleri talep edebilir, görevleri tamamlayabilir ve ağın araçlarına erişebilirsiniz.

Bu bölümdeki her şey bir kullanıcı kılavuzudur: her sayfanın ne işe yaradığı ve nasıl kullanılacağı. Kurulum gerekmez — Panel tamamen tarayıcınızda çalışır.

## Neler yapabilirsiniz

| Alan | Ne için kullanılır |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | Blokları, işlemleri, adresleri ve doğrulayıcıları inceleyin. |
| **[Wallet](/dashboard/wallet)** | Bakiyenizi ve geçmişinizi görüntüleyin ve QOR alın — mainnet'te kendi cüzdanınızla (kayyum olmayan), testnet'te ise panel tarafından yönetilen bir test cüzdanıyla. |
| **[Trade](/dashboard/trade)** | Zincir üstü AMM'de token takası yapın ve likidite sağlayın. |
| **[Bridge](/dashboard/bridge)** | Varlıkları QoreChain ile diğer zincirler arasında taşıyın. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Desteklenen 17 blokzincirde **QCAI** ile akıllı sözleşmeler oluşturun. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Bir akıllı sözleşme üzerinde **QCAI** güvenlik analizi çalıştırın. |
| **[Staking & Validators](/dashboard/staking-and-validators)** | Doğrulayıcıları inceleyin ve QOR'unuzu delege edin. |
| **[Faucet](/dashboard/faucet)** | Testnet'te test tokenleri talep edin. |
| **[Quests](/dashboard/quests)** | Ağı öğrenmek için rehberli görevleri tamamlayın. |
| **[Tools Hub](/dashboard/tools-hub)** | Düğüm, rollup, SDK ve lisanslama araçlarına erişin. |

## Cüzdanınızı bağlayın {#connect-your-wallet}

Zincir üstü durumu değiştiren çoğu işlem — token gönderme, takas, stake etme, köprüleme — bağlı bir cüzdan gerektirir. Panelin anahtarları nasıl ele aldığı ağa bağlıdır:

- **Mainnet kayyum olmayan (non-custodial) yapıdadır.** Panel, mainnet anahtarlarınızı asla tutmaz. Kendi cüzdanınızı bağlarsınız — Native rayı için **Keplr** veya EVM rayı için **MetaMask** — ve Panel gerçek bakiyenizi ve geçmişinizi zincirden okur. Her mainnet işlemi kendi cüzdanınızda imzalanır, asla Panel tarafından değil.
- **Testnet kayyumludur (custodial).** Panel sizin için bir test cüzdanı yönetir; böylece sıfır kurulumla ve hiçbir gerçek değer riske atılmadan deney yapabilirsiniz.

Mainnet'te bağlanmak için:

1. [dashboard.qorechain.io](https://dashboard.qorechain.io) adresini açın ve başlıkta **Mainnet** göründüğünden emin olun.
2. Bir mainnet sayfasını ilk kez ziyaret ediyorsanız, tek seferlik risk onayını okuyup kabul edin (aşağıya bakın).
3. **Connect Wallet** seçeneğini seçin ve **Keplr** (Native rayı) veya **MetaMask** (EVM rayı) seçin.
4. Bağlantıyı cüzdanınızda onaylayın.

Bağlandıktan sonra Panel, adresinizi (kısaltılmış biçimde) başlıkta gösterir ve imza gerektiren işlemlerin kilidini açar. Explorer gibi salt okunur sayfalar bağlanmadan da çalışır.

QoreChain hesapları `qor` bech32 önekini kullanır; bu nedenle bağlı bir adres `qor1...` şeklinde görünür — aynı hesabın ayrıca bir EVM (`0x...`) ve bir SVM (base58) kodlaması vardır. Hesaplar kuantuma dayanıklı kriptografi ile korunur. İlk kurulum rehberliği için [Cüzdan Kurulumu](/getting-started/wallet-setup) sayfasına, cüzdanınız ağı henüz tanımıyorsa [QoreChain'i cüzdanınıza ekleyin](/dashboard/wallet#add-network) sayfasına bakın.

### Tek seferlik risk onayı {#risk-acknowledgement}

Herhangi bir mainnet sayfasını kullanabilmeniz için Panel, tek seferlik bir feragatnameyi kabul etmenizi ister. Bu feragatname, mainnet işlemlerinin **gerçek fonları** taşıdığını, Panelin **kayyum olmayan** yapıda olduğunu (anahtarlarınızı yalnızca siz kontrol edersiniz) ve zincir üstü işlemlerin **geri alınamaz** olduğunu anladığınızı teyit eder. Bir kez kabul edersiniz; sonrasında mainnet sayfaları doğrudan açılır.

## Ağınızı seçin

Panel iki ağ üzerinde çalışır. Başlık, o anda bağlı olduğunuz ağı gösterir.

| Ağ | Zincir Kimliği | Ne zaman kullanılır |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Gerçek değer ve üretim kullanımı için canlı ağ. Kayyum olmayan: kendi cüzdanınızı bağlarsınız. |
| **Testnet** | `qorechain-diana` | Test için ücretsiz ortam; panel tarafından yönetilen bir test cüzdanı ve test tokenleri için [Faucet](/dashboard/faucet) içerir. |

Yerel token **QOR**'dur (taban birimi `uqor`, burada 1 QOR = 10^6 uqor). Yeniyseniz, testnet'te başlayın, Faucet'ten token talep edin ve mainnet'e geçmeden önce ilk transferinizi deneyin.

:::tip QoreChain'de yeni misiniz?
Hızlıca uygulamalı deneyim kazanmak için [Testnet'e Bağlanma](/getting-started/connecting-to-testnet) ve [İlk İşleminiz](/getting-started/first-transaction) sayfalarını takip edin, ardından Panelin geri kalanını keşfetmek için geri dönün.
:::

## İlgili

* [Explorer](/dashboard/explorer) — blokları, işlemleri ve hesapları inceleyin.
* [Wallet](/dashboard/wallet) — hesapları yönetin ve işlem gönderin.
* [Trade / DEX](/dashboard/trade) — zincir üstü AMM havuzlarına karşı token takası yapın.
* [Bridge](/dashboard/bridge) — varlıkları zincirler arasında taşıyın.
* [Tools Hub](/dashboard/tools-hub) — lisanslar, faucet ve geliştirici araçları.
