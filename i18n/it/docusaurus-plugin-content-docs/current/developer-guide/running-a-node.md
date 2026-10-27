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

:::caution Usa la release indicata dal manifest: v3.2.4 sulla mainnet, v3.2.6 sulla testnet
Un nodo che si sincronizza dal genesis o che effettua il replay da uno snapshot attraversa diversi upgrade di governance (vedi [Upgrade](#upgrades) più sotto), quindi installa sempre il binario a cui punta il manifest: contiene tutti i gestori di upgrade. Sulla **mainnet** `minCompatible` e `version` del manifest sono entrambi `3.2.4` (l'upgrade coordinato applicato all'altezza 3.742.566 il 23 ottobre 2026, proposta di governance 13), quindi un nodo che si unisce ora richiede la v3.2.4: un binario più vecchio si ferma a un'altezza di upgrade che non conosce. La proposta di governance della mainnet 14 è nel suo periodo di votazione e applicherebbe la v3.2.5 all'altezza 3.906.833; finché non viene approvata non è pianificato alcun piano di upgrade (`current_plan` è `null` al momento della stesura, 27 ottobre 2026), e quando il manifest nomina una release più recente è quella da installare. Cosa cambia la v3.2.5 sarà documentato una volta che la mainnet l'avrà applicata. Sulla **testnet** `minCompatible` e `version` del manifest sono entrambi `3.2.6` (`upgradeHeight` 8.970.638; la v3.2.5 è stata applicata all'altezza 8.890.800 il 26 ottobre 2026 e la v3.2.6 il 27 ottobre 2026), quindi un nodo che si unisce alla testnet richiede il binario v3.2.6. Non eseguire un binario testnet contro la mainnet né il contrario: ogni directory contiene la propria release (vedi [Upgrade](#upgrades)). Il manifest viene promosso deliberatamente (prima sulla testnet, poi sulla mainnet dopo un periodo di stabilizzazione), quindi controlla il suo campo `"version"` rispetto a `minCompatible` prima di fidarti di `binary.url`.

Un binario compilato dai sorgenti pubblici (la build community) si rifiuta di avviarsi su entrambe le reti pubbliche (dalla v3.2.3 in poi): non può verificare le firme post-quantum e non può rieseguire fedelmente i blocchi delle reti. Usa solo l'archivio di release.

Dalla v3.2.1 contano due impostazioni: mantieni l'orologio di sistema sincronizzato tramite NTP (il nodo si ferma quando il suo orologio si discosta di più di 60 secondi) e imposta `evm-chain-id` in `app.toml` (vedi [Limiti del nodo](#node-limits)).
:::

---

## Nodo vs Validator

| Aspetto              | Solo nodo (questa guida)                        | Validator                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Chiave di consenso       | Nessuna                                      | Chiave di consenso ed25519 (da proteggere)    |
| Produzione blocchi    | No                                              | Sì — propone e firma i blocchi         |
| Staking / slashing  | Non applicabile                                  | Self-delegation, rischio di slashing |
| Scopo principale     | Servire RPC/REST/gRPC/EVM (e SVM in sola lettura) alle integrazioni     | Proteggere la rete (si applicano le ricompense di staking)           |
| Esposizione pubblica     | Endpoint RPC/EVM tipicamente esposti             | Validator nascosto dietro sentry node       |

---

## Reti di destinazione

| Rete  | Chain ID            | EVM chain ID         | Note                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Primaria — live dal 7 giu 2026; release del nodo v3.2.4 (dal 23 ott 2026) |
| Testnet  | `qorechain-diana`   | `9800`               | Prova qui le integrazioni per prima cosa; release del nodo v3.2.6 (dal 27 ott 2026) |

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

Un deployment solo nodo con Docker Compose. Non esiste alcuna immagine `qorechaind` pubblicata pubblicamente da scaricare (non è pubblicato nulla sotto l'organizzazione Docker Hub del progetto). Il `Dockerfile` nel repository pubblico compila il binario **community** (senza libreria post-quantum, keeper stub): è adatto allo sviluppo locale ma non può seguire la mainnet né la testnet, e dalla v3.2.3 si rifiuta di avviarsi su di esse. Per un nodo di rete, compila la tua immagine a partire dall'**archivio di release** indicato in `latest.json`, taggala con la versione della release (**v3.2.4** sulla mainnet, **v3.2.6** sulla testnet, al momento della stesura), poi monta un volume persistente per i dati della chain:

```bash
# Fetch and verify the release archive (see "Joining the Network" below for the manifest steps)
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
curl -fsSL "$(jq -r .binary.url latest.json)" -o qore.tgz
echo "$(jq -r .binary.sha256 latest.json)  qore.tgz" | sha256sum -c -
mkdir release && tar xzf qore.tgz -C release

cat > release/Dockerfile <<'EOF'
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates curl jq && rm -rf /var/lib/apt/lists/*
COPY qorechaind /usr/local/bin/qorechaind
COPY lib/ /opt/qorechain/lib/
ENV LD_LIBRARY_PATH=/opt/qorechain/lib
ENTRYPOINT ["qorechaind"]
EOF
docker build -t qorechain-node:v3.2.4 release/
```

L'archivio contiene `qorechaind` e una directory `lib/` con le sue librerie condivise (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`); l'immagine qui sopra è solo `linux/amd64`, come l'archivio di release.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain-node:v3.2.4
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
      - "8899:8899"     # SVM RPC (read-only: SVM transactions are disabled)
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

Inizializza una volta la directory dei dati (per esempio `docker compose run --rm qorechain-node init my-node --chain-id qorechain-vladi --home /root/.qorechaind`; il genesis e la configurazione dei peer sono trattati di seguito), poi avvia:

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

### 2. Recupera il manifest {#fetch-the-manifest}

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

Usa questo file come fonte per i valori di binario, genesis e peer nei passaggi seguenti — controlla `jq -r .minCompatible latest.json` ed esegui almeno quella release (quella consigliata è `jq -r .version latest.json`).

### 3. Scarica e verifica il genesis

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -

# Cross-verify against the genesis served live by the chain:
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

`qorechaind init <moniker> --chain-id qorechain-vladi` scrive anche l'EVM chain id della rete in `app.toml` (vedi [Limiti del nodo](#node-limits)); controllalo su una home inizializzata molto tempo fa.

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

In alternativa, scarica lo snapshot dei dati della chain pubblicato, verificane il checksum ed estrailo sopra la tua directory dati. Sulla mainnet l'oggetto `snapshot` del manifest fornisce l'URL, l'altezza di blocco (`height`), la dimensione e lo SHA-256. **L'URL dello snapshot nel manifest della testnet al momento restituisce `404` (non è pubblicato alcuno snapshot della testnet), quindi usa lo state sync su quella rete.** Leggi `snapshot.height` prima di usare quello della mainnet: è un unico archivio di circa 27 GB, e uno vecchio comporta un lungo recupero. Lo snapshot della mainnet attualmente pubblicato risale al 21 agosto 2026 (altezza 1.966.629): è precedente alle altezze di upgrade v3.1.94, v3.2.0, v3.2.2, v3.2.3 e v3.2.4, quindi un nodo ripristinato da esso rieseguirà circa due mesi di blocchi con il binario di release indicato dal manifest. Lo state sync è quasi sempre la scelta migliore.

```bash
SNAP_URL=$(jq -r .snapshot.url latest.json)
SNAP_SHA256=$(jq -r .snapshot.sha256 latest.json)
curl -fsSL "$SNAP_URL" -o snapshot.tar.gz
echo "${SNAP_SHA256}  snapshot.tar.gz" | sha256sum -c -

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
I campi `snapshot.height` e `snapshot.ts` del manifest indicano quanto è recente l'archivio, e lo state sync (sopra) di solito è più veloce di un download da 27 GB. Verifica sempre il checksum prima di estrarre e usa una release del nodo che contenga tutti i gestori di upgrade (vedi l'avviso in cima a questa pagina) quando effettui il replay da uno snapshot.
:::

---

## Upgrade {#upgrades}

Le modifiche al consenso arrivano come **upgrade di governance coordinati**: una proposta approvata indica un piano (per esempio `v3.2.3`) e un'altezza di blocco. Il binario di release contiene i gestori di upgrade; all'altezza del piano ogni nodo deve eseguirlo, e un nodo ancora sul binario precedente **si ferma a quell'altezza** (è il comportamento previsto del modulo upgrade). Il manifest ti dice di che tipo è una release: `upgradeType` è `height` per un upgrade coordinato (con `upgradeHeight` impostato) e `rolling` per una release locale al nodo che può essere sostituita nodo per nodo. Installa il nuovo binario **prima** dell'altezza; se il tuo nodo si è fermato prima, sostituisci il binario e riavvia (vedi la nota sul rollback in [Risoluzione dei problemi](#troubleshooting)).

| Release | Mainnet `qorechain-vladi` | Testnet `qorechain-diana` |
| ------- | ------------------------- | ------------------------- |
| v3.1.94 | altezza 2.122.074 | non applicato |
| v3.2.0 | altezza 2.981.742 | altezza 5.920.000 |
| v3.2.1 | locale al nodo, nessuna altezza | locale al nodo |
| v3.2.2 | altezza 3.556.788 (16 ott 2026) | altezza 6.905.034 (2 ott 2026) |
| v3.2.3 | altezza 3.662.051 (20 ott 2026, proposta di governance 11) | altezza 8.003.746 (15 ott 2026) |
| v3.2.4 | altezza 3.742.566 (23 ott 2026, proposta di governance 13) | altezza 8.337.253 (19 ott 2026, proposta di governance 13) |
| v3.2.5 | proposta: la proposta di governance 14 (nel suo periodo di votazione il 27 ott 2026) la applicherebbe all'altezza 3.906.833 | altezza 8.890.800 (26 ott 2026) |
| v3.2.6 | non applicata | altezza 8.970.638 (27 ott 2026) |

**Cosa ha fatto l'operatore di un nodo per la v3.2.4 (altezza mainnet 3.742.566).** La proposta di governance 13 ha chiamato il piano `v3.2.4` all'altezza 3.742.566 (applicato il 23 ottobre 2026): i nodi sono rimasti sulla v3.2.3 fino a quell'altezza, si sono fermati lì e sono ripartiti sulla v3.2.4. Per il prossimo upgrade coordinato i passaggi sono gli stessi:

1. Controlla il manifest (`https://download.qore.host/mainnet/latest.json`): finché non nomina la nuova release non c'è nulla da installare, e un binario dalla directory della testnet non è la release della mainnet.
2. Quando il manifest nomina la release, scarica l'archivio dal suo `binary.url`, verifica lo `sha256` (anche il testo della proposta pubblica lo sha256 del binario) e preparalo **prima** dell'altezza. Controlla `GET /cosmos/upgrade/v1beta1/current_plan` per il piano in sospeso (`name` e `height`) e l'altezza corrente con `GET /status` sull'RPC.
3. All'altezza del piano un nodo ancora sul vecchio binario **si ferma** (è il comportamento previsto del modulo di upgrade, non un guasto); un nodo già sul nuovo binario applica il gestore di upgrade e prosegue. Se il tuo si è fermato per primo, sostituisci il binario e riavvia. Dopo l'upgrade, `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.4` restituisce l'altezza invece di `0` (3742566 sulla mainnet, 8337253 sulla testnet).
4. Un nodo che si unisce ora alla mainnet installa la release che il manifest nomina (v3.2.4 al momento della stesura; controlla `version` rispetto a `minCompatible`).

Firma delle transazioni, indirizzi, decimali, memo e commissioni non sono cambiati dalla v3.2.4.

Leggi il registro live con `GET /cosmos/upgrade/v1beta1/applied_plan/<name>` (`0` = non applicato) e qualsiasi piano in sospeso con `GET /cosmos/upgrade/v1beta1/current_plan`. La v3.2.2 ha aggiornato le dipendenze del motore di consenso, del Cosmos SDK (v0.53.8) e di IBC, e i controlli più severi sulle transazioni dell'SDK fanno sì che quella release sostituisca il binario precedente all'altezza di upgrade anziché nodo per nodo. Firma delle transazioni, indirizzi, decimali, memo e commissioni non sono cambiati nella v3.2.2 né nella v3.2.3.

**State sync e orologio.** Lo state sync prende il suo trust point dal blocco `stateSync` del manifest (`trustHeight`, `trustHash`, aggiornati ogni ora); il server RPC che elenca è quello del progetto stesso, quindi per un nodo di produzione aggiungi server RPC di cui ti fidi e confronta il trust hash con un'altra fonte. Mantieni l'orologio sincronizzato tramite NTP: il nodo si ferma quando è fuori sincrono di più di 60 secondi rispetto alla rete.

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

### Limiti del nodo (`app.toml`) {#node-limits}

A partire dalla release del nodo v3.2.1, `init` scrive una sezione `[qorechain]` con tre limiti locali al nodo. Cambiano solo ciò che questo nodo tiene in memoria e ciò che inserisce nei blocchi che propone, mai ciò che un blocco deve contenere per essere valido:

```toml
[qorechain]
# Maximum number of Cosmos transactions held in the app-side mempool (default 5000).
# When full, a new transaction that pays more per gas evicts the lowest-paying one; otherwise it is refused.
cosmos-mempool-max-txs = 5000

# Time the node may spend selecting transactions for a proposal before it proposes what it has ("0s" disables the budget).
prepare-proposal-budget = "1s"

# Stop after this many candidates in a row that do not fit in the remaining block space (0 disables the cap).
prepare-proposal-max-skips = 64
```

`init` scrive anche l'EVM chain id della rete nell'impostazione `evm-chain-id` della sezione `[evm]` di `app.toml` (`9801` per `--chain-id qorechain-vladi`, `9800` per `qorechain-diana`). Un nodo il cui `app.toml` contiene un valore diverso si avvia comunque, ma registra un errore all'avvio, e il suo JSON-RPC (`eth_chainId`, firma verso quel nodo) risponde con il chain id sbagliato finché non correggi il file; il consenso non è influenzato. I vecchi binari scrivevano il valore della testnet (`9800`) indipendentemente da `--chain-id`, quindi un nodo mainnet inizializzato molto tempo fa dovrebbe controllare questa impostazione. Non impostare `QORE_EVM_CHAIN_ID` su un valore diverso da quello della rete: un nodo così si rifiuta di avviarsi.

### Indicizzazione delle transazioni (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Imposta `indexer = "kv"` (o un indexer più ricco) in modo che le transazioni siano interrogabili per hash ed evento — essenziale per gli exchange che riconciliano depositi e prelievi. Imposta `indexer = "null"` solo se non hai bisogno di query storiche sulle transazioni.

---

## Esposizione degli endpoint per l'integrazione {#exposing-endpoints-for-integration}

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
api = "eth,net,web3,txpool"
```

**Limiti JSON-RPC nella release di nodo v3.2.4.** Un nodo che esegue il binario v3.2.4 (testnet dal 19 ottobre 2026; mainnet dal 23 ottobre 2026) limita il proprio server JSON-RPC. Sono impostazioni locali al nodo nella sezione `[json-rpc]` di `app.toml` e non influenzano il consenso: `http-body-limit` (default 262144 byte, 256 KiB; un corpo di richiesta più grande viene rifiutato con HTTP 413 prima di essere letto), `max-concurrent-requests` (default 256; le richieste oltre questo limite ricevono subito HTTP 503) e `max-open-connections` (un valore mancante o zero ora significa 1000, non illimitato). Inoltre, l'argomento filtro di `eth_getLogs` e `eth_newFilter` viene rifiutato quando elenca più di 4 posizioni di topic, più di 1000 alternative in una posizione o più di 1000 indirizzi. Un integratore che invia al proprio nodo richieste batch o di deploy di contratti molto grandi dovrebbe verificare che la sua richiesta più grande rientri nel limite del corpo e alzarlo se necessario.

Gli endpoint pubblici servono i namespace `eth_`, `net_`, `web3_` e `txpool_` (solo stato); un nodo inizializzato dalla v3.2.3 o successiva usa di default `eth,net,web3` e lascia fuori `txpool` (pubblica le transazioni in sospeso del nodo), quindi aggiungilo solo se ti serve. Il namespace `qor_` non è servito da nessuna build del nodo rilasciata, quindi non aggiungerlo (vedi [il namespace `qor_`](/api-reference/json-rpc-qor_-namespace)).

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
| SVM RPC      | `8899`  | Letture compatibili con Solana (le transazioni SVM sono disabilitate)                         |

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
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

Il campo `network` dovrebbe riportare `qorechain-vladi` (mainnet) o `qorechain-diana` (testnet).

### Prometheus e Grafana

Il nodo può esporre metriche Prometheus sulla porta **26660** (imposta `prometheus = true` nella sezione `[instrumentation]` di `config.toml`):

```
http://localhost:26660/metrics
```

Raccogli queste metriche con qualsiasi collector compatibile con Prometheus. Se esegui lo stack di monitoraggio di Docker Compose, Grafana è disponibile su `http://localhost:3001` — imposta le tue credenziali al primo accesso. Monitora il ritardo dell'altezza di blocco, il conteggio dei peer e l'utilizzo delle risorse; genera un alert quando `catching_up` resta `true` o il conteggio dei peer scende a zero.

### Verifica dell'endpoint EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Best practice operative

1. **Fissa la versione della chain.** Esegui la release consigliata dal manifest (**v3.2.4** sulla mainnet e **v3.2.6** sulla testnet al momento della stesura), segui le release ufficiali per gli aggiornamenti coordinati e mantieni l'orologio di sistema sincronizzato tramite NTP.

2. **Esegui nodi ridondanti.** Gestisci almeno due nodi dietro un load balancer in modo che un singolo riavvio o una risincronizzazione non interrompano il traffico di integrazione.

3. **Verifica genesis e snapshot.** Convalida sempre lo SHA-256 del genesis e il checksum di qualsiasi snapshot rispetto alla release ufficiale prima di avviare.

4. **Proteggi gli endpoint pubblici.** Metti RPC/EVM/gRPC dietro un reverse proxy, rate limiting e un firewall. Non esporre mai su internet un RPC di scrittura non autenticato.

5. **Adatta il pruning alle esigenze.** Usa `pruning = "nothing"` insieme a `tx_index = "kv"` per gli exchange che riconciliano lo storico completo di depositi/prelievi; usa `default` per lookup leggeri.

6. **Monitora costantemente la sincronizzazione.** Genera alert su ritardo dell'altezza di blocco, zero peer e un nodo bloccato in `catching_up`.

Un deployment solo nodo non firma mai. Le transazioni che la tua integrazione trasmette attraverso di esso devono già portare la firma ibrida post-quantum (e, per la lane EVM, il mittente ha bisogno di una chiave registrata e di una finestra di autorizzazione aperta); vedi [Integrazione exchange](/developer-guide/exchange-integration) e [Firma post-quantum](/developer-guide/post-quantum-signing).

Per osservare la rete senza eseguire un nodo completo, vedi la [documentazione del Light Node](/light-node/overview).

---

## Risoluzione dei problemi {#troubleshooting}

### Il nodo si ferma con un errore di orologio

A partire dalla release del nodo v3.2.1 il motore di consenso si ferma quando l'orologio di sistema si discosta di più di 60 secondi dalla rete. Esegui un client NTP (`chrony` o `systemd-timesyncd`), conferma che l'orologio sia sincronizzato con `timedatectl status`, poi riavvia il nodo.

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
* [Compilazione dal codice sorgente](/developer-guide/building-from-source) — Compila il binario `qorechaind` community per lo sviluppo
* [Light Node](/light-node/overview) — Client leggero che segue la rete senza un nodo completo
