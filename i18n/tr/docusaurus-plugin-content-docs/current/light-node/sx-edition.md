---
slug: /light-node/sx-edition
title: SX Sürümü (Sunucu Daemon'u)
sidebar_label: SX Sürümü
sidebar_position: 2
---

# SX Sürümü — Sunucu Daemon'u

**SX (Server eXperience)** sürümü başsız hafif düğümdür: sunucular ve otomasyon için tasarlanmış bir daemon artı tam bir yönetim CLI'si. İkili dosya `lightnode-sx`'tir. Bu, önceden derlenmiş ikili dosyalar için hafif düğümün **v3.1.3** hattıdır (Docker derlemeleri için kaynak etiketi `v3.1.4`); zincir sürümünden ayrı, kendi sürümüdür.

## Kurulum {#install}

Önceden derlenmiş ikili dosyalar en kolay yoldur — hafif düğüm istemcisi **altı platformda, hiçbir yerel bağımlılık olmadan** doğal olarak çalışır: Linux (amd64, arm64), macOS (Intel, Apple Silicon) ve Windows (amd64, arm64) — SX ve UX sürümleri genelinde toplam 12 ikili dosya. Her ikili dosya yaklaşık 11–12 MB'tır — indirin ve çalıştırın, kurulacak ayrı bir kitaplık yoktur.

**Çalıştırmadan önce sağlama toplamını doğrulayın.** `https://download.qore.host/<net>/lightnode/latest.json` adresindeki sürüm manifestosu her ikili dosya için bir `sha256` değeri, tüm sürümü kapsayan bir `SHA256SUMS` dosyasını gösteren bir `checksums.url` ve o dosyanın kendi `checksums.sha256` değerini taşır. İndirdiğinizi doğrulayın — bu bir dipnot değildir, gerçekten derlenen ikili dosyayı çalıştırmakla o URL'ye her ne indiyse onu çalıştırmak arasındaki farktır:

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

Windows'ta `certutil -hashfile lightnode-sx-<platform>.exe SHA256` çıktısını manifestodaki değerle karşılaştırın. Her iki ağ da şu anda aynı v3.1.3 derlemesini sunmaktadır. Kaynak kodu `github.com/qorechain/qorechain-lightnode` adresinde herkese açıktır (Apache 2.0).

İkili dosyayı kaynaktan da derleyebilir veya Docker ile çalıştırabilirsiniz.

### Kaynaktan derleme

Hafif düğüm **Go 1.26.1** gerektirir. Kuantum sonrası kriptografisi saf Go ile uygulanmıştır (CGO yok, yerel kitaplık yok), bu nedenle desteklenen altı platformdan herhangi biri için çapraz derleme, herhangi bir Go ikili dosyasıyla aynı şekilde çalışır:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Bu, `build/lightnode-sx` üretir. Doğrudan çalıştırın veya `PATH`'inize kopyalayın. Kaydolmadan önce kuantum sonrası imzalama yığınını [`selftest`](#verify-the-pqc-stack-selftest) ile sağlık kontrolünden geçirin.

### Docker {#docker}

Önceden derlenmiş bir kayıt defteri imajı yoktur; imajı kaynak etiketinden kendiniz derlersiniz. **`v3.1.4` veya daha yeni** bir etiket kullanın: `v3.1.3`'ten derlenen imaj, zincirin artık reddettiği eski bir `qorechaind` imzalayıcısını içerir; bu yüzden heartbeat'leri ve ödül talepleri başarısız olur. Mevcut bir kurulumu güncellemek için yeni etiketten yeniden derleyin (`git fetch --tags && git checkout v3.1.4 && docker compose build --no-cache lightnode-sx`); pull yapmak hiçbir şey değiştirmez.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.4

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring
export QORE_LIGHTNODE_QORECHAIND_PASSPHRASE='...'   # qorechaind keyring (operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: write config.toml and the node key into the data volume.
docker compose run --rm lightnode-sx onboard
# Then set chain_id, key_name, operator_address and [heartbeat] key_name in
# /root/.qorechain-lightnode/config.toml inside the volume (see "First run").

docker compose up -d lightnode-sx
```

`QORECHAIN_RPC_ADDR` değişkenini her `docker compose` komutunda dışa aktarılmış tutun: yapılandırmadaki `rpc_addr` değerini geçersiz kılar ve compose varsayılanı `host.docker.internal:26657` adresine işaret eder. SX konteyneri, verilerini `/root/.qorechain-lightnode` konumuna bağlanmış adlandırılmış bir birimde kalıcı kılar.

İmaj ayrıca yayınlanmış bir `qorechaind` (v3.2.0, linux/amd64) içerir; derleme sırasında sürüm kanalından indirilir ve sabitlenmiş bir özetle (digest) doğrulanır. Daemon, heartbeat'leri ve ödül taleplerini imzalamak için bunu kullanır; böylece bir konteyner düğümü ikinci bir kurulum olmadan zincir üzerinde etkin kalabilir. Bir ağ daha sonra paketlenmiş imzalayıcıyı reddeden bir sürüme yükseltilirse, `[heartbeat] qorechaind_path` değerini o ağın manifestosunda (`https://download.qore.host/<net>/latest.json`) listelenen daha yeni `qorechaind`'e yöneltin. Bir arm64 ana bilgisayarda (örneğin Apple Silicon) derlemede imzalayıcı bulunmaz; birine ihtiyacınız varsa `DOCKER_DEFAULT_PLATFORM=linux/amd64` ile derleyin. İmzalayıcı operatör cüzdanına ihtiyaç duyar: `qorechaind` ana dizininizi (operatör anahtarını tutan anahtarlık ve `pqc/<key_name>.dilithium` altında dışa aktarılmış düğüm anahtarı) `/root/.qorechaind` konumuna bağlayın; `docker-compose.yml` varsayılan olarak `~/.qorechaind` dizinini bağlar, ya da `QORECHAIND_HOME` ayarlayın. İki parola (passphrase), düğüm anahtarlığının ve `qorechaind` anahtarlığının parolalarıdır; ikincisi `qorechaind`'e stdin üzerinden iletilir ve hiçbir zaman komut satırında görünmez. Bkz. [Operatör cüzdanı](#operator-wallet).

## Yapılandırma

Hafif düğüm bir TOML yapılandırma dosyası okur. Varsayılan olarak ana dizinde (`~/.qorechain-lightnode/config.toml`) `config.toml` arar. Bu dosyayı normalde elle yazmazsınız — [`onboard` sihirbazı](#first-run-onboard) sizin için oluşturur — ancak seçenekleri anlamak yararlıdır.

İki kalıcı bayrak her komuta uygulanır:

- `--config <path>` — varsayılan olmayan bir konumdaki bir yapılandırma dosyasına yönlendirin.
- `--home <dir>` — veriler ve anahtarlar için kullanılan ana dizini geçersiz kılın (varsayılan `~/.qorechain-lightnode`).

Kullanım düzeyinde en ilgili yapılandırma seçenekleri:

| Seçenek | Neyi kontrol eder |
| --- | --- |
| `chain_id` | Ağ tanımlayıcısı (örneğin testnet'te `qorechain-diana`, mainnet'te `qorechain-vladi`). `onboard` değeri `qorechain-diana` olarak bıraktığı için onu sonradan kendiniz ayarlayın; imzalayıcı bunu kullanır. |
| `rpc_addr` | Daemon'un bağlandığı zincir RPC uç noktası. **Yalnızca yerel modda** çalıştırmak için boş bırakın. |
| `primary_addr` / `witness_addrs` | Birincil RPC uç noktası ve raporladığı başlığın doğrulandığı tanık uç noktaları — bkz. [Neden hafif düğüm çalıştırılır](/light-node/overview#why-run-a-light-node). En az bir farklı, erişilebilir tanık, `assurance` değerini (debug düzeyinde günlüğe yazılır) `trusted-single-source`'tan `corroborated-across-sources`'a taşıyan şeydir. |
| `trust_period` / `max_clock_drift` | Uyumluluk için kabul edilir ancak şu anda kullanılmaz. Başlık güveni, yukarıda açıklanan birincil/tanık doğrulamasından gelir. |
| `data_dir` | Düğümün veritabanını ve başlıklarını sakladığı yer. |
| `keyring_backend` / `key_name` | Anahtarlık arka ucu (`file`, `os` veya yalnızca yerel devnet'ler için `test`) ve düğümün kuantum sonrası anahtar adı. `file` arka ucu, ortamda `QORE_LIGHTNODE_KEYRING_PASSPHRASE` tanımlı olmasını gerektirir. |
| `operator_address` | Bu düğümün ait olduğu hesap (`qor1...`); yükleme sırasında doğrulanır. `register`, `status` ve heartbeat'ler için gereklidir. Bkz. [Operatör cüzdanı](#operator-wallet). |
| `api_addr` | REST uç noktası. Boş olduğunda `rpc_addr`'dan türetilir (26657 portu 1317 olur; `rpc.` ana bilgisayarları `api.` olur), dolayısıyla yalnızca bu iki kuralı da izlemeyen uç noktalar için gereklidir. |
| `[heartbeat]` | Varsayılan olarak açıktır. `qorechaind_path` (boş, `PATH`'teki `qorechaind` anlamına gelir; Docker imajı onu içerir), `qorechaind_home` (boş, `~/.qorechaind` anlamına gelir), `key_name` (`qorechaind` hesap anahtarı; varsayılan olarak üst düzey `key_name`), `interval_blocks` (zincirin `heartbeat_interval` değeriyle, yani 1000 ile eşleştirin), `check_interval` (varsayılan `60s`), `fees` (varsayılan `50000uqor`) ve `gas` (varsayılan `300000`). |
| `[delegation]` | `auto_claim` (varsayılan olarak kapalı: birikmiş hafif düğüm ödüllerini imzalayıcı aracılığıyla operatör cüzdanına talep eder; düğüm sunucudan asla yeniden delege etmez), kontrol aralığı, talep için minimum ödül, `rebalance_enabled` ve `min_reputation` (yalnızca itibar uyarıları — düğüm stake'i asla taşımaz). `validators` ve `split_weights` kabul edilir ancak şu anda işleme alınmaz. |
| `[telemetry]` | Telemetrinin etkin olup olmadığı ve doğrulayıcılar, ağ, köprü ve tokenomik için yenileme aralıkları. |
| `log_level` / `log_format` | Günlük ayrıntı düzeyi (`debug`, `info`, `warn`, `error`) ve biçim (`text` veya `json`). |

### Ortam değişkenleri {#environment-variables}

| Değişken | Kullanım amacı |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | Düğüm anahtarlığının parolası (`keyring_backend = "file"`). Zorunludur; düğüm boş bir parolayı reddeder. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | Operatör anahtarını tutan `qorechaind` anahtarlığının parolası; `qorechaind`'e stdin üzerinden iletilir, hiçbir zaman komut satırında görünmez. |
| `QORECHAIN_RPC_ADDR` | `rpc_addr` değerini (ve `rpc_addr`'a eşit olduğunda `primary_addr` değerini) geçersiz kılar. `docker-compose.yml` tarafından ayarlanır. |

:::note Tanık uç noktaları başlangıçta doğrulanır
Birincil ile aynı ana bilgisayardaki bir tanık reddedilir — güvenliği ihlal edilmiş bir uç nokta yalnızca kendisiyle aynı fikirde olur, dolayısıyla hiçbir şeyi doğrulamaz. Uzak bir ana bilgisayardaki düz metin `http://` tanığı da reddedilir, çünkü o bağlantıyı yeniden yazabilen bir saldırgan aynı anda her tanık gibi yanıt verebilir; loopback `http://` sorun değildir. Tanıkları, bağımsız olarak güvenmek için nedenleriniz olan RPC uç noktalarına yönlendirin.
:::

Delegasyon varsayılanları, itibar farkındalıklı yeniden dengeleme uyarılarını etkinleştirir ve `auto_claim` seçeneğini kapalı bırakır — bunların ne yaptığını öğrenmek için [Ödüller ve İzleme](/light-node/rewards-and-monitoring) bölümüne bakın.

## İlk çalıştırma: `onboard` {#first-run-onboard}

İlk başlatmada, henüz bir yapılandırma dosyası yoksa `start` duracak ve sizi katılım sihirbazına yönlendirecektir. Sihirbazı çalıştırın:

```bash
build/lightnode-sx onboard
```

`onboard`, kurulum boyunca size dört adımda yol gösterir:

1. **PQC kendi kendine testi** — tam Dilithium-5 gidiş-dönüşünü çalıştırır ([`selftest`](#verify-the-pqc-stack-selftest) ile aynı kontroller). PQC yığını başarısız olursa, sihirbaz devam etmeyi reddeder.
2. **Zincir RPC uç noktası** — QoreChain RPC URL'nizi yapıştırın veya zincir bağlantısı gerekmeyen süre boyunca **yalnızca yerel modda** çalıştırmak için boş bırakın. Bir URL sağlarsanız, sihirbaz erişilebilirliği canlı olarak test eder.
3. **Düğüm anahtarı** — sihirbaz buna "doğrulayıcı özel anahtarı" der, ancak bu bir doğrulayıcı anahtarı değil, hafif düğümün kendi Dilithium-5 anahtarıdır. Onaltılık kodlanmış bir Dilithium-5 özel anahtarı yapıştırın veya bu düğümde yeni bir anahtar çifti oluşturmak için `g` (veya `generate`) yazın.
4. **Kaydet** — `config.toml` yazar ve anahtarı anahtarlıkta `validator` adı altında saklar (bu ad alınmışsa `validator-<hex>`). Dosya anahtarlığı, bu adım için ve onu açan sonraki her komut için ortamda `QORE_LIGHTNODE_KEYRING_PASSPHRASE` tanımlı olmasını gerektirir.

:::note Yalnızca yerel mod
Uç noktayı boş bırakırsanız, daemon yalnızca yerel modda başlar: PQC yığını tam olarak çalıştırılır, ancak düğüm hiçbir zinciri eşitlemez. Zincir uç noktanız hazır olduğunda, düğümü ona yönlendirmek için `onboard` komutunu yeniden çalıştırın.
:::

`onboard` her zaman etkin yapılandırmanın üzerine yazar. Varsayılan olmayan bir yola yazmak için `--config`, sormak yerine hızlı başarısız olmak için (CI'de yararlıdır) `--non-interactive` kullanın.

:::caution Katılımdan sonra yapılandırmayı tamamlayın
`onboard`, hangi ağa katıldığınızı veya hangi hesabın sizin olduğunu bilmez. `register` komutunu çalıştırmadan veya heartbeat'lere güvenmeden önce `config.toml` dosyasını düzenleyin:

```toml
chain_id         = "qorechain-vladi"   # mainnet; testnet is "qorechain-diana". onboard leaves "qorechain-diana".
key_name         = "validator"         # the key onboard created; see `lightnode-sx keys list`
operator_address = "qor1..."           # your funded operator account

[heartbeat]
key_name = "operator"                  # the qorechaind key that holds operator_address
```

Üst düzeydeki `key_name`, düğümün kuantum sonrası anahtarıdır (dosyası `qorechaind` ana dizininde `pqc/<key_name>.dilithium`'dur); `[heartbeat] key_name` ise ücreti ödeyen `qorechaind` hesap anahtarıdır. Anahtarın adı `validator` iken `key_name = "operator"` bırakırsanız, `register` `node key "operator" not found` hatasıyla durur.
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

Düğümün Dilithium-5 anahtarı bir cüzdan **değildir**. QoreChain'de kuantum sonrası bir anahtar bir hesaba eklenir; hesap oluşturmaz. Bu yüzden `keys list` onun için bir adres göstermez. **Operatör adresiniz**, `qorechaind` ile oluşturulmuş, bakiyesi olan sıradan bir `qor1…` hesabıdır; düğüm bu hesaptan kaydedilir ve hafif düğüm ödüllerini de bu hesap alır. Düğüm anahtarı, o hesabın kuantum sonrası anahtarı olur.

Bir kez kurun:

```bash
# 1. Create and fund the operator account (any Cosmos wallet works; qorechaind shown)
qorechaind keys add operator
qorechaind keys show operator -a          # -> qor1..., fund it with a little QOR for fees

# 2. Tell the node which account it belongs to
#    config.toml:  operator_address = "qor1..."

# 3. Let the node print the two chain commands (attach the key, register the node)
lightnode-sx register
```

`register`, sizin değerlerinizle doldurulmuş olarak şunları yazdırır: düğüm anahtarını hesaba bağlayan `qorechaind tx pqc register-key-v2 dilithium5 … hybrid` komutu (bir kez) ve düğümü kaydeden `tx lightnode register … --generate-only` ile `tx pqc cosign` çifti. Zincir her işlemde kuantum sonrası ortak imza ister; kaydın bir değil iki komut olmasının nedeni budur. Kayıt ayrıca operatör adresinde etkin bir `lightnode_operator` lisansı gerektirir; olmadan zincir işlemi reddeder. Kayıt henüz açık değildir: bkz. [Ödül programının durumu](/light-node/overview#reward-program-status).

## Yönetim komutları

SX CLI'si, düğüm durumunu incelemek ve anahtarları yönetmek için komutlar içerir:

| Komut | Amaç |
| --- | --- |
| `onboard` | Etkileşimli ilk çalıştırma sihirbazı. |
| `start` | Daemon'u çalıştır. |
| `selftest` | PQC kendi kendine testini çalıştır. |
| `status` | Düğüm ve hafif istemci eşitleme durumunu göster (zincir kimliği, en son yükseklik, yetişme durumu) ile `Signer`, `Operator`, `Licence` ve `Registration` satırlarını göster. |
| `keys create <name>` | Yeni bir Dilithium-5 düğüm anahtarı oluştur ve genel anahtarını yazdır. |
| `keys list` | Anahtarlıktaki anahtarları listele (ad, tür, varsa adres, genel anahtar). |
| `keys show <name>` | Bir anahtarın türünü ve tam genel anahtarını yazdır. |
| `keys import <name> <hex-privkey>` | Onaltılık kodlanmış bir özel anahtarı içe aktar. |
| `keys export <name>` | Bir özel anahtarı onaltılık olarak dışa aktar (`qorechaind`'in `~/.qorechaind/pqc/` altından okuduğu biçimle aynı). |
| `register` | Düğüm anahtarını operatör hesabınıza bağlayan ve düğümü kaydeden zincir komutlarını yazdır — bkz. [Kayıt ve Lisanslama](/light-node/registration-and-licensing). |
| `validators` | Bağlı doğrulayıcıları listele. |
| `delegation` | Yerel veritabanından mevcut delegasyonları göster ([Ödüller ve İzleme](/light-node/rewards-and-monitoring#how-rewards-work) bölümündeki bilinen kısıta bakın). |
| `rewards` | Bekleyen staking ödüllerini göster (aynı kısıt). |
| `network` | Yerel veritabanından ağ telemetrisini göster (son eşitlenmiş başlıklar). |
| `version` | İkili dosya sürümünü yazdır. |

Staking, ödüller ve izleme ayrıntıları için [Ödüller ve İzleme](/light-node/rewards-and-monitoring) bölümüne bakın. Zincir üzerinde kaydolmak için [Kayıt ve Lisanslama](/light-node/registration-and-licensing) bölümüne bakın.
