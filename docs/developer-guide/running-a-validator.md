---
slug: /developer-guide/running-a-validator
title: Running a Validator
sidebar_label: Running a Validator
sidebar_position: 9
---

# Running a Validator

This guide covers how to create a validator on the QoreChain network, understand the pool classification design, register a PQC key (hybrid ML-DSA-87 signatures, FIPS 204), and monitor your node.

:::note
This guide targets the **`qorechain-vladi`** mainnet (EVM chain ID **9801**), live since 7 June 2026, which runs node release **v3.2.5** (applied by governance proposal 14 at height 3,906,833 on 29 October 2026, after v3.2.4 at height 3,742,566 on 23 October 2026 and v3.2.3 at height 3,662,051 on 20 October 2026). A validator must run the v3.2.5 binary (the manifest's `minCompatible` is 3.2.5); a node still on v3.2.4 halts at height 3,906,833 and needs the v3.2.5 bundle (see [Running a Node: Upgrades](/developer-guide/running-a-node#upgrades)). The **`qorechain-diana`** testnet (EVM chain ID **9800**) runs v3.2.6 (applied 27 October 2026, after v3.2.5 on 26 October) and is recommended for rehearsing your setup before going live. Substitute the appropriate `--chain-id` for your target network. Block times differ: about 3.1 s on mainnet (the last 1,000 blocks took 52 minutes 21 seconds on 27 October 2026) and about 1.3 s on the testnet; both vary, so convert block counts to time per network.
:::

:::caution Use the release binary, not a source build
A validator must run the **release `qorechaind`** named in the live manifest (`https://download.qore.host/mainnet/latest.json`; see [Running a Node](/developer-guide/running-a-node#fetch-the-manifest)). A binary built from the public source has stub keepers and no post-quantum signer: it cannot reproduce the network's consensus state and cannot create the hybrid signature that `create-validator` and every other Cosmos-lane transaction need (see [Building from Source](/developer-guide/building-from-source)). From v3.2.3 a binary built from the public source refuses to start on a public network at all. A fresh mainnet node needs v3.2.0 or later; keep the system clock NTP-synchronised, because from v3.2.1 the node stops when its clock is more than 60 seconds out.
:::

:::note Which parts of this page are live
Block production uses the standard stake-weighted validator rotation, and slashing and governance use the standard Cosmos SDK modules with the parameters shown below. The Triple-Pool CPoS logic (pool classification, pool-weighted proposer selection, the bonding curve and progressive slashing) is implemented in the `x/qca` module and its parameters are on chain, but it is **not yet wired into block production, rewards or slashing**. The sections on those topics describe the design; do not plan around pool membership or reputation changing your block-proposal share or rewards today.
:::

---

## Prerequisites

* A fully synced release `qorechaind` node (see [Connecting to Mainnet](/getting-started/connecting-to-mainnet), or [Connecting to Testnet](/getting-started/connecting-to-testnet) to rehearse)
* A **registered ML-DSA-87 PQC key** on the operator account (see [PQC Key Registration](#pqc-key-registration)) — `create-validator` needs the hybrid signature
* A funded account with at least **100,000 QOR** (100,000,000,000 uqor) for the initial self-delegation — this minimum is enforced on-chain and `create-validator` is rejected below it
* An active **`validator_operator` grant** on your operator address, issued through the [Validator Program](/dashboard/tools-hub#validator-application) on the Dashboard's **Nodes & Validators** page (apply, be selected, pay the $1,000 programme fee); see the note below. Without it, `create-validator` fails with `ErrUnauthorized` regardless of how much QOR you self-bond
* Familiarity with the [Staking and Delegation](/user-guide/staking-and-delegation) model

---

## Joining the Network {#joining}

**Use state sync as the default way to join.** It fetches a recent application state from peers instead of replaying blocks, instead of replaying every block from genesis. The snapshot download is a fallback only: the mainnet manifest's snapshot is still the 21 August 2026 archive (height 1,966,629, about 27 GB), which predates several upgrades and then replays about two months of blocks, and the testnet publishes no snapshot at all.

1. Install the release `qorechaind` the manifest names (see [Running a Node](/developer-guide/running-a-node#fetch-the-manifest)), run `qorechaind init <moniker> --chain-id qorechain-vladi`, then put the manifest's genesis, peers and seeds in place as described there, and set `minimum-gas-prices = "0.1uqor"` in `app.toml`.
2. Take the trust point from the manifest and write the `[statesync]` section of `config.toml`:

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://<a second RPC you run or trust>:26657"
trust_height = <TRUST_HEIGHT>
trust_hash = "<TRUST_HASH>"
trust_period = "168h0m0s"
```

3. Optionally keep the disk small (see [Hardware](#hardware)): in `app.toml` set `pruning = "custom"` with `pruning-keep-recent = "100000"` and `pruning-interval = "10"`, and in `config.toml` set `indexer = "null"` under `[tx_index]` (a validator serves no transaction lookups; do not use `null` on a node you query).
4. Start with `qorechaind start --minimum-gas-prices=0.1uqor` and wait until `catching_up` is `false`.

:::warning State sync needs two different RPC servers
State sync cross-checks the trust point against **two** RPC servers. The manifest's `stateSync.rpcServers` lists `https://rpc.qore.host` **twice** (and the testnet manifest lists `https://rpc-testnet.qore.host` twice). Two identical entries satisfy the count but defeat the cross-check, because both answers come from one server. Add a second RPC that you run yourself or trust independently, and check the trust hash against a second source before you start, for example `curl -s "https://<second-rpc>/block?height=$TRUST_HEIGHT" | jq -r .result.block_id.hash` must equal `$TRUST_HASH`. The trust point in the manifest is refreshed hourly, so fetch it again if it has gone stale.
:::

Keep the system clock synchronised with NTP: from v3.2.1 the node stops when its clock is more than 60 seconds out.

---

## Network Parameters {#parameters}

These values were read from the mainnet REST API on 27 October 2026 (`qorechain-vladi`, then on v3.2.4; v3.2.5 has run since 29 October 2026). Read them live before you rely on them: `qorechaind query staking params`, `qorechaind query slashing params`, or `GET /cosmos/staking/v1beta1/params` and `GET /cosmos/slashing/v1beta1/params`.

| Item | Value |
| --- | --- |
| Active set size (`max_validators`) | 100 (8 validators are bonded today, none jailed) |
| Unbonding period | 1,814,400 s (21 days); at most 7 unbonding entries (`max_entries`) per delegator |
| Minimum commission rate (`min_commission_rate`) | 0 (you choose your own rate, up to your `commission-max-rate`) |
| Signed-blocks window | 10,000 blocks (`signed_blocks_window`) |
| Minimum signed per window | 0.05, so a validator is jailed when it signs fewer than 5% of the window |
| Downtime jail / slash | 600 s jail, 1% of stake slashed |
| Double-sign slash | 5% of stake |
| Self-bond floor to create a validator | **100,000 QOR** (`100000000000uqor`), enforced on chain; below it `create-validator` fails with code 18 |
| Operator grant | An active `validator_operator` grant on the sender is required; without it `create-validator` fails with `ErrUnauthorized` |
| Fee floor | 0.1 uqor per gas |

**Order of operations.** Do them in this order: (1) register the account's PQC key, (2) obtain the `validator_operator` grant, (3) build `create-validator` with `--generate-only` and sign it with `tx pqc cosign`. The key comes first because an account with no registered key can send only the registration itself (see [PQC Key Registration](#pqc-key-registration)), and the grant is checked when `create-validator` runs. Details are in [Creating a Validator](#validator-license-gate) and [PQC Key Registration](#pqc-key-registration).

:::caution `min-self-delegation` is not the 100,000 QOR floor
The genesis validators show `min_self_delegation` = `1` (1 uqor) on chain. That is **not** the floor: their genesis transactions were exempt from it. The `min-self-delegation` field in your `validator.json` is your own promise to keep at least that much self-bonded, unrelated to the 100,000 QOR floor, which applies to the `amount` you self-delegate when you create the validator.
:::

---

## Hardware {#hardware}

Measured on the running mainnet validators (27 October 2026): about 3.2 to 3.5 GB of RAM and under 10% CPU in normal load. A validator runs comfortably on 3 to 4 vCPU, 8 to 16 GB of RAM and NVMe storage. Single-core speed matters more than core count: verifying ML-DSA-87 signatures is about half of the work of checking a transaction, and it peaks under load.

| Item | Suggested validator profile |
| --- | --- |
| CPU | 4 vCPU, high clock speed |
| RAM | 16 GB |
| Disk | 100 GB or more, NVMe |
| Clock | NTP-synchronised (the 60 second rule above) |
| Network | Only P2P `26656` open to the world; RPC, REST and EVM bound to localhost |

Disk use depends on how you joined. A validator that joined by state sync with `pruning = "custom"` (keep-recent 100000) and `indexer = "null"` holds about 10 GB after two months. A node on default pruning that has run since genesis holds about 100 to 130 GB after four months. The 500 GB or more suggested for RPC nodes in [Running a Node](/developer-guide/running-a-node#recommended-hardware) is generous for a validator.

---

## How the Network Is Run {#network-organisation}

On 27 October 2026 the network has 8 active validators, in several countries and on more than one hosting provider. The public endpoints (`rpc.qore.host`, `api.qore.host`, `evm.qore.host`, `svm.qore.host`) are served by dedicated non-validator nodes behind an edge network, never by validators, and the validators' IP addresses are not published in DNS. Voting power follows bonded stake: a new validator with the minimum self-bond starts with a small share of the power and grows as delegations arrive.

---

## Creating a Validator

### Operator grant: `validator_operator` {#validator-license-gate}

`create-validator` is gated by two independent checks, both enforced on-chain, and you need both — a large self-bond alone is not enough:

1. **Minimum self-bond of 100,000 QOR.**
2. **An active `validator_operator` grant** on the account submitting the transaction.

The grant is issued on chain by the QoreChain Association through the **Validator Program**: apply on the Dashboard's **Nodes & Validators** page ([Tools Hub](/dashboard/tools-hub#validator-application)), run a validator on the diana testnet for the 14-day trial, and once selected pay the **$1,000 programme fee**; the grant is then signed in batches for the operator address in your application. Check yours with `GET /qorechain/license/v1/check/{grantee}/validator_operator`. A license's `expires_at` is a **block height**, not a date or duration — `0` means no expiry. Missing or expired, and `create-validator` fails with `ErrUnauthorized`, no matter how much you self-bond; this is the single most common reason a well-funded attempt fails and looks unexplained. This gate exists specifically because the EVM execution lane cannot see or enforce it (a single ante decorator there would bypass it entirely) — it is one of the reasons staking and validation stay exclusively on the Native lane.

Create a `validator.json` file (the flag-based form was removed in the current SDK):

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

Then generate and sign the transaction (it needs the hybrid signature like every Cosmos-lane transaction; see [Transaction Commands](/cli-reference/transaction-commands#hybrid-signing)):

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

The network fee floor is **0.1 uqor per unit of gas**, so a 600,000 gas limit needs at least 60,000 uqor.

| `validator.json` field         | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| `amount`                       | Self-delegation amount — **100,000 QOR minimum** (`100000000000uqor`) |
| `pubkey`                       | Validator consensus public key (ed25519)           |
| `moniker`                      | Human-readable name for your validator             |
| `commission-rate`              | Initial commission rate (e.g., 0.10 = 10%)         |
| `commission-max-rate`          | Maximum commission rate (immutable after creation) |
| `commission-max-change-rate`   | Maximum daily commission change rate               |
| `min-self-delegation`          | Your own commitment to keep at least this much self-bonded (in uqor). It is **not** the 100,000 QOR on-chain floor, which applies to `amount` |

After the transaction confirms, verify your validator:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Pool Classification

:::note Design, not yet active in block production
The pool classification below is the `x/qca` design. Its parameters are on chain (`qorechaind query qca config`), but block proposers are not yet chosen by pool and the pools do not yet change rewards or slashing.
:::

QoreChain's `x/qca` (Quantum Consensus Allocation) module defines a **three-pool classification system**. Every **1,000 blocks** (about 52 minutes at mainnet's 3.1 s blocks), validators are meant to be reclassified into one of three pools based on their reputation and stake:

| Pool                                 | Criteria                                          | Block Allocation |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | Reputation >= 70th percentile AND stake >= median | 40% of blocks    |
| **DPoS** (Delegated Proof-of-Stake)  | Total delegation >= 10,000 QOR                    | 35% of blocks    |
| **PoS** (Proof-of-Stake)             | All remaining active validators                   | 25% of blocks    |

In the design, block proposers within each pool are selected by weighted random selection proportional to their effective stake, so that both high-reputation and high-delegation validators receive fair representation while smaller validators can still participate.

### Query the Pool Configuration

```bash
# Pool weights and classification parameters (there is no per-validator classification query)
qorechaind query qca config
```

Via JSON-RPC:

> **Not served yet:** no released node build serves the `qor_` JSON-RPC namespace, so this call returns `-32601` (method not found) on every public endpoint today. See [the `qor_` namespace](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPoolClassification",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

---

## Bonding Curve

:::note Design, not yet active
The bonding curve is implemented in `x/qca` but is not yet wired into reward distribution; staking rewards today follow the standard distribution module. The formula below is the design.
:::

The staking reward for a validator is designed to be determined by a bonding curve that incorporates multiple factors:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Description                                                |
| -------- | ---------------------------------------------------------- |
| `R`      | Reward amount                                              |
| `beta`   | Base reward rate                                           |
| `S`      | Effective stake                                            |
| `alpha`  | Loyalty scaling constant                                   |
| `L`      | Loyalty duration (continuous staking time)                 |
| `Q(r)`   | Reputation quality factor, range \[0.75 - 1.25]            |
| `P(t)`   | Protocol phase multiplier (adjusts over network lifecycle) |

**Key takeaways:**

* **Loyalty duration bonus:** the design adds a logarithmic term for continuous staking time.
* **Reputation quality factor:** ranges from 0.75 (poor reputation) to 1.25 (excellent reputation). The reputation formula weights are on chain (`qorechaind query reputation params`).
* **Protocol phase multiplier:** adjusts as the network matures through different phases (bootstrap, growth, maturity).

---

## Slashing {#slashing}

The base infraction penalties, queryable live and current as of this writing:

```bash
qorechaind query slashing params
```

| Parameter | Value |
| --- | --- |
| Signed-blocks window | 10,000 blocks (about 8.7 hours on mainnet at 3.1 s per block; shorter on the testnet) |
| Minimum signed per window | 5% (`min_signed_per_window` = 0.05): a validator is jailed when it signs **fewer than 5%** of the last 10,000 blocks, that is, when it misses more than 95% |
| Downtime jail duration | 600 seconds (10 minutes) |
| Downtime slash fraction | 1% of stake |
| Double-sign slash fraction | 5% of stake |

Jailing is a fixed 10-minute timeout with a fixed penalty. Unbonding takes 21 days (1,814,400 s), the active set holds at most 100 validators (`max_validators`) and each delegator can have at most 7 unbonding entries (`max_entries`). The progressive model below is a separate design that would layer additional, escalating consequences on top of repeat offences; it is not yet wired in.

## Progressive Slashing

:::note Design, not yet active
Progressive slashing is implemented in `x/qca` but is not wired into slashing: the penalties in force are the standard `x/slashing` values in the table above. The parameters below are the design (`qorechaind query qca config`).
:::

The progressive slashing design escalates penalties for repeat offenders while allowing validators to recover over time:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parameter                    | Value          |
| ---------------------------- | -------------- |
| Maximum penalty per event    | 33% of stake   |
| Decay half-life              | 100,000 blocks |
| Downtime severity            | 1.0            |
| Double-sign severity         | 2.0            |
| Light client attack severity | 3.0            |

1. **Each infraction increments the effective count.** Every infraction (downtime, double-signing, etc.) increases the validator's effective count, which affects future penalties.

2. **Penalty escalates exponentially.** The penalty escalates based on the effective count using the formula above, so repeat offenders face much larger penalties.

3. **Effective count decays over time.** The effective count decays with a half-life of 100,000 blocks (about 3.6 days at mainnet's 3.1 s blocks), allowing validators to recover after a period of good behavior.

4. **Single events vs repeated infractions.** A single accidental downtime event results in a minor penalty, while repeated infractions trigger exponentially increasing consequences.

---

## PQC Key Registration {#pqc-key-registration}

Register your **post-quantum cryptographic (PQC) public key** (ML-DSA-87) **before** running `create-validator`, and as early as you can: the [Validator Readiness](/dashboard/tools-hub#validator-application) panel checks it from the moment you apply. This is **not optional and not automatic**: the chain requires a hybrid PQC signature on every Cosmos-lane transaction, `MsgCreateValidator` is not one of the exempted message types, and no account registers its key automatically: registration is an explicit transaction that every account (validator operators included) must send itself, ahead of time. Generate the key first:

```bash
qorechaind tx pqc gen-key mypqc          # prints the public key (hex); stored unencrypted under ~/.qorechaind/pqc/
```

```bash
qorechaind tx pqc register-key-v2 dilithium5 <pubkey-hex> hybrid \
  --from mykey \
  --pqc-key mypqc \
  --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  -y
```

`--pqc-key mypqc` attaches a **proof of possession**: the key signs `qorechain-pqc-pop-v1|chainid|algo|address|hex(pubkey)` and the chain verifies it, so nobody can register a public key whose private half they do not hold. It is optional in v3.2.3 and recommended. From v3.2.4 (mainnet since 23 October 2026, testnet since 19 October 2026) the account record also reports whether a proof was verified (`possession_proven`, in `GET /qorechain/pqc/v1/account/{address}`).

:::note What v3.2.3 changed for key registration
* An account with **no** registered key can send only the registration itself: any other transaction carrying a hybrid signature extension is refused. Register first, then sign everything else with `tx pqc cosign`.
* `classical_only`, empty and degenerate keys are refused at registration.
* Once an account holds a key, further key maintenance (rotation, migration, re-registration) must itself be hybrid-signed, and cannot be sent through `authz`.
* `tx pqc gen-key` never overwrites an existing key file.
:::

| Parameter      | Description                                       |
| -------------- | ------------------------------------------------- |
| `dilithium5`   | Algorithm (ML-DSA-87)                             |
| `<pubkey-hex>` | 2592-byte ML-DSA-87 public key in hex encoding    |
| `hybrid`       | Key type (hybrid = both classical + PQC)          |

(`qorechaind tx pqc register-key <pubkey-hex> hybrid` is the equivalent legacy form for Dilithium-5.)

:::caution Set `--gas` explicitly
The ML-DSA-87 public key is 2,592 bytes, and writing it on-chain can exceed the default 200,000 gas limit (registrations on mainnet have used 220,000 to 350,000 gas). Without `--gas 600000` (or higher), the transaction can fail with an opaque `out of gas` error. The fee must be at least the gas limit times 0.1 uqor, so `--gas 600000` needs `--fees 60000uqor` or more.
:::

Verify registration:

```bash
qorechaind query pqc account <account-address>
```

The key file under `~/.qorechaind/pqc/` is the account's post-quantum signing key: back it up like the mnemonic and keep it off the machine that runs the consensus key where you can. See [Post-Quantum Signing](/developer-guide/post-quantum-signing#pqc-key-registration) for recovery and rotation.

---

## Monitoring

### Prometheus Metrics

QoreChain exposes Prometheus metrics on port **26660**:

```
http://localhost:26660/metrics
```

Enable the endpoint with `prometheus = true` in the `[instrumentation]` section of `config.toml`. The node exposes the consensus engine's standard metrics (block height, consensus rounds, validator set, peers, mempool); list what your node serves with `curl -s localhost:26660/metrics | grep -i -E 'height|validator|peers|mempool'`. Per-validator signing health is read most reliably from the chain itself (see Health Checks below), since it is the chain's own record that decides jailing.

### Query Reputation Parameters

```bash
# Formula weights only (there is no per-validator score query)
qorechaind query reputation params
```

Via JSON-RPC:

> **Not served yet:** no released node build serves the `qor_` JSON-RPC namespace, so this call returns `-32601` (method not found) on every public endpoint today. See [the `qor_` namespace](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getReputationScore",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

### Health Checks

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status BOND_STATUS_BONDED | grep "my-validator"
```

---

## Operational Best Practices

1. **Use a sentry node architecture.** Run your validator behind sentry nodes to protect it from DDoS attacks. Only expose sentry nodes to the public network.

2. **Set up alerting.** Configure alerts for missed blocks, low uptime, and unexpected restarts. A few missed blocks are normal; sustained misses will trigger slashing.

3. **Maintain high uptime.** Sustained downtime gets the validator jailed (fewer than 5% of the last 10,000 blocks signed) and slashed; see [Slashing](#slashing).

4. **Keep software updated.** Track QoreChain releases and apply updates promptly. Coordinate with the validator community for chain upgrades.

5. **Secure your keys.** Protect the validator consensus key (`priv_validator_key.json`) and keep backups offline; consider a remote signer. Remote signing (`priv_validator_laddr`) has not been verified with the `qorechaind` release binary, and the post-quantum module does not change the consensus key type (ed25519), so test any signer setup on the testnet before you rely on it. Keep the operator account's keys and its PQC key file off the machine that runs the validator where you can.

6. **Register a PQC key first.** The operator account needs a registered ML-DSA-87 key before it can create a validator or send any other Cosmos-lane transaction.

7. **Keep the clock synchronised.** Run an NTP client; from v3.2.1 the node stops when its clock is more than 60 seconds out.

---

## Validator Commands Reference

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --new-moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey --gas 300000 --fees 30000uqor --generate-only > tx.json

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Withdraw rewards and commission
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Sign and broadcast any of the above (hybrid signature):
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

The network fee floor is 0.1 uqor per unit of gas. An operator account that has **no** registered PQC key can still send `unjail` classically; once a key is registered, every transaction (unjail included) needs the hybrid signature.

---

## Validating Connected Networks {#connected-networks}

:::caution No connected network is active yet
The bridge module is deployed on mainnet and testnet, but **no bridge route is active**: all 37 chain configurations are in `pending` status, no bridge validators are registered, no bridge operation has ever been created, and no IBC channel is open on mainnet (the testnet has one transfer channel, which is not a bridge route). The framework below describes the design; there is nothing to validate on a connected network today.
:::

The design (since chain version **v3.1.80**) lets a QoreChain validator also help validate the networks connected through the [bridge](/architecture/bridge-architecture). It is **license-gated and opt-in**:

1. **Hold the license.** The validator must hold an active `validator_<chain>` (or `qcb_bridge`) license for the target network. The orchestrator refuses to start an external client without it (fail-closed).
2. **Activation auto-provisions the client.** When the license is activated, QoreChain provisions the matching network's client on your node — downloading the pinned client, rendering its config, and running it under QoreChain's orchestration. Nothing is fetched until activation.
3. **Supply the network's keys and stake.** The external network's validator/stake and signing keys are **operator-supplied** per network; QoreChain ships the driver framework and the enforced license gate, not your external-chain stake.

Drivers exist for all **37 bridge networks**, classified by how a validator can participate:

| Class | Participation | Examples |
| ----- | ------------- | -------- |
| Permissionless validator | Stake and run | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Capped / elected / admission | Stake, subject to a cap or election | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| L2 full-node | Run a full node (no staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Non-staking / trust-list | Observe / participate without staking | Bitcoin, Filecoin, XRPL, Stellar |

:::note
Client version pins are best-effort; verify the upstream client release for your target network before a production activation.
:::

## Next Steps

* [Running a Node](/developer-guide/running-a-node) — Install the release binary, state sync and node settings
* [EVM Development](/developer-guide/evm-development) — Deploy smart contracts on QoreChain
* [Post-Quantum Signing](/developer-guide/post-quantum-signing) — Key registration, recovery and rotation
