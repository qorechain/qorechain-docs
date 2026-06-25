---
slug: /developer-guide/running-a-node
title: Running a Node
sidebar_label: Running a Node
sidebar_position: 9
---

# Running a Node

This guide covers running a **node-only** QoreChain deployment — a full or RPC node that syncs the chain and exposes endpoints for integration, **without** validator duties. It targets exchanges (CEX), wallet backends, indexers, and integrators who need reliable read/write access to the network but do not sign blocks.

:::note
For block production, staking, slashing, and pool classification, see [Running a Validator](/developer-guide/running-a-validator) instead. A node-only deployment never holds a validator consensus key and never appears in the active set.
:::

:::warning
Mainnet seed nodes, persistent peers, the genesis URL/checksum, and snapshot/state-sync RPC endpoints are published with each official mainnet release. **Obtain these current values from the official mainnet repository/release** and verify the genesis checksum before starting. The placeholders below (`<MAINNET_SEED_NODE_ID>@<host>:26656`, `<MAINNET_GENESIS_URL>`, snapshot/state-sync URLs) must be replaced with the real published values.
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

A node-only deployment with Docker Compose. Pin the image tag to the live chain version (**v3.1.70** on mainnet) and mount a persistent volume for chain data.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.70
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

### 2. Download and verify genesis

```bash
curl -o ~/.qorechaind/config/genesis.json <MAINNET_GENESIS_URL>
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

:::note
`<MAINNET_GENESIS_URL>` and `<MAINNET_GENESIS_SHA256>` are placeholders — obtain the current genesis URL and checksum from the official mainnet release/repository and verify the checksum before starting.
:::

### 3. Configure seeds and peers

Open `~/.qorechaind/config/config.toml`:

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
The seed and peer values are placeholders. Obtain the current mainnet seeds and persistent peers from the official mainnet repository/release.
:::

### 4. Start syncing

```bash
qorechaind start
```

---

## Fast Bootstrap

Syncing from genesis can take a long time. For integrations, use **state sync** or a **snapshot** for a fast cold start.

### State sync

State sync fetches a recent application state snapshot from trusted RPC servers instead of replaying every block. Configure the `[statesync]` section in `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "<STATESYNC_RPC_1>,<STATESYNC_RPC_2>"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Determine a recent trusted height and hash from a healthy RPC endpoint:

```bash
curl -s <STATESYNC_RPC_1>/block | jq '.result.block.header.height, .result.block_id.hash'
```

:::note
`<STATESYNC_RPC_1>`, `<STATESYNC_RPC_2>`, `<TRUSTED_BLOCK_HEIGHT>`, and `<TRUSTED_BLOCK_HASH>` are placeholders. Use the state-sync RPC servers published in the official mainnet release, and derive the trust height/hash from a recent block.
:::

### Snapshot restore

Alternatively, download a recent chain-data snapshot and extract it over your data directory:

```bash
curl -o snapshot.tar.lz4 <MAINNET_SNAPSHOT_URL>
lz4 -dc snapshot.tar.lz4 | tar -xf - -C ~/.qorechaind/
qorechaind start
```

:::note
`<MAINNET_SNAPSHOT_URL>` is a placeholder. Obtain snapshot URLs (and any companion checksum) from the official mainnet release/repository, and verify the checksum before extracting.
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

1. **Pin the chain version.** Run the live tag (**v3.1.70** on mainnet) and track official releases for coordinated upgrades.

2. **Run redundant nodes.** Operate at least two nodes behind a load balancer so a single restart or resync does not interrupt integration traffic.

3. **Verify genesis and snapshots.** Always validate the genesis SHA-256 and any snapshot checksum against the official release before starting.

4. **Protect public endpoints.** Front RPC/EVM/gRPC with a reverse proxy, rate limiting, and a firewall. Never expose unauthenticated write RPC to the internet.

5. **Match pruning to need.** Use `pruning = "nothing"` plus `tx_index = "kv"` for exchanges that reconcile full deposit/withdrawal history; use `default` for lightweight lookups.

6. **Monitor sync continuously.** Alert on block-height lag, zero peers, and a node stuck in `catching_up`.

For ultra-light read access without running a full node, see the **Light Node** documentation.

---

## Next Steps

* [Connecting to Mainnet](/getting-started/connecting-to-mainnet) — Mainnet genesis, peers, and connection details
* [Running a Validator](/developer-guide/running-a-validator) — Add block-production duties
* [Building from Source](/developer-guide/building-from-source) — Build the `qorechaind` binary
* **Light Node** — Ultra-light read-only access (documentation coming soon)
