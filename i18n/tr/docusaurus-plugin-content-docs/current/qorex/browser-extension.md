---
slug: /qorex/browser-extension
title: QoreX Tarayıcı Eklentisi
sidebar_label: Tarayıcı Eklentisi
sidebar_position: 2
---

# QoreX Tarayıcı Eklentisi

QoreX **tarayıcı eklentisi**, masaüstü QoreChain cüzdanıdır. **Bağımsız bir cüzdandır** — cüzdan oluşturabilir veya içe aktarabilir, QOR tutup gönderebilir ve dApp'lere bağlanabilirsiniz — ve herhangi bir web sitesinin QoreX'i keşfetmesini ve her isteği açık, çözümlenmiş bir onaya dönüştürmesini sağlayan parçadır.

Üç mağazada **yayında ve herkese açıktır**.

## Kurulum {#install}

| Tarayıcı | Kurulum |
|---|---|
| **Chrome ve Chromium tarayıcıları** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 veya üzeri)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Hangi sürüm nerede yayında {#versions}

Mağaza incelemeleri farklı zamanlarda tamamlandığı için yayımlanan sürüm şu anda tarayıcıya göre değişiyor:

| Tarayıcı | Yayımlanan sürüm |
|---|---|
| **Firefox** | **0.1.5** |
| **Chrome / Chromium** | **0.1.3** (0.1.5 gönderildi, incelemede) |
| **Safari (macOS)** | kendi `1.x` sürüm numaralandırmasını kullanan **QoreX Wallet** macOS uygulamasının içinde dağıtılır |

**0.1.5** şunları ekler: [Solana Wallet Standard keşfi](#standards), [parola anahtarıyla kilit açma](#security), tamamen uygulanmış bir [SVM dApp hattı](#standards) ve [Dashboard bağlantı köprüsü](#dashboard-bridge). (Sürüm 0.1.4 hiçbir zaman yayımlanmadı — içerdiği değişiklikler kullanıcılara 0.1.5 ile ulaşıyor.)

**İzin yüzeyi 0.1.3 ve 0.1.5 sürümlerinde aynıdır** — bkz. [QoreX hangi izinleri istiyor](#permissions).

:::note
Safari'de onaylar açılır pencere yerine bir tarayıcı sekmesinde açılır — eklenti, aynı kod tabanından Apple'ın Safari web eklentisi sarmalayıcısıyla paketlenmiştir.
:::

## Cüzdan oluşturma veya geri yükleme {#wallet}

Açılır pencereyi açın ve seçin:

- **Cüzdan oluştur** — cihazınızda yeni bir 24 kelimelik kurtarma ifadesi üretir (256 bit entropi), QoreChain kimliğinizi türetir ve bunu bir parolayla (ve isteğe bağlı olarak bir parola anahtarıyla — bkz. [Güvenlik](#security)) kasada mühürler.
- **Cüzdanı içe aktar** — mevcut bir 24 kelimelik ifadeden geri yükleyin.

Eklenti kendi anahtarlarını tutar; mobil uygulamayı gerektirmez. Anımsatıcı ifadenizi de açılır pencereden dışa aktarabilirsiniz. Anahtarlar cihazdan asla çıkmaz.

### Harici ağlarda gönderim {#send-external}

Native hattındaki QOR'un yanı sıra açılır pencere, tamamı aynı kurtarma ifadesinden türetilen harici ağlarda da varlık gönderebilir:

| Tür | Ağlar | Paketlenmiş tokenlar |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum | ERC-20 kayıtları (uygun olduğu yerlerde USDT, USDC, DAI) |
| SVM | Solana | SPL kayıtları (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | IBC kaydı (Osmosis üzerinde USDC); isteğe bağlı memo alanı |

Harici bir transfer gönderilmeden önce açık bir onay kutusunu işaretlemeniz gerekir: **"Harici ağlar yalnızca klasik imzaları kabul eder — QOR'unuzun aksine, bu transfer kuantum güvenli DEĞİLDİR."** Harici zincirler post-kuantum bir imza taşıyamaz ve QoreX bunu asla gizlemez.

## Desteklenen cüzdan standartları {#standards}

QoreX üç arayüz sunar; hepsi sayfaya `window.qorex` (`{ evm, native, svm }`) olarak enjekte edilir ve [`@qorechain/connect`](/sdk/overview) algılama sözleşmeleri üzerinden keşfedilir.

| Standart | Nedir | Geliştirici olarak sizin için ne anlama gelir |
|---|---|---|
| **EIP-1193** | Ethereum sağlayıcı JavaScript API'si (`request(...)`, olaylar). | Mevcut ethers.js / viem / web3.js kodunuz QoreX'in EVM hattıyla değişiklik gerekmeden konuşur; sayısal hata kodları (örn. `4902`) birebir iletilir. |
| **EIP-6963** | Çok cüzdanlı sağlayıcı keşfi (duyuru / istek olayları). | QoreX kendini diğer tüm cüzdanların yanında duyurur — **`window.ethereum` nesnesinin üzerine asla yazmaz** — böylece kullanıcı her sitede çakışma olmadan QoreX'i seçebilir. |
| **Keplr desenli `signDirect`** | `window.qorex.native` üzerinde `OfflineDirectSigner` biçiminde bir Cosmos sağlayıcısı. | Cosmos tarzı dApp'ler QoreChain **Native hattı** işlemlerini Keplr ile yapacakları gibi imzalar; post-kuantum katman önceden uygulanır (bkz. [Post-kuantum imzalama](#pqc)). |
| **Solana Wallet Standard** *(0.1.5'ten itibaren)* | Solana dApp'leri için yerel cüzdan keşfi (`wallet-standard:register-wallet` / `app-ready`). | Solana dApp'leri **QoreX'i otomatik algılar** — özel entegrasyon gerekmez. Özellikler: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; zincir `solana:mainnet`; hem `legacy` hem `v0` işlemleri. |

:::note SVM hattına doğrudan erişim
Aynı arayüz `window.qorex.svm` üzerinde de kullanılabilir (`connect` / `signAndSendTransaction` / `signMessage`). Wallet-Standard otomatik keşfi ve tamamen uygulanmış SVM hattı **0.1.5** ile geliyor — yani bugün **Firefox** üzerinde, Chrome'da ise 0.1.5 incelemeden geçtiğinde kullanılabilir olacak (bkz. [hangi sürüm nerede yayında](#versions)).

Solana onayları çözümlenmiş yükü gösterir (System transferleri için alıcı ve lamports, ayrıca program listesi), cüzdanınızı imzalayan olarak listelemeyen işlemleri reddeder ve imzayı **klasik** olarak işaretler — bkz. [Post-kuantum imzalama](#pqc).
:::

## Güvenlik ve izinler {#security}

QoreX yalnızca güvenilmek için değil, doğrulanabilir olmak için inşa edilmiştir:

- **Kasa** — anahtarlarınız **AES-256-GCM** ile mühürlenir. Parola yolu anahtarını **Argon2id** ile türetir (RFC 9106, bellek yoğun: 64 MiB, t=3, p=1); böylece dışarı sızdırılmış bir kasa verisi GPU/ASIC kırma girişimlerine direnir. (Eski PBKDF2 verileri açılabilir olmayı sürdürür ve bir sonraki kilit açmada yeniden Argon2id ile mühürlenir.)
- **Parola anahtarıyla kilit açma (isteğe bağlı, 0.1.5'ten itibaren)** — kimlik doğrulayıcınız **WebAuthn PRF** uzantısını destekliyorsa QoreX, kasayı yazılan bir parola yerine parola anahtarının 32 baytlık PRF çıktısıyla açabilir. Parolanız her zaman yedek seçenek olarak kalır.

  :::note Parola anahtarıyla kilit açma nerede görünür
  QoreX WebAuthn desteğini otomatik algılar ve **Parola anahtarıyla kilit açmayı etkinleştir** seçeneğini yalnızca tarayıcının bunu eklenti sayfalarına sunduğu yerlerde gösterir — yani **Chrome ve Edge** üzerinde. **Firefox** üzerinde seçenek gizlidir, çünkü Firefox WebAuthn'u eklenti sayfalarına sunmaz. [Sürüm farkıyla](#versions) birleştiğinde bu, bugün bir Firefox kullanıcısının Wallet Standard'a sahip olduğu ama parola anahtarıyla kilit açmaya sahip olmadığı, bir Chrome kullanıcısının ise 0.1.5 incelemeden geçene kadar ikisine de sahip olmadığı anlamına gelir. Bu beklenen bir durumdur, hata değildir.
  :::
- **Manifest V3 + katı CSP** — `script-src 'self'; object-src 'self'; base-uri 'self'`. Kurulumdan sonra **uzaktan kod yüklemesi yoktur** ve `wasm-unsafe-eval` kullanılmaz.
- **Hesap yok, telemetri yok** — analitik yok, izleme yok, uzaktan günlükleme yok, kayıt yok ve e-posta yok. Firefox listelemesi veri toplamayı `none` olarak beyan eder.

### QoreX hangi izinleri istiyor ve neden {#permissions}

Bu bölüm, Firefox listelemesinin **"Tüm web sitelerindeki verilerinize erişme"** iznini göstermesi nedeniyle vardır; bu, hiçbir sunucu izni beyan etmeyen bir cüzdanla çelişkili görünebilir. İşte manifest dosyasındaki tam, değiştirilmemiş gerçek.

Eklentinin `manifest.json` dosyası şunları beyan eder:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — tek API izni. Şifrelenmiş kasayı ve köken bazlı bağlantı onaylarınızı **yerel olarak**, eklenti depolamasında saklar.
- **`host_permissions: []`** — QoreX **hiçbir** sunucu izni beyan etmez. Sizin adınıza rastgele sitelere kökenler arası ağ istekleri yapma yetkisini talep etmez.
- **`content_scripts` içinde `<all_urls>` eşleşmesi** — Firefox'un *"Tüm web sitelerindeki verilerinize erişme"* demesinin dürüst nedeni budur. QoreX **her sayfaya** küçük bir sağlayıcı betiği (`content.js` → `inpage.js`) enjekte eder. Tüm sitelerde çalışan bir içerik betiği teknik olarak sayfayı okuyabilir ve tarayıcılar bu yeteneği tam olarak bu ifadeyle tanımlar — ister `host_permissions` üzerinden gelsin, ister bir içerik betiği eşleşmesinden.

**İçerik betiği neden her yerde çalışır.** **Herhangi bir** dApp'in, siz önce site bazlı erişim vermeden cüzdanı EIP-6963 üzerinden keşfedebilmesi için. MetaMask, Keplr, Phantom ve diğer tüm enjekte edilen cüzdanlar böyle çalışır: enjekte edilen sağlayıcı, ziyaret ettiğiniz her sitede, sayfanın betikleri çalışmadan önce (`document_start`) hazır olmalıdır.

**Bu betik ne yapar — ve ne yapmaz.** Yalnızca cüzdan mesajlarını köprüler (sağlayıcıyı duyurur, bağlanma/imzalama isteklerini servis çalışanına iletir, sonucu döndürür). Bu cüzdan isteklerinin ötesinde sayfa içeriğini **okumaz**, bir sunucuya hiçbir şey göndermez, uzaktan kod yüklemez — ve sunucu izni bulunmadığı için rastgele kökenler arası veri çekemez. Bunların tümü doğrulanabilir: eklenti CSP ile kilitlidir, hiçbir analitik içermez ve Firefox paketi yeniden üretilebilir bir kaynak zip dosyası içerir.

## Bir dApp'i QoreX'e bağlama {#connect}

Bir dApp, QoreX'in EVM hattını **EIP-6963** üzerinden keşfeder. Duyur-ve-iste, ardından dönen EIP-1193 sağlayıcısını kullanın:

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

QoreChain **Native** hattı için `window.qorex.native` adresindeki Keplr desenli sağlayıcıyı kullanın (`enable`, `getKey`, `signDirect`). Üst seviye [`@qorechain/connect`](/sdk/overview) paketi bu algılamayı sizin için sarmalar.

Onaylar **köken bazlıdır**: bir siteye ilk bağlantı, kökeni gösteren bir onay penceresi açar, onaylamak yalnızca genel adresinizi açığa çıkarır ve bir sitenin onayı başka bir siteye hiçbir yetki vermez.

### Dashboard köprüsü (v0.1.5) {#dashboard-bridge}

Sürüm 0.1.5, yalnızca **`dashboard.qorechain.io` ile sınırlı** bir köprü ekler: `window.qorex.native.connectProof(sessionId)` *Connect with QoreX* eşleştirme kanıtını imzalar (arka uç imzayı yeniden doğrular) ve `executeTransfer({ to, amountUqor, memo })` Dashboard tarafından önerilen bir QOR transferini onaylayıp yayınlar, ardından `txHash` değerini döndürür. Bu yöntemler başka herhangi bir kökende reddedilir.

## Post-kuantum imzalama {#pqc}

QoreX'in kendi başlattığı her QOR transferi, `@qorechain/sdk` içindeki tam hibrit hat kullanılarak **hibrit post-kuantum imzayla** — klasik secp256k1 imzasının yanında **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) — imzalanır. **Bunun için bir anahtar/kapatma seçeneği yoktur**: QoreChain bunu zorunlu kılar ve QoreX bir Native hattı QOR transferini asla bu olmadan göndermez.

- **dApp tarafından başlatılan Native imzalama** — qorechain-connect akışı üzerine kurulu dApp'ler, `signDirect` çağrılmadan önce PQC uzantısını (`/qorechain.pqc.v1.PQCHybridSignature`) işlem gövdesine önceden katmanlar; QoreX klasik yarıyı katar ve **kör imzalamayı reddeder**, yükü çözümleyip PQC katmanının mevcut olup olmadığını işaretler.
- **Klasik istekler her zaman etiketlenir** — bir istek PQC katmanı taşımıyorsa ya da harici bir zinciri hedefliyorsa (PQC taşıyamayan ETH/BNB vb.), QoreX sessizce düşürmek yerine açık bir uyarı gösterir.

**Bunun işlem boyutu açısından anlamı.** ML-DSA-87 büyük bir imzadır: imza **4,627 bytes**, genel anahtar ise **2,592 bytes** boyutundadır (FIPS-204 tarafından sabitlenmiştir). Dolayısıyla hibrit bir QoreChain işlemi, tamamen klasik bir işleme göre birkaç kilobayt daha büyüktür. İşlemleri kendiniz oluşturup yayınlıyorsanız, arabelleklerinizi ve ücret tahminlerinizi bu ek baytlara göre boyutlandırın; QoreChain'in gas hesaplaması bunları zaten bekler. İlkel yapılar ve deterministik imzalama gereksinimi için bkz. [Post-Quantum Signing](/developer-guide/post-quantum-signing).
