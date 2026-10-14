---
slug: /qorex/overview
title: QoreX Cüzdanı
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QoreX Cüzdanı

**QoreX**, kuantum güvenli Layer 1 **QoreChain**'in (mainnet `qorechain-vladi`) resmi **saklamasız (non-custodial)** cüzdanıdır. Özel anahtarlarınız **yalnızca cihazınızda** üretilir ve saklanır — QoreChain Association fonlarınıza asla erişemez ve uygulamalarda **hiçbir analitik, izleme veya reklam yoktur**. Native lane üzerindeki her QOR transferi bir **hibrit post-kuantum imza** (ML-DSA-87, NIST FIPS-204, secp256k1 ile eşleştirilmiş) taşır, böylece fonlarınız hem klasik hem de kuantum saldırganlara karşı korunur.

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
| Bir @handle öde / talep et | ✅ | ✅ ödeme; talep etme bazı eklenti sürümlerinde sıradan QoreChain hesaplarında sunulur — aksi halde uygulamada talep edin |
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
- **Hiçbir QoreX uygulamasında analitik, izleme veya reklam yok.** İsteğe bağlı ekstralar yalnızca siz açtığınızda bir sunucu kullanır: hesap girişi (bkz. [Hesap ve Dashboard](/qorex/account-and-dashboard)) ve QOR geldiğinde QoreX'in sizi bilgilendirebilmesi için cihazınızı ve *herkese açık* adreslerinizi kaydeden anlık bildirimler. Cüzdan asla bunların hiçbirine bağımlı değildir.
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

Mağaza incelemesi kendi takvimine göre çalışır, bu yüzden bir mağaza kısa süreliğine diğerinden daha eski veya daha yeni bir sürüm sunabilir. **15 Ekim 2026** itibarıyla:

| Platform | Canlı sürüm |
|---|---|
| Android | 1.1.6 |
| iOS | 1.1.6 |
| Chrome | 0.3.6 |
| Firefox | 0.3.7 (0.3.6'dan sonraki bir ara sürüm) |
| Safari (macOS) | 1.7.6, eklenti 0.3.6 ile birlikte |

Bu dokümantasyon 1.1.6 / 0.3.6 özellik setini anlatır. Hâlâ eski bir sürüm sunan bir mağaza otomatik olarak yetişecektir; mağazalar her zaman güncel sürümlerini gösterir. 1.0.9 / 0.2.6'dan bu yana öne çıkanlar:

- Aynı telefonda veya tarayıcıda her biri kendi kurtarma ifadesine sahip **birden çok cüzdan**, tek dokunuşla geçiş — bkz. [Birden çok cüzdan](/qorex/getting-started#several-wallets).
- İlk olarak MetaMask'ta veya Dashboard'da kullanılmış ifadeler için elle eklenen **Ethereum tarzı (coin 60) hesap** — bkz. [MetaMask'tan veya Dashboard'dan bir ifadeyi geri yükleyin](/qorex/getting-started#restore-dashboard).
- **Sözleşme adresiyle token ekleme**, **Herhangi bir ağda alma**, genel **arama**, ilk açılış **turu**, **ana ekran widget'ı** ve QOR geldiğinde **anlık bildirimler** (mobil) — bkz. [Gönder ve Al](/qorex/send-and-receive).
- **Talep et ve yeniden stake et**, talepten önce ücret kontrolü, **Devam eden unstake** listesi ve unstake edemeyeceğiniz kadar stake etmeden önce uyarılar — bkz. [Portföy ve Stake](/qorex/portfolio-and-staking).
- Her mesajı, ücreti, harcama limitlerini ve son kullanma süresini gösteren ve QoreX'in görüntüleyemediği şeyleri reddeden onay ekranları; dApp'ler için **`signAndBroadcast`**; İptal özellikli **Bağlı siteler** (eklenti); **EVM erişim penceresi** — bkz. [Güvenlik ve Kurtarma](/qorex/security-and-recovery) ve [Tarayıcı Eklentisi](/qorex/browser-extension).
- Düzeltmeler: fonlanmış bir hesap "Hesaplarınız" listesinden anlık olarak kaybolabiliyordu (1.0.9); Android donanım Geri tuşu artık bir ekran geri gidiyor (1.1.1); kurtarma ifadesi Android 14 ve sonrasında erişilebilirlik hizmeti olmayan hizmetlerden gizleniyor (1.1.6).
