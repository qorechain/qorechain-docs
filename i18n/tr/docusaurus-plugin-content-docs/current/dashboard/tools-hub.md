---
slug: /dashboard/tools-hub
title: Araç Merkezi
sidebar_label: Araç Merkezi
sidebar_position: 11
---

# Araç Merkezi

**Araçlar** sayfası, QoreChain'in operatör ve geliştirici araçlarını sekmeler halinde tek bir yerde toplar. Buradan altyapı kaydedebilir, bir rollup dağıtabilir, SDK'ya ulaşabilir, doğrulayıcı olmak için başvurabilir ve bu rollerin gerektirdiği lisansları edinebilirsiniz. Her bölüm aşağıda, eksiksiz belgelere nereden ulaşılacağıyla birlikte özetlenmiştir.

Altyapı kaydeden veya başvuru gönderen araçları kullanmak için cüzdanınızı bağlayın — bkz. [Genel Bakış ve Başlangıç](/dashboard/overview#connect-your-wallet).

## Hafif Düğüm

Bir hafif düğüm çalıştırmak ile onun ödül programına katılmak iki farklı şeydir ve Hafif Düğüm sekmesi bunları tek bir kayıt akışında sunmak yerine ayrı tutar:

1. **Düğümünüzü ayağa kaldırın — bugünden çalışır.** Lisans, zincir üzerinde kontrol veya onay gerekmez; bu adım lisans durumunuzdan bağımsız olarak ilk sırada gösterilir. Canlı ağ manifestini okur ve size ikili dosyayı indirip doğrulamak, düğümü genesis ile başlatmak, ağın eşlerine yönlendirmek ve genesis'ten senkronize olmak yerine state-sync yapmak için kopyalamaya hazır komutlar verir.
2. **Ödül programı durumunuzu kontrol edin.** Hafif düğüm ödül payına katılmak, ayrı ve zincir üzerinde kilitli bir adımdır: zincir üzerinde verilmiş aktif bir `lightnode_operator` lisansı, delege edilmiş minimum bir QOR miktarı — delege ettiğiniz her doğrulayıcı başına değil, staking'den canlı olarak okunan, delege ettiğiniz tüm doğrulayıcılar genelindeki toplamınız — ve küçük bir zincir üzerinde kayıt ücreti. **Kayıt henüz açık değildir** ve bir lisans satın almak bunu erken açmaz, dolayısıyla bugün için kaydolunacak bir şey yoktur; bu sekme, açılana kadar gereksinimi gönderilecek bir form olarak değil, kontrol edilecek bir durum olarak gösterir.
3. **Lisansınız zincir üzerinde verildikten sonra kaydolun.** **Buy License** üzerinden satın alınan bir lisans önce bizim tarafımızda kaydedilir — zincir üzerinde verilmesi ayrı bir adımdır ve bu onay gerçekleşene kadar kayıt reddedilir (aşağıdaki Buy License notuna bakın). Onay gerçekleştikten sonra bu sekme, durum panelini bir kayıt formuyla değiştirir: operatör adresiniz (`qor1…`), bir takma ad ve genel bir uç nokta URL'si, artı stake taahhüdünün onayı.
4. **Onaylayın ve stake bağlayın.** Gönderdikten sonra bir özet paneli kaydı onaylar (takma ad, operatör adresi, uç nokta, stake niyeti, durum) ve uygunluk açıldığında onayladığınız stake'i operatör adresinizden bağlamanızı ister.

Tüm tablo için bkz. [Hafif Düğüm Genel Bakış](/light-node/overview) ve [Kayıt ve Lisanslama](/light-node/registration-and-licensing).

## Düğüm Kaydı

Düğüm Kaydı sekmesi bir doğrulayıcı düğümünü zincir üzerinde kaydeder:

1. **Önce PQC anahtarınızı kaydedin — CLI üzerinden, kendi doğrulayıcı düğümünüzde.** Bu, normal bir hesabın ilk işleminde olduğu gibi otomatik değildir: bir doğrulayıcı, lisans başvurusunda bulunmadan veya lisansı kullanmadan ve doğrulayıcıyı oluşturmadan önce PQC anahtar kaydını kendisi çalıştırmalıdır. CLI komutu için bkz. [Bir Doğrulayıcı Çalıştırmak](/developer-guide/running-a-validator#pqc-key-registration).
2. **Lisanslı olduğunuzu onaylayın.** Burada kayıt yapabilmeniz için aktif bir doğrulayıcı lisansı gerekir. **Buy License** üzerinden satın alınan bir lisans bizim tarafımızda kaydedilir; zincir üzerinde verilmesi ayrı bir adımdır ve bu onay gerçekleşene kadar kayıt reddedilir. Henüz lisanslı değilseniz bu sekme **Buy License**'a bağlantı verir — doğrulayıcı lisansları öncelikle onaylanmış bir [Doğrulayıcı Başvurusu](#validator-application) gerektirir.
3. **Kayıt formunu doldurun.** Doğrulayıcı adresinizi veya konsensüs açık anahtarınızı, bir takma ad, bir komisyon oranını (lisansınızın izin verdiği aralık içinde) ve isteğe bağlı bir genel uç nokta girin. Lisanslarınız ağlar arası zincirler içeriyorsa, bu doğrulayıcının hizmet vereceği zincirleri seçin.
4. **Öz stake gereksinimini onaylayın.** Doğrulayıcı öz stake tabanı sabit bir değer olan 100.000 QOR'dur — ayarlanabilir bir seçenek değil, protokol düzeyinde bir sabittir — bir unbonding (çözülme) süresine tabidir ve çevrimdışı kalma veya çifte imzalama durumunda kesintiye uğrar. Bunu onaylayın, ardından kaydolmak için gönderin.
5. **Senkronize edin ve doğrulayıcıyı oluşturun.** Burada kayıt yapmak doğrulayıcınızı kaydeder; düğümünüzü zincirin güncel tepe noktasına siz getirmeli ve `create-validator`'ı, her QoreChain işlemi gibi hibrit PQC ortak imzalı olarak siz göndermelisiniz — bu imzayı geçerli kılan, 1. adımdaki anahtardır.
6. **Onaylayın ve stake bağlayın.** Bir özet paneli kaydı gösterir (takma ad, doğrulayıcı adresi, komisyon, öz stake niyeti, ağlar arası zincirler, durum) ve aktif doğrulayıcı setine girmek için öz stake'inizi bağlamanızı ister.

Stake etme ve doğrulayıcı oluşturma yalnızca QoreChain'in yerel (native) işlem hattında gerçekleşir — MetaMask gibi bağlı bir EVM cüzdanı üzerinden bir doğrulayıcıyı kaydetmenin veya bağlamanın hiçbir yolu yoktur.

Bkz. [Bir Doğrulayıcı Çalıştırmak](/developer-guide/running-a-validator) ve [Stake Etme ve Doğrulayıcılar](/dashboard/staking-and-validators).

## Rollup'lar

Kendi QoreChain destekli rollup'unuzu dağıtın. Yapılandırma formu; rollup'ı adlandırmanıza ve sanal makinesini (EVM, CosmWasm veya SVM), veri kullanılabilirliği katmanını, gas token'ını, sıralayıcı (sequencer) modelini ve uzlaşma hedefini seçmenize olanak tanır. Gönderdikten sonra rollup, canlıya geçmeden önce inceleme sürecinin ardından sağlanır. Bkz. [Rollup'lar Genel Bakış](/rollups/overview) ve [Bir Rollup Dağıtmak](/rollups/deploying-a-rollup).

## SDK

QoreChain üzerinde kodla geliştirme yapmak için bir hızlı başlangıç ve referans merkezi. Bölüm; bağlanma, üç çalışma zamanı genelinde hesap türetme, durum okuma, transfer gönderme ve kuantuma dayanıklı imzalama için kurulum adımlarını ve kopyalamaya hazır kod parçacıklarını, ayrıca bir dil paketleri tablosunu ve depoya, örneklere ve gezgine bağlantıları gösterir. Bkz. [QoreChain SDK Genel Bakış](/sdk/overview) ve [Kurulum](/sdk/install).

## Doğrulayıcı Başvurusu {#validator-application}

Bir Genesis Doğrulayıcısı olmak için başvurun:

1. **Kuruluş bilgilerinizi girin.** Yasal kuruluş adı, ülke/yargı bölgesi ve bir iletişim e-postası.
2. **İstediğiniz katmanı seçin.** Doğrulayıcı katman kataloğundan seçim yapın (her katman kendi slot sayısını ve özellik setini listeler) — bu, onaylandıktan sonra lisanslamayı düşündüğünüz katmandır, henüz bir satın alma değildir.
3. **Altyapınızı tanımlayın.** Altyapı bölgeniz ve donanım/veri merkezi detayları.
4. **Motivasyonunuzu açıklayın.** Ekibinizin doğrulayıcı/altyapı deneyimi ve neden bir QoreChain Genesis Doğrulayıcısı çalıştırmak istediğinize dair kısa bir açıklama.
5. **Uyumluluğu onaylayın ve gönderin.** Bir lisans verilmeden önce başvuran kuruluşun ve gerçek yararlanıcılarının KYC/AML doğrulamasının gerekli olduğunu onaylayın, ardından gönderin.
6. **Durumunuzu takip edin.** Sekme, başvurunuzu inceleniyor, onaylandı veya bir nedenle onaylanmadı (gözden geçirip yeniden gönderme seçeneğiyle) olarak gösterir. Başvurunuz beklemede veya onaylandığında, canlı bir **Doğrulayıcı Hazırlığı** paneli, satın aldığınız şeye göre değil, doğrudan zincire göre üç şeyi kontrol eder: PQC anahtar kaydınız, öz-bağınız (sabit 100.000 QOR — yalnızca harcanabilir bakiye, vesting fonları sayılmaz) ve operatör lisansınızın zincir üzerinde fiilen verilip verilmediği. Her kontrol üç durumdan birini bildirir — karşılandı, henüz karşılanmadı veya zincire ulaşılamadığında *doğrulanamadı* — ve başarısız bir okuma asla "buna sahip değilsiniz" olarak gösterilmez, çünkü bu sizi zaten sahip olduğunuz bir şeyi yeniden yapmaya yönlendirir. Onaylandıktan sonra, bir doğrulayıcı lisansı edinmek için **Buy License**'a geçebilirsiniz.

Bkz. [Bir Doğrulayıcı Çalıştırmak](/developer-guide/running-a-validator).

## Lisans Satın Al

Ağ altyapısını çalıştırmak için gereken lisansları edinin:

1. **Lisanslanacak adresi girin.** Lisansın zincir üzerinde verileceği `qor1…` adresini sağlayın — düğümü fiilen çalıştıracağınız adresi kullanın, çünkü ağın kontrol ettiği adres budur.
2. **Bir ödeme ağı seçin.** ERC-20, BEP-20 veya TRC-20 üzerinde USDT seçin.
3. **Ne satın alacağınızı seçin.** Bir hafif düğüm lisansı herkese açıktır. Doğrulayıcı lisansları (katman kataloğu genelinde) yalnızca [Doğrulayıcı Başvurunuz](#validator-application) onaylandıktan sonra açılır. Ağlar arası eklentiler, bir doğrulayıcı lisansını ek zincirlere genişletir; zincir başına yıllık olarak fiyatlandırılır — istediğiniz zincirleri seçin, ardından satın alın.
4. **Ödemeyi tamamlayın.** Her satın alma sizi, tutarı ve ağı onaylayan ve lisans kayıtlarımızda aktif olarak işaretlenmeden önce ödemeyi zincir üzerinde doğrulayan bir ödeme adımına götürür.
5. **Zincir üzerinde verilmesini bekleyin, ardından kaydolun.** Burada aktif olarak gösterilen bir lisans bizim tarafımızda kaydedilmiştir — onu zincir üzerinde tanınır kılan verilme işlemi ayrı bir adımdır. Kayıt, bizim kayıtlarımızı değil zinciri kontrol eder, bu yüzden verilme gerçekleşmeden önce kaydolmaya çalışmak reddedilecektir. Verilme onaylandıktan sonra, eşleşen zincir üzerindeki kaydı tamamlamak için **Light Node** veya **Node Registration**'a dönün.

Lisanslamanın ağ genelinde nasıl işlediği için bkz. [Zincir Lisanslama](/architecture/chain-licensing).
