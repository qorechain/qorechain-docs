---
slug: /qorex/overview
title: QoreX Cüzdan
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QoreX Cüzdan

**QoreX**, kuantuma dayanıklı Layer 1 olan **QoreChain** ağının (ana ağ `qorechain-vladi`) resmî **saklamasız (non-custodial)** cüzdanıdır. Özel anahtarlarınız **yalnızca kendi cihazınızda** üretilir ve saklanır — QoreChain Association fonlarınıza asla erişemez ve uygulamalar **hiçbir veri** toplamaz. Native hattındaki her QOR transferi **hibrit post-kuantum imza** taşır (ML-DSA-87, NIST FIPS-204, secp256k1 ile eşleştirilmiş); böylece fonlarınız hem klasik hem de kuantum saldırganlara karşı korunur.

QoreX, birlikte çalışan iki parçadan oluşur:

- **Tarayıcı eklentisi** — masaüstü cüzdanı; **Chrome, Firefox ve Safari (macOS) üzerinde yayında ve herkese açık**. Hem başlı başına bir cüzdandır (oluşturma/içe aktarma, QOR tutma ve gönderme) hem de herhangi bir web sitesinin QoreX'i keşfetmesini ve her isteği açık bir onaya dönüştürmesini sağlayan bağlayıcıdır. Bkz. [Tarayıcı Eklentisi](/qorex/browser-extension).
- **Mobil uygulama** (Android ve iOS) — eksiksiz cüzdan: oluşturma/geri yükleme, kuantuma dayanıklı QOR gönderme ve alma, harici ağlar, stake, portföy, kurtarma ve uygulama içi dApp tarayıcısı. Android için **Google Play üzerinde**, iOS için **App Store üzerinde** yayındadır (aşağıdaki kullanılabilirlik bilgisine bakın).

## Platform kullanılabilirliği {#platform-availability}

| Özellik | Mobil uygulama (Android ve iOS) | Tarayıcı eklentisi |
|---|---|---|
| Cüzdan oluşturma / içe aktarma | ✅ | ✅ (bağımsız, tek hesap) |
| Tek kurtarma ifadesinden birden fazla hesap | ✅ (20'ye kadar) | — (tek hesap) |
| QOR gönderme ve alma (post-kuantum) | ✅ | ✅ (açılır pencereden, Alma QR dahil) |
| @handle ile ödeme yapma / @handle talep etme | ✅ | ✅ |
| Harici ağlar (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokenlar) | ✅ | ✅ (açılır pencereden gönderim) |
| Arayüz dili (10 dil) | ✅ (telefonu takip eder) | ✅ (tarayıcıyı takip eder) |
| Stake, Portföy, Q-Day Scanner, Kurtarma, Legacy | ✅ | — |
| dApp bağlantıları | ✅ (uygulama içi tarayıcı) | ✅ (herhangi bir web sitesi) |
| Hesap girişi ve ödeme talepleri | ✅ | — |
| Çoklu cihaz eşleştirme | ✅ | — |
| Dashboard eşleştirmesi | ✅ | ✅ (bağlantı + önerilen transferler) |

## QoreX'i farklı kılan nedir

- **Varsayılan olarak kuantuma dayanıklı** — Native hattındaki QOR transferleri daima ML-DSA-87 + secp256k1 hibrit imzası taşır. Klasik olan her şey (harici zincirler) açıkça etiketlenir, asla sessizce geçilmez.
- **Gerçek anlamda saklamasız** — anahtarlar cihaz üzerinde üretilir ve donanım destekli bir kasada (iOS'ta Secure Enclave, Android'de StrongBox) ya da şifreli bir kasada (eklenti) saklanır. Cihazınızdan asla çıkmazlar.
- **Veri toplama yok** — hiçbir QoreX uygulamasında analitik, izleme veya reklam yoktur. İsteğe bağlı hesap girişi bazı kolaylıklar ekler (bkz. [Hesap ve Dashboard](/qorex/account-and-dashboard)) ancak cüzdan hiçbir zaman buna bağımlı değildir.
- **Tek birleşik bakiye** — QOR bakiyeniz Native, EVM ve SVM hatları genelinde tek bir bakiyedir; QoreX bunu tek bir rakam olarak gösterir.
- **Birden fazla kurtarma yolu** — 24 kelimelik kurtarma ifadesi (her zaman), koruyucularla isteğe bağlı sosyal kurtarma ve 48 saatlik zaman kilidi, isteğe bağlı Legacy miras aktarımı ve pratik çoklu cihaz eşleştirmesi.

## Başlarken

- QoreX'te yeni misiniz? Cüzdanınızı oluşturmak veya geri yüklemek için [Başlarken](/qorex/getting-started) sayfasıyla başlayın.
- Ardından kuantuma dayanıklı QOR [Gönderme ve Alma](/qorex/send-and-receive) işlemlerini öğrenin.
- Güvenlik ağınızı [Güvenlik ve Kurtarma](/qorex/security-and-recovery) bölümünde kurun.
- Masaüstünde [Tarayıcı Eklentisi](/qorex/browser-extension) kurulumunu yapın.

:::note İndirme ve kullanılabilirlik
- **Tarayıcı eklentisi** — yayında ve herkese açık: [Chrome Web Store, Firefox Add-ons veya Mac App Store (Safari)](/qorex/browser-extension#install) üzerinden kurun. Hangi sürümün nerede yayında olduğunu görmek için [buraya bakın](/qorex/browser-extension#versions) — yeni özellikler bazı tarayıcılarda hâlâ yayılıyor olabilir.
- **Android uygulaması** — Google Play üzerinde canlı ve yayında: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS uygulaması** — **App Store** üzerinde yayında: https://apps.apple.com/us/app/qorex-wallet/id6791256626.

Mağaza incelemesi kendi takvimine göre ilerler, bu yüzden en yeni sürüm bazen bir mağazaya diğerinden önce ulaşır — güncel tabloyu görmek için aşağıdaki [hangi sürümün nerede yayında olduğuna](#platform-availability) bakın. Her zaman resmî bir mağaza listesinden kurun.
:::

:::note Hangi sürüm nerede yayında
Mağaza onayları farklı zamanlarda gelir, bu yüzden aşağıdaki sürüm platforma göre kısa süreliğine farklılık gösterebilir:

| Platform | Yayındaki sürüm |
|---|---|
| Android | 1.0.3 |
| iOS | 1.0 (bir güncelleme incelemede) |
| Firefox | 0.1.9 |
| Chrome | 0.1.5 (0.1.9 incelemede) |
| Safari (macOS) | 1.1, 0.1.5 eklenti sürümünü taşıyor (bir güncelleme incelemede) |

Bu sayfa QoreX'in güncel özellik setini açıklar — hâlâ eski bir sürüm sunan bir mağaza, sizin herhangi bir işlem yapmanıza gerek kalmadan otomatik olarak güncellenecektir.
:::
