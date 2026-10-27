---
slug: /dashboard/tools-hub
title: Düğümler ve Doğrulayıcılar
sidebar_label: Düğümler ve Doğrulayıcılar
sidebar_position: 11
---

# Düğümler ve Doğrulayıcılar

**Nodes & Validators** sayfası (kenar çubuğu **Build** grubu, adres `/tools`; 27 Ekim 2026'dan önce Tools ve Tools Hub olarak adlandırılıyordu), Dashboard'un operatör sayfasıdır. Şu sırayla beş sekmesi vardır: **Validator Program**, **Validator Application**, **Light Node**, **Node Registration** ve **Rollups**. Bir doğrulayıcı veya hafif düğüm çalıştırmak ya da bir uygulama rollup'ı talep etmek isteyenler içindir. SDK sekmesi, geliştirici araçlarını da içeren (PQC anahtar durumu, simülatör, imzalama oyun alanı, QoreX test cüzdanı) herkese açık [Geliştiriciler](/dashboard/developers) sayfasına taşındı.

## Yenilikler {#innovations}

- **Zincir kontrolleri zincirden gelir.** **Validator Readiness** paneli, seçilen ağda dört şeyi kontrol eder: kayıtlı bir ML-DSA-87 anahtarı, öz stake için harcanabilir QOR (vesting hariç), zincir üzerindeki operatör verilmesi ve doğrulayıcının bağlanıp (bonded) bağlanmadığı. **Light node status** paneli, yürürlükteki gereksinimleri (kayıt ücreti, delege stake, çalışma süresi, heartbeat penceresi, azami hafif düğüm sayısı) ve adresin kayıt ve heartbeat durumunu okur.
- **"Ödendi" ve "zincir üzerinde verildi" ayrı olgulardır.** Ödenmiş bir lisans, zincir verilmeyi onaylayana kadar **Paid, awaiting on-chain grant**, ardından **Active on chain** gösterir. Sekme, zincirde verilme yokken bir lisansı asla aktif olarak göstermez.
- **Protokol kuralları ve program kuralları ayrı etiketlenir.** Her parametre satırı, değerin protokolden mi (zincirden okunur) yoksa programdan mı (Association tarafından uygulanır) geldiğini söyler.
- **Self-servis bir testnet hafif düğüm lisansı.** **Free testnet licence** altına bir `qor1...` adresi girin ve **Request licence**'ı seçin; verilme otomatik olarak imzalanır, normalde birkaç dakika içinde. Mainnet verilmeleri elle kalır.
- **Düğüm adımları ağın sürüm manifestini izler.** İndirmeler (sunucu sürümü `lightnode-sx`, masaüstü sürümü `lightnode-ux`, platform başına, SHA-256 sağlama toplamlarıyla), kaydın açık olup olmadığı ve adımların güncel olup olmadığı manifestodan gelir.

## Nasıl kullanılır {#how-to-use}

Her sekme için ön koşul: oturum açın. Sekmeler üst bilgideki ağ anahtarını izler (zincir kontrolleri, indirmeler ve düğüm durumu seçilen ağdan okunur). Oturum açmadan sayfa "Authentication Required" gösterir. Bkz. [Oturum açma](/dashboard/overview#sign-in).

### Validator Program {#validator-program}

Doğrulayıcıların ağa katılma yolu olan **QoreChain Validator Program**'a dair salt okunur bir genel bakış: programın sağladıkları (zincir üzerindeki operatör verilmesi, Association'ın kontrol ettiği stake'ten delegasyon ve hizmet seviyelerini karşılayan bağımsız operatörler için QOR cinsinden bir ödenek), gerektirdikleri, seçim süreci ve bir SSS. **Apply** ve **Ask a question** düğmeleri vardır. Protokol parametreleri (unbonding süresi, kesinti, azami doğrulayıcı sayısı) zincirden canlı okunur; program kuralları (100.000 QOR öz stake, komisyon aralığı, ödenek) Association'a aittir ve bu şekilde işaretlenmiştir. Doğrulayıcılar bir paket satın almaz: başvururlar ve yalnızca seçildikten sonra **$1,000 program ücreti** öderler. Ödenek tutarları için sekmenin kendisine bakın.

### Validator Application {#validator-application}

1. **Başvuruyu doldurun.** Kuruluş adı, yargı bölgesi ve iletişim e-postası; **operatör adresi** (`qor1...`, `create-validator`'ı çalıştıracağınız hesap; zincir üzerindeki operatör verilmesi bu adrese yapılır); barındırma sağlayıcısı, bölge ve tür; halihazırda işlettiğiniz ağlar; isteğe bağlı olarak testnet doğrulayıcı adresiniz (`qorvaloper1...`) ve sunduğunuz genel altyapı (genel RPC, anlık görüntüler, arşiv); kanal (Standard veya ayrılmış koltuklar için Global); ve program koşullarının kabulü. **Submit application**'ı seçin. Başvurmak ücretsizdir.
2. **İnceleme ve testnet denemesi.** Başvuru **Application submitted** olarak görünür, ardından ilerleyen başvurular için **Testnet trial** (`qorechain-diana` üzerinde bir doğrulayıcı çalıştıran 14 günlük bir deneme). Reddedilen bir başvuru **Not selected** ve **Apply again** gösterir.
3. **Seçim ve program ücreti.** Seçilen bir başvuru, bir **Pay the $1,000 programme fee** düğmesiyle birlikte **Selected** gösterir. Ağı seçin (ERC-20, BEP-20 veya TRC-20 üzerinde USDT), gösterilen tutarın tamamını ödeyin, işlem hash'ini yapıştırın ve **Verify payment**'i seçin; ödeme zincir üzerinde doğrulanır. Ücret, başvurunuzdaki operatör adresine bağlıdır ve başka bir adrese ödenemez. Onay ve ödeme ayrı gösterilir: bir başvuru seçilmiş ve yine de ödenmemiş olabilir. Ödemeden sonra kart "Programme fee paid" yazar.
4. **Zincir üzerindeki operatör verilmesi.** Ödemeden sonra Association, `validator_operator` verilmesini zincir üzerinde operatör adresinize yapar. Mainnet verilmeleri elle, toplu halde imzalanır; bu nedenle anlık değildir. Sekme, zincir verilmeyi kaydeder kaydetmez **Operator grant on chain**, doğrulayıcınız bağlandığında (bonded) ise **In the active set** gösterir.
5. **Hazırlık.** Gönderilmiş, deneme aşamasındaki, seçilmiş ve verilmesi yapılmış başvurular için **Validator Readiness** paneli (bir adres alanıyla) operatör adresi için zinciri kontrol eder. [PQC anahtar kaydını](/developer-guide/running-a-validator#pqc-key-registration) kendi düğümünüzde erkenden çalıştırın: bu anahtarı sizin yerinize hiçbir şey kaydetmez.

Önceki doğrulayıcı teklifi kapsamında (Ekim 2026'dan önce) onaylanan başvurular **Earlier application** olarak görünür; Association bu başvuru sahipleriyle doğrudan iletişime geçer.

### Light Node {#light-node}

Bir hafif düğüm operatörünün lisanstan kayıtlı bir düğüme kadar ihtiyaç duyduğu her şey.

1. **Lisansı satın alın (mainnet).** Bir hafif düğüm lisansı **$50**'dır; ERC-20, BEP-20 veya TRC-20 üzerinde USDT ile ödenir ve zincir üzerinde doğrulanır. Lisansın verileceği `qor1...` adresini girin, USDT ağını seçin ve **Buy for $50**'yi seçin; kurtarma kelimelerine sahip olduğunuz bir hesap kullanın (kendi kelimeleriniz, Keplr veya `qorechaind`), ideal olarak yalnızca düğüm için kullanılan bir hesap. Ödemeden sonra kart **Payment received** yazar ve zincir üzerindeki verilme bunu izler. **Your past orders** aşağıda listelenir.
2. **Zincir üzerinde verilmesini bekleyin.** Lisans **Paid, awaiting on-chain grant** gösterir, zincir `lightnode_operator` verilmesini onayladığında ise **Active on chain**. Mainnet verilmeleri elle, toplu halde imzalanır.
3. **Düğümü kurun ve kaydedin.** Sekme, ağınız için yayınlanmış derlemeleri sağlama toplamlarıyla birlikte ve güncel sürüm için adımları listeler: bir keyring parolası belirleyin, `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover` (lisansın ait olduğu hesabı ekler), `lightnode-sx register` (düğümün kuantum sonrası anahtarını ekler ve düğümü kaydeder; adreste gereken stake eksikse `--delegate-to <qorvaloper...>` ekleyin), ardından `lightnode-sx start` ve `lightnode-sx status`. Adımlar yalnızca ağın sürüm manifesti bunları destekleyen bir derleme yayınladığında güncel olarak gösterilir ve sekme kaydın açık olup olmadığını belirtir.
4. **Adresiniz için bildirimler.** Sekme, lisans adresi kendi saklama (custodial) Dashboard cüzdanlarınızdan biri olduğunda uyarır ("This address cannot run a node": o anahtarı Dashboard tutar) ve adresin zincir üzerinde zaten bir kuantum sonrası anahtarı olduğunda bunu belirtir (düğüm, anahtar kurtarma kelimelerinizden türetilmişse onu yeniden kullanır, aksi halde reddeder ve özel bir hesap önerir).
5. **Durum.** Bir panel yürürlükteki gereksinimleri ve bir hafif düğümün kayıtlı olup olmadığını ve zamanında rapor verip vermediğini gösterir. Durumları arasında "Registered, waiting for its first heartbeat", "Rewards accrued" ve düğüm etkin değil olarak işaretlendiğinde bir bildirim bulunur.

#### Ücretsiz testnet lisansı {#testnet-licence}

Testnet'te (`qorechain-diana`) hiçbir şey satılmaz ("Nothing is sold on testnet") ve bir hafif düğüm lisansı ücretsiz ve self-servistir:

1. Üst bilgiyi **Testnet** olarak ayarlayın ve **Light Node** sekmesini açın.
2. **Free testnet licence** altına `qor1...` adresinizi girin ve **Request licence**'ı seçin.
3. Talep "Requested for ..." olarak, ardından "Granted to ... You can register your node now." olarak görünür. Verilme imzalanamadıysa sekme bunu söyler ve yeniden talep edebilirsiniz.

Verilmeler otomatik olarak imzalanır, normalde birkaç dakika içinde. Hesap başına bir talep ve adres başına bir talep vardır. **Asgari örnek:** Testnet, **Light Node**, **Request licence**, "Granted to ..." görünene kadar bekleyin, ardından `lightnode-sx onboard`'dan `register`'a kadar çalıştırın.

Bkz. [Hafif Düğüm Genel Bakış](/light-node/overview) ve [Kayıt ve Lisanslama](/light-node/registration-and-licensing).

:::note Adres zorunlu hale gelmeden önce satın alınan lisanslar
Adres toplanmadan önce bir lisans satın aldıysanız, sekme **This licence needs a QoreChain address** ile açılır: adresi girin ve **Save address**'i seçin. Kaydedilene kadar lisans verilemez.
:::

### Node Registration {#node-registration}

Doğrulayıcınızın bilgilerini Association'a kaydeder. Doğrulayıcıyı zincir üzerinde oluşturmaz; bunu kendi düğümünüzden `create-validator` ile yaparsınız. Sekme, verilme zincirde olana kadar kilitlidir.

Form, zincir operatör adresiniz için aktif bir `validator_operator` verilmesi gösterdiğinde ve seçilmiş bir Validator Program başvurusuna (veya programdan önceki bir doğrulayıcı lisansına) sahip olduğunuzda açılır. Operatör adresini, bir **Moniker**'ı, %5 ile %20 arasında bir **Commission** oranını ve isteğe bağlı bir uç noktayı girin, onayı işaretleyin (100.000 QOR öz stake, 21 günlük unbonding süresi ve kesinti) ve **Register validator**'ı seçin.

Zincir üzerindeki adımlar [Bir Doğrulayıcı Çalıştırmak](/developer-guide/running-a-validator) sayfasındadır: PQC anahtarınızı kaydedin, ardından her QoreChain işlemi gibi PQC ortak imzalı olarak en az 100.000 QOR öz stake ile `create-validator` gönderin. Stake etme ve doğrulayıcı oluşturma yalnızca yerel (native) işlem hattında gerçekleşir; MetaMask gibi bağlı bir EVM cüzdanı üzerinden bir doğrulayıcıyı kaydetmenin veya bağlamanın hiçbir yolu yoktur. Formun altında sekme, tam bir düğümün ihtiyaç duyduklarını da (sürüm ikili dosyası, genesis, eşler) sürüm manifestinden listeler ve ağ yeni doğrulayıcı kabul etmediğinde bir "Joining is temporarily suspended" başlığı gösterebilir. Bkz. [Stake Etme ve Doğrulayıcılar](/dashboard/staking-and-validators).

### Rollups {#rollups}

Sekmenin başlığı **Request a Rollup**'tır. Formu doldurun: bir ad, sanal makine (EVM, QoreChain Native veya SVM), veri kullanılabilirliği katmanı (QoreChain DA, Celestia veya EigenDA), gas token'ı, sıralayıcı (sequencer) (Shared sequencer, Dedicated (single) veya Decentralized) ve uzlaşma hedefi (QoreChain mainnet veya Ethereum), ardından **Request deployment**'ı seçin. Bu yalnızca bir talebi kaydeder; talep formun altında durumuyla listelenir ve o adımda zincir üzerinde hiçbir şey oluşturulmaz. Seçenekler, zincir üzerindeki rollup modülünün şu anda desteklediğinden daha geniştir. Bir rollup'ı zincir üzerinde kendiniz kaydetmek için bkz. [Bir Rollup Dağıtmak](/rollups/deploying-a-rollup); kavramlar için bkz. [Rollup'lar Genel Bakış](/rollups/overview).

## Nasıl erişilir {#how-to-access}

- **URL:** [dashboard.qorechain.io/tools](https://dashboard.qorechain.io/tools) veya kenar çubuğu **Build** grubunda **Nodes & Validators**.
- **Oturum açma:** her iki ağda da sayfanın tamamı için gereklidir.
- **Ağ:** üst bilgiyi izleyin. $50'lık lisans satın alma yalnızca mainnet içindir; ücretsiz lisans yalnızca testnet içindir.
- **Maliyetler:** başvurmak ücretsizdir; doğrulayıcı program ücreti $1,000'dır ve yalnızca seçildikten sonra ödenir; bir mainnet hafif düğüm lisansı $50'dır; testnet lisansı ücretsizdir.
- **Cüzdan:** düğüm için kurtarma kelimelerine sahip olduğunuz bir hesap; sekmeleri okumak için cüzdan gerekmez.

## Nerede yayımlanır {#where-published}

| Yüzey | Adres | Ağlar |
| --- | --- | --- |
| Nodes & Validators | `dashboard.qorechain.io/tools` | Mainnet ve testnet, üst bilgideki anahtar |
| Düğüm indirmeleri ve sağlama toplamları | Light Node sekmesi | Ağ başına sürüm manifesti |
| SDK ve geliştirici araçları | [Geliştiriciler](/dashboard/developers) | Her ikisi |

## Sınırlar ve bilinen sorunlar {#limits}

- **Mainnet verilmeleri elle yapılır,** toplu halde imzalanır; bu nedenle ödenmiş bir lisans "Paid, awaiting on-chain grant" durumunda bekler. Testnet verilmeleri otomatiktir.
- **Hesap başına ve adres başına bir ücretsiz testnet talebi** vardır.
- **Rollups her iki ağda da bir talep formudur;** zincir üzerinde hiçbir şey oluşturmaz.
- **Doğrulayıcı olarak katılım duraklatılabilir** ("Joining is temporarily suspended" başlığı).
- **USDT alıcı bilgileri ve ödenek tutarları** yalnızca ödeme veya başvuru sırasında sekmelerin içinde gösterilir.

Lisanslamanın ağ genelinde nasıl işlediği için bkz. [Zincir Lisanslama](/architecture/chain-licensing).
