---
slug: /light-node/ux-edition
title: UX Sürümü (Web Dashboard)
sidebar_label: UX Sürümü
sidebar_position: 3
---

# UX Sürümü — Web Dashboard

**UX (User eXperience)** sürümü, SX sürümüyle aynı hafif düğüm daemon'unu çalıştırır, ancak düğümü ve ağı bir tarayıcıda izleyebilmeniz için **gömülü bir web dashboard'u** ekler. İkili dosya `lightnode-ux`'tur. SX sürümü gibi, bu da hafif düğümün **v3.1.1** hattıdır (zincir sürümünden ayrı, kendi sürümü).

UX sürümü, masaüstü kullanımı ve komut satırı yerine görsel bir arabirimi tercih eden operatörler için doğru seçimdir.

## Kurulum

### Kaynaktan derleme

UX sürümü **Go 1.26.1** gerektirir ve kuantum sonrası yerel kitaplık için CGO etkin olarak derlenir:

```bash
CGO_ENABLED=1 go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Bu, `build/lightnode-ux` üretir.

### Docker

UX hizmeti `Dockerfile.ux`'ten derlenir:

```bash
docker compose up lightnode-ux
```

UX konteyneri verilerini `/root/.qorechain-lightnode` konumundaki adlandırılmış bir birimde kalıcı kılar ve zincir RPC adresini `QORECHAIN_RPC_ADDR` ortam değişkeninden okur.

## Çalıştırma

UX düğümünü başlatın:

```bash
build/lightnode-ux start
```

Bu, daemon'u ve gömülü dashboard sunucusunu birlikte başlatır. UX sürümü her zaman dashboard'u etkinleştirir. Başlangıçta ikili dosya dashboard URL'sini yazdırır.

UX sürümü kurulumunu SX sürümüyle paylaşır: `~/.qorechain-lightnode` konumundan aynı `config.toml`'u okur ve aynı Dilithium-5 anahtarlığını kullanır. Düğümü henüz yapılandırmadıysanız, yapılandırmayı yazmak ve anahtarınızı içe aktarmak veya oluşturmak için önce SX sihirbazını (`lightnode-sx onboard`) çalıştırın — bkz. [SX Sürümü](/light-node/sx-edition).

## 8420 numaralı bağlantı noktasındaki web dashboard'u

Dashboard **8420 numaralı bağlantı noktasında** sunulur. Bu, `lightnode-ux` Docker imajının bildirdiği (`EXPOSE 8420`) bağlantı noktasıdır ve ikili dosyanın varsayılan olarak bağlandığı bağlantı noktasıdır; dolayısıyla Docker'da çalışırken dashboard `8420` üzerinden yayınlanır:

```
http://localhost:8420
```

:::caution Compose bağlantı noktası eşlemenizi kontrol edin
Başka yerlerdeki bazı metinler dashboard için 8080 bağlantı noktasına atıfta bulunur. Yetkili değer **8420**'dir — imajın gerçekte sunduğu ve daemon'un varsayılan olarak bağlandığı budur. Kendi `docker-compose.yml` dosyanızı veya bir ters proxy'yi uyarlarsanız, 8080'e değil **8420**'ye eşleyin.
:::

## Dashboard neleri gösterir

Dashboard aşağıdaki görünümlere göre düzenlenmiştir:

- **Overview** — blok yüksekliği ve düğüm durumuna hızlı bakış.
- **Validators** — bağlı doğrulayıcı kümesi.
- **Delegation** — mevcut delegasyonlarınız ve bölünmeleri.
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

Sihirbaz PQC kendi kendine testini çalıştırır, zincir uç noktanızı ister ve doğrulayıcı anahtarınızı içe aktarır veya oluşturur. Bir uç nokta yapılandırıldıktan sonra düğümü yeniden başlatın; dashboard canlı zincir verilerini göstermeye başlar.

## Sonraki adımlar

- [Kayıt ve Lisanslama](/light-node/registration-and-licensing) — düğümü zincir üzerinde kaydedin.
- [Ödüller ve İzleme](/light-node/rewards-and-monitoring) — %3 hafif düğüm payını kazanın ve düğüm sağlığını izleyin.
