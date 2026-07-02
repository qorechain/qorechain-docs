---
slug: /getting-started/connecting-to-mainnet
title: Conectarea la Mainnet
sidebar_label: Conectarea la Mainnet
sidebar_position: 3
---

# Conectarea la Mainnet

Alătură-te mainnet-ului QoreChain Vladi, aflat în producție, configurându-ți nodul cu fișierul genesis oficial, peer-ii și setările de rețea.

:::note
Această pagină acoperă mainnet-ul **`qorechain-vladi`** (EVM chain ID **9801**, hex `0x2649`), activ din **7 iunie 2026, 23:59 UTC**, care rulează versiunea de lanț **v3.1.82** pe Cosmos SDK v0.53. Pentru testnet-ul **`qorechain-diana`** (EVM chain ID **9800**), consultă [Conectarea la Testnet](/getting-started/connecting-to-testnet) și repetă-ți configurarea acolo înainte de a trece în producție.
:::

## Endpoint-uri publice

Dacă ai nevoie doar să **interoghezi lanțul sau să difuzezi tranzacții**, nu îți trebuie propriul nod — endpoint-urile publice sunt:

| Serviciu | URL |
|---|---|
| RPC de consens | `https://rpc.qore.host` (WebSocket: `wss://rpc.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` (chain ID `9801`) |
| SVM JSON-RPC (doar citire) | `https://svm.qore.host` |
| Explorator de blocuri | [explore.qore.network](https://explore.qore.network) |

Pentru sarcini intensive sau de producție (burse, indexeri), rulează propriul nod, așa cum este descris mai jos.

---

## Instalare

Instalează binarul `qorechaind` fie din pachetul oficial precompilat, fie compilându-l din sursă.

### Pachet binar precompilat (linux/amd64)

Pachetul oficial de release conține `qorechaind` plus bibliotecile partajate necesare (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`):

```bash
curl -fsSL https://download.qore.host/qorechaind-v3.1.82-linux-amd64.tar.gz -o qore.tgz
# Verify the checksum before installing:
sha256sum qore.tgz
# 8a88936ccc6d350d8b215488a81584163b3568430064958c50e82a394077cfe9

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

Pachetele versionate sunt publicate la [download.qore.host](https://download.qore.host); fiecare release este livrat cu suma sa de control SHA-256.

### Compilarea din sursă

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Consultă [Compilarea din sursă](/developer-guide/building-from-source) pentru lista completă de cerințe preliminare (Go 1.26+, CGO, toolchain Rust, biblioteci native).

### Inițializarea nodului

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

Aceasta creează configurația implicită și directoarele de date în `~/.qorechaind/`.

---

## Descărcarea fișierului genesis

Înlocuiește fișierul genesis local cu fișierul genesis oficial al mainnet-ului:

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json
```

Același fișier este servit în timp real și de lanțul însuși — poți verifica încrucișat descărcarea față de acesta:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Acest fișier definește starea inițială a mainnet-ului Vladi, inclusiv setul de validatori de la genesis, alocările de tokeni (TGE la genesis) și parametrii modulelor.

---

## Configurarea peer-ilor

Editează configurația nodului tău pentru a te conecta la nodurile sentry publice ale mainnet-ului.

Deschide `~/.qorechaind/config/config.toml` și setează câmpul `persistent_peers`:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

Setează, de asemenea, prețul minim al gazului în `~/.qorechaind/config/app.toml` (pragul minim de comision al rețelei este **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### Setări recomandate

Este posibil să vrei să ajustezi și următoarele în `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Aceste valori sunt calibrate pentru timpii de bloc și debitul mainnet-ului Vladi.

---

## Bootstrap rapid (snapshot)

Sincronizarea de la genesis poate dura mult. Un snapshot proaspăt al datelor lanțului este publicat la [download.qore.host](https://download.qore.host):

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
# Verify before extracting:
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

Snapshot-urile sunt publicate sub nume de fișiere marcate cu înălțimea blocului — verifică [download.qore.host](https://download.qore.host) pentru cel mai recent. Alternativ, folosește **state sync** — vezi [Rularea unui nod](/developer-guide/running-a-node) pentru fluxul de lucru complet.

---

## Pornirea nodului

Lansează nodul pentru a începe sincronizarea cu rețeaua:

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

Nodul se conectează la peers și începe să descarce blocuri (de la genesis sau de la înălțimea snapshot-ului, dacă ai restaurat unul).

---

## Verificarea stării de sincronizare

Verifică dacă nodul tău recuperează decalajul până la cel mai recent bloc:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — Nodul încă se sincronizează. Așteaptă să recupereze decalajul.
* `false` — Nodul este complet sincronizat și procesează blocuri noi.

Poți verifica și înălțimea celui mai recent bloc:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

Confirmă că ești pe rețeaua corectă — câmpul `network` ar trebui să raporteze `qorechain-vladi`:

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## Monitorizare

QoreChain expune mai multe endpoint-uri pentru monitorizarea stării și performanței nodului.

### Metrici Prometheus

Metricile brute sunt disponibile la:

```
http://localhost:26660/metrics
```

Aceste metrici pot fi colectate de orice colector compatibil Prometheus.

### Dashboard-uri Grafana

Dacă rulezi prin Docker Compose, Grafana este disponibilă la:

```
http://localhost:3001
```

La prima autentificare, setează-ți propriile credențiale atunci când ți se solicită — nu lăsa valorile implicite. Dashboard-urile preconfigurate afișează producția de blocuri, debitul de tranzacții, conexiunile cu peer-ii și utilizarea resurselor.

### Verificarea stării prin REST

API-ul REST oferă un endpoint rapid de stare:

```
http://localhost:1317
```

---

## Referință porturi

| Port    | Protocol  | Descriere                                                |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — interogare și difuzare de tranzacții              |
| `26656` | TCP       | P2P — comunicare de rețea peer-to-peer                  |
| `1317`  | HTTP      | API REST — interogarea stării lanțului prin HTTP        |
| `9090`  | gRPC      | API gRPC — acces programatic la lanț                    |
| `8545`  | HTTP      | EVM JSON-RPC — RPC compatibil Ethereum (chain ID `9801`) |
| `8546`  | WebSocket | EVM WebSocket — abonamente în timp real la evenimente EVM |
| `8899`  | HTTP      | SVM RPC — RPC compatibil Solana                         |
| `26660` | HTTP      | Endpoint pentru metrici Prometheus                      |

---

## Date despre rețea

| Câmp                  | Valoare                                    |
| --------------------- | ------------------------------------------ |
| Chain ID              | `qorechain-vladi`                          |
| EVM chain ID          | `9801` (hex `0x2649`)                      |
| Versiune de lanț      | v3.1.82                                    |
| Activ din             | 7 iunie 2026, 23:59 UTC                    |
| Token                 | QOR (`uqor`, 10^6 micro-unități = 1 QOR)   |
| Preț minim al gazului | `0.1uqor`                                  |
| Prefix conturi        | `qor`                                      |
| Prefix validatori     | `qorvaloper`                               |
| SDK                   | Cosmos SDK v0.53                           |

---

## Pașii următori

* [Rularea unui nod](/developer-guide/running-a-node) — Operează un nod full/RPC pentru burse și integratori
* [Ghid pentru burse și integratori](/developer-guide/exchange-integration) — Depuneri, retrageri și monitorizare
* [Rularea unui validator](/developer-guide/running-a-validator) — Creează și operează un validator
* [Configurarea portofelului](/getting-started/wallet-setup) — Configurează un portofel pentru mainnet
* [Prima ta tranzacție](/getting-started/first-transaction) — Trimite primul tău transfer QOR
* [Conectarea la Testnet](/getting-started/connecting-to-testnet) — Alătură-te testnet-ului Diana pentru testare gratuită
* [Rețele](/appendix/networks) — Chain ID-uri, porturi și referința completă a rețelelor
