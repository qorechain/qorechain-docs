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

:::caution Folosiți versiunea indicată de manifest: v3.2.3 pe mainnet
Un nod care se sincronizează de la genesis sau reface starea dintr-un instantaneu trece prin mai multe upgrade-uri de guvernanță (consultați [Upgrade-uri](#upgrades) mai jos), așa că instalați întotdeauna binarul indicat de manifest: acesta conține toate handler-ele de upgrade. Pe **mainnet**, `minCompatible` și `version` din manifest sunt ambele `3.2.3` (upgrade-ul coordonat aplicat la înălțimea 3.662.051 pe 20 octombrie 2026), deci un nod care se alătură acum are nevoie de v3.2.3: un binar mai vechi se oprește la înălțimea de upgrade pe care nu o cunoaște. Pe **testnet**, ambele sunt `3.2.4` (aplicat la înălțimea 8.337.253 pe 19 octombrie 2026). Mainnet-ul rulează v3.2.3 până la înălțimea 3.742.566 și v3.2.4 începând cu acel bloc (propunerea de guvernanță 13), așa că nu rulați un binar de testnet împotriva mainnet-ului și nu instalați v3.2.4 pe un nod de mainnet înainte ca manifestul să o indice (consultați [Upgrade-uri](#upgrades)). Manifestul este promovat deliberat (mai întâi pe testnet, apoi pe mainnet după o perioadă de rodaj), așa că verificați câmpul său `"version"` în raport cu `minCompatible` înainte de a avea încredere în `binary.url`.

Un binar compilat din sursa publică (build-ul comunitar) refuză să pornească pe oricare dintre rețelele publice (v3.2.3 și mai nou): nu poate verifica semnăturile post-cuantice și nu poate reda fidel blocurile rețelelor. Folosiți doar arhiva de release.

Două setări contează începând cu v3.2.1: mențineți ceasul sistemului sincronizat prin NTP (nodul se oprește dacă ceasul său are o abatere de mai mult de 60 de secunde) și setați `evm-chain-id` în `app.toml` (consultați [Limitele nodului](#node-limits)).
:::

---

## Nod vs Validator

| Aspect                | Doar-nod (acest ghid)                           | Validator                                  |
| ---------------------- | ----------------------------------------------- | ------------------------------------------ |
| Cheie de consens       | Niciuna                                          | Cheie de consens ed25519 (trebuie securizată) |
| Producție de blocuri   | Nu                                              | Da — propune și semnează blocuri           |
| Staking / slashing     | Nu se aplică                                    | Auto-delegare, risc de slashing            |
| Scop principal         | Servește RPC/REST/gRPC/EVM (și SVM doar-citire) pentru integrări | Securizează rețeaua (se aplică recompense de staking) |
| Expunere publică       | Endpoint-urile RPC/EVM sunt de obicei expuse    | Validatorul este ascuns în spatele nodurilor sentry |

---

## Rețele țintă

| Rețea    | Chain ID            | Chain ID EVM          | Note                          |
| -------- | ------------------- | ---------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Principală — live din 7 iun 2026; versiunea de nod v3.2.3 (v3.2.4 de la înălțimea 3.742.566) |
| Testnet  | `qorechain-diana`   | `9800`                 | Testați integrările aici mai întâi; versiunea de nod v3.2.4 (din 19 oct 2026) |

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

O implementare doar-nod cu Docker Compose. Nu există o imagine `qorechaind` publicată public de descărcat (nu este publicat nimic sub organizația Docker Hub a proiectului). `Dockerfile`-ul din repository-ul public construiește binarul **community** (fără bibliotecă post-cuantică, keepers de tip stub): este potrivit pentru dezvoltare locală, dar nu poate urmări mainnet-ul sau testnet-ul, iar începând cu v3.2.3 refuză să pornească pe ele. Pentru un nod de rețea, construiți-vă propria imagine din **arhiva de release** indicată în `latest.json`, etichetați-o cu versiunea de release (**v3.2.3** pe mainnet, **v3.2.4** pe testnet), apoi montați un volum persistent pentru datele lanțului:

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

Arhiva conține `qorechaind` și un director `lib/` cu bibliotecile sale partajate (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`); imaginea de mai sus este doar `linux/amd64`, ca și arhiva de release.

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

Inițializați directorul de date o singură dată (de exemplu `docker compose run --rm qorechain-node init my-node --chain-id qorechain-vladi --home /root/.qorechaind`; genesis-ul și configurarea peer-ilor sunt acoperite mai jos), apoi porniți:

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

### 2. Preluați manifestul {#fetch-the-manifest}

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

Folosiți acest fișier ca sursă pentru valorile de binar, genesis și peer din pașii de mai jos — verificați `jq -r .minCompatible latest.json` și rulați cel puțin acea versiune (cea recomandată este `jq -r .version latest.json`).

### 3. Descărcați și verificați genesis-ul

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -

# Cross-verify against the genesis served live by the chain:
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

`qorechaind init <moniker> --chain-id qorechain-vladi` scrie în `app.toml` și chain id-ul EVM al rețelei (consultați [Limitele nodului](#node-limits)); verificați-l pe un director home inițializat cu mult timp în urmă.

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

Alternativ, descărcați instantaneul publicat al datelor lanțului, verificați-i suma de control și extrageți-l peste directorul dumneavoastră de date. Pe mainnet, obiectul `snapshot` din manifest oferă URL-ul, `height` (înălțimea blocului), dimensiunea și SHA-256. **URL-ul instantaneului din manifestul de testnet returnează în prezent `404` (nu este publicat niciun instantaneu de testnet), așa că folosiți state sync acolo.** Citiți `snapshot.height` înainte de a-l folosi pe cel de mainnet: este o singură arhivă de aproximativ 27 GB, iar una veche înseamnă o recuperare lungă. Instantaneul de mainnet publicat în prezent este din 21 august 2026 (înălțimea 1.966.629): este anterior înălțimilor upgrade-urilor v3.1.94, v3.2.0, v3.2.2, v3.2.3 și v3.2.4, așa că un nod restaurat din el redă aproximativ două luni de blocuri cu binarul de versiune indicat de manifest. State sync este aproape întotdeauna alegerea mai bună.

```bash
SNAP_URL=$(jq -r .snapshot.url latest.json)
SNAP_SHA256=$(jq -r .snapshot.sha256 latest.json)
curl -fsSL "$SNAP_URL" -o snapshot.tar.gz
echo "${SNAP_SHA256}  snapshot.tar.gz" | sha256sum -c -

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Câmpurile `snapshot.height` și `snapshot.ts` din manifest arată cât de proaspătă este arhiva, iar state sync (mai sus) este de obicei mai rapid decât o descărcare de 27 GB. Verificați întotdeauna suma de control înainte de a extrage și folosiți o versiune de nod care conține toate handler-ele de upgrade (consultați avertismentul de la începutul acestei pagini) când redați starea dintr-un instantaneu.
:::

---

## Upgrade-uri {#upgrades}

Schimbările de consens sosesc ca **upgrade-uri de guvernanță coordonate**: o propunere adoptată denumește un plan (de exemplu `v3.2.3`) și o înălțime de bloc. Binarul de release conține handler-ele de upgrade; la înălțimea planului fiecare nod trebuie să ruleze acest binar, iar un nod rămas pe binarul anterior **se oprește la acea înălțime** (acesta este comportamentul intenționat al modulului de upgrade). Manifestul vă spune de ce tip este o versiune: `upgradeType` este `height` pentru un upgrade coordonat (cu `upgradeHeight` setat) și `rolling` pentru o versiune locală a nodului, care poate fi înlocuită nod cu nod. Instalați noul binar **înainte** de înălțime; dacă nodul dumneavoastră s-a oprit primul, înlocuiți binarul și reporniți (consultați nota despre rollback din [Depanare](#troubleshooting)).

| Versiune | Mainnet `qorechain-vladi` | Testnet `qorechain-diana` |
| ------- | ------------------------- | ------------------------- |
| v3.1.94 | înălțimea 2.122.074 | neaplicat |
| v3.2.0 | înălțimea 2.981.742 | înălțimea 5.920.000 |
| v3.2.1 | local nodului, fără înălțime | local nodului |
| v3.2.2 | înălțimea 3.556.788 (16 oct 2026) | înălțimea 6.905.034 (2 oct 2026) |
| v3.2.3 | înălțimea 3.662.051 (20 oct 2026, propunerea de guvernanță 11) | înălțimea 8.003.746 (15 oct 2026) |
| v3.2.4 | programată pe mainnet la înălțimea 3.742.566 (propunerea de guvernanță 13) | înălțimea 8.337.253 (19 oct 2026, propunerea de guvernanță 13) |

**Ce face un operator de nod de mainnet pentru v3.2.4 (înălțimea 3.742.566).** Propunerea de guvernanță 13 numește planul `v3.2.4` la înălțimea 3.742.566 și precizează că nodurile rămân pe v3.2.3 până la acea înălțime, se opresc acolo și repornesc pe v3.2.4. Concret:

1. Continuați să rulați **v3.2.3** până când manifestul de mainnet (`https://download.qore.host/mainnet/latest.json`) listează v3.2.4. Cât timp manifestul arată în continuare `version` și `minCompatible` ca `3.2.3` și nicio înălțime de upgrade pentru v3.2.4, nu aveți nimic de instalat: un binar v3.2.4 din directorul de testnet nu este versiunea de mainnet.
2. Când manifestul indică v3.2.4, descărcați arhiva de la `binary.url`, verificați `sha256` (textul propunerii publică și el sha256-ul binarului) și pregătiți-o **înainte** de acea înălțime. Verificați planul în așteptare cu `GET /cosmos/upgrade/v1beta1/current_plan` (`name` și `height`) și înălțimea curentă cu `GET /status` pe RPC.
3. La înălțimea 3.742.566, un nod aflat încă pe v3.2.3 **se oprește** (acesta este comportamentul intenționat al modulului de upgrade, nu o defecțiune); un nod care rulează deja noul binar aplică handler-ul de upgrade și continuă. Dacă al dumneavoastră s-a oprit primul, înlocuiți binarul și reporniți. După upgrade, `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.4` returnează înălțimea în loc de `0`.
4. Un nod care se alătură mainnet-ului după upgrade instalează versiunea pe care manifestul o indică la acel moment (verificați `version` în raport cu `minCompatible`).

Semnarea tranzacțiilor, adresele, zecimalele, memo-urile și taxele nu sunt schimbate de v3.2.4.

Citiți înregistrarea live cu `GET /cosmos/upgrade/v1beta1/applied_plan/<name>` (`0` = neaplicat) și orice plan în așteptare cu `GET /cosmos/upgrade/v1beta1/current_plan`. v3.2.2 a ridicat versiunile dependențelor motorului de consens, Cosmos SDK (v0.53.8) și IBC, iar verificările mai stricte ale tranzacțiilor din SDK fac ca această versiune să înlocuiască binarul anterior la înălțimea de upgrade, nu nod cu nod. Semnarea tranzacțiilor, adresele, zecimalele, memo-urile și taxele nu s-au schimbat în v3.2.2 sau v3.2.3.

**State sync și ceasul.** State sync își preia punctul de încredere din blocul `stateSync` al manifestului (`trustHeight`, `trustHash`, actualizate orar); serverul RPC pe care îl listează este al proiectului, așa că pentru un nod de producție adăugați servere RPC în care aveți încredere și verificați hash-ul de încredere față de o altă sursă. Mențineți ceasul sincronizat prin NTP: nodul se oprește când are o abatere de mai mult de 60 de secunde față de rețea.

---

## Pruning și indexare

Ajustați pruning-ul și indexarea tranzacțiilor în funcție de integrarea dumneavoastră. Exchange-urile care au nevoie de istoricul complet al tranzacțiilor ar trebui să ruleze cu pruning minim și cu un indexator de tranzacții activat.

### Pruning (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Comportament                                | Caz de utilizare                  |
| ----------- | -------------------------------------------- | ---------------------------------- |
| `default`   | Păstrează starea recentă, elimină restul     | Nod RPC, interogări de sold/stare  |
| `nothing`   | Păstrează toată starea istorică              | Nod de arhivă, istoric complet     |
| `custom`    | Valori de reținere/interval definite de operator | Retenție personalizată         |

### Limitele nodului (`app.toml`) {#node-limits}

Începând cu versiunea de nod v3.2.1, `init` scrie o secțiune `[qorechain]` cu trei limite locale ale nodului. Acestea schimbă doar ce păstrează acest nod în memorie și ce include în blocurile pe care le propune, niciodată ce trebuie să conțină un bloc pentru a fi valid:

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

`init` scrie de asemenea chain id-ul EVM al rețelei în setarea `evm-chain-id` din secțiunea `[evm]` a fișierului `app.toml` (`9801` pentru `--chain-id qorechain-vladi`, `9800` pentru `qorechain-diana`). Un nod al cărui `app.toml` conține o altă valoare pornește totuși, dar înregistrează o eroare la pornire, iar propriul său JSON-RPC (`eth_chainId`, semnarea față de acel nod) răspunde cu un chain id greșit până când corectați fișierul; consensul nu este afectat. Binarele mai vechi scriau valoarea de testnet (`9800`) indiferent de `--chain-id`, așa că un nod de mainnet inițializat cu mult timp în urmă ar trebui să-și verifice această setare. Nu setați `QORE_EVM_CHAIN_ID` la o valoare diferită de cea a rețelei: un astfel de nod refuză să pornească.

### Indexarea tranzacțiilor (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Setați `indexer = "kv"` (sau un indexator mai bogat) astfel încât tranzacțiile să poată fi interogate după hash și eveniment — esențial pentru exchange-urile care reconciliază depozite și retrageri. Setați `indexer = "null"` doar dacă nu aveți nevoie de interogări istorice ale tranzacțiilor.

---

## Expunerea endpoint-urilor pentru integrare {#exposing-endpoints-for-integration}

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
api = "eth,net,web3,txpool"
```

**Limite JSON-RPC în versiunea de nod v3.2.4.** Un nod care rulează binarul v3.2.4 (testnet din 19 octombrie 2026; nodurile de mainnet de la înălțimea 3.742.566) își limitează propriul server JSON-RPC. Acestea sunt setări locale ale nodului, în secțiunea `[json-rpc]` din `app.toml`, și nu afectează consensul: `http-body-limit` (implicit 262144 de octeți, 256 KiB; un corp de cerere mai mare este refuzat cu HTTP 413 înainte de a fi citit), `max-concurrent-requests` (implicit 256; cererile peste această limită primesc imediat HTTP 503) și `max-open-connections` (o valoare lipsă sau zero înseamnă acum 1000, nu nelimitat). În plus, argumentul de filtrare al `eth_getLogs` și `eth_newFilter` este refuzat dacă listează mai mult de 4 poziții de topic, mai mult de 1000 de alternative într-o singură poziție sau mai mult de 1000 de adrese. Un integrator care trimite propriului nod cereri foarte mari în lot sau de implementare de contracte ar trebui să verifice că cea mai mare cerere încape în limita corpului și să o mărească dacă este nevoie.

Endpoint-urile publice servesc namespace-urile `eth_`, `net_`, `web3_` și `txpool_` (doar status); un nod inițializat de v3.2.3 sau mai nou folosește implicit `eth,net,web3` și lasă `txpool` deoparte (acesta publică tranzacțiile în așteptare ale nodului), așa că adăugați-l doar dacă aveți nevoie de el. Namespace-ul `qor_` nu este servit de nicio versiune lansată a nodului, așa că nu îl adăugați (consultați [namespace-ul `qor_`](/api-reference/json-rpc-qor_-namespace)).

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
| SVM RPC      | `8899`  | Citiri compatibile Solana (tranzacțiile SVM sunt dezactivate) |

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
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

Câmpul `network` ar trebui să raporteze `qorechain-vladi` (mainnet) sau `qorechain-diana` (testnet).

### Prometheus și Grafana

Nodul poate expune metrici Prometheus pe portul **26660** (setați `prometheus = true` în secțiunea `[instrumentation]` din `config.toml`):

```
http://localhost:26660/metrics
```

Colectați aceste metrici cu orice colector compatibil Prometheus. Dacă rulați stiva de monitorizare din Docker Compose, Grafana este disponibil la `http://localhost:3001` — setați-vă propriile credențiale la prima conectare. Urmăriți întârzierea înălțimii blocului, numărul de peers și utilizarea resurselor; alertați atunci când `catching_up` rămâne `true` sau numărul de peers scade la zero.

### Verificarea endpoint-ului EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Bune practici operaționale

1. **Fixați versiunea de lanț.** Rulați versiunea recomandată de manifest (**v3.2.3** pe mainnet până la înălțimea 3.742.566, apoi v3.2.4), urmăriți versiunile oficiale pentru upgrade-uri coordonate și mențineți ceasul sistemului sincronizat prin NTP.

2. **Rulați noduri redundante.** Operați cel puțin două noduri în spatele unui load balancer, astfel încât o singură repornire sau resincronizare să nu întrerupă traficul de integrare.

3. **Verificați genesis-ul și instantaneele.** Validați întotdeauna suma de control SHA-256 a genesis-ului și orice sumă de control a instantaneelor față de versiunea oficială înainte de pornire.

4. **Protejați endpoint-urile publice.** Puneți RPC/EVM/gRPC în spatele unui reverse proxy, cu limitare de rată și firewall. Nu expuneți niciodată RPC de scriere neautentificat pe internet.

5. **Potriviți pruning-ul cu nevoia.** Folosiți `pruning = "nothing"` plus `tx_index = "kv"` pentru exchange-urile care reconciliază istoricul complet de depozite/retrageri; folosiți `default` pentru interogări ușoare.

6. **Monitorizați sincronizarea continuu.** Alertați la întârzierea înălțimii blocului, zero peers și un nod blocat în `catching_up`.

O implementare doar-nod nu semnează niciodată. Tranzacțiile pe care integrarea dumneavoastră le difuzează prin ea trebuie să poarte deja semnătura hibridă post-cuantică (iar, pentru lane-ul EVM, expeditorul are nevoie de o cheie înregistrată și de o fereastră de autorizare deschisă); consultați [Integrarea cu exchange-uri](/developer-guide/exchange-integration) și [Semnarea post-cuantică](/developer-guide/post-quantum-signing).

Pentru a observa rețeaua fără a rula un nod complet, consultați [documentația Light Node](/light-node/overview).

---

## Depanare (Troubleshooting) {#troubleshooting}

### Nodul se oprește cu o eroare de ceas

Începând cu versiunea de nod v3.2.1, motorul de consens se oprește când ceasul sistemului are o abatere de mai mult de 60 de secunde față de rețea. Rulați un client NTP (`chrony` sau `systemd-timesyncd`), confirmați că ceasul este sincronizat cu `timedatectl status`, apoi reporniți nodul.

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
* [Compilarea din sursă](/developer-guide/building-from-source) — Compilați binarul community `qorechaind` pentru dezvoltare
* [Light Node](/light-node/overview) — Client ușor care urmărește rețeaua fără un nod complet
