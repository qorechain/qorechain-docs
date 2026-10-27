---
slug: /qorel/quickstart
title: QORel Quickstart
sidebar_label: Quickstart
sidebar_position: 4
---

# Quickstart

This walks through relaying between the QoreChain testnet `qorechain-diana` and the Cosmos Hub public testnet (chain ID `provider`): install, configure, add and register keys, check readiness, start the relayer, and send a first transfer. It is for someone who has not run a relayer before. Everything here is testnet; the tokens have no value.

## Innovations {#innovations}

- **Readiness is a single field.** `qorel keys pqc-status` ends in `ready_to_relay`. If it is `true`, the post-quantum key is registered on chain and matches the local key, and the relayer will not refuse its own transactions for that reason.
- **Nothing is sent when something is wrong.** The pre-send check stops a bad transaction before it reaches the chain, so a missed step costs no fee.
- **The same flow for every chain.** The steps for the Cosmos Hub side are Hermes' own; only the QoreChain chain entry and the registration step are new.

## How to use {#how-to-use}

### 1. Install {#step-install}

Install `qorel` with any method on the [Install](/qorel/install) page and check it:

```bash
qorel --version
```

### 2. Get the config {#step-config}

Copy the example config from the repository (`packaging/config.example.toml`; the `.deb` and `.rpm` put it at `/etc/qorel/config.example.toml`):

```bash
mkdir -p ~/.hermes
curl -o ~/.hermes/config.toml https://raw.githubusercontent.com/qorechain/QORel/main/packaging/config.example.toml
```

Open `~/.hermes/config.toml` and replace the placeholders for the QoreChain node (`YOUR-QORECHAIN-NODE`) with the RPC, gRPC and WebSocket addresses of a testnet node you run. QoreChain has no public gRPC endpoint, so you need your own node; see [Running a Node](/developer-guide/running-a-node) and [Connecting to the Testnet](/getting-started/connecting-to-testnet). Every setting is explained on [Configuration](/qorel/configuration).

The example config has two chains: `qorechain-diana` with `signing = 'qorechain-hybrid'`, and `provider` with the default standard signing. It limits relaying to `transfer/channel-0` on QoreChain and `transfer/channel-600` on the Hub testnet.

### 3. Create and fund the relayer accounts {#step-accounts}

Make a new account for the relayer on each chain. Use a dedicated account, never a validator operator key. Save each account's mnemonic to a file that only you can read:

```bash
umask 077
nano ./diana.mnemonic       # paste the mnemonic, save
nano ./provider.mnemonic
```

The same mnemonic can serve both chains, or you can use a separate one for each. QORel derives with coin type 118 (`m/44'/118'/0'/0/0`) by default; pass `--hd-path` to `keys add` if your account uses another path.

Add the keys:

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./diana.mnemonic
qorel keys add --chain provider        --key-name relayer --mnemonic-file ./provider.mnemonic
```

On `qorechain-diana`, `keys add` also derives the ML-DSA-87 key from the same mnemonic and stores its seed next to the key as `relayer.pqc`. Delete the mnemonic files when you are done.

Then fund the accounts. Show the addresses with `qorel keys list --chain <id>`. Testnet QOR comes from the [Dashboard Faucet](/dashboard/faucet); test tokens for the Hub testnet come from that network's public faucet. A few tokens are enough for fees: QoreChain's floor is 0.1 uqor per gas, so a transaction with the default 400,000 gas limit costs about 40,000 uqor at the floor price. Check with:

```bash
qorel keys balance --chain qorechain-diana
qorel keys balance --chain provider
```

### 4. Register the post-quantum key {#step-register}

QoreChain only accepts a hybrid-signed transaction from an account that has registered its ML-DSA-87 public key. Registering is done once:

```bash
qorel keys register-pqc --chain qorechain-diana
```

It sends one transaction, signed with the classical key alone (the only kind of transaction QoreChain accepts that way), with a proof of possession. It is safe to run again: if the same key is already registered it sends nothing. If the account already has a different post-quantum key registered, it refuses and sends nothing.

Check readiness:

```bash
qorel keys pqc-status --chain qorechain-diana
```

The result is a JSON object with the fields `chain_id`, `account`, `local_public_key_sha256`, `registered`, `matches_local_key`, `registered_public_key_sha256`, `possession_proven`, `sign_bytes` and `ready_to_relay`. Continue only when `ready_to_relay` is `true`. See [Troubleshooting](/qorel/troubleshooting) if it is not.

### 5. Health check {#step-health}

```bash
qorel health-check
```

It checks the configuration and the connection to each chain, and reports a gas multiplier below 1.1 on a QoreChain entry as a possible misconfiguration (a warning; relaying still works).

### 6. Pick the channel {#step-channel}

The testnet already has a transfer channel: `channel-0` on `qorechain-diana`, whose counterparty is `channel-600` on `provider` ([The test channel](/user-guide/bridging-assets#ibc-test-channel)). To relay it, go straight to step 7.

To make a new channel of your own between the two chains instead:

```bash
qorel create channel \
  --a-chain qorechain-diana --b-chain provider \
  --a-port transfer --b-port transfer \
  --new-client-connection
```

`--new-client-connection` also creates the two light clients and the connection. This sends several transactions on each chain. The command prints the new channel identifiers; put them in the `packet_filter` of both chain entries.

### 7. Start the relayer {#step-start}

```bash
qorel start
```

Leave it running (use the systemd service or a container for a long-lived relayer; see [Running next to a validator](/qorel/running-next-to-a-validator)). QORel relays packets, refreshes the light clients and watches for misbehaviour.

### 8. Send a first transfer {#step-transfer}

In a second terminal, send 1000 uqor from QoreChain to the Hub testnet. QORel signs and sends this transaction itself, with the same hybrid signature:

```bash
qorel tx ft-transfer \
  --src-chain qorechain-diana --dst-chain provider \
  --src-port transfer --src-channel channel-0 \
  --amount 1000 --denom uqor \
  --timeout-seconds 600 \
  --receiver <a cosmos address on the Hub testnet>
```

Without `--receiver`, the tokens go to the relayer's own address on the destination chain. Then follow the packet:

```bash
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

The packet is listed until the running relayer delivers it and the acknowledgement comes back. On QoreChain you can also read the channel and the token traces over REST:

```bash
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
curl -s https://api-testnet.qore.host/ibc/apps/transfer/v1/denoms
```

A transfer that is not delivered before its timeout is refunded to the sender on the source chain by the relayer. The `--timeout-seconds` value above gives it ten minutes.

## How to access {#how-to-access}

- **Network.** Testnet `qorechain-diana` and the Cosmos Hub public testnet only.
- **You need.** QORel, a QoreChain testnet node you run (RPC, gRPC and WebSocket), reachable endpoints for the Hub testnet, one funded relayer account on each chain, and the mnemonic for each in a file.
- **Costs.** Fees in test tokens only: on QoreChain, gas times a price with a floor of 0.1 uqor per gas, with no refund of unused gas.
- **Container users.** Run each command above as `docker run --rm -v $HOME/.qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 <command>`, with the mnemonic files inside the mounted directory, and `start` as the long-running container ([Install](/qorel/install#container)).

## Where it is published {#where-published}

The binary and the example config come from the [QORel repository](https://github.com/qorechain/QORel) (`packaging/config.example.toml`); see [Install](/qorel/install) for every channel and [QORel overview](/qorel/overview#where-published) for versions.

## Limits and known issues {#limits}

- **Testnet only.** Mainnet IBC is not open; do not point this flow at mainnet.
- **You need your own QoreChain node.** There is no public gRPC endpoint.
- **A new channel costs fees on both chains** and adds a client and a connection. Prefer relaying `channel-0` unless you need your own.
- **Public Hub-side endpoints may rate-limit.** QORel keeps retrying, but for steady relaying use your own nodes.
- **Pending until relayed.** If no relayer is running for the channel, a transfer stays pending until one is started or the packet times out.

Next: [Configuration](/qorel/configuration), [Monitoring](/qorel/monitoring), [Troubleshooting](/qorel/troubleshooting).
