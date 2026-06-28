---
slug: /getting-started/connecting-to-mainnet
title: Connecting to Mainnet
sidebar_label: Connecting to Mainnet
sidebar_position: 3
---

# Connecting to Mainnet

Join the live QoreChain Vladi mainnet by configuring your node with the correct genesis file, peers, and network settings.

:::note
This page covers the **`qorechain-vladi`** mainnet (EVM chain ID **9801**, hex `0x2649`), live since **7 June 2026 23:59 UTC** running chain version **v3.1.80** on Cosmos SDK v0.53. For the **`qorechain-diana`** testnet (EVM chain ID **9800**), see [Connecting to Testnet](/getting-started/connecting-to-testnet) and rehearse your setup there before going live.
:::

:::warning
Mainnet seed nodes, persistent peers, the genesis URL, and its SHA-256 checksum are published with each official mainnet release. **Always obtain these current values from the official mainnet repository/release** and verify the genesis checksum before starting. The placeholders below (`<MAINNET_SEED_NODE_ID>@<host>:26656`, genesis URL, snapshot URLs) must be replaced with the real published values — do not start a mainnet node against unverified peers or genesis.
:::

---

## Install

Install the `qorechaind` binary either by building from source or by pulling the official Docker image.

### Build from source

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

See [Building from Source](/developer-guide/building-from-source) for the full prerequisites (Go 1.26+, CGO, Rust toolchain, native libraries).

### Initialize the node

```bash
./qorechaind init my-node --chain-id qorechain-vladi
```

This creates the default configuration and data directories under `~/.qorechaind/`.

---

## Download Genesis

Replace your local genesis file with the official mainnet genesis:

```bash
curl -o ~/.qorechaind/config/genesis.json \
  <MAINNET_GENESIS_URL>
```

Verify the genesis checksum against the value published in the official mainnet release before continuing:

```bash
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

This file defines the initial state of the Vladi mainnet, including the genesis validator set, token allocations (TGE at genesis), and module parameters.

:::note
`<MAINNET_GENESIS_URL>` and `<MAINNET_GENESIS_SHA256>` are placeholders. Obtain the current genesis URL and its SHA-256 checksum from the official mainnet release/repository and verify the checksum matches before starting your node.
:::

---

## Configure Peers

Edit your node configuration to connect to existing mainnet peers.

Open `~/.qorechaind/config/config.toml` and set the `seeds` and `persistent_peers` fields:

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
The seed and persistent-peer values above are placeholders. Obtain the current mainnet seed node id, host, and port from the official mainnet repository/release. Do not connect to unverified peers.
:::

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

## Start Node

Launch your node to begin syncing with the network:

```bash
./qorechaind start
```

The node connects to peers and begins downloading blocks from genesis. Initial sync time depends on the current chain height and your network speed. For a faster bootstrap, operators typically use state sync or a recent snapshot — see [Running a Node](/developer-guide/running-a-node) for the full state-sync and snapshot workflow.

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
| Chain version     | v3.1.80                                |
| Live since        | 7 June 2026 23:59 UTC                  |
| Token             | QOR (`uqor`, 10^6 micro-units = 1 QOR) |
| Account prefix    | `qor`                                  |
| Validator prefix  | `qorvaloper`                           |
| SDK               | Cosmos SDK v0.53                       |

---

## Next Steps

* [Running a Node](/developer-guide/running-a-node) — Operate a full/RPC node for exchanges and integrators
* [Running a Validator](/developer-guide/running-a-validator) — Create and operate a validator
* [Wallet Setup](/getting-started/wallet-setup) — Configure a wallet for mainnet
* [Your First Transaction](/getting-started/first-transaction) — Send your first QOR transfer
* [Connecting to Testnet](/getting-started/connecting-to-testnet) — Join the Diana testnet for free testing
* [Networks](/appendix/networks) — Chain IDs, ports, and the full networks reference
