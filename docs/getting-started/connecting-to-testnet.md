---
slug: /getting-started/connecting-to-testnet
title: Connecting to Testnet
sidebar_label: Connecting to Testnet
sidebar_position: 4
---

# Connecting to Testnet

Join the live QoreChain Diana testnet by configuring your node with the correct genesis file, peers, and network settings.

:::note
This page covers the **`qorechain-diana`** testnet (EVM chain ID **9800**). Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) has been live since 7 June 2026 and has its own dedicated **Connecting to Mainnet** page with separate genesis, peers, and connection details.
:::

## Public Endpoints

If you only need to **query the testnet or broadcast transactions**, use the public endpoints:

| Service | URL |
|---|---|
| Consensus RPC | `https://rpc-testnet.qore.host` (WebSocket: `wss://rpc-testnet.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` (chain ID `9800`) |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (read-only) | `https://svm-testnet.qore.host` |
| Block explorer | [explore.qore.network](https://explore.qore.network) (toggle to Testnet) |

Testnet QOR is available from the [Dashboard Faucet](/dashboard/faucet).

---

## Download Genesis

Replace your local genesis file with the official testnet genesis, served live by the chain itself:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' \
  > ~/.qorechaind/config/genesis.json
```

This file defines the initial state of the Diana testnet, including the validator set, token allocations, and module parameters.

:::caution
The Diana testnet is periodically **re-genesised** (reset to height 0) as pre-release builds roll out. If your node stops syncing after a reset, re-download the genesis and start from a fresh data directory.
:::

---

## Configure Peers

Edit your node configuration to connect to existing testnet peers.

Query a current peer directly from the network, then set the `persistent_peers` field in `~/.qorechaind/config/config.toml`:

```bash
# node id + listen address of the public testnet node
curl -s https://rpc-testnet.qore.host/status | jq -r '.result.node_info.id'
```

Also set the fee floor in `~/.qorechaind/config/app.toml` (the testnet uses the same **0.1uqor** minimum gas price as mainnet):

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

These values are tuned for the Diana testnet's block times and throughput.

---

## Start Node

Launch your node to begin syncing with the network:

```bash
./qorechaind start
```

The node connects to peers and begins downloading blocks from genesis. Initial sync time depends on the current chain height and your network speed.

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

| Port    | Protocol  | Description                                        |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — query and broadcast transactions             |
| `26656` | TCP       | P2P — peer-to-peer network communication           |
| `1317`  | HTTP      | REST API — query chain state via HTTP              |
| `9090`  | gRPC      | gRPC API — programmatic chain access               |
| `8545`  | HTTP      | EVM JSON-RPC — Ethereum-compatible RPC (chain ID `9800`) |
| `8546`  | WebSocket | EVM WebSocket — real-time EVM event subscriptions  |
| `8899`  | HTTP      | SVM RPC — Solana-compatible RPC                    |
| `26660` | HTTP      | Prometheus metrics endpoint                        |

---

## Next Steps

* [Wallet Setup](/getting-started/wallet-setup) — Configure a wallet for the testnet
* [Your First Transaction](/getting-started/first-transaction) — Send your first QOR transfer
