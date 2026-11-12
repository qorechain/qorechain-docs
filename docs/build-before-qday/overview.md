---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: Overview
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day** is the QoreChain developer fest, run online at [build.qorechain.io](https://build.qorechain.io) with the hashtag #BuildBeforeQDay. Builders pick a level, build on the QoreChain testnet with the open source kits, ship in public and present their project to a jury and the community. Alongside the fest there is one technical workshop per week. Each workshop has a complete step-by-step guide in this section, from the first command to the last, so you can do everything at your own pace on your own computer, even if you are new to development. The example apps are collected in the public repository [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Innovations {#innovations}

Every workshop in this section is built around the features that make QoreChain different:

- **Hybrid signing.** A transaction is signed twice: once with a classical secp256k1 key and once with a post-quantum ML-DSA-87 key. Someone who steals only the classical key cannot produce the second signature.
- **Verified on chain.** The validators check both signatures. The transaction carries a `PQCHybridSignature` extension and the chain emits a `pqc_hybrid_verify` event with the status `verified`. You can read both from the public REST endpoint and see the result in the explorer.
- **One key, bound once.** Your post-quantum key is derived, not generated, and registered once with a proof. See [How your post-quantum key is bound to your account](/build-before-qday/key-binding).
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

## Who this is for {#who}

You do not need to know blockchain or post-quantum cryptography. If you can open a terminal and paste a command, you can follow every guide here. Each guide explains in plain words what every command does and what each part of it means, then shows what you should see on screen. Where a guide says a command may take a moment, wait for it to finish before you run the next one.

## Choose a tutorial {#choose}

Do the **Workshop 1 guide** first. It is the full path, from an empty computer to one transaction signed with two keys and checked on chain. Then pick any app below. They show the same idea in different languages and tools.

Times are for the steps after the tools are installed. Installing the tools the first time adds about 20 to 40 minutes: see [Before you start](/build-before-qday/prerequisites).

| Tutorial | Level | Language | Time | What you will have at the end |
| --- | --- | --- | --- | --- |
| [Workshop 1 guide](/build-before-qday/workshop-1) | Beginner | TypeScript, Solidity | 30 minutes | A project you scaffolded, tested and deployed on the testnet, and one hybrid-signed transaction verified on chain. |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | Beginner | TypeScript, Solidity | 25 minutes | A counter contract on the testnet that you increase with a hybrid-signed flow. |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | Intermediate | TypeScript, Solidity, React | 45 minutes | Your own on-chain guestbook, with a web page where you sign from the QoreX wallet. |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | Beginner | TypeScript, React | 25 minutes | A web page that sends QOR from QoreX and shows both signatures and the chain's verdict. |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Intermediate | Rust | 25 minutes | A command line app that pays with a hybrid signature and verifies it on chain. |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Intermediate | Java 21 | 25 minutes | A backend that sends tips and only accepts payments that were signed post-quantum. |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Beginner | Python | 20 minutes | One transaction that pays many addresses, signed with both keys and verified on chain. |

What the levels mean here:

- **Beginner:** a few commands you paste in order. No code to write.
- **Intermediate:** the same, with a second tool such as a web page, a wallet extension or a language toolchain you may not have used.

Every tutorial follows the same shape: **Before you start**, numbered steps (each command with what it does and what each part means), **What you should see**, how to **verify** the transaction on chain, and a **Troubleshooting** table.

## Before you start {#before-you-start}

Read [Before you start: tools and a testnet wallet](/build-before-qday/prerequisites) once. It covers:

- Installing Node.js, pnpm, Git, Rust, Java, Maven, Python and jq on macOS, Windows and Linux, with a check command for each.
- Setting up the QoreX wallet on the testnet.
- Getting test QOR from the faucet (100 QOR every 24 hours per account).
- QOR and uqor: 1 QOR is 1,000,000 uqor.
- How to keep a throwaway testnet key safe. Use test accounts only, never a wallet with real funds.

## Where to start {#where-to-start}

1. Read [Before you start](/build-before-qday/prerequisites) and install the tools for your first tutorial.
2. Follow the [Workshop 1 guide](/build-before-qday/workshop-1) on the testnet.
3. Try one of the example apps from the table above.
4. If you have never deployed on QoreChain, [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes) explains the idea in depth. The kits behind the apps are on the [Kits](/build-before-qday/workshop-1/kits) page.

## The code {#code}

All example apps are in one public repository, folder `workshop-1`: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday). Each tutorial tells you which folder to open. Get the code once with:

```bash
git clone https://github.com/qorechain/build-before-qday
```

| Part | What it does |
| --- | --- |
| `git clone` | Downloads a full copy of a code repository to your computer. |
| `https://github.com/qorechain/build-before-qday` | The address of the repository to copy. |

**What you should see:** a new folder named `build-before-qday` in the folder where you ran the command.
