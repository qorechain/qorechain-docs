---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QoreX Wallet

**QoreX**, kuantuma dayanıklı Layer 1 olan **QoreChain** için resmî **saklamasız (non-custodial)** cüzdandır (ana ağ `qorechain-vladi`). Özel anahtarlarınız **yalnızca cihazınızda** üretilir ve saklanır — QoreChain Association fonlarınıza asla erişemez ve uygulamalar **hiçbir veri** toplamaz. Native hattındaki her QOR transferi bir **hibrit post-kuantum imza** taşır (ML-DSA-87, NIST FIPS-204, secp256k1 ile eşleştirilmiş); böylece fonlarınız hem klasik hem de kuantum saldırganlara karşı korunur.

QoreX, birlikte çalışan iki parçadan oluşur:

- **Tarayıcı uzantısı** — masaüstü cüzdanı; **Chrome, Firefox ve Safari (macOS) üzerinde yayında ve herkese açık**. Hem başlı başına bir cüzdandır (oluşturma/içe aktarma, QOR tutma ve gönderme) hem de herhangi bir web sitesinin QoreX'i keşfetmesini ve her isteği açık bir onaya dönüştürmesini sağlayan bağlayıcıdır. Bkz. [Tarayıcı Uzantısı](/qorex/browser-extension).
- **Mobil uygulama** (Android ve iOS) — eksiksiz cüzdan: oluşturma/geri yükleme, kuantuma dayanıklı QOR gönderme ve alma, harici ağlar, staking, portföy, kurtarma ve uygulama içi dApp tarayıcısı. Android için **Google Play üzerinde**; iOS için TestFlight üzerinde (aşağıdaki kullanılabilirlik bilgisine bakın).

## Platform kullanılabilirliği

| Özellik | Mobil uygulama (Android ve iOS) | Tarayıcı uzantısı |
|---|---|---|
| Cüzdan oluşturma / içe aktarma | ✅ | ✅ (bağımsız) |
| QOR gönderme ve alma (post-kuantum) | ✅ | ✅ (açılır pencereden) |
| Harici ağlar (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + tokenlar) | ✅ | ✅ (açılır pencereden gönderim) |
| Staking, Portföy, Q-Day Scanner, Kurtarma, Legacy | ✅ | — |
| dApp bağlantıları | ✅ (uygulama içi tarayıcı) | ✅ (herhangi bir web sitesi) |
| Hesap (@handle, ödeme talepleri) | ✅ | — |
| Çoklu cihaz eşleme | ✅ | — |
| Dashboard eşleştirme | ✅ | ✅ (bağlantı + önerilen transferler, v0.1.5) |

## QoreX'i farklı kılan nedir

- **Varsayılan olarak kuantuma dayanıklı** — Native hattındaki QOR transferleri her zaman ML-DSA-87 + secp256k1 hibrit imza taşır. Klasik olan her şey (harici zincirler) açıkça etiketlenir, asla sessizce geçilmez.
- **Gerçekten saklamasız** — anahtarlar cihaz üzerinde üretilir ve donanım destekli bir kasada (iOS'ta Secure Enclave, Android'de StrongBox) ya da şifreli bir kasada (uzantı) saklanır. Cihazınızdan asla çıkmazlar.
- **Veri toplanmaz** — hiçbir QoreX uygulamasında analitik, izleme veya reklam yoktur. İsteğe bağlı bir hesap girişi bazı kolaylıklar sağlar (bkz. [Hesap ve Dashboard](/qorex/account-and-dashboard)) ancak cüzdan buna asla bağımlı değildir.
- **Tek birleşik bakiye** — QOR bakiyeniz Native, EVM ve SVM hatları boyunca tek bir bakiyedir; QoreX bunu tek bir rakam olarak gösterir.
- **Birden fazla kurtarma yolu** — 24 kelimelik bir kurtarma ifadesi (her zaman), koruyucularla isteğe bağlı sosyal kurtarma ve 48 saatlik zaman kilidi, isteğe bağlı Legacy miras aktarımı ve pratik çoklu cihaz eşleme.

## Başlarken

- QoreX'te yeni misiniz? Cüzdanınızı oluşturmak veya geri yüklemek için [Başlarken](/qorex/getting-started) ile başlayın.
- Ardından kuantuma dayanıklı QOR [Gönderme ve Alma](/qorex/send-and-receive) işlemlerini öğrenin.
- Güvenlik ağınızı [Güvenlik ve Kurtarma](/qorex/security-and-recovery) bölümünde kurun.
- Masaüstünde [Tarayıcı Uzantısı](/qorex/browser-extension) kurulumunu yapın.

:::note İndirme ve kullanılabilirlik
- **Tarayıcı uzantısı** — yayında ve herkese açık: [Chrome Web Store, Firefox Add-ons veya Mac App Store (Safari)](/qorex/browser-extension#install) üzerinden kurun.
- **Android uygulaması** — Google Play üzerinde mevcut: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS uygulaması** — denemek isterseniz **TestFlight** aracılığıyla test için mevcut; App Store sürümü hâlâ incelemede. Güncel davet bağlantısını [qorechain.io](https://qorechain.io) adresinde bulabilirsiniz.

QoreX'i yalnızca resmî bir mağaza listelemesinden kurun.
:::
