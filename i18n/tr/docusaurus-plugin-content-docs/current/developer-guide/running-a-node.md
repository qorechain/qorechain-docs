---
slug: /developer-guide/running-a-node
title: Düğüm Çalıştırma
sidebar_label: Düğüm Çalıştırma
sidebar_position: 10
---

# Düğüm Çalıştırma

Bu kılavuz, **yalnızca düğüm** olarak çalışan bir QoreChain dağıtımını kapsar — zinciri senkronize eden ve entegrasyon için uç noktalar sunan, ancak **doğrulayıcı görevleri üstlenmeyen** bir tam (full) veya RPC düğümü. Ağa güvenilir okuma/yazma erişimine ihtiyaç duyan ancak blok imzalamayan borsalara (CEX), cüzdan arka uçlarına, indeksleyicilere ve entegratörlere yöneliktir.

:::note
Blok üretimi, staking, slashing ve havuz sınıflandırması için bunun yerine [Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator) sayfasına bakın. Yalnızca düğüm olarak yapılan bir dağıtım hiçbir zaman doğrulayıcı konsensüs anahtarı tutmaz ve aktif kümede asla görünmez.
:::

:::warning
İkili dosyalar (binary), genesis ve anlık görüntüler (snapshot) SHA-256 sağlama toplamlarıyla birlikte [download.qore.host](https://download.qore.host) adresinde yayınlanır. **Kurmadan veya arşivi açmadan önce sağlama toplamlarını her zaman doğrulayın** ve yatırılan tutarları (deposit) yalnızca kendi senkronize düğümünüze karşı doğrulayın.
:::

:::note Tek doğru kaynak: canlı manifesto
Güncel ikili dosya, genesis, eşler (peers), tohum düğümler (seeds) ve bir state-sync güven noktası, canlı olarak yenilenen bir JSON manifestosu olarak yayınlanır — kurulum betiklerinizde bir ikili dosya sürümünü, sağlama toplamını veya anlık görüntü dosya adını sabit kodlamayın, çünkü yeni bir sürüm çıkar çıkmaz bunlar güncelliğini yitirir:

- Mainnet: `https://download.qore.host/mainnet/latest.json`
- Testnet: `https://download.qore.host/testnet/latest.json`

Manifestonun alanları şunları içerir: `binary` (url + sha256), `genesis` (url + sha256 + sizeBytes), `peers`, `seeds`, `p2pPort`, `stateSync` (saatlik yenilenen bir güven noktası) ve `minCompatible`. Aşağıdaki kurulum ve katılım adımları bu manifestoyu alır ve güncel değerlerini kullanır.
:::

:::caution Yeni katılan bir düğüm için v3.1.92 veya üzeri gerekir
Genesis'ten senkronize olan veya bir arşiv/anlık görüntüden yeniden oynatma (replay) yapan bir düğümün **v3.1.92 veya üzeri** bir sürümde olması gerekir — daha eski sürümler (manifestonun `minCompatible` alanı henüz bunu yansıtacak şekilde güncellenmemiş olsa bile), artık düzeltilmiş bir gaz ölçümleme (gas-metering) hatası nedeniyle, yeniden oynatma sırasında işlem içeren ilk blokta duracaktır.

**Manifestonun kendisi bu tabanın gerisinde kalabilir** — önce testnet'e, ardından bir dinlenme (soak) süresinin sonunda mainnet'e yükseltilir ve bu satırların yazıldığı sırada mainnet manifestosundaki `binary.url` alanı hâlâ v3.1.92 öncesi bir derlemeyi göstermektedir. `binary.url`'e güvenmeden önce manifestonun `"version"` alanını kontrol edin; v3.1.92'nin gerisindeyse, ikili dosyayı manifesto yerine [qorechain-core GitHub sürümlerinden](https://github.com/qorechain/qorechain-core/releases) alın (yayınlanan sağlama toplamını aynı şekilde kontrol ederek) ya da kaynaktan derleyin.
:::

---

## Düğüm ve Doğrulayıcı Karşılaştırması

| Konu                | Yalnızca düğüm (bu kılavuz)                     | Doğrulayıcı                                |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Konsensüs anahtarı  | Yok                                             | ed25519 konsensüs anahtarı (güvence altına alınmalıdır) |
| Blok üretimi        | Hayır                                           | Evet — blok önerir ve imzalar              |
| Staking / slashing  | Geçerli değil                                   | Öz-delegasyon, slashing riski              |
| Temel amaç          | Entegrasyonlara RPC/REST/gRPC/EVM/SVM sunmak    | Ağı güvence altına almak, ödül kazanmak    |
| Genele açıklık      | RPC/EVM uç noktaları genellikle dışa açılır     | Doğrulayıcı, sentry düğümlerin arkasında gizlenir |

---

## Hedef Ağlar

| Ağ       | Zincir kimliği      | EVM zincir kimliği   | Notlar                         |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Birincil ağ — 7 Haziran 2026'dan beri canlı |
| Testnet  | `qorechain-diana`   | `9800`               | Entegrasyonların provasını önce burada yapın |

Bu kılavuz boyunca hedef ağınıza uygun `--chain-id` değerini kullanın. Örnekler varsayılan olarak mainnet'i kullanır.

---

## Önerilen Donanım

| Profil                   | CPU      | RAM   | Disk (NVMe SSD)         | Ağ        |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| Budanmış (pruned) RPC düğümü | 4 çekirdek | 16 GB | 500 GB+             | 100 Mbps+ |
| Tam/arşiv düğümü         | 8 çekirdek | 32 GB | 2 TB+ (zamanla büyür)  | 1 Gbps    |
| Borsa entegrasyonu       | 8 çekirdek | 32 GB | 2 TB+ (yedek alanla)   | 1 Gbps    |

NVMe SSD şiddetle önerilir — zincir durumu (state) ile EVM/SVM depoları yoğun G/Ç (I/O) kullanır. Arşiv düğümleri (budama yok, tam tx indeksleme) sürekli büyür; diski yedek alan bırakarak ve izlemeyle (monitoring) birlikte planlayın.

---

## Dağıtım

### Docker Compose

Docker Compose ile yalnızca düğüm dağıtımı. Şu an çekilebilecek genele açık, yayınlanmış bir `qorechaind` imajı yok — kendi imajınızı depodaki `Dockerfile`'dan derleyip canlı zincir sürümüne (mainnet'te **v3.1.92**) etiketleyin, ardından zincir verisi için kalıcı bir volume bağlayın:

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
docker build -t qorechain-node:v3.1.92 .
```

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain-node:v3.1.92
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

Veri dizinini bir kez başlatın (genesis ve eş/peer yapılandırması aşağıda anlatılmıştır), ardından başlatın:

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

Doğrudan sunucuya (bare-metal) kurulum için `qorechaind`'i systemd altında çalıştırın:

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

### 2. Manifestoyu alın

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

Aşağıdaki adımlarda ikili dosya, genesis ve eş değerleri için bu dosyayı kaynak olarak kullanın — `jq -r .minCompatible latest.json` çıktısını kontrol edin, ancak bu alan geride kalmış olsa bile yukarıdaki **v3.1.92 tabanının** geçerli olduğunu unutmayın.

### 3. Genesis'i indirin ve doğrulayın

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 4. Eşleri ve ücret tabanını yapılandırın

Düğüm kimliklerini ve adresleri sabit kodlamak yerine güncel eşleri ve tohum düğümleri manifestodan okuyun — bunlar zaman içinde değişir:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

`~/.qorechaind/config/config.toml` dosyasını açın ve `persistent_peers` (ve `seeds`) değerlerini bu değerlere ayarlayın:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Ardından `~/.qorechaind/config/app.toml` dosyasında asgari gaz fiyatını ayarlayın (ağ ücret tabanı: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### 5. Senkronizasyonu başlatın

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## Hızlı Başlatma

Genesis'ten senkronize olmak uzun sürebilir. Entegrasyonlarda hızlı bir soğuk başlangıç için **state sync** veya bir **anlık görüntü (snapshot)** kullanın.

### State sync

State sync, her bloğu yeniden oynatmak yerine güvenilir RPC sunucularından güncel bir uygulama durumu anlık görüntüsü alır. `config.toml` içindeki `[statesync]` bölümünü yapılandırın:

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

`trust_height` / `trust_hash` değerlerini manifestonun `stateSync` alanından alın — bu alan saatlik olarak yenilenir, dolayısıyla tercih edilen kaynaktır:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Yedek/alternatif olarak, güvenilir bir yükseklik ve hash değerini genele açık RPC'den kendiniz türetebilirsiniz:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### Anlık görüntüden geri yükleme

Alternatif olarak, yayınlanan zincir verisi anlık görüntüsünü indirin, sağlama toplamını doğrulayın ve veri dizininizin üzerine açın. Manifesto şu anda bir anlık görüntü işaretçisi taşımadığından, bir dosya adını sabit kodlamak yerine güncel dosya adı ve sağlama toplamı için [download.qore.host](https://download.qore.host) adresindeki canlı listeyi kontrol edin:

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Anlık görüntüler düzenli olarak değişen **blok yüksekliği damgalı dosya adlarıyla** yayınlanır — en güncel anlık görüntü ve SHA-256 sağlama toplamı için [download.qore.host](https://download.qore.host) adresini kontrol edin ve arşivi açmadan önce her zaman doğrulayın. Yukarıdaki **v3.1.92 asgari** koşulunun bir anlık görüntüden yeniden oynatma için de geçerli olduğunu unutmayın.
:::

---

## Budama (Pruning) ve İndeksleme

Budamayı ve işlem indekslemeyi entegrasyonunuza uyacak şekilde ayarlayın. Tam işlem geçmişine ihtiyaç duyan borsalar, asgari budamayla ve işlem indeksleyicisi etkin olarak çalışmalıdır.

### Budama (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Davranış                                 | Kullanım senaryosu                |
| ----------- | ----------------------------------------- | --------------------------------- |
| `default`   | Güncel durumu tutar, gerisini budar      | RPC düğümü, bakiye/durum sorguları |
| `nothing`   | Tüm geçmiş durumu tutar                  | Arşiv düğümü, tam geçmiş          |
| `custom`    | Operatör tanımlı keep/interval değerleri | Özelleştirilmiş saklama           |

### İşlem indeksleme (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

İşlemlerin hash ve event üzerinden sorgulanabilmesi için `indexer = "kv"` (veya daha zengin bir indeksleyici) ayarlayın — bu, yatırma ve çekme işlemlerini mutabakata bağlayan borsalar için vazgeçilmezdir. `indexer = "null"` ayarını yalnızca geçmiş tx sorgularına ihtiyacınız yoksa kullanın.

---

## Entegrasyon için Uç Noktaları Dışa Açma

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

Ve `config.toml` içindeki RPC dinleyicisini:

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| Uç nokta     | Port   | Kullanım amacı                                          |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | İşlem yayınlama, blok/durum sorgulama                  |
| REST         | `1317`  | Zincir durumunun HTTP ile sorgulanması                 |
| gRPC         | `9090`  | Yüksek verimli programatik erişim                      |
| EVM JSON-RPC | `8545`  | Ethereum uyumlu entegrasyonlar (zincir kimliği `9801`) |
| EVM WS       | `8546`  | EVM olay (event) abonelikleri                          |
| SVM RPC      | `8899`  | Solana uyumlu entegrasyonlar                           |

:::warning
RPC, EVM JSON-RPC veya gRPC'yi ters proxy (reverse proxy), hız sınırlama (rate limiting), kimlik doğrulama ve güvenlik duvarı olmadan asla doğrudan genele açık internete açmayın. `0.0.0.0` adresine bağlamayı yalnızca kontrollü bir giriş (ingress) katmanının arkasında yapın.
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

QoreChain, Prometheus metriklerini **26660** portunda sunar:

```
http://localhost:26660/metrics
```

Bu metrikleri Prometheus uyumlu herhangi bir toplayıcıyla toplayın. Docker Compose izleme yığınını çalıştırıyorsanız, Grafana `http://localhost:3001` adresinde erişilebilir — ilk girişte kendi kimlik bilgilerinizi belirleyin. Blok yüksekliği gecikmesini, eş (peer) sayısını ve kaynak kullanımını takip edin; `catching_up` değeri `true` olarak kaldığında veya eş sayısı sıfıra düştüğünde uyarı verecek şekilde yapılandırın.

### EVM uç noktası kontrolü

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Operasyonel En İyi Uygulamalar

1. **Zincir sürümünü sabitleyin.** Canlı etiketi çalıştırın (mainnet'te **v3.1.92**) ve koordineli yükseltmeler için resmi sürümleri takip edin.

2. **Yedekli düğümler çalıştırın.** Tek bir yeniden başlatma veya yeniden senkronizasyonun entegrasyon trafiğini kesintiye uğratmaması için bir yük dengeleyicinin (load balancer) arkasında en az iki düğüm işletin.

3. **Genesis ve anlık görüntüleri doğrulayın.** Başlatmadan önce genesis SHA-256 değerini ve tüm anlık görüntü sağlama toplamlarını her zaman resmi sürüme karşı doğrulayın.

4. **Genele açık uç noktaları koruyun.** RPC/EVM/gRPC'nin önüne ters proxy, hız sınırlama ve güvenlik duvarı koyun. Kimlik doğrulaması olmayan yazma RPC'sini asla internete açmayın.

5. **Budamayı ihtiyaca göre seçin.** Tam yatırma/çekme geçmişini mutabakata bağlayan borsalar için `pruning = "nothing"` artı `tx_index = "kv"` kullanın; hafif sorgular için `default` kullanın.

6. **Senkronizasyonu sürekli izleyin.** Blok yüksekliği gecikmesi, sıfır eş ve `catching_up` durumunda takılı kalan düğüm için uyarı kurun.

Tam bir düğüm çalıştırmadan ultra hafif okuma erişimi için **Light Node** dokümantasyonuna bakın.

---

## Sorun Giderme

### Yükseltmeden önce duran bir düğüm, ikili dosya değişiminden sonra devam etmiyor

Düğümünüz ikili dosyasını yükseltmeden **önce** zaten durmuş veya takılı kalmışsa, yeni ikili dosyayı yerleştirip yeniden başlatmak tek başına yeterli değildir — düğümde eski çalıştırmadan kalan bayat ABCI sonuçları önbelleğe alınmıştır ve durmaya neden olan bloğu yeniden yürütmez. Yeniden başlatmadan önce açıkça geri alın (rollback):

```bash
qorechaind rollback --home <HOME>
systemctl restart <unit>
```

Komut `qorechaind rollback`'tir (üst düzey bir alt komut) — bir `comet rollback` alt komutu yoktur ve bunun için bir `--hard` bayrağı bulunmaz.

### Eksik bir `priv_validator_state.json` nedeniyle anlık görüntü geri yükleme çökme döngüsüne giriyor

Yayınlanan bir arşiv/anlık görüntü `data/priv_validator_state.json` dosyasını **içermez** ve düğüm bu dosya olmadan başlamayı reddeder. Bir anlık görüntü geri yüklemesinden sonra bu dosya eksikse, oluşturun — ancak **yalnızca zaten mevcut değilse**. Gerçek bir dosyanın üzerine asla yazmayın: bir doğrulayıcıda bu dosya çift imzalamaya (double-signing) karşı koruma sağlar ve üzerine yazmak çift imzalama riski taşır.

```bash
echo '{"height":"0","round":0,"step":0}' > <HOME>/data/priv_validator_state.json
```

---

## Sonraki Adımlar

* [Mainnet'e Bağlanma](/getting-started/connecting-to-mainnet) — Mainnet genesis, eşler ve bağlantı ayrıntıları
* [Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator) — Blok üretim görevleri ekleyin
* [Kaynaktan Derleme](/developer-guide/building-from-source) — `qorechaind` ikili dosyasını derleyin
* **Light Node** — Ultra hafif salt okunur erişim (dokümantasyon yakında)
