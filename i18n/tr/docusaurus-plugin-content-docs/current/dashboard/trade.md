---
slug: /dashboard/trade
title: Ticaret (DEX)
sidebar_label: Ticaret (DEX)
sidebar_position: 4
---

# Ticaret (DEX)

**Ticaret** sayfası ("QoreChain DEX" başlığıyla), dört sekmeli bir test token'ı takas ekranıdır: **Swap**, **Pools**, **Add Liquidity** ve **My Positions**. Gerçek havuzlar var olmadan önce bir takas akışını test token'larıyla baştan sona denemek içindir. QoreChain'in yerel otomatik piyasa yapıcısının (AMM) tasarımı için bkz. [AMM ve Zincir Üstü Likidite](/architecture/amm).

:::caution Şimdilik yalnızca test token'ları
Bu sayfadaki her şey, üst bilgi hangi ağı gösterirse göstersin **testnet** üzerinde çalışır. Mainnet'te sayfa hâlâ oturum açma ve onay ile korunur, ancak `qorechain-diana` ve testnet token'larını gösterir. Yalnızca beş QoreSwap test token'ı zincir üstünde sonuçlanır; buradaki geri kalan her şey bir alıştırma alanıdır. QoreChain'in yerel AMM modülü canlıdır, ancak henüz hiçbir ağda havuz oluşturulmamıştır (`GET /qorechain/amm/v1/pools` her iki ağda da boş bir liste döndürür, 27 Ekim 2026'da kontrol edildi).
:::

## Yenilikler {#innovations}

- **Beş test token'ı için zincir üstü takaslar.** WQOR, QUSDC, QUSDT, QWETH ve QWBTC arasındaki takaslar, testnet EVM'indeki (chain ID 9800) QoreSwap AMM sözleşmesine karşı çalışır. Fiyat teklifi sözleşmenin `getAmountOut` işlevinden gelir.
- **İşlemde uygulanan kayma.** Takas, bir approve ve ardından `swapExactTokensForTokens` olarak çalışır; asgari çıktı kayma ayarınızdan türetilir ve test cüzdanının EVM anahtarı ile imzalanır. Fiyat toleransınızı aşarsa takas daha kötü bir fiyattan gerçekleşmek yerine geri alınır (revert).
- **İstek üzerine test token'ları.** **Get test tokens**, beş token'ın tamamını, token başına her 12 saatte bir talep eder.
- **Gerçek ile alıştırma arasında dürüst ayrım.** Diğer çiftler, Pools listesi, Add Liquidity ve My Positions bir testnet alıştırma alanıdır ve zincir üstünde değildir.

## Nasıl kullanılır {#how-to-use}

Ön koşullar: oturum açmış olmak ve bir test cüzdanı (bkz. [Cüzdan](/dashboard/wallet#testnet)). Bunlar olmadan sayfa "Wallet Required for Trading" gösterir.

### Swap

1. Banner, **Get test tokens** düğmesini sunar; önce bunu kullanın.
2. Ödeme yapacağınız token'ı seçin ve bir miktar girin. Varsayılan çift olan QOR - USDC, zincir üstünde sonuçlanmayan bir **alıştırma** çiftidir. Zincir üstü bir takas için **WQOR** ve **QUSDC** seçin (veya beş token'dan herhangi bir çifti).
3. Almak istediğiniz token'ı seçin; çıktı otomatik olarak fiyatlanır.
4. İsteğe bağlı olarak **kayma toleransını** ayarlayın (sayfanın bir varsayılanı vardır).
5. **Swap Now** öğesini, ardından **Confirm Swap** öğesini seçin. Sonuç, **View Transaction** ile birlikte "Swap Confirmed" gösterir.

**Recent Swaps**, tüm kullanıcıların takaslarını listeler; **Show My History** listeyi sizinkilerle sınırlar.

**Asgari örnek:** testnet'te **Get test tokens** öğesini seçin, biraz WQOR'u QUSDC karşılığında satın, **Swap Now**, **Confirm Swap**.

:::tip Kayma
Daha yüksek bir tolerans, hızlı hareket eden piyasalarda bir takasın gerçekleşme olasılığını artırır, ancak daha kötü bir fiyat alabilirsiniz. Varsayılan değer çoğu çift için uygundur.
:::

### Pools

İşlem çifti ve ayrıntıları için havuz kartlarına göz atın. Bir arama kutusu, token sembolüne göre filtreler. Bu havuzlar bir alıştırma alanıdır, zincir üstü likidite değildir ve üzerlerindeki rakamlar piyasa verisi değildir.

### Add Liquidity

1. Eşleştirilecek iki token'ı seçin (biri varsayılan olarak QOR'dur). Yeni bir çift için **Create Pool** kullanın.
2. İlk token için bir miktar girin; ikincisi havuz oranına uyacak şekilde dolar. Sayfa, bir havuz oluşturmak için bir asgari tutar belirtir.
3. Payınızı inceleyin, ardından onaylayın.

### My Positions

Her girdi token çiftini, her token'ın miktarını, payınızı ve kazanılan ücretleri gösterir. Bir pozisyondan çıkmak için **Withdraw** öğesini, ardından **Request Withdrawal (x%)** öğesini seçin; bir bekleme süresinden sonra **Confirm Withdraw** öğesini (veya **Cancel Withdrawal**) seçin. Tek bir "Remove Liquidity" düğmesi yoktur.

## Nasıl erişilir {#how-to-access}

- **URL:** [dashboard.qorechain.io/trade](https://dashboard.qorechain.io/trade).
- **Hesap:** oturum açmak gereklidir. Takas için bir test cüzdanı gerekir. Mainnet'te sayfa açılmadan önce bir kerelik [onay](/dashboard/overview#risk-acknowledgement) de gereklidir.
- **Ağ:** yalnızca testnet içeriği; üst bilgideki anahtar bunu değiştirmez.
- **Maliyet:** ücretsiz. Test token'ları **Get test tokens** ile gelir; test cüzdanı gas'ı [Faucet](/dashboard/faucet)'ten gelen test QOR ile öder.

## Nerede yayımlanır {#where-published}

| Yüzey | Adres | Ağ | Zincir üstünde sonuçlanır mı? |
| --- | --- | --- | --- |
| WQOR, QUSDC, QUSDT, QWETH, QWBTC takası | `dashboard.qorechain.io/trade` | Testnet EVM, chain ID 9800 | Evet |
| Diğer çiftler, Pools, Add Liquidity, My Positions | `dashboard.qorechain.io/trade` | Testnet | Hayır, alıştırma defteri |
| Yerel AMM | Bkz. [AMM](/architecture/amm) | Her iki ağ | Henüz havuz yok |

## Sınırlar ve bilinen sorunlar {#limits}

- **Mainnet ticareti yok.** Sayfa ağ anahtarını yok sayar ve mainnet'te de testnet içeriğini gösterir.
- **Yalnızca beş token zincir üstünde sonuçlanır.** [Faucet](/dashboard/faucet#fest-tokens)'teki fest token'ları bu sayfada yoktur.
- **Yerel AMM'nin** her iki ağda da **havuzu yoktur**. Gerçek havuzlar var olduklarında açıklanacaktır.
- **Havuz rakamları** alıştırma verisidir, piyasa verisi değildir.
- **Testnet token'larının değeri yoktur** ve hiçbir şeyle takas edilemez.

## İlgili

- [AMM ve Zincir Üstü Likidite](/architecture/amm) - havuz türleri ve fiyatlandırma eğrileri.
- [Cüzdan](/dashboard/wallet) - bir takastan önce ve sonra bakiyeleri kontrol edin.
