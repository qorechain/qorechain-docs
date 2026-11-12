---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: Overview
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day** is the QoreChain developer fest, run online at [build.qorechain.io](https://build.qorechain.io) with the hashtag #BuildBeforeQDay. Builders pick a level, build on the QoreChain testnet with the open source kits, ship in public and present their project to a jury and the community. Alongside the fest there is one technical workshop per week. Each workshop has a complete step-by-step guide in this section, from the first command to the last, so you can do everything at your own pace on your own computer. The example apps of each workshop are collected in the public repository [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Innovations {#innovations}

Every workshop in this section is built around the features that make QoreChain different:

- **Hybrid signing.** A transaction is signed twice: once with a classical secp256k1 key and once with a post-quantum ML-DSA-87 key. Someone who steals only the classical key cannot produce the second signature.
- **Verified on chain.** The validators check both signatures. The transaction carries a `PQCHybridSignature` extension and the chain emits a `pqc_hybrid_verify` event with the status `verified`. You can read both from the public REST endpoint and see the result in the explorer.
- **Ordinary tools.** You keep Hardhat, Foundry or your language of choice. The kits handle the post-quantum key and the authorisation window for you.

## How it works {#how-it-works}

1. **Register** at [build.qorechain.io](https://build.qorechain.io): sign in with GitHub, choose your level, connect X and QoreX.
2. **Build** on the testnet with the kits, the weekly workshops and the mid-hack challenges. Commits and updates show up in the public feed.
3. **Submit** before the deadline with a public repository, a video of up to 3 minutes and the testnet address your project uses.

Taking part is free: you build on the testnet, where test QOR comes from the [faucet](/dashboard/faucet). The full eligibility, submission and judging rules are on the Rules page of the fest site. The prize pool is $20,000 in total, with follow-on grants in QOR from January 2027; the split is on the fest site.

## Levels {#levels}

You choose a level when you register, and you can change it later.

| Level | Who it is for |
| --- | --- |
| Quantum Pass | New to QoreChain or to web3. Build a small app that sends a hybrid post-quantum transaction and reads it back from the chain. |
| Intermediate | You have shipped a dApp before. Build a complete application with the QoreChain SDK and QoreX. |
| Advanced | Three tracks: A, agents; B, encrypted applications with QoreSeal; C, cross-VM apps that span the EVM and Native lanes. |
| Expert | Protocol infrastructure: rollups with the RDK, IBC with QORel, custody and developer tooling. |

Workshop 1 covers exactly what the Quantum Pass level asks for: a hybrid-signed transaction, verified on chain.

## Timeline {#timeline}

All times are UTC.

| When | What |
| --- | --- |
| 4 November 2026 | Registration and building open |
| Every week | One workshop (4 in total) with its step-by-step guide here |
| 18 November 2026 | Mid-hack challenges start |
| 2 December 2026, 23:59 | Submission deadline |
| 3 to 5 December | Submission checks |
| 6 to 15 December | Judging and the People's Choice vote |
| 16 December | Winners and live demo show |
| 17 to 22 December | Prize payouts |
| January 2027 | Follow-on grants |

The schedule is on the fest site.

## Workshops {#workshops}

| Workshop | Topic | Guide |
| --- | --- | --- |
| Workshop 1 | Your first hybrid-signed transaction | [Workshop 1](/build-before-qday/workshop-1) |

Each guide starts from nothing installed. It lists what to install, then walks through the commands one by one: get the code, install, create a testnet-only key, get test QOR from the faucet, run, and check the result on the explorer. It ends with the packages used and the example apps. All example apps are in the public repository [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Where to start {#where-to-start}

- Follow [Workshop 1](/build-before-qday/workshop-1) on the testnet.
- Browse the [example apps](/build-before-qday/workshop-1/kits) and kits behind them.
- If you have never deployed on QoreChain, read [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes) first.
