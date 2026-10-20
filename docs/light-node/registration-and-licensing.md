---
slug: /light-node/registration-and-licensing
title: Registration and Licensing
sidebar_label: Registration & Licensing
sidebar_position: 4
---

# Registration and Licensing

To take part in the [3% light-node reward share](/light-node/rewards-and-monitoring), a light node must be **registered on-chain** and must keep proving that it is alive. This page covers what the chain requires, how to get a licence, how the node registers itself, and how it proves liveness.

:::note Registration is open
Registration is open on mainnet (`qorechain-vladi`) and on testnet (`qorechain-diana`). Running and syncing a node needs no licence. See [Status of the reward program](/light-node/overview#reward-program-status) for how to check the current state.
:::

## On-chain registration

Registration records your light node on the chain so the protocol knows it exists, what type it is (`sx` or `ux`), and which operator account controls it. Once registered and live, the node becomes eligible for the light-node reward share.

### Requirements {#requirements}

The chain checks all of these when your registration transaction executes:

1. An active `lightnode_operator` licence on the operator address.
2. At least **1,000 QOR delegated** from that same address to **bonded** validators (your total across any validators; delegations to jailed or unbonded validators do not count).
3. A balance on the operator account to pay the **1 QOR** registration fee and transaction fees. The node also pays a fee for each heartbeat from this account: with native signing the fee is 0.25 uqor per unit of gas, so 75,000 uqor (0.075 QOR) at the default `[heartbeat] gas` of 300,000, or about 1.9 QOR a month at roughly 25 heartbeats a day.
4. Fewer than 10,000 light nodes registered network-wide.

After registration the node must send a heartbeat every **1,000 blocks** (with a grace of 100 blocks) and keep at least **80% uptime** to be paid. Read the live values with `GET https://api.qore.host/qorechain/lightnode/v1/params` (testnet: `https://api-testnet.qore.host`).

### The operator account {#operator-account}

Registration is made from your **operator address**: an ordinary `qor1…` account that holds the licence and the stake, pays the fees, and receives the rewards. The node must be able to sign for it, so it must be an account **whose recovery words you hold**: words you wrote down yourself, an account from Keplr, or a `qorechaind` key (derivation path `m/44'/118'/0'/0/0`). A dedicated account used only for the node is the best choice.

A custodial wallet on the Dashboard (one whose seed the Dashboard keeps for you) cannot run a node unless you first export its seed.

The node's Dilithium-5 key has no address of its own: on QoreChain a post-quantum key is attached to an account, it does not create one. The node attaches its key to the operator account as that account's post-quantum key, unless the account already has one (see [Accounts that already have a post-quantum key](#accounts-with-a-pqc-key)).

## Getting a licence

### Mainnet: buy on the Dashboard

Licences are bought on the QoreChain Dashboard at **Tools → Light Node**. A licence costs **$50**, paid in USDT on ERC-20, BEP-20 or TRC-20; the payment is verified on its chain. You must enter the `qor1…` address the licence is for **before** paying; use the operator address described above.

The grant is a separate on-chain step, signed by hand and sent in batches. Until the chain confirms it, the tab shows **Paid, awaiting on-chain grant**, and the node keeps reporting that the address has no licence. `lightnode-sx status` shows a `Licence:` line that changes to `active` when the grant lands. You can also check it directly:

```bash
curl -s https://api.qore.host/qorechain/license/v1/check/<operator-address>/lightnode_operator
```

### Testnet: on request

Nothing is sold on testnet. Testnet licences are free and granted by the testnet licence authority on request: write to nodes@qorechain.io with your testnet `qor1…` address.

## Registering the node

The steps below are the node's own setup flow. They are the same for both editions: `lightnode-ux` has the same commands as `lightnode-sx` and uses the same home directory (`~/.qorechain-lightnode`). See [SX Edition](/light-node/sx-edition#first-run-onboard) for details on each command.

```bash
# 1. Keys are stored encrypted. Keep this set for every command below and for start.
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

# 2. Self-test, RPC endpoint (mainnet: https://rpc.qore.host), node key
lightnode-sx onboard

# 3. The operator account: the one the licence is for. --recover reads its
#    recovery words from standard input.
lightnode-sx keys add-operator --recover

# 4. Post-quantum key, missing stake (only if you name a validator), registration
lightnode-sx register --delegate-to qorvaloper1...

# 5. Run the node; it sends heartbeats on its own
lightnode-sx start
lightnode-sx status
```

The passphrase protects both keys in the node's keyring: the node's post-quantum key and the operator account key.

### What `register` does

`register` reads `operator_address` and the keys from the keyring, then:

1. **Checks the licence.** It asks the chain whether `operator_address` holds an active `lightnode_operator` licence. Without one it stops and says where to get one. From 3.1.10 the message points to **Tools → Light Node** on mainnet and, on testnet, to a free licence on request at nodes@qorechain.io (3.1.9 still named the Dashboard's old tab). A licence that has expired or is suspended is reported as such. A node that is already registered is reported as such, and nothing is sent.
2. **Attaches the post-quantum key**, unless the account already has one. An account with no post-quantum key may only send this one message, signed classically (without the hybrid extension); the node sends it that way and includes a proof of possession of the key where the chain supports it.
3. **Delegates the missing stake**, only if you name a validator with `--delegate-to qorvaloper1...`. Without `--delegate-to`, if the account is below the minimum, it stops and says how much is missing. From 3.1.10 it counts only stake delegated to **bonded** validators, as the chain does; 3.1.9 also counted jailed or unbonded validators and could then be refused on chain, so delegate to an active validator if you run 3.1.9.
4. **Registers the node** with the 1 QOR fee.

Each step is signed by the node itself and confirmed in a block before the next one is sent. Every transaction after the key registration carries the hybrid ML-DSA-87 + secp256k1 signature the chain requires.

The command takes these flags:

- `--delegate-to` — the `qorvaloper1…` validator to delegate the missing stake to.
- `--type` — the node type, `sx` or `ux` (defaults to the edition of the binary).
- `--version` — the node version to register (defaults to the binary's own version).
- `--print` — print the equivalent `qorechaind` commands instead of signing (see below).

The account must already exist on chain (it must have received funds) before `register` can sign for it.

### Accounts that already have a post-quantum key {#accounts-with-a-pqc-key}

An account set up in a wallet often already has a post-quantum key, derived from the same recovery words. Under the chain's v3.2.3 rules the chain accepts only the key registered on the account, and it refuses keys of type `classical_only` or an empty key.

Since 3.1.9, `keys add-operator --recover` handles this: when the account already has a post-quantum key, it rebuilds that key from the words, using the same derivation as the wallet-adapter and the Dashboard (the same as `qorechaind tx pqc recover-key`), and the node signs with it. When the account has no key, the node derives one from the words, so the words also restore the node's key. If the account has a post-quantum key that the words cannot reproduce (a wallet that generates and keeps its own key), the command refuses and advises a dedicated operator account.

### Fallback: operator key in a `qorechaind` keyring

If you keep the operator account key in a `qorechaind` keyring and do not want to store it in the node, skip step 3 and run:

```bash
lightnode-sx register --print
```

It runs the same licence and registration checks and prints, filled in with your values, the `qorechaind` commands for each step: exporting the node key into `qorechaind`'s key directory (`keys export <name> --out ~/.qorechaind/pqc/<name>.dilithium`), `tx pqc register-key-v2 … hybrid`, a `tx staking delegate` when the stake is short, and `tx lightnode register` as a generate-then-`tx pqc cosign` pair. On this path the daemon also uses `qorechaind` for heartbeats; see [`[heartbeat]` settings](/light-node/sx-edition#configure).

## Heartbeat liveness proofs

Registration alone is not enough to stay eligible. A registered light node must continuously prove it is online by submitting **heartbeat liveness proofs**. These heartbeats are how the chain distinguishes active nodes — which are eligible for the reward share — from registered-but-offline nodes.

In practice this means a node that is registered and kept running (and synced) maintains its eligibility, while a node that goes offline stops proving liveness and loses eligibility until it returns. Keeping the daemon running and healthy is therefore part of earning rewards — see [Rewards and Monitoring](/light-node/rewards-and-monitoring) for how to watch heartbeat and sync health.

### PQC-cosigned heartbeat pipeline {#pqc-cosigned-heartbeat-pipeline}

QoreChain is **PQC-required by default**, so every heartbeat carries a **hybrid signature**: ML-DSA-87 (Dilithium-5) with the account's post-quantum key, and secp256k1 with the operator account key. The node builds and signs the transaction itself on Linux, macOS and Windows; `qorechaind` is not needed. It reads from the network which sign-bytes version to use.

On-chain heartbeats are on by default. The daemon sends one when 1,000 blocks (`[heartbeat] interval_blocks`, matching the chain's `heartbeat_interval`) have passed since the chain's own `last_heartbeat` for the node, checking every 60 seconds, so a restart neither sends a duplicate nor waits a whole interval. Each heartbeat is reported only once it is in a block.

The daemon picks its signer at start:

- **Native** — the keyring holds the operator key (from `keys add-operator`) and it matches `operator_address`. This is the normal case.
- **`qorechaind` fallback** — otherwise, if a `qorechaind` binary is on `PATH` or at `[heartbeat] qorechaind_path`. It uses the operator key in the `qorechaind` keyring (`[heartbeat] key_name`, home `qorechaind_home`, default `~/.qorechaind`) and the exported node key under `pqc/<key_name>.dilithium`. The `qorechaind` keyring passphrase goes in `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE`; it is piped to `qorechaind` on stdin, never placed on a command line.

Until the node is registered it does not send heartbeats; it logs why instead, once per state change: no licence, or licence active but not registered (run `register`). `lightnode-sx status` shows `Signer:`, `Licence:` and `Registration:` lines so the reason is visible without reading logs. When there is no signer, the node still runs and syncs, but it cannot stay active on chain, and `status` says so.

## The Dashboard's Light Node tab

The QoreChain Dashboard's **Tools → Light Node** tab brings the steps together:

1. **Downloads.** It links the light-node binaries for the selected network (the same files as `https://download.qore.host/<net>/lightnode/latest.json`, with their sha256 checksums).
2. **Setup steps.** It shows the five steps above, matched to the version in the release manifest, and whether registration is open, read from the manifest's `registration` field.
3. **Licence purchase** (mainnet only). It takes the licence address before payment and shows **Paid, awaiting on-chain grant** until the chain confirms the grant. It warns you if the address you enter is your own custodial Dashboard wallet, and it notes, for information, if the address already has a post-quantum key.
4. **Status.** A status panel shows the node's state as read from the chain.

The registration itself is always the transaction sent by `lightnode-sx register` (or `lightnode-ux register`). The Dashboard does not register nodes; its old registration form, which only stored a record, has been removed.

## Where to go next

- [Rewards and Monitoring](/light-node/rewards-and-monitoring) — how the 3% share is credited, claimed, and monitored.
- [SX Edition](/light-node/sx-edition) — the `register` command and full CLI reference.
