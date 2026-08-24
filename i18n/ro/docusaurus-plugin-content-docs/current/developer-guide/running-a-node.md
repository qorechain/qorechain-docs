---
slug: /developer-guide/running-a-node
title: Rularea unui nod
sidebar_label: Rularea unui nod
sidebar_position: 10
---

# Rularea unui nod

Acest ghid acoperă rularea unei implementări QoreChain **doar-nod** — un nod complet sau RPC care sincronizează lanțul și expune endpoint-uri pentru integrare, **fără** atribuții de validator. Se adresează exchange-urilor (CEX), backend-urilor de portofel, indexatorilor și integratorilor care au nevoie de acces fiabil de citire/scriere la rețea, dar nu semnează blocuri.

:::note
Pentru producția de blocuri, staking, slashing și clasificarea pool-urilor, consultați [Rularea unui Validator](/developer-guide/running-a-validator). O implementare doar-nod nu deține niciodată o cheie de consens de validator și nu apare niciodată în setul activ.
:::

:::warning
Binarele, genesis-ul și instantaneele (snapshots) sunt publicate la [download.qore.host](https://download.qore.host) cu sume de control SHA-256. **Verificați întotdeauna sumele de control înainte de a instala sau extrage**, și verificați depozitele doar în raport cu propriul nod sincronizat.
:::

:::note Sursa de adevăr: manifestul live
Binarul curent, genesis-ul, peers, seeds și un punct de încredere pentru state-sync sunt publicate ca manifest JSON, actualizat live — nu codificați rigid o versiune de binar, o sumă de control sau un nume de fișier de instantaneu în scripturile de instalare, deoarece devin învechite imediat ce apare o versiune nouă:

- Mainnet: `https://download.qore.host/mainnet/latest.json`
- Testnet: `https://download.qore.host/testnet/latest.json`

Câmpurile manifestului includ `binary` (url + sha256), `genesis` (url + sha256 + sizeBytes), `peers`, `seeds`, `p2pPort`, `stateSync` (un punct de încredere actualizat orar) și `minCompatible`. Pașii de instalare și conectare de mai jos preiau acest manifest și folosesc valorile lui curente.
:::

:::caution v3.1.92 sau mai nou necesar pentru un nod care se alătură de la zero
Un nod care se sincronizează de la genesis sau reface starea dintr-o arhivă/instantaneu trebuie să ruleze **v3.1.92 sau mai nou** — versiunile mai vechi (chiar dacă câmpul `minCompatible` al manifestului nu a fost încă actualizat pentru a reflecta acest lucru) se vor opri la primul bloc care conține o tranzacție în timpul redării, din cauza unui bug de măsurare a gazului acum remediat. Rulați întotdeauna binarul curent din manifestul de mai sus.
:::

---

## Nod vs Validator

| Aspect                | Doar-nod (acest ghid)                           | Validator                                  |
| ---------------------- | ----------------------------------------------- | ------------------------------------------ |
| Cheie de consens       | Niciuna                                          | Cheie de consens ed25519 (trebuie securizată) |
| Producție de blocuri   | Nu                                              | Da — propune și semnează blocuri           |
| Staking / slashing     | Nu se aplică                                    | Auto-delegare, risc de slashing            |
| Scop principal         | Servește RPC/REST/gRPC/EVM/SVM pentru integrări | Securizează rețeaua, câștigă recompense    |
| Expunere publică       | Endpoint-urile RPC/EVM sunt de obicei expuse    | Validatorul este ascuns în spatele nodurilor sentry |

---

## Rețele țintă

| Rețea    | Chain ID            | Chain ID EVM          | Note                          |
| -------- | ------------------- | ---------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Principală — live din 7 iunie 2026 |
| Testnet  | `qorechain-diana`   | `9800`                 | Testați integrările aici mai întâi |

Înlocuiți `--chain-id`-ul corespunzător pentru rețeaua țintă pe parcursul acestui ghid. Exemplele folosesc implicit mainnet.

---

## Hardware recomandat

| Profil                    | CPU      | RAM   | Disc (NVMe SSD)          | Rețea     |
| -------------------------- | -------- | ----- | ------------------------- | --------- |
| Nod RPC cu pruning         | 4 nuclee | 16 GB | 500 GB+                   | 100 Mbps+ |
| Nod complet/arhivă         | 8 nuclee | 32 GB | 2 TB+ (crește în timp)    | 1 Gbps    |
| Integrare de exchange      | 8 nuclee | 32 GB | 2 TB+ cu marjă suplimentară | 1 Gbps  |

Un SSD NVMe este puternic recomandat — starea lanțului și magaziile EVM/SVM sunt intensive din punct de vedere I/O. Nodurile de arhivă (fără pruning, indexare completă a tranzacțiilor) cresc continuu; alocați spațiu pe disc cu marjă și monitorizare.

---

## Implementare (Deployment)

### Docker Compose

O implementare doar-nod cu Docker Compose. Fixați tag-ul imaginii la versiunea de lanț curentă (**v3.1.92** pe mainnet) și montați un volum persistent pentru datele lanțului.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.92
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

Pentru o instalare pe metal fizic (bare-metal), rulați `qorechaind` sub systemd:

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

### 2. Preluați manifestul

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

Folosiți acest fișier ca sursă pentru valorile de binar, genesis și peer din pașii de mai jos — verificați `jq -r .minCompatible latest.json`, dar rețineți că **pragul v3.1.92** de mai sus rămâne valabil chiar dacă acel câmp este în urmă.

### 3. Descărcați și verificați genesis-ul

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -

# Verificați încrucișat față de genesis-ul servit live de lanț:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 4. Configurați peers și pragul de taxă

Citiți peers și seeds curenți din manifest, în loc să codificați rigid ID-uri de noduri și hosturi — acestea se rotesc:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Deschideți `~/.qorechaind/config/config.toml` și setați `persistent_peers` (și `seeds`) la aceste valori:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Apoi setați prețul minim al gazului în `~/.qorechaind/config/app.toml` (pragul de taxă al rețelei: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### 5. Porniți sincronizarea

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## Pornire rapidă (Fast Bootstrap)

Sincronizarea de la genesis poate dura mult timp. Pentru integrări, folosiți **state sync** sau un **instantaneu (snapshot)** pentru o pornire rapidă la rece.

### State sync

State sync preia un instantaneu recent al stării aplicației de la servere RPC de încredere, în loc să redea fiecare bloc. Configurați secțiunea `[statesync]` din `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Preluați `trust_height` / `trust_hash` din câmpul `stateSync` al manifestului — este actualizat orar, deci este sursa preferată:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Ca alternativă/rezervă, puteți deriva singuri o înălțime și un hash de încredere din RPC-ul public:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### Restaurare din instantaneu (snapshot)

Alternativ, descărcați instantaneul publicat al datelor lanțului, verificați-i suma de control și extrageți-l peste directorul dumneavoastră de date. Manifestul nu conține în prezent un pointer către instantaneu, așa că verificați listarea live de la [download.qore.host](https://download.qore.host) pentru numele de fișier și suma de control curente, în loc să le codificați rigid:

```bash
# Înlocuiți numele de fișier și suma de control curente din listarea download.qore.host
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # comparați cu suma de control publicată alături de el

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Instantaneele sunt publicate sub **nume de fișiere marcate cu înălțimea blocului**, care se schimbă regulat — verificați [download.qore.host](https://download.qore.host) pentru cel mai recent instantaneu și suma sa de control SHA-256 și verificați întotdeauna înainte de a extrage. Rețineți că **minimul v3.1.92** de mai sus se aplică și redării dintr-un instantaneu.
:::

---

## Pruning și indexare

Ajustați pruning-ul și indexarea tranzacțiilor în funcție de integrarea dumneavoastră. Exchange-urile care au nevoie de istoricul complet al tranzacțiilor ar trebui să ruleze cu pruning minim și cu un indexator de tranzacții activat.

### Pruning (`app.toml`)

```toml
# Păstrează doar starea recentă — cea mai mică amprentă pe disc
pruning = "default"

# Păstrează totul — necesar pentru interogări de arhivă / istoric complet
# pruning = "nothing"
```

| `pruning`   | Comportament                                | Caz de utilizare                  |
| ----------- | -------------------------------------------- | ---------------------------------- |
| `default`   | Păstrează starea recentă, elimină restul     | Nod RPC, interogări de sold/stare  |
| `nothing`   | Păstrează toată starea istorică              | Nod de arhivă, istoric complet     |
| `custom`    | Valori de reținere/interval definite de operator | Retenție personalizată         |

### Indexarea tranzacțiilor (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Setați `indexer = "kv"` (sau un indexator mai bogat) astfel încât tranzacțiile să poată fi interogate după hash și eveniment — esențial pentru exchange-urile care reconciliază depozite și retrageri. Setați `indexer = "null"` doar dacă nu aveți nevoie de interogări istorice ale tranzacțiilor.

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

Și listenerul RPC în `config.toml`:

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| Endpoint     | Port    | Utilizare                                                |
| ------------ | ------- | ---------------------------------------------------------|
| RPC          | `26657` | Difuzarea tranzacțiilor, interogarea blocurilor/statusului |
| REST         | `1317`  | Interogări HTTP ale stării lanțului                       |
| gRPC         | `9090`  | Acces programatic de mare debit (high-throughput)          |
| EVM JSON-RPC | `8545`  | Integrări compatibile Ethereum (chain ID `9801`)           |
| EVM WS       | `8546`  | Abonamente la evenimente EVM                               |
| SVM RPC      | `8899`  | Integrări compatibile Solana                                |

:::warning
Nu expuneți niciodată RPC, EVM JSON-RPC sau gRPC direct pe internetul public fără un reverse proxy, limitare de rată (rate limiting), autentificare și un firewall. Legați (bind) la `0.0.0.0` doar în spatele unui strat de ingress controlat.
:::

---

## Monitorizarea sănătății și sincronizării

### Statusul sincronizării

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — încă se sincronizează.
* `false` — complet sincronizat și servește starea curentă.

```bash
# Cea mai recentă înălțime și rețeaua
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

Câmpul `network` ar trebui să raporteze `qorechain-vladi` (mainnet) sau `qorechain-diana` (testnet).

### Prometheus și Grafana

QoreChain expune metrici Prometheus pe portul **26660**:

```
http://localhost:26660/metrics
```

Colectați aceste metrici cu orice colector compatibil Prometheus. Dacă rulați stiva de monitorizare din Docker Compose, Grafana este disponibil la `http://localhost:3001` — setați-vă propriile credențiale la prima conectare. Urmăriți întârzierea înălțimii blocului, numărul de peers și utilizarea resurselor; alertați atunci când `catching_up` rămâne `true` sau numărul de peers scade la zero.

### Verificarea endpoint-ului EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Se așteaptă "0x2649" (9801) pe mainnet
```

---

## Bune practici operaționale

1. **Fixați versiunea de lanț.** Rulați tag-ul live (**v3.1.92** pe mainnet) și urmăriți versiunile oficiale pentru upgrade-uri coordonate.

2. **Rulați noduri redundante.** Operați cel puțin două noduri în spatele unui load balancer, astfel încât o singură repornire sau resincronizare să nu întrerupă traficul de integrare.

3. **Verificați genesis-ul și instantaneele.** Validați întotdeauna suma de control SHA-256 a genesis-ului și orice sumă de control a instantaneelor față de versiunea oficială înainte de pornire.

4. **Protejați endpoint-urile publice.** Puneți RPC/EVM/gRPC în spatele unui reverse proxy, cu limitare de rată și firewall. Nu expuneți niciodată RPC de scriere neautentificat pe internet.

5. **Potriviți pruning-ul cu nevoia.** Folosiți `pruning = "nothing"` plus `tx_index = "kv"` pentru exchange-urile care reconciliază istoricul complet de depozite/retrageri; folosiți `default` pentru interogări ușoare.

6. **Monitorizați sincronizarea continuu.** Alertați la întârzierea înălțimii blocului, zero peers și un nod blocat în `catching_up`.

Pentru acces de citire ultra-ușor fără a rula un nod complet, consultați documentația **Light Node**.

---

## Depanare (Troubleshooting)

### Un nod oprit înainte de upgrade nu își reia funcționarea după înlocuirea binarului

Dacă nodul dumneavoastră era deja oprit sau blocat **înainte** de a-i actualiza binarul, simpla introducere a noului binar și repornirea nu este suficientă — nodul are rezultate ABCI învechite, memorate din rularea veche, și nu va re-executa blocul care a cauzat oprirea. Faceți rollback explicit înainte de a reporni:

```bash
qorechaind rollback --home <HOME>
systemctl restart <unit>
```

Comanda este `qorechaind rollback` (o subcomandă de nivel superior) — nu există o subcomandă `comet rollback` și nici un flag `--hard` pentru ea.

### Restaurarea din instantaneu intră în buclă de eșec (crash-loop) din cauza lipsei `priv_validator_state.json`

O arhivă/instantaneu publicat(ă) **nu** include `data/priv_validator_state.json`, iar nodul refuză să pornească fără el. Dacă lipsește după o restaurare din instantaneu, creați-l — dar **doar dacă nu există deja unul**. Nu suprascrieți niciodată unul real: pe un validator, acest fișier este garda anti-dublă-semnare, iar suprascrierea lui riscă o dublă semnare.

```bash
echo '{"height":"0","round":0,"step":0}' > <HOME>/data/priv_validator_state.json
```

---

## Pași următori

* [Conectarea la Mainnet](/getting-started/connecting-to-mainnet) — Genesis-ul, peers și detaliile de conectare pentru mainnet
* [Rularea unui Validator](/developer-guide/running-a-validator) — Adăugați atribuții de producție a blocurilor
* [Compilarea din sursă](/developer-guide/building-from-source) — Compilați binarul `qorechaind`
* **Light Node** — Acces ultra-ușor doar-citire (documentație în curând)
