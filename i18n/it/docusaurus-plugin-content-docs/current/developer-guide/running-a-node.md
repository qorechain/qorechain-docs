---
slug: /developer-guide/running-a-node
title: Eseguire un nodo
sidebar_label: Eseguire un nodo
sidebar_position: 10
---

# Eseguire un nodo

Questa guida descrive l'esecuzione di un deployment QoreChain **solo nodo** — un full node o nodo RPC che sincronizza la chain ed espone endpoint per l'integrazione, **senza** compiti da validatore. Si rivolge a exchange (CEX), backend di wallet, indicizzatori e integratori che necessitano di un accesso affidabile in lettura/scrittura alla rete ma non firmano blocchi.

:::note
Per la produzione di blocchi, lo staking, lo slashing e la classificazione dei pool, consulta invece [Eseguire un validatore](/developer-guide/running-a-validator). Un deployment solo nodo non detiene mai una chiave di consenso da validatore e non compare mai nel set attivo.
:::

:::warning
I binari, il genesis e gli snapshot sono pubblicati su [download.qore.host](https://download.qore.host) con checksum SHA-256. **Verifica sempre i checksum prima di installare o estrarre**, e verifica i depositi solo tramite il tuo nodo sincronizzato.
:::

---

## Nodo vs validatore

| Aspetto              | Solo nodo (questa guida)                            | Validatore                                        |
| -------------------- | --------------------------------------------------- | ------------------------------------------------- |
| Chiave di consenso   | Nessuna                                              | Chiave di consenso ed25519 (da mettere in sicurezza) |
| Produzione di blocchi | No                                                  | Sì — propone e firma i blocchi                     |
| Staking / slashing   | Non applicabile                                      | Auto-delega, rischio di slashing                   |
| Scopo principale     | Servire RPC/REST/gRPC/EVM/SVM alle integrazioni      | Proteggere la rete, guadagnare ricompense          |
| Esposizione pubblica | Endpoint RPC/EVM tipicamente esposti                 | Validatore nascosto dietro sentry node             |

---

## Reti di destinazione

| Rete     | Chain ID            | Chain ID EVM         | Note                           |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Principale — live dal 7 giugno 2026 |
| Testnet  | `qorechain-diana`   | `9800`               | Prova qui le integrazioni prima |

Sostituisci il `--chain-id` appropriato per la tua rete di destinazione in tutta questa guida. Gli esempi usano la mainnet come impostazione predefinita.

---

## Hardware consigliato

| Profilo                   | CPU      | RAM   | Disco (SSD NVMe)          | Rete      |
| ------------------------- | -------- | ----- | ------------------------- | --------- |
| Nodo RPC con pruning      | 4 core   | 16 GB | 500 GB+                   | 100 Mbps+ |
| Nodo full/archive         | 8 core   | 32 GB | 2 TB+ (cresce nel tempo)  | 1 Gbps    |
| Integrazione exchange     | 8 core   | 32 GB | 2 TB+ con margine         | 1 Gbps    |

Un SSD NVMe è fortemente consigliato — lo stato della chain e gli store EVM/SVM sono intensivi in I/O. I nodi archive (nessun pruning, indicizzazione completa delle tx) crescono continuamente; dimensiona il disco con margine e monitoraggio.

---

## Deployment

### Docker Compose

Un deployment solo nodo con Docker Compose. Blocca il tag dell'immagine alla versione live della chain (**v3.1.85** su mainnet) e monta un volume persistente per i dati della chain.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.85
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

Inizializza la directory dei dati una sola volta (il genesis e la configurazione dei peer sono trattati più avanti), poi avvia:

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

### 1. Inizializza

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

### 2. Scarica e verifica il genesis

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 3. Configura i peer e il fee floor

Apri `~/.qorechaind/config/config.toml` e imposta i sentry peer pubblici della mainnet:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

Poi imposta il prezzo minimo del gas in `~/.qorechaind/config/app.toml` (fee floor della rete: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### 4. Avvia la sincronizzazione

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## Bootstrap rapido

La sincronizzazione dal genesis può richiedere molto tempo. Per le integrazioni, usa lo **state sync** o uno **snapshot** per un avvio a freddo rapido.

### State sync

Lo state sync recupera uno snapshot recente dello stato applicativo da server RPC fidati invece di rieseguire ogni blocco. Configura la sezione `[statesync]` in `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Ricava un'altezza e un hash fidati recenti dall'RPC pubblico:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### Ripristino da snapshot

In alternativa, scarica lo snapshot pubblicato dei dati della chain, verificane il checksum ed estrailo sopra la tua directory dei dati:

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Gli snapshot sono pubblicati con **nomi file che includono l'altezza del blocco** — controlla [download.qore.host](https://download.qore.host) per lo snapshot più recente e il relativo checksum SHA-256, e verifica sempre prima di estrarre.
:::

---

## Pruning e indicizzazione

Regola il pruning e l'indicizzazione delle transazioni in base alla tua integrazione. Gli exchange che necessitano dello storico completo delle transazioni dovrebbero operare con pruning minimo e un indicizzatore delle transazioni abilitato.

### Pruning (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Comportamento                                  | Caso d'uso                              |
| ----------- | ---------------------------------------------- | --------------------------------------- |
| `default`   | Mantiene lo stato recente, elimina il resto    | Nodo RPC, consultazione saldi/stato     |
| `nothing`   | Mantiene tutto lo stato storico                | Nodo archive, storico completo          |
| `custom`    | Valori keep/interval definiti dall'operatore   | Retention personalizzata                |

### Indicizzazione delle transazioni (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Imposta `indexer = "kv"` (o un indicizzatore più ricco) affinché le transazioni siano interrogabili per hash ed evento — essenziale per gli exchange che riconciliano depositi e prelievi. Imposta `indexer = "null"` solo se non hai bisogno di query storiche sulle tx.

---

## Esporre gli endpoint per l'integrazione

Abilita e associa i server API necessari agli integratori in `app.toml`:

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

| Endpoint     | Porta   | Da usare per                                            |
| ------------ | ------- | ------------------------------------------------------- |
| RPC          | `26657` | Trasmissione di transazioni, query su blocchi/stato     |
| REST         | `1317`  | Query HTTP sullo stato della chain                      |
| gRPC         | `9090`  | Accesso programmatico ad alto throughput                |
| EVM JSON-RPC | `8545`  | Integrazioni compatibili con Ethereum (chain ID `9801`) |
| EVM WS       | `8546`  | Sottoscrizioni a eventi EVM                             |
| SVM RPC      | `8899`  | Integrazioni compatibili con Solana                     |

:::warning
Non esporre mai RPC, EVM JSON-RPC o gRPC direttamente su internet pubblico senza reverse proxy, rate limiting, autenticazione e firewall. Effettua il bind su `0.0.0.0` solo dietro un layer di ingress controllato.
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

Raccogli queste metriche con qualsiasi collector compatibile con Prometheus. Se esegui lo stack di monitoraggio Docker Compose, Grafana è disponibile su `http://localhost:3001` — imposta le tue credenziali al primo accesso. Tieni traccia del ritardo dell'altezza dei blocchi, del numero di peer e dell'uso delle risorse; genera un allarme quando `catching_up` rimane `true` o il numero di peer scende a zero.

### Verifica dell'endpoint EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Best practice operative

1. **Blocca la versione della chain.** Esegui il tag live (**v3.1.85** su mainnet) e segui le release ufficiali per gli aggiornamenti coordinati.

2. **Esegui nodi ridondanti.** Opera almeno due nodi dietro un load balancer, così un singolo riavvio o una risincronizzazione non interrompe il traffico dell'integrazione.

3. **Verifica genesis e snapshot.** Valida sempre lo SHA-256 del genesis e il checksum di qualsiasi snapshot rispetto alla release ufficiale prima di avviare.

4. **Proteggi gli endpoint pubblici.** Metti RPC/EVM/gRPC dietro un reverse proxy, rate limiting e firewall. Non esporre mai su internet un RPC in scrittura senza autenticazione.

5. **Adatta il pruning alle esigenze.** Usa `pruning = "nothing"` più `tx_index = "kv"` per gli exchange che riconciliano lo storico completo di depositi/prelievi; usa `default` per consultazioni leggere.

6. **Monitora la sincronizzazione continuamente.** Genera allarmi su ritardi dell'altezza dei blocchi, zero peer e nodi bloccati in `catching_up`.

Per un accesso in sola lettura ultraleggero senza eseguire un full node, consulta la documentazione **Light Node**.

---

## Prossimi passi

* [Connessione alla mainnet](/getting-started/connecting-to-mainnet) — Genesis della mainnet, peer e dettagli di connessione
* [Eseguire un validatore](/developer-guide/running-a-validator) — Aggiungi i compiti di produzione dei blocchi
* [Compilare dai sorgenti](/developer-guide/building-from-source) — Compila il binario `qorechaind`
* **Light Node** — Accesso in sola lettura ultraleggero (documentazione in arrivo)
