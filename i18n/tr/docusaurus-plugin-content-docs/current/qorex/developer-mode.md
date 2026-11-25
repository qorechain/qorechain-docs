---
slug: /qorex/developer-mode
title: Geliştirici Modu
sidebar_label: Geliştirici Modu
sidebar_position: 9
---

# Geliştirici Modu

Geliştirici modu, QoreX **Ayarlar** bölümündeki bir anahtardır. **Varsayılan olarak kapalıdır**. Açıkken QoreX, **QORE**CHAIN üzerinde geliştirme yapan kişiler için bir araç seti gösterir: ağı okuyan denetçiler, işlemleri simüle edip çözebileceğiniz bir alan, sözleşme ve rollup araçları, çevrimdışı imzalama ve yapay zeka ajanlarının önerdiği işlemleri inceleme yolu.

Geliştirici modu hiçbir imzalama kuralını değiştirmez. İmzalama yapan her şey, tıpkı eskisi gibi, neyi imzaladığını size gösterir ve onayınızı bekler.

## Yenilikler {#innovations}

- **Her araç ya salt okunurdur ya da önce inceleme ister.** Denetçiler yalnızca okur. İmzalayabilen araçlar çözülmüş bir inceleme gösterir ve onayınızı bekler.
- **Ağdan gelen kesin rakamlar.** Denetçiler zincirin bizzat bildirdiklerini gösterir: sürümünü, özelliklerini, hesabınızın kayıtlı anahtarlarını, EVM pencerenizi.
- **Sade sözcüklerle hatalar.** Hata çözücü, ham bir ağ hatasını bir cümleye dönüştürür ve sırada ne yapılacağını söyler.
- **Yapay zeka ajanları önerir, kararı siz verirsiniz.** Bir ajan, izin verdiğiniz şeyleri okuyabilir ve bir işlem önerebilir. QoreX bunu kontrol edip simüle eder, siz de normal onay penceresinde onaylar veya reddedersiniz. Hiçbir ajan imzalayamaz.

## Nasıl açılır {#how-to-use}

- **Mobil uygulama (iPhone ve Android):** **Ayarlar**'ı açın ve **Geliştirici modu** anahtarını açın. Alt çubukta kod simgesi (`</>`) taşıyan bir **Geliştirici** sekmesi belirir. Araçları görmek için onu açın. Ayarı kapatmak sekmeyi yeniden gizler.
- **Tarayıcı uzantısı:** açılır pencerede, alttaki sürüm numarasına yedi kez dokunun. Açılır pencerede, içinde **Geliştirici araçları** düğmesi bulunan bir **Geliştirici modu** bölümü belirir. Düğme, uygulamanın sekmesindekiyle aynı grupların bulunduğu bir sayfa açar. Aynı bölümde **Geliştirici modunu kapat** de vardır.

Ağ anahtarı da aynı bölümdedir. Uygulamada Ayarlar'da **Testneti kullan (geliştiriciler)**, eklentide ise **Testnet'e geç (diana)** olarak yer alır. Yalnızca testnet'te bulunanlar için [Testnet Özellikleri](/qorex/testnet-features) sayfasına bakın.

Bir araç aksini belirtmedikçe araçlar uygulamada ve eklentide aynıdır. Aşağıdaki gibi gruplanmışlardır.

## İnceleme araçları {#inspect}

Salt okunur; mainnet ve testnet'te. Bu ekranlardaki hiçbir şey imzalamaz veya göndermez.

### Ağ ve yetenek denetçisi

Hangi ağda olduğunuzu ve ağın neleri desteklediğini gösterir: zincir kimliği, düğümün sürümü, en son blok, uyguladığı en son yükseltme ve planlanmış olan varsa o, zincirin bildirdiği protokol özellikleri (etkin, hazırlık aşamasında veya etkin değil), EVM lane'inin zincir kimliği, SVM lane'inin yürütme yapıp yapmadığı ya da kapalı olup olmadığı, cross-VM ve kuantum sonrası parametreler ve ağın kaç IBC kanalı ile köprü rotası listelediği. İkinci bölüm olan **Bu cüzdan**, QoreX sürümünüzü, yapıyı (uygulama veya eklenti) ve bu yapının kullandığı imzalama yöntemlerini ve simülasyon modunu gösterir.

Nasıl kullanılır: **Ağ ve yetenek denetçisi** aracını açın. Yeniden okumak için **Yenile** düğmesine dokunun. Bir değeri kopyalamak için yanındaki **Kopyala** düğmesini kullanın.

### Hesap denetçisi

Etkin hesabı gösterir: bir Cosmos hesabı (coin 118) mı yoksa birleşik bir hesap (coin 60) mı olduğunu, slot ve türetim indekslerini, her lane'deki adreslerini (native `qor1...`, EVM `0x...`, SVM anahtarı) ve açık anahtarlarını. Yalnızca herkese açık bilgiler gösterilir; gizli hiçbir şey kasadan çıkmaz.

Nasıl kullanılır: **Hesap denetçisi** aracını açın, ardından **Adresleri ve açık anahtarları göster** düğmesine dokunun (QoreX kilidi açmanızı isteyebilir).

### PQC denetçisi

Hesabınız için zincirde kayıtlı ML-DSA-87 anahtarını gösterir: algoritmayı, kaydedildiği blok yüksekliğini, açık anahtarın SHA-256 değerini, boyutunu, zincir kurallarının onu hâlâ kabul edip etmediğini ve sahiplik kanıtını. Ardından bu anahtarı bu cihazdakiyle karşılaştırıp eşleşip eşleşmediklerini söyleyebilir (kanonik anahtar, eski bir türetim veya numaralı bir rotasyon). Ayrıca bir **Bir işlemi ne korur** tablosu vardır: native bir gönderim, bir EVM işlemi, bir SVM işlemi, bir IBC gönderimi ve harici bir zincirdeki bir gönderim için hangi imzanın kuantum sonrası, hangisinin klasik olduğunu gösterir.

Nasıl kullanılır: zincirdeki anahtarı okumak için **PQC denetçisi** aracını açın, ardından karşılaştırmayı çalıştırmak için **Bu cihazın anahtarıyla karşılaştır** düğmesine dokunun. Zincir kayıtlı anahtarı reddediyorsa ekran anahtarın yeniden kaydedilmesi gerektiğini söyler.

### EVM penceresi denetçisi

Hesabınız için canlı bir EVM penceresi olup olmadığını, açıldığı ve sona ereceği blok yüksekliklerini ve yaklaşık zamanları, kaç işlem ve ne kadar değer kullanıldığını ve kaldığını ve nelere izin verdiğini (yalnızca QOR transferleri veya çağrılar ve transferler; izin verilen alıcılar ve sözleşmeler) gösterir. Pencere açma ve kapatma burada değil, EVM penceresi ekranında yapılır. Bkz. [Güvenlik ve Kurtarma](/qorex/security-and-recovery#evm-window).

Nasıl kullanılır: **EVM penceresi denetçisi** aracını açın. Bir pencerenin "okunamadığını" söylüyorsa bu, hiç pencereniz olmadığı anlamına gelmez.

## İşlemler {#transactions}

Bir araç aksini belirtmedikçe mainnet ve testnet.

### İşlem denetleyici

Bir işlem hash'i (QoreChain veya `0x` ile EVM) ya da ham bir istek yapıştırın: bir SignDoc JSON'u, base64 TxRaw, bir EVM işlem JSON'u veya bir dApp isteği. QoreX her mesajı çözer; kimin imzaladığını, kimin aldığını, taşınan fonları, ücreti, memo'yu ve istenen izinleri gösterir ve kuantum sonrası imzanın eklenip eklenmediğini söyler. Zaten ağda bulunan bir işlem için sonucu, kullanılan gas'ı ve olayları da gösterir. QoreX'in okuyamadığı bir mesaj türü, ham baytlarıyla birlikte bilinmeyen olarak gösterilir; QoreX tahmin yürütmez. İstekler cihazınızda okunur ve asla gönderilmez.

Nasıl kullanılır: **İşlem denetleyici** aracını açın, yapıştırın, **Denetle** düğmesine dokunun.

### Simülasyon tezgâhı

QoreChain mesajlarını JSON olarak ya da bir EVM işlemini yapıştırın; QoreX ağa bunun ne yapacağını sorar. Hiçbir şey imzalanmaz veya gönderilmez. İşlemin başarılı olup olmayacağını, kullanacağı gas'ı ve ücreti, geçerliyse tek seferlik kuantum sonrası anahtar kayıt ücretini, hesabınızdaki varlık değişikliklerini ve simülasyonun gösteremediklerinin bir listesini (örneğin bir sözleşmenin kendi durumu veya sonraki bir blokta çalışan cross-VM adımları) görürsünüz. Ağ hataları, yerleşik **Hata çözücü** tarafından sırada ne yapılacağına dair bir öneriyle birlikte sade sözcüklere çevrilir: ham bir log, bir sonuç JSON'u veya bir hata mesajı yapıştırıp **Çöz** düğmesine dokunun.

Nasıl kullanılır: **Simülasyon tezgâhı** aracını açın, **QoreChain mesajları** veya **EVM işlemi** seçin, yapıştırın, **Simüle et** düğmesine dokunun.

### Ücretler ve sponsorluk

Zincirin asgari gas fiyatını, QoreX'in gas başına ne ödediğini, yaygın işlemlerin maliyetini (gönderme, stake etme, EVM penceresi açma, IBC gönderimi), bir sonraki işlemin tek seferlik anahtar kaydını da ödeyip ödemediğini ve aldığınız ve verdiğiniz ücret ödeneklerini gösterir; her biri için bir karar verir: öder mi, ödemiyorsa neden reddedilir (süresi dolmuş, tükenmiş, yanlış mesaj türü). QoreX kendi ücretlerini öder ve asla kendiliğinden bir fee granter belirtmez.

Nasıl kullanılır: **Ücretler ve sponsorluk** aracını açın; açılışta okur.

### Testnet Çalışma Alanı

Testnet'te geliştirme için, mainnet'e asla dokunmayan araçlar:

- **Yalnızca testnet hesapları.** Kurtarma ifadenizden oluşturulan, QoreX'in mainnet'te imza atmasına asla izin vermediği ve mainnet etkinken gizlediği bir hesap. **Yalnızca testnet hesabı oluştur** düğmesine dokunun.
- **Musluk.** Testnet adresinizi kopyalayın ve **Testnet musluğunu aç** düğmesine dokunun. Musluk Dashboard'dadır ve kullanmak için orada oturum açarsınız. Bkz. [Testnet Özellikleri](/qorex/testnet-features#get-test-qor).
- **Bağlantıları sıfırlama.** **Tüm bağlantıları sıfırla**, her sitenin bağlantısını keser, bekleyen tüm istekleri reddeder ve sitelerin yakın zamanda size imzalattığı sözleşmeleri unutur. Onaylamak için iki kez dokunun.

Kullanılabilirlik: ekran her iki ağda da açılır; yalnızca testnet hesapları ve musluk testnet içindir.

### İstek günlüğü

Sitelerin ne istediğini, sizin neye karar verdiğinizi ve ağın ne yanıt verdiğini listeler. Yalnızca cihazınızda ve yalnızca Geliştirici modu açıkken tutulur; en fazla 500 kayıt ve 7 gün. Kurtarma ifadenizi, anahtarlarınızı veya parolalarınızı ya da neyin imzalandığını asla kaydetmez (yalnızca türünü ve bir hash'i kaydeder). Tarayıcı kapandıktan sonra da saklayabilir, temizleyebilir veya bir hata raporuna eklemek üzere **Hata ayıklama dosyası dışa aktar** seçeneğini kullanabilirsiniz; dosya yazılmadan önce ifadelere ve anahtarlara karşı kontrol edilir.

Nasıl kullanılır: **İstek günlüğü** aracını açın. Önce Geliştirici modunu açın, yoksa hiçbir şey kaydedilmez.

## Sözleşmeler ve rollup'lar {#contracts}

### Sözleşme etkileşimi

EVM, CosmWasm (QoreChain Native) ve SVM sözleşmelerini kendi hesabınızla çağırın. Okumalar ücretsizdir; durumu değiştiren her şey bir dApp isteğiyle aynı onaydan geçer; bu onay işlemi simüle eder ve kuantum sonrası imzayı ekler.

Nasıl kullanılır:

1. **Sözleşme etkileşimi** aracını açın ve **Sözleşme türü** seçin.
2. EVM: sözleşme adresini girin ve **ABI (JSON)** dosyasını yükleyin. Her fonksiyon, read, write veya payable olarak etiketlenmiş türlü bir forma dönüşür. QoreX, QOR alamayan bir fonksiyon için değer girilmesini reddeder.
3. CosmWasm: sözleşme adresini girin, isterseniz `cosmwasm-schema` çıktısı bir şema yükleyin, **Mesaj (JSON)** alanını ve gerekirse fonları (`1000uqor` biçiminde yazılır) yazın. Okumak için **Sorgu**, tam olarak neyin imzalanacağını görmek için **Yürütmeyi incele** seçeneğini kullanın.
4. SVM (yalnızca testnet): program kimliğini girin ve bir **Anchor IDL (JSON)** yükleyin. QoreX, Solana işlemini kendi Solana anahtarınızla imzalar ve QoreChain hesabınızla iletir.
5. Ağın çağrının ne yapacağını söylediğini görmek için **Simüle et** düğmesine, ardından **İncele ve imzala** (veya **Onaya devam et**) düğmesine dokunun ve onay penceresinde onaylayın.

Sözleşmeleri ağ bazında kaydedebilir, dosya olarak dışa aktarabilir ve yeniden içe aktarabilirsiniz. **Sözleşme bilgisi** paneli bir CosmWasm sözleşmesinin code id'sini, oluşturucusunu, etiketini ve yöneticisini gösterir.

### Dağıtım onayı

Komut satırı aracınızın, IDE'nizin veya ajanınızın hazırladığı bir dağıtımı onaylayın. QoreX kod hash'ini kendisi hesaplar, constructor argümanlarını çözer ve herhangi bir şey imzalanmadan önce sözleşmeyi kimin yükseltebileceğini kontrol eder. Aracın belirttiği hash baytlarla eşleşmiyorsa reddeder. Yükseltilebilir proxy kalıpları, hesabınız olmayan bir yönetici veya yükseltme yetkisi ve yöneticisi olmayan, hiçbir zaman taşınamayacak bir sözleşme konusunda uyarır. EVM sözleşme dağıtımlarını ve zaten saklanmış bir koddan örneklenen CosmWasm sözleşmelerini işler. QoreX CosmWasm kodu yüklemez ve bu sürümde SVM program dağıtımı desteklenmez. Kod yüklemelerini yönetişim üzerinden gönderen bir ağda bu yüklemeler bir cüzdandan imzalanamaz.

Nasıl kullanılır: **Dağıtım onayı** aracını açın, aracınızdan aldığınız dağıtım isteği JSON'unu yapıştırın (görmek için **Biçimi göster** düğmesine dokunun), **Kontrol et** düğmesine dokunun, incelemeyi okuyun, ardından **Onayla ve imzala** düğmesine dokunun.

### Rollup ve appchain profilleri

QoreChain RDK ile oluşturulmuş bir rollup veya appchain ekleyin. QoreX profili saklamadan önce düğümüne canlı olarak sorar ve her kontrolü gösterir: REST ve RPC zincir kimliği, adres öneki, EVM zincir kimliği ve QoreChain üzerindeki rollup. Bir profil mainnet'e veya testnet'e settle edebilir. Bir profil etkinken her inceleme ekranı hangi ağın imzaladığını sorar ve zincir kimliğini doğrulamayan bir düğüm için imzalama reddedilir.

Nasıl kullanılır: **Rollup ve appchain profilleri** aracını açın, **Profil ekle** düğmesine dokunun, ad, zincir kimliği ve uç noktaları doldurun, ardından **Kontrol et ve ekle** düğmesine dokunun. Geçiş yapmak için **Etkinleştir** veya **Kullanmayı bırak** düğmelerini, istediğiniz zaman da **Yeniden kontrol et** düğmesini kullanın.

## Diğer sanal makineler {#other-vms}

### QoreChain üzerinde Solana (yalnızca testnet)

QoreChain **testnet**'indeki SVM lane'i: SVM pencereleri ve imzalanmış bir Solana işleminin iletilmesi. Bu araç yalnızca testnet etkinken gösterilir; mainnet'te SVM lane'i açık değildir ve buradaki hiçbir şey kullanılamaz. Ayrıntılar ve adımlar [Testnet Özellikleri](/qorex/testnet-features#solana-on-qorechain) sayfasındadır.

### VM'ler arası çağrı

Hesabınızdan QoreChain'in kendi başka bir yürütme lane'indeki (EVM, CosmWasm veya SVM) bir sözleşmeye çağrı oluşturun. Hiçbir şey QoreChain'den çıkmaz: bu, başka bir zincire köprü değildir. Form hedef lane'i, sözleşmeyi veya programı, payload'u ve yalnızca CosmWasm için eklenecek QOR'u ister.

**Ne zaman çalışır** seçimini siz yaparsınız ve QoreX bunu açıkça söyler:

- **Şimdi, bu işlemin içinde (atomik):** ya tamamı gerçekleşir ya da hiçbiri.
- **Sonraki bir blok için kuyrukta (atomik değil):** sonraki bir blokta çalışır. Başarısız olur veya zaman aşımına uğrarsa, bu işlemin yaptıkları yapılmış olarak kalır.

Nasıl kullanılır: **VM'ler arası çağrı** aracını açın, formu doldurun, adımları ve ücreti görmek için **Simüle et** düğmesine, ardından **İmzala ve gönder** düğmesine dokunun. QoreX yalnızca simüle ettiği çağrıları imzalar. Ağda cross-VM çağrıları kapatılmışsa ekran bunu söyler ve imzalanacak hiçbir şey sunmaz. Bugün mainnet'te cross-VM çağrıları kapalıdır, bu yüzden orada bu mesajı bekleyin.

### VM'ler arası çağrıyı izleme

Bir işlemin hash'ini (QoreChain veya EVM için `0x`) yapıştırın; QoreX işlemin cross-VM ayaklarını okur. Kuyruğa alınmış bir ayak beklemede, yürütüldü, başarısız veya zaman aşımına uğradı olarak görünür. Bir EVM işleminin ayakları işlemin kendi içinde çalışmıştır ve sonucundan okunur. Tamamlanmış kuyruk kayıtları bir süre sonra ağ tarafından temizlenir ve kayıt yoksa izleyici bunu söyler.

Nasıl kullanılır: **VM'ler arası çağrıyı izle** aracını açın, hash'i yapıştırın, **İzle** düğmesine dokunun.

## İmzalama ve ajanlar {#signing-and-agents}

### İzinler ve oturumlar

Hesabınızın diğer adreslere yapmaları için izin verdiği her şeyi, zincirin bizzat uyguladığı sınırlarla listeler ve her birini iptal etmenizi sağlar: **Yetkiler**, **Ücret ödenekleri**, **Bağlı anahtarlar** ve **Erişim pencereleri**. Her biri neler yapabileceğini, sınırını ve ne zaman sona ereceğini (veya hiç sona ermeyeceğini) gösterir. **İptal et**, iptal işlemini gönderir; **Pencereyi kapat** bir EVM penceresini kapatır.

**Yeni oturum** ile bir uygulamaya veya başka bir adrese sınırlı bir oturum da verebilirsiniz: belirli bir gün sayısı boyunca yalnızca listelenen sözleşmeleri çağırma, belirlenen bir tutara kadar gönderme, seçilen doğrulayıcılarla stake etme ya da oy verme ve ödülleri talep etme; isterseniz ücretlerini bir sınıra kadar ödeyerek. Bir **Önizleme**, yetki verilenin tam olarak neler yapabileceğini söyler ve zincirin uygulamadığı, QoreX'in her seferinde size soracağı şeyleri ayrıca listeler.

### Çevrimdışı ve multisig çalışma alanı {#multisig}

Herhangi bir işlemi zincirin komut satırı biçiminde bir dosya olarak hazırlayın, bir multisig dosyasındaki her imzayı kontrol edin ya da bir cihazda imzalayıp başka birinden yayınlayın.

- **Çevrimdışı imzalama:** çevrimiçi bir cihazda bir işlem hazırlayın (Send, Delegate veya Call a contract gibi bir şablondan başlayın ya da mesajları yapıştırın), dosyayı veya QR kodunu anahtarı tutan QoreX'e götürün, inceleyin, **İmzala**, ardından iki cihazdan herhangi birinden **Ağa gönder** seçeneğini kullanın.
- **İmzaları kontrol et:** işlemi ve varsa imza dosyalarını açın. QoreX her multisig üyesi için kuantum sonrası bir anahtarı kayıtlı olup olmadığını, 1. tur (kuantum sonrası) ve 2. tur (klasik) imzalarının geçerli, eskimiş, geçersiz veya eksik olup olmadığını ve hangi turun hâlâ eksik olduğunu gösterir.

İnceleme her zaman memo'yu ve her ücret coin'ini gösterir; QoreX yalnızca incelediğiniz baytları imzalar. QOR dışındaki bir coin ile ödenen ücreti, ağın yüksek gas fiyatının epey üzerindeki bir ücreti ve başka bir hesabın ödediği veya sağladığı ücreti reddeder. Dosya incelemenizden sonra değişirse yeniden açıp incelemeniz gerekir. QoreX, ML-DSA-87 imzası olmayan bir işlemi yayınlamaz.

## Yapay zeka ajanları {#ai-agents}

Yapay zeka ajanları (kendi yapay zeka asistanınız veya çalıştırdığınız bir araç) seçtiğiniz hesapları okuyabilir ve bir işlem **önerebilir**. İmzalayamazlar. Model şöyledir:

1. Bir ajanın hangi hesapları görebileceğine ve hangileri için öneride bulunabileceğine siz karar verirsiniz. Bir ajanı istediğiniz zaman duraklatabilir veya iptal edebilirsiniz; **Etkinlik** listesi ne yaptığını gösterir.
2. QoreX her öneriyi kontrol eder ve ağda simüle eder. QoreX'in okuyamadığı veya ağın başarısız olacağını söylediği bir öneri size gösterilmez.
3. Öneriyi, bir web sitesi tarafından değil bir yapay zeka ajanı tarafından önerildiği işaretiyle normal onay penceresinde görür, onaylar veya reddedersiniz. Siz onaylayana kadar hiçbir şey imzalanmaz.

QoreX, kim önerirse önersin, hiçbir dış tarafın isteyemeyeceği istek türlerini asla imzalamaz. Saatlik öneri sınırı bir sel oluşmasını engeller ve aynı anda yalnızca bir öneri bekler.

Nasıl kullanılır:

- **Mobil uygulama:** Geliştirici modunu açın, **Yapay zeka ajanları** bölümünü açın, ardından ajanınızdan aldığınız öneri JSON'unu yapıştırıp **Öneriyi incele** düğmesine dokunun veya bir `qorex://propose` bağlantısı açın. QoreX yapıştırılan bir öneriyi veya bağlantıyı kimin yazdığını kontrol edemez ve bunu söyler. İnceleyin, onaylayın veya reddedin.
- **Tarayıcı uzantısı (Chrome, Edge, Brave, Firefox):** bir ajan, bilgisayarınızdaki Model Context Protocol kullanan bir yardımcı program üzerinden bağlanır. Bu program henüz yayımlanmamıştır, dolayısıyla eklenti tarafı henüz herkes tarafından kullanılamaz. Yayımlandığında **Bu bilgisayarda yapay zeka ajanı bağlantılarına izin ver** seçeneğini açar, ajanı 5 dakikada sona eren tek kullanımlık bir kodla eşleştirir ve hesaplarını seçersiniz.
- **Safari:** kullanılamaz. Safari, QoreX'i bilgisayarınızdaki programlara bağlayamaz.

## Sınırlar {#limits}

- Geliştirici modu geliştirme yapanlar içindir. Yalnızca gönderiyor, alıyor ve stake ediyorsanız buna ihtiyacınız yoktur.
- Ağa bağlı bir araç (denetçiler, simülatör, izleyiciler), ağa ulaşılamadığında "okunamadı" der. Bu, orada hiçbir şey olmadığı anlamına gelmez.
- SVM araçları ve cross-VM oluşturucu, ağın izin verdiğine bağlıdır. Bugün mainnet'te SVM ve cross-VM çağrıları kapalıdır.
- Tarayıcı eklentisinde anahtarı ortaya çıkarmak için sürüm numarasına dokunmak gerekir; uygulamada anahtar Ayarlar'dadır.
