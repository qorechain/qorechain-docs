---
slug: /qorex/overview
title: QoreX Cüzdan
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QoreX Cüzdan

**QoreX**, kuantuma dayanıklı Layer 1 olan **QoreChain** ağının (ana ağ `qorechain-vladi`) resmî **saklamasız** (non-custodial) cüzdanıdır. Özel anahtarlarınız **yalnızca kendi cihazınızda** üretilir ve saklanır — QoreChain Association fonlarınıza asla erişemez ve uygulamalar **hiçbir veri** toplamaz. Native hattındaki her QOR transferi **hibrit post-kuantum imza** taşır (ML-DSA-87, NIST FIPS-204, secp256k1 ile eşleştirilmiş); böylece fonlarınız hem klasik hem de kuantum saldırganlara karşı korunur.

QoreX, birlikte çalışan iki parçadan oluşur:

- **Tarayıcı eklentisi** — masaüstü cüzdanı; **Chrome, Firefox ve Safari (macOS) üzerinde yayında ve herkese açık**. Hem başlı başına bir cüzdandır (oluşturma/içe aktarma, QOR tutma ve gönderme) hem de herhangi bir web sitesinin QoreX'i keşfetmesini ve her isteği açık bir onaya dönüştürmesini sağlayan bağlayıcıdır. Bkz. [Tarayıcı Eklentisi](/qorex/browser-extension).
- **Mobil uygulama** (Android ve iOS) — eksiksiz cüzdan: oluşturma/geri yükleme, kuantuma dayanıklı QOR gönderme ve alma, harici ağlar, stake, portföy, kurtarma ve uygulama içi dApp tarayıcısı. Android için **Google Play üzerinde**; iOS için TestFlight üzerinde (aşağıdaki kullanılabilirlik bilgisine bakın).

## Platform kullanılabilirliği

| Özellik | Mobil uygulama (Android ve iOS) | Tarayıcı eklentisi |
|---|---|---|
| Cüzdan oluşturma / içe aktarma | ✅ | ✅ (bağımsız) |
| QOR gönderme ve alma (post-kuantum) | ✅ | ✅ (açılır pencereden) |
| Harici ağlar (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + tokenlar) | ✅ | ✅ (açılır pencereden gönderim) |
| Stake, Portföy, Q-Day Scanner, Kurtarma, Legacy | ✅ | — |
| dApp bağlantıları | ✅ (uygulama içi tarayıcı) | ✅ (herhangi bir web sitesi) |
| Hesap (@handle, ödeme talepleri) | ✅ | — |
| Çoklu cihaz eşleştirme | ✅ | — |
| Dashboard eşleştirmesi | ✅ | ✅ (bağlantı + önerilen transferler, v0.1.5) |

## QoreX'i farklı kılan nedir

- **Varsayılan olarak kuantuma dayanıklı** — Native hattındaki QOR transferleri daima ML-DSA-87 + secp256k1 hibrit imzası taşır. Klasik olan her şey (harici zincirler) açıkça etiketlenir, asla sessizce geçilmez.
- **Gerçek anlamda saklamasız** — anahtarlar cihaz üzerinde üretilir ve donanım destekli bir kasada (iOS'ta Secure Enclave, Android'de StrongBox) ya da şifreli bir kasada (eklenti) durur. Cihazınızdan asla çıkmazlar.
- **Veri toplama yok** — hiçbir QoreX uygulamasında analitik, izleme veya reklam yoktur. İsteğe bağlı hesap girişi bazı kolaylıklar ekler (bkz. [Hesap ve Dashboard](/qorex/account-and-dashboard)) ancak cüzdan hiçbir zaman buna bağımlı değildir.
- **Tek birleşik bakiye** — QOR bakiyeniz Native, EVM ve SVM hatları genelinde tek bir bakiyedir; QoreX bunu tek bir rakam olarak gösterir.
- **Birden fazla kurtarma yolu** — 24 kelimelik kurtarma ifadesi (her zaman), koruyucularla isteğe bağlı sosyal kurtarma ve 48 saatlik zaman kilidi, isteğe bağlı Legacy miras aktarımı ve pratik çoklu cihaz eşleştirmesi.

## Başlarken

- QoreX'te yeni misiniz? Cüzdanınızı oluşturmak veya geri yüklemek için [Başlarken](/qorex/getting-started) sayfasıyla başlayın.
- Ardından kuantuma dayanıklı QOR [Gönderme ve Alma](/qorex/send-and-receive) işlemlerini öğrenin.
- Güvenlik ağınızı [Güvenlik ve Kurtarma](/qorex/security-and-recovery) bölümünde kurun.
- Masaüstünde [Tarayıcı Eklentisi](/qorex/browser-extension) kurulumunu yapın.

:::note İndirme ve kullanılabilirlik
- **Tarayıcı eklentisi** — yayında ve herkese açık: [Chrome Web Store, Firefox Add-ons veya Mac App Store (Safari)](/qorex/browser-extension#install) üzerinden kurun.
- **Android uygulaması** — Google Play üzerinde mevcut: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS uygulaması** — **TestFlight** aracılığıyla test için mevcut: https://testflight.apple.com/join/Xa9D7vgR — App Store sürümü hâlâ inceleme aşamasında.

QoreX'i yalnızca resmî mağaza sayfalarından kurun.
:::
