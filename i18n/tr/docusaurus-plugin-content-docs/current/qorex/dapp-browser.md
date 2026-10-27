---
slug: /qorex/dapp-browser
title: dApp Tarayıcısı
sidebar_label: dApp Tarayıcısı
sidebar_position: 7
---

# dApp Tarayıcısı (mobil)

QoreX, QoreChain uygulamalarını cüzdandan çıkmadan kullanabilmeniz için uygulama içi bir **dApp tarayıcısı** içerir ve her imza açıkça onaylanır. Başka hiçbir şey kurmadan bir web uygulaması kullanmak isteyen mobil kullanıcılar ve uygulamalarını mobil cüzdanın içinde test eden geliştiriciler içindir.

## Yenilikler {#innovations}

- **Oturum kapsamlı bağlantılar.** Köken başına bir onay ve her bağlantı tarayıcıyı kapattığınızda sona erer.
- **Çözümlenmiş, biyometrik korumalı imzalar.** Her imza, yükü çözümlenmiş olarak kendi onayına sahiptir; QoreX'in çözümleyemediğini reddeder.
- **`signAndBroadcast`.** Bir sayfa mesajları gönderir; QoreX bunları gösterir, yalnızca cüzdanın üretebildiği ML-DSA-87 katmanını ekler ve yayınlar.
- **Devralmadan keşif.** QoreX kendini EIP-6963 ile duyurur ve başka bir cüzdanın `window.ethereum` veya `window.keplr` değerinin üzerine asla yazmaz.

## Nasıl erişilir {#how-to-access}

dApp tarayıcısı mobil uygulamanın bir parçasıdır: App Store'dan (iOS 15.1 veya üzeri) ya da Google Play'den (Android 7.0 veya üzeri) kurun; bağlantılar [genel bakışta](/qorex/overview#how-to-access) bulunur. Hesap gerektirmez. Masaüstü dApp'ler için [Tarayıcı Uzantısı](/qorex/browser-extension)'nı kullanın.

## Bir dApp'e bağlanma {#how-to-use}

Home sekmesinden **dApp tarayıcısını** açın ve bir uygulamaya gidin. dApp'in adresini **Enter a dApp URL** kutusuna yazın veya yapıştırın (yalnızca `https://` adresleri bağlanır). QoreX, sağlayıcılarını sayfaya `window.qorex` olarak enjekte eder - bir QoreChain Native sağlayıcısı (`signAndBroadcast` dahil), salt okunur bir EVM sağlayıcısı (yalnızca hesap ve zincir sorguları) ve bir Solana sağlayıcısı - ayrıca EIP-6963 aracılığıyla da kendini duyurur. `window.ethereum` değerini yalnızca başka hiçbir cüzdan ayarlamadığında ayarlar ve başka bir cüzdanın üzerine asla yazmaz. `window.keplr` takma adı yoktur.

- **Bağlanma**, **köken başına bir onay** gerektirir. Onaylamak, o siteye yalnızca genel adresinizi açıklar.
- **Her imza**, kendi biyometrik korumalı onayına sahiptir ve yükün **çözümlenmiş** olması sayesinde neyi imzaladığınızı tam olarak görebilirsiniz - **kör imzalama yoktur**.
- **Tarayıcı kapandığında tüm izinler sona erer** - bağlantılar oturum kapsamlıdır.
- **Yerel işlemler `signAndBroadcast` üzerinden geçer:** QoreX her mesajı, ücreti ve imzalayan hesabı gösterir, ML-DSA-87 katmanını ekler ve yayınlar. Buradaki EVM sağlayıcısı yalnızca hesap ve zincir sorgularına yanıt verir; EVM işlemlerini imzalamaz veya göndermez. Bkz. [Onay penceresinin gösterdikleri](/qorex/security-and-recovery#approvals).

## Q-Day Scanner

Home sekmesindeki hızlı düğmelerden ayrıca **Q-Day Scanner**'ı da açabilirsiniz: bir maruziyet raporu almak için herhangi bir Bitcoin veya Ethereum adresi girin. Bkz. [Güvenlik ve Kurtarma](/qorex/security-and-recovery#q-day-scanner).

## Ayarlar hızlı başvurusu

**Settings** içindeki diğer kullanışlı girdiler:

- **Security** → [Güvenlik ve Kurtarma](/qorex/security-and-recovery)
- **Language** - varsayılan olarak telefonu izler; 10 dil
- **Take the tour again** - QoreX'in ne yaptığını ve her şeyin nerede olduğunu anlatan beş kısa kart
- **Coins and networks** - cüzdanın bugün tutabildiği ve gönderebildiği her şey
- **Wallets** - bu telefondaki birden fazla kurtarma ifadesi - bkz. [Birden fazla cüzdan](/qorex/getting-started#several-wallets)
- **Your accounts** ve **Your addresses** → [Hesap ve Dashboard](/qorex/account-and-dashboard)
- **Claim your @handle** ve **Linked account** → [Hesap ve Dashboard](/qorex/account-and-dashboard)
- **Use testnet (developers)** - `qorechain-diana` test ağına geçer (EVM chain ID 9800); uygulama yeniden başlatılmadan canlı olarak yeniden bağlanır. Varsayılan her zaman mainnet'tir. Testnet bakiyeleri USD değeri göstermez.
- **Portfolio animation** - Aurora arka planını açıp kapatır.
- **Delete account** → [Hesabınızı silin](/qorex/account-and-dashboard#delete-account)
- **Connected to** - etkin ağı ve zincir kimliğini gösterir.

## Platform notları

- **iOS** (iOS 15.1 veya üzeri) - Face ID (ilk kullanımda bir kullanım istemi görünür), bir Secure Enclave kasası, sistem kimlik doğrulama sayfası üzerinden oturum açma ve cihaz bağlama ile QR taraması için bir kamera izni.
- **Android** (Android 7.0 veya üzeri) - StrongBox Keystore ile BiometricPrompt, `qorex://` akışları (kimlik doğrulama geri çağrısı, connect, tx, link) için kayıtlı derin bağlantılar ve cihaz bağlama için bir kamera izni.

Masaüstü dApp'ler için bunun yerine [Tarayıcı Uzantısı](/qorex/browser-extension)'nı kullanın.

## Nerede yayımlanır {#where-published}

dApp tarayıcısı QoreX mobil uygulamasının içinde gelir (App Store ve Google Play); mağaza sayfaları ve güncel sürümler için [Nerede yayımlanır](/qorex/overview#where-published) bölümüne bakın. Ayrı bir indirme değildir.

## Sınırlar ve bilinen sorunlar {#limits}

- Yalnızca `https://` adresleri bağlanır.
- Buradaki EVM sağlayıcısı yalnızca hesap ve zincir sorgularına yanıt verir; EVM işlemlerini veya mesajlarını imzalamaz veya göndermez. `signArbitrary` (mesaj imzalama) desteklenmez.
- `window.qorex.native` Keplr tarzıdır, Keplr'ın yerine geçen bir bileşen değildir ve `window.keplr` takma adı yoktur.
- Bağlantılar kalıcı değildir: tarayıcı kapandığında sona erirler.
- Q-Day Scanner, sosyal kurtarma ve Legacy uygulamadadır, uzantıda değildir.
