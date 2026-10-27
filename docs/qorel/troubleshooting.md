---
slug: /qorel/troubleshooting
title: QORel Troubleshooting and FAQ
sidebar_label: Troubleshooting
sidebar_position: 9
---

# Troubleshooting and FAQ

Questions and fixes for running QORel, in the order people usually hit them. It is for operators with a relayer that does not start, refuses to send, or leaves packets pending. QORel is testnet only today, so every answer assumes `qorechain-diana`.

## Innovations {#innovations}

Most problems on a hybrid chain are caught before a fee is spent:

- **The pre-send check names the problem.** If the post-quantum key is not loaded, not registered or not the local key, or the sign-bytes version is unknown, QORel sends nothing and says which one.
- **`keys pqc-status` is the first command to run.** It shows registration, key match, proof of possession, the sign-bytes version the chain verifies, and `ready_to_relay`.
- **`health-check` explains misconfigurations**, including a gas multiplier below 1.1 on a QoreChain entry.

## How to use {#how-to-use}

Run these first and compare:

```bash
qorel --version
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

### Keys and registration {#keys}

**`ready_to_relay` is `false`. What now?**
Read the other fields of `keys pqc-status`:
- `registered: false`: the account has no registered post-quantum key. Fund the account, then run `qorel keys register-pqc --chain qorechain-diana`.
- `registered: true` but `matches_local_key: false`: the account has a different key registered than the one QORel holds. Check that you used the account's own mnemonic and the right `--key-name`. If you re-added the key, `keys add --overwrite` rebuilds the local key and its `<key name>.pqc` seed from the mnemonic.
- The command fails to load the key: the `<key name>.pqc` file next to the key is missing or unreadable. Run `keys add` again for that chain.

**`keys register-pqc` says the account already has a different key.**
It sent nothing, on purpose. The key on chain was registered from another mnemonic or by another tool. Use the original mnemonic, or rotate the key on chain from the old one ([Post-Quantum Signing](/developer-guide/post-quantum-signing#key-rotation)); a key the account used before cannot be registered again.

**`keys register-pqc` fails with a fee or balance error.**
The account needs QOR on the testnet before it can send its first transaction. Use the [Dashboard Faucet](/dashboard/faucet). The registration needs a few hundred thousand gas; at the 0.1 uqor floor that is a few tens of thousands of uqor.

**Do I need `--no-proof`?**
Only for a network older than v3.2.3. Both QoreChain networks accept a proof of possession, and QORel adds one by default.

**Where is my post-quantum key stored?**
Next to the secp256k1 key, as `<key name>.pqc` (a 32-byte seed), readable by the owner only. It can be re-derived from the mnemonic. Back up the mnemonic, not the files.

**My key files are readable by others.**
QORel writes new key files as 0600. Keys added with an older Hermes keep their old mode; run `chmod 600` on them.

### Configuration {#config}

**The config is refused with a message about `extension_options`.**
Static `extension_options` cannot be combined with `signing = 'qorechain-hybrid'`: the post-quantum signature must be the only critical extension option. Remove them from that chain's entry.

**It says the chain does not use `signing = "qorechain-hybrid"`.**
The post-quantum key commands only work on chains with that setting. Add it to the QoreChain entry.

**Do I need to set the sign-bytes version?**
No. `pqc.sign_bytes = 'auto'` reads it from the chain, re-reads it every minute and after any refusal. A fixed `v1` or `v2` that does not match the chain makes it refuse every transaction.

**`pqc-status` shows `sign_bytes` as unknown.**
QORel could not read the chain's upgrade records. Check that `rpc_addr` for the QoreChain entry answers and points at the right network (`qorechain-diana` on the testnet). QORel will not sign without a known version.

**Which gas multiplier should I use?**
`1.1` is the example default and keeps `health-check` quiet. On the testnet (v3.2.6) a lower value such as `1.05` works. Earlier builds under-report simulated gas, so use `1.15` on a node that runs one. See [Gas](/qorel/configuration#gas).

**`health-check` warns about the gas multiplier.**
It is below 1.1 on a QoreChain entry. It is a warning only; relaying works. Raise it if you see out-of-gas failures.

### Sending and relaying {#relaying}

**The chain refuses a transaction with codespace `pqc`, code 21.**
The hybrid signature did not verify. QORel re-reads the sign-bytes version and the registration before the next transaction and retries. If it repeats: confirm `id` in the chain entry is exactly the chain ID (`qorechain-diana`), the key is the registered one (`keys pqc-status`), and the node you use runs the version you expect. [Post-Quantum Signing](/developer-guide/post-quantum-signing#code-21) lists the causes.

**Nothing is sent and no fee is spent, but the relayer logs an error.**
That is the pre-send check doing its job. The log line names the missing piece: key not loaded, key not registered, key mismatch, or sign-bytes version unknown. Fix it as above.

**`account sequence mismatch` errors.**
Two processes are signing with the same relayer key. Run one relayer per key; this includes a systemd service plus a container, and a second Kubernetes pod.

**I see `429 Too Many Requests` in the logs.**
The endpoint is rate-limiting, usually a public one after a restart. QORel treats it as retryable and keeps its packet workers running, retrying at every clear interval. For steady relaying use your own nodes or a paid endpoint. The QoreChain testnet has no public gRPC endpoint, so the QoreChain side needs your own node anyway.

**Fees or out-of-gas errors on QoreChain.**
The fee is gas limit times price, with no refund, and the floor is 0.1 uqor per gas. Check `gas_price`, that `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` is set, and the account balance (`qorel keys balance --chain qorechain-diana`).

### Packets and channels {#packets}

**My transfer is pending and nothing arrives.**
Check, in order: a relayer is running for the channel (the process is up; telemetry answers); the channel is in your `packet_filter` on both chains; the relayer has a balance on the destination chain; the post-quantum key is ready; the endpoints are reachable. Then run `qorel query packet pending` for the channel. If no relayer runs, the packet waits until one starts or the transfer times out.

**What happens if a transfer expires?**
When the relayer is running, it relays the timeout and the tokens are refunded to the sender on the source chain. This was tested on the testnet channel.

**Can I use the existing test channel, or do I need my own?**
The testnet's `channel-0` to the Hub testnet's `channel-600` is open ([The test channel](/user-guide/bridging-assets#ibc-test-channel)); run QORel with that `packet_filter` to relay it. Make your own with `qorel create channel ... --new-client-connection` only if you need it.

**`create channel` fails halfway.**
The handshake is several transactions on both chains. Run `qorel health-check`, fix the cause, then re-run the command with `--a-connection` set to the connection it already created, or start again with `--new-client-connection`.

**Does stock Hermes work with QoreChain?**
No. QoreChain refuses a transaction without the ML-DSA-87 signature, and stock Hermes does not add it. QORel is Hermes plus that signature.

### General {#general}

**Can QORel relay chains other than QoreChain?**
Yes. A chain without `signing` uses the standard Hermes transaction format, byte for byte.

**Does it support mainnet?**
Not yet. No mainnet IBC channel is open. When mainnet IBC opens, this manual will say so.

**Does it support IBC v2?**
Not yet. IBC v2 relaying is not implemented in QORel; it is the next phase. Ethereum (Eureka) relaying has not been started.

**Windows?**
No. Use the container under WSL2.

**Where do I report a problem?**
Open an issue on [github.com/qorechain/QORel](https://github.com/qorechain/QORel/issues). Include the QORel version, the redacted chain entry and the output of `qorel keys pqc-status`; never post a mnemonic, a key file or a `.pqc` seed.

## How to access {#how-to-access}

- Every command above is run on the relayer host with the same config as the relayer.
- Public state to compare against: the QoreChain testnet REST at `https://api-testnet.qore.host` ([Connecting to the Testnet](/getting-started/connecting-to-testnet)) and the [block explorer](https://explore.qore.network) (toggle to Testnet).

## Where it is published {#where-published}

QORel is in the repository [qorechain/QORel](https://github.com/qorechain/QORel); issues go there. The upstream Hermes guide, [hermes.informal.systems](https://hermes.informal.systems), covers the settings and commands QORel shares with it.

## Limits and known issues {#limits}

- **Testnet only**, and a 0.x release.
- **No IBC v2 relaying yet** (next phase), and no Ethereum (Eureka) relaying.
- **Third-party endpoints rate-limit.** The Hub-side endpoints in the example config are public and not run by QoreChain.
- **This page cannot cover every Hermes error.** For errors that do not mention the post-quantum key, the sign bytes or QoreChain, the Hermes guide and issue tracker apply.

See also: [Configuration](/qorel/configuration), [Monitoring](/qorel/monitoring), [Signing from any language](/qorel/signing-from-any-language).
