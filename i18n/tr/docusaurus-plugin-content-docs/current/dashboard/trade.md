---
slug: /dashboard/trade
title: Ticaret (DEX)
sidebar_label: Ticaret (DEX)
sidebar_position: 4
---

# Ticaret (DEX)

**Ticaret** sayfası, Kontrol Paneli'nin token takas ekranıdır: zincir dışı bir emir defteri olmadan bir token'ı başka bir token ile takas edin ve bir havuza likidite sağlayın. QoreChain'in yerel otomatik piyasa yapıcısının (AMM) tasarımı için bkz. [AMM ve Zincir Üstü Likidite](/architecture/amm).

:::caution Şimdilik yalnızca test token'ları
Bu sayfadaki havuzlar ve token'lar test token'larıdır: takaslar testnet EVM'ine dağıtılmış bir takas sözleşmesine karşı çalışır ve sayfada bunlar için bir **Get test tokens** düğmesi bulunur. Burada gösterilen hiçbir şeyi gerçek değerli likidite veya piyasa fiyatı olarak değerlendirmeyin. QoreChain'in yerel AMM modülü canlıdır, ancak henüz hiçbir ağda havuz oluşturulmamıştır. Gerçek havuzlar kullanıma sunulduğunda bu sayfa güncellenecektir.
:::

Ticaret yapmak için oturum açmış bir hesap ve bir cüzdan gerekir — bkz. [Oturum açma](/dashboard/overview#sign-in) ve [Cüzdanınızı bağlayın](/dashboard/overview#connect-your-wallet).

Sayfanın dört sekmesi vardır: **Swap**, **Pools**, **Add Liquidity** ve **My Positions**.

## Swap

Bir token'ı başka bir token ile değiştirin:

1. Ödeme yapacağınız token'ı seçin ve bir miktar girin.
2. Almak istediğiniz token'ı seçin — çıktı miktarı otomatik olarak hesaplanır.
3. İsteğe bağlı olarak **kayma toleransınızı** ayarlayın (kabul edeceğiniz maksimum fiyat hareketi; varsayılan %0,5).
4. **Swap** öğesini seçin ve onaylayın.

Bir takas geçmişi paneli, geçmiş takaslarınızı token'lar, miktarlar, oran, zaman ve durum ile birlikte listeler.

:::tip Kayma
Daha yüksek bir kayma toleransı, hızlı hareket eden piyasalarda bir takasın gerçekleşme olasılığını artırır, ancak daha az elverişli bir fiyat alabilirsiniz. Varsayılan değer çoğu çift için uygundur.
:::

## Pools

Mevcut likidite havuzlarına göz atın. Her havuz kartı; işlem çiftini, toplam likiditeyi, 24 saatlik hacmi ve sağlayıcı sayısını gösterir. Bir arama kutusu, havuzları token sembolüne göre filtreler.

## Add Liquidity

Bir havuza likidite sağlayın ve takas ücretlerinden pay alın:

1. Eşleştirilecek iki token'ı seçin (biri varsayılan olarak QOR'dur).
2. İlk token için bir miktar girin — ikinci miktar, mevcut havuz oranıyla eşleşecek şekilde otomatik olarak doldurulur.
3. Havuzdaki öngörülen payınızı inceleyin, ardından **Add Liquidity** öğesini seçin ve onaylayın.

Pozisyonunuzu temsil eden likidite sağlayıcı (LP) token'ları alırsınız.

## My Positions

Sahip olduğunuz likidite pozisyonlarını görüntüleyin. Her girdi; token çiftini, her token'daki miktarı, havuzdaki payınızı ve kazanılan ücretleri gösterir. Alacağınız token'ları önizlemek ve payınızı çekmek için bir pozisyondaki **Remove Liquidity** öğesini seçin.

## İlgili

- [AMM ve Zincir Üstü Likidite](/architecture/amm) — havuz türleri ve fiyatlandırma eğrileri.
- [Cüzdan](/dashboard/wallet) — bir takastan önce ve sonra bakiyeleri kontrol edin.
