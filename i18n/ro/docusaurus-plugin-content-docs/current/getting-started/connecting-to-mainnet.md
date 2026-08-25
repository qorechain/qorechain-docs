---
slug: /getting-started/connecting-to-mainnet
title: Conectarea la Mainnet
sidebar_label: Conectarea la Mainnet
sidebar_position: 3
---

# Conectarea la Mainnet

Alătură-te mainnet-ului live QoreChain Vladi configurându-ți nodul cu fișierul genesis oficial, peers și setările de rețea.

:::note
Această pagină acoperă mainnet-ul **`qorechain-vladi`** (EVM chain ID **9801**, hex `0x2649`), live din **7 iunie 2026 23:59 UTC**, rulând versiunea de chain **v3.1.92** pe Cosmos SDK v0.53. Pentru testnet-ul **`qorechain-diana`** (EVM chain ID **9800**), vezi [Conectarea la Testnet](/getting-started/connecting-to-testnet) și repetă configurarea acolo înainte de a trece live.
:::

## Endpoint-uri publice

Dacă ai nevoie doar să **interoghezi chain-ul sau să transmiți tranzacții**, nu ai nevoie de propriul nod — endpoint-urile publice sunt:

| Serviciu | URL |
|---|---|
| Consensus RPC | `https://rpc.qore.host` (WebSocket: `wss://rpc.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` (chain ID `9801`) |
| SVM JSON-RPC (doar citire) | `https://svm.qore.host` |
| Block explorer | [explore.qore.network](https://explore.qore.network) |

Pentru sarcini grele sau de producție (exchange-uri, indexere), rulează propriul nod conform descrierii de mai jos.

---

## Instalare

Instalează binarul `qorechaind` fie din pachetul oficial precompilat, fie construindu-l din sursă.

### Pachet binar precompilat (linux/amd64)

Sursa canonică de adevăr pentru binarul curent este **manifestul de mainnet**, un fișier JSON reîmprospătat live la `https://download.qore.host/mainnet/latest.json`. Acesta conține URL-ul curent al binarului și SHA-256 aferent, URL-ul/SHA-256/dimensiunea genesis-ului curent, listele curente de peers și seeds, portul P2P, un punct de încredere pentru state-sync și versiunea minimă compatibilă de chain. Preia-l și folosește valorile din el în loc să hardcodezi o versiune de binar sau un checksum în scripturile tale de instalare — acestea devin învechite imediat ce apare un release nou:

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

Pachetul conține `qorechaind` plus bibliotecile partajate necesare (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`).

:::caution Menține-ți nodul actualizat — v3.1.92 sau o versiune mai nouă este necesară pentru o sincronizare de la zero
Nodurile complete trebuie să urmărească versiunea de chain live a rețelei — instalează întotdeauna binarul indicat de manifest, nu fixa unul vechi. Separat de câmpul `minCompatible` din manifest, **v3.1.92 sau o versiune mai nouă este necesară pentru un nod care se alătură de la zero (din genesis) sau care se recuperează după o oprire** — versiunile anterioare nu pot finaliza o sincronizare completă din cauza unui bug de gas-metering acum remediat, care oprește replay-ul la primul bloc ce conține o tranzacție. Un nod deja sincronizat, care rulează o versiune mai veche, ar trebui totuși să facă upgrade la prima ocazie, deoarece un nod învechit nu poate decoda tipurile de tranzacții mai noi și se va opri din sincronizare de îndată ce una dintre ele apare într-un bloc.

**Verifică ce servește de fapt manifestul înainte să ai încredere în el.** Manifestul este promovat în mod deliberat — mai întâi pe testnet, apoi pe mainnet după o perioadă de rodaj — deci poate rămâne în urma pragului de versiune de mai sus; la momentul scrierii, manifestul de mainnet în sine încă indică un binar anterior lui v3.1.92, exact build-ul pe care această avertizare spune să nu-l folosești pentru o sincronizare de la zero. Compară câmpul `"version"` al manifestului cu v3.1.92 înainte de a te baza pe `binary.url` al acestuia; dacă este încă în urmă, obține v3.1.92 (sau o versiune mai nouă) din [release-urile GitHub qorechain-core](https://github.com/qorechain/qorechain-core/releases) (verifică checksum-ul tag-ului în același mod), sau [construiește din sursă](/developer-guide/building-from-source).
:::

### Construire din sursă

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Vezi [Construirea din sursă](/developer-guide/building-from-source) pentru toate cerințele preliminare (Go 1.26+, CGO, toolchain Rust, biblioteci native).

### Inițializarea nodului

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

Aceasta creează directoarele implicite de configurare și date sub `~/.qorechaind/`.

---

## Descărcarea Genesis

Înlocuiește fișierul genesis local cu genesis-ul oficial de mainnet, folosind URL-ul și SHA-256 din manifestul preluat mai sus:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

Același fișier este de asemenea servit live chiar de către chain — poți verifica încrucișat descărcarea față de acesta:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Acest fișier definește starea inițială a mainnet-ului Vladi, inclusiv setul de validatori genesis, alocările de token-uri (TGE la genesis) și parametrii modulelor.

---

## Configurarea Peers

Editează configurația nodului tău pentru a te conecta la nodurile sentry publice de mainnet. Citește listele curente de peers și seeds din manifest în loc să hardcodezi ID-uri de noduri și host-uri — acestea se rotesc:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Deschide `~/.qorechaind/config/config.toml` și setează câmpurile `persistent_peers` (și `seeds`) la aceste valori:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Setează de asemenea prețul minim al gas-ului în `~/.qorechaind/config/app.toml` (pragul de taxă al rețelei este **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### Setări recomandate

Poți dori de asemenea să ajustezi următoarele în `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Aceste valori sunt calibrate pentru timpii de bloc și throughput-ul mainnet-ului Vladi.

---

## Bootstrap rapid (Snapshot sau State Sync)

Sincronizarea de la genesis poate dura mult. Câmpul `stateSync` din manifest conține o pereche înălțime/hash de încredere, reîmprospătată orar — folosește-o pentru a configura state sync în loc să cauți manual o înălțime:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Apoi setează secțiunea `[statesync]` din `config.toml` cu aceste valori — vezi [Rularea unui nod](/developer-guide/running-a-node) pentru fluxul complet de lucru, inclusiv un fallback manual bazat pe RPC dacă trebuie să derivezi singur un punct de încredere.

Un snapshot al datelor de chain este de asemenea publicat la [download.qore.host](https://download.qore.host). Verifică listarea curentă de acolo pentru numele fișierului snapshot cel mai recent și checksum-ul publicat al acestuia — nu hardcoda un nume de fișier sau o înălțime, deoarece un snapshot nou îl înlocuiește pe cel vechi în mod regulat:

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

---

## Pornirea nodului

Lansează-ți nodul pentru a începe sincronizarea cu rețeaua:

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

Nodul se conectează la peers și începe descărcarea blocurilor (de la genesis, sau de la înălțimea snapshot-ului dacă ai restaurat unul).

---

## Verificarea stării de sincronizare

Verifică dacă nodul tău ajunge din urmă cel mai recent bloc:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — Nodul încă se sincronizează. Așteaptă să ajungă din urmă.
* `false` — Nodul este complet sincronizat și procesează blocuri noi.

Poți verifica de asemenea cea mai recentă înălțime de bloc:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

Confirmă că te afli pe rețeaua corectă — câmpul `network` ar trebui să raporteze `qorechain-vladi`:

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## Monitorizare

QoreChain expune mai multe endpoint-uri pentru monitorizarea sănătății și performanței nodului.

### Metrici Prometheus

Metricile brute sunt disponibile la:

```
http://localhost:26660/metrics
```

Aceste metrici pot fi colectate (scraped) de orice colector compatibil cu Prometheus.

### Dashboard-uri Grafana

Dacă rulezi prin Docker Compose, Grafana este disponibil la:

```
http://localhost:3001
```

La prima autentificare, setează-ți propriile credențiale când ți se cere — nu lăsa valorile implicite. Dashboard-urile preconfigurate afișează producția de blocuri, throughput-ul tranzacțiilor, conexiunile la peers și utilizarea resurselor.

### Verificare de sănătate REST

API-ul REST oferă un endpoint rapid de status:

```
http://localhost:1317
```

---

## Referință porturi

| Port    | Protocol  | Descriere                                                |
| ------- | --------- | --------------------------------------------------------- |
| `26657` | TCP       | RPC — interoghează și transmite tranzacții                |
| `26656` | TCP       | P2P — comunicare de rețea peer-to-peer                     |
| `1317`  | HTTP      | REST API — interoghează starea chain-ului prin HTTP        |
| `9090`  | gRPC      | gRPC API — acces programatic la chain                      |
| `8545`  | HTTP      | EVM JSON-RPC — RPC compatibil Ethereum (chain ID `9801`)   |
| `8546`  | WebSocket | EVM WebSocket — abonări la evenimente EVM în timp real     |
| `8899`  | HTTP      | SVM RPC — RPC compatibil Solana                             |
| `26660` | HTTP      | Endpoint de metrici Prometheus                              |

---

## Date despre rețea

| Câmp               | Valoare                                |
| ------------------ | --------------------------------------- |
| Chain ID           | `qorechain-vladi`                      |
| EVM chain ID       | `9801` (hex `0x2649`)                  |
| Versiune de chain  | v3.1.92                                |
| Live din           | 7 iunie 2026 23:59 UTC                 |
| Token              | QOR (`uqor`, 10^6 micro-unități = 1 QOR) |
| Preț minim gas     | `0.1uqor`                              |
| Prefix cont        | `qor`                                  |
| Prefix validator   | `qorvaloper`                           |
| SDK                | Cosmos SDK v0.53                       |

---

## Pașii următori

* [Rularea unui nod](/developer-guide/running-a-node) — Operează un nod complet/RPC pentru exchange-uri și integratori
* [Ghid pentru exchange-uri și integratori](/developer-guide/exchange-integration) — Depuneri, retrageri și monitorizare
* [Rularea unui validator](/developer-guide/running-a-validator) — Creează și operează un validator
* [Configurarea unui wallet](/getting-started/wallet-setup) — Configurează un wallet pentru mainnet
* [Prima ta tranzacție](/getting-started/first-transaction) — Trimite primul tău transfer de QOR
* [Conectarea la Testnet](/getting-started/connecting-to-testnet) — Alătură-te testnet-ului Diana pentru testare gratuită
* [Rețele](/appendix/networks) — Chain ID-uri, porturi și referința completă a rețelelor
