---
slug: /qorex/dapp-browser
title: dApp Tarayıcısı
sidebar_label: dApp Tarayıcısı
sidebar_position: 7
---

# dApp Tarayıcısı (mobil)

QoreX, QoreChain uygulamalarını cüzdandan çıkmadan kullanabilmeniz için uygulama içi bir **dApp tarayıcısı** içerir ve her imza açıkça onaylanır.

## Bir dApp'e bağlanma

Home sekmesinden **dApp tarayıcısını** açın ve bir uygulamaya gidin. QoreX, sağlayıcılarını sayfaya enjekte eder — bir QoreChain bağlanma sağlayıcısı, salt okunur bir EVM sağlayıcısı ve diğer gerçek cüzdanları **asla ele geçirmeyen** kibar `keplr` / `ethereum` takma adları.

- **Bağlanma**, **köken başına bir onay** gerektirir. Onaylamak, o siteye yalnızca genel adresinizi açıklar.
- **Her imza**, kendi biyometrik korumalı onayına sahiptir ve yükün **çözümlenmiş** olması sayesinde neyi imzaladığınızı tam olarak görebilirsiniz — **kör imzalama yoktur**.
- **Tarayıcı kapandığında tüm izinler sona erer** — bağlantılar oturum kapsamlıdır.

## Q-Day Scanner

Home sekmesindeki hızlı düğmelerden ayrıca **Q-Day Scanner**'ı da açabilirsiniz: herhangi bir adresi girerek onun kuantum maruziyet raporunu alın — hangi fonların yalnızca klasik anahtarlar üzerinde bulunduğunu ve hangilerinin zaten post-kuantum korumalı olduğunu görün. Bkz. [Güvenlik ve Kurtarma](/qorex/security-and-recovery#q-day-scanner).

## Ayarlar hızlı başvurusu

**Settings** içindeki diğer kullanışlı denetimler:

- **Security dashboard** → [Güvenlik ve Kurtarma](/qorex/security-and-recovery)
- **Your addresses** ve **Linked account** → [Hesap ve Dashboard](/qorex/account-and-dashboard)
- **Use testnet (developers)** — `qorechain-diana` test ağına geçer (EVM chain ID 9800); uygulama yeniden başlatılmadan canlı olarak yeniden bağlanır. Varsayılan her zaman mainnet'tir.
- **Portfolio animation** — Aurora arka planını açıp kapatır.
- **Network status** — aktif uç noktalarla birlikte "Connected to …" gösterir.

## Platform notları

- **iOS** — Face ID (ilk kullanımda bir kullanım istemi görünür), bir Secure Enclave kasası, sistem kimlik doğrulama sayfası üzerinden oturum açma ve cihaz bağlama ile QR taraması için bir kamera izni.
- **Android** — StrongBox Keystore ile BiometricPrompt, `qorex://` akışları (kimlik doğrulama geri çağrısı, connect, tx, link) için kayıtlı derin bağlantılar ve cihaz bağlama için bir kamera izni.

Masaüstü dApp'ler için bunun yerine [Tarayıcı Uzantısı](/qorex/browser-extension)'nı kullanın.
