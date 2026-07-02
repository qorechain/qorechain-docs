---
slug: /getting-started/wallet-setup
title: Wallet Setup
sidebar_label: Wallet Setup
sidebar_position: 2
---

# Wallet Setup

QoreChain supports multiple wallet types across its native, EVM, and SVM execution environments. Choose the wallet that matches your use case.

:::note
The values below cover both the **`qorechain-vladi`** mainnet (EVM chain ID **9801**, live since 7 June 2026) and the **`qorechain-diana`** testnet (EVM chain ID **9800**). Public endpoints for both networks are listed in [Networks](/appendix/networks#public-endpoints).
:::

## Keplr Wallet

Keplr is the recommended wallet for native QoreChain transactions, staking, and governance.

### Add QoreChain as a Custom Chain

Open Keplr and navigate to **Settings > Add Custom Chain**, then enter:

| Field              | Mainnet                    | Testnet                          |
| ------------------ | -------------------------- | -------------------------------- |
| Chain Name         | `QoreChain`                | `QoreChain Diana Testnet`        |
| Chain ID           | `qorechain-vladi`          | `qorechain-diana`                |
| RPC URL            | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| REST URL           | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Bech32 Prefix      | `qor`                      | `qor`                            |
| Coin Denom         | `QOR`                      | `QOR`                            |
| Coin Minimal Denom | `uqor`                     | `uqor`                           |
| Decimals           | `6`                        | `6`                              |
| Coin Type (BIP-44) | `118`                      | `118`                            |

After adding the chain, Keplr generates a `qor1...` address for your account.

:::caution Gas price floor
The network minimum gas price is **0.1uqor**. If you configure Keplr's gas-price steps (e.g. via `suggestChain`), use values **at or above 0.1** (suggested low/average/high: `0.1 / 0.15 / 0.25`) — transactions signed below the floor are rejected.
:::

## MetaMask (EVM)

MetaMask enables interaction with QoreChain's EVM execution environment — deploy Solidity contracts, manage ERC-20 tokens, and use familiar Ethereum tooling.

### Add QoreChain as a Custom Network

Open MetaMask and navigate to **Settings > Networks > Add Network**, then enter:

| Field              | Mainnet                   | Testnet                          |
| ------------------ | ------------------------- | -------------------------------- |
| Network Name       | `QoreChain`               | `QoreChain Diana Testnet`        |
| RPC URL            | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| Chain ID           | `9801`                    | `9800`                           |
| Currency Symbol    | `QOR`                     | `QOR`                            |
| Block Explorer URL | `https://explore.qore.network` | `https://explore.qore.network` |

Native QOR has **18 decimals** on the EVM interface (wei-style). Once connected, you can use MetaMask to sign EVM transactions, interact with deployed smart contracts, and manage ERC-20 tokens on QoreChain.

### One-call network registration

For dApps, the **`@qorechain/wallet-adapter`** and **`@qorechain/connect`** packages (published to npm) register QoreChain with the user's wallet in one call — prompting MetaMask to add the network via EIP-3085 (with the correct **18-decimal** native QOR on the EVM rail) and configuring Keplr's gas-price step:

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## Solana Wallets (SVM)

QoreChain's SVM execution environment is compatible with standard Solana tooling, and the account's **native QOR balance is visible directly on the SVM interface** (in lamports, 9 decimals; 1 uqor = 1,000 lamports). Connect any Solana-compatible wallet or library.

### Using @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

The public SVM endpoints are **read-only**; transaction submission requires your own node. See [SVM Development](/developer-guide/svm-development) for details.

## PQC-Enabled Wallets (Required on the Cosmos Path)

QoreChain requires hybrid post-quantum cryptography (PQC) on the cosmos transaction path. As of the current chain version (**v3.1.82**), the network default is `hybrid_signature_mode = required` with `allow_classical_fallback = false` — so **every cosmos-path transaction must carry an ML-DSA-87 (Dilithium-5) signature alongside the standard secp256k1 (ECDSA) signature**. Classical-only cosmos transactions from a PQC account are rejected.

:::caution Cosmos txs require the hybrid PQC extension
Sending a plain classical transaction on the cosmos path will be rejected. You must attach the Dilithium-5 signature as a `PQCHybridSignature` transaction extension. Standard CosmJS / Keplr tooling does not produce this extension by itself — use the `qorechaind tx pqc cosign` CLI command, the QoreChain SDK's hybrid signing (see below), or, to build it yourself in code, the open-source [**qorechain-pqc**](/developer-guide/post-quantum-signing) library (`hybridSignBytes`). The only exemptions are genesis gentxs and PQC key registration/migration transactions.
:::

### How It Works

Wallets attach an ML-DSA-87 PQC signature as a transaction extension alongside the standard secp256k1 (ECDSA) signature. The classical signature is computed over sign bytes that exclude the extension, so it stays valid for classical verification while the PQC signature provides quantum resistance.

### Generate a Dilithium-5 Key

Generate a post-quantum key for hybrid signing:

```bash
qorechaind tx pqc gen-key
```

### Auto-Registration

When you include a PQC public key in your first transaction, QoreChain automatically registers it on-chain. No separate registration step is needed. (PQC key registration/migration transactions are themselves exempt from the hybrid requirement, so an account can bootstrap its first key.)

### Hybrid Signing with the SDK

The QoreChain SDK produces compliant cosmos transactions via `buildHybridTx` with `includePqcPublicKey: true`, which attaches the Dilithium-5 extension and embeds the public key for auto-registration. See [SDK Accounts & PQC signing](/sdk/concepts/accounts-pqc).

### PQC Modes

The three enforcement modes remain governance-controlled; the **current network default is Required**:

| Mode                   | Description                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | PQC verification is turned off. Standard signatures only.               |
| **Optional**           | Transactions may include PQC signatures. If present, they are verified. |
| **Required** (default) | All cosmos-path transactions must include a valid PQC signature.        |

The active mode is configured at the chain level and can be updated through governance.

:::note EVM / MetaMask unaffected
The MetaMask (EVM) flow above is **not** affected by the hybrid requirement. EVM transactions use a separate `eth_secp256k1` ante path and never need the PQC extension.
:::

## CLI Wallet

The `qorechaind` binary includes a built-in key management system for command-line usage.

### Create a New Key

```bash
qorechaind keys add mykey
```

This generates a new key pair and displays the mnemonic phrase. **Store the mnemonic securely** — it is the only way to recover this key.

### View Your Address

```bash
qorechaind keys show mykey -a
```

This outputs your `qor1...` bech32 address.

### List All Keys

```bash
qorechaind keys list
```

### Import an Existing Key

```bash
qorechaind keys add mykey --recover
```

You will be prompted to enter your mnemonic phrase.

## Next Steps

* [Your First Transaction](/getting-started/first-transaction) — Send QOR tokens using your new wallet
* [Connecting to Testnet](/getting-started/connecting-to-testnet) — Join the live Diana testnet
