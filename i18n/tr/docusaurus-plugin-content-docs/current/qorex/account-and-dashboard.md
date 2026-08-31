---
slug: /qorex/account-and-dashboard
title: Hesap ve Dashboard
sidebar_label: Hesap ve Dashboard
sidebar_position: 6
---

# Hesap ve Dashboard

QoreX **hesap olmadan da tamamen çalışır** — anahtarlarınız asla bir hesaba bağlı olmaz. Oturum açmak yalnızca @handle'lar, ödeme istekleri ve Dashboard eşleştirmesi gibi kolaylıklar ekler.

## Oturum açma {#sign-in}

Ana Sayfa sekmesindeki **Oturum aç** seçeneğinden veya kurulum sırasında oturum açabilirsiniz. Yöntemler:

- **E-posta kodu** — e-postanızı girin ve tek kullanımlık bir kod alın. Bu şekilde oturum açtıktan sonra QoreX, sonraki oturum açmalarınız için anında bir **passkey** (Face ID / Touch ID / PIN) eklemeyi önerir. Bu bir *hesap* passkey'idir — cüzdan anahtarlarınıza asla dokunmaz.
- **Passkey** — daha önce bir tane kaydettiyseniz.
- **Google ile devam et** — sistemin kimlik doğrulama ekranı üzerinden tek bir yerel adım (uygulama hiçbir zaman bir tarayıcıya yönlendirmez).
- **QORECHAIN Dashboard ile devam et** — mevcut bir Dashboard hesabıyla (Google girişi dahil) oturum açın ve profilinizi içe aktarın.

:::note
Passkey teklifi yalnızca **e-posta koduyla** oturum açtıktan sonra görünür. Bir kimlik sağlayıcı (Google veya Dashboard) ile oturum açtığınızda, o sağlayıcı kendi kimlik doğrulamasını kendisi yönetir; bu nedenle bu hesaplara bir passkey eklenemez.
:::

## Tek bir ifadeden birden fazla hesap {#accounts}

Ayarlar → **Hesaplarınız** (**Adresler** olarak da bulunabilir), hepsi aynı 24 kelimelik kurtarma ifadesinden türetilen (ayrıca yedeklenmesi gereken hiçbir şey yoktur) **20 hesaba** kadar oluşturmanıza, aralarında geçiş yapmanıza ve bunları yeniden adlandırmanıza olanak tanır. Her hesap, kendi bakiyesine sahip, ayrı bir `qor1…` adresidir; bir handle cüzdanın tamamına değil bir **adrese** bağlı olduğundan, her hesabın kendi isteğe bağlı @handle'ı da olabilir. Hangi hesap etkinse Gönder, Al, Staking ve dApp tarayıcısı tarafından kullanılan hesap odur — geçiş yapmak her şeyi beraberinde taşır ve birden fazla hesap var olduğunda uygulama hangi hesapta olduğunuzu gösterir. **0.2.2** sürümünden itibaren tarayıcı eklentisi de bu özelliğe sahiptir — bkz. [Tek bir ifadeden birden fazla hesap](/qorex/browser-extension#wallet).

Tek bir kurtarma ifadesi her hesabı geri yükler, ancak her hesap ilk işlem yaptığında kendi ML-DSA-87 kuantum-sonrası anahtarını zincir üzerinde kaydeder — tıpkı normal tek hesaplı bir cüzdan gibi — bu nedenle yeni bir hesabı açmak ve kullanmak, o hesaba özgü tek seferlik anahtar kaydı maliyetini de beraberinde getirir.

## @handle {#handle}

**Çift imza** (bir kayıt defteri ed25519 imzası + kendi secp256k1 imzanız) ile adresinize bağlı benzersiz bir isim (örneğin `@liviu`) talep edin. Bundan sonra herkes @handle'ınıza gönderim yapabilir. Çözümleme **önce doğrula, sonra sabitle** (ilk kullanımda güven) mantığıyla çalışır; bu nedenle bir handle'ın anahtarı sessizce değiştirilirse QoreX bunu işaretler.

Bir handle cüzdanınıza değil bir adrese bağlı olduğundan, bir handle talep etmek **adres başınadır** — [birden fazla hesabınız](#accounts) varsa, her biri kendi @handle'ını taşıyabilir ve bir hesap için handle talep etmek diğerlerine otomatik olarak isim kazandırmaz. Tarayıcı eklentisi de doğrudan açılır penceresinden, kendi tek adresi için bir handle talep edebilir.

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

**Dashboard ile devam et** üzerinden oturum açmak ikisini örtük olarak bağlar — ayrıca yapmanız gereken bir şey yoktur.

## Dashboard entegrasyonu {#dashboard}

Dashboard bağlıyken:

- Dashboard'daki **QoreX ile bağlan**, onu bir `qorex://connect` derin bağlantısı ve imzalı bir sahiplik kanıtı aracılığıyla cüzdanınızla eşleştirir.
- **Dashboard'da başlatılan transferler** QoreX'e `qorex://tx` istekleri olarak ulaşır. Bunlar çözülür, size eksiksiz olarak gösterilir ve biyometrik onaydan sonra **yalnızca uygulama içinde**, yalnızca uygulamanın kendi türetilmiş adresinden imzalanır. Bir `qor1…` adresi mainnet ve testnet üzerinde eşit derecede geçerli olduğundan, Dashboard tarafından başlatılan her istek hangi ağı hedeflediğini belirtir ve bu, o anda bağlı olduğunuz ağla eşleşmiyorsa QoreX isteği reddeder — bir isteğin adına asla ağ değiştirmez.
- Siz **oturum açmamışken** bir Bağlan veya transfer isteği gelirse, QoreX çıkmaza girmeden devam edebilmeniz için satır içi bir **"Dashboard'a oturum aç"** adımı sunar.
- **Adresleriniz (Ayarlar)** — bu cüzdandan türetilen her hesabı ve diğer cüzdanlardan (Keplr / MetaMask / Phantom) bağladığınız **salt okunur** adresleri listeler. Salt okunur girişler, onları oluşturan cüzdanla etiketlenir; bunlardan biri üzerinden gönderim yapmaya çalışmak, onu oluşturan cüzdandan göndermeniz gerektiğini açıklar.

## Sonraki adımlar

- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — bağlı imzalayıcılar ve harcama limitleri bu eşleştirme üzerine inşa edilir.
- [dApp Tarayıcısı](/qorex/dapp-browser) — QoreX içinden uygulamalara bağlanın.
