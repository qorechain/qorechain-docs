---
slug: /getting-started/connecting-to-testnet
title: Conectarea la rețeaua de test
sidebar_label: Conectarea la rețeaua de test
sidebar_position: 4
---

# Conectarea la rețeaua de test

Alăturați-vă rețelei de test active QoreChain Diana configurând nodul cu fișierul genesis, partenerii și setările de rețea corecte.

:::note
Această pagină acoperă rețeaua de test **`qorechain-diana`** (ID-ul EVM al chain-ului **9800**). Rețeaua principală (**`qorechain-vladi`**, ID-ul EVM al chain-ului **9801**) este activă din 7 iunie 2026 (versiunea **v3.2.3** până la înălțimea 3.742.566, **v3.2.4** de la acel bloc) și are propria pagină dedicată **Conectarea la rețeaua principală**, cu genesis, parteneri și detalii de conectare separate. Rețeaua de test rulează **v3.2.4** din 19 octombrie 2026; manifestul său de lansare se află la [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json).
:::

## Puncte finale publice

Dacă aveți nevoie doar să **interogați rețeaua de test sau să difuzați tranzacții**, folosiți punctele finale publice:

| Serviciu | URL |
|---|---|
| RPC de consens | `https://rpc-testnet.qore.host` (WebSocket: `wss://rpc-testnet.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` (ID chain `9800`) |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (doar citire) | `https://svm-testnet.qore.host` |
| Explorator de blocuri | [explore.qore.network](https://explore.qore.network) (comutați pe Testnet) |

QOR pentru rețeaua de test este disponibil din [Faucetul din Dashboard](/dashboard/faucet).

---

## Instalare

Sursa canonică de adevăr pentru binarul curent al rețelei de test, genesis, parteneri și punctul de încredere pentru state-sync este **manifestul rețelei de test**, reîmprospătat în timp real la `https://download.qore.host/testnet/latest.json`. Are aceeași structură ca manifestul rețelei principale, deci pașii de instalare sunt aceiași — descărcați-l și folosiți valorile din el, în loc să fixați în cod o versiune sau o sumă de control:

```bash
curl -s https://download.qore.host/testnet/latest.json -o latest.json
jq -r '.version, .minCompatible, .upgradeHeight' latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib

qorechaind init my-node --chain-id qorechain-diana
```

Rețeaua de test primește upgrade-uri coordonate prin propuneri de guvernanță, așa că manifestul său conține un `upgradeHeight` (v3.2.4 a fost aplicată la înălțimea 8.337.253, la 19 octombrie 2026; înaintea ei, v3.2.3 la 8.003.746 și v3.2.2 la 6.905.034), iar `minCompatible` este egal cu versiunea curentă (3.2.4). Un nod care se alătură acum are nevoie de versiunea din manifest. Păstrați ceasul sistemului sincronizat prin NTP. Manifestul rețelei principale indică o altă versiune (v3.2.3 până la upgrade-ul de la înălțimea 3.742.566), așa că nu copiați niciodată un binar de pe o rețea pe cealaltă.

---

## Descărcarea fișierului genesis

Înlocuiți fișierul genesis local cu fișierul genesis oficial al rețelei de test, folosind URL-ul și SHA-256 din manifestul descărcat mai sus:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

Același fișier este servit în timp real și de chain-ul însuși:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Acest fișier definește starea inițială a rețelei de test Diana, inclusiv setul de validatori, alocările de token-uri și parametrii modulelor.

:::note Rețeaua de test se actualizează pe loc
Diana rulează continuu din 1 iulie 2026 și este actualizată prin propuneri de guvernanță, la fel ca rețeaua principală. Rețeaua de test este o rețea de staging și poate fi resetată fără preaviz: dacă nodul dumneavoastră nu se mai sincronizează, verificați manifestul și anunțurile de pe Discord, apoi descărcați din nou fișierul genesis și porniți dintr-un director de date nou. Sentry-ul public păstrează doar blocurile recente, așa că un nod nou ar trebui să folosească state-sync (mai jos) în loc să reia blocurile de la genesis.
:::

---

## Configurarea partenerilor

Citiți listele curente de parteneri și seed-uri din manifest, în loc să fixați în cod ID-uri de noduri și gazde:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Deschideți `~/.qorechaind/config/config.toml` și setați câmpurile `persistent_peers` (și `seeds`) la aceste valori:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Setați, de asemenea, pragul minim de comisioane în `~/.qorechaind/config/app.toml` (rețeaua de test folosește același preț minim de gas de **0.1uqor** ca rețeaua principală):

```toml
minimum-gas-prices = "0.1uqor"
```

### Setări recomandate

Un nod complet nu alege timpul de bloc — validatorii o fac (rețeaua de test produce în prezent un bloc aproximativ la fiecare 1 secundă). Lăsați timeout-urile de consens la valorile implicite, cu excepția cazului în care operați un validator și v-au fost date valori de către grupul de validatori. O setare utilă de mempool pentru un nod RPC public, în `config.toml`:

```toml
[mempool]
size = 5000
```

---

## Bootstrap rapid (State Sync)

Câmpul `stateSync` din manifest conține o pereche înălțime/hash de încredere, reîmprospătată periodic:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Setați secțiunea `[statesync]` din `config.toml` cu aceste valori și cu `rpcServers` din manifest — vedeți [Rularea unui nod](/developer-guide/running-a-node) pentru fluxul complet.

---

## Pornirea nodului

Lansați nodul pentru a începe sincronizarea cu rețeaua:

```bash
./qorechaind start
```

Nodul se conectează la parteneri și începe să descarce blocuri (de la genesis sau de la înălțimea de încredere dacă folosiți state-sync). Timpul inițial de sincronizare depinde de înălțimea curentă a chain-ului și de viteza rețelei dumneavoastră.

---

## Verificarea stării de sincronizare

Verificați dacă nodul dumneavoastră ajunge din urmă cel mai recent bloc:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — Nodul încă se sincronizează. Așteptați să ajungă din urmă.
* `false` — Nodul este complet sincronizat și procesează blocuri noi.

Puteți verifica, de asemenea, cea mai recentă înălțime de bloc:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

---

## Monitorizare

QoreChain expune mai multe puncte finale pentru monitorizarea stării și performanței nodului.

### Metrici Prometheus

Metricile brute sunt disponibile la:

```
http://localhost:26660/metrics
```

Aceste metrici pot fi colectate de orice colector compatibil cu Prometheus.

### Tablouri de bord Grafana

Dacă rulați prin Docker Compose, Grafana este disponibilă la:

```
http://localhost:3001
```

La prima autentificare, setați-vă propriile credențiale atunci când vi se solicită — nu lăsați valorile implicite. Tablourile de bord preconfigurate afișează producția de blocuri, debitul tranzacțiilor, conexiunile între parteneri și utilizarea resurselor.

### Verificarea stării prin REST

API-ul REST oferă un punct final rapid de stare:

```
http://localhost:1317
```

---

## Referință porturi

| Port    | Protocol  | Descriere                                          |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — interogarea și difuzarea tranzacțiilor       |
| `26656` | TCP       | P2P — comunicarea de rețea de la nod la nod        |
| `1317`  | HTTP      | API REST — interogarea stării chain-ului prin HTTP |
| `9090`  | gRPC      | API gRPC — acces programatic la chain              |
| `8545`  | HTTP      | EVM JSON-RPC — RPC compatibil cu Ethereum (ID chain `9800`) |
| `8546`  | WebSocket | EVM WebSocket — abonamente la evenimente EVM în timp real |
| `8899`  | HTTP      | SVM RPC — RPC compatibil cu Solana (doar citire; banda de tranzacții SVM este dezactivată) |
| `26660` | HTTP      | Punctul final pentru metrici Prometheus            |

---

## Pașii următori

* [Configurarea portofelului](/getting-started/wallet-setup) — Configurați un portofel pentru rețeaua de test
* [Prima dumneavoastră tranzacție](/getting-started/first-transaction) — Trimiteți primul transfer QOR
