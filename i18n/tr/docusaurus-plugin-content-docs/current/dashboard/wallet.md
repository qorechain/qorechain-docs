---
slug: /dashboard/wallet
title: Cüzdan
sidebar_label: Cüzdan
sidebar_position: 3
---

# Cüzdan

**Cüzdan** sayfası, bakiyenizi ve işlem geçmişinizi görüntülediğiniz, QOR aldığınız ve gönderdiğiniz yerdir. Sayfanın nasıl çalıştığı ağa bağlıdır:

- **Mainnet — gözetimsiz (non-custodial).** Dashboard, mainnet anahtarlarını tutmaz. Kendi cüzdanınızı bağlarsınız — **QoreX** (resmi QoreChain cüzdanı, uzantı veya uygulama), **Keplr** ya da **MetaMask** — gerçek bakiyeniz ve geçmişiniz doğrudan zincirden okunur ve herhangi bir ray üzerinden fon alabilirsiniz. **Native** ray üzerinde gönderme ve stake işlemleri **QoreX gerektirir**: QoreChain hesapları kuantum-sonrası hibrit bir imzayla imzalanır ve bu imzayı üreten cüzdan QoreX'tir; bu nedenle Dashboard'ın Send ve Stake sekmeleri, başka hangi cüzdanı da bağlamış olsanız fark etmeksizin QoreX üzerinden çalışır. Native-ray (`qor1...`) bakiyenizi görüntülemek ve bu ray üzerinden fon almak için Keplr yine de bağlanabilir. **MetaMask**, **EVM rayına** (`0x...`) bağlanır ve EVM işlemlerini kendisi imzalar; ancak zincir v3.2.0'dan itibaren EVM yolu, bir işlemi yalnızca kayıtlı bir kuantum-sonrası anahtarı **ve** açık bir EVM yetkilendirme penceresi olan bir hesaptan kabul eder. MetaMask bu anahtarı kaydedemez ve pencere açamaz; QoreX bunu yapabilir. Bkz. [MetaMask ile gönderme](#send-metamask).
- **Testnet — gözetimli (custodial).** Dashboard sizin için bir test cüzdanı yönetir; böylece transferleri, takasları ve stake işlemlerini hiçbir kurulum yapmadan deneyebilirsiniz. Cüzdanı [Faucet](/dashboard/faucet) üzerinden fonlayın.

Hesaplar kuantum güvenli kriptografi ile korunur ve her adresin Native kodlaması `qor` bech32 önekini kullanır (`qor1...`).

## Tek hesap, üç kodlama {#one-account-three-encodings}

Bir QoreChain hesabı, üç şekilde yazılabilen tek bir kimliktir — her yürütme rayı için bir tane:

| Ray | Kodlama | Görünümü |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | örn. `5Gv7...` |

Üç kodlamanın tümü **aynı hesaba ve aynı bakiyeye** işaret eder. Herhangi bir ray üzerinden alınan fonlar tek bakiyenize düşer ve Dashboard, bakiye ile geçmişi `qor1` (Native) kodlaması üzerinden dizinler; bu sayede her raydaki etkinlik bir arada görünür.

## Cüzdanı mainnet üzerinde kullanma {#mainnet}

1. Dashboard üst bilgisini **Mainnet**'e geçirin.
2. İstenirse [tek seferlik risk onayını](/dashboard/overview#risk-acknowledgement) kabul edin — mainnet gerçek fonları taşır, Dashboard gözetimsizdir ve işlemler geri alınamaz.
3. Bağlantı ekranında bir cüzdan seçin — **Connect with QoreX** (önerilen, resmi QoreChain cüzdanı — Native ray üzerinde gönderme ve stake için zorunludur), **Connect Keplr** (Native rayda görüntüleme/alma için) veya **Connect MetaMask** (EVM rayında bağlanma ve alma için; göndermek için açık bir EVM penceresi gerekir, bkz. [MetaMask ile gönderme](#send-metamask)). Her biri için adım adım talimatlara aşağıda bakın. Phantom burada cüzdan olarak bağlanamaz; bkz. [Keplr ile bağlanma](#connect-keplr) altındaki not.
4. Sayfa, gerçek bakiyenizi ve işlem geçmişinizi zincirden yükler.

Bağlandıktan sonra Cüzdan sayfası her şeyi altı sekmede düzenler: **Wallet** (bakiye ve hesap özeti), **Send from QoreX**, **Stake / Delegate**, **Rewards**, **Details** (`qor1...` / `0x...` / SVM adresleriniz) ve **Connect Wallets** (bağladığınız her cüzdan ve daha fazlasını nereden bağlayacağınız). Send, Stake ve Rewards sekmeleri QoreX üzerinden çalışır — Keplr veya MetaMask'i de bağlamış olsanız bile bu böyledir, çünkü Native-ray işlemleri QoreX'in ürettiği kuantum-sonrası hibrit imzaya ihtiyaç duyar.

Cüzdanınızda QoreChain henüz yapılandırılmamışsa önce ekleyin — bkz. [QoreChain'i cüzdanınıza ekleyin](#add-network).

### QoreX ile bağlanma — tarayıcı uzantısı {#connect-qorex-extension}

1. Cüzdan sayfasında **QoreX wallet** kartını bulun ve **Connect with QoreX** seçeneğini seçin.
2. Bu tarayıcıda QoreX uzantısı algılandığından, Dashboard nasıl bağlanmak istediğinizi sorar. **Browser extension** seçeneğini seçin.
3. QoreX uzantısı, bağlantı isteğinde bulunan site olarak `dashboard.qorechain.io` adresini gösteren kendi onay açılır penceresini açar.
4. Açılır penceredeki isteği inceleyin ve onaylayın — bu, `qor1...` adresinize sahip olduğunuza dair tek seferlik bir kanıt imzalar; hiçbir fon hareket etmez ve başka hiçbir izin verilmez.
5. Açılır pencere kapanır ve Dashboard, QoreX kartında **Connected: qor1...** gösterir; adresiniz Cüzdan sayfasının geri kalanının kilidini açar. Uzantı/uygulama seçimi hatırlanır, böylece bu tarayıcıda bir dahaki sefere **Connect with QoreX** seçtiğinizde sormadan aynı şekilde yeniden bağlanır — bağlantı kartında **Use a different method** seçeneğini kullanarak istediğiniz zaman yöntem değiştirebilirsiniz.

Aynı Dashboard hesabına birden fazla QoreX adresi bağlayabilirsiniz — örneğin biri bir Firefox uzantısından, diğeri Chrome'dan, ya da bir telefon ve bir dizüstü bilgisayardan. Akışı ikinci bir adresle tekrarlamak için **Add another wallet** seçeneğini seçin; bağlı her adrese kendi etiketi verilebilir ve biri gönderim için varsayılan olarak işaretlenir; her ikisi de **Connect Wallets** sekmesinden yapılır.

**Wallet sekmesinde cüzdanlar arasında geçiş yapma.** Birden fazla cüzdan bağlandığında — QoreX ve MetaMask, ya da iki QoreX adresi — **Wallet** sekmesinin en üstünde, **Viewing** ile başlayan ve bağlı her cüzdan için bir tane olmak üzere bir dizi cüzdan çipi belirir; etkin olan işaretlenir. Hangi cüzdanın bakiyesine ve geçmişine baktığınızı, sekmeden veya **Connect Wallets**'tan ayrılmadan değiştirmek için bir çipe tıklayın. Yalnızca tek bir cüzdan bağlıyken bu satır gizlenir, çünkü seçici yapacak bir şey bulamaz.

**QoreX uzantınızdaki henüz bağlanmamış hesaplar.** Tek bir kurtarma ifadesi birden fazla hesap türetebilir ve QoreX'te bir hesap oluşturmak Dashboard'a bunu bildirmez — bağlama, ayrı ve imzalı bir adımdır. QoreX uzantısı hesaplarını listeleyebildiğinde, **Wallet**, **Details** ve **Connect Wallets** sekmeleri, "2 accounts in your QoreX extension are not linked here" gibi bir kart gösterir; kartta her hesabın bakiyesi (ve bunun ne kadarının stake edildiği, ki bu gönderilemez) yer alır. Eşleştirmek için **Link this account** seçeneğini seçin; bağlama, Dashboard'ın o hesabın bakiyesini ve geçmişini göstermesini sağlar ve anahtarlarınız üzerinde hiçbir kontrol vermez. QoreX sürümünüz hangi hesabın kanıtlanacağını seçemiyorsa buradan yalnızca etkin hesap bağlanabilir — kart, önce QoreX'te o hesaba geçmenizi söyler.

**Details** sekmesinde **Linked addresses**, hesabınıza bağlı her adresi kaynak cüzdanıyla birlikte listeler; bir adresi yeniden adlandırabilir, birini gönderim için varsayılan olarak işaretleyebilir ve QoreX'te kontrol edilebilir mi yoksa yalnızca izleme (asma kilit) mi olduğunu görebilirsiniz.

### QoreX ile bağlanma — mobil uygulama {#connect-qorex-app}

1. Cüzdan sayfasında **QoreX wallet** kartını bulun ve **Connect with QoreX** seçeneğini seçin.
2. Uzantı seçici görünürse **QoreX app** seçeneğini seçin (bu tarayıcıda bir uzantı algılanmazsa Dashboard doğrudan bu akışa geçer).
3. Dashboard bir QR kodu ve bir **Open QoreX** bağlantısı gösterir.
4. Telefonunuzda QoreX uygulamasını açın ve QR kodunu onunla tarayın — ya da aynı telefonda geziniyorsanız uygulamayı doğrudan `qorex://connect` bağlantısı üzerinden başlatmak için **Open QoreX** seçeneğine dokunun.
5. QoreX, eşleştirme isteğini Dashboard'ın kaynağıyla birlikte gösterir. İnceleyin ve biyometrik onayınızla (Face ID / Touch ID / PIN) onaylayın.
6. Dashboard arka planda onayı yoklamaya devam eder; birkaç saniye içinde QoreX kartında **Connected: qor1...** gösterir ve adresiniz Cüzdan sayfasının geri kalanının kilidini açar.

### Keplr ile bağlanma {#connect-keplr}

Keplr, Native-ray bakiyenizi, geçmişinizi ve alma adresinizi görüntülemek için bağlanır. Native ray üzerinde gönderme ve stake işlemleri QoreX kullanır (aşağıya bakın) — QoreChain hesapları kuantum-sonrası hibrit bir imzayla imzalanır; Dashboard'ın Send ve Stake sekmelerinin burada bağladığınız cüzdan yerine QoreX üzerinden çalışmasının nedeni budur.

1. Cüzdan sayfasında **Connect Keplr** seçeneğini seçin.
2. QoreChain henüz Keplr'de yapılandırılmamışsa Dashboard, Keplr'in `suggestChain` istemini tetikler — Keplr açılır penceresindeki ağ ayrıntılarını (zincir kimliği, RPC/REST uç noktaları) inceleyin ve eklemek için **Approve** seçeneğini seçin.
3. Ardından Keplr, bağlanacak hesabı seçmenizi ve bağlantıyı onaylamanızı ister — **Approve** seçeneğini seçin.
4. Dashboard, `qor1...` adresinizi okur ve bakiyenizi ile geçmişinizi yükler.

Phantom, mainnet Cüzdan sayfasında cüzdan olarak bağlanamaz. Daha önce bağlanmış Phantom adresleri **Connected wallets** içinde görünmeye devam eder; bir Phantom anahtarını imzalayıcı olarak bağlamak için bkz. [Bağlı imzalayıcılar (Phantom)](#linked-signers).

### MetaMask ile bağlanma {#connect-metamask}

1. Cüzdan sayfasında **Connect MetaMask** seçeneğini seçin.
2. QoreChain EVM ağı henüz eklenmemişse MetaMask, zincir kimliği, RPC URL'si ve para birimi simgesi önceden doldurulmuş **Add network** istemini (EIP-3085) gösterir — inceleyin ve **Approve**, ardından **Switch network** seçeneğini seçin.
3. MetaMask hangi hesabın bağlanacağını sorar — hesabı seçin ve **Connect**'i onaylayın.
4. Dashboard, `0x...` adresinizi okur ve bakiyenizi ile geçmişinizi yükler.

### Mainnet üzerinde gönderme {#send-mainnet}

Dashboard mainnet anahtarlarınızı hiçbir zaman tutmadığı için her gönderim Dashboard'da oluşturulur ancak kendi cüzdanınızda tamamlanır. **Native rayda** bu cüzdan her zaman **QoreX**'tir — Send ve Stake sekmeleri, başka hangi cüzdanı da bağlamış olsanız fark etmeksizin onun üzerinden çalışır, çünkü QoreChain hesapları kuantum-sonrası hibrit bir imzayla imzalanır. **EVM rayında** hesabın zaten bir kuantum-sonrası anahtarı ve açık bir EVM penceresi varsa işlemi MetaMask imzalar (bkz. [MetaMask ile gönderme](#send-metamask)).

:::caution Gerçek fonlar, geri alınamaz transferler
Mainnet işlemleri geri alınamaz. Onaylamadan önce alıcı adresini her zaman iki kez kontrol edin.
:::

:::note Vesting bakiyeleri
Bakiyenizin bir kısmı hâlâ vesting sürecindeyse, bu tutar stake için delege edebileceğiniz miktara dahil edilir, ancak bir işlem ücreti ödeyemez — bunun için, bir PQC anahtarı kaydettirmek dahil, ayrıca harcanabilir QOR'a ihtiyacınız vardır. Yalnızca vesting tutarıyla fonlanmış bir cüzdan delege edebilir ama gönderemez.
:::

#### QoreX ile gönderme — tarayıcı uzantısı

1. Cüzdan sayfasında, **Send from QoreX** kartına alıcıyı (bir `qor1...` adresi veya bir `@handle`), QOR cinsinden tutarı ve isteğe bağlı bir notu (memo) girin. Birden fazla QoreX cüzdanı bağladıysanız, hangisinin ödeme yapacağını **Send from** içinde seçin.
2. **Continue in QoreX** seçeneğini seçin.
3. Dashboard bir **Approve in browser extension** düğmesi gösterir — seçin.
4. QoreX uzantısı, transferin tamamen çözümlenmiş halini — alıcı ve tutar — gösteren onay açılır penceresini açar. İnceleyin ve uzantınızın kendi güvenliğini (biyometrik veya parola kilidi açma) kullanarak onaylayın.
5. Uzantı, transferi hibrit bir PQC imzasıyla imzalar ve doğrudan zincire yayınlar — Dashboard yalnızca ortaya çıkan işlem hash'ini öğrenir.
6. Cüzdan sayfası, [Explorer](/dashboard/explorer) içinde açabileceğiniz işlem hash'i ile birlikte **Transfer confirmed** gösterir.

#### QoreX ile gönderme — mobil uygulama

1. Cüzdan sayfasında, **Send from QoreX** kartına alıcıyı (bir `qor1...` adresi veya bir `@handle`), QOR cinsinden tutarı ve isteğe bağlı bir notu (memo) girin. Birden fazla QoreX cüzdanı bağladıysanız, hangisinin ödeme yapacağını **Send from** içinde seçin.
2. **Continue in QoreX** seçeneğini seçin.
3. Dashboard, bir `qorex://tx` isteği taşıyan bir QR kodu ve bir **Open in QoreX** bağlantısı gösterir.
4. QR kodunu QoreX uygulamasıyla tarayın, ya da aynı telefondaysanız **Open in QoreX** seçeneğine dokunun.
5. QoreX isteği çözer ve alıcıyı ile tutarı tam olarak gösterir. İnceleyin ve biyometrik onayınızla onaylayın.
6. QoreX, transferi hibrit bir PQC imzasıyla imzalar ve yayınlar.
7. Dashboard sonucu yoklar ve zincire yazıldığında [Explorer](/dashboard/explorer) içinde açabileceğiniz işlem hash'i ile birlikte **Transfer confirmed** gösterir.

#### Bir @handle'a gönderme

**Send from QoreX** kartındaki alıcı alanı, bir `qor1...` adresi yerine bir `@handle` da kabul eder. Bundan sonra ne olacağı, bu handle'a bu tarayıcıdan daha önce ödeme yapıp yapmadığınıza bağlıdır:

- **İlk kez**: çözümlenen adres tam olarak, "First time sending to @handle from this browser. Check the address before you continue:" metniyle birlikte gösterilir ve kullanılabilmesi için **This address is right — continue** seçeneğini seçmeniz gerekir — adres yalnızca siz onayladıktan sonra hatırlanır (sabitlenir), çözümlendiği an değil.
- **Öncekiyle aynı adres**: hafif bir onayla geçer — yeniden yazmaya gerek yoktur.
- **Öncekinden farklı bir adres**: akış tamamen durur. Hem önceki hem de yeni adres tam olarak gösterilir — bir saldırganın benzer göstermeye çalışacağı tam da orta karakterleri gizlediği için asla kısaltılmaz — adresin değiştiğine dair açık bir uyarıyla birlikte ve yine de devam etmek için bilerek ikincil stilde tasarlanmış bir **I trust this change — continue** düğmesiyle.

Bu sabitleme yalnızca kendi tarayıcınızda saklanır, hiçbir sunucuda değil; bu nedenle farklı bir bilgisayar veya temizlenmiş bir tarayıcı yeniden "ilk kez" gösterir — bu kasıtlıdır. Handle'lar 3-20 karakter uzunluğundadır (`a-z`, `0-9`, `_`) ve belirli bir adrese aittir; bu sayede birden fazla adresi olan biri her adreste farklı bir handle kullanabilir. Handle sorgulama geçici olarak kullanılamıyorsa alan bunu belirtir ve yine de bir `qor1...` adresine gönderebilirsiniz.

#### MetaMask ile gönderme {#send-metamask}

:::caution Zincir v3.2.0'dan itibaren MetaMask tek başına mainnet'te gönderemez
EVM yolu, bir işlemi yalnızca kayıtlı bir kuantum-sonrası anahtarı olan ve **açık bir EVM yetkilendirme penceresi** bulunan bir hesaptan kabul eder: bu, hesabın kuantum-sonrası imzalı bir mesajla açtığı; süre, işlem sayısı ve değer bakımından sınırlı bir izindir. MetaMask bu mesajı üretemez. Pencere olmadan gönderirseniz zincir işlemi reddeder (tipik hatalar: pencere yok, pencere tükendi, kuantum-sonrası anahtar yok).
:::

1. **QoreX**'te (hesabın kendi cüzdanı), hesabın kuantum-sonrası anahtarı yoksa kaydedin (o hesaptan yaptığınız ilk QoreX transferi bunu yapar), ardından bir EVM yetkilendirme penceresi açın — bkz. [EVM erişim penceresi](/qorex/security-and-recovery#evm-window). Bu, MetaMask'in anahtarını paylaşan **Ethereum tarzı (coin 60) hesap** içindir — aynı kurtarma ifadesini kullanarak QoreX'te **Add an Ethereum account (coin 60)** ile ekleyin ([nasıl](/qorex/getting-started#restore-dashboard)); hiçbir MetaMask anahtarı sıradan bir coin-118 `qor1…` hesabından gönderemez. Bir pencere, bloklarla (en fazla 17.280, mainnet'te yaklaşık 15 saat), işlem sayısıyla (en fazla 1.000) ve her tutarı maksimum ücretiyle **birlikte** sayan bir QOR harcama üst sınırıyla sınırlandırılır. Rahat olduğunuz limitleri seçin ve küçük tutun: bir pencere açıkken MetaMask işlemleri QOR'u kuantum-sonrası imza olmadan taşır. Yeni bir pencere açmak öncekinin yerini alır ve hesabın nonce değerini ilerletir; bu yüzden MetaMask'ten göndermeden **önce** açın (daha önce hazırlanmış bir işlem "nonce too low" ile başarısız olur). v3.2.3'ten beri zincir ayrıca daha dar, kapsamlı pencereleri de destekler; QoreX henüz bunlar için bir ekran sunmaz.
2. MetaMask'i açın ve QoreChain EVM ağına ayarlı olduğunu doğrulayın.
3. MetaMask içinde **Send** seçeneğini seçin, alıcının `0x...` adresini ve tutarı girin, gaz ücretini gözden geçirin ve onaylayın.
4. Dashboard Cüzdan sayfasına dönün; işlem zincire yazıldığında geçmişinizde görünür (henüz görünmediyse yenileyin).

Her işlem pencerenin bir kısmını tüketir; süre, işlem sayısı veya değer limitine ulaşıldığında QoreX'te yenisini açın. İşiniz bittiğinde pencereyi QoreX'ten kapatın.

### Belirli bir ray üzerinden alma {#receive-mainnet}

1. **Receive** seçeneğini seçin.
2. Alma penceresinde seçiciyle bir ray belirleyin: **Native QOR**, **EVM** veya **SVM**.
3. Pencere, adresinizi o rayın kodlamasıyla (`qor1...`, `0x...` veya base58) bir QR kodu ve kopyalama düğmesiyle birlikte gösterir.
4. Adresi kopyalayın veya göndericinin QR kodunu taramasına izin verin.

Gönderici hangi rayı kullanırsa kullansın, fonlar aynı hesaba ulaşır — tek hesap, üç kodlama, tek bakiye.

### İşlem geçmişinizi okuma {#history}

Mainnet üzerinde, geçmişinizdeki her satır şunları gösterir:

- İşlemin hangi rayı kullandığını belirten bir **ray rozeti** — Native, EVM veya SVM.
- Sıradan transferler için **Sent** veya **Received**, diğer etkinlikler için açıklayıcı bir tür etiketi (örneğin *PQC key registration* veya bir sözleşme eylemi).
- Tutar, zaman ve bir **Confirmed** / **Failed** durumu ile birlikte [Explorer](/dashboard/explorer) içinde açabileceğiniz işlem hash'i.

## Cüzdanı testnet üzerinde kullanma {#testnet}

Testnet üzerinde (`qorechain-diana`) Dashboard sizin için bir test cüzdanı yönetir; böylece hiçbir şey bağlamadan akışları uçtan uca test edebilirsiniz.

### Sayfa neler gösterir

- Cüzdan etiketiniz ve etkin adresiniz, kısaltılmış biçimde, tek tıkla kopyalama düğmesiyle birlikte.
- QOR cinsinden **toplam bakiyeniz**.
- Kuantum güvenli şifrelemeyi ve bağlı ağı belirten bir güvenlik paneli.
- Yenileme kontrolüne sahip bir son güncelleme göstergesi.
- Bir **Transaction history** sekmesi ve bir **Tokens** sekmesi içeren bir **Assets & Activity** bölümü.

Güncel bakiyenizi ve en son etkinliğinizi zincirden çekmek için yenileme kontrolünü istediğiniz zaman kullanabilirsiniz.

:::caution Testnet adresleri mainnet adresleriyle birebir aynı görünür
Testnet ve mainnet aynı `qor1...` biçimini kullanır; bu nedenle bir testnet adresi hiçbir uyarı olmadan bir borsa çekimine veya başka bir cüzdana yapıştırılabilir — ve ona gönderilen gerçek QOR, bu testnet sayfasının gösteremeyeceği **mainnet** üzerinde, o adrese ulaşır. Bir testnet adresine asla gerçek QOR göndermeyin. Dashboard bu uyarıyı Cüzdan sayfasında adresin yanında, **My Wallets** listesinde ve **Receive** ekranında tekrarlar. Gerçek QOR için Mainnet'e geçin ve orada gösterilen adresi kullanın; bir testnet adresine zaten gerçek QOR gönderdiyseniz destek ile iletişime geçin — kendiniz taşımaya çalışmayın.
:::

### QOR gönderme (testnet)

1. **Send** seçeneğini seçin.
2. **Recipient Address** alanına alıcı adresini girin (`qor1...`).
3. **Amount** (veya **MAX**) ve isteğe bağlı bir **Memo** girin.
4. **Review Transaction** seçeneğini seçin, ayrıntıları ve tahmini ağ ücretini kontrol edin, ardından **Confirm & Send** seçeneğini seçin.

Alıcı adresini yazarken, hata yapmanızı önlemeye yardımcı olmak için kayıtlı kişiler ve son kullanılan adresler önerilir. Transfer gönderildikten sonra, [Explorer](/dashboard/explorer) içinde açabileceğiniz işlem hash'iyle birlikte bir onay alırsınız.

### QOR alma (testnet)

1. **Receive** seçeneğini seçin.
2. Adresinizi veya QR kodunu gönderici ile paylaşın ya da adresi tek tıkla kopyalayın.
3. İsteğe bağlı olarak, bir ödeme bağlantısı ve indirilebilir bir QR kodu oluşturmak için istenen tutarı ve notu girin.

### Test cüzdanlarınızı yönetme

Adres listenizi açmak için **My Wallets** seçeneğini seçin. Buradan cüzdanlar arasında geçiş yapabilir, yeni bir cüzdan oluşturabilir, mevcut bir cüzdanı içe aktarabilir veya artık ihtiyaç duymadığınız bir cüzdanı kaldırabilirsiniz. Etkin cüzdan, testnet üzerinde Dashboard genelinde gönderme, takas, stake ve diğer imzalı işlemler için kullanılan cüzdandır.

### Bir test cüzdanının kurtarma ifadesini yedekleme veya dışa aktarma {#reveal-recovery-phrase}

Testnet üzerinde Dashboard cüzdanlarınızı sizin için yönetir, ancak bir cüzdanın 24 kelimelik kurtarma ifadesini dışa aktarıp QoreX gibi kendi saklamanızdaki (self-custody) bir cüzdana aktarabilirsiniz.

1. Testnet **Wallet** sayfasında **Recovery phrase** kartını bulun. Kart, Dashboard tarafından yönetilen her cüzdanı **mainnet** bakiyesiyle birlikte (fonlanmış cüzdanlar önce) listeler; böylece tokenlerinizi gerçekten tutan cüzdanı seçebilirsiniz.
2. Cüzdanın yanındaki **Reveal** seçeneğini seçin, uyarıyı ("Reveal the phrase for …?") okuyun ve **Continue** seçeneğini seçin.
3. Hesabın oturum açma sayfasında yeniden oturum açmak üzere yönlendirilirsiniz (yeni bir parola doğrulaması gerekir; Dashboard parolanızı hiçbir zaman görmez) ve otomatik olarak cüzdana dönersiniz.
4. 24 kelime 60 saniye boyunca gösterilir. Bunları yazın ve çevrimdışı saklayın. Onay kutusunu işaretlerken veya doğrulama alanlarına yazarken geri sayım duraklar.
5. **I have written down my recovery phrase and stored it somewhere safe** seçeneğini işaretleyin, yazılı kopyanızdan **3**, **5** ve **9** numaralı kelimeleri (*Required* olarak işaretli) yazın ve **Confirm backup** seçeneğini seçin. "Recovery phrase saved" mesajını görürsünüz.
6. **Hide without confirming** ile çıkarsanız (veya süre dolarsa) kart "Backup not confirmed" gösterir — ifadeyi yazdığınızı hiçbir şey kaydetmez — ve **Reveal again and confirm** seçeneğini sunar.

Bu 24 kelimeye sahip olan herkes cüzdanı kontrol eder. QoreChain bunları sizin için asla kurtaramaz veya sıfırlayamaz ve destek ekibi bunları asla istemez.

## QoreChain'i cüzdanınıza ekleyin {#add-network}

Cüzdan sayfasındaki **Add QoreChain to your wallet** paneli (mainnet'te **Connect Wallets** sekmesinde ve bir cüzdan bağlanana kadar bağlan düğmelerinin altında yer alır; testnet'te sayfanın en altındadır) yan yana dört kart gösterir — her bağlantı yöntemi için bir tane — böylece QoreChain'i kendi cüzdanınıza tek tıkla ekleyebilirsiniz:

| Kart | Size ne sağlar |
| --- | --- |
| **Native (Cosmos) wallets** | Her biri kopyalama düğmesine sahip RPC ve REST uç noktaları ile zincir kimliği — Keplr ve diğer Native rayı cüzdanları için. |
| **EVM wallets** | Kullanıma hazır EIP-3085 ağ parametreleri — tek tıkla QoreChain, MetaMask'e ve diğer EVM cüzdanlarına eklenir. |
| **SVM wallets** | SVM uyumlu cüzdanlar ve araçlar için SVM RPC URL'si. |
| **Mobile wallets (WalletConnect)** | Uyumlu cüzdanların mobil sürümleri için bir WalletConnect v2 eşleştirme QR kodu. |

QoreChain'i eklemek için:

1. **Wallet** sayfasını açın ve **Add QoreChain to your wallet** panelini bulun.
2. Cüzdanınızın rayına uyan kartı seçin.
3. Ekleme düğmesini seçin (**Add to Keplr** / **Add to Cosmostation**, **Add to MetaMask** veya diğer EVM cüzdanınız ya da WalletConnect eşleştirmesi) veya uç noktaları ve zincir kimliğini cüzdanınızın ağ ekleme formuna kopyalayın (SVM kartı, özel RPC ayarına yapıştırmanız için SVM RPC URL'sini verir).
4. Yeni ağı cüzdanınızda onaylayın.

Genel uç noktalar `rpc.qore.host` (Native RPC), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC) ve `svm.qore.host` (SVM RPC) olup, testnet için `*-testnet` varyantları (örneğin `rpc-testnet.qore.host`) mevcuttur. Zincir kimlikleri: mainnet `qorechain-vladi` (EVM zincir kimliği `9801`), testnet `qorechain-diana` (EVM zincir kimliği `9800`).

### Bağlı imzalayıcılar (Phantom) {#linked-signers}

**SVM wallets** kartı ayrıca bir Phantom anahtarını hesabınıza **bağlı imzalayıcı (linked signer)** olarak bağlamanıza da olanak tanır — QoreX, Keplr veya MetaMask gibi ayrı bir birincil cüzdan bağlantısı değil, süre sınırlı (30 gün), iptal edilebilir bir yetkilendiricidir (authenticator). **Connect Phantom**'u, ardından **Register authenticator**'ı seçin; kaydı mevcut cüzdanınız imzalar ve Phantom hiçbir zaman kendi başına bir kimlik haline gelmez.

:::caution Bağlı imzalayıcı kaydı şu anda zincirde kapalıdır
Zincirin akıllı hesap ve bağlı cüzdan özellikleri uygulanmıştır ancak ana ağda kapalı, test ağında etkindir (`abstractaccount.enabled` ana ağda `false`'tur; `GET /qorechain/abstractaccount/v1/config` ile kontrol edin) ve bu durum sürdüğü sürece ana ağ zinciri yeni bağlı imzalayıcı kayıtlarını reddeder. Ana ağda kartı şimdilik bir önizleme olarak değerlendirin ve bir kaydın başarılı olmasını beklemeyin.
:::

:::caution Bağlı bir imzalayıcı, hesap üzerinde gerçek bir yetkidir
Özellik etkinleştirildiğinde, verdiğiniz izin anahtarın ne kadar taşıyabileceğini değil, hangi yolda işlem yapabileceğini belirler ve bir kayıt 30 gün geçerli kalır. Yalnızca hesabın kendisi kadar güvendiğiniz bir Phantom anahtarını bağlayın ve artık ihtiyacınız kalmadığında iptal edin.
:::

Zincir üstü izin ve harcama-limiti modeli için QoreX belgelerinde [Bağlı imzalayıcılar ve harcama limitleri](/qorex/security-and-recovery#linked-signers) sayfasına bakın.

## İlgili

- [Token Operations](/user-guide/token-operations) — QOR transferlerinin ve birimlerinin arkasındaki kavramlar.
- [Trade](/dashboard/trade) — tokenleri takas edin (şu anda test tokenleri).
