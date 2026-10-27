---
slug: /dashboard/developers
title: Geliştiriciler
sidebar_label: Geliştiriciler
sidebar_position: 13
---

# Geliştiriciler

**Developers** sayfası (`/developers`, kenar çubuğu **Build**, giriş **Developers**), QoreChain üzerinde geliştirme yapanlar için herkese açık bir araç kutusudur. Altı sekmesi vardır: **SDKs**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet** ve **AI agents (MCP)**. Bir hesabın hangi kuantum sonrası anahtarı kaydettirdiğini ve EVM yetkilendirme penceresinin açık olup olmadığını kontrol edebilir, imzalı bir işlemi deneme amaçlı çalıştırabilir, tek kullanımlık bir anahtarla hibrit imzalamayı deneyebilir ve bir dApp'i sahte (mock) bir QoreX cüzdanına karşı sınayabilirsiniz; hepsi tarayıcıda ve hesap gerektirmeden. dApp, cüzdan ve backend geliştiricileri içindir. SDK'ların kendisi için bkz. [SDK Genel Bakış](/sdk/overview) ve [Kurulum](/sdk/install).

## Yenilikler {#innovations}

- **Herhangi bir adres için bir PQC anahtarını ve EVM penceresini zincirden okuyun.** PQ key status sekmesi, bir hesabın kaydettirdiği ML-DSA-87 anahtarını ve EVM yetkilendirme penceresini, mainnet veya testnet üzerinde, zincirin kendi sorgu rotaları aracılığıyla arar. `qor1...`, `0x...` ve `qorvaloper1...` adreslerini kabul eder.
- **Hiçbir şey yayınlamayan bir deneme çalıştırması.** Simulator, imzalı bir işlemi zincirin simulate rotasına gönderir ve kullanılan gas'ı, önerilen bir gas limitini ve işlemin üreteceği bakiye değişikliklerini ve olayları bildirir. Dashboard'un bunun için açığa çıkardığı tek yazma rotası simulate'tir.
- **Tarayıcıda, tarayıcıdan asla çıkmayan bir anahtarla hibrit imzalama.** Signing playground, sayfada tek kullanımlık 24 kelimelik bir ifade üretir, bir secp256k1 anahtarı ve bir ML-DSA-87 anahtarı türetir; mesajları ve Sign In With QoreChain isteklerini [QoreSign](/qoresign/overview) kütüphanesiyle imzalar ve doğrular. Anahtar yalnızca bellekte yaşar ve yeniden yüklemede kaybolur.
- **dApp'leri test etmek için sahte bir QoreX.** QoreX test wallet, geçerli sekmede `window.qorex`'i kurar ve kendini EIP-6963 üzerinden "QoreX (mock)" olarak duyurur; testnet'te gerçek hibrit imzalama ve her istek için elle onaylama veya reddetme ile.
- **Tasarım gereği yalnızca testnet.** Signing playground ve test wallet mainnet'i reddeder: yalnızca `qorechain-diana` için imzalarlar. İki salt okunur sekme her iki ağı da hedefleyebilir.

## Nasıl kullanılır {#how-to-use}

Sayfa **SDKs** sekmesinde açılır. **PQ key status** ve **Simulator** sekmeleri, sayfaya özgü olan ve üst bilgi ne derse desin **varsayılan olarak Testnet** olan bir **Network** anahtarı gösterir. (Ağ değiştirmenin sayfayı yeniden yüklemesi ve bellekteki anahtarlarınızı ve test cüzdanınızı silmesi önlensin diye sayfa düzeyinde bir anahtar kullanılır.)

### PQ key status {#pq-status}

1. **PQ key status** sekmesini açın ve ağı seçin.
2. Bir **Account address** girin (`qor1...`, `0x...` veya `qorvaloper1...`). Bir `0x` adresi, `qor1` biçimiyle aynı 20 bayttır; bir `qorvaloper` adresi, operatörün kendi hesabı olarak aranır. Sayfa biçimi ve sağlama toplamını kontrol eder.
3. **Check**'i seçin.
4. **Registered PQC key**, bir anahtarın kayıtlı olup olmadığını, algoritmasını (ML-DSA-87), anahtar türünü, **Proof of possession** değerini (zincir bunu isteğe bağlı sayar) ve genel anahtarı gösterir. Hiçbiri kayıtlı değilse bunu söyler.
5. **EVM authorisation window**, durumu (**Open** veya **Closed**), **Blocks left**, **Transactions used** (örneğin "3 of 20"), **Value used**, açılış ve sona erme yüksekliklerini, pencerenin **Native QOR transfers only** olup olmadığını ve izin verilen hedefleri gösterir. Hesap hiç pencere açmadıysa "No EVM authorisation window has been opened for this account." der.

Pencere, hesabın ML-DSA-87 anahtarıyla native hattan açılır ve blok sınırına veya işlem sınırına ulaşıldığında kapanır; bkz. [EVM yetkilendirme penceresi](/developer-guide/evm-development#evm-window). Bu sekme, "EVM işlemim neden reddedildi?" sorusunu komut satırı olmadan yanıtlar.

### Simulator {#simulator}

1. **Simulator** sekmesini açın ve ağı seçin.
2. Kutuya bir **Signed TxRaw** (base64 veya hex) yapıştırın. Sayfa size çözülmüş boyutu ve imza sayısını söyler ve hiç imza yoksa uyarır (zincir imzasız bir işlemi simüle etmeyi büyük olasılıkla reddeder).
3. **Simulate**'i seçin. Sonuç **Gas used**, **Suggested gas limit**, **Balance changes** (adres, birim, değişiklik) ve **Events** değerlerini gösterir.
4. Zincir reddederse, sayfa kodunu, codespace'ini ve günlüğünü gösterir.

Hiçbir şey yayınlanmaz. İmzalı işlem baytları gerekir: önce bir SDK veya `qorechaind` ile oluşturup imzalayın (bkz. [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing)). Girdi yaklaşık 180 KB ile sınırlıdır.

### Signing playground (yalnızca testnet) {#signing-playground}

1. **Signing playground** sekmesini açın. Şu uyarıyı verir: "Throwaway testnet key: never use it for real funds."
2. **Generate throwaway key**'i seçin. Sayfa adresi, secp256k1 genel anahtar boyutunu ve ML-DSA-87 anahtar boyutlarını gösterir. Bir tane daha için **New key**'i seçin.
3. **Message:** metin girin ve **Sign**'ı seçin. Metin, `qorechain-diana` zinciri için her iki anahtarla imzalanır; imza JSON olarak görünür.
4. **Verify:** bir imza ve imzalayan adresi yapıştırın ve **Verify**'ı seçin. "Valid signature" veya "Invalid signature" bildirir. Tek kullanımlık bir anahtar zincirde kayıtlı olmadığından, imzalayan adrese ve bu oturumun ML-DSA-87 genel anahtarına karşı kontrol eder.
5. **Sign In With QoreChain:** bu site için rastgele bir nonce ile bir oturum açma mesajı oluşturmak üzere **Build message**'ı seçin, ardından bir sunucunun yapacağı gibi imzalayıp doğrulayın. Ayrıştırılmış alanlar gösterilir. Bkz. [SIWQ belirtimi](/qoresign/spec/siwq-v1) ve [oturum açma kılavuzu](/qoresign/guides/sign-in).

Anahtar tarayıcıda üretilir, asla kaydedilmez veya gönderilmez ve kurtarılamaz. Biçimler için bkz. [QoreSign](/qoresign/overview) ve [Hibrit imzalama v1](/qoresign/spec/hybrid-signing-v1).

### QoreX test wallet (yalnızca testnet) {#test-wallet}

1. **QoreX test wallet** sekmesini açın ve uyarıyı okuyun: her başlatma bellekte tek kullanımlık bir testnet anahtarı üretir; ona asla gerçek fon göndermeyin.
2. **Start test wallet**'i seçin. Yayımlanmış `@qorechain/qorex-wallet-mock` paketini kullanır, sahte cüzdanı **bu sekmeye** kurar (siz yeniden yükleyene kadar oradaki gerçek bir QoreX eklentisinin yerini alır) ve tuttuğu **Addresses** değerlerini listeler: QoreChain Native, EVM ve SVM.
3. Aynı sekmede çalışan bir dApp'ten bağlanın veya tarayıcı konsolundan `window.qorex`'i çağırın.
4. Her istek **Waiting for approval** altında sizi bekler: **Approve** veya **Reject**'i seçin. **Requests** listesi her birini onay durumu ve sonucuyla günlüğe kaydeder.
5. Sahte cüzdanı kaldırmak için **Stop (reloads the page)**'i seçin.

Yalnızca testnet için imzalar, asla mainnet için değil. Bir dApp'i gerçek bir QoreX'e yöneltmeden önce bağlantı akışını denemek için kullanın.

### SDKs ve AI agents (MCP)

- **SDKs:** sekme şu anda kısa, statik bir hızlı başlangıç ve paket tablosu gösterir. **Güncel değildir** (hâlâ 0.1.0 sürümünü anlatır ve paketlerin kayıt defterlerinde olmadığını söyler; bu artık doğru değildir). Güncel paketler ve sürümler için [SDK Kurulumu](/sdk/install) sayfasını kullanın. Test edilmiş paket listesinden, kurulum komutları, hızlı başlangıçlar ve canlı kayıt defteri sürümleriyle üretilen yeniden oluşturulmuş bir SDKs sekmesi **yakında gelecek ve henüz canlı değil**.
- **AI agents (MCP):** sekme, QoreChain MCP sunucusu için npm kayıt defterini kontrol eder ve paket yayımlanmadığı sürece **"The QoreChain MCP server is not published yet."** der. Henüz bir kurulum komutu yok. Paket yayımlandığında sekme, onu stdio üzerinden yerel olarak veya Streamable HTTP üzerinden kendi barındırmanızla çalıştırmak için istemci yapılandırmasını gösterecek.
- **Transaction inspector:** herhangi bir işlemi çözümleyip açıklayan bir araç **yakında gelecek ve henüz canlı değil**.

## Nasıl erişilir {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) veya kenar çubuğu **Build** grubunda (ve mobil menüde) **Developers**.
- **Oturum açma:** yok. Sayfa herkese açıktır.
- **Ağ:** PQ key status ve Simulator: sekmedeki anahtar aracılığıyla mainnet veya testnet (varsayılan testnet). Signing playground ve QoreX test wallet: yalnızca testnet.
- **Cüzdan:** yok. Araçlar kendi tek kullanımlık anahtarlarını üretir.
- **Maliyet:** ücretsiz. Zincire okuma sorguları ve simulate çağrıları dışında hiçbir şey gönderilmez.
- **Gizlilik:** tek kullanımlık anahtarlar yalnızca sayfanın belleğinde bulunur. Hiçbir araca gerçek bir kurtarma ifadesi yapıştırmayın.

## Nerede yayımlanır {#where-published}

| Yüzey | Adres | Ağlar |
| --- | --- | --- |
| Developers sayfası | `dashboard.qorechain.io/developers` | Mainnet ve testnet okuma araçları; yalnızca testnet imzalama araçları |
| İmzalama kütüphanesi | npm `@qorechain/qoresign` 0.1.0, kaynak `github.com/qorechain/qoresign`, bkz. [QoreSign](/qoresign/overview) | yok |
| Test cüzdanı paketi | npm `@qorechain/qorex-wallet-mock` 0.1.0, kaynak `github.com/qorechain/qorex-integrations` | Testnet |
| MCP sunucusu | `@qorechain/mcp`: henüz yayımlanmadı | yok |

Sürümler npm kayıt defterinde 27 Ekim 2026'da kontrol edildi.

## Sınırlar ve bilinen sorunlar {#limits}

- **Henüz canlı değil:** yeniden oluşturulmuş SDKs sekmesi ve transaction inspector. MCP sunucusu yayımlanmadı, bu nedenle kurulacak bir şey yok.
- **Mevcut SDKs sekmesi eskidir;** bunun yerine [SDK sayfalarını](/sdk/overview) kullanın.
- **Simulator imzalı bir işlem gerektirir.** Sizin yerinize imzalayamaz ve yayınlamaz.
- **Playground ve test wallet yalnızca testnet içindir** ve yeniden yüklemede kaybolan tek kullanımlık anahtarlar kullanır. Gerçek fon tutamaz veya taşıyamaz.
- **Aynı sekmedeki gerçek bir QoreX eklentisinin yerini** siz sayfayı yeniden yükleyene kadar test wallet alır.
- **Okumalar salt okunur bir proxy üzerinden geçer.** Zincirin REST uç noktaları tarayıcı CORS başlıkları göndermez; bu nedenle Dashboard, `cosmos/`, `cosmwasm/` ve `qorechain/` yolları altındaki salt okunur istekleri ve simulate çağrısını aktarır. Kendi kodunuzdan genel uç noktaları doğrudan çağırın: `api.qore.host` ve `api-testnet.qore.host`.
