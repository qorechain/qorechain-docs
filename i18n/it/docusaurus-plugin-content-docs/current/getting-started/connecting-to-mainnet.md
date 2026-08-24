---
slug: /getting-started/connecting-to-mainnet
title: Connessione alla mainnet
sidebar_label: Connessione alla mainnet
sidebar_position: 3
---

# Connessione alla mainnet

Unisciti alla mainnet QoreChain Vladi attiva configurando il tuo nodo con il file genesis ufficiale, i peer e le impostazioni di rete.

:::note
Questa pagina riguarda la mainnet **`qorechain-vladi`** (EVM chain ID **9801**, esadecimale `0x2649`), attiva dal **7 giugno 2026 alle 23:59 UTC** ed eseguita con la versione della chain **v3.1.92** su Cosmos SDK v0.53. Per la testnet **`qorechain-diana`** (EVM chain ID **9800**), consulta [Connessione alla testnet](/getting-started/connecting-to-testnet) e prova lì la tua configurazione prima di andare in produzione.
:::

## Endpoint pubblici

Se hai solo bisogno di **interrogare la chain o trasmettere transazioni**, non è necessario un nodo proprio — gli endpoint pubblici sono:

| Servizio | URL |
|---|---|
| RPC di consenso | `https://rpc.qore.host` (WebSocket: `wss://rpc.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` (chain ID `9801`) |
| SVM JSON-RPC (sola lettura) | `https://svm.qore.host` |
| Esploratore di blocchi | [explore.qore.network](https://explore.qore.network) |

Per carichi di lavoro intensi o di produzione (exchange, indexer), esegui un nodo tuo come descritto di seguito.

---

## Installazione

Installa il binario `qorechaind` dal bundle precompilato ufficiale oppure compilandolo dal codice sorgente.

### Bundle binario precompilato (linux/amd64)

La fonte canonica di verità per il binario attuale è il **manifest della mainnet**, un file JSON aggiornato in tempo reale su `https://download.qore.host/mainnet/latest.json`. Contiene l'URL e lo SHA-256 del binario corrente, l'URL/SHA-256/dimensione del genesis corrente, i peer e i seed attuali, la porta P2P, un punto di fiducia per lo state sync e la versione minima compatibile della chain. Recuperalo e usa i suoi valori invece di scrivere in modo fisso una versione del binario o un checksum nei tuoi script di installazione — diventerebbero obsoleti non appena viene rilasciata una nuova release:

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

Il bundle contiene `qorechaind` più le librerie condivise richieste (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`).

:::caution Mantieni il nodo aggiornato — per una sincronizzazione da zero è richiesta la v3.1.92 o successiva
I full node devono seguire la versione della chain attualmente in esecuzione sulla rete — installa sempre il binario indicato dal manifest, non fissarne uno vecchio. A parte il campo `minCompatible` del manifest, **per un nodo che si unisce da zero (dal genesis) o che sta recuperando da un arresto è richiesta la v3.1.92 o successiva** — le versioni precedenti non riescono a completare una sincronizzazione completa a causa di un bug (ora corretto) nella misurazione del gas che blocca il replay al primo blocco contenente una transazione. Un nodo già allineato che esegue una versione precedente dovrebbe comunque aggiornarsi alla prima occasione utile, poiché un nodo obsoleto non può decodificare i tipi di transazione più recenti e smetterà di sincronizzarsi non appena una di esse comparirà in un blocco.
:::

### Compilazione dal codice sorgente

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Consulta [Compilazione dal codice sorgente](/developer-guide/building-from-source) per i prerequisiti completi (Go 1.26+, CGO, toolchain Rust, librerie native).

### Inizializzazione del nodo

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

Questo comando crea le directory predefinite di configurazione e dei dati in `~/.qorechaind/`.

---

## Download del genesis

Sostituisci il tuo file genesis locale con il genesis ufficiale della mainnet, usando l'URL e lo SHA-256 ottenuti dal manifest recuperato in precedenza:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

Lo stesso file è servito in tempo reale anche dalla chain stessa — puoi verificare in modo incrociato il download confrontandolo con esso:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Questo file definisce lo stato iniziale della mainnet Vladi, incluso il set di validatori del genesis, le allocazioni dei token (TGE al genesis) e i parametri dei moduli.

---

## Configurazione dei peer

Modifica la configurazione del tuo nodo per connetterti ai sentry node pubblici della mainnet. Leggi gli elenchi attuali di peer e seed dal manifest invece di scrivere in modo fisso ID nodo e host — questi ruotano nel tempo:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Apri `~/.qorechaind/config/config.toml` e imposta i campi `persistent_peers` (e `seeds`) su questi valori:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Imposta anche il prezzo minimo del gas in `~/.qorechaind/config/app.toml` (la soglia minima delle commissioni di rete è **0.1uqor**):

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

## Bootstrap rapido (snapshot o state sync)

La sincronizzazione dal genesis può richiedere molto tempo. Il campo `stateSync` del manifest contiene una coppia altezza/hash di fiducia aggiornata ogni ora — usala per configurare lo state sync invece di individuare manualmente un'altezza:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Imposta poi la sezione `[statesync]` di `config.toml` con questi valori — consulta [Eseguire un nodo](/developer-guide/running-a-node) per la procedura completa, incluso un metodo alternativo manuale basato su RPC nel caso tu debba ricavare da solo un punto di fiducia.

Uno snapshot dei dati della chain è pubblicato anche su [download.qore.host](https://download.qore.host). Controlla l'elenco attuale lì per il nome file dell'ultimo snapshot e il suo checksum pubblicato — non fissare in modo statico un nome file o un'altezza, poiché un nuovo snapshot sostituisce periodicamente quello precedente:

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

---

## Avvio del nodo

Avvia il tuo nodo per iniziare la sincronizzazione con la rete:

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

Il nodo si connette ai peer e inizia a scaricare i blocchi (dal genesis, oppure dall'altezza dello snapshot se ne hai ripristinato uno).

---

## Verifica dello stato di sincronizzazione

Verifica che il tuo nodo si stia allineando all'ultimo blocco:

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

Le metriche grezze sono disponibili su:

```
http://localhost:26660/metrics
```

Queste metriche possono essere raccolte da qualsiasi collector compatibile con Prometheus.

### Dashboard Grafana

Se esegui il nodo tramite Docker Compose, Grafana è disponibile su:

```
http://localhost:3001
```

Al primo accesso, imposta le tue credenziali quando richiesto — non lasciare quelle predefinite. Le dashboard preconfigurate mostrano la produzione dei blocchi, il throughput delle transazioni, le connessioni ai peer e l'utilizzo delle risorse.

### Controllo di stato REST

L'API REST fornisce un endpoint di stato rapido:

```
http://localhost:1317
```

---

## Riferimento delle porte

| Porta   | Protocollo | Descrizione                                              |
| ------- | ---------- | -------------------------------------------------------- |
| `26657` | TCP        | RPC — interrogazione e trasmissione delle transazioni    |
| `26656` | TCP        | P2P — comunicazione di rete peer-to-peer                 |
| `1317`  | HTTP       | API REST — interrogazione dello stato della chain via HTTP |
| `9090`  | gRPC       | API gRPC — accesso programmatico alla chain              |
| `8545`  | HTTP       | EVM JSON-RPC — RPC compatibile con Ethereum (chain ID `9801`) |
| `8546`  | WebSocket  | EVM WebSocket — sottoscrizioni in tempo reale agli eventi EVM |
| `8899`  | HTTP       | SVM RPC — RPC compatibile con Solana                     |
| `26660` | HTTP       | Endpoint delle metriche Prometheus                       |

---

## Dati della rete

| Campo                   | Valore                                 |
| ----------------------- | --------------------------------------- |
| Chain ID                | `qorechain-vladi`                      |
| EVM chain ID            | `9801` (esadecimale `0x2649`)          |
| Versione della chain    | v3.1.92                                |
| Attiva dal              | 7 giugno 2026 23:59 UTC                |
| Token                   | QOR (`uqor`, 10^6 micro-unità = 1 QOR) |
| Prezzo minimo del gas   | `0.1uqor`                              |
| Prefisso degli account  | `qor`                                  |
| Prefisso dei validatori | `qorvaloper`                           |
| SDK                     | Cosmos SDK v0.53                       |

---

## Prossimi passi

* [Eseguire un nodo](/developer-guide/running-a-node) — Gestisci un nodo full/RPC per exchange e integratori
* [Guida per exchange e integratori](/developer-guide/exchange-integration) — Depositi, prelievi e monitoraggio
* [Eseguire un validatore](/developer-guide/running-a-validator) — Crea e gestisci un validatore
* [Configurazione del wallet](/getting-started/wallet-setup) — Configura un wallet per la mainnet
* [La tua prima transazione](/getting-started/first-transaction) — Invia il tuo primo trasferimento di QOR
* [Connessione alla testnet](/getting-started/connecting-to-testnet) — Unisciti alla testnet Diana per i test gratuiti
* [Reti](/appendix/networks) — Chain ID, porte e il riferimento completo delle reti
