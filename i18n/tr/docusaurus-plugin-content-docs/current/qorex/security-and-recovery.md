---
slug: /qorex/security-and-recovery
title: Güvenlik ve Kurtarma
sidebar_label: Güvenlik ve Kurtarma
sidebar_position: 5
---

# Güvenlik ve Kurtarma

Bu sayfa QoreX'in anahtarlarınızı nasıl koruduğunu ve bir cüzdanı nasıl geri alacağınızı anlatır: tek ekranlık koruma kontrolü, ML-DSA-87 anahtarı ve bakımı, multisig hesapları, sosyal kurtarma, Legacy, cihaz bağlama, EVM erişim penceresi, onayların gösterdikleri, otomatik kilit, Q-Day Tarayıcı ve nereden yardım alınacağı. Her QoreX kullanıcısı içindir; kurtarma araçlarının çoğu mobil uygulamadadır ve tarayıcı veya Safari eklentisinde bir fark olduğunda metin bunu belirtir.

## Yenilikler {#innovations}

- **Paramın korunması.** Yedeğinizi, bağlı sitelerinizi, zincirde verdiğiniz izinleri ve token onaylarınızı canlı olarak kontrol eden ve iptal etmenize imkân veren tek bir ekran. Bkz. [Paramın korunması](#protection).
- **Kuantum sonrası anahtar bakımı.** ML-DSA-87 anahtarını kurtarma ifadenizden döndürün, artık imzalayamayan bir kaydı onarın ve kuantum sonrası bir multisig yürütün. Bkz. [Anahtarı döndürme](#pqc-rotation), [Onarım](#pqc-repair) ve [Multisig hesapları](#multisig).
- **Şifreli paylar ve bir kurtarma kitiyle sosyal kurtarma.** Koruyucular ML-KEM ile mühürlenmiş, 3'te 2 olarak bölünmüş payları tutar ve cüzdanı geri yüklemek için kurtarma kitinize ihtiyaç duyar. Bir kurtarma 48 saatlik bir zaman kilidi çalıştırır ve sizi uyarır; iptal edebilirsiniz ve bir iptal yalnızca geciktirebilir, asla fon taşıyamaz.
- **Legacy.** Seçtiğiniz bir yararlanıcı için koruyucularınız üzerinde kurulu bir ölü adam anahtarı (dead-man's switch).
- **Cihaz bağlama.** Tek seferlik bir kod ve bir QR, asla aynı ekranda değil. QR tek başına, bellek-zor bir anahtar türetmenin arkasındaki şifreli metindir.
- **Deterministik ML-DSA-87 anahtarı.** Kurtarma ifadenizden türetilir (ilk anahtar `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)` şeklindedir ve döndürülen anahtarlar da aynı ifadeden türetilir), bu yüzden anahtar ayrı bir yedek gerektirmez. Bkz. [QoreSign](/qoresign/overview).
- **Sınırlı EVM erişimi.** Bir EVM işlemi yalnızca işlem sayısı, değer ve son kullanma ile sınırlı bir erişim penceresi açıkken kabul edilir ve kendiniz açtığınız bir pencere, aksini seçmediğiniz sürece yalnızca QOR transferlerini kabul eder.
- **Okuyamadığını reddeden onaylar.** Bkz. [Onay penceresinin gösterdikleri](#approvals).
- **Q-Day Tarayıcı.** Herhangi bir Bitcoin veya Ethereum adresi için bir maruziyet raporu.

## Nasıl kullanılır ve nerede bulunur {#how-to-use}

Aşağıdakilerin çoğu mobil uygulamada **Ayarlar → Güvenlik** altındadır; **Paramın korunması** ve **Destek** **Ayarlar**'dadır. Tarayıcı ve Safari eklentilerinde açılır pencerenin ana ekranında EVM erişim penceresi, Bağlı siteler, Kurtarma ifadesini göster, Kuantum sonrası anahtarı döndür, Çoklu imza hesapları, Paramın korunması ve Destek düğmeleri ile otomatik kilit ayarı vardır. Sosyal kurtarma, Legacy, cihaz bağlama ve Q-Day Tarayıcı yalnızca mobildedir. QoreX ücretsizdir ve bunların hiçbiri için hesap gerektirmez; mağaza bağlantıları için [genel bakış](/qorex/overview#how-to-access) sayfasına bakın.

Ana Sayfa sekmesi ayrıca, sosyal kurtarma kurulana kadar uyarmaya devam eden bir **Yedek durumu** kartı gösterir. Kart yalnızca sosyal kurtarmayı izler: kurtarma ifadenizi yazıp yazmadığınızı bilemez, bu yüzden bunu kendiniz yapın (aşağıya bakın).

## Paramın korunması {#protection}

"Param güvende mi ve kimler benim adıma hareket edebilir?" sorusunu yanıtlayan tek bir ekran. Uygulama: **Ayarlar → Paramın korunması**. Eklenti ve Safari: açılır pencerenin ana ekranındaki **Paramın korunması**. Her satır, siz ekranı açtığınızda hem bu cihazda hem de ağda kontrol edilir; hiçbir şey varsayılmaz. Bir şey okunamadığında QoreX *"Şu anda okunamadı. Bu, hiç olmadığı anlamına gelmez."* der.

| Satır | Neyi kontrol eder | Ne yapabilirsiniz |
|---|---|---|
| **Yedek doğrulandı** ve **Kurtarma test edildi** | kurtarma ifadenize sahip olduğunuzu kanıtlayıp kanıtlamadığınızı ve ne zaman | **Kurtarma ifademi test et**: ifadenizin üç kelimesini yazın. Bu bir deneme çalışmasıdır: kelimeler bu cihazda karşılaştırılır, yazdığınız hiçbir şey saklanmaz veya gönderilmez ve hiçbir şey geri yüklenmez ya da değiştirilmez. Yanlış kelimeler hiçbir şey kaydetmez |
| **Koruyucular (sosyal kurtarma)** | koruyucuların kurulu olup olmadığını, kaç tane olduğunu ve kaçının gerektiğini | [Sosyal kurtarma](#social-recovery) bölümünden kurun |
| **İzinli uygulamalar** | adresinizi görebilen ve sizden imza isteyebilen siteleri (uygulamada, uygulama içi dApp tarayıcısının siteleri; eklentide bağlı siteler) | herhangi bir siteyi **İptal et** |
| **Ağda verilen izinler** | hesabınızın başkalarına verdiği, zincirden okunan kalıcı **authz yetkileri** ve **ücret yetkileri**; sınırsız olanlar en başta, bitiş tarihleriyle | **İptal et**: QoreX ağ ücretiyle bir inceleme gösterir, ardından kaldırma işlemini hibrit imzanızla imzalar |
| **ERC-20 token onayları** | **QoreChain'in EVM'inde** token'larınızı taşımasına izin verilen harcayıcıları | `approve(spender, 0)` gönderen **İptal et** |

**Token onayları hakkında.** Uygulamada **Token onaylarını kontrol et** düğmesine dokunun; onları okumak bu cüzdanın Ethereum adresini kullanır ve bu bir kez ifadenizi gerektirir. Düğümün kabul ettiği aralıklarla okunurlar, bu yüzden ekran *"Token onayları \{from\} numaralı bloka kadar kontrol edildi. Daha eskileri olabilir: kontrole devam etmek için bu ekranı yeniden açın."* diyebilir. İptal etmek için QoreX önce kuantum sonrası anahtarınızla imzalanan ve token sözleşmesiyle sınırlı **tek işlemlik bir EVM penceresi** açar, ardından klasik anahtarınızla imzalanan EVM işlemini gönderir. QoreChain'in EVM'inde yalnızca Ethereum tarzı (coin 60) bir hesap gönderim yapabilir; bu yüzden bir coin-118 hesabı burada bir EVM onayını iptal edemez ve QoreX bunu söyler.

**Lane başına kuantum sonrası koruma.** Ekran, hangi imzaların neyi koruduğunu sade bir dille açıklar:

- **QoreChain (native):** her işlem iki imza taşır, biri kuantum sonrası (ML-DSA-87), biri klasik, ve ağ ikisini de kontrol eder.
- **QoreChain EVM:** EVM işlemleri, her EVM cüzdanında olduğu gibi klasik olarak imzalanır. Ağ onları yalnızca kuantum sonrası imzanızla, seçtiğiniz sınırlar içinde açtığınız bir [pencerenin](#evm-window) içinde kabul eder.
- **Diğer ağlar (Ethereum, Solana, Cosmos):** yalnızca klasik imzaları kabul ederler. QoreX orada kuantum sonrası koruma ekleyemez.
## Şimdi yedekleyin - kayıp bir cüzdanı sizin için kimse kurtaramaz {#back-up-now}

:::danger Cüzdanınızı fonlamadan önce bunu okuyun
QoreX **saklayıcısızdır (non-custodial)**: anahtarlarınız yalnızca kendi cihazınızda bulunur ve QoreChain Association'ın bunların bir kopyası, bir ana anahtarı ya da cüzdanınızı sıfırlama veya geri yükleme yolu yoktur. **"Şifremi unuttum" akışı, destek talebi ya da müşteri hizmetleri geçersiz kılması yoktur** - yedek olmadan anahtarlarınıza erişimi kaybederseniz, fonlar kalıcı ve geri döndürülemez şekilde kaybolur. Bu QoreX'e özgü bir kısıtlama değil, her saklayıcısız cüzdan için geçerlidir, ama açıkça belirtmekte fayda var.

**Aşağıdakilerden en az birini yapın - cüzdanınızı oluşturduktan hemen sonra, sonraya bırakmadan:**

1. **24 kelimelik kurtarma ifadenizi yazıya dökün** ve çevrimdışı, dayanıklı bir yerde saklayın (bir ekran görüntüsü değil, buluta senkronize bir not değil, kendinize gönderilen bir mesaj değil). Cüzdanınızı herhangi bir cihazda, herhangi bir zamanda geri yükleyebilecek tek şeydir - mobilde **Ayarlar → Güvenlik → Kurtarma ifadesini göster** yolundan görüntüleyin (uygulama cüzdanı oluştururken ifadeyi **göstermez**, bu yüzden gidip kendiniz almanız gerekir - hemen yapın); eklentide cüzdanı oluşturduğunuzda bir kez gösterilir ve sonrasında istediğiniz zaman açılır penceredeki **Kurtarma ifadesini göster** üzerinden görüntülenebilir. Bkz. [Mevcut bir cüzdanı geri yükleyin](/qorex/getting-started#2-restore-an-existing-wallet).
2. Güvendiğiniz koruyucularla **[sosyal kurtarma](#social-recovery)** kurun. Bu, ifadeyi kaybetseniz bile cüzdanınızı kurtarmanızı sağlar ve hiçbir tek koruyucu tek başına fonlarınıza erişemez.

İkisini birden yapmak en güvenli seçenektir - ifade, cihaz değiştirdiğinizde veya uygulama kullanılamaz olduğunda sizi korur; koruyucular ise ifadenin kendisini kaybettiğinizde sizi korur.

**Uygulamayı kaldırmak, anahtarlarınızı o cihazdan siler.** Mobil uygulamanın kasası ve tarayıcı eklentisinin kasası, yalnızca kendilerini oluşturan cihazda bulunur. Uygulamayı kaldırmak, telefonu sıfırlamak veya eklentiyi kaldırmak/temizlemek bu kopyayı siler - yedek ve bağlı cihaz olmadan, cüzdanınız QoreChain dahil kimse tarafından kurtarılamaz. **Bir cüzdanı telefondan veya tarayıcıdan kaldırmak** (Ayarlar → Cüzdanlar → *Bu telefondan kaldır* veya eklentide *Bu tarayıcıdan kaldır*) o cüzdanın anahtarını cihazdan aynı şekilde siler - fonlarınız zincirde kalır, ancak onu yalnızca kurtarma ifadesi geri getirebilir.
:::

## ML-DSA-87 anahtarı {#pqc-key}

**Güvenlik** ekranı, ML-DSA-87 anahtarınızın canlı zincir üstü durumunu gösterir: **"İlk transferinizle kaydolur"** → **"Zincir üstünde kayıtlı ✓"**. Algoritma **ML-DSA-87**'dir (deterministik, secp256k1 ile hibrit).

Web siteleri QoreX'ten ML-DSA-87 anahtarınızı kaydetmesini, taşımasını veya döndürmesini isteyemez. Kayıt, ilk transferinizle kendiliğinden gerçekleşir ve sizden hiçbir şey gerektirmez - v3.2.3'ten beri zincir, kayıtla birlikte isteğe bağlı bir *sahiplik kanıtı* da kabul eder; QoreX bunu güncel mağaza sürümlerinde görünmez şekilde halleder. Ayrıca [anahtarı döndürebilir](#pqc-rotation) veya artık imzalayamayan bir kaydı [onarabilirsiniz](#pqc-repair). Alttaki mekanizma için bkz. [Anahtar rotasyonu](/developer-guide/post-quantum-signing#key-rotation).

### Artık imzalayamayan bir anahtarı onarma {#pqc-repair}

Nadir durumlarda ağın hesabınız için tuttuğu anahtar kaydı **boş, yalnızca klasik veya dejenere** olur ve hesaptan hiçbir şey gönderilemez. QoreX iki durumu ayırır: **başka bir cüzdan** tarafından kaydedilmiş bir anahtar bu şekilde bildirilirken, **artık imzalayamayan** bir kayıt için **Ana Sayfa** ekranında (uygulama) veya açılır pencerenin ana ekranında (eklenti ve Safari) bir onarım kartı çıkar.

1. Kartı okuyun: *"Bu hesabın ağdaki kuantum sonrası anahtarı artık imza atamıyor, bu yüzden bu hesaptan hiçbir şey gönderilemez. Anahtarı yeniden kaydetmek sorunu çözer."* Kart ağ ücretini, **0,09 QOR**, gösterir ve hesabın bir EVM penceresi varsa ağın onu kapattığını söyler (sonrasında yenisini açın).
2. **Anahtarı yeniden kaydet**'e dokunun.
3. Yeniden dokunun (*Kaydetmek için tekrar dokunun (ücret 0,09 QOR)*). Uygulamada biyometri ile onaylayın.

Onarım **asla otomatik değildir**: her zaman iki dokunuş gerekir. Yalnızca klasik anahtarınızla imzalanan anahtar kaydını gönderir. Ardından QoreX *"Anahtar yeniden kaydedildi. Bu hesap yeniden gönderim yapabilir."* der.

### Kuantum sonrası anahtarı döndürme {#pqc-rotation}

**Kuantum sonrası anahtarı döndür**, hesabın ağdaki ML-DSA-87 anahtarını **kurtarma ifadenizden türetilen bir sonraki anahtarla** değiştirir. Uygulama: **Ayarlar → Güvenlik → Kuantum sonrası anahtarı döndür**. Eklenti ve Safari: açılır pencerenin ana ekranındaki **Kuantum sonrası anahtarı döndür** düğmesi. Dokunun, ardından onaylamak için yeniden dokunun (*Anahtarı döndürmek için tekrar dokunun*); uygulama ayrıca biyometri ister. İşlem hem mevcut hem de yeni anahtarla imzalanır ve bir simülasyondan alınan ağ ücreti sonuçta gösterilir.

- Sızmış bir kuantum sonrası anahtara **karşı korur**.
- Sızmış bir kurtarma ifadesine **karşı korumaz**. İfadenize sahip olan kişi bu anahtarların hepsini türetebilir. Bu durumda fonlarınızı yeni ifadeli yeni bir cüzdana taşıyın.
- **Aynı ifadeyi kullanan diğer cüzdanlar**, döndürülmüş anahtarları destekleyene kadar bu hesap için imzalayamaz.
- **Ağ, hesabın EVM penceresini kapatır.** İhtiyacınız varsa yenisini açın.
- **Geri yükleme yine çalışır.** QoreX, ifadenizin türetebileceği anahtarlar arasında ağın tuttuğunu arar, böylece geri yüklenen bir cüzdan döndürülmüş anahtarla imzalar.

Rotasyon asla otomatik değildir ve web siteleri bunu isteyemez.

## Multisig hesapları {#multisig}

Bir **multisig hesabı**, birkaç üyenin imzalamasını gerektirir. QoreX, kuantum sonrası multisig'i mainnet ve testnet'te, **QoreChain komut satırıyla aynı dosyaları** kullanarak destekler; böylece her üye QoreX'te veya komut satırı aracında imzalayabilir. Uygulama: **Ayarlar → Güvenlik → Çoklu imza hesapları**. Eklenti ve Safari: açılır pencerenin ana ekranındaki **Çoklu imza hesapları**.

**Oluşturma veya ekleme**

1. **Çoklu imza oluştur:** üye adreslerini (`qor1...`) her satıra bir tane girin, gereken imza sayısını (eşik) ve isteğe bağlı bir ad belirtin, ardından **Kaydet**. Her üyenin en az bir işlem göndermiş olması gerekir.
2. Veya **Mevcut çoklu imzayı ekle:** multisig anahtarını yapıştırın (komut satırının `keys show <name> -p` çıktısı veya QoreX'ten paylaşılan bir anahtar). **Çoklu imza anahtarını paylaş** onu diğer üyelere gönderir.

**Durumunu kontrol edin.** Hesap ekranı bakiyeyi, **kuantum sonrası üye kümesinin** kayıtlı olup olmadığını (ve sürümünü), kullanımdaki hesabın üye olup olmadığını ve her üye için anahtarının hazır, eksik, artık imzalayamaz, kanıtsız kaydedilmiş veya kontrol edilememiş olup olmadığını gösterir. Üye kümesi kaydedilene kadar hesap gönderim yapamaz.

**İki turda imzalama**

1. **Kaydı hazırla** (önce, bir kez) veya **Gönderim hazırla**. QoreX gas'ı bir simülasyondan alır ve bir dosya oluşturur. Eklentide ve Safari'de dosya **indirilir**; uygulamada **metin olarak paylaşılır**. Onu diğer üyelere gönderin.
2. **1. tur.** Her kuantum sonrası üye dosyayı açar (**Üyelerden gelen dosyaları aç**), inceler ve **Kuantum sonrası üye olarak imzala**'yı seçer. Uygulamada üyeler aldıkları metni **yapıştırır**; eklentide dosyayı açarlar.
3. Üye imzalarını **birleştirin**.
4. **2. tur.** Klasik olarak imzalayacak üyeler seçilir (tam olarak eşik sayısı kadar ve hepsi için aynı seçim) ve her biri inceleyip **Klasik olarak imzala**'yı seçer. Yeniden birleştirin.
5. **Ağa gönder.**

Her imzalama adımı önce neyi imzaladığınızı gösterir ve **iki dokunuş** gerektirir; uygulama ayrıca biyometri ister. Bir işlem bir **authenticator** kaydedecekse QoreX sizi uyarır: bir authenticator, multisig'in fonlarını diğer üyelerin imzaları olmadan taşıyabilir. Diğer işlem türlerini bir dosyadan çevrimdışı imzalamak için [Geliştirici modundaki](/qorex/developer-mode) çevrimdışı ve multisig çalışma alanına bakın.

## Sosyal kurtarma {#social-recovery}

Sosyal kurtarma, güvenilir **koruyucuların** kurtarma ifadenizi hiç görmeden cüzdanınızı geri yüklemenize yardımcı olmasını sağlar.

- Tohumunuz **şifreli paylara** (ML-KEM ile mühürlenmiş) bölünür: varsayılan olarak üç tane, bunlardan herhangi **ikisi** kurtarmanıza yardımcı olabilir (2-of-3 eşik şeması); tek başına biri olamaz.
- Her koruyucu bir kimlik bilgisi alır.
- **Kurtarma kiti.** Tohumunuzun şifreli kopyası sizin sakladığınız **kurtarma kitinizdir** (`qorexkit1:` ile başlar). Koruyucular tek başlarına cüzdanı geri yükleyemez: bu kite de ihtiyaçları vardır ve kit onlar olmadan tek başına işe yaramaz. Yeni kurulumlar kurtarma hizmetine yalnızca koruyucu sayısını ve eşiği gönderir. Bkz. [Kurtarma kiti](#recovery-kit).
- Bir kurtarma, koruyucuların eşik sayısının onayını gerektirir, ardından **48 saatlik bir zaman kilidi** çalışır ve size bir **iptal uyarısı** gönderilir, böylece kötü niyetli bir girişim durdurulabilir.

**Kurulum:** Ana Sayfa → **Kurtarmayı ayarla** (veya Ayarlar → Güvenlik → Sosyal kurtarma) → **Koruyucu kimlikleri oluştur**. QoreX üç kimlik bilgisi oluşturur - *Koruyucu 1*, *Koruyucu 2* ve bir *Yazdırılabilir yedek* - ve **3 taneden herhangi 2'si** kurtarmanıza yardımcı olabilir. Güvendiğiniz her kişiye veya cihaza birer tane verin ve yazdırılabilir yedeği güvenli bir yerde saklayın. Ardından aşağıda anlatıldığı gibi kurtarma kitini kaydedin. Kurulum tamamlandığında Yedek durumu uyarısı temizlenir.

### Kurtarma kiti {#recovery-kit}

Kurulumun sonunda QoreX **kurtarma kitinizi** gösterir. **Kurtarma kitini kopyala** veya **Paylaş veya kaydet** seçeneğini kullanın ve bir kopyasını denetiminizdeki bir yerde ve **yalnızca bu telefonda olmayacak şekilde** saklayın (bir parola yöneticisi, bir not, bir çıktı). **Tamam** çalışmadan önce *Kurtarma kitini bu telefonun dışında bir yere kaydettim* kutusunu işaretlemeniz gerekir. Kurtarmak için **kurtarma kimliğini veya kurtarma kitini** yapıştırın.

Sosyal kurtarmayı daha eski bir sürümle kurduysanız QoreX, kitinizin şifreli bir kopyasının hâlâ kurtarma hizmetinde olduğunu söyleyebilir. Kiti kaydedin, ardından **Kopyayı aktarıcıdan sil**'i seçin. Koruyucularınızın kimlik bilgileri çalışmaya devam eder. Kaldırıldıktan sonra kit yalnızca sizde olur.

**Başkasının kurtarmasını onaylama:** birinin koruyucusuysanız, isteğini onaylamak için Ana Sayfa sekmesindeki **Kurtarmaya yardım et**'i kullanın.

## Legacy Protocol {#legacy}

**Legacy Protocol**, koruyucularınız üzerinde kurulu bir ölü adam anahtarıdır (dead-man's switch): ulaşılamaz hale gelirseniz varlıklarınız seçtiğiniz yararlanıcıya geçebilir. İsteğe bağlıdır ve Ayarlar → Güvenlik'ten yapılandırılır.

## Yeni bir cihaz bağlayın {#link-device}

Cüzdanınızı ikinci bir telefona veya tablete, **sunucu olmadan ve 24 kelimeyi yazmadan** taşıyın:

1. **Yeni cihaz** → katılım (onboarding) → **Başka bir cihazdan bağlan**. Tek seferlik bir **10 karakterlik kod** gösterir ve kamerayı açar.
2. **Eski cihaz** → Ayarlar → Güvenlik → **Yeni bir cihaz bağla** → bu kodu yazın → biyometri ile onaylayın. Bir **QR kodu** görünür (tohumunuz koddan türetilmiş bir anahtarla mühürlenir: scrypt N=2¹⁷ → AES-256-GCM).
3. **Yeni cihaz** QR'ı tarar → yerel olarak şifresini çözer → aynı cüzdan, aynı adresler.

**QR'ın bir fotoğrafı neden yeterli değil:** kod ve QR asla aynı ekranda görünmez. QR'ın tek başına bir fotoğrafı, bellek-zor bir anahtar türetme fonksiyonunun arkasındaki şifreli metindir ve her iki eser de tek seferliktir ve ekranlarla birlikte kaybolur. Yanlış bir kod temiz bir hata verir - sadece tekrar deneyin.

:::note
Cihaz bağlama bir **kolaylıktır**, bir kurtarma yöntemi değildir. 24 kelimelik ifadeniz ve sosyal kurtarma gerçek güvenlik ağlarınızdır.
:::

## EVM erişim penceresi {#evm-window}

Zincir **v3.2.0**'dan itibaren, **EVM hattındaki (lane)** bir işlem - örneğin QoreChain'in EVM ağında MetaMask ile imzaladığınız bir işlem - yalnızca **kayıtlı bir ML-DSA-87 anahtarı** *ve* **açık bir yetkilendirme penceresi** (hibrit imzalı bir `MsgOpenEVMWindow`) olan bir hesaptan kabul edilir. EVM işleminin kendisi yalnızca bir secp256k1 imzası taşır. Gezgin böyle bir işlemi "Authorised by a PQC window" olarak etiketler. Pencere açmak, MetaMask'in üretemediği bir QoreChain Native hattı mesajıdır; bu yüzden pencereyi açacağınız yer QoreX'tir. QoreX'in kendi gönderimleri Native hattını kullanır ve hiçbir zaman pencere gerektirmez.

**Kimin ihtiyacı var.** Bir pencere, **Ethereum tarzı (coin 60) hesaplar** içindir - ilk olarak MetaMask'ta kullanılmış bir ifade için *Ethereum hesabı ekle (coin 60)* ile eklediğiniz hesaplar (bkz. [MetaMask'tan veya Dashboard'dan bir ifadeyi geri yükleme](/qorex/getting-started#restore-dashboard)). MetaMask bir Ethereum anahtarıyla imzalar; bu, bir coin-60 hesabının anahtarıdır. Hiçbir MetaMask anahtarı sıradan bir coin-118 `qor1…` hesabından gönderemez; bu yüzden ona açılan bir pencere hiçbir işe yaramaz ve yalnızca ücrete mal olur.

Pencere kullanamayan bir hesaptaysanız ekran atılacak adımları listeler ve **Hesapların** düğmesi sunar.

Bir pencere iki şekilde açılır: **kendiniz açarsınız** (aşağıda) ya da bir site onaylamanızı istediğinde [QoreX tek bir işlem için bir pencere açar](#per-transaction-windows).

Uygulamada **Ayarlar → Güvenlik → EVM erişim penceresi** yolundan veya eklenti açılır penceresindeki **EVM erişim penceresi** düğmesiyle açın. Önce **pencerenin neyi kabul edeceğini** seçin:

- **Yalnızca QOR transferleri** (varsayılan, önerilen): sözleşme çağrısı yok, yeni sözleşme yok, sözleşme olan alıcı yok.
- **Herhangi bir sözleşme:** uyarılı ayrı bir seçim: *"Herhangi bir sözleşme çağrılabilir. Harcama sınırı yalnızca QOR sayar: bir sözleşmenin taşıdığı tokenler, NFT'ler ve onaylar pencereyle sınırlanmaz."*

Ağ bir pencereyi QOR transferleriyle sınırlayamıyorsa QoreX bunu söyler ve bunun yerine herhangi bir sözleşme için açılıp açılmayacağını sorar. Siz tam olarak buna evet diyene kadar hiçbir şey açılmaz.

Ardından şunları seçersiniz:

| Alan | Anlamı | Sınır |
|---|---|---|
| **Ne kadar süre (blok, en fazla 17280)** | pencerenin ne kadar açık kalacağı | 17.280 bloğa kadar (mainnet'te yaklaşık 15 saat) |
| **Kaç işlem (en fazla 1000)** | kaç EVM işlemine izin verdiği | 1.000'e kadar |
| **Harcama sınırı, QOR** | dışarı çıkmasına izin verdiği en yüksek QOR | **bu hesaptan çıkan tüm QOR'u, artı her azami ücreti** sayar; token'lar sayılmaz |

Bu ekranda belirli sözleşmeleri adlandıramazsınız; belirli sözleşmelerle sınırlı pencereler QoreX tarafından tek bir işlem için açılır (aşağıda). Varsayılanlar 300 blok (mainnet'te yaklaşık 16 dakika), 5 işlem ve 1 QOR'dur. Pencereyi açmak normal bir ağ ücretine mal olur ve olağan hibrit imzayla (secp256k1 ve ML-DSA-87) imzalanır; yeni bir pencere, zaten açık olan pencerenin **yerini alır**. Açmak hesabınızın nonce değerini de ilerletir; bu yüzden pencereyi **önce** açın, sonra MetaMask'ten gönderin - daha önce hazırlanmış bir işlem "nonce too low" ile reddedilir. **Pencereyi kapat** yalnızca bir pencere canlıyken sunulur.

**Açık bir pencere neyi kabul ettiğini tam olarak söyler:** *Kabul eder: yalnızca QOR transferleri*, *Kabul eder: herhangi bir sözleşme (tokenler sınıra sayılmaz)* veya *Kabul eder: yalnızca \{targets\}*. Son durumda QoreX, **listelenen bir sözleşmenin yine de hesap adına hareket edebileceğini**, elinde tuttuğu veya onlara onaylanan token'ları taşımak dahil, ve QOR sınırının bunu kapsamadığını ekler.

Ekran dört durumdan birini gösterir: *\{blocks\} blok daha · \{txs\} işlem · \{value\} QOR kalana kadar açık*; *Hiçbir pencere açık değil. Bu hesaptan gelen MetaMask işlemleri reddedilir.*; *Bu pencerenin süresi doldu veya tükendi*; ya da *QoreX pencereyi ağdan okuyamadı* - bu, QoreX'in bilmediği anlamına gelir, hiç pencereniz olmadığı anlamına **gelmez**. Hesabınızın henüz ML-DSA-87 anahtarı yoksa önce bir tane kaydedin (ilk QoreX transferiniz bunu yapar); ondan önce bir pencere işe yaramaz.

:::caution Küçük ve kısa tutun
Bir pencere, sıradan MetaMask işlemlerinin QOR'unuzu **yalnızca secp256k1 imzasıyla** taşımasına izin verir. Sınırları düşük tutun - küçük bir harcama sınırı, az işlem, kısa bir süre - bir sözleşmeye ihtiyacınız yoksa **Yalnızca QOR transferleri**'ni seçin ve işiniz bitince pencereyi kapatın. Sınır, azami ücret dahil hesaptan çıkan tüm QOR'u kapsar; bu yüzden sınırı aşacak bir işlem reddedilir. Token'ları kapsamaz.
:::

### Tek bir işlemlik pencereler {#per-transaction-windows}

Bir site QoreX'ten QoreChain'de bir EVM işlemi göndermesini istediğinde ve onu kapsayan açık bir pencere yoksa onay, hibrit ML-DSA-87 anahtarınızla imzalanan **tam olarak o işlem için** bir pencere açar:

- tek işlem, değer **artı azami ücrete** kadar, yaklaşık on dakika;
- ağın desteklediği yerde, çağırdığı sözleşmelerle sınırlı;
- onay, pencerenin kabul edeceği **her sözleşmeyi adıyla belirtir** (yakın zamanda size bir permit imzalatan sözleşmeler dahil) ve **açık olan herhangi bir pencerenizin yerini aldığını** söyler;
- QOR sınırı, azami ücret dahil hesaptan çıkan tüm QOR'u kapsar ve listelenen bir sözleşme yine de hesap adına hareket edebilir (elinde tuttuğu veya onaylanan token'ları ya da diğer sözleşmelerin tuttuğu QOR'u taşıyabilir);
- ağ sözleşmelerle sınırlı bir pencereyi kabul etmezse QoreX, bu sınır olmadan bir pencere açmadan önce **ikinci kez sorar**. Hayır demek hiçbir şey açmaz ve hiçbir şey göndermez.

QoreChain'deki bir sözleşmenin kontrol ettiği bir typed-data imzası (permit) de benzer şekilde o sözleşmeyi listeleyen kısa bir pencere açar. İşlem geçmişinde bir EVM işlemi pencereden ne kadar kullandığını gösterir. Geliştirici bakışı için [dApp entegrasyonu](/qorex/dapp-integration) sayfasına bakın. Sözleşme çağıran bir uygulamayla MetaMask veya başka bir EVM cüzdanı kullanıyorsanız, pencereyi kendiniz açarken **Herhangi bir sözleşme** seçeneğini seçin. İşlemlerini QoreX üzerinden gönderen bir uygulama, önceden pencere açılmasını gerektirmez. Elle açılan pencere gibi bu da Ethereum tarzı (coin 60) hesaplar için geçerlidir.

(*Diğer* ağlarda ETH, BNB ve başka varlıklar göndermek farklı bir şeydir - bkz. [Harici ağlar ve token'lar](/qorex/send-and-receive#external-networks-tokens).)

## Onay penceresinin gösterdikleri {#approvals}

QoreX'in ürettiği her imza sizin tarafınızdan onaylanır ve onay, tam olarak neyi imzaladığınızı listeler. QoreX şunları gösterir:

- istekteki **her mesaj** için bir başlık ve etiketli alanlar; bir authz **MsgExec** içine yerleştirilmiş mesajlar ve izin verme koşulları dahil - ve gösteremediği her şeyi **reddeder** ("QoreX cannot read this message … Approve only if you trust this site completely");
- **ücret** (*Fee: \{amount\} · gas \{gas\}*), onu kimin ödediği ve varsa ücret desteği (fee grant) - ücret okunamıyorsa QoreX bunu söyler ve onaylamamanızı bildirir;
- harcama izinlerinin ve authz yetkilerinin **sınırı, izin verilen eylemi ve son kullanma tarihi**; *UNLIMITED* ve *NEVER* açıkça yazılır; son kullanma tarihi saniyesine kadar gösterilir (`YYYY-MM-DD HH:MM:SS UTC`). İzin verilen eylemi dikkatle okuyun: izin verilen mesajları arasında `MsgExec` bulunan bir ücret izni (`AllowedMsgAllowance`), hak sahibinin onun üzerinden yürütebileceği her mesajı kapsar ve genel bir authz yetkisi adını verdiği mesaj türünün tamamını kapsar. Bir yönetişim oyu çözülür, böylece neye oy verdiğinizi görürsünüz. Okunamayan, sınırsız veya sonsuz olan her şey Onayla üzerinde **ikinci bir dokunuş** gerektirir (*Tap again to approve*);
- birden fazla hesabınız olduğunda imzalayan hesap (*Signed by …*);
- çok sayıda mesaj içeren bir istekte, ilk 50 mesaj ve geri kalanların sayısı.

**EVM** istekleri için QoreX işlemi veya typed data'yı çözer (transfer, *UNLIMITED* açıkça yazılmış onay, permit ve diğerleri) ve bilinmeyen çağrı ve türleri ikinci bir dokunuşla yüksek riskli olarak ele alır. Ağın izin verdiği yerde simüle eder. QoreChain'in EVM düğümü yalnızca veri taşıyan bir çağrının başarısız olmayacağını kontrol edebilir; bu yüzden onay *"What it does to your tokens was not checked. Approve only if you trust this site."* der ve ikinci bir dokunuş gerektirir. Başarısız olacak veya simüle edilemeyen bir işlem de ikinci bir dokunuş gerektirir. Bir sözleşme çağıran native istekler onaydan önce simüle edilir ve sözleşmenin reddedeceği bir çağrı zincirin nedeniyle reddedilir. Onay ekranları memo'yu gösterir ve mesajın tamamını açmanıza imkân verir.
QoreX ayrıca **baytları iki şekilde okunabilen bir isteği de reddeder** (1.1.7 / 0.3.7'den beri). Bir kez görünmesi gereken bir alanı tekrarlayan bir istek - örneğin iki katına çıkarılmış bir ücret veya tutar - bir şekilde gösterilip başka bir şekilde yürütülebilir; bu yüzden QoreX onay için onu hiç göstermez. Web siteleri için QoreX, isteyen siteyi isteğin kendisi hakkında söylediğiyle değil, tarayıcının kendisinin doğruladığı kaynak (origin) ile tanımlar.

Bir cüzdan veya hesap değişikliği ya da cüzdanı kilitlemek, bekleyen isteklere "hayır" yanıtı verir; bir site tek bir isteği bekletebilir ve toplamda üç istek bekleyebilir. Onay pencerelerindeki alan adları bazı sürümlerde İngilizce gösterilir.

### Bir sitenin asla isteyemeyecekleri {#never-requested}

Bu işlemler **yalnızca QoreX'in kendi ekranlarından** yapılabilir. Site ne derse desin QoreX bunları her web sitesinden reddeder:

- kuantum sonrası anahtar yönetimi (kaydetme, taşıma, döndürme);
- authenticator'lar (bağlı imzalayıcılar) ve harcama kuralları;
- bir EVM erişim penceresini açma, kapatma veya temizleme;
- QoreChain üzerinde Solana penceresi ve iletim mesajları;
- birinin hesabınız gibi başka izinler **vermesine** veya mesajlar **yürütmesine** olanak tanıyacak bir izin (authz). Böyle bir yetki, alanın sizin yerinize hareket etmesine izin verirdi. QoreX bunu doğrudan, herhangi bir derinlikte `MsgExec` içine sarılmış olarak veya genel yetki olarak reddeder.

## Benzer görünen adresler {#look-alike}

Dolandırıcılar, yanlış adresi kopyalamanız umuduyla, kullandığınız bir adresle aynı şekilde başlayıp biten adreslerden küçük tutarlar gönderir. QoreX, bir alıcıyı hem QoreChain'de hem de harici ağlarda bildiğiniz adreslerle (kayıtlı kişiler, kendi hesaplarınız ve ödeme yaptığınız adresler) karşılaştırır ve bunlardan birine yalnızca **benzeyen** bir adresi göndermeden önce işaretler. Memo'sunda bağlantı bulunan olası spam de Geçmiş'ten gizlenir. Bkz. [Kişiler ve favoriler](/qorex/send-and-receive#contacts) ve [Geçmiş](/qorex/send-and-receive#history).

## Otomatik kilit {#auto-lock}

QoreX bir süre kullanılmadığında kendini kilitler. **Otomatik kilitleme süresi** altında **1, 5, 15, 30, 60 dakika veya 4 saat** seçin; varsayılan **15 dakikadır**. Uygulama: Ayarlar → Güvenlik; süre dolduktan sonra QoreX herhangi bir şey göstermeden önce yeniden biyometri ister. Eklenti ve Safari: ayar, açılır pencerenin ana ekranında bir **Kilitle** düğmesinin yanındadır; süre dolduktan sonra parolanızı yeniden girersiniz.
## Kurtarma ifadeniz ve erişilebilirlik araçları {#phrase-privacy}

Kurtarma ifadesi ekranı her seferinde yeni bir biyometrik veya cihaz PIN'i ister, kelimeleri **kopyalama düğmesi olmayan**, numaralandırılmış, salt okunur bir ızgara olarak gösterir, Android'de ekran görüntülerine karşı engellenir ve uygulama değiştiriciden gizlenir. **Android 14 ve sonrasında**, kelimeler gerçek erişilebilirlik araçları olmayan erişilebilirlik hizmetlerinden de saklanır (TalkBack ve diğer gerçek ekran okuyucular bunları yine de okuyabilir). Daha eski Android sürümlerinde ve iOS'ta kelimeler varsayılan olarak ekran okuyuculardan gizlenir; bir ekran okuyucuya güveniyorsanız, onların okumasına izin vermek için o ekrandaki bildirime dokunun. İfadeyi yalnızca kimse ekranınızı göremiyorken gösterin.

## Bağlı dApp'ler {#connected-dapps}

dApp bağlantıları **köken başına (per-origin)** yapılır ve siz kaldırana kadar sürer. Uygulamada **bu cihazda, cüzdan başına** kaydedilir (yalnızca sitenin adresi); onları [Paramın korunması](#protection) ekranında görün ve iptal edin. Tarayıcı eklentisinde ve Safari'de, bu cüzdanın onayladığı her siteyi görmek ve herhangi birini **iptal etmek** için açılır penceredeki **Bağlı siteler**'i açın.

## Bağlı imzalayıcılar ve harcama limitleri {#linked-signers}

Harici bir anahtarı (Phantom veya MetaMask) kendi harcama limitleriyle bir **bağlı imzalayıcı** olarak bağlamak **henüz QoreX içinde kullanılamıyor** - Ayarlar → Güvenlik kartı gösterir, eylem *yakında* olarak işaretlidir. QoreX dışında kendiniz yapmadıysanız cüzdanınıza hiçbir şey bağlı değildir. Anahtar yönetimi hiçbir zaman bağlı bir anahtara devredilemez. Zincir üstü model için bkz. [Bağlı Cüzdan Doğrulayıcıları](/developer-guide/account-abstraction#authenticators).

## Q-Day Tarayıcı {#q-day-scanner}

**Q-Day Tarayıcı**, herhangi bir adresi - sizinkini ya da başka birininkini - girmenize ve herhangi bir Bitcoin veya Ethereum adresi için bir maruziyet raporu almanıza olanak tanır. Ana Sayfa hızlı düğmelerinden ulaşın. Bir **Bitcoin** adresini kontrol etmek için QoreX, başkasının işlettiği ve adresi ile IP adresinizi gören blockstream.info hizmetine sormak zorundadır. Tarayıcı hizmetin adını söyler ve yalnızca siz kabul ettikten sonra tarar.

## Yardım ve destek {#support}

Uygulama: **Ayarlar → Destek**. Eklenti ve Safari: açılır pencerenin ana ekranındaki **Destek**. Ekran **yalnızca resmi kanalları** listeler ve karşılaştırabilmeniz için her tam adresi gösterir:

- Telegram topluluğu: [https://t.me/QorechainCommunity](https://t.me/QorechainCommunity)
- Discord: [https://discord.gg/qorechain](https://discord.gg/qorechain)
- Yardım sayfası: [https://qorechain.io/help/qorex](https://qorechain.io/help/qorex)
- E-posta: team@qorechain.io
- Güvenlik açığı bildirin: [https://qorechain.io/security](https://qorechain.io/security)

:::danger QoreX personeli kurtarma ifadenizi asla istemez
*"QoreChain ekibi kurtarma ifadeni, parolanı veya anahtarlarını ASLA istemez. İsteyen herkes dolandırıcıdır."* Bu, QoreX desteğini de kapsar.
:::

Aynı ekranda, **yalnızca destek isterse** kopyalayacağınız isteğe bağlı bir **tanılama özeti** vardır. Uygulama sürümünü, ağı ve hata kodlarını içerir: ifade, anahtar, adres veya bakiye içermez.
## Kısaca güvenlik modeli

1. **Saklayıcısız (Non-custodial)** - anahtarlar cihaz üzerinde üretilir, donanım destekli kasalarda (mobil) ya da şifreli bir kasada (eklenti) yaşar ve asla dışarı çıkmaz.
2. **Onay olmadan hiçbir şey** - her bağlantı köken başınadır, her imza tek tek onaylanır (mobilde biyometrik ile) ve yükler imzalanmadan önce çözülür. QoreX'in okuyamadığı reddedilir veya açıkça işaretlenip ikinci bir dokunuşun arkasında tutulur.
3. **Hibrit imzalı native hat.** Her native QOR transferi iki kez imzalanır: klasik bir anahtarla ve ML-DSA-87 (FIPS 204) ile. Klasik olan her şey (harici ağlar, EVM) etiketlenir, asla sessiz geçmez.
4. **Analitik yok, çökme raporlama yok, izleme SDK'sı yok.** Anahtarlar, kurtarma ifadesi, kasa ve onaylar cihazdan asla çıkmaz. İsteğe bağlı oturum açma, anlık bildirimler ve sosyal kurtarma yalnızca siz açtığınızda bir sunucu kullanır; QoreX'in gönderdiklerinin tam listesi [QoreX'in ağ üzerinden neler gönderdiği](/qorex/overview#data-and-privacy) bölümündedir ve [QoreChain gizlilik politikası](https://qorechain.io/privacy) bunu kapsar.
5. **Kurtarma yolları** - 24 kelimelik ifade (her zaman), koruyucularla sosyal kurtarma + 48 saatlik zaman kilidi (isteğe bağlı), Legacy mirası (isteğe bağlı), cihaz bağlama (kolaylık).

## Sınırlar ve bilinen sorunlar {#limits}

- Sosyal kurtarma, Legacy, cihaz bağlama ve Q-Day Tarayıcı yalnızca mobildedir.
- Kuantum sonrası anahtarı döndürmek, sızmış bir kurtarma ifadesine karşı değil, sızmış bir kuantum sonrası anahtara karşı korur. Aynı ifadeyi kullanan diğer cüzdanlar, döndürülmüş anahtarları destekleyene kadar döndürülmüş bir hesap için imzalayamaz.
- Harcama limitli bağlı imzalayıcılar henüz QoreX içinde kullanılamıyor.
- Elle açılan EVM penceresi ekranı yalnızca "Yalnızca QOR transferleri" veya "Herhangi bir sözleşme" sunar. Bir pencerenin QOR sınırı token'ları asla sınırlamaz.
- Token onayları yalnızca QoreChain'in EVM'inde kontrol edilir ve bunları iptal etmek bir coin-60 hesabı gerektirir.
- Cihaz bağlama bir kolaylıktır, bir kurtarma yöntemi değildir. Yazılı ifadesi ve sosyal kurtarması olmayan kayıp bir cüzdan kimse tarafından kurtarılamaz.
- Onay penceresi bazı alan adlarını bazı sürümlerde İngilizce gösterir.
