---
slug: /dashboard/tools-hub
title: Araç Merkezi
sidebar_label: Araç Merkezi
sidebar_position: 11
---

# Araç Merkezi

**Araçlar** sayfası, QoreChain'in operatör ve geliştirici araçlarını tek bir yerde toplar ve şu sırayla altı sekmeye ayırır: **Validator Program**, **Validator Application**, **Light Node**, **Node Registration**, **Rollups** ve **SDK**. Sayfa, üst bilgideki ağ anahtarını izler: zincir kontrolleri, indirmeler ve düğüm durumu seçtiğiniz ağdan okunur. Lisanslar **yalnızca mainnet'te** satılır (bkz. [Hafif Düğüm](#light-node)).

Kayıtları kaydeden, başvuru gönderen veya ödeme alan araçları kullanmak için oturum açın; bkz. [Oturum açma](/dashboard/overview#sign-in).

## Doğrulayıcı Programı

Doğrulayıcıların ağa katılma yolu olan **QoreChain Validator Program**'a dair salt okunur bir genel bakış: programın sağladıkları (zincir üzerindeki operatör verilmesi, Association'ın kontrol ettiği stake'ten delegasyon ve hizmet seviyelerini karşılayan bağımsız operatörler için QOR cinsinden bir ödenek), gerektirdikleri, seçim süreci ve bir SSS. Bu sekmedeki protokol parametreleri (unbonding süresi, kesinti, azami doğrulayıcı sayısı) zincirden canlı olarak okunur; program kuralları (100.000 QOR öz stake, komisyon aralığı, ödenek) Association'a aittir ve bu şekilde işaretlenmiştir. Doğrulayıcılar bir paket satın almaz: başvururlar ve yalnızca seçildikten sonra **$1,000 program ücreti** öderler.

## Doğrulayıcı Başvurusu {#validator-application}

Validator Program'a başvurun:

1. **Başvuruyu doldurun.** Kuruluş adı, yargı bölgesi ve iletişim e-postası; **operatör adresi** (`qor1…`, `create-validator`'ı çalıştıracağınız hesap: zincir üzerindeki operatör verilmesi bu adrese yapılır); barındırma sağlayıcısı, bölge ve tür; halihazırda işlettiğiniz ağlar; isteğe bağlı olarak testnet doğrulayıcı adresiniz ve sunduğunuz genel altyapı (genel RPC, anlık görüntüler, arşiv); kanal (standart veya ayrılmış koltuklar için global); ve program koşullarının kabulü. Başvurmak ücretsizdir.
2. **İnceleme ve testnet denemesi.** Başvuru incelenirken **Submitted** olarak görünür. İlerleyen başvurular, diana testnet'inde 14 günlük bir deneme için bir doğrulayıcı çalıştırır; bu **Testnet trial** olarak gösterilir.
3. **Seçim ve program ücreti.** Seçilen bir başvuru, bir **Pay $1,000** düğmesiyle birlikte **Selected** gösterir. Ödeme adımı, hafif düğüm lisansındakiyle aynı şekilde işler (ERC-20, BEP-20 veya TRC-20 üzerinde USDT, zincir üzerinde doğrulanır). Ücret, başvurunuzdaki operatör adresine bağlıdır; başka bir adres için ödenemez. Onay ve ödeme her zaman ayrı gösterilir: bir başvuru seçilmiş ve henüz ödenmemiş olabilir.
4. **Zincir üzerindeki operatör verilmesi.** Ödemeden sonra Association, `validator_operator` verilmesini zincir üzerinde operatör adresinize yapar. Verilmeler elle, toplu halde imzalanır; bu nedenle anlık değildir. Sekme, zincir verilmeyi kaydeder kaydetmez **Operator grant on chain**, doğrulayıcınız bağlandığında (bonded) ise **In the active set** gösterir.

Başvuru gönderildiği andan itibaren bir **Doğrulayıcı Hazırlığı** paneli, operatör adresi için doğrudan zinciri kontrol eder: kayıtlı bir kuantum sonrası anahtar, öz stake için yeterli harcanabilir QOR, operatör verilmesi ve doğrulayıcının bağlanıp bağlanmadığı. [PQC anahtar kaydını](/developer-guide/running-a-validator#pqc-key-registration) kendi düğümünüzde erkenden çalıştırın: bu anahtarı sizin yerinize hiçbir şey kaydetmez.

Önceki doğrulayıcı teklifi kapsamında (Ekim 2026'dan önce) onaylanan başvurular **Earlier application** olarak görünür; Association bu başvuru sahipleriyle doğrudan iletişime geçer.

## Hafif Düğüm {#light-node}

Bir hafif düğüm operatörünün lisanstan zincir üzerinde kayıtlı bir düğüme kadar ihtiyaç duyduğu her şey.

1. **Lisansı satın alın (mainnet).** Bir hafif düğüm lisansı **$50**'dır; ERC-20, BEP-20 veya TRC-20 üzerinde USDT ile ödenir ve zincir üzerinde doğrulanır. Ödemeden önce lisansın verileceği `qor1…` adresini girin; kurtarma kelimelerine sahip olduğunuz bir hesap kullanın (kendi kelimeleriniz, Keplr veya `qorechaind`), ideal olarak yalnızca düğüm için kullanılan bir hesap. Üst bilgi **testnet** olarak ayarlıyken hiçbir şey satılmaz: testnet hafif düğüm lisansları ücretsizdir ve QoreChain ekibi tarafından verilir.
2. **Zincir üzerinde verilmesini bekleyin.** Ödemeden sonra lisans **Paid, awaiting on-chain grant** olarak görünür; yalnızca zincir `lightnode_operator` verilmesini onayladığında **Active on chain** olarak değişir. Verilmeler elle, toplu halde imzalanır.
3. **Düğümü kurun ve kaydedin.** Sekme, ağınız için yayınlanmış derlemeleri sağlama toplamlarıyla birlikte (sunucu sürümü `lightnode-sx`, masaüstü sürümü `lightnode-ux`; Linux, macOS ve Windows üzerinde) ve güncel sürüm için adımları listeler: bir keyring parolası belirleyin, `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover` (lisansın ait olduğu hesabı ekler), `lightnode-sx register` (düğümün kuantum sonrası anahtarını ekler ve düğümü kaydeder; adreste gereken stake eksikse `--delegate-to <qorvaloper…>` ekleyerek), ardından `lightnode-sx start` ve `lightnode-sx status`. Adımlar yalnızca ağın sürüm manifesti bunları destekleyen bir derleme yayınladığında güncel olarak gösterilir ve sekme, o ağda kaydın açık olup olmadığını belirtir.
4. **Adresiniz için bildirimler.** Sekme, lisans adresi kendi saklama (custodial) Dashboard cüzdanlarınızdan biri olduğunda uyarır (o anahtarı Dashboard tutar, bu yüzden bir düğüm onunla imzalayamaz) ve adresin zincir üzerinde zaten bir kuantum sonrası anahtarı olduğunda bunu belirtir (düğüm, anahtar kurtarma kelimelerinizden türetilmişse onu yeniden kullanır, aksi halde reddeder ve özel bir hesap önerir).
5. **Durum.** Bir panel zinciri okur: yürürlükteki gereksinimler (kayıt ücreti, delege stake, çalışma süresi, heartbeat penceresi, azami hafif düğüm sayısı) ve bir adres için, ona kayıtlı bir hafif düğüm olup olmadığı ve zamanında rapor verip vermediği.

Bkz. [Hafif Düğüm Genel Bakış](/light-node/overview) ve [Kayıt ve Lisanslama](/light-node/registration-and-licensing).

:::note Adres zorunlu hale gelmeden önce satın alınan lisanslar
Adres toplanmadan önce bir lisans satın aldıysanız, sekme **This licence needs a QoreChain address** ile açılır: adresi girin ve **Save address**'i seçin. Kaydedilene kadar lisans verilemez.
:::

## Düğüm Kaydı

Doğrulayıcınızın bilgilerini Association'a kaydeder. Doğrulayıcıyı zincir üzerinde oluşturmaz; bunu kendi düğümünüzden `create-validator` ile yaparsınız.

Form, zincir operatör adresiniz için aktif bir `validator_operator` verilmesi gösterdiğinde ve seçilmiş bir Validator Program başvurusuna (veya programdan önceki bir doğrulayıcı lisansına) sahip olduğunuzda açılır. Doğrulayıcı operatör adresinizi, bir takma adı, %5 ile %20 arasında bir komisyon oranını ve isteğe bağlı bir genel uç noktayı girin, ardından 100.000 QOR öz stake'i, 21 günlük unbonding süresini ve kesintiyi onaylayın.

Zincir üzerindeki adımlar [Bir Doğrulayıcı Çalıştırmak](/developer-guide/running-a-validator) sayfasındadır: PQC anahtarınızı kaydedin, ardından her QoreChain işlemi gibi PQC ortak imzalı olarak en az 100.000 QOR öz stake ile `create-validator` gönderin. Stake etme ve doğrulayıcı oluşturma yalnızca QoreChain'in yerel (native) işlem hattında gerçekleşir; MetaMask gibi bağlı bir EVM cüzdanı üzerinden bir doğrulayıcıyı kaydetmenin veya bağlamanın hiçbir yolu yoktur. Formun altında sekme, ağın sürüm manifestinden tam bir düğümün ihtiyaç duyduklarını da (sürüm ikili dosyası, genesis, eşler) listeler.

Bkz. [Stake Etme ve Doğrulayıcılar](/dashboard/staking-and-validators).

## Rollup'lar

QoreChain destekli bir rollup talep edin. Form; rollup'ı adlandırmanıza ve istediğiniz sanal makineyi (EVM, QoreChain Native veya SVM), veri kullanılabilirliği katmanını, gas token'ını, sıralayıcı (sequencer) modelini ve uzlaşma hedefini belirtmenize olanak tanır. Göndermek, incelenen bir sağlama (provisioning) talebini kaydeder; rollup'ı zincir üzerinde oluşturmaz. Seçenekler, zincir üzerindeki rollup modülünün şu anda desteklediğinden daha geniştir. Bir rollup'ı zincir üzerinde kendiniz kaydetmek için bkz. [Bir Rollup Dağıtmak](/rollups/deploying-a-rollup); kavramlar için bkz. [Rollup'lar Genel Bakış](/rollups/overview).

## SDK

QoreChain üzerinde kodla geliştirme yapmak için bir hızlı başlangıç ve referans merkezi. Bölüm; bağlanma, üç çalışma zamanı genelinde hesap türetme, durum okuma, transfer gönderme ve kuantuma dayanıklı imzalama için kurulum adımlarını ve kopyalamaya hazır kod parçacıklarını, ayrıca bir dil paketleri tablosunu ve depoya, örneklere ve gezgine bağlantıları gösterir. Bkz. [QoreChain SDK Genel Bakış](/sdk/overview) ve [Kurulum](/sdk/install).

Lisanslamanın ağ genelinde nasıl işlediği için bkz. [Zincir Lisanslama](/architecture/chain-licensing).
