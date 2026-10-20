---
slug: /light-node/overview
title: Light Node Overview
sidebar_label: Overview
sidebar_position: 1
---

# Light Node Overview

The **QoreChain Light Node** is a lightweight client that follows the QoreChain network without running a full validator or archive node. Instead of replaying every transaction, it corroborates block headers across multiple RPC endpoints, mirrors the operator account's delegations and rewards from the chain, and streams live network telemetry — all from a small, self-contained binary.

Running a light node lets you observe the network's state without the storage, bandwidth, and operational cost of a full node. Taking part in the light-node reward share is a separate, licence-gated step; registration is open on both networks — see [Status of the reward program](#reward-program-status).

## Its own version line

The light node ships on its **own version line, currently 3.1.10** (3.1.9 is still accepted), which is **distinct from the chain release version** (mainnet runs chain `v3.2.3`). Binaries for each network are published with a **SHA-256 checksum manifest** at `https://download.qore.host/<net>/lightnode/latest.json` (`<net>` is `mainnet` or `testnet`). Both channels carry the same 3.1.10 build, and both manifests set `minCompatible` to `3.1.9`, so older light-node builds should be replaced. The release has 12 binaries — SX and UX for Linux, macOS and Windows, each on amd64 and arm64 — plus a `SHA256SUMS` file. See [SX Edition](/light-node/sx-edition#install) for the download and verification steps, and [Docker](/light-node/sx-edition#docker) for building an image from the source tag `v3.1.10`.

An Android build is attached to the GitHub release as a **preview** only: it follows and verifies the chain, but it does not register and does not earn.

When you read documentation or release notes, treat the light node's version (3.1.10) and the chain's version (v3.2.3) as two separate numbers that happen to share a major series.

## Why run a light node {#why-run-a-light-node}

- **Take part in the light-node reward share.** Registered, active light nodes that meet the stake and uptime rules are eligible for the **3% light-node allocation** described below. Registration needs a `lightnode_operator` licence — see [Registration and Licensing](/light-node/registration-and-licensing). Running and syncing a node needs no licence.
- **Cross-check the chain state you're shown.** The node fetches the latest height from its primary RPC endpoint and from every configured witness endpoint in parallel, and only stores a header when they agree on the block hash — raising the bar from trusting one endpoint to needing every configured endpoint compromised at once. This is corroboration across independent sources, **not full cryptographic consensus verification** (no validator-set or commit-signature checking). Your node records which mode it is running in as the `assurance` value on each `synced header` line of its debug log (set `log_level = "debug"`); it is not shown on the node's dashboard or in `status`, and no central QoreChain service can see it, since your node's RPC choices are local to your setup. **`trusted-single-source`** is what you get with no witnesses configured — the node logs a warning at startup saying so, because an honestly-run single endpoint reports the same value a compromised one would. Add an independently-operated witness to move to `corroborated-across-sources`.
- **Keep an eye on your stake.** The node mirrors the operator account's delegations from the chain and warns when a validator you delegate to falls below a configurable reputation score. It never moves stake itself — delegation changes are made from your own wallet.
- **Watch the network live.** Real-time telemetry covers validators, consensus, the bridge, and tokenomics.
- **Post-quantum from day one.** Keys and signatures use Dilithium-5 (ML-DSA-87).

## Two editions: SX and UX

The light node comes in two editions built from the same codebase. Pick the one that matches how you want to operate the node.

| Edition | Binary | Built for | Interface |
| --- | --- | --- | --- |
| **SX — Server eXperience** | `lightnode-sx` | Headless server deployments | Full CLI (daemon + management commands) |
| **UX — User eXperience** | `lightnode-ux` | Desktop and operator use | Embedded web dashboard |

- The **SX edition** is a headless daemon with a complete management CLI. It is the right choice for servers, automation, and operators who live on the command line. See [SX Edition](/light-node/sx-edition).
- The **UX edition** runs the same daemon but adds an embedded web dashboard so you can watch telemetry, delegations, and rewards in a browser. See [UX Edition](/light-node/ux-edition).

Both editions read the same `config.toml`, store data in the same home directory (`~/.qorechain-lightnode` by default), and use the same Dilithium-5 keyring.

## The 3% light-node reward share {#the-3-light-node-reward-share}

QoreChain's fee distribution allocates a fixed **3% share to light nodes** (the `reward_share` parameter, `0.03`). See [Tokenomics](/architecture/tokenomics) for the full 37% / 30% / 20% / 10% / 3% breakdown (validators, burned, treasury, stakers, light nodes).

That 3% is what is paid into the light-node module account; it is not a per-node entitlement. Every 100 blocks the chain credits each eligible node its stake-weighted share of what has accrued since the previous settlement, **bounded per node**. Since chain v3.2.3 the bound is **2,000 QOR per node per 30 days** (`max_reward_per_month_per_node`, `2000000000` uqor), prorated over the block time elapsed since the previous settlement and scaled by the node's uptime; this is the `lightnode-monthly-cap` rule. Before v3.2.3 the bound was stated per block (`max_reward_per_block_per_node`, `1713` uqor), which the reward pool query still reports. The bound is a ceiling, not a promised amount. Anything that goes unearned is moved into a reserve that only a governance vote can release, so no pot builds up for whoever registers first. You can inspect the live split with `GET /qorechain/lightnode/v1/reward_pool`.

To be eligible for rewards a light node must be **registered on-chain, active** (proving liveness with heartbeats), hold at least the minimum bonded stake, and keep its uptime at or above the minimum. Registration and licensing are covered in [Registration and Licensing](/light-node/registration-and-licensing); how rewards are credited, claimed and monitored is covered in [Rewards and Monitoring](/light-node/rewards-and-monitoring).

## Status of the reward program {#reward-program-status}

:::note Registration is open
Registration is open on mainnet (`qorechain-vladi`, chain v3.2.3) and on testnet (`qorechain-diana`). As of October 2026 six `lightnode_operator` licences have been granted on mainnet and no light node has registered yet. The reward accounting has been live on both networks since the v3.2.0 upgrade. Running and syncing a node needs no licence, but uptime is counted **from the block your node is registered**, so running a node beforehand does not earn credit.

The release manifest (`https://download.qore.host/<net>/lightnode/latest.json`) carries the official signal in its `registration.open` field. For the live state, query `GET /qorechain/license/v1/holders/lightnode_operator` and `GET /qorechain/lightnode/v1/stats` on `https://api.qore.host` (mainnet) or `https://api-testnet.qore.host` (testnet).
:::

## Core features at a glance

- **Multi-source header corroboration** — cross-checks the latest block hash against every configured witness endpoint before trusting it, without downloading full blocks, syncing quickly even from a cold start.
- **Delegation tracking** — mirrors the operator account's delegations from the chain (read-only).
- **Opt-in auto-claim** — claims accrued light-node rewards to the operator account on a configurable interval. Off by default; it never re-delegates.
- **Reputation alerts** — warns when a validator you delegate to drops below a configurable reputation score; it does not move stake.
- **Real-time telemetry** — validators, consensus, bridge, and tokenomics, refreshed on independent intervals.
- **On-chain registration** — with heartbeat liveness proofs that keep the node eligible for rewards. Registration is licence-gated. The node signs its own transactions on Linux, macOS and Windows; no other software is needed.
- **Post-quantum cryptography** — Dilithium-5 (ML-DSA-87) keys and signatures throughout.
- **Local-only mode** — exercise the full PQC stack and run the node standalone before pointing it at a live chain.

The light node is released under the **Apache 2.0** license.

## Where to go next

- [SX Edition](/light-node/sx-edition) — install, configure, and run the server daemon.
- [UX Edition](/light-node/ux-edition) — run the web dashboard edition.
- [Registration and Licensing](/light-node/registration-and-licensing) — obtain a licence and register on-chain.
- [Rewards and Monitoring](/light-node/rewards-and-monitoring) — how the 3% share is credited and claimed, and how to keep the node healthy.
- [Tokenomics](/architecture/tokenomics) — how the light-node reward share fits the wider economy.
