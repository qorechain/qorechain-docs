---
slug: /light-node/ux-edition
title: UX Edition (Web Dashboard)
sidebar_label: UX Edition
sidebar_position: 3
---

# UX Edition — Web Dashboard

The **UX (User eXperience)** edition runs the same light node daemon as the SX edition, but adds an **embedded web dashboard** so you can watch the node and the network in a browser. The binary is `lightnode-ux`. Like the SX edition, it is on the light node's own version line, separate from the chain version (both networks' channels carry 3.1.12 on 27 October 2026).

The UX edition is the right choice for desktop use and for operators who prefer a visual interface over the command line.

## Install

Prebuilt binaries run natively on **six platforms with zero native dependencies** — Linux (amd64, arm64), macOS (Intel, Apple Silicon), and Windows (amd64, arm64) — each about 13 MB. Verify the download's checksum against the manifest before running it — see [SX Edition](/light-node/sx-edition#install) for how.

### Build from source

The UX edition requires **Go 1.26.1**. Its post-quantum cryptography is a pure-Go implementation (no CGO, no native library):

```bash
go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Build from the release tag the manifest names (`git checkout v3.1.12` today). This produces `build/lightnode-ux`.

### Docker

The UX service runs the public image `ghcr.io/qorechain/qorechain-lightnode-ux` (tags `latest` and `v<version>`, for example `v3.1.12`), pulled by the `docker-compose.yml` on the `main` branch of `github.com/qorechain/qorechain-lightnode`; if the registry is not reachable, compose builds `Dockerfile.ux` from source. The container needs a `config.toml` in its data volume before it will start. The UX binary has the setup commands, so you can create it in the volume:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

docker compose pull

docker compose run --rm lightnode-ux onboard
docker compose run --rm lightnode-ux keys add-operator --recover   # to register this node
docker compose run --rm lightnode-ux register --delegate-to qorvaloper1...
```

Inside a container the dashboard must listen on all container interfaces, so set this in that config (`/root/.qorechain-lightnode/config.toml` in the volume):

```toml
[dashboard]
bind_addr = "0.0.0.0:8420"
```

The compose file publishes the port on the host's loopback only (`127.0.0.1:8420:8420`), so the dashboard is not reachable from other machines. Keep it that way: the dashboard has no login (see below).

```bash
docker compose up -d lightnode-ux
```

The UX container persists data, including the keyring, in a named volume at `/root/.qorechain-lightnode` and reads the chain RPC address from the `QORECHAIN_RPC_ADDR` environment variable. The node signs its own transactions, so a UX container can register and send heartbeats like the SX edition. The UX image does not include `qorechaind`, so the `qorechaind` fallback is not available in it. To update, run `docker compose pull && docker compose up -d` (the node announces new releases but does not replace itself in a container).

## Run

Start the UX node:

```bash
build/lightnode-ux start
```

This launches the daemon and the embedded dashboard server together. The UX edition always enables the dashboard. On startup the binary prints the dashboard URL.

The UX edition shares its setup with the SX edition: it reads the same `config.toml` from `~/.qorechain-lightnode` and uses the same keyring, and it has the same commands (`onboard`, `keys`, `register`, `status`, `selftest` and the rest). The first-time setup is the same five steps, with `lightnode-ux` in place of `lightnode-sx`:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-ux onboard
lightnode-ux keys add-operator --recover
lightnode-ux register --delegate-to qorvaloper1...
lightnode-ux start
```

See [SX Edition](/light-node/sx-edition#first-run-onboard) for what each command does and [Registration and Licensing](/light-node/registration-and-licensing) for the requirements. The daemon inside the UX edition signs and sends heartbeats the same way as the SX edition, on Linux, macOS and Windows. When `register` is run from the UX binary, the node is registered with type `ux`.

## The web dashboard on port 8420

The dashboard is exposed on **port 8420**. That is the port the `lightnode-ux` Docker image declares (`EXPOSE 8420`) and the default the binary binds to, so when running in Docker the dashboard is published on `8420`:

```
http://localhost:8420
```

:::caution Check your compose port mapping
Some prose elsewhere references port 8080 for the dashboard. The authoritative value is **8420** — that is what the image actually exposes and what the daemon binds by default. If you adapt your own `docker-compose.yml` or a reverse proxy, map to **8420**, not 8080.
:::

:::caution Protect the dashboard
The dashboard has no login. Unless you set `[dashboard] token`, anyone who can reach port 8420 can read your configuration, delegations, and rewards; no private key is ever served. With a token set, every `/api` route and the `/ws` connection require `Authorization: Bearer <token>` (the token QoreX sends when it pairs with the node); over plain `http` that token crosses the network in the clear. The binary now **defaults to loopback only** (`127.0.0.1:8420`) rather than all interfaces, and prints a warning at startup if you've configured it to listen more widely — but the warning is not a refusal. If you deliberately widen the bind (for example to reach it from another machine, or because you're publishing the port from Docker), set a token and put it behind https (a reverse proxy or an SSH tunnel) rather than exposing it directly. The WebSocket telemetry connection also checks the browser's `Origin`, since a wide network bind alone doesn't stop another page open in the same browser from connecting.
:::

## What the dashboard shows

The dashboard is organized into the following views:

- **Overview** — block height and at-a-glance node status.
- **Validators** — the bonded validator set.
- **Delegation** — the delegations mirrored from your operator account (`operator_address`).
- **Network** — live network telemetry and recently synced headers.
- **Bridge** — cross-chain bridge telemetry.
- **Tokenomics** — token economics telemetry.
- **Settings** — the node's effective configuration.

From light node 3.1.11 the dashboard shows a banner when the node finds a newer release (see [SX Edition: updating](/light-node/sx-edition#updating)). Its local API serves the same information at `GET /api/update`.

Telemetry updates in real time, with the daemon refreshing validators, network, bridge, and tokenomics data on independent intervals (configurable under `[telemetry]` in `config.toml`).

### Local-only banner

If the node has **no chain RPC endpoint configured**, the dashboard runs in **local-only mode** and shows a prominent banner explaining the state: the PQC stack is verified, but the node is not syncing any chain, so the block height stays at `0`. The banner prompts you to run the onboarding wizard on the host (it names `lightnode-sx`; `lightnode-ux onboard` does the same):

```bash
lightnode-sx onboard
```

The wizard runs the PQC self-test, asks for your chain endpoint, and imports or generates your node key. Once an endpoint is configured, restart the node and the dashboard begins showing live chain data.

## Where to go next

- [Registration and Licensing](/light-node/registration-and-licensing) — register the node on-chain.
- [Rewards and Monitoring](/light-node/rewards-and-monitoring) — how the 3% light-node share is credited and claimed, and how to monitor node health.
