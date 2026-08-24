---
slug: /qorex/getting-started
title: QoreX ile Başlarken
sidebar_label: Başlarken
sidebar_position: 2
---

# QoreX ile Başlarken

Bu sayfa, **mobil uygulamanın** kurulumunu ve cüzdanınızı oluşturma, geri yükleme veya bağlama adımlarını anlatır. Masaüstü cüzdan için Chrome, Firefox ve Safari'de yayında olan [Tarayıcı Eklentisi](/qorex/browser-extension) sayfasına bakın.

:::note Mobil kullanılabilirlik
- **Android** — Google Play'de canlı: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — App Store'da canlı: https://apps.apple.com/us/app/qorex-wallet/id6791256626
:::

## Başlamadan önce: cihazınızı güvenceye alın

Bir QoreX cüzdanı yalnızca cihazınızda **güçlü bir kilit açma faktörü** kurulu olduğunda oluşturulabilir veya içe aktarılabilir. Anahtarlarınızı donanım kasasında koruyan şey budur. Aşağıdakilerden herhangi biri yeterlidir:

- **iOS** — Face ID veya Touch ID.
- **Android** — Sınıf-3 bir biyometri (parmak izi, iris veya 3D yüz tanıma) **veya** bir cihaz ekran kilidi (PIN, desen ya da şifre).

:::note Android 2D yüz tanıma
Bazı cihazlarda bulunan (örneğin belirli Samsung modellerinde) kamera tabanlı 2D yüz tanıma, *zayıf* bir biyometri olarak sayılır. Elinizde yalnızca bu varsa, QoreX arkasındaki **PIN / desen** özelliğine dayanır — sistem paneli bunu otomatik olarak sunar, dolayısıyla yine de korunursunuz.
:::

Güçlü bir faktör kayıtlı değilse, oluştur/içe aktar düğmeleri devre dışı kalır ve ekran neyi açmanız gerektiğini açıklar. Sistem ayarlarınızdan Face ID, parmak izi veya ekran kilidi kurun, ardından QoreX'e geri dönün.

## İlk açılış

Uygulama, onboarding ekranını **yalnızca cihazda hiçbir cüzdan yokken** açar. Bir cüzdanınız olduktan sonra, sonraki her açılış doğrudan Ana Sayfa (Cüzdan) sekmesine gider. Bakiyeleri görüntülemek için biyometri gerekmez; **bir işlemi imzalamak her zaman gerektirir**.

Kurulum için üç yolunuz var:

### 1. Yeni bir cüzdan oluşturun

1. **Yeni bir cüzdan oluştur**'a dokunun.
2. QoreX, cihazınızda **24 kelimelik bir kurtarma ifadesi** (256 bit entropi) üretir ve QoreChain kimliğinizi türetir — coin type 118, bir `qor1…` adresi (ETH ve SOL hesaplarınız aynı tohumdan gelir).
3. **24 kelimeyi yazıya dökün** ve çevrimdışı olarak saklayın. Bu ifade, cihazınızı kaybetmeniz durumunda cüzdanınızı kurtarmanın **tek** yoludur.
4. İfadeyi onaylayın; QoreX bunu donanım destekli, biyometri korumalı kasaya kilitler.

:::caution Kurtarma ifadeniz her şeydir
24 kelimenize sahip olan herkes fonlarınızı kontrol eder ve QoreChain Association dahil hiç kimse bunları sizin için kurtaramaz. İfadenizi asla bir web sitesine yazmayın, paylaşmayın veya bir ekran görüntüsünde ya da bulut notunda saklamayın. **QoreX'i kaldırmak, o cihazda saklanan anahtarları siler** — yazılı ifadeniz (veya önceden kurulmuş [sosyal kurtarma](/qorex/security-and-recovery#social-recovery)) olmadan, kaldırma işlemi erişimin kalıcı olarak kaybı anlamına gelir. Cüzdanı fonlamadan önce yedekleyin, sonra değil.
:::

### 2. Mevcut bir cüzdanı geri yükleyin

1. **Mevcut cüzdanı geri yükle**'ye dokunun.
2. 24 kelimenizi sırayla yazın.
3. QoreX aynı adresleri yeniden türetir — cüzdanınız herhangi bir cihazda aynı görünür.

### 3. Başka bir cihazdan bağlayın

QoreX'i başka bir telefonunuzda veya tabletinizde zaten kullanıyorsanız, cüzdanı **sunucu olmadan ve yazmadan** karşıya taşıyabilirsiniz — bkz. [Yeni bir cihaz bağlayın](/qorex/security-and-recovery#link-device). Başlamak için yeni cihazda **Başka bir cihazdan bağla**'yı seçin.

## İsteğe bağlı: bir @kullanıcı adı alın

Cüzdanınız oluşturulduktan sonra, insanların size bir `qor1…` adresi yerine isimle gönderim yapabilmesi için benzersiz bir **@kullanıcı adı** (örneğin `@liviu`) talep edebilirsiniz. Bu isteğe bağlıdır ve atlanabilir — cüzdanınız asla buna bağlı değildir. Bir kullanıcı adı, cüzdanın tamamına değil belirli bir adrese bağlanır; bu, birden fazla hesabınız olduğunda önem kazanır — bkz. [Tek bir ifadeden birden fazla hesap](/qorex/account-and-dashboard#accounts) ve [@kullanıcı adı](/qorex/account-and-dashboard#handle).

## Dil

QoreX on dilde sunulur — İngilizce, Rumence, Almanca, İspanyolca, Fransızca, İtalyanca, Türkçe, Arapça, Japonca ve Korece — ve telefonunuzun dilini otomatik olarak takip eder, bunların dışındaki her şey için İngilizceye geri döner. Algılanan dili istediğiniz zaman **Ayarlar → Dil** üzerinden değiştirebilirsiniz; Arapça'yı seçmek arayüzü sağdan sola olacak şekilde de değiştirir.

## Sonraki adımlar

- [Gönder ve Al](/qorex/send-and-receive) — ilk kuantum güvenli transferinizi yapın.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — asla erişiminizi kaybetmemek için sosyal kurtarma kurun.
- [Portföy ve Staking](/qorex/portfolio-and-staking) — varlıkları takip edin ve staking ödülleri kazanın.
