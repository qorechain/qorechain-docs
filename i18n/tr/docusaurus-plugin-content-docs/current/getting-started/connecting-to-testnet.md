---
slug: /getting-started/connecting-to-testnet
title: Test Ağına Bağlanma
sidebar_label: Test Ağına Bağlanma
sidebar_position: 4
---

# Test Ağına Bağlanma

Düğümünüzü doğru genesis dosyası, eşler ve ağ ayarlarıyla yapılandırarak canlı QoreChain Diana test ağına katılın.

:::note
Bu sayfa **`qorechain-diana`** test ağını (EVM zincir kimliği **9800**) kapsar. Ana ağ (**`qorechain-vladi`**, EVM zincir kimliği **9801**) 7 Haziran 2026'dan bu yana canlıdır ve ayrı genesis, eşler ve bağlantı ayrıntılarını içeren kendine ait **Ana Ağa Bağlanma** sayfasına sahiptir.
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

## Genesis'i İndirin

Yerel genesis dosyanızı, zincirin kendisi tarafından canlı olarak sunulan resmi test ağı genesis dosyasıyla değiştirin:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' \
  > ~/.qorechaind/config/genesis.json
```

Bu dosya; doğrulayıcı kümesi, token tahsisleri ve modül parametreleri dahil olmak üzere Diana test ağının başlangıç durumunu tanımlar.

:::caution
Diana test ağı, ön sürüm derlemeleri yayınlandıkça periyodik olarak **yeniden genesis'lenir** (yükseklik 0'a sıfırlanır). Bir sıfırlamadan sonra düğümünüz senkronize olmayı bırakırsa, genesis'i yeniden indirin ve temiz bir veri dizininden başlayın.
:::

---

## Eşleri Yapılandırın

Mevcut test ağı eşlerine bağlanmak için düğüm yapılandırmanızı düzenleyin.

Ağdan doğrudan güncel bir eş sorgulayın, ardından `~/.qorechaind/config/config.toml` dosyasındaki `persistent_peers` alanını ayarlayın:

```bash
# node id + listen address of the public testnet node
curl -s https://rpc-testnet.qore.host/status | jq -r '.result.node_info.id'
```

Ayrıca `~/.qorechaind/config/app.toml` dosyasında ücret tabanını ayarlayın (test ağı, ana ağ ile aynı **0.1uqor** minimum gaz fiyatını kullanır):

```toml
minimum-gas-prices = "0.1uqor"
```

### Önerilen Ayarlar

`config.toml` dosyasında aşağıdakileri de ayarlamak isteyebilirsiniz:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Bu değerler, Diana test ağının blok süreleri ve iş hacmi için ayarlanmıştır.

---

## Düğümü Başlatın

Ağ ile senkronizasyona başlamak için düğümünüzü çalıştırın:

```bash
./qorechaind start
```

Düğüm, eşlere bağlanır ve blokları genesis'ten itibaren indirmeye başlar. İlk senkronizasyon süresi, güncel zincir yüksekliğine ve ağ hızınıza bağlıdır.

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
| `8899`  | HTTP      | SVM RPC — Solana uyumlu RPC                    |
| `26660` | HTTP      | Prometheus metrik uç noktası                        |

---

## Sonraki Adımlar

* [Cüzdan Kurulumu](/getting-started/wallet-setup) — Test ağı için bir cüzdan yapılandırın
* [İlk İşleminiz](/getting-started/first-transaction) — İlk QOR transferinizi gönderin
