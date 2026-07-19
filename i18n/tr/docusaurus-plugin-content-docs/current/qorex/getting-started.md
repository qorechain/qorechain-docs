---
slug: /qorex/getting-started
title: QoreX'e Başlangıç
sidebar_label: Başlangıç
sidebar_position: 2
---

# QoreX'e Başlangıç

Bu sayfa, mobil uygulamanın kurulumunu ve cüzdanınızı oluşturma, geri yükleme veya bağlama adımlarını anlatır.

## Başlamadan önce: cihazınızı güvenceye alın

Bir QoreX cüzdanı yalnızca cihazınızda **biyometrik koruma** tanımlıysa oluşturulabilir veya içe aktarılabilir — iOS'ta Face ID / Touch ID, Android'de ise bir parmak izi / eşdeğer güçlü faktör. Anahtarlarınızı donanım kasasında koruyan şey budur.

Hiçbir biyometrik tanımlı değilse, oluştur/içe aktar düğmeleri devre dışı kalır ve ekran neyi açmanız gerektiğini açıklar. Sistem ayarlarınızda Face ID veya bir parmak izi tanımlayın, ardından QoreX'e geri dönün.

## İlk açılış

Uygulama, tanıtım ekranıyla **yalnızca cihazda hiçbir cüzdan bulunmadığında** açılır. Bir cüzdanınız olduğunda, sonraki her açılış doğrudan Ana Sayfa (Cüzdan) sekmesine gider. Bakiyeleri görüntülemek için biyometrik gerekmez; **bir işlemi imzalamak ise her zaman gerektirir**.

Kurulum için üç yolunuz var:

### 1. Yeni bir cüzdan oluşturun

1. **Create a new wallet** öğesine dokunun.
2. QoreX, cihazınızda bir **24 kelimelik kurtarma ifadesi** üretir (256-bit entropi) ve QoreChain kimliğinizi türetir — coin type 118, bir `qor1…` adresi (ETH ve SOL hesaplarınız aynı tohumdan gelir).
3. **24 kelimeyi yazın** ve çevrimdışı saklayın. Bu ifade, cihazınızı kaybederseniz cüzdanınızı kurtarmanın **tek** yoludur.
4. İfadeyi onaylayın; QoreX onu donanım destekli, biyometrik korumalı kasada mühürler.

:::caution Kurtarma ifadeniz her şeydir
24 kelimenize sahip olan herkes fonlarınızı kontrol eder ve hiç kimse — QoreChain Association dahil — onları sizin için kurtaramaz. İfadenizi asla bir web sitesine yazmayın, paylaşmayın veya bir ekran görüntüsünde ya da bulut notunda saklamayın.
:::

### 2. Mevcut bir cüzdanı geri yükleyin

1. **Restore existing wallet** öğesine dokunun.
2. 24 kelimenizi sırasıyla yazın.
3. QoreX aynı adresleri yeniden türetir — cüzdanınız herhangi bir cihazda aynı görünür.

### 3. Başka bir cihazdan bağlayın

Başka bir telefonda veya tablette zaten QoreX'iniz varsa, cüzdanı **sunucu ve yazma olmadan** cihazlar arasında taşıyabilirsiniz — bkz. [Yeni bir cihaz bağlama](/qorex/security-and-recovery#link-device). Başlamak için yeni cihazda **Link from another device** öğesini seçin.

## İsteğe bağlı: bir @handle talep edin

Cüzdanınız oluşturulduktan sonra, insanların size bir `qor1…` adresi yerine adla gönderebilmesi için benzersiz bir **@handle** (örneğin `@liviu`) talep edebilirsiniz. Bu isteğe bağlıdır ve atlanabilir — cüzdanınız buna asla bağımlı değildir. Bkz. [Hesap ve Dashboard](/qorex/account-and-dashboard#handle).

## Sonraki adımlar

- [Gönder ve Al](/qorex/send-and-receive) — ilk kuantum güvenli transferinizi yapın.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — asla kilitli kalmamak için sosyal kurtarmayı ayarlayın.
- [Portföy ve Staking](/qorex/portfolio-and-staking) — varlıkları takip edin ve staking ödülleri kazanın.
