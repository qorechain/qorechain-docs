---
slug: /light-node/sx-edition
title: SX Edition (Server Daemon)
sidebar_label: SX Edition
sidebar_position: 2
---

# SX Edition — Server Daemon

The **SX (Server eXperience)** edition is the headless light node: a daemon plus a full management CLI, built for servers and automation. The binary is `lightnode-sx`. This is the light node's **v3.1.3** line for the prebuilt binaries (source tag `v3.1.4` for Docker builds), its own version, separate from the chain version.

## Install {#install}

Prebuilt binaries are the easiest path — the light node client runs natively on **six platforms with zero native dependencies**: Linux (amd64, arm64), macOS (Intel, Apple Silicon), and Windows (amd64, arm64) — 12 binaries in total across the SX and UX editions. Each binary is roughly 11–12 MB — download it and run it, no separate libraries to install.

**Verify the checksum before you run it.** The release manifest at `https://download.qore.host/<net>/lightnode/latest.json` carries a `sha256` for every binary, a `checksums.url` pointing at a `SHA256SUMS` file over the whole release, and that file's own `checksums.sha256`. Verify what you downloaded — this isn't a footnote, it's the difference between running the binary that was actually built and running whatever landed at that URL:

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

On Windows, compare `certutil -hashfile lightnode-sx-<platform>.exe SHA256` against the manifest value. Both networks currently serve the same v3.1.3 build. The source is public at `github.com/qorechain/qorechain-lightnode` (Apache 2.0).

You can also build the binary from source or run it with Docker.

### Build from source

The light node requires **Go 1.26.1**. Its post-quantum cryptography is a pure-Go implementation (no CGO, no native library), so cross-compiling for any of the six supported platforms works the same way any other Go binary does:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

This produces `build/lightnode-sx`. Run it directly, or copy it onto your `PATH`. Before registering, sanity-check the post-quantum signing stack with [`selftest`](#verify-the-pqc-stack-selftest).

### Docker {#docker}

There is no pre-built registry image; you build it from the source tag. Use tag **`v3.1.4` or newer**: the image built from `v3.1.3` bundles an older `qorechaind` signer that the chain now refuses, so its heartbeats and reward claims fail. To update an existing install, rebuild from the new tag (`git fetch --tags && git checkout v3.1.4 && docker compose build --no-cache lightnode-sx`); pulling does nothing.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.4

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring
export QORE_LIGHTNODE_QORECHAIND_PASSPHRASE='...'   # qorechaind keyring (operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: write config.toml and the node key into the data volume.
docker compose run --rm lightnode-sx onboard
# Then set chain_id, key_name, operator_address and [heartbeat] key_name in
# /root/.qorechain-lightnode/config.toml inside the volume (see "First run").

docker compose up -d lightnode-sx
```

Keep `QORECHAIN_RPC_ADDR` exported on every `docker compose` command: it overrides `rpc_addr` from the config, and the compose default points at `host.docker.internal:26657`. The SX container persists its data in a named volume mounted at `/root/.qorechain-lightnode`.

The image also carries a released `qorechaind` (v3.2.0, linux/amd64, downloaded from the release channel at build time and checked against a pinned digest). The daemon drives it to sign heartbeats and reward claims, so a container node can stay active on chain without a second install. If a network later upgrades to a version that refuses the bundled signer, point `[heartbeat] qorechaind_path` at the newer `qorechaind` listed in that network's manifest (`https://download.qore.host/<net>/latest.json`). On an arm64 host (for example Apple Silicon) the build has no signer; build with `DOCKER_DEFAULT_PLATFORM=linux/amd64` if you need one. The signer needs the operator wallet: mount your `qorechaind` home (the keyring holding the operator key, plus the exported node key under `pqc/<key_name>.dilithium`) at `/root/.qorechaind`; `docker-compose.yml` mounts `~/.qorechaind` by default, or set `QORECHAIND_HOME`. The two passphrases are the node keyring's and the `qorechaind` keyring's; the second is piped to `qorechaind` on stdin and never appears on a command line. See [The operator wallet](#operator-wallet).

## Configure

The light node reads a TOML config file. By default it looks for `config.toml` in the home directory (`~/.qorechain-lightnode/config.toml`). You normally do not write this file by hand — the [`onboard` wizard](#first-run-onboard) creates it for you — but it is useful to understand the options.

Two persistent flags apply to every command:

- `--config <path>` — point at a config file in a non-default location.
- `--home <dir>` — override the home directory used for data and keys (defaults to `~/.qorechain-lightnode`).

The most relevant configuration options, at a usage level:

| Option | What it controls |
| --- | --- |
| `chain_id` | The network identifier (for example `qorechain-diana` on testnet, `qorechain-vladi` on mainnet). Set it yourself after `onboard`, which leaves `qorechain-diana`; the signer uses it. |
| `rpc_addr` | The chain RPC endpoint the daemon connects to. Leave empty to run in **local-only mode**. |
| `primary_addr` / `witness_addrs` | The primary RPC endpoint, and the witness endpoints its reported header is corroborated against — see [Why run a light node](/light-node/overview#why-run-a-light-node). At least one distinct, reachable witness is what moves the `assurance` value (logged at debug level) from `trusted-single-source` to `corroborated-across-sources`. |
| `trust_period` / `max_clock_drift` | Accepted for compatibility but not currently used. Header trust comes from the primary/witness corroboration described above. |
| `data_dir` | Where the node stores its database and headers. |
| `keyring_backend` / `key_name` | Keyring backend (`file`, `os`, or `test` for local devnets only) and the node's post-quantum key name. The `file` backend requires `QORE_LIGHTNODE_KEYRING_PASSPHRASE` in the environment. |
| `operator_address` | The account this node belongs to (`qor1...`); validated at load. Required for `register`, `status` and heartbeats. See [The operator wallet](#operator-wallet). |
| `api_addr` | The REST endpoint. Derived from `rpc_addr` when empty (port 26657 becomes 1317; `rpc.` hosts become `api.`), so it is only needed for endpoints that follow neither convention. |
| `[heartbeat]` | On by default. `qorechaind_path` (empty means `qorechaind` on `PATH`; the Docker image ships it), `qorechaind_home` (empty means `~/.qorechaind`), `key_name` (the `qorechaind` account key; defaults to the top-level `key_name`), `interval_blocks` (match the chain's `heartbeat_interval`, 1000), `check_interval` (default `60s`), `fees` (default `50000uqor`) and `gas` (default `300000`). |
| `[delegation]` | `auto_claim` (off by default: claims accrued light-node rewards to the operator wallet through the signer; the node never re-delegates from the server), the check interval, minimum reward to claim, `rebalance_enabled` and `min_reputation` (reputation alerts only — the node never moves stake). `validators` and `split_weights` are accepted but not currently acted on. |
| `[telemetry]` | Whether telemetry is enabled and the refresh intervals for validators, network, bridge, and tokenomics. |
| `log_level` / `log_format` | Logging verbosity (`debug`, `info`, `warn`, `error`) and format (`text` or `json`). |

### Environment variables {#environment-variables}

| Variable | Used for |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | Passphrase of the node keyring (`keyring_backend = "file"`). Required; the node refuses an empty one. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | Passphrase of the `qorechaind` keyring holding the operator key; piped to `qorechaind` on stdin, never on a command line. |
| `QORECHAIN_RPC_ADDR` | Overrides `rpc_addr` (and `primary_addr` when it equalled `rpc_addr`). Set by `docker-compose.yml`. |

:::note Witness endpoints are validated at startup
A witness on the same host as the primary is refused — a compromised endpoint would simply agree with itself, so it corroborates nothing. A plaintext `http://` witness on a remote host is also refused, since an attacker who can rewrite that connection can answer as every witness at once; loopback `http://` is fine. Point witnesses at RPC endpoints you have independent reasons to trust.
:::

Delegation defaults enable reputation-aware rebalancing alerts and leave `auto_claim` off — see [Rewards and Monitoring](/light-node/rewards-and-monitoring) for what these do.

## First run: `onboard` {#first-run-onboard}

On first launch, `start` will stop and point you at the onboarding wizard if no config file exists yet. Run the wizard:

```bash
build/lightnode-sx onboard
```

`onboard` walks you through setup in four steps:

1. **PQC self-test** — runs the full Dilithium-5 roundtrip (the same checks as [`selftest`](#verify-the-pqc-stack-selftest)). If the PQC stack fails, the wizard refuses to continue.
2. **Chain RPC endpoint** — paste your QoreChain RPC URL, or leave it blank to run in **local-only mode** while no chain connection is needed. If you provide a URL, the wizard tests reachability live.
3. **Node key** — the wizard calls this the "validator private key", but it is the light node's own Dilithium-5 key, not a validator key. Paste a hex-encoded Dilithium-5 private key, or type `g` (or `generate`) to mint a fresh keypair on this node.
4. **Save** — writes `config.toml` and stores the key in the keyring under the name `validator` (or `validator-<hex>` if that name is taken). The file keyring needs `QORE_LIGHTNODE_KEYRING_PASSPHRASE` set in the environment for this and for every later command that opens it.

:::note Local-only mode
If you leave the endpoint blank, the daemon starts in local-only mode: the PQC stack is fully exercised, but the node does not sync any chain. Re-run `onboard` once your chain endpoint is ready to point the node at it.
:::

`onboard` always overwrites the active config. Use `--config` to write to a non-default path, or `--non-interactive` to fail fast instead of prompting (useful in CI).

:::caution Finish the config after onboarding
`onboard` does not know which network you are joining or which account is yours. Before you run `register` or rely on heartbeats, edit `config.toml`:

```toml
chain_id         = "qorechain-vladi"   # mainnet; testnet is "qorechain-diana". onboard leaves "qorechain-diana".
key_name         = "validator"         # the key onboard created; see `lightnode-sx keys list`
operator_address = "qor1..."           # your funded operator account

[heartbeat]
key_name = "operator"                  # the qorechaind key that holds operator_address
```

`key_name` at the top level is the node's post-quantum key (its file is `pqc/<key_name>.dilithium` in the `qorechaind` home); `[heartbeat] key_name` is the `qorechaind` account key that pays the fee. If you leave `key_name = "operator"` while the key is called `validator`, `register` stops with `node key "operator" not found`.
:::

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

## The operator wallet {#operator-wallet}

The node's Dilithium-5 key is **not** a wallet. On QoreChain a post-quantum key is attached to an account; it does not create one. That is why `keys list` shows no address for it. Your **operator address** is an ordinary funded `qor1…` account, created with `qorechaind`, that the node is registered from and that receives the light-node rewards. The node key becomes that account's post-quantum key.

Set it up once:

```bash
# 1. Create and fund the operator account (any Cosmos wallet works; qorechaind shown)
qorechaind keys add operator
qorechaind keys show operator -a          # -> qor1..., fund it with a little QOR for fees

# 2. Tell the node which account it belongs to
#    config.toml:  operator_address = "qor1..."

# 3. Let the node print the two chain commands (attach the key, register the node)
lightnode-sx register
```

`register` prints, filled in with your values: the `qorechaind tx pqc register-key-v2 dilithium5 … hybrid` command that attaches the node key to the account (once), and the `tx lightnode register … --generate-only` plus `tx pqc cosign` pair that registers the node. The chain requires the post-quantum co-signature on every transaction, which is why registration is two commands and not one. Registration also requires an active `lightnode_operator` licence on the operator address; without it the chain refuses the transaction. Registration is not open yet: see [Status of the reward program](/light-node/overview#reward-program-status).

## Management commands

The SX CLI includes commands for inspecting node state and managing keys:

| Command | Purpose |
| --- | --- |
| `onboard` | Interactive first-run wizard. |
| `start` | Run the daemon. |
| `selftest` | Run the PQC self-test. |
| `status` | Show node and light-client sync status (chain ID, latest height, catch-up state) plus the `Signer`, `Operator`, `Licence` and `Registration` lines. |
| `keys create <name>` | Create a new Dilithium-5 node key and print its public key. |
| `keys list` | List keys in the keyring (name, type, address if any, public key). |
| `keys show <name>` | Print a key's type and full public key. |
| `keys import <name> <hex-privkey>` | Import a hex-encoded private key. |
| `keys export <name>` | Export a private key in hex (the same format `qorechaind` reads from `~/.qorechaind/pqc/`). |
| `register` | Print the chain commands that attach the node key to your operator account and register the node — see [Registration and Licensing](/light-node/registration-and-licensing). |
| `validators` | List bonded validators. |
| `delegation` | Show current delegations from the local database (see the known limitation in [Rewards and Monitoring](/light-node/rewards-and-monitoring#how-rewards-work)). |
| `rewards` | Show pending staking rewards (same limitation). |
| `network` | Show network telemetry (recent synced headers) from the local database. |
| `version` | Print the binary version. |

For staking, rewards, and monitoring details see [Rewards and Monitoring](/light-node/rewards-and-monitoring). For getting registered on-chain, see [Registration and Licensing](/light-node/registration-and-licensing).
