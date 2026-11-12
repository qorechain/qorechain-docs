---
slug: /build-before-qday/workshop-template
title: Template for next workshops
sidebar_label: Template for next workshops
sidebar_position: 99
---

# Template for next workshops

This page is the fixed structure every Build Before Q-Day workshop guide follows. After each live workshop, a guide with these sections is published in this section. Copy the headings and fill them in. Anything you could not verify on the network is stated plainly instead of left out.

## Upcoming topics {#upcoming}

These are topics for the next workshops. They are not dates: dates are announced on the [fest site](https://build.qorechain.io).

- Workshop 2: dashboard and wallets
- CosmWasm and EVM contracts
- QoreX and MetaMask on the EVM lane
- Cross-VM applications
- RDK rollups
- The explorer

## Structure of a workshop guide {#structure}

### Front matter {#front-matter}

```yaml
---
slug: /build-before-qday/workshop-N
title: "Workshop N: <topic>"
sidebar_label: "Workshop N"
sidebar_position: N
date: <day month year>
---
```

### What we built {#what-we-built}

One short paragraph that says what the workshop produces, followed by the innovations it shows (for example hybrid ML-DSA-87 and secp256k1 signing, and one hybrid-signed transaction verified on chain).

### Prerequisites {#prerequisites}

Tools and versions (with the exact package names and versions), accounts, and the network used (testnet `qorechain-diana`, EVM chain ID 9800). Remind readers to use throwaway testnet keys only and never to commit `.env`.

### Steps {#steps}

Numbered steps, each with the exact command in a code fence and the output the reader should see. Note any waiting time between commands.

### Verify {#verify}

How to prove it worked on chain: the REST call, the fields to look at, and what the explorer shows (switch the explorer to Testnet).

### Troubleshooting {#troubleshooting}

A table of the message, the cause and the fix, for every problem seen while running the steps.

### The example apps {#example-apps}

Links to the example apps of the workshop, one page per app, and to the kits they use.

### Recordings {#recordings}

The recording of the live session, linked here when published.
