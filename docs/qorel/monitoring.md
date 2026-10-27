---
slug: /qorel/monitoring
title: Monitoring QORel
sidebar_label: Monitoring
sidebar_position: 7
---

# Monitoring

A relayer that stops quietly leaves packets pending, so it should be watched. This page lists what QORel exposes (Prometheus telemetry, an optional REST endpoint, logs and commands) and what to alert on. It is for operators who run a relayer for a channel they care about.

## Innovations {#innovations}

- **A post-quantum readiness check you can script.** `qorel keys pqc-status` prints a JSON object whose `ready_to_relay` field is `true` only when the key is registered on chain and matches the local key. An alert on that field catches a missing or changed key before the relayer is refused.
- **Failures that do not silently stop relaying.** Packet workers keep running and retry at every clear interval after a failed relay or clearing attempt, so a brief rate limit shows up as warnings in the log and not as a stuck channel.
- **A pre-send check with a reason.** When the pre-send check refuses a transaction (key not registered, key mismatch, sign-bytes version unknown), nothing is sent and the reason is logged and shown by `qorel health-check`.

## How to use {#how-to-use}

### Telemetry {#telemetry}

Enable it in the config:

```toml
[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

The metrics are served in Prometheus format at `http://127.0.0.1:3001/metrics`. They are the Hermes metrics; Prometheus shows counters with a `_total` suffix. The ones worth graphing:

| Metric | Why |
|---|---|
| `workers` | Number of running workers by type; a drop means a worker has stopped. |
| `backlog_size`, `backlog_oldest_sequence` | Packets waiting on a channel and the oldest sequence still waiting. |
| `wallet_balance` | The relayer's balance on each chain. |
| `receive_packets_confirmed`, `acknowledgment_packets_confirmed`, `timeout_packets_confirmed` | Packets relayed. A flat line while the backlog grows is a stall. |
| `client_updates_submitted`, `client_misbehaviours_submitted` | Light-client upkeep and misbehaviour reports. |
| `broadcast_errors`, `simulate_errors` | Transactions that were refused or failed to simulate. |
| `ws_reconnect` | WebSocket reconnects; many in a row point at an unstable endpoint. |
| `tx_latency_submitted`, `tx_latency_confirmed` | How long transactions take. |

Hermes documents the full set in its [telemetry guide](https://hermes.informal.systems/documentation/telemetry/operators.html). The listener is on `127.0.0.1` in the example config; put your Prometheus scraper on the same host or change `host` deliberately.

### What to alert on {#alerts}

| What | Where |
|---|---|
| Process up | The telemetry endpoint answers |
| Pending packets and acknowledgements on your channels | `qorel query packet pending --chain <id> --port transfer --channel <channel>` |
| Relayer balance on each chain | `qorel keys balance --chain <id>`, or `wallet_balance` |
| Post-quantum key ready | `qorel keys pqc-status` reports `ready_to_relay: true` |
| Client freshness | QORel refreshes a client at one third of its trusting period; alert if a client has not been updated for about half of it |
| Errors | `broadcast_errors` and `simulate_errors` rising |

A small check for the key state, suitable for cron or a monitoring agent:

```bash
qorel --json keys pqc-status --chain qorechain-diana | jq -e '.result.ready_to_relay == true'
```

It exits non-zero when the key is not ready.

### Logs {#logs}

`log_level = 'info'` in `[global]` is the default. With the systemd package the logs go to the journal:

```bash
journalctl -u qorel -f
```

A log line starting with `post-quantum sign bytes` appears when QORel reads the sign-bytes version from the chain and it changes. Warnings about `429` responses from an endpoint mean the endpoint is rate-limiting; QORel retries.

### REST endpoint {#rest}

The optional REST server (`[rest]` in the config, port 3000 in the example, disabled by default) exposes the relayer's state for inspection. Leave it bound to `127.0.0.1`.

### Checks by hand {#by-hand}

```bash
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
```

## How to access {#how-to-access}

- Telemetry and REST are local to the relayer host; both are off the public network unless you expose them.
- `qorel` commands read the same config file as the relayer.
- The public REST endpoint for the QoreChain testnet (`https://api-testnet.qore.host`) shows channel and token-trace state; see [Connecting to the Testnet](/getting-started/connecting-to-testnet).

## Where it is published {#where-published}

Monitoring is part of the `qorel` binary; there is nothing separate to install. Source and the Hermes telemetry guide: [qorechain/QORel](https://github.com/qorechain/QORel), [hermes.informal.systems](https://hermes.informal.systems).

## Limits and known issues {#limits}

- **No hosted dashboard.** QORel does not ship dashboards or alert rules; build them from the metrics above.
- **Metric names are Hermes'.** QORel adds no post-quantum metrics in 0.1.0; use `keys pqc-status` for that state.
- **Rate limits are normal on public endpoints.** Alert on a sustained backlog, not on single `429` warnings.
- **Testnet only.** Nothing here has been run against a mainnet channel.
