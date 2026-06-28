---
slug: /getting-started/connecting-to-mainnet
title: Connessione alla mainnet
sidebar_label: Connessione alla mainnet
sidebar_position: 3
---

# Connessione alla mainnet

Unisciti alla mainnet QoreChain Vladi attiva configurando il tuo nodo con il file di genesis, i peer e le impostazioni di rete corretti.

:::note
Questa pagina riguarda la mainnet **`qorechain-vladi`** (EVM chain ID **9801**, hex `0x2649`), attiva dal **7 giugno 2026 23:59 UTC** ed eseguita con la versione della chain **v3.1.80** su Cosmos SDK v0.53. Per la testnet **`qorechain-diana`** (EVM chain ID **9800**), vedi [Connessione alla testnet](/getting-started/connecting-to-testnet) e prova la tua configurazione lì prima di andare in produzione.
:::

:::warning
I nodi seed della mainnet, i peer persistenti, l'URL del genesis e il relativo checksum SHA-256 vengono pubblicati ad ogni release ufficiale della mainnet. **Ottieni sempre questi valori correnti dal repository/release ufficiale della mainnet** e verifica il checksum del genesis prima di avviare. I segnaposto seguenti (`<MAINNET_SEED_NODE_ID>@<host>:26656`, URL del genesis, URL degli snapshot) devono essere sostituiti con i valori reali pubblicati — non avviare un nodo mainnet contro peer o genesis non verificati.
:::

---

## Installazione

Installa il binario `qorechaind` compilandolo dal sorgente oppure scaricando l'immagine Docker ufficiale.

### Compilazione dal sorgente

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Vedi [Compilazione dal sorgente](/developer-guide/building-from-source) per tutti i prerequisiti (Go 1.26+, CGO, toolchain Rust, librerie native).

### Inizializzazione del nodo

```bash
./qorechaind init my-node --chain-id qorechain-vladi
```

Questo crea le directory di configurazione e dati predefinite in `~/.qorechaind/`.

---

## Download del genesis

Sostituisci il tuo file di genesis locale con il genesis ufficiale della mainnet:

```bash
curl -o ~/.qorechaind/config/genesis.json \
  <MAINNET_GENESIS_URL>
```

Verifica il checksum del genesis rispetto al valore pubblicato nella release ufficiale della mainnet prima di continuare:

```bash
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

Questo file definisce lo stato iniziale della mainnet Vladi, incluso il set di validatori di genesis, le allocazioni di token (TGE al genesis) e i parametri dei moduli.

:::note
`<MAINNET_GENESIS_URL>` e `<MAINNET_GENESIS_SHA256>` sono segnaposto. Ottieni l'URL del genesis corrente e il relativo checksum SHA-256 dalla release/repository ufficiale della mainnet e verifica che il checksum corrisponda prima di avviare il tuo nodo.
:::

---

## Configurazione dei peer

Modifica la configurazione del tuo nodo per connetterti ai peer esistenti della mainnet.

Apri `~/.qorechaind/config/config.toml` e imposta i campi `seeds` e `persistent_peers`:

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
I valori dei seed e dei peer persistenti riportati sopra sono segnaposto. Ottieni l'ID del nodo seed, l'host e la porta correnti della mainnet dal repository/release ufficiale della mainnet. Non connetterti a peer non verificati.
:::

### Impostazioni consigliate

Potresti anche voler regolare le seguenti impostazioni in `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Questi valori sono ottimizzati per i tempi di blocco e il throughput della mainnet Vladi.

---

## Avvio del nodo

Avvia il tuo nodo per iniziare la sincronizzazione con la rete:

```bash
./qorechaind start
```

Il nodo si connette ai peer e inizia a scaricare i blocchi dal genesis. Il tempo di sincronizzazione iniziale dipende dall'altezza attuale della chain e dalla velocità della tua rete. Per un avvio più rapido, gli operatori utilizzano in genere lo state sync o uno snapshot recente — vedi [Esecuzione di un nodo](/developer-guide/running-a-node) per il flusso completo di state sync e snapshot.

---

## Verifica dello stato di sincronizzazione

Verifica che il tuo nodo stia raggiungendo l'ultimo blocco:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — Il nodo è ancora in fase di sincronizzazione. Attendi che si allinei.
* `false` — Il nodo è completamente sincronizzato ed elabora nuovi blocchi.

Puoi anche verificare l'altezza dell'ultimo blocco:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

Conferma di essere sulla rete corretta — il campo `network` dovrebbe riportare `qorechain-vladi`:

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## Monitoraggio

QoreChain espone diversi endpoint per monitorare lo stato e le prestazioni del nodo.

### Metriche Prometheus

Le metriche grezze sono disponibili all'indirizzo:

```
http://localhost:26660/metrics
```

Queste metriche possono essere raccolte da qualsiasi collector compatibile con Prometheus.

### Dashboard Grafana

Se eseguito tramite Docker Compose, Grafana è disponibile all'indirizzo:

```
http://localhost:3001
```

Al primo accesso, imposta le tue credenziali quando richiesto — non lasciare quelle predefinite. Le dashboard preconfigurate visualizzano la produzione dei blocchi, il throughput delle transazioni, le connessioni dei peer e l'utilizzo delle risorse.

### Controllo dello stato REST

L'API REST fornisce un rapido endpoint di stato:

```
http://localhost:1317
```

---

## Riferimento delle porte

| Porta   | Protocollo | Descrizione                                             |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — interroga e trasmetti transazioni                 |
| `26656` | TCP       | P2P — comunicazione di rete peer-to-peer                |
| `1317`  | HTTP      | API REST — interroga lo stato della chain via HTTP      |
| `9090`  | gRPC      | API gRPC — accesso programmatico alla chain             |
| `8545`  | HTTP      | EVM JSON-RPC — RPC compatibile con Ethereum (chain ID `9801`) |
| `8546`  | WebSocket | EVM WebSocket — sottoscrizioni di eventi EVM in tempo reale |
| `8899`  | HTTP      | SVM RPC — RPC compatibile con Solana                    |
| `26660` | HTTP      | Endpoint delle metriche Prometheus                      |

---

## Dati della rete

| Campo             | Valore                                 |
| ----------------- | -------------------------------------- |
| Chain ID          | `qorechain-vladi`                      |
| EVM chain ID      | `9801` (hex `0x2649`)                  |
| Versione chain    | v3.1.80                                |
| Attiva dal        | 7 giugno 2026 23:59 UTC                |
| Token             | QOR (`uqor`, 10^6 micro-unità = 1 QOR) |
| Prefisso account  | `qor`                                  |
| Prefisso validatore | `qorvaloper`                         |
| SDK               | Cosmos SDK v0.53                       |

---

## Prossimi passi

* [Esecuzione di un nodo](/developer-guide/running-a-node) — Gestisci un nodo full/RPC per exchange e integratori
* [Esecuzione di un validatore](/developer-guide/running-a-validator) — Crea e gestisci un validatore
* [Configurazione del wallet](/getting-started/wallet-setup) — Configura un wallet per la mainnet
* [La tua prima transazione](/getting-started/first-transaction) — Invia il tuo primo trasferimento di QOR
* [Connessione alla testnet](/getting-started/connecting-to-testnet) — Unisciti alla testnet Diana per test gratuiti
* [Reti](/appendix/networks) — Chain ID, porte e il riferimento completo delle reti
