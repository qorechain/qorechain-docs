---
slug: /dashboard/smart-contract-creator
title: Smart Contract Creator
sidebar_label: Smart Contract Creator
sidebar_position: 6
---

# Smart Contract Creator

The **Smart Contract Creator** generates smart contracts from a plain-language description, powered by **QCAI**. Describe what you want, pick your target blockchain, and QCAI writes the contract for you. It supports **17 blockchains** for AI tooling, so you can target the ecosystem you are building for.

You can try it **without an account**: a first-time visitor gets one free generation and sees the whole contract. A free account is what the next one needs, along with saving, auditing and deploying; the page offers **Create a free account** once your free try is used.

Sign in to save and manage the contracts you generate — see [Sign in](/dashboard/overview#sign-in).

## Generate a contract

1. **Start from an example, or describe your own.** The page opens with "What would you like to build?". Under **Or start from an example:** pick **Token**, **NFT collection**, **Locked vault** or **2-of-3 multisig** — each fills in a complete description and selects a matching blockchain and template — or write your own in **Contract Description**. The more specific you are, the better the result.
2. **Choose the blockchain.** Use **Target Blockchain**. The contract language and category for your choice are shown alongside the selector.
3. **Pick a contract type** (optional). **Contract Type** offers a starting template such as a token, NFT, or governance contract; leave it on **Custom (describe in prompt)** to rely on your description alone.
4. **Generate.** Select **Generate Smart Contract**. A progress indicator shows the status while QCAI produces the contract.

## Review the result

When generation finishes, the Dashboard shows the contract in a syntax-highlighted view along with details such as the contract name, blockchain, language, file size, and time generated. The prompt you used is shown with the result for reference.

From here you can:

- **Copy** the contract code to your clipboard (**Copy Code**).
- **Export PDF** of the contract.
- **Download** the contract as a file (**Download File**) in the right format for your chosen blockchain.
- **Edit** the contract (**Edit Contract**) to refine it further.

## Deploy your contract {#deploy}

### On mainnet (EVM) — non-custodial deploy {#deploy-mainnet}

Mainnet deployment is non-custodial: the Dashboard compiles your contract and returns **unsigned** deployment data — it never holds your keys and never signs on your behalf. You sign and broadcast the deployment in your own wallet, and the Dashboard then records the resulting contract.

1. Open the contract you want to deploy (an EVM-target contract) and select **Deploy** on **Mainnet**. If this is your first mainnet action, accept the [one-time risk acknowledgement](/dashboard/overview#risk-acknowledgement).
2. Connect **MetaMask** if it is not already connected — see [Overview & Getting Started](/dashboard/overview#connect-your-wallet). Since chain v3.2.0 the EVM lane also needs the account to hold a registered post-quantum key and an **open EVM authorisation window**, which is opened from QoreX (see [Sending with MetaMask](/dashboard/wallet#send-metamask)); without one the chain refuses the deployment.
3. The Dashboard compiles the contract and hands the unsigned deployment transaction to your wallet.
4. Review the transaction in MetaMask — network, gas, and data — then confirm to sign and broadcast it yourself.
5. Once the deployment is confirmed on-chain, the Dashboard records the resulting contract address alongside your saved contracts.

Only **EVM** (Solidity) contracts can be deployed from the Dashboard. CosmWasm and Solana-program deploys are not available on either network at the moment.

### On testnet — one click {#deploy-testnet}

On testnet the dashboard-managed test wallet signs and submits an EVM deployment for you in one click, so you can iterate quickly with [Faucet](/dashboard/faucet) tokens before going to mainnet. Testnet enforces the same EVM-lane rule as mainnet, so a deployment can still be refused if the account has no post-quantum key or no open EVM window.

## Share and reuse

Each generated contract has its own page. Contracts are **private by default**: only you can open yours. As the owner you will see a **Public** / **Private** button on the contract page; set it to **Public** to let anyone with the link open (and fork) the contract, and back to **Private** to withdraw it. If you open a public contract you do not own, you can **fork** it to start your own copy and continue from there.

:::tip Always review and test
QCAI-generated code is a strong starting point, not a substitute for review. Read the contract, test it on [testnet](/getting-started/connecting-to-testnet), and run it through the [Contract Auditor](/dashboard/contract-auditor) before deploying anything of value.
:::

## Related

- [Contract Auditor](/dashboard/contract-auditor) — run a QCAI security analysis on a contract.
- [Developer Guide](/developer-guide/evm-development) — deploying contracts to QoreChain's runtimes.
