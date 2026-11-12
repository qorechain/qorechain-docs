---
slug: /build-before-qday/workshop-1
title: "Workshop 1: Your first hybrid-signed transaction"
sidebar_label: "Workshop 1"
sidebar_position: 2
date: 2026-11-12
---

# Workshop 1: Your first hybrid-signed transaction

This guide takes you from a computer with nothing installed to one transaction signed with two keys at once and verified by the QoreChain testnet. Everything runs in your own environment, with a throwaway testnet account.

## What we build {#what-we-built}

A complete Solidity project scaffolded with one command, tested, deployed to the QoreChain testnet, and then one transaction signed with **two keys at once** and checked by the chain.

What it shows:

- **Hybrid signing.** The transaction carries a classical secp256k1 signature and a post-quantum ML-DSA-87 signature (NIST FIPS 204).
- **One hybrid-signed transaction verified on chain.** The validators verify both signatures. You read the proof from the public REST endpoint (the `PQCHybridSignature` extension and the `pqc_hybrid_verify` event) and in the explorer.
- **The EVM authorisation window.** An Ethereum transaction cannot carry a post-quantum signature, so on QoreChain you register your ML-DSA-87 key once and open a short window, with a hybrid-signed message, during which your normal EVM transactions are admitted. See [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes) for the idea in depth.

This is exactly what the Quantum Pass level asks for.

## Prerequisites {#prerequisites}

You need a computer with macOS, Linux or Windows (with WSL), a terminal and a web browser. Install these first and check each version:

| Tool | Version | Check | Install |
| --- | --- | --- | --- |
| Node.js | 22 or later (Hardhat 3 requires it) | `node -v` | [nodejs.org](https://nodejs.org) |
| pnpm | 9 or later | `pnpm -v` | `npm install -g pnpm` (or `corepack enable`) |
| curl | any | `curl --version` | included on macOS and Linux |
| jq (optional) | any | `jq --version` | [jqlang.org](https://jqlang.org), used only to filter output in step 6 |

You also need an account on the QoreChain dashboard to use the faucet (step 4).

The network and the public endpoints used in this guide:

| Service | URL |
| --- | --- |
| Testnet | `qorechain-diana`, EVM chain ID 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (switch to Testnet) |
| Faucet | `https://dashboard.qorechain.io/faucet` (sign-in required) |

:::caution Throwaway testnet keys only
Use keys made for this exercise, holding test QOR only. Never put a key or recovery code of an account that holds real funds into `.env`, and never commit `.env` to git.
:::

## Steps {#steps}

### Step 1: Check your tools {#step-1}

1. Open a terminal.
2. Run the checks from the table above:

```bash
node -v
pnpm -v
```

`node -v` must print `v22` or higher. If it does not, install a newer Node.js before you continue.

### Step 2: Scaffold the project and run the tests {#step-2}

1. Create the project in a new folder. The `npx` command downloads the scaffolder, so it needs internet access:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

2. Go into the folder and run the tests. They run on a local simulated chain and send nothing:

```bash
cd qday-demo
pnpm test
```

You should see `Done! Created qday-demo`, and then `2 passing` from the tests.

3. Look at what you got: `contracts/Counter.sol`, `ignition/modules/Counter.ts`, `scripts/window.ts` (the helper for the authorisation window) and `hardhat.config.ts` with the `qorechainTestnet` network (chain ID 9800). More on the templates: [Scaffolders and CLI](/developer-tools/scaffolders-and-cli) and [Chain developer kit](/developer-tools/chain-dev-sdk).

### Step 3: Create a throwaway testnet account {#step-3}

The account needs two secrets: an Ethereum-style private key, and a **recovery code** (starts with `QRC1`) from which the post-quantum ML-DSA-87 key is derived. The command below generates both with libraries the project already installed and writes them straight into a new `.env` file, so nothing is printed to your screen or pasted anywhere. Run it from inside the `qday-demo` folder:

```bash
node --input-type=module -e '
import { generatePrivateKey } from "viem/accounts";
import { generatePqcRecoveryCode } from "@qorechain/sdk";
import { writeFileSync } from "node:fs";
writeFileSync(".env", `PRIVATE_KEY=${generatePrivateKey()}\nQORE_PQC_RECOVERY_CODE=${generatePqcRecoveryCode()}\nQORE_NETWORK=testnet\n`);
console.log(".env written");
'
```

It prints `.env written`. Notes:

- The command replaces the placeholder `.env` the scaffolder made. Run it once. A new run makes a different account and a different post-quantum key.
- Keep `.env` as it is: the same private key and the same recovery code give you the same account every time. If you lose the file, start again with a new account.
- Prefer a mnemonic? Put `QORE_MNEMONIC="your twelve words"` in `.env` instead of the two lines above. With a mnemonic, both keys come from the same phrase and no recovery code is needed. Use a phrase made only for this exercise.

Now ask the project for the address of your new account:

```bash
pnpm window status
```

You should see three lines:

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

Copy the `qor1...` address. That is the one you give to the faucet.

### Step 4: Get testnet QOR from the faucet {#step-4}

1. Open the [faucet](https://dashboard.qorechain.io/faucet) in your browser and sign in.
2. Paste your `qor1...` address (or choose **Use my address** if the dashboard knows it).
3. Select **Request Tokens**. The card shows **Tokens Sent!** with 100 QOR, plus the fest test tokens, and a **View on Explorer** link.

The faucet pays once every 24 hours per account and per address. The exact amounts are on [Faucet](/dashboard/faucet). Back in the terminal, check that the account now exists on chain:

```bash
pnpm window status
```

The output now answers instead of failing with "does not exist on chain yet".

### Step 5: Register your key, open the window, deploy {#step-5}

1. Register your ML-DSA-87 key. This is a one-time step per account, signed with the classical key, as the chain requires for registering:

```bash
pnpm window register
```

It prints `registered: <HASH>`.

2. Open the authorisation window. This is itself a **hybrid-signed** transaction:

```bash
pnpm window open
```

It prints `opened: <HASH>`, then a line like `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)`. Write down the `opened:` hash: you verify it in step 6.

3. Wait about 10 seconds. The window advanced the account nonce and Hardhat waits for confirmations.
4. Build and deploy the contract:

```bash
pnpm build
pnpm deploy:testnet
```

Answer `y` to "Confirm deploy to network qorechainTestnet (9800)?". You should see `CounterModule#Counter - 0x...`.

### Step 6: Verify the hybrid signature on chain {#step-6}

The `opened:` transaction from step 5 was signed with both keys. Replace `<HASH>` with that hash and read it from the public REST endpoint:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Look for:

1. `tx_response.code` equal to `0`.
2. In the transaction body, the `PQCHybridSignature` extension holding the ML-DSA-87 signature: **4,627 bytes**, next to the 64-byte secp256k1 signature.
3. In `tx_response.events`, the event `pqc_hybrid_verify` with the attribute `status` set to `verified`. To print only that event (needs `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> \
  | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Then look at it in the explorer:

1. Open [explore.qore.network](https://explore.qore.network).
2. Switch the network selector to **Testnet**.
3. Search for the hash. The transaction page shows the signature security as quantum-safe, verified on chain, with the ML-DSA-87 algorithm (FIPS 204).

That is the proof: the validators checked both signatures.

## What you should see {#what-you-should-see}

| Where | What |
| --- | --- |
| After step 2 | `Done! Created qday-demo` and `2 passing` |
| After step 3 | `.env written`, then an `account:` line with your `0x...` and `qor1...` addresses |
| After step 4 | **Tokens Sent!** on the faucet and an existing account in `pnpm window status` |
| After step 5 | `registered: <HASH>`, `opened: <HASH>`, then `CounterModule#Counter - 0x...` |
| After step 6 | `code` 0, a 4,627-byte ML-DSA-87 signature and `pqc_hybrid_verify` with `status` `verified`, in the REST output and in the explorer on Testnet |

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
| "account has no PQC key and classical fallback is disabled" | The account has not registered an ML-DSA-87 key | Run `pnpm window register` first, then open the window |
| "does not exist on chain yet" | The account has no QOR yet | Get QOR from the faucet (step 4) |
| "Rate Limit Reached" on the faucet, or no tokens after 30 seconds | One claim per 24 hours per account and per address, and requests are served one at a time | Wait a few seconds and retry, or wait for the cooldown to end |
| `pnpm window` stops with a message about a missing recovery code | `.env` has `PRIVATE_KEY` without `QORE_PQC_RECOVERY_CODE` | Run step 3 again, or use `QORE_MNEMONIC` |
| Hardhat refuses to start | Node.js is older than 22 | Install Node.js 22 or later and run `pnpm install` again |

## The example apps {#example-apps}

The same flow, from several languages and front ends. Each one signs hybrid. All of them are in the public repository [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), folder `workshop-1`. Get it with:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

Each app page is a full start-to-finish guide of its own.

| App | Language | Page |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

The kits behind these apps are listed on [Kits](/build-before-qday/workshop-1/kits). To use the QoreX wallet with a browser dApp, see [QoreX](/qorex/overview).
