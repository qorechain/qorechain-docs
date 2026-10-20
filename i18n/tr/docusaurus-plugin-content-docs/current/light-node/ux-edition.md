---
slug: /light-node/ux-edition
title: UX Sürümü (Web Dashboard)
sidebar_label: UX Sürümü
sidebar_position: 3
---

# UX Sürümü — Web Dashboard

**UX (User eXperience)** sürümü, SX sürümüyle aynı hafif düğüm daemon'unu çalıştırır, ancak düğümü ve ağı bir tarayıcıda izleyebilmeniz için **gömülü bir web dashboard'u** ekler. İkili dosya `lightnode-ux`'tur. SX sürümü gibi, bu sayfa da hafif düğüm **3.1.10**'u açıklar (zincir sürümünden ayrı, kendi sürüm hattı).

UX sürümü, masaüstü kullanımı ve komut satırı yerine görsel bir arabirimi tercih eden operatörler için doğru seçimdir.

## Kurulum

Derlenmiş ikili dosyalar **hiçbir yerel bağımlılık olmadan altı platformda** doğrudan çalışır — Linux (amd64, arm64), macOS (Intel, Apple Silicon) ve Windows (amd64, arm64) — her biri yaklaşık 13 MB. Çalıştırmadan önce indirmenin sağlama toplamını manifestle doğrulayın — nasıl yapılacağı için bkz. [SX Sürümü](/light-node/sx-edition#install).

### Kaynaktan derleme

UX sürümü **Go 1.26.1** gerektirir. Kuantum sonrası kriptografisi saf Go ile yazılmış bir uygulamadır (CGO yok, yerel kitaplık yok):

```bash
go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Sürüm etiketinden derleyin (`git checkout v3.1.10`). Bu, `build/lightnode-ux` üretir.

### Docker

UX hizmeti, kaynak deposundaki (`github.com/qorechain/qorechain-lightnode`, etiket `v3.1.10`) `Dockerfile.ux`'ten derlenir. Konteynerin başlayabilmesi için veri biriminde bir `config.toml` bulunması gerekir. UX ikili dosyası kurulum komutlarına sahip olduğundan bunu birim içinde oluşturabilirsiniz:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

docker compose run --rm lightnode-ux onboard
docker compose run --rm lightnode-ux keys add-operator --recover   # to register this node
docker compose run --rm lightnode-ux register --delegate-to qorvaloper1...
```

Bir konteynerin içinde dashboard'un tüm konteyner arabirimlerinde dinlemesi gerekir; bu nedenle bunu o yapılandırmada (birimdeki `/root/.qorechain-lightnode/config.toml`) ayarlayın ve bağlantı noktasını yalnızca ana makinenin loopback'inde yayınlayın. Birlikte gelen `docker-compose.yml`, başka makinelerden erişilebilen `8420:8420` eşlemesini yayınlar; bunu değiştirin:

```toml
[dashboard]
bind_addr = "0.0.0.0:8420"
```

```yaml
# docker-compose.yml, lightnode-ux service
ports:
  - "127.0.0.1:8420:8420"
```

```bash
docker compose up -d lightnode-ux
```

UX konteyneri, anahtarlık dahil verilerini `/root/.qorechain-lightnode` konumundaki adlandırılmış bir birimde kalıcı kılar ve zincir RPC adresini `QORECHAIN_RPC_ADDR` ortam değişkeninden okur. Düğüm kendi işlemlerini kendisi imzalar; bu nedenle bir UX konteyneri SX sürümü gibi kayıt olabilir ve heartbeat gönderebilir. UX imajı `qorechaind` içermez, dolayısıyla `qorechaind` alternatifi bu imajda kullanılamaz.

## Çalıştırma

UX düğümünü başlatın:

```bash
build/lightnode-ux start
```

Bu, daemon'u ve gömülü dashboard sunucusunu birlikte başlatır. UX sürümü her zaman dashboard'u etkinleştirir. Başlangıçta ikili dosya dashboard URL'sini yazdırır.

UX sürümü kurulumunu SX sürümüyle paylaşır: `~/.qorechain-lightnode` konumundan aynı `config.toml`'u okur ve aynı anahtarlığı kullanır; ayrıca aynı komutlara sahiptir (`onboard`, `keys`, `register`, `status`, `selftest` ve diğerleri). İlk kurulum, `lightnode-sx` yerine `lightnode-ux` ile aynı beş adımdan oluşur:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-ux onboard
lightnode-ux keys add-operator --recover
lightnode-ux register --delegate-to qorvaloper1...
lightnode-ux start
```

Her komutun ne yaptığı için bkz. [SX Sürümü](/light-node/sx-edition#first-run-onboard); gereksinimler için bkz. [Kayıt ve Lisanslama](/light-node/registration-and-licensing). UX sürümünün içindeki daemon, heartbeat'leri SX sürümüyle aynı şekilde Linux, macOS ve Windows üzerinde imzalar ve gönderir. `register` UX ikili dosyasından çalıştırıldığında düğüm `ux` türüyle kaydedilir.

## 8420 numaralı bağlantı noktasındaki web dashboard'u

Dashboard **8420 numaralı bağlantı noktasında** sunulur. Bu, `lightnode-ux` Docker imajının bildirdiği (`EXPOSE 8420`) bağlantı noktasıdır ve ikili dosyanın varsayılan olarak bağlandığı bağlantı noktasıdır; dolayısıyla Docker'da çalışırken dashboard `8420` üzerinden yayınlanır:

```
http://localhost:8420
```

:::caution Compose bağlantı noktası eşlemenizi kontrol edin
Başka yerlerdeki bazı metinler dashboard için 8080 bağlantı noktasına atıfta bulunur. Yetkili değer **8420**'dir — imajın gerçekte sunduğu ve daemon'un varsayılan olarak bağlandığı budur. Kendi `docker-compose.yml` dosyanızı veya bir ters proxy'yi uyarlarsanız, 8080'e değil **8420**'ye eşleyin.
:::

:::caution Dashboard'u koruyun
Dashboard'da giriş yoktur. `[dashboard] token` ayarlamadığınız sürece 8420 numaralı bağlantı noktasına ulaşabilen herkes yapılandırmanızı, delegasyonlarınızı ve ödüllerinizi okuyabilir; hiçbir özel anahtar asla sunulmaz. Bir token ayarlandığında her `/api` rotası ve `/ws` bağlantısı `Authorization: Bearer <token>` gerektirir (QoreX'in düğümle eşleşirken gönderdiği token); düz `http` üzerinden bu token ağda şifrelenmeden iletilir. İkili dosya artık tüm arabirimler yerine **varsayılan olarak yalnızca loopback'e** bağlanır (`127.0.0.1:8420`) ve daha geniş dinleyecek şekilde yapılandırdıysanız başlangıçta bir uyarı yazdırır — ancak bu uyarı bir reddetme değildir. Bağı kasıtlı olarak genişletiyorsanız (örneğin başka bir makineden erişmek için veya bağlantı noktasını Docker'dan yayınladığınız için), doğrudan açığa çıkarmak yerine bir token ayarlayın ve https'in (bir ters proxy veya bir SSH tüneli) arkasına yerleştirin. WebSocket telemetri bağlantısı da tarayıcının `Origin` bilgisini kontrol eder, çünkü geniş bir ağ bağı tek başına aynı tarayıcıda açık başka bir sayfanın bağlanmasını engellemez.
:::

## Dashboard neleri gösterir

Dashboard aşağıdaki görünümlere göre düzenlenmiştir:

- **Overview** — blok yüksekliği ve düğüm durumuna hızlı bakış.
- **Validators** — bağlı doğrulayıcı kümesi.
- **Delegation** — operatör hesabınızdan (`operator_address`) yansıtılan delegasyonlar.
- **Network** — canlı ağ telemetrisi ve son eşitlenmiş başlıklar.
- **Bridge** — çapraz zincir köprü telemetrisi.
- **Tokenomics** — token ekonomisi telemetrisi.
- **Settings** — düğümün etkin yapılandırması.

Telemetri gerçek zamanlı olarak güncellenir; daemon, doğrulayıcılar, ağ, köprü ve tokenomik verilerini bağımsız aralıklarda yeniler (`config.toml` içinde `[telemetry]` altında yapılandırılabilir).

### Yalnızca yerel afişi

Düğümde **yapılandırılmış bir zincir RPC uç noktası yoksa**, dashboard **yalnızca yerel modda** çalışır ve durumu açıklayan belirgin bir afiş gösterir: PQC yığını doğrulanmıştır, ancak düğüm hiçbir zinciri eşitlemiyordur, dolayısıyla blok yüksekliği `0` olarak kalır. Afiş, sizi ana makinede katılım sihirbazını çalıştırmaya yönlendirir (afişte `lightnode-sx` geçer; `lightnode-ux onboard` da aynısını yapar):

```bash
lightnode-sx onboard
```

Sihirbaz PQC kendi kendine testini çalıştırır, zincir uç noktanızı ister ve düğüm anahtarınızı içe aktarır veya oluşturur. Bir uç nokta yapılandırıldıktan sonra düğümü yeniden başlatın; dashboard canlı zincir verilerini göstermeye başlar.

## Sonraki adımlar

- [Kayıt ve Lisanslama](/light-node/registration-and-licensing) — düğümü zincir üzerinde kaydedin.
- [Ödüller ve İzleme](/light-node/rewards-and-monitoring) — %3 hafif düğüm payının nasıl hesaba yazıldığı ve talep edildiği ve düğüm sağlığının nasıl izleneceği.
