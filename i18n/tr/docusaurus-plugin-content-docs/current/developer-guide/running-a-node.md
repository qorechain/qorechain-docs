---
slug: /developer-guide/running-a-node
title: Düğüm Çalıştırma
sidebar_label: Düğüm Çalıştırma
sidebar_position: 10
---

# Düğüm Çalıştırma

Bu kılavuz, **yalnızca düğüm** olan bir QoreChain dağıtımını — zinciri senkronize eden ve entegrasyon için uç noktalar sunan, **doğrulayıcı görevleri olmayan** bir tam veya RPC düğümünü — çalıştırmayı kapsar. Ağa güvenilir okuma/yazma erişimine ihtiyaç duyan ancak blok imzalamayan borsaları (CEX), cüzdan arka uçlarını, indeksleyicileri ve entegratörleri hedefler.

:::note
Blok üretimi, stake etme, slashing ve havuz sınıflandırması için bunun yerine [Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator) bölümüne bakın. Yalnızca düğüm dağıtımı asla bir doğrulayıcı konsensüs anahtarı tutmaz ve asla aktif sette görünmez.
:::

:::warning
Ana ağ tohum düğümleri, kalıcı eşler, genesis URL'si/sağlama toplamı ve anlık görüntü/durum senkronizasyonu RPC uç noktaları her resmi ana ağ sürümüyle yayımlanır. **Bu güncel değerleri resmi ana ağ deposundan/sürümünden edinin** ve başlamadan önce genesis sağlama toplamını doğrulayın. Aşağıdaki yer tutucular (`<MAINNET_SEED_NODE_ID>@<host>:26656`, `<MAINNET_GENESIS_URL>`, anlık görüntü/durum senkronizasyonu URL'leri) gerçek yayımlanan değerlerle değiştirilmelidir.
:::

---

## Düğüm ile Doğrulayıcı

| Yön              | Yalnızca düğüm (bu kılavuz)                          | Doğrulayıcı                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Konsensüs anahtarı       | Yok                                            | ed25519 konsensüs anahtarı (güvenceye alınmalı)    |
| Blok üretimi    | Hayır                                              | Evet — blok önerir ve imzalar            |
| Stake / slashing  | Geçerli değil                                  | Öz-delegasyon, slashing riski             |
| Birincil amaç     | Entegrasyonlara RPC/REST/gRPC/EVM/SVM sunmak     | Ağı güvenceye almak, ödül kazanmak           |
| Genel erişim     | RPC/EVM uç noktaları genellikle açığa çıkar             | Doğrulayıcı, sentry düğümlerinin arkasında gizli       |

---

## Hedef Ağlar

| Ağ  | Zincir Kimliği            | EVM zincir kimliği         | Notlar                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Ana Ağ  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Birincil — 7 Haz 2026'dan beri yayında |
| Test Ağı  | `qorechain-diana`   | `9800`               | Entegrasyonları önce burada deneyin |

Bu kılavuz boyunca hedef ağınız için uygun `--chain-id` değerini kullanın. Örnekler varsayılan olarak ana ağı kullanır.

---

## Önerilen Donanım

| Profil                  | CPU      | RAM   | Disk (NVMe SSD)         | Ağ   |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| Budanmış RPC düğümü          | 4 çekirdek  | 16 GB | 500 GB+                 | 100 Mbps+ |
| Tam/arşiv düğümü        | 8 çekirdek  | 32 GB | 2 TB+ (zamanla büyür) | 1 Gbps    |
| Borsa entegrasyonu     | 8 çekirdek  | 32 GB | 2 TB+ pay ile     | 1 Gbps    |

NVMe SSD şiddetle önerilir — zincir durumu ve EVM/SVM depoları G/Ç yoğundur. Arşiv düğümleri (budama yok, tam işlem indeksleme) sürekli büyür; diski payla ve izlemeyle sağlayın.

---

## Dağıtım

### Docker Compose

Docker Compose ile yalnızca düğüm dağıtımı. İmaj etiketini yayındaki zincir sürümüne (ana ağda **v3.1.77**) sabitleyin ve zincir verisi için kalıcı bir birim bağlayın.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.77
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

Veri dizinini bir kez başlatın (genesis ve eş yapılandırması aşağıda ele alınmaktadır), ardından başlatın:

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

Donanım üzerine kurulum için `qorechaind`'i systemd altında çalıştırın:

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
curl -o ~/.qorechaind/config/genesis.json <MAINNET_GENESIS_URL>
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

:::note
`<MAINNET_GENESIS_URL>` ve `<MAINNET_GENESIS_SHA256>` yer tutuculardır — güncel genesis URL'sini ve sağlama toplamını resmi ana ağ sürümünden/deposundan edinin ve başlamadan önce sağlama toplamını doğrulayın.
:::

### 3. Tohumları ve eşleri yapılandırma

`~/.qorechaind/config/config.toml` dosyasını açın:

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
Tohum ve eş değerleri yer tutuculardır. Güncel ana ağ tohumlarını ve kalıcı eşlerini resmi ana ağ deposundan/sürümünden edinin.
:::

### 4. Senkronizasyonu başlatma

```bash
qorechaind start
```

---

## Hızlı Önyükleme

Genesis'ten senkronize etmek uzun sürebilir. Entegrasyonlar için hızlı bir soğuk başlangıç amacıyla **durum senkronizasyonu** veya bir **anlık görüntü** kullanın.

### Durum senkronizasyonu

Durum senkronizasyonu, her bloğu yeniden oynatmak yerine güvenilir RPC sunucularından yakın tarihli bir uygulama durumu anlık görüntüsü getirir. `config.toml` dosyasındaki `[statesync]` bölümünü yapılandırın:

```toml
[statesync]
enable = true
rpc_servers = "<STATESYNC_RPC_1>,<STATESYNC_RPC_2>"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Sağlıklı bir RPC uç noktasından yakın tarihli bir güvenilir yükseklik ve özet belirleyin:

```bash
curl -s <STATESYNC_RPC_1>/block | jq '.result.block.header.height, .result.block_id.hash'
```

:::note
`<STATESYNC_RPC_1>`, `<STATESYNC_RPC_2>`, `<TRUSTED_BLOCK_HEIGHT>` ve `<TRUSTED_BLOCK_HASH>` yer tutuculardır. Resmi ana ağ sürümünde yayımlanan durum senkronizasyonu RPC sunucularını kullanın ve güvenilir yükseklik/özet değerlerini yakın tarihli bir bloktan türetin.
:::

### Anlık görüntü geri yükleme

Alternatif olarak, yakın tarihli bir zincir verisi anlık görüntüsü indirin ve veri dizininizin üzerine çıkarın:

```bash
curl -o snapshot.tar.lz4 <MAINNET_SNAPSHOT_URL>
lz4 -dc snapshot.tar.lz4 | tar -xf - -C ~/.qorechaind/
qorechaind start
```

:::note
`<MAINNET_SNAPSHOT_URL>` bir yer tutucudur. Anlık görüntü URL'lerini (ve herhangi bir eşlik eden sağlama toplamını) resmi ana ağ sürümünden/deposundan edinin ve çıkarmadan önce sağlama toplamını doğrulayın.
:::

---

## Budama ve İndeksleme

Budamayı ve işlem indekslemeyi entegrasyonunuza uyacak şekilde ayarlayın. Tam işlem geçmişine ihtiyaç duyan borsalar, en az budama ile ve işlem indeksleyici etkinleştirilmiş olarak çalışmalıdır.

### Budama (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Davranış                                | Kullanım durumu                          |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | Yakın tarihli durumu tutar, geri kalanı budar      | RPC düğümü, bakiye/durum aramaları   |
| `nothing`   | Tüm geçmiş durumu tutar               | Arşiv düğümü, tam geçmiş        |
| `custom`    | Operatör tanımlı tutma/aralık değerleri    | Ayarlanmış saklama                   |

### İşlem indeksleme (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

İşlemlerin hash ve olaya göre sorgulanabilir olması için `indexer = "kv"` (veya daha zengin bir indeksleyici) ayarlayın — borsaların yatırma ve çekme işlemlerini mutabık kılması için elzemdir. Yalnızca geçmiş işlem sorgularına ihtiyacınız yoksa `indexer = "null"` ayarlayın.

---

## Entegrasyon için Uç Noktaları Açma

Entegratörlerin ihtiyaç duyduğu API sunucularını `app.toml` içinde etkinleştirin ve bağlayın:

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

Ve RPC dinleyicisini `config.toml` içinde:

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| Uç Nokta     | Port   | Kullanım amacı                                                |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | İşlemleri yayınlama, blokları/durumu sorgulama      |
| REST         | `1317`  | Zincir durumunun HTTP sorguları                            |
| gRPC         | `9090`  | Yüksek verimli programatik erişim                    |
| EVM JSON-RPC | `8545`  | Ethereum uyumlu entegrasyonlar (zincir kimliği `9801`)     |
| EVM WS       | `8546`  | EVM olay abonelikleri                                |
| SVM RPC      | `8899`  | Solana uyumlu entegrasyonlar                         |

:::warning
RPC, EVM JSON-RPC veya gRPC'yi ters proxy, hız sınırlama, kimlik doğrulama ve güvenlik duvarı olmadan asla doğrudan genel internete açmayın. `0.0.0.0`'a yalnızca kontrollü bir giriş katmanının arkasında bağlayın.
:::

---

## Sağlık ve Senkronizasyon İzleme

### Senkronizasyon durumu

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — hâlâ senkronize ediyor.
* `false` — tamamen senkronize ve güncel durumu sunuyor.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

`network` alanı `qorechain-vladi` (ana ağ) veya `qorechain-diana` (test ağı) raporlamalıdır.

### Prometheus ve Grafana

QoreChain, Prometheus metriklerini **26660** portunda sunar:

```
http://localhost:26660/metrics
```

Bunları herhangi bir Prometheus uyumlu toplayıcıyla kazıyın. Docker Compose izleme yığınını çalıştırıyorsanız, Grafana `http://localhost:3001` adresinde mevcuttur — ilk girişte kendi kimlik bilgilerinizi ayarlayın. Blok yüksekliği gecikmesini, eş sayısını ve kaynak kullanımını izleyin; `catching_up` `true` kaldığında veya eş sayısı sıfıra düştüğünde uyarı verin.

### EVM uç nokta kontrolü

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Operasyonel En İyi Uygulamalar

1. **Zincir sürümünü sabitleyin.** Yayındaki etiketi (ana ağda **v3.1.77**) çalıştırın ve koordineli yükseltmeler için resmi sürümleri takip edin.

2. **Yedekli düğümler çalıştırın.** Tek bir yeniden başlatmanın veya yeniden senkronizasyonun entegrasyon trafiğini kesmemesi için bir yük dengeleyicinin arkasında en az iki düğüm çalıştırın.

3. **Genesis ve anlık görüntüleri doğrulayın.** Başlamadan önce her zaman genesis SHA-256'yı ve herhangi bir anlık görüntü sağlama toplamını resmi sürüme karşı doğrulayın.

4. **Genel uç noktaları koruyun.** RPC/EVM/gRPC'nin önüne bir ters proxy, hız sınırlama ve güvenlik duvarı koyun. Kimlik doğrulamasız yazma RPC'sini asla internete açmayın.

5. **Budamayı ihtiyaca göre eşleştirin.** Tam yatırma/çekme geçmişini mutabık kılan borsalar için `pruning = "nothing"` artı `tx_index = "kv"` kullanın; hafif aramalar için `default` kullanın.

6. **Senkronizasyonu sürekli izleyin.** Blok yüksekliği gecikmesi, sıfır eş ve `catching_up` durumunda takılı kalan bir düğüm için uyarı verin.

Tam bir düğüm çalıştırmadan ultra-hafif okuma erişimi için **Hafif Düğüm** belgelerine bakın.

---

## Sonraki Adımlar

* [Ana Ağa Bağlanma](/getting-started/connecting-to-mainnet) — Ana ağ genesis, eşler ve bağlantı ayrıntıları
* [Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator) — Blok üretimi görevleri ekleyin
* [Kaynaktan Derleme](/developer-guide/building-from-source) — `qorechaind` ikili dosyasını derleyin
* **Hafif Düğüm** — Ultra-hafif salt okunur erişim (belgeler yakında)
