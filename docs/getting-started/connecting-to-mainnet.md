---
slug: /getting-started/connecting-to-mainnet
title: Connecting to Mainnet
sidebar_label: Connecting to Mainnet
sidebar_position: 3
---

# Connecting to Mainnet

Join the live QoreChain Vladi mainnet by configuring your node with the official genesis file, peers, and network settings.

:::note
This page covers the **`qorechain-vladi`** mainnet (EVM chain ID **9801**, hex `0x2649`), live since **7 June 2026 23:59 UTC** running chain version **v3.1.92** on Cosmos SDK v0.53. For the **`qorechain-diana`** testnet (EVM chain ID **9800**), see [Connecting to Testnet](/getting-started/connecting-to-testnet) and rehearse your setup there before going live.
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

The canonical source of truth for the current binary is the **mainnet manifest**, a JSON file refreshed live at `https://download.qore.host/mainnet/latest.json`. It carries the current binary URL and SHA-256, the current genesis URL/SHA-256/size, the current peers and seeds, the P2P port, a state-sync trust point, and the minimum compatible chain version. Fetch it and use its values rather than hardcoding a binary version or checksum in your install scripts — those go stale as soon as a new release ships:

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

The bundle contains `qorechaind` plus its required shared libraries (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`).

:::caution Keep your node current — v3.1.92 or later required for a fresh sync
Full nodes must track the network's live chain version — always install the binary the manifest points to, don't pin an old one. Separately from the manifest's `minCompatible` field, **v3.1.92 or later is required for a node that is joining fresh (from genesis) or recovering from a halt** — earlier versions cannot complete a full sync due to a now-fixed gas-metering bug that halts replay at the first block containing a transaction. A node already caught up and running an earlier version should still upgrade at the next opportunity, since an outdated node cannot decode newer transaction types and will stop syncing once one appears in a block.

**Check what the manifest is actually serving before you trust it.** The manifest is promoted deliberately — testnet first, mainnet after a soak period — so it can lag behind the version floor above; at the time of writing the mainnet manifest itself still points to a pre-v3.1.92 binary, which is exactly the build this caution says not to use for a fresh sync. Compare the manifest's `"version"` field against v3.1.92 before relying on its `binary.url`; if it's still behind, get v3.1.92 (or later) from the [qorechain-core GitHub releases](https://github.com/qorechain/qorechain-core/releases) instead (verify the tag's checksum the same way), or [build from source](/developer-guide/building-from-source).
:::

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

Replace your local genesis file with the official mainnet genesis, using the URL and SHA-256 from the manifest fetched above:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

The same file is also served live by the chain itself — you can cross-verify the download against it:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

This file defines the initial state of the Vladi mainnet, including the genesis validator set, token allocations (TGE at genesis), and module parameters.

---

## Configure Peers

Edit your node configuration to connect to the public mainnet sentry nodes. Read the current peer and seed lists from the manifest rather than hardcoding node IDs and hosts — these rotate:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Open `~/.qorechaind/config/config.toml` and set the `persistent_peers` (and `seeds`) fields to those values:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
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

## Fast Bootstrap (Snapshot or State Sync)

Syncing from genesis can take a long time. The manifest's `stateSync` field carries a trust height/hash pair refreshed hourly — use it to configure state sync rather than looking up a height manually:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Then set the `[statesync]` section of `config.toml` with those values — see [Running a Node](/developer-guide/running-a-node) for the full workflow, including a manual RPC-based fallback if you need to derive a trust point yourself.

A chain-data snapshot is also published at [download.qore.host](https://download.qore.host). Check the current listing there for the latest snapshot filename and its published checksum — don't hardcode a filename or height, since a new snapshot supersedes the old one on a regular basis:

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

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
| Chain version     | v3.1.92                                |
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
