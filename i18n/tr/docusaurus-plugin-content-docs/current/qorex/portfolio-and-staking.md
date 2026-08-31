---
slug: /qorex/portfolio-and-staking
title: Portföy ve Stake
sidebar_label: Portföy ve Stake
sidebar_position: 4
---

# Portföy ve Stake

## Portföy

**Portföy** görünümü (her oturumda ilk açtığınızda biyometrik olarak korumalıdır) bir **tahsis çemberi** gösterir — üç şeridinde (Native, EVM, SVM) birleştirilmiş QOR bakiyeniz — çemberin altında bir açıklama ve her varlık için bir satırla birlikte. Yüzdeler, fiyat akışı canlı olduğunda görünür ve her bakiye, QOR tutarının yanında tahmini USD değerini de gösterir.

**Fiyat nereden geliyor.** QoreX bunu `GET https://api.qore.network/v1/price/{symbol}` adresinden okur — herhangi bir borsaya doğrudan bir çağrı değil, bizim genel bir uç noktamız. Cihazınızdaki hiçbir şey QoreChain'in kendi altyapısı dışındaki bir fiyat kaynağıyla konuşmaz, bu yüzden IP adresiniz asla böyle bir kaynağa maruz kalmaz. Savunulabilir bir fiyat gerçekten mevcut değilse, uç nokta tahmin yürütmek yerine bir hatayla yanıt verir — QoreX, uydurulmuş bir sıfırı veya eski bir rakamı sanki güncelmiş gibi göstermek yerine fiyatı kullanılamaz olarak gösterir.

Herhangi bir varlığa dokunarak **Varlık ayrıntısı** ekranını açın; bu ekran şunları gösterir:

- **Bakiye geçmişi** — zincir üstü transferlerinizden oluşturulan gerçek bir trend.
- **Son etkinlik** — ters **@handle** aramasıyla işlem satırları, böylece karşı taraflar mümkün olduğunda ismiyle görünür. Tam ayrıntısını açmak için herhangi bir satıra dokunun: tutar, karşı taraf, blok, işlem hash'i ve imza.

## Stake ve Kazanç

QOR stake etmek, QoreChain'i güvence altına almaya yardımcı olur ve size ödül kazandırır. Tüm stake işlemleri, post-kuantum imzanızı taşıyan gerçek zincir üstü işlemlerdir.

### Bir doğrulayıcı ile stake edin

1. **Stake** ekranını açın.
2. Listeden bir doğrulayıcı seçin (zincirden canlı olarak yüklenir, en düşük stake'e sahip olan önce gösterilir ve şu anda hapiste (jailed) olan doğrulayıcılar listeden çıkarılır — böyle birine delege etmek zaten hiçbir zaman istediğiniz şey değildir).
3. Bir tutar girin ve biyometrik onayla **delege edin**.
4. Ödüller biriktikçe aynı ekrandan talep edin.

:::note Bugün kilitlenme süresi yok — bekleme yalnızca çıkışta
Seçilecek sabit bir süre yok, çünkü şu anda böyle bir şey yok: delegasyon, siz undelegate etmeyi talep edene kadar bir sonraki bloktan itibaren ödüller akarak aktif kalır — yenilenmesi gereken bir son kullanma tarihi ve minimum stake süresi yoktur. Tek bekleme süresi çıkışta yaşanır: undelegate ettiğinizde, o QOR harcanabilir bakiyenize dönmeden önce 21 günlük bir unbonding sürecine girer; bu süre boyunca hiçbir ödül kazanmaz ve taşınamaz. Bir delegasyonu farklı bir doğrulayıcıya taşımak (redelegate) ise bu bekleme süresini tamamen atlar. Bu, kalıcı bir garanti değil, zincirin bugünkü davranışını tanımlar — daha fazlası için [Kilitlenme süresi var mı?](/user-guide/staking-and-delegation#lock-in-period) sayfasına bakın.
:::

### Stake'i doğrulayıcılar arasında taşıyın (redelegate) {#move-stake}

Halihazırda stake ettiğiniz QOR'u başka bir doğrulayıcıya taşıyın — ya da birkaçına bölüştürün — 21 günlük unbonding kuyruğuna hiç dokunmadan. Stake, geçiş boyunca ödül kazanmaya devam eder.

1. **Stake** ekranını açın ve QOR'unuzun şu anda bulunduğu doğrulayıcıya dokunun.
2. Nereye gideceğini seçin — tek bir hedef belirleyin, ya da birden fazlasını aynı anda. Birden fazla hedefe bölüştürmek tutarı eşit olarak böler ve her doğrulayıcıya gidecek kesin rakam onaylamadan önce gösterilir.
3. Biyometrik onayla doğrulayın. Her hedef **tek bir işlemde** taşınır — tek bir ücret, ve ya taşımanın tamamı gerçekleşir ya da hiçbiri.

Delege olduğunuz bir doğrulayıcı hapse girdiğinde (jailed) veya komisyonunu artırdığında yapılacak hamle budur — bu özellik olmadan önce tek çıkış yolu unstake edip hiçbir ödül kazanmadan 21 gün beklemekti; taşımak yerine bunu yapmak ne bekleme ne de kayıp ödül maliyeti getirir.

:::caution Çift başına bir sınır var ve limite takılsanız bile ücret harcanır
Zincir, aynı (kaynak, hedef) doğrulayıcı çifti için aynı anda en fazla **7 devam eden redelegation**'a izin verir — normal kullanım bu sınıra hiçbir zaman yaklaşmaz, ancak QoreX bu sınırı siz imzalamadan önce kontrol eder ve limite ulaştıysanız sizi uyarır. Bu sınırın ötesinde işlem zincir üstünde başarısız olur ve ağ ücreti yine de harcanır, bu yüzden bu nedenle zaten reddedilmiş bir taşımayı, mevcut olanlardan biri tamamlanmadan tekrar denemeyin.
:::

### Undelegate

1. **Stake** ekranını açın, doğrulayıcıya dokunun ve stake'inizi taşımak yerine undelegate etmeyi seçin.
2. Tutarı girin — ekran, onaylamadan önce **21 günlük unbonding süresini** ve ödeyeceğiniz **kesin komisyonu** gösterir.
3. Biyometrik onayla doğrulayın. QOR hemen ödül kazanmayı bırakır ve unbonding süresi tamamlandıktan sonra tekrar harcanabilir hale gelir.

### Kazanç

**Kazanç** görünümü, aktif pozisyonlarınızı ve getirinizi tek bir yerde özetler.

## Sonraki adımlar

- [Gönder ve Al](/qorex/send-and-receive) — QOR ve harici varlıkları taşıyın.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — koruyucular, Legacy miras ve cihaz bağlama.
