---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

The Q-Day Counter is the smallest useful QoreChain EVM project: a Solidity contract that stores one number, a Hardhat project that deploys it to the testnet `qorechain-diana`, and a short script that reads and increments it. It is the `hardhat` template of `create-qorechain-dapp`, with a small `interact` script added. If you attended the first Build Before Q-Day workshop, this is the project that was scaffolded and deployed live.

## Innovations {#innovations}

- **Hybrid signing is part of the deploy path.** Before any EVM transaction, including a contract deploy, the account needs a registered ML-DSA-87 key and a live EVM authorisation window. The window is opened by one native-lane message signed with both secp256k1 and ML-DSA-87 (hybrid), and the chain verifies both signatures.
- **One hybrid-signed transaction, verified on chain.** The `pnpm window open` step sends that transaction. You can look it up on the explorer and see the chain's own verdict.
- **Your normal EVM tools keep working.** Hardhat, Ignition and viem send ordinary Ethereum transactions. The post-quantum protection sits in the window, so a stolen secp256k1 key alone cannot spend from the account.

## Why it matters {#why}

A quantum computer large enough to break secp256k1 would let an attacker forge classical signatures. QoreChain requires a second, post-quantum signature (ML-DSA-87, FIPS 204) on the account. The Counter shows the whole developer loop with that rule switched on: register the key, open a window, deploy, call, read.

## Packages and versions {#packages}

| Package | Version | Used for |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Hybrid signing, PQC key registration, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | EVM window helpers (`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | Broadcasting the native-lane transaction |
| `hardhat` | ^3.21.1 | Compile, test, Ignition deploy |
| `viem` | ^2.47.6 | Reading and writing the contract |

Scaffold the same project with `npx create-qorechain-dapp my-app -t hardhat --network testnet` (`create-qorechain-dapp` 0.13.1, SDK 0.13.0). See [Scaffolders and CLI](/developer-tools/scaffolders-and-cli) and [Install the SDK](/sdk/install).

## Step by step {#steps}

### 1. Get a testnet account and testnet QOR {#step-account}

Use a throwaway account made for testing, never one that holds real funds. Put it in a `.env` file in the project (and never commit that file):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=...
QORE_NETWORK=testnet
```

The project ships a `.env.example` with these names; copy it to `.env`. `PRIVATE_KEY` is also read by Hardhat as a configuration variable.

With `PRIVATE_KEY`, the account's ML-DSA-87 key comes from a separate recovery code. Create one with `pnpm window recovery-code`, keep it apart from the private key, and always reuse the same code: a new code gives the account a different ML-DSA-87 key. Alternatively set `QORE_MNEMONIC` and both keys derive from that one phrase.

Fund the account from the [faucet](/dashboard/faucet) (sign in, 100 QOR once every 24 hours). Testnet QOR has no value.

### 2. Test, then build {#step-build}

```sh
pnpm install
pnpm test      # tests on a local simulated chain
pnpm build
```

### 3. Register the key and open the window {#step-window}

```sh
pnpm window status      # account, ML-DSA-87 key, EVM window
pnpm window register    # once: register the ML-DSA-87 key
pnpm window open        # hybrid-signed: opens a window (600 blocks, 5 transactions)
```

Registration is the one message the chain accepts signed classically, because there is no key on chain yet to check against. Opening the window is signed hybrid. It advances the account's nonce, so wait about 10 seconds before the next step.

### 4. Deploy {#step-deploy}

```sh
pnpm deploy:testnet     # Hardhat Ignition, answer y
```

### 5. Read and increment {#step-interact}

```sh
pnpm interact           # read count, increment(), read again, explorer link
pnpm interact --read    # read only
```

## The code {#code}

The contract:

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

`acc` is the unified account derived from your key material, and `net` is the network record for `QORE_NETWORK` (default `testnet`, chain id `qorechain-diana`). The fee used by the script is 100000 `uqor` with a gas limit of 800000, because hybrid transactions are large. The window size can be changed with `QORE_WINDOW_BLOCKS` (default 600), `QORE_WINDOW_TXS` (default 5) and `QORE_WINDOW_MAX_UQOR`.

## What you see when it works {#result}

- `pnpm window status` prints the account (`0x...` with its `qor1...` form), `PQC key: registered`, and `window: live` with the blocks, transactions and value left.
- `pnpm deploy:testnet` prints the deployed `Counter` address (`0x...`).
- `pnpm interact` prints the Counter address, `count`, the `increment` transaction hash, `status: success` with the block number, the new `count`, and a link to the transaction on the [explorer](https://explore.qore.network) (switch the explorer to Testnet).
- The `window open` hash, searched on the explorer, shows a transaction with a post-quantum signature that the chain verified. The [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) shows the same proof byte by byte.

## Networks {#networks}

| Item | Value |
| --- | --- |
| Network | testnet `qorechain-diana` |
| EVM chain id | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

## Get the code {#get-the-code}

The code is in the public repository: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter (the link works once the repository is published; the code is also shown inline on this page).
