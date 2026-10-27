---
slug: /developer-tools/overview
title: Geliştirici Paketleri
sidebar_label: Genel Bakış
sidebar_position: 1
---

# Geliştirici paketleri

QoreChain, geliştirici araçlarını genel kayıt defterlerinde (npm, PyPI, crates.io, Go modül proxy'si, Maven Central ve Swift Package Manager) küçük paketler olarak yayınlar. Bu sayfa dizindir: her paketin ne işe yaradığı, tam kayıt defteri adı, dili, güncel sürümü, kurulum komutu ve durumu ile nasıl kullanılacağını nerede okuyacağınız. QoreChain üzerinde dApp, cüzdan, arka uç ve rollup geliştiren ve bir kılavuzu okumadan önce doğru paketi seçmek isteyen geliştiriciler içindir.

Tablolardaki sürümler 27 Ekim 2026 tarihinde kayıt defterlerinden okunmuştur. Mainnet `qorechain-vladi` v3.2.4, testnet `qorechain-diana` ise v3.2.6 çalıştırır. Yayınlanmış olarak listelenen her paket Apache-2.0 lisanslıdır.

## Yenilikler {#innovations}

- **Her dilde tek bir hibrit imza biçimi.** Zincir, native ray işlemlerinde bir secp256k1 imzasının yanında bir ML-DSA-87 (FIPS 204) imzası ister. QoreSign, yayınlanmış test vektörlerini TypeScript, Rust, Go, Swift, Kotlin ve Python'da bayt bayt yeniden üretir; `qorechain-pqc` ise altı bağlamasında ortak bir vektör kümesi çalıştırır, böylece bir dilde üretilen anahtar veya imza diğerlerinde doğrulanır.
- **İmzalanacak bayt biçimi tahminle değil zincir durumuyla seçilir.** SDK, cüzdan adaptörü, `chain-bridge` ve QoreSign ağ yardımcıları, her iki yükseltme adı (`v3.2.0` ve `v3.1.98`) için düğüme `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` isteğini sorar ve bunlardan biri için yükseklik sıfırın üzerindeyse v2 biçimini imzalar. Bu iki zincirde bir REST uç noktası yoksa tahmin etmek yerine hata verirler. Her iki ağ da bugün v2'yi doğrular (27 Ekim 2026'da kontrol edildi: `v3.2.0` mainnet'te 2.981.742 yüksekliğinde, `v3.1.98` testnet'te 5.746.000 yüksekliğinde uygulandı).
- **Yalnızca yazılmış değil, çalıştırılmış hızlı başlangıçlar.** Hızlı başlangıcı olan paketler için örnek, 27 Ekim 2026'da genel kayıt defterinden kurulumdan sonra çalıştırıldı. 34 hızlı başlangıç girdisinden 31'i çalıştı ve geçti; bildirim dosyası hangi üçünün geçmediğini kaydeder ([Sınırlar](#limits) bölümüne bakın).
- **Tabloların arkasında tek bir bildirim dosyası.** Bu sayfadaki paket adları, sürümler ve kurulum komutları, her paket için canlı bir sürüm uç noktası bulunan tek bir makine tarafından okunabilir bildirim dosyasından gelir; [dashboard Geliştiriciler sayfasındaki](/dashboard/developers#sdks) SDK merkezi de aynı veriden oluşturulur.

## Nasıl kullanılır {#how-to-use}

Ne geliştirdiğinize göre seçin.

| Şunu yapmak istiyorsunuz | Kullanın | Okuyun |
|---|---|---|
| Zincir durumunu okumak, hesap türetmek, bir betikten veya dApp'ten hibrit imzalı işlemler göndermek | QoreChain SDK | [SDK genel bakış](/sdk/overview), [Kurulum](/sdk/install), [Hızlı başlangıç](/sdk/quickstart) |
| Kendi cüzdanınızda veya arka ucunuzda imzalamak, imzaları doğrulamak, Sign In With QoreChain | QoreSign | [QoreSign genel bakış](/qoresign/overview), [Hızlı başlangıç](/qoresign/quickstart) |
| QoreChain'i Keplr, Leap veya Cosmostation'a eklemek, birleşik cüzdanlar üretmek, EVM penceresi ve bağlı anahtar mesajları oluşturmak | Cüzdan adaptörü | [Cüzdan adaptörü](/developer-tools/wallet-adapter) |
| QOR gönderen, anahtar kaydeden veya sözleşme dağıtan bir sunucu işi çalıştırmak | Chain bridge (veya SDK) | [Chain bridge ve handle'lar](/developer-tools/chain-bridge) |
| Bir `@handle` değerini doğrulanmış bir adrese çözümlemek | Handle'lar | [Chain bridge ve handle'lar](/developer-tools/chain-bridge#handles) |
| dApp'inizin QoreX cüzdanını kullanmasını veya onu bir uzantı olmadan test etmesini sağlamak | QoreX entegrasyonları | [QoreX entegrasyonları](/developer-tools/qorex-integrations), [Geliştiriciler için QoreX](/qorex/overview#developers) |
| Bir uygulama rollup'ı oluşturmak ve işletmek | RDK | [Rollup'lara genel bakış](/rollups/overview), [Rollup dağıtma](/rollups/deploying-a-rollup) |
| Kuantum sonrası ilkelleri tek başına kullanmak (ML-DSA, ML-KEM, SHAKE-256) | `qorechain-pqc` | [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing) |
| Bir yapay zeka ajanının veya geliştirici aracının zinciri okumasını sağlamak (bloklar, işlemler, hesaplar, hibrit imza durumu, simülasyon, imzasız transferler) | QoreChain MCP sunucusu | [QoreChain MCP sunucusu](/developer-tools/mcp) |
| Zinciri bir terminalden veya bir kabuk betiğinden JSON çıktısıyla okumak | `qore` CLI | [QoreChain CLI](/developer-tools/qore-cli) |
| Kaydedilmiş bir işlemin nasıl korunduğunu geri okumak (mesajlar, imzalayan, ücret, ML-DSA-87 katmanı, kademe) | QoreSign işlem denetçisi (`inspectTransaction`) | [QoreSign genel bakış](/qoresign/overview#inspector) |
| Verileri ML-KEM-1024 ile QoreChain hesaplarına, özel gruplara veya yan zincirlere şifrelemek | QoreSeal | [QoreSeal](/developer-tools/qoreseal) |
| Kuantum sonrası bir hafif istemci tasarımını (kontrol noktası doğrulaması) incelemek veya test etmek | PQ hafif istemci | [PQ hafif istemci](/developer-tools/pq-light-client) |
| QoreChain'i saklama kuruluşu veya borsa olarak entegre etmek (adres kontrolleri, çekim doğrulaması, para yatırma kaydı) | Saklama kiti | [Saklama kiti](/developer-tools/custody-kit) |
| Bir düğümün, bir ağın veya Solidity kaynaklarının kriptografisini CycloneDX CBOM olarak envantere almak | QoreScan | [QoreScan](/developer-tools/qorescan) |
| QoreChain üzerinde Foundry, Hardhat veya viem ile Solidity ya da CosmWasm projeleri geliştirmek ve test etmek | Zincir geliştirici kiti (SDK 0.11.0, yakında) | [Zincir geliştirici kiti](/developer-tools/chain-dev-sdk) |

Bir paket kurun ve önce hızlı başlangıcını genel testnet üzerinde çalıştırın. Okumalar için hesap, anahtar veya ücret gerekmez.

## Nasıl erişilir {#how-to-access}

| | Testnet | Mainnet |
|---|---|---|
| Zincir kimliği | `qorechain-diana` | `qorechain-vladi` |
| EVM zincir kimliği | 9800 | 9801 |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| Konsensüs RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| SVM JSON-RPC | `https://svm-testnet.qore.host` | `https://svm.qore.host` |

- **Hesap ve anahtarlar:** okumalar için gerekmez. Göndermek için QOR bulunan bir hesaba (testnet QOR'u [Faucet](/dashboard/faucet) üzerinden gelir) ve native rayda bu hesap için kayıtlı bir ML-DSA-87 anahtarına ihtiyacınız vardır.
- **Maliyet:** paketler ücretsizdir. İşlemler ağ ücretini öder; ücret alt sınırı gaz başına 0,1 uqor'dur.
- **İmza kuralları:** bir native ray işlemi hibrit (secp256k1 artı ML-DSA-87) imza taşımalıdır. Bir EVM işlemi yalnızca kayıtlı bir ML-DSA-87 anahtarı ve açık bir EVM yetkilendirme penceresi olan bir hesaptan kabul edilir. SVM okumaları çalışır, SVM işlemleri henüz açık değildir. Bkz. [Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc).
- **Hızlı başlangıç kuralları:** örnekler genel testnet faucet hesabını okur ve genel test ifadesiyle (`abandon` on bir kez, ardından `about`) imzalar. Bu ifadeden türetilen bir hesabı asla fonlamayın. Hiçbir hızlı başlangıç işlem göndermez.

### Dashboard geliştirici sayfası {#dashboard-developers}

Dashboard'un [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) adresinde herkese açık bir sayfası vardır. 27 Ekim 2026'da kontrol edildiğinde yedi sekmesi vardır (tam anlatım: [Geliştiriciler](/dashboard/developers)):

- **SDKs:** SDK merkezi. Bildirim dosyasındaki her paket, ürüne göre gruplanmış olarak; dil seçici, her kayıt defterinden canlı okunan en son sürüm, kopyalama düğmeli kurulum ve içe aktarma satırları, SDK ekibinin gözlemlediği çıktıyla hızlı başlangıç, bilinen sorunlar ile zincir kimlikleri ve genel uç noktalar. Yayınlanmamış paketler için kurulum komutu gösterilmez.
- **Transaction inspector:** testnet veya mainnet üzerinde 64 onaltılık karakterlik bir işlem karması yapıştırın; durumu, imzalayanı, ücreti, kuantum sonrası katmanın doğrulanıp doğrulanmadığını ve güvenlik katmanını (PQC, Enrollment, SHAKE veya Classical) görün. QoreSign 0.1.1 işlevi `inspectTransaction` kullanılır: bkz. [İşlem denetçisi](/qoresign/overview#inspector).
- **PQ key status:** bir adresin zincirde kayıtlı ML-DSA-87 anahtarını ve EVM yetkilendirme penceresini testnet veya mainnet üzerinde okur.
- **Simulator:** imzalı bir işlemi (base64 veya hex `TxRaw`) deneme olarak çalıştırır ve gaz kullanımını ile bakiye değişikliklerini gösterir. Hiçbir şey yayınlanmaz.
- **Signing playground:** yalnızca testnet. Tarayıcıda, bellekte tutulan geçici bir hibrit anahtar üretir; mesajları ve Sign In With QoreChain isteklerini imzalamak ve doğrulamak için kullanılır.
- **QoreX test wallet:** yalnızca testnet. dApp akışlarını deneyebilmeniz için sekmeye bir test cüzdanı (`window.qorex`, EIP-6963 üzerinden "QoreX (mock)" olarak duyurulur) ekler.
- **AI agents (MCP):** QoreChain MCP sunucusunun durumu (yayımlandı) ve bir MCP istemcisi için kurulum: önce yerel `npx`, ayrıca bir API anahtarı gerektiren barındırılan bir testnet uç noktası. Bkz. [QoreChain MCP sunucusu](/developer-tools/mcp).

Aynı denetçi kontrolü kodda, QoreSign 0.1.1'de (TypeScript) `inspectTransaction` kütüphane işlevi olarak da mevcuttur. Aşağıdaki tablolar ve SDK merkezi aynı paket verisini gösterir; tablolar 27 Ekim 2026'da kayıt defterlerine karşı kontrol edilmiştir.

## Nerede yayınlanıyor {#where-published}

Her ad, tam kayıt defteri adıdır. Paketteki bağlantı kayıt defteri sayfasını açar. "Published" (Yayınlandı), gösterilen sürümün bugün kurulabilir olduğu anlamına gelir.

### QoreChain SDK {#group-sdk}

Kılavuzlar: [SDK genel bakış](/sdk/overview), [Kurulum](/sdk/install), [React kılavuzu](/sdk/guides/react), [CLI başvurusu](/sdk/reference/cli). Kaynak: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk).

| Paket | Dil | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| [`@qorechain/sdk`](https://www.npmjs.com/package/@qorechain/sdk) | TypeScript | 0.10.0 | `npm install @qorechain/sdk` | Yayınlandı |
| [`@qorechain/react`](https://www.npmjs.com/package/@qorechain/react) | TypeScript (React) | 0.10.0 | `npm install @qorechain/react @qorechain/sdk react react-dom` | Yayınlandı. Provider, hook'lar, `ConnectButton` ve PQC durum rozeti (0.10.0'da `QuantumSafeBadge` olarak dışa aktarılır) |
| [`@qorechain/evm`](https://www.npmjs.com/package/@qorechain/evm) | TypeScript | 0.8.0 | `npm install @qorechain/evm viem` | Yayınlandı |
| [`@qorechain/svm`](https://www.npmjs.com/package/@qorechain/svm) | TypeScript | 0.8.0 | `npm install @qorechain/svm @solana/web3.js` | Yayınlandı. Canlı ağlarda yalnızca okuma |
| [`create-qorechain-dapp`](https://www.npmjs.com/package/create-qorechain-dapp) | TypeScript (CLI) | 0.10.0 | `npx create-qorechain-dapp my-dapp` | Yayınlandı |
| [`qorechain-sdk`](https://pypi.org/project/qorechain-sdk/) | Python | 0.10.0 | `pip install qorechain-sdk` | Yayınlandı |
| [`qorechain-sdk`](https://crates.io/crates/qorechain-sdk) | Rust | 0.10.0 | `cargo add qorechain-sdk tokio --features tokio/macros,tokio/rt-multi-thread` | Yayınlandı |
| [`github.com/qorechain/qorechain-sdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) | Go | v0.10.0 | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | Yayınlandı |
| [`io.github.qorechain:qorechain-sdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk) | Java | 0.10.0 | `implementation("io.github.qorechain:qorechain-sdk:0.10.0")` | Yayınlandı |

### QoreSign {#group-qoresign}

Kılavuzlar: [QoreSign genel bakış](/qoresign/overview), [Hızlı başlangıç](/qoresign/quickstart), [Test vektörleri](/qoresign/vectors). Kaynak: [qorechain/qoresign](https://github.com/qorechain/qoresign). 0.1.1 sürümü 27 Ekim 2026'da yayınlandı. QoreSign yerel olarak imzalar; sizin için anahtar tutmaz ve eşik (threshold), MPC veya donanım cüzdanı imzalaması yapmaz.

| Paket | Dil | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | TypeScript | 0.1.1 | `npm install @qorechain/qoresign` | Yayınlandı. `inspectTransaction` ve `fetchEvmWindow` içerir (0.1.1'de yeni) |
| [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | Rust (`qoresign` olarak içe aktarılır) | 0.1.1 | `cargo add qorechain-qoresign` | Yayınlandı |
| [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | Go | v0.1.1 | `go get github.com/qorechain/qoresign/go@v0.1.1` | Yayınlandı |
| [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) | Python 3.9+ (`qoresign` olarak içe aktarılır) | 0.1.1 | `pip install qorechain-qoresign` | Yayınlandı, 0.1.1'de yeni. macOS (arm64, x86_64) ve Linux (x86_64, aarch64) için wheel'ler; henüz Windows wheel'i yok. Yalnızca çevrimdışı işlevler |
| `QoreSign` (Swift paketi) | Swift (iOS 16+, macOS 13+) | 0.1.1 | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, ürün `QoreSign` | Bir GitHub sürümü olarak yayınlandı; ikili framework buradan indirilir |
| [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign:0.1.1")` | Yayınlandı |
| [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | Yayınlandı. JVM yapıtıyla aynı API; örneği yalnızca JVM yapıtı üzerinde çalıştırıldı, bir Android cihazda çalıştırılmadı |

Kotlin ve Android yapıtları projenizde Kotlin 2.3 veya daha yeni derleyiciyi gerektirir; Kotlin 2.1 kullanan bir proje bunlara karşı derlenemez.

TypeScript paketinde bir `@qorechain/qoresign/network` alt yolu vardır ve Go modülünde `inspectTransaction` ve `fetchEvmWindow` dışında aynı yardımcılar bulunur: `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx` (bakiye değişiklikleriyle), `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback` (bir kez geri dönüş yapar, ardından durur), `verifySiwqWithChain` ve `verifyMessageWithChain`. Rust, Swift, Kotlin ve Python paketlerinde ağ kodu yoktur.

### QoreSeal {#group-qoreseal}

Sayfa: [QoreSeal](/developer-tools/qoreseal). Kaynak: [qorechain/qoreseal](https://github.com/qorechain/qoreseal). QoreSeal 0.1.0, verileri ML-KEM-1024 (FIPS 203) ile QoreChain hesaplarına, özel gruplara ve yan zincirlere şifreler. Şifreleme çevrimdışı çalışır; bir alıcının anahtarını zincirden okumak, testnet'te canlı olan ve mainnet'e v3.2.5 yükseltmesinden sonra gelecek olan KEM anahtar kayıt defterini gerektirir. Yapı, 1.0 öncesinde harici bir incelemeyi beklemektedir.

| Paket | Dil | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| [`qorechain-qoreseal`](https://crates.io/crates/qorechain-qoreseal) | Rust (`qoreseal` olarak içe aktarılır) | 0.1.0 | `cargo add qorechain-qoreseal` | Yayınlandı |
| [`github.com/qorechain/qoreseal/go`](https://pkg.go.dev/github.com/qorechain/qoreseal/go) | Go | v0.1.0 | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Yayınlandı |
| [`qorechain-qoreseal`](https://pypi.org/project/qorechain-qoreseal/) | Python 3.9+ (`qoreseal` olarak içe aktarılır) | 0.1.0 | `pip install qorechain-qoreseal` | Yayınlandı. macOS (arm64, x86_64) ve Linux (x86_64, aarch64) için wheel'ler; henüz Windows wheel'i yok |
| `QoreSeal` (Swift paketi) | Swift (iOS 16+, macOS 13+) | 0.1.0 | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, ürün `QoreSeal` | Bir GitHub sürümü olarak yayınlandı; ikili framework buradan indirilir |
| [`io.github.qorechain:qoreseal`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Maven Central'da yayınlandı |
| [`io.github.qorechain:qoreseal-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | Maven Central'da yayınlandı |
| `@qorechain/qoreseal` | TypeScript | henüz yok | yok | npm'de **yayınlanmadı** (27 Ekim 2026'da 404). Kaynak depodadır |

### PQ hafif istemci {#group-pq-light-client}

Sayfa: [PQ hafif istemci](/developer-tools/pq-light-client). Kaynak: [qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client). ML-DSA-87 ile imzalanmış kontrol noktaları için bir taslak şartname ve referans doğrulayıcılar. Mainnet'e veya testnet'e bağlanmaz: QoreChain doğruladığı kontrol noktalarını üretmez ve planlanmış bir zincir desteği yoktur. Simüle edilmiş doğrulayıcı kümeleri ve ortak test vektörleri üzerinde çalışır.

| Paket | Dil | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| [`@qorechain/pq-light-client`](https://www.npmjs.com/package/@qorechain/pq-light-client) | TypeScript | 0.1.0 | `npm install @qorechain/pq-light-client` | Yayınlandı. `@qorechain/pqc` 0.2.3'e bağlıdır |
| [`qorechain-pq-light-client`](https://crates.io/crates/qorechain-pq-light-client) | Rust (kütüphane `qorechain_pq_light_client`) | 0.1.0 | `cargo add qorechain-pq-light-client` | Yayınlandı |
| [`github.com/qorechain/qorechain-pq-light-client/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) | Go (paket `pqlightclient`) | v0.1.0 | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` | Yayınlandı |

### Saklama kiti {#group-custody-kit}

Sayfa: [Saklama kiti](/developer-tools/custody-kit). Kaynak: [qorechain/qorechain-custody-kit](https://github.com/qorechain/qorechain-custody-kit). Saklama kuruluşları ve borsalar için TypeScript, Python, Go, Rust ve Java dillerinde bir entegrasyon kılavuzu, referans kod ve test vektörleri. Bir paket kümesi değil, okunacak, kopyalanacak veya projeye eklenecek referans koddur: kayıt defterindeki tek girdi Go modülüdür.

| Paket | Dil | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| GitHub sürümü `v0.1.0` | TypeScript, Python, Go, Rust, Java | 0.1.0 | `git clone https://github.com/qorechain/qorechain-custody-kit`, ardından dilinize ait klasörü derleyin | Yayınlandı, 27 Ekim 2026. Tasarım gereği npm, PyPI, crates.io veya Maven paketi yok |
| [`github.com/qorechain/qorechain-custody-kit/code/go`](https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go) | Go (paket `custodykit`) | v0.1.0 | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` | Yayınlandı |

### QoreScan {#group-qorescan}

Sayfa: [QoreScan](/developer-tools/qorescan). Kaynak: [qorechain/qorescan](https://github.com/qorechain/qorescan). QoreScan Community 0.1.0, bir QoreChain dağıtımının kriptografisini (bir düğüm ana dizini, canlı ağ durumu, TLS uç noktaları ve Solidity kaynakları) envantere alır ve bir CycloneDX 1.6 CBOM ile Markdown raporları yazar. Bir envanter yardımcısıdır; sertifikasyon veya denetim değildir.

| Paket | Dil | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| [GitHub sürümü `v0.1.0`](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) | macOS, Linux ve Windows için ikili dosyalar (amd64, arm64) | 0.1.0 | indirin ve `qorescan_0.1.0_checksums.txt` ile karşılaştırarak kontrol edin | Yayınlandı, 27 Ekim 2026 |
| [`@qorechain/qorescan`](https://www.npmjs.com/package/@qorechain/qorescan) | npm sarmalayıcısı (Node.js 18+) | 0.1.0 | `npx @qorechain/qorescan scan ...` | Yayınlandı. İlk çalıştırmada sürüm ikili dosyasını indirir ve kontrol eder |
| [`qorescan`](https://pypi.org/project/qorescan/) | PyPI sarmalayıcısı (Python 3.9+) | 0.1.0 | `pipx run qorescan scan ...` veya `pip install qorescan` | Yayınlandı. npm sarmalayıcısıyla aynı davranış |
| [`github.com/qorechain/qorescan`](https://pkg.go.dev/github.com/qorechain/qorescan) | Go | v0.1.0 | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Yayınlandı. Go 1.26 |

### Zincir geliştirici kiti (SDK 0.11.0) {#group-chain-dev-sdk}

Sayfa: [Zincir geliştirici kiti](/developer-tools/chain-dev-sdk). Kaynak: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk). QoreChain SDK 0.11.0'ın Solidity ve akıllı sözleşme ekiplerine yönelik bölümü: `@qorechain/evm` içinde viem zincir tanımları ve EVM yetkilendirme penceresi yardımcıları, dört yeni `create-qorechain-dapp` şablonu (Foundry, Hardhat 3, wagmi'li viem ve bir QoreChain Native token'ı), EVM hızlı başlangıçları ve QoreChain EVM'in Ethereum'dan nasıl farklılaştığını anlatan bir sayfa.

**Yakında.** SDK 0.11.0 GitHub'da etiketlenmiştir (`v0.11.0`) ve npm sürümü beklemektedir: 27 Ekim 2026'da npm `@qorechain/sdk` 0.10.0, `@qorechain/evm` 0.8.0 ve `create-qorechain-dapp` 0.10.0 sürümlerini sunuyordu ve `@qorechain/sdk@0.11.0` 404 döndürdü. npm 0.11.0'ı gösterene kadar yeni zincir tanımları, pencere yardımcıları ve şablonlar kurulamaz; bugün elinize geçen, [SDK tablosundaki](#group-sdk) 0.10.0 paketleridir. 0.11.0 yalnızca npm paketlerini değiştirir: Python, Rust, Go ve Java SDK'ları 0.10.0'da kalır.

### Rollup Development Kit (RDK) {#group-rdk}

Kılavuzlar: [Rollup'lara genel bakış](/rollups/overview), [Rollup dağıtma](/rollups/deploying-a-rollup), [Rollup Development Kit mimarisi](/architecture/rollup-development-kit). Kaynak: [qorechain/qorechain-rdk](https://github.com/qorechain/qorechain-rdk).

| Paket | Dil | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| [`@qorechain/rdk`](https://www.npmjs.com/package/@qorechain/rdk) | TypeScript | 0.7.0 | `npm install @qorechain/rdk` | Yayınlandı. Hibrit imzalayan tek RDK istemcisi ve yalnızca bir `pqcKeypair` verdiğinizde |
| [`@qorechain/rdk-cli`](https://www.npmjs.com/package/@qorechain/rdk-cli) | TypeScript (CLI `qorollup`) | 0.7.0 | `npm install -g @qorechain/rdk-cli` | Yayınlandı. 0.6.2'den beri npm bin bağlantısı üzerinden başlar (0.6.1 ve öncesi hiçbir şey yazdırmıyordu). İşlem komutları yalnızca klasik imzalar, ki ağlar bunu reddeder |
| [`create-qorechain-rollup`](https://www.npmjs.com/package/create-qorechain-rollup) | TypeScript (CLI) | 0.7.0 | `npx create-qorechain-rollup my-rollup` | Yayınlandı |
| [`qorechain-rdk`](https://pypi.org/project/qorechain-rdk/) | Python (3.10+, `qorrdk` olarak içe aktarılır) | 0.7.0 | `pip install qorechain-rdk` | Yayınlandı. Okumalar çalışır; işlemler yalnızca klasik imzalar |
| [`qorechain-rdk`](https://crates.io/crates/qorechain-rdk) | Rust | 0.7.0 | `cargo add qorechain-rdk` | Yayınlandı. Okumalar çalışır; işlemler yalnızca klasik imzalar |
| [`github.com/qorechain/qorechain-rdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-rdk/packages/go) | Go | v0.7.0 | `go get github.com/qorechain/qorechain-rdk/packages/go@v0.7.0` | Yayınlandı. Okumalar çalışır; işlemler yalnızca klasik imzalar |
| [`io.github.qorechain:qorechain-rdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-rdk) | Java (JDK 17+) | 0.7.0 | `implementation("io.github.qorechain:qorechain-rdk:0.7.0")` | Yayınlandı. Okumalar çalışır; işlemler yalnızca klasik imzalar |

### Kuantum sonrası ilkeller (`qorechain-pqc`) {#group-pqc}

Kılavuz: [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing). Kaynak: [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc). ML-DSA imzalama tüm bağlamalarda varsayılan olarak deterministiktir; hedged imzalama açıkça etkinleştirilmesi gereken bir seçenektir.

| Paket | Dil | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| [`@qorechain/pqc`](https://www.npmjs.com/package/@qorechain/pqc) | TypeScript | 0.2.3 | `npm install @qorechain/pqc` | Yayınlandı |
| [`qorechain-pqc`](https://pypi.org/project/qorechain-pqc/) | Python (3.9+) | 0.2.3 | `pip install qorechain-pqc` | Yayınlandı. liboqs gerekir; eksikse ilk içe aktarma onu derler (git, CMake ve bir C derleyicisi) |
| [`qorechain-pqc`](https://crates.io/crates/qorechain-pqc) | Rust | 0.2.3 | `cargo add qorechain-pqc` | Yayınlandı |
| [`github.com/qorechain/qorechain-pqc/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go) | Go | v0.2.3 | `go get github.com/qorechain/qorechain-pqc/go` | Yayınlandı |
| [`io.github.qorechain:qorechain-pqc`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc) | Java | 0.2.3 | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | Yayınlandı |
| C kütüphanesi | C | 0.2.3 | depodan `c/` dizinini derleyin (liboqs ve OpenSSL gerekir) | Yalnızca kaynak, paket kayıt defteri yok |

### Cüzdan adaptörü {#group-wallet-adapter}

Sayfa: [Cüzdan adaptörü](/developer-tools/wallet-adapter). Kaynak: [qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter).

| Paket | Dil | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| [`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter) | TypeScript (ES modülü, tür tanımlı düz JavaScript) | 0.4.0 | `npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing` | Yayınlandı. Test edilmiş hızlı başlangıç yok |

### Chain bridge {#group-chain-bridge}

Sayfa: [Chain bridge ve handle'lar](/developer-tools/chain-bridge).

| Paket | Dil | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| [`@qorechain/chain-bridge`](https://www.npmjs.com/package/@qorechain/chain-bridge) | TypeScript (Node.js sunucusu) | 0.2.3 | `npm install @qorechain/chain-bridge` | Yayınlandı. Test edilmiş hızlı başlangıç yok. Kayıt defteri hiçbir kaynak deposu listelemiyor |

### Handle'lar {#group-handles}

Sayfa: [Chain bridge ve handle'lar](/developer-tools/chain-bridge#handles).

| Paket | Dil | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| [`@qorechain/handles`](https://www.npmjs.com/package/@qorechain/handles) | TypeScript | 0.1.0 | `npm install @qorechain/handles` | Yayınlandı. Bir handle çözümlemesini sabitlenmiş bir kayıt defteri anahtarına karşı doğrular. Adresleri kendisi sabitlemez: sabitleme deposunu çağıran sağlar ve ne zaman sabitleneceğine o karar verir. Test edilmiş hızlı başlangıç yok. Kayıt defteri hiçbir kaynak deposu listelemiyor |

### QoreX entegrasyonları {#group-qorex}

Kılavuz: [Geliştiriciler için QoreX](/qorex/overview#developers). Kaynak: [qorechain/qorex-integrations](https://github.com/qorechain/qorex-integrations). Altısı da 27 Ekim 2026'da yayınlandı.

| Paket | Dil | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| [`@qorechain/qorex-types`](https://www.npmjs.com/package/@qorechain/qorex-types) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-types` | Yayınlandı. QoreX'i bulur (EIP-6963 ve native provider) |
| [`@qorechain/qorex-rainbowkit`](https://www.npmjs.com/package/@qorechain/qorex-rainbowkit) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query` | Yayınlandı |
| [`@qorechain/qorex-interchain-kit`](https://www.npmjs.com/package/@qorechain/qorex-interchain-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react` | Yayınlandı |
| [`@qorechain/qorex-cosmos-kit`](https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react` | Yayınlandı. `@cosmos-kit/react` 2.24 ile `throwErrors={false}` verin; README parçacığı bunu içermiyor |
| [`@qorechain/qorex-wallet-mock`](https://www.npmjs.com/package/@qorechain/qorex-wallet-mock) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-wallet-mock` | Yayınlandı. Testnet üzerinde gerçekten imzalayan bir test cüzdanı |
| [`@qorechain/qorex-synpress`](https://www.npmjs.com/package/@qorechain/qorex-synpress) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-synpress @playwright/test` | Yayınlandı. Playwright fixture'ları; uzantı modu bugün hata verir |

### Connect (kullanımdan kaldırıldı) {#group-connect}

| Paket | Dil | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| [`@qorechain/connect`](https://www.npmjs.com/package/@qorechain/connect) | TypeScript | 0.2.1 | yok | **Kullanımdan kaldırıldı ve artık bakımı yapılmıyor.** Yeni işlerde kullanmayın. Aşağıdaki tabloda gösterildiği gibi değiştirin |

:::caution @qorechain/connect kullanımdan kaldırıldı
`@qorechain/connect`, npm üzerinde kullanımdan kaldırıldı olarak işaretlidir. Peer aralığı, 0.4.0'ı içermeyen `@qorechain/wallet-adapter` `^0.2.1` aralığıdır ve bir [EVM yetkilendirme penceresi](/sdk/guides/evm#evm-window) açmaz; bu yüzden hesap kayıtlı bir anahtara ve açık bir pencereye sahip olana kadar bunun üzerinden yapılan bir EVM gönderimi reddedilir. Kayıt defteri meta verisinde listelenen depoya herkese açık olarak erişilemiyor.
:::

| İhtiyaç | Bunun yerine kullanın |
|---|---|
| QoreX'i algılamak (EVM, native, Solana) | `@qorechain/qorex-types` |
| RainbowKit ve wagmi ile EVM dApp'leri | `@qorechain/qorex-rainbowkit` |
| Cosmos dApp'leri | `@qorechain/qorex-interchain-kit` (veya `@qorechain/qorex-cosmos-kit`) |
| Kendi cüzdanınızda veya arka ucunuzda hibrit imzalama | `@qorechain/qoresign` |

### QORel, IBC relayer'ı {#group-qorel}

| Paket | Nerede | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| QORel (`qorel`) | GitHub sürümü `qorel-v0.1.0`, Homebrew, konteyner `ghcr.io/qorechain/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` | Ön sürüm olarak yayımlandı. Yalnızca IBC v1; yalnızca testnet. Bkz. [QORel](/qorel/overview) |

### MCP sunucusu ve CLI {#group-mcp}

Sayfalar: [QoreChain MCP sunucusu](/developer-tools/mcp), [QoreChain CLI](/developer-tools/qore-cli). Kaynak: [qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (herkese açık). İkisi de zinciri okur; hiçbiri imzalamaz, anahtar tutmaz veya yayınlamaz. 27 Ekim 2026'da yayımlandı.

| Paket | Dil | Sürüm | Kurulum | Durum |
|---|---|---|---|---|
| [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | TypeScript (Node.js sunucusu, bin `qorechain-mcp`) | 0.1.0 | `npx -y @qorechain/mcp` | Yayımlandı. stdio ve Streamable HTTP. Barındırılan bir uç nokta olan `https://mcp.qorechain.io/mcp` bir API anahtarı gerektirir, dashboard'unuzdan talep edilir |
| [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | Python (3.10+) | 0.1.0 | `pip install qorechain-mcp` (veya `uvx qorechain-mcp`) | Yayımlandı. npm paketiyle aynı araçlar; yalnızca stdio |
| [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | TypeScript (CLI `qore`) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Yayımlandı. `--json` çıktısı MCP araç çıktısıyla aynıdır |

### Planlanan (yayınlanmadı) {#planned}

Bunlar henüz kayıt defterlerinde bulunmuyor; dolayısıyla kurulacak bir şey yoktur ve onlar için anlatılan davranış henüz kullanılamaz. Her biri 27 Ekim 2026'da 404 döndürdü (veya listelenmiyordu).

| Paket | Amaçlanan kullanım | Durum |
|---|---|---|
| npm üzerinde `@qorechain/qoreseal` | TypeScript için QoreSeal | Yayınlanmadı; kaynak depodadır |
| npm üzerinde `@qorechain/sdk`, `@qorechain/evm`, `@qorechain/react`, `@qorechain/svm`, `create-qorechain-dapp` 0.11.0 | [Zincir geliştirici kiti](/developer-tools/chain-dev-sdk) | GitHub'da etiketlendi, npm sürümü beklemede |

## Canlı sürümler nasıl alınır {#live-versions}

Tablolar bir anlık görüntüdür. Bir paketin güncel sürümünü kendiniz okumak için:

| Kayıt defteri | İstek | Alan |
|---|---|---|
| npm | `https://registry.npmjs.org/<name>/latest` | `version` |
| PyPI | `https://pypi.org/pypi/<name>/json` | `info.version` |
| crates.io | `https://crates.io/api/v1/crates/<name>` (bir `User-Agent` başlığı gönderin, aksi halde istek reddedilir) | `crate.max_stable_version` |
| Go | `https://proxy.golang.org/<module>/@latest` | `Version` (baştaki `v` harfini kaldırın) |
| Maven Central | `https://repo1.maven.org/maven2/<group path>/<artifact>/maven-metadata.xml` | `<release>` |
| Swift | `https://api.github.com/repos/qorechain/qoresign/releases/latest` | `tag_name` (baştaki `v` harfini kaldırın); kimliği doğrulanmamış GitHub çağrıları adres başına saatte 60 ile sınırlıdır |

Kapsamlı (scoped) bir npm adı için `@` işaretini koruyun, örneğin `https://registry.npmjs.org/@qorechain/sdk/latest`. 404, paketin yayınlanmadığı anlamına gelir. Go proxy'si, bir sürümden sonra kısa bir süre `@latest` isteğini önbellekten yanıtlayabilir; bu nedenle belirli bir sürüme ihtiyaç duyduğunuzda komutta sürümü sabitleyin (yukarıdaki RDK Go kurulumu bunu yapar). Kayıt defterindeki her paket sayfası da sürümü ve sürüm geçmişini gösterir.

## Sınırlar ve bilinen sorunlar {#limits}

- **İki canlı ağ, farklı sürümler.** Mainnet v3.2.4, testnet v3.2.6 çalıştırır. Yalnızca testnet'te bulunan bir özellik kendi sayfasında işaretlenir. Mainnet'te v3.2.5 davranışını varsaymayın.
- **Henüz canlı değil:** npm üzerinde `@qorechain/qoreseal`, npm üzerinde SDK 0.11.0 (zincir geliştirici kiti), SVM işlemleri ve mainnet üzerindeki EVM precompile'ları (yalnızca testnet'te etkindir; ray ray liste için [SDK genel bakış](/sdk/overview) sayfasına bakın).
- **QoreSeal kayıt defteri ve PQ hafif istemci.** Zincirden okunan bir adrese şifrelemek, testnet'te canlı olan ve v3.2.5 sonrasında mainnet'e gelecek olan KEM anahtar kayıt defterini gerektirir. PQ hafif istemci iki ağdan hiçbirine bağlanmaz; kontrol noktaları için planlanmış bir zincir desteği yoktur.
- **Kotlin 2.3 veya daha yeni.** QoreSign ve QoreSeal Kotlin ile Android yapıtları Kotlin 2.3 veya daha yeni derleyiciyi gerektirir; Kotlin 2.1 bunlara karşı derlenemez.
- **Windows wheel'i yok.** QoreSign ve QoreSeal Python paketlerinin yalnızca macOS ve Linux için wheel'leri vardır; diğer platformlar, Rust gerektiren kaynak dağıtımından derlenir.
- **Çalıştırılmayan örnekler:** 34 hızlı başlangıç girdisinden 31'i 27 Ekim 2026'da çalıştı ve geçti. QoreSign Python örneği paket yayınlandıktan sonra çalıştırıldı (macOS arm64 ve Linux aarch64) ve QoreSign Android örneği bir cihazda çalıştırılmadı. Cüzdan adaptörü, chain bridge ve handle'ların hızlı başlangıcı yoktur; bu nedenle bu kılavuzdaki örnekleri paket tür tanımlarından ve kaynaktan gelir ve uçtan uca çalıştırılmamıştır.
- **0.6.2 öncesi `@qorechain/rdk-cli`,** npm bin bağlantısı üzerinden başlatıldığında hiçbir şey yazdırmadı ve `--version` çıktısı 0.4.1 idi. **0.7.0 öncesi `@qorechain/rdk`** zincirde hiç doğrulanmayan çekim kanıtları üretiyordu. 0.7.0 kullanın.
- **cosmjs sürüm çakışması.** `@qorechain/wallet-adapter` ve `@qorechain/chain-bridge` cosmjs 0.32 kullanır; SDK cosmjs 0.39 kullanır. Adaptörü SDK'nın yanına aynı projeye kurmak npm'in `ERESOLVE` bildirmesine yol açar. Bunları ayrı projelerde tutun veya `--legacy-peer-deps` geçirin.
- **Eski RDK sürümlerinde iç içe SDK kopyası.** `@qorechain/rdk` 0.6.2 ve öncesi `@qorechain/sdk` `^0.9.0` sürümüne bağlıdır; bu yüzden SDK 0.10.0 kullanan bir uygulama ikinci, iç içe bir SDK 0.9.x kopyası aldı. 0.7.0'dan itibaren kit `@qorechain/sdk` `^0.10.0` sürümüne bağlıdır ve tek bir kopyayı paylaşır.
- **Yalnızca klasik imzalayan RDK istemcileri.** Python, Rust, Go ve Java RDK istemcileri yalnızca klasik imzalar, ki native ray bunu her iki ağda da reddeder; bunları okumalar için kullanın veya işlemler için TypeScript istemcisini bir `pqcKeypair` ile kullanın.
- **Herkese açık kaynak deposu olmayan paketler.** `@qorechain/chain-bridge` ve `@qorechain/handles`, kayıt defteri meta verisinde bir kaynak deposu listelemez. Yayınlanmış paket içeriğini npm üzerinde okuyabilirsiniz.
- **Python `qorechain-pqc`,** 0.2.3 sürümünde tohumlu anahtar üretimine sahip değildir ve liboqs gerektirir.
