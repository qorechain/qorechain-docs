---
slug: /developer-guide/node-operators-v328
title: "Node Operators: v3.2.8 Checklist"
sidebar_label: Node Operators v3.2.8
sidebar_position: 11
---

# Node Operators: v3.2.8 Checklist

Release **v3.2.8** is running on the testnet `qorechain-diana` since 12 November 2026 (height 9,929,500). Mainnet `qorechain-vladi` has run v3.2.7 since 12 November 2026 (height 4,164,600, governance proposal 16) and has not applied v3.2.8, so nothing in this page applies to a mainnet node today.

This page is the short list of what a node operator checks and changes for v3.2.8: the shared libraries in the bundle, the contract runtime settings, the new `app.toml` defaults, one new REST route and the steps to upgrade a node that is still on v3.2.7. For the full node guide, see [Running a Node](/developer-guide/running-a-node).

**Why it matters.** v3.2.8 runs smart contracts on a new contract runtime library and charges for the memory and code loading a contract call uses. A node that keeps the old library folder, or that runs with too little contract memory, will not start or will fall behind. The rest of the checklist is small configuration work.

## 1. Copy the whole `lib/` folder {#lib-folder}

The release bundle contains `qorechaind` and a `lib/` folder with four shared libraries:

| Library | Role |
| --- | --- |
| `libqorepqc.so` | Post-quantum signature verification |
| `libqoresvm.so` | SVM runtime |
| `libwasmvm.x86_64.so` | Upstream contract runtime library |
| `libwasmvmqore_v1.x86_64.so` | New in v3.2.8: the QoreChain contract runtime library |

Copy the **whole folder**, not individual files. A `COPY lib/ ...` line in a Dockerfile or a `cp -r lib/* ...` on a bare-metal host keeps working when a later release adds a library; a list of named files does not.

```bash
tar -xzf qorechaind-v3.2.8-b3-linux-amd64.tar.gz
sudo cp qorechaind /usr/local/bin/qorechaind
sudo cp -r lib/. /opt/qorechain/lib/
```

Point the loader at the folder you copied to (the `LD_LIBRARY_PATH` or `ld.so.conf.d` entry you already use) and restart. The commands above are a pattern; use the paths of your own installation.

## 2. Contract memory cache: at least 256 MiB {#memory-cache}

The contract runtime keeps compiled contracts in memory. In `app.toml`, the `[wasm]` section setting `memory_cache_size` must be **256 MiB or more**:

```toml
[wasm]
memory_cache_size = 256
```

A value below 256 is raised to 256 when the node starts, and the node logs a warning. Plan for the extra memory on small machines.

## 3. Contract directory is now `<home>/wasm` {#wasm-directory}

Compiled contract code now lives in `<home>/wasm`, where `<home>` is the directory you start the node with (`--home`). A node whose contract code is still in the old location keeps using it and logs a warning. You can move the folder when convenient; stop the node first.

## 4. New `app.toml` defaults {#app-toml-defaults}

A node initialised with v3.2.8 writes these defaults. Existing `app.toml` files are **not rewritten**, so an upgraded node keeps its old values until you change them.

| Setting | New default | What it does |
| --- | --- | --- |
| `simulation_gas_limit` | `50000000` | Gas limit for simulated transactions on this node. Wallets and SDKs simulate before sending, and the high limit lets large contract calls be simulated |
| JSON-RPC `api` namespaces | `eth,net,web3` | The `txpool` namespace is not served by default, because it publishes the node's pending transactions. Add `txpool` yourself only if you need it |

```toml
simulation_gas_limit = 50000000

[json-rpc]
api = "eth,net,web3"
```

## 5. Query gas limit {#query-gas-limit}

Contract queries run under a node-local gas limit that the `[wasm]` section of `app.toml` controls. The chain team recommends setting it to `0` (no limit) on validators:

```toml
[wasm]
query_gas_limit = 0
```

This setting only changes what your own node answers for contract queries; it does not change what any block must contain. It is the chain team's recommendation for validators; a node that serves public queries may prefer a finite limit.

## 6. New route: `GET /qorechain/svm/v1/params` {#svm-params}

v3.2.8 adds a read-only route for the SVM module parameters. It is served by nodes on v3.2.8 (testnet) and answers HTTP `501` on mainnet, where the release is not applied.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Answer from the testnet on 12 November 2026:

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":false,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

| Field | Meaning |
| --- | --- |
| `enabled` | Whether the SVM transaction lane is open. `false` on the testnet since the upgrade, so SVM writes are refused until governance opens it again |
| `max_program_size`, `max_account_data_size` | Size limits in bytes (10,485,760 each) |
| `compute_budget_max` | Largest compute budget a transaction can request (1,400,000) |
| `lamports_per_byte`, `rent_exemption_multi` | Storage price inputs |
| `svm_slot_offset`, `default_sig_scheme`, `max_cpi` | Slot numbering offset, default signature scheme and the cross-program call depth limit |
| `max_custody_uqor`, `max_custody_hard_uqor`, `max_account_excess_uqor` | Limits on the native QOR an SVM account can hold, in uqor |

Read `enabled` before showing an SVM send button; see [SVM Development](/developer-guide/svm-development). The route `GET /qorechain/svm/v1/cluster_info` is a separate route that returns the cluster identity.

## 7. Check the manifest {#manifest}

The manifest is the source of truth for which binary to install:

```bash
curl -s https://download.qore.host/testnet/latest.json | jq '{version, minCompatible, upgradeType, upgradeHeight, binary: .binary.url}'
```

On 12 November 2026 it answered `version` `3.2.8`, `minCompatible` `3.2.8`, `upgradeType` `height`, `upgradeHeight` `9929500` and the binary `qorechaind-v3.2.8-b3-linux-amd64.tar.gz`. Check that `version` equals `minCompatible` before trusting `binary.url`, and verify the archive against the `sha256` in the same file. The mainnet manifest is at `https://download.qore.host/mainnet/latest.json` and names v3.2.6 until a mainnet upgrade is announced.

## 8. Upgrade a node that is still on v3.2.7 {#upgrade-from-v327}

The testnet upgrade height has passed, so a node still on v3.2.7 stops at height 9,929,500 with `UPGRADE "v3.2.8" NEEDED`. Its state is kept and it does not need to resync.

1. Download the archive named in the manifest and verify its SHA-256.
2. Stop the node.
3. Replace `qorechaind` and copy the whole `lib/` folder ([step 1](#lib-folder)).
4. Check `[wasm] memory_cache_size` ([step 2](#memory-cache)) and decide on `simulation_gas_limit`, the JSON-RPC namespaces and `query_gas_limit` ([steps 4 and 5](#app-toml-defaults)).
5. Start the node and watch the log. A warning about the contract directory or the memory cache is expected if you have not changed them.
6. Confirm it follows the chain:

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params | jq '.params.enabled'
```

A new node joining the testnet starts from the v3.2.8 binary directly; see [Connecting to Testnet](/getting-started/connecting-to-testnet) for state sync and peers, and [Running a Node](/developer-guide/running-a-node#upgrades) for the upgrade history.

## Limits and errors

| What you see | Meaning | What to do |
| --- | --- | --- |
| `UPGRADE "v3.2.8" NEEDED` and the node stops at height 9,929,500 | The node is still on the v3.2.7 binary | Section 8 |
| Start-up error about a missing shared library | `lib/` was not copied whole, or the loader does not point at it | Section 1 |
| Warning that `memory_cache_size` was raised | The configured value is below 256 MiB | Set 256 or more |
| Warning about the contract directory | Contract code is still in the old location | Move it to `<home>/wasm` when convenient |
| `501` from `/qorechain/svm/v1/params` | The node is not on v3.2.8 (mainnet runs v3.2.7) | Expected on mainnet |

## Related pages

* [Running a Node](/developer-guide/running-a-node), including [Contract runtime in v3.2.8](/developer-guide/running-a-node#v328-node)
* [Running a Validator](/developer-guide/running-a-validator)
* [Connecting to Testnet](/getting-started/connecting-to-testnet)
* [REST and gRPC endpoints](/api-reference/rest-grpc-endpoints)
