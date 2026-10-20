---
slug: /getting-started/connecting-to-testnet
title: Test Ağına Bağlanma
sidebar_label: Test Ağına Bağlanma
sidebar_position: 4
---

# Test Ağına Bağlanma

Düğümünüzü doğru genesis dosyası, eşler ve ağ ayarlarıyla yapılandırarak canlı QoreChain Diana test ağına katılın.

:::note
Bu sayfa **`qorechain-diana`** test ağını (EVM zincir kimliği **9800**) kapsar. Ana ağ (**`qorechain-vladi`**, EVM zincir kimliği **9801**) 7 Haziran 2026'dan bu yana canlıdır (sürüm **v3.2.3**, 3,742,566 yüksekliğine kadar; o bloktan itibaren **v3.2.4**) ve ayrı genesis, eşler ve bağlantı ayrıntılarını içeren kendine ait **Ana Ağa Bağlanma** sayfasına sahiptir. Test ağı 19 Ekim 2026'dan beri **v3.2.4** sürümünü çalıştırmaktadır; sürüm manifestosu [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) adresindedir.
:::

## Genel Uç Noktalar

Yalnızca **test ağını sorgulamanız veya işlem yayınlamanız** gerekiyorsa, genel uç noktaları kullanın:

| Hizmet | URL |
|---|---|
| Konsensüs RPC | `https://rpc-testnet.qore.host` (WebSocket: `wss://rpc-testnet.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` (zincir kimliği `9800`) |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (salt okunur) | `https://svm-testnet.qore.host` |
| Blok gezgini | [explore.qore.network](https://explore.qore.network) (Testnet'e geçiş yapın) |

Test ağı QOR'u [Panel Musluğu](/dashboard/faucet) üzerinden edinilebilir.

---

## Kurulum

Güncel test ağı ikili dosyası, genesis, eşler ve state-sync güven noktası için tek doğru kaynak, `https://download.qore.host/testnet/latest.json` adresinde canlı olarak yenilenen **test ağı manifestosudur**. Ana ağ manifestosuyla aynı yapıya sahiptir, dolayısıyla kurulum adımları aynıdır — bir sürümü veya sağlama toplamını koda gömmek yerine manifestoyu indirin ve içindeki değerleri kullanın:

```bash
curl -s https://download.qore.host/testnet/latest.json -o latest.json
jq -r '.version, .minCompatible, .upgradeHeight' latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib

qorechaind init my-node --chain-id qorechain-diana
```

Test ağı, governance önerileri aracılığıyla koordineli yükseltmeler alır; bu nedenle manifestosunda bir `upgradeHeight` bulunur (v3.2.4, 19 Ekim 2026'da 8.337.253 yüksekliğinde uygulandı; ondan önce v3.2.3 8.003.746'da ve v3.2.2 6.905.034'te uygulanmıştı) ve `minCompatible` güncel sürüme eşittir (3.2.4). Şimdi katılan bir düğümün manifestodaki sürüme ihtiyacı vardır. Sistem saatini NTP ile senkronize tutun. Ana ağ manifestosu farklı bir sürümü (3.742.566 yüksekliğindeki yükseltmesine kadar v3.2.3) işaret eder; bu yüzden ikili dosyayı asla iki ağ arasında kopyalamayın.

---

## Genesis'i İndirin

Yerel genesis dosyanızı, yukarıda indirilen manifestodaki URL ve SHA-256'yı kullanarak resmi test ağı genesis dosyasıyla değiştirin:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

Aynı dosya, zincirin kendisi tarafından da canlı olarak sunulur:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Bu dosya; doğrulayıcı kümesi, token tahsisleri ve modül parametreleri dahil olmak üzere Diana test ağının başlangıç durumunu tanımlar.

:::note Test ağı yerinde yükseltilir
Diana, 1 Temmuz 2026'dan beri kesintisiz çalışmaktadır ve ana ağ gibi governance önerileriyle yükseltilir. Test ağı bir hazırlık (staging) ağıdır ve önceden haber verilmeden sıfırlanabilir: düğümünüz senkronize olmayı bırakırsa manifestoyu ve Discord duyurularını kontrol edin, ardından genesis'i yeniden indirin ve temiz bir veri dizininden başlayın. Genel sentry yalnızca son blokları tutar, bu nedenle yeni bir düğüm genesis'ten itibaren yeniden oynatmak yerine (aşağıdaki) state-sync kullanmalıdır.
:::

---

## Eşleri Yapılandırın

Düğüm kimliklerini ve ana makineleri koda gömmek yerine güncel eş ve seed listelerini manifestodan okuyun:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

`~/.qorechaind/config/config.toml` dosyasını açın ve `persistent_peers` (ve `seeds`) alanlarını bu değerlere ayarlayın:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Ayrıca `~/.qorechaind/config/app.toml` dosyasında ücret tabanını ayarlayın (test ağı, ana ağ ile aynı **0.1uqor** minimum gaz fiyatını kullanır):

```toml
minimum-gas-prices = "0.1uqor"
```

### Önerilen Ayarlar

Tam bir düğüm blok süresini seçmez — bunu doğrulayıcılar belirler (test ağı şu anda yaklaşık her 1 saniyede bir blok üretir). Bir doğrulayıcı işletmiyorsanız ve doğrulayıcı grubu tarafından size değerler verilmediyse konsensüs zaman aşımlarını varsayılan değerlerinde bırakın. Genel bir RPC düğümü için `config.toml` içinde yararlı bir mempool ayarı:

```toml
[mempool]
size = 5000
```

---

## Hızlı Önyükleme (State Sync)

Manifestonun `stateSync` alanı, düzenli olarak yenilenen bir güven yüksekliği/özet (hash) çifti taşır:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

`config.toml` içindeki `[statesync]` bölümünü bu değerlerle ve manifestodaki `rpcServers` ile ayarlayın — tam iş akışı için [Düğüm Çalıştırma](/developer-guide/running-a-node) sayfasına bakın.

---

## Düğümü Başlatın

Ağ ile senkronizasyona başlamak için düğümünüzü çalıştırın:

```bash
./qorechaind start
```

Düğüm eşlere bağlanır ve blokları indirmeye başlar (genesis'ten veya state-sync kullanıyorsanız güven yüksekliğinden itibaren). İlk senkronizasyon süresi, güncel zincir yüksekliğine ve ağ hızınıza bağlıdır.

---

## Senkronizasyon Durumunu Kontrol Edin

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

---

## İzleme

QoreChain, düğüm sağlığını ve performansını izlemek için çeşitli uç noktalar sunar.

### Prometheus Metrikleri

Ham metrikler şu adreste mevcuttur:

```
http://localhost:26660/metrics
```

Bu metrikler, Prometheus uyumlu herhangi bir toplayıcı tarafından toplanabilir (scrape).

### Grafana Panoları

Docker Compose üzerinden çalıştırıyorsanız, Grafana şu adreste kullanılabilir:

```
http://localhost:3001
```

İlk oturum açışta, istendiğinde kendi kimlik bilgilerinizi ayarlayın — varsayılanları olduğu gibi bırakmayın. Önceden yapılandırılmış panolar; blok üretimini, işlem hacmini, eş bağlantılarını ve kaynak kullanımını görüntüler.

### REST Sağlık Kontrolü

REST API, hızlı bir durum uç noktası sağlar:

```
http://localhost:1317
```

---

## Port Referansı

| Port    | Protokol  | Açıklama                                        |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — işlemleri sorgulama ve yayınlama             |
| `26656` | TCP       | P2P — eşler arası ağ iletişimi           |
| `1317`  | HTTP      | REST API — zincir durumunu HTTP üzerinden sorgulama              |
| `9090`  | gRPC      | gRPC API — programatik zincir erişimi               |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum uyumlu RPC (zincir kimliği `9800`) |
| `8546`  | WebSocket | EVM WebSocket — gerçek zamanlı EVM olay abonelikleri  |
| `8899`  | HTTP      | SVM RPC — Solana uyumlu RPC (yalnızca okuma; SVM işlem şeridi devre dışıdır) |
| `26660` | HTTP      | Prometheus metrik uç noktası                        |

---

## Sonraki Adımlar

* [Cüzdan Kurulumu](/getting-started/wallet-setup) — Test ağı için bir cüzdan yapılandırın
* [İlk İşleminiz](/getting-started/first-transaction) — İlk QOR transferinizi gönderin
