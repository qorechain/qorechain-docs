---
slug: /developer-guide/running-a-node
title: Esecuzione di un Nodo
sidebar_label: Esecuzione di un Nodo
sidebar_position: 10
---

# Esecuzione di un Nodo

Questa guida copre l'esecuzione di un deployment QoreChain **solo nodo** — un nodo full o RPC che sincronizza la chain ed espone endpoint per l'integrazione, **senza** compiti da validator. È rivolta a exchange (CEX), backend di wallet, indexer e integratori che necessitano di un accesso in lettura/scrittura affidabile alla rete ma non firmano blocchi.

:::note
Per la produzione dei blocchi, lo staking, lo slashing e la classificazione dei pool, vedi [Esecuzione di un Validator](/developer-guide/running-a-validator). Un deployment solo nodo non detiene mai una chiave di consenso da validator e non compare mai nel set attivo.
:::

:::warning
I binari, il genesis e gli snapshot sono pubblicati su [download.qore.host](https://download.qore.host) con checksum SHA-256. **Verifica sempre i checksum prima di installare o estrarre**, e verifica i depositi solo confrontandoli con il tuo nodo sincronizzato.
:::

:::note Fonte di verità: il manifest live
Il binario corrente, il genesis, i peer, i seed e un trust point per lo state-sync sono pubblicati come manifest JSON, aggiornato in tempo reale — non inserire nei tuoi script di installazione una versione del binario, un checksum o un nome file di snapshot fissi, perché diventano obsoleti non appena viene rilasciata una nuova release:

- Mainnet: `https://download.qore.host/mainnet/latest.json`
- Testnet: `https://download.qore.host/testnet/latest.json`

I campi del manifest includono `binary` (url + sha256), `genesis` (url + sha256 + sizeBytes), `peers`, `seeds`, `p2pPort`, `stateSync` (un trust point aggiornato ogni ora) e `minCompatible`. I passaggi di installazione e collegamento riportati di seguito recuperano questo manifest e ne usano i valori correnti.
:::

:::caution v3.1.94 o successiva richiesta per un nodo che si unisce da zero
Un nodo che si sincronizza dal genesis o che effettua il replay da un archivio/snapshot deve essere sulla versione **v3.1.94 o successiva**, per due motivi che si sommano: la v3.1.92 ha corretto un bug nel gas-metering che altrimenti blocca il replay al primo blocco contenente una transazione, e la mainnet ha nel frattempo superato l'upgrade di governance v3.1.94 (un tetto massimo fisso sull'emissione, applicato all'altezza 2.122.074) — un nodo privo del gestore di quell'upgrade si blocca di nuovo tentando di rieseguire il replay oltre quella stessa altezza. La v3.1.95 è la versione attualmente consigliata (un aggiornamento di sicurezza continuo, che non rompe il consenso); `minCompatible` è `3.1.94`. Il manifest viene promosso deliberatamente (prima sulla testnet, poi sulla mainnet dopo un periodo di stabilizzazione) e in passato è rimasto indietro rispetto a questo limite minimo — controlla il campo `"version"` prima di fidarti di `binary.url`, e se è indietro ripiega sulle [release GitHub di qorechain-core](https://github.com/qorechain/qorechain-core/releases) o sulla compilazione dal codice sorgente.
:::

---

## Nodo vs Validator

| Aspetto              | Solo nodo (questa guida)                        | Validator                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Chiave di consenso       | Nessuna                                      | Chiave di consenso ed25519 (da proteggere)    |
| Produzione blocchi    | No                                              | Sì — propone e firma i blocchi         |
| Staking / slashing  | Non applicabile                                  | Self-delegation, rischio di slashing |
| Scopo principale     | Servire RPC/REST/gRPC/EVM/SVM alle integrazioni     | Proteggere la rete, guadagnare ricompense           |
| Esposizione pubblica     | Endpoint RPC/EVM tipicamente esposti             | Validator nascosto dietro sentry node       |

---

## Reti di destinazione

| Rete  | Chain ID            | EVM chain ID         | Note                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Primaria — live dal 7 giugno 2026 |
| Testnet  | `qorechain-diana`   | `9800`               | Prova qui le integrazioni per prima cosa |

Sostituisci il `--chain-id` appropriato per la rete di destinazione in tutta questa guida. Gli esempi usano di default la mainnet.

---

## Hardware consigliato

| Profilo                  | CPU      | RAM   | Disco (NVMe SSD)         | Rete   |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| Nodo RPC con pruning          | 4 core  | 16 GB | 500 GB+                 | 100 Mbps+ |
| Nodo full/archive        | 8 core  | 32 GB | 2 TB+ (cresce nel tempo) | 1 Gbps    |
| Integrazione exchange     | 8 core  | 32 GB | 2 TB+ con margine     | 1 Gbps    |

Un SSD NVMe è vivamente consigliato — lo stato della chain e gli store EVM/SVM sono intensivi in I/O. I nodi archive (senza pruning, con indicizzazione completa delle transazioni) crescono continuamente; prevedi spazio disco con margine e monitoraggio.

---

## Deployment

### Docker Compose

Un deployment solo nodo con Docker Compose. Non esiste ancora un'immagine `qorechaind` pubblicata pubblicamente da scaricare — compilala tu stesso a partire dal `Dockerfile` del repository e taggala con la versione live della chain (**v3.1.95** su mainnet), poi monta un volume persistente per i dati della chain:

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
docker build -t qorechain-node:v3.1.95 .
```

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain-node:v3.1.95
    container_name: qorechain-node
    restart: unless-stopped
    command: ["start", "--home", "/root/.qorechaind"]
    volumes:
      - qorechain-data:/root/.qorechaind
    ports:
      - "26657:26657"   # RPC
      - "26656:26656"   # P2P
      - "1317:1317"     # REST
      - "9090:9090"     # gRPC
      - "8545:8545"     # EVM JSON-RPC
      - "8546:8546"     # EVM WebSocket
      - "8899:8899"     # SVM RPC
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

Inizializza una volta la directory dei dati (il genesis e la configurazione dei peer sono trattati di seguito), poi avvia:

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

Per un'installazione bare-metal, esegui `qorechaind` sotto systemd:

```ini
# /etc/systemd/system/qorechaind.service
[Unit]
Description=QoreChain node
After=network-online.target
Wants=network-online.target

[Service]
User=qorechain
ExecStart=/usr/local/bin/qorechaind start --home /var/lib/qorechaind
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now qorechaind
sudo journalctl -u qorechaind -f
```

---

## Collegamento alla rete

### 1. Inizializzazione

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

### 2. Recupera il manifest

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

Usa questo file come fonte per i valori di binario, genesis e peer nei passaggi seguenti — controlla `jq -r .minCompatible latest.json` ma ricorda che il **limite minimo v3.1.94** indicato sopra resta valido anche se quel campo è in ritardo.

### 3. Scarica e verifica il genesis

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -

# Verifica incrociata rispetto al genesis servito live dalla chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 4. Configura i peer e il floor delle fee

Leggi i peer e i seed correnti dal manifest invece di inserirli fissi negli script — ID nodo e host cambiano periodicamente:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Apri `~/.qorechaind/config/config.toml` e imposta `persistent_peers` (e `seeds`) su questi valori:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Poi imposta il prezzo minimo del gas in `~/.qorechaind/config/app.toml` (floor delle fee di rete: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### 5. Avvia la sincronizzazione

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## Avvio rapido (Fast Bootstrap)

La sincronizzazione dal genesis può richiedere molto tempo. Per le integrazioni, usa lo **state sync** oppure uno **snapshot** per un avvio a freddo rapido.

### State sync

Lo state sync recupera uno snapshot recente dello stato dell'applicazione da server RPC affidabili invece di rieseguire ogni blocco. Configura la sezione `[statesync]` in `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Prendi `trust_height` / `trust_hash` dal campo `stateSync` del manifest — viene aggiornato ogni ora, quindi è la fonte preferita:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

In alternativa/come fallback, puoi derivare tu stesso un'altezza e un hash affidabili dall'RPC pubblico:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### Ripristino da snapshot

In alternativa, scarica lo snapshot dei dati della chain pubblicato, verificane il checksum ed estrailo sopra la tua directory dati. Il manifest non include attualmente un puntatore allo snapshot, quindi controlla l'elenco live su [download.qore.host](https://download.qore.host) per il nome file e il checksum correnti, invece di inserirli fissi:

```bash
# Sostituisci con il nome file e il checksum correnti dall'elenco su download.qore.host
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # confronta con il checksum pubblicato insieme allo snapshot

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Gli snapshot sono pubblicati con **nomi file che riportano l'altezza di blocco** e cambiano regolarmente — controlla [download.qore.host](https://download.qore.host) per lo snapshot più recente e il suo checksum SHA-256, e verifica sempre prima di estrarre. Ricorda che il **minimo v3.1.94** indicato sopra si applica anche al replay da uno snapshot.
:::

---

## Pruning e indicizzazione

Regola il pruning e l'indicizzazione delle transazioni in base alla tua integrazione. Gli exchange che necessitano dello storico completo delle transazioni dovrebbero eseguire con pruning minimo e indexer delle transazioni abilitato.

### Pruning (`app.toml`)

```toml
# Mantiene solo lo stato recente — minimo ingombro su disco
pruning = "default"

# Mantiene tutto — richiesto per query archive / storiche complete
# pruning = "nothing"
```

| `pruning`   | Comportamento                                | Caso d'uso                          |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | Mantiene lo stato recente, elimina il resto      | Nodo RPC, lookup di saldo/stato   |
| `nothing`   | Mantiene tutto lo stato storico               | Nodo archive, storico completo      |
| `custom`    | Valori di keep/interval definiti dall'operatore    | Retention personalizzata                   |

### Indicizzazione delle transazioni (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Imposta `indexer = "kv"` (o un indexer più ricco) in modo che le transazioni siano interrogabili per hash ed evento — essenziale per gli exchange che riconciliano depositi e prelievi. Imposta `indexer = "null"` solo se non hai bisogno di query storiche sulle transazioni.

---

## Esposizione degli endpoint per l'integrazione

Abilita e collega i server API di cui gli integratori hanno bisogno in `app.toml`:

```toml
[api]
enable = true
address = "tcp://0.0.0.0:1317"

[grpc]
enable = true
address = "0.0.0.0:9090"

[json-rpc]
enable = true
address = "0.0.0.0:8545"
ws-address = "0.0.0.0:8546"
api = "eth,net,web3,qor"
```

E il listener RPC in `config.toml`:

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| Endpoint     | Porta   | Utilizzo                                                |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | Trasmissione di transazioni, interrogazione di blocchi/stato      |
| REST         | `1317`  | Query HTTP dello stato della chain                            |
| gRPC         | `9090`  | Accesso programmatico ad alto throughput                    |
| EVM JSON-RPC | `8545`  | Integrazioni compatibili con Ethereum (chain ID `9801`)     |
| EVM WS       | `8546`  | Sottoscrizioni di eventi EVM                            |
| SVM RPC      | `8899`  | Integrazioni compatibili con Solana                         |

:::warning
Non esporre mai RPC, EVM JSON-RPC o gRPC direttamente su internet pubblico senza un reverse proxy, rate limiting, autenticazione e un firewall. Effettua il bind su `0.0.0.0` solo dietro un livello di ingress controllato.
:::

---

## Monitoraggio di salute e sincronizzazione

### Stato di sincronizzazione

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — ancora in sincronizzazione.
* `false` — completamente sincronizzato e in servizio con lo stato corrente.

```bash
# Altezza più recente e rete
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

Il campo `network` dovrebbe riportare `qorechain-vladi` (mainnet) o `qorechain-diana` (testnet).

### Prometheus e Grafana

QoreChain espone metriche Prometheus sulla porta **26660**:

```
http://localhost:26660/metrics
```

Raccogli queste metriche con qualsiasi collector compatibile con Prometheus. Se esegui lo stack di monitoraggio di Docker Compose, Grafana è disponibile su `http://localhost:3001` — imposta le tue credenziali al primo accesso. Monitora il ritardo dell'altezza di blocco, il conteggio dei peer e l'utilizzo delle risorse; genera un alert quando `catching_up` resta `true` o il conteggio dei peer scende a zero.

### Verifica dell'endpoint EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Atteso "0x2649" (9801) su mainnet
```

---

## Best practice operative

1. **Fissa la versione della chain.** Esegui il tag live (**v3.1.95** su mainnet) e segui le release ufficiali per gli aggiornamenti coordinati.

2. **Esegui nodi ridondanti.** Gestisci almeno due nodi dietro un load balancer in modo che un singolo riavvio o una risincronizzazione non interrompano il traffico di integrazione.

3. **Verifica genesis e snapshot.** Convalida sempre lo SHA-256 del genesis e il checksum di qualsiasi snapshot rispetto alla release ufficiale prima di avviare.

4. **Proteggi gli endpoint pubblici.** Metti RPC/EVM/gRPC dietro un reverse proxy, rate limiting e un firewall. Non esporre mai su internet un RPC di scrittura non autenticato.

5. **Adatta il pruning alle esigenze.** Usa `pruning = "nothing"` insieme a `tx_index = "kv"` per gli exchange che riconciliano lo storico completo di depositi/prelievi; usa `default` per lookup leggeri.

6. **Monitora costantemente la sincronizzazione.** Genera alert su ritardo dell'altezza di blocco, zero peer e un nodo bloccato in `catching_up`.

Per un accesso in lettura ultra-leggero senza eseguire un nodo completo, vedi la documentazione del **Light Node**.

---

## Risoluzione dei problemi

### Un nodo bloccato prima dell'upgrade non riprende dopo la sostituzione del binario

Se il tuo nodo era già bloccato o fermo **prima** di aver aggiornato il suo binario, sostituire semplicemente il nuovo binario e riavviare non è sufficiente — il nodo ha risultati ABCI obsoleti in cache dall'esecuzione precedente e non rieseguirà il blocco che ha causato il blocco. Effettua un rollback esplicito prima di riavviare:

```bash
qorechaind rollback --home <HOME>
systemctl restart <unit>
```

Il comando è `qorechaind rollback` (un sottocomando di primo livello) — non esiste un sottocomando `comet rollback` né un flag `--hard` per esso.

### Il ripristino da snapshot va in crash-loop per un `priv_validator_state.json` mancante

Un archivio/snapshot pubblicato **non** include `data/priv_validator_state.json`, e il nodo si rifiuta di avviarsi senza di esso. Se manca dopo un ripristino da snapshot, crealo — ma **solo se non esiste già**. Non sovrascrivere mai uno reale: su un validator questo file è la protezione anti-double-signing, e sovrascriverlo rischia un double-sign.

```bash
echo '{"height":"0","round":0,"step":0}' > <HOME>/data/priv_validator_state.json
```

---

## Prossimi passi

* [Connettersi alla Mainnet](/getting-started/connecting-to-mainnet) — Genesis, peer e dettagli di connessione della mainnet
* [Esecuzione di un Validator](/developer-guide/running-a-validator) — Aggiungi i compiti di produzione dei blocchi
* [Compilazione dal codice sorgente](/developer-guide/building-from-source) — Compila il binario `qorechaind`
* **Light Node** — Accesso in sola lettura ultra-leggero (documentazione in arrivo)
