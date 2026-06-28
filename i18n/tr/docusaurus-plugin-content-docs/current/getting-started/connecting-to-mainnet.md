---
slug: /getting-started/connecting-to-mainnet
title: Ana Ağa Bağlanma
sidebar_label: Ana Ağa Bağlanma
sidebar_position: 3
---

# Ana Ağa Bağlanma

Düğümünüzü doğru genesis dosyası, eşler ve ağ ayarlarıyla yapılandırarak canlı QoreChain Vladi ana ağına katılın.

:::note
Bu sayfa, Cosmos SDK v0.53 üzerinde **v3.1.80** zincir sürümünü çalıştıran ve **7 Haziran 2026 23:59 UTC** tarihinden beri canlı olan **`qorechain-vladi`** ana ağını (EVM zincir kimliği **9801**, onaltılık `0x2649`) kapsar. **`qorechain-diana`** test ağı (EVM zincir kimliği **9800**) için [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) bölümüne bakın ve canlıya geçmeden önce kurulumunuzu orada deneyin.
:::

:::warning
Ana ağ tohum (seed) düğümleri, kalıcı eşler, genesis URL'si ve SHA-256 sağlama toplamı her resmi ana ağ sürümüyle yayımlanır. **Bu güncel değerleri her zaman resmi ana ağ deposundan/sürümünden edinin** ve başlatmadan önce genesis sağlama toplamını doğrulayın. Aşağıdaki yer tutucular (`<MAINNET_SEED_NODE_ID>@<host>:26656`, genesis URL'si, anlık görüntü URL'leri) gerçek yayımlanan değerlerle değiştirilmelidir — doğrulanmamış eşlere veya genesis'e karşı bir ana ağ düğümü başlatmayın.
:::

---

## Kurulum

`qorechaind` ikili dosyasını ya kaynaktan derleyerek ya da resmi Docker imajını çekerek kurun.

### Kaynaktan derleme

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Tam ön koşullar (Go 1.26+, CGO, Rust araç zinciri, yerel kütüphaneler) için [Kaynaktan Derleme](/developer-guide/building-from-source) bölümüne bakın.

### Düğümü başlatma

```bash
./qorechaind init my-node --chain-id qorechain-vladi
```

Bu, `~/.qorechaind/` altında varsayılan yapılandırma ve veri dizinlerini oluşturur.

---

## Genesis'i İndirme

Yerel genesis dosyanızı resmi ana ağ genesis'i ile değiştirin:

```bash
curl -o ~/.qorechaind/config/genesis.json \
  <MAINNET_GENESIS_URL>
```

Devam etmeden önce genesis sağlama toplamını resmi ana ağ sürümünde yayımlanan değerle karşılaştırarak doğrulayın:

```bash
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

Bu dosya, genesis doğrulayıcı kümesi, token tahsisleri (genesis'te TGE) ve modül parametreleri dahil olmak üzere Vladi ana ağının başlangıç durumunu tanımlar.

:::note
`<MAINNET_GENESIS_URL>` ve `<MAINNET_GENESIS_SHA256>` yer tutuculardır. Güncel genesis URL'sini ve SHA-256 sağlama toplamını resmi ana ağ sürümünden/deposundan edinin ve düğümünüzü başlatmadan önce sağlama toplamının eşleştiğini doğrulayın.
:::

---

## Eşleri Yapılandırma

Düğüm yapılandırmanızı mevcut ana ağ eşlerine bağlanacak şekilde düzenleyin.

`~/.qorechaind/config/config.toml` dosyasını açın ve `seeds` ile `persistent_peers` alanlarını ayarlayın:

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
Yukarıdaki tohum ve kalıcı eş değerleri yer tutuculardır. Güncel ana ağ tohum düğümü kimliğini, ana bilgisayarını ve portunu resmi ana ağ deposundan/sürümünden edinin. Doğrulanmamış eşlere bağlanmayın.
:::

### Önerilen Ayarlar

`config.toml` dosyasında aşağıdakileri de ayarlamak isteyebilirsiniz:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Bu değerler, Vladi ana ağının blok süreleri ve verimine göre ayarlanmıştır.

---

## Düğümü Başlatma

Ağ ile senkronizasyona başlamak için düğümünüzü çalıştırın:

```bash
./qorechaind start
```

Düğüm eşlere bağlanır ve blokları genesis'ten itibaren indirmeye başlar. İlk senkronizasyon süresi, geçerli zincir yüksekliğine ve ağ hızınıza bağlıdır. Daha hızlı bir başlangıç için operatörler genellikle durum senkronizasyonu (state sync) veya güncel bir anlık görüntü kullanır — tam durum senkronizasyonu ve anlık görüntü iş akışı için [Düğüm Çalıştırma](/developer-guide/running-a-node) bölümüne bakın.

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

Doğru ağda olduğunuzu teyit edin — `network` alanı `qorechain-vladi` raporlamalıdır:

```bash
curl localhost:26657/status | jq '.result.node_info.network'
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

| Port    | Protokol  | Açıklama                                                  |
| ------- | --------- | -------------------------------------------------------- |
| `26657` | TCP       | RPC — işlemleri sorgulama ve yayınlama                   |
| `26656` | TCP       | P2P — eşler arası ağ iletişimi                           |
| `1317`  | HTTP      | REST API — zincir durumunu HTTP üzerinden sorgulama      |
| `9090`  | gRPC      | gRPC API — programatik zincir erişimi                   |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum uyumlu RPC (zincir kimliği `9801`) |
| `8546`  | WebSocket | EVM WebSocket — gerçek zamanlı EVM olay abonelikleri      |
| `8899`  | HTTP      | SVM RPC — Solana uyumlu RPC                              |
| `26660` | HTTP      | Prometheus metrik uç noktası                            |

---

## Ağ Bilgileri

| Alan              | Değer                                  |
| ----------------- | -------------------------------------- |
| Zincir kimliği    | `qorechain-vladi`                      |
| EVM zincir kimliği| `9801` (onaltılık `0x2649`)           |
| Zincir sürümü     | v3.1.80                                |
| Canlı olma tarihi | 7 Haziran 2026 23:59 UTC              |
| Token             | QOR (`uqor`, 10^6 mikro birim = 1 QOR) |
| Hesap öneki       | `qor`                                  |
| Doğrulayıcı öneki | `qorvaloper`                           |
| SDK               | Cosmos SDK v0.53                       |

---

## Sonraki Adımlar

* [Düğüm Çalıştırma](/developer-guide/running-a-node) — Borsalar ve entegratörler için tam/RPC düğümü işletin
* [Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator) — Bir doğrulayıcı oluşturun ve işletin
* [Cüzdan Kurulumu](/getting-started/wallet-setup) — Ana ağ için bir cüzdan yapılandırın
* [İlk İşleminiz](/getting-started/first-transaction) — İlk QOR transferinizi gönderin
* [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) — Ücretsiz test için Diana test ağına katılın
* [Ağlar](/appendix/networks) — Zincir kimlikleri, portlar ve tam ağlar referansı
