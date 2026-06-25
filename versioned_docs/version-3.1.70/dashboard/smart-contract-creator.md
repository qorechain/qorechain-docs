---
slug: /dashboard/smart-contract-creator
title: Smart Contract Creator
sidebar_label: Smart Contract Creator
sidebar_position: 6
---

# Smart Contract Creator

The **Smart Contract Creator** generates smart contracts from a plain-language description, powered by **QCAI**. Describe what you want, pick your target blockchain, and QCAI writes the contract for you. It supports **17 blockchains** for AI tooling, so you can target the ecosystem you are building for.

Connecting your wallet lets you save and manage the contracts you generate — see [Overview & Getting Started](/dashboard/overview#connect-your-wallet).

## Generate a contract

1. **Describe your contract.** In the prompt field, write what the contract should do — for example, a token with a fixed supply, an NFT collection, or a vesting schedule. The more specific you are, the better the result.
2. **Choose the blockchain.** Select your target from the supported blockchains. The contract language and category for your choice are shown alongside the selector.
3. **Pick a contract type** (optional). Choose a starting template such as a token, NFT, or governance contract to guide generation.
4. **Generate.** Select **Generate**. A progress indicator shows the status while QCAI produces the contract.

## Review the result

When generation finishes, the Dashboard shows the contract in a syntax-highlighted view along with details such as the contract name, blockchain, language, file size, and time generated. The prompt you used is shown with the result for reference.

From here you can:

- **Copy** the contract code to your clipboard.
- **Download** the contract as a file in the right format for your chosen blockchain.
- **Edit** the contract to refine it further.

## Share and reuse

Each generated contract has its own page you can open or share. If you open a contract you do not own, you can **fork** it to start your own copy and continue from there.

:::tip Always review and test
QCAI-generated code is a strong starting point, not a substitute for review. Read the contract, test it on [testnet](/getting-started/connecting-to-testnet), and run it through the [Contract Auditor](/dashboard/contract-auditor) before deploying anything of value.
:::

## Related

- [Contract Auditor](/dashboard/contract-auditor) — run a QCAI security analysis on a contract.
- [Developer Guide](/developer-guide/evm-development) — deploying contracts to QoreChain's runtimes.
