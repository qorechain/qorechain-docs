---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

The Q-Day Counter is the smallest useful QoreChain EVM project. It is a Solidity contract that stores one number, a Hardhat project that puts it on the testnet `qorechain-diana`, and a short script that reads the number and adds one to it.

This guide is written for beginners. You do not need to know Solidity or blockchain tools. Every command is explained, and every step ends with what you should see.

**How long this takes:** about 25 minutes the first time, most of it installing tools and waiting for the faucet.

## What it shows {#shows}

- **Hybrid signing is part of the deploy path.** Before any EVM transaction, including a contract deploy, the account needs a registered post-quantum key (ML-DSA-87) and a live EVM authorisation window. The window is opened by one transaction signed twice, with the classic key (secp256k1) and with the post-quantum key. That is a hybrid signature. The chain checks both.
- **One hybrid-signed transaction you can verify.** The step `pnpm window open` sends that transaction. You can look it up on the explorer and see the chain's own verdict.
- **Your normal EVM tools keep working.** Hardhat and viem send ordinary Ethereum transactions. The post-quantum protection sits in the window, so a stolen secp256k1 key alone cannot spend from the account.

A quantum computer large enough to break secp256k1 could forge classic signatures. QoreChain requires a second signature (ML-DSA-87, standard FIPS 204) that such a computer cannot forge. The Counter shows the whole developer loop with that rule switched on: register the key, open a window, deploy, call, read.

## Before you start {#prerequisites}

This guide uses a throwaway testnet account. Never use a real wallet or real funds. Testnet QOR has no value.

You need a terminal. On macOS open **Terminal**. On Windows open **PowerShell** (or **Git Bash**, which comes with Git). On Linux open any terminal. Then install these three tools. If the check command already prints a good version, skip the install.

### Node.js 22 or later

Node.js runs JavaScript on your computer. Hardhat 3 needs Node.js 22 or later.

| System | Install | Check |
| --- | --- | --- |
| macOS | `brew install node` (needs [Homebrew](https://brew.sh)), or download from https://nodejs.org | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`, or download from https://nodejs.org | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, open a new terminal, then `nvm install 22` | `node --version` |

What you should see: a number that starts with `v22` or higher, such as `v22.12.0`. On Windows, close and reopen PowerShell after installing.

### pnpm

pnpm downloads the libraries a project needs. It comes with no Node.js install, so you add it yourself, on every system.

```sh
npm install -g pnpm
```

| Part | Meaning |
| --- | --- |
| `npm` | The tool that comes with Node.js. It installs other tools. |
| `install` | Download and install. |
| `-g` | Global: install for the whole computer, not just one folder. |
| `pnpm` | The tool to install. |

Check it with `pnpm --version`. You should see a number such as `9.12.0` (9 or higher). If you ever see `pnpm: command not found`, you skipped this step: run the install command above, then open a new terminal.

If Linux or macOS says `EACCES: permission denied`, run `sudo npm install -g pnpm` instead.

### Git

Git downloads the project from GitHub.

| System | Install | Check |
| --- | --- | --- |
| macOS | `xcode-select --install` or `brew install git` | `git --version` |
| Windows | `winget install Git.Git`, or download from https://git-scm.com | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) or `sudo dnf install git` (Fedora) | `git --version` |

What you should see: `git version 2.` and a number.

## A testnet wallet {#wallet}

You need a testnet account with a little QOR in it. This guide creates one for you in the next steps (a key file). You do not need QoreX for the Counter. If you want to see the same account in a wallet later, use [QoreX](/qorex/overview) on testnet:

- **QoreX app:** Settings, then **Use testnet (developers)**.
- **QoreX browser extension:** unlock it, tap the version number at the bottom 7 times, then choose **Switch to testnet (diana)**.
- For the EVM lane, choose **Add an Ethereum account (coin 60)**.

The faucet gives free testnet QOR: https://dashboard.qorechain.io/faucet. You sign in, paste an address, and request. You get 100 QOR per 24 hours per account.

**About amounts.** QOR is the coin. `uqor` is its smallest piece: 1 QOR = 1,000,000 uqor. Fees on the chain are shown in `uqor`. The first transaction of a new account registers its post-quantum key, which costs a one-time fee of about 0.09 QOR.

## Step by step {#steps}

### 1. Get the code {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

**What it does**

- `git clone <address>` downloads a copy of the project from GitHub into a new folder named `build-before-qday`.
- `cd <folder>` moves your terminal into the Counter project folder. Every later command runs from here.

**What you should see:** `Cloning into 'build-before-qday'...` and then your prompt in the new folder. **How long:** a few seconds.

Optional: if you would rather build the project from nothing, as in the live workshop, see [Build the same project from scratch](#scaffold) at the end of the steps.

### 2. Install the libraries {#step-install}

```sh
pnpm install
```

**What it does**

- `pnpm install` reads the list of libraries in `package.json` and downloads them into a `node_modules` folder (Hardhat, the QoreChain SDK, and more).

**What you should see:** a list of packages with `+` signs and `Done in` a few seconds. **How long:** under a minute.

### 3. Run the tests and the build {#step-test}

```sh
pnpm test
```

**What it does**

- `pnpm test` runs the project's checks on a fake chain inside your computer. It needs no key, no network and no QOR. The first run also downloads the Solidity compiler, so it needs internet.

**What you should see:** `Counter`, two lines with a tick (`starts at the constructor value`, `increments and emits CountChanged`), and `2 passing`.

```sh
pnpm build
```

**What it does**

- `pnpm build` turns the Solidity contract into machine code (compiles it). After `pnpm test` it prints `No contracts to compile`, which is fine: the test already compiled it.

### 4. Create the settings file {#step-account}

The project reads your secrets from a file named `.env`. Create it from the template.

macOS, Linux, Git Bash:

```sh
cp .env.example .env
```

Windows PowerShell:

```sh
copy .env.example .env
```

**What it does**

- `cp` (or `copy`) copies the template file `.env.example` to a new file `.env`.

The `.env` file is your **key file**. It lives only in this project folder. It holds a throwaway key. **Never share it, never commit it to Git, and never reuse these keys for a real wallet.** The project already ignores `.env` in Git. Open it in any text editor (`open -e .env` on macOS, `notepad .env` on Windows, `nano .env` on Linux). You will fill in two values.

**a. A throwaway private key.** Generate a random one:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**What it does**

- `node -e "..."` runs one line of JavaScript.
- The line makes 32 random bytes and prints them in hexadecimal with `0x` in front. That is a private key.

**What you should see:** one line, `0x` followed by 64 letters and digits. Copy it into `.env` as `PRIVATE_KEY=0x...`, replacing the all-zero placeholder.

**b. A post-quantum recovery code.** The account's ML-DSA-87 key is created from a second secret, the recovery code.

```sh
pnpm window recovery-code
```

**What it does**

- `pnpm window` runs the helper script `scripts/window.ts`. The word after it is the command.
- `recovery-code` prints a new random recovery code.

**What you should see:** one line that starts with `QRC1-`, then a short reminder. Copy the `QRC1-...` line into `.env` as `QORE_PQC_RECOVERY_CODE=QRC1-...`. Keep the same code for this account: a new code gives the account a different post-quantum key.

Leave `QORE_MNEMONIC` empty. (A mnemonic is a 12 or 24 word phrase that can replace the two values above. Use either one, not both.) Keep `QORE_NETWORK=testnet`, which tells the helper to talk to the test network. Your `.env` looks like this, with placeholders:

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

Save the file.

### 5. Show your account address {#step-address}

```sh
pnpm window status
```

**What it does**

- `status` shows your account, whether its post-quantum key is registered, and whether you have an EVM window.

**What you should see:** three lines. The first is `account:  0x...  (qor1...)`. Your account has two addresses: `0x...` for the EVM and `qor1...` for the native lane. They belong to the same account. The other two lines say `PQC key:  not registered` and `window:   none`. That is normal: the account is new. Copy the `qor1...` address from the first line.

### 6. Get testnet QOR from the faucet {#step-faucet}

1. Open https://dashboard.qorechain.io/faucet and sign in.
2. Make sure the page is set to **Testnet**.
3. Paste your `qor1...` address and request the QOR. You get 100 QOR once every 24 hours per account.
4. Wait about 10 seconds, then run `pnpm window status` again.

**What you should see:** the same three lines as before: the key is still `not registered` and there is no window. The account now holds QOR. If you want proof, open https://explore.qore.network (Testnet) and search for your `qor1...` address.

### 7. Register the key and open the window {#step-window}

```sh
pnpm window register
```

**What it does**

- `register` sends the account's ML-DSA-87 public key to the chain. You do this once per account. It is the one message the chain accepts without a post-quantum signature, because no key is on the chain yet to check against. It costs about 0.09 QOR.

**What you should see:** `registered: ` followed by a transaction hash (64 characters).

```sh
pnpm window open
```

**What it does**

- `open` sends one transaction, signed with both keys (hybrid), that opens an EVM authorisation window. While the window is live, your ordinary EVM transactions are allowed. By default it lasts 600 blocks and allows 5 transactions. You can change that with `QORE_WINDOW_BLOCKS` and `QORE_WINDOW_TXS` in `.env`.

**What you should see:** `opened: ` followed by a transaction hash, then `window: 600 blocks, 5 txs, ... uqor (value plus fees)`. **Copy this hash.** You will check it in step 10.

Now wait about 10 seconds. Opening the window changes the account's transaction counter, and the next command must see the new value.

```sh
sleep 10
pnpm window status
```

**What it does**

- `sleep 10` waits 10 seconds (it works in PowerShell and Git Bash too).
- `status` shows the result.

**What you should see:** `PQC key:  registered` and `window:   live; ... blocks, ... txs, ... uqor left`.

### 8. Deploy the contract {#step-deploy}

```sh
pnpm deploy:testnet
```

**What it does**

- It runs Hardhat Ignition, the tool that deploys contracts, with the module `Counter` on the network `qorechainTestnet` (chain id 9800, the QoreChain testnet).
- It asks you to confirm. Type `y` and press Enter.

**What you should see:** a question a confirmation question about deploying to `qorechainTestnet` (9800), then after your `y` a line that ends with `CounterModule#Counter` and your contract address `0x...`. That is the address of your contract. **How long:** about 30 seconds.

### 9. Read and increment {#step-interact}

```sh
pnpm interact
```

**What it does**

- Reads the stored number, calls `increment()` (adds one), then reads it again. The call uses one of the 5 transactions of your window.

**What you should see:** `Counter 0x... on qorechain-diana EVM (9800)`, `count: 0`, `increment tx: 0x...`, `status: success in block ...`, `count: 1`, and an explorer link.

```sh
pnpm interact --read
```

**What it does**

- `--read` means read only: it shows the number and sends nothing.

**What you should see:** the Counter address and `count: 1`.

### 10. Verify the hybrid transaction {#step-explorer}

The transaction from `pnpm window open` is your proof that the chain checked a post-quantum signature. Check it in two ways.

**a. With the plain web request.** Replace `<HASH>` with the hash from step 7. Remove the `<` and `>`.

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**What it does**

- `curl <address>` asks a public QoreChain server for the record of that transaction and prints it. On Windows PowerShell, type `curl.exe` instead of `curl`.
- `api-testnet.qore.host` is the public testnet server. `<HASH>` is the transaction you want.

**What you should see in the long answer:**

- `"code": 0`, which means the transaction succeeded.
- An extension of type `PQCHybridSignature` that holds the ML-DSA-87 signature, 4,627 bytes long.
- An event `pqc_hybrid_verify` with the attribute `status` set to `verified`.

**b. With the explorer.**

1. Open https://explore.qore.network and switch the network selector to **Testnet**.
2. Search for the hash from `pnpm window open`. The page shows a post-quantum signature that the chain verified.
3. Search for the `increment tx` hash from step 9, or for your Counter address, to see the contract call.

The [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) shows the same kind of proof byte by byte.

## Build the same project from scratch {#scaffold}

The live workshop starts from an empty folder. This command creates the same Hardhat project (without the `interact` script, which only the downloaded copy has). Run it in a folder where you keep projects, instead of step 1.

```sh
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
cd qday-demo
```

| Part | Meaning |
| --- | --- |
| `npx` | Runs a tool straight from the internet, without installing it. |
| `create-qorechain-dapp@latest` | The QoreChain project creator, newest version. |
| `qday-demo` | The name of the new folder. |
| `-t hardhat` | Which project template to use: a Hardhat 3 project with a contract, tests and the window helper. |
| `--network testnet` | Which QoreChain network the project talks to: the test network, not the real one. |
| `--package-manager pnpm` | Which tool installs the libraries. |

**What you should see:** a list of installed packages, then `Done! Created qday-demo`. The libraries are already installed, and a `.env` file already exists, so you can skip step 2 and the copy in step 4. Continue with `pnpm test` (step 3), then 4a and 4b (fill the `.env`), and steps 5 to 8. **How long:** about 30 seconds.

## What you should see at the end {#result}

- `pnpm test` prints `2 passing`.
- `pnpm window status` prints `PQC key:  registered` and `window:   live` with the blocks, transactions and value left.
- `pnpm deploy:testnet` prints the deployed `Counter` address (`0x...`).
- `pnpm interact` prints `count` going from 0 to 1, `status: success`, and an explorer link.
- The `curl` check shows `"code": 0`, the `PQCHybridSignature` extension and the event `pqc_hybrid_verify` with `status` `verified`. The explorer (Testnet) marks the same transaction as verified.

## Troubleshooting {#troubleshooting}

| What you see | Why | What to do |
| --- | --- | --- |
| `pnpm: command not found` | pnpm is not installed. Node.js does not include it. | Run `npm install -g pnpm`, then open a new terminal. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js is too old. | Install Node.js 22 or later and check `node --version`. |
| `node: .env: not found` | There is no `.env` file in this folder. | Do step 4, and run the command from the project folder. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY as 0x followed by 64 hex characters, in .env` | The `.env` file is missing, or `PRIVATE_KEY` is still the placeholder or has a typo. | Do step 4 again. Save the file. Run the command from the project folder. |
| `Set QORE_PQC_RECOVERY_CODE in .env` or `not a valid QRC1 recovery code` | The recovery code is empty or has a typo. | Run `pnpm window recovery-code` and paste the whole `QRC1-...` line. |
| `... does not exist on chain yet: send it some QOR first` (on `register` or `open`) | The account has no QOR yet. | Request QOR from the faucet (step 6) and wait 10 seconds. |
| Faucet says you reached the limit | One request per 24 hours per account. | Wait, then try again. Or use a second throwaway account. |
| `account has no PQC key and classical fallback is disabled` | You sent a transaction before registering the key. | Run `pnpm window register`, then `pnpm window open`. |
| `EVM authorisation window exhausted` (or the hint `open an EVM window first`) | The window ran out of blocks or transactions, or it was never opened. | Run `pnpm window open`, wait 10 seconds, try again. |
| `HHE10402` after the window opens | The deploy ran before the account's transaction counter updated. | Wait 10 seconds and run `pnpm deploy:testnet` again. |
| `Deploy first (pnpm deploy:testnet) or set COUNTER_ADDRESS` | `pnpm interact` cannot find the contract. | Finish step 8 in this folder. |
| `PQC key: registered, but NOT this key` | The recovery code in `.env` differs from the one used at registration. | Put the original recovery code back. A different code makes a different key. |
| CORS errors in a browser app | The public REST server sends no CORS headers, so a browser blocks it. | Use the template's `/lcd` proxy, as the [Guestbook web page](/build-before-qday/workshop-1/apps/qday-guestbook) does. |

## The code {#code}

The contract (`contracts/Counter.sol`):

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

The hybrid-signed part of `scripts/window.ts` (the window message and the signer):

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc` is the account made from your key material, and `net` is the network record for `QORE_NETWORK` (default `testnet`, chain id `qorechain-diana`). The fee used by the script is 100000 `uqor` (0.1 QOR) with a gas limit of 800000, because hybrid transactions are large.

## Packages used {#packages}

| Package | Version | Used for |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Hybrid signing, PQC key registration, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | EVM window helpers (`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | Broadcasting the native-lane transaction |
| `hardhat` | ^3.21.1 | Compile, test, Ignition deploy |
| `viem` | ^2.47.6 | Reading and writing the contract |
| `tsx` | ^4.19.0 | Running the TypeScript scripts |
| `typescript` | ^5.6.3 | Type checking |

See [Scaffolders and CLI](/developer-tools/scaffolders-and-cli) and [Install the SDK](/sdk/install).

## Network details {#networks}

| Item | Value |
| --- | --- |
| Network | testnet `qorechain-diana` |
| EVM chain id | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

Source: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
