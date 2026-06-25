---
slug: /light-node/ux-edition
title: UX Edition (Web Dashboard)
sidebar_label: UX Edition
sidebar_position: 3
---

# UX Edition — Web Dashboard

The **UX (User eXperience)** edition runs the same light node daemon as the SX edition, but adds an **embedded web dashboard** so you can watch the node and the network in a browser. The binary is `lightnode-ux`. Like the SX edition, this is the light node's **v3.1.1** line (its own version, separate from the chain version).

The UX edition is the right choice for desktop use and for operators who prefer a visual interface over the command line.

## Install

### Build from source

The UX edition requires **Go 1.26.1** and builds with CGO enabled for the post-quantum native library:

```bash
CGO_ENABLED=1 go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

This produces `build/lightnode-ux`.

### Docker

The UX service builds from `Dockerfile.ux`:

```bash
docker compose up lightnode-ux
```

The UX container persists data in a named volume at `/root/.qorechain-lightnode` and reads the chain RPC address from the `QORECHAIN_RPC_ADDR` environment variable.

## Run

Start the UX node:

```bash
build/lightnode-ux start
```

This launches the daemon and the embedded dashboard server together. The UX edition always enables the dashboard. On startup the binary prints the dashboard URL.

The UX edition shares its setup with the SX edition: it reads the same `config.toml` from `~/.qorechain-lightnode` and uses the same Dilithium-5 keyring. If you have not configured the node yet, run the SX wizard first (`lightnode-sx onboard`) to write the config and import or generate your key — see [SX Edition](/light-node/sx-edition).

## The web dashboard on port 8420

The dashboard is exposed on **port 8420**. That is the port the `lightnode-ux` Docker image declares (`EXPOSE 8420`) and the default the binary binds to, so when running in Docker the dashboard is published on `8420`:

```
http://localhost:8420
```

:::caution Check your compose port mapping
Some prose elsewhere references port 8080 for the dashboard. The authoritative value is **8420** — that is what the image actually exposes and what the daemon binds by default. If you adapt your own `docker-compose.yml` or a reverse proxy, map to **8420**, not 8080.
:::

## What the dashboard shows

The dashboard is organized into the following views:

- **Overview** — block height and at-a-glance node status.
- **Validators** — the bonded validator set.
- **Delegation** — your current delegations and their split.
- **Network** — live network telemetry and recently synced headers.
- **Bridge** — cross-chain bridge telemetry.
- **Tokenomics** — token economics telemetry.
- **Settings** — the node's effective configuration.

Telemetry updates in real time, with the daemon refreshing validators, network, bridge, and tokenomics data on independent intervals (configurable under `[telemetry]` in `config.toml`).

### Local-only banner

If the node has **no chain RPC endpoint configured**, the dashboard runs in **local-only mode** and shows a prominent banner explaining the state: the PQC stack is verified, but the node is not syncing any chain, so the block height stays at `0`. The banner prompts you to run the onboarding wizard on the host:

```bash
lightnode-sx onboard
```

The wizard runs the PQC self-test, asks for your chain endpoint, and imports or generates your validator key. Once an endpoint is configured, restart the node and the dashboard begins showing live chain data.

## Where to go next

- [Registration and Licensing](/light-node/registration-and-licensing) — register the node on-chain.
- [Rewards and Monitoring](/light-node/rewards-and-monitoring) — earn the 3% light-node share and monitor node health.
