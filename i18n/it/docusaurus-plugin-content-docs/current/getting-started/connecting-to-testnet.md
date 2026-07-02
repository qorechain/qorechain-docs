---
slug: /getting-started/connecting-to-testnet
title: Connessione alla Testnet
sidebar_label: Connessione alla Testnet
sidebar_position: 4
---

# Connessione alla Testnet

Unisciti alla testnet Diana di QoreChain configurando il tuo nodo con il file genesis, i peer e le impostazioni di rete corretti.

:::note
Questa pagina riguarda la testnet **`qorechain-diana`** (chain ID EVM **9800**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) è attiva dal 7 giugno 2026 e dispone di una pagina dedicata **Connessione alla Mainnet** con genesis, peer e dettagli di connessione separati.
:::

## Endpoint Pubblici

Se hai solo bisogno di **interrogare la testnet o trasmettere transazioni**, utilizza gli endpoint pubblici:

| Servizio | URL |
|---|---|
| RPC di consenso | `https://rpc-testnet.qore.host` (WebSocket: `wss://rpc-testnet.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` (chain ID `9800`) |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (sola lettura) | `https://svm-testnet.qore.host` |
| Block explorer | [explore.qore.network](https://explore.qore.network) (passa a Testnet) |

I QOR di testnet sono disponibili tramite il [Faucet della Dashboard](/dashboard/faucet).

---

## Scaricare il Genesis

Sostituisci il tuo file genesis locale con il genesis ufficiale della testnet, servito in tempo reale dalla chain stessa:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' \
  > ~/.qorechaind/config/genesis.json
```

Questo file definisce lo stato iniziale della testnet Diana, incluso il set di validatori, le allocazioni dei token e i parametri dei moduli.

:::caution
La testnet Diana viene periodicamente **ri-generata** (riportata all'altezza 0) man mano che vengono rilasciate build pre-release. Se il tuo nodo smette di sincronizzarsi dopo un reset, scarica nuovamente il genesis e riparti da una directory dati pulita.
:::

---

## Configurare i Peer

Modifica la configurazione del tuo nodo per connetterti ai peer esistenti della testnet.

Interroga un peer attuale direttamente dalla rete, quindi imposta il campo `persistent_peers` in `~/.qorechaind/config/config.toml`:

```bash
# node id + listen address of the public testnet node
curl -s https://rpc-testnet.qore.host/status | jq -r '.result.node_info.id'
```

Imposta anche la soglia minima delle commissioni in `~/.qorechaind/config/app.toml` (la testnet utilizza lo stesso prezzo minimo del gas di **0.1uqor** della mainnet):

```toml
minimum-gas-prices = "0.1uqor"
```

### Impostazioni Consigliate

Potresti inoltre voler regolare quanto segue in `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Questi valori sono ottimizzati per i tempi di blocco e il throughput della testnet Diana.

---

## Avviare il Nodo

Avvia il tuo nodo per iniziare la sincronizzazione con la rete:

```bash
./qorechaind start
```

Il nodo si connette ai peer e inizia a scaricare i blocchi a partire dal genesis. Il tempo di sincronizzazione iniziale dipende dall'altezza attuale della chain e dalla velocità della tua rete.

---

## Verificare lo Stato di Sincronizzazione

Verifica che il tuo nodo si stia allineando all'ultimo blocco:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — Il nodo si sta ancora sincronizzando. Attendi che completi l'allineamento.
* `false` — Il nodo è completamente sincronizzato e sta elaborando nuovi blocchi.

Puoi anche controllare l'altezza dell'ultimo blocco:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

---

## Monitoraggio

QoreChain espone diversi endpoint per monitorare la salute e le prestazioni del nodo.

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

Al primo accesso, imposta le tue credenziali quando richiesto — non lasciare quelle predefinite. Le dashboard preconfigurate mostrano la produzione dei blocchi, il throughput delle transazioni, le connessioni ai peer e l'utilizzo delle risorse.

### Controllo di Stato REST

L'API REST fornisce un endpoint di stato rapido:

```
http://localhost:1317
```

---

## Riferimento delle Porte

| Porta   | Protocollo | Descrizione                                        |
| ------- | ---------- | -------------------------------------------------- |
| `26657` | TCP        | RPC — interrogazione e trasmissione delle transazioni |
| `26656` | TCP        | P2P — comunicazione di rete peer-to-peer           |
| `1317`  | HTTP       | REST API — interrogazione dello stato della chain via HTTP |
| `9090`  | gRPC       | gRPC API — accesso programmatico alla chain        |
| `8545`  | HTTP       | EVM JSON-RPC — RPC compatibile con Ethereum (chain ID `9800`) |
| `8546`  | WebSocket  | EVM WebSocket — sottoscrizioni in tempo reale agli eventi EVM |
| `8899`  | HTTP       | SVM RPC — RPC compatibile con Solana               |
| `26660` | HTTP       | Endpoint delle metriche Prometheus                 |

---

## Prossimi Passi

* [Configurazione del Wallet](/getting-started/wallet-setup) — Configura un wallet per la testnet
* [La Tua Prima Transazione](/getting-started/first-transaction) — Invia il tuo primo trasferimento di QOR
