---
slug: /getting-started/connecting-to-mainnet
title: Connecting to Mainnet
sidebar_label: Connecting to Mainnet
sidebar_position: 3
---

# Connecting to Mainnet

Join the live QoreChain Vladi mainnet by configuring your node with the official genesis file, peers, and network settings.

:::note
This page covers the **`qorechain-vladi`** mainnet (EVM chain ID **9801**, hex `0x2649`), live since **7 June 2026 23:59 UTC** running chain version **v3.1.82** on Cosmos SDK v0.53. For the **`qorechain-diana`** testnet (EVM chain ID **9800**), see [Connecting to Testnet](/getting-started/connecting-to-testnet) and rehearse your setup there before going live.
:::

## Public Endpoints

If you only need to **query the chain or broadcast transactions**, you do not need your own node — the public endpoints are:

| Service | URL |
|---|---|
| Consensus RPC | `https://rpc.qore.host` (WebSocket: `wss://rpc.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` (chain ID `9801`) |
| SVM JSON-RPC (read-only) | `https://svm.qore.host` |
| Block explorer | [explore.qore.network](https://explore.qore.network) |

For heavy or production workloads (exchanges, indexers), run your own node as described below.

---

## Install

Install the `qorechaind` binary either from the official prebuilt bundle or by building from source.

### Prebuilt binary bundle (linux/amd64)

The official release bundle contains `qorechaind` plus its required shared libraries (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`):

```bash
curl -fsSL https://download.qore.host/qorechaind-v3.1.82-linux-amd64.tar.gz -o qore.tgz
# Verify the checksum before installing:
sha256sum qore.tgz
# 8a88936ccc6d350d8b215488a81584163b3568430064958c50e82a394077cfe9

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

Versioned bundles are published at [download.qore.host](https://download.qore.host); each release ships with its SHA-256 checksum.

### Build from source

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

See [Building from Source](/developer-guide/building-from-source) for the full prerequisites (Go 1.26+, CGO, Rust toolchain, native libraries).

### Initialize the node

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

This creates the default configuration and data directories under `~/.qorechaind/`.

---

## Download Genesis

Replace your local genesis file with the official mainnet genesis:

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json
```

The same file is also served live by the chain itself — you can cross-verify the download against it:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

This file defines the initial state of the Vladi mainnet, including the genesis validator set, token allocations (TGE at genesis), and module parameters.

---

## Configure Peers

Edit your node configuration to connect to the public mainnet sentry nodes.

Open `~/.qorechaind/config/config.toml` and set the `persistent_peers` field:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

Also set the minimum gas price in `~/.qorechaind/config/app.toml` (the network fee floor is **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### Recommended Settings

You may also want to adjust the following in `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

These values are tuned for the Vladi mainnet's block times and throughput.

---

## Fast Bootstrap (Snapshot)

Syncing from genesis can take a long time. A fresh chain-data snapshot is published at [download.qore.host](https://download.qore.host):

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
# Verify before extracting:
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

Snapshots are published under height-stamped filenames — check [download.qore.host](https://download.qore.host) for the most recent one. Alternatively use **state sync** — see [Running a Node](/developer-guide/running-a-node) for the full workflow.

---

## Start Node

Launch your node to begin syncing with the network:

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

The node connects to peers and begins downloading blocks (from genesis, or from the snapshot height if you restored one).

---

## Check Sync Status

Verify that your node is catching up to the latest block:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — The node is still syncing. Wait for it to catch up.
* `false` — The node is fully synced and processing new blocks.

You can also check the latest block height:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

Confirm you are on the right network — the `network` field should report `qorechain-vladi`:

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## Monitoring

QoreChain exposes several endpoints for monitoring node health and performance.

### Prometheus Metrics

Raw metrics are available at:

```
http://localhost:26660/metrics
```

These metrics can be scraped by any Prometheus-compatible collector.

### Grafana Dashboards

If running via Docker Compose, Grafana is available at:

```
http://localhost:3001
```

On first login, set your own credentials when prompted — do not leave the defaults in place. Pre-configured dashboards display block production, transaction throughput, peer connections, and resource usage.

### REST Health Check

The REST API provides a quick status endpoint:

```
http://localhost:1317
```

---

## Ports Reference

| Port    | Protocol  | Description                                              |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — query and broadcast transactions                  |
| `26656` | TCP       | P2P — peer-to-peer network communication                |
| `1317`  | HTTP      | REST API — query chain state via HTTP                   |
| `9090`  | gRPC      | gRPC API — programmatic chain access                    |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum-compatible RPC (chain ID `9801`) |
| `8546`  | WebSocket | EVM WebSocket — real-time EVM event subscriptions       |
| `8899`  | HTTP      | SVM RPC — Solana-compatible RPC                         |
| `26660` | HTTP      | Prometheus metrics endpoint                             |

---

## Network Facts

| Field             | Value                                  |
| ----------------- | -------------------------------------- |
| Chain ID          | `qorechain-vladi`                      |
| EVM chain ID      | `9801` (hex `0x2649`)                  |
| Chain version     | v3.1.82                                |
| Live since        | 7 June 2026 23:59 UTC                  |
| Token             | QOR (`uqor`, 10^6 micro-units = 1 QOR) |
| Minimum gas price | `0.1uqor`                              |
| Account prefix    | `qor`                                  |
| Validator prefix  | `qorvaloper`                           |
| SDK               | Cosmos SDK v0.53                       |

---

## Next Steps

* [Running a Node](/developer-guide/running-a-node) — Operate a full/RPC node for exchanges and integrators
* [Exchange & Integrator Guide](/developer-guide/exchange-integration) — Deposits, withdrawals, and monitoring
* [Running a Validator](/developer-guide/running-a-validator) — Create and operate a validator
* [Wallet Setup](/getting-started/wallet-setup) — Configure a wallet for mainnet
* [Your First Transaction](/getting-started/first-transaction) — Send your first QOR transfer
* [Connecting to Testnet](/getting-started/connecting-to-testnet) — Join the Diana testnet for free testing
* [Networks](/appendix/networks) — Chain IDs, ports, and the full networks reference
