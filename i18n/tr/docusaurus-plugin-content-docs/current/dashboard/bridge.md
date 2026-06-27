---
slug: /dashboard/bridge
title: Köprü
sidebar_label: Köprü
sidebar_position: 5
---

# Köprü

**Köprü**, QoreChain ile diğer zincirler arasında varlıkları tek bir ekrandan taşımanızı sağlar. Her köprü işlemi, kuantum sonrası kriptografi ile güvence altına alınmıştır. Zincirler arası transferlerin arkasındaki tasarım için bkz. [Köprü Mimarisi](/architecture/bridge-architecture).

:::caution Sınırlı durum
Zincirler arası köprü şu anda testnet aşamasındadır ve kademeli olarak yaygınlaştırılmaktadır — henüz üretim mainnet sistemi değildir. Mevcut rotaları garanti edilmiş canlı bağlantı olarak değil, üzerinde çalışılan işler olarak değerlendirin ve testnet üzerinde başlayın.
:::

Köprü'yü kullanmak için cüzdanınızı bağlayın — bkz. [Genel Bakış ve Başlarken](/dashboard/overview#connect-your-wallet).

## Bir varlık nasıl köprülenir

1. Üst seçicide **kaynak** zinciri ve token'ı seçin. Seçici, token'ı, ağını ve bakiyenizi gösterir.
2. Alt seçicide **hedef** zinciri ve token'ı seçin.
3. Transfer edilecek tutarı girin. Alacağınız tutar hedef taraf için gösterilir.
4. Varlıkları kendi adresiniz dışında farklı bir adrese göndermek için **Başkasına gönder** seçeneğini açın ve alıcıyı girin.
5. Alt kısımda gösterilen **ücreti** ve mutabakata kadar **tahmini süreyi** inceleyin.
6. Transferi cüzdanınızda onaylayın.

İki seçici arasındaki bir takas kontrolü, kaynak ve hedefi tek dokunuşla tersine çevirmenizi sağlar.

## İpuçları

- Göndermeden önce her iki zinciri ve hedef adresi doğrulayın — zincirler arası transferler geri alınamaz.
- Mutabakat süresi rotaya göre değişir; zincirleri ve tutarları değiştirdikçe tahmin güncellenir.
- Transferlerin zincirler arasında nasıl doğrulandığına dair arka plan bilgisi için bkz. [Varlıkları Köprüleme](/user-guide/bridging-assets) ve [Köprü Mimarisi](/architecture/bridge-architecture).
