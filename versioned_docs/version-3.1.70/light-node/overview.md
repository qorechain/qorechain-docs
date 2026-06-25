---
slug: /light-node/overview
title: Light Node Overview
sidebar_label: Overview
sidebar_position: 1
---

# Light Node Overview

The **QoreChain Light Node** is a lightweight client that follows the QoreChain network without running a full validator or archive node. Instead of replaying every transaction, it verifies block headers cryptographically, tracks delegations and rewards, and streams live network telemetry — all from a small, self-contained binary.

Running a light node lets you participate in the network's economics and observe its state without the storage, bandwidth, and operational cost of a full node.

## Its own version line

The light node ships on its **own version line — currently v3.1.1** — which is **distinct from the chain release version** (the chain is on a separate `v3.x` track). The light node's v3.1.1 line is aligned with `qorechain-core`: it adds a post-quantum cryptography (PQC) regression suite (keygen, sign, verify, and tamper-detection) that guards the core's signature-verification behaviour and runs it in continuous integration.

When you read documentation or release notes, treat the light node's version (v3.1.1) and the chain's version as two separate numbers that happen to share a major series.

## Why run a light node

- **Earn a share of block rewards.** Active, registered light nodes are eligible for the **3% light-node reward share** described below.
- **Verify the chain yourself.** The node performs header verification with a skipping light client, so you get cryptographic assurance of chain state without trusting a remote API.
- **Delegate and auto-compound.** Manage delegated stake across multiple validators, split by weight, and compound rewards automatically.
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

## The 3% light-node reward share

QoreChain's fee distribution allocates a fixed **3% share to light nodes** for serving network data. This is enforced on-chain as part of the protocol's reward split and is the same channel documented in the project's economics — see [Tokenomics](/architecture/tokenomics) for the full 37% / 30% / 20% / 10% / 3% breakdown (validators, burned, treasury, stakers, light nodes).

To be eligible for this share a light node must be **registered on-chain and actively proving liveness** via heartbeat proofs. Registration and licensing are covered in [Registration and Licensing](/light-node/registration-and-licensing); how the share is earned, compounded, and monitored is covered in [Rewards and Monitoring](/light-node/rewards-and-monitoring).

## Core features at a glance

- **Skipping light client** — verifies headers without downloading full blocks, syncing quickly even from a cold start.
- **Delegated staking** — stake across multiple validators with configurable split weights.
- **Auto-compound rewards** — claim and re-delegate rewards on a configurable interval.
- **Reputation-aware rebalancing** — shift delegation toward higher-reputation validators automatically.
- **Real-time telemetry** — validators, consensus, bridge, and tokenomics, refreshed on independent intervals.
- **On-chain registration** — with heartbeat liveness proofs that keep the node eligible for rewards.
- **Post-quantum cryptography** — Dilithium-5 (ML-DSA-87) keys and signatures throughout.
- **Local-only mode** — exercise the full PQC stack and run the node standalone before pointing it at a live chain.

The light node is released under the **Apache 2.0** license.

## Where to go next

- [SX Edition](/light-node/sx-edition) — install, configure, and run the server daemon.
- [UX Edition](/light-node/ux-edition) — run the web dashboard edition.
- [Registration and Licensing](/light-node/registration-and-licensing) — register on-chain and obtain a license.
- [Rewards and Monitoring](/light-node/rewards-and-monitoring) — earn the 3% share and keep the node healthy.
