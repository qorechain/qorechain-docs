---
slug: /qorel/configuration
title: QORel Configuration
sidebar_label: Configuration
sidebar_position: 5
---

# Configuration

QORel reads one TOML file (`~/.hermes/config.toml` by default, or the path given with `--config`). For any chain that signs the standard way the file is exactly Hermes' configuration; the [Hermes guide](https://hermes.informal.systems) describes every setting. This page covers what QORel adds: the QoreChain chain entry, the post-quantum keys, the gas settings and the checks that run before a transaction is sent. It is for operators writing or reviewing a QORel config.

## Innovations {#innovations}

- **`signing` per chain.** `'qorechain-hybrid'` adds the ML-DSA-87 signature to every transaction QORel sends to that chain; `'standard'` (the default) is byte for byte Hermes. Mixed configs work: one process, one chain of each kind.
- **Sign-bytes version read from the chain.** With `pqc.sign_bytes = 'auto'`, QORel reads the chain's applied upgrade records, signs the matching form, re-reads it every minute and after any refusal, and never invents a version.
- **Fee market gas price.** `dynamic_gas_price` with `backend = 'cosmos-evm-feemarket'` follows QoreChain's base fee (floor 0.1 uqor per gas).
- **A config that refuses unsafe combinations.** Static `extension_options` together with hybrid signing is refused at load, because the post-quantum signature must be the only critical extension option.

## How to use {#how-to-use}

### The QoreChain chain entry {#chain-entry}

This is the testnet entry from the example config. Replace the node addresses with your own testnet node:

```toml
[[chains]]
id = 'qorechain-diana'
type = 'CosmosSdk'
rpc_addr = 'http://YOUR-QORECHAIN-NODE:26657'
grpc_addr = 'http://YOUR-QORECHAIN-NODE:9090'
event_source = { mode = 'push', url = 'ws://YOUR-QORECHAIN-NODE:26657/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'qor'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000

# The QoreChain-specific part:
signing = 'qorechain-hybrid'
gas_price = { price = 0.1, denom = 'uqor' }
gas_multiplier = 1.1
dynamic_gas_price = { enabled = true, multiplier = 1.0, max = 10.0, backend = 'cosmos-evm-feemarket' }
# optional, defaults shown:
# pqc = { sign_bytes = 'auto', sign_mode = 'hedged', include_public_key = false }

clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
# Relay only the channels you operate.
packet_filter = { policy = 'allow', list = [['transfer', 'channel-0']] }
```

The QoreChain-specific settings:

| Setting | Value | What it does |
|---|---|---|
| `signing` | `'qorechain-hybrid'` | Adds the ML-DSA-87 (FIPS 204) signature to every transaction sent to this chain. Omit it, or use `'standard'`, for every other chain. |
| `account_prefix` | `'qor'` | The address prefix of QoreChain accounts. |
| `gas_price` | `{ price = 0.1, denom = 'uqor' }` | The fee floor is 0.1 uqor per gas. |
| `gas_multiplier` | `1.1` | Multiplies the simulated gas to get the gas limit. See [Gas](#gas). |
| `dynamic_gas_price.backend` | `'cosmos-evm-feemarket'` | Reads the chain's fee market base fee instead of using only `gas_price`. |
| `pqc.sign_bytes` | `'auto'` (default), `'v1'` or `'v2'` | `auto` reads the sign-bytes version from the chain; `v1` and `v2` force one form. Keep it on `auto`. |
| `pqc.sign_mode` | `'hedged'` (default) or `'deterministic'` | Randomised or deterministic ML-DSA signing. The chain accepts both. |
| `pqc.include_public_key` | `false` (default) | Whether to embed the public key in each signature extension. This does not register the key; only `keys register-pqc` does. |

The public QoreChain testnet endpoints for reading are listed on [Connecting to the Testnet](/getting-started/connecting-to-testnet). A relayer also needs gRPC, which is not public, so run your own node for the QoreChain side.

### Any other Cosmos SDK chain {#other-chains}

Write the entry as you would for Hermes and leave `signing` out. This is the Cosmos Hub public testnet entry from the example config:

```toml
[[chains]]
id = 'provider'
type = 'CosmosSdk'
rpc_addr = 'https://rpc.provider-sentry-01.hub-testnet.polypore.xyz'
grpc_addr = 'https://grpc.provider-sentry-01.hub-testnet.polypore.xyz:443'
event_source = { mode = 'push', url = 'wss://rpc.provider-sentry-01.hub-testnet.polypore.xyz/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'cosmos'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000
gas_price = { price = 0.005, denom = 'uatom' }
gas_multiplier = 1.3
dynamic_gas_price = { enabled = true, multiplier = 1.1, max = 0.1, backend = 'skip-feemarket' }
clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
packet_filter = { policy = 'allow', list = [['transfer', 'channel-600']] }
```

These endpoints belong to a third party, are public, and may rate-limit. Use your own nodes for steady relaying.

### Global settings {#global}

The example config uses these, which are Hermes settings:

```toml
[global]
log_level = 'info'

[mode.clients]
enabled = true
refresh = true
misbehaviour = true

[mode.connections]
enabled = false

[mode.channels]
enabled = false

[mode.packets]
enabled = true
clear_interval = 50
clear_on_start = true
tx_confirmation = true

[rest]
enabled = false
host = '127.0.0.1'
port = 3000

[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

`mode.clients` keeps the light clients fresh and watches for misbehaviour; `mode.packets` relays packets and clears pending ones every `clear_interval` blocks and at start. Connection and channel handshakes are left to the `create` commands. The telemetry port is described on [Monitoring](/qorel/monitoring).

### Keys {#keys}

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana
```

- `keys add` (or `--key-file` with a key file that contains the mnemonic) stores the secp256k1 key as Hermes does and, on a hybrid chain, derives the ML-DSA-87 key from the same mnemonic and account with the QoreChain wallet derivation. Only its 32-byte seed is stored, next to the key, as `<key name>.pqc`. Nothing secret is printed. See [Key Derivation](/qoresign/guides/key-derivation) for the derivation.
- `keys register-pqc` sends `MsgRegisterPQCKeyV2` once. It is the only transaction QoreChain accepts with the classical signature alone, and it carries a proof of possession on networks at v3.2.3 or later. It is idempotent and refuses to send when the account already has a different key. See [Post-Quantum Signing](/developer-guide/post-quantum-signing#pqc-key-registration) for what the chain checks.
- `keys pqc-status` shows whether the key is registered, matches the local key, was proven by a proof of possession, and which sign bytes the chain verifies. `ready_to_relay` must be `true`.
- Use a dedicated relayer account with a small balance, never a validator operator key.
- Key files (`<key name>.json` and `<key name>.pqc`) are written readable by the owner only (0600). Upstream Hermes used the default umask; keys added with an older Hermes keep their old mode, so check them with `ls -l`.

### Gas {#gas}

QoreChain charges the whole fee (gas limit times price) with no refund, so keep the multiplier tight.

- On chain v3.2.5 and later (the measurement below was taken on the testnet at v3.2.6; mainnet applied v3.2.5 on 29 October 2026 but QORel has not relayed there), simulation matches delivery to within a few hundred gas. The local end-to-end test on a build of that line passes with `1.05` (every relay transaction used 95% of its limit).
- Earlier builds under-report by about 8 to 10% (measured on a pre-release devnet, where `1.15` left 4 to 7% headroom). Use `1.15` until you have measured your own nodes.
- `health-check` reports any multiplier below `1.1` on a QoreChain entry as a possible misconfiguration. That is a warning and relaying still works. `1.1`, the value in the example config, keeps it clean for about 5% more fee than `1.05`.
- The one-time `keys register-pqc` transaction uses at least `1.1` whatever the config says.
- Each hybrid signature adds about 4.7 KB to the transaction and 2,000 gas for verification; simulation includes both.

### Safety checks before every send {#safety-checks}

Before every transaction to a hybrid chain, QORel checks that the post-quantum key is loaded, registered on chain and identical to the local one, and that the sign-bytes version is known. If any check fails it sends nothing (no fee is spent) and `health-check` reports the reason. A refusal by the chain with codespace `pqc` code 21 makes QORel re-read the version and the registration before the next transaction.

### Notes for ibc-go v10 chains {#ibc-go-v10}

- ICS-29 fee middleware no longer exists in ibc-go v10; fees are the gas price, a fee granter and the dynamic base fee.
- ibc-go v10 no longer puts the header in `update_client` events. QORel reads it from the `MsgUpdateClient` transaction instead, so misbehaviour detection keeps working (stock Hermes 1.13 disables it on these chains).

### Rate-limited endpoints {#rate-limits}

Public endpoints often answer bursts with `429 Too Many Requests`, for example right after the relayer starts. Hermes treats those as retryable, but its packet workers also stop after `clear_interval x 5` blocks without new IBC events, even when the last clearing round failed; a packet that was pending at that moment waited until the next packet on the channel or a restart. QORel keeps a channel's packet workers up while a relay or clearing attempt has failed, and retries at every clear interval. They stop for idleness only after a clearing round succeeds. Prefer your own nodes or a paid endpoint for production relaying, and alert on pending packets ([Monitoring](/qorel/monitoring)).

## How to access {#how-to-access}

- **Where the file lives.** `~/.hermes/config.toml` for a tarball or Homebrew install, `/etc/qorel/config.toml` for the `.deb` and `.rpm`, and the mounted directory for the container. Override with `--config <path>`.
- **Key store.** `key_store_folder` sets where keys are kept; the default is `~/.hermes/keys`, and the packages use `/var/lib/qorel/keys`.
- **Prerequisites.** RPC, gRPC and WebSocket endpoints for each chain, and a funded relayer account on each.
- **Check a config.** `qorel health-check` loads the file and tests each chain.

## Where it is published {#where-published}

| What | Where |
|---|---|
| Example config (testnet, QoreChain and Cosmos Hub public testnet) | `packaging/config.example.toml` in [qorechain/QORel](https://github.com/qorechain/QORel); installed at `/etc/qorel/config.example.toml` by the packages |
| Hermes configuration reference | [hermes.informal.systems](https://hermes.informal.systems) |

## Limits and known issues {#limits}

- **Static `extension_options` are refused** on a chain with `signing = 'qorechain-hybrid'`.
- **Keep `pqc.sign_bytes` on `auto`.** A fixed `v1` or `v2` that does not match what the chain verifies makes the chain refuse every transaction.
- **Key mode on older keys.** Files written by an older Hermes keep their old permissions.
- **Third-party endpoints.** The Hub-side endpoints in the example config are not run by QoreChain and may change or rate-limit.
- **Testnet entry only.** The QoreChain entry here is for `qorechain-diana`. Mainnet is not open for IBC.
