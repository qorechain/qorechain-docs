---
slug: /light-node/registration-and-licensing
title: Registration and Licensing
sidebar_label: Registration & Licensing
sidebar_position: 4
---

# Registration and Licensing

To take part in the [3% light-node reward share](/light-node/rewards-and-monitoring), a light node must be **registered on-chain** and must keep proving that it is alive. This page covers how registration works, how the node proves liveness, and how to license a node through the Dashboard and register it on-chain.

:::note Reward-program registration is not open yet
No `lightnode_operator` licence has been granted on either network and no node is registered, so the chain refuses every registration today. Running and syncing a node needs no licence. See [Status of the reward program](/light-node/overview#reward-program-status) for how to check the current state.
:::

## On-chain registration

Registration records your light node on the chain so the protocol knows it exists, what type it is (`sx` or `ux`), and which operator key controls it. Once registered and live, the node becomes eligible for the light-node reward share.

### Requirements {#requirements}

The chain checks all of these when your registration transaction executes:

1. An active `lightnode_operator` licence on the operator address.
2. At least **1,000 QOR bonded** to validators from that same address (your total across all validators). Delegate **before** you register: from the Dashboard's staking page, or with `qorechaind tx staking delegate` (and the post-quantum co-signature, like every transaction).
3. A balance on the operator account to pay the **1 QOR** registration fee and transaction fees. The daemon pays a fee for each heartbeat from this account (default `50000uqor` per heartbeat, `[heartbeat] fees`).
4. Fewer than 10,000 light nodes registered network-wide.

### Generating the registration commands

Registration is made from your **operator address**: a funded `qor1…` account created with `qorechaind` (or any Cosmos wallet), which also receives the rewards. The node's own Dilithium-5 key has no address; it becomes the account's post-quantum key. Put the address in `config.toml` as `operator_address`, and make sure `key_name` and `chain_id` are set as described in [First run](/light-node/sx-edition#first-run-onboard) (`onboard` does not set them correctly for you). Then run:

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

1. **Once only**, the command that attaches the node key to the operator account as its post-quantum key (`qorechaind tx pqc register-key-v2 dilithium5 <pubkey> hybrid --from operator …`), after exporting the key into `qorechaind`'s key directory with `lightnode-sx keys export`. Skip it if the account already has a post-quantum key (`GET /qorechain/pqc/v1/account/<address>` says `found: true`). If the printed gas limit runs out, repeat it with `--gas 600000 --fees 60000uqor`.
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

On-chain heartbeats are on by default. The daemon needs: `operator_address` in the config; a `qorechaind` binary **v3.2.0 or newer** (on `PATH` or at `[heartbeat] qorechaind_path`; the SX Docker image built from tag `v3.1.4` ships one — older signers are refused by the chain); and the `qorechaind` home holding the operator key and the exported node key (`qorechaind_home`, default `~/.qorechaind`). Two keyring passphrases belong in the environment: `QORE_LIGHTNODE_KEYRING_PASSPHRASE` for the node keyring and `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` for the `qorechaind` keyring (the second is piped to `qorechaind` on stdin, never placed on a command line). `qorechaind` is published for **Linux amd64 only** (see the `binary` entry of `https://download.qore.host/mainnet/latest.json`), so on macOS, Windows or ARM hosts the node runs and syncs but cannot sign heartbeats natively; a registered node should run the SX edition on Linux amd64, or the Docker image on an amd64 host. It paces itself by the chain's own `last_heartbeat` for the node, so a restart neither sends a duplicate nor waits a whole interval. Until the node is registered, it does not heartbeat; it logs why instead, once per state change: no licence (with where to buy one) or licence active but not registered (run `lightnode-sx register`). `lightnode-sx status` shows `Signer:`, `Licence:` and `Registration:` lines so the reason is visible without reading logs. When the signer is missing, the node still runs and syncs; it just cannot stay active on chain, and `status` says so.

## Registering and licensing via the Dashboard

You can check your licensing status and keep your node details on the QoreChain Dashboard's **Tools → Light Node** tab. Running a node and joining its rewards program are two different things, and the Dashboard keeps them separate:

1. **Get the software (no licence needed).** The tab links the light-node binaries for the selected network (the same files as `https://download.qore.host/<net>/lightnode/latest.json`, with their sha256 checksums) and shows a bring-up pack for a full QoreChain node. A light node only needs the `lightnode-sx` or `lightnode-ux` binary and an RPC endpoint; follow [SX Edition](/light-node/sx-edition).
2. **Check your rewards-program status.** Joining the light-node reward share is a separate, on-chain-gated step: an active `lightnode_operator` licence granted on-chain, at least 1,000 QOR bonded (your total across all validators, read live from staking), and a 1 QOR registration fee. **Enrollment is not open yet** (see [Status of the reward program](/light-node/overview#reward-program-status)), and buying a licence does not open it early. Uptime is counted from the block your node registers on-chain, not before.
3. **Licence.** A licence purchased through **Buy License** is recorded on our side first; the grant that makes it recognised on-chain is a separate step, and the chain refuses a registration until it lands. The purchase needs the `qor1…` address the licence will be granted to, and shows **Paid — awaiting on-chain grant** until the chain confirms it. `lightnode-sx status` shows the on-chain `Licence:` line.
4. **Registration record.** If your account holds a licence recorded as active, the tab also shows a short form (operator address, moniker, public endpoint URL, and an acknowledgement of the stake commitment) followed by a summary of what you submitted. This records your request with the Dashboard; it does **not** send the on-chain registration transaction.
5. **Register on-chain.** Once the licence is granted and 1,000 QOR is bonded from your operator address, register with `lightnode-sx register` and the `qorechaind` commands it prints (see above).

The Dashboard is useful for downloading the node, checking the chain's requirements and your node's health, and buying a licence. The on-chain registration itself is always the `lightnode-sx register` transaction.

## Where to go next

- [Rewards and Monitoring](/light-node/rewards-and-monitoring) — how the 3% share is credited, claimed, and monitored.
- [SX Edition](/light-node/sx-edition) — the `register` command and full CLI reference.
