---
slug: /build-before-qday/workshop-1/kits
title: The QoreChain Kits
sidebar_label: Kits
sidebar_position: 10
---

# The QoreChain Kits

The QoreChain developer stack is fourteen kits. This page lists each one in a line, with its version and where it is published, and ends with six ideas you could build from them. Twelve kits are available. Two are not shipped: the Asset kit is a proposal and the PQ light client is a specification.

## Innovations {#innovations}

- **Hybrid ML-DSA-87 + secp256k1 signing is built into the SDK, the wallets and QoreSign**, so an app does not have to implement post-quantum signing itself.
- **One hybrid-signed transaction, verified on chain**, is the shared proof across the apps: see the [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter), the [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) and the [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector).
- **The same shape in many languages.** The SDK, QoreSign and the PQC library ship in several languages and are checked against shared test vectors.

## Build apps {#build-apps}

| Kit | What it does | Version and registry |
| --- | --- | --- |
| [QoreChain SDK](/sdk/overview) | One client for the native, EVM and SVM lanes with hybrid signing, PQC key registration, EVM window helpers, staking tiers, tokenomics, AMM, cross-VM calls and rollups. TypeScript, Python, Rust, Java and Go. | 0.13.0: npm, PyPI, crates.io, Maven Central, Go |
| [create-qorechain-dapp](/developer-tools/scaffolders-and-cli) | Scaffolds a working project in one command from seven templates: hardhat, foundry, viem-wagmi, fullstack-web, evm-solidity, cosmwasm and rollup-app. | 0.13.1: npm |
| [RDK, the Rollup Development Kit](/rollups/overview) | Create, launch and operate application-specific rollups that settle on QoreChain, with signed settlement batches, withdrawals and data availability reads. | `@qorechain/rdk` 0.8.0, five languages |

```sh
npm i @qorechain/sdk @qorechain/evm
npx create-qorechain-dapp my-app -t hardhat --network testnet
```

## Wallets and signing {#wallets-signing}

| Kit | What it does | Version and registry |
| --- | --- | --- |
| [QoreX and qorex-integrations](/developer-tools/qorex-integrations) | The official wallet holds both keys, signs hybrid and shows what you sign. The integrations add QoreX to RainbowKit and wagmi, cosmos-kit and Interchain Kit, with types, a mock wallet and Playwright fixtures. See also the [QoreX overview](/qorex/overview). | QoreX 1.2.3 (iOS, Android), extension 0.4.2 (Chrome, Firefox), `@qorechain/qorex-rainbowkit` 0.1.0 |
| [Wallet Adapter](/developer-tools/wallet-adapter) | Adds QoreChain to wallets people already use (Keplr, Leap, Cosmostation, MetaMask, Phantom), including the ML-DSA-87 hybrid signature the chain requires. | `@qorechain/wallet-adapter` 0.5.0 |
| [QoreSign](/qoresign/overview) | Hybrid signing for wallets and backends other than QoreX: derive the ML-DSA key, sign native-lane transactions with both keys, verify hybrid signatures locally, simulate before signing, and Sign In With QoreChain. | 0.2.0: TypeScript, Rust, Go, Swift, Kotlin |
| [QoreChain PQC](/developer-tools/pqc-library) | The post-quantum primitives under the rest: ML-DSA (FIPS 204), ML-KEM (FIPS 203) and SHAKE-256, byte-compatible across languages and checked against shared test vectors. | `@qorechain/pqc` 0.2.3, six languages |

```sh
npm i @qorechain/qorex-rainbowkit @qorechain/qorex-types
npm i @qorechain/wallet-adapter
npm i @qorechain/qoresign
npm i @qorechain/pqc
```

## Data and privacy {#data-privacy}

| Kit | What it does | Version and registry |
| --- | --- | --- |
| [QoreSeal](/developer-tools/qoreseal) | Encrypt data to QoreChain accounts with ML-KEM-1024 (hybrid with X25519 by default). An account publishes its key on chain and anyone can encrypt to it. Several recipients, auditor keys and rotating group keys. | 0.1.0: TypeScript, Rust, Go, Swift, Kotlin, Python |
| [QoreChain MCP](/developer-tools/mcp) | A Model Context Protocol server and command line tool that gives compatible developer tools read access to QoreChain: blocks, transactions, accounts, validators, staking tiers, hybrid signature status, contract reads and fee estimates. It never signs, never holds keys and never broadcasts. | `@qorechain/mcp` 0.1.0 |

```sh
npm i @qorechain/qoreseal
npx -y @qorechain/mcp
```

## Infrastructure and compliance {#infra-compliance}

| Kit | What it does | Version and registry |
| --- | --- | --- |
| [QORel](/qorel/overview) | An IBC relayer, a fork of Hermes, with a pluggable signer layer so chains that need a post-quantum signature on every transaction can be relayed. Standard chains keep the exact Hermes format. | 0.1.0: GitHub, container image, Homebrew |
| [Custody kit](/developer-tools/custody-kit) | For custodians: what each lane requires, address validation, deposit detection, signing and verifying withdrawals, staking, and managing the ML-DSA-87 key, with test vectors and reference code. | 0.1.0: TypeScript, Python, Go, Rust, Java |
| [QoreScan](/developer-tools/qorescan) | Inventories the cryptography of a deployment (node configuration, keys by type, TLS endpoints, Solidity sources, chain state) and exports a CycloneDX 1.6 CBOM, with outputs mapped to FINMA Guidance 05/2026, the EU PQC roadmap and DORA. An inventory aid, not a certification. | `@qorechain/qorescan` 0.1.0 |
| [Asset kit](/developer-tools/asset-kit) | **Proposal, not shipped as a whole.** Tooling for regulated tokenized assets: ERC-3643 and CMTAT adapters with a post-quantum holder check, ERC-4626 and ERC-7540 vaults, an issuer console and clients. The EVM contracts are available; the native asset modules are a proposal. | 0.1.0 |
| [PQ light client](/developer-tools/pq-light-client) | **Specification, not shipped.** A light client that follows ML-DSA-87 signed checkpoints. QoreChain does not produce these checkpoints today. The repository holds the specification and reference verifiers (Go, Rust, TypeScript) so the design can be reviewed. | 0.1.0 (specification) |

```sh
brew install qorechain/tap/qorel
npx @qorechain/qorescan --help
```

## Six things you could build {#ideas}

| Idea | Built from | What it is |
| --- | --- | --- |
| Quantum-safe checkout | SDK, QoreX | A pay-with-QOR button for a web shop where every payment is hybrid-signed. |
| Hackathon starter | create-qorechain-dapp | From zero to a deployed contract on the testnet in ten minutes, one command per student. |
| Sign In With QoreChain | QoreSign | Passwordless login for a web app, with the hybrid signature checked on your server. |
| Sealed-bid auction | QoreSeal | Bids stay encrypted until the reveal. |
| PQC readiness inventory | QoreScan | A cryptography inventory and CBOM file for a fintech team and its auditors. |
| Relay your own channel | QORel | Relay between the QoreChain testnet and another Cosmos testnet chain. |

## Get the code {#get-the-code}

Each kit has its own manual page, linked above. The example apps from this workshop are in the public repository [qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), and each app page walks through them from the first command to the last:

```sh
git clone https://github.com/qorechain/build-before-qday
```
