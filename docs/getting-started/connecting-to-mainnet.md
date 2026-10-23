---
slug: /getting-started/connecting-to-mainnet
title: Connecting to Mainnet
sidebar_label: Connecting to Mainnet
sidebar_position: 3
---

# Connecting to Mainnet

Join the live QoreChain Vladi mainnet by configuring your node with the official genesis file, peers, and network settings.

:::note
This page covers the **`qorechain-vladi`** mainnet (EVM chain ID **9801**, hex `0x2649`), live since **7 June 2026**, running release **v3.2.4** on Cosmos SDK v0.53 since **23 October 2026** (applied at height **3,742,566** by governance proposal 13). For the **`qorechain-diana`** testnet (EVM chain ID **9800**), see [Connecting to Testnet](/getting-started/connecting-to-testnet) and rehearse your setup there before going live.
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

:::caution Keep your node current
Full nodes must track the network's live release — always install the binary the manifest points to, don't pin an old one. The current manifest is **v3.2.4** with `minCompatible` **3.2.4** and `upgradeHeight` **3,742,566**: mainnet applied v3.2.4 there on 23 October 2026 through governance proposal 13, and a node still on an older release cannot follow the chain past that height. Earlier governance upgrades on mainnet were **v3.1.94** at height 2,122,074 (the emission cap), **v3.2.0** at height 2,981,742 (the EVM authorisation window and the v2 hybrid-signature bytes), **v3.2.2** at height 3,556,788 (16 October 2026, proposal 7) and **v3.2.3** at height 3,662,051 (20 October 2026, proposal 11). v3.2.1 was a node-local release with no height. Transaction signing is unchanged in v3.2.4. A node that joins fresh needs the v3.2.4 binary the manifest names; prefer state sync (below) over replaying from genesis. The published chain-data snapshot predates all of these upgrade heights, so a node restored from it has to replay them.

Set `evm-chain-id = 9801` in `app.toml` (a different value is logged as an error) and keep the system clock NTP-synchronised: a node stops when its clock is more than 60 seconds out. Always check the manifest's `"version"` and `"minCompatible"` fields before trusting `binary.url` — the manifest is promoted deliberately (testnet first, mainnet after a soak period). Signing format, addresses, decimals, memos and fees did not change in v3.2.3 or v3.2.4.

The testnet (`qorechain-diana`) has run v3.2.4 since 19 October 2026. Never copy a binary between the two networks: always follow the manifest of the network you run.
:::

When a coordinated upgrade is scheduled, the proposal text names the height and tells you to stay on the previous release until then: the node halts at that height and you restart it on the new binary. Read the `status` of the proposal (`curl -s https://api.qore.host/cosmos/gov/v1/proposals/<id>`) and the `version` and `upgradeHeight` fields of the [mainnet manifest](https://download.qore.host/mainnet/latest.json) before you swap any binary, and never install an upgrade binary before its height: a node that carries it early halts too. No upgrade is scheduled (checked 23 October 2026; `curl -s https://api.qore.host/cosmos/upgrade/v1beta1/current_plan` returns `"plan": null`).

### Build from source (development only)

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

This builds the community binary with stub keepers and no post-quantum signer, which cannot reproduce the networks' consensus state or create hybrid-signed transactions. To run a node on mainnet, install the release binary above. See [Building from Source](/developer-guide/building-from-source) for the full prerequisites (Go 1.26+, CGO, native libraries).

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

A full node does not choose the block time — validators do (mainnet currently produces a block about every 3.2 seconds). Leave the consensus timeouts at their defaults unless you operate a validator and have been given values by the validator group. A useful mempool setting for a public RPC node, in `config.toml`:

```toml
[mempool]
size = 5000
```

---

## Fast Bootstrap (Snapshot or State Sync)

Syncing from genesis can take a long time. The manifest's `stateSync` field carries a trust height/hash pair refreshed hourly — use it to configure state sync rather than looking up a height manually:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Then set the `[statesync]` section of `config.toml` with those values — see [Running a Node](/developer-guide/running-a-node) for the full workflow, including a manual RPC-based fallback if you need to derive a trust point yourself.

A chain-data snapshot is also listed in the manifest (`snapshot.url`, `snapshot.sha256`, `snapshot.height`). Read the values from the manifest rather than hardcoding a filename or height, since a new snapshot supersedes the old one. The snapshot is large (tens of gigabytes) and, as published in October 2026, was taken at height 1,966,629 (21 August 2026) — before every upgrade height listed above — so a node restored from it has to replay those upgrades; state sync is usually faster and avoids that:

```bash
SNAPSHOT_URL=$(jq -r .snapshot.url latest.json)
SNAPSHOT_SHA256=$(jq -r .snapshot.sha256 latest.json)

curl -fsSL "$SNAPSHOT_URL" -o snapshot.tar.gz
echo "${SNAPSHOT_SHA256}  snapshot.tar.gz" | sha256sum -c -

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
| `8899`  | HTTP      | SVM RPC — Solana-compatible RPC (reads only; the SVM transaction lane is disabled) |
| `26660` | HTTP      | Prometheus metrics endpoint                             |

---

## Network Facts

| Field             | Value                                  |
| ----------------- | -------------------------------------- |
| Chain ID          | `qorechain-vladi`                      |
| EVM chain ID      | `9801` (hex `0x2649`)                  |
| Chain version     | v3.2.4 (applied at height 3,742,566 on 23 October 2026) |
| Live since        | 7 June 2026                            |
| Block time        | about 3.2 seconds (measured average)   |
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
