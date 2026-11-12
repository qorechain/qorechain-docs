---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

The Q-Day Guestbook is an on-chain guestbook on the QoreChain EVM testnet. Anyone can sign it once per address with a message of up to 140 characters. It has two parts: a Solidity contract with a Hardhat project, and a React web page that connects the QoreX wallet, shows the account's EVM window and lists the latest signatures live.

## Innovations {#innovations}

- **A browser dApp that signs hybrid without knowing it.** The page is an ordinary wagmi and RainbowKit app. QoreX adds the ML-DSA-87 half of the signature, so the same transaction is protected by secp256k1 and by a post-quantum key.
- **The EVM window is visible in the interface.** The page reads the account's window from the chain and shows whether it is live and how many blocks and transactions are left.
- **Readable refusals.** When the chain refuses a write, `classifyEvmWindowRejection` maps the error to one of four causes (no registered key, no window, window used up, invalid parameters) and the page shows the fix.
- **One hybrid-signed transaction, verified on chain.** Each signature you write is one transaction that the chain accepted only after checking both signatures.

## Packages and versions {#packages}

| Package | Version | Used for |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | Chain definitions, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX as a RainbowKit wallet |
| `@cosmjs/stargate` | ^0.39.0 | Broadcasting the window message (contracts project) |
| `@qorechain/sdk` | ^0.13.0 | Window helper script (contracts project) |
| `@rainbow-me/rainbowkit` | ^2.2.11 | Connect button |
| `wagmi` | ^2.19.5 | React hooks for reads and writes |
| `viem` | ^2.53.1 (web), ^2.47.6 (contracts) | Ethereum client |
| `@tanstack/react-query` | ^5.59.0 | Data fetching for the window and chain reads |
| `react`, `react-dom` | ^18.3.1 | Interface |
| `vite` | ^5.4.0 | Dev server |
| `hardhat` | ^3.21.1 | Compile, test, Ignition deploy |

Wallet: QoreX (app or browser extension). See [QoreX Integrations](/developer-tools/qorex-integrations) and the [QoreX overview](/qorex/overview).

## Step by step {#steps}

The project has two folders: `contracts-app/` (Hardhat) and `web/` (Vite and React).

### 1. Contract: test, window, deploy {#step-contract}

Prepare a testnet-only account in `contracts-app/.env` exactly as in the [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter#step-account) (copy `contracts-app/.env.example`; never commit the file), then:

```sh
cd contracts-app
pnpm install
pnpm test
pnpm window register        # once
pnpm window open && sleep 10 && pnpm deploy:testnet
pnpm sign "Hello from the workshop"   # sign from the CLI
pnpm sign --read                      # list the latest entries
```

### 2. Web page {#step-web}

Create `web/.env` from `web/.env.example` and set the deployed address:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

`VITE_WALLETCONNECT_PROJECT_ID` in the same file is only needed if you add a WalletConnect-based wallet to `src/wagmi.ts`.

Then run the page:

```sh
cd web
pnpm install
pnpm dev     # http://localhost:5174
```

The page reads the chain over the EVM RPC. It reads the EVM window over REST through the Vite proxy `/lcd`, because the public REST endpoint sends no CORS headers.

### 3. Sign from QoreX {#step-sign}

1. Install QoreX (the extension for a desktop browser, or the app) and switch it to the testnet. See [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes#step-testnet) for the switch.
2. Use a coin-60 (Ethereum) account in QoreX with a registered ML-DSA-87 key and some testnet QOR from the [faucet](/dashboard/faucet).
3. On the page, choose **Connect QoreX**, type a message, and choose **Sign**. QoreX offers to open the EVM window in its approval if none is open.

## The code {#code}

The contract keeps entries in an array and allows one signature per address:

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX is the first wallet in the connector list (`web/src/wagmi.ts`):

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

The page shows the window and explains refusals (`web/src/App.tsx`):

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## What you see when it works {#result}

- Step 1 of the page shows your `0x...` account, the chain `qorechain-diana EVM (9800)`, your balance and the EVM window as `live` with blocks and transactions left.
- After you choose **Sign** and approve in QoreX, a transaction link to the [explorer](https://explore.qore.network) appears (switch the explorer to Testnet), then `success in block ...`.
- The list at the bottom shows the number of signatures on chain and the latest entries (up to 20), newest first, refreshed every few seconds.
- A second attempt from the same address shows that the address has already signed.

## Get the code {#get-the-code}

The code is in the public repository: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook (the link works once the repository is published; the code is also shown inline on this page).
