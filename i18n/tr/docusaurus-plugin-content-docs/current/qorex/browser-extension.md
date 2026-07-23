---
slug: /qorex/browser-extension
title: Tarayıcı Uzantısı
sidebar_label: Tarayıcı Uzantısı
sidebar_position: 8
---

# Tarayıcı Uzantısı

QoreX **tarayıcı uzantısı**, masaüstü için **dApp bağlayıcısıdır**. **Chrome ve Firefox** üzerinde çalışır ve aynı kod tabanından bir **Safari** derlemesi de sunulur (Apple'ın Safari web uzantısı sarmalayıcısıyla paketlenir — Safari'de onaylar bir açılır pencere yerine bir tarayıcı sekmesinde açılır). Web sitelerinin cüzdanınızı keşfetmesini sağlar ve her isteği açık bir onaya dönüştürür. Kavramsal olarak mobil uygulamayla eşleşir ve staking, portföy veya hesap özelliklerini **içermez** — bunlar uygulamada bulunur.

## Kurulum

Uzantı, **QoreX mobil uygulamasında** oluşturulmuş bir cüzdanla eşleşir. Eşleştirmeden önce açılır pencereyi açarsanız, şu mesajı gösterir: **"Henüz cüzdan yok — QoreX uygulamasında bir tane oluşturun."**

## Kilit açma

Açılır pencere **kasa parolanızı** ister (veya tarayıcının parola anahtarından türetilen anahtarları desteklediği yerlerde bir parola anahtarı). Kasa, uzantı deposunda AES-256-GCM ile şifrelenir, otomatik olarak kilitlenir ve her kilit açma işlemi açıktır.

## dApp'lere bağlanma

Web siteleri QoreX'i **EIP-6963** (çoklu cüzdan standardı) ve QoreChain connect sözleşmesi aracılığıyla keşfeder. QoreX, `window.ethereum` veya `window.keplr` değerlerinin **üzerine asla yazmaz** — diğer cüzdanların **yanında** görünür ve her site için hangi cüzdanı kullanacağınızı siz seçersiniz.

1. Bir site bağlantı ister; onay açılır penceresi **kaynağı** (origin) gösterir.
2. Onaylamak, o kaynağa yalnızca **genel adresinizi** açığa çıkarır.
3. Onaylar **kaynak başınadır** (per-origin), tarayıcı yeniden başlatmaları arasında kalıcıdır ve bir sitenin onayı başka bir siteye hiçbir şey vermez.

## İmzalama

Her imza isteği, **çözümlenmiş yükü** gösteren bir onay penceresi açar — alıcı, tutar, ağ — asla çıplak bir karma (hash) değil.

- Native-lane QoreChain işlemleri için uzantı, **kuantum sonrası katmanı dApp'in sağladığını** belirtir (cüzdan klasik yarıyı imzalar — yerleşik cüzdanların kullandığı aynı desen).
- Bir istek **yalnızca klasikse**, açılır pencere açık bir uyarı gösterir: **"⚠ Bu istek klasik bir imzadır — uygulama kuantuma dayanıklı bir katman eklemedi."**
- **Reddet** her zaman tek tıklamadır ve istekler kendiliğinden sona erer.

## Harici ağlarda gönderme

Açılır pencereden **ETH / BNB / POL / ARB / SOL** ve **ERC-20 / SPL** token'ları gönderebilirsiniz (uygulamayla aynı seed türevleri). Göndermeden önce klasik imza notunu onaylamanız gerekir; bir sonuç bağlantısı blok gezginini açar.

## Ağlar ve güvenlik duruşu

- **Aktif ağ** — varsayılan olarak QoreChain **mainnet** (EVM lane'inde zincir `0x2649`). Testnet, bunu talep eden dApp'ler için desteklenmeye devam eder ve ağlar arası imza istekleri reddedilir.
- **İzinler** — uzantı **yalnızca `storage`** ister. İçerik betiği yalnızca sağlayıcı API'lerini enjekte eder; cüzdan istekleri dışında sayfa içeriğini okumaz ve analiz veya uzaktan kod yoktur.
