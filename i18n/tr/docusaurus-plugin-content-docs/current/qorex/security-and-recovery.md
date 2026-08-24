---
slug: /qorex/security-and-recovery
title: Güvenlik ve Kurtarma
sidebar_label: Güvenlik ve Kurtarma
sidebar_position: 5
---

# Güvenlik ve Kurtarma

Cüzdanınızı korumak ve kurtarmakla ilgili her şey **Ayarlar → Güvenlik panosu**'nda bulunur. Ana Sayfa sekmesi de, sosyal kurtarma kurulana kadar uyarmaya devam eden bir **Yedekleme sağlığı** kartı gösterir.

## Şimdi yedekleyin — kayıp bir cüzdanı sizin için kimse kurtaramaz {#back-up-now}

:::danger Cüzdanınızı fonlamadan önce bunu okuyun
QoreX **saklayıcısızdır (non-custodial)**: anahtarlarınız yalnızca kendi cihazınızda bulunur ve QoreChain Association'ın bunların bir kopyası, bir ana anahtarı ya da cüzdanınızı sıfırlama veya geri yükleme yolu yoktur. **"Şifremi unuttum" akışı, destek talebi ya da müşteri hizmetleri geçersiz kılması yoktur** — yedek olmadan anahtarlarınıza erişimi kaybederseniz, fonlar kalıcı ve geri döndürülemez şekilde kaybolur. Bu QoreX'e özgü bir kısıtlama değil, her saklayıcısız cüzdan için geçerlidir, ama açıkça belirtmekte fayda var.

**Aşağıdakilerden en az birini yapın — cüzdanınızı oluşturduktan hemen sonra, sonraya bırakmadan:**

1. **24 kelimelik kurtarma ifadenizi yazıya dökün** ve çevrimdışı, dayanıklı bir yerde saklayın (bir ekran görüntüsü değil, buluta senkronize bir not değil, kendinize gönderilen bir mesaj değil). Cüzdanınızı herhangi bir cihazda, herhangi bir zamanda geri yükleyebilecek tek şeydir.
2. Güvendiğiniz vasilerle **[sosyal kurtarma](#social-recovery)** kurun. Bu, ifadeyi kaybetseniz bile cüzdanınızı kurtarmanızı sağlar, ve hiçbir tek vasi tek başına fonlarınıza erişemez.

İkisini birden yapmak en güvenli seçenektir — ifade, cihaz değiştirdiğinizde veya uygulama kullanılamaz olduğunda sizi korur; vasiler ise ifadenin kendisini kaybettiğinizde sizi korur.

**Uygulamayı kaldırmak, anahtarlarınızı o cihazdan siler.** Mobil uygulamanın kasası ve tarayıcı eklentisinin kasası, yalnızca kendilerini oluşturan cihazda bulunur. Uygulamayı kaldırmak, telefonu sıfırlamak veya eklentiyi kaldırmak/temizlemek bu kopyayı siler — yedek ve bağlı cihaz olmadan, cüzdanınız QoreChain dahil kimse tarafından kurtarılamaz.
:::

## Kuantum-sonrası anahtar {#pqc-key}

Güvenlik panosu, kuantum-sonrası anahtarınızın canlı zincir-üstü durumunu gösterir: **"İlk transferinizle kaydolur"** → **"Zincir üstünde kayıtlı ✓"**. Algoritma **ML-DSA-87**'dir (deterministik, secp256k1 ile hibrit).

**Anahtar rotasyonu** — kuantum-sonrası anahtarınızı döndürmek (zincir üstünde bir `MsgRotatePQCKey` işlemi) yeni bir biyometrik seremoni gerektirir ve **asla otomatikleştirilmez**. Alttaki mekanizma için bkz. [Anahtar rotasyonu](/developer-guide/post-quantum-signing#key-rotation).

## Sosyal kurtarma {#social-recovery}

Sosyal kurtarma, güvenilir **vasilerin** kurtarma ifadenizi hiç görmeden cüzdanınızı geri yüklemenize yardımcı olmasını sağlar.

- Tohumunuz, vasilere bir **eşik (threshold)** şeması (t-of-n) olarak dağıtılan **ML-KEM ile mühürlenmiş paylara** bölünür: *n* vasinizden herhangi *t* tanesi kurtarmanıza yardımcı olabilir, ama daha azı olamaz.
- Her vasi bir kimlik bilgisi alır. Kurulum, aktarıcıya (relay) okunabilir hiçbir şey yazmaz — yalnızca opak, mühürlenmiş zarflar.
- Bir kurtarma, vasilerin eşik sayısının onayını gerektirir, ardından **48 saatlik bir zaman kilidi** çalışır ve size bir **iptal uyarısı** gönderilir, böylece kötü niyetli bir girişim durdurulabilir.

**Kurulum:** Güvenlik panosu → Sosyal kurtarma → vasilerinizi ve eşiğinizi seçin. Bu tamamlandığında Yedekleme sağlığı uyarısı temizlenir.

**Başkasının kurtarmasını onaylama:** birinin vasisiyseniz, isteğini onaylamak için Ana Sayfa sekmesindeki **Kurtarmaya yardım et**'i kullanın.

## Legacy Protocol {#legacy}

**Legacy Protocol**, kuantuma karşı güvenli bir miras çözümüdür: vasileriniz üzerine katmanlanmış bir ölü adam anahtarı (dead-man's switch), böylece ulaşılamaz hale gelirseniz varlıklarınız seçtiğiniz yararlanıcılara geçebilir. İsteğe bağlıdır ve Güvenlik panosundan yapılandırılır.

## Yeni bir cihaz bağlayın {#link-device}

Cüzdanınızı ikinci bir telefona veya tablete, **sunucu olmadan ve 24 kelimeyi yazmadan** taşıyın:

1. **Yeni cihaz** → katılım (onboarding) → **Başka bir cihazdan bağlan**. Tek seferlik bir **10 karakterlik kod** gösterir ve kamerayı açar.
2. **Eski cihaz** → Ayarlar → Güvenlik → **Yeni bir cihaz bağla** → bu kodu yazın → biyometri ile onaylayın. Bir **QR kodu** görünür (tohumunuz koddan türetilmiş bir anahtarla mühürlenir: scrypt N=2¹⁷ → AES-256-GCM).
3. **Yeni cihaz** QR'ı tarar → yerel olarak şifresini çözer → aynı cüzdan, aynı adresler.

**Neden güvenli:** kod ve QR asla aynı ekranda görünmez. QR'ın tek başına bir fotoğrafı, bellek-zor bir anahtar türetme fonksiyonunun arkasındaki şifreli metindir ve her iki eser de tek seferliktir ve ekranlarla birlikte kaybolur. Yanlış bir kod temiz bir hata verir — sadece tekrar deneyin.

:::note
Cihaz bağlama bir **kolaylıktır**, bir kurtarma yöntemi değildir. 24 kelimelik ifadeniz ve sosyal kurtarma gerçek güvenlik ağlarınızdır.
:::

## Bağlı dApp'ler {#connected-dapps}

dApp bağlantıları **köken başına (per-origin)** ve **oturum kapsamlıdır**: uygulama içi dApp tarayıcısını kapatmak her bağlantıyı iptal eder. Aktif bağlantıları Güvenlik panosunda inceleyebilir ve bağlantıyı kesebilirsiniz.

## Bağlı imzalayıcılar ve harcama limitleri {#linked-signers}

[Panodan](/qorex/account-and-dashboard#dashboard) harici anahtarlar (Phantom / MetaMask) bağladığınızda, her biri **kapsamlı izinler** ve yalnızca arayüzde değil **zincir üstünde** uygulanan bir **SpendingRule** alır. Anahtar yönetimi hiçbir zaman bağlı bir anahtara devredilemez. Zincir üstü model için bkz. [Bağlı Cüzdan Doğrulayıcıları](/developer-guide/account-abstraction#authenticators). Pano her zaman güncel zincir üstü gerçeği gösterir.

## Q-Day Tarayıcı {#q-day-scanner}

**Q-Day Tarayıcı**, herhangi bir adresi — sizinkini ya da başka birininkini — girmenize ve bir kuantum-maruziyet raporu almanıza olanak tanır: hangi fonların yalnızca klasik anahtarlar üzerinde bulunduğu ve hangilerinin zaten kuantum-sonrası korumalı olduğu. Ana Sayfa hızlı düğmelerinden ulaşın.

## Kısaca güvenlik modeli

1. **Saklayıcısız (Non-custodial)** — anahtarlar cihaz üzerinde üretilir, donanım destekli kasalarda (mobil) ya da şifreli bir kasada (eklenti) yaşar ve asla dışarı çıkmaz.
2. **Onay olmadan hiçbir şey** — her bağlantı köken başınadır, her imza tek tek onaylanır (mobilde biyometrik ile) ve yükler imzalanmadan önce her zaman çözülüp gösterilir.
3. **Varsayılan olarak kuantuma karşı güvenli** — Native-lane QOR transferleri her zaman ML-DSA-87 + secp256k1 taşır; klasik olan her şey etiketlenir, asla sessiz geçmez.
4. **Veri toplama yok** — analitik, izleme veya reklam yok. İsteğe bağlı hesap girişi [QoreChain gizlilik politikası](https://qorechain.io/privacy) kapsamındadır.
5. **Kurtarma yolları** — 24 kelimelik ifade (her zaman), vasilerle sosyal kurtarma + 48 saatlik zaman kilidi (isteğe bağlı), Legacy mirası (isteğe bağlı), cihaz bağlama (kolaylık).
