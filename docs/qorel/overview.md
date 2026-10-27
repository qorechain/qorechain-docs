---
slug: /qorel/overview
title: QORel Overview
sidebar_label: Overview
sidebar_position: 1
---

# QORel

QORel is QoreChain's IBC relayer. A relayer is the program that carries IBC packets, proofs and client updates between two chains; without one running, a transfer over an IBC channel stays pending. QORel is for operators, validators and teams who want to run the relay for a QoreChain channel, and for anyone who needs a relayer that can submit transactions to QoreChain at all.

QoreChain requires a hybrid post-quantum signature (secp256k1 plus ML-DSA-87, FIPS 204) on every native-lane transaction, and a stock relayer does not produce it, so QoreChain refuses its transactions. QORel adds that signature for QoreChain and signs every other Cosmos SDK chain the standard way. It is one binary, `qorel`, released under Apache-2.0. It is a fork of [Hermes](https://github.com/informalsystems/hermes) 1.13.3, the IBC relayer written by Informal Systems (Apache-2.0); the credit for the relayer engine is theirs, and QORel keeps Hermes' commands and configuration for every chain that does not need the extra signature.

QORel 0.1.0 is **testnet only**. It has relayed between the QoreChain testnet `qorechain-diana` and the Cosmos Hub public testnet (chain ID `provider`). Mainnet IBC is not open yet; mainnet support comes later, when a channel is opened there.

## Innovations {#innovations}

- **Per-chain signing mode.** Each chain in the config has `signing`. `'qorechain-hybrid'` adds the ML-DSA-87 signature QoreChain verifies. The default, `'standard'`, produces transactions byte for byte like Hermes, so the same QORel process relays QoreChain and the Cosmos Hub side by side.
- **A pluggable signer layer.** The `qorel-signer` crate defines a post-quantum primitive, a chain's sign-bytes rules and a transaction extension signer as separate pieces. The relayer calls it after the auth info is final and before the classical sign document is built, and gas simulation goes through the same path. A chain with a different extra signature needs a new framer in that crate, not a change to the relayer. See [Signing from any language](/qorel/signing-from-any-language) for the contract.
- **Post-quantum key handling in the key commands.** `qorel keys add` derives the ML-DSA-87 key from the same mnemonic as the account, with the QoreChain wallet derivation, so the relayer key matches what QoreX or the SDK would derive. `qorel keys register-pqc` registers the public key once, with a proof of possession. `qorel keys pqc-status` reports whether the key is ready.
- **A check before every send.** Before each transaction to a hybrid chain, QORel confirms that the post-quantum key is registered on chain and is the same key it holds locally, and reads the sign-bytes version from the chain. If anything is wrong it sends nothing, so no fee is spent on a transaction that the chain would refuse.
- **Gas price from QoreChain's fee market.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` reads the chain's base fee (floor 0.1 uqor per gas) instead of using a fixed guess.
- **Misbehaviour detection on ibc-go v10 chains.** ibc-go v10 no longer puts the header in `update_client` events, and stock Hermes 1.13 switches misbehaviour detection off on those chains. QORel reads the header from the `MsgUpdateClient` transaction instead, so detection keeps running.
- **Resilience to rate-limited endpoints.** Packet workers stay up and retry at every clear interval while a relay or clearing attempt has failed, for example after a public endpoint briefly answers `429`. They stop for idleness only after a clearing round succeeds.
- **Owner-only key files.** Key files, including the stored post-quantum seed, are written with mode 0600.
- **Proven on a live network.** The first IBC channel on the QoreChain testnet, `transfer/channel-0` on `qorechain-diana` to `channel-600` on the Cosmos Hub public testnet, is relayed by QORel. Transfers were tested in both directions, as were returning a transferred token and the automatic refund of an expired transfer. See [The test channel](/user-guide/bridging-assets#ibc-test-channel).

The full list for each release is on [What is new](/qorel/whats-new).

## The live testnet connection {#testnet-connection}

| | `qorechain-diana` | Cosmos Hub public testnet (`provider`) |
|---|---|---|
| Light client | `07-tendermint-0` | `07-tendermint-466` |
| Connection | `connection-0` | `connection-315` |
| Channel | `transfer/channel-0` (`STATE_OPEN`, unordered, version `ics20-1`) | `transfer/channel-600` |

Two token traces exist on this connection. ATOM on the QoreChain testnet is `ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2` (trace `transfer/channel-0/uatom`). QOR on the Hub testnet is `ibc/BB4D5A9372637A885CC895F775B38B127354A31F3E20D8F6FB3997E34BF4AA4A` (trace `transfer/channel-600/uqor`). A chain-registry pull request that adds this path ([cosmos/chain-registry#8086](https://github.com/cosmos/chain-registry/pull/8086)) is open and not merged. Mainnet has no IBC channel.

What was tested: transfers in both directions (1 QOR out, 0.1 ATOM in, 0.4 QOR returned) and the automatic refund of a transfer with a 1-second timeout, relayed as a timeout message. All 13 relayer transactions on `qorechain-diana` succeeded (code 0).

### What a third-party relayer needs {#third-party}

The testnet accepts only the `07-tendermint` light-client type (`/ibc/core/client/v1/params` lists `allowed_clients = ["07-tendermint"]`); no `08-wasm` client can be created today. To open a channel to QoreChain, a relayer needs:

- a `07-tendermint` client on each side;
- on the QoreChain side, every transaction signed hybrid by a relayer account whose ML-DSA-87 key is registered. QORel does this; stock Hermes, the Go relayer (`rly`) and ts-relayer are rejected;
- an ICS-20 transfer channel with version `ics20-1`.

There is no relayer allowlist for the IBC v2 client config either (`/ibc/core/client/v2/config/07-tendermint-0` answers `allowed_relayers: []`). IBC v2 packets use absolute Unix-second timeouts. QORel does not relay IBC v2 yet.

## qorel-signer {#qorel-signer}

The signer is a separate crate, `qorel-signer`, in the QORel repository at `crates/qorel-signer`. It is not on crates.io; depend on it as a git dependency. What it guarantees:

- **Pluggable co-signer.** A chain's extra signature is added by a co-signer, and chains with standard signing use none, so their transactions are unchanged.
- **Raw protobuf bytes.** It works on encoded bytes and depends on no IBC or relayer types.
- **A body policy.** It refuses bodies the chain would reject: an existing critical extension option, the `unordered` flag, or unknown fields.
- **No guessing the version.** It never falls back to v1 sign bytes on QoreChain networks before the sign-bytes version is known.
- **Self-verified signatures.** Every signature is verified before use.
- **Secrets handled.** Secrets are zeroized and redacted in `Debug` output.
- **Byte-for-byte tests.** The tests rebuild, byte for byte, relay transactions that the chain's ante handler accepted.

A usage example is in `crates/qorel-signer/README.md` in the repository; see also [Signing from any language](/qorel/signing-from-any-language#signer-layer). The same signer hook is offered upstream in Hermes as [informalsystems/hermes#4435](https://github.com/informalsystems/hermes/pull/4435) (open, not merged).

## How to use {#how-to-use}

Install the binary, write a config with one entry per chain, add a key for each chain, register the post-quantum key on QoreChain, check readiness, then start the relayer:

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana    # ready_to_relay must be true
qorel health-check
qorel start
```

The pages in this section:

| Page | What it covers |
|---|---|
| [What is new](/qorel/whats-new) | What 0.1.0 adds on top of Hermes |
| [Install](/qorel/install) | Tarballs, `.deb`, `.rpm`, Homebrew, container, from source, and how to verify each |
| [Quickstart](/qorel/quickstart) | From install to a first transfer on the testnet |
| [Configuration](/qorel/configuration) | The QoreChain chain entry, keys, gas and the safety checks |
| [Running next to a validator](/qorel/running-next-to-a-validator) | systemd, Docker Compose and Kubernetes layouts |
| [Monitoring](/qorel/monitoring) | Telemetry, what to alert on |
| [Signing from any language](/qorel/signing-from-any-language) | The hybrid signature contract and the libraries for five languages |
| [Troubleshooting](/qorel/troubleshooting) | Questions and fixes |

## How to access {#how-to-access}

- **Network.** Testnet `qorechain-diana` only (testnet runs v3.2.6). Mainnet `qorechain-vladi` has no open IBC channel; see [Bridging Assets](/user-guide/bridging-assets#ibc-testnet-v326) for what each network has.
- **Counterparty.** The Cosmos Hub public testnet, chain ID `provider`, over `channel-600`. Any other Cosmos SDK chain works the same way as the `provider` entry in the example config.
- **Endpoints.** QORel needs a consensus RPC, a WebSocket and a gRPC endpoint for each chain. The QoreChain testnet has public RPC (`https://rpc-testnet.qore.host`) and REST (`https://api-testnet.qore.host`) but no public gRPC endpoint today, and none is promised, so a third-party relayer for `qorechain-diana` needs its own testnet node ([Running a Node](/developer-guide/running-a-node), [Connecting to the Testnet](/getting-started/connecting-to-testnet)). Public endpoints that rate-limit relayers can be used for a short test but not for steady relaying.
- **Accounts.** One dedicated relayer account on each chain, with a small balance for fees. Testnet QOR comes from the [Dashboard Faucet](/dashboard/faucet); it has no value. Never use a validator operator key.
- **Cost.** QORel is free. On QoreChain a transaction costs gas times the price, with a floor of 0.1 uqor per gas, and the whole fee is charged with no refund.
- **Platforms.** Linux x86_64 and arm64 (glibc 2.28 or later), macOS Apple Silicon and Intel, and a container image for anything else. Windows is not supported; use the container under WSL2.

## Where it is published {#where-published}

| Where | What | Version |
|---|---|---|
| [GitHub: qorechain/QORel](https://github.com/qorechain/QORel) | Source, issues, and the release page with tarballs, `.deb`, `.rpm`, `SHA256SUMS` and build attestations | 0.1.0 |
| Homebrew | `brew install qorechain/tap/qorel` | 0.1.0 |
| `ghcr.io/qorechain/qorel` | Container image (amd64 and arm64, distroless, non-root, cosign-signed) | 0.1.0 |
| `qorel-signer` crate | The signer layer, in the repository at `crates/qorel-signer`; use a git dependency | Not on crates.io |

Licence: Apache-2.0. QORel is derived from Hermes, copyright Informal Systems Inc. and the Hermes authors, also Apache-2.0; the repository's `NOTICE` file carries the attribution. See [Install](/qorel/install) for the commands and for how to verify a download.

For the other developer packages see [Developer Packages](/developer-tools/overview). For how IBC fits into the chain see [Bridge Architecture](/architecture/bridge-architecture#ibc-relayer).

## Limits and known issues {#limits}

- **Testnet only.** QORel has been run against `qorechain-diana` and the Cosmos Hub public testnet. It has not relayed on mainnet, and no mainnet IBC channel is open.
- **IBC v1 (classic) only.** IBC v2 relaying is not implemented in QORel yet; it is the next phase. Ethereum (Eureka) relaying has not been started.
- **Chain version.** The hybrid mode follows the sign-bytes version the chain reports. Both QoreChain networks verify the current form (version 2) today.
- **No hosted relayer.** This manual does not offer a relayer service. If no relayer is running for a channel, a transfer stays pending until one is.
- **Public endpoints.** The QoreChain side needs gRPC, which is not public. Third-party public endpoints for other chains often rate-limit relayers.
- **Not a wallet.** QORel signs only the transactions it sends as a relayer. For wallet signing see [QoreSign](/qoresign/overview).
- **No Windows build.** Use the container under WSL2.
- **Release status.** QORel is a 0.x release. Commands and settings that are the same as Hermes' keep Hermes' behaviour; QoreChain-specific settings may still change before 1.0.
