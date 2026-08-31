---
slug: /developer-guide/running-a-validator
title: Running a Validator
sidebar_label: Running a Validator
sidebar_position: 9
---

# Running a Validator

This guide covers how to create a validator on the QoreChain network, understand the pool classification system, register a PQC key for quantum-resistant security, and monitor your node.

:::note
This guide targets the **`qorechain-vladi`** mainnet (EVM chain ID **9801**), live since 7 June 2026 running chain version **v3.1.95**. The **`qorechain-diana`** testnet (EVM chain ID **9800**) is recommended for rehearsing your setup before going live. Substitute the appropriate `--chain-id` for your target network.
:::

---

## Prerequisites

* A fully synced `qorechaind` node (see [Connecting to Testnet](/getting-started/connecting-to-testnet))
* A funded account with at least **100,000 QOR** (100,000,000,000 uqor) for the initial self-delegation — this minimum is enforced on-chain and `create-validator` is rejected below it
* An active **`validator_operator` license** on your account — see the note below; without it, `create-validator` fails with `ErrUnauthorized` regardless of how much QOR you self-bond
* Familiarity with the [Staking and Delegation](/user-guide/staking-and-delegation) model

---

## Creating a Validator

### License gate: `validator_operator` {#validator-license-gate}

`create-validator` is gated by two independent checks, both enforced on-chain, and you need both — a large self-bond alone is not enough:

1. **Minimum self-bond of 100,000 QOR.**
2. **An active `validator_operator` license** on the account submitting the transaction.

A license's `expires_at` is a **block height**, not a date or duration — `0` means no expiry. Missing or expired, and `create-validator` fails with `ErrUnauthorized`, no matter how much you self-bond; this is the single most common reason a well-funded attempt fails and looks unexplained. This gate exists specifically because the EVM execution lane cannot see or enforce it (a single ante decorator there would bypass it entirely) — it is one of the reasons staking and validation stay exclusively on the Native lane.

```bash
qorechaind tx staking create-validator \
  --amount 100000000000uqor \
  --pubkey $(qorechaind comet show-validator) \
  --moniker "my-validator" \
  --commission-rate 0.10 \
  --commission-max-rate 0.20 \
  --commission-max-change-rate 0.01 \
  --min-self-delegation 1 \
  --from mykey \
  --gas auto \
  --gas-adjustment 1.3 \
  -y
```

| Parameter                      | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| `--amount`                     | Self-delegation amount — **100,000 QOR minimum** (`100000000000uqor`) |
| `--pubkey`                     | Validator consensus public key (ed25519)           |
| `--moniker`                    | Human-readable name for your validator             |
| `--commission-rate`            | Initial commission rate (e.g., 0.10 = 10%)         |
| `--commission-max-rate`        | Maximum commission rate (immutable after creation) |
| `--commission-max-change-rate` | Maximum daily commission change rate               |
| `--min-self-delegation`        | Minimum tokens the operator must self-delegate     |

After the transaction confirms, verify your validator:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Pool Classification

QoreChain uses a **three-pool classification system** managed by the `x/qca` (Quantum Consensus Allocation) module. Every **1,000 blocks**, validators are reclassified into one of three pools based on their reputation and stake:

| Pool                                 | Criteria                                          | Block Allocation |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | Reputation >= 70th percentile AND stake >= median | 40% of blocks    |
| **DPoS** (Delegated Proof-of-Stake)  | Total delegation >= 10,000 QOR                    | 35% of blocks    |
| **PoS** (Proof-of-Stake)             | All remaining active validators                   | 25% of blocks    |

Within each pool, block proposers are selected using **weighted random selection** proportional to their effective stake. The classification ensures that both high-reputation and high-delegation validators receive fair representation, while still allowing smaller validators to participate.

### Query Your Pool Classification

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

Via JSON-RPC:

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

The staking reward for a validator is determined by a bonding curve that incorporates multiple factors:

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

* **Loyalty duration bonus:** Validators who stake continuously receive increasing rewards via the logarithmic loyalty term. This incentivizes long-term commitment.
* **Reputation quality factor:** Ranges from 0.75 (poor reputation) to 1.25 (excellent reputation). Reputation is computed from uptime, successful proposals, community participation, and transaction validation quality.
* **Protocol phase multiplier:** Adjusts as the network matures through different phases (bootstrap, growth, maturity).

---

## Slashing

The base infraction penalties, queryable live and current as of this writing:

```bash
qorechaind query slashing params
```

| Parameter | Value |
| --- | --- |
| Signed-blocks window | 10,000 blocks (roughly 6 hours to accumulate) |
| Minimum signed per window | 95% (jails below this) |
| Downtime jail duration | 600 seconds (10 minutes) |
| Downtime slash fraction | 1% of stake |
| Double-sign slash fraction | 5% of stake |

Jailing is a fixed 10-minute timeout with a fixed penalty — it is separate from the progressive model below, which layers additional, escalating consequences on top of repeat offenses over a longer horizon.

## Progressive Slashing

QoreChain uses a **progressive slashing** model that escalates penalties for repeat offenders while allowing validators to recover over time:

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

3. **Effective count decays over time.** The effective count decays with a half-life of 100,000 blocks (\~7 days at 6s blocks), allowing validators to recover after a period of good behavior.

4. **Single events vs repeated infractions.** A single accidental downtime event results in a minor penalty, while repeated infractions trigger exponentially increasing consequences.

---

## PQC Key Registration {#pqc-key-registration}

Register your **post-quantum cryptographic (PQC) public key** — ML-DSA-87 — **before** applying for a validator license or running `create-validator`. This is **not optional and not automatic**: the chain requires a hybrid PQC signature on every cosmos-path transaction, `MsgCreateValidator` is not one of the exempted message types, and — unlike a regular account, which registers its key automatically on its first transaction — a validator must run this command itself, on its own node, ahead of time.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas 600000 \
  -y
```

| Parameter      | Description                                       |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | 2592-byte ML-DSA-87 public key in hex encoding    |
| `hybrid`       | Registration mode (hybrid = both classical + PQC) |

:::caution Set `--gas` explicitly
The ML-DSA-87 public key is 2,592 bytes, and writing it on-chain exceeds the default 200,000 gas limit. Without `--gas 600000` (or higher), the transaction fails with an opaque `out of gas in location: WritePerByte` error.
:::

Verify registration:

```bash
qorechaind query pqc key <account-address>
```

---

## Monitoring

### Prometheus Metrics

QoreChain exposes Prometheus metrics on port **26660**:

```
http://localhost:26660/metrics
```

Key metrics to monitor:

| Metric                          | Description                                     |
| ------------------------------- | ----------------------------------------------- |
| `qorechain_missed_blocks_total` | Total blocks missed by your validator           |
| `qorechain_validator_uptime`    | Uptime percentage over the last N blocks        |
| `qorechain_reputation_score`    | Current reputation score                        |
| `qorechain_pool_classification` | Current pool assignment (0=PoS, 1=DPoS, 2=RPoS) |
| `qorechain_consecutive_signed`  | Consecutive blocks signed                       |
| `consensus_height`              | Current block height                            |
| `consensus_rounds`              | Consensus rounds for current height             |

### Query Reputation Score

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

Via JSON-RPC:

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
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## Operational Best Practices

1. **Use a sentry node architecture.** Run your validator behind sentry nodes to protect it from DDoS attacks. Only expose sentry nodes to the public network.

2. **Set up alerting.** Configure alerts for missed blocks, low uptime, and unexpected restarts. A few missed blocks are normal; sustained misses will trigger slashing.

3. **Maintain high uptime.** The reputation system rewards consistent uptime. Extended downtime degrades your reputation quality factor, reducing rewards.

4. **Keep software updated.** Track QoreChain releases and apply updates promptly. Coordinate with the validator community for chain upgrades.

5. **Secure your keys.** Use a hardware security module (HSM) or remote signer for the validator consensus key. Never store keys on the same machine as the node.

6. **Register a PQC key.** Future-proof your validator against quantum threats by registering an ML-DSA-87 key.

7. **Monitor your pool.** Track your pool classification every 1,000 blocks. Improving your reputation can move you from PoS to RPoS, significantly increasing block proposal opportunities.

---

## Validator Commands Reference

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey -y

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey -y

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey -y

# Withdraw rewards
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey -y
```

---

## Validating Connected Networks {#connected-networks}

As of chain version **v3.1.80**, a QoreChain validator can also help validate the networks connected through the [bridge](/architecture/bridge-architecture). This is **license-gated and opt-in**:

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

* [Building from Source](/developer-guide/building-from-source) — Build the `qorechaind` binary
* [EVM Development](/developer-guide/evm-development) — Deploy smart contracts on QoreChain
* [Account Abstraction](/developer-guide/account-abstraction) — Programmable accounts for your validator operations
