---
slug: /dashboard/developers
title: Geliştiriciler
sidebar_label: Geliştiriciler
sidebar_position: 13
---

# Geliştiriciler

**Developers** sayfası (`/developers`, kenar çubuğu **Build** grubu, giriş **Developers**), QoreChain üzerinde geliştirme yapanlar için herkese açık bir araç sayfasıdır. Hesap gerektirmez. Yedi sekmesi vardır: **SDKs**, **Transaction inspector**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet** ve **AI agents (MCP)**. Birlikte, doğru paketi bulup kurmanızı, işlenmiş herhangi bir işlemi okuyup kuantum sonrası katmanının doğrulanıp doğrulanmadığını görmenizi, bir hesabın hangi kuantum sonrası anahtarı kaydettirdiğini ve EVM yetkilendirme penceresinin açık olup olmadığını kontrol etmenizi, imzalı bir işlemi deneme amaçlı çalıştırmanızı, tek kullanımlık bir anahtarla hibrit imzalamayı denemenizi ve bir dApp'i sahte (mock) bir QoreX cüzdanına karşı sınamanızı sağlarlar; hepsi tarayıcıda. dApp, cüzdan ve backend geliştiricileri içindir. Kütüphanelerin kendisi için bkz. [Geliştirici Paketleri](/developer-tools/overview), [SDK Genel Bakış](/sdk/overview) ve [Kurulum](/sdk/install).

## Yenilikler {#innovations}

- **Zincire salt okunur bir ağ geçidi.** Araçlar, herkese açık zincir verilerini okur ve bir işlemi, `cosmos/`, `cosmwasm/` ve `qorechain/` sorgu yolları ile simulate çağrısı altında salt okunur bir ağ geçidi üzerinden simüle eder. Sayfadaki hiçbir şey bir işlemi yayınlayamaz. Ağ geçidi, zincirin REST uç noktaları tarayıcı CORS başlıkları göndermediği için vardır.
- **Tarayıcıdan asla çıkmayan anahtarlar.** Signing playground ve test cüzdanının anahtarları tarayıcınızda üretilir ve yalnızca bellekte tutulur. Asla kaydedilmez veya gönderilmez ve yeniden yüklemede kaybolurlar. Bu iki sekme yalnızca testnet içindir ve mainnet'i reddeder.
- **Bir demo değil, üretimdeki imzalama kütüphanesi.** Playground, üretim entegrasyonlarıyla aynı açık kaynaklı kütüphane olan [QoreSign](/qoresign/overview) kütüphanesini kullanır. Hibrit imzalar üretir ve doğrular: aynı mesaj üzerinde bir secp256k1 imzası artı bir ML-DSA-87 imzası.
- **Test edilmiş verilerden üretilen bir paket merkezi.** **SDKs** sekmesi, tek bir manifestodan 48 paket listeler. Sürümler her kayıt defterinden canlı okunur (10 dakikada bir yenilenir; bir kayıt defterine ulaşılamazsa son kontrol edilen sürüm ve tarihi gösterilir) ve her hızlı başlangıç SDK ekibi tarafından herkese açık kayıt defterlerine karşı çalıştırılmıştır; gözlemledikleri çıktı yanında gösterilir.
- **Yeniden üretebileceğiniz bir karar.** **Transaction inspector**, işlenmiş bir işlemi okur ve ML-DSA-87 katmanının imzalayanın kayıtlı anahtarına karşı doğrulanıp doğrulanmadığını bildirir; doğrulanmadığında imzalama baytı sürümünü ve nedenini de verir. Bunun için [QoreSign](/qoresign/overview) 0.1.1'in `inspectTransaction` işlevini kullanır; böylece aynı kontrol kendi kodunuzda da çalışır. Salt okunurdur.
- **Tahmin değil, zincirin yanıtları.** **PQ key status**, kayıtlı ML-DSA-87 anahtarını ve EVM penceresi durumunu düğümün kendi sorgu rotalarından okur; böylece bir EVM işleminin neden reddedileceğini göndermeden önce görebilirsiniz.

## Nasıl kullanılır {#how-to-use}

[dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) adresini açın. Sayfa **SDKs** sekmesinde açılır. **PQ key status** ve **Simulator** sekmeleri, sayfaya özgü olan ve üst bilgi ne derse desin **varsayılan olarak Testnet** olan bir **Network** anahtarı (Testnet veya Mainnet) gösterir. Bu bilerek sayfa düzeyindedir: üst bilgideki anahtar sayfayı yeniden yükler ve bu, bellekteki anahtarları ve test cüzdanını silerdi.

### SDKs {#sdks}

**Ne yapar.** Her QoreChain kütüphanesini ürüne göre gruplayarak listeler. Manifesto, TypeScript, Python, Go, Rust, Java, Kotlin ve Swift genelinde 48 paket içerir. 46'sı kararlıdır, 1'i kullanımdan kaldırılmıştır ve 1'i henüz kayıt defterinde değildir ve **Not published yet** olarak işaretlenir (npm için QoreSeal). Ürünler, gösterildikleri sırayla şunlardır: QoreChain SDK (çekirdek, React hook'ları, EVM, SVM, dApp başlangıç şablonu ve Python, Rust, Go ve Java portları), QoreSign (Python için QoreSign dahil), QoreSeal (hesaplara ML-KEM-1024 ile şifreleme, testnet; bkz. [QoreSeal](/developer-tools/qoreseal); Rust, Go, Python, Swift, Kotlin ve Android'de), RDK (rollup geliştirme kiti, komut satırı aracı, rollup başlangıç şablonu ve Python, Rust, Go ve Java portları), PQC kütüphanesi, cüzdan adaptörü, zincir köprüsü, Handles, QoreX entegrasyonları ve MCP ile `qore` CLI.

**Nasıl çalışır.** Her ürün bir karttır. Ürün birden çok dilde sunuluyorsa, bir dil seçici (hap düğmeler) gösterilen paketi değiştirir. Her paket şunları gösterir:

- bir durum etiketi (**Stable**, **Not published yet** veya **Deprecated**);
- kayıt defterinden (npm, PyPI, crates.io, Go proxy, Maven Central veya GitHub sürümleri) canlı okunan ve 10 dakikada bir yenilenen **en son sürüm**. Bir kayıt defterine ulaşılamazsa, son kontrol edilen sürüm tarihiyle ve canlı sürümlerin okunamadığına dair bir notla gösterilir;
- **Registry**, **Source** (depo) ve **License** (Apache-2.0) ile çalışma zamanı gereksinimleri;
- **Install** komutu ve **Import** satırı (her birinde bir kopyalama düğmesi) ile, pakette varsa eş bağımlılıklar, alt yol dışa aktarımları, taşıma katmanları ve barındırılan bir uç nokta (Maven bir `pom.xml` bloğu gösterir);
- **Quickstart**: tarihle birlikte **Tested**, **Failed in testing** veya **Not tested** yazan bir etiket, dosya adı, kopyalama düğmeli kod, **Observed output** ve **How it was tested**. Başarısız olan bir hızlı başlangıç, önce bilinen sorunları okumanızı söyleyen bir uyarıyla **Show the quickstart** arkasında gizlenir;
- SDK ekibinden kelimesi kelimesine **Known issues** ve notlar.

Yayımlanmamış bir paket "This package is not on its registry yet, so there is no install command." mesajını gösterir ve kurulum satırı yoktur. Kullanımdan kaldırılmış paket (`@qorechain/connect`), yerine geçen paketlerle (`@qorechain/qorex-*` paketleri) birlikte altta **Deprecated packages** başlığı altında katlanmış olarak yer alır.

**Adımlar.**

1. Listeyi daraltmak için filtre kutusuna yazın ("Filter by name or language"); **Clear filter** sıfırlar. Birden çok ürün eşleştiğinde, bir **Jump to** satırı her birine bağlanır.
2. Ürünü, ardından dil etiketini seçin.
3. Sürüm satırını kontrol edin ("latest on npm" veya tarihli "checked"), ardından **Install** komutunu kopyalayın.
4. **Import** satırını, ardından hızlı başlangıcı **File name** altında belirtilen dosyaya kopyalayın ve çalıştırın.
5. Testnet ve mainnet için zincir kimliklerini ve herkese açık uç noktaları kopyalamak üzere **Network endpoints** bölümünü açın. Altındaki not hızlı başlangıç kurallarını açıklar: örnekler yalnızca okur ve herkese açık test ifadesiyle imzalar; bu yüzden ondan türetilen bir hesabı asla fonlamayın.

**Asgari örnek.** Filtreye `python` yazın, **QoreChain SDK**'yi açın, **Python** etiketini seçin, **Install** altındaki kurulum komutunu kopyalayın, ardından hızlı başlangıcı kopyalayıp çalıştırın.

**Ağ.** Statik liste artı canlı kayıt defteri okumaları; ağ seçimi uygulanmaz.

### Transaction inspector {#inspector}

**Ne yapar.** İşlenmiş bir işlemi karmasıyla okur ve onu kimin imzaladığını, maliyetini, kuantum sonrası katmanının doğrulanıp doğrulanmadığını ve hangi güvenlik katmanına girdiğini açıklar. Salt okunurdur: hiçbir şey imzalanmaz veya gönderilmez.

**Nasıl çalışır.** Sayfa, seçtiğiniz ağdaki işlemi Dashboard'un salt okunur ağ geçidinden ister ve üzerinde [QoreSign](/qoresign/overview) 0.1.1'in `inspectTransaction` işlevini çalıştırır (aynı kontrolü kodda çalıştırmak için bkz. [QoreSign hızlı başlangıcı](/qoresign/quickstart)). Kuantum sonrası katman, imzalayanın **şu an** kayıtlı olan ML-DSA-87 anahtarına karşı denetlenir; bu nedenle sonraki bir anahtar döndürmesi eski bir işlemin doğrulanmamış görünmesine yol açabilir.

**Adımlar.**

1. **Transaction inspector** sekmesini açın (**SDKs**'in hemen ardındadır) ve anahtarla **Testnet** veya **Mainnet** seçin.
2. **Transaction hash** değerini yapıştırın: `0x` ile veya `0x` olmadan 64 onaltılık karakter. Hatalı biçimli bir karma, herhangi bir şey istenmeden önce reddedilir.
3. **Inspect**'i seçin.
4. Sonucu okuyun:
   - **Overview:** **Status** (**Success** veya codespace ve koduyla **Failed**), **Height**, **Chain id**, **Memo**, **Gas limit** ile birlikte **Fee** (belirlenmişse ücreti ödeyen veya veren de) ve **Open in explorer**. Explorer, üst bilgide seçilen ağı izler; bu nedenle işlem diğer ağdaysa bir not, onu değiştirmenizi söyler.
   - **Signer:** **Address**, **Key type**, **Sequence**, **Public key** ve **Classical signature valid**. EVM hattı işlemleri burada imzalayan bilgisi taşımaz ve sekme bunu belirtir.
   - **Post-quantum layer:** **Present**, **Count**, **Algorithm** (ML-DSA-87), **Verified** (evet veya hayır), **Sign-bytes version** ve doğrulanmadığında **Reason**.
   - **Security tier**, şu tanımlarla:

     | Katman | Anlamı |
     | --- | --- |
     | **PQC** | ML-DSA-87 katmanını taşır: hibrit bir imza. |
     | **Enrollment** | Hesabın ML-DSA-87 anahtarını kaydeder veya yönetir ve tasarım gereği klasik anahtarla imzalanır. |
     | **SHAKE** | ML-DSA-87 katmanı olmayan bir native hat işlemi. |
     | **Classical** | Yalnızca secp256k1 ile imzalanmış bir EVM hattı işlemi. |

   - **Messages:** her mesajın tür URL'si ve ham değeri (**Show raw value (base64)**) ile **Raw JSON**.
5. Bilinmeyen bir karma "No transaction with this hash was found on ..." mesajını, karmayı kontrol etme veya ağı değiştirme ipucuyla birlikte gösterir. Testnet düğümleri eski geçmişi budar; bu nedenle eski bir testnet işlemi artık bulunmayabilir.

**Asgari örnek.** **Testnet**'i seçin ve `124E5B2B5B5A8AE7CBA254224CBA07F5014BD1B0014C164A8208E5D7EC0C664E` değerini yapıştırın: katman **PQC**, kuantum sonrası katman ise **Verified** olarak görünür (27 Ekim 2026'da kontrol edildi; bu işlem o tarihten sonra budanmışsa yakın tarihli bir testnet transferinin karmasını kullanın).

**Ağ.** Sekmedeki anahtar aracılığıyla mainnet veya testnet (varsayılan testnet).

### PQ key status {#pq-status}

**Ne yapar.** Bir hesabın zincirde kaydettirdiği ML-DSA-87 anahtarını ve EVM yetkilendirme penceresinin durumunu, mainnet veya testnet üzerinde gösterir.

**Nasıl çalışır.** Sayfa girdinizi ayrıştırır, bir `qor1...` hesabına dönüştürür ve düğüme iki sorgu yapar: kayıtlı PQC anahtarı ([QoreSign](/qoresign/overview) aracılığıyla) ve hesabın EVM penceresi (`GET /qorechain/pqc/v1/evm_window/{address}`). Bir `0x...` adresi, `qor1...` biçimiyle aynı 20 bayttır ve bir `qorvaloper1...` adresi operatörün kendi hesabı olarak aranır. Sonuçlar tek bir ağa aittir: anahtarı değiştirmek onları temizler.

**Adımlar.**

1. **PQ key status** sekmesini açın ve ağı seçin.
2. Bir **Account address** girin (`qor1...`, `0x...` veya `qorvaloper1...`). Sayfa biçimi ve sağlama toplamını kontrol eder ve bir yazım hatasını bildirir.
3. **Check**'i seçin.
4. **Registered PQC key** alanını okuyun: bir anahtarın kayıtlı olup olmadığı, **Algorithm** (ML-DSA-87), **Key type** (hybrid), **Proof of possession** (zincirin bunu isteğe bağlı saydığı notuyla) ve **Public key** (2592 bayt, kısaltılmış, kopyalama düğmeli). Anahtarı olmayan bir hesap "This account has no PQC key registered on this network." mesajını gösterir.
5. **EVM authorisation window** alanını okuyun: **State** (**Open** veya **Closed**), **Blocks left**, **Transactions used** ("3 of 20" biçiminde), **Value used**, **Opened / expiry height** ve pencerenin **Native QOR transfers only** olup olmadığı, varsa izin verilen hedeflerle birlikte. Hiç pencere açmamış bir hesap "No EVM authorisation window has been opened for this account." mesajını gösterir.

Pencere, hesabın ML-DSA-87 anahtarıyla native hattan açılır ve blok sınırına veya işlem sınırına ulaşıldığında kapanır; bkz. [EVM yetkilendirme penceresi](/developer-guide/evm-development#evm-window).

**Asgari örnek.** Testnet'i seçin, MetaMask ile kullandığınız bir adresin `0x...` biçimini yapıştırın, **Check**'i seçin: pencere **Closed** ise veya yoksa, o hesaptan gelen bir EVM işlemi reddedilirdi.

### Simulator {#simulator}

**Ne yapar.** İmzalı bir işlemi zincire karşı deneme amaçlı çalıştırır ve maliyetini ve neyi değiştireceğini bildirir. Hiçbir şey yayınlanmaz.

**Nasıl çalışır.** Sayfa girdinizi çözer (base64 veya hex, yaklaşık 180 KB'a kadar), imzalarını sayar ve düğümün simulate rotasına gönderir. Simulate çağrısı, ağ geçidinin izin verdiği tek yazma rotasıdır.

**Adımlar.**

1. **Simulator** sekmesini açın ve ağı seçin.
2. İmzalı işlemi (bir `TxRaw`, base64 veya hex) **Signed TxRaw** alanına yapıştırın. Sayfa çözülmüş boyutu ve imza sayısını gösterir ve hiç imza yoksa uyarır (zincir imzasız bir işlemi simüle etmeyi büyük olasılıkla reddeder).
3. **Simulate**'i seçin.
4. **Gas used**, **Suggested gas limit**, **Balance changes** (adres, birim, değişiklik) ve katlanabilir listedeki **Events** değerlerini okuyun.
5. Zincir reddederse, sayfa "The chain refused the simulation" altında **Code**, **Codespace** ve **Log** değerlerini gösterir.

Önce imzalı bayt gerekir: bir SDK veya `qorechaind` ile oluşturup imzalayın (bkz. [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing)). **Asgari örnek:** testnet'te SDK ile küçük bir transfer imzalayın, base64 `TxRaw` değerini yapıştırın, **Simulate**'i seçin ve yayınlamadan önce önerilen gas limitini kontrol edin.

### Signing playground (yalnızca testnet) {#signing-playground}

**Ne yapar.** Tek kullanımlık bir hibrit anahtar üretmenize ve tarayıcıda mesajları ve Sign In With QoreChain isteklerini imzalayıp doğrulamanıza olanak tanır.

**Nasıl çalışır.** Sayfada 24 kelimelik bir ifade üretilir ve yalnızca bellekte tutulur. [QoreSign](/qoresign/overview) ondan bir secp256k1 anahtarı ve bir ML-DSA-87 anahtarı türetir. İmzalar, `qorechain-diana` zinciri için aynı mesajı her iki anahtarla kapsar. Tek kullanımlık bir anahtar zincirde kayıtlı olmadığından, doğrulama bu oturumun ML-DSA-87 genel anahtarını kullanır.

**Adımlar.**

1. **Signing playground** sekmesini açın. "Throwaway testnet key: never use it for real funds." uyarısını verir.
2. **Generate throwaway key**'i seçin. Sayfa `qor1...` adresini, secp256k1 genel anahtarını (33 bayt) ve ML-DSA-87 anahtarını (genel anahtar 2592 bayt, gizli anahtar 4896 bayt) gösterir. **New key** onu değiştirir.
3. **Message:** metin girin, **Sign**'ı seçin; sonuç JSON olarak bir hibrit imzadır. **Verify**'ı seçin: sayfa "Valid signature" veya hata koduyla "Invalid signature" gösterir.
4. **Sign In With QoreChain:** **Build message**'ı seçin (bu site için alan adı, adres, zincir kimliği, rastgele bir nonce ile verilme ve sona erme zamanlarını içeren bir oturum açma mesajı), ardından **Sign**, sonra **Verify**. Verify, bir sunucunun yapacağı gibi kontrol eder ve ayrıştırılmış alanları listeler. Bkz. [SIWQ belirtimi](/qoresign/spec/siwq-v1) ve [oturum açma kılavuzu](/qoresign/guides/sign-in).

**Asgari örnek.** **Generate throwaway key**, `hello` yazın, **Sign**, **Verify**: sayfa "Valid signature" gösterir.

**Ağ.** Yalnızca testnet; anahtar mainnet için kullanılamaz ve yeniden yüklemede kaybolur.

### QoreX test wallet (yalnızca testnet) {#test-wallet}

**Ne yapar.** Gerçek bir cüzdan olmadan bir dApp'in bağlanma ve imzalama akışlarını denemeniz için geçerli sekmeye QoreX cüzdanının sahte bir kopyasını kurar.

**Nasıl çalışır.** **Start test wallet**, tek kullanımlık bir anahtarla bir test cüzdanı oluşturur (yayımlanmış `@qorechain/qorex-wallet-mock` paketi) ve onu sayfadaki dApp'lere, tarayıcı cüzdanları için standart cüzdan keşfi (EIP-6963) aracılığıyla "QoreX (mock)" olarak duyurur; ayrıca `window.qorex`'i açığa çıkarır. Hiçbir şey otomatik onaylanmaz. İşlem yayınlamaz. Sekmede gerçek bir QoreX eklentisi varsa, siz yeniden yükleyene kadar sahte cüzdan onun yerini alır.

**Adımlar.**

1. **QoreX test wallet** sekmesini açın ve uyarıyı okuyun: her başlatma bellekte tek kullanımlık bir testnet anahtarı üretir; ona asla gerçek fon göndermeyin.
2. **Start test wallet**'i seçin. **Addresses** kartı QoreChain Native, EVM ve SVM adreslerini listeler.
3. Bu sekmede çalışan bir dApp'ten bağlanın veya tarayıcı konsolundan `window.qorex`'i çağırın.
4. Her istek **Waiting for approval** altında görünür; **Approve** veya **Reject**'i seçin. **Requests** listesi her isteği onay durumu ve sonucuyla günlüğe kaydeder.
5. Sahte cüzdanı kaldırmak için **Stop (reloads the page)**'i seçin.

**Asgari örnek.** Test cüzdanını başlatın, aynı sekmede bir dApp açın, bağlanma iletişim kutusunda "QoreX (mock)" seçeneğini seçin ve bağlantıyı **Approve** ile onaylayın.

**Ağ.** Yalnızca testnet.

### AI agents (MCP) {#mcp}

**Ne yapar.** QoreChain MCP sunucusunun durumunu (bir MCP istemcisinin QoreChain zincir verilerini okumasını ve geliştirici araçlarını kullanmasını sağlayan bir Model Context Protocol sunucusu) ve bir MCP istemcisinde nasıl kurulacağını gösterir.

**Nasıl çalışır.** Sekmeyi açtığınızda sayfa paket kayıt defterine canlı sorar ve durumu (**Published**) güncel sürümle birlikte gösterir (`@qorechain/mcp`, yazım sırasında 0.1.0; aynı zamanda PyPI üzerinde `qorechain-mcp` adıyla da bulunur). Ardından bir MCP istemcisi için kurulumu kopyalanabilir bloklar olarak gösterir:

- **Yerel (stdio), birincil seçenek.** MCP istemcinizin sunucu yapılandırmasına `{ "mcpServers": { "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] } } }` ekleyin. Anahtar gerektirmez.
- **Kendi barındırdığınız (Streamable HTTP).** `qorechain-mcp serve --port 8787` komutunu çalıştırın ve istemciyi `http://localhost:8787/mcp` adresine yönlendirin.
- **Barındırılan uç nokta.** `https://mcp.qorechain.io/mcp` varsayılan olarak testnet'e hizmet verir. Her istek, `Authorization: Bearer <key>` başlığı olarak gönderilen bir API anahtarı gerektirir. Bir tanesini dashboard'unuzdan talep edin (aşağıdaki anahtar akışına bakın). Çoğu kullanımda yerel kurulum anahtar gerektirmez.

**Barındırılan uç nokta için API anahtarı.** Oturum açın, ardından sekmedeki **API key** bölümünde:

1. Ad veya kuruluş, bir iletişim bilgisi, amaçlanan kullanım ve beklenen hacmi doldurun, ardından **Request API key**'e basın. Durum "onay bekleniyor" olarak görünür.
2. QoreChain ekibi talebi onaylar veya reddeder. Ret, notuyla birlikte gösterilir ve yeniden talep edebilirsiniz.
3. Onaydan sonra **Generate key**'e basın. Anahtar yalnızca bir kez gösterilir; yanında bir kopyalama düğmesi ve hazır bir yapılandırma parçacığı bulunur ve bir iki dakika içinde etkinleşir. QoreChain anahtarın bir kopyasını tutmaz, yalnızca bir parmak izi (bir karma) saklar; bu nedenle kaybolan bir anahtar yeniden gösterilemez: iptal edin ve yenisini talep edin.
4. **Revoke key** her zaman kullanılabilir ve yaklaşık bir dakika içinde etkili olur.

Sınırlar: hesap başına bir etkin anahtar, saniyede 10 istek (ani yük 20) ve günde 100.000 istek.

**Adımlar.** Sekmeyi açın, yerel yapılandırmayı MCP istemcinize kopyalayın, istemciyi yeniden başlatın ve ondan bir blok veya bir hesap okumasını isteyin. Araç ayrıntıları ve seçenekler için bkz. [QoreChain MCP sunucusu](/developer-tools/mcp). **Asgari örnek:** stdio bloğunu istemcinize yapıştırın, yeniden başlatın ve ondan en son bloğu isteyin.

## Nasıl erişilir {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) veya kenar çubuğu **Build** grubunda (ve mobil menüde) **Developers**.
- **Oturum açma:** sayfa ve araçları için yok. Barındırılan MCP uç noktası için bir API anahtarı talep etmek oturum açmayı gerektirir.
- **Ağ:** **Transaction inspector**, **PQ key status** ve **Simulator**, sekmedeki anahtar aracılığıyla mainnet veya testnet üzerinde çalışır (varsayılan testnet). **Signing playground** ve **QoreX test wallet** yalnızca testnet içindir. **SDKs** ve **AI agents (MCP)** bir ağa bağlı değildir.
- **Cüzdan:** yok. Araçlar kendi tek kullanımlık anahtarlarını üretir.
- **Maliyet:** ücretsiz. Zincire okuma sorguları ve simulate çağrıları dışında hiçbir şey gönderilmez.
- **Gizlilik:** tek kullanımlık anahtarlar yalnızca sayfanın belleğinde bulunur. Hiçbir araca gerçek bir kurtarma ifadesi yapıştırmayın.

## Nerede yayımlanır {#where-published}

| Yüzey | Adres | Ağlar |
| --- | --- | --- |
| Developers sayfası | `dashboard.qorechain.io/developers` | Mainnet ve testnet üzerinde okuma araçları; yalnızca testnet imzalama araçları |
| İmzalama kütüphanesi | npm `@qorechain/qoresign` (0.1.1 `inspectTransaction` ekler), PyPI Python için QoreSign, kaynak `github.com/qorechain/qoresign`, bkz. [QoreSign](/qoresign/overview) | yok |
| Test cüzdanı paketi | npm `@qorechain/qorex-wallet-mock`, kaynak `github.com/qorechain/qorex-integrations` | Testnet |
| Paket dizini | [Geliştirici Paketleri](/developer-tools/overview) | yok |
| MCP sunucusu | npm `@qorechain/mcp` 0.1.0 ve `@qorechain/qore-cli` 0.1.0, PyPI `qorechain-mcp` 0.1.0; kılavuz: [QoreChain MCP sunucusu](/developer-tools/mcp) | Varsayılan olarak testnet |

Paket sürümleri değişir; güncel olanları **SDKs** sekmesinde veya kayıt defterlerinde okuyun.

## Sınırlar ve bilinen sorunlar {#limits}

- **Inspector, şu an kayıtlı olan anahtara göre karar verir.** Bir anahtar döndürmesinden sonra eski bir işlem doğrulanmamış görünebilir. Yalnızca işlenmiş işlemleri okur.
- **Barındırılan MCP uç noktası bir API anahtarı gerektirir.** Bir tanesini dashboard'unuzdan talep edin (hesap başına bir etkin anahtar, saniyede 10 istek, günde 100.000); yerel kurulum anahtar gerektirmez. Çoğu iş için yerel kurulumu kullanın.
- **İki hızlı başlangıç "Not tested" olarak işaretlidir:** Android için QoreSign ve Android için QoreSeal (aynı kod JVM artefaktında çalıştırıldı, bir cihazda değil). Test edilen diğer hızlı başlangıçlar çalıştı ve geçti.
- **Simulator imzalı bayt gerektirir.** Sizin yerinize imzalayamaz ve asla yayınlamaz.
- **Playground ve test wallet yalnızca testnet içindir,** yeniden yüklemede kaybolan tek kullanımlık anahtarlar kullanır ve gerçek fon tutamaz veya taşıyamaz.
- **Aynı sekmedeki gerçek bir QoreX eklentisinin yerini** siz yeniden yükleyene kadar test wallet alır.
- **Okumalar Dashboard'un ağ geçidinden geçer.** Kendi kodunuzdan genel uç noktaları doğrudan çağırın: `api.qore.host` ve `api-testnet.qore.host`.
