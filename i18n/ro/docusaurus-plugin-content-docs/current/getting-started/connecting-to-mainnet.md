---
slug: /getting-started/connecting-to-mainnet
title: Conectarea la Mainnet
sidebar_label: Conectarea la Mainnet
sidebar_position: 3
---

# Conectarea la Mainnet

Alătură-te mainnet-ului live QoreChain Vladi configurându-ți nodul cu fișierul genesis oficial, peers și setările de rețea.

:::note
Această pagină acoperă mainnet-ul **`qorechain-vladi`** (EVM chain ID **9801**, hex `0x2649`), live din **29 iunie 2026** (blocul genesis la 17:03 UTC), rulând versiunea **v3.2.1** pe Cosmos SDK v0.53. Pentru testnet-ul **`qorechain-diana`** (EVM chain ID **9800**), vezi [Conectarea la Testnet](/getting-started/connecting-to-testnet) și repetă configurarea acolo înainte de a trece live.
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

:::caution Menține-ți nodul actualizat — este necesară v3.2.0 sau o versiune mai nouă
Nodurile complete trebuie să urmărească versiunea live a rețelei — instalează întotdeauna binarul indicat de manifest, nu fixa unul vechi. Manifestul curent este **v3.2.1**, cu `minCompatible` **3.2.0**. Mainnet-ul a aplicat două upgrade-uri de guvernanță pe care fiecare nod trebuie să le gestioneze: **v3.1.94** la înălțimea 2.122.074 (plafonul de emisiune) și **v3.2.0** la înălțimea 2.981.742 (fereastra de autorizare EVM și octeții de semnătură hibridă v2). Un nod care se alătură de la zero are deci nevoie de un binar v3.2.x; preferă state sync (mai jos) în locul replay-ului de la genesis. Snapshot-ul publicat al datelor de chain este anterior ambelor înălțimi de upgrade, așa că un nod restaurat din el trebuie să le reia (replay) cu un binar v3.2.x.

v3.2.1 este o versiune locală nodului (fără înălțime de upgrade, fără vot de guvernanță): nodurile pe v3.2.0 continuă să urmeze chain-ul, dar upgrade-ul este recomandat. După trecerea la v3.2.1 setează `evm-chain-id = 9801` în `app.toml` (o valoare diferită este înregistrată ca eroare) și menține ceasul sistemului sincronizat prin NTP: un nod se oprește dacă ceasul său este în afara intervalului cu mai mult de 60 de secunde. Verifică întotdeauna câmpurile `"version"` și `"minCompatible"` ale manifestului înainte de a avea încredere în `binary.url` — manifestul este promovat în mod deliberat (mai întâi pe testnet, apoi pe mainnet după o perioadă de rodaj).
:::

:::caution Este programat un upgrade coordonat al mainnet-ului — citește înainte de a porni sau reporni un nod
Propunerea de guvernanță **7** de pe mainnet (procedură accelerată, votare până la 15 octombrie 2026 21:24 UTC) ar aplica **v3.2.2** la înălțimea **3.556.788** — cam două zile după 14 octombrie, la aproximativ 3,2 s per bloc. Textul propunerii spune: rămâi pe v3.2.1 (sau v3.2.0) până la acea înălțime; nodul se oprește acolo, iar tu îl repornești pe v3.2.2; semnarea tranzacțiilor rămâne neschimbată. **Dacă se întâmplă sau nu depinde de vot** — verifică rezultatul (`curl -s https://api.qore.host/cosmos/gov/v1/proposals/7`, câmpul `status`) și câmpurile `version` și `upgradeHeight` din [manifestul mainnet](https://download.qore.host/mainnet/latest.json) înainte de a schimba orice binar. Nu instala v3.2.2 mai devreme: un nod care o are înainte de acea înălțime se oprește și el. Dacă propunerea eșuează sau înălțimea a trecut, această notă nu se mai aplică.
:::

### Construire din sursă (doar pentru dezvoltare)

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Aceasta construiește binarul comunității, cu keeper-e stub și fără semnatar post-cuantic, care nu poate reproduce starea de consens a rețelelor și nici nu poate crea tranzacții semnate hibrid. Pentru a rula un nod pe mainnet, instalează binarul de lansare de mai sus. Vezi [Construirea din sursă](/developer-guide/building-from-source) pentru toate cerințele preliminare (Go 1.26+, CGO, biblioteci native).

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

Un nod complet nu alege timpul de bloc — îl aleg validatorii (mainnet-ul produce în prezent un bloc la aproximativ 3,2 secunde). Lasă timeout-urile de consens la valorile implicite, cu excepția cazului în care operezi un validator și ți-au fost date valori de către grupul de validatori. O setare utilă pentru mempool, pentru un nod RPC public, în `config.toml`:

```toml
[mempool]
size = 5000
```

---

## Bootstrap rapid (Snapshot sau State Sync)

Sincronizarea de la genesis poate dura mult. Câmpul `stateSync` din manifest conține o pereche înălțime/hash de încredere, reîmprospătată orar — folosește-o pentru a configura state sync în loc să cauți manual o înălțime:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Apoi setează secțiunea `[statesync]` din `config.toml` cu aceste valori — vezi [Rularea unui nod](/developer-guide/running-a-node) pentru fluxul complet de lucru, inclusiv un fallback manual bazat pe RPC dacă trebuie să derivezi singur un punct de încredere.

Un snapshot al datelor de chain este listat de asemenea în manifest (`snapshot.url`, `snapshot.sha256`, `snapshot.height`). Citește valorile din manifest în loc să hardcodezi un nume de fișier sau o înălțime, deoarece un snapshot nou îl înlocuiește pe cel vechi. Snapshot-ul este mare (zeci de gigaocteți) și, așa cum a fost publicat în octombrie 2026, a fost luat la înălțimea 1.966.629 (21 august 2026) — înainte de înălțimile de upgrade v3.1.94 și v3.2.0 — deci un nod restaurat din el reia ambele upgrade-uri și trebuie să ruleze un binar v3.2.x; state sync este de obicei mai rapid:

```bash
SNAPSHOT_URL=$(jq -r .snapshot.url latest.json)
SNAPSHOT_SHA256=$(jq -r .snapshot.sha256 latest.json)

curl -fsSL "$SNAPSHOT_URL" -o snapshot.tar.gz
echo "${SNAPSHOT_SHA256}  snapshot.tar.gz" | sha256sum -c -

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
| `8899`  | HTTP      | SVM RPC — RPC compatibil Solana (doar citire; lane-ul de tranzacții SVM este dezactivat) |
| `26660` | HTTP      | Endpoint de metrici Prometheus                              |

---

## Date despre rețea

| Câmp               | Valoare                                |
| ------------------ | --------------------------------------- |
| Chain ID           | `qorechain-vladi`                      |
| EVM chain ID       | `9801` (hex `0x2649`)                  |
| Versiune de chain  | v3.2.1 (regulile de consens din v3.2.0) |
| Live din           | 29 iunie 2026 17:03 UTC (blocul genesis) |
| Timp de bloc       | aproximativ 3,2 secunde (medie măsurată) |
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
