---
slug: /developer-guide/running-a-node
title: Düğüm Çalıştırma
sidebar_label: Düğüm Çalıştırma
sidebar_position: 10
---

# Düğüm Çalıştırma

Bu kılavuz, **yalnızca düğüm** olarak çalışan bir QoreChain dağıtımını — zinciri senkronize eden ve entegrasyon için uç noktalar sunan, ancak doğrulayıcı görevleri **üstlenmeyen** bir tam veya RPC düğümünü — çalıştırmayı kapsar. Ağa güvenilir okuma/yazma erişimine ihtiyaç duyan ancak blok imzalamayan borsalara (CEX), cüzdan arka uçlarına, indeksleyicilere ve entegratörlere yöneliktir.

:::note
Blok üretimi, staking, slashing ve havuz sınıflandırması için bunun yerine [Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator) sayfasına bakın. Yalnızca düğüm olarak çalışan bir dağıtım hiçbir zaman doğrulayıcı konsensüs anahtarı tutmaz ve aktif kümede asla görünmez.
:::

:::warning
İkili dosyalar, genesis ve anlık görüntüler (snapshot) SHA-256 sağlama toplamlarıyla birlikte [download.qore.host](https://download.qore.host) adresinde yayınlanır. **Kurmadan veya arşivi açmadan önce sağlama toplamlarını her zaman doğrulayın** ve yatırılan tutarları yalnızca kendi senkronize düğümünüze karşı doğrulayın.
:::

---

## Düğüm ve Doğrulayıcı Karşılaştırması

| Özellik             | Yalnızca düğüm (bu kılavuz)                      | Doğrulayıcı                                 |
| ------------------- | ------------------------------------------------ | ------------------------------------------- |
| Konsensüs anahtarı  | Yok                                              | ed25519 konsensüs anahtarı (güvence altına alınmalı) |
| Blok üretimi        | Hayır                                            | Evet — blok önerir ve imzalar               |
| Staking / slashing  | Geçerli değil                                    | Öz-delegasyon, slashing riski               |
| Temel amaç          | Entegrasyonlara RPC/REST/gRPC/EVM/SVM sunmak     | Ağı güvence altına almak, ödül kazanmak     |
| Kamuya açıklık      | RPC/EVM uç noktaları genellikle dışa açılır      | Doğrulayıcı, sentry düğümlerin arkasında gizlenir |

---

## Hedef Ağlar

| Ağ       | Zincir kimliği      | EVM zincir kimliği    | Notlar                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Birincil — 7 Haziran 2026'dan beri canlı |
| Testnet  | `qorechain-diana`   | `9800`               | Entegrasyonları önce burada prova edin |

Bu kılavuz boyunca hedef ağınıza uygun `--chain-id` değerini kullanın. Örnekler varsayılan olarak mainnet'i kullanır.

---

## Önerilen Donanım

| Profil                   | CPU        | RAM   | Disk (NVMe SSD)         | Ağ        |
| ------------------------ | ---------- | ----- | ----------------------- | --------- |
| Budanmış (pruned) RPC düğümü | 4 çekirdek | 16 GB | 500 GB+             | 100 Mbps+ |
| Tam/arşiv düğümü         | 8 çekirdek | 32 GB | 2 TB+ (zamanla büyür)   | 1 Gbps    |
| Borsa entegrasyonu       | 8 çekirdek | 32 GB | 2 TB+ (yedek alanla)    | 1 Gbps    |

NVMe SSD şiddetle önerilir — zincir durumu ile EVM/SVM depoları yoğun G/Ç kullanır. Arşiv düğümleri (budama yok, tam işlem indeksleme) sürekli büyür; diski yedek alan ve izleme ile birlikte tedarik edin.

---

## Dağıtım

### Docker Compose

Docker Compose ile yalnızca düğüm dağıtımı. İmaj etiketini canlı zincir sürümüne sabitleyin (mainnet'te **v3.1.82**) ve zincir verileri için kalıcı bir birim (volume) bağlayın.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.82
    container_name: qorechain-node
    restart: unless-stopped
    command: ["start", "--home", "/root/.qorechaind"]
    volumes:
      - qorechain-data:/root/.qorechaind
    ports:
      - "26657:26657"   # RPC
      - "26656:26656"   # P2P
      - "1317:1317"     # REST
      - "9090:9090"     # gRPC
      - "8545:8545"     # EVM JSON-RPC
      - "8546:8546"     # EVM WebSocket
      - "8899:8899"     # SVM RPC
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

Veri dizinini bir kez başlatın (genesis ve eş yapılandırması aşağıda ele alınmıştır), ardından çalıştırın:

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

Doğrudan sunucuya (bare-metal) kurulum için `qorechaind` uygulamasını systemd altında çalıştırın:

```ini
# /etc/systemd/system/qorechaind.service
[Unit]
Description=QoreChain node
After=network-online.target
Wants=network-online.target

[Service]
User=qorechain
ExecStart=/usr/local/bin/qorechaind start --home /var/lib/qorechaind
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now qorechaind
sudo journalctl -u qorechaind -f
```

---

## Ağa Katılma

### 1. Başlatma

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

### 2. Genesis dosyasını indirme ve doğrulama

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 3. Eşleri ve ücret tabanını yapılandırma

`~/.qorechaind/config/config.toml` dosyasını açın ve herkese açık mainnet sentry eşlerini ayarlayın:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

Ardından `~/.qorechaind/config/app.toml` dosyasında asgari gaz fiyatını ayarlayın (ağ ücret tabanı: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### 4. Senkronizasyonu başlatma

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## Hızlı Başlatma

Genesis'ten senkronize olmak uzun sürebilir. Entegrasyonlar için hızlı bir soğuk başlangıç amacıyla **state sync** veya **anlık görüntü (snapshot)** kullanın.

### State sync

State sync, her bloğu yeniden oynatmak yerine güvenilir RPC sunucularından yakın tarihli bir uygulama durumu anlık görüntüsü alır. `config.toml` dosyasındaki `[statesync]` bölümünü yapılandırın:

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Yakın tarihli güvenilir bir yükseklik ve hash değerini herkese açık RPC'den belirleyin:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### Anlık görüntüden geri yükleme

Alternatif olarak, yayınlanmış zincir verisi anlık görüntüsünü indirin, sağlama toplamını doğrulayın ve veri dizininizin üzerine açın:

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Anlık görüntüler **yükseklik damgalı dosya adlarıyla** yayınlanır — en güncel anlık görüntü ve SHA-256 sağlama toplamı için [download.qore.host](https://download.qore.host) adresini kontrol edin ve arşivi açmadan önce her zaman doğrulayın.
:::

---

## Budama ve İndeksleme

Budama (pruning) ve işlem indekslemeyi entegrasyonunuza uyacak şekilde ayarlayın. Tam işlem geçmişine ihtiyaç duyan borsalar, asgari budama ile ve işlem indeksleyicisi etkin olarak çalışmalıdır.

### Budama (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Davranış                                   | Kullanım senaryosu                 |
| ----------- | ------------------------------------------ | --------------------------------- |
| `default`   | Yakın tarihli durumu tutar, gerisini budar | RPC düğümü, bakiye/durum sorguları |
| `nothing`   | Tüm geçmiş durumu tutar                    | Arşiv düğümü, tam geçmiş          |
| `custom`    | Operatör tanımlı tutma/aralık değerleri    | Özelleştirilmiş saklama           |

### İşlem indeksleme (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

İşlemlerin hash ve olaya göre sorgulanabilir olması için `indexer = "kv"` (veya daha zengin bir indeksleyici) ayarlayın — bu, yatırma ve çekme işlemlerini mutabık kılan borsalar için vazgeçilmezdir. Yalnızca geçmiş işlem sorgularına ihtiyacınız yoksa `indexer = "null"` ayarlayın.

---

## Entegrasyon için Uç Noktaları Dışa Açma

Entegratörlerin ihtiyaç duyduğu API sunucularını `app.toml` dosyasında etkinleştirin ve bağlayın:

```toml
[api]
enable = true
address = "tcp://0.0.0.0:1317"

[grpc]
enable = true
address = "0.0.0.0:9090"

[json-rpc]
enable = true
address = "0.0.0.0:8545"
ws-address = "0.0.0.0:8546"
api = "eth,net,web3,qor"
```

Ve `config.toml` dosyasında RPC dinleyicisini:

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| Uç nokta     | Port    | Kullanım amacı                                          |
| ------------ | ------- | ------------------------------------------------------- |
| RPC          | `26657` | İşlem yayınlama, blok/durum sorgulama                   |
| REST         | `1317`  | Zincir durumunun HTTP ile sorgulanması                  |
| gRPC         | `9090`  | Yüksek verimli programatik erişim                       |
| EVM JSON-RPC | `8545`  | Ethereum uyumlu entegrasyonlar (zincir kimliği `9801`)  |
| EVM WS       | `8546`  | EVM olay abonelikleri                                   |
| SVM RPC      | `8899`  | Solana uyumlu entegrasyonlar                            |

:::warning
RPC, EVM JSON-RPC veya gRPC'yi ters proxy, hız sınırlama (rate limiting), kimlik doğrulama ve güvenlik duvarı olmadan asla doğrudan herkese açık internete açmayın. `0.0.0.0` adresine yalnızca kontrollü bir giriş (ingress) katmanının arkasında bağlanın.
:::

---

## Sağlık ve Senkronizasyon İzleme

### Senkronizasyon durumu

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — hâlâ senkronize oluyor.
* `false` — tamamen senkronize olmuş ve güncel durumu sunuyor.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

`network` alanı `qorechain-vladi` (mainnet) veya `qorechain-diana` (testnet) değerini bildirmelidir.

### Prometheus ve Grafana

QoreChain, Prometheus metriklerini **26660** portu üzerinden sunar:

```
http://localhost:26660/metrics
```

Bu metrikleri Prometheus uyumlu herhangi bir toplayıcı ile toplayın. Docker Compose izleme yığınını çalıştırıyorsanız Grafana `http://localhost:3001` adresinden erişilebilir — ilk girişte kendi kimlik bilgilerinizi ayarlayın. Blok yüksekliği gecikmesini, eş sayısını ve kaynak kullanımını takip edin; `catching_up` değeri `true` olarak kaldığında veya eş sayısı sıfıra düştüğünde uyarı verin.

### EVM uç nokta kontrolü

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Operasyonel En İyi Uygulamalar

1. **Zincir sürümünü sabitleyin.** Canlı etiketi çalıştırın (mainnet'te **v3.1.82**) ve koordineli yükseltmeler için resmî sürümleri takip edin.

2. **Yedekli düğümler çalıştırın.** Tek bir yeniden başlatma veya yeniden senkronizasyonun entegrasyon trafiğini kesintiye uğratmaması için bir yük dengeleyicinin arkasında en az iki düğüm işletin.

3. **Genesis ve anlık görüntüleri doğrulayın.** Başlatmadan önce genesis SHA-256 değerini ve her anlık görüntü sağlama toplamını her zaman resmî sürüme karşı doğrulayın.

4. **Herkese açık uç noktaları koruyun.** RPC/EVM/gRPC'nin önüne ters proxy, hız sınırlama ve güvenlik duvarı koyun. Kimlik doğrulamasız yazma RPC'sini asla internete açmayın.

5. **Budamayı ihtiyaca göre seçin.** Tam yatırma/çekme geçmişini mutabık kılan borsalar için `pruning = "nothing"` ile birlikte `tx_index = "kv"` kullanın; hafif sorgular için `default` kullanın.

6. **Senkronizasyonu sürekli izleyin.** Blok yüksekliği gecikmesi, sıfır eş sayısı ve `catching_up` durumunda takılı kalan düğüm için uyarı kurun.

Tam düğüm çalıştırmadan ultra hafif okuma erişimi için **Light Node** dokümantasyonuna bakın.

---

## Sonraki Adımlar

* [Mainnet'e Bağlanma](/getting-started/connecting-to-mainnet) — Mainnet genesis, eşler ve bağlantı ayrıntıları
* [Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator) — Blok üretimi görevleri ekleyin
* [Kaynaktan Derleme](/developer-guide/building-from-source) — `qorechaind` ikili dosyasını derleyin
* **Light Node** — Ultra hafif salt okunur erişim (dokümantasyon yakında)
