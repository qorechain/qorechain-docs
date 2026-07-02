---
slug: /getting-started/connecting-to-mainnet
title: Connessione alla mainnet
sidebar_label: Connessione alla mainnet
sidebar_position: 3
---

# Connessione alla mainnet

Unisciti alla mainnet QoreChain Vladi attiva configurando il tuo nodo con il file genesis ufficiale, i peer e le impostazioni di rete.

:::note
Questa pagina riguarda la mainnet **`qorechain-vladi`** (EVM chain ID **9801**, esadecimale `0x2649`), attiva dal **7 giugno 2026 alle 23:59 UTC** ed eseguita con la versione della chain **v3.1.82** su Cosmos SDK v0.53. Per la testnet **`qorechain-diana`** (EVM chain ID **9800**), consulta [Connessione alla testnet](/getting-started/connecting-to-testnet) e prova lì la tua configurazione prima di andare in produzione.
:::

## Endpoint pubblici

Se hai solo bisogno di **interrogare la chain o trasmettere transazioni**, non è necessario un nodo proprio — gli endpoint pubblici sono:

| Servizio | URL |
|---|---|
| RPC di consenso | `https://rpc.qore.host` (WebSocket: `wss://rpc.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` (chain ID `9801`) |
| SVM JSON-RPC (sola lettura) | `https://svm.qore.host` |
| Block explorer | [explore.qore.network](https://explore.qore.network) |

Per carichi di lavoro intensivi o di produzione (exchange, indicizzatori), esegui il tuo nodo come descritto di seguito.

---

## Installazione

Installa il binario `qorechaind` dal bundle precompilato ufficiale oppure compilandolo dai sorgenti.

### Bundle binario precompilato (linux/amd64)

Il bundle di release ufficiale contiene `qorechaind` insieme alle librerie condivise richieste (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`):

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

I bundle versionati sono pubblicati su [download.qore.host](https://download.qore.host); ogni release è distribuita con il proprio checksum SHA-256.

### Compilazione dai sorgenti

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Consulta [Compilazione dai sorgenti](/developer-guide/building-from-source) per i prerequisiti completi (Go 1.26+, CGO, toolchain Rust, librerie native).

### Inizializzazione del nodo

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

Questo comando crea le directory di configurazione e dei dati predefinite sotto `~/.qorechaind/`.

---

## Download del genesis

Sostituisci il tuo file genesis locale con il genesis ufficiale della mainnet:

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json
```

Lo stesso file è servito anche in tempo reale dalla chain stessa — puoi verificare il download in modo incrociato rispetto ad esso:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Questo file definisce lo stato iniziale della mainnet Vladi, inclusi il set di validatori del genesis, le allocazioni dei token (TGE al genesis) e i parametri dei moduli.

---

## Configurazione dei peer

Modifica la configurazione del tuo nodo per connetterti ai sentry node pubblici della mainnet.

Apri `~/.qorechaind/config/config.toml` e imposta il campo `persistent_peers`:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

Imposta inoltre il prezzo minimo del gas in `~/.qorechaind/config/app.toml` (la soglia minima delle commissioni di rete è **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### Impostazioni consigliate

Potresti inoltre voler regolare i seguenti valori in `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Questi valori sono ottimizzati per i tempi di blocco e il throughput della mainnet Vladi.

---

## Bootstrap rapido (snapshot)

La sincronizzazione dal genesis può richiedere molto tempo. Uno snapshot aggiornato dei dati della chain è pubblicato su [download.qore.host](https://download.qore.host):

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
# Verify before extracting:
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

Gli snapshot sono pubblicati con nomi di file che riportano l'altezza del blocco — controlla su [download.qore.host](https://download.qore.host) qual è il più recente. In alternativa usa lo **state sync** — consulta [Esecuzione di un nodo](/developer-guide/running-a-node) per il flusso di lavoro completo.

---

## Avvio del nodo

Avvia il tuo nodo per iniziare la sincronizzazione con la rete:

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

Il nodo si connette ai peer e inizia a scaricare i blocchi (dal genesis, oppure dall'altezza dello snapshot se ne hai ripristinato uno).

---

## Verifica dello stato di sincronizzazione

Verifica che il tuo nodo stia raggiungendo l'ultimo blocco:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — Il nodo è ancora in fase di sincronizzazione. Attendi che si allinei.
* `false` — Il nodo è completamente sincronizzato e sta elaborando nuovi blocchi.

Puoi anche controllare l'altezza dell'ultimo blocco:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

Conferma di essere sulla rete giusta — il campo `network` deve riportare `qorechain-vladi`:

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## Monitoraggio

QoreChain espone diversi endpoint per monitorare lo stato di salute e le prestazioni del nodo.

### Metriche Prometheus

Le metriche grezze sono disponibili all'indirizzo:

```
http://localhost:26660/metrics
```

Queste metriche possono essere raccolte da qualsiasi collector compatibile con Prometheus.

### Dashboard Grafana

Se esegui il nodo tramite Docker Compose, Grafana è disponibile all'indirizzo:

```
http://localhost:3001
```

Al primo accesso, imposta le tue credenziali quando richiesto — non lasciare quelle predefinite. Le dashboard preconfigurate mostrano la produzione dei blocchi, il throughput delle transazioni, le connessioni dei peer e l'utilizzo delle risorse.

### Controllo di stato REST

L'API REST fornisce un endpoint di stato rapido:

```
http://localhost:1317
```

---

## Riferimento delle porte

| Porta   | Protocollo | Descrizione                                                   |
| ------- | ---------- | ------------------------------------------------------------- |
| `26657` | TCP        | RPC — interrogazione e trasmissione delle transazioni         |
| `26656` | TCP        | P2P — comunicazione di rete peer-to-peer                      |
| `1317`  | HTTP       | API REST — interrogazione dello stato della chain via HTTP    |
| `9090`  | gRPC       | API gRPC — accesso programmatico alla chain                   |
| `8545`  | HTTP       | EVM JSON-RPC — RPC compatibile con Ethereum (chain ID `9801`) |
| `8546`  | WebSocket  | EVM WebSocket — sottoscrizioni in tempo reale agli eventi EVM |
| `8899`  | HTTP       | SVM RPC — RPC compatibile con Solana                          |
| `26660` | HTTP       | Endpoint delle metriche Prometheus                            |

---

## Dati della rete

| Campo                 | Valore                                 |
| --------------------- | -------------------------------------- |
| Chain ID              | `qorechain-vladi`                      |
| EVM chain ID          | `9801` (esadecimale `0x2649`)          |
| Versione della chain  | v3.1.82                                |
| Attiva dal            | 7 giugno 2026 23:59 UTC                |
| Token                 | QOR (`uqor`, 10^6 micro-unità = 1 QOR) |
| Prezzo minimo del gas | `0.1uqor`                              |
| Prefisso account      | `qor`                                  |
| Prefisso validatore   | `qorvaloper`                           |
| SDK                   | Cosmos SDK v0.53                       |

---

## Prossimi passi

* [Esecuzione di un nodo](/developer-guide/running-a-node) — Gestisci un nodo full/RPC per exchange e integratori
* [Guida per exchange e integratori](/developer-guide/exchange-integration) — Depositi, prelievi e monitoraggio
* [Esecuzione di un validatore](/developer-guide/running-a-validator) — Crea e gestisci un validatore
* [Configurazione del wallet](/getting-started/wallet-setup) — Configura un wallet per la mainnet
* [La tua prima transazione](/getting-started/first-transaction) — Invia il tuo primo trasferimento di QOR
* [Connessione alla testnet](/getting-started/connecting-to-testnet) — Unisciti alla testnet Diana per test gratuiti
* [Reti](/appendix/networks) — Chain ID, porte e il riferimento completo delle reti
