---
slug: /qorex/overview
title: QoreX Cüzdanı
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QoreX Cüzdanı

**QoreX**, kuantum güvenli Layer 1 **QoreChain**'in (mainnet `qorechain-vladi`) resmi **saklamasız (non-custodial)** cüzdanıdır. Özel anahtarlarınız **yalnızca cihazınızda** üretilir ve saklanır — QoreChain Association fonlarınıza asla erişemez ve uygulamalarda **hiçbir analitik, çökme raporlama veya izleme SDK'sı yoktur** — anahtarlar, kurtarma ifadesi, kasa ve onaylar cihazınızdan asla çıkmaz ([QoreX'in ağ üzerinden neler gönderdiği](#data-and-privacy) bölümüne bakın). Native lane üzerindeki her QOR transferi bir **hibrit post-kuantum imza** (ML-DSA-87, NIST FIPS-204, secp256k1 ile eşleştirilmiş) taşır, böylece fonlarınız hem klasik hem de kuantum saldırganlara karşı korunur.

QoreX, birlikte çalışan iki parçadan oluşur:

- **Tarayıcı eklentisi** — masaüstü cüzdanı, **Chrome, Firefox ve Safari'de (macOS) canlı ve yayında**. Hem bağımsız bir cüzdandır (oluştur/içe aktar, QOR tut ve gönder) hem de herhangi bir web sitesinin QoreX'i keşfetmesini ve her isteği açık bir onaya dönüştürmesini sağlayan bağlayıcıdır. Bkz. [Tarayıcı Eklentisi](/qorex/browser-extension).
- **Mobil uygulama** (Android ve iOS) — tam cüzdan: oluştur/geri yükle, kuantum güvenli QOR gönder ve al, dış ağlar, staking, portföy, kurtarma ve uygulama içi bir dApp tarayıcısı. Android için **Google Play'de**, iOS için **App Store'da** (aşağıdaki kullanılabilirliğe bakın).

:::caution Cüzdan oluşturur oluşturmaz kurtarma ifadenizi yedekleyin
QoreX saklamasızdır: QoreChain Association kaybolan bir cüzdanı kurtaramaz, sıfırlayamaz veya sizin için geri yükleyemez. **Uygulamayı kaldırmak, telefonu sıfırlamak veya eklentiyi silmek anahtarlarınızı o cihazdan siler.** 24 kelimelik kurtarma ifadenizi yazın (mobil uygulama cüzdanı oluştururken bunu göstermez — **Ayarlar → Güvenlik → Kurtarma ifadesini göster** bölümünden görüntüleyin; eklenti oluşturma sırasında bir kez gösterir) ve mümkünse [sosyal kurtarma](/qorex/security-and-recovery#social-recovery) kurun. Bkz. [Şimdi yedekleyin](/qorex/security-and-recovery#back-up-now).
:::

## Platform kullanılabilirliği {#platform-availability}

| Yetenek | Mobil uygulama (Android ve iOS) | Tarayıcı eklentisi |
|---|---|---|
| Cüzdan oluştur / içe aktar | ✅ (uygulama cüzdanı oluştururken ifadeyi göstermez — Ayarlar → Güvenlik'ten görüntüleyin) | ✅ (bağımsız; ifade oluşturma sırasında bir kez gösterilir) |
| Her biri kendi kurtarma ifadesine sahip birden çok cüzdan | ✅ (Ayarlar → Cüzdanlar) | ✅ (**Cüzdanlar**, hepsi için tek parola) |
| Tek kurtarma ifadesinden birden çok hesap | ✅ (cüzdan başına 20'ye kadar) | ✅ |
| Elle eklenen Ethereum tarzı (coin 60) hesap | ✅ | ✅ |
| QOR gönder ve al (post-kuantum) | ✅ | ✅ (Gönder; QR ile Al) |
| Desteklenen herhangi bir ağda al | ✅ | ✅ |
| Bir @handle öde | ✅ | ✅ |
| Bir @handle talep et | ✅ (oturum açmış bir hesap gerekir) | — (eklenti sizi uygulamaya yönlendirir) |
| Staking: delege et, unstake et, stake'i taşı, talep et, talep et ve yeniden stake et | ✅ | ✅ |
| Dış ağlar (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokenlar) | ✅ | ✅ (popup'tan gönder) |
| Sözleşme adresiyle token ekle (EVM ağları) | ✅ | ✅ |
| EVM erişim penceresi | ✅ | ✅ |
| Arayüz dili (10 dil) | ✅ (telefonu izler) | ✅ (tarayıcıyı izler) |
| Portföy, Q-Day Tarayıcı, Sosyal Kurtarma, Miras | ✅ | — |
| Arama, ilk açılış turu, ana ekran widget'ı, anlık bildirimler | ✅ | — |
| dApp bağlantıları | ✅ (uygulama içi tarayıcı, oturum kapsamlı) | ✅ (herhangi bir web sitesi; İptal özellikli **Bağlı siteler**) |
| Takas | Yalnızca Android, havuz likiditesine kadar kapalı (iOS'ta gösterilmez) | — |
| Hesap girişi ve ödeme istekleri | ✅ | — |
| Çoklu cihaz bağlama | ✅ | — |
| Dashboard eşleştirme | ✅ | ✅ (bağlantı + önerilen transferler, staking dahil) |

## QoreX neden farklı

- **Varsayılan olarak kuantum güvenli** — Native lane QOR transferleri her zaman bir ML-DSA-87 + secp256k1 hibrit imza taşır. Klasik olan her şey (dış zincirler) açıkça etiketlenir, asla sessiz geçilmez.
- **Gerçek anlamda saklamasız** — anahtarlar cihaz üzerinde üretilir ve donanım destekli bir kasada (iOS'ta Secure Enclave, Android'de StrongBox) veya şifreli bir kasada (eklenti) yaşar. Cihazınızdan asla çıkmazlar.
- **Hiçbir QoreX uygulamasında analitik, çökme raporlama veya izleme SDK'sı yok.** İsteğe bağlı birkaç ekstra yalnızca siz açtığınızda bir sunucu kullanır: hesap girişi (bkz. [Hesap ve Dashboard](/qorex/account-and-dashboard)) ve QOR geldiğinde QoreX'in sizi bilgilendirebilmesi için cihazınızı ve *herkese açık* adreslerinizi kaydeden anlık bildirimler. Cüzdan asla bunların hiçbirine bağımlı değildir. Tam liste [QoreX'in ağ üzerinden neler gönderdiği](/qorex/overview#data-and-privacy) bölümündedir.
- **Tek bir birleşik bakiye** — QOR'unuz Native, EVM ve SVM lane'leri arasında tek bir bakiyedir; QoreX bunu tek bir rakam olarak gösterir.
- **Birden çok kurtarma yolu** — 24 kelimelik bir kurtarma ifadesi (her zaman; mobilde Ayarlar → Güvenlik'ten görüntüleyin), koruyucularla isteğe bağlı sosyal kurtarma ve 48 saatlik bir zaman kilidi, isteğe bağlı Miras devri ve pratik çoklu cihaz bağlama.

## Başlarken

- QoreX'e yeni misiniz? Cüzdanınızı oluşturmak veya geri yüklemek için [Başlarken](/qorex/getting-started) ile başlayın.
- Ardından kuantum güvenli QOR'u [Gönder ve Al](/qorex/send-and-receive)'ı öğrenin.
- Güvenlik ağınızı [Güvenlik ve Kurtarma](/qorex/security-and-recovery)'da kurun.
- Masaüstünde [Tarayıcı Eklentisi](/qorex/browser-extension)'ni kurun.

## İndirme ve kullanılabilirlik {#availability}

- **Tarayıcı eklentisi** — canlı ve yayında: [Chrome Web Store, Firefox Add-ons veya Mac App Store'dan (Safari)](/qorex/browser-extension#install) kurun. Her zaman resmi bir mağaza listesinden kurun.
- **Android uygulaması** — Google Play'de üretimde canlı: https://play.google.com/store/apps/details?id=network.qore.qorex (Android 7.0 veya üzeri).
- **iOS uygulaması** — **App Store**'da canlı: https://apps.apple.com/us/app/qorex-wallet/id6791256626 (iOS 15.1 veya üzeri).

## Hangi sürüm nerede canlı {#versions}

Mağaza incelemesi kendi takvimine göre çalışır, bu yüzden her mağaza kendi sürümünü sunar ve Google Play ile Chrome Web Store şu anda diğerlerinin gerisindedir. Bu, **20 Ekim 2026** itibarıyla **her mağazadaki** güncel sürümdür:

| Mağaza | Güncel sürüm | Not |
|---|---|---|
| Apple App Store (iOS) | 1.1.7 | 15 Ekim'de yayımlandı |
| Google Play (Android) | 1.1.6 | 1.1.7 yüklendi ancak henüz herkese açık değil — herkese açık liste hâlâ 1.1.6'yı gösteriyor |
| Chrome Web Store | 0.3.6 | hâlâ 0.3.6 sunuyor |
| Firefox Add-ons | 0.3.7 | |
| Safari (Mac App Store) | 1.7.7, eklenti 0.3.7 ile birlikte | Mac App Store kendi `1.x` numaralandırmasını kullanır |

Mağazalar her zaman güncel sürümlerini gösterir ve hâlâ eski bir sürüm sunan bir mağaza otomatik olarak yetişir. Aşağıda **1.1.7 / 0.3.7** olarak işaretlenen özellikler, bu sürümü zaten taşıyan tablodaki mağazalarda (iOS, Firefox, Safari) canlıdır ve bu listeler güncellendiğinde Google Play ve Chrome'a gelir. Bu kılavuzda 1.1.7 / 0.3.7'den daha yeni hiçbir şeyin kullanılabilir olduğu anlatılmaz.

1.1.7 / 0.3.7 sürümlerinin sizin için değiştirdikleri:

- **Onaylar, baytları iki şekilde okunabilen bir isteği reddeder.** Aynı alan bir istekte iki kez görünürse, bir ekran ile zincir neyin imzalandığı konusunda anlaşamayabilir — örneğin gösterilenden farklı yürütülen bir ücret veya tutar. QoreX artık böyle bir isteği, tek bir okumasını göstermek yerine reddeder. Bkz. [Onay penceresinin gösterdikleri](/qorex/security-and-recovery#approvals).
- **İzin süresinin bitişi saniyesine kadar gösterilir** ve yönetişim oyları çözülüp onay ekranında gösterilir.
- **Siteler, bir isteğin kendisi hakkında iddia ettiği şeyle değil, tarayıcının kendisinin doğruladığı kaynak (origin) ile tanımlanır.**
- **@handle sorgulamaları eklentide yeniden çalışıyor.**
- **Bir @handle talep etmek için oturum açmış bir hesap gerekir ve uygulamada yapılır**; eklenti sizi oraya yönlendirir.
- **QoreChain'e benzeyen isimler ayrılmıştır**, böylece yeni bir handle projeyi veya ekibini taklit edemez.

1.0.9 / 0.2.6'dan bu yana öne çıkanlar:

- Aynı telefonda veya tarayıcıda her biri kendi kurtarma ifadesine sahip **birden çok cüzdan**, tek dokunuşla geçiş — bkz. [Birden çok cüzdan](/qorex/getting-started#several-wallets).
- İlk olarak MetaMask'ta veya Dashboard'da kullanılmış ifadeler için elle eklenen **Ethereum tarzı (coin 60) hesap** — bkz. [MetaMask'tan veya Dashboard'dan bir ifadeyi geri yükleyin](/qorex/getting-started#restore-dashboard).
- **Sözleşme adresiyle token ekleme**, **Herhangi bir ağda alma**, genel **arama**, ilk açılış **turu**, **ana ekran widget'ı** ve QOR geldiğinde **anlık bildirimler** (mobil) — bkz. [Gönder ve Al](/qorex/send-and-receive).
- **Talep et ve yeniden stake et**, talepten önce ücret kontrolü, **Devam eden unstake** listesi ve unstake edemeyeceğiniz kadar stake etmeden önce uyarılar — bkz. [Portföy ve Stake](/qorex/portfolio-and-staking).
- Her mesajı, ücreti, harcama limitlerini ve son kullanma süresini gösteren ve QoreX'in görüntüleyemediği şeyleri reddeden onay ekranları; dApp'ler için **`signAndBroadcast`**; İptal özellikli **Bağlı siteler** (eklenti); **EVM erişim penceresi** — bkz. [Güvenlik ve Kurtarma](/qorex/security-and-recovery) ve [Tarayıcı Eklentisi](/qorex/browser-extension).
- Düzeltmeler: fonlanmış bir hesap "Hesaplarınız" listesinden anlık olarak kaybolabiliyordu (1.0.9); Android donanım Geri tuşu artık bir ekran geri gidiyor (1.1.1); kurtarma ifadesi Android 14 ve sonrasında erişilebilirlik hizmeti olmayan hizmetlerden gizleniyor (1.1.6).

QoreX, **v3.2.3** zincir sürümünü çalıştıran mainnet `qorechain-vladi` üzerinde çalışır (7 Haziran 2026'dan beri canlı) 3.742.566 yüksekliğine kadar, v3.2.4 ise o bloktan itibaren çalışır. İmza biçimi, adresler, ondalık basamaklar, memolar ve ücretler bu yükseltmelerde değişmez; bu nedenle bunlar için bir QoreX güncellemesi gerekmez.

## QoreX'in ağ üzerinden neler gönderdiği {#data-and-privacy}

QoreX'te **hiçbir analitik, çökme raporlama veya izleme SDK'sı yoktur**. Anahtarlarınız, kurtarma ifadeniz, kasa ve onaylarınız **cihazdan asla çıkmaz**. Uygulamalar, her cüzdanın yapması gerektiği gibi ağ ile konuşur; tam liste budur.

**Her zaman (bakiyeleri göstermek ve göndermek için gerekli):**

- Bakiyeler, geçmiş ve yayınlama için **QoreChain herkese açık uç noktaları** (`qore.host` üzerinde `api`, `rpc`, `evm` ve `svm` ile `-testnet` eşdeğerleri). Bu istekler **herkese açık** `qor1…` adresinizi taşır.
- **Fiyat sorgusu** — QOR fiyatı için tek bir istek; **hiçbir adres taşımaz**.
- **Sahip olduğunuz veya görüntülediğiniz dış ağlar** — o ağ için üçüncü taraf herkese açık RPC/REST hizmetleri; o ağdaki **herkese açık** adresinizi taşır.
- **@handle kayıt defteri** — sorguladığınız handle'ı veya herkese açık bir adresi taşır.

**Yalnızca siz açarsanız:**

- **Anlık bildirimler** (mobil) — etkinleştirene kadar kapalıdır. Sunucu bu durumda cihaz belirtecinizi ve kullanımdaki cüzdanın herkese açık `qor1…` adreslerini (en fazla 10) alır. Sunucunun 90 gündür haber almadığı bir cihaz unutulur.
- **Sosyal kurtarma** — aktarıcı (relay) **yalnızca şifreli metni** saklar.
- **Oturum açma** (e-posta ya da Apple veya Google) — bir @handle talep etmek, Dashboard'a bağlamak ve ödeme isteklerini kullanmak için gereklidir.
- **Dashboard bağlantısı ve bağlı adresler** — adrese sahip olduğunuza dair imzalı bir kanıt gönderir.
- **Ödeme istekleri** — gönderen handle'ı, alıcı handle'ı, tutarı ve isteğe bağlı notu gönderir.

**Ana ekran widget'ı**, QoreChain sunucularına kendi başına hiçbir istek yapmaz: uygulama ona adresinizi, bakiyenizi ve gizlilik işaretini yerel olarak verir ve widget bakiyeyi herkese açık QoreChain REST uç noktasından yeniler.

Her iki uygulamada da **yapay zeka sohbeti ve QCAI hizmeti yoktur**.
