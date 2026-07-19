---
slug: /qorex/browser-extension
title: Tarayıcı Uzantısı
sidebar_label: Tarayıcı Uzantısı
sidebar_position: 8
---

# Tarayıcı Uzantısı

QoreX **tarayıcı uzantısı** (Chrome ve Firefox; birebir aynı işlevselliğe sahip bir Safari sürümü de yolda) masaüstü için **dApp bağlayıcısıdır**. Web sitelerinin cüzdanınızı keşfetmesini sağlar ve her isteği açık bir onaya dönüştürür. Kavramsal olarak mobil uygulamayla eşleşir ve staking, portföy veya hesap özelliklerini **içermez** — bunlar uygulamada yer alır.

## Kurulum

Uzantı, **QoreX mobil uygulamasında** oluşturulan bir cüzdanla eşleşir. Eşleştirmeden önce açılır pencereyi açarsanız, **"Henüz cüzdan yok — QoreX uygulamasında bir tane oluşturun."** yazar.

## Kilit açma

Açılır pencere **vault parolanızı** ister (veya tarayıcı passkey türetmeli anahtarları destekliyorsa bir passkey). Vault, uzantı depolamasında AES-256-GCM ile şifrelenir, otomatik olarak kilitlenir ve her kilit açma açıktır.

## dApp'lere bağlanma

Web siteleri QoreX'i **EIP-6963** (çoklu cüzdan standardı) ve QoreChain connect sözleşmesi aracılığıyla keşfeder. QoreX, `window.ethereum` veya `window.keplr` üzerine **asla yazmaz** — diğer cüzdanların **yanında** görünür ve her site için hangi cüzdanı kullanacağınızı siz seçersiniz.

1. Bir site bağlantı ister; onay açılır penceresi **kaynağı (origin)** gösterir.
2. Onaylamak, o kaynağa yalnızca **genel adresinizi** ifşa eder.
3. Onaylar **kaynak başınadır**, tarayıcı yeniden başlatmaları boyunca kalıcıdır ve bir sitenin onayı başka bir siteye hiçbir şey vermez.

## İmzalama

Her imza isteği, **çözümlenmiş yükü** — alıcı, tutar, ağ — gösteren bir onay penceresi açar; asla çıplak bir hash değil.

- Native-lane QoreChain işlemleri için uzantı, **post-kuantum katmanını dApp'in sağladığını** belirtir (cüzdan klasik yarıyı imzalar — köklü cüzdanların kullandığı aynı desen).
- Bir istek **yalnızca klasikse**, açılır pencere açık bir uyarı gösterir: **"⚠ Bu istek klasik bir imzadır — uygulama kuantuma dayanıklı bir katman eklemedi."**
- **Reddet** her zaman tek tıklamadır ve istekler kendiliğinden sona erer.

## Harici ağlarda gönderme

Açılır pencereden **ETH / BNB / POL / ARB / SOL** ve **ERC-20 / SPL** token'ları gönderebilirsiniz (uygulamayla aynı seed türevleri). Göndermeden önce klasik imza notunu onaylamanız gerekir; bir sonuç bağlantısı blok gezginini açar.

## Ağlar ve güvenlik duruşu

- **Aktif ağ** — varsayılan olarak QoreChain **mainnet** (EVM lane'inde `0x2649` zinciri). Testnet, bunu isteyen dApp'ler için desteklenmeye devam eder ve ağlar arası imza istekleri reddedilir.
- **İzinler** — uzantı **yalnızca `storage`** ister. İçerik betiği yalnızca sağlayıcı API'lerini enjekte eder; cüzdan istekleri dışında sayfa içeriğini okumaz ve analitik ile uzaktan kod yoktur.
