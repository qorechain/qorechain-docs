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

:::caution Use the release the manifest names: v3.2.4 on both networks
A node that syncs from genesis or replays from a snapshot crosses several governance upgrades (see [Upgrades](#upgrades) below), so always install the binary the manifest points to: it carries every upgrade handler. On **mainnet** the manifest's `minCompatible` and `version` are both `3.2.4` (the coordinated upgrade applied at height 3,742,566 on 23 October 2026, governance proposal 13), so a node joining now needs v3.2.4: an older binary stops at an upgrade height it does not know. On the **testnet** they are both `3.2.4` too (applied at height 8,337,253 on 19 October 2026). Do not run a testnet binary against mainnet or the reverse: each directory carries its own release (see [Upgrades](#upgrades)). The manifest is promoted deliberately (testnet first, mainnet after a soak period), so check its `"version"` field against `minCompatible` before trusting `binary.url`.

A binary built from the public source (the community build) refuses to start on either public network (v3.2.3 and later): it cannot verify post-quantum signatures and cannot replay the networks' blocks faithfully. Use the release archive only.

Two settings matter from v3.2.1 on: keep the system clock synchronised with NTP (the node stops when its clock is more than 60 seconds out), and set `evm-chain-id` in `app.toml` (see [Node limits](#node-limits)).
:::

---

## Node vs Validator

| Aspect              | Node-only (this guide)                          | Validator                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Consensus key       | None                                            | ed25519 consensus key (must be secured)    |
| Block production    | No                                              | Yes — proposes and signs blocks            |
| Staking / slashing  | Not applicable                                  | Self-delegation, slashing risk             |
| Primary purpose     | Serve RPC/REST/gRPC/EVM (and read-only SVM) to integrations | Secure the network (staking rewards apply) |
| Public exposure     | RPC/EVM endpoints typically exposed             | Validator hidden behind sentry nodes       |

---

## Target Networks

| Network  | Chain ID            | EVM chain ID         | Notes                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Primary — live since 7 Jun 2026; node release v3.2.4 (since 23 Oct 2026) |
| Testnet  | `qorechain-diana`   | `9800`               | Rehearse integrations here first; node release v3.2.4 (since 19 Oct 2026) |

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

A node-only deployment with Docker Compose. There is no publicly published `qorechaind` image to pull (nothing is published under the project's Docker Hub organisation). The `Dockerfile` in the public repository builds the **community** binary (no post-quantum library, stub keepers): that is suitable for local development but it cannot follow mainnet or testnet, and since v3.2.3 it refuses to start on them. For a network node, build your own image from the **release archive** named in `latest.json`, tag it to the release version (**v3.2.4** on both networks), then mount a persistent volume for chain data:

```bash
# Fetch and verify the release archive (see "Joining the Network" below for the manifest steps)
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
curl -fsSL "$(jq -r .binary.url latest.json)" -o qore.tgz
echo "$(jq -r .binary.sha256 latest.json)  qore.tgz" | sha256sum -c -
mkdir release && tar xzf qore.tgz -C release

cat > release/Dockerfile <<'EOF'
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates curl jq && rm -rf /var/lib/apt/lists/*
COPY qorechaind /usr/local/bin/qorechaind
COPY lib/ /opt/qorechain/lib/
ENV LD_LIBRARY_PATH=/opt/qorechain/lib
ENTRYPOINT ["qorechaind"]
EOF
docker build -t qorechain-node:v3.2.4 release/
```

The archive contains `qorechaind` and a `lib/` directory with its shared libraries (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`); the image above is `linux/amd64` only, like the release archive.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain-node:v3.2.4
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
      - "8899:8899"     # SVM RPC (read-only: SVM transactions are disabled)
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

Initialize the data directory once (for example `docker compose run --rm qorechain-node init my-node --chain-id qorechain-vladi --home /root/.qorechaind`; genesis and peer configuration are covered below), then start:

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

### 2. Fetch the manifest {#fetch-the-manifest}

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

Use this file as the source for the binary, genesis, and peer values in the steps below — check `jq -r .minCompatible latest.json` and run at least that release (the recommended one is `jq -r .version latest.json`).

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

`qorechaind init <moniker> --chain-id qorechain-vladi` also writes the network's EVM chain id into `app.toml` (see [Node limits](#node-limits)); check it on a home that was initialised long ago.

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

Alternatively, download the published chain-data snapshot, verify its checksum, and extract it over your data directory. On mainnet the manifest's `snapshot` object gives the URL, the block `height`, the size and the SHA-256. **The testnet manifest's snapshot URL currently returns `404` (no testnet snapshot is published), so use state sync there.** Read `snapshot.height` before using the mainnet one: it is a single archive of about 27 GB, and an old one means a long catch-up. The mainnet snapshot currently published is from 21 August 2026 (height 1,966,629): it predates the v3.1.94, v3.2.0, v3.2.2, v3.2.3 and v3.2.4 upgrade heights, so a node restored from it replays about two months of blocks with the release binary the manifest names. State sync is almost always the better choice.

```bash
SNAP_URL=$(jq -r .snapshot.url latest.json)
SNAP_SHA256=$(jq -r .snapshot.sha256 latest.json)
curl -fsSL "$SNAP_URL" -o snapshot.tar.gz
echo "${SNAP_SHA256}  snapshot.tar.gz" | sha256sum -c -

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
The manifest's `snapshot.height` and `snapshot.ts` fields say how fresh the archive is, and state sync (above) is usually faster than a 27 GB download. Always verify the checksum before extracting, and use a node release that carries every upgrade handler (see the caution at the top of this page) when replaying from a snapshot.
:::

---

## Upgrades {#upgrades}

Consensus changes arrive as **coordinated governance upgrades**: a passed proposal names a plan (for example `v3.2.3`) and a block height. The release binary carries the upgrade handlers; at the plan height every node must be running it, and a node still on the previous binary **halts at that height** (this is the intended behaviour of the upgrade module). The manifest tells you which kind a release is: `upgradeType` is `height` for a coordinated upgrade (with `upgradeHeight` set) and `rolling` for a node-local release that can be swapped node by node. Install the new binary **before** the height; if your node halted first, swap the binary and restart (see the rollback note under [Troubleshooting](#troubleshooting)).

| Release | Mainnet `qorechain-vladi` | Testnet `qorechain-diana` |
| ------- | ------------------------- | ------------------------- |
| v3.1.94 | height 2,122,074 | not applied |
| v3.2.0 | height 2,981,742 | height 5,920,000 |
| v3.2.1 | node-local, no height | node-local |
| v3.2.2 | height 3,556,788 (16 Oct 2026) | height 6,905,034 (2 Oct 2026) |
| v3.2.3 | height 3,662,051 (20 Oct 2026, governance proposal 11) | height 8,003,746 (15 Oct 2026) |
| v3.2.4 | height 3,742,566 (23 Oct 2026, governance proposal 13) | height 8,337,253 (19 Oct 2026, governance proposal 13) |

**What a node operator did for v3.2.4 (mainnet height 3,742,566).** Governance proposal 13 named the plan `v3.2.4` at height 3,742,566 (applied on 23 October 2026): nodes stayed on v3.2.3 until that height, halted there, and restarted on v3.2.4. For the next coordinated upgrade the steps are the same:

1. Watch the manifest (`https://download.qore.host/mainnet/latest.json`): until it names the new release there is nothing to install, and a binary from the testnet directory is not the mainnet release.
2. When the manifest names the release, download the archive from its `binary.url`, verify the `sha256` (the proposal text also publishes the binary's sha256), and stage it **before** the height. Check `GET /cosmos/upgrade/v1beta1/current_plan` for the pending plan (`name` and `height`) and the current height with `GET /status` on the RPC.
3. At the plan height a node still on the old binary **halts** (this is the intended behaviour of the upgrade module, not a failure); a node already on the new binary applies the upgrade handler and continues. If yours halted first, swap the binary and restart. After the upgrade, `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.4` returns the height instead of `0` (3742566 on mainnet, 8337253 on the testnet).
4. A node that joins mainnet now installs the release the manifest names (v3.2.4; check `version` against `minCompatible`).

Transaction signing, addresses, decimals, memos and fees are unchanged by v3.2.4.

Read the live record with `GET /cosmos/upgrade/v1beta1/applied_plan/<name>` (`0` = not applied) and any pending plan with `GET /cosmos/upgrade/v1beta1/current_plan`. v3.2.2 raised the consensus engine, Cosmos SDK (v0.53.8) and IBC dependencies, and the SDK's stricter transaction checks make that release replace the previous binary at the upgrade height rather than node by node. Transaction signing, addresses, decimals, memos and fees did not change in v3.2.2 or v3.2.3.

**State sync and the clock.** State sync takes its trust point from the manifest's `stateSync` block (`trustHeight`, `trustHash`, refreshed hourly); the RPC server it lists is the project's own, so for a production node add RPC servers you trust and check the trust hash against another source. Keep the clock NTP-synchronised: the node stops when it is more than 60 seconds out of step with the network.

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

### Node limits (`app.toml`) {#node-limits}

From node release v3.2.1, `init` writes a `[qorechain]` section with three node-local limits. They change only what this node keeps in memory and what it puts into the blocks it proposes, never what a block must contain to be valid:

```toml
[qorechain]
# Maximum number of Cosmos transactions held in the app-side mempool (default 5000).
# When full, a new transaction that pays more per gas evicts the lowest-paying one; otherwise it is refused.
cosmos-mempool-max-txs = 5000

# Time the node may spend selecting transactions for a proposal before it proposes what it has ("0s" disables the budget).
prepare-proposal-budget = "1s"

# Stop after this many candidates in a row that do not fit in the remaining block space (0 disables the cap).
prepare-proposal-max-skips = 64
```

`init` also writes the network's EVM chain id into the `[evm]` `evm-chain-id` setting of `app.toml` (`9801` for `--chain-id qorechain-vladi`, `9800` for `qorechain-diana`). A node whose `app.toml` carries a different value still starts, but logs an error at startup, and its own JSON-RPC (`eth_chainId`, signing against that node) answers with the wrong chain id until you correct the file; consensus is unaffected. Older binaries wrote the testnet value (`9800`) regardless of `--chain-id`, so a mainnet node initialised long ago should check this setting. Do not set `QORE_EVM_CHAIN_ID` to a value other than the network's: such a node refuses to start.

### Transaction indexing (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Set `indexer = "kv"` (or a richer indexer) so transactions are queryable by hash and event — essential for exchanges reconciling deposits and withdrawals. Set `indexer = "null"` only if you do not need historical tx queries.

---

## Exposing Endpoints for Integration {#exposing-endpoints-for-integration}

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
api = "eth,net,web3,txpool"
```

**JSON-RPC limits in node release v3.2.4.** A node running the v3.2.4 binary (testnet since 19 October 2026; mainnet since 23 October 2026) bounds its own JSON-RPC server. These are node-local settings in the `[json-rpc]` section of `app.toml` and do not affect consensus: `http-body-limit` (default 262144 bytes, 256 KiB; a larger request body is refused with HTTP 413 before it is read), `max-concurrent-requests` (default 256; requests beyond it get HTTP 503 at once) and `max-open-connections` (a missing or zero value now means 1000, not unlimited). In addition, the filter argument of `eth_getLogs` and `eth_newFilter` is refused when it lists more than 4 topic positions, more than 1000 alternatives in one position or more than 1000 addresses. An integrator that sends very large batched or contract-deployment requests to its own node should check that its largest request fits the body limit and raise it if needed.

The public endpoints serve the `eth_`, `net_`, `web3_` and `txpool_` (status only) namespaces; a node initialised by v3.2.3 or later defaults to `eth,net,web3` and leaves `txpool` out (it publishes the node's pending transactions), so add it only if you need it. The `qor_` namespace is not served by any released node build, so do not add it (see [the `qor_` namespace](/api-reference/json-rpc-qor_-namespace)).

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
| SVM RPC      | `8899`  | Solana-compatible reads (SVM transactions are disabled) |

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

The node can expose Prometheus metrics on port **26660** (set `prometheus = true` in the `[instrumentation]` section of `config.toml`):

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

1. **Pin the chain version.** Run the release the manifest recommends (**v3.2.4** on both networks), track official releases for coordinated upgrades, and keep the system clock NTP-synchronised.

2. **Run redundant nodes.** Operate at least two nodes behind a load balancer so a single restart or resync does not interrupt integration traffic.

3. **Verify genesis and snapshots.** Always validate the genesis SHA-256 and any snapshot checksum against the official release before starting.

4. **Protect public endpoints.** Front RPC/EVM/gRPC with a reverse proxy, rate limiting, and a firewall. Never expose unauthenticated write RPC to the internet.

5. **Match pruning to need.** Use `pruning = "nothing"` plus `tx_index = "kv"` for exchanges that reconcile full deposit/withdrawal history; use `default` for lightweight lookups.

6. **Monitor sync continuously.** Alert on block-height lag, zero peers, and a node stuck in `catching_up`.

A node-only deployment never signs. Transactions that your integration broadcasts through it must already carry the hybrid post-quantum signature (and, for the EVM lane, the sender needs a registered key and an open authorisation window); see [Exchange Integration](/developer-guide/exchange-integration) and [Post-Quantum Signing](/developer-guide/post-quantum-signing).

To observe the network without running a full node, see the [Light Node documentation](/light-node/overview).

---

## Troubleshooting {#troubleshooting}

### The node stops with a clock error

From node release v3.2.1 the consensus engine stops when the system clock is more than 60 seconds out of step with the network. Run an NTP client (`chrony` or `systemd-timesyncd`), confirm the clock is synchronised with `timedatectl status`, then restart the node.

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
* [Building from Source](/developer-guide/building-from-source) — Build the community `qorechaind` binary for development
* [Light Node](/light-node/overview) — Lightweight client that follows the network without a full node
