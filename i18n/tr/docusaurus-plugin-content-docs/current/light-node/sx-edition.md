---
slug: /light-node/sx-edition
title: SX Sürümü (Sunucu Daemon'u)
sidebar_label: SX Sürümü
sidebar_position: 2
---

# SX Sürümü — Sunucu Daemon'u

**SX (Server eXperience)** sürümü başsız hafif düğümdür: sunucular ve otomasyon için tasarlanmış bir daemon artı tam bir yönetim CLI'si. İkili dosya `lightnode-sx`'tir. Bu, hafif düğümün **v3.1.1** hattıdır (zincir sürümünden ayrı, kendi sürümü).

## Kurulum

İkili dosyayı kaynaktan derleyebilir veya Docker ile çalıştırabilirsiniz.

### Kaynaktan derleme

Hafif düğüm **Go 1.26.1** gerektirir ve CGO etkin olarak derlenir; çünkü kuantum sonrası kriptografi yerel bir kitaplık (`libqorepqc`) kullanır.

```bash
CGO_ENABLED=1 go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Bu, `build/lightnode-sx` üretir. Doğrudan çalıştırın veya `PATH`'inize kopyalayın.

### Docker

Bir Docker kurulumu sağlanmıştır. SX hizmeti `Dockerfile.sx`'ten derlenir:

```bash
docker compose up lightnode-sx
```

SX konteyneri, verilerini `/root/.qorechain-lightnode` konumuna bağlanmış adlandırılmış bir birimde kalıcı kılar ve zincir RPC adresini `QORECHAIN_RPC_ADDR` ortam değişkeninden okur.

## Yapılandırma

Hafif düğüm bir TOML yapılandırma dosyası okur. Varsayılan olarak ana dizinde (`~/.qorechain-lightnode/config.toml`) `config.toml` arar. Bu dosyayı normalde elle yazmazsınız — [`onboard` sihirbazı](#first-run-onboard) sizin için oluşturur — ancak seçenekleri anlamak yararlıdır.

İki kalıcı bayrak her komuta uygulanır:

- `--config <path>` — varsayılan olmayan bir konumdaki bir yapılandırma dosyasına yönlendirin.
- `--home <dir>` — veriler ve anahtarlar için kullanılan ana dizini geçersiz kılın (varsayılan `~/.qorechain-lightnode`).

Kullanım düzeyinde en ilgili yapılandırma seçenekleri:

| Seçenek | Neyi kontrol eder |
| --- | --- |
| `chain_id` | Ağ tanımlayıcısı (örneğin testnet'te `qorechain-diana`, mainnet'te `qorechain-vladi`). |
| `rpc_addr` | Daemon'un bağlandığı zincir RPC uç noktası. **Yalnızca yerel modda** çalıştırmak için boş bırakın. |
| `primary_addr` / `witness_addrs` | Atlama hafif istemcisi tarafından kullanılan birincil ve tanık RPC uç noktaları. |
| `trust_period` / `max_clock_drift` | Hafif istemci güven penceresi (örneğin `168h`) ve izin verilen saat kayması. |
| `data_dir` | Düğümün veritabanını ve başlıklarını sakladığı yer. |
| `keyring_backend` / `key_name` | Anahtarlık arka ucu (`file` veya `os`) ve operatör anahtar adı. |
| `[delegation]` | Otomatik bileşiklendirme açık/kapalı, bileşiklendirme aralığı, talep için minimum ödül, doğrulayıcı kümesi, bölünme ağırlıkları, yeniden dengeleme ve minimum itibar. |
| `[telemetry]` | Telemetrinin etkin olup olmadığı ve doğrulayıcılar, ağ, köprü ve tokenomik için yenileme aralıkları. |
| `log_level` / `log_format` | Günlük ayrıntı düzeyi (`debug`, `info`, `warn`, `error`) ve biçim (`text` veya `json`). |

Delegasyon varsayılanları, `1h` aralığında otomatik bileşiklendirmeyi ve itibar farkındalıklı yeniden dengelemeyi etkinleştirir — bunların ne yaptığını öğrenmek için [Ödüller ve İzleme](/light-node/rewards-and-monitoring) bölümüne bakın.

## İlk çalıştırma: `onboard` {#first-run-onboard}

İlk başlatmada, henüz bir yapılandırma dosyası yoksa `start` duracak ve sizi katılım sihirbazına yönlendirecektir. Sihirbazı çalıştırın:

```bash
build/lightnode-sx onboard
```

`onboard`, kurulum boyunca size dört adımda yol gösterir:

1. **PQC kendi kendine testi** — tam Dilithium-5 gidiş-dönüşünü çalıştırır ([`selftest`](#verify-the-pqc-stack-selftest) ile aynı kontroller). PQC yığını başarısız olursa, sihirbaz devam etmeyi reddeder.
2. **Zincir RPC uç noktası** — QoreChain RPC URL'nizi yapıştırın veya zincir bağlantısı gerekmeyen süre boyunca **yalnızca yerel modda** çalıştırmak için boş bırakın. Bir URL sağlarsanız, sihirbaz erişilebilirliği canlı olarak test eder.
3. **Doğrulayıcı özel anahtarı** — onaltılık kodlanmış bir Dilithium-5 özel anahtarı yapıştırın veya bu düğümde yeni bir anahtar çifti oluşturmak için `g` (veya `generate`) yazın.
4. **Kaydet** — `config.toml` yazar ve anahtarı anahtarlıkta saklar.

:::note Yalnızca yerel mod
Uç noktayı boş bırakırsanız, daemon yalnızca yerel modda başlar: PQC yığını tam olarak çalıştırılır, ancak düğüm hiçbir zinciri eşitlemez. Zincir uç noktanız hazır olduğunda, düğümü ona yönlendirmek için `onboard` komutunu yeniden çalıştırın.
:::

`onboard` her zaman etkin yapılandırmanın üzerine yazar. Varsayılan olmayan bir yola yazmak için `--config`, sormak yerine hızlı başarısız olmak için (CI'de yararlıdır) `--non-interactive` kullanın.

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

## Yönetim komutları

SX CLI'si, düğüm durumunu incelemek ve anahtarları yönetmek için komutlar içerir:

| Komut | Amaç |
| --- | --- |
| `status` | Düğüm ve hafif istemci eşitleme durumunu göster (zincir kimliği, en son yükseklik, yetişme durumu). |
| `keys create <name>` | Yeni bir Dilithium-5 anahtarı oluştur. |
| `keys list` | Anahtarlıktaki anahtarları listele. |
| `keys import <name> <hex-privkey>` | Onaltılık kodlanmış bir özel anahtarı içe aktar. |
| `keys export <name>` | Bir özel anahtarı onaltılık olarak dışa aktar. |
| `register` | Bu düğüm için zincir üzerindeki kayıt komutunu yazdır — bkz. [Kayıt ve Lisanslama](/light-node/registration-and-licensing). |
| `validators` | Bağlı doğrulayıcıları listele. |
| `delegation` | Yerel veritabanından mevcut delegasyonları göster. |
| `rewards` | Bekleyen staking ödüllerini göster. |
| `network` | Yerel veritabanından ağ telemetrisini göster (son eşitlenmiş başlıklar). |
| `version` | İkili dosya sürümünü yazdır. |

Staking, ödüller ve izleme ayrıntıları için [Ödüller ve İzleme](/light-node/rewards-and-monitoring) bölümüne bakın. Zincir üzerinde kaydolmak için [Kayıt ve Lisanslama](/light-node/registration-and-licensing) bölümüne bakın.
