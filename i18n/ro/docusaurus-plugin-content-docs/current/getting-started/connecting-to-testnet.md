---
slug: /getting-started/connecting-to-testnet
title: Conectarea la rețeaua de test
sidebar_label: Conectarea la rețeaua de test
sidebar_position: 4
---

# Conectarea la rețeaua de test

Alăturați-vă rețelei de test active QoreChain Diana configurând nodul cu fișierul genesis, partenerii și setările de rețea corecte.

:::note
Această pagină acoperă rețeaua de test **`qorechain-diana`** (ID-ul EVM al chain-ului **9800**). Rețeaua principală (**`qorechain-vladi`**, ID-ul EVM al chain-ului **9801**) este activă din 7 iunie 2026 și are propria pagină dedicată **Conectarea la rețeaua principală**, cu genesis, parteneri și detalii de conectare separate.
:::

---

## Descărcarea fișierului genesis

Înlocuiți fișierul genesis local cu fișierul genesis oficial al rețelei de test:

```bash
curl -o ~/.qorechaind/config/genesis.json \
  https://raw.githubusercontent.com/qorechain/qorechain-core/main/config/genesis.json
```

Acest fișier definește starea inițială a rețelei de test Diana, inclusiv setul de validatori, alocările de token-uri și parametrii modulelor.

---

## Configurarea partenerilor

Editați configurația nodului pentru a vă conecta la partenerii existenți ai rețelei de test.

Deschideți `~/.qorechaind/config/config.toml` și setați câmpul `persistent_peers`:

```toml
persistent_peers = "node-id@seed1.qorechain.io:26656,node-id@seed2.qorechain.io:26656"
```

Consultați [depozitul QoreChain](https://github.com/qorechain/qorechain-core) pentru cea mai recentă listă de parteneri.

### Setări recomandate

Este posibil să doriți, de asemenea, să ajustați următoarele în `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Aceste valori sunt reglate pentru timpii de bloc și debitul rețelei de test Diana.

---

## Pornirea nodului

Lansați nodul pentru a începe sincronizarea cu rețeaua:

```bash
./qorechaind start
```

Nodul se conectează la parteneri și începe să descarce blocuri de la genesis. Timpul inițial de sincronizare depinde de înălțimea curentă a chain-ului și de viteza rețelei dumneavoastră.

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
| `8899`  | HTTP      | SVM RPC — RPC compatibil cu Solana                 |
| `26660` | HTTP      | Punctul final pentru metrici Prometheus            |

---

## Pașii următori

* [Configurarea portofelului](/getting-started/wallet-setup) — Configurați un portofel pentru rețeaua de test
* [Prima dumneavoastră tranzacție](/getting-started/first-transaction) — Trimiteți primul transfer QOR
