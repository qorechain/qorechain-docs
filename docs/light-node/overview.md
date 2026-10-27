---
slug: /light-node/overview
title: Light Node Overview
sidebar_label: Overview
sidebar_position: 1
---

# Light Node Overview

The **QoreChain Light Node** is a small client that follows a QoreChain network without running a full node, and that can register on chain as a light node to take part in the **3% light-node reward share**. It is for operators who want a low-cost way to follow the chain and to earn from that share, and for people who just want a second opinion on the chain's latest block hash without trusting a single RPC server. It is a single self-contained binary in two editions built from the same code: **SX** (`lightnode-sx`, a headless daemon with a command line, for servers) and **UX** (`lightnode-ux`, the same daemon plus a local web dashboard on `127.0.0.1:8420`). It is released under the Apache 2.0 licence, and the source is public at `github.com/qorechain/qorechain-lightnode`.

Running and syncing a node needs no licence. Taking part in the reward share is a separate step: it needs a `lightnode_operator` licence, stake delegated to bonded validators, and an on-chain registration (see [How to access](#how-to-access)).

The light node has its **own version line**, separate from the chain release. At the time of writing (27 October 2026) both networks' release channels carry light node **3.1.12** (chain `v3.2.4` on mainnet, `v3.2.6` on the testnet). Treat the two numbers as unrelated.

## Innovations {#innovations}

Each item below is a mechanism you can check in the source or by running the node.

- **Native hybrid signing, no other software.** The node builds and signs its own transactions in pure Go (no CGO, no native libraries, no `qorechaind`). Every transaction carries an ML-DSA-87 (FIPS 204) signature over the body without the PQC extension, plus a secp256k1 signature over the SignDoc whose body carries that extension. The signing format version is read from the chain's applied upgrade plans. Linux, macOS and Windows builds exist for amd64 and arm64 (since 3.1.8).
- **One set of recovery words gives both keys.** `keys add-operator --recover` derives the account key at `m/44'/118'/0'/0/0`, the same path `qorechaind` and Keplr use. For the post-quantum key it either rebuilds the key a wallet already registered on that account from the same words (the wallet-adapter and Dashboard derivations, the same as `qorechaind tx pqc recover-key`) or derives a new one, so the words also restore the node's key (since 3.1.9).
- **Registration is one command, checked step by step.** `register` checks the licence, attaches the post-quantum key (with a proof of possession where the chain supports it), delegates only the missing stake if you pass `--delegate-to`, and then registers. Each step must be in a block before the next is sent. Stake is counted only on bonded validators, as the chain counts it (since 3.1.10).
- **Heartbeats are timed from the chain's own record.** The daemon sends a heartbeat once 1,000 blocks have passed since the chain's `last_heartbeat` for the node, checks every 60 seconds, and reports a heartbeat only once it is in a block. A restart neither sends a duplicate nor waits a whole interval.
- **Header cross-checking across endpoints.** The node fetches the same height from its primary endpoint and from every configured witness endpoint, and stores the header only if all of them return the same hash. A witness on the same host as the primary, or on a remote plaintext `http://` address, is refused. The mode is logged per header at debug level as `assurance` (`trusted-single-source` or `corroborated-across-sources`). This is **not** consensus verification: see [Limits](#limits).
- **Signed self-update.** From light node 3.1.11 the daemon reads its network's `latest.json` every 6 hours. It installs a new release only if `v<version>/SHA256SUMS.sig` verifies as an Ed25519 signature from a release key built into the binary (the signature binds the network, the version and the contents of `SHA256SUMS`), the downloaded binary matches its signed checksum, and the new binary runs and reports exactly `v<version>`. The previous binary is kept as `<name>.old`, and the node restarts in place (the same process on Linux and macOS; on Windows the new binary starts and the old one exits). `[update] mode` is `auto` (default), `notify` or `off`; `lightnode-sx update --check` and `lightnode-sx update` do the same by hand. In a container, or where the binary's folder is not writable, the node only announces a release (log line, `GET /api/update` on the local API, and a banner on the UX dashboard).
- **Warnings that match what the chain does.** With `[delegation] rebalance_enabled` on (the default) the node warns when a validator you delegate to is jailed, when it is not in the active set, and when your bonded stake falls below `min_delegated_stake` (1,000 QOR). In all three cases the chain stops crediting the node without any message. A warning is logged when it appears, hourly while it lasts, and once when it clears. A fourth warning, a delegated validator's reputation score below `min_reputation` (default `0.5`), reads `GET /qorechain/reputation/v1/validator/<valoper>`: it is live on the **testnet** now and reaches mainnet only with a chain release after v3.2.5; until the route is served the node notes that once and asks again every 6 hours.

### Why run a light node, and how to read the cross-check {#why-run-a-light-node}

- **Take part in the reward share.** Registered, active light nodes that meet the stake and uptime rules are paid from the 3% share described [below](#the-3-light-node-reward-share).
- **Cross-check the chain state you are shown.** With no witness configured, the node logs a warning at startup and reports `trusted-single-source`: an honestly run single endpoint reports the same value as a compromised one would. Add an independently operated witness to move to `corroborated-across-sources`, which needs every configured endpoint to be compromised at once to be fooled. The value appears on the `synced header` lines of the debug log (set `log_level = "debug"`); it is not shown in `status` or on the dashboard, and nothing central can see it, because your RPC choices are local to your setup.
- **Watch the network.** Telemetry covers validators, consensus, the bridge and tokenomics, refreshed on independent intervals.

## How to use {#how-to-use}

Pick an edition. Both read the same `config.toml`, store data in the same home directory (`~/.qorechain-lightnode`) and use the same keyring.

| Edition | Binary | Built for | Interface |
| --- | --- | --- | --- |
| **SX** (Server eXperience) | `lightnode-sx` | Headless servers, automation | Daemon plus full command line. See [SX Edition](/light-node/sx-edition). |
| **UX** (User eXperience) | `lightnode-ux` | Desktop and operator use | The same commands plus a local web dashboard. See [UX Edition](/light-node/ux-edition). |

**1. Download and verify** (Linux amd64 shown; `jq` is used to read the manifest). Take the version from the manifest of the network you target:

```bash
NET=mainnet            # or testnet
V=$(curl -fsS https://download.qore.host/$NET/lightnode/latest.json | jq -r .version)
F=lightnode-sx-linux-amd64          # see the artifact list in latest.json for other platforms
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/SHA256SUMS
grep " $F\$" SHA256SUMS | sha256sum -c -        # macOS: shasum -a 256 -c -
chmod +x $F
```

On Windows, compare `certutil -hashfile lightnode-sx-windows-amd64.exe SHA256` against the manifest value. The version-specific `SHA256SUMS` must match the version-specific binary, so take both from the `v$V` path.

**2. Set up and register.** The sequence below is the one the Dashboard shows; it was run on a devnet, on the testnet (rehearsal on 18 October 2026) and for the first mainnet node (20 October 2026).

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

./lightnode-sx onboard                  # PQC self-test, chain RPC (see below), node key
./lightnode-sx keys add-operator --recover   # recovery words on standard input; no flag = new account, 24 words shown once
./lightnode-sx register --delegate-to qorvaloper1...   # needs the licence and QOR in the operator account
./lightnode-sx start
./lightnode-sx status
```

The chain RPC for `onboard` is `https://rpc.qore.host` (mainnet) or `https://rpc-testnet.qore.host` (testnet). For the UX edition use `lightnode-ux` with the same commands and open `http://127.0.0.1:8420`. Details of every step: [SX Edition](/light-node/sx-edition) and [Registration and Licensing](/light-node/registration-and-licensing).

**3. Keep it updated.** Light node 3.1.11 and later update themselves outside containers (see the self-update item above). A node on 3.1.10 or earlier must install 3.1.12 by hand once: download the versioned binary as above and replace the file. With Docker, run `docker compose pull && docker compose up -d`. See [SX Edition: updating](/light-node/sx-edition#updating).

## How to access {#how-to-access}

| | Mainnet | Testnet |
| --- | --- | --- |
| Chain | `qorechain-vladi` (chain `v3.2.4`) | `qorechain-diana` (chain `v3.2.6`) |
| RPC for the node | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| REST for queries | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Light node release | 3.1.12 | 3.1.12 |
| Licence | $50, bought on the Dashboard; the grant is signed by hand in batches | Free, self-service: **Nodes & Validators > Light Node**, **Request licence**; signed automatically, usually within minutes |

**What you need to register**

- An account whose recovery words you hold (your own words, Keplr, or a `qorechaind` key), preferably dedicated to the node. A custodial Dashboard wallet cannot run a node unless you export its seed.
- An active `lightnode_operator` licence on that address (see below).
- At least **1,000 QOR** delegated from that address to **bonded** validators, counted as a total.
- QOR in the account for the **1 QOR** registration fee and transaction fees. A heartbeat costs 0.25 uqor per gas at the default limit of 300,000 gas, that is 0.075 QOR as a ceiling (measured gas used: about 165,000).
- A computer that stays on: the node must send a heartbeat every 1,000 blocks and keep at least 80% uptime to be paid.

**Getting a licence.** On the Dashboard, open **Nodes & Validators** (the sidebar entry that used to be called **Tools**; the page still lives at `/tools`), choose the **Light Node** tab, and select the network in the header. The Dashboard needs sign-in.

- *Mainnet:* enter the `qor1...` address first, choose the USDT network and pay $50. The tab shows **Paid, awaiting on-chain grant** until the chain confirms the grant.
- *Testnet:* nothing is sold. Enter your `qor1...` address under **Free testnet licence** and select **Request licence**. There is one request per account and one per address. The tab shows "Granted to ..." when the licence has landed, or says the grant could not be signed and lets you request again.

You can also check a licence directly: `GET /qorechain/license/v1/check/<address>/lightnode_operator`.

### Status of the reward program {#reward-program-status}

:::note Registration is open
Registration is open on mainnet (`qorechain-vladi`, chain v3.2.4) and on testnet (`qorechain-diana`, chain v3.2.6). On 27 October 2026 seven `lightnode_operator` licences had been granted on mainnet and one light node was registered on each network (`total_registered` is `1` in `GET /qorechain/lightnode/v1/stats` on both). Reward accounting has been live on both networks since the v3.2.0 upgrade. Uptime is counted **from the block your node is registered**, so running a node beforehand does not earn credit. Since chain v3.2.4 the per-node bound also starts at the node's own registration: the first settlement after registering credits only what accrued since then.

The release manifest (`https://download.qore.host/<net>/lightnode/latest.json`) carries the official signal in its `registration.open` field. For the live state query `GET /qorechain/license/v1/holders/lightnode_operator` and `GET /qorechain/lightnode/v1/stats` on `https://api.qore.host` (mainnet) or `https://api-testnet.qore.host` (testnet).
:::

## The 3% light-node reward share {#the-3-light-node-reward-share}

QoreChain's fee distribution allocates a fixed **3% share to light nodes** (the `reward_share` parameter, `0.03`). See [Tokenomics](/architecture/tokenomics) for the full 37% / 30% / 20% / 10% / 3% breakdown (validators, burned, treasury, stakers, light nodes).

That 3% is what is paid into the light-node module account; it is not a per-node entitlement. Every 100 blocks the chain credits each eligible node its stake-weighted share of what has accrued since the previous settlement, **bounded per node**. Since chain v3.2.3 the bound is **2,000 QOR per node per 30 days** (`max_reward_per_month_per_node`, `2000000000` uqor), prorated over the block time elapsed since the previous settlement and scaled by the node's uptime; this is the `lightnode-monthly-cap` rule. Before v3.2.3 the bound was stated per block (`max_reward_per_block_per_node`, `1713` uqor), which the reward pool query still reports. The bound is a ceiling, not a promised amount. Anything that goes unearned is moved into a reserve that only a governance vote can release, so no pot builds up for whoever registers first. Inspect the live split with `GET /qorechain/lightnode/v1/reward_pool`.

To be eligible for rewards a light node must be **registered on-chain, active** (proving liveness with heartbeats), hold at least the minimum bonded stake, and keep its uptime at or above the minimum. Registration is covered in [Registration and Licensing](/light-node/registration-and-licensing); crediting, claiming and monitoring are covered in [Rewards and Monitoring](/light-node/rewards-and-monitoring).

## Where it is published {#where-published}

| What | Where | Current version |
| --- | --- | --- |
| Release manifest, mainnet | `https://download.qore.host/mainnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, registration open) |
| Release manifest, testnet | `https://download.qore.host/testnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, registration open) |
| Binaries | `https://download.qore.host/<net>/lightnode/v<version>/<file>` | 12 files per release (SX and UX, Linux, macOS and Windows, amd64 and arm64) plus `SHA256SUMS` |
| Source and releases | `github.com/qorechain/qorechain-lightnode` (Apache 2.0) | Release `v3.1.12` (current) and earlier tags; each carries the 12 binaries, `SHA256SUMS`, `lightnode-build.json` and an Android preview APK |
| Android | Attached to the GitHub release only | Preview: follows the chain, does not register, does not earn |
| Docker | `ghcr.io/qorechain/qorechain-lightnode-sx` and `ghcr.io/qorechain/qorechain-lightnode-ux`, public, tags `latest` and `v<version>` (see [SX Edition: Docker](/light-node/sx-edition#docker)) | `v3.1.12` |

Check the `version` in the manifest of your network before you download, rather than relying on this table. The release signing key is built into the binary; nothing for you to install.

## Limits and known issues {#limits}

- **Not a protocol light client.** The node corroborates block hashes across endpoints. It does not check commit signatures, validator-set changes or a trust period, so it does not verify the chain's consensus. `trust_period` and `max_clock_drift` in the config are accepted but not used.
- **Rewards are a ceiling.** The per-node bound (2,000 QOR per 30 days) is a maximum, and the node is paid only what accrues to the pool and only while eligible.
- **A heartbeat is a liveness signature.** It proves the operator key signed on time, not that the full software ran continuously.
- **Reputation warnings are testnet-only for now.** Mainnet does not serve per-validator reputation scores yet, so on mainnet that one check does not run and the node says so in its log. The jailed, not-in-the-active-set and low-stake warnings do not depend on it. Node versions before 3.1.11 logged a failed reputation check every five minutes and never warned about anything.
- **Self-update starts at 3.1.11.** A node on 3.1.10 or earlier does not update itself and needs one manual install of 3.1.12. In a container or an unwritable folder the node only announces new releases.
- **Docker nodes do not update themselves.** They are told about a new release, and the update is `docker compose pull && docker compose up -d`.
- **Android is a preview** and does not register or earn.
- **Licences.** Mainnet grants are signed by hand in batches, so there is a wait between payment and registration. The testnet licence is limited to one per account and one per address.
- **A dashboard-created wallet cannot run a node** unless you export its seed, because the node must sign with keys you hold.

## Where to go next

- [SX Edition](/light-node/sx-edition): install, configure and run the server daemon.
- [UX Edition](/light-node/ux-edition): run the web dashboard edition.
- [Registration and Licensing](/light-node/registration-and-licensing): obtain a licence and register on chain.
- [Rewards and Monitoring](/light-node/rewards-and-monitoring): how the 3% share is credited and claimed, and how to keep the node healthy.
- [Tokenomics](/architecture/tokenomics): how the light-node reward share fits the wider economy.
