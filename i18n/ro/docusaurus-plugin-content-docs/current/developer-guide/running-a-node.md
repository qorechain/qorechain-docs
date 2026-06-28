---
slug: /developer-guide/running-a-node
title: Rularea unui nod
sidebar_label: Rularea unui nod
sidebar_position: 10
---

# Rularea unui nod

Acest ghid acoperă rularea unei implementări QoreChain **doar de tip nod** — un nod complet sau RPC care sincronizează lanțul și expune endpoint-uri pentru integrare, **fără** sarcini de validator. Vizează bursele (CEX), backend-urile de portofele, indexatorii și integratorii care au nevoie de acces fiabil de citire/scriere la rețea, dar nu semnează blocuri.

:::note
Pentru producția de blocuri, staking, slashing și clasificarea grupurilor, vedeți în schimb [Rularea unui validator](/developer-guide/running-a-validator). O implementare doar de tip nod nu deține niciodată o cheie de consens de validator și nu apare niciodată în setul activ.
:::

:::warning
Nodurile seed de mainnet, peer-ii persistenți, URL-ul/suma de control a genesis-ului și endpoint-urile RPC pentru snapshot/state-sync sunt publicate cu fiecare lansare oficială de mainnet. **Obțineți aceste valori curente din depozitul/lansarea oficială de mainnet** și verificați suma de control a genesis-ului înainte de pornire. Substituenții de mai jos (`<MAINNET_SEED_NODE_ID>@<host>:26656`, `<MAINNET_GENESIS_URL>`, URL-urile snapshot/state-sync) trebuie înlocuiți cu valorile reale publicate.
:::

---

## Nod versus validator

| Aspect              | Doar nod (acest ghid)                           | Validator                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Cheie de consens    | Niciuna                                          | Cheie de consens ed25519 (trebuie securizată) |
| Producție de blocuri | Nu                                             | Da — propune și semnează blocuri           |
| Staking / slashing  | Nu se aplică                                     | Auto-delegare, risc de slashing            |
| Scop principal      | Servește RPC/REST/gRPC/EVM/SVM către integrări  | Securizează rețeaua, câștigă recompense    |
| Expunere publică    | Endpoint-urile RPC/EVM de obicei expuse         | Validator ascuns în spatele nodurilor sentry |

---

## Rețele țintă

| Rețea    | Chain ID            | EVM chain ID         | Note                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Principală — activă din 7 iun. 2026 |
| Testnet  | `qorechain-diana`   | `9800`               | Repetați mai întâi integrările aici |

Substituiți `--chain-id` corespunzător pentru rețeaua dvs. țintă pe parcursul acestui ghid. Exemplele folosesc implicit mainnet.

---

## Hardware recomandat

| Profil                   | CPU      | RAM   | Disc (NVMe SSD)         | Rețea     |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| Nod RPC cu pruning       | 4 nuclee | 16 GB | 500 GB+                 | 100 Mbps+ |
| Nod complet/arhivă       | 8 nuclee | 32 GB | 2 TB+ (crește în timp)  | 1 Gbps    |
| Integrare bursă          | 8 nuclee | 32 GB | 2 TB+ cu rezervă        | 1 Gbps    |

NVMe SSD este puternic recomandat — starea lanțului și stocările EVM/SVM sunt intensive în I/O. Nodurile de arhivă (fără pruning, indexare completă a tranzacțiilor) cresc continuu; alocați disc cu rezervă și monitorizare.

---

## Implementare

### Docker Compose

O implementare doar de tip nod cu Docker Compose. Fixați eticheta imaginii la versiunea de lanț activă (**v3.1.80** pe mainnet) și montați un volum persistent pentru datele lanțului.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.80
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

## Conectarea la rețea

### 1. Inițializare

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

### 2. Descărcați și verificați genesis-ul

```bash
curl -o ~/.qorechaind/config/genesis.json <MAINNET_GENESIS_URL>
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

:::note
`<MAINNET_GENESIS_URL>` și `<MAINNET_GENESIS_SHA256>` sunt substituenți — obțineți URL-ul și suma de control curentă a genesis-ului din lansarea/depozitul oficial de mainnet și verificați suma de control înainte de pornire.
:::

### 3. Configurați seed-urile și peer-ii

Deschideți `~/.qorechaind/config/config.toml`:

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
Valorile pentru seed și peer sunt substituenți. Obțineți seed-urile curente de mainnet și peer-ii persistenți din depozitul/lansarea oficială de mainnet.
:::

### 4. Începeți sincronizarea

```bash
qorechaind start
```

---

## Bootstrap rapid

Sincronizarea de la genesis poate dura mult timp. Pentru integrări, folosiți **state sync** sau un **snapshot** pentru o pornire la rece rapidă.

### State sync

State sync preia un snapshot recent al stării aplicației de la servere RPC de încredere în loc să reia fiecare bloc. Configurați secțiunea `[statesync]` din `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "<STATESYNC_RPC_1>,<STATESYNC_RPC_2>"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Determinați o înălțime și un hash recente de încredere de la un endpoint RPC sănătos:

```bash
curl -s <STATESYNC_RPC_1>/block | jq '.result.block.header.height, .result.block_id.hash'
```

:::note
`<STATESYNC_RPC_1>`, `<STATESYNC_RPC_2>`, `<TRUSTED_BLOCK_HEIGHT>` și `<TRUSTED_BLOCK_HASH>` sunt substituenți. Folosiți serverele RPC state-sync publicate în lansarea oficială de mainnet și derivați înălțimea/hash-ul de încredere dintr-un bloc recent.
:::

### Restaurare din snapshot

Alternativ, descărcați un snapshot recent de date ale lanțului și extrageți-l peste directorul dvs. de date:

```bash
curl -o snapshot.tar.lz4 <MAINNET_SNAPSHOT_URL>
lz4 -dc snapshot.tar.lz4 | tar -xf - -C ~/.qorechaind/
qorechaind start
```

:::note
`<MAINNET_SNAPSHOT_URL>` este un substituent. Obțineți URL-urile de snapshot (și orice sumă de control aferentă) din lansarea/depozitul oficial de mainnet și verificați suma de control înainte de extragere.
:::

---

## Pruning și indexare

Reglați pruning-ul și indexarea tranzacțiilor pentru a se potrivi integrării dvs. Bursele care au nevoie de istoric complet al tranzacțiilor ar trebui să ruleze cu pruning minim și cu un indexator de tranzacții activat.

### Pruning (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Comportament                             | Caz de utilizare                  |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | Păstrează starea recentă, elimină restul | Nod RPC, căutări de sold/stare    |
| `nothing`   | Păstrează toată starea istorică          | Nod de arhivă, istoric complet    |
| `custom`    | Valori de păstrare/interval definite de operator | Retenție reglată           |

### Indexarea tranzacțiilor (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Setați `indexer = "kv"` (sau un indexator mai bogat) astfel încât tranzacțiile să poată fi interogate după hash și eveniment — esențial pentru bursele care reconciliază depozite și retrageri. Setați `indexer = "null"` doar dacă nu aveți nevoie de interogări istorice de tranzacții.

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

| Endpoint     | Port   | Folosit pentru                                         |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | Difuzarea tranzacțiilor, interogarea blocurilor/stării |
| REST         | `1317`  | Interogări HTTP ale stării lanțului                    |
| gRPC         | `9090`  | Acces programatic cu debit ridicat                     |
| EVM JSON-RPC | `8545`  | Integrări compatibile Ethereum (chain ID `9801`)       |
| EVM WS       | `8546`  | Abonamente la evenimente EVM                           |
| SVM RPC      | `8899`  | Integrări compatibile Solana                           |

:::warning
Nu expuneți niciodată RPC, EVM JSON-RPC sau gRPC direct către internetul public fără un reverse proxy, limitare de rată, autentificare și un firewall. Legați la `0.0.0.0` numai în spatele unui strat de ingress controlat.
:::

---

## Monitorizarea sănătății și a sincronizării

### Starea sincronizării

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — încă se sincronizează.
* `false` — complet sincronizat și servind starea curentă.

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

Colectați-le cu orice colector compatibil Prometheus. Dacă rulați stiva de monitorizare Docker Compose, Grafana este disponibilă la `http://localhost:3001` — setați-vă propriile credențiale la prima autentificare. Urmăriți întârzierea înălțimii blocului, numărul de peer-i și utilizarea resurselor; alertați când `catching_up` rămâne `true` sau când numărul de peer-i scade la zero.

### Verificarea endpoint-ului EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Bune practici operaționale

1. **Fixați versiunea lanțului.** Rulați eticheta activă (**v3.1.80** pe mainnet) și urmăriți lansările oficiale pentru actualizări coordonate.

2. **Rulați noduri redundante.** Operați cel puțin două noduri în spatele unui load balancer, astfel încât o singură repornire sau resincronizare să nu întrerupă traficul de integrare.

3. **Verificați genesis-ul și snapshot-urile.** Validați întotdeauna SHA-256-ul genesis-ului și orice sumă de control a snapshot-ului față de lansarea oficială înainte de pornire.

4. **Protejați endpoint-urile publice.** Plasați RPC/EVM/gRPC în spatele unui reverse proxy, limitări de rată și a unui firewall. Nu expuneți niciodată RPC de scriere neautentificat către internet.

5. **Potriviți pruning-ul cu nevoia.** Folosiți `pruning = "nothing"` plus `tx_index = "kv"` pentru bursele care reconciliază istoricul complet de depozite/retrageri; folosiți `default` pentru căutări ușoare.

6. **Monitorizați sincronizarea continuu.** Alertați la întârzierea înălțimii blocului, la zero peer-i și la un nod blocat în `catching_up`.

Pentru acces de citire ultra-ușor fără a rula un nod complet, vedeți documentația **Nod ușor (Light Node)**.

---

## Pașii următori

* [Conectarea la mainnet](/getting-started/connecting-to-mainnet) — Genesis-ul de mainnet, peer-i și detalii de conectare
* [Rularea unui validator](/developer-guide/running-a-validator) — Adăugați sarcini de producție de blocuri
* [Construire din sursă](/developer-guide/building-from-source) — Construiți binarul `qorechaind`
* **Nod ușor (Light Node)** — Acces ultra-ușor doar pentru citire (documentație în curând)
