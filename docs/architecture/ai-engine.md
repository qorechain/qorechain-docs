---
slug: /architecture/ai-engine
title: AI Engine
sidebar_label: AI Engine
sidebar_position: 4
---

# AI Engine

QoreChain integrates AI capabilities at multiple levels of the protocol stack through the `x/ai` module. The on-chain layer provides deterministic heuristic-based analysis suitable for consensus-critical operations, while an off-chain sidecar extends capabilities with deep learning models for advisory and developer tooling.

## Three-Layer Architecture

The QCAI (QoreChain AI) engine operates across three layers:

| Layer                 | Scope                                                  | Execution                | Deterministic |
| --------------------- | ------------------------------------------------------ | ------------------------ | ------------- |
| **Consensus Level**   | Block production, parameter tuning                     | On-chain (x/rlconsensus) — observation only today | Yes           |
| **Network Level**     | Transaction routing, fraud detection, fee optimization | On-chain (x/ai)          | Yes           |
| **Application Level** | Contract generation, auditing, deep analysis           | Off-chain (sidecar)      | No            |

The consensus level is documented separately in the [PRISM Consensus Engine](/architecture/prism-consensus-engine). This page covers the network and application levels.

:::note What is enforced on the live networks (mainnet v3.2.3, testnet v3.2.4)
Two parts of `x/ai` act on transactions today, on both the Cosmos lane and the EVM lane:

* A **per-sender rate limit**. The live limit is **600 transactions per minute per sender** (`max_tx_per_minute`; the EVM lane has its own optional limit, which is not set, so the same value applies). The "minute" is counted over a fixed window of blocks, not wall-clock time, because block height is the only clock every validator shares. A sender at the limit has further transactions refused until older ones leave the window. The limit has been enforced on the Cosmos lane since v3.2.0 and on both lanes since v3.2.2.
* An **anomaly score** for each transaction. The live `anomaly_action` is `flag`: a high score emits an `ai_anomaly_check` event and counts the transaction as flagged, but does not refuse it. Refusing on score is a governance setting that is not enabled.

Everything else on this page (the router, the six-layer fraud pipeline, the fee optimizer, the network optimizer, the sidecar) describes analysis and advice: none of it changes which transactions the chain accepts, and the six-layer pipeline is not called from the transaction path. Read the live settings with `qorechaind query ai config` and the counters with `qorechaind query ai stats`.
:::

## Transaction Router

The AI-enhanced router selects optimal validators and routes for each transaction using weighted multi-factor scoring.

### Optimization Formula

```
OptimalRoute = argmin_r( alpha * Latency(r) + beta * Cost(r) + gamma * Security(r)^-1 )
```

| Weight   | Symbol | Default | Description                                                                      |
| -------- | ------ | ------- | -------------------------------------------------------------------------------- |
| Latency  | alpha  | 0.4     | Normalized response time (0=best, 1=worst). 0ms maps to 0.0, 1000ms maps to 1.0. |
| Cost     | beta   | 0.3     | Current load percentage as a proxy for cost.                                     |
| Security | gamma  | 0.3     | Inverse of reputation score. Higher reputation yields a lower (better) score.    |

The router maintains a **metrics cache** (default TTL: 30 seconds) with per-validator performance data including average latency, uptime percentage, load percentage, and reputation score. When cached metrics are unavailable, the system falls back to the heuristic router.

### Routing Confidence

Confidence scales with the number of validators with available metrics:

| Validators with Metrics | Confidence |
| ----------------------- | ---------- |
| >= 10                   | 0.95       |
| >= 5                    | 0.85       |
| >= 2                    | 0.75       |
| 1                       | 0.60       |

## Fraud Detection

The fraud detector implements a **six-layer detection pipeline** that analyzes each transaction against recent history using statistical methods.

### Detection Layers

| Layer | Detector                | Method                                                                | Trigger Threshold                                          |
| ----- | ----------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1     | **Isolation Forest**    | Statistical Z-score across amount, gas, and sender frequency features | Anomaly score > 0.7                                        |
| 2     | **Sequence Analyzer**   | Detects alternating send/receive patterns (wash trading)              | > 3 alternating transfers between same pair                |
| 3     | **Sybil Detector**      | Tracks new unique addresses; flags spikes in new senders              | > 30% of recent transactions from new addresses            |
| 4     | **DDoS Detector**       | Monitors per-sender transaction frequency                             | > 100 transactions per minute from a single sender         |
| 5     | **Flash Loan Detector** | Identifies borrow-manipulate-repay patterns within a single block     | >= 3 transactions in same block with > 10x amount variance |
| 6     | **Exploit Detector**    | Flags abnormal gas consumption in contract calls                      | > 5x average gas for the same transaction type             |

### Threat Classification

| Confidence Range | Threat Level |
| ---------------- | ------------ |
| >= 0.9           | Critical     |
| >= 0.7           | High         |
| >= 0.5           | Medium       |
| >= 0.3           | Low          |
| &lt; 0.3         | None         |

### Response Actions

| Threat Level | Confidence | Action                                                       |
| ------------ | ---------- | ------------------------------------------------------------ |
| Critical     | > 0.8      | `circuit_break` — Pause specific contract executions         |
| Critical     | &lt;= 0.8  | `rate_limit` — Temporarily reduce TX acceptance from source  |
| High         | > 0.7      | `rate_limit`                                                 |
| High         | &lt;= 0.7  | `alert` — Emit event for validators and operators            |
| Medium       | Any        | `alert`                                                      |
| Low / None   | Any        | `allow`                                                      |

When an action other than `allow` is triggered, the pipeline creates a fraud investigation record with a unique ID (format: `INV-{block_height}-{txhash}`, truncated to 48 characters). On the live networks the pipeline is not called from the transaction path (see the note at the top of this page), so no investigation records are produced today and no contract circuit breaker is set by it.

## Fee Optimizer

The fee optimizer predicts network congestion and suggests optimal fees for desired confirmation times using exponential moving average (EMA) congestion tracking.

### Congestion Prediction

* **EMA smoothing factor (alpha)**: 0.2
* **History window**: 100 blocks
* **Trend analysis**: Compares the most recent 5 blocks against the prior 5 blocks to detect congestion trends, then projects forward with 50% dampening.

### Urgency Tiers

| Urgency  | Base Multiplier | Estimated Confirmation |
| -------- | --------------- | ---------------------- |
| `fast`   | 2.0x            | 1-2 blocks             |
| `normal` | 1.0x            | 3-5 blocks             |
| `slow`   | 0.5x            | 6-10 blocks            |

The final fee incorporates a **congestion multiplier** (1.0x at 0% congestion, up to 5.0x at 100% congestion) and a **trend premium** when predicted congestion exceeds current congestion. The estimator's own minimum fee is a legacy constant of 500 uqor; it is not exposed on the live networks, and the fee that a transaction actually has to pay is set by the network floor of 0.1 uqor per unit of gas (see [First Transaction](/getting-started/first-transaction#send-qor)).

## Network Optimizer

The network optimizer continuously monitors performance metrics and generates governance parameter recommendations using a multi-objective reward function.

### Reward Function

```
R(s, a, s') = alpha * DeltaPerformance + beta * DeltaLatency + gamma * DeltaEnergy - delta * StabilityPenalty
```

| Weight | Value | Objective               |
| ------ | ----- | ----------------------- |
| alpha  | 0.35  | Performance improvement |
| beta   | 0.30  | Latency reduction       |
| gamma  | 0.15  | Energy/resource savings |
| delta  | 0.20  | Stability preservation  |

### Recommendation Types

The optimizer generates recommendations for:

* **Block gas limit**: Increase when utilization > 80%, decrease when &lt; 20%
* **Minimum commission rate**: Lower when validator count is below 5
* **Maximum validators**: Increase when block times are healthy and >= 10 validators active
* **Block time target**: Alert when average block time exceeds 8 seconds

Each recommendation includes the current value, suggested value, expected impact, confidence score, and reasoning.

## AI Sidecar

The QCAI Sidecar extends on-chain AI with off-chain deep learning models backed by the QCAI Backend. The sidecar is optional and non-consensus-critical, and is reached over an internal gRPC interface.

### Capabilities

| Capability              | Description                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Contract Generation** | Generates smart contracts from natural language specifications across 17 platforms  |
| **Contract Auditing**   | Deep security analysis of smart contract code                                       |
| **Deep Fraud Analysis** | Extended fraud investigation using trained models (supplements on-chain heuristics) |
| **Network Advice**      | Advanced parameter optimization recommendations                                     |

### Models

| Model Name    | Use Case                                             |
| ------------- | ---------------------------------------------------- |
| QCAI Fast     | Low-latency responses for fee estimation and routing |
| QCAI Balanced | Deeper analysis for auditing and fraud investigation |

The sidecar runs as an independent off-chain service so that deep-learning workloads never block or influence consensus-critical execution.

## EVM Precompiles

Two precompiled contracts expose on-chain AI capabilities to EVM smart contracts:

| Precompile       | Address  | Description                                                           |
| ---------------- | -------- | --------------------------------------------------------------------- |
| `aiRiskScore`    | `0x0B01` | Returns a risk score (0-100) for a given address or transaction hash  |
| `aiAnomalyCheck` | `0x0B02` | Returns a boolean anomaly flag and confidence score for a transaction |

:::warning Not active yet
These precompiles are **not active** on mainnet (`qorechain-vladi`) or testnet (`qorechain-diana`); a call returns empty data. They will be activated only after they get a read-only, fixed-point scoring path. See [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

**Important**: EVM precompiles use the **deterministic heuristic engine only**. They never call the sidecar, ensuring all EVM execution remains fully deterministic and reproducible. Since v3.2.3 the anomaly-check precompile analyses a transaction without writing state; the other precompile hardening in that release (the CrossVM bridge refusing `STATICCALL`, metering its nested call against the calling frame's gas, and reaching only allowlisted QoreChain Native targets) applies once the CrossVM precompile is activated. As of 20 October 2026 the `active_static_precompiles` list is empty on both networks.

## TEE Attestation

The AI module defines interfaces for **Trusted Execution Environment** attestation, enabling future verifiable AI model execution inside secure hardware enclaves.

### Supported Platforms

| Platform    | Identifier | Description                                            |
| ----------- | ---------- | ------------------------------------------------------ |
| Intel SGX   | `sgx`      | Software Guard Extensions                              |
| Intel TDX   | `tdx`      | Trust Domain Extensions                                |
| AMD SEV-SNP | `sev-snp`  | Secure Encrypted Virtualization - Secure Nested Paging |
| ARM CCA     | `arm-cca`  | Confidential Compute Architecture                      |

### Attestation Flow

1. **Load model weights** — The sidecar loads AI model weights into a TEE enclave.
2. **Run inference inside enclave** — Inference runs inside the enclave's protected memory.
3. **Produce attestation report** — The enclave produces an attestation report binding the model hash, input hash, and output hash.
4. **Verify attestation on-chain** — Validators verify the attestation on-chain before accepting inference results.

TEE attestation is currently at the interface specification stage. Implementation is planned for a future release.

## Federated Learning

The AI module defines interfaces for **on-chain federated learning** coordination, where validator nodes train local models and submit gradient updates that are aggregated into a global model without sharing raw training data.

### Aggregation Methods

| Method     | Description                                                             |
| ---------- | ----------------------------------------------------------------------- |
| `fedavg`   | Federated Averaging — weighted average of gradients by sample count     |
| `fedprox`  | Federated Proximal — adds a proximal term to handle heterogeneous data  |
| `scaffold` | SCAFFOLD — uses control variates to correct for client drift            |

### Round Lifecycle

```
Pending --> Training --> Aggregating --> Complete
                                    \-> Failed (timeout or insufficient participants)
```

Each round is configured with minimum/maximum participants, timeout, learning rate, gradient clipping norm, and an optional differential privacy noise multiplier. All gradient submissions are signed with PQC (Dilithium-5) signatures.

Federated learning is currently at the interface specification stage. Implementation is planned for a future release.

## Queries

`qorechaind query ai config` and `qorechaind query ai stats` (gRPC) are the module's queries. The module has no REST routes today: the `/ai/v1/...` fee-estimate, fraud-investigation, network-recommendation and circuit-breaker routes are not served on mainnet or testnet.

## Related

* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — the AI layer designed for consensus optimization (observation only today).
* [Smart Contract Creator](/dashboard/smart-contract-creator) — AI-assisted contract generation in the Dashboard.
* [Contract Auditor](/dashboard/contract-auditor) — AI-assisted contract security review.
