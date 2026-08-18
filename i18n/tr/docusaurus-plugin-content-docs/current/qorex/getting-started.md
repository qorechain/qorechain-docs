---
slug: /qorex/getting-started
title: QoreX ile Başlarken
sidebar_label: Başlarken
sidebar_position: 2
---

# QoreX ile Başlarken

Bu sayfa, **mobil uygulamanın** kurulumunu ve cüzdanınızı oluşturmayı, geri yüklemeyi veya bağlamayı adım adım anlatır. Masaüstü cüzdanı için, Chrome, Firefox ve Safari üzerinde canlı olan [Tarayıcı Eklentisi](/qorex/browser-extension) sayfasına bakın.

:::note Mobil kullanılabilirliği
QoreX mobil uygulaması şu anda herkese açık test aşamasındadır:

- **Android** — Google Play üzerinde **herkese açık test** için mevcut.
- **iOS** — denemek isterseniz **TestFlight** aracılığıyla test için mevcut.

Güncel bağlantıları [qorechain.io](https://qorechain.io) adresinde bulabilirsiniz.
:::

## Başlamadan önce: cihazınızı güvenceye alın

Bir QoreX cüzdanı yalnızca cihazınızda **güçlü bir kilit açma faktörü** ayarlandığında oluşturulabilir veya içe aktarılabilir. Anahtarlarınızı donanım kasasında koruyan şey budur. Aşağıdakilerden herhangi biri geçerlidir:

- **iOS** — Face ID veya Touch ID.
- **Android** — Class-3 bir biyometri (parmak izi, iris veya 3D yüz kilidi) **ya da** bir cihaz ekran kilidi (PIN, desen veya parola).

:::note Android 2D yüz kilidi
Kamera tabanlı 2D yüz kilidi (bazı cihazlarda, örneğin belirli Samsung modellerinde bulunur) *zayıf* bir biyometri sayılır. Elinizde yalnızca bu varsa, QoreX arkasındaki **PIN / desen** üzerine dayanır — ve sistem paneli bunu otomatik olarak sunar, yani yine de koruma altındasınız.
:::

Kayıtlı güçlü bir faktör yoksa oluştur/içe aktar düğmeleri devre dışı kalır ve ekran neyin açılması gerektiğini açıklar. Sistem ayarlarınızdan Face ID, bir parmak izi veya bir ekran kilidi ayarlayın, ardından QoreX'e geri dönün.

## İlk açılış

Uygulama, **cihazda hiçbir cüzdan bulunmadığında yalnızca** giriş ekranıyla açılır. Bir cüzdanınız olduğunda, sonraki her açılış doğrudan Ana Sayfa (Cüzdan) sekmesine gider. Bakiyeleri görüntülemek biyometri gerektirmez; **bir işlemi imzalamak her zaman gerektirir**.

Kurulum için üç yolunuz var:

### 1. Yeni bir cüzdan oluşturun

1. **Yeni bir cüzdan oluştur** öğesine dokunun.
2. QoreX cihazınızda bir **24 kelimelik kurtarma ifadesi** oluşturur (256-bit entropi) ve QoreChain kimliğinizi türetir — coin type 118, bir `qor1…` adresi (ETH ve SOL hesaplarınız aynı tohumdan gelir).
3. **24 kelimeyi yazın** ve çevrimdışı saklayın. Bu ifade, cihazı kaybederseniz cüzdanınızı kurtarmanın **tek** yoludur.
4. İfadeyi onaylayın; QoreX bunu donanım destekli, biyometri korumalı kasada mühürler.

:::caution Kurtarma ifadeniz her şeydir
24 kelimenize sahip olan herkes fonlarınızı kontrol eder ve QoreChain Association dahil hiç kimse bunları sizin için kurtaramaz. İfadenizi asla bir web sitesine yazmayın, paylaşmayın veya bir ekran görüntüsünde ya da bulut notunda saklamayın.
:::

### 2. Mevcut bir cüzdanı geri yükleyin

1. **Mevcut cüzdanı geri yükle** öğesine dokunun.
2. 24 kelimenizi sırayla yazın.
3. QoreX aynı adresleri yeniden türetir — cüzdanınız herhangi bir cihazda aynı görünür.

### 3. Başka bir cihazdan bağlayın

QoreX'i zaten başka bir telefonda veya tablette kullanıyorsanız, cüzdanı **sunucu olmadan ve yazmadan** taşıyabilirsiniz — bkz. [Yeni bir cihaz bağla](/qorex/security-and-recovery#link-device). Başlamak için yeni cihazda **Başka bir cihazdan bağla** öğesini seçin.

## İsteğe bağlı: bir @handle talep edin

Cüzdanınız oluşturulduktan sonra, insanların size bir `qor1…` adresi yerine adınızla gönderim yapabilmesi için benzersiz bir **@handle** (örneğin `@liviu`) talep edebilirsiniz. Bu isteğe bağlıdır ve atlanabilir — cüzdanınız asla buna bağlı değildir. Bkz. [Hesap ve Kontrol Paneli](/qorex/account-and-dashboard#handle).

## Sonraki adımlar

- [Gönder ve Al](/qorex/send-and-receive) — ilk kuantum-güvenli transferinizi yapın.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — asla kilitli kalmamak için sosyal kurtarmayı ayarlayın.
- [Portföy ve Staking](/qorex/portfolio-and-staking) — varlıkları takip edin ve staking ödülleri kazanın.
