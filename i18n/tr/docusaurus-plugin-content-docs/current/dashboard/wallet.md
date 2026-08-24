---
slug: /dashboard/wallet
title: Cüzdan
sidebar_label: Cüzdan
sidebar_position: 3
---

# Cüzdan

**Cüzdan** sayfası, bakiyenizi ve işlem geçmişinizi görüntülediğiniz, QOR aldığınız ve gönderdiğiniz yerdir. Sayfanın nasıl çalıştığı ağa bağlıdır:

- **Mainnet — gözetimsiz (non-custodial).** Dashboard, mainnet anahtarlarını tutmaz. Kendi cüzdanınızı bağlarsınız — **QoreX** (resmi QoreChain cüzdanı, uzantı veya uygulama), **Keplr** ya da **MetaMask** — gerçek bakiyeniz ve geçmişiniz doğrudan zincirden okunur ve herhangi bir ray üzerinden fon alabilirsiniz. **Native** ray üzerinde gönderme ve stake işlemleri **QoreX gerektirir**: QoreChain hesapları kuantum-sonrası hibrit bir imzayla imzalanır ve bu imzayı üreten cüzdan QoreX'tir; bu nedenle Dashboard'ın Send ve Stake sekmeleri, başka hangi cüzdanı da bağlamış olsanız fark etmeksizin QoreX üzerinden çalışır. Native-ray (`qor1...`) bakiyenizi görüntülemek ve bu ray üzerinden fon almak için Keplr yine de bağlanabilir. **MetaMask**, klasik bir imza kullanan ve bundan etkilenmeyen **EVM rayında** (`0x...`) bağımsız olarak imzalar ve gönderir.
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
3. **Connect Wallet** seçeneğini seçin ve bir cüzdan seçin — **QoreX** (önerilen, resmi QoreChain cüzdanı — Native ray üzerinde gönderme ve stake için zorunludur), **Keplr** (Native rayda görüntüleme/alma için) veya **MetaMask** (EVM rayında bağlanma, gönderme ve alma için). Her biri için adım adım talimatlara aşağıda bakın.
4. Sayfa, gerçek bakiyenizi ve işlem geçmişinizi zincirden yükler.

Bağlandıktan sonra Cüzdan sayfası her şeyi altı sekmede düzenler: **Wallet** (bakiye ve hesap özeti), **Send from QoreX**, **Stake / Delegate**, **Rewards**, **Details** (`qor1...` / `0x...` / SVM adresleriniz) ve **Connect Wallets** (bağladığınız her cüzdan ve daha fazlasını nereden bağlayacağınız). Send, Stake ve Rewards sekmeleri QoreX üzerinden çalışır — Keplr veya MetaMask'i de bağlamış olsanız bile bu böyledir, çünkü Native-ray işlemleri QoreX'in ürettiği kuantum-sonrası hibrit imzaya ihtiyaç duyar.

Cüzdanınızda QoreChain henüz yapılandırılmamışsa önce ekleyin — bkz. [QoreChain'i cüzdanınıza ekleyin](#add-network).

### QoreX ile bağlanma — tarayıcı uzantısı {#connect-qorex-extension}

1. Cüzdan sayfasında **QoreX wallet** kartını bulun ve **Connect with QoreX** seçeneğini seçin.
2. Bu tarayıcıda QoreX uzantısı (0.1.4 veya sonrası) algılandığından, Dashboard nasıl bağlanmak istediğinizi sorar. **Browser extension** seçeneğini seçin.
3. QoreX uzantısı, bağlantı isteğinde bulunan site olarak `dashboard.qorechain.io` adresini gösteren kendi onay açılır penceresini açar.
4. Açılır penceredeki isteği inceleyin ve onaylayın — bu, `qor1...` adresinize sahip olduğunuza dair tek seferlik bir kanıt imzalar; hiçbir fon hareket etmez ve başka hiçbir izin verilmez.
5. Açılır pencere kapanır ve Dashboard, QoreX kartında **Connected: qor1...** gösterir; adresiniz Cüzdan sayfasının geri kalanının kilidini açar. Uzantı/uygulama seçimi hatırlanır, böylece bu tarayıcıda bir dahaki sefere **Connect with QoreX** seçtiğinizde sormadan aynı şekilde yeniden bağlanır — bağlantı kartında **Use a different method** seçeneğini kullanarak istediğiniz zaman yöntem değiştirebilirsiniz.

Aynı Dashboard hesabına birden fazla QoreX adresi bağlayabilirsiniz — örneğin biri bir Firefox uzantısından, diğeri Chrome'dan, ya da bir telefon ve bir dizüstü bilgisayardan. Akışı ikinci bir adresle tekrarlamak için **Add another wallet** seçeneğini seçin; bağlı her adrese kendi etiketi verilebilir ve **Connect Wallets** sekmesinden biri gönderim için varsayılan olarak işaretlenir.

### QoreX ile bağlanma — mobil uygulama {#connect-qorex-app}

1. Cüzdan sayfasında **QoreX wallet** kartını bulun ve **Connect with QoreX** seçeneğini seçin.
2. Uzantı seçici görünürse **QoreX app** seçeneğini seçin (bu tarayıcıda bir uzantı algılanmazsa Dashboard doğrudan bu akışa geçer).
3. Dashboard bir QR kodu ve bir **Open QoreX** bağlantısı gösterir.
4. Telefonunuzda QoreX uygulamasını açın ve QR kodunu onunla tarayın — ya da aynı telefonda geziniyorsanız uygulamayı doğrudan `qorex://connect` bağlantısı üzerinden başlatmak için **Open QoreX** seçeneğine dokunun.
5. QoreX, eşleştirme isteğini Dashboard'ın kaynağıyla birlikte gösterir. İnceleyin ve biyometrik onayınızla (Face ID / Touch ID / PIN) onaylayın.
6. Dashboard arka planda onayı yoklamaya devam eder; birkaç saniye içinde QoreX kartında **Connected: qor1...** gösterir ve adresiniz Cüzdan sayfasının geri kalanının kilidini açar.

### Keplr ile bağlanma {#connect-keplr}

Keplr, Native-ray bakiyenizi, geçmişinizi ve alma adresinizi görüntülemek için bağlanır. Native ray üzerinde gönderme ve stake işlemleri QoreX kullanır (aşağıya bakın) — QoreChain hesapları kuantum-sonrası hibrit bir imzayla imzalanır; Dashboard'ın Send ve Stake sekmelerinin burada bağladığınız cüzdan yerine QoreX üzerinden çalışmasının nedeni budur.

1. Cüzdan sayfasında **Connect Wallet** seçeneğini seçin ve **Keplr**'i seçin.
2. QoreChain henüz Keplr'de yapılandırılmamışsa Dashboard, Keplr'in `suggestChain` istemini tetikler — Keplr açılır penceresindeki ağ ayrıntılarını (zincir kimliği, RPC/REST uç noktaları) inceleyin ve eklemek için **Approve** seçeneğini seçin.
3. Ardından Keplr, bağlanacak hesabı seçmenizi ve bağlantıyı onaylamanızı ister — **Approve** seçeneğini seçin.
4. Dashboard, `qor1...` adresinizi okur ve bakiyenizi ile geçmişinizi yükler.

### MetaMask ile bağlanma {#connect-metamask}

1. Cüzdan sayfasında **Connect Wallet** seçeneğini seçin ve **MetaMask**'i seçin.
2. QoreChain EVM ağı henüz eklenmemişse MetaMask, zincir kimliği, RPC URL'si ve para birimi simgesi önceden doldurulmuş **Add network** istemini (EIP-3085) gösterir — inceleyin ve **Approve**, ardından **Switch network** seçeneğini seçin.
3. MetaMask hangi hesabın bağlanacağını sorar — hesabı seçin ve **Connect**'i onaylayın.
4. Dashboard, `0x...` adresinizi okur ve bakiyenizi ile geçmişinizi yükler.

### Mainnet üzerinde gönderme {#send-mainnet}

Dashboard mainnet anahtarlarınızı hiçbir zaman tutmadığı için her gönderim Dashboard'da oluşturulur ancak kendi cüzdanınızda tamamlanır. **Native rayda** bu cüzdan her zaman **QoreX**'tir — Send ve Stake sekmeleri, başka hangi cüzdanı da bağlamış olsanız fark etmeksizin onun üzerinden çalışır, çünkü QoreChain hesapları kuantum-sonrası hibrit bir imzayla imzalanır. **EVM rayında** MetaMask bağımsız olarak imzalar ve gönderir.

:::caution Gerçek fonlar, geri alınamaz transferler
Mainnet işlemleri geri alınamaz. Onaylamadan önce alıcı adresini her zaman iki kez kontrol edin.
:::

:::note Vesting bakiyeleri
Bakiyenizin bir kısmı hâlâ vesting sürecindeyse, bu tutar stake için delege edebileceğiniz miktara dahil edilir, ancak bir işlem ücreti ödeyemez — bunun için, bir PQC anahtarı kaydettirmek dahil, ayrıca harcanabilir QOR'a ihtiyacınız vardır. Yalnızca vesting tutarıyla fonlanmış bir cüzdan delege edebilir ama gönderemez.
:::

#### QoreX ile gönderme — tarayıcı uzantısı

1. Cüzdan sayfasında, **Send from QoreX** kartına alıcıyı (bir `qor1...` adresi veya bir `@handle`), QOR cinsinden tutarı ve isteğe bağlı bir notu (memo) girin.
2. **Continue in QoreX** seçeneğini seçin.
3. Dashboard bir **Approve in browser extension** düğmesi gösterir — seçin.
4. QoreX uzantısı, transferin tamamen çözümlenmiş halini — alıcı ve tutar — gösteren onay açılır penceresini açar. İnceleyin ve uzantınızın kendi güvenliğini (biyometrik veya parola kilidi açma) kullanarak onaylayın.
5. Uzantı, transferi hibrit bir PQC imzasıyla imzalar ve doğrudan zincire yayınlar — Dashboard yalnızca ortaya çıkan işlem hash'ini öğrenir.
6. Cüzdan sayfası, [Explorer](/dashboard/explorer) içinde açabileceğiniz işlem hash'i ile birlikte **Transfer confirmed** gösterir.

#### QoreX ile gönderme — mobil uygulama

1. Cüzdan sayfasında, **Send from QoreX** kartına alıcıyı (bir `qor1...` adresi veya bir `@handle`), QOR cinsinden tutarı ve isteğe bağlı bir notu (memo) girin.
2. **Continue in QoreX** seçeneğini seçin.
3. Dashboard, bir `qorex://tx` isteği taşıyan bir QR kodu ve bir **Open QoreX** bağlantısı gösterir.
4. QR kodunu QoreX uygulamasıyla tarayın, ya da aynı telefondaysanız **Open QoreX** seçeneğine dokunun.
5. QoreX isteği çözer ve alıcıyı ile tutarı tam olarak gösterir. İnceleyin ve biyometrik onayınızla onaylayın.
6. QoreX, transferi hibrit bir PQC imzasıyla imzalar ve yayınlar.
7. Dashboard sonucu yoklar ve zincire yazıldığında [Explorer](/dashboard/explorer) içinde açabileceğiniz işlem hash'i ile birlikte **Transfer confirmed** gösterir.

#### Bir @handle'a gönderme

**Send from QoreX** kartındaki alıcı alanı, bir `qor1...` adresi yerine bir `@handle` da kabul eder. Bundan sonra ne olacağı, bu handle'a bu tarayıcıdan daha önce ödeme yapıp yapmadığınıza bağlıdır:

- **İlk kez**: çözümlenen adres tam olarak gösterilir ve kullanılabilmesi için **Confirm address** seçeneğini seçmeniz gerekir — adres yalnızca siz onayladıktan sonra hatırlanır (sabitlenir), çözümlendiği an değil.
- **Öncekiyle aynı adres**: hafif bir onayla geçer — yeniden yazmaya gerek yoktur.
- **Öncekinden farklı bir adres**: akış tamamen durur. Hem önceki hem de yeni adres tam olarak gösterilir — bir saldırganın benzer göstermeye çalışacağı tam da orta karakterleri gizlediği için asla kısaltılmaz — adresin değiştiğine dair açık bir uyarıyla birlikte ve yine de devam etmek için **bilerek ikincil stilde tasarlanmış** bir düğmeyle.

Bu sabitleme yalnızca kendi tarayıcınızda saklanır, hiçbir sunucuda değil; bu nedenle farklı bir bilgisayar veya temizlenmiş bir tarayıcı yeniden "ilk kez" gösterir — bu kasıtlıdır. Handle'lar 3-20 karakter uzunluğundadır (`a-z`, `0-9`, `_`) ve belirli bir adrese aittir; bu sayede birden fazla adresi olan biri her adreste farklı bir handle kullanabilir.

#### MetaMask ile gönderme

1. MetaMask'i açın ve QoreChain EVM ağına ayarlı olduğunu doğrulayın.
2. MetaMask içinde **Send** seçeneğini seçin.
3. Alıcının `0x...` adresini ve tutarı girin.
4. Gaz ücretini gözden geçirin ve imzalayıp yayınlamak için onaylayın.
5. Dashboard Cüzdan sayfasına dönün; işlem zincire yazıldığında geçmişinizde görünür (henüz görünmediyse yenileyin).

### Belirli bir ray üzerinden alma {#receive-mainnet}

1. **Receive** seçeneğini seçin.
2. Alma penceresinde seçiciyle bir ray belirleyin: **Native QOR**, **EVM** veya **SVM**.
3. Pencere, adresinizi o rayın kodlamasıyla (`qor1...`, `0x...` veya base58) bir QR kodu ve kopyalama düğmesiyle birlikte gösterir.
4. Adresi kopyalayın veya göndericinin QR kodunu taramasına izin verin.

Gönderici hangi rayı kullanırsa kullansın, fonlar aynı hesaba ulaşır — tek hesap, üç kodlama, tek bakiye.

### İşlem geçmişinizi okuma {#history}

Mainnet üzerinde, geçmişinizdeki her satır şunları gösterir:

- İşlemin hangi rayı kullandığını belirten bir **ray rozeti** — Native, EVM veya SVM.
- Genel bir etiket yerine *Send*, *PQC key registration* veya *contract deploy* gibi **gerçek bir işlem türü etiketi**.
- Tutar, zaman ve durum ile birlikte [Explorer](/dashboard/explorer) içinde açabileceğiniz işlem hash'i.

## Cüzdanı testnet üzerinde kullanma {#testnet}

Testnet üzerinde (`qorechain-diana`) Dashboard sizin için bir test cüzdanı yönetir; böylece hiçbir şey bağlamadan akışları uçtan uca test edebilirsiniz.

### Sayfa neler gösterir

- Cüzdan etiketiniz ve etkin adresiniz, kısaltılmış biçimde, tek tıkla kopyalama düğmesiyle birlikte.
- QOR cinsinden **toplam bakiyeniz**.
- Kuantum güvenli şifrelemeyi ve bağlı ağı belirten bir güvenlik paneli.
- Yenileme kontrolüne sahip bir son güncelleme göstergesi.
- Varlıklarınızı ve işlem geçmişinizi gösteren **Assets** ve **Activity** sekmeleri.

Güncel bakiyenizi ve en son etkinliğinizi zincirden çekmek için yenileme kontrolünü istediğiniz zaman kullanabilirsiniz.

### QOR gönderme (testnet)

1. **Send** seçeneğini seçin.
2. Alıcı adresini girin (`qor1...`).
3. Tutarı ve isteğe bağlı bir notu (memo) girin.
4. Ayrıntıları ve tahmini ücreti gözden geçirin, ardından onaylayın.

Alıcı adresini yazarken, hata yapmanızı önlemeye yardımcı olmak için kayıtlı kişiler ve son kullanılan adresler önerilir. Transfer gönderildikten sonra, [Explorer](/dashboard/explorer) içinde açabileceğiniz işlem hash'iyle birlikte bir onay alırsınız.

### QOR alma (testnet)

1. **Receive** seçeneğini seçin.
2. Adresinizi veya QR kodunu gönderici ile paylaşın ya da adresi tek tıkla kopyalayın.
3. İsteğe bağlı olarak, bir ödeme bağlantısı ve indirilebilir bir QR kodu oluşturmak için istenen tutarı ve notu girin.

### Test cüzdanlarınızı yönetme

Adres listenizi açmak için **My Wallets** seçeneğini seçin. Buradan cüzdanlar arasında geçiş yapabilir, yeni bir cüzdan oluşturabilir, mevcut bir cüzdanı içe aktarabilir veya artık ihtiyaç duymadığınız bir cüzdanı kaldırabilirsiniz. Etkin cüzdan, testnet üzerinde Dashboard genelinde gönderme, takas, stake ve diğer imzalı işlemler için kullanılan cüzdandır.

## QoreChain'i cüzdanınıza ekleyin {#add-network}

**Add Network** sayfası, yan yana dört kart gösterir — her bağlantı yöntemi için bir tane — böylece QoreChain'i kendi cüzdanınıza tek tıkla ekleyebilirsiniz:

| Kart | Size ne sağlar |
| --- | --- |
| **Native** | Her biri kopyalama düğmesine sahip RPC ve REST uç noktaları ile zincir kimliği — Keplr ve diğer Native rayı cüzdanları için. |
| **EVM** | Kullanıma hazır EIP-3085 ağ parametreleri — tek tıkla QoreChain, MetaMask'e ve diğer EVM cüzdanlarına eklenir. |
| **SVM** | SVM uyumlu cüzdanlar ve araçlar için SVM RPC URL'si. |
| **WalletConnect** | WalletConnect uyumlu herhangi bir cüzdanı bağlamak için bir WalletConnect eşleştirmesi. |

QoreChain'i eklemek için:

1. Dashboard üzerinden **Add Network** sayfasını açın.
2. Cüzdanınızın rayına uyan kartı seçin.
3. Ekleme düğmesini seçin (EVM, WalletConnect) veya uç noktaları ve zincir kimliğini cüzdanınızın ağ ekleme formuna kopyalayın (Native, SVM).
4. Yeni ağı cüzdanınızda onaylayın.

Genel uç noktalar `rpc.qore.host` (Native RPC), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC) ve `svm.qore.host` (SVM RPC) olup, testnet için `*-testnet` varyantları (örneğin `rpc-testnet.qore.host`) mevcuttur. Zincir kimlikleri: mainnet `qorechain-vladi` (EVM zincir kimliği `9801`), testnet `qorechain-diana` (EVM zincir kimliği `9800`).

### Bağlı imzalayıcılar (Phantom) {#linked-signers}

**SVM** kartı ayrıca bir Phantom anahtarını hesabınıza **bağlı imzalayıcı (linked signer)** olarak bağlamanıza da olanak tanır — QoreX, Keplr veya MetaMask gibi ayrı bir birincil cüzdan bağlantısı değil, delege edilmiş, iptal edilebilir bir harcama yetkilendiricisidir. Kayıt işlemini mevcut cüzdanınız imzalar; Phantom hiçbir zaman kendi başına bir kimlik haline gelmez. Bunun arkasındaki zincir üstü izin ve harcama-limiti modeli için QoreX belgelerinde [Bağlı imzalayıcılar ve harcama limitleri](/qorex/security-and-recovery#linked-signers) sayfasına bakın.

## İlgili

- [Token Operations](/user-guide/token-operations) — QOR transferlerinin ve birimlerinin arkasındaki kavramlar.
- [Trade](/dashboard/trade) — tokenlerinizi zincir üstü AMM'de takas edin.
- [Bridge](/dashboard/bridge) — varlıkları diğer zincirlere taşıyın ve onlardan getirin.
