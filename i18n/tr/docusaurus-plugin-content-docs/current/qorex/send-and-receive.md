---
slug: /qorex/send-and-receive
title: Gönder ve Al
sidebar_label: Gönder ve Al
sidebar_position: 3
---

# Gönder ve Al

Ana Sayfa (Cüzdan) sekmesi başlangıç noktanızdır. Bir **ağ rozeti** (varsayılan olarak MAINNET, geliştirici anahtarını etkinleştirdiyseniz TESTNET), **toplam bakiyenizi** (gizlemek/göstermek için dokunun) ve ana işlemleri gösterir: **Gönder · Al · Takas · Stake** (**Takas** iOS'ta gösterilmez). Varlık listeniz **QOR**'u (Native + kuantuma dayanıklı 🛡, Native/EVM/SVM hatları genelinde tek birleşik bakiye) ve **Tüm ağlar**'ı (ETH, BNB, POL, ARB ve QoreX'in desteklediği diğer [harici ağlar](#external-networks-tokens) genelinde birleşik bir görünüm) gösterir.

## Kuantuma dayanıklı QOR gönder

1. **Gönder**'e dokunun.
2. Alıcıyı bir `qor1…` adresi **veya** bir **@kullanıcı adı** olarak girin. Bir kullanıcı adı çözümlenir ve kriptografik olarak doğrulanır (kayıt defteri imzası + sahip imzası + ilk kullanımda güvenme sabitlemesi); bir kullanıcı adının anahtarı sessizce değişirse, QoreX açık bir uyarı gösterir.
3. Tutarı girin. Önizleme; alıcıyı, tutarı, **Ağ ücretini** ve imzanın kuantum sonrası koruma düzeyi olan **Kalkan** durumunu gösterir.
4. **Biyometrik** onayla doğrulayın. QoreX, transferi zorunlu hibrit kuantum sonrası imzayla (ML-DSA-87 + secp256k1) imzalar ve Native hattında yayınlar.

İlk ekranda **Ask QoreX**, "send 50 QOR to @maria" gibi bir isteği yazmanıza olanak tanır ve formu sizin için doldurur; yine de her zamanki gibi gözden geçirir ve biyometriyle onaylarsınız. Basit istekler cihazınızda okunur; bu şekilde okunamayan bir istek, taslağa dönüştürülmek üzere QoreChain'in QCAI hizmetine gönderilebilir. Asistan asla imzalamaz ve anahtarlarınızı asla görmez. Son alıcılar çip olarak görünür.

QoreChain kuantum sonrası anahtarınızı kendiliğinden kaydetmez — QoreX bunu **ilk** transferinizin bir parçası olarak sizin için yapar (küçük, tek seferlik bir ağ ücreti) ve durumunu [Güvenlik ve Kurtarma](/qorex/security-and-recovery#pqc-key) sayfasında görebilirsiniz. QoreX'te ayrı bir adım gerekmez.

### @kullanıcı adına adım adım gönderim {#handle-send}

1. **Gönder**'i açın ve alıcı alanına adres yerine `@` işaretinin ardından kullanıcı adını (örneğin `@liviu`) yazın.
2. QoreX kullanıcı adını arar ve herhangi bir şeyi onaylamadan önce size **çözümlenen `qor1…` adresini** gösterir.
3. Çözümlenen adresi kontrol edin, tutarı girin ve her zamanki gibi onaylayın.

QoreX yalnızca gerçekleştirdiği **her iki** denetimi de geçen bir çözümlemeyi kabul eder: uygulamada sabitlenmiş bir güven anahtarına karşı doğrulanan bir kayıt defteri onayı ve kullanıcı adı sahibinin iddia üzerindeki kendi imzası. Denetimlerden biri bile başarısız olursa, doğrulanmamış bir adrese geri dönmek yerine bir hata verir. Belirli bir kullanıcı adına ilk kez ödeme yaptığınızda, QoreX çözümlediği adresi hatırlar; o kullanıcı adının adresi bir gün değişirse, QoreX imzalamadan önce durur ve devam edip etmeyeceğinize karar verebilmeniz için eski ve yeni adresi yan yana gösterir. Bu hafıza **cihaza özeldir** — aynı kullanıcı adına farklı bir telefondan veya yeni bir kurulumdan ilk kez ödeme yapmak orada da yeni olarak gösterilir; bu beklenen bir durumdur, hata değildir. Tarayıcı eklentisi de kullanıcı adlarını aynı şekilde çözümler ve öder (hafızası **tarayıcıya özeldir**, dolayısıyla farklı bir tarayıcı veya bilgisayar onu yeni olarak görür) — bkz. [@kullanıcı adına gönderim](/qorex/browser-extension#handle-send).

### Vesting (kilitli) QOR gönderimi {#vesting}

Bakiyenizin bir kısmı hâlâ **vesting** aşamasındaysa — örneğin serbest bırakılmamış bir TGE tahsisatı — toplamınız **şimdi kullanılabilir** ve **hâlâ kilitli** olarak ikiye ayrılır. Yalnızca kullanılabilir kısmı gönderebilirsiniz; QoreX, ağın bir ücret aldıktan sonra reddetmesine izin vermek yerine aşırı harcama girişimini kendisi reddeder. Kilitli kısım, vesting takvimi onu serbest bıraktıkça kademeli olarak harcanabilir hale gelir. Bu ayrım bakiyenizin göründüğü her yerde gösterilir — Ana Sayfa, Gönder ve Varlık detayı.

## Al {#receive}

**Al**'a dokunun. Önce QoreChain seçilidir — `qor1…` adresiniz (ve varsa @kullanıcı adınız) QoreChain simgeli bir QR kodu olarak, ayrıca **Kopyala** ve **Paylaş** ile gösterilir. Ona gönderilen her şey kuantum güvenli korumayla ulaşır.

Başka bir ağda almak için üstteki **Ağ** seçicisini kullanın: Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis ve Celestia'nın her biri **kendi adresini** ve *"Bu adrese yalnızca \{network\} üzerindeki \{coin\} veya tokenları gönderin. Başka bir ağdan gönderilen coinler kaybolabilir."* uyarısını gösterir. Tüm EVM ağları tek bir `0x…` adresini paylaşır. EVM ve Solana adresleriniz kurtarma ifadenizden türetilir; bu nedenle QoreX onları göstermeden önce bir biyometrik onay (**Show the address**) ister. Diğer ağlar kuantum sonrası imzaları taşıyamaz — bkz. [Harici ağlar](#external-networks-tokens).

Tarayıcı eklentisinde **Al** aynı ağ seçicisine sahiptir.

## Coin'ler ve tokenlar {#coins-and-tokens}

Satırı olmayan bir coin'in onu alabileceğiniz bir adresi yoktur. Bir coin veya token'ı henüz hiç sahip olmadan **Portföy**'de görmek için Portföy → **+ Coin or token** bölümünü açın ve onu açın (eklentide: **Coins and tokens**). Sıfırda sabitlenmiş bir coin'e dokunulduğunda kendi ağında **Al** açılır. Ayarlar → **Coins and networks**, cüzdanın bugün tutabildiği her şeyi listeler.

**Sözleşme adresiyle token ekleyin** (yalnızca EVM ağları):

1. Portföy → **+ Coin or token** → **Add a token by contract** (eklenti: **Coins and tokens** → *Add a token by contract*).
2. **Ağı** seçin, **Sözleşme adresini (0x…)** yapıştırın ve **Check contract**'a dokunun.
3. QoreX sembolü ve ondalık basamakları doğrudan sözleşmeden okur ve *"Sözleşme şunu söylüyor: \{symbol\} · \{decimals\} ondalık"* ifadesini gösterir. Herkes bir token oluşturabilir ve ona istediği adı verebilir — QoreX bunun garantisini vermez, bu yüzden kastettiğiniz sözleşme olduğundan emin olun.
4. **Add \{symbol\}**'a dokunun. *Added by you* olarak işaretlenir ve pakete dahil tokenlar gibi gönderilebilir. İstediğiniz zaman kaldırabilirsiniz.

QoreX; zaten pakete dahil olan bir token'ı, daha önce eklediğiniz bir token'ı, EVM olmayan bir ağı, hatalı bir adresi, token olarak yanıt vermeyen bir sözleşmeyi ve QoreX'in o ağda zaten sunduğu bir token'ın adını kullanan bir sözleşmeyi (büyük olasılıkla bir kopya) reddeder.

## Ödeme talep et

Bir ödeme talebi — bir tutar artı isteğe bağlı bir not — oluşturmak için bir QR kodu veya bağlantı olarak **Talep Et**'e dokunun ([oturum açma](/qorex/account-and-dashboard#sign-in) gerektirir). Onu tarayan kişi önceden doldurulmuş transferi görür.

## Harici ağlar ve tokenlar {#external-networks-tokens}

**Tüm ağlar** (veya Harici Gönder) üzerinden **ETH, BNB, POL, AVAX ve SOL**'u yerel olarak, ayrıca **Arbitrum, Base ve OP Mainnet** üzerinde ETH'yi, Cosmos üzerinde **ATOM, OSMO ve TIA**'yı ve **ERC-20**, **SPL** ve **IBC** tokenlarını — EVM zincirleri ve Solana genelinde USDC ve USDT, Ethereum üzerinde DAI ve IBC üzerinden Noble USDC — gönderebilirsiniz; hepsi aynı kurtarma ifadesinden türetilir (ETH `m/44'/60'` kullanır, SOL kendi standart yolunu kullanır ve SPL ilişkili token hesaplarını kullanır).

:::caution Harici zincirler yalnızca klasik imza kullanır
Diğer blok zincirleri kuantum sonrası imzaları taşıyamaz. Harici bir ağda gönderim yaptığınızda QoreX bunu açıkça belirtir (transfer klasik bir imza kullanır ve **Kalkan** düşüşü gösterir). **QOR**'unuz her zaman korumalı Native hattında kalır. Cosmos tabanlı harici gönderimler isteğe bağlı bir notu destekler. EVM ağları için QoreX, onaylamadan önce **maksimum ağ ücretini** de gösterir — "Network fee: at most \{fee\}. Check it before you confirm." — ve tam olarak bu rakamla imzalar.
:::

## Takas

**Takas** sekmesi QoreChain'in zincir üzeri AMM'sine bağlıdır ancak devre dışı kalır — düğmede **"Takas — havuz likiditesiyle geliyor"** yazar — ta ki likidite ve uzaktan özellik bayrağı onu açana kadar. Bu gerçekleştiğinde otomatik olarak etkinleşir; **uygulama güncellemesi gerekmez**.

:::note iOS
Takas sekmesi App Store sürümünde hiç görünmez — Apple, uygulama içi token değişimini düzenlemeye tabi bir hizmet olarak değerlendirir. Takas, (etkinleştirildiğinde) yalnızca Android'de kullanılabilir olmaya devam eder. Tarayıcı eklentisinde Takas ekranı yoktur.
:::

## Ana ekran ekstraları {#home-extras}

- **Ana ekran widget'ı** (Android ve iPhone) — telefonunuzun widget seçicisinden **QoreX**'i ekleyin. Kullandığınız hesabın QOR bakiyesini gösterir, gizlilik modu açıkken tutar yerine noktalar gösterir, yaklaşık her 30 dakikada bir kendini yeniler ve dokunulduğunda uygulamayı açar. Ana ekranınızı görebilen herkes widget'ı görebilir; bu önemliyse gizlilik modunu açın (bakiyenize dokunun).
- **Anlık bildirimler** (mobil, mainnet) — Ana Sayfa → **Notifications** üzerindeki zilde bir **Push notifications** anahtarı vardır: *"Uygulama kapalıyken bile QOR geldiğinde bildirim alın. Sunucumuz yalnızca herkese açık adreslerinizi izler; Apple ve Google hiçbir tutar veya adres görmez."* Bildirim metni yalnızca "QOR received"dır. Anahtarı kapatmak cihazınızı sunucudan kaldırır. QoreX için bildirimler telefonunuzun ayarlarında kapalıysa, önce oradan açın. Teslimat Android'de uçtan uca test edilmiştir; iPhone'da bunu en iyi çaba (best effort) olarak değerlendirin ve uygulama içi **Notifications** listesini kontrol etmeye devam edin.
- **Arama ve tur** — bkz. [Yolunuzu bulun](/qorex/getting-started#find-your-way).

## Sonraki adımlar

- [Portföy ve Stake](/qorex/portfolio-and-staking) — tahsisatınızı görün ve ödül kazanın.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — cüzdanınızı koruyun ve kurtarın.
