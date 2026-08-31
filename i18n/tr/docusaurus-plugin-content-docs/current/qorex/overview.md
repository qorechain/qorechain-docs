---
slug: /qorex/overview
title: QoreX Cüzdanı
sidebar_label: Genel Bakış
sidebar_position: 1
---

# QoreX Cüzdanı

**QoreX**, kuantum güvenli Layer 1 **QoreChain**'in (mainnet `qorechain-vladi`) resmi **saklamasız (non-custodial)** cüzdanıdır. Özel anahtarlarınız **yalnızca cihazınızda** üretilir ve saklanır — QoreChain Association fonlarınıza asla erişemez ve uygulamalar **hiçbir veri toplamaz**. Native lane üzerindeki her QOR transferi bir **hibrit post-kuantum imza** (ML-DSA-87, NIST FIPS-204, secp256k1 ile eşleştirilmiş) taşır, böylece fonlarınız hem klasik hem de kuantum saldırganlara karşı korunur.

QoreX, birlikte çalışan iki parçadan oluşur:

- **Tarayıcı eklentisi** — masaüstü cüzdanı, **Chrome, Firefox ve Safari'de (macOS) canlı ve yayında**. Hem bağımsız bir cüzdandır (oluştur/içe aktar, QOR tut ve gönder) hem de herhangi bir web sitesinin QoreX'i keşfetmesini ve her isteği açık bir onaya dönüştürmesini sağlayan bağlayıcıdır. Bkz. [Tarayıcı Eklentisi](/qorex/browser-extension).
- **Mobil uygulama** (Android ve iOS) — tam cüzdan: oluştur/geri yükle, kuantum güvenli QOR gönder ve al, dış ağlar, staking, portföy, kurtarma ve uygulama içi bir dApp tarayıcısı. Android için **Google Play'de**, iOS için **App Store'da** (aşağıdaki kullanılabilirliğe bakın).

## Platform kullanılabilirliği {#platform-availability}

| Yetenek | Mobil uygulama (Android ve iOS) | Tarayıcı eklentisi |
|---|---|---|
| Cüzdan oluştur / içe aktar | ✅ | ✅ (bağımsız) |
| Tek kurtarma ifadesinden birden çok hesap | ✅ (20'ye kadar) | ✅ *(0.2.2'den itibaren)* |
| QOR gönder ve al (post-kuantum) | ✅ | ✅ (popup'tan, Al QR dahil) |
| Bir @handle öde / talep et | ✅ | ✅ |
| Staking (delege et, delegeyi kaldır, talep et) | ✅ | ✅ *(0.2.2'den itibaren — kendi Stake ekranı, ayrıca Dashboard'ın gönderdiği bir staking isteğini onaylayabilir)* |
| Dış ağlar (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokenlar) | ✅ | ✅ (popup'tan gönder) |
| Arayüz dili (10 dil) | ✅ (telefonu izler) | ✅ (tarayıcıyı izler) |
| Portföy, Q-Day Tarayıcı, Sosyal Kurtarma, Miras | ✅ | — |
| dApp bağlantıları | ✅ (uygulama içi tarayıcı) | ✅ (herhangi bir web sitesi) |
| Hesap girişi ve ödeme istekleri | ✅ | — |
| Çoklu cihaz bağlama | ✅ | — |
| Dashboard eşleştirme | ✅ | ✅ (bağlantı + önerilen transferler, staking dahil) |

:::note Eklenti staking için 0.2.2 veya üzeri gerekir
Eklentiniz 0.2.2'den eskiyse, yakın zamanda bir sürümde olsanız bile Dashboard'ın staking düğmesi eklentinin güncellenmesi gerektiğini bildirebilir — Dashboard'ın staking isteğini eklentiye bağlayan düzeltme 0.2.2 ile yayınlandı. [Hangi sürümün nerede canlı olduğunu](/qorex/browser-extension#versions) kontrol edin; mağazanız henüz 0.2.2'yi yayınlamadıysa, staking onayı yayınlanır yayınlanmaz sizin tarafınızdan hiçbir işlem gerekmeden çalışmaya başlayacaktır.
:::

## QoreX neden farklı

- **Varsayılan olarak kuantum güvenli** — Native lane QOR transferleri her zaman bir ML-DSA-87 + secp256k1 hibrit imza taşır. Klasik olan her şey (dış zincirler) açıkça etiketlenir, asla sessiz geçilmez.
- **Gerçek anlamda saklamasız** — anahtarlar cihaz üzerinde üretilir ve donanım destekli bir kasada (iOS'ta Secure Enclave, Android'de StrongBox) veya şifreli bir kasada (eklenti) yaşar. Cihazınızdan asla çıkmazlar.
- **Veri toplama yok** — hiçbir QoreX uygulamasında analitik, izleme veya reklam yoktur. İsteğe bağlı bir hesap girişi kolaylıklar ekler (bkz. [Hesap ve Dashboard](/qorex/account-and-dashboard)) ancak cüzdan asla buna bağımlı değildir.
- **Tek bir birleşik bakiye** — QOR'unuz Native, EVM ve SVM lane'leri arasında tek bir bakiyedir; QoreX bunu tek bir rakam olarak gösterir.
- **Birden çok kurtarma yolu** — 24 kelimelik bir kurtarma ifadesi (her zaman), koruyucularla isteğe bağlı sosyal kurtarma ve 48 saatlik bir zaman kilidi, isteğe bağlı Miras devri ve pratik çoklu cihaz bağlama.

## Başlarken

- QoreX'e yeni misiniz? Cüzdanınızı oluşturmak veya geri yüklemek için [Başlarken](/qorex/getting-started) ile başlayın.
- Ardından kuantum güvenli QOR'u [Gönder ve Al](/qorex/send-and-receive)'ı öğrenin.
- Güvenlik ağınızı [Güvenlik ve Kurtarma](/qorex/security-and-recovery)'da kurun.
- Masaüstünde [Tarayıcı Eklentisi](/qorex/browser-extension)'ni kurun.

:::note İndirme ve kullanılabilirlik
- **Tarayıcı eklentisi** — canlı ve yayında: [Chrome Web Store, Firefox Add-ons veya Mac App Store'dan (Safari)](/qorex/browser-extension#install) kurun. [Hangi sürümün nerede canlı olduğuna](/qorex/browser-extension#versions) bakın — daha yeni özellikler bazı tarayıcılara hâlâ yayılıyor olabilir.
- **Android uygulaması** — Google Play'de üretimde canlı: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS uygulaması** — **App Store**'da canlı: https://apps.apple.com/us/app/qorex-wallet/id6791256626.

Mağaza incelemesi kendi takvimine göre çalışır, bu yüzden en yeni sürüm bazen bir mağazaya diğerinden önce ulaşır — tam güncel tabloyu görmek için aşağıdaki [hangi sürümün nerede canlı olduğuna](#platform-availability) bakın. Her zaman resmi bir mağaza listesinden kurun.
:::

:::note Hangi sürüm nerede canlı
Mağaza onayları farklı zamanlarda gerçekleşir, bu yüzden aşağıdaki sürüm platforma göre kısa süreliğine farklılık gösterebilir:

| Platform | Canlı sürüm |
|---|---|
| Android | 1.0.8 |
| iOS | 1.0.8 |
| Firefox | 0.2.6 |
| Safari (macOS) | 1.6, eklenti 0.2.6 ile birlikte |
| Chrome | Ağustos sonu itibarıyla uzun bir mağaza incelemesinde bekliyordu — buradaki bir sayıya güvenmek yerine güncel sürümü doğrudan [Chrome Web Store listesinden](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) kontrol edin |

1.0.8 / 0.2.6, 21 günlük unbonding beklemesi olmadan **stake edilmiş QOR'u validatörler arasında taşımayı** (redelege) ekledi — bkz. [Stake'i validatörler arasında taşı](/qorex/portfolio-and-staking#move-stake).

Bu sayfa QoreX'in mevcut özellik setini anlatır — hâlâ eski bir sürümü sunan bir mağaza, sizin tarafınızdan hiçbir işlem gerekmeden otomatik olarak yetişecektir.
:::
