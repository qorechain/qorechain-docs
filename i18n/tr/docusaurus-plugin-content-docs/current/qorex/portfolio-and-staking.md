---
slug: /qorex/portfolio-and-staking
title: Portföy ve Stake
sidebar_label: Portföy ve Stake
sidebar_position: 4
---

# Portföy ve Stake

Bu sayfa QoreX'teki Portföy görünümünü ve stake işlemlerini kapsar: QOR'u doğrulayıcılara delege etme, ödülleri talep etme, stake'i taşıma, stake'ten çekme ve zaman kilitli stake. Mobil uygulamada, tarayıcı eklentisinde veya Safari eklentisinde QOR tutan herkes içindir.

## Yenilikler {#innovations}

- **Rakamlar zincirden gelir.** Unbonding süresi ve temel getiri cüzdana sabitlenmemiştir, ağdan okunur.
- **Ağın reddedeceği taşımalar önce yakalanır.** Stake'i taşı ekranı, taşınamayanları soluk gösterir ve bir ücret harcanmadan önce nedenini söyler.
- **Ödüller aynı cüzdanın başka bir hesabına gidebilir** ve yalnızca oraya.
- **Uydurma sıfır yok.** Ağ yanıt vermediğinde QoreX, kendisine verilen son değerleri zamanlarıyla birlikte ya da bir tire gösterir.

## Portföy

**Portföy** görünümü (her oturumda ilk açtığınızda biyometrik olarak korumalıdır) bir **tahsis çemberi** gösterir - üç şeridinde (Native, EVM, SVM) birleştirilmiş QOR bakiyeniz - çemberin altında bir açıklama ve her varlık için bir satırla birlikte. Yüzdeler, fiyat akışı canlı olduğunda görünür ve her bakiye, QOR tutarının yanında tahmini USD değerini de gösterir. **Test ağında** QOR **USD değeri olmadan** gösterilir - test tokenlarının değeri yoktur.

Henüz hiç sahip olmadan coin ve token eklemek için **+ Coin veya token**'ı, adreslerini almak için **Al**'ı kullanın - bkz. [Coin'ler ve tokenlar](/qorex/send-and-receive#coins-and-tokens).

**Fiyat nereden geliyor.** QoreX bunu `GET https://api.qore.network/v1/price/{symbol}` adresinden okur - herhangi bir borsaya doğrudan bir çağrı değil, bizim genel bir uç noktamız. Cihazınızdaki hiçbir şey QoreChain'in kendi altyapısı dışındaki bir fiyat kaynağıyla konuşmaz, bu yüzden IP adresiniz asla böyle bir kaynağa maruz kalmaz. Savunulabilir bir fiyat gerçekten mevcut değilse, uç nokta tahmin yürütmek yerine bir hatayla yanıt verir - QoreX, uydurulmuş bir sıfırı veya eski bir rakamı sanki güncelmiş gibi göstermek yerine fiyatı kullanılamaz olarak gösterir.

Herhangi bir varlığa dokunarak **Varlık ayrıntısı** ekranını açın; bu ekran şunları gösterir:

- **Bakiye geçmişi** - zincir üstü transferlerinizden oluşturulan gerçek bir trend.
- **Son etkinlik** - ters **@handle** aramasıyla işlem satırları, böylece karşı taraflar mümkün olduğunda ismiyle görünür. Tam ayrıntısını açmak için herhangi bir satıra dokunun: tutar, karşı taraf, blok, işlem hash'i ve imza.

**QOR** sayfası, hesabın gelen ve giden her işlemini, en altta **Daha fazla göster** ile listeler. Her tür işlem, beklemede ve başarısız durumları ve CSV dışa aktarma için bkz. [Geçmiş](/qorex/send-and-receive#history). Testnet'te QOR'un Ana Sayfa'da veya Portföy'de dolar değeri yoktur.

## Ağ yavaşken veya yanıt vermiyorken {#network-status}

- **Ağ durumu bandı.** QoreX zincirdeki en son bloğun zamanını kontrol eder. Blok bir dakikadan eskiyse bir bant *"Ağ yavaş: en son blok \{seconds\} saniye önce. İşlemler daha uzun sürebilir."* der. Hiçbir düğüm yanıt vermezse *"Şu anda ağa ulaşılamıyor. Bakiyeler güncel olmayabilir."* der. Bu, bir durum sayfası değil, zincirin kendi blok zamanıdır.
- **Bilinen son değerler.** Ağ yanıt vermediğinde (örneğin bir düğüm yeniden indeksleme yaparken veya bir güncellemeden sonra), eklentinin hesap kartı ile uygulamanın Ana Sayfa ve Stake ekranları, ağın o hesap için verdiği son bakiyeyi ve delegasyonları göstermeye devam eder ve bunu belirtir: *"Ağ yanıt vermiyor. Bunlar \{time\} tarihli bilinen son değerler."* Eski bir bakiyeye dolar değeri konmaz.
- **Okunamayan ödüller** 0 QOR değil, bir tire gösterir ve onlar için **Talep et** sunulmaz.

## Stake ve Kazanç {#staking}

QOR stake etmek, QoreChain'i güvence altına almaya yardımcı olur ve size garanti edilmeyen ödüller kazandırır. Tüm stake işlemleri, hibrit imzalı yerel şeritteki gerçek zincir üstü işlemlerdir: her biri iki kez imzalanır, klasik bir anahtarla ve ML-DSA-87 (FIPS 204) ile. Stake işlemi asla bir EVM precompile'ı üzerinden geçmez.

### Stake işlemlerinin yeri {#staking-screens}

- **Uygulama:** **Stake** ekranı toplamınızı, **Talep et** ile birlikte ödüllerinizi ve altında doğrulayıcıları gösterir. Talep etme ve yeniden stake etme, ödül adresi ve kilitler gibi ek denetimler listeyle birlikte kayar. Stake kademeleri tablosu tek satıra katlanmıştır: açmak için dokunun.
- **Eklenti ve Safari:** **Staking** bir menüdür ve her eylem, tek satırlık bir açıklaması, kendi hata mesajları ve **Stake'e dön** düğmesi olan kendi ekranını açar: **QOR stake et**, **Stake'ten çek**, **Stake'i taşı**, **Talep et**, **Talep et ve yeniden stake et**, **Bonus için kilitle** ve **Ödüllerin gittiği yer**. **Talep et** her zaman listelenir. Birden fazla hesabınız varsa bir hesap seçici görünür.

### Bir doğrulayıcı ile stake edin

1. **Stake** ekranını açın.
2. Listeden bir doğrulayıcı seçin (zincirden canlı olarak yüklenir, en düşük stake'e sahip olan önce gösterilir ve şu anda hapiste (jailed) olan doğrulayıcılar listeden çıkarılır - böyle birine delege etmek zaten hiçbir zaman istediğiniz şey değildir). QOR'unuzun zaten bulunduğu doğrulayıcılarda bir *mizada* rozeti bulunur.
3. Bir tutar girin. Siz yazarken, geriye kalacak tutar bir sonraki ağ ücretini karşılamayacaksa QoreX sizi uyarır: *"Bu işlem \{remaining\} QOR bırakır, yani bir işlemin maliyeti olan \{fee\} QOR'dan az. Bu hesap ücret için yeniden QOR tutana kadar stake'ten çekemez veya ödül talep edemezsiniz."* Bu bir engel değil, bir uyarıdır - bu sizin paranız - ancak stake'ten çekmek ve talep etmek, her ikisi de **likit** bakiyenizden bir ücrete mal olur; bu yüzden neredeyse sıfıra kadar stake etmek, biri QOR gönderene kadar stake'i kilitler.
4. **Onaylayın** (mobilde biyometri). Vesting QOR'u toplamınıza kadar stake edebilirsiniz, ancak ağ ücreti **kilidi açılmış** QOR'unuzdan karşılanmalıdır - vesting QOR ücret ödeyemez.
5. Ödüller biriktikçe talep edin - aşağıya bakın.

Bir hesabın ilk işleminde stake ekranları, bu işlemin hesabın ML-DSA-87 anahtarını da kaydettiğini (tek seferlik bir ağ ücreti) söyler.

:::note Sıradan delegasyonda kilitlenme süresi yok - bekleme yalnızca çıkışta
Sıradan bir delegasyonun sabit bir süresi yoktur: siz undelegate etmeyi talep edene kadar bir sonraki bloktan itibaren ödüller akarak aktif kalır. Yenilenmesi gereken bir son kullanma tarihi ve minimum stake süresi yoktur. Tek bekleme süresi çıkışta yaşanır: undelegate ettiğinizde, o QOR harcanabilir bakiyenize dönmeden önce bir **unbonding süresine** girer; bu süre boyunca hiçbir ödül kazanmaz ve taşınamaz. QoreX bu sürenin uzunluğunu ağdan okur ve onaylamadan önce gösterir (bu satırlar yazıldığında QoreChain'de 21 gün; okunamazsa QoreX *ağın belirlediği süre* der). Bir delegasyonu farklı bir doğrulayıcıya taşımak (redelegate) ise bu bekleme süresini tamamen atlar. Zaman kilitli stake isteğe bağlıdır, aşağıdaki [Stake kilitleri](#staking-locks) bölümüne bakın. Ayrıca bkz. [Kilitlenme süresi var mı?](/user-guide/staking-and-delegation#lock-in-period).
:::


### Stake kilitleri {#staking-locks}

Stake kilitleri uygulamada ve Safari dahil eklentilerde bulunur. Kilit isteğe bağlıdır. Stake'inizin bir kısmını bir bonus karşılığında 3, 6 veya 12 ay boyunca taahhüt eder.

- **Gösterilen bonus, kilidin bugün kazandırdığı bonustur**, ağın belirlediği tavanın altında. Ağ koşulları değiştikçe değişebilir ve garanti edilmez.
- **Kademe çizelgesi "up to" (en çok) olarak etiketlenir**, bugünün rakamı yanında gösterilir.
- **Erken kilit açma**, imzalamadan önce maliyeti belirten ikinci bir onayın arkasındadır.
- **Stake'ten çek ve Stake'i taşı, stake'inizin yalnızca kilidi açık kısmıyla** sınırlıdır.

Modülün zincir üzerinde nasıl çalıştığı için bkz. [Zaman kilitli stake](/user-guide/staking-and-delegation#time-locked-staking).

### Stake'i doğrulayıcılar arasında taşıyın (redelegate) {#move-stake}

Halihazırda stake ettiğiniz QOR'u başka bir doğrulayıcıya taşıyın - ya da birkaçına bölüştürün - unbonding kuyruğundan hiç geçmeden. Stake, geçiş boyunca ödül kazanmaya devam eder.

**Eklenti ve Safari** (Stake → **Stake'i taşı**) sizi üç adımdan geçirir:

1. **Move from.** Stake'inizin ayrılacağı doğrulayıcıyı seçin. Her biri *Stake \{held\} QOR · taşınabilir \{free\} QOR* (ve varsa kilitli tutarı) gösterir. Henüz taşıma yapamayacağınız bir doğrulayıcı, tarihle birlikte soluk gösterilir: *"\{date\} sonrasında buradan yeniden taşıyabilirsiniz: buraya taşıdığınız stake önce ulaşmalı."*
2. **Move to.** Bir veya birden fazla hedef seçin. Zaten azami sayıda taşıması süren bir çift devre dışı bırakılır (*"\{n\} taşıma sürüyor, zincir \{max\} taneye izin veriyor"*).
3. **How much.** Tutarı girin veya **Max**'a (kaynaktaki serbest, kilidi açık tutar) dokunun. Rota (*From ... to ...*) ve birden fazla hedef için bölüşüm (*\{amount\} QOR to each of \{n\} validators*) düğmeden önce gösterilir. Varsa hata ve ağın yanıtı düğmenin yanında görünür.

**Uygulama:** **Stake** ekranını açın, QOR'unuzun bulunduğu doğrulayıcıya dokunun ve **Stake'i taşı**'yı seçin. Aynı kontroller açtığınız doğrulayıcı üzerinde çalışır. Bir veya birden fazla hedef seçin, tutarı girin (kendi alanı ve **Max** düğmesi vardır), bölüşümü kontrol edin ve biyometriyle onaylayın.

Birden fazla hedefe bölüştürmek tutarı eşit olarak böler ve her hedef **tek bir işlemde** taşınır - tek bir ücret, ve ya taşımanın tamamı gerçekleşir ya da hiçbiri.

Delege olduğunuz bir doğrulayıcı hapse girdiğinde (jailed) veya komisyonunu artırdığında yapılacak hamle budur: taşımak ne bekleme ne de kayıp ödül maliyeti getirir.

:::caution Bir taşımayı reddedebilecek zincir kuralları
- **Çift başına süren 7 taşıma.** Zincir, aynı (kaynak, hedef) doğrulayıcı çifti için aynı anda en fazla 7 devam eden redelegation'a izin verir.
- **Taşınan stake hemen yeniden taşınamaz.** Bir doğrulayıcıya az önce **taşıdığınız** stake, onu oraya getiren taşıma tamamlanana kadar (ağın unbonding süresi) o doğrulayıcıdan **başka yere** taşınamaz. Yine de onu stake'ten çekebilir veya zaten o doğrulayıcıda bulunan stake'i taşıyabilirsiniz.

QoreX imzalamadan önce ikisini de kontrol eder. Ağ yine de bir taşımayı reddederse QoreX nedenini bir kodla değil sözcüklerle söyler; zincirde reddedilen bir taşıma yine de ağ ücretini ödemiştir, bu yüzden beklemeden yeniden denemeyin.
:::

### Talep et ve Talep et ve yeniden stake et {#claim}

- **Talep et**, ödüllerinizi bakiyenize toplar. QoreX yalnızca gerçekten bekleyen ödülü olan doğrulayıcılardan talep eder.
- **Getirdiğinden pahalıya mal olan talep.** Talep ücreti ödüllerinizden büyükse ilk dokunuş sizi uyarır ve düğme **Yine de talep et** olarak değişir. Beklerseniz ödüller büyümeye devam eder.
- **Talep et ve yeniden stake et** (*Talep et ve yeniden stake et* düğmesi: "\{amount\} QOR'u aynı doğrulayıcılara tek işlemde geri bileşikleyin.") ödülleri talep eder ve onları kazandıran doğrulayıcılara doğrudan geri delege eder - tek işlem, tek ücret. Yalnızca QoreX doğrulayıcı başına dökümü okuyabildiğinde sunulur. Tek bir işlem **en fazla 127 doğrulayıcıyı** kapsayabilir; daha fazlası varsa QoreX bunu söyler ve hiçbir şey imzalamaz.
- **Ücret kontrolü.** Ücret, ödüller gelmeden *önce* ödenir. Kilidi açılmış QOR'unuz bunu karşılayamıyorsa, QoreX siz imzalamadan önce durur ve ne kadar gerektiğini söyler ("Ödül talebi, ağ ücreti için yaklaşık \{fee\} kilitsiz QOR gerektirir; ücret ödüller gelmeden önce ödenir."); o adrese biraz QOR gönderin ve yeniden deneyin. Vesting QOR ücret ödeyemez.

### Ödüllerin nereye gideceğini seçin {#rewards-address}

Varsayılan olarak ödüller onları kazanan hesaba gider. **Gelecekteki** ödülleri **aynı cüzdanın başka bir hesabına** gönderebilirsiniz ve yalnızca oraya.

1. Uygulama: **Stake** ekranında **Ödüllerin gittiği yer** bölümünü açın. Eklenti ve Safari: **Staking → Ödüllerin gittiği yer**. Ödüllerin şu anda nereye gittiğini görürsünüz.
2. **Ödüllerin gideceği yeri değiştir**'i seçin ve hesaplarınızdan birini seçin.
3. İlk dokunuş hesabın adını tam olarak belirtir (*"Gelecek ödüller \{name\} hesabına gidecek. İmzalamak için tekrar dokunun."*); ikincisi imzalar (hibrit imza, normal ağ ücreti; uygulamada biyometri).

Stake'iniz yer değiştirmez. QoreX kendi adreslerinizi kurtarma ifadenizden hesaplar, dolayısıyla cüzdan dışındaki bir adrese yönlendirilemez ve web siteleri bu değişikliği isteyemez. Ödüller zaten cüzdanınızın dışındaki bir adrese gidiyorsa QoreX bunu belirtir ve onları hesaplarınızdan birine göndermeyi önerir.

### Gas fiyatı ve işlem boyutu {#gas}

QoreX ağın güncel asgari gas fiyatını okur. Ağ bu fiyatı yükseltirse QoreX yeni asgarinin üzerinde öder; cüzdana yerleşik fiyatlar taban olarak kalır. İncelemede gösterilen ücret, imzalanan ücrettir. QoreChain tek bir işlemde en fazla **50.000.000 gas** kabul eder: daha büyük bir işlem herhangi bir şey imzalanmadan önce reddedilir ve ücret alınmaz, bu yüzden onu daha küçük parçalara bölün (örneğin bir seferde daha az doğrulayıcıdan talep edin).

### Undelegate

1. **Stake** ekranını açın ve doğrulayıcıya dokunun. Onunla QOR'unuz varsa, panel **Stake'ten çek** (ve **Stake'i taşı**) seçeneğini sunar.
2. Tutarı girin. Panel, o doğrulayıcıda ne kadarınızın olduğunu ve **Stake'ten çek** düğmesinin üstünde stake'ten çekmenin ne kadar sürdüğünü (*"Stake bozma, QOR'u hareket ettirebilmen için \{days\} sürer."*, süre ağdan okunur) gösterir - onaylamadan önce beklemeyi görürsünüz.
3. Biyometrik onayla doğrulayın. QOR hemen ödül kazanmayı bırakır ve unbonding süresi tamamlandıktan sonra tekrar harcanabilir hale gelir.

### Devam eden unstake işlemleri {#unbonding}

Stake'ten çekilen QOR, ağın unbonding süresi boyunca hem delegasyonunuzdan hem de harcanabilir bakiyenizden çıkar. QoreX bunu **Stake'ten çıkış sürüyor** altında listeler - *"\{amount\} QOR çıkışta"*, her kayıt kalan süreyle birlikte (*\{days\}g \{hours\}sa \{minutes\}dk kaldı*, veya *Bir dakikadan az kaldı*, veya *Bekleme bitti. Bunun bakiyene dönmüş olması gerekir.*). QoreX bir kaydın ne zaman tamamlanacağını okuyamazsa bunu söyler ve tutarı toplamda tutar. Node'unuza ulaşılamazsa liste olduğu gibi kalır - asla "stake'ten çekilen bir şey yok" gibi görünmez.

:::note Bir doğrulayıcı çalıştırırken unstake etme
Cüzdanınız bir doğrulayıcı operatörüne aitse, self-bond'unuzu gereken 100.000 QOR'un altına düşürecek bir unstake reddedilir: *"Bu kadarını unstake etmek, doğrulayıcınızın self-bond'unu gereken 100.000 QOR'un altına düşürür. Bu alt sınır, doğrulayıcı çalıştığı sürece geçerlidir."*
:::

### Kazanç

**Kazanç** görünümü, stake'inizi tek bir yerde özetler: stake edilen QOR'unuz, talep edilebilir ödülleriniz, kaç doğrulayıcıyla olduğunuz ve ağ genelinde stake edilen tüm QOR'un payı.

**Getiri.** Yıllık temel oran **zincirin kendi rakamından** gelir. *Doğrulayıcının komisyonundan önce* gösterilir ve **değişkendir, garanti edilmez**. Zincir ödüllerin artık yalnızca ücretlerden geldiğini bildirirse QoreX yüzde yerine *ücretlerden ödül* der. Rakam okunamazsa QoreX destekleyemeyeceği bir sayı yerine *Kullanılamıyor* gösterir. Zaman kilidinin bonusu ayrı bir rakamdır, bkz. [Stake kilitleri](#staking-locks).

Eklenti ve Safari'de stake parçaları ayrı ekranlardadır, bkz. [Stake işlemlerinin yeri](#staking-screens).

## Sonraki adımlar

- [Gönder ve Al](/qorex/send-and-receive) - QOR ve harici varlıkları taşıyın.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) - koruyucular, Legacy miras ve cihaz bağlama.

## Sınırlar ve bilinen sorunlar {#limits}

- Ödüller garanti edilmez ve gösterilen getiri değişkendir, komisyon öncesidir.
- Stake'ten çekilen QOR yalnızca ağın unbonding süresinden sonra geri döner (bu satırlar yazıldığında 21 gün); stake'i doğrulayıcılar arasında taşımanın beklemesi yoktur, ancak aynı doğrulayıcı çifti için süren 7 taşımayla sınırlıdır ve taşınan stake, taşıması tamamlanana kadar yeniden taşınamaz.
- Ödüller yalnızca aynı cüzdanın başka bir hesabına yönlendirilebilir.
- Talep et ve yeniden stake et tek işlemde en fazla 127 doğrulayıcıyı kapsar ve hiçbir işlem 50.000.000 gas'ı aşamaz.
- Vesting QOR stake edilebilir ancak ücret ödeyemez; ücret kilidi açılmış QOR'dan karşılanmalıdır.
- Portföy yalnızca mobildedir. Test ağında QOR için USD değeri gösterilmez.
