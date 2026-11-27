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
- **Varsayılan olarak daha güvenli EVM erişim pencereleri.** Zincir v3.2.0 üzerinde bir EVM işlemi yalnızca hesabın açık bir penceresi olduğu sürece kabul edilir: işlem sayısı, değer ve son kullanma süresiyle sınırlanmış, hibrit imzalı bir `MsgOpenEVMWindow`. QoreX bunu açar, gösterir ve kapatır. Kendiniz açtığınız bir pencere, kendi uyarısıyla gelen **Herhangi bir sözleşme** seçeneğini seçmediğiniz sürece **Yalnızca QOR transferleri** ile sınırlıdır; açık bir pencere neleri kabul ettiğini tam olarak söyler; bir site için pencere açan bir onay da pencerenin izin verdiği her sözleşmeyi adıyla belirtir ve açık olanın yerini ne zaman aldığını söyler. Bkz. [Güvenlik ve Kurtarma](/qorex/security-and-recovery#evm-window).
- **Sabitlemeli handle'lar.** Bir @handle, bir `qor1…` adresine, kayıt defterinin ed25519 doğrulaması ve sahibinin kendi secp256k1 imzasıyla bağlanır. QoreX ilk çözdüğü adresi sabitler ve sessiz bir değişikliği işaretler.
- **Bir şirket gerektirmeyen kurtarma.** Sosyal kurtarma, seed'i ML-KEM ile mühürlenmiş şifreli paylara böler (3 koruyucudan 2'si) ve sizi uyaran 48 saatlik bir zaman kilidi uygular; Miras, koruyucularınız üzerinde bir ölü adam anahtarıdır; cihaz bağlama bir cüzdanı tek kullanımlık bir kod ve tek başına işe yaramayan bir QR ile taşır. Bkz. [Güvenlik ve Kurtarma](/qorex/security-and-recovery).
- **Amaçlı ilk çalıştırma.** Kısa turdan sonra QoreX **Önce ne yapmak istersiniz?** diye sorar (para almak, para göndermek veya kriptomu güvende tutmak) ve sizi kısa bir yedek kontrolüyle biten hedefinize götürür. Bkz. [İlk çalıştırma](/qorex/getting-started#first-run).
- **İmzalı bağlantılarla ödeme istekleri.** Bir tutar isteyin; QoreX kendi hesap anahtarınızla imzalanmış bir bağlantı oluşturur, böylece değiştirilmiş bir alıcı veya tutar algılanır. Ödeyenin QoreX'i imzayı, ağı ve varsa @handle'ı kontrol eder, ardından normal incelemeyi gösterir. Bir istek yalnızca zincir ödemeyi gösterdiğinde ödendi olarak işaretlenir. Bkz. [Gönder ve Al](/qorex/send-and-receive).
- **Kişiler ve favoriler.** Ödeme yaptığınız adresler için yalnızca cihazda tutulan adlar. Favoriler gönderme formunda tek dokunuşluk çiplerdir, **Ödemeyi tekrarla** formu yeniden doldurur (yine de incelersiniz) ve kayıtlı bir adrese yalnızca benzeyen bir adres işaretlenir.
- **Paramın korunması.** Yedeğinizin doğrulanıp doğrulanmadığını, kurtarmanızın test edilip edilmediğini, koruyucularınızı (uygulama), size bağlı siteleri ve uygulamaları, hesabınızın ağda verdiği izinleri ve QoreChain'in EVM'indeki ERC-20 onaylarını (her biri İptal ile) ve hangi imzaların hangi lane'de kuantum sonrası olduğunu canlı olarak kontrol eden tek bir ekran. Bkz. [Güvenlik ve Kurtarma](/qorex/security-and-recovery).
- **Anlaşılır bir geçmiş.** Her işlem, zincirden okunarak, hesap başına beklemede, onaylandı veya başarısız olarak görünür ve bir elektronik tabloda güvenle açılabilen CSV dışa aktarımı vardır.
- **Ağ durumu bandı.** Bloklar gelmeyi bırakırsa QoreX bunu zincirin kendi blok zamanlarını kullanarak söyler. Ağ iyiyken hiçbir şey söylemez.
- **Kuantum sonrası anahtar bakımı.** Bir hesabın kuantum sonrası anahtar kaydı artık imzalayamıyorsa QoreX onu yeniden kaydetmeyi önerir (asla otomatik değil, iki dokunuşla). Ayrıca ML-DSA-87 anahtarını kurtarma ifadenizden döndürebilir ve kuantum sonrası bir **multisig** hesabı oluşturabilir, birlikte imzalayabilir ve ondan gönderebilirsiniz.
- **Geliştirici modu.** 17 araç ekleyen bir anahtar (varsayılan olarak kapalı): denetçiler, bir işlem simülatörü, sözleşme ve dağıtım incelemesi, rollup profilleri, çevrimdışı ve multisig imzalama ve yapay zeka ajanlarının sizin onayladığınız işlemler önerdiği bir yer. İçindeki hiçbir şey bir imzalama kuralını değiştirmez. Bkz. [Geliştirici modu](/qorex/developer-mode).
- **Yalnızca testnet ağ özellikleri.** IBC üzerinden başka bir zincire gönderme, QoreChain Bridge ekranı ve QoreChain üzerinde Solana yalnızca testnet'te vardır. Bkz. [Testnet özellikleri](/qorex/testnet-features).
- **Küçük ayak izi.** Eklenti tarayıcıdan tek bir API izni, `storage`, ister ve hiçbir analitik veya izleme kodu içermez. Anlık bildirim sunucuya yalnızca herkese açık adreslerinizi söyler ve bildirim yalnızca "QOR received" der.

## Nasıl kullanılır {#how-to-use}

1. QoreX'i resmi bir mağaza listesinden kurun ([Nasıl erişilir](#how-to-access) bölümüne bakın).
2. Bir cüzdan oluşturun veya geri yükleyin: mobil uygulama için [Başlarken](/qorex/getting-started), eklenti için [Tarayıcı Eklentisi](/qorex/browser-extension#wallet).
3. 24 kelimeyi yazın, ardından **Önce ne yapmak istersiniz?** sorusunda seçim yapıp (alma, gönderme veya kriptomu güvende tutma) adımları izleyin: [İlk çalıştırma](/qorex/getting-started#first-run). Sonra QOR gönderin ve alın: [Gönder ve Al](/qorex/send-and-receive).
4. Stake edin: [Portföy ve Stake](/qorex/portfolio-and-staking). Güvenlik ağınızı kurun: [Güvenlik ve Kurtarma](/qorex/security-and-recovery).
5. Bir web sitesini QoreX ile kullanmak için siteyi eklentide (masaüstü) veya uygulamanın [dApp Tarayıcısı](/qorex/dapp-browser) içinde açın. Her bağlantı ve her imza, sizin verdiğiniz bir onaydır.

## Nasıl erişilir {#how-to-access}

- **Ağlar:** mainnet `qorechain-vladi` (varsayılan) ve testnet `qorechain-diana`. Mobilde testnet **Ayarlar → Testneti kullan (geliştiriciler)** altındadır. Eklentide önce Geliştirici modunu açın (açılır pencerenin altındaki sürüm numarasına yedi kez dokunun), ardından **Testnet'e geç (diana)** seçeneğini seçin. Testnet'teyken her ekranda sarı bir **TESTNET** bandı görünür.
- **Gereken hesap:** yok. Oturum açma (e-posta, Apple veya Google) isteğe bağlıdır ve yalnızca bir @handle talep etmek, Dashboard'a bağlanmak ve uygulamadaki hesap tabanlı ödeme isteklerini kullanmak için gereklidir. İmzalı ödeme bağlantıları hesap gerektirmez.
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

| Yapı | Liste ve paket adı | Güncel sürüm | Bağlantı |
|---|---|---|---|
| iOS uygulaması | App Store, **QoreX** (id 6791256626) | 1.2.5 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Android uygulaması | Google Play, `network.qore.qorex` | 1.2.5 | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |
| Chrome eklentisi | Chrome Web Store, **QoreX** | 0.4.5 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox eklentisi | Firefox Add-ons, `qorex` | 0.4.5 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Safari eklentisi | Mac App Store, **QoreX Wallet** (id 6794132220) | uygulama 1.8.1, eklenti 0.4.3 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |
| Geliştirici kiti | altı npm paketi, bkz. [Geliştiriciler için](#developers) | 0.1.0 | [QoreX entegrasyonları](/developer-tools/qorex-integrations) |

Mağaza incelemesi kendi takvimine göre çalışır, bu yüzden bir mağaza diğerinden daha eski bir yapı sunabilir; bkz. [Hangi sürüm nerede canlı](#versions). QoreX kaynak kodu herkese açık değildir.

## Sınırlar ve bilinen sorunlar {#limits}

- **İmzalanandan fazlasına söz verilmez.** Hibrit imza native lane işlemlerini kapsar. EVM işlemleri yalnızca bir secp256k1 imzası taşır ve yalnızca bir EVM erişim penceresi açıkken kabul edilir (bu lane'de yalnızca **Ethereum hesabı ekle (coin 60)** ile eklenen hesaplar gönderim yapabilir). SVM ve harici ağ transferleri yalnızca klasiktir.
- **Yalnızca mobil:** Portföy, Q-Day Tarayıcı, sosyal kurtarma, Miras, oturum açma, bir @handle talep etme ve cihaz bağlama.
- **Takas kullanılamaz.** Havuz likiditesi oluşana kadar kapalı kalır ve iOS'ta gösterilmez.
- **Bağlı imzacılar** (harcama limitli bağlı anahtar olarak Phantom veya MetaMask) QoreX içinde henüz kullanılamaz.
- **Yalnızca testnet:** IBC üzerinden başka bir zincire gönderme, QoreChain Bridge ekranı ve QoreChain üzerinde Solana. Hiçbiri mainnet'te sunulmaz. Bkz. [Testnet özellikleri](/qorex/testnet-features).
- **Yapay zeka ajanları** (Geliştirici modu) imzalayamaz: yalnızca sizin onayladığınız bir işlem önerebilirler. Eklentide bilgisayarınızda henüz yayımlanmamış bir yardımcı programa ihtiyaç duyarlar ve Safari'de yoktur. Uygulamada bir öneri yapıştırır veya bir öneri bağlantısı açarsınız. Bkz. [Geliştirici modu](/qorex/developer-mode).
- **Handle hizmeti kapalıysa** cüzdan düz adreslere döner; geri kalan her şey çalışmaya devam eder.
- Yazılı ifadesi ve sosyal kurtarması olmayan kayıp bir cüzdanı kimse kurtaramaz.

## Platform kullanılabilirliği {#platform-availability}

| Yetenek | Mobil uygulama (Android ve iOS) | Tarayıcı eklentisi |
|---|---|---|
| Cüzdan oluştur / içe aktar | ✅ (uygulama cüzdanı oluştururken ifadeyi göstermez - Ayarlar → Güvenlik'ten görüntüleyin) | ✅ (bağımsız; ifade oluşturma sırasında bir kez gösterilir, ardından kısa bir yedek kontrolü yapılır) |
| İlk çalıştırma: **Önce ne yapmak istersiniz?** | ✅ (turdan sonra; Ayarlar'dan yeniden açılır) | ✅ (oluşturma veya içe aktarmadan sonra; açılır pencereden yeniden açılır) |
| Yedek kontrolü (ifadenizin üç kelimesi üzerine bir sınav) | ✅ | ✅ |
| Her biri kendi kurtarma ifadesine sahip birden çok cüzdan | ✅ (Ayarlar → Cüzdanlar) | ✅ (**Cüzdanlar**, hepsi için tek parola) |
| Tek kurtarma ifadesinden birden çok hesap | ✅ (cüzdan başına 20'ye kadar) | ✅ |
| Elle eklenen Ethereum tarzı (coin 60) hesap | ✅ | ✅ |
| QOR gönder ve al (hibrit imzalı native lane) | ✅ | ✅ (inceleme adımlı Gönder; Al coin ile başlar) |
| Desteklenen herhangi bir ağda al | ✅ | ✅ |
| Bir @handle öde | ✅ | ✅ |
| Bir @handle talep et | ✅ (oturum açmış bir hesap gerekir) | - (eklenti sizi uygulamaya yönlendirir) |
| İmzalı bağlantılarla ödeme istekleri ve bunları ödeme | ✅ | ✅ |
| Kişiler, favoriler ve **Ödemeyi tekrarla** | ✅ | ✅ |
| Hesap başına geçmiş (beklemede, onaylandı, başarısız) ve CSV dışa aktarma | ✅ (Hareketler) | ✅ (**Geçmiş**) |
| **Paramın korunması** | ✅ | ✅ |
| **Destek** (resmi kanallar) | ✅ | ✅ |
| Ağ durumu bandı | ✅ | ✅ |
| Otomatik kilit (varsayılan 15 dakika) | ✅ (biyometrinizi veya PIN'inizi yeniden ister) | ✅ (parolanızı yeniden ister) |
| Staking: delege et, stake'ten çek, stake'i taşı, talep et, talep et ve yeniden stake et, kilitler, ödüllerin gideceği yeri seçme | ✅ | ✅ (her biri için bir ekran) |
| Kuantum sonrası anahtar onarımı ve rotasyonu | ✅ | ✅ |
| Kuantum sonrası multisig hesapları | ✅ | ✅ |
| Dış ağlar (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokenlar) | ✅ | ✅ (popup'tan gönder) |
| Sözleşme adresiyle token ekle (EVM ağları) | ✅ | ✅ |
| EVM erişim penceresi | ✅ | ✅ |
| Arayüz dili (10 dil) | ✅ (telefonu izler) | ✅ (tarayıcıyı izler) |
| Portföy, Q-Day Tarayıcı, Sosyal Kurtarma, Miras | ✅ | - |
| Arama, ilk açılış turu, ana ekran widget'ı, anlık bildirimler | ✅ | - |
| dApp bağlantıları | ✅ (uygulama içi tarayıcı, site başına iptal edilebilir, favori ve son siteler) | ✅ (herhangi bir web sitesi; İptal özellikli **Bağlı siteler**) |
| Geliştirici modu (17 araç) | ✅ (alt çubukta bir **Geliştirici** sekmesi) | ✅ (tek bir **Geliştirici araçları** düğmesi) |
| İşlem öneren yapay zeka ajanları (Geliştirici modu) | ✅ (bir öneri yapıştırın veya öneri bağlantısı açın) | yardımcı program gerekir (henüz yayımlanmadı); Safari'de yok |
| Başka bir zincire gönderme (IBC), QoreChain Bridge ekranı, QoreChain üzerinde Solana | yalnızca testnet | yalnızca testnet |
| Takas | Yalnızca Android, havuz likiditesine kadar kapalı (iOS'ta gösterilmez) | - |
| Hesap girişi | ✅ | - |
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

:::note
Sürümler 27 Kasım 2026 tarihinde kontrol edilmiştir. iPhone ve Android uygulamaları 1.2.5 ile Chrome ve Firefox eklentileri 0.4.5 yayında. 0.4.5 eklentisini içeren Safari 1.8.2 mağaza incelemesinde: Safari'de bu kılavuzun 0.4.5 için anlattığı özellikler, Mac App Store güncellemeyi sunduğunda gelir. Paylaşılan ödeme bağlantılarının web sayfası henüz yayında değil; bağlantılar QoreX'te açılır.
:::

Mağaza incelemesi kendi takvimine göre çalışır, bu yüzden bir mağaza bir süre diğerinden daha eski bir yapı sunabilir. Bu, **her mağazadaki** güncel sürümdür:

| Mağaza | Güncel sürüm | Not |
|---|---|---|
| Apple App Store (iOS) | 1.2.5 | |
| Google Play (Android) | 1.2.5 | |
| Chrome Web Store | 0.4.5 | |
| Firefox Add-ons | 0.4.5 | |
| Safari (Mac App Store) | 1.8.1, eklenti 0.4.3 ile birlikte | Mac App Store kendi `1.x` numaralandırmasını kullanır |

Mağazalar her zaman güncel sürümlerini gösterir ve hâlâ eski bir yapı sunan bir mağaza otomatik olarak yetişir.

### 1.2.5 / 0.4.5 yapılarının ekledikleri {#whats-new-125}

Günlük kullanım için (aksi belirtilmedikçe uygulama ve eklenti, mainnet ve testnet):

- **Amaçlı ilk çalıştırma.** Turdan sonra **Önce ne yapmak istersiniz?** sizi kısa bir yedek kontrolüyle birlikte almaya, göndermeye veya kriptonuzu güvende tutmaya götürür. Atlanabilir ve yeniden açabilirsiniz. Bkz. [İlk çalıştırma](/qorex/getting-started#first-run).
- **İmzalı bağlantılarla ödeme istekleri** ve bir bağlantıdan ödeme. Bir istek, zincir gösterdiğinde ödendi olarak işaretlenir.
- **Kişiler ve favoriler**, **Ödemeyi tekrarla** ve benzer görünen adresler için bir uyarı.
- **Daha anlaşılır bir geçmiş**: hesap başına beklemede, onaylandı veya başarısız, CSV dışa aktarımıyla.
- **Paramın korunması**: yedek, kurtarma testi, koruyucular (uygulama), bağlı siteler, İptal ile izinler ve token onayları ve hangi imzaların hangi lane'de kuantum sonrası olduğuna dair sade bir açıklama.
- **Daha güvenli EVM erişim pencereleri.** Kendiniz açtığınız bir pencere varsayılan olarak **Yalnızca QOR transferleri** içindir; herhangi bir sözleşmeye izin vermek uyarılı ayrı bir seçimdir. Onaylar bir pencerenin izin verdiği her sözleşmeyi adıyla belirtir ve yeni bir pencerenin açık olanın yerini ne zaman aldığını söyler. Bir düğüm bir çağrının token'larınıza ne yaptığını kontrol edemediğinde QoreX bunu söyler ve ikinci bir dokunuş ister.
- **Uygulama içi yardım** (**Destek**): yalnızca resmi kanallar ve QoreX personelinin ifadenizi asla istemediğine dair bir hatırlatma.
- Bloklar gelmeyi bıraktığında **bir ağ durumu bandı** ve **stake süresi** (stake'ten çekilen QOR'u taşıyabilmeniz için geçen süre) sabit bir sayı yerine ağdan okunur.
- **Eklenti: QoreX kilitliyken bir sitenin imza isteği** parola ekranını açar ve siteyi adıyla belirtir; kilidi açtıktan sonra istek kendi onayını gösterir.
- dApp tarayıcısının başlangıç sayfasında **uygulama: favori ve son siteler**.
- **Kuantum sonrası anahtar bakımı**: artık imzalayamayan bir anahtar kaydı için **Anahtarı yeniden kaydet** (asla otomatik değil, iki dokunuşla), kurtarma ifadenizden **Kuantum sonrası anahtarı döndür** ve tam multisig hesapları (oluşturma, dosyayla veya yapıştırarak birlikte imzalama, gönderme).
- **Al**, sözleşmeyle eklediğiniz token'ları da ağlarının adresiyle sunar.
- Cosmos Hub, Osmosis ve Celestia için **Al**, bu ağlardaki gönderimlerinizin imzalandığı adresi gösterir.
- 17 araçlı **Geliştirici modu**. Bkz. [Geliştirici modu](/qorex/developer-mode).
- **Yalnızca testnet:** IBC üzerinden başka bir zincire gönderme, bir QoreChain Bridge ekranı ve QoreChain üzerinde Solana. Bkz. [Testnet özellikleri](/qorex/testnet-features).
- **Siteler için:** QoreX artık başka birinin hesabınız gibi davranmasına izin verecek kalıcı bir izni (`MsgGrant` veya `MsgExec` için bir authz yetkisi) her siteden reddeder. Bkz. [dApp entegrasyonu](/qorex/dapp-integration).

1.2.4 / 0.4.3 yapılarının sizin için değiştirdikleri:

- **Eklenti kilidi açma.** Enter kilidi açar, düğme çalıştığını gösterir, **Yanlış parola.** yalnızca yanlış parola için görünür ve diğer her hata adıyla belirtilir.
- **Sözleşme çağrıları yeterli gas alır.** Bir sitenin CosmWasm veya cross-VM işlemi onaydan önce simüle edilir ve sözleşmenin reddedeceği bir çağrı siz görmeden reddedilir.
- **Gas fiyatları ağı izler** ve ağın işlem başına gas sınırının üzerindeki bir işlem herhangi bir şey imzalanmadan önce reddedilir.
- **Solana onayları**, QoreX'in çözemediği bir talimatı okunamaz olarak işaretler ve ikinci bir dokunuş ister; bir memo metnini gösterir.
- **Artık imzalayamayan bir kuantum sonrası anahtar bu adla belirtilir**, "başka bir cüzdan tarafından kaydedilmiş" yerine.
- **Bir site artık EVM pencerenizi kapatamaz veya onayını temizleyemez**; ikisini de QoreX'in kendi ekranlarından yaparsınız.
- **Staking getirisi** zincirin kendi rakamından okunur ve **EVM penceresi kullanımı** Geçmiş'te görünür.
- **Firefox:** QoreX yüklüyken github.com normal şekilde yüklenir.

1.2.3 / 0.4.2 yapılarının sizin için değiştirdikleri:

- **Al, coin ile başlar.** QOR en başta, ardından her ağın kendi coin'i ve pakete dahil tokenlar, her biri görseliyle, aranabilir bir liste. Birini seçmek, o ağın adresini ve QR kodunu coin'in adını veren bir uyarıyla gösterir.
- **EVM penceresi kullanamayan hesaplara sırada ne yapacakları söylenir**, **Hesapların** düğmesiyle.
- **Staking ve EVM penceresi ekranları ilk işleminizin anahtarınızı da kaydettiğini söyler.**

1.2.2 / 0.4.1 yapılarının sizin için değiştirdikleri:

- QOR sayfası, hesabın gelen ve giden her işlemini **Daha fazla göster** ile listeler.
- **Gönderme; Ethereum, Solana, Cosmos Hub ve Osmosis'te olduğu gibi BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche ve Celestia'da (ve token'larında) da çalışır.**
- Onay ekranları harcama kurallarını ve EVM call data'sını okur ve mesajın tamamını sunar. Bir hesabın anahtarlarını veya yetkisini yöneten mesajlar yalnızca QoreX'in kendi ekranlarından imzalanabilir.
- İlk gönderimin incelemesi, tek seferlik anahtar kayıt ücretini ve toplamı gösterir.

1.2.1 yapısının (uygulama) sizin için değiştirdikleri: bir bağlantı dApp tarayıcısında bir sayfa açabilir (olağan biyometrik istemden sonra), onay ekranları bir işlemin memo'sunu gösterir ve uygulama imzalama yeteneklerini sitelere bildirir. Dashboard'un verdiği `qorex://` ile başlayan bağlantılar yeniden çalışıyor.

1.2.0 / 0.4.0 yapılarının sizin için değiştirdikleri:

- Eklentide **otomatik kilit** (1, 5, 15, 30, 60 veya 240 dakika; varsayılan 15) ve bir **Kilitle** düğmesi.
- Eklentide **her transferden önce bir inceleme** ve bir adres daha önce ödeme yaptığınız bir adrese yalnızca benziyorsa bir uyarı.
- Her tür QoreChain işlemini içeren **hesap başına geçmiş**.
- Eklentide **staking ekranları** ayrıdır (QOR stake et, Stake'ten çek, Stake'i taşı, Talep et, Talep et ve yeniden stake et, Bonus için kilitle, Ödüllerin gittiği yer), **Stake'i taşı** üç adımdadır ve ağın reddedeceği taşımaları yakalar, ayrıca **staking ödüllerinin nereye gideceğini seçebilirsiniz** (aynı cüzdanın başka bir hesabı).
- **EVM dApp'leri QoreX üzerinden imzalar** (`personal_sign`, typed data ve işlemler); her isteğin çözülmüş riski ve imzalamadan önce bir simülasyon gösterilir.
- Ağ yanıt vermediğinde **bilinen son değerler** gösterilir ve bu şekilde etiketlenir.
- Ücret taşıdığınız değerden büyük olduğunda bir uyarı.

1.1.9 / 0.3.9 yapılarının eklediği (her güncel yapıya dahildir):

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

QoreX, 7 Haziran 2026'dan beri canlı olan ve 18 Kasım 2026'dan beri zincir **v3.2.8** sürümünü çalıştıran (v3.2.7, 12 Kasım 2026'dan; v3.2.6, 4 Kasım 2026'dan; v3.2.5, 29 Ekim 2026'dan; v3.2.4, 23 Ekim 2026'dan) mainnet `qorechain-vladi` üzerinde çalışır. İmza biçimi, adresler, ondalık basamaklar ve memolar bu yükseltmelerde değişmez. QoreX 1.2.4 / 0.4.3, v3.2.8 kuralları (EVM penceresi kapsamı, gas sınırları ve ağın gas fiyatı) için işleme ekledi, bu yüzden QoreX'i güncel tutun.

## Geliştiriciler için {#developers}

Bir web sitesini QoreX'e bağlamak (cüzdan keşfi, sağlayıcı, imzalama, bağlantılar ve hatalar) için [dApp entegrasyonu](/qorex/dapp-integration) ile başlayın; cüzdana geliştiriciler için yerleştirilen araçlar [Geliştirici modu](/qorex/developer-mode) sayfasındadır. Kendi uygulamanızdan QoreX ile entegre olmak için QoreX geliştirici kitini de kullanabilirsiniz: 0.1.0 sürümünde yayımlanmış altı npm paketi. Kurulum komutları, örnekler ve sınırlar [QoreX entegrasyonları](/developer-tools/qorex-integrations) sayfasındadır. Bir web uygulamasında cüzdan keşfi ve imzalama için ayrıca [cüzdan adaptörüne](/developer-tools/wallet-adapter) ve QoreX'in enjekte ettiği tarayıcı sağlayıcısı için [Tarayıcı Eklentisi](/qorex/browser-extension#standards) sayfasına bakın.

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
- **Oturum açma** (e-posta ya da Apple veya Google) - bir @handle talep etmek, Dashboard'a bağlamak ve uygulamadaki hesap tabanlı ödeme isteklerini kullanmak için gereklidir.
- **Dashboard bağlantısı ve bağlı adresler** - adrese sahip olduğunuza dair imzalı bir kanıt gönderir.
- **Hesap tabanlı ödeme istekleri** (bir @handle'a, uygulamada) - gönderen handle'ı, alıcı handle'ı, tutarı ve isteğe bağlı notu gönderir. **İmzalı bir ödeme bağlantısı** cihazınızda oluşturulur ve imzalanır; ödenip ödenmediği herkese açık QoreChain uç noktalarından okunur.
- **Bir Bitcoin adresinde Q-Day Tarayıcı** - o adresi ve IP adresinizi gören, başkasının işlettiği bir hizmete sorar. QoreX hizmetin adını söyler ve yalnızca siz kabul ettikten sonra tarar.

**Ana ekran widget'ı**, QoreChain sunucularına kendi başına hiçbir istek yapmaz: uygulama ona adresinizi, bakiyenizi ve gizlilik işaretini yerel olarak verir ve widget bakiyeyi herkese açık QoreChain REST uç noktasından yeniler.

**Yalnızca cihazda tutulanlar:** kişiler, uygulamanızın favori ve son dApp siteleri (adresin sorgu veya parça kısmı olmadan kaydedilir), yaptığınız geçmiş dışa aktarımı ve kurtarma testi ile yedek kontrolü (yazdığınız kelimeler saklanmaz veya gönderilmez). **Ağ durumu** bandı, en son bloğu ayrı bir durum hizmetinden değil, herkese açık QoreChain uç noktalarından okur.

Her iki uygulamada da **yapay zeka sohbeti ve QCAI hizmeti yoktur**. Geliştirici modundaki **Yapay zeka ajanları** aracı, kendi çalıştırdığınız bir yapay zeka asistanının QoreX'e işlem önermesine izin verir; QoreX'in içinde kendine ait bir yapay zeka hizmeti yoktur ve onayınız olmadan hiçbir şey imzalanmaz.
