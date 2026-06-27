---
slug: /dashboard/overview
title: Panel Genel Bakış ve Başlarken
sidebar_label: Genel Bakış ve Başlarken
sidebar_position: 1
---

# Panel Genel Bakış ve Başlarken

**[dashboard.qorechain.io](https://dashboard.qorechain.io)** adresindeki QoreChain Paneli, QoreChain'i tarayıcınızdan kullanmak için resmi web uygulamasıdır. Tek bir yerden zinciri keşfedebilir, bir cüzdan yönetebilir, token takas edebilir, varlıkları zincirler arasında taşıyabilir, akıllı sözleşmeler üretip denetleyebilir, doğrulayıcılara stake edebilir, testnet token'ları talep edebilir, görevleri tamamlayabilir ve ağın araçlarına ulaşabilirsiniz.

Bu bölümdeki her şey bir kullanıcı kılavuzudur: her sayfanın ne yaptığı ve nasıl kullanılacağı. Kurulum gerekmez — Panel tamamen tarayıcınızda çalışır.

## Neler yapabilirsiniz

| Alan | Ne için |
| --- | --- |
| **[Gezgin](/dashboard/explorer)** | Bloklara, işlemlere, adreslere ve doğrulayıcılara göz atın. |
| **[Cüzdan](/dashboard/wallet)** | Bakiyeleri görüntüleyin, QOR gönderip alın ve adreslerinizi yönetin. |
| **[Ticaret](/dashboard/trade)** | Zincir üstü AMM'de token takas edin ve likidite sağlayın. |
| **[Köprü](/dashboard/bridge)** | QoreChain ile diğer zincirler arasında varlıkları taşıyın. |
| **[Akıllı Sözleşme Oluşturucu](/dashboard/smart-contract-creator)** | Desteklenen 17 blok zincirinde **QCAI** ile akıllı sözleşmeler üretin. |
| **[Sözleşme Denetleyicisi](/dashboard/contract-auditor)** | Bir akıllı sözleşmede **QCAI** güvenlik analizi çalıştırın. |
| **[Stake Etme ve Doğrulayıcılar](/dashboard/staking-and-validators)** | Doğrulayıcıları inceleyin ve QOR'unuzu yetkilendirin. |
| **[Musluk](/dashboard/faucet)** | Testnet üzerinde test token'ları talep edin. |
| **[Görevler](/dashboard/quests)** | Ağı öğrenmek için rehberli görevleri tamamlayın. |
| **[Araç Merkezi](/dashboard/tools-hub)** | Düğüm, rollup, SDK ve lisanslama araçlarına ulaşın. |

## Cüzdanınızı bağlama {#connect-your-wallet}

Zincir üstü durumu değiştiren çoğu işlem — token gönderme, takas, stake etme, köprüleme — bağlı bir cüzdan gerektirir.

1. [dashboard.qorechain.io](https://dashboard.qorechain.io) adresini açın.
2. **Cüzdan Bağla**'yı seçin.
3. Bağlantıyı cüzdanınızda onaylayın.

Bağlandıktan sonra Panel, adresinizi (kısaltılmış biçimde) başlıkta gösterir ve imza gerektiren işlemlerin kilidini açar. Gezgin gibi salt okunur sayfalar bağlantı olmadan çalışır.

QoreChain hesapları `qor` bech32 önekini kullanır, dolayısıyla bağlı bir adres `qor1...` şeklinde görünür. Hesaplar kuantum güvenli kriptografi ile korunur. İlk kez kurulum rehberi için bkz. [Cüzdan Kurulumu](/getting-started/wallet-setup).

## Ağınızı seçme

Panel iki ağa karşı çalışır. Başlık, şu anda bağlı olduğunuz ağı gösterir.

| Ağ | Zincir Kimliği | Ne zaman kullanılır |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Gerçek değer ve üretim kullanımı için canlı ağ. |
| **Testnet** | `qorechain-diana` | Test için ücretsiz ortam, test token'ları için [Musluk](/dashboard/faucet) ile birlikte. |

Yerel token **QOR**'dur (temel birim `uqor`, burada 1 QOR = 10^6 uqor). Yeniyseniz, testnet üzerinde başlayın, Musluk'tan token talep edin ve mainnet'e geçmeden önce ilk bir transfer deneyin.

:::tip QoreChain'de yeni misiniz?
Hızlıca uygulamalı deneyim kazanmak için [Testnet'e Bağlanma](/getting-started/connecting-to-testnet) ve [İlk İşleminiz](/getting-started/first-transaction) adımlarını izleyin, ardından Panel'in geri kalanını keşfetmek için geri dönün.
:::

## İlgili

* [Gezgin](/dashboard/explorer) — bloklara, işlemlere ve hesaplara göz atın.
* [Cüzdan](/dashboard/wallet) — hesapları yönetin ve işlem gönderin.
* [Ticaret / DEX](/dashboard/trade) — zincir üstü AMM havuzlarına karşı token takas edin.
* [Köprü](/dashboard/bridge) — varlıkları zincirler arasında taşıyın.
* [Araç Merkezi](/dashboard/tools-hub) — lisanslar, musluk ve geliştirici yardımcı programları.
