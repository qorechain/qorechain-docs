---
slug: /light-node/registration-and-licensing
title: Registration and Licensing
sidebar_label: Registration & Licensing
sidebar_position: 4
---

# Registration and Licensing

To earn the [3% light-node reward share](/light-node/rewards-and-monitoring), a light node must be **registered on-chain** and must keep proving that it is alive. This page covers how registration works, how the node proves liveness, and how to register and license a node through the Dashboard.

## On-chain registration

Registration records your light node on the chain so the protocol knows it exists, what type it is (`sx` or `ux`), and which operator key controls it. Once registered and live, the node becomes eligible for the light-node reward share.

### Generating the registration command

The SX edition can print the exact chain command to register this node. Run:

```bash
lightnode-sx register
```

This reads your operator key from the keyring and prints a ready-to-run `qorechaind` transaction along with your operator address, node type, and version. The command takes two optional flags:

- `--type` — the node type, `sx` or `ux` (defaults to `sx`).
- `--version` — the node version to register (defaults to the binary's own version).

The printed command registers the node under the `x/lightnode` module on-chain. Submit it with a funded operator account on the network you are joining (testnet `qorechain-diana` or mainnet `qorechain-vladi`).

:::note
`lightnode-sx register` **prints** the registration transaction for you to review and submit — it does not broadcast on its own. This keeps you in control of when and how the node is registered.
:::

## Heartbeat liveness proofs

Registration alone is not enough to stay eligible. A registered light node must continuously prove it is online by submitting **heartbeat liveness proofs**. These heartbeats are how the chain distinguishes active nodes — which are eligible for the reward share — from registered-but-offline nodes.

In practice this means a node that is registered and kept running (and synced) maintains its eligibility, while a node that goes offline stops proving liveness and loses eligibility until it returns. Keeping the daemon running and healthy is therefore part of earning rewards — see [Rewards and Monitoring](/light-node/rewards-and-monitoring) for how to watch heartbeat and sync health.

### PQC-cosigned heartbeat pipeline

QoreChain is **PQC-required by default**, so the heartbeat liveness transaction is produced through a post-quantum co-signed pipeline rather than a classical-only signature. The daemon builds the unsigned heartbeat, then co-signs it with a **hybrid Dilithium-5 (ML-DSA-87)** signature before broadcast — the same post-quantum posture the chain enforces for every transaction. The node submits one heartbeat per `interval_blocks` window (matching the chain's `heartbeat_interval` parameter), pacing itself by block height to avoid early-submission rejections.

On-chain heartbeats are opt-in in the daemon: enable the `[heartbeat]` section in the node config (`enabled = true`) and point `qorechaind_path` at a `qorechaind` binary, which performs the generate-then-co-sign flow. When this is not configured, the node runs without submitting on-chain heartbeats and the operator can submit liveness manually with the printed chain commands.

## Registering and licensing via the Dashboard

You can also register a node and obtain a license through the QoreChain Dashboard, which provides a guided flow instead of constructing chain commands by hand.

- Register your node from **Tools → Node Registration**.
- Obtain or renew a license from **Tools → Buy License**.

The Dashboard flow walks you through associating your operator key, choosing the node type and network, and completing the on-chain registration. Use it if you prefer a UI over the CLI, or to manage licensing alongside registration in one place.

## Where to go next

- [Rewards and Monitoring](/light-node/rewards-and-monitoring) — how the 3% share is earned, compounded, and monitored.
- [SX Edition](/light-node/sx-edition) — the `register` command and full CLI reference.
