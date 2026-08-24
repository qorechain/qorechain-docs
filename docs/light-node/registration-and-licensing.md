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

### PQC-cosigned heartbeat pipeline {#pqc-cosigned-heartbeat-pipeline}

QoreChain is **PQC-required by default**, so the heartbeat liveness transaction is produced through a post-quantum co-signed pipeline rather than a classical-only signature. The daemon builds the unsigned heartbeat, then co-signs it with a **hybrid Dilithium-5 (ML-DSA-87)** signature before broadcast — the same post-quantum posture the chain enforces for every transaction. The node submits one heartbeat per `interval_blocks` window (matching the chain's `heartbeat_interval` parameter), pacing itself by block height to avoid early-submission rejections.

On-chain heartbeats are opt-in in the daemon: enable the `[heartbeat]` section in the node config (`enabled = true`) and point `qorechaind_path` at a `qorechaind` binary, which performs the generate-then-co-sign flow. When this is not configured, the node runs without submitting on-chain heartbeats and the operator can submit liveness manually with the printed chain commands.

## Registering and licensing via the Dashboard

You can also bring a node up and check its licensing status through the QoreChain Dashboard's **Tools** page. Running the node and joining its rewards program are two different things, and the Dashboard keeps them separate rather than presenting one guided sign-up flow:

1. **Bring your node up (Tools → Light Node, step 1).** This needs no license and no on-chain check of any kind, and it's shown to every visitor before anything else. It reads the current network manifest live and walks through downloading and verifying the binary, initializing the node with genesis, pointing `config.toml` at the network's peers, and state-syncing instead of syncing from genesis.
2. **Check your rewards-program status (Tools → Light Node).** Joining the light-node reward share is a separate, on-chain-gated step: it requires an active `lightnode_operator` license granted on-chain, a minimum of QOR delegated — counted as your total across all the validators you delegate to, not per validator, and read live from staking rather than self-declared — and a small on-chain registration fee. **Enrollment is not open yet**, and buying a license through **Buy License** does not open it early — there is nothing to sign up for today. Until it opens, this tab shows the requirement as a status to check rather than a form to submit. Run and sync your node in the meantime; uptime from before enrollment opens is expected to count once it does.
3. **Register once your license is granted on-chain (Tools → Light Node).** A license purchased through **Buy License** is recorded on our side first; the grant that makes it recognized on-chain is a separate step, and registration refuses until that grant lands. Once it has, this tab replaces the status panel with a registration form: your operator address (`qor1…`), a moniker, and a public endpoint URL, plus an acknowledgement of the stake commitment.
4. **Confirm and bond stake.** After you submit, the Dashboard shows a confirmation summary of the registration (moniker, operator address, endpoint, stake intent, status). Bond the acknowledged stake from your operator address once eligibility opens.

Use the Dashboard flow if you prefer a UI over the CLI, or to manage licensing and registration together in one place. The `lightnode-sx register` command above remains available for anyone who prefers to construct and review the transaction themselves — on-chain registration and reward-program eligibility are governed by the chain the same way regardless of which path you use.

## Where to go next

- [Rewards and Monitoring](/light-node/rewards-and-monitoring) — how the 3% share is earned, compounded, and monitored.
- [SX Edition](/light-node/sx-edition) — the `register` command and full CLI reference.
