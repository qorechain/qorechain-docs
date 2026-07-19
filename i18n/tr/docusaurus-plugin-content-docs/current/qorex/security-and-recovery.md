---
slug: /qorex/security-and-recovery
title: Güvenlik ve Kurtarma
sidebar_label: Güvenlik ve Kurtarma
sidebar_position: 5
---

# Güvenlik ve Kurtarma

Cüzdanınızı korumak ve kurtarmakla ilgili her şey **Ayarlar → Güvenlik panosu** içinde yer alır. Ana Sayfa sekmesi ayrıca sosyal kurtarma kurulana kadar uyarı vermeye devam eden bir **Yedekleme sağlığı** kartı gösterir.

## Kuantum sonrası anahtar {#pqc-key}

Güvenlik panosu, kuantum sonrası anahtarınızın canlı zincir üstü durumunu gösterir: **"İlk transferinizle kaydolur"** → **"Zincir üstünde kayıtlı ✓"**. Algoritma **ML-DSA-87**'dir (deterministik, secp256k1 ile hibrit).

**Anahtar rotasyonu** — kuantum sonrası anahtarınızı döndürmek (zincir üstü bir `MsgRotatePQCKey` işlemi) yeni bir biyometrik seremoni gerektirir ve **asla otomatikleştirilmez**. Temel mekanizma için bkz. [Anahtar rotasyonu](/developer-guide/post-quantum-signing#key-rotation).

## Sosyal kurtarma {#social-recovery}

Sosyal kurtarma, güvenilir **koruyucuların** kurtarma ifadenizi hiç görmeden cüzdanınızı geri yüklemenize yardımcı olmasını sağlar.

- Tohumunuz, bir **eşik** şeması (t-of-n) olarak koruyuculara dağıtılan **ML-KEM ile mühürlenmiş paylara** bölünür: *n* koruyucunuzdan herhangi *t* tanesi kurtarmanıza yardımcı olabilir, ancak daha azı yardımcı olamaz.
- Her koruyucu bir kimlik bilgisi alır. Kurulum, aktarıcıya okunabilir hiçbir şey yazmaz — yalnızca opak, mühürlü zarflar.
- Bir kurtarma, eşik sayıda koruyucunun onaylamasını gerektirir, ardından **48 saatlik bir zaman kilidi** çalıştırır ve size bir **iptal uyarısı** gönderir, böylece kötü niyetli bir girişim durdurulabilir.

**Kurulum:** Güvenlik panosu → Sosyal kurtarma → koruyucularınızı ve eşiğinizi seçin. Yedekleme sağlığı uyarısı bu tamamlandığında temizlenir.

**Başka birinin kurtarmasını onaylama:** eğer birinin koruyucusuysanız, isteğini onaylamak için Ana Sayfa sekmesindeki **Kurtarmaya yardım et**'i kullanın.

## Legacy Protocol {#legacy}

**Legacy Protocol** kuantuma dayanıklı mirastır: koruyucularınızın üzerine katmanlanmış bir ölü adam anahtarı, böylece ulaşılamaz hale gelirseniz varlıklarınız seçtiğiniz yararlanıcılara geçebilir. İsteğe bağlıdır ve Güvenlik panosundan yapılandırılır.

## Yeni bir cihaz bağlama {#link-device}

Cüzdanınızı **sunucu olmadan ve 24 kelimeyi yazmadan** ikinci bir telefona veya tablete taşıyın:

1. **Yeni cihaz** → giriş → **Başka bir cihazdan bağla**. Tek kullanımlık bir **10 karakterli kod** gösterir ve kamerayı açar.
2. **Eski cihaz** → Ayarlar → Güvenlik → **Yeni bir cihaz bağla** → o kodu yazın → biyometri ile onaylayın. Bir **QR kodu** görünür (tohumunuz koddan türetilen bir anahtarla mühürlenmiştir: scrypt N=2¹⁷ → AES-256-GCM).
3. **Yeni cihaz** QR kodunu tarar → yerel olarak şifresini çözer → aynı cüzdan, aynı adresler.

**Neden güvenli:** kod ve QR asla aynı ekranda görünmez. Tek başına QR'nin bir fotoğrafı, belleğe dayanıklı bir anahtar türetme fonksiyonunun arkasındaki şifreli metindir ve her iki eser de tek kullanımlıktır ve ekranlarla birlikte kaybolur. Yanlış bir kod net bir hata verir — sadece tekrar deneyin.

:::note
Cihaz bağlama bir **kolaylıktır**, bir kurtarma yöntemi değildir. 24 kelimelik ifadeniz ve sosyal kurtarma gerçek güvenlik ağlarınızdır.
:::

## Bağlı dApp'ler {#connected-dapps}

dApp bağlantıları **köken başına** ve **oturum kapsamlıdır**: uygulama içi dApp tarayıcısını kapatmak her bağlantıyı iptal eder. Aktif bağlantıları Güvenlik panosunda gözden geçirebilir ve bağlantısını kesebilirsiniz.

## Bağlı imzalayıcılar ve harcama limitleri {#linked-signers}

Harici anahtarları (Phantom / MetaMask) [Dashboard](/qorex/account-and-dashboard#dashboard) üzerinden bağladığınızda, her biri yalnızca arayüzde değil, **zincir üstünde** uygulanan **kapsamlı izinler** ve bir **SpendingRule** alır. Anahtar yönetimi asla bağlı bir anahtara devredilemez. Zincir üstü model için bkz. [Bağlı Cüzdan Kimlik Doğrulayıcıları](/developer-guide/account-abstraction#authenticators). Pano her zaman güncel zincir üstü gerçeği gösterir.

## Q-Day Scanner {#q-day-scanner}

**Q-Day Scanner**, herhangi bir adres girmenize — sizin veya başkasının — ve bir kuantum maruziyet raporu almanıza olanak tanır: hangi fonların yalnızca klasik anahtarlar üzerinde bulunduğu ve hangilerinin zaten kuantum sonrası korumalı olduğu. Ana Sayfa sekmesindeki hızlı düğmelerden erişin.

## Güvenlik modeli, kısaca

1. **Saklama içermeyen (non-custodial)** — anahtarlar cihaz üzerinde üretilir, donanım destekli kasalarda (mobil) veya şifreli bir kasada (uzantı) bulunur ve asla ayrılmaz.
2. **Rıza olmadan hiçbir şey olmaz** — her bağlantı köken başınadır, her imza ayrı ayrı onaylanır (mobilde biyometrik) ve yükler imzalanmadan önce her zaman çözülür.
3. **Varsayılan olarak kuantuma dayanıklı** — Native şeridi QOR transferleri her zaman ML-DSA-87 + secp256k1 taşır; klasik olan her şey etiketlenir, asla sessiz kalmaz.
4. **Veri toplama yok** — analitik, izleme veya reklam yok. İsteğe bağlı hesap oturum açma [QoreChain gizlilik politikası](https://qorechain.io/privacy) kapsamındadır.
5. **Kurtarma yolları** — 24 kelimelik ifade (her zaman), koruyucularla sosyal kurtarma + 48 saatlik zaman kilidi (isteğe bağlı), Legacy mirası (isteğe bağlı), cihaz bağlama (kolaylık).
