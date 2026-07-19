---
slug: /qorex/account-and-dashboard
title: Hesap ve Dashboard
sidebar_label: Hesap ve Dashboard
sidebar_position: 6
---

# Hesap ve Dashboard

QoreX **tamamen hesapsız çalışır** — anahtarlarınız asla bir hesaba bağlı değildir. Oturum açmak yalnızca @handle'lar, ödeme talepleri ve Dashboard eşleştirmesi gibi kolaylıklar ekler.

## Oturum açma {#sign-in}

Ana sekmedeki **Sign in** üzerinden ya da ilk kurulum sırasında oturum açabilirsiniz. Yöntemler:

- **E-posta kodu** — e-postanızı girin ve tek kullanımlık bir kod alın. Bu oturum açmadan sonra QoreX, gelecekteki anlık oturum açmalar için bir **passkey** eklemeyi önerir (Face ID / Touch ID / PIN). Bu bir *hesap* passkey'idir — cüzdan anahtarlarınıza asla dokunmaz.
- **Passkey** — daha önce bir tane kaydettiyseniz.
- **Continue with Google** — sistem kimlik doğrulama sayfası üzerinden tek bir yerel adım (uygulama asla bir tarayıcıya çıkmaz).
- **Continue with QORECHAIN Dashboard** — mevcut bir Dashboard hesabıyla (Google girişi dahil) oturum açın ve profilinizi içe aktarın.

:::note
Passkey teklifi yalnızca **e-posta kodu** ile oturum açmadan sonra görünür. Bir kimlik sağlayıcıyla (Google veya Dashboard) oturum açtığınızda, o sağlayıcı kendi kimlik doğrulamasını yönetir; bu nedenle bu hesaplara bir passkey eklenemez.
:::

## @handle {#handle}

Adresinize **çift imzayla** (bir kayıt defteri ed25519 imzası + kendi secp256k1 imzanız) bağlı benzersiz bir ad (örneğin `@liviu`) talep edin. Böylece herkes @handle'ınıza gönderim yapabilir. Çözümleme **önce-doğrula-sonra-sabitle** (ilk kullanımda güven) yöntemiyle çalışır; dolayısıyla bir handle'ın anahtarı hiç fark ettirmeden değiştirilirse QoreX bunu işaretler.

Handle kayıt defterine geçici olarak erişilemiyorsa, ekran **"Handles coming soon"** durumuna geçer ve geri kalan her şey çalışmaya devam eder; kayıt defteri döndüğünde handle'lar otomatik olarak yeniden etkinleşir.

## Bağlı hesap {#linked-account}

**Settings → Linked account**, QoreX cüzdanınız ile Dashboard hesabınızı iki yönlü olarak bağlar:

1. Dashboard'un gösterdiği 8 karakterlik kodu girin **veya** QoreX'te bir kod üretin (10 dakika geçerli) ve bunu Dashboard'a yazın.
2. Bağlantı kurulduğunda, @handle'ınız ve bağlı adresleriniz her ikisinde de görünür.
3. İstediğiniz zaman bağlantıyı kaldırın.

**Continue with Dashboard** *aracılığıyla* oturum açmak ikisini örtük olarak bağlar — ekstra yapılacak bir şey yoktur.

## Dashboard entegrasyonu {#dashboard}

Dashboard bağlıyken:

- Dashboard'daki **Connect with QoreX**, onu bir `qorex://connect` derin bağlantısı ve imzalı bir sahiplik kanıtı aracılığıyla cüzdanınıza eşleştirir.
- **Dashboard üzerinde başlatılan transferler**, QoreX'e `qorex://tx` istekleri olarak ulaşır. Bunlar çözümlenir, size tam olarak gösterilir ve biyometrik onaydan sonra **yalnızca uygulama içinde** imzalanır — ve yalnızca uygulamanın kendi türetilmiş adresinden.
- **Adresleriniz (Settings)** — bu cüzdandan türetilen her hesabı, ayrıca diğer cüzdanlardan (Keplr / MetaMask / Phantom) bağladığınız **salt-okunur** adresleri listeler. Salt-okunur girdiler, onları oluşturan cüzdanla etiketlenir; birinden gönderim yapmaya çalışmak, onu oluşturan cüzdandan göndermeniz gerektiğini açıklar.

## Sonraki adımlar

- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — bağlı imzalayıcılar ve harcama limitleri bu eşleştirmenin üzerine kurulur.
- [dApp Tarayıcısı](/qorex/dapp-browser) — QoreX içinden uygulamalara bağlanın.
