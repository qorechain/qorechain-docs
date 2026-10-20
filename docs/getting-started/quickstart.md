---
slug: /getting-started/quickstart
title: Quickstart
sidebar_label: Quickstart
sidebar_position: 1
---

# Quickstart

Get a QoreChain node running in minutes. Choose Docker Compose for the fastest setup, or build from source for full control.

---

## Docker Compose (Recommended)

The simplest way to run a full QoreChain environment with all services pre-configured.

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
cp .env.example .env
cp .env.sidecar.example .env.sidecar
# edit .env and set GRAFANA_PASSWORD (Compose refuses to start without it)
docker compose up -d
```

Before the first start, copy `.env.example` to `.env` and `.env.sidecar.example` to `.env.sidecar` (as above) and set `GRAFANA_PASSWORD`.

This starts the following services:

| Service            | Ports                                                                   | Description                                  |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------- |
| **qorechain-node** | `26657` (RPC), `1317` (REST), `9090` (gRPC), `8545` / `8546` (EVM) | Full blockchain node with multi-VM support   |
| **ai-sidecar**     | `50051`                                                                 | QCAI anomaly detection and risk scoring engine |
| **indexer**        | --                                                                      | Block indexer for historical queries         |
| **postgres**       | `5432`                                                                  | Database backend for the indexer             |
| **prometheus**     | `9091`                                                                  | Metrics collection                           |
| **grafana**        | `3001`                                                                  | Monitoring dashboards                        |

Once all containers are healthy you have a **local single-node development chain** (it initialises its own genesis; it does not join mainnet or the testnet). To join a live network, follow the [Connecting to Mainnet](/getting-started/connecting-to-mainnet) or [Connecting to Testnet](/getting-started/connecting-to-testnet) pages.

---

## Build from Source

### Prerequisites

* **Go 1.26+** with CGO enabled
* **Rust toolchain** (for compiling PQC cryptography and SVM runtime libraries)
* **Git**

### Build the Binary

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

:::caution A source build is for local development
The public source tree builds the community binary. It has the full command set but not the post-quantum signer: `tx pqc gen-key` and `tx pqc cosign` return an error ("requires the full build"), so it cannot create transactions for a network that requires hybrid signatures, and its stub keepers do not reproduce the networks' consensus state. To join or transact on mainnet or testnet, install the release binary named in `latest.json` under [download.qore.host](https://download.qore.host).
:::

### Initialize the Node

```bash
./qorechaind init my-node --chain-id qorechain-diana
```

This creates the default configuration and data directories under `~/.qorechaind/`. Started on its own, the node forms a local single-node chain; to join a live network follow the Connecting pages.

### Start the Node

```bash
./qorechaind start
```

The node starts with default settings. See [Connecting to Testnet](/getting-started/connecting-to-testnet) for joining the live network with proper genesis and peer configuration.

:::note
The examples on this page target the **`qorechain-diana`** testnet (EVM chain ID **9800**). Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) has been live since 7 June 2026 (release v3.2.3; the testnet runs v3.2.4) and has its own dedicated **Connecting to Mainnet** page.
:::

---

## Verify Installation

Confirm your node is running correctly:

```bash
# Check that the binary runs
./qorechaind --help
```

```bash
# Query the node status via RPC
curl localhost:26657/status
```

A successful response includes the node's `moniker`, `network` (`qorechain-diana` for the local development chain created above, or the chain you joined) and current block height.

---

## Next Steps

* [Connecting to Testnet](/getting-started/connecting-to-testnet) — Join the live Diana testnet
* [Wallet Setup](/getting-started/wallet-setup) — Configure a wallet to interact with the chain
* [Your First Transaction](/getting-started/first-transaction) — Send your first QOR transfer
* [Connecting to Mainnet](/getting-started/connecting-to-mainnet) — Join the live Vladi mainnet
* [SDK Overview](/sdk/overview) — Build applications against QoreChain from code
