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
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 veya üzeri)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Hangi sürüm nerede yayında {#versions}

Mağaza incelemeleri farklı zamanlarda sonuçlandığı için yayınlanan sürüm şu anda tarayıcıya göre değişiyor:

| Tarayıcı | Yayınlanan sürüm |
|---|---|
| **Firefox** | **0.2.6** |
| **Safari (macOS)** | kendi `1.x` numaralandırmasını kullanan **QoreX Wallet** macOS uygulamasının içinde dağıtılır — Mac App Store şu anda **1.6** sürümünü sunuyor (0.2.6 uzantısını taşır) |
| **Chrome / Chromium** | Ağustos ayı sonu itibarıyla uzun bir mağaza incelemesinde takılı kalmıştı — burada bir sayıya güvenmek yerine güncel sürümü doğrudan [Chrome Web Store listelemesinden](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) kontrol edin |

Daha yeni özellikler tarayıcınızda henüz yayında olmayabilir — burada açıklanan bir şeyin kullanılabilir olduğunu varsaymadan önce yukarıdaki tabloyu kontrol edin. Dashboard, uzantınızın güncellenmesi gerektiğini söylüyorsa, bu söz konusu işlem için belirli bir minimum sürüm gerektiği anlamına gelir (örneğin staking için 0.2.2) — genel olarak derlemenizin eski olduğu anlamına gelmez.

**0.1.5** sürümü [Solana Wallet Standard keşfini](#standards), [geçiş anahtarıyla kilit açmayı](#security), tamamen uygulanmış bir [SVM dApp hattını](#standards) ve [Dashboard bağlantı köprüsünü](#dashboard-bridge) ekledi. (0.1.4 sürümü hiç yayınlanmadı — içerdiği değişiklikler kullanıcılara 0.1.5 ile ulaşıyor.)

**0.1.6–0.1.9** sürümleri sırasıyla şunları ekledi: dürüst banka-reddi mesajlarıyla vesting'i gözeten gönderimler; açılır pencerenin ana ekranında doğrudan gösterilen hesap adresi ve anlık bakiye; ve **0.1.9**'da, Send ekranından doğrudan [bir @handle'a ödeme yapma](#handle-send), adres QR kodlu bir [Receive ekranı](#receive), bir [dil seçici](#language) (mobil uygulamayla aynı on dil) ve [vesting bakiyesinden](#vesting) kafa karıştırıcı "sonraki kilit açılma tarihi"nin kaldırılması.

**0.2.2** sürümü [uzantının kendisinden staking'i](#stake) ekledi — komisyonlu validatörleri, staking'e ayrılmış toplamınızı, bekleyen ödülleri ve delegasyon/unstake/talep işlemlerini içeren kendi Stake ekranı; mobil uygulamayla aynı şekilde [tek bir kurtarma ifadesinden birden fazla hesap](#wallet); **Dashboard**'un staking düğmesinin uzantıya gerçekten ulaşmasını sağlayan düzeltme (yalnızca uzantıda oluşturulmuş bir cüzdan daha önce Dashboard üzerinden hiç staking yapamıyordu — bkz. [Dashboard köprüsü](#dashboard-bridge)); tarayıcıdan çalışan @handle talep etme; ve açılır pencerenin altında gösterilen derleme numarası.

**İzin yüzeyi 0.1.3'ten bu yana değişmedi** — bkz. [QoreX hangi izinleri istiyor](#permissions).

:::note
Safari'de onaylar açılır pencere yerine bir tarayıcı sekmesinde açılır — uzantı, aynı kod tabanından Apple'ın Safari web uzantısı sarmalayıcısıyla paketlenir.
:::

## Cüzdan oluşturma veya geri yükleme {#wallet}

Açılır pencereyi açın ve seçin:

- **Cüzdan oluştur** — cihazınızda yeni bir 24 kelimelik kurtarma ifadesi üretir (256 bit entropi), QoreChain kimliğinizi türetir ve bunu bir parolayla (ve isteğe bağlı olarak bir geçiş anahtarıyla — bkz. [Güvenlik](#security)) kasada mühürler.
- **Cüzdan içe aktar** — mevcut bir 24 kelimelik ifadeden geri yükleyin.

Uzantı kendi anahtarlarını tutar; mobil uygulamaya ihtiyaç duymaz. Anımsatıcı ifadenizi de açılır pencereden dışa aktarabilirsiniz. Anahtarlar cihazdan asla ayrılmaz.

:::note Aynı ifadeden birden fazla hesap (0.2.2'den itibaren)
Uzantı artık mobil uygulamayla aynı şekilde, aynı kurtarma ifadesinden birden fazla hesap oluşturabilir ve bunlar arasında geçiş yapabilir — zaten yazdığınız ifade bunların hepsini geri yükler. Geçiş yapmak her şeyi beraberinde taşır: gönderim, staking, alım ve @handle'ınız hangi hesap etkinse onu izler. Portfolio, Q-Day Scanner, sosyal kurtarma, Legacy Protocol, ödeme istekleri ve cihaz bağlama yalnızca mobilde kalmaya devam ediyor — tam karşılaştırma için bkz. [QoreX Wallet](/qorex/overview#platform-availability).
:::

## Hesabınız, bakiyeniz ve @handle {#account}

Açılır pencerenin boşta ekranı `qor1…` adresinizi (kopyalamak için dokunun) ve anlık QOR bakiyenizi gösterir, böylece ikisini de kontrol etmek için bir blok gezgini açmanıza gerek kalmaz.

### Vesting (kilitli) bakiyeler {#vesting}

Hesabınızda vesting QOR varsa (örneğin serbest bırakılmamış bir TGE tahsisi), bakiye **şu anda kullanılabilir** ve **hâlâ kilitli** olarak ikiye ayrılır; kullanılabilir tutarı aşan bir gönderim, ücret alındıktan sonra zincir üzerinde başarısız olmak yerine ağa ulaşmadan önce reddedilir. QoreX burada bilerek bir "sonraki kilit açılma tarihi" **göstermez**: bir vesting takvimi yönetişim tarafından değiştirilebilir, bu yüzden bakiye kartındaki bir tarih QoreX'in garanti edemeyeceği bir vaat gibi okunurdu. Doğru kalan şey, kullanılabilir-kilitli ayrımıdır.

### Bir @handle talep edin

Açılır pencereden, mobil uygulamada olduğu gibi, bu hesabın adresi için benzersiz bir **@handle** (örneğin `@liviu`) talep edebilirsiniz. Talep, hesabın kendi anahtarıyla imzalanır ve o adrese bağlanır, böylece biri size gönderim yaptığında mobil uygulama ve Dashboard bunu çözümleyebilir. Handle'ların adreslere (bir bütün olarak cüzdana değil) nasıl bağlandığını görmek için bkz. [@handle](/qorex/account-and-dashboard#handle).

## Bir @handle'a gönderim {#handle-send}

0.1.9'dan itibaren, bir adres aramak yerine kayıtlı bir @handle'a doğrudan ödeme yapabilirsiniz:

1. Açılır pencereyi açın ve **Gönder**'e dokunun.
2. Alıcı alanına, bir `qor1…` adresi yerine `@` işaretini ve ardından handle'ı (örneğin `@liviu`) yazın.
3. QoreX handle'ı çözümler ve herhangi bir şey imzalamadan önce size **çözümlenmiş adresi** gösterir — bunu her zaman beklediğinizle karşılaştırın.
4. Tutarı girin ve onaylayın.

Çözümleme, QoreX onu kullanmadan önce iki şekilde doğrulanır: uzantıya gömülü bir güven anahtarına karşı kontrol edilen bir kayıt defteri onayı ve handle sahibinin talep üzerindeki kendi imzası. Bu kontrollerden herhangi birini geçemeyen bir yanıt doğrudan reddedilir — QoreX doğrulanmamış bir adresi göstermeye geri düşmez. Belirli bir handle'a ilk kez ödeme yaptığınızda QoreX çözümlediği adresi hatırlar (sabitler); o handle daha sonra **farklı** bir adrese çözümlenirse QoreX durur ve devam edip etmeyeceğinize karar verebilmeniz için hem eski hem yeni adresi tam olarak gösterir. Bu hafıza **tarayıcı başına** yaşar — aynı handle'a farklı bir tarayıcıdan veya bilgisayardan ilk kez ödeme yapmak orada da yeni olarak gösterilir. Bu beklenen bir durumdur, hata değildir.

## Al {#receive}

Açılır pencerede **Al**'a dokunarak `qor1…` adresinizi (QoreChain simgesi gömülü) bir QR kod olarak bir kopyalama düğmesiyle birlikte gösterin — bir telefondan tarayın veya adresi doğrudan yapıştırın.

## Uzantıdan staking {#stake}

**0.2.2**'den itibaren, açılır pencerenin kendi **Stake** ekranı var — yalnızca uzantıda oluşturulmuş bir cüzdanın artık staking ödülü kazanmak için mobil uygulamaya ihtiyacı yok.

1. Açılır pencereyi açın ve **Stake**'e gidin.
2. Ekran, komisyonlarıyla birlikte aktif validatörleri, o anda staking'e ayrılmış toplamınızı ve talep edilmeyi bekleyen ödülleri listeler. Ağın **hapse attığı (jailed)** validatörler listeden çıkarılır — bunlardan birine delege etmek asla istediğiniz şey değildir.
3. Delege etmek için bir validatör ve bir tutar seçin, ardından onaylayın. QoreX, tıpkı bir Gönder işlemi gibi, zorunlu hibrit post-kuantum imzayla imzalar.
4. **Unstake** ve **talep et** aynı ekrandan çalışır. Unstake işlemi 21 günlük unbonding süresini başlatır — bunun ne anlama geldiği için bkz. [Staking ve Delegasyon](/user-guide/staking-and-delegation).
5. **0.2.6**'dan itibaren, **stake'inizi başka bir validatöre taşıyabilirsiniz** de (redelegate) — unbonding beklemesi yok, ceza yok ve ödüller tüm süreç boyunca akmaya devam ediyor. Nasıl çalıştığı için bkz. [Stake'i validatörler arasında taşıma](/qorex/portfolio-and-staking#move-stake) (mekanik, uygulama ile uzantı arasında aynıdır).

Staking, delegasyon ve ödüller yalnızca **Native** hattında gerçekleşir, hiçbir zaman bir EVM precompile üzerinden değil.

### Bir Dashboard staking isteğini onaylama {#stake-dashboard}

QoreChain [Dashboard](/dashboard/staking-and-validators)'u staking istekleri oluşturur ama bunları imzalayamaz — anahtarınız hiçbir zaman uzantının kasasından çıkmaz. Dashboard'da **QoreX'te Devam Et**'e tıkladığınızda, istek uzantıda açılır ve siz onu (validatör ve tutar) inceleyip tıpkı bir Gönder işlemi gibi onaylarsınız. Bu bağlantı 0.2.1'de bozulmuştu (uzantı, yayınlanan en yeni derleme olmasına rağmen kendisini "çok eski" olarak bildiriyordu — gerçek sorun sürüm eskiliği değil, eksik bir dahili adımdı); **0.2.2** itibarıyla düzeltildi. Daha eski bir derlemedeyseniz, bkz. [hangi sürüm nerede yayında](#versions).

:::note Bir işlem "başarılı" yerine "düşürülmüş (downgraded)" gösteriliyorsa
Dashboard bazen bir işlemi temiz bir başarı yerine **düşürülmüş** olarak gösterir. Bu, paranızın hareket ettiği ama o işlem için post-kuantum imza katmanının zincirde bulunamadığı anlamına gelir — bu sizin yaptığınız bir şey değildir ve kendi tarafınızdan düzeltebileceğiniz bir şey de değildir. Bu bizim tarafımızdaki bir hatadır; lütfen incelememiz için destek ekibine bildirin. Mesaj, okuyup bildirmeniz için zamanınız olsun diye bilerek ekranda kalır, kaybolmaz.
:::

### Harici ağlarda gönderim {#send-external}

Native hattındaki QOR'un yanı sıra açılır pencere, tamamı aynı kurtarma ifadesinden türetilen harici ağlarda da varlık gönderebilir:

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
| **EIP-1193** | Ethereum sağlayıcı JavaScript API'si (`request(...)`, olaylar). | Mevcut ethers.js / viem / web3.js kodunuz QoreX'in EVM hattıyla değişiklik gerektirmeden konuşur; sayısal hata kodları (örn. `4902`) birebir iletilir. |
| **EIP-6963** | Çoklu cüzdan sağlayıcı keşfi (duyur / iste olayları). | QoreX kendisini diğer tüm cüzdanların yanında duyurur — **`window.ethereum` nesnesinin üzerine asla yazmaz** — böylece kullanıcı QoreX'i site bazında çakışma olmadan seçer. |
| **Keplr desenli `signDirect`** | `window.qorex.native` üzerinde Cosmos `OfflineDirectSigner` biçiminde bir sağlayıcı. | Cosmos tarzı dApp'ler QoreChain **Native hattı** işlemlerini tıpkı Keplr ile yapacakları gibi imzalar; post-kuantum katman önceden uygulanmıştır (bkz. [Post-kuantum imzalama](#pqc)). |
| **Solana Wallet Standard** *(0.1.5'ten itibaren)* | Solana dApp'leri için yerel cüzdan keşfi (`wallet-standard:register-wallet` / `app-ready`). | Solana dApp'leri **QoreX'i otomatik algılar** — özel entegrasyon gerekmez. Özellikler: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; zincir `solana:mainnet`; hem `legacy` hem `v0` işlemler. |

:::note SVM hattına doğrudan erişim
Aynı arayüz `window.qorex.svm` üzerinde de mevcuttur (`connect` / `signAndSendTransaction` / `signMessage`). Wallet-Standard otomatik keşfi ve tamamen uygulanmış SVM hattı **0.1.5** ile piyasaya sürüldü ve hem Chrome hem de Firefox'ta yayındadır (bkz. [hangi sürüm nerede yayında](#versions)).

Solana onayları çözümlenmiş yükü gösterir (System transferleri için alıcı ve lamports değeri ile program listesi), cüzdanınızı imzalayan olarak listelemeyen işlemleri reddeder ve imzayı **klasik** olarak işaretler — bkz. [Post-kuantum imzalama](#pqc).
:::

## Dil {#language}

Uzantı, mobil uygulama, dashboard ve site ile aynı on dili konuşur: İngilizce, Rumence, Almanca, İspanyolca, Fransızca, İtalyanca, Türkçe, Arapça, Japonca ve Korece. Varsayılan olarak **tarayıcınızın** dilini izler (bunun dışındaki her şey için İngilizce'ye geri döner) — bunun, **telefonun** dilini izleyen mobil uygulamadan farklı bir kaynak olduğunu unutmayın, dolayısıyla telefonunuz ve tarayıcınız farklı ayarlandıysa ikisi farklı diller gösterebilir. Açılır pencerenin boşta ekranındaki bir seçici, algılanan dili istediğiniz zaman geçersiz kılmanıza olanak tanır; Arapça'ya geçmek yalnızca metni değil, açılır pencereyi de hemen sağdan sola çevirir.

## Güvenlik ve izinler {#security}

QoreX yalnızca güvenilmek için değil, doğrulanabilir olmak için tasarlandı:

- **Kasa** — anahtarlarınız **AES-256-GCM** ile mühürlenir. Parola yolu anahtarını **Argon2id** (RFC 9106, bellek yoğun: 64 MiB, t=3, p=1) ile türetir, böylece dışarı sızdırılmış bir kasa bloğu GPU/ASIC kırma denemelerine direnir. (Eski PBKDF2 blokları açılabilir olmayı sürdürür ve bir sonraki kilit açmada Argon2id ile yeniden mühürlenir.)
- **Geçiş anahtarıyla kilit açma (isteğe bağlı, 0.1.5'ten itibaren)** — kimlik doğrulayıcınızın **WebAuthn PRF** uzantısını desteklediği durumlarda QoreX, kasayı yazılan bir parola yerine geçiş anahtarının 32 baytlık PRF çıktısından açabilir. Parolanız her zaman yedek seçenek olarak kalır.

  :::note Geçiş anahtarıyla kilit açma nerede görünür
  QoreX, WebAuthn'ı özellik tespitiyle arar ve **Geçiş anahtarıyla kilit açmayı etkinleştir** seçeneğini yalnızca tarayıcının bunu uzantı sayfalarına sunduğu yerlerde gösterir — yani **Chrome ve Edge**'de. **Firefox**'ta bu seçenek gizlidir, çünkü Firefox WebAuthn'ı uzantı sayfalarına sunmaz. Bu beklenen bir durumdur, hata değildir.
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
]
```

- **`permissions: ["storage"]`** — tek API izni. Şifrelenmiş kasayı ve köken başına bağlantı onaylarınızı **yerel olarak**, uzantı depolamasında saklar.
- **`host_permissions: []`** — QoreX **hiçbir** host izni beyan etmez. Sizin adınıza rastgele sitelere kökenler arası ağ isteği yapma yetkisi istemez.
- **`content_scripts` eşleşmesi `<all_urls>`** — Firefox'un *"Tüm web sitelerindeki verilerinize erişme"* demesinin dürüst nedeni budur. QoreX, **her sayfaya** küçük bir sağlayıcı betiği (`content.js` → `inpage.js`) enjekte eder. Tüm sitelerde çalışan bir içerik betiği teknik olarak sayfayı okuyabilir ve tarayıcılar bu yetkiyi tam olarak bu ifadeyle tanımlar — ister `host_permissions` üzerinden gelsin, ister bir içerik betiği eşleşmesinden.

**İçerik betiği neden her yerde çalışıyor.** Böylece **herhangi bir** dApp, siz önce site bazında erişim vermek zorunda kalmadan cüzdanı EIP-6963 üzerinden keşfedebilir. MetaMask, Keplr, Phantom ve diğer tüm enjekte edilen cüzdanlar bu şekilde çalışır: enjekte edilen sağlayıcı, ziyaret ettiğiniz her sitede, sayfanın betikleri çalışmadan önce (`document_start`) hazır olmalıdır.

**Bu betiğin yaptığı — ve yapmadığı.** Yalnızca cüzdan mesajlarını köprüler (sağlayıcıyı duyurur, bağlanma/imzalama isteklerini service worker'a iletir, sonucu döndürür). Bu istekler dışında sayfa içeriğini **okumaz**, bir sunucuya hiçbir şey göndermez, uzaktan kod yüklemez — ve host izni bulunmadığı için rastgele kökenler arası veri de çekemez. Bunların tamamı doğrulanabilir: uzantı CSP ile kilitlidir, hiçbir analitik içermez ve Firefox paketi yeniden üretilebilir bir kaynak zip dosyası içerir.

## Bir dApp'i QoreX'e bağlama {#connect}

Bir dApp, QoreX'in EVM hattını **EIP-6963** üzerinden keşfeder. Duyur ve iste, ardından dönen EIP-1193 sağlayıcısını kullanın:

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

QoreChain **Native** hattı için `window.qorex.native` adresindeki Keplr desenli sağlayıcıyı kullanın (`enable`, `getKey`, `signDirect`). Üst düzey [`@qorechain/connect`](/sdk/overview) paketi bu tespiti sizin yerinize sarmalar.

Onaylar **köken başınadır**: bir siteye ilk bağlantı, kökeni gösteren bir onay penceresi açar, onaylamak yalnızca genel adresinizi açığa çıkarır ve bir sitenin onayı bir başkasına hiçbir yetki vermez.

### Dashboard köprüsü (v0.1.5, v0.2.2'de genişletildi) {#dashboard-bridge}

0.1.5 sürümü, yalnızca **`dashboard.qorechain.io`** ile sınırlı bir köprü ekler: `window.qorex.native.connectProof(sessionId)`, *Connect with QoreX* eşleştirme kanıtını imzalar (arka uç imzayı yeniden doğrular) ve `executeTransfer({ to, amountUqor, memo })`, Dashboard tarafından önerilen bir QOR transferini onaylayıp yayınlar ve `txHash` değerini döndürür. Bu yöntemler diğer tüm kökenlerde reddedilir.

**0.2.2** sürümü, [staking](#stake-dashboard) dahil olmak üzere Dashboard tarafından önerilen bütün bir isteği kabul eden `native:executeRequest`'i ekler; bu, QoreX'in başka her yerde kullandığı aynı paylaşılan ayrıştırıcıya karşı doğrulanır: bir ağ uyuşmazlığında, yabancı bir kökende, size ait olmayan bir adreste, bilinmeyen bir istek türünde veya bir `toAddress` taşıyan bir staking isteğinde (staking isteklerinin bir tanesi yoktur) reddedilir.

Bir `qor1…` adresi mainnet ve testnette eşit derecede geçerli olduğundan, Dashboard tarafından önerilen bir istek hangi ağı hedeflediğini belirtir ve bu, uzantının o anda bağlı olduğu ağla eşleşmiyorsa QoreX bu isteğe göre hareket etmeyi reddeder — bir isteğin adına asla ağ değiştirmez.

## Post-kuantum imzalama {#pqc}

QoreX'in kendi başlattığı her QOR transferi, `@qorechain/sdk` içindeki tam hibrit hat kullanılarak, klasik secp256k1 imzasının yanında **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) ile **hibrit bir post-kuantum imzayla** imzalanır. **Bir açma/kapama seçeneği yoktur**: QoreChain bunu zorunlu kılar ve QoreX hiçbir zaman bunsuz bir Native hattı QOR transferi göndermez.

- **dApp tarafından başlatılan Native imzalama** — qorechain-connect akışı üzerine kurulu dApp'ler, `signDirect` çağrısından önce PQC uzantısını (`/qorechain.pqc.v1.PQCHybridSignature`) işlem gövdesine önceden katmanlar; QoreX klasik yarıyı ekler ve **kör imzalamayı reddeder**, yükü çözümleyip PQC katmanının mevcut olup olmadığını işaretler.
- **Klasik istekler her zaman etiketlenir** — bir istek PQC katmanı taşımıyorsa veya harici bir zinciri (PQC taşıyamayan ETH/BNB vb.) hedefliyorsa, QoreX sessizce alt seviyeye düşmek yerine açık bir uyarı gösterir.

**Bunun işlem boyutu açısından anlamı.** ML-DSA-87 büyük bir imzadır: imza **4.627 bayt**, açık anahtar ise **2.592 bayttır** (FIPS-204 tarafından sabitlenmiştir). Dolayısıyla hibrit bir QoreChain işlemi, tamamen klasik bir işleme göre birkaç kilobayt daha büyüktür. İşlemleri kendiniz oluşturup yayınlıyorsanız, tamponlarınızı ve gas tahminlerinizi bu ek baytlara göre boyutlandırın; QoreChain'in gas muhasebesi bunları zaten bekler. İlkeler ve deterministik imzalama gereksinimi için bkz. [Post-Kuantum İmzalama](/developer-guide/post-quantum-signing).
