---
slug: /developer-guide/running-a-node
title: Running a Node
sidebar_label: Running a Node
sidebar_position: 10
---

# Running a Node

This guide covers running a **node-only** QoreChain deployment — a full or RPC node that syncs the chain and exposes endpoints for integration, **without** validator duties. It targets exchanges (CEX), wallet backends, indexers, and integrators who need reliable read/write access to the network but do not sign blocks.

:::note
For block production, staking, slashing, and pool classification, see [Running a Validator](/developer-guide/running-a-validator) instead. A node-only deployment never holds a validator consensus key and never appears in the active set.
:::

:::warning
Binaries, genesis, and snapshots are published at [download.qore.host](https://download.qore.host) with SHA-256 checksums. **Always verify checksums before installing or extracting**, and verify deposits only against your own synced node.
:::

:::note Source of truth: the live manifest
The current binary, genesis, peers, seeds, and a state-sync trust point are published as a JSON manifest, refreshed live — don't hardcode a binary version, checksum, or snapshot filename in your install scripts, since they go stale as soon as a new release ships:

- Mainnet: `https://download.qore.host/mainnet/latest.json`
- Testnet: `https://download.qore.host/testnet/latest.json`

The manifest's fields include `binary` (url + sha256), `genesis` (url + sha256 + sizeBytes), `peers`, `seeds`, `p2pPort`, `stateSync` (a trust point refreshed hourly), and `minCompatible`. The install and join steps below fetch this manifest and use its current values.
:::

:::caution v3.1.92 or later required for a node joining fresh
A node that syncs from genesis or replays from an archive/snapshot needs to be on **v3.1.92 or later** — earlier versions (even if the manifest's `minCompatible` field hasn't been updated yet to reflect this) will halt at the first block containing a transaction during replay, due to a now-fixed gas-metering bug.

**The manifest can itself lag behind this floor** — it's promoted testnet-first, mainnet after a soak period, and at the time of writing the mainnet manifest's `binary.url` still points to a pre-v3.1.92 build. Check the manifest's `"version"` field before trusting `binary.url`; if it's behind v3.1.92, get the binary from the [qorechain-core GitHub releases](https://github.com/qorechain/qorechain-core/releases) instead (checking its published checksum the same way) or build from source, rather than the manifest.
:::

---

## Node vs Validator

| Aspect              | Node-only (this guide)                          | Validator                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Consensus key       | None                                            | ed25519 consensus key (must be secured)    |
| Block production    | No                                              | Yes — proposes and signs blocks            |
| Staking / slashing  | Not applicable                                  | Self-delegation, slashing risk             |
| Primary purpose     | Serve RPC/REST/gRPC/EVM/SVM to integrations     | Secure the network, earn rewards           |
| Public exposure     | RPC/EVM endpoints typically exposed             | Validator hidden behind sentry nodes       |

---

## Target Networks

| Network  | Chain ID            | EVM chain ID         | Notes                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Primary — live since 7 Jun 2026 |
| Testnet  | `qorechain-diana`   | `9800`               | Rehearse integrations here first |

Substitute the appropriate `--chain-id` for your target network throughout this guide. The examples default to mainnet.

---

## Recommended Hardware

| Profile                  | CPU      | RAM   | Disk (NVMe SSD)         | Network   |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| Pruned RPC node          | 4 cores  | 16 GB | 500 GB+                 | 100 Mbps+ |
| Full/archive node        | 8 cores  | 32 GB | 2 TB+ (grows over time) | 1 Gbps    |
| Exchange integration     | 8 cores  | 32 GB | 2 TB+ with headroom     | 1 Gbps    |

NVMe SSD is strongly recommended — chain state and the EVM/SVM stores are I/O intensive. Archive nodes (no pruning, full tx indexing) grow continuously; provision disk with headroom and monitoring.

---

## Deployment

### Docker Compose

A node-only deployment with Docker Compose. There is no publicly published `qorechaind` image to pull yet — build one yourself from the repository's `Dockerfile` and tag it to the live chain version (**v3.1.92** on mainnet), then mount a persistent volume for chain data:

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
docker build -t qorechain-node:v3.1.92 .
```

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain-node:v3.1.92
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

Initialize the data directory once (genesis and peer configuration are covered below), then start:

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

For a bare-metal install, run `qorechaind` under systemd:

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

## Joining the Network

### 1. Initialize

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

### 2. Fetch the manifest

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

Use this file as the source for the binary, genesis, and peer values in the steps below — check `jq -r .minCompatible latest.json` but remember the **v3.1.92 floor** above holds even if that field lags behind.

### 3. Download and verify genesis

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 4. Configure peers and the fee floor

Read the current peers and seeds from the manifest rather than hardcoding node IDs and hosts — these rotate:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Open `~/.qorechaind/config/config.toml` and set `persistent_peers` (and `seeds`) to those values:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Then set the minimum gas price in `~/.qorechaind/config/app.toml` (network fee floor: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### 5. Start syncing

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## Fast Bootstrap

Syncing from genesis can take a long time. For integrations, use **state sync** or a **snapshot** for a fast cold start.

### State sync

State sync fetches a recent application state snapshot from trusted RPC servers instead of replaying every block. Configure the `[statesync]` section in `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Take `trust_height` / `trust_hash` from the manifest's `stateSync` field — it's refreshed hourly, so it's the preferred source:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

As a fallback/alternative, you can derive a trusted height and hash yourself from the public RPC:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### Snapshot restore

Alternatively, download the published chain-data snapshot, verify its checksum, and extract it over your data directory. The manifest does not currently carry a snapshot pointer, so check the live listing at [download.qore.host](https://download.qore.host) for the current filename and checksum rather than hardcoding one:

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Snapshots are published under **height-stamped filenames** that change regularly — check [download.qore.host](https://download.qore.host) for the most recent snapshot and its SHA-256 checksum, and always verify before extracting. Remember the **v3.1.92 minimum** above applies to replay from a snapshot too.
:::

---

## Pruning and Indexing

Tune pruning and transaction indexing to match your integration. Exchanges that need full transaction history should run with minimal pruning and a transaction indexer enabled.

### Pruning (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Behaviour                                | Use case                          |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | Keeps recent state, prunes the rest      | RPC node, balance/state lookups   |
| `nothing`   | Keeps all historical state               | Archive node, full history        |
| `custom`    | Operator-defined keep/interval values    | Tuned retention                   |

### Transaction indexing (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Set `indexer = "kv"` (or a richer indexer) so transactions are queryable by hash and event — essential for exchanges reconciling deposits and withdrawals. Set `indexer = "null"` only if you do not need historical tx queries.

---

## Exposing Endpoints for Integration

Enable and bind the API servers integrators need in `app.toml`:

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

And the RPC listener in `config.toml`:

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| Endpoint     | Port   | Use for                                                |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | Broadcasting transactions, querying blocks/status      |
| REST         | `1317`  | HTTP queries of chain state                            |
| gRPC         | `9090`  | High-throughput programmatic access                    |
| EVM JSON-RPC | `8545`  | Ethereum-compatible integrations (chain ID `9801`)     |
| EVM WS       | `8546`  | EVM event subscriptions                                |
| SVM RPC      | `8899`  | Solana-compatible integrations                         |

:::warning
Never expose RPC, EVM JSON-RPC, or gRPC directly to the public internet without a reverse proxy, rate limiting, authentication, and a firewall. Bind to `0.0.0.0` only behind a controlled ingress layer.
:::

---

## Health and Sync Monitoring

### Sync status

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — still syncing.
* `false` — fully synced and serving current state.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

The `network` field should report `qorechain-vladi` (mainnet) or `qorechain-diana` (testnet).

### Prometheus and Grafana

QoreChain exposes Prometheus metrics on port **26660**:

```
http://localhost:26660/metrics
```

Scrape these with any Prometheus-compatible collector. If you run the Docker Compose monitoring stack, Grafana is available at `http://localhost:3001` — set your own credentials on first login. Track block height lag, peer count, and resource usage; alert when `catching_up` stays `true` or peer count drops to zero.

### EVM endpoint check

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Operational Best Practices

1. **Pin the chain version.** Run the live tag (**v3.1.92** on mainnet) and track official releases for coordinated upgrades.

2. **Run redundant nodes.** Operate at least two nodes behind a load balancer so a single restart or resync does not interrupt integration traffic.

3. **Verify genesis and snapshots.** Always validate the genesis SHA-256 and any snapshot checksum against the official release before starting.

4. **Protect public endpoints.** Front RPC/EVM/gRPC with a reverse proxy, rate limiting, and a firewall. Never expose unauthenticated write RPC to the internet.

5. **Match pruning to need.** Use `pruning = "nothing"` plus `tx_index = "kv"` for exchanges that reconcile full deposit/withdrawal history; use `default` for lightweight lookups.

6. **Monitor sync continuously.** Alert on block-height lag, zero peers, and a node stuck in `catching_up`.

For ultra-light read access without running a full node, see the **Light Node** documentation.

---

## Troubleshooting

### A node halted before the upgrade doesn't resume after a binary swap

If your node was already halted or stuck **before** you upgraded its binary, simply dropping in the new binary and restarting is not enough — the node has stale ABCI results cached from the old run and won't re-execute the block that caused the halt. Roll back explicitly before restarting:

```bash
qorechaind rollback --home <HOME>
systemctl restart <unit>
```

The command is `qorechaind rollback` (a top-level subcommand) — there is no `comet rollback` subcommand and no `--hard` flag for it.

### Snapshot restore crash-loops on a missing `priv_validator_state.json`

A published archive/snapshot does **not** include `data/priv_validator_state.json`, and the node refuses to start without it. If it's missing after a snapshot restore, create it — but **only if it doesn't already exist**. Never overwrite a real one: on a validator this file is the anti-double-signing guard, and clobbering it risks a double-sign.

```bash
echo '{"height":"0","round":0,"step":0}' > <HOME>/data/priv_validator_state.json
```

---

## Next Steps

* [Connecting to Mainnet](/getting-started/connecting-to-mainnet) — Mainnet genesis, peers, and connection details
* [Running a Validator](/developer-guide/running-a-validator) — Add block-production duties
* [Building from Source](/developer-guide/building-from-source) — Build the `qorechaind` binary
* **Light Node** — Ultra-light read-only access (documentation coming soon)
