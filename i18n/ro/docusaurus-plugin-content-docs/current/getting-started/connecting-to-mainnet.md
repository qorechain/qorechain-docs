---
slug: /getting-started/connecting-to-mainnet
title: Conectarea la rețeaua principală
sidebar_label: Conectarea la rețeaua principală
sidebar_position: 3
---

# Conectarea la rețeaua principală

Alăturați-vă rețelei principale active QoreChain Vladi configurând nodul cu fișierul genesis, partenerii și setările de rețea corecte.

:::note
Această pagină acoperă rețeaua principală **`qorechain-vladi`** (ID-ul EVM al chain-ului **9801**, hex `0x2649`), activă din **7 iunie 2026 23:59 UTC** și rulând versiunea de chain **v3.1.80** pe Cosmos SDK v0.53. Pentru rețeaua de test **`qorechain-diana`** (ID-ul EVM al chain-ului **9800**), vezi [Conectarea la rețeaua de test](/getting-started/connecting-to-testnet) și exersați-vă configurarea acolo înainte de a trece în producție.
:::

:::warning
Nodurile seed ale rețelei principale, partenerii persistenți, URL-ul genesis și suma sa de control SHA-256 sunt publicate cu fiecare lansare oficială a rețelei principale. **Obțineți întotdeauna aceste valori actuale din depozitul/lansarea oficială a rețelei principale** și verificați suma de control a fișierului genesis înainte de a porni. Substituenții de mai jos (`<MAINNET_SEED_NODE_ID>@<host>:26656`, URL-ul genesis, URL-urile instantaneelor) trebuie înlocuiți cu valorile reale publicate — nu porniți un nod de rețea principală cu parteneri sau genesis neverificați.
:::

---

## Instalare

Instalați binarul `qorechaind` fie construindu-l din sursă, fie descărcând imaginea Docker oficială.

### Construire din sursă

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Vezi [Construire din sursă](/developer-guide/building-from-source) pentru cerințele preliminare complete (Go 1.26+, CGO, instrumentarul Rust, bibliotecile native).

### Inițializarea nodului

```bash
./qorechaind init my-node --chain-id qorechain-vladi
```

Aceasta creează configurația implicită și directoarele de date sub `~/.qorechaind/`.

---

## Descărcarea fișierului genesis

Înlocuiți fișierul genesis local cu fișierul genesis oficial al rețelei principale:

```bash
curl -o ~/.qorechaind/config/genesis.json \
  <MAINNET_GENESIS_URL>
```

Verificați suma de control a fișierului genesis comparând-o cu valoarea publicată în lansarea oficială a rețelei principale înainte de a continua:

```bash
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

Acest fișier definește starea inițială a rețelei principale Vladi, inclusiv setul de validatori genesis, alocările de token-uri (TGE la genesis) și parametrii modulelor.

:::note
`<MAINNET_GENESIS_URL>` și `<MAINNET_GENESIS_SHA256>` sunt substituenți. Obțineți URL-ul genesis actual și suma sa de control SHA-256 din lansarea/depozitul oficial al rețelei principale și verificați că suma de control corespunde înainte de a porni nodul.
:::

---

## Configurarea partenerilor

Editați configurația nodului pentru a vă conecta la partenerii existenți ai rețelei principale.

Deschideți `~/.qorechaind/config/config.toml` și setați câmpurile `seeds` și `persistent_peers`:

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
Valorile pentru seed și partenerii persistenți de mai sus sunt substituenți. Obțineți ID-ul nodului seed, gazda și portul actuale ale rețelei principale din depozitul/lansarea oficială a rețelei principale. Nu vă conectați la parteneri neverificați.
:::

### Setări recomandate

Este posibil să doriți, de asemenea, să ajustați următoarele în `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Aceste valori sunt reglate pentru timpii de bloc și debitul rețelei principale Vladi.

---

## Pornirea nodului

Lansați nodul pentru a începe sincronizarea cu rețeaua:

```bash
./qorechaind start
```

Nodul se conectează la parteneri și începe să descarce blocuri de la genesis. Timpul inițial de sincronizare depinde de înălțimea curentă a chain-ului și de viteza rețelei dumneavoastră. Pentru un demaraj mai rapid, operatorii folosesc de obicei sincronizarea stării sau un instantaneu recent — vezi [Rularea unui nod](/developer-guide/running-a-node) pentru fluxul complet de sincronizare a stării și instantanee.

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

Confirmați că vă aflați în rețeaua corectă — câmpul `network` ar trebui să raporteze `qorechain-vladi`:

```bash
curl localhost:26657/status | jq '.result.node_info.network'
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

| Port    | Protocol  | Descriere                                               |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — interogarea și difuzarea tranzacțiilor            |
| `26656` | TCP       | P2P — comunicarea de rețea de la nod la nod             |
| `1317`  | HTTP      | API REST — interogarea stării chain-ului prin HTTP      |
| `9090`  | gRPC      | API gRPC — acces programatic la chain                   |
| `8545`  | HTTP      | EVM JSON-RPC — RPC compatibil cu Ethereum (ID chain `9801`) |
| `8546`  | WebSocket | EVM WebSocket — abonamente la evenimente EVM în timp real |
| `8899`  | HTTP      | SVM RPC — RPC compatibil cu Solana                      |
| `26660` | HTTP      | Punctul final pentru metrici Prometheus                |

---

## Date despre rețea

| Câmp              | Valoare                                |
| ----------------- | -------------------------------------- |
| ID chain          | `qorechain-vladi`                      |
| ID EVM chain      | `9801` (hex `0x2649`)                  |
| Versiune chain    | v3.1.80                                |
| Activă din        | 7 iunie 2026 23:59 UTC                 |
| Token             | QOR (`uqor`, 10^6 micro-unități = 1 QOR) |
| Prefix cont       | `qor`                                  |
| Prefix validator  | `qorvaloper`                           |
| SDK               | Cosmos SDK v0.53                       |

---

## Pașii următori

* [Rularea unui nod](/developer-guide/running-a-node) — Operați un nod complet/RPC pentru burse și integratori
* [Rularea unui validator](/developer-guide/running-a-validator) — Creați și operați un validator
* [Configurarea portofelului](/getting-started/wallet-setup) — Configurați un portofel pentru rețeaua principală
* [Prima dumneavoastră tranzacție](/getting-started/first-transaction) — Trimiteți primul transfer QOR
* [Conectarea la rețeaua de test](/getting-started/connecting-to-testnet) — Alăturați-vă rețelei de test Diana pentru testare gratuită
* [Rețele](/appendix/networks) — ID-uri de chain, porturi și referința completă a rețelelor
