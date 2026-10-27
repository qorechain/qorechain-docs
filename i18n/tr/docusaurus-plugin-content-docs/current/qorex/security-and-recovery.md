---
slug: /qorex/security-and-recovery
title: Güvenlik ve Kurtarma
sidebar_label: Güvenlik ve Kurtarma
sidebar_position: 5
---

# Güvenlik ve Kurtarma

Bu sayfa QoreX'in anahtarlarınızı nasıl koruduğunu ve bir cüzdanı nasıl geri alacağınızı anlatır: ML-DSA-87 anahtarı, sosyal kurtarma, Legacy, cihaz bağlama, EVM erişim penceresi, onayların gösterdikleri ve Q-Day Tarayıcı. Her QoreX kullanıcısı içindir; kurtarma araçlarının çoğu mobil uygulamadadır.

## Yenilikler {#innovations}

- **Şifreli paylarla sosyal kurtarma.** Vasiler, tohumunuzun ML-KEM ile mühürlenmiş ve 3 paydan 2'si gerekecek şekilde bölünmüş şifreli paylarını tutar. Bir kurtarma 48 saatlik bir zaman kilidi çalıştırır ve sizi uyarır; iptal edebilirsiniz ve bir iptal yalnızca geciktirebilir, asla fon taşıyamaz. Aktarıcı (relay) yalnızca opak zarfları saklar.
- **Legacy.** Seçtiğiniz bir yararlanıcı için vasileriniz üzerine kurulu bir ölü adam anahtarı (dead-man's switch).
- **Cihaz bağlama.** Tek seferlik bir kod ve bir QR, asla aynı ekranda değil. QR tek başına, bellek-zor bir anahtar türetmenin arkasındaki şifreli metindir.
- **Deterministik ML-DSA-87 anahtarı.** Aynı 24 kelimeden türetilir (`SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`), bu yüzden anahtar ayrı bir yedek gerektirmez. Bkz. [QoreSign](/qoresign/overview).
- **Sınırlı EVM erişimi.** Bir EVM işlemi yalnızca işlem sayısı, değer ve son kullanma ile sınırlı bir erişim penceresi açıkken kabul edilir.
- **Okuyamadığını reddeden onaylar.** Bkz. [Onay penceresinin gösterdikleri](#approvals).
- **Q-Day Tarayıcı.** Herhangi bir Bitcoin veya Ethereum adresi için bir maruziyet raporu.

## Nasıl kullanılır ve nerede bulunur {#how-to-use}

Aşağıdaki her şey mobil uygulamada **Ayarlar → Güvenlik** altındadır. Tarayıcı eklentisinde EVM erişim penceresi, Bağlı siteler ve onaylar vardır; sosyal kurtarma, Legacy, cihaz bağlama ve Q-Day Tarayıcı yalnızca mobildedir. QoreX ücretsizdir ve bunların hiçbiri için hesap gerektirmez; mağaza bağlantıları için [genel bakış](/qorex/overview#how-to-access) sayfasına bakın.

Ana Sayfa sekmesi ayrıca, sosyal kurtarma kurulana kadar uyarmaya devam eden bir **Yedekleme sağlığı** kartı gösterir. Kart yalnızca sosyal kurtarmayı izler: kurtarma ifadenizi yazıp yazmadığınızı bilemez, bu yüzden bunu kendiniz yapın (aşağıya bakın).

## Şimdi yedekleyin - kayıp bir cüzdanı sizin için kimse kurtaramaz {#back-up-now}

:::danger Cüzdanınızı fonlamadan önce bunu okuyun
QoreX **saklayıcısızdır (non-custodial)**: anahtarlarınız yalnızca kendi cihazınızda bulunur ve QoreChain Association'ın bunların bir kopyası, bir ana anahtarı ya da cüzdanınızı sıfırlama veya geri yükleme yolu yoktur. **"Şifremi unuttum" akışı, destek talebi ya da müşteri hizmetleri geçersiz kılması yoktur** - yedek olmadan anahtarlarınıza erişimi kaybederseniz, fonlar kalıcı ve geri döndürülemez şekilde kaybolur. Bu QoreX'e özgü bir kısıtlama değil, her saklayıcısız cüzdan için geçerlidir, ama açıkça belirtmekte fayda var.

**Aşağıdakilerden en az birini yapın - cüzdanınızı oluşturduktan hemen sonra, sonraya bırakmadan:**

1. **24 kelimelik kurtarma ifadenizi yazıya dökün** ve çevrimdışı, dayanıklı bir yerde saklayın (bir ekran görüntüsü değil, buluta senkronize bir not değil, kendinize gönderilen bir mesaj değil). Cüzdanınızı herhangi bir cihazda, herhangi bir zamanda geri yükleyebilecek tek şeydir - mobilde **Ayarlar → Güvenlik → Kurtarma ifadesini göster** yolundan görüntüleyin (uygulama cüzdanı oluştururken ifadeyi **göstermez**, bu yüzden gidip kendiniz almanız gerekir - hemen yapın); eklentide cüzdanı oluşturduğunuzda bir kez gösterilir ve sonrasında istediğiniz zaman açılır penceredeki **Kurtarma ifadesini göster** üzerinden görüntülenebilir. Bkz. [Mevcut bir cüzdanı geri yükleyin](/qorex/getting-started#2-restore-an-existing-wallet).
2. Güvendiğiniz vasilerle **[sosyal kurtarma](#social-recovery)** kurun. Bu, ifadeyi kaybetseniz bile cüzdanınızı kurtarmanızı sağlar ve hiçbir tek vasi tek başına fonlarınıza erişemez.

İkisini birden yapmak en güvenli seçenektir - ifade, cihaz değiştirdiğinizde veya uygulama kullanılamaz olduğunda sizi korur; vasiler ise ifadenin kendisini kaybettiğinizde sizi korur.

**Uygulamayı kaldırmak, anahtarlarınızı o cihazdan siler.** Mobil uygulamanın kasası ve tarayıcı eklentisinin kasası, yalnızca kendilerini oluşturan cihazda bulunur. Uygulamayı kaldırmak, telefonu sıfırlamak veya eklentiyi kaldırmak/temizlemek bu kopyayı siler - yedek ve bağlı cihaz olmadan, cüzdanınız QoreChain dahil kimse tarafından kurtarılamaz. **Bir cüzdanı telefondan veya tarayıcıdan kaldırmak** (Ayarlar → Cüzdanlar → *Bu telefondan kaldır* veya eklentide *Bu tarayıcıdan kaldır*) o cüzdanın anahtarını cihazdan aynı şekilde siler - fonlarınız zincirde kalır, ancak onu yalnızca kurtarma ifadesi geri getirebilir.
:::

## ML-DSA-87 anahtarı {#pqc-key}

**Güvenlik** ekranı, ML-DSA-87 anahtarınızın canlı zincir üstü durumunu gösterir: **"İlk transferinizle kaydolur"** → **"Zincir üstünde kayıtlı ✓"**. Algoritma **ML-DSA-87**'dir (deterministik, secp256k1 ile hibrit).

**Anahtar rotasyonu** - ML-DSA-87 anahtarınızı döndürmek (zincir üstünde bir `MsgRotatePQCKey` işlemi) **henüz QoreX içinde kullanılamıyor**; daha sonraki bir anahtar yönetimi güncellemesiyle gelecek, yeni bir biyometrik onay gerektirecek ve **asla otomatikleştirilmeyecek**. Web siteleri QoreX'ten ML-DSA-87 anahtarınızı kaydetmesini, taşımasını veya döndürmesini isteyemez. Kayıt, ilk transferinizle kendiliğinden gerçekleşir ve sizden hiçbir şey gerektirmez - v3.2.3'ten beri zincir, kayıtla birlikte isteğe bağlı bir *sahiplik kanıtı* da kabul eder; QoreX bunu güncel mağaza sürümlerinde görünmez şekilde halleder. Alttaki mekanizma için bkz. [Anahtar rotasyonu](/developer-guide/post-quantum-signing#key-rotation).

## Sosyal kurtarma {#social-recovery}

Sosyal kurtarma, güvenilir **vasilerin** kurtarma ifadenizi hiç görmeden cüzdanınızı geri yüklemenize yardımcı olmasını sağlar.

- Tohumunuz **şifreli paylara** (ML-KEM ile mühürlenmiş) bölünür: varsayılan olarak üç tane, bunlardan herhangi **ikisi** kurtarmanıza yardımcı olabilir (2-of-3 eşik şeması); tek başına biri olamaz.
- Her vasi bir kimlik bilgisi alır. Kurulum, aktarıcıya (relay) okunabilir hiçbir şey yazmaz - yalnızca opak, mühürlenmiş zarflar.
- Bir kurtarma, vasilerin eşik sayısının onayını gerektirir, ardından **48 saatlik bir zaman kilidi** çalışır ve size bir **iptal uyarısı** gönderilir, böylece kötü niyetli bir girişim durdurulabilir.

**Kurulum:** Ana Sayfa → **Kurtarmayı kur** (veya Ayarlar → Güvenlik → Sosyal kurtarma) → **Vasi kimlik bilgileri oluştur**. QoreX üç kimlik bilgisi oluşturur - *Vasi 1*, *Vasi 2* ve bir *Yazdırılabilir yedek* - ve **3 taneden herhangi 2'si** kurtarmanıza yardımcı olabilir. Güvendiğiniz her kişiye veya cihaza birer tane verin ve yazdırılabilir yedeği güvenli bir yerde saklayın. Bu tamamlandığında Yedekleme sağlığı uyarısı temizlenir.

**Başkasının kurtarmasını onaylama:** birinin vasisiyseniz, isteğini onaylamak için Ana Sayfa sekmesindeki **Kurtarmaya yardım et**'i kullanın.

## Legacy Protocol {#legacy}

**Legacy Protocol**, vasileriniz üzerine kurulu bir ölü adam anahtarıdır (dead-man's switch): ulaşılamaz hale gelirseniz varlıklarınız seçtiğiniz yararlanıcıya geçebilir. İsteğe bağlıdır ve Ayarlar → Güvenlik'ten yapılandırılır.

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

Uygulamada **Ayarlar → Güvenlik → EVM erişim penceresi** yolundan veya eklenti açılır penceresindeki **EVM erişim penceresi** düğmesiyle açın. Şunları seçersiniz:

| Alan | Anlamı | Sınır |
|---|---|---|
| **Ne kadar süre (blok, en fazla 17280)** | pencerenin ne kadar açık kalacağı | 17.280 bloğa kadar (mainnet'te yaklaşık 15 saat) |
| **Kaç işlem (en fazla 1000)** | kaç EVM işlemine izin verdiği | 1.000'e kadar |
| **Harcama sınırı, QOR - gönderilen her tutarı VE onun azami ücretini kapsar** | geçmesine izin verdiği en yüksek tutar | değeri **artı** her işlemin azami ücretini sayar |

Zincir, v3.2.3'ten beri daha dar, *kapsamlı* pencereleri de destekler; QoreX bunlar için bir ekran sunmaz. Varsayılanlar 300 blok (mainnet'te yaklaşık 16 dakika), 5 işlem ve 1 QOR'dur. Pencereyi açmak normal bir ağ ücretine mal olur ve olağan hibrit imzayla (secp256k1 ve ML-DSA-87) imzalanır; yeni bir pencere, zaten açık olan pencerenin **yerini alır**. Açmak hesabınızın nonce değerini de ilerletir; bu yüzden pencereyi **önce** açın, sonra MetaMask'ten gönderin - daha önce hazırlanmış bir işlem "nonce too low" ile reddedilir. **Pencereyi kapat** yalnızca bir pencere canlıyken sunulur.

Ekran dört durumdan birini gösterir: *\{blocks\} blok daha · \{txs\} işlem · \{value\} QOR kalana kadar açık*; *Hiçbir pencere açık değil. Bu hesaptan gelen MetaMask işlemleri reddedilir.*; *Bu pencerenin süresi doldu veya tükendi*; ya da *QoreX pencereyi ağdan okuyamadı* - bu, QoreX'in bilmediği anlamına gelir, hiç pencereniz olmadığı anlamına **gelmez**. Hesabınızın henüz ML-DSA-87 anahtarı yoksa önce bir tane kaydedin (ilk QoreX transferiniz bunu yapar); ondan önce bir pencere işe yaramaz.

:::caution Küçük ve kısa tutun
Bir pencere, sıradan MetaMask işlemlerinin QOR'unuzu **yalnızca secp256k1 imzasıyla** taşımasına izin verir. Sınırları düşük tutun - küçük bir harcama sınırı, az işlem, kısa bir süre - ve işiniz bitince pencereyi kapatın. Yeni bir pencere açmak eskisinin yerini alır ve sınır, gönderdiğiniz her tutarı azami ücretiyle **birlikte** sayar; bu yüzden sınırı aşacak bir işlem reddedilir.
:::

QoreX'in kendisi hiçbir zaman QoreChain'in EVM hattından göndermez; bunun için açık bir pencere içinde MetaMask veya başka bir EVM cüzdanı kullanın. (QoreX'ten *diğer* ağlarda ETH, BNB ve başka varlıklar göndermek farklı bir şeydir - bkz. [Harici ağlar ve token'lar](/qorex/send-and-receive#external-networks-tokens).)

## Onay penceresinin gösterdikleri {#approvals}

QoreX'in ürettiği her imza sizin tarafınızdan onaylanır ve onay, tam olarak neyi imzaladığınızı listeler. QoreX şunları gösterir:

- istekteki **her mesaj** için bir başlık ve etiketli alanlar; bir authz **MsgExec** içine yerleştirilmiş mesajlar ve izin verme koşulları dahil - ve gösteremediği her şeyi **reddeder** ("QoreX cannot read this message … Approve only if you trust this site completely");
- **ücret** (*Fee: \{amount\} · gas \{gas\}*), onu kimin ödediği ve varsa ücret desteği (fee grant) - ücret okunamıyorsa QoreX bunu söyler ve onaylamamanızı bildirir;
- harcama izinlerinin ve authz yetkilerinin **sınırı, izin verilen eylemi ve son kullanma tarihi**; *UNLIMITED* ve *NEVER* açıkça yazılır; son kullanma tarihi saniyesine kadar gösterilir (`YYYY-MM-DD HH:MM:SS UTC`) ve bir yönetişim oyu çözülür, böylece neye oy verdiğinizi görürsünüz. Okunamayan, sınırsız veya sonsuz olan her şey Onayla üzerinde **ikinci bir dokunuş** gerektirir (*Tap again to approve*);
- birden fazla hesabınız olduğunda imzalayan hesap (*Signed by …*);
- çok sayıda mesaj içeren bir istekte, ilk 50 mesaj ve geri kalanların sayısı.

QoreX ayrıca **baytları iki şekilde okunabilen bir isteği de reddeder** (1.1.7 / 0.3.7'den beri). Bir kez görünmesi gereken bir alanı tekrarlayan bir istek - örneğin iki katına çıkarılmış bir ücret veya tutar - bir şekilde gösterilip başka bir şekilde yürütülebilir; bu yüzden QoreX onay için onu hiç göstermez. Web siteleri için QoreX, isteyen siteyi isteğin kendisi hakkında söylediğiyle değil, tarayıcının kendisinin doğruladığı kaynak (origin) ile tanımlar.

Bir cüzdan veya hesap değişikliği ya da cüzdanı kilitlemek, bekleyen isteklere "hayır" yanıtı verir; bir site tek bir isteği bekletebilir ve toplamda üç istek bekleyebilir. Onay pencerelerindeki alan adları bazı sürümlerde İngilizce gösterilir.

## Kurtarma ifadeniz ve erişilebilirlik araçları {#phrase-privacy}

Kurtarma ifadesi ekranı her seferinde yeni bir biyometrik veya cihaz PIN'i ister, kelimeleri **kopyalama düğmesi olmayan**, numaralandırılmış, salt okunur bir ızgara olarak gösterir, Android'de ekran görüntülerine karşı engellenir ve uygulama değiştiriciden gizlenir. **Android 14 ve sonrasında**, kelimeler gerçek erişilebilirlik araçları olmayan erişilebilirlik hizmetlerinden de saklanır (TalkBack ve diğer gerçek ekran okuyucular bunları yine de okuyabilir). Daha eski Android sürümlerinde ve iOS'ta kelimeler varsayılan olarak ekran okuyuculardan gizlenir; bir ekran okuyucuya güveniyorsanız, onların okumasına izin vermek için o ekrandaki bildirime dokunun. İfadeyi yalnızca kimse ekranınızı göremiyorken gösterin.

## Bağlı dApp'ler {#connected-dapps}

dApp bağlantıları **köken başına (per-origin)** yapılır. Uygulamada ayrıca **oturum kapsamlıdır**: uygulama içi dApp tarayıcısını kapatmak her bağlantıyı iptal eder, böylece arka planda hiçbir şey bağlı kalmaz (Ayarlar → Güvenlik'teki **Bağlı dApp'ler** kartı yalnızca bunu söyler). Tarayıcı eklentisinde bağlantılar siz kaldırana kadar sürer - bu cüzdanın onayladığı her siteyi görmek ve herhangi birini **iptal etmek** için açılır penceredeki **Bağlı siteler**'i açın.

## Bağlı imzalayıcılar ve harcama limitleri {#linked-signers}

Harici bir anahtarı (Phantom veya MetaMask) kendi harcama limitleriyle bir **bağlı imzalayıcı** olarak bağlamak **henüz QoreX içinde kullanılamıyor** - Ayarlar → Güvenlik kartı gösterir, eylem *yakında* olarak işaretlidir. QoreX dışında kendiniz yapmadıysanız cüzdanınıza hiçbir şey bağlı değildir. Anahtar yönetimi hiçbir zaman bağlı bir anahtara devredilemez. Zincir üstü model için bkz. [Bağlı Cüzdan Doğrulayıcıları](/developer-guide/account-abstraction#authenticators).

## Q-Day Tarayıcı {#q-day-scanner}

**Q-Day Tarayıcı**, herhangi bir adresi - sizinkini ya da başka birininkini - girmenize ve herhangi bir Bitcoin veya Ethereum adresi için bir maruziyet raporu almanıza olanak tanır. Ana Sayfa hızlı düğmelerinden ulaşın.

## Kısaca güvenlik modeli

1. **Saklayıcısız (Non-custodial)** - anahtarlar cihaz üzerinde üretilir, donanım destekli kasalarda (mobil) ya da şifreli bir kasada (eklenti) yaşar ve asla dışarı çıkmaz.
2. **Onay olmadan hiçbir şey** - her bağlantı köken başınadır, her imza tek tek onaylanır (mobilde biyometrik ile) ve yükler imzalanmadan önce her zaman çözülür - QoreX'in çözemediğini reddeder.
3. **Hibrit imzalı native hat.** Her native QOR transferi iki kez imzalanır: klasik bir anahtarla ve ML-DSA-87 (FIPS 204) ile. Klasik olan her şey (harici ağlar, EVM) etiketlenir, asla sessiz geçmez.
4. **Analitik yok, çökme raporlama yok, izleme SDK'sı yok.** Anahtarlar, kurtarma ifadesi, kasa ve onaylar cihazdan asla çıkmaz. İsteğe bağlı oturum açma, anlık bildirimler ve sosyal kurtarma yalnızca siz açtığınızda bir sunucu kullanır; QoreX'in gönderdiklerinin tam listesi [QoreX'in ağ üzerinden neler gönderdiği](/qorex/overview#data-and-privacy) bölümündedir ve [QoreChain gizlilik politikası](https://qorechain.io/privacy) bunu kapsar.
5. **Kurtarma yolları** - 24 kelimelik ifade (her zaman), vasilerle sosyal kurtarma + 48 saatlik zaman kilidi (isteğe bağlı), Legacy mirası (isteğe bağlı), cihaz bağlama (kolaylık).

## Sınırlar ve bilinen sorunlar {#limits}

- Sosyal kurtarma, Legacy, cihaz bağlama ve Q-Day Tarayıcı yalnızca mobildedir.
- ML-DSA-87 anahtarınız için anahtar rotasyonu henüz QoreX içinde kullanılamıyor.
- Harcama limitli bağlı imzalayıcılar henüz QoreX içinde kullanılamıyor.
- QoreX, kapsamlı EVM pencereleri için bir ekran sunmaz (zincir bunları v3.2.3'ten beri destekler).
- Cihaz bağlama bir kolaylıktır, bir kurtarma yöntemi değildir. Yazılı ifadesi ve sosyal kurtarması olmayan kayıp bir cüzdan kimse tarafından kurtarılamaz.
- Onay penceresi bazı alan adlarını bazı sürümlerde İngilizce gösterir.
