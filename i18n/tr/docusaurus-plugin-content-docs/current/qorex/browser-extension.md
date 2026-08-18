---
slug: /qorex/browser-extension
title: QoreX Tarayıcı Uzantısı
sidebar_label: Tarayıcı Uzantısı
sidebar_position: 2
---

# QoreX Tarayıcı Uzantısı

QoreX **tarayıcı uzantısı**, masaüstü QoreChain cüzdanıdır. Kendi başına çalışan bir **bağımsız cüzdandır** — bir cüzdan oluşturun veya içe aktarın, QOR tutun ve gönderin, dApp'lere bağlanın — ve herhangi bir web sitesinin QoreX'i keşfetmesini ve her isteği açık, çözümlenmiş bir onaya dönüştürmesini sağlayan parçadır.

Üç mağazada **yayında ve herkese açıktır**.

## Kurulum {#install}

| Tarayıcı | Kurulum |
|---|---|
| **Chrome ve Chromium tarayıcıları** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 veya sonrası)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

Mevcut herkese açık sürüm **0.1.3**'tür. **0.1.5** sürümü şu anda yayına alınıyor; bu sürüm [Kontrol Paneli bağlantı köprüsünü](#dashboard-bridge) ekler. İzin yüzeyi bu sürümler arasında değişmemiştir.

:::note
Safari'de onaylar bir açılır pencere yerine bir tarayıcı sekmesinde açılır — uzantı, aynı kod tabanından Apple'ın Safari web uzantısı sarmalayıcısı ile paketlenmiştir.
:::

## Cüzdan oluşturun veya geri yükleyin {#wallet}

Açılır pencereyi açın ve şunu seçin:

- **Cüzdan oluştur** — cihazınızda yeni bir 24 kelimelik kurtarma ifadesi (256 bit entropi) üretir, QoreChain kimliğinizi türetir ve bunu bir parola (ve isteğe bağlı olarak bir geçiş anahtarı — bkz. [Güvenlik](#security)) altında kasada mühürler.
- **Cüzdan içe aktar** — mevcut bir 24 kelimelik ifadeden geri yükleyin.

Uzantı kendi anahtarlarını tutar; mobil uygulamayı gerektirmez. Anımsatıcınızı (mnemonic) açılır pencereden dışa da aktarabilirsiniz. Anahtarlar cihazdan asla çıkmaz.

## Desteklenen cüzdan standartları {#standards}

QoreX, tümü sayfaya `window.qorex` (`{ evm, native, svm }`) olarak enjekte edilen ve [`@qorechain/connect`](/sdk/overview) algılama sözleşmeleri aracılığıyla keşfedilen üç arayüz sunar.

| Standart | Nedir | Bir geliştirici olarak sizin için ne anlama gelir |
|---|---|---|
| **EIP-1193** | Ethereum sağlayıcı JavaScript API'si (`request(...)`, olaylar). | Mevcut ethers.js / viem / web3.js kodunuz QoreX'in EVM şeridiyle değişmeden konuşur; sayısal hata kodları (ör. `4902`) olduğu gibi iletilir. |
| **EIP-6963** | Çoklu cüzdan sağlayıcı keşfi (duyur / iste olayları). | QoreX, diğer her cüzdanın yanında kendini duyurur — **asla `window.ethereum`'un üzerine yazmaz** — böylece kullanıcı her sitede QoreX'i çakışma olmadan seçer. |
| **Keplr-tarzı `signDirect`** | `window.qorex.native` üzerinde bir Cosmos `OfflineDirectSigner` biçimli sağlayıcı. | Cosmos tarzı dApp'ler, QoreChain **Native-şeridi** işlemlerini tıpkı Keplr ile yapacakları gibi imzalar; kuantum sonrası katman önceden uygulanır (bkz. [Kuantum sonrası imzalama](#pqc)). |

:::note SVM (Solana uyumlu)
`window.qorex.svm` üzerinde `connect` / `signAndSendTransaction` / `signMessage` ile bir SVM sağlayıcısı sunulur. QoreX henüz Solana **Wallet Standard** keşif protokolü üzerinden kayıt olmaz, bu nedenle Wallet-Standard otomatik keşfine dayanan Solana dApp'leri QoreX'i otomatik olarak algılamaz — şimdilik doğrudan `window.qorex.svm` üzerinden erişin.
:::

## Güvenlik ve izinler {#security}

QoreX yalnızca güvenilmek için değil, doğrulanabilir olmak için tasarlanmıştır:

- **Kasa** — anahtarlarınız **AES-256-GCM** ile mühürlenir. Parola yolu anahtarını **Argon2id** (RFC 9106, belleğe duyarlı: 64 MiB, t=3, p=1) ile türetir, böylece dışarı sızdırılan bir kasa bloğu GPU/ASIC kırmaya direnir. (Eski PBKDF2 blokları açılabilir kalır ve bir sonraki kilit açımında Argon2id'ye yeniden mühürlenir.)
- **Geçiş anahtarı ile kilit açma (isteğe bağlı)** — kimlik doğrulayıcınızın **WebAuthn PRF** uzantısını desteklediği yerlerde, QoreX kasanın kilidini yazılan bir parola yerine geçiş anahtarının 32 baytlık PRF çıktısından açabilir.
- **Manifest V3 + katı CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`. Kurulumdan sonra **uzaktan kod yükleme yoktur** ve `wasm-unsafe-eval` yoktur.
- **Hesap yok, telemetri yok** — analiz yok, izleme yok, uzaktan günlükleme yok, kayıt yok ve e-posta yok. Firefox listelemesi veri toplamayı `none` olarak beyan eder.

### QoreX hangi izinleri ister ve neden {#permissions}

Bu bölüm var çünkü Firefox listelemesi **"Tüm web sitelerindeki verilerinize erişme"** iznini yüzeye çıkarır; bu, hiç ana bilgisayar izni beyan etmeyen bir cüzdanla çelişkili görünebilir. İşte manifestten alınan tam, düzenlenmemiş gerçek.

Uzantının `manifest.json` dosyası şunları beyan eder:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — tek API izni. Şifrelenmiş kasayı ve köken başına bağlantı onaylarınızı, uzantı depolamasında **yerel olarak** saklar.
- **`host_permissions: []`** — QoreX **hiçbir** ana bilgisayar izni beyan etmez. Adınıza rastgele sitelere kökenler arası ağ istekleri yapma yeteneğini istemez.
- **`content_scripts` `<all_urls>` ile eşleşir** — Firefox'un *"Tüm web sitelerindeki verilerinize erişme."* demesinin dürüst nedeni budur. QoreX, **her sayfaya** küçük bir sağlayıcı betiği (`content.js` → `inpage.js`) enjekte eder. Tüm sitelerde çalışan bir içerik betiği teknik olarak sayfayı okuyabilir *(can)* ve tarayıcılar bu yeteneği tam olarak bu ifadeyle tanımlar — ister `host_permissions`'tan ister bir içerik betiği eşleşmesinden gelsin.

**İçerik betiği neden her yerde çalışır.** Böylece **herhangi** bir dApp, önce site başına erişim vermenize gerek kalmadan cüzdanı EIP-6963 aracılığıyla keşfedebilir. MetaMask, Keplr, Phantom ve enjekte edilen diğer her cüzdan böyle çalışır: enjekte edilen sağlayıcı, ziyaret ettiğiniz herhangi bir sitede, sayfanın betikleri çalışmadan önce (`document_start`) mevcut olmalıdır.

**Bu betiğin ne yaptığı — ve ne yapmadığı.** Yalnızca cüzdan mesajlarını köprüler (sağlayıcıyı duyurur, bağlan/imzala isteklerini hizmet çalışanına iletir, sonucu döndürür). Bu cüzdan istekleri dışında sayfa içeriğini okumaz, bir sunucuya bir şey göndermez veya uzaktan kod yüklemez — ve ana bilgisayar izinleri olmadığı için rastgele kökenler arası veri getiremez. Bunların tümü doğrulanabilir: uzantı CSP ile kilitlidir, hiçbir analiz içermez ve Firefox paketi yeniden üretilebilir bir kaynak zip'i içerir.

## Bir dApp'i QoreX'e bağlayın {#connect}

Bir dApp, QoreX'in EVM şeridini **EIP-6963** aracılığıyla keşfeder. Duyur-ve-iste, ardından döndürülen EIP-1193 sağlayıcısını kullanın:

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

QoreChain **Native** şeridi için, `window.qorex.native` (`enable`, `getKey`, `signDirect`) üzerindeki Keplr-tarzı sağlayıcıyı kullanın. Üst düzey [`@qorechain/connect`](/sdk/overview) paketi bu algılamayı sizin için sarmalar.

Onaylar **köken başınadır**: bir siteye ilk bağlantı, kökeni gösteren bir onay açılır penceresi açar, onaylamak yalnızca genel adresinizi açığa çıkarır ve bir sitenin onayı başka bir siteye hiçbir şey vermez.

### Kontrol paneli köprüsü (v0.1.5) {#dashboard-bridge}

0.1.5 sürümü, yalnızca **`dashboard.qorechain.io`** ile sınırlı bir köprü ekler: `window.qorex.native.connectProof(sessionId)`, *QoreX ile Bağlan* eşleştirme kanıtını imzalar (arka uç imzayı yeniden doğrular) ve `executeTransfer({ to, amountUqor, memo })`, Kontrol Paneli tarafından önerilen bir QOR transferini onaylar ve yayınlar, `txHash` döndürür. Bu yöntemler başka herhangi bir kökende reddedilir.

## Kuantum sonrası imzalama {#pqc}

QoreX'in kendisinin başlattığı her QOR transferi bir **hibrit kuantum sonrası imza** ile imzalanır — klasik secp256k1 imzasının yanında **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) — `@qorechain/sdk` içindeki tam hibrit hattı kullanılarak. **Bir açma/kapama düğmesi yoktur**: QoreChain bunu gerektirir ve QoreX bir Native-şeridi QOR transferini asla bu olmadan göndermez.

- **dApp tarafından başlatılan Native imzalama** — qorechain-connect akışı üzerine kurulu dApp'ler, `signDirect` çağrılmadan önce PQC uzantısını (`/qorechain.pqc.v1.PQCHybridSignature`) işlem gövdesine önceden katmanlar; QoreX klasik yarısını katkı olarak sağlar ve **kör imzalamayı reddeder**, yükü çözümler ve PQC katmanının mevcut olup olmadığını işaretler.
- **Klasik istekler her zaman etiketlenir** — bir istek PQC katmanı taşımıyorsa veya harici bir zinciri (ETH/BNB/vb., PQC taşıyamayan) hedefliyorsa, QoreX sessizce düşürme yapmak yerine açık bir uyarı gösterir.

**Bunun işlem boyutu için anlamı.** ML-DSA-87 büyük bir imzadır: imza **4,627 bytes** ve genel anahtar **2,592 bytes**'tır (FIPS-204 tarafından sabitlenmiştir). Bir hibrit QoreChain işlemi bu nedenle tamamen klasik olandan birkaç kilobayt daha büyüktür. İşlemleri kendiniz oluşturup yayınlıyorsanız, arabelleklerinizi ve ücret tahminlerinizi fazladan baytlar için boyutlandırın; QoreChain'in gaz muhasebesi bunları zaten bekler. Temel öğeler ve deterministik imzalama gereksinimi için [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing) bölümüne bakın.
