---
slug: /qorel/whats-new
title: What is new in QORel
sidebar_label: What is new
sidebar_position: 2
---

# What is new in QORel

This page lists what each QORel release adds. It is for operators deciding whether to move from Hermes, or from an earlier QORel, and it only states what a release does, as checkable behaviour. QORel is based on Hermes 1.13.3 (Informal Systems, Apache-2.0); every change below is on top of that base. Anything not listed behaves as it does in Hermes.

## 0.1.0 {#v0-1-0}

First release. Testnet only. The [release page](https://github.com/qorechain/QORel/releases) has the files.

### Innovations {#innovations}

- **Hybrid post-quantum signing for QoreChain.** Set `signing = 'qorechain-hybrid'` on a chain and QORel appends the ML-DSA-87 signature (`/qorechain.pqc.v1.PQCHybridSignature`) as the only critical extension option of each transaction, then signs the final body with secp256k1. The message the post-quantum key signs is the version 2 sign bytes, which both QoreChain networks verify. Static `extension_options` cannot be combined with this mode, and the config is refused if they are.
- **Standard signing is unchanged.** With `signing = 'standard'` (the default) the transaction format is byte for byte Hermes', for the Cosmos Hub, Osmosis and any other Cosmos SDK chain.
- **The `qorel-signer` crate.** The post-quantum primitive (`PqSigner`, with `MlDsa87Signer`), the chain's rules (`SignBytesFramer`) and the extension signer the relayer calls (`TxExtensionSigner`) are separate interfaces. Gas simulation and batch sizing run through the same path, so the extra roughly 4.7 KB and the verification gas are always counted.
- **`qorel keys add` derives the post-quantum key.** On a hybrid chain it derives the ML-DSA-87 key from the same mnemonic and account with the QoreChain wallet derivation and stores only its 32-byte seed, next to the key, as `<key name>.pqc`. Nothing secret is printed.
- **`qorel keys register-pqc`.** Sends `MsgRegisterPQCKeyV2` once, with a proof of possession on networks at v3.2.3 or later. It is idempotent (nothing is sent if the same key is already registered) and refuses to send when the account already has a different key. `--no-proof` exists only for networks older than v3.2.3.
- **`qorel keys pqc-status`.** Prints whether the key is registered, whether it matches the local key, whether possession was proven, which sign bytes the chain verifies, and `ready_to_relay`.
- **Pre-send safety check.** Before each transaction to a hybrid chain QORel checks that the key is loaded, registered and identical to the local one, and that the sign-bytes version is known. With `pqc.sign_bytes = 'auto'` it reads the version from the chain's applied upgrade records, re-reads it every minute, and re-reads it after any refusal with codespace `pqc` code 21. On any failure nothing is sent and no fee is spent; `health-check` reports the reason.
- **Fee market gas price.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` reads QoreChain's base fee, which has a floor of 0.1 uqor per gas.
- **Misbehaviour detection on ibc-go v10 chains.** QORel reads the header from the `MsgUpdateClient` transaction because ibc-go v10 no longer includes it in `update_client` events. Stock Hermes 1.13 disables detection on these chains.
- **Packet workers survive rate limiting.** Workers stay up while a relay or clearing attempt has failed and retry at every clear interval. In Hermes a worker also stops after `clear_interval x 5` blocks without new IBC events even when the last clearing round failed, so a packet pending at that moment waited for the next packet on the channel or for a restart.
- **Owner-only key files.** Hermes wrote key files with the default umask. QORel writes `<key name>.json` and `<key name>.pqc` with mode 0600. Keys added by an older Hermes keep their old mode; check them with `ls -l`.
- **A `qorel` binary.** One binary, `qorel`, with the Hermes command set plus the post-quantum key commands. A `hermes` binary with the same CLI is also built from the source tree.
- **Releases with provenance.** Tarballs for Linux and macOS, `.deb` and `.rpm` packages with a hardened systemd unit, a Homebrew formula, and a multi-arch container image signed with cosign. Release files come with `SHA256SUMS` and build attestations. See [Install](/qorel/install).
- **A local devnet test.** The repository includes `scripts/qorel-devnet/`, which builds a QoreChain node and an ibc-go v10 test chain locally and runs an ICS-20 end-to-end test in both directions: key registration, client, connection and channel creation, transfers both ways, unwinding a transferred token, a timed-out packet cleared and refunded, and a transfer sent by QORel itself.

### Proven on the testnet {#proven-on-the-testnet}

- The QoreChain testnet's first IBC channel, `transfer/channel-0` on `qorechain-diana` to `channel-600` on the Cosmos Hub public testnet (chain ID `provider`), is relayed by QORel. The clients are `07-tendermint-0` and `07-tendermint-466`, the connections `connection-0` and `connection-315`.
- Transfers were tested in both directions (1 QOR out, 0.1 ATOM in, 0.4 QOR returned) and the automatic refund of a 1-second-timeout transfer through a timeout message. All 13 relayer transactions on `qorechain-diana` succeeded.
- The read-side view of the channel is on [Bridging Assets](/user-guide/bridging-assets#ibc-test-channel).

### Not in this release {#not-in-this-release}

- IBC v2 relaying. It is not implemented in QORel yet and is the next phase.
- Ethereum (Eureka) relaying. Not started.
- Mainnet relaying. No mainnet IBC channel is open yet.
- A Windows build.
- The `qorel-signer` crate on crates.io. Publishing is blocked; the crate is in the repository at `crates/qorel-signer`, so use a git dependency.

## Upgrading {#upgrading}

There is no earlier QORel release. Moving from Hermes 1.13 to QORel 0.1.0:

1. Install `qorel` next to or in place of `hermes` ([Install](/qorel/install)).
2. Keep your `config.toml`. Chains without `signing` stay on standard signing and behave as before.
3. Rename the command in your service files from `hermes` to `qorel`. The key store folder (`~/.hermes/keys` by default) is unchanged, which is why the container image mounts its data at `/home/nonroot/.hermes`.
4. Check key file modes with `ls -l`; new keys are 0600, older ones keep their mode.

The upstream Hermes upgrade notes in the repository's `UPGRADING.md` apply to anyone coming from a Hermes version older than 1.6.
