---
slug: /qorex/testnet-features
title: Testnet Features
sidebar_label: Testnet Features
sidebar_position: 10
---

# Testnet Features

:::caution TESTNET ONLY
Everything on this page works **only on the QoreChain testnet** (`qorechain-diana`). **None of it is on mainnet.** Testnet tokens have no value. The screens below do not appear in QoreX while you are on mainnet.
:::

QoreX has a few features that are being proven on the testnet first. They are shown only while the testnet is active, and every screen says so with a **TESTNET: test tokens only, not real QOR** banner.

## Innovations {#innovations}

- **The network confirms before you sign (testnet only).** For a transfer to another chain, QoreX asks the network to confirm the channel and its counterparty first. If it cannot, nothing is sent.
- **Real route state (testnet only).** The bridge screen shows what the network itself says about each route and offers nothing it does not.
- **Solana-format transactions on QoreChain (testnet only).** An SVM window you open with your ML-DSA-87 signature lets your own Solana key act within strict limits.

## How to reach the testnet in QoreX {#reach-testnet}

- **Mobile app:** open **Settings** and switch on **Use testnet (developers)**. The app switches to `qorechain-diana` straight away, with no restart. The default is always mainnet. Switch it off to return.
- **Browser extension:** tap the version number at the bottom of the popup seven times to reveal the **Developer mode** section, then tap **Switch to testnet (diana)**. In the same section, **Switch back to mainnet** returns you.

While the testnet is active, the testnet-only screens below appear in the app's **Settings** and in the extension popup (**Send to another chain** and **Bridge**), and the **Solana on QoreChain** tool appears under the Developer tab or the Developer tools page. Testnet balances show no dollar value. dApps cannot change the network; only you can.

## Get test QOR {#get-test-qor}

Testnet QOR is free and has no value. Get it from the [Dashboard Faucet](/dashboard/faucet): sign in there, copy your testnet address from QoreX (the **Testnet Workspace** developer tool has a **Copy address** button and an **Open the testnet faucet** button) and request tokens. See also [Connecting to Testnet](/getting-started/connecting-to-testnet) for the public testnet endpoints.

## Send to another chain (IBC) {#ibc}

**TESTNET ONLY.** Send QOR from the QoreChain testnet to the **Cosmos Hub**, **Osmosis**, **Injective**, **Akash** and **Celestia** testnets, and bring it back.

What QoreX does for you:

- **It checks the route first.** Before you can sign, QoreX asks the network to confirm that the channel is open and that it still leads to the chain you chose. If the channel is closed, changed or cannot be confirmed, QoreX says so and sends nothing.
- **It shows the full review.** You see the sender, the receiver on the other chain, the network fee and the timing before you sign.
- **Timing.** A test transfer to the Cosmos Hub testnet arrived in about 20 seconds. QoreX tells you to expect about a minute. If it is not delivered within 10 minutes, it comes back to you.
- **Which signature.** A transfer from QoreChain is signed with your hybrid key (ML-DSA-87 and secp256k1). Coming back is signed on the other chain with a classical key, as that chain requires, and the review says so: on that chain these coins are protected by a classical key only.

### Send from QoreChain {#ibc-send}

1. Turn on the testnet (see [above](#reach-testnet)), open **Settings** (extension: the popup) and tap **Send to another chain**.
2. Choose the **Destination chain** and the **Asset** (QOR, or coins that arrived over IBC).
3. Enter the **Amount**. The **Receiver** is prefilled with your own address on that chain; you can change it. QoreX checks it is a valid address for that chain.
4. Tap **Review**, check the details under **Check before signing**, then **Sign and send**.

### Bring coins back {#ibc-back}

1. In **Send to another chain**, open **Bring back to QoreChain** and tap **Show my balances** on the chain you used.
2. Choose **What to bring back**. The account on that chain needs a little of that chain's own coin to pay the fee; QoreX tells you if it is missing.
3. Review, then **Sign and bring back**. It is delivered to your own QoreChain address.

### Follow a transfer {#ibc-track}

**Your transfers** lists each transfer and follows it: waiting for the network, in flight, delivered, or came back to you (with the reason, or because it timed out). Tap **Refresh** to read again. If the status is not known yet, QoreX says it is not confirmed as delivered rather than guessing.

## Bridge screen {#bridge}

**TESTNET ONLY.** The **Bridge** screen reads the QoreChain Bridge routes from the network and shows each route's real state: not open yet, paused, closed for now, open, open for withdrawals or open for deposits. A route is offered only when the network itself says it is open.

**All routes are closed on the testnet today, so nothing is offered.** The screen is ready for when routes open. Nothing here is a route, asset or amount you can use now, and nothing is on mainnet.

## Solana on QoreChain {#solana-on-qorechain}

**TESTNET ONLY.** The SVM lane runs Solana-format transactions on QoreChain. It is a Developer mode tool, shown only while the testnet is active. On mainnet the SVM lane is not open and nothing here can be used.

What the tool does:

- **Shows the lane.** Whether the SVM lane is running on the network, and its cluster.
- **Shows your SVM window.** A window lets transactions signed by your Solana key spend from your account without an ML-DSA-87 signature, within limits. QoreX shows whether one is open, how many blocks, transactions and QOR are left, which Solana key is bound, and which programs it admits.
- **Opens and closes a window.** Open a window by choosing which programs it admits (listing them is recommended; **Any program** carries a warning), how many blocks it stays open (at most 17,280), how many transactions (at most 1,000) and the most QOR it may spend. The Solana key at index 0 of your recovery phrase is the one bound. Opening a window replaces the one you have. The warning on the screen applies: keep it small and short, and close it when you are done with **Close the window**.
- **Relays a signed Solana transaction.** Paste the wire bytes (base64 or base58) from a developer tool and tap **Read it**. QoreX shows the programs and which signers have signed, and relays only fully signed transactions. Your QoreChain account signs the envelope with ML-DSA-87 and pays its fee; it gains no authority over the Solana transaction.

How to use: turn on the testnet and Developer mode, open **Solana on QoreChain** from the Developer tab (or the extension's Developer tools page), then use the sections above. Contract calls to SVM programs from [Developer Mode](/qorex/developer-mode#contracts) also work on the testnet only.

For the chain side of the SVM lane, see [SVM on the testnet](/developer-guide/svm-testnet-v329) and [the SVM lane](/developer-guide/svm-lane-v328).

## What is not on mainnet {#not-on-mainnet}

- Sending to other chains over IBC from QoreX.
- The QoreChain Bridge screen and its routes.
- Solana on QoreChain, including SVM windows and relaying.

QoreX shows these screens only on the testnet and says so on each one.
