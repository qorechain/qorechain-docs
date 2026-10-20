---
slug: /light-node/sx-edition
title: SX Edition (Server Daemon)
sidebar_label: SX Edition
sidebar_position: 2
---

# SX Edition — Server Daemon

The **SX (Server eXperience)** edition is the headless light node: a daemon plus a full management CLI, built for servers and automation. The binary is `lightnode-sx`. This page describes light node **3.1.10** (source tag `v3.1.10`), which is on its own version line, separate from the chain version.

## Install {#install}

Prebuilt binaries are the easiest path — the light node client runs natively on **six platforms with zero native dependencies**: Linux (amd64, arm64), macOS (Intel, Apple Silicon), and Windows (amd64, arm64) — 12 binaries in total across the SX and UX editions. Each binary is roughly 13 MB — download it and run it, no separate libraries to install. The node signs its own transactions on every one of these platforms, so nothing else (in particular, no `qorechaind`) is needed to register and run a node.

**Verify the checksum before you run it.** The release manifest at `https://download.qore.host/<net>/lightnode/latest.json` carries a `sha256` for every binary, a `checksums.url` pointing at a `SHA256SUMS` file over the whole release, and that file's own `checksums.sha256`. Verify what you downloaded — this isn't a footnote, it's the difference between running the binary that was actually built and running whatever landed at that URL:

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/v3.1.10/$F   # or the artifacts[].url from latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

On Windows, compare `certutil -hashfile lightnode-sx-<platform>.exe SHA256` against the manifest value. Both networks serve the same 3.1.10 build; the manifests still accept 3.1.9 (`minCompatible: 3.1.9`). Since 3.1.10 each release's binaries sit under a versioned path, `https://download.qore.host/<net>/lightnode/v<version>/<file>`, which is what `artifacts[].url` in the manifest points to; use it rather than the unversioned copy, which can lag behind for a few hours. The source is public at `github.com/qorechain/qorechain-lightnode` (Apache 2.0). An Android build is attached to the GitHub release as a preview; it does not register and does not earn.

You can also build the binary from source or run it with Docker.

### Build from source

The light node requires **Go 1.26.1**. Its post-quantum cryptography is a pure-Go implementation (no CGO, no native library), so cross-compiling for any of the six supported platforms works the same way any other Go binary does:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Build from the release tag (`git checkout v3.1.10`). This produces `build/lightnode-sx`. Run it directly, or copy it onto your `PATH`. Before registering, sanity-check the post-quantum signing stack with [`selftest`](#verify-the-pqc-stack-selftest).

### Docker {#docker}

There is no pre-built registry image; you build it from the source tag. Use tag **`v3.1.10`**. To update an existing install, rebuild from the new tag (`git fetch --tags && git checkout v3.1.10 && docker compose build --no-cache lightnode-sx`); a plain `docker compose up` or `restart` reuses the old image. Keys, config and the data volume carry over.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.10

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring (node key + operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: the same setup as outside Docker, written into the data volume.
docker compose run --rm lightnode-sx onboard
docker compose run --rm lightnode-sx keys add-operator --recover
docker compose run --rm lightnode-sx register --delegate-to qorvaloper1...

docker compose up -d lightnode-sx
docker compose run --rm lightnode-sx status
```

Keep `QORECHAIN_RPC_ADDR` exported on every `docker compose` command: it overrides `rpc_addr` from the config, and the compose default points at `host.docker.internal:26657`. The SX container persists its data, including the keyring, in a named volume mounted at `/root/.qorechain-lightnode`.

The node signs natively inside the container, so nothing else is required. The SX image also still carries a released `qorechaind` (v3.2.0, linux/amd64 only, checked against a pinned digest) for the [`qorechaind` fallback](/light-node/registration-and-licensing#pqc-cosigned-heartbeat-pipeline): `docker-compose.yml` mounts `~/.qorechaind` (or `QORECHAIND_HOME`) at `/root/.qorechaind` and passes `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` for that path. A node whose operator key is in its own keyring does not use either.

## Configure

The light node reads a TOML config file. By default it looks for `config.toml` in the home directory (`~/.qorechain-lightnode/config.toml`). You normally do not write this file by hand — the [`onboard` wizard](#first-run-onboard) creates it for you — but it is useful to understand the options.

Two persistent flags apply to every command:

- `--config <path>` — point at a config file in a non-default location.
- `--home <dir>` — override the home directory used for data and keys (defaults to `~/.qorechain-lightnode`).

The most relevant configuration options, at a usage level:

| Option | What it controls |
| --- | --- |
| `chain_id` | The network identifier (`qorechain-vladi` on mainnet, `qorechain-diana` on testnet). `onboard` reads it from the RPC endpoint; if the endpoint could not be reached during `onboard`, the default `qorechain-diana` is left and you must set it yourself. Transactions are signed for this chain. |
| `rpc_addr` | The chain RPC endpoint the daemon connects to. Leave empty to run in **local-only mode**. |
| `primary_addr` / `witness_addrs` | The primary RPC endpoint, and the witness endpoints its reported header is corroborated against — see [Why run a light node](/light-node/overview#why-run-a-light-node). At least one distinct, reachable witness is what moves the `assurance` value (logged at debug level) from `trusted-single-source` to `corroborated-across-sources`. |
| `trust_period` / `max_clock_drift` | Accepted for compatibility but not currently used. Header trust comes from the primary/witness corroboration described above. |
| `data_dir` | Where the node stores its database and headers. |
| `keyring_backend` / `key_name` | Keyring backend (`file`, `os`, or `test` for local devnets only) and the name of the post-quantum key the node signs with. `onboard` sets `key_name` to the key it creates (`validator`); `keys add-operator` changes it to `operator-pqc` when it derives or recovers the key from the account's words. The `file` backend requires `QORE_LIGHTNODE_KEYRING_PASSPHRASE` in the environment. |
| `operator_address` | The account this node belongs to (`qor1...`); validated at load. `keys add-operator` fills it in. Required for `register`, `status` and heartbeats. See [The operator wallet](#operator-wallet). |
| `api_addr` | The REST endpoint. Derived from `rpc_addr` when empty (port 26657 becomes 1317; `rpc.` hosts become `api.`), so it is only needed for endpoints that follow neither convention. |
| `[heartbeat]` | On by default (`enabled`). `interval_blocks` (match the chain's `heartbeat_interval`, 1000), `check_interval` (default `60s`) and `gas` (default `300000`; with native signing the fee is 0.25 uqor per unit of gas, so 75,000 uqor). Used only by the `qorechaind` fallback: `fees` (default `50000uqor`), `qorechaind_path` (empty means `qorechaind` on `PATH`), `qorechaind_home` (empty means `~/.qorechaind`), `keyring_backend`, and `key_name` (the `qorechaind` key holding the operator account; defaults to the top-level `key_name`). |
| `[delegation]` | `auto_claim` (off by default: claims accrued light-node rewards to the operator account through the signer; the node never re-delegates from the server), the check interval, minimum reward to claim, `rebalance_enabled` and `min_reputation` (reputation alerts only — the node never moves stake). `validators` and `split_weights` are accepted but not currently acted on. |
| `[telemetry]` | Whether telemetry is enabled and the refresh intervals for validators, network, bridge, and tokenomics. |
| `[dashboard]` | The local dashboard API. The UX edition always serves it; the SX edition only with `enabled = true`. `bind_addr` (default `127.0.0.1:8420`) and `token` (when set, every `/api` route and `/ws` require `Authorization: Bearer <token>`). See [UX Edition](/light-node/ux-edition). |
| `log_level` / `log_format` | Logging verbosity (`debug`, `info`, `warn`, `error`) and format (`text` or `json`). Top-level keys: put them before the first `[table]`. |

### Environment variables {#environment-variables}

| Variable | Used for |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | Passphrase of the node keyring (`keyring_backend = "file"`), which holds the node's post-quantum key and the operator account key. Required for every command that opens the keyring and for `start`; the node refuses an empty one. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | Only for the `qorechaind` fallback: passphrase of the `qorechaind` keyring holding the operator key; piped to `qorechaind` on stdin, never on a command line. |
| `QORECHAIN_RPC_ADDR` | Overrides `rpc_addr` (and `primary_addr` when it equalled `rpc_addr`). Set by `docker-compose.yml`. |

:::note Witness endpoints are validated at startup
A witness on the same host as the primary is refused — a compromised endpoint would simply agree with itself, so it corroborates nothing. A plaintext `http://` witness on a remote host is also refused, since an attacker who can rewrite that connection can answer as every witness at once; loopback `http://` is fine. Point witnesses at RPC endpoints you have independent reasons to trust.
:::

Delegation defaults enable reputation-aware rebalancing alerts and leave `auto_claim` off — see [Rewards and Monitoring](/light-node/rewards-and-monitoring) for what these do.

## First run: `onboard` {#first-run-onboard}

On first launch, `start` will stop and point you at the onboarding wizard if no config file exists yet. Set the keyring passphrase first — `onboard` refuses to start without it, so it never generates a key it cannot store — then run the wizard:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-sx onboard
```

`onboard` walks you through setup in four steps:

1. **PQC self-test** — runs the full Dilithium-5 roundtrip (the same checks as [`selftest`](#verify-the-pqc-stack-selftest)). If the PQC stack fails, the wizard refuses to continue.
2. **Chain RPC endpoint** — paste your QoreChain RPC URL (mainnet `https://rpc.qore.host`, testnet `https://rpc-testnet.qore.host`), or leave it blank to run in **local-only mode**. If you provide a URL, the wizard tests it live and reads the chain ID from it.
3. **Node key** — the wizard calls this the "validator private key", but it is the light node's own Dilithium-5 key, not a validator key. Paste a hex-encoded Dilithium-5 private key, or type `g` (or `generate`) to mint a fresh keypair on this node.
4. **Save** — writes `config.toml` (with the endpoint and chain ID) and stores the key in the keyring under the name `validator` (or `validator-<hex>` if that name is taken), setting `key_name` to it.

:::note Local-only mode
If you leave the endpoint blank, the daemon starts in local-only mode: the PQC stack is fully exercised, but the node does not sync any chain. Re-run `onboard` once your chain endpoint is ready to point the node at it.
:::

`onboard` always overwrites the active config. Use `--config` to write to a non-default path, or `--non-interactive` to fail fast instead of prompting (useful in CI).

:::caution Next: the operator account
`onboard` does not know which account is yours. Before you run `register`, add the operator account with [`keys add-operator`](#operator-wallet). It fills in `operator_address` for you. If the endpoint could not be reached during `onboard`, also check that `chain_id` in `config.toml` is `qorechain-vladi` (mainnet) or `qorechain-diana` (testnet).
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

The node's Dilithium-5 key is **not** a wallet. On QoreChain a post-quantum key is attached to an account; it does not create one. That is why `keys list` shows no address for it. Your **operator address** is an ordinary `qor1…` account that holds the licence and the stake, pays the fees and receives the light-node rewards. It must be an account whose recovery words you hold (your own words, Keplr, or `qorechaind`); a dedicated account is best. A custodial Dashboard wallet cannot run a node unless you export its seed. See [The operator account](/light-node/registration-and-licensing#operator-account).

Store the operator account key in the node's keyring:

```bash
# The account the licence is for: type its recovery words, then Enter
lightnode-sx keys add-operator --recover

# Or create a new account; its 24 words are shown once
lightnode-sx keys add-operator
```

`keys add-operator`:

- derives the account key from the words exactly as `qorechaind` and Keplr do (`m/44'/118'/0'/0/0`), stores it in the keyring as `operator`, and writes the account to `operator_address` in `config.toml`. If `operator_address` is already set to a different account, it refuses;
- chooses the post-quantum key the node signs with, stores it as `operator-pqc` and sets `key_name` to it. If the account already has a post-quantum key — usually registered by a wallet from the same words — that key is rebuilt from the words (the wallet-adapter and Dashboard derivations, the same as `qorechaind tx pqc recover-key`). If the account has none, a key is derived from the words, so the words also restore the node's key. If the account's registered key is already the node's current key, that key is kept. If the account's key cannot be reproduced from the words, the command refuses and advises a dedicated account;
- without `--recover`, creates a new account and shows its 24 words once. Write them down; they are the only backup. Fund the account and buy the licence for its address before you register.

The keyring passphrase (`QORE_LIGHTNODE_KEYRING_PASSPHRASE`) protects this key as well as the node key. Then register:

```bash
lightnode-sx register --delegate-to qorvaloper1...
```

`register` checks the licence, attaches the post-quantum key unless the account already has it, delegates the missing stake only if you name a validator with `--delegate-to`, and registers the node; each step is confirmed in a block before the next. See [Registration and Licensing](/light-node/registration-and-licensing) for the details and for the `register --print` fallback for operators who keep the account key in a `qorechaind` keyring.

## Management commands

The SX CLI includes commands for inspecting node state and managing keys. Since 3.1.7 the UX binary (`lightnode-ux`) has the same commands.

| Command | Purpose |
| --- | --- |
| `onboard` | Interactive first-run wizard. |
| `start` | Run the daemon. |
| `selftest` | Run the PQC self-test. |
| `status` | Show node and light-client sync status (chain ID, latest height, catch-up state) plus the `Signer` (native or `qorechaind`), `Operator`, `Licence` and `Registration` lines. |
| `keys create <name>` | Create a new Dilithium-5 node key and print its public key. |
| `keys list` | List keys in the keyring (name, type, address if any, public key). |
| `keys show <name>` | Print a key's type and full public key. |
| `keys import <name> <hex-privkey>` | Import a hex-encoded private key. |
| `keys export <name> [--out <file>]` | Export a private key in hex. `--out` writes the file `qorechaind --pqc-key` reads (no trailing newline, mode 0600). |
| `keys add-operator [--recover]` | Store the operator account key (new, or recovered from its words on standard input) and choose the post-quantum key; fills in `operator_address`. See [The operator wallet](#operator-wallet). |
| `register [--delegate-to <qorvaloper>] [--print]` | Register the node on chain: post-quantum key, missing stake, registration, each confirmed in a block. `--print` prints the `qorechaind` commands instead — see [Registration and Licensing](/light-node/registration-and-licensing). |
| `validators` | List bonded validators. |
| `delegation` | Show the operator account's delegations, as mirrored into the local database by the running daemon. |
| `rewards` | Show the operator account's pending staking rewards (not light-node rewards; see [Rewards and Monitoring](/light-node/rewards-and-monitoring#how-rewards-work)). |
| `network` | Show network telemetry (recent synced headers) from the local database. |
| `version` | Print the binary version. |

For staking, rewards, and monitoring details see [Rewards and Monitoring](/light-node/rewards-and-monitoring). For getting registered on-chain, see [Registration and Licensing](/light-node/registration-and-licensing).
