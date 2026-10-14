---
slug: /getting-started/connecting-to-mainnet
title: Ana Ağa Bağlanma
sidebar_label: Ana Ağa Bağlanma
sidebar_position: 3
---

# Ana Ağa Bağlanma

Düğümünüzü resmi genesis dosyası, eşler (peers) ve ağ ayarlarıyla yapılandırarak canlı QoreChain Vladi ana ağına katılın.

:::note
Bu sayfa, Cosmos SDK v0.53 üzerinde **v3.2.1** sürümünü çalıştıran ve **29 Haziran 2026** tarihinden beri (genesis bloğu 17:03 UTC) canlı olan **`qorechain-vladi`** ana ağını (EVM zincir kimliği **9801**, onaltılık `0x2649`) kapsar. **`qorechain-diana`** test ağı (EVM zincir kimliği **9800**) için [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) bölümüne bakın ve canlıya geçmeden önce kurulumunuzu orada prova edin.
:::

## Genel Erişime Açık Uç Noktalar

Yalnızca **zinciri sorgulamanız veya işlem yayınlamanız** gerekiyorsa kendi düğümünüze ihtiyacınız yoktur — genel erişime açık uç noktalar şunlardır:

| Hizmet | URL |
|---|---|
| Konsensüs RPC | `https://rpc.qore.host` (WebSocket: `wss://rpc.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` (zincir kimliği `9801`) |
| SVM JSON-RPC (salt okunur) | `https://svm.qore.host` |
| Blok gezgini | [explore.qore.network](https://explore.qore.network) |

Yoğun veya üretim düzeyindeki iş yükleri (borsalar, indeksleyiciler) için aşağıda açıklandığı gibi kendi düğümünüzü çalıştırın.

---

## Kurulum

`qorechaind` ikili dosyasını resmi önceden derlenmiş paketten veya kaynak koddan derleyerek kurun.

### Önceden derlenmiş ikili paket (linux/amd64)

Güncel ikili dosya için asıl doğruluk kaynağı, `https://download.qore.host/mainnet/latest.json` adresinde canlı olarak güncellenen bir JSON dosyası olan **ana ağ manifestosu**dur. Bu dosya; güncel ikili dosya URL'sini ve SHA-256 değerini, güncel genesis URL'si/SHA-256/boyutunu, güncel eşleri (peers) ve tohum düğümlerini (seeds), P2P portunu, bir durum senkronizasyonu (state-sync) güven noktasını ve minimum uyumlu zincir sürümünü içerir. Kurulum betiklerinizde bir ikili dosya sürümünü veya sağlama toplamını sabit kodlamak yerine bu dosyayı indirip değerlerini kullanın — yeni bir sürüm yayımlanır yayımlanmaz bunlar eskir:

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

Bu paket, `qorechaind` ile birlikte gerekli paylaşılan kitaplıklarını (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`) içerir.

:::caution Düğümünüzü güncel tutun — v3.2.0 veya üzeri gerekli
Tam düğümler ağın canlı sürümünü takip etmek zorundadır — her zaman manifestonun işaret ettiği ikili dosyayı kurun, eski bir sürümü sabitlemeyin. Güncel manifesto **v3.2.1**'dir ve `minCompatible` değeri **3.2.0**'dır. Ana ağ, her düğümün işlemesi gereken iki yönetişim yükseltmesi uyguladı: 2.122.074 yüksekliğinde **v3.1.94** (emisyon tavanı) ve 2.981.742 yüksekliğinde **v3.2.0** (EVM yetkilendirme penceresi ve v2 hibrit imza baytları). Bu nedenle taze katılan bir düğümün v3.2.x ikili dosyasına ihtiyacı vardır; genesis'ten yeniden oynatmak yerine state sync'i (aşağıda) tercih edin. Yayımlanan zincir verisi anlık görüntüsü her iki yükseltme yüksekliğinden de öncesine aittir; bu nedenle ondan geri yüklenen bir düğüm, bunları bir v3.2.x ikili dosyasıyla yeniden oynatmalıdır.

v3.2.1 düğüm-yerel bir sürümdür (yükseltme yüksekliği yok, yönetişim oylaması yok): v3.2.0 üzerindeki düğümler zinciri takip etmeye devam eder, ancak yükseltme önerilir. v3.2.1'e geçtikten sonra `app.toml` içinde `evm-chain-id = 9801` ayarlayın (farklı bir değer hata olarak günlüğe yazılır) ve sistem saatini NTP ile senkronize tutun: saati 60 saniyeden fazla sapan bir düğüm durur. `binary.url` değerine güvenmeden önce her zaman manifestonun `"version"` ve `"minCompatible"` alanlarını kontrol edin — manifesto kasıtlı olarak yükseltilir (önce test ağı, ardından bir olgunlaşma süresinin sonunda ana ağ).
:::

:::caution Koordineli bir ana ağ yükseltmesi planlandı — bir düğümü başlatmadan veya yeniden başlatmadan önce okuyun
Ana ağ yönetişim önerisi **7** (hızlandırılmış, 15 Ekim 2026 21:24 UTC'ye kadar oylama), **v3.2.2**'yi **3.556.788** yüksekliğinde uygulayacaktır — blok başına yaklaşık 3,2 sn ile 14 Ekim'den yaklaşık iki gün sonra. Öneri metni şöyle der: o yüksekliğe kadar v3.2.1'de (veya v3.2.0'da) kalın; düğüm orada durur ve siz onu v3.2.2 ile yeniden başlatırsınız; işlem imzalama değişmez. **Gerçekleşip gerçekleşmeyeceği oylamaya bağlıdır** — herhangi bir ikili dosyayı değiştirmeden önce sonucu (`curl -s https://api.qore.host/cosmos/gov/v1/proposals/7`, `status` alanı) ve [ana ağ manifestosunun](https://download.qore.host/mainnet/latest.json) `version` ile `upgradeHeight` alanlarını kontrol edin. v3.2.2'yi erken kurmayın: o yükseklikten önce onu taşıyan bir düğüm de durur. Öneri reddedilirse veya yükseklik geçtiyse bu not artık geçerli değildir.
:::

### Kaynak koddan derleme (yalnızca geliştirme için)

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Bu, stub keeper'lı ve kuantum-sonrası imzalayıcısı olmayan topluluk ikili dosyasını derler; bu dosya ağların konsensüs durumunu yeniden üretemez veya hibrit imzalı işlemler oluşturamaz. Ana ağda bir düğüm çalıştırmak için yukarıdaki sürüm ikili dosyasını kurun. Tüm ön koşullar (Go 1.26+, CGO, yerel kitaplıklar) için [Kaynak Koddan Derleme](/developer-guide/building-from-source) sayfasına bakın.

### Düğümü ilklendirme

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

Bu komut, `~/.qorechaind/` altında varsayılan yapılandırma ve veri dizinlerini oluşturur.

---

## Genesis Dosyasını İndirme

Yerel genesis dosyanızı, yukarıda getirilen manifestodaki URL ve SHA-256 değerlerini kullanarak resmi ana ağ genesis dosyasıyla değiştirin:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

Aynı dosya zincirin kendisi tarafından da canlı olarak sunulur — indirdiğiniz dosyayı bununla çapraz doğrulayabilirsiniz:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Bu dosya; genesis doğrulayıcı kümesi, token tahsisleri (genesis'te TGE) ve modül parametreleri dahil olmak üzere Vladi ana ağının başlangıç durumunu tanımlar.

---

## Eşleri (Peers) Yapılandırma

Genel erişime açık ana ağ sentry düğümlerine bağlanmak için düğüm yapılandırmanızı düzenleyin. Düğüm kimliklerini ve adreslerini sabit kodlamak yerine güncel eş (peer) ve tohum (seed) listelerini manifestodan okuyun — bunlar zaman zaman değişir:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

`~/.qorechaind/config/config.toml` dosyasını açın ve `persistent_peers` (ve `seeds`) alanlarını bu değerlere ayarlayın:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Ayrıca `~/.qorechaind/config/app.toml` dosyasında asgari gaz fiyatını ayarlayın (ağın ücret tabanı **0.1uqor**'dur):

```toml
minimum-gas-prices = "0.1uqor"
```

### Önerilen Ayarlar

Tam bir düğüm blok süresini seçmez — bunu doğrulayıcılar seçer (ana ağ şu anda yaklaşık her 3,2 saniyede bir blok üretir). Bir doğrulayıcı işletmiyorsanız ve doğrulayıcı grubu tarafından size değerler verilmediyse konsensüs zaman aşımlarını varsayılanlarında bırakın. Genel bir RPC düğümü için `config.toml` içinde yararlı bir mempool ayarı:

```toml
[mempool]
size = 5000
```

---

## Hızlı Başlatma (Anlık Görüntü veya State Sync)

Genesis'ten senkronize olmak uzun sürebilir. Manifestonun `stateSync` alanı, saatlik olarak güncellenen bir güven yüksekliği/karma (hash) çiftini taşır — bir yüksekliği elle aramak yerine state sync'i yapılandırmak için bunu kullanın:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Ardından `config.toml` dosyasının `[statesync]` bölümünü bu değerlerle ayarlayın — güven noktasını kendiniz türetmeniz gerekirse elle RPC tabanlı bir yedek yöntem dahil olmak üzere tam iş akışı için [Düğüm Çalıştırma](/developer-guide/running-a-node) sayfasına bakın.

Bir zincir verisi anlık görüntüsü (snapshot) de manifestoda listelenir (`snapshot.url`, `snapshot.sha256`, `snapshot.height`). Yeni bir anlık görüntü eskisinin yerini aldığından, bir dosya adını veya yüksekliği sabit kodlamak yerine değerleri manifestodan okuyun. Anlık görüntü büyüktür (onlarca gigabayt) ve Ekim 2026'da yayımlandığı haliyle 1.966.629 yüksekliğinde (21 Ağustos 2026) alınmıştır — v3.1.94 ve v3.2.0 yükseltme yüksekliklerinden önce — dolayısıyla ondan geri yüklenen bir düğüm her iki yükseltmeyi yeniden oynatır ve bir v3.2.x ikili dosyası çalıştırmalıdır; state sync genellikle daha hızlıdır:

```bash
SNAPSHOT_URL=$(jq -r .snapshot.url latest.json)
SNAPSHOT_SHA256=$(jq -r .snapshot.sha256 latest.json)

curl -fsSL "$SNAPSHOT_URL" -o snapshot.tar.gz
echo "${SNAPSHOT_SHA256}  snapshot.tar.gz" | sha256sum -c -

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

---

## Düğümü Başlatma

Ağla senkronizasyona başlamak için düğümünüzü çalıştırın:

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

Düğüm eşlere bağlanır ve blokları indirmeye başlar (genesis'ten veya bir anlık görüntü geri yüklediyseniz anlık görüntü yüksekliğinden itibaren).

---

## Senkronizasyon Durumunu Kontrol Etme

Düğümünüzün en son bloğa yetişmekte olduğunu doğrulayın:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — Düğüm hâlâ senkronize oluyor. Yetişmesini bekleyin.
* `false` — Düğüm tamamen senkronize olmuş ve yeni blokları işliyor.

En son blok yüksekliğini de kontrol edebilirsiniz:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

Doğru ağda olduğunuzdan emin olun — `network` alanı `qorechain-vladi` değerini bildirmelidir:

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## İzleme

QoreChain, düğüm sağlığını ve performansını izlemek için çeşitli uç noktalar sunar.

### Prometheus Metrikleri

Ham metrikler şu adreste sunulur:

```
http://localhost:26660/metrics
```

Bu metrikler, Prometheus uyumlu herhangi bir toplayıcı tarafından çekilebilir.

### Grafana Panoları

Docker Compose ile çalıştırıyorsanız Grafana şu adreste kullanılabilir:

```
http://localhost:3001
```

İlk oturum açmada, istendiğinde kendi kimlik bilgilerinizi belirleyin — varsayılan değerleri olduğu gibi bırakmayın. Önceden yapılandırılmış panolar; blok üretimini, işlem hacmini, eş bağlantılarını ve kaynak kullanımını görüntüler.

### REST Sağlık Kontrolü

REST API hızlı bir durum uç noktası sağlar:

```
http://localhost:1317
```

---

## Port Referansı

| Port    | Protokol  | Açıklama                                                 |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — işlemleri sorgulama ve yayınlama                   |
| `26656` | TCP       | P2P — eşler arası ağ iletişimi                           |
| `1317`  | HTTP      | REST API — zincir durumunu HTTP üzerinden sorgulama      |
| `9090`  | gRPC      | gRPC API — zincire programatik erişim                    |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum uyumlu RPC (zincir kimliği `9801`) |
| `8546`  | WebSocket | EVM WebSocket — gerçek zamanlı EVM olay abonelikleri     |
| `8899`  | HTTP      | SVM RPC — Solana uyumlu RPC (yalnızca okuma; SVM işlem hattı devre dışıdır) |
| `26660` | HTTP      | Prometheus metrik uç noktası                             |

---

## Ağ Bilgileri

| Alan              | Değer                                  |
| ----------------- | --------------------------------------- |
| Zincir kimliği     | `qorechain-vladi`                      |
| EVM zincir kimliği | `9801` (onaltılık `0x2649`)            |
| Zincir sürümü      | v3.2.1 (v3.2.0 konsensüs kuralları)    |
| Canlıya geçiş tarihi | 29 Haziran 2026 17:03 UTC (genesis bloğu) |
| Blok süresi        | yaklaşık 3,2 saniye (ölçülen ortalama) |
| Token              | QOR (`uqor`, 10^6 mikro birim = 1 QOR) |
| Asgari gaz fiyatı  | `0.1uqor`                              |
| Hesap ön eki       | `qor`                                  |
| Doğrulayıcı ön eki | `qorvaloper`                           |
| SDK                | Cosmos SDK v0.53                       |

---

## Sonraki Adımlar

* [Düğüm Çalıştırma](/developer-guide/running-a-node) — Borsalar ve entegratörler için tam/RPC düğümü işletin
* [Borsa ve Entegratör Kılavuzu](/developer-guide/exchange-integration) — Yatırma, çekme ve izleme işlemleri
* [Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator) — Doğrulayıcı oluşturun ve işletin
* [Cüzdan Kurulumu](/getting-started/wallet-setup) — Ana ağ için bir cüzdan yapılandırın
* [İlk İşleminiz](/getting-started/first-transaction) — İlk QOR transferinizi gönderin
* [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) — Ücretsiz test için Diana test ağına katılın
* [Ağlar](/appendix/networks) — Zincir kimlikleri, portlar ve tam ağ referansı
