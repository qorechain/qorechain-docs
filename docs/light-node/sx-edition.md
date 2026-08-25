---
slug: /light-node/sx-edition
title: SX Edition (Server Daemon)
sidebar_label: SX Edition
sidebar_position: 2
---

# SX Edition — Server Daemon

The **SX (Server eXperience)** edition is the headless light node: a daemon plus a full management CLI, built for servers and automation. The binary is `lightnode-sx`. This is the light node's **v3.1.2** line (its own version, separate from the chain version).

## Install {#install}

Prebuilt binaries are the easiest path — the light node client runs natively on **six platforms with zero native dependencies**: Linux (amd64, arm64), macOS (Intel, Apple Silicon), and Windows (amd64, arm64) — 12 binaries in total across the SX and UX editions. Each binary is roughly 16 MB — download it and run it, no separate libraries to install.

**Verify the checksum before you run it.** The release manifest at `https://download.qore.host/<net>/lightnode/latest.json` carries a `sha256` for every binary, plus a separate `SHA256SUMS` file over the whole release. Recompute the hash of what you downloaded and compare it against the manifest's value — this isn't a footnote, it's the difference between running the binary that was actually built and running whatever landed at that URL:

```bash
shasum -a 256 lightnode-sx-<platform>   # macOS/Linux
# or: certutil -hashfile lightnode-sx-<platform>.exe SHA256   # Windows
```

You can also build the binary from source or run it with Docker.

### Build from source

The light node requires **Go 1.26.1**. Its post-quantum cryptography is a pure-Go implementation (no CGO, no native library), so cross-compiling for any of the six supported platforms works the same way any other Go binary does:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

This produces `build/lightnode-sx`. Run it directly, or copy it onto your `PATH`. Before registering, sanity-check the post-quantum signing stack with [`selftest`](#verify-the-pqc-stack-selftest).

### Docker

A Docker setup is provided. The SX service builds from `Dockerfile.sx`:

```bash
docker compose up lightnode-sx
```

The SX container persists its data in a named volume mounted at `/root/.qorechain-lightnode` and reads the chain RPC address from the `QORECHAIN_RPC_ADDR` environment variable.

## Configure

The light node reads a TOML config file. By default it looks for `config.toml` in the home directory (`~/.qorechain-lightnode/config.toml`). You normally do not write this file by hand — the [`onboard` wizard](#first-run-onboard) creates it for you — but it is useful to understand the options.

Two persistent flags apply to every command:

- `--config <path>` — point at a config file in a non-default location.
- `--home <dir>` — override the home directory used for data and keys (defaults to `~/.qorechain-lightnode`).

The most relevant configuration options, at a usage level:

| Option | What it controls |
| --- | --- |
| `chain_id` | The network identifier (for example `qorechain-diana` on testnet, `qorechain-vladi` on mainnet). |
| `rpc_addr` | The chain RPC endpoint the daemon connects to. Leave empty to run in **local-only mode**. |
| `primary_addr` / `witness_addrs` | The primary RPC endpoint, and the witness endpoints its reported header is corroborated against — see [Why run a light node](/light-node/overview#why-run-a-light-node). At least one distinct, reachable witness is what moves `Assurance` from `trusted-single-source` to `corroborated-across-sources`. |
| `trust_period` / `max_clock_drift` | Light-client trust window (for example `168h`) and allowed clock drift. |
| `data_dir` | Where the node stores its database and headers. |
| `keyring_backend` / `key_name` | Keyring backend (`file` or `os`) and the operator key name. |
| `[delegation]` | Auto-compound on/off, compound interval, minimum reward to claim, validator set, split weights, rebalancing, and minimum reputation. |
| `[telemetry]` | Whether telemetry is enabled and the refresh intervals for validators, network, bridge, and tokenomics. |
| `log_level` / `log_format` | Logging verbosity (`debug`, `info`, `warn`, `error`) and format (`text` or `json`). |

:::note Witness endpoints are validated at startup
A witness on the same host as the primary is refused — a compromised endpoint would simply agree with itself, so it corroborates nothing. A plaintext `http://` witness on a remote host is also refused, since an attacker who can rewrite that connection can answer as every witness at once; loopback `http://` is fine. Point witnesses at RPC endpoints you have independent reasons to trust.
:::

Delegation defaults enable auto-compound on a `1h` interval and reputation-aware rebalancing — see [Rewards and Monitoring](/light-node/rewards-and-monitoring) for what these do.

## First run: `onboard` {#first-run-onboard}

On first launch, `start` will stop and point you at the onboarding wizard if no config file exists yet. Run the wizard:

```bash
build/lightnode-sx onboard
```

`onboard` walks you through setup in four steps:

1. **PQC self-test** — runs the full Dilithium-5 roundtrip (the same checks as [`selftest`](#verify-the-pqc-stack-selftest)). If the PQC stack fails, the wizard refuses to continue.
2. **Chain RPC endpoint** — paste your QoreChain RPC URL, or leave it blank to run in **local-only mode** while no chain connection is needed. If you provide a URL, the wizard tests reachability live.
3. **Validator private key** — paste a hex-encoded Dilithium-5 private key, or type `g` (or `generate`) to mint a fresh keypair on this node.
4. **Save** — writes `config.toml` and stores the key in the keyring.

:::note Local-only mode
If you leave the endpoint blank, the daemon starts in local-only mode: the PQC stack is fully exercised, but the node does not sync any chain. Re-run `onboard` once your chain endpoint is ready to point the node at it.
:::

`onboard` always overwrites the active config. Use `--config` to write to a non-default path, or `--non-interactive` to fail fast instead of prompting (useful in CI).

## Run: `start`

Once onboarding has written a config, start the daemon:

```bash
build/lightnode-sx start
```

The daemon syncs headers, tracks delegations, and serves telemetry until interrupted. If you intentionally want to start without a config file (local-only, no chain RPC), pass `--skip-onboarding-check`.

## Verify the PQC stack: `selftest` {#verify-the-pqc-stack-selftest}

At any time you can confirm the post-quantum stack is functional:

```bash
lightnode-sx selftest
```

`selftest` runs five checks against Dilithium-5 (ML-DSA-87) and completes in under a second:

1. **Keygen** — generate a fresh keypair.
2. **Sign** — sign a test message.
3. **Verify (valid sig)** — confirm the signature verifies with the matching public key.
4. **Reject tampered signature** — flip a byte of the signature; verification must reject it.
5. **Reject tampered message** — flip a byte of the message; verification must reject it.

If any check fails, the binary exits non-zero with diagnostic output. This is the same test the onboarding wizard runs as its first step, and it is handy for pre-deployment verification and support diagnostics.

## Management commands

The SX CLI includes commands for inspecting node state and managing keys:

| Command | Purpose |
| --- | --- |
| `status` | Show node and light-client sync status (chain ID, latest height, catch-up state). |
| `keys create <name>` | Create a new Dilithium-5 key. |
| `keys list` | List keys in the keyring. |
| `keys import <name> <hex-privkey>` | Import a hex-encoded private key. |
| `keys export <name>` | Export a private key in hex. |
| `register` | Print the on-chain registration command for this node — see [Registration and Licensing](/light-node/registration-and-licensing). |
| `validators` | List bonded validators. |
| `delegation` | Show current delegations from the local database. |
| `rewards` | Show pending staking rewards. |
| `network` | Show network telemetry (recent synced headers) from the local database. |
| `version` | Print the binary version. |

For staking, rewards, and monitoring details see [Rewards and Monitoring](/light-node/rewards-and-monitoring). For getting registered on-chain, see [Registration and Licensing](/light-node/registration-and-licensing).
