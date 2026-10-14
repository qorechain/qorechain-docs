---
slug: /dashboard/tools-hub
title: Araç Merkezi
sidebar_label: Araç Merkezi
sidebar_position: 11
---

# Araç Merkezi

**Araçlar** sayfası, QoreChain'in operatör ve geliştirici araçlarını tek bir yerde toplar ve şu sırayla yedi sekmeye ayırır: **Information**, **Validator Application**, **Buy License**, **Light Node**, **Node Registration**, **Rollups** ve **SDK**. **Information** sekmesi, doğrulayıcı ve hafif düğüm programlarına dair salt okunur bir genel bakıştır — katılmanın üç yolu (genesis doğrulayıcısı, hafif düğüm, delegatör), lisans katmanları, stake etme ve kesinti (slashing) temelleri, donanım gereksinimleri, programı kimin işlettiği ve bir SSS. Diğer sekmeler aşağıda, eksiksiz belgelere nereden ulaşılacağıyla birlikte özetlenmiştir. Yayınlanan sürümler ağlar arasında farklılık gösterebileceğinden, Araçlar sayfası üst bilgideki ağ anahtarını izler.

Kayıtları kaydeden veya başvuru gönderen araçları kullanmak için oturum açın — bkz. [Oturum açma](/dashboard/overview#sign-in).

## Hafif Düğüm

Bir hafif düğüm çalıştırmak ile onun ödül programına katılmak iki farklı şeydir ve Hafif Düğüm sekmesi bunları tek bir kayıt akışında sunmak yerine ayrı tutar:

1. **Yazılımı edinin — bugünden çalışır.** Lisans, zincir üzerinde kontrol veya onay gerekmez; bu adım lisans durumunuzdan bağımsız olarak ilk sırada gösterilir. Sekme canlı ağ manifestini okur ve size tam bir QoreChain düğümü için kopyalamaya hazır komutlar verir (ikili dosyayı indirip doğrulama, düğümü genesis ile başlatma, ağın eşlerine yönlendirme ve genesis'ten senkronize olmak yerine state-sync yapma). Bir hafif düğümün kendisi yalnızca `lightnode-sx` veya `lightnode-ux` ikili dosyasına ihtiyaç duyar — bkz. [Hafif Düğüm Genel Bakış](/light-node/overview). Komutların altında, **Download the light node** yayınlanmış derlemeleri sha256 sağlama toplamlarıyla listeler — altı platformda bir **Desktop edition** (web panosunu içerir) ve bir **Server edition** (başsız, komut satırı); çalıştırmadan önce dosyayı sağlama toplamına karşı kontrol edin. Seçtiğiniz ağ için yayınlanmış bir derleme yoksa panel bunu belirtir.
2. **Zincirin gereksinimlerini kontrol edin — Light node status.** Bu panel canlı zincir parametrelerini okur (bunlar yönetişim parametreleridir ve bu sayfa düzenlenmeden değişebilir): gereken delege stake — delege ettiğiniz her doğrulayıcı başına değil, tüm doğrulayıcılar genelindeki toplamınız (şu anda 1.000 QOR) — kayıt ücreti (şu anda 1 QOR), ödüller için gereken çalışma süresi, bir heartbeat'in ne sıklıkta beklendiği (ve tanınan hoşgörü süresi) ve hafif düğümlerin azami sayısı. İsteğe bağlı olarak bir operatör adresi girerek ona kayıtlı bir hafif düğüm olup olmadığını, zamanında rapor verip vermediğini ve birikmiş ödüllerini görebilirsiniz.
3. **Ödül kaydı henüz açık değil.** Hafif düğüm ödül payına katılmak, zincir üzerinde verilmiş aktif bir `lightnode_operator` lisansı, minimum delege stake ve kayıt ücreti gerektirir. Kaydın kendisi açık değildir (bkz. [Ödül programının durumu](/light-node/overview#reward-program-status)) ve bir lisans satın almak bunu erken açmaz, dolayısıyla bugün için kaydolunacak bir şey yoktur; bu arada düğümünüzü çalıştırın ve senkronize edin. Çalışma süresi, düğümünüzün zincir üzerinde kaydolduğu bloktan itibaren sayılır, öncesinden değil.
4. **Kayıt kaydı.** Hesabınız aktif olarak kaydedilmiş bir lisansa sahipse, bu sekme ayrıca kısa bir form gösterir — operatör adresi (`qor1…`), takma ad, genel uç nokta URL'si ve stake taahhüdünün onayı — ve ardından gönderdiklerinizin bir özetini. Bu form, kayıt talebinizi Dashboard üzerinde The Qore Trust'a kaydeder; zincir üzerindeki kayıt işlemini **göndermez** ve zinciri kontrol etmez. Zincir üzerindeki kayıt düğümün kendisinden `lightnode-sx register` ile yapılır (bkz. [Kayıt ve Lisanslama](/light-node/registration-and-licensing)) ve yalnızca zincir aktif bir verilme gösterdiğinde, stake operatör adresinizden zaten bağlanmış (bonded) olduğunda ve kayıt açık olduğunda başarılı olur.

Tüm tablo için bkz. [Hafif Düğüm Genel Bakış](/light-node/overview) ve [Kayıt ve Lisanslama](/light-node/registration-and-licensing).

## Düğüm Kaydı

Düğüm Kaydı sekmesi, Dashboard üzerinde The Qore Trust'a bir doğrulayıcı kaydını kaydeder. Doğrulayıcıyı kendisi zincir üzerinde oluşturmaz; bu, kendi düğümünüzden yapılır (aşağıdaki 1. ve 5. adımlar). Ön koşullar ve adımlar:

1. **Önce PQC anahtarınızı kaydedin — CLI üzerinden, kendi doğrulayıcı düğümünüzde.** Bir doğrulayıcı, lisans başvurusunda bulunmadan veya lisansı kullanmadan ve doğrulayıcıyı oluşturmadan önce PQC anahtar kaydını kendisi çalıştırmalıdır — bu otomatik gerçekleşmez. CLI komutu için bkz. [Bir Doğrulayıcı Çalıştırmak](/developer-guide/running-a-validator#pqc-key-registration).
2. **Lisanslı olduğunuzu onaylayın.** Form, hesabınızda aktif olarak kaydedilmiş bir doğrulayıcı lisansı gerektirir. `create-validator`'ın kabul edilip edilmeyeceğine **zincir** karar verir ve zincir üzerinde operatör verilmesini şart koşar: **Buy License** üzerinden satın alınan bir lisans bizim tarafımızda kaydedilir ve zincir üzerinde verilmesi, bunu izleyen ayrı, manuel bir adımdır. Zincirin şu anda neyi tanıdığını görmek için (Validator Application sekmesindeki) **Validator Readiness** panelini kontrol edin. Henüz lisanslı değilseniz bu sekme **Buy License**'a bağlantı verir — doğrulayıcı lisansları öncelikle onaylanmış bir [Doğrulayıcı Başvurusu](#validator-application) gerektirir.
3. **Kayıt formunu doldurun.** Doğrulayıcı adresinizi veya konsensüs açık anahtarınızı, bir takma ad, bir komisyon oranını (lisansınızın izin verdiği aralık içinde) ve isteğe bağlı bir genel uç nokta girin. Lisanslarınız ağlar arası zincirler içeriyorsa, bu doğrulayıcının hizmet vereceği zincirleri seçin.
4. **Öz stake gereksinimini onaylayın.** Doğrulayıcı öz stake tabanı sabit bir değer olan 100.000 QOR'dur — ayarlanabilir bir seçenek değil, protokol düzeyinde bir sabittir — bir unbonding (çözülme) süresine tabidir ve çevrimdışı kalma veya çifte imzalama durumunda kesintiye uğrar. Bunu onaylayın, ardından kaydolmak için gönderin.
5. **Senkronize edin ve doğrulayıcıyı oluşturun.** Burada kayıt yapmak doğrulayıcınızı kaydeder; düğümünüzü zincirin güncel tepe noktasına siz getirmeli ve `create-validator`'ı, her QoreChain işlemi gibi hibrit PQC ortak imzalı olarak siz göndermelisiniz — bu imzayı geçerli kılan, 1. adımdaki anahtardır.
6. **Onaylayın ve stake bağlayın.** Bir özet paneli kaydı gösterir (takma ad, doğrulayıcı adresi, komisyon, öz stake niyeti, ağlar arası zincirler, durum) ve aktif doğrulayıcı setine girmek için öz stake'inizi bağlamanızı ister. Bağlama işlemi, Dashboard'da değil, düğümünüzde kuantum sonrası ortak imzalı işlemle gerçekleşir.

Stake etme ve doğrulayıcı oluşturma yalnızca QoreChain'in yerel (native) işlem hattında gerçekleşir — MetaMask gibi bağlı bir EVM cüzdanı üzerinden bir doğrulayıcıyı kaydetmenin veya bağlamanın hiçbir yolu yoktur.

Bkz. [Bir Doğrulayıcı Çalıştırmak](/developer-guide/running-a-validator) ve [Stake Etme ve Doğrulayıcılar](/dashboard/staking-and-validators).

## Rollup'lar

QoreChain destekli bir rollup talep edin. Form; rollup'ı adlandırmanıza ve istediğiniz sanal makineyi (EVM, CosmWasm veya SVM), veri kullanılabilirliği katmanını, gas token'ını, sıralayıcı (sequencer) modelini ve uzlaşma hedefini belirtmenize olanak tanır. Göndermek, The Qore Trust'ın incelediği bir sağlama (provisioning) talebini kaydeder; rollup'ı zincir üzerinde oluşturmaz. Seçenekler, zincir üzerindeki rollup modülünün şu anda desteklediğinden daha geniştir. Bir rollup'ı zincir üzerinde kendiniz kaydetmek için bkz. [Bir Rollup Dağıtmak](/rollups/deploying-a-rollup); kavramlar için bkz. [Rollup'lar Genel Bakış](/rollups/overview).

## SDK

QoreChain üzerinde kodla geliştirme yapmak için bir hızlı başlangıç ve referans merkezi. Bölüm; bağlanma, üç çalışma zamanı genelinde hesap türetme, durum okuma, transfer gönderme ve kuantuma dayanıklı imzalama için kurulum adımlarını ve kopyalamaya hazır kod parçacıklarını, ayrıca bir dil paketleri tablosunu ve depoya, örneklere ve gezgine bağlantıları gösterir. Bkz. [QoreChain SDK Genel Bakış](/sdk/overview) ve [Kurulum](/sdk/install).

## Doğrulayıcı Başvurusu {#validator-application}

Bir Genesis Doğrulayıcısı olmak için başvurun:

1. **Kuruluş bilgilerinizi girin.** Yasal kuruluş adı, ülke/yargı bölgesi ve bir iletişim e-postası.
2. **İstediğiniz katmanı seçin.** Doğrulayıcı katman kataloğundan seçim yapın (her katman kendi slot sayısını ve özellik setini listeler) — bu, onaylandıktan sonra lisanslamayı düşündüğünüz katmandır, henüz bir satın alma değildir.
3. **Altyapınızı tanımlayın.** Altyapı bölgeniz ve donanım/veri merkezi detayları.
4. **Motivasyonunuzu açıklayın.** Ekibinizin doğrulayıcı/altyapı deneyimi ve neden bir QoreChain Genesis Doğrulayıcısı çalıştırmak istediğinize dair kısa bir açıklama.
5. **Uyumluluğu onaylayın ve gönderin.** Bir lisans verilmeden önce başvuran kuruluşun ve gerçek yararlanıcılarının KYC/AML doğrulamasının gerekli olduğunu onaylayın, ardından gönderin.
6. **Durumunuzu takip edin.** Sekme, başvurunuzu inceleniyor, onaylandı veya bir nedenle onaylanmadı (gözden geçirip yeniden gönderme seçeneğiyle) olarak gösterir. Başvurunuz beklemede veya onaylandığında, canlı bir **Doğrulayıcı Hazırlığı** paneli, satın aldığınız şeye göre değil, doğrudan zincire göre üç şeyi kontrol eder: PQC anahtar kaydınız, öz-bağınız (sabit 100.000 QOR — yalnızca harcanabilir bakiye, vesting fonları sayılmaz) ve operatör lisansınızın zincir üzerinde fiilen verilip verilmediği ve şu anda geçerli olup olmadığı (askıya alınmamış ve süresi dolmamış — lisanslar bir blok yüksekliğinde sona erer ve zincirin tepe noktası okunamazsa, süresi dolmakta olan bir lisans geçerli olarak değil *doğrulanamadı* olarak bildirilir). Her kontrol üç durumdan birini bildirir — karşılandı, henüz karşılanmadı veya zincire ulaşılamadığında *doğrulanamadı* — ve başarısız bir okuma asla "buna sahip değilsiniz" olarak gösterilmez, çünkü bu sizi zaten sahip olduğunuz bir şeyi yeniden yapmaya yönlendirir. Onaylandıktan sonra, bir doğrulayıcı lisansı edinmek için **Buy License**'a geçebilirsiniz.

Bkz. [Bir Doğrulayıcı Çalıştırmak](/developer-guide/running-a-validator).

## Lisans Satın Al

Ağ altyapısını çalıştırmak için gereken lisansları edinin:

1. **Lisanslanacak adresi girin.** En üstteki **QoreChain address** alanı her satın alma için zorunludur: lisansın zincir üzerinde verileceği `qor1…` adresini yazın. Kontrol ettiğiniz ve elinizde tutacağınız bir adres kullanın — verilme ona bağlanır ve sonradan değiştirmek destek gerektirir. Adres olmadan lisans sipariş edilemez.
2. **Bir ödeme ağı seçin.** **Pay with USDT on:** altında ERC-20, BEP-20 veya TRC-20 seçin.
3. **Ne satın alacağınızı seçin.** Bir hafif düğüm lisansı herkese açıktır. Doğrulayıcı lisansları (katman kataloğu genelinde) yalnızca [Doğrulayıcı Başvurunuz](#validator-application) onaylandıktan sonra açılır. Ağlar arası eklentiler, bir doğrulayıcı lisansını ek zincirlere genişletir; zincir başına yıllık olarak fiyatlandırılır — istediğiniz zincirleri seçin, ardından satın alın.
4. **Ödemeyi tamamlayın.** Her satın alma sizi, tutarı ve ağı onaylayan ve lisans ödenmiş olarak kaydedilmeden önce ödemeyi zincir üzerinde doğrulayan bir ödeme adımına götürür.
5. **Zincir üzerinde verilmesini bekleyin, ardından kaydolun.** Ödemeden sonra lisans **Paid — awaiting on-chain grant** olarak görünür. Verilmeler elle, toplu halde yapılır; bu nedenle anlık değildir. Durum, yalnızca zincirin kendisi verilmeyi onayladıktan sonra **Active** olarak değişir. Zincir üzerindeki kayıt, bizim kayıtlarımızı değil zinciri kontrol eder, bu yüzden verilme gerçekleşmeden önce kaydolmaya çalışmak reddedilecektir. Rozet **Active** olarak göründüğünde, eşleşen kayıt için **Light Node** veya **Node Registration**'a dönün.

:::note Adres zorunlu hale gelmeden önce satın alınan lisanslar
Adres toplanmadan önce bir lisans satın aldıysanız, Buy License sekmesi **This licence needs a QoreChain address** ile açılır — adresi girin ve **Save address**'i seçin. Kaydedilene kadar lisans verilemez.
:::

Lisanslamanın ağ genelinde nasıl işlediği için bkz. [Zincir Lisanslama](/architecture/chain-licensing).
