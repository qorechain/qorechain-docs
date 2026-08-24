---
slug: /getting-started/connecting-to-mainnet
title: Ana Ağa Bağlanma
sidebar_label: Ana Ağa Bağlanma
sidebar_position: 3
---

# Ana Ağa Bağlanma

Düğümünüzü resmi genesis dosyası, eşler (peers) ve ağ ayarlarıyla yapılandırarak canlı QoreChain Vladi ana ağına katılın.

:::note
Bu sayfa, Cosmos SDK v0.53 üzerinde **v3.1.92** zincir sürümünü çalıştıran ve **7 Haziran 2026 23:59 UTC** tarihinden beri canlı olan **`qorechain-vladi`** ana ağını (EVM zincir kimliği **9801**, onaltılık `0x2649`) kapsar. **`qorechain-diana`** test ağı (EVM zincir kimliği **9800**) için [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) bölümüne bakın ve canlıya geçmeden önce kurulumunuzu orada prova edin.
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

:::caution Düğümünüzü güncel tutun — taze bir senkronizasyon için v3.1.92 veya üzeri gerekli
Tam düğümler ağın canlı zincir sürümünü takip etmek zorundadır — her zaman manifestonun işaret ettiği ikili dosyayı kurun, eski bir sürümü sabitlemeyin. Manifestonun `minCompatible` alanından bağımsız olarak, **genesis'ten taze katılan veya bir kesintiden kurtarılan bir düğüm için v3.1.92 veya üzeri gereklidir** — daha eski sürümler, işlem içeren ilk blokta yeniden oynatmayı (replay) durduran, artık düzeltilmiş bir gaz ölçüm hatası nedeniyle tam senkronizasyonu tamamlayamaz. Zaten yetişmiş durumda olan ve daha eski bir sürüm çalıştıran bir düğüm de bir sonraki fırsatta yükseltilmelidir, çünkü güncel olmayan bir düğüm daha yeni işlem türlerini çözümleyemez ve bir blokta böyle bir işlem göründüğü anda senkronizasyonu durdurur.
:::

### Kaynak koddan derleme

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Tüm ön koşullar (Go 1.26+, CGO, Rust araç zinciri, yerel kitaplıklar) için [Kaynak Koddan Derleme](/developer-guide/building-from-source) sayfasına bakın.

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

`config.toml` dosyasında aşağıdaki değerleri de ayarlamak isteyebilirsiniz:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Bu değerler, Vladi ana ağının blok süreleri ve işlem hacmine göre ayarlanmıştır.

---

## Hızlı Başlatma (Anlık Görüntü veya State Sync)

Genesis'ten senkronize olmak uzun sürebilir. Manifestonun `stateSync` alanı, saatlik olarak güncellenen bir güven yüksekliği/karma (hash) çiftini taşır — bir yüksekliği elle aramak yerine state sync'i yapılandırmak için bunu kullanın:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Ardından `config.toml` dosyasının `[statesync]` bölümünü bu değerlerle ayarlayın — güven noktasını kendiniz türetmeniz gerekirse elle RPC tabanlı bir yedek yöntem dahil olmak üzere tam iş akışı için [Düğüm Çalıştırma](/developer-guide/running-a-node) sayfasına bakın.

[download.qore.host](https://download.qore.host) adresinde bir zincir verisi anlık görüntüsü (snapshot) de yayımlanır. En güncel anlık görüntü dosya adı ve yayımlanan sağlama toplamı için oradaki güncel listeyi kontrol edin — bir dosya adını veya yüksekliği sabit kodlamayın, çünkü düzenli aralıklarla yeni bir anlık görüntü eskisinin yerini alır:

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

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
| `8899`  | HTTP      | SVM RPC — Solana uyumlu RPC                              |
| `26660` | HTTP      | Prometheus metrik uç noktası                             |

---

## Ağ Bilgileri

| Alan              | Değer                                  |
| ----------------- | --------------------------------------- |
| Zincir kimliği     | `qorechain-vladi`                      |
| EVM zincir kimliği | `9801` (onaltılık `0x2649`)            |
| Zincir sürümü      | v3.1.92                                |
| Canlıya geçiş tarihi | 7 Haziran 2026 23:59 UTC             |
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
