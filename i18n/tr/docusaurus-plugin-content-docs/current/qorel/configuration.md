---
slug: /qorel/configuration
title: QORel Yapılandırması
sidebar_label: Yapılandırma
sidebar_position: 5
---

# Yapılandırma

QORel tek bir TOML dosyası okur (varsayılan olarak `~/.hermes/config.toml` veya `--config` ile verilen yol). Standart biçimde imzalayan her zincir için dosya tam olarak Hermes'in yapılandırmasıdır; her ayarı [Hermes kılavuzu](https://hermes.informal.systems) anlatır. Bu sayfa QORel'in eklediklerini kapsar: QoreChain zincir girişi, kuantum sonrası anahtarlar, gas ayarları ve bir işlem gönderilmeden önce çalışan kontroller. Bir QORel yapılandırması yazan veya gözden geçiren operatörler içindir.

## Yenilikler {#innovations}

- **Zincir başına `signing`.** `'qorechain-hybrid'`, QORel'in o zincire gönderdiği her işleme ML-DSA-87 imzasını ekler; `'standard'` (varsayılan) bayt bayt Hermes'tir. Karışık yapılandırmalar çalışır: tek süreç, her türden bir zincir.
- **Sign-bytes sürümü zincirden okunur.** `pqc.sign_bytes = 'auto'` ile QORel zincirin uygulanmış yükseltme kayıtlarını okur, eşleşen biçimi imzalar, bunu her dakika ve her reddin ardından yeniden okur ve asla bir sürüm uydurmaz.
- **Ücret pazarı gas fiyatı.** `backend = 'cosmos-evm-feemarket'` ile `dynamic_gas_price`, QoreChain'in temel ücretini izler (taban gas başına 0,1 uqor).
- **Güvenli olmayan kombinasyonları reddeden bir yapılandırma.** Hibrit imzalama ile birlikte statik `extension_options`, yükleme sırasında reddedilir; çünkü kuantum sonrası imza tek kritik uzantı seçeneği olmalıdır.

## Nasıl kullanılır {#how-to-use}

### QoreChain zincir girişi {#chain-entry}

Bu, örnek yapılandırmadaki testnet girişidir. Düğüm adreslerini kendi testnet düğümünüzle değiştirin:

```toml
[[chains]]
id = 'qorechain-diana'
type = 'CosmosSdk'
rpc_addr = 'http://YOUR-QORECHAIN-NODE:26657'
grpc_addr = 'http://YOUR-QORECHAIN-NODE:9090'
event_source = { mode = 'push', url = 'ws://YOUR-QORECHAIN-NODE:26657/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'qor'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000

# The QoreChain-specific part:
signing = 'qorechain-hybrid'
gas_price = { price = 0.1, denom = 'uqor' }
gas_multiplier = 1.1
dynamic_gas_price = { enabled = true, multiplier = 1.0, max = 10.0, backend = 'cosmos-evm-feemarket' }
# optional, defaults shown:
# pqc = { sign_bytes = 'auto', sign_mode = 'hedged', include_public_key = false }

clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
# Relay only the channels you operate.
packet_filter = { policy = 'allow', list = [['transfer', 'channel-0']] }
```

QoreChain'e özgü ayarlar:

| Ayar | Değer | Ne yapar |
|---|---|---|
| `signing` | `'qorechain-hybrid'` | Bu zincire gönderilen her işleme ML-DSA-87 (FIPS 204) imzasını ekler. Diğer tüm zincirler için atlayın veya `'standard'` kullanın. |
| `account_prefix` | `'qor'` | QoreChain hesaplarının adres öneki. |
| `gas_price` | `{ price = 0.1, denom = 'uqor' }` | Ücret tabanı gas başına 0,1 uqor'dur. |
| `gas_multiplier` | `1.1` | Gas sınırını elde etmek için simüle edilen gas'ı çarpar. Bkz. [Gas](#gas). |
| `dynamic_gas_price.backend` | `'cosmos-evm-feemarket'` | Yalnızca `gas_price` kullanmak yerine zincirin ücret pazarı temel ücretini okur. |
| `pqc.sign_bytes` | `'auto'` (varsayılan), `'v1'` veya `'v2'` | `auto` sign-bytes sürümünü zincirden okur; `v1` ve `v2` tek bir biçimi zorlar. `auto` üzerinde bırakın. |
| `pqc.sign_mode` | `'hedged'` (varsayılan) veya `'deterministic'` | Rastgeleleştirilmiş veya deterministik ML-DSA imzalama. Zincir ikisini de kabul eder. |
| `pqc.include_public_key` | `false` (varsayılan) | Açık anahtarın her imza uzantısına gömülüp gömülmeyeceği. Bu, anahtarı kaydetmez; yalnızca `keys register-pqc` kaydeder. |

Okuma için genel QoreChain testnet uç noktaları [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) sayfasında listelenir. Bir relayer ayrıca gRPC'ye de ihtiyaç duyar; bu genel değildir, bu yüzden QoreChain tarafı için kendi düğümünüzü çalıştırın.

### Diğer her Cosmos SDK zinciri {#other-chains}

Girişi Hermes için yazacağınız gibi yazın ve `signing` ayarını dışarıda bırakın. Bu, örnek yapılandırmadaki Cosmos Hub genel testnet girişidir:

```toml
[[chains]]
id = 'provider'
type = 'CosmosSdk'
rpc_addr = 'https://rpc.provider-sentry-01.hub-testnet.polypore.xyz'
grpc_addr = 'https://grpc.provider-sentry-01.hub-testnet.polypore.xyz:443'
event_source = { mode = 'push', url = 'wss://rpc.provider-sentry-01.hub-testnet.polypore.xyz/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'cosmos'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000
gas_price = { price = 0.005, denom = 'uatom' }
gas_multiplier = 1.3
dynamic_gas_price = { enabled = true, multiplier = 1.1, max = 0.1, backend = 'skip-feemarket' }
clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
packet_filter = { policy = 'allow', list = [['transfer', 'channel-600']] }
```

Bu uç noktalar üçüncü bir tarafa aittir, geneldir ve hız sınırı uygulayabilir. Sürekli röle için kendi düğümlerinizi kullanın.

### Genel ayarlar {#global}

Örnek yapılandırma şunları kullanır; bunlar Hermes ayarlarıdır:

```toml
[global]
log_level = 'info'

[mode.clients]
enabled = true
refresh = true
misbehaviour = true

[mode.connections]
enabled = false

[mode.channels]
enabled = false

[mode.packets]
enabled = true
clear_interval = 50
clear_on_start = true
tx_confirmation = true

[rest]
enabled = false
host = '127.0.0.1'
port = 3000

[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

`mode.clients` hafif istemcileri taze tutar ve kötü davranışı izler; `mode.packets` paketleri röleler ve bekleyenleri her `clear_interval` blokta bir ve başlangıçta temizler. Bağlantı ve kanal el sıkışmaları `create` komutlarına bırakılmıştır. Telemetri portu [İzleme](/qorel/monitoring) sayfasında anlatılır.

### Anahtarlar {#keys}

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana
```

- `keys add` (veya mnemonic içeren bir anahtar dosyasıyla `--key-file`) secp256k1 anahtarını Hermes'in yaptığı gibi saklar ve hibrit bir zincirde ML-DSA-87 anahtarını aynı mnemonic ve hesaptan QoreChain cüzdan türetmesiyle türetir. Yalnızca 32 baytlık seed'i, anahtarın yanında `<key name>.pqc` olarak saklanır. Hiçbir gizli veri yazdırılmaz. Türetme için [Anahtar türetme](/qoresign/guides/key-derivation) sayfasına bakın.
- `keys register-pqc`, `MsgRegisterPQCKeyV2` işlemini bir kez gönderir. QoreChain'in yalnızca klasik imzayla kabul ettiği tek işlemdir ve v3.2.3 veya üzerindeki ağlarda bir sahiplik kanıtı taşır. İdempotenttir ve hesabın zaten farklı bir anahtarı varsa göndermeyi reddeder. Zincirin neleri kontrol ettiği için [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing#pqc-key-registration) sayfasına bakın.
- `keys pqc-status`, anahtarın kayıtlı olup olmadığını, yerel anahtarla eşleşip eşleşmediğini, bir sahiplik kanıtıyla kanıtlanıp kanıtlanmadığını ve zincirin hangi sign bytes'ı doğruladığını gösterir. `ready_to_relay` `true` olmalıdır.
- Küçük bakiyeli özel bir relayer hesabı kullanın, asla bir doğrulayıcı operatör anahtarı değil.
- Anahtar dosyaları (`<key name>.json` ve `<key name>.pqc`) yalnızca sahibin okuyabileceği şekilde (0600) yazılır. Üst akım Hermes varsayılan umask kullanıyordu; eski bir Hermes ile eklenen anahtarlar eski kiplerini korur, bu yüzden bunları `ls -l` ile kontrol edin.

### Gas {#gas}

QoreChain ücretin tamamını (gas sınırı çarpı fiyat) iade etmeden tahsil eder, bu yüzden çarpanı dar tutun.

- Zincir v3.2.5 ve sonrasında (aşağıdaki ölçüm testnet'te v3.2.6 üzerinde alındı; mainnet v3.2.5'i 29 Ekim 2026'da uyguladı ancak QORel orada röle yapmadı) simülasyon, teslimatla birkaç yüz gas içinde eşleşir. O hattaki bir derlemede yerel uçtan uca test `1.05` ile geçer (her röle işlemi sınırının %95'ini kullandı).
- Önceki derlemeler yaklaşık %8 ila 10 eksik bildirir (bir sürüm öncesi devnet'te ölçüldü; orada `1.15`, %4 ila 7 pay bıraktı). Kendi düğümlerinizi ölçene kadar `1.15` kullanın.
- `health-check`, bir QoreChain girişinde `1.1`'in altındaki her çarpanı olası bir yanlış yapılandırma olarak bildirir. Bu bir uyarıdır ve röle çalışmaya devam eder. Örnek yapılandırmadaki değer olan `1.1`, `1.05`'e göre yaklaşık %5 daha fazla ücrete karşılık bunu temiz tutar.
- Tek seferlik `keys register-pqc` işlemi, yapılandırma ne derse desin en az `1.1` kullanır.
- Her hibrit imza işleme yaklaşık 4,7 KB ve doğrulama için 2.000 gas ekler; simülasyon ikisini de içerir.

### Her gönderimden önce güvenlik kontrolleri {#safety-checks}

Hibrit bir zincire her işlemden önce QORel, kuantum sonrası anahtarın yüklü, zincirde kayıtlı ve yerel anahtarla aynı olduğunu ve sign-bytes sürümünün bilindiğini kontrol eder. Herhangi bir kontrol başarısız olursa hiçbir şey göndermez (ücret harcanmaz) ve `health-check` nedeni bildirir. Zincirin `pqc` codespace'i code 21 ile reddetmesi, QORel'in bir sonraki işlemden önce sürümü ve kaydı yeniden okumasını sağlar.

### ibc-go v10 zincirleri için notlar {#ibc-go-v10}

- ICS-29 ücret ara katmanı ibc-go v10'da artık yoktur; ücretler gas fiyatı, bir ücret veren (fee granter) ve dinamik temel ücrettir.
- ibc-go v10 artık başlığı `update_client` olaylarına koymaz. QORel bunun yerine başlığı `MsgUpdateClient` işleminden okur; böylece kötü davranış tespiti çalışmaya devam eder (standart Hermes 1.13 bu zincirlerde bunu kapatır).

### Hız sınırlı uç noktalar {#rate-limits}

Genel uç noktalar, örneğin relayer başladıktan hemen sonra, ani yükleri sıklıkla `429 Too Many Requests` ile yanıtlar. Hermes bunları yeniden denenebilir sayar, ancak paket çalışanları, son temizleme turu başarısız olsa bile, yeni IBC olayı olmadan `clear_interval x 5` blok geçince de durur; o anda bekleyen bir paket, kanaldaki bir sonraki pakete veya bir yeniden başlatmaya kadar beklerdi. QORel, bir röle veya temizleme denemesi başarısız olduğu sürece bir kanalın paket çalışanlarını ayakta tutar ve her temizleme aralığında yeniden dener. Boşta kalma nedeniyle yalnızca bir temizleme turu başarılı olduktan sonra dururlar. Üretim rölesi için kendi düğümlerinizi veya ücretli bir uç noktayı tercih edin ve bekleyen paketlere alarm kurun ([İzleme](/qorel/monitoring)).

## Nasıl erişilir {#how-to-access}

- **Dosyanın konumu.** Tarball veya Homebrew kurulumu için `~/.hermes/config.toml`, `.deb` ve `.rpm` için `/etc/qorel/config.toml`, container için bağlanan dizin. `--config <path>` ile geçersiz kılın.
- **Anahtar deposu.** `key_store_folder` anahtarların nerede tutulacağını belirler; varsayılan `~/.hermes/keys`'tir ve paketler `/var/lib/qorel/keys` kullanır.
- **Ön koşullar.** Her zincir için RPC, gRPC ve WebSocket uç noktaları ve her birinde fonlanmış bir relayer hesabı.
- **Bir yapılandırmayı kontrol edin.** `qorel health-check` dosyayı yükler ve her zinciri test eder.

## Nerede yayımlanır {#where-published}

| Ne | Nerede |
|---|---|
| Örnek yapılandırma (testnet, QoreChain ve Cosmos Hub genel testnet'i) | [qorechain/QORel](https://github.com/qorechain/QORel) içinde `packaging/config.example.toml`; paketler tarafından `/etc/qorel/config.example.toml` konumuna kurulur |
| Hermes yapılandırma başvurusu | [hermes.informal.systems](https://hermes.informal.systems) |

## Sınırlar ve bilinen sorunlar {#limits}

- **Statik `extension_options` reddedilir**; `signing = 'qorechain-hybrid'` olan bir zincirde.
- **`pqc.sign_bytes` ayarını `auto` üzerinde tutun.** Zincirin doğruladığıyla eşleşmeyen sabit bir `v1` veya `v2`, zincirin her işlemi reddetmesine yol açar.
- **Eski anahtarlarda anahtar kipi.** Eski bir Hermes tarafından yazılan dosyalar eski izinlerini korur.
- **Üçüncü taraf uç noktalar.** Örnek yapılandırmadaki Hub tarafı uç noktaları QoreChain tarafından işletilmez ve değişebilir veya hız sınırı uygulayabilir.
- **Yalnızca testnet girişi.** Buradaki QoreChain girişi `qorechain-diana` içindir. Mainnet IBC için açık değildir.
