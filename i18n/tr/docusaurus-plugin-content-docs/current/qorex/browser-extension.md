---
slug: /qorex/browser-extension
title: QoreX Tarayıcı Uzantısı
sidebar_label: Tarayıcı Uzantısı
sidebar_position: 2
---

# QoreX Tarayıcı Uzantısı

QoreX **tarayıcı uzantısı**, masaüstü QoreChain cüzdanıdır. **Bağımsız bir cüzdandır** (cüzdan oluşturabilir veya içe aktarabilir, QOR tutup gönderebilir, stake edebilir ve dApp'lere bağlanabilirsiniz) ve herhangi bir web sitesinin QoreX'i keşfetmesini ve her isteği açık, çözümlenmiş bir onaya dönüştürmesini sağlayan parçadır. QoreChain'i masaüstü tarayıcıdan kullanan herkes ve web uygulamasının bir QoreChain cüzdanıyla çalışmasını isteyen geliştiriciler içindir.

Üç mağazada (Chrome, Firefox ve Safari) **yayında ve herkese açıktır** ve hepsi uzantı 0.4.5 sürümünü taşır. Bkz. [hangi sürüm nerede yayında](#versions).

## Yenilikler {#innovations}

- **`signAndBroadcast`.** Bir dApp mesajları gönderir; cüzdan çözümlenmiş her mesajı ve ücreti gösterir, ardından yalnızca cüzdanın üretebileceği ML-DSA-87 katmanını ekler ve yayınlar. Bir sayfa ML-DSA-87 anahtarını asla tutmaz.
- **`signDirect` katmanı kayıtlı anahtara karşı kontrol eder.** Bir dApp ML-DSA-87 katmanını kendisi eklerse, QoreX bunu herhangi bir onay penceresi açılmadan önce hesap için zincirde kayıtlı anahtara karşı kontrol eder. İşlem hiç katman taşımıyorsa QoreX ekler. `signAndBroadcast` en basit yol olmaya devam eder ([QoreChain işlemi gönderme](#sign-and-broadcast) bölümüne bakın).
- **Küçük bir izin yüzeyi.** Uzantı `storage` iznini, ayrıca (Chrome ve Firefox'ta) isteğe bağlı Geliştirici modu yapay zeka ajanları aracı için `nativeMessaging` iznini beyan eder. Host izni yoktur ve hiçbir analitik, çökme raporu veya izleme kodu yoktur. Bkz. [QoreX hangi izinleri istiyor](#permissions).
- **Mühürlü kasa.** Kasa, paroladan türetilen bir anahtarla (Argon2id) AES-256-GCM ile şifrelenir. Tarayıcının WebAuthn PRF sunduğu yerlerde (Chrome ve Edge) kilidi bir geçiş anahtarıyla açabilirsiniz; parola her zaman yedek olarak kalır.
- **Devralmadan keşif.** QoreX kendisini EIP-6963 (`rdns` `network.qore.qorex`) ve Solana Wallet Standard ile duyurur. `window.ethereum` veya `window.keplr` nesnesinin üzerine asla yazmaz.
- **Köken başına onaylar, tarayıcı tarafından tanımlanır.** Site, isteğin iddia ettiği değil, tarayıcının kendisinin doğruladığı kökendir. Bir alanı iki farklı şekilde okunabilecek biçimde tekrarlayan bir istek reddedilir.
- **Kilitli bir cüzdan yeniden deneme değil, parolanızı ister.** QoreX kilitliyken yapılan bir sitenin imza isteği parola ekranını açar ve siteyi adıyla belirtir; kilidi açtıktan sonra istek kendi onayını gösterir. Parola olmadan hiçbir şey imzalanmaz.
- **Her transferden önce bir inceleme.** Gönderme formu, alıcının tamamını, ücretleri ve uyarıları gösteren bir inceleme ekranına ve ancak ondan sonra imzalamaya götürür.
- **CSV dışa aktarımlı geçmiş**, hesap başına; her işlem zincirin bildirdiği gibi beklemede, onaylandı veya başarısız.
- Açılır pencerede **ödeme istekleri, kişiler, Paramın korunması ve Destek**. Bkz. [Ödeme istekleri](#pay-requests), [Kişiler](#contacts) ve [Paramın korunması](#protection).
- **17 araçlı Geliştirici modu.** Tek bir **Geliştirici araçları** düğmesi hepsini kendi sayfalarında açar. Bkz. [Geliştirici modu](/qorex/developer-mode).

## Nasıl kullanılır {#how-to-use}

1. Uzantıyı kurun (bkz. [Nasıl erişilir](#how-to-access)) ve açılır pencereyi açın.
2. **Yeni cüzdan oluştur** (bir parola, ardından bir kez gösterilen 24 kelime) veya **Kurtarma ifadesini içe aktar** seçeneğini seçin. Bkz. [Cüzdan oluşturma veya geri yükleme](#wallet). Ardından **Önce ne yapmak istersiniz?** sorusunda seçim yapın veya atlayın.
3. Açılır penceredeki **Gönder**, **Al**, **QOR stake et**, **Geçmiş** ve **Coinler ve tokenler** seçeneklerini kullanın. Bkz. [QOR gönderme](#send), [Geçmiş](#history), [Uzantıdan staking](#stake) ve [Harici ağlarda gönderim](#send-external).
4. Bir dApp açın. İlk bağlantı, sitenin kökenini gösteren bir onay gösterir; onaylamak yalnızca genel adresinizi açığa çıkarır. Herhangi bir siteyi [Bağlı siteler](#connected-sites) altından iptal edin.
5. Geliştirici olarak QoreX'i EIP-6963 ile tespit edin ve `signAndBroadcast` ile bir işlem gönderin. Bkz. [Bir dApp'i QoreX'e bağlama](#connect) ve [Bir dApp'ten QoreChain işlemi gönderme](#sign-and-broadcast).

## Nasıl erişilir {#how-to-access}

Bir masaüstü tarayıcıdan başka bir şeye ihtiyacınız yok: hesap yok, kayıt yok ve mobil uygulama yok. Gönderim veya staking yaparken ağ ücretleri uygulanır (ağ tabanı gas başına 0.1 uqor'dur). Uzantı ayarlı olduğu ağı izler; varsayılan, mainnet `qorechain-vladi`'dir.

### Kurulum {#install}

| Tarayıcı | Kurulum |
|---|---|
| **Chrome ve Chromium tarayıcıları** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 veya üzeri) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 veya üzeri)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

Her zaman bu listelemelerden birinden kurun.

### Hangi sürüm nerede yayında {#versions}

:::note
Sürümler 27 Kasım 2026 tarihinde kontrol edilmiştir. iPhone ve Android uygulamaları 1.2.5 ile Chrome ve Firefox eklentileri 0.4.5 yayında. 0.4.5 eklentisini içeren Safari 1.8.2 mağaza incelemesinde: Safari'de bu kılavuzun 0.4.5 için anlattığı özellikler, Mac App Store güncellemeyi sunduğunda gelir. Paylaşılan ödeme bağlantılarının web sayfası yayında; bkz. [Uygulama olmadan ödeme bağlantısı açma](/qorex/send-and-receive#pay-web).
:::

Her mağazadaki güncel sürüm:

| Mağaza | Güncel sürüm |
|---|---|
| Chrome Web Store | 0.4.5 |
| Firefox Add-ons | 0.4.5 |
| Safari (Mac App Store, **QoreX Wallet** macOS uygulaması) | 1.8.1, 0.4.3 uzantısını taşır (Mac App Store kendi `1.x` numaralandırmasını kullanır) |

Mağaza incelemeleri farklı zamanlarda sonuçlandığı için bir mağaza diğerinden daha eski bir derleme sunabilir; mağaza listelemesi her zaman güncel sürümünü gösterir. Ayrıca bkz. [Hangi sürüm nerede yayında](/qorex/overview#versions).

Uzantı 0.4.x şunları ekler: [otomatik kilit](#unlock), [her transferden önce inceleme](#send), [CSV dışa aktarımlı Geçmiş](#history), [ödeme istekleri](#pay-requests), [kişiler](#contacts), [Paramın korunması](#protection), [kuantum sonrası anahtar onarımı, rotasyonu ve multisig](#pqc-care), ayrı [staking ekranları](#stake), [coin ile başlayan bir Al ekranı](#receive), [dApp'ler için EVM imzalama](#standards), [daha güvenli EVM erişim pencereleri](#evm-window) ve [Geliştirici araçları](#developer-tools). Sürüme göre tam liste [1.2.5 / 0.4.5 yapılarının ekledikleri](/qorex/overview#whats-new-125) ve onu izleyen listelerdedir.

0.2.6'dan bu yana uzantıya ayrıca şunlar eklendi: [tek parolayla birden fazla cüzdan](#wallets), [elle eklediğiniz Ethereum tarzı bir hesap](#coin60), [Talep et ve yeniden stake et](#stake), bir **Stake'ten çıkış sürüyor** listesi, [bir token'ı kontratıyla ekleme](#custom-tokens), [her ağda Al](#receive), [İptal özellikli bağlı siteler](#connected-sites), [EVM erişim penceresi](#evm-window), [dApp'ler için `signAndBroadcast`](#sign-and-broadcast) ve her mesajı, ücreti ve son kullanma süresini gösteren onay ekranları.

**İzin yüzeyi 0.1.3'ten bu yana değişmedi.** Bkz. [QoreX hangi izinleri istiyor](#permissions).

:::note
Safari'de onaylar açılır pencere yerine bir tarayıcı sekmesinde açılır. Uzantı, aynı kod tabanından Apple'ın Safari web uzantısı sarmalayıcısıyla paketlenir. Geliştirici modundaki **Yapay zeka ajanları** aracı Safari'de kullanılamaz.
:::

## Cüzdan oluşturma veya geri yükleme {#wallet}

Açılır pencereyi açın ve seçin:

- **Yeni cüzdan oluştur** - bir parola seçin (en az 8 karakter); QoreX cihazınızda yeni bir 24 kelimelik kurtarma ifadesi üretir (256 bit entropi), QoreChain kimliğinizi türetir ve bunu o parolayla (ve isteğe bağlı olarak bir geçiş anahtarıyla - bkz. [Güvenlik](#security)) kasada mühürler. 24 kelime **yalnızca bir kez** gösterilir - bunları yazın, *Kurtarma ifademi güvenli bir yere kaydettim.* kutusunu işaretleyin, ardından devam edin. Daha sonra açılır penceredeki **Kurtarma ifadesini göster** ile tekrar gösterebilirsiniz (parola gerekir).
- **Yedeğinizi kontrol edin** - ifadeyi kaydettiğinizi onayladıktan hemen sonra QoreX, ifadenin rastgele konumlardaki üç kelimesini yazdığınız şekilde girmenizi ister. Biri eşleşmezse kâğıdınıza bakıp yeniden deneyin. **Daha sonra kontrol et**'i seçebilirsiniz; sonradan **Yedeğimi kontrol et** parolanızı ister ve ifadeyi göstermez, çünkü amaç yazılı kopyanızı kontrol etmektir.
- **Kurtarma ifadesini içe aktar** - mevcut bir ifadeden geri yükleyin. 24 kelimeden kısa bir ifade paranızı normal şekilde geri yükler, ancak QoreX bu durumda ML-DSA-87 anahtarınızın yalnızca ifadenin gücü kadar güçlü olacağı konusunda sizi uyarır; tam güç için yeni bir 24 kelimelik cüzdan oluşturun ve paranızı oraya taşıyın.

:::danger Devam etmeden önce ifadeyi yazın
Uzantının kasası yalnızca bu tarayıcıda bulunur. **Uzantıyı kaldırmak, verilerini temizlemek veya tarayıcıyı sıfırlamak anahtarlarınızı siler** ve hiç kimse - QoreChain Association dahil - onları geri getiremez. Yazılı 24 kelimeniz olmadan paranız kalıcı olarak gitmiş olur. Bkz. [Şimdi yedekleyin](/qorex/security-and-recovery#back-up-now).
:::

Bir cüzdan oluşturduktan veya içe aktardıktan sonra QoreX bir kez **Önce ne yapmak istersiniz?** diye sorar. Uzantıda **Para almak istiyorum** sizi coin, adresi ve bir ödeme bağlantısı boyunca; **Para göndermek istiyorum** cüzdanı fonlama, @handle notu (handle'lar uygulamada talep edilir) ve ücretin açıklandığı ilk ödemeniz boyunca götürür; **Kriptomu güvende tutmak istiyorum** yatırma adresinizi ve yedek kontrolünü gösterir. Geçmek için **Şimdilik atla**'ya dokunun; açılır pencere ana ekranındaki **Ne yapmak istersiniz?** onu yeniden açar.

Uzantı kendi anahtarlarını tutar; mobil uygulamaya ihtiyaç duymaz. Anahtarlar cihazdan asla ayrılmaz.

## Kilit açma ve otomatik kilit {#unlock}

- **Kilidi açma** - parolanızı yazın ve **Enter**'a basın veya **Kilidi aç**'a dokunun. Düğme çalıştığını gösterir (kasa anahtarının türetilmesi bilerek yavaştır). **Yanlış parola.** yalnızca yanlış parola için görünür; diğer her hata adıyla belirtilir. [Geçiş anahtarıyla kilit açma](#security) açıksa **Passkey ile kilidi aç** seçeneğini kullanabilirsiniz.
- **Otomatik kilit** - açılır pencere ana ekranındaki **Otomatik kilitleme süresi**, QoreX'in kullanılmadan ne kadar açık kalacağını belirler: 1, 5, 15, 30, 60 veya 240 dakika (dakika veya saat olarak gösterilir). Varsayılan 15 dakikadır.
- **Kilitle** - açılır pencere ana ekranındaki **Kilitle** düğmesi hemen kilitler; sonraki ekran parolanızı ister.
- **Siz kilitliyken bir site istekte bulunursa** - bir siteden gelen imza isteği (native, EVM veya Solana), QoreX'i siteyi adıyla belirterek parola ekranında açar. Kilidi açtıktan sonra o pencere kapanır ve istek kendi onayını gösterir. Bunun yerine pencereyi kapatırsanız istek reddedilir ve hiçbir şey imzalanmaz.

## Birden fazla cüzdan ve hesap {#wallets}

- **Cüzdanlar** (0.3.3'ten itibaren) - açılır pencerenin **Cüzdanlar** ekranı ("Wallets in this browser") bu tarayıcıdaki her cüzdanı listeler. Her birinin kendi kurtarma ifadesi vardır; **tek bir parola** hepsinin kilidini açar ve geçiş yapmak QoreX'in hangisini gösterip hangisiyle imzaladığını değiştirir (zincir üzerinde hiçbir şey hareket etmez). Yeni bir cüzdan oluşturarak (ifadesi bir kez gösterilir) veya bir cüzdanı geri yükleyerek **ekleyin**; kasayı yeniden mühürlemek için parolanız bir kez sorulur. Bir cüzdan eklemek veya kaldırmak **geçiş anahtarıyla kilit açmayı** kapatır - ana ekrandan tekrar açın. Birini kaldırmak için *Bu tarayıcıdan kaldır*'a dokunun ve parolanızı girin; son cüzdan bu ekrandan kaldırılamaz. Kaldırmak o anahtarı tarayıcıdan siler - onu yalnızca kurtarma ifadesi geri getirir.
- **Hesaplar** (0.2.2'den itibaren) - **Hesapların**, aynı ifadeden birden fazla hesap oluşturur ve bunlar arasında geçiş yapar (cüzdan başına en fazla 20; numaralandırılırlar ve yeniden adlandırılamazlar). Yazdığınız ifadeyi geri yüklemek **Account 1**'i geri getirir; diğerlerini **Hesap ekle** ile yeniden ekleyin. Geçiş yapmak her şeyi beraberinde taşır: gönderim, staking, alım ve @handle'ınız hangi hesap etkinse onu izler.

### Ethereum tarzı hesap {#coin60}

0.3.2'den itibaren, (**Hesapların** ekranındaki) **Ethereum hesabı ekle (coin 60)**, ilk kez MetaMask'ta veya Dashboard'da kullanılmış bir ifade için hesabı ekler; bkz. [MetaMask'tan veya Dashboard'dan bir ifadeyi geri yükleme](/qorex/getting-started#restore-dashboard). Onun 0x adresi, aynı kelimeler için MetaMask'ın gösterdiği adrestir. Bu hesapta handle'lar sunulmaz. Uzantı 0.3.9'dan itibaren bu hesaptan uzantıda staking yapabilirsiniz.

Portfolio, Q-Day Scanner, sosyal kurtarma, Legacy Protocol, hesap girişi ve cihaz bağlama yalnızca mobilde kalmaya devam ediyor - bkz. [QoreX Wallet](/qorex/overview#platform-availability).

## Hesabınız, bakiyeniz ve @handle {#account}

Açılır pencerenin boşta ekranı `qor1…` adresinizi (kopyalamak için dokunun) ve anlık QOR bakiyenizi gösterir, böylece ikisini de kontrol etmek için bir blok gezgini açmanıza gerek kalmaz.

### Vesting (kilitli) bakiyeler {#vesting}

Hesabınızda vesting QOR varsa (örneğin serbest bırakılmamış bir TGE tahsisi), bakiye **şu anda kullanılabilir** ve **hâlâ kilitli** olarak ikiye ayrılır; kullanılabilir tutarı aşan bir gönderim, ücret alındıktan sonra zincir üzerinde başarısız olmak yerine ağa ulaşmadan önce reddedilir. QoreX burada bilerek bir "sonraki kilit açılma tarihi" **göstermez**: bir vesting takvimi yönetişim tarafından değiştirilebilir, bu yüzden bakiye kartındaki bir tarih QoreX'in garanti edemeyeceği bir vaat gibi okunurdu. Doğru kalan şey, kullanılabilir-kilitli ayrımıdır.

### Bir @handle talep edin

Benzersiz bir **@handle** (örneğin `@liviu`) talep etmek için **oturum açmış bir hesap** gerekir ve bu işlem **mobil uygulamada** yapılır; uzantı sizi oraya yönlendirir ve handle'ları kendisi talep etmez. Talep edildikten sonra handle o adrese bağlanır, böylece uzantı ona ödeme yaparken onu çözümler ve başkaları size adınızla ödeme yapabilir. Handle'ların adreslere (bir bütün olarak cüzdana değil) nasıl bağlandığını görmek için bkz. [@handle](/qorex/account-and-dashboard#handle).

## QOR gönderme {#send}

1. Açılır pencereyi açın ve **Gönder**'e dokunun.
2. Alıcıyı (`qor1…` adresi veya @handle), tutarı ve isteğe bağlı memo'yu girin. [Favoriler](#contacts) formda tek dokunuşluk çipler olarak görünür.
3. **Transferi kontrol et.** İnceleme ekranı alıcıyı tam olarak (kayıtlı bir kişiyse kişi adını da), tutarı ve memo'yu gösterir. Bu, hesabın ilk işlemiyse tek seferlik ML-DSA-87 anahtar kayıt ücretini ve toplamı da gösterir.
4. Uyarıları okuyun. QoreX bu cüzdandan o adrese ilk ödeme olduğunda, adres daha önce ödeme yaptığınız veya kaydettiğiniz bir adrese yalnızca **benzediğinde** (her karakteri karşılaştırın; ikinci bir dokunuş gerekir, **Yine de bu adrese göndermek için tekrar dokun**) ve ağ ücreti gönderdiğiniz tutardan büyük olduğunda sizi bilgilendirir.
5. **Onayla ve gönder**'e dokunun. QoreX hibrit imzayla imzalar ve gönderir.

Mainnet ve testnet'te kullanılabilir. Ağın işlem başına gas sınırının üzerindeki bir işlem, herhangi bir şey imzalanmadan önce reddedilir.

## Bir @handle'a gönderim {#handle-send}

0.1.9'dan itibaren, bir adres aramak yerine kayıtlı bir @handle'a doğrudan ödeme yapabilirsiniz (0.3.6'ya kadarki sürümlerde bir hata aramaları kesintiye uğratıyordu ve 0.3.7'den itibaren yeniden çalışıyor):

1. Açılır pencereyi açın ve **Gönder**'e dokunun.
2. Alıcı alanına, bir `qor1…` adresi yerine `@` işaretini ve ardından handle'ı (örneğin `@liviu`) yazın.
3. QoreX handle'ı çözümler ve herhangi bir şey imzalamadan önce size **çözümlenmiş adresi** gösterir - bunu her zaman beklediğinizle karşılaştırın.
4. Tutarı girin, [inceleme ekranını](#send) kontrol edin ve onaylayın.

Çözümleme, QoreX onu kullanmadan önce iki şekilde doğrulanır: uzantıya gömülü bir güven anahtarına karşı kontrol edilen bir kayıt defteri onayı ve handle sahibinin talep üzerindeki kendi imzası. Bu kontrollerden herhangi birini geçemeyen bir yanıt doğrudan reddedilir - QoreX doğrulanmamış bir adresi göstermeye geri düşmez. Belirli bir handle'a ilk kez ödeme yaptığınızda QoreX çözümlediği adresi hatırlar (sabitler); o handle daha sonra **farklı** bir adrese çözümlenirse QoreX durur ve devam edip etmeyeceğinize karar verebilmeniz için hem eski hem yeni adresi tam olarak gösterir. Bu hafıza **tarayıcı başına** yaşar - aynı handle'a farklı bir tarayıcıdan veya bilgisayardan ilk kez ödeme yapmak orada da yeni olarak gösterilir. Bu beklenen bir durumdur, hata değildir.

## Al {#receive}

Açılır pencerede **Al**'a dokunun. **Coin ile başlar**:

1. **Almak istediğiniz coini seçin** - QOR en başta olmak üzere aranabilir bir liste (**Coin veya ağ ara**), ardından her ağın kendi coin'i ve paketlenmiş tokenlar, her biri kendi görseli ve ağının görseliyle. [Kontratla eklediğiniz](#custom-tokens) tokenlar da listelenir. Görseller cüzdanın içinde gelir, dolayısıyla onları göstermek için üçüncü bir taraftan hiçbir şey alınmaz.
2. QoreX, o coin'in ağı için adresi bir kopyalama düğmesiyle QR kod olarak ve coin'in adını veren bir uyarıyla gösterir: bu adrese yalnızca o coin'i, o ağda gönderin. Bir adres birkaç ağda çalışıyorsa (EVM ağları) hangilerinde olduğunu söyler.
3. **Başka coin seç** sizi listeye geri götürür.

Desteklenen ağlar QoreChain, Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis ve Celestia'dır. Başka bir ağın adresi kurtarma ifadenizden türetilir, bu yüzden gösterilmesi bir onay gerektirebilir. Cosmos Hub, Osmosis ve Celestia için QoreX, bu ağlardaki gönderimlerinizin imzalandığı adresi gösterir.

## Geçmiş {#history}

Hesapta neler olduğunu görmek için açılır pencere ana ekranında **Geçmiş**'e dokunun:

- Yalnızca gönderimler değil, **her tür QoreChain işlemi**: gönderilen, alınan, stake edilen, stake'ten çekilen, taşınan stake, talep edilen ödüller, stake kilitleri, EVM penceresi ve anahtar değişiklikleri; tutar ve ücretle birlikte. Bir EVM işlemi [EVM erişim penceresinden](#evm-window) ne kadar aldığını da gösterir.
- **Durum, zincirden okunur.** Bu cihazdan gönderilen ve zincirin geçmişinin henüz göstermediği bir transfer **Beklemede: ağın onayı bekleniyor** olarak listelenir. Ağ onu bulamazsa QoreX başarısız olmuş olabileceğini söyler, bu yüzden yeniden göndermeden önce kontrol edin (satırı **Kapat** ile kaldırabilirsiniz). Başarısız bir işlem, ücretin yine de ödendiği belirtilerek işaretlenir.
- **Hesap başına** - birden fazla hesapta, üstten hesabı seçin.
- **Ödemeyi tekrarla** - geçmiş bir ödemeden gönderme formunu yeniden doldurur. Yine de inceleyip onaylarsınız.
- **CSV olarak dışa aktar** - dosya cihazınızda oluşturulur ve yalnızca geçmişinizi içerir (ifade yok, anahtar yok) ve bir elektronik tabloda güvenle açılacak şekilde hazırlanır.

Ağa ulaşılamıyorsa QoreX geçmişi yükleyemediğini söyler; bunu asla "işlem yok" olarak göstermez. Geçmiş şimdilik yalnızca QoreChain'i kapsar. Mainnet ve testnet'te kullanılabilir.

## Ödeme istekleri {#pay-requests}

Birinden, değiştirilirse belli olmadan değiştirilemeyen bir bağlantıyla belirli bir miktar QOR isteyin.

**Ödeme isteme:**

1. Açılır pencere ana ekranında **Ödeme istekleri**'ni açın ve bir **Yeni istek** oluşturun: QOR cinsinden tutar, isteğe bağlı bir not (en fazla 140 karakter) ve varsa @handle'ınızın gösterilip gösterilmeyeceği.
2. **Bağlantı oluştur**'a dokunun. QoreX isteği hesap anahtarınızla imzalar. Bağlantıyı **Bağlantıyı kopyala** ile kopyalayın ve ödemesi gereken kişiye gönderin.
3. **İsteklerim** onları listeler. **Durumu kontrol et** zinciri okur ve **Ödendi** veya **Henüz ödenmedi** gösterir (ya da ağın yanıt vermediğini). **Gelecek ay yeniden kullan** eski bir istekten yeni bir istek oluşturur.

**İstek ödeme:**

1. **Bir isteği öde**'yi açın, bağlantıyı yapıştırın ve **Aç**'a dokunun.
2. QoreX imzayı, imzalayanın alıcı adrese sahip olduğunu, tam ağı ve istekteki varsa @handle'ı kontrol eder. Değiştirilmiş bir bağlantı, yanlış bir imzalayan, bilinmeyen bir ağ veya QOR dışında bir coin reddedilir. İstek diğer ağ içinse ağı kendiniz değiştirin; QoreX değiştirmez.
3. **Pay**'e dokunun. Herhangi bir şey gönderilmeden önce normal [inceleme ekranını](#send) görürsünüz. Ödeme, isteğin etiketini memo'da taşır; isteği yapanın QoreX'i onu zincirde bu şekilde bulur.

İmzalı bir istek hesap veya oturum açma gerektirmez. Bir testnet isteği bunu söyler: testnet QOR'un değeri yoktur. Geliştiriciler için bağlantı biçimleri [dApp entegrasyonu](/qorex/dapp-integration) sayfasındadır.

## Kişiler ve favoriler {#contacts}

Açılır pencere ana ekranındaki **Kişiler**, ödeme yaptığınız adreslerin adlarını **yalnızca bu cihazda** tutar.

- **Kişi ekle** - bir ad ve en az bir adres: QoreChain (`qor1…`), EVM (`0x…`), Solana veya Cosmos ve isteğe bağlı bir @handle. Gönderme formunda tek dokunuşluk çip olarak görmek için **Favourite** olarak işaretleyin. **Pay &#123;name&#125;** formu doldurulmuş olarak açar. Silmek iki dokunuş gerektirir. Liste en fazla 200 kişi tutar.
- **@handle kişileri**, handle'ın son ödemenizdekiyle aynı adrese işaret edip etmediğini gösterir ve adresi **değiştiyse** sizi uyarır.
- **Benzer görünenler** - zaten bildiğiniz bir adrese yalnızca benzeyen bir adres, her karakteri karşılaştırabilmeniz için ikisi birlikte gösterilerek işaretlenir.

Bir kişi kaydı güvenlik kontrolü değildir: her ödeme yine inceleme için adresin tamamını gösterir.

## Paramın korunması {#protection}

Açılır pencere ana ekranındaki **Paramın korunması**, her satırın siz ekranı açtığınızda cihazınızda ve ağda kontrol edildiği tek bir ekrandır. Okunamayan bir kontrol bunu söyler; asla "sorun yok" veya "hiç yok" sayılmaz.

- **Yedek doğrulandı** ve **Kurtarma test edildi** - tarih veya **Henüz değil**. **Kurtarma ifademi test et** ifadenizin üç kelimesini ister. Cihazınızda karşılaştırılır; yazdığınız hiçbir şey saklanmaz veya gönderilmez.
- **İzinli uygulamalar** - adresinizi görebilen ve sizden imza isteyebilen siteler, **İptal et** ile.
- **Ağda verilen izinler** - başka bir hesabın sizin adınıza gönderim yapmasına (authz) veya QOR'unuzu ağ ücretlerinde harcamasına (ücret yetkileri) izin veren yetkiler, sınırsız olanlar en başta, **İptal et** ile. İptal etmek, neyi imzalayacağınızı ve ücreti gösterir, ardından onaylarsınız.
- **QoreChain'in EVM'inde token onayları** - **Token onaylarını kontrol et**'e dokunun (okumak bir kez ifadenizi gerektirir). QoreX ne kadar geriye kontrol ettiğini söyler; kontrole devam etmek için ekranı yeniden açın. **İptal et**, token kontratıyla sınırlı tek işlemlik bir EVM penceresi açtıktan sonra `approve(spender, 0)` gönderir. Burada yalnızca Ethereum tarzı (coin 60) bir hesap iptal edebilir.
- **Kanala göre kuantum sonrası koruma** - sade sözcüklerle: QoreChain native işlemleri iki imza taşır (ML-DSA-87 ve klasik); EVM işlemleri klasik olarak imzalanır ve yalnızca kuantum sonrası imzanızla açtığınız bir pencerenin içinde kabul edilir; diğer ağlar yalnızca klasik imzaları kabul eder.

Koruyucular ve sosyal kurtarma mobil uygulamadadır. Bkz. [Güvenlik ve Kurtarma](/qorex/security-and-recovery).

## Destek ve ağ durumu {#help-and-status}

- Açılır pencere ana ekranındaki **Destek** yalnızca resmi kanalları listeler: [Telegram topluluğu](https://t.me/QorechainCommunity), [Discord](https://discord.gg/qorechain), [yardım sayfası](https://qorechain.io/help/qorex), team@qorechain.io adresine e-posta ve **Güvenlik açığı bildir**. QoreChain personeli asla kurtarma ifadenizi, parolanızı veya anahtarlarınızı istemez. **Özeti göster**, yalnızca destek isterse kopyalayacağınız isteğe bağlı bir tanılama özeti verir (uygulama sürümü, ağ ve hata kodları; ifade, anahtar, adres veya bakiye içermez).
- **Ağ durumu bandı** - QoreX zincirin en son bloğunun zamanını okur. Blok bir dakikadan eskiyse bir bant ağın yavaş olduğunu ve bloğun ne kadar eski olduğunu söyler; ağa ulaşılamıyorsa bakiyelerin güncel olmayabileceğini söyler. Ağ iyiyken hiçbir şey göstermez.
- **Bilinen son değerler** - ağ yanıt vermediğinde açılır pencere okuduğu son bakiyeyi ve delegasyonları gösterir ve ne zamandan olduğunu söyler.

## Uzantıdan staking {#stake}

**0.2.2**'den itibaren açılır pencerenin kendi staking ekranı vardır - yalnızca uzantıda oluşturulmuş bir cüzdanın staking ödülü kazanmak için mobil uygulamaya ihtiyacı yoktur. Açılır pencere ana ekranında **QOR stake et**'i açın. Her eylem için bir satırlık açıklama içeren bir **menü** açar; her eylem kendi hata satırıyla kendi ekranını açar ve **Stake'e dön** menüye döndürür.

| Ekran | Ne yapar |
|---|---|
| **QOR stake et** | Bir validatör ve bir tutar seçin. Aktif validatörler komisyonlarıyla listelenir; **hapse atılmış (jailed)** validatörler dışarıda bırakılır. Siz yazarken tutar bir işlem ücretinden azını bırakacaksa QoreX uyarır (hesap yeniden QOR tutana kadar stake'ten çekemez veya talep edemezsiniz). |
| **Stake'ten çek** | Unbonding'i başlatır. QOR'u taşıyabilmeniz için geçen süre **ağdan okunur** ve tutar, kalan süreyle birlikte **Stake'ten çıkış sürüyor** altında görünür. |
| **Stake'i taşı** | Unbonding beklemesi olmadan redelegate, üç adımda: (1) **hangisinden** taşınacağı (henüz taşıyamayacaklarınız tarihle soluk gösterilir), (2) **hangilerine** taşınacağı, (3) **ne kadar**; **Max** düğmesi ve imzalamadan önce gösterilen rota ile bölüşüm. Ağın reddedeceği bir taşıma önce yakalanır. Bkz. [Stake'i validatörler arasında taşıma](/qorex/portfolio-and-staking#move-stake). |
| **Talep et** | Ödülleri toplar. Ücret ödüllerden büyükse ilk dokunuş sizi uyarır. |
| **Talep et ve yeniden stake et** | Ödülleri, onları kazandıran validatörlere tek işlemde yeniden bileşik eder (en fazla 127 validatör). QoreX önce **kilidi açık** QOR'unuzun, ödüller gelmeden önce ödenen ücreti karşılayıp karşılayamayacağını kontrol eder. |
| **Bonus için kilitle** | Stake'inizin bir kısmını 3, 6 veya 12 aylığına kilitleyin. Bkz. [staking kilitleri](/qorex/portfolio-and-staking#staking-locks). |
| **Ödüllerin gittiği yer** | Gelecekteki staking ödüllerini **aynı cüzdanın başka bir hesabına** gönderin; başka hiçbir adrese değil. Ödüllerin şu anda nereye gittiğini gösterir, ilk dokunuşta yeni hesabın adını tam olarak belirtir ve ikincisinde imzalar. Stake'iniz yer değiştirmez. |

Menünün altında bir **Stake etme, basitçe** kartı, şimdiye kadar kazanılan ödülleri, staking'in maliyetini (validatör komisyonu ve ağ ücretleri) ve stake'ten çekilen QOR'un ne zaman geleceğini açıklar. Birden fazla hesapta, staking yapacak hesabı hesap seçiciden seçin. Her eylem, Gönder işlemiyle aynı şekilde zorunlu hibrit imzayla (secp256k1 ve ML-DSA-87) imzalanır ve ekran, ilk işleminizin anahtarınızı da kaydettiğini söyler. Yıllık oran zincirin kendi rakamından okunur. Staking, delegasyon ve ödüller yalnızca **Native** hattında gerçekleşir, hiçbir zaman bir EVM precompile üzerinden değil - bkz. [Staking ve Delegasyon](/user-guide/staking-and-delegation).

### Bir Dashboard staking isteğini onaylama {#stake-dashboard}

QoreChain [Dashboard](/dashboard/staking-and-validators)'u staking istekleri oluşturur ama bunları imzalayamaz - anahtarınız hiçbir zaman uzantının kasasından çıkmaz. Dashboard'da **QoreX'te Devam Et**'e tıkladığınızda, istek uzantıda açılır ve siz onu (validatör ve tutar) inceleyip tıpkı bir Gönder işlemi gibi onaylarsınız.

:::note Bir işlem "başarılı" yerine "düşürülmüş (downgraded)" gösteriliyorsa
Dashboard bazen bir işlemi temiz bir başarı yerine **düşürülmüş** olarak gösterir. Bu, paranızın hareket ettiği ama o işlem için ML-DSA-87 imza katmanının zincirde bulunamadığı anlamına gelir - bu sizin yaptığınız bir şey değildir ve kendi tarafınızdan düzeltebileceğiniz bir şey de değildir. Bu bizim tarafımızdaki bir hatadır; lütfen incelememiz için destek ekibine bildirin. Mesaj, okuyup bildirmeniz için zamanınız olsun diye bilerek ekranda kalır, kaybolmaz.
:::

### Harici ağlarda gönderim {#send-external}

Native hattındaki QOR'un yanı sıra açılır pencerenin **Harici ağlarda gönder** ekranı, tamamı aynı kurtarma ifadesinden türetilen diğer ağlardaki varlıkları gönderir. Aşağıdaki tüm ağlar hem gönderebilir hem alabilir:

| Tür | Ağlar | Paketlenmiş tokenlar |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | ERC-20 kayıtları (EVM zincirlerinin tamamında USDC ve USDT, Ethereum'da DAI) |
| SVM | Solana | SPL kayıtları (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | IBC üzerinden Noble USDC; isteğe bağlı memo alanı |

1. Coin veya token'ı seçin, ardından alıcıyı ve tutarı (Cosmos ağlarında ayrıca isteğe bağlı bir memo) girin.
2. Onay kutusunu işaretleyin. İngilizce metni şöyledir: **"External networks accept only classical signatures. Unlike your QOR, this transfer has NO ML-DSA-87 signature. I understand."** Harici zincirler bir ML-DSA-87 imzası taşıyamaz ve QoreX bunu asla gizlemez.
3. EVM ağlarında ilk dokunuş **azami ağ ücretini** teklif eder ("Network fee: at most …"); ikincisi tam olarak bu teklifle gönderir. Herhangi bir düzenleme teklifi iptal eder. Gönderdiğiniz coin cinsinden ödenen ücret tutardan büyükse uyarılırsınız.
4. O ağda daha önce ödeme yaptığınız bir adrese yalnızca benzeyen bir alıcı tam olarak gösterilir ve bir dokunuş daha gerektirir.

## Desteklenen cüzdan standartları {#standards}

QoreX, tamamı sayfaya `window.qorex` (`{ evm, native, svm }`) olarak enjekte edilen ve EIP-6963 ile Solana Wallet Standard üzerinden keşfedilen üç arayüz sunar. Bir web uygulamasında, [wallet adapter](/developer-tools/wallet-adapter) bu tespiti sarmalar.

| Standart | Nedir | Geliştirici olarak sizin için ne anlama gelir |
|---|---|---|
| **EIP-1193** | Ethereum sağlayıcı JavaScript API'si (`request(...)`, olaylar). | Hesap ve ağ sorgularının (`eth_requestAccounts`, `eth_accounts`, `eth_chainId`, `wallet_switchEthereumChain`) yanı sıra QoreX, QoreChain'in EVM hattında (zincir kimliği 9801, testnet 9800) ve Ethereum'da `personal_sign`, `eth_signTypedData_v4` ve `eth_sendTransaction` imzalar. Her onay, neye yetki verildiğini cihazınızda çözülmüş olarak söyler ve yapabildiğinde işlemi önce simüle eder. QoreChain'de yalnızca Ethereum tarzı (coin 60) hesaplar gönderim yapabilir ve bir işlem bir [EVM erişim penceresi](#evm-window) gerektirir. Bkz. [dApp entegrasyonu](/qorex/dapp-integration). |
| **EIP-6963** | Çoklu cüzdan sağlayıcı keşfi (duyur / iste olayları). | QoreX kendisini diğer tüm cüzdanların yanında duyurur - **`window.ethereum` nesnesinin üzerine asla yazmaz** - böylece kullanıcı QoreX'i site bazında çakışma olmadan seçer. |
| **Native sağlayıcı (Keplr tarzı)** | `window.qorex.native`: `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `getOfflineSigner` (cosmjs, cosmos-kit ve Interchain Kit için), `signArbitrary` / `verifyArbitrary` ve bir `capabilities` listesi. Tam bir Keplr yerine geçeni **değildir**: QoreX `window.keplr` için takma ad oluşturmaz; amino imzalama ve `sendTx` kullanılamaz. | Bir QoreChain işlemi göndermenin en basit yolu **`signAndBroadcast`**'tir (bkz. [Bir QoreChain işlemi gönderme](#sign-and-broadcast)): QoreX çözümlenmiş mesajları ve ücreti gösterir, yalnızca cüzdanın üretebileceği ML-DSA-87 katmanını ekler ve yayınlar. `signDirect` veya `getOfflineSigner` ile QoreX, sayfanızın eklediği bir katmanı hesabın kayıtlı anahtarına karşı kontrol eder ya da katman yoksa kendisi ekler. Bkz. [dApp entegrasyonu](/qorex/dapp-integration). |
| **Solana Wallet Standard** *(0.1.5'ten itibaren)* | Solana dApp'leri için yerel cüzdan keşfi (`wallet-standard:register-wallet` / `app-ready`). | Solana dApp'leri **QoreX'i otomatik algılar** - özel entegrasyon gerekmez. Özellikler: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; zincir `solana:mainnet`; hem `legacy` hem `v0` işlemler. |

:::note SVM hattına doğrudan erişim
Aynı arayüz `window.qorex.svm` üzerinde de mevcuttur (`connect` / `signAndSendTransaction` / `signMessage`). Wallet-Standard otomatik keşfi ve tamamen uygulanmış SVM hattı **0.1.5** ile piyasaya sürüldü ve hem Chrome hem de Firefox'ta yayındadır (bkz. [hangi sürüm nerede yayında](#versions)).

Solana onayları **talimat başına bir satır** gösterir ve QoreX'in çözebildiği yerlerde çözümler: SOL transferleri (alıcı ve lamports), SPL token transferleri, **"ALLOW SPENDING of your tokens"** (approve), **"HAND OVER control of the account"** (set authority) ve bir token hesabını kapatma - başka her şey için programla birlikte "instruction QoreX cannot read" der. Bir approve veya set-authority talimatı içeren bir istek "wants authority over your Solana tokens - read every line below" başlığını taşır. Cüzdanınızı imzalayan olarak listelemeyen işlemler reddedilir, `signMessage` aslında bir işlem olan baytları imzalamaz ve imza **klasik** olarak işaretlenir. Bkz. [Hibrit imzalama](#pqc).
:::

## Coinler ve tokenlar {#custom-tokens}

Açılır pencerenin **Coinler ve tokenler** ekranı, **bir ERC-20 token'ı kontratıyla** eklemenizi sağlar: ağı seçin, kontrat adresini yapıştırın, **Sözleşmeyi kontrol et**. QoreX token'ın adını ve ondalık sayısını kontratın kendisinden okur - ve açılır pencereye güvenmek yerine eklediğinizde arka planda tekrar okur - ardından, herkesin herhangi bir adla token oluşturabileceğini hatırlatan bir notla birlikte gösterir. Token daha sonra **Harici ağlarda gönder** içinde ve [Al](#receive) ekranında görünür. Paketlenmiş tokenları, kopyaları, EVM olmayan ağları, hatalı adresleri, okunamayan kontratları ve paketlenmiş bir token'ın adını ödünç alan kontratları reddeder.

## Bağlı siteler {#connected-sites}

Açılır penceredeki **Bağlı siteler**, bu cüzdanın onayladığı her siteyi listeler - bir site bu cüzdanın adresini görebilir ve sizden imza isteyebilir. Birini kaldırmak için **İptal et**'e dokunun. Onaylar **cüzdan başına** tutulur: bir cüzdan için onaylanmış bir site, siz geçiş yaptıktan sonra başka bir cüzdanın adresini okuyamaz.

## EVM erişim penceresi {#evm-window}

Açılır pencerenin **EVM erişim penceresi** ekranı, Ethereum tarzı (coin 60) bir hesabın QoreChain'in EVM hattında (v3.2.0 ve sonrası) gönderim yapmasına izin veren pencereyi açar ve kapatır; uygulamadakiyle aynı sınırlara sahiptir: en fazla 17,280 blok ve 1,000 işlem ve hesaptan çıkan tüm QOR'u artı her azami ücreti sayan bir QOR harcama sınırı. Token'lar sınıra sayılmaz.

1. Süreyi (blok), işlem sayısını ve harcama sınırını seçin.
2. **Pencerenin kabul ettikleri** seçimini yapın:
   - varsayılan olan **Yalnızca QOR transferleri (önerilen)**: sözleşme çağrısı yok, yeni sözleşme yok ve sözleşme olan alıcı yok;
   - **Herhangi bir sözleşme**: herhangi bir sözleşme çağrılabilir ve ekran, bir sözleşmenin taşıdığı token'ların, NFT'lerin ve onayların pencereyle sınırlanmadığı konusunda uyarır. Ağ bir pencereyi QOR transferleriyle sınırlayamıyorsa QoreX, herhangi bir sözleşme için pencere açmadan önce size sorar; hayır derseniz hiçbir şey açılmaz.
3. **Pencereyi aç**'a dokunun. Açık pencere neyi kabul ettiğini tam olarak söyler. **Pencereyi kapat** onu sonlandırır.

**Yalnızca QOR transferleri** ile açtığınız bir pencere, bir sitenin sözleşme çağırmasına izin vermez. Bir sitenin kendi işlemi, onayından QoreX'in tam olarak o işlem için bir pencere açmasını sağlayabilir; onay, pencerenin kabul edeceği her sözleşmeyi adıyla belirtir ve açık olan herhangi bir pencerenin yerini aldığını söyler.

Bir coin-118 hesabı EVM hattını kullanamaz; ekran atılacak üç adımı listeler ve **Hesapların** düğmesi sunar. Bir pencereyi yalnızca kendi cüzdan ekranlarınız açabilir, kapatabilir veya temizleyebilir; bir site yapamaz. Bkz. [EVM erişim penceresi](/qorex/security-and-recovery#evm-window).

## Kuantum sonrası anahtar bakımı ve multisig {#pqc-care}

**Anahtarı yeniden kaydet (onarım).** Hesabın ağdaki kuantum sonrası anahtar kaydı artık imzalayamıyorsa (boş, yalnızca klasik veya başka şekilde kullanılamaz), açılır pencere ana ekranında bir kart görünür. **Anahtarı yeniden kaydet**'e dokunmak ağ ücretini gösterir; kaydetmek için tekrar dokunun. QoreX bunu asla kendiliğinden yapmaz. Hesabın bir EVM penceresi varsa ağ onu kapatır, bu yüzden sonrasında yenisini açın.

**Kuantum sonrası anahtarı döndür.** **Kuantum sonrası anahtarı döndür** düğmesi, hesabın ağdaki ML-DSA-87 anahtarını kurtarma ifadenizden türetilen bir sonraki anahtarla değiştirir. İki kez dokunun; ücret sonuçta gösterilir. Rotasyon yalnızca kuantum sonrası anahtar açığa çıktıysa sizi korur; kurtarma ifadeniz açığa çıktıysa **yardımcı olmaz**. Sonrasında aynı ifadeyi kullanan diğer cüzdanlar, döndürülmüş anahtarları destekleyene kadar bu hesap için imzalayamaz ve ağ hesabın EVM penceresini kapatır. İfadeden geri yüklediğinizde QoreX doğru anahtarı bulur.

**Multisig hesapları.** **Çoklu imza hesapları**, birkaç üyenin imzalamasını gerektiren hesapları yönetir; her üyeden klasik imzanın yanı sıra kuantum sonrası bir imza gerekir. QoreX, QoreChain komut satırıyla aynı dosyaları kullanır, böylece her üye QoreX'te veya komut satırında imzalayabilir.

1. Üye adreslerinden (her biri en az bir işlem göndermiş olmalı), gereken imza sayısından ve isteğe bağlı bir addan **Çoklu imza oluştur** ya da anahtarını yapıştırarak **Mevcut çoklu imzayı ekle**.
2. Ekran bakiyeyi ve her üyenin anahtarının durumunu gösterir. Önce kuantum sonrası üye kümesi için **Kaydı hazırla**; kaydedilene kadar hesap gönderim yapamaz. Ardından **Gönderim hazırla**.
3. Uzantıda dosyalar indirilir ve açılır. **1. tur:** üyeler kuantum sonrası imzaları ekler; bunları birleştirin. **2. tur:** üzerinde anlaşılan üyeler klasik olarak imzalar. Ardından **Ağa gönder**.
4. İmzalama iki dokunuş gerektirir ve önce neyi imzaladığınızı incelersiniz. İşlem bir authenticator kaydediyorsa QoreX sizi uyarır, çünkü bir authenticator multisig'in fonlarını diğer üyelerin imzaları olmadan taşıyabilir.

## Geliştirici araçları {#developer-tools}

Geliştirici modu varsayılan olarak kapalıdır. Uzantıda açmak için açılır pencerenin altındaki **sürüm numarasına** yedi kez dokunun. Açılır pencere ana ekranının altında **Geliştirici araçları** (`</>` düğmesi), **Testnet'e geç (diana)** (veya **Mainnet'e geri dön**) ve **Geliştirici modunu kapat** içeren bir geliştirici bölümü görünür.

**Geliştirici araçları**, araçların **İncele**, **İşlemler**, **Sözleşmeler ve rollup'lar**, **Diğer sanal makineler** ve **İmzalama ve ajanlar** olarak gruplandığı tek bir sayfa açar. Uygulamadakiyle aynı 17 araç vardır; testnet'te **QoreChain üzerinde Solana** da aralarında listelenir. Geliştirici modu hiçbir imzalama kuralını değiştirmez: imzalayan her şey yine neyi imzaladığını gösterir ve onayınızı bekler. Her araç [Geliştirici modu](/qorex/developer-mode) sayfasında anlatılır.

**Yapay zeka ajanları** aracı, bilgisayarınızdaki bir yapay zeka asistanının izin verdiklerinizi okumasına ve bir işlem **önermesine** izin verir. QoreX her öneriyi kontrol edip simüle eder, siz de normal onay penceresinde onaylar veya reddedersiniz; hiçbir ajan imzalayamaz. Uzantıda, bilgisayarınızda **henüz yayımlanmamış** bir yardımcı program gerektirir ve Safari'de kullanılamaz.

Yalnızca **testnet**'te açılır pencere ana ekranı ayrıca IBC üzerinden başka bir zincire gönderimi ve QoreChain Bridge ekranını sunar; ikisi de mainnet'te sunulmaz. Bkz. [Testnet özellikleri](/qorex/testnet-features).

## Dil {#language}

Uzantı, mobil uygulama, dashboard ve site ile aynı on dili konuşur: İngilizce, Rumence, Almanca, İspanyolca, Fransızca, İtalyanca, Türkçe, Arapça, Japonca ve Korece. Varsayılan olarak **tarayıcınızın** dilini izler (bunun dışındaki her şey için İngilizce'ye geri döner) - bunun, **telefonun** dilini izleyen mobil uygulamadan farklı bir kaynak olduğunu unutmayın, dolayısıyla telefonunuz ve tarayıcınız farklı ayarlandıysa ikisi farklı diller gösterebilir. Açılır pencerenin boşta ekranındaki bir seçici, algılanan dili istediğiniz zaman geçersiz kılmanıza olanak tanır; Arapça'ya geçmek yalnızca metni değil, açılır pencereyi de hemen sağdan sola çevirir.

## Güvenlik ve izinler {#security}

QoreX yalnızca güvenilmek için değil, doğrulanabilir olmak için tasarlandı:

- **Kasa** - anahtarlarınız **AES-256-GCM** ile mühürlenir. Parola yolu anahtarını **Argon2id** (RFC 9106, bellek yoğun: 64 MiB, t=3, p=1) ile türetir, böylece kopyalanmış bir kasa bloğunun GPU veya ASIC donanımında kaba kuvvetle kırılması yavaştır. (Eski PBKDF2 blokları açılabilir olmayı sürdürür ve bir sonraki kilit açmada Argon2id ile yeniden mühürlenir.)
- **Geçiş anahtarıyla kilit açma (isteğe bağlı, 0.1.5'ten itibaren)** - kimlik doğrulayıcınızın **WebAuthn PRF** uzantısını desteklediği durumlarda QoreX, kasayı yazılan bir parola yerine geçiş anahtarının 32 baytlık PRF çıktısından açabilir. Parolanız her zaman yedek seçenek olarak kalır.

  :::note Geçiş anahtarıyla kilit açma nerede görünür
  QoreX, WebAuthn'ı özellik tespitiyle arar ve **Passkey ile açmayı etkinleştir** seçeneğini yalnızca tarayıcının bunu uzantı sayfalarına sunduğu yerlerde gösterir - yani **Chrome ve Edge**'de. **Firefox**'ta bu seçenek gizlidir, çünkü Firefox WebAuthn'ı uzantı sayfalarına sunmaz. Bu beklenen bir durumdur, hata değildir.
  :::
- **Otomatik kilit** - QoreX bir süre kullanılmadığında kendini kilitler (varsayılan 15 dakika) ve bir **Kilitle** düğmesi vardır. Bkz. [Kilit açma ve otomatik kilit](#unlock).
- **Manifest V3 + katı CSP** - `script-src 'self'; object-src 'self'; base-uri 'self'`. Kurulumdan sonra **uzaktan kod yükleme yoktur** ve `wasm-unsafe-eval` kullanılmaz.
- **Analitik yok, çökme raporlama yok, izleme SDK'sı yok, kayıt yok** - uzantı QOR tutmak, göndermek veya staking yapmak için bir hesap gerektirmez. Anahtarlarınız, kurtarma ifadeniz, kasanız ve onaylarınız tarayıcıdan asla ayrılmaz. Ağ istekleri yapar: bakiyeler, geçmiş ve yayınlama için herkese açık QoreChain uç noktalarına (bunlar herkese açık `qor1…` adresinizi taşır), bir fiyat sorgusuna (adres yok), tuttuğunuz veya görüntülediğiniz herhangi bir harici ağın herkese açık hizmetlerine (o ağdaki herkese açık adresiniz) ve @handle kayıt defterine (handle veya herkese açık bir adres). Yalnızca [Dashboard eşleştirmesini](#dashboard-bridge) kullanırsanız, adresin sahibi olduğunuza dair imzalı bir kanıt gönderir. Bkz. [QoreX ağ üzerinden neler gönderir](/qorex/overview#data-and-privacy).

### QoreX hangi izinleri istiyor ve neden {#permissions}

Bu bölüm, Firefox listelemesinin **"Tüm web sitelerindeki verilerinize erişme"** iznini göstermesi nedeniyle var; bu ifade, hiçbir host izni beyan etmeyen bir cüzdanla çelişiyor gibi görünebilir. İşte manifest dosyasındaki tam ve düzenlenmemiş gerçek.

Uzantının `manifest.json` dosyası şunları beyan eder:

```json
"permissions": ["storage", "nativeMessaging"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`storage`** - şifrelenmiş kasayı, köken başına bağlantı onaylarınızı ve cüzdanınızın kendi ayarlarını ve listelerini (kişiler gibi) **yerel olarak**, uzantı depolamasında saklar.
- **`nativeMessaging`** - 0.4.5'te yenidir ve yalnızca Geliştirici modundaki [Yapay zeka ajanları](#developer-tools) aracı tarafından, kendi bilgisayarınızdaki bir yardımcı programla (henüz yayımlanmadı) konuşmak için kullanılır. QoreX bu bağlantıyı yalnızca o araçta **Bu bilgisayarda yapay zeka ajanı bağlantılarına izin ver** seçeneğini açtıktan sonra kurar. **Safari** paketi bu izni beyan etmez.
- **`host_permissions: []`** - QoreX **hiçbir** host izni beyan etmez. Sizin adınıza rastgele sitelere kökenler arası ağ isteği yapma yetkisi istemez.
- **`web_accessible_resources`** - sayfaların, sağlayıcıyı sunan küçük betik olan QoreX'in kendi `inpage.js` dosyasını yüklemesine izin verir. `use_dynamic_url` ona oturum başına bir adres verir, böylece siteler uzantıyı yoklayarak parmak izini çıkaramaz.
- **`content_scripts` eşleşmesi `<all_urls>`** - Firefox'un *"Tüm web sitelerindeki verilerinize erişme"* demesinin dürüst nedeni budur. QoreX, **her sayfaya** küçük bir sağlayıcı betiği (`content.js` → `inpage.js`) enjekte eder. Tüm sitelerde çalışan bir içerik betiği teknik olarak sayfayı okuyabilir ve tarayıcılar bu yetkiyi tam olarak bu ifadeyle tanımlar - ister `host_permissions` üzerinden gelsin, ister bir içerik betiği eşleşmesinden.

**İçerik betiği neden her yerde çalışıyor.** Böylece **herhangi bir** dApp, siz önce site bazında erişim vermek zorunda kalmadan cüzdanı EIP-6963 üzerinden keşfedebilir. MetaMask, Keplr, Phantom ve diğer tüm enjekte edilen cüzdanlar bu şekilde çalışır: enjekte edilen sağlayıcı, ziyaret ettiğiniz her sitede, sayfanın betikleri çalışmadan önce (`document_start`) hazır olmalıdır.

**Bu betiğin yaptığı - ve yapmadığı.** Yalnızca cüzdan mesajlarını köprüler (sağlayıcıyı duyurur, bağlanma/imzalama isteklerini service worker'a iletir, sonucu döndürür). Bu istekler dışında sayfa içeriğini **okumaz**, bir sunucuya hiçbir şey göndermez, uzaktan kod yüklemez - ve host izni bulunmadığı için rastgele kökenler arası veri de çekemez. Bunların tamamı doğrulanabilir: uzantı CSP ile kilitlidir, hiçbir analitik içermez ve manifest dosyası (yukarıda) kurulu pakette okunabilir.

## Bir dApp'i QoreX'e bağlama {#connect}

Bir dApp, QoreX'i **EIP-6963** üzerinden keşfeder (isteği duyurun, `rdns` değeri `network.qore.qorex` olan cüzdanı seçin) ve ardından dönen EIP-1193 sağlayıcısını kullanır; QoreChain **Native** hattı için `window.qorex.native` kullanır ve bu derlemenin neyi desteklediğini görmek için `capabilities` değerini okur. QoreX `window.ethereum` veya `window.keplr` değerini asla ayarlamaz. Kodlu tam geliştirici rehberi kendi sayfasındadır: [Bir dApp'i QoreX ile entegre edin](/qorex/dapp-integration) ([QoreX'i algılama](/qorex/dapp-integration#detection) ve [Bağlanma](/qorex/dapp-integration#connect) bölümlerine bakın). Bir web uygulamasında [wallet adapter](/developer-tools/wallet-adapter) bu tespiti sizin yerinize sarmalar ve [QoreX geliştirici kiti](/developer-tools/qorex-integrations) uygulama tarafı entegrasyonunu kapsar. (`@qorechain/connect` kullanımdan kaldırılmıştır; üzerinde yeni çalışma başlatmayın.)

Onaylar **köken başınadır**: bir siteye ilk bağlantı, kökeni gösteren bir onay penceresi açar, onaylamak yalnızca genel adresinizi açığa çıkarır ve bir sitenin onayı bir başkasına hiçbir yetki vermez. Onaylar cüzdan başına tutulur, siz **Bağlı siteler** altından iptal edene kadar kalıcıdır ve bir sitenin bekleyen bir isteği olabilir (toplamda üç); cüzdan değiştirmek veya kilitlemek bekleyen isteklere "hayır" yanıtı verir. 0.4.5'ten itibaren, QoreX kilitliyken yapılan bir sitenin imza isteği siteyi adıyla belirterek parola ekranını açar ve kilidi açtıktan sonra onayını gösterir; pencereyi kapatmak isteği reddeder. Bkz. [Onay penceresi neyi gösterir](/qorex/security-and-recovery#approvals).

### Dashboard köprüsü (v0.1.5, v0.2.2'de genişletildi) {#dashboard-bridge}

0.1.5 sürümü, yalnızca **`dashboard.qorechain.io`** ile sınırlı bir köprü ekler: `window.qorex.native.connectProof(sessionId)`, *Connect with QoreX* eşleştirme kanıtını imzalar (arka uç imzayı yeniden doğrular) ve `executeTransfer({ to, amountUqor, memo })`, Dashboard tarafından önerilen bir QOR transferini onaylayıp yayınlar ve `txHash` değerini döndürür. Bu yöntemler diğer tüm kökenlerde reddedilir.

**0.2.2** sürümü, [staking](#stake-dashboard) dahil olmak üzere Dashboard tarafından önerilen bütün bir isteği kabul eden `native:executeRequest`'i ekler; bu, QoreX'in başka her yerde kullandığı aynı paylaşılan ayrıştırıcıya karşı doğrulanır: bir ağ uyuşmazlığında, yabancı bir kökende, size ait olmayan bir adreste, bilinmeyen bir istek türünde veya bir `toAddress` taşıyan bir staking isteğinde (staking isteklerinin bir tanesi yoktur) reddedilir. İstek türleri send, delegate, undelegate, redelegate ve claim'dir; bir Connect isteği hangi hesaplarınızı bağlayacağınızı seçmenize izin verir ve `listAccounts()` hesaplarınızı döndürür (salt okunur).

Bir `qor1…` adresi mainnet ve testnette eşit derecede geçerli olduğundan, Dashboard tarafından önerilen bir istek hangi ağı hedeflediğini belirtir ve bu, uzantının o anda bağlı olduğu ağla eşleşmiyorsa QoreX bu isteğe göre hareket etmeyi reddeder - bir isteğin adına asla ağ değiştirmez.

## Bir dApp'ten QoreChain işlemi gönderme: `signAndBroadcast` {#sign-and-broadcast}

Kayıtlı bir ML-DSA-87 anahtarı olan bir hesaptan gelen her QoreChain Native hattı işlemi hibrit bir imza gerektirir - secp256k1 **ve** ML-DSA-87 - ve ML-DSA anahtarını yalnızca cüzdan tutar, dolayısıyla bir sayfa bunu oluşturamaz. Bir dApp mesajları `window.qorex.native.signAndBroadcast({ chainId, messages, memo?, gasLimit? })` ile gönderir; QoreX çözümlenmiş mesajları ve ücreti gösterir, işlemi seçtiğiniz hesap için oluşturur, hibrit imzayı ekler (bu hesabın ilk işlemiyse önce hesabın ML-DSA-87 anahtarını kaydederek), yayınlar ve `{ txHash, code, height?, shield }` ile çözümlenir. Uzantı **0.3.5** sürümünden itibaren kullanılabilir.

- Zincir cüzdanın etkin ağı olmalıdır (mainnet'te `qorechain-vladi`). Bir dApp ağı değiştiremez; yalnızca siz değiştirebilirsiniz.
- Çağrı başına 1-32 mesaj; ücret onaydan önce gösterilir; ML-DSA-87 anahtar yönetimi gibi yalnızca cüzdana özgü mesajlar reddedilir.
- cosmjs, cosmos-kit ve Interchain Kit `getOfflineSigner` üzerinden (0.4.0'dan itibaren) çalışır; burada QoreX ML-DSA-87 katmanını ve ona ait ücreti ekler.
- `signArbitrary`, bir mesajı hesabın klasik anahtarı ve ML-DSA-87 ile imzalar (0.4.0'dan itibaren).

Kurallar, gas, hatalar ve tam kod örnekleri [Bir dApp'i QoreX ile entegre edin](/qorex/dapp-integration#sign-and-broadcast) sayfasındadır.

## Hibrit imzalama {#pqc}

QoreX'in kendi başlattığı her Native QOR transferi iki kez imzalanır: klasik bir secp256k1 anahtarıyla ve `@qorechain/sdk` içindeki hibrit hat kullanılarak **ML-DSA-87** (FIPS 204) ile. **Bir açma/kapama seçeneği yoktur**: QoreChain bunu zorunlu kılar ve QoreX hiçbir zaman bunsuz bir Native hattı QOR transferi göndermez.

- **dApp tarafından başlatılan Native imzalama** - [`signAndBroadcast`](#sign-and-broadcast) kullanın: QoreX her mesajı çözümler, ücreti gösterir ve ML-DSA-87 katmanını kendisi ekler. `signDirect` ve cosmjs imzacıları (`getOfflineSigner`) sayfanın oluşturduğu bir işlemi imzalar; işlem ML-DSA-87 katmanı taşımıyorsa QoreX bir tane ekler ve sayfanın eklediği bir katman herhangi bir onay penceresinden önce hesabın kayıtlı anahtarına karşı kontrol edilir (MetaMask'tan içe aktarılan hesaplar `signAndBroadcast` kullanır). QoreX asla kör imzalamaz: çözemediği bir istek reddedilir ve yalnızca klasik imzalı bir QoreChain işlemini asla imzalamaz. Bkz. [Bir dApp'i QoreX ile entegre edin](/qorex/dapp-integration#cosmjs).
- **Klasik imzalar her zaman etiketlenir** - harici ağlardaki (ETH, BNB, Solana, …) transferler bir ML-DSA-87 imzası taşıyamaz; QoreX açık bir onay işaretlemenizi ister ve sessizce alt seviyeye düşmek yerine bunları klasik olarak işaretler.

**Bunun işlem boyutu açısından anlamı.** ML-DSA-87 büyük bir imzadır: imza **4,627 bayt**, açık anahtar ise **2,592 bayttır** (FIPS-204 tarafından sabitlenmiştir). Dolayısıyla hibrit bir QoreChain işlemi, tamamen klasik bir işleme göre birkaç kilobayt daha büyüktür. İşlemleri kendiniz oluşturup yayınlıyorsanız, tamponlarınızı ve ücret tahminlerinizi bu ek baytlara göre boyutlandırın; QoreChain'in gas muhasebesi bunları zaten bekler. İlkeler ve deterministik imzalama gereksinimi için bkz. [Post-Kuantum İmzalama](/developer-guide/post-quantum-signing) (geliştirici rehberi).

## Nerede yayınlandı {#where-published}

| Mağaza | Listeleme | Güncel sürüm | Bağlantı |
|---|---|---|---|
| Chrome Web Store | **QoreX** | 0.4.5 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox Add-ons | `qorex` | 0.4.5 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Mac App Store (Safari) | **QoreX Wallet**, uygulama 1.8.1 | uzantı 0.4.3 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |

QoreX kaynak kodu herkese açık değildir. Mağaza listelemeleri her zaman güncel sürümü gösterir.

## Sınırlar ve bilinen sorunlar {#limits}

- **EVM imzalamanın sınırları var.** Sağlayıcı `personal_sign`, `eth_signTypedData_v4` ve `eth_sendTransaction` imzalar (QoreChain'de ve site başına Ethereum'da) ve diğer imzalama yöntemlerini reddeder. QoreChain'de yalnızca MetaMask'tan içe aktarılan hesaplar gönderim yapabilir, bir EVM işlemi bir yetkilendirme penceresi gerektirir (onay o işlem için bir tane açar) ve yalnızca secp256k1 imzası taşır. Bkz. [Bir dApp'i QoreX ile entegre edin](/qorex/dapp-integration#evm).
- **`window.qorex.native` Keplr tarzıdır, Keplr'in yerine geçen bir şey değildir.** `window.keplr` takma adı yoktur. `signAmino` ve `sendTx` yoktur: Amino `4200` koduyla reddedilir. `getOfflineSigner` ve `signDirect` çalışır ve sayfa getirmediğinde QoreX ML-DSA-87 katmanını ekler. `signArbitrary` ve `verifyArbitrary` (mesaj imzalama) 0.4.0'dan itibaren çalışır. Bir dApp ağı değiştiremez ve yalnızca cüzdana özgü mesajlar (anahtar yönetimi, harcama kuralları, EVM pencereleri, belirli yetkiler) her siteden reddedilir.
- **Yalnızca mobil:** Portfolio, Q-Day Scanner, sosyal kurtarma, Legacy, oturum açma, cihaz bağlama ve bir @handle talep etme.
- Uzantıda **Swap ekranı yok**.
- **Geçiş anahtarıyla kilit açma** yalnızca tarayıcının WebAuthn'ı uzantı sayfalarına sunduğu yerlerde (Chrome ve Edge) sunulur; Firefox'ta gizlidir.
- **Safari** onayları açılır pencere yerine bir tarayıcı sekmesinde açar.
- **Harici ağlar** yalnızca klasik imzaları kabul eder; QoreX her transferden önce bunu onaylamanızı ister.
- **Yalnızca testnet:** IBC üzerinden başka bir zincire gönderme, QoreChain Bridge ekranı ve QoreChain üzerinde Solana. Bkz. [Testnet özellikleri](/qorex/testnet-features).
- **Yapay zeka ajanları** henüz yayımlanmamış bir yardımcı program gerektirir ve Safari'de kullanılamaz.
- **Geçmiş** şimdilik yalnızca QoreChain'i kapsar.
- Uzantının kasası yalnızca bu tarayıcıda bulunur. Uzantıyı kaldırmak, verilerini temizlemek veya tarayıcıyı sıfırlamak anahtarlarınızı siler; onları yalnızca yazılı 24 kelimeniz geri getirir.
