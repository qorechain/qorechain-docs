---
slug: /getting-started/quickstart
title: Pornire rapidă
sidebar_label: Pornire rapidă
sidebar_position: 1
---

# Pornire rapidă

Puneți în funcțiune un nod QoreChain în câteva minute. Alegeți Docker Compose pentru cea mai rapidă configurare sau construiți din sursă pentru control complet.

---

## Docker Compose (recomandat)

Cea mai simplă modalitate de a rula un mediu QoreChain complet cu toate serviciile preconfigurate.

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
docker compose up -d
```

Aceasta pornește următoarele servicii:

| Serviciu           | Porturi                                                                 | Descriere                                    |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------- |
| **qorechain-node** | `26657` (RPC), `1317` (REST), `9090` (gRPC), `8545` (EVM), `8899` (SVM) | Nod blockchain complet cu suport multi-VM    |
| **ai-sidecar**     | `50051`                                                                 | Motorul QCAI de detectare a anomaliilor și de evaluare a riscului |
| **indexer**        | --                                                                      | Indexator de blocuri pentru interogări istorice |
| **postgres**       | `5432`                                                                  | Baza de date backend pentru indexator        |
| **prometheus**     | `9091`                                                                  | Colectarea metricilor                        |
| **grafana**        | `3001`                                                                  | Tablouri de bord de monitorizare             |

Odată ce toate containerele sunt funcționale, nodul dumneavoastră începe sincronizarea cu rețeaua.

---

## Construire din sursă

### Cerințe preliminare

* **Go 1.26+** cu CGO activat
* **Instrumentarul Rust** (pentru compilarea criptografiei PQC și a bibliotecilor runtime SVM)
* **Git**

### Construirea binarului

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

### Inițializarea nodului

```bash
./qorechaind init my-node --chain-id qorechain-diana
```

Aceasta creează configurația implicită și directoarele de date sub `~/.qorechaind/`.

### Pornirea nodului

```bash
./qorechaind start
```

Nodul pornește cu setările implicite. Vezi [Conectarea la rețeaua de test](/getting-started/connecting-to-testnet) pentru alăturarea la rețeaua activă cu configurarea corectă a fișierului genesis și a partenerilor.

:::note
Exemplele de pe această pagină vizează rețeaua de test **`qorechain-diana`** (ID-ul EVM al chain-ului **9800**). Rețeaua principală (**`qorechain-vladi`**, ID-ul EVM al chain-ului **9801**) este activă din 7 iunie 2026 și are propria pagină dedicată **Conectarea la rețeaua principală**.
:::

---

## Verificarea instalării

Confirmați că nodul dumneavoastră rulează corect:

```bash
# Check the binary version
./qorechaind version
```

```bash
# Query the node status via RPC
curl localhost:26657/status
```

Un răspuns reușit include `moniker`-ul nodului, `network` (ar trebui să fie `qorechain-diana`) și înălțimea curentă a blocului.

---

## Pașii următori

* [Conectarea la rețeaua de test](/getting-started/connecting-to-testnet) — Alăturați-vă rețelei de test active Diana
* [Configurarea portofelului](/getting-started/wallet-setup) — Configurați un portofel pentru a interacționa cu chain-ul
* [Prima dumneavoastră tranzacție](/getting-started/first-transaction) — Trimiteți primul transfer QOR
* [Conectarea la rețeaua principală](/getting-started/connecting-to-mainnet) — Alăturați-vă rețelei principale active Vladi
* [Prezentare generală SDK](/sdk/overview) — Construiți aplicații pentru QoreChain din cod
