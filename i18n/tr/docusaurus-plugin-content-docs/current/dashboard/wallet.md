---
slug: /dashboard/wallet
title: Cüzdan
sidebar_label: Cüzdan
sidebar_position: 3
---

# Cüzdan

**Cüzdan** sayfası, bakiyenizi ve işlem geçmişinizi görüntülediğiniz, QOR aldığınız ve (mainnet üzerinde) gönderim ile stake işlemlerini hazırladığınız yerdir. Bir hesabı üç rayda birden tek yerden görmek isteyen ve QOR tutan herkes içindir. Nasıl çalıştığı ağa bağlıdır:

- **Mainnet gözetimsizdir (non-custodial).** Dashboard, mainnet anahtarlarını tutmaz. Kendi cüzdanınızı (**QoreX**, **Keplr** veya **MetaMask**) bağlarsınız ve sayfa gerçek bakiyenizi ve geçmişinizi doğrudan zincirden okur. Native rayda gönderim ve stake işlemleri sayfada hazırlanır ve **QoreX** içinde imzalanır, çünkü QoreChain hesapları, QoreX'in ürettiği kuantum sonrası bir hibrit imzayla imzalar. Keplr görüntüleme ve alma için bağlanır. MetaMask EVM rayına bağlanır; orada göndermek için kayıtlı bir kuantum sonrası anahtar ve QoreX'ten açılan bir EVM yetkilendirme penceresi gerekir (bkz. [MetaMask ile gönderme](#send-metamask)).
- **Testnet gözetimlidir (custodial).** Dashboard, hesabınız için test cüzdanları oluşturur ve tutar; böylece hiçbir kurulum yapmadan test QOR gönderip alabilirsiniz. Testnet cüzdanları için stake ekranı yoktur.

## Yenilikler {#innovations}

- **Tek hesap, üç kodlama.** Sayfa, aynı hesabın `qor1...`, `0x...` ve SVM base58 biçimlerini türetir ve bakiyeyi ile geçmişi `qor1...` üzerinden bir kez okur. Geçmiş satırlarında Native, EVM veya SVM rozeti bulunur.
- **Dashboard mainnet üzerinde asla imzalamaz.** Bir gönderim, delege etme, delegasyonu geri alma veya ödül talep etme işleminde QoreX'e yalnızca parametreleri ve ağı iletir, hazırlanmış bir işlemi asla iletmez. QoreX işlemi yeniden oluşturur, tamamen gösterir, ML-DSA-87 hibrit imzasıyla imzalar ve yayınlar. Dashboard yalnızca işlem hash'ini öğrenir.
- **@handle sabitleme.** Çözümlenen bir handle'ın adresi, bu tarayıcıda yalnızca siz onayladıktan sonra hatırlanır. Handle daha sonra farklı bir adrese çözümlenirse akış durur ve her iki adresi de tam olarak gösterir.
- **Stake öncesi ücret kontrolü.** Sayfa, harcanabilir QOR'u (vesting hariç) ve hesabın ML-DSA-87 anahtar durumunu zincirden okur; ücret ödenemiyorsa Submit düğmesini devre dışı tutar.
- **Test adresi uyarısı, kopyaladığınız yerde durur.** "Test address, never send real QOR here." uyarısı, testnet ve mainnet adresleri birbirinin aynısı göründüğü için adresin yanında, My Wallets içinde ve Receive ekranında görünür.
- **Kontrollü kurtarma ifadesi dışa aktarma.** Testnet üzerinde bir ifadeyi göstermek için yeni bir oturum açma gerekir, 24 kelime 60 saniye boyunca görünür ve yedek, yalnızca 3, 5 ve 9 numaralı kelimeleri yazdıktan sonra onaylanmış sayılır.

## Nasıl kullanılır {#how-to-use}

### Tek hesap, üç kodlama {#one-account-three-encodings}

Bir QoreChain hesabı, her yürütme rayı için bir tane olmak üzere üç şekilde yazılan tek bir kimliktir:

| Ray | Kodlama | Görünümü |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | örn. `5Gv7...` |

Üçü de **aynı hesaba ve aynı bakiyeye** işaret eder. Herhangi bir rayda alınan fonlar tek bakiyeye düşer ve Dashboard bakiyeyi ile geçmişi `qor1` kodlaması üzerinden dizinler; bu yüzden her raydaki etkinlik bir arada görünür.

### Cüzdanı mainnet üzerinde kullanma {#mainnet}

Ön koşullar: oturum açılmış olması, üst bilginin **Mainnet** üzerinde olması, [tek seferlik onayın](/dashboard/overview#risk-acknowledgement) kabul edilmiş olması ve gönderim veya stake için QoreX uygulaması ya da uzantısı.

1. **Wallet** sayfasını açın. Henüz bağlı bir cüzdan yoksa "Connect your wallet" kartı, **Connect with QoreX** düğmeli **QoreX wallet** kartını ve onun altında, "or connect another wallet" başlığı altında **Connect Keplr** ile **Connect MetaMask** düğmelerini gösterir.
2. Bir cüzdan bağlayın (aşağıdaki adımlar). Phantom burada bağlanamaz; bkz. [Bağlı imzalayıcılar](#linked-signers).
3. Sayfa, gerçek bakiyenizi ve geçmişinizi zincirden yükler.

Bağlandıktan sonra sayfada altı sekme bulunur: **Wallet**, **Send from QoreX**, **Stake / Delegate**, **Rewards**, **Details** ve **Connect Wallets**.

- **Wallet:** cüzdan çiplerinden oluşan bir **Viewing** satırı (yalnızca birden fazla cüzdan bağlıysa), **Total Balance**, **Receive** ve en son 10 işlemi içeren **Assets & Activity**.
- **Send from QoreX, Stake / Delegate, Rewards:** Keplr veya MetaMask da bağlı olsa bile bunlar QoreX üzerinden çalışır. Stake adımları [Staking & Validators](/dashboard/staking-and-validators) sayfasındadır.
- **Details:** Native, EVM ve SVM adresleriniz ile **Linked addresses** (yeniden adlandırma, varsayılan yapma, QoreX'te kontrol edilebilir veya yalnızca izleme).
- **Connect Wallets:** bağlı cüzdanlar (görüntülemek için birine tıklayın, ayırmak için X'e tıklayın), **Link this account** ile bağlanmamış QoreX hesapları, **+ QoreX**, **+ Keplr**, **+ MetaMask** ve [QoreChain'i cüzdanınıza ekleyin](#add-network) paneli.

Cüzdanınızda QoreChain henüz yapılandırılmamışsa önce ekleyin, bkz. [QoreChain'i cüzdanınıza ekleyin](#add-network).

#### QoreX ile bağlanma, tarayıcı uzantısı {#connect-qorex-extension}

1. Cüzdan sayfasında **QoreX wallet** kartını bulun ve **Connect with QoreX** seçeneğini seçin.
2. QoreX uzantısı algılandığı için Dashboard nasıl bağlanmak istediğinizi sorar. **Browser extension** seçeneğini seçin.
3. Uzantı, isteyen site olarak `dashboard.qorechain.io` adresini gösteren bir onay açılır penceresi açar.
4. Onaylayın. Bu, `qor1...` adresinize sahip olduğunuza dair tek seferlik bir kanıt imzalar; hiçbir fon hareket etmez ve başka hiçbir izin verilmez.
5. Açılır pencere kapanır ve Dashboard **Connected: qor1...** gösterir. Seçim kaydedilir, böylece bu tarayıcıda bir sonraki bağlanışta sormadan yeniden kullanılır. **Use a different method** bağlantısı yalnızca bir eşleştirme beklemedeyken görünür.

Aynı Dashboard hesabına birden fazla QoreX adresi bağlayabilirsiniz (örneğin biri Firefox uzantısından, biri Chrome'dan ya da bir telefon ve bir dizüstü bilgisayardan). Akışı tekrarlamak için **Add another wallet** seçeneğini seçin; bağlı her adrese bir etiket verilebilir ve biri gönderim için varsayılan olarak işaretlenir, ikisi de **Connect Wallets** sekmesinden yapılır.

**Wallet sekmesinde cüzdanlar arasında geçiş yapma.** Birden fazla cüzdan bağlıyken **Viewing** çip satırı, sekmeden ayrılmadan hangi cüzdanın bakiyesini ve geçmişini gördüğünüzü değiştirmenizi sağlar. Yalnızca bir cüzdan bağlıysa satır gizlenir.

**QoreX uzantınızdaki henüz bağlanmamış hesaplar.** Tek bir kurtarma ifadesi birden fazla hesap türetebilir ve QoreX'te bir hesap oluşturmak Dashboard'a bunu bildirmez. Uzantı hesaplarını listeleyebildiğinde **Wallet**, **Details** ve **Connect Wallets** sekmeleri, "2 accounts in your QoreX extension are not linked here" gibi bir kart gösterir; kartta her hesabın bakiyesi (ve bunun ne kadarının stake edildiği, ki bu gönderilemez) yer alır. Eşleştirmek için **Link this account** seçeneğini seçin; bağlama, anahtarlarınız üzerinde hiçbir kontrol vermez. QoreX sürümünüz hangi hesabın kanıtlanacağını seçemiyorsa buradan yalnızca etkin hesap bağlanabilir.

#### QoreX ile bağlanma, mobil uygulama {#connect-qorex-app}

1. Cüzdan sayfasında **QoreX wallet** kartında **Connect with QoreX** seçeneğini seçin.
2. Seçici görünürse **QoreX app** seçeneğini seçin (uzantı algılanmazsa Dashboard doğrudan bu akışa geçer).
3. Dashboard bir QR kodu ve **Open QoreX** düğmesini gösterir ve yoklama yapar ("Waiting for approval in QoreX...").
4. Telefonunuzda QR kodunu QoreX ile tarayın veya aynı telefonda geziniyorsanız **Open QoreX** düğmesine dokunun (uygulamayı `qorex://connect` bağlantısı üzerinden açar).
5. QoreX, eşleştirme isteğini Dashboard'ın kaynağıyla birlikte gösterir. Face ID, Touch ID veya PIN ile onaylayın.
6. Birkaç saniye içinde Dashboard **Connected: qor1...** gösterir.

#### Keplr ile bağlanma {#connect-keplr}

Keplr, Native ray bakiyenizi ve geçmişinizi görüntülemek ve almak için bağlanır. Gönderim ve stake işlemleri QoreX kullanır.

1. Cüzdan sayfasında **Connect Keplr** seçeneğini seçin.
2. QoreChain Keplr'de yapılandırılmamışsa Dashboard, Keplr'in `suggestChain` istemini tetikler. Zincir kimliğini ve uç noktaları inceleyin ve **Approve** seçeneğini seçin.
3. Hesabı seçin ve bağlantıyı onaylayın.
4. Dashboard `qor1...` adresinizi okur ve bakiyenizi ile geçmişinizi yükler.

Phantom, mainnet Cüzdan sayfasında cüzdan olarak bağlanamaz. Daha önce bağlanmış Phantom adresleri **Connected wallets** içinde görünmeye devam eder; bir Phantom anahtarını imzalayıcı olarak bağlamak için bkz. [Bağlı imzalayıcılar (Phantom)](#linked-signers).

#### MetaMask ile bağlanma {#connect-metamask}

1. Cüzdan sayfasında **Connect MetaMask** seçeneğini seçin.
2. QoreChain EVM ağı henüz eklenmemişse MetaMask, zincir kimliği, RPC URL'si ve simge önceden doldurulmuş **Add network** istemini (EIP-3085) gösterir. **Approve**, ardından **Switch network** seçeneğini seçin.
3. Hesabı seçin ve **Connect** seçeneğini seçin.
4. Dashboard `0x...` adresinizi okur ve bakiyenizi ile geçmişinizi yükler.

### Mainnet üzerinde gönderme {#send-mainnet}

Her gönderim Dashboard'da hazırlanır ancak kendi cüzdanınızda tamamlanır. **Native rayda** bu cüzdan her zaman **QoreX**'tir. **EVM rayında**, hesabın zaten bir kuantum sonrası anahtarı ve açık bir EVM penceresi varsa işlemi MetaMask imzalar (bkz. [MetaMask ile gönderme](#send-metamask)).

:::caution Gerçek fonlar, geri alınamaz transferler
Mainnet işlemleri geri alınamaz. Onaylamadan önce alıcıyı iki kez kontrol edin.
:::

:::note Vesting bakiyeleri
Bakiyenizin bir kısmı hâlâ vesting sürecindeyse, bu tutar delege edebileceğiniz miktara dahil edilir, ancak bir işlem ücreti ödeyemez. Bunun için, bir kuantum sonrası anahtarı kaydettirmek dahil, ayrıca harcanabilir QOR'a ihtiyacınız vardır. Yalnızca vesting tutarıyla fonlanmış bir cüzdan delege edebilir ama gönderemez.
:::

#### QoreX ile adım adım gönderme

1. **Send from QoreX** kartında, isteğe bağlı olarak **Send from** alanını seçin (birden fazla QoreX cüzdanı bağladıysanız), ardından alıcıyı (bir `qor1...` adresi veya bir `@handle`), **Amount (QOR)** alanını ve isteğe bağlı bir **Memo** girin.
2. **Continue in QoreX** seçeneğini seçin.
3. Şunlardan biriyle onaylayın:
   - **Tarayıcı uzantısı:** **Approve in browser extension** seçeneğini seçin. Uzantı açılır penceresi transferi tamamen çözümlenmiş halde (alıcı ve tutar) gösterir. Uzantınızın kendi kilit açma yöntemiyle onaylayın. Uzantı, kuantum sonrası hibrit imzayla imzalar ve doğrudan zincire yayınlar.
   - **Mobil uygulama:** QR kodunu QoreX ile tarayın veya aynı telefondaysanız **Open in QoreX** seçeneğini seçin (bir `qorex://tx` isteği). QoreX isteği çözer, alıcıyı ve tutarı gösterir ve siz biyometrinizle onaylarsınız. QoreX imzalar ve yayınlar.
4. Sayfa, işlem hash'iyle birlikte "Transfer confirmed" gösterir ([Explorer](/dashboard/explorer) içinde açın), ardından **New transfer** gelir. Uygulama yolunda Dashboard sonucu yoklar.

**Asgari örnek:** QoreX ile bağlanın (uygulama, QR kodunu tarayın), ardından Send from QoreX ile bir `qor1...` alıcısına ve 1 tutarına gönderin, **Continue in QoreX** seçeneğini seçin ve QoreX'te onaylayın.

#### Bir @handle'a gönderme

Alıcı alanı bir `@handle` da kabul eder. Bundan sonra ne olacağı, bu handle'a bu tarayıcıdan daha önce ödeme yapıp yapmadığınıza bağlıdır:

- **İlk kez:** çözümlenen adres tam olarak, "First time sending to @handle from this browser. Check the address before you continue:" metniyle birlikte gösterilir ve kullanılmadan önce onaylamanız gerekir. Adres yalnızca siz onayladıktan sonra sabitlenir.
- **Öncekiyle aynı adres:** hafif bir onayla geçer.
- **Öncekinden farklı bir adres:** akış durur. Hem önceki hem de yeni adres, adresin değiştiğine dair açık bir uyarıyla ve yine de devam etmek için ikincil stilde bir düğmeyle birlikte tam olarak gösterilir.

Sabitleme yalnızca tarayıcınızda saklanır; bu nedenle farklı bir bilgisayar veya temizlenmiş bir tarayıcı yeniden "ilk kez" gösterir. Handle'lar 3 ila 20 karakter uzunluğundadır (`a-z`, `0-9`, `_`) ve tek bir adrese aittir. Handle sorgulama geçici olarak kullanılamıyorsa alan bunu belirtir ve yine de bir `qor1...` adresine gönderebilirsiniz.

#### MetaMask ile gönderme {#send-metamask}

:::caution Zincir v3.2.0'dan itibaren MetaMask tek başına mainnet'te gönderemez
EVM yolu, bir işlemi yalnızca kayıtlı bir kuantum sonrası anahtarı olan ve **açık bir EVM yetkilendirme penceresi** bulunan bir hesaptan kabul eder: bu, hibrit bir ML-DSA-87 imzası (FIPS 204) taşıyan bir mesajla açılan; süre, işlem sayısı ve değer bakımından sınırlı bir izindir. MetaMask bu mesajı üretemez. Pencere olmadan zincir işlemi reddeder (tipik hatalar: pencere yok, pencere tükendi, kuantum sonrası anahtar yok).
:::

1. **QoreX**'te, hesabın kuantum sonrası anahtarı yoksa kaydedin (o hesaptan yaptığınız ilk QoreX transferi bunu yapar), ardından bir EVM yetkilendirme penceresi açın, bkz. [EVM erişim penceresi](/qorex/security-and-recovery#evm-window). Bu, MetaMask'in anahtarını paylaşan **Ethereum tarzı (coin 60) hesap** içindir: aynı kurtarma ifadesini kullanarak QoreX'te **Add an Ethereum account (coin 60)** ile ekleyin ([nasıl](/qorex/getting-started#restore-dashboard)). Hiçbir MetaMask anahtarı sıradan bir coin-118 `qor1...` hesabından gönderemez.
2. Bir pencere, bloklarla (en fazla 17.280, mainnet'te yaklaşık 15 saat), işlem sayısıyla (en fazla 1.000) ve her tutarı maksimum ücretiyle **birlikte** sayan bir QOR harcama üst sınırıyla sınırlandırılır. Limitleri küçük tutun: bir pencere açıkken MetaMask işlemleri QOR'u kuantum sonrası imza olmadan taşır. Yeni bir pencere açmak öncekinin yerini alır ve hesabın nonce değerini ilerletir; bu yüzden MetaMask'ten göndermeden **önce** açın (daha önce hazırlanmış bir işlem "nonce too low" ile başarısız olur). v3.2.3'ten beri zincir ayrıca daha dar, kapsamlı pencereleri de destekler; QoreX'in henüz bunlar için bir ekranı yok.
3. MetaMask'i açın ve QoreChain EVM ağına ayarlı olduğunu doğrulayın.
4. MetaMask içinde **Send** seçeneğini seçin, `0x...` alıcısını ve tutarı girin, gaz ücretini gözden geçirin ve onaylayın.
5. Dashboard'a dönün; işlem zincire yazıldığında geçmişinizde görünür (gerekirse yenileyin).

Her işlem pencerenin bir kısmını tüketir; süre, işlem sayısı veya değer limitine ulaşıldığında QoreX'te yenisini açın ve işiniz bittiğinde pencereyi kapatın.

### Alma {#receive-mainnet}

1. **Receive** seçeneğini seçin.
2. Seçiciyle bir ray belirleyin: **Native QOR**, **EVM** veya **SVM**.
3. Pencere, adresinizi o kodlamayla bir QR kodu ve kopyalama düğmesiyle birlikte gösterir.
4. Yalnızca Native rayda, **Payment Request Options** (tutar, memo) kopyalayabileceğiniz bir `qorechain:` bağlantısı oluşturur.

Gönderici hangi rayı kullanırsa kullansın, fonlar aynı hesaba ulaşır.

### İşlem geçmişinizi okuma {#history}

Mainnet üzerinde **Assets & Activity** listesi **en son 10** işlemi gösterir. Her satırda şunlar bulunur:

- bir **ray rozeti** (Native, EVM veya SVM);
- sıradan transferler için **Sent** veya **Received**, diğer etkinlikler için açıklayıcı bir etiket (örneğin *PQC key registration* veya bir sözleşme eylemi);
- tutar, zaman, bir **Confirmed** veya **Failed** durumu ve [Explorer](/dashboard/explorer) içinde açabileceğiniz bir hash. Daha eski etkinlik için adresinizi Explorer'da açın.

### Cüzdanı testnet üzerinde kullanma {#testnet}

Testnet üzerinde (`qorechain-diana`) Dashboard sizin için test cüzdanlarını yönetir. Testnet'te QoreX bağlantısı ve stake ekranı yoktur.

**İlk ziyaret:** bir cüzdan oluşturun veya 24 kelimelik bir ifadeyi içe aktarın.

**Ana kart:** cüzdan etiketi, kopyalama düğmeli adres, **Total Balance**, **Send**, **Receive** ve **My Wallets**, yenilemeli bir son güncelleme göstergesi ve bir **Transaction history** sekmesi ile bir **Tokens** sekmesi içeren **Assets & Activity**.

**Tokens** sekmesi yalnızca Dashboard dağıtımlarıyla ihraç edilen tokenleri listeler. [Faucet](/dashboard/faucet#fest-tokens) sayfasındaki fest test tokenleri orada asla görünmez; bunları bir bank bakiye sorgusuyla veya [Explorer](/dashboard/explorer) ile kontrol edin.

:::caution Testnet adresleri mainnet adresleriyle birebir aynı görünür
Testnet ve mainnet aynı `qor1...` biçimini kullanır; bu nedenle bir testnet adresi hiçbir uyarı olmadan bir çekim formuna veya başka bir cüzdana yapıştırılabilir ve ona gönderilen gerçek QOR, bu testnet sayfasının gösteremeyeceği **mainnet** üzerinde, o adrese ulaşır. Bir testnet adresine asla gerçek QOR göndermeyin. Dashboard bu uyarıyı Cüzdan sayfasında adresin yanında, **My Wallets** içinde ve **Receive** ekranında tekrarlar. Bir testnet adresine zaten gerçek QOR gönderdiyseniz destek ile iletişime geçin ve kendiniz taşımaya çalışmayın.
:::

#### QOR gönderme (testnet)

1. **Send** seçeneğini seçin.
2. Bir **Asset** seçin (QOR veya Dashboard üzerinden ihraç edilmiş bir token).
3. **Recipient Address** alanını (yazarken kayıtlı kişiler ve son kullanılan adresler önerilir) ve **Amount** alanını (veya **MAX**) girin, ayrıca isteğe bağlı bir **Memo** girin.
4. **Review Transaction** seçeneğini seçin, ayrıntıları ve tahmini ücreti kontrol edin, ardından **Confirm & Send** seçeneğini seçin.
5. Hash ile birlikte bir onay alırsınız ve alıcının kişi olarak saklanması için "Save this address?" seçeneği sunulur.

**Asgari örnek:** Testnet'e geçin, bir cüzdan oluşturun, [Faucet](/dashboard/faucet) üzerinden talep edin, ardından başka bir adrese 1 QOR gönderin.

#### QOR alma (testnet)

1. **Receive** seçeneğini seçin.
2. Adresi veya QR kodunu paylaşın ya da adresi kopyalayın.
3. İsteğe bağlı olarak bir ödeme bağlantısı oluşturmak için **Payment Request Options** (tutar, memo) alanlarını doldurun; **Copy Link** veya **Save Image** seçeneğini kullanın.

#### Test cüzdanlarınızı yönetme

**My Wallets**, adres listenizi açar: cüzdanlar arasında geçiş yapın, yeni bir cüzdan oluşturun, içe aktarın veya kaldırın. Etkin cüzdan, testnet üzerinde Dashboard genelinde imzalı işlemler için kullanılan cüzdandır.

#### Bir test cüzdanının kurtarma ifadesini yedekleme veya dışa aktarma {#reveal-recovery-phrase}

Testnet üzerinde Dashboard cüzdanlarınızı yönetir, ancak bir cüzdanın 24 kelimelik kurtarma ifadesini dışa aktarıp QoreX gibi kendi saklamanızdaki (self-custody) bir cüzdana aktarabilirsiniz.

1. Testnet **Wallet** sayfasında **Recovery phrase** kartını bulun. Kart, Dashboard tarafından yönetilen cüzdanlarınızı **mainnet** bakiyesiyle birlikte (fonlanmış cüzdanlar önce) listeler; böylece tokenlerinizi tutan cüzdanı seçebilirsiniz.
2. **Reveal** seçeneğini seçin, uyarıyı ("Reveal the phrase for ...?") okuyun ve **Continue** seçeneğini seçin.
3. İstendiğinde yeniden oturum açın (yeni bir parola doğrulaması gerekir; Dashboard parolanızı hiçbir zaman görmez). Otomatik olarak cüzdana dönersiniz.
4. 24 kelime, bir **Copy phrase** düğmesiyle 60 saniye boyunca gösterilir. Bunları yazın ve çevrimdışı saklayın. Onay kutusunu işaretlerken veya doğrulama alanlarına yazarken geri sayım duraklar.
5. **I have written down my recovery phrase and stored it somewhere safe** seçeneğini işaretleyin, **3**, **5** ve **9** numaralı kelimeleri (*Required* olarak işaretli) yazın ve **Confirm backup** seçeneğini seçin. "Recovery phrase saved" mesajını görürsünüz.
6. **Hide without confirming** ile çıkarsanız (veya süre dolarsa) kart "Backup not confirmed" gösterir ve **Reveal again and confirm** seçeneğini sunar.

Bu 24 kelimeye sahip olan herkes cüzdanı kontrol eder. QoreChain bunları sizin için asla kurtaramaz veya sıfırlayamaz ve destek ekibi bunları asla istemez.

### QoreChain'i cüzdanınıza ekleyin {#add-network}

**Add QoreChain to your wallet** paneli (mainnet'te **Connect Wallets** sekmesinde ve bir cüzdan bağlanana kadar bağlan düğmelerinin altında yer alır; testnet'te sayfanın en altındadır) dört karta sahiptir:

| Kart | Size ne sağlar | Düğmeler |
| --- | --- | --- |
| **Native (Cosmos) wallets** | Her biri kopyalama düğmesine sahip RPC ve REST uç noktaları ile zincir kimliği. | **Add to Keplr**, **Add to Cosmostation** (etiket algılanan cüzdana göre değişir) |
| **EVM wallets** | EIP-3085 ağ parametreleri. | **Add to EVM wallet** (veya algılanan cüzdanlara göre **Add to MetaMask / Rabby**) |
| **SVM wallets** | Özel RPC ayarları için SVM RPC URL'si. | **Copy SVM RPC URL** |
| **Mobile wallets (WalletConnect)** | Bir WalletConnect v2 eşleştirmesi. | **Create pairing QR** |

1. Paneli bulun ve cüzdanınızın rayına uyan kartı seçin.
2. Ekleme düğmesini seçin veya uç noktaları ve zincir kimliğini cüzdanınızın ağ ekleme formuna kopyalayın.
3. Yeni ağı cüzdanınızda onaylayın.

Genel uç noktalar `rpc.qore.host` (Native RPC), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC) ve `svm.qore.host` (SVM RPC) olup, `*-testnet` varyantları (örneğin `rpc-testnet.qore.host`) mevcuttur. Zincir kimlikleri: mainnet `qorechain-vladi` (EVM zincir kimliği `9801`), testnet `qorechain-diana` (EVM zincir kimliği `9800`).

### Bağlı imzalayıcılar (Phantom) {#linked-signers}

**SVM wallets** kartı ayrıca bir Phantom anahtarını hesabınıza **bağlı imzalayıcı (linked signer)** olarak bağlamanıza da olanak tanır: ayrı bir birincil cüzdan değil, süre sınırlı (30 gün), iptal edilebilir bir yetkilendiricidir (authenticator). **Connect Phantom**'u, ardından **Register authenticator**'ı seçin. Kaydı **Keplr** imzalamalıdır (Dashboard'ın bunun için Keplr'in bağlı olması gerekir) ve Phantom hiçbir zaman kendi başına bir kimlik haline gelmez.

:::caution Kayıt kullanılabilirliği ağa göre farklılık gösterir
Zincirin akıllı hesap ve bağlı cüzdan özellikleri testnet üzerinde etkin, mainnet üzerinde kapalıdır (`GET /qorechain/abstractaccount/v1/config` testnet'te `enabled: true`, mainnet'te `enabled: false` döndürür, 27 Ekim 2026 tarihinde kontrol edildi). Mainnet üzerinde zincir yeni bağlı imzalayıcı kayıtlarını reddeder; kartı orada bir önizleme olarak değerlendirin.
:::

:::caution Bağlı bir imzalayıcı, hesap üzerinde gerçek bir yetkidir
Verdiğiniz izin, anahtarın ne kadar taşıyabileceğini değil, hangi yolda işlem yapabileceğini belirler ve bir kayıt 30 gün geçerli kalır. Yalnızca hesabın kendisi kadar güvendiğiniz bir anahtarı bağlayın ve artık ihtiyacınız kalmadığında iptal edin.
:::

İzin ve harcama limiti modeli için QoreX belgelerinde [Bağlı imzalayıcılar ve harcama limitleri](/qorex/security-and-recovery#linked-signers) sayfasına bakın.

## Nasıl erişilir {#how-to-access}

- **URL:** [dashboard.qorechain.io/wallet](https://dashboard.qorechain.io/wallet). Oturum açmak gerekir: oturum kapalıyken sayfa oturum açma ekranına yönlendirir.
- **Ağ:** üst bilgideki anahtar hangi görünümü alacağınızı belirler (mainnet gözetimsiz, testnet gözetimli). Mainnet üzerinde önce tek seferlik onayı kabul edin.
- **Cüzdanlar:** testnet'te gerekmez. Mainnet'te gönderim ve stake için QoreX (uygulama veya uzantı); görüntüleme ve alma için Keplr veya MetaMask kullanın.
- **Maliyetler:** Dashboard'dan hiçbiri. Zincir üstü işlemler ağ ücretini öder (alt sınır gaz başına 0,1 uqor).
- **Fonlar:** testnet QOR'u [Faucet](/dashboard/faucet) üzerinden. Mainnet QOR'u hesabınızda zaten bulunmalıdır.

## Nerede yayınlanıyor {#where-published}

| Yüzey | Adres | Ağlar | Notlar |
| --- | --- | --- | --- |
| Cüzdan sayfası | `dashboard.qorechain.io/wallet` | Mainnet (gözetimsiz) ve testnet (gözetimli) | Oturum açmak gerekir |
| QoreX bağlantısı ve gönderim | QoreX uygulaması ve uzantısı (bkz. [QoreX](/qorex/overview)) | Yalnızca mainnet | Dashboard'ın QoreX akışları mainnet'e sabitlenmiştir |
| Ağ ekleme paneli | Cüzdan sayfasında | Her ikisi | Ayrıca [Explorer](/dashboard/explorer) genel bakışında |

## Sınırlar ve bilinen sorunlar {#limits}

- **Testnet'te stake arayüzü ve QoreX bağlantısı yoktur.** Stake ve Rewards sekmesi yalnızca mainnet içindir.
- **Mainnet geçmişi en son 10 işlemdir.** Daha fazlası için adresi Explorer'da açın.
- **Keplr ve MetaMask:** Keplr görüntüleyebilir ve alabilir; MetaMask görüntüleyebilir ve alabilir, ayrıca bir EVM penceresi açıldığında MetaMask içinden gönderir. İkisi de Dashboard'dan Native rayda gönderim veya stake yapamaz.
- **Phantom** bağlanamaz; daha önce bağlanmış Phantom adresleri hâlâ listelenir.
- **Bağlı imzalayıcı kaydı** testnet'te çalışır ve mainnet'te kapalıdır; imzalamak için Keplr gerekir.
- **Dashboard'da yok:** yeniden delegasyon (QoreX'te yapın), süre kilitli bir stake ekranı ve mainnet'te bir token listesi.
- **Testnet'teki Tokens sekmesi** yalnızca Dashboard tarafından ihraç edilen tokenleri gösterir, fest tokenlerini göstermez.

## İlgili

- [Token Operations](/user-guide/token-operations) - QOR transferlerinin ve birimlerinin arkasındaki kavramlar.
- [Staking & Validators](/dashboard/staking-and-validators) - Cüzdan sayfasından delege edin, bağlamayı çözün ve talep edin.
- [Trade](/dashboard/trade) - test tokeni takas ekranı.
