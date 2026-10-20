---
slug: /qorex/getting-started
title: QoreX ile Başlarken
sidebar_label: Başlarken
sidebar_position: 2
---

# QoreX ile Başlarken

Bu sayfa, **mobil uygulamanın** kurulumunu ve cüzdanınızı oluşturma, geri yükleme veya bağlama adımlarını anlatır. Masaüstü cüzdan için Chrome, Firefox ve Safari'de yayında olan [Tarayıcı Eklentisi](/qorex/browser-extension) sayfasına bakın.

:::note Mobil kullanılabilirlik
- **Android** — Google Play'de canlı (Android 7.0 veya üzeri): https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — App Store'da canlı (iOS 15.1 veya üzeri): https://apps.apple.com/us/app/qorex-wallet/id6791256626
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
2. QoreX, cihazınızda **24 kelimelik bir kurtarma ifadesi** (256 bit entropi) üretir, bunu doğrudan donanım destekli, biyometri korumalı kasaya kilitler ve QoreChain kimliğinizi türetir — coin type 118, bir `qor1…` adresi (ETH ve SOL hesaplarınız aynı tohumdan gelir). **Uygulama, cüzdanı oluştururken ifadeyi size göstermez.**
3. **İfadeyi görüntüleyin ve hemen yazıya dökün:** **Ayarlar → Güvenlik → Kurtarma ifadesini göster**'i açın, biyometri veya cihaz PIN'inizle onaylayın ve 24 kelimeyi sırayla kâğıda kopyalayın. Çevrimdışı olarak saklayın. Bu ifade, cihazınızı kaybetmeniz durumunda cüzdanınızı kurtarmanın **tek** yoludur.
4. İsteğe bağlı olarak [sosyal kurtarma](/qorex/security-and-recovery#social-recovery) kurun. Ana Sayfa'daki **Yedek durumu** kartının yalnızca sosyal kurtarmayı takip ettiğini unutmayın — ifadeyi yazıp yazmadığınızı bilemez, bu yüzden size hatırlatmaz.

:::danger 3. adımı şimdi yapın — uygulamada hiçbir şey size hatırlatmayacak
Uygulama cüzdanı oluşturduktan sonra doğrudan Ana Sayfa'ya geçtiği için, ifadeyi hiç yazmadan devam etmek kolaydır. **Herhangi bir şey almadan veya göndermeden önce yapın.** Yazılı ifade ya da önceden kurulmuş bir [sosyal kurtarma](/qorex/security-and-recovery#social-recovery) olmadan uygulamayı kaybederseniz veya kaldırırsanız ya da telefonunuzu kaybederseniz, QoreChain Association dahil hiç kimse fonlarınızı geri getiremez.
:::

:::caution Kurtarma ifadeniz her şeydir
24 kelimenize sahip olan herkes fonlarınızı kontrol eder ve QoreChain Association dahil hiç kimse bunları sizin için kurtaramaz. İfadenizi asla bir web sitesine yazmayın, paylaşmayın veya bir ekran görüntüsünde ya da bulut notunda saklamayın. **QoreX'i kaldırmak, o cihazda saklanan anahtarları siler** — yazılı ifadeniz (veya önceden kurulmuş [sosyal kurtarma](/qorex/security-and-recovery#social-recovery)) olmadan, kaldırma işlemi erişimin kalıcı olarak kaybı anlamına gelir. Cüzdanı fonlamadan önce yedekleyin, sonra değil.
:::

### 2. Mevcut bir cüzdanı geri yükleyin {#2-restore-an-existing-wallet}

1. **Mevcut cüzdanı geri yükle**'ye dokunun.
2. **Kurtarma ifadesi**'ni (24 kelimenizi yazmışsanız) veya **Sosyal kurtarma**'yı (koruyucular kurduysanız ve artık ifadeye sahip değilseniz — bkz. [Sosyal kurtarma](/qorex/security-and-recovery#social-recovery)) seçin.
3. Kurtarma ifadesi yolunda: 24 kelimenizi sırayla yazın. QoreX büyük/küçük harf ve gereksiz boşlukları normalleştirir, ifadeyi kontrol eder ve bir kelime doğrulanmazsa genel bir hata yerine açıkça bunu belirtir.
4. QoreX aynı adresleri yeniden türetir — cüzdanınız herhangi bir cihazda aynı görünür.

:::note Ek hesaplar tek tek geri gelir
İfadeden geri yükleme **Hesap 1**'i getirir. Eski cüzdanda birden fazla hesap kullandıysanız, sonrakileri geri getirmek için **Hesap ekle**'ye (Ayarlar → Hesaplarınız) dokunun — aynı ifadeden türetildikleri için aynı adreslerde yeniden görünürler. Ethereum tarzı hesaplar **Ethereum hesabı ekle (coin 60)** ile eklenir; bkz. [MetaMask'ten veya Dashboard'dan bir ifadeyi geri yükleyin](#restore-dashboard). Bunları eski cüzdanda oluşturduğunuz sırayla ekleyin: hesaplar yuvaya göre numaralandırılır ve yeni bir cihazda farklı bir sıra, bir yuvada farklı bir hesap verebilir.
:::

### 3. Başka bir cihazdan bağlayın

QoreX'i başka bir telefonunuzda veya tabletinizde zaten kullanıyorsanız, cüzdanı **sunucu olmadan ve yazmadan** karşıya taşıyabilirsiniz — bkz. [Yeni bir cihaz bağlayın](/qorex/security-and-recovery#link-device). Başlamak için yeni cihazda **Başka bir cihazdan bağla**'yı seçin.

## Tek cihazda birden fazla cüzdan {#several-wallets}

Her cüzdanın **kendi kurtarma ifadesi** vardır. Bir telefonda birden fazla cüzdan tutabilirsiniz — örneğin ana cüzdanınız ve başka bir hizmetten geri yüklenmiş bir cüzdan — ve tek dokunuşla aralarında geçiş yapabilirsiniz.

- **Mobil:** Ayarlar → **Cüzdanlar** bu telefondaki cüzdanları listeler. Birini etkin cüzdan yapmak için dokunun — uygulamanın tamamı ona geçer (zincirde hiçbir şey taşınmaz). **Cüzdan ekle** yeni bir cüzdan oluşturmanıza, kurtarma ifadesinden bir cüzdan geri yüklemenize veya başka bir cihazdan bir cüzdan bağlamanıza olanak tanır; mevcut cüzdanlarınız kalır. Telefonda zaten bulunan bir ifadeyi geri yüklemek yalnızca o cüzdana geçiş yapar.
- **Eklenti:** açılır pencerenin **Cüzdanlar** ekranı aynı işi yapar ve hepsi için **tek bir parola** kullanılır. Bir cüzdan eklemek veya kaldırmak, kasayı yeniden mühürlemek için parolanızı bir kez ister ve passkey ile kilit açmayı kapatır (ana ekrandan yeniden açın).
- **Bir cüzdanı kaldırmak** (*Bu telefondan kaldır* / *Bu tarayıcıdan kaldır*) o cüzdanın anahtarını cihazdan siler. Fonlarınız zincirde kalır, ancak onu yalnızca kurtarma ifadesi geri getirebilir — önce yazıya dökün.

## MetaMask'ten veya Dashboard'dan bir ifadeyi geri yükleyin {#restore-dashboard}

QoreX, varsayılan olarak `qor1…` adresinizi bir kurtarma ifadesinden coin type **118** üzerinden türetir. İlk olarak MetaMask'te — veya QoreChain Dashboard'unda oluşturulan bir cüzdanda — kullanılmış bir ifade, QOR'unu bunun yerine **Ethereum tarzı** bir adreste (coin type **60**) tutar; bu yüzden onu geri yüklediğinizde boş bir **Hesap 1** görürsünüz. Hiçbir şey kaybolmadı; Ethereum tarzı hesabı ekleyin:

1. QoreX'i mağazanızdan güncel sürüme güncelleyin.
2. **Cüzdan ekleyin** (Ayarlar → Cüzdanlar → *Cüzdan ekle* → *Mevcut cüzdanı geri yükle*) ve ifadeyi girin. Mevcut cüzdanınız olduğu yerde kalır. Eklentide: **Cüzdanlar** → geri yükle.
3. Ayarlar → **Hesaplarınız**'ı açın ve **Ethereum hesabı ekle (coin 60)**'a dokunun. İlk dokunuş hesabı 0 dizininde ekler — MetaMask'in bu kelimeler için gösterdiği aynı `0x…` adresi ve o hesap için QoreChain `qor1…` adresinizle aynı anahtar. QOR'unuz orada durur.
4. O hesaba geçin (*Ethereum · coin 60* etiketlidir). Ondan gönderebilir, staking yapabilir ve ödül talep edebilirsiniz. İlk gönderim ayrıca o hesabın kuantum sonrası anahtarını da kaydeder; bunun küçük, tek seferlik bir ücreti vardır.

Ethereum tarzı bir hesabın @kullanıcı adı yoktur (kullanıcı adları coin type 118'deki bir QoreChain `qor1…` hesabında talep edilir) ve web siteleri bununla `signDirect` yerine `signAndBroadcast` üzerinden imzalar. Aynı zamanda [EVM erişim penceresinin](/qorex/security-and-recovery#evm-window) önem taşıdığı hesap türüdür: MetaMask aynı anahtarla imzalar, dolayısıyla bir pencere açıldığında MetaMask işlemleri bu hesabın QOR'unu taşıyabilir. **Ethereum hesabı ekle (coin 60)**'a her dokunuş bir sonraki dizini ekler.

## Yolunuzu bulun {#find-your-way}

- **Arama** — Ana Sayfa'nın üstündeki büyüteç ekranları ("stake"), coinleri ("USDC"), kişileri (bir @kullanıcı adı veya adres), notları ve bir işlem hash'inin başlangıcını arar; bir @kullanıcı adı veya `qor1…` adresi yazmak doğrudan **… adresine QOR gönder** seçeneğini sunar.
- **Tur** — bir cüzdan Ana Sayfa'da ilk kez açıldığında, beş kısa kart QoreX'in ne yaptığını ve şeylerin nerede olduğunu açıklar. Bir kez çalışır; Ayarlar → **Turu yeniden izle** ile tekrar oynatın.

## İsteğe bağlı: bir @kullanıcı adı alın

Cüzdanınız oluşturulduktan sonra, insanların size bir `qor1…` adresi yerine isimle gönderim yapabilmesi için benzersiz bir **@kullanıcı adı** (örneğin `@liviu`) talep edebilirsiniz. Talep etmek için [oturum açmış bir hesap](/qorex/account-and-dashboard#sign-in) gerekir ve bu işlem **mobil uygulamada** yapılır (tarayıcı eklentisi sizi oraya yönlendirir). İsteğe bağlıdır ve atlanabilir — cüzdanınız asla buna bağlı değildir. Bir kullanıcı adı, cüzdanın tamamına değil belirli bir adrese bağlanır; bu, birden fazla hesabınız olduğunda önem kazanır — bkz. [Tek bir ifadeden birden fazla hesap](/qorex/account-and-dashboard#accounts) ve [@kullanıcı adı](/qorex/account-and-dashboard#handle).

## Dil

QoreX on dilde sunulur — İngilizce, Rumence, Almanca, İspanyolca, Fransızca, İtalyanca, Türkçe, Arapça, Japonca ve Korece — ve telefonunuzun dilini otomatik olarak takip eder, bunların dışındaki her şey için İngilizceye geri döner. Algılanan dili istediğiniz zaman **Ayarlar → Dil** üzerinden değiştirebilirsiniz; Arapça'yı seçmek arayüzü sağdan sola olacak şekilde de değiştirir.

## Sonraki adımlar

- [Gönder ve Al](/qorex/send-and-receive) — ilk kuantum güvenli transferinizi yapın.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — asla erişiminizi kaybetmemek için sosyal kurtarma kurun.
- [Portföy ve Staking](/qorex/portfolio-and-staking) — varlıkları takip edin ve staking ödülleri kazanın.
