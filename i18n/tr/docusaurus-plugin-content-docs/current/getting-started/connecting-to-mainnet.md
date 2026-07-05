---
slug: /getting-started/connecting-to-mainnet
title: Ana Ağa Bağlanma
sidebar_label: Ana Ağa Bağlanma
sidebar_position: 3
---

# Ana Ağa Bağlanma

Düğümünüzü resmi genesis dosyası, eşler (peers) ve ağ ayarlarıyla yapılandırarak canlı QoreChain Vladi ana ağına katılın.

:::note
Bu sayfa, Cosmos SDK v0.53 üzerinde **v3.1.85** zincir sürümünü çalıştıran ve **7 Haziran 2026 23:59 UTC** tarihinden beri canlı olan **`qorechain-vladi`** ana ağını (EVM zincir kimliği **9801**, onaltılık `0x2649`) kapsar. **`qorechain-diana`** test ağı (EVM zincir kimliği **9800**) için [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) bölümüne bakın ve canlıya geçmeden önce kurulumunuzu orada prova edin.
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

Resmi sürüm paketi, `qorechaind` ile birlikte gerekli paylaşılan kitaplıkları (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`) içerir:

```bash
curl -fsSL https://download.qore.host/qorechaind-v3.1.83-linux-amd64.tar.gz -o qore.tgz
# Verify the checksum before installing:
sha256sum qore.tgz
# fa035b3699e92d755f47445cbf7dde4e1f6c224343008546aa159b7eb46a805c

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

Sürümlü paketler [download.qore.host](https://download.qore.host) adresinde yayımlanır; her sürüm SHA-256 sağlama toplamıyla birlikte gelir — her zaman yayımlanmış **en güncel** paketi kurun.

:::caution Düğümünüzü güncel tutun
Tam düğümler, ağın zincir sürümünü (şu anda **v3.1.85**) takip etmek zorundadır. Güncel olmayan bir düğüm, daha yeni işlem türlerini (örneğin v3.1.83 ile gelen `eth_secp256k1` imzalı işlemleri) çözümleyemez ve bir blokta böyle bir işlem göründüğü anda senkronizasyonu durdurur.
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

Yerel genesis dosyanızı resmi ana ağ genesis dosyasıyla değiştirin:

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json
```

Aynı dosya zincirin kendisi tarafından da canlı olarak sunulur — indirdiğiniz dosyayı bununla çapraz doğrulayabilirsiniz:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Bu dosya; genesis doğrulayıcı kümesi, token tahsisleri (TGE genesis'te) ve modül parametreleri dahil olmak üzere Vladi ana ağının başlangıç durumunu tanımlar.

---

## Eşleri (Peers) Yapılandırma

Genel erişime açık ana ağ sentry düğümlerine bağlanmak için düğüm yapılandırmanızı düzenleyin.

`~/.qorechaind/config/config.toml` dosyasını açın ve `persistent_peers` alanını ayarlayın:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
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

## Hızlı Başlatma (Anlık Görüntü)

Genesis'ten senkronize olmak uzun sürebilir. Güncel bir zincir verisi anlık görüntüsü (snapshot) [download.qore.host](https://download.qore.host) adresinde yayımlanır:

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
# Verify before extracting:
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

Anlık görüntüler, blok yüksekliği damgalı dosya adlarıyla yayımlanır — en güncel olanı için [download.qore.host](https://download.qore.host) adresini kontrol edin. Alternatif olarak **state sync** kullanın — tam iş akışı için [Düğüm Çalıştırma](/developer-guide/running-a-node) sayfasına bakın.

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

| Port    | Protokol  | Açıklama                                                   |
| ------- | --------- | ---------------------------------------------------------- |
| `26657` | TCP       | RPC — işlemleri sorgulama ve yayınlama                      |
| `26656` | TCP       | P2P — eşler arası ağ iletişimi                              |
| `1317`  | HTTP      | REST API — zincir durumunu HTTP üzerinden sorgulama         |
| `9090`  | gRPC      | gRPC API — zincire programatik erişim                       |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum uyumlu RPC (zincir kimliği `9801`)  |
| `8546`  | WebSocket | EVM WebSocket — gerçek zamanlı EVM olay abonelikleri        |
| `8899`  | HTTP      | SVM RPC — Solana uyumlu RPC                                 |
| `26660` | HTTP      | Prometheus metrik uç noktası                                |

---

## Ağ Bilgileri

| Alan                  | Değer                                       |
| --------------------- | ------------------------------------------- |
| Zincir kimliği        | `qorechain-vladi`                           |
| EVM zincir kimliği    | `9801` (onaltılık `0x2649`)                 |
| Zincir sürümü         | v3.1.85                                     |
| Canlıya geçiş tarihi  | 7 Haziran 2026 23:59 UTC                    |
| Token                 | QOR (`uqor`, 10^6 mikro birim = 1 QOR)      |
| Asgari gaz fiyatı     | `0.1uqor`                                   |
| Hesap ön eki          | `qor`                                       |
| Doğrulayıcı ön eki    | `qorvaloper`                                |
| SDK                   | Cosmos SDK v0.53                            |

---

## Sonraki Adımlar

* [Düğüm Çalıştırma](/developer-guide/running-a-node) — Borsalar ve entegratörler için tam/RPC düğümü işletin
* [Borsa ve Entegratör Kılavuzu](/developer-guide/exchange-integration) — Yatırma, çekme ve izleme işlemleri
* [Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator) — Doğrulayıcı oluşturun ve işletin
* [Cüzdan Kurulumu](/getting-started/wallet-setup) — Ana ağ için bir cüzdan yapılandırın
* [İlk İşleminiz](/getting-started/first-transaction) — İlk QOR transferinizi gönderin
* [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) — Ücretsiz test için Diana test ağına katılın
* [Ağlar](/appendix/networks) — Zincir kimlikleri, portlar ve tam ağ referansı
