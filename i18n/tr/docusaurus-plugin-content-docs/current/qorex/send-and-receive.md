---
slug: /qorex/send-and-receive
title: Gönder ve Al
sidebar_label: Gönder ve Al
sidebar_position: 3
---

# Gönder ve Al

Bu sayfa QOR göndermeyi ve almayı, bir @kullanıcı adına ödeme yapmayı, ödeme isteklerini, kişileri, işlem geçmişini, diğer ağlardaki varlıkları tutmayı ve Ana Sayfa ekranının ekstralarını kapsar. QoreX mobil uygulamasını kullanan herkes içindir (eklentide aynı Gönder ve Al ekranları vardır, bkz. [Tarayıcı Eklentisi](/qorex/browser-extension)). Uygulama, tarayıcı eklentisi ve Safari eklentisi arasında bir fark olduğunda metin bunu belirtir.

## Yenilikler {#innovations}

- **İmzalı ödeme istekleri.** Bir istek, kendi hesap anahtarınızla imzalanmış bir bağlantıdır. Ödeyen kişi, normal inceleme görünmeden önce QoreX'in imzayı, tam ağı ve varsa @handle'ı kontrol ettiğini görür; böylece değiştirilmiş bir tutar veya alıcı sessizce geçmek yerine ortaya çıkar. Bkz. [Ödeme istekleri](#payment-requests).
- **Durum zincirden okunur.** Bir transfer, ağ öyle dediği için *beklemede*, *onaylandı* veya *başarısız* olur; bir ödeme isteği de yalnızca zincir eşleşen bir ödeme gösterdiğinde *ödendi* olarak işaretlenir. Bkz. [Geçmiş](#history).
- **Benzer adres işareti.** Zaten bildiğiniz bir adrese yalnızca benzeyen bir adres, göndermeden önce işaretlenir. Bkz. [Kişiler ve favoriler](#contacts).
- **Sade sözcüklerle ücret uyarıları.** Ücret gönderdiğiniz tutardan büyük olduğunda QoreX bunu söyler ve ilk gönderiminizde tek seferlik anahtar kayıt ücretini ve toplamı gösterir.

Ana Sayfa (Cüzdan) sekmesi başlangıç noktanızdır. Bir **ağ rozeti** (varsayılan olarak MAINNET, geliştirici anahtarını etkinleştirdiyseniz TESTNET), **toplam bakiyenizi** (gizlemek/göstermek için dokunun) ve ana işlemleri gösterir: **Gönder · Al · Takas · Stake** (**Takas** iOS'ta gösterilmez). Varlık listeniz **QOR**'u (Native, EVM ve SVM lane'leri genelinde tek birleşik bakiye, hibrit imzalı native lane'de gönderilir) ve **Tüm ağlar**'ı (ETH, BNB, POL, ARB ve QoreX'in desteklediği diğer [harici ağlar](#external-networks-tokens) genelinde birleşik bir görünüm) gösterir.

## Hibrit imzalı native lane'de QOR gönderin

1. **Gönder**'e dokunun.
2. Alıcıyı bir `qor1…` adresi **veya** bir **@kullanıcı adı** olarak girin. Bir kullanıcı adı çözümlenir ve kriptografik olarak doğrulanır (kayıt defteri imzası + sahip imzası + ilk kullanımda güvenme sabitlemesi); bir kullanıcı adının anahtarı sessizce değişirse, QoreX açık bir uyarı gösterir.
3. Tutarı girin. Önizleme alıcıyı, tutarı, **Ağ ücretini** ve imza durumunu (transferin ML-DSA-87 katmanını taşıyıp taşımadığını) gösterir.
4. **Biyometrik** onayla doğrulayın. Her native QOR transferi iki kez imzalanır: klasik bir anahtarla ve ML-DSA-87 (FIPS 204) ile. QoreX bu zorunlu hibrit imzayla imzalar ve native lane'de yayınlar. Yayından sonra onaylanmış işlemin ML-DSA-87 katmanını taşıdığını kontrol eder ve taşımıyorsa sizi uyarır.

İlk ekranda hızlı doldurma kutusu (**Ask QoreX**), "send 50 QOR to @maria" gibi sade bir isteği yazmanıza olanak tanır ve formu sizin için doldurur. Bu, **tamamen cihazınızda** çalışan basit bir metin okuyucudur - oraya yazdığınız hiçbir şey herhangi bir yere gönderilmez ve bir yapay zeka asistanı değildir (QoreX'te yoktur). Yine de her şeyi gözden geçirir ve her zamanki gibi biyometriyle onaylarsınız; yazdığınızı okuyamazsa bunu söyler ve formu elle doldurursunuz. Favori kişileriniz ve son alıcılarınız tek dokunuşluk çipler olarak görünür (bkz. [Kişiler ve favoriler](#contacts)).

QoreChain ML-DSA-87 anahtarınızı kendiliğinden kaydetmez. QoreX bunu **ilk** transferinizin bir parçası olarak sizin için yapar (küçük, tek seferlik bir ağ ücreti) ve durumunu [Güvenlik ve Kurtarma](/qorex/security-and-recovery#pqc-key) sayfasında görebilirsiniz. QoreX'te ayrı bir adım gerekmez.

**İlk gönderimin incelemesi maliyeti baştan gösterir.** İnceleme, tutarın ve **Ağ ücreti** satırının yanında, ücretiyle birlikte *Tek seferlik ML-DSA-87 anahtar kaydı* satırını ve ardından **Toplam ücret** satırını listeler; böylece onayladıktan sonra sürpriz olmaz. Aynı hesaptan sonraki gönderimlerde yalnızca ağ ücreti gösterilir.

**Tutardan büyük ücret.** Ağ ücreti gönderdiğiniz tutardan büyükse inceleme bunu bir uyarı olarak söyler (*"The network fee ... is larger than the amount you are sending ..."*). Gönderimi asla engellemez. QoreX bunu native QOR gönderimlerinde ve ücret o coin cinsinden belirtildiğinde harici bir ağın kendi coin'i için gösterir. Staking ödüllerini talep ederken de aynı kontrol yapılır, bkz. [Portföy ve Stake](/qorex/portfolio-and-staking#claim).

### @kullanıcı adına adım adım gönderim {#handle-send}

1. **Gönder**'i açın ve alıcı alanına adres yerine `@` işaretinin ardından kullanıcı adını (örneğin `@liviu`) yazın.
2. QoreX kullanıcı adını arar ve herhangi bir şeyi onaylamadan önce size **çözümlenen `qor1…` adresini** gösterir. (Kendi kullanıcı adınızı talep etmek oturum açmış bir hesap gerektirir ve uygulamada yapılır - bkz. [@handle](/qorex/account-and-dashboard#handle).)
3. Çözümlenen adresi kontrol edin, tutarı girin ve her zamanki gibi onaylayın.

QoreX yalnızca gerçekleştirdiği **her iki** denetimi de geçen bir çözümlemeyi kabul eder: uygulamada sabitlenmiş bir güven anahtarına karşı doğrulanan bir kayıt defteri onayı ve kullanıcı adı sahibinin iddia üzerindeki kendi imzası. Denetimlerden biri bile başarısız olursa, doğrulanmamış bir adrese geri dönmek yerine bir hata verir. Belirli bir kullanıcı adına ilk kez ödeme yaptığınızda, QoreX çözümlediği adresi hatırlar; o kullanıcı adının adresi bir gün değişirse, QoreX imzalamadan önce durur ve devam edip etmeyeceğinize karar verebilmeniz için eski ve yeni adresi yan yana gösterir. Bu hafıza **cihaza özeldir** - aynı kullanıcı adına farklı bir telefondan veya yeni bir kurulumdan ilk kez ödeme yapmak orada da yeni olarak gösterilir; bu beklenen bir durumdur, hata değildir. Tarayıcı eklentisi de kullanıcı adlarını aynı şekilde çözümler ve öder (hafızası **tarayıcıya özeldir**, dolayısıyla farklı bir tarayıcı veya bilgisayar onu yeni olarak görür) - bkz. [@kullanıcı adına gönderim](/qorex/browser-extension#handle-send).

### Vesting (kilitli) QOR gönderimi {#vesting}

Bakiyenizin bir kısmı hâlâ **vesting** aşamasındaysa - örneğin serbest bırakılmamış bir TGE tahsisatı - toplamınız **şimdi kullanılabilir** ve **hâlâ kilitli** olarak ikiye ayrılır. Yalnızca kullanılabilir kısmı gönderebilirsiniz; QoreX, ağın bir ücret aldıktan sonra reddetmesine izin vermek yerine aşırı harcama girişimini kendisi reddeder. Kilitli kısım, vesting takvimi onu serbest bıraktıkça kademeli olarak harcanabilir hale gelir. Bu ayrım bakiyenizin göründüğü her yerde gösterilir - Ana Sayfa, Gönder ve Varlık detayı.

## Al {#receive}

**Al**'a dokunun. Coin ile başlar: **QOR en başta** olmak üzere **aranabilir bir liste** (*Almak istediğiniz coini seçin*, arama kutusu *Coin veya ağ ara*), ardından desteklenen her ağın kendi coin'i ve pakete dahil tokenlar, her biri kendi görseli ve ağının görseliyle gelir. Aramanızla hiçbir şey eşleşmezse liste *Eşleşen coin yok.* der. Görseller QoreX'in içinde gelir, dolayısıyla listeyi çizmek için üçüncü bir taraftan hiçbir şey alınmaz.

- **QOR**, `qor1...` adresinizi (ve varsa @kullanıcı adınızı) QoreChain simgeli bir QR kodu olarak, ayrıca **Kopyala** ve **Paylaş** ile gösterir. Ona gönderilen her şey, her transferin klasik ve ML-DSA-87 imzası taşıdığı native lane'de ulaşır.
- **Diğer herhangi bir coin veya token**, o ağın kendi adresini ve *"Bu adrese yalnızca \{network\} üzerindeki \{coin\} veya tokenları gönderin. Başka bir ağdan gönderilen coinler kaybolabilir."* uyarısını gösterir. Uyarı, seçtiğiniz coin'in adını verir. Listeye dönmek için **Başka coin seç** seçeneğini kullanın.
- **Kapsanan ağlar:** Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis ve Celestia. Tüm EVM ağları tek bir `0x...` adresini paylaşır. EVM ve Solana adresleriniz kurtarma ifadenizden türetilir; bu nedenle QoreX onları göstermeden önce bir biyometrik onay (**Adresi göster**) ister. Diğer ağlar ML-DSA-87 imzalarını taşıyamaz. Bkz. [Harici ağlar](#external-networks-tokens).
- **Özel tokenlar da listededir.** Sözleşme adresiyle (veya Solana'da mint adresiyle) eklediğiniz bir token, pakete dahil bir token gibi, ağının adresiyle Al ekranında sunulur. Bkz. [Coin'ler ve tokenlar](#coins-and-tokens).
- **Cosmos Hub, Osmosis ve Celestia adresleri.** Gösterilen adres, o ağdan yaptığınız gönderimlerin imzalandığı adrestir (coin-118 anahtarınız). Önceki yapılar bir coin-60 hesabı için farklı bir adres gösterebiliyor veya etkin hesabı izleyebiliyordu; bu düzeltildi ve gönderim, imzalamadan önce adresi yeniden kontrol eder.

Eklenti ve Safari eklentisi de **Al** ekranında aynı coin listesine sahiptir.

## Coin'ler ve tokenlar {#coins-and-tokens}

Satırı olmayan bir coin'in onu alabileceğiniz bir adresi yoktur. Bir coin veya token'ı henüz hiç sahip olmadan **Portföy**'de görmek için Portföy → **+ Coin or token** bölümünü açın ve onu açın (eklentide: **Coins and tokens**). Sıfırda sabitlenmiş bir coin'e dokunulduğunda kendi ağında **Al** açılır. Ayarlar → **Coins and networks**, cüzdanın bugün tutabildiği her şeyi listeler.

**Sözleşme adresiyle token ekleyin** (yalnızca EVM ağları):

1. Portföy → **+ Coin or token** → **Add a token by contract** (eklenti: **Coins and tokens** → *Add a token by contract*).
2. **Ağı** seçin, **Sözleşme adresini (0x…)** yapıştırın ve **Check contract**'a dokunun.
3. QoreX sembolü ve ondalık basamakları doğrudan sözleşmeden okur ve *"Sözleşme şunu söylüyor: \{symbol\} · \{decimals\} ondalık"* ifadesini gösterir. Herkes bir token oluşturabilir ve ona istediği adı verebilir - QoreX bunun garantisini vermez, bu yüzden kastettiğiniz sözleşme olduğundan emin olun.
4. **Add \{symbol\}**'a dokunun. *Added by you* olarak işaretlenir ve pakete dahil tokenlar gibi gönderilebilir. İstediğiniz zaman kaldırabilirsiniz.

Token eklendikten sonra [Al](#receive) ekranında da görünür.
QoreX; zaten pakete dahil olan bir token'ı, daha önce eklediğiniz bir token'ı, EVM olmayan bir ağı, hatalı bir adresi, token olarak yanıt vermeyen bir sözleşmeyi ve QoreX'in o ağda zaten sunduğu bir token'ın adını kullanan bir sözleşmeyi (büyük olasılıkla bir kopya) reddeder.

## Ödeme istekleri {#payment-requests}

Birinden paylaşacağınız veya kopyalayacağınız imzalı bir bağlantıyla belirli bir miktar QOR isteyin. Uygulamada, eklentide ve Safari eklentisinde, mainnet ve testnet'te çalışır ve QoreX'te oturum açmayı **gerektirmez**.

**İstek oluşturma**

1. **Ödeme istekleri**'ni açın (uygulama: Ayarlar; eklenti: ana ekrandaki bir düğme).
2. **Yeni istek**'e dokunun, **Tutar (QOR)** ve isteğe bağlı bir **Not** (en fazla 140 karakter) girin. Bir @handle'ınız varsa *İstekte @kullanıcı adımı göster* seçeneğini işaretleyebilirsiniz.
3. **Bağlantı oluştur**'a dokunun. QoreX isteği kendi hesap anahtarınızla imzalar ve *"İsteğiniz hazır. Herkes QoreX'te veya başka bir cüzdanda ödeyebilir."* mesajını gösterir.
4. **Bağlantıyı paylaş** veya **Bağlantıyı kopyala** seçeneğini kullanın.

Bağlantı hesap anahtarınızla imzalanır, bu yüzden değiştirilmiş bir tutar veya adres algılanır. Anahtar, alıcı adrese ait olmalıdır: başka hiç kimse değiştirilmiş bir bağlantıyı sizin adınıza yeniden imzalayamaz. İmza yalnızca bağlantı üzerinde bir bütünlük kontrolüdür; ödemenin kendisi ödeyen tarafından normal şekilde, native lane'de hibrit imzayla imzalanır. Bağlantı biçimi `qorex://pay?v=1&...` şeklindedir ve tam ağı (mainnet veya testnet) adıyla belirtir. **Bağlantıyı paylaş** ve **Bağlantıyı kopyala** size QoreX'te açılan bir ödeme bağlantısı verir; bağlantı `https://link.qore.network/pay?` ile başlar.

Uygulamanın Ana Sayfa ekranındaki **İste** düğmesi, belirli bir QoreX kullanıcısından @handle'ı ile istekte bulunur ([oturum açma](/qorex/account-and-dashboard#sign-in) ve kendi @handle'ınız gerekir). Oluşturulan bu istek imzalı bir bağlantı olarak da paylaşılabilir.

**İstek ödeme**

1. Bağlantıyı QoreX bulunan bir telefonda açın ya da **Bir isteği öde**'ye gidin ve **Bir ödeme bağlantısı yapıştırın** alanını kullanıp (eklentide de) **Aç**'a dokunun.
2. QoreX, ödenecek herhangi bir şeyi göstermeden *önce* imzayı, ağı ve varsa @handle'ı kontrol eder. Ardından alıcıyı, tutarı, notu ve memo etiketini gösterir ve normal inceleme gelir. Her gönderimde olduğu gibi onaylarsınız.
3. Görebileceğiniz mesajlar: *"İmza kontrol edildi: istek, imzalandığından beri değişmedi."* ya da *"Bu bağlantı imzalandıktan sonra değiştirilmiş. Ödemeyin."*, *"Bu bağlantı, alan adresin sahibi tarafından imzalanmamış. Ödemeyin."* veya *"Bu istek \{network\} için. Ödemek için QoreX'te ağı değiştirin."* gibi bir ret.
4. Bağlantı bir @handle taşıyorsa QoreX onu handle kayıt defteriyle karşılaştırır: doğrulandı, ona ilk ödeme, *artık öncekinden farklı bir adrese işaret ediyor* (ödemeden önce onlarla kontrol edin) veya bu adrese işaret etmiyor (emin değilseniz ödemeyin). Bir handle uyarısı ikinci bir onay gerektirir.

QoreX şimdilik istekleri yalnızca QOR ile öder. Bir testnet isteği *"Testnet isteği. Testnet QOR'un değeri yoktur."* der.

**İzleme ve yeniden kullanma**

**İsteklerim**, oluşturduğunuz istekleri listeler. Her biri zincirden okunan **Ödendi** veya **Henüz ödenmedi** durumunu gösterir: QoreX eşleşen bir ödeme arar (transferdeki memo etiketi) ve istek yalnızca zincir bunu gösterdiğinde ödendi olarak işaretlenir. Ağ yanıt vermezse tahmin yürütmez, *Durum bilinmiyor* der. **Durumu kontrol et** yeniden sorar. **Gelecek ay yeniden kullan**, aynı ayrıntılar ve yeni bir kimlikle yeni bir istek oluşturur. Bir @handle'ınız varsa **Bana gelen istekler** ve **@handle ile gönderdiğim istekler** bölümlerini de görürsünüz.

## Kişiler ve favoriler {#contacts}

**Kişiler** (uygulama: Ayarlar; eklenti: ana ekrandaki bir düğme), ödeme yaptığınız adreslere verdiğiniz adlardır. **Yalnızca bu cihazda** saklanır. Bir kişinin bir adı, ağ başına en fazla bir adresi (QoreChain, EVM, Solana, Cosmos) ve isteğe bağlı bir @handle'ı vardır; liste en fazla 200 kişi tutar.

- **Favoriler.** *Favori (gönderme ekranında gösterilir)* seçeneğini işaretlerseniz kişi, alıcı alanının üstünde tek dokunuşluk bir çip olarak görünür. Bir çip yalnızca formu doldurur: yine de inceleyip onaylarsınız.
- **Ödemeyi tekrarla.** Geçmiş bir ödemede (uygulama: ayrıntı ekranı; eklenti: geçmiş satırı) **Ödemeyi tekrarla**, gönderme formunu aynı alıcı, tutar ve memo ile yeniden doldurur. Herhangi bir şey gönderilmeden önce her zaman inceleyip onaylarsınız.
- **Benzer adres işareti.** Bir kişi kaydı güvenlik kontrolü değildir ve QoreX bunu söyler. Ödemek üzere olduğunuz bir adres, zaten bildiğiniz bir adrese yalnızca *benziyorsa* (ilk ve son karakterler aynı; dolandırıcıların geçmişinize benzer adresler yerleştirerek kullandığı bir hile), inceleme *"Dikkat: bu adres bildiğin bir adrese yalnızca BENZİYOR"* uyarısını verir ve karakter karakter karşılaştırmanız için bilinen adresi gösterir. İkinci bir dokunuş (eklenti) veya bir risk onayı (uygulama) gerektirir. İşaret, kayıtlı kişileriniz, sahip olduğunuz hesaplar ve ödeme yaptığınız adreslerle karşılaştırır.
- **Kayıtlı bir kişi incelemede adıyla belirtilir** (*Kayıtlı kişi: \{name\}*). Kayıtlı bir @handle ayrıca adresinin son ödemenizdekiyle aynı mı, yeni mi yoksa **değişmiş** mi olduğunu gösterir.

## Geçmiş {#history}

Geçmiş, yalnızca gönderimleri değil, bir hesabın her QoreChain işlemini gösterir: alınanlar, stake etme, stake'ten çekme, taşınan stake, talep edilen ödüller, kilitlemeler, bonus, EVM pencereleri, ödül adresi ve ML-DSA-87 anahtar kaydı; tutar, ücret ve *Başarısız (ücret yine de ödendi)* olarak işaretlenen başarısız işlemlerle birlikte. Hibrit rozeti yalnızca zincirin bizzat doğruladığı bir işlemde görünür. Harici ağlar henüz Geçmiş'te yer almaz.

- **Nerede.** Uygulama: hesap seçicisi bulunan **Hareketler** ve **Hesapların** içindeki her hesapta bir **Geçmiş** bağlantısı. Eklenti: ana ekranda hesap seçicisi bulunan **Geçmiş**.
- **Beklemede, onaylandı, başarısız.** Az önce gönderdiğiniz bir transfer, zincir onu tanıyana kadar **Beklemede: ağın onayı bekleniyor** gösterir. Zincirin birkaç dakika sonra hâlâ görmediği bir işlemde *Ağda bulunamadı: başarısız olmuş olabilir. Yeniden göndermeden önce işlemi kontrol et.* yazar. Tahmine dayanarak asla gönderilmiş olarak gösterilmez. **Kapat** böyle bir satırı kaldırır.
- **Hesap başına.** Cüzdanın her hesabının kendi Geçmiş'i vardır.
- **CSV olarak dışa aktarma.** **CSV olarak dışa aktar**, hesabın geçmişini **bu cihazdaki** bir dosyaya yazar. Yalnızca geçmişinizi içerir: ifade yok, anahtar yok. Sütunlar sabittir ve İngilizcedir; bir elektronik tablonun formül olarak okuyabileceği her hücrenin (`=`, `+`, `-` veya `@` ile başlayan bir adres veya memo) başına, metin olarak açılması için bir önek eklenir.
- **Spam gizlenir.** Memo'sunda bir bağlantı veya alan adı bulunan 0,1 QOR'un altındaki gelen transferler, *"Muhtemelen spam olan \{n\} transfer gizlendi"* gibi bir satır ve **Göster** seçeneğiyle Hareketler'den ve bildirimlerden gizlenir. Sıfır değerli transferler gizlenir. Bağlantı içeren bir memo, işlem ayrıntısında bir uyarı taşır: QoreChain ve QoreX sizden asla bir transferle gönderilen bir bağlantıyı ziyaret etmenizi istemez.
- **Budanmış düğümler.** Bir düğüm eski blokları artık tutmuyorsa QoreX, düğüm yanıt verene kadar daha küçük bir sayfa ister ve ağa ulaşılamadığında bunu söyler. Bu durumda artık boş bir liste göstermez.

**QOR sayfası** (Ana Sayfa'da QOR'a dokunun), hesabın gelen ve giden her işlemini, en altta **Daha fazla göster** ile listeler.


## Harici ağlar ve tokenlar {#external-networks-tokens}

Gönderme, QoreX'in listelediği her ağ için açıktır: Ethereum, BNB Smart Chain, Polygon, Arbitrum One, Base, OP Mainnet, Avalanche C-Chain, Solana, Cosmos Hub, Osmosis ve Celestia ile bunların tokenları. BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche ve Celestia bir süre yalnızca alım yapabildikten sonra yeniden çalışıyor. Arbitrum'daki native gönderimler ağın kendi gas tahminini kullanır.
**Tüm ağlar** (veya Harici Gönder) üzerinden **ETH, BNB, POL, AVAX ve SOL**'u yerel olarak, ayrıca **Arbitrum, Base ve OP Mainnet** üzerinde ETH'yi, Cosmos üzerinde **ATOM, OSMO ve TIA**'yı ve **ERC-20**, **SPL** ve **IBC** tokenlarını - EVM zincirleri ve Solana genelinde USDC ve USDT, Ethereum üzerinde DAI ve IBC üzerinden Noble USDC - gönderebilirsiniz; hepsi aynı kurtarma ifadesinden türetilir (ETH `m/44'/60'` kullanır, SOL kendi standart yolunu kullanır ve SPL ilişkili token hesaplarını kullanır).

:::caution Harici zincirler yalnızca klasik imza kullanır
Diğer blok zincirleri ML-DSA-87 imzalarını taşıyamaz. Harici bir ağda gönderim yaptığınızda QoreX bunu açıkça belirtir (transfer klasik bir imza kullanır ve imza satırı onu klasik olarak işaretler). **QOR**'unuz hibrit imzalı native lane'de kalır. Cosmos tabanlı harici gönderimler isteğe bağlı bir notu destekler. EVM ağları için QoreX, onaylamadan önce **maksimum ağ ücretini** de gösterir - "Network fee: at most \{fee\}. Check it before you confirm." - ve tam olarak bu rakamla imzalar.
:::

## Takas

**Takas** sekmesi QoreChain'in zincir üzeri AMM'sine bağlıdır ancak devre dışı kalır - düğmede **"Swap - coming with pool liquidity"** yazar - ta ki likidite ve uzaktan özellik bayrağı onu açana kadar. Bu gerçekleştiğinde otomatik olarak etkinleşir; **uygulama güncellemesi gerekmez**.

:::note iOS
Takas sekmesi App Store sürümünde hiç görünmez - Apple, uygulama içi token değişimini düzenlemeye tabi bir hizmet olarak değerlendirir. Takas, (etkinleştirildiğinde) yalnızca Android'de kullanılabilir olmaya devam eder. Tarayıcı eklentisinde Takas ekranı yoktur.
:::

## Ana ekran ekstraları {#home-extras}

- **Ana ekran widget'ı** (Android ve iPhone) - telefonunuzun widget seçicisinden **QoreX**'i ekleyin. Kullandığınız hesabın QOR bakiyesini gösterir, gizlilik modu açıkken tutar yerine noktalar gösterir, yaklaşık her 30 dakikada bir kendini yeniler ve dokunulduğunda uygulamayı açar. Widget'ın QoreChain sunucularına kendi başına yaptığı hiçbir istek yoktur: uygulama ona adresinizi, bakiyenizi ve gizlilik ayarınızı cihazın üzerinde verir ve widget bakiyeyi herkese açık QoreChain REST uç noktasından okur (bu uç nokta yalnızca herkese açık adresinizi görür). Ana ekranınızı görebilen herkes widget'ı görebilir; bu önemliyse gizlilik modunu açın (bakiyenize dokunun).
- **Anlık bildirimler** (mobil, mainnet) - Ana Sayfa → **Notifications** üzerindeki zilde bir **Push notifications** anahtarı vardır: *"Uygulama kapalıyken bile QOR geldiğinde bildirim alın. Sunucumuz yalnızca herkese açık adreslerinizi izler; Apple ve Google hiçbir tutar veya adres görmez."* Bildirim metni yalnızca "QOR received"dır. Anlık bildirim, siz açana kadar **kapalıdır**. Açıkken sunucu cihaz belirtecinizi ve kullanımdaki cüzdanın herkese açık `qor1…` adreslerini (en fazla 10) tutar; anahtarı kapatmak cihazınızı sunucudan kaldırır ve sunucunun 90 gündür haber almadığı bir cihaz unutulur. Bkz. [QoreX ağ üzerinden neler gönderir](/qorex/overview#data-and-privacy). QoreX için bildirimler telefonunuzun ayarlarında kapalıysa, önce oradan açın. Teslimat Android'de uçtan uca test edilmiştir; iPhone'da bunu en iyi çaba (best effort) olarak değerlendirin ve uygulama içi **Notifications** listesini kontrol etmeye devam edin.
- **Arama ve tur** - bkz. [Yolunuzu bulun](/qorex/getting-started#find-your-way).

## Sonraki adımlar

- [Portföy ve Stake](/qorex/portfolio-and-staking) - tahsisatınızı görün ve ödül kazanın.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) - cüzdanınızı koruyun ve kurtarın.

## Sınırlar ve bilinen sorunlar {#limits}

- Harici ağ transferleri (EVM, Solana, Cosmos) yalnızca klasiktir. SVM ve EVM transferleri hibrit imzayla kapsanmaz.
- Takas kullanılamıyor: havuz likiditesi oluşana kadar kapalıdır ve iOS'ta gösterilmez.
- Bir @kullanıcı adı talep etmek oturum açmış bir hesap gerektirir ve mobil uygulamada yapılır. Ethereum tarzı (coin 60) hesapların kullanıcı adı yoktur. Kullanıcı adı hizmeti çalışmıyorsa, yine de `qor1…` adresiyle ödeme yapabilirsiniz.
- Ödeme istekleri yalnızca QOR ile ödenir. @handle ile istemek (bir handle'a gönderilen istekleri görmek için) talep edilmiş bir @handle gerektirir.
- Geçmiş şimdilik yalnızca QoreChain'i kapsar; diğer ağlar daha sonra eklenecek.
- Anlık bildirimler yalnızca mainnet'tedir ve iPhone'da en iyi çabayla çalışır.
- Vesting QOR ücret ödeyemez; yalnızca kullanılabilir kısım gönderilebilir.
