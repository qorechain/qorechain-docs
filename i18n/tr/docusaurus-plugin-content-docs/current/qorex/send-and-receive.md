---
slug: /qorex/send-and-receive
title: Gönder ve Al
sidebar_label: Gönder ve Al
sidebar_position: 3
---

# Gönder ve Al

Ana Sayfa (Cüzdan) sekmesi başlangıç noktanızdır. Bir **ağ rozeti** (varsayılan olarak MAINNET, geliştirici anahtarını etkinleştirdiyseniz TESTNET), **toplam bakiyenizi** (gizlemek/göstermek için dokunun) ve ana işlemleri gösterir: **Gönder · Al · Takas · Stake**. Varlık listeniz **QOR**'u (Native + kuantuma dayanıklı 🛡, Native/EVM/SVM hatları genelinde tek birleşik bakiye) ve **Tüm ağlar**'ı (ETH, BNB, POL, ARB ve QoreX'in desteklediği diğer [harici ağlar](#external-networks-tokens) genelinde birleşik bir görünüm) gösterir.

## Kuantuma dayanıklı QOR gönder

1. **Gönder**'e dokunun.
2. Alıcıyı bir `qor1…` adresi **veya** bir **@kullanıcı adı** olarak girin. Bir kullanıcı adı çözümlenir ve kriptografik olarak doğrulanır (kayıt defteri imzası + sahip imzası + ilk kullanımda güvenme sabitlemesi); bir kullanıcı adının anahtarı sessizce değişirse, QoreX açık bir uyarı gösterir.
3. Tutarı girin. Önizleme; alıcıyı, tutarı, ücreti ve imzanın kuantum sonrası koruma düzeyi olan **Kalkan** durumunu gösterir.
4. **Biyometrik** onayla doğrulayın. QoreX, transferi zorunlu hibrit kuantum sonrası imzayla (ML-DSA-87 + secp256k1) imzalar ve Native hattında yayınlar.

**İlk** transferiniz, kuantum sonrası anahtarınızı zincir üzerinde otomatik olarak da kaydeder — bunu [Güvenlik ve Kurtarma](/qorex/security-and-recovery#pqc-key) sayfasında görebilirsiniz. Ayrı bir adım gerekmez.

### @kullanıcı adına adım adım gönderim {#handle-send}

1. **Gönder**'i açın ve alıcı alanına adres yerine `@` işaretinin ardından kullanıcı adını (örneğin `@liviu`) yazın.
2. QoreX kullanıcı adını arar ve herhangi bir şeyi onaylamadan önce size **çözümlenen `qor1…` adresini** gösterir.
3. Çözümlenen adresi kontrol edin, tutarı girin ve her zamanki gibi onaylayın.

QoreX yalnızca gerçekleştirdiği **her iki** denetimi de geçen bir çözümlemeyi kabul eder: uygulamada sabitlenmiş bir güven anahtarına karşı doğrulanan bir kayıt defteri onayı ve kullanıcı adı sahibinin iddia üzerindeki kendi imzası. Denetimlerden biri bile başarısız olursa, doğrulanmamış bir adrese geri dönmek yerine bir hata verir. Belirli bir kullanıcı adına ilk kez ödeme yaptığınızda, QoreX çözümlediği adresi hatırlar; o kullanıcı adının adresi bir gün değişirse, QoreX imzalamadan önce durur ve devam edip etmeyeceğinize karar verebilmeniz için eski ve yeni adresi yan yana gösterir. Tarayıcı eklentisi de kullanıcı adlarını aynı şekilde çözümler ve öder — bkz. [@kullanıcı adına gönderim](/qorex/browser-extension#handle-send).

### Vesting (kilitli) QOR gönderimi {#vesting}

Bakiyenizin bir kısmı hâlâ **vesting** aşamasındaysa — örneğin serbest bırakılmamış bir TGE tahsisatı — toplamınız **şimdi kullanılabilir** ve **hâlâ kilitli** olarak ikiye ayrılır. Yalnızca kullanılabilir kısmı gönderebilirsiniz; QoreX, ağın bir ücret aldıktan sonra reddetmesine izin vermek yerine aşırı harcama girişimini kendisi reddeder. Kilitli kısım, vesting takvimi onu serbest bıraktıkça kademeli olarak harcanabilir hale gelir. Bu ayrım bakiyenizin göründüğü her yerde gösterilir — Ana Sayfa, Gönder ve Varlık detayı.

## QOR al

`qor1…` adresinizi (QoreChain simgesi gömülü) bir QR kodu ve bir kopyalama düğmesiyle göstermek için **Al**'a dokunun. İkisinden birini gönderenle paylaşın.

## Ödeme talep et

Bir ödeme talebi — bir tutar artı isteğe bağlı bir not — oluşturmak için bir QR kodu veya bağlantı olarak **Talep Et**'e dokunun ([oturum açma](/qorex/account-and-dashboard#sign-in) gerektirir). Onu tarayan kişi önceden doldurulmuş transferi görür.

## Harici ağlar ve tokenlar {#external-networks-tokens}

**Tüm ağlar** (veya Harici Gönder) üzerinden **ETH, BNB, POL, AVAX ve SOL**'u yerel olarak, ayrıca **Arbitrum, Base ve OP Mainnet** üzerinde ETH'yi, Cosmos üzerinde **ATOM, OSMO ve TIA**'yı ve **ERC-20**, **SPL** ve **IBC** tokenlarını — EVM zincirleri ve Solana genelinde USDC ve USDT, Ethereum üzerinde DAI ve IBC üzerinden Noble USDC — gönderebilirsiniz; hepsi aynı kurtarma ifadesinden türetilir (ETH `m/44'/60'` kullanır, SOL kendi standart yolunu kullanır ve SPL ilişkili token hesaplarını kullanır).

:::caution Harici zincirler yalnızca klasik imza kullanır
Diğer blok zincirleri kuantum sonrası imzaları taşıyamaz. Harici bir ağda gönderim yaptığınızda QoreX bunu açıkça belirtir (transfer klasik bir imza kullanır ve **Kalkan** düşüşü gösterir). **QOR**'unuz her zaman korumalı Native hattında kalır. Cosmos tabanlı harici gönderimler isteğe bağlı bir notu destekler.
:::

## Takas

**Takas** sekmesi QoreChain'in zincir üzeri AMM'sine bağlıdır ancak devre dışı kalır — düğmede **"Takas — havuz likiditesiyle geliyor"** yazar — ta ki likidite ve uzaktan özellik bayrağı onu açana kadar. Bu gerçekleştiğinde otomatik olarak etkinleşir; **uygulama güncellemesi gerekmez**.

:::note iOS
Takas sekmesi App Store sürümünde hiç görünmez — Apple, uygulama içi token değişimini düzenlemeye tabi bir hizmet olarak değerlendirir. Takas, (etkinleştirildiğinde) Android'de ve tarayıcı eklentisinde kullanılabilir olmaya devam eder.
:::

## Sonraki adımlar

- [Portföy ve Stake](/qorex/portfolio-and-staking) — tahsisatınızı görün ve ödül kazanın.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — cüzdanınızı koruyun ve kurtarın.
