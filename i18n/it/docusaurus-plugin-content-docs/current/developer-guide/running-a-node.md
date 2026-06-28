---
slug: /developer-guide/running-a-node
title: Eseguire un nodo
sidebar_label: Eseguire un nodo
sidebar_position: 10
---

# Eseguire un nodo

Questa guida copre l'esecuzione di un deployment QoreChain **solo nodo** — un nodo full o RPC che sincronizza la chain ed espone endpoint per l'integrazione, **senza** compiti di validatore. È rivolta a exchange (CEX), backend di wallet, indexer e integratori che hanno bisogno di accesso affidabile in lettura/scrittura alla rete ma non firmano blocchi.

:::note
Per la produzione di blocchi, lo staking, lo slashing e la classificazione dei pool, vedi invece [Running a Validator](/developer-guide/running-a-validator). Un deployment solo nodo non detiene mai una chiave di consenso del validatore e non appare mai nell'active set.
:::

:::warning
I seed node della mainnet, i persistent peer, l'URL/checksum del genesis e gli endpoint RPC di snapshot/state-sync vengono pubblicati con ogni release ufficiale della mainnet. **Ottieni questi valori correnti dal repository/release ufficiale della mainnet** e verifica il checksum del genesis prima di avviare. I segnaposto qui sotto (`<MAINNET_SEED_NODE_ID>@<host>:26656`, `<MAINNET_GENESIS_URL>`, gli URL di snapshot/state-sync) devono essere sostituiti con i valori reali pubblicati.
:::

---

## Nodo vs Validatore

| Aspetto             | Solo nodo (questa guida)                        | Validatore                                 |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Chiave di consenso  | Nessuna                                          | Chiave di consenso ed25519 (deve essere protetta) |
| Produzione di blocchi | No                                            | Sì — propone e firma blocchi               |
| Staking / slashing  | Non applicabile                                 | Auto-delega, rischio di slashing           |
| Scopo principale    | Servire RPC/REST/gRPC/EVM/SVM alle integrazioni | Proteggere la rete, guadagnare ricompense  |
| Esposizione pubblica | Endpoint RPC/EVM tipicamente esposti           | Validatore nascosto dietro nodi sentinella |

---

## Reti di destinazione

| Rete     | Chain ID            | EVM chain ID         | Note                           |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Principale — attiva dal 7 giu 2026 |
| Testnet  | `qorechain-diana`   | `9800`               | Prova prima qui le integrazioni |

Sostituisci il `--chain-id` appropriato per la tua rete di destinazione in tutta questa guida. Gli esempi assumono per impostazione predefinita la mainnet.

---

## Hardware consigliato

| Profilo                  | CPU      | RAM   | Disco (NVMe SSD)        | Rete      |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| Nodo RPC con pruning     | 4 core   | 16 GB | 500 GB+                 | 100 Mbps+ |
| Nodo full/archive        | 8 core   | 32 GB | 2 TB+ (cresce nel tempo) | 1 Gbps    |
| Integrazione exchange    | 8 core   | 32 GB | 2 TB+ con margine       | 1 Gbps    |

Un SSD NVMe è fortemente consigliato — lo stato della chain e gli store EVM/SVM sono intensivi in I/O. I nodi archive (nessun pruning, indicizzazione completa delle tx) crescono continuamente; predisponi il disco con margine e monitoraggio.

---

## Deployment

### Docker Compose

Un deployment solo nodo con Docker Compose. Fissa il tag dell'immagine alla versione di chain attiva (**v3.1.80** sulla mainnet) e monta un volume persistente per i dati della chain.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.80
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

Inizializza la directory dei dati una sola volta (genesis e configurazione dei peer sono trattati più avanti), poi avvia:

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

## Unirsi alla rete

### 1. Inizializzazione

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

### 2. Scaricare e verificare il genesis

```bash
curl -o ~/.qorechaind/config/genesis.json <MAINNET_GENESIS_URL>
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

:::note
`<MAINNET_GENESIS_URL>` e `<MAINNET_GENESIS_SHA256>` sono segnaposto — ottieni l'URL e il checksum correnti del genesis dalla release/repository ufficiale della mainnet e verifica il checksum prima di avviare.
:::

### 3. Configurare seed e peer

Apri `~/.qorechaind/config/config.toml`:

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
I valori di seed e peer sono segnaposto. Ottieni i seed e i persistent peer correnti della mainnet dal repository/release ufficiale della mainnet.
:::

### 4. Avviare la sincronizzazione

```bash
qorechaind start
```

---

## Bootstrap rapido

La sincronizzazione dal genesis può richiedere molto tempo. Per le integrazioni, usa **state sync** o uno **snapshot** per un avvio a freddo rapido.

### State sync

Lo state sync recupera uno snapshot recente dello stato dell'applicazione da server RPC affidabili invece di rieseguire ogni blocco. Configura la sezione `[statesync]` in `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "<STATESYNC_RPC_1>,<STATESYNC_RPC_2>"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Determina un'altezza e un hash affidabili recenti da un endpoint RPC integro:

```bash
curl -s <STATESYNC_RPC_1>/block | jq '.result.block.header.height, .result.block_id.hash'
```

:::note
`<STATESYNC_RPC_1>`, `<STATESYNC_RPC_2>`, `<TRUSTED_BLOCK_HEIGHT>` e `<TRUSTED_BLOCK_HASH>` sono segnaposto. Usa i server RPC di state-sync pubblicati nella release ufficiale della mainnet e ricava l'altezza/hash affidabili da un blocco recente.
:::

### Ripristino da snapshot

In alternativa, scarica uno snapshot recente dei dati della chain ed estrailo sopra la tua directory dei dati:

```bash
curl -o snapshot.tar.lz4 <MAINNET_SNAPSHOT_URL>
lz4 -dc snapshot.tar.lz4 | tar -xf - -C ~/.qorechaind/
qorechaind start
```

:::note
`<MAINNET_SNAPSHOT_URL>` è un segnaposto. Ottieni gli URL degli snapshot (e l'eventuale checksum di accompagnamento) dalla release/repository ufficiale della mainnet, e verifica il checksum prima di estrarre.
:::

---

## Pruning e indicizzazione

Regola il pruning e l'indicizzazione delle transazioni per adattarli alla tua integrazione. Gli exchange che necessitano dello storico completo delle transazioni dovrebbero funzionare con pruning minimo e un indexer delle transazioni abilitato.

### Pruning (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Comportamento                            | Caso d'uso                        |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | Mantiene lo stato recente, elimina il resto | Nodo RPC, lookup di saldi/stato   |
| `nothing`   | Mantiene tutto lo stato storico          | Nodo archive, storico completo    |
| `custom`    | Valori di mantenimento/intervallo definiti dall'operatore | Retention personalizzata |

### Indicizzazione delle transazioni (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Imposta `indexer = "kv"` (o un indexer più ricco) così che le transazioni siano interrogabili per hash ed evento — essenziale per gli exchange che riconciliano depositi e prelievi. Imposta `indexer = "null"` solo se non hai bisogno di query storiche sulle tx.

---

## Esporre gli endpoint per l'integrazione

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

| Endpoint     | Porta   | Usare per                                              |
| ------------ | ------- | ------------------------------------------------------ |
| RPC          | `26657` | Trasmissione di transazioni, query su blocchi/stato    |
| REST         | `1317`  | Query HTTP sullo stato della chain                     |
| gRPC         | `9090`  | Accesso programmatico ad alta velocità                 |
| EVM JSON-RPC | `8545`  | Integrazioni compatibili con Ethereum (chain ID `9801`) |
| EVM WS       | `8546`  | Sottoscrizioni di eventi EVM                           |
| SVM RPC      | `8899`  | Integrazioni compatibili con Solana                    |

:::warning
Non esporre mai RPC, EVM JSON-RPC o gRPC direttamente su Internet pubblica senza un reverse proxy, rate limiting, autenticazione e un firewall. Collega a `0.0.0.0` solo dietro un livello di ingress controllato.
:::

---

## Monitoraggio di salute e sincronizzazione

### Stato di sincronizzazione

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — ancora in sincronizzazione.
* `false` — completamente sincronizzato e in grado di servire lo stato corrente.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

Il campo `network` dovrebbe riportare `qorechain-vladi` (mainnet) o `qorechain-diana` (testnet).

### Prometheus e Grafana

QoreChain espone le metriche Prometheus sulla porta **26660**:

```
http://localhost:26660/metrics
```

Raccogli queste metriche con qualsiasi collector compatibile con Prometheus. Se esegui lo stack di monitoraggio Docker Compose, Grafana è disponibile su `http://localhost:3001` — imposta le tue credenziali al primo accesso. Tieni traccia del ritardo dell'altezza dei blocchi, del numero di peer e dell'uso delle risorse; attiva un allarme quando `catching_up` rimane `true` o il numero di peer scende a zero.

### Controllo dell'endpoint EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Migliori pratiche operative

1. **Fissa la versione di chain.** Esegui il tag attivo (**v3.1.80** sulla mainnet) e segui le release ufficiali per gli aggiornamenti coordinati.

2. **Esegui nodi ridondanti.** Mantieni in funzione almeno due nodi dietro un load balancer così che un singolo riavvio o resync non interrompa il traffico di integrazione.

3. **Verifica genesis e snapshot.** Convalida sempre lo SHA-256 del genesis e qualsiasi checksum di snapshot rispetto alla release ufficiale prima di avviare.

4. **Proteggi gli endpoint pubblici.** Anteponi a RPC/EVM/gRPC un reverse proxy, rate limiting e un firewall. Non esporre mai RPC di scrittura non autenticati su Internet.

5. **Adatta il pruning alle esigenze.** Usa `pruning = "nothing"` insieme a `tx_index = "kv"` per gli exchange che riconciliano lo storico completo di depositi/prelievi; usa `default` per lookup leggeri.

6. **Monitora la sincronizzazione di continuo.** Attiva allarmi per il ritardo dell'altezza dei blocchi, zero peer e un nodo bloccato in `catching_up`.

Per un accesso ultra-leggero in sola lettura senza eseguire un nodo full, vedi la documentazione **Light Node**.

---

## Prossimi passi

* [Connecting to Mainnet](/getting-started/connecting-to-mainnet) — Genesis della mainnet, peer e dettagli di connessione
* [Running a Validator](/developer-guide/running-a-validator) — Aggiungi i compiti di produzione dei blocchi
* [Building from Source](/developer-guide/building-from-source) — Compila il binario `qorechaind`
* **Light Node** — Accesso in sola lettura ultra-leggero (documentazione in arrivo)
