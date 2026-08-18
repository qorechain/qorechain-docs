---
slug: /qorex/overview
title: QoreX Cüzdanı
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QoreX Cüzdanı

**QoreX**, kuantuma dayanıklı Katman 1 olan **QoreChain** (ana ağ `qorechain-vladi`) için resmi **saklama gerektirmeyen (non-custodial)** cüzdandır. Özel anahtarlarınız **yalnızca cihazınızda** oluşturulur ve saklanır — QoreChain Association hiçbir zaman fonlarınıza erişemez ve uygulamalar **hiçbir veri** toplamaz. Native hattındaki her QOR transferi bir **hibrit post-kuantum imza** (ML-DSA-87, NIST FIPS-204, secp256k1 ile eşleştirilmiş) taşır, böylece fonlarınız hem klasik hem de kuantum saldırganlara karşı korunur.

QoreX, birlikte çalışan iki parçadan oluşur:

- **Tarayıcı eklentisi** — masaüstü cüzdanı, **Chrome, Firefox ve Safari (macOS) üzerinde canlı ve herkese açık**. Bağımsız bir cüzdandır (oluştur/içe aktar, QOR tut ve gönder) ve herhangi bir web sitesinin QoreX'i keşfetmesini ve her isteği açık bir onaya dönüştürmesini sağlayan bağlayıcıdır. Bkz. [Tarayıcı Eklentisi](/qorex/browser-extension).
- **Mobil uygulama** (Android & iOS) — tam cüzdan: oluştur/geri yükle, kuantuma dayanıklı QOR gönder ve al, harici ağlar, staking, portföy, kurtarma ve uygulama içi dApp tarayıcısı. Şu anda herkese açık testte (aşağıdaki kullanılabilirliğe bakın).

## Platform kullanılabilirliği

| Yetenek | Mobil uygulama (Android & iOS) | Tarayıcı eklentisi |
|---|---|---|
| Cüzdan oluştur / içe aktar | ✅ | ✅ (bağımsız) |
| QOR gönder ve al (post-kuantum) | ✅ | ✅ (açılır pencereden) |
| Harici ağlar (Ethereum, BNB Chain, Polygon, Arbitrum, Solana, Cosmos Hub, Osmosis, Celestia + tokenlar) | ✅ | ✅ (açılır pencereden gönderim) |
| Staking, Portföy, Q-Day Tarayıcı, Kurtarma, Miras | ✅ | — |
| dApp bağlantıları | ✅ (uygulama içi tarayıcı) | ✅ (herhangi bir web sitesi) |
| Hesap (@handle, ödeme talepleri) | ✅ | — |
| Çoklu cihaz bağlama | ✅ | — |
| Dashboard eşleştirme | ✅ | ✅ (bağlantı + önerilen transferler, v0.1.5) |

## QoreX'i farklı kılan nedir

- **Varsayılan olarak kuantuma dayanıklı** — Native hattındaki QOR transferleri her zaman bir ML-DSA-87 + secp256k1 hibrit imza taşır. Klasik olan her şey (harici zincirler) açıkça etiketlenir, asla sessizce geçmez.
- **Gerçekten saklama gerektirmeyen** — anahtarlar cihaz üzerinde oluşturulur ve donanım destekli bir kasada (iOS'ta Secure Enclave, Android'de StrongBox) veya şifreli bir kasada (eklenti) tutulur. Asla cihazınızdan ayrılmazlar.
- **Veri toplama yok** — hiçbir QoreX uygulamasında analitik, izleme veya reklam yoktur. İsteğe bağlı bir hesap oturumu bazı kolaylıklar ekler (bkz. [Hesap & Dashboard](/qorex/account-and-dashboard)) ancak cüzdan hiçbir zaman buna bağımlı değildir.
- **Tek birleşik bakiye** — QOR'unuz Native, EVM ve SVM hatları boyunca tek bir bakiyedir; QoreX bunu tek bir rakam olarak gösterir.
- **Birden fazla kurtarma yolu** — 24 kelimelik bir kurtarma cümlesi (her zaman), koruyucularla isteğe bağlı sosyal kurtarma ve 48 saatlik bir zaman kilidi, isteğe bağlı Miras devri ve pratik çoklu cihaz bağlama.

## Başlarken

- QoreX'te yeni misiniz? Cüzdanınızı oluşturmak veya geri yüklemek için [Başlarken](/qorex/getting-started) ile başlayın.
- Ardından kuantuma dayanıklı QOR'u [Gönder & Al](/qorex/send-and-receive) öğrenin.
- Güvenlik ağınızı [Güvenlik & Kurtarma](/qorex/security-and-recovery) bölümünde kurun.
- Masaüstünde, [Tarayıcı Eklentisi](/qorex/browser-extension)'ni kurun.

:::note İndirme & kullanılabilirlik
- **Tarayıcı eklentisi** — canlı ve herkese açık: [Chrome Web Store, Firefox Add-ons veya Mac App Store (Safari)](/qorex/browser-extension#install) üzerinden kurun.
- **Android uygulaması** — Google Play üzerinde **herkese açık test** için mevcut.
- **iOS uygulaması** — denemek isterseniz **TestFlight** aracılığıyla test için mevcut.

Güncel ve resmi bağlantıları [qorechain.io](https://qorechain.io) adresinde bulabilirsiniz ve QoreX'i yalnızca resmi bir listeden kurun.
:::
