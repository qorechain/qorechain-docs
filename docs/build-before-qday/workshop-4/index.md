---
slug: /build-before-qday/workshop-4
title: "Workshop 4: Rollups, IBC and QoreX for developers"
sidebar_label: "Workshop 4"
sidebar_position: 5
date: 2026-11-27
---

# Workshop 4: Rollups, IBC and QoreX for developers

Workshop 4 goes below the application. First, you run a **rollup** that settles on QoreChain: you create it, withdraw from it, prove what it did, then cheat on purpose and watch the cheat get caught. Second, you send **QOR to the Cosmos Hub testnet and back** over IBC. Third, you see what the **QoreX wallet** gives you while you build a dApp.

Every command below says what it does and what you should see. The code is public: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), folder `workshop-4`. Everything here runs on testnets only. Test tokens have no value.

**How long this takes:** about 45 minutes of steps. The rollup also has a one hour challenge window, during which you wait. The three parts are independent: while you wait in Part 1, you can do Part 2 or Part 3.

## What we build {#what-we-built}

| Part | App | What it shows |
| --- | --- | --- |
| 1 | **A rollup** (Node.js, `@qorechain/rdk`) | Batches whose anchor is signed with ML-DSA-87, a withdrawal paid with a Merkle proof, a settlement receipt anyone can check, a fraud proved by a watchtower and a slashed bond. |
| 2 | **IBC there and back** (Node.js, `@qorechain/qoresign`, cosmjs) | QOR goes to the Cosmos Hub testnet and returns, carried by QORel, the QoreChain relayer. |
| 3 | **QoreX for developers** (a guide, no new code) | The providers a dApp talks to, the integration packages, Developer mode, the request log and the transaction inspector. |

The innovations behind them:

- **A rollup whose settlement is signed post-quantum.** The creator signs each honest batch's state root with ML-DSA-87 (NIST FIPS 204), and the chain stores it.
- **Fraud proofs the chain checks itself.** With the `qledger-v1` ledger, QoreChain re-executes a disputed batch. Nobody has to be trusted to say who was right.
- **Ordering taken from QoreChain.** With based sequencing, rollup transactions are posted to an inbox on QoreChain, so the operator cannot reorder them or leave out what was posted.
- **IBC with a hybrid signature on the QoreChain side.** The transfer that leaves QoreChain is signed with both secp256k1 and ML-DSA-87.
- **A wallet that shows its work.** QoreX records what each site asked for and lets you inspect what the chain stored.

## Words used in this guide {#words}

| Word | Plain meaning |
| --- | --- |
| Rollup | A system that runs its own transactions off the main chain and sends the main chain a short summary from time to time |
| Batch | One such summary: the new state of the rollup and the withdrawals it asks for |
| State root | A short fingerprint of all balances in the rollup |
| Optimistic rollup | Batches are accepted at once and become final only if nobody proves them wrong during the challenge window |
| Challenge window | The time anyone has to prove a batch wrong. It is one hour on the testnet |
| Bond | Money the operator locks and loses if it lies |
| Watchtower | An account that replays the rollup's transactions and reports a wrong batch |
| `qledger-v1` | A simple ledger the chain itself knows how to re-execute. Accounts inside it sign with ML-DSA-44 |
| Based sequencing | The order of rollup transactions comes from the inbox on QoreChain, not from the operator |
| Anchor | The batch's state root, signed by the rollup's creator with ML-DSA-87 and stored on chain |
| Merkle proof | A few hashes that prove one item is inside a larger set, without sending the whole set |
| IBC | The way Cosmos chains move tokens between each other without a custodian: each chain runs a light client of the other and checks proofs |
| Channel | A lane between two chains |
| Voucher | The token the other chain creates while your QOR stays locked on QoreChain |
| Escrow | The account on QoreChain where sent QOR waits until the voucher comes back |
| Relayer | A program that carries packets and proofs between two chains |

:::caution Throwaway testnet accounts only
The scripts create new accounts for you. Keep it that way. Never put the secret words or key of an account that holds real money into a file or a command.
:::

## Before you start {#prerequisites}

You need a terminal, **Node.js 20 or newer** and **Git**: see [Before you start](/build-before-qday/prerequisites). Part 3 also needs **pnpm** and the QoreX wallet. Check Node.js:

```bash
node -v
```

It should print `v20` or higher. Get the example code:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-4
```

The first line downloads the examples into a folder named `build-before-qday`. The second moves into the `workshop-4` folder.

Each part needs a different amount of test QOR:

| Part | What you need | Where it comes from |
| --- | --- | --- |
| 1, operator account | About 12,010 test QOR: 10,000 rollup stake, 1,000 for the sidechain slot, 1,000 submitter bond, and a few for deposits and fees | The faucet gives 100 QOR a day, which is not enough. Ask the fest team on the [build.qorechain.io](https://build.qorechain.io) channels for a larger testnet grant |
| 1, watchtower account | A few test QOR for fees | The [faucet](/dashboard/faucet) |
| 2 | About 2 test QOR, plus a little test ATOM | The [faucet](/dashboard/faucet). The script asks the Cosmos Hub testnet faucet for ATOM |
| 3 | A little test QOR in your QoreX testnet account | The [faucet](/dashboard/faucet) |

:::tip No large grant? You can still follow Part 1
`node rollup.mjs rollups` needs no account, and the steps below show what each command does.
:::

## Part 1: a rollup that settles on QoreChain {#part-1}

Code: [workshop-4/01-rollup](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/01-rollup). Package: `@qorechain/rdk`, the Rollup Development Kit.

You will walk through the whole life of a small optimistic rollup: create it, lock a stake, bond the operator, deposit, submit a batch, wait, withdraw, build a receipt, cheat, and catch the cheat. See [Rollups](/rollups/overview) for how they work.

### Step 1: install {#r1}

```bash
cd 01-rollup
npm install
node rollup.mjs help
```

| Part | What it does |
| --- | --- |
| `cd 01-rollup` | Moves into the rollup app's folder. |
| `npm install` | Downloads the packages the app uses. The versions are fixed by `package.json` and `package-lock.json`. |
| `node rollup.mjs help` | Runs the script and lists every command. |

**What you should see:** the list of commands: `init`, `rollups`, `prepare`, `status`, `withdraw`, `bond`, `receipt`, `cheat`, `watchtower`.

### Step 2: look at the rollups on the testnet {#r2}

```bash
node rollup.mjs rollups
```

Reads the chain. No account is needed.

**What you should see:** a first line with the number of rollups and the stake and bond the chain asks for today (10,000 QOR and 1,000 QOR when this guide was written), then one line per rollup: its id, whether it is active, how it settles (`optimistic` or `zk`), its VM type and the block where it was created.

**Why:** it shows that the numbers you will pay come from the chain, not from the script.

### Step 3: create two accounts {#r3}

```bash
node rollup.mjs init
```

Creates two accounts, the **operator** and the **watchtower**. Their secret words are saved in `~/.config/qday-w4/operator.json` and `watcher.json`, readable only by you, and are never printed. The operator file also holds two random seeds for the rollup keys of two users, Ana and Ben. To keep the files somewhere else, set the `QDAY_DIR` environment variable.

**What you should see:** two `qor1...` addresses. Fund both, as in [Before you start](#prerequisites).

**Why two accounts:** the one who reports a wrong batch should not be the one who published it.

### Step 4: create the rollup and submit batch 0 {#r4}

```bash
node rollup.mjs prepare
```

This one command runs the whole setup. It remembers what it already did in `~/.config/qday-w4/rollup-state.json`, so you can run it again if something stops halfway.

| What it sends | What it does |
| --- | --- |
| `createRollup` | Creates your rollup with `qledger-v1` execution and based sequencing, and locks the stake. |
| `bondRollupSubmitter` | Locks the 1,000 QOR bond. |
| Two deposits | 3 QOR for Ana and 1 QOR for Ben move into the rollup. |
| Three rollup transactions | Ana pays Ben 0.5 QOR, Ana withdraws 0.3 QOR, Ben withdraws 0.2 QOR. Each is signed with the sender's ML-DSA-44 key and posted to the inbox on QoreChain. |
| `submitBatch` | The script reads the inbox back, re-executes it to get the new state root and withdrawals root, and sends batch 0. The RDK signs its anchor with ML-DSA-87. |

**What you should see:** one `ok` line per transaction, with the block and an explorer link. Then the status of your rollup, with batch 0 shown as `submitted`.

### Step 5: wait one hour, then check {#r5}

```bash
node rollup.mjs status
```

**What you should see:** the rollup, the operator's stake, the withdrawals pool, the bond and each batch. After the one hour challenge window, batch 0 shows `finalized`.

**Why the wait:** an optimistic rollup is safe because there is time to prove a batch wrong before money leaves.

### Step 6: withdraw to QoreChain {#r6}

```bash
node rollup.mjs withdraw 0
node rollup.mjs withdraw 1
```

Withdrawal `0` is Ana's 0.3 QOR and withdrawal `1` is Ben's 0.2 QOR. In this demo both are paid to the operator account. The script builds a Merkle proof that the withdrawal is in batch 0's withdrawals root, and the chain checks it against the root it stored before it pays. Then the script sends the same withdrawal a second time.

**What you should see:** the number of hashes in the proof, an `ok` line, the recipient's balance before and after (the same account paid the fee), and then the second attempt marked `REFUSED`. A withdrawal is paid once.

If batch 0 is not final yet, the command stops and says that withdrawals are paid only after the challenge window.

### Step 7: a settlement receipt {#r7}

```bash
node rollup.mjs receipt 0
```

Builds a small JSON file that describes batch 0 and saves it next to your keys. Anyone can check it: the check reads everything again from QoreChain and does not trust the file.

| Check | What it proves |
| --- | --- |
| `rollupLayerBinding` | The rollup belongs to the layer the receipt names |
| `batchStateRoot` | The chain's batch carries exactly this state root |
| `anchorOnChain` | An anchor with every field of the receipt exists on chain |
| `creatorAuthority` | The signing key was read from the chain, not from the receipt |
| `pqcSignature` | The ML-DSA-87 signature over the anchor is valid |
| `chainBinding` | The receipt belongs to this chain and is not a copy from somewhere else |

**What you should see:** `VALID` with a tick next to each of the six checks. Then the script changes one hex digit of the state root and checks again: `NOT VALID`.

**Why it is useful:** an exchange, an auditor or another system can verify a rollup's state without trusting whoever sent the file.

### Step 8: a dishonest operator {#r8}

```bash
node rollup.mjs cheat
```

Ben pays Ana 0.1 QOR inside the rollup, and then the operator submits batch 1 with one bit of the state root flipped, on purpose.

**What you should see:** two `ok` lines. The second says the batch was published with a **wrong state root**. The chain accepts it for now: it has one hour to be proved wrong, and the operator's bond is at stake.

### Step 9: the watchtower catches it {#r9}

```bash
node rollup.mjs watchtower
```

This command uses the watchtower account, not the operator.

| Step | What happens |
| --- | --- |
| 1 | It reads batch 1 from the chain. |
| 2 | It reads exactly the part of the inbox that batch 1 used and replays it from the state after batch 0. This gives the honest root. |
| 3 | It builds the fraud proof and checks it on your computer. |
| 4 | It sends `challengeBatch`. The chain re-executes the batch itself, rejects it and slashes the bond: half is burned and half goes to the watchtower. |

**What you should see:** the wrong root and the honest root, the result of the local check, an `ok` line for the challenge, the batch marked as rejected, and the watchtower's balance before and after.

:::note Someone may be faster than you
The testnet already has independent watchtowers. If one of them proves the fraud first, which can take a single block, your script says that the batch is already rejected and only runs the local check. Either way, the operator loses the bond.
:::

To cheat again, first fill the bond up again:

```bash
node rollup.mjs bond
```

### How the code is organised {#r-code}

Everything is in one file, `rollup.mjs`. Each command is one function in the `cmds` object, in the order of the steps above. The `connect()` function turns an account file into an RDK transaction client that signs each QoreChain transaction with both keys, secp256k1 and ML-DSA-87.

## Part 2: QOR to the Cosmos Hub and back {#part-2}

Code: [workshop-4/02-ibc](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/02-ibc). Packages: `@qorechain/qoresign` and cosmjs. Networks: the QoreChain testnet `qorechain-diana` and the Cosmos Hub testnet `provider`.

This app sends 0.5 QOR from the QoreChain testnet to the Cosmos Hub testnet and brings it back. [QORel](https://github.com/qorechain/QORel), the QoreChain relayer, carries the packets between the two chains. When this guide was written, the QoreChain testnet had ten IBC channels: Cosmos Hub, Osmosis, Injective, Akash, Celestia, Coreum, dYdX, Fetch, Allora and ixo. IBC runs on the testnet only: it is not live on mainnet.

How it works:

1. One key gives you two addresses: `qor1...` on QoreChain and `cosmos1...` on the Hub.
2. **There:** the transfer is signed on QoreChain with both keys, and the chain checks both. QORel carries the packet and a proof to the Hub. The Hub's light client of QoreChain checks the proof and creates a voucher for the QOR.
3. **Back:** on the Hub, the transfer is signed in the Hub's usual way. QoreChain's light client of the Hub checks the proof. The voucher is burned and the original QOR is released.

:::info Two limits worth knowing
QoreChain's `channel-0` is the Hub's `channel-600`. The voucher's name on the Hub is `ibc/` followed by the SHA-256 of `transfer/channel-600/uqor`. On each testnet QOR channel, at most 1% of the QOR supply can cross in 24 hours, as a safety brake.
:::

### Step 1: install {#i1}

```bash
cd ../02-ibc
npm install
node ibc.mjs help
```

The first line moves from `01-rollup` to `02-ibc`. If you are in the `workshop-4` folder, use `cd 02-ibc`.

**What you should see:** the list of commands: `init`, `channels`, `status`, `register`, `hub-faucet`, `send`, `back`.

### Step 2: one key, two chains {#i2}

```bash
node ibc.mjs init
```

Creates an account and saves its secret words in `~/.config/qday-w4/traveler.json`, readable only by you. They are never printed. `QDAY_DIR` changes the folder.

**What you should see:** the account's QoreChain address and its Cosmos Hub address. Paste the `qor1...` address into the [faucet](/dashboard/faucet).

### Step 3: list the channels {#i3}

```bash
node ibc.mjs channels
```

Reads every IBC channel on the QoreChain testnet and the chain at the other end. No account is needed.

**What you should see:** one line per channel with its state (`OPEN`), the other chain's id and the channel's name on that side. The last line shows that mainnet has no channels yet.

### Step 4: register your post-quantum key and get ATOM {#i4}

```bash
node ibc.mjs register
node ibc.mjs hub-faucet
node ibc.mjs status
```

| Command | What it does |
| --- | --- |
| `register` | Puts your ML-DSA-87 public key on chain, once. Later QoreChain transactions are checked against it. |
| `hub-faucet` | Asks the Cosmos Hub testnet's public faucet for ATOM, which pays the fees on the way back. |
| `status` | Shows your QOR on QoreChain, the voucher and the ATOM on the Hub, and whether your key is on chain. |

**What you should see:** after `status`, your QOR balance, `ML-DSA-87 key on chain: yes` and some ATOM. If a balance is still zero, wait a minute and run `status` again.

### Step 5: there {#i5}

```bash
node ibc.mjs send 0.5
```

Builds a token transfer message (`MsgTransfer`, the ICS-20 standard) on `channel-0`, signs it with both keys through QoreSign, then waits until the voucher appears on the Hub.

**What you should see:** three numbered lines: the signed transaction with its packet number, block and explorer link; QORel carrying the packet; and the voucher arriving on the Hub, with the number of seconds it took. Each direction usually takes a few seconds. Your time can differ.

### Step 6: and back {#i6}

```bash
node ibc.mjs back
```

Sends every voucher home through `channel-600`. The Hub transaction is signed with a normal cosmjs client, at the Hub's current gas price. Then the script waits for the QOR to return.

**What you should see:** the Hub transaction, then the voucher burned on the Hub and plain QOR released on QoreChain.

### How the code is organised {#i-code}

Everything is in one file, `ibc.mjs`. `sendTx()` builds and signs a hybrid QoreChain transaction with QoreSign. `hubWallet()` turns the same secret words into a Hub wallet with the `cosmos` prefix. Each command is one function in the `cmds` object.

## Part 3: QoreX for developers {#part-3}

Guide: [workshop-4/03-qorex-developer-mode](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/03-qorex-developer-mode). There is no new code: you use the [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) from Workshop 1.

The steps below use the **QoreX 0.4.5 browser extension** on Chrome or Firefox. The Safari extension is an earlier version. The QoreX app (1.2.5, iPhone and Android) has Developer mode too: you switch it on in **Settings**, as explained in [Developer mode](/qorex/developer-mode).

### What a dApp talks to {#providers}

QoreX adds three providers to web pages:

| Provider | For | Standard |
| --- | --- | --- |
| `window.ethereum` | EVM dApps. QoreX also announces itself through EIP-6963 | EIP-1193 |
| `window.qorex.native` | Native QoreChain transactions, signed with secp256k1 and ML-DSA-87 | QoreX API |
| `window.qorex.svm` | The SVM lane | QoreX API |

These packages on npm connect QoreX to common tools:

| Package | Use |
| --- | --- |
| `@qorechain/qorex-rainbowkit` | QoreX in RainbowKit (EVM) |
| `@qorechain/qorex-cosmos-kit`, `@qorechain/qorex-interchain-kit` | QoreX in Cosmos Kit and Interchain Kit |
| `@qorechain/qorex-types` | TypeScript types for `window.qorex` |
| `@qorechain/qorex-wallet-mock`, `@qorechain/qorex-synpress` | Test your dApp against QoreX in automated tests |
| `@qorechain/sdk`, `@qorechain/wallet-adapter` | Build and send transactions with a hybrid signature |

See [dApp integration](/qorex/dapp-integration) for the details.

### Step 1: turn on Developer mode {#x1}

In the extension's popup, click the version number at the bottom of the home screen **seven times**. A **Developer mode** section appears with **Developer tools**, **Switch to testnet (diana)** and **Turn off developer mode**. Click **Switch to testnet (diana)**.

**Why first:** the request log records requests only while Developer mode is on.

### Step 2: start the Hybrid Inspector {#x2}

From the `workshop-4` folder:

```bash
cd ../workshop-1/03-hybrid-inspector
pnpm install
pnpm dev
```

The first line moves to the Workshop 1 app, `pnpm install` downloads its packages and `pnpm dev` starts a local web page. Open the address it prints (usually `http://localhost:5173`) and connect QoreX.

### Step 3: send a request while the wallet is locked {#x3}

Click **Lock** in QoreX. In the Inspector, send 0.001 QOR to your own address with the memo `Workshop 4`.

**What you should see:** QoreX asks for your password and **names the site** that is asking. After you unlock, the approval shows the amount, the recipient and the memo. Approve it: the transaction is signed with both keys. If you close the window instead, the request is refused.

**Why it matters:** nothing is signed without your password, and you know which site is asking.

### Step 4: open Developer tools {#x4}

Open **Developer tools** and look under **Transactions**:

- **Request log:** what each site asked QoreX for, with the method, the parameters and what you answered.
- **Transaction inspector:** paste a transaction hash or a request into **Hash or request** and click **Inspect**. With a hash, you see what the chain recorded, without leaving the wallet.

There are 17 developer tools in all. [Developer mode](/qorex/developer-mode) explains each one.

### Also new in QoreX 1.2.5 {#also-new}

- **A manual EVM window allows QOR transfers only, by default.** You can choose a wider scope, and you see what you grant.
- **PQC multisig:** a shared account whose members each sign post-quantum.
- **Key rotation and repair:** replace or fix your ML-DSA-87 key on chain without changing your address.

## Troubleshooting {#troubleshooting}

| What you see | What to do |
| --- | --- |
| `no operator account yet` | Run `node rollup.mjs init` first. |
| `no rollup yet` | Run `node rollup.mjs prepare` first. |
| `createRollup` is refused for lack of funds | The operator account needs about 12,010 test QOR. See [Before you start](#prerequisites). |
| `prepare` stops halfway | Run it again. It continues from what it already did. |
| `withdrawals are paid only after the challenge window` | Batch 0 is not final yet. Check with `node rollup.mjs status` and try again later. |
| `nothing to challenge` | Run `node rollup.mjs cheat` first. |
| The batch is already rejected when you run `watchtower` | Another watchtower on the testnet was faster. This is normal. |
| `no account "traveler"` | Run `node ibc.mjs init` first. |
| `does not exist on chain yet` | Get test QOR from the faucet for that address, then try again. |
| `nothing after 120 s` | The relayer may be busy. Wait a minute and run `node ibc.mjs status`. |
| The request log is empty | Turn on Developer mode before you use the dApp. |

## Learn more {#learn-more}

- The fest, its levels and tracks: [build.qorechain.io](https://build.qorechain.io).
- [Rollups](/rollups/overview) and the RDK. The RDK is available for TypeScript, Python, Rust, Go and Java, with a command line tool, `qorollup`, and a project template.
- To follow new batches as they arrive, look at `watchBatches` in the RDK: a starting point for a watchtower that runs all day.
- [QORel](https://github.com/qorechain/QORel) is open source. Install it with `brew install qorechain/tap/qorel` or use the container `ghcr.io/qorechain/qorel`. Run it only with your own keys.
- To try another channel in Part 2, change `CHANNEL`, `HUB_CHANNEL` and the other chain's endpoints in `ibc.mjs`. `node ibc.mjs channels` lists them.
- [Developer mode](/qorex/developer-mode) and [dApp integration](/qorex/dapp-integration) in QoreX.
- [Workshop 3, QoreSeal](/build-before-qday/workshop-3#part-1), if your rollup needs to keep the data it posts private.
