---
slug: /getting-started/connecting-to-testnet
title: Connecting to Testnet
sidebar_label: Connecting to Testnet
sidebar_position: 4
---

# Connecting to Testnet

Join the live QoreChain Diana testnet by configuring your node with the correct genesis file, peers, and network settings.

:::note
This page covers the **`qorechain-diana`** testnet (EVM chain ID **9800**). Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) has been live since 7 June 2026 (release **v3.2.3**) and has its own dedicated **Connecting to Mainnet** page with separate genesis, peers, and connection details. The testnet currently runs **v3.2.4**, a testnet-only release that is not part of mainnet; its release manifest is at [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json).
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

## Install

The canonical source of truth for the current testnet binary, genesis, peers and state-sync trust point is the **testnet manifest**, refreshed live at `https://download.qore.host/testnet/latest.json`. It has the same layout as the mainnet manifest, so the install steps are the same — fetch it and use its values rather than hardcoding a version or checksum:

```bash
curl -s https://download.qore.host/testnet/latest.json -o latest.json
jq -r '.version, .minCompatible, .upgradeHeight' latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib

qorechaind init my-node --chain-id qorechain-diana
```

The testnet takes coordinated upgrades through governance proposals, so its manifest carries an `upgradeHeight` (v3.2.4 was applied at height 8,337,253 on 19 October 2026; v3.2.3 at 8,003,746 and v3.2.2 at 6,905,034 before it) and `minCompatible` equals the current version (3.2.4). A node that joins now needs the release in the manifest. Keep the system clock NTP-synchronised. The mainnet manifest points at a different release (v3.2.3), so never copy a binary between the two networks.

---

## Download Genesis

Replace your local genesis file with the official testnet genesis, using the URL and SHA-256 from the manifest fetched above:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

The same file is also served live by the chain itself:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

This file defines the initial state of the Diana testnet, including the validator set, token allocations, and module parameters.

:::note The testnet upgrades in place
Diana has been running continuously since 1 July 2026 and is upgraded through governance proposals like mainnet. The testnet is a staging network and can be reset without notice: if your node stops syncing, check the manifest and the Discord announcements, then re-download the genesis and start from a fresh data directory. The public sentry keeps only recent blocks, so a new node should state-sync (below) rather than replay from genesis.
:::

---

## Configure Peers

Read the current peer and seed lists from the manifest rather than hardcoding node IDs and hosts:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Open `~/.qorechaind/config/config.toml` and set the `persistent_peers` (and `seeds`) fields to those values:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Also set the fee floor in `~/.qorechaind/config/app.toml` (the testnet uses the same **0.1uqor** minimum gas price as mainnet):

```toml
minimum-gas-prices = "0.1uqor"
```

### Recommended Settings

A full node does not choose the block time — validators do (the testnet currently produces a block about every 1 second). Leave the consensus timeouts at their defaults unless you operate a validator and have been given values by the validator group. A useful mempool setting for a public RPC node, in `config.toml`:

```toml
[mempool]
size = 5000
```

---

## Fast Bootstrap (State Sync)

The manifest's `stateSync` field carries a trust height/hash pair refreshed regularly:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Set the `[statesync]` section of `config.toml` with those values and the `rpcServers` from the manifest — see [Running a Node](/developer-guide/running-a-node) for the full workflow.

---

## Start Node

Launch your node to begin syncing with the network:

```bash
./qorechaind start
```

The node connects to peers and begins downloading blocks (from genesis, or from the trust height if you use state sync). Initial sync time depends on the current chain height and your network speed.

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
| `8899`  | HTTP      | SVM RPC — Solana-compatible RPC (reads only; the SVM transaction lane is disabled) |
| `26660` | HTTP      | Prometheus metrics endpoint                        |

---

## Next Steps

* [Wallet Setup](/getting-started/wallet-setup) — Configure a wallet for the testnet
* [Your First Transaction](/getting-started/first-transaction) — Send your first QOR transfer
