---
slug: /qorex/browser-extension
title: QoreX Tarayıcı Uzantısı
sidebar_label: Tarayıcı Uzantısı
sidebar_position: 2
---

# QoreX Tarayıcı Uzantısı

QoreX **tarayıcı uzantısı**, masaüstü QoreChain cüzdanıdır. **Bağımsız bir cüzdandır** — cüzdan oluşturabilir veya içe aktarabilir, QOR tutup gönderebilir ve dApp'lere bağlanabilirsiniz — ve herhangi bir web sitesinin QoreX'i keşfetmesini, her isteğin açık ve çözümlenmiş bir onaya dönüşmesini sağlayan parçadır.

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
| **Firefox** | **0.1.5** |
| **Chrome / Chromium** | **0.1.3** (0.1.5 gönderildi, incelemede) |
| **Safari (macOS)** | kendi `1.x` numaralandırmasını kullanan **QoreX Wallet** macOS uygulamasının içinde dağıtılır — Mac App Store şu anda **1.0** sürümünü sunuyor; 0.1.5 uzantısını taşıyan yapı incelemede |

**0.1.5** sürümü [Solana Wallet Standard keşfini](#standards), [geçiş anahtarıyla kilit açmayı](#security), tamamen uygulanmış bir [SVM dApp hattını](#standards) ve [Dashboard bağlantı köprüsünü](#dashboard-bridge) ekliyor. (0.1.4 sürümü hiç yayınlanmadı — içerdiği değişiklikler kullanıcılara 0.1.5 ile ulaşıyor.)

**İzin yüzeyi 0.1.3 ve 0.1.5'te birebir aynıdır** — bkz. [QoreX hangi izinleri istiyor](#permissions).

:::note
Safari'de onaylar açılır pencere yerine bir tarayıcı sekmesinde açılır — uzantı, aynı kod tabanından Apple'ın Safari web uzantısı sarmalayıcısıyla paketlenir.
:::

## Cüzdan oluşturma veya geri yükleme {#wallet}

Açılır pencereyi açın ve seçin:

- **Cüzdan oluştur** — cihazınızda yeni bir 24 kelimelik kurtarma ifadesi üretir (256 bit entropi), QoreChain kimliğinizi türetir ve bunu bir parolayla (ve isteğe bağlı olarak bir geçiş anahtarıyla — bkz. [Güvenlik](#security)) kasada mühürler.
- **Cüzdan içe aktar** — mevcut bir 24 kelimelik ifadeden geri yükleyin.

Uzantı kendi anahtarlarını tutar; mobil uygulamaya ihtiyaç duymaz. Anımsatıcı ifadenizi de açılır pencereden dışa aktarabilirsiniz. Anahtarlar cihazdan asla ayrılmaz.

### Harici ağlarda gönderim {#send-external}

Native hattındaki QOR'un yanı sıra açılır pencere, tamamı aynı kurtarma ifadesinden türetilen harici ağlarda da varlık gönderebilir:

| Tür | Ağlar | Paketlenmiş tokenlar |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum | ERC-20 kayıtları (uygun olduğu yerlerde USDT, USDC, DAI) |
| SVM | Solana | SPL kayıtları (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | IBC kaydı (Osmosis üzerinde USDC); isteğe bağlı memo alanı |

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
Aynı arayüz `window.qorex.svm` üzerinde de mevcuttur (`connect` / `signAndSendTransaction` / `signMessage`). Wallet-Standard otomatik keşfi ve tamamen uygulanmış SVM hattı **0.1.5** ile geliyor — yani bugün **Firefox**'ta, Chrome'da ise 0.1.5 incelemeyi geçtiğinde kullanılabilir olacak (bkz. [hangi sürüm nerede yayında](#versions)).

Solana onayları çözümlenmiş yükü gösterir (System transferleri için alıcı ve lamports değeri ile program listesi), cüzdanınızı imzalayan olarak listelemeyen işlemleri reddeder ve imzayı **klasik** olarak işaretler — bkz. [Post-kuantum imzalama](#pqc).
:::

## Güvenlik ve izinler {#security}

QoreX yalnızca güvenilmek için değil, doğrulanabilir olmak için tasarlandı:

- **Kasa** — anahtarlarınız **AES-256-GCM** ile mühürlenir. Parola yolu anahtarını **Argon2id** (RFC 9106, bellek yoğun: 64 MiB, t=3, p=1) ile türetir, böylece dışarı sızdırılmış bir kasa bloğu GPU/ASIC kırma denemelerine direnir. (Eski PBKDF2 blokları açılabilir olmayı sürdürür ve bir sonraki kilit açmada Argon2id ile yeniden mühürlenir.)
- **Geçiş anahtarıyla kilit açma (isteğe bağlı, 0.1.5'ten itibaren)** — kimlik doğrulayıcınızın **WebAuthn PRF** uzantısını desteklediği durumlarda QoreX, kasayı yazılan bir parola yerine geçiş anahtarının 32 baytlık PRF çıktısından açabilir. Parolanız her zaman yedek seçenek olarak kalır.

  :::note Geçiş anahtarıyla kilit açma nerede görünür
  QoreX, WebAuthn'ı özellik tespitiyle arar ve **Geçiş anahtarıyla kilit açmayı etkinleştir** seçeneğini yalnızca tarayıcının bunu uzantı sayfalarına sunduğu yerlerde gösterir — yani **Chrome ve Edge**'de. **Firefox**'ta bu seçenek gizlidir, çünkü Firefox WebAuthn'ı uzantı sayfalarına sunmaz. [Sürüm farkıyla](#versions) birlikte düşünüldüğünde bu, bugün bir Firefox kullanıcısının Wallet Standard'a sahip olduğu ama geçiş anahtarıyla kilit açmaya sahip olmadığı, bir Chrome kullanıcısının ise 0.1.5 incelemeyi geçene kadar ikisine de sahip olmadığı anlamına gelir. Bu beklenen bir durumdur, hata değildir.
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

Bir dApp, QoreX'in EVM hattını **EIP-6963** üzerinden keşfeder. Duyur ve iste, ardından dönen EIP-1193 sağlayıcısını kullan:

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

### Dashboard köprüsü (v0.1.5) {#dashboard-bridge}

0.1.5 sürümü, yalnızca **`dashboard.qorechain.io`** ile sınırlı bir köprü ekler: `window.qorex.native.connectProof(sessionId)`, *Connect with QoreX* eşleştirme kanıtını imzalar (arka uç imzayı yeniden doğrular) ve `executeTransfer({ to, amountUqor, memo })`, Dashboard tarafından önerilen bir QOR transferini onaylayıp yayına verir ve `txHash` değerini döndürür. Bu yöntemler diğer tüm kökenlerde reddedilir.

## Post-kuantum imzalama {#pqc}

QoreX'in kendi başlattığı her QOR transferi, **hibrit post-kuantum imzayla** — klasik secp256k1 imzasının yanında **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) — `@qorechain/sdk` içindeki tam hibrit hat kullanılarak imzalanır. **Bir açma/kapama seçeneği yoktur**: QoreChain bunu zorunlu kılar ve QoreX hiçbir zaman bunsuz bir Native hattı QOR transferi göndermez.

- **dApp tarafından başlatılan Native imzalama** — qorechain-connect akışı üzerine kurulu dApp'ler, `signDirect` çağrısından önce PQC uzantısını (`/qorechain.pqc.v1.PQCHybridSignature`) işlem gövdesine önceden katmanlar; QoreX klasik yarıyı ekler ve **kör imzalamayı reddeder**, yükü çözümleyip PQC katmanının mevcut olup olmadığını işaretler.
- **Klasik istekler her zaman etiketlenir** — bir istek PQC katmanı taşımıyorsa veya harici bir zinciri (PQC taşıyamayan ETH/BNB vb.) hedefliyorsa, QoreX sessizce alt seviyeye düşmek yerine açık bir uyarı gösterir.

**Bunun işlem boyutu açısından anlamı.** ML-DSA-87 büyük bir imzadır: imza **4.627 bayt**, açık anahtar ise **2.592 bayttır** (FIPS-204 tarafından sabitlenmiştir). Dolayısıyla hibrit bir QoreChain işlemi, tamamen klasik bir işleme göre birkaç kilobayt daha büyüktür. İşlemleri kendiniz oluşturup yayına veriyorsanız, tamponlarınızı ve gas tahminlerinizi bu ek baytlara göre boyutlandırın; QoreChain'in gas muhasebesi bunları zaten bekler. İlkeler ve deterministik imzalama gereksinimi için bkz. [Post-Kuantum İmzalama](/developer-guide/post-quantum-signing).
