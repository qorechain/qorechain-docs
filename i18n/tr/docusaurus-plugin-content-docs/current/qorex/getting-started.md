---
slug: /qorex/getting-started
title: QoreX ile Başlarken
sidebar_label: Başlarken
sidebar_position: 2
---

# QoreX ile Başlarken

Bu sayfa, mobil uygulamanın kurulumunu ve cüzdanınızı oluşturma, geri yükleme veya bağlama adımlarını anlatır.

## Başlamadan önce: cihazınızı güvenceye alın

Bir QoreX cüzdanı yalnızca cihazınızda **güçlü bir kilit açma faktörü** kurulu olduğunda oluşturulabilir veya içe aktarılabilir. Anahtarlarınızı donanım kasasında koruyan şey budur. Aşağıdakilerden herhangi biri uygundur:

- **iOS** — Face ID veya Touch ID.
- **Android** — bir Class-3 biyometrik (parmak izi, iris veya 3D yüz ile kilit açma) **veya** bir cihaz ekran kilidi (PIN, pattern veya password).

:::note Android 2D yüz ile kilit açma
Kamera tabanlı 2D yüz ile kilit açma (bazı cihazlarda bulunur, örneğin belirli Samsung modelleri) *zayıf* bir biyometrik sayılır. Elinizde yalnızca bu varsa, QoreX bunun arkasındaki **PIN / pattern** üzerine dayanır — ve sistem sayfası bunu otomatik olarak sunar, yani yine de korunmuş olursunuz.
:::

Kayıtlı güçlü bir faktör yoksa, oluştur/içe aktar düğmeleri devre dışı kalır ve ekran neyi açmanız gerektiğini açıklar. Sistem ayarlarınızda Face ID, bir parmak izi veya bir ekran kilidi kurun, ardından QoreX'e dönün.

## İlk açılış

Uygulama, **cihazda hiçbir cüzdan bulunmadığında yalnızca** tanıtım ekranında açılır. Bir cüzdanınız olduğunda, sonraki her açılış doğrudan Ana Sayfa (Cüzdan) sekmesine gider. Bakiyeleri görüntülemek için biyometrik gerekmez; **bir işlemi imzalamak için ise her zaman gerekir**.

Kurulum için üç yolunuz vardır:

### 1. Yeni bir cüzdan oluşturun

1. **Create a new wallet** öğesine dokunun.
2. QoreX cihazınızda **24 kelimelik bir kurtarma ifadesi** üretir (256 bit entropi) ve QoreChain kimliğinizi türetir — coin type 118, bir `qor1…` adresi (ETH ve SOL hesaplarınız aynı tohumdan gelir).
3. **24 kelimeyi bir yere yazın** ve çevrimdışı saklayın. Bu ifade, cihazınızı kaybederseniz cüzdanınızı kurtarmanın **tek** yoludur.
4. İfadeyi onaylayın; QoreX bunu donanım destekli, biyometrik korumalı kasada mühürler.

:::caution Kurtarma ifadeniz her şeydir
24 kelimenize sahip olan herkes fonlarınızı kontrol eder ve QoreChain Association dahil hiç kimse bunları sizin için kurtaramaz. İfadenizi asla bir web sitesine yazmayın, paylaşmayın veya bir ekran görüntüsünde ya da bulut notunda saklamayın.
:::

### 2. Mevcut bir cüzdanı geri yükleyin

1. **Restore existing wallet** öğesine dokunun.
2. 24 kelimenizi sırasıyla yazın.
3. QoreX aynı adresleri yeniden türetir — cüzdanınız herhangi bir cihazda birebir aynı görünür.

### 3. Başka bir cihazdan bağlayın

Başka bir telefon veya tablette zaten QoreX'iniz varsa, cüzdanı **sunucu ve yazma olmadan** taşıyabilirsiniz — [Yeni bir cihaz bağlama](/qorex/security-and-recovery#link-device) bölümüne bakın. Başlamak için yeni cihazda **Link from another device** öğesini seçin.

## İsteğe bağlı: bir @handle talep edin

Cüzdanınız oluşturulduktan sonra, insanların bir `qor1…` adresi yerine size adla gönderebilmesi için benzersiz bir **@handle** (örneğin `@liviu`) talep edebilirsiniz. Bu isteğe bağlıdır ve atlanabilir — cüzdanınız asla buna bağımlı olmaz. [Hesap ve Dashboard](/qorex/account-and-dashboard#handle) bölümüne bakın.

## Sonraki adımlar

- [Gönder ve Al](/qorex/send-and-receive) — ilk kuantum güvenli transferinizi yapın.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — asla kilitli kalmamanız için sosyal kurtarmayı ayarlayın.
- [Portföy ve Staking](/qorex/portfolio-and-staking) — varlıkları izleyin ve staking ödülleri kazanın.
