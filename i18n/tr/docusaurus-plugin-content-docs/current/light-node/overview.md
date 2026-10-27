---
slug: /light-node/overview
title: Hafif Düğüme Genel Bakış
sidebar_label: Genel Bakış
sidebar_position: 1
---

# Hafif Düğüme Genel Bakış

**QoreChain Hafif Düğümü (Light Node)**, tam bir düğüm çalıştırmadan bir QoreChain ağını takip eden ve **%3 hafif düğüm ödül payına** katılmak için zincir üzerinde hafif düğüm olarak kaydolabilen küçük bir istemcidir. Zinciri düşük maliyetle takip etmek ve bu paydan kazanmak isteyen operatörler ile zincirin en son blok karması hakkında tek bir RPC sunucusuna güvenmeden ikinci bir görüş almak isteyen kişiler içindir. Aynı koddan inşa edilmiş iki sürümü olan tek, kendi kendine yeten bir ikili dosyadır: **SX** (`lightnode-sx`, sunucular için komut satırlı başsız bir daemon) ve **UX** (`lightnode-ux`, aynı daemon artı `127.0.0.1:8420` üzerinde yerel bir web panosu). Apache 2.0 lisansı altında yayınlanmıştır ve kaynak kodu `github.com/qorechain/qorechain-lightnode` adresinde herkese açıktır.

Bir düğümü çalıştırmak ve senkronize etmek lisans gerektirmez. Ödül payına katılmak ayrı bir adımdır: bir `lightnode_operator` lisansı, bağlı doğrulayıcılara delege edilmiş stake ve bir zincir üzeri kayıt gerekir ([Nasıl erişilir](#how-to-access) bölümüne bakın).

Hafif düğümün zincir sürümünden ayrı, **kendine ait bir sürüm hattı** vardır. Yazının hazırlandığı sırada (27 Ekim 2026) her iki ağın sürüm kanalı da hafif düğüm **3.1.12** sürümünü taşır (ana ağda zincir `v3.2.4`, test ağında `v3.2.6`). İki numarayı birbiriyle ilgisiz kabul edin.

## Yenilikler {#innovations}

Aşağıdaki her madde, kaynakta veya düğümü çalıştırarak kontrol edebileceğiniz bir mekanizmadır.

- **Yerel hibrit imzalama, başka yazılım yok.** Düğüm kendi işlemlerini saf Go ile oluşturur ve imzalar (CGO yok, yerel kütüphane yok, `qorechaind` yok). Her işlem, PQC uzantısı olmayan gövde üzerinde bir ML-DSA-87 (FIPS 204) imzası ve gövdesi bu uzantıyı taşıyan SignDoc üzerinde bir secp256k1 imzası taşır. İmzalama biçimi sürümü, zincirin uygulanmış yükseltme planlarından okunur. amd64 ve arm64 için Linux, macOS ve Windows derlemeleri vardır (3.1.8'den beri).
- **Tek bir kurtarma kelimesi kümesi iki anahtarı da verir.** `keys add-operator --recover`, hesap anahtarını `m/44'/118'/0'/0/0` yolunda türetir; bu, `qorechaind` ve Keplr'ın kullandığı yolun aynısıdır. Kuantum sonrası anahtar için ya bir cüzdanın o hesapta zaten kaydettiği anahtarı aynı kelimelerden yeniden oluşturur (wallet-adapter ve Dashboard türetimleri, `qorechaind tx pqc recover-key` ile aynı) ya da yeni bir tane türetir; böylece kelimeler düğümün anahtarını da geri yükler (3.1.9'dan beri).
- **Kayıt tek komuttur ve adım adım kontrol edilir.** `register` lisansı kontrol eder, kuantum sonrası anahtarı bağlar (zincirin desteklediği yerlerde sahiplik kanıtıyla birlikte), `--delegate-to` verirseniz yalnızca eksik stake'i delege eder ve ardından kaydolur. Her adım, bir sonraki gönderilmeden önce bir blokta olmalıdır. Stake yalnızca zincirin saydığı gibi bağlı (bonded) doğrulayıcılarda sayılır (3.1.10'dan beri).
- **Kalp atışları zincirin kendi kaydından zamanlanır.** Daemon, zincirin düğüm için tuttuğu `last_heartbeat` değerinden bu yana 1.000 blok geçtiğinde bir kalp atışı gönderir, her 60 saniyede bir kontrol eder ve bir kalp atışını yalnızca bir blokta yer aldığında bildirir. Yeniden başlatma ne yinelenen bir tane gönderir ne de bütün bir aralığı bekler.
- **Uç noktalar arasında başlık çapraz kontrolü.** Düğüm aynı yüksekliği birincil uç noktasından ve yapılandırılmış her tanık (witness) uç noktasından alır ve başlığı yalnızca hepsi aynı karmayı döndürürse saklar. Birincil ile aynı ana makinedeki bir tanık veya uzak bir düz metin `http://` adresindeki bir tanık reddedilir. Mod, hata ayıklama düzeyinde her başlık için `assurance` olarak kaydedilir (`trusted-single-source` veya `corroborated-across-sources`). Bu, uzlaşı doğrulaması **değildir**: bkz. [Sınırlar](#limits).
- **İmzalı kendini güncelleme.** Hafif düğüm 3.1.11'den itibaren daemon, ağının `latest.json` dosyasını her 6 saatte bir okur. Yeni bir sürümü yalnızca şu durumlarda kurar: `v<version>/SHA256SUMS.sig`, ikili dosyaya gömülü bir sürüm anahtarından gelen Ed25519 imzası olarak doğrulanırsa (imza ağı, sürümü ve `SHA256SUMS` içeriğini bağlar), indirilen ikili dosya imzalı sağlama toplamıyla eşleşirse ve yeni ikili dosya çalışıp tam olarak `v<version>` bildirirse. Önceki ikili dosya `<name>.old` olarak saklanır ve düğüm yerinde yeniden başlar (Linux ve macOS'ta aynı süreç; Windows'ta yeni ikili dosya başlar ve eskisi çıkar). `[update] mode` değeri `auto` (varsayılan), `notify` veya `off` olabilir; `lightnode-sx update --check` ve `lightnode-sx update` aynı işi elle yapar. Bir kapsayıcıda veya ikili dosyanın klasörünün yazılabilir olmadığı yerlerde düğüm yalnızca bir sürümü duyurur (günlük satırı, yerel API'de `GET /api/update` ve UX panosunda bir başlık bandı).
- **Zincirin yaptığıyla eşleşen uyarılar.** `[delegation] rebalance_enabled` açıkken (varsayılan) düğüm, delege ettiğiniz bir doğrulayıcı jail edildiğinde, aktif kümede olmadığında ve bağlı stake'iniz `min_delegated_stake` (1.000 QOR) değerinin altına düştüğünde uyarır. Her üç durumda da zincir, hiçbir mesaj vermeden düğümü kredilendirmeyi bırakır. Bir uyarı ortaya çıktığında, sürdüğü sürece saatlik olarak ve kalktığında bir kez kaydedilir. Dördüncü bir uyarı, delege edilen bir doğrulayıcının itibar puanının `min_reputation` değerinin (varsayılan `0.5`) altında olması, `GET /qorechain/reputation/v1/validator/<valoper>` adresini okur: şu anda **test ağında** canlıdır ve ana ağa yalnızca v3.2.5'ten sonraki bir zincir sürümüyle ulaşır; rota sunulana kadar düğüm bunu bir kez not eder ve her 6 saatte bir yeniden sorar.

### Neden bir hafif düğüm çalıştırmalı ve çapraz kontrol nasıl okunur {#why-run-a-light-node}

- **Ödül payına katılın.** Stake ve çalışma süresi kurallarını karşılayan kayıtlı, aktif hafif düğümler, [aşağıda](#the-3-light-node-reward-share) açıklanan %3'lük paydan ödeme alır.
- **Size gösterilen zincir durumunu çapraz kontrol edin.** Hiçbir tanık yapılandırılmadığında düğüm başlangıçta bir uyarı kaydeder ve `trusted-single-source` bildirir: dürüstçe işletilen tek bir uç nokta, ele geçirilmiş bir uç noktayla aynı değeri bildirir. `corroborated-across-sources` durumuna geçmek için bağımsız işletilen bir tanık ekleyin; bu durumda yanıltılmak için yapılandırılmış her uç noktanın aynı anda ele geçirilmesi gerekir. Değer, hata ayıklama günlüğünün `synced header` satırlarında görünür (`log_level = "debug"` olarak ayarlayın); `status` çıktısında veya panoda gösterilmez ve merkezi hiçbir şey bunu göremez, çünkü RPC seçimleriniz kendi kurulumunuza özeldir.
- **Ağı izleyin.** Telemetri doğrulayıcıları, uzlaşıyı, köprüyü ve tokenomiği kapsar ve bağımsız aralıklarda yenilenir.

## Nasıl kullanılır {#how-to-use}

Bir sürüm seçin. İkisi de aynı `config.toml` dosyasını okur, verileri aynı ana dizinde (`~/.qorechain-lightnode`) saklar ve aynı anahtarlığı (keyring) kullanır.

| Sürüm | İkili Dosya | Şunun için inşa edildi | Arayüz |
| --- | --- | --- | --- |
| **SX** (Server eXperience) | `lightnode-sx` | Başsız sunucular, otomasyon | Daemon artı tam komut satırı. Bkz. [SX Sürümü](/light-node/sx-edition). |
| **UX** (User eXperience) | `lightnode-ux` | Masaüstü ve operatör kullanımı | Aynı komutlar artı yerel bir web panosu. Bkz. [UX Sürümü](/light-node/ux-edition). |

**1. İndirin ve doğrulayın** (Linux amd64 gösterilmiştir; manifesti okumak için `jq` kullanılır). Sürümü hedeflediğiniz ağın manifestinden alın:

```bash
NET=mainnet            # or testnet
V=$(curl -fsS https://download.qore.host/$NET/lightnode/latest.json | jq -r .version)
F=lightnode-sx-linux-amd64          # see the artifact list in latest.json for other platforms
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/SHA256SUMS
grep " $F\$" SHA256SUMS | sha256sum -c -        # macOS: shasum -a 256 -c -
chmod +x $F
```

Windows'ta `certutil -hashfile lightnode-sx-windows-amd64.exe SHA256` çıktısını manifestteki değerle karşılaştırın. Sürüme özgü `SHA256SUMS`, sürüme özgü ikili dosyayla eşleşmelidir; bu yüzden ikisini de `v$V` yolundan alın.

**2. Kurun ve kaydolun.** Aşağıdaki sıra Dashboard'un gösterdiği sıradır; bir devnet'te, test ağında (18 Ekim 2026'da prova) ve ilk ana ağ düğümü için (20 Ekim 2026) çalıştırılmıştır.

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

./lightnode-sx onboard                  # PQC self-test, chain RPC (see below), node key
./lightnode-sx keys add-operator --recover   # recovery words on standard input; no flag = new account, 24 words shown once
./lightnode-sx register --delegate-to qorvaloper1...   # needs the licence and QOR in the operator account
./lightnode-sx start
./lightnode-sx status
```

`onboard` için zincir RPC'si `https://rpc.qore.host` (ana ağ) veya `https://rpc-testnet.qore.host` (test ağı) adresidir. UX sürümü için aynı komutlarla `lightnode-ux` kullanın ve `http://127.0.0.1:8420` adresini açın. Her adımın ayrıntıları: [SX Sürümü](/light-node/sx-edition) ve [Kayıt ve Lisanslama](/light-node/registration-and-licensing).

**3. Güncel tutun.** Hafif düğüm 3.1.11 ve sonrası kapsayıcıların dışında kendini günceller (yukarıdaki kendini güncelleme maddesine bakın). 3.1.10 veya daha eski bir düğüm 3.1.12'yi bir kez elle kurmalıdır: sürüme özgü ikili dosyayı yukarıdaki gibi indirin ve dosyayı değiştirin. Docker ile yeni kaynak etiketinden yeniden inşa edin. Bkz. [SX Sürümü: güncelleme](/light-node/sx-edition#updating).

## Nasıl erişilir {#how-to-access}

| | Ana ağ | Test ağı |
| --- | --- | --- |
| Zincir | `qorechain-vladi` (zincir `v3.2.4`) | `qorechain-diana` (zincir `v3.2.6`) |
| Düğüm için RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| Sorgular için REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Hafif düğüm sürümü | 3.1.12 | 3.1.12 |
| Lisans | 50 $, Dashboard'dan satın alınır; hibe elle, gruplar halinde imzalanır | Ücretsiz, self-servis: **Nodes & Validators > Light Node**, **Request licence**; otomatik imzalanır, genellikle birkaç dakika içinde |

**Kaydolmak için gerekenler**

- Kurtarma kelimelerini elinizde tuttuğunuz bir hesap (kendi kelimeleriniz, Keplr veya bir `qorechaind` anahtarı), tercihen düğüme ayrılmış. Saklamalı (custodial) bir Dashboard cüzdanı, seed'ini dışa aktarmadığınız sürece bir düğüm çalıştıramaz.
- O adreste etkin bir `lightnode_operator` lisansı (aşağıya bakın).
- O adresten **bağlı** doğrulayıcılara toplam olarak delege edilmiş en az **1.000 QOR**.
- **1 QOR** kayıt ücreti ve işlem ücretleri için hesapta QOR. Bir kalp atışı, varsayılan 300.000 gaz sınırında gaz başına 0,25 uqor'a mal olur, yani tavan olarak 0,075 QOR (ölçülen kullanılan gaz: yaklaşık 165.000).
- Açık kalan bir bilgisayar: ödeme almak için düğümün her 1.000 blokta bir kalp atışı göndermesi ve en az %80 çalışma süresini koruması gerekir.

**Lisans edinme.** Dashboard'da **Nodes & Validators** sayfasını açın (kenar çubuğunda eskiden **Tools** olarak adlandırılan giriş; sayfa hâlâ `/tools` adresindedir), **Light Node** sekmesini seçin ve üst bilgiden ağı seçin. Dashboard oturum açmayı gerektirir.

- *Ana ağ:* önce `qor1...` adresini girin, USDT ağını seçin ve 50 $ ödeyin. Zincir hibeyi onaylayana kadar sekme **Paid, awaiting on-chain grant** gösterir.
- *Test ağı:* hiçbir şey satılmaz. **Free testnet licence** altına `qor1...` adresinizi girin ve **Request licence** seçeneğini seçin. Hesap başına bir ve adres başına bir istek vardır. Lisans ulaştığında sekme "Granted to ..." gösterir ya da hibenin imzalanamadığını söyler ve yeniden istemenize izin verir.

Bir lisansı doğrudan da kontrol edebilirsiniz: `GET /qorechain/license/v1/check/<address>/lightnode_operator`.

### Ödül programının durumu {#reward-program-status}

:::note Kayıt açık
Kayıt ana ağda (`qorechain-vladi`, zincir v3.2.4) ve test ağında (`qorechain-diana`, zincir v3.2.6) açıktır. 27 Ekim 2026'da ana ağda yedi `lightnode_operator` lisansı verilmişti ve her ağda bir hafif düğüm kayıtlıydı (her ikisinde de `GET /qorechain/lightnode/v1/stats` içinde `total_registered` değeri `1`'dir). Ödül muhasebesi, v3.2.0 yükseltmesinden beri her iki ağda canlıdır. Çalışma süresi **düğümünüzün kaydedildiği bloktan itibaren** sayılır; bu nedenle öncesinde bir düğüm çalıştırmak kredi kazandırmaz. Zincir v3.2.4'ten beri düğüm başına sınır da düğümün kendi kaydıyla başlar: kayıttan sonraki ilk uzlaşma yalnızca o andan bu yana biriken tutarı kredilendirir.

Sürüm manifesti (`https://download.qore.host/<net>/lightnode/latest.json`) resmi sinyali `registration.open` alanında taşır. Canlı durum için `https://api.qore.host` (ana ağ) veya `https://api-testnet.qore.host` (test ağı) üzerinde `GET /qorechain/license/v1/holders/lightnode_operator` ve `GET /qorechain/lightnode/v1/stats` adreslerini sorgulayın.
:::

## %3 hafif düğüm ödül payı {#the-3-light-node-reward-share}

QoreChain'in ücret dağıtımı, hafif düğümlere sabit bir **%3 pay** ayırır (`reward_share` parametresi, `0.03`). Tam %37 / %30 / %20 / %10 / %3 dökümü (doğrulayıcılar, yakılan, hazine, stake edenler, hafif düğümler) için bkz. [Tokenomik](/architecture/tokenomics).

Bu %3, hafif düğüm modül hesabına ödenen tutardır; düğüm başına bir hak değildir. Her 100 blokta zincir, her uygun düğüme önceki uzlaşmadan bu yana biriken tutarın stake ağırlıklı payını kaydeder; bu pay **düğüm başına sınırlandırılır**. Zincir v3.2.3'ten beri sınır **düğüm başına 30 günde 2.000 QOR**'dur (`max_reward_per_month_per_node`, `2000000000` uqor); önceki uzlaşmadan bu yana geçen blok süresine orantılanır ve düğümün çalışma süresine göre ölçeklenir; bu, `lightnode-monthly-cap` kuralıdır. v3.2.3'ten önce sınır blok başına ifade ediliyordu (`max_reward_per_block_per_node`, `1713` uqor) ve ödül havuzu sorgusu bu değeri hâlâ bildirir. Sınır bir tavandır, vaat edilen bir tutar değildir. Kazanılmayan her şey yalnızca bir yönetişim oylamasının serbest bırakabileceği bir rezerve taşınır; böylece ilk kayıt olan için biriken bir havuz oluşmaz. Canlı bölüşümü `GET /qorechain/lightnode/v1/reward_pool` ile inceleyebilirsiniz.

Ödüllere hak kazanmak için bir hafif düğümün **zincir üzerinde kayıtlı, aktif** (kalp atışlarıyla canlılığını kanıtlayan) olması, en az minimum bağlı (bonded) stake'e sahip olması ve çalışma süresini minimumun üzerinde veya eşit tutması gerekir. Kayıt [Kayıt ve Lisanslama](/light-node/registration-and-licensing) sayfasında ele alınmıştır; ödüllerin kaydedilmesi, talep edilmesi ve izlenmesi ise [Ödüller ve İzleme](/light-node/rewards-and-monitoring) sayfasında ele alınmıştır.

## Nerede yayımlandı {#where-published}

| Ne | Nerede | Güncel sürüm |
| --- | --- | --- |
| Sürüm manifesti, ana ağ | `https://download.qore.host/mainnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, kayıt açık) |
| Sürüm manifesti, test ağı | `https://download.qore.host/testnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, kayıt açık) |
| İkili dosyalar | `https://download.qore.host/<net>/lightnode/v<version>/<file>` | Sürüm başına 12 dosya (SX ve UX, Linux, macOS ve Windows, amd64 ve arm64) artı `SHA256SUMS` |
| Kaynak ve sürümler | `github.com/qorechain/qorechain-lightnode` (Apache 2.0) | Sürüm `v3.1.12` (güncel) ve önceki etiketler; her biri 12 ikili dosyayı, `SHA256SUMS`, `lightnode-build.json` ve bir Android önizleme APK'sını taşır |
| Android | Yalnızca GitHub sürümüne eklenmiştir | Önizleme: zinciri takip eder, kayıt olmaz, kazanmaz |
| Docker | Kaynak etiketinden inşa edilir (bkz. [SX Sürümü: Docker](/light-node/sx-edition#docker)) | Anonim çekme için hiçbir kayıt defteri imajı yayımlanmaz |

İndirmeden önce bu tabloya güvenmek yerine ağınızın manifestindeki `version` değerini kontrol edin. Sürüm imzalama anahtarı ikili dosyaya gömülüdür; sizin kurmanız gereken bir şey yoktur.

## Sınırlar ve bilinen sorunlar {#limits}

- **Bir protokol hafif istemcisi değildir.** Düğüm, blok karmalarını uç noktalar arasında doğrular. Commit imzalarını, doğrulayıcı kümesi değişikliklerini veya bir güven süresini kontrol etmez; dolayısıyla zincirin uzlaşısını doğrulamaz. Yapılandırmadaki `trust_period` ve `max_clock_drift` kabul edilir ancak kullanılmaz.
- **Ödüller bir tavandır.** Düğüm başına sınır (30 günde 2.000 QOR) bir azami değerdir ve düğüm yalnızca havuza biriken tutarı ve yalnızca uygun olduğu sürece alır.
- **Kalp atışı bir canlılık imzasıdır.** Operatör anahtarının zamanında imzaladığını kanıtlar, tam yazılımın kesintisiz çalıştığını değil.
- **İtibar uyarıları şimdilik yalnızca test ağındadır.** Ana ağ henüz doğrulayıcı başına itibar puanı sunmaz; bu yüzden ana ağda o kontrol çalışmaz ve düğüm bunu günlüğünde söyler. Jail edilmiş, aktif kümede olmayan ve düşük stake uyarıları buna bağlı değildir. 3.1.11'den önceki düğüm sürümleri başarısız bir itibar kontrolünü her beş dakikada bir kaydediyordu ve hiçbir şey için uyarı vermiyordu.
- **Kendini güncelleme 3.1.11 ile başlar.** 3.1.10 veya daha eski bir düğüm kendini güncellemez ve 3.1.12'nin bir kez elle kurulmasını gerektirir. Bir kapsayıcıda veya yazılamaz bir klasörde düğüm yalnızca yeni sürümleri duyurur.
- **Çekilecek Docker imajı yok.** Kaynak etiketinden inşa edin; yayımlanmış kapsayıcı paketleri henüz herkese açık değildir. Docker düğümleri kendilerini asla güncellemez.
- **Android bir önizlemedir** ve kayıt olmaz veya kazanmaz.
- **Lisanslar.** Ana ağ hibeleri gruplar halinde elle imzalanır, bu yüzden ödeme ile kayıt arasında bir bekleme vardır. Test ağı lisansı hesap başına bir ve adres başına bir ile sınırlıdır.
- **Dashboard'da oluşturulmuş bir cüzdan bir düğüm çalıştıramaz**, seed'ini dışa aktarmadığınız sürece; çünkü düğümün elinizde bulunan anahtarlarla imzalaması gerekir.

## Sonraki adımlar

- [SX Sürümü](/light-node/sx-edition): sunucu daemon'unu kurun, yapılandırın ve çalıştırın.
- [UX Sürümü](/light-node/ux-edition): web panosu sürümünü çalıştırın.
- [Kayıt ve Lisanslama](/light-node/registration-and-licensing): bir lisans edinin ve zincir üzerinde kaydolun.
- [Ödüller ve İzleme](/light-node/rewards-and-monitoring): %3'lük payın nasıl kaydedildiği ve talep edildiği ve düğümü sağlıklı tutma yolları.
- [Tokenomik](/architecture/tokenomics): hafif düğüm ödül payının daha geniş ekonomiye nasıl uyduğu.
