---
slug: /light-node/sx-edition
title: SX Sürümü (Sunucu Daemon'u)
sidebar_label: SX Sürümü
sidebar_position: 2
---

# SX Sürümü — Sunucu Daemon'u

**SX (Server eXperience)** sürümü başsız hafif düğümdür: sunucular ve otomasyon için tasarlanmış bir daemon artı tam bir yönetim CLI'si. İkili dosya `lightnode-sx`'tir. Hafif düğüm sürümleri, zincir sürümünden ayrı, kendi hatlarındadır: her iki ağın kanalı da **3.1.12** sürümünü taşır (27 Ekim 2026). Bu sayfa, bir özelliğin 3.1.11 veya daha yenisini gerektirdiği yerleri belirtir.

## Kurulum {#install}

Önceden derlenmiş ikili dosyalar en kolay yoldur. Hafif düğüm istemcisi, kurulacak yerel kitaplık gerektirmeyen, yaklaşık 13 MB'lık tek bir statik ikili dosyadır: Linux (amd64, arm64), macOS (Intel, Apple Silicon) ve Windows (amd64, arm64) derlemeleri her iki sürüm için de mevcuttur, sürüm başına toplam 12 ikili dosya. Düğüm kendi işlemlerini kendisi imzalar; bu nedenle bir düğümü kaydetmek ve çalıştırmak için başka hiçbir şeye (özellikle `qorechaind`'e) gerek yoktur.

**Çalıştırmadan önce sağlama toplamını doğrulayın.** `https://download.qore.host/<net>/lightnode/latest.json` adresindeki sürüm manifestosu her ikili dosya için bir `sha256` değeri, tüm sürümü kapsayan bir `SHA256SUMS` dosyasını gösteren bir `checksums.url` ve o dosyanın kendi `checksums.sha256` değerini taşır. İndirdiğinizi doğrulayın: bu, gerçekten derlenen ikili dosyayı çalıştırmakla o URL'ye her ne indiyse onu çalıştırmak arasındaki farktır. Sürümü manifestodan alın, ikili dosyayı ve `SHA256SUMS` dosyasını da aynı sürüm numaralı yoldan alın:

```bash
NET=mainnet            # or testnet
V=$(curl -fsS https://download.qore.host/$NET/lightnode/latest.json | jq -r .version)   # 3.1.12 on both networks today
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/SHA256SUMS
grep " $F\$" SHA256SUMS | sha256sum -c -    # macOS: shasum -a 256 -c -
chmod +x $F
```

Sürüm numaralı ikili dosyayla birlikte sürüm numaralı `SHA256SUMS` dosyasını (`.../v$V/SHA256SUMS`) kullanın. Sürümsüz `.../lightnode/SHA256SUMS` manifestoya aittir ve yeni bir sürümün birkaç saat gerisinde kalabilir; bu nedenle sürüm numaralı bir ikili dosyanın onunla kontrolü başarısız olabilir.

Windows'ta `certutil -hashfile lightnode-sx-<platform>.exe SHA256` çıktısını manifestodaki değerle karşılaştırın. Her iki manifesto da 3.1.9 ve sonrasını kabul eder (`minCompatible: 3.1.9`). Kaynak kodu `github.com/qorechain/qorechain-lightnode` adresinde herkese açıktır (Apache 2.0). GitHub sürümüne önizleme olarak bir Android derlemesi eklenmiştir; kayıt olmaz ve ödül kazanmaz.

İkili dosyayı kaynaktan da derleyebilir veya Docker ile çalıştırabilirsiniz.

### Kaynaktan derleme

Hafif düğüm **Go 1.26.1** gerektirir. Kuantum sonrası kriptografisi saf Go ile uygulanmıştır (CGO yok, yerel kitaplık yok), bu nedenle desteklenen altı platformdan herhangi biri için çapraz derleme, herhangi bir Go ikili dosyasıyla aynı şekilde çalışır:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Manifestonun adını verdiği sürüm etiketinden derleyin (bugün `git checkout v3.1.12`). Bu, `build/lightnode-sx` üretir. Doğrudan çalıştırın veya `PATH`'inize kopyalayın. Kaydolmadan önce kuantum sonrası imzalama yığınını [`selftest`](#verify-the-pqc-stack-selftest) ile sağlık kontrolünden geçirin.

### Docker {#docker}

Yayımlanan imajlar herkese açıktır ve anonim olarak çekilebilir: `ghcr.io/qorechain/qorechain-lightnode-sx` ve `ghcr.io/qorechain/qorechain-lightnode-ux`; her biri `latest` ve `v<version>` (örneğin `v3.1.12`) olarak etiketlenir. Kaynak deposunun `main` dalındaki `docker-compose.yml` bunları kullanır ve kayıt defterine ulaşılamadığında kaynaktan derlemeye (`Dockerfile.sx`, `Dockerfile.ux`) geri döner. Bir sürümü sabitlemek için compose dosyasındaki `image:` etiketini değiştirin; bunun yerine bir sürüm etiketinden derlemek için `git checkout v<version>` yapıp `docker compose build` çalıştırın. Güncellediğinizde anahtarlar, yapılandırma ve veri birimi korunur.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring (node key + operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

docker compose pull                    # fetches the released image

# Once: the same setup as outside Docker, written into the data volume.
docker compose run --rm lightnode-sx onboard
docker compose run --rm lightnode-sx keys add-operator --recover
docker compose run --rm lightnode-sx register --delegate-to qorvaloper1...

docker compose up -d lightnode-sx
docker compose run --rm lightnode-sx status
```

`QORECHAIN_RPC_ADDR` değişkenini her `docker compose` komutunda dışa aktarılmış tutun: yapılandırmadaki `rpc_addr` değerini geçersiz kılar. 3.1.10'dan beri compose dosyası bunu varsayılan olarak mainnet RPC'si `https://rpc.qore.host` adresine ayarlar; bu yüzden bir testnet düğümü `https://rpc-testnet.qore.host` değerini dışa aktarmalıdır, aksi halde mainnet'i izler. SX konteyneri, anahtarlık dahil verilerini `/root/.qorechain-lightnode` konumuna bağlanmış adlandırılmış bir birimde kalıcı kılar.

Düğüm konteyner içinde yerel olarak imzalar, bu nedenle başka hiçbir şey gerekmez. SX imajı, [`qorechaind` alternatifi](/light-node/registration-and-licensing#pqc-cosigned-heartbeat-pipeline) için hâlâ yayınlanmış bir `qorechaind` (v3.2.0, yalnızca linux/amd64, sabitlenmiş bir özetle (digest) doğrulanır) da içerir: `docker-compose.yml`, `~/.qorechaind` dizinini (veya `QORECHAIND_HOME`) `/root/.qorechaind` konumuna bağlar ve bu yol için `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` değerini iletir. Operatör anahtarı kendi anahtarlığında bulunan bir düğüm bunların hiçbirini kullanmaz.

## Güncelleme {#updating}

- **Hafif düğüm 3.1.11 ve sonrası, Docker dışında.** Düğüm her 6 saatte bir kendi ağı için `https://download.qore.host/<net>/lightnode/latest.json` adresini okur (`qorechain-vladi` için mainnet, `qorechain-diana` için testnet, diğer zincirler için hiçbir şey). Manifesto yalnızca bir ipucudur. Düğüm bir sürümü yalnızca aşağıdakilerin hepsi sağlanıyorsa kurar:
  1. `v<version>/SHA256SUMS.sig`, ağ, sürüm ve `SHA256SUMS` içeriği üzerinde, ikili dosyaya gömülü sürüm anahtarıyla atılmış geçerli bir Ed25519 imzasıdır;
  2. kanalın kendi sürüm numaralı yolundan alınan ikili dosya (manifesto URL'leri izlenmez), imzalı sağlama toplamıyla eşleşir;
  3. yeni ikili dosya çalışır ve tam olarak `v<version>` bildirir.

  Ardından önceki ikili dosyayı `<name>.old` olarak saklar ve yerinde yeniden başlar: Linux ve macOS'ta aynı süreçle (böylece bir systemd hizmeti ayakta kalır), Windows'ta ise yeni ikili dosya başlar ve eskisi çıkar (bir hizmeti çıkışta yeniden başlayacak şekilde ayarlayın).
- **Ayarlar.** `[update] mode = "auto"` (varsayılan, bölümü olmayan bir yapılandırma için de) duyurur ve kurar; `"notify"` yalnızca duyurur; `"off"` kontrol etmez. Elle: `lightnode-sx update --check`, ardından `lightnode-sx update`, sonra düğümü yeniden başlatın.
- **Bir duyuruyu görme.** Düğüm daha yeni bir sürümü günlüğe yazar ve yerel pano API'sinde `GET /api/update` üzerinden sunar (alanlar `network`, `mode`, `current`, `latest`, `min_compatible`, `notes`, `update_available`, `mandatory`, `can_install`, `blocked`, `last_check`, `last_error`); UX panosu bir afiş gösterir.
- **Konteyner veya yazılamayan klasör.** Düğüm yalnızca duyurur: imajı veya dosyayı kendiniz güncelleyin.
- **Hafif düğüm 3.1.10 ve öncesi** kendini güncellemez. 3.1.12'yi bir kez elle kurun: sürüm numaralı ikili dosyayı manifesto yolundan indirin ([Kurulum](#install) bölümüne bakın), doğrulayın, dosyayı değiştirin ve yeniden başlatın. Bundan sonra düğüm kendi kanalını izler.
- **Docker.** Bir Docker düğümü yeni bir sürümden haberdar edilir (günlük ve `GET /api/update`) ancak kendini asla değiştirmez; güncelleme çekmektir: `docker compose pull && docker compose up -d` (`QORECHAIN_RPC_ADDR` değerini dışa aktarılmış tutun). Alternatif, yeni kaynak etiketinden derlemektir.

## Yapılandırma {#configure}

Hafif düğüm bir TOML yapılandırma dosyası okur. Varsayılan olarak ana dizinde (`~/.qorechain-lightnode/config.toml`) `config.toml` arar. Bu dosyayı normalde elle yazmazsınız — [`onboard` sihirbazı](#first-run-onboard) sizin için oluşturur — ancak seçenekleri anlamak yararlıdır.

İki kalıcı bayrak her komuta uygulanır:

- `--config <path>` — varsayılan olmayan bir konumdaki bir yapılandırma dosyasına yönlendirin.
- `--home <dir>` — veriler ve anahtarlar için kullanılan ana dizini geçersiz kılın (varsayılan `~/.qorechain-lightnode`).

Kullanım düzeyinde en ilgili yapılandırma seçenekleri:

| Seçenek | Neyi kontrol eder |
| --- | --- |
| `chain_id` | Ağ tanımlayıcısı (mainnet'te `qorechain-vladi`, testnet'te `qorechain-diana`). `onboard` bunu RPC uç noktasından okur; `onboard` sırasında uç noktaya ulaşılamadıysa varsayılan `qorechain-diana` kalır ve değeri kendiniz ayarlamanız gerekir. İşlemler bu zincir için imzalanır. |
| `rpc_addr` | Daemon'un bağlandığı zincir RPC uç noktası. **Yalnızca yerel modda** çalıştırmak için boş bırakın. |
| `primary_addr` / `witness_addrs` | Birincil RPC uç noktası ve raporladığı başlığın doğrulandığı tanık uç noktaları — bkz. [Neden hafif düğüm çalıştırılır](/light-node/overview#why-run-a-light-node). En az bir farklı, erişilebilir tanık, `assurance` değerini (debug düzeyinde günlüğe yazılır) `trusted-single-source`'tan `corroborated-across-sources`'a taşıyan şeydir. |
| `trust_period` / `max_clock_drift` | Uyumluluk için kabul edilir ancak şu anda kullanılmaz. Başlık güveni, yukarıda açıklanan birincil/tanık doğrulamasından gelir. |
| `data_dir` | Düğümün veritabanını ve başlıklarını sakladığı yer. |
| `keyring_backend` / `key_name` | Anahtarlık arka ucu (`file`, `os` veya yalnızca yerel devnet'ler için `test`) ve düğümün imzaladığı kuantum sonrası anahtarın adı. `onboard`, `key_name` değerini oluşturduğu anahtara (`validator`) ayarlar; `keys add-operator` anahtarı hesabın kelimelerinden türettiğinde veya kurtardığında bunu `operator-pqc` olarak değiştirir. `file` arka ucu, ortamda `QORE_LIGHTNODE_KEYRING_PASSPHRASE` tanımlı olmasını gerektirir. |
| `operator_address` | Bu düğümün ait olduğu hesap (`qor1...`); yükleme sırasında doğrulanır. `keys add-operator` bunu doldurur. `register`, `status` ve heartbeat'ler için gereklidir. Bkz. [Operatör cüzdanı](#operator-wallet). |
| `api_addr` | REST uç noktası. Boş olduğunda `rpc_addr`'dan türetilir (26657 portu 1317 olur; `rpc.` ana bilgisayarları `api.` olur), dolayısıyla yalnızca bu iki kuralı da izlemeyen uç noktalar için gereklidir. |
| `[heartbeat]` | Varsayılan olarak açıktır (`enabled`). `interval_blocks` (zincirin `heartbeat_interval` değeriyle, yani 1000 ile eşleştirin), `check_interval` (varsayılan `60s`) ve `gas` (varsayılan `300000`; yerel imzalamada ücret gaz birimi başına 0,25 uqor'dur, yani 75.000 uqor). Yalnızca `qorechaind` alternatifi tarafından kullanılanlar: `fees` (varsayılan `50000uqor`), `qorechaind_path` (boş, `PATH`'teki `qorechaind` anlamına gelir), `qorechaind_home` (boş, `~/.qorechaind` anlamına gelir), `keyring_backend` ve `key_name` (operatör hesabını tutan `qorechaind` anahtarı; varsayılan olarak üst düzey `key_name`). |
| `[delegation]` | `auto_claim` (varsayılan olarak kapalı: birikmiş hafif düğüm ödüllerini imzalayıcı aracılığıyla operatör hesabına talep eder; düğüm sunucudan asla yeniden delege etmez), kontrol aralığı, talep için minimum ödül, `rebalance_enabled` (varsayılan olarak açık) ve `min_reputation` (yalnızca uyarılar; düğüm stake'i asla taşımaz). 3.1.11'den itibaren `rebalance_enabled`, hapsedilmiş (jailed) veya aktif kümede olmayan bir delege edilmiş doğrulayıcı için ve `min_delegated_stake` değerinin (1.000 QOR) altındaki bağlı stake için uyarıları açar; `min_reputation` (varsayılan `0.5`) ağın doğrulayıcı başına itibar puanları sunduğu yerde, bugün testnet'te, uygulanır. `validators` ve `split_weights` kabul edilir ancak şu anda işleme alınmaz. |
| `[update]` | `mode`: `auto` (varsayılan, bölüm yokken de), `notify` (yalnızca duyur) veya `off`. Hafif düğüm 3.1.11 ve sonrası. Bkz. [Güncelleme](#updating). |
| `[telemetry]` | Telemetrinin etkin olup olmadığı ve doğrulayıcılar, ağ, köprü ve tokenomik için yenileme aralıkları. |
| `[dashboard]` | Yerel pano API'si. UX sürümü bunu her zaman sunar; SX sürümü yalnızca `enabled = true` ile. `bind_addr` (varsayılan `127.0.0.1:8420`) ve `token` (ayarlandığında her `/api` rotası ve `/ws` için `Authorization: Bearer <token>` gerekir). Bkz. [UX Sürümü](/light-node/ux-edition). |
| `log_level` / `log_format` | Günlük ayrıntı düzeyi (`debug`, `info`, `warn`, `error`) ve biçim (`text` veya `json`). Üst düzey anahtarlardır: bunları ilk `[table]` öncesine yazın. |

### Ortam değişkenleri {#environment-variables}

| Değişken | Kullanım amacı |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | Düğümün kuantum sonrası anahtarını ve operatör hesabı anahtarını tutan düğüm anahtarlığının parolası (`keyring_backend = "file"`). Anahtarlığı açan her komut ve `start` için zorunludur; düğüm boş bir parolayı reddeder. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | Yalnızca `qorechaind` alternatifi için: operatör anahtarını tutan `qorechaind` anahtarlığının parolası; `qorechaind`'e stdin üzerinden iletilir, hiçbir zaman komut satırında görünmez. |
| `QORECHAIN_RPC_ADDR` | `rpc_addr` değerini (ve `rpc_addr`'a eşit olduğunda `primary_addr` değerini) geçersiz kılar. `docker-compose.yml` tarafından ayarlanır. |

:::note Tanık uç noktaları başlangıçta doğrulanır
Birincil ile aynı ana bilgisayardaki bir tanık reddedilir — güvenliği ihlal edilmiş bir uç nokta yalnızca kendisiyle aynı fikirde olur, dolayısıyla hiçbir şeyi doğrulamaz. Uzak bir ana bilgisayardaki düz metin `http://` tanığı da reddedilir, çünkü o bağlantıyı yeniden yazabilen bir saldırgan aynı anda her tanık gibi yanıt verebilir; loopback `http://` sorun değildir. Tanıkları, bağımsız olarak güvenmek için nedenleriniz olan RPC uç noktalarına yönlendirin.
:::

Delegasyon varsayılanları stake uyarılarını etkinleştirir ve `auto_claim` seçeneğini kapalı bırakır; bunların ne yaptığını öğrenmek için [Ödüller ve İzleme](/light-node/rewards-and-monitoring) bölümüne bakın.

## İlk çalıştırma: `onboard` {#first-run-onboard}

İlk başlatmada, henüz bir yapılandırma dosyası yoksa `start` duracak ve sizi katılım sihirbazına yönlendirecektir. Önce anahtarlık parolasını ayarlayın — `onboard` parola olmadan başlamayı reddeder, böylece saklayamayacağı bir anahtarı asla oluşturmaz — ardından sihirbazı çalıştırın:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-sx onboard
```

`onboard`, kurulum boyunca size dört adımda yol gösterir:

1. **PQC kendi kendine testi** — tam Dilithium-5 gidiş-dönüşünü çalıştırır ([`selftest`](#verify-the-pqc-stack-selftest) ile aynı kontroller). PQC yığını başarısız olursa, sihirbaz devam etmeyi reddeder.
2. **Zincir RPC uç noktası** — QoreChain RPC URL'nizi yapıştırın (mainnet `https://rpc.qore.host`, testnet `https://rpc-testnet.qore.host`) veya **yalnızca yerel modda** çalıştırmak için boş bırakın. Bir URL sağlarsanız, sihirbaz onu canlı olarak test eder ve zincir kimliğini ondan okur.
3. **Düğüm anahtarı** — sihirbaz buna "doğrulayıcı özel anahtarı" der, ancak bu bir doğrulayıcı anahtarı değil, hafif düğümün kendi Dilithium-5 anahtarıdır. Onaltılık kodlanmış bir Dilithium-5 özel anahtarı yapıştırın veya bu düğümde yeni bir anahtar çifti oluşturmak için `g` (veya `generate`) yazın.
4. **Kaydet** — `config.toml` dosyasını (uç nokta ve zincir kimliğiyle) yazar ve anahtarı anahtarlıkta `validator` adı altında saklar (bu ad alınmışsa `validator-<hex>`); `key_name` değerini de bu anahtara ayarlar.

:::note Yalnızca yerel mod
Uç noktayı boş bırakırsanız, daemon yalnızca yerel modda başlar: PQC yığını tam olarak çalıştırılır, ancak düğüm hiçbir zinciri eşitlemez. Zincir uç noktanız hazır olduğunda, düğümü ona yönlendirmek için `onboard` komutunu yeniden çalıştırın.
:::

`onboard` her zaman etkin yapılandırmanın üzerine yazar. Varsayılan olmayan bir yola yazmak için `--config`, sormak yerine hızlı başarısız olmak için (CI'de yararlıdır) `--non-interactive` kullanın.

:::caution Sonraki adım: operatör hesabı
`onboard` hangi hesabın sizin olduğunu bilmez. `register` komutunu çalıştırmadan önce operatör hesabını [`keys add-operator`](#operator-wallet) ile ekleyin. Bu komut `operator_address` değerini sizin için doldurur. `onboard` sırasında uç noktaya ulaşılamadıysa, `config.toml` içindeki `chain_id` değerinin `qorechain-vladi` (mainnet) veya `qorechain-diana` (testnet) olduğunu da kontrol edin.
:::

## Çalıştırma: `start`

Katılım bir yapılandırma yazdıktan sonra, daemon'u başlatın:

```bash
build/lightnode-sx start
```

Daemon başlıkları eşitler, delegasyonları izler ve kesintiye uğrayana kadar telemetri sunar. Bir yapılandırma dosyası olmadan (yalnızca yerel, zincir RPC'si yok) bilerek başlamak istiyorsanız, `--skip-onboarding-check` geçirin.

## PQC yığınını doğrulama: `selftest` {#verify-the-pqc-stack-selftest}

Kuantum sonrası yığının işlevsel olduğunu istediğiniz zaman onaylayabilirsiniz:

```bash
lightnode-sx selftest
```

`selftest`, Dilithium-5'e (ML-DSA-87) karşı beş kontrol çalıştırır ve bir saniyenin altında tamamlanır:

1. **Keygen** — yeni bir anahtar çifti oluşturur.
2. **Sign** — bir test mesajını imzalar.
3. **Verify (valid sig)** — imzanın eşleşen genel anahtarla doğrulandığını onaylar.
4. **Reject tampered signature** — imzanın bir baytını ters çevirir; doğrulama bunu reddetmelidir.
5. **Reject tampered message** — mesajın bir baytını ters çevirir; doğrulama bunu reddetmelidir.

Herhangi bir kontrol başarısız olursa, ikili dosya tanılama çıktısıyla sıfırdan farklı çıkar. Bu, katılım sihirbazının ilk adımı olarak çalıştırdığı testin aynısıdır ve dağıtım öncesi doğrulama ile destek tanılaması için kullanışlıdır.

## Operatör cüzdanı {#operator-wallet}

Düğümün Dilithium-5 anahtarı bir cüzdan **değildir**. QoreChain'de kuantum sonrası bir anahtar bir hesaba eklenir; hesap oluşturmaz. Bu yüzden `keys list` onun için bir adres göstermez. **Operatör adresiniz**, lisansı ve stake'i tutan, ücretleri ödeyen ve hafif düğüm ödüllerini alan sıradan bir `qor1…` hesabıdır. Kurtarma kelimelerine sahip olduğunuz bir hesap olmalıdır (kendi kelimeleriniz, Keplr veya `qorechaind`); en iyisi özel bir hesaptır. Emanetçi (custodial) bir Dashboard cüzdanı, seed'ini dışa aktarmadığınız sürece düğüm çalıştıramaz. Bkz. [Operatör hesabı](/light-node/registration-and-licensing#operator-account).

Operatör hesabı anahtarını düğümün anahtarlığında saklayın:

```bash
# The account the licence is for: type its recovery words, then Enter
lightnode-sx keys add-operator --recover

# Or create a new account; its 24 words are shown once
lightnode-sx keys add-operator
```

`keys add-operator`:

- hesap anahtarını kelimelerden tam olarak `qorechaind` ve Keplr'in yaptığı gibi türetir (`m/44'/118'/0'/0/0`), anahtarlıkta `operator` olarak saklar ve hesabı `config.toml` içindeki `operator_address` alanına yazar. `operator_address` zaten farklı bir hesaba ayarlıysa reddeder;
- düğümün imzalayacağı kuantum sonrası anahtarı seçer, `operator-pqc` olarak saklar ve `key_name` değerini ona ayarlar. Hesabın zaten bir kuantum sonrası anahtarı varsa — genellikle aynı kelimelerden bir cüzdan tarafından kaydedilmiştir — bu anahtar kelimelerden yeniden oluşturulur (wallet-adapter ve Dashboard türetmeleri, `qorechaind tx pqc recover-key` ile aynı). Hesabın anahtarı yoksa kelimelerden bir anahtar türetilir; böylece kelimeler düğümün anahtarını da geri yükler. Hesabın kayıtlı anahtarı zaten düğümün mevcut anahtarıysa, o anahtar korunur. Hesabın anahtarı kelimelerden yeniden üretilemiyorsa, komut reddeder ve özel bir hesap önerir;
- `--recover` olmadan yeni bir hesap oluşturur ve 24 kelimesini bir kez gösterir. Bunları not edin; tek yedek bunlardır. Kaydolmadan önce hesaba bakiye yükleyin ve adresi için lisansı satın alın.

Anahtarlık parolası (`QORE_LIGHTNODE_KEYRING_PASSPHRASE`) bu anahtarı da düğüm anahtarı gibi korur. Ardından kaydolun:

```bash
lightnode-sx register --delegate-to qorvaloper1...
```

`register` lisansı kontrol eder, hesapta zaten yoksa kuantum sonrası anahtarı bağlar, yalnızca `--delegate-to` ile bir doğrulayıcı belirtirseniz eksik stake'i delege eder ve düğümü kaydeder; her adım bir sonrakinden önce bir blokta onaylanır. Ayrıntılar ve hesap anahtarını bir `qorechaind` anahtarlığında tutan operatörler için `register --print` alternatifi için bkz. [Kayıt ve Lisanslama](/light-node/registration-and-licensing).

## Yönetim komutları

SX CLI'si, düğüm durumunu incelemek ve anahtarları yönetmek için komutlar içerir. 3.1.7'den beri UX ikili dosyası (`lightnode-ux`) da aynı komutlara sahiptir.

| Komut | Amaç |
| --- | --- |
| `onboard` | Etkileşimli ilk çalıştırma sihirbazı. |
| `start` | Daemon'u çalıştır. |
| `selftest` | PQC kendi kendine testini çalıştır. |
| `status` | Düğüm ve hafif istemci eşitleme durumunu göster (zincir kimliği, en son yükseklik, yetişme durumu) ile `Signer` (yerel veya `qorechaind`), `Operator`, `Licence` ve `Registration` satırlarını göster. |
| `keys create <name>` | Yeni bir Dilithium-5 düğüm anahtarı oluştur ve genel anahtarını yazdır. |
| `keys list` | Anahtarlıktaki anahtarları listele (ad, tür, varsa adres, genel anahtar). |
| `keys show <name>` | Bir anahtarın türünü ve tam genel anahtarını yazdır. |
| `keys import <name> <hex-privkey>` | Onaltılık kodlanmış bir özel anahtarı içe aktar. |
| `keys export <name> [--out <file>]` | Bir özel anahtarı onaltılık olarak dışa aktar. `--out`, `qorechaind --pqc-key`'in okuduğu dosyayı yazar (sonda satır sonu yok, mod 0600). |
| `keys add-operator [--recover]` | Operatör hesabı anahtarını sakla (yeni veya standart girdiden okunan kelimelerinden kurtarılmış) ve kuantum sonrası anahtarı seç; `operator_address` değerini doldurur. Bkz. [Operatör cüzdanı](#operator-wallet). |
| `register [--delegate-to <qorvaloper>] [--print]` | Düğümü zincire kaydet: kuantum sonrası anahtar, eksik stake, kayıt; her biri bir blokta onaylanır. `--print` bunun yerine `qorechaind` komutlarını yazdırır — bkz. [Kayıt ve Lisanslama](/light-node/registration-and-licensing). |
| `validators` | Bağlı doğrulayıcıları listele. |
| `delegation` | Çalışan daemon tarafından yerel veritabanına yansıtılan haliyle operatör hesabının delegasyonlarını göster. |
| `rewards` | Operatör hesabının bekleyen staking ödüllerini göster (hafif düğüm ödülleri değil; bkz. [Ödüller ve İzleme](/light-node/rewards-and-monitoring#how-rewards-work)). |
| `network` | Yerel veritabanından ağ telemetrisini göster (son eşitlenmiş başlıklar). |
| `update [--check]` | Hafif düğüm 3.1.11 ve sonrası. `--check` daha yeni bir sürüm olup olmadığını söyler; onsuz, doğrular, kurar ve önceki ikili dosyayı `<name>.old` olarak saklar. Ardından düğümü yeniden başlatın. Bkz. [Güncelleme](#updating). |
| `version` | İkili dosya sürümünü yazdır. |

Staking, ödüller ve izleme ayrıntıları için [Ödüller ve İzleme](/light-node/rewards-and-monitoring) bölümüne bakın. Zincir üzerinde kaydolmak için [Kayıt ve Lisanslama](/light-node/registration-and-licensing) bölümüne bakın.
