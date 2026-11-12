---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

The Q-Day Guestbook is an on-chain guestbook on the QoreChain EVM testnet. Anyone can sign it once per address with a message of up to 140 characters. It has two parts: a Solidity contract with a Hardhat project (`contracts-app/`), and a React web page (`web/`) that connects the QoreX wallet, shows the account's EVM window and lists the latest signatures live.

## What it shows {#shows}

- **A browser dApp that signs hybrid without knowing it.** The page is an ordinary wagmi and RainbowKit app. QoreX adds the ML-DSA-87 half of the signature, so the same transaction is protected by secp256k1 and by a post-quantum key.
- **The EVM window is visible in the interface.** The page reads the account's window from the chain and shows whether it is live and how many blocks and transactions are left.
- **Readable refusals.** When the chain refuses a write, `classifyEvmWindowRejection` maps the error to one of four causes (no registered key, no window, window used up, invalid parameters) and the page shows the fix.
- **Hybrid signatures verified on chain.** Each signature you write is one transaction that the chain accepted only after checking both signatures (ML-DSA-87 and secp256k1).

## Before you start {#prerequisites}

You need a terminal on macOS, Linux, or Windows with WSL or Git Bash, and these tools:

| Tool | Needed version | Check with |
| --- | --- | --- |
| Git | any recent version | `git --version` |
| Node.js | 20.12 or newer (22 LTS recommended) | `node --version` |
| pnpm | 9 or newer | `pnpm --version` |

Install Node.js from https://nodejs.org. If `pnpm --version` fails, install pnpm with `npm install -g pnpm` (or `corepack enable`) and check again.

You also need a free account on the [QoreChain dashboard](https://dashboard.qorechain.io) for the faucet, and, for the browser part, the QoreX wallet (the extension for a desktop browser, or the app). See [QoreX Integrations](/developer-tools/qorex-integrations) and the [QoreX overview](/qorex/overview). In the contract steps you never use a real wallet: you use a throwaway testnet account. Testnet QOR has no value.

## Step by step {#steps}

### 1. Get the code {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

The project has two folders that you set up separately.

### 2. Contracts: install and test {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

You should see `3 passing` for the `QDayGuestbook` tests. They run on a local simulated chain and need no key.

### 3. Contracts: create the testnet key file {#step-account}

```sh
cp .env.example .env
```

The `.env` file holds a throwaway key, so never commit it and never reuse the key anywhere real. Open `.env` in any editor and fill in two values.

**a. A throwaway private key.** Generate a random 32-byte key:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

Copy the printed `0x...` value into `.env` as `PRIVATE_KEY=0x...`, replacing the all-zero placeholder.

**b. A post-quantum recovery code.** The account's ML-DSA-87 key is derived from a separate recovery code. Create one:

```sh
pnpm window recovery-code
```

Copy the printed `QRC1-...` line into `.env` as `QORE_PQC_RECOVERY_CODE=QRC1-...`. Always reuse the same code: a new code gives the account a different ML-DSA-87 key.

Leave `QORE_MNEMONIC` empty and keep `QORE_NETWORK=testnet`. Your `.env` now looks like this (placeholders shown):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 4. Contracts: fund the account {#step-faucet}

```sh
pnpm window status
```

The first line prints your account as `0x...` and its `qor1...` form. Copy the `qor1...` address, then:

1. Open https://dashboard.qorechain.io/faucet and sign in.
2. Paste the `qor1...` address and request the QOR (100 QOR once every 24 hours).
3. Wait a few seconds and run `pnpm window status` again.

### 5. Contracts: register the key, open the window, deploy {#step-window}

```sh
pnpm window register        # once: registers your ML-DSA-87 key
pnpm window open            # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                    # opening the window advances the account's nonce
pnpm deploy:testnet         # Hardhat Ignition, answer y when asked to confirm
```

`pnpm deploy:testnet` prints the deployed `QDayGuestbook` address (`0x...`). Copy it. Registration is the one message the chain accepts signed classically, because there is no key on chain yet to check against. Opening the window is signed hybrid; keep the transaction hash it prints.

### 6. Contracts: sign from the command line {#step-cli}

```sh
pnpm sign "Hello from my terminal"   # writes one entry
pnpm sign --read                     # lists the latest entries
```

Each address can sign once, so a second `pnpm sign` from the same account is refused by the contract.

### 7. Web page: install and configure {#step-web}

Open a second terminal in the same project folder (or go back to it with `cd ..`), then:

```sh
cd web
pnpm install
cp .env.example .env
```

Open `web/.env` and set the address you copied in step 5:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

Leave `VITE_WALLETCONNECT_PROJECT_ID` empty: it is only needed if you add a WalletConnect-based wallet to `src/wagmi.ts`.

### 8. Web page: run it {#step-run}

```sh
pnpm dev
```

Open http://localhost:5174 in the browser where QoreX is installed. The page reads the chain over the EVM RPC. It reads the EVM window over REST through the Vite proxy `/lcd`, because the public REST endpoint sends no CORS headers. The list of signatures at the bottom already shows the entry you wrote in step 6.

### 9. Sign from QoreX {#step-sign}

1. Install QoreX and switch it to the testnet. See [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes#step-testnet) for the switch.
2. In QoreX use a coin-60 (Ethereum) account with a registered ML-DSA-87 key, and fund it from the [faucet](/dashboard/faucet) (paste its address after signing in).
3. On the page, choose **Connect QoreX**, type a message, and choose **Sign**. QoreX offers to open the EVM window in its approval if none is open.
4. Approve in QoreX.

### 10. Look it up on the explorer {#step-explorer}

Open https://explore.qore.network and switch the network selector to **Testnet**. Search for the transaction hash from step 6 or 9, the hash from `pnpm window open`, or the `QDayGuestbook` address. The window transaction shows a post-quantum signature that the chain verified.

## What you should see {#result}

- `pnpm test` in `contracts-app` prints `3 passing`.
- `pnpm window status` prints `PQC key: registered` and `window: live` with the blocks and transactions left.
- `pnpm deploy:testnet` prints the `QDayGuestbook` address (`0x...`).
- `pnpm sign "..."` prints the transaction hash and `status: success in block ...`.
- On the page, step 1 shows your `0x...` account, the chain `qorechain-diana EVM (9800)`, your balance and the EVM window as `live` with blocks and transactions left.
- After you choose **Sign** and approve in QoreX, a transaction link to the explorer appears, then `success in block ...`.
- The list at the bottom shows the number of signatures on chain and the latest entries (up to 20), newest first, refreshed every few seconds.
- A second attempt from the same address shows that the address has already signed.

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

## Packages used {#packages}

Contracts (`contracts-app/`):

| Package | Version | Used for |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Window helper script, hybrid signing |
| `@qorechain/evm` | ^0.13.0 | Chain definitions, `evmWindowStatus`, `evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | Broadcasting the window message |
| `hardhat` | ^3.21.1 | Compile, test, Ignition deploy |
| `viem` | ^2.47.6 | Ethereum client |
| `tsx` | ^4.19.0 | Running the TypeScript scripts |
| `typescript` | ^5.6.3 | Type checking |

Web page (`web/`):

| Package | Version | Used for |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | Chain definitions, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX as a RainbowKit wallet |
| `@rainbow-me/rainbowkit` | ^2.2.11 | Connect button |
| `wagmi` | ^2.19.5 | React hooks for reads and writes |
| `viem` | ^2.53.1 | Ethereum client |
| `@tanstack/react-query` | ^5.59.0 | Data fetching for the window and chain reads |
| `react`, `react-dom` | ^18.3.1 | Interface |
| `vite` | ^5.4.0 | Dev server |
| `@vitejs/plugin-react` | ^4.3.0 | React support for Vite |
| `typescript` | ^5.6.3 | Type checking |

Source: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
