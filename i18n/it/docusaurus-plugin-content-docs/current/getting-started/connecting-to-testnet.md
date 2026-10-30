---
slug: /getting-started/connecting-to-testnet
title: Connessione alla Testnet
sidebar_label: Connessione alla Testnet
sidebar_position: 4
---

# Connessione alla Testnet

Unisciti alla testnet Diana di QoreChain configurando il tuo nodo con il file genesis, i peer e le impostazioni di rete corretti.

:::note
Questa pagina riguarda la testnet **`qorechain-diana`** (chain ID EVM **9800**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) è attiva dal 7 giugno 2026 (release **v3.2.5** dal 29 ottobre 2026) e dispone di una pagina dedicata **Connessione alla Mainnet** con genesis, peer e dettagli di connessione separati. La testnet esegue la **v3.2.6** (applicata il 27 ottobre 2026); il suo manifesto di rilascio si trova all'indirizzo [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json).
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

I QOR di testnet sono disponibili tramite il [Faucet della Dashboard](/dashboard/faucet), che può inviare anche i [token di test Fest](/dashboard/faucet#fest-tokens) solo testnet (fUSD, fETH, fBTC; senza valore).

---

## Installazione

La fonte canonica di riferimento per il binario attuale della testnet, il genesis, i peer e il punto di fiducia dello state-sync è il **manifesto della testnet**, aggiornato in tempo reale all'indirizzo `https://download.qore.host/testnet/latest.json`. Ha la stessa struttura del manifesto della mainnet, quindi i passaggi di installazione sono gli stessi — scaricalo e usa i suoi valori invece di fissare nel codice una versione o un checksum:

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

La testnet adotta aggiornamenti coordinati tramite proposte di governance, quindi il suo manifesto riporta un campo `upgradeHeight` e `minCompatible` è uguale alla versione attuale. Un nodo che si unisce ora ha bisogno della release indicata nel manifesto. Al momento della stesura (27 ottobre 2026) il manifesto della testnet riporta `version` 3.2.6, `minCompatible` 3.2.6 e `upgradeHeight` 8970638, e la sua nota dice "IBC v2 light client routes, AMM pools and RL consensus agent fixes, fest test tokens". Mantieni l'orologio di sistema sincronizzato via NTP.

| Release | Altezza sulla testnet | Data di applicazione |
| --- | --- | --- |
| v3.2.2 | 6.905.034 | 2 ottobre 2026 |
| v3.2.3 | 8.003.746 | 15 ottobre 2026 |
| v3.2.4 | 8.337.253 | 19 ottobre 2026 |
| v3.2.5 | 8.890.800 | 26 ottobre 2026 |
| v3.2.6 | 8.970.638 | 27 ottobre 2026 (16:58 UTC) |

La testnet adotta ogni release prima della mainnet. La mainnet ha applicato la v3.2.4 all'altezza 3.742.566 il 23 ottobre 2026 e la v3.2.5 all'altezza 3.906.833 il 29 ottobre 2026 (proposta di governance 14), quindi la v3.2.6 è l'unica release che la testnet ha e la mainnet no. I manifesti sono separati, quindi non copiare mai un binario da una rete all'altra e non aspettarti che la mainnet accetti una funzionalità solo testnet (le aggiunte della v3.2.6 sono elencate in [Cronologia delle Versioni](/appendix/version-history#testnet-v326)).

---

## Scaricare il Genesis

Sostituisci il tuo file genesis locale con il genesis ufficiale della testnet, usando l'URL e lo SHA-256 del manifesto scaricato sopra:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

Lo stesso file è servito anche in tempo reale dalla chain stessa:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Questo file definisce lo stato iniziale della testnet Diana, incluso il set di validatori, le allocazioni dei token e i parametri dei moduli.

:::note La testnet si aggiorna sul posto
Diana è in esecuzione ininterrotta dal 1° luglio 2026 e viene aggiornata tramite proposte di governance, come la mainnet. La testnet è una rete di staging e può essere reimpostata senza preavviso: se il tuo nodo smette di sincronizzarsi, controlla il manifesto e gli annunci su Discord, poi scarica nuovamente il genesis e riparti da una directory dati pulita. Il sentry pubblico conserva solo i blocchi recenti, quindi un nuovo nodo dovrebbe usare lo state-sync (qui sotto) invece di rieseguire la chain dal genesis.
:::

---

## Configurare i Peer

Leggi gli elenchi attuali di peer e seed dal manifesto invece di fissare nel codice gli ID dei nodi e gli host:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Apri `~/.qorechaind/config/config.toml` e imposta i campi `persistent_peers` (e `seeds`) con quei valori:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Imposta anche la soglia minima delle commissioni in `~/.qorechaind/config/app.toml` (la testnet utilizza lo stesso prezzo minimo del gas di **0.1uqor** della mainnet):

```toml
minimum-gas-prices = "0.1uqor"
```

### Impostazioni Consigliate

Un full node non sceglie il tempo di blocco — lo scelgono i validatori (la testnet produce attualmente un blocco circa ogni 1,3 secondi). Lascia i timeout di consenso ai valori predefiniti, a meno che tu non gestisca un validatore e il gruppo dei validatori ti abbia fornito dei valori. Un'impostazione utile del mempool per un nodo RPC pubblico, in `config.toml`:

```toml
[mempool]
size = 5000
```

---

## Bootstrap Rapido (State Sync)

Il campo `stateSync` del manifesto contiene una coppia altezza/hash di fiducia aggiornata regolarmente:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Imposta la sezione `[statesync]` di `config.toml` con quei valori e gli `rpcServers` del manifesto — consulta [Eseguire un Nodo](/developer-guide/running-a-node) per il flusso di lavoro completo.

---

## Avviare il Nodo

Avvia il tuo nodo per iniziare la sincronizzazione con la rete:

```bash
./qorechaind start
```

Il nodo si connette ai peer e inizia a scaricare i blocchi (dal genesis, oppure dall'altezza di fiducia se usi lo state-sync). Il tempo di sincronizzazione iniziale dipende dall'altezza attuale della chain e dalla velocità della tua rete.

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
| `8899`  | HTTP       | SVM RPC — RPC compatibile con Solana (sola lettura; la corsia delle transazioni SVM è disabilitata) |
| `26660` | HTTP       | Endpoint delle metriche Prometheus                 |

---

## Prossimi Passi

* [Configurazione del Wallet](/getting-started/wallet-setup) — Configura un wallet per la testnet
* [La Tua Prima Transazione](/getting-started/first-transaction) — Invia il tuo primo trasferimento di QOR
