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
| [Workshop 2 guide](/build-before-qday/workshop-2) | Intermediate | Solidity, TypeScript, Node.js | 75 minutes | A vault that pays only against a post-quantum signature, an agent whose spending limits the chain enforces, and read-only questions to the chain with MCP. |
| [Workshop 3 guide](/build-before-qday/workshop-3) | Advanced | Node.js, Solidity, Rust | 70 minutes | A message encrypted to a `qor1...` address with post-quantum encryption that only its owner can open, and one EVM transaction that writes into a Native contract, all or nothing. |
| [Workshop 4 guide](/build-before-qday/workshop-4) | Expert | Node.js | 45 minutes, plus a one hour wait | A rollup that pays a withdrawal and loses its bond when it cheats, QOR sent to the Cosmos Hub testnet and back, and the QoreX developer tools. The rollup part needs a larger testnet grant. |
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
2. Follow the [Workshop 1 guide](/build-before-qday/workshop-1) on the testnet. Then the [Workshop 2 guide](/build-before-qday/workshop-2), the [Workshop 3 guide](/build-before-qday/workshop-3) and the [Workshop 4 guide](/build-before-qday/workshop-4).
3. Try one of the example apps from the table above.
4. If you have never deployed on QoreChain, [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes) explains the idea in depth. The kits behind the apps are on the [Kits](/build-before-qday/workshop-1/kits) page.

## Questions builders ask {#builder-questions}

The full rules are on the Rules page of [build.qorechain.io](https://build.qorechain.io), and more questions are answered in the FAQ there.

### Does my repository have to be public? {#faq-public-repo}

Yes. A private repository, including one shared with a single account, does not pass the submission checks. By the deadline, 2 December 2026 at 23:59 UTC, the repository must be public on GitHub under the MIT or Apache-2.0 licence, with the licence file in it. You can keep it private while you build and make it public before you submit. Never commit keys, seed phrases or `.env` files.

### My project is a wallet of its own. Does it still need to connect QoreX for the Quantum Pass? {#faq-wallet-project}

Yes. The Quantum Pass asks you to connect QoreX, so add QoreX as a connection option next to your own wallet, and let users pick either. Send the pass's hybrid-signed transaction through QoreX.

QoreX offers `window.qorex.native` for QoreChain Native transactions and `window.qorex.evm`, an EIP-1193 provider that is also announced through EIP-6963 with the `rdns` `network.qore.qorex`. QoreX never sets `window.keplr`, so detect `window.qorex`. On the testnet use the chain id `qorechain-diana` (EVM chain ID 9800). See [dApp integration](/qorex/dapp-integration).

### I built my app before running create-qorechain-dapp. How do I show that I used it? {#faq-starter}

Add the generated app to your repository. Put the output of `create-qorechain-dapp` in its own folder (for example `apps/web`), keep its structure, and have it connect QoreX and send the hybrid-signed transaction. Name the folder and the command you ran in your README. Jurors check the use of `create-qorechain-dapp` by hand, so a generated app they can see is the safest proof. Moving SDK calls into an existing app is fine, but on its own it does not show that you used the starter.

### I deployed my contract from a different address than the QoreX address I registered with. Is that a problem? {#faq-other-address}

No. Your linked QoreX address proves your registration. You do not need to change it, and a testnet account created on the command line is fine for deploying. Ship Weeks and the project checks look at your linked address and every `qor1` address listed on your project page. Add the address you deployed from under **Testnet addresses** on your project page, then press **Check again**. A transaction from an address that is not listed does not count. Prizes are not paid to the linked address: winners are asked for a payout wallet when prizes are paid.

## The code {#code}

All example apps are in one public repository, folders `workshop-1`, `workshop-2`, `workshop-3` and `workshop-4`: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday). Each tutorial tells you which folder to open. Get the code once with:

```bash
git clone https://github.com/qorechain/build-before-qday
```

| Part | What it does |
| --- | --- |
| `git clone` | Downloads a full copy of a code repository to your computer. |
| `https://github.com/qorechain/build-before-qday` | The address of the repository to copy. |

**What you should see:** a new folder named `build-before-qday` in the folder where you ran the command.
