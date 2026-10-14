---
slug: /qorex/account-and-dashboard
title: Hesap ve Dashboard
sidebar_label: Hesap ve Dashboard
sidebar_position: 6
---

# Hesap ve Dashboard

QoreX **hesap olmadan da tamamen çalışır** — anahtarlarınız asla bir hesaba bağlı olmaz. Oturum açmak ödeme istekleri ve Dashboard eşleştirmesi gibi kolaylıklar ekler; bir @handle talep etmek de oturum açmanızı isteyebilir.

## Oturum açma {#sign-in}

Ana Sayfa sekmesindeki **Oturum aç** seçeneğinden veya kurulum sırasında oturum açabilirsiniz. Yöntemler:

- **E-posta kodu** — e-postanızı girin ve tek kullanımlık bir kod alın. Bu şekilde oturum açtıktan sonra QoreX, sonraki oturum açmalarınız için anında bir **passkey** (Face ID / Touch ID / PIN) eklemeyi önerir. Bu bir *hesap* passkey'idir — cüzdan anahtarlarınıza asla dokunmaz.
- **Passkey** — daha önce bir tane kaydettiyseniz.
- **Apple ile oturum aç** *(yalnızca iOS)* — Apple yalnızca adınızı ve e-postanızı paylaşır ve gerçek adresinizi özel bir yönlendirme (private-relay) adresinin arkasına gizlemenize olanak tanır.
- **Google ile devam et** — sistemin kimlik doğrulama ekranı üzerinden tek bir yerel adım (uygulama hiçbir zaman bir tarayıcıya yönlendirmez).
- **QORECHAIN Dashboard ile devam et** — mevcut bir Dashboard hesabıyla (Google girişi dahil) oturum açın ve profilinizi içe aktarın.

:::note
Passkey teklifi yalnızca **e-posta koduyla** oturum açtıktan sonra görünür. Bir kimlik sağlayıcı (Apple, Google veya Dashboard) ile oturum açtığınızda, o sağlayıcı kendi kimlik doğrulamasını kendisi yönetir; bu nedenle bu hesaplara bir passkey eklenemez.
:::

## Tek bir ifadeden birden fazla hesap {#accounts}

Ayarlar → **Hesaplarınız**, cüzdan başına **20 hesaba** kadar oluşturmanıza ve aralarında geçiş yapmanıza olanak tanır; hepsi aynı 24 kelimelik kurtarma ifadesinden türetilir (ayrıca yedeklenmesi gereken hiçbir şey yoktur). Her hesap, kendi bakiyesine ve kendi isteğe bağlı @handle'ına sahip (bir handle cüzdana değil bir **adrese** bağlıdır) ayrı bir `qor1…` adresidir ve ilk gönderiminden sonra kendi kuantum-sonrası anahtarına da sahip olur. Kullanımdaki hesap yapmak için bir hesaba dokunun. Hangi hesap etkinse Gönder, Al, Staking ve dApp tarayıcısı tarafından kullanılan hesap odur — geçiş yapmak her şeyi beraberinde taşır ve birden fazla hesap var olduğunda uygulama hangi hesapta olduğunuzu gösterir. Hesaplar *Hesap 1, 2, …* olarak numaralandırılır; yeniden adlandırılamaz. Tarayıcı eklentisinde de aynı ekran bulunur — bkz. [Tek bir ifadeden birden fazla hesap](/qorex/browser-extension#wallet).

- **Hesap ekle**, aynı ifadeye bir sonraki hesabı ekler. Yeni bir hesap, ilk gönderiminde kendi kuantuma dayanıklı anahtarını kaydeder; bu, küçük, tek seferlik bir ağ ücretine mal olur.
- **Ethereum hesabı ekle (coin 60)**, ilk olarak MetaMask'ta veya QoreChain Dashboard'unda kullanılmış bir kurtarma ifadesi içindir — fonları orada bulunur. Ethereum yolu `m/44'/60'` kullanır ve *Ethereum · coin 60* olarak etiketlenir; `0x…` adresi her EVM ağında aynıdır ve o QoreChain hesabıyla aynı anahtardır. Bkz. [MetaMask'tan veya Dashboard'dan bir ifadeyi geri yükleme](/qorex/getting-started#restore-dashboard).
- Yeni bir cihazda bir ifadeyi **geri yüklemek** yalnızca **Hesap 1**'i geri getirir; diğerlerini geri getirmek için **Hesap ekle** (ve **Ethereum hesabı ekle (coin 60)**) seçeneğini kullanın. Adresler ekranı (**Ayarlar → Adresleriniz**) ayrıdır: bu cüzdandaki her hesabı ve diğer cüzdanlardan bağlanan salt okunur adresleri listeler.

## @handle {#handle}

**Çift imza** (bir kayıt defteri ed25519 imzası + kendi secp256k1 imzanız) ile adresinize bağlı benzersiz bir isim (örneğin `@liviu`) talep edin. Bundan sonra herkes @handle'ınıza gönderim yapabilir. Çözümleme **önce doğrula, sonra sabitle** (ilk kullanımda güven) mantığıyla çalışır; bu nedenle bir handle'ın anahtarı sessizce değiştirilirse QoreX bunu işaretler.

Bir handle cüzdanınıza değil bir adrese bağlı olduğundan, bir handle talep etmek **adres başınadır** — [birden fazla hesabınız](#accounts) varsa, her biri kendi @handle'ını taşıyabilir ve bir hesap için handle talep etmek diğerlerine otomatik olarak isim kazandırmaz. Tarayıcı eklentisinde bir handle'a ödeme yapabilirsiniz; açılır pencereden talep etme, bazı sürümlerde sıradan QoreChain hesaplarında sunulur, bazılarında sunulmaz — açılır pencere sunmuyorsa mobil uygulamadan talep edin. Ethereum tarzı (coin 60) hesapların handle'ı yoktur.

Handle kayıt defterine geçici olarak ulaşılamıyorsa ekran **"Handle'lar yakında"** durumuna geçer ve geri kalan her şey çalışmaya devam eder; kayıt defteri tekrar erişilebilir olduğunda handle'lar otomatik olarak yeniden etkinleşir.

:::note Handle talep etmek ile Dashboard'a bağlamak arasındaki fark
Bunlar birbiriyle ilgisi olmayan iki ayrı eylemdir. Bir @handle talep etmek **başkalarının size isminizle gönderim yapabilmesini** sağlar — bunun dışında kendi başına başka hiçbir şey yapmaz. Dashboard'a bağlamak (aşağıda) cüzdanınızı bir Dashboard hesabına bağlar, böylece ikisi aynı verileri gösterebilir. İkisini birbirinden bağımsız olarak yapabilirsiniz.
:::

## Bağlı hesap {#linked-account}

**Ayarlar → Bağlı hesap**, QoreX cüzdanınızı ve Dashboard hesabınızı çift yönlü olarak bağlar:

1. Dashboard'da gösterilen 8 karakterli kodu girin **veya** QoreX'te bir kod oluşturun (10 dakika geçerlidir) ve bunu Dashboard'a yazın.
2. [Birden fazla hesabınız](#accounts) varsa, QoreX'in kendi onay penceresi hangi hesabın bağlanacağını seçmenizi sağlar — o anda etkin olan hesabı varsaymaz.
3. Bağlandıktan sonra @handle'ınız ve bağlı adresleriniz her ikisinde de görünür.
4. Bağlantıyı istediğiniz zaman kaldırabilirsiniz.

**Dashboard ile devam et** *üzerinden* oturum açmak ikisini örtük olarak bağlar — ayrıca yapmanız gereken bir şey yoktur.

## Dashboard entegrasyonu {#dashboard}

Dashboard bağlıyken:

- Dashboard'daki **QoreX ile bağlan**, onu bir `qorex://connect` derin bağlantısı ve imzalı bir sahiplik kanıtı aracılığıyla cüzdanınızla eşleştirir.
- **Dashboard'da başlatılan transferler** QoreX'e `qorex://tx` istekleri olarak ulaşır. Bunlar çözülür, size eksiksiz olarak gösterilir ve biyometrik onaydan sonra **yalnızca uygulama içinde**, yalnızca uygulamanın kendi türetilmiş adresinden imzalanır. Bir `qor1…` adresi mainnet ve testnet üzerinde eşit derecede geçerli olduğundan, Dashboard tarafından başlatılan her istek hangi ağı hedeflediğini belirtir ve bu, o anda bağlı olduğunuz ağla eşleşmiyorsa QoreX isteği reddeder — bir isteğin adına asla ağ değiştirmez.
- Siz **oturum açmamışken** bir Bağlan veya transfer isteği gelirse, QoreX çıkmaza girmeden devam edebilmeniz için satır içi bir **"Dashboard'a oturum aç"** adımı sunar.
- **Adresleriniz (Ayarlar)** — bu cüzdandan türetilen her hesabı ve diğer cüzdanlardan (Keplr / MetaMask / Phantom) bağladığınız **salt okunur** adresleri listeler. Salt okunur girişler, onları oluşturan cüzdanla etiketlenir; bunlardan biri üzerinden gönderim yapmaya çalışmak, onu oluşturan cüzdandan göndermeniz gerektiğini açıklar.

## Hesabınızı silin {#delete-account}

Ayarlar → **Hesabı sil** (en alttaki kırmızı giriş). Bir onay ve bir biyometrik kilit açma işleminden sonra QoreX şunları kalıcı olarak siler: bu cihazın cüzdanı ve özel anahtarları; QoreX kayıt defterindeki @handle'ınız (varsa); QoreChain Dashboard hesabınız (oturum açtıysanız); ve sosyal kurtarma kurulumunuz (yapılandırılmışsa). Geri alınamaz. QoreX saklama (custody) yapmadığı için, **kurtarma ifadenizi yedeklemediyseniz tüm fonlara erişiminizi kaybedersiniz** — önce yedekleyin. Sunucu tarafındaki silmeler en iyi çaba esasıyla yapılır; cihaz üzerindeki silme her zaman tamamlanır ve uygulamayı ilk açılış ekranına döndürür.

## Sonraki adımlar

- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — yedekleme, kurtarma ve EVM erişim penceresi.
- [dApp Tarayıcısı](/qorex/dapp-browser) — QoreX içinden uygulamalara bağlanın.
