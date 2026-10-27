---
slug: /dashboard/overview
title: Dashboard'a Genel Bakış ve Başlangıç
sidebar_label: Genel Bakış ve Başlangıç
sidebar_position: 1
---

# Dashboard'a Genel Bakış ve Başlangıç

**[dashboard.qorechain.io](https://dashboard.qorechain.io)** adresindeki QoreChain Dashboard, QoreChain'i tarayıcıdan kullanmak için resmi web uygulamasıdır. Tek bir hesap ve tek bir ağ anahtarı size explorer'ı, bir cüzdan görünümünü, bir testnet faucet'ini, bir test tokeni takas ekranını, görevleri, yapay zekâ sözleşme araçlarını, node ve doğrulayıcı araçlarını ve bir geliştirici sayfasını sunar. Hiçbir şey kurmadan ağı denemek isteyen herkes ve geliştirme yaparken hızlı kontroller isteyen geliştiriciler içindir. Hiçbir şey kurulmaz: tarayıcınızda çalışır.

Bu bölüm bir kullanıcı kılavuzudur: her sayfanın ne işe yaradığı, nasıl açılacağı ve sınırlarının neler olduğu.

## Yenilikler {#innovations}

- **Tek bir anahtar her sayfanın ağını belirler.** Başlıktaki **Testnet / Mainnet** denetimi seçiminizi tarayıcıda saklar ve sayfayı yeniden yükler; böylece sunucu ve tarayıcı aynı ağı okur. Varsayılan Mainnet'tir.
- **Mainnet non-custodial'dır.** Dashboard hiçbir zaman mainnet anahtarlarını tutmaz ve hiçbir mainnet işlemini imzalamaz. QoreX'e yalnızca bir gönderimin veya staking işleminin parametrelerini gönderir; işlemi QoreX yeniden oluşturur, gösterir, imzalar (ML-DSA-87 hibrit imza) ve yayınlar. Dashboard yalnızca işlem hash'ini öğrenir.
- **Mainnet görünümleri hesap gerektirir; testnet açıktır.** Mainnet'te ana sayfa istatistikleri, Wallet, Trade ve Explorer genel bakışı erişimi sunucuda denetler. Oturum açmamış bir ziyaretçi "Sign in to view mainnet" yazısını görür.
- **Tarayıcı başına bir kez, gerçek fon onayı.** İlk mainnet Wallet, Trade, Explorer genel bakışı veya ana sayfa istatistikleri görünümünden önce, "You're entering QoreChain Mainnet" başlıklı bir kart dört noktayı sıralar: Dashboard non-custodial'dır, işlemler kesindir ve geri alınamaz, toplam kayıp riski vardır ve burada hiçbir şey finansal tavsiye değildir, ve testnet QOR'u hiçbir zaman başka bir şeyle değiştirilemez. Kabul, hesabınızda değil tarayıcınızda saklanır.
- **Tek hesap, üç kodlama.** Aynı hesap bir `qor1...` adresi, bir `0x...` adresi ve bir SVM base58 adresi olarak gösterilir ve Dashboard bakiyeyi ve geçmişi `qor1...` üzerinden bir kez okur.

## Nasıl kullanılır {#how-to-use}

### Düzen

**Başlık.** Ağ anahtarı, ardından **Sign In** veya bir profil menüsü (Profile, Edit Profile, Theme, Language, Rewards, Referral, Docs, Log out).

**Masaüstü kenar çubuğu, sırasıyla:**

| Giriş | Sayfa | Nedir |
| --- | --- | --- |
| **Discover** | `/` | Ana sayfa: **Create Smart Contract** ve **Explore Network** hero düğmeleri, "Dashboard Overview" sayaçları, oluşturulan sözleşmelerin, son herkese açık denetimlerin ve en iyi katkıda bulunanların listeleri ve **Start Generating**, **New Audit** ve **Claim Tokens** içeren bir "Developer Toolkit". |
| **Public Sale** | `/public-sale` | Mevcut katılımcılar tahsisatlarını, vesting zaman çizelgesini ve claim işlemini görür. |
| **Wallet** | [Wallet](/dashboard/wallet) | Bakiye, geçmiş, alma ve (mainnet) QoreX üzerinden gönderme ve stake etme. |
| **Faucet** | [Faucet](/dashboard/faucet) | Ücretsiz testnet tokenleri. |
| **Explorer** | [Explorer](/dashboard/explorer) | Bloklar, işlemler, adresler ve doğrulayıcılar. |
| **Trade** | [Trade](/dashboard/trade) | Test tokeni takas ekranı. |
| **Earn** grubu | [Quests](/dashboard/quests) | Quests, Leaderboard, Badges. |
| **Games** | [Quests](/dashboard/quests#games) | QoreChain Arcade. |
| **Build** grubu | [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Nodes & Validators](/dashboard/tools-hub) (`/tools`), [Developers](/dashboard/developers) | Sözleşme araçları, operatör sayfası (beş sekme: Validator Program, Validator Application, Light Node, Node Registration, Rollups) ve herkese açık geliştirici sayfası (yedi sekme: SDKs, Transaction inspector, PQ key status, Simulator, Signing playground, QoreX test wallet, AI agents (MCP)). Nodes & Validators girişi eskiden "Tools" olarak etiketlenirdi; SDK sekmesi Developers sayfasına taşındı. |
| **FAQ** | `/faq` | Uygulama içi yardım. Bir kısmı güncel değildir; başvuru kaynağı bu kılavuzdur. |

[Validators](/dashboard/validators) sayfasının (`/validators`) kenar çubuğunda bağlantısı yoktur; adresiyle açın.

**Mobil.** Alt çubuk (Discover, Wallet, Faucet, ardından Explorer, Trade, Quests) ve geri kalanını içeren ortadaki bir yelpaze menü.

### Oturum açın {#sign-in}

Dashboard'un iki katmanı vardır: oturum açtığınız bir **Dashboard hesabı** ve ona bağladığınız **cüzdan**. Gezinmek hiçbir zaman cüzdan gerektirmez.

- **Sayfa yüklenmeden önce oturum açmaya yönlendirilenler:** Profile, [Wallet](/dashboard/wallet), Rewards, Referral, [Quests](/dashboard/quests), [Trade](/dashboard/trade), [Faucet](/dashboard/faucet), Connection, Contracts, Public Sale ve kayıtlı her sözleşme sayfası `/smart-contract-creator/<id>`.
- **Oturum kapalıyken "Authentication Required" ekranı gösterenler:** [Nodes & Validators](/dashboard/tools-hub), [Validators](/dashboard/validators), FAQ, [AI Audit](/dashboard/contract-auditor), Badges, Leaderboard ve Games.
- **Hesap olmadan açık olanlar:** Discover ana sayfası, her iki ağdaki [Explorer](/dashboard/explorer) ayrıntı sayfaları (işlem, blok, adres, doğrulayıcılar), testnet'teki Explorer genel bakışı, [Smart Contract Creator](/dashboard/smart-contract-creator) açılış sayfası (bir ücretsiz üretim), `/audits` adresindeki denetim listesi ve herkese açık denetim raporları ile [Developers](/dashboard/developers) sayfası.
- **Oturum kapalıyken mainnet:** mainnet verilerini gösteren sayfalar (ana sayfa sayaçları, Wallet, Trade, Explorer genel bakışı) "Sign in to view mainnet" yazısını ve bir **Sign In** düğmesini gösterir.

### Ağınızı seçin {#select-network}

Başlık, hangi ağda olduğunuzu gösterir ve geçiş yapmanıza olanak tanır. Seçim tarayıcınızda hatırlanır.

| Ağ | Chain ID | Ne zaman kullanılır |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Gerçek değer için canlı ağ (7 Haziran 2026'dan beri canlı, 23 Ekim 2026'dan beri zincir v3.2.4 çalıştırıyor). Non-custodial: kendi cüzdanınızı bağlarsınız. |
| **Testnet** | `qorechain-diana` | Dashboard tarafından yönetilen bir test cüzdanı ve [Faucet](/dashboard/faucet) ile ücretsiz ortam (27 Ekim 2026'dan beri zincir v3.2.6 çalıştırıyor). |

Yerel token **QOR**'dur (temel birim `uqor`, 1 QOR = 10^6 uqor). Yeniyseniz, testnet ile başlayın, Faucet'ten token talep edin ve mainnet'e geçmeden önce ilk bir transfer deneyin.

Birkaç sayfa anahtarı yok sayar: Faucet her zaman testnet'te öder, [Trade](/dashboard/trade) her zaman testnet içeriği gösterir; Quests, Badges, Leaderboard, Games, Public Sale ve FAQ ise ağa bağlı değildir.

### Cüzdanınızı bağlayın {#connect-your-wallet}

- **Mainnet non-custodial'dır.** **QoreX**'i (resmi QoreChain cüzdanı, uzantı veya uygulama), **Keplr**'i veya **MetaMask**'i bağlayın. Native raydaki gönderme ve stake etme işlemleri QoreX gerektirir, çünkü QoreChain hesapları bugün yalnızca QoreX'in ürettiği bir hibrit imza ile imzalanır. Keplr, Native raydaki görüntüleme ve alma için bağlanır. MetaMask, EVM rayında bağlanır; oradan göndermek için ayrıca hesabın ML-DSA-87 anahtarı ve QoreX'ten açılan açık bir EVM penceresi gerekir ([MetaMask ile gönderme](/dashboard/wallet#send-metamask) bölümüne bakın).
- **Testnet custodial'dır.** Dashboard sizin için bir test cüzdanı yönetir; böylece kurulacak bir şey yoktur ve riske atılan gerçek değer yoktur.

#### QoreX ile bağlanın (önerilen) {#connect-qorex}

1. [dashboard.qorechain.io](https://dashboard.qorechain.io) adresini açın ve başlığın **Mainnet** gösterdiğinden emin olun.
2. Bu tarayıcıda bir mainnet sayfasına ilk ziyaretinizse, [tek seferlik risk onayını](#risk-acknowledgement) kabul edin.
3. **Wallet**'ı açın (oturum açmış olmanız gerekir) ve **QoreX wallet** kartında **Connect with QoreX**'i seçin.
4. QoreX tarayıcı uzantısı tespit edilmişse ve kayıtlı bir yöntem yoksa, Dashboard **Browser extension** ve **QoreX app** seçenekleriyle "How do you want to connect?" sorusunu sorar. Seçim kaydedilir. Uzantı tespit edilmezse, doğrudan uygulama akışına geçer.
   - **Browser extension:** uzantı popup'ı istek yapan site olarak `dashboard.qorechain.io`'yu gösterir. Onaylayın; bu, `qor1...` adresinizin sahibi olduğunuza dair tek seferlik bir kanıtı imzalar. Hiçbir fon hareket etmez.
   - **QoreX app:** Dashboard bir QR kodu ve **Open QoreX** gösterir. Tarayın veya dokunun, QoreX'te eşleştirme talebini gözden geçirin ve biyometrinizle onaylayın. Dashboard yoklama yapar ("Waiting for approval in QoreX...") ve kendiliğinden tamamlar.
   - **Use a different method** bağlantısı yalnızca bir eşleştirme beklemedeyken görünür.
5. Onaylandıktan sonra, Dashboard `qor1...` adresinizi gösterir ve imza gerektiren işlemlerin kilidini açar.

Tam bağlanma ve gönderme adımları için [Wallet](/dashboard/wallet#mainnet) sayfasına, aynı eşleştirmenin cüzdan tarafındaki görünümü için QoreX dokümanlarının [Account & Dashboard](/qorex/account-and-dashboard#dashboard) sayfasına bakın.

#### Keplr veya MetaMask ile bağlanın

1. Başlık **Mainnet**'te ve onay kabul edilmişken, **Wallet**'ı açın.
2. **or connect another wallet** altında **Connect Keplr** veya **Connect MetaMask**'ı seçin.
3. Bağlantıyı cüzdanınızda onaylayın. Cüzdanınız QoreChain'i henüz tanımıyorsa, [Add QoreChain to your wallet](/dashboard/wallet#add-network) sayfasına bakın.

Bağlandıktan sonra, Wallet sayfası adresinizi bakiyesi ve geçmişiyle gösterir. İlk kurulum rehberliği için [Wallet Setup](/getting-started/wallet-setup) sayfasına bakın.

### Tek seferlik risk onayı {#risk-acknowledgement}

Onay kartı, bir tarayıcıda ilk mainnet **Wallet**, **Trade**, **Explorer genel bakışı** veya **ana sayfa istatistikleri** görünümünden önce görünür. Her mainnet sayfası için gerekli değildir: Explorer ayrıntı sayfaları, Creator ve diğer sayfalar onsuz açılır. Tarayıcı başına bir kez kabul edin; tarayıcının verilerini temizlemek onu yeniden gösterir.

## Nasıl erişilir {#how-to-access}

- **URL:** [dashboard.qorechain.io](https://dashboard.qorechain.io), herhangi bir güncel tarayıcıda. Kurulum yok.
- **Hesap:** oturum açma sayfasında e-posta veya desteklenen bir kimlik sağlayıcısı ile oturum açma. Hangi sayfaların bunu gerektirdiği [Oturum açın](#sign-in) bölümünde listelenir.
- **Ağlar:** mainnet `qorechain-vladi` ve testnet `qorechain-diana`, başlıktaki anahtarla. Varsayılan Mainnet'tir.
- **Cüzdan:** gezinmek için gerekmez. Mainnet gönderimleri ve staking için QoreX, görüntüleme ve alma için Keplr veya MetaMask. Testnet'te Dashboard sizin için bir test cüzdanı oluşturur.
- **Maliyet:** Dashboard'u kullanmak ücretsizdir. Zincir üzerindeki işlemler ağ ücretini öder (taban gas başına 0.1 uqor). Bazı ücretli öğeler kendi sayfalarında açıklanır (light node lisansı ve doğrulayıcı programı ücreti [Nodes & Validators](/dashboard/tools-hub) sayfasında).
- **Erken erişim kapısı:** bugün yok. Mainnet sayfaları yalnızca oturum açmayı (yukarıda listelenen yerlerde) ve tek seferlik onayı gerektirir.

## Nerede yayımlandı {#where-published}

| Yüzey | Adres | Ağlar | Oturum açma |
| --- | --- | --- | --- |
| Dashboard | [dashboard.qorechain.io](https://dashboard.qorechain.io) | Mainnet ve testnet | Sayfaya göre, bkz. [Oturum açın](#sign-in) |
| Bağımsız explorer | [explore.qore.network](https://explore.qore.network) (ayrı bir uygulama, bkz. [Explorer](/dashboard/explorer#standalone-explorer)) | Mainnet ve testnet | Yok |
| Herkese açık endpoint'ler | `rpc.qore.host`, `api.qore.host`, `evm.qore.host`, `svm.qore.host`, `*-testnet` varyantlarıyla | Mainnet ve testnet | Yok |

Bu bölümün sayfaları: [Explorer](/dashboard/explorer), [Wallet](/dashboard/wallet), [Trade](/dashboard/trade), [Bridge](/dashboard/bridge), [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Staking & Validators](/dashboard/staking-and-validators), [Validators](/dashboard/validators), [Faucet](/dashboard/faucet), [Quests, Badges, Leaderboard ve Games](/dashboard/quests), [Nodes & Validators](/dashboard/tools-hub) ve [Developers](/dashboard/developers).

## Sınırlar ve bilinen sorunlar {#limits}

- **Bridge ekranı yoktur.** Bkz. [Bridge](/dashboard/bridge).
- **Trade ağ anahtarını izlemez.** Başlık Mainnet'te olsa bile testnet içeriği gösterir. Bkz. [Trade](/dashboard/trade).
- **Uygulama içi FAQ kısa bir yardım sayfasıdır.** Onunla bu kılavuz farklılaştığında bu kılavuzu izleyin.
- **Mainnet kısıtlamaları.** Mainnet'te staking, gönderme ve sözleşme dağıtımları sayfa başına açıklanır; birkaç akış (Native veya SVM dağıtımları, redelegation, zaman kilitli staking) Dashboard'da sunulmaz.
- **Testnet'in gerçek değeri yoktur.** Bir testnet adresine asla gerçek QOR göndermeyin: biçimler aynıdır. Bkz. [Wallet](/dashboard/wallet#testnet).

:::tip QoreChain'de yeni misiniz?
Hızlıca uygulamalı deneyim kazanmak için [Connecting to Testnet](/getting-started/connecting-to-testnet) ve [Your First Transaction](/getting-started/first-transaction) adımlarını izleyin, ardından Dashboard'ın geri kalanını keşfetmek için buraya dönün.
:::
