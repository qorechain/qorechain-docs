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

### Generating the registration commands

Registration is made from your **operator address**: a funded `qor1…` account created with `qorechaind` (or any Cosmos wallet), which also receives the rewards. The node's own Dilithium-5 key has no address; it becomes the account's post-quantum key. Put the address in `config.toml` as `operator_address`, then run:

```bash
lightnode-sx register
```

Before printing anything, the command asks the chain whether `operator_address` holds an active `lightnode_operator` licence. It does this because the chain refuses a registration without one, and there is no point in handing you commands that will be refused. Without a licence it stops with:

```text
operator address qor1... has no lightnode_operator licence. Buy one at
https://dashboard.qorechain.io -> Tools -> Buy License, and enter this operator
address there; the on-chain grant follows and register works once it lands.
```

A licence bought on the Dashboard is granted on-chain in a separate step, so `register` can still say "no licence" for a while after the purchase; `lightnode-sx status` shows the same `Licence:` line and flips to `active` when the grant lands. A node that is already registered is reported as such instead of being registered twice.

With an active licence, the command reads the node key from the keyring and prints, filled in with your values:

1. **Once only**, the command that attaches the node key to the operator account as its post-quantum key (`qorechaind tx pqc register-key-v2 <pubkey> hybrid --from operator …`), after exporting the key into `qorechaind`'s key directory with `lightnode-sx keys export`. Skip it if the account already has a post-quantum key (`GET /qorechain/pqc/v1/account/<address>` says `found: true`).
2. The registration itself: `qorechaind tx lightnode register <type> <version> --from operator --generate-only > register.json`, then `qorechaind tx pqc cosign register.json --from operator --pqc-key <key>`. The chain requires the post-quantum co-signature on every transaction, so registration is a generate-then-cosign pair.

The command takes two optional flags:

- `--type` — the node type, `sx` or `ux` (defaults to `sx`).
- `--version` — the node version to register (defaults to the binary's own version).

Submit on the network you are joining (testnet `qorechain-diana` or mainnet `qorechain-vladi`). Registration requires an active `lightnode_operator` licence granted on the operator address; the chain refuses it otherwise.

:::note
`lightnode-sx register` **prints** the commands for you to review and run — it does not broadcast on its own. This keeps you in control of when and how the node is registered.
:::

## Heartbeat liveness proofs

Registration alone is not enough to stay eligible. A registered light node must continuously prove it is online by submitting **heartbeat liveness proofs**. These heartbeats are how the chain distinguishes active nodes — which are eligible for the reward share — from registered-but-offline nodes.

In practice this means a node that is registered and kept running (and synced) maintains its eligibility, while a node that goes offline stops proving liveness and loses eligibility until it returns. Keeping the daemon running and healthy is therefore part of earning rewards — see [Rewards and Monitoring](/light-node/rewards-and-monitoring) for how to watch heartbeat and sync health.

### PQC-cosigned heartbeat pipeline {#pqc-cosigned-heartbeat-pipeline}

QoreChain is **PQC-required by default**, so the heartbeat liveness transaction is produced through a post-quantum co-signed pipeline rather than a classical-only signature. The daemon builds the unsigned heartbeat, then co-signs it with a **hybrid Dilithium-5 (ML-DSA-87)** signature before broadcast — the same post-quantum posture the chain enforces for every transaction. The node submits one heartbeat per `interval_blocks` window (matching the chain's `heartbeat_interval` parameter), pacing itself by block height to avoid early-submission rejections.

On-chain heartbeats are on by default. The daemon needs three things to send them: `operator_address` in the config, a `qorechaind` binary (on `PATH` or at `[heartbeat] qorechaind_path`; the SX Docker image ships it), and the `qorechaind` home holding the operator key and the exported node key (`qorechaind_home`, default `~/.qorechaind`). It paces itself by the chain's own `last_heartbeat` for the node, so a restart neither sends a duplicate nor waits a whole interval. Until the node is registered, it does not heartbeat; it logs why instead, once per state change: no licence (with where to buy one) or licence active but not registered (run `lightnode-sx register`). `lightnode-sx status` shows `Signer:`, `Licence:` and `Registration:` lines so the reason is visible without reading logs. When the signer is missing, the node still runs and syncs; it just cannot stay active on chain, and `status` says so.

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
