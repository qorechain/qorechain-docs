---
slug: /light-node/ux-edition
title: UX Sürümü (Web Dashboard)
sidebar_label: UX Sürümü
sidebar_position: 3
---

# UX Sürümü — Web Dashboard

**UX (User eXperience)** sürümü, SX sürümüyle aynı hafif düğüm daemon'unu çalıştırır, ancak düğümü ve ağı bir tarayıcıda izleyebilmeniz için **gömülü bir web dashboard'u** ekler. İkili dosya `lightnode-ux`'tur. SX sürümü gibi, bu da hafif düğümün **v3.1.3** hattıdır (zincir sürümünden ayrı, kendi sürümü).

UX sürümü, masaüstü kullanımı ve komut satırı yerine görsel bir arabirimi tercih eden operatörler için doğru seçimdir.

## Kurulum

Derlenmiş ikili dosyalar **hiçbir yerel bağımlılık olmadan altı platformda** doğrudan çalışır — Linux (amd64, arm64), macOS (Intel, Apple Silicon) ve Windows (amd64, arm64) — her biri yaklaşık 11–12 MB. Çalıştırmadan önce indirmenin sağlama toplamını manifestle doğrulayın — nasıl yapılacağı için bkz. [SX Sürümü](/light-node/sx-edition#install).

### Kaynaktan derleme

UX sürümü **Go 1.26.1** gerektirir. Kuantum sonrası kriptografisi saf Go ile yazılmış bir uygulamadır (CGO yok, yerel kitaplık yok):

```bash
go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Bu, `build/lightnode-ux` üretir.

### Docker

UX hizmeti, kaynak deposundaki (`github.com/qorechain/qorechain-lightnode`, etiket `v3.1.4` veya daha yenisi) `Dockerfile.ux`'ten derlenir. Konteynerin başlayabilmesi için veri biriminde bir `config.toml` bulunması gerekir; kurulum sihirbazı SX ikili dosyasında yer aldığından, yapılandırmayı önce SX sürümüyle oluşturun ([SX Sürümü](/light-node/sx-edition#first-run-onboard) bölümüne bakın) ve birime kopyalayın. Bir konteynerin içinde dashboard'un tüm konteyner arabirimlerinde dinlemesi gerekir; bu nedenle bunu o yapılandırmada ayarlayın ve bağlantı noktasını yalnızca ana makinenin loopback'inde yayınlayın:

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
QORECHAIN_RPC_ADDR=https://rpc.qore.host docker compose up lightnode-ux
```

UX konteyneri verilerini `/root/.qorechain-lightnode` konumundaki adlandırılmış bir birimde kalıcı kılar ve zincir RPC adresini `QORECHAIN_RPC_ADDR` ortam değişkeninden okur. UX imajı `qorechaind` imzalayıcısını içermez; bu nedenle bir UX konteyneri zincir üzerinde heartbeat gönderemez; kayıtlı bir düğümü SX sürümüyle çalıştırın.

## Çalıştırma

UX düğümünü başlatın:

```bash
build/lightnode-ux start
```

Bu, daemon'u ve gömülü dashboard sunucusunu birlikte başlatır. UX sürümü her zaman dashboard'u etkinleştirir. Başlangıçta ikili dosya dashboard URL'sini yazdırır.

UX sürümü kurulumunu SX sürümüyle paylaşır: `~/.qorechain-lightnode` konumundan aynı `config.toml`'u okur ve aynı Dilithium-5 anahtarlığını kullanır. Düğümü henüz yapılandırmadıysanız, yapılandırmayı yazmak ve anahtarınızı içe aktarmak veya oluşturmak için önce SX sihirbazını (`lightnode-sx onboard`) çalıştırın — bkz. [SX Sürümü](/light-node/sx-edition). UX ikili dosyasında yalnızca `start` ve `version` komutları bulunur; `register`, `status` ve `keys` için `lightnode-sx` kullanın. UX sürümünün içindeki daemon, bir `qorechaind` imzalayıcısı mevcut olduğunda heartbeat'leri SX sürümüyle aynı şekilde gönderir.

## 8420 numaralı bağlantı noktasındaki web dashboard'u

Dashboard **8420 numaralı bağlantı noktasında** sunulur. Bu, `lightnode-ux` Docker imajının bildirdiği (`EXPOSE 8420`) bağlantı noktasıdır ve ikili dosyanın varsayılan olarak bağlandığı bağlantı noktasıdır; dolayısıyla Docker'da çalışırken dashboard `8420` üzerinden yayınlanır:

```
http://localhost:8420
```

:::caution Compose bağlantı noktası eşlemenizi kontrol edin
Başka yerlerdeki bazı metinler dashboard için 8080 bağlantı noktasına atıfta bulunur. Yetkili değer **8420**'dir — imajın gerçekte sunduğu ve daemon'un varsayılan olarak bağlandığı budur. Kendi `docker-compose.yml` dosyanızı veya bir ters proxy'yi uyarlarsanız, 8080'e değil **8420**'ye eşleyin.
:::

:::caution Dashboard'daki hiçbir rota kimlik doğrulaması yapmaz
8420 numaralı bağlantı noktasının arkasındaki hiçbir şeyde giriş veya erişim kontrolü yoktur — oraya ulaşabilen herkes yapılandırmanızı, delegasyonlarınızı ve ödüllerinizi okuyabilir; hiçbir özel anahtar asla sunulmaz. İkili dosya artık tüm arabirimler yerine **varsayılan olarak yalnızca loopback'e** bağlanır (`127.0.0.1:8420`) ve daha geniş dinleyecek şekilde yapılandırdıysanız başlangıçta bir uyarı yazdırır — ancak bu uyarı bir reddetme değildir ve kimlik doğrulaması eklemez. Bağı kasıtlı olarak genişletiyorsanız (örneğin başka bir makineden erişmek için veya bağlantı noktasını Docker'dan yayınladığınız için), doğrudan açığa çıkarmak yerine kimlik doğrulaması gerektiren bir ters proxy'nin arkasına yerleştirin. WebSocket telemetri bağlantısı da tarayıcının `Origin` bilgisini kontrol eder, çünkü geniş bir ağ bağı tek başına aynı tarayıcıda açık başka bir sayfanın bağlanmasını engellemez.
:::

## Dashboard neleri gösterir

Dashboard aşağıdaki görünümlere göre düzenlenmiştir:

- **Overview** — blok yüksekliği ve düğüm durumuna hızlı bakış.
- **Validators** — bağlı doğrulayıcı kümesi.
- **Delegation** — operatör hesabınızdan yansıtılan delegasyonlar ([Ödüller ve İzleme](/light-node/rewards-and-monitoring#how-rewards-work) bölümündeki bilinen sınırlamaya bakın).
- **Network** — canlı ağ telemetrisi ve son eşitlenmiş başlıklar.
- **Bridge** — çapraz zincir köprü telemetrisi.
- **Tokenomics** — token ekonomisi telemetrisi.
- **Settings** — düğümün etkin yapılandırması.

Telemetri gerçek zamanlı olarak güncellenir; daemon, doğrulayıcılar, ağ, köprü ve tokenomik verilerini bağımsız aralıklarda yeniler (`config.toml` içinde `[telemetry]` altında yapılandırılabilir).

### Yalnızca yerel afişi

Düğümde **yapılandırılmış bir zincir RPC uç noktası yoksa**, dashboard **yalnızca yerel modda** çalışır ve durumu açıklayan belirgin bir afiş gösterir: PQC yığını doğrulanmıştır, ancak düğüm hiçbir zinciri eşitlemiyordur, dolayısıyla blok yüksekliği `0` olarak kalır. Afiş, sizi ana makinede katılım sihirbazını çalıştırmaya yönlendirir:

```bash
lightnode-sx onboard
```

Sihirbaz PQC kendi kendine testini çalıştırır, zincir uç noktanızı ister ve düğüm anahtarınızı içe aktarır veya oluşturur. Bir uç nokta yapılandırıldıktan sonra düğümü yeniden başlatın; dashboard canlı zincir verilerini göstermeye başlar.

## Sonraki adımlar

- [Kayıt ve Lisanslama](/light-node/registration-and-licensing) — düğümü zincir üzerinde kaydedin.
- [Ödüller ve İzleme](/light-node/rewards-and-monitoring) — %3 hafif düğüm payının nasıl hesaba yazıldığı ve talep edildiği ve düğüm sağlığının nasıl izleneceği.
