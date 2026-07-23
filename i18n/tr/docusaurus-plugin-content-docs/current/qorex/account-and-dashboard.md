---
slug: /qorex/account-and-dashboard
title: Hesap ve Dashboard
sidebar_label: Hesap ve Dashboard
sidebar_position: 6
---

# Hesap ve Dashboard

QoreX **tamamen hesapsız çalışır** — anahtarlarınız hiçbir zaman bir hesaba bağlı değildir. Oturum açmak yalnızca @handle'lar, ödeme talepleri ve Dashboard eşleştirmesi gibi kolaylıklar ekler.

## Oturum açma {#sign-in}

Ana sekmedeki **Oturum aç** üzerinden veya ilk kurulum sırasında oturum açabilirsiniz. Yöntemler:

- **E-posta kodu** — e-postanızı girin ve tek kullanımlık bir kod alın. Bu oturum açmadan sonra QoreX, gelecekte anında oturum açmak için bir **passkey** eklemeyi önerir (Face ID / Touch ID / PIN). Bu bir *hesap* passkey'idir — cüzdan anahtarlarınıza asla dokunmaz.
- **Passkey** — daha önce bir tane kaydettiyseniz.
- **Google ile devam et** — sistem kimlik doğrulama sayfası üzerinden tek bir yerel sıçrama (uygulama asla bir tarayıcıya çıkmaz).
- **QORECHAIN Dashboard ile devam et** — mevcut bir Dashboard hesabıyla (Google girişi dahil) oturum açın ve profilinizi içe aktarın.

:::note
Passkey önerisi yalnızca **e-posta kodu** ile oturum açtıktan sonra görünür. Bir kimlik sağlayıcı (Google veya Dashboard) ile oturum açtığınızda, o sağlayıcı kendi kimlik doğrulamasını yönetir, bu nedenle bu hesaplara bir passkey eklenemez.
:::

## @handle {#handle}

Adresinize **çift imza** ile bağlı benzersiz bir ad talep edin (örneğin `@liviu`) (bir registry ed25519 imzası + kendi secp256k1 imzanız). Ardından herkes @handle'ınıza gönderim yapabilir. Çözümleme **doğrula-sonra-sabitle** (ilk kullanımda güven) yöntemiyle yapılır, bu nedenle bir handle'ın anahtarı sessizce değiştirilirse QoreX bunu işaretler.

Handle registry'si geçici olarak erişilemezse, ekran **"Handle'lar yakında geliyor"** durumuna geriler ve geri kalan her şey çalışmaya devam eder; registry döndüğünde handle'lar otomatik olarak yeniden etkinleşir.

## Bağlı hesap {#linked-account}

**Ayarlar → Bağlı hesap**, QoreX cüzdanınızı ve Dashboard hesabınızı her iki yönde de birbirine bağlar:

1. Dashboard'un gösterdiği 8 karakterli kodu girin, **veya** QoreX'te bir tane oluşturun (10 dakika geçerli) ve bunu Dashboard'a yazın.
2. Bağlandıktan sonra @handle'ınız ve bağlı adresleriniz her ikisinde de görünür.
3. İstediğiniz zaman bağlantıyı kaldırın.

**Dashboard ile devam et** *aracılığıyla* oturum açmak ikisini örtük olarak bağlar — ekstra yapılacak bir şey yoktur.

## Dashboard entegrasyonu {#dashboard}

Dashboard bağlıyken:

- Dashboard'daki **Connect with QoreX**, bir `qorex://connect` derin bağlantısı ve imzalı bir sahiplik kanıtı aracılığıyla onu cüzdanınıza eşleştirir.
- **Dashboard'da başlatılan transferler**, QoreX'e `qorex://tx` talepleri olarak gelir. Bunlar çözümlenir, size tam olarak gösterilir ve yalnızca biyometrik onaydan sonra **yalnızca uygulamada** — ve yalnızca uygulamanın kendi türetilmiş adresinden imzalanır.
- Bir Connect veya transfer talebi siz **oturum açmamışken** gelirse, QoreX, çıkmaza girmeden devam edebilmeniz için satır içi bir **"Dashboard'a oturum aç"** adımı sunar.
- **Adresleriniz (Ayarlar)** — bu cüzdandan türetilen her hesabı, ayrıca diğer cüzdanlardan bağladığınız **salt okunur** adresleri (Keplr / MetaMask / Phantom) listeler. Salt okunur girişler, onları oluşturan cüzdanla etiketlenir; birinden gönderim yapmaya çalışmak, onu oluşturan cüzdandan göndermeniz gerektiğini açıklar.

## Sonraki adımlar

- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — bağlı imzalayıcılar ve harcama limitleri bu eşleştirmenin üzerine kurulur.
- [dApp Tarayıcı](/qorex/dapp-browser) — QoreX içinden uygulamalara bağlanın.
