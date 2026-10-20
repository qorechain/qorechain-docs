---
slug: /getting-started/connecting-to-mainnet
title: Connessione alla mainnet
sidebar_label: Connessione alla mainnet
sidebar_position: 3
---

# Connessione alla mainnet

Unisciti alla mainnet QoreChain Vladi attiva configurando il tuo nodo con il file genesis ufficiale, i peer e le impostazioni di rete.

:::note
Questa pagina riguarda la mainnet **`qorechain-vladi`** (EVM chain ID **9801**, esadecimale `0x2649`), attiva dal **7 giugno 2026** ed eseguita con la release **v3.2.3** su Cosmos SDK v0.53 fino all'altezza **3.742.566**, e la **v3.2.4** da quel blocco (proposta di governance 13). Per la testnet **`qorechain-diana`** (EVM chain ID **9800**), consulta [Connessione alla testnet](/getting-started/connecting-to-testnet) e prova lì la tua configurazione prima di andare in produzione.
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

:::caution Mantieni il nodo aggiornato — v3.2.3, poi v3.2.4
I full node devono seguire la release attualmente in esecuzione sulla rete — installa sempre il binario indicato dal manifest, non fissarne uno vecchio. Il manifest corrente è **v3.2.3** con `minCompatible` **3.2.3** e `upgradeHeight` **3.662.051**: la mainnet ha applicato la v3.2.3 a quell'altezza il 20 ottobre 2026 tramite la proposta di governance 11, e un nodo ancora su una release precedente non può seguire la chain oltre quell'altezza. Gli upgrade di governance precedenti sulla mainnet sono stati la **v3.1.94** all'altezza 2.122.074 (il tetto massimo all'emissione), la **v3.2.0** all'altezza 2.981.742 (la finestra di autorizzazione EVM e i byte di firma ibrida v2) e la **v3.2.2** all'altezza 3.556.788 (16 ottobre 2026, proposta 7). La v3.2.1 è stata una release locale al nodo, senza altezza. **La v3.2.4 all'altezza 3.742.566 (proposta di governance 13, circa il 23 ottobre 2026 con blocchi da 3,2 secondi).** I nodi restano sulla v3.2.3 fino a quell'altezza, si fermano lì e ripartono con la v3.2.4; il manifest passa alla 3.2.4 (con `minCompatible` 3.2.4) dopo che l'upgrade è stato applicato, e la firma delle transazioni non cambia. Un nodo che si unisce prima dell'upgrade ha bisogno del binario v3.2.3 e quello che si unisce dopo ha bisogno della v3.2.4 — leggi sempre il manifest; preferisci lo state sync (sotto) al replay dal genesis. Lo snapshot dei dati della chain pubblicato è antecedente a tutte queste altezze di upgrade, quindi un nodo ripristinato da esso deve rieseguirle.

Imposta `evm-chain-id = 9801` in `app.toml` (un valore diverso viene registrato nei log come errore) e mantieni l'orologio di sistema sincronizzato via NTP: un nodo si arresta quando il suo orologio si discosta di oltre 60 secondi. Controlla sempre i campi `"version"` e `"minCompatible"` del manifest prima di fidarti di `binary.url` — il manifest viene promosso in modo deliberato (prima sulla testnet, poi sulla mainnet dopo un periodo di rodaggio). Formato di firma, indirizzi, decimali, memo e commissioni non sono cambiati nella v3.2.3.

La testnet (`qorechain-diana`) esegue la v3.2.4 dal 19 ottobre 2026. Non avviare un binario v3.2.4 su un nodo mainnet prima dell'altezza 3.742.566 e non copiare mai un binario da una rete all'altra: segui il manifest della mainnet, che propone la v3.2.4 una volta applicato l'upgrade.
:::

Quando è programmato un upgrade coordinato, il testo della proposta indica l'altezza e ti dice di restare sulla release precedente fino ad allora: il nodo si ferma a quell'altezza e lo riavvii sul nuovo binario. Leggi lo `status` della proposta (`curl -s https://api.qore.host/cosmos/gov/v1/proposals/<id>`) e i campi `version` e `upgradeHeight` del [manifest della mainnet](https://download.qore.host/mainnet/latest.json) prima di sostituire qualsiasi binario, e non installare mai un binario di upgrade prima della sua altezza: anche un nodo che lo monta in anticipo si ferma. Al momento della stesura non è programmato alcun upgrade (`curl -s https://api.qore.host/cosmos/upgrade/v1beta1/current_plan` restituisce `"plan": null`).

### Compilazione dal codice sorgente (solo per sviluppo)

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Questo compila il binario della community con keeper stub e senza firmatario post-quantistico, che non può riprodurre lo stato di consenso delle reti né creare transazioni con firma ibrida. Per eseguire un nodo sulla mainnet, installa il binario di release indicato sopra. Consulta [Compilazione dal codice sorgente](/developer-guide/building-from-source) per i prerequisiti completi (Go 1.26+, CGO, librerie native).

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

Un full node non sceglie il tempo di blocco — lo scelgono i validatori (la mainnet produce attualmente un blocco circa ogni 3,2 secondi). Lascia i timeout di consenso ai valori predefiniti, a meno che tu non gestisca un validatore e il gruppo dei validatori ti abbia fornito dei valori. Un'impostazione utile del mempool per un nodo RPC pubblico, in `config.toml`:

```toml
[mempool]
size = 5000
```

---

## Bootstrap rapido (snapshot o state sync)

La sincronizzazione dal genesis può richiedere molto tempo. Il campo `stateSync` del manifest contiene una coppia altezza/hash di fiducia aggiornata ogni ora — usala per configurare lo state sync invece di individuare manualmente un'altezza:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Imposta poi la sezione `[statesync]` di `config.toml` con questi valori — consulta [Eseguire un nodo](/developer-guide/running-a-node) per la procedura completa, incluso un metodo alternativo manuale basato su RPC nel caso tu debba ricavare da solo un punto di fiducia.

Nel manifest è elencato anche uno snapshot dei dati della chain (`snapshot.url`, `snapshot.sha256`, `snapshot.height`). Leggi i valori dal manifest invece di scrivere in modo fisso un nome file o un'altezza, poiché un nuovo snapshot sostituisce quello precedente. Lo snapshot è grande (decine di gigabyte) e, come pubblicato a ottobre 2026, è stato acquisito all'altezza 1.966.629 (21 agosto 2026) — prima di ogni altezza di upgrade elencata sopra — quindi un nodo ripristinato da esso deve rieseguire quegli upgrade; lo state sync è di solito più veloce ed evita questo:

```bash
SNAPSHOT_URL=$(jq -r .snapshot.url latest.json)
SNAPSHOT_SHA256=$(jq -r .snapshot.sha256 latest.json)

curl -fsSL "$SNAPSHOT_URL" -o snapshot.tar.gz
echo "${SNAPSHOT_SHA256}  snapshot.tar.gz" | sha256sum -c -

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
| `8899`  | HTTP       | SVM RPC — RPC compatibile con Solana (solo letture; la corsia delle transazioni SVM è disabilitata) |
| `26660` | HTTP       | Endpoint delle metriche Prometheus                       |

---

## Dati della rete

| Campo                   | Valore                                  |
| ----------------------- | --------------------------------------- |
| Chain ID                | `qorechain-vladi`                       |
| EVM chain ID            | `9801` (esadecimale `0x2649`)           |
| Versione della chain    | v3.2.3 (applicata all'altezza 3.662.051); v3.2.4 dall'altezza 3.742.566 |
| Attiva dal              | 7 giugno 2026                           |
| Tempo di blocco         | circa 3,2 secondi (media misurata)      |
| Token                   | QOR (`uqor`, 10^6 micro-unità = 1 QOR)  |
| Prezzo minimo del gas   | `0.1uqor`                               |
| Prefisso degli account  | `qor`                                   |
| Prefisso dei validatori | `qorvaloper`                            |
| SDK                     | Cosmos SDK v0.53                        |

---

## Prossimi passi

* [Eseguire un nodo](/developer-guide/running-a-node) — Gestisci un nodo full/RPC per exchange e integratori
* [Guida per exchange e integratori](/developer-guide/exchange-integration) — Depositi, prelievi e monitoraggio
* [Eseguire un validatore](/developer-guide/running-a-validator) — Crea e gestisci un validatore
* [Configurazione del wallet](/getting-started/wallet-setup) — Configura un wallet per la mainnet
* [La tua prima transazione](/getting-started/first-transaction) — Invia il tuo primo trasferimento di QOR
* [Connessione alla testnet](/getting-started/connecting-to-testnet) — Unisciti alla testnet Diana per i test gratuiti
* [Reti](/appendix/networks) — Chain ID, porte e il riferimento completo delle reti
