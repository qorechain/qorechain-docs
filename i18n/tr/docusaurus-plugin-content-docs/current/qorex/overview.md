---
slug: /qorex/overview
title: QoreX Cüzdanı
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QoreX Cüzdanı

**QoreX**, **QoreChain**'in (mainnet `qorechain-vladi`) resmi **saklamasız (non-custodial)** cüzdanıdır. QOR tutmak, göndermek, stake etmek ve almak, insanlara @handle ile ödeme yapmak, aynı kurtarma ifadesiyle diğer ağlarda varlık tutmak ve web sitelerinin cüzdanlarından imzalamasını istediği şeyleri onaylamak isteyen herkes içindir. Özel anahtarlarınız **yalnızca cihazınızda** üretilir ve saklanır. QoreChain Association fonlarınıza asla erişemez ve uygulamalarda **hiçbir analitik, çökme raporlama veya izleme SDK'sı yoktur**. Anahtarlar, kurtarma ifadesi, kasa ve onaylar cihazınızdan asla çıkmaz ([QoreX'in ağ üzerinden neler gönderdiği](#data-and-privacy) bölümüne bakın). Her native QOR transferi iki kez imzalanır: klasik bir anahtarla ve ML-DSA-87 (FIPS 204) ile.

QoreX, birlikte çalışan dört yapıdan oluşan bir ailedir:

- **Mobil uygulama** (Android ve iOS): kurtarma, staking, portföy, uygulama içi bir dApp tarayıcısı ve Q-Day Tarayıcı ile tam cüzdan. Bkz. [Başlarken](/qorex/getting-started) ve [dApp Tarayıcısı](/qorex/dapp-browser).
- **Tarayıcı eklentisi** (Chrome ve Chromium tabanlı tarayıcılar, Firefox): bağımsız bir masaüstü cüzdanı ve herhangi bir web sitesinin QoreX'i keşfetmesini ve her isteği açık bir onaya dönüştürmesini sağlayan bağlayıcı. Bkz. [Tarayıcı Eklentisi](/qorex/browser-extension).
- **Safari eklentisi**: aynı eklenti, Mac App Store'daki **QoreX Wallet** macOS uygulamasının içinde paketlenmiştir.
- **Geliştirici kiti**: QoreX ile entegre olan uygulamalar için altı herkese açık npm paketi. Bkz. [Geliştiriciler için](#developers).

:::caution Cüzdan oluşturur oluşturmaz kurtarma ifadenizi yedekleyin
QoreX saklamasızdır: QoreChain Association kaybolan bir cüzdanı kurtaramaz, sıfırlayamaz veya sizin için geri yükleyemez. **Uygulamayı kaldırmak, telefonu sıfırlamak veya eklentiyi silmek anahtarlarınızı o cihazdan siler.** 24 kelimelik kurtarma ifadenizi yazın (mobil uygulama cüzdanı oluştururken bunu göstermez, bu yüzden **Ayarlar → Güvenlik → Kurtarma ifadesini göster** bölümünden görüntüleyin; eklenti oluşturma sırasında bir kez gösterir) ve mümkünse [sosyal kurtarma](/qorex/security-and-recovery#social-recovery) kurun. Bkz. [Şimdi yedekleyin](/qorex/security-and-recovery#back-up-now).
:::

## Yenilikler {#innovations}

- **Hibrit imzalı native lane.** Her native QOR transferi iki kez imzalanır: klasik bir secp256k1 anahtarıyla ve ML-DSA-87 (FIPS 204) ile. Zincir ikisini de doğrular. Harici bir ağdaki her şey yalnızca klasiktir ve QoreX siz onaylamadan önce bunu etiketler.
- **Tek kurtarma ifadesi, tek ML-DSA-87 anahtarı, ikinci bir yedek yok.** ML-DSA-87 anahtarı aynı 24 kelimeden deterministik olarak türetilir: `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`. Türetim [QoreSign](/qoresign/overview) içinde yayımlanmıştır, dolayısıyla uyumlu her cüzdan aynı anahtarı türetir.
- **Otomatik kaydedilir, sonra kontrol edilir.** ML-DSA-87 anahtarı ilk işleminizle zincirde kaydedilir (zincir v3.2.3 ve sonrasında sahiplik kanıtıyla birlikte). Her yayından sonra cüzdan, işlenen işlemin ML-DSA-87 katmanını taşıdığını kontrol eder ve taşımıyorsa sizi uyarır.
- **Okuyamadığını reddeden onaylar.** İmzalamadan önce her mesaj, ücret, harcama limitleri ve son kullanma süresi çözülür. QoreX'in çözemediği bir istek ya da baytları iki şekilde okunabilen bir istek reddedilir.
- **dApp'ler için `signAndBroadcast`.** Bir web sitesi mesajları gönderir; cüzdan bunları çözülmüş olarak gösterir, yalnızca cüzdanın üretebileceği ML-DSA-87 katmanını ekler ve yayınlar. Bir sayfa bu katmanı üretemez.
- **EVM erişim pencereleri.** Zincir v3.2.0 üzerinde bir EVM işlemi yalnızca hesabın açık bir penceresi olduğu sürece kabul edilir: işlem sayısı, değer ve son kullanma süresiyle sınırlanmış, hibrit imzalı bir `MsgOpenEVMWindow`. QoreX bunu açar, gösterir ve kapatır.
- **Sabitlemeli handle'lar.** Bir @handle, bir `qor1…` adresine, kayıt defterinin ed25519 doğrulaması ve sahibinin kendi secp256k1 imzasıyla bağlanır. QoreX ilk çözdüğü adresi sabitler ve sessiz bir değişikliği işaretler.
- **Bir şirket gerektirmeyen kurtarma.** Sosyal kurtarma, seed'i ML-KEM ile mühürlenmiş şifreli paylara böler (3 koruyucudan 2'si) ve sizi uyaran 48 saatlik bir zaman kilidi uygular; Miras, koruyucularınız üzerinde bir ölü adam anahtarıdır; cihaz bağlama bir cüzdanı tek kullanımlık bir kod ve tek başına işe yaramayan bir QR ile taşır. Bkz. [Güvenlik ve Kurtarma](/qorex/security-and-recovery).
- **Küçük ayak izi.** Eklenti tarayıcıdan tek bir API izni, `storage`, ister ve hiçbir analitik veya izleme kodu içermez. Anlık bildirim sunucuya yalnızca herkese açık adreslerinizi söyler ve bildirim yalnızca "QOR received" der.

## Nasıl kullanılır {#how-to-use}

1. QoreX'i resmi bir mağaza listesinden kurun ([Nasıl erişilir](#how-to-access) bölümüne bakın).
2. Bir cüzdan oluşturun veya geri yükleyin: mobil uygulama için [Başlarken](/qorex/getting-started), eklenti için [Tarayıcı Eklentisi](/qorex/browser-extension#wallet).
3. 24 kelimeyi yazın, ardından QOR gönderin ve alın: [Gönder ve Al](/qorex/send-and-receive).
4. Stake edin: [Portföy ve Stake](/qorex/portfolio-and-staking). Güvenlik ağınızı kurun: [Güvenlik ve Kurtarma](/qorex/security-and-recovery).
5. Bir web sitesini QoreX ile kullanmak için siteyi eklentide (masaüstü) veya uygulamanın [dApp Tarayıcısı](/qorex/dapp-browser) içinde açın. Her bağlantı ve her imza, sizin verdiğiniz bir onaydır.

## Nasıl erişilir {#how-to-access}

- **Ağlar:** mainnet `qorechain-vladi` (varsayılan) ve testnet `qorechain-diana`. Mobilde testnet **Ayarlar → Testnet kullan (geliştiriciler)** altındadır.
- **Gereken hesap:** yok. Oturum açma (e-posta, Apple veya Google) isteğe bağlıdır ve yalnızca bir @handle talep etmek, Dashboard'a bağlanmak ve ödeme isteklerini kullanmak için gereklidir.
- **Ön koşullar:** mobilde bir cihaz kilidi açma yöntemi (iOS'ta Face ID veya Touch ID; Android'de Class-3 biyometrik veya bir ekran kilidi PIN'i); aksi halde oluştur ve içe aktar düğmeleri devre dışı kalır. Eklentide bir parola.
- **Maliyet:** QoreX ücretsizdir. Gönderme, staking ve bir EVM penceresi açma normal ağ ücretini öder (ağ tabanı gaz başına 0,1 uqor'dur).
- **Her zaman resmi bir listeden kurun:**

| Yapı | Nerede | Minimum |
|---|---|---|
| iOS uygulaması | [App Store, QoreX](https://apps.apple.com/us/app/qorex-wallet/id6791256626) | iOS 15.1 |
| Android uygulaması | [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) | Android 7.0 |
| Chrome, Brave, Edge, Arc, Opera | [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) | bir Chromium tarayıcısı |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/) | Firefox 140 |
| Safari | [Mac App Store, QoreX Wallet](https://apps.apple.com/us/app/qorex-wallet/id6794132220) | macOS 12 |

## Nerede yayımlandı {#where-published}

| Yapı | Liste ve paket adı | Güncel sürüm (27 Eki 2026) | Bağlantı |
|---|---|---|---|
| iOS uygulaması | App Store, **QoreX** (id 6791256626) | 1.1.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Android uygulaması | Google Play, `network.qore.qorex` | 1.1.9 | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |
| Chrome eklentisi | Chrome Web Store, **QoreX** | 0.3.8 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox eklentisi | Firefox Add-ons, `qorex` | 0.3.9 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Safari eklentisi | Mac App Store, **QoreX Wallet** (id 6794132220) | uygulama 1.7.8, eklenti 0.3.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |
| Geliştirici kiti | altı npm paketi, bkz. [Geliştiriciler için](#developers) | 0.1.0 | [QoreX entegrasyonları](/developer-tools/qorex-integrations) |

Mağaza incelemesi kendi takvimine göre çalışır, bu yüzden bir mağaza diğerinden daha eski bir yapı sunabilir; bkz. [Hangi sürüm nerede canlı](#versions). QoreX kaynak kodu herkese açık değildir.

## Sınırlar ve bilinen sorunlar {#limits}

- **İmzalanandan fazlasına söz verilmez.** Hibrit imza native lane işlemlerini kapsar. EVM işlemleri yalnızca bir secp256k1 imzası taşır ve yalnızca bir EVM erişim penceresi açıkken kabul edilir. SVM ve harici ağ transferleri yalnızca klasiktir.
- **Eklentinin EVM sağlayıcısı yalnızca hesap ve ağ sorgularını yanıtlar.** Henüz EVM işlemlerini veya mesajlarını imzalamaz. Mesaj imzalama (`signArbitrary`) sunulmamıştır.
- **Yalnızca mobil:** Portföy, Q-Day Tarayıcı, sosyal kurtarma, Miras, ödeme istekleri, oturum açma ve cihaz bağlama.
- **Takas kullanılamaz.** Havuz likiditesi oluşana kadar kapalı kalır ve iOS'ta gösterilmez.
- **Bağlı imzacılar** (harcama limitli bağlı anahtar olarak Phantom veya MetaMask) QoreX içinde henüz kullanılamaz.
- ML-DSA-87 anahtarınız için **anahtar rotasyonu** QoreX içinde henüz kullanılamaz.
- **Handle hizmeti kapalıysa** cüzdan düz adreslere döner; geri kalan her şey çalışmaya devam eder.
- Yazılı ifadesi ve sosyal kurtarması olmayan kayıp bir cüzdanı kimse kurtaramaz.

## Platform kullanılabilirliği {#platform-availability}

| Yetenek | Mobil uygulama (Android ve iOS) | Tarayıcı eklentisi |
|---|---|---|
| Cüzdan oluştur / içe aktar | ✅ (uygulama cüzdanı oluştururken ifadeyi göstermez - Ayarlar → Güvenlik'ten görüntüleyin) | ✅ (bağımsız; ifade oluşturma sırasında bir kez gösterilir) |
| Her biri kendi kurtarma ifadesine sahip birden çok cüzdan | ✅ (Ayarlar → Cüzdanlar) | ✅ (**Cüzdanlar**, hepsi için tek parola) |
| Tek kurtarma ifadesinden birden çok hesap | ✅ (cüzdan başına 20'ye kadar) | ✅ |
| Elle eklenen Ethereum tarzı (coin 60) hesap | ✅ | ✅ |
| QOR gönder ve al (hibrit imzalı native lane) | ✅ | ✅ (Gönder; QR ile Al) |
| Desteklenen herhangi bir ağda al | ✅ | ✅ |
| Bir @handle öde | ✅ | ✅ |
| Bir @handle talep et | ✅ (oturum açmış bir hesap gerekir) | - (eklenti sizi uygulamaya yönlendirir) |
| Staking: delege et, unstake et, stake'i taşı, talep et, talep et ve yeniden stake et | ✅ | ✅ |
| Dış ağlar (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokenlar) | ✅ | ✅ (popup'tan gönder) |
| Sözleşme adresiyle token ekle (EVM ağları) | ✅ | ✅ |
| EVM erişim penceresi | ✅ | ✅ |
| Arayüz dili (10 dil) | ✅ (telefonu izler) | ✅ (tarayıcıyı izler) |
| Portföy, Q-Day Tarayıcı, Sosyal Kurtarma, Miras | ✅ | - |
| Arama, ilk açılış turu, ana ekran widget'ı, anlık bildirimler | ✅ | - |
| dApp bağlantıları | ✅ (uygulama içi tarayıcı, oturum kapsamlı) | ✅ (herhangi bir web sitesi; İptal özellikli **Bağlı siteler**) |
| Takas | Yalnızca Android, havuz likiditesine kadar kapalı (iOS'ta gösterilmez) | - |
| Hesap girişi ve ödeme istekleri | ✅ | - |
| Çoklu cihaz bağlama | ✅ | - |
| Dashboard eşleştirme | ✅ | ✅ (bağlantı + önerilen transferler, staking dahil) |

## Başlarken

- QoreX'e yeni misiniz? Cüzdanınızı oluşturmak veya geri yüklemek için [Başlarken](/qorex/getting-started) ile başlayın.
- Ardından hibrit imzalı native lane üzerinde QOR'u [Gönder ve Al](/qorex/send-and-receive) bölümünden öğrenin.
- Güvenlik ağınızı [Güvenlik ve Kurtarma](/qorex/security-and-recovery)'da kurun.
- Masaüstünde [Tarayıcı Eklentisi](/qorex/browser-extension)'ni kurun.

## İndirme ve kullanılabilirlik {#availability}

[Nasıl erişilir](#how-to-access) bölümündeki resmi listelerden kurun. Android uygulaması Android 7.0 veya üzerini, iOS uygulaması iOS 15.1 veya üzerini, Firefox eklentisi Firefox 140 veya üzerini ve Safari eklentisi macOS 12 veya üzerini gerektirir.

## Hangi sürüm nerede canlı {#versions}

Mağaza incelemesi kendi takvimine göre çalışır, bu yüzden bir mağaza bir süre diğerinden daha eski bir yapı sunabilir. Bu, **27 Ekim 2026** itibarıyla **her mağazadaki** güncel sürümdür:

| Mağaza | Güncel sürüm | Not |
|---|---|---|
| Apple App Store (iOS) | 1.1.8 | 21 Ekim'de yayımlandı |
| Google Play (Android) | 1.1.9 | |
| Chrome Web Store | 0.3.8 | |
| Firefox Add-ons | 0.3.9 | |
| Safari (Mac App Store) | 1.7.8, eklenti 0.3.8 ile birlikte | Mac App Store kendi `1.x` numaralandırmasını kullanır |

Mağazalar her zaman güncel sürümlerini gösterir ve hâlâ eski bir yapı sunan bir mağaza otomatik olarak yetişir. Bir mağazanın henüz yayımlamadığı yapılar bu kılavuzda kullanılabilir olarak anlatılmaz.

1.1.9 / 0.3.9 yapılarının eklediği (bugün Android 1.1.9 ve Firefox eklentisi 0.3.9; iOS, Chrome ve Safari, mağazaları bu yapıları sunduğunda bunları taşır):

- **Staking kilitleri.** Stake'inizin bir kısmını 3, 6 veya 12 aylığına kilitleyin. Gösterilen bonus, kilidin bugün kazandığı bonustur ve ağın üst sınırının altındadır. Erken kilit açma, maliyeti belirten ikinci bir onayın arkasındadır; **Unstake** ve **Stake'i taşı** kilidi açık kısımla sınırlıdır. Kademe tablosu "up to" ile etiketlenir ve yanında bugünkü rakam gösterilir. Bkz. [Portföy ve Stake](/qorex/portfolio-and-staking#staking-locks).
- Onaylarda **IBC transfer memoları sade bir dille**.
- Eklentide **MetaMask'tan içe aktarılan hesaplardan (coin 60) staking**.

1.1.8 / 0.3.8 yapılarının sizin için değiştirdikleri:

- **İlk sayfadan itibaren QoreChain'de MetaMask.** MetaMask'ın gerektirdiği EVM erişim penceresini açın, kontrol edin ve kapatın, ne kadarının kaldığını görün.
- **Daha güçlü imza kontrolleri.** QoreX, bir uygulamanın ML-DSA-87 imzasını hesabınızın kayıtlı anahtarına karşı doğrular ve bu anahtar başka bir cüzdan tarafından kaydedilmişse bunu açıkça söyler.
- **Bildirilen güvenlik sorunları için düzeltmeler.**

1.1.7 / 0.3.7 yapılarının sizin için değiştirdikleri (1.1.8 / 0.3.8'e dahildir):

- **Onaylar, baytları iki şekilde okunabilen bir isteği reddeder.** Aynı alan bir istekte iki kez görünürse, bir ekran ile zincir neyin imzalandığı konusunda anlaşamayabilir - örneğin gösterilenden farklı yürütülen bir ücret veya tutar. QoreX artık böyle bir isteği, tek bir okumasını göstermek yerine reddeder. Bkz. [Onay penceresinin gösterdikleri](/qorex/security-and-recovery#approvals).
- **İzin süresinin bitişi saniyesine kadar gösterilir** ve yönetişim oyları çözülüp onay ekranında gösterilir.
- **Siteler, bir isteğin kendisi hakkında iddia ettiği şeyle değil, tarayıcının kendisinin doğruladığı kaynak (origin) ile tanımlanır.**
- **@handle sorgulamaları eklentide yeniden çalışıyor.**
- **Bir @handle talep etmek için oturum açmış bir hesap gerekir ve uygulamada yapılır**; eklenti sizi oraya yönlendirir.
- **QoreChain'e benzeyen isimler ayrılmıştır**, böylece yeni bir handle projeyi veya ekibini taklit edemez.

1.0.9 / 0.2.6'dan bu yana öne çıkanlar:

- Aynı telefonda veya tarayıcıda her biri kendi kurtarma ifadesine sahip **birden çok cüzdan**, tek dokunuşla geçiş - bkz. [Birden çok cüzdan](/qorex/getting-started#several-wallets).
- İlk olarak MetaMask'ta veya Dashboard'da kullanılmış ifadeler için elle eklenen **Ethereum tarzı (coin 60) hesap** - bkz. [MetaMask'tan veya Dashboard'dan bir ifadeyi geri yükleyin](/qorex/getting-started#restore-dashboard).
- **Sözleşme adresiyle token ekleme**, **Herhangi bir ağda alma**, genel **arama**, ilk açılış **turu**, **ana ekran widget'ı** ve QOR geldiğinde **anlık bildirimler** (mobil) - bkz. [Gönder ve Al](/qorex/send-and-receive).
- **Talep et ve yeniden stake et**, talepten önce ücret kontrolü, **Devam eden unstake** listesi ve unstake edemeyeceğiniz kadar stake etmeden önce uyarılar - bkz. [Portföy ve Stake](/qorex/portfolio-and-staking).
- Her mesajı, ücreti, harcama limitlerini ve son kullanma süresini gösteren ve QoreX'in görüntüleyemediği şeyleri reddeden onay ekranları; dApp'ler için **`signAndBroadcast`**; İptal özellikli **Bağlı siteler** (eklenti); **EVM erişim penceresi** - bkz. [Güvenlik ve Kurtarma](/qorex/security-and-recovery) ve [Tarayıcı Eklentisi](/qorex/browser-extension).
- Düzeltmeler: fonlanmış bir hesap "Hesaplarınız" listesinden anlık olarak kaybolabiliyordu (1.0.9); Android donanım Geri tuşu artık bir ekran geri gidiyor (1.1.1); kurtarma ifadesi Android 14 ve sonrasında erişilebilirlik hizmeti olmayan hizmetlerden gizleniyor (1.1.6).

QoreX, 7 Haziran 2026'dan beri canlı olan ve 29 Ekim 2026'dan beri zincir **v3.2.5** sürümünü çalıştıran (v3.2.4, 23 Ekim 2026'dan) mainnet `qorechain-vladi` üzerinde çalışır. İmza biçimi, adresler, ondalık basamaklar, memolar ve ücretler bu yükseltmelerde değişmez; bu nedenle bunlar için bir QoreX güncellemesi gerekmez.

## Geliştiriciler için {#developers}

Kendi uygulamanızdan QoreX ile entegre olmak için QoreX geliştirici kitini kullanın: 0.1.0 sürümünde yayımlanmış altı npm paketi. Kurulum komutları, örnekler ve sınırlar [QoreX entegrasyonları](/developer-tools/qorex-integrations) sayfasındadır. Bir web uygulamasında cüzdan keşfi ve imzalama için ayrıca [cüzdan adaptörüne](/developer-tools/wallet-adapter) ve QoreX'in enjekte ettiği tarayıcı sağlayıcısı için [Tarayıcı Eklentisi](/qorex/browser-extension#standards) sayfasına bakın.

## QoreX'in ağ üzerinden neler gönderdiği {#data-and-privacy}

QoreX'te **hiçbir analitik, çökme raporlama veya izleme SDK'sı yoktur**. Anahtarlarınız, kurtarma ifadeniz, kasa ve onaylarınız **cihazdan asla çıkmaz**. Uygulamalar, her cüzdanın yapması gerektiği gibi ağ ile konuşur; tam liste budur.

**Her zaman (bakiyeleri göstermek ve göndermek için gerekli):**

- Bakiyeler, geçmiş ve yayınlama için **QoreChain herkese açık uç noktaları** (`qore.host` üzerinde `api`, `rpc`, `evm` ve `svm` ile `-testnet` eşdeğerleri). Bu istekler **herkese açık** `qor1…` adresinizi taşır.
- **Fiyat sorgusu** - QOR fiyatı için tek bir istek; **hiçbir adres taşımaz**.
- **Sahip olduğunuz veya görüntülediğiniz dış ağlar** - o ağ için üçüncü taraf herkese açık RPC/REST hizmetleri; o ağdaki **herkese açık** adresinizi taşır.
- **@handle kayıt defteri** - sorguladığınız handle'ı veya herkese açık bir adresi taşır.

**Yalnızca siz açarsanız:**

- **Anlık bildirimler** (mobil) - etkinleştirene kadar kapalıdır. Sunucu bu durumda cihaz belirtecinizi ve kullanımdaki cüzdanın herkese açık `qor1…` adreslerini (en fazla 10) alır. Sunucunun 90 gündür haber almadığı bir cihaz unutulur.
- **Sosyal kurtarma** - aktarıcı (relay) **yalnızca şifreli metni** saklar.
- **Oturum açma** (e-posta ya da Apple veya Google) - bir @handle talep etmek, Dashboard'a bağlamak ve ödeme isteklerini kullanmak için gereklidir.
- **Dashboard bağlantısı ve bağlı adresler** - adrese sahip olduğunuza dair imzalı bir kanıt gönderir.
- **Ödeme istekleri** - gönderen handle'ı, alıcı handle'ı, tutarı ve isteğe bağlı notu gönderir.

**Ana ekran widget'ı**, QoreChain sunucularına kendi başına hiçbir istek yapmaz: uygulama ona adresinizi, bakiyenizi ve gizlilik işaretini yerel olarak verir ve widget bakiyeyi herkese açık QoreChain REST uç noktasından yeniler.

Her iki uygulamada da **yapay zeka sohbeti ve QCAI hizmeti yoktur**.
