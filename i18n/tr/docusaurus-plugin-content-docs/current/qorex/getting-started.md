---
slug: /qorex/getting-started
title: QoreX'e Başlarken
sidebar_label: Başlarken
sidebar_position: 2
---

# QoreX'e Başlarken

Bu sayfa, **mobil uygulamanın** kurulumunu ve cüzdanınızı oluşturma, geri yükleme veya bağlama adımlarını anlatır. Masaüstü cüzdanı için Chrome, Firefox ve Safari üzerinde yayında olan [Tarayıcı Eklentisi](/qorex/browser-extension) sayfasına bakın.

:::note Mobil kullanılabilirlik
- **Android** — Google Play üzerinde mevcut: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — **TestFlight** aracılığıyla test için mevcut: https://testflight.apple.com/join/Xa9D7vgR — App Store sürümü hâlâ incelemede.
:::

## Başlamadan önce: cihazınızı güvene alın

Bir QoreX cüzdanı yalnızca cihazınızda **güçlü bir kilit açma faktörü** tanımlıysa oluşturulabilir veya içe aktarılabilir. Anahtarlarınızı donanım kasasında koruyan şey budur. Aşağıdakilerden herhangi biri yeterlidir:

- **iOS** — Face ID veya Touch ID.
- **Android** — Sınıf 3 bir biyometrik (parmak izi, iris veya 3B yüz tanıma) **veya** bir cihaz ekran kilidi (PIN, desen veya parola).

:::note Android 2B yüz tanıma
Kamera tabanlı 2B yüz tanıma (bazı cihazlarda bulunur, örneğin belirli Samsung modelleri) *zayıf* bir biyometrik sayılır. Elinizde yalnızca bu varsa, QoreX arkasındaki **PIN / desen** yöntemine dayanır — ve sistem sayfası bunu otomatik olarak sunar, dolayısıyla yine de korunmuş olursunuz.
:::

Güçlü bir faktör kayıtlı değilse, oluşturma/içe aktarma düğmeleri devre dışı kalır ve ekran neyi açmanız gerektiğini açıklar. Sistem ayarlarınızdan Face ID, parmak izi veya bir ekran kilidi tanımlayın, ardından QoreX'e dönün.

## İlk açılış

Uygulama, karşılama ekranını **yalnızca cihazda hiç cüzdan yokken** açar. Bir cüzdanınız olduktan sonra, sonraki her açılış doğrudan Ana Sayfa (Cüzdan) sekmesine gider. Bakiyeleri görüntülemek için biyometrik gerekmez; **bir işlemi imzalamak için her zaman gerekir**.

Kurulum için üç yolunuz var:

### 1. Yeni cüzdan oluşturun

1. **Yeni cüzdan oluştur** seçeneğine dokunun.
2. QoreX cihazınızda **24 kelimelik bir kurtarma ifadesi** üretir (256 bit entropi) ve QoreChain kimliğinizi türetir — coin türü 118, bir `qor1…` adresi (ETH ve SOL hesaplarınız da aynı tohumdan gelir).
3. **24 kelimeyi yazın** ve çevrimdışı saklayın. Cihazınızı kaybederseniz cüzdanınızı kurtarmanın **tek** yolu bu ifadedir.
4. İfadeyi onaylayın; QoreX bunu donanım destekli, biyometrik korumalı kasaya mühürler.

:::caution Kurtarma ifadeniz her şeydir
24 kelimenize sahip olan herkes paranızı kontrol eder ve QoreChain Association dahil hiç kimse bunları sizin için kurtaramaz. İfadenizi asla bir web sitesine yazmayın, paylaşmayın veya bir ekran görüntüsünde ya da bulut notunda saklamayın.
:::

### 2. Mevcut bir cüzdanı geri yükleyin

1. **Mevcut cüzdanı geri yükle** seçeneğine dokunun.
2. 24 kelimenizi sırayla yazın.
3. QoreX aynı adresleri yeniden türetir — cüzdanınız her cihazda birebir aynı görünür.

### 3. Başka bir cihazdan bağlayın

QoreX zaten başka bir telefonda veya tablette varsa, cüzdanı **sunucu olmadan ve hiçbir şey yazmadan** taşıyabilirsiniz — bkz. [Yeni bir cihaz bağlama](/qorex/security-and-recovery#link-device). Başlamak için yeni cihazda **Başka bir cihazdan bağla** seçeneğini seçin.

## İsteğe bağlı: bir @handle talep edin

Cüzdanınız oluşturulduktan sonra benzersiz bir **@handle** (örneğin `@liviu`) talep edebilirsiniz; böylece insanlar size bir `qor1…` adresi yerine adınızla gönderim yapabilir. Bu isteğe bağlıdır ve atlanabilir — cüzdanınız asla buna bağımlı değildir. Bkz. [Hesap ve Dashboard](/qorex/account-and-dashboard#handle).

## Sonraki adımlar

- [Gönderme ve Alma](/qorex/send-and-receive) — ilk kuantum güvenli transferinizi yapın.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — asla dışarıda kalmamak için sosyal kurtarmayı ayarlayın.
- [Portföy ve Stake](/qorex/portfolio-and-staking) — varlıkları takip edin ve stake ödülleri kazanın.
