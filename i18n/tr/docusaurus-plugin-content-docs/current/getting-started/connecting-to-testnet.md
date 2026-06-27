---
slug: /getting-started/connecting-to-testnet
title: Test Ağına Bağlanma
sidebar_label: Test Ağına Bağlanma
sidebar_position: 4
---

# Test Ağına Bağlanma

Düğümünüzü doğru genesis dosyası, eşler ve ağ ayarlarıyla yapılandırarak canlı QoreChain Diana test ağına katılın.

:::note
Bu sayfa **`qorechain-diana`** test ağını (EVM zincir kimliği **9800**) kapsar. Ana ağ (**`qorechain-vladi`**, EVM zincir kimliği **9801**) 7 Haziran 2026'dan beri canlıdır ve ayrı genesis, eşler ve bağlantı ayrıntılarına sahip kendine ait özel bir **Ana Ağa Bağlanma** sayfasına sahiptir.
:::

---

## Genesis'i İndirme

Yerel genesis dosyanızı resmi test ağı genesis'i ile değiştirin:

```bash
curl -o ~/.qorechaind/config/genesis.json \
  https://raw.githubusercontent.com/qorechain/qorechain-core/main/config/genesis.json
```

Bu dosya, doğrulayıcı kümesi, token tahsisleri ve modül parametreleri dahil olmak üzere Diana test ağının başlangıç durumunu tanımlar.

---

## Eşleri Yapılandırma

Düğüm yapılandırmanızı mevcut test ağı eşlerine bağlanacak şekilde düzenleyin.

`~/.qorechaind/config/config.toml` dosyasını açın ve `persistent_peers` alanını ayarlayın:

```toml
persistent_peers = "node-id@seed1.qorechain.io:26656,node-id@seed2.qorechain.io:26656"
```

En güncel eş listesi için [QoreChain deposuna](https://github.com/qorechain/qorechain-core) bakın.

### Önerilen Ayarlar

`config.toml` dosyasında aşağıdakileri de ayarlamak isteyebilirsiniz:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Bu değerler, Diana test ağının blok süreleri ve verimine göre ayarlanmıştır.

---

## Düğümü Başlatma

Ağ ile senkronizasyona başlamak için düğümünüzü çalıştırın:

```bash
./qorechaind start
```

Düğüm eşlere bağlanır ve blokları genesis'ten itibaren indirmeye başlar. İlk senkronizasyon süresi, geçerli zincir yüksekliğine ve ağ hızınıza bağlıdır.

---

## Senkronizasyon Durumunu Kontrol Etme

Düğümünüzün en son bloğa yetiştiğini doğrulayın:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — Düğüm hâlâ senkronize oluyor. Yetişmesini bekleyin.
* `false` — Düğüm tamamen senkronize ve yeni blokları işliyor.

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

Bu metrikler herhangi bir Prometheus uyumlu toplayıcı tarafından kazınabilir.

### Grafana Panoları

Docker Compose üzerinden çalıştırılıyorsa Grafana şu adreste mevcuttur:

```
http://localhost:3001
```

İlk girişte, istendiğinde kendi kimlik bilgilerinizi ayarlayın — varsayılanları olduğu gibi bırakmayın. Önceden yapılandırılmış panolar blok üretimini, işlem verimini, eş bağlantılarını ve kaynak kullanımını gösterir.

### REST Sağlık Kontrolü

REST API hızlı bir durum uç noktası sağlar:

```
http://localhost:1317
```

---

## Port Referansı

| Port    | Protokol  | Açıklama                                            |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — işlemleri sorgulama ve yayınlama             |
| `26656` | TCP       | P2P — eşler arası ağ iletişimi                     |
| `1317`  | HTTP      | REST API — zincir durumunu HTTP üzerinden sorgulama |
| `9090`  | gRPC      | gRPC API — programatik zincir erişimi             |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum uyumlu RPC (zincir kimliği `9800`) |
| `8546`  | WebSocket | EVM WebSocket — gerçek zamanlı EVM olay abonelikleri |
| `8899`  | HTTP      | SVM RPC — Solana uyumlu RPC                        |
| `26660` | HTTP      | Prometheus metrik uç noktası                      |

---

## Sonraki Adımlar

* [Cüzdan Kurulumu](/getting-started/wallet-setup) — Test ağı için bir cüzdan yapılandırın
* [İlk İşleminiz](/getting-started/first-transaction) — İlk QOR transferinizi gönderin
