---
slug: /qorex/portfolio-and-staking
title: Portföy ve Stake
sidebar_label: Portföy ve Stake
sidebar_position: 4
---

# Portföy ve Stake

## Portföy

**Portföy** görünümü (her oturumda ilk açtığınızda biyometrik olarak korumalıdır) bir **tahsis çemberi** gösterir — üç şeridinde (Native, EVM, SVM) birleştirilmiş QOR bakiyeniz — çemberin altında bir açıklama ve her varlık için bir satırla birlikte. Yüzdeler, fiyat akışı canlı olduğunda görünür ve her bakiye, QOR tutarının yanında tahmini USD değerini de gösterir. **Test ağında** QOR **USD değeri olmadan** gösterilir — test tokenlarının değeri yoktur.

Henüz hiç sahip olmadan coin ve token eklemek için **+ Coin or token**'ı, adreslerini almak için **Receive**'i kullanın — bkz. [Coin'ler ve tokenlar](/qorex/send-and-receive#coins-and-tokens).

**Fiyat nereden geliyor.** QoreX bunu `GET https://api.qore.network/v1/price/{symbol}` adresinden okur — herhangi bir borsaya doğrudan bir çağrı değil, bizim genel bir uç noktamız. Cihazınızdaki hiçbir şey QoreChain'in kendi altyapısı dışındaki bir fiyat kaynağıyla konuşmaz, bu yüzden IP adresiniz asla böyle bir kaynağa maruz kalmaz. Savunulabilir bir fiyat gerçekten mevcut değilse, uç nokta tahmin yürütmek yerine bir hatayla yanıt verir — QoreX, uydurulmuş bir sıfırı veya eski bir rakamı sanki güncelmiş gibi göstermek yerine fiyatı kullanılamaz olarak gösterir.

Herhangi bir varlığa dokunarak **Varlık ayrıntısı** ekranını açın; bu ekran şunları gösterir:

- **Bakiye geçmişi** — zincir üstü transferlerinizden oluşturulan gerçek bir trend.
- **Son etkinlik** — ters **@handle** aramasıyla işlem satırları, böylece karşı taraflar mümkün olduğunda ismiyle görünür. Tam ayrıntısını açmak için herhangi bir satıra dokunun: tutar, karşı taraf, blok, işlem hash'i ve imza.

## Stake ve Kazanç

QOR stake etmek, QoreChain'i güvence altına almaya yardımcı olur ve size garanti edilmeyen ödüller kazandırır. Tüm stake işlemleri, post-kuantum imzanızı taşıyan gerçek zincir üstü işlemlerdir.

### Bir doğrulayıcı ile stake edin

1. **Stake** ekranını açın.
2. Listeden bir doğrulayıcı seçin (zincirden canlı olarak yüklenir, en düşük stake'e sahip olan önce gösterilir ve şu anda hapiste (jailed) olan doğrulayıcılar listeden çıkarılır — böyle birine delege etmek zaten hiçbir zaman istediğiniz şey değildir). QOR'unuzun zaten bulunduğu doğrulayıcılarda bir *staked* rozeti bulunur.
3. Bir tutar girin. Siz yazarken, geriye kalacak tutar bir sonraki ağ ücretini karşılamayacaksa QoreX sizi uyarır: *"Bu işlem \{remaining\} QOR bırakır — bir işlemin maliyeti olan \{fee\} QOR'dan az. Bu hesap ücret için yeniden QOR tutana kadar unstake edemez veya ödül talep edemezsiniz."* Bu bir engel değil, bir uyarıdır — bu sizin paranız — ancak unstake etmek ve talep etmek, her ikisi de **likit** bakiyenizden bir ücrete mal olur; bu yüzden neredeyse sıfıra kadar stake etmek, biri QOR gönderene kadar stake'i kilitler.
4. **Onaylayın** (mobilde biyometri). Vesting QOR'u toplamınıza kadar stake edebilirsiniz, ancak ağ ücreti **kilidi açılmış** QOR'unuzdan karşılanmalıdır — vesting QOR ücret ödeyemez.
5. Ödüller biriktikçe aynı ekrandan talep edin — aşağıya bakın.

:::note Bugün kilitlenme süresi yok — bekleme yalnızca çıkışta
Seçilecek sabit bir süre yok, çünkü şu anda böyle bir şey yok: delegasyon, siz undelegate etmeyi talep edene kadar bir sonraki bloktan itibaren ödüller akarak aktif kalır — yenilenmesi gereken bir son kullanma tarihi ve minimum stake süresi yoktur. Tek bekleme süresi çıkışta yaşanır: undelegate ettiğinizde, o QOR harcanabilir bakiyenize dönmeden önce 21 günlük bir unbonding sürecine girer; bu süre boyunca hiçbir ödül kazanmaz ve taşınamaz. Bir delegasyonu farklı bir doğrulayıcıya taşımak (redelegate) ise bu bekleme süresini tamamen atlar. İsteğe bağlı bir zaman kilitli stake modülü yalnızca test ağında denenmektedir (v3.2.4; bkz. [Zaman kilitli stake](/user-guide/staking-and-delegation#time-locked-staking)); ana ağda yoktur ve QoreX'te bunun için bir ekran bulunmaz. Bu, kalıcı bir garanti değil, ana ağın bugünkü davranışını tanımlar — daha fazlası için [Kilitlenme süresi var mı?](/user-guide/staking-and-delegation#lock-in-period) sayfasına bakın.
:::

### Stake'i doğrulayıcılar arasında taşıyın (redelegate) {#move-stake}

Halihazırda stake ettiğiniz QOR'u başka bir doğrulayıcıya taşıyın — ya da birkaçına bölüştürün — 21 günlük unbonding kuyruğuna hiç dokunmadan. Stake, geçiş boyunca ödül kazanmaya devam eder.

1. **Stake** ekranını açın ve QOR'unuzun şu anda bulunduğu doğrulayıcıya dokunun; panel **Move stake** seçeneğini sunar.
2. Nereye gideceğini seçin — tek bir hedef belirleyin, ya da birden fazlasını aynı anda. Birden fazla hedefe bölüştürmek tutarı eşit olarak böler ve her doğrulayıcıya gidecek kesin rakam onaylamadan önce gösterilir.
3. Biyometrik onayla doğrulayın. Her hedef **tek bir işlemde** taşınır — tek bir ücret, ve ya taşımanın tamamı gerçekleşir ya da hiçbiri.

Delege olduğunuz bir doğrulayıcı hapse girdiğinde (jailed) veya komisyonunu artırdığında yapılacak hamle budur — bu özellik olmadan önce tek çıkış yolu unstake edip hiçbir ödül kazanmadan 21 gün beklemekti; taşımak yerine bunu yapmak ne bekleme ne de kayıp ödül maliyeti getirir.

:::caution Çift başına bir sınır var ve limite takılsanız bile ücret harcanır
Zincir, aynı (kaynak, hedef) doğrulayıcı çifti için aynı anda en fazla **7 devam eden redelegation**'a izin verir — normal kullanım bu sınıra hiçbir zaman yaklaşmaz, ancak QoreX bu sınırı siz imzalamadan önce kontrol eder ve limite ulaştıysanız sizi uyarır. Bu sınırın ötesinde işlem zincir üstünde başarısız olur ve ağ ücreti yine de harcanır, bu yüzden bu nedenle zaten reddedilmiş bir taşımayı, mevcut olanlardan biri tamamlanmadan tekrar denemeyin.

Zincirin bir kuralı daha: bir doğrulayıcıya az önce **taşıdığınız** stake, onu oraya getiren taşıma tamamlanana kadar (21 gün) o doğrulayıcıdan **başka yere** taşınamaz — bir taşıma bu nedenle reddedildiğinde QoreX size bunu söyler. Yine de onu unstake edebilir veya zaten o doğrulayıcıda bulunan stake'i taşıyabilirsiniz.
:::

### Talep et ve Talep et ve yeniden stake et {#claim}

- **Claim**, ödüllerinizi bakiyenize toplar. QoreX yalnızca gerçekten bekleyen ödülü olan doğrulayıcılardan talep eder.
- **Claim & restake** (*Claim & restake* düğmesi: "\{amount\} QOR'u aynı doğrulayıcılara tek işlemde geri bileşikleyin.") ödülleri talep eder ve onları kazandıran doğrulayıcılara doğrudan geri delege eder — tek işlem, tek ücret. Yalnızca QoreX doğrulayıcı başına dökümü okuyabildiğinde sunulur.
- **Ücret kontrolü.** Ücret, ödüller gelmeden *önce* ödenir. Kilidi açılmış QOR'unuz bunu karşılayamıyorsa, QoreX siz imzalamadan önce durur ve ne kadar gerektiğini söyler ("Talep etmek için ağ ücreti olarak yaklaşık \{fee\} QOR'un kilidinin açılmış olması gerekir — ödüller gelmeden önce ödenir."); o adrese biraz QOR gönderin ve yeniden deneyin. Vesting QOR ücret ödeyemez.

### Undelegate

1. **Stake** ekranını açın ve doğrulayıcıya dokunun. Onunla QOR'unuz varsa, panel **Unstake** (ve **Move stake**) seçeneğini sunar.
2. Tutarı girin. Panel, o doğrulayıcıda ne kadarınızın olduğunu ve **Unstake** düğmesinin üstünde "Unstake etmek, QOR'un taşıyabileceğiniz hale gelmesinden önce 21 gün sürer" ifadesini gösterir — onaylamadan önce 21 günlük beklemeyi görürsünüz.
3. Biyometrik onayla doğrulayın. QOR hemen ödül kazanmayı bırakır ve unbonding süresi tamamlandıktan sonra tekrar harcanabilir hale gelir.

### Devam eden unstake işlemleri {#unbonding}

Unstake edilen QOR, 21 gün boyunca hem delegasyonunuzdan hem de harcanabilir bakiyenizden çıkar. QoreX bunu **Unstaking in progress** altında listeler — *"\{amount\} QOR unstake ediliyor"*, her kayıt kalan süreyle birlikte (*\{days\}g \{hours\}sa \{minutes\}dk kaldı*, veya *Bir dakikadan az kaldı*, veya *Bekleme sona erdi — bu tutar bakiyenize geri dönmüş olmalı.*). QoreX bir kaydın ne zaman tamamlanacağını okuyamazsa bunu söyler ve tutarı toplamda tutar. Node'unuza ulaşılamazsa liste olduğu gibi kalır — asla "unstake edilen bir şey yok" gibi görünmez.

:::note Bir doğrulayıcı çalıştırırken unstake etme
Cüzdanınız bir doğrulayıcı operatörüne aitse, self-bond'unuzu gereken 100.000 QOR'un altına düşürecek bir unstake reddedilir: *"Bu kadarını unstake etmek, doğrulayıcınızın self-bond'unu gereken 100.000 QOR'un altına düşürür. Bu alt sınır, doğrulayıcı çalıştığı sürece geçerlidir."*
:::

### Kazanç

**Kazanç** görünümü, stake'inizi tek bir yerde özetler: stake edilen QOR'unuz, talep edilebilir ödülleriniz, kaç doğrulayıcıyla olduğunuz ve ağ genelinde stake edilen tüm QOR'un payı. Hiçbir stake oranı göstermez — zincir, bir oranın türetilebileceği bir emisyon rakamı yayımlamaz; bu nedenle QoreX, destekleyemeyeceği bir sayı yerine *Not available* gösterir.

Eklentide Stake ekranı aynı parçalara sahiptir (stake edilen toplam, ödüller, **Claim**, **Claim & restake**, **Unstake**, **Move stake**, birden çok hesabınız olduğunda bir hesap seçici ve unstake uyarısı).

## Sonraki adımlar

- [Gönder ve Al](/qorex/send-and-receive) — QOR ve harici varlıkları taşıyın.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — koruyucular, Legacy miras ve cihaz bağlama.
