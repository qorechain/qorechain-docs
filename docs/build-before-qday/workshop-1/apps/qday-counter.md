---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

The Q-Day Counter is the smallest useful QoreChain EVM project: a Solidity contract that stores one number, a Hardhat project that deploys it to the testnet `qorechain-diana`, and a short script that reads and increments it. It is the `hardhat` template of `create-qorechain-dapp`, with a small `interact` script added.

## What it shows {#shows}

- **Hybrid signing is part of the deploy path.** Before any EVM transaction, including a contract deploy, the account needs a registered ML-DSA-87 key and a live EVM authorisation window. The window is opened by one native-lane message signed with both secp256k1 and ML-DSA-87 (hybrid), and the chain verifies both signatures.
- **One hybrid-signed transaction, verified on chain.** The `pnpm window open` step sends that transaction. You can look it up on the explorer and see the chain's own verdict.
- **Your normal EVM tools keep working.** Hardhat, Ignition and viem send ordinary Ethereum transactions. The post-quantum protection sits in the window, so a stolen secp256k1 key alone cannot spend from the account.

A quantum computer large enough to break secp256k1 would let an attacker forge classical signatures. QoreChain requires a second, post-quantum signature (ML-DSA-87, FIPS 204) on the account. The Counter shows the whole developer loop with that rule switched on: register the key, open a window, deploy, call, read.

## Before you start {#prerequisites}

You need a terminal on macOS, Linux, or Windows with WSL or Git Bash, and these tools:

| Tool | Needed version | Check with |
| --- | --- | --- |
| Git | any recent version | `git --version` |
| Node.js | 20.12 or newer (22 LTS recommended) | `node --version` |
| pnpm | 9 or newer | `pnpm --version` |

Install Node.js from https://nodejs.org. If `pnpm --version` fails, install pnpm with `npm install -g pnpm` (or `corepack enable`) and check again.

You also need a free account on the [QoreChain dashboard](https://dashboard.qorechain.io) to use the faucet. You never use a real wallet in this guide: everything below uses a throwaway testnet account, and testnet QOR has no value.

## Step by step {#steps}

### 1. Get the code {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

### 2. Install the dependencies {#step-install}

```sh
pnpm install
```

### 3. Run the tests and the build {#step-test}

The tests run on a local simulated chain. They need no key and no network account.

```sh
pnpm test
pnpm build
```

You should see `2 passing` for the `Counter` tests.

### 4. Create the testnet key file {#step-account}

Create the settings file from the template:

```sh
cp .env.example .env
```

The `.env` file holds a throwaway key, so never commit it and never reuse the key anywhere real. Open `.env` in any editor. You will fill in two values.

**a. A throwaway private key.** Generate a random 32-byte key:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

Copy the printed `0x...` value into `.env` as `PRIVATE_KEY=0x...`, replacing the all-zero placeholder.

**b. A post-quantum recovery code.** The account's ML-DSA-87 key is derived from a separate recovery code. Create one:

```sh
pnpm window recovery-code
```

Copy the printed `QRC1-...` line into `.env` as `QORE_PQC_RECOVERY_CODE=QRC1-...`. Keep this code with the private key and always reuse the same one: a new code gives the account a different ML-DSA-87 key.

Leave `QORE_MNEMONIC` empty, and keep `QORE_NETWORK=testnet`. Your `.env` now looks like this (placeholders shown):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 5. Show your account address {#step-address}

```sh
pnpm window status
```

The first line prints your account as `0x...` and its `qor1...` form. At this point it also says the key is not registered and no window exists. Copy the `qor1...` address.

### 6. Get testnet QOR from the faucet {#step-faucet}

1. Open https://dashboard.qorechain.io/faucet and sign in.
2. Paste your `qor1...` address and request the QOR (100 QOR once every 24 hours).
3. Wait a few seconds, then run `pnpm window status` again. The account now exists on chain.

### 7. Register the key and open the window {#step-window}

```sh
pnpm window register    # once: registers your ML-DSA-87 key
pnpm window open        # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                # opening the window advances the account's nonce
pnpm window status      # PQC key: registered, window: live
```

Registration is the one message the chain accepts signed classically, because there is no key on chain yet to check against. Opening the window is signed hybrid. Keep the transaction hash that `window open` prints; you will look it up in the last step.

### 8. Deploy the contract {#step-deploy}

```sh
pnpm deploy:testnet     # Hardhat Ignition, answer y when asked to confirm
```

The command prints the deployed `Counter` address (`0x...`).

### 9. Read and increment {#step-interact}

```sh
pnpm interact           # read count, increment(), read again, explorer link
pnpm interact --read    # read only
```

### 10. Look it up on the explorer {#step-explorer}

1. Open https://explore.qore.network and switch the network selector to **Testnet**.
2. Search for the hash printed by `pnpm window open`. The transaction shows a post-quantum signature that the chain verified.
3. Search for the `increment` transaction hash printed by `pnpm interact`, or the `Counter` address from step 8, to see the contract call.

The [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) shows the same kind of proof byte by byte.

## What you should see {#result}

- `pnpm test` prints `2 passing`.
- `pnpm window status` prints the account (`0x...` with its `qor1...` form), `PQC key: registered`, and `window: live` with the blocks, transactions and value left.
- `pnpm deploy:testnet` prints the deployed `Counter` address (`0x...`).
- `pnpm interact` prints the Counter address, `count`, the `increment` transaction hash, `status: success` with the block number, the new `count`, and a link to the transaction on the explorer.
- On the explorer (Testnet), the `window open` transaction is marked as verified with both signatures.

If a step fails, run `pnpm window status` first: it tells you whether the key or the window is missing. A refused transaction after the window has been used up means you open a new one with `pnpm window open`.

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

`acc` is the unified account derived from your key material, and `net` is the network record for `QORE_NETWORK` (default `testnet`, chain id `qorechain-diana`). The fee used by the script is 100000 `uqor` with a gas limit of 800000, because hybrid transactions are large. The window size can be changed in `.env` with `QORE_WINDOW_BLOCKS` (default 600), `QORE_WINDOW_TXS` (default 5) and `QORE_WINDOW_MAX_UQOR`.

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

You can scaffold the same project yourself with `npx create-qorechain-dapp my-app -t hardhat --network testnet`. See [Scaffolders and CLI](/developer-tools/scaffolders-and-cli) and [Install the SDK](/sdk/install).

## Network details {#networks}

| Item | Value |
| --- | --- |
| Network | testnet `qorechain-diana` |
| EVM chain id | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

Source: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
