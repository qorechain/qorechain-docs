---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

The Q-Day Guestbook is an on-chain guestbook on the QoreChain EVM testnet. Anyone can sign it once per address with a message of up to 140 characters. It has two parts:

- **`contracts-app/`**: a Solidity contract and a Hardhat project. You deploy it and can sign from the terminal.
- **`web/`**: a web page that opens in your browser, connects the QoreX wallet, shows the account's EVM window and lists the latest signatures live.

This guide is written for beginners. Every command is explained and every step ends with what you should see.

**How long this takes:** about 35 minutes the first time: 20 for the contract part, 15 for the web page.

## What it shows {#shows}

- **A browser dApp that signs hybrid without knowing it.** The page is an ordinary wagmi and RainbowKit app. QoreX adds the post-quantum half (ML-DSA-87) of the signature, so the same transaction is protected by the classic key (secp256k1) and by a post-quantum key.
- **The EVM window is visible in the interface.** The page reads the account's window from the chain and shows whether it is live and how many blocks and transactions are left.
- **Readable refusals.** When the chain refuses a write, the page maps the error to one of four causes (no registered key, no window, window used up, invalid parameters) and shows the fix.
- **Hybrid signatures verified on chain.** Each signature you write is one transaction that the chain accepted only after checking both signatures.

## Before you start {#prerequisites}

This guide uses a throwaway testnet account for the terminal part. Never use a real wallet or real funds. Testnet QOR has no value.

You need a terminal. On macOS open **Terminal**. On Windows open **PowerShell** (or **Git Bash**, which comes with Git). On Linux open any terminal. Install these three tools. If the check command already prints a good version, skip the install.

### Node.js 22 or later

Node.js runs JavaScript on your computer. Hardhat 3 needs Node.js 22 or later.

| System | Install | Check |
| --- | --- | --- |
| macOS | `brew install node` (needs [Homebrew](https://brew.sh)), or download from https://nodejs.org | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`, or download from https://nodejs.org | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, open a new terminal, then `nvm install 22` | `node --version` |

What you should see: a number that starts with `v22` or higher. On Windows, close and reopen PowerShell after installing.

### pnpm

pnpm downloads the libraries a project needs. Node.js does not include it, so install it yourself, on every system.

```sh
npm install -g pnpm
```

| Part | Meaning |
| --- | --- |
| `npm` | The tool that comes with Node.js. It installs other tools. |
| `install` | Download and install. |
| `-g` | Global: install for the whole computer, not just one folder. |
| `pnpm` | The tool to install. |

Check it with `pnpm --version`. You should see a number such as `9.12.0` (9 or higher). If you ever see `pnpm: command not found`, run the install command above and open a new terminal. If macOS or Linux says `EACCES: permission denied`, use `sudo npm install -g pnpm`.

### Git

| System | Install | Check |
| --- | --- | --- |
| macOS | `xcode-select --install` or `brew install git` | `git --version` |
| Windows | `winget install Git.Git`, or download from https://git-scm.com | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) or `sudo dnf install git` (Fedora) | `git --version` |

What you should see: `git version 2.` and a number.

## Testnet wallets {#wallet}

This guide uses two accounts, and they are different on purpose:

1. **A key file account** for the terminal part (steps 3 to 6). The guide creates it for you. It deploys the contract.
2. **A QoreX account** for the web page (steps 8 and 9). The web page signs with it.

**QoreX on testnet.** [QoreX](/qorex/overview) is the QoreChain wallet. You use the browser extension for the web page (see [QoreX Integrations](/developer-tools/qorex-integrations)). Install it in the browser you will use, then:

- **QoreX browser extension:** unlock it, tap the version number at the bottom 7 times, then choose **Switch to testnet (diana)**.
- **QoreX app on your phone:** Settings, then **Use testnet (developers)**.
- For the EVM lane choose **Add an Ethereum account (coin 60)**. The web page needs a coin 60 account.

**The faucet** gives free testnet QOR: https://dashboard.qorechain.io/faucet. Sign in, paste an address, request. You get 100 QOR per 24 hours per account.

**About amounts.** QOR is the coin. `uqor` is its smallest piece: 1 QOR = 1,000,000 uqor. The first transaction of a new account registers its post-quantum key, a one-time fee of about 0.09 QOR.

## Part 1: the contract {#contract}

### 1. Get the code {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

**What it does**

- `git clone <address>` downloads the project from GitHub into a new folder `build-before-qday`.
- `cd <folder>` moves your terminal into the Guestbook project. It has two folders, `contracts-app` and `web`, that you set up separately.

**What you should see:** `Cloning into 'build-before-qday'...`. **How long:** a few seconds.

### 2. Install the libraries and test {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

**What it does**

- `cd contracts-app` goes into the contract folder.
- `pnpm install` downloads the libraries listed in `package.json` (Hardhat and the QoreChain SDK).
- `pnpm test` runs the contract's checks on a fake chain inside your computer. It needs no key and no network account. The first run downloads the Solidity compiler.

**What you should see:** a list of packages, `Done in` a few seconds, then `QDayGuestbook` with three ticks and `3 passing`. **How long:** about a minute.

### 3. Create the key file {#step-account}

The project reads its secrets from a file named `.env`. Create it from the template.

macOS, Linux, Git Bash:

```sh
cp .env.example .env
```

Windows PowerShell:

```sh
copy .env.example .env
```

**What it does**

- `cp` (or `copy`) copies the template `.env.example` to a new file `.env`.

The `.env` file is your **key file**. It lives only in the `contracts-app` folder. **Never share it, never commit it to Git, and never reuse these keys for a real wallet.** The project already ignores `.env` in Git. Open it in any text editor (`open -e .env` on macOS, `notepad .env` on Windows, `nano .env` on Linux) and fill in two values.

**a. A throwaway private key.**

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**What it does**

- `node -e "..."` runs one line of JavaScript. The line makes 32 random bytes and prints them in hexadecimal with `0x` in front. That is a private key.

**What you should see:** one line, `0x` and then 64 letters and digits. Copy it into `.env` as `PRIVATE_KEY=0x...`, replacing the all-zero placeholder.

**b. A post-quantum recovery code.**

```sh
pnpm window recovery-code
```

**What it does**

- `pnpm window` runs the helper script `scripts/window.ts`. The word after it is the command.
- `recovery-code` prints a new random code from which the account's ML-DSA-87 key is made.

**What you should see:** a line starting with `QRC1-`. Copy it into `.env` as `QORE_PQC_RECOVERY_CODE=QRC1-...`. Keep the same code for this account: a new code gives a different post-quantum key.

Leave `QORE_MNEMONIC` empty (a mnemonic is a 12 or 24 word phrase that can replace the two values above; use either, not both) and keep `QORE_NETWORK=testnet`, which tells the helper to use the test network. Your `.env` looks like this (placeholders shown):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

Save the file.

### 4. Fund the account {#step-faucet}

```sh
pnpm window status
```

**What it does**

- Shows your account, whether its post-quantum key is registered, and whether it has an EVM window.

**What you should see:** `account:  0x...  (qor1...)`, then `PQC key:  not registered` and `window:   none`. Copy the `qor1...` address. Then:

1. Open https://dashboard.qorechain.io/faucet and sign in.
2. Make sure the page is set to **Testnet**.
3. Paste the `qor1...` address and request the QOR (100 QOR once every 24 hours per account).
4. Wait about 10 seconds. Searching your address on https://explore.qore.network (Testnet) shows the balance.

### 5. Register the key, open the window, deploy {#step-window}

```sh
pnpm window register
```

**What it does**

- Sends your ML-DSA-87 public key to the chain, once per account. It is the one message the chain accepts without a post-quantum signature, because no key is on the chain yet to check against. It costs about 0.09 QOR.

**What you should see:** `registered: ` and a transaction hash.

```sh
pnpm window open
```

**What it does**

- Sends one transaction, signed with both keys (hybrid), that opens an EVM authorisation window. While it is live your ordinary EVM transactions are allowed. By default it lasts 600 blocks and allows 5 transactions.

**What you should see:** `opened: ` and a transaction hash, then `window: 600 blocks, 5 txs, ...`. **Copy this hash** for the last step.

```sh
sleep 10
```

**What it does**

- Waits 10 seconds (also works in PowerShell and Git Bash). Opening the window changes the account's transaction counter, and the next command must see the new value.

```sh
pnpm deploy:testnet
```

**What it does**

- Runs Hardhat Ignition, the tool that deploys contracts, with the module `QDayGuestbook` on the network `qorechainTestnet` (chain id 9800, the QoreChain testnet).
- It asks you to confirm. Type `y` and press Enter.

**What you should see:** a line that ends with `QDayGuestbookModule#QDayGuestbook` and your contract address `0x...`. **Copy this address**: the web page needs it. **How long:** about 30 seconds.

### 6. Sign from the terminal {#step-cli}

```sh
pnpm sign "Hello from my terminal"
pnpm sign --read
```

**What it does**

- `pnpm sign "<message>"` writes one entry to the guestbook. The text in quotes is your message, up to 140 characters.
- `pnpm sign --read` only reads: it lists the latest entries and sends nothing.

**What you should see:** after the first command `tx: 0x...` and `status: success in block ...`. After the second, `guestbook 0x...: 1 signatures` and your message with the time and your address.

Each address can sign once. A second `pnpm sign` from the same account is refused by the contract with `AlreadySigned`.

## Part 2: the web page {#web}

### 7. Install and configure the page {#step-web}

Open a second terminal window in the same project folder, or go back with `cd ..`. Then:

```sh
cd web
pnpm install
```

**What it does**

- Goes into the web folder and downloads its libraries (React, wagmi, RainbowKit, Vite).

**What you should see:** a list of packages and `Done in` a few seconds.

Create the page settings file. macOS, Linux, Git Bash: `cp .env.example .env`. Windows PowerShell: `copy .env.example .env`. Open `web/.env` in an editor and set the contract address you copied in step 5:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

Leave `VITE_WALLETCONNECT_PROJECT_ID` empty. It is only needed if you add a WalletConnect wallet to `src/wagmi.ts`.

### 8. Start the page and connect QoreX {#step-run}

```sh
pnpm dev
```

**What it does**

- Starts a small web server on your own computer (Vite). The page lives at `http://localhost:5174`. The server also forwards requests that start with `/lcd` to the public testnet REST server. The browser cannot call that server directly (it sends no CORS headers), so this proxy does it for the page.
- The command keeps running. Leave this terminal open. Press `Ctrl+C` to stop it later. If you change `web/.env`, stop and start it again.

**What you should see:** `VITE ... ready` and `Local: http://localhost:5174/`.

Now in the browser where QoreX is installed:

1. Open http://localhost:5174 .
2. Make sure QoreX is unlocked and switched to testnet (see "Testnet wallets" above), with a coin 60 account that has QOR from the faucet. Use the `qor1...` form of its address on the faucet page if QoreX shows both forms.
3. On the page, in card 1, choose **Connect QoreX** (the connect button). If QoreX is not listed first, choose it from the list of wallets.
4. QoreX opens a window asking to connect. Approve it.

**What you should see:** card 1 shows your `0x...` account, the chain `qorechain-diana EVM (9800)`, your balance, and the EVM window: `no window open` for a new account. Card 3 shows `On chain now: 1 signatures` and the entry you wrote in step 6. If the chain line says `wrong chain`, switch QoreX to testnet.

### 9. Sign from QoreX {#step-sign}

1. In card 2, type a message (up to 140 characters). The page shows how many you used.
2. Choose **Sign**.
3. QoreX opens its approval. If your account has no post-quantum key or no window yet, QoreX offers to register the key (a one-time fee of about 0.09 QOR) and to open the EVM window in the same approval. Choose to do so.
4. Approve in QoreX. The button reads `Approve in QoreX...` while it waits.

**What you should see:** a line `tx 0x...` with a link to the explorer, first `waiting for the block...`, then `success in block ...`. Card 1 now shows the EVM window as `live` with blocks and transactions left. Card 3 adds your message at the top, newest first. It lists up to 20 entries and refreshes every few seconds. If you try again from the same address, card 2 says `This address has already signed.`

### 10. Verify on chain {#step-explorer}

Use the hash from `pnpm window open` (step 5). For the page, QoreX also opens the window in its own transaction: ask QoreX for its history or look up your address on the explorer.

**a. With the plain web request.** Replace `<HASH>` with the hash (remove the `<` and `>`).

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**What it does**

- `curl <address>` asks a public QoreChain server for the record of that transaction and prints it. On Windows PowerShell type `curl.exe` instead of `curl`.

**What you should see in the long answer:**

- `"code": 0`, which means the transaction succeeded.
- An extension of type `PQCHybridSignature` with the ML-DSA-87 signature, 4,627 bytes long.
- An event `pqc_hybrid_verify` with `status` set to `verified`.

**b. With the explorer.** Open https://explore.qore.network, switch the network selector to **Testnet**, and search for the transaction hash (from step 5, 6 or 9), your account address, or the `QDayGuestbook` address. The window transaction shows a post-quantum signature that the chain verified.

## What you should see at the end {#result}

- `pnpm test` in `contracts-app` prints `3 passing`.
- `pnpm window status` prints `PQC key:  registered` and `window:   live` with the blocks, transactions and value left.
- `pnpm deploy:testnet` prints the `QDayGuestbook` address (`0x...`).
- `pnpm sign "..."` prints the transaction hash and `status: success in block ...`.
- The page shows your account, `qorechain-diana EVM (9800)`, your balance and the window as `live`. After **Sign** and your approval you see a transaction link and `success in block ...`.
- The list at the bottom shows the number of signatures and the latest entries, newest first.
- The `curl` check shows `"code": 0`, the `PQCHybridSignature` extension and `pqc_hybrid_verify` with `status` `verified`.

## Troubleshooting {#troubleshooting}

| What you see | Why | What to do |
| --- | --- | --- |
| `pnpm: command not found` | pnpm is not installed. Node.js does not include it. | Run `npm install -g pnpm`, then open a new terminal. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js is too old. | Install Node.js 22 or later. |
| `node: .env: not found` | There is no `.env` file in this folder. | Do step 3 in `contracts-app`, and run the commands from that folder. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY ...` or `Set QORE_PQC_RECOVERY_CODE ...` | A value in `.env` is empty, a placeholder, or has a typo. | Fill both values as in step 3 and save. |
| `... does not exist on chain yet: send it some QOR first` | The account has no QOR yet. | Use the faucet (step 4), wait 10 seconds. |
| Faucet says you reached the limit | One request per 24 hours per account. | Wait, then try again. |
| `account has no PQC key and classical fallback is disabled` | A transaction was sent before the key was registered. | Run `pnpm window register`, then `pnpm window open`. In QoreX, approve the registration offered with your first send. |
| `EVM authorisation window exhausted` or `open an EVM window first` | The window ran out of blocks or transactions, or never opened. | Run `pnpm window open` (terminal) and wait 10 seconds. In the page, approve the new window when QoreX offers it. |
| `HHE10402` after the window opens | The deploy ran before the account's transaction counter updated. | Wait 10 seconds and run `pnpm deploy:testnet` again. |
| `refused: ... (AlreadySigned)` | This address has already signed. | Each address signs once. Use another account. |
| `refused: ... (BadLength)` | The message is empty or longer than 140 characters. | Use 1 to 140 characters. |
| `Deploy first (pnpm deploy:testnet) or set GUESTBOOK_ADDRESS` | `pnpm sign` cannot find the contract. | Finish step 5 in `contracts-app`. |
| The page shows no entries and the **Sign** button is grey | `VITE_GUESTBOOK_ADDRESS` is empty in `web/.env`. | Paste the address from step 5, then stop (`Ctrl+C`) and restart `pnpm dev`. |
| The page says `wrong chain` | QoreX is not on the testnet. | Switch QoreX to testnet (diana), see "Testnet wallets". |
| QoreX is not offered when you choose connect | The page was opened in a browser without the QoreX extension, or the extension is locked. | Open http://localhost:5174 in the browser with QoreX and unlock it. |
| Port 5174 is already in use | Another program uses it. | Close it, or use the other address Vite prints. |
| `could not read` next to the EVM window, or CORS errors in the browser console | The page called the REST server directly, and it sends no CORS headers. | Call REST only through the `/lcd` proxy of the dev server, as this project does. Start the page with `pnpm dev`. |

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
