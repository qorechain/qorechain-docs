---
slug: /developer-guide/running-a-node
title: Rularea unui nod
sidebar_label: Rularea unui nod
sidebar_position: 10
---

# Rularea unui nod

Acest ghid acoperă rularea unei implementări QoreChain **doar-nod** — un nod complet sau RPC care sincronizează lanțul și expune endpoint-uri pentru integrare, **fără** atribuții de validator. Se adresează exchange-urilor (CEX), backend-urilor de portofele, indexerelor și integratorilor care au nevoie de acces fiabil de citire/scriere la rețea, dar nu semnează blocuri.

:::note
Pentru producerea de blocuri, staking, slashing și clasificarea pool-urilor, consultați în schimb [Rularea unui validator](/developer-guide/running-a-validator). O implementare doar-nod nu deține niciodată o cheie de consens de validator și nu apare niciodată în setul activ.
:::

:::warning
Binarele, genesis-ul și snapshot-urile sunt publicate la [download.qore.host](https://download.qore.host) cu sume de control SHA-256. **Verificați întotdeauna sumele de control înainte de instalare sau extragere** și verificați depunerile doar pe propriul nod sincronizat.
:::

---

## Nod vs Validator

| Aspect              | Doar-nod (acest ghid)                           | Validator                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Cheie de consens    | Niciuna                                         | cheie de consens ed25519 (trebuie securizată) |
| Producere de blocuri | Nu                                             | Da — propune și semnează blocuri           |
| Staking / slashing  | Nu se aplică                                    | Auto-delegare, risc de slashing            |
| Scop principal      | Servește RPC/REST/gRPC/EVM/SVM integrărilor     | Securizează rețeaua, câștigă recompense    |
| Expunere publică    | Endpoint-urile RPC/EVM sunt de regulă expuse    | Validatorul e ascuns în spatele nodurilor sentry |

---

## Rețele țintă

| Rețea    | Chain ID            | EVM chain ID         | Note                           |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Principală — live din 7 iun. 2026 |
| Testnet  | `qorechain-diana`   | `9800`               | Exersați integrările aici mai întâi |

Înlocuiți `--chain-id` cu valoarea potrivită pentru rețeaua dvs. țintă pe parcursul acestui ghid. Exemplele folosesc implicit mainnet.

---

## Hardware recomandat

| Profil                   | CPU      | RAM   | Disc (SSD NVMe)         | Rețea     |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| Nod RPC cu pruning       | 4 nuclee | 16 GB | 500 GB+                 | 100 Mbps+ |
| Nod complet/arhivă       | 8 nuclee | 32 GB | 2 TB+ (crește în timp)  | 1 Gbps    |
| Integrare exchange       | 8 nuclee | 32 GB | 2 TB+ cu rezervă        | 1 Gbps    |

SSD-ul NVMe este puternic recomandat — starea lanțului și store-urile EVM/SVM sunt intensive la I/O. Nodurile de arhivă (fără pruning, indexare completă a tranzacțiilor) cresc continuu; provizionați discul cu rezervă și monitorizare.

---

## Implementare

### Docker Compose

O implementare doar-nod cu Docker Compose. Fixați tag-ul imaginii la versiunea live a lanțului (**v3.1.82** pe mainnet) și montați un volum persistent pentru datele lanțului.

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

Inițializați directorul de date o singură dată (genesis-ul și configurarea peer-ilor sunt acoperite mai jos), apoi porniți:

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

Pentru o instalare bare-metal, rulați `qorechaind` sub systemd:

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

## Alăturarea la rețea

### 1. Inițializare

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

### 2. Descărcați și verificați genesis-ul

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 3. Configurați peer-ii și pragul minim de comision

Deschideți `~/.qorechaind/config/config.toml` și setați peer-ii sentry publici de mainnet:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

Apoi setați prețul minim al gazului în `~/.qorechaind/config/app.toml` (pragul de comision al rețelei: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### 4. Porniți sincronizarea

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## Bootstrap rapid

Sincronizarea de la genesis poate dura mult timp. Pentru integrări, folosiți **state sync** sau un **snapshot** pentru o pornire la rece rapidă.

### State sync

State sync preia un snapshot recent al stării aplicației de la servere RPC de încredere, în loc să reia fiecare bloc. Configurați secțiunea `[statesync]` din `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Determinați o înălțime și un hash de încredere recente de pe RPC-ul public:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### Restaurare din snapshot

Alternativ, descărcați snapshot-ul publicat cu datele lanțului, verificați suma sa de control și extrageți-l peste directorul de date:

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Snapshot-urile sunt publicate sub **nume de fișiere marcate cu înălțimea blocului** — verificați [download.qore.host](https://download.qore.host) pentru cel mai recent snapshot și suma sa de control SHA-256 și verificați întotdeauna înainte de extragere.
:::

---

## Pruning și indexare

Reglați pruning-ul și indexarea tranzacțiilor pentru a se potrivi integrării dvs. Exchange-urile care au nevoie de istoricul complet al tranzacțiilor ar trebui să ruleze cu pruning minim și cu un indexer de tranzacții activat.

### Pruning (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Comportament                             | Caz de utilizare                  |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | Păstrează starea recentă, elimină restul | Nod RPC, interogări de solduri/stare |
| `nothing`   | Păstrează întreaga stare istorică        | Nod de arhivă, istoric complet    |
| `custom`    | Valori keep/interval definite de operator | Retenție reglată                  |

### Indexarea tranzacțiilor (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Setați `indexer = "kv"` (sau un indexer mai bogat) astfel încât tranzacțiile să poată fi interogate după hash și eveniment — esențial pentru exchange-urile care reconciliază depuneri și retrageri. Setați `indexer = "null"` doar dacă nu aveți nevoie de interogări istorice de tranzacții.

---

## Expunerea endpoint-urilor pentru integrare

Activați și legați serverele API de care au nevoie integratorii în `app.toml`:

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

Și listener-ul RPC în `config.toml`:

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| Endpoint     | Port   | Utilizat pentru                                        |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | Difuzarea tranzacțiilor, interogarea blocurilor/stării |
| REST         | `1317`  | Interogări HTTP ale stării lanțului                    |
| gRPC         | `9090`  | Acces programatic de mare debit                        |
| EVM JSON-RPC | `8545`  | Integrări compatibile Ethereum (chain ID `9801`)       |
| EVM WS       | `8546`  | Abonamente la evenimente EVM                           |
| SVM RPC      | `8899`  | Integrări compatibile Solana                           |

:::warning
Nu expuneți niciodată RPC, EVM JSON-RPC sau gRPC direct pe internetul public fără un reverse proxy, limitare de rată, autentificare și un firewall. Legați la `0.0.0.0` doar în spatele unui strat de ingress controlat.
:::

---

## Monitorizarea sănătății și a sincronizării

### Starea sincronizării

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — încă se sincronizează.
* `false` — complet sincronizat și servește starea curentă.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

Câmpul `network` ar trebui să raporteze `qorechain-vladi` (mainnet) sau `qorechain-diana` (testnet).

### Prometheus și Grafana

QoreChain expune metrici Prometheus pe portul **26660**:

```
http://localhost:26660/metrics
```

Colectați aceste metrici cu orice colector compatibil Prometheus. Dacă rulați stiva de monitorizare Docker Compose, Grafana este disponibilă la `http://localhost:3001` — setați propriile credențiale la prima autentificare. Urmăriți întârzierea înălțimii blocurilor, numărul de peer-i și utilizarea resurselor; alertați când `catching_up` rămâne `true` sau numărul de peer-i scade la zero.

### Verificarea endpoint-ului EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Bune practici operaționale

1. **Fixați versiunea lanțului.** Rulați tag-ul live (**v3.1.82** pe mainnet) și urmăriți release-urile oficiale pentru upgrade-uri coordonate.

2. **Rulați noduri redundante.** Operați cel puțin două noduri în spatele unui load balancer, astfel încât o singură repornire sau resincronizare să nu întrerupă traficul de integrare.

3. **Verificați genesis-ul și snapshot-urile.** Validați întotdeauna SHA-256 al genesis-ului și orice sumă de control de snapshot față de release-ul oficial înainte de pornire.

4. **Protejați endpoint-urile publice.** Puneți RPC/EVM/gRPC în spatele unui reverse proxy, cu limitare de rată și firewall. Nu expuneți niciodată RPC de scriere neautentificat pe internet.

5. **Potriviți pruning-ul cu nevoile.** Folosiți `pruning = "nothing"` plus `tx_index = "kv"` pentru exchange-urile care reconciliază istoricul complet de depuneri/retrageri; folosiți `default` pentru interogări ușoare.

6. **Monitorizați sincronizarea continuu.** Alertați la întârzieri ale înălțimii blocurilor, la zero peer-i și la un nod blocat în `catching_up`.

Pentru acces de citire ultra-ușor fără a rula un nod complet, consultați documentația **Light Node**.

---

## Pași următori

* [Conectarea la Mainnet](/getting-started/connecting-to-mainnet) — Genesis-ul de mainnet, peer-ii și detaliile de conectare
* [Rularea unui validator](/developer-guide/running-a-validator) — Adăugați atribuții de producere a blocurilor
* [Compilarea din sursă](/developer-guide/building-from-source) — Compilați binarul `qorechaind`
* **Light Node** — Acces read-only ultra-ușor (documentație în curând)
