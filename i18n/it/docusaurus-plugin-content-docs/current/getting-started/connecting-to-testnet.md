---
slug: /getting-started/connecting-to-testnet
title: Connessione alla testnet
sidebar_label: Connessione alla testnet
sidebar_position: 4
---

# Connessione alla testnet

Unisciti alla testnet QoreChain Diana attiva configurando il tuo nodo con il file di genesis, i peer e le impostazioni di rete corretti.

:::note
Questa pagina riguarda la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) è attiva dal 7 giugno 2026 e ha una propria pagina dedicata **Connessione alla mainnet** con genesis, peer e dettagli di connessione separati.
:::

---

## Download del genesis

Sostituisci il tuo file di genesis locale con il genesis ufficiale della testnet:

```bash
curl -o ~/.qorechaind/config/genesis.json \
  https://raw.githubusercontent.com/qorechain/qorechain-core/main/config/genesis.json
```

Questo file definisce lo stato iniziale della testnet Diana, incluso il set di validatori, le allocazioni di token e i parametri dei moduli.

---

## Configurazione dei peer

Modifica la configurazione del tuo nodo per connetterti ai peer esistenti della testnet.

Apri `~/.qorechaind/config/config.toml` e imposta il campo `persistent_peers`:

```toml
persistent_peers = "node-id@seed1.qorechain.io:26656,node-id@seed2.qorechain.io:26656"
```

Consulta il [repository QoreChain](https://github.com/qorechain/qorechain-core) per l'elenco dei peer più recente.

### Impostazioni consigliate

Potresti anche voler regolare le seguenti impostazioni in `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Questi valori sono ottimizzati per i tempi di blocco e il throughput della testnet Diana.

---

## Avvio del nodo

Avvia il tuo nodo per iniziare la sincronizzazione con la rete:

```bash
./qorechaind start
```

Il nodo si connette ai peer e inizia a scaricare i blocchi dal genesis. Il tempo di sincronizzazione iniziale dipende dall'altezza attuale della chain e dalla velocità della tua rete.

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

| Porta   | Protocollo | Descrizione                                        |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — interroga e trasmetti transazioni            |
| `26656` | TCP       | P2P — comunicazione di rete peer-to-peer           |
| `1317`  | HTTP      | API REST — interroga lo stato della chain via HTTP |
| `9090`  | gRPC      | API gRPC — accesso programmatico alla chain        |
| `8545`  | HTTP      | EVM JSON-RPC — RPC compatibile con Ethereum (chain ID `9800`) |
| `8546`  | WebSocket | EVM WebSocket — sottoscrizioni di eventi EVM in tempo reale |
| `8899`  | HTTP      | SVM RPC — RPC compatibile con Solana               |
| `26660` | HTTP      | Endpoint delle metriche Prometheus                 |

---

## Prossimi passi

* [Configurazione del wallet](/getting-started/wallet-setup) — Configura un wallet per la testnet
* [La tua prima transazione](/getting-started/first-transaction) — Invia il tuo primo trasferimento di QOR
