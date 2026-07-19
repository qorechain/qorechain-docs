---
slug: /qorex/overview
title: QoreX Cüzdanı
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QoreX Cüzdanı

**QoreX**, kuantuma dayanıklı Layer 1 olan **QoreChain** (ana ağ `qorechain-vladi`) için resmî **saklamasız (non-custodial)** cüzdandır. Özel anahtarlarınız **yalnızca kendi cihazınızda** üretilir ve saklanır — QoreChain Association fonlarınıza asla erişemez ve uygulamalar **hiçbir veri** toplamaz. Native lane üzerindeki her QOR transferi bir **hibrit kuantum sonrası imza** (ML-DSA-87, NIST FIPS-204, secp256k1 ile eşleştirilmiş) taşır; böylece fonlarınız hem klasik hem de kuantum saldırganlara karşı korunur.

QoreX, birlikte çalışan iki parçadan oluşur:

- **Mobil uygulama** (iOS ve Android) — tam cüzdan: oluşturma/geri yükleme, kuantuma dayanıklı QOR gönderme ve alma, harici ağlar, staking, portföy, kurtarma ve uygulama içi bir dApp tarayıcısı.
- **Tarayıcı uzantısı** (Chrome ve Firefox; Safari beklemede) — masaüstü için dApp bağlayıcısı: web sitelerinin cüzdanınızı keşfetmesini sağlar ve her isteği açık bir onaya dönüştürür.

## Platform kullanılabilirliği

| Yetenek | iOS/Android uygulaması | Chrome/Firefox uzantısı |
|---|---|---|
| Cüzdan oluşturma / geri yükleme / bağlama | ✅ | — (uygulama ile eşleşir) |
| QOR gönderme ve alma (kuantum sonrası) | ✅ | dApp imzalama yoluyla |
| Harici ağlar (ETH / BNB / POL / ARB / SOL + tokenlar) | ✅ | ✅ (açılır pencereden gönderim) |
| Staking, Portföy, Q-Day Scanner, Kurtarma, Legacy | ✅ | — |
| dApp bağlantıları | ✅ (uygulama içi tarayıcı) | ✅ (herhangi bir web sitesi) |
| Hesap (@handle, ödeme talepleri, Dashboard bağlantısı) | ✅ | — |

## QoreX'i farklı kılan nedir

- **Varsayılan olarak kuantuma dayanıklı** — Native lane QOR transferleri her zaman bir ML-DSA-87 + secp256k1 hibrit imzası taşır. Klasik olan her şey (harici zincirler) açıkça etiketlenir, asla sessizce geçmez.
- **Gerçekten saklamasız** — anahtarlar cihaz üzerinde üretilir ve donanım destekli bir kasada (iOS'ta Secure Enclave, Android'de StrongBox) ya da şifreli bir kasada (uzantı) tutulur. Cihazınızdan asla ayrılmazlar.
- **Veri toplama yok** — hiçbir QoreX uygulamasında analitik, izleme veya reklam yoktur. İsteğe bağlı bir hesap girişi bazı kolaylıklar ekler (bkz. [Hesap ve Dashboard](/qorex/account-and-dashboard)) ancak cüzdan buna asla bağımlı değildir.
- **Tek birleşik bakiye** — QOR'unuz Native, EVM ve SVM lane'leri arasında tek bir bakiyedir; QoreX bunu tek bir rakam olarak gösterir.
- **Birden fazla kurtarma yolu** — 24 kelimelik bir kurtarma ifadesi (her zaman), koruyucular (guardians) ve 48 saatlik zaman kilidi ile isteğe bağlı sosyal kurtarma, isteğe bağlı Legacy mirası ve pratik çoklu cihaz bağlama.

## Başlarken

- QoreX'te yeni misiniz? Cüzdanınızı oluşturmak veya geri yüklemek için [Başlarken](/qorex/getting-started) ile başlayın.
- Ardından kuantuma dayanıklı QOR [Gönderme ve Alma](/qorex/send-and-receive) işlemlerini öğrenin.
- Güvenlik ağınızı [Güvenlik ve Kurtarma](/qorex/security-and-recovery) bölümünde kurun.
- Masaüstünde [Tarayıcı Uzantısını](/qorex/browser-extension) kurun.

:::note İndirme
iOS ve Android için QoreX, App Store ve Google Play üzerinde; tarayıcı uzantısı ise Chrome Web Store ve Firefox Add-ons üzerinde yayınlanmıştır. Güncel indirme bağlantılarını [qorechain.io](https://qorechain.io) adresinde bulabilirsiniz. QoreX'i yalnızca resmî bir mağaza listesinden kurun.
:::
