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

:::caution Manifestonun adını verdiği sürümü kullanın: mainnet'te v3.2.3
Genesis'ten senkronize olan veya bir anlık görüntüden yeniden oynatma (replay) yapan bir düğüm, birkaç yönetişim (governance) yükseltmesinden geçer (aşağıdaki [Yükseltmeler](#upgrades) bölümüne bakın); bu nedenle her zaman manifestonun işaret ettiği ikili dosyayı kurun: bu dosya tüm yükseltme işleyicilerini (handler) taşır. **Mainnet**'te manifestodaki `minCompatible` ve `version` değerlerinin ikisi de `3.2.3`'tür (20 Ekim 2026'da 3.662.051 yüksekliğinde uygulanan koordineli yükseltme); bu nedenle şimdi katılan bir düğüm v3.2.3 gerektirir: daha eski bir ikili dosya, bilmediği yükseltme yüksekliğinde durur. **Testnet**'te ikisi de `3.2.4`'tür (19 Ekim 2026'da 8.337.253 yüksekliğinde uygulandı). Mainnet, 3.742.566 yüksekliğine kadar v3.2.3'ü, o bloktan itibaren v3.2.4'ü çalıştırır (yönetişim önerisi 13); bu nedenle mainnet'e karşı bir testnet ikili dosyası çalıştırmayın ve manifesto onu adlandırmadan bir mainnet düğümüne v3.2.4 kurmayın (bkz. [Yükseltmeler](#upgrades)). Manifesto kasıtlı olarak kademeli yükseltilir (önce testnet'e, ardından bir dinlenme/soak süresinin sonunda mainnet'e); bu yüzden `binary.url`'e güvenmeden önce manifestonun `"version"` alanını `minCompatible` ile karşılaştırarak kontrol edin.

Genel kaynaktan derlenen bir ikili dosya (topluluk derlemesi) her iki genel ağda da başlamayı reddeder (v3.2.3 ve sonrası): kuantum sonrası imzaları doğrulayamaz ve ağların bloklarını sadık biçimde yeniden oynatamaz. Yalnızca sürüm arşivini kullanın.

v3.2.1'den itibaren iki ayar önem taşır: sistem saatini NTP ile senkronize tutun (saati 60 saniyeden fazla sapan düğüm durur) ve `app.toml` içinde `evm-chain-id` değerini ayarlayın ([Düğüm sınırları](#node-limits) bölümüne bakın).
:::

---

## Düğüm ve Doğrulayıcı Karşılaştırması

| Konu                | Yalnızca düğüm (bu kılavuz)                     | Doğrulayıcı                                |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Konsensüs anahtarı  | Yok                                             | ed25519 konsensüs anahtarı (güvence altına alınmalıdır) |
| Blok üretimi        | Hayır                                           | Evet — blok önerir ve imzalar              |
| Staking / slashing  | Geçerli değil                                   | Öz-delegasyon, slashing riski              |
| Temel amaç          | Entegrasyonlara RPC/REST/gRPC/EVM (ve salt okunur SVM) sunmak | Ağı güvence altına almak (staking ödülleri geçerlidir) |
| Genele açıklık      | RPC/EVM uç noktaları genellikle dışa açılır     | Doğrulayıcı, sentry düğümlerin arkasında gizlenir |

---

## Hedef Ağlar

| Ağ       | Zincir kimliği      | EVM zincir kimliği   | Notlar                         |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Birincil ağ — 7 Haziran 2026'dan beri canlı; düğüm sürümü v3.2.3 (3.742.566 yüksekliğinden itibaren v3.2.4) |
| Testnet  | `qorechain-diana`   | `9800`               | Entegrasyonların provasını önce burada yapın; düğüm sürümü v3.2.4 (19 Eki 2026'dan beri) |

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

Docker Compose ile yalnızca düğüm dağıtımı. Çekilebilecek genele açık, yayınlanmış bir `qorechaind` imajı yok (projenin Docker Hub organizasyonu altında hiçbir şey yayınlanmamıştır). Genel depodaki `Dockerfile`, **topluluk (community)** ikili dosyasını derler (kuantum sonrası kütüphane yok, stub keeper'lar): yerel geliştirme için uygundur, ancak mainnet'i veya testnet'i takip edemez ve v3.2.3'ten beri onlarda başlamayı reddeder. Bir ağ düğümü için, `latest.json` içinde belirtilen **sürüm arşivinden** kendi imajınızı derleyin, sürüm numarasıyla etiketleyin (mainnet'te **v3.2.3**, testnet'te **v3.2.4**), ardından zincir verisi için kalıcı bir volume bağlayın:

```bash
# Fetch and verify the release archive (see "Joining the Network" below for the manifest steps)
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
curl -fsSL "$(jq -r .binary.url latest.json)" -o qore.tgz
echo "$(jq -r .binary.sha256 latest.json)  qore.tgz" | sha256sum -c -
mkdir release && tar xzf qore.tgz -C release

cat > release/Dockerfile <<'EOF'
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates curl jq && rm -rf /var/lib/apt/lists/*
COPY qorechaind /usr/local/bin/qorechaind
COPY lib/ /opt/qorechain/lib/
ENV LD_LIBRARY_PATH=/opt/qorechain/lib
ENTRYPOINT ["qorechaind"]
EOF
docker build -t qorechain-node:v3.2.3 release/
```

Arşiv, `qorechaind` dosyasını ve paylaşımlı kütüphanelerini (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`) içeren bir `lib/` dizinini barındırır; yukarıdaki imaj, sürüm arşivi gibi yalnızca `linux/amd64` içindir.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain-node:v3.2.3
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
      - "8899:8899"     # SVM RPC (read-only: SVM transactions are disabled)
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

Veri dizinini bir kez başlatın (örneğin `docker compose run --rm qorechain-node init my-node --chain-id qorechain-vladi --home /root/.qorechaind`; genesis ve eş/peer yapılandırması aşağıda anlatılmıştır), ardından başlatın:

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

### 2. Manifestoyu alın {#fetch-the-manifest}

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

Aşağıdaki adımlarda ikili dosya, genesis ve eş değerleri için bu dosyayı kaynak olarak kullanın — `jq -r .minCompatible latest.json` çıktısını kontrol edin ve en az o sürümü çalıştırın (önerilen sürüm `jq -r .version latest.json` çıktısıdır).

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

`qorechaind init <moniker> --chain-id qorechain-vladi` komutu, ağın EVM zincir kimliğini de `app.toml` dosyasına yazar ([Düğüm sınırları](#node-limits) bölümüne bakın); uzun zaman önce başlatılmış bir home dizininde bu değeri kontrol edin.

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

Alternatif olarak, yayınlanan zincir verisi anlık görüntüsünü indirin, sağlama toplamını doğrulayın ve veri dizininizin üzerine açın. Mainnet'te manifestonun `snapshot` nesnesi URL'yi, blok `height` değerini, boyutu ve SHA-256 değerini verir. **Testnet manifestosunun anlık görüntü URL'si şu anda `404` döndürür (hiçbir testnet anlık görüntüsü yayınlanmamıştır), bu yüzden orada state sync kullanın.** Mainnet anlık görüntüsünü kullanmadan önce `snapshot.height` değerini okuyun: yaklaşık 27 GB'lık tek bir arşivdir ve eski bir anlık görüntü uzun bir yetişme süresi demektir. Şu anda yayınlanan mainnet anlık görüntüsü 21 Ağustos 2026 tarihlidir (yükseklik 1.966.629): v3.1.94, v3.2.0, v3.2.2, v3.2.3 ve v3.2.4 yükseltme yüksekliklerinden öncesine aittir; bu nedenle ondan geri yüklenen bir düğüm, manifestonun adlandırdığı sürüm ikili dosyasıyla yaklaşık iki aylık bloğu yeniden oynatır. State sync neredeyse her zaman daha iyi seçimdir.

```bash
SNAP_URL=$(jq -r .snapshot.url latest.json)
SNAP_SHA256=$(jq -r .snapshot.sha256 latest.json)
curl -fsSL "$SNAP_URL" -o snapshot.tar.gz
echo "${SNAP_SHA256}  snapshot.tar.gz" | sha256sum -c -

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Manifestonun `snapshot.height` ve `snapshot.ts` alanları arşivin ne kadar güncel olduğunu söyler; state sync (yukarıda) genellikle 27 GB'lık bir indirmeden daha hızlıdır. Arşivi açmadan önce sağlama toplamını her zaman doğrulayın ve bir anlık görüntüden yeniden oynatırken tüm yükseltme işleyicilerini taşıyan bir düğüm sürümü kullanın (bu sayfanın başındaki uyarıya bakın).
:::

---

## Yükseltmeler {#upgrades}

Konsensüs değişiklikleri **koordineli yönetişim yükseltmeleri** olarak gelir: kabul edilen bir önerge bir plan (örneğin `v3.2.3`) ve bir blok yüksekliği belirtir. Sürüm ikili dosyası yükseltme işleyicilerini taşır; plan yüksekliğinde her düğümün onu çalıştırıyor olması gerekir ve hâlâ önceki ikili dosyada olan bir düğüm **o yükseklikte durur** (bu, yükseltme modülünün amaçlanan davranışıdır). Manifesto, bir sürümün hangi türde olduğunu söyler: `upgradeType`, koordineli bir yükseltme için `height`'tır (`upgradeHeight` ayarlıdır) ve düğüm düğüm değiştirilebilen düğüme yerel bir sürüm için `rolling`'dir. Yeni ikili dosyayı yükseklikten **önce** kurun; düğümünüz önce durduysa ikili dosyayı değiştirip yeniden başlatın ([Sorun Giderme](#troubleshooting) altındaki geri alma notuna bakın).

| Sürüm | Mainnet `qorechain-vladi` | Testnet `qorechain-diana` |
| ------- | ------------------------- | ------------------------- |
| v3.1.94 | yükseklik 2.122.074 | uygulanmadı |
| v3.2.0 | yükseklik 2.981.742 | yükseklik 5.920.000 |
| v3.2.1 | düğüme yerel, yükseklik yok | düğüme yerel |
| v3.2.2 | yükseklik 3.556.788 (16 Eki 2026) | yükseklik 6.905.034 (2 Eki 2026) |
| v3.2.3 | yükseklik 3.662.051 (20 Eki 2026, yönetişim önerisi 11) | yükseklik 8.003.746 (15 Eki 2026) |
| v3.2.4 | mainnet'te 3.742.566 yüksekliğinde planlandı (yönetişim önerisi 13) | yükseklik 8.337.253 (19 Eki 2026, yönetişim önerisi 13) |

**v3.2.4 için bir mainnet düğüm operatörü ne yapar (yükseklik 3.742.566).** Yönetişim önerisi 13, planı 3.742.566 yüksekliğinde `v3.2.4` olarak adlandırır ve düğümlerin o yüksekliğe kadar v3.2.3'te kalacağını, orada duracağını ve v3.2.4 ile yeniden başlayacağını belirtir. Somut olarak:

1. Mainnet manifestosu (`https://download.qore.host/mainnet/latest.json`) v3.2.4'ü listeleyene kadar **v3.2.3** çalıştırmaya devam edin. Manifesto hâlâ `version` ve `minCompatible` için `3.2.3` gösterirken ve v3.2.4 için hiçbir yükseltme yüksekliği yokken kurulacak bir şey yoktur: testnet dizinindeki bir v3.2.4 ikili dosyası mainnet sürümü değildir.
2. Manifesto v3.2.4'ü adlandırdığında, arşivi `binary.url` adresinden indirin, `sha256` değerini doğrulayın (öneri metni de ikili dosyanın sha256 değerini yayımlar) ve yükseklikten **önce** yerleştirin. Bekleyen plan (`name` ve `height`) için `GET /cosmos/upgrade/v1beta1/current_plan` adresini, mevcut yükseklik için RPC üzerinde `GET /status` adresini kontrol edin.
3. 3.742.566 yüksekliğinde hâlâ v3.2.3'te olan bir düğüm **durur** (bu, yükseltme modülünün amaçlanan davranışıdır, bir arıza değildir); zaten yeni ikili dosyayı çalıştıran bir düğüm yükseltme işleyicisini uygular ve devam eder. Sizinki önce durduysa, ikili dosyayı değiştirin ve yeniden başlatın. Yükseltmeden sonra `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.4` adresi `0` yerine yüksekliği döndürür.
4. Yükseltmeden sonra mainnet'e katılan bir düğüm, o sırada manifestonun adlandırdığı sürümü kurar (`version` değerini `minCompatible` ile karşılaştırın).

İşlem imzalama, adresler, ondalık basamaklar, memolar ve ücretler v3.2.4 ile değişmez.

Canlı kaydı `GET /cosmos/upgrade/v1beta1/applied_plan/<name>` ile (`0` = uygulanmadı) ve bekleyen herhangi bir planı `GET /cosmos/upgrade/v1beta1/current_plan` ile okuyun. v3.2.2; konsensüs motoru, Cosmos SDK (v0.53.8) ve IBC bağımlılıklarını yükseltti ve SDK'nın daha katı işlem kontrolleri, bu sürümün önceki ikili dosyayı düğüm düğüm değil yükseltme yüksekliğinde değiştirmesini sağlar. İşlem imzalama, adresler, ondalık basamaklar, memo'lar ve ücretler v3.2.2 veya v3.2.3'te değişmedi.

**State sync ve saat.** State sync güven noktasını manifestonun `stateSync` bloğundan alır (`trustHeight`, `trustHash`, saatlik yenilenir); listelediği RPC sunucusu projenin kendi sunucusudur, bu nedenle üretim düğümü için güvendiğiniz RPC sunucuları ekleyin ve güven hash'ini başka bir kaynağa karşı kontrol edin. Saati NTP ile senkronize tutun: düğüm, ağla arasındaki sapma 60 saniyeyi aştığında durur.

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

### Düğüm sınırları (`app.toml`) {#node-limits}

v3.2.1 düğüm sürümünden itibaren `init`, düğüme yerel üç sınır içeren bir `[qorechain]` bölümü yazar. Bu sınırlar yalnızca bu düğümün bellekte neyi tuttuğunu ve önerdiği bloklara neyi koyduğunu değiştirir; bir bloğun geçerli olması için neleri içermesi gerektiğini asla değiştirmez:

```toml
[qorechain]
# Maximum number of Cosmos transactions held in the app-side mempool (default 5000).
# When full, a new transaction that pays more per gas evicts the lowest-paying one; otherwise it is refused.
cosmos-mempool-max-txs = 5000

# Time the node may spend selecting transactions for a proposal before it proposes what it has ("0s" disables the budget).
prepare-proposal-budget = "1s"

# Stop after this many candidates in a row that do not fit in the remaining block space (0 disables the cap).
prepare-proposal-max-skips = 64
```

`init` ayrıca ağın EVM zincir kimliğini `app.toml` dosyasındaki `[evm]` bölümünün `evm-chain-id` ayarına yazar (`--chain-id qorechain-vladi` için `9801`, `qorechain-diana` için `9800`). `app.toml` dosyasında farklı bir değer taşıyan bir düğüm yine de başlar, ancak başlangıçta bir hata kaydeder ve dosyayı düzeltene kadar kendi JSON-RPC'si (`eth_chainId`, o düğüme karşı imzalama) yanlış zincir kimliğiyle yanıt verir; konsensüs etkilenmez. Eski ikili dosyalar `--chain-id` değerinden bağımsız olarak testnet değerini (`9800`) yazıyordu; bu yüzden uzun zaman önce başlatılmış bir mainnet düğümü bu ayarı kontrol etmelidir. `QORE_EVM_CHAIN_ID` değerini ağın değerinden farklı bir değere ayarlamayın: böyle bir düğüm başlamayı reddeder.

### İşlem indeksleme (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

İşlemlerin hash ve event üzerinden sorgulanabilmesi için `indexer = "kv"` (veya daha zengin bir indeksleyici) ayarlayın — bu, yatırma ve çekme işlemlerini mutabakata bağlayan borsalar için vazgeçilmezdir. `indexer = "null"` ayarını yalnızca geçmiş tx sorgularına ihtiyacınız yoksa kullanın.

---

## Entegrasyon için Uç Noktaları Dışa Açma {#exposing-endpoints-for-integration}

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
api = "eth,net,web3,txpool"
```

**Düğüm sürümü v3.2.4'te JSON-RPC sınırları.** v3.2.4 ikili dosyasını çalıştıran bir düğüm (testnet'te 19 Ekim 2026'dan beri; mainnet düğümlerinde 3.742.566 yüksekliğinden itibaren) kendi JSON-RPC sunucusunu sınırlar. Bunlar `app.toml` içindeki `[json-rpc]` bölümündeki düğüme yerel ayarlardır ve konsensüsü etkilemez: `http-body-limit` (varsayılan 262144 bayt, 256 KiB; daha büyük bir istek gövdesi okunmadan önce HTTP 413 ile reddedilir), `max-concurrent-requests` (varsayılan 256; bunun ötesindeki istekler hemen HTTP 503 alır) ve `max-open-connections` (eksik veya sıfır bir değer artık sınırsız değil, 1000 anlamına gelir). Buna ek olarak, `eth_getLogs` ve `eth_newFilter` filtre argümanı, 4'ten fazla konu (topic) konumu, tek bir konumda 1000'den fazla alternatif veya 1000'den fazla adres listelediğinde reddedilir. Kendi düğümüne çok büyük toplu veya sözleşme dağıtım istekleri gönderen bir entegratör, en büyük isteğinin gövde sınırına sığdığını kontrol etmeli ve gerekirse sınırı yükseltmelidir.

Genel uç noktalar `eth_`, `net_`, `web3_` ve `txpool_` (yalnızca durum) ad alanlarını (namespace) sunar; v3.2.3 veya sonrasıyla başlatılan bir düğüm varsayılan olarak `eth,net,web3` kullanır ve `txpool`'u dışarıda bırakır (düğümün bekleyen işlemlerini yayınlar), bu yüzden onu yalnızca ihtiyacınız varsa ekleyin. `qor_` ad alanı yayınlanmış hiçbir düğüm derlemesi tarafından sunulmaz; bu yüzden onu eklemeyin ([`qor_` ad alanına](/api-reference/json-rpc-qor_-namespace) bakın).

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
| SVM RPC      | `8899`  | Solana uyumlu okumalar (SVM işlemleri devre dışıdır)   |

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

Düğüm, Prometheus metriklerini **26660** portunda sunabilir (`config.toml` içindeki `[instrumentation]` bölümünde `prometheus = true` ayarlayın):

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

1. **Zincir sürümünü sabitleyin.** Manifestonun önerdiği sürümü çalıştırın (mainnet'te 3.742.566 yüksekliğine kadar **v3.2.3**, sonra v3.2.4), koordineli yükseltmeler için resmi sürümleri takip edin ve sistem saatini NTP ile senkronize tutun.

2. **Yedekli düğümler çalıştırın.** Tek bir yeniden başlatma veya yeniden senkronizasyonun entegrasyon trafiğini kesintiye uğratmaması için bir yük dengeleyicinin (load balancer) arkasında en az iki düğüm işletin.

3. **Genesis ve anlık görüntüleri doğrulayın.** Başlatmadan önce genesis SHA-256 değerini ve tüm anlık görüntü sağlama toplamlarını her zaman resmi sürüme karşı doğrulayın.

4. **Genele açık uç noktaları koruyun.** RPC/EVM/gRPC'nin önüne ters proxy, hız sınırlama ve güvenlik duvarı koyun. Kimlik doğrulaması olmayan yazma RPC'sini asla internete açmayın.

5. **Budamayı ihtiyaca göre seçin.** Tam yatırma/çekme geçmişini mutabakata bağlayan borsalar için `pruning = "nothing"` artı `tx_index = "kv"` kullanın; hafif sorgular için `default` kullanın.

6. **Senkronizasyonu sürekli izleyin.** Blok yüksekliği gecikmesi, sıfır eş ve `catching_up` durumunda takılı kalan düğüm için uyarı kurun.

Yalnızca düğüm olarak yapılan bir dağıtım hiçbir zaman imza atmaz. Entegrasyonunuzun bu düğüm üzerinden yayınladığı işlemler, hibrit kuantum sonrası imzayı zaten taşımalıdır (EVM şeridi için ayrıca göndericinin kayıtlı bir anahtara ve açık bir yetkilendirme penceresine ihtiyacı vardır); bkz. [Borsa Entegrasyonu](/developer-guide/exchange-integration) ve [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing).

Tam bir düğüm çalıştırmadan ağı gözlemlemek için [Light Node dokümantasyonuna](/light-node/overview) bakın.

---

## Sorun Giderme {#troubleshooting}

### Düğüm bir saat hatasıyla duruyor

v3.2.1 düğüm sürümünden itibaren konsensüs motoru, sistem saati ağdan 60 saniyeden fazla saptığında durur. Bir NTP istemcisi (`chrony` veya `systemd-timesyncd`) çalıştırın, saatin `timedatectl status` ile senkronize olduğunu doğrulayın, ardından düğümü yeniden başlatın.

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
* [Kaynaktan Derleme](/developer-guide/building-from-source) — Geliştirme için topluluk `qorechaind` ikili dosyasını derleyin
* [Light Node](/light-node/overview) — Tam düğüm olmadan ağı takip eden hafif istemci
