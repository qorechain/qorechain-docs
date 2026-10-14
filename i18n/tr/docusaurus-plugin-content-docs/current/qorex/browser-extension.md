---
slug: /qorex/browser-extension
title: QoreX Tarayıcı Uzantısı
sidebar_label: Tarayıcı Uzantısı
sidebar_position: 2
---

# QoreX Tarayıcı Uzantısı

QoreX **tarayıcı uzantısı**, masaüstü QoreChain cüzdanıdır. **Bağımsız bir cüzdandır** — cüzdan oluşturabilir veya içe aktarabilir, QOR tutup gönderebilir ve dApp'lere bağlanabilirsiniz — ve herhangi bir web sitesinin QoreX'i keşfetmesini ve her isteği açık, çözümlenmiş bir onaya dönüştürmesini sağlayan parçadır.

Üç mağazada **yayında ve herkese açıktır**.

## Kurulum {#install}

| Tarayıcı | Kurulum |
|---|---|
| **Chrome ve Chromium tarayıcıları** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 veya üzeri) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 veya üzeri)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Hangi sürüm nerede yayında {#versions}

**15 Ekim 2026** itibarıyla: **Chrome 0.3.6**, **Firefox 0.3.7** (0.3.6'dan sonra gelen bir nokta sürümü) ve **QoreX Wallet** macOS uygulamasının içindeki **Safari** (**1.7.6**, 0.3.6 uzantısını taşır; Mac App Store kendi `1.x` numaralandırmasını kullanır). Mağaza incelemeleri farklı zamanlarda sonuçlandığı için bir mağaza kısa süreliğine daha eski veya daha yeni bir derleme sunabilir; mağaza listelemesi her zaman güncel sürümünü gösterir. Bu sayfa 0.3.6 özellik setini açıklar. Ayrıca bkz. [Hangi sürüm nerede yayında](/qorex/overview#versions).

0.2.6'dan bu yana uzantıya şunlar eklendi: [tek parolayla birden fazla cüzdan](#wallets), [elle eklediğiniz Ethereum tarzı bir hesap](#coin60), **Claim & restake**, bir **Unstaking in progress** listesi, [bir token'ı kontratıyla ekleme](#custom-tokens), [her ağda Al](#receive), [Revoke özellikli bağlı siteler](#connected-sites), [EVM erişim penceresi](#evm-window), [dApp'ler için `signAndBroadcast`](#sign-and-broadcast) ve her mesajı, ücreti ve son kullanma süresini gösteren onay ekranları.

**İzin yüzeyi 0.1.3'ten bu yana değişmedi** — bkz. [QoreX hangi izinleri istiyor](#permissions).

:::note
Safari'de onaylar açılır pencere yerine bir tarayıcı sekmesinde açılır — uzantı, aynı kod tabanından Apple'ın Safari web uzantısı sarmalayıcısıyla paketlenir.
:::

## Cüzdan oluşturma veya geri yükleme {#wallet}

Açılır pencereyi açın ve seçin:

- **Yeni cüzdan oluştur** — bir parola seçin (en az 8 karakter); QoreX cihazınızda yeni bir 24 kelimelik kurtarma ifadesi üretir (256 bit entropi), QoreChain kimliğinizi türetir ve bunu o parolayla (ve isteğe bağlı olarak bir geçiş anahtarıyla — bkz. [Güvenlik](#security)) kasada mühürler. 24 kelime **yalnızca bir kez** gösterilir — bunları yazın, *I have saved my recovery phrase somewhere safe* kutusunu işaretleyin, ardından devam edin. Daha sonra açılır penceredeki **Reveal recovery phrase** ile tekrar gösterebilirsiniz (parola gerekir).
- **Kurtarma ifadesini içe aktar** — mevcut bir ifadeden geri yükleyin. 24 kelimeden kısa bir ifade paranızı normal şekilde geri yükler, ancak QoreX bu durumda post-kuantum anahtarınızın yalnızca ifadenin gücü kadar güç alacağı konusunda sizi uyarır; tam güç için yeni bir 24 kelimelik cüzdan oluşturun ve paranızı oraya taşıyın.

:::danger Devam etmeden önce ifadeyi yazın
Uzantının kasası yalnızca bu tarayıcıda bulunur. **Uzantıyı kaldırmak, verilerini temizlemek veya tarayıcıyı sıfırlamak anahtarlarınızı siler** ve hiç kimse — QoreChain Association dahil — onları geri getiremez. Yazılı 24 kelimeniz olmadan paranız kalıcı olarak gitmiş olur. Bkz. [Şimdi yedekleyin](/qorex/security-and-recovery#back-up-now).
:::

Uzantı kendi anahtarlarını tutar; mobil uygulamaya ihtiyaç duymaz. Anahtarlar cihazdan asla ayrılmaz.

## Birden fazla cüzdan ve hesap {#wallets}

- **Cüzdanlar** (0.3.3'ten itibaren) — açılır pencerenin **Wallets** ekranı ("Wallets in this browser") bu tarayıcıdaki her cüzdanı listeler. Her birinin kendi kurtarma ifadesi vardır; **tek bir parola** hepsinin kilidini açar ve geçiş yapmak QoreX'in hangisini gösterip hangisiyle imzaladığını değiştirir (zincir üzerinde hiçbir şey hareket etmez). Yeni bir cüzdan oluşturarak (ifadesi bir kez gösterilir) veya bir cüzdanı geri yükleyerek **ekleyin**; kasayı yeniden mühürlemek için parolanız bir kez sorulur. Bir cüzdan eklemek veya kaldırmak **geçiş anahtarıyla kilit açmayı** kapatır — ana ekrandan tekrar açın. Birini kaldırmak için *Remove from this browser*'a dokunun ve parolanızı girin; son cüzdan bu ekrandan kaldırılamaz. Kaldırmak o anahtarı tarayıcıdan siler — onu yalnızca kurtarma ifadesi geri getirir.
- **Hesaplar** (0.2.2'den itibaren) — **Your accounts**, aynı ifadeden birden fazla hesap oluşturur ve bunlar arasında geçiş yapar (cüzdan başına en fazla 20; numaralandırılırlar ve yeniden adlandırılamazlar). Yazdığınız ifadeyi geri yüklemek **Account 1**'i geri getirir; diğerlerini **Add an account** ile yeniden ekleyin. Geçiş yapmak her şeyi beraberinde taşır: gönderim, staking, alım ve @handle'ınız hangi hesap etkinse onu izler.

### Ethereum tarzı hesap {#coin60}

0.3.2'den itibaren, (**Your accounts** ekranındaki) **Add an Ethereum account (coin 60)**, ilk kez MetaMask'ta veya Dashboard'da kullanılmış bir ifade için hesabı ekler; bkz. [MetaMask'tan veya Dashboard'dan bir ifadeyi geri yükleme](/qorex/getting-started#restore-dashboard). Onun 0x adresi, aynı kelimeler için MetaMask'ın gösterdiği adrestir. Bu hesapta handle'lar sunulmaz.

Portfolio, Q-Day Scanner, sosyal kurtarma, Legacy Protocol, ödeme istekleri ve cihaz bağlama yalnızca mobilde kalmaya devam ediyor — bkz. [QoreX Wallet](/qorex/overview#platform-availability).

## Hesabınız, bakiyeniz ve @handle {#account}

Açılır pencerenin boşta ekranı `qor1…` adresinizi (kopyalamak için dokunun) ve anlık QOR bakiyenizi gösterir, böylece ikisini de kontrol etmek için bir blok gezgini açmanıza gerek kalmaz.

### Vesting (kilitli) bakiyeler {#vesting}

Hesabınızda vesting QOR varsa (örneğin serbest bırakılmamış bir TGE tahsisi), bakiye **şu anda kullanılabilir** ve **hâlâ kilitli** olarak ikiye ayrılır; kullanılabilir tutarı aşan bir gönderim, ücret alındıktan sonra zincir üzerinde başarısız olmak yerine ağa ulaşmadan önce reddedilir. QoreX burada bilerek bir "sonraki kilit açılma tarihi" **göstermez**: bir vesting takvimi yönetişim tarafından değiştirilebilir, bu yüzden bakiye kartındaki bir tarih QoreX'in garanti edemeyeceği bir vaat gibi okunurdu. Doğru kalan şey, kullanılabilir-kilitli ayrımıdır.

### Bir @handle talep edin

Bazı uzantı sürümleri, mobil uygulamada olduğu gibi, açılır pencereden bu hesabın adresi için benzersiz bir **@handle** (örneğin `@liviu`) talep etmenize izin verir; açılır pencereniz bunu sunmuyorsa mobil uygulamadan talep edin (talep etme Ethereum tarzı hesaplarda sunulmaz). Talep, hesabın kendi anahtarıyla imzalanır ve o adrese bağlanır, böylece biri size gönderim yaptığında mobil uygulama ve Dashboard bunu çözümleyebilir. Handle'ların adreslere (bir bütün olarak cüzdana değil) nasıl bağlandığını görmek için bkz. [@handle](/qorex/account-and-dashboard#handle).

## Bir @handle'a gönderim {#handle-send}

0.1.9'dan itibaren, bir adres aramak yerine kayıtlı bir @handle'a doğrudan ödeme yapabilirsiniz:

1. Açılır pencereyi açın ve **Gönder**'e dokunun.
2. Alıcı alanına, bir `qor1…` adresi yerine `@` işaretini ve ardından handle'ı (örneğin `@liviu`) yazın.
3. QoreX handle'ı çözümler ve herhangi bir şey imzalamadan önce size **çözümlenmiş adresi** gösterir — bunu her zaman beklediğinizle karşılaştırın.
4. Tutarı girin ve onaylayın.

Çözümleme, QoreX onu kullanmadan önce iki şekilde doğrulanır: uzantıya gömülü bir güven anahtarına karşı kontrol edilen bir kayıt defteri onayı ve handle sahibinin talep üzerindeki kendi imzası. Bu kontrollerden herhangi birini geçemeyen bir yanıt doğrudan reddedilir — QoreX doğrulanmamış bir adresi göstermeye geri düşmez. Belirli bir handle'a ilk kez ödeme yaptığınızda QoreX çözümlediği adresi hatırlar (sabitler); o handle daha sonra **farklı** bir adrese çözümlenirse QoreX durur ve devam edip etmeyeceğinize karar verebilmeniz için hem eski hem yeni adresi tam olarak gösterir. Bu hafıza **tarayıcı başına** yaşar — aynı handle'a farklı bir tarayıcıdan veya bilgisayardan ilk kez ödeme yapmak orada da yeni olarak gösterilir. Bu beklenen bir durumdur, hata değildir.

## Al {#receive}

Açılır pencerede **Al**'a dokunarak `qor1…` adresinizi (QoreChain simgesi gömülü) bir QR kod olarak bir kopyalama düğmesiyle birlikte gösterin — bir telefondan tarayın veya adresi doğrudan yapıştırın.

**Ağ seçici.** Al ayrıca Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis ve Celestia için de adresi gösterebilir; her biri bir "yalnızca bu ağ" uyarısıyla gelir (QoreChain ilk sırada kalır).

## Uzantıdan staking {#stake}

**0.2.2**'den itibaren, açılır pencerenin kendi **Stake** ekranı var — yalnızca uzantıda oluşturulmuş bir cüzdanın artık staking ödülü kazanmak için mobil uygulamaya ihtiyacı yok.

1. Açılır pencereyi açın ve **Stake**'e gidin.
2. Ekran, komisyonlarıyla birlikte aktif validatörleri, o anda staking'e ayrılmış toplamınızı ve talep edilmeyi bekleyen ödülleri listeler. Ağın **hapse attığı (jailed)** validatörler listeden çıkarılır — bunlardan birine delege etmek asla istediğiniz şey değildir.
3. Delege etmek için bir validatör ve bir tutar seçin, ardından onaylayın. QoreX, tıpkı bir Gönder işlemi gibi, zorunlu hibrit post-kuantum imzayla imzalar. Yazarken, tutar bir işlem ücretinden daha azını bırakacaksa sizi uyarır (hesap yeniden QOR tutana kadar unstake veya talep yapamazsınız). Birden fazla hesapta, staking yapacak hesabı Stake ekranındaki hesap seçiciden seçin.
4. **Claim** ödülleri toplar; **Claim & restake** onları, kazandıran validatörlere tek işlemde yeniden bileşik olarak delege eder. QoreX önce **kilidi açık** QOR'unuzun ücreti ödeyip ödeyemeyeceğini kontrol eder (ücret, ödüller gelmeden önce ödenir) ve ödeyemiyorsa sizi bilgilendirir.
5. **Unstake** 21 günlük unbonding süresini başlatır ve tutar, kalan süreyle birlikte **Unstaking in progress** altında görünür — bkz. [Staking ve Delegasyon](/user-guide/staking-and-delegation).
6. **Move stake**, stake'i bir veya birkaç başka validatöre taşır (redelegate) — unbonding beklemesi yok, ceza yok ve ödüller akmaya devam ediyor. Bkz. [Stake'i validatörler arasında taşıma](/qorex/portfolio-and-staking#move-stake).

Staking, delegasyon ve ödüller yalnızca **Native** hattında gerçekleşir, hiçbir zaman bir EVM precompile üzerinden değil.

### Bir Dashboard staking isteğini onaylama {#stake-dashboard}

QoreChain [Dashboard](/dashboard/staking-and-validators)'u staking istekleri oluşturur ama bunları imzalayamaz — anahtarınız hiçbir zaman uzantının kasasından çıkmaz. Dashboard'da **QoreX'te Devam Et**'e tıkladığınızda, istek uzantıda açılır ve siz onu (validatör ve tutar) inceleyip tıpkı bir Gönder işlemi gibi onaylarsınız.

:::note Bir işlem "başarılı" yerine "düşürülmüş (downgraded)" gösteriliyorsa
Dashboard bazen bir işlemi temiz bir başarı yerine **düşürülmüş** olarak gösterir. Bu, paranızın hareket ettiği ama o işlem için post-kuantum imza katmanının zincirde bulunamadığı anlamına gelir — bu sizin yaptığınız bir şey değildir ve kendi tarafınızdan düzeltebileceğiniz bir şey de değildir. Bu bizim tarafımızdaki bir hatadır; lütfen incelememiz için destek ekibine bildirin. Mesaj, okuyup bildirmeniz için zamanınız olsun diye bilerek ekranda kalır, kaybolmaz.
:::

### Harici ağlarda gönderim {#send-external}

Native hattındaki QOR'un yanı sıra açılır pencere, tamamı aynı kurtarma ifadesinden türetilen harici ağlarda da varlık gönderebilir (EVM ağları için onaylamadan önce **azami ağ ücretini** — "Network fee: at most …" — gösterir):

| Tür | Ağlar | Paketlenmiş tokenlar |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | ERC-20 kayıtları (EVM zincirlerinin tamamında USDC ve USDT, Ethereum'da DAI) |
| SVM | Solana | SPL kayıtları (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | IBC üzerinden Noble USDC; isteğe bağlı memo alanı |

Harici bir transfer gönderilmeden önce açık bir onay kutusunu işaretlemeniz gerekir: **"Harici ağlar yalnızca klasik imzaları kabul eder — QOR'unuzun aksine, bu transfer kuantum güvenli DEĞİLDİR."** Harici zincirler post-kuantum bir imza taşıyamaz ve QoreX bunu asla gizlemez.

## Desteklenen cüzdan standartları {#standards}

QoreX, tamamı sayfaya `window.qorex` (`{ evm, native, svm }`) olarak enjekte edilen ve [`@qorechain/connect`](/sdk/overview) tespit sözleşmeleri üzerinden keşfedilen üç arayüz sunar.

| Standart | Nedir | Geliştirici olarak sizin için ne anlama gelir |
|---|---|---|
| **EIP-1193** | Ethereum sağlayıcı JavaScript API'si (`request(...)`, olaylar). | QoreX'in EVM sağlayıcısı hesap ve ağ sorgularına yanıt verir — `eth_requestAccounts`, `eth_accounts`, `eth_chainId` ve `wallet_switchEthereumChain` (diğer her zincir standart `4902` değerini döndürür). EVM işlemlerini veya mesajlarını henüz imzalamaz veya göndermez: diğer yöntemler "EVM method … not yet supported" döndürür. EVM hattı işlemleri için MetaMask veya başka bir EVM cüzdanı kullanın (bunlar artık açık bir [EVM erişim penceresi](#evm-window) de gerektirir). |
| **EIP-6963** | Çoklu cüzdan sağlayıcı keşfi (duyur / iste olayları). | QoreX kendisini diğer tüm cüzdanların yanında duyurur — **`window.ethereum` nesnesinin üzerine asla yazmaz** — böylece kullanıcı QoreX'i site bazında çakışma olmadan seçer. |
| **Native sağlayıcı (Keplr tarzı)** | `window.qorex.native`: `enable`, `getKey`, `signDirect` ve `signAndBroadcast`, ayrıca bir `capabilities` listesi. Tam bir Keplr yerine geçeni **değildir** — QoreX `window.keplr` için takma ad oluşturmaz ve `getOfflineSigner`, `signAmino` veya `sendTx` yoktur. | Bir QoreChain işlemi göndermek için **`signAndBroadcast`** çağırın (bkz. [Bir QoreChain işlemi gönderme](#sign-and-broadcast)): QoreX çözümlenmiş mesajları ve ücreti gösterir, yalnızca cüzdanın üretebileceği hibrit post-kuantum imzayı ekler ve yayınlar. QoreChain üzerinde `signDirect`, işlem zaten geçerli bir kuantum güvenli katman taşımıyorsa reddedilir. |
| **Solana Wallet Standard** *(0.1.5'ten itibaren)* | Solana dApp'leri için yerel cüzdan keşfi (`wallet-standard:register-wallet` / `app-ready`). | Solana dApp'leri **QoreX'i otomatik algılar** — özel entegrasyon gerekmez. Özellikler: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; zincir `solana:mainnet`; hem `legacy` hem `v0` işlemler. |

:::note SVM hattına doğrudan erişim
Aynı arayüz `window.qorex.svm` üzerinde de mevcuttur (`connect` / `signAndSendTransaction` / `signMessage`). Wallet-Standard otomatik keşfi ve tamamen uygulanmış SVM hattı **0.1.5** ile piyasaya sürüldü ve hem Chrome hem de Firefox'ta yayındadır (bkz. [hangi sürüm nerede yayında](#versions)).

Solana onayları **talimat başına bir satır** gösterir ve QoreX'in çözebildiği yerlerde çözümler: SOL transferleri (alıcı ve lamports), SPL token transferleri, **"ALLOW SPENDING of your tokens"** (approve), **"HAND OVER control of the account"** (set authority) ve bir token hesabını kapatma — başka her şey için programla birlikte "instruction QoreX cannot read" der. Bir approve veya set-authority talimatı içeren bir istek "wants authority over your Solana tokens — read every line below" başlığını taşır. Cüzdanınızı imzalayan olarak listelemeyen işlemler reddedilir, `signMessage` aslında bir işlem olan baytları imzalamaz ve imza **klasik** olarak işaretlenir — bkz. [Post-kuantum imzalama](#pqc).
:::

## Coinler ve tokenlar {#custom-tokens}

Açılır pencerenin **Coins and tokens** ekranı, **bir ERC-20 token'ı kontratıyla** eklemenizi sağlar: ağı seçin, kontrat adresini yapıştırın, **Check contract**. QoreX token'ın adını ve ondalık sayısını kontratın kendisinden okur — ve açılır pencereye güvenmek yerine eklediğinizde arka planda tekrar okur — ardından, herkesin herhangi bir adla token oluşturabileceğini hatırlatan bir notla birlikte gösterir. Token daha sonra **Send on external networks** içinde görünür. Paketlenmiş tokenları, kopyaları, EVM olmayan ağları, hatalı adresleri, okunamayan kontratları ve paketlenmiş bir token'ın adını ödünç alan kontratları reddeder.

## Bağlı siteler {#connected-sites}

Açılır penceredeki **Connected sites**, bu cüzdanın onayladığı her siteyi listeler — bir site bu cüzdanın adresini görebilir ve sizden imza isteyebilir. Birini kaldırmak için **Revoke**'a dokunun. Onaylar **cüzdan başına** tutulur: bir cüzdan için onaylanmış bir site, siz geçiş yaptıktan sonra başka bir cüzdanın adresini okuyamaz.

## EVM erişim penceresi {#evm-window}

Açılır pencerenin **EVM access window** ekranı, bir hesabın QoreChain'in EVM hattında (v3.2.0 ve sonrası) gönderim yapmasına izin veren pencereyi açar ve kapatır — uygulamadaki ekranla aynıdır. Bkz. [EVM erişim penceresi](/qorex/security-and-recovery#evm-window).

## Dil {#language}

Uzantı, mobil uygulama, dashboard ve site ile aynı on dili konuşur: İngilizce, Rumence, Almanca, İspanyolca, Fransızca, İtalyanca, Türkçe, Arapça, Japonca ve Korece. Varsayılan olarak **tarayıcınızın** dilini izler (bunun dışındaki her şey için İngilizce'ye geri döner) — bunun, **telefonun** dilini izleyen mobil uygulamadan farklı bir kaynak olduğunu unutmayın, dolayısıyla telefonunuz ve tarayıcınız farklı ayarlandıysa ikisi farklı diller gösterebilir. Açılır pencerenin boşta ekranındaki bir seçici, algılanan dili istediğiniz zaman geçersiz kılmanıza olanak tanır; Arapça'ya geçmek yalnızca metni değil, açılır pencereyi de hemen sağdan sola çevirir.

## Güvenlik ve izinler {#security}

QoreX yalnızca güvenilmek için değil, doğrulanabilir olmak için tasarlandı:

- **Kasa** — anahtarlarınız **AES-256-GCM** ile mühürlenir. Parola yolu anahtarını **Argon2id** (RFC 9106, bellek yoğun: 64 MiB, t=3, p=1) ile türetir, böylece dışarı sızdırılmış bir kasa bloğu GPU/ASIC kırma denemelerine direnir. (Eski PBKDF2 blokları açılabilir olmayı sürdürür ve bir sonraki kilit açmada Argon2id ile yeniden mühürlenir.)
- **Geçiş anahtarıyla kilit açma (isteğe bağlı, 0.1.5'ten itibaren)** — kimlik doğrulayıcınızın **WebAuthn PRF** uzantısını desteklediği durumlarda QoreX, kasayı yazılan bir parola yerine geçiş anahtarının 32 baytlık PRF çıktısından açabilir. Parolanız her zaman yedek seçenek olarak kalır.

  :::note Geçiş anahtarıyla kilit açma nerede görünür
  QoreX, WebAuthn'ı özellik tespitiyle arar ve **Enable passkey unlock** seçeneğini yalnızca tarayıcının bunu uzantı sayfalarına sunduğu yerlerde gösterir — yani **Chrome ve Edge**'de. **Firefox**'ta bu seçenek gizlidir, çünkü Firefox WebAuthn'ı uzantı sayfalarına sunmaz. Bu beklenen bir durumdur, hata değildir.
  :::
- **Manifest V3 + katı CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`. Kurulumdan sonra **uzaktan kod yükleme yoktur** ve `wasm-unsafe-eval` kullanılmaz.
- **Hesap yok, telemetri yok** — analitik yok, izleme yok, uzaktan günlükleme yok, kayıt yok ve e-posta yok. Firefox listelemesi veri toplamayı `none` olarak beyan eder.

### QoreX hangi izinleri istiyor ve neden {#permissions}

Bu bölüm, Firefox listelemesinin **"Tüm web sitelerindeki verilerinize erişme"** iznini göstermesi nedeniyle var; bu ifade, hiçbir host izni beyan etmeyen bir cüzdanla çelişiyor gibi görünebilir. İşte manifest dosyasındaki tam ve düzenlenmemiş gerçek.

Uzantının `manifest.json` dosyası şunları beyan eder:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`permissions: ["storage"]`** — tek API izni. Şifrelenmiş kasayı ve köken başına bağlantı onaylarınızı **yerel olarak**, uzantı depolamasında saklar.
- **`host_permissions: []`** — QoreX **hiçbir** host izni beyan etmez. Sizin adınıza rastgele sitelere kökenler arası ağ isteği yapma yetkisi istemez.
- **`web_accessible_resources`** — sayfaların, sağlayıcıyı sunan küçük betik olan QoreX'in kendi `inpage.js` dosyasını yüklemesine izin verir. `use_dynamic_url` ona oturum başına bir adres verir, böylece siteler uzantıyı yoklayarak parmak izini çıkaramaz.
- **`content_scripts` eşleşmesi `<all_urls>`** — Firefox'un *"Tüm web sitelerindeki verilerinize erişme"* demesinin dürüst nedeni budur. QoreX, **her sayfaya** küçük bir sağlayıcı betiği (`content.js` → `inpage.js`) enjekte eder. Tüm sitelerde çalışan bir içerik betiği teknik olarak sayfayı okuyabilir ve tarayıcılar bu yetkiyi tam olarak bu ifadeyle tanımlar — ister `host_permissions` üzerinden gelsin, ister bir içerik betiği eşleşmesinden.

**İçerik betiği neden her yerde çalışıyor.** Böylece **herhangi bir** dApp, siz önce site bazında erişim vermek zorunda kalmadan cüzdanı EIP-6963 üzerinden keşfedebilir. MetaMask, Keplr, Phantom ve diğer tüm enjekte edilen cüzdanlar bu şekilde çalışır: enjekte edilen sağlayıcı, ziyaret ettiğiniz her sitede, sayfanın betikleri çalışmadan önce (`document_start`) hazır olmalıdır.

**Bu betiğin yaptığı — ve yapmadığı.** Yalnızca cüzdan mesajlarını köprüler (sağlayıcıyı duyurur, bağlanma/imzalama isteklerini service worker'a iletir, sonucu döndürür). Bu istekler dışında sayfa içeriğini **okumaz**, bir sunucuya hiçbir şey göndermez, uzaktan kod yüklemez — ve host izni bulunmadığı için rastgele kökenler arası veri de çekemez. Bunların tamamı doğrulanabilir: uzantı CSP ile kilitlidir, hiçbir analitik içermez ve Firefox paketi yeniden üretilebilir bir kaynak zip dosyası içerir.

## Bir dApp'i QoreX'e bağlama {#connect}

Bir dApp, QoreX'i **EIP-6963** üzerinden keşfeder. Duyur ve iste, ardından dönen EIP-1193 sağlayıcısını kullanın (bu sağlayıcı yalnızca hesap ve ağ sorgularına yanıt verir — yukarıdaki tabloya bakın):

```ts
import type { EIP6963ProviderDetail } from "./types";

const wallets = new Map<string, EIP6963ProviderDetail>();

// 1. Collect every wallet that announces itself.
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});

// 2. Ask installed wallets to announce.
window.dispatchEvent(new Event("eip6963:requestProvider"));

// 3. Pick QoreX by its rdns and use the standard EIP-1193 provider.
const qorex = wallets.get("network.qore.qorex");
if (qorex) {
  const accounts = await qorex.provider.request({ method: "eth_requestAccounts" });
  console.log("QoreX EVM account:", accounts[0]);
}
```

QoreChain **Native** hattı için `window.qorex.native` adresindeki sağlayıcıyı kullanın (`enable`, `getKey`, `signAndBroadcast`, `signDirect`; bu derlemenin neyi desteklediğini görmek için `capabilities` değerini okuyun). Üst düzey [`@qorechain/connect`](/sdk/overview) paketi bu tespiti sizin yerinize sarmalar.

Onaylar **köken başınadır**: bir siteye ilk bağlantı, kökeni gösteren bir onay penceresi açar, onaylamak yalnızca genel adresinizi açığa çıkarır ve bir sitenin onayı bir başkasına hiçbir yetki vermez. Onaylar cüzdan başına tutulur, siz **Connected sites** altından iptal edene kadar kalıcıdır ve bir sitenin bekleyen bir isteği olabilir (toplamda üç); cüzdan değiştirmek veya kilitlemek bekleyen isteklere "hayır" yanıtı verir. Bkz. [Onay penceresi neyi gösterir](/qorex/security-and-recovery#approvals).

### Dashboard köprüsü (v0.1.5, v0.2.2'de genişletildi) {#dashboard-bridge}

0.1.5 sürümü, yalnızca **`dashboard.qorechain.io`** ile sınırlı bir köprü ekler: `window.qorex.native.connectProof(sessionId)`, *Connect with QoreX* eşleştirme kanıtını imzalar (arka uç imzayı yeniden doğrular) ve `executeTransfer({ to, amountUqor, memo })`, Dashboard tarafından önerilen bir QOR transferini onaylayıp yayınlar ve `txHash` değerini döndürür. Bu yöntemler diğer tüm kökenlerde reddedilir.

**0.2.2** sürümü, [staking](#stake-dashboard) dahil olmak üzere Dashboard tarafından önerilen bütün bir isteği kabul eden `native:executeRequest`'i ekler; bu, QoreX'in başka her yerde kullandığı aynı paylaşılan ayrıştırıcıya karşı doğrulanır: bir ağ uyuşmazlığında, yabancı bir kökende, size ait olmayan bir adreste, bilinmeyen bir istek türünde veya bir `toAddress` taşıyan bir staking isteğinde (staking isteklerinin bir tanesi yoktur) reddedilir. İstek türleri send, delegate, undelegate, redelegate ve claim'dir; bir Connect isteği hangi hesaplarınızı bağlayacağınızı seçmenize izin verir ve `listAccounts()` hesaplarınızı döndürür (salt okunur).

Bir `qor1…` adresi mainnet ve testnette eşit derecede geçerli olduğundan, Dashboard tarafından önerilen bir istek hangi ağı hedeflediğini belirtir ve bu, uzantının o anda bağlı olduğu ağla eşleşmiyorsa QoreX bu isteğe göre hareket etmeyi reddeder — bir isteğin adına asla ağ değiştirmez.

## Bir dApp'ten QoreChain işlemi gönderme: `signAndBroadcast` {#sign-and-broadcast}

Kayıtlı bir post-kuantum anahtarı olan bir hesaptan gelen her QoreChain işlemi hibrit bir imza gerektirir — secp256k1 **ve** ML-DSA-87 — ve ML-DSA anahtarını yalnızca cüzdan tutar, dolayısıyla bir sayfa bunu oluşturamaz. Mesajları gönderin; gerisini QoreX yapar: çözümlenmiş mesajları ve ücreti gösterir, işlemi kullanıcının seçtiği hesap için oluşturur, hibrit imzayı ekler (bu hesabın ilk işlemiyse önce hesabın post-kuantum anahtarını kaydederek), yayınlar ve sonuçla tamamlanır. Uzantı **0.3.5** ve uygulama **1.1.5** sürümünden itibaren kullanılabilir (bugünkü tüm mağaza derlemeleri).

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");            // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                        // must be the wallet's active network
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],  // protobuf bytes: Uint8Array, number[] or base64
  memo: "",                                          // optional, up to 256 bytes
  gasLimit: 300000,                                  // optional
});
// → { txHash, code, height?, shield }
```

- `chainId`, cüzdanın etkin ağına eşit olmalıdır (mainnet'te `qorechain-vladi`). Bir dApp ağı değiştiremez; yalnızca kullanıcı değiştirebilir.
- Çağrı başına 1–32 mesaj; mesaj baytları tam olarak gönderildiği gibi imzalanır.
- Ücret (`gasLimit` × ağın gas fiyatı) onaydan önce gösterilir. Bir ret `QoreX: signature rejected` hatası fırlatır.
- Post-kuantum anahtar yönetimi (kayıt, taşıma, döndürme — authz `MsgExec` içinde de) reddedilir: hesabın anahtarını cüzdan kendisi yönetir.

## Post-kuantum imzalama {#pqc}

QoreX'in kendi başlattığı her QOR transferi, `@qorechain/sdk` içindeki tam hibrit hat kullanılarak, klasik secp256k1 imzasının yanında **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) ile **hibrit bir post-kuantum imzayla** imzalanır. **Bir açma/kapama seçeneği yoktur**: QoreChain bunu zorunlu kılar ve QoreX hiçbir zaman bunsuz bir Native hattı QOR transferi göndermez.

- **dApp tarafından başlatılan Native imzalama** — [`signAndBroadcast`](#sign-and-broadcast) kullanın: QoreX her mesajı çözümler, ücreti gösterir ve kuantum güvenli katmanı kendisi ekler. `signDirect`, sayfanın oluşturduğu bir işlemi imzalar ve QoreChain üzerinde, o işlem zaten geçerli bir kuantum güvenli katman taşımıyorsa **reddedilir** (ve `signAndBroadcast` kullanan Ethereum tarzı hesaplar için reddedilir). QoreX asla kör imzalamaz: çözemediği bir istek reddedilir ve yalnızca klasik imzalı bir QoreChain işlemini asla imzalamaz.
- **Klasik imzalar her zaman etiketlenir** — harici ağlardaki (ETH, BNB, Solana, …) transferler post-kuantum bir imza taşıyamaz; QoreX açık bir onay işaretlemenizi ister ve sessizce alt seviyeye düşmek yerine bunları klasik olarak işaretler.

**Bunun işlem boyutu açısından anlamı.** ML-DSA-87 büyük bir imzadır: imza **4.627 bayt**, açık anahtar ise **2.592 bayttır** (FIPS-204 tarafından sabitlenmiştir). Dolayısıyla hibrit bir QoreChain işlemi, tamamen klasik bir işleme göre birkaç kilobayt daha büyüktür. İşlemleri kendiniz oluşturup yayınlıyorsanız, tamponlarınızı ve gas tahminlerinizi bu ek baytlara göre boyutlandırın; QoreChain'in gas muhasebesi bunları zaten bekler. İlkeler ve deterministik imzalama gereksinimi için bkz. [Post-Kuantum İmzalama](/developer-guide/post-quantum-signing).
