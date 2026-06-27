---
slug: /getting-started/quickstart
title: Avvio rapido
sidebar_label: Avvio rapido
sidebar_position: 1
---

# Avvio rapido

Avvia un nodo QoreChain in pochi minuti. Scegli Docker Compose per la configurazione più rapida, oppure compila dal sorgente per il pieno controllo.

---

## Docker Compose (consigliato)

Il modo più semplice per eseguire un ambiente QoreChain completo con tutti i servizi preconfigurati.

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
docker compose up -d
```

Questo avvia i seguenti servizi:

| Servizio           | Porte                                                                   | Descrizione                                  |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------- |
| **qorechain-node** | `26657` (RPC), `1317` (REST), `9090` (gRPC), `8545` (EVM), `8899` (SVM) | Nodo blockchain completo con supporto multi-VM |
| **ai-sidecar**     | `50051`                                                                 | Motore QCAI di rilevamento anomalie e punteggio di rischio |
| **indexer**        | --                                                                      | Indicizzatore di blocchi per query storiche  |
| **postgres**       | `5432`                                                                  | Backend di database per l'indicizzatore      |
| **prometheus**     | `9091`                                                                  | Raccolta delle metriche                      |
| **grafana**        | `3001`                                                                  | Dashboard di monitoraggio                    |

Una volta che tutti i container sono integri, il tuo nodo inizia la sincronizzazione con la rete.

---

## Compilazione dal sorgente

### Prerequisiti

* **Go 1.26+** con CGO abilitato
* **Toolchain Rust** (per la compilazione della crittografia PQC e delle librerie del runtime SVM)
* **Git**

### Compilazione del binario

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

### Inizializzazione del nodo

```bash
./qorechaind init my-node --chain-id qorechain-diana
```

Questo crea le directory di configurazione e dati predefinite in `~/.qorechaind/`.

### Avvio del nodo

```bash
./qorechaind start
```

Il nodo si avvia con le impostazioni predefinite. Vedi [Connessione alla testnet](/getting-started/connecting-to-testnet) per unirti alla rete attiva con una corretta configurazione di genesis e peer.

:::note
Gli esempi in questa pagina sono rivolti alla testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) è attiva dal 7 giugno 2026 e ha una propria pagina dedicata **Connessione alla mainnet**.
:::

---

## Verifica dell'installazione

Conferma che il tuo nodo sia in esecuzione correttamente:

```bash
# Check the binary version
./qorechaind version
```

```bash
# Query the node status via RPC
curl localhost:26657/status
```

Una risposta corretta include il `moniker` del nodo, la `network` (dovrebbe essere `qorechain-diana`) e l'altezza attuale del blocco.

---

## Prossimi passi

* [Connessione alla testnet](/getting-started/connecting-to-testnet) — Unisciti alla testnet Diana attiva
* [Configurazione del wallet](/getting-started/wallet-setup) — Configura un wallet per interagire con la chain
* [La tua prima transazione](/getting-started/first-transaction) — Invia il tuo primo trasferimento di QOR
* [Connessione alla mainnet](/getting-started/connecting-to-mainnet) — Unisciti alla mainnet Vladi attiva
* [Panoramica dell'SDK](/sdk/overview) — Crea applicazioni su QoreChain dal codice
