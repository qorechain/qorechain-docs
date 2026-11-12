---
slug: /build-before-qday/workshop-1
title: "Workshop 1: Your first hybrid-signed transaction"
sidebar_label: "Workshop 1"
sidebar_position: 2
date: 2026-11-12
---

# Workshop 1: Your first hybrid-signed transaction

This guide takes you from a computer with nothing installed to one transaction signed with two keys at once and verified by the QoreChain testnet. You do not need to be a developer. Every command is explained in plain words, and every step ends with what you should see on your screen.

**How long this takes:** about 30 minutes the first time, including installing the tools. About 10 minutes if the tools are already installed.

## What we build {#what-we-built}

A complete Solidity project (a small smart contract) created with one command, tested, deployed to the QoreChain testnet, and then one transaction signed with **two keys at once** and checked by the chain.

What it shows:

- **Hybrid signing.** The transaction carries a classical secp256k1 signature and a post-quantum ML-DSA-87 signature (NIST FIPS 204). Both must be valid.
- **One hybrid-signed transaction verified on chain.** The validators verify both signatures. You read the proof from the public REST endpoint (the `PQCHybridSignature` extension and the `pqc_hybrid_verify` event) and in the explorer.
- **The EVM authorisation window.** An Ethereum transaction cannot carry a post-quantum signature. So on QoreChain you register your ML-DSA-87 key once and open a short window, with a hybrid-signed message, during which your normal EVM transactions are admitted. See [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes) for the idea in depth.

This is exactly what the Quantum Pass level asks for.

## Words used in this guide {#words}

| Word | Plain meaning |
| --- | --- |
| Terminal | The window where you type commands. Terminal on macOS and Linux, PowerShell on Windows |
| Testnet | A practice copy of QoreChain. Its coins have no value |
| QOR and uqor | QOR is the coin. uqor is its smallest unit. 1 QOR = 1,000,000 uqor |
| Transaction | One signed instruction sent to the chain |
| Memo | A short text attached to a transaction |
| Private key | A secret that signs for your account. Whoever has it controls the account |
| Recovery code | A second secret (starts with `QRC1`) from which your post-quantum key is made |
| Hash | The unique ID of a transaction. You use it to look the transaction up |
| Gas and fee | The small price paid in QOR for the chain to process a transaction |

:::caution Throwaway testnet account only
Use a key made for this exercise, holding test QOR only. Never use a real wallet or real funds. Never put the key or recovery code of an account that holds real money into the `.env` file, and never share or commit `.env`.
:::

## Before you start {#prerequisites}

You need a computer with macOS, Windows or Linux, a terminal and a web browser. For this tutorial you install two tools: **Node.js 22 or later** (Hardhat 3, the project tool used here, needs version 22) and **pnpm** (the tool that downloads the project's libraries). One optional tool, **jq**, only makes a verification output easier to read.

Open a terminal first. On macOS open **Terminal**. On Windows open **PowerShell**. On Linux open your terminal app.

### Node.js 22 or later {#install-node}

1. Check if you already have it:

```bash
node -v
```

It must print `v22` or a higher number. If it prints `command not found` or an older version, install Node.js as below.

2. Install it for your system:

| System | How to install |
| --- | --- |
| macOS | Download the installer from [nodejs.org/en/download](https://nodejs.org/en/download), or run `brew install node@22` if you use Homebrew |
| Windows | Run `winget install OpenJS.NodeJS.LTS` in PowerShell, or download the installer from [nodejs.org/en/download](https://nodejs.org/en/download) |
| Linux | Run `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, close and reopen the terminal, then run `nvm install 22` |

3. Close the terminal, open a new one and run `node -v` again.

**What you should see:** a number starting with `v22` or higher, for example `v22.12.0`.

### pnpm {#install-pnpm}

1. Check if you already have it:

```bash
pnpm -v
```

2. If it prints `command not found` (or `pnpm: command not found`), install it:

```bash
npm install -g pnpm
```

| Part | Meaning |
| --- | --- |
| `npm` | The package tool that comes with Node.js |
| `install` | Download and install a program |
| `-g` | Global: install it for your whole computer, not for one folder |
| `pnpm` | The program to install |

Node.js installed with Homebrew does not include pnpm. That is why `pnpm: command not found` is common on macOS: running the command above fixes it. On Linux or macOS, if you see a permissions error, run `corepack enable` instead and then `pnpm -v` again.

3. Check again with `pnpm -v`.

**What you should see:** a version number, for example `9.12.0` or higher.

### jq (optional) {#install-jq}

`jq` prints a long answer in a short readable form. It is used once, in step 8.

| System | Install | Check |
| --- | --- | --- |
| macOS | `brew install jq` | `jq --version` |
| Windows | `winget install jqlang.jq` | `jq --version` |
| Linux | `sudo apt install jq` (Debian and Ubuntu) | `jq --version` |

`curl`, used in step 8, is already on macOS, Linux and Windows 10 or later. In Windows PowerShell type `curl.exe` instead of `curl`.

## Your testnet wallet and the faucet {#wallet}

The project makes its own throwaway account in step 3, so you do not need a wallet to finish this guide. You do need testnet QOR in that account, and you can also set up the QoreX wallet on testnet to use with the example apps.

**QoreX on testnet (optional here, needed for the browser example apps):**

1. In the **QoreX app**: open **Settings** and turn on **Use testnet (developers)**.
2. In the **QoreX browser extension**: unlock it, tap the version number at the bottom 7 times, then choose **Switch to testnet (diana)**.
3. For anything on the Ethereum side (EVM), also choose **Add an Ethereum account (coin 60)**. This gives you an account with a `0x...` address that works with Ethereum tools.

**The faucet** is a free machine that gives testnet QOR. You use it in step 4:

- Address: [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet). You sign in first.
- Amount: 100 QOR, once every 24 hours per account.
- The very first transaction of a new account registers its post-quantum ML-DSA-87 key. This costs a one-time fee of about 0.09 QOR, so 100 QOR is plenty.

The network details used in this guide:

| Service | URL |
| --- | --- |
| Testnet | `qorechain-diana`, EVM chain ID 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (switch to Testnet) |
| Faucet | `https://dashboard.qorechain.io/faucet` (sign-in required) |

## Steps {#steps}

### Step 1: Check your tools {#step-1}

**How long this takes:** 1 minute.

```bash
node -v
```

| Part | Meaning |
| --- | --- |
| `node` | The Node.js program |
| `-v` | Print its version and stop |

```bash
pnpm -v
```

| Part | Meaning |
| --- | --- |
| `pnpm` | The package tool |
| `-v` | Print its version and stop |

**What you should see:** `v22` or higher for Node.js, and a version number for pnpm. If not, go back to "Before you start".

### Step 2: Create the project and run the tests {#step-2}

**How long this takes:** about 1 minute. It needs internet access.

1. Create the project in a new folder. In your terminal, go to a folder where you keep projects (for example your Documents folder), then run:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

What it does: downloads the QoreChain project creator and builds a ready-made project called `qday-demo` in a new folder.

Parameters:

- `npx`: runs a program from the internet without installing it permanently.
- `create-qorechain-dapp@latest`: the QoreChain project creator. `@latest` means use the newest version (this guide was checked with 0.14.0).
- `qday-demo`: the name of the new folder and project. You can choose another name.
- `-t hardhat`: `-t` means template. This picks the Hardhat template: a Solidity contract project with tests.
- `--network testnet`: which QoreChain network the project talks to. `testnet` is the practice network.
- `--package-manager pnpm`: which tool installs the libraries the project needs.

**What you should see:** a list of installed packages and then `Done! Created qday-demo`. If it asks to install `create-qorechain-dapp`, answer `y`.

2. Go into the project folder:

```bash
cd qday-demo
```

What it does: moves your terminal into the new folder. All the next commands run from here.

Parameters:

- `cd`: change directory.
- `qday-demo`: the folder to enter.

3. Run the tests:

```bash
pnpm test
```

What it does: compiles the contract and checks that it works, on a small simulated chain inside your computer. It sends nothing to the real testnet.

Parameters:

- `pnpm`: the package tool.
- `test`: the name of the script to run (listed in `package.json`; it runs `hardhat test`).

**What you should see:**

```text
  Counter
    ✔ starts at the constructor value
    ✔ increments and emits CountChanged

2 passing (2 nodejs)
```

4. Look at what you got (optional):

| File | What it is |
| --- | --- |
| `contracts/Counter.sol` | The smart contract: it stores one number and can add 1 |
| `ignition/modules/Counter.ts` | The recipe that deploys the contract |
| `scripts/window.ts` | The helper behind `pnpm window`: register your key and open the authorisation window |
| `hardhat.config.ts` | Settings, including the `qorechainTestnet` network (chain ID 9800) |
| `.env` | Your secret settings file. You fill it in step 3. Never share it |

More on the templates: [Scaffolders and CLI](/developer-tools/scaffolders-and-cli) and [Chain developer kit](/developer-tools/chain-dev-sdk).

### Step 3: Create a throwaway testnet account {#step-3}

**How long this takes:** 3 minutes.

The account needs two secrets: an Ethereum-style **private key**, and a **recovery code** (starts with `QRC1`) from which the post-quantum ML-DSA-87 key is made. Both go into the `.env` file in your project folder. The file is private to your computer.

1. Make a new private key. First create a small file named `make-key.mjs` inside the `qday-demo` folder, with this content (use any text editor, such as Notepad, TextEdit in plain text mode, or nano):

```js
import { generatePrivateKey } from "viem/accounts";
import { readFileSync, writeFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
writeFileSync(".env", env.replace(/^PRIVATE_KEY=.*$/m, `PRIVATE_KEY=${generatePrivateKey()}`));
console.log("New private key saved in .env");
```

What this file does: makes a random private key and writes it into your `.env` file, so it is never shown on screen or copied by hand.

2. Run it:

```bash
node make-key.mjs
```

What it does: runs the small file with Node.js.

Parameters:

- `node`: the Node.js program.
- `make-key.mjs`: the file to run.

**What you should see:** `New private key saved in .env`. Run it only once: a second run makes a different account.

3. Make a recovery code:

```bash
pnpm window recovery-code
```

What it does: creates a new recovery code and prints it.

Parameters:

- `pnpm window`: runs the project's window helper (`scripts/window.ts`).
- `recovery-code`: the action: print a new recovery code.

**What you should see:** one long line starting with `QRC1`, then a note about keeping it. Copy the whole `QRC1...` line.

4. Put the code into `.env`. Open the file in an editor:

| System | Command |
| --- | --- |
| macOS | `open -e .env` |
| Windows | `notepad .env` |
| Linux | `nano .env` |

Find the line `QORE_PQC_RECOVERY_CODE=` and paste the code right after the equals sign, with no spaces and no quotes. Save the file. The result looks like this (placeholders shown, yours are real):

```text
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1...
QORE_NETWORK=testnet
```

What each line means:

- `PRIVATE_KEY`: the secret that signs for the classical (secp256k1) half of your account.
- `QORE_PQC_RECOVERY_CODE`: the secret that makes the post-quantum (ML-DSA-87) half.
- `QORE_NETWORK`: which network the helper talks to. `testnet` is the practice network.

Keep `.env` exactly as it is. The same key and code give you the same account every time. If you lose the file, start again with a new account. Never share it, and never commit it to git.

Prefer a mnemonic (twelve words)? Instead of the key and the code, put `QORE_MNEMONIC="your twelve words"` in `.env`. Both keys come from the same phrase and no recovery code is needed. Use a phrase made only for this exercise.

5. Ask the project for the address of your new account:

```bash
pnpm window status
```

What it does: reads the public chain and shows your account, your post-quantum key and your window. It changes nothing.

Parameters:

- `pnpm window`: runs the window helper.
- `status`: the action: show the current state.

**What you should see:** three lines (yours show real addresses):

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

Copy the `qor1...` address. That is the one you give to the faucet. Both addresses belong to the same account: `0x...` is the Ethereum form and `qor1...` is the QoreChain form.

### Step 4: Get testnet QOR from the faucet {#step-4}

**How long this takes:** 2 minutes.

1. Open the [faucet](https://dashboard.qorechain.io/faucet) in your browser and sign in.
2. Make sure the dashboard is on **Testnet**.
3. Paste your `qor1...` address.
4. Select **Request Tokens**.

**What you should see:** a card saying **Tokens Sent!** with 100 QOR (plus some fest test tokens) and a **View on Explorer** link.

The faucet pays once every 24 hours per account. The exact amounts are on [Faucet](/dashboard/faucet). Now check from your terminal:

```bash
pnpm window status
```

**What you should see:** the same three lines as before. Your account now exists on the chain and can pay fees. It still says the key is not registered. That comes next.

### Step 5: Register your key and open the window {#step-5}

**How long this takes:** about 2 minutes.

1. Register your ML-DSA-87 key. This is a one-time step per account:

```bash
pnpm window register
```

What it does: sends one transaction that tells the chain which post-quantum key belongs to your account. It costs a one-time fee of about 0.09 QOR. The chain accepts this one message signed with the classical key only, because there is no post-quantum key on record yet.

Parameters:

- `pnpm window`: runs the window helper.
- `register`: the action: register the key.

**What you should see:** `registered: <HASH>`. If it says `The account already has a PQC key; nothing to do.`, that is fine: go on.

2. Open the authorisation window:

```bash
pnpm window open
```

What it does: sends a **hybrid-signed** transaction (both keys) that opens a short window during which your normal Ethereum-style transactions, such as a contract deploy, are admitted.

Parameters:

- `pnpm window`: runs the window helper.
- `open`: the action: open a window. By default it lasts 600 blocks and allows 5 transactions. You can change this with `QORE_WINDOW_BLOCKS` and `QORE_WINDOW_TXS` in `.env`.

**What you should see:** `opened: <HASH>`, then a line like `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)`. That last number is the spending limit of the window in uqor (3.75 QOR). Write down the `opened:` hash: you verify it in step 8.

3. Wait about 10 seconds. Opening the window advanced the account counter (the nonce), and Hardhat waits for the chain to settle.

### Step 6: Build the contract {#step-6}

**How long this takes:** a few seconds.

```bash
pnpm build
```

What it does: turns the Solidity contract into the form the chain runs.

Parameters:

- `pnpm`: the package tool.
- `build`: the script to run (it runs `hardhat build`).

**What you should see:** `Compiled 1 Solidity file` or `No contracts to compile`. Both are fine: the test in step 2 already compiled it.

### Step 7: Deploy the contract to the testnet {#step-7}

**How long this takes:** about 30 seconds.

```bash
pnpm deploy:testnet
```

What it does: sends the contract to the QoreChain testnet with Hardhat Ignition, using the window you opened. This is a normal EVM transaction.

Parameters:

- `pnpm`: the package tool.
- `deploy:testnet`: the script to run. It runs `hardhat ignition deploy ignition/modules/Counter.ts --network qorechainTestnet`: deploy the recipe `Counter.ts` to the network named `qorechainTestnet` (chain ID 9800).

When Hardhat asks `Confirm deploy to network qorechainTestnet (9800)?`, type `y` and press Enter.

**What you should see:** `[ CounterModule ] successfully deployed` and a line `CounterModule#Counter - 0x...`. The `0x...` is the address of your contract. If you see `HHE10402`, run the same command again (see Troubleshooting).

### Step 8: Verify the hybrid signature on chain {#step-6-verify}

**How long this takes:** 3 minutes.

The `opened:` transaction from step 5 was signed with both keys. Anyone can check it from the public REST endpoint.

1. Replace `<HASH>` with that hash (without the `<` and `>`) and run:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

What it does: asks the public testnet server for the full record of your transaction.

Parameters:

- `curl`: a program that fetches a web address.
- `-s`: silent, so it hides the progress bar and shows only the answer.
- `https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>`: the testnet REST address, followed by your transaction hash.

**What you should see:** a long block of text. Look for three things:

1. `"code": 0` inside `tx_response`. Code 0 means success.
2. The `PQCHybridSignature` extension, which holds the ML-DSA-87 signature: **4,627 bytes**, next to the 64-byte secp256k1 signature.
3. In `events`, an event of type `pqc_hybrid_verify` with the attribute `status` set to `verified`.

2. To print only that event (needs `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

What it does: fetches the same record and passes it through `jq`, which keeps only the verification event.

Parameters:

- `|`: send the output of the first command into the second one.
- `jq`: the filter program.
- `'.tx_response.events[] | select(.type=="pqc_hybrid_verify")'`: go through the list of events and keep the ones whose type is `pqc_hybrid_verify`.

**What you should see:** a small block of text with `"status"` set to `"verified"`.

3. Look at it in the explorer:
   1. Open [explore.qore.network](https://explore.qore.network).
   2. Switch the network selector to **Testnet**.
   3. Search for the hash.

**What you should see:** the transaction page shows the signature security as quantum-safe, verified on chain, with the ML-DSA-87 algorithm (FIPS 204).

That is the proof: the validators checked both signatures. This is your Quantum Pass transaction.

## What you should see, at a glance {#what-you-should-see}

| Where | What |
| --- | --- |
| After step 2 | `Done! Created qday-demo` and `2 passing` |
| After step 3 | A `qor1...` address and a `0x...` address from `pnpm window status`, with the key not registered |
| After step 4 | **Tokens Sent!** on the faucet |
| After step 5 | `registered: <HASH>`, then `opened: <HASH>` and the window line |
| After step 7 | `CounterModule#Counter - 0x...` |
| After step 8 | `code` 0, a 4,627-byte ML-DSA-87 signature and `pqc_hybrid_verify` with `status` `verified`, in the REST output and in the explorer on Testnet |

## Packages used {#published}

Declared in the scaffolded `package.json`:

| Package | Registry | Version |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

The scaffolder also installs the Hardhat toolbox, Ignition and keystore plugins listed in the generated `package.json`.

## Troubleshooting {#troubleshooting}

| What you see | Why | What to do |
| --- | --- | --- |
| `HHE10402` or "wait for confirmations" right after the window opened | The window open advanced the account nonce | Run `pnpm deploy:testnet` again |
| "EVM authorisation window exhausted" or "no window" | The window ran out of transactions or blocks, or it is scoped to another contract (a window scoped to another contract blocks a deploy) | Run `pnpm window open` to open a new window, wait about 10 seconds, then deploy again |
| "account has no PQC key and classical fallback is disabled" | The account has not registered an ML-DSA-87 key | Run `pnpm window register` first, then `pnpm window open` |
| "does not exist on chain yet" | The account has no QOR yet | Get QOR from the faucet (step 4) |
| "Rate Limit Reached" on the faucet, or no tokens after 30 seconds | One claim per 24 hours per account and per address, and requests are served one at a time | Wait a few seconds and retry, or wait for the 24 hours to pass. Only one request per 24 hours |
| `pnpm: command not found` | pnpm is not installed. Node.js installed with Homebrew does not include it | Run `npm install -g pnpm`, then open a new terminal |
| `pnpm window` stops with a message about a missing recovery code | `.env` has `PRIVATE_KEY` without `QORE_PQC_RECOVERY_CODE` | Run `pnpm window recovery-code` and paste the code into `.env` (step 3), or use `QORE_MNEMONIC` |
| "QORE_PQC_RECOVERY_CODE is not a valid QRC1 recovery code" | A typo, a space or a quote when pasting | Paste the code again with no spaces or quotes |
| "registered, but NOT this key" in `pnpm window status` | A different recovery code was used earlier for this account | Put the original recovery code back in `.env`, or start again with a new account |
| CORS errors in a browser app | A browser blocks calls to a chain address that does not allow your page | Use the template's `/lcd` proxy path for REST calls from the browser instead of calling the chain address directly |
| Hardhat refuses to start | Node.js is older than 22 | Install Node.js 22 or later (see "Before you start") and run `pnpm install` again |
| `curl` shows `tx not found` right after the step | The block is not final yet | Wait 10 seconds and run the command again |
| `curl` does not work in Windows PowerShell | `curl` is a different command there | Type `curl.exe` instead of `curl` |

## The example apps {#example-apps}

The same flow, from several languages and front ends. Each one signs hybrid. All of them are in the public repository [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), folder `workshop-1`. To get them you need Git (check with `git --version`; install from [git-scm.com](https://git-scm.com/downloads)), then run:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

What it does: downloads a copy of all the example apps and moves into the `workshop-1` folder.

Parameters:

- `git clone <address>`: copy a project from the internet to your computer.
- `cd build-before-qday/workshop-1`: enter the folder that holds the six apps.

Each app page is a full start-to-finish guide of its own, with what to install and what to expect.

| App | Language | Page |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

The kits behind these apps are listed on [Kits](/build-before-qday/workshop-1/kits). To use the QoreX wallet with a browser dApp, see [QoreX](/qorex/overview).
