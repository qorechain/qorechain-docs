---
slug: /qorex/overview
title: QoreX Cüzdanı
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QoreX Cüzdanı

**QoreX**, kuantum güvenli Katman 1 olan **QoreChain** için resmi **saklama gerektirmeyen (non-custodial)** cüzdandır (ana ağ `qorechain-vladi`). Özel anahtarlarınız **yalnızca cihazınızda** oluşturulur ve saklanır — QoreChain Association hiçbir zaman fonlarınıza erişemez ve uygulamalar **hiçbir veri** toplamaz. Native hattındaki her QOR transferi bir **hibrit post-kuantum imza** (ML-DSA-87, NIST FIPS-204, secp256k1 ile eşleştirilmiş) taşır; böylece fonlarınız hem klasik hem de kuantum saldırganlara karşı korunur.

QoreX, birlikte çalışan iki bölümden oluşur:

- **Mobil uygulama** (iOS ve Android) — tam cüzdan: oluşturma/geri yükleme, kuantum güvenli QOR gönderme ve alma, harici ağlar, staking, portföy, kurtarma ve uygulama içi dApp tarayıcısı.
- **Tarayıcı uzantısı** (Chrome ve Firefox, aynı kod tabanından Safari ile birlikte) — masaüstü için dApp bağlayıcısı: web sitelerinin cüzdanınızı keşfetmesini sağlar ve her isteği açık bir onaya dönüştürür.

## Platform kullanılabilirliği

| Yetenek | iOS/Android uygulaması | Chrome/Firefox uzantısı |
|---|---|---|
| Cüzdan oluşturma / geri yükleme / bağlama | ✅ | — (uygulama ile eşleşir) |
| QOR gönderme ve alma (post-kuantum) | ✅ | dApp imzalama yoluyla |
| Harici ağlar (ETH / BNB / POL / ARB / SOL + tokenlar) | ✅ | ✅ (açılır pencereden gönderme) |
| Staking, Portföy, Q-Day Scanner, Kurtarma, Miras (Legacy) | ✅ | — |
| dApp bağlantıları | ✅ (uygulama içi tarayıcı) | ✅ (herhangi bir web sitesi) |
| Hesap (@handle, ödeme talepleri, Dashboard bağlantısı) | ✅ | — |

## QoreX neden farklı

- **Varsayılan olarak kuantum güvenli** — Native hattındaki QOR transferleri her zaman bir ML-DSA-87 + secp256k1 hibrit imzası taşır. Klasik olan her şey (harici zincirler) açıkça etiketlenir, asla sessizce geçmez.
- **Gerçekten saklama gerektirmez (non-custodial)** — anahtarlar cihaz üzerinde oluşturulur ve donanım destekli bir kasada (iOS'ta Secure Enclave, Android'de StrongBox) veya şifreli bir kasada (uzantı) tutulur. Cihazınızdan asla ayrılmazlar.
- **Veri toplama yok** — hiçbir QoreX uygulamasında analiz, takip veya reklam yoktur. İsteğe bağlı bir hesap girişi kolaylıklar ekler ([Hesap ve Dashboard](/qorex/account-and-dashboard) bölümüne bakın) ancak cüzdan asla buna bağımlı değildir.
- **Tek birleşik bakiye** — QOR'unuz Native, EVM ve SVM hatları boyunca tek bir bakiyedir; QoreX bunu tek bir rakam olarak gösterir.
- **Birden çok kurtarma yolu** — 24 kelimelik bir kurtarma ifadesi (her zaman), muhafızlarla (guardian) ve 48 saatlik bir zaman kilidiyle isteğe bağlı sosyal kurtarma, isteğe bağlı Legacy miras ve kullanışlı çok cihazlı bağlama.

## Başlarken

- QoreX'te yeni misiniz? Cüzdanınızı oluşturmak veya geri yüklemek için [Başlarken](/qorex/getting-started) ile başlayın.
- Ardından kuantum güvenli QOR [Gönderme ve Alma](/qorex/send-and-receive) işlemini öğrenin.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) bölümünde güvenlik ağınızı kurun.
- Masaüstünde [Tarayıcı Uzantısı](/qorex/browser-extension)'nı yükleyin.

:::note İndirme ve kullanılabilirlik
QoreX **1.0**, uygulama mağazalarında yayına alınıyor — iOS ve Android uygulamaları (App Store ve Google Play) ve tarayıcı uzantısı (Chrome Web Store, Firefox Add-ons ve bir Safari yapısı). Herhangi bir anda bazı hedefler hâlâ bir mağazanın inceleme sırasında olabilir. Güncel, resmi indirme bağlantılarını her zaman [qorechain.io](https://qorechain.io) üzerinde bulun ve QoreX'i yalnızca resmi bir mağaza listesinden yükleyin.
:::
